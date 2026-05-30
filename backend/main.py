import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import init_db
from app.utils import create_mock_historical_data
from app.api import router

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title=settings.API_TITLE,
    description="Hệ thống giám sát an toàn lao động công trường sử dụng học sâu",
    version="1.0.0"
)

# Cấu hình CORS cho phép kết nối từ React Frontend (hoạt động cổng 5173, 3000, v.v.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Cho phép tất cả các nguồn trong môi trường phát triển học tập
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi chạy các dịch vụ khi máy chủ khởi động (Startup Events)
@app.on_event("startup")
def on_startup():
    print("[*] Dang khoi chay he thong...")
    
    # 1. Khởi tạo cấu trúc các bảng CSDL SQLite
    init_db()
    print("[+] Da ket noi va thiet lap co so du lieu SQLite thanh cong.")
    
    # 2. Tạo trước dữ liệu lịch sử mẫu nếu rỗng
    create_mock_historical_data()
    
    print(f"[+] May chu da san sang tai http://{settings.HOST}:{settings.PORT}")

# Gắn thư mục tĩnh phục vụ việc lấy ảnh chụp vi phạm qua URL (ví dụ: http://localhost:8000/static/violations/abc.jpg)
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Tích hợp Router API chính
app.include_router(router)

# Chạy trực tiếp qua Python nếu được gọi
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True # Tự động tải lại mã nguồn khi thay đổi (rất hữu ích khi phát triển)
    )
