# Project requirements

## Purpose and scope

Build a simple, child-friendly, single-page web app that generates printable maths practice worksheets. The current scope is column addition and column subtraction. Keep the app easy to extend later for other UK Key Stage maths areas, but do not add those areas until requested.

## Current worksheet options

- Operation: column addition, column subtraction, or mixed addition and subtraction. A mixed worksheet must include both operations, with a varied question order.
- Question count: 4, 6, 9, 12, 16, or 20. These counts must fill the configured question grid exactly; do not add artwork or filler items to empty grid cells.
- Number length: 10s (two-digit), 100s (three-digit), 1,000s (four-digit), or random across those lengths.
- Exchange: when disabled, every question must be solvable without carrying (addition) or borrowing (subtraction). When enabled, at least half of the questions must require carrying or borrowing.
- Artwork capability is implemented for none, dinosaurs, robots, ocean, jungle, knights, Greek myths, fairies, monsters, vehicles, K-pop, and rockstars. Keep its selector hidden in the interface for now; preserve its rendering and URL support so it can be re-enabled later. When selected through a saved URL, the theme gets a prominent illustration at the top-right. None hides all artwork.

Generate fresh questions when a question-generating option changes. Changing the artwork option must not regenerate the questions.

## Worksheet layout and printing

- Provide a live preview that closely matches the printed page, including its A4 portrait proportions and question grid.
- Print on a single A4 portrait page. Use the available question area well: size grid rows and columns to the selected question count and stretch the grid to fill that area.
- Keep the worksheet black and white/grayscale for economical printing, including artwork and decorative details.
- Keep name and date labels aligned with their writing lines.
- Each vertical sum needs a clear answer space between the solid calculation line and the dotted answer line.
- Keep operands aligned by place value and leave enough room for the selected number length.
- Hide app controls and other interface elements from print output.

## Sharing settings

- Persist the selected operation, question count, number length, exchange setting, and artwork theme in URL query parameters.
- The copy-link action must copy a URL that restores those selected options when opened.
- A direct visit to the app with no query string (including its clean GitHub Pages URL) must stay free of default query parameters. Add or update settings in the URL only after the user edits a form option; copying an untouched default page must not add them.
- Unknown or invalid query parameter values should fall back to valid defaults.

## Implementation guidance

- The current app is a self-contained vanilla HTML/CSS/JavaScript page in `index.html`; avoid adding a framework or build step unless explicitly requested.
- Keep user-facing text simple and encouraging for children and their adults.
- Keep worksheet generation logic separate from artwork visibility and other presentation-only changes.
- When adding future maths areas, extend the worksheet options and generation logic without changing the existing addition/subtraction behavior.
