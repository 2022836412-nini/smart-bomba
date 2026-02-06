import { EsriResponse, EsriField, EsriFeature } from '../types';

export const parseCsvToEsri = (csvText: string): EsriResponse => {
  const lines: string[] = csvText.trim().split('\n');
  if (lines.length < 2) return { features: [], fields: [] };

  const headers: string[] = parseCSVLine(lines[0]);

  const fields: EsriField[] = headers.map((header: string) => ({
    name: header,
    alias: header,
    type: isNumeric(header)
      ? 'esriFieldTypeDouble'
      : 'esriFieldTypeString',
  }));

  const features: EsriFeature[] = lines.slice(1).map((line: string) => {
    const values: string[] = parseCSVLine(line);
    const attributes: Record<string, any> = {};

    headers.forEach((header: string, index: number) => {
      const val = values[index];
      if (typeof val === 'string') {
        const cleaned = val.replace(/[",]/g, '');
        attributes[header] =
          cleaned !== '' && !isNaN(Number(cleaned))
            ? Number(cleaned)
            : val.replace(/"/g, '');
      } else {
        attributes[header] = val ?? null;
      }
    });

    return { attributes };
  });

  return { features, fields };
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else current += char;
  }

  result.push(current.trim());
  return result;
}

function isNumeric(header: string): boolean {
  const keywords = [
    'JUMLAH','PANGGILAN','TAKSIRAN','PERATUS',
    'TAHUN','KM','KC','KS','PM','PC','PS'
  ];
  return keywords.some(k => header.toUpperCase().includes(k));
}
