import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export interface SensorValues {
  id: string;
  name: string;
  pm25: number | null;
  pm1: number | null;
  co2: number | null;
  o3: number | null;
  temperature?: number | null;
  dateObserved: number;
}

export type DataPoints = Record<string, SensorValues[]>;

interface AirQualityContextType {
  dataPoints: DataPoints;
  connected: boolean;
  active: boolean;
  stompClient: Client | null;
}

const AirQualityContext = createContext<AirQualityContextType | undefined>(
  undefined
);

interface AirQualityProviderProps {
  children: ReactNode;
  wsUrl?: string;
  maxDataPoints?: number;
  inactiveTimeout?: number;
}

export const AirQualityProvider = ({
  children,
  wsUrl = "http://localhost:8080/xcity-service/api/v1/ws",
  maxDataPoints = 5,
  inactiveTimeout = 10000,
}: AirQualityProviderProps) => {
  const [dataPoints, setDataPoints] = useState<DataPoints>({});
  const [connected, setConnected] = useState(false);
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  const resetTimer = () => {
    setActive(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActive(false);
      setDataPoints({});
    }, inactiveTimeout);
  };

  useEffect(() => {
    const socket = new SockJS(wsUrl);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe("/topic/air-quality", (msg) => {
          if (!msg.body) return;
          const json = JSON.parse(msg.body);
          const sensorId = json.refDevice;

          const timestamp = Date.now();
          const values: SensorValues = {
            id: sensorId,
            name: json.deviceName,
            pm25: json.pm25,
            pm1: json.pm1,
            co2: json.co2,
            o3: json.o3,
            temperature: json.temperature,
            dateObserved: timestamp,
          };

          setDataPoints((prev) => {
            const updated: DataPoints = { ...prev };
            if (!updated[sensorId]) updated[sensorId] = [];
            updated[sensorId].push(values);
            if (updated[sensorId].length > maxDataPoints)
              updated[sensorId].shift();
            return updated;
          });

          resetTimer();
        });
      },
      onWebSocketClose: () => {
        setConnected(false);
        setActive(false);
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [wsUrl, maxDataPoints, inactiveTimeout]);

  const value: AirQualityContextType = {
    dataPoints,
    connected,
    active,
    stompClient: stompClientRef.current,
  };

  return (
    <AirQualityContext.Provider value={value}>
      {children}
    </AirQualityContext.Provider>
  );
};

export const useAirQuality = () => {
  const context = useContext(AirQualityContext);
  if (context === undefined) {
    throw new Error("useAirQuality must be used within an AirQualityProvider");
  }
  return context;
};
