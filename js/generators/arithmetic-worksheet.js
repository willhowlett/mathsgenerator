const operations = ['addition', 'subtraction', 'multiplication', 'division'];
const lengthRanges = {
  ones: [1, 9],
  tens: [10, 99],
  hundreds: [100, 999],
  thousands: [1000, 9999]
};
const signs = { addition: '+', subtraction: '−', multiplication: '×', division: '÷' };
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index--) {
    const other = randomInt(0, index);
    [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}

function randomNumber(length) {
  const [min, max] = lengthRanges[length];
  return randomInt(min, max);
}

function fitsLength(value, length) {
  const [min, max] = lengthRanges[length];
  return value >= min && value <= max;
}

export function hasExchange(a, b, operation) {
  if (operation === 'multiplication') return multiplicationHasCarry(a, b);
  if (operation === 'division') return divisionHasRegrouping(a, b);

  let carryOrBorrow = 0;
  while (a > 0 || b > 0 || carryOrBorrow) {
    const digitA = a % 10;
    const digitB = b % 10;
    if (operation === 'subtraction') {
      const needsBorrow = digitA - carryOrBorrow < digitB;
      if (needsBorrow) return true;
      carryOrBorrow = 0;
    } else {
      const sum = digitA + digitB + carryOrBorrow;
      carryOrBorrow = sum >= 10 ? 1 : 0;
      if (carryOrBorrow) return true;
    }
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function multiplicationHasCarry(multiplicand, multiplier) {
  const rows = [...String(multiplier)].reverse().map((multiplierDigit) => {
    const digit = Number(multiplierDigit);
    const row = [];
    let carry = 0;
    for (const multiplicandDigit of [...String(multiplicand)].reverse()) {
      const product = Number(multiplicandDigit) * digit + carry;
      if (product >= 10) return { hasCarry: true, row: [] };
      row.push(product % 10);
      carry = Math.floor(product / 10);
    }
    if (carry) return { hasCarry: true, row: [] };
    return { hasCarry: false, row };
  });
  if (rows.some(({ hasCarry }) => hasCarry)) return true;

  let carry = 0;
  const resultDigits = Math.max(...rows.map(({ row }, rowIndex) => row.length + rowIndex));
  for (let place = 0; place < resultDigits; place++) {
    const sum = rows.reduce((total, { row }, rowIndex) => total + (row[place - rowIndex] || 0), carry);
    if (sum >= 10) return true;
    carry = Math.floor(sum / 10);
  }
  return carry > 0;
}

function divisionHasRegrouping(dividend, divisor) {
  let remainder = 0;
  let started = false;
  const digits = String(dividend);
  for (let index = 0; index < digits.length; index++) {
    const partial = remainder * 10 + Number(digits[index]);
    if (!started && partial < divisor) {
      remainder = partial;
      continue;
    }
    started = true;
    remainder = partial % divisor;
    if (remainder > 0 && index < digits.length - 1) return true;
  }
  return false;
}

function makeQuestion(operation, operandLengths, needsExchange = null) {
  for (let attempt = 0; attempt < 10000; attempt++) {
    let [lengthA, lengthB] = operandLengths;
    let a = randomNumber(lengthA);
    let b = randomNumber(lengthB);
    if (operation === 'division') {
      const quotient = randomNumber(lengthB);
      b = randomNumber(lengthA);
      a = b * quotient;
    } else if (operation === 'subtraction') {
      if (a === b) continue;
      if (b > a) {
        [a, b] = [b, a];
        [lengthA, lengthB] = [lengthB, lengthA];
      }
    }
    if (needsExchange !== null && hasExchange(a, b, operation) !== needsExchange) continue;
    return { a, b, operation, operandLengths: [lengthA, lengthB] };
  }
  throw new Error(`Could not generate a ${operation} question for lengths ${operandLengths.join(' and ')}.`);
}

function canUseExchange(operation, operandLengths) {
  return !['subtraction', 'division'].includes(operation)
    || operandLengths.some((length) => length !== 'ones');
}

export function generateQuestions({ count, method, operations: selectedOperations, lengths: selectedLengths = [], exchange = false }) {
  if (!Number.isInteger(count) || count < 1) throw new Error('Question count must be a positive integer.');
  if (!['column', 'inline'].includes(method)) throw new Error('Choose column or inline method.');
  if (!Array.isArray(selectedLengths) || selectedLengths.some((length) => !lengthRanges[length])) throw new Error('Choose supported number lengths.');
  if (!Array.isArray(selectedOperations) || selectedOperations.some((operation) => !operations.includes(operation))) {
    throw new Error('Choose valid operations.');
  }
  const chosenOperations = selectedOperations.length ? selectedOperations : operations;

  const chosenLengths = selectedLengths.length ? selectedLengths : Object.keys(lengthRanges);
  const questionOperations = shuffle(Array.from({ length: count }, (_, index) => chosenOperations[index % chosenOperations.length]));
  const mixedLengthPairs = chosenLengths.flatMap((first, firstIndex) => chosenLengths
    .filter((second, secondIndex) => secondIndex !== firstIndex)
    .map((second) => [first, second]));
  const priorityPairs = chosenLengths.length > 1
    ? chosenLengths.map((length, index) => [length, chosenLengths[(index + 1) % chosenLengths.length]])
    : [];
  const remainingMixedPairs = mixedLengthPairs.filter(([first, second]) => !priorityPairs.some(([priorityFirst, prioritySecond]) => first === priorityFirst && second === prioritySecond));
  const sameLengthPairs = shuffle(chosenLengths.map((length) => [length, length]));
  const lengthPairs = [...priorityPairs, ...shuffle(remainingMixedPairs), ...sameLengthPairs];
  const tasks = questionOperations.map((operation, index) => ({
    operation,
    operandLengths: lengthPairs[index % lengthPairs.length],
    index
  }));
  const exchangeSlots = tasks.filter(({ operation, operandLengths }) => canUseExchange(operation, operandLengths));
  const exchangeIndexes = new Set(method === 'column' && exchange && exchangeSlots.length
    ? shuffle(exchangeSlots).slice(0, Math.ceil(exchangeSlots.length / 2)).map(({ index }) => index)
    : []);

  return tasks.map(({ operation, operandLengths, index }) => makeQuestion(
    operation, operandLengths, method === 'column' ? exchangeIndexes.has(index) : null
  ));
}

export function validateQuestions(questions, settings) {
  const { count, method, operations: selectedOperations, lengths: selectedLengths = [], exchange = false } = settings;
  if (!Array.isArray(questions) || questions.length !== count
    || !['column', 'inline'].includes(method)
    || !Array.isArray(selectedLengths) || selectedLengths.some((length) => !lengthRanges[length])
    || !Array.isArray(selectedOperations)) return false;
  if (selectedOperations.some((operation) => !operations.includes(operation))) return false;
  const chosenOperations = selectedOperations.length ? selectedOperations : operations;

  const allowedLengths = selectedLengths.length ? selectedLengths : Object.keys(lengthRanges);
  for (const question of questions) {
    if (!question || !Number.isInteger(question.a) || !Number.isInteger(question.b)
      || question.a <= 0 || question.b <= 0 || !chosenOperations.includes(question.operation)
      || !Array.isArray(question.operandLengths) || question.operandLengths.length !== 2
      || question.operandLengths.some((length) => !allowedLengths.includes(length))) return false;
    if (question.operation === 'division') {
      if (question.a % question.b !== 0
        || !fitsLength(question.b, question.operandLengths[0])
        || !fitsLength(question.a / question.b, question.operandLengths[1])) return false;
    } else if (!fitsLength(question.a, question.operandLengths[0])
      || !fitsLength(question.b, question.operandLengths[1])) return false;
    if (question.operation === 'subtraction' && question.a <= question.b) return false;
    if (method === 'column' && !exchange && hasExchange(question.a, question.b, question.operation)) return false;
    if (question.operation === 'multiplication' && question.a * question.b > 99980001) return false;
  }

  if (exchange && method === 'column') {
    const exchangeSlots = questions.filter(({ operation, operandLengths }) => canUseExchange(operation, operandLengths));
    const exchanging = exchangeSlots.filter(({ a, b, operation }) => hasExchange(a, b, operation));
    if (exchanging.length < Math.ceil(exchangeSlots.length / 2)) return false;
  }
  return true;
}

export function answerForQuestion({ a, b, operation }) {
  switch (operation) {
    case 'addition': return a + b;
    case 'subtraction': return a - b;
    case 'multiplication': return a * b;
    case 'division': return a / b;
    default: return null;
  }
}

export const operationSigns = signs;
export const supportedOperations = operations;
export const supportedLengths = Object.keys(lengthRanges);
