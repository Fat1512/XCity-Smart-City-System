import { MapPin, Info, Users, Activity, Edit } from "lucide-react";
import type { CameraCreate } from "./CameraAdmin";
import { useNavigate } from "react-router-dom";

interface CameraCardProps {
  camera: CameraCreate;
}

const CameraItem: React.FC<CameraCardProps> = ({ camera }) => {
  const {
    id,
    cameraName,
    description,
    cameraUsage,
    on,
    dataProvider,
    location,
    address,
  } = camera;
  const navigate = useNavigate();

  return (
    <div className="max-w-md p-5 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{cameraName}</h2>
          <span
            className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              on ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {on ? "On" : "Off"}
          </span>
        </div>
        <button
          onClick={() => navigate(`/admin/camera/${id}`)}
          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors duration-200 hover:scale-105 transform"
          aria-label="Edit camera"
        >
          <Edit size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {description && (
          <p className="text-gray-600 flex items-center gap-2">
            <Info size={16} /> {description}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
          {cameraUsage && (
            <p className="flex items-center gap-1">
              <Activity size={14} /> <span className="font-medium">Usage:</span>{" "}
              {cameraUsage}
            </p>
          )}

          {dataProvider && (
            <p className="flex items-center gap-1">
              <Users size={14} /> <span className="font-medium">Provider:</span>{" "}
              {dataProvider}
            </p>
          )}

          {address?.streetAddress && (
            <p className="flex items-center gap-1 col-span-full">
              <MapPin size={14} />{" "}
              {[
                address.streetAddress,
                address.district,
                address.addressLocality,
                address.addressRegion,
                address.addressCountry,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}

          {location?.coordinates && (
            <p className="flex items-center gap-1 col-span-full">
              <MapPin size={14} /> Coordinates:{" "}
              {location.coordinates[1].toFixed(6)},{" "}
              {location.coordinates[0].toFixed(6)} ({location.type})
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100"></div>
    </div>
  );
};

export default CameraItem;
