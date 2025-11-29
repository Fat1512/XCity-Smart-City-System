import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import {
  Box,
  Modal,
  TextField,
  Button,
  Typography,
  Stack,
  IconButton,
  Chip,
  Paper,
  Fade,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SendIcon from "@mui/icons-material/Send";
import {
  ALERT_CATEGORIES,
  ALERT_SUB_CATEGORIES,
  DEFAULT_CITY,
} from "../../utils/appConstant";

import useCreateAlert, { type AlertCreateRequest } from "./useCreateAlert";
import { toast } from "react-toastify";
import { geocodeAddress } from "../../service/externalAPI";

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  borderRadius: 4,
  boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
  outline: "none",
};

interface AlertModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertModal = ({ open, setOpen }: AlertModalProps) => {
  const { control, setValue, handleSubmit, watch } =
    useForm<AlertCreateRequest>({});
  const { isPending, createAlert } = useCreateAlert();

  const location = watch("location");
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ GPS");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("location.coordinates", [
          pos.coords.longitude,
          pos.coords.latitude,
        ]);
        setValue("location.type", "Point");
      },
      () => {
        alert("Không thể lấy vị trí!");
      }
    );
  };

  const handleClearLocation = () => {
    setValue("location.coordinates", []);
  };

  const onSubmit = async (data: AlertCreateRequest) => {
    if (!data.location?.coordinates?.length) {
      if (!data.address?.addressLocality) {
        toast.error("Vui lòng cung cấp vị trí hoặc địa chỉ.");
        return;
      }

      if (!data.location) {
        data.location = { type: "Point", coordinates: [] };
      }

      const sAddress = [
        data.address?.streetAddress,
        data.address?.addressLocality,
        data.address?.addressRegion,
      ]
        .filter(Boolean)
        .map((s) => s.trim())
        .join(", ");

      const geoCoords = await geocodeAddress(sAddress + ", Vietnam");

      if (!geoCoords) {
        toast.error("Không tìm thấy tọa độ phù hợp với địa chỉ.");
        return;
      }

      data.location.coordinates = geoCoords;
    }

    createAlert(data, {
      onSuccess: () => {
        toast.success("Yêu cầu của bạn đã được gửi đi");
        setOpen(false);
      },
      onError: (err) => toast.error(`Yêu cầu của bạn bị: ${err.message}`),
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      closeAfterTransition
      slotProps={{
        backdrop: {
          timeout: 500,
          sx: { backdropFilter: "blur(4px)" },
        },
      }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 3,
              pb: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "error.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WarningAmberIcon sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                Tạo cảnh báo mới
              </Typography>
            </Stack>
            <IconButton
              onClick={() => setOpen(false)}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider />

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Name */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tên người báo cáo"
                    placeholder="Nhập tên của bạn"
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />

              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                  gutterBottom
                  sx={{ mb: 1.5 }}
                >
                  Loại cảnh báo
                </Typography>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Stack direction="row" spacing={1.5}>
                      {ALERT_CATEGORIES.map((cat) => (
                        <Chip
                          key={cat.value}
                          label={cat.label}
                          onClick={() => field.onChange(cat.value)}
                          sx={{
                            px: 2,
                            py: 3,
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            borderRadius: 2,
                            transition: "all 0.2s",
                            ...(field.value === cat.value
                              ? {
                                  bgcolor: "primary.main",
                                  color: "white",
                                  "&:hover": {
                                    bgcolor: "primary.dark",
                                  },
                                }
                              : {
                                  bgcolor: "grey.100",
                                  color: "text.secondary",
                                  "&:hover": {
                                    bgcolor: "grey.200",
                                  },
                                }),
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                />
              </Box>

              {/* Sub Category */}
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                  gutterBottom
                  sx={{ mb: 1.5 }}
                >
                  Phân loại chi tiết
                </Typography>
                <Controller
                  name="subCategory"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={ALERT_SUB_CATEGORIES}
                      onChange={(val) => field.onChange(val?.value)}
                      value={ALERT_SUB_CATEGORIES.find(
                        (opt) => opt.value === field.value
                      )}
                      placeholder="Chọn loại cảnh báo"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: 8,
                          minHeight: 48,
                          boxShadow: "none",
                          borderColor: "#e0e0e0",
                          ":hover": { borderColor: "#bdbdbd" },
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 10,
                          borderRadius: 8,
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }),
                      }}
                    />
                  )}
                />
              </Box>

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mô tả chi tiết"
                    placeholder="Nhập mô tả tình huống..."
                    multiline
                    rows={4}
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />

              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                  gutterBottom
                  sx={{ mb: 1.5 }}
                >
                  Địa chỉ
                </Typography>
                <Stack spacing={2}>
                  <Controller
                    name="address.streetAddress"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        placeholder="Số nhà, tên đường"
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    )}
                  />
                  <Stack direction="row" spacing={2}>
                    <Controller
                      name="address.addressLocality"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          placeholder="Phường/xã"
                          fullWidth
                          variant="outlined"
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="address.addressRegion"
                      control={control}
                      defaultValue={DEFAULT_CITY}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          placeholder="Tỉnh/Thành phố"
                          fullWidth
                          disabled={true}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            className: "cursor-not-allowed",
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />
                  </Stack>
                </Stack>
              </Box>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LocationOnIcon sx={{ color: "white", fontSize: 20 }} />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Tọa độ GPS
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {location?.coordinates?.[0] && location?.coordinates?.[1]
                        ? `${location.coordinates[0].toFixed(
                            6
                          )}, ${location.coordinates[1].toFixed(6)}`
                        : "Chưa có tọa độ"}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<MyLocationIcon />}
                    onClick={handleGetCurrentLocation}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
                      },
                    }}
                  >
                    Lấy vị trí
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleClearLocation}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "rgba(255,0,0,0.08)",
                      },
                    }}
                  >
                    Xóa
                  </Button>
                </Stack>
              </Paper>

              <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                <Button
                  onClick={() => setOpen(false)}
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: "grey.300",
                    color: "text.secondary",
                    "&:hover": {
                      borderColor: "grey.400",
                      bgcolor: "grey.50",
                    },
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  endIcon={<SendIcon />}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(25,118,210,0.4)",
                    },
                  }}
                >
                  Gửi cảnh báo
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default AlertModal;
