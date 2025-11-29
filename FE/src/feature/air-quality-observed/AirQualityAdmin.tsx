import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FaSave,
  FaMapMarkerAlt,
  FaBuilding,
  FaInfoCircle,
  FaPlay,
  FaStop,
} from "react-icons/fa";
import { IoBusiness } from "react-icons/io5";
import { MdDevices, MdMonitor } from "react-icons/md";
import MapModal from "../../ui/MapModal";
import MapViewLocation from "../../ui/MapViewLocation";
import {
  CONTROLLED_PROPERTIES,
  DEVICE_CATEGORIES,
} from "../../utils/appConstant";
import CreatableSelect from "react-select/creatable";
import useCreateDevice from "./useCreateDevice";
import MiniSpinner from "../../ui/MiniSpinner";
import ErrorMessage from "../../ui/ErrorMessage";
import { toast } from "react-toastify";
import useTriggerSensor from "./useTriggerSensor";
import useUpdateDevice from "./useUpdateDevice";

export interface Address {
  addressLocality?: string;
  district?: string;
  addressRegion?: string;
  streetAddress?: string;
  streetNr?: string;
}

export interface Location {
  coordinates?: number[];
  type?: string;
}

export interface DeviceCreated {
  id?: string;
  name?: string;
  description?: string;
  address?: Address;
  dateModified?: string;
  dataProvider?: string;
  dateCreated?: string;
  controlledProperty?: string[];
  category?: string[];
  provider?: string;
  owner?: string[];
  location?: Location;
  deviceState?: "ACTIVE" | "INACTIVE";
  type?: "Device";
}

interface DeviceProps {
  deviceProps?: DeviceCreated;
}

