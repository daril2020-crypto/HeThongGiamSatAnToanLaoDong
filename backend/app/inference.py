import os
import cv2
import time
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import datetime
import sqlite3
from .config import settings
from .database import get_db_connection

class SafetyInferenceEngine:
    def __init__(self):
        self.mode = settings.MODE
        print(f"[*] Khoi dong Dong co AI o che do: {self.mode.upper()}")
        
        # Biến trạng thái giả lập
        self.workers = [
            {"id": 1, "x": 150, "y": 200, "vx": 2, "vy": 1, "helmet": True, "vest": True, "name": "Nguyen Van A"},
            {"id": 2, "x": 400, "y": 300, "vx": -1, "vy": 2, "helmet": True, "vest": False, "name": "Tran Van B"},
            {"id": 3, "x": 600, "y": 150, "vx": -2, "vy": -1, "helmet": False, "vest": True, "name": "Le Van C"},
        ]
        self.last_violation_time = 0
        self.violation_cooldown = 15  # Giới hạn phát hiện vi phạm cách nhau tối thiểu 15 giây
        
        # Load YOLO nếu chạy chế độ thực tế
        if self.mode == "real":
            try:
                from ultralytics import YOLO
                self.model = YOLO(settings.YOLO_MODEL_PATH)
                print("[+] Da tai mo hinh YOLOv8 thuc te.")
            except Exception as e:
                print(f"[!] Khong the tai mo hinh YOLOv8: {e}. Chuyen sang Gia lap.")
                self.mode = "simulation"

    def _draw_mock_background(self):
        """Tạo một khung hình nền công trường giả lập sống động sử dụng OpenCV"""
        img = np.zeros((720, 1280, 3), dtype=np.uint8)
        
        # Vẽ bầu trời đêm / tối (Gradient từ Slate sang Indigo)
        for y in range(720):
            r = int(15 + (10 * y / 720))
            g = int(23 + (15 * y / 720))
            b = int(42 + (20 * y / 720))
            img[y, :] = [b, g, r] # OpenCV dùng BGR
            
        # Vẽ cấu trúc giàn giáo công trường xây dựng
        cv2.line(img, (200, 0), (200, 720), (80, 80, 80), 4)
        cv2.line(img, (600, 0), (600, 720), (80, 80, 80), 4)
        cv2.line(img, (1000, 0), (1000, 720), (80, 80, 80), 4)
        cv2.line(img, (0, 150), (1280, 150), (80, 80, 80), 4)
        cv2.line(img, (0, 400), (1280, 400), (80, 80, 80), 4)
        cv2.line(img, (0, 650), (1280, 650), (80, 80, 80), 4)
        
        for x in [200, 600]:
            cv2.line(img, (x, 150), (x+400, 400), (50, 50, 50), 2)
            cv2.line(img, (x+400, 150), (x, 400), (50, 50, 50), 2)
            cv2.line(img, (x, 400), (x+400, 650), (50, 50, 50), 2)
            cv2.line(img, (x+400, 400), (x, 650), (50, 50, 50), 2)
            
        cv2.rectangle(img, (50, 600), (150, 650), (100, 100, 100), -1)
        cv2.rectangle(img, (80, 560), (140, 600), (120, 120, 120), -1)
        cv2.rectangle(img, (1050, 580), (1200, 650), (90, 90, 90), -1)
        cv2.line(img, (1150, 50), (1150, 600), (30, 40, 50), 8)
        cv2.line(img, (900, 100), (1250, 100), (30, 40, 50), 6)
        cv2.line(img, (900, 100), (1150, 50), (30, 40, 50), 3)

        for i in range(0, 1280, 160):
            cv2.line(img, (i, 0), (i, 720), (40, 40, 40), 1)
        for j in range(0, 720, 90):
            cv2.line(img, (0, j), (1280, j), (40, 40, 40), 1)

        return img

    def _trigger_simulated_violation(self, worker, frame):
        """Ghi nhận một lỗi vi phạm giả lập mới vào CSDL sqlite3 và lưu ảnh chụp"""
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # Xác định loại vi phạm và mức độ
            if not worker["helmet"] and not worker["vest"]:
                v_type = "No Helmet & Vest"
                severity = "High"
            elif not worker["helmet"]:
                v_type = "No Helmet"
                severity = "Medium"
            else:
                v_type = "No Vest"
                severity = "Medium"

            # Đặt tên file ảnh vi phạm độc bản
            timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"violation_{worker['id']}_{timestamp_str}.jpg"
            filepath = os.path.join(settings.VIOLATIONS_DIR, filename)

            # Vẽ ô bounding box màu đỏ rực rỡ báo vi phạm lên ảnh lưu trữ
            alert_frame = frame.copy()
            cv2.rectangle(alert_frame, (worker["x"] - 50, worker["y"] - 100), (worker["x"] + 50, worker["y"] + 150), (0, 0, 255), 3)
            cv2.rectangle(alert_frame, (worker["x"] - 50, worker["y"] - 130), (worker["x"] + 50, worker["y"] - 100), (0, 0, 255), -1)
            cv2.putText(alert_frame, "DANGER", (worker["x"] - 45, worker["y"] - 110), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

            # Lưu ảnh ra đĩa
            cv2.imwrite(filepath, alert_frame)

            # Tạo bản ghi trong cơ sở dữ liệu sqlite3
            relative_url = f"/static/violations/{filename}"
            now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            notes = f"Phát hiện công nhân {worker['name']} vi phạm quy định tại khu vực Zone {random.randint(1, 4)}."
            
            cursor.execute("""
                INSERT INTO violations (timestamp, image_path, violation_type, severity, status, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (now_str, relative_url, v_type, severity, "Unresolved", notes))
            conn.commit()
            print(f"[!] DA LUU VI PHAM MOI QUA SQLITE3: {v_type} - {worker['name']}")
        except Exception as e:
            print(f"[!] Loi khi ghi nhan vi pham gia lap: {e}")
            conn.rollback()
        finally:
            conn.close()

    def generate_frames(self):
        """Hàm Generator liên tục sản sinh luồng ảnh video MJPEG"""
        frame_id = 0
        while True:
            t_start = time.time()
            frame_id += 1

            if self.mode == "simulation":
                frame = self._draw_mock_background()

                # Cập nhật vị trí công nhân
                for w in self.workers:
                    w["x"] += w["vx"]
                    w["y"] += w["vy"]

                    if w["x"] < 100 or w["x"] > 1180:
                        w["vx"] *= -1
                    if w["y"] < 150 or w["y"] > 580:
                        w["vy"] *= -1

                    color = (0, 255, 0)
                    if not w["helmet"] or not w["vest"]:
                        color = (0, 165, 255)

                    cv2.rectangle(frame, (w["x"] - 50, w["y"] - 100), (w["x"] + 50, w["y"] + 150), color, 2)
                    
                    h_color = (0, 255, 0) if w["helmet"] else (0, 0, 255)
                    h_text = "Helmet" if w["helmet"] else "NO Helmet"
                    cv2.rectangle(frame, (w["x"] - 30, w["y"] - 90), (w["x"] + 30, w["y"] - 30), h_color, 2)
                    cv2.putText(frame, h_text, (w["x"] - 25, w["y"] - 95), cv2.FONT_HERSHEY_SIMPLEX, 0.4, h_color, 1)

                    v_color = (0, 255, 0) if w["vest"] else (0, 0, 255)
                    v_text = "Vest" if w["vest"] else "NO Vest"
                    cv2.rectangle(frame, (w["x"] - 45, w["y"] - 20), (w["x"] + 45, w["y"] + 120), v_color, 2)
                    cv2.putText(frame, v_text, (w["x"] - 40, w["y"] - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.4, v_color, 1)

                    cv2.putText(frame, f"Worker: {w['name']}", (w['x'] - 45, w['y'] + 140), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

                    current_time = time.time()
                    if (not w["helmet"] or not w["vest"]) and (current_time - self.last_violation_time > self.violation_cooldown):
                        if random.random() < 0.05:
                            self._trigger_simulated_violation(w, frame)
                            self.last_violation_time = current_time

                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cv2.putText(frame, f"CAM01 - NORTH SITE | {now_str}", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                cv2.putText(frame, f"MODE: SIMULATION (DEMO)", (30, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                
                if frame_id % 20 < 10:
                    cv2.circle(frame, (1230, 35), 8, (0, 0, 255), -1)
                    cv2.putText(frame, "REC", (1170, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

            else:
                frame = np.zeros((720, 1280, 3), dtype=np.uint8)
                cv2.putText(frame, "REAL-MODE: Waiting for Camera Feed...", (200, 360), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)

            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

            elapsed = time.time() - t_start
            sleep_time = max(1.0 / 25.0 - elapsed, 0)
            time.sleep(sleep_time)
