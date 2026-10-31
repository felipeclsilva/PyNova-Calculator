import React from 'react';
import { Sun, Moon, Code2, History, RotateCcw } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  showPython: boolean;
  onTogglePython: () => void;
  showHistory: boolean;
  onToggleHistory: () => void;
  onResetAll?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  showPython,
  onTogglePython,
  showHistory,
  onToggleHistory,
  onResetAll,
}) => {
  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-orange-100 dark:border-neutral-800 transition-colors">
      {/* Zone 1: Brand title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-400 dark:bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-orange-300/40 dark:shadow-orange-950/40">
          π
        </div>
        <div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-800 dark:text-neutral-100 whitespace-nowrap">
            PyNova Calculator
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs text-orange-600/80 dark:text-orange-400 font-medium">
            Calculadora Python
          </span>
        </div>
      </div>

      {/* Zone 2 & 3: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePython}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            showPython
              ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
              : 'bg-orange-50 dark:bg-neutral-800 text-orange-950 dark:text-neutral-200 hover:bg-orange-100 dark:hover:bg-neutral-700'
          }`}
          title="Abrir/Fechar Console Python"
        >
          <Code2 className="w-3.5 h-3.5 text-current" />
          <span className="hidden sm:inline">Python</span>
        </button>

        <button
          onClick={onToggleHistory}
          className={`p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            showHistory
              ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
              : 'bg-orange-50 dark:bg-neutral-800 text-orange-950 dark:text-neutral-200 hover:bg-orange-100 dark:hover:bg-neutral-700'
          }`}
          title="Histórico de Cálculos"
        >
          <History className="w-3.5 h-3.5 text-current" />
          <span className="hidden sm:inline">Histórico</span>
        </button>

        {onResetAll && (
          <button
            onClick={onResetAll}
            className="p-1.5 text-xs font-medium rounded-lg bg-orange-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-orange-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            title="Reiniciar Calculadora"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={onToggleTheme}
          className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-lg bg-orange-50 dark:bg-neutral-800 text-orange-900 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5"
          title={isDark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          aria-label="Alternar tema claro e escuro"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-orange-400" />
          ) : (
            <Moon className="w-4 h-4 text-orange-700" />
          )}
        </button>
      </div>
    </header>
  );
};
