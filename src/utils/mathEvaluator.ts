// Comprehensive mathematical expression evaluator

export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity; // JS max float limit
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

export function formatNumber(val: number, maxDecimals = 10): string {
  if (isNaN(val)) return 'Erro';
  if (!isFinite(val)) return val > 0 ? '∞' : '-∞';
  
  // Clean floating point artifacts
  const rounded = Number(Math.round(Number(val + 'e' + maxDecimals)) + 'e-' + maxDecimals);
  
  // Use scientific notation for very large or very small numbers
  if (Math.abs(rounded) >= 1e12 || (Math.abs(rounded) > 0 && Math.abs(rounded) < 1e-7)) {
    return rounded.toExponential(6).replace('e+', 'e');
  }
  
  return rounded.toString();
}

export function evaluateExpression(expr: string, isDegree = true): { success: boolean; result: string; numericValue: number } {
  try {
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E');

    // Replace factorials like 5! or (3+2)!
    sanitized = sanitized.replace(/(\d+(\.\d+)?|\([^)]+\))!/g, (_, match) => {
      return `__fact(${match})`;
    });

    // Degree vs Radian transformations
    const toRad = (angleStr: string) => `((${angleStr}) * Math.PI / 180)`;
    
    if (isDegree) {
      sanitized = sanitized
        .replace(/\bsin\(([^)]+)\)/g, (_, arg) => `Math.sin(${toRad(arg)})`)
        .replace(/\bcos\(([^)]+)\)/g, (_, arg) => `Math.cos(${toRad(arg)})`)
        .replace(/\btan\(([^)]+)\)/g, (_, arg) => `Math.tan(${toRad(arg)})`)
        .replace(/\basin\(([^)]+)\)/g, (_, arg) => `(Math.asin(${arg}) * 180 / Math.PI)`)
        .replace(/\bacos\(([^)]+)\)/g, (_, arg) => `(Math.acos(${arg}) * 180 / Math.PI)`)
        .replace(/\batan\(([^)]+)\)/g, (_, arg) => `(Math.atan(${arg}) * 180 / Math.PI)`);
    } else {
      sanitized = sanitized
        .replace(/\bsin\(/g, 'Math.sin(')
        .replace(/\bcos\(/g, 'Math.cos(')
        .replace(/\btan\(/g, 'Math.tan(')
        .replace(/\basin\(/g, 'Math.asin(')
        .replace(/\bacos\(/g, 'Math.acos(')
        .replace(/\batan\(/g, 'Math.atan(');
    }

    sanitized = sanitized
      .replace(/\bsinh\(/g, 'Math.sinh(')
      .replace(/\bcosh\(/g, 'Math.cosh(')
      .replace(/\btanh\(/g, 'Math.tanh(')
      .replace(/\bsqrt\(/g, 'Math.sqrt(')
      .replace(/\bcbrt\(/g, 'Math.cbrt(')
      .replace(/\bln\(/g, 'Math.log(')
      .replace(/\blog10\(/g, 'Math.log10(')
      .replace(/\blog2\(/g, 'Math.log2(')
      .replace(/\blog\(/g, 'Math.log10(')
      .replace(/\babs\(/g, 'Math.abs(')
      .replace(/\^/g, '**');

    // Evaluate in safe function context
    const fn = new Function('__fact', `return (${sanitized});`);
    const val = fn(factorial);

    if (typeof val !== 'number' || isNaN(val)) {
      return { success: false, result: 'Erro', numericValue: NaN };
    }

    return {
      success: true,
      result: formatNumber(val),
      numericValue: val,
    };
  } catch {
    return { success: false, result: 'Erro', numericValue: NaN };
  }
}
