import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaSave, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { IoBusiness } from "react-icons/io5";

import MapModal from "../../ui/MapModal";
import MapViewLocation from "../../ui/MapViewLocation";
import { CAMERA_USAGE } from "../../utils/appConstant";
import CreatableSelect from "react-select/creatable";

import MiniSpinner from "../../ui/MiniSpinner";
import ErrorMessage from "../../ui/ErrorMessage";
import { toast } from "react-toastify";
import type { Address } from "../building/AdminBuilding";
import type { Location } from "../air-quality-observed/AirQualityAdmin";
import useCreateCamera from "./useCreateCamera";
import useUpdateCamera from "./useUpdateCamera";

export interface CameraCreate {
  id?: string;
  cameraName?: string;
  description?: string;
  address?: Address;
  dateModified?: string;
  dataProvider?: string;
  dateCreated?: string;
  location?: Location;
  cameraUsage?: string;
  on?: boolean;
  type?: "Camera";
}

interface CameraProps {
  cameraProps?: CameraCreate;
}

const CameraAdmin = ({ cameraProps = {} }: CameraProps) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<CameraCreate>({
    defaultValues: cameraProps,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const { isPending, createCamera } = useCreateCamera();
  const { isPending: isUpdatingCamera, updateCamera } = useUpdateCamera();
  const camera = watch();

  function handleOnChangeLocation(coords: [number, number]) {
    setValue("location.coordinates", coords, { shouldValidate: true });
  }

  const onSubmit = (data: CameraCreate) => {
    if (!data.location?.coordinates) {
      alert("Vui lòng chọn vị trí thiết bị");
      return;
    }

    const request: CameraCreate = {
      ...data,
      location: { type: "Point", coordinates: data.location.coordinates },
    };

    if (!camera.id) {
      createCamera(request, {
        onSuccess: () => toast.success("Tạo camera mới thành công"),
        onError: (err) => toast.error(err.message),
      });
      return;
    }
    updateCamera(request, {
      onSuccess: () => toast.success("Cập camera thành công"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
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
                    Quản lý camera
                  </h1>
                  <p className="text-indigo-100 text-sm">Cấu hình camera</p>
                </div>
              </div>
              <button
                onClick={handleSubmit(onSubmit)}
                className="flex cursor-pointer items-center gap-2 bg-white hover:bg-indigo-50 text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {isPending || isUpdatingCamera ? (
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

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Tên thiết bị
              </label>
              <input
                {...register("cameraName", {
                  required: "Tên thiết bị bắt buộc",
                })}
                className="w-full  text-gray-900 text-lg font-semibold border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300"
                placeholder="Nhập tên thiết bị..."
              />
              {errors.cameraName && (
                <ErrorMessage message={errors.cameraName.message} />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Mô tả
              </label>
              <textarea
                {...register("description", {
                  required: "Mô tả bắt buộc",
                })}
                className="w-full  text-gray-700 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none resize-none transition-all duration-300"
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 ">
              <div className="bg-linear-to-r rounded-t-2xl from-emerald-500 to-teal-500 px-6 py-4">
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
                      className="w-full  border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
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
                      className="w-full  border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
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
                    className="w-full  border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
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
                      className="w-full  border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
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
                      className="w-full  border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
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
                    {...register("dataProvider", {
                      required: "Nhà cung cấp bắt buộc",
                    })}
                    className="w-full  border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                    placeholder="Nhập tên nhà cung cấp"
                  />
                  {errors.dataProvider && (
                    <ErrorMessage message={errors.dataProvider.message} />
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-2">
                    Mục đích sử dụng
                  </label>
                  <Controller
                    name="cameraUsage"
                    control={control}
                    rules={{
                      required: "Vui lòng chọn 1 loại thiết bị",
                    }}
                    render={({ field }) => (
                      <CreatableSelect
                        isClearable
                        isMulti={false}
                        options={CAMERA_USAGE}
                        className="text-sm"
                        placeholder="Chọn mục đích sử dụng..."
                        value={
                          CAMERA_USAGE.find(
                            (opt) => opt.value === field.value
                          ) ||
                          (field.value
                            ? { label: field.value, value: field.value }
                            : null)
                        }
                        onChange={(selected) =>
                          field.onChange(selected?.value || null)
                        }
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderRadius: "0.5rem",
                            borderWidth: "2px",
                            borderColor: "#e5e7eb",
                            "&:hover": {
                              borderColor: "oklch(0.77 0.18 163.33)",
                            },
                          }),
                        }}
                      />
                    )}
                  />

                  {errors.cameraUsage && (
                    <ErrorMessage message={errors.cameraUsage.message} />
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
                  <MapViewLocation coordinates={camera.location?.coordinates} />
                </div>

                {camera.location?.coordinates && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      📍 Tọa độ: {camera.location.coordinates[1].toFixed(6)},{" "}
                      {camera.location.coordinates[0].toFixed(6)}
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
          location={camera.location?.coordinates}
        />
      </div>
    </div>
  );
};

export default CameraAdmin;
