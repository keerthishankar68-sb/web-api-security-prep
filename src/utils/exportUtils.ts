import type { QuestionData } from '../types/question';

/**
 * Exports all questions as a CSV file formatted for Anki Spaced Repetition flashcards
 */
export function exportAnkiDeck(questions: QuestionData[]) {
  const header = 'Front,Back,Tags\n';
  const rows = questions.map((q) => {
    const front = `"${q.title.replace(/"/g, '""')}<br><br><small>Category: ${q.category} | Tier: ${q.tier || 'Core'}</small>"`;
    const backContent = [
      `<b>Interview Takeaway Formula:</b><br>${(q.interviewTakeaway || q.nailIt.interviewTakeaway).replace(/"/g, '""')}`,
      `<br><br><b>Key Vocabulary:</b><br>${q.sayIt.keyPhrases.join(' &bull; ')}`,
      `<br><br><b>Spoken Script:</b><br><i>${q.sayIt.speechScript.replace(/"/g, '""')}</i>`
    ].join('');
    const back = `"${backContent}"`;
    const tags = `"web-security api-security ${q.category.toLowerCase().replace(/\s+/g, '-')}"`;
    return `${front},${back},${tags}`;
  });

  const csvContent = header + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'websec-interview-anki-deck.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers formatted print / PDF export of the questions cheat sheet
 */
export function printExecutiveSummary() {
  window.print();
}

/**
 * Downloads the current animated SVG diagram as an SVG file
 */
export function downloadSvgDiagram(svgElement: SVGSVGElement | null, title: string) {
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-flow-diagram.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
