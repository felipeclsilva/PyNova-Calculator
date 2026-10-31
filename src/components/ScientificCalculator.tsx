import React, { useState, useEffect, useCallback } from 'react';
import { Delete, Divide, Plus, Minus, X, Percent } from 'lucide-react';
import { evaluateExpression } from '../utils/mathEvaluator';

interface ScientificCalculatorProps {
  display: string;
  setDisplay: React.Dispatch<React.SetStateAction<string>>;
  expression: string;
  setExpression: React.Dispatch<React.SetStateAction<string>>;
  onCommitResult: (expr: string, res: string) => void;
}

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({
  display,
  setDisplay,
  expression,
  setExpression,
  onCommitResult,
}) => {
  const [isDegree, setIsDegree] = useState(true);
  const [isSecond, setIsSecond] = useState(false);
  const [isHyp, setIsHyp] = useState(false);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  const handleDigit = useCallback((d: string) => {
    setDisplay((prev) => {
      if (shouldResetDisplay || prev === '0' || prev === 'Erro') {
        setShouldResetDisplay(false);
        return d;
      }
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

  const handleBackspace = useCallback(() => {
    setDisplay((prev) => {
      if (shouldResetDisplay || prev === 'Erro' || prev.length <= 1) {
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
      const cur = display;
      setShouldResetDisplay(true);
      return prev ? `${prev} ${cur} ${op}` : `${cur} ${op}`;
    });
  }, [display, setExpression]);

  const handleEquals = useCallback(() => {
    const fullExpr = expression ? `${expression} ${display}` : display;
    const evalResult = evaluateExpression(fullExpr, isDegree);
    if (evalResult.success) {
      setDisplay(evalResult.result);
      setExpression(`${fullExpr} =`);
      onCommitResult(fullExpr, evalResult.result);
      setShouldResetDisplay(true);
    } else {
      setDisplay('Erro');
      setShouldResetDisplay(true);
    }
  }, [expression, display, isDegree, onCommitResult, setDisplay, setExpression]);

  // Insert function or constant
  const handleFunction = useCallback((fnName: string) => {
    const val = display;
    let newExpr = '';
    switch (fnName) {
      case 'sin':
        newExpr = isHyp ? `sinh(${val})` : isSecond ? `asin(${val})` : `sin(${val})`;
        break;
      case 'cos':
        newExpr = isHyp ? `cosh(${val})` : isSecond ? `acos(${val})` : `cos(${val})`;
        break;
      case 'tan':
        newExpr = isHyp ? `tanh(${val})` : isSecond ? `atan(${val})` : `tan(${val})`;
        break;
      case 'ln':
        newExpr = isSecond ? `e^(${val})` : `ln(${val})`;
        break;
      case 'log':
        newExpr = isSecond ? `10^(${val})` : `log10(${val})`;
        break;
      case 'log2':
        newExpr = `log2(${val})`;
        break;
      case 'sqrt':
        newExpr = isSecond ? `cbrt(${val})` : `sqrt(${val})`;
        break;
      case 'sqr':
        newExpr = `(${val})^2`;
        break;
      case 'cube':
        newExpr = `(${val})^3`;
        break;
      case 'fact':
        newExpr = `(${val})!`;
        break;
      case 'recip':
        newExpr = `1/(${val})`;
        break;
      case 'abs':
        newExpr = `abs(${val})`;
        break;
      case 'pi':
        setDisplay('π');
        setShouldResetDisplay(true);
        return;
      case 'e':
        setDisplay('e');
        setShouldResetDisplay(true);
        return;
      default:
        return;
    }

    const evalResult = evaluateExpression(newExpr, isDegree);
    if (evalResult.success) {
      setDisplay(evalResult.result);
      setExpression(newExpr);
      setShouldResetDisplay(true);
    } else {
      setDisplay('Erro');
    }
  }, [display, isHyp, isSecond, isDegree, setDisplay, setExpression]);

  const handleOpenParen = () => {
    setExpression((prev) => (prev ? `${prev} (` : '('));
    setShouldResetDisplay(true);
  };

  const handleCloseParen = () => {
    setExpression((prev) => (prev ? `${prev} ${display} )` : `${display} )`));
    setShouldResetDisplay(true);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      } else if (e.key === '(') {
        e.preventDefault();
        handleOpenParen();
      } else if (e.key === ')') {
        e.preventDefault();
        handleCloseParen();
      } else if (e.key === '^') {
        e.preventDefault();
        handleOperator('^');
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
  ]);

  return (
    <div className="w-full flex flex-col bg-white dark:bg-neutral-900 border border-orange-100 dark:border-neutral-800 rounded-2xl shadow-sm p-4 sm:p-5 select-none">
      {/* Title & Modes */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Calculadora Científica
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsDegree(!isDegree)}
            className="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-orange-100/60 dark:bg-neutral-800 text-orange-800 dark:text-orange-300 hover:bg-orange-200/60 transition-colors cursor-pointer"
          >
            {isDegree ? 'DEG' : 'RAD'}
          </button>
          <button
            onClick={() => setIsHyp(!isHyp)}
            className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
              isHyp
                ? 'bg-orange-500 text-white'
                : 'bg-orange-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            HYP
          </button>
          <button
            onClick={() => setIsSecond(!isSecond)}
            className={`px-2 py-0.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
              isSecond
                ? 'bg-orange-500 text-white'
                : 'bg-orange-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            2nd
          </button>
        </div>
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

      {/* Keypad Grid (5 columns for scientific) */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {/* Row 1 */}
        <button
          onClick={() => handleFunction('sin')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          {isHyp ? 'sinh' : isSecond ? 'sin⁻¹' : 'sin'}
        </button>
        <button
          onClick={() => handleFunction('cos')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          {isHyp ? 'cosh' : isSecond ? 'cos⁻¹' : 'cos'}
        </button>
        <button
          onClick={() => handleFunction('tan')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          {isHyp ? 'tanh' : isSecond ? 'tan⁻¹' : 'tan'}
        </button>
        <button
          onClick={() => handleFunction('pi')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          π
        </button>
        <button
          onClick={() => handleFunction('e')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          e
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleFunction('ln')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          {isSecond ? 'eˣ' : 'ln'}
        </button>
        <button
          onClick={() => handleFunction('log')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          {isSecond ? '10ˣ' : 'log₁₀'}
        </button>
        <button
          onClick={() => handleFunction('log2')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          log₂
        </button>
        <button
          onClick={handleOpenParen}
          className="py-2.5 text-sm font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          (
        </button>
        <button
          onClick={handleCloseParen}
          className="py-2.5 text-sm font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          )
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleFunction('sqr')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          x²
        </button>
        <button
          onClick={() => handleOperator('^')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          xʸ
        </button>
        <button
          onClick={() => handleFunction('sqrt')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          {isSecond ? '³√x' : '√x'}
        </button>
        <button
          onClick={handleClear}
          className="py-2.5 text-xs font-semibold rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 hover:bg-orange-200 transition-colors cursor-pointer"
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          className="py-2.5 text-xs font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors flex items-center justify-center cursor-pointer"
        >
          <Delete className="w-4 h-4" />
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleFunction('fact')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          n!
        </button>
        {['7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="py-2.5 text-base font-mono font-medium rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 hover:bg-orange-50/40 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-2xs"
          >
            {digit}
          </button>
        ))}
        <button
          onClick={() => handleOperator('÷')}
          className="py-2.5 text-sm font-medium rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 transition-colors flex items-center justify-center cursor-pointer"
        >
          <Divide className="w-4 h-4" />
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleFunction('recip')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          1/x
        </button>
        {['4', '5', '6'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="py-2.5 text-base font-mono font-medium rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 hover:bg-orange-50/40 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-2xs"
          >
            {digit}
          </button>
        ))}
        <button
          onClick={() => handleOperator('×')}
          className="py-2.5 text-sm font-medium rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Row 6 */}
        <button
          onClick={() => handleFunction('abs')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          |x|
        </button>
        {['1', '2', '3'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="py-2.5 text-base font-mono font-medium rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 hover:bg-orange-50/40 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-2xs"
          >
            {digit}
          </button>
        ))}
        <button
          onClick={() => handleOperator('−')}
          className="py-2.5 text-sm font-medium rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 transition-colors flex items-center justify-center cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Row 7 */}
        <button
          onClick={handleToggleSign}
          className="py-2.5 text-sm font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors flex items-center justify-center cursor-pointer"
        >
          ±
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="py-2.5 text-base font-mono font-medium rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 hover:bg-orange-50/40 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-2xs"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className="py-2.5 text-base font-mono font-bold rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 hover:bg-orange-50/40 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          ,
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="py-2.5 text-sm font-medium rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 transition-colors flex items-center justify-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleEquals}
          className="py-2.5 text-lg font-mono font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/25 transition-all flex items-center justify-center cursor-pointer"
        >
          =
        </button>
      </div>
    </div>
  );
};
