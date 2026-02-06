import React from 'react';
import { EsriResponse, EsriFeature, EsriField } from '../types';

interface Props {
  data: EsriResponse | null;
}

const DataPreview: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const fields = data.fields.slice(0, 6);
  const rows = data.features.slice(0, 5);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          {fields.map((f: EsriField) => (
            <th key={f.name}>{f.alias ?? f.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row: EsriFeature, i: number) => (
          <tr key={i}>
            {fields.map((f: EsriField) => (
              <td key={f.name}>
                {String(row.attributes[f.name] ?? '-')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataPreview;
