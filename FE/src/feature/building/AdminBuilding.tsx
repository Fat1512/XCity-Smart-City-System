// -----------------------------------------------------------------------------
// Copyright 2025 Fenwick Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// -----------------------------------------------------------------------------
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { IoBusiness } from "react-icons/io5";
import { FaMapMarkerAlt, FaSave } from "react-icons/fa";

import useUpdateBuilding from "./useUpdateBuilding";
import useCreateBuilding from "./useCreateBuilding";
import { toast } from "react-toastify";

import MapViewLocation from "../../ui/MapViewLocation";
import MapModal from "../../ui/MapModal";
import MiniSpinner from "../../ui/MiniSpinner";
import ErrorMessage from "../../ui/ErrorMessage";
import { BUILDING_TYPES } from "../../utils/appConstant";
import CreatableSelect from "react-select/creatable";
import type { Address } from "../air-quality-observed/AirQualityAdmin";
import { formatTime } from "../../utils/helper";

export interface Location {
  coordinates: [number, number];
  type?: string;
}

export interface Building {
  id?: string;
  name?: string;
  description?: string;
  address?: Address;
  dataProvider?: string;
  category?: string[];
  location?: Location;
  dateCreated?: string;
  dateUpdated?: string;
}

interface AdminBuildingProps {
  buildingProps?: Building;
}

export default function AdminBuilding({
  buildingProps = {},
}: AdminBuildingProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<Building>({
    defaultValues: buildingProps,
  });

  const building = watch();

  const { isPending, updateBuilding } = useUpdateBuilding();
  const { isPending: isCreating, createBuilding } = useCreateBuilding();

  const onSubmit = (data: Building) => {
    if (building.id) {
      updateBuilding(data, {
        onSuccess: () => toast.success("Cập nhật tòa nhà thành công"),
      });
    } else {
      createBuilding(data, {
        onSuccess: () => toast.success("Tạo tòa nhà mới thành công"),
      });
    }
  };

  const handleOnChangeLocation = (coordinates: [number, number]) => {
    setValue("location.coordinates", coordinates);
  };

  return (
    <div className="bg-gray-50 p-8 min-h-screen space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-3">
        {building.id && (
          <div className="flex items-center gap-2 text-lg">
            <span className="font-bold w-24">ID:</span>
            <span className="font-mono font-semibold">{building.id}</span>
          </div>
        )}

        {building.dateCreated && (
          <div className="flex items-center gap-2 text-lg">
            <span className="font-bold w-24">Ngày tạo:</span>
            <span>{formatTime(building.dateCreated)}</span>
          </div>
        )}

        {building.dateUpdated && (
          <div className="flex items-center gap-2 text-lg">
            <span className="font-bold w-24">Ngày sửa:</span>
            <span>{formatTime(building.dateUpdated)}</span>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-6 rounded-xl shadow-md border border-gray-200 gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="flex items-center gap-3 mb-1">
              <IoBusiness className="text-green-600 text-3xl" />
              <input
                {...register("name", { required: "Tên tòa nhà bắt buộc" })}
                className="bg-transparent text-2xl font-bold text-gray-800 border-b-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors duration-300 w-full"
                placeholder="Tên tòa nhà..."
              />
            </div>
            {errors.name && <ErrorMessage message={errors.name.message} />}

            <textarea
              {...register("description")}
              className="w-full bg-transparent text-gray-600 text-sm border-b-2 border-transparent focus:border-green-500 focus:outline-none resize-none transition-all duration-300 mt-3"
              placeholder="Mô tả tòa nhà..."
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md transition-all duration-300"
          >
            <FaSave className="text-lg" />
            {isPending || isCreating ? <MiniSpinner /> : "Lưu thay đổi"}
          </button>
        </header>

        <fieldset disabled={isPending || isCreating} className="space-y-8">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-5 p-6 bg-white rounded-xl shadow-md border border-gray-200 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Thành phố
                  </label>
                  <input
                    {...register("address.addressRegion", {
                      required: "Thành phố bắt buộc",
                    })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                    placeholder="TP. HCM"
                  />
                  {errors.address?.addressRegion && (
                    <ErrorMessage
                      message={errors.address.addressRegion.message}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Phường/xã
                  </label>
                  <input
                    {...register("address.addressLocality", {
                      required: "Phường/xã bắt buộc",
                    })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                    placeholder="Quận 1"
                  />
                  {errors.address?.addressLocality && (
                    <ErrorMessage
                      message={errors.address.addressLocality.message}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Tên đường
                </label>
                <input
                  {...register("address.streetAddress", {
                    required: "Tên đường bắt buộc",
                  })}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                  placeholder="Lê Lợi"
                />
                {errors.address?.streetAddress && (
                  <ErrorMessage
                    message={errors.address.streetAddress.message}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Nhà cung cấp
                </label>
                <input
                  {...register("dataProvider", {
                    required: "Nhà cung cấp bắt buộc",
                  })}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all"
                  placeholder="Nhập tên nhà cung cấp"
                />
                {errors.dataProvider && (
                  <ErrorMessage message={errors.dataProvider.message} />
                )}
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Loại hạ t</label>

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
            </div>

            <div className="col-span-12 lg:col-span-7">
              <div className="rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-linear-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-white text-xl" />
                    <h3 className="text-white font-bold text-lg">
                      Vị trí thiết bị
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300"
                  >
                    <FaMapMarkerAlt />
                    <span>Thay đổi</span>
                  </button>
                </div>

                <div className="overflow-hidden">
                  <MapViewLocation
                    coordinates={building.location?.coordinates}
                  />
                </div>

                {building.location?.coordinates && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      📍 Tọa độ: {building.location.coordinates[1].toFixed(6)},{" "}
                      {building.location.coordinates[0].toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <MapModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onChange={handleOnChangeLocation}
            location={building.location?.coordinates}
          />
        </fieldset>
      </form>
    </div>
  );
}
