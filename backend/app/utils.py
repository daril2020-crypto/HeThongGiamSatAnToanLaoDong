import os
import cv2
import random
import numpy as np
import datetime
import sqlite3
from .config import settings
from .database import get_db_connection

def create_mock_historical_data():
    """Tao truoc du lieu vi pham lich su su dung sqlite3 tieu chuan"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Kiem tra xem da co du lieu chua
        cursor.execute("SELECT COUNT(*) FROM violations")
        count = cursor.fetchone()[0]
        if count > 0:
            print(f"[*] Da co {count} ban ghi vi pham. Bo qua tao du lieu mau.")
            conn.close()
            return

        print("[*] Dang tao du lieu vi pham mau cho lich su 24 gio qua...")
        
        # Danh sach loi va ten cong nhan mau
        types = [
            ("No Helmet", "Medium", "Phat hien cong nhan Le Van C khong doi mu bao ho tai Zone 2."),
            ("No Vest", "Medium", "Phat hien cong nhan Tran Van B khong mac ao phan quang tai Zone 1."),
            ("No Helmet & Vest", "High", "Phat hien cong nhan Nguyen Van D vi pham nghiem trong (khong mu, khong ao) tai Zone 3."),
        ]
        
        now = datetime.datetime.now()
        
        # Sinh 12 ban ghi lich su trai deu 24 gio qua
        for i in range(12):
            v_type, severity, notes = random.choice(types)
            hours_ago = random.randint(1, 23)
            v_time = now - datetime.timedelta(hours=hours_ago)
            v_time_str = v_time.strftime("%Y-%m-%d %H:%M:%S")
            
            # Tao ten file anh mau
            filename = f"history_violation_{i}_{v_time.strftime('%Y%m%d_%H%M%S')}.jpg"
            filepath = os.path.join(settings.VIOLATIONS_DIR, filename)
            
            # Tao mot anh nen toi mau co ve text mo phong vi pham lich su
            img = np.zeros((480, 640, 3), dtype=np.uint8)
            img[:, :] = [40, 30, 30]
            cv2.rectangle(img, (150, 100), (490, 420), (0, 0, 255), 3)
            cv2.putText(img, f"HISTORY LOG: {v_type}", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2)
            cv2.putText(img, f"Time: {v_time_str}", (50, 450), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Luu anh mau
            cv2.imwrite(filepath, img)
            
            # Luu CSDL
            relative_url = f"/static/violations/{filename}"
            status = "Resolved" if random.random() > 0.3 else "Unresolved"
            
            cursor.execute("""
                INSERT INTO violations (timestamp, image_path, violation_type, severity, status, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (v_time_str, relative_url, v_type, severity, status, notes))
            
        conn.commit()
        print("[+] Hoan tat khoi tao 12 ban ghi vi pham bang sqlite3.")
    except Exception as e:
        print(f"[!] Loi khoi tao du lieu mau: {e}")
        conn.rollback()
    finally:
        conn.close()
