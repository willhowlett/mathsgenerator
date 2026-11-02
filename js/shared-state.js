export const validLengths = ['ones', 'tens', 'hundreds', 'thousands'];
export const validCounts = [4, 6, 9, 12, 16, 20];

export function encodeSharedState(state) {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function decodeWorksheetState(hash, validateQuestions, artworkThemes) {
  if (!hash || hash.length < 2) return null;
  try {
    let token = hash.slice(1).replace(/-/g, '+').replace(/_/g, '/');
    token += '='.repeat((4 - token.length % 4) % 4);
    const binary = atob(token);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const saved = JSON.parse(new TextDecoder().decode(bytes));
    if (!validCounts.includes(saved.count)
      || ([2, 3, 4, 5, 6, 7, 8, 9].includes(saved.v) && typeof saved.includeAnswers !== 'boolean')) return null;

    if ([7, 8, 9].includes(saved.v)) {
      const oldLength = saved.v === 7 ? saved.length : null;
      const state = saved.v === 9 ? saved : {
        ...saved,
        v: 9,
        lengths: saved.v === 7
          ? (validLengths.includes(oldLength) ? [oldLength] : [])
          : saved.lengths,
        questions: Array.isArray(saved.questions) ? saved.questions.map((question) => {
          if (Array.isArray(question.operandLengths)) return question;
          const length = question.length || oldLength;
          return { ...question, operandLengths: [length, length] };
        }) : saved.questions
      };
      if (!['column', 'inline'].includes(state.method)
        || !Array.isArray(state.operations) || !Array.isArray(state.lengths)
        || state.lengths.some((length) => !validLengths.includes(length))
        || typeof state.exchange !== 'boolean' || typeof state.includeAnswers !== 'boolean'
        || !Array.isArray(state.questions)
        || (!artworkThemes.includes(state.artwork) && state.artwork !== 'none')
        || !validateQuestions(state.questions, state)) return null;
      return state;
    }

    if (![1, 2, 3, 4, 5, 6].includes(saved.v) || !Array.isArray(saved.questions)) return null;
    const oldOperation = saved.operation || 'addition';
    const operations = oldOperation === 'mixed'
      ? ['addition', 'subtraction']
      : oldOperation === 'mixed-multiplication-division'
        ? ['multiplication', 'division']
        : [oldOperation];
    const questions = saved.questions.map((question) => {
      if (Array.isArray(question) && question.length === 3) {
        return { a: question[0], b: question[1], operation: question[2] ? 'subtraction' : 'addition' };
      }
      if (question?.kind === 'prompt') {
        const match = question.prompt.match(/^(\d+) ([×÷]) (\d+) =/);
        if (!match) return null;
        return { a: Number(match[1]), b: Number(match[3]), operation: match[2] === '×' ? 'multiplication' : 'division' };
      }
      if (question && Number.isInteger(question.a) && Number.isInteger(question.b)) {
        return { a: question.a, b: question.b, operation: question.operation || (question.subtract ? 'subtraction' : 'addition') };
      }
      return null;
    });
    if (questions.some((question) => !question)) return null;

    const method = String(saved.skill || '').includes('column') ? 'column' : 'inline';
    const lengthForDigits = (digitCount) => digitCount <= 1 ? 'ones'
      : digitCount === 2 ? 'tens' : digitCount === 3 ? 'hundreds' : 'thousands';
    const questionsWithLengths = questions.map((question) => {
      const operands = question.operation === 'division' ? [question.b, question.a / question.b] : [question.a, question.b];
      return { ...question, operandLengths: operands.map((value) => lengthForDigits(String(value).length)) };
    });
    const lengths = [...new Set(questionsWithLengths.flatMap(({ operandLengths }) => operandLengths))];
    return {
      v: 9,
      method,
      operations,
      lengths,
      count: saved.count,
      exchange: saved.exchange === true,
      artwork: artworkThemes.includes(saved.artwork) ? saved.artwork : 'none',
      includeAnswers: saved.includeAnswers === true,
      questions: questionsWithLengths,
      legacy: true
    };
  } catch {
    return null;
  }
}
