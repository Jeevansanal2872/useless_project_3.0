// bugTasks.js
// A small bank of "fix the bug" Python tasks. Each task defines a broken
// function plus test cases; pyRunner.js actually executes the player's
// fixed code in Python (via Pyodide) and checks the test cases pass.
//
// This bank is intentionally small and easy to extend: add an object to
// the relevant difficulty array and it's immediately in rotation.

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
        '    if c > biggest\n' +
        '        biggest = c\n' +
        '    return biggest\n',
      hint: "There's a syntax error, not just a logic one — check every line ends properly.",
      testCases: [
        { input: [1, 2, 3], expected: 3 },
        { input: [5, 2, 1], expected: 5 },
        { input: [2, 9, 4], expected: 9 },
      ],
    },
    {
<<<<<<< HEAD:Backend/src/bugTasks.js
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
        '        if char == "a" or "e" or "i" or "o" or "u":\n' +
        '            count += 1\n' +
        '    return count\n',
      hint: 'An "or" condition evaluates each part independently. "e" by itself is considered truthy.',
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
    {
      id: 'easy_list_length',
      title: 'Manual Length',
      functionName: 'list_length',
      description: 'list_length(items) should count how many items are in the list without using the built-in len() function.',
      buggyCode:
        'def list_length(items):\n' +
        '    count = 0\n' +
        '    for i in range(items):\n' +
        '        count += 1\n' +
        '    return count\n',
      hint: 'The range() function expects an integer, but "items" is a list. How do you loop through elements directly?',
      testCases: [
        { input: [[1, 2, 3]], expected: 3 },
        { input: [['a', 'b']], expected: 2 },
        { input: [[]], expected: 0 },
        { input: [[42, 42, 42, 42]], expected: 4 },
      ],
    },
  ],
