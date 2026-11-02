import { answerForQuestion, operationSigns } from './generators/arithmetic-worksheet.js';

/** Render shared arithmetic questions in the selected worksheet layout. */
export function renderQuestions(container, questions, layout = 'column') {
  const printColumns = Math.min(4, Math.ceil(Math.sqrt(questions.length)));
  container.style.setProperty('--print-columns', printColumns);
  container.style.setProperty('--print-rows', Math.ceil(questions.length / printColumns));
  container.replaceChildren(...questions.map((question, index) => {
    const { a, b } = question;
    const operation = question.operation || (question.subtract ? 'subtraction' : 'addition');
    if (question.kind === 'prompt') {
      const card = document.createElement('div'); card.className = 'question prompt-question';
      const number = document.createElement('span'); number.className = 'question-num'; number.textContent = String(index + 1).padStart(2, '0');
      const content = document.createElement('div'); content.className = 'prompt-content';
      const prompt = document.createElement('span'); prompt.className = 'prompt-text'; prompt.textContent = question.prompt;
      const answer = document.createElement('span'); answer.className = `prompt-answer${question.answer.length > 12 ? ' prompt-answer-long' : ''}`;
      content.append(prompt, answer);
      card.append(number, content);
      return card;
    }
    const card = document.createElement('div'); card.className = 'question';
    const number = document.createElement('span'); number.className = 'question-num'; number.textContent = String(index + 1).padStart(2, '0');
    if (layout === 'inline' || layout === 'horizontal') {
      card.classList.add('mental-question');
      const equation = document.createElement('div'); equation.className = 'mental-equation';
      const first = document.createElement('span'); first.textContent = a;
      const sign = document.createElement('span'); sign.textContent = operationSigns[operation] || '+';
      const second = document.createElement('span'); second.textContent = b;
      const equals = document.createElement('span'); equals.textContent = '=';
      const answer = document.createElement('span'); answer.className = 'mental-answer';
      equation.append(first, sign, second, equals, answer);
      const equationCharacters = String(a).length + String(b).length + 3;
      equation.style.setProperty('--equation-font-cqw', `${Math.min(3, 24 / equationCharacters)}cqw`);
      equation.style.setProperty('--equation-font-print', `${Math.max(8, 15 - (equationCharacters - 7) * 0.55)}pt`);
      const answerLength = String(answerForQuestion(question)).length;
      answer.style.setProperty('--mental-answer-cqw', `${Math.max(5, answerLength * 1.3)}cqw`);
      answer.style.setProperty('--mental-answer-print', `${Math.max(12, answerLength * 2.5)}mm`);
      card.append(number, equation);
      return card;
    }
    const sum = document.createElement('div'); sum.className = 'sum';
    const largestOperandLength = Math.max(String(a).length, String(b).length, String(answerForQuestion(question)).length);
    sum.style.setProperty('--sum-digit-count', largestOperandLength);
    const availableFontSize = questions.length <= 6 ? 28 : questions.length <= 12 ? 25 : questions.length <= 16 ? 21 : 18;
    const preferredFontSize = Math.max(12, availableFontSize - (largestOperandLength - 2) * 2);
    const sumFontSize = operation === 'multiplication' && questions.length > 12
      ? Math.min(preferredFontSize, questions.length > 16 ? 9 : 12)
      : preferredFontSize;
    sum.style.setProperty('--sum-font-cqw', `${Math.max(1.6, sumFontSize / 6)}cqw`);
    sum.style.setProperty('--sum-font-print', `${Math.max(9, sumFontSize)}pt`);
    if (operation === 'multiplication') {
      renderLongMultiplication(sum, question);
      card.append(number, sum);
      return card;
    }
    if (operation === 'division') {
      renderLongDivision(sum, question);
      card.append(number, sum);
      return card;
    }
    const table = document.createElement('table'); table.className = 'sum-table';
    table.style.width = `${0.85 + largestOperandLength * 0.72}em`;
    const columns = document.createElement('colgroup');
    const signColumn = document.createElement('col'); signColumn.className = 'sum-sign-column'; columns.append(signColumn);
    for (let digit = 0; digit < largestOperandLength; digit++) {
      const column = document.createElement('col'); column.className = 'sum-digit-column'; columns.append(column);
    }
    const body = document.createElement('tbody');
    body.append(createDigitRow(a, largestOperandLength, ''), createDigitRow(b, largestOperandLength, operationSigns[operation] || '+'));
    table.append(columns, body);
    const rule = document.createElement('div'); rule.className = 'sum-rule';
    rule.style.width = `${largestOperandLength * 0.72}em`;
    const answer = document.createElement('div'); answer.className = 'answer-space';
    answer.style.width = `${largestOperandLength * 0.72}em`;
    sum.append(table, rule, answer);
    card.append(number, sum);
    return card;
  }));
}

