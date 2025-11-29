# Sensor Service Usage Guide

## Overview

The sensor service now uses real air quality data from `air_quality.csv` with 6 stations. The stations are divided into two categories:

### Station Categories

- **Stations 1-3**: Sensor-controlled (via API)

  - Can be started/stopped using the REST API
  - Assigned dynamically to sensors
  - One sensor monitors one station

- **Stations 4-6**: Auto-publish (background workers)
  - Started automatically when the app launches
  - Each station publishes exactly 1000 records then stops
  - Publishes to MQTT every 5 seconds
  - Cannot be controlled via API

## API Endpoints

### Start a Sensor

```bash
POST /sensor/start
Body: {"sensorId": "sensor_001"}
```

Response:

```json
{
  "message": "sensor_001 started",
  "station_no": 1,
  "used_stations": 1,
  "available_sensor_stations": [2, 3]
}
```

### Stop a Sensor

```bash
POST /sensor/stop
Body: {"sensorId": "sensor_001"}
```

Response:

```json
{
  "message": "sensor_001 stopped",
  "released_station": 1,
  "used_stations": 0,
  "available_stations": 6
}
```

### Check Status

```bash
GET /sensor/status
```

Response:

```json
{
  "running_sensors": { "sensor_001": true },
  "station_assignments": { "sensor_001": 1 },
  "used_stations": [1],
  "sensor_stations": [1, 2, 3],
  "auto_publish_stations": [4, 5, 6],
  "auto_publish_active": {
    "4": true,
    "5": true,
    "6": true
  },
  "total_stations": 6,
  "remaining_sensor_capacity": 2
}
```

## MQTT Topics

### Sensor-controlled (Stations 1-3)

- Topic format: `/air/{sensorId}/attrs`
- Example: `/air/sensor_001/attrs`

### Auto-publish (Stations 4-6)

- Topic format: `/air/station_{station_no}/attrs`
- Examples:
  - `/air/station_4/attrs`
  - `/air/station_5/attrs`
  - `/air/station_6/attrs`

## Data Format

All stations publish data in the following format:

```json
{
  "pm25": 15.6,
  "pm1": 32.94,
  "o3": 55.43,
  "co2": 1330.45,
  "so2": 393.0,
  "temperature": 28.36,
  "humidity": 63.19,
  "no2": 112.74,
  "station_no": 1,
  "refDevice": "sensor_001"
}
```

## Limitations

- Maximum 3 sensors can run simultaneously (stations 1-3)
- Stations 4-6 each send exactly 1000 records when app starts, then stop
- Total auto-publish records: 3000 (1000 per station × 3 stations)
- Auto-publish takes approximately 1.39 hours per station (1000 records × 5 seconds)
- Empty values in CSV are handled gracefully (default to 0.0)
- Data is randomly selected from the CSV for each station

## Running the Service

```bash
cd /home/phat/Documents/workspace/PMNM/SensorService
python app.py
```

The service will:

1. Load air quality data from CSV
2. Start auto-publish workers for stations 4-6
3. Start the Flask API on port 5000
