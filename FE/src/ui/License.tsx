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
import { FaCreativeCommonsBy } from "react-icons/fa";

const License = () => {
  return (
    <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
      <FaCreativeCommonsBy className="w-4 h-4 text-green-500" />
      Dữ liệu mở — License:{" "}
      <a
        href="https://creativecommons.org/licenses/by/4.0/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-green-700 transition-colors"
      >
        CC BY 4.0
      </a>
    </p>
  );
};

export default License;
