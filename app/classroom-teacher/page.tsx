'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';

// פונקציה לחילוץ מילים אנגליות מטקסט
const extractEnglishWords = (text: string): string[] => {
  // חילוץ מילים אנגליות (אותיות גדולות וקטנות)
  const englishWords = text.match(/[A-Za-z]+/g) || [];
  return englishWords.filter(word => word.length > 1); // רק מילים עם יותר מאות אחת
};

// פונקציה לחילוץ מילים עבריות מטקסט
const extractHebrewWords = (text: string): string[] => {
  // חילוץ מילים עבריות
  const hebrewWords = text.match(/[\u0590-\u05FF]+/g) || [];
  return hebrewWords.filter(word => word.length > 1);
};

// פונקציה ליצירת אוצר מילים מכל השאלות
const generateVocabularyFromQuestions = (questions: any[]): { en: string; he: string; category: string }[] => {
  const vocabularyMap = new Map<string, { he: string; category: string }>();
  
  questions.forEach(question => {
    // חילוץ מילים מהשאלה
    const questionWords = extractEnglishWords(question.text);
    const explanationWords = extractEnglishWords(question.explanation || '');
    const optionsWords = question.options?.flatMap((option: string) => extractEnglishWords(option)) || [];
    
    // חילוץ מילים עבריות מההסבר
    const hebrewWords = extractHebrewWords(question.explanation || '');
    
    // הוספת מילים למפה
    [...questionWords, ...explanationWords, ...optionsWords].forEach((word, index) => {
      const cleanWord = word.toLowerCase();
      if (cleanWord.length > 1 && !['the', 'and', 'or', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'should', 'may', 'might', 'must', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'].includes(cleanWord)) {
        const hebrewTranslation = hebrewWords[index] || '';
        vocabularyMap.set(cleanWord, {
          he: hebrewTranslation,
          category: question.category || 'general'
        });
      }
    });
  });
  
  return Array.from(vocabularyMap.entries()).map(([en, data]) => ({
    en: en.charAt(0).toUpperCase() + en.slice(1),
    he: data.he,
    category: data.category
  }));
};

// יחידות ורמות
const UNITS = [
  { id: '1', name: 'יחידה 1 - מילים בסיסיות', description: 'בעלי חיים, צבעים, מספרים, חלקי גוף' },
  { id: '2', name: 'יחידה 2 - בית ומשפחה', description: 'בית, משפחה, בגדים, אוכל' },
  { id: '3', name: 'יחידה 3 - בית ספר ופעילויות', description: 'בית ספר, ספורט, תחבורה, טבע' },
  { id: '4', name: 'יחידה 4 - זמן ומזג אוויר', description: 'ימים, חודשים, עונות, מזג אוויר' },
  { id: '5', name: 'יחידה 5 - דקדוק בסיסי', description: 'פעלים, שמות עצם, תיאורים, משפטים' },
  { id: '6', name: 'יחידה 6 - אוצר מילים מתקדם', description: 'מקצועות, מקומות, תחבורה מתקדמת' },
  { id: '7', name: 'יחידה 7 - דקדוק מתקדם', description: 'זמנים, מבנה משפטים, ביטויים' },
  { id: '8', name: 'יחידה 8 - אנגלית מתקדמת', description: 'אוצר מילים מורכב, דקדוק מתקדם מאוד' }
];

const LEVELS = [
  { id: '1', name: 'רמה 1 - מתחילים', description: 'מילים פשוטות ושאלות בסיסיות' },
  { id: '2', name: 'רמה 2 - בסיסי', description: 'מילים יומיומיות ושאלות פשוטות' },
  { id: '3', name: 'רמה 3 - בינוני', description: 'מילים מורכבות יותר ושאלות בינוניות' },
  { id: '4', name: 'רמה 4 - מתקדם', description: 'מילים מתקדמות ושאלות מורכבות' },
  { id: '5', name: 'רמה 5 - מומחה', description: 'מילים מורכבות מאוד ושאלות מאתגרות' }
];

// אוצר מילים לפי יחידות ורמות - נוצר מהשאלות האמיתיות
const VOCABULARY_BY_UNIT_LEVEL = {
  '1': generateVocabularyFromQuestions([
    // שאלות כיתה א' - נחלץ מהשאלות האמיתיות
    { text: "איזה בעל חיים אומר 'meow'?", options: ["Dog", "Cat", "Cow", "Bird"], explanation: "חתול אומר 'meow'", category: "animals" },
    { text: "איזה בעל חיים נובח?", options: ["Cat", "Dog", "Pig", "Duck"], explanation: "כלב נובח", category: "animals" },
    { text: "איזה בעל חיים אומר 'moo'?", options: ["Cat", "Dog", "Cow", "Bird"], explanation: "פרה אומרת 'moo'", category: "animals" },
    { text: "איזה בעל חיים יכול לעוף?", options: ["Dog", "Cat", "Cow", "Bird"], explanation: "ציפור יכולה לעוף", category: "animals" },
    { text: "איזה בעל חיים שוחה במים?", options: ["Cat", "Dog", "Fish", "Bird"], explanation: "דג שוחה במים", category: "animals" },
    { text: "איזה צבע לשמים?", options: ["Green", "Blue", "Red", "Yellow"], explanation: "השמים כחולים", category: "colors" },
    { text: "איזה צבע לדשא?", options: ["Blue", "Green", "Red", "Yellow"], explanation: "הדשא ירוק", category: "colors" },
    { text: "איזה צבע לשמש?", options: ["Blue", "Green", "Yellow", "Purple"], explanation: "השמש צהובה", category: "colors" },
    { text: "איזה צבע לשלג?", options: ["Black", "White", "Red", "Green"], explanation: "השלג לבן", category: "colors" },
    { text: "איזה צבע לתפוח?", options: ["Blue", "Green", "Red", "Black"], explanation: "התפוח אדום", category: "colors" },
    { text: "איזה צבע לבננה?", options: ["Blue", "Green", "Yellow", "Black"], explanation: "הבננה צהובה", category: "colors" },
    { text: "איזה צבע לתפוז?", options: ["Blue", "Orange", "Yellow", "Black"], explanation: "התפוז כתום", category: "colors" },
    { text: "איזה צבע לענבים?", options: ["Purple", "Green", "Yellow", "Black"], explanation: "הענבים סגולים", category: "colors" },
    { text: "כמה עיניים יש לך?", options: ["One", "Two", "Three", "Four"], explanation: "יש לך שתי עיניים", category: "numbers" },
    { text: "כמה ידיים יש לך?", options: ["One", "Two", "Three", "Four"], explanation: "יש לך שתי ידיים", category: "numbers" },
    { text: "כמה רגליים יש לכלב?", options: ["Two", "Three", "Four", "Five"], explanation: "לכלב יש ארבע רגליים", category: "numbers" },
    { text: "כמה אצבעות יש לך?", options: ["Five", "Ten", "Fifteen", "Twenty"], explanation: "יש לך עשר אצבעות", category: "numbers" },
    { text: "כמה ימים יש בשבוע?", options: ["Five", "Six", "Seven", "Eight"], explanation: "יש שבעה ימים בשבוע", category: "numbers" },
    { text: "במה אתה משתמש כדי לראות?", options: ["Eyes", "Nose", "Mouth", "Ears"], explanation: "אתה משתמש בעיניים כדי לראות", category: "body" },
    { text: "במה אתה משתמש כדי לשמוע?", options: ["Eyes", "Nose", "Mouth", "Ears"], explanation: "אתה משתמש באוזניים כדי לשמוע", category: "body" },
    { text: "במה אתה משתמש כדי לאכול?", options: ["Eyes", "Nose", "Mouth", "Ears"], explanation: "אתה משתמש בפה כדי לאכול", category: "body" },
    { text: "במה אתה משתמש כדי ללכת?", options: ["Hands", "Feet", "Eyes", "Mouth"], explanation: "אתה משתמש ברגליים כדי ללכת", category: "body" },
    { text: "במה אתה משתמש כדי להריח?", options: ["Eyes", "Nose", "Mouth", "Ears"], explanation: "אתה משתמש באף כדי להריח", category: "body" },
    { text: "איפה אתה ישן?", options: ["Kitchen", "Bed", "Bathroom", "Garden"], explanation: "אתה ישן במיטה", category: "home" },
    { text: "איפה אתה מבשל?", options: ["Kitchen", "Bedroom", "Bathroom", "Garden"], explanation: "אתה מבשל במטבח", category: "home" },
    { text: "על מה אתה יושב?", options: ["Table", "Chair", "Bed", "Floor"], explanation: "אתה יושב על כסא", category: "home" },
    { text: "מה אתה קורא?", options: ["Book", "Table", "Chair", "Window"], explanation: "אתה קורא ספר", category: "home" },
    { text: "איפה אתה רוחץ ידיים?", options: ["Kitchen", "Bathroom", "Bedroom", "Garden"], explanation: "אתה רוחץ ידיים בחדר האמבטיה", category: "home" },
    { text: "איפה אתה לומד?", options: ["School", "Home", "Park", "Shop"], explanation: "אתה לומד בבית הספר", category: "school" },
    { text: "מי מלמד אותך?", options: ["Student", "Teacher", "Friend", "Parent"], explanation: "המורה מלמד אותך", category: "school" },
    { text: "במה אתה כותב?", options: ["Book", "Pencil", "Table", "Chair"], explanation: "אתה כותב בעיפרון", category: "school" },
    { text: "על מה אתה כותב?", options: ["Pencil", "Paper", "Chair", "Table"], explanation: "אתה כותב על נייר", category: "school" },
    { text: "איזה פרי אדום?", options: ["Banana", "Apple", "Orange", "Grape"], explanation: "התפוח אדום", category: "food" },
    { text: "איזה פרי צהוב?", options: ["Apple", "Banana", "Grape", "Cherry"], explanation: "הבננה צהובה", category: "food" },
    { text: "איזה פרי כתום?", options: ["Apple", "Banana", "Orange", "Cherry"], explanation: "התפוז כתום", category: "food" },
    { text: "מה אתה שותה כשיש לך צמא?", options: ["Bread", "Water", "Cake", "Meat"], explanation: "אתה שותה מים כשיש לך צמא", category: "food" },
    { text: "מה אתה אוכל כשיש לך רעב?", options: ["Food", "Water", "Air", "Nothing"], explanation: "אתה אוכל אוכל כשיש לך רעב", category: "food" },
    { text: "מה אתה עושה עם ספר?", options: ["Eat", "Read", "Drink", "Fly"], explanation: "אתה קורא ספר", category: "verbs" },
    { text: "מה אתה עושה עם אוכל?", options: ["Eat", "Read", "Write", "Fly"], explanation: "אתה אוכל אוכל", category: "verbs" },
    { text: "מה אתה עושה עם מים?", options: ["Eat", "Read", "Drink", "Fly"], explanation: "אתה שותה מים", category: "verbs" },
    { text: "מה ציפור יכולה לעשות?", options: ["Eat", "Read", "Drink", "Fly"], explanation: "ציפור יכולה לעוף", category: "verbs" }
  ]),
  '2': generateVocabularyFromQuestions([
    // שאלות כיתה ב' - נחלץ מהשאלות האמיתיות
    { text: "What animal says 'meow'? 🐱", options: ["Dog", "Cat", "Cow", "Bird"], explanation: "Cat says 'meow' - חתול אומר מיאו", category: "animals" },
    { text: "What animal barks? 🐶", options: ["Cat", "Dog", "Cow", "Bird"], explanation: "Dog barks - כלב נובח", category: "animals" },
    { text: "What color is blood? 🔴", options: ["Blue", "Green", "Red", "Yellow"], explanation: "Blood is red - דם הוא אדום", category: "colors" },
    { text: "What color is the ocean? 🌊", options: ["Blue", "Green", "Red", "Yellow"], explanation: "The ocean is blue - האוקיינוס כחול", category: "colors" },
    { text: "Which word rhymes with 'cat'?", options: ["Dog", "Hat", "Sun", "Ball"], explanation: "Cat and Hat rhyme - חתול וכובע מתחרזים", category: "sounds" },
    { text: "Which word rhymes with 'dog'?", options: ["Cat", "Hat", "Frog", "Ball"], explanation: "Dog and Frog rhyme - כלב וצפרדע מתחרזים", category: "sounds" },
    { text: "What is this? ☀️", options: ["Moon", "Sun", "Star", "Cloud"], explanation: "This is the sun - זה השמש", category: "words" },
    { text: "What do you read? 📖", options: ["Pen", "Book", "Table", "Chair"], explanation: "You read a book - אתה קורא ספר", category: "words" },
    { text: "What do you play with? ⚽", options: ["Doll", "Ball", "Car", "House"], explanation: "You play with a ball - אתה משחק עם כדור", category: "words" },
    { text: "What grows tall? 🌳", options: ["Flower", "Tree", "Grass", "Rock"], explanation: "A tree grows tall - עץ גדל גבוה", category: "words" },
    { text: "Which animal can fly?", options: ["Fish", "Bird", "Cow", "Dog"], explanation: "A bird can fly - ציפור יכולה לעוף", category: "animals" },
    { text: "Which animal lives in water?", options: ["Cat", "Dog", "Fish", "Bird"], explanation: "A fish lives in water - דג חי במים", category: "animals" },
    { text: "Which animal gives us milk?", options: ["Dog", "Cat", "Cow", "Bird"], explanation: "A cow gives us milk - פרה נותנת לנו חלב", category: "animals" },
    { text: "Which animal has a long neck?", options: ["Dog", "Cat", "Giraffe", "Bird"], explanation: "A giraffe has a long neck", category: "animals" },
    { text: "Which animal is very big?", options: ["Mouse", "Cat", "Elephant", "Bird"], explanation: "An elephant is very big", category: "animals" },
    { text: "What food is made from flour?", options: ["Bread", "Milk", "Egg", "Apple"], explanation: "Bread is made from flour", category: "food" },
    { text: "Which is a vegetable?", options: ["Carrot", "Banana", "Apple", "Orange"], explanation: "A carrot is a vegetable", category: "food" },
    { text: "Which drink is white?", options: ["Orange juice", "Milk", "Apple juice", "Water"], explanation: "Milk is white", category: "food" },
    { text: "Which fruit is yellow and long?", options: ["Apple", "Banana", "Orange", "Grape"], explanation: "A banana is yellow and long", category: "food" },
    { text: "What do you drink when you're thirsty?", options: ["Bread", "Water", "Cake", "Meat"], explanation: "You drink water when you're thirsty", category: "food" },
    { text: "What has four wheels?", options: ["Bicycle", "Car", "Train", "Plane"], explanation: "A car has four wheels", category: "transport" },
    { text: "What flies in the sky?", options: ["Car", "Bus", "Plane", "Bicycle"], explanation: "A plane flies in the sky", category: "transport" },
    { text: "What has two wheels?", options: ["Car", "Bus", "Bicycle", "Train"], explanation: "A bicycle has two wheels", category: "transport" },
    { text: "What goes on rails?", options: ["Car", "Bus", "Bicycle", "Train"], explanation: "A train goes on rails", category: "transport" },
    { text: "What carries many people?", options: ["Car", "Bus", "Bicycle", "Motorcycle"], explanation: "A bus carries many people", category: "transport" },
    { text: "What do you wear on your head?", options: ["Hat", "Shoes", "Pants", "Shirt"], explanation: "You wear a hat on your head", category: "clothes" },
    { text: "What do you wear on your feet?", options: ["Hat", "Shoes", "Pants", "Shirt"], explanation: "You wear shoes on your feet", category: "clothes" },
    { text: "What do you wear when it's cold?", options: ["Swimsuit", "Coat", "Shorts", "Sandals"], explanation: "You wear a coat when it's cold", category: "clothes" },
    { text: "What do you wear to bed?", options: ["Suit", "Pajamas", "Dress", "Uniform"], explanation: "You wear pajamas to bed", category: "clothes" },
    { text: "What do you wear to school?", options: ["Pajamas", "Uniform", "Swimsuit", "Coat"], explanation: "You wear a uniform to school", category: "clothes" },
    { text: "Where do you wash your hands?", options: ["Kitchen", "Bathroom", "Bedroom", "Garden"], explanation: "You wash your hands in the bathroom", category: "home" },
    { text: "Where do you eat?", options: ["Bathroom", "Kitchen", "Bedroom", "Garden"], explanation: "You eat in the kitchen", category: "home" },
    { text: "Where do you brush your teeth?", options: ["Kitchen", "Bathroom", "Bedroom", "Garden"], explanation: "You brush your teeth in the bathroom", category: "home" },
    { text: "What do you write on?", options: ["Pencil", "Paper", "Book", "Table"], explanation: "You write on paper", category: "school" },
    { text: "What tells you the time?", options: ["Book", "Pencil", "Clock", "Chair"], explanation: "A clock tells you the time", category: "school" },
    { text: "What do you use to cut paper?", options: ["Pencil", "Scissors", "Book", "Chair"], explanation: "You use scissors to cut paper", category: "school" },
    { text: "What do you use to draw?", options: ["Scissors", "Crayon", "Book", "Chair"], explanation: "You use a crayon to draw", category: "school" },
    { text: "How many fingers do you have?", options: ["Five", "Ten", "Fifteen", "Twenty"], explanation: "You have ten fingers", category: "numbers" },
    { text: "How many days in a week?", options: ["Five", "Six", "Seven", "Eight"], explanation: "There are seven days in a week", category: "numbers" },
    { text: "What do you do with a pencil?", options: ["Eat", "Write", "Drink", "Fly"], explanation: "You write with a pencil", category: "verbs" },
    { text: "What do you do with scissors?", options: ["Eat", "Write", "Cut", "Fly"], explanation: "You cut with scissors", category: "verbs" },
    { text: "What do you do with a ball?", options: ["Eat", "Write", "Play", "Sleep"], explanation: "You play with a ball", category: "verbs" },
    { text: "What do you do in bed?", options: ["Eat", "Write", "Play", "Sleep"], explanation: "You sleep in bed", category: "verbs" },
    { text: "What do you do with a book?", options: ["Eat", "Read", "Cut", "Sleep"], explanation: "You read a book", category: "verbs" },
    { text: "Complete: I ___ happy", options: ["am", "is", "are", "be"], explanation: "I am happy", category: "grammar" },
    { text: "Complete: She ___ tall", options: ["am", "is", "are", "be"], explanation: "She is tall", category: "grammar" },
    { text: "Complete: They ___ playing", options: ["am", "is", "are", "be"], explanation: "They are playing", category: "grammar" },
    { text: "What is the opposite of 'big'?", options: ["Large", "Small", "Huge", "Giant"], explanation: "The opposite of 'big' is 'small'", category: "vocabulary" },
    { text: "What is the opposite of 'hot'?", options: ["Warm", "Cold", "Cool", "Fire"], explanation: "The opposite of 'hot' is 'cold'", category: "vocabulary" },
    { text: "True or False: A cat can fly", options: ["True", "False"], explanation: "False - A cat cannot fly", category: "true_false" },
    { text: "True or False: The sun is yellow", options: ["True", "False"], explanation: "True - The sun is yellow", category: "true_false" },
    { text: "True or False: Fish can swim", options: ["True", "False"], explanation: "True - Fish can swim", category: "true_false" },
    { text: "What do you call a baby dog?", options: ["Puppy", "Kitten", "Chick", "Cub"], explanation: "A baby dog is called a puppy", category: "vocabulary" },
    { text: "What do you call a baby cat?", options: ["Puppy", "Kitten", "Chick", "Cub"], explanation: "A baby cat is called a kitten", category: "vocabulary" },
    { text: "Which is bigger: elephant or mouse?", options: ["Elephant", "Mouse", "Same size", "Don't know"], explanation: "Elephant is much bigger than mouse", category: "comparison" },
    { text: "Which is smaller: bird or airplane?", options: ["Bird", "Airplane", "Same size", "Don't know"], explanation: "Bird is smaller than airplane", category: "comparison" },
    { text: "How do you say 'שלום' in English?", options: ["Goodbye", "Hello", "Thank you", "Please"], explanation: "'שלום' means 'Hello' in English", category: "translation" },
    { text: "How do you say 'תודה' in English?", options: ["Goodbye", "Hello", "Thank you", "Please"], explanation: "'תודה' means 'Thank you' in English", category: "translation" },
    { text: "What comes after Monday?", options: ["Sunday", "Tuesday", "Wednesday", "Thursday"], explanation: "Tuesday comes after Monday", category: "days" },
    { text: "What comes after Wednesday?", options: ["Monday", "Tuesday", "Thursday", "Friday"], explanation: "Thursday comes after Wednesday", category: "days" },
    { text: "Which season comes after winter?", options: ["Summer", "Spring", "Fall", "Rain"], explanation: "Spring comes after winter", category: "seasons" },
    { text: "Which season comes after spring?", options: ["Winter", "Summer", "Fall", "Rain"], explanation: "Summer comes after spring", category: "seasons" },
    { text: "What do you wear on your head in winter?", options: ["Hat", "Shoes", "Gloves", "Shorts"], explanation: "You wear a hat on your head in winter", category: "clothes" },
    { text: "What do you wear on your hands in winter?", options: ["Hat", "Shoes", "Gloves", "Shorts"], explanation: "You wear gloves on your hands in winter", category: "clothes" }
  ]),
  '3': generateVocabularyFromQuestions([
    // שאלות כיתה ג' - נחלץ מהשאלות האמיתיות
    { text: "Who is your mother's mother?", options: ["Aunt", "Grandmother", "Sister", "Cousin"], explanation: "Your mother's mother is your grandmother", category: "family" },
    { text: "Who is your father's son?", options: ["Brother", "Uncle", "Cousin", "Nephew"], explanation: "Your father's son is your brother", category: "family" },
    { text: "Who is your uncle's daughter?", options: ["Sister", "Cousin", "Aunt", "Niece"], explanation: "Your uncle's daughter is your cousin", category: "family" },
    { text: "Who is your brother's wife?", options: ["Aunt", "Sister", "Sister-in-law", "Mother"], explanation: "Your brother's wife is your sister-in-law", category: "family" },
    { text: "Who is your mother's brother?", options: ["Uncle", "Cousin", "Nephew", "Father"], explanation: "Your mother's brother is your uncle", category: "family" },
    { text: "Who is your parents' daughter?", options: ["Sister", "Aunt", "Cousin", "Niece"], explanation: "Your parents' daughter is your sister", category: "family" },
    { text: "Who is your uncle's son?", options: ["Brother", "Cousin", "Nephew", "Son"], explanation: "Your uncle's son is your cousin", category: "family" },
    { text: "Who is your father's brother?", options: ["Uncle", "Cousin", "Nephew", "Grandfather"], explanation: "Your father's brother is your uncle", category: "family" },
    { text: "Who is your mother's sister?", options: ["Uncle", "Aunt", "Cousin", "Grandmother"], explanation: "Your mother's sister is your aunt", category: "family" },
    { text: "What is the weather like when it's sunny?", options: ["Rainy", "Cloudy", "Sunny", "Snowy"], explanation: "When it's sunny, the weather is sunny", category: "weather" },
    { text: "What is the weather like when it's raining?", options: ["Sunny", "Cloudy", "Rainy", "Snowy"], explanation: "When it's raining, the weather is rainy", category: "weather" },
    { text: "What is the weather like when it's snowing?", options: ["Sunny", "Cloudy", "Rainy", "Snowy"], explanation: "When it's snowing, the weather is snowy", category: "weather" },
    { text: "What do you call someone who teaches?", options: ["Student", "Teacher", "Doctor", "Engineer"], explanation: "Someone who teaches is a teacher", category: "jobs" },
    { text: "What do you call someone who helps sick people?", options: ["Teacher", "Doctor", "Engineer", "Lawyer"], explanation: "Someone who helps sick people is a doctor", category: "jobs" },
    { text: "What do you call someone who builds things?", options: ["Teacher", "Doctor", "Engineer", "Lawyer"], explanation: "Someone who builds things is an engineer", category: "jobs" },
    { text: "What do you call someone who makes art?", options: ["Teacher", "Doctor", "Engineer", "Artist"], explanation: "Someone who makes art is an artist", category: "jobs" },
    { text: "What do you call someone who plays music?", options: ["Teacher", "Doctor", "Engineer", "Musician"], explanation: "Someone who plays music is a musician", category: "jobs" }
  ]),
  '4': generateVocabularyFromQuestions([
    // שאלות כיתה ד' - נחלץ מהשאלות האמיתיות
    { text: "Complete: 'I like to ___ books'", options: ["read", "reading", "reads", "readed"], explanation: "I like to read books", category: "sentences" },
    { text: "Complete: 'She is ___ a song'", options: ["sing", "sings", "singing", "sang"], explanation: "She is singing a song", category: "sentences" },
    { text: "Complete: 'They ___ to school every day'", options: ["go", "goes", "going", "went"], explanation: "They go to school every day", category: "sentences" },
    { text: "Complete: 'He ___ his homework yesterday'", options: ["do", "does", "doing", "did"], explanation: "He did his homework yesterday", category: "sentences" },
    { text: "Complete: 'We ___ football tomorrow'", options: ["play", "plays", "playing", "will play"], explanation: "We will play football tomorrow", category: "sentences" },
    { text: "Complete: 'I have ___ my breakfast'", options: ["eat", "ate", "eaten", "eating"], explanation: "I have eaten my breakfast", category: "sentences" },
    { text: "Complete: 'She ___ English every day'", options: ["study", "studies", "studying", "studied"], explanation: "She studies English every day", category: "sentences" },
    { text: "Complete: 'They ___ playing outside'", options: ["am", "is", "are", "be"], explanation: "They are playing outside", category: "sentences" },
    { text: "Complete: 'He ___ a book last night'", options: ["read", "reads", "reading", "readed"], explanation: "He read a book last night", category: "sentences" },
    { text: "What do you do in the morning?", options: ["Sleep", "Wake up", "Eat dinner", "Go to bed"], explanation: "In the morning you wake up", category: "reading" },
    { text: "Where do you go to learn?", options: ["Hospital", "School", "Restaurant", "Park"], explanation: "You go to school to learn", category: "reading" },
    { text: "Where do you go when you're sick?", options: ["School", "Hospital", "Restaurant", "Park"], explanation: "You go to the hospital when you're sick", category: "reading" },
    { text: "Where do you go to eat?", options: ["School", "Hospital", "Restaurant", "Park"], explanation: "You go to a restaurant to eat", category: "reading" },
    { text: "Where do you go to play?", options: ["School", "Hospital", "Restaurant", "Park"], explanation: "You go to the park to play", category: "reading" }
  ]),
  '5': generateVocabularyFromQuestions([
    // שאלות כיתה ה' - דקדוק מתקדם ואוצר מילים רחב
    { text: "Complete: 'I ___ a book yesterday'", options: ["read", "reads", "reading", "readed"], explanation: "I read a book yesterday", category: "past_tense" },
    { text: "Complete: 'She ___ to the store every day'", options: ["go", "goes", "going", "went"], explanation: "She goes to the store every day", category: "present_tense" },
    { text: "Complete: 'They ___ playing football'", options: ["am", "is", "are", "be"], explanation: "They are playing football", category: "present_continuous" },
    { text: "Complete: 'I ___ my homework yet'", options: ["don't finish", "didn't finish", "haven't finished", "won't finish"], explanation: "I haven't finished my homework yet", category: "present_perfect" },
    { text: "Complete: 'He ___ a doctor'", options: ["is", "are", "am", "be"], explanation: "He is a doctor", category: "professions" },
    { text: "Complete: 'She ___ beautiful'", options: ["is", "are", "am", "be"], explanation: "She is beautiful", category: "adjectives" },
    { text: "Complete: 'We ___ happy'", options: ["is", "are", "am", "be"], explanation: "We are happy", category: "adjectives" },
    { text: "What is the comparative of 'big'?", options: ["bigger", "biggest", "more big", "most big"], explanation: "The comparative of 'big' is 'bigger'", category: "comparatives" },
    { text: "What is the superlative of 'good'?", options: ["better", "best", "gooder", "goodest"], explanation: "The superlative of 'good' is 'best'", category: "superlatives" },
    { text: "What is the opposite of 'expensive'?", options: ["cheap", "dear", "costly", "valuable"], explanation: "The opposite of 'expensive' is 'cheap'", category: "opposites" },
    { text: "What is the opposite of 'difficult'?", options: ["easy", "hard", "tough", "challenging"], explanation: "The opposite of 'difficult' is 'easy'", category: "opposites" },
    { text: "What do you call someone who fixes cars?", options: ["mechanic", "doctor", "teacher", "engineer"], explanation: "Someone who fixes cars is a mechanic", category: "professions" },
    { text: "What do you call someone who cooks food?", options: ["chef", "doctor", "teacher", "engineer"], explanation: "Someone who cooks food is a chef", category: "professions" },
    { text: "What do you call someone who flies planes?", options: ["pilot", "doctor", "teacher", "engineer"], explanation: "Someone who flies planes is a pilot", category: "professions" },
    { text: "What do you call someone who writes books?", options: ["author", "doctor", "teacher", "engineer"], explanation: "Someone who writes books is an author", category: "professions" },
    { text: "What do you call someone who takes photos?", options: ["photographer", "doctor", "teacher", "engineer"], explanation: "Someone who takes photos is a photographer", category: "professions" },
    { text: "What do you call someone who designs buildings?", options: ["architect", "doctor", "teacher", "engineer"], explanation: "Someone who designs buildings is an architect", category: "professions" },
    { text: "What do you call someone who studies science?", options: ["scientist", "doctor", "teacher", "engineer"], explanation: "Someone who studies science is a scientist", category: "professions" },
    { text: "What do you call someone who plays music?", options: ["musician", "doctor", "teacher", "engineer"], explanation: "Someone who plays music is a musician", category: "professions" },
    { text: "What do you call someone who paints pictures?", options: ["artist", "doctor", "teacher", "engineer"], explanation: "Someone who paints pictures is an artist", category: "professions" }
  ]),
  '6': generateVocabularyFromQuestions([
    // שאלות כיתה ו' - דקדוק מתקדם ואוצר מילים מתקדם
    { text: "Complete: 'If I ___ rich, I would travel'", options: ["am", "was", "were", "be"], explanation: "If I were rich, I would travel", category: "conditionals" },
    { text: "Complete: 'If it ___ tomorrow, we will stay home'", options: ["rains", "rain", "will rain", "rained"], explanation: "If it rains tomorrow, we will stay home", category: "conditionals" },
    { text: "Complete: 'The book ___ by the student'", options: ["reads", "is read", "was read", "will read"], explanation: "The book was read by the student", category: "passive_voice" },
    { text: "Complete: 'The house ___ by the fire'", options: ["destroys", "is destroyed", "was destroyed", "will destroy"], explanation: "The house was destroyed by the fire", category: "passive_voice" },
    { text: "Complete: 'I wish I ___ taller'", options: ["am", "was", "were", "be"], explanation: "I wish I were taller", category: "wishes" },
    { text: "Complete: 'I wish I ___ more time'", options: ["have", "had", "has", "will have"], explanation: "I wish I had more time", category: "wishes" },
    { text: "Complete: 'She suggested that he ___ early'", options: ["leaves", "leave", "left", "will leave"], explanation: "She suggested that he leave early", category: "subjunctive" },
    { text: "Complete: 'I recommend that you ___ more'", options: ["studies", "study", "studied", "will study"], explanation: "I recommend that you study more", category: "subjunctive" },
    { text: "What is the past participle of 'write'?", options: ["wrote", "written", "writed", "writing"], explanation: "The past participle of 'write' is 'written'", category: "irregular_verbs" },
    { text: "What is the past participle of 'go'?", options: ["went", "gone", "goed", "going"], explanation: "The past participle of 'go' is 'gone'", category: "irregular_verbs" },
    { text: "What is the past participle of 'see'?", options: ["saw", "seen", "seed", "seeing"], explanation: "The past participle of 'see' is 'seen'", category: "irregular_verbs" },
    { text: "What is the past participle of 'take'?", options: ["took", "taken", "taked", "taking"], explanation: "The past participle of 'take' is 'taken'", category: "irregular_verbs" },
    { text: "What is the past participle of 'give'?", options: ["gave", "given", "gived", "giving"], explanation: "The past participle of 'give' is 'given'", category: "irregular_verbs" },
    { text: "What is the past participle of 'break'?", options: ["broke", "broken", "breaked", "breaking"], explanation: "The past participle of 'break' is 'broken'", category: "irregular_verbs" },
    { text: "What is the past participle of 'choose'?", options: ["chose", "chosen", "choosed", "choosing"], explanation: "The past participle of 'choose' is 'chosen'", category: "irregular_verbs" },
    { text: "What is the past participle of 'speak'?", options: ["spoke", "spoken", "speaked", "speaking"], explanation: "The past participle of 'speak' is 'spoken'", category: "irregular_verbs" },
    { text: "What is the past participle of 'drive'?", options: ["drove", "driven", "drived", "driving"], explanation: "The past participle of 'drive' is 'driven'", category: "irregular_verbs" },
    { text: "What is the past participle of 'eat'?", options: ["ate", "eaten", "eated", "eating"], explanation: "The past participle of 'eat' is 'eaten'", category: "irregular_verbs" },
    { text: "What is the past participle of 'fall'?", options: ["fell", "fallen", "falled", "falling"], explanation: "The past participle of 'fall' is 'fallen'", category: "irregular_verbs" },
    { text: "What is the past participle of 'forget'?", options: ["forgot", "forgotten", "forgeted", "forgetting"], explanation: "The past participle of 'forget' is 'forgotten'", category: "irregular_verbs" }
  ]),
  '7': generateVocabularyFromQuestions([
    // שאלות כיתה ז' - דקדוק מורכב ואוצר מילים מתקדם מאוד
    { text: "Complete: 'I would have ___ if I had known'", options: ["come", "came", "coming", "comes"], explanation: "I would have come if I had known", category: "conditional_perfect" },
    { text: "Complete: 'She would have ___ if she had studied'", options: ["pass", "passed", "passing", "passes"], explanation: "She would have passed if she had studied", category: "conditional_perfect" },
    { text: "Complete: 'They would have ___ if they had time'", options: ["help", "helped", "helping", "helps"], explanation: "They would have helped if they had time", category: "conditional_perfect" },
    { text: "Complete: 'I wish I had ___ earlier'", options: ["wake", "woken", "waking", "wakes"], explanation: "I wish I had woken earlier", category: "wish_past" },
    { text: "Complete: 'She wishes she had ___ harder'", options: ["work", "worked", "working", "works"], explanation: "She wishes she had worked harder", category: "wish_past" },
    { text: "Complete: 'I regret ___ that'", options: ["do", "doing", "did", "done"], explanation: "I regret doing that", category: "gerunds" },
    { text: "Complete: 'She enjoys ___ music'", options: ["listen", "listening", "listened", "listens"], explanation: "She enjoys listening to music", category: "gerunds" },
    { text: "Complete: 'He avoids ___ late'", options: ["arrive", "arriving", "arrived", "arrives"], explanation: "He avoids arriving late", category: "gerunds" },
    { text: "Complete: 'I can't help ___ about it'", options: ["think", "thinking", "thought", "thinks"], explanation: "I can't help thinking about it", category: "gerunds" },
    { text: "Complete: 'She is used to ___ early'", options: ["get up", "getting up", "got up", "gets up"], explanation: "She is used to getting up early", category: "gerunds" },
    { text: "Complete: 'He is looking forward to ___ you'", options: ["see", "seeing", "saw", "sees"], explanation: "He is looking forward to seeing you", category: "gerunds" },
    { text: "Complete: 'I am interested in ___ English'", options: ["learn", "learning", "learned", "learns"], explanation: "I am interested in learning English", category: "gerunds" },
    { text: "Complete: 'She is good at ___ problems'", options: ["solve", "solving", "solved", "solves"], explanation: "She is good at solving problems", category: "gerunds" },
    { text: "Complete: 'He is afraid of ___ alone'", options: ["be", "being", "was", "is"], explanation: "He is afraid of being alone", category: "gerunds" },
    { text: "Complete: 'I am tired of ___ the same thing'", options: ["do", "doing", "did", "does"], explanation: "I am tired of doing the same thing", category: "gerunds" },
    { text: "Complete: 'She is proud of ___ her exam'", options: ["pass", "passing", "passed", "passes"], explanation: "She is proud of passing her exam", category: "gerunds" },
    { text: "Complete: 'He is responsible for ___ the project'", options: ["complete", "completing", "completed", "completes"], explanation: "He is responsible for completing the project", category: "gerunds" },
    { text: "Complete: 'I am excited about ___ to college'", options: ["go", "going", "went", "goes"], explanation: "I am excited about going to college", category: "gerunds" },
    { text: "Complete: 'She is worried about ___ the test'", options: ["fail", "failing", "failed", "fails"], explanation: "She is worried about failing the test", category: "gerunds" },
    { text: "Complete: 'He is confident about ___ the job'", options: ["get", "getting", "got", "gets"], explanation: "He is confident about getting the job", category: "gerunds" }
  ]),
  '8': generateVocabularyFromQuestions([
    // שאלות כיתה ח' - דקדוק מורכב מאוד ואוצר מילים מתקדם מאוד
    { text: "Complete: 'If I had ___ more time, I would have finished'", options: ["have", "had", "has", "having"], explanation: "If I had had more time, I would have finished", category: "conditional_perfect" },
    { text: "Complete: 'She would have ___ if she had known'", options: ["come", "came", "coming", "comes"], explanation: "She would have come if she had known", category: "conditional_perfect" },
    { text: "Complete: 'They would have ___ if they had been invited'", options: ["attend", "attended", "attending", "attends"], explanation: "They would have attended if they had been invited", category: "conditional_perfect" },
    { text: "Complete: 'I wish I had ___ more carefully'", options: ["listen", "listened", "listening", "listens"], explanation: "I wish I had listened more carefully", category: "wish_past" },
    { text: "Complete: 'She wishes she had ___ the opportunity'", options: ["take", "taken", "taking", "takes"], explanation: "She wishes she had taken the opportunity", category: "wish_past" },
    { text: "Complete: 'He wishes he had ___ harder'", options: ["study", "studied", "studying", "studies"], explanation: "He wishes he had studied harder", category: "wish_past" },
    { text: "Complete: 'I regret not ___ earlier'", options: ["start", "starting", "started", "starts"], explanation: "I regret not starting earlier", category: "regret_gerund" },
    { text: "Complete: 'She regrets ___ that decision'", options: ["make", "making", "made", "makes"], explanation: "She regrets making that decision", category: "regret_gerund" },
    { text: "Complete: 'He regrets ___ the chance'", options: ["miss", "missing", "missed", "misses"], explanation: "He regrets missing the chance", category: "regret_gerund" },
    { text: "Complete: 'I regret ___ to you'", options: ["lie", "lying", "lied", "lies"], explanation: "I regret lying to you", category: "regret_gerund" },
    { text: "Complete: 'She regrets ___ the job'", options: ["quit", "quitting", "quitted", "quits"], explanation: "She regrets quitting the job", category: "regret_gerund" },
    { text: "Complete: 'He regrets ___ the money'", options: ["spend", "spending", "spent", "spends"], explanation: "He regrets spending the money", category: "regret_gerund" },
    { text: "Complete: 'I regret ___ the truth'", options: ["tell", "telling", "told", "tells"], explanation: "I regret telling the truth", category: "regret_gerund" },
    { text: "Complete: 'She regrets ___ the meeting'", options: ["skip", "skipping", "skipped", "skips"], explanation: "She regrets skipping the meeting", category: "regret_gerund" },
    { text: "Complete: 'He regrets ___ the offer'", options: ["refuse", "refusing", "refused", "refuses"], explanation: "He regrets refusing the offer", category: "regret_gerund" },
    { text: "Complete: 'I regret ___ the opportunity'", options: ["waste", "wasting", "wasted", "wastes"], explanation: "I regret wasting the opportunity", category: "regret_gerund" },
    { text: "Complete: 'She regrets ___ the chance'", options: ["blow", "blowing", "blew", "blows"], explanation: "She regrets blowing the chance", category: "regret_gerund" },
    { text: "Complete: 'He regrets ___ the risk'", options: ["take", "taking", "took", "takes"], explanation: "He regrets taking the risk", category: "regret_gerund" },
    { text: "Complete: 'I regret ___ the mistake'", options: ["make", "making", "made", "makes"], explanation: "I regret making the mistake", category: "regret_gerund" },
    { text: "Complete: 'She regrets ___ the problem'", options: ["ignore", "ignoring", "ignored", "ignores"], explanation: "She regrets ignoring the problem", category: "regret_gerund" }
  ])
};

interface StudentResult {
  id: string;
  name: string;
  score: number;
  totalTime: number;
  timeBonus?: number;
  timeInMinutes?: number;
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  lastActivity: string;
  gameProgress: number;
}

interface GameSession {
  id: string;
  title: string;
  description: string;
  unit: string; // יחידה
  level: string; // רמה (1-5)
  created: string;
  duration: number; // in minutes
  isActive: boolean;
  students: StudentResult[];
}

export default function ClassroomTeacherPage() {
  const { user, loading } = useAuthUser();
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [newSessionUnit, setNewSessionUnit] = useState('1');
  const [newSessionLevel, setNewSessionLevel] = useState('1');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [selectedUnitVocabulary, setSelectedUnitVocabulary] = useState('');
  const router = useRouter();

  const goToPreview = () => {
    router.push('/classroom-preview');
  };

  const showVocabularyForUnit = (unit: string, level: string) => {
    setSelectedUnitVocabulary(`${unit}-${level}`);
    setShowVocabulary(true);
  };

  // פונקציה לבדיקת תקינות נתונים
  const validateStudentData = (student: StudentResult): StudentResult => {
    // תיקון זמן לא הגיוני
    if (student.totalTime > 7200) { // יותר מ-2 שעות
      student.totalTime = Math.min(student.totalTime, 7200);
    }
    
    // תיקון ניקוד לא הגיוני
    if (student.score < 0) {
      student.score = 0;
    }
    if (student.score > 10000) { // ניקוד מקסימלי הגיוני
      student.score = 10000;
    }
    
    // תיקון התקדמות לא הגיונית
    if (student.gameProgress < 0) {
      student.gameProgress = 0;
    }
    if (student.gameProgress > 100) {
      student.gameProgress = 100;
    }
    
    return student;
  };

  // טען נתונים ממסד הנתונים
  useEffect(() => {
    if (user && user.id) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user || !user.id) {
      console.error('User not logged in');
      return;
    }
    
    try {
      const response = await fetch(`/api/classroom/get-sessions?teacherId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGameSessions(data.sessions);
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  // עדכן נתונים כל 5 שניות
  useEffect(() => {
    const interval = setInterval(() => {
      updateStudentResults();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSession]);

  const createNewSession = async () => {
    if (!newSessionTitle.trim()) return;
    
    if (!user || !user.id) {
      alert('יש להתחבר כדי ליצור כיתה');
      return;
    }

    try {
      const response = await fetch('/api/classroom/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newSessionTitle,
          description: newSessionDescription,
          unit: newSessionUnit,
          level: newSessionLevel,
          teacherName: user.name || user.email || 'מורה',
          teacherId: user.id // שולח את ה-userId של המשתמש המחובר
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newSession = data.session;
          setGameSessions(prev => [newSession, ...prev]);
          setNewSessionTitle('');
          setNewSessionDescription('');
          setNewSessionUnit('1');
        setNewSessionLevel('1');
          setShowCreateForm(false);
          setCurrentSession(newSession);
        }
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const updateStudentResults = async () => {
    if (!currentSession) return;

    try {
      // קבל תוצאות מהשרת
      const response = await fetch(`/api/classroom/get-results?sessionId=${currentSession.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.results) {
          const results: StudentResult[] = data.results;
          
          const updatedSession = {
            ...currentSession,
            students: results
          };
          
          setCurrentSession(updatedSession);
          
          // עדכן גם ברשימה הכללית
          setGameSessions(prev => prev.map(session => 
            session.id === currentSession.id ? updatedSession : session
          ));
        }
      }
    } catch (error) {
      console.error('שגיאה בטעינת תוצאות:', error);
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      // עדכן בשרת
      const response = await fetch('/api/classroom/finish-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        // עדכן את הרשימה המקומית
        const updatedSessions = gameSessions.map(session => 
          session.id === sessionId ? { ...session, isActive: false } : session
        );
        setGameSessions(updatedSessions);
        
        if (currentSession?.id === sessionId) {
          setCurrentSession({ ...currentSession, isActive: false });
        }
        
        console.log('Session finished successfully');
      } else {
        console.error('Failed to finish session');
      }
    } catch (error) {
      console.error('Error finishing session:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      // מחק מהשרת
      const response = await fetch('/api/classroom/delete-session', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        // מחק גם מ-localStorage כגיבוי
        localStorage.removeItem(`classroom-results-${sessionId}`);
        
        // עדכן את הרשימה המקומית
        const updatedSessions = gameSessions.filter(session => session.id !== sessionId);
        setGameSessions(updatedSessions);
        
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
        }
        
        console.log('Session deleted successfully');
      } else {
        console.error('Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const getGameLink = (sessionId: string, unit: string, level: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/classroom-student?session=${sessionId}&unit=${unit}&level=${level}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('הקישור הועתק ללוח!');
  };

  const exportResults = (session: GameSession) => {
    const csvContent = [
      ['שם תלמיד', 'ניקוד', 'זמן (דקות)', 'תאריך', 'שאלות שנענו', 'תשובות נכונות', 'התקדמות (%)'],
      ...session.students.map(student => [
        student.name,
        student.score.toString(),
        Math.round(student.totalTime / 60).toString(),
        student.date,
        student.questionsAnswered.toString(),
        student.correctAnswers.toString(),
        student.gameProgress.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `classroom-results-${session.title}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🎓 ניהול כיתה - משחקי אנגלית
              </h1>
              <p className="text-gray-600">
                צור משחקים לכיתה שלך ועקוב אחר התקדמות התלמידים
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ➕ צור משחק חדש
            </button>
          </div>
        </div>

        {/* Create New Session Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                יצירת משחק כיתה חדש
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם המשחק
                  </label>
                  <input
                    type="text"
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="למשל: מבחן אוצר מילים - יחידה 3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      יחידה
                    </label>
                    <select
                      value={newSessionUnit}
                      onChange={(e) => setNewSessionUnit(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {UNITS.map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      רמה
                    </label>
                    <select
                      value={newSessionLevel}
                      onChange={(e) => setNewSessionLevel(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {LEVELS.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  אוצר המילים יותאם ליחידה והרמה שנבחרו
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תיאור (אופציונלי)
                  </label>
                  <textarea
                    value={newSessionDescription}
                    onChange={(e) => setNewSessionDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="תיאור קצר על המשחק..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={createNewSession}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  יצור משחק
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600 transition-all duration-200"
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sessions List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {gameSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {session.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {session.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <span>📅 {session.created}</span>
                    <span>⏱️ {session.duration} דקות</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      session.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.isActive ? 'פעיל' : 'הושלם'}
                    </span>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    🎓 {UNITS.find(u => u.id === session.unit)?.name} - {LEVELS.find(l => l.id === session.level)?.name}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {session.isActive && (
                    <button
                      onClick={() => endSession(session.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      סיים
                    </button>
                  )}
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                  >
                    מחק
                  </button>
                </div>
              </div>

              {/* Game Link */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    📋 הוראות לתלמידים:
                  </p>
                  <div className="text-xs text-blue-700 bg-blue-100 rounded p-2 mb-2">
                    <p className="mb-1">1. העתק את הקישור למטה</p>
                    <p className="mb-1">2. שלח לתלמידים בווטסאפ/אימייל</p>
                    <p className="mb-1">3. התלמידים יפתחו את הקישור בדפדפן</p>
                    <p>4. יזינו את השם ויתחילו לשחק</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      🔗 קישור למשחק:
                    </p>
                    <p className="text-xs text-blue-600 break-all bg-white p-2 rounded border">
                      {getGameLink(session.id, session.unit, session.level)}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(getGameLink(session.id, session.unit, session.level))}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    📋 העתק
                  </button>
                </div>
              </div>

              {/* Students Count */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-lg font-semibold text-gray-800">
                    👥 {session.students?.length || 0} תלמידים
                  </span>
                  {session.isActive && (
                    <div className="text-xs text-green-600 mt-1">
                      🔄 מעודכן בזמן אמת
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentSession(session)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                  >
                    צפה בתוצאות
                  </button>
                  <button
                    onClick={() => showVocabularyForUnit(session.unit, session.level)}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600"
                  >
                    📚 אוצר מילים
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              {session.students.length > 0 && (
                <div>
                  {/* בדיקת תקינות נתונים */}
                  {(() => {
                    const avgTime = Math.round(session.students.reduce((sum, s) => sum + (s.timeInMinutes || s.totalTime / 60), 0) / session.students.length);
                    const hasInvalidData = avgTime > 120 || session.students.some(s => s.score > 10000 || s.gameProgress > 100);
                    
                    return hasInvalidData && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                          <span className="text-yellow-600 text-sm">⚠️</span>
                          <span className="text-yellow-800 text-sm mr-2">נתונים לא הגיוניים זוהו - ייתכן שיש בעיה בחישוב הזמנים או הניקוד</span>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(session.students.reduce((sum, s) => sum + s.score, 0) / session.students.length)}
                      </div>
                      <div className="text-xs text-green-600">ניקוד ממוצע</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(session.students.reduce((sum, s) => sum + (s.timeInMinutes || s.totalTime / 60), 0) / session.students.length)}
                      </div>
                      <div className="text-xs text-blue-600">דקות ממוצע</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(session.students.reduce((sum, s) => sum + s.gameProgress, 0) / session.students.length)}%
                      </div>
                      <div className="text-xs text-purple-600">התקדמות</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detailed Results Modal */}
        {currentSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  תוצאות: {currentSession.title}
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => exportResults(currentSession)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                  >
                    📊 ייצא ל-CSV
                  </button>
                  <button
                    onClick={() => setCurrentSession(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600"
                  >
                    ✕ סגור
                  </button>
                </div>
              </div>

              {currentSession.students.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-600">
                    עדיין אין תלמידים שהתחילו לשחק
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-right">שם תלמיד</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">ניקוד</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">זמן (דקות)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">שאלות</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">נכונות</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">התקדמות</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">תאריך</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">פעילות אחרונה</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSession.students
                        .sort((a, b) => b.score - a.score)
                        .map((student, index) => (
                        <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                                index === 0 ? 'bg-yellow-400 text-yellow-800' :
                                index === 1 ? 'bg-gray-300 text-gray-800' :
                                index === 2 ? 'bg-orange-400 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {index + 1}
                              </div>
                              {student.name}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <div>
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-bold">
                                {student.score}
                              </span>
                              {student.timeBonus && student.timeBonus > 0 && (
                                <div className="text-xs text-green-600 mt-1">
                                  +{student.timeBonus} בונוס
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {student.timeInMinutes || Math.round(student.totalTime / 60)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {student.questionsAnswered}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                              {student.correctAnswers}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mx-auto">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${student.gameProgress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 mt-1 block">
                              {student.gameProgress}%
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                            {student.date}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                            {student.lastActivity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {gameSessions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              עדיין לא יצרת משחקים
            </h2>
            <p className="text-gray-600 mb-6">
              התחל ביצירת משחק כיתה חדש כדי שהתלמידים יוכלו לשחק
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                צור משחק ראשון
              </button>
              <button
                onClick={goToPreview}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                📚 צפייה באוצר מילים
              </button>
            </div>
          </div>
        )}

        {/* Vocabulary Modal */}
        {showVocabulary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  📚 אוצר מילים - {UNITS.find(u => u.id === selectedUnitVocabulary.split('-')[0])?.name} - {LEVELS.find(l => l.id === selectedUnitVocabulary.split('-')[1])?.name}
                </h2>
                <button
                  onClick={() => setShowVocabulary(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600"
                >
                  ✕ סגור
                </button>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {VOCABULARY_BY_UNIT_LEVEL[selectedUnitVocabulary.split('-')[0] as keyof typeof VOCABULARY_BY_UNIT_LEVEL]?.map((word, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-lg font-bold text-blue-800">{word.en}</div>
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                        {word.category}
                      </span>
                    </div>
                    <div className="text-gray-700 text-sm">{word.he}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  סה"כ {VOCABULARY_BY_UNIT_LEVEL[selectedUnitVocabulary.split('-')[0] as keyof typeof VOCABULARY_BY_UNIT_LEVEL]?.length || 0} מילים ב{UNITS.find(u => u.id === selectedUnitVocabulary.split('-')[0])?.name} - {LEVELS.find(l => l.id === selectedUnitVocabulary.split('-')[1])?.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
