import React from 'react';
import { CalculatorMode } from '../types';
import { Calculator, Sparkles, LineChart, Binary, Calendar } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
}

const MODES: { id: CalculatorMode; label: string; icon: React.ReactNode }[] = [
  { id: 'padrao', label: 'Padrão', icon: <Calculator className="w-3.5 h-3.5" /> },
  { id: 'cientifica', label: 'Científica', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'grafica', label: 'Representação gráfica', icon: <LineChart className="w-3.5 h-3.5" /> },
  { id: 'programador', label: 'Programador', icon: <Binary className="w-3.5 h-3.5" /> },
  { id: 'data', label: 'Cálculo de data', icon: <Calendar className="w-3.5 h-3.5" /> },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onSelectMode }) => {
  return (
    <nav className="w-full flex items-center justify-start overflow-x-auto p-1.5 bg-orange-50/80 dark:bg-neutral-900/80 rounded-xl border border-orange-100/80 dark:border-neutral-800/80 scrollbar-none gap-1">
      {MODES.map((mode) => {
        const isActive = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              isActive
                ? 'bg-white dark:bg-neutral-800 text-orange-600 dark:text-orange-400 shadow-xs border border-orange-200/60 dark:border-neutral-700'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-white/40 dark:hover:bg-neutral-800/40'
            }`}
          >
            {mode.icon}
            <span>{mode.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
