"""
seed_challenges.py
------------------
One-time script to populate the challenges table with sample debugging tasks.
Run AFTER the app has started (so tables exist):

    python seed_challenges.py

Adjust DATABASE_URL env var as needed.
"""

import asyncio
import os

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/illam_chuttu",
)

CHALLENGES = [
    # ---------- EASY ----------
    {
        "difficulty": "EASY",
        "title": "Fix the Addition Function",
        "description": "The `add` function subtracts instead of adding. Fix it.",
        "bugged_code": "def add(a, b):\n    return a - b  # BUG: should be +",
        "test_cases": [
            {"input": "add(2, 3)", "expected_output": "5"},
            {"input": "add(0, 0)", "expected_output": "0"},
            {"input": "add(-1, 1)", "expected_output": "0"},
        ],
    },
    {
        "difficulty": "EASY",
        "title": "Off-by-one Range",
        "description": "The function should return a list [1..n] inclusive but misses the last element.",
        "bugged_code": "def one_to_n(n):\n    return list(range(1, n))  # BUG: should be range(1, n+1)",
        "test_cases": [
            {"input": "one_to_n(3)", "expected_output": "[1, 2, 3]"},
            {"input": "one_to_n(1)", "expected_output": "[1]"},
        ],
    },
    # ---------- MEDIUM ----------
    {
        "difficulty": "MEDIUM",
        "title": "Broken Palindrome Checker",
        "description": "The palindrome check has a logic error. Fix it.",
        "bugged_code": (
            "def is_palindrome(s):\n"
            "    return s == s[::-1]  # Looks correct but function is never called\n"
            "result = is_palindrome  # BUG: missing (s) call\n"
            "def check(s):\n"
            "    return result(s)"
        ),
        "test_cases": [
            {"input": "check('racecar')", "expected_output": "True"},
            {"input": "check('hello')", "expected_output": "False"},
        ],
    },
    {
        "difficulty": "MEDIUM",
        "title": "Factorial Zero Bug",
        "description": "factorial(0) raises an error. Fix the base case.",
        "bugged_code": (
            "def factorial(n):\n"
            "    if n == 1:  # BUG: base case should include 0\n"
            "        return 1\n"
            "    return n * factorial(n - 1)"
        ),
        "test_cases": [
            {"input": "factorial(0)", "expected_output": "1"},
            {"input": "factorial(5)", "expected_output": "120"},
        ],
    },
    # ---------- HARD ----------
    {
        "difficulty": "HARD",
        "title": "Binary Search Wrong Mid",
        "description": "Binary search returns wrong index for right-half targets.",
        "bugged_code": (
            "def binary_search(arr, target):\n"
            "    lo, hi = 0, len(arr) - 1\n"
            "    while lo <= hi:\n"
            "        mid = lo + hi  # BUG: should be (lo + hi) // 2\n"
            "        if arr[mid] == target:\n"
            "            return mid\n"
            "        elif arr[mid] < target:\n"
            "            lo = mid + 1\n"
            "        else:\n"
            "            hi = mid - 1\n"
            "    return -1"
        ),
        "test_cases": [
            {"input": "binary_search([1,3,5,7,9], 7)", "expected_output": "3"},
            {"input": "binary_search([1,3,5,7,9], 1)", "expected_output": "0"},
            {"input": "binary_search([1,3,5,7,9], 10)", "expected_output": "-1"},
        ],
    },
    {
        "difficulty": "HARD",
        "title": "Merge Sort Missing Merge Step",
        "description": "The merge sort loses the right-half during merge. Fix it.",
        "bugged_code": (
            "def merge_sort(arr):\n"
            "    if len(arr) <= 1:\n"
            "        return arr\n"
            "    mid = len(arr) // 2\n"
            "    left = merge_sort(arr[:mid])\n"
            "    right = merge_sort(arr[mid:])\n"
            "    return merge(left, right)\n\n"
            "def merge(left, right):\n"
            "    result = []\n"
            "    i = j = 0\n"
            "    while i < len(left) and j < len(right):\n"
            "        if left[i] <= right[j]:\n"
            "            result.append(left[i]); i += 1\n"
            "        else:\n"
            "            result.append(right[j]); j += 1\n"
            "    result.extend(left[i:])  # BUG: missing right[j:]\n"
            "    return result"
        ),
        "test_cases": [
            {"input": "merge_sort([3,1,4,1,5,9,2,6])", "expected_output": "[1, 1, 2, 3, 4, 5, 6, 9]"},
            {"input": "merge_sort([5,4,3,2,1])", "expected_output": "[1, 2, 3, 4, 5]"},
        ],
    },
]


async def seed():
    from sqlalchemy.orm import DeclarativeBase

    engine = create_async_engine(DATABASE_URL, echo=True)

    # Import models after engine is available to avoid circular imports
    from database import Base
    from models import Challenge, Difficulty

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, expire_on_commit=False)
    async with async_session() as session:
        for c in CHALLENGES:
            challenge = Challenge(
                difficulty=Difficulty(c["difficulty"]),
                title=c["title"],
                description=c["description"],
                bugged_code=c["bugged_code"],
                test_cases=c["test_cases"],
            )
            session.add(challenge)
        await session.commit()

    print(f"✅ Seeded {len(CHALLENGES)} challenges successfully.")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
