'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
}

interface GameProgress {
  currentQuestion: number;
  score: number;
  totalTime: number;
  questionsAnswered: number;
  correctAnswers: number;
  gameStartTime: number;
  lastActivityTime: number;
  studentName: string;
}

// מאגר שאלות לפי יחידות ורמות
const QUESTIONS_BY_UNIT_LEVEL: { [key: string]: { [key: string]: Question[] } } = {
  '1': { // יחידה 1 - מילים בסיסיות
    '1': [ // רמה 1 - מתחילים - מילים בסיסיות ביותר + צלילים ואותיות (60 שאלות)
    // אותיות וצלילים
    { id: 1, text: "איזה אות היא גדולה? (אותיות גדולות)", options: ["a", "A", "b", "c"], correct: 1, explanation: "A היא אות גדולה", category: "letters" },
    { id: 2, text: "איזה אות היא קטנה? (אותיות קטנות)", options: ["A", "B", "c", "D"], correct: 2, explanation: "c היא אות קטנה", category: "letters" },
    { id: 3, text: "איזה צליל עושה האות C? 🔊", options: ["בּ - Ball", "כּ - Cat", "ד - Dog", "פ - Fish"], correct: 1, explanation: "C עושה צליל כּ כמו במילה Cat", category: "sounds" },
    { id: 4, text: "איזה צליל עושה האות B? 🔊", options: ["בּ - Ball", "כּ - Cat", "ד - Dog", "פ - Fish"], correct: 0, explanation: "B עושה צליל בּ כמו במילה Ball", category: "sounds" },
    { id: 5, text: "איזה צליל עושה האות D? 🔊", options: ["בּ - Ball", "כּ - Cat", "ד - Dog", "פ - Fish"], correct: 2, explanation: "D עושה צליל ד כמו במילה Dog", category: "sounds" },
    { id: 6, text: "איזה צליל עושה האות F? 🔊", options: ["בּ - Ball", "כּ - Cat", "ד - Dog", "פ - Fish"], correct: 3, explanation: "F עושה צליל פ כמו במילה Fish", category: "sounds" },
    { id: 7, text: "איזה צליל עושה האות G? 🔊", options: ["ג - Go", "כּ - Cat", "ד - Dog", "פ - Fish"], correct: 0, explanation: "G עושה צליל ג כמו במילה Go", category: "sounds" },
    { id: 8, text: "איזה צליל עושה האות H? 🔊", options: ["ה - Hat", "כּ - Cat", "ד - Dog", "פ - Fish"], correct: 0, explanation: "H עושה צליל ה כמו במילה Hat", category: "sounds" },
    { id: 9, text: "איזה צליל עושה האות M? 🔊", options: ["מ - Mouse", "נ - No", "ל - Love", "ר - Red"], correct: 0, explanation: "M עושה צליל מ כמו במילה Mouse", category: "sounds" },
    { id: 10, text: "איזה צליל עושה האות N? 🔊", options: ["מ - Mouse", "נ - No", "ל - Love", "ר - Red"], correct: 1, explanation: "N עושה צליל נ כמו במילה No", category: "sounds" },
    { id: 11, text: "איזה צליל עושה האות P? 🔊", options: ["פ - Pen", "ב - Ball", "ת - Table", "ד - Dog"], correct: 0, explanation: "P עושה צליל פ כמו במילה Pen", category: "sounds" },
    { id: 12, text: "איזה צליל עושה האות S? 🔊", options: ["ס - Sun", "ש - Ship", "צ - Zoo", "ז - Zebra"], correct: 0, explanation: "S עושה צליל ס כמו במילה Sun", category: "sounds" },
    { id: 13, text: "איזה צליל עושה האות T? 🔊", options: ["ת - Table", "ד - Dog", "ט - Tiger", "ס - Sun"], correct: 0, explanation: "T עושה צליל ת כמו במילה Table", category: "sounds" },
    { id: 14, text: "איזה צליל עושה האות L? 🔊", options: ["ל - Love", "ר - Red", "מ - Mouse", "נ - No"], correct: 0, explanation: "L עושה צליל ל כמו במילה Love", category: "sounds" },
    { id: 15, text: "איזה צליל עושה האות R? 🔊", options: ["ר - Red", "ל - Love", "מ - Mouse", "נ - No"], correct: 0, explanation: "R עושה צליל ר כמו במילה Red", category: "sounds" },
    
    // מילים פשוטות
    { id: 16, text: "איזה מילה מתחילה ב-C?", options: ["Dog", "Cat", "Ball", "Apple"], correct: 1, explanation: "Cat מתחילה ב-C", category: "reading" },
    { id: 17, text: "איזה מילה מתחילה ב-D?", options: ["Cat", "Dog", "Ball", "Apple"], correct: 1, explanation: "Dog מתחילה ב-D", category: "reading" },
    { id: 18, text: "איזה מילה מתחילה ב-A?", options: ["Cat", "Dog", "Ball", "Apple"], correct: 3, explanation: "Apple מתחילה ב-A", category: "reading" },
    { id: 19, text: "איזה מילה מתחילה ב-B?", options: ["Cat", "Dog", "Ball", "Apple"], correct: 2, explanation: "Ball מתחילה ב-B", category: "reading" },
    { id: 20, text: "איזה מילה מתחילה ב-F?", options: ["Cat", "Dog", "Fish", "Apple"], correct: 2, explanation: "Fish מתחילה ב-F", category: "reading" },
    { id: 21, text: "איזה מילה מתחילה ב-G?", options: ["Cat", "Dog", "Go", "Apple"], correct: 2, explanation: "Go מתחילה ב-G", category: "reading" },
    { id: 22, text: "איזה מילה מתחילה ב-H?", options: ["Cat", "Dog", "Hat", "Apple"], correct: 2, explanation: "Hat מתחילה ב-H", category: "reading" },
    { id: 23, text: "איזה מילה מתחילה ב-M?", options: ["Cat", "Dog", "Mouse", "Apple"], correct: 2, explanation: "Mouse מתחילה ב-M", category: "reading" },
    
    // בעלי חיים - vocabulary
    { id: 24, text: "איזה בעל חיים אומר 'meow'?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 1, explanation: "חתול אומר 'meow'", category: "vocabulary" },
    { id: 25, text: "איזה בעל חיים נובח?", options: ["Cat", "Dog", "Pig", "Duck"], correct: 1, explanation: "כלב נובח", category: "vocabulary" },
    { id: 26, text: "איזה בעל חיים אומר 'moo'?", options: ["Cat", "Dog", "Cow", "Bird"], correct: 2, explanation: "פרה אומרת 'moo'", category: "vocabulary" },
    { id: 27, text: "איזה בעל חיים יכול לעוף?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 3, explanation: "ציפור יכולה לעוף", category: "vocabulary" },
    { id: 28, text: "איזה בעל חיים שוחה במים?", options: ["Cat", "Dog", "Fish", "Bird"], correct: 2, explanation: "דג שוחה במים", category: "vocabulary" },
    { id: 29, text: "איזה בעל חיים אוכל גזר?", options: ["Dog", "Cat", "Rabbit", "Bird"], correct: 2, explanation: "ארנב אוכל גזר", category: "vocabulary" },
    { id: 30, text: "איזה בעל חיים גדול מאוד?", options: ["Mouse", "Cat", "Elephant", "Bird"], correct: 2, explanation: "פיל הוא גדול מאוד", category: "vocabulary" },
    { id: 31, text: "איזה בעל חיים קטן מאוד?", options: ["Dog", "Cat", "Mouse", "Cow"], correct: 2, explanation: "עכבר הוא קטן מאוד", category: "vocabulary" },
    
    // צבעים
    { id: 32, text: "איזה צבע לשמים?", options: ["Green", "Blue", "Red", "Yellow"], correct: 1, explanation: "השמים כחולים", category: "vocabulary" },
    { id: 33, text: "איזה צבע לדשא?", options: ["Blue", "Green", "Red", "Yellow"], correct: 1, explanation: "הדשא ירוק", category: "vocabulary" },
    { id: 34, text: "איזה צבע לשמש?", options: ["Blue", "Green", "Yellow", "Purple"], correct: 2, explanation: "השמש צהובה", category: "vocabulary" },
    { id: 35, text: "איזה צבע לשלג?", options: ["Black", "White", "Red", "Green"], correct: 1, explanation: "השלג לבן", category: "vocabulary" },
    { id: 36, text: "איזה צבע לתפוח?", options: ["Blue", "Green", "Red", "Black"], correct: 2, explanation: "התפוח אדום", category: "vocabulary" },
    { id: 37, text: "איזה צבע לבננה?", options: ["Blue", "Green", "Yellow", "Black"], correct: 2, explanation: "הבננה צהובה", category: "vocabulary" },
    { id: 38, text: "איזה צבע לתפוז?", options: ["Blue", "Orange", "Yellow", "Black"], correct: 1, explanation: "התפוז כתום", category: "vocabulary" },
    { id: 39, text: "איזה צבע לענבים?", options: ["Purple", "Green", "Yellow", "Black"], correct: 0, explanation: "הענבים סגולים", category: "vocabulary" },
    
    // מספרים
    { id: 40, text: "כמה עיניים יש לך?", options: ["One", "Two", "Three", "Four"], correct: 1, explanation: "יש לך שתי עיניים", category: "vocabulary" },
    { id: 41, text: "כמה ידיים יש לך?", options: ["One", "Two", "Three", "Four"], correct: 1, explanation: "יש לך שתי ידיים", category: "vocabulary" },
    { id: 42, text: "כמה רגליים יש לכלב?", options: ["Two", "Three", "Four", "Five"], correct: 2, explanation: "לכלב יש ארבע רגליים", category: "vocabulary" },
    { id: 43, text: "כמה אצבעות יש לך?", options: ["Five", "Ten", "Fifteen", "Twenty"], correct: 1, explanation: "יש לך עשר אצבעות", category: "vocabulary" },
    { id: 44, text: "כמה ימים יש בשבוע?", options: ["Five", "Six", "Seven", "Eight"], correct: 2, explanation: "יש שבעה ימים בשבוע", category: "vocabulary" },
    
    // חלקי גוף
    { id: 45, text: "במה אתה משתמש כדי לראות?", options: ["Eyes", "Nose", "Mouth", "Ears"], correct: 0, explanation: "אתה משתמש בעיניים כדי לראות", category: "vocabulary" },
    { id: 46, text: "במה אתה משתמש כדי לשמוע?", options: ["Eyes", "Nose", "Mouth", "Ears"], correct: 3, explanation: "אתה משתמש באוזניים כדי לשמוע", category: "vocabulary" },
    { id: 47, text: "במה אתה משתמש כדי לאכול?", options: ["Eyes", "Nose", "Mouth", "Ears"], correct: 2, explanation: "אתה משתמש בפה כדי לאכול", category: "vocabulary" },
    { id: 48, text: "במה אתה משתמש כדי ללכת?", options: ["Hands", "Feet", "Eyes", "Mouth"], correct: 1, explanation: "אתה משתמש ברגליים כדי ללכת", category: "vocabulary" },
    { id: 49, text: "במה אתה משתמש כדי להריח?", options: ["Eyes", "Nose", "Mouth", "Ears"], correct: 1, explanation: "אתה משתמש באף כדי להריח", category: "vocabulary" },
    
    // בית
    { id: 50, text: "איפה אתה ישן?", options: ["Kitchen", "Bed", "Bathroom", "Garden"], correct: 1, explanation: "אתה ישן במיטה", category: "vocabulary" },
    { id: 51, text: "איפה אתה מבשל?", options: ["Kitchen", "Bedroom", "Bathroom", "Garden"], correct: 0, explanation: "אתה מבשל במטבח", category: "vocabulary" },
    { id: 52, text: "על מה אתה יושב?", options: ["Table", "Chair", "Bed", "Floor"], correct: 1, explanation: "אתה יושב על כסא", category: "vocabulary" },
    { id: 53, text: "מה אתה קורא?", options: ["Book", "Table", "Chair", "Window"], correct: 0, explanation: "אתה קורא ספר", category: "vocabulary" },
    { id: 54, text: "איפה אתה רוחץ ידיים?", options: ["Kitchen", "Bathroom", "Bedroom", "Garden"], correct: 1, explanation: "אתה רוחץ ידיים בחדר האמבטיה", category: "vocabulary" },
    
    // בית ספר
    { id: 55, text: "איפה אתה לומד?", options: ["School", "Home", "Park", "Shop"], correct: 0, explanation: "אתה לומד בבית הספר", category: "vocabulary" },
    { id: 56, text: "מי מלמד אותך?", options: ["Student", "Teacher", "Friend", "Parent"], correct: 1, explanation: "המורה מלמד אותך", category: "vocabulary" },
    { id: 57, text: "במה אתה כותב?", options: ["Book", "Pencil", "Table", "Chair"], correct: 1, explanation: "אתה כותב בעיפרון", category: "vocabulary" },
    { id: 58, text: "על מה אתה כותב?", options: ["Pencil", "Paper", "Chair", "Table"], correct: 1, explanation: "אתה כותב על נייר", category: "vocabulary" },
    
    // אוכל
    { id: 59, text: "איזה פרי אדום?", options: ["Banana", "Apple", "Orange", "Grape"], correct: 1, explanation: "התפוח אדום", category: "vocabulary" },
    { id: 60, text: "איזה פרי צהוב?", options: ["Apple", "Banana", "Grape", "Cherry"], correct: 1, explanation: "הבננה צהובה", category: "vocabulary" },
    { id: 61, text: "איזה פרי כתום?", options: ["Apple", "Banana", "Orange", "Cherry"], correct: 2, explanation: "התפוז כתום", category: "vocabulary" },
    { id: 62, text: "מה אתה שותה כשיש לך צמא?", options: ["Bread", "Water", "Cake", "Meat"], correct: 1, explanation: "אתה שותה מים כשיש לך צמא", category: "vocabulary" },
    { id: 63, text: "מה אתה אוכל כשיש לך רעב?", options: ["Food", "Water", "Air", "Nothing"], correct: 0, explanation: "אתה אוכל אוכל כשיש לך רעב", category: "vocabulary" },
    
    // פעלים פשוטים
    { id: 64, text: "מה אתה עושה עם ספר?", options: ["Eat", "Read", "Drink", "Fly"], correct: 1, explanation: "אתה קורא ספר", category: "vocabulary" },
    { id: 65, text: "מה אתה עושה עם אוכל?", options: ["Eat", "Read", "Write", "Fly"], correct: 0, explanation: "אתה אוכל אוכל", category: "vocabulary" },
    { id: 66, text: "מה אתה עושה עם מים?", options: ["Eat", "Read", "Drink", "Fly"], correct: 2, explanation: "אתה שותה מים", category: "vocabulary" },
    { id: 67, text: "מה ציפור יכולה לעשות?", options: ["Eat", "Read", "Drink", "Fly"], correct: 3, explanation: "ציפור יכולה לעוף", category: "vocabulary" },
    
    // שאלות חזרה - הקריין אומר משפט והתלמיד חוזר (משפטים פשוטים לפי המילים שלמדו)
    { id: 68, text: "🔊 חזור אחרי הקריין: I see a cat", options: [], correct: 0, explanation: "'I see a cat' - אני רואה חתול", category: "repeat" },
    { id: 69, text: "🔊 חזור אחרי הקריין: This is a dog", options: [], correct: 0, explanation: "'This is a dog' - זה כלב", category: "repeat" },
    { id: 70, text: "🔊 חזור אחרי הקריין: I like fish", options: [], correct: 0, explanation: "'I like fish' - אני אוהב דג", category: "repeat" },
    { id: 71, text: "🔊 חזור אחרי הקריין: The bird is red", options: [], correct: 0, explanation: "'The bird is red' - הציפור אדומה", category: "repeat" },
    { id: 72, text: "🔊 חזור אחרי הקריין: I see blue", options: [], correct: 0, explanation: "'I see blue' - אני רואה כחול", category: "repeat" },
    { id: 73, text: "🔊 חזור אחרי הקריין: Green is good", options: [], correct: 0, explanation: "'Green is good' - ירוק זה טוב", category: "repeat" },
    { id: 74, text: "🔊 חזור אחרי הקריין: Yellow sun", options: [], correct: 0, explanation: "'Yellow sun' - שמש צהובה", category: "repeat" },
    { id: 75, text: "🔊 חזור אחרי הקריין: I have one", options: [], correct: 0, explanation: "'I have one' - יש לי אחד", category: "repeat" },
    { id: 76, text: "🔊 חזור אחרי הקריין: I see two", options: [], correct: 0, explanation: "'I see two' - אני רואה שניים", category: "repeat" },
    { id: 77, text: "🔊 חזור אחרי הקריין: Three is good", options: [], correct: 0, explanation: "'Three is good' - שלושה זה טוב", category: "repeat" },
    { id: 78, text: "🔊 חזור אחרי הקריין: I have four", options: [], correct: 0, explanation: "'I have four' - יש לי ארבעה", category: "repeat" },
    { id: 79, text: "🔊 חזור אחרי הקריין: Five is big", options: [], correct: 0, explanation: "'Five is big' - חמישה זה גדול", category: "repeat" },
    
    // שאלות הזזת מילים ליצירת משפט (sentence-scramble) - רק מילים שלמדו
    { id: 80, text: "ארגן את המילים ליצירת משפט: I / see / a / cat", options: ["I see a cat", "see I a cat", "cat a see I", "I cat see a"], correct: 0, explanation: "המשפט הנכון: I see a cat", category: "sentence-scramble" },
    { id: 81, text: "ארגן את המילים ליצירת משפט: This / is / a / dog", options: ["This is a dog", "is This a dog", "dog a is This", "This dog is a"], correct: 0, explanation: "המשפט הנכון: This is a dog", category: "sentence-scramble" },
    { id: 82, text: "ארגן את המילים ליצירת משפט: I / like / fish", options: ["I like fish", "like I fish", "fish like I", "I fish like"], correct: 0, explanation: "המשפט הנכון: I like fish", category: "sentence-scramble" },
    { id: 83, text: "ארגן את המילים ליצירת משפט: The / bird / is / red", options: ["The bird is red", "bird The is red", "red is bird The", "The red is bird"], correct: 0, explanation: "המשפט הנכון: The bird is red", category: "sentence-scramble" },
    { id: 84, text: "ארגן את המילים ליצירת משפט: I / have / one", options: ["I have one", "have I one", "one have I", "I one have"], correct: 0, explanation: "המשפט הנכון: I have one", category: "sentence-scramble" },
    { id: 85, text: "ארגן את המילים ליצירת משפט: I / see / two", options: ["I see two", "see I two", "two see I", "I two see"], correct: 0, explanation: "המשפט הנכון: I see two", category: "sentence-scramble" },
    
    // שאלות השלמת משפטים (fill-blanks) - רק מילים שלמדו
    { id: 86, text: "השלם: I see a ___", options: ["cat", "see", "I", "a"], correct: 0, explanation: "I see a cat - אני רואה חתול", category: "fill-blanks" },
    { id: 87, text: "השלם: This is a ___", options: ["dog", "this", "is", "a"], correct: 0, explanation: "This is a dog - זה כלב", category: "fill-blanks" },
    { id: 88, text: "השלם: I like ___", options: ["fish", "I", "like", "the"], correct: 0, explanation: "I like fish - אני אוהב דג", category: "fill-blanks" },
    { id: 89, text: "השלם: The bird is ___", options: ["red", "the", "bird", "is"], correct: 0, explanation: "The bird is red - הציפור אדומה", category: "fill-blanks" },
    { id: 90, text: "השלם: I have ___", options: ["one", "I", "have", "two"], correct: 0, explanation: "I have one - יש לי אחד", category: "fill-blanks" },
    { id: 91, text: "השלם: I see ___", options: ["two", "I", "see", "one"], correct: 0, explanation: "I see two - אני רואה שניים", category: "fill-blanks" },
    
    // שאלות נכון או לא נכון (true-false) - רק מילים שלמדו
    { id: 92, text: "נכון או לא נכון: I see a cat", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - I see a cat זה משפט תקין", category: "true-false" },
    { id: 93, text: "נכון או לא נכון: This is a dog", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - This is a dog זה משפט תקין", category: "true-false" },
    { id: 94, text: "נכון או לא נכון: I like fish", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - I like fish זה משפט תקין", category: "true-false" },
    { id: 95, text: "נכון או לא נכון: The bird is red", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - The bird is red זה משפט תקין", category: "true-false" },
    { id: 96, text: "נכון או לא נכון: cat see I a", options: ["נכון", "לא נכון"], correct: 1, explanation: "לא נכון - הסדר הנכון הוא: I see a cat", category: "true-false" },
    { id: 97, text: "נכון או לא נכון: dog is This a", options: ["נכון", "לא נכון"], correct: 1, explanation: "לא נכון - הסדר הנכון הוא: This is a dog", category: "true-false" }
    ],
    '2': [ // רמה 2 - בסיסי - מילים פשוטות + קריאה (60 שאלות)
    // מילים מתקדמות יותר (עירבוב עברית ואנגלית)
    { id: 61, text: "What animal says 'meow'? 🐱", options: ["Dog", "Cat", "Cow", "Bird"], correct: 1, explanation: "חתול אומר מיאו - Cat says 'meow'", category: "vocabulary" },
    { id: 62, text: "What animal barks? 🐶", options: ["Cat", "Dog", "Cow", "Bird"], correct: 1, explanation: "כלב נובח - Dog barks", category: "vocabulary" },
    { id: 63, text: "What color is blood? 🔴", options: ["Blue", "Green", "Red", "Yellow"], correct: 2, explanation: "דם הוא אדום - Blood is red", category: "vocabulary" },
    { id: 64, text: "What color is the ocean? 🌊", options: ["Blue", "Green", "Red", "Yellow"], correct: 0, explanation: "האוקיינוס כחול - The ocean is blue", category: "vocabulary" },
    { id: 65, text: "Which word rhymes with 'cat'?", options: ["Dog", "Hat", "Sun", "Ball"], correct: 1, explanation: "חתול וכובע מתחרזים - Cat and Hat rhyme", category: "sounds" },
    { id: 66, text: "Which word rhymes with 'dog'?", options: ["Cat", "Hat", "Frog", "Ball"], correct: 2, explanation: "כלב וצפרדע מתחרזים - Dog and Frog rhyme", category: "sounds" },
    { id: 67, text: "What is this? ☀️", options: ["Moon", "Sun", "Star", "Cloud"], correct: 1, explanation: "זה השמש - Sun", category: "vocabulary" },
    { id: 68, text: "What do you read? 📖", options: ["Pen", "Book", "Table", "Chair"], correct: 1, explanation: "אתה קורא ספר - You read a book", category: "vocabulary" },
    { id: 69, text: "What do you play with? ⚽", options: ["Doll", "Ball", "Car", "House"], correct: 1, explanation: "אתה משחק עם כדור - You play with a ball", category: "vocabulary" },
    { id: 70, text: "What grows tall? 🌳", options: ["Flower", "Tree", "Grass", "Rock"], correct: 1, explanation: "עץ גדל גבוה - A tree grows tall", category: "vocabulary" },
    
    // בעלי חיים - שאלות יותר מתקדמות
    { id: 71, text: "Which animal can fly?", options: ["Fish", "Bird", "Cow", "Dog"], correct: 1, explanation: "ציפור יכולה לעוף - A bird can fly", category: "vocabulary" },
    { id: 72, text: "Which animal lives in water?", options: ["Cat", "Dog", "Fish", "Bird"], correct: 2, explanation: "דג חי במים - A fish lives in water", category: "vocabulary" },
    { id: 73, text: "Which animal gives us milk?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 2, explanation: "פרה נותנת לנו חלב - A cow gives us milk", category: "vocabulary" },
    { id: 74, text: "Which animal has a long neck?", options: ["Dog", "Cat", "Giraffe", "Bird"], correct: 2, explanation: "ג'ירפה יש צוואר ארוך - A giraffe has a long neck", category: "vocabulary" },
    { id: 75, text: "Which animal is very big?", options: ["Mouse", "Cat", "Elephant", "Bird"], correct: 2, explanation: "פיל הוא גדול מאוד - An elephant is very big", category: "vocabulary" },
    
    // אוכל - שאלות יותר מתקדמות
    { id: 76, text: "What food is made from flour?", options: ["Bread", "Milk", "Egg", "Apple"], correct: 0, explanation: "לחם עשוי מקמח - Bread is made from flour", category: "vocabulary" },
    { id: 77, text: "Which is a vegetable?", options: ["Carrot", "Banana", "Apple", "Orange"], correct: 0, explanation: "גזר הוא ירק - A carrot is a vegetable", category: "vocabulary" },
    { id: 78, text: "Which drink is white?", options: ["Orange juice", "Milk", "Apple juice", "Water"], correct: 1, explanation: "חלב הוא לבן - Milk is white", category: "vocabulary" },
    { id: 79, text: "Which fruit is yellow and long?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 1, explanation: "בננה היא צהובה וארוכה - A banana is yellow and long", category: "vocabulary" },
    { id: 80, text: "What do you drink when you're thirsty?", options: ["Bread", "Water", "Cake", "Meat"], correct: 1, explanation: "אתה שותה מים כשאתה צמא - You drink water when you're thirsty", category: "vocabulary" },
    
    // תחבורה - שאלות יותר מתקדמות
    { id: 81, text: "What has four wheels?", options: ["Bicycle", "Car", "Train", "Plane"], correct: 1, explanation: "מכונית יש לה ארבעה גלגלים - A car has four wheels", category: "vocabulary" },
    { id: 82, text: "What flies in the sky?", options: ["Car", "Bus", "Plane", "Bicycle"], correct: 2, explanation: "מטוס טס בשמיים - A plane flies in the sky", category: "vocabulary" },
    { id: 83, text: "What has two wheels?", options: ["Car", "Bus", "Bicycle", "Train"], correct: 2, explanation: "אופניים יש להם שני גלגלים - A bicycle has two wheels", category: "vocabulary" },
    { id: 84, text: "What goes on rails?", options: ["Car", "Bus", "Bicycle", "Train"], correct: 3, explanation: "רכבת נוסעת על פסים - A train goes on rails", category: "vocabulary" },
    { id: 85, text: "What carries many people?", options: ["Car", "Bus", "Bicycle", "Motorcycle"], correct: 1, explanation: "אוטובוס נושא הרבה אנשים - A bus carries many people", category: "vocabulary" },
    
    // בגדים - שאלות יותר מתקדמות
    { id: 86, text: "What do you wear on your head?", options: ["Hat", "Shoes", "Pants", "Shirt"], correct: 0, explanation: "אתה לובש כובע על הראש - You wear a hat on your head", category: "vocabulary" },
    { id: 87, text: "What do you wear on your feet?", options: ["Hat", "Shoes", "Pants", "Shirt"], correct: 1, explanation: "אתה לובש נעליים על הרגליים - You wear shoes on your feet", category: "vocabulary" },
    { id: 88, text: "What do you wear when it's cold?", options: ["Swimsuit", "Coat", "Shorts", "Sandals"], correct: 1, explanation: "אתה לובש מעיל כש קר - You wear a coat when it's cold", category: "vocabulary" },
    { id: 89, text: "What do you wear to bed?", options: ["Suit", "Pajamas", "Dress", "Uniform"], correct: 1, explanation: "אתה לובש פיג'מה לישון - You wear pajamas to bed", category: "vocabulary" },
    { id: 90, text: "What do you wear to school?", options: ["Pajamas", "Uniform", "Swimsuit", "Coat"], correct: 1, explanation: "אתה לובש מדים לבית הספר - You wear a uniform to school", category: "vocabulary" },
    
    // בית - שאלות יותר מתקדמות
    { id: 91, text: "Where do you wash your hands?", options: ["Kitchen", "Bathroom", "Bedroom", "Garden"], correct: 1, explanation: "אתה רוחץ ידיים בחדר האמבטיה - You wash your hands in the bathroom", category: "vocabulary" },
    { id: 92, text: "Where do you eat?", options: ["Bathroom", "Kitchen", "Bedroom", "Garden"], correct: 1, explanation: "אתה אוכל במטבח - You eat in the kitchen", category: "vocabulary" },
    { id: 93, text: "Where do you brush your teeth?", options: ["Kitchen", "Bathroom", "Bedroom", "Garden"], correct: 1, explanation: "אתה מצחצח שיניים בחדר האמבטיה - You brush your teeth in the bathroom", category: "vocabulary" },
    
    // בית ספר - שאלות יותר מתקדמות
    { id: 94, text: "What do you write on?", options: ["Pencil", "Paper", "Book", "Table"], correct: 1, explanation: "אתה כותב על נייר - You write on paper", category: "vocabulary" },
    { id: 95, text: "What tells you the time?", options: ["Book", "Pencil", "Clock", "Chair"], correct: 2, explanation: "שעון אומר לך את השעה - A clock tells you the time", category: "vocabulary" },
    { id: 96, text: "What do you use to cut paper?", options: ["Pencil", "Scissors", "Book", "Chair"], correct: 1, explanation: "אתה משתמש במספריים כדי לחתוך נייר - You use scissors to cut paper", category: "vocabulary" },
    { id: 97, text: "What do you use to draw?", options: ["Scissors", "Crayon", "Book", "Chair"], correct: 1, explanation: "אתה משתמש בצבע כדי לצייר - You use a crayon to draw", category: "vocabulary" },
    
    // מספרים - שאלות יותר מתקדמות
    { id: 98, text: "How many fingers do you have?", options: ["Five", "Ten", "Fifteen", "Twenty"], correct: 1, explanation: "יש לך עשר אצבעות - You have ten fingers", category: "vocabulary" },
    { id: 99, text: "How many days in a week?", options: ["Five", "Six", "Seven", "Eight"], correct: 2, explanation: "יש שבעה ימים בשבוע - There are seven days in a week", category: "vocabulary" },
    
    // פעלים - שאלות יותר מתקדמות
    { id: 100, text: "What do you do with a pencil?", options: ["Eat", "Write", "Drink", "Fly"], correct: 1, explanation: "אתה כותב עם עיפרון - You write with a pencil", category: "vocabulary" },
    { id: 101, text: "What do you do with scissors?", options: ["Eat", "Write", "Cut", "Fly"], correct: 2, explanation: "אתה חותך עם מספריים - You cut with scissors", category: "vocabulary" },
    { id: 102, text: "What do you do with a ball?", options: ["Eat", "Write", "Play", "Sleep"], correct: 2, explanation: "אתה משחק עם כדור - You play with a ball", category: "vocabulary" },
    { id: 103, text: "What do you do in bed?", options: ["Eat", "Write", "Play", "Sleep"], correct: 3, explanation: "אתה ישן במיטה - You sleep in bed", category: "vocabulary" },
    { id: 104, text: "What do you do with a book?", options: ["Eat", "Read", "Cut", "Sleep"], correct: 1, explanation: "אתה קורא ספר - You read a book", category: "vocabulary" },
    
    // שאלות אנגלית מתקדמות יותר לכיתה ב'
    { id: 105, text: "Complete: I ___ happy", options: ["am", "is", "are", "be"], correct: 0, explanation: "אני שמח - I am happy", category: "grammar" },
    { id: 106, text: "Complete: She ___ tall", options: ["am", "is", "are", "be"], correct: 1, explanation: "היא גבוהה - She is tall", category: "grammar" },
    { id: 107, text: "Complete: They ___ playing", options: ["am", "is", "are", "be"], correct: 2, explanation: "הם משחקים - They are playing", category: "grammar" },
    { id: 108, text: "What is the opposite of 'big'?", options: ["Large", "Small", "Huge", "Giant"], correct: 1, explanation: "ההפך מ'גדול' הוא 'קטן' - The opposite of 'big' is 'small'", category: "vocabulary" },
    { id: 109, text: "What is the opposite of 'hot'?", options: ["Warm", "Cold", "Cool", "Fire"], correct: 1, explanation: "ההפך מ'חם' הוא 'קר' - The opposite of 'hot' is 'cold'", category: "vocabulary" },
    { id: 110, text: "True or False: A cat can fly", options: ["True", "False"], correct: 1, explanation: "שקר - חתול לא יכול לעוף - False - A cat cannot fly", category: "true_false" },
    { id: 111, text: "True or False: The sun is yellow", options: ["True", "False"], correct: 0, explanation: "נכון - השמש צהובה - True - The sun is yellow", category: "true_false" },
    { id: 112, text: "True or False: Fish can swim", options: ["True", "False"], correct: 0, explanation: "נכון - דגים יכולים לשחות - True - Fish can swim", category: "true_false" },
    { id: 113, text: "What do you call a baby dog?", options: ["Puppy", "Kitten", "Chick", "Cub"], correct: 0, explanation: "גור כלב נקרא puppy - A baby dog is called a puppy", category: "vocabulary" },
    { id: 114, text: "What do you call a baby cat?", options: ["Puppy", "Kitten", "Chick", "Cub"], correct: 1, explanation: "גור חתול נקרא kitten - A baby cat is called a kitten", category: "vocabulary" },
    { id: 115, text: "Which is bigger: elephant or mouse?", options: ["Elephant", "Mouse", "Same size", "Don't know"], correct: 0, explanation: "פיל הרבה יותר גדול מעכבר - Elephant is much bigger than mouse", category: "comparison" },
    { id: 116, text: "Which is smaller: bird or airplane?", options: ["Bird", "Airplane", "Same size", "Don't know"], correct: 0, explanation: "ציפור קטנה יותר ממטוס - Bird is smaller than airplane", category: "comparison" },
    { id: 117, text: "How do you say 'שלום' in English?", options: ["Goodbye", "Hello", "Thank you", "Please"], correct: 1, explanation: "'שלום' פירושו 'Hello' באנגלית - 'שלום' means 'Hello' in English", category: "translation" },
    { id: 118, text: "How do you say 'תודה' in English?", options: ["Goodbye", "Hello", "Thank you", "Please"], correct: 2, explanation: "'תודה' פירושו 'Thank you' באנגלית - 'תודה' means 'Thank you' in English", category: "translation" },
    { id: 119, text: "What comes after Monday?", options: ["Sunday", "Tuesday", "Wednesday", "Thursday"], correct: 1, explanation: "יום שלישי בא אחרי יום שני - Tuesday comes after Monday", category: "days" },
    { id: 120, text: "What comes after Wednesday?", options: ["Monday", "Tuesday", "Thursday", "Friday"], correct: 2, explanation: "יום חמישי בא אחרי יום רביעי - Thursday comes after Wednesday", category: "days" },
    { id: 121, text: "Which season comes after winter?", options: ["Summer", "Spring", "Fall", "Rain"], correct: 1, explanation: "אביב בא אחרי החורף - Spring comes after winter", category: "seasons" },
    { id: 122, text: "Which season comes after spring?", options: ["Winter", "Summer", "Fall", "Rain"], correct: 1, explanation: "קיץ בא אחרי האביב - Summer comes after spring", category: "seasons" },
    { id: 123, text: "What do you wear on your head in winter?", options: ["Hat", "Shoes", "Gloves", "Shorts"], correct: 0, explanation: "אתה לובש כובע על הראש בחורף - You wear a hat on your head in winter", category: "vocabulary" },
    { id: 124, text: "What do you wear on your hands in winter?", options: ["Hat", "Shoes", "Gloves", "Shorts"], correct: 2, explanation: "אתה לובש כפפות על הידיים בחורף - You wear gloves on your hands in winter", category: "vocabulary" },
    
    // שאלות חזרה - הקריין אומר משפט והתלמיד חוזר (משפטים לפי המילים של רמה 2)
    { id: 125, text: "🔊 חזור אחרי הקריין: I am happy", options: [], correct: 0, explanation: "'I am happy' - אני שמח", category: "repeat" },
    { id: 126, text: "🔊 חזור אחרי הקריין: She is tall", options: [], correct: 0, explanation: "'She is tall' - היא גבוהה", category: "repeat" },
    { id: 127, text: "🔊 חזור אחרי הקריין: I write with a pencil", options: [], correct: 0, explanation: "'I write with a pencil' - אני כותב עם עיפרון", category: "repeat" },
    { id: 128, text: "🔊 חזור אחרי הקריין: I play with a ball", options: [], correct: 0, explanation: "'I play with a ball' - אני משחק עם כדור", category: "repeat" },
    { id: 129, text: "🔊 חזור אחרי הקריין: I sleep in bed", options: [], correct: 0, explanation: "'I sleep in bed' - אני ישן במיטה", category: "repeat" },
    { id: 130, text: "🔊 חזור אחרי הקריין: The car has four wheels", options: [], correct: 0, explanation: "'The car has four wheels' - למכונית יש ארבעה גלגלים", category: "repeat" },
    { id: 131, text: "🔊 חזור אחרי הקריין: I wear a hat", options: [], correct: 0, explanation: "'I wear a hat' - אני לובש כובע", category: "repeat" },
    { id: 132, text: "🔊 חזור אחרי הקריין: I eat in the kitchen", options: [], correct: 0, explanation: "'I eat in the kitchen' - אני אוכל במטבח", category: "repeat" },
    
    // שאלות הזזת מילים ליצירת משפט (sentence-scramble) - רק מילים של רמה 2
    { id: 133, text: "ארגן את המילים ליצירת משפט: I / am / happy", options: ["I am happy", "am I happy", "happy am I", "I happy am"], correct: 0, explanation: "המשפט הנכון: I am happy", category: "sentence-scramble" },
    { id: 134, text: "ארגן את המילים ליצירת משפט: She / is / tall", options: ["She is tall", "is She tall", "tall is She", "She tall is"], correct: 0, explanation: "המשפט הנכון: She is tall", category: "sentence-scramble" },
    { id: 135, text: "ארגן את המילים ליצירת משפט: I / write / with / a / pencil", options: ["I write with a pencil", "write I with a pencil", "pencil a with write I", "I pencil write with a"], correct: 0, explanation: "המשפט הנכון: I write with a pencil", category: "sentence-scramble" },
    { id: 136, text: "ארגן את המילים ליצירת משפט: I / play / with / a / ball", options: ["I play with a ball", "play I with a ball", "ball a with play I", "I ball play with a"], correct: 0, explanation: "המשפט הנכון: I play with a ball", category: "sentence-scramble" },
    { id: 137, text: "ארגן את המילים ליצירת משפט: The / car / has / four / wheels", options: ["The car has four wheels", "car The has four wheels", "wheels four has car The", "The wheels has car four"], correct: 0, explanation: "המשפט הנכון: The car has four wheels", category: "sentence-scramble" },
    
    // שאלות השלמת משפטים (fill-blanks) - רק מילים של רמה 2
    { id: 138, text: "השלם: I ___ happy", options: ["am", "is", "are", "be"], correct: 0, explanation: "I am happy - אני שמח", category: "fill-blanks" },
    { id: 139, text: "השלם: She ___ tall", options: ["am", "is", "are", "be"], correct: 1, explanation: "She is tall - היא גבוהה", category: "fill-blanks" },
    { id: 140, text: "השלם: I write with a ___", options: ["pencil", "I", "write", "with"], correct: 0, explanation: "I write with a pencil - אני כותב עם עיפרון", category: "fill-blanks" },
    { id: 141, text: "השלם: I play with a ___", options: ["ball", "I", "play", "with"], correct: 0, explanation: "I play with a ball - אני משחק עם כדור", category: "fill-blanks" },
    { id: 142, text: "השלם: I sleep in ___", options: ["bed", "I", "sleep", "in"], correct: 0, explanation: "I sleep in bed - אני ישן במיטה", category: "fill-blanks" },
    { id: 143, text: "השלם: The car has four ___", options: ["wheels", "the", "car", "has"], correct: 0, explanation: "The car has four wheels - למכונית יש ארבעה גלגלים", category: "fill-blanks" },
    
    // שאלות נכון או לא נכון (true-false) - רק מילים של רמה 2
    { id: 144, text: "נכון או לא נכון: I am happy", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - I am happy זה משפט תקין", category: "true-false" },
    { id: 145, text: "נכון או לא נכון: She is tall", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - She is tall זה משפט תקין", category: "true-false" },
    { id: 146, text: "נכון או לא נכון: I write with a pencil", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - I write with a pencil זה משפט תקין", category: "true-false" },
    { id: 147, text: "נכון או לא נכון: A cat can fly", options: ["נכון", "לא נכון"], correct: 1, explanation: "לא נכון - חתול לא יכול לעוף", category: "true-false" },
    { id: 148, text: "נכון או לא נכון: happy am I", options: ["נכון", "לא נכון"], correct: 1, explanation: "לא נכון - הסדר הנכון הוא: I am happy", category: "true-false" },
    { id: 149, text: "נכון או לא נכון: tall is She", options: ["נכון", "לא נכון"], correct: 1, explanation: "לא נכון - הסדר הנכון הוא: She is tall", category: "true-false" }
    ],
    '3': [ // רמה 3 - בינוני - משפחה, מזג אוויר, דקדוק בסיסי (60 שאלות)
    // משפחה - שאלות יותר מתקדמות
    { id: 125, text: "Who is your mother's mother?", options: ["Aunt", "Grandmother", "Sister", "Cousin"], correct: 1, explanation: "האם של אמא שלך היא הסבתא שלך", category: "family" },
    { id: 126, text: "Who is your father's son?", options: ["Brother", "Uncle", "Cousin", "Nephew"], correct: 0, explanation: "הבן של אבא שלך הוא האח שלך", category: "family" },
    { id: 127, text: "Who is your uncle's daughter?", options: ["Sister", "Cousin", "Aunt", "Niece"], correct: 1, explanation: "הבת של הדוד שלך היא בת הדודה שלך", category: "family" },
    { id: 128, text: "Who is your brother's wife?", options: ["Aunt", "Sister", "Sister-in-law", "Mother"], correct: 2, explanation: "האישה של האח שלך היא הגיסה שלך", category: "family" },
    { id: 129, text: "Who is your mother's brother?", options: ["Uncle", "Cousin", "Nephew", "Father"], correct: 0, explanation: "האח של אמא שלך הוא הדוד שלך", category: "family" },
    { id: 130, text: "Who is your parents' daughter?", options: ["Sister", "Aunt", "Cousin", "Niece"], correct: 0, explanation: "הבת של ההורים שלך היא האחות שלך", category: "family" },
    { id: 131, text: "Who is your uncle's son?", options: ["Brother", "Cousin", "Nephew", "Son"], correct: 1, explanation: "הבן של הדוד שלך הוא בן הדוד שלך", category: "family" },
    { id: 132, text: "Who is your father's brother?", options: ["Uncle", "Cousin", "Nephew", "Grandfather"], correct: 0, explanation: "האח של אבא שלך הוא הדוד שלך", category: "family" },
    { id: 133, text: "Who is your mother's sister?", options: ["Uncle", "Aunt", "Cousin", "Grandmother"], correct: 1, explanation: "האחות של אמא שלך היא הדודה שלך", category: "family" },
    { id: 134, text: "Who is your brother's son?", options: ["Nephew", "Cousin", "Uncle", "Son"], correct: 0, explanation: "הבן של האח שלך הוא האחיין שלך", category: "family" },
    { id: 135, text: "Who is your sister's daughter?", options: ["Nephew", "Niece", "Cousin", "Daughter"], correct: 1, explanation: "הבת של האחות שלך היא האחיינית שלך", category: "family" },
    
    // מזג אוויר - שאלות יותר מתקדמות
    { id: 136, text: "What falls from the sky in winter?", options: ["Rain", "Snow", "Sunshine", "Wind"], correct: 1, explanation: "Snow falls from the sky in winter", category: "weather" },
    { id: 137, text: "What makes everything wet?", options: ["Wind", "Snow", "Rain", "Sunshine"], correct: 2, explanation: "Rain makes everything wet", category: "weather" },
    { id: 138, text: "What makes trees move?", options: ["Rain", "Snow", "Wind", "Sunshine"], correct: 2, explanation: "Wind makes trees move", category: "weather" },
    { id: 139, text: "What makes you warm?", options: ["Rain", "Snow", "Wind", "Sunshine"], correct: 3, explanation: "Sunshine makes you warm", category: "weather" },
    { id: 140, text: "What season comes after winter?", options: ["Summer", "Spring", "Fall", "Rain"], correct: 1, explanation: "Spring comes after winter", category: "weather" },
    { id: 141, text: "What season comes after summer?", options: ["Winter", "Spring", "Fall", "Rain"], correct: 2, explanation: "Fall comes after summer", category: "weather" },
    { id: 142, text: "When is it very hot?", options: ["Winter", "Spring", "Summer", "Fall"], correct: 2, explanation: "חם מאוד בקיץ", category: "weather" },
    { id: 143, text: "When is it very cold?", options: ["Winter", "Spring", "Summer", "Fall"], correct: 0, explanation: "קר מאוד בחורף", category: "weather" },
    { id: 144, text: "When do flowers bloom?", options: ["Winter", "Spring", "Summer", "Fall"], correct: 1, explanation: "Flowers bloom in spring", category: "weather" },
    { id: 145, text: "When do leaves fall?", options: ["Winter", "Spring", "Summer", "Fall"], correct: 3, explanation: "Leaves fall in fall", category: "weather" },
    
    // דקדוק בסיסי - שאלות יותר מתקדמות
    { id: 146, text: "Which is correct: 'I ___ happy'?", options: ["am", "is", "are", "be"], correct: 0, explanation: "I am happy", category: "grammar" },
    { id: 147, text: "Which is correct: 'She ___ a book'?", options: ["read", "reads", "reading", "readed"], correct: 1, explanation: "She reads a book", category: "grammar" },
    { id: 148, text: "Which is correct: 'They ___ playing'?", options: ["am", "is", "are", "be"], correct: 2, explanation: "הם משחקים (הווה מתמשך, רבים)", category: "grammar" },
    { id: 149, text: "Which is correct: 'He ___ to school'?", options: ["go", "goes", "going", "goed"], correct: 1, explanation: "He goes to school", category: "grammar" },
    { id: 150, text: "Which is correct: 'We ___ friends'?", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו חברים (הווה פשוט, רבים)", category: "grammar" },
    { id: 151, text: "Which is correct: 'He ___ tall'?", options: ["am", "is", "are", "be"], correct: 1, explanation: "הוא גבוה (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 152, text: "Which is correct: 'We ___ students'?", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו תלמידים (הווה פשוט, רבים)", category: "grammar" },
    { id: 153, text: "Which is correct: 'You ___ nice'?", options: ["am", "is", "are", "be"], correct: 2, explanation: "אתה נחמד (הווה פשוט)", category: "grammar" },
    { id: 154, text: "Which is correct: 'It ___ cold'?", options: ["am", "is", "are", "be"], correct: 1, explanation: "זה קר (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 155, text: "Which is correct: 'She ___ a doctor'?", options: ["am", "is", "are", "be"], correct: 1, explanation: "היא רופאה (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 156, text: "Which is correct: 'The cat ___ small'?", options: ["am", "is", "are", "be"], correct: 1, explanation: "החתול קטן (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    
    // אוצר מילים - הפכים - שאלות יותר מתקדמות
    { id: 157, text: "What is the opposite of 'big'?", options: ["Large", "Small", "Huge", "Giant"], correct: 1, explanation: "ההפך מ-'big' הוא 'small'", category: "vocabulary" },
    { id: 158, text: "What is the opposite of 'hot'?", options: ["Warm", "Cold", "Cool", "Fire"], correct: 1, explanation: "ההפך מ-'hot' הוא 'cold'", category: "vocabulary" },
    { id: 159, text: "What is the opposite of 'happy'?", options: ["Sad", "Angry", "Tired", "Hungry"], correct: 0, explanation: "ההפך מ-'happy' הוא 'sad'", category: "vocabulary" },
    { id: 160, text: "What is the opposite of 'fast'?", options: ["Slow", "Quick", "Fast", "Speed"], correct: 0, explanation: "ההפך מ-'fast' הוא 'slow'", category: "vocabulary" },
    { id: 161, text: "What is the opposite of 'old'?", options: ["New", "Young", "Fresh", "Modern"], correct: 1, explanation: "The opposite of 'old' is 'young'", category: "vocabulary" },
    { id: 162, text: "What is the opposite of 'tall'?", options: ["Big", "Short", "Long", "Wide"], correct: 1, explanation: "The opposite of 'tall' is 'short'", category: "vocabulary" },
    { id: 163, text: "What is the opposite of 'good'?", options: ["Great", "Bad", "Nice", "Kind"], correct: 1, explanation: "The opposite of 'good' is 'bad'", category: "vocabulary" },
    { id: 164, text: "What is the opposite of 'clean'?", options: ["Dirty", "Fresh", "New", "Pure"], correct: 0, explanation: "The opposite of 'clean' is 'dirty'", category: "vocabulary" },
    { id: 165, text: "What is the opposite of 'full'?", options: ["Empty", "Complete", "Whole", "Total"], correct: 0, explanation: "The opposite of 'full' is 'empty'", category: "vocabulary" },
    { id: 166, text: "What is the opposite of 'easy'?", options: ["Simple", "Hard", "Difficult", "Tough"], correct: 1, explanation: "The opposite of 'easy' is 'hard'", category: "vocabulary" },
    { id: 167, text: "What is the opposite of 'day'?", options: ["Morning", "Night", "Afternoon", "Evening"], correct: 1, explanation: "The opposite of 'day' is 'night'", category: "vocabulary" },
    
    // מקצועות - שאלות יותר מתקדמות
    { id: 168, text: "What do you call a person who teaches?", options: ["Student", "Teacher", "Doctor", "Driver"], correct: 1, explanation: "A person who teaches is called a teacher", category: "professions" },
    { id: 169, text: "What do you call a person who helps sick people?", options: ["Teacher", "Doctor", "Driver", "Cook"], correct: 1, explanation: "A person who helps sick people is called a doctor", category: "professions" },
    { id: 170, text: "What do you call a person who drives a car?", options: ["Teacher", "Doctor", "Driver", "Cook"], correct: 2, explanation: "A person who drives a car is called a driver", category: "professions" },
    { id: 171, text: "What do you call a person who cooks food?", options: ["Teacher", "Doctor", "Driver", "Cook"], correct: 3, explanation: "A person who cooks food is called a cook", category: "professions" },
    { id: 172, text: "What do you call a person who fixes cars?", options: ["Teacher", "Doctor", "Mechanic", "Cook"], correct: 2, explanation: "A person who fixes cars is called a mechanic", category: "professions" },
    { id: 173, text: "What do you call a person who fixes teeth?", options: ["Doctor", "Dentist", "Teacher", "Cook"], correct: 1, explanation: "A person who fixes teeth is called a dentist", category: "professions" },
    { id: 174, text: "What do you call a person who grows food?", options: ["Doctor", "Farmer", "Teacher", "Cook"], correct: 1, explanation: "A person who grows food is called a farmer", category: "professions" },
    { id: 175, text: "What do you call a person who helps animals?", options: ["Doctor", "Vet", "Teacher", "Cook"], correct: 1, explanation: "A person who helps animals is called a vet", category: "professions" },
    { id: 176, text: "What do you call a person who builds houses?", options: ["Doctor", "Builder", "Teacher", "Cook"], correct: 1, explanation: "A person who builds houses is called a builder", category: "professions" },
    { id: 177, text: "What do you call a person who sells things?", options: ["Doctor", "Seller", "Teacher", "Cook"], correct: 1, explanation: "A person who sells things is called a seller", category: "professions" },
    { id: 178, text: "What do you call a person who puts out fires?", options: ["Doctor", "Firefighter", "Teacher", "Cook"], correct: 1, explanation: "A person who puts out fires is called a firefighter", category: "professions" },
    
    // שאלות אנגלית מתקדמות יותר לכיתה ג'
    { id: 179, text: "Complete the sentence: I ___ to school every day", options: ["go", "goes", "going", "went"], correct: 0, explanation: "I go to school every day", category: "sentences" },
    { id: 180, text: "Complete the sentence: She ___ her homework yesterday", options: ["do", "does", "doing", "did"], correct: 3, explanation: "She did her homework yesterday", category: "sentences" },
    { id: 181, text: "Complete the sentence: They ___ playing football now", options: ["am", "is", "are", "be"], correct: 2, explanation: "They are playing football now", category: "sentences" },
    { id: 182, text: "Complete the sentence: He ___ a book last night", options: ["read", "reads", "reading", "readed"], correct: 0, explanation: "He read a book last night", category: "sentences" },
    { id: 183, text: "Complete the sentence: We ___ to the park tomorrow", options: ["go", "goes", "going", "will go"], correct: 3, explanation: "We will go to the park tomorrow", category: "sentences" },
    { id: 184, text: "True or False: Water is wet", options: ["True", "False"], correct: 0, explanation: "True - Water is wet", category: "true_false" },
    { id: 185, text: "True or False: Birds can fly", options: ["True", "False"], correct: 0, explanation: "True - Birds can fly", category: "true_false" },
    { id: 186, text: "True or False: Fish live on land", options: ["True", "False"], correct: 1, explanation: "False - Fish live in water", category: "true_false" },
    { id: 187, text: "What is the past tense of 'eat'?", options: ["eated", "ate", "eaten", "eating"], correct: 1, explanation: "The past tense of 'eat' is 'ate'", category: "grammar" },
    { id: 188, text: "What is the past tense of 'go'?", options: ["goed", "went", "gone", "going"], correct: 1, explanation: "The past tense of 'go' is 'went'", category: "grammar" },
    { id: 189, text: "What is the past tense of 'see'?", options: ["seed", "saw", "seen", "seeing"], correct: 1, explanation: "The past tense of 'see' is 'saw'", category: "grammar" },
    { id: 190, text: "What is the past tense of 'come'?", options: ["comed", "came", "come", "coming"], correct: 1, explanation: "The past tense of 'come' is 'came'", category: "grammar" },
    { id: 191, text: "Which word means 'very big'?", options: ["Small", "Huge", "Little", "Tiny"], correct: 1, explanation: "'Huge' means very big", category: "vocabulary" },
    { id: 192, text: "Which word means 'very small'?", options: ["Huge", "Big", "Tiny", "Large"], correct: 2, explanation: "'Tiny' means very small", category: "vocabulary" },
    { id: 193, text: "Which word means 'very fast'?", options: ["Slow", "Quick", "Rapid", "Both B and C"], correct: 3, explanation: "Both 'Quick' and 'Rapid' mean very fast", category: "vocabulary" },
    { id: 194, text: "What do you call the place where you buy food?", options: ["School", "Hospital", "Shop", "Library"], correct: 2, explanation: "You buy food at a shop", category: "places" },
    { id: 195, text: "What do you call the place where you borrow books?", options: ["School", "Hospital", "Shop", "Library"], correct: 3, explanation: "You borrow books from a library", category: "places" },
    { id: 196, text: "What do you call the place where you see a doctor?", options: ["School", "Hospital", "Shop", "Library"], correct: 1, explanation: "You see a doctor at a hospital", category: "places" },
    { id: 197, text: "What do you call the place where you learn?", options: ["School", "Hospital", "Shop", "Library"], correct: 0, explanation: "You learn at school", category: "places" },
    { id: 198, text: "How do you say 'בבקשה' in English?", options: ["Goodbye", "Hello", "Thank you", "Please"], correct: 3, explanation: "'בבקשה' means 'Please' in English", category: "translation" },
    { id: 199, text: "How do you say 'להתראות' in English?", options: ["Goodbye", "Hello", "Thank you", "Please"], correct: 0, explanation: "'להתראות' means 'Goodbye' in English", category: "translation" },
    { id: 200, text: "What comes before Wednesday?", options: ["Monday", "Tuesday", "Thursday", "Friday"], correct: 1, explanation: "Tuesday comes before Wednesday", category: "days" },
    { id: 201, text: "What comes before Friday?", options: ["Wednesday", "Thursday", "Saturday", "Sunday"], correct: 1, explanation: "Thursday comes before Friday", category: "days" },
    { id: 202, text: "What is the plural of 'cat'?", options: ["cat", "cats", "cates", "caties"], correct: 1, explanation: "The plural of 'cat' is 'cats'", category: "grammar" },
    { id: 203, text: "What is the plural of 'dog'?", options: ["dog", "dogs", "doges", "dogies"], correct: 1, explanation: "The plural of 'dog' is 'dogs'", category: "grammar" },
    { id: 204, text: "What is the plural of 'child'?", options: ["child", "childs", "children", "childes"], correct: 2, explanation: "The plural of 'child' is 'children'", category: "grammar" },
    
    // שאלות חזרה - הקריין אומר משפט והתלמיד חוזר (משפטים לפי המילים של רמה 3)
    { id: 205, text: "🔊 חזור אחרי הקריין: I go to school every day", options: [], correct: 0, explanation: "'I go to school every day' - אני הולך לבית הספר כל יום", category: "repeat" },
    { id: 206, text: "🔊 חזור אחרי הקריין: She reads a book", options: [], correct: 0, explanation: "'She reads a book' - היא קוראת ספר", category: "repeat" },
    { id: 207, text: "🔊 חזור אחרי הקריין: They are playing football", options: [], correct: 0, explanation: "'They are playing football' - הם משחקים כדורגל", category: "repeat" },
    { id: 208, text: "🔊 חזור אחרי הקריין: He is a teacher", options: [], correct: 0, explanation: "'He is a teacher' - הוא מורה", category: "repeat" },
    { id: 209, text: "🔊 חזור אחרי הקריין: We are students", options: [], correct: 0, explanation: "'We are students' - אנחנו תלמידים", category: "repeat" },
    { id: 210, text: "🔊 חזור אחרי הקריין: It is cold in winter", options: [], correct: 0, explanation: "'It is cold in winter' - קר בחורף", category: "repeat" },
    { id: 211, text: "🔊 חזור אחרי הקריין: I see a doctor at the hospital", options: [], correct: 0, explanation: "'I see a doctor at the hospital' - אני רואה רופא בבית החולים", category: "repeat" },
    { id: 212, text: "🔊 חזור אחרי הקריין: She is my grandmother", options: [], correct: 0, explanation: "'She is my grandmother' - היא הסבתא שלי", category: "repeat" },
    
    // שאלות הזזת מילים ליצירת משפט (sentence-scramble) - רק מילים של רמה 3
    { id: 213, text: "ארגן את המילים ליצירת משפט: I / go / to / school / every / day", options: ["I go to school every day", "go I to school every day", "day every school to go I", "I school go to every day"], correct: 0, explanation: "המשפט הנכון: I go to school every day", category: "sentence-scramble" },
    { id: 214, text: "ארגן את המילים ליצירת משפט: She / reads / a / book", options: ["She reads a book", "reads She a book", "book a reads She", "She book reads a"], correct: 0, explanation: "המשפט הנכון: She reads a book", category: "sentence-scramble" },
    { id: 215, text: "ארגן את המילים ליצירת משפט: They / are / playing / football", options: ["They are playing football", "are They playing football", "football playing are They", "They football are playing"], correct: 0, explanation: "המשפט הנכון: They are playing football", category: "sentence-scramble" },
    { id: 216, text: "ארגן את המילים ליצירת משפט: He / is / a / teacher", options: ["He is a teacher", "is He a teacher", "teacher a is He", "He teacher is a"], correct: 0, explanation: "המשפט הנכון: He is a teacher", category: "sentence-scramble" },
    { id: 217, text: "ארגן את המילים ליצירת משפט: It / is / cold / in / winter", options: ["It is cold in winter", "is It cold in winter", "winter in cold is It", "It cold is in winter"], correct: 0, explanation: "המשפט הנכון: It is cold in winter", category: "sentence-scramble" },
    
    // שאלות השלמת משפטים (fill-blanks) - רק מילים של רמה 3
    { id: 218, text: "השלם: I ___ to school every day", options: ["go", "goes", "going", "went"], correct: 0, explanation: "I go to school every day - אני הולך לבית הספר כל יום", category: "fill-blanks" },
    { id: 219, text: "השלם: She ___ a book", options: ["read", "reads", "reading", "readed"], correct: 1, explanation: "She reads a book - היא קוראת ספר", category: "fill-blanks" },
    { id: 220, text: "השלם: They ___ playing football", options: ["am", "is", "are", "be"], correct: 2, explanation: "They are playing football - הם משחקים כדורגל", category: "fill-blanks" },
    { id: 221, text: "השלם: He ___ a teacher", options: ["am", "is", "are", "be"], correct: 1, explanation: "He is a teacher - הוא מורה", category: "fill-blanks" },
    { id: 222, text: "השלם: We ___ students", options: ["am", "is", "are", "be"], correct: 2, explanation: "We are students - אנחנו תלמידים", category: "fill-blanks" },
    { id: 223, text: "השלם: It ___ cold in winter", options: ["am", "is", "are", "be"], correct: 1, explanation: "It is cold in winter - קר בחורף", category: "fill-blanks" },
    
    // שאלות נכון או לא נכון (true-false) - רק מילים של רמה 3
    { id: 224, text: "נכון או לא נכון: I go to school every day", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - I go to school every day זה משפט תקין", category: "true-false" },
    { id: 225, text: "נכון או לא נכון: She reads a book", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - She reads a book זה משפט תקין", category: "true-false" },
    { id: 226, text: "נכון או לא נכון: They are playing football", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - They are playing football זה משפט תקין", category: "true-false" },
    { id: 227, text: "נכון או לא נכון: Fish live on land", options: ["נכון", "לא נכון"], correct: 1, explanation: "לא נכון - דגים חיים במים, לא ביבשה", category: "true-false" },
    { id: 228, text: "נכון או לא נכון: school to go I every day", options: ["נכון", "לא נכון"], correct: 1, explanation: "לא נכון - הסדר הנכון הוא: I go to school every day", category: "true-false" },
    { id: 229, text: "נכון או לא נכון: book a reads She", options: ["נכון", "לא נכון"], correct: 1, explanation: "לא נכון - הסדר הנכון הוא: She reads a book", category: "true-false" }
    ],
    '4': [ // רמה 4 - מתקדם - משפטים, הבנת הנקרא, דקדוק (60 שאלות)
    // השלמת משפטים
    { id: 301, text: "Complete: 'I like to ___ books'", options: ["read", "reading", "reads", "readed"], correct: 0, explanation: "I like to read books", category: "sentences" },
    { id: 302, text: "Complete: 'She is ___ a song'", options: ["sing", "sings", "singing", "sang"], correct: 2, explanation: "She is singing a song", category: "sentences" },
    { id: 303, text: "Complete: 'They ___ to school every day'", options: ["go", "goes", "going", "went"], correct: 0, explanation: "They go to school every day", category: "sentences" },
    { id: 304, text: "Complete: 'He ___ his homework yesterday'", options: ["do", "does", "doing", "did"], correct: 3, explanation: "He did his homework yesterday", category: "sentences" },
    { id: 305, text: "Complete: 'We ___ football tomorrow'", options: ["play", "plays", "playing", "will play"], correct: 3, explanation: "We will play football tomorrow", category: "sentences" },
    { id: 306, text: "Complete: 'I have ___ my breakfast'", options: ["eat", "ate", "eaten", "eating"], correct: 2, explanation: "I have eaten my breakfast", category: "sentences" },
    { id: 307, text: "Complete: 'She ___ English every day'", options: ["study", "studies", "studying", "studied"], correct: 1, explanation: "She studies English every day", category: "sentences" },
    { id: 308, text: "Complete: 'They ___ playing outside'", options: ["am", "is", "are", "be"], correct: 2, explanation: "They are playing outside", category: "sentences" },
    { id: 309, text: "Complete: 'He ___ a book last night'", options: ["read", "reads", "reading", "readed"], correct: 0, explanation: "He read a book last night", category: "sentences" },
    
    // הבנת הנקרא
    { id: 310, text: "What do you do in the morning?", options: ["Sleep", "Wake up", "Eat dinner", "Go to bed"], correct: 1, explanation: "In the morning you wake up", category: "reading" },
    { id: 311, text: "Where do you go to learn?", options: ["Home", "School", "Park", "Shop"], correct: 1, explanation: "You go to school to learn", category: "reading" },
    { id: 312, text: "What do you eat for breakfast?", options: ["Dinner", "Lunch", "Cereal", "Snack"], correct: 2, explanation: "You eat cereal for breakfast", category: "reading" },
    { id: 313, text: "What do you wear on your feet?", options: ["Hat", "Shoes", "Shirt", "Pants"], correct: 1, explanation: "You wear shoes on your feet", category: "reading" },
    { id: 314, text: "What do you use to write?", options: ["Fork", "Pen", "Spoon", "Plate"], correct: 1, explanation: "You use a pen to write", category: "reading" },
    { id: 315, text: "What do you drink when you're thirsty?", options: ["Food", "Water", "Clothes", "Books"], correct: 1, explanation: "You drink water when you're thirsty", category: "reading" },
    { id: 316, text: "What do you do with a book?", options: ["Eat it", "Read it", "Wear it", "Drive it"], correct: 1, explanation: "You read a book", category: "reading" },
    { id: 317, text: "What do you do with a ball?", options: ["Eat it", "Read it", "Play with it", "Write with it"], correct: 2, explanation: "You play with a ball", category: "reading" },
    { id: 318, text: "What do you do when you're tired?", options: ["Run", "Sleep", "Eat", "Study"], correct: 1, explanation: "You sleep when you're tired", category: "reading" },
    { id: 319, text: "What do you do when you're hungry?", options: ["Sleep", "Eat", "Drink", "Read"], correct: 1, explanation: "You eat when you're hungry", category: "reading" },
    
    // דקדוק מתקדם
    { id: 320, text: "Choose the correct article: 'I have ___ apple'", options: ["a", "an", "the", "no article"], correct: 1, explanation: "Use 'an' before words starting with a vowel", category: "grammar" },
    { id: 321, text: "Choose the correct article: 'I have ___ book'", options: ["a", "an", "the", "no article"], correct: 0, explanation: "Use 'a' before words starting with a consonant", category: "grammar" },
    { id: 322, text: "Choose the correct article: '___ sun is bright'", options: ["a", "an", "the", "no article"], correct: 2, explanation: "Use 'the' for specific things like the sun", category: "grammar" },
    { id: 323, text: "Choose the correct pronoun: '___ is my friend'", options: ["He", "She", "It", "They"], correct: 0, explanation: "Use 'He' for a male friend", category: "grammar" },
    { id: 324, text: "Choose the correct pronoun: '___ is my sister'", options: ["He", "She", "It", "They"], correct: 1, explanation: "Use 'She' for a female sister", category: "grammar" },
    { id: 325, text: "Choose the correct pronoun: '___ are my parents'", options: ["He", "She", "It", "They"], correct: 3, explanation: "Use 'They' for plural parents", category: "grammar" },
    { id: 326, text: "Choose the correct possessive: 'This is ___ book'", options: ["I", "my", "me", "mine"], correct: 1, explanation: "Use 'my' to show possession", category: "grammar" },
    { id: 327, text: "Choose the correct possessive: 'This book is ___'", options: ["I", "my", "me", "mine"], correct: 3, explanation: "Use 'mine' at the end of a sentence", category: "grammar" },
    { id: 328, text: "Choose the correct form: 'I ___ happy'", options: ["am", "is", "are", "be"], correct: 0, explanation: "Use 'am' with 'I'", category: "grammar" },
    { id: 329, text: "Choose the correct form: 'You ___ happy'", options: ["am", "is", "are", "be"], correct: 2, explanation: "Use 'are' with 'you'", category: "grammar" },
    
    // אוצר מילים מתקדם
    { id: 330, text: "What is the opposite of 'big'?", options: ["Large", "Huge", "Small", "Giant"], correct: 2, explanation: "The opposite of 'big' is 'small'", category: "vocabulary" },
    { id: 331, text: "What is the opposite of 'hot'?", options: ["Warm", "Cold", "Cool", "Freezing"], correct: 1, explanation: "The opposite of 'hot' is 'cold'", category: "vocabulary" },
    { id: 332, text: "What is the opposite of 'fast'?", options: ["Quick", "Slow", "Rapid", "Speedy"], correct: 1, explanation: "The opposite of 'fast' is 'slow'", category: "vocabulary" },
    { id: 333, text: "What is the opposite of 'happy'?", options: ["Sad", "Joyful", "Excited", "Pleased"], correct: 0, explanation: "The opposite of 'happy' is 'sad'", category: "vocabulary" },
    { id: 334, text: "What is the opposite of 'up'?", options: ["Down", "High", "Top", "Above"], correct: 0, explanation: "The opposite of 'up' is 'down'", category: "vocabulary" },
    { id: 335, text: "What is the opposite of 'in'?", options: ["Out", "Inside", "Within", "Into"], correct: 0, explanation: "The opposite of 'in' is 'out'", category: "vocabulary" },
    { id: 336, text: "What is the opposite of 'yes'?", options: ["No", "Sure", "Maybe", "Okay"], correct: 0, explanation: "The opposite of 'yes' is 'no'", category: "vocabulary" },
    { id: 337, text: "What is the opposite of 'day'?", options: ["Night", "Morning", "Evening", "Afternoon"], correct: 0, explanation: "The opposite of 'day' is 'night'", category: "vocabulary" },
    { id: 338, text: "What is the opposite of 'young'?", options: ["Old", "New", "Fresh", "Modern"], correct: 0, explanation: "The opposite of 'young' is 'old'", category: "vocabulary" },
    { id: 339, text: "What is the opposite of 'good'?", options: ["Bad", "Great", "Excellent", "Wonderful"], correct: 0, explanation: "The opposite of 'good' is 'bad'", category: "vocabulary" },
    
    // משפטים מורכבים
    { id: 340, text: "Complete: 'If it rains, I will ___ home'", options: ["stay", "stays", "staying", "stayed"], correct: 0, explanation: "Use 'stay' after 'will'", category: "complex" },
    { id: 341, text: "Complete: 'When I grow up, I want to be a ___'", options: ["teacher", "teach", "teaching", "taught"], correct: 0, explanation: "Use 'teacher' (noun) after 'be a'", category: "complex" },
    { id: 342, text: "Complete: 'I like ___ because it's fun'", options: ["swim", "swimming", "swims", "swam"], correct: 1, explanation: "Use 'swimming' after 'like'", category: "complex" },
    { id: 343, text: "Complete: 'The book ___ I read was interesting'", options: ["who", "which", "where", "when"], correct: 1, explanation: "Use 'which' for things (book)", category: "complex" },
    { id: 344, text: "Complete: 'The person ___ helped me was kind'", options: ["who", "which", "where", "when"], correct: 0, explanation: "Use 'who' for people", category: "complex" },
    { id: 345, text: "Complete: 'I will go to the park ___ it's sunny'", options: ["if", "when", "because", "but"], correct: 0, explanation: "Use 'if' for conditions", category: "complex" },
    { id: 346, text: "Complete: 'I like apples ___ I don't like oranges'", options: ["and", "but", "or", "so"], correct: 1, explanation: "Use 'but' to show contrast", category: "complex" },
    { id: 347, text: "Complete: 'I was tired, ___ I went to bed'", options: ["and", "but", "or", "so"], correct: 3, explanation: "Use 'so' to show result", category: "complex" },
    { id: 348, text: "Complete: 'I can ___ a bike'", options: ["ride", "rides", "riding", "rode"], correct: 0, explanation: "Use 'ride' after 'can'", category: "complex" },
    { id: 349, text: "Complete: 'I should ___ my homework'", options: ["do", "does", "doing", "did"], correct: 0, explanation: "Use 'do' after 'should'", category: "complex" },
    
    // שאלות חזרה - הקריין אומר משפט והתלמיד חוזר (משפטים לפי המילים של רמה 4)
    { id: 350, text: "🔊 חזור אחרי הקריין: I like to read books", options: [], correct: 0, explanation: "'I like to read books' - אני אוהב לקרוא ספרים", category: "repeat" },
    { id: 351, text: "🔊 חזור אחרי הקריין: She is singing a song", options: [], correct: 0, explanation: "'She is singing a song' - היא שרה שיר", category: "repeat" },
    { id: 352, text: "🔊 חזור אחרי הקריין: They go to school every day", options: [], correct: 0, explanation: "'They go to school every day' - הם הולכים לבית הספר כל יום", category: "repeat" },
    { id: 353, text: "🔊 חזור אחרי הקריין: He did his homework yesterday", options: [], correct: 0, explanation: "'He did his homework yesterday' - הוא עשה את שיעורי הבית אתמול", category: "repeat" },
    { id: 354, text: "🔊 חזור אחרי הקריין: We will play football tomorrow", options: [], correct: 0, explanation: "'We will play football tomorrow' - אנחנו נשחק כדורגל מחר", category: "repeat" },
    { id: 355, text: "🔊 חזור אחרי הקריין: I have eaten my breakfast", options: [], correct: 0, explanation: "'I have eaten my breakfast' - אכלתי את ארוחת הבוקר שלי", category: "repeat" },
    { id: 356, text: "🔊 חזור אחרי הקריין: She studies English every day", options: [], correct: 0, explanation: "'She studies English every day' - היא לומדת אנגלית כל יום", category: "repeat" },
    { id: 357, text: "🔊 חזור אחרי הקריין: They are playing outside", options: [], correct: 0, explanation: "'They are playing outside' - הם משחקים בחוץ", category: "repeat" },
    
    // שאלות הזזת מילים ליצירת משפט (sentence-scramble) - רק מילים של רמה 4
    { id: 358, text: "ארגן את המילים ליצירת משפט: I / like / to / read / books", options: ["I like to read books", "like I to read books", "books read to like I", "I books like to read"], correct: 0, explanation: "המשפט הנכון: I like to read books", category: "sentence-scramble" },
    { id: 359, text: "ארגן את המילים ליצירת משפט: She / is / singing / a / song", options: ["She is singing a song", "is She singing a song", "song a singing is She", "She song is singing a"], correct: 0, explanation: "המשפט הנכון: She is singing a song", category: "sentence-scramble" },
    { id: 360, text: "ארגן את המילים ליצירת משפט: He / did / his / homework / yesterday", options: ["He did his homework yesterday", "did He his homework yesterday", "yesterday homework his did He", "He homework did his yesterday"], correct: 0, explanation: "המשפט הנכון: He did his homework yesterday", category: "sentence-scramble" },
    { id: 361, text: "ארגן את המילים ליצירת משפט: We / will / play / football / tomorrow", options: ["We will play football tomorrow", "will We play football tomorrow", "tomorrow football play will We", "We football will play tomorrow"], correct: 0, explanation: "המשפט הנכון: We will play football tomorrow", category: "sentence-scramble" },
    { id: 362, text: "ארגן את המילים ליצירת משפט: I / have / eaten / my / breakfast", options: ["I have eaten my breakfast", "have I eaten my breakfast", "breakfast my eaten have I", "I breakfast have eaten my"], correct: 0, explanation: "המשפט הנכון: I have eaten my breakfast", category: "sentence-scramble" },
    
    // שאלות השלמת משפטים (fill-blanks) - רק מילים של רמה 4
    { id: 363, text: "השלם: I like to ___ books", options: ["read", "reading", "reads", "readed"], correct: 0, explanation: "I like to read books - אני אוהב לקרוא ספרים", category: "fill-blanks" },
    { id: 364, text: "השלם: She is ___ a song", options: ["sing", "sings", "singing", "sang"], correct: 2, explanation: "She is singing a song - היא שרה שיר", category: "fill-blanks" },
    { id: 365, text: "השלם: He ___ his homework yesterday", options: ["do", "does", "doing", "did"], correct: 3, explanation: "He did his homework yesterday - הוא עשה את שיעורי הבית אתמול", category: "fill-blanks" },
    { id: 366, text: "השלם: We ___ football tomorrow", options: ["play", "plays", "playing", "will play"], correct: 3, explanation: "We will play football tomorrow - אנחנו נשחק כדורגל מחר", category: "fill-blanks" },
    { id: 367, text: "השלם: I have ___ my breakfast", options: ["eat", "ate", "eaten", "eating"], correct: 2, explanation: "I have eaten my breakfast - אכלתי את ארוחת הבוקר שלי", category: "fill-blanks" },
    { id: 368, text: "השלם: She ___ English every day", options: ["study", "studies", "studying", "studied"], correct: 1, explanation: "She studies English every day - היא לומדת אנגלית כל יום", category: "fill-blanks" },
    
    // שאלות נכון או לא נכון (true-false) - רק מילים של רמה 4
    { id: 369, text: "נכון או לא נכון: I like to read books", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - I like to read books זה משפט תקין", category: "true-false" },
    { id: 370, text: "נכון או לא נכון: She is singing a song", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - She is singing a song זה משפט תקין", category: "true-false" },
    { id: 371, text: "נכון או לא נכון: He did his homework yesterday", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - He did his homework yesterday זה משפט תקין", category: "true-false" },
    { id: 372, text: "נכון או לא נכון: books to read like I", options: ["נכון", "לא נכון"], correct: 1, explanation: "לא נכון - הסדר הנכון הוא: I like to read books", category: "true-false" },
    { id: 373, text: "נכון או לא נכון: song a singing is She", options: ["נכון", "לא נכון"], correct: 1, explanation: "לא נכון - הסדר הנכון הוא: She is singing a song", category: "true-false" },
    { id: 374, text: "נכון או לא נכון: We will play football tomorrow", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - We will play football tomorrow זה משפט תקין", category: "true-false" }
    ],
    '5': [ // רמה 5 - מומחה - דקדוק מורכב, הבנת הנקרא מתקדמת (60 שאלות)
    // דקדוק מורכב
    { id: 401, text: "Choose the correct tense: 'I ___ to school yesterday'", options: ["go", "went", "will go", "am going"], correct: 1, explanation: "Use past tense 'went' for yesterday", category: "grammar" },
    { id: 402, text: "Choose the correct tense: 'I ___ to school tomorrow'", options: ["go", "went", "will go", "am going"], correct: 2, explanation: "Use future tense 'will go' for tomorrow", category: "grammar" },
    { id: 403, text: "Choose the correct tense: 'I ___ to school every day'", options: ["go", "went", "will go", "am going"], correct: 0, explanation: "Use present tense 'go' for every day", category: "grammar" },
    { id: 404, text: "Choose the correct tense: 'I ___ to school right now'", options: ["go", "went", "will go", "am going"], correct: 3, explanation: "Use present continuous 'am going' for right now", category: "grammar" },
    { id: 405, text: "Choose the correct form: 'I have ___ this book'", options: ["read", "reads", "reading", "readed"], correct: 0, explanation: "Use past participle 'read' after 'have'", category: "grammar" },
    { id: 406, text: "Choose the correct form: 'I had ___ breakfast'", options: ["eat", "eaten", "ate", "eating"], correct: 1, explanation: "Use past participle 'eaten' after 'had'", category: "grammar" },
    { id: 407, text: "Choose the correct form: 'I will have ___ by 5 PM'", options: ["finish", "finished", "finishing", "finishes"], correct: 1, explanation: "Use past participle 'finished' after 'will have'", category: "grammar" },
    { id: 408, text: "Choose the correct conditional: 'If I ___ time, I will help you'", options: ["have", "had", "will have", "am having"], correct: 0, explanation: "Use present tense 'have' in first conditional", category: "grammar" },
    { id: 409, text: "Choose the correct conditional: 'If I ___ time, I would help you'", options: ["have", "had", "will have", "am having"], correct: 1, explanation: "Use past tense 'had' in second conditional", category: "grammar" },
    { id: 410, text: "Choose the correct modal: 'You ___ study hard to pass'", options: ["must", "can", "will", "should"], correct: 0, explanation: "Use 'must' for strong obligation", category: "grammar" },
    
    // הבנת הנקרא מתקדמת
    { id: 411, text: "What is the main idea of this text: 'Cats are independent animals. They can take care of themselves and don't need constant attention.'", options: ["Cats are dangerous", "Cats are independent", "Cats need help", "Cats are expensive"], correct: 1, explanation: "The main idea is that cats are independent", category: "reading" },
    { id: 412, text: "What can you infer from: 'Sarah forgot her umbrella and it's raining heavily outside'", options: ["Sarah will stay dry", "Sarah will get wet", "Sarah likes rain", "Sarah has another umbrella"], correct: 1, explanation: "You can infer that Sarah will get wet", category: "reading" },
    { id: 413, text: "What is the purpose of this text: 'To make a sandwich, first take two slices of bread...'", options: ["To entertain", "To inform", "To persuade", "To instruct"], correct: 3, explanation: "The purpose is to instruct how to make a sandwich", category: "reading" },
    { id: 414, text: "What is the tone of this text: 'This is absolutely the best movie I've ever seen!'", options: ["Sad", "Excited", "Angry", "Bored"], correct: 1, explanation: "The tone is excited with exclamation marks", category: "reading" },
    { id: 415, text: "What is the setting of this story: 'The old lighthouse stood on the rocky cliff overlooking the stormy sea'", options: ["A city", "A lighthouse by the sea", "A mountain", "A desert"], correct: 1, explanation: "The setting is a lighthouse by the sea", category: "reading" },
    { id: 416, text: "What is the conflict in this story: 'Tom wanted to play football but his parents said he had to do homework first'", options: ["Tom vs. football", "Tom vs. homework", "Tom vs. parents", "Parents vs. homework"], correct: 2, explanation: "The conflict is between Tom and his parents", category: "reading" },
    { id: 417, text: "What is the resolution of this story: 'Tom finished his homework quickly and then went to play football with his friends'", options: ["Tom gave up", "Tom found a compromise", "Tom ignored his parents", "Tom got in trouble"], correct: 1, explanation: "Tom found a compromise by doing homework first", category: "reading" },
    { id: 418, text: "What is the theme of this story: 'Even though it was difficult, Maria never gave up on her dream of becoming a doctor'", options: ["Dreams are impossible", "Persistence pays off", "Doctors are important", "Life is easy"], correct: 1, explanation: "The theme is that persistence pays off", category: "reading" },
    { id: 419, text: "What is the author's opinion in: 'In my opinion, reading is the most important skill a person can develop'", options: ["Reading is unimportant", "Reading is very important", "Reading is difficult", "Reading is boring"], correct: 1, explanation: "The author thinks reading is very important", category: "reading" },
    { id: 420, text: "What is the conclusion of this argument: 'Studies show that exercise improves health. Therefore, everyone should exercise regularly'", options: ["Exercise is bad", "Exercise is good", "Exercise is optional", "Exercise is expensive"], correct: 1, explanation: "The conclusion is that exercise is good", category: "reading" },
    
    // אוצר מילים מתקדם
    { id: 421, text: "What does 'enormous' mean?", options: ["Very small", "Very large", "Very fast", "Very slow"], correct: 1, explanation: "המילה 'Enormous' פירושה 'ענק, מאוד גדול'", category: "vocabulary" },
    { id: 422, text: "What does 'minute' mean?", options: ["Very large", "Very small", "Very fast", "Very slow"], correct: 1, explanation: "המילה 'Minute' פירושה 'קטן מאוד, זעיר'", category: "vocabulary" },
    { id: 423, text: "What does 'rapid' mean?", options: ["Very slow", "Very fast", "Very large", "Very small"], correct: 1, explanation: "המילה 'Rapid' פירושה 'מהיר מאוד'", category: "vocabulary" },
    { id: 424, text: "What does 'ancient' mean?", options: ["Very new", "Very old", "Very big", "Very small"], correct: 1, explanation: "המילה 'Ancient' פירושה 'עתיק מאוד'", category: "vocabulary" },
    { id: 425, text: "What does 'modern' mean?", options: ["Very old", "Very new", "Very big", "Very small"], correct: 1, explanation: "המילה 'Modern' פירושה 'מודרני, חדש מאוד'", category: "vocabulary" },
    { id: 426, text: "What does 'brilliant' mean?", options: ["Very stupid", "Very smart", "Very slow", "Very fast"], correct: 1, explanation: "המילה 'Brilliant' פירושה 'מבריק, חכם מאוד'", category: "vocabulary" },
    { id: 427, text: "What does 'furious' mean?", options: ["Very happy", "Very angry", "Very sad", "Very tired"], correct: 1, explanation: "המילה 'Furious' פירושה 'זועם, כועס מאוד'", category: "vocabulary" },
    { id: 428, text: "What does 'thrilled' mean?", options: ["Very sad", "Very excited", "Very angry", "Very tired"], correct: 1, explanation: "המילה 'Thrilled' פירושה 'נרגש מאוד'", category: "vocabulary" },
    { id: 429, text: "What does 'exhausted' mean?", options: ["Very energetic", "Very tired", "Very happy", "Very angry"], correct: 1, explanation: "המילה 'Exhausted' פירושה 'מותש, עייף מאוד'", category: "vocabulary" },
    { id: 430, text: "What does 'magnificent' mean?", options: ["Very ugly", "Very beautiful", "Very small", "Very fast"], correct: 1, explanation: "המילה 'Magnificent' פירושה 'מפואר, יפה מאוד'", category: "vocabulary" },
    
    // משפטים מורכבים
    { id: 431, text: "Complete: 'Although it was raining, ___'", options: ["we stayed inside", "we went outside", "we got wet", "we forgot our umbrellas"], correct: 0, explanation: "Although shows contrast, so we stayed inside", category: "complex" },
    { id: 432, text: "Complete: 'Since it's late, ___'", options: ["we should stay", "we should go home", "we should eat", "we should play"], correct: 1, explanation: "Since shows reason, so we should go home", category: "complex" },
    { id: 433, text: "Complete: 'Unless you study, ___'", options: ["you will pass", "you will fail", "you will succeed", "you will win"], correct: 1, explanation: "'Unless' פירושו 'אם לא', אז תכשל", category: "complex" },
    { id: 434, text: "Complete: 'While I was reading, ___'", options: ["I was sleeping", "I was eating", "I was listening to music", "I was studying"], correct: 2, explanation: "While shows simultaneous action", category: "complex" },
    { id: 435, text: "Complete: 'Before you leave, ___'", options: ["you should arrive", "you should go", "you should say goodbye", "you should come"], correct: 2, explanation: "Before shows sequence, so say goodbye first", category: "complex" },
    { id: 436, text: "Complete: 'After I finish, ___'", options: ["I will start", "I will begin", "I will continue", "I will stop"], correct: 3, explanation: "After shows sequence, so I will stop", category: "complex" },
    { id: 437, text: "Complete: 'Because it's hot, ___'", options: ["we should wear coats", "we should turn on the heater", "we should turn on the fan", "we should light a fire"], correct: 2, explanation: "Because shows reason, so turn on the fan", category: "complex" },
    { id: 438, text: "Complete: 'In order to succeed, ___'", options: ["you should give up", "you should work hard", "you should be lazy", "you should quit"], correct: 1, explanation: "In order to shows purpose, so work hard", category: "complex" },
    { id: 439, text: "Complete: 'As soon as I arrive, ___'", options: ["I will leave", "I will call you", "I will forget", "I will disappear"], correct: 1, explanation: "As soon as shows immediate action", category: "complex" },
    { id: 440, text: "Complete: 'Even though it's difficult, ___'", options: ["I will give up", "I will try", "I will quit", "I will stop"], correct: 1, explanation: "Even though shows contrast, so I will try", category: "complex" },
    
    // שאלות חזרה - הקריין אומר משפט והתלמיד חוזר (משפטים לפי המילים של רמה 5)
    { id: 441, text: "🔊 חזור אחרי הקריין: I went to school yesterday", options: [], correct: 0, explanation: "'I went to school yesterday' - הלכתי לבית הספר אתמול", category: "repeat" },
    { id: 442, text: "🔊 חזור אחרי הקריין: I will go to school tomorrow", options: [], correct: 0, explanation: "'I will go to school tomorrow' - אלך לבית הספר מחר", category: "repeat" },
    { id: 443, text: "🔊 חזור אחרי הקריין: I have read this book", options: [], correct: 0, explanation: "'I have read this book' - קראתי את הספר הזה", category: "repeat" },
    { id: 444, text: "🔊 חזור אחרי הקריין: I had eaten breakfast", options: [], correct: 0, explanation: "'I had eaten breakfast' - אכלתי ארוחת בוקר", category: "repeat" },
    { id: 445, text: "🔊 חזור אחרי הקריין: If I have time, I will help you", options: [], correct: 0, explanation: "'If I have time, I will help you' - אם יש לי זמן, אעזור לך", category: "repeat" },
    { id: 446, text: "🔊 חזור אחרי הקריין: You must study hard to pass", options: [], correct: 0, explanation: "'You must study hard to pass' - אתה חייב ללמוד קשה כדי לעבור", category: "repeat" },
    { id: 447, text: "🔊 חזור אחרי הקריין: Although it was raining, we stayed inside", options: [], correct: 0, explanation: "'Although it was raining, we stayed inside' - למרות שירד גשם, נשארנו בפנים", category: "repeat" },
    { id: 448, text: "🔊 חזור אחרי הקריין: Since it's late, we should go home", options: [], correct: 0, explanation: "'Since it's late, we should go home' - מכיוון שמאוחר, אנחנו צריכים ללכת הביתה", category: "repeat" },
    
    // שאלות הזזת מילים ליצירת משפט (sentence-scramble) - רק מילים של רמה 5
    { id: 449, text: "ארגן את המילים ליצירת משפט: I / went / to / school / yesterday", options: ["I went to school yesterday", "went I to school yesterday", "yesterday school to went I", "I school went to yesterday"], correct: 0, explanation: "המשפט הנכון: I went to school yesterday", category: "sentence-scramble" },
    { id: 450, text: "ארגן את המילים ליצירת משפט: I / will / go / to / school / tomorrow", options: ["I will go to school tomorrow", "will I go to school tomorrow", "tomorrow school to go will I", "I school will go to tomorrow"], correct: 0, explanation: "המשפט הנכון: I will go to school tomorrow", category: "sentence-scramble" },
    { id: 451, text: "ארגן את המילים ליצירת משפט: I / have / read / this / book", options: ["I have read this book", "have I read this book", "book this read have I", "I book have read this"], correct: 0, explanation: "המשפט הנכון: I have read this book", category: "sentence-scramble" },
    { id: 452, text: "ארגן את המילים ליצירת משפט: If / I / have / time, / I / will / help / you", options: ["If I have time, I will help you", "I If have time, will I help you", "you help will I time, have I If", "If time I have, you help will I"], correct: 0, explanation: "המשפט הנכון: If I have time, I will help you", category: "sentence-scramble" },
    { id: 453, text: "ארגן את המילים ליצירת משפט: Although / it / was / raining, / we / stayed / inside", options: ["Although it was raining, we stayed inside", "it Although was raining, stayed we inside", "inside stayed we raining, was it Although", "Although raining it was, we inside stayed"], correct: 0, explanation: "המשפט הנכון: Although it was raining, we stayed inside", category: "sentence-scramble" },
    
    // שאלות השלמת משפטים (fill-blanks) - רק מילים של רמה 5
    { id: 454, text: "השלם: I ___ to school yesterday", options: ["go", "went", "will go", "am going"], correct: 1, explanation: "I went to school yesterday - הלכתי לבית הספר אתמול", category: "fill-blanks" },
    { id: 455, text: "השלם: I ___ to school tomorrow", options: ["go", "went", "will go", "am going"], correct: 2, explanation: "I will go to school tomorrow - אלך לבית הספר מחר", category: "fill-blanks" },
    { id: 456, text: "השלם: I have ___ this book", options: ["read", "reads", "reading", "readed"], correct: 0, explanation: "I have read this book - קראתי את הספר הזה", category: "fill-blanks" },
    { id: 457, text: "השלם: I had ___ breakfast", options: ["eat", "eaten", "ate", "eating"], correct: 1, explanation: "I had eaten breakfast - אכלתי ארוחת בוקר", category: "fill-blanks" },
    { id: 458, text: "השלם: If I ___ time, I will help you", options: ["have", "had", "will have", "am having"], correct: 0, explanation: "If I have time, I will help you - אם יש לי זמן, אעזור לך", category: "fill-blanks" },
    { id: 459, text: "השלם: You ___ study hard to pass", options: ["must", "can", "will", "should"], correct: 0, explanation: "You must study hard to pass - אתה חייב ללמוד קשה כדי לעבור", category: "fill-blanks" },
    
    // שאלות נכון או לא נכון (true-false) - רק מילים של רמה 5
    { id: 460, text: "נכון או לא נכון: I went to school yesterday", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - I went to school yesterday זה משפט תקין", category: "true-false" },
    { id: 461, text: "נכון או לא נכון: I will go to school tomorrow", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - I will go to school tomorrow זה משפט תקין", category: "true-false" },
    { id: 462, text: "נכון או לא נכון: I have read this book", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - I have read this book זה משפט תקין", category: "true-false" },
    { id: 463, text: "נכון או לא נכון: school to went I yesterday", options: ["נכון", "לא נכון"], correct: 1, explanation: "לא נכון - הסדר הנכון הוא: I went to school yesterday", category: "true-false" },
    { id: 464, text: "נכון או לא נכון: book this read have I", options: ["נכון", "לא נכון"], correct: 1, explanation: "לא נכון - הסדר הנכון הוא: I have read this book", category: "true-false" },
    { id: 465, text: "נכון או לא נכון: Although it was raining, we stayed inside", options: ["נכון", "לא נכון"], correct: 0, explanation: "נכון - Although it was raining, we stayed inside זה משפט תקין", category: "true-false" }
    ]
  },
  '2': { // יחידה 2 - בית ומשפחה
    '1': [ // רמה 1 - מתחילים - מילים בסיסיות על בית ומשפחה
    // משפחה בסיסית
    { id: 2001, text: "Who is your mother's mother?", options: ["Aunt", "Sister", "Grandmother", "Cousin"], correct: 2, explanation: "האם של אמא שלך היא הסבתא שלך", category: "family" },
    { id: 2002, text: "Who is your father's son?", options: ["Uncle", "Brother", "Cousin", "Grandfather"], correct: 1, explanation: "הבן של אבא שלך הוא האח שלך", category: "family" },
    { id: 2003, text: "Who is your mother's sister?", options: ["Aunt", "Grandmother", "Mother", "Cousin"], correct: 0, explanation: "האחות של אמא שלך היא הדודה שלך", category: "family" },
    { id: 2004, text: "Who is your father's brother?", options: ["Uncle", "Brother", "Cousin", "Grandfather"], correct: 0, explanation: "האח של אבא שלך הוא הדוד שלך", category: "family" },
    { id: 2005, text: "What do you call your mother and father?", options: ["Parents", "Children", "Siblings", "Relatives"], correct: 0, explanation: "אמא ואבא הם ההורים שלך", category: "family" },
    { id: 2006, text: "What do you call your brother and sister?", options: ["Parents", "Siblings", "Cousins", "Uncles"], correct: 1, explanation: "אח ואחות הם האחים שלך", category: "family" },
    { id: 2007, text: "Who is your mother's daughter?", options: ["Aunt", "Sister", "You or your sister", "Cousin"], correct: 2, explanation: "הבת של אמא שלך היא את או האחות שלך", category: "family" },
    { id: 2008, text: "Who is your father's daughter?", options: ["Aunt", "Sister", "You or your sister", "Cousin"], correct: 2, explanation: "הבת של אבא שלך היא את או האחות שלך", category: "family" },
    
    // בית - חדרים בסיסיים
    { id: 2009, text: "Where do you sleep?", options: ["Kitchen", "Bedroom", "Bathroom", "Living room"], correct: 1, explanation: "ישנים בחדר השינה", category: "house" },
    { id: 2010, text: "Where do you cook food?", options: ["Kitchen", "Bedroom", "Bathroom", "Living room"], correct: 0, explanation: "מבשלים אוכל במטבח", category: "house" },
    { id: 2011, text: "Where do you take a shower?", options: ["Kitchen", "Bedroom", "Bathroom", "Living room"], correct: 2, explanation: "מתקלחים בחדר האמבטיה", category: "house" },
    { id: 2012, text: "Where do you watch TV?", options: ["Kitchen", "Bedroom", "Bathroom", "Living room"], correct: 3, explanation: "צופים בטלוויזיה בסלון", category: "house" },
    { id: 2013, text: "Where do you eat dinner?", options: ["Kitchen", "Dining room", "Bathroom", "Bedroom"], correct: 1, explanation: "אוכלים ארוחת ערב בחדר האוכל", category: "house" },
    { id: 2014, text: "Where do you keep your clothes?", options: ["Kitchen", "Closet", "Bathroom", "Living room"], correct: 1, explanation: "שומרים את הבגדים בארון", category: "house" },
    { id: 2015, text: "What do you sit on in the living room?", options: ["Table", "Sofa", "Refrigerator", "Sink"], correct: 1, explanation: "יושבים על הספה בסלון", category: "house" },
    { id: 2016, text: "What do you use to open the door?", options: ["Key", "Spoon", "Book", "Pen"], correct: 0, explanation: "משתמשים במפתח כדי לפתוח את הדלת", category: "house" },
    
    // פעילויות בבית
    { id: 2017, text: "What do you do in the morning at home?", options: ["Sleep", "Wake up", "Go to bed", "Watch stars"], correct: 1, explanation: "בבוקר מתעוררים", category: "house" },
    { id: 2018, text: "What do you do before going to bed?", options: ["Wake up", "Brush your teeth", "Eat breakfast", "Go to school"], correct: 1, explanation: "לפני השינה מצחצחים שיניים", category: "house" },
    { id: 2019, text: "What do you do with your family at dinner?", options: ["Sleep", "Eat together", "Go to school", "Play outside"], correct: 1, explanation: "בארוחת ערב אוכלים יחד עם המשפחה", category: "family" },
    { id: 2020, text: "What do you do with your siblings?", options: ["Cook", "Play", "Drive", "Work"], correct: 1, explanation: "משחקים עם האחים שלך", category: "family" },
    
    // שאלות חזרה - מילים בסיסיות
    { id: 2021, text: "🔊 חזור אחרי הקריין: Family", options: ["Family", "Friend", "School", "House"], correct: 0, explanation: "Family - משפחה", category: "repeat" },
    { id: 2022, text: "🔊 חזור אחרי הקריין: Mother", options: ["Mother", "Father", "Brother", "Sister"], correct: 0, explanation: "Mother - אמא", category: "repeat" },
    { id: 2023, text: "🔊 חזור אחרי הקריין: Father", options: ["Father", "Mother", "Brother", "Sister"], correct: 0, explanation: "Father - אבא", category: "repeat" },
    { id: 2024, text: "🔊 חזור אחרי הקריין: Brother", options: ["Brother", "Sister", "Mother", "Father"], correct: 0, explanation: "Brother - אח", category: "repeat" },
    { id: 2025, text: "🔊 חזור אחרי הקריין: Sister", options: ["Sister", "Brother", "Mother", "Father"], correct: 0, explanation: "Sister - אחות", category: "repeat" },
    { id: 2026, text: "🔊 חזור אחרי הקריין: House", options: ["House", "School", "Car", "Tree"], correct: 0, explanation: "House - בית", category: "repeat" },
    { id: 2027, text: "🔊 חזור אחרי הקריין: Room", options: ["Room", "Door", "Window", "Wall"], correct: 0, explanation: "Room - חדר", category: "repeat" },
    { id: 2028, text: "🔊 חזור אחרי הקריין: Kitchen", options: ["Kitchen", "Bedroom", "Bathroom", "Living room"], correct: 0, explanation: "Kitchen - מטבח", category: "repeat" },
    { id: 2029, text: "🔊 חזור אחרי הקריין: Bedroom", options: ["Bedroom", "Kitchen", "Bathroom", "Living room"], correct: 0, explanation: "Bedroom - חדר שינה", category: "repeat" },
    { id: 2030, text: "🔊 חזור אחרי הקריין: Bathroom", options: ["Bathroom", "Kitchen", "Bedroom", "Living room"], correct: 0, explanation: "Bathroom - חדר אמבטיה", category: "repeat" },
    { id: 2031, text: "🔊 חזור אחרי הקריין: Living room", options: ["Living room", "Kitchen", "Bedroom", "Bathroom"], correct: 0, explanation: "Living room - סלון", category: "repeat" },
    { id: 2032, text: "🔊 חזור אחרי הקריין: Table", options: ["Table", "Chair", "Bed", "Door"], correct: 0, explanation: "Table - שולחן", category: "repeat" },
    { id: 2033, text: "🔊 חזור אחרי הקריין: Chair", options: ["Chair", "Table", "Bed", "Door"], correct: 0, explanation: "Chair - כיסא", category: "repeat" },
    { id: 2034, text: "🔊 חזור אחרי הקריין: Bed", options: ["Bed", "Table", "Chair", "Door"], correct: 0, explanation: "Bed - מיטה", category: "repeat" },
    { id: 2035, text: "🔊 חזור אחרי הקריין: Door", options: ["Door", "Window", "Wall", "Roof"], correct: 0, explanation: "Door - דלת", category: "repeat" },
    { id: 2036, text: "🔊 חזור אחרי הקריין: Window", options: ["Window", "Door", "Wall", "Roof"], correct: 0, explanation: "Window - חלון", category: "repeat" },
    { id: 2037, text: "🔊 חזור אחרי הקריין: Sofa", options: ["Sofa", "Table", "Chair", "Bed"], correct: 0, explanation: "Sofa - ספה", category: "repeat" },
    { id: 2038, text: "🔊 חזור אחרי הקריין: Closet", options: ["Closet", "Kitchen", "Bathroom", "Bedroom"], correct: 0, explanation: "Closet - ארון", category: "repeat" },
    { id: 2039, text: "🔊 חזור אחרי הקריין: Key", options: ["Key", "Door", "Window", "Wall"], correct: 0, explanation: "Key - מפתח", category: "repeat" },
    { id: 2040, text: "🔊 חזור אחרי הקריין: Home", options: ["Home", "School", "Car", "Tree"], correct: 0, explanation: "Home - בית", category: "repeat" }
    ],
    '2': [ // רמה 2 - בסיסי - משפחה ובית מורחבים
    // משפחה מורחבת
    { id: 2101, text: "Who is your mother's mother?", options: ["Aunt", "Sister", "Grandmother", "Cousin"], correct: 2, explanation: "האם של אמא שלך היא הסבתא שלך", category: "family" },
    { id: 2102, text: "Who is your father's father?", options: ["Uncle", "Brother", "Grandfather", "Cousin"], correct: 2, explanation: "האב של אבא שלך הוא הסבא שלך", category: "family" },
    { id: 2103, text: "Who is your mother's sister?", options: ["Aunt", "Grandmother", "Mother", "Cousin"], correct: 0, explanation: "האחות של אמא שלך היא הדודה שלך", category: "family" },
    { id: 2104, text: "Who is your father's brother?", options: ["Uncle", "Brother", "Cousin", "Grandfather"], correct: 0, explanation: "האח של אבא שלך הוא הדוד שלך", category: "family" },
    { id: 2105, text: "What do you call your mother and father together?", options: ["Parents", "Children", "Siblings", "Relatives"], correct: 0, explanation: "אמא ואבא הם ההורים שלך", category: "family" },
    { id: 2106, text: "What do you call your brother and sister together?", options: ["Parents", "Siblings", "Cousins", "Uncles"], correct: 1, explanation: "אח ואחות הם האחים שלך", category: "family" },
    { id: 2107, text: "Who is your mother's daughter?", options: ["Aunt", "Sister", "You or your sister", "Cousin"], correct: 2, explanation: "הבת של אמא שלך היא את או האחות שלך", category: "family" },
    { id: 2108, text: "Who is your father's son?", options: ["Uncle", "Brother", "You or your brother", "Cousin"], correct: 2, explanation: "הבן של אבא שלך הוא אתה או האח שלך", category: "family" },
    { id: 2109, text: "Who is your mother's mother?", options: ["Aunt", "Sister", "Grandmother", "Cousin"], correct: 2, explanation: "האם של אמא שלך היא הסבתא שלך", category: "family" },
    { id: 2110, text: "Who is your father's father?", options: ["Uncle", "Brother", "Grandfather", "Cousin"], correct: 2, explanation: "האב של אבא שלך הוא הסבא שלך", category: "family" },
    
    // בית - חדרים ופעילויות
    { id: 2111, text: "Where do you sleep at night?", options: ["Kitchen", "Bedroom", "Bathroom", "Living room"], correct: 1, explanation: "ישנים בחדר השינה", category: "house" },
    { id: 2112, text: "Where do you cook food?", options: ["Kitchen", "Bedroom", "Bathroom", "Living room"], correct: 0, explanation: "מבשלים אוכל במטבח", category: "house" },
    { id: 2113, text: "Where do you take a shower?", options: ["Kitchen", "Bedroom", "Bathroom", "Living room"], correct: 2, explanation: "מתקלחים בחדר האמבטיה", category: "house" },
    { id: 2114, text: "Where do you watch TV with your family?", options: ["Kitchen", "Bedroom", "Bathroom", "Living room"], correct: 3, explanation: "צופים בטלוויזיה בסלון עם המשפחה", category: "house" },
    { id: 2115, text: "Where do you eat dinner with your family?", options: ["Kitchen", "Dining room", "Bathroom", "Bedroom"], correct: 1, explanation: "אוכלים ארוחת ערב בחדר האוכל עם המשפחה", category: "house" },
    { id: 2116, text: "Where do you keep your clothes?", options: ["Kitchen", "Closet", "Bathroom", "Living room"], correct: 1, explanation: "שומרים את הבגדים בארון", category: "house" },
    { id: 2117, text: "What do you sit on in the living room?", options: ["Table", "Sofa", "Refrigerator", "Sink"], correct: 1, explanation: "יושבים על הספה בסלון", category: "house" },
    { id: 2118, text: "What do you use to open the door?", options: ["Key", "Spoon", "Book", "Pen"], correct: 0, explanation: "משתמשים במפתח כדי לפתוח את הדלת", category: "house" },
    { id: 2119, text: "What do you sleep on?", options: ["Table", "Chair", "Bed", "Sofa"], correct: 2, explanation: "ישנים על מיטה", category: "house" },
    { id: 2120, text: "What do you sit on at the table?", options: ["Bed", "Chair", "Sofa", "Table"], correct: 1, explanation: "יושבים על כיסא ליד השולחן", category: "house" },
    
    // פעילויות משפחתיות
    { id: 2121, text: "What do you do with your family at dinner?", options: ["Sleep", "Eat together", "Go to school", "Play outside"], correct: 1, explanation: "בארוחת ערב אוכלים יחד עם המשפחה", category: "family" },
    { id: 2122, text: "What do you do with your siblings?", options: ["Cook", "Play", "Drive", "Work"], correct: 1, explanation: "משחקים עם האחים שלך", category: "family" },
    { id: 2123, text: "What do you do with your parents on weekends?", options: ["Go to school", "Spend time together", "Sleep all day", "Nothing"], correct: 1, explanation: "בסופי שבוע מבלים יחד עם ההורים", category: "family" },
    { id: 2124, text: "What do you do in the morning at home?", options: ["Sleep", "Wake up and get ready", "Go to bed", "Watch stars"], correct: 1, explanation: "בבוקר מתעוררים ומתכוננים", category: "house" },
    { id: 2125, text: "What do you do before going to bed?", options: ["Wake up", "Brush your teeth", "Eat breakfast", "Go to school"], correct: 1, explanation: "לפני השינה מצחצחים שיניים", category: "house" },
    
    // אוצר מילים - משפחה
    { id: 2126, text: "What is the English word for 'אמא'?", options: ["Father", "Mother", "Brother", "Sister"], correct: 1, explanation: "המילה 'Mother' פירושה 'אמא'", category: "vocabulary" },
    { id: 2127, text: "What is the English word for 'אבא'?", options: ["Father", "Mother", "Brother", "Sister"], correct: 0, explanation: "המילה 'Father' פירושה 'אבא'", category: "vocabulary" },
    { id: 2128, text: "What is the English word for 'אח'?", options: ["Brother", "Sister", "Mother", "Father"], correct: 0, explanation: "המילה 'Brother' פירושה 'אח'", category: "vocabulary" },
    { id: 2129, text: "What is the English word for 'אחות'?", options: ["Brother", "Sister", "Mother", "Father"], correct: 1, explanation: "המילה 'Sister' פירושה 'אחות'", category: "vocabulary" },
    { id: 2130, text: "What is the English word for 'סבא'?", options: ["Grandmother", "Grandfather", "Uncle", "Aunt"], correct: 1, explanation: "המילה 'Grandfather' פירושה 'סבא'", category: "vocabulary" },
    { id: 2131, text: "What is the English word for 'סבתא'?", options: ["Grandmother", "Grandfather", "Uncle", "Aunt"], correct: 0, explanation: "המילה 'Grandmother' פירושה 'סבתא'", category: "vocabulary" },
    { id: 2132, text: "What is the English word for 'דוד'?", options: ["Aunt", "Uncle", "Cousin", "Grandfather"], correct: 1, explanation: "המילה 'Uncle' פירושה 'דוד'", category: "vocabulary" },
    { id: 2133, text: "What is the English word for 'דודה'?", options: ["Aunt", "Uncle", "Cousin", "Grandfather"], correct: 0, explanation: "המילה 'Aunt' פירושה 'דודה'", category: "vocabulary" },
    
    // אוצר מילים - בית
    { id: 2134, text: "What is the English word for 'בית'?", options: ["House", "School", "Car", "Tree"], correct: 0, explanation: "המילה 'House' פירושה 'בית'", category: "vocabulary" },
    { id: 2135, text: "What is the English word for 'חדר'?", options: ["Room", "Door", "Window", "Wall"], correct: 0, explanation: "המילה 'Room' פירושה 'חדר'", category: "vocabulary" },
    { id: 2136, text: "What is the English word for 'מטבח'?", options: ["Kitchen", "Bedroom", "Bathroom", "Living room"], correct: 0, explanation: "המילה 'Kitchen' פירושה 'מטבח'", category: "vocabulary" },
    { id: 2137, text: "What is the English word for 'חדר שינה'?", options: ["Bedroom", "Kitchen", "Bathroom", "Living room"], correct: 0, explanation: "המילה 'Bedroom' פירושה 'חדר שינה'", category: "vocabulary" },
    { id: 2138, text: "What is the English word for 'סלון'?", options: ["Living room", "Kitchen", "Bedroom", "Bathroom"], correct: 0, explanation: "המילה 'Living room' פירושה 'סלון'", category: "vocabulary" },
    { id: 2139, text: "What is the English word for 'שולחן'?", options: ["Table", "Chair", "Bed", "Door"], correct: 0, explanation: "המילה 'Table' פירושה 'שולחן'", category: "vocabulary" },
    { id: 2140, text: "What is the English word for 'כיסא'?", options: ["Chair", "Table", "Bed", "Door"], correct: 0, explanation: "המילה 'Chair' פירושה 'כיסא'", category: "vocabulary" },
    { id: 2141, text: "What is the English word for 'מיטה'?", options: ["Bed", "Table", "Chair", "Door"], correct: 0, explanation: "המילה 'Bed' פירושה 'מיטה'", category: "vocabulary" },
    { id: 2142, text: "What is the English word for 'דלת'?", options: ["Door", "Window", "Wall", "Roof"], correct: 0, explanation: "המילה 'Door' פירושה 'דלת'", category: "vocabulary" },
    { id: 2143, text: "What is the English word for 'חלון'?", options: ["Window", "Door", "Wall", "Roof"], correct: 0, explanation: "המילה 'Window' פירושה 'חלון'", category: "vocabulary" },
    
    // קריאה - משפחה ובית
    { id: 2144, text: "Read: 'My family has four people: my mother, my father, my brother, and me.' How many people are in the family?", options: ["Two", "Three", "Four", "Five"], correct: 2, explanation: "במשפחה יש ארבעה אנשים", category: "reading" },
    { id: 2145, text: "Read: 'I sleep in my bedroom. My brother sleeps in his bedroom.' Where does the brother sleep?", options: ["In the kitchen", "In his bedroom", "In the bathroom", "In the living room"], correct: 1, explanation: "האח ישן בחדר השינה שלו", category: "reading" },
    { id: 2146, text: "Read: 'We eat dinner together in the dining room.' Where do they eat dinner?", options: ["In the kitchen", "In the dining room", "In the bathroom", "In the bedroom"], correct: 1, explanation: "אוכלים ארוחת ערב בחדר האוכל", category: "reading" },
    { id: 2147, text: "Read: 'My grandmother visits us every Sunday.' When does the grandmother visit?", options: ["Every day", "Every Sunday", "Every Monday", "Never"], correct: 1, explanation: "הסבתא מבקרת כל יום ראשון", category: "reading" },
    { id: 2148, text: "Read: 'My sister and I play in the living room.' Where do they play?", options: ["In the kitchen", "In the bedroom", "In the living room", "In the bathroom"], correct: 2, explanation: "משחקים בסלון", category: "reading" },
    
    // שאלות חזרה - מילים על משפחה ובית
    { id: 2149, text: "🔊 חזור אחרי הקריין: Grandmother", options: ["Grandmother", "Grandfather", "Mother", "Father"], correct: 0, explanation: "Grandmother - סבתא", category: "repeat" },
    { id: 2150, text: "🔊 חזור אחרי הקריין: Grandfather", options: ["Grandfather", "Grandmother", "Father", "Mother"], correct: 0, explanation: "Grandfather - סבא", category: "repeat" },
    { id: 2151, text: "🔊 חזור אחרי הקריין: Uncle", options: ["Uncle", "Aunt", "Cousin", "Brother"], correct: 0, explanation: "Uncle - דוד", category: "repeat" },
    { id: 2152, text: "🔊 חזור אחרי הקריין: Aunt", options: ["Aunt", "Uncle", "Cousin", "Sister"], correct: 0, explanation: "Aunt - דודה", category: "repeat" },
    { id: 2153, text: "🔊 חזור אחרי הקריין: Cousin", options: ["Cousin", "Brother", "Sister", "Uncle"], correct: 0, explanation: "Cousin - בן דוד/בת דודה", category: "repeat" },
    { id: 2154, text: "🔊 חזור אחרי הקריין: Dining room", options: ["Dining room", "Living room", "Bedroom", "Kitchen"], correct: 0, explanation: "Dining room - חדר אוכל", category: "repeat" },
    { id: 2155, text: "🔊 חזור אחרי הקריין: Closet", options: ["Closet", "Kitchen", "Bathroom", "Bedroom"], correct: 0, explanation: "Closet - ארון", category: "repeat" },
    { id: 2156, text: "🔊 חזור אחרי הקריין: Sofa", options: ["Sofa", "Table", "Chair", "Bed"], correct: 0, explanation: "Sofa - ספה", category: "repeat" },
    { id: 2157, text: "🔊 חזור אחרי הקריין: Key", options: ["Key", "Door", "Window", "Wall"], correct: 0, explanation: "Key - מפתח", category: "repeat" },
    { id: 2158, text: "🔊 חזור אחרי הקריין: Home", options: ["Home", "School", "Car", "Tree"], correct: 0, explanation: "Home - בית", category: "repeat" }
    ],
    '3': [ // רמה 3 - בינוני - משפחה ובית מתקדמים
    // משפחה מורחבת - יחסים
    { id: 2201, text: "Who is your mother's mother?", options: ["Aunt", "Sister", "Grandmother", "Cousin"], correct: 2, explanation: "האם של אמא שלך היא הסבתא שלך", category: "family" },
    { id: 2202, text: "Who is your father's father?", options: ["Uncle", "Brother", "Grandfather", "Cousin"], correct: 2, explanation: "האב של אבא שלך הוא הסבא שלך", category: "family" },
    { id: 2203, text: "Who is your mother's sister?", options: ["Aunt", "Grandmother", "Mother", "Cousin"], correct: 0, explanation: "האחות של אמא שלך היא הדודה שלך", category: "family" },
    { id: 2204, text: "Who is your father's brother?", options: ["Uncle", "Brother", "Cousin", "Grandfather"], correct: 0, explanation: "האח של אבא שלך הוא הדוד שלך", category: "family" },
    { id: 2205, text: "Who is your aunt's son?", options: ["Brother", "Cousin", "Uncle", "Nephew"], correct: 1, explanation: "הבן של הדודה שלך הוא בן הדוד שלך", category: "family" },
    { id: 2206, text: "Who is your uncle's daughter?", options: ["Sister", "Cousin", "Aunt", "Niece"], correct: 1, explanation: "הבת של הדוד שלך היא בת הדודה שלך", category: "family" },
    { id: 2207, text: "What do you call your mother's parents?", options: ["Grandparents", "Parents", "Uncles", "Aunts"], correct: 0, explanation: "ההורים של אמא שלך הם הסבים שלך", category: "family" },
    { id: 2208, text: "What do you call your father's parents?", options: ["Grandparents", "Parents", "Uncles", "Aunts"], correct: 0, explanation: "ההורים של אבא שלך הם הסבים שלך", category: "family" },
    
    // בית - חדרים ופעילויות מתקדמות
    { id: 2209, text: "Where do you study or do homework?", options: ["Kitchen", "Bedroom or study room", "Bathroom", "Garage"], correct: 1, explanation: "לומדים בחדר השינה או בחדר הלימודים", category: "house" },
    { id: 2210, text: "Where do you keep food cold?", options: ["Refrigerator", "Oven", "Microwave", "Sink"], correct: 0, explanation: "שומרים אוכל קר במקרר", category: "house" },
    { id: 2211, text: "Where do you wash dishes?", options: ["Sink", "Refrigerator", "Oven", "Microwave"], correct: 0, explanation: "שוטפים כלים בכיור", category: "house" },
    { id: 2212, text: "Where do you cook food on the stove?", options: ["Kitchen", "Bedroom", "Bathroom", "Living room"], correct: 0, explanation: "מבשלים אוכל על הכיריים במטבח", category: "house" },
    { id: 2213, text: "Where do you store your toys?", options: ["Toy box", "Refrigerator", "Oven", "Sink"], correct: 0, explanation: "שומרים את הצעצועים בארון צעצועים", category: "house" },
    { id: 2214, text: "What do you use to turn on the light?", options: ["Switch", "Key", "Door", "Window"], correct: 0, explanation: "משתמשים במתג כדי להדליק את האור", category: "house" },
    { id: 2215, text: "What do you use to see yourself?", options: ["Mirror", "Window", "Door", "Wall"], correct: 0, explanation: "משתמשים במראה כדי לראות את עצמך", category: "house" },
    { id: 2216, text: "What do you sit on at the dining table?", options: ["Chair", "Bed", "Sofa", "Table"], correct: 0, explanation: "יושבים על כיסא ליד שולחן האוכל", category: "house" },
    
    // פעילויות משפחתיות מתקדמות
    { id: 2217, text: "What do you do with your family on weekends?", options: ["Go to school", "Spend time together", "Sleep all day", "Nothing"], correct: 1, explanation: "בסופי שבוע מבלים יחד עם המשפחה", category: "family" },
    { id: 2218, text: "What do you do with your grandparents when they visit?", options: ["Ignore them", "Talk and play with them", "Hide", "Run away"], correct: 1, explanation: "כשהסבים מבקרים, מדברים ומשחקים איתם", category: "family" },
    { id: 2219, text: "What do you do with your cousins?", options: ["Fight", "Play and have fun", "Ignore", "Avoid"], correct: 1, explanation: "משחקים ונהנים עם בני הדודים", category: "family" },
    { id: 2220, text: "What do you do with your parents in the evening?", options: ["Go to school", "Spend time together, watch TV, or talk", "Sleep", "Nothing"], correct: 1, explanation: "בערב מבלים יחד עם ההורים, צופים בטלוויזיה או מדברים", category: "family" },
    { id: 2221, text: "What do you do with your siblings when you play?", options: ["Fight", "Play together and share", "Ignore", "Avoid"], correct: 1, explanation: "כשמשחקים עם האחים, משחקים יחד ומשתפים", category: "family" },
    
    // אוצר מילים - משפחה מורחבת
    { id: 2222, text: "What is the English word for 'בן דוד'?", options: ["Cousin", "Brother", "Uncle", "Nephew"], correct: 0, explanation: "המילה 'Cousin' פירושה 'בן דוד/בת דודה'", category: "vocabulary" },
    { id: 2223, text: "What is the English word for 'אחיין'?", options: ["Nephew", "Cousin", "Uncle", "Brother"], correct: 0, explanation: "המילה 'Nephew' פירושה 'אחיין'", category: "vocabulary" },
    { id: 2224, text: "What is the English word for 'אחיינית'?", options: ["Niece", "Cousin", "Aunt", "Sister"], correct: 0, explanation: "המילה 'Niece' פירושה 'אחיינית'", category: "vocabulary" },
    { id: 2225, text: "What is the English word for 'סבים'?", options: ["Grandparents", "Parents", "Uncles", "Aunts"], correct: 0, explanation: "המילה 'Grandparents' פירושה 'סבים'", category: "vocabulary" },
    
    // אוצר מילים - בית מתקדם
    { id: 2226, text: "What is the English word for 'מקרר'?", options: ["Refrigerator", "Oven", "Microwave", "Sink"], correct: 0, explanation: "המילה 'Refrigerator' פירושה 'מקרר'", category: "vocabulary" },
    { id: 2227, text: "What is the English word for 'כיריים'?", options: ["Stove", "Refrigerator", "Oven", "Microwave"], correct: 0, explanation: "המילה 'Stove' פירושה 'כיריים'", category: "vocabulary" },
    { id: 2228, text: "What is the English word for 'תנור'?", options: ["Oven", "Refrigerator", "Stove", "Microwave"], correct: 0, explanation: "המילה 'Oven' פירושה 'תנור'", category: "vocabulary" },
    { id: 2229, text: "What is the English word for 'מיקרוגל'?", options: ["Microwave", "Refrigerator", "Oven", "Stove"], correct: 0, explanation: "המילה 'Microwave' פירושה 'מיקרוגל'", category: "vocabulary" },
    { id: 2230, text: "What is the English word for 'כיור'?", options: ["Sink", "Refrigerator", "Oven", "Stove"], correct: 0, explanation: "המילה 'Sink' פירושה 'כיור'", category: "vocabulary" },
    { id: 2231, text: "What is the English word for 'מראה'?", options: ["Mirror", "Window", "Door", "Wall"], correct: 0, explanation: "המילה 'Mirror' פירושה 'מראה'", category: "vocabulary" },
    { id: 2232, text: "What is the English word for 'מתג'?", options: ["Switch", "Key", "Door", "Window"], correct: 0, explanation: "המילה 'Switch' פירושה 'מתג'", category: "vocabulary" },
    { id: 2233, text: "What is the English word for 'ארון צעצועים'?", options: ["Toy box", "Closet", "Refrigerator", "Sink"], correct: 0, explanation: "המילה 'Toy box' פירושה 'ארון צעצועים'", category: "vocabulary" },
    
    // קריאה - משפחה ובית
    { id: 2234, text: "Read: 'My grandmother bakes cookies in the kitchen. My grandfather reads in the living room.' Where does the grandfather read?", options: ["In the kitchen", "In the living room", "In the bedroom", "In the bathroom"], correct: 1, explanation: "הסבא קורא בסלון", category: "reading" },
    { id: 2235, text: "Read: 'My aunt and uncle visit us every month. They bring presents for me and my sister.' Who visits every month?", options: ["Grandparents", "Aunt and uncle", "Cousins", "Friends"], correct: 1, explanation: "הדודה והדוד מבקרים כל חודש", category: "reading" },
    { id: 2236, text: "Read: 'We have dinner together in the dining room. After dinner, we watch TV in the living room.' Where do they watch TV?", options: ["In the kitchen", "In the dining room", "In the living room", "In the bedroom"], correct: 2, explanation: "צופים בטלוויזיה בסלון", category: "reading" },
    { id: 2237, text: "Read: 'My brother and I share a bedroom. We have two beds and one closet.' How many beds are in the bedroom?", options: ["One", "Two", "Three", "Four"], correct: 1, explanation: "יש שתי מיטות בחדר השינה", category: "reading" },
    { id: 2238, text: "Read: 'My mother cooks in the kitchen. My father helps her. I set the table.' Who sets the table?", options: ["Mother", "Father", "I", "Brother"], correct: 2, explanation: "אני עורך את השולחן", category: "reading" },
    
    // דקדוק בסיסי - משפחה ובית
    { id: 2239, text: "Complete: 'My family ___ four people.'", options: ["has", "have", "is", "are"], correct: 0, explanation: "למשפחה שלי יש ארבעה אנשים (family הוא יחיד)", category: "grammar" },
    { id: 2240, text: "Complete: 'My parents ___ at home.'", options: ["is", "are", "was", "were"], correct: 1, explanation: "ההורים שלי בבית (parents הוא רבים)", category: "grammar" },
    { id: 2241, text: "Complete: 'I ___ my room every day.'", options: ["clean", "cleans", "cleaned", "cleaning"], correct: 0, explanation: "אני מנקה את החדר שלי כל יום (הווה פשוט)", category: "grammar" },
    { id: 2242, text: "Complete: 'My sister ___ in her bedroom.'", options: ["sleep", "sleeps", "slept", "sleeping"], correct: 1, explanation: "האחות שלי ישנה בחדר השינה שלה (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 2243, text: "Complete: 'We ___ dinner together every night.'", options: ["eat", "eats", "ate", "eating"], correct: 0, explanation: "אנחנו אוכלים ארוחת ערב יחד כל לילה (הווה פשוט, רבים)", category: "grammar" },
    
    // שאלות חזרה - מילים מתקדמות
    { id: 2244, text: "🔊 חזור אחרי הקריין: Cousin", options: ["Cousin", "Brother", "Sister", "Uncle"], correct: 0, explanation: "Cousin - בן דוד/בת דודה", category: "repeat" },
    { id: 2245, text: "🔊 חזור אחרי הקריין: Nephew", options: ["Nephew", "Cousin", "Uncle", "Brother"], correct: 0, explanation: "Nephew - אחיין", category: "repeat" },
    { id: 2246, text: "🔊 חזור אחרי הקריין: Niece", options: ["Niece", "Cousin", "Aunt", "Sister"], correct: 0, explanation: "Niece - אחיינית", category: "repeat" },
    { id: 2247, text: "🔊 חזור אחרי הקריין: Grandparents", options: ["Grandparents", "Parents", "Uncles", "Aunts"], correct: 0, explanation: "Grandparents - סבים", category: "repeat" },
    { id: 2248, text: "🔊 חזור אחרי הקריין: Refrigerator", options: ["Refrigerator", "Oven", "Microwave", "Sink"], correct: 0, explanation: "Refrigerator - מקרר", category: "repeat" },
    { id: 2249, text: "🔊 חזור אחרי הקריין: Stove", options: ["Stove", "Refrigerator", "Oven", "Microwave"], correct: 0, explanation: "Stove - כיריים", category: "repeat" },
    { id: 2250, text: "🔊 חזור אחרי הקריין: Oven", options: ["Oven", "Refrigerator", "Stove", "Microwave"], correct: 0, explanation: "Oven - תנור", category: "repeat" },
    { id: 2251, text: "🔊 חזור אחרי הקריין: Microwave", options: ["Microwave", "Refrigerator", "Oven", "Stove"], correct: 0, explanation: "Microwave - מיקרוגל", category: "repeat" },
    { id: 2252, text: "🔊 חזור אחרי הקריין: Sink", options: ["Sink", "Refrigerator", "Oven", "Stove"], correct: 0, explanation: "Sink - כיור", category: "repeat" },
    { id: 2253, text: "🔊 חזור אחרי הקריין: Mirror", options: ["Mirror", "Window", "Door", "Wall"], correct: 0, explanation: "Mirror - מראה", category: "repeat" },
    { id: 2254, text: "🔊 חזור אחרי הקריין: Switch", options: ["Switch", "Key", "Door", "Window"], correct: 0, explanation: "Switch - מתג", category: "repeat" },
    { id: 2255, text: "🔊 חזור אחרי הקריין: Toy box", options: ["Toy box", "Closet", "Refrigerator", "Sink"], correct: 0, explanation: "Toy box - ארון צעצועים", category: "repeat" },
    { id: 2256, text: "🔊 חזור אחרי הקריין: Study room", options: ["Study room", "Bedroom", "Kitchen", "Bathroom"], correct: 0, explanation: "Study room - חדר לימודים", category: "repeat" },
    { id: 2257, text: "🔊 חזור אחרי הקריין: Dining room", options: ["Dining room", "Living room", "Bedroom", "Kitchen"], correct: 0, explanation: "Dining room - חדר אוכל", category: "repeat" },
    { id: 2258, text: "🔊 חזור אחרי הקריין: Garage", options: ["Garage", "Kitchen", "Bedroom", "Bathroom"], correct: 0, explanation: "Garage - מוסך", category: "repeat" }
    ],
    '4': [ // רמה 4 - מתקדם - משפחה ובית מתקדמים
    // משפחה - יחסים מורכבים
    { id: 2301, text: "Who is your mother's brother's son?", options: ["Brother", "Cousin", "Uncle", "Nephew"], correct: 1, explanation: "הבן של האח של אמא שלך הוא בן הדוד שלך", category: "family" },
    { id: 2302, text: "Who is your father's sister's daughter?", options: ["Sister", "Cousin", "Aunt", "Niece"], correct: 1, explanation: "הבת של האחות של אבא שלך היא בת הדודה שלך", category: "family" },
    { id: 2303, text: "Who is your brother's son?", options: ["Cousin", "Nephew", "Brother", "Uncle"], correct: 1, explanation: "הבן של האח שלך הוא האחיין שלך", category: "family" },
    { id: 2304, text: "Who is your sister's daughter?", options: ["Cousin", "Niece", "Sister", "Aunt"], correct: 1, explanation: "הבת של האחות שלך היא האחיינית שלך", category: "family" },
    { id: 2305, text: "What do you call your uncle's children?", options: ["Brothers and sisters", "Cousins", "Nephews and nieces", "Uncles and aunts"], correct: 1, explanation: "הילדים של הדוד שלך הם בני הדודים שלך", category: "family" },
    { id: 2306, text: "What do you call your brother's children?", options: ["Cousins", "Nephews and nieces", "Brothers and sisters", "Uncles and aunts"], correct: 1, explanation: "הילדים של האח שלך הם האחיינים והאחייניות שלך", category: "family" },
    
    // בית - פעילויות וכלים
    { id: 2307, text: "What do you use to cook food on the stove?", options: ["Pan", "Refrigerator", "Sink", "Mirror"], correct: 0, explanation: "משתמשים במחבת כדי לבשל אוכל על הכיריים", category: "house" },
    { id: 2308, text: "What do you use to eat soup?", options: ["Fork", "Spoon", "Knife", "Plate"], correct: 1, explanation: "משתמשים בכף כדי לאכול מרק", category: "house" },
    { id: 2309, text: "What do you use to cut food?", options: ["Fork", "Spoon", "Knife", "Plate"], correct: 2, explanation: "משתמשים בסכין כדי לחתוך אוכל", category: "house" },
    { id: 2310, text: "What do you put food on when you eat?", options: ["Plate", "Fork", "Spoon", "Knife"], correct: 0, explanation: "שמים אוכל על צלחת כשאוכלים", category: "house" },
    { id: 2311, text: "What do you use to drink water?", options: ["Cup", "Plate", "Fork", "Spoon"], correct: 0, explanation: "משתמשים בכוס כדי לשתות מים", category: "house" },
    { id: 2312, text: "Where do you hang your clothes?", options: ["Closet", "Refrigerator", "Oven", "Sink"], correct: 0, explanation: "תולים את הבגדים בארון", category: "house" },
    { id: 2313, text: "Where do you keep your books?", options: ["Bookshelf", "Refrigerator", "Oven", "Sink"], correct: 0, explanation: "שומרים את הספרים על מדף ספרים", category: "house" },
    { id: 2314, text: "Where do you park your car?", options: ["Garage", "Kitchen", "Bedroom", "Bathroom"], correct: 0, explanation: "חונים את המכונית במוסך", category: "house" },
    
    // פעילויות משפחתיות מתקדמות
    { id: 2315, text: "What do you do with your family on holidays?", options: ["Nothing", "Celebrate together", "Ignore them", "Avoid them"], correct: 1, explanation: "בחגים חוגגים יחד עם המשפחה", category: "family" },
    { id: 2316, text: "What do you do with your grandparents when they tell stories?", options: ["Ignore", "Listen and learn", "Run away", "Sleep"], correct: 1, explanation: "כשהסבים מספרים סיפורים, מקשיבים ולומדים", category: "family" },
    { id: 2317, text: "What do you do with your parents when you need help?", options: ["Hide", "Ask them for help", "Ignore", "Avoid"], correct: 1, explanation: "כשצריך עזרה, שואלים את ההורים", category: "family" },
    { id: 2318, text: "What do you do with your siblings when you share?", options: ["Fight", "Share toys and games", "Ignore", "Avoid"], correct: 1, explanation: "משתפים עם האחים, משתפים צעצועים ומשחקים", category: "family" },
    { id: 2319, text: "What do you do with your cousins when they visit?", options: ["Hide", "Play and have fun together", "Ignore", "Avoid"], correct: 1, explanation: "כשבני הדודים מבקרים, משחקים ונהנים יחד", category: "family" },
    
    // אוצר מילים - משפחה ובית מתקדמים
    { id: 2320, text: "What is the English word for 'אחיין'?", options: ["Nephew", "Cousin", "Uncle", "Brother"], correct: 0, explanation: "המילה 'Nephew' פירושה 'אחיין'", category: "vocabulary" },
    { id: 2321, text: "What is the English word for 'אחיינית'?", options: ["Niece", "Cousin", "Aunt", "Sister"], correct: 0, explanation: "המילה 'Niece' פירושה 'אחיינית'", category: "vocabulary" },
    { id: 2322, text: "What is the English word for 'סבים'?", options: ["Grandparents", "Parents", "Uncles", "Aunts"], correct: 0, explanation: "המילה 'Grandparents' פירושה 'סבים'", category: "vocabulary" },
    { id: 2323, text: "What is the English word for 'מקרר'?", options: ["Refrigerator", "Oven", "Microwave", "Sink"], correct: 0, explanation: "המילה 'Refrigerator' פירושה 'מקרר'", category: "vocabulary" },
    { id: 2324, text: "What is the English word for 'כיריים'?", options: ["Stove", "Refrigerator", "Oven", "Microwave"], correct: 0, explanation: "המילה 'Stove' פירושה 'כיריים'", category: "vocabulary" },
    { id: 2325, text: "What is the English word for 'תנור'?", options: ["Oven", "Refrigerator", "Stove", "Microwave"], correct: 0, explanation: "המילה 'Oven' פירושה 'תנור'", category: "vocabulary" },
    { id: 2326, text: "What is the English word for 'מיקרוגל'?", options: ["Microwave", "Refrigerator", "Oven", "Stove"], correct: 0, explanation: "המילה 'Microwave' פירושה 'מיקרוגל'", category: "vocabulary" },
    { id: 2327, text: "What is the English word for 'כיור'?", options: ["Sink", "Refrigerator", "Oven", "Stove"], correct: 0, explanation: "המילה 'Sink' פירושה 'כיור'", category: "vocabulary" },
    { id: 2328, text: "What is the English word for 'מראה'?", options: ["Mirror", "Window", "Door", "Wall"], correct: 0, explanation: "המילה 'Mirror' פירושה 'מראה'", category: "vocabulary" },
    { id: 2329, text: "What is the English word for 'מתג'?", options: ["Switch", "Key", "Door", "Window"], correct: 0, explanation: "המילה 'Switch' פירושה 'מתג'", category: "vocabulary" },
    
    // קריאה - משפחה ובית
    { id: 2330, text: "Read: 'My family lives in a big house. We have three bedrooms, two bathrooms, a kitchen, and a living room.' How many bedrooms are in the house?", options: ["One", "Two", "Three", "Four"], correct: 2, explanation: "יש שלושה חדרי שינה בבית", category: "reading" },
    { id: 2331, text: "Read: 'My grandmother visits us every Sunday. She brings cookies and plays with us.' When does the grandmother visit?", options: ["Every day", "Every Sunday", "Every Monday", "Never"], correct: 1, explanation: "הסבתא מבקרת כל יום ראשון", category: "reading" },
    { id: 2332, text: "Read: 'My brother and I share a room. We have two beds, one closet, and one desk.' What do they share?", options: ["A bed", "A room", "A closet", "A desk"], correct: 1, explanation: "הם חולקים חדר", category: "reading" },
    { id: 2333, text: "Read: 'My mother cooks dinner in the kitchen. My father sets the table. I help my mother.' Who sets the table?", options: ["Mother", "Father", "I", "Brother"], correct: 1, explanation: "אבא עורך את השולחן", category: "reading" },
    { id: 2334, text: "Read: 'We eat dinner together in the dining room. After dinner, we watch TV in the living room.' Where do they eat dinner?", options: ["In the kitchen", "In the dining room", "In the living room", "In the bedroom"], correct: 1, explanation: "אוכלים ארוחת ערב בחדר האוכל", category: "reading" },
    
    // דקדוק - משפחה ובית
    { id: 2335, text: "Complete: 'My family ___ a big house.'", options: ["has", "have", "is", "are"], correct: 0, explanation: "למשפחה שלי יש בית גדול (family הוא יחיד)", category: "grammar" },
    { id: 2336, text: "Complete: 'My parents ___ at work.'", options: ["is", "are", "was", "were"], correct: 1, explanation: "ההורים שלי בעבודה (parents הוא רבים)", category: "grammar" },
    { id: 2337, text: "Complete: 'I ___ my room every Saturday.'", options: ["clean", "cleans", "cleaned", "cleaning"], correct: 0, explanation: "אני מנקה את החדר שלי כל שבת (הווה פשוט)", category: "grammar" },
    { id: 2338, text: "Complete: 'My sister ___ in her bedroom every night.'", options: ["sleep", "sleeps", "slept", "sleeping"], correct: 1, explanation: "האחות שלי ישנה בחדר השינה שלה כל לילה (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 2339, text: "Complete: 'We ___ dinner together every night.'", options: ["eat", "eats", "ate", "eating"], correct: 0, explanation: "אנחנו אוכלים ארוחת ערב יחד כל לילה (הווה פשוט, רבים)", category: "grammar" },
    
    // שאלות חזרה - מילים מתקדמות
    { id: 2340, text: "🔊 חזור אחרי הקריין: Nephew", options: ["Nephew", "Cousin", "Uncle", "Brother"], correct: 0, explanation: "Nephew - אחיין", category: "repeat" },
    { id: 2341, text: "🔊 חזור אחרי הקריין: Niece", options: ["Niece", "Cousin", "Aunt", "Sister"], correct: 0, explanation: "Niece - אחיינית", category: "repeat" },
    { id: 2342, text: "🔊 חזור אחרי הקריין: Grandparents", options: ["Grandparents", "Parents", "Uncles", "Aunts"], correct: 0, explanation: "Grandparents - סבים", category: "repeat" },
    { id: 2343, text: "🔊 חזור אחרי הקריין: Refrigerator", options: ["Refrigerator", "Oven", "Microwave", "Sink"], correct: 0, explanation: "Refrigerator - מקרר", category: "repeat" },
    { id: 2344, text: "🔊 חזור אחרי הקריין: Stove", options: ["Stove", "Refrigerator", "Oven", "Microwave"], correct: 0, explanation: "Stove - כיריים", category: "repeat" },
    { id: 2345, text: "🔊 חזור אחרי הקריין: Oven", options: ["Oven", "Refrigerator", "Stove", "Microwave"], correct: 0, explanation: "Oven - תנור", category: "repeat" },
    { id: 2346, text: "🔊 חזור אחרי הקריין: Microwave", options: ["Microwave", "Refrigerator", "Oven", "Stove"], correct: 0, explanation: "Microwave - מיקרוגל", category: "repeat" },
    { id: 2347, text: "🔊 חזור אחרי הקריין: Sink", options: ["Sink", "Refrigerator", "Oven", "Stove"], correct: 0, explanation: "Sink - כיור", category: "repeat" },
    { id: 2348, text: "🔊 חזור אחרי הקריין: Mirror", options: ["Mirror", "Window", "Door", "Wall"], correct: 0, explanation: "Mirror - מראה", category: "repeat" },
    { id: 2349, text: "🔊 חזור אחרי הקריין: Switch", options: ["Switch", "Key", "Door", "Window"], correct: 0, explanation: "Switch - מתג", category: "repeat" },
    { id: 2350, text: "🔊 חזור אחרי הקריין: Pan", options: ["Pan", "Plate", "Fork", "Spoon"], correct: 0, explanation: "Pan - מחבת", category: "repeat" },
    { id: 2351, text: "🔊 חזור אחרי הקריין: Spoon", options: ["Spoon", "Fork", "Knife", "Plate"], correct: 0, explanation: "Spoon - כף", category: "repeat" },
    { id: 2352, text: "🔊 חזור אחרי הקריין: Knife", options: ["Knife", "Fork", "Spoon", "Plate"], correct: 0, explanation: "Knife - סכין", category: "repeat" },
    { id: 2353, text: "🔊 חזור אחרי הקריין: Fork", options: ["Fork", "Spoon", "Knife", "Plate"], correct: 0, explanation: "Fork - מזלג", category: "repeat" },
    { id: 2354, text: "🔊 חזור אחרי הקריין: Plate", options: ["Plate", "Fork", "Spoon", "Knife"], correct: 0, explanation: "Plate - צלחת", category: "repeat" },
    { id: 2355, text: "🔊 חזור אחרי הקריין: Cup", options: ["Cup", "Plate", "Fork", "Spoon"], correct: 0, explanation: "Cup - כוס", category: "repeat" },
    { id: 2356, text: "🔊 חזור אחרי הקריין: Bookshelf", options: ["Bookshelf", "Closet", "Refrigerator", "Sink"], correct: 0, explanation: "Bookshelf - ספרייה", category: "repeat" },
    { id: 2357, text: "🔊 חזור אחרי הקריין: Garage", options: ["Garage", "Kitchen", "Bedroom", "Bathroom"], correct: 0, explanation: "Garage - מוסך", category: "repeat" },
    { id: 2358, text: "🔊 חזור אחרי הקריין: Study room", options: ["Study room", "Bedroom", "Kitchen", "Bathroom"], correct: 0, explanation: "Study room - חדר לימודים", category: "repeat" },
    { id: 2360, text: "🔊 חזור אחרי הקריין: Dining room", options: ["Dining room", "Living room", "Bedroom", "Kitchen"], correct: 0, explanation: "Dining room - חדר אוכל", category: "repeat" }
    ],
    '5': [ // רמה 5 - מומחה - משפחה ובית מומחה
    // משפחה - יחסים מורכבים מאוד
    { id: 2401, text: "Who is your mother's brother's wife?", options: ["Aunt", "Sister", "Mother", "Cousin"], correct: 0, explanation: "האישה של האח של אמא שלך היא הדודה שלך", category: "family" },
    { id: 2402, text: "Who is your father's sister's husband?", options: ["Uncle", "Brother", "Father", "Cousin"], correct: 0, explanation: "הבעל של האחות של אבא שלך הוא הדוד שלך", category: "family" },
    { id: 2403, text: "Who is your grandmother's daughter?", options: ["Aunt", "Mother", "Sister", "Cousin"], correct: 1, explanation: "הבת של הסבתא שלך היא אמא שלך", category: "family" },
    { id: 2404, text: "Who is your grandfather's son?", options: ["Uncle", "Father", "Brother", "Cousin"], correct: 1, explanation: "הבן של הסבא שלך הוא אבא שלך", category: "family" },
    { id: 2405, text: "What do you call your mother's parents?", options: ["Grandparents", "Parents", "Uncles", "Aunts"], correct: 0, explanation: "ההורים של אמא שלך הם הסבים שלך", category: "family" },
    { id: 2406, text: "What do you call your father's parents?", options: ["Grandparents", "Parents", "Uncles", "Aunts"], correct: 0, explanation: "ההורים של אבא שלך הם הסבים שלך", category: "family" },
    
    // בית - כלים ופעילויות מומחה
    { id: 2407, text: "What do you use to cook eggs?", options: ["Pan", "Refrigerator", "Oven", "Sink"], correct: 0, explanation: "משתמשים במחבת כדי לבשל ביצים", category: "house" },
    { id: 2408, text: "What do you use to bake a cake?", options: ["Oven", "Refrigerator", "Sink", "Microwave"], correct: 0, explanation: "משתמשים בתנור כדי לאפות עוגה", category: "house" },
    { id: 2409, text: "What do you use to heat food quickly?", options: ["Microwave", "Refrigerator", "Oven", "Sink"], correct: 0, explanation: "משתמשים במיקרוגל כדי לחמם אוכל במהירות", category: "house" },
    { id: 2410, text: "What do you use to wash your hands?", options: ["Sink", "Refrigerator", "Oven", "Microwave"], correct: 0, explanation: "משתמשים בכיור כדי לשטוף ידיים", category: "house" },
    { id: 2411, text: "Where do you keep your school books?", options: ["Bookshelf", "Refrigerator", "Oven", "Sink"], correct: 0, explanation: "שומרים את ספרי הלימוד על מדף ספרים", category: "house" },
    { id: 2412, text: "Where do you keep your car?", options: ["Garage", "Kitchen", "Bedroom", "Bathroom"], correct: 0, explanation: "שומרים את המכונית במוסך", category: "house" },
    { id: 2413, text: "What do you use to see yourself in the morning?", options: ["Mirror", "Window", "Door", "Wall"], correct: 0, explanation: "משתמשים במראה כדי לראות את עצמך בבוקר", category: "house" },
    { id: 2414, text: "What do you use to turn on the lights?", options: ["Switch", "Key", "Door", "Window"], correct: 0, explanation: "משתמשים במתג כדי להדליק את האורות", category: "house" },
    
    // פעילויות משפחתיות מומחה
    { id: 2415, text: "What do you do with your family on special occasions?", options: ["Nothing", "Celebrate and spend time together", "Ignore", "Avoid"], correct: 1, explanation: "באירועים מיוחדים חוגגים ומבלים יחד עם המשפחה", category: "family" },
    { id: 2416, text: "What do you do with your grandparents when they teach you?", options: ["Ignore", "Listen and learn from them", "Run away", "Sleep"], correct: 1, explanation: "כשהסבים מלמדים אותך, מקשיבים ולומדים מהם", category: "family" },
    { id: 2417, text: "What do you do with your parents when you have problems?", options: ["Hide", "Talk to them and ask for help", "Ignore", "Avoid"], correct: 1, explanation: "כשיש בעיות, מדברים עם ההורים ושואלים עזרה", category: "family" },
    { id: 2418, text: "What do you do with your siblings when you cooperate?", options: ["Fight", "Work together and help each other", "Ignore", "Avoid"], correct: 1, explanation: "משתפים פעולה עם האחים, עובדים יחד ועוזרים זה לזה", category: "family" },
    { id: 2419, text: "What do you do with your cousins when you have family gatherings?", options: ["Hide", "Play, talk, and have fun together", "Ignore", "Avoid"], correct: 1, explanation: "במפגשים משפחתיים, משחקים, מדברים ונהנים יחד עם בני הדודים", category: "family" },
    
    // אוצר מילים - משפחה ובית מומחה
    { id: 2420, text: "What is the English word for 'בן דוד'?", options: ["Cousin", "Brother", "Uncle", "Nephew"], correct: 0, explanation: "המילה 'Cousin' פירושה 'בן דוד/בת דודה'", category: "vocabulary" },
    { id: 2421, text: "What is the English word for 'אחיין'?", options: ["Nephew", "Cousin", "Uncle", "Brother"], correct: 0, explanation: "המילה 'Nephew' פירושה 'אחיין'", category: "vocabulary" },
    { id: 2422, text: "What is the English word for 'אחיינית'?", options: ["Niece", "Cousin", "Aunt", "Sister"], correct: 0, explanation: "המילה 'Niece' פירושה 'אחיינית'", category: "vocabulary" },
    { id: 2423, text: "What is the English word for 'סבים'?", options: ["Grandparents", "Parents", "Uncles", "Aunts"], correct: 0, explanation: "המילה 'Grandparents' פירושה 'סבים'", category: "vocabulary" },
    { id: 2424, text: "What is the English word for 'מקרר'?", options: ["Refrigerator", "Oven", "Microwave", "Sink"], correct: 0, explanation: "המילה 'Refrigerator' פירושה 'מקרר'", category: "vocabulary" },
    { id: 2425, text: "What is the English word for 'כיריים'?", options: ["Stove", "Refrigerator", "Oven", "Microwave"], correct: 0, explanation: "המילה 'Stove' פירושה 'כיריים'", category: "vocabulary" },
    { id: 2426, text: "What is the English word for 'תנור'?", options: ["Oven", "Refrigerator", "Stove", "Microwave"], correct: 0, explanation: "המילה 'Oven' פירושה 'תנור'", category: "vocabulary" },
    { id: 2427, text: "What is the English word for 'מיקרוגל'?", options: ["Microwave", "Refrigerator", "Oven", "Stove"], correct: 0, explanation: "המילה 'Microwave' פירושה 'מיקרוגל'", category: "vocabulary" },
    { id: 2428, text: "What is the English word for 'כיור'?", options: ["Sink", "Refrigerator", "Oven", "Stove"], correct: 0, explanation: "המילה 'Sink' פירושה 'כיור'", category: "vocabulary" },
    { id: 2429, text: "What is the English word for 'מראה'?", options: ["Mirror", "Window", "Door", "Wall"], correct: 0, explanation: "המילה 'Mirror' פירושה 'מראה'", category: "vocabulary" },
    
    // קריאה - משפחה ובית מומחה
    { id: 2430, text: "Read: 'My family has a tradition. Every Friday night, we eat dinner together in the dining room. After dinner, we play games in the living room.' When do they eat dinner together?", options: ["Every day", "Every Friday night", "Every Sunday", "Never"], correct: 1, explanation: "אוכלים ארוחת ערב יחד כל ליל שישי", category: "reading" },
    { id: 2431, text: "Read: 'My grandmother lives with us. She has her own bedroom. She likes to read in the living room.' Where does the grandmother like to read?", options: ["In her bedroom", "In the living room", "In the kitchen", "In the bathroom"], correct: 1, explanation: "הסבתא אוהבת לקרוא בסלון", category: "reading" },
    { id: 2432, text: "Read: 'My uncle and aunt visit us every month. They bring presents for me and my siblings. We play together in the garden.' Who brings presents?", options: ["Grandparents", "Uncle and aunt", "Cousins", "Friends"], correct: 1, explanation: "הדוד והדודה מביאים מתנות", category: "reading" },
    { id: 2433, text: "Read: 'My brother and I share a bedroom. We have two beds, one closet, and one desk. We study together at the desk.' What do they share?", options: ["A bed", "A room", "A closet", "A desk"], correct: 1, explanation: "הם חולקים חדר", category: "reading" },
    { id: 2434, text: "Read: 'My mother cooks dinner in the kitchen. My father helps her. I set the table. My sister washes the dishes after dinner.' Who washes the dishes?", options: ["Mother", "Father", "I", "Sister"], correct: 3, explanation: "האחות שוטפת את הכלים", category: "reading" },
    
    // דקדוק - משפחה ובית מומחה
    { id: 2435, text: "Complete: 'My family ___ a beautiful house.'", options: ["has", "have", "is", "are"], correct: 0, explanation: "למשפחה שלי יש בית יפה (family הוא יחיד)", category: "grammar" },
    { id: 2436, text: "Complete: 'My parents ___ at work during the day.'", options: ["is", "are", "was", "were"], correct: 1, explanation: "ההורים שלי בעבודה במהלך היום (parents הוא רבים)", category: "grammar" },
    { id: 2437, text: "Complete: 'I ___ my room every Saturday morning.'", options: ["clean", "cleans", "cleaned", "cleaning"], correct: 0, explanation: "אני מנקה את החדר שלי כל שבת בבוקר (הווה פשוט)", category: "grammar" },
    { id: 2438, text: "Complete: 'My sister ___ in her bedroom every night at 9 PM.'", options: ["sleep", "sleeps", "slept", "sleeping"], correct: 1, explanation: "האחות שלי ישנה בחדר השינה שלה כל לילה ב-9 בערב (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 2439, text: "Complete: 'We ___ dinner together every night at 7 PM.'", options: ["eat", "eats", "ate", "eating"], correct: 0, explanation: "אנחנו אוכלים ארוחת ערב יחד כל לילה ב-7 בערב (הווה פשוט, רבים)", category: "grammar" },
    
    // שאלות חזרה - מילים מומחה
    { id: 2440, text: "🔊 חזור אחרי הקריין: Cousin", options: ["Cousin", "Brother", "Sister", "Uncle"], correct: 0, explanation: "Cousin - בן דוד/בת דודה", category: "repeat" },
    { id: 2441, text: "🔊 חזור אחרי הקריין: Nephew", options: ["Nephew", "Cousin", "Uncle", "Brother"], correct: 0, explanation: "Nephew - אחיין", category: "repeat" },
    { id: 2442, text: "🔊 חזור אחרי הקריין: Niece", options: ["Niece", "Cousin", "Aunt", "Sister"], correct: 0, explanation: "Niece - אחיינית", category: "repeat" },
    { id: 2443, text: "🔊 חזור אחרי הקריין: Grandparents", options: ["Grandparents", "Parents", "Uncles", "Aunts"], correct: 0, explanation: "Grandparents - סבים", category: "repeat" },
    { id: 2444, text: "🔊 חזור אחרי הקריין: Refrigerator", options: ["Refrigerator", "Oven", "Microwave", "Sink"], correct: 0, explanation: "Refrigerator - מקרר", category: "repeat" },
    { id: 2445, text: "🔊 חזור אחרי הקריין: Stove", options: ["Stove", "Refrigerator", "Oven", "Microwave"], correct: 0, explanation: "Stove - כיריים", category: "repeat" },
    { id: 2446, text: "🔊 חזור אחרי הקריין: Oven", options: ["Oven", "Refrigerator", "Stove", "Microwave"], correct: 0, explanation: "Oven - תנור", category: "repeat" },
    { id: 2447, text: "🔊 חזור אחרי הקריין: Microwave", options: ["Microwave", "Refrigerator", "Oven", "Stove"], correct: 0, explanation: "Microwave - מיקרוגל", category: "repeat" },
    { id: 2448, text: "🔊 חזור אחרי הקריין: Sink", options: ["Sink", "Refrigerator", "Oven", "Stove"], correct: 0, explanation: "Sink - כיור", category: "repeat" },
    { id: 2449, text: "🔊 חזור אחרי הקריין: Mirror", options: ["Mirror", "Window", "Door", "Wall"], correct: 0, explanation: "Mirror - מראה", category: "repeat" },
    { id: 2450, text: "🔊 חזור אחרי הקריין: Switch", options: ["Switch", "Key", "Door", "Window"], correct: 0, explanation: "Switch - מתג", category: "repeat" },
    { id: 2451, text: "🔊 חזור אחרי הקריין: Pan", options: ["Pan", "Plate", "Fork", "Spoon"], correct: 0, explanation: "Pan - מחבת", category: "repeat" },
    { id: 2452, text: "🔊 חזור אחרי הקריין: Spoon", options: ["Spoon", "Fork", "Knife", "Plate"], correct: 0, explanation: "Spoon - כף", category: "repeat" },
    { id: 2453, text: "🔊 חזור אחרי הקריין: Knife", options: ["Knife", "Fork", "Spoon", "Plate"], correct: 0, explanation: "Knife - סכין", category: "repeat" },
    { id: 2454, text: "🔊 חזור אחרי הקריין: Fork", options: ["Fork", "Spoon", "Knife", "Plate"], correct: 0, explanation: "Fork - מזלג", category: "repeat" },
    { id: 2455, text: "🔊 חזור אחרי הקריין: Plate", options: ["Plate", "Fork", "Spoon", "Knife"], correct: 0, explanation: "Plate - צלחת", category: "repeat" },
    { id: 2456, text: "🔊 חזור אחרי הקריין: Cup", options: ["Cup", "Plate", "Fork", "Spoon"], correct: 0, explanation: "Cup - כוס", category: "repeat" },
    { id: 2457, text: "🔊 חזור אחרי הקריין: Bookshelf", options: ["Bookshelf", "Closet", "Refrigerator", "Sink"], correct: 0, explanation: "Bookshelf - ספרייה", category: "repeat" },
    { id: 2458, text: "🔊 חזור אחרי הקריין: Garage", options: ["Garage", "Kitchen", "Bedroom", "Bathroom"], correct: 0, explanation: "Garage - מוסך", category: "repeat" },
    { id: 2459, text: "🔊 חזור אחרי הקריין: Study room", options: ["Study room", "Bedroom", "Kitchen", "Bathroom"], correct: 0, explanation: "Study room - חדר לימודים", category: "repeat" },
    { id: 2460, text: "🔊 חזור אחרי הקריין: Dining room", options: ["Dining room", "Living room", "Bedroom", "Kitchen"], correct: 0, explanation: "Dining room - חדר אוכל", category: "repeat" }
    ]
  },
  '3': { // יחידה 3 - אוכל ושתייה
    '1': [ // רמה 1 - מתחילים - אוכל ושתייה בסיסיים
    // אוכל בסיסי
    { id: 3001, text: "What do you eat for breakfast?", options: ["Bread", "Shoes", "Car", "Book"], correct: 0, explanation: "אוכלים לחם לארוחת בוקר", category: "vocabulary" },
    { id: 3002, text: "What do you drink in the morning?", options: ["Milk", "Shoes", "Car", "Book"], correct: 0, explanation: "שותים חלב בבוקר", category: "vocabulary" },
    { id: 3003, text: "What comes from a chicken?", options: ["Milk", "Egg", "Bread", "Apple"], correct: 1, explanation: "ביצה באה מתרנגולת", category: "vocabulary" },
    { id: 3004, text: "What is red and round?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 0, explanation: "תפוח הוא אדום ועגול", category: "vocabulary" },
    { id: 3005, text: "What is yellow and long?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 1, explanation: "בננה היא צהובה וארוכה", category: "vocabulary" },
    { id: 3006, text: "What is orange and round?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 2, explanation: "תפוז הוא כתום ועגול", category: "vocabulary" },
    { id: 3007, text: "What do you put on bread?", options: ["Butter", "Shoes", "Car", "Book"], correct: 0, explanation: "שמים חמאה על לחם", category: "vocabulary" },
    { id: 3008, text: "What is white and comes from a cow?", options: ["Egg", "Milk", "Bread", "Apple"], correct: 1, explanation: "חלב הוא לבן ובא מפרה", category: "vocabulary" },
    
    // שתייה בסיסית
    { id: 3009, text: "What do you drink when you are thirsty?", options: ["Water", "Shoes", "Car", "Book"], correct: 0, explanation: "שותים מים כשרעבים", category: "drinks" },
    { id: 3010, text: "What do you drink that is hot?", options: ["Tea", "Ice", "Snow", "Wind"], correct: 0, explanation: "שותים תה שהוא חם", category: "drinks" },
    { id: 3011, text: "What do you drink that is cold?", options: ["Juice", "Fire", "Sun", "Hot"], correct: 0, explanation: "שותים מיץ שהוא קר", category: "drinks" },
    { id: 3012, text: "What do you drink with breakfast?", options: ["Coffee", "Shoes", "Car", "Book"], correct: 0, explanation: "שותים קפה עם ארוחת בוקר", category: "drinks" },
    
    // פירות בסיסיים
    { id: 3013, text: "What fruit is red?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 0, explanation: "תפוח הוא אדום", category: "fruits" },
    { id: 3014, text: "What fruit is yellow?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 1, explanation: "בננה היא צהובה", category: "fruits" },
    { id: 3015, text: "What fruit is orange?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 2, explanation: "תפוז הוא כתום", category: "fruits" },
    { id: 3016, text: "What fruit is purple?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 3, explanation: "ענב הוא סגול", category: "fruits" },
    
    // ירקות בסיסיים
    { id: 3017, text: "What vegetable is red?", options: ["Carrot", "Tomato", "Cucumber", "Lettuce"], correct: 1, explanation: "עגבנייה היא אדומה", category: "vegetables" },
    { id: 3018, text: "What vegetable is orange?", options: ["Carrot", "Tomato", "Cucumber", "Lettuce"], correct: 0, explanation: "גזר הוא כתום", category: "vegetables" },
    { id: 3019, text: "What vegetable is green?", options: ["Carrot", "Tomato", "Cucumber", "Potato"], correct: 2, explanation: "מלפפון הוא ירוק", category: "vegetables" },
    { id: 3020, text: "What vegetable is white?", options: ["Carrot", "Tomato", "Cucumber", "Potato"], correct: 3, explanation: "תפוח אדמה הוא לבן", category: "vegetables" },
    
    // פעילויות אוכל
    { id: 3021, text: "What do you do when you are hungry?", options: ["Sleep", "Eat", "Run", "Jump"], correct: 1, explanation: "כשרעבים, אוכלים", category: "vocabulary" },
    { id: 3022, text: "What do you do when you are thirsty?", options: ["Sleep", "Drink", "Run", "Jump"], correct: 1, explanation: "כשצמאים, שותים", category: "drinks" },
    { id: 3023, text: "Where do you eat lunch?", options: ["Kitchen", "Bedroom", "Bathroom", "Garage"], correct: 0, explanation: "אוכלים ארוחת צהריים במטבח", category: "vocabulary" },
    { id: 3024, text: "What do you use to eat soup?", options: ["Fork", "Spoon", "Knife", "Plate"], correct: 1, explanation: "משתמשים בכף כדי לאכול מרק", category: "vocabulary" },
    { id: 3025, text: "What do you use to cut food?", options: ["Fork", "Spoon", "Knife", "Plate"], correct: 2, explanation: "משתמשים בסכין כדי לחתוך אוכל", category: "vocabulary" },
    
    // אוצר מילים - אוכל בסיסי
    { id: 3026, text: "What is the English word for 'לחם'?", options: ["Bread", "Milk", "Egg", "Apple"], correct: 0, explanation: "המילה 'Bread' פירושה 'לחם'", category: "vocabulary" },
    { id: 3027, text: "What is the English word for 'חלב'?", options: ["Bread", "Milk", "Egg", "Apple"], correct: 1, explanation: "המילה 'Milk' פירושה 'חלב'", category: "vocabulary" },
    { id: 3028, text: "What is the English word for 'ביצה'?", options: ["Bread", "Milk", "Egg", "Apple"], correct: 2, explanation: "המילה 'Egg' פירושה 'ביצה'", category: "vocabulary" },
    { id: 3029, text: "What is the English word for 'תפוח'?", options: ["Bread", "Milk", "Egg", "Apple"], correct: 3, explanation: "המילה 'Apple' פירושה 'תפוח'", category: "vocabulary" },
    { id: 3030, text: "What is the English word for 'בננה'?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 1, explanation: "המילה 'Banana' פירושה 'בננה'", category: "vocabulary" },
    { id: 3031, text: "What is the English word for 'תפוז'?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 2, explanation: "המילה 'Orange' פירושה 'תפוז'", category: "vocabulary" },
    { id: 3032, text: "What is the English word for 'ענב'?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 3, explanation: "המילה 'Grape' פירושה 'ענב'", category: "vocabulary" },
    
    // אוצר מילים - שתייה
    { id: 3033, text: "What is the English word for 'מים'?", options: ["Water", "Milk", "Juice", "Tea"], correct: 0, explanation: "המילה 'Water' פירושה 'מים'", category: "vocabulary" },
    { id: 3034, text: "What is the English word for 'מיץ'?", options: ["Water", "Milk", "Juice", "Tea"], correct: 2, explanation: "המילה 'Juice' פירושה 'מיץ'", category: "vocabulary" },
    { id: 3035, text: "What is the English word for 'תה'?", options: ["Water", "Milk", "Juice", "Tea"], correct: 3, explanation: "המילה 'Tea' פירושה 'תה'", category: "vocabulary" },
    { id: 3036, text: "What is the English word for 'קפה'?", options: ["Water", "Milk", "Coffee", "Tea"], correct: 2, explanation: "המילה 'Coffee' פירושה 'קפה'", category: "vocabulary" },
    
    // קריאה - אוכל
    { id: 3037, text: "Read: 'I eat bread for breakfast. I drink milk.' What do you eat for breakfast?", options: ["Milk", "Bread", "Egg", "Apple"], correct: 1, explanation: "אוכלים לחם לארוחת בוקר", category: "reading" },
    { id: 3038, text: "Read: 'I like apples. Apples are red and sweet.' What color are apples?", options: ["Yellow", "Green", "Red", "Blue"], correct: 2, explanation: "תפוחים הם אדומים", category: "reading" },
    { id: 3039, text: "Read: 'I drink water when I am thirsty. Water is good for you.' When do you drink water?", options: ["When you are hungry", "When you are thirsty", "When you are tired", "When you are happy"], correct: 1, explanation: "שותים מים כשרעבים", category: "reading" },
    { id: 3040, text: "Read: 'I eat an apple. The apple is red.' What color is the apple?", options: ["Yellow", "Green", "Red", "Blue"], correct: 2, explanation: "התפוח הוא אדום", category: "reading" },
    
    // שאלות חזרה - מילים בסיסיות
    { id: 3041, text: "🔊 חזור אחרי הקריין: Bread", options: ["Bread", "Milk", "Egg", "Apple"], correct: 0, explanation: "Bread - לחם", category: "repeat" },
    { id: 3042, text: "🔊 חזור אחרי הקריין: Milk", options: ["Bread", "Milk", "Egg", "Apple"], correct: 1, explanation: "Milk - חלב", category: "repeat" },
    { id: 3043, text: "🔊 חזור אחרי הקריין: Egg", options: ["Bread", "Milk", "Egg", "Apple"], correct: 2, explanation: "Egg - ביצה", category: "repeat" },
    { id: 3044, text: "🔊 חזור אחרי הקריין: Apple", options: ["Apple", "Banana", "Orange", "Grape"], correct: 0, explanation: "Apple - תפוח", category: "repeat" },
    { id: 3045, text: "🔊 חזור אחרי הקריין: Banana", options: ["Apple", "Banana", "Orange", "Grape"], correct: 1, explanation: "Banana - בננה", category: "repeat" },
    { id: 3046, text: "🔊 חזור אחרי הקריין: Orange", options: ["Apple", "Banana", "Orange", "Grape"], correct: 2, explanation: "Orange - תפוז", category: "repeat" },
    { id: 3047, text: "🔊 חזור אחרי הקריין: Water", options: ["Water", "Milk", "Juice", "Tea"], correct: 0, explanation: "Water - מים", category: "repeat" },
    { id: 3048, text: "🔊 חזור אחרי הקריין: Juice", options: ["Water", "Milk", "Juice", "Tea"], correct: 2, explanation: "Juice - מיץ", category: "repeat" },
    { id: 3049, text: "🔊 חזור אחרי הקריין: Tea", options: ["Water", "Milk", "Juice", "Tea"], correct: 3, explanation: "Tea - תה", category: "repeat" },
    { id: 3050, text: "🔊 חזור אחרי הקריין: Coffee", options: ["Water", "Milk", "Coffee", "Tea"], correct: 2, explanation: "Coffee - קפה", category: "repeat" },
    { id: 3051, text: "🔊 חזור אחרי הקריין: Tomato", options: ["Carrot", "Tomato", "Cucumber", "Potato"], correct: 1, explanation: "Tomato - עגבנייה", category: "repeat" },
    { id: 3052, text: "🔊 חזור אחרי הקריין: Carrot", options: ["Carrot", "Tomato", "Cucumber", "Potato"], correct: 0, explanation: "Carrot - גזר", category: "repeat" },
    { id: 3053, text: "🔊 חזור אחרי הקריין: Spoon", options: ["Fork", "Spoon", "Knife", "Plate"], correct: 1, explanation: "Spoon - כף", category: "repeat" },
    { id: 3054, text: "🔊 חזור אחרי הקריין: Fork", options: ["Fork", "Spoon", "Knife", "Plate"], correct: 0, explanation: "Fork - מזלג", category: "repeat" },
    { id: 3055, text: "🔊 חזור אחרי הקריין: Knife", options: ["Knife", "Fork", "Spoon", "Plate"], correct: 0, explanation: "Knife - סכין", category: "repeat" },
    { id: 3056, text: "🔊 חזור אחרי הקריין: Plate", options: ["Plate", "Fork", "Spoon", "Knife"], correct: 0, explanation: "Plate - צלחת", category: "repeat" },
    { id: 3057, text: "🔊 חזור אחרי הקריין: Cup", options: ["Cup", "Plate", "Fork", "Spoon"], correct: 0, explanation: "Cup - כוס", category: "repeat" },
    { id: 3058, text: "🔊 חזור אחרי הקריין: Eat", options: ["Eat", "Drink", "Sleep", "Run"], correct: 0, explanation: "Eat - לאכול", category: "repeat" },
    { id: 3059, text: "🔊 חזור אחרי הקריין: Drink", options: ["Eat", "Drink", "Sleep", "Run"], correct: 1, explanation: "Drink - לשתות", category: "repeat" },
    { id: 3060, text: "🔊 חזור אחרי הקריין: Hungry", options: ["Hungry", "Thirsty", "Tired", "Happy"], correct: 0, explanation: "Hungry - רעב", category: "repeat" }
    ],
    '2': [ // רמה 2 - בסיסי - אוכל ושתייה מורחבים
    // אוכל מורחב
    { id: 3101, text: "What do you eat for lunch?", options: ["Sandwich", "Shoes", "Car", "Book"], correct: 0, explanation: "אוכלים כריך לארוחת צהריים", category: "vocabulary" },
    { id: 3102, text: "What do you eat for dinner?", options: ["Chicken", "Shoes", "Car", "Book"], correct: 0, explanation: "אוכלים עוף לארוחת ערב", category: "vocabulary" },
    { id: 3103, text: "What do you put on a sandwich?", options: ["Cheese", "Shoes", "Car", "Book"], correct: 0, explanation: "שמים גבינה על כריך", category: "vocabulary" },
    { id: 3104, text: "What is sweet and you eat for dessert?", options: ["Cake", "Shoes", "Car", "Book"], correct: 0, explanation: "עוגה היא מתוקה ואוכלים אותה לקינוח", category: "vocabulary" },
    { id: 3105, text: "What is cold and sweet?", options: ["Ice cream", "Fire", "Sun", "Hot"], correct: 0, explanation: "גלידה היא קרה ומתוקה", category: "vocabulary" },
    { id: 3106, text: "What do you eat with rice?", options: ["Fish", "Shoes", "Car", "Book"], correct: 0, explanation: "אוכלים דג עם אורז", category: "vocabulary" },
    { id: 3107, text: "What is round and you put on pizza?", options: ["Cheese", "Shoes", "Car", "Book"], correct: 0, explanation: "גבינה היא עגולה ושמים אותה על פיצה", category: "vocabulary" },
    { id: 3108, text: "What do you eat that is made from potatoes?", options: ["French fries", "Shoes", "Car", "Book"], correct: 0, explanation: "צ'יפס עשוי מתפוחי אדמה", category: "vocabulary" },
    
    // שתייה מורחבת
    { id: 3109, text: "What do you drink that is cold and sweet?", options: ["Lemonade", "Fire", "Sun", "Hot"], correct: 0, explanation: "לימונדה היא קרה ומתוקה", category: "drinks" },
    { id: 3110, text: "What do you drink that is hot in winter?", options: ["Hot chocolate", "Ice", "Snow", "Wind"], correct: 0, explanation: "שוקו חם הוא חם בחורף", category: "drinks" },
    { id: 3111, text: "What do you drink that is fizzy?", options: ["Soda", "Water", "Milk", "Tea"], correct: 0, explanation: "משקה מוגז הוא מוגז", category: "drinks" },
    { id: 3112, text: "What do you drink that is made from fruits?", options: ["Fruit juice", "Water", "Milk", "Tea"], correct: 0, explanation: "מיץ פירות עשוי מפירות", category: "drinks" },
    
    // פירות מורחבים
    { id: 3113, text: "What fruit is green and sour?", options: ["Apple", "Banana", "Lemon", "Grape"], correct: 2, explanation: "לימון הוא ירוק וחמוץ", category: "fruits" },
    { id: 3114, text: "What fruit is red and has seeds?", options: ["Apple", "Strawberry", "Orange", "Grape"], correct: 1, explanation: "תות שדה הוא אדום ויש לו זרעים", category: "fruits" },
    { id: 3115, text: "What fruit is yellow and sour?", options: ["Apple", "Banana", "Lemon", "Grape"], correct: 2, explanation: "לימון הוא צהוב וחמוץ", category: "fruits" },
    { id: 3116, text: "What fruit is pink and sweet?", options: ["Apple", "Banana", "Peach", "Grape"], correct: 2, explanation: "אפרסק הוא ורוד ומתוק", category: "fruits" },
    
    // ירקות מורחבים
    { id: 3117, text: "What vegetable is green and long?", options: ["Carrot", "Tomato", "Cucumber", "Potato"], correct: 2, explanation: "מלפפון הוא ירוק וארוך", category: "vegetables" },
    { id: 3118, text: "What vegetable is green and you put in salad?", options: ["Carrot", "Tomato", "Lettuce", "Potato"], correct: 2, explanation: "חסה היא ירוקה ושמים אותה בסלט", category: "vegetables" },
    { id: 3119, text: "What vegetable is red and round?", options: ["Carrot", "Tomato", "Cucumber", "Potato"], correct: 1, explanation: "עגבנייה היא אדומה ועגולה", category: "vegetables" },
    { id: 3120, text: "What vegetable is orange and long?", options: ["Carrot", "Tomato", "Cucumber", "Potato"], correct: 0, explanation: "גזר הוא כתום וארוך", category: "vegetables" },
    
    // פעילויות אוכל מורחבות
    { id: 3121, text: "What do you do before you eat?", options: ["Wash your hands", "Sleep", "Run", "Jump"], correct: 0, explanation: "שוטפים ידיים לפני האוכל", category: "vocabulary" },
    { id: 3122, text: "What do you do after you eat?", options: ["Wash the dishes", "Sleep", "Run", "Jump"], correct: 0, explanation: "שוטפים כלים אחרי האוכל", category: "vocabulary" },
    { id: 3123, text: "Where do you buy food?", options: ["Supermarket", "School", "Park", "Library"], correct: 0, explanation: "קונים אוכל בסופרמרקט", category: "vocabulary" },
    { id: 3124, text: "What do you use to eat pasta?", options: ["Fork", "Spoon", "Knife", "Plate"], correct: 0, explanation: "משתמשים במזלג כדי לאכול פסטה", category: "vocabulary" },
    { id: 3125, text: "What do you put food on?", options: ["Plate", "Fork", "Spoon", "Knife"], correct: 0, explanation: "שמים אוכל על צלחת", category: "vocabulary" },
    
    // אוצר מילים - אוכל מורחב
    { id: 3126, text: "What is the English word for 'כריך'?", options: ["Sandwich", "Bread", "Cheese", "Butter"], correct: 0, explanation: "המילה 'Sandwich' פירושה 'כריך'", category: "vocabulary" },
    { id: 3127, text: "What is the English word for 'עוגה'?", options: ["Cake", "Bread", "Cookie", "Candy"], correct: 0, explanation: "המילה 'Cake' פירושה 'עוגה'", category: "vocabulary" },
    { id: 3128, text: "What is the English word for 'גלידה'?", options: ["Ice cream", "Cake", "Cookie", "Candy"], correct: 0, explanation: "המילה 'Ice cream' פירושה 'גלידה'", category: "vocabulary" },
    { id: 3129, text: "What is the English word for 'גבינה'?", options: ["Cheese", "Butter", "Milk", "Yogurt"], correct: 0, explanation: "המילה 'Cheese' פירושה 'גבינה'", category: "vocabulary" },
    { id: 3130, text: "What is the English word for 'עוף'?", options: ["Chicken", "Fish", "Meat", "Egg"], correct: 0, explanation: "המילה 'Chicken' פירושה 'עוף'", category: "vocabulary" },
    { id: 3131, text: "What is the English word for 'דג'?", options: ["Chicken", "Fish", "Meat", "Egg"], correct: 1, explanation: "המילה 'Fish' פירושה 'דג'", category: "vocabulary" },
    { id: 3132, text: "What is the English word for 'אורז'?", options: ["Rice", "Bread", "Pasta", "Potato"], correct: 0, explanation: "המילה 'Rice' פירושה 'אורז'", category: "vocabulary" },
    { id: 3133, text: "What is the English word for 'פסטה'?", options: ["Rice", "Bread", "Pasta", "Potato"], correct: 2, explanation: "המילה 'Pasta' פירושה 'פסטה'", category: "vocabulary" },
    
    // אוצר מילים - שתייה מורחב
    { id: 3134, text: "What is the English word for 'לימונדה'?", options: ["Lemonade", "Juice", "Soda", "Water"], correct: 0, explanation: "המילה 'Lemonade' פירושה 'לימונדה'", category: "vocabulary" },
    { id: 3135, text: "What is the English word for 'משקה מוגז'?", options: ["Lemonade", "Juice", "Soda", "Water"], correct: 2, explanation: "המילה 'Soda' פירושה 'משקה מוגז'", category: "vocabulary" },
    { id: 3136, text: "What is the English word for 'שוקו חם'?", options: ["Hot chocolate", "Coffee", "Tea", "Milk"], correct: 0, explanation: "המילה 'Hot chocolate' פירושה 'שוקו חם'", category: "vocabulary" },
    
    // קריאה - אוכל מורחב
    { id: 3137, text: "Read: 'I eat a sandwich for lunch. I put cheese and tomato on my sandwich.' What do you put on a sandwich?", options: ["Bread", "Cheese and tomato", "Shoes", "Car"], correct: 1, explanation: "שמים גבינה ועגבנייה על כריך", category: "reading" },
    { id: 3138, text: "Read: 'I like ice cream. Ice cream is cold and sweet.' What is ice cream?", options: ["Hot", "Cold and sweet", "Sour", "Bitter"], correct: 1, explanation: "גלידה היא קרה ומתוקה", category: "reading" },
    { id: 3139, text: "Read: 'I drink lemonade in summer. Lemonade is cold and refreshing.' When do you drink lemonade?", options: ["In winter", "In summer", "In spring", "In fall"], correct: 1, explanation: "שותים לימונדה בקיץ", category: "reading" },
    { id: 3140, text: "Read: 'I eat chicken for dinner. Chicken is good for you.' What do you eat for dinner?", options: ["Fish", "Chicken", "Bread", "Apple"], correct: 1, explanation: "אוכלים עוף לארוחת ערב", category: "reading" },
    
    // דקדוק בסיסי - אוכל
    { id: 3141, text: "Complete: 'I ___ an apple every day.'", options: ["eat", "eats", "ate", "eating"], correct: 0, explanation: "אני אוכל תפוח כל יום (הווה פשוט)", category: "grammar" },
    { id: 3142, text: "Complete: 'She ___ milk in the morning.'", options: ["drink", "drinks", "drank", "drinking"], correct: 1, explanation: "היא שותה חלב בבוקר (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 3143, text: "Complete: 'We ___ lunch at 12 o'clock.'", options: ["eat", "eats", "ate", "eating"], correct: 0, explanation: "אנחנו אוכלים ארוחת צהריים ב-12 (הווה פשוט, רבים)", category: "grammar" },
    { id: 3144, text: "Complete: 'They ___ water when they are thirsty.'", options: ["drink", "drinks", "drank", "drinking"], correct: 0, explanation: "הם שותים מים כשרעבים (הווה פשוט, רבים)", category: "grammar" },
    { id: 3145, text: "Complete: 'He ___ breakfast every morning.'", options: ["eat", "eats", "ate", "eating"], correct: 1, explanation: "הוא אוכל ארוחת בוקר כל בוקר (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    
    // שאלות חזרה - מילים מורחבות
    { id: 3146, text: "🔊 חזור אחרי הקריין: Sandwich", options: ["Sandwich", "Bread", "Cheese", "Butter"], correct: 0, explanation: "Sandwich - כריך", category: "repeat" },
    { id: 3147, text: "🔊 חזור אחרי הקריין: Cake", options: ["Cake", "Bread", "Cookie", "Candy"], correct: 0, explanation: "Cake - עוגה", category: "repeat" },
    { id: 3148, text: "🔊 חזור אחרי הקריין: Ice cream", options: ["Ice cream", "Cake", "Cookie", "Candy"], correct: 0, explanation: "Ice cream - גלידה", category: "repeat" },
    { id: 3149, text: "🔊 חזור אחרי הקריין: Cheese", options: ["Cheese", "Butter", "Milk", "Yogurt"], correct: 0, explanation: "Cheese - גבינה", category: "repeat" },
    { id: 3150, text: "🔊 חזור אחרי הקריין: Chicken", options: ["Chicken", "Fish", "Meat", "Egg"], correct: 0, explanation: "Chicken - עוף", category: "repeat" },
    { id: 3151, text: "🔊 חזור אחרי הקריין: Fish", options: ["Chicken", "Fish", "Meat", "Egg"], correct: 1, explanation: "Fish - דג", category: "repeat" },
    { id: 3152, text: "🔊 חזור אחרי הקריין: Rice", options: ["Rice", "Bread", "Pasta", "Potato"], correct: 0, explanation: "Rice - אורז", category: "repeat" },
    { id: 3153, text: "🔊 חזור אחרי הקריין: Pasta", options: ["Rice", "Bread", "Pasta", "Potato"], correct: 2, explanation: "Pasta - פסטה", category: "repeat" },
    { id: 3154, text: "🔊 חזור אחרי הקריין: Lemonade", options: ["Lemonade", "Juice", "Soda", "Water"], correct: 0, explanation: "Lemonade - לימונדה", category: "repeat" },
    { id: 3155, text: "🔊 חזור אחרי הקריין: Soda", options: ["Lemonade", "Juice", "Soda", "Water"], correct: 2, explanation: "Soda - משקה מוגז", category: "repeat" },
    { id: 3156, text: "🔊 חזור אחרי הקריין: Hot chocolate", options: ["Hot chocolate", "Coffee", "Tea", "Milk"], correct: 0, explanation: "Hot chocolate - שוקו חם", category: "repeat" },
    { id: 3157, text: "🔊 חזור אחרי הקריין: Strawberry", options: ["Apple", "Strawberry", "Orange", "Grape"], correct: 1, explanation: "Strawberry - תות", category: "repeat" },
    { id: 3158, text: "🔊 חזור אחרי הקריין: Lemon", options: ["Apple", "Banana", "Lemon", "Grape"], correct: 2, explanation: "Lemon - לימון", category: "repeat" },
    { id: 3159, text: "🔊 חזור אחרי הקריין: Peach", options: ["Apple", "Banana", "Peach", "Grape"], correct: 2, explanation: "Peach - אפרסק", category: "repeat" },
    { id: 3160, text: "🔊 חזור אחרי הקריין: Thirsty", options: ["Hungry", "Thirsty", "Tired", "Happy"], correct: 1, explanation: "Thirsty - צמא", category: "repeat" }
    ],
    '3': [ // רמה 3 - בינוני - אוכל ושתייה מתקדמים
    // אוכל מתקדם
    { id: 3201, text: "What do you eat that is made from flour?", options: ["Pizza", "Shoes", "Car", "Book"], correct: 0, explanation: "פיצה עשויה מקמח", category: "vocabulary" },
    { id: 3202, text: "What do you eat that is made from meat?", options: ["Hamburger", "Shoes", "Car", "Book"], correct: 0, explanation: "המבורגר עשוי מבשר", category: "vocabulary" },
    { id: 3203, text: "What do you eat that is sweet and brown?", options: ["Chocolate", "Shoes", "Car", "Book"], correct: 0, explanation: "שוקולד הוא מתוק וחום", category: "vocabulary" },
    { id: 3204, text: "What do you eat that is crunchy?", options: ["Chips", "Shoes", "Car", "Book"], correct: 0, explanation: "צ'יפס הוא פריך", category: "vocabulary" },
    { id: 3205, text: "What do you eat that is soft and white?", options: ["Yogurt", "Shoes", "Car", "Book"], correct: 0, explanation: "יוגורט הוא רך ולבן", category: "vocabulary" },
    { id: 3206, text: "What do you eat that is round and flat?", options: ["Pancake", "Shoes", "Car", "Book"], correct: 0, explanation: "פנקייק הוא עגול ושטוח", category: "vocabulary" },
    { id: 3207, text: "What do you eat that is made from eggs?", options: ["Omelet", "Shoes", "Car", "Book"], correct: 0, explanation: "חביתה עשויה מביצים", category: "vocabulary" },
    { id: 3208, text: "What do you eat that is sweet and sticky?", options: ["Honey", "Shoes", "Car", "Book"], correct: 0, explanation: "דבש הוא מתוק ודביק", category: "vocabulary" },
    
    // שתייה מתקדמת
    { id: 3209, text: "What do you drink that is made from coffee beans?", options: ["Coffee", "Tea", "Juice", "Water"], correct: 0, explanation: "קפה עשוי מפולי קפה", category: "drinks" },
    { id: 3210, text: "What do you drink that is made from tea leaves?", options: ["Coffee", "Tea", "Juice", "Water"], correct: 1, explanation: "תה עשוי מעלי תה", category: "drinks" },
    { id: 3211, text: "What do you drink that is made from oranges?", options: ["Orange juice", "Apple juice", "Grape juice", "Water"], correct: 0, explanation: "מיץ תפוזים עשוי מתפוזים", category: "drinks" },
    { id: 3212, text: "What do you drink that is made from apples?", options: ["Orange juice", "Apple juice", "Grape juice", "Water"], correct: 1, explanation: "מיץ תפוחים עשוי מתפוחים", category: "drinks" },
    
    // פירות מתקדמים
    { id: 3213, text: "What fruit is purple and small?", options: ["Apple", "Banana", "Grape", "Orange"], correct: 2, explanation: "ענב הוא סגול וקטן", category: "fruits" },
    { id: 3214, text: "What fruit is green and has a big seed?", options: ["Apple", "Avocado", "Orange", "Grape"], correct: 1, explanation: "אבוקדו הוא ירוק ויש לו גלעין גדול", category: "fruits" },
    { id: 3215, text: "What fruit is red and has many seeds?", options: ["Apple", "Watermelon", "Orange", "Grape"], correct: 1, explanation: "אבטיח הוא אדום ויש לו הרבה זרעים", category: "fruits" },
    { id: 3216, text: "What fruit is yellow and sour?", options: ["Apple", "Banana", "Lemon", "Grape"], correct: 2, explanation: "לימון הוא צהוב וחמוץ", category: "fruits" },
    
    // ירקות מתקדמים
    { id: 3217, text: "What vegetable is purple and round?", options: ["Carrot", "Tomato", "Eggplant", "Potato"], correct: 2, explanation: "חציל הוא סגול ועגול", category: "vegetables" },
    { id: 3218, text: "What vegetable is green and looks like a tree?", options: ["Carrot", "Broccoli", "Cucumber", "Potato"], correct: 1, explanation: "ברוקולי הוא ירוק ונראה כמו עץ", category: "vegetables" },
    { id: 3219, text: "What vegetable is white and makes you cry?", options: ["Carrot", "Tomato", "Onion", "Potato"], correct: 2, explanation: "בצל הוא לבן וגורם לבכות", category: "vegetables" },
    { id: 3220, text: "What vegetable is green and long?", options: ["Carrot", "Tomato", "Green bean", "Potato"], correct: 2, explanation: "שעועית ירוקה היא ירוקה וארוכה", category: "vegetables" },
    
    // פעילויות אוכל מתקדמות
    { id: 3221, text: "What do you do when you cook?", options: ["Make food", "Sleep", "Run", "Jump"], correct: 0, explanation: "כשמבשלים, מכינים אוכל", category: "vocabulary" },
    { id: 3222, text: "What do you do when you bake?", options: ["Make cakes", "Sleep", "Run", "Jump"], correct: 0, explanation: "כשאופים, מכינים עוגות", category: "vocabulary" },
    { id: 3223, text: "Where do you eat in a restaurant?", options: ["At a table", "On the floor", "In the car", "In bed"], correct: 0, explanation: "אוכלים ליד שולחן במסעדה", category: "vocabulary" },
    { id: 3224, text: "What do you say when you finish eating?", options: ["Thank you", "Hello", "Goodbye", "Sorry"], correct: 0, explanation: "אומרים תודה כשמסיימים לאכול", category: "vocabulary" },
    { id: 3225, text: "What do you do with food you don't like?", options: ["Don't eat it", "Eat it anyway", "Throw it away", "Give it to someone"], correct: 0, explanation: "לא אוכלים אוכל שלא אוהבים", category: "vocabulary" },
    
    // אוצר מילים - אוכל מתקדם
    { id: 3226, text: "What is the English word for 'פיצה'?", options: ["Pizza", "Bread", "Pasta", "Rice"], correct: 0, explanation: "המילה 'Pizza' פירושה 'פיצה'", category: "vocabulary" },
    { id: 3227, text: "What is the English word for 'המבורגר'?", options: ["Hamburger", "Sandwich", "Pizza", "Hot dog"], correct: 0, explanation: "המילה 'Hamburger' פירושה 'המבורגר'", category: "vocabulary" },
    { id: 3228, text: "What is the English word for 'שוקולד'?", options: ["Chocolate", "Cake", "Cookie", "Candy"], correct: 0, explanation: "המילה 'Chocolate' פירושה 'שוקולד'", category: "vocabulary" },
    { id: 3229, text: "What is the English word for 'צ'יפס'?", options: ["Chips", "French fries", "Potato", "Rice"], correct: 0, explanation: "המילה 'Chips' פירושה 'צ'יפס'", category: "vocabulary" },
    { id: 3230, text: "What is the English word for 'יוגורט'?", options: ["Yogurt", "Milk", "Cheese", "Butter"], correct: 0, explanation: "המילה 'Yogurt' פירושה 'יוגורט'", category: "vocabulary" },
    { id: 3231, text: "What is the English word for 'פנקייק'?", options: ["Pancake", "Cake", "Cookie", "Bread"], correct: 0, explanation: "המילה 'Pancake' פירושה 'פנקייק'", category: "vocabulary" },
    { id: 3232, text: "What is the English word for 'חביתה'?", options: ["Omelet", "Egg", "Chicken", "Fish"], correct: 0, explanation: "המילה 'Omelet' פירושה 'חביתה'", category: "vocabulary" },
    { id: 3233, text: "What is the English word for 'דבש'?", options: ["Honey", "Sugar", "Salt", "Pepper"], correct: 0, explanation: "המילה 'Honey' פירושה 'דבש'", category: "vocabulary" },
    
    // קריאה - אוכל מתקדם
    { id: 3234, text: "Read: 'I like pizza. Pizza has cheese and tomato on it.' What does pizza have on it?", options: ["Bread", "Cheese and tomato", "Shoes", "Car"], correct: 1, explanation: "לפיצה יש גבינה ועגבנייה עליה", category: "reading" },
    { id: 3235, text: "Read: 'I eat chocolate. Chocolate is sweet and brown.' What color is chocolate?", options: ["Red", "Yellow", "Brown", "Green"], correct: 2, explanation: "שוקולד הוא חום", category: "reading" },
    { id: 3236, text: "Read: 'I drink coffee in the morning. Coffee helps me wake up.' When do you drink coffee?", options: ["In the evening", "In the morning", "At night", "In the afternoon"], correct: 1, explanation: "שותים קפה בבוקר", category: "reading" },
    { id: 3237, text: "Read: 'I cook dinner with my mother. We make chicken and rice.' What do you make for dinner?", options: ["Fish", "Chicken and rice", "Bread", "Apple"], correct: 1, explanation: "מכינים עוף ואורז לארוחת ערב", category: "reading" },
    
    // דקדוק - אוכל מתקדם
    { id: 3238, text: "Complete: 'I ___ pizza for dinner yesterday.'", options: ["eat", "eats", "ate", "eating"], correct: 2, explanation: "אכלתי פיצה לארוחת ערב אתמול (עבר פשוט)", category: "grammar" },
    { id: 3239, text: "Complete: 'She ___ coffee every morning.'", options: ["drink", "drinks", "drank", "drinking"], correct: 1, explanation: "היא שותה קפה כל בוקר (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 3240, text: "Complete: 'We ___ cooking dinner now.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו מבשלים ארוחת ערב עכשיו (הווה מתמשך, רבים)", category: "grammar" },
    { id: 3241, text: "Complete: 'They ___ hungry after school.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "הם רעבים אחרי בית ספר (הווה פשוט, רבים)", category: "grammar" },
    { id: 3242, text: "Complete: 'He ___ breakfast at 8 AM.'", options: ["eat", "eats", "ate", "eating"], correct: 1, explanation: "הוא אוכל ארוחת בוקר ב-8 בבוקר (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    
    // שאלות חזרה - מילים מתקדמות
    { id: 3243, text: "🔊 חזור אחרי הקריין: Pizza", options: ["Pizza", "Bread", "Pasta", "Rice"], correct: 0, explanation: "Pizza - פיצה", category: "repeat" },
    { id: 3244, text: "🔊 חזור אחרי הקריין: Hamburger", options: ["Hamburger", "Sandwich", "Pizza", "Hot dog"], correct: 0, explanation: "Hamburger - המבורגר", category: "repeat" },
    { id: 3245, text: "🔊 חזור אחרי הקריין: Chocolate", options: ["Chocolate", "Cake", "Cookie", "Candy"], correct: 0, explanation: "Chocolate - שוקולד", category: "repeat" },
    { id: 3246, text: "🔊 חזור אחרי הקריין: Chips", options: ["Chips", "French fries", "Potato", "Rice"], correct: 0, explanation: "Chips - צ'יפס", category: "repeat" },
    { id: 3247, text: "🔊 חזור אחרי הקריין: Yogurt", options: ["Yogurt", "Milk", "Cheese", "Butter"], correct: 0, explanation: "Yogurt - יוגורט", category: "repeat" },
    { id: 3248, text: "🔊 חזור אחרי הקריין: Pancake", options: ["Pancake", "Cake", "Cookie", "Bread"], correct: 0, explanation: "Pancake - פנקייק", category: "repeat" },
    { id: 3249, text: "🔊 חזור אחרי הקריין: Omelet", options: ["Omelet", "Egg", "Chicken", "Fish"], correct: 0, explanation: "Omelet - חביתה", category: "repeat" },
    { id: 3250, text: "🔊 חזור אחרי הקריין: Honey", options: ["Honey", "Sugar", "Salt", "Pepper"], correct: 0, explanation: "Honey - דבש", category: "repeat" },
    { id: 3251, text: "🔊 חזור אחרי הקריין: Coffee", options: ["Coffee", "Tea", "Juice", "Water"], correct: 0, explanation: "Coffee - קפה", category: "repeat" },
    { id: 3252, text: "🔊 חזור אחרי הקריין: Orange juice", options: ["Orange juice", "Apple juice", "Grape juice", "Water"], correct: 0, explanation: "Orange juice - מיץ תפוזים", category: "repeat" },
    { id: 3253, text: "🔊 חזור אחרי הקריין: Apple juice", options: ["Orange juice", "Apple juice", "Grape juice", "Water"], correct: 1, explanation: "Apple juice - מיץ תפוחים", category: "repeat" },
    { id: 3254, text: "🔊 חזור אחרי הקריין: Watermelon", options: ["Apple", "Watermelon", "Orange", "Grape"], correct: 1, explanation: "Watermelon - אבטיח", category: "repeat" },
    { id: 3255, text: "🔊 חזור אחרי הקריין: Avocado", options: ["Apple", "Avocado", "Orange", "Grape"], correct: 1, explanation: "Avocado - אבוקדו", category: "repeat" },
    { id: 3256, text: "🔊 חזור אחרי הקריין: Eggplant", options: ["Carrot", "Tomato", "Eggplant", "Potato"], correct: 2, explanation: "Eggplant - חציל", category: "repeat" },
    { id: 3257, text: "🔊 חזור אחרי הקריין: Broccoli", options: ["Carrot", "Broccoli", "Cucumber", "Potato"], correct: 1, explanation: "Broccoli - ברוקולי", category: "repeat" },
    { id: 3258, text: "🔊 חזור אחרי הקריין: Onion", options: ["Carrot", "Tomato", "Onion", "Potato"], correct: 2, explanation: "Onion - בצל", category: "repeat" },
    { id: 3259, text: "🔊 חזור אחרי הקריין: Cook", options: ["Cook", "Eat", "Drink", "Sleep"], correct: 0, explanation: "Cook - לבשל", category: "repeat" },
    { id: 3260, text: "🔊 חזור אחרי הקריין: Bake", options: ["Bake", "Cook", "Eat", "Drink"], correct: 0, explanation: "Bake - לאפות", category: "repeat" }
    ],
    '4': [ // רמה 4 - מתקדם - אוכל ושתייה מתקדמים מאוד
    // אוכל מתקדם מאוד
    { id: 3301, text: "What do you eat that is spicy?", options: ["Curry", "Ice cream", "Cake", "Bread"], correct: 0, explanation: "קארי הוא חריף", category: "vocabulary" },
    { id: 3302, text: "What do you eat that is salty?", options: ["Pretzels", "Cake", "Candy", "Honey"], correct: 0, explanation: "בייגלה הוא מלוח", category: "vocabulary" },
    { id: 3303, text: "What do you eat that is sour?", options: ["Pickles", "Cake", "Candy", "Honey"], correct: 0, explanation: "חמוצים הם חמוצים", category: "vocabulary" },
    { id: 3304, text: "What do you eat that is bitter?", options: ["Dark chocolate", "Cake", "Candy", "Honey"], correct: 0, explanation: "שוקולד מריר הוא מר", category: "vocabulary" },
    { id: 3305, text: "What do you eat that is healthy?", options: ["Salad", "Cake", "Candy", "Chips"], correct: 0, explanation: "סלט הוא בריא", category: "vocabulary" },
    { id: 3306, text: "What do you eat that is unhealthy?", options: ["Candy", "Salad", "Fruit", "Vegetables"], correct: 0, explanation: "ממתק הוא לא בריא", category: "vocabulary" },
    { id: 3307, text: "What do you eat that is made from wheat?", options: ["Pasta", "Rice", "Potato", "Corn"], correct: 0, explanation: "פסטה עשויה מחיטה", category: "vocabulary" },
    { id: 3308, text: "What do you eat that is made from milk?", options: ["Cheese", "Bread", "Rice", "Potato"], correct: 0, explanation: "גבינה עשויה מחלב", category: "vocabulary" },
    
    // שתייה מתקדמת מאוד
    { id: 3309, text: "What do you drink that is healthy?", options: ["Green tea", "Soda", "Coffee", "Energy drink"], correct: 0, explanation: "תה ירוק הוא בריא", category: "drinks" },
    { id: 3310, text: "What do you drink that is unhealthy?", options: ["Soda", "Water", "Juice", "Tea"], correct: 0, explanation: "משקה מוגז הוא לא בריא", category: "drinks" },
    { id: 3311, text: "What do you drink that is made from milk?", options: ["Milkshake", "Water", "Juice", "Tea"], correct: 0, explanation: "מילקשייק עשוי מחלב", category: "drinks" },
    { id: 3312, text: "What do you drink that is made from lemons?", options: ["Lemonade", "Orange juice", "Apple juice", "Water"], correct: 0, explanation: "לימונדה עשויה מלימונים", category: "drinks" },
    
    // פירות מתקדמים מאוד
    { id: 3313, text: "What fruit is yellow and has a peel?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 1, explanation: "בננה היא צהובה ויש לה קליפה", category: "fruits" },
    { id: 3314, text: "What fruit is red and has a stone?", options: ["Apple", "Cherry", "Orange", "Grape"], correct: 1, explanation: "דובדבן הוא אדום ויש לו גלעין", category: "fruits" },
    { id: 3315, text: "What fruit is green and has a hard shell?", options: ["Apple", "Coconut", "Orange", "Grape"], correct: 1, explanation: "קוקוס הוא ירוק ויש לו קליפה קשה", category: "fruits" },
    { id: 3316, text: "What fruit is orange and has many seeds?", options: ["Apple", "Pomegranate", "Orange", "Grape"], correct: 1, explanation: "רימון הוא כתום ויש לו הרבה זרעים", category: "fruits" },
    
    // ירקות מתקדמים מאוד
    { id: 3317, text: "What vegetable is green and has leaves?", options: ["Carrot", "Tomato", "Spinach", "Potato"], correct: 2, explanation: "תרד הוא ירוק ויש לו עלים", category: "vegetables" },
    { id: 3318, text: "What vegetable is red and has a stem?", options: ["Carrot", "Tomato", "Pepper", "Potato"], correct: 2, explanation: "פלפל הוא אדום ויש לו גבעול", category: "vegetables" },
    { id: 3319, text: "What vegetable is white and has layers?", options: ["Carrot", "Tomato", "Onion", "Potato"], correct: 2, explanation: "בצל הוא לבן ויש לו שכבות", category: "vegetables" },
    { id: 3320, text: "What vegetable is green and has a head?", options: ["Carrot", "Tomato", "Cabbage", "Potato"], correct: 2, explanation: "כרוב הוא ירוק ויש לו ראש", category: "vegetables" },
    
    // פעילויות אוכל מתקדמות מאוד
    { id: 3321, text: "What do you do when you prepare food?", options: ["Cook", "Sleep", "Run", "Jump"], correct: 0, explanation: "כשמכינים אוכל, מבשלים", category: "vocabulary" },
    { id: 3322, text: "What do you do when you serve food?", options: ["Give food to people", "Sleep", "Run", "Jump"], correct: 0, explanation: "כשמגישים אוכל, נותנים אוכל לאנשים", category: "vocabulary" },
    { id: 3323, text: "Where do you order food from?", options: ["Restaurant", "School", "Park", "Library"], correct: 0, explanation: "מזמינים אוכל ממסעדה", category: "vocabulary" },
    { id: 3324, text: "What do you say when you want food?", options: ["I'm hungry", "I'm tired", "I'm happy", "I'm sad"], correct: 0, explanation: "אומרים 'אני רעב' כשרוצים אוכל", category: "vocabulary" },
    { id: 3325, text: "What do you do with leftover food?", options: ["Save it for later", "Throw it away", "Give it to animals", "All of the above"], correct: 3, explanation: "אפשר לשמור, לזרוק, או לתת לבעלי חיים", category: "vocabulary" },
    
    // אוצר מילים - אוכל מתקדם מאוד
    { id: 3326, text: "What is the English word for 'קארי'?", options: ["Curry", "Spicy", "Hot", "Pepper"], correct: 0, explanation: "המילה 'Curry' פירושה 'קארי'", category: "vocabulary" },
    { id: 3327, text: "What is the English word for 'מלוח'?", options: ["Salty", "Sweet", "Sour", "Bitter"], correct: 0, explanation: "המילה 'Salty' פירושה 'מלוח'", category: "vocabulary" },
    { id: 3328, text: "What is the English word for 'חמוץ'?", options: ["Salty", "Sweet", "Sour", "Bitter"], correct: 2, explanation: "המילה 'Sour' פירושה 'חמוץ'", category: "vocabulary" },
    { id: 3329, text: "What is the English word for 'מר'?", options: ["Salty", "Sweet", "Sour", "Bitter"], correct: 3, explanation: "המילה 'Bitter' פירושה 'מר'", category: "vocabulary" },
    { id: 3330, text: "What is the English word for 'בריא'?", options: ["Healthy", "Unhealthy", "Good", "Bad"], correct: 0, explanation: "המילה 'Healthy' פירושה 'בריא'", category: "vocabulary" },
    { id: 3331, text: "What is the English word for 'לא בריא'?", options: ["Healthy", "Unhealthy", "Good", "Bad"], correct: 1, explanation: "המילה 'Unhealthy' פירושה 'לא בריא'", category: "vocabulary" },
    { id: 3332, text: "What is the English word for 'סלט'?", options: ["Salad", "Soup", "Sandwich", "Pizza"], correct: 0, explanation: "המילה 'Salad' פירושה 'סלט'", category: "vocabulary" },
    { id: 3333, text: "What is the English word for 'ממתק'?", options: ["Candy", "Cake", "Cookie", "Bread"], correct: 0, explanation: "המילה 'Candy' פירושה 'ממתק'", category: "vocabulary" },
    
    // קריאה - אוכל מתקדם מאוד
    { id: 3334, text: "Read: 'I eat salad for lunch. Salad is healthy and has vegetables.' Why is salad healthy?", options: ["It has vegetables", "It has candy", "It has cake", "It has chips"], correct: 0, explanation: "סלט בריא כי יש בו ירקות", category: "reading" },
    { id: 3335, text: "Read: 'I don't eat too much candy. Candy is unhealthy and has a lot of sugar.' Why is candy unhealthy?", options: ["It has vegetables", "It has a lot of sugar", "It has fruit", "It has water"], correct: 1, explanation: "ממתק לא בריא כי יש בו הרבה סוכר", category: "reading" },
    { id: 3336, text: "Read: 'I drink green tea. Green tea is healthy and helps me feel good.' What is green tea?", options: ["Unhealthy", "Healthy", "Sweet", "Sour"], correct: 1, explanation: "תה ירוק הוא בריא", category: "reading" },
    { id: 3337, text: "Read: 'I cook pasta for dinner. Pasta is made from wheat and is delicious.' What is pasta made from?", options: ["Rice", "Wheat", "Potato", "Corn"], correct: 1, explanation: "פסטה עשויה מחיטה", category: "reading" },
    
    // דקדוק - אוכל מתקדם מאוד
    { id: 3338, text: "Complete: 'I ___ cooking dinner when my friend called.'", options: ["am", "is", "was", "were"], correct: 2, explanation: "בישלתי ארוחת ערב כשהחבר שלי התקשר (עבר מתמשך)", category: "grammar" },
    { id: 3339, text: "Complete: 'She ___ eaten breakfast before school.'", options: ["has", "have", "had", "having"], correct: 0, explanation: "היא אכלה ארוחת בוקר לפני בית ספר (הווה מושלם)", category: "grammar" },
    { id: 3340, text: "Complete: 'We ___ going to eat pizza tonight.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו הולכים לאכול פיצה הערב (עתיד עם going to)", category: "grammar" },
    { id: 3341, text: "Complete: 'They ___ hungry because they didn't eat lunch.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "הם רעבים כי לא אכלו ארוחת צהריים (הווה פשוט, רבים)", category: "grammar" },
    { id: 3342, text: "Complete: 'He ___ like spicy food.'", options: ["don't", "doesn't", "isn't", "aren't"], correct: 1, explanation: "הוא לא אוהב אוכל חריף (הווה פשוט שלילי, גוף שלישי יחיד)", category: "grammar" },
    
    // שאלות חזרה - מילים מתקדמות מאוד
    { id: 3343, text: "🔊 חזור אחרי הקריין: Curry", options: ["Curry", "Spicy", "Hot", "Pepper"], correct: 0, explanation: "Curry - קארי", category: "repeat" },
    { id: 3344, text: "🔊 חזור אחרי הקריין: Salty", options: ["Salty", "Sweet", "Sour", "Bitter"], correct: 0, explanation: "Salty - מלוח", category: "repeat" },
    { id: 3345, text: "🔊 חזור אחרי הקריין: Sour", options: ["Salty", "Sweet", "Sour", "Bitter"], correct: 2, explanation: "Sour - חמוץ", category: "repeat" },
    { id: 3346, text: "🔊 חזור אחרי הקריין: Bitter", options: ["Salty", "Sweet", "Sour", "Bitter"], correct: 3, explanation: "Bitter - מר", category: "repeat" },
    { id: 3347, text: "🔊 חזור אחרי הקריין: Healthy", options: ["Healthy", "Unhealthy", "Good", "Bad"], correct: 0, explanation: "Healthy - בריא", category: "repeat" },
    { id: 3348, text: "🔊 חזור אחרי הקריין: Unhealthy", options: ["Healthy", "Unhealthy", "Good", "Bad"], correct: 1, explanation: "Unhealthy - לא בריא", category: "repeat" },
    { id: 3349, text: "🔊 חזור אחרי הקריין: Salad", options: ["Salad", "Soup", "Sandwich", "Pizza"], correct: 0, explanation: "Salad - סלט", category: "repeat" },
    { id: 3350, text: "🔊 חזור אחרי הקריין: Candy", options: ["Candy", "Cake", "Cookie", "Bread"], correct: 0, explanation: "Candy - ממתק", category: "repeat" },
    { id: 3351, text: "🔊 חזור אחרי הקריין: Green tea", options: ["Green tea", "Black tea", "Coffee", "Juice"], correct: 0, explanation: "Green tea - תה ירוק", category: "repeat" },
    { id: 3352, text: "🔊 חזור אחרי הקריין: Milkshake", options: ["Milkshake", "Milk", "Juice", "Water"], correct: 0, explanation: "Milkshake - מילקשייק", category: "repeat" },
    { id: 3353, text: "🔊 חזור אחרי הקריין: Cherry", options: ["Apple", "Cherry", "Orange", "Grape"], correct: 1, explanation: "Cherry - דובדבן", category: "repeat" },
    { id: 3354, text: "🔊 חזור אחרי הקריין: Coconut", options: ["Apple", "Coconut", "Orange", "Grape"], correct: 1, explanation: "Coconut - קוקוס", category: "repeat" },
    { id: 3355, text: "🔊 חזור אחרי הקריין: Pomegranate", options: ["Apple", "Pomegranate", "Orange", "Grape"], correct: 1, explanation: "Pomegranate - רימון", category: "repeat" },
    { id: 3356, text: "🔊 חזור אחרי הקריין: Spinach", options: ["Carrot", "Tomato", "Spinach", "Potato"], correct: 2, explanation: "Spinach - תרד", category: "repeat" },
    { id: 3357, text: "🔊 חזור אחרי הקריין: Pepper", options: ["Carrot", "Tomato", "Pepper", "Potato"], correct: 2, explanation: "Pepper - פלפל", category: "repeat" },
    { id: 3358, text: "🔊 חזור אחרי הקריין: Cabbage", options: ["Carrot", "Tomato", "Cabbage", "Potato"], correct: 2, explanation: "Cabbage - כרוב", category: "repeat" },
    { id: 3359, text: "🔊 חזור אחרי הקריין: Restaurant", options: ["Restaurant", "School", "Park", "Library"], correct: 0, explanation: "Restaurant - מסעדה", category: "repeat" },
    { id: 3360, text: "🔊 חזור אחרי הקריין: Supermarket", options: ["Supermarket", "School", "Park", "Library"], correct: 0, explanation: "Supermarket - סופרמרקט", category: "repeat" }
    ],
    '5': [ // רמה 5 - מומחה - אוכל ושתייה מומחה
    // אוכל מומחה
    { id: 3401, text: "What do you eat that is fermented?", options: ["Yogurt", "Bread", "Rice", "Potato"], correct: 0, explanation: "Yogurt is fermented", category: "vocabulary" },
    { id: 3402, text: "What do you eat that is grilled?", options: ["Grilled chicken", "Ice cream", "Cake", "Bread"], correct: 0, explanation: "Grilled chicken is grilled", category: "vocabulary" },
    { id: 3403, text: "What do you eat that is fried?", options: ["French fries", "Ice cream", "Cake", "Bread"], correct: 0, explanation: "French fries are fried", category: "vocabulary" },
    { id: 3404, text: "What do you eat that is baked?", options: ["Bread", "Ice cream", "Salad", "Soup"], correct: 0, explanation: "Bread is baked", category: "vocabulary" },
    { id: 3405, text: "What do you eat that is steamed?", options: ["Steamed vegetables", "Ice cream", "Cake", "Bread"], correct: 0, explanation: "Steamed vegetables are steamed", category: "vocabulary" },
    { id: 3406, text: "What do you eat that is raw?", options: ["Sushi", "Ice cream", "Cake", "Bread"], correct: 0, explanation: "Sushi is raw", category: "vocabulary" },
    { id: 3407, text: "What do you eat that is organic?", options: ["Organic vegetables", "Candy", "Chips", "Soda"], correct: 0, explanation: "Organic vegetables are organic", category: "vocabulary" },
    { id: 3408, text: "What do you eat that is processed?", options: ["Processed food", "Fresh fruit", "Fresh vegetables", "Water"], correct: 0, explanation: "Processed food is processed", category: "vocabulary" },
    
    // שתייה מומחה
    { id: 3409, text: "What do you drink that is caffeinated?", options: ["Coffee", "Water", "Juice", "Milk"], correct: 0, explanation: "Coffee is caffeinated", category: "drinks" },
    { id: 3410, text: "What do you drink that is decaffeinated?", options: ["Decaf coffee", "Regular coffee", "Energy drink", "Soda"], correct: 0, explanation: "Decaf coffee is decaffeinated", category: "drinks" },
    { id: 3411, text: "What do you drink that is carbonated?", options: ["Soda", "Water", "Juice", "Milk"], correct: 0, explanation: "Soda is carbonated", category: "drinks" },
    { id: 3412, text: "What do you drink that is still?", options: ["Still water", "Soda", "Sparkling water", "Energy drink"], correct: 0, explanation: "Still water is still", category: "drinks" },
    
    // פירות מומחה
    { id: 3413, text: "What fruit is tropical?", options: ["Mango", "Apple", "Orange", "Grape"], correct: 0, explanation: "Mango is tropical", category: "fruits" },
    { id: 3414, text: "What fruit is exotic?", options: ["Dragon fruit", "Apple", "Orange", "Grape"], correct: 0, explanation: "Dragon fruit is exotic", category: "fruits" },
    { id: 3415, text: "What fruit is citrus?", options: ["Lemon", "Apple", "Banana", "Grape"], correct: 0, explanation: "Lemon is citrus", category: "fruits" },
    { id: 3416, text: "What fruit is a berry?", options: ["Strawberry", "Apple", "Orange", "Grape"], correct: 0, explanation: "Strawberry is a berry", category: "fruits" },
    
    // ירקות מומחה
    { id: 3417, text: "What vegetable is a root?", options: ["Carrot", "Tomato", "Cucumber", "Lettuce"], correct: 0, explanation: "Carrot is a root", category: "vegetables" },
    { id: 3418, text: "What vegetable is a leaf?", options: ["Lettuce", "Tomato", "Cucumber", "Carrot"], correct: 0, explanation: "Lettuce is a leaf", category: "vegetables" },
    { id: 3419, text: "What vegetable is a stem?", options: ["Celery", "Tomato", "Cucumber", "Carrot"], correct: 0, explanation: "Celery is a stem", category: "vegetables" },
    { id: 3420, text: "What vegetable is a flower?", options: ["Broccoli", "Tomato", "Cucumber", "Carrot"], correct: 0, explanation: "Broccoli is a flower", category: "vegetables" },
    
    // פעילויות אוכל מומחה
    { id: 3421, text: "What do you do when you season food?", options: ["Add salt and spices", "Sleep", "Run", "Jump"], correct: 0, explanation: "When you season food, you add salt and spices", category: "vocabulary" },
    { id: 3422, text: "What do you do when you marinate food?", options: ["Soak food in sauce", "Sleep", "Run", "Jump"], correct: 0, explanation: "When you marinate food, you soak it in sauce", category: "vocabulary" },
    { id: 3423, text: "Where do you learn to cook?", options: ["Cooking school", "Regular school", "Park", "Library"], correct: 0, explanation: "You learn to cook at cooking school", category: "vocabulary" },
    { id: 3424, text: "What do you say when food tastes good?", options: ["This is delicious", "This is bad", "This is ugly", "This is cold"], correct: 0, explanation: "You say 'This is delicious' when food tastes good", category: "vocabulary" },
    { id: 3425, text: "What do you do with food that is expired?", options: ["Throw it away", "Eat it anyway", "Give it to someone", "Keep it forever"], correct: 0, explanation: "You throw away food that is expired", category: "vocabulary" },
    
    // אוצר מילים - אוכל מומחה
    { id: 3426, text: "What is the English word for 'מבושל'?", options: ["Cooked", "Raw", "Fresh", "Frozen"], correct: 0, explanation: "המילה 'Cooked' פירושה 'מבושל'", category: "vocabulary" },
    { id: 3427, text: "What is the English word for 'גולמי'?", options: ["Cooked", "Raw", "Fresh", "Frozen"], correct: 1, explanation: "המילה 'Raw' פירושה 'גולמי'", category: "vocabulary" },
    { id: 3428, text: "What is the English word for 'טרי'?", options: ["Cooked", "Raw", "Fresh", "Frozen"], correct: 2, explanation: "המילה 'Fresh' פירושה 'טרי'", category: "vocabulary" },
    { id: 3429, text: "What is the English word for 'קפוא'?", options: ["Cooked", "Raw", "Fresh", "Frozen"], correct: 3, explanation: "המילה 'Frozen' פירושה 'קפוא'", category: "vocabulary" },
    { id: 3430, text: "What is the English word for 'מטוגן'?", options: ["Fried", "Baked", "Grilled", "Steamed"], correct: 0, explanation: "המילה 'Fried' פירושה 'מטוגן'", category: "vocabulary" },
    { id: 3431, text: "What is the English word for 'אפוי'?", options: ["Fried", "Baked", "Grilled", "Steamed"], correct: 1, explanation: "המילה 'Baked' פירושה 'אפוי'", category: "vocabulary" },
    { id: 3432, text: "What is the English word for 'צלוי'?", options: ["Fried", "Baked", "Grilled", "Steamed"], correct: 2, explanation: "המילה 'Grilled' פירושה 'צלוי'", category: "vocabulary" },
    { id: 3433, text: "What is the English word for 'מאודה'?", options: ["Fried", "Baked", "Grilled", "Steamed"], correct: 3, explanation: "המילה 'Steamed' פירושה 'מאודה'", category: "vocabulary" },
    
    // קריאה - אוכל מומחה
    { id: 3434, text: "Read: 'I eat organic vegetables. Organic vegetables are grown without chemicals.' How are organic vegetables grown?", options: ["With chemicals", "Without chemicals", "With sugar", "With salt"], correct: 1, explanation: "Organic vegetables are grown without chemicals", category: "reading" },
    { id: 3435, text: "Read: 'I drink decaf coffee. Decaf coffee has no caffeine.' What does decaf coffee have?", options: ["Caffeine", "No caffeine", "Sugar", "Milk"], correct: 1, explanation: "Decaf coffee has no caffeine", category: "reading" },
    { id: 3436, text: "Read: 'I cook grilled chicken. Grilled chicken is healthy and tasty.' How is grilled chicken?", options: ["Unhealthy", "Healthy and tasty", "Sour", "Bitter"], correct: 1, explanation: "Grilled chicken is healthy and tasty", category: "reading" },
    { id: 3437, text: "Read: 'I eat fresh fruit every day. Fresh fruit is good for your health.' Why is fresh fruit good?", options: ["It's bad for you", "It's good for your health", "It's sour", "It's bitter"], correct: 1, explanation: "Fresh fruit is good for your health", category: "reading" },
    
    // דקדוק - אוכל מומחה
    { id: 3438, text: "Complete: 'I ___ been cooking for two hours.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "אני מבשל כבר שעתיים (הווה מושלם מתמשך)", category: "grammar" },
    { id: 3439, text: "Complete: 'She ___ finished eating when I arrived.'", options: ["has", "have", "had", "having"], correct: 2, explanation: "היא סיימה לאכול כשהגעתי (עבר מושלם)", category: "grammar" },
    { id: 3440, text: "Complete: 'We ___ going to order pizza for dinner.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו הולכים להזמין פיצה לארוחת ערב (עתיד עם going to)", category: "grammar" },
    { id: 3441, text: "Complete: 'They ___ not like spicy food.'", options: ["do", "does", "is", "are"], correct: 0, explanation: "הם לא אוהבים אוכל חריף (הווה פשוט שלילי, רבים)", category: "grammar" },
    { id: 3442, text: "Complete: 'He ___ never tried sushi before.'", options: ["has", "have", "had", "having"], correct: 0, explanation: "הוא מעולם לא ניסה סושי לפני (הווה מושלם)", category: "grammar" },
    
    // שאלות חזרה - מילים מומחה
    { id: 3443, text: "🔊 חזור אחרי הקריין: Cooked", options: ["Cooked", "Raw", "Fresh", "Frozen"], correct: 0, explanation: "Cooked - מבושל", category: "repeat" },
    { id: 3444, text: "🔊 חזור אחרי הקריין: Raw", options: ["Cooked", "Raw", "Fresh", "Frozen"], correct: 1, explanation: "Raw - גולמי", category: "repeat" },
    { id: 3445, text: "🔊 חזור אחרי הקריין: Fresh", options: ["Cooked", "Raw", "Fresh", "Frozen"], correct: 2, explanation: "Fresh - טרי", category: "repeat" },
    { id: 3446, text: "🔊 חזור אחרי הקריין: Frozen", options: ["Cooked", "Raw", "Fresh", "Frozen"], correct: 3, explanation: "Frozen - קפוא", category: "repeat" },
    { id: 3447, text: "🔊 חזור אחרי הקריין: Fried", options: ["Fried", "Baked", "Grilled", "Steamed"], correct: 0, explanation: "Fried - מטוגן", category: "repeat" },
    { id: 3448, text: "🔊 חזור אחרי הקריין: Baked", options: ["Fried", "Baked", "Grilled", "Steamed"], correct: 1, explanation: "Baked - אפוי", category: "repeat" },
    { id: 3449, text: "🔊 חזור אחרי הקריין: Grilled", options: ["Fried", "Baked", "Grilled", "Steamed"], correct: 2, explanation: "Grilled - צלוי", category: "repeat" },
    { id: 3450, text: "🔊 חזור אחרי הקריין: Steamed", options: ["Fried", "Baked", "Grilled", "Steamed"], correct: 3, explanation: "Steamed - מאודה", category: "repeat" },
    { id: 3451, text: "🔊 חזור אחרי הקריין: Organic", options: ["Organic", "Processed", "Fresh", "Frozen"], correct: 0, explanation: "Organic - אורגני", category: "repeat" },
    { id: 3452, text: "🔊 חזור אחרי הקריין: Processed", options: ["Organic", "Processed", "Fresh", "Frozen"], correct: 1, explanation: "Processed - מעובד", category: "repeat" },
    { id: 3453, text: "🔊 חזור אחרי הקריין: Caffeinated", options: ["Caffeinated", "Decaffeinated", "Carbonated", "Still"], correct: 0, explanation: "Caffeinated - מכיל קפאין", category: "repeat" },
    { id: 3454, text: "🔊 חזור אחרי הקריין: Decaffeinated", options: ["Caffeinated", "Decaffeinated", "Carbonated", "Still"], correct: 1, explanation: "Decaffeinated - נטול קפאין", category: "repeat" },
    { id: 3455, text: "🔊 חזור אחרי הקריין: Carbonated", options: ["Caffeinated", "Decaffeinated", "Carbonated", "Still"], correct: 2, explanation: "Carbonated - מוגז", category: "repeat" },
    { id: 3456, text: "🔊 חזור אחרי הקריין: Mango", options: ["Apple", "Mango", "Orange", "Grape"], correct: 1, explanation: "Mango - מנגו", category: "repeat" },
    { id: 3457, text: "🔊 חזור אחרי הקריין: Dragon fruit", options: ["Apple", "Dragon fruit", "Orange", "Grape"], correct: 1, explanation: "Dragon fruit - פיטאיה", category: "repeat" },
    { id: 3458, text: "🔊 חזור אחרי הקריין: Celery", options: ["Carrot", "Tomato", "Celery", "Potato"], correct: 2, explanation: "Celery - סלרי", category: "repeat" },
    { id: 3459, text: "🔊 חזור אחרי הקריין: Delicious", options: ["Delicious", "Bad", "Ugly", "Cold"], correct: 0, explanation: "Delicious - טעים", category: "repeat" },
    { id: 3460, text: "🔊 חזור אחרי הקריין: Cooking school", options: ["Cooking school", "Regular school", "Park", "Library"], correct: 0, explanation: "Cooking school - בית ספר לבישול", category: "repeat" }
    ]
  },
  '4': { // יחידה 4 - בעלי חיים וטבע
    '1': [ // רמה 1 - מתחילים - בעלי חיים וטבע בסיסיים
    // בעלי חיים בסיסיים
    { id: 4001, text: "What animal says 'meow'?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 1, explanation: "החתול אומר 'מיאו'", category: "vocabulary" },
    { id: 4002, text: "What animal says 'woof'?", options: ["Cat", "Dog", "Cow", "Bird"], correct: 1, explanation: "הכלב אומר 'ווף'", category: "vocabulary" },
    { id: 4003, text: "What animal says 'moo'?", options: ["Cat", "Dog", "Cow", "Bird"], correct: 2, explanation: "הפרה אומרת 'מו'", category: "vocabulary" },
    { id: 4004, text: "What animal can fly?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 3, explanation: "הציפור יכולה לעוף", category: "vocabulary" },
    { id: 4005, text: "What animal can swim?", options: ["Cat", "Dog", "Fish", "Bird"], correct: 2, explanation: "הדג יכול לשחות", category: "vocabulary" },
    { id: 4006, text: "What animal is big and gray?", options: ["Mouse", "Cat", "Elephant", "Bird"], correct: 2, explanation: "הפיל גדול ואפור", category: "vocabulary" },
    { id: 4007, text: "What animal is small and has a long tail?", options: ["Dog", "Cat", "Mouse", "Cow"], correct: 2, explanation: "העכבר קטן ויש לו זנב ארוך", category: "vocabulary" },
    { id: 4008, text: "What animal has a long neck?", options: ["Dog", "Cat", "Giraffe", "Bird"], correct: 2, explanation: "לג'ירף יש צוואר ארוך", category: "vocabulary" },
    
    // טבע בסיסי
    { id: 4009, text: "What grows in the ground?", options: ["Tree", "Cloud", "Sun", "Moon"], correct: 0, explanation: "העץ גדל באדמה", category: "nature" },
    { id: 4010, text: "What is in the sky during the day?", options: ["Moon", "Stars", "Sun", "Clouds"], correct: 2, explanation: "השמש נמצאת בשמים במהלך היום", category: "nature" },
    { id: 4011, text: "What falls from the sky when it rains?", options: ["Snow", "Rain", "Sun", "Moon"], correct: 1, explanation: "הגשם נופל מהשמים כשיורד גשם", category: "nature" },
    { id: 4012, text: "What is green and grows?", options: ["Grass", "Sky", "Sun", "Moon"], correct: 0, explanation: "הדשא ירוק וגדל", category: "nature" },
    { id: 4013, text: "What is blue and in the sky?", options: ["Grass", "Sky", "Tree", "Flower"], correct: 1, explanation: "השמים כחולים ונמצאים בשמים", category: "nature" },
    { id: 4014, text: "What is white and falls in winter?", options: ["Rain", "Snow", "Sun", "Moon"], correct: 1, explanation: "השלג לבן ונופל בחורף", category: "nature" },
    { id: 4015, text: "What is yellow and in the sky?", options: ["Moon", "Stars", "Sun", "Clouds"], correct: 2, explanation: "השמש צהובה ונמצאת בשמים", category: "nature" },
    { id: 4016, text: "What is colorful and grows in gardens?", options: ["Tree", "Flower", "Grass", "Rock"], correct: 1, explanation: "הפרח צבעוני וגדל בגנים", category: "nature" },
    
    // פעילויות עם בעלי חיים
    { id: 4017, text: "What do you do with a pet dog?", options: ["Play", "Eat", "Sleep", "Study"], correct: 0, explanation: "משחקים עם כלב מחמד", category: "vocabulary" },
    { id: 4018, text: "What do you give to a pet?", options: ["Food", "Shoes", "Car", "Book"], correct: 0, explanation: "נותנים אוכל לחיית מחמד", category: "vocabulary" },
    { id: 4019, text: "Where do you walk a dog?", options: ["Park", "School", "Library", "Hospital"], correct: 0, explanation: "מטיילים עם כלב בפארק", category: "vocabulary" },
    { id: 4020, text: "What do you do when you see a bird?", options: ["Watch it", "Eat it", "Sleep", "Run away"], correct: 0, explanation: "צופים בציפור כשרואים אותה", category: "vocabulary" },
    
    // אוצר מילים - בעלי חיים בסיסיים
    { id: 4021, text: "What is the English word for 'כלב'?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 0, explanation: "המילה 'Dog' פירושה 'כלב'", category: "vocabulary" },
    { id: 4022, text: "What is the English word for 'חתול'?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 1, explanation: "המילה 'Cat' פירושה 'חתול'", category: "vocabulary" },
    { id: 4023, text: "What is the English word for 'פרה'?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 2, explanation: "המילה 'Cow' פירושה 'פרה'", category: "vocabulary" },
    { id: 4024, text: "What is the English word for 'ציפור'?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 3, explanation: "המילה 'Bird' פירושה 'ציפור'", category: "vocabulary" },
    { id: 4025, text: "What is the English word for 'דג'?", options: ["Fish", "Dog", "Cat", "Bird"], correct: 0, explanation: "המילה 'Fish' פירושה 'דג'", category: "vocabulary" },
    { id: 4026, text: "What is the English word for 'פיל'?", options: ["Elephant", "Mouse", "Cat", "Bird"], correct: 0, explanation: "המילה 'Elephant' פירושה 'פיל'", category: "vocabulary" },
    { id: 4027, text: "What is the English word for 'עכבר'?", options: ["Elephant", "Mouse", "Cat", "Bird"], correct: 1, explanation: "המילה 'Mouse' פירושה 'עכבר'", category: "vocabulary" },
    { id: 4028, text: "What is the English word for 'ג'ירף'?", options: ["Elephant", "Mouse", "Giraffe", "Bird"], correct: 2, explanation: "המילה 'Giraffe' פירושה 'ג'ירף'", category: "vocabulary" },
    
    // אוצר מילים - טבע בסיסי
    { id: 4029, text: "What is the English word for 'עץ'?", options: ["Tree", "Flower", "Grass", "Rock"], correct: 0, explanation: "המילה 'Tree' פירושה 'עץ'", category: "vocabulary" },
    { id: 4030, text: "What is the English word for 'פרח'?", options: ["Tree", "Flower", "Grass", "Rock"], correct: 1, explanation: "המילה 'Flower' פירושה 'פרח'", category: "vocabulary" },
    { id: 4031, text: "What is the English word for 'דשא'?", options: ["Tree", "Flower", "Grass", "Rock"], correct: 2, explanation: "המילה 'Grass' פירושה 'דשא'", category: "vocabulary" },
    { id: 4032, text: "What is the English word for 'שמש'?", options: ["Sun", "Moon", "Stars", "Clouds"], correct: 0, explanation: "המילה 'Sun' פירושה 'שמש'", category: "vocabulary" },
    { id: 4033, text: "What is the English word for 'ירח'?", options: ["Sun", "Moon", "Stars", "Clouds"], correct: 1, explanation: "המילה 'Moon' פירושה 'ירח'", category: "vocabulary" },
    { id: 4034, text: "What is the English word for 'כוכבים'?", options: ["Sun", "Moon", "Stars", "Clouds"], correct: 2, explanation: "המילה 'Stars' פירושה 'כוכבים'", category: "vocabulary" },
    { id: 4035, text: "What is the English word for 'עננים'?", options: ["Sun", "Moon", "Stars", "Clouds"], correct: 3, explanation: "המילה 'Clouds' פירושה 'עננים'", category: "vocabulary" },
    { id: 4036, text: "What is the English word for 'גשם'?", options: ["Rain", "Snow", "Sun", "Moon"], correct: 0, explanation: "המילה 'Rain' פירושה 'גשם'", category: "vocabulary" },
    { id: 4037, text: "What is the English word for 'שלג'?", options: ["Rain", "Snow", "Sun", "Moon"], correct: 1, explanation: "המילה 'Snow' פירושה 'שלג'", category: "vocabulary" },
    
    // קריאה - בעלי חיים וטבע
    { id: 4038, text: "Read: 'I have a pet cat. My cat likes to play.' What does the cat like to do?", options: ["Sleep", "Play", "Eat", "Run"], correct: 1, explanation: "החתול אוהב לשחק", category: "reading" },
    { id: 4039, text: "Read: 'I see a bird in the tree. The bird is singing.' Where is the bird?", options: ["On the ground", "In the tree", "In the water", "In the sky"], correct: 1, explanation: "הציפור נמצאת בעץ", category: "reading" },
    { id: 4040, text: "Read: 'The sun is shining. It is a beautiful day.' What is shining?", options: ["Moon", "Stars", "Sun", "Clouds"], correct: 2, explanation: "השמש זורחת", category: "reading" },
    { id: 4041, text: "Read: 'I walk my dog in the park. My dog likes to run.' Where do you walk the dog?", options: ["At home", "In the park", "At school", "In the library"], correct: 1, explanation: "מטיילים עם הכלב בפארק", category: "reading" },
    
    // שאלות חזרה - מילים בסיסיות
    { id: 4042, text: "🔊 חזור אחרי הקריין: Dog", options: ["Dog", "Cat", "Cow", "Bird"], correct: 0, explanation: "Dog - כלב", category: "repeat" },
    { id: 4043, text: "🔊 חזור אחרי הקריין: Cat", options: ["Dog", "Cat", "Cow", "Bird"], correct: 1, explanation: "Cat - חתול", category: "repeat" },
    { id: 4044, text: "🔊 חזור אחרי הקריין: Bird", options: ["Dog", "Cat", "Cow", "Bird"], correct: 3, explanation: "Bird - ציפור", category: "repeat" },
    { id: 4045, text: "🔊 חזור אחרי הקריין: Fish", options: ["Fish", "Dog", "Cat", "Bird"], correct: 0, explanation: "Fish - דג", category: "repeat" },
    { id: 4046, text: "🔊 חזור אחרי הקריין: Elephant", options: ["Elephant", "Mouse", "Cat", "Bird"], correct: 0, explanation: "Elephant - פיל", category: "repeat" },
    { id: 4047, text: "🔊 חזור אחרי הקריין: Tree", options: ["Tree", "Flower", "Grass", "Rock"], correct: 0, explanation: "Tree - עץ", category: "repeat" },
    { id: 4048, text: "🔊 חזור אחרי הקריין: Flower", options: ["Tree", "Flower", "Grass", "Rock"], correct: 1, explanation: "Flower - פרח", category: "repeat" },
    { id: 4049, text: "🔊 חזור אחרי הקריין: Sun", options: ["Sun", "Moon", "Stars", "Clouds"], correct: 0, explanation: "Sun - שמש", category: "repeat" },
    { id: 4050, text: "🔊 חזור אחרי הקריין: Moon", options: ["Sun", "Moon", "Stars", "Clouds"], correct: 1, explanation: "Moon - ירח", category: "repeat" },
    { id: 4051, text: "🔊 חזור אחרי הקריין: Rain", options: ["Rain", "Snow", "Sun", "Moon"], correct: 0, explanation: "Rain - גשם", category: "repeat" },
    { id: 4052, text: "🔊 חזור אחרי הקריין: Snow", options: ["Rain", "Snow", "Sun", "Moon"], correct: 1, explanation: "Snow - שלג", category: "repeat" },
    { id: 4053, text: "🔊 חזור אחרי הקריין: Grass", options: ["Tree", "Flower", "Grass", "Rock"], correct: 2, explanation: "Grass - דשא", category: "repeat" },
    { id: 4054, text: "🔊 חזור אחרי הקריין: Sky", options: ["Sky", "Ground", "Tree", "Flower"], correct: 0, explanation: "Sky - שמים", category: "repeat" },
    { id: 4055, text: "🔊 חזור אחרי הקריין: Pet", options: ["Pet", "Animal", "Friend", "Toy"], correct: 0, explanation: "Pet - חיית מחמד", category: "repeat" },
    { id: 4056, text: "🔊 חזור אחרי הקריין: Play", options: ["Play", "Eat", "Sleep", "Study"], correct: 0, explanation: "Play - לשחק", category: "repeat" },
    { id: 4057, text: "🔊 חזור אחרי הקריין: Walk", options: ["Walk", "Run", "Jump", "Sit"], correct: 0, explanation: "Walk - ללכת", category: "repeat" },
    { id: 4058, text: "🔊 חזור אחרי הקריין: Watch", options: ["Watch", "Eat", "Sleep", "Run"], correct: 0, explanation: "Watch - לצפות", category: "repeat" },
    { id: 4059, text: "🔊 חזור אחרי הקריין: Park", options: ["Park", "School", "Library", "Hospital"], correct: 0, explanation: "Park - פארק", category: "repeat" },
    { id: 4060, text: "🔊 חזור אחרי הקריין: Nature", options: ["Nature", "City", "House", "School"], correct: 0, explanation: "Nature - טבע", category: "repeat" }
    ],
    '2': [ // רמה 2 - בסיסי - בעלי חיים וטבע מורחבים
    // בעלי חיים מורחבים
    { id: 4101, text: "What animal lives in the water?", options: ["Dog", "Cat", "Fish", "Bird"], correct: 2, explanation: "הדג חי במים", category: "vocabulary" },
    { id: 4102, text: "What animal lives in the forest?", options: ["Fish", "Bear", "Cow", "Chicken"], correct: 1, explanation: "הדוב חי ביער", category: "vocabulary" },
    { id: 4103, text: "What animal lives on a farm?", options: ["Lion", "Tiger", "Pig", "Shark"], correct: 2, explanation: "החזיר חי בחווה", category: "vocabulary" },
    { id: 4104, text: "What animal is fast and has stripes?", options: ["Elephant", "Zebra", "Mouse", "Bird"], correct: 1, explanation: "הזברה מהירה ויש לה פסים", category: "vocabulary" },
    { id: 4105, text: "What animal is the king of the jungle?", options: ["Tiger", "Lion", "Bear", "Wolf"], correct: 1, explanation: "האריה הוא מלך הג'ונגל", category: "vocabulary" },
    { id: 4106, text: "What animal can jump very high?", options: ["Dog", "Cat", "Rabbit", "Bird"], correct: 2, explanation: "הארנב יכול לקפוץ גבוה מאוד", category: "vocabulary" },
    { id: 4107, text: "What animal has a shell?", options: ["Dog", "Cat", "Turtle", "Bird"], correct: 2, explanation: "לצב יש שריון", category: "vocabulary" },
    { id: 4108, text: "What animal has wings and can fly?", options: ["Dog", "Butterfly", "Fish", "Rabbit"], correct: 1, explanation: "לפרפר יש כנפיים והוא יכול לעוף", category: "vocabulary" },
    
    // טבע מורחב
    { id: 4109, text: "What is in the ocean?", options: ["Trees", "Fish", "Cars", "Books"], correct: 1, explanation: "דגים נמצאים באוקיינוס", category: "nature" },
    { id: 4110, text: "What grows on trees?", options: ["Flowers", "Fruits", "Cars", "Books"], correct: 1, explanation: "פירות גדלים על עצים", category: "nature" },
    { id: 4111, text: "What is in the forest?", options: ["Cars", "Many trees", "Books", "Shoes"], correct: 1, explanation: "הרבה עצים נמצאים ביער", category: "nature" },
    { id: 4112, text: "What is on the beach?", options: ["Trees", "Sand", "Cars", "Books"], correct: 1, explanation: "חול נמצא על החוף", category: "nature" },
    { id: 4113, text: "What is in the mountains?", options: ["Ocean", "Rocks", "Cars", "Books"], correct: 1, explanation: "אבנים נמצאות בהרים", category: "nature" },
    { id: 4114, text: "What is in the river?", options: ["Trees", "Water", "Cars", "Books"], correct: 1, explanation: "מים נמצאים בנהר", category: "nature" },
    { id: 4115, text: "What is colorful in spring?", options: ["Snow", "Flowers", "Ice", "Clouds"], correct: 1, explanation: "פרחים צבעוניים באביב", category: "nature" },
    { id: 4116, text: "What falls from trees in fall?", options: ["Snow", "Rain", "Leaves", "Clouds"], correct: 2, explanation: "עלים נופלים מהעצים בסתיו", category: "nature" },
    
    // פעילויות עם בעלי חיים וטבע
    { id: 4117, text: "What do you do at the zoo?", options: ["Watch animals", "Eat animals", "Sleep", "Study"], correct: 0, explanation: "צופים בבעלי חיים בגן החיות", category: "vocabulary" },
    { id: 4118, text: "What do you do in the park?", options: ["Play and walk", "Sleep", "Study", "Cook"], correct: 0, explanation: "משחקים ומטיילים בפארק", category: "nature" },
    { id: 4119, text: "What do you do at the beach?", options: ["Swim and play", "Sleep", "Study", "Cook"], correct: 0, explanation: "שוחים ומשחקים בחוף", category: "nature" },
    { id: 4120, text: "What do you do in the forest?", options: ["Hike and explore", "Sleep", "Study", "Cook"], correct: 0, explanation: "מטיילים ומגלים ביער", category: "nature" },
    { id: 4121, text: "What do you do when you see a butterfly?", options: ["Watch it fly", "Eat it", "Sleep", "Run away"], correct: 0, explanation: "צופים בפרפר עף כשרואים אותו", category: "vocabulary" },
    
    // אוצר מילים - בעלי חיים מורחבים
    { id: 4122, text: "What is the English word for 'דוב'?", options: ["Bear", "Lion", "Tiger", "Wolf"], correct: 0, explanation: "המילה 'Bear' פירושה 'דוב'", category: "vocabulary" },
    { id: 4123, text: "What is the English word for 'חזיר'?", options: ["Pig", "Cow", "Horse", "Sheep"], correct: 0, explanation: "המילה 'Pig' פירושה 'חזיר'", category: "vocabulary" },
    { id: 4124, text: "What is the English word for 'זברה'?", options: ["Zebra", "Elephant", "Giraffe", "Lion"], correct: 0, explanation: "המילה 'Zebra' פירושה 'זברה'", category: "vocabulary" },
    { id: 4125, text: "What is the English word for 'אריה'?", options: ["Tiger", "Lion", "Bear", "Wolf"], correct: 1, explanation: "המילה 'Lion' פירושה 'אריה'", category: "vocabulary" },
    { id: 4126, text: "What is the English word for 'ארנב'?", options: ["Rabbit", "Mouse", "Cat", "Dog"], correct: 0, explanation: "המילה 'Rabbit' פירושה 'ארנב'", category: "vocabulary" },
    { id: 4127, text: "What is the English word for 'צב'?", options: ["Turtle", "Fish", "Bird", "Frog"], correct: 0, explanation: "המילה 'Turtle' פירושה 'צב'", category: "vocabulary" },
    { id: 4128, text: "What is the English word for 'פרפר'?", options: ["Butterfly", "Bird", "Bee", "Fly"], correct: 0, explanation: "המילה 'Butterfly' פירושה 'פרפר'", category: "vocabulary" },
    { id: 4129, text: "What is the English word for 'סוס'?", options: ["Horse", "Cow", "Pig", "Sheep"], correct: 0, explanation: "המילה 'Horse' פירושה 'סוס'", category: "vocabulary" },
    
    // אוצר מילים - טבע מורחב
    { id: 4130, text: "What is the English word for 'יער'?", options: ["Forest", "Park", "Garden", "Field"], correct: 0, explanation: "המילה 'Forest' פירושה 'יער'", category: "vocabulary" },
    { id: 4131, text: "What is the English word for 'אוקיינוס'?", options: ["Ocean", "River", "Lake", "Sea"], correct: 0, explanation: "המילה 'Ocean' פירושה 'אוקיינוס'", category: "vocabulary" },
    { id: 4132, text: "What is the English word for 'נהר'?", options: ["Ocean", "River", "Lake", "Sea"], correct: 1, explanation: "המילה 'River' פירושה 'נהר'", category: "vocabulary" },
    { id: 4133, text: "What is the English word for 'חוף'?", options: ["Beach", "Mountain", "Forest", "Field"], correct: 0, explanation: "המילה 'Beach' פירושה 'חוף'", category: "vocabulary" },
    { id: 4134, text: "What is the English word for 'הר'?", options: ["Beach", "Mountain", "Forest", "Field"], correct: 1, explanation: "המילה 'Mountain' פירושה 'הר'", category: "vocabulary" },
    { id: 4135, text: "What is the English word for 'חול'?", options: ["Sand", "Rock", "Stone", "Dirt"], correct: 0, explanation: "המילה 'Sand' פירושה 'חול'", category: "vocabulary" },
    { id: 4136, text: "What is the English word for 'אבן'?", options: ["Sand", "Rock", "Stone", "Dirt"], correct: 1, explanation: "המילה 'Rock' פירושה 'אבן'", category: "vocabulary" },
    { id: 4137, text: "What is the English word for 'עלים'?", options: ["Leaves", "Flowers", "Fruits", "Branches"], correct: 0, explanation: "המילה 'Leaves' פירושה 'עלים'", category: "vocabulary" },
    
    // קריאה - בעלי חיים וטבע מורחבים
    { id: 4138, text: "Read: 'I visit the zoo. I see lions, elephants, and giraffes.' What do you see at the zoo?", options: ["Cars", "Lions, elephants, and giraffes", "Books", "Shoes"], correct: 1, explanation: "רואים אריות, פילים וג'ירפות בגן החיות", category: "reading" },
    { id: 4139, text: "Read: 'I go to the beach. I swim in the ocean and play in the sand.' What do you do at the beach?", options: ["Sleep", "Swim in the ocean and play in the sand", "Study", "Cook"], correct: 1, explanation: "שוחים באוקיינוס ומשחקים בחול בחוף", category: "reading" },
    { id: 4140, text: "Read: 'I walk in the forest. I see many trees and hear birds singing.' What do you see in the forest?", options: ["Cars", "Many trees", "Books", "Shoes"], correct: 1, explanation: "רואים הרבה עצים ביער", category: "reading" },
    { id: 4141, text: "Read: 'I have a pet rabbit. My rabbit likes to hop and eat carrots.' What does the rabbit like to do?", options: ["Sleep", "Hop and eat carrots", "Study", "Cook"], correct: 1, explanation: "הארנב אוהב לקפוץ ולאכול גזרים", category: "reading" },
    
    // דקדוק בסיסי - בעלי חיים וטבע
    { id: 4142, text: "Complete: 'The dog ___ in the park.'", options: ["play", "plays", "played", "playing"], correct: 1, explanation: "הכלב משחק בפארק (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 4143, text: "Complete: 'Birds ___ in the sky.'", options: ["fly", "flies", "flew", "flying"], correct: 0, explanation: "ציפורים עפות בשמים (הווה פשוט, רבים)", category: "grammar" },
    { id: 4144, text: "Complete: 'I ___ my dog every day.'", options: ["walk", "walks", "walked", "walking"], correct: 0, explanation: "אני מטייל עם הכלב שלי כל יום (הווה פשוט)", category: "grammar" },
    { id: 4145, text: "Complete: 'The sun ___ in the sky.'", options: ["shine", "shines", "shone", "shining"], correct: 1, explanation: "השמש זורחת בשמים (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 4146, text: "Complete: 'Trees ___ in the forest.'", options: ["grow", "grows", "grew", "growing"], correct: 0, explanation: "עצים גדלים ביער (הווה פשוט, רבים)", category: "grammar" },
    
    // שאלות חזרה - מילים מורחבות
    { id: 4147, text: "🔊 חזור אחרי הקריין: Bear", options: ["Bear", "Lion", "Tiger", "Wolf"], correct: 0, explanation: "Bear - דוב", category: "repeat" },
    { id: 4148, text: "🔊 חזור אחרי הקריין: Lion", options: ["Tiger", "Lion", "Bear", "Wolf"], correct: 1, explanation: "Lion - אריה", category: "repeat" },
    { id: 4149, text: "🔊 חזור אחרי הקריין: Zebra", options: ["Zebra", "Elephant", "Giraffe", "Lion"], correct: 0, explanation: "Zebra - זברה", category: "repeat" },
    { id: 4150, text: "🔊 חזור אחרי הקריין: Rabbit", options: ["Rabbit", "Mouse", "Cat", "Dog"], correct: 0, explanation: "Rabbit - ארנב", category: "repeat" },
    { id: 4151, text: "🔊 חזור אחרי הקריין: Turtle", options: ["Turtle", "Fish", "Bird", "Frog"], correct: 0, explanation: "Turtle - צב", category: "repeat" },
    { id: 4152, text: "🔊 חזור אחרי הקריין: Butterfly", options: ["Butterfly", "Bird", "Bee", "Fly"], correct: 0, explanation: "Butterfly - פרפר", category: "repeat" },
    { id: 4153, text: "🔊 חזור אחרי הקריין: Horse", options: ["Horse", "Cow", "Pig", "Sheep"], correct: 0, explanation: "Horse - סוס", category: "repeat" },
    { id: 4154, text: "🔊 חזור אחרי הקריין: Forest", options: ["Forest", "Park", "Garden", "Field"], correct: 0, explanation: "Forest - יער", category: "repeat" },
    { id: 4155, text: "🔊 חזור אחרי הקריין: Ocean", options: ["Ocean", "River", "Lake", "Sea"], correct: 0, explanation: "Ocean - אוקיינוס", category: "repeat" },
    { id: 4156, text: "🔊 חזור אחרי הקריין: River", options: ["Ocean", "River", "Lake", "Sea"], correct: 1, explanation: "River - נהר", category: "repeat" },
    { id: 4157, text: "🔊 חזור אחרי הקריין: Beach", options: ["Beach", "Mountain", "Forest", "Field"], correct: 0, explanation: "Beach - חוף", category: "repeat" },
    { id: 4158, text: "🔊 חזור אחרי הקריין: Mountain", options: ["Beach", "Mountain", "Forest", "Field"], correct: 1, explanation: "Mountain - הר", category: "repeat" },
    { id: 4159, text: "🔊 חזור אחרי הקריין: Sand", options: ["Sand", "Rock", "Stone", "Dirt"], correct: 0, explanation: "Sand - חול", category: "repeat" },
    { id: 4160, text: "🔊 חזור אחרי הקריין: Zoo", options: ["Zoo", "School", "Library", "Hospital"], correct: 0, explanation: "Zoo - גן חיות", category: "repeat" }
    ],
    '3': [ // רמה 3 - בינוני - בעלי חיים וטבע מתקדמים
    // בעלי חיים מתקדמים
    { id: 4201, text: "What animal lives in the desert?", options: ["Fish", "Camel", "Polar bear", "Penguin"], correct: 1, explanation: "הגמל חי במדבר", category: "vocabulary" },
    { id: 4202, text: "What animal lives in the Arctic?", options: ["Camel", "Polar bear", "Lion", "Tiger"], correct: 1, explanation: "דוב הקוטב חי בארקטיקה", category: "vocabulary" },
    { id: 4203, text: "What animal lives in the ocean and is dangerous?", options: ["Fish", "Dolphin", "Shark", "Whale"], correct: 2, explanation: "הכריש חי באוקיינוס והוא מסוכן", category: "vocabulary" },
    { id: 4204, text: "What animal is smart and lives in the ocean?", options: ["Fish", "Dolphin", "Shark", "Whale"], correct: 1, explanation: "הדולפין חכם וחי באוקיינוס", category: "vocabulary" },
    { id: 4205, text: "What animal is very big and lives in the ocean?", options: ["Fish", "Dolphin", "Shark", "Whale"], correct: 3, explanation: "הלווייתן מאוד גדול וחי באוקיינוס", category: "vocabulary" },
    { id: 4206, text: "What animal has black and white stripes?", options: ["Zebra", "Tiger", "Panda", "Penguin"], correct: 0, explanation: "לזברה יש פסים שחורים ולבנים", category: "vocabulary" },
    { id: 4207, text: "What animal is black and white and lives in China?", options: ["Zebra", "Tiger", "Panda", "Penguin"], correct: 2, explanation: "הפנדה שחור-לבן וחי בסין", category: "vocabulary" },
    { id: 4208, text: "What animal cannot fly but is a bird?", options: ["Eagle", "Penguin", "Owl", "Parrot"], correct: 1, explanation: "הפינגווין לא יכול לעוף אבל הוא ציפור", category: "vocabulary" },
    
    // טבע מתקדם
    { id: 4209, text: "What is in the desert?", options: ["Water", "Sand and cacti", "Snow", "Ice"], correct: 1, explanation: "חול וקקטוסים נמצאים במדבר", category: "nature" },
    { id: 4210, text: "What is in the Arctic?", options: ["Sand", "Ice and snow", "Trees", "Flowers"], correct: 1, explanation: "קרח ושלג נמצאים בארקטיקה", category: "nature" },
    { id: 4211, text: "What grows in the desert?", options: ["Trees", "Cacti", "Flowers", "Grass"], correct: 1, explanation: "קקטוסים גדלים במדבר", category: "nature" },
    { id: 4212, text: "What is in the jungle?", options: ["Ice", "Many trees and animals", "Sand", "Rocks"], correct: 1, explanation: "הרבה עצים ובעלי חיים נמצאים בג'ונגל", category: "nature" },
    { id: 4213, text: "What is in the lake?", options: ["Trees", "Water", "Sand", "Rocks"], correct: 1, explanation: "מים נמצאים באגם", category: "nature" },
    { id: 4214, text: "What is in the valley?", options: ["Mountains", "Low land between mountains", "Ocean", "Desert"], correct: 1, explanation: "עמק הוא אדמה נמוכה בין הרים", category: "nature" },
    { id: 4215, text: "What is in the cave?", options: ["Trees", "Dark space in rocks", "Water", "Sand"], correct: 1, explanation: "מערה היא מקום חשוך בסלעים", category: "nature" },
    { id: 4216, text: "What is in the meadow?", options: ["Sand", "Grass and flowers", "Ice", "Rocks"], correct: 1, explanation: "דשא ופרחים נמצאים באחו", category: "nature" },
    
    // פעילויות עם בעלי חיים וטבע מתקדמות
    { id: 4217, text: "What do you do when you go camping?", options: ["Sleep in a tent", "Sleep at home", "Study", "Cook in a restaurant"], correct: 0, explanation: "ישנים באוהל כשהולכים לקמפינג", category: "nature" },
    { id: 4218, text: "What do you do when you go hiking?", options: ["Walk in nature", "Sleep", "Study", "Cook"], correct: 0, explanation: "מטיילים בטבע כשהולכים לטיול", category: "nature" },
    { id: 4219, text: "What do you do when you see a wild animal?", options: ["Watch from a distance", "Touch it", "Feed it", "Chase it"], correct: 0, explanation: "צופים בבעל חיים בר ממרחק", category: "vocabulary" },
    { id: 4220, text: "What do you do to protect nature?", options: ["Keep it clean", "Throw trash", "Cut trees", "Pollute"], correct: 0, explanation: "שומרים על הטבע נקי כדי להגן עליו", category: "nature" },
    { id: 4221, text: "What do you do when you visit a national park?", options: ["Enjoy nature and animals", "Sleep", "Study", "Cook"], correct: 0, explanation: "נהנים מהטבע ומבעלי החיים כשביקור בפארק לאומי", category: "nature" },
    
    // אוצר מילים - בעלי חיים מתקדמים
    { id: 4222, text: "What is the English word for 'גמל'?", options: ["Camel", "Horse", "Donkey", "Elephant"], correct: 0, explanation: "המילה 'Camel' פירושה 'גמל'", category: "vocabulary" },
    { id: 4223, text: "What is the English word for 'דוב קוטב'?", options: ["Polar bear", "Brown bear", "Black bear", "Panda"], correct: 0, explanation: "המילה 'Polar bear' פירושה 'דוב קוטב'", category: "vocabulary" },
    { id: 4224, text: "What is the English word for 'כריש'?", options: ["Shark", "Dolphin", "Whale", "Fish"], correct: 0, explanation: "המילה 'Shark' פירושה 'כריש'", category: "vocabulary" },
    { id: 4225, text: "What is the English word for 'דולפין'?", options: ["Shark", "Dolphin", "Whale", "Fish"], correct: 1, explanation: "המילה 'Dolphin' פירושה 'דולפין'", category: "vocabulary" },
    { id: 4226, text: "What is the English word for 'לווייתן'?", options: ["Shark", "Dolphin", "Whale", "Fish"], correct: 2, explanation: "המילה 'Whale' פירושה 'לווייתן'", category: "vocabulary" },
    { id: 4227, text: "What is the English word for 'פנדה'?", options: ["Zebra", "Tiger", "Panda", "Penguin"], correct: 2, explanation: "המילה 'Panda' פירושה 'פנדה'", category: "vocabulary" },
    { id: 4228, text: "What is the English word for 'פינגווין'?", options: ["Eagle", "Penguin", "Owl", "Parrot"], correct: 1, explanation: "המילה 'Penguin' פירושה 'פינגווין'", category: "vocabulary" },
    { id: 4229, text: "What is the English word for 'נשר'?", options: ["Eagle", "Penguin", "Owl", "Parrot"], correct: 0, explanation: "המילה 'Eagle' פירושה 'נשר'", category: "vocabulary" },
    
    // אוצר מילים - טבע מתקדם
    { id: 4230, text: "What is the English word for 'מדבר'?", options: ["Desert", "Forest", "Jungle", "Meadow"], correct: 0, explanation: "המילה 'Desert' פירושה 'מדבר'", category: "vocabulary" },
    { id: 4231, text: "What is the English word for 'ג'ונגל'?", options: ["Desert", "Forest", "Jungle", "Meadow"], correct: 2, explanation: "המילה 'Jungle' פירושה 'ג'ונגל'", category: "vocabulary" },
    { id: 4232, text: "What is the English word for 'אגם'?", options: ["Ocean", "River", "Lake", "Sea"], correct: 2, explanation: "המילה 'Lake' פירושה 'אגם'", category: "vocabulary" },
    { id: 4233, text: "What is the English word for 'עמק'?", options: ["Mountain", "Valley", "Hill", "Peak"], correct: 1, explanation: "המילה 'Valley' פירושה 'עמק'", category: "vocabulary" },
    { id: 4234, text: "What is the English word for 'מערה'?", options: ["Cave", "Mountain", "Valley", "Hill"], correct: 0, explanation: "המילה 'Cave' פירושה 'מערה'", category: "vocabulary" },
    { id: 4235, text: "What is the English word for 'אחו'?", options: ["Desert", "Forest", "Jungle", "Meadow"], correct: 3, explanation: "המילה 'Meadow' פירושה 'אחו'", category: "vocabulary" },
    { id: 4236, text: "What is the English word for 'קקטוס'?", options: ["Cactus", "Tree", "Flower", "Grass"], correct: 0, explanation: "המילה 'Cactus' פירושה 'קקטוס'", category: "vocabulary" },
    { id: 4237, text: "What is the English word for 'סלע'?", options: ["Sand", "Rock", "Stone", "Dirt"], correct: 1, explanation: "המילה 'Rock' פירושה 'סלע'", category: "vocabulary" },
    
    // קריאה - בעלי חיים וטבע מתקדמים
    { id: 4238, text: "Read: 'I visit the desert. I see camels and cacti. It is very hot.' What do you see in the desert?", options: ["Snow", "Camels and cacti", "Trees", "Water"], correct: 1, explanation: "רואים גמלים וקקטוסים במדבר", category: "reading" },
    { id: 4239, text: "Read: 'I go to the ocean. I see dolphins and whales. They are very big.' What do you see in the ocean?", options: ["Trees", "Dolphins and whales", "Mountains", "Desert"], correct: 1, explanation: "רואים דולפינים ולווייתנים באוקיינוס", category: "reading" },
    { id: 4240, text: "Read: 'I hike in the mountains. I see eagles flying high in the sky.' What do you see in the mountains?", options: ["Fish", "Eagles flying", "Dolphins", "Whales"], correct: 1, explanation: "רואים נשרים עפים בהרים", category: "reading" },
    { id: 4241, text: "Read: 'I camp in the forest. I sleep in a tent and hear animals at night.' Where do you sleep when camping?", options: ["At home", "In a tent", "In a hotel", "In a car"], correct: 1, explanation: "ישנים באוהל בקמפינג", category: "reading" },
    
    // דקדוק - בעלי חיים וטבע מתקדמים
    { id: 4242, text: "Complete: 'The dolphin ___ in the ocean.'", options: ["swim", "swims", "swam", "swimming"], correct: 1, explanation: "הדולפין שוחה באוקיינוס (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 4243, text: "Complete: 'I ___ hiking in the mountains last weekend.'", options: ["go", "goes", "went", "going"], correct: 2, explanation: "טיילתי בהרים בסוף השבוע שעבר (עבר פשוט)", category: "grammar" },
    { id: 4244, text: "Complete: 'We ___ camping next month.'", options: ["go", "goes", "going", "will go"], correct: 3, explanation: "נלך לקמפינג בחודש הבא (עתיד פשוט)", category: "grammar" },
    { id: 4245, text: "Complete: 'They ___ watching birds in the park.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "הם צופים בציפורים בפארק (הווה מתמשך, רבים)", category: "grammar" },
    { id: 4246, text: "Complete: 'The whale ___ very big.'", options: ["am", "is", "are", "be"], correct: 1, explanation: "הלווייתן מאוד גדול (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    
    // שאלות חזרה - מילים מתקדמות
    { id: 4247, text: "🔊 חזור אחרי הקריין: Camel", options: ["Camel", "Horse", "Donkey", "Elephant"], correct: 0, explanation: "Camel - גמל", category: "repeat" },
    { id: 4248, text: "🔊 חזור אחרי הקריין: Polar bear", options: ["Polar bear", "Brown bear", "Black bear", "Panda"], correct: 0, explanation: "Polar bear - דוב קוטב", category: "repeat" },
    { id: 4249, text: "🔊 חזור אחרי הקריין: Shark", options: ["Shark", "Dolphin", "Whale", "Fish"], correct: 0, explanation: "Shark - כריש", category: "repeat" },
    { id: 4250, text: "🔊 חזור אחרי הקריין: Dolphin", options: ["Shark", "Dolphin", "Whale", "Fish"], correct: 1, explanation: "Dolphin - דולפין", category: "repeat" },
    { id: 4251, text: "🔊 חזור אחרי הקריין: Whale", options: ["Shark", "Dolphin", "Whale", "Fish"], correct: 2, explanation: "Whale - לווייתן", category: "repeat" },
    { id: 4252, text: "🔊 חזור אחרי הקריין: Panda", options: ["Zebra", "Tiger", "Panda", "Penguin"], correct: 2, explanation: "Panda - פנדה", category: "repeat" },
    { id: 4253, text: "🔊 חזור אחרי הקריין: Penguin", options: ["Eagle", "Penguin", "Owl", "Parrot"], correct: 1, explanation: "Penguin - פינגווין", category: "repeat" },
    { id: 4254, text: "🔊 חזור אחרי הקריין: Eagle", options: ["Eagle", "Penguin", "Owl", "Parrot"], correct: 0, explanation: "Eagle - נשר", category: "repeat" },
    { id: 4255, text: "🔊 חזור אחרי הקריין: Desert", options: ["Desert", "Forest", "Jungle", "Meadow"], correct: 0, explanation: "Desert - מדבר", category: "repeat" },
    { id: 4256, text: "🔊 חזור אחרי הקריין: Jungle", options: ["Desert", "Forest", "Jungle", "Meadow"], correct: 2, explanation: "Jungle - ג'ונגל", category: "repeat" },
    { id: 4257, text: "🔊 חזור אחרי הקריין: Lake", options: ["Ocean", "River", "Lake", "Sea"], correct: 2, explanation: "Lake - אגם", category: "repeat" },
    { id: 4258, text: "🔊 חזור אחרי הקריין: Valley", options: ["Mountain", "Valley", "Hill", "Peak"], correct: 1, explanation: "Valley - עמק", category: "repeat" },
    { id: 4259, text: "🔊 חזור אחרי הקריין: Cave", options: ["Cave", "Mountain", "Valley", "Hill"], correct: 0, explanation: "Cave - מערה", category: "repeat" },
    { id: 4260, text: "🔊 חזור אחרי הקריין: Camping", options: ["Camping", "Hiking", "Swimming", "Running"], correct: 0, explanation: "Camping - קמפינג", category: "repeat" }
    ],
    '4': [ // רמה 4 - מתקדם - בעלי חיים וטבע מתקדמים מאוד
    // בעלי חיים מתקדמים מאוד
    { id: 4301, text: "What animal is endangered?", options: ["Dog", "Cat", "Tiger", "Chicken"], correct: 2, explanation: "הטיגריס בסכנת הכחדה", category: "vocabulary" },
    { id: 4302, text: "What animal is a predator?", options: ["Rabbit", "Deer", "Lion", "Sheep"], correct: 2, explanation: "האריה הוא טורף", category: "vocabulary" },
    { id: 4303, text: "What animal is prey?", options: ["Lion", "Tiger", "Deer", "Shark"], correct: 2, explanation: "הצבי הוא טרף", category: "vocabulary" },
    { id: 4304, text: "What animal is nocturnal?", options: ["Eagle", "Owl", "Parrot", "Penguin"], correct: 1, explanation: "הינשוף הוא לילי", category: "vocabulary" },
    { id: 4305, text: "What animal hibernates in winter?", options: ["Lion", "Bear", "Tiger", "Shark"], correct: 1, explanation: "הדוב נכנס לשנת חורף בחורף", category: "vocabulary" },
    { id: 4306, text: "What animal migrates?", options: ["Lion", "Tiger", "Bird", "Shark"], correct: 2, explanation: "הציפור נודדת", category: "vocabulary" },
    { id: 4307, text: "What animal is a mammal?", options: ["Fish", "Bird", "Dolphin", "Snake"], correct: 2, explanation: "הדולפין הוא יונק", category: "vocabulary" },
    { id: 4308, text: "What animal is a reptile?", options: ["Bird", "Snake", "Fish", "Mammal"], correct: 1, explanation: "הנחש הוא זוחל", category: "vocabulary" },
    
    // טבע מתקדם מאוד
    { id: 4309, text: "What is an ecosystem?", options: ["One animal", "A community of living things", "A car", "A book"], correct: 1, explanation: "מערכת אקולוגית היא קהילה של יצורים חיים", category: "nature" },
    { id: 4310, text: "What is a habitat?", options: ["A home for animals", "A car", "A book", "A toy"], correct: 0, explanation: "בית גידול הוא בית לבעלי חיים", category: "nature" },
    { id: 4311, text: "What is pollution?", options: ["Clean air", "Dirty environment", "Fresh water", "Green trees"], correct: 1, explanation: "זיהום הוא סביבה מלוכלכת", category: "nature" },
    { id: 4312, text: "What is conservation?", options: ["Destroying nature", "Protecting nature", "Polluting", "Wasting"], correct: 1, explanation: "שימור הוא הגנה על הטבע", category: "nature" },
    { id: 4313, text: "What is a species?", options: ["A type of animal", "A car", "A book", "A toy"], correct: 0, explanation: "מין הוא סוג של בעל חיים", category: "nature" },
    { id: 4314, text: "What is biodiversity?", options: ["One type of animal", "Many different types of life", "A car", "A book"], correct: 1, explanation: "מגוון ביולוגי הוא הרבה סוגים שונים של חיים", category: "nature" },
    { id: 4315, text: "What is a volcano?", options: ["A mountain", "A mountain that can erupt", "A river", "A lake"], correct: 1, explanation: "הר געש הוא הר שיכול להתפרץ", category: "nature" },
    { id: 4316, text: "What is a waterfall?", options: ["A river", "Water falling from high", "A lake", "An ocean"], correct: 1, explanation: "מפל מים הוא מים שנופלים מגובה", category: "nature" },
    
    // פעילויות עם בעלי חיים וטבע מתקדמות מאוד
    { id: 4317, text: "What do you do to help endangered animals?", options: ["Protect their habitat", "Hunt them", "Pollute", "Destroy nature"], correct: 0, explanation: "מגנים על בית הגידול שלהם כדי לעזור לבעלי חיים בסכנת הכחדה", category: "vocabulary" },
    { id: 4318, text: "What do you do to reduce pollution?", options: ["Recycle", "Throw trash everywhere", "Pollute more", "Waste resources"], correct: 0, explanation: "ממחזרים כדי להפחית זיהום", category: "nature" },
    { id: 4319, text: "What do you do when you observe animals?", options: ["Watch and learn about them", "Hunt them", "Chase them", "Ignore them"], correct: 0, explanation: "צופים ולומדים על בעלי חיים כצופים בהם", category: "vocabulary" },
    { id: 4320, text: "What do you do to preserve nature?", options: ["Keep it clean and protected", "Pollute it", "Destroy it", "Waste it"], correct: 0, explanation: "שומרים על הטבע נקי ומוגן כדי לשמר אותו", category: "nature" },
    { id: 4321, text: "What do you do when you study wildlife?", options: ["Learn about animals in nature", "Hunt animals", "Ignore animals", "Destroy nature"], correct: 0, explanation: "לומדים על בעלי חיים בטבע כשלומדים חיות בר", category: "vocabulary" },
    
    // אוצר מילים - בעלי חיים מתקדמים מאוד
    { id: 4322, text: "What is the English word for 'נכחד'?", options: ["Endangered", "Extinct", "Common", "Rare"], correct: 1, explanation: "המילה 'Extinct' פירושה 'נכחד'", category: "vocabulary" },
    { id: 4323, text: "What is the English word for 'בסכנת הכחדה'?", options: ["Endangered", "Extinct", "Common", "Rare"], correct: 0, explanation: "המילה 'Endangered' פירושה 'בסכנת הכחדה'", category: "vocabulary" },
    { id: 4324, text: "What is the English word for 'טורף'?", options: ["Predator", "Prey", "Herbivore", "Omnivore"], correct: 0, explanation: "המילה 'Predator' פירושה 'טורף'", category: "vocabulary" },
    { id: 4325, text: "What is the English word for 'טרף'?", options: ["Predator", "Prey", "Herbivore", "Omnivore"], correct: 1, explanation: "המילה 'Prey' פירושה 'טרף'", category: "vocabulary" },
    { id: 4326, text: "What is the English word for 'לילי'?", options: ["Diurnal", "Nocturnal", "Active", "Sleepy"], correct: 1, explanation: "המילה 'Nocturnal' פירושה 'לילי'", category: "vocabulary" },
    { id: 4327, text: "What is the English word for 'שנת חורף'?", options: ["Hibernate", "Migrate", "Active", "Sleep"], correct: 0, explanation: "המילה 'Hibernate' פירושה 'שנת חורף'", category: "vocabulary" },
    { id: 4328, text: "What is the English word for 'נדידה'?", options: ["Hibernate", "Migrate", "Active", "Sleep"], correct: 1, explanation: "המילה 'Migrate' פירושה 'נדידה'", category: "vocabulary" },
    { id: 4329, text: "What is the English word for 'יונק'?", options: ["Mammal", "Reptile", "Bird", "Fish"], correct: 0, explanation: "המילה 'Mammal' פירושה 'יונק'", category: "vocabulary" },
    
    // אוצר מילים - טבע מתקדם מאוד
    { id: 4330, text: "What is the English word for 'מערכת אקולוגית'?", options: ["Ecosystem", "Habitat", "Species", "Biodiversity"], correct: 0, explanation: "המילה 'Ecosystem' פירושה 'מערכת אקולוגית'", category: "vocabulary" },
    { id: 4331, text: "What is the English word for 'בית גידול'?", options: ["Ecosystem", "Habitat", "Species", "Biodiversity"], correct: 1, explanation: "המילה 'Habitat' פירושה 'בית גידול'", category: "vocabulary" },
    { id: 4332, text: "What is the English word for 'זיהום'?", options: ["Pollution", "Conservation", "Protection", "Clean"], correct: 0, explanation: "המילה 'Pollution' פירושה 'זיהום'", category: "vocabulary" },
    { id: 4333, text: "What is the English word for 'שימור'?", options: ["Pollution", "Conservation", "Destruction", "Waste"], correct: 1, explanation: "המילה 'Conservation' פירושה 'שימור'", category: "vocabulary" },
    { id: 4334, text: "What is the English word for 'מין'?", options: ["Ecosystem", "Habitat", "Species", "Biodiversity"], correct: 2, explanation: "המילה 'Species' פירושה 'מין'", category: "vocabulary" },
    { id: 4335, text: "What is the English word for 'מגוון ביולוגי'?", options: ["Ecosystem", "Habitat", "Species", "Biodiversity"], correct: 3, explanation: "המילה 'Biodiversity' פירושה 'מגוון ביולוגי'", category: "vocabulary" },
    { id: 4336, text: "What is the English word for 'הר געש'?", options: ["Mountain", "Volcano", "Hill", "Valley"], correct: 1, explanation: "המילה 'Volcano' פירושה 'הר געש'", category: "vocabulary" },
    { id: 4337, text: "What is the English word for 'מפל מים'?", options: ["River", "Waterfall", "Lake", "Ocean"], correct: 1, explanation: "המילה 'Waterfall' פירושה 'מפל מים'", category: "vocabulary" },
    
    // קריאה - בעלי חיים וטבע מתקדמים מאוד
    { id: 4338, text: "Read: 'Tigers are endangered animals. We need to protect them and their habitat.' Why do we need to protect tigers?", options: ["They are dangerous", "They are endangered", "They are big", "They are fast"], correct: 1, explanation: "צריך להגן על טיגריסים כי הם בסכנת הכחדה", category: "reading" },
    { id: 4339, text: "Read: 'Pollution is bad for nature. We should recycle and keep our environment clean.' What should we do about pollution?", options: ["Pollute more", "Recycle and keep environment clean", "Ignore it", "Make it worse"], correct: 1, explanation: "צריך למחזר ולשמור על הסביבה נקייה", category: "reading" },
    { id: 4340, text: "Read: 'Bears hibernate in winter. They sleep for many months when it is cold.' When do bears hibernate?", options: ["In summer", "In winter", "In spring", "In fall"], correct: 1, explanation: "דובים נכנסים לשנת חורף בחורף", category: "reading" },
    { id: 4341, text: "Read: 'Biodiversity is important. It means having many different types of plants and animals.' What is biodiversity?", options: ["One type of animal", "Many different types of plants and animals", "A car", "A book"], correct: 1, explanation: "מגוון ביולוגי הוא הרבה סוגים שונים של צמחים ובעלי חיים", category: "reading" },
    
    // דקדוק - בעלי חיים וטבע מתקדמים מאוד
    { id: 4342, text: "Complete: 'The tiger ___ endangered.'", options: ["am", "is", "are", "be"], correct: 1, explanation: "הטיגריס בסכנת הכחדה (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 4343, text: "Complete: 'Bears ___ in winter.'", options: ["hibernate", "hibernates", "hibernated", "hibernating"], correct: 0, explanation: "דובים נכנסים לשנת חורף בחורף (הווה פשוט, רבים)", category: "grammar" },
    { id: 4344, text: "Complete: 'I ___ wildlife conservation last year.'", options: ["study", "studies", "studied", "studying"], correct: 2, explanation: "למדתי שימור חיות בר בשנה שעברה (עבר פשוט)", category: "grammar" },
    { id: 4345, text: "Complete: 'We ___ going to visit the national park tomorrow.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו הולכים לבקר בפארק הלאומי מחר (עתיד עם going to)", category: "grammar" },
    { id: 4346, text: "Complete: 'They ___ been studying animals for two years.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "הם לומדים על בעלי חיים כבר שנתיים (הווה מושלם מתמשך)", category: "grammar" },
    
    // שאלות חזרה - מילים מתקדמות מאוד
    { id: 4347, text: "🔊 חזור אחרי הקריין: Endangered", options: ["Endangered", "Extinct", "Common", "Rare"], correct: 0, explanation: "Endangered - בסכנת הכחדה", category: "repeat" },
    { id: 4348, text: "🔊 חזור אחרי הקריין: Extinct", options: ["Endangered", "Extinct", "Common", "Rare"], correct: 1, explanation: "Extinct - נכחד", category: "repeat" },
    { id: 4349, text: "🔊 חזור אחרי הקריין: Predator", options: ["Predator", "Prey", "Herbivore", "Omnivore"], correct: 0, explanation: "Predator - טורף", category: "repeat" },
    { id: 4350, text: "🔊 חזור אחרי הקריין: Prey", options: ["Predator", "Prey", "Herbivore", "Omnivore"], correct: 1, explanation: "Prey - טרף", category: "repeat" },
    { id: 4351, text: "🔊 חזור אחרי הקריין: Nocturnal", options: ["Diurnal", "Nocturnal", "Active", "Sleepy"], correct: 1, explanation: "Nocturnal - לילי", category: "repeat" },
    { id: 4352, text: "🔊 חזור אחרי הקריין: Hibernate", options: ["Hibernate", "Migrate", "Active", "Sleep"], correct: 0, explanation: "Hibernate - שנת חורף", category: "repeat" },
    { id: 4353, text: "🔊 חזור אחרי הקריין: Migrate", options: ["Hibernate", "Migrate", "Active", "Sleep"], correct: 1, explanation: "Migrate - נדידה", category: "repeat" },
    { id: 4354, text: "🔊 חזור אחרי הקריין: Mammal", options: ["Mammal", "Reptile", "Bird", "Fish"], correct: 0, explanation: "Mammal - יונק", category: "repeat" },
    { id: 4355, text: "🔊 חזור אחרי הקריין: Ecosystem", options: ["Ecosystem", "Habitat", "Species", "Biodiversity"], correct: 0, explanation: "Ecosystem - מערכת אקולוגית", category: "repeat" },
    { id: 4356, text: "🔊 חזור אחרי הקריין: Habitat", options: ["Ecosystem", "Habitat", "Species", "Biodiversity"], correct: 1, explanation: "Habitat - בית גידול", category: "repeat" },
    { id: 4357, text: "🔊 חזור אחרי הקריין: Pollution", options: ["Pollution", "Conservation", "Protection", "Clean"], correct: 0, explanation: "Pollution - זיהום", category: "repeat" },
    { id: 4358, text: "🔊 חזור אחרי הקריין: Conservation", options: ["Pollution", "Conservation", "Destruction", "Waste"], correct: 1, explanation: "Conservation - שימור", category: "repeat" },
    { id: 4359, text: "🔊 חזור אחרי הקריין: Species", options: ["Ecosystem", "Habitat", "Species", "Biodiversity"], correct: 2, explanation: "Species - מין", category: "repeat" },
    { id: 4360, text: "🔊 חזור אחרי הקריין: Biodiversity", options: ["Ecosystem", "Habitat", "Species", "Biodiversity"], correct: 3, explanation: "Biodiversity - מגוון ביולוגי", category: "repeat" }
    ],
    '5': [ // רמה 5 - מומחה - בעלי חיים וטבע מומחה
    // בעלי חיים מומחה
    { id: 4401, text: "What animal is a carnivore?", options: ["Rabbit", "Deer", "Lion", "Cow"], correct: 2, explanation: "האריה הוא טורף", category: "vocabulary" },
    { id: 4402, text: "What animal is a herbivore?", options: ["Lion", "Tiger", "Deer", "Shark"], correct: 2, explanation: "הצבי הוא צמחוני", category: "vocabulary" },
    { id: 4403, text: "What animal is an omnivore?", options: ["Lion", "Bear", "Tiger", "Shark"], correct: 1, explanation: "הדוב הוא אוכל כל", category: "vocabulary" },
    { id: 4404, text: "What animal is a scavenger?", options: ["Lion", "Vulture", "Eagle", "Owl"], correct: 1, explanation: "הנשר הוא נבלה", category: "vocabulary" },
    { id: 4405, text: "What animal is venomous?", options: ["Rabbit", "Snake", "Deer", "Sheep"], correct: 1, explanation: "הנחש הוא ארסי", category: "vocabulary" },
    { id: 4406, text: "What animal is a pack animal?", options: ["Lion", "Tiger", "Wolf", "Bear"], correct: 2, explanation: "הזאב הוא בעל חיים להקתי", category: "vocabulary" },
    { id: 4407, text: "What animal is solitary?", options: ["Lion", "Tiger", "Wolf", "Deer"], correct: 1, explanation: "הטיגריס הוא בודד", category: "vocabulary" },
    { id: 4408, text: "What animal is a keystone species?", options: ["Mouse", "Beaver", "Rabbit", "Deer"], correct: 1, explanation: "הבונה הוא מין מפתח", category: "vocabulary" },
    
    // טבע מומחה
    { id: 4409, text: "What is climate change?", options: ["Weather today", "Long-term change in weather patterns", "A season", "A day"], correct: 1, explanation: "שינוי אקלים הוא שינוי ארוך טווח בדפוסי מזג האוויר", category: "nature" },
    { id: 4410, text: "What is global warming?", options: ["Getting colder", "Earth getting warmer", "Same temperature", "No change"], correct: 1, explanation: "התחממות גלובלית היא התחממות כדור הארץ", category: "nature" },
    { id: 4411, text: "What is deforestation?", options: ["Planting trees", "Cutting down forests", "Protecting trees", "Watering trees"], correct: 1, explanation: "בירוא יערות הוא כריתת יערות", category: "nature" },
    { id: 4412, text: "What is reforestation?", options: ["Cutting trees", "Planting new trees", "Burning trees", "Ignoring trees"], correct: 1, explanation: "ייעור מחדש הוא נטיעת עצים חדשים", category: "nature" },
    { id: 4413, text: "What is a food chain?", options: ["One animal", "How animals eat each other", "A car", "A book"], correct: 1, explanation: "שרשרת מזון היא איך בעלי חיים אוכלים זה את זה", category: "nature" },
    { id: 4414, text: "What is a food web?", options: ["One food chain", "Many connected food chains", "A car", "A book"], correct: 1, explanation: "רשת מזון היא הרבה שרשראות מזון מחוברות", category: "nature" },
    { id: 4415, text: "What is photosynthesis?", options: ["Animals eating", "Plants making food from sunlight", "Animals sleeping", "Plants dying"], correct: 1, explanation: "פוטוסינתזה היא צמחים שעושים אוכל מאור השמש", category: "nature" },
    { id: 4416, text: "What is a renewable resource?", options: ["Something that runs out", "Something that can be replaced", "A car", "A book"], correct: 1, explanation: "משאב מתחדש הוא משהו שיכול להיות מוחלף", category: "nature" },
    
    // פעילויות עם בעלי חיים וטבע מומחה
    { id: 4417, text: "What do you do to combat climate change?", options: ["Reduce carbon emissions", "Pollute more", "Waste energy", "Ignore it"], correct: 0, explanation: "מפחיתים פליטות פחמן כדי להילחם בשינוי אקלים", category: "nature" },
    { id: 4418, text: "What do you do to support reforestation?", options: ["Plant trees", "Cut trees", "Burn trees", "Ignore trees"], correct: 0, explanation: "נוטעים עצים כדי לתמוך בייעור מחדש", category: "nature" },
    { id: 4419, text: "What do you do when you research wildlife?", options: ["Study animals scientifically", "Hunt animals", "Ignore animals", "Destroy nature"], correct: 0, explanation: "לומדים על בעלי חיים בצורה מדעית כחוקרים חיות בר", category: "vocabulary" },
    { id: 4420, text: "What do you do to maintain biodiversity?", options: ["Protect different species", "Destroy habitats", "Pollute", "Waste resources"], correct: 0, explanation: "מגנים על מינים שונים כדי לשמור על מגוון ביולוגי", category: "nature" },
    { id: 4421, text: "What do you do when you monitor ecosystems?", options: ["Watch and track changes", "Destroy them", "Pollute them", "Ignore them"], correct: 0, explanation: "צופים ומעקבים אחרי שינויים כצופים במערכות אקולוגיות", category: "nature" },
    
    // אוצר מילים - בעלי חיים מומחה
    { id: 4422, text: "What is the English word for 'טורף'?", options: ["Carnivore", "Herbivore", "Omnivore", "Scavenger"], correct: 0, explanation: "המילה 'Carnivore' פירושה 'טורף'", category: "vocabulary" },
    { id: 4423, text: "What is the English word for 'צמחוני'?", options: ["Carnivore", "Herbivore", "Omnivore", "Scavenger"], correct: 1, explanation: "המילה 'Herbivore' פירושה 'צמחוני'", category: "vocabulary" },
    { id: 4424, text: "What is the English word for 'אוכל כל'?", options: ["Carnivore", "Herbivore", "Omnivore", "Scavenger"], correct: 2, explanation: "המילה 'Omnivore' פירושה 'אוכל כל'", category: "vocabulary" },
    { id: 4425, text: "What is the English word for 'נבלה'?", options: ["Carnivore", "Herbivore", "Omnivore", "Scavenger"], correct: 3, explanation: "המילה 'Scavenger' פירושה 'נבלה'", category: "vocabulary" },
    { id: 4426, text: "What is the English word for 'ארסי'?", options: ["Venomous", "Poisonous", "Dangerous", "Safe"], correct: 0, explanation: "המילה 'Venomous' פירושה 'ארסי'", category: "vocabulary" },
    { id: 4427, text: "What is the English word for 'להקה'?", options: ["Pack", "Herd", "Flock", "School"], correct: 0, explanation: "המילה 'Pack' פירושה 'להקה'", category: "vocabulary" },
    { id: 4428, text: "What is the English word for 'בודד'?", options: ["Social", "Solitary", "Friendly", "Group"], correct: 1, explanation: "המילה 'Solitary' פירושה 'בודד'", category: "vocabulary" },
    { id: 4429, text: "What is the English word for 'מין מפתח'?", options: ["Common species", "Keystone species", "Rare species", "Endangered species"], correct: 1, explanation: "המילה 'Keystone species' פירושה 'מין מפתח'", category: "vocabulary" },
    
    // אוצר מילים - טבע מומחה
    { id: 4430, text: "What is the English word for 'שינוי אקלים'?", options: ["Weather", "Climate change", "Season", "Day"], correct: 1, explanation: "המילה 'Climate change' פירושה 'שינוי אקלים'", category: "vocabulary" },
    { id: 4431, text: "What is the English word for 'התחממות גלובלית'?", options: ["Global cooling", "Global warming", "Same temperature", "No change"], correct: 1, explanation: "המילה 'Global warming' פירושה 'התחממות גלובלית'", category: "vocabulary" },
    { id: 4432, text: "What is the English word for 'בירוא יערות'?", options: ["Planting trees", "Deforestation", "Protecting trees", "Watering trees"], correct: 1, explanation: "המילה 'Deforestation' פירושה 'בירוא יערות'", category: "vocabulary" },
    { id: 4433, text: "What is the English word for 'ייעור מחדש'?", options: ["Cutting trees", "Reforestation", "Burning trees", "Ignoring trees"], correct: 1, explanation: "המילה 'Reforestation' פירושה 'ייעור מחדש'", category: "vocabulary" },
    { id: 4434, text: "What is the English word for 'שרשרת מזון'?", options: ["One animal", "Food chain", "A car", "A book"], correct: 1, explanation: "המילה 'Food chain' פירושה 'שרשרת מזון'", category: "vocabulary" },
    { id: 4435, text: "What is the English word for 'רשת מזון'?", options: ["One food chain", "Food web", "A car", "A book"], correct: 1, explanation: "המילה 'Food web' פירושה 'רשת מזון'", category: "vocabulary" },
    { id: 4436, text: "What is the English word for 'פוטוסינתזה'?", options: ["Animals eating", "Photosynthesis", "Animals sleeping", "Plants dying"], correct: 1, explanation: "המילה 'Photosynthesis' פירושה 'פוטוסינתזה'", category: "vocabulary" },
    { id: 4437, text: "What is the English word for 'משאב מתחדש'?", options: ["Non-renewable", "Renewable resource", "A car", "A book"], correct: 1, explanation: "המילה 'Renewable resource' פירושה 'משאב מתחדש'", category: "vocabulary" },
    
    // קריאה - בעלי חיים וטבע מומחה
    { id: 4438, text: "Read: 'Climate change is affecting animals. Many species are losing their habitats due to global warming.' Why are animals losing their habitats?", options: ["Because of deforestation", "Due to global warming", "Because of reforestation", "Due to conservation"], correct: 1, explanation: "בעלי חיים מאבדים את בתי הגידול שלהם בגלל התחממות גלובלית", category: "reading" },
    { id: 4439, text: "Read: 'A food chain shows how animals eat each other. For example, grass is eaten by rabbits, and rabbits are eaten by foxes.' What does a food chain show?", options: ["One animal", "How animals eat each other", "A car", "A book"], correct: 1, explanation: "שרשרת מזון מראה איך בעלי חיים אוכלים זה את זה", category: "reading" },
    { id: 4440, text: "Read: 'Photosynthesis is important. Plants use sunlight to make food, and this helps all living things.' What do plants use to make food?", options: ["Water", "Sunlight", "Soil", "Air"], correct: 1, explanation: "צמחים משתמשים באור השמש כדי לעשות אוכל", category: "reading" },
    { id: 4441, text: "Read: 'Reforestation helps fight climate change. When we plant trees, they absorb carbon dioxide from the air.' Why is reforestation important?", options: ["It cuts trees", "It helps fight climate change", "It pollutes", "It wastes resources"], correct: 1, explanation: "ייעור מחדש חשוב כי הוא עוזר להילחם בשינוי אקלים", category: "reading" },
    
    // דקדוק - בעלי חיים וטבע מומחה
    { id: 4442, text: "Complete: 'The lion ___ a carnivore.'", options: ["am", "is", "are", "be"], correct: 1, explanation: "האריה הוא טורף (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 4443, text: "Complete: 'Climate change ___ affecting many species.'", options: ["am", "is", "are", "be"], correct: 1, explanation: "שינוי אקלים משפיע על הרבה מינים (הווה מתמשך, גוף שלישי יחיד)", category: "grammar" },
    { id: 4444, text: "Complete: 'Scientists ___ been studying wildlife for decades.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "מדענים לומדים על חיות בר כבר עשרות שנים (הווה מושלם מתמשך)", category: "grammar" },
    { id: 4445, text: "Complete: 'We ___ going to plant trees next month.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו הולכים לנטוע עצים בחודש הבא (עתיד עם going to)", category: "grammar" },
    { id: 4446, text: "Complete: 'They ___ not understand the importance of biodiversity.'", options: ["do", "does", "is", "are"], correct: 0, explanation: "הם לא מבינים את החשיבות של מגוון ביולוגי (הווה פשוט שלילי, רבים)", category: "grammar" },
    
    // שאלות חזרה - מילים מומחה
    { id: 4447, text: "🔊 חזור אחרי הקריין: Carnivore", options: ["Carnivore", "Herbivore", "Omnivore", "Scavenger"], correct: 0, explanation: "Carnivore - טורף", category: "repeat" },
    { id: 4448, text: "🔊 חזור אחרי הקריין: Herbivore", options: ["Carnivore", "Herbivore", "Omnivore", "Scavenger"], correct: 1, explanation: "Herbivore - צמחוני", category: "repeat" },
    { id: 4449, text: "🔊 חזור אחרי הקריין: Omnivore", options: ["Carnivore", "Herbivore", "Omnivore", "Scavenger"], correct: 2, explanation: "Omnivore - אוכל כל", category: "repeat" },
    { id: 4450, text: "🔊 חזור אחרי הקריין: Scavenger", options: ["Carnivore", "Herbivore", "Omnivore", "Scavenger"], correct: 3, explanation: "Scavenger - נבלה", category: "repeat" },
    { id: 4451, text: "🔊 חזור אחרי הקריין: Venomous", options: ["Venomous", "Poisonous", "Dangerous", "Safe"], correct: 0, explanation: "Venomous - ארסי", category: "repeat" },
    { id: 4452, text: "🔊 חזור אחרי הקריין: Pack", options: ["Pack", "Herd", "Flock", "School"], correct: 0, explanation: "Pack - להקה", category: "repeat" },
    { id: 4453, text: "🔊 חזור אחרי הקריין: Solitary", options: ["Social", "Solitary", "Friendly", "Group"], correct: 1, explanation: "Solitary - בודד", category: "repeat" },
    { id: 4454, text: "🔊 חזור אחרי הקריין: Keystone species", options: ["Common species", "Keystone species", "Rare species", "Endangered species"], correct: 1, explanation: "Keystone species - מין מפתח", category: "repeat" },
    { id: 4455, text: "🔊 חזור אחרי הקריין: Climate change", options: ["Weather", "Climate change", "Season", "Day"], correct: 1, explanation: "Climate change - שינוי אקלים", category: "repeat" },
    { id: 4456, text: "🔊 חזור אחרי הקריין: Global warming", options: ["Global cooling", "Global warming", "Same temperature", "No change"], correct: 1, explanation: "Global warming - התחממות גלובלית", category: "repeat" },
    { id: 4457, text: "🔊 חזור אחרי הקריין: Deforestation", options: ["Planting trees", "Deforestation", "Protecting trees", "Watering trees"], correct: 1, explanation: "Deforestation - בירוא יערות", category: "repeat" },
    { id: 4458, text: "🔊 חזור אחרי הקריין: Reforestation", options: ["Cutting trees", "Reforestation", "Burning trees", "Ignoring trees"], correct: 1, explanation: "Reforestation - ייעור מחדש", category: "repeat" },
    { id: 4459, text: "🔊 חזור אחרי הקריין: Food chain", options: ["One animal", "Food chain", "A car", "A book"], correct: 1, explanation: "Food chain - שרשרת מזון", category: "repeat" },
    { id: 4460, text: "🔊 חזור אחרי הקריין: Photosynthesis", options: ["Animals eating", "Photosynthesis", "Animals sleeping", "Plants dying"], correct: 1, explanation: "Photosynthesis - פוטוסינתזה", category: "repeat" }
    ]
  },
  '5': { // יחידה 5 - תחבורה ונסיעות
    '1': [ // רמה 1 - מתחילים - תחבורה ונסיעות בסיסיים
    // תחבורה בסיסית
    { id: 5001, text: "What do you use to go to school?", options: ["Car", "Bike", "Bus", "All of the above"], correct: 3, explanation: "אפשר להשתמש במכונית, אופניים או אוטובוס כדי להגיע לבית ספר", category: "vocabulary" },
    { id: 5002, text: "What has four wheels?", options: ["Bike", "Car", "Bus", "Train"], correct: 1, explanation: "למכונית יש ארבעה גלגלים", category: "vocabulary" },
    { id: 5003, text: "What has two wheels?", options: ["Car", "Bike", "Bus", "Train"], correct: 1, explanation: "לאופניים יש שני גלגלים", category: "vocabulary" },
    { id: 5004, text: "What flies in the sky?", options: ["Car", "Bike", "Plane", "Bus"], correct: 2, explanation: "מטוס עף בשמים", category: "vocabulary" },
    { id: 5005, text: "What moves on water?", options: ["Car", "Bike", "Boat", "Plane"], correct: 2, explanation: "סירה נעה על המים", category: "vocabulary" },
    { id: 5006, text: "What moves on tracks?", options: ["Car", "Bike", "Train", "Plane"], correct: 2, explanation: "רכבת נעה על מסילות", category: "vocabulary" },
    { id: 5007, text: "What do you ride?", options: ["Bike", "Car", "Bus", "All of the above"], correct: 3, explanation: "אפשר לרכוב על אופניים, לנסוע במכונית או באוטובוס", category: "vocabulary" },
    { id: 5008, text: "What is red and has lights?", options: ["Car", "Bike", "Bus", "Train"], correct: 0, explanation: "מכונית יכולה להיות אדומה ויש לה פנסים", category: "vocabulary" },
    
    // מקומות נסיעה
    { id: 5009, text: "Where do you go to catch a plane?", options: ["Station", "Airport", "Port", "Stop"], correct: 1, explanation: "הולכים לשדה תעופה כדי לתפוס מטוס", category: "places" },
    { id: 5010, text: "Where do you go to catch a train?", options: ["Station", "Airport", "Port", "Stop"], correct: 0, explanation: "הולכים לתחנת רכבת כדי לתפוס רכבת", category: "places" },
    { id: 5011, text: "Where do you wait for a bus?", options: ["Station", "Airport", "Port", "Bus stop"], correct: 3, explanation: "מחכים לאוטובוס בתחנת אוטובוס", category: "places" },
    { id: 5012, text: "Where do cars park?", options: ["Parking lot", "Airport", "Station", "Stop"], correct: 0, explanation: "מכוניות חונות בחניון", category: "places" },
    
    // פעילויות נסיעה
    { id: 5013, text: "What do you do when you travel?", options: ["Sleep", "Go to new places", "Stay home", "Nothing"], correct: 1, explanation: "כשנוסעים, הולכים למקומות חדשים", category: "travel" },
    { id: 5014, text: "What do you do before a trip?", options: ["Pack your bags", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "לפני נסיעה אורזים את התיקים", category: "travel" },
    { id: 5015, text: "What do you do at an airport?", options: ["Sleep", "Check in", "Eat", "Nothing"], correct: 1, explanation: "בשדה תעופה עושים צ'ק אין", category: "travel" },
    { id: 5016, text: "What do you need to travel?", options: ["Ticket", "Shoes", "Car", "Book"], correct: 0, explanation: "צריך כרטיס כדי לנסוע", category: "travel" },
    
    // אוצר מילים - תחבורה בסיסית
    { id: 5017, text: "What is the English word for 'מכונית'?", options: ["Car", "Bike", "Bus", "Train"], correct: 0, explanation: "המילה 'Car' פירושה 'מכונית'", category: "vocabulary" },
    { id: 5018, text: "What is the English word for 'אופניים'?", options: ["Car", "Bike", "Bus", "Train"], correct: 1, explanation: "המילה 'Bike' פירושה 'אופניים'", category: "vocabulary" },
    { id: 5019, text: "What is the English word for 'אוטובוס'?", options: ["Car", "Bike", "Bus", "Train"], correct: 2, explanation: "המילה 'Bus' פירושה 'אוטובוס'", category: "vocabulary" },
    { id: 5020, text: "What is the English word for 'רכבת'?", options: ["Car", "Bike", "Bus", "Train"], correct: 3, explanation: "המילה 'Train' פירושה 'רכבת'", category: "vocabulary" },
    { id: 5021, text: "What is the English word for 'מטוס'?", options: ["Plane", "Boat", "Car", "Bike"], correct: 0, explanation: "המילה 'Plane' פירושה 'מטוס'", category: "vocabulary" },
    { id: 5022, text: "What is the English word for 'סירה'?", options: ["Plane", "Boat", "Car", "Bike"], correct: 1, explanation: "המילה 'Boat' פירושה 'סירה'", category: "vocabulary" },
    
    // אוצר מילים - מקומות
    { id: 5023, text: "What is the English word for 'שדה תעופה'?", options: ["Station", "Airport", "Port", "Stop"], correct: 1, explanation: "המילה 'Airport' פירושה 'שדה תעופה'", category: "vocabulary" },
    { id: 5024, text: "What is the English word for 'תחנה'?", options: ["Station", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Station' פירושה 'תחנה'", category: "vocabulary" },
    { id: 5025, text: "What is the English word for 'תחנת אוטובוס'?", options: ["Station", "Airport", "Port", "Bus stop"], correct: 3, explanation: "המילה 'Bus stop' פירושה 'תחנת אוטובוס'", category: "vocabulary" },
    { id: 5026, text: "What is the English word for 'חניון'?", options: ["Parking lot", "Airport", "Station", "Stop"], correct: 0, explanation: "המילה 'Parking lot' פירושה 'חניון'", category: "vocabulary" },
    
    // קריאה - תחבורה
    { id: 5027, text: "Read: 'I go to school by bus. I wait at the bus stop.' How do you go to school?", options: ["By car", "By bus", "By bike", "By train"], correct: 1, explanation: "נוסעים לבית ספר באוטובוס", category: "reading" },
    { id: 5028, text: "Read: 'I travel by plane. I go to the airport.' Where do you go to travel by plane?", options: ["Station", "Airport", "Port", "Stop"], correct: 1, explanation: "הולכים לשדה תעופה כדי לנסוע במטוס", category: "reading" },
    { id: 5029, text: "Read: 'I ride my bike to the park. Bikes have two wheels.' How many wheels does a bike have?", options: ["One", "Two", "Three", "Four"], correct: 1, explanation: "לאופניים יש שני גלגלים", category: "reading" },
    { id: 5030, text: "Read: 'I take a train. Trains move on tracks.' What do trains move on?", options: ["Road", "Water", "Tracks", "Sky"], correct: 2, explanation: "רכבת נעה על מסילות", category: "reading" },
    
    // שאלות חזרה - מילים בסיסיות
    { id: 5031, text: "🔊 חזור אחרי הקריין: Car", options: ["Car", "Bike", "Bus", "Train"], correct: 0, explanation: "Car - מכונית", category: "repeat" },
    { id: 5032, text: "🔊 חזור אחרי הקריין: Bike", options: ["Car", "Bike", "Bus", "Train"], correct: 1, explanation: "Bike - אופניים", category: "repeat" },
    { id: 5033, text: "🔊 חזור אחרי הקריין: Bus", options: ["Car", "Bike", "Bus", "Train"], correct: 2, explanation: "Bus - אוטובוס", category: "repeat" },
    { id: 5034, text: "🔊 חזור אחרי הקריין: Train", options: ["Car", "Bike", "Bus", "Train"], correct: 3, explanation: "Train - רכבת", category: "repeat" },
    { id: 5035, text: "🔊 חזור אחרי הקריין: Plane", options: ["Plane", "Boat", "Car", "Bike"], correct: 0, explanation: "Plane - מטוס", category: "repeat" },
    { id: 5036, text: "🔊 חזור אחרי הקריין: Boat", options: ["Plane", "Boat", "Car", "Bike"], correct: 1, explanation: "Boat - סירה", category: "repeat" },
    { id: 5037, text: "🔊 חזור אחרי הקריין: Airport", options: ["Station", "Airport", "Port", "Stop"], correct: 1, explanation: "Airport - שדה תעופה", category: "repeat" },
    { id: 5038, text: "🔊 חזור אחרי הקריין: Station", options: ["Station", "Airport", "Port", "Stop"], correct: 0, explanation: "Station - תחנה", category: "repeat" },
    { id: 5039, text: "🔊 חזור אחרי הקריין: Bus stop", options: ["Station", "Airport", "Port", "Bus stop"], correct: 3, explanation: "Bus stop - תחנת אוטובוס", category: "repeat" },
    { id: 5040, text: "🔊 חזור אחרי הקריין: Ticket", options: ["Ticket", "Bag", "Shoes", "Book"], correct: 0, explanation: "Ticket - כרטיס", category: "repeat" },
    { id: 5041, text: "🔊 חזור אחרי הקריין: Travel", options: ["Travel", "Stay", "Sleep", "Eat"], correct: 0, explanation: "Travel - לנסוע", category: "repeat" },
    { id: 5042, text: "🔊 חזור אחרי הקריין: Trip", options: ["Trip", "Stay", "Sleep", "Eat"], correct: 0, explanation: "Trip - נסיעה", category: "repeat" },
    { id: 5043, text: "🔊 חזור אחרי הקריין: Go", options: ["Go", "Come", "Stay", "Stop"], correct: 0, explanation: "Go - ללכת", category: "repeat" },
    { id: 5044, text: "🔊 חזור אחרי הקריין: Ride", options: ["Ride", "Walk", "Run", "Jump"], correct: 0, explanation: "Ride - לרכוב", category: "repeat" },
    { id: 5045, text: "🔊 חזור אחרי הקריין: Drive", options: ["Drive", "Walk", "Run", "Jump"], correct: 0, explanation: "Drive - לנהוג", category: "repeat" },
    { id: 5046, text: "🔊 חזור אחרי הקריין: Fly", options: ["Fly", "Walk", "Run", "Jump"], correct: 0, explanation: "Fly - לעוף", category: "repeat" },
    { id: 5047, text: "🔊 חזור אחרי הקריין: Sail", options: ["Sail", "Walk", "Run", "Jump"], correct: 0, explanation: "Sail - להפליג", category: "repeat" },
    { id: 5048, text: "🔊 חזור אחרי הקריין: Wheel", options: ["Wheel", "Door", "Window", "Roof"], correct: 0, explanation: "Wheel - גלגל", category: "repeat" },
    { id: 5049, text: "🔊 חזור אחרי הקריין: Road", options: ["Road", "Street", "Path", "Way"], correct: 0, explanation: "Road - כביש", category: "repeat" },
    { id: 5050, text: "🔊 חזור אחרי הקריין: Pack", options: ["Pack", "Unpack", "Open", "Close"], correct: 0, explanation: "Pack - לארוז", category: "repeat" },
    { id: 5051, text: "🔊 חזור אחרי הקריין: Bag", options: ["Bag", "Box", "Case", "Suitcase"], correct: 0, explanation: "Bag - תיק", category: "repeat" },
    { id: 5052, text: "🔊 חזור אחרי הקריין: Suitcase", options: ["Bag", "Box", "Case", "Suitcase"], correct: 3, explanation: "Suitcase - מזוודה", category: "repeat" },
    { id: 5053, text: "🔊 חזור אחרי הקריין: Map", options: ["Map", "Book", "Paper", "Card"], correct: 0, explanation: "Map - מפה", category: "repeat" },
    { id: 5054, text: "🔊 חזור אחרי הקריין: Luggage", options: ["Luggage", "Bag", "Box", "Case"], correct: 0, explanation: "Luggage - מזוודות", category: "repeat" },
    { id: 5055, text: "🔊 חזור אחרי הקריין: Journey", options: ["Journey", "Trip", "Travel", "Way"], correct: 0, explanation: "Journey - מסע", category: "repeat" },
    { id: 5056, text: "🔊 חזור אחרי הקריין: Destination", options: ["Destination", "Start", "Middle", "End"], correct: 0, explanation: "Destination - יעד", category: "repeat" },
    { id: 5057, text: "🔊 חזור אחרי הקריין: Passenger", options: ["Passenger", "Driver", "Pilot", "Captain"], correct: 0, explanation: "Passenger - נוסע", category: "repeat" },
    { id: 5058, text: "🔊 חזור אחרי הקריין: Driver", options: ["Passenger", "Driver", "Pilot", "Captain"], correct: 1, explanation: "Driver - נהג", category: "repeat" },
    { id: 5059, text: "🔊 חזור אחרי הקריין: Pilot", options: ["Passenger", "Driver", "Pilot", "Captain"], correct: 2, explanation: "Pilot - טייס", category: "repeat" },
    { id: 5060, text: "🔊 חזור אחרי הקריין: Captain", options: ["Passenger", "Driver", "Pilot", "Captain"], correct: 3, explanation: "Captain - קפטן", category: "repeat" }
    ],
    '2': [ // רמה 2 - בסיסי - תחבורה ונסיעות מורחבים
    // תחבורה מורחבת
    { id: 5101, text: "What is big and carries many people?", options: ["Car", "Bike", "Bus", "Train"], correct: 2, explanation: "אוטובוס גדול ומסיע הרבה אנשים", category: "vocabulary" },
    { id: 5102, text: "What is fast and goes on highways?", options: ["Car", "Bike", "Bus", "Train"], correct: 0, explanation: "מכונית מהירה ונעה על כבישים מהירים", category: "vocabulary" },
    { id: 5103, text: "What is long and has many cars?", options: ["Car", "Bike", "Bus", "Train"], correct: 3, explanation: "רכבת ארוכה ויש לה הרבה קרונות", category: "vocabulary" },
    { id: 5104, text: "What is small and has two wheels?", options: ["Car", "Motorcycle", "Bus", "Train"], correct: 1, explanation: "אופנוע קטן ויש לו שני גלגלים", category: "vocabulary" },
    { id: 5105, text: "What is big and has wings?", options: ["Car", "Bike", "Plane", "Boat"], correct: 2, explanation: "מטוס גדול ויש לו כנפיים", category: "vocabulary" },
    { id: 5106, text: "What is big and floats on water?", options: ["Car", "Bike", "Ship", "Plane"], correct: 2, explanation: "ספינה גדולה וצפה על המים", category: "vocabulary" },
    { id: 5107, text: "What goes underground?", options: ["Car", "Bike", "Subway", "Plane"], correct: 2, explanation: "רכבת תחתית נוסעת מתחת לאדמה", category: "vocabulary" },
    { id: 5108, text: "What is yellow and carries people?", options: ["Car", "Taxi", "Bus", "Train"], correct: 1, explanation: "מונית צהובה ומסיעה אנשים", category: "vocabulary" },
    
    // מקומות מורחבים
    { id: 5109, text: "Where do you catch a taxi?", options: ["Taxi stand", "Airport", "Port", "Stop"], correct: 0, explanation: "תופסים מונית בתחנת מוניות", category: "places" },
    { id: 5110, text: "Where do ships dock?", options: ["Station", "Airport", "Port", "Stop"], correct: 2, explanation: "ספינות עוגנות בנמל", category: "places" },
    { id: 5111, text: "Where do you buy tickets?", options: ["Ticket office", "Airport", "Port", "Stop"], correct: 0, explanation: "קונים כרטיסים במשרד כרטיסים", category: "places" },
    { id: 5112, text: "Where do trains stop?", options: ["Station", "Airport", "Port", "Stop"], correct: 0, explanation: "רכבת עוצרת בתחנה", category: "places" },
    
    // פעילויות נסיעה מורחבות
    { id: 5113, text: "What do you do when you arrive?", options: ["Leave", "Get off", "Stay", "Nothing"], correct: 1, explanation: "כשמגיעים, יורדים", category: "travel" },
    { id: 5114, text: "What do you do when you depart?", options: ["Arrive", "Leave", "Stay", "Nothing"], correct: 1, explanation: "כשיוצאים, עוזבים", category: "travel" },
    { id: 5115, text: "What do you show at the airport?", options: ["Ticket", "Bag", "Shoes", "Book"], correct: 0, explanation: "מראים כרטיס בשדה תעופה", category: "travel" },
    { id: 5116, text: "What do you check before traveling?", options: ["Passport", "Shoes", "Car", "Book"], correct: 0, explanation: "בודקים דרכון לפני נסיעה", category: "travel" },
    
    // אוצר מילים - תחבורה מורחבת
    { id: 5117, text: "What is the English word for 'אופנוע'?", options: ["Car", "Motorcycle", "Bus", "Train"], correct: 1, explanation: "המילה 'Motorcycle' פירושה 'אופנוע'", category: "vocabulary" },
    { id: 5118, text: "What is the English word for 'ספינה'?", options: ["Boat", "Ship", "Car", "Bike"], correct: 1, explanation: "המילה 'Ship' פירושה 'ספינה'", category: "vocabulary" },
    { id: 5119, text: "What is the English word for 'רכבת תחתית'?", options: ["Car", "Bike", "Subway", "Plane"], correct: 2, explanation: "המילה 'Subway' פירושה 'רכבת תחתית'", category: "vocabulary" },
    { id: 5120, text: "What is the English word for 'מונית'?", options: ["Car", "Taxi", "Bus", "Train"], correct: 1, explanation: "המילה 'Taxi' פירושה 'מונית'", category: "vocabulary" },
    
    // אוצר מילים - מקומות מורחבים
    { id: 5121, text: "What is the English word for 'נמל'?", options: ["Station", "Airport", "Port", "Stop"], correct: 2, explanation: "המילה 'Port' פירושה 'נמל'", category: "vocabulary" },
    { id: 5122, text: "What is the English word for 'תחנת מוניות'?", options: ["Taxi stand", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Taxi stand' פירושה 'תחנת מוניות'", category: "vocabulary" },
    { id: 5123, text: "What is the English word for 'משרד כרטיסים'?", options: ["Ticket office", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Ticket office' פירושה 'משרד כרטיסים'", category: "vocabulary" },
    
    // קריאה - תחבורה מורחבת
    { id: 5124, text: "Read: 'I take the subway to work. The subway goes underground.' Where does the subway go?", options: ["In the sky", "Underground", "On water", "On tracks"], correct: 1, explanation: "רכבת תחתית נוסעת מתחת לאדמה", category: "reading" },
    { id: 5125, text: "Read: 'I call a taxi. Taxis are yellow cars.' What color are taxis?", options: ["Red", "Blue", "Yellow", "Green"], correct: 2, explanation: "מוניות צהובות", category: "reading" },
    { id: 5126, text: "Read: 'I travel by ship. Ships dock at the port.' Where do ships dock?", options: ["Station", "Airport", "Port", "Stop"], correct: 2, explanation: "ספינות עוגנות בנמל", category: "reading" },
    { id: 5127, text: "Read: 'I ride a motorcycle. Motorcycles have two wheels.' How many wheels does a motorcycle have?", options: ["One", "Two", "Three", "Four"], correct: 1, explanation: "לאופנוע יש שני גלגלים", category: "reading" },
    
    // דקדוק בסיסי - תחבורה
    { id: 5128, text: "Complete: 'I ___ to school by bus every day.'", options: ["go", "goes", "went", "going"], correct: 0, explanation: "אני נוסע לבית ספר באוטובוס כל יום (הווה פשוט)", category: "grammar" },
    { id: 5129, text: "Complete: 'She ___ her bike to the park.'", options: ["ride", "rides", "rode", "riding"], correct: 1, explanation: "היא רוכבת על האופניים שלה לפארק (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 5130, text: "Complete: 'We ___ traveling by plane.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו נוסעים במטוס (הווה מתמשך, רבים)", category: "grammar" },
    { id: 5131, text: "Complete: 'They ___ a train yesterday.'", options: ["take", "takes", "took", "taking"], correct: 2, explanation: "הם לקחו רכבת אתמול (עבר פשוט)", category: "grammar" },
    { id: 5132, text: "Complete: 'He ___ a car next year.'", options: ["drive", "drives", "will drive", "drove"], correct: 2, explanation: "הוא ינהג במכונית בשנה הבאה (עתיד פשוט)", category: "grammar" },
    
    // שאלות חזרה - מילים מורחבות
    { id: 5133, text: "🔊 חזור אחרי הקריין: Motorcycle", options: ["Car", "Motorcycle", "Bus", "Train"], correct: 1, explanation: "Motorcycle - אופנוע", category: "repeat" },
    { id: 5134, text: "🔊 חזור אחרי הקריין: Ship", options: ["Boat", "Ship", "Car", "Bike"], correct: 1, explanation: "Ship - ספינה", category: "repeat" },
    { id: 5135, text: "🔊 חזור אחרי הקריין: Subway", options: ["Car", "Bike", "Subway", "Plane"], correct: 2, explanation: "Subway - רכבת תחתית", category: "repeat" },
    { id: 5136, text: "🔊 חזור אחרי הקריין: Taxi", options: ["Car", "Taxi", "Bus", "Train"], correct: 1, explanation: "Taxi - מונית", category: "repeat" },
    { id: 5137, text: "🔊 חזור אחרי הקריין: Port", options: ["Station", "Airport", "Port", "Stop"], correct: 2, explanation: "Port - נמל", category: "repeat" },
    { id: 5138, text: "🔊 חזור אחרי הקריין: Taxi stand", options: ["Taxi stand", "Airport", "Port", "Stop"], correct: 0, explanation: "Taxi stand - תחנת מוניות", category: "repeat" },
    { id: 5139, text: "🔊 חזור אחרי הקריין: Ticket office", options: ["Ticket office", "Airport", "Port", "Stop"], correct: 0, explanation: "Ticket office - משרד כרטיסים", category: "repeat" },
    { id: 5140, text: "🔊 חזור אחרי הקריין: Arrive", options: ["Arrive", "Leave", "Stay", "Stop"], correct: 0, explanation: "Arrive - להגיע", category: "repeat" },
    { id: 5141, text: "🔊 חזור אחרי הקריין: Depart", options: ["Arrive", "Depart", "Stay", "Stop"], correct: 1, explanation: "Depart - לצאת", category: "repeat" },
    { id: 5142, text: "🔊 חזור אחרי הקריין: Passport", options: ["Passport", "Ticket", "Bag", "Book"], correct: 0, explanation: "Passport - דרכון", category: "repeat" },
    { id: 5143, text: "🔊 חזור אחרי הקריין: Highway", options: ["Highway", "Road", "Street", "Path"], correct: 0, explanation: "Highway - כביש מהיר", category: "repeat" },
    { id: 5144, text: "🔊 חזור אחרי הקריין: Track", options: ["Track", "Road", "Street", "Path"], correct: 0, explanation: "Track - מסילה", category: "repeat" },
    { id: 5145, text: "🔊 חזור אחרי הקריין: Wing", options: ["Wing", "Wheel", "Door", "Window"], correct: 0, explanation: "Wing - כנף", category: "repeat" },
    { id: 5146, text: "🔊 חזור אחרי הקריין: Dock", options: ["Dock", "Stop", "Park", "Leave"], correct: 0, explanation: "Dock - לעגון", category: "repeat" },
    { id: 5147, text: "🔊 חזור אחרי הקריין: Check in", options: ["Check in", "Check out", "Leave", "Arrive"], correct: 0, explanation: "Check in - צ'ק אין", category: "repeat" },
    { id: 5148, text: "🔊 חזור אחרי הקריין: Board", options: ["Board", "Leave", "Arrive", "Stop"], correct: 0, explanation: "Board - לעלות", category: "repeat" },
    { id: 5149, text: "🔊 חזור אחרי הקריין: Get off", options: ["Get on", "Get off", "Stay", "Stop"], correct: 1, explanation: "Get off - לרדת", category: "repeat" },
    { id: 5150, text: "🔊 חזור אחרי הקריין: Delay", options: ["Delay", "On time", "Early", "Late"], correct: 0, explanation: "Delay - עיכוב", category: "repeat" },
    { id: 5151, text: "🔊 חזור אחרי הקריין: On time", options: ["Delay", "On time", "Early", "Late"], correct: 1, explanation: "On time - בזמן", category: "repeat" },
    { id: 5152, text: "🔊 חזור אחרי הקריין: Schedule", options: ["Schedule", "Time", "Clock", "Watch"], correct: 0, explanation: "Schedule - לוח זמנים", category: "repeat" },
    { id: 5153, text: "🔊 חזור אחרי הקריין: Route", options: ["Route", "Road", "Street", "Path"], correct: 0, explanation: "Route - מסלול", category: "repeat" },
    { id: 5154, text: "🔊 חזור אחרי הקריין: Speed", options: ["Speed", "Slow", "Fast", "Quick"], correct: 0, explanation: "Speed - מהירות", category: "repeat" },
    { id: 5155, text: "🔊 חזור אחרי הקריין: Distance", options: ["Distance", "Close", "Near", "Far"], correct: 0, explanation: "Distance - מרחק", category: "repeat" },
    { id: 5156, text: "🔊 חזור אחרי הקריין: Fuel", options: ["Fuel", "Water", "Food", "Air"], correct: 0, explanation: "Fuel - דלק", category: "repeat" },
    { id: 5157, text: "🔊 חזור אחרי הקריין: Engine", options: ["Engine", "Wheel", "Door", "Window"], correct: 0, explanation: "Engine - מנוע", category: "repeat" },
    { id: 5158, text: "🔊 חזור אחרי הקריין: Brake", options: ["Brake", "Gas", "Speed", "Stop"], correct: 0, explanation: "Brake - בלם", category: "repeat" },
    { id: 5159, text: "🔊 חזור אחרי הקריין: Steering wheel", options: ["Steering wheel", "Wheel", "Door", "Window"], correct: 0, explanation: "Steering wheel - הגה", category: "repeat" },
    { id: 5160, text: "🔊 חזור אחרי הקריין: Seatbelt", options: ["Seatbelt", "Belt", "Strap", "Rope"], correct: 0, explanation: "Seatbelt - חגורת בטיחות", category: "repeat" }
    ],
    '3': [ // רמה 3 - בינוני - תחבורה ונסיעות מתקדמים
    // תחבורה מתקדמת
    { id: 5201, text: "What is fast and has a propeller?", options: ["Car", "Bike", "Helicopter", "Plane"], correct: 2, explanation: "מסוק מהיר ויש לו מדחף", category: "vocabulary" },
    { id: 5202, text: "What is big and carries cargo?", options: ["Car", "Truck", "Bus", "Train"], correct: 1, explanation: "משאית גדולה ונושאת מטען", category: "vocabulary" },
    { id: 5203, text: "What is small and has a motor?", options: ["Car", "Scooter", "Bus", "Train"], correct: 1, explanation: "קורקינט קטן ויש לו מנוע", category: "vocabulary" },
    { id: 5204, text: "What is big and has many floors?", options: ["Car", "Bike", "Cruise ship", "Plane"], correct: 2, explanation: "אניית תענוגות גדולה ויש לה הרבה קומות", category: "vocabulary" },
    { id: 5205, text: "What is electric and quiet?", options: ["Car", "Electric car", "Bus", "Train"], correct: 1, explanation: "מכונית חשמלית חשמלית ושקטה", category: "vocabulary" },
    { id: 5206, text: "What is big and has sails?", options: ["Car", "Bike", "Sailboat", "Plane"], correct: 2, explanation: "סירת מפרש גדולה ויש לה מפרשים", category: "vocabulary" },
    { id: 5207, text: "What is fast and goes on rails?", options: ["Car", "Bike", "Bullet train", "Plane"], correct: 2, explanation: "רכבת מהירה מהירה ונעה על מסילות", category: "vocabulary" },
    { id: 5208, text: "What is small and rides on water?", options: ["Car", "Bike", "Jet ski", "Plane"], correct: 2, explanation: "ג'ט סקי קטן ונוסע על המים", category: "vocabulary" },
    
    // מקומות מתקדמים
    { id: 5209, text: "Where do you rent a car?", options: ["Car rental", "Airport", "Port", "Stop"], correct: 0, explanation: "שוכרים מכונית במשרד השכרת רכב", category: "places" },
    { id: 5210, text: "Where do you fill up with gas?", options: ["Gas station", "Airport", "Port", "Stop"], correct: 0, explanation: "ממלאים דלק בתחנת דלק", category: "places" },
    { id: 5211, text: "Where do you wait for a train?", options: ["Platform", "Airport", "Port", "Stop"], correct: 0, explanation: "מחכים לרכבת ברציף", category: "places" },
    { id: 5212, text: "Where do you park your car?", options: ["Parking garage", "Airport", "Port", "Stop"], correct: 0, explanation: "חונים את המכונית בחניון מקורה", category: "places" },
    
    // פעילויות נסיעה מתקדמות
    { id: 5213, text: "What do you do when you book a flight?", options: ["Reserve a seat", "Cancel", "Nothing", "Sleep"], correct: 0, explanation: "כשמזמינים טיסה, שומרים מקום", category: "travel" },
    { id: 5214, text: "What do you do when you check in?", options: ["Get your boarding pass", "Leave", "Nothing", "Sleep"], correct: 0, explanation: "כשעושים צ'ק אין, מקבלים כרטיס עלייה", category: "travel" },
    { id: 5215, text: "What do you do when you board?", options: ["Get on the plane", "Get off", "Nothing", "Sleep"], correct: 0, explanation: "כשעולים, עולים למטוס", category: "travel" },
    { id: 5216, text: "What do you do when you land?", options: ["Arrive", "Depart", "Nothing", "Sleep"], correct: 0, explanation: "כשנוחתים, מגיעים", category: "travel" },
    
    // אוצר מילים - תחבורה מתקדמת
    { id: 5217, text: "What is the English word for 'מסוק'?", options: ["Plane", "Helicopter", "Car", "Bike"], correct: 1, explanation: "המילה 'Helicopter' פירושה 'מסוק'", category: "vocabulary" },
    { id: 5218, text: "What is the English word for 'משאית'?", options: ["Car", "Truck", "Bus", "Train"], correct: 1, explanation: "המילה 'Truck' פירושה 'משאית'", category: "vocabulary" },
    { id: 5219, text: "What is the English word for 'קורקינט'?", options: ["Car", "Scooter", "Bus", "Train"], correct: 1, explanation: "המילה 'Scooter' פירושה 'קורקינט'", category: "vocabulary" },
    { id: 5220, text: "What is the English word for 'אניית תענוגות'?", options: ["Boat", "Cruise ship", "Car", "Bike"], correct: 1, explanation: "המילה 'Cruise ship' פירושה 'אניית תענוגות'", category: "vocabulary" },
    { id: 5221, text: "What is the English word for 'מכונית חשמלית'?", options: ["Car", "Electric car", "Bus", "Train"], correct: 1, explanation: "המילה 'Electric car' פירושה 'מכונית חשמלית'", category: "vocabulary" },
    { id: 5222, text: "What is the English word for 'סירת מפרש'?", options: ["Boat", "Sailboat", "Car", "Bike"], correct: 1, explanation: "המילה 'Sailboat' פירושה 'סירת מפרש'", category: "vocabulary" },
    { id: 5223, text: "What is the English word for 'רכבת מהירה'?", options: ["Train", "Bullet train", "Bus", "Car"], correct: 1, explanation: "המילה 'Bullet train' פירושה 'רכבת מהירה'", category: "vocabulary" },
    { id: 5224, text: "What is the English word for 'ג'ט סקי'?", options: ["Boat", "Jet ski", "Car", "Bike"], correct: 1, explanation: "המילה 'Jet ski' פירושה 'ג'ט סקי'", category: "vocabulary" },
    
    // אוצר מילים - מקומות מתקדמים
    { id: 5225, text: "What is the English word for 'תחנת דלק'?", options: ["Gas station", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Gas station' פירושה 'תחנת דלק'", category: "vocabulary" },
    { id: 5226, text: "What is the English word for 'רציף'?", options: ["Platform", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Platform' פירושה 'רציף'", category: "vocabulary" },
    { id: 5227, text: "What is the English word for 'חניון מקורה'?", options: ["Parking garage", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Parking garage' פירושה 'חניון מקורה'", category: "vocabulary" },
    { id: 5228, text: "What is the English word for 'משרד השכרת רכב'?", options: ["Car rental", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Car rental' פירושה 'משרד השכרת רכב'", category: "vocabulary" },
    
    // קריאה - תחבורה מתקדמת
    { id: 5229, text: "Read: 'I rent a car for my trip. I go to the car rental office.' Where do you go to rent a car?", options: ["Car rental", "Airport", "Port", "Stop"], correct: 0, explanation: "הולכים למשרד השכרת רכב כדי לשכור מכונית", category: "reading" },
    { id: 5230, text: "Read: 'I fill up my car at the gas station. I need fuel for my trip.' Where do you fill up with gas?", options: ["Gas station", "Airport", "Port", "Stop"], correct: 0, explanation: "ממלאים דלק בתחנת דלק", category: "reading" },
    { id: 5231, text: "Read: 'I wait for the train on the platform. The train arrives at 3 PM.' Where do you wait for the train?", options: ["Platform", "Airport", "Port", "Stop"], correct: 0, explanation: "מחכים לרכבת ברציף", category: "reading" },
    { id: 5232, text: "Read: 'I travel by helicopter. Helicopters have propellers and can hover.' What do helicopters have?", options: ["Wings", "Propellers", "Wheels", "Sails"], correct: 1, explanation: "למסוקים יש מדחפים", category: "reading" },
    
    // דקדוק - תחבורה מתקדמת
    { id: 5233, text: "Complete: 'I ___ been traveling for three hours.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "אני נוסע כבר שלוש שעות (הווה מושלם מתמשך)", category: "grammar" },
    { id: 5234, text: "Complete: 'She ___ boarding the plane when I called.'", options: ["am", "is", "was", "were"], correct: 2, explanation: "היא עלתה למטוס כשהתקשרתי (עבר מתמשך)", category: "grammar" },
    { id: 5235, text: "Complete: 'We ___ going to travel by train tomorrow.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו הולכים לנסוע ברכבת מחר (עתיד עם going to)", category: "grammar" },
    { id: 5236, text: "Complete: 'They ___ already arrived at the airport.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "הם כבר הגיעו לשדה התעופה (הווה מושלם)", category: "grammar" },
    { id: 5237, text: "Complete: 'He ___ not like to travel by plane.'", options: ["do", "does", "is", "are"], correct: 1, explanation: "הוא לא אוהב לנסוע במטוס (הווה פשוט שלילי, גוף שלישי יחיד)", category: "grammar" },
    
    // שאלות חזרה - מילים מתקדמות
    { id: 5238, text: "🔊 חזור אחרי הקריין: Helicopter", options: ["Plane", "Helicopter", "Car", "Bike"], correct: 1, explanation: "Helicopter - מסוק", category: "repeat" },
    { id: 5239, text: "🔊 חזור אחרי הקריין: Truck", options: ["Car", "Truck", "Bus", "Train"], correct: 1, explanation: "Truck - משאית", category: "repeat" },
    { id: 5240, text: "🔊 חזור אחרי הקריין: Scooter", options: ["Car", "Scooter", "Bus", "Train"], correct: 1, explanation: "Scooter - קורקינט", category: "repeat" },
    { id: 5241, text: "🔊 חזור אחרי הקריין: Cruise ship", options: ["Boat", "Cruise ship", "Car", "Bike"], correct: 1, explanation: "Cruise ship - אניית תענוגות", category: "repeat" },
    { id: 5242, text: "🔊 חזור אחרי הקריין: Electric car", options: ["Car", "Electric car", "Bus", "Train"], correct: 1, explanation: "Electric car - מכונית חשמלית", category: "repeat" },
    { id: 5243, text: "🔊 חזור אחרי הקריין: Sailboat", options: ["Boat", "Sailboat", "Car", "Bike"], correct: 1, explanation: "Sailboat - סירת מפרש", category: "repeat" },
    { id: 5244, text: "🔊 חזור אחרי הקריין: Bullet train", options: ["Train", "Bullet train", "Bus", "Car"], correct: 1, explanation: "Bullet train - רכבת מהירה", category: "repeat" },
    { id: 5245, text: "🔊 חזור אחרי הקריין: Jet ski", options: ["Boat", "Jet ski", "Car", "Bike"], correct: 1, explanation: "Jet ski - ג'ט סקי", category: "repeat" },
    { id: 5246, text: "🔊 חזור אחרי הקריין: Gas station", options: ["Gas station", "Airport", "Port", "Stop"], correct: 0, explanation: "Gas station - תחנת דלק", category: "repeat" },
    { id: 5247, text: "🔊 חזור אחרי הקריין: Platform", options: ["Platform", "Airport", "Port", "Stop"], correct: 0, explanation: "Platform - רציף", category: "repeat" },
    { id: 5248, text: "🔊 חזור אחרי הקריין: Parking garage", options: ["Parking garage", "Airport", "Port", "Stop"], correct: 0, explanation: "Parking garage - חניון מקורה", category: "repeat" },
    { id: 5249, text: "🔊 חזור אחרי הקריין: Car rental", options: ["Car rental", "Airport", "Port", "Stop"], correct: 0, explanation: "Car rental - משרד השכרת רכב", category: "repeat" },
    { id: 5250, text: "🔊 חזור אחרי הקריין: Book", options: ["Book", "Cancel", "Reserve", "Order"], correct: 0, explanation: "Book - להזמין", category: "repeat" },
    { id: 5251, text: "🔊 חזור אחרי הקריין: Reserve", options: ["Book", "Cancel", "Reserve", "Order"], correct: 2, explanation: "Reserve - לשמור", category: "repeat" },
    { id: 5252, text: "🔊 חזור אחרי הקריין: Boarding pass", options: ["Boarding pass", "Ticket", "Passport", "Bag"], correct: 0, explanation: "Boarding pass - כרטיס עלייה", category: "repeat" },
    { id: 5253, text: "🔊 חזור אחרי הקריין: Land", options: ["Land", "Take off", "Arrive", "Depart"], correct: 0, explanation: "Land - לנחות", category: "repeat" },
    { id: 5254, text: "🔊 חזור אחרי הקריין: Take off", options: ["Land", "Take off", "Arrive", "Depart"], correct: 1, explanation: "Take off - להמריא", category: "repeat" },
    { id: 5255, text: "🔊 חזור אחרי הקריין: Propeller", options: ["Propeller", "Wing", "Wheel", "Door"], correct: 0, explanation: "Propeller - מדחף", category: "repeat" },
    { id: 5256, text: "🔊 חזור אחרי הקריין: Cargo", options: ["Cargo", "Bag", "Luggage", "Suitcase"], correct: 0, explanation: "Cargo - מטען", category: "repeat" },
    { id: 5257, text: "🔊 חזור אחרי הקריין: Sail", options: ["Sail", "Wing", "Wheel", "Door"], correct: 0, explanation: "Sail - מפרש", category: "repeat" },
    { id: 5258, text: "🔊 חזור אחרי הקריין: Hover", options: ["Hover", "Fly", "Land", "Take off"], correct: 0, explanation: "Hover - לרחף", category: "repeat" },
    { id: 5259, text: "🔊 חזור אחרי הקריין: Cancel", options: ["Book", "Cancel", "Reserve", "Order"], correct: 0, explanation: "Cancel - לבטל", category: "repeat" },
    { id: 5260, text: "🔊 חזור אחרי הקריין: Confirm", options: ["Book", "Cancel", "Reserve", "Confirm"], correct: 3, explanation: "Confirm - לאשר", category: "repeat" }
    ],
    '4': [ // רמה 4 - מתקדם - תחבורה ונסיעות מתקדמים מאוד  
    // תחבורה מתקדמת מאוד
    { id: 5301, text: "What is very fast and flies high?", options: ["Car", "Bike", "Jet plane", "Boat"], correct: 2, explanation: "מטוס סילון מאוד מהיר ועף גבוה", category: "vocabulary" },
    { id: 5302, text: "What is big and carries people on vacation?", options: ["Car", "Bike", "Cruise ship", "Truck"], correct: 2, explanation: "אניית תענוגות גדולה ומסיעה אנשים בחופשה", category: "vocabulary" },
    { id: 5303, text: "What is fast and goes on two wheels?", options: ["Car", "Motorcycle", "Bus", "Train"], correct: 1, explanation: "אופנוע מהיר ונע על שני גלגלים", category: "vocabulary" },
    { id: 5304, text: "What is big and has many seats?", options: ["Car", "Bike", "Airplane", "Boat"], correct: 2, explanation: "מטוס גדול ויש לו הרבה מושבים", category: "vocabulary" },
    { id: 5305, text: "What is small and can go anywhere?", options: ["Car", "Bike", "ATV", "Plane"], correct: 2, explanation: "ATV קטן ויכול לנסוע לכל מקום", category: "vocabulary" },
    { id: 5306, text: "What is big and has a crane?", options: ["Car", "Bike", "Crane truck", "Plane"], correct: 2, explanation: "משאית מנוף גדולה ויש לה מנוף", category: "vocabulary" },
    { id: 5307, text: "What is fast and has no wheels?", options: ["Car", "Bike", "Hovercraft", "Plane"], correct: 2, explanation: "רחפת מהירה ואין לה גלגלים", category: "vocabulary" },
    { id: 5308, text: "What is big and carries freight?", options: ["Car", "Bike", "Freight train", "Plane"], correct: 2, explanation: "רכבת משא גדולה ונושאת מטען", category: "vocabulary" },
    
    // מקומות מתקדמים מאוד
    { id: 5309, text: "Where do you get your luggage?", options: ["Baggage claim", "Airport", "Port", "Stop"], correct: 0, explanation: "לוקחים את המזוודות במחלקת המזוודות", category: "places" },
    { id: 5310, text: "Where do you wait to board?", options: ["Gate", "Airport", "Port", "Stop"], correct: 0, explanation: "מחכים לעלות בשער", category: "places" },
    { id: 5311, text: "Where do you go through security?", options: ["Security checkpoint", "Airport", "Port", "Stop"], correct: 0, explanation: "עוברים ביקורת ביטחון", category: "places" },
    { id: 5312, text: "Where do you get your passport stamped?", options: ["Customs", "Airport", "Port", "Stop"], correct: 0, explanation: "חותמים את הדרכון במכס", category: "places" },
    
    // פעילויות נסיעה מתקדמות מאוד
    { id: 5313, text: "What do you do when you go through customs?", options: ["Show your passport", "Sleep", "Nothing", "Eat"], correct: 0, explanation: "כשעוברים במכס, מראים את הדרכון", category: "travel" },
    { id: 5314, text: "What do you do when you go through security?", options: ["Go through screening", "Sleep", "Nothing", "Eat"], correct: 0, explanation: "כשעוברים ביקורת ביטחון, עוברים סריקה", category: "travel" },
    { id: 5315, text: "What do you do when you check your luggage?", options: ["Give it to the airline", "Keep it", "Nothing", "Sleep"], correct: 0, explanation: "כשמסרנים מזוודות, נותנים לחברת תעופה", category: "travel" },
    { id: 5316, text: "What do you do when you have a layover?", options: ["Wait for your next flight", "Leave", "Nothing", "Sleep"], correct: 0, explanation: "כשיש עצירת ביניים, מחכים לטיסה הבאה", category: "travel" },
    
    // אוצר מילים - תחבורה מתקדמת מאוד
    { id: 5317, text: "What is the English word for 'מטוס סילון'?", options: ["Plane", "Jet plane", "Car", "Bike"], correct: 1, explanation: "המילה 'Jet plane' פירושה 'מטוס סילון'", category: "vocabulary" },
    { id: 5318, text: "What is the English word for 'ATV'?", options: ["Car", "Bike", "ATV", "Plane"], correct: 2, explanation: "המילה 'ATV' פירושה 'ATV' (כלי רכב שטח)", category: "vocabulary" },
    { id: 5319, text: "What is the English word for 'משאית מנוף'?", options: ["Car", "Bike", "Crane truck", "Plane"], correct: 2, explanation: "המילה 'Crane truck' פירושה 'משאית מנוף'", category: "vocabulary" },
    { id: 5320, text: "What is the English word for 'רחפת'?", options: ["Boat", "Hovercraft", "Car", "Bike"], correct: 1, explanation: "המילה 'Hovercraft' פירושה 'רחפת'", category: "vocabulary" },
    { id: 5321, text: "What is the English word for 'רכבת משא'?", options: ["Train", "Freight train", "Bus", "Car"], correct: 1, explanation: "המילה 'Freight train' פירושה 'רכבת משא'", category: "vocabulary" },
    
    // אוצר מילים - מקומות מתקדמים מאוד
    { id: 5322, text: "What is the English word for 'מחלקת מזוודות'?", options: ["Baggage claim", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Baggage claim' פירושה 'מחלקת מזוודות'", category: "vocabulary" },
    { id: 5323, text: "What is the English word for 'שער'?", options: ["Gate", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Gate' פירושה 'שער'", category: "vocabulary" },
    { id: 5324, text: "What is the English word for 'ביקורת ביטחון'?", options: ["Security checkpoint", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Security checkpoint' פירושה 'ביקורת ביטחון'", category: "vocabulary" },
    { id: 5325, text: "What is the English word for 'מכס'?", options: ["Customs", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Customs' פירושה 'מכס'", category: "vocabulary" },
    
    // קריאה - תחבורה מתקדמת מאוד
    { id: 5326, text: "Read: 'I go through security before boarding. Security checks my bags.' What do you do before boarding?", options: ["Go through security", "Sleep", "Nothing", "Eat"], correct: 0, explanation: "עוברים ביקורת ביטחון לפני העלייה", category: "reading" },
    { id: 5327, text: "Read: 'I pick up my luggage at baggage claim. My flight arrived at gate 5.' Where do you pick up your luggage?", options: ["Baggage claim", "Airport", "Port", "Stop"], correct: 0, explanation: "לוקחים את המזוודות במחלקת המזוודות", category: "reading" },
    { id: 5328, text: "Read: 'I have a layover in Paris. I wait for my connecting flight.' What do you do during a layover?", options: ["Wait for connecting flight", "Leave", "Nothing", "Sleep"], correct: 0, explanation: "מחכים לטיסת המשך בעצירת ביניים", category: "reading" },
    { id: 5329, text: "Read: 'I go through customs. I show my passport to the officer.' What do you show at customs?", options: ["Ticket", "Passport", "Bag", "Book"], correct: 1, explanation: "מראים את הדרכון במכס", category: "reading" },
    
    // דקדוק - תחבורה מתקדמת מאוד
    { id: 5330, text: "Complete: 'I ___ been waiting for my flight for two hours.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "אני מחכה לטיסה שלי כבר שעתיים (הווה מושלם מתמשך)", category: "grammar" },
    { id: 5331, text: "Complete: 'She ___ already checked in when I arrived.'", options: ["has", "have", "had", "having"], correct: 2, explanation: "היא כבר עשתה צ'ק אין כשהגעתי (עבר מושלם)", category: "grammar" },
    { id: 5332, text: "Complete: 'We ___ going to travel by cruise ship next month.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו הולכים לנסוע באניית תענוגות בחודש הבא (עתיד עם going to)", category: "grammar" },
    { id: 5333, text: "Complete: 'They ___ not packed their bags yet.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "הם עדיין לא ארזו את התיקים (הווה מושלם שלילי)", category: "grammar" },
    { id: 5334, text: "Complete: 'He ___ never traveled by helicopter before.'", options: ["has", "have", "had", "having"], correct: 0, explanation: "הוא מעולם לא נסע במסוק לפני (הווה מושלם)", category: "grammar" },
    
    // שאלות חזרה - מילים מתקדמות מאוד  
    { id: 5335, text: "🔊 חזור אחרי הקריין: Jet plane", options: ["Plane", "Jet plane", "Car", "Bike"], correct: 1, explanation: "Jet plane - מטוס סילון", category: "repeat" },
    { id: 5336, text: "🔊 חזור אחרי הקריין: ATV", options: ["Car", "Bike", "ATV", "Plane"], correct: 2, explanation: "ATV - כלי רכב שטח", category: "repeat" },
    { id: 5337, text: "🔊 חזור אחרי הקריין: Crane truck", options: ["Car", "Bike", "Crane truck", "Plane"], correct: 2, explanation: "Crane truck - משאית מנוף", category: "repeat" },
    { id: 5338, text: "🔊 חזור אחרי הקריין: Hovercraft", options: ["Boat", "Hovercraft", "Car", "Bike"], correct: 1, explanation: "Hovercraft - רחפת", category: "repeat" },
    { id: 5339, text: "🔊 חזור אחרי הקריין: Freight train", options: ["Train", "Freight train", "Bus", "Car"], correct: 1, explanation: "Freight train - רכבת משא", category: "repeat" },
    { id: 5340, text: "🔊 חזור אחרי הקריין: Baggage claim", options: ["Baggage claim", "Airport", "Port", "Stop"], correct: 0, explanation: "Baggage claim - מחלקת מזוודות", category: "repeat" },
    { id: 5341, text: "🔊 חזור אחרי הקריין: Gate", options: ["Gate", "Airport", "Port", "Stop"], correct: 0, explanation: "Gate - שער", category: "repeat" },
    { id: 5342, text: "🔊 חזור אחרי הקריין: Security checkpoint", options: ["Security checkpoint", "Airport", "Port", "Stop"], correct: 0, explanation: "Security checkpoint - ביקורת ביטחון", category: "repeat" },
    { id: 5343, text: "🔊 חזור אחרי הקריין: Customs", options: ["Customs", "Airport", "Port", "Stop"], correct: 0, explanation: "Customs - מכס", category: "repeat" },
    { id: 5344, text: "🔊 חזור אחרי הקריין: Layover", options: ["Layover", "Stop", "Delay", "Arrival"], correct: 0, explanation: "Layover - עצירת ביניים", category: "repeat" },
    { id: 5345, text: "🔊 חזור אחרי הקריין: Connecting flight", options: ["Connecting flight", "Direct flight", "Stop", "Delay"], correct: 0, explanation: "Connecting flight - טיסת המשך", category: "repeat" },
    { id: 5346, text: "🔊 חזור אחרי הקריין: Direct flight", options: ["Connecting flight", "Direct flight", "Stop", "Delay"], correct: 1, explanation: "Direct flight - טיסה ישירה", category: "repeat" },
    { id: 5347, text: "🔊 חזור אחרי הקריין: Screening", options: ["Screening", "Check", "Search", "Inspection"], correct: 0, explanation: "Screening - סריקה", category: "repeat" },
    { id: 5348, text: "🔊 חזור אחרי הקריין: Inspection", options: ["Screening", "Check", "Search", "Inspection"], correct: 3, explanation: "Inspection - ביקורת", category: "repeat" },
    { id: 5349, text: "🔊 חזור אחרי הקריין: Freight", options: ["Freight", "Passenger", "Cargo", "Luggage"], correct: 0, explanation: "Freight - מטען", category: "repeat" },
    { id: 5350, text: "🔊 חזור אחרי הקריין: Passenger", options: ["Freight", "Passenger", "Cargo", "Luggage"], correct: 1, explanation: "Passenger - נוסע", category: "repeat" },
    { id: 5351, text: "🔊 חזור אחרי הקריין: Terminal", options: ["Terminal", "Station", "Airport", "Port"], correct: 0, explanation: "Terminal - טרמינל", category: "repeat" },
    { id: 5352, text: "🔊 חזור אחרי הקריין: Concourse", options: ["Concourse", "Terminal", "Station", "Airport"], correct: 0, explanation: "Concourse - אולם", category: "repeat" },
    { id: 5353, text: "🔊 חזור אחרי הקריין: Runway", options: ["Runway", "Road", "Street", "Path"], correct: 0, explanation: "Runway - מסלול המראה", category: "repeat" },
    { id: 5354, text: "🔊 חזור אחרי הקריין: Turbulence", options: ["Turbulence", "Smooth", "Calm", "Steady"], correct: 0, explanation: "Turbulence - מערבולות", category: "repeat" },
    { id: 5355, text: "🔊 חזור אחרי הקריין: Altitude", options: ["Altitude", "Height", "Distance", "Speed"], correct: 0, explanation: "Altitude - גובה", category: "repeat" },
    { id: 5356, text: "🔊 חזור אחרי הקריין: Velocity", options: ["Velocity", "Speed", "Distance", "Time"], correct: 0, explanation: "Velocity - מהירות", category: "repeat" },
    { id: 5357, text: "🔊 חזור אחרי הקריין: Navigation", options: ["Navigation", "Direction", "Path", "Route"], correct: 0, explanation: "Navigation - ניווט", category: "repeat" },
    { id: 5358, text: "🔊 חזור אחרי הקריין: Compass", options: ["Compass", "Map", "GPS", "Watch"], correct: 0, explanation: "Compass - מצפן", category: "repeat" },
    { id: 5359, text: "🔊 חזור אחרי הקריין: GPS", options: ["Compass", "Map", "GPS", "Watch"], correct: 2, explanation: "GPS - GPS", category: "repeat" },
    { id: 5360, text: "🔊 חזור אחרי הקריין: Itinerary", options: ["Itinerary", "Schedule", "Plan", "Route"], correct: 0, explanation: "Itinerary - מסלול נסיעה", category: "repeat" }
    ],
    '5': [ // רמה 5 - מומחה - תחבורה ונסיעות מומחה
    // תחבורה מומחה
    { id: 5401, text: "What is a supersonic aircraft?", options: ["Car", "Bike", "Supersonic plane", "Boat"], correct: 2, explanation: "מטוס על-קולי הוא מטוס שנוסע מהר מהקול", category: "vocabulary" },
    { id: 5402, text: "What is a maglev train?", options: ["Car", "Bike", "Maglev train", "Plane"], correct: 2, explanation: "רכבת מגלב היא רכבת שנוסעת על כוח מגנטי", category: "vocabulary" },
    { id: 5403, text: "What is a hyperloop?", options: ["Car", "Bike", "Hyperloop", "Plane"], correct: 2, explanation: "היפרלופ הוא מערכת תחבורה מהירה מאוד", category: "vocabulary" },
    { id: 5404, text: "What is an autonomous vehicle?", options: ["Car", "Bike", "Self-driving car", "Plane"], correct: 2, explanation: "רכב אוטונומי הוא רכב שנוהג בעצמו", category: "vocabulary" },
    { id: 5405, text: "What is a cargo plane?", options: ["Car", "Bike", "Cargo plane", "Boat"], correct: 2, explanation: "מטוס מטען הוא מטוס שנושא מטען", category: "vocabulary" },
    { id: 5406, text: "What is a charter flight?", options: ["Car", "Bike", "Charter flight", "Boat"], correct: 2, explanation: "טיסה שכורה היא טיסה פרטית", category: "vocabulary" },
    { id: 5407, text: "What is a commercial flight?", options: ["Car", "Bike", "Commercial flight", "Boat"], correct: 2, explanation: "טיסה מסחרית היא טיסה רגילה", category: "vocabulary" },
    { id: 5408, text: "What is a private jet?", options: ["Car", "Bike", "Private jet", "Boat"], correct: 2, explanation: "מטוס פרטי הוא מטוס לשימוש פרטי", category: "vocabulary" },
    
    // מקומות מומחה
    { id: 5409, text: "Where do you find a control tower?", options: ["Control tower", "Airport", "Port", "Stop"], correct: 0, explanation: "מוצאים מגדל פיקוח בשדה תעופה", category: "places" },
    { id: 5410, text: "Where do you find a hangar?", options: ["Hangar", "Airport", "Port", "Stop"], correct: 0, explanation: "מוצאים האנגר בשדה תעופה", category: "places" },
    { id: 5411, text: "Where do you find a tarmac?", options: ["Tarmac", "Airport", "Port", "Stop"], correct: 0, explanation: "מוצאים טרמינל בשדה תעופה", category: "places" },
    { id: 5412, text: "Where do you find a helipad?", options: ["Helipad", "Airport", "Port", "Stop"], correct: 0, explanation: "מוצאים מסוקון במסוק", category: "places" },
    
    // פעילויות נסיעה מומחה
    { id: 5413, text: "What do you do when you have a connecting flight?", options: ["Change planes", "Stay", "Nothing", "Sleep"], correct: 0, explanation: "כשיש טיסת המשך, מחליפים מטוסים", category: "travel" },
    { id: 5414, text: "What do you do when you have a non-stop flight?", options: ["Fly directly", "Stop", "Nothing", "Sleep"], correct: 0, explanation: "כשיש טיסה ישירה, טסים ישירות", category: "travel" },
    { id: 5415, text: "What do you do when you upgrade?", options: ["Get better seats", "Stay", "Nothing", "Sleep"], correct: 0, explanation: "כשמשדרגים, מקבלים מושבים טובים יותר", category: "travel" },
    { id: 5416, text: "What do you do when you have a red-eye flight?", options: ["Fly overnight", "Fly during day", "Nothing", "Sleep"], correct: 0, explanation: "כשיש טיסת לילה, טסים בלילה", category: "travel" },
    
    // אוצר מילים - תחבורה מומחה
    { id: 5417, text: "What is the English word for 'מטוס על-קולי'?", options: ["Plane", "Supersonic plane", "Car", "Bike"], correct: 1, explanation: "המילה 'Supersonic plane' פירושה 'מטוס על-קולי'", category: "vocabulary" },
    { id: 5418, text: "What is the English word for 'רכבת מגלב'?", options: ["Train", "Maglev train", "Bus", "Car"], correct: 1, explanation: "המילה 'Maglev train' פירושה 'רכבת מגלב'", category: "vocabulary" },
    { id: 5419, text: "What is the English word for 'היפרלופ'?", options: ["Car", "Bike", "Hyperloop", "Plane"], correct: 2, explanation: "המילה 'Hyperloop' פירושה 'היפרלופ'", category: "vocabulary" },
    { id: 5420, text: "What is the English word for 'רכב אוטונומי'?", options: ["Car", "Bike", "Self-driving car", "Plane"], correct: 2, explanation: "המילה 'Self-driving car' פירושה 'רכב אוטונומי'", category: "vocabulary" },
    { id: 5421, text: "What is the English word for 'מטוס מטען'?", options: ["Plane", "Cargo plane", "Car", "Bike"], correct: 1, explanation: "המילה 'Cargo plane' פירושה 'מטוס מטען'", category: "vocabulary" },
    { id: 5422, text: "What is the English word for 'טיסה שכורה'?", options: ["Flight", "Charter flight", "Car", "Bike"], correct: 1, explanation: "המילה 'Charter flight' פירושה 'טיסה שכורה'", category: "vocabulary" },
    { id: 5423, text: "What is the English word for 'טיסה מסחרית'?", options: ["Flight", "Commercial flight", "Car", "Bike"], correct: 1, explanation: "המילה 'Commercial flight' פירושה 'טיסה מסחרית'", category: "vocabulary" },
    { id: 5424, text: "What is the English word for 'מטוס פרטי'?", options: ["Plane", "Private jet", "Car", "Bike"], correct: 1, explanation: "המילה 'Private jet' פירושה 'מטוס פרטי'", category: "vocabulary" },
    
    // אוצר מילים - מקומות מומחה
    { id: 5425, text: "What is the English word for 'מגדל פיקוח'?", options: ["Control tower", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Control tower' פירושה 'מגדל פיקוח'", category: "vocabulary" },
    { id: 5426, text: "What is the English word for 'האנגר'?", options: ["Hangar", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Hangar' פירושה 'האנגר'", category: "vocabulary" },
    { id: 5427, text: "What is the English word for 'טרמינל'?", options: ["Tarmac", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Tarmac' פירושה 'טרמינל'", category: "vocabulary" },
    { id: 5428, text: "What is the English word for 'מסוקון'?", options: ["Helipad", "Airport", "Port", "Stop"], correct: 0, explanation: "המילה 'Helipad' פירושה 'מסוקון'", category: "vocabulary" },
    
    // קריאה - תחבורה מומחה
    { id: 5429, text: "Read: 'I travel by maglev train. Maglev trains use magnetic levitation to float above the tracks.' How do maglev trains work?", options: ["On wheels", "Using magnetic levitation", "On water", "In the sky"], correct: 1, explanation: "רכבת מגלב עובדת באמצעות levitation מגנטי", category: "reading" },
    { id: 5430, text: "Read: 'I fly on a private jet. Private jets are smaller and faster than commercial planes.' How are private jets different?", options: ["Bigger and slower", "Smaller and faster", "Same size", "Slower"], correct: 1, explanation: "מטוסים פרטיים קטנים יותר ומהירים יותר", category: "reading" },
    { id: 5431, text: "Read: 'I have a connecting flight. I need to change planes at the airport.' What do you do with a connecting flight?", options: ["Change planes", "Stay on same plane", "Nothing", "Sleep"], correct: 0, explanation: "עם טיסת המשך, מחליפים מטוסים", category: "reading" },
    { id: 5432, text: "Read: 'I upgrade to first class. First class has better seats and service.' What does first class have?", options: ["Worse seats", "Better seats and service", "Same seats", "No seats"], correct: 1, explanation: "מחלקה ראשונה יש מושבים טובים יותר ושירות", category: "reading" },
    
    // דקדוק - תחבורה מומחה
    { id: 5433, text: "Complete: 'I ___ been traveling for three days straight.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "אני נוסע כבר שלושה ימים רצוף (הווה מושלם מתמשך)", category: "grammar" },
    { id: 5434, text: "Complete: 'She ___ had her flight canceled twice this month.'", options: ["has", "have", "had", "having"], correct: 0, explanation: "היא בוטלה את הטיסה שלה פעמיים החודש (הווה מושלם)", category: "grammar" },
    { id: 5435, text: "Complete: 'We ___ going to travel by hyperloop next year.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו הולכים לנסוע בהיפרלופ בשנה הבאה (עתיד עם going to)", category: "grammar" },
    { id: 5436, text: "Complete: 'They ___ not yet experienced supersonic flight.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "הם עדיין לא חוו טיסה על-קולית (הווה מושלם שלילי)", category: "grammar" },
    { id: 5437, text: "Complete: 'He ___ never piloted a plane before.'", options: ["has", "have", "had", "having"], correct: 0, explanation: "הוא מעולם לא הטיס מטוס לפני (הווה מושלם)", category: "grammar" },
    
    // שאלות חזרה - מילים מומחה
    { id: 5438, text: "🔊 חזור אחרי הקריין: Supersonic plane", options: ["Plane", "Supersonic plane", "Car", "Bike"], correct: 1, explanation: "Supersonic plane - מטוס על-קולי", category: "repeat" },
    { id: 5439, text: "🔊 חזור אחרי הקריין: Maglev train", options: ["Train", "Maglev train", "Bus", "Car"], correct: 1, explanation: "Maglev train - רכבת מגלב", category: "repeat" },
    { id: 5440, text: "🔊 חזור אחרי הקריין: Hyperloop", options: ["Car", "Bike", "Hyperloop", "Plane"], correct: 2, explanation: "Hyperloop - היפרלופ", category: "repeat" },
    { id: 5441, text: "🔊 חזור אחרי הקריין: Self-driving car", options: ["Car", "Bike", "Self-driving car", "Plane"], correct: 2, explanation: "Self-driving car - רכב אוטונומי", category: "repeat" },
    { id: 5442, text: "🔊 חזור אחרי הקריין: Cargo plane", options: ["Plane", "Cargo plane", "Car", "Bike"], correct: 1, explanation: "Cargo plane - מטוס מטען", category: "repeat" },
    { id: 5443, text: "🔊 חזור אחרי הקריין: Charter flight", options: ["Flight", "Charter flight", "Car", "Bike"], correct: 1, explanation: "Charter flight - טיסה שכורה", category: "repeat" },
    { id: 5444, text: "🔊 חזור אחרי הקריין: Commercial flight", options: ["Flight", "Commercial flight", "Car", "Bike"], correct: 1, explanation: "Commercial flight - טיסה מסחרית", category: "repeat" },
    { id: 5445, text: "🔊 חזור אחרי הקריין: Private jet", options: ["Plane", "Private jet", "Car", "Bike"], correct: 1, explanation: "Private jet - מטוס פרטי", category: "repeat" },
    { id: 5446, text: "🔊 חזור אחרי הקריין: Control tower", options: ["Control tower", "Airport", "Port", "Stop"], correct: 0, explanation: "Control tower - מגדל פיקוח", category: "repeat" },
    { id: 5447, text: "🔊 חזור אחרי הקריין: Hangar", options: ["Hangar", "Airport", "Port", "Stop"], correct: 0, explanation: "Hangar - האנגר", category: "repeat" },
    { id: 5448, text: "🔊 חזור אחרי הקריין: Tarmac", options: ["Tarmac", "Airport", "Port", "Stop"], correct: 0, explanation: "Tarmac - טרמינל", category: "repeat" },
    { id: 5449, text: "🔊 חזור אחרי הקריין: Helipad", options: ["Helipad", "Airport", "Port", "Stop"], correct: 0, explanation: "Helipad - מסוקון", category: "repeat" },
    { id: 5450, text: "🔊 חזור אחרי הקריין: Upgrade", options: ["Upgrade", "Downgrade", "Stay", "Change"], correct: 0, explanation: "Upgrade - לשדרג", category: "repeat" },
    { id: 5451, text: "🔊 חזור אחרי הקריין: Red-eye flight", options: ["Red-eye flight", "Day flight", "Stop", "Delay"], correct: 0, explanation: "Red-eye flight - טיסת לילה", category: "repeat" },
    { id: 5452, text: "🔊 חזור אחרי הקריין: Non-stop flight", options: ["Connecting flight", "Non-stop flight", "Stop", "Delay"], correct: 1, explanation: "Non-stop flight - טיסה ישירה", category: "repeat" },
    { id: 5453, text: "🔊 חזור אחרי הקריין: Autonomous", options: ["Autonomous", "Manual", "Automatic", "Self"], correct: 0, explanation: "Autonomous - אוטונומי", category: "repeat" },
    { id: 5454, text: "🔊 חזור אחרי הקריין: Levitation", options: ["Levitation", "Floating", "Flying", "Hovering"], correct: 0, explanation: "Levitation - רחיפה", category: "repeat" },
    { id: 5455, text: "🔊 חזור אחרי הקריין: Magnetic", options: ["Magnetic", "Electric", "Solar", "Wind"], correct: 0, explanation: "Magnetic - מגנטי", category: "repeat" },
    { id: 5456, text: "🔊 חזור אחרי הקריין: Supersonic", options: ["Supersonic", "Slow", "Fast", "Normal"], correct: 0, explanation: "Supersonic - על-קולי", category: "repeat" },
    { id: 5457, text: "🔊 חזור אחרי הקריין: Hypersonic", options: ["Hypersonic", "Supersonic", "Slow", "Normal"], correct: 0, explanation: "Hypersonic - היפר-קולי", category: "repeat" },
    { id: 5458, text: "🔊 חזור אחרי הקריין: Aerospace", options: ["Aerospace", "Space", "Air", "Sky"], correct: 0, explanation: "Aerospace - אוויר-חלל", category: "repeat" },
    { id: 5459, text: "🔊 חזור אחרי הקריין: Aviation", options: ["Aviation", "Flying", "Travel", "Transport"], correct: 0, explanation: "Aviation - תעופה", category: "repeat" },
    { id: 5460, text: "🔊 חזור אחרי הקריין: Logistics", options: ["Logistics", "Transport", "Travel", "Movement"], correct: 0, explanation: "Logistics - לוגיסטיקה", category: "repeat" }
    ]
  },
  '6': { // יחידה 6 - ספורט ופעילות גופנית
    '1': [ // רמה 1 - מתחילים - ספורט ופעילות גופנית בסיסיים
    // ספורט בסיסי
    { id: 6001, text: "What do you play with a ball?", options: ["Soccer", "Swimming", "Running", "Jumping"], correct: 0, explanation: "משחקים כדורגל עם כדור", category: "sports" },
    { id: 6002, text: "What do you do in water?", options: ["Soccer", "Swimming", "Running", "Jumping"], correct: 1, explanation: "שוחים במים", category: "sports" },
    { id: 6003, text: "What do you do with your legs?", options: ["Soccer", "Swimming", "Running", "Jumping"], correct: 2, explanation: "רצים עם הרגליים", category: "sports" },
    { id: 6004, text: "What do you do up and down?", options: ["Soccer", "Swimming", "Running", "Jumping"], correct: 3, explanation: "קופצים למעלה ולמטה", category: "sports" },
    { id: 6005, text: "What do you play with a racket?", options: ["Soccer", "Tennis", "Running", "Jumping"], correct: 1, explanation: "משחקים טניס עם מחבט", category: "sports" },
    { id: 6006, text: "What do you play with a bat?", options: ["Soccer", "Baseball", "Running", "Jumping"], correct: 1, explanation: "משחקים בייסבול עם מחבט", category: "sports" },
    { id: 6007, text: "What do you play with a basket?", options: ["Soccer", "Basketball", "Running", "Jumping"], correct: 1, explanation: "משחקים כדורסל עם סל", category: "sports" },
    { id: 6008, text: "What do you play on ice?", options: ["Soccer", "Hockey", "Running", "Jumping"], correct: 1, explanation: "משחקים הוקי על קרח", category: "sports" },
    
    // מקומות ספורט
    { id: 6009, text: "Where do you play soccer?", options: ["Field", "Pool", "Court", "Track"], correct: 0, explanation: "משחקים כדורגל במגרש", category: "places" },
    { id: 6010, text: "Where do you swim?", options: ["Field", "Pool", "Court", "Track"], correct: 1, explanation: "שוחים בבריכה", category: "places" },
    { id: 6011, text: "Where do you play tennis?", options: ["Field", "Pool", "Court", "Track"], correct: 2, explanation: "משחקים טניס במגרש", category: "places" },
    { id: 6012, text: "Where do you run?", options: ["Field", "Pool", "Court", "Track"], correct: 3, explanation: "רצים במסלול", category: "places" },
    
    // פעילויות ספורט
    { id: 6013, text: "What do you do to stay healthy?", options: ["Exercise", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "עושים ספורט כדי להישאר בריאים", category: "activities" },
    { id: 6014, text: "What do you do to get strong?", options: ["Exercise", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "עושים ספורט כדי להתחזק", category: "activities" },
    { id: 6015, text: "What do you do before you play?", options: ["Warm up", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מתחממים לפני שמשחקים", category: "activities" },
    { id: 6016, text: "What do you do after you play?", options: ["Cool down", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מתקררים אחרי שמשחקים", category: "activities" },
    
    // אוצר מילים - ספורט בסיסי
    { id: 6017, text: "What is the English word for 'כדורגל'?", options: ["Soccer", "Swimming", "Running", "Jumping"], correct: 0, explanation: "המילה 'Soccer' פירושה 'כדורגל'", category: "vocabulary" },
    { id: 6018, text: "What is the English word for 'שחייה'?", options: ["Soccer", "Swimming", "Running", "Jumping"], correct: 1, explanation: "המילה 'Swimming' פירושה 'שחייה'", category: "vocabulary" },
    { id: 6019, text: "What is the English word for 'ריצה'?", options: ["Soccer", "Swimming", "Running", "Jumping"], correct: 2, explanation: "המילה 'Running' פירושה 'ריצה'", category: "vocabulary" },
    { id: 6020, text: "What is the English word for 'קפיצה'?", options: ["Soccer", "Swimming", "Running", "Jumping"], correct: 3, explanation: "המילה 'Jumping' פירושה 'קפיצה'", category: "vocabulary" },
    { id: 6021, text: "What is the English word for 'טניס'?", options: ["Soccer", "Tennis", "Running", "Jumping"], correct: 1, explanation: "המילה 'Tennis' פירושה 'טניס'", category: "vocabulary" },
    { id: 6022, text: "What is the English word for 'בייסבול'?", options: ["Soccer", "Baseball", "Running", "Jumping"], correct: 1, explanation: "המילה 'Baseball' פירושה 'בייסבול'", category: "vocabulary" },
    { id: 6023, text: "What is the English word for 'כדורסל'?", options: ["Soccer", "Basketball", "Running", "Jumping"], correct: 1, explanation: "המילה 'Basketball' פירושה 'כדורסל'", category: "vocabulary" },
    { id: 6024, text: "What is the English word for 'הוקי'?", options: ["Soccer", "Hockey", "Running", "Jumping"], correct: 1, explanation: "המילה 'Hockey' פירושה 'הוקי'", category: "vocabulary" },
    
    // אוצר מילים - מקומות
    { id: 6025, text: "What is the English word for 'מגרש'?", options: ["Field", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Field' פירושה 'מגרש'", category: "vocabulary" },
    { id: 6026, text: "What is the English word for 'בריכה'?", options: ["Field", "Pool", "Court", "Track"], correct: 1, explanation: "המילה 'Pool' פירושה 'בריכה'", category: "vocabulary" },
    { id: 6027, text: "What is the English word for 'מגרש טניס'?", options: ["Field", "Pool", "Court", "Track"], correct: 2, explanation: "המילה 'Court' פירושה 'מגרש טניס'", category: "vocabulary" },
    { id: 6028, text: "What is the English word for 'מסלול'?", options: ["Field", "Pool", "Court", "Track"], correct: 3, explanation: "המילה 'Track' פירושה 'מסלול'", category: "vocabulary" },
    
    // קריאה - ספורט
    { id: 6029, text: "Read: 'I play soccer. Soccer is fun and I run a lot.' What do you do when you play soccer?", options: ["Swim", "Run a lot", "Jump", "Sleep"], correct: 1, explanation: "רצים הרבה כשמשחקים כדורגל", category: "reading" },
    { id: 6030, text: "Read: 'I swim in the pool. Swimming is good for your body.' Where do you swim?", options: ["Field", "Pool", "Court", "Track"], correct: 1, explanation: "שוחים בבריכה", category: "reading" },
    { id: 6031, text: "Read: 'I play tennis. I use a racket to hit the ball.' What do you use to play tennis?", options: ["Ball", "Racket", "Bat", "Stick"], correct: 1, explanation: "משתמשים במחבט כדי לשחק טניס", category: "reading" },
    { id: 6032, text: "Read: 'I exercise every day. Exercise makes me strong and healthy.' Why do you exercise?", options: ["To sleep", "To get strong and healthy", "To eat", "To play"], correct: 1, explanation: "עושים ספורט כדי להתחזק ולהישאר בריאים", category: "reading" },
    
    // שאלות חזרה - מילים בסיסיות
    { id: 6033, text: "🔊 חזור אחרי הקריין: Soccer", options: ["Soccer", "Swimming", "Running", "Jumping"], correct: 0, explanation: "Soccer - כדורגל", category: "repeat" },
    { id: 6034, text: "🔊 חזור אחרי הקריין: Swimming", options: ["Soccer", "Swimming", "Running", "Jumping"], correct: 1, explanation: "Swimming - שחייה", category: "repeat" },
    { id: 6035, text: "🔊 חזור אחרי הקריין: Running", options: ["Soccer", "Swimming", "Running", "Jumping"], correct: 2, explanation: "Running - ריצה", category: "repeat" },
    { id: 6036, text: "🔊 חזור אחרי הקריין: Jumping", options: ["Soccer", "Swimming", "Running", "Jumping"], correct: 3, explanation: "Jumping - קפיצה", category: "repeat" },
    { id: 6037, text: "🔊 חזור אחרי הקריין: Tennis", options: ["Soccer", "Tennis", "Running", "Jumping"], correct: 1, explanation: "Tennis - טניס", category: "repeat" },
    { id: 6038, text: "🔊 חזור אחרי הקריין: Baseball", options: ["Soccer", "Baseball", "Running", "Jumping"], correct: 1, explanation: "Baseball - בייסבול", category: "repeat" },
    { id: 6039, text: "🔊 חזור אחרי הקריין: Basketball", options: ["Soccer", "Basketball", "Running", "Jumping"], correct: 1, explanation: "Basketball - כדורסל", category: "repeat" },
    { id: 6040, text: "🔊 חזור אחרי הקריין: Hockey", options: ["Soccer", "Hockey", "Running", "Jumping"], correct: 1, explanation: "Hockey - הוקי", category: "repeat" },
    { id: 6041, text: "🔊 חזור אחרי הקריין: Field", options: ["Field", "Pool", "Court", "Track"], correct: 0, explanation: "Field - מגרש", category: "repeat" },
    { id: 6042, text: "🔊 חזור אחרי הקריין: Pool", options: ["Field", "Pool", "Court", "Track"], correct: 1, explanation: "Pool - בריכה", category: "repeat" },
    { id: 6043, text: "🔊 חזור אחרי הקריין: Court", options: ["Field", "Pool", "Court", "Track"], correct: 2, explanation: "Court - מגרש טניס", category: "repeat" },
    { id: 6044, text: "🔊 חזור אחרי הקריין: Track", options: ["Field", "Pool", "Court", "Track"], correct: 3, explanation: "Track - מסלול", category: "repeat" },
    { id: 6045, text: "🔊 חזור אחרי הקריין: Exercise", options: ["Exercise", "Sleep", "Eat", "Play"], correct: 0, explanation: "Exercise - להתעמל", category: "repeat" },
    { id: 6046, text: "🔊 חזור אחרי הקריין: Play", options: ["Exercise", "Sleep", "Eat", "Play"], correct: 3, explanation: "Play - לשחק", category: "repeat" },
    { id: 6047, text: "🔊 חזור אחרי הקריין: Ball", options: ["Ball", "Racket", "Bat", "Stick"], correct: 0, explanation: "Ball - כדור", category: "repeat" },
    { id: 6048, text: "🔊 חזור אחרי הקריין: Racket", options: ["Ball", "Racket", "Bat", "Stick"], correct: 1, explanation: "Racket - מחבט", category: "repeat" },
    { id: 6049, text: "🔊 חזור אחרי הקריין: Bat", options: ["Ball", "Racket", "Bat", "Stick"], correct: 2, explanation: "Bat - מחבט", category: "repeat" },
    { id: 6050, text: "🔊 חזור אחרי הקריין: Team", options: ["Team", "Player", "Coach", "Referee"], correct: 0, explanation: "Team - קבוצה", category: "repeat" },
    { id: 6051, text: "🔊 חזור אחרי הקריין: Player", options: ["Team", "Player", "Coach", "Referee"], correct: 1, explanation: "Player - שחקן", category: "repeat" },
    { id: 6052, text: "🔊 חזור אחרי הקריין: Coach", options: ["Team", "Player", "Coach", "Referee"], correct: 2, explanation: "Coach - מאמן", category: "repeat" },
    { id: 6053, text: "🔊 חזור אחרי הקריין: Game", options: ["Game", "Match", "Practice", "Training"], correct: 0, explanation: "Game - משחק", category: "repeat" },
    { id: 6054, text: "🔊 חזור אחרי הקריין: Match", options: ["Game", "Match", "Practice", "Training"], correct: 1, explanation: "Match - משחק", category: "repeat" },
    { id: 6055, text: "🔊 חזור אחרי הקריין: Practice", options: ["Game", "Match", "Practice", "Training"], correct: 2, explanation: "Practice - אימון", category: "repeat" },
    { id: 6056, text: "🔊 חזור אחרי הקריין: Training", options: ["Game", "Match", "Practice", "Training"], correct: 3, explanation: "Training - אימון", category: "repeat" },
    { id: 6057, text: "🔊 חזור אחרי הקריין: Win", options: ["Win", "Lose", "Tie", "Draw"], correct: 0, explanation: "Win - לנצח", category: "repeat" },
    { id: 6058, text: "🔊 חזור אחרי הקריין: Lose", options: ["Win", "Lose", "Tie", "Draw"], correct: 1, explanation: "Lose - להפסיד", category: "repeat" },
    { id: 6059, text: "🔊 חזור אחרי הקריין: Score", options: ["Score", "Goal", "Point", "Run"], correct: 0, explanation: "Score - להבקיע", category: "repeat" },
    { id: 6060, text: "🔊 חזור אחרי הקריין: Goal", options: ["Score", "Goal", "Point", "Run"], correct: 1, explanation: "Goal - שער", category: "repeat" }
    ],
    '2': [ // רמה 2 - בסיסי - ספורט ופעילות גופנית מורחבים
    // ספורט מורחב
    { id: 6101, text: "What do you play with a net?", options: ["Soccer", "Volleyball", "Running", "Jumping"], correct: 1, explanation: "משחקים כדורעף עם רשת", category: "sports" },
    { id: 6102, text: "What do you play on a table?", options: ["Soccer", "Table tennis", "Running", "Jumping"], correct: 1, explanation: "משחקים טניס שולחן על שולחן", category: "sports" },
    { id: 6103, text: "What do you play with a club?", options: ["Soccer", "Golf", "Running", "Jumping"], correct: 1, explanation: "משחקים גולף עם מחבט", category: "sports" },
    { id: 6104, text: "What do you play with a paddle?", options: ["Soccer", "Ping pong", "Running", "Jumping"], correct: 1, explanation: "משחקים פינג פונג עם מחבט", category: "sports" },
    { id: 6105, text: "What do you do on a bike?", options: ["Soccer", "Cycling", "Running", "Jumping"], correct: 1, explanation: "רוכבים על אופניים", category: "sports" },
    { id: 6106, text: "What do you do with weights?", options: ["Soccer", "Weightlifting", "Running", "Jumping"], correct: 1, explanation: "מרימים משקולות", category: "sports" },
    { id: 6107, text: "What do you do on a board?", options: ["Soccer", "Skateboarding", "Running", "Jumping"], correct: 1, explanation: "רוכבים על סקייטבורד", category: "sports" },
    { id: 6108, text: "What do you do in the mountains?", options: ["Soccer", "Hiking", "Running", "Jumping"], correct: 1, explanation: "מטיילים בהרים", category: "sports" },
    
    // מקומות מורחבים
    { id: 6109, text: "Where do you play volleyball?", options: ["Beach", "Pool", "Court", "Track"], correct: 0, explanation: "משחקים כדורעף בחוף", category: "places" },
    { id: 6110, text: "Where do you play golf?", options: ["Golf course", "Pool", "Court", "Track"], correct: 0, explanation: "משחקים גולף במגרש גולף", category: "places" },
    { id: 6111, text: "Where do you skate?", options: ["Skate park", "Pool", "Court", "Track"], correct: 0, explanation: "מחליקים בפארק סקייט", category: "places" },
    { id: 6112, text: "Where do you lift weights?", options: ["Gym", "Pool", "Court", "Track"], correct: 0, explanation: "מרימים משקולות בחדר כושר", category: "places" },
    
    // פעילויות ספורט מורחבות
    { id: 6113, text: "What do you do to get better?", options: ["Practice", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מתאמנים כדי להשתפר", category: "activities" },
    { id: 6114, text: "What do you do to compete?", options: ["Compete", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מתחרים כדי להתחרות", category: "activities" },
    { id: 6115, text: "What do you do to train?", options: ["Train", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מתאמנים כדי להתאמן", category: "activities" },
    { id: 6116, text: "What do you do to win?", options: ["Try hard", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מתאמצים כדי לנצח", category: "activities" },
    
    // אוצר מילים - ספורט מורחב
    { id: 6117, text: "What is the English word for 'כדורעף'?", options: ["Soccer", "Volleyball", "Running", "Jumping"], correct: 1, explanation: "המילה 'Volleyball' פירושה 'כדורעף'", category: "vocabulary" },
    { id: 6118, text: "What is the English word for 'טניס שולחן'?", options: ["Soccer", "Table tennis", "Running", "Jumping"], correct: 1, explanation: "המילה 'Table tennis' פירושה 'טניס שולחן'", category: "vocabulary" },
    { id: 6119, text: "What is the English word for 'גולף'?", options: ["Soccer", "Golf", "Running", "Jumping"], correct: 1, explanation: "המילה 'Golf' פירושה 'גולף'", category: "vocabulary" },
    { id: 6120, text: "What is the English word for 'פינג פונג'?", options: ["Soccer", "Ping pong", "Running", "Jumping"], correct: 1, explanation: "המילה 'Ping pong' פירושה 'פינג פונג'", category: "vocabulary" },
    { id: 6121, text: "What is the English word for 'רכיבה על אופניים'?", options: ["Soccer", "Cycling", "Running", "Jumping"], correct: 1, explanation: "המילה 'Cycling' פירושה 'רכיבה על אופניים'", category: "vocabulary" },
    { id: 6122, text: "What is the English word for 'הרמת משקולות'?", options: ["Soccer", "Weightlifting", "Running", "Jumping"], correct: 1, explanation: "המילה 'Weightlifting' פירושה 'הרמת משקולות'", category: "vocabulary" },
    { id: 6123, text: "What is the English word for 'סקייטבורד'?", options: ["Soccer", "Skateboarding", "Running", "Jumping"], correct: 1, explanation: "המילה 'Skateboarding' פירושה 'סקייטבורד'", category: "vocabulary" },
    { id: 6124, text: "What is the English word for 'טיול רגלי'?", options: ["Soccer", "Hiking", "Running", "Jumping"], correct: 1, explanation: "המילה 'Hiking' פירושה 'טיול רגלי'", category: "vocabulary" },
    
    // אוצר מילים - מקומות מורחבים
    { id: 6125, text: "What is the English word for 'חוף'?", options: ["Beach", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Beach' פירושה 'חוף'", category: "vocabulary" },
    { id: 6126, text: "What is the English word for 'מגרש גולף'?", options: ["Golf course", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Golf course' פירושה 'מגרש גולף'", category: "vocabulary" },
    { id: 6127, text: "What is the English word for 'פארק סקייט'?", options: ["Skate park", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Skate park' פירושה 'פארק סקייט'", category: "vocabulary" },
    { id: 6128, text: "What is the English word for 'חדר כושר'?", options: ["Gym", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Gym' פירושה 'חדר כושר'", category: "vocabulary" },
    
    // קריאה - ספורט מורחב
    { id: 6129, text: "Read: 'I play volleyball on the beach. Volleyball is fun with friends.' Where do you play volleyball?", options: ["Beach", "Pool", "Court", "Track"], correct: 0, explanation: "משחקים כדורעף בחוף", category: "reading" },
    { id: 6130, text: "Read: 'I go to the gym. I lift weights to get strong.' Where do you lift weights?", options: ["Gym", "Pool", "Court", "Track"], correct: 0, explanation: "מרימים משקולות בחדר כושר", category: "reading" },
    { id: 6131, text: "Read: 'I practice every day. Practice makes me better.' Why do you practice?", options: ["To sleep", "To get better", "To eat", "To play"], correct: 1, explanation: "מתאמנים כדי להשתפר", category: "reading" },
    { id: 6132, text: "Read: 'I compete in games. I try hard to win.' What do you do to win?", options: ["Sleep", "Try hard", "Eat", "Nothing"], correct: 1, explanation: "מתאמצים כדי לנצח", category: "reading" },
    
    // דקדוק בסיסי - ספורט
    { id: 6133, text: "Complete: 'I ___ soccer every weekend.'", options: ["play", "plays", "played", "playing"], correct: 0, explanation: "אני משחק כדורגל כל סוף שבוע (הווה פשוט)", category: "grammar" },
    { id: 6134, text: "Complete: 'She ___ swimming every morning.'", options: ["go", "goes", "went", "going"], correct: 1, explanation: "היא הולכת לשחות כל בוקר (הווה פשוט, גוף שלישי יחיד)", category: "grammar" },
    { id: 6135, text: "Complete: 'We ___ playing basketball now.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו משחקים כדורסל עכשיו (הווה מתמשך, רבים)", category: "grammar" },
    { id: 6136, text: "Complete: 'They ___ tennis yesterday.'", options: ["play", "plays", "played", "playing"], correct: 2, explanation: "הם שיחקו טניס אתמול (עבר פשוט)", category: "grammar" },
    { id: 6137, text: "Complete: 'He ___ going to run tomorrow.'", options: ["am", "is", "are", "be"], correct: 1, explanation: "הוא הולך לרוץ מחר (עתיד עם going to, גוף שלישי יחיד)", category: "grammar" },
    
    // שאלות חזרה - מילים מורחבות
    { id: 6138, text: "🔊 חזור אחרי הקריין: Volleyball", options: ["Soccer", "Volleyball", "Running", "Jumping"], correct: 1, explanation: "Volleyball - כדורעף", category: "repeat" },
    { id: 6139, text: "🔊 חזור אחרי הקריין: Table tennis", options: ["Soccer", "Table tennis", "Running", "Jumping"], correct: 1, explanation: "Table tennis - טניס שולחן", category: "repeat" },
    { id: 6140, text: "🔊 חזור אחרי הקריין: Golf", options: ["Soccer", "Golf", "Running", "Jumping"], correct: 1, explanation: "Golf - גולף", category: "repeat" },
    { id: 6141, text: "🔊 חזור אחרי הקריין: Ping pong", options: ["Soccer", "Ping pong", "Running", "Jumping"], correct: 1, explanation: "Ping pong - פינג פונג", category: "repeat" },
    { id: 6142, text: "🔊 חזור אחרי הקריין: Cycling", options: ["Soccer", "Cycling", "Running", "Jumping"], correct: 1, explanation: "Cycling - רכיבה על אופניים", category: "repeat" },
    { id: 6143, text: "🔊 חזור אחרי הקריין: Weightlifting", options: ["Soccer", "Weightlifting", "Running", "Jumping"], correct: 1, explanation: "Weightlifting - הרמת משקולות", category: "repeat" },
    { id: 6144, text: "🔊 חזור אחרי הקריין: Skateboarding", options: ["Soccer", "Skateboarding", "Running", "Jumping"], correct: 1, explanation: "Skateboarding - סקייטבורד", category: "repeat" },
    { id: 6145, text: "🔊 חזור אחרי הקריין: Hiking", options: ["Soccer", "Hiking", "Running", "Jumping"], correct: 1, explanation: "Hiking - טיול רגלי", category: "repeat" },
    { id: 6146, text: "🔊 חזור אחרי הקריין: Beach", options: ["Beach", "Pool", "Court", "Track"], correct: 0, explanation: "Beach - חוף", category: "repeat" },
    { id: 6147, text: "🔊 חזור אחרי הקריין: Golf course", options: ["Golf course", "Pool", "Court", "Track"], correct: 0, explanation: "Golf course - מגרש גולף", category: "repeat" },
    { id: 6148, text: "🔊 חזור אחרי הקריין: Skate park", options: ["Skate park", "Pool", "Court", "Track"], correct: 0, explanation: "Skate park - פארק סקייט", category: "repeat" },
    { id: 6149, text: "🔊 חזור אחרי הקריין: Gym", options: ["Gym", "Pool", "Court", "Track"], correct: 0, explanation: "Gym - חדר כושר", category: "repeat" },
    { id: 6150, text: "🔊 חזור אחרי הקריין: Practice", options: ["Practice", "Play", "Train", "Exercise"], correct: 0, explanation: "Practice - להתאמן", category: "repeat" },
    { id: 6151, text: "🔊 חזור אחרי הקריין: Compete", options: ["Practice", "Compete", "Train", "Exercise"], correct: 1, explanation: "Compete - להתחרות", category: "repeat" },
    { id: 6152, text: "🔊 חזור אחרי הקריין: Train", options: ["Practice", "Compete", "Train", "Exercise"], correct: 2, explanation: "Train - להתאמן", category: "repeat" },
    { id: 6153, text: "🔊 חזור אחרי הקריין: Net", options: ["Net", "Racket", "Bat", "Stick"], correct: 0, explanation: "Net - רשת", category: "repeat" },
    { id: 6154, text: "🔊 חזור אחרי הקריין: Club", options: ["Net", "Racket", "Club", "Stick"], correct: 2, explanation: "Club - מחבט גולף", category: "repeat" },
    { id: 6155, text: "🔊 חזור אחרי הקריין: Paddle", options: ["Net", "Racket", "Paddle", "Stick"], correct: 2, explanation: "Paddle - מחבט פינג פונג", category: "repeat" },
    { id: 6156, text: "🔊 חזור אחרי הקריין: Weight", options: ["Weight", "Ball", "Racket", "Bat"], correct: 0, explanation: "Weight - משקולת", category: "repeat" },
    { id: 6157, text: "🔊 חזור אחרי הקריין: Board", options: ["Board", "Ball", "Racket", "Bat"], correct: 0, explanation: "Board - לוח", category: "repeat" },
    { id: 6158, text: "🔊 חזור אחרי הקריין: Referee", options: ["Team", "Player", "Coach", "Referee"], correct: 3, explanation: "Referee - שופט", category: "repeat" },
    { id: 6159, text: "🔊 חזור אחרי הקריין: Point", options: ["Score", "Goal", "Point", "Run"], correct: 2, explanation: "Point - נקודה", category: "repeat" },
    { id: 6160, text: "🔊 חזור אחרי הקריין: Tie", options: ["Win", "Lose", "Tie", "Draw"], correct: 2, explanation: "Tie - תיקו", category: "repeat" }
    ],
    '3': [ // רמה 3 - בינוני - ספורט ופעילות גופנית מתקדמים
    // ספורט מתקדם
    { id: 6201, text: "What do you play with a stick?", options: ["Soccer", "Hockey", "Running", "Jumping"], correct: 1, explanation: "משחקים הוקי עם מקל", category: "sports" },
    { id: 6202, text: "What do you play on snow?", options: ["Soccer", "Skiing", "Running", "Jumping"], correct: 1, explanation: "גולשים על שלג", category: "sports" },
    { id: 6203, text: "What do you play on waves?", options: ["Soccer", "Surfing", "Running", "Jumping"], correct: 1, explanation: "גולשים על גלים", category: "sports" },
    { id: 6204, text: "What do you play with a bow?", options: ["Soccer", "Archery", "Running", "Jumping"], correct: 1, explanation: "משחקים קשתות עם קשת", category: "sports" },
    { id: 6205, text: "What do you do in a ring?", options: ["Soccer", "Boxing", "Running", "Jumping"], correct: 1, explanation: "מתאגרפים בזירה", category: "sports" },
    { id: 6206, text: "What do you do on a mat?", options: ["Soccer", "Wrestling", "Running", "Jumping"], correct: 1, explanation: "מתאבקים על מזרן", category: "sports" },
    { id: 6207, text: "What do you do with a rope?", options: ["Soccer", "Rock climbing", "Running", "Jumping"], correct: 1, explanation: "מטפסים על סלעים עם חבל", category: "sports" },
    { id: 6208, text: "What do you do on a horse?", options: ["Soccer", "Horseback riding", "Running", "Jumping"], correct: 1, explanation: "רוכבים על סוס", category: "sports" },
    
    // מקומות מתקדמים
    { id: 6209, text: "Where do you ski?", options: ["Ski resort", "Pool", "Court", "Track"], correct: 0, explanation: "גולשים באתר סקי", category: "places" },
    { id: 6210, text: "Where do you surf?", options: ["Beach", "Pool", "Court", "Track"], correct: 0, explanation: "גולשים בחוף", category: "places" },
    { id: 6211, text: "Where do you box?", options: ["Boxing ring", "Pool", "Court", "Track"], correct: 0, explanation: "מתאגרפים בזירה", category: "places" },
    { id: 6212, text: "Where do you climb?", options: ["Climbing wall", "Pool", "Court", "Track"], correct: 0, explanation: "מטפסים על קיר טיפוס", category: "places" },
    
    // פעילויות ספורט מתקדמות
    { id: 6213, text: "What do you do to improve?", options: ["Train harder", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מתאמנים קשה יותר כדי להשתפר", category: "activities" },
    { id: 6214, text: "What do you do to prepare?", options: ["Prepare", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מתכוננים כדי להתכונן", category: "activities" },
    { id: 6215, text: "What do you do to recover?", options: ["Rest", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "נחים כדי להתאושש", category: "activities" },
    { id: 6216, text: "What do you do to build muscle?", options: ["Lift weights", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מרימים משקולות כדי לבנות שרירים", category: "activities" },
    
    // אוצר מילים - ספורט מתקדם
    { id: 6217, text: "What is the English word for 'גלישה'?", options: ["Soccer", "Skiing", "Running", "Jumping"], correct: 1, explanation: "המילה 'Skiing' פירושה 'גלישה'", category: "vocabulary" },
    { id: 6218, text: "What is the English word for 'גלישת גלים'?", options: ["Soccer", "Surfing", "Running", "Jumping"], correct: 1, explanation: "המילה 'Surfing' פירושה 'גלישת גלים'", category: "vocabulary" },
    { id: 6219, text: "What is the English word for 'קשתות'?", options: ["Soccer", "Archery", "Running", "Jumping"], correct: 1, explanation: "המילה 'Archery' פירושה 'קשתות'", category: "vocabulary" },
    { id: 6220, text: "What is the English word for 'איגרוף'?", options: ["Soccer", "Boxing", "Running", "Jumping"], correct: 1, explanation: "המילה 'Boxing' פירושה 'איגרוף'", category: "vocabulary" },
    { id: 6221, text: "What is the English word for 'היאבקות'?", options: ["Soccer", "Wrestling", "Running", "Jumping"], correct: 1, explanation: "המילה 'Wrestling' פירושה 'היאבקות'", category: "vocabulary" },
    { id: 6222, text: "What is the English word for 'טיפוס סלעים'?", options: ["Soccer", "Rock climbing", "Running", "Jumping"], correct: 1, explanation: "המילה 'Rock climbing' פירושה 'טיפוס סלעים'", category: "vocabulary" },
    { id: 6223, text: "What is the English word for 'רכיבה על סוס'?", options: ["Soccer", "Horseback riding", "Running", "Jumping"], correct: 1, explanation: "המילה 'Horseback riding' פירושה 'רכיבה על סוס'", category: "vocabulary" },
    
    // אוצר מילים - מקומות מתקדמים
    { id: 6224, text: "What is the English word for 'אתר סקי'?", options: ["Ski resort", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Ski resort' פירושה 'אתר סקי'", category: "vocabulary" },
    { id: 6225, text: "What is the English word for 'זירה'?", options: ["Boxing ring", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Boxing ring' פירושה 'זירה'", category: "vocabulary" },
    { id: 6226, text: "What is the English word for 'קיר טיפוס'?", options: ["Climbing wall", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Climbing wall' פירושה 'קיר טיפוס'", category: "vocabulary" },
    
    // קריאה - ספורט מתקדם
    { id: 6227, text: "Read: 'I go skiing at the ski resort. Skiing is fun in winter.' Where do you go skiing?", options: ["Ski resort", "Pool", "Court", "Track"], correct: 0, explanation: "הולכים לגלוש באתר סקי", category: "reading" },
    { id: 6228, text: "Read: 'I surf at the beach. Surfing is exciting on big waves.' Where do you surf?", options: ["Beach", "Pool", "Court", "Track"], correct: 0, explanation: "גולשים בחוף", category: "reading" },
    { id: 6229, text: "Read: 'I train harder to improve. Hard training makes me stronger.' Why do you train harder?", options: ["To sleep", "To improve", "To eat", "To play"], correct: 1, explanation: "מתאמנים קשה יותר כדי להשתפר", category: "reading" },
    { id: 6230, text: "Read: 'I rest after exercise. Rest helps me recover.' Why do you rest?", options: ["To sleep", "To recover", "To eat", "To play"], correct: 1, explanation: "נחים כדי להתאושש", category: "reading" },
    
    // דקדוק - ספורט מתקדם
    { id: 6231, text: "Complete: 'I ___ been training for three months.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "אני מתאמן כבר שלושה חודשים (הווה מושלם מתמשך)", category: "grammar" },
    { id: 6232, text: "Complete: 'She ___ playing tennis when I called.'", options: ["am", "is", "was", "were"], correct: 2, explanation: "היא שיחקה טניס כשהתקשרתי (עבר מתמשך)", category: "grammar" },
    { id: 6233, text: "Complete: 'We ___ going to compete next week.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו הולכים להתחרות בשבוע הבא (עתיד עם going to)", category: "grammar" },
    { id: 6234, text: "Complete: 'They ___ already won three games.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "הם כבר ניצחו שלושה משחקים (הווה מושלם)", category: "grammar" },
    { id: 6235, text: "Complete: 'He ___ not like to lose.'", options: ["do", "does", "is", "are"], correct: 1, explanation: "הוא לא אוהב להפסיד (הווה פשוט שלילי, גוף שלישי יחיד)", category: "grammar" },
    
    // שאלות חזרה - מילים מתקדמות
    { id: 6236, text: "🔊 חזור אחרי הקריין: Skiing", options: ["Soccer", "Skiing", "Running", "Jumping"], correct: 1, explanation: "Skiing - גלישה", category: "repeat" },
    { id: 6237, text: "🔊 חזור אחרי הקריין: Surfing", options: ["Soccer", "Surfing", "Running", "Jumping"], correct: 1, explanation: "Surfing - גלישת גלים", category: "repeat" },
    { id: 6238, text: "🔊 חזור אחרי הקריין: Archery", options: ["Soccer", "Archery", "Running", "Jumping"], correct: 1, explanation: "Archery - קשתות", category: "repeat" },
    { id: 6239, text: "🔊 חזור אחרי הקריין: Boxing", options: ["Soccer", "Boxing", "Running", "Jumping"], correct: 1, explanation: "Boxing - איגרוף", category: "repeat" },
    { id: 6240, text: "🔊 חזור אחרי הקריין: Wrestling", options: ["Soccer", "Wrestling", "Running", "Jumping"], correct: 1, explanation: "Wrestling - היאבקות", category: "repeat" },
    { id: 6241, text: "🔊 חזור אחרי הקריין: Rock climbing", options: ["Soccer", "Rock climbing", "Running", "Jumping"], correct: 1, explanation: "Rock climbing - טיפוס סלעים", category: "repeat" },
    { id: 6242, text: "🔊 חזור אחרי הקריין: Horseback riding", options: ["Soccer", "Horseback riding", "Running", "Jumping"], correct: 1, explanation: "Horseback riding - רכיבה על סוס", category: "repeat" },
    { id: 6243, text: "🔊 חזור אחרי הקריין: Ski resort", options: ["Ski resort", "Pool", "Court", "Track"], correct: 0, explanation: "Ski resort - אתר סקי", category: "repeat" },
    { id: 6244, text: "🔊 חזור אחרי הקריין: Boxing ring", options: ["Boxing ring", "Pool", "Court", "Track"], correct: 0, explanation: "Boxing ring - זירה", category: "repeat" },
    { id: 6245, text: "🔊 חזור אחרי הקריין: Climbing wall", options: ["Climbing wall", "Pool", "Court", "Track"], correct: 0, explanation: "Climbing wall - קיר טיפוס", category: "repeat" },
    { id: 6246, text: "🔊 חזור אחרי הקריין: Prepare", options: ["Prepare", "Practice", "Train", "Exercise"], correct: 0, explanation: "Prepare - להתכונן", category: "repeat" },
    { id: 6247, text: "🔊 חזור אחרי הקריין: Rest", options: ["Rest", "Practice", "Train", "Exercise"], correct: 0, explanation: "Rest - לנוח", category: "repeat" },
    { id: 6248, text: "🔊 חזור אחרי הקריין: Recover", options: ["Recover", "Practice", "Train", "Exercise"], correct: 0, explanation: "Recover - להתאושש", category: "repeat" },
    { id: 6249, text: "🔊 חזור אחרי הקריין: Muscle", options: ["Muscle", "Bone", "Skin", "Hair"], correct: 0, explanation: "Muscle - שריר", category: "repeat" },
    { id: 6250, text: "🔊 חזור אחרי הקריין: Stick", options: ["Stick", "Racket", "Bat", "Club"], correct: 0, explanation: "Stick - מקל", category: "repeat" },
    { id: 6251, text: "🔊 חזור אחרי הקריין: Bow", options: ["Bow", "Arrow", "Racket", "Bat"], correct: 0, explanation: "Bow - קשת", category: "repeat" },
    { id: 6252, text: "🔊 חזור אחרי הקריין: Arrow", options: ["Bow", "Arrow", "Racket", "Bat"], correct: 1, explanation: "Arrow - חץ", category: "repeat" },
    { id: 6253, text: "🔊 חזור אחרי הקריין: Rope", options: ["Rope", "String", "Thread", "Wire"], correct: 0, explanation: "Rope - חבל", category: "repeat" },
    { id: 6254, text: "🔊 חזור אחרי הקריין: Mat", options: ["Mat", "Carpet", "Rug", "Blanket"], correct: 0, explanation: "Mat - מזרן", category: "repeat" },
    { id: 6255, text: "🔊 חזור אחרי הקריין: Ring", options: ["Ring", "Circle", "Round", "Oval"], correct: 0, explanation: "Ring - זירה", category: "repeat" },
    { id: 6256, text: "🔊 חזור אחרי הקריין: Tournament", options: ["Tournament", "Game", "Match", "Practice"], correct: 0, explanation: "Tournament - טורניר", category: "repeat" },
    { id: 6257, text: "🔊 חזור אחרי הקריין: Championship", options: ["Tournament", "Championship", "Match", "Practice"], correct: 1, explanation: "Championship - אליפות", category: "repeat" },
    { id: 6258, text: "🔊 חזור אחרי הקריין: Medal", options: ["Medal", "Trophy", "Award", "Prize"], correct: 0, explanation: "Medal - מדליה", category: "repeat" },
    { id: 6259, text: "🔊 חזור אחרי הקריין: Trophy", options: ["Medal", "Trophy", "Award", "Prize"], correct: 1, explanation: "Trophy - גביע", category: "repeat" },
    { id: 6260, text: "🔊 חזור אחרי הקריין: Champion", options: ["Champion", "Player", "Coach", "Referee"], correct: 0, explanation: "Champion - אלוף", category: "repeat" }
    ],
    '4': [ // רמה 4 - מתקדם - ספורט ופעילות גופנית מתקדמים מאוד
    // ספורט מתקדם מאוד
    { id: 6301, text: "What do you do with a sword?", options: ["Soccer", "Fencing", "Running", "Jumping"], correct: 1, explanation: "מתחרים בסיוף עם חרב", category: "sports" },
    { id: 6302, text: "What do you do in a pool?", options: ["Soccer", "Water polo", "Running", "Jumping"], correct: 1, explanation: "משחקים כדורמים בבריכה", category: "sports" },
    { id: 6303, text: "What do you do on a board in water?", options: ["Soccer", "Water skiing", "Running", "Jumping"], correct: 1, explanation: "גולשים על מים עם לוח", category: "sports" },
    { id: 6304, text: "What do you do with a paddle in water?", options: ["Soccer", "Kayaking", "Running", "Jumping"], correct: 1, explanation: "חותרים בקאנו עם משוט", category: "sports" },
    { id: 6305, text: "What do you do in a boat?", options: ["Soccer", "Rowing", "Running", "Jumping"], correct: 1, explanation: "חותרים בסירה", category: "sports" },
    { id: 6306, text: "What do you do with a disc?", options: ["Soccer", "Discus", "Running", "Jumping"], correct: 1, explanation: "זורקים דיסקוס", category: "sports" },
    { id: 6307, text: "What do you do with a javelin?", options: ["Soccer", "Javelin", "Running", "Jumping"], correct: 1, explanation: "זורקים כידון", category: "sports" },
    { id: 6308, text: "What do you do with a shot?", options: ["Soccer", "Shot put", "Running", "Jumping"], correct: 1, explanation: "דוחפים כדור ברזל", category: "sports" },
    
    // מקומות מתקדמים מאוד
    { id: 6309, text: "Where do you compete in Olympics?", options: ["Olympic stadium", "Pool", "Court", "Track"], correct: 0, explanation: "מתחרים באולימפיאדה באצטדיון אולימפי", category: "places" },
    { id: 6310, text: "Where do you play water polo?", options: ["Pool", "Beach", "Court", "Track"], correct: 0, explanation: "משחקים כדורמים בבריכה", category: "places" },
    { id: 6311, text: "Where do you fence?", options: ["Fencing hall", "Pool", "Court", "Track"], correct: 0, explanation: "מתחרים בסיוף באולם סיוף", category: "places" },
    { id: 6312, text: "Where do you row?", options: ["Rowing course", "Pool", "Court", "Track"], correct: 0, explanation: "חותרים במסלול חתירה", category: "places" },
    
    // פעילויות ספורט מתקדמות מאוד
    { id: 6313, text: "What do you do to qualify?", options: ["Qualify", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מעפילים כדי להעפיל", category: "activities" },
    { id: 6314, text: "What do you do to break a record?", options: ["Try your best", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מנסים הכי טוב כדי לשבור שיא", category: "activities" },
    { id: 6315, text: "What do you do to stay in shape?", options: ["Exercise regularly", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מתעמלים באופן קבוע כדי להישאר בכושר", category: "activities" },
    { id: 6316, text: "What do you do to prevent injury?", options: ["Warm up properly", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מתחממים כראוי כדי למנוע פציעה", category: "activities" },
    
    // אוצר מילים - ספורט מתקדם מאוד
    { id: 6317, text: "What is the English word for 'סיוף'?", options: ["Soccer", "Fencing", "Running", "Jumping"], correct: 1, explanation: "המילה 'Fencing' פירושה 'סיוף'", category: "vocabulary" },
    { id: 6318, text: "What is the English word for 'כדורמים'?", options: ["Soccer", "Water polo", "Running", "Jumping"], correct: 1, explanation: "המילה 'Water polo' פירושה 'כדורמים'", category: "vocabulary" },
    { id: 6319, text: "What is the English word for 'גלישת מים'?", options: ["Soccer", "Water skiing", "Running", "Jumping"], correct: 1, explanation: "המילה 'Water skiing' פירושה 'גלישת מים'", category: "vocabulary" },
    { id: 6320, text: "What is the English word for 'קאנו'?", options: ["Soccer", "Kayaking", "Running", "Jumping"], correct: 1, explanation: "המילה 'Kayaking' פירושה 'קאנו'", category: "vocabulary" },
    { id: 6321, text: "What is the English word for 'חתירה'?", options: ["Soccer", "Rowing", "Running", "Jumping"], correct: 1, explanation: "המילה 'Rowing' פירושה 'חתירה'", category: "vocabulary" },
    { id: 6322, text: "What is the English word for 'דיסקוס'?", options: ["Soccer", "Discus", "Running", "Jumping"], correct: 1, explanation: "המילה 'Discus' פירושה 'דיסקוס'", category: "vocabulary" },
    { id: 6323, text: "What is the English word for 'כידון'?", options: ["Soccer", "Javelin", "Running", "Jumping"], correct: 1, explanation: "המילה 'Javelin' פירושה 'כידון'", category: "vocabulary" },
    { id: 6324, text: "What is the English word for 'הדיפת כדור ברזל'?", options: ["Soccer", "Shot put", "Running", "Jumping"], correct: 1, explanation: "המילה 'Shot put' פירושה 'הדיפת כדור ברזל'", category: "vocabulary" },
    
    // אוצר מילים - מקומות מתקדמים מאוד
    { id: 6325, text: "What is the English word for 'אצטדיון אולימפי'?", options: ["Olympic stadium", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Olympic stadium' פירושה 'אצטדיון אולימפי'", category: "vocabulary" },
    { id: 6326, text: "What is the English word for 'אולם סיוף'?", options: ["Fencing hall", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Fencing hall' פירושה 'אולם סיוף'", category: "vocabulary" },
    { id: 6327, text: "What is the English word for 'מסלול חתירה'?", options: ["Rowing course", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Rowing course' פירושה 'מסלול חתירה'", category: "vocabulary" },
    
    // קריאה - ספורט מתקדם מאוד
    { id: 6328, text: "Read: 'I compete in the Olympics. The Olympic stadium is huge and exciting.' Where do you compete in the Olympics?", options: ["Olympic stadium", "Pool", "Court", "Track"], correct: 0, explanation: "מתחרים באולימפיאדה באצטדיון אולימפי", category: "reading" },
    { id: 6329, text: "Read: 'I play water polo in the pool. Water polo is a team sport in water.' Where do you play water polo?", options: ["Pool", "Beach", "Court", "Track"], correct: 0, explanation: "משחקים כדורמים בבריכה", category: "reading" },
    { id: 6330, text: "Read: 'I try my best to break a record. Breaking a record is very difficult.' What do you do to break a record?", options: ["Sleep", "Try your best", "Eat", "Nothing"], correct: 1, explanation: "מנסים הכי טוב כדי לשבור שיא", category: "reading" },
    { id: 6331, text: "Read: 'I warm up properly before exercise. Proper warm-up prevents injury.' Why do you warm up properly?", options: ["To sleep", "To prevent injury", "To eat", "To play"], correct: 1, explanation: "מתחממים כראוי כדי למנוע פציעה", category: "reading" },
    
    // דקדוק - ספורט מתקדם מאוד
    { id: 6332, text: "Complete: 'I ___ been training for the Olympics for two years.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "אני מתאמן לאולימפיאדה כבר שנתיים (הווה מושלם מתמשך)", category: "grammar" },
    { id: 6333, text: "Complete: 'She ___ already qualified for the championship.'", options: ["has", "have", "had", "having"], correct: 0, explanation: "היא כבר העפילה לאליפות (הווה מושלם)", category: "grammar" },
    { id: 6334, text: "Complete: 'We ___ going to compete in the tournament next month.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו הולכים להתחרות בטורניר בחודש הבא (עתיד עם going to)", category: "grammar" },
    { id: 6335, text: "Complete: 'They ___ not yet broken the world record.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "הם עדיין לא שברו את שיא העולם (הווה מושלם שלילי)", category: "grammar" },
    { id: 6336, text: "Complete: 'He ___ never won an Olympic medal before.'", options: ["has", "have", "had", "having"], correct: 0, explanation: "הוא מעולם לא זכה במדליה אולימפית לפני (הווה מושלם)", category: "grammar" },
    
    // שאלות חזרה - מילים מתקדמות מאוד
    { id: 6337, text: "🔊 חזור אחרי הקריין: Fencing", options: ["Soccer", "Fencing", "Running", "Jumping"], correct: 1, explanation: "Fencing - סיוף", category: "repeat" },
    { id: 6338, text: "🔊 חזור אחרי הקריין: Water polo", options: ["Soccer", "Water polo", "Running", "Jumping"], correct: 1, explanation: "Water polo - כדורמים", category: "repeat" },
    { id: 6339, text: "🔊 חזור אחרי הקריין: Water skiing", options: ["Soccer", "Water skiing", "Running", "Jumping"], correct: 1, explanation: "Water skiing - גלישת מים", category: "repeat" },
    { id: 6340, text: "🔊 חזור אחרי הקריין: Kayaking", options: ["Soccer", "Kayaking", "Running", "Jumping"], correct: 1, explanation: "Kayaking - קאנו", category: "repeat" },
    { id: 6341, text: "🔊 חזור אחרי הקריין: Rowing", options: ["Soccer", "Rowing", "Running", "Jumping"], correct: 1, explanation: "Rowing - חתירה", category: "repeat" },
    { id: 6342, text: "🔊 חזור אחרי הקריין: Discus", options: ["Soccer", "Discus", "Running", "Jumping"], correct: 1, explanation: "Discus - דיסקוס", category: "repeat" },
    { id: 6343, text: "🔊 חזור אחרי הקריין: Javelin", options: ["Soccer", "Javelin", "Running", "Jumping"], correct: 1, explanation: "Javelin - כידון", category: "repeat" },
    { id: 6344, text: "🔊 חזור אחרי הקריין: Shot put", options: ["Soccer", "Shot put", "Running", "Jumping"], correct: 1, explanation: "Shot put - הדיפת כדור ברזל", category: "repeat" },
    { id: 6345, text: "🔊 חזור אחרי הקריין: Olympic stadium", options: ["Olympic stadium", "Pool", "Court", "Track"], correct: 0, explanation: "Olympic stadium - אצטדיון אולימפי", category: "repeat" },
    { id: 6346, text: "🔊 חזור אחרי הקריין: Fencing hall", options: ["Fencing hall", "Pool", "Court", "Track"], correct: 0, explanation: "Fencing hall - אולם סיוף", category: "repeat" },
    { id: 6347, text: "🔊 חזור אחרי הקריין: Rowing course", options: ["Rowing course", "Pool", "Court", "Track"], correct: 0, explanation: "Rowing course - מסלול חתירה", category: "repeat" },
    { id: 6348, text: "🔊 חזור אחרי הקריין: Qualify", options: ["Qualify", "Practice", "Train", "Exercise"], correct: 0, explanation: "Qualify - להעפיל", category: "repeat" },
    { id: 6349, text: "🔊 חזור אחרי הקריין: Record", options: ["Record", "Score", "Goal", "Point"], correct: 0, explanation: "Record - שיא", category: "repeat" },
    { id: 6350, text: "🔊 חזור אחרי הקריין: Injury", options: ["Injury", "Health", "Strength", "Power"], correct: 0, explanation: "Injury - פציעה", category: "repeat" },
    { id: 6351, text: "🔊 חזור אחרי הקריין: Sword", options: ["Sword", "Knife", "Stick", "Club"], correct: 0, explanation: "Sword - חרב", category: "repeat" },
    { id: 6352, text: "🔊 חזור אחרי הקריין: Paddle", options: ["Paddle", "Oar", "Stick", "Club"], correct: 0, explanation: "Paddle - משוט", category: "repeat" },
    { id: 6353, text: "🔊 חזור אחרי הקריין: Oar", options: ["Paddle", "Oar", "Stick", "Club"], correct: 1, explanation: "Oar - משוט", category: "repeat" },
    { id: 6354, text: "🔊 חזור אחרי הקריין: Disc", options: ["Disc", "Ball", "Circle", "Round"], correct: 0, explanation: "Disc - דיסק", category: "repeat" },
    { id: 6355, text: "🔊 חזור אחרי הקריין: Spear", options: ["Spear", "Arrow", "Stick", "Club"], correct: 0, explanation: "Spear - כידון", category: "repeat" },
    { id: 6356, text: "🔊 חזור אחרי הקריין: Shot", options: ["Shot", "Ball", "Circle", "Round"], correct: 0, explanation: "Shot - כדור ברזל", category: "repeat" },
    { id: 6357, text: "🔊 חזור אחרי הקריין: Olympics", options: ["Olympics", "Tournament", "Championship", "Game"], correct: 0, explanation: "Olympics - אולימפיאדה", category: "repeat" },
    { id: 6358, text: "🔊 חזור אחרי הקריין: Athlete", options: ["Athlete", "Player", "Coach", "Referee"], correct: 0, explanation: "Athlete - אתלט", category: "repeat" },
    { id: 6359, text: "🔊 חזור אחרי הקריין: Fitness", options: ["Fitness", "Health", "Strength", "Power"], correct: 0, explanation: "Fitness - כושר", category: "repeat" },
    { id: 6360, text: "🔊 חזור אחרי הקריין: Endurance", options: ["Endurance", "Strength", "Speed", "Power"], correct: 0, explanation: "Endurance - סיבולת", category: "repeat" }
    ],
    '5': [ // רמה 5 - מומחה - ספורט ופעילות גופנית מומחה
    // ספורט מומחה
    { id: 6401, text: "What is a triathlon?", options: ["Soccer", "Triathlon", "Running", "Jumping"], correct: 1, explanation: "טריאתלון הוא תחרות של שלושה ענפי ספורט", category: "sports" },
    { id: 6402, text: "What is a decathlon?", options: ["Soccer", "Decathlon", "Running", "Jumping"], correct: 1, explanation: "דקתלון הוא תחרות של עשרה ענפי ספורט", category: "sports" },
    { id: 6403, text: "What is a pentathlon?", options: ["Soccer", "Pentathlon", "Running", "Jumping"], correct: 1, explanation: "פנטאתלון הוא תחרות של חמישה ענפי ספורט", category: "sports" },
    { id: 6404, text: "What is a marathon?", options: ["Soccer", "Marathon", "Running", "Jumping"], correct: 1, explanation: "מרתון הוא ריצה ארוכה מאוד", category: "sports" },
    { id: 6405, text: "What is a sprint?", options: ["Soccer", "Sprint", "Running", "Jumping"], correct: 1, explanation: "ספרינט הוא ריצה מהירה מאוד", category: "sports" },
    { id: 6406, text: "What is a relay?", options: ["Soccer", "Relay", "Running", "Jumping"], correct: 1, explanation: "מרוץ שליחים הוא ריצה עם מקל", category: "sports" },
    { id: 6407, text: "What is a hurdle?", options: ["Soccer", "Hurdle", "Running", "Jumping"], correct: 1, explanation: "מכשול הוא ריצה עם מכשולים", category: "sports" },
    { id: 6408, text: "What is a pole vault?", options: ["Soccer", "Pole vault", "Running", "Jumping"], correct: 1, explanation: "קפיצה במוט היא קפיצה גבוהה עם מוט", category: "sports" },
    
    // מקומות מומחה
    { id: 6409, text: "Where do you compete in professional sports?", options: ["Arena", "Pool", "Court", "Track"], correct: 0, explanation: "מתחרים בספורט מקצועי בארנה", category: "places" },
    { id: 6410, text: "Where do you train for professional sports?", options: ["Training facility", "Pool", "Court", "Track"], correct: 0, explanation: "מתאמנים לספורט מקצועי במתקן אימונים", category: "places" },
    { id: 6411, text: "Where do you watch professional sports?", options: ["Stadium", "Pool", "Court", "Track"], correct: 0, explanation: "צופים בספורט מקצועי באצטדיון", category: "places" },
    { id: 6412, text: "Where do you recover from injury?", options: ["Rehabilitation center", "Pool", "Court", "Track"], correct: 0, explanation: "מתאוששים מפציעה במרכז שיקום", category: "places" },
    
    // פעילויות ספורט מומחה
    { id: 6413, text: "What do you do to achieve peak performance?", options: ["Train intensively", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "מתאמנים בצורה אינטנסיבית כדי להגיע לביצועים שיא", category: "activities" },
    { id: 6414, text: "What do you do to maintain stamina?", options: ["Build endurance", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "בונים סיבולת כדי לשמור על כושר", category: "activities" },
    { id: 6415, text: "What do you do to enhance performance?", options: ["Use sports science", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "משתמשים במדעי הספורט כדי לשפר ביצועים", category: "activities" },
    { id: 6416, text: "What do you do to optimize training?", options: ["Follow a program", "Sleep", "Eat", "Nothing"], correct: 0, explanation: "עוקבים אחרי תוכנית כדי לייעל אימונים", category: "activities" },
    
    // אוצר מילים - ספורט מומחה
    { id: 6417, text: "What is the English word for 'טריאתלון'?", options: ["Soccer", "Triathlon", "Running", "Jumping"], correct: 1, explanation: "המילה 'Triathlon' פירושה 'טריאתלון'", category: "vocabulary" },
    { id: 6418, text: "What is the English word for 'דקתלון'?", options: ["Soccer", "Decathlon", "Running", "Jumping"], correct: 1, explanation: "המילה 'Decathlon' פירושה 'דקתלון'", category: "vocabulary" },
    { id: 6419, text: "What is the English word for 'פנטאתלון'?", options: ["Soccer", "Pentathlon", "Running", "Jumping"], correct: 1, explanation: "המילה 'Pentathlon' פירושה 'פנטאתלון'", category: "vocabulary" },
    { id: 6420, text: "What is the English word for 'מרתון'?", options: ["Soccer", "Marathon", "Running", "Jumping"], correct: 1, explanation: "המילה 'Marathon' פירושה 'מרתון'", category: "vocabulary" },
    { id: 6421, text: "What is the English word for 'ספרינט'?", options: ["Soccer", "Sprint", "Running", "Jumping"], correct: 1, explanation: "המילה 'Sprint' פירושה 'ספרינט'", category: "vocabulary" },
    { id: 6422, text: "What is the English word for 'מרוץ שליחים'?", options: ["Soccer", "Relay", "Running", "Jumping"], correct: 1, explanation: "המילה 'Relay' פירושה 'מרוץ שליחים'", category: "vocabulary" },
    { id: 6423, text: "What is the English word for 'מכשול'?", options: ["Soccer", "Hurdle", "Running", "Jumping"], correct: 1, explanation: "המילה 'Hurdle' פירושה 'מכשול'", category: "vocabulary" },
    { id: 6424, text: "What is the English word for 'קפיצה במוט'?", options: ["Soccer", "Pole vault", "Running", "Jumping"], correct: 1, explanation: "המילה 'Pole vault' פירושה 'קפיצה במוט'", category: "vocabulary" },
    
    // אוצר מילים - מקומות מומחה
    { id: 6425, text: "What is the English word for 'ארנה'?", options: ["Arena", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Arena' פירושה 'ארנה'", category: "vocabulary" },
    { id: 6426, text: "What is the English word for 'מתקן אימונים'?", options: ["Training facility", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Training facility' פירושה 'מתקן אימונים'", category: "vocabulary" },
    { id: 6427, text: "What is the English word for 'אצטדיון'?", options: ["Stadium", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Stadium' פירושה 'אצטדיון'", category: "vocabulary" },
    { id: 6428, text: "What is the English word for 'מרכז שיקום'?", options: ["Rehabilitation center", "Pool", "Court", "Track"], correct: 0, explanation: "המילה 'Rehabilitation center' פירושה 'מרכז שיקום'", category: "vocabulary" },
    
    // קריאה - ספורט מומחה
    { id: 6429, text: "Read: 'I compete in a triathlon. A triathlon includes swimming, cycling, and running.' What does a triathlon include?", options: ["One sport", "Three sports", "Ten sports", "Five sports"], correct: 1, explanation: "טריאתלון כולל שלושה ענפי ספורט", category: "reading" },
    { id: 6430, text: "Read: 'I run a marathon. A marathon is 42 kilometers long.' How long is a marathon?", options: ["10 kilometers", "21 kilometers", "42 kilometers", "100 kilometers"], correct: 2, explanation: "מרתון הוא 42 קילומטרים", category: "reading" },
    { id: 6431, text: "Read: 'I train intensively to achieve peak performance. Peak performance requires dedication and hard work.' What does peak performance require?", options: ["Sleep", "Dedication and hard work", "Eat", "Nothing"], correct: 1, explanation: "ביצועים שיא דורשים מסירות ועבודה קשה", category: "reading" },
    { id: 6432, text: "Read: 'I follow a training program to optimize my training. A good program helps me improve.' Why do you follow a training program?", options: ["To sleep", "To optimize training", "To eat", "To play"], correct: 1, explanation: "עוקבים אחרי תוכנית אימונים כדי לייעל אימונים", category: "reading" },
    
    // דקדוק - ספורט מומחה
    { id: 6433, text: "Complete: 'I ___ been training for the marathon for six months.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "אני מתאמן למרתון כבר שישה חודשים (הווה מושלם מתמשך)", category: "grammar" },
    { id: 6434, text: "Complete: 'She ___ already completed three triathlons this year.'", options: ["has", "have", "had", "having"], correct: 0, explanation: "היא כבר סיימה שלושה טריאתלונים השנה (הווה מושלם)", category: "grammar" },
    { id: 6435, text: "Complete: 'We ___ going to compete in the championship next year.'", options: ["am", "is", "are", "be"], correct: 2, explanation: "אנחנו הולכים להתחרות באליפות בשנה הבאה (עתיד עם going to)", category: "grammar" },
    { id: 6436, text: "Complete: 'They ___ not yet achieved their personal best.'", options: ["has", "have", "had", "having"], correct: 1, explanation: "הם עדיין לא השיגו את השיא האישי שלהם (הווה מושלם שלילי)", category: "grammar" },
    { id: 6437, text: "Complete: 'He ___ never participated in a decathlon before.'", options: ["has", "have", "had", "having"], correct: 0, explanation: "הוא מעולם לא השתתף בדקתלון לפני (הווה מושלם)", category: "grammar" },
    
    // שאלות חזרה - מילים מומחה
    { id: 6438, text: "🔊 חזור אחרי הקריין: Triathlon", options: ["Soccer", "Triathlon", "Running", "Jumping"], correct: 1, explanation: "Triathlon - טריאתלון", category: "repeat" },
    { id: 6439, text: "🔊 חזור אחרי הקריין: Decathlon", options: ["Soccer", "Decathlon", "Running", "Jumping"], correct: 1, explanation: "Decathlon - דקתלון", category: "repeat" },
    { id: 6440, text: "🔊 חזור אחרי הקריין: Pentathlon", options: ["Soccer", "Pentathlon", "Running", "Jumping"], correct: 1, explanation: "Pentathlon - פנטאתלון", category: "repeat" },
    { id: 6441, text: "🔊 חזור אחרי הקריין: Marathon", options: ["Soccer", "Marathon", "Running", "Jumping"], correct: 1, explanation: "Marathon - מרתון", category: "repeat" },
    { id: 6442, text: "🔊 חזור אחרי הקריין: Sprint", options: ["Soccer", "Sprint", "Running", "Jumping"], correct: 1, explanation: "Sprint - ספרינט", category: "repeat" },
    { id: 6443, text: "🔊 חזור אחרי הקריין: Relay", options: ["Soccer", "Relay", "Running", "Jumping"], correct: 1, explanation: "Relay - מרוץ שליחים", category: "repeat" },
    { id: 6444, text: "🔊 חזור אחרי הקריין: Hurdle", options: ["Soccer", "Hurdle", "Running", "Jumping"], correct: 1, explanation: "Hurdle - מכשול", category: "repeat" },
    { id: 6445, text: "🔊 חזור אחרי הקריין: Pole vault", options: ["Soccer", "Pole vault", "Running", "Jumping"], correct: 1, explanation: "Pole vault - קפיצה במוט", category: "repeat" },
    { id: 6446, text: "🔊 חזור אחרי הקריין: Arena", options: ["Arena", "Pool", "Court", "Track"], correct: 0, explanation: "Arena - ארנה", category: "repeat" },
    { id: 6447, text: "🔊 חזור אחרי הקריין: Training facility", options: ["Training facility", "Pool", "Court", "Track"], correct: 0, explanation: "Training facility - מתקן אימונים", category: "repeat" },
    { id: 6448, text: "🔊 חזור אחרי הקריין: Stadium", options: ["Stadium", "Pool", "Court", "Track"], correct: 0, explanation: "Stadium - אצטדיון", category: "repeat" },
    { id: 6449, text: "🔊 חזור אחרי הקריין: Rehabilitation center", options: ["Rehabilitation center", "Pool", "Court", "Track"], correct: 0, explanation: "Rehabilitation center - מרכז שיקום", category: "repeat" },
    { id: 6450, text: "🔊 חזור אחרי הקריין: Peak performance", options: ["Peak performance", "Average performance", "Poor performance", "Good performance"], correct: 0, explanation: "Peak performance - ביצועים שיא", category: "repeat" },
    { id: 6451, text: "🔊 חזור אחרי הקריין: Stamina", options: ["Stamina", "Strength", "Speed", "Power"], correct: 0, explanation: "Stamina - כושר", category: "repeat" },
    { id: 6452, text: "🔊 חזור אחרי הקריין: Enhance", options: ["Enhance", "Improve", "Better", "Upgrade"], correct: 0, explanation: "Enhance - לשפר", category: "repeat" },
    { id: 6453, text: "🔊 חזור אחרי הקריין: Optimize", options: ["Optimize", "Improve", "Better", "Upgrade"], correct: 0, explanation: "Optimize - לייעל", category: "repeat" },
    { id: 6454, text: "🔊 חזור אחרי הקריין: Intensively", options: ["Intensively", "Lightly", "Slowly", "Quickly"], correct: 0, explanation: "Intensively - בצורה אינטנסיבית", category: "repeat" },
    { id: 6455, text: "🔊 חזור אחרי הקריין: Dedication", options: ["Dedication", "Laziness", "Carelessness", "Neglect"], correct: 0, explanation: "Dedication - מסירות", category: "repeat" },
    { id: 6456, text: "🔊 חזור אחרי הקריין: Personal best", options: ["Personal best", "Worst", "Average", "Normal"], correct: 0, explanation: "Personal best - שיא אישי", category: "repeat" },
    { id: 6457, text: "🔊 חזור אחרי הקריין: Sports science", options: ["Sports science", "Regular science", "No science", "Bad science"], correct: 0, explanation: "Sports science - מדעי הספורט", category: "repeat" },
    { id: 6458, text: "🔊 חזור אחרי הקריין: Program", options: ["Program", "Plan", "Schedule", "Route"], correct: 0, explanation: "Program - תוכנית", category: "repeat" },
    { id: 6459, text: "🔊 חזור אחרי הקריין: Baton", options: ["Baton", "Stick", "Club", "Rod"], correct: 0, explanation: "Baton - מקל שליחים", category: "repeat" },
    { id: 6460, text: "🔊 חזור אחרי הקריין: Pole", options: ["Pole", "Stick", "Club", "Rod"], correct: 0, explanation: "Pole - מוט", category: "repeat" }
    ]
  },
  '7': { // יחידה 7 - דקדוק מתקדם
    '1': [ // רמה 1 - מתחילים - דקדוק מורכב מאוד
    { id: 502, text: "Choose the correct passive voice: 'The house ___ yesterday'", options: ["built", "was built", "builds", "is building"], correct: 1, explanation: "משתמשים בצורת סביל 'was built' לעבר פשוט", category: "grammar" },
    { id: 503, text: "Choose the correct reported speech: 'He said: \"I am happy\"'", options: ["He said he was happy", "He said he is happy", "He said I am happy", "He said he will be happy"], correct: 0, explanation: "זהו דיבור ישיר (Reported Speech) נכון. כשמהפכים דיבור ישיר לדיבור עקיף, צריך לשנות את הזמנים (Backshift). כאן: 'I am happy' (הווה) הופך ל-'he was happy' (עבר) כי הפעולה של האמירה כבר התרחשה. כלל הזמנים: הווה → עבר, עבר → עבר מושלם, עתיד → conditional. גם משנים את הגופים: 'I' הופך ל-'he' בהתאם למי שמדבר.", category: "grammar" },
    { id: 504, text: "Choose the correct reported speech: 'She said: \"I will come\"'", options: ["She said she will come", "She said she would come", "She said I will come", "She said she comes"], correct: 1, explanation: "זהו דיבור ישיר (Reported Speech) נכון. לפי כלל הזמנים (Backshift), 'will' (עתיד) הופך ל-'would' (conditional) בדיבור עקיף. כאן: 'I will come' הופך ל-'she would come'. זה קורה כי הפעולה של האמירה כבר התרחשה בעבר, ולכן העתיד של הדיבור הישיר הופך ל-conditional בדיבור העקיף. גם משנים את הגוף מ-'I' ל-'she'.", category: "grammar" },
    { id: 505, text: "Choose the correct relative clause: 'The man ___ is tall'", options: ["who", "which", "where", "when"], correct: 0, explanation: "זהו Relative Clause (פסוקית יחס) נכון. 'Who' משמש לאנשים, 'which' לחפצים, 'where' למקומות, 'when' לזמנים. כאן: 'The man who is tall' = 'האיש שגבוה'. Relative pronouns מחברים בין שני חלקי המשפט ומתארים את השם העצם שלפניהם. 'Who' מחליף את 'the man' בפסוקית היחס.", category: "grammar" },
    { id: 506, text: "Choose the correct relative clause: 'The book ___ I read is interesting'", options: ["who", "which", "where", "when"], correct: 1, explanation: "זהו Relative Clause (פסוקית יחס) נכון. 'Which' משמש לחפצים ודברים לא חיים, בעוד 'who' לאנשים. כאן: 'The book which I read is interesting' = 'הספר שאני קורא מעניין'. Relative pronouns מחברים בין שני חלקי המשפט ומתארים את השם העצם. 'Which' מחליף את 'the book' בפסוקית היחס ומתאר איזה ספר מדובר.", category: "grammar" },
    { id: 507, text: "Choose the correct gerund: 'I enjoy ___ books'", options: ["read", "reading", "reads", "to read"], correct: 1, explanation: "זהו Gerund (צורת ה-ing של הפועל) הנכון. פועלים כמו 'enjoy', 'like', 'love', 'hate', 'prefer' תמיד מלווים ב-Gerund ולא ב-Infinitive. Gerund משמש כשם עצם ומתאר פעולה כללית. כאן: 'I enjoy reading books' = 'אני נהנה מקריאת ספרים'. זה שונה מ-Infinitive שמשמש אחרי פועלים כמו 'want', 'need', 'hope'.", category: "grammar" },
    { id: 508, text: "Choose the correct infinitive: 'I want ___ a doctor'", options: ["be", "being", "to be", "been"], correct: 2, explanation: "זהו Infinitive (to + פועל) הנכון. פועלים כמו 'want', 'need', 'hope', 'decide', 'plan' תמיד מלווים ב-Infinitive ולא ב-Gerund. Infinitive מתאר מטרה או רצון עתידי. כאן: 'I want to be a doctor' = 'אני רוצה להיות רופא'. זה שונה מ-Gerund שמשמש אחרי פועלים כמו 'enjoy', 'like', 'prefer'. כלל: רצון/תכנון → Infinitive, הנאה/העדפה → Gerund.", category: "grammar" },
    { id: 509, text: "Choose the correct conditional: 'If I had studied, I ___ passed'", options: ["will pass", "would pass", "would have passed", "pass"], correct: 2, explanation: "זהו משפט תנאי מהסוג השלישי (Third Conditional) המשמש לדיבור על מצבים שלא התרחשו בעבר. המבנה הוא: If + Past Perfect + would have + Past Participle. כאן: 'If I had studied' (Past Perfect) + 'I would have passed' (would have + Past Participle). זה מתאר מצב היפותטי - 'אילו למדתי (בעבר), הייתי עובר (בעבר)'. זה משמש להבעת חרטה או לדיון על מה שקרה אם הדברים היו שונים בעבר.", category: "grammar" },
    { id: 510, text: "Choose the correct modal: 'You ___ have called me'", options: ["should", "must", "can", "will"], correct: 0, explanation: "זהו Modal Perfect (modal + have + past participle) נכון. 'Should have' + past participle משמש להבעת חרטה או ביקורת על פעולה שלא בוצעה בעבר. כאן: 'You should have called me' = 'היית צריך להתקשר אליי (אבל לא התקשרת)'. זה שונה מ-'must have' (כנראה), 'can't have' (לא יכול להיות), 'would have' (הייתי). 'Should have' מביע ציפייה שלא מומשה.", category: "grammar" },
    
    // הבנת הנקרא מתקדמת מאוד
    { id: 511, text: "What is the author's bias in: 'Everyone knows that our product is the best in the world'", options: ["Objective", "Subjective", "Neutral", "Unbiased"], correct: 1, explanation: "הכותב סובייקטיבי ומוטה", category: "reading" },
    { id: 512, text: "What is the logical fallacy in: 'All doctors are smart, so John must be smart because he's a doctor'", options: ["Hasty generalization", "False cause", "Ad hominem", "Straw man"], correct: 0, explanation: "זה הכללה נמהרת", category: "reading" },
    { id: 513, text: "What is the main argument in: 'Schools should start later because students need more sleep'", options: ["Schools are bad", "Students are lazy", "Later start times help students", "Sleep is unimportant"], correct: 2, explanation: "הטענה היא ששעות התחלה מאוחרות יותר עוזרות לתלמידים", category: "reading" },
    { id: 514, text: "What is the counterargument to: 'Technology makes life easier'", options: ["Technology is expensive", "Technology can be complicated", "Technology is always good", "Technology is always bad"], correct: 1, explanation: "הטענה הנגדית היא שטכנולוגיה יכולה להיות מסובכת", category: "reading" },
    { id: 515, text: "What is the evidence for: 'Exercise improves mental health'", options: ["Personal opinion", "Scientific studies", "Popular belief", "Common sense"], correct: 1, explanation: "מחקרים מדעיים מספקים עדות", category: "reading" },
    { id: 516, text: "What is the conclusion of: 'If A=B and B=C, then A=C'", options: ["A is different from C", "A equals C", "B is the most important", "The logic is wrong"], correct: 1, explanation: "המסקנה היא ש-A שווה ל-C", category: "reading" },
    { id: 517, text: "What is the premise in: 'Since it's raining, we should stay inside'", options: ["We should stay inside", "It's raining", "Rain is bad", "Inside is better"], correct: 1, explanation: "ההנחה היא 'יורד גשם'", category: "reading" },
    { id: 518, text: "What is the analogy in: 'Life is like a journey'", options: ["Life is difficult", "Life has a destination", "Life is like traveling", "Life is unpredictable"], correct: 2, explanation: "החיים מושווים לנסיעה", category: "reading" },
    { id: 519, text: "What is the metaphor in: 'Time is money'", options: ["Time is valuable", "Time costs money", "Time is like money", "Time is expensive"], correct: 2, explanation: "הזמן מושווה לכסף", category: "reading" },
    { id: 520, text: "What is the irony in: 'The fire station burned down'", options: ["Fire stations are dangerous", "Fire stations can burn", "Fire stations should prevent fires", "Fire stations are useless"], correct: 2, explanation: "אירוני שתחנת כיבוי אש נשרפה", category: "reading" },
    
    // אוצר מילים מתקדם מאוד
    { id: 521, text: "What does 'ubiquitous' mean?", options: ["Rare", "Common everywhere", "Expensive", "Difficult"], correct: 1, explanation: "המילה 'ubiquitous' פירושה 'נפוץ בכל מקום'", category: "vocabulary" },
    { id: 522, text: "What does 'ephemeral' mean?", options: ["Lasting forever", "Lasting briefly", "Very large", "Very small"], correct: 1, explanation: "המילה 'ephemeral' פירושה 'נמשך זמן קצר'", category: "vocabulary" },
    { id: 523, text: "What does 'pervasive' mean?", options: ["Limited", "Widespread", "Rare", "Expensive"], correct: 1, explanation: "המילה 'pervasive' פירושה 'נפוץ מאוד'", category: "vocabulary" },
    { id: 524, text: "What does 'meticulous' mean?", options: ["Careless", "Very careful", "Fast", "Slow"], correct: 1, explanation: "המילה 'meticulous' פירושה 'מאוד זהיר'", category: "vocabulary" },
    { id: 525, text: "What does 'voracious' mean?", options: ["Small appetite", "Large appetite", "No appetite", "Strange appetite"], correct: 1, explanation: "המילה 'voracious' פירושה 'תיאבון גדול'", category: "vocabulary" },
    { id: 526, text: "What does 'eloquent' mean?", options: ["Poor speaker", "Good speaker", "Quiet", "Loud"], correct: 1, explanation: "המילה 'eloquent' פירושה 'דובר טוב'", category: "vocabulary" },
    { id: 527, text: "What does 'resilient' mean?", options: ["Weak", "Strong and flexible", "Rigid", "Fragile"], correct: 1, explanation: "המילה 'resilient' פירושה 'חזק וגמיש'", category: "vocabulary" },
    { id: 528, text: "What does 'ambiguous' mean?", options: ["Clear", "Unclear", "Simple", "Complex"], correct: 1, explanation: "המילה 'ambiguous' פירושה 'לא ברור'", category: "vocabulary" },
    { id: 529, text: "What does 'cogent' mean?", options: ["Weak argument", "Strong argument", "Long argument", "Short argument"], correct: 1, explanation: "המילה 'cogent' פירושה 'טענה חזקה'", category: "vocabulary" },
    { id: 530, text: "What does 'sagacious' mean?", options: ["Foolish", "Wise", "Young", "Old"], correct: 1, explanation: "המילה 'sagacious' פירושה 'חכם'", category: "vocabulary" },
    
    // משפטים מורכבים מאוד
    { id: 531, text: "Complete: 'Not only did she finish her homework, but she also ___'", options: ["started it", "forgot it", "helped her friend", "threw it away"], correct: 2, explanation: "'Not only...but also' מראה פעולה נוספת", category: "complex" },
    { id: 532, text: "Complete: 'Had I known about the test, I ___ studied'", options: ["will study", "would study", "would have studied", "study"], correct: 2, explanation: "'Had I known' משתמש במשפט תנאי מהסוג השלישי", category: "complex" },
    { id: 533, text: "Complete: 'Were I you, I ___ accept the offer'", options: ["will", "would", "would have", "am"], correct: 1, explanation: "'Were I you' משתמש במשפט תנאי מהסוג השני", category: "complex" },
    { id: 534, text: "Complete: 'So difficult was the exam that ___'", options: ["everyone passed", "everyone failed", "no one tried", "everyone enjoyed it"], correct: 1, explanation: "'So difficult was...' מראה קושי קיצוני", category: "complex" },
    { id: 535, text: "Complete: 'Such was his determination that ___'", options: ["he gave up", "he succeeded", "he failed", "he quit"], correct: 1, explanation: "'Such was...' מראה נחישות קיצונית", category: "complex" },
    { id: 536, text: "Complete: 'No sooner had he arrived than ___'", options: ["he left", "he stayed", "he forgot", "he remembered"], correct: 0, explanation: "'No sooner...than' מראה פעולה מיידית", category: "complex" },
    { id: 537, text: "Complete: 'Hardly had she finished when ___'", options: ["she started", "she stopped", "she continued", "she forgot"], correct: 0, explanation: "'Hardly...when' מראה רצף מיידי", category: "complex" },
    { id: 538, text: "Complete: 'Scarcely had the bell rung when ___'", options: ["students left", "students arrived", "students slept", "students studied"], correct: 0, explanation: "'Scarcely...when' מראה פעולה מיידית", category: "complex" },
    { id: 539, text: "Complete: 'Barely had he spoken when ___'", options: ["everyone listened", "everyone interrupted", "everyone left", "everyone agreed"], correct: 1, explanation: "'Barely...when' מראה הפרעה מיידית", category: "complex" },
    { id: 540, text: "Complete: 'Rarely do we see such talent, but when we do, ___'", options: ["we ignore it", "we appreciate it", "we criticize it", "we forget it"], correct: 1, explanation: "'Rarely do we...but when we do' מראה הערכה", category: "complex" },
    
    // שאלות חזרה - הקריין אומר והתלמיד חוזר (כיתה ו')
    { id: 541, text: "🔊 חזור אחרי הקריין: Extraordinary", options: ["Extraordinary", "Normal", "Special", "Regular"], correct: 0, explanation: "Extraordinary - יוצא דופן", category: "repeat" },
    { id: 542, text: "🔊 חזור אחרי הקריין: Phenomenal", options: ["Phenomenal", "Average", "Good", "Fair"], correct: 0, explanation: "Phenomenal - פנומנלי", category: "repeat" },
    { id: 543, text: "🔊 חזור אחרי הקריין: Tremendous", options: ["Tremendous", "Small", "Big", "Medium"], correct: 0, explanation: "Tremendous - עצום", category: "repeat" },
    { id: 544, text: "🔊 חזור אחרי הקריין: Unbelievable", options: ["Unbelievable", "Believable", "True", "Real"], correct: 0, explanation: "Unbelievable - לא ייאמן", category: "repeat" },
    { id: 545, text: "🔊 חזור אחרי הקריין: Astonishing", options: ["Astonishing", "Normal", "Special", "Regular"], correct: 0, explanation: "Astonishing - מדהים", category: "repeat" },
    { id: 546, text: "🔊 חזור אחרי הקריין: Breathtaking", options: ["Breathtaking", "Normal", "Special", "Regular"], correct: 0, explanation: "Breathtaking - עוצר נשימה", category: "repeat" },
    { id: 547, text: "🔊 חזור אחרי הקריין: Mesmerizing", options: ["Mesmerizing", "Boring", "Fun", "Hard"], correct: 0, explanation: "Mesmerizing - מהפנט", category: "repeat" },
    { id: 548, text: "🔊 חזור אחרי הקריין: Captivating", options: ["Captivating", "Boring", "Fun", "Hard"], correct: 0, explanation: "Captivating - מרתק", category: "repeat" },
    { id: 549, text: "🔊 חזור אחרי הקריין: Enchanting", options: ["Enchanting", "Ugly", "Beautiful", "Small"], correct: 0, explanation: "Enchanting - מקסים", category: "repeat" },
    { id: 550, text: "🔊 חזור אחרי הקריין: Spellbinding", options: ["Spellbinding", "Boring", "Fun", "Hard"], correct: 0, explanation: "Spellbinding - מהפנט", category: "repeat" },
    { id: 551, text: "🔊 חזור אחרי הקריין: Fascinating", options: ["Fascinating", "Boring", "Fun", "Hard"], correct: 0, explanation: "Fascinating - מרתק", category: "repeat" },
    { id: 552, text: "🔊 חזור אחרי הקריין: Intriguing", options: ["Intriguing", "Boring", "Fun", "Hard"], correct: 0, explanation: "Intriguing - מעניין", category: "repeat" },
    { id: 553, text: "🔊 חזור אחרי הקריין: Compelling", options: ["Compelling", "Weak", "Strong", "Medium"], correct: 0, explanation: "Compelling - משכנע", category: "repeat" },
    { id: 554, text: "🔊 חזור אחרי הקריין: Persuasive", options: ["Persuasive", "Weak", "Strong", "Medium"], correct: 0, explanation: "Persuasive - משכנע", category: "repeat" },
    { id: 555, text: "🔊 חזור אחרי הקריין: Convincing", options: ["Convincing", "Weak", "Strong", "Medium"], correct: 0, explanation: "Convincing - משכנע", category: "repeat" },
    { id: 556, text: "🔊 חזור אחרי הקריין: Impressive", options: ["Impressive", "Boring", "Fun", "Hard"], correct: 0, explanation: "Impressive - מרשים", category: "repeat" },
    { id: 557, text: "🔊 חזור אחרי הקריין: Remarkable", options: ["Remarkable", "Normal", "Special", "Regular"], correct: 0, explanation: "Remarkable - ראוי לציון", category: "repeat" },
    { id: 558, text: "🔊 חזור אחרי הקריין: Exceptional", options: ["Exceptional", "Normal", "Special", "Regular"], correct: 0, explanation: "Exceptional - יוצא דופן", category: "repeat" },
    { id: 559, text: "🔊 חזור אחרי הקריין: Outstanding", options: ["Outstanding", "Average", "Good", "Fair"], correct: 0, explanation: "Outstanding - יוצא דופן", category: "repeat" },
    { id: 560, text: "🔊 חזור אחרי הקריין: Extraordinary", options: ["Extraordinary", "Normal", "Special", "Regular"], correct: 0, explanation: "Extraordinary - יוצא דופן", category: "repeat" }
    ],
    '2': [ // רמה 2 - בסיסי - דקדוק מורכב ביותר
    // דקדוק מורכב ביותר
    { id: 601, text: "Choose the correct subjunctive: 'I suggest that he ___ early'", options: ["arrives", "arrive", "arrived", "will arrive"], correct: 1, explanation: "משתמשים ב-subjunctive 'arrive' אחרי 'suggest that'", category: "grammar" },
    { id: 602, text: "Choose the correct subjunctive: 'It's important that she ___ on time'", options: ["is", "be", "was", "will be"], correct: 1, explanation: "משתמשים ב-subjunctive 'be' אחרי 'important that'", category: "grammar" },
    { id: 603, text: "Choose the correct inversion: '___ had I seen such beauty'", options: ["Never", "Always", "Sometimes", "Often"], correct: 0, explanation: "משתמשים ב-'Never' עם היפוך להדגשה", category: "grammar" },
    { id: 604, text: "Choose the correct inversion: '___ did I realize my mistake'", options: ["Only then", "Only now", "Only here", "Only there"], correct: 0, explanation: "משתמשים ב-'Only then' עם היפוך", category: "grammar" },
    { id: 605, text: "Choose the correct cleft sentence: '___ was the weather that ruined our picnic'", options: ["It", "What", "That", "This"], correct: 0, explanation: "משתמשים ב-'It' במשפט cleft להדגשה", category: "grammar" },
    { id: 606, text: "Choose the correct cleft sentence: '___ I need is more time'", options: ["It", "What", "That", "This"], correct: 1, explanation: "משתמשים ב-'What' במשפט cleft להדגשה", category: "grammar" },
    { id: 607, text: "Choose the correct participle clause: '___ by the storm, the tree fell'", options: ["Struck", "Striking", "Strike", "Strikes"], correct: 0, explanation: "משתמשים ב-past participle 'Struck' למשמעות סבילה", category: "grammar" },
    { id: 608, text: "Choose the correct participle clause: '___ the door, she left'", options: ["Locked", "Locking", "Lock", "Locks"], correct: 1, explanation: "משתמשים ב-present participle 'Locking' למשמעות פעילה", category: "grammar" },
    { id: 609, text: "Choose the correct conditional: 'If I ___ you, I would study harder'", options: ["am", "was", "were", "will be"], correct: 2, explanation: "משתמשים ב-'were' במשפט תנאי מהסוג השני לכל הגופים", category: "grammar" },
    { id: 610, text: "Choose the correct conditional: 'If I ___ known, I would have helped'", options: ["know", "knew", "had known", "will know"], correct: 2, explanation: "משתמשים ב-'had known' במשפט תנאי מהסוג השלישי", category: "grammar" },
    
    // הבנת הנקרא מתקדמת ביותר
    { id: 611, text: "What is the author's purpose in: 'The purpose of this study is to examine the effects of sleep deprivation on academic performance'", options: ["To entertain", "To inform", "To persuade", "To instruct"], correct: 1, explanation: "המטרה של הכותב היא ליידע על מחקר", category: "reading" },
    { id: 612, text: "What is the rhetorical device in: 'Ask not what your country can do for you, ask what you can do for your country'", options: ["Metaphor", "Alliteration", "Chiasmus", "Hyperbole"], correct: 2, explanation: "זה chiasmus - מבנה מקביל הפוך", category: "reading" },
    { id: 613, text: "What is the logical fallacy in: 'You can't trust his opinion on education because he never went to college'", options: ["Ad hominem", "Straw man", "False cause", "Hasty generalization"], correct: 0, explanation: "זה ad hominem - תקיפה אישית", category: "reading" },
    { id: 614, text: "What is the author's tone in: 'The government's latest policy is nothing short of disastrous'", options: ["Neutral", "Critical", "Supportive", "Ambivalent"], correct: 1, explanation: "הטון של הכותב הוא ביקורתי", category: "reading" },
    { id: 615, text: "What is the main thesis in: 'While technology has many benefits, its overuse can lead to social isolation and decreased face-to-face communication'", options: ["Technology is always good", "Technology is always bad", "Technology has both benefits and drawbacks", "Technology is neutral"], correct: 2, explanation: "התזה היא שלטכנולוגיה יש גם יתרונות וגם חסרונות", category: "reading" },
    { id: 616, text: "What is the supporting evidence in: 'Studies show that 85% of students who exercise regularly perform better academically'", options: ["Personal opinion", "Statistical data", "Anecdotal evidence", "Expert testimony"], correct: 1, explanation: "העדות היא נתונים סטטיסטיים", category: "reading" },
    { id: 617, text: "What is the counterargument in: 'While some argue that homework is unnecessary, research demonstrates its positive impact on learning'", options: ["Homework is unnecessary", "Research shows positive impact", "Homework is always good", "Research is unreliable"], correct: 0, explanation: "הטענה הנגדית היא שעבודת בית אינה נחוצה", category: "reading" },
    { id: 618, text: "What is the conclusion in: 'Therefore, it is essential that schools implement comprehensive anti-bullying programs'", options: ["Schools should do nothing", "Anti-bullying programs are unnecessary", "Schools should implement anti-bullying programs", "Bullying is not a problem"], correct: 2, explanation: "המסקנה היא שבתי ספר צריכים ליישם תוכניות מקיפות נגד בריונות", category: "reading" },
    { id: 619, text: "What is the author's bias in: 'As a teacher with 20 years of experience, I believe that smaller class sizes are crucial for student success'", options: ["Objective", "Subjective", "Neutral", "Unbiased"], correct: 1, explanation: "הכותב סובייקטיבי בגלל ניסיון אישי", category: "reading" },
    { id: 620, text: "What is the logical structure in: 'First, we will examine the problem. Second, we will analyze the causes. Finally, we will propose solutions'", options: ["Chronological", "Cause and effect", "Problem-solution", "Compare and contrast"], correct: 2, explanation: "זה עוקב אחרי מבנה בעיה-פתרון", category: "reading" },
    
    // אוצר מילים מתקדם ביותר
    { id: 621, text: "What does 'ubiquitous' mean?", options: ["Rare", "Present everywhere", "Expensive", "Difficult"], correct: 1, explanation: "המילה 'ubiquitous' פירושה 'נוכח בכל מקום'", category: "vocabulary" },
    { id: 622, text: "What does 'ephemeral' mean?", options: ["Lasting forever", "Lasting briefly", "Very large", "Very small"], correct: 1, explanation: "המילה 'ephemeral' פירושה 'נמשך זמן קצר'", category: "vocabulary" },
    { id: 623, text: "What does 'pervasive' mean?", options: ["Limited", "Widespread", "Rare", "Expensive"], correct: 1, explanation: "המילה 'pervasive' פירושה 'נפוץ מאוד'", category: "vocabulary" },
    { id: 624, text: "What does 'meticulous' mean?", options: ["Careless", "Very careful", "Fast", "Slow"], correct: 1, explanation: "המילה 'meticulous' פירושה 'מאוד זהיר'", category: "vocabulary" },
    { id: 625, text: "What does 'voracious' mean?", options: ["Small appetite", "Large appetite", "No appetite", "Strange appetite"], correct: 1, explanation: "המילה 'voracious' פירושה 'תיאבון גדול'", category: "vocabulary" },
    { id: 626, text: "What does 'eloquent' mean?", options: ["Poor speaker", "Good speaker", "Quiet", "Loud"], correct: 1, explanation: "המילה 'eloquent' פירושה 'דובר טוב'", category: "vocabulary" },
    { id: 627, text: "What does 'resilient' mean?", options: ["Weak", "Strong and flexible", "Rigid", "Fragile"], correct: 1, explanation: "המילה 'resilient' פירושה 'חזק וגמיש'", category: "vocabulary" },
    { id: 628, text: "What does 'ambiguous' mean?", options: ["Clear", "Unclear", "Simple", "Complex"], correct: 1, explanation: "המילה 'ambiguous' פירושה 'לא ברור'", category: "vocabulary" },
    { id: 629, text: "What does 'cogent' mean?", options: ["Weak argument", "Strong argument", "Long argument", "Short argument"], correct: 1, explanation: "המילה 'cogent' פירושה 'טענה חזקה'", category: "vocabulary" },
    { id: 630, text: "What does 'sagacious' mean?", options: ["Foolish", "Wise", "Young", "Old"], correct: 1, explanation: "המילה 'sagacious' פירושה 'חכם'", category: "vocabulary" },
    
    // משפטים מורכבים ביותר
    { id: 631, text: "Complete: 'Not only did she finish her homework, but she also ___'", options: ["started it", "forgot it", "helped her friend", "threw it away"], correct: 2, explanation: "'Not only...but also' מראה פעולה נוספת", category: "complex" },
    { id: 632, text: "Complete: 'Had I known about the test, I ___ studied'", options: ["will study", "would study", "would have studied", "study"], correct: 2, explanation: "'Had I known' משתמש במשפט תנאי מהסוג השלישי", category: "complex" },
    { id: 633, text: "Complete: 'Were I you, I ___ accept the offer'", options: ["will", "would", "would have", "am"], correct: 1, explanation: "'Were I you' משתמש במשפט תנאי מהסוג השני", category: "complex" },
    { id: 634, text: "Complete: 'So difficult was the exam that ___'", options: ["everyone passed", "everyone failed", "no one tried", "everyone enjoyed it"], correct: 1, explanation: "'So difficult was...' מראה קושי קיצוני", category: "complex" },
    { id: 635, text: "Complete: 'Such was his determination that ___'", options: ["he gave up", "he succeeded", "he failed", "he quit"], correct: 1, explanation: "'Such was...' מראה נחישות קיצונית", category: "complex" },
    { id: 636, text: "Complete: 'No sooner had he arrived than ___'", options: ["he left", "he stayed", "he forgot", "he remembered"], correct: 0, explanation: "'No sooner...than' מראה פעולה מיידית", category: "complex" },
    { id: 637, text: "Complete: 'Hardly had she finished when ___'", options: ["she started", "she stopped", "she continued", "she forgot"], correct: 0, explanation: "'Hardly...when' מראה רצף מיידי", category: "complex" },
    { id: 638, text: "Complete: 'Scarcely had the bell rung when ___'", options: ["students left", "students arrived", "students slept", "students studied"], correct: 0, explanation: "'Scarcely...when' מראה פעולה מיידית", category: "complex" },
    { id: 639, text: "Complete: 'Barely had he spoken when ___'", options: ["everyone listened", "everyone interrupted", "everyone left", "everyone agreed"], correct: 1, explanation: "'Barely...when' מראה הפרעה מיידית", category: "complex" },
    { id: 640, text: "Complete: 'Rarely do we see such talent, but when we do, ___'", options: ["we ignore it", "we appreciate it", "we criticize it", "we forget it"], correct: 1, explanation: "'Rarely do we...but when we do' מראה הערכה", category: "complex" },
    
    // שאלות חזרה - הקריין אומר והתלמיד חוזר (כיתה ז')
    { id: 641, text: "🔊 חזור אחרי הקריין: Extraordinary", options: ["Extraordinary", "Normal", "Special", "Regular"], correct: 0, explanation: "Extraordinary - יוצא דופן", category: "repeat" },
    { id: 642, text: "🔊 חזור אחרי הקריין: Phenomenal", options: ["Phenomenal", "Average", "Good", "Fair"], correct: 0, explanation: "Phenomenal - פנומנלי", category: "repeat" },
    { id: 643, text: "🔊 חזור אחרי הקריין: Tremendous", options: ["Tremendous", "Small", "Big", "Medium"], correct: 0, explanation: "Tremendous - עצום", category: "repeat" },
    { id: 644, text: "🔊 חזור אחרי הקריין: Unbelievable", options: ["Unbelievable", "Believable", "True", "Real"], correct: 0, explanation: "Unbelievable - לא ייאמן", category: "repeat" },
    { id: 645, text: "🔊 חזור אחרי הקריין: Astonishing", options: ["Astonishing", "Normal", "Special", "Regular"], correct: 0, explanation: "Astonishing - מדהים", category: "repeat" },
    { id: 646, text: "🔊 חזור אחרי הקריין: Breathtaking", options: ["Breathtaking", "Normal", "Special", "Regular"], correct: 0, explanation: "Breathtaking - עוצר נשימה", category: "repeat" },
    { id: 647, text: "🔊 חזור אחרי הקריין: Mesmerizing", options: ["Mesmerizing", "Boring", "Fun", "Hard"], correct: 0, explanation: "Mesmerizing - מהפנט", category: "repeat" },
    { id: 648, text: "🔊 חזור אחרי הקריין: Captivating", options: ["Captivating", "Boring", "Fun", "Hard"], correct: 0, explanation: "Captivating - מרתק", category: "repeat" },
    { id: 649, text: "🔊 חזור אחרי הקריין: Enchanting", options: ["Enchanting", "Ugly", "Beautiful", "Small"], correct: 0, explanation: "Enchanting - מקסים", category: "repeat" },
    { id: 650, text: "🔊 חזור אחרי הקריין: Spellbinding", options: ["Spellbinding", "Boring", "Fun", "Hard"], correct: 0, explanation: "Spellbinding - מהפנט", category: "repeat" },
    { id: 651, text: "🔊 חזור אחרי הקריין: Fascinating", options: ["Fascinating", "Boring", "Fun", "Hard"], correct: 0, explanation: "Fascinating - מרתק", category: "repeat" },
    { id: 652, text: "🔊 חזור אחרי הקריין: Intriguing", options: ["Intriguing", "Boring", "Fun", "Hard"], correct: 0, explanation: "Intriguing - מעניין", category: "repeat" },
    { id: 653, text: "🔊 חזור אחרי הקריין: Compelling", options: ["Compelling", "Weak", "Strong", "Medium"], correct: 0, explanation: "Compelling - משכנע", category: "repeat" },
    { id: 654, text: "🔊 חזור אחרי הקריין: Persuasive", options: ["Persuasive", "Weak", "Strong", "Medium"], correct: 0, explanation: "Persuasive - משכנע", category: "repeat" },
    { id: 655, text: "🔊 חזור אחרי הקריין: Convincing", options: ["Convincing", "Weak", "Strong", "Medium"], correct: 0, explanation: "Convincing - משכנע", category: "repeat" },
    { id: 656, text: "🔊 חזור אחרי הקריין: Impressive", options: ["Impressive", "Boring", "Fun", "Hard"], correct: 0, explanation: "Impressive - מרשים", category: "repeat" },
    { id: 657, text: "🔊 חזור אחרי הקריין: Remarkable", options: ["Remarkable", "Normal", "Special", "Regular"], correct: 0, explanation: "Remarkable - ראוי לציון", category: "repeat" },
    { id: 658, text: "🔊 חזור אחרי הקריין: Exceptional", options: ["Exceptional", "Normal", "Special", "Regular"], correct: 0, explanation: "Exceptional - יוצא דופן", category: "repeat" },
    { id: 659, text: "🔊 חזור אחרי הקריין: Outstanding", options: ["Outstanding", "Average", "Good", "Fair"], correct: 0, explanation: "Outstanding - יוצא דופן", category: "repeat" },
    { id: 660, text: "🔊 חזור אחרי הקריין: Extraordinary", options: ["Extraordinary", "Normal", "Special", "Regular"], correct: 0, explanation: "Extraordinary - יוצא דופן", category: "repeat" }
    ],
    '3': [ // רמה 3 - בינוני - דקדוק מורכב ביותר
    // דקדוק מורכב ביותר
    { id: 701, text: "Choose the correct subjunctive: 'I insist that he ___ present'", options: ["is", "be", "was", "will be"], correct: 1, explanation: "משתמשים ב-subjunctive 'be' אחרי 'insist that'", category: "grammar" },
    { id: 702, text: "Choose the correct subjunctive: 'It's crucial that she ___ informed'", options: ["is", "be", "was", "will be"], correct: 1, explanation: "משתמשים ב-subjunctive 'be' אחרי 'crucial that'", category: "grammar" },
    { id: 703, text: "Choose the correct inversion: '___ had I finished when the bell rang'", options: ["Hardly", "Barely", "Scarcely", "All of the above"], correct: 3, explanation: "כל שלוש המילים יכולות לשמש עם היפוך", category: "grammar" },
    { id: 704, text: "Choose the correct inversion: '___ did she realize the truth'", options: ["Only then", "Only when", "Only after", "All of the above"], correct: 3, explanation: "כל שלוש הביטויים יכולים לשמש עם היפוך", category: "grammar" },
    { id: 705, text: "Choose the correct cleft sentence: '___ was John who called'", options: ["It", "What", "That", "This"], correct: 0, explanation: "משתמשים ב-'It' במשפט cleft להדגשה", category: "grammar" },
    { id: 706, text: "Choose the correct cleft sentence: '___ I want is peace'", options: ["It", "What", "That", "This"], correct: 1, explanation: "משתמשים ב-'What' במשפט cleft להדגשה", category: "grammar" },
    { id: 707, text: "Choose the correct participle clause: '___ by the wind, the flag waved'", options: ["Struck", "Striking", "Strike", "Strikes"], correct: 0, explanation: "משתמשים ב-past participle 'Struck' למשמעות סבילה", category: "grammar" },
    { id: 708, text: "Choose the correct participle clause: '___ the window, he saw the accident'", options: ["Opened", "Opening", "Open", "Opens"], correct: 1, explanation: "משתמשים ב-present participle 'Opening' למשמעות פעילה", category: "grammar" },
    { id: 709, text: "Choose the correct conditional: 'If I ___ you, I would accept'", options: ["am", "was", "were", "will be"], correct: 2, explanation: "משתמשים ב-'were' במשפט תנאי מהסוג השני לכל הגופים", category: "grammar" },
    { id: 710, text: "Choose the correct conditional: 'If I ___ known, I would have come'", options: ["know", "knew", "had known", "will know"], correct: 2, explanation: "משתמשים ב-'had known' במשפט תנאי מהסוג השלישי", category: "grammar" },
    
    // הבנת הנקרא מתקדמת ביותר
    { id: 711, text: "What is the author's purpose in: 'This research aims to investigate the correlation between social media usage and academic performance among teenagers'", options: ["To entertain", "To inform", "To persuade", "To instruct"], correct: 1, explanation: "המטרה של הכותב היא ליידע על מחקר", category: "reading" },
    { id: 712, text: "What is the rhetorical device in: 'She sells seashells by the seashore'", options: ["Metaphor", "Alliteration", "Chiasmus", "Hyperbole"], correct: 1, explanation: "זה alliteration - חזרה על צליל 's'", category: "reading" },
    { id: 713, text: "What is the logical fallacy in: 'Either you support our policy or you're against progress'", options: ["False dilemma", "Straw man", "False cause", "Hasty generalization"], correct: 0, explanation: "זה false dilemma - רק שתי אפשרויות מוצגות", category: "reading" },
    { id: 714, text: "What is the author's tone in: 'The government's response to this crisis has been nothing short of exemplary'", options: ["Neutral", "Critical", "Supportive", "Ambivalent"], correct: 2, explanation: "הטון של הכותב הוא תומך", category: "reading" },
    { id: 715, text: "What is the main thesis in: 'Although renewable energy sources offer environmental benefits, their implementation requires significant infrastructure investment and technological advancement'", options: ["Renewable energy is always good", "Renewable energy is always bad", "Renewable energy has benefits but challenges", "Renewable energy is neutral"], correct: 2, explanation: "התזה היא שלאנרגיה מתחדשת יש יתרונות אבל גם אתגרים", category: "reading" },
    { id: 716, text: "What is the supporting evidence in: 'According to the World Health Organization, 85% of the world's population lacks access to adequate healthcare'", options: ["Personal opinion", "Statistical data", "Anecdotal evidence", "Expert testimony"], correct: 1, explanation: "העדות היא נתונים סטטיסטיים מ-WHO", category: "reading" },
    { id: 717, text: "What is the counterargument in: 'While critics argue that technology isolates people, studies show that it actually enhances communication and connectivity'", options: ["Technology isolates people", "Technology enhances communication", "Technology is always good", "Technology is always bad"], correct: 0, explanation: "הטענה הנגדית היא שטכנולוגיה מבודדת אנשים", category: "reading" },
    { id: 718, text: "What is the conclusion in: 'Therefore, it is imperative that educational institutions adapt their curricula to meet the demands of the digital age'", options: ["Schools should do nothing", "Schools should resist change", "Schools should adapt to digital age", "Technology is unimportant"], correct: 2, explanation: "המסקנה היא שמוסדות חינוך צריכים להתאים את תכניות הלימודים לדרישות העידן הדיגיטלי", category: "reading" },
    { id: 719, text: "What is the author's bias in: 'As a parent of three children, I strongly believe that homework is essential for academic success'", options: ["Objective", "Subjective", "Neutral", "Unbiased"], correct: 1, explanation: "הכותב סובייקטיבי בגלל ניסיון אישי", category: "reading" },
    { id: 720, text: "What is the logical structure in: 'The problem began when... This led to... Consequently... As a result...'", options: ["Chronological", "Cause and effect", "Problem-solution", "Compare and contrast"], correct: 1, explanation: "זה עוקב אחרי מבנה סיבה ותוצאה", category: "reading" },
    
    // אוצר מילים מתקדם ביותר
    { id: 721, text: "What does 'ubiquitous' mean?", options: ["Rare", "Present everywhere", "Expensive", "Difficult"], correct: 1, explanation: "המילה 'ubiquitous' פירושה 'נוכח בכל מקום'", category: "vocabulary" },
    { id: 722, text: "What does 'ephemeral' mean?", options: ["Lasting forever", "Lasting briefly", "Very large", "Very small"], correct: 1, explanation: "המילה 'ephemeral' פירושה 'נמשך זמן קצר'", category: "vocabulary" },
    { id: 723, text: "What does 'pervasive' mean?", options: ["Limited", "Widespread", "Rare", "Expensive"], correct: 1, explanation: "המילה 'pervasive' פירושה 'נפוץ מאוד'", category: "vocabulary" },
    { id: 724, text: "What does 'meticulous' mean?", options: ["Careless", "Very careful", "Fast", "Slow"], correct: 1, explanation: "המילה 'meticulous' פירושה 'מאוד זהיר'", category: "vocabulary" },
    { id: 725, text: "What does 'voracious' mean?", options: ["Small appetite", "Large appetite", "No appetite", "Strange appetite"], correct: 1, explanation: "המילה 'voracious' פירושה 'תיאבון גדול'", category: "vocabulary" },
    { id: 726, text: "What does 'eloquent' mean?", options: ["Poor speaker", "Good speaker", "Quiet", "Loud"], correct: 1, explanation: "המילה 'eloquent' פירושה 'דובר טוב'", category: "vocabulary" },
    { id: 727, text: "What does 'resilient' mean?", options: ["Weak", "Strong and flexible", "Rigid", "Fragile"], correct: 1, explanation: "המילה 'resilient' פירושה 'חזק וגמיש'", category: "vocabulary" },
    { id: 728, text: "What does 'ambiguous' mean?", options: ["Clear", "Unclear", "Simple", "Complex"], correct: 1, explanation: "המילה 'ambiguous' פירושה 'לא ברור'", category: "vocabulary" },
    { id: 729, text: "What does 'cogent' mean?", options: ["Weak argument", "Strong argument", "Long argument", "Short argument"], correct: 1, explanation: "המילה 'cogent' פירושה 'טענה חזקה'", category: "vocabulary" },
    { id: 730, text: "What does 'sagacious' mean?", options: ["Foolish", "Wise", "Young", "Old"], correct: 1, explanation: "המילה 'sagacious' פירושה 'חכם'", category: "vocabulary" },
    
    // משפטים מורכבים ביותר
    { id: 731, text: "Complete: 'Not only did she finish her homework, but she also ___'", options: ["started it", "forgot it", "helped her friend", "threw it away"], correct: 2, explanation: "'Not only...but also' מראה פעולה נוספת", category: "complex" },
    { id: 732, text: "Complete: 'Had I known about the test, I ___ studied'", options: ["will study", "would study", "would have studied", "study"], correct: 2, explanation: "'Had I known' משתמש במשפט תנאי מהסוג השלישי", category: "complex" },
    { id: 733, text: "Complete: 'Were I you, I ___ accept the offer'", options: ["will", "would", "would have", "am"], correct: 1, explanation: "'Were I you' משתמש במשפט תנאי מהסוג השני", category: "complex" },
    { id: 734, text: "Complete: 'So difficult was the exam that ___'", options: ["everyone passed", "everyone failed", "no one tried", "everyone enjoyed it"], correct: 1, explanation: "'So difficult was...' מראה קושי קיצוני", category: "complex" },
    { id: 735, text: "Complete: 'Such was his determination that ___'", options: ["he gave up", "he succeeded", "he failed", "he quit"], correct: 1, explanation: "'Such was...' מראה נחישות קיצונית", category: "complex" },
    { id: 736, text: "Complete: 'No sooner had he arrived than ___'", options: ["he left", "he stayed", "he forgot", "he remembered"], correct: 0, explanation: "'No sooner...than' מראה פעולה מיידית", category: "complex" },
    { id: 737, text: "Complete: 'Hardly had she finished when ___'", options: ["she started", "she stopped", "she continued", "she forgot"], correct: 0, explanation: "'Hardly...when' מראה רצף מיידי", category: "complex" },
    { id: 738, text: "Complete: 'Scarcely had the bell rung when ___'", options: ["students left", "students arrived", "students slept", "students studied"], correct: 0, explanation: "'Scarcely...when' מראה פעולה מיידית", category: "complex" },
    { id: 739, text: "Complete: 'Barely had he spoken when ___'", options: ["everyone listened", "everyone interrupted", "everyone left", "everyone agreed"], correct: 1, explanation: "'Barely...when' מראה הפרעה מיידית", category: "complex" },
    { id: 740, text: "Complete: 'Rarely do we see such talent, but when we do, ___'", options: ["we ignore it", "we appreciate it", "we criticize it", "we forget it"], correct: 1, explanation: "'Rarely do we...but when we do' מראה הערכה", category: "complex" },
    
    // שאלות חזרה - הקריין אומר והתלמיד חוזר (כיתה ח')
    { id: 741, text: "🔊 חזור אחרי הקריין: Extraordinary", options: ["Extraordinary", "Normal", "Special", "Regular"], correct: 0, explanation: "Extraordinary - יוצא דופן", category: "repeat" },
    { id: 742, text: "🔊 חזור אחרי הקריין: Phenomenal", options: ["Phenomenal", "Average", "Good", "Fair"], correct: 0, explanation: "Phenomenal - פנומנלי", category: "repeat" },
    { id: 743, text: "🔊 חזור אחרי הקריין: Tremendous", options: ["Tremendous", "Small", "Big", "Medium"], correct: 0, explanation: "Tremendous - עצום", category: "repeat" },
    { id: 744, text: "🔊 חזור אחרי הקריין: Unbelievable", options: ["Unbelievable", "Believable", "True", "Real"], correct: 0, explanation: "Unbelievable - לא ייאמן", category: "repeat" },
    { id: 745, text: "🔊 חזור אחרי הקריין: Astonishing", options: ["Astonishing", "Normal", "Special", "Regular"], correct: 0, explanation: "Astonishing - מדהים", category: "repeat" },
    { id: 746, text: "🔊 חזור אחרי הקריין: Breathtaking", options: ["Breathtaking", "Normal", "Special", "Regular"], correct: 0, explanation: "Breathtaking - עוצר נשימה", category: "repeat" },
    { id: 747, text: "🔊 חזור אחרי הקריין: Mesmerizing", options: ["Mesmerizing", "Boring", "Fun", "Hard"], correct: 0, explanation: "Mesmerizing - מהפנט", category: "repeat" },
    { id: 748, text: "🔊 חזור אחרי הקריין: Captivating", options: ["Captivating", "Boring", "Fun", "Hard"], correct: 0, explanation: "Captivating - מרתק", category: "repeat" },
    { id: 749, text: "🔊 חזור אחרי הקריין: Enchanting", options: ["Enchanting", "Ugly", "Beautiful", "Small"], correct: 0, explanation: "Enchanting - מקסים", category: "repeat" },
    { id: 750, text: "🔊 חזור אחרי הקריין: Spellbinding", options: ["Spellbinding", "Boring", "Fun", "Hard"], correct: 0, explanation: "Spellbinding - מהפנט", category: "repeat" },
    { id: 751, text: "🔊 חזור אחרי הקריין: Fascinating", options: ["Fascinating", "Boring", "Fun", "Hard"], correct: 0, explanation: "Fascinating - מרתק", category: "repeat" },
    { id: 752, text: "🔊 חזור אחרי הקריין: Intriguing", options: ["Intriguing", "Boring", "Fun", "Hard"], correct: 0, explanation: "Intriguing - מעניין", category: "repeat" },
    { id: 753, text: "🔊 חזור אחרי הקריין: Compelling", options: ["Compelling", "Weak", "Strong", "Medium"], correct: 0, explanation: "Compelling - משכנע", category: "repeat" },
    { id: 754, text: "🔊 חזור אחרי הקריין: Persuasive", options: ["Persuasive", "Weak", "Strong", "Medium"], correct: 0, explanation: "Persuasive - משכנע", category: "repeat" },
    { id: 755, text: "🔊 חזור אחרי הקריין: Convincing", options: ["Convincing", "Weak", "Strong", "Medium"], correct: 0, explanation: "Convincing - משכנע", category: "repeat" },
    { id: 756, text: "🔊 חזור אחרי הקריין: Impressive", options: ["Impressive", "Boring", "Fun", "Hard"], correct: 0, explanation: "Impressive - מרשים", category: "repeat" },
    { id: 757, text: "🔊 חזור אחרי הקריין: Remarkable", options: ["Remarkable", "Normal", "Special", "Regular"], correct: 0, explanation: "Remarkable - ראוי לציון", category: "repeat" },
    { id: 758, text: "🔊 חזור אחרי הקריין: Exceptional", options: ["Exceptional", "Normal", "Special", "Regular"], correct: 0, explanation: "Exceptional - יוצא דופן", category: "repeat" },
    { id: 759, text: "🔊 חזור אחרי הקריין: Outstanding", options: ["Outstanding", "Average", "Good", "Fair"], correct: 0, explanation: "Outstanding - יוצא דופן", category: "repeat" },
    { id: 760, text: "🔊 חזור אחרי הקריין: Extraordinary", options: ["Extraordinary", "Normal", "Special", "Regular"], correct: 0, explanation: "Extraordinary - יוצא דופן", category: "repeat" }
    ],
    '4': [ // רמה 4 - מתקדם - דקדוק מתקדם מאוד
    // דקדוק מתקדם מאוד
    { id: 801, text: "Choose the correct mixed conditional: 'If I ___ studied harder, I would be smarter now'", options: ["study", "studied", "had studied", "will study"], correct: 2, explanation: "משפט תנאי מעורב: עבר (had studied) + הווה (would be) - 'אילו למדתי קשה יותר בעבר, הייתי חכם יותר עכשיו'", category: "grammar" },
    { id: 802, text: "Choose the correct mixed conditional: 'If she ___ here, she would have helped'", options: ["is", "was", "were", "had been"], correct: 3, explanation: "משפט תנאי מעורב: עבר (had been) + עבר מושלם (would have helped) - 'אילו היא הייתה כאן, היא הייתה עוזרת'", category: "grammar" },
    { id: 803, text: "Choose the correct passive infinitive: 'The book needs ___'", options: ["to read", "to be read", "reading", "read"], correct: 1, explanation: "משתמשים ב-passive infinitive 'to be read' אחרי 'needs' - 'הספר צריך להיקרא'", category: "grammar" },
    { id: 804, text: "Choose the correct passive gerund: 'I hate ___ interrupted'", options: ["being", "be", "to be", "been"], correct: 0, explanation: "משתמשים ב-passive gerund 'being interrupted' אחרי 'hate' - 'אני שונא להיקטע'", category: "grammar" },
    { id: 805, text: "Choose the correct perfect infinitive: 'She seems ___ already left'", options: ["to leave", "to have left", "leaving", "left"], correct: 1, explanation: "משתמשים ב-perfect infinitive 'to have left' אחרי 'seems' - 'נראה שהיא כבר עזבה'", category: "grammar" },
    { id: 806, text: "Choose the correct perfect gerund: 'I regret ___ told him'", options: ["telling", "to tell", "having told", "tell"], correct: 2, explanation: "משתמשים ב-perfect gerund 'having told' אחרי 'regret' - 'אני מתחרט על כך שסיפרתי לו'", category: "grammar" },
    { id: 807, text: "Choose the correct reduced relative clause: 'The man ___ here is my friend'", options: ["who standing", "standing", "who stands", "stands"], correct: 1, explanation: "משתמשים ב-reduced relative clause 'standing' במקום 'who is standing' - 'האיש שעומד כאן הוא חבר שלי'", category: "grammar" },
    { id: 808, text: "Choose the correct reduced relative clause: 'The book ___ yesterday is interesting'", options: ["which written", "written", "which was written", "writes"], correct: 1, explanation: "משתמשים ב-reduced relative clause 'written' במקום 'which was written' - 'הספר שנכתב אתמול מעניין'", category: "grammar" },
    { id: 809, text: "Choose the correct emphatic structure: '___ was it that you saw?'", options: ["What", "Who", "Where", "When"], correct: 0, explanation: "משתמשים ב-'What' במבנה הדגשה - 'מה זה שראית?'", category: "grammar" },
    { id: 810, text: "Choose the correct emphatic structure: '___ was yesterday that it happened'", options: ["It", "What", "That", "This"], correct: 0, explanation: "משתמשים ב-'It' במבנה הדגשה - 'זה היה אתמול שזה קרה'", category: "grammar" },
    
    // הבנת הנקרא מתקדמת מאוד
    { id: 811, text: "What is the author's purpose in: 'The purpose of this study is to examine the effects of sleep deprivation on academic performance'", options: ["To entertain", "To inform", "To persuade", "To instruct"], correct: 1, explanation: "המטרה של הכותב היא ליידע על מחקר", category: "reading" },
    { id: 812, text: "What is the rhetorical device in: 'Ask not what your country can do for you, ask what you can do for your country'", options: ["Metaphor", "Alliteration", "Chiasmus", "Hyperbole"], correct: 2, explanation: "זה chiasmus - מבנה מקביל הפוך", category: "reading" },
    { id: 813, text: "What is the logical fallacy in: 'You can't trust his opinion on education because he never went to college'", options: ["Ad hominem", "Straw man", "False cause", "Hasty generalization"], correct: 0, explanation: "זה ad hominem - תקיפה אישית", category: "reading" },
    { id: 814, text: "What is the author's tone in: 'The government's latest policy is nothing short of disastrous'", options: ["Neutral", "Critical", "Supportive", "Ambivalent"], correct: 1, explanation: "הטון של הכותב הוא ביקורתי", category: "reading" },
    { id: 815, text: "What is the main thesis in: 'While technology has many benefits, its overuse can lead to social isolation and decreased face-to-face communication'", options: ["Technology is always good", "Technology is always bad", "Technology has both benefits and drawbacks", "Technology is neutral"], correct: 2, explanation: "התזה היא שלטכנולוגיה יש גם יתרונות וגם חסרונות", category: "reading" },
    { id: 816, text: "What is the supporting evidence in: 'Studies show that 85% of students who exercise regularly perform better academically'", options: ["Personal opinion", "Statistical data", "Anecdotal evidence", "Expert testimony"], correct: 1, explanation: "העדות היא נתונים סטטיסטיים", category: "reading" },
    { id: 817, text: "What is the counterargument in: 'While some argue that homework is unnecessary, research demonstrates its positive impact on learning'", options: ["Homework is unnecessary", "Research shows positive impact", "Homework is always good", "Research is unreliable"], correct: 0, explanation: "הטענה הנגדית היא שעבודת בית אינה נחוצה", category: "reading" },
    { id: 818, text: "What is the conclusion in: 'Therefore, it is essential that schools implement comprehensive anti-bullying programs'", options: ["Schools should do nothing", "Anti-bullying programs are unnecessary", "Schools should implement anti-bullying programs", "Bullying is not a problem"], correct: 2, explanation: "המסקנה היא שבתי ספר צריכים ליישם תוכניות מקיפות נגד בריונות", category: "reading" },
    { id: 819, text: "What is the author's bias in: 'As a teacher with 20 years of experience, I believe that smaller class sizes are crucial for student success'", options: ["Objective", "Subjective", "Neutral", "Unbiased"], correct: 1, explanation: "הכותב סובייקטיבי בגלל ניסיון אישי", category: "reading" },
    { id: 820, text: "What is the logical structure in: 'First, we will examine the problem. Second, we will analyze the causes. Finally, we will propose solutions'", options: ["Chronological", "Cause and effect", "Problem-solution", "Compare and contrast"], correct: 2, explanation: "זה עוקב אחרי מבנה בעיה-פתרון", category: "reading" },
    
    // אוצר מילים מתקדם מאוד
    { id: 821, text: "What does 'ubiquitous' mean?", options: ["Rare", "Present everywhere", "Expensive", "Difficult"], correct: 1, explanation: "המילה 'ubiquitous' פירושה 'נוכח בכל מקום'", category: "vocabulary" },
    { id: 822, text: "What does 'ephemeral' mean?", options: ["Lasting forever", "Lasting briefly", "Very large", "Very small"], correct: 1, explanation: "המילה 'ephemeral' פירושה 'נמשך זמן קצר'", category: "vocabulary" },
    { id: 823, text: "What does 'pervasive' mean?", options: ["Limited", "Widespread", "Rare", "Expensive"], correct: 1, explanation: "המילה 'pervasive' פירושה 'נפוץ מאוד'", category: "vocabulary" },
    { id: 824, text: "What does 'meticulous' mean?", options: ["Careless", "Very careful", "Fast", "Slow"], correct: 1, explanation: "המילה 'meticulous' פירושה 'מאוד זהיר'", category: "vocabulary" },
    { id: 825, text: "What does 'voracious' mean?", options: ["Small appetite", "Large appetite", "No appetite", "Strange appetite"], correct: 1, explanation: "המילה 'voracious' פירושה 'תיאבון גדול'", category: "vocabulary" },
    { id: 826, text: "What does 'eloquent' mean?", options: ["Poor speaker", "Good speaker", "Quiet", "Loud"], correct: 1, explanation: "המילה 'eloquent' פירושה 'דובר טוב'", category: "vocabulary" },
    { id: 827, text: "What does 'resilient' mean?", options: ["Weak", "Strong and flexible", "Rigid", "Fragile"], correct: 1, explanation: "המילה 'resilient' פירושה 'חזק וגמיש'", category: "vocabulary" },
    { id: 828, text: "What does 'ambiguous' mean?", options: ["Clear", "Unclear", "Simple", "Complex"], correct: 1, explanation: "המילה 'ambiguous' פירושה 'לא ברור'", category: "vocabulary" },
    { id: 829, text: "What does 'cogent' mean?", options: ["Weak argument", "Strong argument", "Long argument", "Short argument"], correct: 1, explanation: "המילה 'cogent' פירושה 'טענה חזקה'", category: "vocabulary" },
    { id: 830, text: "What does 'sagacious' mean?", options: ["Foolish", "Wise", "Young", "Old"], correct: 1, explanation: "המילה 'sagacious' פירושה 'חכם'", category: "vocabulary" },
    
    // משפטים מורכבים מאוד
    { id: 831, text: "Complete: 'Not only did she finish her homework, but she also ___'", options: ["started it", "forgot it", "helped her friend", "threw it away"], correct: 2, explanation: "'Not only...but also' מראה פעולה נוספת", category: "complex" },
    { id: 832, text: "Complete: 'Had I known about the test, I ___ studied'", options: ["will study", "would study", "would have studied", "study"], correct: 2, explanation: "'Had I known' משתמש במשפט תנאי מהסוג השלישי", category: "complex" },
    { id: 833, text: "Complete: 'Were I you, I ___ accept the offer'", options: ["will", "would", "would have", "am"], correct: 1, explanation: "'Were I you' משתמש במשפט תנאי מהסוג השני", category: "complex" },
    { id: 834, text: "Complete: 'So difficult was the exam that ___'", options: ["everyone passed", "everyone failed", "no one tried", "everyone enjoyed it"], correct: 1, explanation: "'So difficult was...' מראה קושי קיצוני", category: "complex" },
    { id: 835, text: "Complete: 'Such was his determination that ___'", options: ["he gave up", "he succeeded", "he failed", "he quit"], correct: 1, explanation: "'Such was...' מראה נחישות קיצונית", category: "complex" },
    { id: 836, text: "Complete: 'No sooner had he arrived than ___'", options: ["he left", "he stayed", "he forgot", "he remembered"], correct: 0, explanation: "'No sooner...than' מראה פעולה מיידית", category: "complex" },
    { id: 837, text: "Complete: 'Hardly had she finished when ___'", options: ["she started", "she stopped", "she continued", "she forgot"], correct: 0, explanation: "'Hardly...when' מראה רצף מיידי", category: "complex" },
    { id: 838, text: "Complete: 'Scarcely had the bell rung when ___'", options: ["students left", "students arrived", "students slept", "students studied"], correct: 0, explanation: "'Scarcely...when' מראה פעולה מיידית", category: "complex" },
    { id: 839, text: "Complete: 'Barely had he spoken when ___'", options: ["everyone listened", "everyone interrupted", "everyone left", "everyone agreed"], correct: 1, explanation: "'Barely...when' מראה הפרעה מיידית", category: "complex" },
    { id: 840, text: "Complete: 'Rarely do we see such talent, but when we do, ___'", options: ["we ignore it", "we appreciate it", "we criticize it", "we forget it"], correct: 1, explanation: "'Rarely do we...but when we do' מראה הערכה", category: "complex" },
    
    // שאלות חזרה - מילים מתקדמות מאוד
    { id: 841, text: "🔊 חזור אחרי הקריין: Subjunctive", options: ["Subjunctive", "Indicative", "Imperative", "Conditional"], correct: 0, explanation: "Subjunctive - ציווי עקיף", category: "repeat" },
    { id: 842, text: "🔊 חזור אחרי הקריין: Inversion", options: ["Inversion", "Normal order", "Question", "Statement"], correct: 0, explanation: "Inversion - היפוך", category: "repeat" },
    { id: 843, text: "🔊 חזור אחרי הקריין: Cleft sentence", options: ["Cleft sentence", "Simple sentence", "Complex sentence", "Compound sentence"], correct: 0, explanation: "Cleft sentence - משפט הדגשה", category: "repeat" },
    { id: 844, text: "🔊 חזור אחרי הקריין: Participle clause", options: ["Participle clause", "Relative clause", "Adverbial clause", "Noun clause"], correct: 0, explanation: "Participle clause - פסוקית פועל", category: "repeat" },
    { id: 845, text: "🔊 חזור אחרי הקריין: Mixed conditional", options: ["Mixed conditional", "First conditional", "Second conditional", "Third conditional"], correct: 0, explanation: "Mixed conditional - משפט תנאי מעורב", category: "repeat" },
    { id: 846, text: "🔊 חזור אחרי הקריין: Passive infinitive", options: ["Passive infinitive", "Active infinitive", "Gerund", "Participle"], correct: 0, explanation: "Passive infinitive - מקור סביל", category: "repeat" },
    { id: 847, text: "🔊 חזור אחרי הקריין: Passive gerund", options: ["Passive gerund", "Active gerund", "Infinitive", "Participle"], correct: 0, explanation: "Passive gerund - שם פועל סביל", category: "repeat" },
    { id: 848, text: "🔊 חזור אחרי הקריין: Perfect infinitive", options: ["Perfect infinitive", "Simple infinitive", "Gerund", "Participle"], correct: 0, explanation: "Perfect infinitive - מקור מושלם", category: "repeat" },
    { id: 849, text: "🔊 חזור אחרי הקריין: Perfect gerund", options: ["Perfect gerund", "Simple gerund", "Infinitive", "Participle"], correct: 0, explanation: "Perfect gerund - שם פועל מושלם", category: "repeat" },
    { id: 850, text: "🔊 חזור אחרי הקריין: Reduced relative clause", options: ["Reduced relative clause", "Full relative clause", "Adverbial clause", "Noun clause"], correct: 0, explanation: "Reduced relative clause - פסוקית יחס מקוצרת", category: "repeat" },
    { id: 851, text: "🔊 חזור אחרי הקריין: Emphatic structure", options: ["Emphatic structure", "Normal structure", "Question", "Statement"], correct: 0, explanation: "Emphatic structure - מבנה הדגשה", category: "repeat" },
    { id: 852, text: "🔊 חזור אחרי הקריין: Ubiquitous", options: ["Ubiquitous", "Rare", "Common", "Unusual"], correct: 0, explanation: "Ubiquitous - נוכח בכל מקום", category: "repeat" },
    { id: 853, text: "🔊 חזור אחרי הקריין: Ephemeral", options: ["Ephemeral", "Lasting", "Permanent", "Eternal"], correct: 0, explanation: "Ephemeral - נמשך זמן קצר", category: "repeat" },
    { id: 854, text: "🔊 חזור אחרי הקריין: Pervasive", options: ["Pervasive", "Limited", "Rare", "Uncommon"], correct: 0, explanation: "Pervasive - נפוץ מאוד", category: "repeat" },
    { id: 855, text: "🔊 חזור אחרי הקריין: Meticulous", options: ["Meticulous", "Careless", "Sloppy", "Messy"], correct: 0, explanation: "Meticulous - מאוד זהיר", category: "repeat" },
    { id: 856, text: "🔊 חזור אחרי הקריין: Voracious", options: ["Voracious", "Small", "Tiny", "Minimal"], correct: 0, explanation: "Voracious - תיאבון גדול", category: "repeat" },
    { id: 857, text: "🔊 חזור אחרי הקריין: Eloquent", options: ["Eloquent", "Poor", "Bad", "Weak"], correct: 0, explanation: "Eloquent - דובר טוב", category: "repeat" },
    { id: 858, text: "🔊 חזור אחרי הקריין: Resilient", options: ["Resilient", "Weak", "Fragile", "Brittle"], correct: 0, explanation: "Resilient - חזק וגמיש", category: "repeat" },
    { id: 859, text: "🔊 חזור אחרי הקריין: Ambiguous", options: ["Ambiguous", "Clear", "Obvious", "Evident"], correct: 0, explanation: "Ambiguous - לא ברור", category: "repeat" },
    { id: 860, text: "🔊 חזור אחרי הקריין: Cogent", options: ["Cogent", "Weak", "Poor", "Bad"], correct: 0, explanation: "Cogent - טענה חזקה", category: "repeat" }
    ],
    '5': [ // רמה 5 - מומחה - דקדוק מתקדם מומחה
    // דקדוק מומחה
    { id: 901, text: "Choose the correct advanced subjunctive: 'I demand that he ___ immediately'", options: ["leaves", "leave", "left", "will leave"], correct: 1, explanation: "משתמשים ב-subjunctive 'leave' אחרי 'demand that' - 'אני דורש שהוא יעזוב מיד'", category: "grammar" },
    { id: 902, text: "Choose the correct advanced subjunctive: 'It's essential that they ___ informed'", options: ["are", "be", "were", "will be"], correct: 1, explanation: "משתמשים ב-subjunctive 'be' אחרי 'essential that' - 'חיוני שהם יהיו מעודכנים'", category: "grammar" },
    { id: 903, text: "Choose the correct advanced inversion: '___ had I entered when the phone rang'", options: ["No sooner", "Hardly", "Scarcely", "All of the above"], correct: 3, explanation: "כל שלוש המילים יכולות לשמש עם היפוך - 'לא הספקתי להיכנס כשהטלפון צלצל'", category: "grammar" },
    { id: 904, text: "Choose the correct advanced inversion: '___ had she spoken than everyone interrupted'", options: ["No sooner", "Hardly", "Scarcely", "All of the above"], correct: 0, explanation: "משתמשים ב-'No sooner...than' עם היפוך - 'לא הספיקה לדבר וכולם קטעו'", category: "grammar" },
    { id: 905, text: "Choose the correct advanced cleft sentence: '___ I need is your support'", options: ["It", "What", "That", "This"], correct: 1, explanation: "משתמשים ב-'What' במשפט cleft להדגשה - 'מה שאני צריך זה התמיכה שלך'", category: "grammar" },
    { id: 906, text: "Choose the correct advanced cleft sentence: '___ was in Paris that we met'", options: ["It", "What", "That", "This"], correct: 0, explanation: "משתמשים ב-'It' במשפט cleft להדגשה - 'זה היה בפריז שפגשנו'", category: "grammar" },
    { id: 907, text: "Choose the correct advanced participle clause: '___ by the news, she cried'", options: ["Shocked", "Shocking", "Shock", "Shocks"], correct: 0, explanation: "משתמשים ב-past participle 'Shocked' למשמעות סבילה - 'מופתעת מהחדשות, היא בכתה'", category: "grammar" },
    { id: 908, text: "Choose the correct advanced participle clause: '___ the door, he entered'", options: ["Opened", "Opening", "Open", "Opens"], correct: 1, explanation: "משתמשים ב-present participle 'Opening' למשמעות פעילה - 'פותח את הדלת, הוא נכנס'", category: "grammar" },
    { id: 909, text: "Choose the correct advanced conditional: 'If I ___ you, I would have accepted'", options: ["am", "was", "were", "had been"], correct: 3, explanation: "משפט תנאי מעורב: עבר (had been) + עבר מושלם (would have accepted) - 'אילו הייתי אתה, הייתי מקבל'", category: "grammar" },
    { id: 910, text: "Choose the correct advanced modal perfect: 'He ___ have arrived by now'", options: ["should", "must", "can", "will"], correct: 1, explanation: "משתמשים ב-'must have' להבעת ודאות בעבר - 'הוא כנראה כבר הגיע'", category: "grammar" },
    
    // הבנת הנקרא מומחה
    { id: 911, text: "What is the author's purpose in: 'This research aims to investigate the correlation between social media usage and academic performance among teenagers'", options: ["To entertain", "To inform", "To persuade", "To instruct"], correct: 1, explanation: "המטרה של הכותב היא ליידע על מחקר", category: "reading" },
    { id: 912, text: "What is the rhetorical device in: 'She sells seashells by the seashore'", options: ["Metaphor", "Alliteration", "Chiasmus", "Hyperbole"], correct: 1, explanation: "זה alliteration - חזרה על צליל 's'", category: "reading" },
    { id: 913, text: "What is the logical fallacy in: 'Either you support our policy or you're against progress'", options: ["False dilemma", "Straw man", "False cause", "Hasty generalization"], correct: 0, explanation: "זה false dilemma - רק שתי אפשרויות מוצגות", category: "reading" },
    { id: 914, text: "What is the author's tone in: 'The government's response to this crisis has been nothing short of exemplary'", options: ["Neutral", "Critical", "Supportive", "Ambivalent"], correct: 2, explanation: "הטון של הכותב הוא תומך", category: "reading" },
    { id: 915, text: "What is the main thesis in: 'Although renewable energy sources offer environmental benefits, their implementation requires significant infrastructure investment and technological advancement'", options: ["Renewable energy is always good", "Renewable energy is always bad", "Renewable energy has benefits but challenges", "Renewable energy is neutral"], correct: 2, explanation: "התזה היא שלאנרגיה מתחדשת יש יתרונות אבל גם אתגרים", category: "reading" },
    { id: 916, text: "What is the supporting evidence in: 'According to the World Health Organization, 85% of the world's population lacks access to adequate healthcare'", options: ["Personal opinion", "Statistical data", "Anecdotal evidence", "Expert testimony"], correct: 1, explanation: "העדות היא נתונים סטטיסטיים מ-WHO", category: "reading" },
    { id: 917, text: "What is the counterargument in: 'While critics argue that technology isolates people, studies show that it actually enhances communication and connectivity'", options: ["Technology isolates people", "Technology enhances communication", "Technology is always good", "Technology is always bad"], correct: 0, explanation: "הטענה הנגדית היא שטכנולוגיה מבודדת אנשים", category: "reading" },
    { id: 918, text: "What is the conclusion in: 'Therefore, it is imperative that educational institutions adapt their curricula to meet the demands of the digital age'", options: ["Schools should do nothing", "Schools should resist change", "Schools should adapt to digital age", "Technology is unimportant"], correct: 2, explanation: "המסקנה היא שמוסדות חינוך צריכים להתאים את תכניות הלימודים לדרישות העידן הדיגיטלי", category: "reading" },
    { id: 919, text: "What is the author's bias in: 'As a teacher with 20 years of experience, I believe that smaller class sizes are crucial for student success'", options: ["Objective", "Subjective", "Neutral", "Unbiased"], correct: 1, explanation: "הכותב סובייקטיבי בגלל ניסיון אישי", category: "reading" },
    { id: 920, text: "What is the logical structure in: 'The problem began when... This led to... Consequently... As a result...'", options: ["Chronological", "Cause and effect", "Problem-solution", "Compare and contrast"], correct: 1, explanation: "זה עוקב אחרי מבנה סיבה ותוצאה", category: "reading" },
    
    // אוצר מילים מומחה
    { id: 921, text: "What does 'ubiquitous' mean?", options: ["Rare", "Present everywhere", "Expensive", "Difficult"], correct: 1, explanation: "המילה 'ubiquitous' פירושה 'נוכח בכל מקום'", category: "vocabulary" },
    { id: 922, text: "What does 'ephemeral' mean?", options: ["Lasting forever", "Lasting briefly", "Very large", "Very small"], correct: 1, explanation: "המילה 'ephemeral' פירושה 'נמשך זמן קצר'", category: "vocabulary" },
    { id: 923, text: "What does 'pervasive' mean?", options: ["Limited", "Widespread", "Rare", "Expensive"], correct: 1, explanation: "המילה 'pervasive' פירושה 'נפוץ מאוד'", category: "vocabulary" },
    { id: 924, text: "What does 'meticulous' mean?", options: ["Careless", "Very careful", "Fast", "Slow"], correct: 1, explanation: "המילה 'meticulous' פירושה 'מאוד זהיר'", category: "vocabulary" },
    { id: 925, text: "What does 'voracious' mean?", options: ["Small appetite", "Large appetite", "No appetite", "Strange appetite"], correct: 1, explanation: "המילה 'voracious' פירושה 'תיאבון גדול'", category: "vocabulary" },
    { id: 926, text: "What does 'eloquent' mean?", options: ["Poor speaker", "Good speaker", "Quiet", "Loud"], correct: 1, explanation: "המילה 'eloquent' פירושה 'דובר טוב'", category: "vocabulary" },
    { id: 927, text: "What does 'resilient' mean?", options: ["Weak", "Strong and flexible", "Rigid", "Fragile"], correct: 1, explanation: "המילה 'resilient' פירושה 'חזק וגמיש'", category: "vocabulary" },
    { id: 928, text: "What does 'ambiguous' mean?", options: ["Clear", "Unclear", "Simple", "Complex"], correct: 1, explanation: "המילה 'ambiguous' פירושה 'לא ברור'", category: "vocabulary" },
    { id: 929, text: "What does 'cogent' mean?", options: ["Weak argument", "Strong argument", "Long argument", "Short argument"], correct: 1, explanation: "המילה 'cogent' פירושה 'טענה חזקה'", category: "vocabulary" },
    { id: 930, text: "What does 'sagacious' mean?", options: ["Foolish", "Wise", "Young", "Old"], correct: 1, explanation: "המילה 'sagacious' פירושה 'חכם'", category: "vocabulary" },
    
    // משפטים מורכבים מומחה
    { id: 931, text: "Complete: 'Not only did she finish her homework, but she also ___'", options: ["started it", "forgot it", "helped her friend", "threw it away"], correct: 2, explanation: "'Not only...but also' מראה פעולה נוספת", category: "complex" },
    { id: 932, text: "Complete: 'Had I known about the test, I ___ studied'", options: ["will study", "would study", "would have studied", "study"], correct: 2, explanation: "'Had I known' משתמש במשפט תנאי מהסוג השלישי", category: "complex" },
    { id: 933, text: "Complete: 'Were I you, I ___ accept the offer'", options: ["will", "would", "would have", "am"], correct: 1, explanation: "'Were I you' משתמש במשפט תנאי מהסוג השני", category: "complex" },
    { id: 934, text: "Complete: 'So difficult was the exam that ___'", options: ["everyone passed", "everyone failed", "no one tried", "everyone enjoyed it"], correct: 1, explanation: "'So difficult was...' מראה קושי קיצוני", category: "complex" },
    { id: 935, text: "Complete: 'Such was his determination that ___'", options: ["he gave up", "he succeeded", "he failed", "he quit"], correct: 1, explanation: "'Such was...' מראה נחישות קיצונית", category: "complex" },
    { id: 936, text: "Complete: 'No sooner had he arrived than ___'", options: ["he left", "he stayed", "he forgot", "he remembered"], correct: 0, explanation: "'No sooner...than' מראה פעולה מיידית", category: "complex" },
    { id: 937, text: "Complete: 'Hardly had she finished when ___'", options: ["she started", "she stopped", "she continued", "she forgot"], correct: 0, explanation: "'Hardly...when' מראה רצף מיידי", category: "complex" },
    { id: 938, text: "Complete: 'Scarcely had the bell rung when ___'", options: ["students left", "students arrived", "students slept", "students studied"], correct: 0, explanation: "'Scarcely...when' מראה פעולה מיידית", category: "complex" },
    { id: 939, text: "Complete: 'Barely had he spoken when ___'", options: ["everyone listened", "everyone interrupted", "everyone left", "everyone agreed"], correct: 1, explanation: "'Barely...when' מראה הפרעה מיידית", category: "complex" },
    { id: 940, text: "Complete: 'Rarely do we see such talent, but when we do, ___'", options: ["we ignore it", "we appreciate it", "we criticize it", "we forget it"], correct: 1, explanation: "'Rarely do we...but when we do' מראה הערכה", category: "complex" },
    
    // שאלות חזרה - מילים מומחה
    { id: 941, text: "🔊 חזור אחרי הקריין: Subjunctive", options: ["Subjunctive", "Indicative", "Imperative", "Conditional"], correct: 0, explanation: "Subjunctive - ציווי עקיף", category: "repeat" },
    { id: 942, text: "🔊 חזור אחרי הקריין: Inversion", options: ["Inversion", "Normal order", "Question", "Statement"], correct: 0, explanation: "Inversion - היפוך", category: "repeat" },
    { id: 943, text: "🔊 חזור אחרי הקריין: Cleft sentence", options: ["Cleft sentence", "Simple sentence", "Complex sentence", "Compound sentence"], correct: 0, explanation: "Cleft sentence - משפט הדגשה", category: "repeat" },
    { id: 944, text: "🔊 חזור אחרי הקריין: Participle clause", options: ["Participle clause", "Relative clause", "Adverbial clause", "Noun clause"], correct: 0, explanation: "Participle clause - פסוקית פועל", category: "repeat" },
    { id: 945, text: "🔊 חזור אחרי הקריין: Mixed conditional", options: ["Mixed conditional", "First conditional", "Second conditional", "Third conditional"], correct: 0, explanation: "Mixed conditional - משפט תנאי מעורב", category: "repeat" },
    { id: 946, text: "🔊 חזור אחרי הקריין: Passive infinitive", options: ["Passive infinitive", "Active infinitive", "Gerund", "Participle"], correct: 0, explanation: "Passive infinitive - מקור סביל", category: "repeat" },
    { id: 947, text: "🔊 חזור אחרי הקריין: Passive gerund", options: ["Passive gerund", "Active gerund", "Infinitive", "Participle"], correct: 0, explanation: "Passive gerund - שם פועל סביל", category: "repeat" },
    { id: 948, text: "🔊 חזור אחרי הקריין: Perfect infinitive", options: ["Perfect infinitive", "Simple infinitive", "Gerund", "Participle"], correct: 0, explanation: "Perfect infinitive - מקור מושלם", category: "repeat" },
    { id: 949, text: "🔊 חזור אחרי הקריין: Perfect gerund", options: ["Perfect gerund", "Simple gerund", "Infinitive", "Participle"], correct: 0, explanation: "Perfect gerund - שם פועל מושלם", category: "repeat" },
    { id: 950, text: "🔊 חזור אחרי הקריין: Reduced relative clause", options: ["Reduced relative clause", "Full relative clause", "Adverbial clause", "Noun clause"], correct: 0, explanation: "Reduced relative clause - פסוקית יחס מקוצרת", category: "repeat" },
    { id: 951, text: "🔊 חזור אחרי הקריין: Emphatic structure", options: ["Emphatic structure", "Normal structure", "Question", "Statement"], correct: 0, explanation: "Emphatic structure - מבנה הדגשה", category: "repeat" },
    { id: 952, text: "🔊 חזור אחרי הקריין: Ubiquitous", options: ["Ubiquitous", "Rare", "Common", "Unusual"], correct: 0, explanation: "Ubiquitous - נוכח בכל מקום", category: "repeat" },
    { id: 953, text: "🔊 חזור אחרי הקריין: Ephemeral", options: ["Ephemeral", "Lasting", "Permanent", "Eternal"], correct: 0, explanation: "Ephemeral - נמשך זמן קצר", category: "repeat" },
    { id: 954, text: "🔊 חזור אחרי הקריין: Pervasive", options: ["Pervasive", "Limited", "Rare", "Uncommon"], correct: 0, explanation: "Pervasive - נפוץ מאוד", category: "repeat" },
    { id: 955, text: "🔊 חזור אחרי הקריין: Meticulous", options: ["Meticulous", "Careless", "Sloppy", "Messy"], correct: 0, explanation: "Meticulous - מאוד זהיר", category: "repeat" },
    { id: 956, text: "🔊 חזור אחרי הקריין: Voracious", options: ["Voracious", "Small", "Tiny", "Minimal"], correct: 0, explanation: "Voracious - תיאבון גדול", category: "repeat" },
    { id: 957, text: "🔊 חזור אחרי הקריין: Eloquent", options: ["Eloquent", "Poor", "Bad", "Weak"], correct: 0, explanation: "Eloquent - דובר טוב", category: "repeat" },
    { id: 958, text: "🔊 חזור אחרי הקריין: Resilient", options: ["Resilient", "Weak", "Fragile", "Brittle"], correct: 0, explanation: "Resilient - חזק וגמיש", category: "repeat" },
    { id: 959, text: "🔊 חזור אחרי הקריין: Ambiguous", options: ["Ambiguous", "Clear", "Obvious", "Evident"], correct: 0, explanation: "Ambiguous - לא ברור", category: "repeat" },
    { id: 960, text: "🔊 חזור אחרי הקריין: Cogent", options: ["Cogent", "Weak", "Poor", "Bad"], correct: 0, explanation: "Cogent - טענה חזקה", category: "repeat" }
    ]
  },
  '8': { // יחידה 8 - עבודה וקריירה
    '1': [ // רמה 1 - מתחילים - עבודה וקריירה בסיסיים
    // מקצועות בסיסיים
    { id: 8001, text: "What is a teacher?", options: ["מורה", "רופא", "טבח", "נהג"], correct: 0, explanation: "Teacher - מורה", category: "vocabulary" },
    { id: 8002, text: "What is a doctor?", options: ["מורה", "רופא", "טבח", "נהג"], correct: 1, explanation: "Doctor - רופא", category: "vocabulary" },
    { id: 8003, text: "What is a cook?", options: ["מורה", "רופא", "טבח", "נהג"], correct: 2, explanation: "Cook - טבח", category: "vocabulary" },
    { id: 8004, text: "What is a driver?", options: ["מורה", "רופא", "טבח", "נהג"], correct: 3, explanation: "Driver - נהג", category: "vocabulary" },
    { id: 8005, text: "What is a nurse?", options: ["אחות", "רופא", "מורה", "טבח"], correct: 0, explanation: "Nurse - אחות", category: "vocabulary" },
    { id: 8006, text: "What is a student?", options: ["תלמיד", "מורה", "רופא", "טבח"], correct: 0, explanation: "Student - תלמיד", category: "vocabulary" },
    { id: 8007, text: "What is a worker?", options: ["עובד", "מורה", "רופא", "טבח"], correct: 0, explanation: "Worker - עובד", category: "vocabulary" },
    { id: 8008, text: "What is a farmer?", options: ["חקלאי", "מורה", "רופא", "טבח"], correct: 0, explanation: "Farmer - חקלאי", category: "vocabulary" },
    { id: 8009, text: "What is a builder?", options: ["בונה", "מורה", "רופא", "טבח"], correct: 0, explanation: "Builder - בונה", category: "vocabulary" },
    { id: 8010, text: "What is a seller?", options: ["מוכר", "מורה", "רופא", "טבח"], correct: 0, explanation: "Seller - מוכר", category: "vocabulary" },
    
    // פעולות עבודה בסיסיות
    { id: 8011, text: "What do you do at work?", options: ["Work", "Play", "Sleep", "Eat"], correct: 0, explanation: "Work - עובדים", category: "vocabulary" },
    { id: 8012, text: "What do you do with money?", options: ["Earn", "Lose", "Forget", "Break"], correct: 0, explanation: "Earn - מרוויחים", category: "vocabulary" },
    { id: 8013, text: "What do you do in the morning?", options: ["Start work", "End work", "Sleep", "Play"], correct: 0, explanation: "Start work - מתחילים לעבוד", category: "vocabulary" },
    { id: 8014, text: "What do you do in the evening?", options: ["Start work", "End work", "Sleep", "Play"], correct: 1, explanation: "End work - מסיימים לעבוד", category: "vocabulary" },
    { id: 8015, text: "What do you do with a job?", options: ["Get", "Lose", "Forget", "Break"], correct: 0, explanation: "Get a job - מקבלים עבודה", category: "vocabulary" },
    
    // קריאה בסיסית - הקריין קורא והתלמיד בוחר את התרגום הנכון
    { id: 8016, text: "🔊 הקריין אומר: 'I am a teacher'. מה זה אומר?", options: ["אני מורה", "אני רופא", "אני טבח", "אני נהג"], correct: 0, explanation: "'I am a teacher' = אני מורה", category: "reading" },
    { id: 8017, text: "🔊 הקריין אומר: 'I work in a school'. מה זה אומר?", options: ["אני עובד בבית ספר", "אני עובד בבית חולים", "אני עובד במטבח", "אני עובד במכונית"], correct: 0, explanation: "'I work in a school' = אני עובד בבית ספר", category: "reading" },
    { id: 8018, text: "🔊 הקריין אומר: 'I earn money'. מה זה אומר?", options: ["אני מרוויח כסף", "אני מאבד כסף", "אני שוכח כסף", "אני שובר כסף"], correct: 0, explanation: "'I earn money' = אני מרוויח כסף", category: "reading" },
    { id: 8019, text: "🔊 הקריין אומר: 'I start work at 8'. מה זה אומר?", options: ["אני מתחיל לעבוד בשמונה", "אני מסיים לעבוד בשמונה", "אני ישן בשמונה", "אני משחק בשמונה"], correct: 0, explanation: "'I start work at 8' = אני מתחיל לעבוד בשמונה", category: "reading" },
    { id: 8020, text: "🔊 הקריין אומר: 'I like my job'. מה זה אומר?", options: ["אני אוהב את העבודה שלי", "אני שונא את העבודה שלי", "אני שוכח את העבודה שלי", "אני שובר את העבודה שלי"], correct: 0, explanation: "'I like my job' = אני אוהב את העבודה שלי", category: "reading" },
    
    // דקדוק בסיסי
    { id: 8021, text: "Complete: 'I ___ a teacher'", options: ["am", "is", "are", "be"], correct: 0, explanation: "משתמשים ב-'am' עם 'I'", category: "grammar" },
    { id: 8022, text: "Complete: 'He ___ a doctor'", options: ["am", "is", "are", "be"], correct: 1, explanation: "משתמשים ב-'is' עם 'he'", category: "grammar" },
    { id: 8023, text: "Complete: 'They ___ workers'", options: ["am", "is", "are", "be"], correct: 2, explanation: "משתמשים ב-'are' עם 'they'", category: "grammar" },
    { id: 8024, text: "Complete: 'I ___ at 8'", options: ["work", "works", "working", "worked"], correct: 0, explanation: "משתמשים ב-'work' עם 'I'", category: "grammar" },
    { id: 8025, text: "Complete: 'She ___ in a hospital'", options: ["work", "works", "working", "worked"], correct: 1, explanation: "משתמשים ב-'works' עם 'she'", category: "grammar" },
    
    // שאלות חזרה
    { id: 8026, text: "🔊 חזור אחרי הקריין: Teacher", options: ["Teacher", "Doctor", "Cook", "Driver"], correct: 0, explanation: "Teacher - מורה", category: "repeat" },
    { id: 8027, text: "🔊 חזור אחרי הקריין: Doctor", options: ["Teacher", "Doctor", "Cook", "Driver"], correct: 1, explanation: "Doctor - רופא", category: "repeat" },
    { id: 8028, text: "🔊 חזור אחרי הקריין: Cook", options: ["Teacher", "Doctor", "Cook", "Driver"], correct: 2, explanation: "Cook - טבח", category: "repeat" },
    { id: 8029, text: "🔊 חזור אחרי הקריין: Driver", options: ["Teacher", "Doctor", "Cook", "Driver"], correct: 3, explanation: "Driver - נהג", category: "repeat" },
    { id: 8030, text: "🔊 חזור אחרי הקריין: Nurse", options: ["Nurse", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Nurse - אחות", category: "repeat" },
    { id: 8031, text: "🔊 חזור אחרי הקריין: Student", options: ["Student", "Teacher", "Doctor", "Cook"], correct: 0, explanation: "Student - תלמיד", category: "repeat" },
    { id: 8032, text: "🔊 חזור אחרי הקריין: Worker", options: ["Worker", "Teacher", "Doctor", "Cook"], correct: 0, explanation: "Worker - עובד", category: "repeat" },
    { id: 8033, text: "🔊 חזור אחרי הקריין: Farmer", options: ["Farmer", "Teacher", "Doctor", "Cook"], correct: 0, explanation: "Farmer - חקלאי", category: "repeat" },
    { id: 8034, text: "🔊 חזור אחרי הקריין: Builder", options: ["Builder", "Teacher", "Doctor", "Cook"], correct: 0, explanation: "Builder - בונה", category: "repeat" },
    { id: 8035, text: "🔊 חזור אחרי הקריין: Seller", options: ["Seller", "Teacher", "Doctor", "Cook"], correct: 0, explanation: "Seller - מוכר", category: "repeat" },
    { id: 8036, text: "🔊 חזור אחרי הקריין: Work", options: ["Work", "Play", "Sleep", "Eat"], correct: 0, explanation: "Work - עבודה", category: "repeat" },
    { id: 8037, text: "🔊 חזור אחרי הקריין: Earn", options: ["Earn", "Lose", "Forget", "Break"], correct: 0, explanation: "Earn - להרוויח", category: "repeat" },
    { id: 8038, text: "🔊 חזור אחרי הקריין: Job", options: ["Job", "Play", "Sleep", "Eat"], correct: 0, explanation: "Job - עבודה", category: "repeat" },
    { id: 8039, text: "🔊 חזור אחרי הקריין: Office", options: ["Office", "Home", "School", "Park"], correct: 0, explanation: "Office - משרד", category: "repeat" },
    { id: 8040, text: "🔊 חזור אחרי הקריין: Money", options: ["Money", "Food", "Water", "Air"], correct: 0, explanation: "Money - כסף", category: "repeat" },
    
    // אוצר מילים בסיסי - עבודה
    { id: 8041, text: "What is 'work'?", options: ["עבודה", "משחק", "שינה", "אוכל"], correct: 0, explanation: "Work - עבודה", category: "vocabulary" },
    { id: 8042, text: "What is 'job'?", options: ["עבודה", "משחק", "שינה", "אוכל"], correct: 0, explanation: "Job - עבודה", category: "vocabulary" },
    { id: 8043, text: "What is 'money'?", options: ["כסף", "אוכל", "מים", "אוויר"], correct: 0, explanation: "Money - כסף", category: "vocabulary" },
    { id: 8044, text: "What is 'office'?", options: ["משרד", "בית", "בית ספר", "פארק"], correct: 0, explanation: "Office - משרד", category: "vocabulary" },
    { id: 8045, text: "What is 'salary'?", options: ["משכורת", "אוכל", "מים", "אוויר"], correct: 0, explanation: "Salary - משכורת", category: "vocabulary" },
    { id: 8046, text: "What is 'boss'?", options: ["בוס", "עובד", "מורה", "רופא"], correct: 0, explanation: "Boss - בוס", category: "vocabulary" },
    { id: 8047, text: "What is 'colleague'?", options: ["עמית", "בוס", "מורה", "רופא"], correct: 0, explanation: "Colleague - עמית", category: "vocabulary" },
    { id: 8048, text: "What is 'meeting'?", options: ["פגישה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Meeting - פגישה", category: "vocabulary" },
    { id: 8049, text: "What is 'task'?", options: ["משימה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Task - משימה", category: "vocabulary" },
    { id: 8050, text: "What is 'project'?", options: ["פרויקט", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Project - פרויקט", category: "vocabulary" },
    
    // קריאה מורחבת - הקריין קורא והתלמיד בוחר את התרגום הנכון
    { id: 8051, text: "🔊 הקריין אומר: 'I work in an office'. מה זה אומר?", options: ["אני עובד במשרד", "אני עובד בבית ספר", "אני עובד בבית חולים", "אני עובד במטבח"], correct: 0, explanation: "'I work in an office' = אני עובד במשרד", category: "reading" },
    { id: 8052, text: "🔊 הקריין אומר: 'I have a meeting'. מה זה אומר?", options: ["יש לי פגישה", "יש לי עבודה", "יש לי משכורת", "יש לי משימה"], correct: 0, explanation: "'I have a meeting' = יש לי פגישה", category: "reading" },
    { id: 8053, text: "🔊 הקריין אומר: 'I finish work at 5'. מה זה אומר?", options: ["אני מסיים לעבוד בשעה חמש", "אני מתחיל לעבוד בשעה חמש", "אני אוהב לעבוד בשעה חמש", "אני שונא לעבוד בשעה חמש"], correct: 0, explanation: "'I finish work at 5' = אני מסיים לעבוד בשעה חמש", category: "reading" },
    { id: 8054, text: "🔊 הקריין אומר: 'My boss is nice'. מה זה אומר?", options: ["הבוס שלי נחמד", "הבוס שלי רע", "הבוס שלי עצוב", "הבוס שלי כועס"], correct: 0, explanation: "'My boss is nice' = הבוס שלי נחמד", category: "reading" },
    { id: 8055, text: "🔊 הקריין אומר: 'I earn a good salary'. מה זה אומר?", options: ["אני מרוויח משכורת טובה", "אני מאבד משכורת טובה", "אני שוכח משכורת טובה", "אני שובר משכורת טובה"], correct: 0, explanation: "'I earn a good salary' = אני מרוויח משכורת טובה", category: "reading" },
    
    // דקדוק מורחב
    { id: 8056, text: "Complete: 'I ___ work at 8'", options: ["start", "starts", "starting", "started"], correct: 0, explanation: "משתמשים ב-'start' עם 'I'", category: "grammar" },
    { id: 8057, text: "Complete: 'She ___ work at 5'", options: ["finish", "finishes", "finishing", "finished"], correct: 1, explanation: "משתמשים ב-'finishes' עם 'she'", category: "grammar" },
    { id: 8058, text: "Complete: 'They ___ in an office'", options: ["work", "works", "working", "worked"], correct: 0, explanation: "משתמשים ב-'work' עם 'they'", category: "grammar" },
    { id: 8059, text: "Complete: 'I ___ a meeting'", options: ["have", "has", "having", "had"], correct: 0, explanation: "משתמשים ב-'have' עם 'I'", category: "grammar" },
    { id: 8060, text: "Complete: 'He ___ a good salary'", options: ["earn", "earns", "earning", "earned"], correct: 1, explanation: "משתמשים ב-'earns' עם 'he'", category: "grammar" }
    ],
    '2': [ // רמה 2 - בסיסי - עבודה וקריירה מורחבים
    // מקצועות מורחבים
    { id: 8101, text: "What is a lawyer?", options: ["עורך דין", "רופא", "מורה", "טבח"], correct: 0, explanation: "Lawyer - עורך דין", category: "vocabulary" },
    { id: 8102, text: "What is an engineer?", options: ["מהנדס", "רופא", "מורה", "טבח"], correct: 0, explanation: "Engineer - מהנדס", category: "vocabulary" },
    { id: 8103, text: "What is a manager?", options: ["מנהל", "רופא", "מורה", "טבח"], correct: 0, explanation: "Manager - מנהל", category: "vocabulary" },
    { id: 8104, text: "What is a designer?", options: ["מעצב", "רופא", "מורה", "טבח"], correct: 0, explanation: "Designer - מעצב", category: "vocabulary" },
    { id: 8105, text: "What is a writer?", options: ["סופר", "רופא", "מורה", "טבח"], correct: 0, explanation: "Writer - סופר", category: "vocabulary" },
    { id: 8106, text: "What is an artist?", options: ["אמן", "רופא", "מורה", "טבח"], correct: 0, explanation: "Artist - אמן", category: "vocabulary" },
    { id: 8107, text: "What is a musician?", options: ["מוזיקאי", "רופא", "מורה", "טבח"], correct: 0, explanation: "Musician - מוזיקאי", category: "vocabulary" },
    { id: 8108, text: "What is a pilot?", options: ["טייס", "רופא", "מורה", "טבח"], correct: 0, explanation: "Pilot - טייס", category: "vocabulary" },
    { id: 8109, text: "What is a police officer?", options: ["שוטר", "רופא", "מורה", "טבח"], correct: 0, explanation: "Police officer - שוטר", category: "vocabulary" },
    { id: 8110, text: "What is a firefighter?", options: ["כבאי", "רופא", "מורה", "טבח"], correct: 0, explanation: "Firefighter - כבאי", category: "vocabulary" },
    
    // פעולות עבודה מורחבות
    { id: 8111, text: "What do you do in a meeting?", options: ["Discuss", "Sleep", "Play", "Eat"], correct: 0, explanation: "Discuss - דנים", category: "vocabulary" },
    { id: 8112, text: "What do you do with a project?", options: ["Complete", "Lose", "Forget", "Break"], correct: 0, explanation: "Complete - מסיימים", category: "vocabulary" },
    { id: 8113, text: "What do you do with a task?", options: ["Finish", "Lose", "Forget", "Break"], correct: 0, explanation: "Finish - מסיימים", category: "vocabulary" },
    { id: 8114, text: "What do you do with colleagues?", options: ["Collaborate", "Fight", "Ignore", "Hate"], correct: 0, explanation: "Collaborate - משתפים פעולה", category: "vocabulary" },
    { id: 8115, text: "What do you do in an interview?", options: ["Answer questions", "Sleep", "Play", "Eat"], correct: 0, explanation: "Answer questions - עונים על שאלות", category: "vocabulary" },
    
    // קריאה מורחבת - הקריין קורא והתלמיד בוחר את התרגום הנכון
    { id: 8116, text: "🔊 הקריין אומר: 'I am a lawyer'. מה זה אומר?", options: ["אני עורך דין", "אני רופא", "אני מורה", "אני טבח"], correct: 0, explanation: "'I am a lawyer' = אני עורך דין", category: "reading" },
    { id: 8117, text: "🔊 הקריין אומר: 'I work as an engineer'. מה זה אומר?", options: ["אני עובד כמהנדס", "אני עובד כרופא", "אני עובד כמורה", "אני עובד כטבח"], correct: 0, explanation: "'I work as an engineer' = אני עובד כמהנדס", category: "reading" },
    { id: 8118, text: "🔊 הקריין אומר: 'I manage a team'. מה זה אומר?", options: ["אני מנהל צוות", "אני עובד צוות", "אני משחק צוות", "אני ישן צוות"], correct: 0, explanation: "'I manage a team' = אני מנהל צוות", category: "reading" },
    { id: 8119, text: "🔊 הקריין אומר: 'I design websites'. מה זה אומר?", options: ["אני מעצב אתרים", "אני שובר אתרים", "אני שוכח אתרים", "אני מאבד אתרים"], correct: 0, explanation: "'I design websites' = אני מעצב אתרים", category: "reading" },
    { id: 8120, text: "🔊 הקריין אומר: 'I write books'. מה זה אומר?", options: ["אני כותב ספרים", "אני שובר ספרים", "אני שוכח ספרים", "אני מאבד ספרים"], correct: 0, explanation: "'I write books' = אני כותב ספרים", category: "reading" },
    
    // דקדוק מורחב
    { id: 8121, text: "Complete: 'I ___ as a manager'", options: ["work", "works", "working", "worked"], correct: 0, explanation: "משתמשים ב-'work' עם 'I'", category: "grammar" },
    { id: 8122, text: "Complete: 'She ___ a team'", options: ["manage", "manages", "managing", "managed"], correct: 1, explanation: "משתמשים ב-'manages' עם 'she'", category: "grammar" },
    { id: 8123, text: "Complete: 'They ___ together'", options: ["collaborate", "collaborates", "collaborating", "collaborated"], correct: 0, explanation: "משתמשים ב-'collaborate' עם 'they'", category: "grammar" },
    { id: 8124, text: "Complete: 'I ___ a project'", options: ["complete", "completes", "completing", "completed"], correct: 0, explanation: "משתמשים ב-'complete' עם 'I'", category: "grammar" },
    { id: 8125, text: "Complete: 'He ___ questions'", options: ["answer", "answers", "answering", "answered"], correct: 1, explanation: "משתמשים ב-'answers' עם 'he'", category: "grammar" },
    
    // שאלות חזרה
    { id: 8126, text: "🔊 חזור אחרי הקריין: Lawyer", options: ["Lawyer", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Lawyer - עורך דין", category: "repeat" },
    { id: 8127, text: "🔊 חזור אחרי הקריין: Engineer", options: ["Engineer", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Engineer - מהנדס", category: "repeat" },
    { id: 8128, text: "🔊 חזור אחרי הקריין: Manager", options: ["Manager", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Manager - מנהל", category: "repeat" },
    { id: 8129, text: "🔊 חזור אחרי הקריין: Designer", options: ["Designer", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Designer - מעצב", category: "repeat" },
    { id: 8130, text: "🔊 חזור אחרי הקריין: Writer", options: ["Writer", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Writer - סופר", category: "repeat" },
    { id: 8131, text: "🔊 חזור אחרי הקריין: Artist", options: ["Artist", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Artist - אמן", category: "repeat" },
    { id: 8132, text: "🔊 חזור אחרי הקריין: Musician", options: ["Musician", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Musician - מוזיקאי", category: "repeat" },
    { id: 8133, text: "🔊 חזור אחרי הקריין: Pilot", options: ["Pilot", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Pilot - טייס", category: "repeat" },
    { id: 8134, text: "🔊 חזור אחרי הקריין: Police officer", options: ["Police officer", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Police officer - שוטר", category: "repeat" },
    { id: 8135, text: "🔊 חזור אחרי הקריין: Firefighter", options: ["Firefighter", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Firefighter - כבאי", category: "repeat" },
    { id: 8136, text: "🔊 חזור אחרי הקריין: Discuss", options: ["Discuss", "Sleep", "Play", "Eat"], correct: 0, explanation: "Discuss - לדון", category: "repeat" },
    { id: 8137, text: "🔊 חזור אחרי הקריין: Complete", options: ["Complete", "Lose", "Forget", "Break"], correct: 0, explanation: "Complete - להשלים", category: "repeat" },
    { id: 8138, text: "🔊 חזור אחרי הקריין: Finish", options: ["Finish", "Lose", "Forget", "Break"], correct: 0, explanation: "Finish - לסיים", category: "repeat" },
    { id: 8139, text: "🔊 חזור אחרי הקריין: Collaborate", options: ["Collaborate", "Fight", "Ignore", "Hate"], correct: 0, explanation: "Collaborate - לשתף פעולה", category: "repeat" },
    { id: 8140, text: "🔊 חזור אחרי הקריין: Interview", options: ["Interview", "Meeting", "Task", "Project"], correct: 0, explanation: "Interview - ראיון", category: "repeat" },
    
    // אוצר מילים מורחב - עבודה
    { id: 8141, text: "What is 'career'?", options: ["קריירה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Career - קריירה", category: "vocabulary" },
    { id: 8142, text: "What is 'promotion'?", options: ["קידום", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Promotion - קידום", category: "vocabulary" },
    { id: 8143, text: "What is 'resume'?", options: ["קורות חיים", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Resume - קורות חיים", category: "vocabulary" },
    { id: 8144, text: "What is 'application'?", options: ["מועמדות", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Application - מועמדות", category: "vocabulary" },
    { id: 8145, text: "What is 'experience'?", options: ["ניסיון", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Experience - ניסיון", category: "vocabulary" },
    { id: 8146, text: "What is 'skill'?", options: ["כישרון", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Skill - כישרון", category: "vocabulary" },
    { id: 8147, text: "What is 'qualification'?", options: ["הכשרה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Qualification - הכשרה", category: "vocabulary" },
    { id: 8148, text: "What is 'deadline'?", options: ["מועד אחרון", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Deadline - מועד אחרון", category: "vocabulary" },
    { id: 8149, text: "What is 'overtime'?", options: ["שעות נוספות", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Overtime - שעות נוספות", category: "vocabulary" },
    { id: 8150, text: "What is 'vacation'?", options: ["חופשה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Vacation - חופשה", category: "vocabulary" },
    
    // קריאה מורחבת - הקריין קורא והתלמיד בוחר את התרגום הנכון
    { id: 8151, text: "🔊 הקריין אומר: 'I have a good career'. מה זה אומר?", options: ["יש לי קריירה טובה", "יש לי קריירה רעה", "יש לי קריירה עצובה", "יש לי קריירה כועסת"], correct: 0, explanation: "'I have a good career' = יש לי קריירה טובה", category: "reading" },
    { id: 8152, text: "🔊 הקריין אומר: 'I got a promotion'. מה זה אומר?", options: ["קיבלתי קידום", "איבדתי קידום", "שכחתי קידום", "שברתי קידום"], correct: 0, explanation: "'I got a promotion' = קיבלתי קידום", category: "reading" },
    { id: 8153, text: "🔊 הקריין אומר: 'I need experience'. מה זה אומר?", options: ["אני צריך ניסיון", "אני רוצה ניסיון", "אני אוהב ניסיון", "אני שונא ניסיון"], correct: 0, explanation: "'I need experience' = אני צריך ניסיון", category: "reading" },
    { id: 8154, text: "🔊 הקריין אומר: 'I have many skills'. מה זה אומר?", options: ["יש לי הרבה כישרונות", "יש לי מעט כישרונות", "אין לי כישרונות", "יש לי כישרונות רעים"], correct: 0, explanation: "'I have many skills' = יש לי הרבה כישרונות", category: "reading" },
    { id: 8155, text: "🔊 הקריין אומר: 'I work overtime'. מה זה אומר?", options: ["אני עובד שעות נוספות", "אני משחק שעות נוספות", "אני ישן שעות נוספות", "אני אוכל שעות נוספות"], correct: 0, explanation: "'I work overtime' = אני עובד שעות נוספות", category: "reading" },
    
    // דקדוק מורחב
    { id: 8156, text: "Complete: 'I ___ a promotion'", options: ["get", "gets", "getting", "got"], correct: 0, explanation: "משתמשים ב-'get' עם 'I'", category: "grammar" },
    { id: 8157, text: "Complete: 'She ___ experience'", options: ["need", "needs", "needing", "needed"], correct: 1, explanation: "משתמשים ב-'needs' עם 'she'", category: "grammar" },
    { id: 8158, text: "Complete: 'They ___ skills'", options: ["have", "has", "having", "had"], correct: 0, explanation: "משתמשים ב-'have' עם 'they'", category: "grammar" },
    { id: 8159, text: "Complete: 'I ___ overtime'", options: ["work", "works", "working", "worked"], correct: 0, explanation: "משתמשים ב-'work' עם 'I'", category: "grammar" },
    { id: 8160, text: "Complete: 'He ___ a vacation'", options: ["take", "takes", "taking", "took"], correct: 1, explanation: "משתמשים ב-'takes' עם 'he'", category: "grammar" }
    ],
    '3': [ // רמה 3 - בינוני - עבודה וקריירה מתקדמים
    // מקצועות מתקדמים
    { id: 8201, text: "What is a psychologist?", options: ["פסיכולוג", "רופא", "מורה", "טבח"], correct: 0, explanation: "Psychologist - פסיכולוג", category: "vocabulary" },
    { id: 8202, text: "What is a surgeon?", options: ["מנתח", "רופא", "מורה", "טבח"], correct: 0, explanation: "Surgeon - מנתח", category: "vocabulary" },
    { id: 8203, text: "What is an architect?", options: ["אדריכל", "רופא", "מורה", "טבח"], correct: 0, explanation: "Architect - אדריכל", category: "vocabulary" },
    { id: 8204, text: "What is a consultant?", options: ["יועץ", "רופא", "מורה", "טבח"], correct: 0, explanation: "Consultant - יועץ", category: "vocabulary" },
    { id: 8205, text: "What is a researcher?", options: ["חוקר", "רופא", "מורה", "טבח"], correct: 0, explanation: "Researcher - חוקר", category: "vocabulary" },
    { id: 8206, text: "What is a journalist?", options: ["עיתונאי", "רופא", "מורה", "טבח"], correct: 0, explanation: "Journalist - עיתונאי", category: "vocabulary" },
    { id: 8207, text: "What is a photographer?", options: ["צלם", "רופא", "מורה", "טבח"], correct: 0, explanation: "Photographer - צלם", category: "vocabulary" },
    { id: 8208, text: "What is a chef?", options: ["שף", "רופא", "מורה", "טבח"], correct: 0, explanation: "Chef - שף", category: "vocabulary" },
    { id: 8209, text: "What is a mechanic?", options: ["מכונאי", "רופא", "מורה", "טבח"], correct: 0, explanation: "Mechanic - מכונאי", category: "vocabulary" },
    { id: 8210, text: "What is an accountant?", options: ["רואה חשבון", "רופא", "מורה", "טבח"], correct: 0, explanation: "Accountant - רואה חשבון", category: "vocabulary" },
    
    // פעולות עבודה מתקדמות
    { id: 8211, text: "What do you do in a presentation?", options: ["Present", "Sleep", "Play", "Eat"], correct: 0, explanation: "Present - מציגים", category: "vocabulary" },
    { id: 8212, text: "What do you do with a report?", options: ["Write", "Lose", "Forget", "Break"], correct: 0, explanation: "Write - כותבים", category: "vocabulary" },
    { id: 8213, text: "What do you do with a problem?", options: ["Solve", "Lose", "Forget", "Break"], correct: 0, explanation: "Solve - פותרים", category: "vocabulary" },
    { id: 8214, text: "What do you do with a client?", options: ["Serve", "Fight", "Ignore", "Hate"], correct: 0, explanation: "Serve - משרתים", category: "vocabulary" },
    { id: 8215, text: "What do you do in a negotiation?", options: ["Negotiate", "Sleep", "Play", "Eat"], correct: 0, explanation: "Negotiate - מנהלים משא ומתן", category: "vocabulary" },
    
    // קריאה מתקדמת - הקריין קורא והתלמיד בוחר את התרגום הנכון
    { id: 8216, text: "🔊 הקריין אומר: 'I am a psychologist'. מה זה אומר?", options: ["אני פסיכולוג", "אני רופא", "אני מורה", "אני טבח"], correct: 0, explanation: "'I am a psychologist' = אני פסיכולוג", category: "reading" },
    { id: 8217, text: "🔊 הקריין אומר: 'I work as a consultant'. מה זה אומר?", options: ["אני עובד כיועץ", "אני עובד כרופא", "אני עובד כמורה", "אני עובד כטבח"], correct: 0, explanation: "'I work as a consultant' = אני עובד כיועץ", category: "reading" },
    { id: 8218, text: "🔊 הקריין אומר: 'I conduct research'. מה זה אומר?", options: ["אני עורך מחקר", "אני עובד מחקר", "אני משחק מחקר", "אני ישן מחקר"], correct: 0, explanation: "'I conduct research' = אני עורך מחקר", category: "reading" },
    { id: 8219, text: "🔊 הקריין אומר: 'I solve problems'. מה זה אומר?", options: ["אני פותר בעיות", "אני שובר בעיות", "אני שוכח בעיות", "אני מאבד בעיות"], correct: 0, explanation: "'I solve problems' = אני פותר בעיות", category: "reading" },
    { id: 8220, text: "🔊 הקריין אומר: 'I serve clients'. מה זה אומר?", options: ["אני משרת לקוחות", "אני נלחם עם לקוחות", "אני מתעלם מלקוחות", "אני שונא לקוחות"], correct: 0, explanation: "'I serve clients' = אני משרת לקוחות", category: "reading" },
    
    // דקדוק מתקדם
    { id: 8221, text: "Complete: 'I ___ as a consultant'", options: ["work", "works", "working", "worked"], correct: 0, explanation: "משתמשים ב-'work' עם 'I'", category: "grammar" },
    { id: 8222, text: "Complete: 'She ___ research'", options: ["conduct", "conducts", "conducting", "conducted"], correct: 1, explanation: "משתמשים ב-'conducts' עם 'she'", category: "grammar" },
    { id: 8223, text: "Complete: 'They ___ problems'", options: ["solve", "solves", "solving", "solved"], correct: 0, explanation: "משתמשים ב-'solve' עם 'they'", category: "grammar" },
    { id: 8224, text: "Complete: 'I ___ clients'", options: ["serve", "serves", "serving", "served"], correct: 0, explanation: "משתמשים ב-'serve' עם 'I'", category: "grammar" },
    { id: 8225, text: "Complete: 'He ___ negotiations'", options: ["negotiate", "negotiates", "negotiating", "negotiated"], correct: 1, explanation: "משתמשים ב-'negotiates' עם 'he'", category: "grammar" },
    
    // שאלות חזרה
    { id: 8226, text: "🔊 חזור אחרי הקריין: Psychologist", options: ["Psychologist", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Psychologist - פסיכולוג", category: "repeat" },
    { id: 8227, text: "🔊 חזור אחרי הקריין: Surgeon", options: ["Surgeon", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Surgeon - מנתח", category: "repeat" },
    { id: 8228, text: "🔊 חזור אחרי הקריין: Architect", options: ["Architect", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Architect - אדריכל", category: "repeat" },
    { id: 8229, text: "🔊 חזור אחרי הקריין: Consultant", options: ["Consultant", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Consultant - יועץ", category: "repeat" },
    { id: 8230, text: "🔊 חזור אחרי הקריין: Researcher", options: ["Researcher", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Researcher - חוקר", category: "repeat" },
    { id: 8231, text: "🔊 חזור אחרי הקריין: Journalist", options: ["Journalist", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Journalist - עיתונאי", category: "repeat" },
    { id: 8232, text: "🔊 חזור אחרי הקריין: Photographer", options: ["Photographer", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Photographer - צלם", category: "repeat" },
    { id: 8233, text: "🔊 חזור אחרי הקריין: Chef", options: ["Chef", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Chef - שף", category: "repeat" },
    { id: 8234, text: "🔊 חזור אחרי הקריין: Mechanic", options: ["Mechanic", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Mechanic - מכונאי", category: "repeat" },
    { id: 8235, text: "🔊 חזור אחרי הקריין: Accountant", options: ["Accountant", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Accountant - רואה חשבון", category: "repeat" },
    { id: 8236, text: "🔊 חזור אחרי הקריין: Present", options: ["Present", "Sleep", "Play", "Eat"], correct: 0, explanation: "Present - להציג", category: "repeat" },
    { id: 8237, text: "🔊 חזור אחרי הקריין: Solve", options: ["Solve", "Lose", "Forget", "Break"], correct: 0, explanation: "Solve - לפתור", category: "repeat" },
    { id: 8238, text: "🔊 חזור אחרי הקריין: Serve", options: ["Serve", "Fight", "Ignore", "Hate"], correct: 0, explanation: "Serve - לשרת", category: "repeat" },
    { id: 8239, text: "🔊 חזור אחרי הקריין: Negotiate", options: ["Negotiate", "Sleep", "Play", "Eat"], correct: 0, explanation: "Negotiate - לנהל משא ומתן", category: "repeat" },
    { id: 8240, text: "🔊 חזור אחרי הקריין: Research", options: ["Research", "Work", "Play", "Sleep"], correct: 0, explanation: "Research - מחקר", category: "repeat" },
    
    // אוצר מילים מתקדם - עבודה
    { id: 8241, text: "What is 'leadership'?", options: ["מנהיגות", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Leadership - מנהיגות", category: "vocabulary" },
    { id: 8242, text: "What is 'strategy'?", options: ["אסטרטגיה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Strategy - אסטרטגיה", category: "vocabulary" },
    { id: 8243, text: "What is 'innovation'?", options: ["חדשנות", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Innovation - חדשנות", category: "vocabulary" },
    { id: 8244, text: "What is 'efficiency'?", options: ["יעילות", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Efficiency - יעילות", category: "vocabulary" },
    { id: 8245, text: "What is 'productivity'?", options: ["פרודוקטיביות", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Productivity - פרודוקטיביות", category: "vocabulary" },
    { id: 8246, text: "What is 'performance'?", options: ["ביצועים", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Performance - ביצועים", category: "vocabulary" },
    { id: 8247, text: "What is 'evaluation'?", options: ["הערכה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Evaluation - הערכה", category: "vocabulary" },
    { id: 8248, text: "What is 'feedback'?", options: ["משוב", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Feedback - משוב", category: "vocabulary" },
    { id: 8249, text: "What is 'objective'?", options: ["מטרה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Objective - מטרה", category: "vocabulary" },
    { id: 8250, text: "What is 'achievement'?", options: ["הישג", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Achievement - הישג", category: "vocabulary" },
    
    // קריאה מורחבת - הקריין קורא והתלמיד בוחר את התרגום הנכון
    { id: 8251, text: "🔊 הקריין אומר: 'I have good leadership skills'. מה זה אומר?", options: ["יש לי כישורי מנהיגות טובים", "יש לי כישורי מנהיגות רעים", "אין לי כישורי מנהיגות", "יש לי מעט כישורי מנהיגות"], correct: 0, explanation: "'I have good leadership skills' = יש לי כישורי מנהיגות טובים", category: "reading" },
    { id: 8252, text: "🔊 הקריין אומר: 'I develop strategies'. מה זה אומר?", options: ["אני מפתח אסטרטגיות", "אני שובר אסטרטגיות", "אני שוכח אסטרטגיות", "אני מאבד אסטרטגיות"], correct: 0, explanation: "'I develop strategies' = אני מפתח אסטרטגיות", category: "reading" },
    { id: 8253, text: "🔊 הקריין אומר: 'I promote innovation'. מה זה אומר?", options: ["אני מקדם חדשנות", "אני עוצר חדשנות", "אני מתעלם מחדשנות", "אני שונא חדשנות"], correct: 0, explanation: "'I promote innovation' = אני מקדם חדשנות", category: "reading" },
    { id: 8254, text: "🔊 הקריין אומר: 'I improve efficiency'. מה זה אומר?", options: ["אני משפר יעילות", "אני מפחית יעילות", "אני מתעלם מיעילות", "אני שונא יעילות"], correct: 0, explanation: "'I improve efficiency' = אני משפר יעילות", category: "reading" },
    { id: 8255, text: "🔊 הקריין אומר: 'I achieve objectives'. מה זה אומר?", options: ["אני משיג מטרות", "אני נכשל במטרות", "אני מתעלם ממטרות", "אני שונא מטרות"], correct: 0, explanation: "'I achieve objectives' = אני משיג מטרות", category: "reading" },
    
    // דקדוק מורחב
    { id: 8256, text: "Complete: 'I ___ strategies'", options: ["develop", "develops", "developing", "developed"], correct: 0, explanation: "משתמשים ב-'develop' עם 'I'", category: "grammar" },
    { id: 8257, text: "Complete: 'She ___ innovation'", options: ["promote", "promotes", "promoting", "promoted"], correct: 1, explanation: "משתמשים ב-'promotes' עם 'she'", category: "grammar" },
    { id: 8258, text: "Complete: 'They ___ efficiency'", options: ["improve", "improves", "improving", "improved"], correct: 0, explanation: "משתמשים ב-'improve' עם 'they'", category: "grammar" },
    { id: 8259, text: "Complete: 'I ___ objectives'", options: ["achieve", "achieves", "achieving", "achieved"], correct: 0, explanation: "משתמשים ב-'achieve' עם 'I'", category: "grammar" },
    { id: 8260, text: "Complete: 'He ___ feedback'", options: ["provide", "provides", "providing", "provided"], correct: 1, explanation: "משתמשים ב-'provides' עם 'he'", category: "grammar" }
    ],
    '4': [ // רמה 4 - מתקדם - עבודה וקריירה מתקדמים מאוד
    // מקצועות מתקדמים מאוד
    { id: 8301, text: "What is a CEO?", options: ["מנכ\"ל", "רופא", "מורה", "טבח"], correct: 0, explanation: "CEO - מנכ\"ל", category: "vocabulary" },
    { id: 8302, text: "What is a CFO?", options: ["מנהל כספים", "רופא", "מורה", "טבח"], correct: 0, explanation: "CFO - מנהל כספים", category: "vocabulary" },
    { id: 8303, text: "What is a CTO?", options: ["מנהל טכנולוגיה", "רופא", "מורה", "טבח"], correct: 0, explanation: "CTO - מנהל טכנולוגיה", category: "vocabulary" },
    { id: 8304, text: "What is an entrepreneur?", options: ["יזם", "רופא", "מורה", "טבח"], correct: 0, explanation: "Entrepreneur - יזם", category: "vocabulary" },
    { id: 8305, text: "What is a venture capitalist?", options: ["משקיע הון סיכון", "רופא", "מורה", "טבח"], correct: 0, explanation: "Venture capitalist - משקיע הון סיכון", category: "vocabulary" },
    { id: 8306, text: "What is a data scientist?", options: ["מדען נתונים", "רופא", "מורה", "טבח"], correct: 0, explanation: "Data scientist - מדען נתונים", category: "vocabulary" },
    { id: 8307, text: "What is a UX designer?", options: ["מעצב חוויית משתמש", "רופא", "מורה", "טבח"], correct: 0, explanation: "UX designer - מעצב חוויית משתמש", category: "vocabulary" },
    { id: 8308, text: "What is a product manager?", options: ["מנהל מוצר", "רופא", "מורה", "טבח"], correct: 0, explanation: "Product manager - מנהל מוצר", category: "vocabulary" },
    { id: 8309, text: "What is a business analyst?", options: ["אנליסט עסקי", "רופא", "מורה", "טבח"], correct: 0, explanation: "Business analyst - אנליסט עסקי", category: "vocabulary" },
    { id: 8310, text: "What is a marketing director?", options: ["מנהל שיווק", "רופא", "מורה", "טבח"], correct: 0, explanation: "Marketing director - מנהל שיווק", category: "vocabulary" },
    
    // פעולות עבודה מתקדמות מאוד
    { id: 8311, text: "What do you do in a board meeting?", options: ["Make decisions", "Sleep", "Play", "Eat"], correct: 0, explanation: "Make decisions - מקבלים החלטות", category: "vocabulary" },
    { id: 8312, text: "What do you do with a budget?", options: ["Manage", "Lose", "Forget", "Break"], correct: 0, explanation: "Manage - מנהלים", category: "vocabulary" },
    { id: 8313, text: "What do you do with stakeholders?", options: ["Communicate", "Fight", "Ignore", "Hate"], correct: 0, explanation: "Communicate - מתקשרים", category: "vocabulary" },
    { id: 8314, text: "What do you do with a crisis?", options: ["Handle", "Lose", "Forget", "Break"], correct: 0, explanation: "Handle - מטפלים", category: "vocabulary" },
    { id: 8315, text: "What do you do in a merger?", options: ["Negotiate", "Sleep", "Play", "Eat"], correct: 0, explanation: "Negotiate - מנהלים משא ומתן", category: "vocabulary" },
    
    // קריאה מתקדמת מאוד - הקריין קורא והתלמיד בוחר את התרגום הנכון
    { id: 8316, text: "🔊 הקריין אומר: 'I am a CEO'. מה זה אומר?", options: ["אני מנכ\"ל", "אני רופא", "אני מורה", "אני טבח"], correct: 0, explanation: "'I am a CEO' = אני מנכ\"ל", category: "reading" },
    { id: 8317, text: "🔊 הקריין אומר: 'I manage a company'. מה זה אומר?", options: ["אני מנהל חברה", "אני עובד חברה", "אני משחק חברה", "אני ישן חברה"], correct: 0, explanation: "'I manage a company' = אני מנהל חברה", category: "reading" },
    { id: 8318, text: "🔊 הקריין אומר: 'I make strategic decisions'. מה זה אומר?", options: ["אני מקבל החלטות אסטרטגיות", "אני שובר החלטות אסטרטגיות", "אני שוכח החלטות אסטרטגיות", "אני מאבד החלטות אסטרטגיות"], correct: 0, explanation: "'I make strategic decisions' = אני מקבל החלטות אסטרטגיות", category: "reading" },
    { id: 8319, text: "🔊 הקריין אומר: 'I handle crises'. מה זה אומר?", options: ["אני מטפל במשברים", "אני שובר משברים", "אני שוכח משברים", "אני מאבד משברים"], correct: 0, explanation: "'I handle crises' = אני מטפל במשברים", category: "reading" },
    { id: 8320, text: "🔊 הקריין אומר: 'I communicate with stakeholders'. מה זה אומר?", options: ["אני מתקשר עם בעלי עניין", "אני נלחם עם בעלי עניין", "אני מתעלם מבעלי עניין", "אני שונא בעלי עניין"], correct: 0, explanation: "'I communicate with stakeholders' = אני מתקשר עם בעלי עניין", category: "reading" },
    
    // דקדוק מתקדם מאוד
    { id: 8321, text: "Complete: 'I ___ a company'", options: ["manage", "manages", "managing", "managed"], correct: 0, explanation: "משתמשים ב-'manage' עם 'I'", category: "grammar" },
    { id: 8322, text: "Complete: 'She ___ decisions'", options: ["make", "makes", "making", "made"], correct: 1, explanation: "משתמשים ב-'makes' עם 'she'", category: "grammar" },
    { id: 8323, text: "Complete: 'They ___ budgets'", options: ["manage", "manages", "managing", "managed"], correct: 0, explanation: "משתמשים ב-'manage' עם 'they'", category: "grammar" },
    { id: 8324, text: "Complete: 'I ___ with stakeholders'", options: ["communicate", "communicates", "communicating", "communicated"], correct: 0, explanation: "משתמשים ב-'communicate' עם 'I'", category: "grammar" },
    { id: 8325, text: "Complete: 'He ___ crises'", options: ["handle", "handles", "handling", "handled"], correct: 1, explanation: "משתמשים ב-'handles' עם 'he'", category: "grammar" },
    
    // שאלות חזרה
    { id: 8326, text: "🔊 חזור אחרי הקריין: CEO", options: ["CEO", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "CEO - מנכ\"ל", category: "repeat" },
    { id: 8327, text: "🔊 חזור אחרי הקריין: CFO", options: ["CFO", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "CFO - מנהל כספים", category: "repeat" },
    { id: 8328, text: "🔊 חזור אחרי הקריין: CTO", options: ["CTO", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "CTO - מנהל טכנולוגיה", category: "repeat" },
    { id: 8329, text: "🔊 חזור אחרי הקריין: Entrepreneur", options: ["Entrepreneur", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Entrepreneur - יזם", category: "repeat" },
    { id: 8330, text: "🔊 חזור אחרי הקריין: Venture capitalist", options: ["Venture capitalist", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Venture capitalist - משקיע הון סיכון", category: "repeat" },
    { id: 8331, text: "🔊 חזור אחרי הקריין: Data scientist", options: ["Data scientist", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Data scientist - מדען נתונים", category: "repeat" },
    { id: 8332, text: "🔊 חזור אחרי הקריין: UX designer", options: ["UX designer", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "UX designer - מעצב חוויית משתמש", category: "repeat" },
    { id: 8333, text: "🔊 חזור אחרי הקריין: Product manager", options: ["Product manager", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Product manager - מנהל מוצר", category: "repeat" },
    { id: 8334, text: "🔊 חזור אחרי הקריין: Business analyst", options: ["Business analyst", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Business analyst - אנליסט עסקי", category: "repeat" },
    { id: 8335, text: "🔊 חזור אחרי הקריין: Marketing director", options: ["Marketing director", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Marketing director - מנהל שיווק", category: "repeat" },
    { id: 8336, text: "🔊 חזור אחרי הקריין: Strategic", options: ["Strategic", "Work", "Play", "Sleep"], correct: 0, explanation: "Strategic - אסטרטגי", category: "repeat" },
    { id: 8337, text: "🔊 חזור אחרי הקריין: Stakeholder", options: ["Stakeholder", "Worker", "Boss", "Colleague"], correct: 0, explanation: "Stakeholder - בעל עניין", category: "repeat" },
    { id: 8338, text: "🔊 חזור אחרי הקריין: Crisis", options: ["Crisis", "Problem", "Task", "Project"], correct: 0, explanation: "Crisis - משבר", category: "repeat" },
    { id: 8339, text: "🔊 חזור אחרי הקריין: Merger", options: ["Merger", "Meeting", "Task", "Project"], correct: 0, explanation: "Merger - מיזוג", category: "repeat" },
    { id: 8340, text: "🔊 חזור אחרי הקריין: Budget", options: ["Budget", "Money", "Salary", "Income"], correct: 0, explanation: "Budget - תקציב", category: "repeat" },
    
    // אוצר מילים מתקדם מאוד - עבודה
    { id: 8341, text: "What is 'executive'?", options: ["מנהל בכיר", "עובד", "מורה", "רופא"], correct: 0, explanation: "Executive - מנהל בכיר", category: "vocabulary" },
    { id: 8342, text: "What is 'corporation'?", options: ["תאגיד", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Corporation - תאגיד", category: "vocabulary" },
    { id: 8343, text: "What is 'revenue'?", options: ["הכנסה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Revenue - הכנסה", category: "vocabulary" },
    { id: 8344, text: "What is 'profit'?", options: ["רווח", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Profit - רווח", category: "vocabulary" },
    { id: 8345, text: "What is 'investment'?", options: ["השקעה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Investment - השקעה", category: "vocabulary" },
    { id: 8346, text: "What is 'acquisition'?", options: ["רכישה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Acquisition - רכישה", category: "vocabulary" },
    { id: 8347, text: "What is 'partnership'?", options: ["שותפות", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Partnership - שותפות", category: "vocabulary" },
    { id: 8348, text: "What is 'compliance'?", options: ["ציות", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Compliance - ציות", category: "vocabulary" },
    { id: 8349, text: "What is 'governance'?", options: ["ממשל", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Governance - ממשל", category: "vocabulary" },
    { id: 8350, text: "What is 'sustainability'?", options: ["קיימות", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Sustainability - קיימות", category: "vocabulary" },
    
    // קריאה מורחבת - הקריין קורא והתלמיד בוחר את התרגום הנכון
    { id: 8351, text: "🔊 הקריין אומר: 'I am an executive'. מה זה אומר?", options: ["אני מנהל בכיר", "אני עובד", "אני מורה", "אני טבח"], correct: 0, explanation: "'I am an executive' = אני מנהל בכיר", category: "reading" },
    { id: 8352, text: "🔊 הקריין אומר: 'I manage revenue'. מה זה אומר?", options: ["אני מנהל הכנסות", "אני מאבד הכנסות", "אני שוכח הכנסות", "אני שובר הכנסות"], correct: 0, explanation: "'I manage revenue' = אני מנהל הכנסות", category: "reading" },
    { id: 8353, text: "🔊 הקריין אומר: 'I maximize profit'. מה זה אומר?", options: ["אני ממקסם רווח", "אני ממזער רווח", "אני מתעלם מרווח", "אני שונא רווח"], correct: 0, explanation: "'I maximize profit' = אני ממקסם רווח", category: "reading" },
    { id: 8354, text: "🔊 הקריין אומר: 'I make investments'. מה זה אומר?", options: ["אני מבצע השקעות", "אני שובר השקעות", "אני שוכח השקעות", "אני מאבד השקעות"], correct: 0, explanation: "'I make investments' = אני מבצע השקעות", category: "reading" },
    { id: 8355, text: "🔊 הקריין אומר: 'I ensure compliance'. מה זה אומר?", options: ["אני מוודא ציות", "אני מתעלם מציות", "אני שובר ציות", "אני שונא ציות"], correct: 0, explanation: "'I ensure compliance' = אני מוודא ציות", category: "reading" },
    
    // דקדוק מורחב
    { id: 8356, text: "Complete: 'I ___ revenue'", options: ["manage", "manages", "managing", "managed"], correct: 0, explanation: "משתמשים ב-'manage' עם 'I'", category: "grammar" },
    { id: 8357, text: "Complete: 'She ___ profit'", options: ["maximize", "maximizes", "maximizing", "maximized"], correct: 1, explanation: "משתמשים ב-'maximizes' עם 'she'", category: "grammar" },
    { id: 8358, text: "Complete: 'They ___ investments'", options: ["make", "makes", "making", "made"], correct: 0, explanation: "משתמשים ב-'make' עם 'they'", category: "grammar" },
    { id: 8359, text: "Complete: 'I ___ compliance'", options: ["ensure", "ensures", "ensuring", "ensured"], correct: 0, explanation: "משתמשים ב-'ensure' עם 'I'", category: "grammar" },
    { id: 8360, text: "Complete: 'He ___ governance'", options: ["oversee", "oversees", "overseeing", "oversaw"], correct: 1, explanation: "משתמשים ב-'oversees' עם 'he'", category: "grammar" }
    ],
    '5': [ // רמה 5 - מומחה - עבודה וקריירה מומחה
    // מקצועות מומחה
    { id: 8401, text: "What is a thought leader?", options: ["מוביל דעה", "רופא", "מורה", "טבח"], correct: 0, explanation: "Thought leader - מוביל דעה", category: "vocabulary" },
    { id: 8402, text: "What is a futurist?", options: ["עתידן", "רופא", "מורה", "טבח"], correct: 0, explanation: "Futurist - עתידן", category: "vocabulary" },
    { id: 8403, text: "What is a disruptor?", options: ["משבש", "רופא", "מורה", "טבח"], correct: 0, explanation: "Disruptor - משבש", category: "vocabulary" },
    { id: 8404, text: "What is a change agent?", options: ["סוכן שינוי", "רופא", "מורה", "טבח"], correct: 0, explanation: "Change agent - סוכן שינוי", category: "vocabulary" },
    { id: 8405, text: "What is a transformation consultant?", options: ["יועץ טרנספורמציה", "רופא", "מורה", "טבח"], correct: 0, explanation: "Transformation consultant - יועץ טרנספורמציה", category: "vocabulary" },
    { id: 8406, text: "What is a digital strategist?", options: ["אסטרטג דיגיטלי", "רופא", "מורה", "טבח"], correct: 0, explanation: "Digital strategist - אסטרטג דיגיטלי", category: "vocabulary" },
    { id: 8407, text: "What is an innovation officer?", options: ["מנהל חדשנות", "רופא", "מורה", "טבח"], correct: 0, explanation: "Innovation officer - מנהל חדשנות", category: "vocabulary" },
    { id: 8408, text: "What is a sustainability director?", options: ["מנהל קיימות", "רופא", "מורה", "טבח"], correct: 0, explanation: "Sustainability director - מנהל קיימות", category: "vocabulary" },
    { id: 8409, text: "What is a diversity officer?", options: ["מנהל גיוון", "רופא", "מורה", "טבח"], correct: 0, explanation: "Diversity officer - מנהל גיוון", category: "vocabulary" },
    { id: 8410, text: "What is a talent acquisition specialist?", options: ["מומחה גיוס כישרונות", "רופא", "מורה", "טבח"], correct: 0, explanation: "Talent acquisition specialist - מומחה גיוס כישרונות", category: "vocabulary" },
    
    // פעולות עבודה מומחה
    { id: 8411, text: "What do you do in digital transformation?", options: ["Transform", "Sleep", "Play", "Eat"], correct: 0, explanation: "Transform - משנים", category: "vocabulary" },
    { id: 8412, text: "What do you do with disruption?", options: ["Embrace", "Lose", "Forget", "Break"], correct: 0, explanation: "Embrace - מאמצים", category: "vocabulary" },
    { id: 8413, text: "What do you do with innovation?", options: ["Foster", "Lose", "Forget", "Break"], correct: 0, explanation: "Foster - מטפחים", category: "vocabulary" },
    { id: 8414, text: "What do you do with sustainability?", options: ["Promote", "Fight", "Ignore", "Hate"], correct: 0, explanation: "Promote - מקדמים", category: "vocabulary" },
    { id: 8415, text: "What do you do in strategic planning?", options: ["Plan", "Sleep", "Play", "Eat"], correct: 0, explanation: "Plan - מתכננים", category: "vocabulary" },
    
    // קריאה מומחה - הקריין קורא והתלמיד בוחר את התרגום הנכון
    { id: 8416, text: "🔊 הקריין אומר: 'I am a thought leader'. מה זה אומר?", options: ["אני מוביל דעה", "אני רופא", "אני מורה", "אני טבח"], correct: 0, explanation: "'I am a thought leader' = אני מוביל דעה", category: "reading" },
    { id: 8417, text: "🔊 הקריין אומר: 'I drive digital transformation'. מה זה אומר?", options: ["אני מוביל טרנספורמציה דיגיטלית", "אני עובד טרנספורמציה דיגיטלית", "אני משחק טרנספורמציה דיגיטלית", "אני ישן טרנספורמציה דיגיטלית"], correct: 0, explanation: "'I drive digital transformation' = אני מוביל טרנספורמציה דיגיטלית", category: "reading" },
    { id: 8418, text: "🔊 הקריין אומר: 'I embrace disruption'. מה זה אומר?", options: ["אני מאמץ שיבוש", "אני שובר שיבוש", "אני שוכח שיבוש", "אני מאבד שיבוש"], correct: 0, explanation: "'I embrace disruption' = אני מאמץ שיבוש", category: "reading" },
    { id: 8419, text: "🔊 הקריין אומר: 'I foster innovation'. מה זה אומר?", options: ["אני מטפח חדשנות", "אני עוצר חדשנות", "אני מתעלם מחדשנות", "אני שונא חדשנות"], correct: 0, explanation: "'I foster innovation' = אני מטפח חדשנות", category: "reading" },
    { id: 8420, text: "🔊 הקריין אומר: 'I promote sustainability'. מה זה אומר?", options: ["אני מקדם קיימות", "אני עוצר קיימות", "אני מתעלם מקיימות", "אני שונא קיימות"], correct: 0, explanation: "'I promote sustainability' = אני מקדם קיימות", category: "reading" },
    
    // דקדוק מומחה
    { id: 8421, text: "Complete: 'I ___ transformation'", options: ["drive", "drives", "driving", "drove"], correct: 0, explanation: "משתמשים ב-'drive' עם 'I'", category: "grammar" },
    { id: 8422, text: "Complete: 'She ___ disruption'", options: ["embrace", "embraces", "embracing", "embraced"], correct: 1, explanation: "משתמשים ב-'embraces' עם 'she'", category: "grammar" },
    { id: 8423, text: "Complete: 'They ___ innovation'", options: ["foster", "fosters", "fostering", "fostered"], correct: 0, explanation: "משתמשים ב-'foster' עם 'they'", category: "grammar" },
    { id: 8424, text: "Complete: 'I ___ sustainability'", options: ["promote", "promotes", "promoting", "promoted"], correct: 0, explanation: "משתמשים ב-'promote' עם 'I'", category: "grammar" },
    { id: 8425, text: "Complete: 'He ___ planning'", options: ["lead", "leads", "leading", "led"], correct: 1, explanation: "משתמשים ב-'leads' עם 'he'", category: "grammar" },
    
    // שאלות חזרה
    { id: 8426, text: "🔊 חזור אחרי הקריין: Thought leader", options: ["Thought leader", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Thought leader - מוביל דעה", category: "repeat" },
    { id: 8427, text: "🔊 חזור אחרי הקריין: Futurist", options: ["Futurist", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Futurist - עתידן", category: "repeat" },
    { id: 8428, text: "🔊 חזור אחרי הקריין: Disruptor", options: ["Disruptor", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Disruptor - משבש", category: "repeat" },
    { id: 8429, text: "🔊 חזור אחרי הקריין: Change agent", options: ["Change agent", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Change agent - סוכן שינוי", category: "repeat" },
    { id: 8430, text: "🔊 חזור אחרי הקריין: Transformation consultant", options: ["Transformation consultant", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Transformation consultant - יועץ טרנספורמציה", category: "repeat" },
    { id: 8431, text: "🔊 חזור אחרי הקריין: Digital strategist", options: ["Digital strategist", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Digital strategist - אסטרטג דיגיטלי", category: "repeat" },
    { id: 8432, text: "🔊 חזור אחרי הקריין: Innovation officer", options: ["Innovation officer", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Innovation officer - מנהל חדשנות", category: "repeat" },
    { id: 8433, text: "🔊 חזור אחרי הקריין: Sustainability director", options: ["Sustainability director", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Sustainability director - מנהל קיימות", category: "repeat" },
    { id: 8434, text: "🔊 חזור אחרי הקריין: Diversity officer", options: ["Diversity officer", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Diversity officer - מנהל גיוון", category: "repeat" },
    { id: 8435, text: "🔊 חזור אחרי הקריין: Talent acquisition specialist", options: ["Talent acquisition specialist", "Doctor", "Teacher", "Cook"], correct: 0, explanation: "Talent acquisition specialist - מומחה גיוס כישרונות", category: "repeat" },
    { id: 8436, text: "🔊 חזור אחרי הקריין: Transformation", options: ["Transformation", "Change", "Work", "Play"], correct: 0, explanation: "Transformation - טרנספורמציה", category: "repeat" },
    { id: 8437, text: "🔊 חזור אחרי הקריין: Disruption", options: ["Disruption", "Change", "Work", "Play"], correct: 0, explanation: "Disruption - שיבוש", category: "repeat" },
    { id: 8438, text: "🔊 חזור אחרי הקריין: Innovation", options: ["Innovation", "Change", "Work", "Play"], correct: 0, explanation: "Innovation - חדשנות", category: "repeat" },
    { id: 8439, text: "🔊 חזור אחרי הקריין: Sustainability", options: ["Sustainability", "Work", "Play", "Sleep"], correct: 0, explanation: "Sustainability - קיימות", category: "repeat" },
    { id: 8440, text: "🔊 חזור אחרי הקריין: Strategic planning", options: ["Strategic planning", "Work", "Play", "Sleep"], correct: 0, explanation: "Strategic planning - תכנון אסטרטגי", category: "repeat" },
    
    // אוצר מילים מומחה - עבודה
    { id: 8441, text: "What is 'paradigm shift'?", options: ["שינוי פרדיגמה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Paradigm shift - שינוי פרדיגמה", category: "vocabulary" },
    { id: 8442, text: "What is 'synergy'?", options: ["סינרגיה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Synergy - סינרגיה", category: "vocabulary" },
    { id: 8443, text: "What is 'scalability'?", options: ["מדרגיות", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Scalability - מדרגיות", category: "vocabulary" },
    { id: 8444, text: "What is 'agility'?", options: ["זריזות", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Agility - זריזות", category: "vocabulary" },
    { id: 8445, text: "What is 'resilience'?", options: ["חוסן", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Resilience - חוסן", category: "vocabulary" },
    { id: 8446, text: "What is 'disruption'?", options: ["שיבוש", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Disruption - שיבוש", category: "vocabulary" },
    { id: 8447, text: "What is 'transformation'?", options: ["טרנספורמציה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Transformation - טרנספורמציה", category: "vocabulary" },
    { id: 8448, text: "What is 'optimization'?", options: ["אופטימיזציה", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Optimization - אופטימיזציה", category: "vocabulary" },
    { id: 8449, text: "What is 'benchmarking'?", options: ["השוואת ביצועים", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Benchmarking - השוואת ביצועים", category: "vocabulary" },
    { id: 8450, text: "What is 'stakeholder engagement'?", options: ["מעורבות בעלי עניין", "עבודה", "משחק", "שינה"], correct: 0, explanation: "Stakeholder engagement - מעורבות בעלי עניין", category: "vocabulary" },
    
    // קריאה מורחבת - הקריין קורא והתלמיד בוחר את התרגום הנכון
    { id: 8451, text: "🔊 הקריין אומר: 'I drive paradigm shifts'. מה זה אומר?", options: ["אני מוביל שינויי פרדיגמה", "אני עוצר שינויי פרדיגמה", "אני מתעלם משינויי פרדיגמה", "אני שונא שינויי פרדיגמה"], correct: 0, explanation: "'I drive paradigm shifts' = אני מוביל שינויי פרדיגמה", category: "reading" },
    { id: 8452, text: "🔊 הקריין אומר: 'I create synergy'. מה זה אומר?", options: ["אני יוצר סינרגיה", "אני שובר סינרגיה", "אני שוכח סינרגיה", "אני מאבד סינרגיה"], correct: 0, explanation: "'I create synergy' = אני יוצר סינרגיה", category: "reading" },
    { id: 8453, text: "🔊 הקריין אומר: 'I ensure scalability'. מה זה אומר?", options: ["אני מוודא מדרגיות", "אני מתעלם ממדרגיות", "אני שובר מדרגיות", "אני שונא מדרגיות"], correct: 0, explanation: "'I ensure scalability' = אני מוודא מדרגיות", category: "reading" },
    { id: 8454, text: "🔊 הקריין אומר: 'I promote agility'. מה זה אומר?", options: ["אני מקדם זריזות", "אני עוצר זריזות", "אני מתעלם מזריזות", "אני שונא זריזות"], correct: 0, explanation: "'I promote agility' = אני מקדם זריזות", category: "reading" },
    { id: 8455, text: "🔊 הקריין אומר: 'I build resilience'. מה זה אומר?", options: ["אני בונה חוסן", "אני שובר חוסן", "אני שוכח חוסן", "אני מאבד חוסן"], correct: 0, explanation: "'I build resilience' = אני בונה חוסן", category: "reading" },
    
    // דקדוק מורחב
    { id: 8456, text: "Complete: 'I ___ paradigm shifts'", options: ["drive", "drives", "driving", "drove"], correct: 0, explanation: "משתמשים ב-'drive' עם 'I'", category: "grammar" },
    { id: 8457, text: "Complete: 'She ___ synergy'", options: ["create", "creates", "creating", "created"], correct: 1, explanation: "משתמשים ב-'creates' עם 'she'", category: "grammar" },
    { id: 8458, text: "Complete: 'They ___ scalability'", options: ["ensure", "ensures", "ensuring", "ensured"], correct: 0, explanation: "משתמשים ב-'ensure' עם 'they'", category: "grammar" },
    { id: 8459, text: "Complete: 'I ___ agility'", options: ["promote", "promotes", "promoting", "promoted"], correct: 0, explanation: "משתמשים ב-'promote' עם 'I'", category: "grammar" },
    { id: 8460, text: "Complete: 'He ___ resilience'", options: ["build", "builds", "building", "built"], correct: 1, explanation: "משתמשים ב-'builds' עם 'he'", category: "grammar" }
    ]
  }
};


function ClassroomStudentPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session');
  const unit = searchParams?.get('unit') || '1';
  const level = searchParams?.get('level') || '1';

  // פונקציה להשמעת מילים
  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // פונקציה להשמעת שאלות חזרה - משמיעה את המשפט אוטומטית כשהשאלה מוצגת
  const speakRepeatQuestion = (text: string) => {
    if ('speechSynthesis' in window && text.includes('🔊 חזור אחרי הקריין:')) {
      // עצור כל השמעות קודמות
      speechSynthesis.cancel();
      
      const sentence = text.split('🔊 חזור אחרי הקריין: ')[1];
      if (sentence) {
        setTimeout(() => {
          // עצור שוב לפני השמעה חדשה (למקרה שהמשתמש לחץ על כפתור ההשמעה)
          speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(sentence);
          utterance.lang = 'en-US';
          utterance.rate = 0.7;
          utterance.pitch = 1.0;
          utterance.volume = 0.9;
          speechSynthesis.speak(utterance);
        }, 1000); // עיכוב של שנייה אחת אחרי הצגת השאלה
      }
    }
  };

  // פונקציה להשמעת הודעות הצלחה וכישלון
  const speakFeedback = (isCorrect: boolean) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance();
      utterance.lang = 'he-IL'; // עברית
      
      if (isCorrect) {
        // הצלחה - בהתלהבות
        utterance.text = 'תותח!';
        utterance.rate = 1.2;
        utterance.pitch = 1.3;
        utterance.volume = 0.9;
      } else {
        // כישלון - בהכזבה
        utterance.text = 'לא נכון';
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        utterance.volume = 0.8;
      }
      
      speechSynthesis.speak(utterance);
    }
  };
  
  // פונקציה לערבוב תשובות (shuffle)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // פונקציה לערבוב תשובות בשאלה
  const shuffleQuestionOptions = (question: Question): Question => {
    if (question.options.length === 0 || question.category === 'repeat') {
      return question; // שאלות חזרה אין להן תשובות
    }
    
    const options = [...question.options];
    const correctAnswer = options[question.correct];
    const shuffledOptions = shuffleArray(options);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
    
    return {
      ...question,
      options: shuffledOptions,
      correct: newCorrectIndex
    };
  };

  // פונקציה לארגון שאלות לפי סדר מסוים
  const organizeQuestionsByCategory = (questions: Question[]): Question[] => {
    // סדר הקטגוריות:
    // 1. vocabulary (מילים)
    // 2. repeat (הקלטה)
    // 3. sentence-scramble (הזזת מילים)
    // 4. fill-blanks (השלמת משפטים)
    // 5. true-false (נכון/לא נכון)
    // 6. שאר הקטגוריות (reading, grammar, sounds, letters וכו')
    
    const categoryOrder: { [key: string]: number } = {
      'vocabulary': 1,
      'repeat': 2,
      'sentence-scramble': 3,
      'fill-blanks': 4,
      'true-false': 5,
      'reading': 6,
      'grammar': 7,
      'sounds': 8,
      'letters': 9
    };

    const organized = questions.sort((a, b) => {
      const orderA = categoryOrder[a.category] || 99;
      const orderB = categoryOrder[b.category] || 99;
      return orderA - orderB;
    });

    // ערבב תשובות בכל שאלה
    return organized.map(q => shuffleQuestionOptions(q));
  };

  // בחר שאלות לפי יחידה ורמה - משתמש ב-useMemo כדי להתעדכן כש-unit או level משתנים
  const QUESTIONS = useMemo(() => {
    const questions = QUESTIONS_BY_UNIT_LEVEL[unit]?.[level];
    if (!questions || questions.length === 0) {
      console.warn(`No questions found for unit ${unit}, level ${level}. Using default.`);
      return organizeQuestionsByCategory(QUESTIONS_BY_UNIT_LEVEL['1']?.['1'] || []);
    }
    return organizeQuestionsByCategory(questions);
  }, [unit, level]);
  
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [showNameInput, setShowNameInput] = useState(true);
  const [showFinalRanking, setShowFinalRanking] = useState(false);
  
  // State להקלטה וזיהוי דיבור
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameStartTimeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastSpokenQuestionRef = useRef<number | null>(null); // עקוב אחרי השאלה שכבר הושמעה

  // אפס את המשחק כש-unit או level משתנים,
  // אבל אל תמחק/תאפס התקדמות אם כבר קיימת שמירה עבור sessionId (כדי שתלמיד יוכל לרענן את הדף)
  useEffect(() => {
    if (!sessionId) return;

    const savedProgress = localStorage.getItem(`classroom-progress-${sessionId}`);

    // אם יש התקדמות שמורה – אל תאפס כלום, ה-useEffect הבא כבר יטען אותה
    if (savedProgress) {
      return;
    }

    // אין התקדמות שמורה – זה כנראה משחק חדש ל-session הזה
    setGameProgress(null);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameStarted(false);
    setGameFinished(false);
    setShowNameInput(true);
    setTimeLeft(7200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, level, sessionId]);

  // טען התקדמות משמירה
  useEffect(() => {
    if (sessionId) {
      const savedProgress = localStorage.getItem(`classroom-progress-${sessionId}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setGameProgress(progress);
        setStudentName(progress.studentName);
        setShowNameInput(false);
        
        if (progress.currentQuestion < QUESTIONS.length) {
          setCurrentQuestion(QUESTIONS[progress.currentQuestion]);
          setGameStarted(true);
        } else {
          setGameFinished(true);
        }
        
        // חשב זמן נותר לפי זמן "אמיתי" מאז תחילת המשחק
        const elapsed = Date.now() - progress.gameStartTime;
        const remainingMs = 7200000 - elapsed; // 2 שעות במילישניות

        if (remainingMs <= 0) {
          // הזמן הסתיים גם אם התלמיד יצא מהדף – סיים את המשחק
          setTimeLeft(0);
          setGameStarted(false);
          setGameFinished(true);
          return;
        }

        setTimeLeft(Math.floor(remainingMs / 1000));
      }
    }
  }, [sessionId, QUESTIONS]);

  // השמע משפט אוטומטית לשאלות חזרה (רק פעם אחת לכל שאלה)
  useEffect(() => {
    if (currentQuestion && currentQuestion.category === 'repeat') {
      // בדוק אם השאלה הזו כבר הושמעה
      if (lastSpokenQuestionRef.current !== currentQuestion.id) {
        lastSpokenQuestionRef.current = currentQuestion.id;
        speakRepeatQuestion(currentQuestion.text);
      }
    }
  }, [currentQuestion]);

  // טיימר
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameStarted, timeLeft]);

  // בדוק אם שעתיים עברו והצג דירוג
  useEffect(() => {
    if (timeLeft === 0 && gameFinished) {
      // המתין 2 שניות ואז הצג דירוג
      setTimeout(() => {
        const existingResults = localStorage.getItem(`classroom-results-${sessionId}`);
        if (existingResults) {
          const allResults = JSON.parse(existingResults);
          allResults.sort((a: any, b: any) => b.score - a.score);
          
          // מצא דירוג התלמיד
          const studentRank = allResults.findIndex((r: any) => r.name === gameProgress?.studentName) + 1;
          
          // שמור דירוג
          localStorage.setItem(`student-rank-${sessionId}-${gameProgress?.studentName}`, JSON.stringify({
            rank: studentRank,
            totalStudents: allResults.length,
            allResults: allResults
          }));
          
          setShowFinalRanking(true);
          
          // השמעת הודעת דירוג
          if ('speechSynthesis' in window && studentRank <= 3) {
            const utterance = new SpeechSynthesisUtterance();
            utterance.lang = 'he-IL';
            
            if (studentRank === 1) {
              utterance.text = 'וואו! מקום ראשון! אתה אלוף!';
              utterance.rate = 1.3;
              utterance.pitch = 1.4;
            } else if (studentRank === 2) {
              utterance.text = 'מעולה! מקום שני! כל הכבוד!';
              utterance.rate = 1.2;
              utterance.pitch = 1.3;
            } else if (studentRank === 3) {
              utterance.text = 'יפה! מקום שלישי! מצוין!';
              utterance.rate = 1.2;
              utterance.pitch = 1.3;
            }
            
            utterance.volume = 0.9;
            speechSynthesis.speak(utterance);
          }
        }
      }, 2000);
    }
  }, [timeLeft, gameFinished, sessionId, gameProgress]);

  // השמעת שאלות חזרה כשמשנים שאלה
  useEffect(() => {
    if (currentQuestion && currentQuestion.text.includes('🔊 חזור אחרי הקריין:')) {
      speakRepeatQuestion(currentQuestion.text);
    }
  }, [currentQuestion]);

  // שמור התקדמות
  useEffect(() => {
    if (gameProgress && sessionId) {
      localStorage.setItem(`classroom-progress-${sessionId}`, JSON.stringify(gameProgress));
      
      // שלח נתונים למורה
      sendResultsToTeacher();
    }
  }, [gameProgress, sessionId]);

  const startGame = () => {
    if (!studentName.trim() || !sessionId) return;

    const progress: GameProgress = {
      currentQuestion: 0,
      score: 0,
      totalTime: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      gameStartTime: Date.now(),
      lastActivityTime: Date.now(),
      studentName: studentName.trim()
    };

    setGameProgress(progress);
    setCurrentQuestion(QUESTIONS[0]);
    setGameStarted(true);
    setShowNameInput(false);
    gameStartTimeRef.current = Date.now();
  };

  // פונקציה להתחלת הקלטה לשאלות חזרה
  const startRecording = async () => {
    if (!currentQuestion || currentQuestion.category !== 'repeat') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('הדפדפן שלך לא תומך בזיהוי דיבור. אנא השתמש בדפדפן Chrome או Edge.');
      return;
    }

    try {
      setIsRecording(true);
      setUserTranscript('');
      setIsChecking(false);
      setAudioUrl(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
      };

      mediaRecorder.start(100);

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = true; // המשך להקשיב עד שהמשתמש עוצר ידנית

      let hasResult = false; // עקוב אחרי אם כבר יש תוצאה
      let finalTranscript = ''; // שמור את הטקסט הסופי

      recognition.onresult = (event: any) => {
        // עם continuous=true, onresult נקרא מספר פעמים עם interim results
        // אסוף את כל התוצאות הסופיות
        let interimTranscript = '';
        let finalTranscriptParts: string[] = [];
        
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptParts.push(transcript);
          } else {
            interimTranscript += transcript;
          }
        }
        
        // עדכן את ה-transcript עם התוצאות הביניים
        if (interimTranscript) {
          setUserTranscript(interimTranscript);
        }
        
        // אם יש תוצאות סופיות, שמור אותן
        if (finalTranscriptParts.length > 0) {
          finalTranscript = finalTranscriptParts.join(' ').trim();
          setUserTranscript(finalTranscript);
          hasResult = true;
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsRecording(false);
        setIsChecking(false);
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        stream.getTracks().forEach(track => track.stop());
        alert('שגיאה בזיהוי דיבור. נסה שוב.');
      };

      recognition.onend = () => {
        // רק עצור את ההקלטה אם אין תוצאה (כי אם יש תוצאה, זה כבר טופל ב-onresult)
        if (!hasResult && isRecording) {
          setIsRecording(false);
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          stream.getTracks().forEach(track => track.stop());
          // אל תעבור לשאלה הבאה - תן למשתמש אפשרות לנסות שוב
          console.log('Speech recognition ended without result. User can try again.');
        }
      };

      recognition.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      alert('שגיאה בהתחלת ההקלטה. ודא שיש לך הרשאת מיקרופון.');
    }
  };

  // פונקציה לעצירת הקלטה ידנית
  const stopRecording = () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // המתין קצת כדי שהתוצאות הסופיות יגיעו
    setTimeout(() => {
      // אם יש transcript, בדוק את התשובה
      if (userTranscript && userTranscript.trim()) {
        setIsChecking(true);
        setTimeout(() => checkRepeatAnswer(userTranscript.trim()), 500);
      } else {
        setIsChecking(false);
        alert('לא זוהה דיבור. נסה שוב.');
      }
    }, 300);
  };

  // פונקציה לבדיקת תשובה בשאלות חזרה
  const checkRepeatAnswer = (transcript: string) => {
    if (!currentQuestion || !gameProgress) return;

    // חלץ את המשפט הנכון מהשאלה
    const correctText = currentQuestion.text.split('🔊 חזור אחרי הקריין: ')[1]?.trim() || '';
    
    // השווה את הטקסט (case-insensitive, ללא סימני פיסוק)
    const normalize = (text: string) => text.toLowerCase().replace(/[.,!?;:'"]/g, '').trim();
    const normalizedTranscript = normalize(transcript);
    const normalizedCorrect = normalize(correctText);
    
    // בדוק אם התשובה נכונה (אפשר גם חלקית - אם מכילה את המילים העיקריות)
    const isCorrect = normalizedTranscript === normalizedCorrect || 
                      normalizedCorrect.split(' ').every(word => normalizedTranscript.includes(word));
    
    setIsChecking(false);
    setSelectedAnswer(isCorrect ? 0 : -1); // 0 = נכון, -1 = לא נכון
    setShowExplanation(true);

    // עדכן את ההתקדמות
    handleRepeatAnswerResult(isCorrect);
  };

  // פונקציה לעדכון תוצאות שאלות חזרה
  const handleRepeatAnswerResult = (isCorrect: boolean) => {
    if (!gameProgress) return;

    setTimeout(() => {
      speakFeedback(isCorrect);
    }, 500);
    
    let points = 0;
    
    if (isCorrect) {
      points = 15; // יותר נקודות לשאלות חזרה כי הן קשות יותר
      
      const timeToAnswer = Date.now() - (gameProgress.lastActivityTime || gameProgress.gameStartTime);
      if (timeToAnswer < 15000) { // 15 שניות
        points += 5;
      }
    }
    
    const newScore = gameProgress.score + points;
    const newCorrectAnswers = gameProgress.correctAnswers + (isCorrect ? 1 : 0);
    const newQuestionsAnswered = gameProgress.questionsAnswered + 1;

    const updatedProgress = {
      ...gameProgress,
      score: newScore,
      correctAnswers: newCorrectAnswers,
      questionsAnswered: newQuestionsAnswered,
      lastActivityTime: Date.now()
    };

    setGameProgress(updatedProgress);

    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (!currentQuestion || !gameProgress || selectedAnswer !== null) return;
    
    // אם זו שאלת חזרה, לא להשתמש בפונקציה הזו
    if (currentQuestion.category === 'repeat') {
      return;
    }

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const isCorrect = answerIndex === currentQuestion.correct;
    
    // השמעת הודעת הצלחה או כישלון
    setTimeout(() => {
      speakFeedback(isCorrect);
    }, 500); // קצת עיכוב כדי שהאנימציה תתחיל
    
    let points = 0;
    
    if (isCorrect) {
      // נקודות בסיסיות
      points = 10;
      
      // בונוס זמן - אם ענה מהר (תוך 10 שניות)
      const timeToAnswer = Date.now() - (gameProgress.lastActivityTime || gameProgress.gameStartTime);
      if (timeToAnswer < 10000) { // 10 שניות
        points += 5; // בונוס 5 נקודות נוספות
      }
    }
    
    const newScore = gameProgress.score + points;
    const newCorrectAnswers = gameProgress.correctAnswers + (isCorrect ? 1 : 0);
    const newQuestionsAnswered = gameProgress.questionsAnswered + 1;

    const updatedProgress = {
      ...gameProgress,
      score: newScore,
      correctAnswers: newCorrectAnswers,
      questionsAnswered: newQuestionsAnswered,
      lastActivityTime: Date.now()
    };

    setGameProgress(updatedProgress);

    // אפקט קונפטי לתשובה נכונה
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // לא מעבר אוטומטי - התלמיד יצטרך ללחוץ על כפתור
  };

  // פונקציה למעבר לשאלה הבאה
  const goToNextQuestion = () => {
    if (!gameProgress) return;
    
    // עצור הקלטה אם יש
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
    
    // אפס state הקלטה
    setIsRecording(false);
    setUserTranscript('');
    setIsChecking(false);
    setAudioUrl(null);
    
    const nextQuestionIndex = gameProgress.currentQuestion + 1;
    
    if (nextQuestionIndex >= QUESTIONS.length) {
      finishGame();
    } else {
      setCurrentQuestion(QUESTIONS[nextQuestionIndex]);
      setSelectedAnswer(null);
      setShowExplanation(false);
      
      setGameProgress({
        ...gameProgress,
        currentQuestion: nextQuestionIndex,
        lastActivityTime: Date.now()
      });
    }
  };

  const finishGame = () => {
    if (!gameProgress) return;

    const finalProgress = {
      ...gameProgress,
      totalTime: Date.now() - gameProgress.gameStartTime,
      lastActivityTime: Date.now()
    };

    setGameProgress(finalProgress);
    
    // השמעת הודעת סיום המשחק
    setTimeout(() => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance();
        utterance.lang = 'he-IL';
        utterance.text = 'סיימת את המשחק! כל הכבוד!';
        utterance.rate = 1.1;
        utterance.pitch = 1.2;
        utterance.volume = 0.9;
        speechSynthesis.speak(utterance);
      }
    }, 1000);
    
    // שלח תוצאות סופיות
    const studentResult = sendResultsToTeacher();
    
    // שמור תוצאות מקומיות (בלי דירוג עדיין)
    const existingResults = localStorage.getItem(`classroom-results-${sessionId}`);
    let allResults = existingResults ? JSON.parse(existingResults) : [];
    allResults.push(studentResult);
    localStorage.setItem(`classroom-results-${sessionId}`, JSON.stringify(allResults));
    
    setGameFinished(true);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const sendResultsToTeacher = async () => {
    if (!gameProgress || !sessionId) return;

    // חשב בונוס זמן - אם סיים מהר יותר
    const totalTime = gameProgress.totalTime || (Date.now() - gameProgress.gameStartTime);
    const timeInMinutes = totalTime / (1000 * 60);
    let timeBonus = 0;
    
    // בונוס זמן: אם סיים תוך 30 דקות - 50 נקודות בונוס
    if (timeInMinutes <= 30) {
      timeBonus = 50;
    } else if (timeInMinutes <= 45) {
      timeBonus = 25;
    } else if (timeInMinutes <= 60) {
      timeBonus = 10;
    }

    const finalScore = gameProgress.score + timeBonus;

    const studentResult = {
      id: `${sessionId}-${gameProgress.studentName}-${Date.now()}`,
      name: gameProgress.studentName,
      score: finalScore,
      baseScore: gameProgress.score,
      timeBonus: timeBonus,
      totalTime: totalTime,
      timeInMinutes: Math.round(timeInMinutes),
      date: new Date().toLocaleString('he-IL'),
      questionsAnswered: gameProgress.questionsAnswered,
      correctAnswers: gameProgress.correctAnswers,
      lastActivity: new Date().toLocaleString('he-IL'),
      gameProgress: gameProgress.currentQuestion < QUESTIONS.length 
        ? Math.round((gameProgress.currentQuestion / QUESTIONS.length) * 100)
        : 100
    };

    try {
      // שלח לשרת
      const response = await fetch('/api/classroom/submit-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          studentResult: studentResult
        }),
      });

      if (response.ok) {
        console.log('תוצאות נשלחו למורה בהצלחה!');
      } else {
        console.error('שגיאה בשליחת התוצאות למורה');
      }
    } catch (error) {
      console.error('שגיאה בשליחת התוצאות:', error);
    }

    // שמור גם ב-localStorage כגיבוי
    const existingResults = localStorage.getItem(`classroom-results-${sessionId}`);
    let results = existingResults ? JSON.parse(existingResults) : [];
    
    // עדכן תוצאה קיימת או הוסף חדשה
    const existingIndex = results.findIndex((r: any) => r.name === gameProgress.studentName);
    if (existingIndex >= 0) {
      results[existingIndex] = studentResult;
    } else {
      results.push(studentResult);
    }
    
    localStorage.setItem(`classroom-results-${sessionId}`, JSON.stringify(results));
    
    return studentResult;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            שגיאה: אין קוד משחק
          </h2>
          <p className="text-gray-600">
            אנא בקש מהמורה שלך את הקישור הנכון למשחק
          </p>
        </div>
      </div>
    );
  }

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              משחק כיתה באנגלית
            </h2>
            <p className="text-gray-600">
              הזן את השם שלך כדי להתחיל
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                השם המלא שלך
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="הקלד את השם שלך כאן..."
                onKeyPress={(e) => e.key === 'Enter' && startGame()}
              />
            </div>
            
            <button
              onClick={startGame}
              disabled={!studentName.trim()}
              className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 ${
                studentName.trim()
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              🚀 התחל לשחק
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>⏱️ זמן המשחק: עד שעתיים</p>
            <p>📊 {QUESTIONS.length} שאלות</p>
            <p>💾 המשחק נשמר אוטומטית</p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium mb-2">📚 אוצר המילים ליחידה {unit} רמה {level}:</p>
        <p className="text-blue-700 text-xs">
          {unit === '1' && level === '1' && '60 שאלות בעברית: אותיות וצלילים, מילים בסיסיות, בעלי חיים, צבעים, מספרים, חלקי גוף, בית, בית ספר, אוכל, פעלים'}
          {unit === '1' && level === '2' && '60 שאלות מעורבות: קריאת מילים באנגלית, חריזה, בעלי חיים, אוכל, תחבורה, בגדים, פעלים, דקדוק בסיסי, אמת/שקר, השוואות, תרגום'}
          {unit === '1' && level === '3' && '60 שאלות באנגלית: משפחה, מזג אוויר, דקדוק בסיסי (am/is/are), הפכים, מקצועות, משפטים, זמנים, אוצר מילים, מקומות, תרגום'}
          {unit === '1' && level === '4' && '60 שאלות באנגלית: השלמת משפטים, הבנת הנקרא, מקומות, דקדוק מתקדם, זמנים, אוצר מילים רחב'}
          {unit === '1' && level === '5' && '60 שאלות באנגלית: דקדוק מתקדם (have/has, comparative), אוצר מילים רחב, מקצועות, מקומות, הבנת הנקרא מתקדמת'}
          {unit === '2' && level === '1' && '60 שאלות באנגלית: דקדוק מתקדם (conditional, passive), אוצר מילים מתקדם, מקצועות אקדמיים, הבנת הנקרא מורכבת'}
          {unit === '2' && level === '2' && '60 שאלות באנגלית: דקדוק מורכב (subjunctive, gerund), אוצר מילים מתקדם, מקצועות אקדמיים, הבנת הנקרא מתקדמת מאוד'}
          {unit === '2' && level === '3' && '60 שאלות באנגלית: דקדוק מורכב (conditional perfect), אוצר מילים מתקדם מאוד, מקצועות אקדמיים, הבנת הנקרא מתקדמת מאוד'}
        </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameFinished && gameProgress) {
    const accuracy = gameProgress.questionsAnswered > 0 
      ? Math.round((gameProgress.correctAnswers / gameProgress.questionsAnswered) * 100)
      : 0;

    // קבל דירוג התלמיד (רק אם שעתיים עברו)
    const rankData = showFinalRanking ? localStorage.getItem(`student-rank-${sessionId}-${gameProgress.studentName}`) : null;
    let rankInfo = null;
    if (rankData) {
      rankInfo = JSON.parse(rankData);
    }

    // קבל את כל התוצאות להצגת לוח התוצאות (רק אם שעתיים עברו)
    const existingResults = showFinalRanking ? localStorage.getItem(`classroom-results-${sessionId}`) : null;
    let allResults = existingResults ? JSON.parse(existingResults) : [];
    if (allResults.length > 0) {
      allResults.sort((a: any, b: any) => b.score - a.score);
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              כל הכבוד {gameProgress.studentName}!
            </h2>
            <p className="text-gray-600">
              סיימת את המשחק בהצלחה
            </p>
            
            {/* הצגת הדירוג */}
            {showFinalRanking && rankInfo && (
              <div className="mt-4">
                <div className={`inline-block px-6 py-3 rounded-full text-xl font-bold ${
                  rankInfo.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                  rankInfo.rank === 2 ? 'bg-gray-100 text-gray-800' :
                  rankInfo.rank === 3 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {rankInfo.rank === 1 ? '🥇 מקום ראשון!' :
                   rankInfo.rank === 2 ? '🥈 מקום שני!' :
                   rankInfo.rank === 3 ? '🥉 מקום שלישי!' :
                   `מקום ${rankInfo.rank} מתוך ${rankInfo.totalStudents}`}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {rankInfo?.studentResult?.score || gameProgress.score}
              </div>
              <div className="text-sm text-yellow-600">ניקוד סופי</div>
              {rankInfo?.studentResult?.timeBonus > 0 && (
                <div className="text-xs text-green-600 mt-1">
                  +{rankInfo.studentResult.timeBonus} בונוס זמן
                </div>
              )}
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {gameProgress.correctAnswers}
              </div>
              <div className="text-sm text-green-600">נכונות</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {gameProgress.questionsAnswered}
              </div>
              <div className="text-sm text-blue-600">שאלות</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {accuracy}%
              </div>
              <div className="text-sm text-purple-600">דיוק</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">פרטי המשחק:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>⏱️ זמן משחק: {formatTime(Math.floor(gameProgress.totalTime / 1000))}</p>
              <p>📅 תאריך: {new Date().toLocaleDateString('he-IL')}</p>
              <p>🎯 התקדמות: 100%</p>
              {rankInfo?.studentResult?.timeBonus > 0 && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-3 mt-3">
                  <p className="text-green-800 font-bold text-center">
                    ⚡ מהיר כמו ברק! קיבלת {rankInfo.studentResult.timeBonus} נקודות בונוס על סיום מהיר!
                  </p>
                  <p className="text-green-700 text-center text-xs mt-1">
                    {rankInfo.studentResult.timeInMinutes <= 30 ? 'סיימת תוך 30 דקות - מדהים!' :
                     rankInfo.studentResult.timeInMinutes <= 45 ? 'סיימת תוך 45 דקות - מעולה!' :
                     'סיימת תוך שעה - יופי!'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* לוח תוצאות - רק אחרי שעתיים */}
          {showFinalRanking && allResults.length > 1 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                🏆 לוח התוצאות של הכיתה
              </h3>
              <div className="space-y-2">
                {allResults.slice(0, 10).map((student: any, index: number) => (
                  <div key={student.id} className={`flex justify-between items-center p-3 rounded-lg ${
                    student.name === gameProgress.studentName 
                      ? 'bg-yellow-100 border-2 border-yellow-300' 
                      : 'bg-white'
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                        index === 0 ? 'bg-yellow-400 text-yellow-800' :
                        index === 1 ? 'bg-gray-300 text-gray-800' :
                        index === 2 ? 'bg-orange-400 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{student.name}</span>
                      {student.name === gameProgress.studentName && (
                        <span className="ml-2 text-yellow-600">👤 זה אתה!</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{student.score}</div>
                      <div className="text-xs text-gray-500">
                        {student.timeInMinutes} דקות
                        {student.timeBonus > 0 && (
                          <span className="text-green-600"> +{student.timeBonus}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-6 py-3 rounded-xl inline-block border-2 border-green-300 shadow-lg">
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-2">✅</span>
                <div>
                  <div className="font-bold">התוצאות נשלחו למורה שלך!</div>
                  <div className="text-sm text-green-600">המורה יראה את התוצאות שלך בזמן אמת</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted || !currentQuestion || !gameProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <div className="text-xl">טוען משחק...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-500 p-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/4 right-10 w-16 h-16 bg-pink-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-blue-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-10 right-1/4 w-14 h-14 bg-green-300 rounded-full opacity-20 animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6 border-4 border-white/50">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎓 משחק כיתה באנגלית
            </h1>
            <p className="text-gray-700 text-sm font-medium">
              שלום <span className="text-purple-600 font-bold">{gameProgress.studentName}</span>! 🌟
            </p>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-block mt-1">
              🎓 יחידה {unit} רמה {level}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                // שמור התקדמות ויצא
                if (gameProgress && sessionId) {
                  localStorage.setItem(`classroom-progress-${sessionId}`, JSON.stringify(gameProgress));
                  sendResultsToTeacher();
                }
                
                // השמעת הודעת יציאה
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance();
                  utterance.lang = 'he-IL';
                  utterance.text = 'ההתקדמות נשמרה. להתראות!';
                  utterance.rate = 1.0;
                  utterance.pitch = 1.0;
                  utterance.volume = 0.8;
                  speechSynthesis.speak(utterance);
                  
                  setTimeout(() => {
                    if ((window as any).close) {
                      (window as any).close();
                    }
                  }, 1500);
                } else {
                  if ((window as any).close) {
                    (window as any).close();
                  }
                }
              }}
              className="bg-gradient-to-r from-red-400 to-red-500 text-white px-4 py-2 rounded-xl font-bold hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🚪 יציאה בטוחה
            </button>
            
            <div className="text-right bg-gradient-to-br from-yellow-100 to-orange-100 p-4 rounded-xl border-2 border-yellow-300">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {gameProgress.score}
              </div>
              <div className="text-sm text-yellow-700 font-medium">⭐ ניקוד</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm font-medium mb-3">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              שאלה {gameProgress.currentQuestion + 1} מתוך {QUESTIONS.length}
            </span>
            {currentQuestion.text.includes('חזור אחרי הקריין:') && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                🎧 חזור אחרי הקריין!
              </span>
            )}
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">
              ⏱️ {formatTime(timeLeft)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${((gameProgress.currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-6 border-4 border-white/50">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
            {currentQuestion.category.toUpperCase()}
          </div>
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-3xl font-bold text-gray-800 leading-relaxed bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentQuestion.text}
            </h2>
            {currentQuestion.text.includes('🔊') && (
              <button
                onClick={() => {
                  // עצור כל השמעות קודמות לפני השמעה חדשה
                  speechSynthesis.cancel();
                  
                  if (currentQuestion.text.includes('חזור אחרי הקריין:')) {
                    // שאלת חזרה - השמע את המשפט
                    const word = currentQuestion.text.split('🔊 חזור אחרי הקריין: ')[1];
                    if (word) {
                      const utterance = new SpeechSynthesisUtterance(word);
                      utterance.lang = 'en-US';
                      utterance.rate = 0.7;
                      utterance.pitch = 1.0;
                      utterance.volume = 0.9;
                      speechSynthesis.speak(utterance);
                    }
                  } else if (currentQuestion.text.includes('הקריין אומר:')) {
                    // שאלת קריאה - השמע את המשפט האנגלי מתוך המרכאות
                    const match = currentQuestion.text.match(/הקריין אומר: '([^']+)'/);
                    if (match && match[1]) {
                      const englishText = match[1];
                      const utterance = new SpeechSynthesisUtterance(englishText);
                      utterance.lang = 'en-US';
                      utterance.rate = 0.8;
                      utterance.pitch = 1.0;
                      utterance.volume = 0.9;
                      speechSynthesis.speak(utterance);
                    }
                  } else {
                    // שאלת צליל - השמע את האות
                    const letter = currentQuestion.text.match(/האות (\w+)/)?.[1];
                    if (letter) {
                      speakWord(letter);
                    }
                  }
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                title={
                  currentQuestion.text.includes('חזור אחרי הקריין:') 
                    ? "האזן שוב למילה" 
                    : currentQuestion.text.includes('הקריין אומר:')
                    ? "האזן למשפט באנגלית"
                    : "האזן לצליל האות"
                }
              >
                🔊
              </button>
            )}
          </div>
        </div>

        {/* אם זו שאלת חזרה, הצג כפתור הקלטה */}
        {currentQuestion.category === 'repeat' ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-4">
                הקריין יגיד משפט. הקלט את עצמך חוזר על המשפט:
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200 mb-4">
                <p className="text-2xl font-bold text-gray-800">
                  {currentQuestion.text.split('🔊 חזור אחרי הקריין: ')[1]}
                </p>
              </div>
            </div>

            {/* כפתור הקלטה */}
            <div className="flex flex-col items-center gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isChecking || selectedAnswer !== null}
                  className={`px-8 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 transform shadow-2xl ${
                    isChecking
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                      : selectedAnswer !== null
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-105'
                  }`}
                >
                  {isChecking ? (
                    <span className="flex items-center gap-3">
                      <span className="animate-spin">⏳</span> בודק...
                    </span>
                  ) : selectedAnswer !== null ? (
                    <span>✓ הושלם</span>
                  ) : (
                    <span className="flex items-center gap-3">
                      🎤 הקלט את עצמך
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-8 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 transform shadow-2xl bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse hover:from-red-600 hover:to-red-700 hover:scale-105"
                >
                  <span className="flex items-center gap-3">
                    <span className="animate-pulse">⏹️</span> עצור הקלטה
                  </span>
                </button>
              )}

              {/* הצג תמלול */}
              {userTranscript && (
                <div className={`p-4 rounded-xl border-2 ${
                  selectedAnswer === 0 
                    ? 'bg-green-50 border-green-300 text-green-800' 
                    : selectedAnswer === -1
                    ? 'bg-red-50 border-red-300 text-red-800'
                    : 'bg-blue-50 border-blue-300 text-blue-800'
                }`}>
                  <p className="font-bold mb-2">מה ששמעתי:</p>
                  <p className="text-xl">{userTranscript}</p>
                </div>
              )}

              {/* הצג פידבק */}
              {selectedAnswer !== null && (
                <div className={`p-6 rounded-2xl border-4 ${
                  selectedAnswer === 0
                    ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400'
                    : 'bg-gradient-to-br from-red-100 to-pink-100 border-red-400'
                }`}>
                  <div className="text-center">
                    <p className="text-4xl mb-2">
                      {selectedAnswer === 0 ? '✅' : '❌'}
                    </p>
                    <p className="text-2xl font-bold mb-2">
                      {selectedAnswer === 0 ? 'כל הכבוד! אמרת נכון!' : 'לא נכון. נסה שוב!'}
                    </p>
                    <p className="text-lg text-gray-700">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              )}

              {/* הצג הקלטה */}
              {audioUrl && (
                <div className="w-full">
                  <p className="text-sm text-gray-600 mb-2">ההקלטה שלך:</p>
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="relative">
              <button
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`p-6 rounded-2xl font-bold text-xl transition-all duration-300 transform w-full ${
                selectedAnswer === null
                  ? 'bg-gradient-to-br from-blue-100 to-purple-100 text-purple-800 hover:from-blue-200 hover:to-purple-200 hover:scale-105 hover:shadow-xl border-2 border-blue-200'
                  : index === currentQuestion.correct
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-800 border-4 border-green-400 shadow-2xl scale-105'
                  : index === selectedAnswer
                  ? 'bg-gradient-to-br from-red-100 to-pink-100 text-red-800 border-4 border-red-400 shadow-lg'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border-2 border-gray-200'
              } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'} shadow-lg hover:shadow-2xl`}
            >
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-3">
                  {selectedAnswer === null ? '🔘' :
                   index === currentQuestion.correct ? '✅' :
                   index === selectedAnswer ? '❌' : '⚪'}
                </span>
                {option}
              </div>
            </button>
            {currentQuestion.text.includes('🔊') && option.includes(' - ') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const word = option.split(' - ')[1];
                  if (word) {
                    speakWord(word);
                  }
                }}
                className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="האזן למילה"
              >
                🔊
              </button>
            )}
          </div>
          ))}
        </div>
        )}

        {/* הצג הסבר רק לשאלות שאינן repeat (כי repeat כבר מציגות הסבר משלהן) */}
        {showExplanation && currentQuestion.category !== 'repeat' && (
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-lg">
            <div className="flex items-start">
              <div className="text-3xl mr-4">
                {selectedAnswer === currentQuestion.correct ? '🎉' : '💡'}
              </div>
              <div className="flex-1">
                <p className="font-bold text-blue-800 mb-2 text-lg">
                  {selectedAnswer === currentQuestion.correct ? 'מעולה! נכון!' : 'לא נכון, אבל למדת משהו חדש!'}
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-blue-700 text-base leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                  {currentQuestion.text.includes('🔊') && currentQuestion.explanation.includes('מילה') && (
                    <button
                      onClick={() => {
                        const word = currentQuestion.explanation.match(/מילה (\w+)/)?.[1];
                        if (word) {
                          speakWord(word);
                        }
                      }}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      title="האזן למילה"
                    >
                      🔊
                    </button>
                  )}
                </div>
                
                {/* כפתור השאלה הבאה */}
                <div className="mt-6 text-center">
                  <button
                    onClick={goToNextQuestion}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ➡️ השאלה הבאה
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* כפתור השאלה הבאה לשאלות repeat (אחרי שהפידבק מוצג) */}
        {showExplanation && currentQuestion.category === 'repeat' && selectedAnswer !== null && (
          <div className="mt-6 text-center">
            <button
              onClick={goToNextQuestion}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ➡️ השאלה הבאה
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl shadow-xl p-6 text-center border-2 border-green-200">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {gameProgress.correctAnswers}
          </div>
          <div className="text-sm text-green-700 font-medium">תשובות נכונות</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl shadow-xl p-6 text-center border-2 border-blue-200">
          <div className="text-4xl mb-2">📝</div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {gameProgress.questionsAnswered}
          </div>
          <div className="text-sm text-blue-700 font-medium">שאלות שנענו</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-xl p-6 text-center border-2 border-purple-200">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {gameProgress.questionsAnswered > 0 
              ? Math.round((gameProgress.correctAnswers / gameProgress.questionsAnswered) * 100)
              : 0}%
          </div>
          <div className="text-sm text-purple-700 font-medium">אחוז דיוק</div>
        </div>
      </div>
    </div>
  );
}

export default function ClassroomStudentPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ClassroomStudentPage />
    </Suspense>
  );
}
