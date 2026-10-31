import React, { useEffect, useCallback } from 'react';
import { Delete, Divide, Plus, Minus, X, Percent } from 'lucide-react';
import { evaluateExpression } from '../utils/mathEvaluator';

interface StandardCalculatorProps {
  display: string;
  setDisplay: React.Dispatch<React.SetStateAction<string>>;
  expression: string;
  setExpression: React.Dispatch<React.SetStateAction<string>>;
  onCommitResult: (expr: string, res: string) => void;
  memory: number | null;
  setMemory: React.Dispatch<React.SetStateAction<number | null>>;
}

export const StandardCalculator: React.FC<StandardCalculatorProps> = ({
  display,
  setDisplay,
  expression,
  setExpression,
  onCommitResult,
  memory,
  setMemory,
}) => {
  const [shouldResetDisplay, setShouldResetDisplay] = React.useState(false);

  const handleDigit = useCallback((d: string) => {
    setDisplay((prev) => {
      if (shouldResetDisplay || prev === '0' || prev === 'Erro') {
        setShouldResetDisplay(false);
        return d;
      }
      if (prev.length >= 16) return prev;
      return prev + d;
    });
  }, [shouldResetDisplay, setDisplay]);

  const handleDecimal = useCallback(() => {
    setDisplay((prev) => {
      if (shouldResetDisplay || prev === 'Erro') {
        setShouldResetDisplay(false);
        return '0.';
      }
      if (!prev.includes('.')) {
        return prev + '.';
      }
      return prev;
    });
  }, [shouldResetDisplay, setDisplay]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setShouldResetDisplay(false);
  }, [setDisplay, setExpression]);

  const handleClearEntry = useCallback(() => {
    setDisplay('0');
    setShouldResetDisplay(false);
  }, [setDisplay]);

  const handleBackspace = useCallback(() => {
    setDisplay((prev) => {
      if (shouldResetDisplay || prev === 'Erro') {
        return '0';
      }
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith('-'))) {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, [shouldResetDisplay, setDisplay]);

  const handleToggleSign = useCallback(() => {
    setDisplay((prev) => {
      if (prev === '0' || prev === 'Erro') return prev;
      return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
    });
  }, [setDisplay]);

  const handleOperator = useCallback((op: string) => {
    setExpression((prev) => {
      const displayVal = display;
      if (prev && !shouldResetDisplay) {
        // Evaluate running expression
        const combined = `${prev} ${displayVal}`;
        const evalResult = evaluateExpression(combined);
        if (evalResult.success) {
          setDisplay(evalResult.result);
          setShouldResetDisplay(true);
          return `${evalResult.result} ${op}`;
        }
      }
      setShouldResetDisplay(true);
      return `${displayVal} ${op}`;
    });
  }, [display, shouldResetDisplay, setDisplay, setExpression]);

  const handleEquals = useCallback(() => {
    if (!expression) return;
    const fullExpr = `${expression} ${display}`;
    const evalResult = evaluateExpression(fullExpr);
    if (evalResult.success) {
      setDisplay(evalResult.result);
      setExpression(`${fullExpr} =`);
      onCommitResult(fullExpr, evalResult.result);
      setShouldResetDisplay(true);
    } else {
      setDisplay('Erro');
      setShouldResetDisplay(true);
    }
  }, [expression, display, onCommitResult, setDisplay, setExpression]);

  // Instant operations
  const handlePercent = useCallback(() => {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    const res = (val / 100).toString();
    setDisplay(res);
  }, [display, setDisplay]);

  const handleReciprocal = useCallback(() => {
    const val = parseFloat(display);
    if (isNaN(val) || val === 0) {
      setDisplay('Erro');
      return;
    }
    const res = (1 / val).toString();
    setDisplay(res);
    setShouldResetDisplay(true);
  }, [display, setDisplay]);

  const handleSquare = useCallback(() => {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    const res = (val * val).toString();
    setDisplay(res);
    setShouldResetDisplay(true);
  }, [display, setDisplay]);

  const handleSqrt = useCallback(() => {
    const val = parseFloat(display);
    if (isNaN(val) || val < 0) {
      setDisplay('Erro');
      return;
    }
    const res = Math.sqrt(val).toString();
    setDisplay(res);
    setShouldResetDisplay(true);
  }, [display, setDisplay]);

  // Memory functions
  const handleMemoryClear = () => setMemory(null);
  const handleMemoryRecall = () => {
    if (memory !== null) {
      setDisplay(memory.toString());
      setShouldResetDisplay(true);
    }
  };
  const handleMemoryAdd = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setMemory((prev) => (prev ?? 0) + val);
      setShouldResetDisplay(true);
    }
  };
  const handleMemorySub = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setMemory((prev) => (prev ?? 0) - val);
      setShouldResetDisplay(true);
    }
  };
  const handleMemoryStore = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setMemory(val);
      setShouldResetDisplay(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('−');
      } else if (e.key === '*' || e.key === 'x') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      } else if (e.key === '%') {
        e.preventDefault();
        handlePercent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEquals,
    handleBackspace,
    handleClear,
    handlePercent,
  ]);

  return (
    <div className="w-full flex flex-col bg-white dark:bg-neutral-900 border border-orange-100 dark:border-neutral-800 rounded-2xl shadow-sm p-4 sm:p-5 select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Calculadora Padrão
        </h2>
        {memory !== null && (
          <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 bg-orange-100/60 dark:bg-orange-950/60 px-1.5 py-0.5 rounded">
            M = {memory}
          </span>
        )}
      </div>

      {/* Screen Display */}
      <div className="w-full bg-orange-50/40 dark:bg-neutral-950/60 rounded-xl p-4 mb-4 border border-orange-100/60 dark:border-neutral-800/80 text-right">
        <div className="text-xs text-neutral-400 dark:text-neutral-500 font-mono h-5 overflow-hidden text-ellipsis whitespace-nowrap">
          {expression}
        </div>
        <div className="text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-white font-mono tracking-tight overflow-x-auto scrollbar-none py-1">
          {display}
        </div>
      </div>

      {/* Memory Bar */}
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {[
          { label: 'MC', action: handleMemoryClear, disabled: memory === null },
          { label: 'MR', action: handleMemoryRecall, disabled: memory === null },
          { label: 'M+', action: handleMemoryAdd, disabled: false },
          { label: 'M-', action: handleMemorySub, disabled: false },
          { label: 'MS', action: handleMemoryStore, disabled: false },
        ].map((m) => (
          <button
            key={m.label}
            onClick={m.action}
            disabled={m.disabled}
            className="py-1 text-[11px] font-mono font-medium rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-orange-100/50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <button
          onClick={handlePercent}
          className="py-3 text-sm font-medium rounded-xl bg-orange-50/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center cursor-pointer"
        >
          <Percent className="w-4 h-4" />
        </button>
        <button
          onClick={handleClearEntry}
          className="py-3 text-sm font-semibold rounded-xl bg-orange-50/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          CE
        </button>
        <button
          onClick={handleClear}
          className="py-3 text-sm font-semibold rounded-xl bg-orange-100/80 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200/80 dark:hover:bg-orange-900/40 transition-colors cursor-pointer"
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          className="py-3 text-sm font-medium rounded-xl bg-orange-50/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center cursor-pointer"
        >
          <Delete className="w-4 h-4" />
        </button>

        {/* Row 2 */}
        <button
          onClick={handleReciprocal}
          className="py-3 text-xs font-mono font-medium rounded-xl bg-orange-50/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          1/x
        </button>
        <button
          onClick={handleSquare}
          className="py-3 text-xs font-mono font-medium rounded-xl bg-orange-50/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          x²
        </button>
        <button
          onClick={handleSqrt}
          className="py-3 text-sm font-mono font-medium rounded-xl bg-orange-50/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center cursor-pointer"
        >
          √x
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="py-3 text-sm font-medium rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors flex items-center justify-center cursor-pointer"
        >
          <Divide className="w-4 h-4" />
        </button>

        {/* Row 3 */}
        {['7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="py-3 text-lg font-medium font-mono rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 hover:bg-orange-50/40 dark:hover:bg-neutral-700 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            {digit}
          </button>
        ))}
        <button
          onClick={() => handleOperator('×')}
          className="py-3 text-sm font-medium rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Row 4 */}
        {['4', '5', '6'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="py-3 text-lg font-medium font-mono rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 hover:bg-orange-50/40 dark:hover:bg-neutral-700 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            {digit}
          </button>
        ))}
        <button
          onClick={() => handleOperator('−')}
          className="py-3 text-sm font-medium rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors flex items-center justify-center cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Row 5 */}
        {['1', '2', '3'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="py-3 text-lg font-medium font-mono rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 hover:bg-orange-50/40 dark:hover:bg-neutral-700 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            {digit}
          </button>
        ))}
        <button
          onClick={() => handleOperator('+')}
          className="py-3 text-sm font-medium rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors flex items-center justify-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Row 6 */}
        <button
          onClick={handleToggleSign}
          className="py-3 text-base font-mono font-medium rounded-xl bg-orange-50/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center cursor-pointer"
        >
          ±
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="py-3 text-lg font-medium font-mono rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 hover:bg-orange-50/40 dark:hover:bg-neutral-700 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className="py-3 text-lg font-bold font-mono rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 hover:bg-orange-50/40 dark:hover:bg-neutral-700 transition-colors shadow-2xs cursor-pointer"
        >
          ,
        </button>
        <button
          onClick={handleEquals}
          className="py-3 text-lg font-bold font-mono rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white shadow-sm shadow-orange-500/25 transition-all flex items-center justify-center cursor-pointer"
        >
          =
        </button>
      </div>
    </div>
  );
};
