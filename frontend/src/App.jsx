import React, { useState, useEffect, useRef } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Users, Activity, CheckSquare, RefreshCw } from 'lucide-react';
import VideoFeed from './components/VideoFeed';
import LogTable from './components/LogTable';
import Analytics from './components/Analytics';

const App = () => {
  const [violations, setViolations] = useState([]);
  const [statistics, setStatistics] = useState({
    cards: {
      totalViolations: 0,
      unresolvedCount: 0,
      resolvedCount: 0,
      resolutionRate: 100,
      complianceRate: 94.2,
      activeWorkers: 3
    },
    typeDistribution: [
      { name: "Thiếu mũ bảo hộ", value: 0, color: "#f59e0b" },
      { name: "Thiếu áo phản quang", value: 0, color: "#3b82f6" },
      { name: "Thiếu cả hai", value: 0, color: "#ef4444" }
    ],
    hourlyTrend: []
  });
  
  const [backendUrl] = useState('http://127.0.0.1:8000');
  const [backendConnected, setBackendConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const prevUnresolvedCount = useRef(0);

  // Hàm gọi API đồng bộ dữ liệu từ FastAPI Backend
  const fetchData = async () => {
    setIsSyncing(true);
    try {
      // 1. Fetch danh sách sự cố
      const resLogs = await fetch(`${backendUrl}/api/violations`);
      if (!resLogs.ok) throw new Error('Không thể tải danh sách vi phạm');
      const dataLogs = await resLogs.json();
      setViolations(dataLogs);

      // 2. Fetch dữ liệu thống kê phân tích
      const resStats = await fetch(`${backendUrl}/api/statistics`);
      if (!resStats.ok) throw new Error('Không thể tải thống kê');
      const dataStats = await resStats.json();
      setStatistics(dataStats);
      
      setBackendConnected(true);

      // 3. Cơ chế cảnh báo bằng giọng nói thông minh (TTS) khi có vi phạm mới
      const currentUnresolved = dataStats.cards.unresolvedCount;
      if (currentUnresolved > prevUnresolvedCount.current) {
        triggerVoiceAlert();
      }
      prevUnresolvedCount.current = currentUnresolved;

    } catch (error) {
      console.error("[!] Lỗi đồng bộ dữ liệu API:", error);
      setBackendConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Phát giọng nói cảnh báo sử dụng Web Speech Synthesis tích hợp sẵn trên Trình duyệt
  const triggerVoiceAlert = () => {
    if ('speechSynthesis' in window) {
      // Hủy bỏ các giọng nói đang phát dở
      window.speechSynthesis.cancel();
      
      const textToSpeak = "Cảnh báo! Phát hiện lỗi vi phạm bảo hộ tại công trường!";
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95; // Tốc độ đọc vừa phải, rõ ràng
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Khởi chạy đồng bộ lần đầu và thiết lập Polling cập nhật mỗi 4 giây
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý sự kiện xác nhận giải quyết sự cố từ người dùng
  const handleResolveViolation = async (id, notes = '') => {
    try {
      const res = await fetch(`${backendUrl}/api/violations/${id}/resolve?notes=${encodeURIComponent(notes)}`, {
        method: 'PUT'
      });
      if (res.ok) {
        // Cập nhật cục bộ ngay lập tức để giao diện phản hồi mượt mà không có độ trễ
        setViolations(prev => 
          prev.map(v => v.id === id ? { ...v, status: 'Resolved', notes: notes || v.notes } : v)
        );
        // Kích hoạt đồng bộ lại CSDL để cập nhật các biểu đồ thống kê tương ứng
        fetchData();
      }
    } catch (e) {
      console.error("[!] Lỗi giải quyết vi phạm:", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-orange-500/30 selection:text-white">
      {/* 1. Header cao cấp */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-10 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shadow-lg shadow-orange-500/5">
            <Shield size={24} className="animate-pulse" />
          </div>
          <div className="flex flex-col text-center sm:text-left">
            <h1 className="text-base md:text-lg font-extrabold tracking-wider bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
              HỆ THỐNG GIÁM SÁT AN TOÀN LAO ĐỘNG
            </h1>
            <span className="text-[10px] text-slate-400 tracking-widest font-semibold uppercase mt-0.5">
              CÔNG NGHỆ NHẬN DIỆN HỌC SÂU THỜI GIAN THỰC (YOLOv8 & REACT)
            </span>
          </div>
        </div>

        {/* Trạng thái kết nối máy chủ */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${backendConnected ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse' : 'bg-red-500 animate-ping'}`} />
            <span className="text-xs font-semibold text-slate-400">
              {backendConnected ? 'MÁY CHỦ HOẠT ĐỘNG' : 'MẤT KẾT NỐI MÁY CHỦ'}
            </span>
          </div>
          <button 
            onClick={fetchData}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-medium transition-all ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            <span>Đồng bộ</span>
          </button>
        </div>
      </header>

      {/* 2. Nội dung Dashboard chính */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
        
        {/* Hàng 1: Thẻ thống kê KPIs nổi bật */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Card 1: Tỷ lệ tuân thủ */}
          <div className="glass-card p-5 border-emerald-500/10 hover:border-emerald-500/20 shadow-emerald-950/10 flex items-center justify-between group transition-all">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wider">TỶ LỆ TUÂN THỦ</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight group-hover:scale-105 transition-transform">
                {statistics.cards.complianceRate}%
              </h2>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 transition-all">
              <ShieldCheck size={20} />
            </div>
          </div>

          {/* Card 2: Vi phạm hiện tại */}
          <div className="glass-card p-5 border-rose-500/10 hover:border-rose-500/20 shadow-rose-950/10 flex items-center justify-between group transition-all">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wider">CẢNH BÁO CHƯA XỬ LÝ</span>
              <h2 className={`text-2xl md:text-3xl font-extrabold font-mono tracking-tight group-hover:scale-105 transition-transform ${
                statistics.cards.unresolvedCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'
              }`}>
                {statistics.cards.unresolvedCount}
              </h2>
            </div>
            <div className={`p-3 rounded-xl border transition-all ${
              statistics.cards.unresolvedCount > 0 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:bg-rose-500/20' 
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              <ShieldAlert size={20} />
            </div>
          </div>

          {/* Card 3: Số nhân sự đang giám sát */}
          <div className="glass-card p-5 border-sky-500/10 hover:border-sky-500/20 shadow-sky-950/10 flex items-center justify-between group transition-all">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wider">NHÂN SỰ ĐANG GIÁM SÁT</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-sky-400 font-mono tracking-tight group-hover:scale-105 transition-transform">
                {statistics.cards.activeWorkers}
              </h2>
            </div>
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl group-hover:bg-sky-500/20 transition-all">
              <Users size={20} />
            </div>
          </div>

          {/* Card 4: Tỷ lệ giải quyết sự cố */}
          <div className="glass-card p-5 border-violet-500/10 hover:border-violet-500/20 shadow-violet-950/10 flex items-center justify-between group transition-all">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wider">TỶ LỆ GIẢI QUYẾT LỖI</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-violet-400 font-mono tracking-tight group-hover:scale-105 transition-transform">
                {statistics.cards.resolutionRate}%
              </h2>
            </div>
            <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl group-hover:bg-violet-500/20 transition-all">
              <CheckSquare size={20} />
            </div>
          </div>
        </section>

        {/* Hàng 2: Grid phối hợp Camera Stream và Ticker Sự cố */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Cột Camera - chiếm 5/12 phần màn hình */}
          <div className="lg:col-span-5 flex flex-col">
            <VideoFeed 
              backendUrl={backendUrl} 
              activeWorkers={statistics.cards.activeWorkers}
            />
          </div>

          {/* Cột Nhật ký sự cố - chiếm 7/12 phần màn hình */}
          <div className="lg:col-span-7 flex flex-col">
            <LogTable 
              violations={violations} 
              onResolve={handleResolveViolation} 
              backendUrl={backendUrl}
            />
          </div>
        </section>

        {/* Hàng 3: Khung Thống kê Biểu đồ Phân tích */}
        <section className="flex flex-col">
          <Analytics statistics={statistics} />
        </section>
        
      </main>
      {/* 3. Footer chuyên nghiệp */}
    </div>
  );
};

export default App;
