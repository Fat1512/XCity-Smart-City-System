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

from utils.migrate_data import load_measurements_by_sensors

# DAG DEFINITION
default_args = {
    "owner": "dainynguyen",
    "email_on_failure": False,
    "email_on_retry": False,
    "email": "admin@localhost.com",
    "retries": 1,
    "retry_delay": timedelta(seconds=10),
    'catchup_by_default': False
}

# TASKS DEFINITION
with DAG(
        "data_migration_pipeline",
        start_date=datetime.now() - timedelta(days=1),
        schedule="2 * * * *",  # run at the second minute of every hour
        default_args=default_args,
        # catchup=False
        ) as dag:  # for preventing backfilling

    start_pipeline = EmptyOperator(
        task_id="start_pipeline"
    )

    insert_measurement_sensors_data = PythonOperator(
        task_id="measurement_data_insert",
        python_callable=load_measurements_by_sensors
    )

    end_pipeline = EmptyOperator(
        task_id="end_pipeline"
    )

# TASK DEPENDENCIES
start_pipeline >> insert_measurement_sensors_data >> end_pipeline
