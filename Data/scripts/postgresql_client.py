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
import psycopg2


class PostgresSQLClient:
    def __init__(self, database, user, password, host="localhost", port="5432"):
        self.database = database
        self.user = user
        self.password = password
        self.host = host
        self.port = port
        self.conn = psycopg2.connect(
            database=self.database,
            user=self.user,
            password=self.password,
            host=self.host,
            port=self.port,
        )

    def create_conn(self):
        # Establishing the connection
        conn = psycopg2.connect(
            database=self.database,
            user=self.user,
            password=self.password,
            host=self.host,
            port=self.port,
        )
        return conn

    def execute_query(self, query):
        conn = self.create_conn()
        cursor = conn.cursor()
        cursor.execute(query)
        print(f"Query has been executed successfully!")
        conn.commit()
        # Closing the connection
        conn.close()

    def cursor(self):
        return self.conn.cursor()

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()
import psycopg2


class PostgresSQLClient:
    def __init__(self, database, user, password, host="localhost", port="5432"):
        self.database = database
        self.user = user
        self.password = password
        self.host = host
        self.port = port
        self.conn = psycopg2.connect(
            database=self.database,
            user=self.user,
            password=self.password,
            host=self.host,
            port=self.port,
        )

    def create_conn(self):
        # Establishing the connection
        conn = psycopg2.connect(
            database=self.database,
            user=self.user,
            password=self.password,
            host=self.host,
            port=self.port,
        )
        return conn

    def execute_query(self, query):
        conn = self.create_conn()
        cursor = conn.cursor()
        cursor.execute(query)
        print(f"Query has been executed successfully!")
        conn.commit()
        # Closing the connection
        conn.close()

    def cursor(self):
        return self.conn.cursor()

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()