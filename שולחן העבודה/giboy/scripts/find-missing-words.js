const fs = require('fs');
const path = require('path');

// קריאת הקובץ
const filePath = path.join(__dirname, '../app/level-vocabulary/page.tsx');
const content = fs.readFileSync(filePath, 'utf-8');

// חילוץ TRANSLATION_DICT
const dictMatch = content.match(/const TRANSLATION_DICT[^}]+};/s);
if (!dictMatch) {
  console.error('לא נמצא TRANSLATION_DICT');
  process.exit(1);
}

// חילוץ כל המילים מהמילון
const dictContent = dictMatch[0];
const existingWords = new Set();
const dictRegex = /'([a-z]+)':/gi;
let match;
while ((match = dictRegex.exec(dictContent)) !== null) {
  existingWords.add(match[1].toLowerCase());
}

console.log(`נמצאו ${existingWords.size} מילים במילון`);

// חילוץ כל המילים מהשאלות
const extractEnglishWords = (text) => {
  if (!text) return [];
  const englishWords = text.match(/[A-Za-z]+/g) || [];
  return englishWords.filter(word => word.length > 1).map(w => w.toLowerCase());
};

// חילוץ כל השאלות
const questionsMatch = content.match(/const GAME_QUESTIONS[^}]+};/s);
if (!questionsMatch) {
  console.error('לא נמצא GAME_QUESTIONS');
  process.exit(1);
}

const questionsContent = questionsMatch[0];
const allWords = new Set();

// חילוץ מילים מכל השדות
const fields = ['text', 'sentence', 'answer', 'options', 'pair', 'correct'];
fields.forEach(field => {
  const regex = new RegExp(`"${field}":\\s*"([^"]+)"`, 'gi');
  let match;
  while ((match = regex.exec(questionsContent)) !== null) {
    const words = extractEnglishWords(match[1]);
    words.forEach(w => allWords.add(w));
  }
  
  // גם עבור מערכים
  const arrayRegex = new RegExp(`"${field}":\\s*\\[([^\\]]+)\\]`, 'gi');
  while ((match = arrayRegex.exec(questionsContent)) !== null) {
    const words = extractEnglishWords(match[1]);
    words.forEach(w => allWords.add(w));
  }
});

console.log(`נמצאו ${allWords.size} מילים ייחודיות בשאלות`);

// מציאת מילים חסרות
const missingWords = [];
allWords.forEach(word => {
  if (!existingWords.has(word) && word.length > 1) {
    // התעלם ממילים קצרות מדי או מילים נפוצות שלא צריך לתרגם
    const skipWords = ['the', 'is', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by', 'as', 'it', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'cannot', 'its', 'his', 'her', 'our', 'your', 'their', 'my', 'me', 'him', 'us', 'them'];
    if (!skipWords.includes(word)) {
      missingWords.push(word);
    }
  }
});

missingWords.sort();

console.log(`\nנמצאו ${missingWords.length} מילים חסרות:\n`);
missingWords.forEach(word => console.log(`  '${word}': '',`));

// כתיבת רשימה לקובץ
const outputPath = path.join(__dirname, 'missing-words.txt');
fs.writeFileSync(outputPath, missingWords.map(w => `'${w}': ''`).join(',\n'));
console.log(`\nרשימת המילים החסרות נשמרה ב-${outputPath}`);

