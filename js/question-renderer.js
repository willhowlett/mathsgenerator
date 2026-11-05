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
    const stageHeight = questions.length <= 6 ? 40 : questions.length <= 12 ? 29 : questions.length <= 16 ? 21 : 15.8;
    const rowHeight = questions.length <= 6 ? 5.6 : questions.length <= 12 ? 4.8 : questions.length <= 16 ? 4.2 : 3;
    const lineTop = stageHeight / 2;
    const setupTop = lineTop - rowHeight * 2;
    sum.style.setProperty('--sum-stage-cqw', `${stageHeight}cqw`);
    sum.style.setProperty('--sum-row-height-cqw', `${rowHeight}cqw`);
    sum.style.setProperty('--sum-working-row-cqw', `${rowHeight * .58}cqw`);
    sum.style.setProperty('--sum-line-top', `${lineTop}cqw`);
    sum.style.setProperty('--sum-setup-top', `${setupTop}cqw`);
    sum.style.setProperty('--sum-answer-top', 'calc(var(--sum-line-top) + 2px)');
    const operandDigitCount = Math.max(String(a).length, String(b).length);
    const setupDigits = operandDigitCount;
    const largestOperandLength = operation === 'division'
      ? Math.max(operandDigitCount, String(answerForQuestion(question)).length)
      : operandDigitCount;
    sum.style.setProperty('--sum-digit-count', largestOperandLength);
    const availableFontSize = questions.length <= 6 ? 28 : questions.length <= 12 ? 25 : questions.length <= 16 ? 21 : 18;
    const preferredFontSize = Math.max(12, availableFontSize - (largestOperandLength - 2) * 2);
    const sumFontSize = preferredFontSize;
    sum.style.setProperty('--sum-font-cqw', `${Math.max(1.6, sumFontSize / 6)}cqw`);
    sum.style.setProperty('--sum-font-print', `${Math.max(9, sumFontSize)}pt`);
    if (operation === 'multiplication') {
      renderLongMultiplication(sum, question, setupDigits);
      card.append(number, sum);
      return card;
    }
    if (operation === 'division') {
      renderLongDivision(sum, question);
      card.append(number, sum);
      return card;
    }
    const setup = createColumnSetup(a, b, operation, setupDigits);
    sum.style.width = setup.style.width;
    setup.style.top = 'var(--sum-setup-top)';
    const rule = document.createElement('div'); rule.className = 'sum-rule';
    rule.style.width = `${operandDigitCount * 0.72}em`;
    rule.style.left = `${.85 + (setupDigits - operandDigitCount) * .72}em`;
    rule.style.top = 'var(--sum-line-top)';
    const answer = document.createElement('div'); answer.className = 'answer-space';
    answer.style.width = `${setupDigits * 0.72}em`;
    answer.style.left = '.85em';
    answer.style.top = 'var(--sum-answer-top)';
    answer.style.bottom = '0';
    sum.append(setup, rule, answer);
    card.append(number, sum);
    return card;
  }));
}

function createColumnSetup(a, b, operation, digitCount) {
  const setup = document.createElement('div'); setup.className = 'column-setup';
  setup.style.width = `${0.85 + digitCount * 0.72}em`;
  setup.style.left = '0';
  setup.style.top = 'var(--sum-setup-top)';
  setup.append(createColumnRow(a, digitCount, ''), createColumnRow(b, digitCount, operationSigns[operation] || '+'));
  return setup;
}

function createColumnRow(value, digitCount, sign) {
  const row = document.createElement('div'); row.className = 'column-row';
  row.style.gridTemplateColumns = `.85em ${digitCount * .72}em`;
  row.style.height = 'var(--sum-row-height-cqw)';
  const signCell = document.createElement('span'); signCell.className = 'sum-sign'; signCell.textContent = sign;
  const number = document.createElement('span'); number.className = 'column-number'; number.textContent = value;
  row.append(signCell, number);
  return row;
}

