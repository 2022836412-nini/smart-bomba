import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { EsriResponse, EsriField, EsriFeature } from '../types';

interface Props {
  data: EsriResponse | null;
}

const COLORS = ['#ea580c','#f97316','#fbbf24','#f59e0b','#78350f'];

const AnalysisCharts: React.FC<Props> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data) return [];

    const field = data.fields.find(
      (f: EsriField) => f.type.includes('String')
    );
    if (!field) return [];

    const counts: Record<string, number> = {};

    data.features.forEach((f: EsriFeature) => {
      const v = f.attributes[field.name] ?? 'Tiada Data';
      counts[v] = (counts[v] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 6);
  }, [data]);

  if (!chartData.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ResponsiveContainer height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value">
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <ResponsiveContainer height={300}>
        <PieChart>
          <Pie data={chartData} dataKey="value" outerRadius={100}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalysisCharts;
