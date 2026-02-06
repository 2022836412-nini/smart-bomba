
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { EsriResponse } from '../types';

interface AnalysisChartsProps {
  data: EsriResponse | null;
}

// Warm Palette (Orange, Amber, Yellow, Deep Orange)
const COLORS = ['#ea580c', '#f97316', '#fbbf24', '#f59e0b', '#78350f', '#f97316'];

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data) return [];
    
    const stringFields = data.fields.filter(f => f.type.includes('String'));
    if (stringFields.length === 0) return [];

    const fieldToSummarize = stringFields[0].name;
    const counts: Record<string, number> = {};

    data.features.forEach(f => {
      const val = f.attributes[fieldToSummarize] || 'Tiada Data';
      counts[val] = (counts[val] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [data]);

  if (!data || chartData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
        <h4 className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider">Taburan Panggilan Mengikut Wilayah</h4>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex flex-col items-center">
         <h4 className="text-xs font-bold text-slate-500 mb-6 w-full uppercase tracking-wider text-left">Komposisi Data Analisis</h4>
         <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={60}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalysisCharts;
