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
from postgresql_client import PostgresSQLClient
load_dotenv(".env")


def main():
    # create connection
    pc = PostgresSQLClient(
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )

    # Staging table - stations
    create_table_staging_location = """
        CREATE TABLE staging.stg_sensors_by_locations (
            location_id INT,
            location_name VARCHAR,
            country_code VARCHAR,
            country_name VARCHAR,
            timezone VARCHAR,
            latitude FLOAT,
            longitude FLOAT,
            owner_id INT,
            owner_name VARCHAR,
            provider_id INT,
            provider_name VARCHAR,
            is_mobile BOOLEAN,
            is_monitor BOOLEAN,
            instrument_id INT,
            instrument_name VARCHAR,
            datetime_first_utc TIMESTAMP,
            datetime_last_utc TIMESTAMP,
            load_timestamp TIMESTAMP
        );
    """

    # Staging table - sensors
    create_table_staging_sensors = """
        CREATE TABLE staging.stg_measurement_by_sensors (
            sensor_id INT,
            sensor_name VARCHAR,
            parameter_id INT,
            parameter_name VARCHAR,
            parameter_units VARCHAR,
            parameter_display_name VARCHAR(50),
            measurement_datetime_utc TIMESTAMP,
            measurement_value FLOAT,
            latitude FLOAT,
            longitude FLOAT,
            summary_min FLOAT,
            summary_max FLOAT,
            summary_avg FLOAT,
            summary_sd FLOAT,
            coverage_observed_count INT,
            load_timestamp TIMESTAMP
        );
    """

    try:
        pc.execute_query(create_table_staging_location)
        pc.execute_query(create_table_staging_sensors)
    except Exception as e:
        print(f"Failed to create table with error: {e}")


if __name__ == "__main__":
    main()
import os
from dotenv import load_dotenv
from postgresql_client import PostgresSQLClient
load_dotenv(".env")


def main():
    # create connection
    pc = PostgresSQLClient(
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )

    # Staging table - stations
    create_table_staging_location = """
        CREATE TABLE staging.stg_sensors_by_locations (
            location_id INT,
            location_name VARCHAR,
            country_code VARCHAR,
            country_name VARCHAR,
            timezone VARCHAR,
            latitude FLOAT,
            longitude FLOAT,
            owner_id INT,
            owner_name VARCHAR,
            provider_id INT,
            provider_name VARCHAR,
            is_mobile BOOLEAN,
            is_monitor BOOLEAN,
            instrument_id INT,
            instrument_name VARCHAR,
            datetime_first_utc TIMESTAMP,
            datetime_last_utc TIMESTAMP,
            load_timestamp TIMESTAMP
        );
    """

    # Staging table - sensors
    create_table_staging_sensors = """
        CREATE TABLE staging.stg_measurement_by_sensors (
            sensor_id INT,
            sensor_name VARCHAR,
            parameter_id INT,
            parameter_name VARCHAR,
            parameter_units VARCHAR,
            parameter_display_name VARCHAR(50),
            measurement_datetime_utc TIMESTAMP,
            measurement_value FLOAT,
            latitude FLOAT,
            longitude FLOAT,
            summary_min FLOAT,
            summary_max FLOAT,
            summary_avg FLOAT,
            summary_sd FLOAT,
            coverage_observed_count INT,
            load_timestamp TIMESTAMP
        );
    """

    try:
        pc.execute_query(create_table_staging_location)
        pc.execute_query(create_table_staging_sensors)
    except Exception as e:
        print(f"Failed to create table with error: {e}")


if __name__ == "__main__":
    main()