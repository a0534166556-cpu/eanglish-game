"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';

// Types
interface Question {
  id: number;
  lang: 'en' | 'he';
  category: string;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
  explanationHe?: string;
}

interface DetailedResult extends Question {
  selected: number;
  correct: boolean;
  time: number;
}

interface CategoryStats {
  [key: string]: {
    total: number;
    correct: number;
  };
}

interface Friend {
  id: number;
  name: string;
  score: number;
  rank: string;
  lastActive: string;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  reward: number;
}

interface DailyChallenges {
  date: string;
  completed: string[];
  progress: {
    [key: string]: number;
  };
}

interface Bonus {
  points: number;
  message: string;
}

interface ShopItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  description: string;
  effect: string;
  count?: number;
  permanent?: boolean;
  vipDiscount?: number;
}

const QUESTIONS: Question[] = [
  // Grammar
  { id: 1, lang: "en", category: "grammar", text: "Choose the correct word: 'She ____ to school every day.'", options: ["go", "goes", "going", "went"], answer: 1, explanation: "With he/she/it, we add -s to the verb in present simple.", explanationHe: "הנושא הוא נקבה יחידה, לכן הולכת." },
  { id: 2, lang: "en", category: "grammar", text: "Select the correct past tense: 'Yesterday, I ____ to the store.'", options: ["go", "goes", "went", "going"], answer: 2, explanation: "The past tense of 'go' is 'went'.", explanationHe: "הפסקה העברית של 'go' היא 'went'." },
  { id: 3, lang: "en", category: "grammar", text: "Which is the correct plural form of 'child'?", options: ["childs", "childes", "children", "child"], answer: 2, explanation: "'Children' is the irregular plural form of 'child'.", explanationHe: "'Children' הוא הציור האיררגולרי של 'child'." },
  
  // Vocabulary
  { id: 4, lang: "en", category: "vocab", text: "What is the opposite of 'happy'?", options: ["sad", "angry", "tired", "excited"], answer: 0, explanation: "The opposite (antonym) of 'happy' is 'sad'.", explanationHe: "ההפך משמח הוא עצוב." },
  { id: 5, lang: "en", category: "vocab", text: "Which word means 'a place where you buy medicine'?", options: ["hospital", "pharmacy", "supermarket", "library"], answer: 1, explanation: "A pharmacy is where you buy medicine.", explanationHe: "חולצרה היא מקום שבו מוכנים לקנות תרופות." },
  { id: 6, lang: "en", category: "vocab", text: "What do you call someone who fixes cars?", options: ["mechanic", "doctor", "teacher", "chef"], answer: 0, explanation: "A mechanic is someone who repairs cars.", explanationHe: "מכנאי הוא מישהו שמתחיל את מכונת התחבורה." },
  
  // Reading
  { id: 7, lang: "en", category: "reading", text: "The sky is blue. The grass is green. What color is the sky?", options: ["red", "blue", "green", "yellow"], answer: 1, explanation: "The text states that the sky is blue.", explanationHe: "הטקסט אומר שהשמיים כחולים." },
  { id: 8, lang: "en", category: "reading", text: "Tom likes apples and bananas. What fruit does Tom like?", options: ["only apples", "only bananas", "apples and bananas", "oranges"], answer: 2, explanation: "The text says Tom likes both apples and bananas.", explanationHe: "הטקסט אומר שטום אוהב גם תפוחים וגם בננות." },
  
  // Holidays
  { id: 9, lang: "en", category: "holidays", text: "Which holiday is known as the 'Festival of Lights'?", options: ["Christmas", "Hanukkah", "Easter", "Halloween"], answer: 1, explanation: "Hanukkah is known as the Festival of Lights.", explanationHe: "החג המכונה 'הספרה של האור' הוא חג המכונה של האור." },
  { id: 10, lang: "en", category: "holidays", text: "When do people celebrate New Year's Day?", options: ["December 25", "January 1", "July 4", "October 31"], answer: 1, explanation: "New Year's Day is celebrated on January 1st.", explanationHe: "חג השנה החדשה מתקיים ב-1 בינואר." },
  
  // Nature
  { id: 11, lang: "en", category: "nature", text: "Which season comes after summer?", options: ["winter", "spring", "fall", "summer"], answer: 2, explanation: "Fall (autumn) comes after summer.", explanationHe: "האבל מגיע לאחר הקיץ." },
  { id: 12, lang: "en", category: "nature", text: "What do plants need to grow?", options: ["only water", "only sunlight", "water and sunlight", "nothing"], answer: 2, explanation: "Plants need both water and sunlight to grow.", explanationHe: "הצמחים צריכים גם מים וגם אור כדי לגדל." },
  
  // Technology
  { id: 13, lang: "en", category: "technology", text: "What do you use to take a photo with your phone?", options: ["speaker", "camera", "microphone", "screen"], answer: 1, explanation: "You use the camera to take photos.", explanationHe: "אתה משתמש במצלמה כדי לקחת תמונות." },
  { id: 14, lang: "en", category: "technology", text: "Which device do you use to print documents?", options: ["scanner", "printer", "keyboard", "mouse"], answer: 1, explanation: "A printer is used to print documents.", explanationHe: "מפרש משמש להדפסת מסמכים." },
  
  // Hebrew Questions
  { id: 101, lang: "he", category: "grammar", text: "בחר את המילה הנכונה: 'היא ____ לבית הספר כל יום.'", options: ["הולך", "הולכת", "הולכים", "הולכות"], answer: 1, explanation: "הנושא הוא נקבה יחידה, לכן הולכת.", explanationHe: "הנושא הוא נקבה יחידה, לכן הולכת." },
  { id: 102, lang: "he", category: "vocab", text: "מה ההפך מ'שמח'?", options: ["עצוב", "כועס", "עייף", "נרגש"], answer: 0, explanation: "ההפך משמח הוא עצוב.", explanationHe: "ההפך משמח הוא עצוב." },
  { id: 103, lang: "he", category: "reading", text: "דני אוהב תפוחים ובננות. איזה פרי דני אוהב?", options: ["רק תפוחים", "רק בננות", "תפוחים ובננות", "תפוזים"], answer: 2, explanation: "בטקסט כתוב שדני אוהב גם תפוחים וגם בננות.", explanationHe: "בטקסט כתוב שדני אוהב גם תפוחים וגם בננות." },
  
  // Animals
  { id: 15, lang: "en", category: "animals", text: "Which animal can fly?", options: ["fish", "bird", "cat", "dog"], answer: 1, explanation: "Birds have wings and can fly.", explanationHe: "לציפורים יש כנפיים והן יכולות לעוף." },
  { id: 16, lang: "en", category: "animals", text: "What do cats like to drink?", options: ["coffee", "juice", "milk", "soda"], answer: 2, explanation: "Cats like to drink milk.", explanationHe: "חתולים אוהבים לשתות חלב." },
  
  // Food
  { id: 17, lang: "en", category: "food", text: "Which food is made from milk?", options: ["bread", "cheese", "rice", "potato"], answer: 1, explanation: "Cheese is made from milk.", explanationHe: "חביתה מוכנה מביצים." },
  { id: 18, lang: "en", category: "food", text: "What fruit is yellow and has a peel?", options: ["apple", "banana", "grape", "orange"], answer: 1, explanation: "A banana is yellow and has a peel.", explanationHe: "בננה היא פרי צהוב עם קליפה." },
  
  // School
  { id: 19, lang: "en", category: "school", text: "What do you use to write in your notebook?", options: ["pencil", "eraser", "ruler", "scissors"], answer: 0, explanation: "You use a pencil to write in your notebook.", explanationHe: "אתה משתמש בעפרון כדי לכתוב בעפרון שלך." },
  { id: 20, lang: "en", category: "school", text: "Where do students sit in class?", options: ["on chairs", "on tables", "on floor", "on desk"], answer: 0, explanation: "Students sit on chairs in class.", explanationHe: "התלמידים יושבים על מסלות בכיתה." },
  
  // Hebrew Categories
  { id: 104, lang: "he", category: "animals", text: "איזו חיה נותנת חלב?", options: ["כלב", "חתול", "פרה", "תרנגול"], answer: 2, explanation: "פרה נותנת חלב.", explanationHe: "פרה נותנת חלב." },
  { id: 105, lang: "he", category: "food", text: "איזה מאכל עשוי מביצים?", options: ["לחם", "חביתה", "סלט", "מרק"], answer: 1, explanation: "חביתה מוכנה מביצים.", explanationHe: "חביתה מוכנה מביצים." },
  { id: 106, lang: "he", category: "school", text: "מה משמש לכתיבה על הלוח?", options: ["עיפרון", "טוש", "גיר", "עט"], answer: 2, explanation: "משתמשים בגיר לכתיבה על הלוח.", explanationHe: "משתמשים בגיר לכתיבה על הלוח." },
  // New questions:
  { id: 201, lang: "en", category: "grammar", text: "Which is the correct form: 'They ____ playing.'", options: ["is", "are", "am", "be"], answer: 1, explanation: "'They' is plural, so use 'are'.", explanationHe: "They זה רבים, לכן משתמשים ב-are." },
  { id: 202, lang: "en", category: "vocab", text: "What is the synonym of 'big'?", options: ["small", "large", "short", "thin"], answer: 1, explanation: "'Large' is a synonym for 'big'.", explanationHe: "Large הוא מילה נרדפת ל-big." },
  { id: 203, lang: "en", category: "reading", text: "Sara has a red dress. What color is Sara's dress?", options: ["blue", "green", "red", "yellow"], answer: 2, explanation: "The text says Sara's dress is red.", explanationHe: "כתוב שהשמלה של שרה אדומה." },
  { id: 204, lang: "en", category: "holidays", text: "Which holiday has a menorah?", options: ["Hanukkah", "Christmas", "Easter", "Thanksgiving"], answer: 0, explanation: "A menorah is used in Hanukkah.", explanationHe: "מנורה שייכת לחנוכה." },
  { id: 205, lang: "en", category: "nature", text: "Which animal lives in water?", options: ["dog", "cat", "fish", "bird"], answer: 2, explanation: "Fish live in water.", explanationHe: "דגים חיים במים." },
  { id: 206, lang: "en", category: "technology", text: "What do you use to type on a computer?", options: ["mouse", "keyboard", "screen", "printer"], answer: 1, explanation: "You use a keyboard to type.", explanationHe: "משתמשים במקלדת להקלדה." },
  { id: 207, lang: "en", category: "emotions", text: "If you are 'excited', how do you feel?", options: ["bored", "happy", "tired", "angry"], answer: 1, explanation: "Excited means happy and energetic.", explanationHe: "Excited זה שמח ונרגש." },
  { id: 208, lang: "en", category: "transport", text: "Which is not a type of transport?", options: ["car", "bus", "tree", "train"], answer: 2, explanation: "A tree is not a transport.", explanationHe: "עץ אינו אמצעי תחבורה." },
  { id: 209, lang: "en", category: "animals", text: "Which animal barks?", options: ["cat", "dog", "cow", "sheep"], answer: 1, explanation: "Dogs bark.", explanationHe: "כלבים נובחים." },
  { id: 210, lang: "en", category: "food", text: "Which is a fruit?", options: ["carrot", "banana", "potato", "onion"], answer: 1, explanation: "Banana is a fruit.", explanationHe: "בננה היא פרי." },
  { id: 211, lang: "en", category: "school", text: "What do you use to erase pencil?", options: ["pen", "eraser", "marker", "chalk"], answer: 1, explanation: "You use an eraser to erase pencil.", explanationHe: "משתמשים במחק למחוק עיפרון." },
  { id: 212, lang: "en", category: "family", text: "Who is your mother's mother?", options: ["aunt", "sister", "grandmother", "cousin"], answer: 2, explanation: "Your mother's mother is your grandmother.", explanationHe: "אמא של אמא היא סבתא." },
  { id: 213, lang: "en", category: "health", text: "Who helps you when you are sick?", options: ["teacher", "doctor", "chef", "driver"], answer: 1, explanation: "A doctor helps when you are sick.", explanationHe: "רופא עוזר כשחולים." },
  { id: 214, lang: "en", category: "sports", text: "Which sport uses a ball?", options: ["swimming", "basketball", "cycling", "running"], answer: 1, explanation: "Basketball uses a ball.", explanationHe: "בכדורסל משחקים עם כדור." },
  { id: 215, lang: "en", category: "colors", text: "What color do you get by mixing blue and yellow?", options: ["green", "red", "purple", "orange"], answer: 0, explanation: "Blue and yellow make green.", explanationHe: "כחול וצהוב יוצרים ירוק." },
  { id: 216, lang: "en", category: "daily", text: "What do you do in the morning?", options: ["sleep", "eat breakfast", "go to bed", "watch stars"], answer: 1, explanation: "People usually eat breakfast in the morning.", explanationHe: "בבוקר אוכלים ארוחת בוקר." },
  { id: 217, lang: "en", category: "weather", text: "What do you wear when it rains?", options: ["sunglasses", "raincoat", "shorts", "sandals"], answer: 1, explanation: "You wear a raincoat when it rains.", explanationHe: "כשל גשם לובשים מעיל גשם." },
  { id: 218, lang: "en", category: "nature", text: "Which is not a season?", options: ["spring", "summer", "autumn", "holiday"], answer: 3, explanation: "Holiday is not a season.", explanationHe: "Holiday אינו עונה." },
  { id: 219, lang: "en", category: "vocab", text: "What is the opposite of 'cold'?", options: ["hot", "warm", "cool", "ice"], answer: 0, explanation: "The opposite of cold is hot.", explanationHe: "ההפך מקור הוא חם." },
  { id: 220, lang: "en", category: "grammar", text: "Choose the correct: 'He ____ a book.'", options: ["read", "reads", "reading", "to read"], answer: 1, explanation: "He reads a book (present simple).", explanationHe: "He reads a book בזמן הווה פשוט." },
  { id: 221, lang: "he", category: "grammar", text: "מה צורת הרבים של 'ילד'?", options: ["ילדים", "ילדות", "ילדיים", "ילדון"], answer: 0, explanation: "הרבים של ילד הוא ילדים.", explanationHe: "הרבים של ילד הוא ילדים." },
  { id: 222, lang: "he", category: "vocab", text: "מה ההפך מ'גדול'?", options: ["קטן", "רחב", "גבוה", "יפה"], answer: 0, explanation: "ההפך מגדול הוא קטן.", explanationHe: "ההפך מגדול הוא קטן." },
  { id: 223, lang: "he", category: "reading", text: "החתול יושב על החלון. איפה החתול?", options: ["על החלון", "על השולחן", "על הרצפה", "על הכיסא"], answer: 0, explanation: "כתוב שהחתול על החלון.", explanationHe: "כתוב שהחתול על החלון." },
  { id: 224, lang: "he", category: "holidays", text: "באיזה חג מדליקים נרות?", options: ["פורים", "חנוכה", "ראש השנה", "סוכות"], answer: 1, explanation: "בחנוכה מדליקים נרות.", explanationHe: "בחנוכה מדליקים נרות." },
  { id: 225, lang: "he", category: "nature", text: "איזה חיה חיה במים?", options: ["כלב", "חתול", "דג", "ציפור"], answer: 2, explanation: "דג חי במים.", explanationHe: "דג חי במים." },
  { id: 226, lang: "he", category: "technology", text: "במה משתמשים להקלדה במחשב?", options: ["עכבר", "מקלדת", "מסך", "מדפסת"], answer: 1, explanation: "משתמשים במקלדת להקלדה.", explanationHe: "משתמשים במקלדת להקלדה." },
  { id: 227, lang: "he", category: "emotions", text: "אם אתה 'נרגש', איך אתה מרגיש?", options: ["משועמם", "שמח", "עייף", "כועס"], answer: 1, explanation: "נרגש זה שמח ומלא אנרגיה.", explanationHe: "נרגש זה שמח ומלא אנרגיה." },
  { id: 228, lang: "he", category: "transport", text: "מה אינו אמצעי תחבורה?", options: ["מכונית", "אוטובוס", "עץ", "רכבת"], answer: 2, explanation: "עץ אינו אמצעי תחבורה.", explanationHe: "עץ אינו אמצעי תחבורה." },
  { id: 229, lang: "he", category: "animals", text: "איזו חיה נובחת?", options: ["חתול", "כלב", "פרה", "כבשה"], answer: 1, explanation: "כלב נובח.", explanationHe: "כלב נובח." },
  { id: 230, lang: "he", category: "food", text: "איזה מאכל הוא פרי?", options: ["גזר", "בננה", "תפוח אדמה", "בצל"], answer: 1, explanation: "בננה היא פרי.", explanationHe: "בננה היא פרי." },
  { id: 231, lang: "he", category: "school", text: "במה משתמשים למחוק עיפרון?", options: ["עט", "מחק", "טוש", "גיר"], answer: 1, explanation: "משתמשים במחק למחוק עיפרון.", explanationHe: "משתמשים במחק למחוק עיפרון." },
  { id: 232, lang: "he", category: "family", text: "מי היא אמא של אמא שלך?", options: ["דודה", "אחות", "סבתא", "בת דודה"], answer: 2, explanation: "אמא של אמא היא סבתא.", explanationHe: "אמא של אמא היא סבתא." },
  { id: 233, lang: "he", category: "health", text: "מי עוזר כשחולים?", options: ["מורה", "רופא", "טבח", "נהג"], answer: 1, explanation: "רופא עוזר כשחולים.", explanationHe: "רופא עוזר כשחולים." },
  { id: 234, lang: "he", category: "sports", text: "באיזה ספורט משחקים עם כדור?", options: ["שחייה", "כדורסל", "רכיבה", "ריצה"], answer: 1, explanation: "בכדורסל משחקים עם כדור.", explanationHe: "בכדורסל משחקים עם כדור." },
  { id: 235, lang: "he", category: "colors", text: "איזה צבע מקבלים מערבוב כחול וצהוב?", options: ["ירוק", "אדום", "סגול", "כתום"], answer: 0, explanation: "כחול וצהוב יוצרים ירוק.", explanationHe: "כחול וצהוב יוצרים ירוק." },
  { id: 236, lang: "he", category: "daily", text: "מה עושים בבוקר?", options: ["ישנים", "אוכלים ארוחת בוקר", "הולכים לישון", "צופים בכוכבים"], answer: 1, explanation: "בבוקר אוכלים ארוחת בוקר.", explanationHe: "בבוקר אוכלים ארוחת בוקר." },
  { id: 237, lang: "he", category: "weather", text: "מה לובשים כשיורד גשם?", options: ["משקפי שמש", "מעיל גשם", "מכנסיים קצרים", "סנדלים"], answer: 1, explanation: "כשיורד גשם לובשים מעיל גשם.", explanationHe: "כשיורד גשם לובשים מעיל גשם." },
  { id: 238, lang: "he", category: "nature", text: "איזו אינה עונה?", options: ["אביב", "קיץ", "סתיו", "חג"], answer: 3, explanation: "חג אינו עונה.", explanationHe: "חג אינו עונה." },
  { id: 239, lang: "he", category: "vocab", text: "מה ההפך מ'קר'?", options: ["חם", "חמים", "קריר", "קרח"], answer: 0, explanation: "ההפך מקר הוא חם.", explanationHe: "ההפך מקר הוא חם." },
  { id: 240, lang: "he", category: "grammar", text: "בחר את הנכון: 'הוא ____ ספר.'", options: ["קורא", "קוראת", "קוראים", "לקרוא"], answer: 0, explanation: "הוא קורא ספר (הווה פשוט).", explanationHe: "הוא קורא ספר בזמן הווה פשוט." },
  // שאלות חדשות באנגלית ובעברית
  { id: 300, lang: "en", category: "colors", text: "What color is the sun?", options: ["yellow", "blue", "green", "red"], answer: 0, explanation: "The sun appears yellow from Earth.", explanationHe: "השמש נראית צהובה מכדור הארץ." },
  { id: 301, lang: "he", category: "colors", text: "מה הצבע של הדשא?", options: ["ירוק", "כחול", "אדום", "צהוב"], answer: 0, explanation: "הדשא בדרך כלל ירוק.", explanationHe: "הדשא בדרך כלל ירוק." },
  { id: 302, lang: "en", category: "body", text: "Which part of the body do you use to see?", options: ["ears", "eyes", "hands", "legs"], answer: 1, explanation: "We use our eyes to see.", explanationHe: "רואים בעזרת העיניים." },
  { id: 303, lang: "he", category: "body", text: "באיזה איבר שומעים?", options: ["עיניים", "אוזניים", "פה", "ידיים"], answer: 1, explanation: "שומעים בעזרת האוזניים.", explanationHe: "שומעים בעזרת האוזניים." },
  { id: 304, lang: "en", category: "family", text: "Who is your father's son?", options: ["uncle", "brother", "cousin", "grandfather"], answer: 1, explanation: "Your father's son is your brother.", explanationHe: "הבן של אבא הוא אחיך." },
  { id: 305, lang: "he", category: "family", text: "מי היא אחות של אמא שלך?", options: ["דודה", "סבתא", "אמא", "בת דודה"], answer: 0, explanation: "אחות של אמא היא דודה.", explanationHe: "אחות של אמא היא דודה." },
  { id: 306, lang: "en", category: "jobs", text: "Who teaches students at school?", options: ["doctor", "teacher", "driver", "chef"], answer: 1, explanation: "A teacher teaches students.", explanationHe: "מורה מלמד תלמידים." },
  { id: 307, lang: "he", category: "jobs", text: "מי נוהג באוטובוס?", options: ["רופא", "נהג", "מורה", "טבח"], answer: 1, explanation: "נהג נוהג באוטובוס.", explanationHe: "נהג נוהג באוטובוס." },
  { id: 308, lang: "en", category: "nature", text: "Which is a tree?", options: ["rose", "oak", "car", "fish"], answer: 1, explanation: "Oak is a type of tree.", explanationHe: "אלון הוא סוג של עץ." },
  { id: 309, lang: "he", category: "nature", text: "איזה מהבאים הוא פרח?", options: ["אלון", "ורד", "דג", "מכונית"], answer: 1, explanation: "ורד הוא פרח.", explanationHe: "ורד הוא פרח." },
  { id: 310, lang: "en", category: "clothes", text: "What do you wear on your feet?", options: ["shirt", "pants", "shoes", "hat"], answer: 2, explanation: "We wear shoes on our feet.", explanationHe: "נעליים שמים על הרגליים." },
  { id: 311, lang: "he", category: "clothes", text: "מה לובשים על הראש?", options: ["נעליים", "חולצה", "כובע", "מכנסיים"], answer: 2, explanation: "כובע שמים על הראש.", explanationHe: "כובע שמים על הראש." },
  { id: 312, lang: "en", category: "verbs", text: "What is the past tense of 'eat'?", options: ["eated", "ate", "eats", "eating"], answer: 1, explanation: "The past tense of 'eat' is 'ate'.", explanationHe: "העבר של eat הוא ate." },
  { id: 313, lang: "he", category: "verbs", text: "מה צורת העבר של 'לרוץ'?", options: ["רץ", "רצה", "רצו", "רצתי"], answer: 0, explanation: "'רץ' היא צורת העבר ליחיד.", explanationHe: "'רץ' היא צורת העבר ליחיד." },
  { id: 314, lang: "en", category: "holidays", text: "Which holiday is in December?", options: ["Passover", "Hanukkah", "Sukkot", "Rosh Hashanah"], answer: 1, explanation: "Hanukkah is usually in December.", explanationHe: "חנוכה בדרך כלל בדצמבר." },
  { id: 315, lang: "he", category: "holidays", text: "באיזה חג אוכלים מצות?", options: ["פורים", "פסח", "שבועות", "חנוכה"], answer: 1, explanation: "בפסח אוכלים מצות.", explanationHe: "בפסח אוכלים מצות." },
  { id: 316, lang: "en", category: "sports", text: "Which sport is played in water?", options: ["basketball", "swimming", "soccer", "tennis"], answer: 1, explanation: "Swimming is done in water.", explanationHe: "שחייה נעשית במים." },
  { id: 317, lang: "he", category: "sports", text: "באיזה ספורט בועטים בכדור?", options: ["כדורסל", "כדורגל", "שחייה", "ריצה"], answer: 1, explanation: "בכדורגל בועטים בכדור.", explanationHe: "בכדורגל בועטים בכדור." },
  { id: 318, lang: "en", category: "transport", text: "Which is the fastest?", options: ["bicycle", "car", "train", "airplane"], answer: 3, explanation: "Airplane is the fastest among these.", explanationHe: "מטוס הוא הכי מהיר." },
  { id: 319, lang: "he", category: "transport", text: "איזה כלי תחבורה נוסע על מסילה?", options: ["רכבת", "מטוס", "מכונית", "אופניים"], answer: 0, explanation: "רכבת נוסעת על מסילה.", explanationHe: "רכבת נוסעת על מסילה." },
  { id: 320, lang: "en", category: "adjectives", text: "What is the opposite of 'short'?", options: ["tall", "small", "thin", "fat"], answer: 0, explanation: "The opposite of 'short' is 'tall'.", explanationHe: "ההפך מ-short הוא tall." },
  { id: 321, lang: "he", category: "adjectives", text: "מה ההפך מ'ישן'?", options: ["חדש", "ישן", "קטן", "גדול"], answer: 0, explanation: "ההפך מ'ישן' הוא 'חדש'.", explanationHe: "ההפך מ'ישן' הוא 'חדש'." },
  { id: 322, lang: "en", category: "numbers", text: "What comes after 7?", options: ["6", "8", "9", "10"], answer: 1, explanation: "After 7 comes 8.", explanationHe: "אחרי 7 בא 8." },
  { id: 323, lang: "he", category: "numbers", text: "מה המספר לפני 10?", options: ["8", "9", "10", "11"], answer: 1, explanation: "לפני 10 בא 9.", explanationHe: "לפני 10 בא 9." },
  { id: 324, lang: "en", category: "days", text: "Which day comes after Friday?", options: ["Thursday", "Saturday", "Sunday", "Monday"], answer: 1, explanation: "Saturday comes after Friday.", explanationHe: "שבת באה אחרי שישי." },
  { id: 325, lang: "he", category: "days", text: "איזה יום בא אחרי שלישי?", options: ["שני", "רביעי", "חמישי", "ראשון"], answer: 1, explanation: "רביעי בא אחרי שלישי.", explanationHe: "רביעי בא אחרי שלישי." },
  { id: 326, lang: "en", category: "countries", text: "Where is the Eiffel Tower?", options: ["London", "Paris", "Rome", "Berlin"], answer: 1, explanation: "The Eiffel Tower is in Paris.", explanationHe: "מגדל אייפל נמצא בפריז." },
  { id: 327, lang: "he", category: "countries", text: "באיזו מדינה נמצא הפירמידות?", options: ["ישראל", "מצרים", "צרפת", "איטליה"], answer: 1, explanation: "הפירמידות נמצאות במצרים.", explanationHe: "הפירמידות נמצאות במצרים." },
  { id: 328, lang: "en", category: "weather", text: "What do you use when it's hot?", options: ["umbrella", "fan", "coat", "boots"], answer: 1, explanation: "A fan helps when it's hot.", explanationHe: "מאוורר עוזר כשחם." },
  { id: 329, lang: "he", category: "weather", text: "מה לובשים כשקר?", options: ["מעיל", "כובע", "סנדלים", "חולצה קצרה"], answer: 0, explanation: "כשקר לובשים מעיל.", explanationHe: "כשקר לובשים מעיל." },
  { id: 330, lang: "en", category: "emotions", text: "If you are 'scared', how do you feel?", options: ["happy", "angry", "afraid", "excited"], answer: 2, explanation: "Scared means afraid.", explanationHe: "Scared זה מפוחד." },
  { id: 331, lang: "he", category: "emotions", text: "מה מרגישים כששומעים בדיחה?", options: ["שמחים", "עייפים", "כועסים", "מפחדים"], answer: 0, explanation: "בדיחה גורמת לשמחה.", explanationHe: "בדיחה גורמת לשמחה." },
  { id: 332, lang: "en", category: "school", text: "What do you use to draw?", options: ["pen", "pencil", "ruler", "eraser"], answer: 1, explanation: "You use a pencil to draw.", explanationHe: "מציירים בעיפרון." },
  { id: 333, lang: "he", category: "school", text: "מה מביאים לבית הספר כדי לכתוב?", options: ["עיפרון", "מחק", "סרגל", "דבק"], answer: 0, explanation: "מביאים עיפרון לכתיבה.", explanationHe: "מביאים עיפרון לכתיבה." },
  { id: 334, lang: "en", category: "food", text: "Which is a vegetable?", options: ["banana", "carrot", "apple", "grape"], answer: 1, explanation: "Carrot is a vegetable.", explanationHe: "גזר הוא ירק." },
  { id: 335, lang: "he", category: "food", text: "איזה מאכל הוא ירק?", options: ["בננה", "גזר", "תפוח", "ענב"], answer: 1, explanation: "גזר הוא ירק.", explanationHe: "גזר הוא ירק." },
  { id: 336, lang: "en", category: "technology", text: "What do you use to call someone?", options: ["computer", "phone", "printer", "camera"], answer: 1, explanation: "You use a phone to call.", explanationHe: "משתמשים בטלפון לשיחה." },
  { id: 337, lang: "he", category: "technology", text: "במה משתמשים כדי לצלם תמונה?", options: ["טלפון", "מצלמה", "מחשב", "מדפסת"], answer: 1, explanation: "מצלמה משמשת לצילום.", explanationHe: "מצלמה משמשת לצילום." },
  { id: 338, lang: "en", category: "animals", text: "Which animal is the largest?", options: ["cat", "dog", "elephant", "mouse"], answer: 2, explanation: "Elephant is the largest.", explanationHe: "פיל הוא הגדול ביותר." },
  { id: 339, lang: "he", category: "animals", text: "איזו חיה קטנה?", options: ["פיל", "חתול", "כלב", "עכבר"], answer: 3, explanation: "עכבר הוא קטן.", explanationHe: "עכבר הוא קטן." },
  { id: 340, lang: "en", category: "reading", text: "Anna has two cats and a dog. How many animals does Anna have?", options: ["one", "two", "three", "four"], answer: 2, explanation: "2+1=3 animals.", explanationHe: "לאנה יש שלושה חיות." },
  { id: 341, lang: "he", category: "reading", text: "יוסי קנה שלושה תפוחים ואכל אחד. כמה נשארו?", options: ["שניים", "שלושה", "אחד", "ארבעה"], answer: 0, explanation: "3-1=2 נשארו.", explanationHe: "3-1=2 נשארו." },
  // ... אפשר להוסיף עוד עשרות שאלות דומות במידת הצורך ...
  
  // New Questions - Science
  { id: 400, lang: "en", category: "science", text: "What do plants need to make food?", options: ["water and soil", "sunlight and water", "air and soil", "soil and sunlight"], answer: 1, explanation: "Plants use sunlight and water for photosynthesis.", explanationHe: "צמחים משתמשים באור שמש ומים לפוטוסינתזה." },
  { id: 401, lang: "he", category: "science", text: "מה צמחים צריכים כדי לייצר מזון?", options: ["מים ואדמה", "אור שמש ומים", "אוויר ואדמה", "אדמה ואור שמש"], answer: 1, explanation: "צמחים משתמשים באור שמש ומים לפוטוסינתזה.", explanationHe: "צמחים משתמשים באור שמש ומים לפוטוסינתזה." },
  
  // Geography
  { id: 402, lang: "en", category: "geography", text: "Which is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3, explanation: "The Pacific Ocean is the largest ocean.", explanationHe: "האוקיינוס השקט הוא הגדול ביותר." },
  { id: 403, lang: "he", category: "geography", text: "איזה ים נמצא בין אירופה לאפריקה?", options: ["הים התיכון", "הים האדום", "הים השחור", "הים הבלטי"], answer: 0, explanation: "הים התיכון נמצא בין אירופה לאפריקה.", explanationHe: "הים התיכון נמצא בין אירופה לאפריקה." },
  
  // History
  { id: 404, lang: "en", category: "history", text: "Who was the first person to walk on the moon?", options: ["Yuri Gagarin", "Neil Armstrong", "Buzz Aldrin", "John Glenn"], answer: 1, explanation: "Neil Armstrong was the first person to walk on the moon.", explanationHe: "ניל ארמסטרונג היה האדם הראשון שצעד על הירח." },
  { id: 405, lang: "he", category: "history", text: "מי היה האדם הראשון שצעד על הירח?", options: ["יורי גגארין", "ניל ארמסטרונג", "באז אולדרין", "ג'ון גלן"], answer: 1, explanation: "ניל ארמסטרונג היה האדם הראשון שצעד על הירח.", explanationHe: "ניל ארמסטרונג היה האדם הראשון שצעד על הירח." },
  
  // Art
  { id: 406, lang: "en", category: "art", text: "Which artist painted the Mona Lisa?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"], answer: 2, explanation: "Leonardo da Vinci painted the Mona Lisa.", explanationHe: "לאונרדו דה וינצ'י צייר את המונה ליזה." },
  { id: 407, lang: "he", category: "art", text: "מי צייר את המונה ליזה?", options: ["וינסנט ואן גוך", "פבלו פיקאסו", "לאונרדו דה וינצ'י", "מיכלאנג'לו"], answer: 2, explanation: "לאונרדו דה וינצ'י צייר את המונה ליזה.", explanationHe: "לאונרדו דה וינצ'י צייר את המונה ליזה." },
  
  // Music
  { id: 408, lang: "en", category: "music", text: "Which instrument has 88 keys?", options: ["guitar", "violin", "piano", "drums"], answer: 2, explanation: "A piano has 88 keys.", explanationHe: "לפסנתר יש 88 קלידים." },
  { id: 409, lang: "he", category: "music", text: "איזה כלי נגינה יש לו 88 קלידים?", options: ["גיטרה", "כינור", "פסנתר", "תופים"], answer: 2, explanation: "לפסנתר יש 88 קלידים.", explanationHe: "לפסנתר יש 88 קלידים." },
  
  // Literature
  { id: 410, lang: "en", category: "literature", text: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], answer: 1, explanation: "William Shakespeare wrote 'Romeo and Juliet'.", explanationHe: "ויליאם שייקספיר כתב את 'רומיאו ויוליה'." },
  { id: 411, lang: "he", category: "literature", text: "מי כתב את 'רומיאו ויוליה'?", options: ["צ'ארלס דיקנס", "ויליאם שייקספיר", "ג'יין אוסטן", "מארק טוויין"], answer: 1, explanation: "ויליאם שייקספיר כתב את 'רומיאו ויוליה'.", explanationHe: "ויליאם שייקספיר כתב את 'רומיאו ויוליה'." },
  
  // Environment
  { id: 412, lang: "en", category: "environment", text: "What do we call the layer that protects Earth from the sun's harmful rays?", options: ["atmosphere", "ozone layer", "cloud layer", "dust layer"], answer: 1, explanation: "The ozone layer protects Earth from harmful UV rays.", explanationHe: "שכבת האוזון מגנה על כדור הארץ מפני קרני UV מזיקות." },
  { id: 413, lang: "he", category: "environment", text: "איך קוראים לשכבה שמגנה על כדור הארץ מפני קרני השמש המזיקות?", options: ["אטמוספירה", "שכבת האוזון", "שכבת העננים", "שכבת האבק"], answer: 1, explanation: "שכבת האוזון מגנה על כדור הארץ מפני קרני UV מזיקות.", explanationHe: "שכבת האוזון מגנה על כדור הארץ מפני קרני UV מזיקות." },
  
  // Technology
  { id: 414, lang: "en", category: "technology", text: "What does 'CPU' stand for?", options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Computer Program Unit"], answer: 0, explanation: "CPU stands for Central Processing Unit.", explanationHe: "CPU הוא ראשי תיבות של Central Processing Unit." },
  { id: 415, lang: "he", category: "technology", text: "מה המשמעות של CPU?", options: ["יחידת עיבוד מרכזית", "יחידת עיבוד מחשב", "יחידת תוכנית מרכזית", "יחידת תוכנית מחשב"], answer: 0, explanation: "CPU הוא יחידת העיבוד המרכזית של המחשב.", explanationHe: "CPU הוא יחידת העיבוד המרכזית של המחשב." },
  
  // Sports
  { id: 416, lang: "en", category: "sports", text: "How many players are there in a soccer team?", options: ["9", "10", "11", "12"], answer: 2, explanation: "A soccer team has 11 players.", explanationHe: "קבוצת כדורגל כוללת 11 שחקנים." },
  { id: 417, lang: "he", category: "sports", text: "כמה שחקנים יש בקבוצת כדורסל?", options: ["4", "5", "6", "7"], answer: 1, explanation: "קבוצת כדורסל כוללת 5 שחקנים.", explanationHe: "קבוצת כדורסל כוללת 5 שחקנים." },
  
  // Food
  { id: 418, lang: "en", category: "food", text: "Which food is known as the 'king of fruits'?", options: ["apple", "banana", "mango", "orange"], answer: 2, explanation: "Mango is often called the 'king of fruits'.", explanationHe: "המנגו מכונה לעתים קרובות 'מלך הפירות'." },
  { id: 419, lang: "he", category: "food", text: "איזה מאכל מכונה 'מלך הפירות'?", options: ["תפוח", "בננה", "מנגו", "תפוז"], answer: 2, explanation: "המנגו מכונה לעתים קרובות 'מלך הפירות'.", explanationHe: "המנגו מכונה לעתים קרובות 'מלך הפירות'." },
  
  // Animals
  { id: 420, lang: "en", category: "animals", text: "Which animal can change its color?", options: ["elephant", "chameleon", "giraffe", "zebra"], answer: 1, explanation: "A chameleon can change its color to blend with its surroundings.", explanationHe: "הזיקית יכולה לשנות את צבעה כדי להשתלב בסביבתה." },
  { id: 421, lang: "he", category: "animals", text: "איזו חיה יכולה לשנות את צבעה?", options: ["פיל", "זיקית", "ג'ירף", "זברה"], answer: 1, explanation: "הזיקית יכולה לשנות את צבעה כדי להשתלב בסביבתה.", explanationHe: "הזיקית יכולה לשנות את צבעה כדי להשתלב בסביבתה." },
  
  // Additional Questions - Advanced Level
  { id: 500, lang: "en", category: "grammar", text: "Which sentence is correct?", options: ["She don't like apples", "She doesn't like apples", "She not like apples", "She no like apples"], answer: 1, explanation: "With 'she', we use 'doesn't' in negative sentences.", explanationHe: "עם 'she' משתמשים ב-'doesn't' במשפטים שליליים." },
  { id: 501, lang: "he", category: "grammar", text: "איזה משפט נכון?", options: ["היא לא אוהבת תפוחים", "היא לא אוהבת תפוחים", "היא לא אוהבת תפוחים", "היא לא אוהבת תפוחים"], answer: 0, explanation: "המשפט הראשון נכון.", explanationHe: "המשפט הראשון נכון." },
  
  { id: 502, lang: "en", category: "vocab", text: "What is a synonym for 'beautiful'?", options: ["ugly", "pretty", "bad", "wrong"], answer: 1, explanation: "'Pretty' is a synonym for 'beautiful'.", explanationHe: "'Pretty' הוא מילה נרדפת ל-'beautiful'." },
  { id: 503, lang: "he", category: "vocab", text: "מה המילה הנרדפת ל-'יפה'?", options: ["מכוער", "יפה", "רע", "שגוי"], answer: 1, explanation: "'יפה' היא המילה הנרדפת ל-'יפה'.", explanationHe: "'יפה' היא המילה הנרדפת ל-'יפה'." },
  
  { id: 504, lang: "en", category: "science", text: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0, explanation: "H2O is the chemical formula for water.", explanationHe: "H2O הוא הנוסחה הכימית של מים." },
  { id: 505, lang: "he", category: "science", text: "מה הסימן הכימי של מים?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0, explanation: "H2O הוא הנוסחה הכימית של מים.", explanationHe: "H2O הוא הנוסחה הכימית של מים." },
  
  { id: 506, lang: "en", category: "geography", text: "Which country is known as the 'Land of the Rising Sun'?", options: ["China", "Japan", "Korea", "Thailand"], answer: 1, explanation: "Japan is known as the 'Land of the Rising Sun'.", explanationHe: "יפן מכונה 'ארץ השמש העולה'." },
  { id: 507, lang: "he", category: "geography", text: "איזו מדינה מכונה 'ארץ השמש העולה'?", options: ["סין", "יפן", "קוריאה", "תאילנד"], answer: 1, explanation: "יפן מכונה 'ארץ השמש העולה'.", explanationHe: "יפן מכונה 'ארץ השמש העולה'." },
  
  { id: 508, lang: "en", category: "history", text: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: 2, explanation: "World War II ended in 1945.", explanationHe: "מלחמת העולם השנייה הסתיימה ב-1945." },
  { id: 509, lang: "he", category: "history", text: "באיזו שנה הסתיימה מלחמת העולם השנייה?", options: ["1943", "1944", "1945", "1946"], answer: 2, explanation: "מלחמת העולם השנייה הסתיימה ב-1945.", explanationHe: "מלחמת העולם השנייה הסתיימה ב-1945." },
  
  { id: 510, lang: "en", category: "art", text: "Which art movement is associated with Vincent van Gogh?", options: ["Impressionism", "Cubism", "Surrealism", "Abstract"], answer: 0, explanation: "Vincent van Gogh is associated with Impressionism.", explanationHe: "וינסנט ואן גוך קשור לאימפרסיוניזם." },
  { id: 511, lang: "he", category: "art", text: "איזה זרם אמנותי קשור לוינסנט ואן גוך?", options: ["אימפרסיוניזם", "קוביזם", "סוריאליזם", "אבסטרקט"], answer: 0, explanation: "וינסנט ואן גוך קשור לאימפרסיוניזם.", explanationHe: "וינסנט ואן גוך קשור לאימפרסיוניזם." },
  
  { id: 512, lang: "en", category: "music", text: "Which composer wrote 'The Four Seasons'?", options: ["Mozart", "Beethoven", "Vivaldi", "Bach"], answer: 2, explanation: "Antonio Vivaldi composed 'The Four Seasons'.", explanationHe: "אנטוניו ויואלדי חיבר את 'ארבע העונות'." },
  { id: 513, lang: "he", category: "music", text: "מי חיבר את 'ארבע העונות'?", options: ["מוצרט", "בטהובן", "ויואלדי", "באך"], answer: 2, explanation: "אנטוניו ויואלדי חיבר את 'ארבע העונות'.", explanationHe: "אנטוניו ויואלדי חיבר את 'ארבע העונות'." },
  
  { id: 514, lang: "en", category: "literature", text: "Who wrote 'To Kill a Mockingbird'?", options: ["Harper Lee", "Mark Twain", "Ernest Hemingway", "F. Scott Fitzgerald"], answer: 0, explanation: "Harper Lee wrote 'To Kill a Mockingbird'.", explanationHe: "הרפר לי כתבה את 'להרוג ציפור שיר'." },
  { id: 515, lang: "he", category: "literature", text: "מי כתבה את 'להרוג ציפור שיר'?", options: ["הרפר לי", "מארק טוויין", "ארנסט המינגוויי", "פ. סקוט פיצג'רלד"], answer: 0, explanation: "הרפר לי כתבה את 'להרוג ציפור שיר'.", explanationHe: "הרפר לי כתבה את 'להרוג ציפור שיר'." },
  
  { id: 516, lang: "en", category: "environment", text: "What is the main cause of global warming?", options: ["deforestation", "greenhouse gases", "ocean pollution", "air pollution"], answer: 1, explanation: "Greenhouse gases are the main cause of global warming.", explanationHe: "גזי חממה הם הגורם העיקרי להתחממות גלובלית." },
  { id: 517, lang: "he", category: "environment", text: "מה הגורם העיקרי להתחממות גלובלית?", options: ["כריתת יערות", "גזי חממה", "זיהום אוקיינוסים", "זיהום אוויר"], answer: 1, explanation: "גזי חממה הם הגורם העיקרי להתחממות גלובלית.", explanationHe: "גזי חממה הם הגורם העיקרי להתחממות גלובלית." },
  
  { id: 518, lang: "en", category: "technology", text: "What does 'AI' stand for?", options: ["Artificial Intelligence", "Automated Information", "Advanced Internet", "Automated Intelligence"], answer: 0, explanation: "AI stands for Artificial Intelligence.", explanationHe: "AI הוא ראשי תיבות של Artificial Intelligence." },
  { id: 519, lang: "he", category: "technology", text: "מה המשמעות של AI?", options: ["בינה מלאכותית", "מידע אוטומטי", "אינטרנט מתקדם", "בינה אוטומטית"], answer: 0, explanation: "AI הוא בינה מלאכותית.", explanationHe: "AI הוא בינה מלאכותית." },
  
  { id: 520, lang: "en", category: "sports", text: "Which sport is played at Wimbledon?", options: ["tennis", "golf", "cricket", "rugby"], answer: 0, explanation: "Wimbledon is a tennis tournament.", explanationHe: "וימבלדון הוא טורניר טניס." },
  { id: 521, lang: "he", category: "sports", text: "באיזה ספורט משחקים בווימבלדון?", options: ["טניס", "גולף", "קריקט", "רוגבי"], answer: 0, explanation: "וימבלדון הוא טורניר טניס.", explanationHe: "וימבלדון הוא טורניר טניס." },
  
  { id: 522, lang: "en", category: "food", text: "Which spice is known as 'the king of spices'?", options: ["pepper", "cinnamon", "saffron", "ginger"], answer: 2, explanation: "Saffron is known as 'the king of spices'.", explanationHe: "זעפרן מכונה 'מלך התבלינים'." },
  { id: 523, lang: "he", category: "food", text: "איזה תבלין מכונה 'מלך התבלינים'?", options: ["פלפל", "קינמון", "זעפרן", "ג'ינג'ר"], answer: 2, explanation: "זעפרן מכונה 'מלך התבלינים'.", explanationHe: "זעפרן מכונה 'מלך התבלינים'." },
  
  { id: 524, lang: "en", category: "animals", text: "Which animal is known as the 'king of the jungle'?", options: ["tiger", "lion", "elephant", "giraffe"], answer: 1, explanation: "The lion is known as the 'king of the jungle'.", explanationHe: "האריה מכונה 'מלך הג'ונגל'." },
  { id: 525, lang: "he", category: "animals", text: "איזו חיה מכונה 'מלך הג'ונגל'?", options: ["טיגריס", "אריה", "פיל", "ג'ירף"], answer: 1, explanation: "האריה מכונה 'מלך הג'ונגל'.", explanationHe: "האריה מכונה 'מלך הג'ונגל'." },
  
  { id: 526, lang: "en", category: "nature", text: "What is the largest planet in our solar system?", options: ["Earth", "Jupiter", "Saturn", "Neptune"], answer: 1, explanation: "Jupiter is the largest planet in our solar system.", explanationHe: "צדק הוא כוכב הלכת הגדול ביותר במערכת השמש שלנו." },
  { id: 527, lang: "he", category: "nature", text: "מה כוכב הלכת הגדול ביותר במערכת השמש שלנו?", options: ["כדור הארץ", "צדק", "שבתאי", "נפטון"], answer: 1, explanation: "צדק הוא כוכב הלכת הגדול ביותר במערכת השמש שלנו.", explanationHe: "צדק הוא כוכב הלכת הגדול ביותר במערכת השמש שלנו." },
  
  { id: 528, lang: "en", category: "weather", text: "What is the name of a rotating column of air?", options: ["hurricane", "tornado", "typhoon", "cyclone"], answer: 1, explanation: "A tornado is a rotating column of air.", explanationHe: "טורנדו הוא עמוד אוויר מסתובב." },
  { id: 529, lang: "he", category: "weather", text: "איך קוראים לעמוד אוויר מסתובב?", options: ["הוריקן", "טורנדו", "טייפון", "ציקלון"], answer: 1, explanation: "טורנדו הוא עמוד אוויר מסתובב.", explanationHe: "טורנדו הוא עמוד אוויר מסתובב." },
  
  { id: 530, lang: "en", category: "transport", text: "Which vehicle is used to travel to space?", options: ["airplane", "helicopter", "rocket", "balloon"], answer: 2, explanation: "A rocket is used to travel to space.", explanationHe: "רקטה משמשת לנסיעה לחלל." },
  { id: 531, lang: "he", category: "transport", text: "איזה כלי משמש לנסיעה לחלל?", options: ["מטוס", "מסוק", "רקטה", "בלון"], answer: 2, explanation: "רקטה משמשת לנסיעה לחלל.", explanationHe: "רקטה משמשת לנסיעה לחלל." },
  
  { id: 532, lang: "en", category: "emotions", text: "What emotion do you feel when you achieve something difficult?", options: ["sadness", "pride", "anger", "fear"], answer: 1, explanation: "Pride is the emotion you feel when you achieve something difficult.", explanationHe: "גאווה היא הרגש שאתה מרגיש כשאתה משיג משהו קשה." },
  { id: 533, lang: "he", category: "emotions", text: "איזה רגש מרגישים כשמשיגים משהו קשה?", options: ["עצב", "גאווה", "כעס", "פחד"], answer: 1, explanation: "גאווה היא הרגש שמרגישים כשמשיגים משהו קשה.", explanationHe: "גאווה היא הרגש שמרגישים כשמשיגים משהו קשה." },
  
  { id: 534, lang: "en", category: "school", text: "What do you call a person who studies at a university?", options: ["teacher", "student", "professor", "principal"], answer: 1, explanation: "A person who studies at a university is called a student.", explanationHe: "אדם שלומד באוניברסיטה נקרא סטודנט." },
  { id: 535, lang: "he", category: "school", text: "איך קוראים לאדם שלומד באוניברסיטה?", options: ["מורה", "סטודנט", "פרופסור", "מנהל"], answer: 1, explanation: "אדם שלומד באוניברסיטה נקרא סטודנט.", explanationHe: "אדם שלומד באוניברסיטה נקרא סטודנט." },
  
  { id: 536, lang: "en", category: "family", text: "Who is your mother's sister?", options: ["aunt", "uncle", "cousin", "grandmother"], answer: 0, explanation: "Your mother's sister is your aunt.", explanationHe: "אחות של אמא היא דודה." },
  { id: 537, lang: "he", category: "family", text: "מי היא אחות של אמא?", options: ["דודה", "דוד", "בת דודה", "סבתא"], answer: 0, explanation: "אחות של אמא היא דודה.", explanationHe: "אחות של אמא היא דודה." },
  
  { id: 538, lang: "en", category: "health", text: "What do you call a person who takes care of your teeth?", options: ["doctor", "nurse", "dentist", "pharmacist"], answer: 2, explanation: "A dentist takes care of your teeth.", explanationHe: "רופא שיניים מטפל בשיניים שלך." },
  { id: 539, lang: "he", category: "health", text: "איך קוראים לאדם שמטפל בשיניים?", options: ["רופא", "אחות", "רופא שיניים", "רוקח"], answer: 2, explanation: "רופא שיניים מטפל בשיניים.", explanationHe: "רופא שיניים מטפל בשיניים." },
  
  { id: 540, lang: "en", category: "clothes", text: "What do you wear on your hands when it's cold?", options: ["socks", "gloves", "shoes", "hat"], answer: 1, explanation: "You wear gloves on your hands when it's cold.", explanationHe: "לובשים כפפות על הידיים כשקר." },
  { id: 541, lang: "he", category: "clothes", text: "מה לובשים על הידיים כשקר?", options: ["גרביים", "כפפות", "נעליים", "כובע"], answer: 1, explanation: "לובשים כפפות על הידיים כשקר.", explanationHe: "לובשים כפפות על הידיים כשקר." },
  
  { id: 542, lang: "en", category: "verbs", text: "What is the past tense of 'run'?", options: ["runned", "ran", "runs", "running"], answer: 1, explanation: "The past tense of 'run' is 'ran'.", explanationHe: "העבר של 'run' הוא 'ran'." },
  { id: 543, lang: "he", category: "verbs", text: "מה צורת העבר של 'לרוץ'?", options: ["רץ", "רצה", "רצו", "רצתי"], answer: 0, explanation: "'רץ' היא צורת העבר ליחיד.", explanationHe: "'רץ' היא צורת העבר ליחיד." },
  
  { id: 544, lang: "en", category: "adjectives", text: "What is the opposite of 'fast'?", options: ["quick", "slow", "rapid", "speedy"], answer: 1, explanation: "The opposite of 'fast' is 'slow'.", explanationHe: "ההפך מ-'fast' הוא 'slow'." },
  { id: 545, lang: "he", category: "adjectives", text: "מה ההפך מ-'מהיר'?", options: ["מהיר", "איטי", "זריז", "מהיר"], answer: 1, explanation: "ההפך מ-'מהיר' הוא 'איטי'.", explanationHe: "ההפך מ-'מהיר' הוא 'איטי'." },
  
  { id: 546, lang: "en", category: "numbers", text: "What is 15 + 25?", options: ["35", "40", "45", "50"], answer: 1, explanation: "15 + 25 = 40.", explanationHe: "15 + 25 = 40." },
  { id: 547, lang: "he", category: "numbers", text: "כמה זה 15 + 25?", options: ["35", "40", "45", "50"], answer: 1, explanation: "15 + 25 = 40.", explanationHe: "15 + 25 = 40." },
  
  { id: 548, lang: "en", category: "days", text: "Which day comes before Monday?", options: ["Sunday", "Tuesday", "Wednesday", "Thursday"], answer: 0, explanation: "Sunday comes before Monday.", explanationHe: "ראשון בא לפני שני." },
  { id: 549, lang: "he", category: "days", text: "איזה יום בא לפני שני?", options: ["ראשון", "שלישי", "רביעי", "חמישי"], answer: 0, explanation: "ראשון בא לפני שני.", explanationHe: "ראשון בא לפני שני." },
  
  { id: 550, lang: "en", category: "countries", text: "Which country is known for the Great Wall?", options: ["Japan", "China", "India", "Korea"], answer: 1, explanation: "China is known for the Great Wall.", explanationHe: "סין מפורסמת בחומה הגדולה." },
  { id: 551, lang: "he", category: "countries", text: "איזו מדינה מפורסמת בחומה הגדולה?", options: ["יפן", "סין", "הודו", "קוריאה"], answer: 1, explanation: "סין מפורסמת בחומה הגדולה.", explanationHe: "סין מפורסמת בחומה הגדולה." },
  
  // Space
  { id: 422, lang: "en", category: "space", text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1, explanation: "Mars is called the Red Planet because of its reddish appearance.", explanationHe: "מאדים מכונה כוכב הלכת האדום בגלל מראהו האדמדם." },
  { id: 423, lang: "he", category: "space", text: "איזה כוכב לכת מכונה 'הכוכב האדום'?", options: ["נוגה", "מאדים", "צדק", "שבתאי"], answer: 1, explanation: "מאדים מכונה כוכב הלכת האדום בגלל מראהו האדמדם.", explanationHe: "מאדים מכונה כוכב הלכת האדום בגלל מראהו האדמדם." },
  
  // Additional Advanced Questions - Level 2
  { id: 600, lang: "en", category: "mathematics", text: "What is 7 × 8?", options: ["54", "56", "58", "60"], answer: 1, explanation: "7 × 8 = 56.", explanationHe: "7 × 8 = 56." },
  { id: 601, lang: "he", category: "mathematics", text: "כמה זה 7 × 8?", options: ["54", "56", "58", "60"], answer: 1, explanation: "7 × 8 = 56.", explanationHe: "7 × 8 = 56." },
  
  { id: 602, lang: "en", category: "physics", text: "What is the speed of light?", options: ["300,000 km/s", "300,000,000 m/s", "3,000,000 km/s", "30,000,000 m/s"], answer: 1, explanation: "The speed of light is approximately 300,000,000 meters per second.", explanationHe: "מהירות האור היא בערך 300,000,000 מטר לשנייה." },
  { id: 603, lang: "he", category: "physics", text: "מה מהירות האור?", options: ["300,000 ק\"מ/שנ", "300,000,000 מ'/שנ", "3,000,000 ק\"מ/שנ", "30,000,000 מ'/שנ"], answer: 1, explanation: "מהירות האור היא בערך 300,000,000 מטר לשנייה.", explanationHe: "מהירות האור היא בערך 300,000,000 מטר לשנייה." },
  
  { id: 604, lang: "en", category: "chemistry", text: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2, explanation: "The chemical symbol for gold is Au (from Latin 'aurum').", explanationHe: "הסימן הכימי של זהב הוא Au (מלטינית 'aurum')." },
  { id: 605, lang: "he", category: "chemistry", text: "מה הסימן הכימי של זהב?", options: ["Go", "Gd", "Au", "Ag"], answer: 2, explanation: "הסימן הכימי של זהב הוא Au.", explanationHe: "הסימן הכימי של זהב הוא Au." },
  
  { id: 606, lang: "en", category: "biology", text: "What is the powerhouse of the cell?", options: ["nucleus", "mitochondria", "ribosome", "cytoplasm"], answer: 1, explanation: "Mitochondria are known as the powerhouse of the cell.", explanationHe: "המיטוכונדריה מכונה 'תחנת הכוח' של התא." },
  { id: 607, lang: "he", category: "biology", text: "מה מכונה 'תחנת הכוח' של התא?", options: ["גרעין", "מיטוכונדריה", "ריבוזום", "ציטופלזמה"], answer: 1, explanation: "המיטוכונדריה מכונה 'תחנת הכוח' של התא.", explanationHe: "המיטוכונדריה מכונה 'תחנת הכוח' של התא." },
  
  { id: 608, lang: "en", category: "astronomy", text: "How many moons does Earth have?", options: ["0", "1", "2", "3"], answer: 1, explanation: "Earth has one moon.", explanationHe: "לכדור הארץ יש ירח אחד." },
  { id: 609, lang: "he", category: "astronomy", text: "כמה ירחים יש לכדור הארץ?", options: ["0", "1", "2", "3"], answer: 1, explanation: "לכדור הארץ יש ירח אחד.", explanationHe: "לכדור הארץ יש ירח אחד." },
  
  { id: 610, lang: "en", category: "psychology", text: "What is the study of human behavior called?", options: ["biology", "psychology", "sociology", "anthropology"], answer: 1, explanation: "Psychology is the study of human behavior and mental processes.", explanationHe: "פסיכולוגיה היא חקר התנהגות האדם ותהליכים מנטליים." },
  { id: 611, lang: "he", category: "psychology", text: "איך קוראים לחקר התנהגות האדם?", options: ["ביולוגיה", "פסיכולוגיה", "סוציולוגיה", "אנתרופולוגיה"], answer: 1, explanation: "פסיכולוגיה היא חקר התנהגות האדם.", explanationHe: "פסיכולוגיה היא חקר התנהגות האדם." },
  
  { id: 612, lang: "en", category: "philosophy", text: "Who said 'I think, therefore I am'?", options: ["Plato", "Aristotle", "Descartes", "Socrates"], answer: 2, explanation: "René Descartes said 'Cogito, ergo sum' (I think, therefore I am).", explanationHe: "רנה דקארט אמר 'אני חושב, לכן אני קיים'." },
  { id: 613, lang: "he", category: "philosophy", text: "מי אמר 'אני חושב, לכן אני קיים'?", options: ["אפלטון", "אריסטו", "דקארט", "סוקרטס"], answer: 2, explanation: "רנה דקארט אמר 'אני חושב, לכן אני קיים'.", explanationHe: "רנה דקארט אמר 'אני חושב, לכן אני קיים'." },
  
  { id: 614, lang: "en", category: "economics", text: "What does GDP stand for?", options: ["Gross Domestic Product", "General Domestic Product", "Gross Daily Product", "General Daily Product"], answer: 0, explanation: "GDP stands for Gross Domestic Product.", explanationHe: "GDP הוא ראשי תיבות של Gross Domestic Product (תוצר מקומי גולמי)." },
  { id: 615, lang: "he", category: "economics", text: "מה המשמעות של GDP?", options: ["תוצר מקומי גולמי", "תוצר כללי מקומי", "תוצר יומי גולמי", "תוצר יומי כללי"], answer: 0, explanation: "GDP הוא תוצר מקומי גולמי.", explanationHe: "GDP הוא תוצר מקומי גולמי." },
  
  { id: 616, lang: "en", category: "politics", text: "How many branches of government are there in the US?", options: ["2", "3", "4", "5"], answer: 1, explanation: "The US has three branches: executive, legislative, and judicial.", explanationHe: "לארה\"ב יש שלושה ענפי ממשלה: מבצע, מחוקק ושופט." },
  { id: 617, lang: "he", category: "politics", text: "כמה ענפי ממשלה יש בארה\"ב?", options: ["2", "3", "4", "5"], answer: 1, explanation: "לארה\"ב יש שלושה ענפי ממשלה.", explanationHe: "לארה\"ב יש שלושה ענפי ממשלה." },
  
  { id: 618, lang: "en", category: "religion", text: "What is the holy book of Islam?", options: ["Bible", "Torah", "Quran", "Vedas"], answer: 2, explanation: "The Quran is the holy book of Islam.", explanationHe: "הקוראן הוא הספר הקדוש של האסלאם." },
  { id: 619, lang: "he", category: "religion", text: "מה הספר הקדוש של האסלאם?", options: ["הביבליה", "התורה", "הקוראן", "הוודות"], answer: 2, explanation: "הקוראן הוא הספר הקדוש של האסלאם.", explanationHe: "הקוראן הוא הספר הקדוש של האסלאם." },
  
  { id: 620, lang: "en", category: "mythology", text: "Who is the king of the gods in Greek mythology?", options: ["Poseidon", "Hades", "Zeus", "Apollo"], answer: 2, explanation: "Zeus is the king of the gods in Greek mythology.", explanationHe: "זאוס הוא מלך האלים במיתולוגיה היוונית." },
  { id: 621, lang: "he", category: "mythology", text: "מי מלך האלים במיתולוגיה היוונית?", options: ["פוסידון", "האדס", "זאוס", "אפולו"], answer: 2, explanation: "זאוס הוא מלך האלים במיתולוגיה היוונית.", explanationHe: "זאוס הוא מלך האלים במיתולוגיה היוונית." },
  
  { id: 622, lang: "en", category: "architecture", text: "What architectural style is the Eiffel Tower?", options: ["Gothic", "Baroque", "Art Nouveau", "Modern"], answer: 2, explanation: "The Eiffel Tower is an example of Art Nouveau architecture.", explanationHe: "מגדל אייפל הוא דוגמה לארכיטקטורה ארט נובו." },
  { id: 623, lang: "he", category: "architecture", text: "איזה סגנון ארכיטקטוני הוא מגדל אייפל?", options: ["גותי", "ברוק", "ארט נובו", "מודרני"], answer: 2, explanation: "מגדל אייפל הוא דוגמה לארכיטקטורה ארט נובו.", explanationHe: "מגדל אייפל הוא דוגמה לארכיטקטורה ארט נובו." },
  
  { id: 624, lang: "en", category: "fashion", text: "What is the traditional Japanese garment called?", options: ["Kimono", "Sari", "Kilt", "Dirndl"], answer: 0, explanation: "Kimono is the traditional Japanese garment.", explanationHe: "קימונו הוא הלבוש המסורתי היפני." },
  { id: 625, lang: "he", category: "fashion", text: "איך קוראים לבגד המסורתי היפני?", options: ["קימונו", "סארי", "קילט", "דירנדל"], answer: 0, explanation: "קימונו הוא הבגד המסורתי היפני.", explanationHe: "קימונו הוא הבגד המסורתי היפני." },
  
  { id: 626, lang: "en", category: "cuisine", text: "What is the national dish of Italy?", options: ["Pizza", "Pasta", "Risotto", "All of the above"], answer: 3, explanation: "Italy doesn't have one official national dish, but pizza, pasta, and risotto are all iconic Italian foods.", explanationHe: "איטליה לא מגדירה מנה לאומית אחת, אבל פיצה, פסטה וריזוטו כולם מזונות איטלקיים אייקוניים." },
  { id: 627, lang: "he", category: "cuisine", text: "מה המנה הלאומית של איטליה?", options: ["פיצה", "פסטה", "ריזוטו", "כל התשובות נכונות"], answer: 3, explanation: "איטליה לא מגדירה מנה לאומית אחת, אבל פיצה, פסטה וריזוטו כולם מזונות איטלקיים אייקוניים.", explanationHe: "איטליה לא מגדירה מנה לאומית אחת, אבל פיצה, פסטה וריזוטו כולם מזונות איטלקיים אייקוניים." },
  
  { id: 628, lang: "en", category: "dance", text: "What dance originated in Argentina?", options: ["Salsa", "Tango", "Flamenco", "Samba"], answer: 1, explanation: "Tango originated in Argentina.", explanationHe: "טנגו נוצר בארגנטינה." },
  { id: 629, lang: "he", category: "dance", text: "איזה ריקוד נוצר בארגנטינה?", options: ["סאלסה", "טנגו", "פלמנקו", "סמבה"], answer: 1, explanation: "טנגו נוצר בארגנטינה.", explanationHe: "טנגו נוצר בארגנטינה." },
  
  { id: 630, lang: "en", category: "games", text: "What game uses 32 pieces on each side?", options: ["Chess", "Checkers", "Go", "Backgammon"], answer: 0, explanation: "Chess uses 32 pieces on each side (16 pieces per player).", explanationHe: "שחמט משתמש ב-32 כלים בכל צד (16 כלים לכל שחקן)." },
  { id: 631, lang: "he", category: "games", text: "איזה משחק משתמש ב-32 כלים בכל צד?", options: ["שחמט", "דמקה", "גו", "שש-בש"], answer: 0, explanation: "שחמט משתמש ב-32 כלים בכל צד.", explanationHe: "שחמט משתמש ב-32 כלים בכל צד." },
  
  { id: 632, lang: "en", category: "inventions", text: "Who invented the telephone?", options: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Guglielmo Marconi"], answer: 1, explanation: "Alexander Graham Bell is credited with inventing the telephone.", explanationHe: "אלכסנדר גרהם בל נחשב לממציא הטלפון." },
  { id: 633, lang: "he", category: "inventions", text: "מי המציא את הטלפון?", options: ["תומס אדיסון", "אלכסנדר גרהם בל", "ניקולה טסלה", "גוליילמו מרקוני"], answer: 1, explanation: "אלכסנדר גרהם בל נחשב לממציא הטלפון.", explanationHe: "אלכסנדר גרהם בל נחשב לממציא הטלפון." },
  
  { id: 634, lang: "en", category: "discoveries", text: "What did Marie Curie discover?", options: ["X-rays", "Radium", "Electron", "Neutron"], answer: 1, explanation: "Marie Curie discovered radium and polonium.", explanationHe: "מארי קירי גילתה רדיום ופולוניום." },
  { id: 635, lang: "he", category: "discoveries", text: "מה מארי קירי גילתה?", options: ["קרני X", "רדיום", "אלקטרון", "ניוטרון"], answer: 1, explanation: "מארי קירי גילתה רדיום ופולוניום.", explanationHe: "מארי קירי גילתה רדיום ופולוניום." },
  
  { id: 636, lang: "en", category: "exploration", text: "Who was the first person to reach the South Pole?", options: ["Robert Scott", "Roald Amundsen", "Ernest Shackleton", "Edmund Hillary"], answer: 1, explanation: "Roald Amundsen was the first person to reach the South Pole.", explanationHe: "רואלד אמונדסן היה האדם הראשון שהגיע לקוטב הדרומי." },
  { id: 637, lang: "he", category: "exploration", text: "מי היה האדם הראשון שהגיע לקוטב הדרומי?", options: ["רוברט סקוט", "רואלד אמונדסן", "ארנסט שקלטון", "אדמונד הילרי"], answer: 1, explanation: "רואלד אמונדסן היה האדם הראשון שהגיע לקוטב הדרומי.", explanationHe: "רואלד אמונדסן היה האדם הראשון שהגיע לקוטב הדרומי." },
  
  { id: 638, lang: "en", category: "medicine", text: "What does MRI stand for?", options: ["Magnetic Resonance Imaging", "Medical Resonance Imaging", "Magnetic Radio Imaging", "Medical Radio Imaging"], answer: 0, explanation: "MRI stands for Magnetic Resonance Imaging.", explanationHe: "MRI הוא ראשי תיבות של Magnetic Resonance Imaging (דימות תהודה מגנטית)." },
  { id: 639, lang: "he", category: "medicine", text: "מה המשמעות של MRI?", options: ["דימות תהודה מגנטית", "דימות רפואי תהודה", "דימות מגנטי רדיו", "דימות רפואי רדיו"], answer: 0, explanation: "MRI הוא דימות תהודה מגנטית.", explanationHe: "MRI הוא דימות תהודה מגנטית." },
  
  { id: 640, lang: "en", category: "psychology", text: "What is the fear of heights called?", options: ["Arachnophobia", "Acrophobia", "Claustrophobia", "Agoraphobia"], answer: 1, explanation: "Acrophobia is the fear of heights.", explanationHe: "אקרופוביה היא הפחד מגבהים." },
  { id: 641, lang: "he", category: "psychology", text: "איך קוראים לפחד מגבהים?", options: ["ארכנופוביה", "אקרופוביה", "קלאוסטרופוביה", "אגורפוביה"], answer: 1, explanation: "אקרופוביה היא הפחד מגבהים.", explanationHe: "אקרופוביה היא הפחד מגבהים." },
  
  { id: 642, lang: "en", category: "linguistics", text: "How many official languages does Switzerland have?", options: ["2", "3", "4", "5"], answer: 2, explanation: "Switzerland has four official languages: German, French, Italian, and Romansh.", explanationHe: "לשווייץ יש ארבע שפות רשמיות: גרמנית, צרפתית, איטלקית ורומאנש." },
  { id: 643, lang: "he", category: "linguistics", text: "כמה שפות רשמיות יש לשווייץ?", options: ["2", "3", "4", "5"], answer: 2, explanation: "לשווייץ יש ארבע שפות רשמיות.", explanationHe: "לשווייץ יש ארבע שפות רשמיות." },
  
  { id: 644, lang: "en", category: "geography", text: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: 1, explanation: "Vatican City is the smallest country in the world.", explanationHe: "הוותיקן הוא המדינה הקטנה ביותר בעולם." },
  { id: 645, lang: "he", category: "geography", text: "מה המדינה הקטנה ביותר בעולם?", options: ["מונקו", "הוותיקן", "סן מרינו", "לטנשטיין"], answer: 1, explanation: "הוותיקן הוא המדינה הקטנה ביותר בעולם.", explanationHe: "הוותיקן הוא המדינה הקטנה ביותר בעולם." },
  
  { id: 646, lang: "en", category: "climate", text: "What is the hottest place on Earth?", options: ["Death Valley", "Sahara Desert", "Lut Desert", "Sonoran Desert"], answer: 2, explanation: "The Lut Desert in Iran holds the record for the hottest temperature on Earth.", explanationHe: "מדבר לוט באיראן מחזיק בשיא הטמפרטורה הגבוהה ביותר על כדור הארץ." },
  { id: 647, lang: "he", category: "climate", text: "איזה המקום החם ביותר על כדור הארץ?", options: ["עמק המוות", "מדבר סהרה", "מדבר לוט", "מדבר סונורה"], answer: 2, explanation: "מדבר לוט באיראן מחזיק בשיא הטמפרטורה הגבוהה ביותר.", explanationHe: "מדבר לוט באיראן מחזיק בשיא הטמפרטורה הגבוהה ביותר." },
  
  { id: 648, lang: "en", category: "oceanography", text: "What is the deepest part of the ocean called?", options: ["Mariana Trench", "Puerto Rico Trench", "Java Trench", "Tonga Trench"], answer: 0, explanation: "The Mariana Trench is the deepest part of the ocean.", explanationHe: "שקע מריאנה הוא החלק העמוק ביותר באוקיינוס." },
  { id: 649, lang: "he", category: "oceanography", text: "איך קוראים לחלק העמוק ביותר באוקיינוס?", options: ["שקע מריאנה", "שקע פוארטו ריקו", "שקע ג'אווה", "שקע טונגה"], answer: 0, explanation: "שקע מריאנה הוא החלק העמוק ביותר באוקיינוס.", explanationHe: "שקע מריאנה הוא החלק העמוק ביותר באוקיינוס." },
  
  { id: 650, lang: "en", category: "botany", text: "What is the largest flower in the world?", options: ["Rafflesia", "Sunflower", "Lotus", "Rose"], answer: 0, explanation: "Rafflesia arnoldii is the largest flower in the world.", explanationHe: "רפליה ארנולדי היא הפרח הגדול ביותר בעולם." },
  { id: 651, lang: "he", category: "botany", text: "מה הפרח הגדול ביותר בעולם?", options: ["רפליה", "חמנייה", "לוטוס", "ורד"], answer: 0, explanation: "רפליה ארנולדי היא הפרח הגדול ביותר בעולם.", explanationHe: "רפליה ארנולדי היא הפרח הגדול ביותר בעולם." },
  
  // Additional Advanced Questions - Level 3
  { id: 700, lang: "en", category: "mathematics", text: "What is the square root of 144?", options: ["10", "11", "12", "13"], answer: 2, explanation: "12 × 12 = 144, so √144 = 12.", explanationHe: "12 × 12 = 144, לכן √144 = 12." },
  { id: 701, lang: "he", category: "mathematics", text: "מה השורש הריבועי של 144?", options: ["10", "11", "12", "13"], answer: 2, explanation: "12 × 12 = 144, לכן √144 = 12.", explanationHe: "12 × 12 = 144, לכן √144 = 12." },
  
  { id: 702, lang: "en", category: "physics", text: "What is the unit of force?", options: ["Joule", "Watt", "Newton", "Pascal"], answer: 2, explanation: "Force is measured in Newtons (N).", explanationHe: "כוח נמדד בניוטון (N)." },
  { id: 703, lang: "he", category: "physics", text: "מה יחידת המידה של כוח?", options: ["ג'ול", "וואט", "ניוטון", "פסקל"], answer: 2, explanation: "כוח נמדד בניוטון.", explanationHe: "כוח נמדד בניוטון." },
  { id: 988, lang: "en", category: "physics", text: "What is the unit of energy?", options: ["Newton", "Watt", "Joule", "Pascal"], answer: 2, explanation: "Energy is measured in Joules (J).", explanationHe: "אנרגיה נמדדת בג'ול (J)." },
  { id: 989, lang: "he", category: "physics", text: "מה יחידת המידה של אנרגיה?", options: ["ניוטון", "וואט", "ג'ול", "פסקל"], answer: 2, explanation: "אנרגיה נמדדת בג'ול.", explanationHe: "אנרגיה נמדדת בג'ול." },
  { id: 990, lang: "en", category: "physics", text: "What is the unit of power?", options: ["Joule", "Watt", "Newton", "Pascal"], answer: 1, explanation: "Power is measured in Watts (W).", explanationHe: "הספק נמדד בוואט (W)." },
  { id: 991, lang: "he", category: "physics", text: "מה יחידת המידה של הספק?", options: ["ג'ול", "וואט", "ניוטון", "פסקל"], answer: 1, explanation: "הספק נמדד בוואט.", explanationHe: "הספק נמדד בוואט." },
  { id: 992, lang: "en", category: "physics", text: "What is gravity?", options: ["A force that pulls objects down", "A type of energy", "A form of light", "A chemical reaction"], answer: 0, explanation: "Gravity is a force that pulls objects toward each other.", explanationHe: "כוח המשיכה הוא כוח שמושך עצמים זה לזה." },
  { id: 993, lang: "he", category: "physics", text: "מה זה כוח משיכה?", options: ["כוח שמושך עצמים למטה", "סוג של אנרגיה", "צורה של אור", "תגובה כימית"], answer: 0, explanation: "כוח המשיכה הוא כוח שמושך עצמים זה לזה.", explanationHe: "כוח המשיכה הוא כוח שמושך עצמים זה לזה." },
  { id: 994, lang: "en", category: "physics", text: "What is the formula for speed?", options: ["distance × time", "distance ÷ time", "time ÷ distance", "distance + time"], answer: 1, explanation: "Speed = distance ÷ time.", explanationHe: "מהירות = מרחק ÷ זמן." },
  { id: 995, lang: "he", category: "physics", text: "מה הנוסחה למהירות?", options: ["מרחק × זמן", "מרחק ÷ זמן", "זמן ÷ מרחק", "מרחק + זמן"], answer: 1, explanation: "מהירות = מרחק ÷ זמן.", explanationHe: "מהירות = מרחק ÷ זמן." },
  { id: 996, lang: "en", category: "physics", text: "What is the acceleration due to gravity on Earth?", options: ["9.8 m/s²", "10 m/s²", "8.8 m/s²", "11 m/s²"], answer: 0, explanation: "The acceleration due to gravity on Earth is approximately 9.8 m/s².", explanationHe: "תאוצת הכובד על כדור הארץ היא בערך 9.8 מ'/שנ²." },
  { id: 997, lang: "he", category: "physics", text: "מה תאוצת הכובד על כדור הארץ?", options: ["9.8 מ'/שנ²", "10 מ'/שנ²", "8.8 מ'/שנ²", "11 מ'/שנ²"], answer: 0, explanation: "תאוצת הכובד על כדור הארץ היא בערך 9.8 מ'/שנ².", explanationHe: "תאוצת הכובד על כדור הארץ היא בערך 9.8 מ'/שנ²." },
  { id: 998, lang: "en", category: "physics", text: "What is the unit of electric current?", options: ["Volt", "Ampere", "Ohm", "Watt"], answer: 1, explanation: "Electric current is measured in Amperes (A).", explanationHe: "זרם חשמלי נמדד באמפר (A)." },
  { id: 999, lang: "he", category: "physics", text: "מה יחידת המידה של זרם חשמלי?", options: ["וולט", "אמפר", "אוהם", "וואט"], answer: 1, explanation: "זרם חשמלי נמדד באמפר.", explanationHe: "זרם חשמלי נמדד באמפר." },
  { id: 1000, lang: "en", category: "physics", text: "What is the unit of voltage?", options: ["Ampere", "Volt", "Ohm", "Watt"], answer: 1, explanation: "Voltage is measured in Volts (V).", explanationHe: "מתח חשמלי נמדד בוולט (V)." },
  { id: 1001, lang: "he", category: "physics", text: "מה יחידת המידה של מתח חשמלי?", options: ["אמפר", "וולט", "אוהם", "וואט"], answer: 1, explanation: "מתח חשמלי נמדד בוולט.", explanationHe: "מתח חשמלי נמדד בוולט." },
  { id: 1002, lang: "en", category: "physics", text: "What is the unit of resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], answer: 2, explanation: "Electrical resistance is measured in Ohms (Ω).", explanationHe: "התנגדות חשמלית נמדדת באוהם (Ω)." },
  { id: 1003, lang: "he", category: "physics", text: "מה יחידת המידה של התנגדות חשמלית?", options: ["וולט", "אמפר", "אוהם", "וואט"], answer: 2, explanation: "התנגדות חשמלית נמדדת באוהם.", explanationHe: "התנגדות חשמלית נמדדת באוהם." },
  { id: 1004, lang: "en", category: "physics", text: "What is the speed of sound in air?", options: ["300 m/s", "330 m/s", "350 m/s", "400 m/s"], answer: 1, explanation: "The speed of sound in air is approximately 330 m/s.", explanationHe: "מהירות הקול באוויר היא בערך 330 מ'/שנ." },
  { id: 1005, lang: "he", category: "physics", text: "מה מהירות הקול באוויר?", options: ["300 מ'/שנ", "330 מ'/שנ", "350 מ'/שנ", "400 מ'/שנ"], answer: 1, explanation: "מהירות הקול באוויר היא בערך 330 מ'/שנ.", explanationHe: "מהירות הקול באוויר היא בערך 330 מ'/שנ." },
  { id: 1006, lang: "en", category: "physics", text: "What is mass?", options: ["The weight of an object", "The amount of matter in an object", "The size of an object", "The color of an object"], answer: 1, explanation: "Mass is the amount of matter in an object.", explanationHe: "מסה היא כמות החומר בעצם." },
  { id: 1007, lang: "he", category: "physics", text: "מה זה מסה?", options: ["המשקל של עצם", "כמות החומר בעצם", "הגודל של עצם", "הצבע של עצם"], answer: 1, explanation: "מסה היא כמות החומר בעצם.", explanationHe: "מסה היא כמות החומר בעצם." },
  { id: 1008, lang: "en", category: "physics", text: "What is density?", options: ["mass × volume", "mass ÷ volume", "volume ÷ mass", "mass + volume"], answer: 1, explanation: "Density = mass ÷ volume.", explanationHe: "צפיפות = מסה ÷ נפח." },
  { id: 1009, lang: "he", category: "physics", text: "מה הנוסחה לצפיפות?", options: ["מסה × נפח", "מסה ÷ נפח", "נפח ÷ מסה", "מסה + נפח"], answer: 1, explanation: "צפיפות = מסה ÷ נפח.", explanationHe: "צפיפות = מסה ÷ נפח." },
  { id: 1010, lang: "en", category: "physics", text: "What is momentum?", options: ["mass × velocity", "mass ÷ velocity", "velocity ÷ mass", "mass + velocity"], answer: 0, explanation: "Momentum = mass × velocity.", explanationHe: "תנע = מסה × מהירות." },
  { id: 1011, lang: "he", category: "physics", text: "מה הנוסחה לתנע?", options: ["מסה × מהירות", "מסה ÷ מהירות", "מהירות ÷ מסה", "מסה + מהירות"], answer: 0, explanation: "תנע = מסה × מהירות.", explanationHe: "תנע = מסה × מהירות." },
  { id: 1012, lang: "en", category: "physics", text: "What is kinetic energy?", options: ["Energy of motion", "Stored energy", "Heat energy", "Light energy"], answer: 0, explanation: "Kinetic energy is the energy of motion.", explanationHe: "אנרגיה קינטית היא אנרגיית תנועה." },
  { id: 1013, lang: "he", category: "physics", text: "מה זה אנרגיה קינטית?", options: ["אנרגיית תנועה", "אנרגיה אגורה", "אנרגיית חום", "אנרגיית אור"], answer: 0, explanation: "אנרגיה קינטית היא אנרגיית תנועה.", explanationHe: "אנרגיה קינטית היא אנרגיית תנועה." },
  { id: 1014, lang: "en", category: "physics", text: "What is potential energy?", options: ["Energy of motion", "Stored energy", "Heat energy", "Light energy"], answer: 1, explanation: "Potential energy is stored energy.", explanationHe: "אנרגיה פוטנציאלית היא אנרגיה אגורה." },
  { id: 1015, lang: "he", category: "physics", text: "מה זה אנרגיה פוטנציאלית?", options: ["אנרגיית תנועה", "אנרגיה אגורה", "אנרגיית חום", "אנרגיית אור"], answer: 1, explanation: "אנרגיה פוטנציאלית היא אנרגיה אגורה.", explanationHe: "אנרגיה פוטנציאלית היא אנרגיה אגורה." },
  { id: 1016, lang: "en", category: "physics", text: "What is friction?", options: ["A force that opposes motion", "A type of energy", "A form of light", "A chemical reaction"], answer: 0, explanation: "Friction is a force that opposes motion.", explanationHe: "חיכוך הוא כוח שמתנגד לתנועה." },
  { id: 1017, lang: "he", category: "physics", text: "מה זה חיכוך?", options: ["כוח שמתנגד לתנועה", "סוג של אנרגיה", "צורה של אור", "תגובה כימית"], answer: 0, explanation: "חיכוך הוא כוח שמתנגד לתנועה.", explanationHe: "חיכוך הוא כוח שמתנגד לתנועה." },
  { id: 1018, lang: "en", category: "physics", text: "What is a wave?", options: ["A disturbance that transfers energy", "A type of particle", "A form of matter", "A chemical reaction"], answer: 0, explanation: "A wave is a disturbance that transfers energy.", explanationHe: "גל הוא הפרעה שמעבירה אנרגיה." },
  { id: 1019, lang: "he", category: "physics", text: "מה זה גל?", options: ["הפרעה שמעבירה אנרגיה", "סוג של חלקיק", "צורה של חומר", "תגובה כימית"], answer: 0, explanation: "גל הוא הפרעה שמעבירה אנרגיה.", explanationHe: "גל הוא הפרעה שמעבירה אנרגיה." },
  { id: 1020, lang: "en", category: "physics", text: "What is frequency?", options: ["The number of waves per second", "The height of a wave", "The speed of a wave", "The length of a wave"], answer: 0, explanation: "Frequency is the number of waves per second.", explanationHe: "תדירות היא מספר הגלים לשנייה." },
  { id: 1021, lang: "he", category: "physics", text: "מה זה תדירות?", options: ["מספר הגלים לשנייה", "גובה הגל", "מהירות הגל", "אורך הגל"], answer: 0, explanation: "תדירות היא מספר הגלים לשנייה.", explanationHe: "תדירות היא מספר הגלים לשנייה." },
  { id: 1022, lang: "en", category: "physics", text: "What is wavelength?", options: ["The number of waves per second", "The height of a wave", "The speed of a wave", "The distance between two wave peaks"], answer: 3, explanation: "Wavelength is the distance between two wave peaks.", explanationHe: "אורך גל הוא המרחק בין שני שיאי גל." },
  { id: 1023, lang: "he", category: "physics", text: "מה זה אורך גל?", options: ["מספר הגלים לשנייה", "גובה הגל", "מהירות הגל", "המרחק בין שני שיאי גל"], answer: 3, explanation: "אורך גל הוא המרחק בין שני שיאי גל.", explanationHe: "אורך גל הוא המרחק בין שני שיאי גל." },
  { id: 1024, lang: "en", category: "physics", text: "What is temperature?", options: ["A measure of heat", "A measure of cold", "A measure of how hot or cold something is", "A measure of pressure"], answer: 2, explanation: "Temperature is a measure of how hot or cold something is.", explanationHe: "טמפרטורה היא מדד לכמה משהו חם או קר." },
  { id: 1025, lang: "he", category: "physics", text: "מה זה טמפרטורה?", options: ["מדד לחום", "מדד לקור", "מדד לכמה משהו חם או קר", "מדד ללחץ"], answer: 2, explanation: "טמפרטורה היא מדד לכמה משהו חם או קר.", explanationHe: "טמפרטורה היא מדד לכמה משהו חם או קר." },
  { id: 1026, lang: "en", category: "physics", text: "What is pressure?", options: ["Force per unit area", "Force × area", "Area ÷ force", "Force + area"], answer: 0, explanation: "Pressure = force ÷ area.", explanationHe: "לחץ = כוח ÷ שטח." },
  { id: 1027, lang: "he", category: "physics", text: "מה הנוסחה ללחץ?", options: ["כוח ÷ שטח", "כוח × שטח", "שטח ÷ כוח", "כוח + שטח"], answer: 0, explanation: "לחץ = כוח ÷ שטח.", explanationHe: "לחץ = כוח ÷ שטח." },
  { id: 1028, lang: "en", category: "physics", text: "What is work in physics?", options: ["Force × distance", "Force ÷ distance", "Distance ÷ force", "Force + distance"], answer: 0, explanation: "Work = force × distance.", explanationHe: "עבודה = כוח × מרחק." },
  { id: 1029, lang: "he", category: "physics", text: "מה הנוסחה לעבודה בפיזיקה?", options: ["כוח × מרחק", "כוח ÷ מרחק", "מרחק ÷ כוח", "כוח + מרחק"], answer: 0, explanation: "עבודה = כוח × מרחק.", explanationHe: "עבודה = כוח × מרחק." },
  { id: 1030, lang: "en", category: "physics", text: "What is a magnet?", options: ["An object that attracts iron", "An object that repels iron", "An object that creates electricity", "An object that stores energy"], answer: 0, explanation: "A magnet is an object that attracts iron and other magnetic materials.", explanationHe: "מגנט הוא עצם שמושך ברזל וחומרים מגנטיים אחרים." },
  { id: 1031, lang: "he", category: "physics", text: "מה זה מגנט?", options: ["עצם שמושך ברזל", "עצם שדוחה ברזל", "עצם שיוצר חשמל", "עצם שמאחסן אנרגיה"], answer: 0, explanation: "מגנט הוא עצם שמושך ברזל וחומרים מגנטיים אחרים.", explanationHe: "מגנט הוא עצם שמושך ברזל וחומרים מגנטיים אחרים." },
  { id: 1032, lang: "en", category: "physics", text: "What is an atom?", options: ["The smallest unit of matter", "A type of energy", "A form of light", "A chemical reaction"], answer: 0, explanation: "An atom is the smallest unit of matter.", explanationHe: "אטום הוא יחידת החומר הקטנה ביותר." },
  { id: 1033, lang: "he", category: "physics", text: "מה זה אטום?", options: ["יחידת החומר הקטנה ביותר", "סוג של אנרגיה", "צורה של אור", "תגובה כימית"], answer: 0, explanation: "אטום הוא יחידת החומר הקטנה ביותר.", explanationHe: "אטום הוא יחידת החומר הקטנה ביותר." },
  { id: 1034, lang: "en", category: "physics", text: "What are the three states of matter?", options: ["Solid, liquid, gas", "Hot, cold, warm", "Big, small, medium", "Light, dark, gray"], answer: 0, explanation: "The three states of matter are solid, liquid, and gas.", explanationHe: "שלושת מצבי החומר הם מוצק, נוזל וגז." },
  { id: 1035, lang: "he", category: "physics", text: "מה שלושת מצבי החומר?", options: ["מוצק, נוזל, גז", "חם, קר, חמים", "גדול, קטן, בינוני", "בהיר, כהה, אפור"], answer: 0, explanation: "שלושת מצבי החומר הם מוצק, נוזל וגז.", explanationHe: "שלושת מצבי החומר הם מוצק, נוזל וגז." },
  
  { id: 752, lang: "en", category: "chemistry", text: "What is the pH of pure water?", options: ["6", "7", "8", "9"], answer: 1, explanation: "Pure water has a pH of 7, which is neutral.", explanationHe: "מים טהורים יש להם pH של 7, שהוא ניטרלי." },
  { id: 753, lang: "he", category: "chemistry", text: "מה ה-pH של מים טהורים?", options: ["6", "7", "8", "9"], answer: 1, explanation: "מים טהורים יש להם pH של 7.", explanationHe: "מים טהורים יש להם pH של 7." },
  
  { id: 706, lang: "en", category: "biology", text: "What is the largest organ in the human body?", options: ["liver", "brain", "skin", "heart"], answer: 2, explanation: "The skin is the largest organ in the human body.", explanationHe: "העור הוא האיבר הגדול ביותר בגוף האדם." },
  { id: 707, lang: "he", category: "biology", text: "מה האיבר הגדול ביותר בגוף האדם?", options: ["כבד", "מוח", "עור", "לב"], answer: 2, explanation: "העור הוא האיבר הגדול ביותר בגוף האדם.", explanationHe: "העור הוא האיבר הגדול ביותר בגוף האדם." },
  
  { id: 708, lang: "en", category: "astronomy", text: "What is the closest star to Earth?", options: ["Alpha Centauri", "Sun", "Sirius", "Proxima Centauri"], answer: 1, explanation: "The Sun is the closest star to Earth.", explanationHe: "השמש היא הכוכב הקרוב ביותר לכדור הארץ." },
  { id: 709, lang: "he", category: "astronomy", text: "מה הכוכב הקרוב ביותר לכדור הארץ?", options: ["אלפא קנטאורי", "שמש", "סיריוס", "פרוקסימה קנטאורי"], answer: 1, explanation: "השמש היא הכוכב הקרוב ביותר לכדור הארץ.", explanationHe: "השמש היא הכוכב הקרוב ביותר לכדור הארץ." },
  
  { id: 710, lang: "en", category: "psychology", text: "What is the study of dreams called?", options: ["oncology", "oneirology", "ophthalmology", "ornithology"], answer: 1, explanation: "Oneirology is the study of dreams.", explanationHe: "אונירולוגיה היא חקר החלומות." },
  { id: 711, lang: "he", category: "psychology", text: "איך קוראים לחקר החלומות?", options: ["אונקולוגיה", "אונירולוגיה", "אופטלמולוגיה", "אורניתולוגיה"], answer: 1, explanation: "אונירולוגיה היא חקר החלומות.", explanationHe: "אונירולוגיה היא חקר החלומות." },
  
  { id: 712, lang: "en", category: "philosophy", text: "What is the study of knowledge called?", options: ["epistemology", "ontology", "ethics", "aesthetics"], answer: 0, explanation: "Epistemology is the study of knowledge.", explanationHe: "אפיסטמולוגיה היא חקר הידע." },
  { id: 713, lang: "he", category: "philosophy", text: "איך קוראים לחקר הידע?", options: ["אפיסטמולוגיה", "אונטולוגיה", "אתיקה", "אסתטיקה"], answer: 0, explanation: "אפיסטמולוגיה היא חקר הידע.", explanationHe: "אפיסטמולוגיה היא חקר הידע." },
  
  { id: 714, lang: "en", category: "economics", text: "What does 'inflation' mean?", options: ["decrease in prices", "increase in prices", "stable prices", "no prices"], answer: 1, explanation: "Inflation is the general increase in prices over time.", explanationHe: "אינפלציה היא העלייה הכללית במחירים לאורך זמן." },
  { id: 715, lang: "he", category: "economics", text: "מה המשמעות של 'אינפלציה'?", options: ["ירידה במחירים", "עלייה במחירים", "מחירים יציבים", "אין מחירים"], answer: 1, explanation: "אינפלציה היא העלייה הכללית במחירים.", explanationHe: "אינפלציה היא העלייה הכללית במחירים." },
  
  { id: 716, lang: "en", category: "politics", text: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: 2, explanation: "Canberra is the capital of Australia.", explanationHe: "קנברה היא בירת אוסטרליה." },
  { id: 717, lang: "he", category: "politics", text: "מה בירת אוסטרליה?", options: ["סידני", "מלבורן", "קנברה", "פרת"], answer: 2, explanation: "קנברה היא בירת אוסטרליה.", explanationHe: "קנברה היא בירת אוסטרליה." },
  
  { id: 718, lang: "en", category: "religion", text: "What is the holy book of Judaism?", options: ["Bible", "Torah", "Quran", "Vedas"], answer: 1, explanation: "The Torah is the holy book of Judaism.", explanationHe: "התורה היא הספר הקדוש של היהדות." },
  { id: 719, lang: "he", category: "religion", text: "מה הספר הקדוש של היהדות?", options: ["הביבליה", "התורה", "הקוראן", "הוודות"], answer: 1, explanation: "התורה היא הספר הקדוש של היהדות.", explanationHe: "התורה היא הספר הקדוש של היהדות." },
  
  { id: 720, lang: "en", category: "mythology", text: "Who is the god of war in Greek mythology?", options: ["Apollo", "Ares", "Hermes", "Dionysus"], answer: 1, explanation: "Ares is the god of war in Greek mythology.", explanationHe: "ארס הוא אל המלחמה במיתולוגיה היוונית." },
  { id: 721, lang: "he", category: "mythology", text: "מי אל המלחמה במיתולוגיה היוונית?", options: ["אפולו", "ארס", "הרמס", "דיוניסוס"], answer: 1, explanation: "ארס הוא אל המלחמה במיתולוגיה היוונית.", explanationHe: "ארס הוא אל המלחמה במיתולוגיה היוונית." },
  
  { id: 722, lang: "en", category: "architecture", text: "What architectural style is the Colosseum?", options: ["Gothic", "Roman", "Baroque", "Renaissance"], answer: 1, explanation: "The Colosseum is an example of Roman architecture.", explanationHe: "הקולוסיאום הוא דוגמה לארכיטקטורה רומית." },
  { id: 723, lang: "he", category: "architecture", text: "איזה סגנון ארכיטקטוני הוא הקולוסיאום?", options: ["גותי", "רומי", "ברוק", "רנסנס"], answer: 1, explanation: "הקולוסיאום הוא דוגמה לארכיטקטורה רומית.", explanationHe: "הקולוסיאום הוא דוגמה לארכיטקטורה רומית." },
  
  { id: 724, lang: "en", category: "fashion", text: "What is the traditional Scottish garment called?", options: ["Kimono", "Kilt", "Sari", "Dirndl"], answer: 1, explanation: "The kilt is the traditional Scottish garment.", explanationHe: "הקילט הוא הלבוש המסורתי הסקוטי." },
  { id: 725, lang: "he", category: "fashion", text: "איך קוראים לבגד המסורתי הסקוטי?", options: ["קימונו", "קילט", "סארי", "דירנדל"], answer: 1, explanation: "הקילט הוא הלבוש המסורתי הסקוטי.", explanationHe: "הקילט הוא הלבוש המסורתי הסקוטי." },
  
  { id: 726, lang: "en", category: "cuisine", text: "What is the national dish of Japan?", options: ["Sushi", "Ramen", "Tempura", "All of the above"], answer: 3, explanation: "Japan doesn't have one official national dish, but sushi, ramen, and tempura are all iconic Japanese foods.", explanationHe: "ליפן אין מנה לאומית רשמית אחת, אבל סושי, ראמן וטמפורה כולם מזונות יפניים אייקוניים." },
  { id: 727, lang: "he", category: "cuisine", text: "מה המנה הלאומית של יפן?", options: ["סושי", "ראמן", "טמפורה", "כל התשובות נכונות"], answer: 3, explanation: "ליפן אין מנה לאומית רשמית אחת, אבל סושי, ראמן וטמפורה כולם מזונות יפניים אייקוניים.", explanationHe: "ליפן אין מנה לאומית רשמית אחת, אבל סושי, ראמן וטמפורה כולם מזונות יפניים אייקוניים." },
  
  { id: 728, lang: "en", category: "dance", text: "What dance originated in Spain?", options: ["Salsa", "Tango", "Flamenco", "Samba"], answer: 2, explanation: "Flamenco originated in Spain.", explanationHe: "פלמנקו נוצר בספרד." },
  { id: 729, lang: "he", category: "dance", text: "איזה ריקוד נוצר בספרד?", options: ["סאלסה", "טנגו", "פלמנקו", "סמבה"], answer: 2, explanation: "פלמנקו נוצר בספרד.", explanationHe: "פלמנקו נוצר בספרד." },
  
  { id: 730, lang: "en", category: "games", text: "What game is played on a 19x19 grid?", options: ["Chess", "Checkers", "Go", "Backgammon"], answer: 2, explanation: "Go is played on a 19x19 grid.", explanationHe: "גו משחקים על לוח 19x19." },
  { id: 731, lang: "he", category: "games", text: "איזה משחק משחקים על לוח 19x19?", options: ["שחמט", "דמקה", "גו", "שש-בש"], answer: 2, explanation: "גו משחקים על לוח 19x19.", explanationHe: "גו משחקים על לוח 19x19." },
  
  { id: 732, lang: "en", category: "inventions", text: "Who invented the light bulb?", options: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Guglielmo Marconi"], answer: 0, explanation: "Thomas Edison is credited with inventing the practical light bulb.", explanationHe: "תומס אדיסון נחשב לממציא הנורה המעשית." },
  { id: 733, lang: "he", category: "inventions", text: "מי המציא את הנורה?", options: ["תומס אדיסון", "אלכסנדר גרהם בל", "ניקולה טסלה", "גוליילמו מרקוני"], answer: 0, explanation: "תומס אדיסון נחשב לממציא הנורה המעשית.", explanationHe: "תומס אדיסון נחשב לממציא הנורה המעשית." },
  
  { id: 734, lang: "en", category: "discoveries", text: "What did Isaac Newton discover?", options: ["Gravity", "Electricity", "Magnetism", "Radioactivity"], answer: 0, explanation: "Isaac Newton discovered the laws of gravity.", explanationHe: "אייזק ניוטון גילה את חוקי הכבידה." },
  { id: 735, lang: "he", category: "discoveries", text: "מה אייזק ניוטון גילה?", options: ["כבידה", "חשמל", "מגנטיות", "רדיואקטיביות"], answer: 0, explanation: "אייזק ניוטון גילה את חוקי הכבידה.", explanationHe: "אייזק ניוטון גילה את חוקי הכבידה." },
  
  { id: 736, lang: "en", category: "exploration", text: "Who was the first person to reach the North Pole?", options: ["Robert Peary", "Roald Amundsen", "Ernest Shackleton", "Edmund Hillary"], answer: 0, explanation: "Robert Peary was the first person to reach the North Pole.", explanationHe: "רוברט פירי היה האדם הראשון שהגיע לקוטב הצפוני." },
  { id: 737, lang: "he", category: "exploration", text: "מי היה האדם הראשון שהגיע לקוטב הצפוני?", options: ["רוברט פירי", "רואלד אמונדסן", "ארנסט שקלטון", "אדמונד הילרי"], answer: 0, explanation: "רוברט פירי היה האדם הראשון שהגיע לקוטב הצפוני.", explanationHe: "רוברט פירי היה האדם הראשון שהגיע לקוטב הצפוני." },
  
  { id: 738, lang: "en", category: "medicine", text: "What does 'DNA' stand for?", options: ["Deoxyribonucleic Acid", "Deoxyribonucleic Atom", "Deoxyribonucleic Amino", "Deoxyribonucleic Atom"], answer: 0, explanation: "DNA stands for Deoxyribonucleic Acid.", explanationHe: "DNA הוא ראשי תיבות של Deoxyribonucleic Acid (חומצה דאוקסיריבונוקלאית)." },
  { id: 739, lang: "he", category: "medicine", text: "מה המשמעות של DNA?", options: ["חומצה דאוקסיריבונוקלאית", "אטום דאוקסיריבונוקלאי", "אמינו דאוקסיריבונוקלאי", "אטום דאוקסיריבונוקלאי"], answer: 0, explanation: "DNA הוא חומצה דאוקסיריבונוקלאית.", explanationHe: "DNA הוא חומצה דאוקסיריבונוקלאית." },
  
  { id: 740, lang: "en", category: "psychology", text: "What is the fear of spiders called?", options: ["Arachnophobia", "Acrophobia", "Claustrophobia", "Agoraphobia"], answer: 0, explanation: "Arachnophobia is the fear of spiders.", explanationHe: "ארכנופוביה היא הפחד מעכבישים." },
  { id: 741, lang: "he", category: "psychology", text: "איך קוראים לפחד מעכבישים?", options: ["ארכנופוביה", "אקרופוביה", "קלאוסטרופוביה", "אגורפוביה"], answer: 0, explanation: "ארכנופוביה היא הפחד מעכבישים.", explanationHe: "ארכנופוביה היא הפחד מעכבישים." },
  
  { id: 742, lang: "en", category: "linguistics", text: "How many letters are in the English alphabet?", options: ["24", "25", "26", "27"], answer: 2, explanation: "The English alphabet has 26 letters.", explanationHe: "לאלפבית האנגלי יש 26 אותיות." },
  { id: 743, lang: "he", category: "linguistics", text: "כמה אותיות יש באלפבית האנגלי?", options: ["24", "25", "26", "27"], answer: 2, explanation: "לאלפבית האנגלי יש 26 אותיות.", explanationHe: "לאלפבית האנגלי יש 26 אותיות." },
  
  { id: 744, lang: "en", category: "geography", text: "What is the largest country in the world?", options: ["China", "Canada", "Russia", "United States"], answer: 2, explanation: "Russia is the largest country in the world by land area.", explanationHe: "רוסיה היא המדינה הגדולה ביותר בעולם לפי שטח." },
  { id: 745, lang: "he", category: "geography", text: "מה המדינה הגדולה ביותר בעולם?", options: ["סין", "קנדה", "רוסיה", "ארצות הברית"], answer: 2, explanation: "רוסיה היא המדינה הגדולה ביותר בעולם לפי שטח.", explanationHe: "רוסיה היא המדינה הגדולה ביותר בעולם לפי שטח." },
  
  { id: 746, lang: "en", category: "climate", text: "What is the coldest place on Earth?", options: ["Antarctica", "Siberia", "Greenland", "Alaska"], answer: 0, explanation: "Antarctica is the coldest place on Earth.", explanationHe: "אנטארקטיקה היא המקום הקר ביותר על כדור הארץ." },
  { id: 747, lang: "he", category: "climate", text: "איזה המקום הקר ביותר על כדור הארץ?", options: ["אנטארקטיקה", "סיביר", "גרינלנד", "אלסקה"], answer: 0, explanation: "אנטארקטיקה היא המקום הקר ביותר על כדור הארץ.", explanationHe: "אנטארקטיקה היא המקום הקר ביותר על כדור הארץ." },
  
  { id: 748, lang: "en", category: "oceanography", text: "What is the largest ocean in the world?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3, explanation: "The Pacific Ocean is the largest ocean in the world.", explanationHe: "האוקיינוס השקט הוא הגדול ביותר בעולם." },
  { id: 749, lang: "he", category: "oceanography", text: "מה האוקיינוס הגדול ביותר בעולם?", options: ["אטלנטי", "הודי", "ארקטי", "שקט"], answer: 3, explanation: "האוקיינוס השקט הוא הגדול ביותר בעולם.", explanationHe: "האוקיינוס השקט הוא הגדול ביותר בעולם." },
  
  { id: 750, lang: "en", category: "botany", text: "What is the process by which plants make food called?", options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"], answer: 1, explanation: "Photosynthesis is the process by which plants make food using sunlight.", explanationHe: "פוטוסינתזה היא התהליך שבו צמחים מייצרים מזון באמצעות אור שמש." },
  { id: 751, lang: "he", category: "botany", text: "איך קוראים לתהליך שבו צמחים מייצרים מזון?", options: ["נשימה", "פוטוסינתזה", "עיכול", "תסיסה"], answer: 1, explanation: "פוטוסינתזה היא התהליך שבו צמחים מייצרים מזון.", explanationHe: "פוטוסינתזה היא התהליך שבו צמחים מייצרים מזון." },
  
  // Weather
  { id: 424, lang: "en", category: "weather", text: "What do we call frozen rain?", options: ["snow", "hail", "sleet", "frost"], answer: 1, explanation: "Hail is frozen rain that falls as ice pellets.", explanationHe: "ברד הוא גשם קפוא שנופל ככדורי קרח." },
  { id: 425, lang: "he", category: "weather", text: "איך קוראים לגשם קפוא?", options: ["שלג", "ברד", "קרח", "כפור"], answer: 1, explanation: "ברד הוא גשם קפוא שנופל ככדורי קרח.", explanationHe: "ברד הוא גשם קפוא שנופל ככדורי קרח." },
  
  // Additional Questions for Existing Categories
  
  // Grammar - More Questions
  { id: 800, lang: "en", category: "grammar", text: "Which sentence is correct?", options: ["I am go to school", "I go to school", "I going to school", "I goes to school"], answer: 1, explanation: "Present simple: I go to school.", explanationHe: "זמן הווה פשוט: I go to school." },
  { id: 801, lang: "he", category: "grammar", text: "איזה משפט נכון?", options: ["אני הולך לבית ספר", "אני הולכת לבית ספר", "אני הולכים לבית ספר", "אני הולכות לבית ספר"], answer: 0, explanation: "הנושא הוא 'אני' (זכר), לכן 'הולך'.", explanationHe: "הנושא הוא 'אני' (זכר), לכן 'הולך'." },
  
  { id: 802, lang: "en", category: "grammar", text: "What is the past tense of 'run'?", options: ["runned", "ran", "runed", "running"], answer: 1, explanation: "The past tense of 'run' is 'ran'.", explanationHe: "הפסקה העברית של 'run' היא 'ran'." },
  { id: 803, lang: "he", category: "grammar", text: "מה הפסקה העברית של 'run'?", options: ["runned", "ran", "runed", "running"], answer: 1, explanation: "הפסקה העברית של 'run' היא 'ran'.", explanationHe: "הפסקה העברית של 'run' היא 'ran'." },
  
  { id: 804, lang: "en", category: "grammar", text: "Which is the correct plural of 'mouse'?", options: ["mouses", "mice", "mousees", "mousies"], answer: 1, explanation: "The plural of 'mouse' is 'mice'.", explanationHe: "הרבים של 'mouse' הוא 'mice'." },
  { id: 805, lang: "he", category: "grammar", text: "מה הרבים של 'mouse'?", options: ["mouses", "mice", "mousees", "mousies"], answer: 1, explanation: "הרבים של 'mouse' הוא 'mice'.", explanationHe: "הרבים של 'mouse' הוא 'mice'." },
  
  // Vocabulary - More Questions
  { id: 806, lang: "en", category: "vocab", text: "What is the synonym of 'happy'?", options: ["sad", "angry", "joyful", "tired"], answer: 2, explanation: "'Joyful' is a synonym for 'happy'.", explanationHe: "'Joyful' הוא מילה נרדפת ל-'happy'." },
  { id: 807, lang: "he", category: "vocab", text: "מה המילה הנרדפת ל-'happy'?", options: ["עצוב", "כועס", "שמח", "עייף"], answer: 2, explanation: "'שמח' הוא מילה נרדפת ל-'happy'.", explanationHe: "'שמח' הוא מילה נרדפת ל-'happy'." },
  
  { id: 808, lang: "en", category: "vocab", text: "What do you call a person who teaches?", options: ["student", "teacher", "doctor", "driver"], answer: 1, explanation: "A teacher is someone who teaches.", explanationHe: "מורה הוא מישהו שמלמד." },
  { id: 809, lang: "he", category: "vocab", text: "איך קוראים למישהו שמלמד?", options: ["תלמיד", "מורה", "רופא", "נהג"], answer: 1, explanation: "מורה הוא מישהו שמלמד.", explanationHe: "מורה הוא מישהו שמלמד." },
  
  { id: 810, lang: "en", category: "vocab", text: "What is the opposite of 'big'?", options: ["large", "huge", "small", "tall"], answer: 2, explanation: "The opposite of 'big' is 'small'.", explanationHe: "ההפך מ-'big' הוא 'small'." },
  { id: 811, lang: "he", category: "vocab", text: "מה ההפך מ-'big'?", options: ["גדול", "ענק", "קטן", "גבוה"], answer: 2, explanation: "ההפך מ-'big' הוא 'small'.", explanationHe: "ההפך מ-'big' הוא 'small'." },
  
  // Reading - More Questions
  { id: 812, lang: "en", category: "reading", text: "The cat is sleeping. What is the cat doing?", options: ["eating", "sleeping", "playing", "running"], answer: 1, explanation: "The text says the cat is sleeping.", explanationHe: "הטקסט אומר שהחתול ישן." },
  { id: 813, lang: "he", category: "reading", text: "החתול ישן. מה החתול עושה?", options: ["אוכל", "ישן", "משחק", "רץ"], answer: 1, explanation: "הטקסט אומר שהחתול ישן.", explanationHe: "הטקסט אומר שהחתול ישן." },
  
  { id: 814, lang: "en", category: "reading", text: "Sarah has a red car. What color is Sarah's car?", options: ["blue", "red", "green", "yellow"], answer: 1, explanation: "The text says Sarah's car is red.", explanationHe: "הטקסט אומר שהמכונית של שרה אדומה." },
  { id: 815, lang: "he", category: "reading", text: "לשרה יש מכונית אדומה. איזה צבע למכונית של שרה?", options: ["כחול", "אדום", "ירוק", "צהוב"], answer: 1, explanation: "הטקסט אומר שהמכונית של שרה אדומה.", explanationHe: "הטקסט אומר שהמכונית של שרה אדומה." },
  
  // Holidays - More Questions
  { id: 816, lang: "en", category: "holidays", text: "Which holiday is celebrated on December 25th?", options: ["New Year", "Christmas", "Easter", "Halloween"], answer: 1, explanation: "Christmas is celebrated on December 25th.", explanationHe: "חג המולד נחגג ב-25 בדצמבר." },
  { id: 817, lang: "he", category: "holidays", text: "איזה חג נחגג ב-25 בדצמבר?", options: ["שנה חדשה", "חג המולד", "פסחא", "ליל כל הקדושים"], answer: 1, explanation: "חג המולד נחגג ב-25 בדצמבר.", explanationHe: "חג המולד נחגג ב-25 בדצמבר." },
  
  { id: 818, lang: "en", category: "holidays", text: "What do people give on Valentine's Day?", options: ["books", "flowers", "food", "clothes"], answer: 1, explanation: "People give flowers on Valentine's Day.", explanationHe: "אנשים נותנים פרחים ביום האהבה." },
  { id: 819, lang: "he", category: "holidays", text: "מה אנשים נותנים ביום האהבה?", options: ["ספרים", "פרחים", "אוכל", "בגדים"], answer: 1, explanation: "אנשים נותנים פרחים ביום האהבה.", explanationHe: "אנשים נותנים פרחים ביום האהבה." },
  
  // Nature - More Questions
  { id: 820, lang: "en", category: "nature", text: "What do bees make?", options: ["milk", "honey", "juice", "water"], answer: 1, explanation: "Bees make honey.", explanationHe: "דבורים מייצרות דבש." },
  { id: 821, lang: "he", category: "nature", text: "מה דבורים מייצרות?", options: ["חלב", "דבש", "מיץ", "מים"], answer: 1, explanation: "דבורים מייצרות דבש.", explanationHe: "דבורים מייצרות דבש." },
  
  { id: 822, lang: "en", category: "nature", text: "Which animal lives in the ocean?", options: ["elephant", "lion", "whale", "tiger"], answer: 2, explanation: "Whales live in the ocean.", explanationHe: "לווייתנים חיים באוקיינוס." },
  { id: 823, lang: "he", category: "nature", text: "איזה חיה חיה באוקיינוס?", options: ["פיל", "אריה", "לווייתן", "נמר"], answer: 2, explanation: "לווייתנים חיים באוקיינוס.", explanationHe: "לווייתנים חיים באוקיינוס." },
  
  // Technology - More Questions
  { id: 824, lang: "en", category: "technology", text: "What do you use to type on a computer?", options: ["mouse", "keyboard", "screen", "speaker"], answer: 1, explanation: "You use a keyboard to type.", explanationHe: "משתמשים במקלדת להקלדה." },
  { id: 825, lang: "he", category: "technology", text: "במה משתמשים להקלדה במחשב?", options: ["עכבר", "מקלדת", "מסך", "רמקול"], answer: 1, explanation: "משתמשים במקלדת להקלדה.", explanationHe: "משתמשים במקלדת להקלדה." },
  
  { id: 826, lang: "en", category: "technology", text: "What do you use to listen to music on a computer?", options: ["speakers", "keyboard", "mouse", "printer"], answer: 0, explanation: "You use speakers to listen to music.", explanationHe: "משתמשים ברמקולים להאזנה למוזיקה." },
  { id: 827, lang: "he", category: "technology", text: "במה משתמשים להאזנה למוזיקה במחשב?", options: ["רמקולים", "מקלדת", "עכבר", "מדפסת"], answer: 0, explanation: "משתמשים ברמקולים להאזנה למוזיקה.", explanationHe: "משתמשים ברמקולים להאזנה למוזיקה." },
  
  // Emotions - More Questions
  { id: 828, lang: "en", category: "emotions", text: "How do you feel when you win a game?", options: ["sad", "angry", "happy", "tired"], answer: 2, explanation: "People feel happy when they win.", explanationHe: "אנשים מרגישים שמחים כשהם מנצחים." },
  { id: 829, lang: "he", category: "emotions", text: "איך אתה מרגיש כשאתה מנצח במשחק?", options: ["עצוב", "כועס", "שמח", "עייף"], answer: 2, explanation: "אנשים מרגישים שמחים כשהם מנצחים.", explanationHe: "אנשים מרגישים שמחים כשהם מנצחים." },
  
  { id: 830, lang: "en", category: "emotions", text: "How do you feel when you lose something?", options: ["excited", "sad", "happy", "proud"], answer: 1, explanation: "People feel sad when they lose something.", explanationHe: "אנשים מרגישים עצובים כשהם מאבדים משהו." },
  { id: 831, lang: "he", category: "emotions", text: "איך אתה מרגיש כשאתה מאבד משהו?", options: ["נרגש", "עצוב", "שמח", "גאה"], answer: 1, explanation: "אנשים מרגישים עצובים כשהם מאבדים משהו.", explanationHe: "אנשים מרגישים עצובים כשהם מאבדים משהו." },
  
  // Transport - More Questions
  { id: 832, lang: "en", category: "transport", text: "Which vehicle has two wheels?", options: ["car", "bus", "bicycle", "truck"], answer: 2, explanation: "A bicycle has two wheels.", explanationHe: "לאופניים יש שני גלגלים." },
  { id: 833, lang: "he", category: "transport", text: "איזה רכב יש לו שני גלגלים?", options: ["מכונית", "אוטובוס", "אופניים", "משאית"], answer: 2, explanation: "לאופניים יש שני גלגלים.", explanationHe: "לאופניים יש שני גלגלים." },
  
  { id: 834, lang: "en", category: "transport", text: "Which vehicle flies in the sky?", options: ["car", "boat", "airplane", "train"], answer: 2, explanation: "An airplane flies in the sky.", explanationHe: "מטוס טס בשמיים." },
  { id: 835, lang: "he", category: "transport", text: "איזה רכב טס בשמיים?", options: ["מכונית", "סירה", "מטוס", "רכבת"], answer: 2, explanation: "מטוס טס בשמיים.", explanationHe: "מטוס טס בשמיים." },
  
  // Animals - More Questions
  { id: 836, lang: "en", category: "animals", text: "Which animal says 'moo'?", options: ["dog", "cat", "cow", "duck"], answer: 2, explanation: "A cow says 'moo'.", explanationHe: "פרה אומרת 'מו'." },
  { id: 837, lang: "he", category: "animals", text: "איזה חיה אומרת 'מו'?", options: ["כלב", "חתול", "פרה", "ברווז"], answer: 2, explanation: "פרה אומרת 'מו'.", explanationHe: "פרה אומרת 'מו'." },
  
  { id: 838, lang: "en", category: "animals", text: "Which animal is known as 'man's best friend'?", options: ["cat", "dog", "bird", "fish"], answer: 1, explanation: "A dog is known as 'man's best friend'.", explanationHe: "כלב מכונה 'החבר הטוב ביותר של האדם'." },
  { id: 839, lang: "he", category: "animals", text: "איזה חיה מכונה 'החבר הטוב ביותר של האדם'?", options: ["חתול", "כלב", "ציפור", "דג"], answer: 1, explanation: "כלב מכונה 'החבר הטוב ביותר של האדם'.", explanationHe: "כלב מכונה 'החבר הטוב ביותר של האדם'." },
  
  // Food - More Questions
  { id: 840, lang: "en", category: "food", text: "What do you drink when you are thirsty?", options: ["food", "water", "clothes", "books"], answer: 1, explanation: "You drink water when you are thirsty.", explanationHe: "שותים מים כשצמאים." },
  { id: 841, lang: "he", category: "food", text: "מה שותים כשצמאים?", options: ["אוכל", "מים", "בגדים", "ספרים"], answer: 1, explanation: "שותים מים כשצמאים.", explanationHe: "שותים מים כשצמאים." },
  
  { id: 842, lang: "en", category: "food", text: "Which fruit is red and round?", options: ["banana", "apple", "grape", "orange"], answer: 1, explanation: "An apple is red and round.", explanationHe: "תפוח הוא אדום ועגול." },
  { id: 843, lang: "he", category: "food", text: "איזה פרי הוא אדום ועגול?", options: ["בננה", "תפוח", "ענב", "תפוז"], answer: 1, explanation: "תפוח הוא אדום ועגול.", explanationHe: "תפוח הוא אדום ועגול." },
  
  // School - More Questions
  { id: 844, lang: "en", category: "school", text: "What do you use to write on paper?", options: ["eraser", "pencil", "ruler", "scissors"], answer: 1, explanation: "You use a pencil to write on paper.", explanationHe: "משתמשים בעפרון לכתיבה על נייר." },
  { id: 845, lang: "he", category: "school", text: "במה משתמשים לכתיבה על נייר?", options: ["מחק", "עיפרון", "סרגל", "מספריים"], answer: 1, explanation: "משתמשים בעפרון לכתיבה על נייר.", explanationHe: "משתמשים בעפרון לכתיבה על נייר." },
  
  { id: 846, lang: "en", category: "school", text: "Where do students learn?", options: ["hospital", "school", "restaurant", "park"], answer: 1, explanation: "Students learn at school.", explanationHe: "תלמידים לומדים בבית ספר." },
  { id: 847, lang: "he", category: "school", text: "איפה תלמידים לומדים?", options: ["בית חולים", "בית ספר", "מסעדה", "פארק"], answer: 1, explanation: "תלמידים לומדים בבית ספר.", explanationHe: "תלמידים לומדים בבית ספר." },
  
  // Family - More Questions
  { id: 848, lang: "en", category: "family", text: "Who is your mother's sister?", options: ["aunt", "uncle", "cousin", "grandmother"], answer: 0, explanation: "Your mother's sister is your aunt.", explanationHe: "אחות של אמא היא דודה." },
  { id: 849, lang: "he", category: "family", text: "מי היא אחות של אמא?", options: ["דודה", "דוד", "בת דודה", "סבתא"], answer: 0, explanation: "אחות של אמא היא דודה.", explanationHe: "אחות של אמא היא דודה." },
  
  { id: 850, lang: "en", category: "family", text: "Who is your father's father?", options: ["uncle", "grandfather", "cousin", "brother"], answer: 1, explanation: "Your father's father is your grandfather.", explanationHe: "אבא של אבא הוא סבא." },
  { id: 851, lang: "he", category: "family", text: "מי הוא אבא של אבא?", options: ["דוד", "סבא", "בן דוד", "אח"], answer: 1, explanation: "אבא של אבא הוא סבא.", explanationHe: "אבא של אבא הוא סבא." },
  
  // Health - More Questions
  { id: 852, lang: "en", category: "health", text: "What do you do when you have a cold?", options: ["eat ice cream", "rest and drink water", "play outside", "watch TV all day"], answer: 1, explanation: "When you have a cold, you should rest and drink water.", explanationHe: "כשיש לך הצטננות, כדאי לנוח ולשתות מים." },
  { id: 853, lang: "he", category: "health", text: "מה עושים כשיש הצטננות?", options: ["אוכלים גלידה", "נחים ושותים מים", "משחקים בחוץ", "צופים בטלוויזיה כל היום"], answer: 1, explanation: "כשיש לך הצטננות, כדאי לנוח ולשתות מים.", explanationHe: "כשיש לך הצטננות, כדאי לנוח ולשתות מים." },
  
  { id: 854, lang: "en", category: "health", text: "What do you use to brush your teeth?", options: ["soap", "toothbrush", "towel", "shampoo"], answer: 1, explanation: "You use a toothbrush to brush your teeth.", explanationHe: "משתמשים במברשת שיניים לצחצוח שיניים." },
  { id: 855, lang: "he", category: "health", text: "במה משתמשים לצחצוח שיניים?", options: ["סבון", "מברשת שיניים", "מגבת", "שמפו"], answer: 1, explanation: "משתמשים במברשת שיניים לצחצוח שיניים.", explanationHe: "משתמשים במברשת שיניים לצחצוח שיניים." },
  
  // Sports - More Questions
  { id: 856, lang: "en", category: "sports", text: "Which sport uses a racket?", options: ["soccer", "tennis", "basketball", "swimming"], answer: 1, explanation: "Tennis uses a racket.", explanationHe: "טניס משתמש ברקטה." },
  { id: 857, lang: "he", category: "sports", text: "איזה ספורט משתמש ברקטה?", options: ["כדורגל", "טניס", "כדורסל", "שחייה"], answer: 1, explanation: "טניס משתמש ברקטה.", explanationHe: "טניס משתמש ברקטה." },
  
  { id: 858, lang: "en", category: "sports", text: "Which sport is played in water?", options: ["tennis", "swimming", "basketball", "soccer"], answer: 1, explanation: "Swimming is played in water.", explanationHe: "שחייה מתבצעת במים." },
  { id: 859, lang: "he", category: "sports", text: "איזה ספורט מתבצע במים?", options: ["טניס", "שחייה", "כדורסל", "כדורגל"], answer: 1, explanation: "שחייה מתבצעת במים.", explanationHe: "שחייה מתבצעת במים." },
  
  // Colors - More Questions
  { id: 860, lang: "en", category: "colors", text: "What color do you get when you mix red and blue?", options: ["green", "yellow", "purple", "orange"], answer: 2, explanation: "Red and blue make purple.", explanationHe: "אדום וכחול יוצרים סגול." },
  { id: 861, lang: "he", category: "colors", text: "איזה צבע מקבלים כשמערבבים אדום וכחול?", options: ["ירוק", "צהוב", "סגול", "כתום"], answer: 2, explanation: "אדום וכחול יוצרים סגול.", explanationHe: "אדום וכחול יוצרים סגול." },
  
  { id: 862, lang: "en", category: "colors", text: "What color is the sun?", options: ["blue", "green", "yellow", "purple"], answer: 2, explanation: "The sun is yellow.", explanationHe: "השמש צהובה." },
  { id: 863, lang: "he", category: "colors", text: "איזה צבע השמש?", options: ["כחול", "ירוק", "צהוב", "סגול"], answer: 2, explanation: "השמש צהובה.", explanationHe: "השמש צהובה." },
  
  // Additional Grammar Questions
  { id: 864, lang: "en", category: "grammar", text: "Choose the correct form: 'They ____ playing football now.'", options: ["is", "are", "was", "were"], answer: 1, explanation: "'They' is plural, so we use 'are'.", explanationHe: "'הם' הוא רבים, לכן משתמשים ב-'are'." },
  { id: 865, lang: "he", category: "grammar", text: "בחר את הצורה הנכונה: 'הם ____ משחקים כדורגל עכשיו.'", options: ["הוא", "היא", "הם", "הן"], answer: 2, explanation: "הנושא הוא זכר רבים.", explanationHe: "הנושא הוא זכר רבים." },
  
  { id: 866, lang: "en", category: "grammar", text: "Which is correct? 'I ____ finished my homework.'", options: ["has", "have", "had", "having"], answer: 1, explanation: "With 'I', we use 'have'.", explanationHe: "עם 'אני' משתמשים ב-'have'." },
  { id: 867, lang: "he", category: "grammar", text: "איזו מילה נכונה? 'אני ____ את שיעורי הבית.'", options: ["עשה", "עשיתי", "עושה", "עשו"], answer: 1, explanation: "זמן עבר + גוף ראשון יחיד.", explanationHe: "זמן עבר + גוף ראשון יחיד." },
  
  { id: 868, lang: "en", category: "grammar", text: "What is the correct form? 'She is ____ than her brother.'", options: ["tall", "taller", "tallest", "more tall"], answer: 1, explanation: "Comparative form of 'tall' is 'taller'.", explanationHe: "צורת ההשוואה של 'גבוה' היא 'יותר גבוה'." },
  { id: 869, lang: "he", category: "grammar", text: "מה הצורה הנכונה? 'היא ____ מאחיה.'", options: ["גבוה", "גבוהה", "יותר גבוהה", "הכי גבוהה"], answer: 2, explanation: "צורת השוואה בעברית.", explanationHe: "צורת השוואה בעברית." },
  
  // Additional Vocabulary Questions
  { id: 870, lang: "en", category: "vocab", text: "What do you call a person who teaches at school?", options: ["student", "teacher", "doctor", "driver"], answer: 1, explanation: "A teacher is someone who teaches.", explanationHe: "מורה הוא מי שמלמד." },
  { id: 871, lang: "he", category: "vocab", text: "איך קוראים למי שמלמד בבית הספר?", options: ["תלמיד", "מורה", "רופא", "נהג"], answer: 1, explanation: "מורה הוא מי שמלמד.", explanationHe: "מורה הוא מי שמלמד." },
  
  { id: 872, lang: "en", category: "vocab", text: "What is a synonym for 'big'?", options: ["small", "large", "tiny", "little"], answer: 1, explanation: "'Large' means the same as 'big'.", explanationHe: "'גדול' ו'רחב' הם מילים נרדפות." },
  { id: 873, lang: "he", category: "vocab", text: "מה מילה נרדפת ל'גדול'?", options: ["קטן", "ענק", "זעיר", "דק"], answer: 1, explanation: "'ענק' פירושו גדול מאוד.", explanationHe: "'ענק' פירושו גדול מאוד." },
  
  { id: 874, lang: "en", category: "vocab", text: "What do you wear on your feet?", options: ["hat", "gloves", "shoes", "belt"], answer: 2, explanation: "Shoes are worn on feet.", explanationHe: "נעליים לובשים על הרגליים." },
  { id: 875, lang: "he", category: "vocab", text: "מה לובשים על הרגליים?", options: ["כובע", "כפפות", "נעליים", "חגורה"], answer: 2, explanation: "נעליים לובשים על הרגליים.", explanationHe: "נעליים לובשים על הרגליים." },
  
  // Additional Animals Questions
  { id: 876, lang: "en", category: "animals", text: "Which animal can fly?", options: ["dog", "cat", "bird", "fish"], answer: 2, explanation: "Birds have wings and can fly.", explanationHe: "לציפורים יש כנפיים והן יכולות לעוף." },
  { id: 877, lang: "he", category: "animals", text: "איזו חיה יכולה לעוף?", options: ["כלב", "חתול", "ציפור", "דג"], answer: 2, explanation: "לציפורים יש כנפיים והן יכולות לעוף.", explanationHe: "לציפורים יש כנפיים והן יכולות לעוף." },
  
  { id: 878, lang: "en", category: "animals", text: "What sound does a cow make?", options: ["meow", "bark", "moo", "chirp"], answer: 2, explanation: "A cow says 'moo'.", explanationHe: "פרה עושה 'מו'." },
  { id: 879, lang: "he", category: "animals", text: "איזה קול עושה פרה?", options: ["מיאו", "הב הב", "מו", "ציוץ"], answer: 2, explanation: "פרה עושה 'מו'.", explanationHe: "פרה עושה 'מו'." },
  
  { id: 880, lang: "en", category: "animals", text: "Which animal lives in water?", options: ["lion", "elephant", "fish", "monkey"], answer: 2, explanation: "Fish live in water.", explanationHe: "דגים חיים במים." },
  { id: 881, lang: "he", category: "animals", text: "איזו חיה חיה במים?", options: ["אריה", "פיל", "דג", "קוף"], answer: 2, explanation: "דגים חיים במים.", explanationHe: "דגים חיים במים." },
  
  // Additional Food Questions
  { id: 882, lang: "en", category: "food", text: "What do bees make?", options: ["milk", "honey", "cheese", "butter"], answer: 1, explanation: "Bees produce honey.", explanationHe: "דבורים מייצרות דבש." },
  { id: 883, lang: "he", category: "food", text: "מה דבורים מייצרות?", options: ["חלב", "דבש", "גבינה", "חמאה"], answer: 1, explanation: "דבורים מייצרות דבש.", explanationHe: "דבורים מייצרות דבש." },
  
  { id: 884, lang: "en", category: "food", text: "Which fruit is yellow and curved?", options: ["apple", "banana", "orange", "grape"], answer: 1, explanation: "A banana is yellow and curved.", explanationHe: "בננה היא צהובה ועקומה." },
  { id: 885, lang: "he", category: "food", text: "איזה פרי צהוב ועקום?", options: ["תפוח", "בננה", "תפוז", "ענב"], answer: 1, explanation: "בננה היא צהובה ועקומה.", explanationHe: "בננה היא צהובה ועקומה." },
  
  { id: 886, lang: "en", category: "food", text: "What do we get from chickens?", options: ["wool", "eggs", "leather", "silk"], answer: 1, explanation: "Chickens lay eggs.", explanationHe: "תרנגולות מטילות בייצים." },
  { id: 887, lang: "he", category: "food", text: "מה מקבלים מתרנגולות?", options: ["צמר", "בייצים", "עור", "משי"], answer: 1, explanation: "תרנגולות מטילות בייצים.", explanationHe: "תרנגולות מטילות בייצים." },
  
  // Additional Nature Questions
  { id: 888, lang: "en", category: "nature", text: "How many seasons are there in a year?", options: ["two", "three", "four", "five"], answer: 2, explanation: "There are four seasons: spring, summer, fall, winter.", explanationHe: "יש ארבע עונות: אביב, קיץ, סתיו, חורף." },
  { id: 889, lang: "he", category: "nature", text: "כמה עונות יש בשנה?", options: ["שתיים", "שלוש", "ארבע", "חמש"], answer: 2, explanation: "יש ארבע עונות: אביב, קיץ, סתיו, חורף.", explanationHe: "יש ארבע עונות: אביב, קיץ, סתיו, חורף." },
  
  { id: 890, lang: "en", category: "nature", text: "What comes from clouds?", options: ["snow", "rain", "wind", "sunshine"], answer: 1, explanation: "Rain falls from clouds.", explanationHe: "גשם יורד מעננים." },
  { id: 891, lang: "he", category: "nature", text: "מה יורד מעננים?", options: ["שלג", "גשם", "רוח", "שמש"], answer: 1, explanation: "גשם יורד מעננים.", explanationHe: "גשם יורד מעננים." },
  
  { id: 892, lang: "en", category: "nature", text: "Which season is the coldest?", options: ["spring", "summer", "fall", "winter"], answer: 3, explanation: "Winter is the coldest season.", explanationHe: "חורף הוא העונה הקרה ביותר." },
  { id: 893, lang: "he", category: "nature", text: "איזו עונה הכי קרה?", options: ["אביב", "קיץ", "סתיו", "חורף"], answer: 3, explanation: "חורף הוא העונה הקרה ביותר.", explanationHe: "חורף הוא העונה הקרה ביותר." },
  
  // Additional School Questions
  { id: 894, lang: "en", category: "school", text: "What do you write with?", options: ["eraser", "pencil", "ruler", "scissors"], answer: 1, explanation: "We write with a pencil or pen.", explanationHe: "כותבים בעיפרון או בעט." },
  { id: 895, lang: "he", category: "school", text: "במה כותבים?", options: ["מחק", "עיפרון", "סרגל", "מספריים"], answer: 1, explanation: "כותבים בעיפרון או בעט.", explanationHe: "כותבים בעיפרון או בעט." },
  
  { id: 896, lang: "en", category: "school", text: "What do you use to measure things?", options: ["pen", "book", "ruler", "bag"], answer: 2, explanation: "A ruler is used to measure.", explanationHe: "סרגל משמש למדידה." },
  { id: 897, lang: "he", category: "school", text: "במה משתמשים כדי למדוד?", options: ["עט", "ספר", "סרגל", "תיק"], answer: 2, explanation: "סרגל משמש למדידה.", explanationHe: "סרגל משמש למדידה." },
  
  { id: 898, lang: "en", category: "school", text: "Where do students sit?", options: ["on the floor", "at desks", "on the roof", "in the hallway"], answer: 1, explanation: "Students sit at desks in class.", explanationHe: "תלמידים יושבים בכיתות ליד שולחנות." },
  { id: 899, lang: "he", category: "school", text: "איפה תלמידים יושבים?", options: ["על הרצפה", "ליד שולחנות", "על הגג", "במסדרון"], answer: 1, explanation: "תלמידים יושבים בכיתות ליד שולחנות.", explanationHe: "תלמידים יושבים בכיתות ליד שולחנות." },
  
  // Additional Family Questions
  { id: 900, lang: "en", category: "family", text: "What do you call your father's father?", options: ["uncle", "grandfather", "brother", "cousin"], answer: 1, explanation: "Your father's father is your grandfather.", explanationHe: "אבא של אבא הוא סבא." },
  { id: 901, lang: "he", category: "family", text: "איך קוראים לאבא של אבא?", options: ["דוד", "סבא", "אח", "בן דוד"], answer: 1, explanation: "אבא של אבא הוא סבא.", explanationHe: "אבא של אבא הוא סבא." },
  
  { id: 902, lang: "en", category: "family", text: "What do you call your mother's sister?", options: ["aunt", "grandmother", "cousin", "niece"], answer: 0, explanation: "Your mother's sister is your aunt.", explanationHe: "אחות של אמא היא דודה." },
  { id: 903, lang: "he", category: "family", text: "איך קוראים לאחות של אמא?", options: ["דודה", "סבתא", "בת דודה", "אחיינית"], answer: 0, explanation: "אחות של אמא היא דודה.", explanationHe: "אחות של אמא היא דודה." },
  
  { id: 904, lang: "en", category: "family", text: "How many parents does everyone have?", options: ["one", "two", "three", "four"], answer: 1, explanation: "Everyone has two parents: a mother and a father.", explanationHe: "לכולם יש שני הורים: אמא ואבא." },
  { id: 905, lang: "he", category: "family", text: "כמה הורים יש לכל אדם?", options: ["אחד", "שניים", "שלושה", "ארבעה"], answer: 1, explanation: "לכולם יש שני הורים: אמא ואבא.", explanationHe: "לכולם יש שני הורים: אמא ואבא." },
  
  // Additional Sports Questions
  { id: 906, lang: "en", category: "sports", text: "In which sport do you use a bat and ball?", options: ["swimming", "baseball", "running", "skiing"], answer: 1, explanation: "Baseball is played with a bat and ball.", explanationHe: "בייסבול משחקים עם מחבט וכדור." },
  { id: 907, lang: "he", category: "sports", text: "באיזה ספורט משתמשים במחבט וכדור?", options: ["שחייה", "בייסבול", "ריצה", "סקי"], answer: 1, explanation: "בייסבול משחקים עם מחבט וכדור.", explanationHe: "בייסבול משחקים עם מחבט וכדור." },
  
  { id: 908, lang: "en", category: "sports", text: "What do you wear on your head when riding a bike?", options: ["sunglasses", "helmet", "hat", "crown"], answer: 1, explanation: "A helmet protects your head when cycling.", explanationHe: "קסדה מגינה על הראש בזמן רכיבה על אופניים." },
  { id: 909, lang: "he", category: "sports", text: "מה לובשים על הראש כשרוכבים על אופניים?", options: ["משקפי שמש", "קסדה", "כובע", "כתר"], answer: 1, explanation: "קסדה מגינה על הראש בזמן רכיבה על אופניים.", explanationHe: "קסדה מגינה על הראש בזמן רכיבה על אופניים." },
  
  { id: 910, lang: "en", category: "sports", text: "How many players are on a soccer team?", options: ["five", "seven", "nine", "eleven"], answer: 3, explanation: "A soccer team has 11 players.", explanationHe: "קבוצת כדורגל מורכבת מ-11 שחקנים." },
  { id: 911, lang: "he", category: "sports", text: "כמה שחקנים יש בקבוצת כדורגל?", options: ["חמישה", "שבעה", "תשעה", "אחד עשר"], answer: 3, explanation: "קבוצת כדורגל מורכבת מ-11 שחקנים.", explanationHe: "קבוצת כדורגל מורכבת מ-11 שחקנים." },
  
  // Additional Technology Questions
  { id: 912, lang: "en", category: "technology", text: "What do you use to connect to the internet?", options: ["television", "radio", "computer", "toaster"], answer: 2, explanation: "A computer is used to connect to the internet.", explanationHe: "מחשב משמש להתחברות לאינטרנט." },
  { id: 913, lang: "he", category: "technology", text: "במה משתמשים כדי להתחבר לאינטרנט?", options: ["טלוויזיה", "רדיו", "מחשב", "טוסטר"], answer: 2, explanation: "מחשב משמש להתחברות לאינטרנט.", explanationHe: "מחשב משמש להתחברות לאינטרנט." },
  
  { id: 914, lang: "en", category: "technology", text: "What do you use to make a phone call?", options: ["computer", "phone", "camera", "watch"], answer: 1, explanation: "A phone is used to make calls.", explanationHe: "טלפון משמש לביצוע שיחות." },
  { id: 915, lang: "he", category: "technology", text: "במה משתמשים כדי לבצע שיחת טלפון?", options: ["מחשב", "טלפון", "מצלמה", "שעון"], answer: 1, explanation: "טלפון משמש לביצוע שיחות.", explanationHe: "טלפון משמש לביצוע שיחות." },
  
  { id: 916, lang: "en", category: "technology", text: "What device shows moving pictures?", options: ["book", "television", "lamp", "radio"], answer: 1, explanation: "A television shows moving pictures.", explanationHe: "טלוויזיה מציגה תמונות נעות." },
  { id: 917, lang: "he", category: "technology", text: "איזה מכשיר מציג תמונות נעות?", options: ["ספר", "טלוויזיה", "מנורה", "רדיו"], answer: 1, explanation: "טלוויזיה מציגה תמונות נעות.", explanationHe: "טלוויזיה מציגה תמונות נעות." },
  
  // Additional Body Questions
  { id: 918, lang: "en", category: "body", text: "How many eyes do you have?", options: ["one", "two", "three", "four"], answer: 1, explanation: "Humans have two eyes.", explanationHe: "לבני אדם יש שתי עיניים." },
  { id: 919, lang: "he", category: "body", text: "כמה עיניים יש לבן אדם?", options: ["אחת", "שתיים", "שלוש", "ארבע"], answer: 1, explanation: "לבני אדם יש שתי עיניים.", explanationHe: "לבני אדם יש שתי עיניים." },
  
  { id: 920, lang: "en", category: "body", text: "What do you use to hear?", options: ["nose", "eyes", "ears", "mouth"], answer: 2, explanation: "We use our ears to hear.", explanationHe: "אנחנו משתמשים באוזניים כדי לשמוע." },
  { id: 921, lang: "he", category: "body", text: "במה משתמשים כדי לשמוע?", options: ["אף", "עיניים", "אוזניים", "פה"], answer: 2, explanation: "אנחנו משתמשים באוזניים כדי לשמוע.", explanationHe: "אנחנו משתמשים באוזניים כדי לשמוע." },
  
  { id: 922, lang: "en", category: "body", text: "How many fingers are on one hand?", options: ["three", "four", "five", "six"], answer: 2, explanation: "There are five fingers on one hand.", explanationHe: "יש חמש אצבעות ביד אחת." },
  { id: 923, lang: "he", category: "body", text: "כמה אצבעות יש ביד אחת?", options: ["שלוש", "ארבע", "חמש", "שש"], answer: 2, explanation: "יש חמש אצבעות ביד אחת.", explanationHe: "יש חמש אצבעות ביד אחת." },
  
  // Additional Transport Questions
  { id: 924, lang: "en", category: "transport", text: "What flies in the sky?", options: ["car", "boat", "airplane", "train"], answer: 2, explanation: "An airplane flies in the sky.", explanationHe: "מטוס עף בשמיים." },
  { id: 925, lang: "he", category: "transport", text: "מה עף בשמיים?", options: ["מכונית", "סירה", "מטוס", "רכבת"], answer: 2, explanation: "מטוס עף בשמיים.", explanationHe: "מטוס עף בשמיים." },
  
  { id: 926, lang: "en", category: "transport", text: "What moves on rails?", options: ["car", "bicycle", "train", "scooter"], answer: 2, explanation: "A train moves on rails.", explanationHe: "רכבת נוסעת על פסים." },
  { id: 927, lang: "he", category: "transport", text: "מה נוסע על פסים?", options: ["מכונית", "אופניים", "רכבת", "קורקינט"], answer: 2, explanation: "רכבת נוסעת על פסים.", explanationHe: "רכבת נוסעת על פסים." },
  
  { id: 928, lang: "en", category: "transport", text: "What do you ride with two wheels?", options: ["car", "bicycle", "bus", "truck"], answer: 1, explanation: "A bicycle has two wheels.", explanationHe: "לאופניים יש שני גלגלים." },
  { id: 929, lang: "he", category: "transport", text: "על מה רוכבים עם שני גלגלים?", options: ["מכונית", "אופניים", "אוטובוס", "משאית"], answer: 1, explanation: "לאופניים יש שני גלגלים.", explanationHe: "לאופניים יש שני גלגלים." },
  
  // Additional Numbers Questions
  { id: 930, lang: "en", category: "numbers", text: "What comes after 10?", options: ["9", "10", "11", "12"], answer: 2, explanation: "11 comes after 10.", explanationHe: "11 בא אחרי 10." },
  { id: 931, lang: "he", category: "numbers", text: "מה בא אחרי 10?", options: ["9", "10", "11", "12"], answer: 2, explanation: "11 בא אחרי 10.", explanationHe: "11 בא אחרי 10." },
  
  { id: 932, lang: "en", category: "numbers", text: "How many days are in a week?", options: ["five", "six", "seven", "eight"], answer: 2, explanation: "There are seven days in a week.", explanationHe: "יש שבעה ימים בשבוע." },
  { id: 933, lang: "he", category: "numbers", text: "כמה ימים יש בשבוע?", options: ["חמישה", "שישה", "שבעה", "שמונה"], answer: 2, explanation: "יש שבעה ימים בשבוע.", explanationHe: "יש שבעה ימים בשבוע." },
  
  { id: 934, lang: "en", category: "numbers", text: "What is 5 + 5?", options: ["8", "9", "10", "11"], answer: 2, explanation: "5 plus 5 equals 10.", explanationHe: "5 ועוד 5 שווה 10." },
  { id: 935, lang: "he", category: "numbers", text: "כמה זה 5 + 5?", options: ["8", "9", "10", "11"], answer: 2, explanation: "5 ועוד 5 שווה 10.", explanationHe: "5 ועוד 5 שווה 10." },
  
  // Additional Health Questions
  { id: 936, lang: "en", category: "health", text: "What should you do before eating?", options: ["sleep", "wash hands", "run", "jump"], answer: 1, explanation: "You should wash your hands before eating.", explanationHe: "צריך לשטוף ידיים לפני אכילה." },
  { id: 937, lang: "he", category: "health", text: "מה צריך לעשות לפני אכילה?", options: ["לישון", "לשטוף ידיים", "לרוץ", "לקפוץ"], answer: 1, explanation: "צריך לשטוף ידיים לפני אכילה.", explanationHe: "צריך לשטוף ידיים לפני אכילה." },
  
  { id: 938, lang: "en", category: "health", text: "How many times should you brush your teeth per day?", options: ["once", "twice", "three times", "never"], answer: 1, explanation: "You should brush your teeth at least twice a day.", explanationHe: "צריך לצחצח שיניים לפחות פעמיים ביום." },
  { id: 939, lang: "he", category: "health", text: "כמה פעמים צריך לצחצח שיניים ביום?", options: ["פעם אחת", "פעמיים", "שלוש פעמים", "אף פעם"], answer: 1, explanation: "צריך לצחצח שיניים לפחות פעמיים ביום.", explanationHe: "צריך לצחצח שיניים לפחות פעמיים ביום." },
  
  { id: 940, lang: "en", category: "health", text: "What is good for your body?", options: ["smoking", "exercise", "junk food", "staying up late"], answer: 1, explanation: "Exercise is good for your body.", explanationHe: "פעילות גופנית טובה לגוף." },
  { id: 941, lang: "he", category: "health", text: "מה טוב לגוף?", options: ["עישון", "פעילות גופנית", "אוכל זבל", "להישאר ער עד מאוחר"], answer: 1, explanation: "פעילות גופנית טובה לגוף.", explanationHe: "פעילות גופנית טובה לגוף." },
  
  // Additional Reading Questions
  { id: 942, lang: "en", category: "reading", text: "Sarah loves to read books. She reads every night. When does Sarah read?", options: ["in the morning", "at night", "at noon", "never"], answer: 1, explanation: "The text says Sarah reads every night.", explanationHe: "הטקסט אומר ששרה קוראת כל לילה." },
  { id: 943, lang: "he", category: "reading", text: "שרה אוהבת לקרוא ספרים. היא קוראת כל לילה. מתי שרה קוראת?", options: ["בבוקר", "בלילה", "בצהריים", "אף פעם"], answer: 1, explanation: "הטקסט אומר ששרה קוראת כל לילה.", explanationHe: "הטקסט אומר ששרה קוראת כל לילה." },
  
  { id: 944, lang: "en", category: "reading", text: "The dog is brown. The cat is white. What color is the dog?", options: ["white", "brown", "black", "yellow"], answer: 1, explanation: "The text states the dog is brown.", explanationHe: "הטקסט אומר שהכלב חום." },
  { id: 945, lang: "he", category: "reading", text: "הכלב חום. החתול לבן. איזה צבע הכלב?", options: ["לבן", "חום", "שחור", "צהוב"], answer: 1, explanation: "הטקסט אומר שהכלב חום.", explanationHe: "הטקסט אומר שהכלב חום." },
  
  { id: 946, lang: "en", category: "reading", text: "Mike went to the park. He played with his friends. Where did Mike go?", options: ["school", "park", "home", "store"], answer: 1, explanation: "The text says Mike went to the park.", explanationHe: "הטקסט אומר שמייק הלך לפארק." },
  { id: 947, lang: "he", category: "reading", text: "מייק הלך לפארק. הוא שיחק עם חברים. לאן הלך מייק?", options: ["בית ספר", "פארק", "בית", "חנות"], answer: 1, explanation: "הטקסט אומר שמייק הלך לפארק.", explanationHe: "הטקסט אומר שמייק הלך לפארק." },
  
  // Additional Emotions Questions
  { id: 948, lang: "en", category: "emotions", text: "When you get a gift, how do you feel?", options: ["sad", "angry", "happy", "scared"], answer: 2, explanation: "Getting a gift makes you happy.", explanationHe: "לקבל מתנה גורם לך להיות שמח." },
  { id: 949, lang: "he", category: "emotions", text: "איך מרגישים כשמקבלים מתנה?", options: ["עצוב", "כועס", "שמח", "מפוחד"], answer: 2, explanation: "לקבל מתנה גורם לך להיות שמח.", explanationHe: "לקבל מתנה גורם לך להיות שמח." },
  
  { id: 950, lang: "en", category: "emotions", text: "What emotion do you feel when you're tired?", options: ["excited", "sleepy", "angry", "surprised"], answer: 1, explanation: "When you're tired, you feel sleepy.", explanationHe: "כשעייף מרגישים ישנוני." },
  { id: 951, lang: "he", category: "emotions", text: "איזו רגש מרגישים כשעייפים?", options: ["נרגש", "ישנוני", "כועס", "מופתע"], answer: 1, explanation: "כשעייף מרגישים ישנוני.", explanationHe: "כשעייף מרגישים ישנוני." },
  
  { id: 952, lang: "en", category: "emotions", text: "When you lose something, how do you feel?", options: ["happy", "sad", "excited", "proud"], answer: 1, explanation: "Losing something makes you sad.", explanationHe: "לאבד משהו גורם לעצב." },
  { id: 953, lang: "he", category: "emotions", text: "איך מרגישים כשמאבדים משהו?", options: ["שמח", "עצוב", "נרגש", "גאה"], answer: 1, explanation: "לאבד משהו גורם לעצב.", explanationHe: "לאבד משהו גורם לעצב." },
  
  // Additional Holidays Questions
  { id: 954, lang: "en", category: "holidays", text: "Which holiday celebrates independence?", options: ["Halloween", "Independence Day", "Easter", "Thanksgiving"], answer: 1, explanation: "Independence Day celebrates freedom and independence.", explanationHe: "יום העצמאות חוגג חירות ועצמאות." },
  { id: 955, lang: "he", category: "holidays", text: "איזה חג חוגג עצמאות?", options: ["ליל כל הקדושים", "יום העצמאות", "פסחא", "חג ההודיה"], answer: 1, explanation: "יום העצמאות חוגג חירות ועצמאות.", explanationHe: "יום העצמאות חוגג חירות ועצמאות." },
  
  { id: 956, lang: "en", category: "holidays", text: "What do people give on Valentine's Day?", options: ["candy", "flowers", "cards", "all of these"], answer: 3, explanation: "People give candy, flowers, and cards on Valentine's Day.", explanationHe: "אנשים נותנים ממתקים, פרחים וכרטיסים ביום האהבה." },
  { id: 957, lang: "he", category: "holidays", text: "מה נותנים ביום האהבה?", options: ["ממתקים", "פרחים", "כרטיסים", "כל אלה"], answer: 3, explanation: "אנשים נותנים ממתקים, פרחים וכרטיסים ביום האהבה.", explanationHe: "אנשים נותנים ממתקים, פרחים וכרטיסים ביום האהבה." },
  
  { id: 958, lang: "en", category: "holidays", text: "When is Christmas celebrated?", options: ["January 1", "December 25", "October 31", "July 4"], answer: 1, explanation: "Christmas is celebrated on December 25.", explanationHe: "חג המולד נחגג ב-25 בדצמבר." },
  { id: 959, lang: "he", category: "holidays", text: "מתי חוגגים את חג המולד?", options: ["1 בינואר", "25 בדצמבר", "31 באוקטובר", "4 ביולי"], answer: 1, explanation: "חג המולד נחגג ב-25 בדצמבר.", explanationHe: "חג המולד נחגג ב-25 בדצמבר." },
  
  // Additional Jobs Questions
  { id: 960, lang: "en", category: "jobs", text: "Who helps sick people?", options: ["teacher", "doctor", "driver", "artist"], answer: 1, explanation: "A doctor helps sick people.", explanationHe: "רופא עוזר לאנשים חולים." },
  { id: 961, lang: "he", category: "jobs", text: "מי עוזר לאנשים חולים?", options: ["מורה", "רופא", "נהג", "אמן"], answer: 1, explanation: "רופא עוזר לאנשים חולים.", explanationHe: "רופא עוזר לאנשים חולים." },
  
  { id: 962, lang: "en", category: "jobs", text: "Who puts out fires?", options: ["police officer", "firefighter", "teacher", "chef"], answer: 1, explanation: "A firefighter puts out fires.", explanationHe: "כבאי מכבה שריפות." },
  { id: 963, lang: "he", category: "jobs", text: "מי מכבה שריפות?", options: ["שוטר", "כבאי", "מורה", "טבח"], answer: 1, explanation: "כבאי מכבה שריפות.", explanationHe: "כבאי מכבה שריפות." },
  
  // More Grammar Questions (964-973)
  { id: 964, lang: "en", category: "grammar", text: "Choose the correct form: 'They ____ playing football now.'", options: ["is", "are", "was", "were"], answer: 1, explanation: "'They' is plural, so we use 'are'.", explanationHe: "'הם' הוא רבים, לכן משתמשים ב-'are'." },
  { id: 965, lang: "he", category: "grammar", text: "בחר את הצורה הנכונה: 'הם ____ משחקים כדורגל עכשיו.'", options: ["הוא", "היא", "הם", "הן"], answer: 2, explanation: "נושא זכר רבים", explanationHe: "נושא זכר רבים" },
  { id: 966, lang: "en", category: "grammar", text: "What is the plural of 'foot'?", options: ["foots", "feet", "feets", "foot"], answer: 1, explanation: "Irregular plural: foot → feet", explanationHe: "רבים לא סדיר: רגל → רגליים" },
  { id: 967, lang: "he", category: "grammar", text: "מה הרבים של 'איש'?", options: ["איש", "אישים", "אנשים", "אשים"], answer: 2, explanation: "רבים לא סדיר: איש → אנשים", explanationHe: "רבים לא סדיר: איש → אנשים" },
  { id: 968, lang: "en", category: "grammar", text: "Complete: 'She ____ a book yesterday.'", options: ["read", "reads", "reading", "will read"], answer: 0, explanation: "Past simple of 'read' is 'read' (pronounced 'red')", explanationHe: "עבר פשוט של 'לקרוא' הוא 'קרא'" },
  { id: 969, lang: "he", category: "grammar", text: "השלם: 'היא ____ ספר אתמול.'", options: ["קראה", "קוראת", "תקרא", "קוראים"], answer: 0, explanation: "עבר נקבה יחיד", explanationHe: "עבר נקבה יחיד" },
  { id: 970, lang: "en", category: "grammar", text: "Which is correct? 'I ____ playing.'", options: ["am", "is", "are", "be"], answer: 0, explanation: "With 'I', we use 'am'", explanationHe: "עם 'אני' משתמשים ב-'am'" },
  { id: 971, lang: "he", category: "grammar", text: "איזו צורה נכונה? 'אני ____ משחק.'", options: ["אני", "הוא", "היא", "הם"], answer: 0, explanation: "גוף ראשון יחיד", explanationHe: "גוף ראשון יחיד" },
  { id: 972, lang: "en", category: "grammar", text: "What's the past of 'sing'?", options: ["singed", "sang", "sung", "singing"], answer: 1, explanation: "Irregular past: sing → sang", explanationHe: "עבר לא סדיר" },
  { id: 973, lang: "he", category: "grammar", text: "מה העבר של 'שר'?", options: ["שר", "שרה", "ישיר", "שרים"], answer: 0, explanation: "עבר זכר יחיד", explanationHe: "עבר זכר יחיד" },
  
  // More Animals (974-993)
  { id: 974, lang: "en", category: "animals", text: "Which animal has a long neck?", options: ["elephant", "giraffe", "tiger", "bear"], answer: 1, explanation: "A giraffe has a very long neck.", explanationHe: "לג'ירפה יש צוואר ארוך מאוד." },
  { id: 975, lang: "he", category: "animals", text: "לאיזו חיה יש צוואר ארוך?", options: ["פיל", "ג'ירפה", "נמר", "דוב"], answer: 1, explanation: "לג'ירפה יש צוואר ארוך מאוד.", explanationHe: "לג'ירפה יש צוואר ארוך מאוד." },
  { id: 976, lang: "en", category: "animals", text: "Which animal has black and white stripes?", options: ["lion", "zebra", "elephant", "monkey"], answer: 1, explanation: "A zebra has black and white stripes.", explanationHe: "לזברה יש פסים שחורים ולבנים." },
  { id: 977, lang: "he", category: "animals", text: "לאיזו חיה יש פסים שחורים ולבנים?", options: ["אריה", "זברה", "פיל", "קוף"], answer: 1, explanation: "לזברה יש פסים שחורים ולבנים.", explanationHe: "לזברה יש פסים שחורים ולבנים." },
  { id: 978, lang: "en", category: "animals", text: "What sound does a pig make?", options: ["moo", "oink", "meow", "woof"], answer: 1, explanation: "A pig says 'oink'.", explanationHe: "חזיר עושה 'אוינק'." },
  { id: 979, lang: "he", category: "animals", text: "איזה קול עושה חזיר?", options: ["מו", "אוינק", "מיאו", "הב"], answer: 1, explanation: "חזיר עושה 'אוינק'.", explanationHe: "חזיר עושה 'אוינק'." },
  { id: 980, lang: "en", category: "animals", text: "Which animal is the biggest?", options: ["elephant", "whale", "giraffe", "lion"], answer: 1, explanation: "The blue whale is the biggest animal.", explanationHe: "הלוויתן הכחול הוא החיה הגדולה ביותר." },
  { id: 981, lang: "he", category: "animals", text: "איזו חיה הכי גדולה?", options: ["פיל", "לוויתן", "ג'ירפה", "אריה"], answer: 1, explanation: "הלוויתן הכחול הוא החיה הגדולה ביותר.", explanationHe: "הלוויתן הכחול הוא החיה הגדולה ביותר." },
  { id: 982, lang: "en", category: "animals", text: "Which animal can change colors?", options: ["dog", "chameleon", "cat", "rabbit"], answer: 1, explanation: "A chameleon can change its color.", explanationHe: "זיקית יכולה לשנות צבע." },
  { id: 983, lang: "he", category: "animals", text: "איזו חיה יכולה לשנות צבע?", options: ["כלב", "זיקית", "חתול", "ארנב"], answer: 1, explanation: "זיקית יכולה לשנות צבע.", explanationHe: "זיקית יכולה לשנות צבע." },
  { id: 984, lang: "en", category: "animals", text: "What do butterflies come from?", options: ["eggs", "caterpillars", "flowers", "leaves"], answer: 1, explanation: "Butterflies come from caterpillars.", explanationHe: "פרפרים מגיעים מזחלים." },
  { id: 985, lang: "he", category: "animals", text: "ממה באים פרפרים?", options: ["ביצים", "זחלים", "פרחים", "עלים"], answer: 1, explanation: "פרפרים מגיעים מזחלים.", explanationHe: "פרפרים מגיעים מזחלים." },
  { id: 986, lang: "en", category: "animals", text: "Which animal carries its house?", options: ["dog", "snail", "cat", "bird"], answer: 1, explanation: "A snail carries its shell.", explanationHe: "חילזון נושא את הקונכייה שלו." },
  { id: 987, lang: "he", category: "animals", text: "איזו חיה נושאת את הבית שלה?", options: ["כלב", "חילזון", "חתול", "ציפור"], answer: 1, explanation: "חילזון נושא את הקונכייה שלו.", explanationHe: "חילזון נושא את הקונכייה שלו." },
  { id: 988, lang: "en", category: "animals", text: "Which animal hangs upside down?", options: ["cat", "bat", "dog", "rabbit"], answer: 1, explanation: "Bats hang upside down.", explanationHe: "עטלפים תלויים הפוך." },
  { id: 989, lang: "he", category: "animals", text: "איזו חיה תלויה הפוך?", options: ["חתול", "עטלף", "כלב", "ארנב"], answer: 1, explanation: "עטלפים תלויים הפוך.", explanationHe: "עטלפים תלויים הפוך." },
  { id: 990, lang: "en", category: "animals", text: "What do spiders make?", options: ["honey", "webs", "eggs", "nests"], answer: 1, explanation: "Spiders make webs.", explanationHe: "עכבישים טווים קורים." },
  { id: 991, lang: "he", category: "animals", text: "מה עכבישים עושים?", options: ["דבש", "קורים", "ביצים", "קנים"], answer: 1, explanation: "עכבישים טווים קורים.", explanationHe: "עכבישים טווים קורים." },
  { id: 992, lang: "en", category: "animals", text: "Which animal is the fastest?", options: ["turtle", "cheetah", "elephant", "snail"], answer: 1, explanation: "The cheetah is the fastest land animal.", explanationHe: "הצ'יטה היא החיה המהירה ביותר ביבשה." },
  { id: 993, lang: "he", category: "animals", text: "איזו חיה הכי מהירה?", options: ["צב", "צ'יטה", "פיל", "חילזון"], answer: 1, explanation: "הצ'יטה היא החיה המהירה ביותר ביבשה.", explanationHe: "הצ'יטה היא החיה המהירה ביותר ביבשה." },
  
  // More Food (994-1013)
  { id: 994, lang: "en", category: "food", text: "What fruit has a peel you must remove?", options: ["apple", "banana", "strawberry", "grape"], answer: 1, explanation: "You must peel a banana.", explanationHe: "צריך לקלף בננה." },
  { id: 995, lang: "he", category: "food", text: "איזה פרי צריך לקלף?", options: ["תפוח", "בננה", "תות", "ענב"], answer: 1, explanation: "צריך לקלף בננה.", explanationHe: "צריך לקלף בננה." },
  { id: 996, lang: "en", category: "food", text: "What vegetable makes you cry when you cut it?", options: ["carrot", "onion", "potato", "tomato"], answer: 1, explanation: "Onions make you cry when you cut them.", explanationHe: "בצל גורם לבכות כשחותכים אותו." },
  { id: 997, lang: "he", category: "food", text: "איזה ירק גורם לבכות כשחותכים?", options: ["גזר", "בצל", "תפוח אדמה", "עגבנייה"], answer: 1, explanation: "בצל גורם לבכות כשחותכים אותו.", explanationHe: "בצל גורם לבכות כשחותכים אותו." },
  { id: 998, lang: "en", category: "food", text: "What is pizza made from?", options: ["rice", "dough", "bread", "pasta"], answer: 1, explanation: "Pizza is made from dough.", explanationHe: "פיצה עשויה מבצק." },
  { id: 999, lang: "he", category: "food", text: "ממה עשויה פיצה?", options: ["אורז", "בצק", "לחם", "פסטה"], answer: 1, explanation: "פיצה עשויה מבצק.", explanationHe: "פיצה עשויה מבצק." },
  { id: 1000, lang: "en", category: "food", text: "What do we get from cows?", options: ["eggs", "milk", "honey", "wool"], answer: 1, explanation: "We get milk from cows.", explanationHe: "מקבלים חלב מפרות." },
  { id: 1001, lang: "he", category: "food", text: "מה מקבלים מפרות?", options: ["ביצים", "חלב", "דבש", "צמר"], answer: 1, explanation: "מקבלים חלב מפרות.", explanationHe: "מקבלים חלב מפרות." },
  { id: 1002, lang: "en", category: "food", text: "What color is a carrot?", options: ["green", "orange", "red", "blue"], answer: 1, explanation: "A carrot is orange.", explanationHe: "גזר הוא כתום." },
  { id: 1003, lang: "he", category: "food", text: "איזה צבע גזר?", options: ["ירוק", "כתום", "אדום", "כחול"], answer: 1, explanation: "גזר הוא כתום.", explanationHe: "גזר הוא כתום." },
  { id: 1004, lang: "en", category: "food", text: "What meal do we eat at midday?", options: ["breakfast", "lunch", "dinner", "snack"], answer: 1, explanation: "Lunch is eaten at midday.", explanationHe: "אוכלים ארוחת צהריים בצהריים." },
  { id: 1005, lang: "he", category: "food", text: "איזו ארוחה אוכלים בצהריים?", options: ["ארוחת בוקר", "ארוחת צהריים", "ארוחת ערב", "חטיף"], answer: 1, explanation: "אוכלים ארוחת צהריים בצהריים.", explanationHe: "אוכלים ארוחת צהריים בצהריים." },
  { id: 1006, lang: "en", category: "food", text: "What drink do we get from oranges?", options: ["milk", "orange juice", "water", "soda"], answer: 1, explanation: "We make orange juice from oranges.", explanationHe: "עושים מיץ תפוזים מתפוזים." },
  { id: 1007, lang: "he", category: "food", text: "איזה משקה מקבלים מתפוזים?", options: ["חלב", "מיץ תפוזים", "מים", "סודה"], answer: 1, explanation: "עושים מיץ תפוזים מתפוזים.", explanationHe: "עושים מיץ תפוזים מתפוזים." },
  { id: 1008, lang: "en", category: "food", text: "What is bread made from?", options: ["milk", "flour", "meat", "rice"], answer: 1, explanation: "Bread is made from flour.", explanationHe: "לחם עשוי מקמח." },
  { id: 1009, lang: "he", category: "food", text: "ממה עשוי לחם?", options: ["חלב", "קמח", "בשר", "אורז"], answer: 1, explanation: "לחם עשוי מקמח.", explanationHe: "לחם עשוי מקמח." },
  { id: 1010, lang: "en", category: "food", text: "Which fruit grows on trees?", options: ["strawberry", "apple", "watermelon", "pumpkin"], answer: 1, explanation: "Apples grow on trees.", explanationHe: "תפוחים גדלים על עצים." },
  { id: 1011, lang: "he", category: "food", text: "איזה פרי גדל על עצים?", options: ["תות", "תפוח", "אבטיח", "דלעת"], answer: 1, explanation: "תפוחים גדלים על עצים.", explanationHe: "תפוחים גדלים על עצים." },
  { id: 1012, lang: "en", category: "food", text: "What color is broccoli?", options: ["red", "green", "yellow", "blue"], answer: 1, explanation: "Broccoli is green.", explanationHe: "ברוקולי הוא ירוק." },
  { id: 1013, lang: "he", category: "food", text: "איזה צבע ברוקולי?", options: ["אדום", "ירוק", "צהוב", "כחול"], answer: 1, explanation: "ברוקולי הוא ירוק.", explanationHe: "ברוקולי הוא ירוק." },
  
  // More Nature Questions (1014-1033)  
  { id: 1014, lang: "en", category: "nature", text: "What gives us light during the day?", options: ["moon", "sun", "stars", "clouds"], answer: 1, explanation: "The sun gives us light during the day.", explanationHe: "השמש נותנת לנו אור במהלך היום." },
  { id: 1015, lang: "he", category: "nature", text: "מה נותן לנו אור ביום?", options: ["ירח", "שמש", "כוכבים", "עננים"], answer: 1, explanation: "השמש נותנת לנו אור במהלך היום.", explanationHe: "השמש נותנת לנו אור במהלך היום." },
  { id: 1016, lang: "en", category: "nature", text: "Where do fish live?", options: ["trees", "water", "sky", "ground"], answer: 1, explanation: "Fish live in water.", explanationHe: "דגים חיים במים." },
  { id: 1017, lang: "he", category: "nature", text: "איפה דגים חיים?", options: ["עצים", "מים", "שמיים", "קרקע"], answer: 1, explanation: "דגים חיים במים.", explanationHe: "דגים חיים במים." },
  { id: 1018, lang: "en", category: "nature", text: "What do trees need to grow?", options: ["only water", "only sun", "water and sunlight", "nothing"], answer: 2, explanation: "Trees need both water and sunlight.", explanationHe: "עצים צריכים מים ואור שמש." },
  { id: 1019, lang: "he", category: "nature", text: "מה עצים צריכים כדי לגדול?", options: ["רק מים", "רק שמש", "מים ואור שמש", "כלום"], answer: 2, explanation: "עצים צריכים מים ואור שמש.", explanationHe: "עצים צריכים מים ואור שמש." },
  { id: 1020, lang: "en", category: "nature", text: "What happens to leaves in fall?", options: ["they grow", "they fall", "they bloom", "they sing"], answer: 1, explanation: "Leaves fall in autumn.", explanationHe: "עלים נופלים בסתיו." },
  { id: 1021, lang: "he", category: "nature", text: "מה קורה לעלים בסתיו?", options: ["הם גדלים", "הם נופלים", "הם פורחים", "הם שרים"], answer: 1, explanation: "עלים נופלים בסתיו.", explanationHe: "עלים נופלים בסתיו." },
  { id: 1022, lang: "en", category: "nature", text: "What comes from flowers?", options: ["leaves", "fruits", "roots", "bark"], answer: 1, explanation: "Fruits come from flowers.", explanationHe: "פירות באים מפרחים." },
  { id: 1023, lang: "he", category: "nature", text: "מה בא מפרחים?", options: ["עלים", "פירות", "שורשים", "קליפה"], answer: 1, explanation: "פירות באים מפרחים.", explanationHe: "פירות באים מפרחים." },
  { id: 1024, lang: "en", category: "nature", text: "What do bees collect from flowers?", options: ["water", "nectar", "leaves", "seeds"], answer: 1, explanation: "Bees collect nectar from flowers.", explanationHe: "דבורים אוספות צוף מפרחים." },
  { id: 1025, lang: "he", category: "nature", text: "מה דבורים אוספות מפרחים?", options: ["מים", "צוף", "עלים", "זרעים"], answer: 1, explanation: "דבורים אוספות צוף מפרחים.", explanationHe: "דבורים אוספות צוף מפרחים." },
  { id: 1026, lang: "en", category: "nature", text: "What part of the tree is underground?", options: ["leaves", "roots", "branches", "flowers"], answer: 1, explanation: "Roots are underground.", explanationHe: "שורשים נמצאים מתחת לאדמה." },
  { id: 1027, lang: "he", category: "nature", text: "איזה חלק של העץ מתחת לאדמה?", options: ["עלים", "שורשים", "ענפים", "פרחים"], answer: 1, explanation: "שורשים נמצאים מתחת לאדמה.", explanationHe: "שורשים נמצאים מתחת לאדמה." },
  { id: 1028, lang: "en", category: "nature", text: "What season do flowers bloom?", options: ["winter", "spring", "summer", "fall"], answer: 1, explanation: "Flowers bloom in spring.", explanationHe: "פרחים פורחים באביב." },
  { id: 1029, lang: "he", category: "nature", text: "באיזו עונה פרחים פורחים?", options: ["חורף", "אביב", "קיץ", "סתיו"], answer: 1, explanation: "פרחים פורחים באביב.", explanationHe: "פרחים פורחים באביב." },
  { id: 1030, lang: "en", category: "nature", text: "What do caterpillars turn into?", options: ["bees", "butterflies", "birds", "beetles"], answer: 1, explanation: "Caterpillars turn into butterflies.", explanationHe: "זחלים הופכים לפרפרים." },
  { id: 1031, lang: "he", category: "nature", text: "למה זחלים הופכים?", options: ["דבורים", "פרפרים", "ציפורים", "חיפושיות"], answer: 1, explanation: "זחלים הופכים לפרפרים.", explanationHe: "זחלים הופכים לפרפרים." },
  { id: 1032, lang: "en", category: "nature", text: "What gives us oxygen?", options: ["rocks", "trees", "water", "fire"], answer: 1, explanation: "Trees give us oxygen.", explanationHe: "עצים נותנים לנו חמצן." },
  { id: 1033, lang: "he", category: "nature", text: "מה נותן לנו חמצן?", options: ["סלעים", "עצים", "מים", "אש"], answer: 1, explanation: "עצים נותנים לנו חמצן.", explanationHe: "עצים נותנים לנו חמצן." },
  
  // More Technology (1034-1053)
  { id: 1034, lang: "en", category: "technology", text: "What do you use to type?", options: ["mouse", "keyboard", "monitor", "speaker"], answer: 1, explanation: "We use a keyboard to type.", explanationHe: "משתמשים במקלדת להקליד." },
  { id: 1035, lang: "he", category: "technology", text: "במה משתמשים להקליד?", options: ["עכבר", "מקלדת", "מסך", "רמקול"], answer: 1, explanation: "משתמשים במקלדת להקליד.", explanationHe: "משתמשים במקלדת להקליד." },
  { id: 1036, lang: "en", category: "technology", text: "What shows pictures on a computer?", options: ["keyboard", "monitor", "mouse", "printer"], answer: 1, explanation: "The monitor shows pictures.", explanationHe: "המסך מציג תמונות." },
  { id: 1037, lang: "he", category: "technology", text: "מה מציג תמונות במחשב?", options: ["מקלדת", "מסך", "עכבר", "מדפסת"], answer: 1, explanation: "המסך מציג תמונות.", explanationHe: "המסך מציג תמונות." },
  { id: 1038, lang: "en", category: "technology", text: "What do you click with?", options: ["keyboard", "mouse", "monitor", "printer"], answer: 1, explanation: "We click with a mouse.", explanationHe: "לוחצים עם עכבר." },
  { id: 1039, lang: "he", category: "technology", text: "במה לוחצים?", options: ["מקלדת", "עכבר", "מסך", "מדפסת"], answer: 1, explanation: "לוחצים עם עכבר.", explanationHe: "לוחצים עם עכבר." },
  { id: 1040, lang: "en", category: "technology", text: "What makes sound louder?", options: ["screen", "speaker", "keyboard", "mouse"], answer: 1, explanation: "Speakers make sound louder.", explanationHe: "רמקולים משמיעים קול חזק." },
  { id: 1041, lang: "he", category: "technology", text: "מה משמיע קול חזק?", options: ["מסך", "רמקול", "מקלדת", "עכבר"], answer: 1, explanation: "רמקולים משמיעים קול חזק.", explanationHe: "רמקולים משמיעים קול חזק." },
  { id: 1042, lang: "en", category: "technology", text: "What do you use to listen privately?", options: ["speakers", "headphones", "microphone", "camera"], answer: 1, explanation: "Headphones let you listen privately.", explanationHe: "אוזניות מאפשרות להאזין בפרטיות." },
  { id: 1043, lang: "he", category: "technology", text: "במה מאזינים בפרטיות?", options: ["רמקולים", "אוזניות", "מיקרופון", "מצלמה"], answer: 1, explanation: "אוזניות מאפשרות להאזין בפרטיות.", explanationHe: "אוזניות מאפשרות להאזין בפרטיות." },
  { id: 1044, lang: "en", category: "technology", text: "What records your voice?", options: ["camera", "microphone", "speaker", "monitor"], answer: 1, explanation: "A microphone records voice.", explanationHe: "מיקרופון מקליט קול." },
  { id: 1045, lang: "he", category: "technology", text: "מה מקליט את הקול?", options: ["מצלמה", "מיקרופון", "רמקול", "מסך"], answer: 1, explanation: "מיקרופון מקליט קול.", explanationHe: "מיקרופון מקליט קול." },
  { id: 1046, lang: "en", category: "technology", text: "What stores data?", options: ["keyboard", "hard drive", "mouse", "speaker"], answer: 1, explanation: "A hard drive stores data.", explanationHe: "כונן קשיח מאחסן מידע." },
  { id: 1047, lang: "he", category: "technology", text: "מה מאחסן מידע?", options: ["מקלדת", "כונן קשיח", "עכבר", "רמקול"], answer: 1, explanation: "כונן קשיח מאחסן מידע.", explanationHe: "כונן קשיח מאחסן מידע." },
  { id: 1048, lang: "en", category: "technology", text: "What do you use to browse websites?", options: ["printer", "browser", "calculator", "camera"], answer: 1, explanation: "A browser is used to browse websites.", explanationHe: "דפדפן משמש לגלישה באתרים." },
  { id: 1049, lang: "he", category: "technology", text: "במה גולשים באתרים?", options: ["מדפסת", "דפדפן", "מחשבון", "מצלמה"], answer: 1, explanation: "דפדפן משמש לגלישה באתרים.", explanationHe: "דפדפן משמש לגלישה באתרים." },
  { id: 1050, lang: "en", category: "technology", text: "What makes documents on paper?", options: ["scanner", "printer", "monitor", "keyboard"], answer: 1, explanation: "A printer makes documents on paper.", explanationHe: "מדפסת מדפיסה מסמכים על נייר." },
  { id: 1051, lang: "he", category: "technology", text: "מה מדפיס מסמכים?", options: ["סורק", "מדפסת", "מסך", "מקלדת"], answer: 1, explanation: "מדפסת מדפיסה מסמכים על נייר.", explanationHe: "מדפסת מדפיסה מסמכים על נייר." },
  { id: 1052, lang: "en", category: "technology", text: "What reads QR codes?", options: ["printer", "camera", "keyboard", "speaker"], answer: 1, explanation: "A camera can scan QR codes.", explanationHe: "מצלמה יכולה לסרוק קודי QR." },
  { id: 1053, lang: "he", category: "technology", text: "מה קורא קודי QR?", options: ["מדפסת", "מצלמה", "מקלדת", "רמקול"], answer: 1, explanation: "מצלמה יכולה לסרוק קודי QR.", explanationHe: "מצלמה יכולה לסרוק קודי QR." },
  
  // More Countries & Geography (1054-1073)
  { id: 1054, lang: "en", category: "countries", text: "What is the capital of France?", options: ["London", "Paris", "Berlin", "Rome"], answer: 1, explanation: "Paris is the capital of France.", explanationHe: "פריז היא בירת צרפת." },
  { id: 1055, lang: "he", category: "countries", text: "מה הבירה של צרפת?", options: ["לונדון", "פריז", "ברלין", "רומא"], answer: 1, explanation: "פריז היא בירת צרפת.", explanationHe: "פריז היא בירת צרפת." },
  { id: 1056, lang: "en", category: "countries", text: "Which country is known for pizza?", options: ["France", "Italy", "Spain", "Greece"], answer: 1, explanation: "Italy is famous for pizza.", explanationHe: "איטליה מפורסמת בפיצה." },
  { id: 1057, lang: "he", category: "countries", text: "איזו מדינה מפורסמת בפיצה?", options: ["צרפת", "איטליה", "ספרד", "יוון"], answer: 1, explanation: "איטליה מפורסמת בפיצה.", explanationHe: "איטליה מפורסמת בפיצה." },
  { id: 1058, lang: "en", category: "countries", text: "Which country has pyramids?", options: ["China", "Egypt", "India", "Brazil"], answer: 1, explanation: "Egypt is famous for pyramids.", explanationHe: "מצרים מפורסמת בפירמידות." },
  { id: 1059, lang: "he", category: "countries", text: "באיזו מדינה יש פירמידות?", options: ["סין", "מצרים", "הודו", "ברזיל"], answer: 1, explanation: "מצרים מפורסמת בפירמידות.", explanationHe: "מצרים מפורסמת בפירמידות." },
  { id: 1060, lang: "en", category: "countries", text: "Which country is the largest?", options: ["USA", "Russia", "China", "Canada"], answer: 1, explanation: "Russia is the largest country.", explanationHe: "רוסיה היא המדינה הגדולה ביותר." },
  { id: 1061, lang: "he", category: "countries", text: "איזו מדינה הכי גדולה?", options: ["ארה\"ב", "רוסיה", "סין", "קנדה"], answer: 1, explanation: "רוסיה היא המדינה הגדולה ביותר.", explanationHe: "רוסיה היא המדינה הגדולה ביותר." },
  { id: 1062, lang: "en", category: "geography", text: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2, explanation: "There are 7 continents.", explanationHe: "יש 7 יבשות." },
  { id: 1063, lang: "he", category: "geography", text: "כמה יבשות יש?", options: ["5", "6", "7", "8"], answer: 2, explanation: "יש 7 יבשות.", explanationHe: "יש 7 יבשות." },
  { id: 1064, lang: "en", category: "geography", text: "What is the largest ocean?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], answer: 1, explanation: "The Pacific Ocean is the largest.", explanationHe: "האוקיינוס השקט הוא הגדול ביותר." },
  { id: 1065, lang: "he", category: "geography", text: "מה האוקיינוס הכי גדול?", options: ["אטלנטי", "שקט", "הודי", "קרחי"], answer: 1, explanation: "האוקיינוס השקט הוא הגדול ביותר.", explanationHe: "האוקיינוס השקט הוא הגדול ביותר." },
  { id: 1066, lang: "en", category: "geography", text: "What is the highest mountain?", options: ["K2", "Everest", "Kilimanjaro", "Alps"], answer: 1, explanation: "Mount Everest is the highest.", explanationHe: "הר האוורסט הוא הגבוה ביותר." },
  { id: 1067, lang: "he", category: "geography", text: "מה ההר הכי גבוה?", options: ["K2", "אוורסט", "קילימנג'רו", "האלפים"], answer: 1, explanation: "הר האוורסט הוא הגבוה ביותר.", explanationHe: "הר האוורסט הוא הגבוה ביותר." },
  { id: 1068, lang: "en", category: "geography", text: "Which continent is the coldest?", options: ["Africa", "Antarctica", "Asia", "Europe"], answer: 1, explanation: "Antarctica is the coldest.", explanationHe: "אנטארקטיקה היא הקרה ביותר." },
  { id: 1069, lang: "he", category: "geography", text: "איזו יבשת הכי קרה?", options: ["אפריקה", "אנטארקטיקה", "אסיה", "אירופה"], answer: 1, explanation: "אנטארקטיקה היא הקרה ביותר.", explanationHe: "אנטארקטיקה היא הקרה ביותר." },
  { id: 1070, lang: "en", category: "geography", text: "Which river is the longest?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: 1, explanation: "The Nile is the longest river.", explanationHe: "הנילוס הוא הנהר הארוך ביותר." },
  { id: 1071, lang: "he", category: "geography", text: "איזה נהר הכי ארוך?", options: ["אמזונס", "נילוס", "יאנגצה", "מיסיסיפי"], answer: 1, explanation: "הנילוס הוא הנהר הארוך ביותר.", explanationHe: "הנילוס הוא הנהר הארוך ביותר." },
  { id: 1072, lang: "en", category: "geography", text: "What is the largest desert?", options: ["Gobi", "Sahara", "Arabian", "Kalahari"], answer: 1, explanation: "The Sahara is the largest hot desert.", explanationHe: "הסהרה הוא המדבר החם הגדול ביותר." },
  { id: 1073, lang: "he", category: "geography", text: "מה המדבר הכי גדול?", options: ["גובי", "סהרה", "ערבי", "קלהרי"], answer: 1, explanation: "הסהרה הוא המדבר החם הגדול ביותר.", explanationHe: "הסהרה הוא המדבר החם הגדול ביותר." },
  
  { id: 1074, lang: "en", category: "vocab", text: "Question 1074 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0, explanation: "This is explanation for question 1074.", explanationHe: "זוהי הסבר לשאלה 1074." },
  { id: 1075, lang: "he", category: "vocab", text: "שאלה 1075 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 0, explanation: "זהו הסבר לשאלה 1075.", explanationHe: "זהו הסבר לשאלה 1075." },
  { id: 1076, lang: "en", category: "reading", text: "Question 1076 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1, explanation: "This is explanation for question 1076.", explanationHe: "זוהי הסבר לשאלה 1076." },
  { id: 1077, lang: "he", category: "reading", text: "שאלה 1077 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 1, explanation: "זהו הסבר לשאלה 1077.", explanationHe: "זהו הסבר לשאלה 1077." },
  { id: 1078, lang: "en", category: "emotions", text: "Question 1078 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 2, explanation: "This is explanation for question 1078.", explanationHe: "זוהי הסבר לשאלה 1078." },
  { id: 1079, lang: "he", category: "emotions", text: "שאלה 1079 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 2, explanation: "זהו הסבר לשאלה 1079.", explanationHe: "זהו הסבר לשאלה 1079." },
  { id: 1080, lang: "en", category: "music", text: "Question 1080 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 3, explanation: "This is explanation for question 1080.", explanationHe: "זוהי הסבר לשאלה 1080." },
  { id: 1081, lang: "he", category: "music", text: "שאלה 1081 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 3, explanation: "זהו הסבר לשאלה 1081.", explanationHe: "זהו הסבר לשאלה 1081." },
  { id: 1082, lang: "en", category: "art", text: "Question 1082 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0, explanation: "This is explanation for question 1082.", explanationHe: "זוהי הסבר לשאלה 1082." },
  { id: 1083, lang: "he", category: "art", text: "שאלה 1083 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 0, explanation: "זהו הסבר לשאלה 1083.", explanationHe: "זהו הסבר לשאלה 1083." },
  { id: 1084, lang: "en", category: "science", text: "Question 1084 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1, explanation: "This is explanation for question 1084.", explanationHe: "זוהי הסבר לשאלה 1084." },
  { id: 1085, lang: "he", category: "science", text: "שאלה 1085 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 1, explanation: "זהו הסבר לשאלה 1085.", explanationHe: "זהו הסבר לשאלה 1085." },
  { id: 1086, lang: "en", category: "history", text: "Question 1086 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 2, explanation: "This is explanation for question 1086.", explanationHe: "זוהי הסבר לשאלה 1086." },
  { id: 1087, lang: "he", category: "history", text: "שאלה 1087 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 2, explanation: "זהו הסבר לשאלה 1087.", explanationHe: "זהו הסבר לשאלה 1087." },
  { id: 1088, lang: "en", category: "literature", text: "Question 1088 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 3, explanation: "This is explanation for question 1088.", explanationHe: "זוהי הסבר לשאלה 1088." },
  { id: 1089, lang: "he", category: "literature", text: "שאלה 1089 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 3, explanation: "זהו הסבר לשאלה 1089.", explanationHe: "זהו הסבר לשאלה 1089." },
  { id: 1090, lang: "en", category: "math", text: "Question 1090 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0, explanation: "This is explanation for question 1090.", explanationHe: "זוהי הסבר לשאלה 1090." },
  { id: 1091, lang: "he", category: "math", text: "שאלה 1091 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 0, explanation: "זהו הסבר לשאלה 1091.", explanationHe: "זהו הסבר לשאלה 1091." },
  { id: 1092, lang: "en", category: "vocab", text: "Question 1092 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1, explanation: "This is explanation for question 1092.", explanationHe: "זוהי הסבר לשאלה 1092." },
  { id: 1093, lang: "he", category: "vocab", text: "שאלה 1093 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 1, explanation: "זהו הסבר לשאלה 1093.", explanationHe: "זהו הסבר לשאלה 1093." },
  { id: 1094, lang: "en", category: "reading", text: "Question 1094 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 2, explanation: "This is explanation for question 1094.", explanationHe: "זוהי הסבר לשאלה 1094." },
  { id: 1095, lang: "he", category: "reading", text: "שאלה 1095 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 2, explanation: "זהו הסבר לשאלה 1095.", explanationHe: "זהו הסבר לשאלה 1095." },
  { id: 1096, lang: "en", category: "emotions", text: "Question 1096 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 3, explanation: "This is explanation for question 1096.", explanationHe: "זוהי הסבר לשאלה 1096." },
  { id: 1097, lang: "he", category: "emotions", text: "שאלה 1097 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 3, explanation: "זהו הסבר לשאלה 1097.", explanationHe: "זהו הסבר לשאלה 1097." },
  { id: 1098, lang: "en", category: "music", text: "Question 1098 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0, explanation: "This is explanation for question 1098.", explanationHe: "זוהי הסבר לשאלה 1098." },
  { id: 1099, lang: "he", category: "music", text: "שאלה 1099 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 0, explanation: "זהו הסבר לשאלה 1099.", explanationHe: "זהו הסבר לשאלה 1099." },
  { id: 1100, lang: "en", category: "art", text: "Question 1100 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1, explanation: "This is explanation for question 1100.", explanationHe: "זוהי הסבר לשאלה 1100." },
  { id: 1101, lang: "he", category: "art", text: "שאלה 1101 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 1, explanation: "זהו הסבר לשאלה 1101.", explanationHe: "זהו הסבר לשאלה 1101." },
  { id: 1102, lang: "en", category: "science", text: "Question 1102 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 2, explanation: "This is explanation for question 1102.", explanationHe: "זוהי הסבר לשאלה 1102." },
  { id: 1103, lang: "he", category: "science", text: "שאלה 1103 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 2, explanation: "זהו הסבר לשאלה 1103.", explanationHe: "זהו הסבר לשאלה 1103." },
  { id: 1104, lang: "en", category: "history", text: "Question 1104 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 3, explanation: "This is explanation for question 1104.", explanationHe: "זוהי הסבר לשאלה 1104." },
  { id: 1105, lang: "he", category: "history", text: "שאלה 1105 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 3, explanation: "זהו הסבר לשאלה 1105.", explanationHe: "זהו הסבר לשאלה 1105." },
  { id: 1106, lang: "en", category: "literature", text: "Question 1106 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0, explanation: "This is explanation for question 1106.", explanationHe: "זוהי הסבר לשאלה 1106." },
  { id: 1107, lang: "he", category: "literature", text: "שאלה 1107 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 0, explanation: "זהו הסבר לשאלה 1107.", explanationHe: "זהו הסבר לשאלה 1107." },
  { id: 1108, lang: "en", category: "math", text: "Question 1108 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1, explanation: "This is explanation for question 1108.", explanationHe: "זוהי הסבר לשאלה 1108." },
  { id: 1109, lang: "he", category: "math", text: "שאלה 1109 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 1, explanation: "זהו הסבר לשאלה 1109.", explanationHe: "זהו הסבר לשאלה 1109." },
  { id: 1110, lang: "en", category: "vocab", text: "Question 1110 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 2, explanation: "This is explanation for question 1110.", explanationHe: "זוהי הסבר לשאלה 1110." },
  { id: 1111, lang: "he", category: "vocab", text: "שאלה 1111 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 2, explanation: "זהו הסבר לשאלה 1111.", explanationHe: "זהו הסבר לשאלה 1111." },
  { id: 1112, lang: "en", category: "reading", text: "Question 1112 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 3, explanation: "This is explanation for question 1112.", explanationHe: "זוהי הסבר לשאלה 1112." },
  { id: 1113, lang: "he", category: "reading", text: "שאלה 1113 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 3, explanation: "זהו הסבר לשאלה 1113.", explanationHe: "זהו הסבר לשאלה 1113." },
  { id: 1114, lang: "en", category: "emotions", text: "Question 1114 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0, explanation: "This is explanation for question 1114.", explanationHe: "זוהי הסבר לשאלה 1114." },
  { id: 1115, lang: "he", category: "emotions", text: "שאלה 1115 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 0, explanation: "זהו הסבר לשאלה 1115.", explanationHe: "זהו הסבר לשאלה 1115." },
  { id: 1116, lang: "en", category: "music", text: "Question 1116 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1, explanation: "This is explanation for question 1116.", explanationHe: "זוהי הסבר לשאלה 1116." },
  { id: 1117, lang: "he", category: "music", text: "שאלה 1117 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 1, explanation: "זהו הסבר לשאלה 1117.", explanationHe: "זהו הסבר לשאלה 1117." },
  { id: 1118, lang: "en", category: "art", text: "Question 1118 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 2, explanation: "This is explanation for question 1118.", explanationHe: "זוהי הסבר לשאלה 1118." },
  { id: 1119, lang: "he", category: "art", text: "שאלה 1119 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 2, explanation: "זהו הסבר לשאלה 1119.", explanationHe: "זהו הסבר לשאלה 1119." },
  { id: 1120, lang: "en", category: "science", text: "Question 1120 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 3, explanation: "This is explanation for question 1120.", explanationHe: "זוהי הסבר לשאלה 1120." },
  { id: 1121, lang: "he", category: "science", text: "שאלה 1121 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 3, explanation: "זהו הסבר לשאלה 1121.", explanationHe: "זהו הסבר לשאלה 1121." },
  { id: 1122, lang: "en", category: "history", text: "Question 1122 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0, explanation: "This is explanation for question 1122.", explanationHe: "זוהי הסבר לשאלה 1122." },
  { id: 1123, lang: "he", category: "history", text: "שאלה 1123 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 0, explanation: "זהו הסבר לשאלה 1123.", explanationHe: "זהו הסבר לשאלה 1123." },
  { id: 1124, lang: "en", category: "literature", text: "Question 1124 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1, explanation: "This is explanation for question 1124.", explanationHe: "זוהי הסבר לשאלה 1124." },
  { id: 1125, lang: "he", category: "literature", text: "שאלה 1125 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 1, explanation: "זהו הסבר לשאלה 1125.", explanationHe: "זהו הסבר לשאלה 1125." },
  { id: 1126, lang: "en", category: "math", text: "Question 1126 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 2, explanation: "This is explanation for question 1126.", explanationHe: "זוהי הסבר לשאלה 1126." },
  { id: 1127, lang: "he", category: "math", text: "שאלה 1127 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 2, explanation: "זהו הסבר לשאלה 1127.", explanationHe: "זהו הסבר לשאלה 1127." },
  { id: 1128, lang: "en", category: "vocab", text: "Question 1128 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 3, explanation: "This is explanation for question 1128.", explanationHe: "זוהי הסבר לשאלה 1128." },
  { id: 1129, lang: "he", category: "vocab", text: "שאלה 1129 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 3, explanation: "זהו הסבר לשאלה 1129.", explanationHe: "זהו הסבר לשאלה 1129." },
  { id: 1130, lang: "en", category: "reading", text: "Question 1130 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0, explanation: "This is explanation for question 1130.", explanationHe: "זוהי הסבר לשאלה 1130." },
  { id: 1131, lang: "he", category: "reading", text: "שאלה 1131 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 0, explanation: "זהו הסבר לשאלה 1131.", explanationHe: "זהו הסבר לשאלה 1131." },
  { id: 1132, lang: "en", category: "emotions", text: "Question 1132 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1, explanation: "This is explanation for question 1132.", explanationHe: "זוהי הסבר לשאלה 1132." },
  { id: 1133, lang: "he", category: "emotions", text: "שאלה 1133 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 1, explanation: "זהו הסבר לשאלה 1133.", explanationHe: "זהו הסבר לשאלה 1133." },
  { id: 1134, lang: "en", category: "music", text: "Question 1134 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 2, explanation: "This is explanation for question 1134.", explanationHe: "זוהי הסבר לשאלה 1134." },
  { id: 1135, lang: "he", category: "music", text: "שאלה 1135 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 2, explanation: "זהו הסבר לשאלה 1135.", explanationHe: "זהו הסבר לשאלה 1135." },
  { id: 1136, lang: "en", category: "art", text: "Question 1136 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 3, explanation: "This is explanation for question 1136.", explanationHe: "זוהי הסבר לשאלה 1136." },
  { id: 1137, lang: "he", category: "art", text: "שאלה 1137 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 3, explanation: "זהו הסבר לשאלה 1137.", explanationHe: "זהו הסבר לשאלה 1137." },
  { id: 1138, lang: "en", category: "science", text: "Question 1138 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0, explanation: "This is explanation for question 1138.", explanationHe: "זוהי הסבר לשאלה 1138." },
  { id: 1139, lang: "he", category: "science", text: "שאלה 1139 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 0, explanation: "זהו הסבר לשאלה 1139.", explanationHe: "זהו הסבר לשאלה 1139." },
  { id: 1140, lang: "en", category: "history", text: "Question 1140 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1, explanation: "This is explanation for question 1140.", explanationHe: "זוהי הסבר לשאלה 1140." },
  { id: 1141, lang: "he", category: "history", text: "שאלה 1141 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 1, explanation: "זהו הסבר לשאלה 1141.", explanationHe: "זהו הסבר לשאלה 1141." },
  { id: 1142, lang: "en", category: "literature", text: "Question 1142 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 2, explanation: "This is explanation for question 1142.", explanationHe: "זוהי הסבר לשאלה 1142." },
  { id: 1143, lang: "he", category: "literature", text: "שאלה 1143 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 2, explanation: "זהו הסבר לשאלה 1143.", explanationHe: "זהו הסבר לשאלה 1143." },
  { id: 1144, lang: "en", category: "math", text: "Question 1144 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 3, explanation: "This is explanation for question 1144.", explanationHe: "זוהי הסבר לשאלה 1144." },
  { id: 1145, lang: "he", category: "math", text: "שאלה 1145 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 3, explanation: "זהו הסבר לשאלה 1145.", explanationHe: "זהו הסבר לשאלה 1145." },
  { id: 1146, lang: "en", category: "vocab", text: "Question 1146 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0, explanation: "This is explanation for question 1146.", explanationHe: "זוהי הסבר לשאלה 1146." },
  { id: 1147, lang: "he", category: "vocab", text: "שאלה 1147 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 0, explanation: "זהו הסבר לשאלה 1147.", explanationHe: "זהו הסבר לשאלה 1147." },
  { id: 1148, lang: "en", category: "reading", text: "Question 1148 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1, explanation: "This is explanation for question 1148.", explanationHe: "זוהי הסבר לשאלה 1148." },
  { id: 1149, lang: "he", category: "reading", text: "שאלה 1149 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 1, explanation: "זהו הסבר לשאלה 1149.", explanationHe: "זהו הסבר לשאלה 1149." },
  { id: 1150, lang: "en", category: "emotions", text: "Question 1150 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 2, explanation: "This is explanation for question 1150.", explanationHe: "זוהי הסבר לשאלה 1150." },
  { id: 1151, lang: "he", category: "emotions", text: "שאלה 1151 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 2, explanation: "זהו הסבר לשאלה 1151.", explanationHe: "זהו הסבר לשאלה 1151." },
  { id: 1152, lang: "en", category: "music", text: "Question 1152 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 3, explanation: "This is explanation for question 1152.", explanationHe: "זוהי הסבר לשאלה 1152." },
  { id: 1153, lang: "he", category: "music", text: "שאלה 1153 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 3, explanation: "זהו הסבר לשאלה 1153.", explanationHe: "זהו הסבר לשאלה 1153." },
  { id: 1154, lang: "en", category: "art", text: "Question 1154 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0, explanation: "This is explanation for question 1154.", explanationHe: "זוהי הסבר לשאלה 1154." },
  { id: 1155, lang: "he", category: "art", text: "שאלה 1155 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 0, explanation: "זהו הסבר לשאלה 1155.", explanationHe: "זהו הסבר לשאלה 1155." },
  { id: 1156, lang: "en", category: "science", text: "Question 1156 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1, explanation: "This is explanation for question 1156.", explanationHe: "זוהי הסבר לשאלה 1156." },
  { id: 1157, lang: "he", category: "science", text: "שאלה 1157 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 1, explanation: "זהו הסבר לשאלה 1157.", explanationHe: "זהו הסבר לשאלה 1157." },
  { id: 1158, lang: "en", category: "history", text: "Question 1158 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 2, explanation: "This is explanation for question 1158.", explanationHe: "זוהי הסבר לשאלה 1158." },
  { id: 1159, lang: "he", category: "history", text: "שאלה 1159 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 2, explanation: "זהו הסבר לשאלה 1159.", explanationHe: "זהו הסבר לשאלה 1159." },
  { id: 1160, lang: "en", category: "literature", text: "Question 1160 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 3, explanation: "This is explanation for question 1160.", explanationHe: "זוהי הסבר לשאלה 1160." },
  { id: 1161, lang: "he", category: "literature", text: "שאלה 1161 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 3, explanation: "זהו הסבר לשאלה 1161.", explanationHe: "זהו הסבר לשאלה 1161." },
  { id: 1162, lang: "en", category: "math", text: "Question 1162 - What is the correct answer?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 0, explanation: "This is explanation for question 1162.", explanationHe: "זוהי הסבר לשאלה 1162." },
  { id: 1163, lang: "he", category: "math", text: "שאלה 1163 - מה התשובה הנכונה?", options: ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"], answer: 0, explanation: "זהו הסבר לשאלה 1163.", explanationHe: "זהו הסבר לשאלה 1163." },
  
  // More Grammar Questions (1164-1213)
  { id: 1164, lang: "en", category: "grammar", text: "Choose the correct form: 'They ____ to the cinema yesterday.'", options: ["go", "goes", "went", "going"], answer: 2, explanation: "Past tense of 'go' is 'went'.", explanationHe: "עבר של 'go' הוא 'went'." },
  { id: 1165, lang: "en", category: "grammar", text: "Which is correct: 'I ____ my homework now.'", options: ["do", "doing", "am doing", "does"], answer: 2, explanation: "Present continuous uses 'am/is/are + verb-ing'.", explanationHe: "הווה ממושך משתמש ב-'am/is/are + פועל-ing'." },
  { id: 1166, lang: "en", category: "grammar", text: "What is the plural of 'mouse'?", options: ["mouses", "mice", "mouse", "mices"], answer: 1, explanation: "The irregular plural of 'mouse' is 'mice'.", explanationHe: "הרבים של 'mouse' הוא 'mice'." },
  { id: 1167, lang: "en", category: "grammar", text: "Select the correct: 'She ____ very fast.'", options: ["run", "runs", "running", "ran"], answer: 1, explanation: "Third person singular takes -s in present simple.", explanationHe: "גוף שלישי יחיד לוקח -s בהווה פשוט." },
  { id: 1168, lang: "en", category: "grammar", text: "Which is correct: 'He ____ a teacher.'", options: ["am", "is", "are", "be"], answer: 1, explanation: "Use 'is' with he/she/it.", explanationHe: "משתמשים ב-'is' עם he/she/it." },
  { id: 1169, lang: "en", category: "grammar", text: "Past tense of 'eat'?", options: ["eated", "ate", "eaten", "eating"], answer: 1, explanation: "The past tense of 'eat' is 'ate'.", explanationHe: "עבר של 'eat' הוא 'ate'." },
  { id: 1170, lang: "en", category: "grammar", text: "Choose: 'We ____ playing football.'", options: ["am", "is", "are", "be"], answer: 2, explanation: "Use 'are' with 'we'.", explanationHe: "משתמשים ב-'are' עם 'we'." },
  { id: 1171, lang: "en", category: "grammar", text: "What's the opposite of 'big'?", options: ["small", "large", "huge", "giant"], answer: 0, explanation: "The opposite of 'big' is 'small'.", explanationHe: "ההפך של 'big' הוא 'small'." },
  { id: 1172, lang: "en", category: "grammar", text: "Complete: 'I ____ not like pizza.'", options: ["do", "does", "am", "is"], answer: 0, explanation: "Use 'do' with I/you/we/they.", explanationHe: "משתמשים ב-'do' עם I/you/we/they." },
  { id: 1173, lang: "en", category: "grammar", text: "Past of 'run'?", options: ["runned", "ran", "run", "running"], answer: 1, explanation: "The past tense of 'run' is 'ran'.", explanationHe: "עבר של 'run' הוא 'ran'." },
  { id: 1174, lang: "en", category: "grammar", text: "Which is correct: '____ you like ice cream?'", options: ["Do", "Does", "Are", "Is"], answer: 0, explanation: "Use 'Do' for questions with you/we/they.", explanationHe: "משתמשים ב-'Do' לשאלות עם you/we/they." },
  { id: 1175, lang: "en", category: "grammar", text: "Choose: 'She ____ to school every day.'", options: ["walk", "walks", "walking", "walked"], answer: 1, explanation: "Third person singular takes -s.", explanationHe: "גוף שלישי יחיד לוקח -s." },
  { id: 1176, lang: "en", category: "grammar", text: "What's the plural of 'baby'?", options: ["babys", "babies", "baby", "babyes"], answer: 1, explanation: "When a word ends in 'y' after a consonant, change to 'ies'.", explanationHe: "כשמילה נגמרת ב-'y' אחרי עיצור, משנים ל-'ies'." },
  { id: 1177, lang: "en", category: "grammar", text: "Complete: 'They ____ watching TV now.'", options: ["am", "is", "are", "be"], answer: 2, explanation: "Use 'are' with 'they'.", explanationHe: "משתמשים ב-'are' עם 'they'." },
  { id: 1178, lang: "en", category: "grammar", text: "Past of 'see'?", options: ["seed", "saw", "seen", "seeing"], answer: 1, explanation: "The past tense of 'see' is 'saw'.", explanationHe: "עבר של 'see' הוא 'saw'." },
  { id: 1179, lang: "en", category: "grammar", text: "Which is correct: 'I ____ hungry.'", options: ["am", "is", "are", "be"], answer: 0, explanation: "Use 'am' with 'I'.", explanationHe: "משתמשים ב-'am' עם 'I'." },
  { id: 1180, lang: "en", category: "grammar", text: "Plural of 'foot'?", options: ["foots", "feet", "foot", "feets"], answer: 1, explanation: "The irregular plural of 'foot' is 'feet'.", explanationHe: "הרבים של 'foot' הוא 'feet'." },
  { id: 1181, lang: "en", category: "grammar", text: "Choose: 'He ____ a doctor.'", options: ["am", "is", "are", "be"], answer: 1, explanation: "Use 'is' with he/she/it.", explanationHe: "משתמשים ב-'is' עם he/she/it." },
  { id: 1182, lang: "en", category: "grammar", text: "Past of 'buy'?", options: ["buyed", "bought", "buy", "buying"], answer: 1, explanation: "The past tense of 'buy' is 'bought'.", explanationHe: "עבר של 'buy' הוא 'bought'." },
  { id: 1183, lang: "en", category: "grammar", text: "Complete: '____ she like chocolate?'", options: ["Do", "Does", "Is", "Are"], answer: 1, explanation: "Use 'Does' for questions with he/she/it.", explanationHe: "משתמשים ב-'Does' לשאלות עם he/she/it." },
  { id: 1184, lang: "en", category: "grammar", text: "Plural of 'tooth'?", options: ["tooths", "teeth", "tooth", "teethes"], answer: 1, explanation: "The irregular plural of 'tooth' is 'teeth'.", explanationHe: "הרבים של 'tooth' הוא 'teeth'." },
  { id: 1185, lang: "en", category: "grammar", text: "Past of 'drink'?", options: ["drinked", "drunk", "drank", "drinking"], answer: 2, explanation: "The past tense of 'drink' is 'drank'.", explanationHe: "עבר של 'drink' הוא 'drank'." },
  { id: 1186, lang: "en", category: "grammar", text: "Choose: 'We ____ happy.'", options: ["am", "is", "are", "be"], answer: 2, explanation: "Use 'are' with we/you/they.", explanationHe: "משתמשים ב-'are' עם we/you/they." },
  { id: 1187, lang: "en", category: "grammar", text: "What's the opposite of 'hot'?", options: ["cold", "warm", "cool", "heat"], answer: 0, explanation: "The opposite of 'hot' is 'cold'.", explanationHe: "ההפך של 'hot' הוא 'cold'." },
  { id: 1188, lang: "en", category: "grammar", text: "Past of 'sing'?", options: ["singed", "sang", "sung", "singing"], answer: 1, explanation: "The past tense of 'sing' is 'sang'.", explanationHe: "עבר של 'sing' הוא 'sang'." },
  { id: 1189, lang: "en", category: "grammar", text: "Plural of 'man'?", options: ["mans", "men", "man", "mens"], answer: 1, explanation: "The irregular plural of 'man' is 'men'.", explanationHe: "הרבים של 'man' הוא 'men'." },
  { id: 1190, lang: "en", category: "grammar", text: "Choose: 'It ____ raining.'", options: ["am", "is", "are", "be"], answer: 1, explanation: "Use 'is' with 'it'.", explanationHe: "משתמשים ב-'is' עם 'it'." },
  { id: 1191, lang: "en", category: "grammar", text: "Past of 'swim'?", options: ["swimmed", "swam", "swum", "swimming"], answer: 1, explanation: "The past tense of 'swim' is 'swam'.", explanationHe: "עבר של 'swim' הוא 'swam'." },
  { id: 1192, lang: "en", category: "grammar", text: "What's the opposite of 'old'?", options: ["new", "young", "fresh", "modern"], answer: 1, explanation: "The opposite of 'old' (for age) is 'young'.", explanationHe: "ההפך של 'old' (לגיל) הוא 'young'." },
  { id: 1193, lang: "en", category: "grammar", text: "Plural of 'woman'?", options: ["womans", "women", "woman", "womens"], answer: 1, explanation: "The irregular plural of 'woman' is 'women'.", explanationHe: "הרבים של 'woman' הוא 'women'." },
  { id: 1194, lang: "en", category: "grammar", text: "Past of 'write'?", options: ["writed", "wrote", "written", "writing"], answer: 1, explanation: "The past tense of 'write' is 'wrote'.", explanationHe: "עבר של 'write' הוא 'wrote'." },
  { id: 1195, lang: "en", category: "grammar", text: "Choose: 'You ____ my best friend.'", options: ["am", "is", "are", "be"], answer: 2, explanation: "Use 'are' with 'you'.", explanationHe: "משתמשים ב-'are' עם 'you'." },
  { id: 1196, lang: "en", category: "grammar", text: "What's the opposite of 'fast'?", options: ["slow", "quick", "speed", "rapid"], answer: 0, explanation: "The opposite of 'fast' is 'slow'.", explanationHe: "ההפך של 'fast' הוא 'slow'." },
  { id: 1197, lang: "en", category: "grammar", text: "Past of 'come'?", options: ["comed", "came", "come", "coming"], answer: 1, explanation: "The past tense of 'come' is 'came'.", explanationHe: "עבר של 'come' הוא 'came'." },
  { id: 1198, lang: "en", category: "grammar", text: "Plural of 'knife'?", options: ["knifes", "knives", "knife", "knifves"], answer: 1, explanation: "Change 'f' to 'v' and add 'es'.", explanationHe: "משנים 'f' ל-'v' ומוסיפים 'es'." },
  { id: 1199, lang: "en", category: "grammar", text: "Choose: 'She ____ reading a book.'", options: ["am", "is", "are", "be"], answer: 1, explanation: "Use 'is' with she/he/it.", explanationHe: "משתמשים ב-'is' עם she/he/it." },
  { id: 1200, lang: "en", category: "grammar", text: "Past of 'think'?", options: ["thinked", "thought", "think", "thinking"], answer: 1, explanation: "The past tense of 'think' is 'thought'.", explanationHe: "עבר של 'think' הוא 'thought'." },
  { id: 1201, lang: "en", category: "grammar", text: "What's the opposite of 'good'?", options: ["bad", "evil", "wrong", "ugly"], answer: 0, explanation: "The opposite of 'good' is 'bad'.", explanationHe: "ההפך של 'good' הוא 'bad'." },
  { id: 1202, lang: "en", category: "grammar", text: "Plural of 'leaf'?", options: ["leafs", "leaves", "leaf", "leavs"], answer: 1, explanation: "Change 'f' to 'v' and add 'es'.", explanationHe: "משנים 'f' ל-'v' ומוסיפים 'es'." },
  { id: 1203, lang: "en", category: "grammar", text: "Choose: 'I ____ not tired.'", options: ["am", "is", "are", "be"], answer: 0, explanation: "Use 'am' with 'I'.", explanationHe: "משתמשים ב-'am' עם 'I'." },
  { id: 1204, lang: "en", category: "grammar", text: "Past of 'bring'?", options: ["bringed", "brought", "bring", "bringing"], answer: 1, explanation: "The past tense of 'bring' is 'brought'.", explanationHe: "עבר של 'bring' הוא 'brought'." },
  { id: 1205, lang: "en", category: "grammar", text: "What's the opposite of 'day'?", options: ["night", "evening", "dark", "moon"], answer: 0, explanation: "The opposite of 'day' is 'night'.", explanationHe: "ההפך של 'day' הוא 'night'." },
  { id: 1206, lang: "en", category: "grammar", text: "Plural of 'box'?", options: ["boxs", "boxes", "box", "boxies"], answer: 1, explanation: "Add 'es' after words ending in x/s/ch/sh.", explanationHe: "מוסיפים 'es' אחרי מילים שנגמרות ב-x/s/ch/sh." },
  { id: 1207, lang: "en", category: "grammar", text: "Choose: 'They ____ students.'", options: ["am", "is", "are", "be"], answer: 2, explanation: "Use 'are' with 'they'.", explanationHe: "משתמשים ב-'are' עם 'they'." },
  { id: 1208, lang: "en", category: "grammar", text: "Past of 'teach'?", options: ["teached", "taught", "teach", "teaching"], answer: 1, explanation: "The past tense of 'teach' is 'taught'.", explanationHe: "עבר של 'teach' הוא 'taught'." },
  { id: 1209, lang: "en", category: "grammar", text: "What's the opposite of 'tall'?", options: ["short", "small", "low", "tiny"], answer: 0, explanation: "The opposite of 'tall' is 'short'.", explanationHe: "ההפך של 'tall' הוא 'short'." },
  { id: 1210, lang: "en", category: "grammar", text: "Plural of 'city'?", options: ["citys", "cities", "city", "cityes"], answer: 1, explanation: "Change 'y' to 'ies' after a consonant.", explanationHe: "משנים 'y' ל-'ies' אחרי עיצור." },
  { id: 1211, lang: "en", category: "grammar", text: "Choose: 'He ____ sleeping.'", options: ["am", "is", "are", "be"], answer: 1, explanation: "Use 'is' with he/she/it.", explanationHe: "משתמשים ב-'is' עם he/she/it." },
  { id: 1212, lang: "en", category: "grammar", text: "Past of 'catch'?", options: ["catched", "caught", "catch", "catching"], answer: 1, explanation: "The past tense of 'catch' is 'caught'.", explanationHe: "עבר של 'catch' הוא 'caught'." },
  { id: 1213, lang: "en", category: "grammar", text: "What's the opposite of 'happy'?", options: ["sad", "angry", "tired", "bored"], answer: 0, explanation: "The opposite of 'happy' is 'sad'.", explanationHe: "ההפך של 'happy' הוא 'sad'." },
  
  // Vocabulary - Everyday Objects (1214-1233)
  { id: 1214, lang: "en", category: "vocab", text: "What do you use to cut paper?", options: ["scissors", "knife", "pen", "ruler"], answer: 0, explanation: "Scissors are used to cut paper.", explanationHe: "מספריים משמשים לגזור נייר." },
  { id: 1215, lang: "en", category: "vocab", text: "Where do you keep your clothes?", options: ["closet", "kitchen", "bathroom", "garage"], answer: 0, explanation: "A closet is where we keep clothes.", explanationHe: "ארון בגדים הוא המקום שבו שומרים בגדים." },
  { id: 1216, lang: "en", category: "vocab", text: "What do you use to tell time?", options: ["clock", "phone", "book", "mirror"], answer: 0, explanation: "A clock tells time.", explanationHe: "שעון מראה את השעה." },
  { id: 1217, lang: "en", category: "vocab", text: "What do you sleep on?", options: ["bed", "chair", "table", "floor"], answer: 0, explanation: "We sleep on a bed.", explanationHe: "אנחנו ישנים על מיטה." },
  { id: 1218, lang: "en", category: "vocab", text: "What do you use to write?", options: ["pen", "scissors", "eraser", "ruler"], answer: 0, explanation: "A pen is used for writing.", explanationHe: "עט משמש לכתיבה." },
  { id: 1219, lang: "en", category: "vocab", text: "What do you wear on your feet?", options: ["shoes", "hat", "gloves", "shirt"], answer: 0, explanation: "Shoes are worn on feet.", explanationHe: "נעליים נועלים על הרגליים." },
  { id: 1220, lang: "en", category: "vocab", text: "What do you use to see your reflection?", options: ["mirror", "window", "picture", "screen"], answer: 0, explanation: "A mirror shows your reflection.", explanationHe: "מראה מראה את השתקפותך." },
  { id: 1221, lang: "en", category: "vocab", text: "What do you sit on?", options: ["chair", "table", "bed", "floor"], answer: 0, explanation: "We sit on a chair.", explanationHe: "אנחנו יושבים על כיסא." },
  { id: 1222, lang: "en", category: "vocab", text: "What do you use to open a door?", options: ["key", "scissors", "pen", "spoon"], answer: 0, explanation: "A key opens a door.", explanationHe: "מפתח פותח דלת." },
  { id: 1223, lang: "en", category: "vocab", text: "What do you drink from?", options: ["cup", "plate", "bowl", "spoon"], answer: 0, explanation: "We drink from a cup or glass.", explanationHe: "אנחנו שותים מכוס." },
  { id: 1224, lang: "en", category: "vocab", text: "What do you use to call someone?", options: ["phone", "computer", "book", "pen"], answer: 0, explanation: "A phone is used to call people.", explanationHe: "טלפון משמש להתקשר לאנשים." },
  { id: 1225, lang: "en", category: "vocab", text: "What do you read?", options: ["book", "chair", "bed", "cup"], answer: 0, explanation: "We read books.", explanationHe: "אנחנו קוראים ספרים." },
  { id: 1226, lang: "en", category: "vocab", text: "What gives light?", options: ["lamp", "chair", "table", "carpet"], answer: 0, explanation: "A lamp gives light.", explanationHe: "מנורה נותנת אור." },
  { id: 1227, lang: "en", category: "vocab", text: "What do you use to eat soup?", options: ["spoon", "fork", "knife", "chopsticks"], answer: 0, explanation: "A spoon is used for soup.", explanationHe: "כף משמשת למרק." },
  { id: 1228, lang: "en", category: "vocab", text: "What do you use to brush your teeth?", options: ["toothbrush", "comb", "spoon", "pen"], answer: 0, explanation: "A toothbrush is for teeth.", explanationHe: "מברשת שיניים היא לשיניים." },
  { id: 1229, lang: "en", category: "vocab", text: "What do you wear on your head?", options: ["hat", "shoes", "gloves", "belt"], answer: 0, explanation: "A hat is worn on the head.", explanationHe: "כובע נלבש על הראש." },
  { id: 1230, lang: "en", category: "vocab", text: "What do you use to dry yourself?", options: ["towel", "blanket", "shirt", "hat"], answer: 0, explanation: "A towel is for drying.", explanationHe: "מגבת משמשת להתייבשות." },
  { id: 1231, lang: "en", category: "vocab", text: "What shows pictures?", options: ["television", "radio", "phone", "book"], answer: 0, explanation: "A television shows pictures.", explanationHe: "טלוויזיה מציגה תמונות." },
  { id: 1232, lang: "en", category: "vocab", text: "What do you use to cook?", options: ["stove", "refrigerator", "sink", "table"], answer: 0, explanation: "A stove is used for cooking.", explanationHe: "כיריים משמשים לבישול." },
  { id: 1233, lang: "en", category: "vocab", text: "What keeps food cold?", options: ["refrigerator", "oven", "stove", "microwave"], answer: 0, explanation: "A refrigerator keeps food cold.", explanationHe: "מקרר שומר על אוכל קר." },
  
  // Animals Vocabulary (1234-1253)
  { id: 1234, lang: "en", category: "vocab", text: "Which animal has a trunk?", options: ["elephant", "lion", "tiger", "bear"], answer: 0, explanation: "An elephant has a long trunk.", explanationHe: "לפיל יש חדק ארוך." },
  { id: 1235, lang: "en", category: "vocab", text: "Which animal is the king of the jungle?", options: ["lion", "tiger", "bear", "wolf"], answer: 0, explanation: "The lion is called the king of the jungle.", explanationHe: "האריה נקרא מלך החיות." },
  { id: 1236, lang: "en", category: "vocab", text: "Which animal has the longest neck?", options: ["giraffe", "horse", "camel", "deer"], answer: 0, explanation: "A giraffe has a very long neck.", explanationHe: "לג'ירפה יש צוואר ארוך מאוד." },
  { id: 1237, lang: "en", category: "vocab", text: "Which animal says 'woof woof'?", options: ["dog", "cat", "bird", "cow"], answer: 0, explanation: "A dog barks 'woof woof'.", explanationHe: "כלב נובח 'האו האו'." },
  { id: 1238, lang: "en", category: "vocab", text: "Which animal says 'meow'?", options: ["cat", "dog", "bird", "mouse"], answer: 0, explanation: "A cat says 'meow'.", explanationHe: "חתול אומר 'מיאו'." },
  { id: 1239, lang: "en", category: "vocab", text: "Which animal can fly?", options: ["bird", "dog", "cat", "fish"], answer: 0, explanation: "Birds can fly.", explanationHe: "ציפורים יכולות לעוף." },
  { id: 1240, lang: "en", category: "vocab", text: "Which animal lives in water?", options: ["fish", "cat", "dog", "bird"], answer: 0, explanation: "Fish live in water.", explanationHe: "דגים חיים במים." },
  { id: 1241, lang: "en", category: "vocab", text: "Which animal has stripes?", options: ["zebra", "elephant", "giraffe", "lion"], answer: 0, explanation: "A zebra has black and white stripes.", explanationHe: "לזברה יש פסים שחור-לבן." },
  { id: 1242, lang: "en", category: "vocab", text: "Which animal hops?", options: ["rabbit", "dog", "cat", "cow"], answer: 0, explanation: "Rabbits hop instead of walking.", explanationHe: "ארנבים קופצים במקום ללכת." },
  { id: 1243, lang: "en", category: "vocab", text: "Which animal gives us milk?", options: ["cow", "dog", "cat", "bird"], answer: 0, explanation: "Cows give us milk.", explanationHe: "פרות נותנות לנו חלב." },
  { id: 1244, lang: "en", category: "vocab", text: "Which animal is very slow?", options: ["turtle", "rabbit", "horse", "cheetah"], answer: 0, explanation: "Turtles are very slow.", explanationHe: "צבים הם מאוד איטיים." },
  { id: 1245, lang: "en", category: "vocab", text: "Which animal has a shell?", options: ["turtle", "dog", "cat", "bird"], answer: 0, explanation: "Turtles have a hard shell.", explanationHe: "לצבים יש שריון קשה." },
  { id: 1246, lang: "en", category: "vocab", text: "Which animal is very big and gray?", options: ["elephant", "mouse", "cat", "bird"], answer: 0, explanation: "Elephants are big and gray.", explanationHe: "פילים גדולים ואפורים." },
  { id: 1247, lang: "en", category: "vocab", text: "Which animal makes honey?", options: ["bee", "butterfly", "bird", "ant"], answer: 0, explanation: "Bees make honey.", explanationHe: "דבורים עושות דבש." },
  { id: 1248, lang: "en", category: "vocab", text: "Which animal is very fast?", options: ["cheetah", "turtle", "snail", "cow"], answer: 0, explanation: "Cheetahs are the fastest animals.", explanationHe: "ברדלסים הם החיות הכי מהירות." },
  { id: 1249, lang: "en", category: "vocab", text: "Which animal lives in the jungle?", options: ["monkey", "penguin", "polar bear", "camel"], answer: 0, explanation: "Monkeys live in the jungle.", explanationHe: "קופים חיים בג'ונגל." },
  { id: 1250, lang: "en", category: "vocab", text: "Which animal has big ears?", options: ["elephant", "snake", "fish", "bird"], answer: 0, explanation: "Elephants have very big ears.", explanationHe: "לפילים יש אוזניים גדולות מאוד." },
  { id: 1251, lang: "en", category: "vocab", text: "Which animal eats carrots?", options: ["rabbit", "lion", "tiger", "bear"], answer: 0, explanation: "Rabbits love to eat carrots.", explanationHe: "ארנבים אוהבים לאכול גזר." },
  { id: 1252, lang: "en", category: "vocab", text: "Which animal lives in the desert?", options: ["camel", "penguin", "dolphin", "frog"], answer: 0, explanation: "Camels live in the desert.", explanationHe: "גמלים חיים במדבר." },
  { id: 1253, lang: "en", category: "vocab", text: "Which animal can swim?", options: ["fish", "bird", "cat", "mouse"], answer: 0, explanation: "Fish can swim in water.", explanationHe: "דגים יכולים לשחות במים." },
  
  // Food & Drinks Vocabulary (1254-1273)
  { id: 1254, lang: "en", category: "vocab", text: "What is a yellow fruit that monkeys like?", options: ["banana", "apple", "orange", "grape"], answer: 0, explanation: "Monkeys love bananas.", explanationHe: "קופים אוהבים בננות." },
  { id: 1255, lang: "en", category: "vocab", text: "What is red and round?", options: ["apple", "banana", "carrot", "cucumber"], answer: 0, explanation: "An apple is red and round.", explanationHe: "תפוח הוא אדום ועגול." },
  { id: 1256, lang: "en", category: "vocab", text: "What do you drink in the morning?", options: ["coffee", "soup", "salad", "bread"], answer: 0, explanation: "Many people drink coffee in the morning.", explanationHe: "אנשים רבים שותים קפה בבוקר." },
  { id: 1257, lang: "en", category: "vocab", text: "What is orange and crunchy?", options: ["carrot", "apple", "banana", "grape"], answer: 0, explanation: "A carrot is orange and crunchy.", explanationHe: "גזר הוא כתום ופריך." },
  { id: 1258, lang: "en", category: "vocab", text: "What is made from milk?", options: ["cheese", "bread", "rice", "meat"], answer: 0, explanation: "Cheese is made from milk.", explanationHe: "גבינה עשויה מחלב." },
  { id: 1259, lang: "en", category: "vocab", text: "What is sweet and cold?", options: ["ice cream", "soup", "tea", "coffee"], answer: 0, explanation: "Ice cream is sweet and cold.", explanationHe: "גלידה היא מתוקה וקרה." },
  { id: 1260, lang: "en", category: "vocab", text: "What do you eat for breakfast?", options: ["cereal", "pizza", "burger", "steak"], answer: 0, explanation: "Cereal is a common breakfast food.", explanationHe: "דגני בוקר הם אוכל בוקר נפוץ." },
  { id: 1261, lang: "en", category: "vocab", text: "What comes from chickens?", options: ["egg", "milk", "cheese", "bread"], answer: 0, explanation: "Eggs come from chickens.", explanationHe: "ביצים מגיעות מתרנגולות." },
  { id: 1262, lang: "en", category: "vocab", text: "What is round and grows on pizza?", options: ["tomato", "carrot", "banana", "apple"], answer: 0, explanation: "Tomatoes are used on pizza.", explanationHe: "עגבניות משמשות על פיצה." },
  { id: 1263, lang: "en", category: "vocab", text: "What do bees make?", options: ["honey", "milk", "juice", "water"], answer: 0, explanation: "Bees make honey.", explanationHe: "דבורים עושות דבש." },
  { id: 1264, lang: "en", category: "vocab", text: "What is green and crunchy?", options: ["lettuce", "banana", "orange", "strawberry"], answer: 0, explanation: "Lettuce is green and crunchy.", explanationHe: "חסה היא ירוקה ופריכה." },
  { id: 1265, lang: "en", category: "vocab", text: "What do you spread on bread?", options: ["butter", "water", "juice", "soup"], answer: 0, explanation: "Butter is spread on bread.", explanationHe: "חמאה מורחים על לחם." },
  { id: 1266, lang: "en", category: "vocab", text: "What is hot and liquid for breakfast?", options: ["coffee", "bread", "egg", "cheese"], answer: 0, explanation: "Coffee is a hot liquid drink.", explanationHe: "קפה הוא משקה חם ונוזלי." },
  { id: 1267, lang: "en", category: "vocab", text: "What is small and grows in bunches?", options: ["grape", "apple", "banana", "watermelon"], answer: 0, explanation: "Grapes grow in bunches.", explanationHe: "ענבים גדלים באשכולות." },
  { id: 1268, lang: "en", category: "vocab", text: "What is red and sweet?", options: ["strawberry", "carrot", "cucumber", "lettuce"], answer: 0, explanation: "Strawberries are red and sweet.", explanationHe: "תותים אדומים ומתוקים." },
  { id: 1269, lang: "en", category: "vocab", text: "What do you put on a sandwich?", options: ["meat", "water", "juice", "milk"], answer: 0, explanation: "Meat can go on a sandwich.", explanationHe: "בשר יכול להיות בכריך." },
  { id: 1270, lang: "en", category: "vocab", text: "What is long and yellow?", options: ["banana", "apple", "grape", "strawberry"], answer: 0, explanation: "Bananas are long and yellow.", explanationHe: "בננות ארוכות וצהובות." },
  { id: 1271, lang: "en", category: "vocab", text: "What is white and you pour on cereal?", options: ["milk", "water", "juice", "soda"], answer: 0, explanation: "Milk is poured on cereal.", explanationHe: "חלב שופכים על דגני בוקר." },
  { id: 1272, lang: "en", category: "vocab", text: "What is baked and sliced?", options: ["bread", "milk", "juice", "water"], answer: 0, explanation: "Bread is baked and sliced.", explanationHe: "לחם נאפה ונפרס." },
  { id: 1273, lang: "en", category: "vocab", text: "What is sweet and brown?", options: ["chocolate", "carrot", "lettuce", "cucumber"], answer: 0, explanation: "Chocolate is sweet and brown.", explanationHe: "שוקולד מתוק וחום." },
  
  // Family & People (1274-1283)
  { id: 1274, lang: "en", category: "vocab", text: "Who teaches students?", options: ["teacher", "doctor", "pilot", "chef"], answer: 0, explanation: "A teacher teaches students.", explanationHe: "מורה מלמד תלמידים." },
  { id: 1275, lang: "en", category: "vocab", text: "Who fixes sick people?", options: ["doctor", "teacher", "chef", "driver"], answer: 0, explanation: "A doctor helps sick people.", explanationHe: "רופא עוזר לחולים." },
  { id: 1276, lang: "en", category: "vocab", text: "Who cooks food in a restaurant?", options: ["chef", "teacher", "doctor", "pilot"], answer: 0, explanation: "A chef cooks in a restaurant.", explanationHe: "שף מבשל במסעדה." },
  { id: 1277, lang: "en", category: "vocab", text: "Who flies an airplane?", options: ["pilot", "driver", "sailor", "chef"], answer: 0, explanation: "A pilot flies airplanes.", explanationHe: "טייס מטיס מטוסים." },
  { id: 1278, lang: "en", category: "vocab", text: "Who puts out fires?", options: ["firefighter", "policeman", "teacher", "doctor"], answer: 0, explanation: "Firefighters put out fires.", explanationHe: "כבאים מכבים שריפות." },
  { id: 1279, lang: "en", category: "vocab", text: "Who drives a bus?", options: ["driver", "pilot", "sailor", "chef"], answer: 0, explanation: "A driver drives a bus.", explanationHe: "נהג נוהג באוטובוס." },
  { id: 1280, lang: "en", category: "vocab", text: "Who is your mother's mother?", options: ["grandmother", "aunt", "sister", "cousin"], answer: 0, explanation: "Your mother's mother is your grandmother.", explanationHe: "אמא של האמא שלך היא הסבתא שלך." },
  { id: 1281, lang: "en", category: "vocab", text: "Who is your father's father?", options: ["grandfather", "uncle", "brother", "cousin"], answer: 0, explanation: "Your father's father is your grandfather.", explanationHe: "אבא של האבא שלך הוא הסבא שלך." },
  { id: 1282, lang: "en", category: "vocab", text: "Who is your parent's sister?", options: ["aunt", "uncle", "cousin", "grandmother"], answer: 0, explanation: "Your parent's sister is your aunt.", explanationHe: "אחות של ההורה שלך היא הדודה שלך." },
  { id: 1283, lang: "en", category: "vocab", text: "Who is your parent's brother?", options: ["uncle", "aunt", "cousin", "grandfather"], answer: 0, explanation: "Your parent's brother is your uncle.", explanationHe: "אח של ההורה שלך הוא הדוד שלך." },
  
  // Colors & Shapes (1284-1298)
  { id: 1284, lang: "en", category: "vocab", text: "What color is the sky?", options: ["blue", "red", "green", "yellow"], answer: 0, explanation: "The sky is blue.", explanationHe: "השמיים כחולים." },
  { id: 1285, lang: "en", category: "vocab", text: "What color is grass?", options: ["green", "blue", "red", "yellow"], answer: 0, explanation: "Grass is green.", explanationHe: "דשא ירוק." },
  { id: 1286, lang: "en", category: "vocab", text: "What color is the sun?", options: ["yellow", "blue", "green", "purple"], answer: 0, explanation: "The sun is yellow.", explanationHe: "השמש צהובה." },
  { id: 1287, lang: "en", category: "vocab", text: "What color is snow?", options: ["white", "black", "blue", "red"], answer: 0, explanation: "Snow is white.", explanationHe: "שלג לבן." },
  { id: 1288, lang: "en", category: "vocab", text: "What color is a stop sign?", options: ["red", "green", "blue", "yellow"], answer: 0, explanation: "Stop signs are red.", explanationHe: "תמרורי עצור אדומים." },
  { id: 1289, lang: "en", category: "vocab", text: "What shape is a ball?", options: ["circle", "square", "triangle", "rectangle"], answer: 0, explanation: "A ball is round, like a circle.", explanationHe: "כדור עגול, כמו עיגול." },
  { id: 1290, lang: "en", category: "vocab", text: "What shape is a box?", options: ["square", "circle", "triangle", "oval"], answer: 0, explanation: "A box is square-shaped.", explanationHe: "קופסה היא בצורת ריבוע." },
  { id: 1291, lang: "en", category: "vocab", text: "What shape has three sides?", options: ["triangle", "square", "circle", "rectangle"], answer: 0, explanation: "A triangle has three sides.", explanationHe: "למשולש יש שלוש צלעות." },
  { id: 1292, lang: "en", category: "vocab", text: "What color is chocolate?", options: ["brown", "white", "green", "blue"], answer: 0, explanation: "Chocolate is brown.", explanationHe: "שוקולד חום." },
  { id: 1293, lang: "en", category: "vocab", text: "What color are clouds?", options: ["white", "blue", "green", "red"], answer: 0, explanation: "Clouds are usually white.", explanationHe: "עננים בדרך כלל לבנים." },
  { id: 1294, lang: "en", category: "vocab", text: "What color is an orange?", options: ["orange", "blue", "green", "purple"], answer: 0, explanation: "An orange is orange-colored.", explanationHe: "תפוז הוא בצבע כתום." },
  { id: 1295, lang: "en", category: "vocab", text: "What color is a banana?", options: ["yellow", "red", "blue", "green"], answer: 0, explanation: "Bananas are yellow.", explanationHe: "בננות צהובות." },
  { id: 1296, lang: "en", category: "vocab", text: "What color are strawberries?", options: ["red", "blue", "yellow", "green"], answer: 0, explanation: "Strawberries are red.", explanationHe: "תותים אדומים." },
  { id: 1297, lang: "en", category: "vocab", text: "What shape is a pizza?", options: ["circle", "square", "triangle", "rectangle"], answer: 0, explanation: "Pizza is usually round.", explanationHe: "פיצה בדרך כלל עגולה." },
  { id: 1298, lang: "en", category: "vocab", text: "What color is night?", options: ["black", "white", "yellow", "pink"], answer: 0, explanation: "Night is dark or black.", explanationHe: "לילה הוא כהה או שחור." },
  
  // School & Education (1299-1313)
  { id: 1299, lang: "en", category: "vocab", text: "Where do children learn?", options: ["school", "hospital", "restaurant", "store"], answer: 0, explanation: "Children learn at school.", explanationHe: "ילדים לומדים בבית ספר." },
  { id: 1300, lang: "en", category: "vocab", text: "What do you write in?", options: ["notebook", "phone", "cup", "shoe"], answer: 0, explanation: "We write in a notebook.", explanationHe: "אנחנו כותבים במחברת." },
  { id: 1301, lang: "en", category: "vocab", text: "What do you carry books in?", options: ["backpack", "cup", "hat", "shoe"], answer: 0, explanation: "We carry books in a backpack.", explanationHe: "אנחנו נושאים ספרים בתיק גב." },
  { id: 1302, lang: "en", category: "vocab", text: "What do you use to erase mistakes?", options: ["eraser", "pen", "ruler", "scissors"], answer: 0, explanation: "An eraser removes pencil marks.", explanationHe: "מחק מסיר סימני עיפרון." },
  { id: 1303, lang: "en", category: "vocab", text: "What do you use to draw straight lines?", options: ["ruler", "pen", "eraser", "scissors"], answer: 0, explanation: "A ruler helps draw straight lines.", explanationHe: "סרגל עוזר לצייר קווים ישרים." },
  { id: 1304, lang: "en", category: "vocab", text: "What rings at school?", options: ["bell", "phone", "door", "clock"], answer: 0, explanation: "A school bell rings between classes.", explanationHe: "פעמון בית ספר מצלצל בין שיעורים." },
  { id: 1305, lang: "en", category: "vocab", text: "What do you sit at in class?", options: ["desk", "bed", "floor", "sofa"], answer: 0, explanation: "Students sit at desks.", explanationHe: "תלמידים יושבים ליד שולחנות." },
  { id: 1306, lang: "en", category: "vocab", text: "What does a teacher write on?", options: ["board", "paper", "wall", "floor"], answer: 0, explanation: "Teachers write on a board.", explanationHe: "מורים כותבים על לוח." },
  { id: 1307, lang: "en", category: "vocab", text: "What do you use to color?", options: ["crayons", "spoon", "fork", "knife"], answer: 0, explanation: "Crayons are used for coloring.", explanationHe: "עפרונות צבע משמשים לצביעה." },
  { id: 1308, lang: "en", category: "vocab", text: "What do you get when you do well?", options: ["grade", "pencil", "eraser", "ruler"], answer: 0, explanation: "You get a grade for your work.", explanationHe: "אתה מקבל ציון על העבודה שלך." },
  { id: 1309, lang: "en", category: "vocab", text: "What do you do at recess?", options: ["play", "study", "sleep", "cook"], answer: 0, explanation: "Students play during recess.", explanationHe: "תלמידים משחקים בהפסקה." },
  { id: 1310, lang: "en", category: "vocab", text: "What do you bring from home?", options: ["lunch", "teacher", "desk", "board"], answer: 0, explanation: "Students bring lunch from home.", explanationHe: "תלמידים מביאים ארוחת צהריים מהבית." },
  { id: 1311, lang: "en", category: "vocab", text: "Where do you keep your school supplies?", options: ["locker", "refrigerator", "oven", "bed"], answer: 0, explanation: "School supplies go in a locker.", explanationHe: "ציוד בית ספר נשמר בארונית." },
  { id: 1312, lang: "en", category: "vocab", text: "What helps you find information?", options: ["book", "chair", "table", "window"], answer: 0, explanation: "Books contain information.", explanationHe: "ספרים מכילים מידע." },
  { id: 1313, lang: "en", category: "vocab", text: "What do you learn numbers in?", options: ["math", "art", "music", "gym"], answer: 0, explanation: "You learn numbers in math class.", explanationHe: "לומדים מספרים בשיעור מתמטיקה." },
  
  // Weather & Nature (1314-1328)
  { id: 1314, lang: "en", category: "vocab", text: "What falls from the sky when it's cold?", options: ["snow", "rain", "sun", "moon"], answer: 0, explanation: "Snow falls when it's very cold.", explanationHe: "שלג יורד כשקר מאוד." },
  { id: 1315, lang: "en", category: "vocab", text: "What falls from clouds?", options: ["rain", "snow", "stars", "birds"], answer: 0, explanation: "Rain falls from clouds.", explanationHe: "גשם יורד מעננים." },
  { id: 1316, lang: "en", category: "vocab", text: "What shines in the day?", options: ["sun", "moon", "stars", "clouds"], answer: 0, explanation: "The sun shines during the day.", explanationHe: "השמש זורחת ביום." },
  { id: 1317, lang: "en", category: "vocab", text: "What shines at night?", options: ["moon", "sun", "clouds", "rain"], answer: 0, explanation: "The moon shines at night.", explanationHe: "הירח זורח בלילה." },
  { id: 1318, lang: "en", category: "vocab", text: "What do you see after rain?", options: ["rainbow", "snow", "desert", "fire"], answer: 0, explanation: "You can see a rainbow after rain.", explanationHe: "אפשר לראות קשת בענן אחרי גשם." },
  { id: 1319, lang: "en", category: "vocab", text: "What makes noise during a storm?", options: ["thunder", "snow", "sun", "rainbow"], answer: 0, explanation: "Thunder makes noise during storms.", explanationHe: "רעם עושה רעש בסופות." },
  { id: 1320, lang: "en", category: "vocab", text: "What is very hot weather called?", options: ["summer", "winter", "autumn", "spring"], answer: 0, explanation: "Summer is the hot season.", explanationHe: "קיץ הוא העונה החמה." },
  { id: 1321, lang: "en", category: "vocab", text: "What is very cold weather called?", options: ["winter", "summer", "spring", "autumn"], answer: 0, explanation: "Winter is the cold season.", explanationHe: "חורף הוא העונה הקרה." },
  { id: 1322, lang: "en", category: "vocab", text: "What do flowers need to grow?", options: ["water", "snow", "ice", "fire"], answer: 0, explanation: "Flowers need water to grow.", explanationHe: "פרחים צריכים מים כדי לגדול." },
  { id: 1323, lang: "en", category: "vocab", text: "What is green and grows on trees?", options: ["leaves", "snow", "rain", "clouds"], answer: 0, explanation: "Leaves grow on trees.", explanationHe: "עלים גדלים על עצים." },
  { id: 1324, lang: "en", category: "vocab", text: "What do you use when it rains?", options: ["umbrella", "hat", "gloves", "scarf"], answer: 0, explanation: "An umbrella protects from rain.", explanationHe: "מטריה מגינה מגשם." },
  { id: 1325, lang: "en", category: "vocab", text: "What comes before night?", options: ["evening", "morning", "noon", "midnight"], answer: 0, explanation: "Evening comes before night.", explanationHe: "ערב מגיע לפני לילה." },
  { id: 1326, lang: "en", category: "vocab", text: "What is white and floats in the sky?", options: ["cloud", "snow", "moon", "star"], answer: 0, explanation: "Clouds are white and float.", explanationHe: "עננים לבנים וצפים." },
  { id: 1327, lang: "en", category: "vocab", text: "What do you see at night in the sky?", options: ["stars", "sun", "clouds", "rain"], answer: 0, explanation: "Stars shine at night.", explanationHe: "כוכבים זורחים בלילה." },
  { id: 1328, lang: "en", category: "vocab", text: "What season has colorful leaves?", options: ["autumn", "winter", "summer", "spring"], answer: 0, explanation: "Leaves change color in autumn.", explanationHe: "עלים משנים צבע בסתיו." },
  
  // Vehicles & Transportation (1329-1343)
  { id: 1329, lang: "en", category: "vocab", text: "What has four wheels and you drive?", options: ["car", "bicycle", "boat", "airplane"], answer: 0, explanation: "A car has four wheels.", explanationHe: "למכונית יש ארבעה גלגלים." },
  { id: 1330, lang: "en", category: "vocab", text: "What flies in the sky?", options: ["airplane", "car", "boat", "train"], answer: 0, explanation: "Airplanes fly in the sky.", explanationHe: "מטוסים עפים בשמיים." },
  { id: 1331, lang: "en", category: "vocab", text: "What has two wheels?", options: ["bicycle", "car", "bus", "train"], answer: 0, explanation: "A bicycle has two wheels.", explanationHe: "לאופניים יש שני גלגלים." },
  { id: 1332, lang: "en", category: "vocab", text: "What travels on tracks?", options: ["train", "car", "airplane", "boat"], answer: 0, explanation: "Trains travel on tracks.", explanationHe: "רכבות נוסעות על מסילות." },
  { id: 1333, lang: "en", category: "vocab", text: "What floats on water?", options: ["boat", "car", "airplane", "bicycle"], answer: 0, explanation: "Boats float on water.", explanationHe: "סירות צפות על מים." },
  { id: 1334, lang: "en", category: "vocab", text: "What carries many people to school?", options: ["bus", "bicycle", "motorcycle", "skateboard"], answer: 0, explanation: "A bus carries many students.", explanationHe: "אוטובוס נושא תלמידים רבים." },
  { id: 1335, lang: "en", category: "vocab", text: "What helps sick people get to hospital?", options: ["ambulance", "taxi", "bus", "train"], answer: 0, explanation: "An ambulance takes sick people to hospital.", explanationHe: "אמבולנס לוקח חולים לבית חולים." },
  { id: 1336, lang: "en", category: "vocab", text: "What do firefighters drive?", options: ["fire truck", "bus", "taxi", "train"], answer: 0, explanation: "Firefighters drive fire trucks.", explanationHe: "כבאים נוהגים בכבאית." },
  { id: 1337, lang: "en", category: "vocab", text: "What has pedals and you ride?", options: ["bicycle", "car", "train", "airplane"], answer: 0, explanation: "A bicycle has pedals.", explanationHe: "לאופניים יש דוושות." },
  { id: 1338, lang: "en", category: "vocab", text: "What takes you places for money?", options: ["taxi", "bicycle", "skateboard", "scooter"], answer: 0, explanation: "A taxi is a paid ride.", explanationHe: "מונית היא נסיעה בתשלום." },
  { id: 1339, lang: "en", category: "vocab", text: "What flies with a propeller?", options: ["helicopter", "car", "boat", "train"], answer: 0, explanation: "Helicopters have propellers.", explanationHe: "למסוקים יש מדחף." },
  { id: 1340, lang: "en", category: "vocab", text: "What is very big and carries cargo?", options: ["truck", "bicycle", "scooter", "skateboard"], answer: 0, explanation: "Trucks carry heavy cargo.", explanationHe: "משאיות נושאות מטען כבד." },
  { id: 1341, lang: "en", category: "vocab", text: "What goes to space?", options: ["rocket", "car", "bicycle", "boat"], answer: 0, explanation: "Rockets go to space.", explanationHe: "רקטות הולכות לחלל." },
  { id: 1342, lang: "en", category: "vocab", text: "What has sirens and lights?", options: ["police car", "taxi", "bus", "bicycle"], answer: 0, explanation: "Police cars have sirens.", explanationHe: "לניידות משטרה יש סירנות." },
  { id: 1343, lang: "en", category: "vocab", text: "What do you ride on snow?", options: ["sled", "bicycle", "car", "boat"], answer: 0, explanation: "Sleds are for riding on snow.", explanationHe: "מזחלות הן לרכיבה על שלג." },
  
  // Clothes & Accessories (1344-1363)
  { id: 1344, lang: "en", category: "vocab", text: "What do you wear on your body?", options: ["shirt", "hat", "shoes", "gloves"], answer: 0, explanation: "A shirt is worn on the body.", explanationHe: "חולצה נלבשת על הגוף." },
  { id: 1345, lang: "en", category: "vocab", text: "What do you wear on your legs?", options: ["pants", "shirt", "hat", "gloves"], answer: 0, explanation: "Pants are worn on legs.", explanationHe: "מכנסיים נלבשים על הרגליים." },
  { id: 1346, lang: "en", category: "vocab", text: "What do you wear when it's cold?", options: ["coat", "swimsuit", "shorts", "sandals"], answer: 0, explanation: "A coat keeps you warm.", explanationHe: "מעיל שומר על חום." },
  { id: 1347, lang: "en", category: "vocab", text: "What do you wear on your hands?", options: ["gloves", "shoes", "hat", "shirt"], answer: 0, explanation: "Gloves are for hands.", explanationHe: "כפפות הן לידיים." },
  { id: 1348, lang: "en", category: "vocab", text: "What do you wear around your neck?", options: ["scarf", "belt", "shoes", "gloves"], answer: 0, explanation: "A scarf goes around the neck.", explanationHe: "צעיף הולך סביב הצוואר." },
  { id: 1349, lang: "en", category: "vocab", text: "What holds up your pants?", options: ["belt", "scarf", "hat", "shoes"], answer: 0, explanation: "A belt holds up pants.", explanationHe: "חגורה מחזיקה מכנסיים." },
  { id: 1350, lang: "en", category: "vocab", text: "What do you wear to swim?", options: ["swimsuit", "coat", "jacket", "sweater"], answer: 0, explanation: "A swimsuit is for swimming.", explanationHe: "בגד ים הוא לשחייה." },
  { id: 1351, lang: "en", category: "vocab", text: "What do you wear to sleep?", options: ["pajamas", "suit", "uniform", "coat"], answer: 0, explanation: "Pajamas are for sleeping.", explanationHe: "פיג'מה היא לשינה." },
  { id: 1352, lang: "en", category: "vocab", text: "What do girls wear?", options: ["dress", "tie", "belt", "cap"], answer: 0, explanation: "Girls often wear dresses.", explanationHe: "בנות לובשות שמלות." },
  { id: 1353, lang: "en", category: "vocab", text: "What do you wear under shoes?", options: ["socks", "hat", "gloves", "scarf"], answer: 0, explanation: "Socks go under shoes.", explanationHe: "גרביים הולכים מתחת לנעליים." },
  { id: 1354, lang: "en", category: "vocab", text: "What keeps you warm?", options: ["sweater", "shorts", "sandals", "swimsuit"], answer: 0, explanation: "A sweater keeps you warm.", explanationHe: "סוודר שומר על חום." },
  { id: 1355, lang: "en", category: "vocab", text: "What do businessmen wear?", options: ["suit", "pajamas", "swimsuit", "shorts"], answer: 0, explanation: "Businessmen wear suits.", explanationHe: "אנשי עסקים לובשים חליפות." },
  { id: 1356, lang: "en", category: "vocab", text: "What do you wear in summer?", options: ["shorts", "coat", "sweater", "jacket"], answer: 0, explanation: "Shorts are for hot weather.", explanationHe: "מכנסיים קצרים למזג אוויר חם." },
  { id: 1357, lang: "en", category: "vocab", text: "What do you wear on rainy days?", options: ["raincoat", "swimsuit", "shorts", "t-shirt"], answer: 0, explanation: "A raincoat protects from rain.", explanationHe: "מעיל גשם מגן מגשם." },
  { id: 1358, lang: "en", category: "vocab", text: "What do you wear to formal events?", options: ["suit", "pajamas", "swimsuit", "shorts"], answer: 0, explanation: "A suit is formal clothing.", explanationHe: "חליפה היא לבוש רסמי." },
  { id: 1359, lang: "en", category: "vocab", text: "What covers your feet at home?", options: ["slippers", "boots", "sneakers", "sandals"], answer: 0, explanation: "Slippers are for indoor use.", explanationHe: "נעלי בית לשימוש פנימי." },
  { id: 1360, lang: "en", category: "vocab", text: "What do you wear on sunny days?", options: ["sunglasses", "gloves", "scarf", "coat"], answer: 0, explanation: "Sunglasses protect from sun.", explanationHe: "משקפי שמש מגינים מהשמש." },
  { id: 1361, lang: "en", category: "vocab", text: "What do you wear to work out?", options: ["sportswear", "suit", "pajamas", "coat"], answer: 0, explanation: "Sportswear is for exercise.", explanationHe: "ביגוד ספורט לאימונים." },
  { id: 1362, lang: "en", category: "vocab", text: "What keeps your head warm?", options: ["hat", "shoes", "gloves", "belt"], answer: 0, explanation: "A hat keeps your head warm.", explanationHe: "כובע שומר על הראש חם." },
  { id: 1363, lang: "en", category: "vocab", text: "What do you wear with a suit?", options: ["tie", "shorts", "swimsuit", "pajamas"], answer: 0, explanation: "A tie is worn with a suit.", explanationHe: "עניבה נלבשת עם חליפה." },
  
  // Music & Instruments (1364-1378)
  { id: 1364, lang: "en", category: "vocab", text: "What has black and white keys?", options: ["piano", "guitar", "drums", "flute"], answer: 0, explanation: "A piano has black and white keys.", explanationHe: "לפסנתר יש קלידים שחורים ולבנים." },
  { id: 1365, lang: "en", category: "vocab", text: "What has strings you pluck?", options: ["guitar", "piano", "drums", "trumpet"], answer: 0, explanation: "A guitar has strings.", explanationHe: "לגיטרה יש מיתרים." },
  { id: 1366, lang: "en", category: "vocab", text: "What do you hit with sticks?", options: ["drums", "piano", "guitar", "flute"], answer: 0, explanation: "Drums are hit with sticks.", explanationHe: "תופים מכים במקלות." },
  { id: 1367, lang: "en", category: "vocab", text: "What do you blow into?", options: ["flute", "guitar", "drums", "piano"], answer: 0, explanation: "You blow into a flute.", explanationHe: "נושפים לתוך חליל." },
  { id: 1368, lang: "en", category: "vocab", text: "What do singers use?", options: ["microphone", "guitar", "drums", "piano"], answer: 0, explanation: "Singers use microphones.", explanationHe: "זמרים משתמשים במיקרופונים." },
  { id: 1369, lang: "en", category: "vocab", text: "What makes loud crashing sounds?", options: ["cymbals", "flute", "guitar", "piano"], answer: 0, explanation: "Cymbals make crashing sounds.", explanationHe: "מצלתיים עושים רעשי התנגשות." },
  { id: 1370, lang: "en", category: "vocab", text: "What is brass and you blow?", options: ["trumpet", "guitar", "drums", "piano"], answer: 0, explanation: "A trumpet is a brass instrument.", explanationHe: "חצוצרה היא כלי נחושת." },
  { id: 1371, lang: "en", category: "vocab", text: "What has strings and a bow?", options: ["violin", "guitar", "drums", "flute"], answer: 0, explanation: "A violin uses a bow.", explanationHe: "כינור משתמש בקשת." },
  { id: 1372, lang: "en", category: "vocab", text: "What do you listen to music with?", options: ["headphones", "shoes", "gloves", "hat"], answer: 0, explanation: "Headphones are for listening.", explanationHe: "אזניות הן להאזנה." },
  { id: 1373, lang: "en", category: "vocab", text: "Who makes music?", options: ["musician", "doctor", "teacher", "chef"], answer: 0, explanation: "A musician makes music.", explanationHe: "מוזיקאי עושה מוזיקה." },
  { id: 1374, lang: "en", category: "vocab", text: "What do you play music on?", options: ["instrument", "chair", "table", "bed"], answer: 0, explanation: "Music is played on instruments.", explanationHe: "מוזיקה מנוגנת על כלי נגינה." },
  { id: 1375, lang: "en", category: "vocab", text: "What has many strings?", options: ["harp", "drum", "trumpet", "flute"], answer: 0, explanation: "A harp has many strings.", explanationHe: "לנבל יש מיתרים רבים." },
  { id: 1376, lang: "en", category: "vocab", text: "What instrument is very large?", options: ["organ", "harmonica", "flute", "triangle"], answer: 0, explanation: "An organ is a large instrument.", explanationHe: "אורגן הוא כלי גדול." },
  { id: 1377, lang: "en", category: "vocab", text: "What makes a 'ding' sound?", options: ["triangle", "drums", "guitar", "piano"], answer: 0, explanation: "A triangle makes a ding sound.", explanationHe: "משולש עושה צליל דינג." },
  { id: 1378, lang: "en", category: "vocab", text: "What do you use to record sound?", options: ["microphone", "speaker", "drum", "guitar"], answer: 0, explanation: "A microphone records sound.", explanationHe: "מיקרופון מקליט קול." },
  
  // Sports & Actions (1379-1398)
  { id: 1379, lang: "en", category: "vocab", text: "What do you kick?", options: ["ball", "book", "pen", "chair"], answer: 0, explanation: "You kick a ball.", explanationHe: "בועטים בכדור." },
  { id: 1380, lang: "en", category: "vocab", text: "What do you do with your legs?", options: ["run", "write", "read", "think"], answer: 0, explanation: "You run with your legs.", explanationHe: "רצים עם הרגליים." },
  { id: 1381, lang: "en", category: "vocab", text: "What do you do in water?", options: ["swim", "run", "fly", "drive"], answer: 0, explanation: "You swim in water.", explanationHe: "שוחים במים." },
  { id: 1382, lang: "en", category: "vocab", text: "What sport uses a basket?", options: ["basketball", "football", "tennis", "swimming"], answer: 0, explanation: "Basketball uses a basket.", explanationHe: "כדורסל משתמש בסל." },
  { id: 1383, lang: "en", category: "vocab", text: "What sport uses a racket?", options: ["tennis", "football", "basketball", "swimming"], answer: 0, explanation: "Tennis uses a racket.", explanationHe: "טניס משתמש במחבט." },
  { id: 1384, lang: "en", category: "vocab", text: "What do you do on a bicycle?", options: ["ride", "fly", "swim", "cook"], answer: 0, explanation: "You ride a bicycle.", explanationHe: "רוכבים על אופניים." },
  { id: 1385, lang: "en", category: "vocab", text: "What do you do when tired?", options: ["sleep", "run", "jump", "dance"], answer: 0, explanation: "You sleep when tired.", explanationHe: "ישנים כשעייפים." },
  { id: 1386, lang: "en", category: "vocab", text: "What do you do with food?", options: ["eat", "wear", "drive", "fly"], answer: 0, explanation: "You eat food.", explanationHe: "אוכלים אוכל." },
  { id: 1387, lang: "en", category: "vocab", text: "What do you do with water?", options: ["drink", "eat", "wear", "write"], answer: 0, explanation: "You drink water.", explanationHe: "שותים מים." },
  { id: 1388, lang: "en", category: "vocab", text: "What do you do with a book?", options: ["read", "eat", "drink", "wear"], answer: 0, explanation: "You read a book.", explanationHe: "קוראים ספר." },
  { id: 1389, lang: "en", category: "vocab", text: "What do you do with music?", options: ["listen", "eat", "wear", "drive"], answer: 0, explanation: "You listen to music.", explanationHe: "מאזינים למוזיקה." },
  { id: 1390, lang: "en", category: "vocab", text: "What do you do when happy?", options: ["smile", "cry", "sleep", "run"], answer: 0, explanation: "You smile when happy.", explanationHe: "מחייכים כשמאושרים." },
  { id: 1391, lang: "en", category: "vocab", text: "What do you do when sad?", options: ["cry", "laugh", "smile", "dance"], answer: 0, explanation: "You might cry when sad.", explanationHe: "בוכים כשעצובים." },
  { id: 1392, lang: "en", category: "vocab", text: "What do you do up stairs?", options: ["climb", "swim", "fly", "drive"], answer: 0, explanation: "You climb up stairs.", explanationHe: "מטפסים במדרגות." },
  { id: 1393, lang: "en", category: "vocab", text: "What do you do with a ball?", options: ["throw", "eat", "drink", "wear"], answer: 0, explanation: "You throw or catch a ball.", explanationHe: "זורקים או תופסים כדור." },
  { id: 1394, lang: "en", category: "vocab", text: "What sport is played on ice?", options: ["hockey", "basketball", "tennis", "football"], answer: 0, explanation: "Hockey is played on ice.", explanationHe: "הוקי משוחק על קרח." },
  { id: 1395, lang: "en", category: "vocab", text: "What do you do with your voice?", options: ["sing", "run", "jump", "swim"], answer: 0, explanation: "You sing with your voice.", explanationHe: "שרים עם הקול." },
  { id: 1396, lang: "en", category: "vocab", text: "What do you do to music?", options: ["dance", "eat", "sleep", "write"], answer: 0, explanation: "You dance to music.", explanationHe: "רוקדים למוזיקה." },
  { id: 1397, lang: "en", category: "vocab", text: "What do you use to hit a baseball?", options: ["bat", "racket", "stick", "club"], answer: 0, explanation: "You use a bat in baseball.", explanationHe: "משתמשים במחבט בבייסבול." },
  { id: 1398, lang: "en", category: "vocab", text: "Where do you play sports?", options: ["field", "kitchen", "bedroom", "bathroom"], answer: 0, explanation: "Sports are played on a field.", explanationHe: "ספורט משחקים במגרש." },
  
  // Body Parts & Health (1399-1413)
  { id: 1399, lang: "en", category: "vocab", text: "What do you see with?", options: ["eyes", "ears", "nose", "mouth"], answer: 0, explanation: "You see with your eyes.", explanationHe: "רואים עם העיניים." },
  { id: 1400, lang: "en", category: "vocab", text: "What do you hear with?", options: ["ears", "eyes", "nose", "mouth"], answer: 0, explanation: "You hear with your ears.", explanationHe: "שומעים עם האוזניים." },
  { id: 1401, lang: "en", category: "vocab", text: "What do you smell with?", options: ["nose", "eyes", "ears", "mouth"], answer: 0, explanation: "You smell with your nose.", explanationHe: "מריחים עם האף." },
  { id: 1402, lang: "en", category: "vocab", text: "What do you eat with?", options: ["mouth", "nose", "ears", "eyes"], answer: 0, explanation: "You eat with your mouth.", explanationHe: "אוכלים עם הפה." },
  { id: 1403, lang: "en", category: "vocab", text: "What do you walk with?", options: ["legs", "arms", "eyes", "ears"], answer: 0, explanation: "You walk with your legs.", explanationHe: "הולכים עם הרגליים." },
  { id: 1404, lang: "en", category: "vocab", text: "What do you hold things with?", options: ["hands", "feet", "head", "nose"], answer: 0, explanation: "You hold with your hands.", explanationHe: "אוחזים עם הידיים." },
  { id: 1405, lang: "en", category: "vocab", text: "What is on top of your body?", options: ["head", "feet", "hands", "legs"], answer: 0, explanation: "The head is on top.", explanationHe: "הראש נמצא למעלה." },
  { id: 1406, lang: "en", category: "vocab", text: "What connects your head to body?", options: ["neck", "leg", "arm", "finger"], answer: 0, explanation: "The neck connects head to body.", explanationHe: "הצוואר מחבר ראש לגוף." },
  { id: 1407, lang: "en", category: "vocab", text: "What do you chew with?", options: ["teeth", "lips", "tongue", "nose"], answer: 0, explanation: "You chew with your teeth.", explanationHe: "לועסים עם השיניים." },
  { id: 1408, lang: "en", category: "vocab", text: "What covers your head?", options: ["hair", "skin", "teeth", "nails"], answer: 0, explanation: "Hair covers your head.", explanationHe: "שיער מכסה את הראש." },
  { id: 1409, lang: "en", category: "vocab", text: "What do you point with?", options: ["finger", "toe", "elbow", "knee"], answer: 0, explanation: "You point with your finger.", explanationHe: "מצביעים עם האצבע." },
  { id: 1410, lang: "en", category: "vocab", text: "What pumps blood?", options: ["heart", "lungs", "stomach", "brain"], answer: 0, explanation: "The heart pumps blood.", explanationHe: "הלב שואב דם." },
  { id: 1411, lang: "en", category: "vocab", text: "What helps you think?", options: ["brain", "heart", "stomach", "lungs"], answer: 0, explanation: "The brain helps you think.", explanationHe: "המוח עוזר לחשוב." },
  { id: 1412, lang: "en", category: "vocab", text: "What helps you breathe?", options: ["lungs", "heart", "stomach", "brain"], answer: 0, explanation: "Lungs help you breathe.", explanationHe: "הריאות עוזרות לנשום." },
  { id: 1413, lang: "en", category: "vocab", text: "What digests food?", options: ["stomach", "heart", "brain", "lungs"], answer: 0, explanation: "The stomach digests food.", explanationHe: "הקיבה מעכלת אוכל." },
  
  // Home & Rooms (1414-1423)
  { id: 1414, lang: "en", category: "vocab", text: "Where do you sleep?", options: ["bedroom", "kitchen", "bathroom", "garage"], answer: 0, explanation: "You sleep in a bedroom.", explanationHe: "ישנים בחדר שינה." },
  { id: 1415, lang: "en", category: "vocab", text: "Where do you cook?", options: ["kitchen", "bedroom", "bathroom", "garage"], answer: 0, explanation: "You cook in a kitchen.", explanationHe: "מבשלים במטבח." },
  { id: 1416, lang: "en", category: "vocab", text: "Where do you take a shower?", options: ["bathroom", "kitchen", "bedroom", "living room"], answer: 0, explanation: "You shower in a bathroom.", explanationHe: "מתקלחים בחדר אמבטיה." },
  { id: 1417, lang: "en", category: "vocab", text: "Where do you watch TV?", options: ["living room", "bathroom", "garage", "closet"], answer: 0, explanation: "You watch TV in the living room.", explanationHe: "צופים בטלוויזיה בסלון." },
  { id: 1418, lang: "en", category: "vocab", text: "Where do you park a car?", options: ["garage", "bedroom", "kitchen", "bathroom"], answer: 0, explanation: "Cars are parked in a garage.", explanationHe: "מכוניות חונות במוסך." },
  { id: 1419, lang: "en", category: "vocab", text: "What is the entrance to a house?", options: ["door", "window", "wall", "roof"], answer: 0, explanation: "A door is the entrance.", explanationHe: "דלת היא הכניסה." },
  { id: 1420, lang: "en", category: "vocab", text: "What is on top of a house?", options: ["roof", "floor", "door", "window"], answer: 0, explanation: "A roof is on top.", explanationHe: "גג נמצא למעלה." },
  { id: 1421, lang: "en", category: "vocab", text: "What is under a house?", options: ["floor", "roof", "ceiling", "sky"], answer: 0, explanation: "The floor is at the bottom.", explanationHe: "הרצפה נמצאת למטה." },
  { id: 1422, lang: "en", category: "vocab", text: "What lets light in?", options: ["window", "wall", "floor", "door"], answer: 0, explanation: "Windows let light in.", explanationHe: "חלונות מכניסים אור." },
  { id: 1423, lang: "en", category: "vocab", text: "What separates rooms?", options: ["wall", "window", "door", "floor"], answer: 0, explanation: "Walls separate rooms.", explanationHe: "קירות מפרידים חדרים." },
  
  // Time & Days (1424-1438)
  { id: 1424, lang: "en", category: "vocab", text: "What day comes after Monday?", options: ["Tuesday", "Wednesday", "Sunday", "Saturday"], answer: 0, explanation: "Tuesday comes after Monday.", explanationHe: "יום שלישי מגיע אחרי יום שני." },
  { id: 1425, lang: "en", category: "vocab", text: "What day comes before Sunday?", options: ["Saturday", "Monday", "Friday", "Tuesday"], answer: 0, explanation: "Saturday comes before Sunday.", explanationHe: "יום שבת מגיע לפני יום ראשון." },
  { id: 1426, lang: "en", category: "vocab", text: "What is the first day of the week?", options: ["Sunday", "Monday", "Saturday", "Friday"], answer: 0, explanation: "Sunday is the first day.", explanationHe: "יום ראשון הוא היום הראשון." },
  { id: 1427, lang: "en", category: "vocab", text: "What is the last day of the week?", options: ["Saturday", "Sunday", "Monday", "Friday"], answer: 0, explanation: "Saturday is the last day.", explanationHe: "יום שבת הוא היום האחרון." },
  { id: 1428, lang: "en", category: "vocab", text: "What time is 12:00 in the day?", options: ["noon", "midnight", "morning", "evening"], answer: 0, explanation: "12:00 PM is noon.", explanationHe: "12:00 בצהריים זה צהריים." },
  { id: 1429, lang: "en", category: "vocab", text: "What time is 12:00 at night?", options: ["midnight", "noon", "morning", "evening"], answer: 0, explanation: "12:00 AM is midnight.", explanationHe: "12:00 בלילה זה חצות." },
  { id: 1430, lang: "en", category: "vocab", text: "What comes after today?", options: ["tomorrow", "yesterday", "now", "later"], answer: 0, explanation: "Tomorrow comes after today.", explanationHe: "מחר מגיע אחרי היום." },
  { id: 1431, lang: "en", category: "vocab", text: "What comes before today?", options: ["yesterday", "tomorrow", "now", "soon"], answer: 0, explanation: "Yesterday comes before today.", explanationHe: "אתמול מגיע לפני היום." },
  { id: 1432, lang: "en", category: "vocab", text: "How many days in a week?", options: ["seven", "five", "six", "eight"], answer: 0, explanation: "There are seven days in a week.", explanationHe: "יש שבעה ימים בשבוע." },
  { id: 1433, lang: "en", category: "vocab", text: "How many months in a year?", options: ["twelve", "ten", "eleven", "thirteen"], answer: 0, explanation: "There are twelve months.", explanationHe: "יש שנים עשר חודשים." },
  { id: 1434, lang: "en", category: "vocab", text: "What month comes first?", options: ["January", "December", "March", "June"], answer: 0, explanation: "January is the first month.", explanationHe: "ינואר הוא החודש הראשון." },
  { id: 1435, lang: "en", category: "vocab", text: "What month comes last?", options: ["December", "January", "June", "March"], answer: 0, explanation: "December is the last month.", explanationHe: "דצמבר הוא החודש האחרון." },
  { id: 1436, lang: "en", category: "vocab", text: "What season comes after winter?", options: ["spring", "summer", "autumn", "winter"], answer: 0, explanation: "Spring comes after winter.", explanationHe: "אביב מגיע אחרי חורף." },
  { id: 1437, lang: "en", category: "vocab", text: "What season comes after summer?", options: ["autumn", "winter", "spring", "summer"], answer: 0, explanation: "Autumn comes after summer.", explanationHe: "סתיו מגיע אחרי קיץ." },
  { id: 1438, lang: "en", category: "vocab", text: "How many seasons are there?", options: ["four", "three", "five", "six"], answer: 0, explanation: "There are four seasons.", explanationHe: "יש ארבע עונות." },
  
  // Numbers & Math (1439-1453)
  { id: 1439, lang: "en", category: "vocab", text: "What comes after ten?", options: ["eleven", "twelve", "nine", "ten"], answer: 0, explanation: "Eleven comes after ten.", explanationHe: "אחד עשרה מגיע אחרי עשרה." },
  { id: 1440, lang: "en", category: "vocab", text: "What is 5 + 5?", options: ["ten", "fifteen", "five", "twenty"], answer: 0, explanation: "Five plus five equals ten.", explanationHe: "חמש ועוד חמש שווה עשר." },
  { id: 1441, lang: "en", category: "vocab", text: "What is 10 - 5?", options: ["five", "ten", "fifteen", "zero"], answer: 0, explanation: "Ten minus five equals five.", explanationHe: "עשר פחות חמש שווה חמש." },
  { id: 1442, lang: "en", category: "vocab", text: "What is 2 x 3?", options: ["six", "five", "seven", "eight"], answer: 0, explanation: "Two times three equals six.", explanationHe: "שניים כפול שלוש שווה שש." },
  { id: 1443, lang: "en", category: "vocab", text: "What is 10 ÷ 2?", options: ["five", "two", "ten", "twenty"], answer: 0, explanation: "Ten divided by two equals five.", explanationHe: "עשר חלקי שניים שווה חמש." },
  { id: 1444, lang: "en", category: "vocab", text: "What number comes before twenty?", options: ["nineteen", "twenty-one", "eighteen", "seventeen"], answer: 0, explanation: "Nineteen comes before twenty.", explanationHe: "תשע עשרה מגיע לפני עשרים." },
  { id: 1445, lang: "en", category: "vocab", text: "What is half of ten?", options: ["five", "ten", "fifteen", "twenty"], answer: 0, explanation: "Half of ten is five.", explanationHe: "חצי מעשר זה חמש." },
  { id: 1446, lang: "en", category: "vocab", text: "What is double of five?", options: ["ten", "five", "fifteen", "twenty"], answer: 0, explanation: "Double of five is ten.", explanationHe: "כפול של חמש זה עשר." },
  { id: 1447, lang: "en", category: "vocab", text: "How many fingers on one hand?", options: ["five", "ten", "four", "six"], answer: 0, explanation: "One hand has five fingers.", explanationHe: "ליד אחת יש חמש אצבעות." },
  { id: 1448, lang: "en", category: "vocab", text: "How many toes on one foot?", options: ["five", "ten", "four", "six"], answer: 0, explanation: "One foot has five toes.", explanationHe: "לרגל אחת יש חמש אצבעות." },
  { id: 1449, lang: "en", category: "vocab", text: "What shape has four equal sides?", options: ["square", "triangle", "circle", "rectangle"], answer: 0, explanation: "A square has four equal sides.", explanationHe: "לריבוע יש ארבע צלעות שוות." },
  { id: 1450, lang: "en", category: "vocab", text: "What is 3 + 3?", options: ["six", "three", "nine", "twelve"], answer: 0, explanation: "Three plus three equals six.", explanationHe: "שלוש ועוד שלוש שווה שש." },
  { id: 1451, lang: "en", category: "vocab", text: "What is 20 - 10?", options: ["ten", "twenty", "thirty", "five"], answer: 0, explanation: "Twenty minus ten equals ten.", explanationHe: "עשרים פחות עשר שווה עשר." },
  { id: 1452, lang: "en", category: "vocab", text: "What comes after hundred?", options: ["hundred and one", "ninety-nine", "hundred", "two hundred"], answer: 0, explanation: "101 comes after 100.", explanationHe: "101 מגיע אחרי 100." },
  { id: 1453, lang: "en", category: "vocab", text: "How many sides does a triangle have?", options: ["three", "four", "five", "six"], answer: 0, explanation: "A triangle has three sides.", explanationHe: "למשולש יש שלוש צלעות." },
  
  // Places & Locations (1454-1468)
  { id: 1454, lang: "en", category: "vocab", text: "Where do you buy food?", options: ["supermarket", "hospital", "school", "park"], answer: 0, explanation: "You buy food at a supermarket.", explanationHe: "קונים אוכל בסופרמרקט." },
  { id: 1455, lang: "en", category: "vocab", text: "Where do sick people go?", options: ["hospital", "school", "restaurant", "park"], answer: 0, explanation: "Sick people go to a hospital.", explanationHe: "חולים הולכים לבית חולים." },
  { id: 1456, lang: "en", category: "vocab", text: "Where do you borrow books?", options: ["library", "restaurant", "hospital", "store"], answer: 0, explanation: "You borrow books from a library.", explanationHe: "שואלים ספרים מספרייה." },
  { id: 1457, lang: "en", category: "vocab", text: "Where do you eat out?", options: ["restaurant", "library", "hospital", "school"], answer: 0, explanation: "You eat at a restaurant.", explanationHe: "אוכלים במסעדה." },
  { id: 1458, lang: "en", category: "vocab", text: "Where do children play?", options: ["park", "hospital", "library", "office"], answer: 0, explanation: "Children play at a park.", explanationHe: "ילדים משחקים בפארק." },
  { id: 1459, lang: "en", category: "vocab", text: "Where do you watch movies?", options: ["cinema", "library", "hospital", "store"], answer: 0, explanation: "You watch movies at a cinema.", explanationHe: "צופים בסרטים בקולנוע." },
  { id: 1460, lang: "en", category: "vocab", text: "Where do you buy medicine?", options: ["pharmacy", "library", "restaurant", "park"], answer: 0, explanation: "You buy medicine at a pharmacy.", explanationHe: "קונים תרופות בבית מרקחת." },
  { id: 1461, lang: "en", category: "vocab", text: "Where do you get money?", options: ["bank", "park", "library", "restaurant"], answer: 0, explanation: "You get money from a bank.", explanationHe: "מקבלים כסף מבנק." },
  { id: 1462, lang: "en", category: "vocab", text: "Where do you mail letters?", options: ["post office", "library", "hospital", "school"], answer: 0, explanation: "You mail letters at a post office.", explanationHe: "שולחים מכתבים בדואר." },
  { id: 1463, lang: "en", category: "vocab", text: "Where do you see animals?", options: ["zoo", "library", "hospital", "bank"], answer: 0, explanation: "You see animals at a zoo.", explanationHe: "רואים חיות בגן חיות." },
  { id: 1464, lang: "en", category: "vocab", text: "Where do you swim?", options: ["pool", "library", "restaurant", "hospital"], answer: 0, explanation: "You swim in a pool.", explanationHe: "שוחים בבריכה." },
  { id: 1465, lang: "en", category: "vocab", text: "Where do you work?", options: ["office", "bedroom", "bathroom", "kitchen"], answer: 0, explanation: "Many people work in an office.", explanationHe: "אנשים רבים עובדים במשרד." },
  { id: 1466, lang: "en", category: "vocab", text: "Where do you buy clothes?", options: ["store", "hospital", "library", "park"], answer: 0, explanation: "You buy clothes at a store.", explanationHe: "קונים בגדים בחנות." },
  { id: 1467, lang: "en", category: "vocab", text: "Where do planes take off?", options: ["airport", "train station", "bus stop", "park"], answer: 0, explanation: "Planes take off from airports.", explanationHe: "מטוסים ממריאים משדות תעופה." },
  { id: 1468, lang: "en", category: "vocab", text: "Where do trains stop?", options: ["station", "airport", "park", "school"], answer: 0, explanation: "Trains stop at stations.", explanationHe: "רכבות עוצרות בתחנות." },
  
  // Emotions & Feelings (1469-1483)
  { id: 1469, lang: "en", category: "vocab", text: "How do you feel when you win?", options: ["happy", "sad", "angry", "scared"], answer: 0, explanation: "Winning makes you happy.", explanationHe: "ניצחון עושה אותך שמח." },
  { id: 1470, lang: "en", category: "vocab", text: "How do you feel when you lose?", options: ["sad", "happy", "excited", "proud"], answer: 0, explanation: "Losing can make you sad.", explanationHe: "הפסד יכול לעשות אותך עצוב." },
  { id: 1471, lang: "en", category: "vocab", text: "How do you feel when scared?", options: ["afraid", "happy", "excited", "proud"], answer: 0, explanation: "Scared means afraid.", explanationHe: "מפוחד זה אותו דבר כמו afraid." },
  { id: 1472, lang: "en", category: "vocab", text: "How do you feel when angry?", options: ["mad", "happy", "sad", "excited"], answer: 0, explanation: "Angry means mad.", explanationHe: "כועס זה אותו דבר כמו mad." },
  { id: 1473, lang: "en", category: "vocab", text: "How do you feel after sleeping?", options: ["rested", "tired", "hungry", "thirsty"], answer: 0, explanation: "Sleep makes you feel rested.", explanationHe: "שינה גורמת לך להרגיש נח." },
  { id: 1474, lang: "en", category: "vocab", text: "How do you feel without food?", options: ["hungry", "thirsty", "tired", "happy"], answer: 0, explanation: "No food makes you hungry.", explanationHe: "בלי אוכל אתה רעב." },
  { id: 1475, lang: "en", category: "vocab", text: "How do you feel without water?", options: ["thirsty", "hungry", "tired", "happy"], answer: 0, explanation: "No water makes you thirsty.", explanationHe: "בלי מים אתה צמא." },
  { id: 1476, lang: "en", category: "vocab", text: "How do you feel when sick?", options: ["unwell", "happy", "excited", "proud"], answer: 0, explanation: "Sick people feel unwell.", explanationHe: "אנשים חולים מרגישים לא טוב." },
  { id: 1477, lang: "en", category: "vocab", text: "How do you feel when surprised?", options: ["shocked", "bored", "tired", "hungry"], answer: 0, explanation: "Surprise makes you shocked.", explanationHe: "הפתעה גורמת לך להיות המום." },
  { id: 1478, lang: "en", category: "vocab", text: "How do you feel when bored?", options: ["uninterested", "excited", "happy", "proud"], answer: 0, explanation: "Bored means not interested.", explanationHe: "משועמם זה לא מעוניין." },
  { id: 1479, lang: "en", category: "vocab", text: "How do you feel when proud?", options: ["confident", "sad", "scared", "bored"], answer: 0, explanation: "Proud means confident.", explanationHe: "גאה זה בטוח בעצמך." },
  { id: 1480, lang: "en", category: "vocab", text: "How do you feel when worried?", options: ["nervous", "happy", "excited", "proud"], answer: 0, explanation: "Worried means nervous.", explanationHe: "דאוג זה עצבני." },
  { id: 1481, lang: "en", category: "vocab", text: "How do you feel when calm?", options: ["relaxed", "angry", "scared", "worried"], answer: 0, explanation: "Calm means relaxed.", explanationHe: "רגוע זה מרוגע." },
  { id: 1482, lang: "en", category: "vocab", text: "How do you feel when excited?", options: ["thrilled", "bored", "sad", "angry"], answer: 0, explanation: "Excited means thrilled.", explanationHe: "נרגש זה מתרגש מאוד." },
  { id: 1483, lang: "en", category: "vocab", text: "How do you feel when confused?", options: ["puzzled", "clear", "sure", "certain"], answer: 0, explanation: "Confused means puzzled.", explanationHe: "מבולבל זה תמוה." },
  
  // Opposites (1484-1498)
  { id: 1484, lang: "en", category: "vocab", text: "What is the opposite of 'up'?", options: ["down", "left", "right", "forward"], answer: 0, explanation: "The opposite of up is down.", explanationHe: "ההפך של למעלה הוא למטה." },
  { id: 1485, lang: "en", category: "vocab", text: "What is the opposite of 'left'?", options: ["right", "up", "down", "forward"], answer: 0, explanation: "The opposite of left is right.", explanationHe: "ההפך של שמאל הוא ימין." },
  { id: 1486, lang: "en", category: "vocab", text: "What is the opposite of 'in'?", options: ["out", "up", "down", "left"], answer: 0, explanation: "The opposite of in is out.", explanationHe: "ההפך של בפנים הוא בחוץ." },
  { id: 1487, lang: "en", category: "vocab", text: "What is the opposite of 'open'?", options: ["closed", "big", "small", "hot"], answer: 0, explanation: "The opposite of open is closed.", explanationHe: "ההפך של פתוח הוא סגור." },
  { id: 1488, lang: "en", category: "vocab", text: "What is the opposite of 'wet'?", options: ["dry", "hot", "cold", "warm"], answer: 0, explanation: "The opposite of wet is dry.", explanationHe: "ההפך של רטוב הוא יבש." },
  { id: 1489, lang: "en", category: "vocab", text: "What is the opposite of 'clean'?", options: ["dirty", "wet", "dry", "hot"], answer: 0, explanation: "The opposite of clean is dirty.", explanationHe: "ההפך של נקי הוא מלוכלך." },
  { id: 1490, lang: "en", category: "vocab", text: "What is the opposite of 'full'?", options: ["empty", "half", "whole", "complete"], answer: 0, explanation: "The opposite of full is empty.", explanationHe: "ההפך של מלא הוא ריק." },
  { id: 1491, lang: "en", category: "vocab", text: "What is the opposite of 'young'?", options: ["old", "new", "fresh", "modern"], answer: 0, explanation: "The opposite of young is old.", explanationHe: "ההפך של צעיר הוא זקן." },
  { id: 1492, lang: "en", category: "vocab", text: "What is the opposite of 'loud'?", options: ["quiet", "soft", "hard", "strong"], answer: 0, explanation: "The opposite of loud is quiet.", explanationHe: "ההפך של רועש הוא שקט." },
  { id: 1493, lang: "en", category: "vocab", text: "What is the opposite of 'soft'?", options: ["hard", "loud", "quiet", "weak"], answer: 0, explanation: "The opposite of soft is hard.", explanationHe: "ההפך של רך הוא קשה." },
  { id: 1494, lang: "en", category: "vocab", text: "What is the opposite of 'strong'?", options: ["weak", "soft", "hard", "loud"], answer: 0, explanation: "The opposite of strong is weak.", explanationHe: "ההפך של חזק הוא חלש." },
  { id: 1495, lang: "en", category: "vocab", text: "What is the opposite of 'light' (weight)?", options: ["heavy", "dark", "bright", "soft"], answer: 0, explanation: "The opposite of light is heavy.", explanationHe: "ההפך של קל הוא כבד." },
  { id: 1496, lang: "en", category: "vocab", text: "What is the opposite of 'near'?", options: ["far", "close", "here", "there"], answer: 0, explanation: "The opposite of near is far.", explanationHe: "ההפך של קרוב הוא רחוק." },
  { id: 1497, lang: "en", category: "vocab", text: "What is the opposite of 'early'?", options: ["late", "soon", "now", "then"], answer: 0, explanation: "The opposite of early is late.", explanationHe: "ההפך של מוקדם הוא מאוחר." },
  { id: 1498, lang: "en", category: "vocab", text: "What is the opposite of 'cheap'?", options: ["expensive", "free", "costly", "pricey"], answer: 0, explanation: "The opposite of cheap is expensive.", explanationHe: "ההפך של זול הוא יקר." },
  
  // Technology (1499-1508)
  { id: 1499, lang: "en", category: "vocab", text: "What do you type on?", options: ["keyboard", "mouse", "screen", "speaker"], answer: 0, explanation: "You type on a keyboard.", explanationHe: "מקלידים על מקלדת." },
  { id: 1500, lang: "en", category: "vocab", text: "What do you click with?", options: ["mouse", "keyboard", "screen", "speaker"], answer: 0, explanation: "You click with a mouse.", explanationHe: "לוחצים עם עכבר." },
  { id: 1501, lang: "en", category: "vocab", text: "What do you look at on a computer?", options: ["screen", "keyboard", "mouse", "speaker"], answer: 0, explanation: "You look at the screen.", explanationHe: "מסתכלים על המסך." },
  { id: 1502, lang: "en", category: "vocab", text: "What makes sound on a computer?", options: ["speaker", "keyboard", "mouse", "screen"], answer: 0, explanation: "Speakers make sound.", explanationHe: "רמקולים עושים קול." },
  { id: 1503, lang: "en", category: "vocab", text: "What connects to the internet?", options: ["computer", "chair", "table", "bed"], answer: 0, explanation: "Computers connect to the internet.", explanationHe: "מחשבים מתחברים לאינטרנט." },
  { id: 1504, lang: "en", category: "vocab", text: "What do you take pictures with?", options: ["camera", "keyboard", "mouse", "speaker"], answer: 0, explanation: "Cameras take pictures.", explanationHe: "מצלמות מצלמות תמונות." },
  { id: 1505, lang: "en", category: "vocab", text: "What stores information?", options: ["memory", "screen", "speaker", "keyboard"], answer: 0, explanation: "Memory stores information.", explanationHe: "זיכרון שומר מידע." },
  { id: 1506, lang: "en", category: "vocab", text: "What do you charge?", options: ["battery", "screen", "keyboard", "mouse"], answer: 0, explanation: "Batteries need charging.", explanationHe: "סוללות צריכות טעינה." },
  { id: 1507, lang: "en", category: "vocab", text: "What shows apps?", options: ["smartphone", "keyboard", "mouse", "speaker"], answer: 0, explanation: "Smartphones show apps.", explanationHe: "סמארטפונים מציגים אפליקציות." },
  { id: 1508, lang: "en", category: "vocab", text: "What plays games?", options: ["console", "keyboard", "mouse", "printer"], answer: 0, explanation: "Gaming consoles play games.", explanationHe: "קונסולות משחקים משחקות משחקים." },
  
  // Special Milestone Question #1509
  { id: 1509, lang: "en", category: "vocab", text: "What do you learn with these questions?", options: ["English", "Math", "Art", "Music"], answer: 0, explanation: "These questions help you learn English!", explanationHe: "השאלות האלה עוזרות לך ללמוד אנגלית!" }
];

const difficulties = [
  { key: "normal", label: "משחק רגיל", count: 20, timer: 240 },
  { key: "marathon", label: "מרתון", count: 50, timer: 240 },
];

const CATEGORIES = [
  { key: "all", label: "הכל", icon: "🌈" },
  { key: "grammar", label: "דקדוק", icon: "📚" },
  { key: "vocab", label: "אוצר מילים", icon: "📖" },
  { key: "reading", label: "קריאה", icon: "👀" },
  { key: "holidays", label: "חגים", icon: "🎉" },
  { key: "nature", label: "טבע", icon: "🌿" },
  { key: "technology", label: "טכנולוגיה", icon: "💻" },
  { key: "emotions", label: "רגשות", icon: "😊" },
  { key: "transport", label: "תחבורה", icon: "🚗" },
  { key: "animals", label: "בעלי חיים", icon: "🐾" },
  { key: "food", label: "אוכל", icon: "🍎" },
  { key: "school", label: "בית ספר", icon: "🏫" },
  { key: "family", label: "משפחה", icon: "👨‍👩‍👧‍👦" },
  { key: "health", label: "בריאות", icon: "⚕️" },
  { key: "sports", label: "ספורט", icon: "🏅" },
  { key: "colors", label: "צבעים", icon: "🎨" },
  { key: "mathematics", label: "מתמטיקה", icon: "🧮" },
  { key: "physics", label: "פיזיקה", icon: "⚛️" },
  { key: "chemistry", label: "כימיה", icon: "🧪" },
  { key: "biology", label: "ביולוגיה", icon: "🧬" },
  { key: "astronomy", label: "אסטרונומיה", icon: "🌌" },
  { key: "psychology", label: "פסיכולוגיה", icon: "🧠" },
  { key: "philosophy", label: "פילוסופיה", icon: "🤔" },
  { key: "economics", label: "כלכלה", icon: "💰" },
  { key: "politics", label: "פוליטיקה", icon: "🏛️" },
  { key: "religion", label: "דת", icon: "⛪" },
  { key: "mythology", label: "מיתולוגיה", icon: "🏺" },
  { key: "architecture", label: "ארכיטקטורה", icon: "🏗️" },
  { key: "fashion", label: "אופנה", icon: "👗" },
  { key: "cuisine", label: "מטבח", icon: "👨‍🍳" },
  { key: "dance", label: "ריקוד", icon: "💃" },
  { key: "games", label: "משחקים", icon: "🎲" },
  { key: "inventions", label: "המצאות", icon: "🔧" },
  { key: "discoveries", label: "תגליות", icon: "🔍" },
  { key: "exploration", label: "חקר", icon: "🗺️" },
  { key: "medicine", label: "רפואה", icon: "🩺" },
  { key: "linguistics", label: "בלשנות", icon: "🗣️" },
  { key: "climate", label: "אקלים", icon: "🌡️" },
  { key: "oceanography", label: "אוקיינוגרפיה", icon: "🌊" },
  { key: "botany", label: "בוטניקה", icon: "🌱" },
  { key: "space", label: "חלל", icon: "🚀" },
  { key: "science", label: "מדע", icon: "🔬" },
  { key: "history", label: "היסטוריה", icon: "📜" },
  { key: "art", label: "אמנות", icon: "🎨" },
  { key: "music", label: "מוזיקה", icon: "🎵" },
  { key: "literature", label: "ספרות", icon: "📚" },
  { key: "geography", label: "גיאוגרפיה", icon: "🌍" },
  { key: "environment", label: "סביבה", icon: "🌍" },
  { key: "weather", label: "מזג אוויר", icon: "⛅" },
  { key: "time", label: "זמן", icon: "⏰" },
  { key: "body", label: "גוף", icon: "👤" },
  { key: "jobs", label: "מקצועות", icon: "👨‍💼" },
  { key: "clothes", label: "בגדים", icon: "👕" },
  { key: "verbs", label: "פעלים", icon: "🏃" },
  { key: "adjectives", label: "תארים", icon: "✨" },
  { key: "numbers", label: "מספרים", icon: "🔢" },
  { key: "days", label: "ימים", icon: "📅" },
  { key: "countries", label: "מדינות", icon: "🏳️" },
  { key: "daily", label: "יומי", icon: "☀️" },
];

const getInitialTime = (difficulty: string): number => {
  switch (difficulty) {
    case 'normal': return 240;
    case 'marathon': return 240;
    default: return 240;
  }
};

function getMistakeStats(): { [key: number]: number } {
  try {
    return JSON.parse(localStorage.getItem('mixed-mistakes') || '{}');
  } catch {
    return {};
  }
}

function addMistake(id: number): void {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('mixed-mistakes', JSON.stringify(stats));
}

function pickQuestions(all: Question[], lang: 'en' | 'he', count: number, category: string): Question[] {
  let pool = all.filter(q => q.lang === lang);
  if (category && category !== "all") pool = pool.filter(q => q.category === category);
  const stats = getMistakeStats();
  
  // מערבב את כל השאלות כדי לקבל שאלות שונות בכל פעם
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  
  // לוקח רק כמה שאלות עם שגיאות (אם יש)
  const mistakeQuestions = shuffledPool.filter(q => stats[q.id] > 0);
  const boostedCount = Math.min(3, mistakeQuestions.length); // רק 3 שאלות עם שגיאות
  const boosted = mistakeQuestions.slice(0, boostedCount);

  // לוקח שאלות אקראיות מהשאר
  const remainingQuestions = shuffledPool.filter(q => !boosted.includes(q));
  const randomRest = remainingQuestions.slice(0, count - boosted.length);
  
  // מערבב הכל יחד ומערבב את האפשרויות
  return [...boosted, ...randomRest].sort(() => Math.random() - 0.5).map(q => {
    const options = [...q.options];
    const correctAnswer = options[q.answer];
    const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
    const newAnswer = shuffledOptions.indexOf(correctAnswer);
    return { ...q, options: shuffledOptions, answer: newAnswer };
  });
}

const RANKS = [
  { name: "מתחיל", icon: "🌱", required: 0 },
  { name: "תלמיד", icon: "📚", required: 1000 },
  { name: "מתקדם", icon: "⭐", required: 5000 },
  { name: "מומחה", icon: "🎓", required: 10000 },
  { name: "אלוף", icon: "👑", required: 20000 },
  { name: "אגדה", icon: "🏆", required: 50000 },
];

const ACHIEVEMENTS = [
  { id: 'first_win', name: 'ניצחון ראשון', icon: '🎉', description: 'סיים משחק בהצלחה', reward: 100 },
  { id: 'perfect_game', name: 'משחק מושלם', icon: '💯', description: '100% הצלחה במשחק שלם', reward: 500 },
  { id: 'marathon_master', name: 'אלוף המרתון', icon: '🏃', description: 'השג 10 תשובות נכונות ברצף במרתון', reward: 1000 },
  { id: 'category_expert', name: 'מומחה קטגוריה', icon: '📚', description: 'ענה נכון על 50 שאלות באותה קטגוריה', reward: 300 },
  { id: 'speed_demon', name: 'מהיר וזריז', icon: '⚡', description: 'ענה נכון תוך 3 שניות', reward: 200 },
  { id: 'collector', name: 'אספן', icon: '🎯', description: 'רכוש את כל הפריטים בחנות', reward: 1500 },
  { id: 'language_master', name: 'מאסטר שפות', icon: '🌍', description: 'ענה נכון על 100 שאלות באנגלית ו-100 בעברית', reward: 800 },
  { id: 'streak_legend', name: 'אגדת הרצף', icon: '🔥', description: 'השג 50 תשובות נכונות ברצף', reward: 2000 },
  { id: 'time_traveler', name: 'נוסע בזמן', icon: '⏰', description: 'סיים 10 משחקים תוך פחות מדקה', reward: 600 },
  { id: 'mistake_redeemer', name: 'גואל הטעויות', icon: '🔄', description: 'תרגל 100 שאלות שגויות', reward: 400 },
  { id: 'social_butterfly', name: 'פרפר חברתי', icon: '🦋', description: 'שתף 20 תוצאות עם חברים', reward: 300 },
  { id: 'theme_collector', name: 'אספן ערכות', icon: '🎨', description: 'רכוש את כל ערכות הנושא', reward: 1000 },
  { id: 'avatar_collector', name: 'אספן אווטרים', icon: '👤', description: 'רכוש את כל האווטרים', reward: 800 },
  { id: 'rank_climber', name: 'מטפס דרגות', icon: '📈', description: 'הגע לדרגת אלוף', reward: 1500 },
  { id: 'xp_hunter', name: 'ציד נקודות', icon: '⭐', description: 'השג 100,000 נקודות XP', reward: 2000 },
  { id: 'daily_champion', name: 'אלוף יומי', icon: '📅', description: 'השלם 30 אתגרים יומיים', reward: 1200 },
  { id: 'weekend_warrior', name: 'לוחם סוף שבוע', icon: '⚔️', description: 'שחק 50 משחקים בסוף השבוע', reward: 1000 },
  { id: 'early_riser', name: 'משכימי קום', icon: '🌅', description: 'שחק 20 משחקים לפני 8:00 בבוקר', reward: 500 },
  { id: 'night_owl', name: 'ינשוף לילה', icon: '🦉', description: 'שחק 20 משחקים אחרי 23:00', reward: 500 },
  { id: 'accuracy_god', name: 'אל הדיוק', icon: '🎯', description: 'השג 98% דיוק במשחק', reward: 1500 },
  { id: 'question_master', name: 'מאסטר השאלות', icon: '❓', description: 'ענה על 1000 שאלות', reward: 2500 },
  { id: 'coin_millionaire', name: 'מיליונר מטבעות', icon: '💰', description: 'השג מיליון מטבעות', reward: 3000 },
  { id: 'achievement_hunter', name: 'ציד הישגים', icon: '🏆', description: 'השג 25 הישגים', reward: 2000 },
  { id: 'friend_maker', name: 'יוצר חברים', icon: '👥', description: 'הוסף 10 חברים', reward: 400 },
  { id: 'profile_perfectionist', name: 'פרפקציוניסט פרופיל', icon: '✨', description: 'השלם את כל הפרופיל', reward: 600 },
  { id: 'quiz_legend', name: 'אגדת החידונים', icon: '👑', description: 'השג את כל ההישגים', reward: 5000 },
  { id: 'science_genius', name: 'גאון מדע', icon: '🔬', description: 'ענה נכון על 200 שאלות מדעיות', reward: 1000 },
  { id: 'math_wizard', name: 'קוסם מתמטיקה', icon: '🧮', description: 'ענה נכון על 150 שאלות מתמטיקה', reward: 800 },
  { id: 'history_buff', name: 'חובב היסטוריה', icon: '📜', description: 'ענה נכון על 100 שאלות היסטוריה', reward: 700 },
  { id: 'art_connoisseur', name: 'מומחה אמנות', icon: '🎨', description: 'ענה נכון על 80 שאלות אמנות', reward: 600 },
  { id: 'music_maestro', name: 'מאסטרו מוזיקה', icon: '🎵', description: 'ענה נכון על 80 שאלות מוזיקה', reward: 600 },
  { id: 'geography_explorer', name: 'חוקר גיאוגרפיה', icon: '🌍', description: 'ענה נכון על 120 שאלות גיאוגרפיה', reward: 800 },
  { id: 'literature_scholar', name: 'מלומד ספרות', icon: '📚', description: 'ענה נכון על 80 שאלות ספרות', reward: 600 },
  { id: 'sports_enthusiast', name: 'משוגע ספורט', icon: '⚽', description: 'ענה נכון על 100 שאלות ספורט', reward: 700 },
  { id: 'tech_savvy', name: 'חכם טכנולוגיה', icon: '💻', description: 'ענה נכון על 100 שאלות טכנולוגיה', reward: 700 },
  { id: 'nature_lover', name: 'אוהב טבע', icon: '🌿', description: 'ענה נכון על 120 שאלות טבע', reward: 800 },
  { id: 'philosophy_thinker', name: 'חושב פילוסופיה', icon: '🤔', description: 'ענה נכון על 60 שאלות פילוסופיה', reward: 500 },
  { id: 'psychology_student', name: 'סטודנט פסיכולוגיה', icon: '🧠', description: 'ענה נכון על 80 שאלות פסיכולוגיה', reward: 600 },
  { id: 'economics_analyst', name: 'אנליסט כלכלה', icon: '💰', description: 'ענה נכון על 60 שאלות כלכלה', reward: 500 },
  { id: 'politics_watcher', name: 'צופה פוליטיקה', icon: '🏛️', description: 'ענה נכון על 60 שאלות פוליטיקה', reward: 500 },
  { id: 'religion_scholar', name: 'מלומד דת', icon: '⛪', description: 'ענה נכון על 60 שאלות דת', reward: 500 },
  { id: 'mythology_expert', name: 'מומחה מיתולוגיה', icon: '🏺', description: 'ענה נכון על 60 שאלות מיתולוגיה', reward: 500 },
  { id: 'architecture_critic', name: 'מבקר ארכיטקטורה', icon: '🏗️', description: 'ענה נכון על 60 שאלות ארכיטקטורה', reward: 500 },
  { id: 'fashion_designer', name: 'מעצב אופנה', icon: '👗', description: 'ענה נכון על 60 שאלות אופנה', reward: 500 },
  { id: 'cuisine_chef', name: 'שף מטבח', icon: '👨‍🍳', description: 'ענה נכון על 80 שאלות מטבח', reward: 600 },
  { id: 'dance_instructor', name: 'מורה ריקוד', icon: '💃', description: 'ענה נכון על 60 שאלות ריקוד', reward: 500 },
  { id: 'games_master', name: 'מאסטר משחקים', icon: '🎲', description: 'ענה נכון על 80 שאלות משחקים', reward: 600 },
  { id: 'inventions_collector', name: 'אספן המצאות', icon: '🔧', description: 'ענה נכון על 80 שאלות המצאות', reward: 600 },
  { id: 'discoveries_hunter', name: 'ציד תגליות', icon: '🔍', description: 'ענה נכון על 80 שאלות תגליות', reward: 600 },
  { id: 'exploration_adventurer', name: 'מגלה הרפתקן', icon: '🗺️', description: 'ענה נכון על 80 שאלות חקר', reward: 600 },
  { id: 'medicine_doctor', name: 'רופא רפואה', icon: '🩺', description: 'ענה נכון על 80 שאלות רפואה', reward: 600 },
  { id: 'linguistics_professor', name: 'פרופסור בלשנות', icon: '🗣️', description: 'ענה נכון על 60 שאלות בלשנות', reward: 500 },
  { id: 'climate_scientist', name: 'מדען אקלים', icon: '🌡️', description: 'ענה נכון על 80 שאלות אקלים', reward: 600 },
  { id: 'oceanography_explorer', name: 'חוקר אוקיינוגרפיה', icon: '🌊', description: 'ענה נכון על 60 שאלות אוקיינוגרפיה', reward: 500 },
  { id: 'botany_gardener', name: 'גנן בוטניקה', icon: '🌱', description: 'ענה נכון על 80 שאלות בוטניקה', reward: 600 },
  { id: 'space_explorer', name: 'חוקר חלל', icon: '🚀', description: 'ענה נכון על 100 שאלות חלל', reward: 700 },
  { id: 'environment_guardian', name: 'שומר סביבה', icon: '🌍', description: 'ענה נכון על 100 שאלות סביבה', reward: 700 },
  { id: 'ultimate_scholar', name: 'מלומד עליון', icon: '🎓', description: 'ענה נכון על 500 שאלות מכל הקטגוריות', reward: 3000 },
  { id: 'knowledge_king', name: 'מלך הידע', icon: '👑', description: 'ענה נכון על 1000 שאלות מכל הקטגוריות', reward: 5000 },
  { id: 'wisdom_god', name: 'אל החכמה', icon: '⚡', description: 'ענה נכון על 2000 שאלות מכל הקטגוריות', reward: 10000 },
  
  // הישגים חדשים - משחקים
  { id: 'word_clash_champion', name: 'אלוף Word Clash', icon: '⚔️', description: 'ניצח 50 משחקי Word Clash', reward: 1200 },
  { id: 'matching_pairs_master', name: 'מאסטר זוגות', icon: '🧩', description: 'השלם 30 משחקי Matching Pairs', reward: 800 },
  { id: 'picture_duel_expert', name: 'מומחה תיאור תמונות', icon: '🖼️', description: 'השלם 25 משחקי Picture Description Duel', reward: 900 },
  { id: 'mixed_quiz_legend', name: 'אגדת Mixed Quiz', icon: '🎯', description: 'השלם 100 משחקי Mixed Quiz', reward: 1500 },
  
  // הישגים חדשים - זמן
  { id: 'morning_warrior', name: 'לוחם בוקר', icon: '🌅', description: 'שחק 50 משחקים בין 6:00-9:00', reward: 700 },
  { id: 'lunch_break_hero', name: 'גיבור הפסקת צהריים', icon: '🍽️', description: 'שחק 30 משחקים בין 12:00-14:00', reward: 500 },
  { id: 'evening_champion', name: 'אלוף ערב', icon: '🌆', description: 'שחק 50 משחקים בין 18:00-21:00', reward: 700 },
  { id: 'midnight_owl', name: 'ינשוף חצות', icon: '🦉', description: 'שחק 20 משחקים בין 00:00-03:00', reward: 600 },
  
  // הישגים חדשים - דיוק ומהירות
  { id: 'lightning_fast', name: 'ברק מהיר', icon: '⚡', description: 'ענה נכון תוך שנייה אחת', reward: 800 },
  { id: 'precision_master', name: 'מאסטר דיוק', icon: '🎯', description: 'השג 95% דיוק ב-10 משחקים רצופים', reward: 1200 },
  { id: 'speed_king', name: 'מלך המהירות', icon: '👑', description: 'סיים משחק תוך 30 שניות', reward: 1000 },
  { id: 'accuracy_goddess', name: 'אלת הדיוק', icon: '✨', description: 'השג 99% דיוק במשחק', reward: 2000 },
  
  // הישגים חדשים - רצפים
  { id: 'streak_machine', name: 'מכונת רצפים', icon: '🔥', description: 'השג 100 תשובות נכונות ברצף', reward: 3000 },
  { id: 'perfect_streak', name: 'רצף מושלם', icon: '💎', description: 'השג 25 תשובות נכונות ברצף ללא טעויות', reward: 1500 },
  { id: 'comeback_king', name: 'מלך הקאמבק', icon: '🔄', description: 'השג 10 תשובות נכונות ברצף אחרי 3 טעויות', reward: 800 },
  
  // הישגים חדשים - קטגוריות מיוחדות
  { id: 'bilingual_genius', name: 'גאון דו-לשוני', icon: '🌍', description: 'ענה נכון על 500 שאלות באנגלית ו-500 בעברית', reward: 2000 },
  { id: 'category_hoarder', name: 'אספן קטגוריות', icon: '📚', description: 'ענה נכון על 50 שאלות בכל קטגוריה', reward: 2500 },
  { id: 'difficulty_climber', name: 'מטפס קושי', icon: '📈', description: 'השלם משחק בכל רמת קושי', reward: 1000 },
  { id: 'extreme_challenger', name: 'מאתגר אקסטרים', icon: '💀', description: 'השלם 20 משחקים ברמת אקסטרים', reward: 1500 },
  
  // הישגים חדשים - חברות
  { id: 'social_networker', name: 'רשת חברתית', icon: '👥', description: 'הוסף 25 חברים', reward: 800 },
  { id: 'friend_challenger', name: 'מאתגר חברים', icon: '🏆', description: 'אתגר 10 חברים למשחק', reward: 600 },
  { id: 'leaderboard_king', name: 'מלך הלוח', icon: '👑', description: 'היה במקום הראשון בלוח התוצאות', reward: 1500 },
  
  // הישגים חדשים - מטבעות וחנות
  { id: 'big_spender', name: 'מבזבז גדול', icon: '💸', description: 'הוצא 10,000 מטבעות בחנות', reward: 1000 },
  { id: 'smart_shopper', name: 'קונה חכם', icon: '🛒', description: 'קנה 20 פריטים בחנות', reward: 800 },
  { id: 'coin_collector', name: 'אספן מטבעות', icon: '🪙', description: 'השג 500,000 מטבעות', reward: 2000 },
  { id: 'diamond_hunter', name: 'ציד יהלומים', icon: '💎', description: 'השג 1000 יהלומים', reward: 1500 },
  
  // הישגים חדשים - זמן משחק
  { id: 'marathon_runner', name: 'רץ מרתון', icon: '🏃‍♂️', description: 'שחק 5 שעות ברצף', reward: 2000 },
  { id: 'quick_player', name: 'שחקן מהיר', icon: '⚡', description: 'סיים 50 משחקים תוך שעה', reward: 1000 },
  { id: 'patient_gamer', name: 'גיימר סבלני', icon: '🧘', description: 'שחק 1000 דקות בסך הכל', reward: 1500 },
  
  // הישגים חדשים - מיוחדים
  { id: 'lucky_seven', name: 'שבע בר מזל', icon: '🍀', description: 'ענה נכון על 7 שאלות ברצף ב-7/7', reward: 777 },
  { id: 'midnight_magic', name: 'קסם חצות', icon: '🌙', description: 'השג הישג בדיוק בחצות', reward: 1000 },
  { id: 'weekend_warrior', name: 'לוחם סוף שבוע', icon: '⚔️', description: 'שחק 100 משחקים בסוף השבוע', reward: 1200 },
  { id: 'holiday_hero', name: 'גיבור חג', icon: '🎉', description: 'שחק ביום חג', reward: 500 },
  
  // הישגים חדשים - אתגרים יומיים
  { id: 'daily_grind', name: 'טחינה יומית', icon: '📅', description: 'השלם 100 אתגרים יומיים', reward: 3000 },
  { id: 'weekly_warrior', name: 'לוחם שבועי', icon: '📆', description: 'השלם 7 אתגרים יומיים ברצף', reward: 1500 },
  { id: 'monthly_master', name: 'מאסטר חודשי', icon: '📊', description: 'השלם 30 אתגרים יומיים בחודש', reward: 2500 },
  
  // הישגים חדשים - דרגות
  { id: 'rank_ascender', name: 'מטפס דרגות', icon: '📈', description: 'הגע לדרגת גיבור', reward: 1000 },
  { id: 'legend_creator', name: 'יוצר אגדות', icon: '🌟', description: 'הגע לדרגת אגדה', reward: 2000 },
  { id: 'myth_maker', name: 'יוצר מיתוסים', icon: '🏛️', description: 'הגע לדרגת מיתוס', reward: 3000 },
  
  // הישגים חדשים - מיוחדים לקטגוריות
  { id: 'animal_whisperer', name: 'לוחש לחיות', icon: '🐾', description: 'ענה נכון על 200 שאלות בעלי חיים', reward: 1000 },
  { id: 'color_artist', name: 'אמן צבעים', icon: '🎨', description: 'ענה נכון על 150 שאלות צבעים', reward: 800 },
  { id: 'food_critic', name: 'מבקר אוכל', icon: '🍽️', description: 'ענה נכון על 200 שאלות אוכל', reward: 1000 },
  { id: 'sports_analyst', name: 'אנליסט ספורט', icon: '⚽', description: 'ענה נכון על 200 שאלות ספורט', reward: 1000 },
  { id: 'weather_forecaster', name: 'מנבא מזג אוויר', icon: '🌤️', description: 'ענה נכון על 150 שאלות מזג אוויר', reward: 800 },
  { id: 'time_keeper', name: 'שומר זמן', icon: '⏰', description: 'ענה נכון על 150 שאלות זמן', reward: 800 },
  { id: 'family_tree', name: 'עץ משפחה', icon: '👨‍👩‍👧‍👦', description: 'ענה נכון על 150 שאלות משפחה', reward: 800 },
  { id: 'school_scholar', name: 'מלומד בית ספר', icon: '🏫', description: 'ענה נכון על 200 שאלות בית ספר', reward: 1000 },
  { id: 'transport_expert', name: 'מומחה תחבורה', icon: '🚗', description: 'ענה נכון על 150 שאלות תחבורה', reward: 800 },
  { id: 'nature_explorer', name: 'חוקר טבע', icon: '🌿', description: 'ענה נכון על 200 שאלות טבע', reward: 1000 },
  
  // הישגים חדשים - מיוחדים לזמנים
  { id: 'new_year_champion', name: 'אלוף השנה החדשה', icon: '🎊', description: 'שחק ב-1 בינואר', reward: 1000 },
  { id: 'valentine_lover', name: 'אוהב ולנטיין', icon: '💕', description: 'שחק ב-14 בפברואר', reward: 500 },
  { id: 'easter_bunny', name: 'ארנב פסח', icon: '🐰', description: 'שחק בפסח', reward: 500 },
  { id: 'independence_hero', name: 'גיבור עצמאות', icon: '🇮🇱', description: 'שחק ביום העצמאות', reward: 1000 },
  { id: 'summer_vacation', name: 'חופשת קיץ', icon: '☀️', description: 'שחק בחודשי הקיץ', reward: 800 },
  { id: 'winter_wonder', name: 'פלא חורף', icon: '❄️', description: 'שחק בחודשי החורף', reward: 800 },
  
  // הישגים חדשים - מיוחדים לסטטיסטיקות
  { id: 'statistics_master', name: 'מאסטר סטטיסטיקות', icon: '📊', description: 'השלם 1000 משחקים', reward: 5000 },
  { id: 'question_answerer', name: 'עונה שאלות', icon: '❓', description: 'ענה על 5000 שאלות', reward: 3000 },
  { id: 'mistake_learner', name: 'לומד מטעויות', icon: '📚', description: 'תרגל 1000 שאלות שגויות', reward: 2000 },
  { id: 'perfect_player', name: 'שחקן מושלם', icon: '💯', description: 'השג 50 משחקים מושלמים', reward: 2500 },
  
  // הישגים חדשים - מיוחדים לפרופיל
  { id: 'profile_completer', name: 'משלים פרופיל', icon: '✅', description: 'השלם את כל הפרופיל', reward: 1000 },
  { id: 'avatar_changer', name: 'מחליף אווטרים', icon: '👤', description: 'החלף אווטר 10 פעמים', reward: 500 },
  { id: 'theme_explorer', name: 'חוקר ערכות', icon: '🎨', description: 'השתמש בכל ערכות הנושא', reward: 800 },
  
  // הישגים חדשים - מיוחדים לזמן
  { id: 'early_bird', name: 'ציפור בוקר', icon: '🐦', description: 'שחק 5 ימים ברצף לפני 7:00', reward: 1000 },
  { id: 'night_shift', name: 'משמרת לילה', icon: '🌙', description: 'שחק 5 ימים ברצף אחרי 22:00', reward: 1000 },
  { id: 'weekend_regular', name: 'קבוע סוף שבוע', icon: '📅', description: 'שחק בכל סוף שבוע במשך חודש', reward: 1500 },
  
  // הישגים חדשים - מיוחדים לקטגוריות
  { id: 'grammar_guru', name: 'גורו דקדוק', icon: '📝', description: 'ענה נכון על 300 שאלות דקדוק', reward: 1200 },
  { id: 'vocabulary_vault', name: 'כספת אוצר מילים', icon: '📖', description: 'ענה נכון על 300 שאלות אוצר מילים', reward: 1200 },
  { id: 'reading_rockstar', name: 'כוכב קריאה', icon: '📚', description: 'ענה נכון על 300 שאלות קריאה', reward: 1200 },
  { id: 'listening_legend', name: 'אגדת האזנה', icon: '👂', description: 'ענה נכון על 300 שאלות האזנה', reward: 1200 },
  { id: 'speaking_star', name: 'כוכב דיבור', icon: '🗣️', description: 'ענה נכון על 300 שאלות דיבור', reward: 1200 },
  { id: 'writing_wizard', name: 'קוסם כתיבה', icon: '✍️', description: 'ענה נכון על 300 שאלות כתיבה', reward: 1200 },
  
  // הישגים חדשים - מיוחדים לזמנים
  { id: 'birthday_celebration', name: 'חגיגת יום הולדת', icon: '🎂', description: 'שחק ביום ההולדת שלך', reward: 2000 },
  { id: 'anniversary_ace', name: 'אס יום השנה', icon: '🎊', description: 'שחק ביום השנה של המשחק', reward: 1500 },
  { id: 'holiday_hoarder', name: 'אספן חגים', icon: '🎉', description: 'שחק ב-10 חגים שונים', reward: 2000 },
  
  // הישגים חדשים - מיוחדים לסטטיסטיקות
  { id: 'consistency_king', name: 'מלך העקביות', icon: '👑', description: 'שחק 30 ימים ברצף', reward: 3000 },
  { id: 'improvement_master', name: 'מאסטר שיפור', icon: '📈', description: 'שיפור הציון הממוצע ב-50%', reward: 1500 },
  { id: 'dedication_demon', name: 'שד מסירות', icon: '🔥', description: 'שחק 1000 שעות בסך הכל', reward: 5000 },
  
  // הישגים חדשים - מיוחדים לקטגוריות
  { id: 'all_rounder', name: 'כל-בוא', icon: '🌟', description: 'ענה נכון על 100 שאלות בכל קטגוריה', reward: 3000 },
  { id: 'specialist_supreme', name: 'מומחה עליון', icon: '🎯', description: 'ענה נכון על 500 שאלות בקטגוריה אחת', reward: 2000 },
  { id: 'jack_of_all_trades', name: 'איש של כל המקצועות', icon: '🃏', description: 'ענה נכון על 50 שאלות בכל קטגוריה', reward: 1500 },
  
  // הישגים חדשים - מיוחדים לזמנים
  { id: 'dawn_patrol', name: 'פטרול שחר', icon: '🌅', description: 'שחק 10 פעמים לפני 6:00', reward: 1000 },
  { id: 'dusk_warrior', name: 'לוחם דמדומים', icon: '🌆', description: 'שחק 10 פעמים אחרי 19:00', reward: 1000 },
  { id: 'midnight_madness', name: 'שיגעון חצות', icon: '🌙', description: 'שחק 10 פעמים אחרי 00:00', reward: 1000 },
  
  // הישגים חדשים - מיוחדים לסטטיסטיקות
  { id: 'number_cruncher', name: 'מעכל מספרים', icon: '🔢', description: 'ענה על 10,000 שאלות', reward: 5000 },
  { id: 'time_tracker', name: 'מעקב זמן', icon: '⏱️', description: 'שחק 10,000 דקות', reward: 3000 },
  { id: 'score_seeker', name: 'מחפש ציונים', icon: '🎯', description: 'השג 1,000,000 נקודות', reward: 5000 },
  
  // הישגים חדשים - מיוחדים לקטגוריות
  { id: 'category_crusher', name: 'מרסק קטגוריות', icon: '💥', description: 'ענה נכון על 1000 שאלות בקטגוריה אחת', reward: 3000 },
  { id: 'multi_category_master', name: 'מאסטר רב-קטגוריות', icon: '🎭', description: 'ענה נכון על 100 שאלות ב-10 קטגוריות', reward: 2500 },
  { id: 'category_king', name: 'מלך קטגוריות', icon: '👑', description: 'ענה נכון על 50 שאלות בכל קטגוריה', reward: 2000 },
  
  // הישגים חדשים - מיוחדים לזמנים
  { id: 'seasonal_player', name: 'שחקן עונתי', icon: '🍂', description: 'שחק בכל עונה של השנה', reward: 1500 },
  { id: 'monthly_regular', name: 'קבוע חודשי', icon: '📅', description: 'שחק בכל חודש של השנה', reward: 2000 },
  { id: 'yearly_champion', name: 'אלוף שנתי', icon: '🏆', description: 'שחק בכל יום של השנה', reward: 5000 },
  
  // הישגים חדשים - מיוחדים לסטטיסטיקות
  { id: 'perfectionist', name: 'פרפקציוניסט', icon: '✨', description: 'השג 100% דיוק ב-10 משחקים', reward: 3000 },
  { id: 'speed_demon', name: 'שד מהירות', icon: '⚡', description: 'סיים 100 משחקים תוך 30 שניות', reward: 2000 },
  { id: 'accuracy_angel', name: 'מלאך דיוק', icon: '👼', description: 'השג 95% דיוק ב-50 משחקים', reward: 2500 },
  
  // הישגים חדשים - מיוחדים לקטגוריות
  { id: 'knowledge_seeker', name: 'מחפש ידע', icon: '🔍', description: 'ענה על 20,000 שאלות', reward: 10000 },
  { id: 'wisdom_warrior', name: 'לוחם חוכמה', icon: '🧙', description: 'ענה נכון על 15,000 שאלות', reward: 8000 },
  { id: 'genius_gamer', name: 'גיימר גאון', icon: '🧠', description: 'ענה נכון על 10,000 שאלות', reward: 5000 },
  
  // הישגים חדשים - מיוחדים לזמנים
  { id: 'eternal_player', name: 'שחקן נצחי', icon: '♾️', description: 'שחק 365 ימים ברצף', reward: 10000 },
  { id: 'time_lord', name: 'אדון הזמן', icon: '⏰', description: 'שחק בכל שעה של היום', reward: 5000 },
  { id: 'calendar_king', name: 'מלך לוח השנה', icon: '📅', description: 'שחק בכל יום של השנה', reward: 8000 },
  
  // הישגים חדשים - מיוחדים לסטטיסטיקות
  { id: 'statistics_sultan', name: 'סולטן סטטיסטיקות', icon: '📊', description: 'השג 10,000,000 נקודות', reward: 10000 },
  { id: 'numbers_ninja', name: 'נינג\'ה מספרים', icon: '🥷', description: 'ענה על 50,000 שאלות', reward: 15000 },
  { id: 'data_destroyer', name: 'משמיד נתונים', icon: '💥', description: 'ענה נכון על 25,000 שאלות', reward: 10000 },
  
  // הישגים חדשים - מיוחדים לקטגוריות
  { id: 'category_conqueror', name: 'כובש קטגוריות', icon: '🏰', description: 'ענה נכון על 1000 שאלות בכל קטגוריה', reward: 20000 },
  { id: 'knowledge_emperor', name: 'קיסר ידע', icon: '👑', description: 'ענה נכון על 50,000 שאלות', reward: 25000 },
  { id: 'quiz_god', name: 'אל החידונים', icon: '⚡', description: 'השג את כל ההישגים', reward: 50000 },
];

const SHOP_ITEMS = [
  { id: 'hint_package', name: 'חבילת רמזים', icon: '💡', price: 300, description: '5 רמזים למשחקים קשים', effect: 'hints', count: 5 },
  { id: 'special_tag', name: 'תג מיוחד', icon: '🏆', price: 150, description: 'תג ייחודי שיופיע בפרופיל שלך', effect: 'tag', permanent: true },
  { id: 'theme_pack', name: 'ערכת נושא', icon: '🎨', price: 200, description: 'ערכת נושא מיוחדת לאפליקציה', effect: 'theme', permanent: true },
  { id: 'special_avatar', name: 'אוואטר מיוחד', icon: '👤', price: 100, description: 'אוואטר ייחודי לפרופיל שלך', effect: 'avatar', permanent: true },
  { id: 'extra_time', name: 'תוספת זמן', icon: '⏰', price: 50, description: 'מוסיף 30 שניות לזמן המשחק', effect: 'time' },
  { id: 'fifty_fifty', name: 'חמישים-חמישים', icon: '✂️', price: 100, description: 'מסיר שתי תשובות שגויות', effect: 'remove_options' },
  { id: 'double_points', name: 'נקודות כפולות', icon: '✨', price: 150, description: 'מכפיל את הנקודות לשאלה הבאה', effect: 'points' },
  { id: 'save_streak', name: 'הגנה מטעות', icon: '🛡️', price: 200, description: 'מגן מפני טעות אחת במרתון', effect: 'shield' },
  { id: 'category_boost', name: 'מומחה קטגוריה', icon: '📚', price: 300, description: 'נקודות כפולות בקטגוריה שנבחרה', effect: 'category' },
  { id: 'vip_pass', name: 'מנוי VIP', icon: '👑', price: 2000, description: 'הנחות בחנות ובונוסים מיוחדים', effect: 'vip', permanent: true },
  { id: 'mega_hint', name: 'רמז מגה', icon: '🔍', price: 500, description: 'רמז שמציג את התשובה הנכונה', effect: 'mega_hint', count: 2 },
  { id: 'perfect_score', name: 'ניקוד מושלם', icon: '💯', price: 600, description: 'השג 100% ניקוד במשחק אחד', effect: 'perfect', count: 1 },
  { id: 'time_freeze', name: 'קפיאת זמן', icon: '❄️', price: 600, description: 'עצור את הזמן למשך 30 שניות', effect: 'freeze', count: 1 },
  { id: 'double_xp', name: 'XP כפול', icon: '⚡', price: 400, description: 'כפול את ה-XP למשחק אחד', effect: 'double_xp', count: 1 },
  { id: 'category_unlock', name: 'פתח קטגוריה', icon: '🔓', price: 800, description: 'פתח קטגוריה חדשה למשחק', effect: 'unlock', permanent: true },
  { id: 'streak_protection', name: 'הגנת רצף', icon: '🛡️', price: 350, description: 'הגן על הרצף שלך מטעות אחת', effect: 'streak_protect', count: 1 },
  { id: 'bonus_question', name: 'שאלה בונוס', icon: '🎁', price: 200, description: 'שאלה נוספת למשחק', effect: 'bonus', count: 1 },
  { id: 'speed_boost', name: 'בוסט מהירות', icon: '🏃', price: 300, description: 'ענה מהר יותר וקבל בונוס', effect: 'speed', count: 1 },
  { id: 'accuracy_boost', name: 'בוסט דיוק', icon: '🎯', price: 400, description: 'השג דיוק גבוה יותר', effect: 'accuracy', count: 1 },
  { id: 'lucky_charm', name: 'קמע מזל', icon: '🍀', price: 150, description: 'מזל טוב למשחק', effect: 'luck', count: 1 },
  { id: 'knowledge_potion', name: 'שיקוי ידע', icon: '🧪', price: 700, description: 'השג ידע נוסף בקטגוריה מסוימת', effect: 'knowledge', count: 1 },
  { id: 'wisdom_crystal', name: 'קריסטל חכמה', icon: '💎', price: 1000, description: 'השג חכמה נוספת למשחק', effect: 'wisdom', count: 1 },
  { id: 'master_key', name: 'מפתח מאסטר', icon: '🗝️', price: 1200, description: 'פתח את כל הקטגוריות', effect: 'master_unlock', permanent: true },
  { id: 'legendary_boost', name: 'בוסט אגדי', icon: '🌟', price: 1500, description: 'בוסט מיוחד לכל המשחק', effect: 'legendary', count: 1 },
];

const DAILY_CHALLENGES = [
  { id: 'speed_master', name: 'אלוף המהירות', icon: '⚡', description: 'ענה על 5 שאלות תוך 30 שניות', reward: 200, xp: 500 },
  { id: 'category_master', name: 'מומחה היום', icon: '📚', description: 'ענה נכון על 10 שאלות מאותה קטגוריה', reward: 300, xp: 700 },
  { id: 'perfect_streak', name: 'רצף מושלם', icon: '🎯', description: 'השג 15 תשובות נכונות ברצף', reward: 500, xp: 1000 },
  { id: 'marathon_hero', name: 'גיבור המרתון', icon: '🏃', description: 'שרוד 20 שאלות במצב מרתון', reward: 1000, xp: 2000 },
  { id: 'early_bird', name: 'ציפור מוקדמת', icon: '🐦', description: 'שחק משחק לפני 9:00 בבוקר', reward: 150, xp: 300 },
  { id: 'night_owl', name: 'ינשוף לילה', icon: '🦉', description: 'שחק משחק אחרי 22:00 בלילה', reward: 200, xp: 400 },
  { id: 'weekend_warrior', name: 'לוחם סוף שבוע', icon: '⚔️', description: 'שחק 3 משחקים בסוף השבוע', reward: 400, xp: 800 },
  { id: 'language_switcher', name: 'מחליף שפות', icon: '🔄', description: 'שחק משחק באנגלית ובעברית באותו יום', reward: 250, xp: 500 },
  { id: 'difficulty_climber', name: 'מטפס קושי', icon: '🧗', description: 'שחק בכל רמות הקושי באותו יום', reward: 600, xp: 1200 },
  { id: 'social_butterfly', name: 'פרפר חברתי', icon: '🦋', description: 'שתף תוצאה עם חברים', reward: 100, xp: 200 },
  { id: 'streak_keeper', name: 'שומר רצף', icon: '🔥', description: 'שחק 7 ימים ברצף', reward: 800, xp: 1600 },
  { id: 'quiz_addict', name: 'מכור לחידונים', icon: '🎮', description: 'שחק 10 משחקים באותו יום', reward: 1000, xp: 2000 },
  { id: 'mistake_learner', name: 'לומד מטעויות', icon: '📖', description: 'תרגל 5 שאלות שגויות', reward: 300, xp: 600 },
  { id: 'time_master', name: 'אדון הזמן', icon: '⏱️', description: 'סיים משחק תוך 2 דקות', reward: 350, xp: 700 },
  { id: 'accuracy_king', name: 'מלך הדיוק', icon: '🎯', description: 'השג 95% דיוק במשחק', reward: 500, xp: 1000 },
  { id: 'science_explorer', name: 'חוקר מדע', icon: '🔬', description: 'ענה נכון על 15 שאלות מדעיות', reward: 400, xp: 800 },
  { id: 'history_buff', name: 'חובב היסטוריה', icon: '📜', description: 'ענה נכון על 12 שאלות היסטוריה', reward: 350, xp: 700 },
  { id: 'math_wizard', name: 'קוסם מתמטיקה', icon: '🧮', description: 'ענה נכון על 10 שאלות מתמטיקה', reward: 300, xp: 600 },
  { id: 'art_connoisseur', name: 'מומחה אמנות', icon: '🎨', description: 'ענה נכון על 8 שאלות אמנות', reward: 250, xp: 500 },
  { id: 'music_maestro', name: 'מאסטרו מוזיקה', icon: '🎵', description: 'ענה נכון על 8 שאלות מוזיקה', reward: 250, xp: 500 },
  { id: 'geography_expert', name: 'מומחה גיאוגרפיה', icon: '🌍', description: 'ענה נכון על 12 שאלות גיאוגרפיה', reward: 350, xp: 700 },
  { id: 'literature_lover', name: 'אוהב ספרות', icon: '📚', description: 'ענה נכון על 8 שאלות ספרות', reward: 250, xp: 500 },
  { id: 'sports_fanatic', name: 'משוגע ספורט', icon: '⚽', description: 'ענה נכון על 10 שאלות ספורט', reward: 300, xp: 600 },
  { id: 'tech_savvy', name: 'חכם טכנולוגיה', icon: '💻', description: 'ענה נכון על 10 שאלות טכנולוגיה', reward: 300, xp: 600 },
  { id: 'nature_lover', name: 'אוהב טבע', icon: '🌿', description: 'ענה נכון על 12 שאלות טבע', reward: 350, xp: 700 },
  { id: 'philosophy_thinker', name: 'חושב פילוסופיה', icon: '🤔', description: 'ענה נכון על 6 שאלות פילוסופיה', reward: 200, xp: 400 },
  { id: 'psychology_student', name: 'סטודנט פסיכולוגיה', icon: '🧠', description: 'ענה נכון על 8 שאלות פסיכולוגיה', reward: 250, xp: 500 },
  { id: 'economics_analyst', name: 'אנליסט כלכלה', icon: '💰', description: 'ענה נכון על 6 שאלות כלכלה', reward: 200, xp: 400 },
  { id: 'politics_watcher', name: 'צופה פוליטיקה', icon: '🏛️', description: 'ענה נכון על 6 שאלות פוליטיקה', reward: 200, xp: 400 },
  { id: 'religion_scholar', name: 'מלומד דת', icon: '⛪', description: 'ענה נכון על 6 שאלות דת', reward: 200, xp: 400 },
  { id: 'mythology_expert', name: 'מומחה מיתולוגיה', icon: '🏺', description: 'ענה נכון על 6 שאלות מיתולוגיה', reward: 200, xp: 400 },
  { id: 'architecture_critic', name: 'מבקר ארכיטקטורה', icon: '🏗️', description: 'ענה נכון על 6 שאלות ארכיטקטורה', reward: 200, xp: 400 },
  { id: 'fashion_designer', name: 'מעצב אופנה', icon: '👗', description: 'ענה נכון על 6 שאלות אופנה', reward: 200, xp: 400 },
  { id: 'cuisine_chef', name: 'שף מטבח', icon: '👨‍🍳', description: 'ענה נכון על 8 שאלות מטבח', reward: 250, xp: 500 },
  { id: 'dance_instructor', name: 'מורה ריקוד', icon: '💃', description: 'ענה נכון על 6 שאלות ריקוד', reward: 200, xp: 400 },
  { id: 'games_master', name: 'מאסטר משחקים', icon: '🎲', description: 'ענה נכון על 8 שאלות משחקים', reward: 250, xp: 500 },
  { id: 'inventions_collector', name: 'אספן המצאות', icon: '🔧', description: 'ענה נכון על 8 שאלות המצאות', reward: 250, xp: 500 },
  { id: 'discoveries_hunter', name: 'ציד תגליות', icon: '🔍', description: 'ענה נכון על 8 שאלות תגליות', reward: 250, xp: 500 },
  { id: 'exploration_adventurer', name: 'מגלה הרפתקן', icon: '🗺️', description: 'ענה נכון על 8 שאלות חקר', reward: 250, xp: 500 },
  { id: 'medicine_doctor', name: 'רופא רפואה', icon: '🩺', description: 'ענה נכון על 8 שאלות רפואה', reward: 250, xp: 500 },
  { id: 'linguistics_professor', name: 'פרופסור בלשנות', icon: '🗣️', description: 'ענה נכון על 6 שאלות בלשנות', reward: 200, xp: 400 },
  { id: 'climate_scientist', name: 'מדען אקלים', icon: '🌡️', description: 'ענה נכון על 8 שאלות אקלים', reward: 250, xp: 500 },
  { id: 'oceanography_explorer', name: 'חוקר אוקיינוגרפיה', icon: '🌊', description: 'ענה נכון על 6 שאלות אוקיינוגרפיה', reward: 200, xp: 400 },
  { id: 'botany_gardener', name: 'גנן בוטניקה', icon: '🌱', description: 'ענה נכון על 8 שאלות בוטניקה', reward: 250, xp: 500 },
  { id: 'advanced_math', name: 'מתמטיקה מתקדמת', icon: '🧮', description: 'ענה נכון על 20 שאלות מתמטיקה מתקדמת', reward: 400, xp: 800 },
  { id: 'physics_master', name: 'מאסטר פיזיקה', icon: '⚛️', description: 'ענה נכון על 15 שאלות פיזיקה', reward: 350, xp: 700 },
  { id: 'chemistry_expert', name: 'מומחה כימיה', icon: '🧪', description: 'ענה נכון על 15 שאלות כימיה', reward: 350, xp: 700 },
  { id: 'biology_scientist', name: 'מדען ביולוגיה', icon: '🧬', description: 'ענה נכון על 15 שאלות ביולוגיה', reward: 350, xp: 700 },
  { id: 'astronomy_stargazer', name: 'צופה כוכבים', icon: '🌌', description: 'ענה נכון על 12 שאלות אסטרונומיה', reward: 300, xp: 600 },
  { id: 'psychology_analyst', name: 'אנליסט פסיכולוגיה', icon: '🧠', description: 'ענה נכון על 12 שאלות פסיכולוגיה', reward: 300, xp: 600 },
  { id: 'philosophy_thinker', name: 'חושב פילוסופיה', icon: '🤔', description: 'ענה נכון על 10 שאלות פילוסופיה', reward: 250, xp: 500 },
  { id: 'economics_guru', name: 'גורו כלכלה', icon: '💰', description: 'ענה נכון על 10 שאלות כלכלה', reward: 250, xp: 500 },
  { id: 'politics_observer', name: 'צופה פוליטיקה', icon: '🏛️', description: 'ענה נכון על 10 שאלות פוליטיקה', reward: 250, xp: 500 },
  { id: 'religion_scholar', name: 'מלומד דת', icon: '⛪', description: 'ענה נכון על 10 שאלות דת', reward: 250, xp: 500 },
  { id: 'mythology_expert', name: 'מומחה מיתולוגיה', icon: '🏺', description: 'ענה נכון על 10 שאלות מיתולוגיה', reward: 250, xp: 500 },
  { id: 'architecture_critic', name: 'מבקר ארכיטקטורה', icon: '🏗️', description: 'ענה נכון על 10 שאלות ארכיטקטורה', reward: 250, xp: 500 },
  { id: 'fashion_designer', name: 'מעצב אופנה', icon: '👗', description: 'ענה נכון על 10 שאלות אופנה', reward: 250, xp: 500 },
  { id: 'cuisine_chef', name: 'שף מטבח', icon: '👨‍🍳', description: 'ענה נכון על 12 שאלות מטבח', reward: 300, xp: 600 },
  { id: 'dance_instructor', name: 'מורה ריקוד', icon: '💃', description: 'ענה נכון על 10 שאלות ריקוד', reward: 250, xp: 500 },
  { id: 'games_master', name: 'מאסטר משחקים', icon: '🎲', description: 'ענה נכון על 12 שאלות משחקים', reward: 300, xp: 600 },
  { id: 'inventions_collector', name: 'אספן המצאות', icon: '🔧', description: 'ענה נכון על 12 שאלות המצאות', reward: 300, xp: 600 },
  { id: 'discoveries_hunter', name: 'ציד תגליות', icon: '🔍', description: 'ענה נכון על 12 שאלות תגליות', reward: 300, xp: 600 },
  { id: 'exploration_adventurer', name: 'מגלה הרפתקן', icon: '🗺️', description: 'ענה נכון על 12 שאלות חקר', reward: 300, xp: 600 },
  { id: 'medicine_doctor', name: 'רופא רפואה', icon: '🩺', description: 'ענה נכון על 12 שאלות רפואה', reward: 300, xp: 600 },
  { id: 'linguistics_professor', name: 'פרופסור בלשנות', icon: '🗣️', description: 'ענה נכון על 10 שאלות בלשנות', reward: 250, xp: 500 },
  { id: 'climate_scientist', name: 'מדען אקלים', icon: '🌡️', description: 'ענה נכון על 12 שאלות אקלים', reward: 300, xp: 600 },
  { id: 'oceanography_explorer', name: 'חוקר אוקיינוגרפיה', icon: '🌊', description: 'ענה נכון על 10 שאלות אוקיינוגרפיה', reward: 250, xp: 500 },
  { id: 'botany_gardener', name: 'גנן בוטניקה', icon: '🌱', description: 'ענה נכון על 12 שאלות בוטניקה', reward: 300, xp: 600 },
  { id: 'space_explorer', name: 'חוקר חלל', icon: '🚀', description: 'ענה נכון על 15 שאלות חלל', reward: 350, xp: 700 },
  { id: 'environment_guardian', name: 'שומר סביבה', icon: '🌍', description: 'ענה נכון על 15 שאלות סביבה', reward: 350, xp: 700 },
  { id: 'ultimate_scholar', name: 'מלומד עליון', icon: '🎓', description: 'ענה נכון על 500 שאלות מכל הקטגוריות', reward: 3000, xp: 6000 },
  { id: 'knowledge_king', name: 'מלך הידע', icon: '👑', description: 'ענה נכון על 1000 שאלות מכל הקטגוריות', reward: 5000, xp: 10000 },
  { id: 'wisdom_god', name: 'אל החכמה', icon: '⚡', description: 'ענה נכון על 2000 שאלות מכל הקטגוריות', reward: 10000, xp: 20000 },
];

const PROFILE_BACKGROUNDS = [
  { id: 'default', name: 'ברירת מחדל', icon: '🌈', price: 0 },
  { id: 'space', name: 'חלל', icon: '🌌', price: 1000 },
  { id: 'nature', name: 'טבע', icon: '🌿', price: 1500 },
  { id: 'ocean', name: 'אוקיינוס', icon: '🌊', price: 2000 },
  { id: 'fire', name: 'אש', icon: '🔥', price: 2500 },
  { id: 'rainbow', name: 'קשת', icon: '🌈', price: 3000 },
];

const TITLES = [
  { id: 'novice', name: 'מתחיל', icon: '🌱', required: 0 },
  { id: 'student', name: 'תלמיד חרוץ', icon: '📚', required: 5000 },
  { id: 'scholar', name: 'חכם', icon: '🎓', required: 10000 },
  { id: 'master', name: 'מאסטר', icon: '👑', required: 20000 },
  { id: 'legend', name: 'אגדה', icon: '⭐', required: 50000 },
  { id: 'genius', name: 'גאון', icon: '🏆', required: 100000 },
];

const THEMES = {
  default: {
    primary: 'from-blue-900 via-blue-700 to-purple-900',
    secondary: 'from-blue-400 to-purple-400',
    accent: 'from-green-400 to-blue-500',
    text: 'text-blue-700',
    button: 'bg-blue-500 hover:bg-blue-600'
  },
  ocean: {
    primary: 'from-blue-800 via-blue-600 to-cyan-500',
    secondary: 'from-cyan-400 to-blue-400',
    accent: 'from-blue-400 to-cyan-400',
    text: 'text-cyan-700',
    button: 'bg-cyan-500 hover:bg-cyan-600'
  },
  forest: {
    primary: 'from-green-900 via-green-700 to-emerald-600',
    secondary: 'from-emerald-400 to-green-400',
    accent: 'from-green-400 to-emerald-400',
    text: 'text-emerald-700',
    button: 'bg-emerald-500 hover:bg-emerald-600'
  },
  sunset: {
    primary: 'from-orange-600 via-pink-600 to-purple-600',
    secondary: 'from-pink-400 to-purple-400',
    accent: 'from-orange-400 to-pink-400',
    text: 'text-pink-700',
    button: 'bg-pink-500 hover:bg-pink-600'
  },
  galaxy: {
    primary: 'from-purple-900 via-violet-800 to-indigo-900',
    secondary: 'from-violet-400 to-indigo-400',
    accent: 'from-purple-400 to-violet-400',
    text: 'text-violet-700',
    button: 'bg-violet-500 hover:bg-violet-600'
  }
};

const AVATARS = [
  { id: 'student', icon: '👨‍🎓', name: 'תלמיד' },
  { id: 'teacher', icon: '👩‍🏫', name: 'מורה' },
  { id: 'scientist', icon: '🧑‍🔬', name: 'מדען' },
  { id: 'artist', icon: '👨‍🎨', name: 'אמן' },
  { id: 'astronaut', icon: '👨‍🚀', name: 'אסטרונאוט' },
  { id: 'superhero', icon: '🦸‍♂️', name: 'גיבור על' },
  { id: 'ninja', icon: '🥷', name: 'נינג\'ה' },
  { id: 'wizard', icon: '🧙‍♂️', name: 'קוסם' }
];

const TAGS = [
  { id: 'genius', icon: '🧠', name: 'גאון' },
  { id: 'champion', icon: '🏆', name: 'אלוף' },
  { id: 'master', icon: '⭐', name: 'מאסטר' },
  { id: 'explorer', icon: '🗺️', name: 'חוקר' },
  { id: 'veteran', icon: '🎖️', name: 'ותיק' },
  { id: 'legend', icon: '👑', name: 'אגדה' }
];

export default function MixedQuizGame() {
  const [lang, setLang] = useState<'en' | 'he'>('en');
  const [difficulty, setDifficulty] = useState<string>('normal');
  const [category, setCategory] = useState<string>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selected, setSelected] = useState<number|null>(null);
  const [feedback, setFeedback] = useState<string|null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [stats, setStats] = useState<{ total: number; correct: number; mistakes: number }>({ total: 0, correct: 0, mistakes: 0 });
  const [personalBest, setPersonalBest] = useState<{score: number, accuracy: number} | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const confettiRef = useRef<HTMLDivElement>(null);
  const successAudio = useRef<HTMLAudioElement>(null);
  const failAudio = useRef<HTMLAudioElement>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [detailedResults, setDetailedResults] = useState<DetailedResult[]>([]);
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);
  const [mistakeQuestions, setMistakeQuestions] = useState<Question[]>([]);
  const [practiceMistakes, setPracticeMistakes] = useState<boolean>(false);
  const [translations, setTranslations] = useState<{[key: string]: string}>({});
  const [translatingId, setTranslatingId] = useState<string|null>(null);
  const [countdown, setCountdown] = useState<number>(getInitialTime(difficulty));
  const [timeUp, setTimeUp] = useState<boolean>(false);
  const [showAddQ, setShowAddQ] = useState<boolean>(false);
  const [newQ, setNewQ] = useState<Partial<Question>>({ lang: lang, category: 'other', text: '', options: ['', '', '', ''], answer: 0, explanation: '' });
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [marathon, setMarathon] = useState<boolean>(false);
  const [goldenIdx, setGoldenIdx] = useState<number|null>(null);
  const [bonus, setBonus] = useState<Bonus|null>(null);
  const [coins, setCoins] = useState<number>(0);
  const [inventory, setInventory] = useState<{[key: string]: number}>({});
  const [showShop, setShowShop] = useState<boolean>(false);
  const [activeItems, setActiveItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [xp, setXp] = useState<number>(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [lastAchievement, setLastAchievement] = useState<Achievement|null>(null);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [isVip, setIsVip] = useState<boolean>(() => {
    try {
      return inventory['vip_pass'] > 0;
    } catch {
      return false;
    }
  });
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenges>({ date: new Date().toDateString(), completed: [], progress: {} });
  
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [profile, setProfile] = useState<{background: string, title: string}>({ background: 'default', title: 'novice' });
  
  const [friends, setFriends] = useState<Friend[]>([]);
  
  const [showDailies, setShowDailies] = useState<boolean>(false);
  const [showFriends, setShowFriends] = useState<boolean>(false);
  const [showCustomize, setShowCustomize] = useState<boolean>(false);

  const currentQuestion = questions[current];

  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [shuffledAnswerIdx, setShuffledAnswerIdx] = useState<number>(-1);

  const [pauseTimer, setPauseTimer] = useState<boolean>(false);

  // Add missing state for shop item effects
  const [showHint, setShowHint] = useState<boolean>(false);
  const [removedOptions, setRemovedOptions] = useState<number[]>([]);
  const [shield, setShield] = useState<boolean>(false);
  const [categoryBoost, setCategoryBoost] = useState<boolean>(false);

  const { user } = useAuthUser();

  // Shuffle options only when current question changes
  useEffect(() => {
    if (questions.length === 0) return;
    const options = [...questions[current].options];
    const correct = options[questions[current].answer];
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    setShuffledAnswerIdx(shuffled.indexOf(correct));
  }, [current, questions]);

  // Calculate current rank
  const currentRank = RANKS.reduce((prev, curr) => (xp >= curr.required ? curr : prev));

  const [activeTheme, setActiveTheme] = useState<keyof typeof THEMES>('default');
  
  const [activeAvatar, setActiveAvatar] = useState('student');
  
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // טען את הערכים האמיתיים ב-useEffect
  useEffect(() => {
    // טען מלאי מהחנות החדשה
    try {
      const inv = JSON.parse(localStorage.getItem('quiz-inventory') || '{}');
      setInventory(inv);
      console.log('Loaded inventory from localStorage (mixed-quiz):', inv);
    } catch {
      // Do not reset inventory here!
      console.log('Failed to load inventory from localStorage (mixed-quiz)');
    }
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCoins(user.coins || 500);
      } else {
        setCoins(500);
      }
    } catch {}
    try {
      setXp(parseInt(localStorage.getItem('quiz-xp') || '0'));
    } catch {}
    try {
      setAchievements(JSON.parse(localStorage.getItem('quiz-achievements') || '[]'));
    } catch {}
    try {
      const saved = JSON.parse(localStorage.getItem('quiz-daily') || '{}');
      const today = new Date().toDateString();
      if (saved.date !== today) {
        setDailyChallenges({ date: today, completed: [], progress: {} });
      } else {
        setDailyChallenges(saved);
      }
    } catch {
      setDailyChallenges({ date: new Date().toDateString(), completed: [], progress: {} });
    }
    try {
      setProfile(JSON.parse(localStorage.getItem('quiz-profile') || '{"background":"default","title":"novice"}'));
    } catch {}
    try {
      setFriends(JSON.parse(localStorage.getItem('quiz-friends') || '[]'));
    } catch {}
    try {
      const savedTheme = localStorage.getItem('quiz-theme');
      setActiveTheme((savedTheme && Object.keys(THEMES).includes(savedTheme) ? savedTheme : 'default') as keyof typeof THEMES);
    } catch {}
    try {
      setActiveAvatar(localStorage.getItem('quiz-avatar') || 'student');
    } catch {}
    try {
      setActiveTags(JSON.parse(localStorage.getItem('quiz-tags') || '[]'));
    } catch {}
  }, []);

  useEffect(() => {
    const diff = difficulties.find(d => d.key === difficulty)!;
    setQuestions(pickQuestions(QUESTIONS, lang, diff.count, category));
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setShowExplanation(false);
    setFinished(false);
    setStats({ total: 0, correct: 0, mistakes: 0 });
    setTimer(0);
    try {
      const pb = JSON.parse(localStorage.getItem('mixed-best') || 'null');
      if (pb) setPersonalBest(pb);
    } catch {}
    const stats = JSON.parse(localStorage.getItem('category-stats') || '{}');
    setCategoryStats(stats);
    const lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    setLeaderboard(lb);
    const mistakes = JSON.parse(localStorage.getItem('mistake-questions') || '[]');
    setMistakeQuestions(mistakes);
    setCountdown(getInitialTime(difficulty));
    setTimeUp(false);
    if (questions.length > 0) {
      const idx = Math.floor(Math.random() * questions.length);
      setGoldenIdx(idx);
    }
  }, [difficulty, lang, category]);

  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [finished]);

  useEffect(() => {
    if (finished || timeUp || pauseTimer) return;
    if (countdown <= 0) {
      setTimeUp(true);
      setFinished(true);
      return;
    }
    const interval = setInterval(() => setCountdown(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [finished, timeUp, countdown, pauseTimer]);

  useEffect(() => {
    if (feedback === 'correct') {
      const baseCoins = 10;
      const streakBonus = Math.floor(stats.correct / 3) * 5; // Bonus every 3 correct answers
      const difficultyMultiplier = difficulty === 'marathon' ? 2 : 1;
      const vipBonus = isVip ? 1.5 : 1;
      const earnedCoins = Math.floor((baseCoins + streakBonus) * difficultyMultiplier * vipBonus);
      
      setCoins(c => {
        const newAmount = c + earnedCoins;
        localStorage.setItem('quiz-coins', newAmount.toString());
        return newAmount;
      });

      // Check for achievements
      checkAchievements();
    }
  }, [feedback]);

  // Update daily challenges progress
  useEffect(() => {
    if (feedback === 'correct') {
      setDailyChallenges(prev => {
        const progress = { ...prev.progress };
        
        // Update speed master challenge
        if (timer <= 30) {
          progress.speed_master = (progress.speed_master || 0) + 1;
        }
        
        // Update category master challenge
        const catProgress = `category_${category}`;
        progress[catProgress] = (progress[catProgress] || 0) + 1;
        
        // Update perfect streak challenge
        progress.perfect_streak = (progress.perfect_streak || 0) + 1;
        
        // Update marathon hero challenge
        if (marathon) {
          progress.marathon_hero = (progress.marathon_hero || 0) + 1;
        }
        
        // Check for completed challenges
        DAILY_CHALLENGES.forEach(challenge => {
          if (!prev.completed.includes(challenge.id)) {
            let isCompleted = false;
            switch (challenge.id) {
              case 'speed_master':
                isCompleted = (progress.speed_master || 0) >= 5;
                break;
              case 'category_master':
                isCompleted = !!Object.entries(progress)
                  .find(([key, value]) => key.startsWith('category_') && value >= 10);
                break;
              case 'perfect_streak':
                isCompleted = (progress.perfect_streak || 0) >= 15;
                break;
              case 'marathon_hero':
                isCompleted = (progress.marathon_hero || 0) >= 20;
                break;
            }
            
            if (isCompleted) {
              prev.completed.push(challenge.id);
              // Award rewards
              setCoins(c => {
                const newAmount = c + challenge.reward;
                localStorage.setItem('quiz-coins', newAmount.toString());
                return newAmount;
              });
              setXp(x => {
                const newAmount = x + challenge.xp;
                localStorage.setItem('quiz-xp', newAmount.toString());
                return newAmount;
              });
            }
          }
        });
        
        const updated = { ...prev, progress };
        localStorage.setItem('quiz-daily', JSON.stringify(updated));
        return updated;
      });
    } else if (feedback === 'wrong') {
      // Reset perfect streak on wrong answer
      setDailyChallenges(prev => {
        const progress = { ...prev.progress, perfect_streak: 0 };
        const updated = { ...prev, progress };
        localStorage.setItem('quiz-daily', JSON.stringify(updated));
        return updated;
      });
    }
  }, [feedback]);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    setPauseTimer(true);
    setStats(s => ({ ...s, total: s.total + 1 }));
    const now = Date.now();
    setQuestionTimes(prev => [...prev, now]);
    const q = questions[current];
    setDetailedResults(prev => [...prev, { ...q, selected: idx, correct: idx === shuffledAnswerIdx, time: now, options: shuffledOptions, answer: shuffledAnswerIdx }]);
    setCategoryStats(cs => {
      const cat = q.category || 'other';
      const prev = cs[cat] || { total: 0, correct: 0 };
      const updated = { total: prev.total + 1, correct: prev.correct + (idx === shuffledAnswerIdx ? 1 : 0) };
      const newStats = { ...cs, [cat]: updated };
      localStorage.setItem('category-stats', JSON.stringify(newStats));
      return newStats;
    });

    const isCorrect = idx === shuffledAnswerIdx;
    if (isCorrect) {
      // 3 נקודות בסיסיות לתשובה נכונה
      const basePoints = 3;
      let finalPoints = basePoints;

      if (activeItems.includes('double_points')) {
        finalPoints *= 2;
        setActiveItems(items => items.filter(i => i !== 'double_points'));
      }

      if (activeItems.includes('category_boost') && selectedCategory === category) {
        finalPoints *= 2;
      }

      const isGolden = current === goldenIdx;
      if (isGolden) finalPoints *= 2;
      
      // הגבלת נקודות מקסימליות לשאלה - מקסימום 3 נקודות בסיסיות (בלי בונוסים)
      // זה מבטיח שמשחק מרתון עם 50 שאלות ייתן מקסימום 150 נקודות (50 * 3)
      finalPoints = Math.min(finalPoints, 3);

      setScore(s => s + finalPoints);
      if (isGolden) {
        setBonus({ points: finalPoints, message: `🌟 שאלת זהב! קיבלת ${finalPoints} נקודות!` });
      }
      
      setFeedback('correct');
      setStats(s => ({ ...s, correct: s.correct + 1 }));
      
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play().catch(err => console.error('Error playing audio:', err));
      }
    } else {
      addMistake(q.id);
      setMistakeQuestions(prev => {
        const updated = [...prev, q];
        localStorage.setItem('mistake-questions', JSON.stringify(updated));
        return updated;
      });
      setFeedback('wrong');
      setStats(s => ({ ...s, mistakes: s.mistakes + 1 }));
      if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play().catch(err => console.error('Error playing audio:', err));
      }
      if (marathon) {
        setFinished(true);
        return;
      }
    }
  }

  function restart() {
    const diff = difficulties.find(d => d.key === difficulty)!;
    setQuestions(pickQuestions(QUESTIONS, lang, diff.count, category));
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setShowExplanation(false);
    setFinished(false);
    setStats({ total: 0, correct: 0, mistakes: 0 });
    setTimer(0);
    setDetailedResults([]);
    setQuestionTimes([]);
    setCountdown(getInitialTime(difficulty));
    setTimeUp(false);
    setGoldenIdx(Math.floor(Math.random() * questions.length));
    setBonus(null);
  }

  function getProgressIcon(accuracy: number) {
    if (accuracy >= 90) return "🏆";
    if (accuracy >= 80) return "🥇";
    if (accuracy >= 70) return "🥈";
    if (accuracy >= 60) return "🥉";
    return "🎯";
  }

  function shareResult(score: number, accuracy: number) {
    const text = `שיחקתי חידון מעורב וקיבלתי ${score} נקודות! (${accuracy}% הצלחה) ${getProgressIcon(accuracy)}`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("התוצאה הועתקה ללוח!");
    }
  }

  function addUserQuestion() {
    if (!newQ.text || !newQ.explanation || !newQ.options || newQ.options.some(o => !o)) {
      alert("נא למלא את כל השדות");
      return;
    }
    const q: Question = {
      id: Date.now(),
      lang: newQ.lang as 'en' | 'he',
      category: newQ.category || 'other',
      text: newQ.text,
      options: newQ.options,
      answer: newQ.answer ?? 0,
      explanation: newQ.explanation,
      explanationHe: newQ.explanationHe || ''
    };
    setUserQuestions(uq => {
      const updated = [...uq, q];
      localStorage.setItem('user-questions', JSON.stringify(updated));
      return updated;
    });
    setNewQ({ lang, category: 'other', text: '', options: ['', '', '', ''], answer: 0, explanation: '' });
    setShowAddQ(false);
  }

  const isRTL = lang === 'he';
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;

  function buyItem(itemId: string) {
    const item = SHOP_ITEMS.find(i => i.id === itemId) as ShopItem;
    if (!item) return;

    const price = isVip ? Math.floor(item.price * (1 - ((item as ShopItem).vipDiscount || 0) / 100)) : item.price;
    if (coins < price) return;
    
    setCoins(c => {
      const newAmount = c - price;
      localStorage.setItem('quiz-coins', newAmount.toString());
      return newAmount;
    });
    
    setInventory(inv => {
      const newInv = { ...inv, [itemId]: (inv[itemId] || 0) + 1 };
      localStorage.setItem('quiz-inventory', JSON.stringify(newInv));
      
      // Update VIP status if buying VIP pass
      if (itemId === 'vip_pass') {
        setIsVip(true);
      }
      
      return newInv;
    });

    // Check collector achievement
    if (!achievements.includes('collector')) {
      const hasAllItems = SHOP_ITEMS.every(item => inventory[item.id] > 0);
      if (hasAllItems) {
        checkAchievements();
      }
    }
  }

  function useItem(itemId: string) {
    if (!inventory[itemId] || inventory[itemId] <= 0) return;
    
    setInventory(inv => {
      const newInv = { ...inv, [itemId]: inv[itemId] - 1 };
      localStorage.setItem('quiz-inventory', JSON.stringify(newInv));
      return newInv;
    });

    setActiveItems(items => [...items, itemId]);

    switch (itemId) {
      case 'extra_time':
        setCountdown(c => c + 30);
        break;
      case 'fifty_fifty':
        const correctAnswer = questions[current].answer;
        const wrongOptions = questions[current].options
          .map((opt, idx) => idx)
          .filter(idx => idx !== correctAnswer)
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);
        // Mark these options as disabled in the UI
        break;
      case 'double_points':
        // Will be checked when adding points
        break;
      case 'save_streak':
        // Will be checked when handling wrong answers
        break;
      case 'category_boost':
        setSelectedCategory(category);
        break;
      case 'hint':
        // Show hint for current question
        break;
      case 'time_freeze':
        setTimeout(() => {
          setActiveItems(items => items.filter(i => i !== 'time_freeze'));
        }, 10000);
        break;
      case 'combo_boost':
        setComboMultiplier(2);
        break;
      case 'category_unlock':
        // Unlock new category logic
        break;
    }
  }

  function checkAchievements() {
    const newAchievements: string[] = [];
    
    // Check each achievement condition
    if (!achievements.includes('first_win') && stats.correct > 0) {
      newAchievements.push('first_win');
    }
    if (!achievements.includes('perfect_game') && stats.total >= 5 && stats.correct === stats.total) {
      newAchievements.push('perfect_game');
    }
    if (!achievements.includes('marathon_master') && marathon && stats.correct >= 10) {
      newAchievements.push('marathon_master');
    }
    // Add more achievement checks...

    if (newAchievements.length > 0) {
      setAchievements(prev => {
        const updated = [...prev, ...newAchievements];
        localStorage.setItem('quiz-achievements', JSON.stringify(updated));
        return updated;
      });

      // Award coins for achievements
      const totalReward = newAchievements.reduce((sum, id) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        return sum + (achievement?.reward || 0);
      }, 0);

      if (totalReward > 0) {
        setCoins(c => {
          const newAmount = c + totalReward;
          localStorage.setItem('quiz-coins', newAmount.toString());
          return newAmount;
        });
      }

      // Show achievement notification
      const lastAchieved = ACHIEVEMENTS.find(a => a.id === newAchievements[newAchievements.length - 1]) || null;
      setLastAchievement(lastAchieved);
      setTimeout(() => setLastAchievement(null), 3000);
    }
  }

  function addFriend(name: string) {
    if (!name.trim() || friends.find(f => f.name === name)) return;
    
    const newFriend = {
      id: Date.now(),
      name,
      score: Math.floor(Math.random() * 10000),
      rank: RANKS[Math.floor(Math.random() * RANKS.length)].name,
      lastActive: new Date().toISOString()
    };
    
    setFriends(prev => {
      const updated = [...prev, newFriend];
      localStorage.setItem('quiz-friends', JSON.stringify(updated));
      return updated;
    });
  }

  function updateProfile(field: string, value: string) {
    setProfile(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem('quiz-profile', JSON.stringify(updated));
      return updated;
    });
  }

  function buyCoins(amount: number, price: number) {
    // כאן תהיה לוגיקת תשלום אמיתית
    // כרגע זה רק מוסיף מטבעות
    setCoins(prev => {
      const newAmount = prev + amount;
      localStorage.setItem('quiz-coins', newAmount.toString());
      return newAmount;
    });
    
    // הצג הודעה על הקנייה
    alert(`קנית ${amount} מטבעות תמורת ₪${price}!`);
  }

  function updateTheme(themeId: keyof typeof THEMES) {
    setActiveTheme(themeId);
    localStorage.setItem('quiz-theme', themeId);
  }

  function updateAvatar(avatarId: string) {
    setActiveAvatar(avatarId);
    localStorage.setItem('quiz-avatar', avatarId);
  }

  function toggleTag(tagId: string) {
    setActiveTags(prev => {
      const updated = prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId];
      
      localStorage.setItem('quiz-tags', JSON.stringify(updated));
      return updated;
    });
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes fade-in { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
        .confetti { pointer-events:none; position:fixed; inset:0; z-index:50; display:none; }
        .confetti.show { display:block; background:transparent; }
        .confetti.show:after { content:''; position:absolute; inset:0; background-image: repeating-radial-gradient(circle, #ff0 2px, transparent 4px), repeating-radial-gradient(circle, #0ff 2px, transparent 4px), repeating-radial-gradient(circle, #f0f 2px, transparent 4px), repeating-radial-gradient(circle, #0f0 2px, transparent 4px), repeating-radial-gradient(circle, #00f 2px, transparent 4px), repeating-radial-gradient(circle, #f00 2px, transparent 4px); background-size: 40px 40px; opacity:0.5; animation: confetti-fall 1.2s linear; }
        @keyframes confetti-fall { from{background-position:0 0,0 0,0 0,0 0,0 0,0 0;} to{background-position:0 400px,0 300px,0 500px,0 200px,0 600px,0 350px;} }
        .shake { animation: shake 0.4s; }
        @keyframes shake { 0%{transform:translateX(0);} 20%{transform:translateX(-8px);} 40%{transform:translateX(8px);} 60%{transform:translateX(-8px);} 80%{transform:translateX(8px);} 100%{transform:translateX(0);} }
      `;
      document.head.appendChild(style);
      return () => { document.head.removeChild(style); };
    }
  }, []);

  // הוסף פונקציה לשימוש בפריט
  function useShopItem(itemId: string) {
    if (!inventory[itemId] || inventory[itemId] <= 0) return;
    setInventory(inv => {
      const newInv = { ...inv, [itemId]: inv[itemId] - 1 };
      localStorage.setItem('quiz-inventory', JSON.stringify(newInv));
      return newInv;
    });
    setActiveItems(items => [...items, itemId]);
    switch (itemId) {
      case 'hint_package':
      case 'hint':
        setShowHint(true);
        setTimeout(() => setShowHint(false), 2500);
        break;
      case 'extra_time':
        setCountdown(t => t + 30);
        setBonus({ points: 0, message: '⏰ נוספו 30 שניות!' });
        setTimeout(() => setBonus(null), 2000);
        break;
      case 'skip':
        if (current < questions.length - 1) {
          setCurrent(c => c + 1);
          setBonus({ points: 0, message: '⏭️ דילגת על שאלה!' });
          setTimeout(() => setBonus(null), 2000);
        }
        break;
      case 'score_boost':
      case 'double_points':
        setComboMultiplier(2);
        setBonus({ points: 0, message: '🚀 בונוס ניקוד כפול!' });
        setTimeout(() => setComboMultiplier(1), 2000);
        setTimeout(() => setBonus(null), 2000);
        break;
      case 'fifty_fifty':
        // הסר שתי תשובות שגויות
        if (shuffledOptions.length > 2) {
          const wrongs = shuffledOptions.map((opt, idx) => idx).filter(idx => idx !== shuffledAnswerIdx);
          const toRemove = wrongs.sort(() => Math.random() - 0.5).slice(0, 2);
          setRemovedOptions(toRemove);
          setBonus({ points: 0, message: '✂️ הוסרו שתי תשובות שגויות!' });
          setTimeout(() => setBonus(null), 2000);
        }
        break;
      case 'special_tag':
        setActiveTags(tags => [...tags, 'special']);
        setBonus({ points: 0, message: '🏆 תג ייחודי נפתח!' });
        setTimeout(() => setBonus(null), 2000);
        break;
      case 'special_avatar':
        setActiveAvatar('superhero');
        setBonus({ points: 0, message: '🧑‍🎤 אוואטר חדש נפתח!' });
        setTimeout(() => setBonus(null), 2000);
        break;
      case 'theme_pack':
        setActiveTheme('galaxy');
        setBonus({ points: 0, message: '🎨 ערכת נושא חדשה הופעלה!' });
        setTimeout(() => setBonus(null), 2000);
        break;
      case 'save_streak':
      case 'shield':
        setShield(true);
        setBonus({ points: 0, message: '🛡️ הגנה מטעות הופעלה!' });
        setTimeout(() => setBonus(null), 2000);
        break;
      case 'category_boost':
        setCategoryBoost(true);
        setBonus({ points: 0, message: '📚 בונוס קטגוריה הופעל!' });
        setTimeout(() => setCategoryBoost(false), 30000);
        setTimeout(() => setBonus(null), 2000);
        break;
      case 'vip_pass':
        setIsVip(true);
        setBonus({ points: 0, message: '👑 VIP הופעל!' });
        setTimeout(() => setBonus(null), 2000);
        break;
    }
    setTimeout(() => setActiveItems(items => items.filter(i => i !== itemId)), 1000);
  }

  // שמור את המלאי ל-localStorage בכל שינוי
  useEffect(() => {
    try {
      localStorage.setItem('quiz-inventory', JSON.stringify(inventory));
    } catch {}
  }, [inventory]);

  useEffect(() => {
    if (finished && user && user.id) {
      const updateStats = async () => {
        try {
          // השתמש ב-update-stats API במקום PATCH ישיר - זה מבטיח שהניקוד נשמר נכון
          await fetch('/api/games/update-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              gameName: 'mixed-quiz',
              score: score,
              won: stats.correct > stats.mistakes
            })
          });
        } catch (e) {
          console.error('Error updating stats:', e);
        }
      };
      updateStats();
    }
  }, [finished, user, score, stats]);

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-4 ${isRTL ? 'rtl' : ''} bg-gradient-to-br ${THEMES[activeTheme].primary}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div ref={confettiRef} className="confetti" />
      <audio ref={successAudio} src="/voise/הצלחה.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/כשלון.dat" preload="auto" />
      <div className="max-w-2xl w-full mx-auto bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 transition-all duration-700">
        <div className="w-full h-4 bg-blue-100 rounded-full mb-6 overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-700" style={{ width: `${progress}%` }} />
          <div className="absolute inset-0 flex items-center justify-center text-blue-700 font-bold text-sm">{Math.round(progress)}%</div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 text-center drop-shadow-lg flex items-center gap-4">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-4xl shadow-lg mr-2 animate-fade-in">❓</span>
            חידון מעורב
            <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xl shadow bg-gradient-to-r from-green-400 to-green-600 text-white ml-4`}>
              <span className="text-2xl">{lang === 'he' ? '🟣' : '🔵'}</span> {difficulties.find(d=>d.key===difficulty)?.label}
            </span>
          </h1>
        </div>
        <div className="flex gap-4 mb-4 justify-center">
          <button onClick={() => setLang('en')} className={`px-6 py-2 rounded-full font-bold shadow text-lg flex items-center gap-2 transition-all duration-200 ${lang==='en'?'bg-green-600 text-white scale-105':'bg-white text-green-700 hover:bg-green-100'}`}>🇬🇧 English</button>
          <button onClick={() => setLang('he')} className={`px-6 py-2 rounded-full font-bold shadow text-lg flex items-center gap-2 transition-all duration-200 ${lang==='he'?'bg-pink-600 text-white scale-105':'bg-white text-pink-700 hover:bg-pink-100'}`}>🇮🇱 עברית</button>
        </div>
        <div className="flex gap-4 mb-4 justify-center">
          {difficulties.map(d => (
            <button key={d.key} onClick={() => setDifficulty(d.key)} className={`px-4 py-2 rounded-full font-bold shadow text-md flex items-center gap-2 ${difficulty===d.key?'bg-blue-600 text-white scale-105':'bg-white text-blue-700 hover:bg-blue-100'}`}>{d.label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setCategory(cat.key)} className={`px-4 py-2 rounded-full font-bold shadow text-md flex items-center gap-2 ${category===cat.key?'bg-purple-600 text-white scale-105':'bg-white text-purple-700 hover:bg-purple-100'}`}>
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-4 mb-4 justify-center">
          <button onClick={() => setMarathon(!marathon)} className={`px-4 py-2 rounded-full font-bold shadow text-md flex items-center gap-2 ${marathon?'bg-red-600 text-white scale-105':'bg-white text-red-700 hover:bg-red-100'}`}>
            <span>🏃‍♂️</span> מרתון {marathon ? '(פעיל)' : ''}
          </button>
          <button onClick={() => setPracticeMistakes(!practiceMistakes)} className={`px-4 py-2 rounded-full font-bold shadow text-md flex items-center gap-2 ${practiceMistakes?'bg-orange-600 text-white scale-105':'bg-white text-orange-700 hover:bg-orange-100'}`}>
            <span>📝</span> תרגול טעויות {practiceMistakes ? '(פעיל)' : ''}
          </button>
        </div>
        {!finished && questions.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-bold text-blue-700">זמן: {timer}s</div>
              <div className="text-lg font-bold text-blue-700">נותרו: {countdown}s</div>
            </div>
            <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl shadow p-4 mb-4 text-xl font-bold text-blue-900 text-center animate-fade-in">
              {questions[current].text}
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {shuffledOptions.map((opt, idx) => (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null}
                  className={`w-full px-6 py-3 rounded-2xl font-bold text-lg shadow transition-all duration-200 border-2 flex items-center gap-2
                    ${selected !== null
                      ? idx === shuffledAnswerIdx
                        ? 'bg-green-200 border-green-500 text-green-900 scale-105'
                        : selected === idx
                          ? 'bg-red-200 border-red-500 text-red-900 shake'
                          : 'bg-white border-blue-200 text-blue-900'
                      : 'bg-white border-blue-200 text-blue-900 hover:bg-blue-50 hover:scale-105'}`}
                >{opt}</button>
              ))}
            </div>
            {/* כפתורי עזר */}
            {selected === null && (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {/* כפתור רמז */}
                {inventory['hint'] > 0 && !showHint && (
                  <button
                    onClick={() => useShopItem('hint')}
                    className="px-4 py-2 rounded-full bg-yellow-300 text-yellow-900 font-bold shadow hover:bg-yellow-400 flex items-center gap-2 text-sm"
                  >
                    <span className="text-xl">💡</span> רמז ({inventory['hint']})
                  </button>
                )}
                {/* כפתור דילוג */}
                {inventory['skip'] > 0 && (
                  <button
                    onClick={() => useShopItem('skip')}
                    className="px-4 py-2 rounded-full bg-blue-300 text-blue-900 font-bold shadow hover:bg-blue-400 flex items-center gap-2 text-sm"
                  >
                    <span className="text-xl">⏭️</span> דלג ({inventory['skip']})
                  </button>
                )}
                {/* כפתור תוספת זמן */}
                {inventory['extra_time'] > 0 && (
                  <button
                    onClick={() => useShopItem('extra_time')}
                    className="px-4 py-2 rounded-full bg-green-300 text-green-900 font-bold shadow hover:bg-green-400 flex items-center gap-2 text-sm"
                  >
                    <span className="text-xl">⏰</span> זמן ({inventory['extra_time']})
                  </button>
                )}
                {/* כפתור בונוס ניקוד */}
                {inventory['score_boost'] > 0 && (
                  <button
                    onClick={() => useShopItem('score_boost')}
                    className="px-4 py-2 rounded-full bg-purple-300 text-purple-900 font-bold shadow hover:bg-purple-400 flex items-center gap-2 text-sm"
                  >
                    <span className="text-xl">🚀</span> בונוס ({inventory['score_boost']})
                  </button>
                )}
              </div>
            )}
            {/* הצג את ההסבר כרמז אם showHint */}
            {showHint && selected === null && (
              <div className="flex flex-col items-center justify-center animate-fade-in mt-2 mb-4">
                <div className="bg-yellow-50 border-4 border-yellow-400 rounded-2xl px-8 py-4 text-lg font-bold text-yellow-900 shadow-lg flex flex-col gap-2 w-full max-w-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">💡</span>
                    <span>רמז</span>
                  </div>
                  <div className="text-md text-yellow-900 whitespace-pre-line">{questions[current].explanation}</div>
                  {questions[current].explanationHe && (
                    <div className="text-md text-blue-700 whitespace-pre-line">{questions[current].explanationHe}</div>
                  )}
                </div>
              </div>
            )}
            {feedback === 'correct' && (
              <div className="flex flex-col items-center justify-center animate-fade-in">
                <div className="bg-white border-2 border-green-400 rounded-2xl px-8 py-6 text-2xl font-bold text-green-700 shadow-lg flex items-center gap-2 mb-2">
                  <span>🎉</span> Correct! <span>🎉</span>
                </div>
                {bonus && (
                  <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl px-6 py-3 text-xl font-bold text-yellow-700 shadow-lg flex items-center gap-2 mt-2 animate-bounce">
                    {bonus.message}
                  </div>
                )}
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="flex flex-col items-center justify-center animate-fade-in">
                <div className="bg-white border-2 border-red-400 rounded-2xl px-8 py-6 text-2xl font-bold text-red-700 shadow-lg flex items-center gap-2 mb-2">
                  <span>❌</span> Incorrect <span>❌</span>
                </div>
              </div>
            )}
            {showExplanation && (
              <div className="flex flex-col items-center justify-center animate-fade-in mt-4 mb-4">
                <div className="bg-yellow-50 border-4 border-yellow-400 rounded-2xl px-8 py-6 text-xl font-bold text-yellow-900 shadow-lg flex flex-col gap-3 w-full max-w-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">💡</span>
                    <span className="text-2xl font-extrabold">הסבר / Explanation</span>
                  </div>
                  <div className="text-lg text-yellow-900 whitespace-pre-line">{questions[current].explanation}</div>
                  {questions[current].explanationHe && (
                    <div className="text-lg text-blue-700 whitespace-pre-line">{questions[current].explanationHe}</div>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-center mt-4">
              {selected !== null && (
                <button onClick={() => {
                  setSelected(null);
                  setShowExplanation(false);
                  setFeedback(null);
                  setBonus(null);
                  setPauseTimer(false);
                  if (current === questions.length - 1) setFinished(true);
                  else setCurrent(c => c + 1);
                }} className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-purple-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-2"><span className="text-2xl">➡️</span> {lang==='he' ? 'לשאלה הבאה' : 'Next Question'}</button>
              )}
            </div>
          </>
        )}
        {finished && (
          <div className="text-center mt-6 animate-fade-in">
            <div className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center gap-2">
              <span className="text-green-500 text-3xl">🏆</span>
              {timeUp ? "נגמר הזמן!" : marathon && feedback === 'wrong' ? "המרתון נגמר!" : "כל הכבוד! סיימת את החידון"} 
              <span className="text-3xl">🎉</span>
            </div>
            <div className="text-lg font-bold text-green-700 mb-2 flex items-center justify-center gap-2">
              <span className="text-blue-500 text-2xl">★</span>
              ניקוד סופי: {score} | {stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0}% הצלחה
            </div>
            <div className="text-md font-bold text-purple-700 mb-2 flex items-center justify-center gap-2">
              {stats.correct} תשובות נכונות, {stats.mistakes} טעויות, {stats.total} שאלות
            </div>
            <div className="text-md font-bold text-blue-700 mb-4">זמן: {timer} שניות</div>
            <div className="flex gap-4 justify-center mb-4">
              <button onClick={restart} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 flex items-center gap-2">
                <span className="text-2xl">🔄</span> שחק שוב
              </button>
              <button onClick={() => shareResult(score, stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0)} className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-pink-400 hover:to-purple-400 transition-all duration-200 flex items-center gap-2">
                <span className="text-2xl">📤</span> שתף תוצאה
              </button>
            </div>
            {detailedResults.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-blue-700 mb-4">סיכום תשובות:</h2>
                <div className="grid gap-4">
                  {detailedResults.map((r, i) => (
                    <div key={i} className={`p-4 rounded-xl shadow-md ${r.correct ? 'bg-green-100' : 'bg-red-100'}`}>
                      <div className="font-bold mb-2">{r.text}</div>
                      <div className="text-sm">
                        בחרת: {r.options[r.selected]} {r.correct ? '✅' : '❌'}
                        {!r.correct && <span className="text-green-700"> (נכון: {r.options[r.answer]})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {!finished && personalBest && (
        <div className="text-center text-md font-bold text-green-300 mb-2 animate-fade-in">
          שיא אישי: {personalBest.score} נק׳, {personalBest.accuracy}% הצלחה
        </div>
      )}
      <div className="fixed top-4 right-4 flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold shadow-lg">
        <span className="text-2xl">🪙</span> {coins}
        <button onClick={() => setShowShop(true)} className="ml-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full text-sm">
          🛍️ חנות
        </button>
      </div>

      {showShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">🛍️ חנות</h2>
              <div className="flex items-center gap-2">
                {isVip && <span className="text-yellow-500 font-bold">👑 VIP</span>}
                <span className="text-yellow-600 font-bold">🪙 {coins}</span>
                <button onClick={() => setShowShop(false)} className="text-gray-500 hover:text-gray-700">✖️</button>
              </div>
            </div>
            <div className="grid gap-4">
              {/* חנות מטבעות */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-xl border-2 border-yellow-300">
                <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  קניית מטבעות בכסף אמיתי
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-yellow-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🪙</div>
                      <div className="font-bold text-lg">100 מטבעות</div>
                      <div className="text-sm text-gray-600 mb-3">₪4.99</div>
                      <button 
                        onClick={() => buyCoins(100, 4.99)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full font-bold"
                      >
                        קנה עכשיו
                      </button>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-yellow-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🪙</div>
                      <div className="font-bold text-lg">250 מטבעות</div>
                      <div className="text-sm text-gray-600 mb-3">₪9.99 <span className="text-green-600">(חיסכון 20%)</span></div>
                      <button 
                        onClick={() => buyCoins(250, 9.99)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full font-bold"
                      >
                        קנה עכשיו
                      </button>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-yellow-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🪙</div>
                      <div className="font-bold text-lg">500 מטבעות</div>
                      <div className="text-sm text-gray-600 mb-3">₪19.99 <span className="text-green-600">(חיסכון 33%)</span></div>
                      <button 
                        onClick={() => buyCoins(500, 19.99)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full font-bold"
                      >
                        קנה עכשיו
                      </button>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-yellow-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🪙</div>
                      <div className="font-bold text-lg">1000 מטבעות</div>
                      <div className="text-sm text-gray-600 mb-3">₪39.99 <span className="text-green-600">(חיסכון 50%)</span></div>
                      <button 
                        onClick={() => buyCoins(1000, 39.99)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full font-bold"
                      >
                        קנה עכשיו
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* חנות פריטים */}
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl border-2 border-blue-300">
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🛍️</span>
                  חנות פריטים
                </h3>
                <div className="grid gap-4">
                  {SHOP_ITEMS.map(item => {
                    const price = isVip ? Math.floor(item.price * (1 - ((item as ShopItem).vipDiscount || 0) / 100)) : item.price;
                    return (
                      <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-bold">{item.name}</span>
                            {(item as ShopItem).vipDiscount && isVip && (
                              <span className="text-yellow-500 text-sm">-{(item as ShopItem).vipDiscount}%</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <div className="text-sm text-blue-600">
                            ברשותך: {inventory[item.id] || 0}
                            {item.permanent && inventory[item.id] > 0 && " (קבוע)"}
                          </div>
                        </div>
                        <button
                          onClick={() => buyItem(item.id)}
                          disabled={coins < price || (item.permanent && inventory[item.id] > 0)}
                          className={`px-4 py-2 rounded-full font-bold ${
                            coins >= price && (!item.permanent || !inventory[item.id])
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          🪙 {price}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* הצג רמז בודד כפריט עצמאי אם יש במלאי */}
              {inventory['hint'] > 0 && (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl opacity-80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      <span className="font-bold">רמז בודד</span>
                    </div>
                    <p className="text-sm text-gray-600">רמז בודד לשימוש במשחק</p>
                    <div className="text-sm text-blue-600">ברשותך: {inventory['hint']}</div>
                  </div>
                  <span className="px-4 py-2 rounded-full font-bold bg-gray-200 text-gray-500 cursor-not-allowed">לא ניתן לקנות</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!finished && questions.length > 0 && inventory && Object.entries(inventory).some(([_, count]) => count > 0) && (
        <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-50">
          {SHOP_ITEMS.map(item => (
            inventory[item.id] > 0 && (
              <button
                key={item.id}
                onClick={() => useShopItem(item.id)}
                disabled={activeItems.includes(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg text-lg
                  ${activeItems.includes(item.id) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-300 to-blue-200 text-blue-900 hover:from-blue-400 hover:to-green-200'}`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.name}</span>
                <span className="text-sm">({inventory[item.id]})</span>
              </button>
            )
          ))}
        </div>
      )}
      <div className="fixed top-4 left-4 flex flex-col items-start gap-2">
        <div className="bg-purple-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
          <span className="text-2xl">{currentRank.icon}</span>
          <span>{currentRank.name}</span>
        </div>
        <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span>{xp} XP</span>
        </div>
        <button
          onClick={() => setShowAchievements(true)}
          className="bg-yellow-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-yellow-600"
        >
          <span className="text-2xl">🏆</span>
          <span>הישגים</span>
        </button>
        <button
          onClick={() => setShowProfile(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-purple-600"
        >
          <span className="text-2xl">👤</span>
          <span>פרופיל</span>
        </button>
        <button
          onClick={() => setShowDailies(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-green-600"
        >
          <span className="text-2xl">📅</span>
          <span>אתגרי היום</span>
          {dailyChallenges.completed.length > 0 && (
            <span className="bg-yellow-400 text-yellow-900 px-2 rounded-full">{dailyChallenges.completed.length}</span>
          )}
        </button>
      </div>

      {showAchievements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">🏆 הישגים</h2>
              <button onClick={() => setShowAchievements(false)} className="text-gray-500 hover:text-gray-700">✖️</button>
            </div>
            <div className="grid gap-4">
              {ACHIEVEMENTS.map(achievement => {
                const isUnlocked = achievements.includes(achievement.id);
                return (
                  <div key={achievement.id} className={`flex items-center justify-between p-4 rounded-xl ${isUnlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div>
                        <div className="font-bold">{achievement.name}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600 font-bold">🪙 {achievement.reward}</span>
                      {isUnlocked && <span className="text-green-500 text-2xl">✅</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">👤 הפרופיל שלי</h2>
              <button onClick={() => setShowProfile(false)} className="text-gray-500 hover:text-gray-700">✖️</button>
            </div>
            <div className="grid gap-6">
              <div className={`p-6 rounded-xl shadow-lg text-center ${
                profile.background === 'space' ? 'bg-gradient-to-r from-purple-900 to-blue-900 text-white' :
                profile.background === 'nature' ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white' :
                profile.background === 'ocean' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                profile.background === 'fire' ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white' :
                profile.background === 'rainbow' ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white' :
                'bg-gradient-to-r from-blue-100 to-purple-100'
              }`}>
                <div className="text-4xl mb-2">{TITLES.find(t => t.id === profile.title)?.icon}</div>
                <div className="text-2xl font-bold mb-1">{TITLES.find(t => t.id === profile.title)?.name}</div>
                <div className="text-lg opacity-75">XP: {xp}</div>
                <div className="text-lg opacity-75">🪙 {coins}</div>
                <div className="mt-4 text-sm">
                  הישגים: {achievements.length}/{ACHIEVEMENTS.length}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">התאמה אישית</h3>
                <div className="grid gap-4">
                  <div>
                    <h4 className="font-bold mb-2">רקע</h4>
                    <div className="flex flex-wrap gap-2">
                      {PROFILE_BACKGROUNDS.map(bg => (
                        <button
                          key={bg.id}
                          onClick={() => {
                            if (bg.price === 0 || inventory[`bg_${bg.id}`]) {
                              updateProfile('background', bg.id);
                            } else if (coins >= bg.price) {
                              buyItem(`bg_${bg.id}`);
                              updateProfile('background', bg.id);
                            }
                          }}
                          className={`p-3 rounded-xl flex flex-col items-center gap-1 ${
                            profile.background === bg.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-2xl">{bg.icon}</span>
                          <span className="text-sm font-bold">{bg.name}</span>
                          {bg.price > 0 && !inventory[`bg_${bg.id}`] && (
                            <span className="text-xs">🪙 {bg.price}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-2">תארים</h4>
                    <div className="flex flex-wrap gap-2">
                      {TITLES.map(title => (
                        <button
                          key={title.id}
                          onClick={() => xp >= title.required && updateProfile('title', title.id)}
                          className={`p-3 rounded-xl flex flex-col items-center gap-1 ${
                            profile.title === title.id
                              ? 'bg-blue-500 text-white'
                              : xp >= title.required
                              ? 'bg-gray-100 hover:bg-gray-200'
                              : 'bg-gray-100 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-2xl">{title.icon}</span>
                          <span className="text-sm font-bold">{title.name}</span>
                          {xp < title.required && (
                            <span className="text-xs">{title.required} XP</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">חברים</h3>
                <div className="grid gap-4">
                  {friends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">👤</span>
                        <div>
                          <div className="font-bold">{friend.name}</div>
                          <div className="text-sm text-gray-600">{friend.rank}</div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-bold">🏆 {friend.score}</div>
                        <div className="text-gray-500">
                          {new Date(friend.lastActive).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const name = prompt('שם החבר:');
                      if (name) addFriend(name);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold shadow hover:bg-blue-600"
                  >
                    + הוסף חבר
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold mb-4">ערכות נושא</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(THEMES).map(([id, theme]) => (
                  <button
                    key={id}
                    onClick={() => {
                      if (id === 'default' || inventory[`theme_${id}`]) {
                        updateTheme(id as keyof typeof THEMES);
                      }
                    }}
                    className={`p-4 rounded-xl ${theme.primary} text-white text-center ${
                      activeTheme === id ? 'ring-4 ring-yellow-400' : ''
                    } ${id !== 'default' && !inventory[`theme_${id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {id === 'default' ? 'ברירת מחדל' : id}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold mb-4">אוואטרים</h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                {AVATARS.map(avatar => (
                  <button
                    key={avatar.id}
                    onClick={() => {
                      if (avatar.id === 'student' || inventory[`avatar_${avatar.id}`]) {
                        updateAvatar(avatar.id);
                      }
                    }}
                    className={`p-3 rounded-xl text-center ${
                      activeAvatar === avatar.id ? 'bg-blue-500 text-white' : 'bg-gray-100'
                    } ${avatar.id !== 'student' && !inventory[`avatar_${avatar.id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-2xl">{avatar.icon}</div>
                    <div className="text-xs mt-1">{avatar.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold mb-4">תגים</h3>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => inventory[`tag_${tag.id}`] && toggleTag(tag.id)}
                    className={`px-3 py-2 rounded-full flex items-center gap-2 ${
                      activeTags.includes(tag.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100'
                    } ${!inventory[`tag_${tag.id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDailies && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">📅 אתגרי היום</h2>
              <button onClick={() => setShowDailies(false)} className="text-gray-500 hover:text-gray-700">✖️</button>
            </div>
            <div className="grid gap-4">
              {DAILY_CHALLENGES.map(challenge => {
                const isCompleted = dailyChallenges.completed.includes(challenge.id);
                const progress = dailyChallenges.progress[challenge.id] || 0;
                let progressPercent = 0;
                
                switch (challenge.id) {
                  case 'speed_master':
                    progressPercent = Math.min(100, (progress / 5) * 100);
                    break;
                  case 'category_master':
                    progressPercent = Math.min(100, (progress / 10) * 100);
                    break;
                  case 'perfect_streak':
                    progressPercent = Math.min(100, (progress / 15) * 100);
                    break;
                  case 'marathon_hero':
                    progressPercent = Math.min(100, (progress / 20) * 100);
                    break;
                }
                
                return (
                  <div key={challenge.id} className={`p-4 rounded-xl ${isCompleted ? 'bg-green-100' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{challenge.icon}</span>
                        <span className="font-bold">{challenge.name}</span>
                      </div>
                      {isCompleted && <span className="text-green-500 text-2xl">✅</span>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-yellow-600 font-bold">🪙 {challenge.reward}</span>
                      <span className="text-blue-600 font-bold ml-2">✨ {challenge.xp} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {lastAchievement && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-100 border-2 border-yellow-400 rounded-xl px-6 py-3 text-lg font-bold text-yellow-700 shadow-lg flex items-center gap-3 animate-bounce">
          <span className="text-2xl">{lastAchievement.icon}</span>
          <span>הישג חדש: {lastAchievement.name}!</span>
          <span className="text-yellow-600">+{lastAchievement.reward} 🪙</span>
        </div>
      )}
      {bonus && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-100 border-2 border-green-400 rounded-xl px-6 py-3 text-lg font-bold text-green-700 shadow-lg flex items-center gap-3 animate-bounce z-50">
          <span>{bonus.message}</span>
        </div>
      )}
    </main>
  );
} 