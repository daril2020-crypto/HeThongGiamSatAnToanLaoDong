import os

class Settings:
    # Cấu hình chung
    API_TITLE: str = "Construction Safety Monitoring API"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Chế độ chạy: "simulation" hoặc "real"
    # Mặc định là "simulation" (Giả lập thông minh)
    MODE: str = os.getenv("APP_MODE", "simulation")
    
    # Cấu hình cơ sở dữ liệu
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'safety_data.db')}"
    
    # Thư mục lưu trữ hình ảnh vi phạm
    STATIC_DIR: str = os.path.join(BASE_DIR, "static")
    VIOLATIONS_DIR: str = os.path.join(STATIC_DIR, "violations")
    
    # Đường dẫn mô hình YOLOv8 thực tế
    YOLO_MODEL_PATH: str = os.path.join(BASE_DIR, "..", "models", "yolov8n.pt")

# Khởi tạo instance cấu hình
settings = Settings()

# Đảm bảo các thư mục tĩnh và lưu ảnh tồn tại
os.makedirs(settings.VIOLATIONS_DIR, exist_ok=True)
