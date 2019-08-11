export interface Columns {
  [key: string]: string[];
  template: string[];
  'validate-xls': string[];
  export: string[];
}

export const columns: Columns = {
  template: [
    'ringNumber',
    'colorRing',
    'sex',
    'eu_sexCode',
    'species',
    'eu_species',
    'status',
    'eu_statusCode',
    'date',
    'age',
    'eu_ageCode',
    'place',
    'eu_placeCode',
    'latitude',
    'longitude',
    'ringer',
    'remarks',
  ],
  'validate-xls': [
    'ringNumber',
    'colorRing',
    'eu_sexCode',
    'eu_species',
    'eu_statusCode',
    'date',
    'eu_ageCode',
    'eu_placeCode',
    'latitude',
    'longitude',
    'ringer',
    'remarks',
  ],
  export: [],
};
