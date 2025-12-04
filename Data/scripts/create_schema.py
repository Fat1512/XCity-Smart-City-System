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

# LOAD ENVIRONMENT VARIABLES
load_dotenv()


def main():
    pc = PostgresSQLClient(
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )

    create_staging_schema = """CREATE SCHEMA IF NOT EXISTS staging;"""

    create_production_schema = """CREATE SCHEMA IF NOT EXISTS production;"""

    try:
        pc.execute_query(create_staging_schema)
        pc.execute_query(create_production_schema)
    except Exception as e:
        print(f"Failed to create schema with error: {e}")


if __name__ == "__main__":
    main()
import os
from dotenv import load_dotenv
from postgresql_client import PostgresSQLClient

# LOAD ENVIRONMENT VARIABLES
load_dotenv()


def main():
    pc = PostgresSQLClient(
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
    )

    create_staging_schema = """CREATE SCHEMA IF NOT EXISTS staging;"""

    create_production_schema = """CREATE SCHEMA IF NOT EXISTS production;"""

    try:
        pc.execute_query(create_staging_schema)
        pc.execute_query(create_production_schema)
    except Exception as e:
        print(f"Failed to create schema with error: {e}")


if __name__ == "__main__":
    main()