function createDigitRow(value, digitCount, sign) {
  const row = document.createElement('tr');
  const signCell = document.createElement('td'); signCell.className = 'sum-sign'; signCell.textContent = sign || '\u00a0';
  row.append(signCell);
  const digits = String(value).padStart(digitCount, ' ');
  for (const digit of digits) {
    const cell = document.createElement('td');
    cell.className = 'sum-digit';
    cell.textContent = digit === ' ' ? '\u00a0' : digit;
    row.append(cell);
  }
  return row;
}

function renderLongMultiplication(container, { a, b }) {
  const resultDigits = Math.max(String(a * b).length, String(a).length, String(b).length);
  container.style.setProperty('--sum-digit-count', resultDigits);
  const table = document.createElement('table'); table.className = 'sum-table';
  table.style.width = `${0.85 + resultDigits * 0.72}em`;
  const columns = document.createElement('colgroup');
  const signColumn = document.createElement('col'); signColumn.className = 'sum-sign-column'; columns.append(signColumn);
  for (let digit = 0; digit < resultDigits; digit++) {
    const column = document.createElement('col'); column.className = 'sum-digit-column'; columns.append(column);
  }
  const body = document.createElement('tbody');
  body.append(createDigitRow(a, resultDigits, ''), createDigitRow(b, resultDigits, '×'));
  table.append(columns, body);
  container.append(table, createLongRule(resultDigits));

  [...String(b)].reverse().forEach((digit, place) => {
    const partialDigits = String(a * Number(digit)).length;
    container.append(createWorkingRow(resultDigits, partialDigits, place, 'partial-product-row'));
  });
  container.append(createLongRule(resultDigits));
  const answer = document.createElement('div'); answer.className = 'answer-space long-answer-space';
  answer.style.width = `${resultDigits * 0.72}em`;
  container.append(answer);
}

function renderLongDivision(container, { a, b }) {
  const dividendDigits = String(a).length;
  const divisorDigits = String(b).length;
  const quotientDigits = String(a / b).length;
  const workingRows = Math.min(4, Math.max(2, quotientDigits));
  container.style.setProperty('--sum-digit-count', dividendDigits);

  const layout = document.createElement('div'); layout.className = 'long-division';
  const divisor = createBareNumber(b, divisorDigits, 'division-divisor');
  divisor.style.marginBottom = `${workingRows * .85}em`;

  const inside = document.createElement('div'); inside.className = 'division-inside';
  inside.append(createWorkingRow(dividendDigits, quotientDigits, 0, 'division-quotient'));
  const vinculum = document.createElement('div'); vinculum.className = 'division-vinculum';
  vinculum.append(createBareNumber(a, dividendDigits, 'division-dividend'));
  inside.append(vinculum);
  for (let row = 0; row < workingRows; row++) {
    inside.append(createWorkingRow(dividendDigits, dividendDigits, 0, 'division-work-row'));
  }
  layout.append(divisor, inside);
  container.append(layout);
}

function createBareNumber(value, digitCount, className) {
  const number = document.createElement('table'); number.className = `bare-number ${className}`;
  number.style.width = `${digitCount * 0.72}em`;
  const columns = document.createElement('colgroup');
  for (let digit = 0; digit < digitCount; digit++) {
    const column = document.createElement('col'); column.className = 'sum-digit-column'; columns.append(column);
  }
  const body = document.createElement('tbody');
  const row = document.createElement('tr');
  for (const digit of String(value).padStart(digitCount, ' ')) {
    const cell = document.createElement('td'); cell.className = 'sum-digit'; cell.textContent = digit === ' ' ? '\u00a0' : digit; row.append(cell);
  }
  body.append(row); number.append(columns, body);
  return number;
}

function createWorkingRow(totalDigits, occupiedDigits, offset, className) {
  const row = document.createElement('div'); row.className = `working-digit-row ${className}`;
  row.style.gridTemplateColumns = `repeat(${totalDigits}, .72em)`;
  row.style.width = `${totalDigits * .72}em`;
  const leadingBlanks = Math.max(0, totalDigits - occupiedDigits - offset);
  for (let index = 0; index < leadingBlanks; index++) row.append(document.createElement('span'));
  for (let index = 0; index < occupiedDigits; index++) {
    const cell = document.createElement('span'); cell.className = 'working-digit-cell'; row.append(cell);
  }
  for (let index = 0; index < offset; index++) row.append(document.createElement('span'));
  return row;
}

function createLongRule(digitCount) {
  const rule = document.createElement('div'); rule.className = 'sum-rule long-rule';
  rule.style.width = `${digitCount * .72}em`;
  return rule;
}
