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
from datetime import timedelta

from airflow import DAG

from airflow.operators.python import PythonOperator
from airflow.operators.empty import EmptyOperator
from datetime import datetime, timedelta
from utils.airquality_collector import fetch_air_quality_locations, fetch_air_quality_sensors, transform_json_format, push_data_to_orion_server

# DEFAULT DAG ARGUMENTS
default_args = {
    "owner": "dainynguyen",
    "email_on_failure": False,
    "email_on_retry": False,
    "email": "admin@localhost.com",
    "retries": 1,
    "retry_delay": timedelta(seconds=10),
    'catchup_by_default': False
}

# TASK DEFINITION
with DAG(
        "airquality_pipeline",
        start_date=datetime.now() - timedelta(days=1),
        schedule="1 * * * *",  # run at the first minute of every hour
        default_args=default_args,
        catchup=False  # for preventing backfilling
        ) as dag:
    start_pipeline = EmptyOperator(
        task_id="start_pipeline"
    )

    fetch_locations_data = PythonOperator(
        task_id="fetch_sensors_by_location",
        python_callable=fetch_air_quality_locations,
    )

    fetch_sensors_data = PythonOperator(
        task_id="fetch_measurement_by_sensors",
        python_callable=fetch_air_quality_sensors,
    )

    sensor_file_transformation = PythonOperator(
        task_id="measurement_by_sensors_transformation",
        python_callable=transform_json_format,
    )

    push_to_orion = PythonOperator(
        task_id="push_data_to_orionld",
        python_callable=push_data_to_orion_server
    )

    end_pipeline = EmptyOperator(
        task_id="end_pipeline"
    )


# TASK DEPENDENCIES
start_pipeline >> fetch_locations_data >> fetch_sensors_data >> sensor_file_transformation >> push_to_orion >> end_pipeline
