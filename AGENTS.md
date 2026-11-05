# Project requirements

## Purpose and scope

Build a child-friendly static single-page app that generates printable worksheets for addition, subtraction, multiplication, and division. The app runs entirely in the browser and deploys as static files. Keep it framework-free and do not add a build step unless requested.

## Worksheet controls

- Use column layout for every worksheet; there is no method selector.
- Operations: offer Addition, Subtraction, Multiplication, and Division as chunky checkboxes. If none are checked, include all four operations.
- Number length: offer Single digit, Tens, Hundreds, and Thousands as multi-select checkboxes. If none are checked, include all four lengths. Choose both operand lengths independently from the selected set so lengths can mix within each question.
- Show the exchange option beneath Number length. When enabled, at least half of the applicable questions should need carrying (addition or multiplication), borrowing (subtraction), or regrouping (division). When disabled, column questions must not need any of those exchanges. Do not include zero as an operand.
- Question count: 4, 6, 9, 12, 16, or 20. Fill the worksheet grid exactly without artwork or filler questions.
- Keep the artwork selector hidden for now, but preserve the saved-theme rendering behavior. None hides artwork; saved themes show a prominent grayscale illustration at the top-right.
- Keep the answer-sheet checkbox below the print button. Print answers on a separate second A4 page and never show that page in the live preview.
- Generate new questions when operations, number length, exchange, or question count changes. Provide Regenerate, Copy worksheet link, and Print worksheet actions.

## Worksheet layout and printing

- Keep the live preview close to the A4 portrait print layout; stretch the question grid to use its available area.
- Print the worksheet on one A4 portrait page and the optional answers on a separate second A4 portrait page.
- Keep the worksheet grayscale, preserve aligned name/date lines, and leave clear answer and working space.
- Render multiplication as a long multiplication setup with place-shifted partial-product rows; render division with a divisor, dividend bracket, quotient answer row, and working rows.
- Hide app controls and other interface elements in print output.

## Sharing settings

- Persist the selected operations, selected number lengths, question count, exchange setting, artwork theme, answer-sheet setting, and exact generated questions, including each question's operand lengths, in one versioned URL hash. Keep the stored method as `column` for compatibility with existing shared-link data.
- Opening a shared link restores its exact questions and options. Copying a link encodes the current worksheet, including the untouched default worksheet.
- A clean direct visit must not add default URL state. Write the hash only after the user changes an option or requests a link.
- Reject malformed hash data safely and continue accepting the previous worksheet hash formats and legacy query settings where practical.

## Implementation and tests

- Load `styles.css` and the JavaScript ES module entry point directly from `index.html`; do not require a server-side application or build step.
- Keep question generation in focused modules under `js/generators/` and shared rendering in `js/question-renderer.js`. Keep controls, sharing, and print actions in `app.js`.
- Do not minify source files by hand. Keep source readable and static assets small.
- Keep user-facing text simple and encouraging.
- Use Jest for pure application helpers and generator modules. Keep tests in `tests/`; run them with `yarn test`.
- Use `yarn start` to serve the static files locally through `server.js`.
