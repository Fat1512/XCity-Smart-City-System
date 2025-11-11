import { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const AirQualityRealtime = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Tạo SockJS client
    const socket = new SockJS("http://localhost:8080/xcity-service/api/v1/ws");
    const client = new Client({
      webSocketFactory: () => socket, // bắt buộc với SockJS
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log("[STOMP DEBUG]", str),
      onConnect: () => {
        console.log("✅ Connected to WebSocket via SockJS");
        setConnected(true);

        // Subscribe topic
        client.subscribe("/topic/air-quality", (message: any) => {
          if (!message.body) return;
          try {
            const data = JSON.parse(message.body);
            setMessages((prev) => [data, ...prev]);
          } catch (err) {
            console.error(
              "❌ Failed to parse message body:",
              err,
              message.body
            );
          }
        });
      },
      onStompError: (frame) => {
        console.error(
          "❌ STOMP broker error:",
          frame.headers["message"],
          frame.body
        );
      },
      onWebSocketError: (evt) => {
        console.error("❌ WebSocket error event:", evt);
      },
      onWebSocketClose: (evt) => {
        console.warn("⚠️ WebSocket closed:", evt);
        setConnected(false);
      },
      onDisconnect: () => {
        console.log("⚠️ STOMP client disconnected");
        setConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, []);

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>Realtime Air Quality Data</h2>
      {!connected && <p>Connecting...</p>}
      {messages.length === 0 && connected && <p>No data yet...</p>}
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>
            <strong>Sensor:</strong> {msg.sensorId}, <strong>PM2.5:</strong>{" "}
            {msg.pm25}, <strong>PM1:</strong> {msg.pm1}, <strong>CO2:</strong>{" "}
            {msg.co2}, <strong>O3:</strong> {msg.o3}, <strong>Temp:</strong>{" "}
            {msg.temperature}, <strong>Time:</strong> {msg.dateObserved}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AirQualityRealtime;
