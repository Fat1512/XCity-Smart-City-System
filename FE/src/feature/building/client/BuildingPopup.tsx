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
interface BuildingPopupProps {
  buildingName: string;
  buildingId: string;
  category?: string;
  address?: {
    streetNr?: string;
    streetAddress?: string;
    addressRegion?: string;
    addressLocality?: string;
  };
  floorsAboveGround?: number;
  floorsBelowGround?: number;
  description?: string;
  onViewClick?: () => void;
}

export function renderBuildingInfo(props: BuildingPopupProps): HTMLDivElement {
  const containerWrapper = document.createElement("div");
  containerWrapper.style.position = "fixed";
  containerWrapper.style.top = "0";
  containerWrapper.style.left = "0";
  containerWrapper.style.width = "100%";
  containerWrapper.style.height = "100%";
  containerWrapper.style.background = "rgba(0,0,0,0.3)";
  containerWrapper.style.display = "flex";
  containerWrapper.style.alignItems = "center";
  containerWrapper.style.justifyContent = "center";
  containerWrapper.style.zIndex = "9999";

  const container = document.createElement("div");
  containerWrapper.appendChild(container);

  const {
    buildingName,
    buildingId,
    category,
    address,
    floorsAboveGround,
    floorsBelowGround,
    description,
    onViewClick,
  } = props;

  const fullAddress = [
    address?.streetNr,
    address?.streetAddress,
    address?.addressLocality,
  ]
    .filter(Boolean)
    .join(", ");

  const categoryDisplay = category
    ? category
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())
    : "-";

  container.innerHTML = `
    <div style="
      width: 380px;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      position: relative;
    ">
      <!-- Close Button -->
      <button id="close-popup" style="
        position: absolute;
        top: 10px;
        right: 10px;
        background: transparent;
        border: none;
        font-size: 18px;
        cursor: pointer;
      ">✖️</button>

      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        position: relative;
      ">
        <div style="
          display: inline-block;
          background: rgba(255,255,255,0.2);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        ">
          ${categoryDisplay}
        </div>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">
          ${buildingName}
        </div>
        <div style="font-size: 11px; opacity: 0.85; font-weight: 400;">
          ${buildingId.replace("urn:ngsi-ld:Building:", "ID: ")}
        </div>
      </div>

      <!-- Content -->
      <div style="background: white; padding: 20px;">
        ${
          fullAddress
            ? `
        <div style="margin-bottom: 16px;">
          <div style="
            display: flex;
            align-items: start;
            padding: 12px;
            background: linear-gradient(135deg, #f093fb15 0%, #f5576c25 100%);
            border-radius: 10px;
            border-left: 3px solid #f093fb;
          ">
            <div style="font-size: 20px; margin-right: 10px; line-height: 1;">📍</div>
            <div>
              <div style="font-size: 10px; color: #666; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Address</div>
              <div style="font-size: 13px; color: #2d3436; line-height: 1.4;">${fullAddress}</div>
            </div>
          </div>
        </div>`
            : ""
        }

        <div style="margin-bottom: 16px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 600; color: #666; margin-bottom: 12px; letter-spacing: 0.5px;">
            Building Information
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            ${createInfoCard(
              "Floors Above",
              floorsAboveGround,
              "floors",
              "#4ecdc4",
              "🏢"
            )}
            ${createInfoCard(
              "Floors Below",
              floorsBelowGround,
              "floors",
              "#ff6b6b",
              "🏗️"
            )}
          </div>
        </div>

        ${
          description
            ? `
        <div style="margin-bottom: 20px;">
          <div style="padding: 12px; background: #f8f9fa; border-radius: 10px; border-left: 3px solid #74b9ff;">
            <div style="font-size: 10px; color: #666; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">
              ${description.startsWith("http") ? "Website" : "Description"}
            </div>
            <div style="font-size: 13px; color: #2d3436; word-break: break-all;">
              ${
                description.startsWith("http")
                  ? `<a href="${description}" target="_blank" style="color: #667eea; text-decoration: none;">🔗 ${description}</a>`
                  : description
              }
            </div>
          </div>
        </div>`
            : ""
        }

        <button style="
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        "
        id="view-details-btn">
          📊 View Full Details
        </button>
      </div>
    </div>
  `;

  // Click button close
  container.querySelector("#close-popup")?.addEventListener("click", () => {
    containerWrapper.remove();
  });

  // Click outside to close
  containerWrapper.addEventListener("click", (e) => {
    if (e.target === containerWrapper) {
      containerWrapper.remove();
    }
  });

  // View details click
  container
    .querySelector("#view-details-btn")
    ?.addEventListener("click", () => {
      onViewClick?.();
    });

  return containerWrapper as HTMLDivElement;
}

function createInfoCard(
  label: string,
  value: any,
  unit: string,
  color: string,
  emoji: string = "",
  fullWidth: boolean = false
): string {
  const displayValue = value ?? "-";
  return `
    <div style="
      background: linear-gradient(135deg, ${color}15 0%, ${color}25 100%);
      border-left: 3px solid ${color};
      padding: 12px;
      border-radius: 8px;
      ${fullWidth ? "grid-column: 1 / -1;" : ""}
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #666;
        font-weight: 500;
        margin-bottom: 6px;
      ">
        ${emoji ? `<span style="font-size: 14px;">${emoji}</span>` : ""}
        <span>${label}</span>
      </div>
      <div style="font-size: 20px; font-weight: 700; color: #2d3436;">
        ${displayValue}<span style="font-size: 13px; font-weight: 500; color: #636e72; margin-left: 4px;">${unit}</span>
      </div>
    </div>
  `;
}
