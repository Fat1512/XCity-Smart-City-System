import React from "react";
import { useForm } from "react-hook-form";
import { IoBusiness, IoCalendar } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import MapLocation from "../../ui/MapLocation";

type Building = {
  name?: string;
  description?: string;
  address?: string;
  areaServed?: string;
  category?: string[];
  dataProvider?: string;
  source?: string;
  floorsAboveGround?: number;
  floorsBelowGround?: number;
  collapseRisk?: number;
  peopleCapacity?: number;
  peopleOccupancy?: number;
  owner?: string[];
  occupier?: string[];
  openingHours?: string[];
  location?: { lat: number; lon: number };
  mapUrl?: string;
};

interface AdminBuildingProps {
  buildingProps?: Building;
}

export default function AdminBuilding({
  buildingProps = {},
}: AdminBuildingProps) {
  const { register, handleSubmit, watch, setValue } = useForm<Building>({
    defaultValues: buildingProps,
  });

  const building = watch();
  console.log(building);
  const onSubmit = (data: Building) => {
    console.log("💾 Saved building:", data);
    alert("Building information saved successfully!");
  };

  const handleMapChange = (lat: number, lon: number) => {
    setValue("location.lat", lat);
    setValue("location.lon", lon);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-gray-50 p-8 space-y-8 min-h-screen"
    >
      <header className="flex flex-wrap items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 min-w-[250px]">
          <div className="flex items-center gap-2 mb-2">
            <IoBusiness className="text-green-600 text-2xl" />
            <input
              {...register("name")}
              className="bg-transparent text-2xl font-semibold text-gray-800 border-b-2 border-transparent focus:border-green-500 focus:outline-none transition-all duration-300"
              placeholder="Building name..."
            />
          </div>

          <textarea
            {...register("description")}
            className="w-full bg-transparent text-gray-600 text-sm border-b-2 border-transparent focus:border-green-500 focus:outline-none resize-none transition-all duration-300"
            placeholder="Description..."
            rows={2}
          />
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg shadow transition-all duration-300"
        >
          <FaSave className="text-lg" />
          Save Changes
        </button>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 space-y-6">
          <section className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">
              General Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-gray-500">Address</label>
                <input
                  {...register("address")}
                  className="w-full border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-gray-500">Area Served</label>
                <input
                  {...register("areaServed")}
                  className="w-full border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-gray-500">Category</label>
                <input
                  {...register("category")}
                  className="w-full border border-gray-200 rounded px-2 py-1"
                  placeholder="Separate by comma"
                />
              </div>
              <div>
                <label className="block text-gray-500">Data Provider</label>
                <input
                  {...register("dataProvider")}
                  className="w-full border border-gray-200 rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-gray-500">Source</label>
                <input
                  {...register("source")}
                  className="w-full border border-gray-200 rounded px-2 py-1"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">
              Structural Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-gray-500">Floors Above</label>
                <input
                  type="number"
                  {...register("floorsAboveGround", { valueAsNumber: true })}
                  className="w-full border border-gray-200 rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-gray-500">Floors Below</label>
                <input
                  type="number"
                  {...register("floorsBelowGround", { valueAsNumber: true })}
                  className="w-full border border-gray-200 rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-gray-500">Collapse Risk</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("collapseRisk", { valueAsNumber: true })}
                  className="w-full border border-gray-200 rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-gray-500">Capacity</label>
                <input
                  type="number"
                  {...register("peopleCapacity", { valueAsNumber: true })}
                  className="w-full border border-gray-200 rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-gray-500">Occupancy</label>
                <input
                  type="number"
                  {...register("peopleOccupancy", { valueAsNumber: true })}
                  className="w-full border border-gray-200 rounded px-2 py-1"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-7 space-y-6">
          <MapLocation
            lat={building.location?.lat}
            lng={building.location?.lon}
          />

          <section className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase mb-4">
              <IoCalendar /> Recent Activity
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="p-2 bg-gray-50 rounded">
                01/10/2025 — Occupancy updated
              </li>
              <li className="p-2 bg-gray-50 rounded">
                29/09/2025 — Maintenance completed
              </li>
              <li className="p-2 bg-gray-50 rounded">
                25/09/2025 — New floor sensors added
              </li>
            </ul>
          </section>
        </div>
      </div>
    </form>
  );
}
