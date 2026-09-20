import { FriendlyErrorHint } from '../types';

export function analyzePythonError(errorText: string): FriendlyErrorHint | null {
  if (!errorText) return null;

  // Extract line number if available
  const lineMatch = errorText.match(/line\s+(\d+)/i);
  const line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;

  if (errorText.includes('IndentationError')) {
    return {
      errorType: 'IndentationError',
      line,
      friendlyMessage: 'In Python, spacing is part of the syntax! Code inside an if-statement, loop, or function must be indented consistently.',
      suggestion: 'Check line ' + (line ?? 'above') + '. Ensure you use 4 spaces for each indent level and do not mix tabs and spaces.'
    };
  }

  if (errorText.includes('SyntaxError')) {
    let specific = 'Python encountered a piece of code it could not understand.';
    if (errorText.includes('expected \':\'') || errorText.includes('colon')) {
      specific = 'You might have forgotten a colon (:) at the end of an if, elif, else, for, while, or def line.';
    } else if (errorText.includes('unmatched') || errorText.includes('closing parenthesis')) {
      specific = 'Check for matching parentheses (), brackets [], or curly braces {}.';
    } else if (errorText.includes('EOL while scanning string literal') || errorText.includes('unterminated string')) {
      specific = 'A quotation mark (either \' or ") was opened but never closed before the end of the line.';
    }
    return {
      errorType: 'SyntaxError',
      line,
      friendlyMessage: specific,
      suggestion: 'Check line ' + (line ?? 'indicated') + ' for missing colons (:), unclosed quotes (""), or mismatched brackets.'
    };
  }

  if (errorText.includes('NameError')) {
    const nameMatch = errorText.match(/name '([^']+)' is not defined/);
    const varName = nameMatch ? `'${nameMatch[1]}'` : 'this name';
    return {
      errorType: 'NameError',
      line,
      friendlyMessage: `Python doesn't recognize ${varName}. It hasn't been created yet, or was misspelled.`,
      suggestion: `Check if ${varName} is spelled identically to where you created it (Python is case-sensitive, so 'Count' and 'count' are different).`
    };
  }

  if (errorText.includes('TypeError')) {
    return {
      errorType: 'TypeError',
      line,
      friendlyMessage: 'An operation was attempted on an incompatible data type (e.g. adding a number to a string).',
      suggestion: 'Use f-strings like f"The count is {number}" or convert with str(number) or int(text).'
    };
  }

  if (errorText.includes('ZeroDivisionError')) {
    return {
      errorType: 'ZeroDivisionError',
      line,
      friendlyMessage: 'Division by zero is mathematically impossible.',
      suggestion: 'Ensure your divisor is not zero before dividing, e.g., if divisor != 0: result = total / divisor.'
    };
  }

  if (errorText.includes('IndexError')) {
    return {
      errorType: 'IndexError',
      line,
      friendlyMessage: 'You asked for an item at a position that does not exist in your list.',
      suggestion: 'Remember that Python lists start counting at 0! If a list has 3 items, the indices are 0, 1, and 2.'
    };
  }

  if (errorText.includes('KeyError')) {
    return {
      errorType: 'KeyError',
      line,
      friendlyMessage: 'You attempted to access a key that does not exist inside your dictionary.',
      suggestion: 'Use my_dict.get("key", "default_value") to safely retrieve dictionary values without crashing.'
    };
  }

  if (errorText.includes('ValueError')) {
    return {
      errorType: 'ValueError',
      line,
      friendlyMessage: 'A function received an argument that has the right type but an inappropriate value.',
      suggestion: 'For example, int("abc") fails because "abc" cannot be converted into an integer number.'
    };
  }

  return {
    errorType: 'Python Traceback',
    line,
    friendlyMessage: 'Python encountered an issue during execution.',
    suggestion: 'Read the error traceback above carefully—it points directly to the line and describes what interrupted the program.'
  };
}
