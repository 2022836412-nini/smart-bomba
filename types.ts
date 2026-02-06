
export interface EsriAttribute {
  [key: string]: any;
}

export interface EsriFeature {
  attributes: EsriAttribute;
  geometry?: any;
}

export interface EsriResponse {
  features: EsriFeature[];
  fields: {
    name: string;
    type: string;
    alias: string;
  }[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AnalysisResult {
  summary: string;
  counts: Record<string, number>;
  insights: string[];
}
