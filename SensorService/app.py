import json
import requests
import random
import time
import threading
import csv
from datetime import datetime
from flask import Flask, request, jsonify
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883

mqtt_client = mqtt.Client()
mqtt_client.connect(BROKER, PORT, 60)

app = Flask(__name__)

running_sensors = {}

# Load CSV data and organize by station
station_data = {}
available_stations = set()

def load_csv_data():
    """Load air quality data from CSV and organize by station"""
    global station_data, available_stations
    
    with open('air_quality.csv', 'r') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            station_no = int(row['Station_No'])
            if station_no not in station_data:
                station_data[station_no] = []
            station_data[station_no].append(row)
            available_stations.add(station_no)

    print(f"✅ Loaded data for {len(available_stations)} stations: {sorted(available_stations)}")
    print(f"📊 Total records: {sum(len(records) for records in station_data.values())}")

# Load data on startup
load_csv_data()

# Configuration: Stations 1-3 for sensors, 4-6 for auto-publish
SENSOR_STATIONS = {1, 2, 3, 4, 5}  # Controlled by sensor API

# Track which stations are assigned to which sensors
station_assignments = {}  # sensor_id -> station_no
used_stations = set()
auto_publish_workers = {}  # station_no -> running flag

def safe_float(value, default=0.0):
    """Safely convert string to float, handling empty strings and None"""
    try:
        if value is None or value == '' or value.strip() == '':
            return default
        return float(value)
    except (ValueError, AttributeError):
        return default

def generate_air_quality_data(sensor_id):
    """Generate air quality data from CSV for assigned station"""
    if sensor_id not in station_assignments:
        return None
    
    station_no = station_assignments[sensor_id]
    station_records = station_data[station_no]
    
    # Get a random record from this station's data
    record = random.choice(station_records)
    
    return {
        "pm25": safe_float(record['PM2.5']),
        "pm1": safe_float(record['TSP']),  # Using TSP as PM1 equivalent
        "o3": safe_float(record['O3']),
        "co2": safe_float(record['CO']),   # Using CO as CO2 equivalent
        "so2": safe_float(record['SO2']),
        "temperature": safe_float(record['Temperature'], 25.0),  # Default temp
        "humidity": safe_float(record['Humidity'], 50.0),        # Default humidity
        "no2": safe_float(record['NO2']),
        "station_no": station_no,
    }

def generate_station_data(station_no):
    """Generate air quality data directly from station number (for auto-publish)"""
    if station_no not in station_data:
        return None
    
    station_records = station_data[station_no]
    
    # Get a random record from this station's data
    record = random.choice(station_records)
    
    return {
        "pm25": safe_float(record['PM2.5']),
        "pm1": safe_float(record['TSP']),  # Using TSP as PM1 equivalent
        "o3": safe_float(record['O3']),
        "co2": safe_float(record['CO']),   # Using CO as CO2 equivalent
        "so2": safe_float(record['SO2']),
        "temperature": safe_float(record['Temperature'], 25.0),  # Default temp
        "humidity": safe_float(record['Humidity'], 50.0),        # Default humidity
        "no2": safe_float(record['NO2']),
        "station_no": station_no,
        "refDevice": f"station_{station_no}"
    }

def sensor_worker(sensor_id):
    topic = f"/air/{sensor_id}/attrs"

    print(f"🚀 Sensor thread started: {sensor_id} (Station {station_assignments[sensor_id]})")

    while running_sensors.get(sensor_id, False):
        data = generate_air_quality_data(sensor_id)
        if data is None:
            print(f"❌ [{sensor_id}] No station assigned!")
            break
            
        data["refDevice"] = sensor_id

        payload = json.dumps(data)

        mqtt_client.publish(topic, payload)
        print(f"📤 [{sensor_id}] Station {data['station_no']} → {payload}")
        time.sleep(5)
    print(f"🛑 Sensor thread stopped: {sensor_id}")

