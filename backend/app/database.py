import sqlite3
import os
from .config import settings

DB_PATH = os.path.join(settings.BASE_DIR, 'safety_data.db')

def get_db_connection():
    """Tạo kết nối tới CSDL SQLite sử dụng Row Factory để truy cập bằng tên cột"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Khởi tạo bảng violations trong cơ sở dữ liệu nếu chưa tồn tại"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS violations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            image_path TEXT NOT NULL,
            violation_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            status TEXT DEFAULT 'Unresolved',
            notes TEXT
        )
    """)
    conn.commit()
    conn.close()
    print("[+] Da khoi tao bang CSDL SQLite thanh cong.")
