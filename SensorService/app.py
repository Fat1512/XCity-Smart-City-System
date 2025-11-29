import json

import threading
import csv
import os
from datetime import datetime
import paho.mqtt.client as mqtt
from flask import Flask, request, jsonify

BROKER = "localhost"
PORT = 1883

mqtt_client = mqtt.Client()
mqtt_client.connect(BROKER, PORT, 60)

app = Flask(__name__)

running_sensors = {}
station_data = {}
sensor_to_station_mapping = {}
sensor_data_index = {} 

def load_station_data():
    stations = [1, 2, 3, 4]  
    for station_id in stations:
        csv_file = f"separated_stations/station_{station_id}.csv"
        if os.path.exists(csv_file):
            with open(csv_file, 'r') as file:
                reader = csv.DictReader(file)
                station_data[station_id] = list(reader)
        else:
            print(f"CSV file not found: {csv_file}")

def assign_sensor_to_station(sensor_id):
    """Assign an unpredictable sensor ID to one of the available stations (1, 2, 3)"""
    if sensor_id not in sensor_to_station_mapping:
        assigned_stations = list(sensor_to_station_mapping.values())
        for station_num in [1, 2, 3]:
            if assigned_stations.count(station_num) < len([s for s in sensor_to_station_mapping.keys()]) // 3 + 1:
                sensor_to_station_mapping[sensor_id] = station_num
                break
        else:
            sensor_to_station_mapping[sensor_id] = (hash(sensor_id) % 3) + 1
        
        print(f"Mapped sensor '{sensor_id}' to station_{sensor_to_station_mapping[sensor_id]}")
    
    return sensor_to_station_mapping[sensor_id]

load_station_data()

def get_station_data(station_num, data_index):
    """Get real data from CSV for the specified station number"""
    if station_num not in station_data or not station_data[station_num]:
        return None
    
    data_list = station_data[station_num]
    row = data_list[data_index % len(data_list)]
    
    date_str = row['date']
    dt = datetime.strptime(date_str, "%d/%m/%Y %H:%M")
    formatted_date = dt.strftime("%Y-%m-%dT%H:%M:%S")
    
    return {
        "pm25": float(row.get('PM2.5', 0)) if row.get('PM2.5') else 0,
        "o3": float(row.get('O3', 0)) if row.get('O3') else 0,
        "so2": float(row.get('SO2', 0)) if row.get('SO2') else 0,
        "no2": float(row.get('NO2', 0)) if row.get('NO2') else 0,
        "temperature": float(row.get('Temperature', 0)) if row.get('Temperature') else 0,
        "relativeHumidity": float(row.get('humidity', 0)) if row.get('humidity') else 0,
        "dateObserved": formatted_date
    }

def sensor_worker(sensor_id):
    topic = f"/air/{sensor_id}/attrs"
    
    data_index = sensor_data_index.get(sensor_id, 0)

    station_num = assign_sensor_to_station(sensor_id)

    while running_sensors.get(sensor_id, False):
        data = get_station_data(station_num, data_index)
        data_index += 1
        
        # Update the stored index for this sensor
        sensor_data_index[sensor_id] = data_index
        
        if data:
            data["refDevice"] = sensor_id
            payload = json.dumps(data)
            mqtt_client.publish(topic, payload)
            print(f"[{sensor_id}] (station_{station_num}, index {data_index-1}) Sent → {payload}")
        else:
            print(f"[{sensor_id}] No data available for station_{station_num}")

        time.sleep(5)
    print(f"Sensor thread stopped: {sensor_id} (at index {data_index})")



@app.post("/sensor/start")
def start_sensor():
    body = request.json
    sensor_id = body.get("sensorId")
    
    if not sensor_id:
        return jsonify({"error": "sensorId is required"}), 400

    if sensor_id in running_sensors and running_sensors[sensor_id]:
        return jsonify({"message": f"{sensor_id} is already running!"})

    station_num = assign_sensor_to_station(sensor_id)
    running_sensors[sensor_id] = True
    threading.Thread(target=sensor_worker, args=(sensor_id,), daemon=True).start()

    return jsonify({
        "message": f"{sensor_id} started", 
        "assignedStation": station_num,
        "info": "Sensor will stream data from real air quality measurements"
    })

@app.post("/sensor/stop")
def stop_sensor():
    body = request.json
    sensor_id = body.get("sensorId")

    if sensor_id not in running_sensors or not running_sensors[sensor_id]:
        return jsonify({"message": f"{sensor_id} is not running!"})

    running_sensors[sensor_id] = False
    return jsonify({"message": f"{sensor_id} stopped"})


@app.get("/sensor/status")
def status():
    return jsonify(running_sensors)


@app.get("/sensor/available")
def available_stations():
    """List available stations with their data counts"""
    available = {}
    for station_num, data_list in station_data.items():
        available[f"station_{station_num}"] = {
            "records": len(data_list),
            "status": "loaded" if data_list else "no_data"
        }
    return jsonify(available)


@app.get("/sensor/mappings")
def sensor_mappings():
    """Show current sensor to station mappings"""
    return jsonify({
        "mappings": sensor_to_station_mapping,
        "info": "Shows which unpredictable sensor IDs are mapped to which stations (1-3)"
    })

@app.post("/sensor/reset")
def reset_sensor_index():
    """Reset a sensor's data index back to 0"""
    body = request.json
    sensor_id = body.get("sensorId")
    
    if not sensor_id:
        return jsonify({"error": "sensorId is required"}), 400
    
    if sensor_id in sensor_data_index:
        old_index = sensor_data_index[sensor_id]
        sensor_data_index[sensor_id] = 0
        return jsonify({
            "message": f"Reset {sensor_id} index from {old_index} to 0",
            "previousIndex": old_index
        })
    else:
        return jsonify({"message": f"{sensor_id} has no stored index"})

@app.get("/sensor/indices")
def sensor_indices():
    """Show current data indices for all sensors"""
    return jsonify({
        "indices": sensor_data_index,
        "info": "Shows the current data index position for each sensor"
    })

@app.post("/sensor/push-station")
def push_station4_data():
    body = request.json
    sensor_id = body.get("sensorId")
    
    if not sensor_id:
        return jsonify({"error": "sensorId is required"}), 400
    
    # Check if station 4 data is loaded
    if 4 not in station_data or not station_data[4]:
        return jsonify({"error": "Station 4 data not loaded"}), 404
    
    # Push all data to MQTT
    topic = f"/air/{sensor_id}/attrs"
    pushed_count = 0
    total_records = len(station_data[4])
    
    for index in range(total_records):
        try:
            data = get_station_data(4, index)
            
            if data:
                data["refDevice"] = sensor_id
                payload = json.dumps(data)
                mqtt_client.publish(topic, payload)
                pushed_count += 1
            
        except Exception as e:
            print(f"Error processing row {index}: {e}")
            continue
    
    return jsonify({
        "message": f"Successfully pushed {pushed_count} records from station_4 to MQTT",
        "sensorId": sensor_id,
        "topic": topic,
        "totalRecords": total_records,
        "pushedRecords": pushed_count
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)