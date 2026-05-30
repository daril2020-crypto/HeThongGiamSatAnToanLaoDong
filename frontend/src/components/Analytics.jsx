import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { TrendingUp, BarChart2, PieChart as PieIcon, ShieldCheck, AlertTriangle } from 'lucide-react';

const Analytics = ({ statistics }) => {
  const { cards, typeDistribution, hourlyTrend } = statistics;

  // Custom Tooltip cho đồ thị để hợp với tông màu tối Glassmorphism
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-white/10 backdrop-blur-md px-3 py-2 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-slate-400 mb-1">{`Giờ: ${label}`}</p>
          <p className="text-red-400 font-bold">{`Số vụ: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
      {/* Đồ thị Xu hướng Vi phạm 24 giờ qua */}
      <div className="glass-card p-5 flex flex-col border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-orange-500" size={16} />
          <h3 className="font-semibold text-slate-200 text-sm tracking-wide">XU HƯỚNG SỰ CỐ VI PHẠM (24 GIỜ QUA)</h3>
        </div>
        
        <div className="flex-1 w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="violations" 
                stroke="#f97316" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorViolations)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Đồ thị Phân bố loại lỗi vi phạm */}
      <div className="glass-card p-5 flex flex-col border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <PieIcon className="text-orange-500" size={16} />
          <h3 className="font-semibold text-slate-200 text-sm tracking-wide">PHÂN LOẠI THỐNG KÊ LỖI TUÂN THỦ</h3>
        </div>
        
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="w-[180px] h-[180px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Vòng tròn phần trăm chính giữa */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tuân thủ</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">{cards.complianceRate}%</span>
            </div>
          </div>
          
          {/* Nhãn chú thích bên cạnh đồ thị */}
          <div className="flex flex-col gap-2 text-xs font-semibold text-slate-300 w-full sm:w-auto">
            {typeDistribution.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/[0.02] border border-white/5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-400 flex-1">{entry.name}:</span>
                <span className="font-mono text-slate-200 font-bold">{entry.value} vụ</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
