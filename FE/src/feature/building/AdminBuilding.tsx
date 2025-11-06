import CreatableSelect from "react-select/creatable";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { IoBusiness, IoCalendar } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import MapLocation from "../../ui/MapLocation";
import { BUILDING_TYPES, WEEK_DAYS } from "../../utils/appConstant";
import { useState } from "react";
import useUpdateBuilding from "./useUpdateBuilding";
import { toast } from "react-toastify";
import MiniSpinner from "../../ui/MiniSpinner";
export interface Building {
  id?: string;
  name?: string;
  description?: string;
  address?: Address;
  areaServed?: string;
  category?: string[];
  dataProvider?: string;
  dateCreated?: string;
  floorsAboveGround?: number;
  floorsBelowGround?: number;
  collapseRisk?: number;
  peopleCapacity?: number;
  peopleOccupancy?: number;
  owner?: string[];
  occupier?: string[];
  openingHours?: string[];
  location?: Location;
}
interface Location {
  coordinates: [][];
  type: string;
}
export interface Address {
  addressCountry?: string;
  addressLocality?: string;
  addressRegion?: string;
  streetAddress?: string;
  streetNr?: string;
  postOfficeBoxNumber?: string;
  postalCode?: string;
  district?: string;
}
interface AdminBuildingProps {
  buildingProps?: Building;
}

export default function AdminBuilding({
  buildingProps = {},
}: AdminBuildingProps) {
  const [showCoords, setShowCoords] = useState(false);
  const { register, handleSubmit, watch, control } = useForm<Building>({
    defaultValues: buildingProps,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "location.coordinates.0",
  });
  const { isPending, updateBuilding } = useUpdateBuilding();
  const building = watch();

  const onSubmit = (data: Building) => {
    updateBuilding(data, {
      onSuccess: () => toast.success("Cập nhật tòa nhà thành công"),
    });
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
          className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg shadow transition-all duration-300"
        >
          <FaSave className="text-lg" />
          {isPending ? <MiniSpinner /> : "Lưu thay đổi"}
        </button>
      </header>
      <fieldset disabled={isPending} className="space-y-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-5 space-y-6">
            <section className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">
                General Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 space-x-5">
                  <div>
                    <label className="block text-gray-500">
                      Address Locality
                    </label>
                    <input
                      {...register("address.addressLocality")}
                      className="w-full border border-gray-200 rounded px-2 py-1 "
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500">District</label>
                    <input
                      {...register("address.district")}
                      className="w-full border border-gray-200 rounded px-2 py-1 "
                    />
                  </div>
                </div>
                <div className="grid ">
                  <div>
                    <label className="block text-gray-500">
                      Address Region
                    </label>
                    <input
                      {...register("address.addressRegion")}
                      className="w-full border border-gray-200 rounded px-2 py-1 "
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 space-x-5">
                  <div>
                    <label className="block text-gray-500">
                      Street Address
                    </label>
                    <input
                      {...register("address.streetAddress")}
                      className="w-full border border-gray-200 rounded px-2 py-1 "
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500">Street Nr</label>
                    <input
                      {...register("address.streetNr")}
                      className="w-full border border-gray-200 rounded px-2 py-1 "
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 space-x-5">
                  <div>
                    <label className="block text-gray-500">
                      Post Office Box Number
                    </label>
                    <input
                      {...register("address.postOfficeBoxNumber")}
                      className="w-full border border-gray-200 rounded px-2 py-1 "
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500">Postal Code</label>
                    <input
                      {...register("address.postalCode")}
                      className="w-full border border-gray-200 rounded px-2 py-1 "
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-500">Area Served</label>
                  <input
                    {...register("areaServed")}
                    className="w-full border border-gray-200 rounded px-2 py-1 "
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Category</label>

                  <Controller
                    name="category"
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <CreatableSelect
                        isMulti
                        options={BUILDING_TYPES}
                        className="text-sm"
                        placeholder="Select or type to create..."
                        isClearable
                        value={field.value?.map((v: string) => {
                          return (
                            BUILDING_TYPES.find((opt) => opt.value === v) || {
                              label: v,
                              value: v,
                            }
                          );
                        })}
                        onChange={(options) => {
                          field.onChange(options?.map((o) => o.value) ?? []);
                        }}
                      />
                    )}
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
                Opening Hours
              </h3>

              <div className="space-y-2">
                {WEEK_DAYS.map((day, index) => (
                  <div
                    key={day}
                    className="grid grid-cols-3 items-center gap-3"
                  >
                    <label className="capitalize text-gray-500 w-20">
                      {day}
                    </label>

                    <input
                      type="time"
                      {...register(`openingHours.${day}.opens`)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 "
                      placeholder="Open"
                    />

                    <input
                      type="time"
                      {...register(`openingHours.${day}.closes`)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 "
                      placeholder="Close"
                    />
                  </div>
                ))}
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
            <MapLocation coordinates={building.location?.coordinates[0]} />
            <section className="bg-white p-5 rounded-lg shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">
                  Coordinates
                </h3>

                <button
                  type="button"
                  onClick={() => setShowCoords(!showCoords)}
                  className="text-blue-600 text-sm underline"
                >
                  {showCoords ? "Hide" : "Show"}
                </button>
              </div>

              {showCoords && (
                <>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-3 gap-3 items-center"
                    >
                      <input
                        type="number"
                        step="any"
                        {...register(`location.coordinates.0.${index}.0`, {
                          valueAsNumber: true,
                        })}
                        className="border border-gray-200 rounded px-2 py-1"
                        placeholder="Longitude"
                      />

                      <input
                        type="number"
                        step="any"
                        {...register(`location.coordinates.0.${index}.1`, {
                          valueAsNumber: true,
                        })}
                        className="border border-gray-200 rounded px-2 py-1"
                        placeholder="Latitude"
                      />

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => append([0, 0])}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                  >
                    + Add Coordinate
                  </button>
                </>
              )}
            </section>
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
      </fieldset>
    </form>
  );
}
