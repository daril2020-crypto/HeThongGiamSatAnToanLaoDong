import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Clock, Eye, AlertTriangle, MessageSquare, Check, X } from 'lucide-react';

const LogTable = ({ violations, onResolve, backendUrl }) => {
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Hàm chuyển đổi nhãn thời gian sang định dạng dễ đọc tiếng Việt
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
             ' ' + date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const handleOpenModal = (v) => {
    setSelectedViolation(v);
    setResolutionNotes('');
  };

  const handleCloseModal = () => {
    setSelectedViolation(null);
  };

  const handleModalResolve = async () => {
    if (!selectedViolation) return;
    await onResolve(selectedViolation.id, resolutionNotes);
    handleCloseModal();
  };

  return (
    <div className="glass-card flex flex-col h-full border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-900/40 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-orange-500" size={18} />
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide">NHẬT KÝ SỰ CỐ VI PHẠM THỜI GIAN THỰC</h3>
        </div>
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold">
          Tổng số: {violations.length} vụ việc
        </span>
      </div>

      {/* Bảng Danh sách */}
      <div className="overflow-y-auto flex-1 max-h-[480px]">
        {violations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
            <CheckCircle size={40} className="text-emerald-500/40" />
            <p className="text-sm font-medium text-slate-400">Không có vi phạm nào được ghi nhận</p>
            <p className="text-xs">Hệ thống đang hoạt động an toàn tuyệt đối</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/20 text-[11px] font-bold text-slate-400 border-b border-white/5 uppercase tracking-wider">
                <th className="px-5 py-3">Thời gian</th>
                <th className="px-5 py-3">Loại vi phạm</th>
                <th className="px-5 py-3 text-center">Ảnh chụp</th>
                <th className="px-5 py-3">Mức độ</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-medium">
              {violations.map((v) => (
                <tr 
                  key={v.id} 
                  className={`hover:bg-white/[0.02] transition-colors ${
                    v.status === 'Unresolved' ? 'bg-red-500/[0.02]' : ''
                  }`}
                >
                  <td className="px-5 py-4 whitespace-nowrap text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-500" />
                      {formatTime(v.timestamp)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-200">
                      {v.violation_type === 'No Helmet' && 'Chưa đội mũ bảo hộ'}
                      {v.violation_type === 'No Vest' && 'Chưa mặc áo phản quang'}
                      {v.violation_type === 'No Helmet & Vest' && 'Thiếu cả Mũ & Áo phản quang'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="relative inline-block group cursor-pointer" onClick={() => handleOpenModal(v)}>
                      <img 
                        src={`${backendUrl}${v.image_path}`} 
                        alt="Violation snapshot" 
                        className="w-10 h-7 object-cover rounded border border-white/10 group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
                        <Eye size={10} className="text-white" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.severity === 'High' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {v.severity === 'High' ? 'Nghiêm trọng' : 'Trung bình'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1 text-[11px] ${
                      v.status === 'Resolved' 
                        ? 'text-emerald-400' 
                        : 'text-rose-400 animate-pulse font-bold'
                    }`}>
                      {v.status === 'Resolved' ? (
                        <>
                          <CheckCircle size={12} />
                          <span>Đã xử lý</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={12} />
                          <span>Cảnh báo</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(v)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 rounded-lg transition-all"
                        title="Xem chi tiết sự cố"
                      >
                        <Eye size={13} />
                      </button>
                      {v.status === 'Unresolved' && (
                        <button 
                          onClick={() => onResolve(v.id)}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-400 border border-emerald-500/20 rounded-lg transition-all"
                          title="Giải quyết nhanh sự cố"
                        >
                          <Check size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Lightbox / Modal Chi tiết Sự cố */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card max-w-2xl w-full border-orange-500/20 overflow-hidden relative shadow-2xl shadow-black/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-900 border-b border-white/5">
              <h4 className="font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={18} />
                <span>CHI TIẾT LỖI VI PHẠM THỜI GIAN THỰC</span>
              </h4>
              <button 
                onClick={handleCloseModal}
                className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Bên trái: Bức ảnh chụp lỗi */}
              <div className="bg-slate-950 p-4 flex items-center justify-center relative min-h-[300px]">
                <img 
                  src={`${backendUrl}${selectedViolation.image_path}`} 
                  alt="Full resolution violation snapshot"
                  className="max-h-[320px] max-w-full object-contain rounded border border-white/5 shadow-lg"
                />
                <span className="absolute top-6 left-6 px-2 py-0.5 rounded bg-red-600/90 text-white font-mono text-[9px] font-bold tracking-wider">
                  CAMERA 01 CAPTURED
                </span>
              </div>

              {/* Bên phải: Metadata & Phản hồi */}
              <div className="p-5 flex flex-col justify-between bg-slate-900/60">
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mã sự cố</span>
                    <h5 className="font-mono text-xs text-orange-400 font-bold">#SAFE-INC-{selectedViolation.id}</h5>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Thời điểm phát hiện</span>
                    <p className="text-xs text-slate-200">{formatTime(selectedViolation.timestamp)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dạng vi phạm</span>
                    <p className="text-sm font-semibold text-slate-100">
                      {selectedViolation.violation_type === 'No Helmet' && 'Chưa đội mũ bảo hộ công trường'}
                      {selectedViolation.violation_type === 'No Vest' && 'Chưa mặc áo phản quang'}
                      {selectedViolation.violation_type === 'No Helmet & Vest' && 'Thiếu cả Mũ bảo hộ & Áo phản quang'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mô tả sự kiện</span>
                    <p className="text-xs text-slate-300 italic bg-white/5 p-2.5 rounded border border-white/5 mt-1 leading-relaxed">
                      {selectedViolation.notes || "Không có ghi chú thêm từ máy chủ AI."}
                    </p>
                  </div>
                </div>

                {/* Xử lý cảnh báo */}
                <div className="mt-6 pt-4 border-t border-white/5">
                  {selectedViolation.status === 'Unresolved' ? (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <MessageSquare size={10} />
                        <span>Ý KIẾN / BIỆN PHÁP KHẮC PHỤC</span>
                      </label>
                      <input 
                        type="text" 
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Ví dụ: Đã nhắc nhở trực tiếp công nhân đeo mũ..."
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <button 
                        onClick={handleModalResolve}
                        className="w-full mt-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
                      >
                        <CheckCircle size={14} />
                        Xác Nhận Giải Quyết Sự Cố
                      </button>
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400">
                      <CheckCircle size={16} />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Đã Giải Quyết Xong</span>
                        <span className="text-[10px] text-emerald-400/80">Sự cố đã được ghi nhận biện pháp khắc phục thành công</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogTable;
