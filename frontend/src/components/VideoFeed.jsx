import React, { useState, useEffect } from 'react';
import { Camera, Radio, ShieldAlert, Cpu, RefreshCw } from 'lucide-react';

const VideoFeed = ({ backendUrl, activeWorkers }) => {
  const [streamActive, setStreamActive] = useState(true);
  const [fps, setFps] = useState(25);
  const [timestamp, setTimestamp] = useState('');

  // Cập nhật nhãn thời gian OSD chạy thời gian thực trên giao diện
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimestamp(now.toLocaleString('vi-VN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Giả lập dao động nhẹ của FPS để tạo cảm giác thực tế
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(23 + Math.random() * 3));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleReconnect = () => {
    setStreamActive(false);
    setTimeout(() => setStreamActive(true), 500);
  };

  return (
    <div className="glass-card overflow-hidden relative border-orange-500/20">
      {/* Header của khung Camera */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/60 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </div>
          <span className="font-semibold text-slate-200 text-sm tracking-wide">CAMERA 01 - KHU VỰC PHÍA BẮC</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20">
            <Radio size={12} className="animate-pulse" />
            <span>LIVE</span>
          </div>
          <button 
            onClick={handleReconnect}
            className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Làm mới luồng camera"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Vùng hiển thị luồng Camera */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        {streamActive ? (
          <img 
            src={`${backendUrl}/api/stream?t=${new Date().getTime()}`}
            alt="Safety Camera Live Stream Feed"
            className="w-full h-full object-cover"
            onError={() => setStreamActive(false)}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-500 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-2 animate-bounce">
              <ShieldAlert size={28} />
            </div>
            <h4 className="font-semibold text-slate-300">Mất Kết Nối Luồng Camera</h4>
            <p className="text-xs max-w-sm">Hãy đảm bảo máy chủ Backend đang hoạt động trên cổng 8000 và nhấn nút kết nối lại phía bên dưới.</p>
            <button 
              onClick={() => setStreamActive(true)}
              className="mt-2 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-medium rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
            >
              <RefreshCw size={12} />
              Thử Kết Nối Lại
            </button>
          </div>
        )}

        {/* HUD Camera Overlay (Hiệu ứng giao diện trung tâm chỉ huy) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 font-mono text-[10px] text-emerald-400 tracking-wider">
          {/* Góc trên */}
          <div className="flex justify-between w-full">
            <div className="bg-black/60 px-2 py-1 rounded backdrop-blur-sm flex items-center gap-2 border border-emerald-500/10">
              <span className="font-bold text-red-500 animate-pulse">● REC</span>
              <span>1080P FHD</span>
            </div>
            <div className="bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-emerald-500/10">
              {fps} FPS | LATENCY: ~45ms
            </div>
          </div>
          
          {/* Góc dưới */}
          <div className="flex justify-between w-full items-end">
            <div className="bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-emerald-500/10 flex items-center gap-1.5">
              <Cpu size={10} className="text-orange-400" />
              <span>AI DETECT: {activeWorkers} ACTIVE WORKERS</span>
            </div>
            <div className="bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-emerald-500/10">
              {timestamp}
            </div>
          </div>

          {/* Góc chữ L mô phỏng lưới ngắm camera */}
          <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-emerald-500/30"></div>
          <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-emerald-500/30"></div>
          <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-emerald-500/30"></div>
          <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-emerald-500/30"></div>
        </div>
      </div>
      
      {/* Footer chứa thanh mô tả tiện ích */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1">
          <Camera size={12} className="text-orange-500" />
          <span>Vị trí lắp: Giàn giáo chính Tòa nhà A</span>
        </span>
        <span className="text-emerald-400/80">YOLOv8 Inference: 14.2ms</span>
      </div>
    </div>
  );
};

export default VideoFeed;
