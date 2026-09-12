export interface UserProfile {
  id: string;
  username: string;
}

export interface UserProgress {
  level: string;
  stars: number;
  unlockedLevels: string[];
  currency: number;
}

export interface RunResult {
  score: number;
  time: number;
  level: string;
  outcome: 'rat_caught' | 'house_burned' | 'time_up';
}

export interface BugTask {
  snippetId: string;
  code: string;
  complexity: 'simple' | 'moderate' | 'complex';
  description?: string;
  expectedOutput?: string; // Optional if using pyodide or standard tests
}

export interface BugValidationResponse {
  correct: boolean;
  error?: string;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
}
