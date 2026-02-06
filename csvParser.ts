
import { EsriResponse } from '../types';

export const parseCsvToEsri = (csvText: string): EsriResponse => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return { features: [], fields: [] };

  const headers = parseCSVLine(lines[0]);
  const fields = headers.map(header => ({
    name: header,
    alias: header,
    type: isNumeric(header) ? 'esriFieldTypeDouble' : 'esriFieldTypeString'
  }));

  const features = lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const attributes: Record<string, any> = {};
    headers.forEach((header, index) => {
      let val = values[index];
      // Clean numeric values (remove commas and quotes)
      if (val && typeof val === 'string') {
        const cleaned = val.replace(/[",]/g, '');
        if (!isNaN(Number(cleaned)) && cleaned !== '') {
          attributes[header] = Number(cleaned);
        } else {
          attributes[header] = val.replace(/"/g, '');
        }
      } else {
        attributes[header] = val;
      }
    });
    return { attributes };
  });

  return { features, fields };
};

function parseCSVLine(line: string): string[] {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

function isNumeric(header: string): boolean {
  // Simple heuristic for field types based on headers
  const numericKeywords = ['JUMLAH', 'PANGGILAN', 'TAKSIRAN', 'PERATUS', 'TAHUN', 'KM', 'KC', 'KS', 'PM', 'PC', 'PS'];
  return numericKeywords.some(k => header.toUpperCase().includes(k));
}
