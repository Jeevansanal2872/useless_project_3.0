import type { BugTask, BugValidationResponse } from '../types';
import { apiClient } from '../client';

// Mock snippet generator for when backend is offline
const MOCK_SNIPPETS = {
  easy: [
    {
      snippetId: 'easy-1',
      code: 'def add(a, b):\n    return a - b  # Fix this bug!',
      complexity: 'simple' as const,
      description: 'Fix the addition function so it adds two numbers.',
      expectedOutput: 'def add(a, b):\n    return a + b'
    }
  ],
  medium: [
    {
      snippetId: 'medium-1',
      code: 'def factorial(n):\n    if n == 0:\n        return 0 # Bug is here\n    return n * factorial(n-1)',
      complexity: 'moderate' as const,
      description: 'Fix the base case of the factorial function.',
      expectedOutput: 'def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n-1)'
    }
  ],
  hard: [
    {
      snippetId: 'hard-1',
      code: 'def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low < high: # Bug is here\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1',
      complexity: 'complex' as const,
      description: 'Fix the off-by-one error in the binary search while loop condition.',
      expectedOutput: 'def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1'
    }
  ]
};

export const fetchBugTask = async (difficulty: 'easy' | 'medium' | 'hard'): Promise<BugTask> => {
  if (import.meta.env.VITE_USE_MOCK_API === 'true' || true) {
    const list = MOCK_SNIPPETS[difficulty];
    return list[Math.floor(Math.random() * list.length)];
  }

  const { data } = await apiClient.get<BugTask>(`/bug-tasks?difficulty=${difficulty}`);
  return data;
};

export const validateBugTask = async (snippetId: string, submittedCode: string): Promise<BugValidationResponse> => {
  if (import.meta.env.VITE_USE_MOCK_API === 'true' || true) {
    // Basic mock validation (string match for simplicity)
    const allMocks = [...MOCK_SNIPPETS.easy, ...MOCK_SNIPPETS.medium, ...MOCK_SNIPPETS.hard];
    const task = allMocks.find(t => t.snippetId === snippetId);
    
    // Very rudimentary check for demo
    const isCorrect = task?.expectedOutput?.replace(/\s/g, '') === submittedCode.replace(/\s/g, '');
    
    return { correct: !!isCorrect };
  }

  const { data } = await apiClient.post<BugValidationResponse>('/bug-tasks/validate', { snippetId, submittedCode });
  return data;
};