=======
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
      '        if char == "a" or "e" or "i" or "o" or "u":\n' +
      '            count += 1\n' +
      '    return count\n',
    hint: 'An "or" condition evaluates each part independently. "e" by itself is considered truthy.',
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
  {
    id: 'easy_list_length',
    title: 'Manual Length',
    functionName: 'list_length',
    description: 'list_length(items) should count how many items are in the list without using the built-in len() function.',
    buggyCode:
      'def list_length(items):\n' +
      '    count = 0\n' +
      '    for i in range(items):\n' +
      '        count += 1\n' +
      '    return count\n',
    hint: 'The range() function expects an integer, but "items" is a list. How do you loop through elements directly?',
    testCases: [
      { input: [[1, 2, 3]], expected: 3 },
      { input: [['a', 'b']], expected: 2 },
      { input: [[]], expected: 0 },
      { input: [[42, 42, 42, 42]], expected: 4 },
    ],
  },
  {
    id: 'easy_missing_colon',
    title: 'Check the Condition',
    functionName: 'is_positive',
    description: 'is_positive(n) should return True if n is strictly greater than zero. There is a syntax error preventing it from running.',
    buggyCode:
      'def is_positive(n):\n' +
      '    if n > 0\n' +
      '        return True\n' +
      '    else:\n' +
      '        return False\n',
    hint: 'In Python, control flow statements like `if`, `else`, and loops need a specific punctuation mark at the end of the line.',
    testCases: [
      { input: [5], expected: true },
      { input: [-2], expected: false },
      { input: [0], expected: false },
    ],
  },
  {
    id: 'easy_loop_indentation',
    title: 'Premature Return',
    functionName: 'sum_list',
    description: 'sum_list(nums) should add up all the numbers in a list. Right now, it always stops and returns after looking at the very first number.',
    buggyCode:
      'def sum_list(nums):\n' +
      '    total = 0\n' +
      '    for n in nums:\n' +
      '        total += n\n' +
      '        return total\n',
    hint: 'Look at the indentation of the return statement. Is it happening after the loop finishes, or during the very first step?',
    testCases: [
      { input: [[1, 2, 3]], expected: 6 },
      { input: [[5, 5]], expected: 10 },
      { input: [[-1, 1, 4]], expected: 4 },
      { input: [[]], expected: 0 },
    ],
  },
  {
    id: 'easy_def_syntax',
    title: 'Define it Right',
    functionName: 'greet',
    description: 'greet(name) should return "Hello, " followed by the name. The code will not run due to a syntax error on the very first line.',
    buggyCode:
      'def greet name:\n' +
      '    return "Hello, " + name\n',
    hint: 'How do you pass arguments to a function in Python? You are missing some essential punctuation around the parameter.',
    testCases: [
      { input: ['Alice'], expected: 'Hello, Alice' },
      { input: ['Bob'], expected: 'Hello, Bob' },
    ],
  },
  {
    id: 'easy_assignment_vs_comparison',
    title: 'Equal or Not?',
    functionName: 'is_zero',
    description: 'is_zero(n) should return True if the number is exactly 0. It currently throws a syntax error.',
    buggyCode:
      'def is_zero(n):\n' +
      '    if n = 0:\n' +
      '        return True\n' +
      '    return False\n',
    hint: 'A single `=` assigns a value to a variable. Which operator actually compares two values to see if they are equal?',
    testCases: [
      { input: [0], expected: true },
      { input: [5], expected: false },
      { input: [-1], expected: false },
    ],
  },
  {
    id: 'easy_else_indent',
    title: 'Align the Else',
    functionName: 'check_password',
    description: 'check_password(pwd) should return "Access Granted" if the password is "secret" and "Access Denied" otherwise. Watch out for an IndentationError.',
    buggyCode:
      'def check_password(pwd):\n' +
      '    if pwd == "secret":\n' +
      '        return "Access Granted"\n' +
      '      else:\n' +
      '        return "Access Denied"\n',
    hint: 'The `else` keyword must align perfectly with its corresponding `if`. Check your spaces.',
    testCases: [
      { input: ['secret'], expected: 'Access Granted' },
      { input: ['password123'], expected: 'Access Denied' },
      { input: ['SECRET'], expected: 'Access Denied' },
    ],
  },
  {
    id: 'easy_unclosed_string',
    title: 'Unclosed Text',
    functionName: 'get_warning',
    description: 'get_warning() should simply return the string "Warning: Low Battery". It has a syntax error.',
    buggyCode:
      'def get_warning():\n' +
      '    return "Warning: Low Battery\n',
    hint: 'Strings must begin and end with matching quotation marks.',
    testCases: [
      { input: [], expected: 'Warning: Low Battery' },
    ],
  }
],
>>>>>>> 8cae4d2cf6e62f706a4e304d13a2230d834e0203:src/bugTasks.js

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
      id: 'medium_running_total_default',
      title: 'The sticky default list',
      functionName: 'add_score',
      description:
        'add_score(points, history=[]) should append points to a fresh list each call and return it. ' +
        'Right now scores leak between unrelated calls.',
      buggyCode:
        'def add_score(points, history=[]):\n' +
        '    history.append(points)\n' +
        '    return history\n',
      hint: "Python's mutable default argument gotcha: a default list is created once, not per call.",
      testCases: [
        { input: [3], expected: [3] },
        { input: [5], expected: [5] },
        { input: [1], expected: [1] },
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
  {
    id: 'medium_off_by_one_range',
    title: 'Sum Between A and B',
    functionName: 'sum_between',
    description: 'sum_between(a, b) should sum all integers from a to b, including both a and b. It currently stops one number short.',
    buggyCode:
      'def sum_between(a, b):\n' +
      '    total = 0\n' +
      '    for i in range(a, b):\n' +
      '        total += i\n' +
      '    return total\n',
    hint: 'The range(start, stop) function goes up to, but does NOT include, the stop value. How can you ensure b is included?',
    testCases: [
      { input: [1, 3], expected: 6 },
      { input: [5, 5], expected: 5 },
      { input: [10, 12], expected: 33 },
    ],
  },
  {
    id: 'medium_type_error_concat',
    title: 'Format Age',
    functionName: 'format_age',
    description: 'format_age(name, age) should return a string like "Alice is 25 years old." It currently crashes with a TypeError.',
    buggyCode:
      'def format_age(name, age):\n' +
      '    return name + " is " + age + " years old."\n',
    hint: 'You cannot concatenate a string and an integer directly using the + operator. How do you convert a number to a string first (or use an f-string)?',
    testCases: [
      { input: ['Alice', 25], expected: 'Alice is 25 years old.' },
      { input: ['Bob', 8], expected: 'Bob is 8 years old.' },
    ],
  },
  {
    id: 'medium_type_error_iterable',
    title: 'Count the Digits',
    functionName: 'count_digits',
    description: 'count_digits(number) should return the number of digits in a given positive integer. It throws a TypeError because it tries to loop over a number.',
    buggyCode:
      'def count_digits(number):\n' +
      '    count = 0\n' +
      '    for digit in number:\n' +
      '        count += 1\n' +
      '    return count\n',
    hint: 'Integers are not "iterable" in Python. You need to convert the number into a sequence of characters (a string) before you can loop through its digits.',
    testCases: [
      { input: [456], expected: 3 },
      { input: [9], expected: 1 },
      { input: [10000], expected: 5 },
    ],
  },
  {
    id: 'medium_type_error_list_concat',
    title: 'Add to Cart',
    functionName: 'add_to_cart',
    description: 'add_to_cart(cart, item) should return a new list containing all items in the cart, plus the new item at the end. It crashes when trying to add them together.',
    buggyCode:
      'def add_to_cart(cart, item):\n' +
      '    return cart + item\n',
    hint: 'The + operator can combine two lists, but it cannot combine a list and a single bare string directly. Wrap the item in a list first.',
    testCases: [
      { input: [['apple', 'banana'], 'orange'], expected: ['apple', 'banana', 'orange'] },
      { input: [[], 'milk'], expected: ['milk'] },
      { input: [['book'], 'pen'], expected: ['book', 'pen'] },
    ],
  }
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
        '    low, high = 0, len(sorted_list)\n' +
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
    {
      id: 'hard_memoized_climb_stairs',
      title: 'Ways to climb the stairs',
      functionName: 'climb_stairs',
      description:
        'climb_stairs(n) counts the ways to climb n stairs taking 1 or 2 steps at a time ' +
        '(climb_stairs(0)=1, climb_stairs(1)=1, climb_stairs(2)=2, climb_stairs(3)=3, climb_stairs(4)=5).',
      buggyCode:
        'def climb_stairs(n, memo=None):\n' +
        '    if memo is None:\n' +
        '        memo = {}\n' +
        '    if n < 0:\n' +
        '        return 0\n' +
        '    if n == 0:\n' +
        '        return 0\n' +
        '    if n in memo:\n' +
        '        return memo[n]\n' +
        '    memo[n] = climb_stairs(n - 1, memo) + climb_stairs(n - 2, memo)\n' +
        '    return memo[n]\n',
      hint: 'What should the base case at n == 0 actually return, if standing at the top counts as one way?',
      testCases: [
        { input: [0], expected: 1 },
        { input: [1], expected: 1 },
        { input: [2], expected: 2 },
        { input: [4], expected: 5 },
      ],
    },
    {
    id: 'medium_scope_accumulator',
    title: 'Resetting Total',
    functionName: 'calculate_total',
    description: 'calculate_total(prices) should add up all the prices in a list. Right now, it only ever returns the very last price in the list.',
    buggyCode:
      'def calculate_total(prices):\n' +
      '    for price in prices:\n' +
      '        total = 0\n' +
      '        total += price\n' +
      '    return total\n',
    hint: 'Look at where the "total" variable is created. Is it resetting to 0 on every single step of the loop?',
    testCases: [
      { input: [[10, 20, 30]], expected: 60 },
      { input: [[5, 5]], expected: 10 },
      { input: [[100]], expected: 100 },
    ],
  },
  {
    id: 'medium_scope_unbound',
    title: 'Missing Fallback',
    functionName: 'get_status',
    description: 'get_status(score) should return "High" if the score is over 50, and "Low" otherwise. It crashes with an UnboundLocalError for lower scores.',
    buggyCode:
      'def get_status(score):\n' +
      '    if score > 50:\n' +
      '        status = "High"\n' +
      '    return status\n',
    hint: 'If the score is 50 or less, the code inside the "if" block never runs. What is the value of "status" in that case?',
    testCases: [
      { input: [75], expected: 'High' },
      { input: [40], expected: 'Low' },
      { input: [50], expected: 'Low' },
    ],
  },
  {
    id: 'medium_logic_fizzbuzz',
    title: 'Order of Operations',
    functionName: 'fizzbuzz_check',
    description: 'fizzbuzz_check(n) should return "Fizz" for multiples of 3, "Buzz" for 5, and "FizzBuzz" for 15. Right now, 15 returns "Fizz" instead.',
    buggyCode:
      'def fizzbuzz_check(n):\n' +
      '    if n % 3 == 0:\n' +
      '        return "Fizz"\n' +
      '    elif n % 5 == 0:\n' +
      '        return "Buzz"\n' +
      '    elif n % 15 == 0:\n' +
      '        return "FizzBuzz"\n' +
      '    return str(n)\n',
    hint: 'Python executes "if / elif" statements from top to bottom and stops at the first true condition. Since 15 is a multiple of 3, it never checks if it is a multiple of 15.',
    testCases: [
      { input: [3], expected: 'Fizz' },
      { input: [10], expected: 'Buzz' },
      { input: [15], expected: 'FizzBuzz' },
      { input: [7], expected: '7' },
    ],
  },
  {
    id: 'medium_logic_and_or',
    title: 'Can Go Outside?',
    functionName: 'can_play_outside',
    description: 'can_play_outside(is_raining, has_umbrella) should return True if it is NOT raining, OR if you have an umbrella. It currently enforces the wrong logic.',
    buggyCode:
      'def can_play_outside(is_raining, has_umbrella):\n' +
      '    if not is_raining and has_umbrella:\n' +
      '        return True\n' +
      '    return False\n',
    hint: 'If it is not raining, you should be able to play outside regardless of whether you have an umbrella or not. Check your logical operators.',
    testCases: [
      { input: [false, false], expected: true },
      { input: [true, true], expected: true },
      { input: [true, false], expected: false },
      { input: [false, true], expected: true },
    ],
  },
  {
    id: 'medium_logic_min_value',
    title: 'Find the Minimum',
    functionName: 'find_minimum',
    description: 'find_minimum(nums) should return the smallest number in a list. It fails completely when all numbers in the list are negative.',
    buggyCode:
      'def find_minimum(nums):\n' +
      '    smallest = 0\n' +
      '    for n in nums:\n' +
      '        if n < smallest:\n' +
      '            smallest = n\n' +
      '    return smallest\n',
    hint: 'By hardcoding the initial "smallest" value to 0, you assume there will always be a positive number. What if you initialized it using the first item in the list?',
    testCases: [
      { input: [[5, 2, 9]], expected: 2 },
      { input: [[-10, -5, -20]], expected: -20 },
      { input: [[0, 4, -1]], expected: -1 },
    ],
  },
  {
    id: 'medium_logic_return_early',
    title: 'Are They All Even?',
    functionName: 'are_all_even',
    description: 'are_all_even(nums) should return True ONLY if every single number in the list is even. Right now, it just checks the very first number and ignores the rest.',
    buggyCode:
      'def are_all_even(nums):\n' +
      '    for n in nums:\n' +
      '        if n % 2 == 0:\n' +
      '            return True\n' +
      '        else:\n' +
      '            return False\n' +
      '    return True\n',
    hint: 'If the first number is even, you cannot guarantee the rest are even yet. You should only `return False` early if you find an odd number, and wait to `return True` until the loop finishes.',
    testCases: [
      { input: [[2, 4, 6]], expected: true },
      { input: [[2, 5, 8]], expected: false },
      { input: [[3, 4, 6]], expected: false },
      { input: [[]], expected: true },
    ],
  }
  ],
};

/** Picks a random task for a difficulty, optionally avoiding a given id. */
export function pickRandomTask(difficulty, avoidId = null) {
  const pool = BUG_TASKS[difficulty] || BUG_TASKS.easy;
  const choices = pool.filter((t) => t.id !== avoidId);
  const list = choices.length > 0 ? choices : pool;
  return list[Math.floor(Math.random() * list.length)];
}
