import type { BugTask, BugValidationResponse } from '../types';
import { runTestCases, type TestCase } from '../pyRunner';

export interface FullBugTask extends BugTask {
  id: string;
  title: string;
  functionName: string;
  hint?: string;
  testCases: TestCase[];
}

export const BUG_TASK_BANK: Record<'easy' | 'medium' | 'hard', FullBugTask[]> = {
  easy: [
    {
      id: 'easy_sum_to_n',
      snippetId: 'easy_sum_to_n',
      title: 'Sum 1 to n',
      functionName: 'sum_to_n',
      complexity: 'simple',
      description: 'sum_to_n(n) should add up every integer from 1 to n (inclusive). Fix the loop range.',
      code: 'def sum_to_n(n):\n    total = 0\n    for i in range(n):\n        total += i\n    return total\n',
      hint: 'range(n) goes up to n-1. How do you include n?',
      testCases: [
        { input: [5], expected: 15 },
        { input: [1], expected: 1 },
        { input: [10], expected: 55 },
        { input: [0], expected: 0 },
      ],
    },
    {
      id: 'easy_is_even',
      snippetId: 'easy_is_even',
      title: 'Is it Even?',
      functionName: 'is_even',
      complexity: 'simple',
      description: 'is_even(n) should return True for even numbers and False for odd numbers.',
      code: 'def is_even(n):\n    if n % 2 == 1:\n        return True\n    else:\n        return False\n',
      hint: 'Which remainder indicates an even number?',
      testCases: [
        { input: [2], expected: true },
        { input: [3], expected: false },
        { input: [0], expected: true },
        { input: [-4], expected: true },
      ],
    },
    {
      id: 'easy_multiply_list',
      snippetId: 'easy_multiply_list',
      title: 'Multiply Everything',
      functionName: 'multiply_list',
      complexity: 'simple',
      description: 'multiply_list(nums) should return the product of all numbers in the list. Right now it always returns 0.',
      code: 'def multiply_list(nums):\n    result = 0\n    for n in nums:\n        result = result * n\n    return result\n',
      hint: 'Check your starting value for multiplication.',
      testCases: [
        { input: [[2, 3, 4]], expected: 24 },
        { input: [[1, 5, 2]], expected: 10 },
        { input: [[-2, 3]], expected: -6 },
        { input: [[10]], expected: 10 },
      ],
    },
    {
      id: 'easy_reverse_string',
      snippetId: 'easy_reverse_string',
      title: 'Reverse it',
      functionName: 'reverse_string',
      complexity: 'simple',
      description: 'reverse_string(s) should return the string spelled backwards.',
      code: 'def reverse_string(s):\n    return s.reverse()\n',
      hint: 'Python strings do not have .reverse(). Try string slicing [::-1].',
      testCases: [
        { input: ['cat'], expected: 'tac' },
        { input: ['hello'], expected: 'olleh' },
        { input: ['a'], expected: 'a' },
      ],
    },
  ],
  medium: [
    {
      id: 'medium_reverse_words',
      snippetId: 'medium_reverse_words',
      title: 'Reverse Words',
      functionName: 'reverse_words',
      complexity: 'moderate',
      description: 'reverse_words(sentence) should return words in reverse order ("the rat runs" -> "runs rat the").',
      code: 'def reverse_words(sentence):\n    words = sentence.split(" ")\n    return " ".join(words)\n',
      hint: 'You split the words, but forgot to reverse the list of words!',
      testCases: [
        { input: ['the rat runs'], expected: 'runs rat the' },
        { input: ['fix the bug'], expected: 'bug the fix' },
        { input: ['one'], expected: 'one' },
      ],
    },
    {
      id: 'medium_off_by_one_countdown',
      snippetId: 'medium_off_by_one_countdown',
      title: 'Countdown to Zero',
      functionName: 'countdown_to_zero',
      complexity: 'moderate',
      description: 'countdown_to_zero(n) should count down from n to 0 (inclusive). Right now it omits 0.',
      code: 'def countdown_to_zero(n):\n    result = []\n    while n > 0:\n        result.append(n)\n        n -= 1\n    return result\n',
      hint: 'Check your while condition (while n >= 0).',
      testCases: [
        { input: [3], expected: [3, 2, 1, 0] },
        { input: [5], expected: [5, 4, 3, 2, 1, 0] },
        { input: [0], expected: [0] },
      ],
    },
  ],
  hard: [
    {
      id: 'hard_dedupe_preserve_order',
      snippetId: 'hard_dedupe_preserve_order',
      title: 'Dedupe Keeping Order',
      functionName: 'dedupe',
      complexity: 'complex',
      description: 'dedupe(items) should remove duplicate items while keeping their original order.',
      code: 'def dedupe(items):\n    return list(set(items))\n',
      hint: 'set() loses the original order. Maintain a seen set while appending to a new list.',
      testCases: [
        { input: [[3, 1, 3, 2, 1]], expected: [3, 1, 2] },
        { input: [[1, 1, 1]], expected: [1] },
      ],
    },
  ],
};

let currentTaskIndex: Record<string, number> = { easy: 0, medium: 0, hard: 0 };

export const fetchBugTask = async (difficulty: 'easy' | 'medium' | 'hard'): Promise<FullBugTask> => {
  const pool = BUG_TASK_BANK[difficulty] || BUG_TASK_BANK.easy;
  const idx = currentTaskIndex[difficulty] % pool.length;
  currentTaskIndex[difficulty] = (currentTaskIndex[difficulty] + 1) % pool.length;
  return pool[idx];
};

export const validateBugTask = async (
  snippetId: string,
  submittedCode: string
): Promise<BugValidationResponse> => {
  // Find task definition
  const allTasks = [
    ...BUG_TASK_BANK.easy,
    ...BUG_TASK_BANK.medium,
    ...BUG_TASK_BANK.hard,
  ];
  const task = allTasks.find((t) => t.snippetId === snippetId || t.id === snippetId);

  if (!task) {
    return { correct: false, error: 'Unknown bug task.' };
  }

  const result = await runTestCases(submittedCode, task.functionName, task.testCases);
  return {
    correct: result.ok,
    error: result.error || undefined,
  };
};
