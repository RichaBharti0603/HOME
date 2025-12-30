# backend/memory/sqlite_store.py

import sqlite3
from typing import List, Tuple


class SQLiteMemoryStore:
    def __init__(self, db_path: str = "backend/memory/memory.db"):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self):
        return sqlite3.connect(self.db_path, check_same_thread=False)

    def _init_db(self):
        conn = self._get_conn()
        cur = conn.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
        conn.close()

    def add_message(self, session_id: str, role: str, content: str) -> None:
        conn = self._get_conn()
        cur = conn.cursor()

        cur.execute(
            "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
            (session_id, role, content)
        )

        conn.commit()
        conn.close()

    def get_messages(self, session_id: str) -> List[Tuple[str, str]]:
        conn = self._get_conn()
        cur = conn.cursor()

        cur.execute(
            "SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC",
            (session_id,)
        )

        rows = cur.fetchall()
        conn.close()

        return rows
