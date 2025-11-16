import {
  Calendar,
  ChevronRight,
  Info,
  MapPin,
  Settings,
  User,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";
import type { Address } from "./AirQualityAdmin";
import { useNavigate } from "react-router-dom";
export interface Device {
  id: string;
  name: string;
  description: string;
  address: Address;
  dateModified: number[];
  dataProvider: string;
  dateCreated: string;
  controlledAsset: string[];
  controlledProperty?: string[];
  category: string[];
  provider: string;
  owner?: string[];
  location: Location;
  deviceState?: "ACTIVE" | "INACTIVE";
}

interface AirQualityItemProps {
  device: Device;
}
const AirQualityItem = ({ device }: AirQualityItemProps) => {
  const navigate = useNavigate();
  const getCategoryColor = (cat: string) => {
    const colors = {
      sensor: "bg-blue-100 text-blue-700 border-blue-200",
      actuator: "bg-green-100 text-green-700 border-green-200",
      meter: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[cat] || "bg-gray-100 text-gray-700 border-gray-200";
  };
  const formatAddressLine = (address: Address) => {
    const parts = [];

    if (address.streetAddress) {
      const street = address.streetNr
        ? `${address.streetAddress}, Số ${address.streetNr}`
        : address.streetAddress;
      parts.push(street);
    }

    if (address.district) parts.push(address.district);
    if (address.addressLocality) parts.push(address.addressLocality);
    if (address.addressRegion) parts.push(address.addressRegion);

    return parts.join(" - ");
  };
  const getStatusStyle = (status: string) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-700 border-green-200",
      INACTIVE: "bg-red-100 text-red-700 border-red-200",
      error: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status: string) => {
    if (status === "ACTIVE") return <Wifi className="w-3 h-3" />;
    if (status === "INACTIVE") return <WifiOff className="w-3 h-3" />;
    if (status === "error") return <AlertTriangle className="w-3 h-3" />;
    return <AlertTriangle className="w-3 h-3" />;
  };
  const formatNgsiDate = (arr: number[]) => {
    if (!Array.isArray(arr) || arr.length < 7) return "N/A";

    const [year, month, day, hour, minute, second, nano] = arr;

    const ms = Math.floor(nano / 1_000_000);

    const date = new Date(
      Date.UTC(year, month - 1, day, hour, minute, second, ms)
    );

    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{device.name}</h3>
            <p className="text-blue-100 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-blue-100 truncate">
                {formatAddressLine(device.address)}
              </span>
            </p>
          </div>
          <Settings className="w-6 h-6 text-white opacity-80 group-hover:rotate-90 transition-transform duration-300" />
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold border rounded-full ${getStatusStyle(
              device.deviceState || "offline"
            )}`}
          >
            {getStatusIcon(device.deviceState || "offline")}
            {device.deviceState || "offline"}
          </span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          {device.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {device.category.map((cat, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                cat
              )}`}
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Controlled Properties
          </h4>
          <div className="flex flex-wrap gap-2">
            {device.controlledProperty?.map((prop, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-white rounded text-xs text-gray-700 border border-gray-200"
              >
                {prop}
              </span>
            ))}
          </div>
        </div>

        {device.controlledAsset?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Controlled Assets
            </h4>
            <div className="space-y-1">
              {device.controlledAsset.map((asset, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                  {asset}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <User className="w-3 h-3" />
              <span className="font-medium">Provider</span>
            </div>
            <p className="text-gray-700">{device.provider}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <Calendar className="w-3 h-3" />
              <span className="font-medium">Last Modified</span>
            </div>
            <p className="text-gray-700">
              {formatNgsiDate(device.dateModified)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">Owners:</span>
          <div className="flex flex-wrap gap-1">
            {device.owner?.map((owner, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded"
              >
                {owner}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          className="w-full cursor-pointer bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
           text-white py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
          onClick={() => navigate(`/admin/device/${device.id}`)}
        >
          <Info className="w-4 h-4" />
          Xem chi tiết
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default AirQualityItem;
