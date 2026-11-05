import { answerForQuestion, generateQuestions, validateQuestions, supportedLengths, supportedOperations } from './js/generators/arithmetic-worksheet.js';
import { renderQuestions } from './js/question-renderer.js';
import { decodeWorksheetState, encodeSharedState, validCounts } from './js/shared-state.js';

(() => {
      const countOptions = document.getElementById('count-options');
      const questionsEl = document.getElementById('questions');
      const operationOptions = document.getElementById('operation-options');
      const lengthOptions = document.getElementById('length-options');
      const artworkEl = document.getElementById('artwork');
      const exchangeEl = document.getElementById('exchange');
      const answerToggle = document.getElementById('include-answers');
      const answerSheet = document.getElementById('answer-sheet');
      const answersEl = document.getElementById('answers');
      const answerSubtitle = document.getElementById('answer-subtitle');
      const copyStatus = document.getElementById('copy-status');
      const sheetTitle = document.getElementById('sheet-title');
      const sheetSubtitle = document.getElementById('sheet-subtitle');
      const heroArt = document.getElementById('hero-art');
      const artworkNames = {
        dinosaurs: 'Dinosaurs', robots: 'Robots', ocean: 'Ocean', jungle: 'Jungle',
        knights: 'Knights', 'greek-myths': 'Greek myths', fairies: 'Fairies',
        monsters: 'Monsters', vehicles: 'Vehicles', 'k-pop': 'K-pop', rockstars: 'Rockstars'
      };
      const artworkThemes = Object.keys(artworkNames);
      const artworkScenes = {
        dinosaurs: `<path d="M43 91Q24 94 13 75Q29 83 45 72" fill="#c9c9c9"/><ellipse cx="83" cy="91" rx="40" ry="24" fill="#dedede"/><path d="M91 80Q105 62 104 43Q103 20 126 18Q149 17 154 37L170 43Q178 46 174 55L155 60Q150 75 135 77L116 70L105 90Z" fill="#d5d5d5"/><path d="M57 70l5-17 11 14 8-20 10 19 10-17 7 23" fill="#bcbcbc"/><path d="M58 105l-2 13h19l4-13m20-1 2 14h18l2-16" fill="#c7c7c7"/><circle cx="143" cy="39" r="3" fill="#222"/><path d="M151 53l-7 2m-16 7 4 4m-25 10 4 3m-17 1 4 3" fill="none"/><path d="M23 42l4-9 4 9 9 4-9 3-4 9-4-9-9-3z" fill="#fff"/>`,
        robots: `<path d="M78 36V23m0 0-10-8m10 8 10-8" fill="none"/><circle cx="78" cy="14" r="5" fill="#bcbcbc"/><rect x="46" y="35" width="65" height="48" rx="12" fill="#d7d7d7"/><path d="M57 50h12m19 0h12" stroke-width="5"/><path d="M67 67q11 10 23 0" fill="none"/><rect x="54" y="86" width="49" height="30" rx="6" fill="#c4c4c4"/><circle cx="69" cy="100" r="4" fill="#fff"/><circle cx="87" cy="100" r="4" fill="#fff"/><path d="M45 46H31v37h13m68-37h14v37h-13M65 116v7m28-7v7" fill="none"/><path d="M27 29l4-9 4 9 9 4-9 4-4 9-4-9-9-4z" fill="#eee"/>`,
        ocean: `<path d="M34 77q9-28 39-26 16 1 29 14 18-7 37-1l21 12-22 12q-21 5-39-5-30 23-58-6z" fill="#d2d2d2"/><path d="M45 81q27 10 51-9m8-7q7-7 5-17 12 7 13 19m-16 26q-12 14-23 8" fill="none"/><circle cx="128" cy="72" r="3" fill="#222"/><path d="M23 103q12-11 24 0t24 0 24 0 24 0 24 0 24 0M28 116q12-11 24 0t24 0 24 0 24 0 24 0" fill="none"/><path d="M58 38q-4-11 3-17m10 17q-3-14 5-20m62 50l7-7 7 7-7 7z" fill="#eee"/><path d="M28 65l8-6 8 6-8 6z" fill="#c3c3c3"/>`,
        jungle: `<path d="M37 26Q22 42 31 63m0 0q9 11 20 0m-20 0q-10 12-16 3" fill="none"/><circle cx="65" cy="72" r="25" fill="#d5d5d5"/><circle cx="46" cy="48" r="13" fill="#d5d5d5"/><circle cx="84" cy="48" r="13" fill="#d5d5d5"/><ellipse cx="65" cy="77" rx="15" ry="12" fill="#f5f5f5"/><circle cx="56" cy="68" r="3" fill="#222"/><circle cx="74" cy="68" r="3" fill="#222"/><path d="M60 80q5 5 10 0m-5 10v18m0-9-14 9m14-9 14 9" fill="none"/><path d="M111 109Q90 70 115 34q22 34 2 75zm18 2q-7-37 18-58 12 39-9 62zM22 112Q8 80 29 58q15 32 1 55z" fill="#c8c8c8"/><path d="M115 35v76m17-2 15-55M29 59v52" fill="none"/>`,
        knights: `<path d="M72 36Q47 25 55 12q19 0 28 20 12-13 29-12 1 15-17 24" fill="#c6c6c6"/><path d="M55 44q22-17 46 0l-3 42H58z" fill="#d9d9d9"/><path d="M57 48l21-9 21 9-5 25H62z" fill="#efefef"/><path d="M64 55h8m14 0h8m-22 13h14" fill="none"/><path d="M64 85 53 119h18l9-24 10 24h18L96 85" fill="#c8c8c8"/><path d="M112 43l23-26m-29 36 27-30m-31 17 12 11" fill="none" stroke-width="4"/><path d="M35 63l20-7v35L35 99z" fill="#bcbcbc"/><path d="M41 68l5 7 7-2-4 7 3 7-8-3-7 5 1-9-6-5 8-1z" fill="#f8f8f8"/>`,
        'greek-myths': `<ellipse cx="79" cy="84" rx="35" ry="19" fill="#d3d3d3"/><path d="M50 78Q35 61 45 49q12 2 20 22m42 3q17-22 33-14l-17 23m-66-5Q42 59 54 46q15 10 18 25 12-28 30-29 7 15-6 31" fill="#e4e4e4"/><path d="M105 75q10-10 12-25l15-10 17 7-12 10-10 1q-5 16-19 25m-57 1-11 31h16l12-23m30-1 13 24h15l-10-31" fill="#cecece"/><path d="M131 45l5-8 6 8m-14 2 8-5m-52 52q-8 2-12 9" fill="none"/><path d="M27 33h20m-16 0v34m12-34v34M18 68h38m70 37h25m-20-7v-22m14 22V76m-25 24h38" fill="none"/>`,
        fairies: `<path d="M82 70Q44 32 36 59q-4 17 35 22-31 11-21 27 11 15 36-20 26 34 38 20 11-14-21-27 39-5 34-22-8-26-44 11z" fill="#e1e1e1"/><circle cx="82" cy="51" r="12" fill="#d0d0d0"/><path d="M72 65q10-8 20 0l12 37-22 15-22-15z" fill="#c8c8c8"/><path d="M82 46q-15-12-6-22 10 6 8 16 9-15 19-10-2 14-13 20m-8 34q7 6 14 0m13-52 6-10 2 12 10 6-12 2-6 10-2-12-10-6z" fill="none"/><path d="M31 37l4-9 4 9 9 4-9 4-4 9-4-9-9-4zM131 66l3-7 3 7 7 3-7 3-3 7-3-7-7-3z" fill="#eee"/>`,
        monsters: `<path d="M50 45 38 26l23 8q17-12 37 0l23-8-12 23q12 20 4 45-9 27-39 27T35 94q-8-28 15-49z" fill="#d2d2d2"/><path d="M56 62q10-10 19 0m12 0q10-10 19 0" fill="none" stroke-width="4"/><circle cx="64" cy="63" r="3" fill="#222"/><circle cx="95" cy="63" r="3" fill="#222"/><path d="M61 84q20 19 40 0l-5 19H67z" fill="#f8f8f8"/><path d="M70 87v10m11-8v12m11-12v9m-34 22-6 6m55-6 6 6" fill="none"/><circle cx="43" cy="73" r="5" fill="#eee"/><circle cx="117" cy="73" r="5" fill="#eee"/><path d="M71 38q-6-12 5-19 11 8 5 19m12-1q-4-13 9-18 8 11-2 20" fill="#c4c4c4"/>`,
        vehicles: `<path d="M48 88 57 57q3-10 15-10h22q11 0 17 12l14 29v21H45V91z" fill="#cecece"/><path d="M65 58h29q8 0 12 9l5 12H59l3-13q1-8 3-8z" fill="#f8f8f8"/><circle cx="63" cy="106" r="10" fill="#fff"/><circle cx="111" cy="106" r="10" fill="#fff"/><circle cx="63" cy="106" r="4" fill="#777"/><circle cx="111" cy="106" r="4" fill="#777"/><path d="M42 39 66 18l20 21v29H42z" fill="#d8d8d8"/><path d="M66 18v50m-24-29h44m-22-21-10 21h20z" fill="#fff"/><path d="M24 53h11m-7 8h12m104-42 4-9 4 9 9 4-9 4-4 9-4-9-9-4z" fill="#eee"/>`,
        'k-pop': `<path d="M82 42q-17 0-18 20l-4 23-18 18 12 7 22-17 7-22 7 22 23 17 12-7-19-18-4-23q-2-20-20-20z" fill="#d1d1d1"/><circle cx="82" cy="28" r="16" fill="#d4d4d4"/><path d="M66 25q1-21 20-18 16 3 12 21l-8-10-12 7-10-1m-13 23-17-11m64 0 20-14" fill="#bdbdbd"/><path d="M44 40l-10-6m78-1 10-9m-40 78v15m-18-5 18 8 18-8" fill="none"/><path d="M130 59l5-12 5 12 12 5-12 5-5 12-5-12-12-5zM25 78l4-9 4 9 9 4-9 4-4 9-4-9-9-4z" fill="#eee"/><path d="M101 49l21-18m-21 22 19-17" fill="none" stroke-width="4"/>`,
        rockstars: `<path d="M47 45l20 8-6 15 13 15-19 26-18-8 8-17-14-13z" fill="#d2d2d2"/><path d="M61 88 97 52m-32 43 35-38m-31 44 38-39" fill="none" stroke-width="5"/><path d="M92 48l18-18 22 5 7 20-19 18m-17 14 23 15-8 12-25-17m-53-22L33 45l17-6 17 14" fill="#c3c3c3"/><circle cx="125" cy="47" r="3" fill="#222"/><path d="M101 30l-8-13 12 2 7-10 5 13m15 69 10-4m-5 11 10 3" fill="none"/><path d="M25 27l4-9 4 9 9 4-9 4-4 9-4-9-9-4z" fill="#eee"/>`
      };
      const operationLabels = {
        addition: 'Addition', subtraction: 'Subtraction', multiplication: 'Multiplication', division: 'Division'
      };
      const operationChoices = supportedOperations.map((value) => ({ value, label: operationLabels[value] }));
      const lengthLabels = {
        ones: 'Single digit', tens: 'Tens', hundreds: 'Hundreds', thousands: 'Thousands'
      };
      const lengthChoices = supportedLengths.map((value) => ({ value, label: lengthLabels[value] }));
      let sums = [];
      const defaults = {
        method: 'column', operations: ['addition'], lengths: ['tens'], count: 12,
        exchange: false, artwork: 'none', includeAnswers: false
      };

      function stateFromQuery() {
        const params = new URLSearchParams(window.location.search);
        let operations = params.has('operations')
          ? params.get('operations').split(',').filter((operation) => supportedOperations.includes(operation))
          : [];
        if (!params.has('operations')) {
          const oldOperation = params.get('operation') || params.get('skill');
          operations = ['mixed', 'mixed-column-methods'].includes(oldOperation) ? ['addition', 'subtraction']
            : oldOperation === 'mixed-multiplication-division' ? ['multiplication', 'division']
              : ['column-addition', 'column-subtraction'].includes(oldOperation) ? [oldOperation.slice(7)]
                : supportedOperations.includes(oldOperation) ? [oldOperation] : defaults.operations;
        }
        const oldLength = params.get('length');
        const legacyLength = ({ ones: 'ones', '10s': 'tens', tens: 'tens', '100s': 'hundreds', hundreds: 'hundreds', '1000s': 'thousands', thousands: 'thousands' })[oldLength];
        const requestedLengths = params.has('lengths')
          ? params.get('lengths').split(',').filter((length) => supportedLengths.includes(length))
          : legacyLength ? [legacyLength] : defaults.lengths;
        return {
          ...defaults,
          method: 'column',
          operations,
          lengths: requestedLengths,
          count: validCounts.includes(Number(params.get('count'))) ? Number(params.get('count')) : defaults.count,
          exchange: params.get('exchange') === 'true'
        };
      }

      function choiceInputs(container, name, choices, selectedValues, type) {
        container.replaceChildren(...choices.map(({ value, label: text }) => {
          const label = document.createElement('label'); label.className = 'count-option';
          const input = document.createElement('input'); input.type = type; input.name = name; input.value = value;
          input.checked = selectedValues.includes(value);
          input.setAttribute('aria-label', text);
          const span = document.createElement('span'); span.textContent = text;
          label.append(input, span);
          return label;
        }));
      }

      const params = new URLSearchParams(window.location.search);
      let state = decodeWorksheetState(window.location.hash, validateQuestions, artworkThemes) || stateFromQuery();
      state.method = 'column';
      if (Array.isArray(state.questions) && !validateQuestions(state.questions, state)) state.questions = null;
      if (params.has('artwork') && (artworkThemes.includes(params.get('artwork')) || params.get('artwork') === 'none')) {
        state.artwork = params.get('artwork');
      } else if (params.has('dinosaurs')) {
        state.artwork = params.get('dinosaurs') === 'false' ? 'none' : 'dinosaurs';
      }
      choiceInputs(operationOptions, 'operation', operationChoices, state.operations, 'checkbox');
      choiceInputs(lengthOptions, 'length', lengthChoices, state.lengths, 'checkbox');
      artworkEl.value = state.artwork;
      exchangeEl.checked = state.exchange;
      answerToggle.checked = state.includeAnswers;

      for (const count of validCounts) {
        const label = document.createElement('label'); label.className = 'count-option';
        const input = document.createElement('input'); input.type = 'radio'; input.name = 'question-count'; input.value = count;
        input.checked = count === state.count;
        input.setAttribute('aria-label', `${count} questions`);
        const span = document.createElement('span'); span.textContent = count;
        label.append(input, span); countOptions.append(label);
      }

      function selectedRadio(name) {
        return document.querySelector(`input[name="${name}"]:checked`)?.value;
      }
      function selectedOperations() {
        return [...operationOptions.querySelectorAll('input:checked')].map(({ value }) => value);
      }
      function effectiveOperations() {
        return state.operations.length ? state.operations : supportedOperations;
      }
      function selectedLengths() {
        return [...lengthOptions.querySelectorAll('input:checked')].map(({ value }) => value);
      }
      function syncSelections() {
        state.method = 'column';
        state.operations = selectedOperations();
        state.lengths = selectedLengths();
        state.count = Number(selectedRadio('question-count')) || 12;
        state.exchange = exchangeEl.checked;
        state.includeAnswers = answerToggle.checked;
        state.artwork = artworkEl.value || 'none';
      }
      function updateExchangeControl() {
        const lengthsIncludeMultiDigit = !state.lengths.length || state.lengths.some((length) => length !== 'ones');
        const operations = effectiveOperations();
        const canExchange = operations.includes('addition')
          || operations.includes('multiplication')
          || ((operations.includes('subtraction') || operations.includes('division')) && lengthsIncludeMultiDigit);
        exchangeEl.disabled = !canExchange;
        if (!canExchange) exchangeEl.checked = false;
        state.exchange = exchangeEl.checked;
      }
      function makeSums() {
        return generateQuestions({
          count: state.count,
          method: 'column',
          operations: state.operations,
          lengths: state.lengths,
          exchange: state.exchange
        });
      }
      function syncUrl() {
        syncSelections();
        const url = new URL(window.location.href);
        ['year', 'skill', 'method', 'operation', 'operations', 'count', 'length', 'lengths', 'exchange', 'artwork', 'dinosaurs'].forEach((key) => url.searchParams.delete(key));
        url.hash = encodeSharedState({
          v: 9,
          method: state.method,
          operations: state.operations,
          lengths: state.lengths,
          count: state.count,
          exchange: state.exchange,
          artwork: state.artwork,
          includeAnswers: state.includeAnswers,
          questions: sums
        });
        window.history.replaceState(null, '', url);
      }
      function artworkSvg(theme) {
        const name = artworkNames[theme];
        return `<svg viewBox="0 0 180 130" role="img" aria-label="${name} illustration"><title>${name}</title><path d="M12 101Q40 91 66 101t53 0q25-10 49 0v20H12z" fill="#ededed" stroke="none"/><path d="M19 35l4-9 4 9 9 4-9 4-4 9-4-9-9-4zM147 24l3-7 3 7 7 3-7 3-3 7-3-7-7-3z" fill="#fff" stroke="#262626" stroke-width="2" stroke-linejoin="round"/><g stroke="#262626" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${artworkScenes[theme]}</g><path d="M35 111h110" fill="none" stroke="#777" stroke-width="2" stroke-linecap="round"/></svg>`;
      }
      function renderArtwork() {
        heroArt.innerHTML = state.artwork === 'none' ? '' : artworkSvg(state.artwork);
        heroArt.hidden = state.artwork === 'none';
      }
      function answerValue(question) {
        return answerForQuestion(question);
      }
      function renderAnswerSheet() {
        answerSheet.classList.toggle('is-included', answerToggle.checked);
        const label = effectiveOperations().map((operation) => operationLabels[operation].toLowerCase()).join(' and ');
        answerSubtitle.textContent = `Answers for ${label}.`;
        answersEl.replaceChildren(...sums.map((question, index) => {
          const item = document.createElement('div'); item.className = 'answer-item';
          const number = document.createElement('span'); number.className = 'answer-item-number'; number.textContent = String(index + 1).padStart(2, '0');
          const value = document.createElement('span'); value.className = 'answer-item-value'; value.textContent = answerValue(question);
          item.append(number, value);
          return item;
        }));
      }
      function render(regenerate = true) {
        syncSelections();
        updateExchangeControl();
        const operations = effectiveOperations();
        const operationLabel = operations.map((operation) => operationLabels[operation]).join(' & ');
        sheetTitle.textContent = `Column ${operations.length > 2 ? 'Mixed Operations' : operationLabel}`;
        sheetSubtitle.textContent = 'Line up each calculation and work out the answer.';
        if (regenerate || !sums.length) sums = makeSums();
        renderQuestions(questionsEl, sums, state.method);
        renderArtwork();
        renderAnswerSheet();
      }
      function handleOptionChange() {
        syncSelections();
        updateExchangeControl();
        state.legacy = false;
        render(true);
        syncUrl();
      }

      operationOptions.addEventListener('change', handleOptionChange);
      lengthOptions.addEventListener('change', handleOptionChange);
      countOptions.addEventListener('change', handleOptionChange);
      exchangeEl.addEventListener('change', handleOptionChange);
      artworkEl.addEventListener('change', () => { syncSelections(); renderArtwork(); syncUrl(); });
      answerToggle.addEventListener('change', () => { syncSelections(); renderAnswerSheet(); syncUrl(); });
      document.getElementById('regenerate-button').addEventListener('click', handleOptionChange);
      document.getElementById('print-button').addEventListener('click', () => window.print());
      document.getElementById('copy-button').addEventListener('click', async () => {
        syncUrl();
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch {
          const input = document.createElement('textarea'); input.value = window.location.href;
          input.style.position = 'fixed'; input.style.opacity = '0';
          document.body.append(input); input.select();
          const copied = document.execCommand('copy'); input.remove();
          if (!copied) { copyStatus.textContent = 'Copy was unavailable. You can copy the address bar link.'; return; }
        }
        copyStatus.textContent = 'Worksheet link copied';
      });
      updateExchangeControl();
      if (!Array.isArray(state.questions)) sums = makeSums();
      else sums = state.questions;
      render(false);
    })();
