import React, { useState } from 'react';
import { Calendar, Plus, Minus, Clock, ArrowRight } from 'lucide-react';

export const DateCalculator: React.FC = () => {
  const [tab, setTab] = useState<'diff' | 'addsub' | 'countdown'>('diff');

  // Tab 1: Difference
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(todayStr);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const [dateTo, setDateTo] = useState(nextMonth.toISOString().split('T')[0]);

  // Tab 2: Add/Sub
  const [baseDate, setBaseDate] = useState(todayStr);
  const [operation, setOperation] = useState<'add' | 'sub'>('add');
  const [yearsInput, setYearsInput] = useState<number>(0);
  const [monthsInput, setMonthsInput] = useState<number>(0);
  const [daysInput, setDaysInput] = useState<number>(30);

  // Helper calculations for Difference
  const calculateDifference = () => {
    const d1 = new Date(dateFrom + 'T00:00:00');
    const d2 = new Date(dateTo + 'T00:00:00');

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return null;
    }

    const start = d1 < d2 ? d1 : d2;
    const end = d1 < d2 ? d2 : d1;
    const isNegative = d1 > d2;

    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Calculate business days (Monday-Friday)
    let businessDays = 0;
    const cur = new Date(start.getTime());
    while (cur < end) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    // Breakdown into Years, Months, Days
    let y = end.getFullYear() - start.getFullYear();
    let m = end.getMonth() - start.getMonth();
    let d = end.getDate() - start.getDate();

    if (d < 0) {
      m--;
      const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      d += prevMonthLastDay;
    }
    if (m < 0) {
      y--;
      m += 12;
    }

    const totalWeeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;

    return {
      totalDays,
      businessDays,
      years: y,
      months: m,
      days: d,
      totalWeeks,
      remDays,
      isNegative,
    };
  };

  // Helper calculation for Add/Subtract
  const calculateTargetDate = () => {
    const base = new Date(baseDate + 'T00:00:00');
    if (isNaN(base.getTime())) return null;

    const mult = operation === 'add' ? 1 : -1;
    const target = new Date(base.getTime());

    target.setFullYear(target.getFullYear() + mult * (yearsInput || 0));
    target.setMonth(target.getMonth() + mult * (monthsInput || 0));
    target.setDate(target.getDate() + mult * (daysInput || 0));

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const formatted = target.toLocaleDateString('pt-BR', options);
    const isoDate = target.toISOString().split('T')[0];

    return {
      date: target,
      isoDate,
      formatted: formatted.charAt(0).toUpperCase() + formatted.slice(1),
    };
  };

  // Preset events for Countdown
  const curYear = new Date().getFullYear();
  const COUNTDOWN_EVENTS = [
    {
      name: 'Fim do Ano / Réveillon',
      date: new Date(`${curYear}-12-31T23:59:59`),
    },
    {
      name: 'Ano Novo',
      date: new Date(`${curYear + 1}-01-01T00:00:00`),
    },
    {
      name: 'Dia do Trabalhador',
      date: new Date(`${curYear}-05-01T00:00:00`),
    },
    {
      name: 'Independência do Brasil',
      date: new Date(`${curYear}-09-07T00:00:00`),
    },
    {
      name: 'Natal',
      date: new Date(`${curYear}-12-25T00:00:00`),
    },
  ];

  const diffResult = calculateDifference();
  const targetDateResult = calculateTargetDate();

  return (
    <div className="w-full flex flex-col bg-white dark:bg-neutral-900 border border-orange-100 dark:border-neutral-800 rounded-2xl shadow-sm p-4 sm:p-5 select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Cálculo de Data e Prazos
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-orange-50/80 dark:bg-neutral-800/80 rounded-xl border border-orange-100 dark:border-neutral-700/60 mb-4">
        <button
          onClick={() => setTab('diff')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            tab === 'diff'
              ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-2xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Diferença entre datas
        </button>
        <button
          onClick={() => setTab('addsub')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            tab === 'addsub'
              ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-2xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Adicionar / Subtrair
        </button>
        <button
          onClick={() => setTab('countdown')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            tab === 'countdown'
              ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-2xs font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Contagem Regressiva
        </button>
      </div>

      {/* Tab 1: Difference Between Dates */}
      {tab === 'diff' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-orange-50/30 dark:bg-neutral-800 border border-orange-200/60 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-orange-50/30 dark:bg-neutral-800 border border-orange-200/60 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-orange-500"
              />
            </div>
          </div>

          {diffResult && (
            <div className="bg-orange-50/50 dark:bg-neutral-950/60 rounded-xl p-4 border border-orange-100 dark:border-neutral-800">
              <div className="text-[11px] font-mono text-orange-600 dark:text-orange-400 uppercase font-semibold mb-2">
                Resultado do Intervalo
              </div>

              {/* Total days big metric */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl sm:text-4xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                  {diffResult.totalDays}
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {diffResult.totalDays === 1 ? 'dia corrido' : 'dias corridos'}
                </span>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-orange-100/80 dark:border-neutral-800">
                <div className="p-2 rounded-lg bg-white/60 dark:bg-neutral-900/60 border border-orange-100/60 dark:border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase font-mono">Dias Úteis</div>
                  <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 font-mono mt-0.5">
                    {diffResult.businessDays} dias
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white/60 dark:bg-neutral-900/60 border border-orange-100/60 dark:border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase font-mono">Em Semanas</div>
                  <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 font-mono mt-0.5">
                    {diffResult.totalWeeks} sem {diffResult.remDays} d
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-white/60 dark:bg-neutral-900/60 border border-orange-100/60 dark:border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase font-mono">Tempo Detalhado</div>
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 font-mono mt-0.5 truncate">
                    {diffResult.years > 0 ? `${diffResult.years}a ` : ''}
                    {diffResult.months > 0 ? `${diffResult.months}m ` : ''}
                    {diffResult.days}d
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Add or Subtract Days */}
      {tab === 'addsub' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Data de Partida
            </label>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-orange-50/30 dark:bg-neutral-800 border border-orange-200/60 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOperation('add')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                operation === 'add'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-2xs font-semibold'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-orange-200/60 dark:border-neutral-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Tempo</span>
            </button>
            <button
              onClick={() => setOperation('sub')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                operation === 'sub'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-2xs font-semibold'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-orange-200/60 dark:border-neutral-700'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Subtrair Tempo</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-1">Anos</label>
              <input
                type="number"
                min="0"
                value={yearsInput}
                onChange={(e) => setYearsInput(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-orange-50/30 dark:bg-neutral-800 border border-orange-200/60 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-1">Meses</label>
              <input
                type="number"
                min="0"
                value={monthsInput}
                onChange={(e) => setMonthsInput(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-orange-50/30 dark:bg-neutral-800 border border-orange-200/60 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-neutral-500 mb-1">Dias</label>
              <input
                type="number"
                min="0"
                value={daysInput}
                onChange={(e) => setDaysInput(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-orange-50/30 dark:bg-neutral-800 border border-orange-200/60 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {targetDateResult && (
            <div className="bg-orange-50/50 dark:bg-neutral-950/60 rounded-xl p-4 border border-orange-100 dark:border-neutral-800">
              <div className="text-[10px] font-mono text-orange-600 dark:text-orange-400 uppercase font-semibold mb-1">
                Data Calculada Resultante
              </div>
              <div className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                {targetDateResult.isoDate}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                {targetDateResult.formatted}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Countdown / Key Dates */}
      {tab === 'countdown' && (
        <div className="space-y-2">
          {COUNTDOWN_EVENTS.map((evt) => {
            const now = new Date();
            const diffMs = evt.date.getTime() - now.getTime();
            const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const isPast = daysLeft < 0;

            return (
              <div
                key={evt.name}
                className="flex items-center justify-between p-3 rounded-xl bg-orange-50/40 dark:bg-neutral-800/40 border border-orange-100/60 dark:border-neutral-800"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {evt.name}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    {evt.date.toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-orange-600 dark:text-orange-400">
                    {isPast ? 'Já ocorreu' : `${daysLeft} dias`}
                  </div>
                  {!isPast && (
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {Math.floor(daysLeft / 7)} semanas
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
