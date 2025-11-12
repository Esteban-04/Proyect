export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2 code
  count: number;
  clubs?: string[];
}
