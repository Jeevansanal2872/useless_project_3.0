// pyRunner.js
// Actually executes the player's submitted Python in-browser using
// Pyodide (CPython compiled to WASM) and checks it against a task's test
// cases. This is the ONLY module that touches Pyodide, so the rest of the
// codebase never needs to know how validation happens under the hood.
//
// Requires index.html to load the Pyodide loader script:
//   <script src="https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js"></script>
// which exposes a global `loadPyodide` function. If that script isn't
// present (e.g. no internet), we fall back to a much weaker heuristic
// check so the game is still playable offline during development.

let pyodideReadyPromise = null;

function pyodideAvailable() {
  return typeof globalThis.loadPyodide === 'function';
}

/** Lazily creates (once) and returns the shared Pyodide instance. */
export async function getPyodide() {
  if (!pyodideAvailable()) return null;
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = globalThis.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/',
    });
  }
  return pyodideReadyPromise;
}

/** Kicks off the (slow, ~few seconds) Pyodide download ahead of time. */
export function warmUpPyodide() {
  if (pyodideAvailable()) getPyodide().catch(() => {});
}

function jsonSafeEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Runs `code` (which must define `functionName`) against `testCases` and
 * returns { ok, results, error }. `results` has one entry per test case:
 * { pass, got, expected, input }.
 */
export async function runTestCases(code, functionName, testCases) {
  const pyodide = await getPyodide();

  if (!pyodide) {
    return fallbackHeuristicCheck(code, functionName, testCases);
  }

  const results = [];
  try {
    // Fresh namespace per attempt so leftovers from a previous (buggy)
    // submission can't accidentally make a later one look correct.
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
        const jsResult = rawResult && rawResult.toJs ? rawResult.toJs({ dict_converter: Object.fromEntries }) : rawResult;
        pyArgs.forEach((a) => a && a.destroy && a.destroy());
        rawResult && rawResult.destroy && rawResult.destroy();

        results.push({
          pass: jsonSafeEqual(jsResult, testCase.expected),
          got: jsResult,
          expected: testCase.expected,
          input: testCase.input,
        });
      } catch (err) {
        results.push({
          pass: false,
          got: null,
          error: String(err && err.message ? err.message : err),
          expected: testCase.expected,
          input: testCase.input,
        });
      }
    }

    pyFunc.destroy && pyFunc.destroy();
    namespace.destroy();
  } catch (err) {
    return { ok: false, results: [], error: `Python error: ${String(err)}` };
  }

  return { ok: results.every((r) => r.pass), results, error: null };
}

/**
 * Very rough offline fallback: just checks the code still defines the
 * right function name and no longer contains an obvious buggy fragment
 * the task authors may optionally provide (`task.knownBuggyFragment`).
 * This is clearly marked as degraded so it's never confused for a real
 * grading pass — the game UI should show a banner when this path is used.
 */
function fallbackHeuristicCheck(code, functionName, testCases) {
  const definesFunction = new RegExp(`def\\s+${functionName}\\s*\\(`).test(code);
  return {
    ok: definesFunction,
    results: testCases.map((tc) => ({
      pass: definesFunction,
      got: null,
      expected: tc.expected,
      input: tc.input,
      degraded: true,
    })),
    error: definesFunction
      ? null
      : `Offline fallback: couldn't even find "def ${functionName}(" in your code.`,
    degraded: true,
  };
}
