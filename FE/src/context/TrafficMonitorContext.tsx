import { createContext, useContext, useEffect, useRef, useState } from "react";
import { CAMERA_AI_URL } from "../utils/Url";

interface TrafficMonitorContextType {
  ws: WebSocket | null;
  connected: boolean;
  send: (data: any) => void;
}

const TrafficMonitorContext = createContext<TrafficMonitorContextType | null>(
  null
);

interface Props {
  children: React.ReactNode;
}

export function TrafficMonitorContextProvider({ children }: Props) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef<number>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      console.log("Attempting to connect to WebSocket...");
      const ws = new WebSocket(CAMERA_AI_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = (event) => {
        console.log("❌ WebSocket closed:", event.code, event.reason);
        setConnected(false);

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          console.log(
            `🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error("❌ Max reconnection attempts reached");
        }
      };

      ws.onerror = (err) => {
        console.error("⚠️ WebSocket error:", err);
        console.error("URL:", CAMERA_AI_URL);
        console.error("ReadyState:", ws.readyState);
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const send = (data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn(
        "Cannot send: WebSocket is not open. State:",
        wsRef.current?.readyState
      );
    }
  };

  return (
    <TrafficMonitorContext.Provider
      value={{
        ws: wsRef.current,
        connected,
        send,
      }}
    >
      {children}
    </TrafficMonitorContext.Provider>
  );
}

export const useTrafficMonitorContext = () => {
  const context = useContext(TrafficMonitorContext);
  if (context === null) {
    throw new Error(
      "useTrafficMonitorContext must be used within an TrafficMonitorContextProvider"
    );
  }
  return context;
};
