import json
import random
import time
import threading
from datetime import datetime
import paho.mqtt.client as mqtt
from flask import Flask, request, jsonify

BROKER = "localhost"
PORT = 1883

mqtt_client = mqtt.Client()
mqtt_client.connect(BROKER, PORT, 60)

app = Flask(__name__)

running_sensors = {}

def generate_air_quality_data():
    return {
        "pm25": round(random.uniform(0, 150), 2),
        "pm1": round(random.uniform(0, 80), 2),
        "o3": round(random.uniform(0, 300), 2),
        "co2": round(random.uniform(300, 1000), 2),
        "so2": round(random.uniform(0, 50), 2),
        "temperature": round(random.uniform(15, 40), 2),
    }

def sensor_worker(sensor_id):
    topic = f"/air/{sensor_id}/attrs"

    print(f"🚀 Sensor thread started: {sensor_id}")

    while running_sensors.get(sensor_id, False):

        data = generate_air_quality_data()
        data["refDevice"] = sensor_id

        payload = json.dumps(data)

        mqtt_client.publish(topic, payload)
        print(f"📤 [{sensor_id}] Sent → {payload}")
        time.sleep(5)
    print(f"🛑 Sensor thread stopped: {sensor_id}")


@app.post("/sensor/start")
def start_sensor():
    body = request.json
    sensor_id = body.get("sensorId")

    if sensor_id in running_sensors and running_sensors[sensor_id]:
        return jsonify({"message": f"{sensor_id} is already running!"})

    running_sensors[sensor_id] = True
    threading.Thread(target=sensor_worker, args=(sensor_id,), daemon=True).start()

    return jsonify({"message": f"{sensor_id} started"})

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


if __name__ == "__main__":
    print("🔥 Sensor Manager API is running on port 5000...")
    app.run(host="0.0.0.0", port=5000)
