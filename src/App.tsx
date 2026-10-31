import React, { useState, useEffect } from 'react';
import { CalculatorMode, HistoryItem } from './types';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { StandardCalculator } from './components/StandardCalculator';
import { ScientificCalculator } from './components/ScientificCalculator';
import { GraphingCalculator } from './components/GraphingCalculator';
import { ProgrammerCalculator } from './components/ProgrammerCalculator';
import { DateCalculator } from './components/DateCalculator';
import { PythonEditor } from './components/PythonEditor';
import { HistoryPanel } from './components/HistoryPanel';

export default function App() {
  const [mode, setMode] = useState<CalculatorMode>('padrao');
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPython, setShowPython] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calc_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync theme with document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('calc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('calc_theme', 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleCommitResult = (expr: string, res: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      expression: expr,
      result: res,
      timestamp: new Date(),
      mode,
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setDisplay(item.result);
    setExpression(item.expression);
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleInsertFromPython = (val: string) => {
    setDisplay(val);
    setExpression(`Python = ${val}`);
  };

  const handleResetAll = () => {
    setDisplay('0');
    setExpression('');
    setMemory(null);
  };

  const currentNumericVal = parseFloat(display) || 0;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors selection:bg-orange-200 dark:selection:bg-orange-900">
      {/* Top Bar */}
      <Header
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        showPython={showPython}
        onTogglePython={() => setShowPython(!showPython)}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
        onResetAll={handleResetAll}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-4">
        {/* Mode Selector Tabs */}
        <ModeSelector currentMode={mode} onSelectMode={setMode} />

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Calculator Column */}
          <div
            className={`transition-all duration-200 ${
              showPython ? 'lg:col-span-7 xl:col-span-6' : 'lg:col-span-8 lg:col-start-3 xl:col-span-7 xl:col-start-3'
            }`}
          >
            {mode === 'padrao' && (
              <StandardCalculator
                display={display}
                setDisplay={setDisplay}
                expression={expression}
                setExpression={setExpression}
                onCommitResult={handleCommitResult}
                memory={memory}
                setMemory={setMemory}
              />
            )}

            {mode === 'cientifica' && (
              <ScientificCalculator
                display={display}
                setDisplay={setDisplay}
                expression={expression}
                setExpression={setExpression}
                onCommitResult={handleCommitResult}
              />
            )}

            {mode === 'grafica' && <GraphingCalculator />}

            {mode === 'programador' && (
              <ProgrammerCalculator onCommitResult={handleCommitResult} />
            )}

            {mode === 'data' && <DateCalculator />}
          </div>

          {/* Python Console Column */}
          {showPython && (
            <div className="lg:col-span-5 xl:col-span-6 sticky top-4">
              <PythonEditor
                calculatorCurrentVal={currentNumericVal}
                onInsertToCalculator={handleInsertFromPython}
              />
            </div>
          )}
        </div>
      </main>

      {/* Slide-over History Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs">
          <div className="w-full max-w-sm h-full">
            <HistoryPanel
              history={history}
              onSelectHistory={handleSelectHistory}
              onClearHistory={handleClearHistory}
              onClose={() => setShowHistory(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
