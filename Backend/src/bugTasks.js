// bugTasks.js
// A small bank of "fix the bug" Python tasks. Each task defines a broken
// function plus test cases; pyRunner.js actually executes the player's
// fixed code in Python (via Pyodide) and checks the test cases pass.

export const BUG_TASKS = {
  easy: [
    {
      id: 'easy_sum_to_n',
      title: 'Sum 1 to n',
      functionName: 'sum_to_n',
      description:
        'sum_to_n(n) should add up every integer from 1 to n (inclusive). Right now it returns the wrong total.',
      buggyCode:
        'def sum_to_n(n):\n' +
        '    total = 0\n' +
        '    for i in range(n):\n' +
        '        total += i\n' +
        '    return total\n',
      hint: 'Look closely at what range(n) actually produces.',
      testCases: [
        { input: [5], expected: 15 },
        { input: [1], expected: 1 },
        { input: [10], expected: 55 },
        { input: [0], expected: 0 },
      ],
    },
    {
      id: 'easy_is_even',
      title: 'Is it even?',
      functionName: 'is_even',
      description: 'is_even(n) should return True for even numbers and False for odd numbers.',
      buggyCode:
        'def is_even(n):\n' +
        '    if n % 2 == 1:\n' +
        '        return True\n' +
        '    else:\n' +
        '        return False\n',
      hint: 'Which remainder actually means "even"?',
      testCases: [
        { input: [2], expected: true },
        { input: [3], expected: false },
        { input: [0], expected: true },
        { input: [-4], expected: true },
      ],
    },
    {
      id: 'easy_max_of_three',
      title: 'Largest of three',
      functionName: 'max_of_three',
      description: 'max_of_three(a, b, c) should return the largest of the three numbers.',
      buggyCode:
        'def max_of_three(a, b, c):\n' +
        '    biggest = a\n' +
        '    if b > biggest:\n' +
        '        biggest = b\n' +
        '    if c > biggest:\n' +
        '        biggest = c\n' +
        '    return biggest\n',
      hint: 'Check your if statements carefully.',
      testCases: [
        { input: [1, 2, 3], expected: 3 },
        { input: [5, 2, 1], expected: 5 },
        { input: [2, 9, 4], expected: 9 },
      ],
    },
    {
      id: 'easy_multiply_list',
      title: 'Multiply Everything',
      functionName: 'multiply_list',
      description: 'multiply_list(nums) should return the product of all numbers in the list. Right now it always returns 0.',
      buggyCode:
        'def multiply_list(nums):\n' +
        '    result = 0\n' +
        '    for n in nums:\n' +
        '        result = result * n\n' +
        '    return result\n',
      hint: 'What happens when you multiply any number by 0? Check your starting value.',
      testCases: [
        { input: [[2, 3, 4]], expected: 24 },
        { input: [[1, 5, 2]], expected: 10 },
        { input: [[-2, 3]], expected: -6 },
        { input: [[10]], expected: 10 },
      ],
    },
    {
      id: 'easy_count_vowels',
      title: 'Count the Vowels',
      functionName: 'count_vowels',
      description: 'count_vowels(text) should return the total number of lowercase a, e, i, o, and u characters in the string.',
      buggyCode:
        'def count_vowels(text):\n' +
        '    count = 0\n' +
        '    for char in text:\n' +
        '        if char == "a" or char == "e":\n' +
        '            count += 1\n' +
        '    return count\n',
      hint: 'An "or" condition evaluates each part independently. Check all vowels (a, e, i, o, u).',
      testCases: [
        { input: ['apple'], expected: 2 },
        { input: ['rhythm'], expected: 0 },
        { input: ['beautiful'], expected: 5 },
        { input: ['abcde'], expected: 2 },
      ],
    },
    {
      id: 'easy_reverse_string',
      title: 'Reverse it',
      functionName: 'reverse_string',
      description: 'reverse_string(s) should return the string spelled backwards.',
      buggyCode:
        'def reverse_string(s):\n' +
        '    return s.reverse()\n',
      hint: 'Strings in Python do not have a .reverse() method like lists do. Try using string slicing [::-1].',
      testCases: [
        { input: ['cat'], expected: 'tac' },
        { input: ['hello'], expected: 'olleh' },
        { input: ['a'], expected: 'a' },
        { input: [''], expected: '' },
      ],
    },
    {
      id: 'easy_c_to_f',
      title: 'Celsius to Fahrenheit',
      functionName: 'c_to_f',
      description: 'c_to_f(celsius) should convert the temperature to Fahrenheit using the formula F = C * (9/5) + 32.',
      buggyCode:
        'def c_to_f(celsius):\n' +
        '    return celsius * (9 / 5 + 32)\n',
      hint: 'Check your parentheses. Are you adding 32 to the fraction before multiplying by Celsius?',
      testCases: [
        { input: [0], expected: 32 },
        { input: [100], expected: 212 },
        { input: [-40], expected: -40 },
        { input: [10], expected: 50 },
      ],
    },
    {
      id: 'easy_keep_positives',
      title: 'Only Positives',
      functionName: 'keep_positives',
      description: 'keep_positives(nums) should return a new list containing only the numbers strictly greater than zero.',
      buggyCode:
        'def keep_positives(nums):\n' +
        '    result = []\n' +
        '    for n in nums:\n' +
        '        if n > 0:\n' +
        '            result.append(nums)\n' +
        '    return result\n',
      hint: 'Look closely at what variable you are appending to the result list.',
      testCases: [
        { input: [[1, -2, 3]], expected: [1, 3] },
        { input: [[-1, -5, 0]], expected: [] },
        { input: [[4, 5]], expected: [4, 5] },
        { input: [[-10, 10]], expected: [10] },
      ],
    },
  ],

  medium: [
    {
      id: 'medium_reverse_words',
      title: 'Reverse the word order',
      functionName: 'reverse_words',
      description:
        'reverse_words(sentence) should return the words in reverse order, still space-separated. ' +
        '"the rat runs" -> "runs rat the".',
      buggyCode:
        'def reverse_words(sentence):\n' +
        '    words = sentence.split(" ")\n' +
        '    return " ".join(words)\n',
      hint: 'Splitting is correct — but you never reversed anything.',
      testCases: [
        { input: ['the rat runs'], expected: 'runs rat the' },
        { input: ['fix the bug'], expected: 'bug the fix' },
        { input: ['one'], expected: 'one' },
      ],
    },
    {
      id: 'medium_fibonacci',
      title: 'Off-by-one Fibonacci',
      functionName: 'fib',
      description: 'fib(n) should return the nth Fibonacci number (fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, ...).',
      buggyCode:
        'def fib(n):\n' +
        '    if n <= 1:\n' +
        '        return n\n' +
        '    a, b = 0, 1\n' +
        '    for _ in range(n):\n' +
        '        a, b = b, a + b\n' +
        '    return a\n',
      hint: 'Trace fib(2) by hand and see where the loop count drifts.',
      testCases: [
        { input: [0], expected: 0 },
        { input: [1], expected: 1 },
        { input: [2], expected: 1 },
        { input: [6], expected: 8 },
      ],
    },
    {
      id: 'medium_off_by_one_countdown',
      title: 'Countdown to Zero',
      functionName: 'countdown_to_zero',
      description: 'countdown_to_zero(n) should return a list of numbers counting down from n all the way to 0 (inclusive). Right now, it forgets the final number.',
      buggyCode:
        'def countdown_to_zero(n):\n' +
        '    result = []\n' +
        '    while n > 0:\n' +
        '        result.append(n)\n' +
        '        n -= 1\n' +
        '    return result\n',
      hint: 'Look closely at your while loop condition. When n becomes 0, does the code inside the loop run?',
      testCases: [
        { input: [3], expected: [3, 2, 1, 0] },
        { input: [5], expected: [5, 4, 3, 2, 1, 0] },
        { input: [0], expected: [0] },
      ],
    },
    {
      id: 'medium_off_by_one_index',
      title: 'Get the Last Item',
      functionName: 'get_last_item',
      description: 'get_last_item(items) should return the very last item in the list. Instead, it throws an IndexError.',
      buggyCode:
        'def get_last_item(items):\n' +
        '    length = len(items)\n' +
        '    return items[length]\n',
      hint: 'Python lists are zero-indexed. If a list has 3 items, they are at indices 0, 1, and 2. Is there an item at index 3?',
      testCases: [
        { input: [['apple', 'banana', 'cherry']], expected: 'cherry' },
        { input: [[10, 20]], expected: 20 },
        { input: [['solo']], expected: 'solo' },
      ],
    },
  ],

  hard: [
    {
      id: 'hard_binary_search',
      title: 'Binary search boundary',
      functionName: 'binary_search',
      description:
        'binary_search(sorted_list, target) should return the index of target in sorted_list, or -1 if absent.',
      buggyCode:
        'def binary_search(sorted_list, target):\n' +
        '    low, high = 0, len(sorted_list) - 1\n' +
        '    while low < high:\n' +
        '        mid = (low + high) // 2\n' +
        '        if sorted_list[mid] == target:\n' +
        '            return mid\n' +
        '        elif sorted_list[mid] < target:\n' +
        '            low = mid\n' +
        '        else:\n' +
        '            high = mid\n' +
        '    return -1\n',
      hint: 'Two bugs live here: the initial high bound, and the update that can get stuck on `low = mid`.',
      testCases: [
        { input: [[1, 3, 5, 7, 9], 7], expected: 3 },
        { input: [[1, 3, 5, 7, 9], 1], expected: 0 },
        { input: [[1, 3, 5, 7, 9], 4], expected: -1 },
        { input: [[2, 4], 4], expected: 1 },
      ],
    },
    {
      id: 'hard_dedupe_preserve_order',
      title: 'Dedupe, keep order',
      functionName: 'dedupe',
      description:
        'dedupe(items) should return a new list with duplicates removed, keeping the first occurrence order.',
      buggyCode:
        'def dedupe(items):\n' +
        '    return list(set(items))\n',
      hint: 'set() removes duplicates but throws away the original order.',
      testCases: [
        { input: [[3, 1, 3, 2, 1]], expected: [3, 1, 2] },
        { input: [[1, 1, 1]], expected: [1] },
        { input: [[]], expected: [] },
      ],
    },
  ],
};

/** Picks a random task for a difficulty, optionally avoiding a given id. */
export function pickRandomTask(difficulty, avoidId = null) {
  const pool = BUG_TASKS[difficulty] || BUG_TASKS.easy;
  const choices = pool.filter((t) => t.id !== avoidId);
  const list = choices.length > 0 ? choices : pool;
  return list[Math.floor(Math.random() * list.length)];
}
