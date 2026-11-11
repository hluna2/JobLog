/**
 * Safe Math Expression Evaluator for Hours and Earnings Calculations.
 * Supports formulas like '=22.8-7.5+8.35', '14.5 + 8', '(20 - 4) * 1.5', etc.
 * Uses a safe recursive-descent parser (zero eval/Function execution).
 */

export function evaluateHoursExpression(input: string): number {
  if (!input || typeof input !== 'string') return 0;

  // Trim and strip leading '=' if present (Excel style)
  let expr = input.trim();
  if (expr.startsWith('=')) {
    expr = expr.substring(1).trim();
  }

  if (!expr) return 0;

  // If simple plain number
  if (/^-?\d+(\.\d+)?$/.test(expr)) {
    const val = parseFloat(expr);
    return isNaN(val) ? 0 : roundHours(val);
  }

  try {
    const tokens = tokenize(expr);
    if (!tokens || tokens.length === 0) return 0;

    let position = 0;

    function peek(): string | null {
      return position < tokens.length ? tokens[position] : null;
    }

    function consume(): string {
      return tokens[position++];
    }

    // Expression: Term (('+' | '-') Term)*
    function parseExpression(): number {
      let value = parseTerm();
      while (peek() === '+' || peek() === '-') {
        const op = consume();
        const nextTerm = parseTerm();
        if (op === '+') {
          value += nextTerm;
        } else {
          value -= nextTerm;
        }
      }
      return value;
    }

    // Term: Factor (('*' | '/') Factor)*
    function parseTerm(): number {
      let value = parseFactor();
      while (peek() === '*' || peek() === '/') {
        const op = consume();
        const nextFactor = parseFactor();
        if (op === '*') {
          value *= nextFactor;
        } else {
          if (nextFactor === 0) return 0; // Prevent divide by zero
          value /= nextFactor;
        }
      }
      return value;
    }

    // Factor: unary ('+' | '-') Factor | '(' Expression ')' | Number
    function parseFactor(): number {
      const token = peek();

      if (token === '+') {
        consume();
        return parseFactor();
      }

      if (token === '-') {
        consume();
        return -parseFactor();
      }

      if (token === '(') {
        consume(); // '('
        const value = parseExpression();
        if (peek() === ')') {
          consume(); // ')'
        }
        return value;
      }

      const numToken = consume();
      const num = parseFloat(numToken);
      return isNaN(num) ? 0 : num;
    }

    const result = parseExpression();
    return isNaN(result) ? 0 : roundHours(result);
  } catch {
    // If parsing fails, attempt fallback to parseFloat
    const fallback = parseFloat(expr);
    return isNaN(fallback) ? 0 : roundHours(fallback);
  }
}

/**
 * Checks if the string contains a formula (starts with '=' or contains arithmetic operators).
 */
export function isFormulaString(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  if (trimmed.startsWith('=')) return true;
  return /[+\-*/]/.test(trimmed) && /\d/.test(trimmed);
}

/**
 * Rounds hours to 2 decimal places to avoid floating point issues (e.g. 23.650000000000002 -> 23.65).
 */
export function roundHours(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Tokenize arithmetic expression into numbers, operators, and parentheses.
 */
function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Single character tokens: +, -, *, /, (, )
    if (['+', '-', '*', '/', '(', ')'].includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }

    // Numbers (integers or decimals)
    if (/[\d.]/.test(ch)) {
      let numStr = '';
      let hasDot = false;
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        if (expr[i] === '.') {
          if (hasDot) break;
          hasDot = true;
        }
        numStr += expr[i];
        i++;
      }
      tokens.push(numStr);
      continue;
    }

    // Unrecognized character, skip
    i++;
  }

  return tokens;
}
