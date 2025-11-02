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
  const container = document.createElement("div");

  const {
    buildingName,
    buildingId,
    category,
    address,
    floorsAboveGround,
    floorsBelowGround,
    description,
  } = props;

  // Format địa chỉ đầy đủ
  const fullAddress = [
    address?.streetNr,
    address?.streetAddress,
    address?.addressRegion,
    address?.addressLocality,
  ]
    .filter(Boolean)
    .join(", ");

  // Format category
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
    ">
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
      <div style="
        background: white;
        padding: 20px;
      ">
        <!-- Address Section -->
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
            <div style="
              font-size: 20px;
              margin-right: 10px;
              line-height: 1;
            ">📍</div>
            <div>
              <div style="font-size: 10px; color: #666; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">
                Address
              </div>
              <div style="font-size: 13px; color: #2d3436; line-height: 1.4;">
                ${fullAddress}
              </div>
            </div>
          </div>
        </div>
        `
            : ""
        }

        <!-- Building Info Section -->
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

        <!-- Description/Website -->
        ${
          description
            ? `
        <div style="margin-bottom: 20px;">
          <div style="
            padding: 12px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 3px solid #74b9ff;
          ">
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
        </div>
        `
            : ""
        }

        <!-- Action Button -->
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
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.6)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102, 126, 234, 0.4)';">
          📊 View Full Details
        </button>
      </div>
    </div>
  `;

  return container.firstElementChild as HTMLDivElement;
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