def auto_publish_worker(station_no, device_id, max_records=1000):
    topic = f"/air/{device_id}/attrs"

    print(f"🚀 Auto-publish worker started for Station {station_no} → Device: {device_id} (will send {max_records} records)")

    records_sent = 0
    
    while auto_publish_workers.get(station_no, False) and records_sent < max_records:
        data = generate_station_data(station_no)
        if data is None:
            print(f"❌ [Station {station_no}] No data available!")
            break

        payload = json.dumps(data)

        mqtt_client.publish(topic, payload)
        records_sent += 1
        
        if records_sent % 100 == 0:  # Progress update every 100 records
            print(f"� [Station {station_no}] Progress: {records_sent}/{max_records} records sent")
        
    # Mark as stopped
    auto_publish_workers[station_no] = False
    print(f"✅ [Station {station_no}] Completed! Sent {records_sent}/{max_records} records")
    print(f"🛑 Auto-publish worker stopped for Station {station_no}")


@app.post("/sensor/dump_data")
def dumping_data():
    body = request.json
    device_id = body.get("deviceId")
    
    if not device_id:
        return jsonify({"error": "deviceId is required"}), 400
    
    # Only start auto-publish worker for station 6
    station_no = 6
    if station_no in station_data:
        auto_publish_workers[station_no] = True
        threading.Thread(target=auto_publish_worker, args=(station_no, device_id), daemon=True).start()
        print(f"✅ Station {station_no} auto-publish worker started with device ID: {device_id}")
        
        return jsonify({
            "message": f"Auto-publish worker started for Station {station_no}",
            "device_id": device_id,
            "station_no": station_no
        })
    else:
        return jsonify({"error": f"Station {station_no} has no data in CSV"}), 400


@app.post("/sensor/start")
def start_sensor():
    body = request.json
    sensor_id = body.get("sensorId")
    print(f"sensor id: {sensor_id}")
    if sensor_id in running_sensors and running_sensors[sensor_id]:
        return jsonify({"message": f"{sensor_id} is already running!"})
    
    # Check if we have available sensor-controlled stations (1-3 only)
    available_sensor_stations = SENSOR_STATIONS - used_stations
    
    if len(used_stations) >= len(SENSOR_STATIONS):
        return jsonify({
            "error": f"Cannot start sensor. Maximum {len(SENSOR_STATIONS)} sensors allowed (stations 1-3).",
            "sensor_stations": list(SENSOR_STATIONS),
            "used_stations": len(used_stations)
        }), 400
    
    # Assign an available station to this sensor (only from stations 1-3)
    if sensor_id not in station_assignments:
        if not available_sensor_stations:
            return jsonify({
                "error": "No available sensor stations remaining (1-3)",
                "sensor_stations": list(SENSOR_STATIONS)
            }), 400
            
        assigned_station = min(available_sensor_stations)  # Assign lowest available station number
        station_assignments[sensor_id] = assigned_station
        used_stations.add(assigned_station)
    
    running_sensors[sensor_id] = True
    threading.Thread(target=sensor_worker, args=(sensor_id,), daemon=True).start()

    return jsonify({
        "message": f"{sensor_id} started", 
        "station_no": station_assignments[sensor_id],
        "used_stations": len(used_stations),
        "available_sensor_stations": list(available_sensor_stations - {station_assignments[sensor_id]})
    })

@app.post("/sensor/stop")
def stop_sensor():
    body = request.json
    sensor_id = body.get("sensorId")

    if sensor_id not in running_sensors or not running_sensors[sensor_id]:
        return jsonify({"message": f"{sensor_id} is not running!"})

    running_sensors[sensor_id] = False
    
    # Release the station when sensor stops
    if sensor_id in station_assignments:
        station_no = station_assignments[sensor_id]
        used_stations.discard(station_no)
        del station_assignments[sensor_id]
        
        return jsonify({
            "message": f"{sensor_id} stopped", 
            "released_station": station_no,
            "used_stations": len(used_stations),
            "available_stations": len(available_stations)
        })
    
    return jsonify({"message": f"{sensor_id} stopped"})

@app.get("/sensor/status")
def status():
    return jsonify({
        "running_sensors": running_sensors,
        "station_assignments": station_assignments,
        "used_stations": list(used_stations),
        "sensor_stations": list(SENSOR_STATIONS),
        "total_stations": len(available_stations),
        "remaining_sensor_capacity": len(SENSOR_STATIONS) - len(used_stations)
    })


if __name__ == "__main__":
    print("🔥 Sensor Manager API is running on port 5000...")
    print(f"📡 Sensor-controlled stations: {sorted(SENSOR_STATIONS)}")
    
    app.run(host="0.0.0.0", port=5000)


