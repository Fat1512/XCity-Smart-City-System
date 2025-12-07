<p align="center">
  <img src="./banner.png" alt="XCity Smart City System" width="80%"/>
</p>

<h1 align="center">🌆 X-City  Smart City System</h1>

<p align="center">

  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg"/>
  </a>

  <img src="https://img.shields.io/badge/Backend-SpringBoot-6DB33F?logo=spring&logoColor=white"/>
  <img src="https://img.shields.io/badge/Backend-Python-3776AB?logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Frontend-TypeScript-3178C6?logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Frontend-TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white"/>

  <img src="https://img.shields.io/badge/AI-YOLO-F7DF1E"/>
  <img src="https://img.shields.io/badge/LLM-OpenAI_gpt--4o-00b3ff?logo=openai"/>

  <img src="https://img.shields.io/badge/Infra-Docker-2496ED?logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/IoT-MQTT-008000"/>
  <img src="https://img.shields.io/badge/Orion-LD-EF3F3F"/>
  <img src="https://img.shields.io/badge/Workflow-Airflow-017CEE?logo=apache-airflow&logoColor=white"/>

  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white"/>
</p>

---

## 📖 Mục lục

- [🌟 Giới thiệu](#-giới-thiệu)
- [⚡ Các tính năng chính](#-các-tính-năng-chính)
- [📂 Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [🛠 Tech Stack](#-tech-stack)
- [🏗️ Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [💻 Bảng cổng (Port) sử dụng](#-bảng-cổng-port-sử-dụng)
- [🌐 Các endpoint dữ liệu chính](#-các-endpoint-chính)
- [🚀 Thiết lập dự án](#-thiết-lập-dự-án)
- [🤝 Đóng góp](#đóng-góp-cho-dự-án)
- [📢 Báo cáo lỗi & góp ý](#-báo-cáo-lỗi--góp-ý)
- [📬 Liên hệ](#liên-hệ)
- [📄 License](#giấy-phép)
- [Tác giả](#tác-giả)

## 🌟 Giới thiệu

**X-City** là dự án **mã nguồn mở** hướng tới việc xây dựng một **hệ sinh thái thành phố thông minh**, phục vụ cư dân và nhà quản lý:

- Tận dụng **AI & IoT** để giám sát môi trường, giao thông và hạ tầng theo thời gian thực.
- Quản lý và phân tích **dữ liệu realtime**, cảnh báo sớm các sự cố và tắc nghẽn.
- Hỗ trợ **ra quyết định thông minh**, tối ưu hóa vận hành và nâng cao chất lượng cuộc sống.

Link thuyết trình cho dự án: [Fenwick Presentation](https://www.canva.com/design/DAG6glXaXeU/8pedF1WVn8uQD4tN-9W_yg/edit?utm_content=DAG6glXaXeU&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

---

## ⚡ Các tính năng chính

- Nhận diện lưu lượng giao thông realtime bằng camera AI (YOLO)
- Phân tích dòng phương tiện, cảnh báo tắc đường, đưa ra gợi ý tuyến di chuyển tối ưu
- Kết nối sensor IoT, API bên ngoài (OpenAQ) - hiển thị dữ liệu, cảnh báo ô nhiễm
- Cảnh báo tai nạn, thiên tai, sự cố tới cư dân và quản lý đô thị
- Dashboard realtime, phân tích dữ liệu & ra quyết định
- Trợ lý ảo hỗ trợ cung cấp các thông tin trong thành phố

---

## 📂 Cấu trúc thư mục

```
PMNM/
│
├── 🤖 AI/                                 # Hệ thống AI & Machine Learning cho Smart City
│   ├── app/
│   ├── components/                         # Các thành phần AI riêng biệt
|   │   ├── database/
|   │   ├── embedding/                      # Xử lý embedding cho dữ liệu (vector, hình...)
|   │   ├── generation/                     # Sinh dữ liệu hoặc nội dung tự  động (AI generation, prompt)
|   │   ├── ingest_strategy/
|   │   ├── logging/                        # Ghi lại lịch sử vận hành AI
|   │   ├── reader/
|   │   ├── tools/
|   |   │   ├── route/                      # Xử lý việc chỉ đường
|   |   |   ├── traffic_monitor/            # Giám sát giao thông, phân tích hình ảnh camera
|   │   ├── watcher/
|   │   ├── interfaces.py
|   │   ├── manager.py
│   ├── config/                             # Thiết lập cấu hình cho giả lập camera
│   ├── prompt/                             # Quản lý prompt AI, LLM,...
│   ├── service/                            # Business logic nghiệp vụ chính
│   └── requirements.txt
│
├── 📊 Data/
│   ├── airflow/
│       ├── dags/
│       └── config/                         # Cấu hình Airflow
|
├── 💻 FE/                                 # Frontend: giao diện dashboard cho cư dân & QL thành phố
│   ├── public/
│   ├── src/
│   │   ├── context/                        # Quản lý state tổng (React context)
│   │   ├── feature/                        # Tính năng riêng biệt của FE (traffic, air quality,...)
│   │   ├── global/
│   │   ├── page/                           # Trang chính giao diện
│   │   ├── service/                        # Gọi API backend, quản lý request dữ liệu
│   │   ├── types/                          # TypeScript type, interface cho FE
│   │   ├── ui/                             # Component UI tái sử dụng
│   │   ├── utils/
│   │   └── App.tsx                         # Root của ứng dụng React
|
├── 📡 SensorService/                       # IoT giả lập cảm biến đô thị
│
├── 🏢 XCityServer/                         # Backend chính
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/xcity/tpd/XCity
│   │   │   │       ├── controller/         # Cung cấp REST API cho hệ thống
│   │   │   │       ├── service/            # Business logic nghiệp vụ chính
│   │   │   │       ├── repository/         # Truy xuất dữ liệu, kết nối DB
│   │   │   │       ├── dto/
│   │   │   │       ├── mapper/
│   │   │   │       ├── filter/             # Xử lý request/response, xác thực, logging, lọc dữ liệu
│   │   │   │       ├── entity/             # Định nghĩa entity
│   │   │   │       ├── config/
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   └── pom.xml
│
└── 🐳 Dockerfile
│
└── 🐳 airflow-docker-compose.yml            # Docker compose cho Airflow
│
└── 🐳 docker-compose.yml                    # Docker compose cho toàn bộ hệ thống
```

</details>

## 🛠 Tech Stack

|  Thành phần  | Công nghệ & Mục đích            |
| :----------: | :------------------------------ |
| **Backend**  | Spring Boot, FastAPI, Orion-LD  |
| **Frontend** | React, TypeScript, Tailwind CSS |
|  **AI/ML**   | YOLO-NAS                        |
| **Data/IoT** | Mosquitto MQTT, Airflow         |
|  **Infra**   | Docker, Docker Compose, GCP     |

## 🏗️ Kiến trúc hệ thống

![architecture](./docs/architecture.png)

## 💻 Bảng cổng (Port) sử dụng

| Thành phần                | Mô tả                                   | Port mặc định |
| ------------------------- | --------------------------------------- | :-----------: |
| **XCityServer**           | Backend chính API đô thị                |    `8090`     |
| **SensorService**         | Service giả lập cảm biến IoT            |    `5000`     |
| **AI Service**            | Service camera giao thông AI            |    `5001`     |
| **FE**                    | Web giao diện người dân / quản lý       |    `5173`     |
| **Mosquitto MQTT Broker** | Kết nối, publisher/subscriber IoT       | `1883` (TCP)  |
| **Orion-LD**              | Context Broker / cơ sở dữ liệu ngữ cảnh |    `1026`     |
| **Airflow Web UI**        | Quản lý pipeline                        |    `8080`     |
| **IoT Agent**             | Quản lý IoT Agent                       |    `4041`     |
| **MongoDB**               | Cơ sở dữ liệu lưu trữ                   |    `27017`    |

**Lưu ý:**

- Có thể chỉnh lại port qua file cấu hình hoặc docker-compose.
- Xem docker-compose.yml và từng service để xác nhận port nếu thay đổi.

## 🌐 Các endpoint chính

[Tài liệu API](./docs/API_DOCUMENT.md)

| Method | Endpoint                            | Request Body / Params       | Description                                  |
| ------ | ----------------------------------- | --------------------------- | -------------------------------------------- |
| GET    | `/air/monthly-statics`              | `sensorId`, `year`, `month` | Lấy thống kê chất lượng không khí theo tháng |
| GET    | `/air/daily-statics`                | `sensorId`, `date`          | Lấy thống kê chất lượng không khí theo ngày  |
| GET    | `/alert/statics`                    | `type`                      | Thống kê các SoS, thông báo                  |
| GET    | `/alert/download`                   | `type`                      | Tải dữ liệu alert để download                |
| POST   | `/traffic/download-statics/`        | `Map<String, Object>`       | Tải thống kê giao thông                      |
| GET    | `/traffic/daily-statics/{cameraId}` | `date`                      | Lấy thống kê giao thông theo ngày cho camera |

## 🚀 Thiết lập dự án

### 1️⃣ Chuẩn bị môi trường

- Docker & Docker Compose
- Node.js >= 18.x
- Python >= 3.8 (3.9+ recommended)
- Java >= 17 (for `XCityServer`)

### 2️⃣ Clone repo

```bash
git clone https://github.com/Fat1512/PMNM.git
cd PMNM
```

### 3️⃣ Chạy từng thành phần (quickstart)

### Các dịch vụ cần thiết khác

```bash
docker compose -f service-docker-compose.yml up -d
```

#### Sensor Service

```bash
cd SensorService
python -m venv .venv
source .venv/bin/activate  # hoặc .venv\Scripts\Activate.ps1 trên Windows
pip install -r requirements.txt
python app.py
```

#### Frontend

Thiết lập các biến môi trường cho front-end

```bash
VITE_BASE_URL=http://localhost:8090/xcity-service/api/v1
VITE_SENSOR_URL=http://127.0.0.1:5000/sensor
VITE_AI_URL=http://localhost:5000/api/
VITE_MAPBOX_TOKEN=your-mapbox-token
VITE_CAMERA_AI_URL=ws://localhost:5001/ws/frontend
```

```bash
cd FE
npm install
npm run dev
```

#### XCity Server

Thiết lập các biến môi trường cho server

```bash
CLIENT_URL=http://localhost:5173
MONGO_URL=mongodb://yourusername:yourpassword@localhost:27017/xcity?authSource=admin
AUTH_SECRET_KEY=your-secret-key
AI_SERVER_URL=http://localhost:5001/api
ORION_LD_URL=http://localhost:1026/ngsi-ld/v1/entities
SENSOR_SERVICE=http://127.0.0.1:5000/sensor
IOT_AGENT=http://localhost:4041/iot
```

```bash
cd XCityServer
./mvnw spring-boot:run
```

#### AI Service

Thiết lập các biến môi trường cho AI service

```bash
AI_HOST=localhost:5001
ORION_URL = "http://localhost:1026"

LLM_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_KEY=your-openai-api-key

#or use
# LLM_PROVIDER=ollama
# OLLAMA_MODEL=llama3.2:3b
# OLLAMA_HOST=http://10.1.1.237:11434/



EMBEDDING_PROVIDER=sentence_transformer
EMBEDDING_MODEL_NAME=bkai-foundation-models/vietnamese-bi-encoder
#or use
# EMBEDDING_PROVIDER=ollama
# EMBEDDING_MODEL_NAME=nomic-embed-text:latest

REDIS_HOST=localhost
REDIS_PORT=6739
REDIS_USERNAME=your-username
REDIS_PASSWORD=your-password

AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_DEFAULT_REGION=your-region

WATCHER_S3_BUCKET=tadel-media
WATCHER_S3_PREFIX=rss/
WATCHER_S3_INTERVAL=60

# WATCHER_RSS_URLS=https://vnexpress.net/rss/thoi-su.rss
WATCHER_RSS_INTERVAL=600

KNOWLEDGE_S3_ENABLED=true
KNOWLEDGE_RSS_ENABLED=true
10.1.1.237

```

```bash
cd AI
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

uvicorn run:app --host 0.0.0.0 --port 5001 --ws-max-size 20000000 //khởi chạy server

```

Giả lập camera

1. Chuẩn bị sẵn 1 video về lưu lượng giao thông tại thư mục `AI/` (VD: video2.mp4)
2. Sau khi khởi chạy thành công backend tạo 1 camera.
3. Tạo một file JSON `streams.json` chứa mảng các định nghĩa luồng camera.  
   Lưu file này dưới thư mục `AI/config` hoặc sử dụng đường dẫn tuyệt đối.

Ví dụ `streams.json`:

```json
[
  {
    "stream_id": "urn:ngsi-ld:Camera:70027910-094d-4567-82bf-341ad3156f8e", //sử dụng id camera đã được tạo ra từ bước 2
    "video_path": "video2.mp4",
    "limit_fps": 5,
    "image_pts": [
      [6, 80],
      [308, 4],
      [635, 236],
      [206, 353]
    ],
    "world_pts": [
      [0, 0],
      [15, 0],
      [15, 15],
      [0, 15]
    ],
    "classes": [2, 3, 5, 6],
    "conf": 0.35,
    "tracker_cfg": "bytetrack.yaml",
    "yolo_weights": "yolo11n.pt",
    "segment_ids": ["1328044064", "1265743180"]
  }
]
```

#### Lấy `image_pts` (4 điểm ánh xạ từ ảnh → bản đồ)

Bạn có thể sử dụng script `point_marker` để chọn trực tiếp các điểm trên ảnh từ video.

```bash
python ./point_marker.py
```

#### Tạo các Subscription cho server nhận các thay đổi từ Orion-ld

Subscription cho AirQualityObserved

```bash
curl -X POST "http://localhost:1026/ngsi-ld/v1/subscriptions" \
  -H "Content-Type: application/json" \
  -H "Fiware-Service: openiot" \
  -H "Fiware-ServicePath: /" \
  -d '{
    "type": "Subscription",
    "description": "Subscription for Air Quality changes",
    "entities": [
        {
            "type": "AirQualityObserved"
        }
    ],
    "watchedAttributes": [
        "pm25",
        "pm1",
        "o3",
        "temperature",
        "refDevice"
    ],
    "notification": {
        "attributes": [
            "pm25",
            "pm1",
            "o3",
            "temperature",
            "refDevice"
        ],
        "endpoint": {
            "uri": "http://host.docker.internal:8090/xcity-service/api/v1/air/notify", # URL server nhận notification
            "accept": "application/json"
        },
        "format": "keyValues"
    },
    "@context": "https://smart-data-models.github.io/dataModel.Environment/context.jsonld"
}'
```

Subscription cho TrafficFlowObserved

```bash
curl -X POST "http://localhost:1026/ngsi-ld/v1/subscriptions" \
  -H "Content-Type: application/json" \
  -d '{
   "type": "Subscription",
        "description": "Subscription for Air Quality changes",
        "entities": [
            {
                "type": "TrafficFlowObserved"
            }
        ],
        "watchedAttributes": [
            "averageVehicleSpeed",
            "intensity",
            "occupancy",
            "congested",
            "refDevice"
        ],
        "status": "active",
        "isActive": true,
        "notification": {
            "attributes": [
                "averageVehicleSpeed",
                "intensity",
                "occupancy",
                "congested",
                "refDevice"
            ],
            "format": "keyValues",
            "endpoint": {
                "uri": "http://host.docker.internal:8090/xcity-service/api/v1/traffic/notify", # URL server nhận notification
                "accept": "application/json"
            },
            "status": "ok"
        },
        "jsonldContext": "https://smart-data-models.github.io/dataModel.Transportation/context.jsonld"
}'
```

#### Khởi chạy Airflow

```bash
  docker compose -f airflow-docker-compose.yaml up -d
```

### 4️⃣ Docker & compose

Thiết lập các biến môi trường

```bash
MONGO_URL=your-url
AUTH_SECRET_KEY=your-secret-key
MAPBOX_TOKEN=your-token
```

```bash
docker compose up -d
```

## Đóng góp cho dự án

<a href="https://github.com/Fat1512/PMNM/issues/new?assignees=&labels=&projects=&template=bug_report.md&title=Bug+Report%3A+">Bug Report ⚠️
</a>

<a href="https://github.com/Fat1512/PMNM/issues/new?assignees=&labels=&projects=&template=feature_request.md&title=Request+Feature:">Request Feature 👩‍💻</a>

Nếu bạn muốn đóng góp cho dự án, vui lòng tham khảo [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm chi tiết.

Mọi đóng góp đều được trân trọng, vì vậy đừng ngần ngại gửi pull request tới dự án.

## Liên hệ

- Lê Tân: 2251052107tan@ou.edu.vn
- Lê Tấn Phát: 2251052089phat@ou.edu.vn
- Lê Văn Đạt: 2251050014dat@gmail.com

## Giấy phép

Dự án này được cấp phép theo [APACHE-2.0](LICENSE)

## Tác giả

- tanle9t2 — [https://github.com/tanle9t2](https://github.com/tanle9t2)
- Fat1512 — [https://github.com/Fat1512](https://github.com/Fat1512)
- DatLe328 — [https://github.com/DatLe328](https://github.com/DatLe328)
