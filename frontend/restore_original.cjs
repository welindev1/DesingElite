const fs = require('fs');
const path = require('path');

// Path to transcript.jsonl
const transcriptPath = 'C:\\Users\\WelinCode\\.gemini\\antigravity\\brain\\2eeaeb56-6e45-4a8a-b933-b52f5dba4400\\.system_generated\\logs\\transcript.jsonl';
const targetPath = 'src/pages/HomePage.tsx';

if (!fs.existsSync(transcriptPath)) {
  console.error('Transcript file does not exist at:', transcriptPath);
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

// We want to find the view_file tool calls outputs in chronological order
// We read lines 1-150, 151-500, 501-800, 801-1261.
// Let's extract the outputs.
let part1 = '';
let part2 = '';
let part3 = '';
let part4 = '';

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    
    // Look for MODEL step containing tool call responses or tool results
    // In jsonl, model or system steps have the tool output.
    // Let's search for "Showing lines" in the step content.
    if (obj.content && obj.content.includes('Showing lines')) {
      const content = obj.content;
      if (content.includes('Showing lines 1 to 150')) {
        part1 = content;
      } else if (content.includes('Showing lines 151 to 500')) {
        part2 = content;
      } else if (content.includes('Showing lines 501 to 800')) {
        part3 = content;
      } else if (content.includes('Showing lines 801 to 1261')) {
        part4 = content;
      }
    }
  } catch (e) {
    // Ignore malformed json lines
  }
}

function parseSnippet(snippet) {
  if (!snippet) return '';
  const lines = snippet.split('\n');
  const result = [];
  let startParsing = false;
  for (const line of lines) {
    if (line.match(/^\d+:/)) {
      // Remove line number prefix, e.g. "12: import ..." -> "import ..."
      const clean = line.replace(/^\d+:\s?/, '');
      result.push(clean);
    }
  }
  return result.join('\n') + '\n';
}

const fileContent = parseSnippet(part1) + parseSnippet(part2) + parseSnippet(part3) + parseSnippet(part4);

if (fileContent.trim().length === 0) {
  console.error('Could not extract file content from transcript.jsonl.');
  process.exit(1);
}

fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log('Restored HomePage.tsx successfully to its initial state!');
