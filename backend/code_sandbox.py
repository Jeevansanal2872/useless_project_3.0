"""
code_sandbox.py
---------------
Validates player-submitted Python code by sending it to the Piston API
(https://emkc.org/api/v2/piston/execute) and comparing output against
expected test-case results.

Piston is a free, sandboxed, multi-language code execution service – it
runs code in an isolated container, preventing filesystem access, network
access, and unbound resource consumption.

Error handling matrix
---------------------
| Condition               | validate_code returns | HTTP raised? |
|-------------------------|-----------------------|--------------|
| All tests pass          | True                  | No           |
| ≥1 test fails           | False                 | No           |
| Syntax / runtime error  | False (details logged)| No           |
| Piston API unreachable  | False (details logged)| No           |
| Execution timeout       | False                 | No           |
| Infinite loop (Piston   | False                 | No           |
|   auto-kills at 3 s)    |                       |              |
"""

from __future__ import annotations

import asyncio
import textwrap
from dataclasses import dataclass
from typing import Any

import httpx

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PISTON_API_URL: str = "https://emkc.org/api/v2/piston/execute"
PYTHON_RUNTIME: str = "python"
PYTHON_VERSION: str = "3.10.0"          # Piston supports 3.10+
REQUEST_TIMEOUT_SECONDS: float = 15.0   # HTTP call timeout (Piston cap is ~5 s)

# ---------------------------------------------------------------------------
# Result dataclass
# ---------------------------------------------------------------------------
@dataclass
class SandboxResult:
    passed: bool
    traceback: str | None = None
    failed_case_index: int | None = None
    raw_output: str | None = None


# ---------------------------------------------------------------------------
# Test-case harness builder
# ---------------------------------------------------------------------------
def _build_harness(user_code: str, test_cases: list[dict]) -> str:
    """
    Wrap *user_code* with a simple test runner that prints PASS/FAIL
    per test case.  The harness uses only the standard library so Piston
    needs no extra packages.

    Expected test_cases format::

        [
            {"input": "add(2, 3)", "expected_output": "5"},
            {"input": "add(-1, 1)", "expected_output": "0"},
        ]

    The harness evaluates each `input` expression and compares its string
    representation to `expected_output` (stripped of surrounding whitespace).
    """
    cases_repr = repr(test_cases)

    harness = textwrap.dedent(f"""\
        # ---- Player submitted code ----
        {user_code}

        # ---- Auto-generated test harness ----
        import sys, traceback

        _test_cases = {cases_repr}
        _all_passed = True

        for _i, _tc in enumerate(_test_cases):
            try:
                _result = str(eval(_tc["input"]))
                _expected = str(_tc["expected_output"]).strip()
                if _result.strip() == _expected:
                    print(f"PASS:{{_i}}")
                else:
                    print(f"FAIL:{{_i}}:got={{_result!r}}:expected={{_expected!r}}")
                    _all_passed = False
            except Exception as _e:
                _tb = traceback.format_exc()
                print(f"ERROR:{{_i}}:{{_tb}}", file=sys.stderr)
                _all_passed = False

        sys.exit(0 if _all_passed else 1)
    """)
    return harness


# ---------------------------------------------------------------------------
# Main validation function
# ---------------------------------------------------------------------------
async def validate_code(user_code: str, test_cases: list[dict]) -> SandboxResult:
    """
    Submit *user_code* to the Piston sandbox and validate it against
    *test_cases*.

    The function is intentionally non-raising: all failure modes (wrong
    output, syntax error, timeout, network error) are captured and returned
    as a SandboxResult with ``passed=False`` and an explanatory traceback.
    This prevents a Piston outage from crashing the game server.

    Parameters
    ----------
    user_code  : The Python snippet submitted by the player.
    test_cases : List of {"input": str, "expected_output": str} dicts.

    Returns
    -------
    SandboxResult with .passed True iff all test cases produce correct output.
    """
    harness = _build_harness(user_code, test_cases)

    payload = {
        "language": PYTHON_RUNTIME,
        "version": PYTHON_VERSION,
        "files": [{"name": "solution.py", "content": harness}],
        "stdin": "",
        "args": [],
        "compile_timeout": 5000,   # ms
        "run_timeout": 5000,       # ms – Piston enforces this server-side
        "compile_memory_limit": -1,
        "run_memory_limit": -1,
    }

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.post(PISTON_API_URL, json=payload)
            response.raise_for_status()
            data: dict = response.json()

    except httpx.TimeoutException:
        return SandboxResult(
            passed=False,
            traceback=(
                "Code execution timed out. "
                "Check for infinite loops or overly complex operations."
            ),
        )
    except httpx.HTTPStatusError as exc:
        return SandboxResult(
            passed=False,
            traceback=f"Piston API returned HTTP {exc.response.status_code}: {exc.response.text}",
        )
    except Exception as exc:  # noqa: BLE001
        return SandboxResult(
            passed=False,
            traceback=f"Unexpected error contacting code sandbox: {exc}",
        )

    return _parse_piston_response(data, len(test_cases))


# ---------------------------------------------------------------------------
# Response parser
# ---------------------------------------------------------------------------
def _parse_piston_response(data: dict, num_cases: int) -> SandboxResult:
    """
    Interpret the JSON response from Piston and determine pass/fail.

    Piston response shape::

        {
            "run": {
                "stdout": "PASS:0\\nPASS:1\\n",
                "stderr": "",
                "code": 0,          # exit code
                "signal": null,
                "output": "..."
            }
        }
    """
    run: dict[str, Any] = data.get("run", {})
    stdout: str = run.get("stdout", "")
    stderr: str = run.get("stderr", "")
    exit_code: int = run.get("code", -1)

    # Execution-level errors (OOM, signal kill, etc.)
    if run.get("signal"):
        return SandboxResult(
            passed=False,
            traceback=(
                f"Process killed by signal {run['signal']}. "
                f"Possible infinite loop or memory exhaustion.\n{stderr}"
            ),
        )

    # Parse harness output line by line
    lines = stdout.strip().splitlines()
    failed_index: int | None = None
    traceback_msg: str | None = None
    pass_count: int = 0

    for line in lines:
        if line.startswith("PASS:"):
            pass_count += 1
        elif line.startswith("FAIL:"):
            parts = line.split(":", 3)
            idx = int(parts[1]) if len(parts) > 1 else 0
            detail = ":".join(parts[2:]) if len(parts) > 2 else ""
            failed_index = idx
            traceback_msg = f"Test case {idx} failed – {detail}"
            break
        elif line.startswith("ERROR:"):
            parts = line.split(":", 2)
            idx = int(parts[1]) if len(parts) > 1 else 0
            tb = parts[2] if len(parts) > 2 else stderr
            failed_index = idx
            traceback_msg = f"Runtime error in test case {idx}:\n{tb}"
            break

    if stderr and failed_index is None and pass_count < num_cases:
        # Syntax error or crash before the harness could run
        traceback_msg = stderr.strip()
        failed_index = 0

    all_passed = (pass_count == num_cases) and (failed_index is None)

    return SandboxResult(
        passed=all_passed,
        traceback=traceback_msg if not all_passed else None,
        failed_case_index=failed_index,
        raw_output=stdout[:2000],  # Truncate for safety
    )
