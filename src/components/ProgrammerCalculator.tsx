import React, { useState, useEffect, useCallback } from 'react';
import { NumberBase, BitSize } from '../types';
import { Delete } from 'lucide-react';

interface ProgrammerCalculatorProps {
  onCommitResult: (expr: string, res: string) => void;
}

export const ProgrammerCalculator: React.FC<ProgrammerCalculatorProps> = ({ onCommitResult }) => {
  const [value, setValue] = useState<bigint>(0n);
  const [base, setBase] = useState<NumberBase>('DEC');
  const [bitSize, setBitSize] = useState<BitSize>(64);
  const [expression, setExpression] = useState<string>('');
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [storedValue, setStoredValue] = useState<bigint | null>(null);
  const [resetOnNextDigit, setResetOnNextDigit] = useState(false);

  // Mask value according to current bit size
  const getMask = useCallback((bits: BitSize): bigint => {
    switch (bits) {
      case 8:
        return 0xffn;
      case 16:
        return 0xffffn;
      case 32:
        return 0xffffffffn;
      case 64:
      default:
        return 0xffffffffffffffffn;
    }
  }, []);

  const maskedValue = (val: bigint, bits: BitSize = bitSize) => {
    const mask = getMask(bits);
    return val & mask;
  };

  // Convert BigInt to formatted strings
  const formatBase = (val: bigint, targetBase: NumberBase): string => {
    const mVal = maskedValue(val);
    switch (targetBase) {
      case 'HEX':
        return mVal.toString(16).toUpperCase();
      case 'DEC':
        return mVal.toString(10);
      case 'OCT':
        return mVal.toString(8);
      case 'BIN':
        return mVal.toString(2);
    }
  };

  const handleDigit = useCallback((digitChar: string) => {
    // Validate if digit is valid in current base
    const validHex = '0123456789ABCDEFabcdef';
    const validDec = '0123456789';
    const validOct = '01234567';
    const validBin = '01';

    let isValid = false;
    if (base === 'HEX') isValid = validHex.includes(digitChar);
    else if (base === 'DEC') isValid = validDec.includes(digitChar);
    else if (base === 'OCT') isValid = validOct.includes(digitChar);
    else if (base === 'BIN') isValid = validBin.includes(digitChar);

    if (!isValid) return;

    setValue((prev) => {
      if (resetOnNextDigit) {
        setResetOnNextDigit(false);
        return maskedValue(BigInt(parseInt(digitChar, base === 'HEX' ? 16 : base === 'DEC' ? 10 : base === 'OCT' ? 8 : 2)));
      }

      const currentStr = formatBase(prev, base);
      const newStr = currentStr === '0' ? digitChar.toUpperCase() : currentStr + digitChar.toUpperCase();
      try {
        const parsed = BigInt(
          base === 'HEX' ? '0x' + newStr : base === 'OCT' ? '0o' + newStr : base === 'BIN' ? '0b' + newStr : newStr
        );
        return maskedValue(parsed);
      } catch {
        return prev;
      }
    });
  }, [base, resetOnNextDigit, maskedValue]);

  const handleClear = useCallback(() => {
    setValue(0n);
    setExpression('');
    setPendingOp(null);
    setStoredValue(null);
    setResetOnNextDigit(false);
  }, []);

  const handleBackspace = useCallback(() => {
    setValue((prev) => {
      const str = formatBase(prev, base);
      if (str.length <= 1) return 0n;
      const newStr = str.slice(0, -1);
      const radix = base === 'HEX' ? 16 : base === 'DEC' ? 10 : base === 'OCT' ? 8 : 2;
      return maskedValue(BigInt(parseInt(newStr, radix) || 0));
    });
  }, [base, maskedValue]);

  // Bitwise binary operators
  const handleOperator = useCallback((op: string) => {
    setStoredValue(value);
    setPendingOp(op);
    setExpression(`${formatBase(value, base)} ${op}`);
    setResetOnNextDigit(true);
  }, [value, base]);

  const handleEquals = useCallback(() => {
    if (pendingOp && storedValue !== null) {
      let res = 0n;
      const mask = getMask(bitSize);
      switch (pendingOp) {
        case 'AND':
          res = storedValue & value;
          break;
        case 'OR':
          res = storedValue | value;
          break;
        case 'XOR':
          res = storedValue ^ value;
          break;
        case 'NAND':
          res = ~(storedValue & value) & mask;
          break;
        case 'NOR':
          res = ~(storedValue | value) & mask;
          break;
        case 'XNOR':
          res = ~(storedValue ^ value) & mask;
          break;
        case 'LSH':
          res = (storedValue << (value % 64n)) & mask;
          break;
        case 'RSH':
          res = storedValue >> (value % 64n);
          break;
        case '+':
          res = (storedValue + value) & mask;
          break;
        case '-':
          res = (storedValue - value) & mask;
          break;
        case '*':
          res = (storedValue * value) & mask;
          break;
        case '/':
          res = value !== 0n ? storedValue / value : 0n;
          break;
        case '%':
          res = value !== 0n ? storedValue % value : 0n;
          break;
      }
      res = maskedValue(res);
      setValue(res);
      const fullExpr = `${expression} ${formatBase(value, base)}`;
      setExpression(`${fullExpr} =`);
      onCommitResult(fullExpr, formatBase(res, base));
      setPendingOp(null);
      setStoredValue(null);
      setResetOnNextDigit(true);
    }
  }, [pendingOp, storedValue, value, bitSize, expression, base, maskedValue, getMask, onCommitResult]);

  // Unary bitwise operations
  const handleUnaryOp = (op: 'NOT' | 'NEG' | 'ROL' | 'ROR') => {
    const mask = getMask(bitSize);
    let res = 0n;
    if (op === 'NOT') {
      res = ~value & mask;
    } else if (op === 'NEG') {
      res = (-value) & mask;
    } else if (op === 'ROL') {
      const topBit = (value >> BigInt(bitSize - 1)) & 1n;
      res = ((value << 1n) | topBit) & mask;
    } else if (op === 'ROR') {
      const lowBit = value & 1n;
      res = (value >> 1n) | (lowBit << BigInt(bitSize - 1));
    }
    setValue(maskedValue(res));
    setResetOnNextDigit(true);
  };

  // Click individual bit in binary matrix
  const handleToggleBit = (bitIndex: number) => {
    if (bitIndex >= bitSize) return;
    const bitMask = 1n << BigInt(bitIndex);
    const toggled = value ^ bitMask;
    setValue(maskedValue(toggled));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toUpperCase();
      if ('0123456789ABCDEF'.includes(key) && key.length === 1) {
        e.preventDefault();
        handleDigit(key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault();
        handleOperator(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleBackspace, handleClear, handleEquals, handleOperator]);

  // ASCII preview
  let asciiChar = '';
  try {
    const charCode = Number(value & 0x7fn);
    if (charCode >= 32 && charCode <= 126) {
      asciiChar = String.fromCharCode(charCode);
    } else {
      asciiChar = '(não imprimível)';
    }
  } catch {
    asciiChar = '';
  }

  // Generate 64 bits array (63 downto 0)
  const bitArray: boolean[] = [];
  for (let i = 63; i >= 0; i--) {
    const isSet = ((value >> BigInt(i)) & 1n) === 1n;
    bitArray.push(isSet);
  }

  return (
    <div className="w-full flex flex-col bg-white dark:bg-neutral-900 border border-orange-100 dark:border-neutral-800 rounded-2xl shadow-sm p-4 sm:p-5 select-none">
      {/* Title & Bit Size */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Modo Programador
        </h2>
        <div className="flex items-center gap-1 bg-orange-50/80 dark:bg-neutral-800 p-0.5 rounded-lg border border-orange-200/50 dark:border-neutral-700">
          {([64, 32, 16, 8] as BitSize[]).map((size) => (
            <button
              key={size}
              onClick={() => {
                setBitSize(size);
                setValue((prev) => maskedValue(prev, size));
              }}
              className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded-md transition-colors cursor-pointer ${
                bitSize === size
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-orange-100 dark:hover:bg-neutral-700'
              }`}
            >
              {size === 64 ? 'QWORD' : size === 32 ? 'DWORD' : size === 16 ? 'WORD' : 'BYTE'}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Display with Active Base Highlight */}
      <div className="w-full bg-orange-50/40 dark:bg-neutral-950/60 rounded-xl p-4 mb-3 border border-orange-100/60 dark:border-neutral-800/80 text-right">
        <div className="text-xs text-neutral-400 dark:text-neutral-500 font-mono h-5 overflow-hidden text-ellipsis whitespace-nowrap">
          {expression}
        </div>
        <div className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white font-mono tracking-tight overflow-x-auto scrollbar-none py-1">
          {formatBase(value, base)}
        </div>
      </div>

      {/* Synchronous 4-Base Converter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 mb-3">
        {(['HEX', 'DEC', 'OCT', 'BIN'] as NumberBase[]).map((b) => {
          const isActive = base === b;
          return (
            <button
              key={b}
              onClick={() => setBase(b)}
              className={`p-2 rounded-lg text-left transition-colors border cursor-pointer ${
                isActive
                  ? 'bg-orange-100/70 dark:bg-neutral-800 border-orange-300 dark:border-orange-500/60 shadow-2xs'
                  : 'bg-white dark:bg-neutral-900 border-orange-100 dark:border-neutral-800 hover:bg-orange-50/50'
              }`}
            >
              <div className="text-[10px] font-mono text-orange-600 dark:text-orange-400 font-bold">
                {b}
              </div>
              <div className="text-xs font-mono text-neutral-800 dark:text-neutral-200 truncate mt-0.5">
                {formatBase(value, b)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive 64-Bit Binary Matrix */}
      <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-950/70 rounded-xl border border-orange-100/60 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase">
            Matriz de Bits (Clique para alternar)
          </span>
          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
            ASCII: <code className="text-orange-600 dark:text-orange-400 font-bold">{asciiChar}</code>
          </span>
        </div>

        {/* 64 bits split in 2 rows of 32 bits, grouped into 4-bit nibbles */}
        <div className="space-y-1.5">
          {[0, 32].map((startIdx) => (
            <div key={startIdx} className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5">
              <span className="text-[9px] font-mono text-neutral-400 w-4 shrink-0">
                {63 - startIdx}
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 8 }).map((_, nibbleIdx) => {
                  const nibbleOffset = startIdx + nibbleIdx * 4;
                  return (
                    <div key={nibbleIdx} className="flex items-center gap-0.5 bg-black/5 dark:bg-white/5 p-0.5 rounded">
                      {Array.from({ length: 4 }).map((_, bitInNibble) => {
                        const bitIndex = 63 - (nibbleOffset + bitInNibble);
                        const isSet = bitArray[nibbleOffset + bitInNibble];
                        const isEnabled = bitIndex < bitSize;
                        return (
                          <button
                            key={bitInNibble}
                            disabled={!isEnabled}
                            onClick={() => handleToggleBit(bitIndex)}
                            className={`w-3.5 h-5 text-[10px] font-mono font-bold rounded-xs flex items-center justify-center transition-colors cursor-pointer ${
                              !isEnabled
                                ? 'opacity-20 text-neutral-400 cursor-not-allowed'
                                : isSet
                                ? 'bg-orange-500 text-white'
                                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-orange-100 dark:hover:bg-neutral-700'
                            }`}
                            title={`Bit ${bitIndex}`}
                          >
                            {isSet ? '1' : '0'}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <span className="text-[9px] font-mono text-neutral-400 w-4 text-right shrink-0">
                {32 - startIdx}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Logical & Numeric Keypad */}
      <div className="grid grid-cols-6 gap-1.5">
        {/* Logic operations column/row */}
        <button
          onClick={() => handleOperator('AND')}
          className="py-2 text-xs font-mono font-medium rounded-lg bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          AND
        </button>
        <button
          onClick={() => handleOperator('OR')}
          className="py-2 text-xs font-mono font-medium rounded-lg bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          OR
        </button>
        <button
          onClick={() => handleOperator('XOR')}
          className="py-2 text-xs font-mono font-medium rounded-lg bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          XOR
        </button>
        <button
          onClick={() => handleUnaryOp('NOT')}
          className="py-2 text-xs font-mono font-medium rounded-lg bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          NOT
        </button>
        <button
          onClick={() => handleOperator('LSH')}
          className="py-2 text-xs font-mono font-medium rounded-lg bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          &lt;&lt;
        </button>
        <button
          onClick={() => handleOperator('RSH')}
          className="py-2 text-xs font-mono font-medium rounded-lg bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          &gt;&gt;
        </button>

        {/* Unary Logic & Clear */}
        <button
          onClick={() => handleUnaryOp('ROL')}
          className="py-2 text-xs font-mono font-medium rounded-lg bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          RoL
        </button>
        <button
          onClick={() => handleUnaryOp('ROR')}
          className="py-2 text-xs font-mono font-medium rounded-lg bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          RoR
        </button>
        <button
          onClick={() => handleOperator('NAND')}
          className="py-2 text-xs font-mono font-medium rounded-lg bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          NAND
        </button>
        <button
          onClick={() => handleOperator('NOR')}
          className="py-2 text-xs font-mono font-medium rounded-lg bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          NOR
        </button>
        <button
          onClick={handleClear}
          className="py-2 text-xs font-bold rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 hover:bg-orange-200 transition-colors cursor-pointer"
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          className="py-2 text-xs font-medium rounded-lg bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors flex items-center justify-center cursor-pointer"
        >
          <Delete className="w-4 h-4" />
        </button>

        {/* HEX Keys A-F and numbers */}
        {['A', 'B', '7', '8', '9', '/'].map((k) => (
          <button
            key={k}
            disabled={['A', 'B'].includes(k) && base !== 'HEX'}
            onClick={() => (k === '/' ? handleOperator('/') : handleDigit(k))}
            className={`py-2.5 text-sm font-mono font-semibold rounded-xl transition-colors cursor-pointer ${
              ['A', 'B'].includes(k) && base !== 'HEX'
                ? 'opacity-25 bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed'
                : k === '/'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 shadow-2xs'
            }`}
          >
            {k}
          </button>
        ))}

        {['C', 'D', '4', '5', '6', '*'].map((k) => (
          <button
            key={k}
            disabled={['C', 'D'].includes(k) && base !== 'HEX'}
            onClick={() => (k === '*' ? handleOperator('*') : handleDigit(k))}
            className={`py-2.5 text-sm font-mono font-semibold rounded-xl transition-colors cursor-pointer ${
              ['C', 'D'].includes(k) && base !== 'HEX'
                ? 'opacity-25 bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed'
                : k === '*'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 shadow-2xs'
            }`}
          >
            {k}
          </button>
        ))}

        {['E', 'F', '1', '2', '3', '-'].map((k) => (
          <button
            key={k}
            disabled={['E', 'F'].includes(k) && base !== 'HEX'}
            onClick={() => (k === '-' ? handleOperator('-') : handleDigit(k))}
            className={`py-2.5 text-sm font-mono font-semibold rounded-xl transition-colors cursor-pointer ${
              ['E', 'F'].includes(k) && base !== 'HEX'
                ? 'opacity-25 bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed'
                : k === '-'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 shadow-2xs'
            }`}
          >
            {k}
          </button>
        ))}

        {/* Bottom row: Mod, 0, +, = */}
        <button
          onClick={() => handleOperator('%')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          MOD
        </button>
        <button
          onClick={() => handleUnaryOp('NEG')}
          className="py-2.5 text-xs font-mono font-medium rounded-xl bg-orange-50/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 transition-colors cursor-pointer"
        >
          +/-
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="col-span-2 py-2.5 text-sm font-mono font-semibold rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-orange-100/50 dark:border-neutral-700/50 shadow-2xs cursor-pointer"
        >
          0
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="py-2.5 text-sm font-medium rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 transition-colors cursor-pointer"
        >
          +
        </button>
        <button
          onClick={handleEquals}
          className="py-2.5 text-base font-mono font-bold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/25 transition-all flex items-center justify-center cursor-pointer"
        >
          =
        </button>
      </div>
    </div>
  );
};