const AirQualityAdmin = ({ deviceProps = {} }: DeviceProps) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<DeviceCreated>({
    defaultValues: deviceProps,
  });

  const { isPending, createDevice } = useCreateDevice();
  const { isPending: isUpdating, updateDevice } = useUpdateDevice();
  const { triggerSensor } = useTriggerSensor();
  const [modalOpen, setModalOpen] = useState(false);

  const device = watch();
  const deviceStatus = watch("deviceState") || "inactive";

  function handleOnChangeLocation(coords: []) {
    setValue("location.coordinates", coords, { shouldValidate: true });
  }

  const handleStartDevice = () => {
    if (!device.id) return;

    triggerSensor(
      { id: device.id, deviceState: "ACTIVE" },
      {
        onSuccess: () => {
          toast.success("Thiết bị đã được kích hoạt");
          setValue("deviceState", "ACTIVE");
        },
      }
    );
  };

  const handleStopDevice = () => {
    if (!device.id) return;

    triggerSensor(
      { id: device.id, deviceState: "INACTIVE" },
      {
        onSuccess: () => {
          toast.success("Thiết bị đã dừng hoạt động");
          setValue("deviceState", "INACTIVE");
        },
      }
    );
  };

  const onSubmit = (data: DeviceCreated) => {
    if (!data.location?.coordinates) {
      alert("Vui lòng chọn vị trí thiết bị");
      return;
    }

    const request: DeviceCreated = {
      ...data,
      location: { type: "Point", coordinates: data.location.coordinates },
    };

    if (!device.id) {
      createDevice(request, {
        onSuccess: () => toast.success("Tạo thiết bị mới thành công"),
        onError: (err) => toast.error(err.message),
      });
      return;
    }

    updateDevice(request, {
      onSuccess: () => toast.success("Cập thiết bị mới thành công"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="p-6 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
          <div className="bg-linear-to-r from-indigo-600 to-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <IoBusiness className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-white text-2xl font-bold">
                    Quản lý thiết bị
                  </h1>
                  <p className="text-indigo-100 text-sm">
                    Cấu hình và theo dõi thiết bị IoT
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {device.id && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        deviceStatus === "ACTIVE"
                          ? "bg-green-400 animate-pulse"
                          : "bg-gray-400"
                      }`}
                    />
                    <span className="text-white text-sm font-medium">
                      {deviceStatus === "ACTIVE" ? "Hoạt động" : "Dừng"}
                    </span>
                  </div>
                )}

                {device.id &&
                  (deviceStatus === "INACTIVE" ? (
                    <button
                      onClick={handleStartDevice}
                      className="flex cursor-pointer items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <FaPlay className="text-sm" />
                      <span>Start</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopDevice}
                      className="flex cursor-pointer items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <FaStop className="text-sm" />
                      <span>Stop</span>
                    </button>
                  ))}

                <button
                  onClick={handleSubmit(onSubmit)}
                  className="flex cursor-pointer items-center gap-2 bg-white hover:bg-indigo-50 text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isPending || isUpdating ? (
                    <MiniSpinner />
                  ) : (
                    <>
                      <FaSave className="text-lg" />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Tên thiết bị
              </label>
              <input
                {...register("name", { required: "Tên thiết bị bắt buộc" })}
                className="w-full bg-gray-50 text-gray-900 text-lg font-semibold border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300"
                placeholder="Nhập tên thiết bị..."
              />
              {errors.name && <ErrorMessage message={errors.name.message} />}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Mô tả
              </label>
              <textarea
                {...register("description", {
                  required: "Mô tả bắt buộc",
                })}
                className="w-full bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none resize-none transition-all duration-300"
                placeholder="Mô tả chi tiết về thiết bị..."
                rows={3}
              />
              {errors.description && (
                <ErrorMessage message={errors.description.message} />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            {/* General Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-linear-to-r from-emerald-500 to-teal-500 px-6 py-4">
                <div className="flex items-center gap-2">
                  <FaInfoCircle className="text-white text-xl" />
                  <h3 className="text-white font-bold text-lg">
                    Thông tin chung
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                      Thành phố
                    </label>
                    <input
                      {...register("address.addressLocality", {
                        required: "Thành phố bắt buộc",
                      })}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                      placeholder="TP. HCM"
                    />
                    {errors.address?.addressLocality && (
                      <ErrorMessage
                        message={errors.address.addressLocality.message}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                      Phường/xã
                    </label>
                    <input
                      {...register("address.district", {
                        required: "Phường/xã bắt buộc",
                      })}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                      placeholder="Quận 1"
                    />
                    {errors.address?.district && (
                      <ErrorMessage message={errors.address.district.message} />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                    Vùng
                  </label>
                  <input
                    {...register("address.addressRegion", {
                      required: "Vùng bắt buộc",
                    })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                    placeholder="Miền Nam"
                  />
                  {errors.address?.addressRegion && (
                    <ErrorMessage
                      message={errors.address.addressRegion.message}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                      Tên đường
                    </label>
                    <input
                      {...register("address.streetAddress", {
                        required: "Tên đường bắt buộc",
                      })}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                      placeholder="Lê Lợi"
                    />
                    {errors.address?.streetAddress && (
                      <ErrorMessage
                        message={errors.address.streetAddress.message}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                      Số đường
                    </label>
                    <input
                      {...register("address.streetNr", {
                        required: "Số đường bắt buộc",
                      })}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                      placeholder="123"
                    />
                    {errors.address?.streetNr && (
                      <ErrorMessage message={errors.address.streetNr.message} />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                    Bên cung cấp
                  </label>
                  <input
                    {...register("provider", {
                      required: "Nhà cung cấp bắt buộc",
                    })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                    placeholder="Nhập tên nhà cung cấp"
                  />
                  {errors.provider && (
                    <ErrorMessage message={errors.provider.message} />
                  )}
                </div>
              </div>
            </div>

            {/* Device Config */}
            <div className="shadow-lg border border-gray-100">
              <div className="bg-linear-to-r rounded-t-2xl from-purple-500 to-pink-500 px-6 py-4">
                <div className="flex items-center gap-2">
                  <MdDevices className="text-white text-xl" />
                  <h3 className="text-white font-bold text-lg">
                    Cấu hình thiết bị
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-2">
                    <FaBuilding className="text-purple-500" />
                    Loại thiết bị
                  </label>
                  <Controller
                    name="category"
                    control={control}
                    rules={{
                      required: "Vui lòng chọn ít nhất 1 loại thiết bị",
                    }}
                    render={({ field }) => (
                      <CreatableSelect
                        isMulti
                        options={DEVICE_CATEGORIES}
                        className="text-sm"
                        placeholder="Chọn hoặc tạo mới..."
                        value={field.value?.map(
                          (v: string) =>
                            DEVICE_CATEGORIES.find(
                              (opt) => opt.value === v
                            ) || {
                              label: v,
                              value: v,
                            }
                        )}
                        onChange={(options) =>
                          field.onChange(options?.map((o) => o.value) ?? [])
                        }
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderRadius: "0.5rem",
                            borderWidth: "2px",
                            borderColor: "#e5e7eb",
                            "&:hover": {
                              borderColor: "#a855f7",
                            },
                          }),
                        }}
                      />
                    )}
                  />
                  {errors.category && (
                    <ErrorMessage message={errors.category.message} />
                  )}
                </div>

                <div>
                  <label className=" text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-2">
                    <MdMonitor className="text-purple-500" />
                    Đối tượng theo dõi
                  </label>
                  <Controller
                    name="controlledProperty"
                    control={control}
                    rules={{
                      required: "Vui lòng chọn ít nhất 1 đối tượng theo dõi",
                    }}
                    render={({ field }) => (
                      <CreatableSelect
                        isMulti
                        options={CONTROLLED_PROPERTIES}
                        className="text-sm"
                        placeholder="Chọn hoặc tạo mới..."
                        value={field.value?.map(
                          (v: string) =>
                            CONTROLLED_PROPERTIES.find(
                              (opt) => opt.value === v
                            ) || { label: v, value: v }
                        )}
                        onChange={(options) =>
                          field.onChange(options?.map((o) => o.value) ?? [])
                        }
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderRadius: "0.5rem",
                            borderWidth: "2px",
                            borderColor: "#e5e7eb",
                            "&:hover": {
                              borderColor: "#a855f7",
                            },
                          }),
                        }}
                      />
                    )}
                  />
                  {errors.controlledProperty && (
                    <ErrorMessage message={errors.controlledProperty.message} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-linear-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-white text-xl" />
                  <h3 className="text-white font-bold text-lg">
                    Vị trí thiết bị
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <FaMapMarkerAlt />
                  <span>Thay đổi</span>
                </button>
              </div>

              <div>
                <div className="overflow-hidden shadow-md">
                  <MapViewLocation coordinates={device.location?.coordinates} />
                </div>

                {device.location?.coordinates && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      📍 Tọa độ: {device.location.coordinates[1].toFixed(6)},{" "}
                      {device.location.coordinates[0].toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <MapModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onChange={handleOnChangeLocation}
          location={device.location?.coordinates}
        />
      </div>
    </div>
  );
};

export default AirQualityAdmin;
