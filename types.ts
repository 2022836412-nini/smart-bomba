export interface EsriField {
  name: string;
  alias?: string;
  type: string;
}

export interface EsriFeature {
  attributes: Record<string, any>;
}

export interface EsriResponse {
  fields: EsriField[];
  features: EsriFeature[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
