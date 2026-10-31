import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Table, Eye, EyeOff } from 'lucide-react';

interface FunctionPreset {
  label: string;
  fn: string;
}

const PRESETS: FunctionPreset[] = [
  { label: 'sin(x)', fn: 'sin(x)' },
  { label: 'x² - 4', fn: 'x^2 - 4' },
  { label: 'cos(x) * 2', fn: '2 * cos(x)' },
  { label: 'e^(-x²)', fn: 'exp(-x^2)' },
  { label: '2^x', fn: '2^x' },
  { label: '1/x', fn: '1/x' },
  { label: 'x * sin(x)', fn: 'x * sin(x)' },
];

export const GraphingCalculator: React.FC = () => {
  const [fn1, setFn1] = useState('sin(x)');
  const [fn2, setFn2] = useState('');
  const [showFn2, setShowFn2] = useState(false);
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [showTable, setShowTable] = useState(false);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Safe compiler for mathematical formula in terms of x
  const compileFunction = useCallback((expr: string) => {
    if (!expr.trim()) return () => NaN;
    try {
      let sanitized = expr
        .replace(/\^/g, '**')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\basinh?\b/g, 'Math.asin')
        .replace(/\bacosh?\b/g, 'Math.acos')
        .replace(/\batanh?\b/g, 'Math.atan')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bexp\b/g, 'Math.exp')
        .replace(/\bln\b/g, 'Math.log')
        .replace(/\blog\b/g, 'Math.log10');

      // Support implied multiplication like 2x -> 2*x
      sanitized = sanitized.replace(/(\d+)\s*x/g, '$1*x');

      // Create function
      const fn = new Function('x', `
        try {
          const val = (${sanitized});
          return typeof val === 'number' && isFinite(val) ? val : NaN;
        } catch {
          return NaN;
        }
      `);
      return fn;
    } catch {
      return () => NaN;
    }
  }, []);

  // Redraw canvas
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Coordinate transforms
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;
    const toMathX = (cx: number) => xMin + (cx / width) * (xMax - xMin);

    // Clear
    ctx.clearRect(0, 0, width, height);

    const isDarkMode = document.documentElement.classList.contains('dark');

    // Background
    ctx.fillStyle = isDarkMode ? '#171717' : '#fafafa';
    ctx.fillRect(0, 0, width, height);

    // Grid lines & numbers
    const xStep = calculateStep(xMax - xMin);
    const yStep = calculateStep(yMax - yMin);

    ctx.lineWidth = 1;
    ctx.strokeStyle = isDarkMode ? '#262626' : '#f0f0f0';
    ctx.fillStyle = isDarkMode ? '#737373' : '#a3a3a3';
    ctx.font = '10px JetBrains Mono, monospace';

    // Vertical grid lines
    const startX = Math.floor(xMin / xStep) * xStep;
    for (let x = startX; x <= xMax; x += xStep) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      if (Math.abs(x) > 1e-6) {
        ctx.fillText(Number(x.toFixed(2)).toString(), cx + 4, toCanvasY(0) + 12);
      }
    }

    // Horizontal grid lines
    const startY = Math.floor(yMin / yStep) * yStep;
    for (let y = startY; y <= yMax; y += yStep) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      if (Math.abs(y) > 1e-6) {
        ctx.fillText(Number(y.toFixed(2)).toString(), toCanvasX(0) + 4, cy - 4);
      }
    }

    // Main Axes
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDarkMode ? '#525252' : '#d4d4d4';

    // X Axis
    const originY = toCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    const originX = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Plot helper
    const plotCurve = (fnExpr: string, color: string) => {
      const compiled = compileFunction(fnExpr);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      let isDrawing = false;
      const stepPixels = 1;

      for (let cx = 0; cx <= width; cx += stepPixels) {
        const xVal = toMathX(cx);
        const yVal = compiled(xVal);

        if (!isNaN(yVal) && isFinite(yVal)) {
          const cy = toCanvasY(yVal);
          // Discontinuity check (e.g. 1/x jumping from -inf to +inf)
          if (cy >= -100 && cy <= height + 100) {
            if (!isDrawing) {
              ctx.moveTo(cx, cy);
              isDrawing = true;
            } else {
              ctx.lineTo(cx, cy);
            }
          } else {
            isDrawing = false;
          }
        } else {
          isDrawing = false;
        }
      }
      ctx.stroke();
    };

    // Plot f1 (Pastel Orange: #f97316 / #fb923c)
    if (fn1.trim()) {
      plotCurve(fn1, isDarkMode ? '#fb923c' : '#ea580c');
    }

    // Plot f2 if enabled (Pastel Teal / Cyan)
    if (showFn2 && fn2.trim()) {
      plotCurve(fn2, isDarkMode ? '#38bdf8' : '#0284c7');
    }

    // Plot hover point
    if (hoverCoords) {
      const compiled1 = compileFunction(fn1);
      const yVal = compiled1(hoverCoords.x);
      if (!isNaN(yVal)) {
        const cx = toCanvasX(hoverCoords.x);
        const cy = toCanvasY(yVal);

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Crosshair line
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = isDarkMode ? '#737373' : '#a3a3a3';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [xMin, xMax, yMin, yMax, fn1, fn2, showFn2, hoverCoords, compileFunction]);

  function calculateStep(range: number): number {
    const rawStep = range / 8;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    if (normalized < 2) return magnitude;
    if (normalized < 5) return 2 * magnitude;
    return 5 * magnitude;
  }

  // Handle Resize & DPI
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      drawGraph();
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [drawGraph]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Zoom controls
  const handleZoom = (factor: number) => {
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const xHalf = ((xMax - xMin) * factor) / 2;
    const yHalf = ((yMax - yMin) * factor) / 2;
    setXMin(xCenter - xHalf);
    setXMax(xCenter + xHalf);
    setYMin(yCenter - yHalf);
    setYMax(yCenter + yHalf);
  };

  const handleResetView = () => {
    setXMin(-10);
    setXMax(10);
    setYMin(-5);
    setYMax(5);
  };

  // Mouse interaction for pan & coordinates
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      const xDelta = (dx / rect.width) * (xMax - xMin);
      const yDelta = (dy / rect.height) * (yMax - yMin);

      setXMin((prev) => prev - xDelta);
      setXMax((prev) => prev - xDelta);
      setYMin((prev) => prev + yDelta);
      setYMax((prev) => prev + yDelta);
    } else {
      const mouseX = e.clientX - rect.left;
      const mathX = xMin + (mouseX / rect.width) * (xMax - xMin);
      const compiled = compileFunction(fn1);
      const mathY = compiled(mathX);
      setHoverCoords({ x: Number(mathX.toFixed(2)), y: Number(mathY.toFixed(2)) });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 0.85;
    handleZoom(factor);
  };

  // Generate Table of values
  const compiledFn1 = compileFunction(fn1);
  const tableData: { x: number; y: number }[] = [];
  if (showTable) {
    const step = 1;
    for (let x = -5; x <= 5; x += step) {
      tableData.push({ x, y: Number(compiledFn1(x).toFixed(4)) });
    }
  }

  return (
    <div className="w-full flex flex-col bg-white dark:bg-neutral-900 border border-orange-100 dark:border-neutral-800 rounded-2xl shadow-sm p-4 sm:p-5 select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Representação Gráfica de Funções
        </h2>
        <div className="flex items-center gap-2">
          {hoverCoords && !isNaN(hoverCoords.y) && (
            <span className="text-[11px] font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-neutral-800 px-2 py-0.5 rounded border border-orange-200/50 dark:border-neutral-700">
              x: {hoverCoords.x} · f(x): {hoverCoords.y}
            </span>
          )}
          <button
            onClick={() => setShowTable(!showTable)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showTable
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-orange-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-orange-200/50 dark:border-neutral-700'
            }`}
            title="Tabela de Valores"
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tabela</span>
          </button>
        </div>
      </div>

      {/* Function Inputs */}
      <div className="space-y-2 mb-3">
        {/* Function 1 */}
        <div className="flex items-center gap-2">
          <div className="w-14 text-xs font-mono font-bold text-orange-600 dark:text-orange-400 shrink-0">
            f(x) =
          </div>
          <input
            type="text"
            value={fn1}
            onChange={(e) => setFn1(e.target.value)}
            placeholder="ex: sin(x), x^2 - 4"
            className="flex-1 px-3 py-1.5 font-mono text-xs bg-orange-50/40 dark:bg-neutral-800/80 border border-orange-200/60 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-orange-500"
          />
          <button
            onClick={() => setShowFn2(!showFn2)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title={showFn2 ? 'Remover g(x)' : 'Adicionar segunda função g(x)'}
          >
            {showFn2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Function 2 */}
        {showFn2 && (
          <div className="flex items-center gap-2">
            <div className="w-14 text-xs font-mono font-bold text-sky-600 dark:text-sky-400 shrink-0">
              g(x) =
            </div>
            <input
              type="text"
              value={fn2}
              onChange={(e) => setFn2(e.target.value)}
              placeholder="ex: cos(x), 2*x + 1"
              className="flex-1 px-3 py-1.5 font-mono text-xs bg-sky-50/40 dark:bg-neutral-800/80 border border-sky-200/60 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-sky-500"
            />
          </div>
        )}

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <span className="text-[11px] text-neutral-400 shrink-0">Exemplos:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setFn1(p.fn)}
              className="px-2 py-0.5 text-[11px] font-mono rounded bg-orange-50/80 dark:bg-neutral-800 text-orange-800 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-neutral-700 border border-orange-200/40 dark:border-neutral-700 whitespace-nowrap cursor-pointer transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-[320px] sm:h-[380px] rounded-xl overflow-hidden border border-orange-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            isDraggingRef.current = false;
            setHoverCoords(null);
          }}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Zoom & Pan Controls Floating in Corner */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xs p-1 rounded-lg border border-orange-100 dark:border-neutral-700 shadow-xs">
          <button
            onClick={() => handleZoom(0.75)}
            className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-orange-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            title="Aproximar (Zoom In)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1.33)}
            className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-orange-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            title="Afastar (Zoom Out)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-orange-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            title="Centralizar Origem (0, 0)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute top-3 left-3 flex items-center gap-3 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-orange-100 dark:border-neutral-700 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-neutral-700 dark:text-neutral-300 font-semibold">f(x)</span>
          </div>
          {showFn2 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-neutral-700 dark:text-neutral-300 font-semibold">g(x)</span>
            </div>
          )}
        </div>
      </div>

      {/* Table of Values Drawer */}
      {showTable && (
        <div className="mt-4 p-3 bg-orange-50/40 dark:bg-neutral-800/40 rounded-xl border border-orange-100 dark:border-neutral-800">
          <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2 font-mono">
            Tabela de Pontos Notáveis f(x)
          </div>
          <div className="max-h-40 overflow-y-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-orange-100 dark:border-neutral-700 text-neutral-500">
                  <th className="py-1 text-left">x</th>
                  <th className="py-1 text-right">f(x)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100/40 dark:divide-neutral-800">
                {tableData.map((pt) => (
                  <tr key={pt.x} className="hover:bg-orange-100/30 dark:hover:bg-neutral-800">
                    <td className="py-1 text-neutral-700 dark:text-neutral-300">{pt.x}</td>
                    <td className="py-1 text-right text-neutral-900 dark:text-neutral-100 font-medium">
                      {isNaN(pt.y) ? 'Indefinido' : pt.y}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
