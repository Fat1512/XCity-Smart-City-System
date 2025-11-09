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
import useCreateBuilding from "./useCreateBuilding";
import MapLocationEditor from "../../ui/MapLocationEditor";
export interface Building {
  id?: string;
  name?: string;
  description?: string;
  address?: Address;
  areaServed?: string;
  dateModified?: string;
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
  const { register, handleSubmit, watch, control, setValue } =
    useForm<Building>({
      defaultValues: buildingProps,
    });

  const [modalOpen, setModalOpen] = useState(false);
  const { isPending, updateBuilding } = useUpdateBuilding();
  const { isPending: isCreating, createBuilding } = useCreateBuilding();
  const building = watch();
  const handleOnChangeLocation = (coordinates: number[][]) => {
    console.log(coordinates);
    setValue("location.coordinates.0", coordinates);
  };
  console.log(building.location);
  const onSubmit = (data: Building) => {
    if (building.id) {
      updateBuilding(data, {
        onSuccess: () => toast.success("Cập nhật tòa nhà thành công"),
      });
      return;
    }
    createBuilding(data, {
      onSuccess: () => toast.success("Tạo tòa nhà mới thành công"),
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
          {isPending || isCreating ? <MiniSpinner /> : "Lưu thay đổi"}
        </button>
      </header>
      <fieldset disabled={isPending || isCreating} className="space-y-8">
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
              </div>
            </section>
            <section className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">
                Opening Hours
              </h3>

              <div className="space-y-2">
                {WEEK_DAYS.map((day) => (
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">
                Vị trí
              </h3>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
              >
                Thay đổi vị trí
              </button>
            </div>

            <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
              <MapLocation coordinates={building.location?.coordinates[0]} />
            </div>

            {modalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl w-[700px] max-w-full p-6 space-y-4 shadow-lg relative">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold text-gray-700">
                      Edit Location
                    </h4>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition text-xl font-bold"
                    >
                      ×
                    </button>
                  </div>

                  <div className="rounded-lg overflow-hidden border border-gray-200 shadow-inner h-[400px]">
                    <MapLocationEditor
                      onConfirm={handleOnChangeLocation}
                      coordinates={building.location?.coordinates[0]}
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
                      onClick={() => setModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                      onClick={() => {
                        setModalOpen(false);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </fieldset>
    </form>
  );
}
