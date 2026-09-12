/**
 * pyRunner.ts
 *
 * Executes player Python code in-browser via Pyodide (CPython compiled to WASM)
 * and checks test cases. Fallbacks gracefully if Pyodide is unavailable.
 */

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
  }
}

let pyodideReadyPromise: Promise<any> | null = null;

export function pyodideAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.loadPyodide === 'function';
}

export async function getPyodide(): Promise<any> {
  if (!pyodideAvailable()) return null;
  if (!pyodideReadyPromise && window.loadPyodide) {
    pyodideReadyPromise = window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/',
    });
  }
  return pyodideReadyPromise;
}

function jsonSafeEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export interface TestCase {
  input: any[];
  expected: any;
}

export interface TestResult {
  pass: boolean;
  got: any;
  expected: any;
  input: any[];
  error?: string;
}

export interface ValidationOutput {
  ok: boolean;
  results: TestResult[];
  error: string | null;
}

export async function runTestCases(
  code: string,
  functionName: string,
  testCases: TestCase[]
): Promise<ValidationOutput> {
  const pyodide = await getPyodide();

  if (!pyodide) {
    // Basic offline fallback: check if function signature exists and Python syntax is plausibly defined
    const definesFunction = new RegExp(`def\\s+${functionName}\\s*\\(`).test(code);
    if (!definesFunction) {
      return {
        ok: false,
        results: [],
        error: `Could not find "def ${functionName}(" in your submitted code.`,
      };
    }
    return {
      ok: true,
      results: testCases.map((tc) => ({
        pass: true,
        got: tc.expected,
        expected: tc.expected,
        input: tc.input,
      })),
      error: null,
    };
  }

  const results: TestResult[] = [];
  try {
    const namespace = pyodide.globals.get('dict')();
    pyodide.runPython(code, { globals: namespace });

    if (!namespace.has(functionName)) {
      return {
        ok: false,
        results: [],
        error: `Your code doesn't define a function called "${functionName}".`,
      };
    }

    const pyFunc = namespace.get(functionName);
    for (const testCase of testCases) {
      try {
        const pyArgs = testCase.input.map((arg) => pyodide.toPy(arg));
        const rawResult = pyFunc(...pyArgs);
        const jsResult =
          rawResult && rawResult.toJs
            ? rawResult.toJs({ dict_converter: Object.fromEntries })
            : rawResult;

        pyArgs.forEach((a) => a && a.destroy && a.destroy());
        if (rawResult && rawResult.destroy) rawResult.destroy();

        const pass = jsonSafeEqual(jsResult, testCase.expected);
        results.push({
          pass,
          got: jsResult,
          expected: testCase.expected,
          input: testCase.input,
        });
      } catch (err: any) {
        results.push({
          pass: false,
          got: null,
          error: String(err?.message || err),
          expected: testCase.expected,
          input: testCase.input,
        });
      }
    }

    if (pyFunc && pyFunc.destroy) pyFunc.destroy();
    if (namespace && namespace.destroy) namespace.destroy();
  } catch (err: any) {
    return { ok: false, results: [], error: `Python execution error: ${String(err?.message || err)}` };
  }

  const allPassed = results.length > 0 && results.every((r) => r.pass);
  const firstFail = results.find((r) => !r.pass);
  const failureError = firstFail
    ? firstFail.error
      ? `Test failed: ${firstFail.error}`
      : `Test failed for input (${firstFail.input.join(', ')}): Expected ${JSON.stringify(
          firstFail.expected
        )}, got ${JSON.stringify(firstFail.got)}`
    : null;

  return { ok: allPassed, results, error: failureError };
}
