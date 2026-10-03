import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Car, 
  Users, 
  TrendingUp, 
  Leaf, 
  ShieldAlert, 
  Download, 
  LayoutDashboard, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { KPICard } from '../components/ui/KPICard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// Trend area chart data
const TREND_DATA = [
  { day: 'Mon', rides: 240, co2Kg: 860 },
  { day: 'Tue', rides: 310, co2Kg: 1120 },
  { day: 'Wed', rides: 345, co2Kg: 1240 },
  { day: 'Thu', rides: 320, co2Kg: 1150 },
  { day: 'Fri', rides: 213, co2Kg: 772 },
];

// Top corridors bar chart data
const CORRIDOR_DATA = [
  { corridor: 'Kondapur → Mindspace', trips: 420 },
  { corridor: 'Miyapur → Fin District', trips: 360 },
  { corridor: 'Gachibowli → Cyber Towers', trips: 315 },
  { corridor: 'Jubilee Hills → HITEC', trips: 210 },
  { corridor: 'Kukatpally → DLF', trips: 185 },
];

// Peak hours heatmap matrix (Days x Time slots)
const HEATMAP_HOURS = ['07:30', '08:00', '08:30', '09:00', '09:30', '17:30', '18:00', '18:30', '19:00'];
const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Values 0 to 4 intensity
const HEATMAP_VALUES: Record<string, number[]> = {
  Mon: [1, 3, 4, 4, 2, 2, 4, 3, 1],
  Tue: [2, 3, 4, 4, 3, 3, 4, 4, 2],
  Wed: [2, 4, 4, 4, 3, 3, 4, 4, 2],
  Thu: [1, 3, 4, 4, 2, 2, 4, 3, 1],
  Fri: [1, 2, 3, 2, 1, 3, 3, 2, 1],
};

const getHeatColor = (intensity: number) => {
  switch (intensity) {
    case 4:
      return 'bg-[#2B8CEB] text-white'; // Peak
    case 3:
      return 'bg-[#4DA8FF] text-[#0F1B2D]'; // High
    case 2:
      return 'bg-[#BEE0FF] text-[#0F1B2D]'; // Medium
    case 1:
      return 'bg-[#E8F3FF] text-[#2B8CEB]'; // Low
    default:
      return 'bg-[#F5FAFF] text-[#5B6B80]'; // Min
  }
};