function renderLongMultiplication(container, { a, b }, setupDigitCount) {
  const resultDigits = Math.max(String(a * b).length, String(a).length, String(b).length);
  container.style.setProperty('--sum-digit-count', resultDigits);
  const setup = createColumnSetup(a, b, 'multiplication', setupDigitCount);
  container.style.width = setup.style.width;
  setup.style.top = 'var(--sum-setup-top)';
  const rule = createLongRule(resultDigits);
  const operandDigitCount = Math.max(String(a).length, String(b).length);
  rule.style.width = `${operandDigitCount * .72}em`;
  rule.style.left = `${.85 + (setupDigitCount - operandDigitCount) * .72}em`;
  rule.style.top = 'var(--sum-line-top)';
  container.append(setup, rule);

  const workingRowHeight = Number.parseFloat(container.style.getPropertyValue('--sum-working-row-cqw'));
  const partialRows = [...String(b)].reverse();
  partialRows.forEach((digit, place) => {
    const partialDigits = String(a * Number(digit)).length;
    const row = createWorkingRow(resultDigits, partialDigits, place, 'partial-product-row');
    row.style.left = `${.85 + (setupDigitCount - resultDigits) * .72}em`;
    row.style.top = `calc(var(--sum-answer-top) + ${place * workingRowHeight}cqw)`;
    container.append(row);
  });
  const answer = document.createElement('div'); answer.className = 'answer-space long-answer-space';
  answer.style.width = `${resultDigits * 0.72}em`;
  answer.style.left = `${.85 + (setupDigitCount - resultDigits) * .72}em`;
  answer.style.top = `calc(var(--sum-answer-top) + ${partialRows.length * workingRowHeight}cqw)`;
  answer.style.bottom = '0';
  container.append(answer);
}

function renderLongDivision(container, { a, b }) {
  const dividendDigits = String(a).length;
  const divisorDigits = String(b).length;
  const quotientDigits = String(a / b).length;
  const workingRows = Math.min(4, Math.max(2, quotientDigits));
  container.style.setProperty('--sum-digit-count', dividendDigits);

  const layout = document.createElement('div'); layout.className = 'long-division';
  const divisorWidth = divisorDigits * .72;
  const dividendWidth = dividendDigits * .72;
  layout.style.width = `${divisorWidth + dividendWidth + .28}em`;
  container.style.width = layout.style.width;
  const divisor = createBareNumber(b, divisorDigits, 'division-divisor');
  divisor.style.left = '0';
  divisor.style.top = 'calc(var(--sum-line-top) + 2px)';

  const inside = document.createElement('div'); inside.className = 'division-inside';
  inside.style.left = `${divisorWidth + .08}em`;
  inside.style.top = '0';
  inside.style.width = `${dividendWidth + .2}em`;
  inside.append(createWorkingRow(dividendDigits, quotientDigits, 0, 'division-quotient'));
  inside.firstElementChild.style.left = '.2em';
  const vinculum = document.createElement('div'); vinculum.className = 'division-vinculum';
  vinculum.style.left = '0';
  vinculum.append(createBareNumber(a, dividendDigits, 'division-dividend'));
  inside.append(vinculum);
  for (let row = 0; row < workingRows; row++) {
    const working = createWorkingRow(dividendDigits, dividendDigits, 0, 'division-work-row');
    working.style.left = '.28em';
    working.style.top = `calc(var(--sum-line-top) + 1.25em + ${row * Number.parseFloat(container.style.getPropertyValue('--sum-working-row-cqw'))}cqw)`;
    inside.append(working);
  }
  layout.append(divisor, inside);
  container.append(layout);
}

function createBareNumber(value, digitCount, className) {
  const number = document.createElement('div'); number.className = `bare-number ${className}`;
  number.style.width = `${digitCount * 0.72}em`;
  number.textContent = value;
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
