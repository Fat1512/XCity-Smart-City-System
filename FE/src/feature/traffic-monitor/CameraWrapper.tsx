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
import MiniSpinner from "../../ui/MiniSpinner";
import CameraAdmin, { type CameraCreate } from "./CameraAdmin";
import useGetCamera from "./useGetCamera";

const CameraWrapper = () => {
  const { isLoading, camera } = useGetCamera();
  if (isLoading) return <MiniSpinner />;
  const { cameraConfig, ...rest } = camera || {};
  const cameraCreate: CameraCreate = rest;
  return <CameraAdmin cameraProps={cameraCreate} cameraConfig={cameraConfig} />;
};

export default CameraWrapper;
