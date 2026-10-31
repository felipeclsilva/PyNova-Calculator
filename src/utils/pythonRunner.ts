// In-browser Python runner with Pyodide WASM + instant resilient fallback engine

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    pyodideInstance?: any;
    isPyodideLoading?: boolean;
  }
}

export interface PythonExecutionResult {
  output: string;
  returnValue?: any;
  error?: string;
  executionTimeMs: number;
}

let pyodidePromise: Promise<any> | null = null;

export async function getPyodide(): Promise<any> {
  if (window.pyodideInstance) {
    return window.pyodideInstance;
  }

  if (pyodidePromise) {
    return pyodidePromise;
  }

  pyodidePromise = (async () => {
    // If Pyodide script is not in document, inject script tag
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Falha ao carregar script do Pyodide'));
        document.head.appendChild(script);
      });
    }

    if (window.loadPyodide) {
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
      });
      window.pyodideInstance = pyodide;
      return pyodide;
    }
    throw new Error('Pyodide indisponível');
  })();

  return pyodidePromise;
}

// Fallback interpreter for Python code
function runFallbackPython(code: string, currentVal?: number): PythonExecutionResult {
  const startTime = performance.now();
  const outputs: string[] = [];

  try {
    // Provide a mocked Python-like environment
    const math = {
      pi: Math.PI,
      e: Math.E,
      sqrt: Math.sqrt,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      pow: Math.pow,
      exp: Math.exp,
      log: Math.log,
      log10: Math.log10,
      log2: Math.log2,
      factorial: (n: number) => {
        let r = 1;
        for (let i = 2; i <= n; i++) r *= i;
        return r;
      },
      radians: (deg: number) => (deg * Math.PI) / 180,
      degrees: (rad: number) => (rad * 180) / Math.PI,
      floor: Math.floor,
      ceil: Math.ceil,
      abs: Math.abs,
    };

    const pyPrint = (...args: any[]) => {
      outputs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    };

    // Transform simple Python syntax to executable JS for fallback
    let jsCode = code
      // comments
      .replace(/^#.*$/gm, '')
      .replace(/#.*$/gm, '')
      // import math -> ignore since math is provided
      .replace(/import\s+math/g, '// import math')
      .replace(/from\s+math\s+import\s+\*/g, '// from math import *')
      // def func(a, b): -> function func(a, b) {
      .replace(/def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*:/g, 'function $1($2) {')
      // print(...) -> pyPrint(...)
      .replace(/\bprint\s*\(/g, 'pyPrint(')
      // True / False / None
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      // f-strings basic conversion: f"Texto {var}" -> `Texto ${var}`
      .replace(/f"([^"]*)"/g, (_, content) => {
        const interpolated = content.replace(/\{([^}]+)\}/g, '${$1}');
        return '`' + interpolated + '`';
      })
      .replace(/f'([^']*)'/g, (_, content) => {
        const interpolated = content.replace(/\{([^}]+)\}/g, '${$1}');
        return '`' + interpolated + '`';
      })
      // elif -> } else if (...) {
      .replace(/elif\s+(.+)\s*:/g, '} else if ($1) {')
      // else: -> } else {
      .replace(/else\s*:/g, '} else {')
      // for i in range(n): -> for (let i = 0; i < n; i++) {
      .replace(/for\s+([a-zA-Z0-9_]+)\s+in\s+range\s*\(([^)]+)\)\s*:/g, (_, varName, rangeArgs) => {
        const parts = rangeArgs.split(',').map((p: string) => p.trim());
        if (parts.length === 1) {
          return `for (let ${varName} = 0; ${varName} < ${parts[0]}; ${varName}++) {`;
        } else if (parts.length === 2) {
          return `for (let ${varName} = ${parts[0]}; ${varName} < ${parts[1]}; ${varName}++) {`;
        } else {
          return `for (let ${varName} = ${parts[0]}; ${varName} < ${parts[1]}; ${varName} += ${parts[2]}) {`;
        }
      })
      // while cond: -> while (cond) {
      .replace(/while\s+(.+)\s*:/g, 'while ($1) {')
      // if cond: -> if (cond) {
      .replace(/if\s+(.+)\s*:/g, 'if ($1) {');

    // Auto-close open braces for Python indentation simulation if simple
    const openBraces = (jsCode.match(/\{/g) || []).length;
    const closeBraces = (jsCode.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      jsCode += '\n' + '}'.repeat(openBraces - closeBraces);
    }

    const runner = new Function('math', 'pyPrint', 'ans', 'x', `
      let __lastResult = undefined;
      ${jsCode}
      return typeof resultado !== 'undefined' ? resultado : __lastResult;
    `);

    const ret = runner(math, pyPrint, currentVal ?? 0, currentVal ?? 0);
    const duration = performance.now() - startTime;

    let finalOutput = outputs.join('\n');
    if (!finalOutput && ret !== undefined) {
      finalOutput = String(ret);
    }

    return {
      output: finalOutput || '(Executado com sucesso, sem saída no console)',
      returnValue: ret,
      executionTimeMs: Math.round(duration),
    };
  } catch (err: any) {
    return {
      output: outputs.join('\n'),
      error: `Erro de execução: ${err.message}`,
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }
}

export async function executePythonCode(code: string, currentVal?: number): Promise<PythonExecutionResult> {
  const startTime = performance.now();
  
  try {
    const pyodide = await Promise.race([
      getPyodide(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500)), // timeout to fallback
    ]);

    if (pyodide) {
      // Capture stdout
      pyodide.setStdout({
        batched: (msg: string) => {
          // batched logs
        },
      });

      // Prepare wrapper that intercepts prints
      const runnerCode = `
import sys
import io
import math

__stdout_backup = sys.stdout
sys.stdout = io.StringIO()

ans = ${currentVal ?? 0}
x = ${currentVal ?? 0}

__return_val = None
try:
${code.split('\n').map(line => '    ' + line).join('\n')}
finally:
    __captured_out = sys.stdout.getvalue()
    sys.stdout = __stdout_backup
`;

      await pyodide.runPythonAsync(runnerCode);
      const captured = pyodide.globals.get('__captured_out');
      const duration = performance.now() - startTime;

      return {
        output: captured || '(Executado com sucesso, sem saída)',
        executionTimeMs: Math.round(duration),
      };
    }
  } catch (err: any) {
    // If Pyodide encountered an error during execution, return Python error
    if (window.pyodideInstance) {
      return {
        output: '',
        error: String(err.message || err),
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }
  }

  // Use fallback engine if Pyodide is still loading or network failed
  return runFallbackPython(code, currentVal);
}
