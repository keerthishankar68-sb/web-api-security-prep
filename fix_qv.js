const fs = require("fs");
let c = fs.readFileSync("src/components/QuestionView.tsx", "utf8");
// Fix the escaped braces from powershell replace
c = c.replace(
  /question-seq-pill">Module \\{String\(currentIndex \+ 1\)\.padStart\(2, '0'\)\\} \/ \\{questions\.length\\}<\/span>/,
  'question-seq-pill">{`Module ${String(currentIndex + 1).padStart(2, \'0\')} / ${questions.length}`}</span>'
);
// Also handle the old hardcoded version just in case
c = c.replace(
  /question-seq-pill">Module 0\{currentIndex \+ 1\} \/ 20<\/span>/,
  'question-seq-pill">{`Module ${String(currentIndex + 1).padStart(2, \'0\')} / ${questions.length}`}</span>'
);
fs.writeFileSync("src/components/QuestionView.tsx", c);
console.log("Done. Snippet:", c.substring(c.indexOf("question-seq-pill"), c.indexOf("question-seq-pill") + 120));
