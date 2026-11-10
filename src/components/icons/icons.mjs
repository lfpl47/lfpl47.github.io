// Line icons drawn for this site: a 24-unit grid, strokes and fills in currentColor, no background.
// Icon.astro sets one stroke width in CSS pixels for every size. Each value is the inner markup of the <svg>.
export const ICONS = {
  // «What I work on»
  // A pipe in three sections; the data changes form on the way (dot, block, bar).
  pipeline: `<path d="M2 7h20M2 17h20M2 4v16M22 4v16"/><circle cx="6.5" cy="12" r="2" fill="currentColor" stroke="none"/><rect x="10" y="10" width="4" height="4" fill="currentColor" stroke="none"/><rect x="15.5" y="10.5" width="4.5" height="3" fill="currentColor" stroke="none"/>`,
  // An app window with a code mark.
  apps: `<rect x="2.5" y="3.5" width="19" height="17"/><path d="M2.5 8h19"/><path d="M9 11 6 14.25l3 3.25M15 11l3 3.25-3 3.25"/>`,
  // A cloud over two connected components.
  cloud: `<path d="M6.5 13.5A3.75 3.75 0 1 1 7.14 6.06 5 5 0 0 1 16.96 6.59a3.5 3.5 0 1 1 .79 6.91Z"/><path d="M12 13.5v3M6 19v-2.5h12V19"/><rect x="3.5" y="18.5" width="5" height="3.5"/><rect x="15.5" y="18.5" width="5" height="3.5"/>`,
  // A dollar sign and a falling arrow.
  cost: `<path d="M14 7.25C13.4 5.6 11.9 4.5 9.75 4.5 7.3 4.5 5.5 5.9 5.5 7.9c0 4.6 8.75 2.6 8.75 7.6 0 2.15-1.85 3.75-4.5 3.75-2.35 0-4.1-1.15-4.65-3M9.75 2v20"/><path d="M19.5 3v17.5M16.5 17.5l3 3 3-3"/>`,
  // A star schema: one fact table and four dimensions.
  "data-model": `<rect x="9" y="9" width="6" height="6"/><rect x="2" y="2" width="4.5" height="4.5"/><rect x="17.5" y="2" width="4.5" height="4.5"/><rect x="2" y="17.5" width="4.5" height="4.5"/><rect x="17.5" y="17.5" width="4.5" height="4.5"/><path d="M6.5 6.5 9 9M17.5 6.5 15 9M6.5 17.5 9 15M17.5 17.5 15 15"/>`,
  // A database.
  database: `<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.65 3.6 3 8 3s8-1.35 8-3v-13"/><path d="M4 12c0 1.65 3.6 3 8 3s8-1.35 8-3"/>`,
  // An event and the messages it sends.
  events: `<path d="M9 2 3 13h4.75L6.5 22 13 10.5H8.25L9 2Z"/><rect x="16" y="3" width="6" height="4"/><rect x="16" y="10" width="6" height="4"/><rect x="16" y="17" width="6" height="4"/>`,
  // A server rack between braces.
  iac: `<path d="M6 3C4.6 3 4 3.75 4 5v4c0 1.4-.7 2.3-2 3 1.3.7 2 1.6 2 3v4c0 1.25.6 2 2 2M18 3c1.4 0 2 .75 2 2v4c0 1.4.7 2.3 2 3-1.3.7-2 1.6-2 3v4c0 1.25-.6 2-2 2"/><rect x="8.5" y="5" width="7" height="6"/><rect x="8.5" y="13" width="7" height="6"/>`,
  // A clipboard with checked items.
  requirements: `<path d="M8.5 4.5H4.5v17h15v-17h-4"/><rect x="8.5" y="2.5" width="7" height="4"/><path d="M7.5 11.75l2 2 3.25-4M14.75 12.5h2.25M7.5 17.75l2 2 3.25-4"/>`,
  // A pie chart with one slice pulled out.
  reports: `<path d="M10.5 4.5a8 8 0 1 0 8 8h-8v-8Z"/><path d="M13.5 2a8.5 8.5 0 0 1 8.5 8.5h-8.5V2Z"/>`,

  // Ledger phases: solid shapes in the phase color, as the old swatches were; thin lines only where parts connect.
  // Data engineering: three sources merge into one flow (dots into a bar), from the family of «pipeline».
  "phase-engineering": `<circle cx="4.25" cy="4.75" r="2.5" fill="currentColor" stroke="none"/><circle cx="4.25" cy="12" r="2.5" fill="currentColor" stroke="none"/><circle cx="4.25" cy="19.25" r="2.5" fill="currentColor" stroke="none"/><path d="M6.5 5.75 11.5 12 6.5 18.25M6.75 12H13"/><rect x="13" y="9.75" width="9" height="4.5" fill="currentColor" stroke="none"/>`,
  // Data analysis: a bar chart.
  "phase-analysis": `<path d="M2.5 21.25h19"/><rect x="4.5" y="13" width="3.5" height="8.25" fill="currentColor" stroke="none"/><rect x="10.25" y="8" width="3.5" height="13.25" fill="currentColor" stroke="none"/><rect x="16" y="3" width="3.5" height="18.25" fill="currentColor" stroke="none"/>`,
  // Back office and reporting: a sheet, a header row over two rows of cells.
  "phase-backoffice": `<rect x="2.75" y="3.75" width="18.5" height="4.25" fill="currentColor" stroke="none"/><rect x="2.75" y="10" width="5.5" height="4.25" fill="currentColor" stroke="none"/><rect x="10.25" y="10" width="11" height="4.25" fill="currentColor" stroke="none"/><rect x="2.75" y="16.25" width="5.5" height="4" fill="currentColor" stroke="none"/><rect x="10.25" y="16.25" width="11" height="4" fill="currentColor" stroke="none"/>`,
  // Education: a mortarboard.
  "phase-education": `<path d="M12 3.5 1.5 9 12 14.5 22.5 9Z" fill="currentColor" stroke="none"/><path d="M6 13.4 12 16.5l6-3.1v4.1c0 1.6-2.7 3-6 3s-6-1.4-6-3Z" fill="currentColor" stroke="none"/><path d="M21 9.75v6"/>`,
};
