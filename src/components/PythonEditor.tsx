import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, ArrowDownToLine, Loader2, BookOpen, Check } from 'lucide-react';
import { executePythonCode, PythonExecutionResult } from '../utils/pythonRunner';

interface PythonEditorProps {
  onInsertToCalculator?: (val: string) => void;
  calculatorCurrentVal?: number;
}

const DEFAULT_PLACEHOLDER = `# Exemplo: cálculo de juros compostos em Python
import math

def calcular_montante(capital, taxa_anual, anos):
    taxa_mensal = taxa_anual / 12
    meses = anos * 12
    # Fórmula dos juros compostos: M = C * (1 + i)^t
    montante = capital * math.pow(1 + taxa_mensal, meses)
    return montante

# Capital inicial de R$ 1.000, 10% a.a., durante 5 anos
resultado = calcular_montante(1000, 0.10, 5)
print(f"Montante final acumulado: R$ {resultado:.2f}")
`;

const PRESETS = [
  {
    name: 'Juros Compostos',
    code: DEFAULT_PLACEHOLDER,
  },
  {
    name: 'Fórmula de Bhaskara',
    code: `# Raízes de equação de segundo grau: ax² + bx + c = 0
import math

a, b, c = 1, -5, 6
delta = b**2 - 4*a*c

if delta >= 0:
    x1 = (-b + math.sqrt(delta)) / (2*a)
    x2 = (-b - math.sqrt(delta)) / (2*a)
    print(f"Delta: {delta}")
    print(f"x1 = {x1}")
    print(f"x2 = {x2}")
    resultado = x1
else:
    print("Sem raízes reais")
    resultado = None
`,
  },
  {
    name: 'Sequência Fibonacci',
    code: `# Gerador dos primeiros n termos de Fibonacci
def fibonacci(n):
    seq = [0, 1]
    for i in range(2, n):
        seq.append(seq[-1] + seq[-2])
    return seq

n_termos = 10
fib = fibonacci(n_termos)
print(f"Primeiros {n_termos} números de Fibonacci:")
print(fib)
resultado = fib[-1]
`,
  },
  {
    name: 'Estatística e Média',
    code: `# Estatística básica: média e desvio padrão
import math

dados = [12, 15, 18, 22, 25, 29, 31, 35]
n = len(dados)
media = sum(dados) / n

variancia = sum((x - media)**2 for x in dados) / (n - 1)
desvio_padrao = math.sqrt(variancia)

print(f"Amostra: {dados}")
print(f"Média: {media:.2f}")
print(f"Desvio Padrão: {desvio_padrao:.2f}")
resultado = round(media, 4)
`,
  },
];

export const PythonEditor: React.FC<PythonEditorProps> = ({
  onInsertToCalculator,
  calculatorCurrentVal = 0,
}) => {
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<PythonExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    const codeToRun = code.trim() || DEFAULT_PLACEHOLDER;
    setIsRunning(true);
    try {
      const res = await executePythonCode(codeToRun, calculatorCurrentVal);
      setResult(res);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Run on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
    // Tab key support in textarea
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const currentVal = target.value;
      const newVal = currentVal.substring(0, start) + '    ' + currentVal.substring(end);
      setCode(newVal);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleUsePreset = (presetCode: string) => {
    setCode(presetCode);
  };

  const handleInsert = () => {
    if (!result) return;
    let valToInsert = '';
    if (result.returnValue !== undefined && result.returnValue !== null) {
      valToInsert = String(result.returnValue);
    } else {
      // Find last number in output
      const matches = result.output.match(/-?\d+(\.\d+)?/g);
      if (matches && matches.length > 0) {
        valToInsert = matches[matches.length - 1];
      }
    }
    if (valToInsert && onInsertToCalculator) {
      onInsertToCalculator(valToInsert);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Line count for line numbers
  const displayCode = code.length > 0 ? code : DEFAULT_PLACEHOLDER;
  const lineCount = Math.max(8, displayCode.split('\n').length);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-orange-100 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-orange-50/60 dark:bg-neutral-900 border-b border-orange-100 dark:border-neutral-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 font-mono tracking-tight">
            Python 3.12 (WASM)
          </span>
          <span className="text-[11px] text-neutral-400">·</span>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Variáveis disponíveis: <code className="font-mono text-orange-700 dark:text-orange-300">ans</code>, <code className="font-mono text-orange-700 dark:text-orange-300">x</code>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Preset dropdown */}
          <div className="relative group">
            <button
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-orange-200/60 dark:border-neutral-700 flex items-center gap-1 hover:bg-orange-50 dark:hover:bg-neutral-700 cursor-pointer"
              title="Exemplos Prontos"
            >
              <BookOpen className="w-3 h-3 text-orange-500" />
              <span>Exemplos</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-800 border border-orange-100 dark:border-neutral-700 rounded-lg shadow-lg py-1 z-20 hidden group-hover:block">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleUsePreset(p.code)}
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-orange-50 dark:hover:bg-neutral-700 cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCode('')}
            className="p-1.5 text-xs rounded-md text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-orange-100/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Limpar código"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white shadow-xs shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Executar (Ctrl+↵)</span>
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="relative flex-1 min-h-[160px] sm:min-h-[200px] flex font-mono text-xs bg-orange-50/20 dark:bg-neutral-950/40">
        {/* Line numbers */}
        <div className="select-none py-3 px-2 text-right text-neutral-400 dark:text-neutral-600 border-r border-orange-100 dark:border-neutral-800 bg-orange-50/30 dark:bg-neutral-900/40 font-mono text-xs w-10 shrink-0">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <div className="relative flex-1 p-0">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={DEFAULT_PLACEHOLDER}
            spellCheck={false}
            className="w-full h-full p-3 font-mono text-xs text-neutral-900 dark:text-neutral-100 bg-transparent resize-none focus:outline-hidden leading-5 placeholder:text-neutral-400/60 dark:placeholder:text-neutral-500/60"
          />
        </div>
      </div>

      {/* Console Output Area */}
      <div className="border-t border-orange-100 dark:border-neutral-800 bg-neutral-900 text-neutral-100 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase text-orange-400 font-semibold tracking-wider">
              Console Output
            </span>
            {result?.executionTimeMs !== undefined && (
              <span className="text-[10px] text-neutral-400 font-mono">
                ({result.executionTimeMs} ms)
              </span>
            )}
          </div>

          {result && onInsertToCalculator && (
            <button
              onClick={handleInsert}
              className="px-2 py-0.5 text-[11px] rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 transition-colors flex items-center gap-1 cursor-pointer"
              title="Inserir na Calculadora"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Inserido!</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-3 h-3" />
                  <span>Usar na Calculadora</span>
                </>
              )}
            </button>
          )}
        </div>

        <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto text-neutral-200">
          {result?.error ? (
            <span className="text-red-400">{result.error}</span>
          ) : result?.output ? (
            result.output
          ) : (
            <span className="text-neutral-500 italic">
              Clique em Executar ou pressione Ctrl+Enter para rodar o código Python.
            </span>
          )}
        </pre>
      </div>
    </div>
  );
};
