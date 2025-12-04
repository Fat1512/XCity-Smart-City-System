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
import { Modal, Box, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MapIcon from "@mui/icons-material/Map";
import SaveIcon from "@mui/icons-material/Save";
import { useEffect, useState } from "react";
import MapEditLocation from "./MapEditLocation";

interface EditLocationModalProps {
  open: boolean;
  onClose: () => void;
  location?: [number, number];
  onChange?: (coords: [number, number]) => void;
}

export default function MapModal({
  open,
  onClose,
  onChange,
  location,
}: EditLocationModalProps) {
  const [internalLocation, setInternalLocation] = useState<
    [number, number] | undefined
  >(location);

  useEffect(() => {
    if (open) setInternalLocation(location);
  }, [open, location]);

  const handleOnSave = () => {
    if (internalLocation) onChange?.(internalLocation);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 1,
      }}
    >
      <Box
        sx={{
          width: 900,
          maxWidth: "95vw",
          maxHeight: "95vh",
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          outline: "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <MapIcon sx={{ color: "white", fontSize: 20 }} /> {/* giảm icon */}
            <Typography
              variant="subtitle1"
              sx={{ color: "white", fontWeight: 600 }}
            >
              Edit Location
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white", padding: 0.5 }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Map chính - chiếm hầu hết modal */}
        <Box sx={{ flex: 1, position: "relative" }}>
          <MapEditLocation
            coordinates={internalLocation}
            height="100%"
            onChange={(coords) => setInternalLocation(coords)}
          />
        </Box>

        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #e5e7eb",
            bgcolor: "#fafbff",
          }}
        >
          <Typography variant="caption" sx={{ color: "#6b7280" }}>
            {internalLocation
              ? "Location selected - click Save to confirm"
              : "Click on the map to select a location"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleOnSave}
              disabled={!internalLocation}
              startIcon={<SaveIcon />}
            >
              Save Location
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
