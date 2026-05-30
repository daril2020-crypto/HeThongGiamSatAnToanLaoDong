# 🛡️ Hệ Thống Giám Sát An Toàn Lao Động Công Trường (Smart Construction Safety Monitoring)

> **Khóa Luận Tốt Nghiệp Ngành Khoa Học Máy Tính**  
> *Hệ thống giám sát trang bị bảo hộ lao động (Mũ bảo hiểm, Áo phản quang) thời gian thực sử dụng Trí Tuệ Nhân Tạo Học Sâu (YOLOv8), FastAPI Backend và ReactJS Glassmorphic Dashboard.*

---

## 🌟 Các Tính Năng Nổi Bật (Key Features)

* **🧠 Động cơ AI thời gian thực:** Nhận diện 5 lớp đối tượng cốt lõi: `Person` (Người), `Helmet` (Mũ bảo hiểm), `Vest` (Áo phản quang), `No-Helmet` (Không đội mũ), và `No-Vest` (Không mặc áo phản quang).
* **💻 Chế độ Hoạt động Kép Dự phòng (Dual-Mode Architecture):** 
  * *Chế độ Giả lập (Simulation Mode - Mặc định):* Động cơ suy luận động vẽ giàn giáo công trường di chuyển, mô phỏng công nhân hoạt động vật lý, phát hiện vi phạm và trigger sự cố tự động lên CSDL cục bộ (Đảm bảo chạy demo thuyết trình 100% thành công không phụ thuộc webcam hay GPU).
  * *Chế độ Thực tế (Real Mode):* Tải trọng trực tiếp mô hình YOLOv8 kết nối luồng camera RTSP/Webcam thực tế để giám sát tự động.
* **🗣️ Cảnh báo Giọng nói Tiếng Việt (Text-to-Speech Alert):** Phát trực tiếp cảnh báo âm thanh loa trình duyệt: *"Cảnh báo! Phát hiện lỗi vi phạm bảo hộ tại công trường!"* ngay khi phát hiện vi phạm mới.
* **🎨 Giao diện Glassmorphism Dark Mode:** Dashboard mang phong cách trung tâm chỉ huy tương lai, các thẻ chỉ số bán trong suốt, hiệu ứng camera scanline ngắm bắn ngọc lục bảo và micro-animations cảnh báo nhấp nháy.
* **📊 Đồ thị trực quan (Interactive Analytics):** Tích hợp Recharts thống kê tỷ lệ phần trăm tuân thủ an toàn lao động và biểu đồ vùng biểu diễn xu hướng vi phạm theo các khung giờ trong ngày.
* **📝 Nhật ký sự cố chi tiết (Incident Lightbox):** Tích hợp bảng danh sách sự cố hỗ trợ click xem ảnh phóng to kèm ô đỏ khoanh vùng vi phạm, cho phép giám sát viên điền ghi chú khắc phục và bấm nút "Xác nhận giải quyết".
* **🔬 Đánh giá khoa học (Scientific Metrics):** Jupyter Notebook tính toán Confusion Matrix, Precision-Recall Curve và F1-Score chuyên nghiệp bổ trợ cho báo cáo.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Backend AI & API:** FastAPI (Python), OpenCV, NumPy, Pillow, Uvicorn, SQLite.
* **Frontend Web App:** ReactJS, TailwindCSS, Recharts, Lucide Icons, Vite (Hỗ trợ cả chế độ Zero-Install HTML tĩnh).
* **CSDL & Phân tích:** SQL thô (SQLite3), Jupyter Notebook, Scikit-Learn, Matplotlib, Seaborn.

---

## 📂 Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
d:/Project/NLP/
├── backend/
│   ├── app/
│   │   ├── api.py           # REST API endpoints (stream camera, logs, stats, resolve)
│   │   ├── config.py        # Cấu hình hệ thống (mode, directory, model paths)
│   │   ├── database.py      # Kết nối SQLite và định nghĩa bảng violations
│   │   ├── inference.py     # Trái tim AI: Giả lập chuyển động công nhân và nhận diện YOLO
│   │   └── utils.py         # Sinh dữ liệu nền lịch sử 24h mẫu
│   ├── static/
│   │   ├── index.html       # Giao diện Dashboard React UMD Zero-Install chạy nhanh
│   │   └── violations/      # Thư mục lưu ảnh chụp vi phạm cắt từ camera
│   ├── main.py              # Điểm khởi chạy chính của máy chủ uvicorn
│   └── requirements.txt     # Các thư viện Python phụ thuộc
├── frontend/
│   ├── src/
│   │   ├── components/      # Các React Components (VideoFeed, LogTable, Analytics)
│   │   ├── App.jsx          # Component điều hướng chính và quản lý State/TTS
│   │   ├── App.css          # Design System Glassmorphism Dark Mode
│   │   └── main.jsx         # Khởi tạo React App
│   ├── index.html           # File HTML chuẩn SEO cho React Vite
│   ├── package.json         # Danh sách thư viện Node dependencies
│   └── vite.config.js       # Cấu hình dự án Vite
├── notebooks/
│   └── model_evaluation.ipynb # Jupyter Notebook phân tích độ chính xác mô hình học sâu
└── README.md                # Tài liệu hướng dẫn sử dụng dự án
```

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

### Chạy nhanh bằng Chế độ Zero-Install (Không cần cài Node.js/NPM)

1. **Di chuyển vào thư mục backend:**
   ```bash
   cd backend
   ```
2. **Cài đặt thư viện Python:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Khởi chạy máy chủ Backend:**
   ```bash
   python main.py
   ```
4. **Trải nghiệm ngay lập tức trên trình duyệt:**  
   Truy cập thẳng địa chỉ: 👉 **[http://localhost:8000/static/index.html](http://localhost:8000/static/index.html)** 👈

---

### Khởi chạy Full-stack hoàn chỉnh (React Vite + FastAPI)

#### 1. Khởi động Backend API
```bash
cd backend
python main.py
```
*(Giữ nguyên Terminal 1 chạy ngầm tại cổng `8000`)*

#### 2. Khởi động React Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*(Giữ nguyên Terminal 2 chạy ngầm tại cổng `5173`)*

3. **Mở trình duyệt truy cập:** `http://localhost:5173/` để xem giao diện hoàn chỉnh được cấu trúc gói npm.

---

## 🗄️ Cấu Trúc Bảng Cơ Sở Dữ Liệu (Database Schema)

### Bảng `violations`
| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | INTEGER (PK AUTOINCREMENT) | Mã định danh sự cố tự tăng |
| `timestamp` | TEXT | Thời điểm phát hiện vi phạm (YYYY-MM-DD HH:MM:SS) |
| `image_path` | TEXT | Đường dẫn URL tương đối đến ảnh chụp vi phạm |
| `violation_type` | TEXT | Phân loại lỗi (`No Helmet`, `No Vest`, `No Helmet & Vest`) |
| `severity` | TEXT | Mức độ nguy hiểm (`High` - thiếu cả hai, `Medium` - thiếu một) |
| `status` | TEXT | Trạng thái xử lý sự cố (`Unresolved`, `Resolved`) |
| `notes` | TEXT | Ghi chú biện pháp khắc phục của giám sát viên |

---

## 👨‍💻 Tác Giả & Bản Quyền

* **Đồ án Khóa Luận Tốt Nghiệp Đại Học** - Chuyên ngành Khoa học Máy tính.
* © 2026 Bản quyền thuộc về tác giả dự án. Nghiêm cấm mọi hành vi sao chép thương mại khi chưa được sự đồng ý.
