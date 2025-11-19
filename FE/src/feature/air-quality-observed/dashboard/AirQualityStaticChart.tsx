import { useMemo } from "react";
import { Line } from "react-chartjs-2";
const METRIC_DETAILS = {
  pm25: { title: "Nồng độ PM2.5", unit: "µg/m³" },
  pm1: { title: "Nồng độ PM1", unit: "µg/m³" },
  o3: { title: "Nồng độ Ozone (O3)", unit: "ppb" },
  co2: { title: "Nồng độ CO2", unit: "ppm" },
} as const;
const getBaseChartOptions = (
  unit: string,
  timeUnit: "minute" | "hour" | "day"
) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: { size: 12, weight: "500" as const },
      },
    },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      type: "time" as const,
      time: {
        unit: timeUnit,
        tooltipFormat: TIME_FORMATS[timeUnit].tooltip,
        displayFormats: {
          minute: TIME_FORMATS.minute.display,
          hour: TIME_FORMATS.hour.display,
          day: TIME_FORMATS.day.display,
        },
      },
      title: {
        display: true,
        text: "Thời gian",
        font: { size: 13, weight: "600" as const },
        color: "#6B7280",
      },
      grid: { color: "rgba(0, 0, 0, 0.05)" },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: unit,
        font: { size: 13, weight: "600" as const },
        color: "#6B7280",
      },
      grid: { color: "rgba(0, 0, 0, 0.05)" },
    },
  },
  interaction: { mode: "index" as const, intersect: false },
});
const CHART_GRADIENTS = [
  "from-red-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-amber-500 to-orange-500",
  "from-green-500 to-emerald-500",
];

const TIME_FORMATS = {
  minute: { display: "HH:mm", tooltip: "HH:mm:ss" },
  hour: { display: "HH:mm", tooltip: "dd/MM HH:mm" },
  day: { display: "dd/MM", tooltip: "dd/MM/yyyy" },
} as const;

const AirQualityStaticChart = ({
  type,
  index,
  chartData,
  timeUnit,
}: {
  type: keyof typeof METRIC_DETAILS;
  index: number;
  chartData: any;
  timeUnit: "hour" | "day";
}) => {
  const details = METRIC_DETAILS[type];

  const chartOptions = useMemo(
    () => getBaseChartOptions(details.unit, timeUnit),
    [details.unit, timeUnit]
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className={`bg-linear-to-r ${CHART_GRADIENTS[index]} p-4`}>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
            {details.title}
          </span>
          <span className="text-sm font-normal opacity-90">
            ({details.unit})
          </span>
        </h3>
      </div>
      <div className="p-4 h-72">
        <div className="relative h-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
export default AirQualityStaticChart;
