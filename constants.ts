export const APP_NAME = "StockGPT";
export const APP_VERSION = "v1.0.0";

export enum ViewState {
  LANDING = 'LANDING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export const MOCK_CHART_DATA = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
];
