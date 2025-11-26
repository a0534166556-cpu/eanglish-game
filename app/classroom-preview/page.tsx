'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// העתק את מאגר השאלות מהדף של התלמיד
const QUESTIONS_BY_GRADE: { [key: string]: any[] } = {
  '1': [ // כיתה א' - מתחילים - מילים בסיסיות ביותר + צלילים ואותיות (60 שאלות)
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
    
    // בעלי חיים
    { id: 24, text: "איזה בעל חיים אומר 'meow'?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 1, explanation: "חתול אומר 'meow'", category: "animals" },
    { id: 25, text: "איזה בעל חיים נובח?", options: ["Cat", "Dog", "Pig", "Duck"], correct: 1, explanation: "כלב נובח", category: "animals" },
    { id: 26, text: "איזה בעל חיים אומר 'moo'?", options: ["Cat", "Dog", "Cow", "Bird"], correct: 2, explanation: "פרה אומרת 'moo'", category: "animals" },
    { id: 27, text: "איזה בעל חיים יכול לעוף?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 3, explanation: "ציפור יכולה לעוף", category: "animals" },
    { id: 28, text: "איזה בעל חיים שוחה במים?", options: ["Cat", "Dog", "Fish", "Bird"], correct: 2, explanation: "דג שוחה במים", category: "animals" },
    { id: 29, text: "איזה בעל חיים אוכל גזר?", options: ["Dog", "Cat", "Rabbit", "Bird"], correct: 2, explanation: "ארנב אוכל גזר", category: "animals" },
    { id: 30, text: "איזה בעל חיים גדול מאוד?", options: ["Mouse", "Cat", "Elephant", "Bird"], correct: 2, explanation: "פיל הוא גדול מאוד", category: "animals" },
    { id: 31, text: "איזה בעל חיים קטן מאוד?", options: ["Dog", "Cat", "Mouse", "Cow"], correct: 2, explanation: "עכבר הוא קטן מאוד", category: "animals" },
    
    // צבעים
    { id: 32, text: "איזה צבע לשמים?", options: ["Green", "Blue", "Red", "Yellow"], correct: 1, explanation: "השמים כחולים", category: "colors" },
    { id: 33, text: "איזה צבע לדשא?", options: ["Blue", "Green", "Red", "Yellow"], correct: 1, explanation: "הדשא ירוק", category: "colors" },
    { id: 34, text: "איזה צבע לשמש?", options: ["Blue", "Green", "Yellow", "Purple"], correct: 2, explanation: "השמש צהובה", category: "colors" },
    { id: 35, text: "איזה צבע לשלג?", options: ["Black", "White", "Red", "Green"], correct: 1, explanation: "השלג לבן", category: "colors" },
    { id: 36, text: "איזה צבע לתפוח?", options: ["Blue", "Green", "Red", "Black"], correct: 2, explanation: "התפוח אדום", category: "colors" },
    { id: 37, text: "איזה צבע לבננה?", options: ["Blue", "Green", "Yellow", "Black"], correct: 2, explanation: "הבננה צהובה", category: "colors" },
    { id: 38, text: "איזה צבע לתפוז?", options: ["Blue", "Orange", "Yellow", "Black"], correct: 1, explanation: "התפוז כתום", category: "colors" },
    { id: 39, text: "איזה צבע לענבים?", options: ["Purple", "Green", "Yellow", "Black"], correct: 0, explanation: "הענבים סגולים", category: "colors" },
    
    // מספרים
    { id: 40, text: "כמה עיניים יש לך?", options: ["One", "Two", "Three", "Four"], correct: 1, explanation: "יש לך שתי עיניים", category: "numbers" },
    { id: 41, text: "כמה ידיים יש לך?", options: ["One", "Two", "Three", "Four"], correct: 1, explanation: "יש לך שתי ידיים", category: "numbers" },
    { id: 42, text: "כמה רגליים יש לכלב?", options: ["Two", "Three", "Four", "Five"], correct: 2, explanation: "לכלב יש ארבע רגליים", category: "numbers" },
    { id: 43, text: "כמה אצבעות יש לך?", options: ["Five", "Ten", "Fifteen", "Twenty"], correct: 1, explanation: "יש לך עשר אצבעות", category: "numbers" },
    { id: 44, text: "כמה ימים יש בשבוע?", options: ["Five", "Six", "Seven", "Eight"], correct: 2, explanation: "יש שבעה ימים בשבוע", category: "numbers" },
    
    // חלקי גוף
    { id: 45, text: "במה אתה משתמש כדי לראות?", options: ["Eyes", "Nose", "Mouth", "Ears"], correct: 0, explanation: "אתה משתמש בעיניים כדי לראות", category: "body" },
    { id: 46, text: "במה אתה משתמש כדי לשמוע?", options: ["Eyes", "Nose", "Mouth", "Ears"], correct: 3, explanation: "אתה משתמש באוזניים כדי לשמוע", category: "body" },
    { id: 47, text: "במה אתה משתמש כדי לאכול?", options: ["Eyes", "Nose", "Mouth", "Ears"], correct: 2, explanation: "אתה משתמש בפה כדי לאכול", category: "body" },
    { id: 48, text: "במה אתה משתמש כדי ללכת?", options: ["Hands", "Feet", "Eyes", "Mouth"], correct: 1, explanation: "אתה משתמש ברגליים כדי ללכת", category: "body" },
    { id: 49, text: "במה אתה משתמש כדי להריח?", options: ["Eyes", "Nose", "Mouth", "Ears"], correct: 1, explanation: "אתה משתמש באף כדי להריח", category: "body" },
    
    // בית
    { id: 50, text: "איפה אתה ישן?", options: ["Kitchen", "Bed", "Bathroom", "Garden"], correct: 1, explanation: "אתה ישן במיטה", category: "home" },
    { id: 51, text: "איפה אתה מבשל?", options: ["Kitchen", "Bedroom", "Bathroom", "Garden"], correct: 0, explanation: "אתה מבשל במטבח", category: "home" },
    { id: 52, text: "על מה אתה יושב?", options: ["Table", "Chair", "Bed", "Floor"], correct: 1, explanation: "אתה יושב על כסא", category: "home" },
    { id: 53, text: "מה אתה קורא?", options: ["Book", "Table", "Chair", "Window"], correct: 0, explanation: "אתה קורא ספר", category: "home" },
    { id: 54, text: "איפה אתה רוחץ ידיים?", options: ["Kitchen", "Bathroom", "Bedroom", "Garden"], correct: 1, explanation: "אתה רוחץ ידיים בחדר האמבטיה", category: "home" },
    
    // בית ספר
    { id: 55, text: "איפה אתה לומד?", options: ["School", "Home", "Park", "Shop"], correct: 0, explanation: "אתה לומד בבית הספר", category: "school" },
    { id: 56, text: "מי מלמד אותך?", options: ["Student", "Teacher", "Friend", "Parent"], correct: 1, explanation: "המורה מלמד אותך", category: "school" },
    { id: 57, text: "במה אתה כותב?", options: ["Book", "Pencil", "Table", "Chair"], correct: 1, explanation: "אתה כותב בעיפרון", category: "school" },
    { id: 58, text: "על מה אתה כותב?", options: ["Pencil", "Paper", "Chair", "Table"], correct: 1, explanation: "אתה כותב על נייר", category: "school" },
    
    // אוכל
    { id: 59, text: "איזה פרי אדום?", options: ["Banana", "Apple", "Orange", "Grape"], correct: 1, explanation: "התפוח אדום", category: "food" },
    { id: 60, text: "איזה פרי צהוב?", options: ["Apple", "Banana", "Grape", "Cherry"], correct: 1, explanation: "הבננה צהובה", category: "food" },
    { id: 61, text: "איזה פרי כתום?", options: ["Apple", "Banana", "Orange", "Cherry"], correct: 2, explanation: "התפוז כתום", category: "food" },
    { id: 62, text: "מה אתה שותה כשיש לך צמא?", options: ["Bread", "Water", "Cake", "Meat"], correct: 1, explanation: "אתה שותה מים כשיש לך צמא", category: "food" },
    { id: 63, text: "מה אתה אוכל כשיש לך רעב?", options: ["Food", "Water", "Air", "Nothing"], correct: 0, explanation: "אתה אוכל אוכל כשיש לך רעב", category: "food" },
    
    // פעלים פשוטים
    { id: 64, text: "מה אתה עושה עם ספר?", options: ["Eat", "Read", "Drink", "Fly"], correct: 1, explanation: "אתה קורא ספר", category: "verbs" },
    { id: 65, text: "מה אתה עושה עם אוכל?", options: ["Eat", "Read", "Write", "Fly"], correct: 0, explanation: "אתה אוכל אוכל", category: "verbs" },
    { id: 66, text: "מה אתה עושה עם מים?", options: ["Eat", "Read", "Drink", "Fly"], correct: 2, explanation: "אתה שותה מים", category: "verbs" },
    { id: 67, text: "מה ציפור יכולה לעשות?", options: ["Eat", "Read", "Drink", "Fly"], correct: 3, explanation: "ציפור יכולה לעוף", category: "verbs" },
    
    // שאלות חזרה - הקריין אומר והתלמיד חוזר
    { id: 68, text: "🔊 חזור אחרי הקריין: Cat", options: ["Cat", "Dog", "Fish", "Bird"], correct: 0, explanation: "Cat - חתול", category: "repeat" },
    { id: 69, text: "🔊 חזור אחרי הקריין: Dog", options: ["Dog", "Cat", "Fish", "Bird"], correct: 0, explanation: "Dog - כלב", category: "repeat" },
    { id: 70, text: "🔊 חזור אחרי הקריין: Fish", options: ["Fish", "Cat", "Dog", "Bird"], correct: 0, explanation: "Fish - דג", category: "repeat" },
    { id: 71, text: "🔊 חזור אחרי הקריין: Bird", options: ["Bird", "Cat", "Dog", "Fish"], correct: 0, explanation: "Bird - ציפור", category: "repeat" },
    { id: 72, text: "🔊 חזור אחרי הקריין: Red", options: ["Red", "Blue", "Green", "Yellow"], correct: 0, explanation: "Red - אדום", category: "repeat" },
    { id: 73, text: "🔊 חזור אחרי הקריין: Blue", options: ["Blue", "Red", "Green", "Yellow"], correct: 0, explanation: "Blue - כחול", category: "repeat" },
    { id: 74, text: "🔊 חזור אחרי הקריין: Green", options: ["Green", "Red", "Blue", "Yellow"], correct: 0, explanation: "Green - ירוק", category: "repeat" },
    { id: 75, text: "🔊 חזור אחרי הקריין: Yellow", options: ["Yellow", "Red", "Blue", "Green"], correct: 0, explanation: "Yellow - צהוב", category: "repeat" },
    { id: 76, text: "🔊 חזור אחרי הקריין: One", options: ["One", "Two", "Three", "Four"], correct: 0, explanation: "One - אחד", category: "repeat" },
    { id: 77, text: "🔊 חזור אחרי הקריין: Two", options: ["Two", "One", "Three", "Four"], correct: 0, explanation: "Two - שניים", category: "repeat" },
    { id: 78, text: "🔊 חזור אחרי הקריין: Three", options: ["Three", "One", "Two", "Four"], correct: 0, explanation: "Three - שלושה", category: "repeat" },
    { id: 79, text: "🔊 חזור אחרי הקריין: Four", options: ["Four", "One", "Two", "Three"], correct: 0, explanation: "Four - ארבעה", category: "repeat" },
    { id: 80, text: "🔊 חזור אחרי הקריין: Five", options: ["Five", "One", "Two", "Three"], correct: 0, explanation: "Five - חמישה", category: "repeat" }
  ],
  '2': [ // כיתה ב' - בסיסי - מילים פשוטות + קריאה (60 שאלות)
    // מילים מתקדמות יותר (עירבוב עברית ואנגלית)
    { id: 61, text: "What animal says 'meow'? 🐱", options: ["Dog", "Cat", "Cow", "Bird"], correct: 1, explanation: "Cat says 'meow'", category: "animals" },
    { id: 62, text: "What animal barks? 🐶", options: ["Cat", "Dog", "Cow", "Bird"], correct: 1, explanation: "Dog barks", category: "animals" },
    { id: 63, text: "What color is blood? 🔴", options: ["Blue", "Green", "Red", "Yellow"], correct: 2, explanation: "Blood is red", category: "colors" },
    { id: 64, text: "What color is the ocean? 🌊", options: ["Blue", "Green", "Red", "Yellow"], correct: 0, explanation: "The ocean is blue", category: "colors" },
    { id: 65, text: "Which word rhymes with 'cat'?", options: ["Dog", "Hat", "Sun", "Ball"], correct: 1, explanation: "Cat and Hat rhyme", category: "sounds" },
    { id: 66, text: "Which word rhymes with 'dog'?", options: ["Cat", "Hat", "Frog", "Ball"], correct: 2, explanation: "Dog and Frog rhyme", category: "sounds" },
    { id: 67, text: "What is this? ☀️", options: ["Moon", "Sun", "Star", "Cloud"], correct: 1, explanation: "This is the sun", category: "words" },
    { id: 68, text: "What do you read? 📖", options: ["Pen", "Book", "Table", "Chair"], correct: 1, explanation: "You read a book", category: "words" },
    { id: 69, text: "What do you play with? ⚽", options: ["Doll", "Ball", "Car", "House"], correct: 1, explanation: "You play with a ball", category: "words" },
    { id: 70, text: "What grows tall? 🌳", options: ["Flower", "Tree", "Grass", "Rock"], correct: 1, explanation: "A tree grows tall", category: "words" },
    
    // בעלי חיים - שאלות יותר מתקדמות
    { id: 71, text: "Which animal can fly?", options: ["Fish", "Bird", "Cow", "Dog"], correct: 1, explanation: "A bird can fly", category: "animals" },
    { id: 72, text: "Which animal lives in water?", options: ["Cat", "Dog", "Fish", "Bird"], correct: 2, explanation: "A fish lives in water", category: "animals" },
    { id: 73, text: "Which animal gives us milk?", options: ["Dog", "Cat", "Cow", "Bird"], correct: 2, explanation: "A cow gives us milk", category: "animals" },
    { id: 74, text: "Which animal has a long neck?", options: ["Dog", "Cat", "Giraffe", "Bird"], correct: 2, explanation: "A giraffe has a long neck", category: "animals" },
    { id: 75, text: "Which animal is very big?", options: ["Mouse", "Cat", "Elephant", "Bird"], correct: 2, explanation: "An elephant is very big", category: "animals" },
    
    // אוכל - שאלות יותר מתקדמות
    { id: 76, text: "What food is made from flour?", options: ["Bread", "Milk", "Egg", "Apple"], correct: 0, explanation: "Bread is made from flour", category: "food" },
    { id: 77, text: "Which is a vegetable?", options: ["Carrot", "Banana", "Apple", "Orange"], correct: 0, explanation: "A carrot is a vegetable", category: "food" },
    { id: 78, text: "Which drink is white?", options: ["Orange juice", "Milk", "Apple juice", "Water"], correct: 1, explanation: "Milk is white", category: "food" },
    { id: 79, text: "Which fruit is yellow and long?", options: ["Apple", "Banana", "Orange", "Grape"], correct: 1, explanation: "A banana is yellow and long", category: "food" },
    { id: 80, text: "What do you drink when you're thirsty?", options: ["Bread", "Water", "Cake", "Meat"], correct: 1, explanation: "You drink water when you're thirsty", category: "food" },
    
    // תחבורה - שאלות יותר מתקדמות
    { id: 81, text: "What has four wheels?", options: ["Bicycle", "Car", "Train", "Plane"], correct: 1, explanation: "A car has four wheels", category: "transport" },
    { id: 82, text: "What flies in the sky?", options: ["Car", "Bus", "Plane", "Bicycle"], correct: 2, explanation: "A plane flies in the sky", category: "transport" },
    { id: 83, text: "What has two wheels?", options: ["Car", "Bus", "Bicycle", "Train"], correct: 2, explanation: "A bicycle has two wheels", category: "transport" },
    { id: 84, text: "What goes on rails?", options: ["Car", "Bus", "Bicycle", "Train"], correct: 3, explanation: "A train goes on rails", category: "transport" },
    { id: 85, text: "What carries many people?", options: ["Car", "Bus", "Bicycle", "Motorcycle"], correct: 1, explanation: "A bus carries many people", category: "transport" },
    
    // בגדים - שאלות יותר מתקדמות
    { id: 86, text: "What do you wear on your head?", options: ["Hat", "Shoes", "Pants", "Shirt"], correct: 0, explanation: "You wear a hat on your head", category: "clothes" },
    { id: 87, text: "What do you wear on your feet?", options: ["Hat", "Shoes", "Pants", "Shirt"], correct: 1, explanation: "You wear shoes on your feet", category: "clothes" },
    { id: 88, text: "What do you wear when it's cold?", options: ["Swimsuit", "Coat", "Shorts", "Sandals"], correct: 1, explanation: "You wear a coat when it's cold", category: "clothes" },
    { id: 89, text: "What do you wear to bed?", options: ["Suit", "Pajamas", "Dress", "Uniform"], correct: 1, explanation: "You wear pajamas to bed", category: "clothes" },
    { id: 90, text: "What do you wear to school?", options: ["Pajamas", "Uniform", "Swimsuit", "Coat"], correct: 1, explanation: "You wear a uniform to school", category: "clothes" },
    
    // בית - שאלות יותר מתקדמות
    { id: 91, text: "Where do you wash your hands?", options: ["Kitchen", "Bathroom", "Bedroom", "Garden"], correct: 1, explanation: "You wash your hands in the bathroom", category: "home" },
    { id: 92, text: "Where do you eat?", options: ["Bathroom", "Kitchen", "Bedroom", "Garden"], correct: 1, explanation: "You eat in the kitchen", category: "home" },
    { id: 93, text: "Where do you brush your teeth?", options: ["Kitchen", "Bathroom", "Bedroom", "Garden"], correct: 1, explanation: "You brush your teeth in the bathroom", category: "home" },
    
    // בית ספר - שאלות יותר מתקדמות
    { id: 94, text: "What do you write on?", options: ["Pencil", "Paper", "Book", "Table"], correct: 1, explanation: "You write on paper", category: "school" },
    { id: 95, text: "What tells you the time?", options: ["Book", "Pencil", "Clock", "Chair"], correct: 2, explanation: "A clock tells you the time", category: "school" },
    { id: 96, text: "What do you use to cut paper?", options: ["Pencil", "Scissors", "Book", "Chair"], correct: 1, explanation: "You use scissors to cut paper", category: "school" },
    { id: 97, text: "What do you use to draw?", options: ["Scissors", "Crayon", "Book", "Chair"], correct: 1, explanation: "You use a crayon to draw", category: "school" },
    
    // מספרים - שאלות יותר מתקדמות
    { id: 98, text: "How many fingers do you have?", options: ["Five", "Ten", "Fifteen", "Twenty"], correct: 1, explanation: "You have ten fingers", category: "numbers" },
    { id: 99, text: "How many days in a week?", options: ["Five", "Six", "Seven", "Eight"], correct: 2, explanation: "There are seven days in a week", category: "numbers" },
    
    // פעלים - שאלות יותר מתקדמות
    { id: 100, text: "What do you do with a pencil?", options: ["Eat", "Write", "Drink", "Fly"], correct: 1, explanation: "You write with a pencil", category: "verbs" },
    { id: 101, text: "What do you do with scissors?", options: ["Eat", "Write", "Cut", "Fly"], correct: 2, explanation: "You cut with scissors", category: "verbs" },
    { id: 102, text: "What do you do with a ball?", options: ["Eat", "Write", "Play", "Sleep"], correct: 2, explanation: "You play with a ball", category: "verbs" },
    { id: 103, text: "What do you do in bed?", options: ["Eat", "Write", "Play", "Sleep"], correct: 3, explanation: "You sleep in bed", category: "verbs" },
    { id: 104, text: "What do you do with a book?", options: ["Eat", "Read", "Cut", "Sleep"], correct: 1, explanation: "You read a book", category: "verbs" },
    
    // שאלות אנגלית מתקדמות יותר לכיתה ב'
    { id: 105, text: "Complete: I ___ happy", options: ["am", "is", "are", "be"], correct: 0, explanation: "I am happy", category: "grammar" },
    { id: 106, text: "Complete: She ___ tall", options: ["am", "is", "are", "be"], correct: 1, explanation: "She is tall", category: "grammar" },
    { id: 107, text: "Complete: They ___ playing", options: ["am", "is", "are", "be"], correct: 2, explanation: "They are playing", category: "grammar" },
    { id: 108, text: "What is the opposite of 'big'?", options: ["Large", "Small", "Huge", "Giant"], correct: 1, explanation: "The opposite of 'big' is 'small'", category: "vocabulary" },
    { id: 109, text: "What is the opposite of 'hot'?", options: ["Warm", "Cold", "Cool", "Fire"], correct: 1, explanation: "The opposite of 'hot' is 'cold'", category: "vocabulary" },
    { id: 110, text: "True or False: A cat can fly", options: ["True", "False"], correct: 1, explanation: "False - A cat cannot fly", category: "true_false" },
    { id: 111, text: "True or False: The sun is yellow", options: ["True", "False"], correct: 0, explanation: "True - The sun is yellow", category: "true_false" },
    { id: 112, text: "True or False: Fish can swim", options: ["True", "False"], correct: 0, explanation: "True - Fish can swim", category: "true_false" },
    { id: 113, text: "What do you call a baby dog?", options: ["Puppy", "Kitten", "Chick", "Cub"], correct: 0, explanation: "A baby dog is called a puppy", category: "vocabulary" },
    { id: 114, text: "What do you call a baby cat?", options: ["Puppy", "Kitten", "Chick", "Cub"], correct: 1, explanation: "A baby cat is called a kitten", category: "vocabulary" },
    { id: 115, text: "Which is bigger: elephant or mouse?", options: ["Elephant", "Mouse", "Same size", "Don't know"], correct: 0, explanation: "Elephant is much bigger than mouse", category: "comparison" },
    { id: 116, text: "Which is smaller: bird or airplane?", options: ["Bird", "Airplane", "Same size", "Don't know"], correct: 0, explanation: "Bird is smaller than airplane", category: "comparison" },
    { id: 117, text: "How do you say 'שלום' in English?", options: ["Goodbye", "Hello", "Thank you", "Please"], correct: 1, explanation: "'שלום' means 'Hello' in English", category: "translation" },
    { id: 118, text: "How do you say 'תודה' in English?", options: ["Goodbye", "Hello", "Thank you", "Please"], correct: 2, explanation: "'תודה' means 'Thank you' in English", category: "translation" },
    { id: 119, text: "What comes after Monday?", options: ["Sunday", "Tuesday", "Wednesday", "Thursday"], correct: 1, explanation: "Tuesday comes after Monday", category: "days" },
    { id: 120, text: "What comes after Wednesday?", options: ["Monday", "Tuesday", "Thursday", "Friday"], correct: 2, explanation: "Thursday comes after Wednesday", category: "days" },
    { id: 121, text: "Which season comes after winter?", options: ["Summer", "Spring", "Fall", "Rain"], correct: 1, explanation: "Spring comes after winter", category: "seasons" },
    { id: 122, text: "Which season comes after spring?", options: ["Winter", "Summer", "Fall", "Rain"], correct: 1, explanation: "Summer comes after spring", category: "seasons" },
    { id: 123, text: "What do you wear on your head in winter?", options: ["Hat", "Shoes", "Gloves", "Shorts"], correct: 0, explanation: "You wear a hat on your head in winter", category: "clothes" },
    { id: 124, text: "What do you wear on your hands in winter?", options: ["Hat", "Shoes", "Gloves", "Shorts"], correct: 2, explanation: "You wear gloves on your hands in winter", category: "clothes" }
  ],
  '3': [ // כיתה ג' - מתקדמים - משפחה, מזג אוויר, דקדוק בסיסי (60 שאלות)
    // משפחה - שאלות יותר מתקדמות
    { id: 125, text: "Who is your mother's mother?", options: ["Aunt", "Grandmother", "Sister", "Cousin"], correct: 1, explanation: "Your mother's mother is your grandmother", category: "family" },
    { id: 126, text: "Who is your father's son?", options: ["Brother", "Uncle", "Cousin", "Nephew"], correct: 0, explanation: "Your father's son is your brother", category: "family" },
    { id: 127, text: "Who is your uncle's daughter?", options: ["Sister", "Cousin", "Aunt", "Niece"], correct: 1, explanation: "Your uncle's daughter is your cousin", category: "family" },
    { id: 128, text: "Who is your brother's wife?", options: ["Aunt", "Sister", "Sister-in-law", "Mother"], correct: 2, explanation: "Your brother's wife is your sister-in-law", category: "family" },
    { id: 129, text: "Who is your mother's brother?", options: ["Uncle", "Cousin", "Nephew", "Father"], correct: 0, explanation: "Your mother's brother is your uncle", category: "family" },
    { id: 130, text: "Who is your parents' daughter?", options: ["Sister", "Aunt", "Cousin", "Niece"], correct: 0, explanation: "Your parents' daughter is your sister", category: "family" },
    { id: 131, text: "Who is your uncle's son?", options: ["Brother", "Cousin", "Nephew", "Son"], correct: 1, explanation: "Your uncle's son is your cousin", category: "family" },
    { id: 132, text: "Who is your father's brother?", options: ["Uncle", "Cousin", "Nephew", "Grandfather"], correct: 0, explanation: "Your father's brother is your uncle", category: "family" },
    { id: 133, text: "Who is your mother's sister?", options: ["Uncle", "Aunt", "Cousin", "Grandmother"], correct: 1, explanation: "Your mother's sister is your aunt", category: "family" },
    { id: 134, text: "Who is your brother's son?", options: ["Nephew", "Cousin", "Uncle", "Son"], correct: 0, explanation: "Your brother's son is your nephew", category: "family" },
    { id: 135, text: "Who is your sister's daughter?", options: ["Nephew", "Niece", "Cousin", "Daughter"], correct: 1, explanation: "Your sister's daughter is your niece", category: "family" },
    
    // מזג אוויר - שאלות יותר מתקדמות
    { id: 136, text: "What falls from the sky in winter?", options: ["Rain", "Snow", "Sunshine", "Wind"], correct: 1, explanation: "Snow falls from the sky in winter", category: "weather" },
    { id: 137, text: "What makes everything wet?", options: ["Wind", "Snow", "Rain", "Sunshine"], correct: 2, explanation: "Rain makes everything wet", category: "weather" },
    { id: 138, text: "What makes trees move?", options: ["Rain", "Snow", "Wind", "Sunshine"], correct: 2, explanation: "Wind makes trees move", category: "weather" },
    { id: 139, text: "What makes you warm?", options: ["Rain", "Snow", "Wind", "Sunshine"], correct: 3, explanation: "Sunshine makes you warm", category: "weather" },
    { id: 140, text: "What season comes after winter?", options: ["Summer", "Spring", "Fall", "Rain"], correct: 1, explanation: "Spring comes after winter", category: "weather" },
    { id: 141, text: "What season comes after summer?", options: ["Winter", "Spring", "Fall", "Rain"], correct: 2, explanation: "Fall comes after summer", category: "weather" },
    { id: 142, text: "When is it very hot?", options: ["Winter", "Spring", "Summer", "Fall"], correct: 2, explanation: "It is very hot in summer", category: "weather" },
    { id: 143, text: "When is it very cold?", options: ["Winter", "Spring", "Summer", "Fall"], correct: 0, explanation: "It is very cold in winter", category: "weather" },
    { id: 144, text: "When do flowers bloom?", options: ["Winter", "Spring", "Summer", "Fall"], correct: 1, explanation: "Flowers bloom in spring", category: "weather" },
    { id: 145, text: "When do leaves fall?", options: ["Winter", "Spring", "Summer", "Fall"], correct: 3, explanation: "Leaves fall in fall", category: "weather" },
    
    // דקדוק בסיסי - שאלות יותר מתקדמות
    { id: 146, text: "Which is correct: 'I ___ happy'?", options: ["am", "is", "are", "be"], correct: 0, explanation: "I am happy", category: "grammar" },
    { id: 147, text: "Which is correct: 'She ___ a book'?", options: ["read", "reads", "reading", "readed"], correct: 1, explanation: "She reads a book", category: "grammar" },
    { id: 148, text: "Which is correct: 'They ___ playing'?", options: ["am", "is", "are", "be"], correct: 2, explanation: "They are playing", category: "grammar" },
    { id: 149, text: "Which is correct: 'He ___ to school'?", options: ["go", "goes", "going", "goed"], correct: 1, explanation: "He goes to school", category: "grammar" },
    { id: 150, text: "Which is correct: 'We ___ friends'?", options: ["am", "is", "are", "be"], correct: 2, explanation: "We are friends", category: "grammar" },
    { id: 151, text: "Which is correct: 'He ___ tall'?", options: ["am", "is", "are", "be"], correct: 1, explanation: "He is tall", category: "grammar" },
    { id: 152, text: "Which is correct: 'We ___ students'?", options: ["am", "is", "are", "be"], correct: 2, explanation: "We are students", category: "grammar" },
    { id: 153, text: "Which is correct: 'You ___ nice'?", options: ["am", "is", "are", "be"], correct: 2, explanation: "You are nice", category: "grammar" },
    { id: 154, text: "Which is correct: 'It ___ cold'?", options: ["am", "is", "are", "be"], correct: 1, explanation: "It is cold", category: "grammar" },
    { id: 155, text: "Which is correct: 'She ___ a doctor'?", options: ["am", "is", "are", "be"], correct: 1, explanation: "She is a doctor", category: "grammar" },
    { id: 156, text: "Which is correct: 'The cat ___ small'?", options: ["am", "is", "are", "be"], correct: 1, explanation: "The cat is small", category: "grammar" },
    
    // אוצר מילים - הפכים - שאלות יותר מתקדמות
    { id: 157, text: "What is the opposite of 'big'?", options: ["Large", "Small", "Huge", "Giant"], correct: 1, explanation: "The opposite of 'big' is 'small'", category: "vocabulary" },
    { id: 158, text: "What is the opposite of 'hot'?", options: ["Warm", "Cold", "Cool", "Fire"], correct: 1, explanation: "The opposite of 'hot' is 'cold'", category: "vocabulary" },
    { id: 159, text: "What is the opposite of 'happy'?", options: ["Sad", "Angry", "Tired", "Hungry"], correct: 0, explanation: "The opposite of 'happy' is 'sad'", category: "vocabulary" },
    { id: 160, text: "What is the opposite of 'fast'?", options: ["Slow", "Quick", "Fast", "Speed"], correct: 0, explanation: "The opposite of 'fast' is 'slow'", category: "vocabulary" },
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
    
    // שאלות חזרה - הקריין אומר והתלמיד חוזר (כיתה ג')
    { id: 205, text: "🔊 חזור אחרי הקריין: Hello", options: ["Hello", "Hi", "Goodbye", "Thanks"], correct: 0, explanation: "Hello - שלום", category: "repeat" },
    { id: 206, text: "🔊 חזור אחרי הקריין: Goodbye", options: ["Goodbye", "Hello", "Hi", "Thanks"], correct: 0, explanation: "Goodbye - להתראות", category: "repeat" },
    { id: 207, text: "🔊 חזור אחרי הקריין: Please", options: ["Please", "Thanks", "Sorry", "Hello"], correct: 0, explanation: "Please - בבקשה", category: "repeat" },
    { id: 208, text: "🔊 חזור אחרי הקריין: Thank you", options: ["Thank you", "Please", "Sorry", "Hello"], correct: 0, explanation: "Thank you - תודה", category: "repeat" },
    { id: 209, text: "🔊 חזור אחרי הקריין: Sorry", options: ["Sorry", "Please", "Thanks", "Hello"], correct: 0, explanation: "Sorry - סליחה", category: "repeat" },
    { id: 210, text: "🔊 חזור אחרי הקריין: Yes", options: ["Yes", "No", "Maybe", "Sure"], correct: 0, explanation: "Yes - כן", category: "repeat" },
    { id: 211, text: "🔊 חזור אחרי הקריין: No", options: ["No", "Yes", "Maybe", "Sure"], correct: 0, explanation: "No - לא", category: "repeat" },
    { id: 212, text: "🔊 חזור אחרי הקריין: Maybe", options: ["Maybe", "Yes", "No", "Sure"], correct: 0, explanation: "Maybe - אולי", category: "repeat" },
    { id: 213, text: "🔊 חזור אחרי הקריין: Sure", options: ["Sure", "Yes", "No", "Maybe"], correct: 0, explanation: "Sure - בטוח", category: "repeat" },
    { id: 214, text: "🔊 חזור אחרי הקריין: Excuse me", options: ["Excuse me", "Sorry", "Please", "Thanks"], correct: 0, explanation: "Excuse me - סליחה", category: "repeat" },
    { id: 215, text: "🔊 חזור אחרי הקריין: You're welcome", options: ["You're welcome", "Thank you", "Sorry", "Please"], correct: 0, explanation: "You're welcome - בבקשה", category: "repeat" }
  ],
  '4': [ // כיתה ד' - בינוני - משפטים, הבנת הנקרא, דקדוק (60 שאלות)
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
    { id: 336, text: "What is the opposite of 'on'?", options: ["Off", "Above", "Over", "Upon"], correct: 0, explanation: "The opposite of 'on' is 'off'", category: "vocabulary" },
    { id: 337, text: "What is the opposite of 'yes'?", options: ["No", "Maybe", "Sure", "Okay"], correct: 0, explanation: "The opposite of 'yes' is 'no'", category: "vocabulary" },
    { id: 338, text: "What is the opposite of 'true'?", options: ["False", "Right", "Correct", "Good"], correct: 0, explanation: "The opposite of 'true' is 'false'", category: "vocabulary" },
    { id: 339, text: "What is the opposite of 'right'?", options: ["Left", "Correct", "Good", "True"], correct: 0, explanation: "The opposite of 'right' is 'left'", category: "vocabulary" },
    
    // שאלות חזרה - הקריין אומר והתלמיד חוזר (כיתה ד')
    { id: 340, text: "🔊 חזור אחרי הקריין: Beautiful", options: ["Beautiful", "Ugly", "Nice", "Good"], correct: 0, explanation: "Beautiful - יפה", category: "repeat" },
    { id: 341, text: "🔊 חזור אחרי הקריין: Wonderful", options: ["Wonderful", "Bad", "Terrible", "Awful"], correct: 0, explanation: "Wonderful - נפלא", category: "repeat" },
    { id: 342, text: "🔊 חזור אחרי הקריין: Amazing", options: ["Amazing", "Boring", "Dull", "Stupid"], correct: 0, explanation: "Amazing - מדהים", category: "repeat" },
    { id: 343, text: "🔊 חזור אחרי הקריין: Fantastic", options: ["Fantastic", "Terrible", "Awful", "Bad"], correct: 0, explanation: "Fantastic - פנטסטי", category: "repeat" },
    { id: 344, text: "🔊 חזור אחרי הקריין: Excellent", options: ["Excellent", "Poor", "Bad", "Terrible"], correct: 0, explanation: "Excellent - מצוין", category: "repeat" },
    { id: 345, text: "🔊 חזור אחרי הקריין: Perfect", options: ["Perfect", "Imperfect", "Bad", "Wrong"], correct: 0, explanation: "Perfect - מושלם", category: "repeat" },
    { id: 346, text: "🔊 חזור אחרי הקריין: Great", options: ["Great", "Terrible", "Awful", "Bad"], correct: 0, explanation: "Great - נהדר", category: "repeat" },
    { id: 347, text: "🔊 חזור אחרי הקריין: Awesome", options: ["Awesome", "Terrible", "Awful", "Bad"], correct: 0, explanation: "Awesome - מדהים", category: "repeat" },
    { id: 348, text: "🔊 חזור אחרי הקריין: Brilliant", options: ["Brilliant", "Dull", "Stupid", "Foolish"], correct: 0, explanation: "Brilliant - מבריק", category: "repeat" },
    { id: 349, text: "🔊 חזור אחרי הקריין: Magnificent", options: ["Magnificent", "Terrible", "Awful", "Bad"], correct: 0, explanation: "Magnificent - מפואר", category: "repeat" },
    { id: 350, text: "🔊 חזור אחרי הקריין: Outstanding", options: ["Outstanding", "Poor", "Bad", "Terrible"], correct: 0, explanation: "Outstanding - מצוין", category: "repeat" },
    { id: 351, text: "🔊 חזור אחרי הקריין: Superb", options: ["Superb", "Terrible", "Awful", "Bad"], correct: 0, explanation: "Superb - מעולה", category: "repeat" },
    { id: 352, text: "🔊 חזור אחרי הקריין: Terrific", options: ["Terrific", "Terrible", "Awful", "Bad"], correct: 0, explanation: "Terrific - נפלא", category: "repeat" },
    { id: 353, text: "🔊 חזור אחרי הקריין: Incredible", options: ["Incredible", "Believable", "Normal", "Ordinary"], correct: 0, explanation: "Incredible - לא יאומן", category: "repeat" },
    { id: 354, text: "🔊 חזור אחרי הקריין: Unbelievable", options: ["Unbelievable", "Believable", "Normal", "Ordinary"], correct: 0, explanation: "Unbelievable - לא יאומן", category: "repeat" },
    { id: 355, text: "🔊 חזור אחרי הקריין: Extraordinary", options: ["Extraordinary", "Ordinary", "Normal", "Regular"], correct: 0, explanation: "Extraordinary - יוצא דופן", category: "repeat" },
    { id: 356, text: "🔊 חזור אחרי הקריין: Remarkable", options: ["Remarkable", "Ordinary", "Normal", "Regular"], correct: 0, explanation: "Remarkable - ראוי לציון", category: "repeat" },
    { id: 357, text: "🔊 חזור אחרי הקריין: Spectacular", options: ["Spectacular", "Ordinary", "Normal", "Regular"], correct: 0, explanation: "Spectacular - מרהיב", category: "repeat" },
    { id: 358, text: "🔊 חזור אחרי הקריין: Breathtaking", options: ["Breathtaking", "Ordinary", "Normal", "Regular"], correct: 0, explanation: "Breathtaking - עוצר נשימה", category: "repeat" },
    { id: 359, text: "🔊 חזור אחרי הקריין: Stunning", options: ["Stunning", "Ordinary", "Normal", "Regular"], correct: 0, explanation: "Stunning - מהמם", category: "repeat" },
    { id: 360, text: "🔊 חזור אחרי הקריין: Gorgeous", options: ["Gorgeous", "Ugly", "Plain", "Ordinary"], correct: 0, explanation: "Gorgeous - יפהפה", category: "repeat" }
  ],
  '5': [{ id: 1, text: "Sample question", options: ["A", "B", "C", "D"], correct: 0, explanation: "Explanation", category: "sample" }],
  '6': [{ id: 1, text: "Sample question", options: ["A", "B", "C", "D"], correct: 0, explanation: "Explanation", category: "sample" }],
  '7': [{ id: 1, text: "Sample question", options: ["A", "B", "C", "D"], correct: 0, explanation: "Explanation", category: "sample" }],
  '8': [{ id: 1, text: "Sample question", options: ["A", "B", "C", "D"], correct: 0, explanation: "Explanation", category: "sample" }]
};

export default function ClassroomPreviewPage() {
  const [selectedGrade, setSelectedGrade] = useState('1');
  const router = useRouter();

  const gradeNames: { [key: string]: string } = {
    '1': 'כיתה א\' - מתחילים',
    '2': 'כיתה ב\' - בסיסי',
    '3': 'כיתה ג\' - מתקדמים',
    '4': 'כיתה ד\' - בינוני',
    '5': 'כיתה ה\' - בינוני+',
    '6': 'כיתה ו\' - מתקדם',
    '7': 'כיתה ז\' - מתקדם+',
    '8': 'כיתה ח\' - מתקדם מאוד'
  };

  const gradeDescriptions: { [key: string]: string } = {
    '1': '60 שאלות בעברית: אותיות וצלילים, מילים בסיסיות, בעלי חיים, צבעים, מספרים, חלקי גוף, בית, בית ספר, אוכל, פעלים',
    '2': '60 שאלות מעורבות: קריאת מילים באנגלית, חריזה, בעלי חיים, אוכל, תחבורה, בגדים, פעלים, דקדוק בסיסי, אמת/שקר, השוואות, תרגום',
    '3': '60 שאלות באנגלית: משפחה, מזג אוויר, דקדוק בסיסי (am/is/are), הפכים, מקצועות, משפטים, זמנים, אוצר מילים, מקומות, תרגום',
    '4': '60 שאלות באנגלית: השלמת משפטים, הבנת הנקרא, מקומות, דקדוק מתקדם, זמנים, אוצר מילים רחב',
    '5': '60 שאלות באנגלית: דקדוק מתקדם (have/has, comparative), אוצר מילים רחב, מקצועות, מקומות, הבנת הנקרא מתקדמת',
    '6': '60 שאלות באנגלית: דקדוק מתקדם (conditional, passive), אוצר מילים מתקדם, מקצועות אקדמיים, הבנת הנקרא מורכבת',
    '7': '60 שאלות באנגלית: דקדוק מורכב (subjunctive, gerund), אוצר מילים מתקדם, מקצועות אקדמיים, הבנת הנקרא מתקדמת מאוד',
    '8': '60 שאלות באנגלית: דקדוק מורכב (conditional perfect), אוצר מילים מתקדם מאוד, מקצועות אקדמיים, הבנת הנקרא מתקדמת מאוד'
  };

  const questions = QUESTIONS_BY_GRADE[selectedGrade] || [];
  const categories = Array.from(new Set(questions.map((q: any) => q.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* כותרת */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                📚 תצוגה מקדימה - אוצר מילים ושאלות
              </h1>
              <p className="text-gray-600">
                צפייה באוצר המילים והשאלות לכל כיתה לפני יצירת המשחק
              </p>
            </div>
            <button
              onClick={() => router.push('/classroom-teacher')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              ← חזרה למורה
            </button>
          </div>

          {/* בחירת כיתה */}
          <div className="grid grid-cols-4 gap-4">
            {Object.keys(gradeNames).map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`p-4 rounded-xl font-bold transition-all ${
                  selectedGrade === grade
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {gradeNames[grade]}
              </button>
            ))}
          </div>
        </div>

        {/* תיאור הכיתה */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {gradeNames[selectedGrade]}
          </h2>
          <p className="text-gray-600 text-lg mb-4">
            {gradeDescriptions[selectedGrade]}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span>{questions.length} שאלות</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span>{categories.length} קטגוריות</span>
            </span>
          </div>
        </div>

        {/* קטגוריות */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📚 קטגוריות באוצר המילים
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 text-center"
              >
                <span className="text-2xl mb-2 block">
                  {category === 'animals' && '🐾'}
                  {category === 'food' && '🍎'}
                  {category === 'colors' && '🎨'}
                  {category === 'home' && '🏠'}
                  {category === 'school' && '🎓'}
                  {category === 'transport' && '🚗'}
                  {category === 'family' && '👨‍👩‍👧‍👦'}
                  {category === 'weather' && '🌤️'}
                  {category === 'grammar' && '📝'}
                  {category === 'vocabulary' && '📖'}
                  {category === 'sentences' && '💬'}
                  {category === 'comprehension' && '🧠'}
                  {category === 'places' && '📍'}
                  {category === 'professions' && '👷'}
                  {category === 'body' && '👤'}
                  {category === 'clothes' && '👕'}
                  {category === 'letters' && '🔤'}
                  {category === 'sounds' && '🔊'}
                  {category === 'reading' && '📖'}
                  {category === 'numbers' && '🔢'}
                  {category === 'verbs' && '🏃'}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {category === 'animals' && 'בעלי חיים'}
                  {category === 'food' && 'אוכל'}
                  {category === 'colors' && 'צבעים'}
                  {category === 'home' && 'בית'}
                  {category === 'school' && 'בית ספר'}
                  {category === 'transport' && 'תחבורה'}
                  {category === 'family' && 'משפחה'}
                  {category === 'weather' && 'מזג אוויר'}
                  {category === 'grammar' && 'דקדוק'}
                  {category === 'vocabulary' && 'אוצר מילים'}
                  {category === 'sentences' && 'משפטים'}
                  {category === 'comprehension' && 'הבנת הנקרא'}
                  {category === 'places' && 'מקומות'}
                  {category === 'professions' && 'מקצועות'}
                  {category === 'body' && 'חלקי גוף'}
                  {category === 'clothes' && 'בגדים'}
                  {category === 'letters' && 'אותיות'}
                  {category === 'sounds' && 'צלילים'}
                  {category === 'reading' && 'קריאה'}
                  {category === 'numbers' && 'מספרים'}
                  {category === 'verbs' && 'פעלים'}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {questions.filter((q: any) => q.category === category).length} שאלות
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* כפתור יצירה */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              🎮 מוכן ליצור משחק?
            </h3>
            <p className="text-gray-600 mb-6">
              לאחר שבדקת את השאלות והאוצר מילים, תוכל ליצור משחק חדש לכיתה זו
            </p>
            <button
              onClick={() => router.push(`/classroom-teacher?grade=${selectedGrade}`)}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
            >
              🎯 צור משחק לכיתה {selectedGrade}
            </button>
          </div>
        </div>

        {/* דוגמאות לשאלות */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📝 דוגמאות לשאלות (10 ראשונות)
          </h3>
          <div className="space-y-4">
            {questions.slice(0, 10).map((question: any, index: number) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-800">
                    שאלה {index + 1}: {question.text}
                  </h4>
                  <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600">
                    {question.category}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {question.options.map((option: string, optIndex: number) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg ${
                        optIndex === question.correct
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-white'
                      }`}
                    >
                      <span className="font-medium">{option}</span>
                      {optIndex === question.correct && (
                        <span className="text-green-600 text-sm ml-2">✓ תשובה נכונה</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic">
                  💡 {question.explanation}
                </p>
              </div>
            ))}
          </div>

          {questions.length > 10 && (
            <div className="mt-6 text-center text-gray-500">
              <p>ועוד {questions.length - 10} שאלות נוספות...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

