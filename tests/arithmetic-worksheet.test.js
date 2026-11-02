import { describe, expect, test } from '@jest/globals';
import { answerForQuestion, generateQuestions, hasExchange, validateQuestions } from '../js/generators/arithmetic-worksheet.js';

describe('generic arithmetic worksheet generator', () => {
  test.each(['column', 'inline'])('%s worksheets generate all selected operation types without zero operands', (method) => {
    const settings = {
      count: 20,
      method,
      operations: ['addition', 'subtraction', 'multiplication', 'division'],
      lengths: ['hundreds'],
      exchange: false
    };
    const questions = generateQuestions(settings);

    expect(questions).toHaveLength(settings.count);
    expect(new Set(questions.map(({ operation }) => operation))).toEqual(new Set(settings.operations));
    expect(questions.every(({ a, b }) => a > 0 && b > 0)).toBe(true);
    expect(questions.filter(({ operation }) => operation === 'division').every(({ a, b }) => a % b === 0)).toBe(true);
    expect(validateQuestions(questions, settings)).toBe(true);
    expect(questions.every((question) => answerForQuestion(question) > 0)).toBe(true);
  });

  test.each([
    ['ones', 1, 9],
    ['tens', 10, 99],
    ['hundreds', 100, 999],
    ['thousands', 1000, 9999]
  ])('uses the selected %s range for operands and division answers', (length, minimum, maximum) => {
    const settings = {
      count: 20,
      method: 'inline',
      operations: ['addition', 'subtraction', 'multiplication', 'division'],
      lengths: [length],
      exchange: false
    };
    const questions = generateQuestions(settings);

    expect(questions.every(({ a, b, operation }) => operation === 'division'
      ? b >= minimum && b <= maximum && a / b >= minimum && a / b <= maximum
      : a >= minimum && a <= maximum && b >= minimum && b <= maximum)).toBe(true);
    expect(validateQuestions(questions, settings)).toBe(true);
  });

  test('mixes selected number lengths across each sum', () => {
    const settings = {
      count: 12, method: 'column', operations: ['addition'], lengths: ['tens', 'hundreds'], exchange: false
    };
    const questions = generateQuestions(settings);
    expect(questions.some(({ a, b, operandLengths }) => operandLengths[0] === 'tens' && operandLengths[1] === 'hundreds' && a >= 10 && a <= 99 && b >= 100)).toBe(true);
    expect(questions.some(({ a, b, operandLengths }) => operandLengths[0] === 'hundreds' && operandLengths[1] === 'tens' && a >= 100 && b >= 10 && b <= 99)).toBe(true);
    expect(questions.every(({ operandLengths }) => operandLengths.every((length) => ['tens', 'hundreds'].includes(length)))).toBe(true);
    expect(validateQuestions(questions, settings)).toBe(true);
  });

  test('column addition and subtraction include exchanges on at least half the relevant questions when selected', () => {
    const settings = {
      count: 20,
      method: 'column',
      operations: ['addition', 'subtraction'],
      lengths: ['hundreds'],
      exchange: true
    };
    const questions = generateQuestions(settings);
    const relevantQuestions = questions.filter(({ operation }) => ['addition', 'subtraction'].includes(operation));

    expect(relevantQuestions.filter(({ a, b, operation }) => hasExchange(a, b, operation)).length)
      .toBeGreaterThanOrEqual(Math.ceil(relevantQuestions.length / 2));
    expect(validateQuestions(questions, settings)).toBe(true);
  });

  test.each(['multiplication', 'division'])('column %s includes exchanges on at least half the questions when selected', (operation) => {
    const settings = {
      count: 20,
      method: 'column',
      operations: [operation],
      lengths: ['tens', 'hundreds'],
      exchange: true
    };
    const questions = generateQuestions(settings);
    const exchanging = questions.filter(({ a, b }) => hasExchange(a, b, operation));

    expect(exchanging.length).toBeGreaterThanOrEqual(Math.ceil(questions.length / 2));
    expect(validateQuestions(questions, settings)).toBe(true);
  });

  test.each(['multiplication', 'division'])('column %s has no exchanges when the option is off', (operation) => {
    const settings = {
      count: 12,
      method: 'column',
      operations: [operation],
      lengths: ['tens', 'hundreds'],
      exchange: false
    };
    const questions = generateQuestions(settings);

    expect(questions.every(({ a, b }) => !hasExchange(a, b, operation))).toBe(true);
    expect(validateQuestions(questions, settings)).toBe(true);
  });

  test('detects multiplication carries and division regrouping', () => {
    expect(hasExchange(27, 6, 'multiplication')).toBe(true);
    expect(hasExchange(12, 3, 'multiplication')).toBe(false);
    expect(hasExchange(1575, 25, 'division')).toBe(true);
    expect(hasExchange(1000000, 1000, 'division')).toBe(false);
  });

  test('single digit subtraction does not request exchanges', () => {
    const settings = { count: 12, method: 'column', operations: ['subtraction'], lengths: ['ones'], exchange: true };
    const questions = generateQuestions(settings);

    expect(questions.every(({ a, b }) => a >= b && !hasExchange(a, b, 'subtraction'))).toBe(true);
    expect(validateQuestions(questions, settings)).toBe(true);
  });

  test('inline addition allows carrying without an exchange control', () => {
    expect(validateQuestions([{ a: 58, b: 37, operation: 'addition', operandLengths: ['tens', 'tens'] }], {
      count: 1, method: 'inline', operations: ['addition'], lengths: ['tens'], exchange: false
    })).toBe(true);
  });

  test('rejects a zero operand and treats an empty operation selection as all operations', () => {
    expect(validateQuestions([{ a: 5, b: 0, operation: 'addition' }], {
      count: 1, method: 'inline', operations: ['addition'], lengths: ['ones'], exchange: false
    })).toBe(false);
    const settings = { count: 20, method: 'column', operations: [], lengths: ['tens'], exchange: false };
    const questions = generateQuestions(settings);
    expect(new Set(questions.map(({ operation }) => operation))).toEqual(new Set(['addition', 'subtraction', 'multiplication', 'division']));
    expect(validateQuestions(questions, settings)).toBe(true);
  });
});
