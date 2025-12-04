# -----------------------------------------------------------------------------
# Copyright 2025 Fenwick Team
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# -----------------------------------------------------------------------------

import os
from dotenv import load_dotenv
import requests
import json
from datetime import datetime, timezone

# Load environment variables
load_dotenv()
location_id = os.getenv("LOCATION_ID")
OPENAQ_API_KEY = os.getenv("OPENAQ_API_KEY")
location_file_path = os.getenv("LOCATION_FILE_PATH")
sensor_file_path = os.getenv("SENSOR_FILE_PATH")


# FETCH AIR QUALITY DATA BASED ON LOCATION
def fetch_air_quality_locations():
    data = None
    url_checkpoint = f"https://api.openaq.org/v3/locations/{location_id}"
    headers = {"X-API-Key": OPENAQ_API_KEY}
    response = requests.get(url_checkpoint, headers=headers)
    data = response.json()

    with open(location_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


# FETCH MEASUREMENTS DATA BASED ON SENSORS ACCORDING TO LOCATION
def fetch_air_quality_sensors():

    with open(sensor_file_path, 'w', encoding='utf-8') as f:
        pass

    with open(location_file_path, 'r') as f:
        data = json.load(f)

    # take the sensorid from the sensor field
    sensors = data['results'][0]['sensors']
    sensor_ids = [sensor['id'] for sensor in sensors]

    for sensor in sensor_ids:
        openaq_url_checkpoint = f"https://api.openaq.org/v3/sensors/{sensor}"
        headers = {"X-API-Key": OPENAQ_API_KEY}
        response = requests.get(openaq_url_checkpoint, headers=headers)
        openaq_data = response.json()

        with open(sensor_file_path, 'a', encoding='utf-8') as f:
            json.dump(openaq_data, f, ensure_ascii=False, indent=4)


# TRANSFORM JSON FORMAT OF SENSOR FILE
def transform_json_format():
    combined_data = []

    with open(sensor_file_path, 'r', encoding='utf-8') as file:
        content = file.read()

        json_segments = content.split('}{')

        for i, segment in enumerate(json_segments):
            if i > 0:
                segment = '{' + segment
            if i < len(json_segments) - 1:
                segment = segment + '}'

            if i == 0 and segment.startswith('['):
                segment = segment.rstrip(']')
                if not segment.endswith(']'):
                    segment += ']'
                try:
                    data_list = json.loads(segment)
                    combined_data.extend(data_list)
                except json.JSONDecodeError as e:
                    print(f"Error decoding initial segment: {e}")
                    continue
            else:
                try:
                    data = json.loads(segment)
                    if 'results' in data and isinstance(data['results'], list):
                        combined_data.extend(data['results'])
                except json.JSONDecodeError as e:
                    print(f"Error decoding segment {i}: {e}")
                    continue

    unique_data = {item['id']: item for item in combined_data}.values()
    combined_data = list(unique_data)

    if combined_data:
        with open(sensor_file_path, 'w', encoding='utf-8') as file:
            json.dump(combined_data, file, indent=4, ensure_ascii=False)
        print(f"Transformed JSON array written to {sensor_file_path}")
    else:
        print(f"No valid data to write to {sensor_file_path}")


def push_data_to_orion_server():
    
    final_data = {
        "id": "urn:ngsi-ld:Device:e4b65e26-68fe-47ee-b157-7a74871c8f19",
        "type": "https://smartdatamodels.org/dataModel.Environment/AirQualityObserved",
        "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.7.jsonld",
    }

    with open(sensor_file_path, 'r', encoding='utf-8') as file:
        sensor_data = json.load(file)
    
    smart_model_mapping = {
        "pm1": "https://smartdatamodels.org/dataModel.Environment/pm1",
        "pm10": "https://smartdatamodels.org/dataModel.Environment/pm10",
        "pm25": "https://smartdatamodels.org/dataModel.Environment/pm25",
        "relativehumidity": "https://smartdatamodels.org/dataModel.Environment/relativeHumidity", 
        "temperature": "https://smartdatamodels.org/dataModel.Environment/temperature",
        "dateObserved": "https://smartdatamodels.org/dataModel.Environment/dateObserved"
    }
    
    for item in sensor_data:

        name = item['parameter']['name']

        if name not in smart_model_mapping:
            continue

        key = smart_model_mapping[name]

        final_data[key] = {
            "type": "Property",
            "value": item['latest']['value'],
            "observedAt": item['latest']['datetime']['utc']
        }

    headers = {
        "Content-Type": "application/ld+json"
    }

    response = requests.post(
        "http://host.docker.internal:1026/ngsi-ld/v1/entityOperations/upsert",
        headers=headers, 
        json=[final_data]
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    print(response)
