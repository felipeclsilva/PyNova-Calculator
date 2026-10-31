import React from 'react';
import { HistoryItem } from '../types';
import { Trash2, X, Copy, Check } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectHistory,
  onClearHistory,
  onClose,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border-l border-orange-100 dark:border-neutral-800 w-full sm:w-80 shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-orange-100 dark:border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Histórico
        </h3>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Limpar Histórico"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 dark:text-neutral-500 text-xs">
            Nenhum cálculo registrado ainda.
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectHistory(item)}
              className="p-3 rounded-lg bg-orange-50/50 dark:bg-neutral-800/50 hover:bg-orange-100/60 dark:hover:bg-neutral-800 border border-orange-100/50 dark:border-neutral-700/50 transition-all cursor-pointer text-right group relative"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-orange-600/70 dark:text-orange-400 font-mono uppercase">
                  {item.mode}
                </span>
                <button
                  onClick={(e) => handleCopy(item.id, item.result, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-opacity"
                  title="Copiar resultado"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono truncate">
                {item.expression} =
              </div>
              <div className="text-base font-semibold text-neutral-800 dark:text-neutral-100 font-mono mt-0.5">
                {item.result}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
