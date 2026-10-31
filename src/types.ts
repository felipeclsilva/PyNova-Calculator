export type CalculatorMode = 'padrao' | 'cientifica' | 'grafica' | 'programador' | 'data';

export type BitSize = 64 | 32 | 16 | 8;
export type NumberBase = 'HEX' | 'DEC' | 'OCT' | 'BIN';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
  mode: CalculatorMode;
}
