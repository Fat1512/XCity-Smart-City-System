import RealtimeChart from "./RealtimeChart";

interface SensorValues {
  pm25: number;
  pm1: number;
  co2: number;
  o3: number;
  temperature?: number;
  dateObserved: number;
}

interface Props {
  type: "pm25" | "pm1" | "co2" | "o3";
  dataPoints: Record<string, SensorValues[]>;
}

const AirQualityTypeDashboard = ({ type, dataPoints }: Props) => {
  const sensorIds = Object.keys(dataPoints);

  const chartDataPoints = sensorIds.flatMap((sensorId) =>
    (dataPoints[sensorId] || []).map((d) => ({
      x: d.dateObserved,
      y: d[type],
      sensorId,
    }))
  );

  return (
    <div className="mb-6 p-4 border rounded-xl shadow-md bg-gray-50">
      <h2 className="text-xl font-bold mb-4">{type.toUpperCase()}</h2>

      {sensorIds.map((sensorId) => {
        const sensorData = dataPoints[sensorId];
        if (!sensorData || sensorData.length === 0) return null;
        const latest = sensorData[sensorData.length - 1];
        return (
          <p key={sensorId} className="mb-1">
            {sensorId} (Latest: {latest[type]})
          </p>
        );
      })}

      <RealtimeChart dataPoints={chartDataPoints} />
    </div>
  );
};

export default AirQualityTypeDashboard;
