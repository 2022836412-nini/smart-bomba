
import React from 'react';
import { EsriFeature, EsriResponse } from '../types';

interface DataPreviewProps {
  data: EsriResponse | null;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  if (!data || !data.features.length) return null;

  const fields = data.fields.slice(0, 6); 
  const rows = data.features.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Pratonton Data ({data.features.length} rekod)
        </h3>
        <span className="text-[10px] font-bold text-slate-400">SUMBER: FEATURE SERVICE</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/50">
            <tr>
              {fields.map(f => (
                <th key={f.name} className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">{f.alias || f.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                {fields.map(f => (
                  <td key={f.name} className="py-3 px-4 truncate max-w-[200px]">
                    {String(row.attributes[f.name] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 italic">
        Menunjukkan 5 rekod teratas
      </div>
    </div>
  );
};

export default DataPreview;