const SOS_LOGS = [
  {
    id: 'SOS-8012',
    date: 'Today, 08:52 AM',
    carpoolId: 'RIDE-1049',
    employee: 'Ananya Sharma',
    driver: 'Rahul Varma',
    route: 'Kondapur → Mindspace',
    status: 'Resolved (False alarm)',
    resolutionTime: '1m 24s',
    isSafe: true,
  },
  {
    id: 'SOS-7984',
    date: 'Yesterday, 06:14 PM',
    carpoolId: 'RIDE-1033',
    employee: 'Priya Rao',
    driver: 'Suresh Kumar',
    route: 'Cyber Towers → Miyapur',
    status: 'Resolved (Route deviation check)',
    resolutionTime: '2m 10s',
    isSafe: true,
  },
  {
    id: 'SOS-7740',
    date: '30 Sep, 09:05 AM',
    carpoolId: 'RIDE-0988',
    employee: 'Kavita Reddy',
    driver: 'Alex Mercer',
    route: 'Gachibowli → DLF',
    status: 'Resolved (Support verified)',
    resolutionTime: '1m 45s',
    isSafe: true,
  },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSidebar, setSelectedSidebar] = useState<'overview' | 'corridors' | 'heatmap' | 'sos'>('overview');

  const handleExportCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [
      'Metric,Value,Unit',
      'Rides Shared,1428,rides',
      'Seat Utilization,78.5,%',
      'Distance Saved,42850,km',
      'CO2 Offset,5142,kg',
    ].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', 'ridesync_corporate_esg_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F5FAFF] flex">
      {/* 1. Left Icon Sidebar (Desktop Layout) */}
      <aside className="w-16 sm:w-20 bg-white border-r border-[#E3ECF5] flex flex-col items-center py-5 justify-between shrink-0 shadow-xs">
        <div className="flex flex-col items-center gap-6">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/dashboard')}
            className="w-11 h-11 rounded-2xl bg-[#4DA8FF] text-[#0F1B2D] flex items-center justify-center font-black cursor-pointer shadow-xs hover:scale-105 transition-transform"
            title="RideSync Home"
          >
            <Car className="w-6 h-6 stroke-[2.2]" />
          </div>

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedSidebar('overview')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                selectedSidebar === 'overview'
                  ? 'bg-[#E8F3FF] text-[#2B8CEB] font-bold'
                  : 'text-[#5B6B80] hover:bg-[#F5FAFF]'
              }`}
              title="Overview & Trends"
            >
              <LayoutDashboard className="w-5 h-5" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={() => setSelectedSidebar('corridors')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                selectedSidebar === 'corridors'
                  ? 'bg-[#E8F3FF] text-[#2B8CEB] font-bold'
                  : 'text-[#5B6B80] hover:bg-[#F5FAFF]'
              }`}
              title="Top Corridors"
            >
              <MapPin className="w-5 h-5" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={() => setSelectedSidebar('heatmap')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                selectedSidebar === 'heatmap'
                  ? 'bg-[#E8F3FF] text-[#2B8CEB] font-bold'
                  : 'text-[#5B6B80] hover:bg-[#F5FAFF]'
              }`}
              title="Peak Hours Heatmap"
            >
              <Clock className="w-5 h-5" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={() => setSelectedSidebar('sos')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                selectedSidebar === 'sos'
                  ? 'bg-[#FFEBEB] text-[#E5484D] font-bold'
                  : 'text-[#5B6B80] hover:bg-[#F5FAFF]'
              }`}
              title="SOS Audit Logs"
            >
              <ShieldAlert className="w-5 h-5" strokeWidth={2} />
            </button>
          </nav>
        </div>

        {/* Back to Commute App */}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#5B6B80] hover:text-[#0F1B2D] hover:bg-[#F5FAFF] transition-all"
          title="Return to User Commute"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 p-5 sm:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#E8F3FF] text-[#2B8CEB]">
                Enterprise Console
              </span>
              <span className="text-xs text-[#5B6B80]">Microsoft IDC • Sustainability & Safety</span>
            </div>
            <h1 className="text-24 sm:text-28 font-bold text-[#0F1B2D] tracking-tight mt-1">
              Admin & ESG Analytics
            </h1>
            <p className="text-xs text-[#5B6B80]">
              Real-time seat efficiency, carbon offset reduction, corridor loads, and emergency logs.
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={handleExportCSV}
            className="self-start sm:self-auto flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#2B8CEB]" />
            <span>Export ESG Report</span>
          </Button>
        </div>

        {/* Top Row: 4 KPI Cards (rides shared, seat utilization %, km saved, CO2 saved) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Rides Shared"
            value="1,428"
            unit="trips"
            change="+18.4%"
            isPositive={true}
            icon={Car}
            subtext="vs last month"
          />
          <KPICard
            label="Seat Utilization"
            value="78.5"
            unit="%"
            change="+5.2%"
            isPositive={true}
            icon={Users}
            subtext="average occupancy"
          />
          <KPICard
            label="Km Saved"
            value="42,850"
            unit="km"
            change="+12.6%"
            isPositive={true}
            icon={TrendingUp}
            subtext="solo travel avoided"
          />
          <KPICard
            label="CO2 Saved"
            value="5,142"
            unit="kg"
            change="+24.1%"
            isPositive={true}
            icon={Leaf}
            subtext="Scope 3 emissions cut"
          />
        </div>

        {/* Charts Row: Light-Blue Area Chart for Trends & Bar Chart for Top Corridors */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Light-Blue Area Chart */}
          <div className="lg:col-span-7 bg-white border border-[#E3ECF5] rounded-2xl p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F1B2D]">Weekly Commute Volume</h3>
                <p className="text-xs text-[#5B6B80]">Daily completed carpools along tech corridors</p>
              </div>
              <Badge variant="status">Mon – Fri</Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4DA8FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4DA8FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    stroke="#5B6B80"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#E3ECF5' }}
                  />
                  <YAxis
                    stroke="#5B6B80"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#E3ECF5' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E3ECF5',
                      boxShadow: '0 4px 20px rgba(43,140,235,0.10)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rides"
                    stroke="#2B8CEB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#blueArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart for Top Corridors */}
          <div className="lg:col-span-5 bg-white border border-[#E3ECF5] rounded-2xl p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F1B2D]">Top Commute Corridors</h3>
                <p className="text-xs text-[#5B6B80]">Monthly trips per corporate lane</p>
              </div>
              <Badge variant="neutral">Ranked</Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CORRIDOR_DATA} layout="vertical" margin={{ top: 5, right: 15, left: 35, bottom: 5 }}>
                  <XAxis type="number" stroke="#5B6B80" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="corridor"
                    type="category"
                    stroke="#0F1B2D"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    tickFormatter={(val) => val.split('→')[0].trim()}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E3ECF5',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="trips" fill="#4DA8FF" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Peak-Hours Heatmap in Blue Shades */}
        <div className="bg-white border border-[#E3ECF5] rounded-2xl p-5 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#0F1B2D]">Peak Hours Commute Heatmap</h3>
              <p className="text-xs text-[#5B6B80]">Traffic concentration and carpooling density across commute windows</p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#5B6B80]">
              <span>Low</span>
              <div className="w-3.5 h-3.5 rounded bg-[#E8F3FF]" />
              <div className="w-3.5 h-3.5 rounded bg-[#BEE0FF]" />
              <div className="w-3.5 h-3.5 rounded bg-[#4DA8FF]" />
              <div className="w-3.5 h-3.5 rounded bg-[#2B8CEB]" />
              <span>Peak</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[620px] space-y-2">
              {/* Header Time Slots */}
              <div className="grid grid-cols-10 gap-2 text-center text-[11px] font-semibold text-[#5B6B80]">
                <div className="text-left font-bold text-[#0F1B2D]">Day</div>
                {HEATMAP_HOURS.map((h) => (
                  <div key={h}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              {HEATMAP_DAYS.map((day) => {
                const values = HEATMAP_VALUES[day] || [];
                return (
                  <div key={day} className="grid grid-cols-10 gap-2 items-center">
                    <span className="text-xs font-bold text-[#0F1B2D] text-left">{day}</span>
                    {values.map((v, idx) => (
                      <div
                        key={idx}
                        className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${getHeatColor(
                          v
                        )}`}
                        title={`${day} at ${HEATMAP_HOURS[idx]}: Intensity Level ${v}`}
                      >
                        {v > 2 ? `${v * 24}` : ''}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SOS Incident Log Table */}
        <div className="bg-white border border-[#E3ECF5] rounded-2xl p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFEBEB] text-[#E5484D] flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F1B2D]">SOS Emergency Incident Audit</h3>
                <p className="text-xs text-[#5B6B80]">100% telemetry resolution compliance with Corporate Safety Desk</p>
              </div>
            </div>
            <Badge variant="success">All Safe</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3ECF5] text-[#5B6B80] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Alert ID</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Rider / Host</th>
                  <th className="py-2.5 px-3">Corridor</th>
                  <th className="py-2.5 px-3">Response Time</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3ECF5]">
                {SOS_LOGS.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F5FAFF] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#2B8CEB]">{log.id}</td>
                    <td className="py-3 px-3 text-[#5B6B80]">{log.date}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#0F1B2D] block">{log.employee}</span>
                      <span className="text-[11px] text-[#5B6B80]">Driver: {log.driver}</span>
                    </td>
                    <td className="py-3 px-3 text-[#0F1B2D]">{log.route}</td>
                    <td className="py-3 px-3 font-semibold text-[#22B07D]">{log.resolutionTime}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22B07D] bg-[#EBFBF5] px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
