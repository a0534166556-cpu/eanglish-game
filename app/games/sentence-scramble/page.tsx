"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';
import { getTranslationWithFallback } from '@/lib/translations';

const SENTENCES_BY_DIFFICULTY = {
  // רמה 1: מתחילים - משפטים קצרים עם מילים פשוטות (3-5 מילים, 3-5 אותיות למילה)
  beginner: [
    { id: 1, lang: "en", text: "I love cats", he: "אני אוהב חתולים" },
    { id: 2, lang: "en", text: "The cat is big", he: "החתול גדול" },
    { id: 3, lang: "en", text: "I drink tea", he: "אני שותה תה" },
    { id: 4, lang: "en", text: "We go to the park", he: "אנחנו הולכים לפארק" },
    { id: 5, lang: "en", text: "He reads a book", he: "הוא קורא ספר" },
    { id: 6, lang: "en", text: "I like blue", he: "אני אוהב כחול" },
    { id: 7, lang: "en", text: "The sun is hot", he: "השמש חמה" },
    { id: 8, lang: "en", text: "Close the door", he: "סגור את הדלת" },
    { id: 9, lang: "en", text: "They eat lunch", he: "הם אוכלים צהריים" },
    { id: 10, lang: "en", text: "Can you help me", he: "אתה יכול לעזור לי" },
    { id: 11, lang: "en", text: "I eat pizza", he: "אני אוכל פיצה" },
    { id: 12, lang: "en", text: "The dog plays", he: "הכלב משחק" },
    { id: 13, lang: "en", text: "She sings a song", he: "היא שרה שיר" },
    { id: 14, lang: "en", text: "We have a car", he: "יש לנו מכונית" },
    { id: 15, lang: "en", text: "Kids play outside", he: "ילדים משחקים בחוץ" },
    { id: 16, lang: "en", text: "I learn English", he: "אני לומד אנגלית" },
    { id: 17, lang: "en", text: "He watches TV", he: "הוא צופה בטלוויזיה" },
    { id: 18, lang: "en", text: "The day is nice", he: "היום נעים" },
    { id: 19, lang: "en", text: "They live here", he: "הם גרים כאן" },
    { id: 20, lang: "en", text: "She likes to dance", he: "היא אוהבת לרקוד" },
    { id: 21, lang: "en", text: "The cat sleeps", he: "החתול ישן" },
    { id: 22, lang: "en", text: "I eat ice cream", he: "אני אוכל גלידה" },
    { id: 23, lang: "en", text: "The dog plays ball", he: "הכלב משחק כדור" },
    { id: 24, lang: "en", text: "She reads a book", he: "היא קוראת ספר" },
    { id: 25, lang: "en", text: "The sun shines", he: "השמש זורחת" },
    { id: 26, lang: "en", text: "I go to the park", he: "אני הולך לפארק" },
    { id: 27, lang: "en", text: "The bird flies", he: "הציפור עפה" },
    { id: 28, lang: "en", text: "He drinks water", he: "הוא שותה מים" },
    { id: 29, lang: "en", text: "The flower is nice", he: "הפרח יפה" },
    { id: 30, lang: "en", text: "I buy milk", he: "אני קונה חלב" },
    { id: 31, lang: "en", text: "The car is red", he: "המכונית אדומה" },
    { id: 32, lang: "en", text: "She wears a dress", he: "היא לובשת שמלה" },
    { id: 33, lang: "en", text: "The tree is tall", he: "העץ גבוה" },
    { id: 34, lang: "en", text: "I play ball", he: "אני משחק כדור" },
    { id: 35, lang: "en", text: "The baby sleeps", he: "התינוק ישן" },
    { id: 36, lang: "en", text: "He writes a note", he: "הוא כותב פתק" },
    { id: 37, lang: "en", text: "The moon is full", he: "הירח מלא" },
    { id: 38, lang: "en", text: "I learn at school", he: "אני לומד בבית ספר" },
    { id: 39, lang: "en", text: "The fish swims", he: "הדג שוחה" },
    { id: 40, lang: "en", text: "She cooks food", he: "היא מבשלת אוכל" },
  ],
  
  // רמה 2: בינוני - משפטים בינוניים עם מילים יומיומיות (5-8 מילים, 4-7 אותיות למילה)
  intermediate: [
    { id: 41, lang: "en", text: "I like to play football", he: "אני אוהב לשחק כדורגל" },
    { id: 42, lang: "en", text: "The cat is sleeping on the sofa", he: "החתול ישן על הספה" },
    { id: 43, lang: "en", text: "She drinks a cup of tea", he: "היא שותה כוס תה" },
    { id: 44, lang: "en", text: "We are going to the park", he: "אנחנו הולכים לפארק" },
    { id: 45, lang: "en", text: "He reads a book every night", he: "הוא קורא ספר כל לילה" },
    { id: 46, lang: "en", text: "My favorite color is blue", he: "הצבע האהוב עליי הוא כחול" },
    { id: 47, lang: "en", text: "The sun is shining today", he: "השמש זורחת היום" },
    { id: 48, lang: "en", text: "Please close the window", he: "בבקשה סגור את החלון" },
    { id: 49, lang: "en", text: "They are eating lunch together", he: "הם אוכלים ארוחת צהריים יחד" },
    { id: 50, lang: "en", text: "Can you help me with homework", he: "אתה יכול לעזור לי עם שיעורי הבית" },
    { id: 51, lang: "en", text: "The dog is playing in the garden", he: "הכלב משחק בגינה" },
    { id: 52, lang: "en", text: "She is singing a song", he: "היא שרה שיר" },
    { id: 53, lang: "en", text: "We have a new car", he: "יש לנו מכונית חדשה" },
    { id: 54, lang: "en", text: "The children are playing outside", he: "הילדים משחקים בחוץ" },
    { id: 55, lang: "en", text: "I want to learn English", he: "אני רוצה ללמוד אנגלית" },
    { id: 56, lang: "en", text: "He is watching television now", he: "הוא צופה בטלוויזיה עכשיו" },
    { id: 57, lang: "en", text: "The weather is very nice today", he: "מזג האוויר נעים היום" },
    { id: 58, lang: "en", text: "They live in a big house", he: "הם גרים בבית גדול" },
    { id: 59, lang: "en", text: "She likes to dance and sing", he: "היא אוהבת לרקוד ולשיר" },
    { id: 60, lang: "en", text: "I need to buy some milk", he: "אני צריך לקנות חלב" },
  ],
  
  // רמה 3: מתקדם - משפטים מורכבים (7-10 מילים, 5-10 אותיות למילה)
  advanced: [
    { id: 61, lang: "en", text: "The students are studying for their exam", he: "התלמידים לומדים למבחן שלהם" },
    { id: 62, lang: "en", text: "We should protect the environment", he: "אנחנו צריכים להגן על הסביבה" },
    { id: 63, lang: "en", text: "I enjoy listening to classical music", he: "אני נהנה להאזין למוזיקה קלאסית" },
    { id: 64, lang: "en", text: "The teacher explains the lesson clearly", he: "המורה מסביר את השיעור בצורה ברורה" },
    { id: 65, lang: "en", text: "They are planning a summer vacation", he: "הם מתכננים חופשת קיץ" },
    { id: 66, lang: "en", text: "She works at a large company", he: "היא עובדת בחברה גדולה" },
    { id: 67, lang: "en", text: "We need to finish this project today", he: "אנחנו צריכים לסיים את הפרויקט היום" },
    { id: 68, lang: "en", text: "The museum has many interesting exhibits", he: "במוזיאון יש הרבה תערוכות מעניינות" },
    { id: 69, lang: "en", text: "He practices piano every afternoon", he: "הוא מתאמן בפסנתר כל אחר הצהריים" },
    { id: 70, lang: "en", text: "The restaurant serves delicious food", he: "המסעדה מגישה אוכל טעים" },
    { id: 71, lang: "en", text: "We should meet at the coffee shop", he: "אנחנו צריכים להיפגש בבית הקפה" },
    { id: 72, lang: "en", text: "The movie starts in ten minutes", he: "הסרט מתחיל בעוד עשר דקות" },
    { id: 73, lang: "en", text: "She speaks three different languages", he: "היא מדברת שלוש שפות שונות" },
    { id: 74, lang: "en", text: "The library has many good books", he: "בספריה יש הרבה ספרים טובים" },
    { id: 75, lang: "en", text: "We celebrate his birthday next week", he: "אנחנו חוגגים את יום ההולדת שלו בשבוע הבא" },
    { id: 76, lang: "en", text: "The doctor is examining the patient", he: "הרופא בודק את החולה" },
    { id: 77, lang: "en", text: "I need to prepare for the interview", he: "אני צריך להתכונן לראיון" },
    { id: 78, lang: "en", text: "The weather forecast predicts rain", he: "תחזית מזג האוויר חוזה גשם" },
    { id: 79, lang: "en", text: "She is learning to play the guitar", he: "היא לומדת לנגן בגיטרה" },
    { id: 80, lang: "en", text: "The traffic is heavy this morning", he: "התנועה כבדה הבוקר" },
  ],
  
  // רמה 4: קיצוני - משפטים מאוד מורכבים (10+ מילים, 7-15 אותיות למילה)
  extreme: [
    { id: 81, lang: "en", text: "The scientists are conducting important research", he: "המדענים עורכים מחקר חשוב" },
    { id: 82, lang: "en", text: "Global warming affects our planet significantly", he: "ההתחממות הגלובלית משפיעה משמעותית על כוכב הלכת שלנו" },
    { id: 83, lang: "en", text: "Technology has changed our lives dramatically", he: "הטכנולוגיה שינתה את חיינו באופן דרמטי" },
    { id: 84, lang: "en", text: "The company launched a new product yesterday", he: "החברה השיקה מוצר חדש אתמול" },
    { id: 85, lang: "en", text: "We must preserve our natural resources", he: "אנחנו חייבים לשמור על המשאבים הטבעיים שלנו" },
    { id: 86, lang: "en", text: "The professor published an interesting article", he: "הפרופסור פרסם מאמר מעניין" },
    { id: 87, lang: "en", text: "Students should develop critical thinking skills", he: "על תלמידים לפתח מיומנויות חשיבה ביקורתית" },
    { id: 88, lang: "en", text: "The government announced new regulations today", he: "הממשלה הודיעה על תקנות חדשות היום" },
    { id: 89, lang: "en", text: "Renewable energy becomes increasingly important", he: "אנרגיה מתחדשת הופכת לחשובה יותר ויותר" },
    { id: 90, lang: "en", text: "The artist created a masterpiece", he: "האמן יצר יצירת מופת" },
    { id: 91, lang: "en", text: "Artificial intelligence transforms modern society", he: "בינה מלאכותית משנה את החברה המודרנית" },
    { id: 92, lang: "en", text: "The pharmaceutical company developed a vaccine", he: "חברת התרופות פיתחה חיסון" },
    { id: 93, lang: "en", text: "Quantum mechanics revolutionized theoretical physics", he: "מכניקת הקוונטים חוללה מהפכה בפיזיקה התיאורטית" },
    { id: 94, lang: "en", text: "The archaeologist discovered ancient artifacts", he: "הארכיאולוג גילה חפצים עתיקים" },
    { id: 95, lang: "en", text: "Biotechnology advances medical treatments significantly", he: "ביוטכנולוגיה מקדמת טיפולים רפואיים באופן משמעותי" },
    { id: 96, lang: "en", text: "The economist analyzed financial market trends", he: "הכלכלן ניתח מגמות בשוק הפיננסי" },
    { id: 97, lang: "en", text: "Nanotechnology enables microscopic engineering applications", he: "ננוטכנולוגיה מאפשרת יישומי הנדסה מיקרוסקופיים" },
    { id: 98, lang: "en", text: "The astrophysicist studies celestial phenomena", he: "האסטרופיזיקאי חוקר תופעות שמימיות" },
    { id: 99, lang: "en", text: "Genetic engineering modifies biological organisms", he: "הנדסה גנטית משנה אורגניזמים ביולוגיים" },
    { id: 100, lang: "en", text: "The neuroscientist investigates brain functions", he: "מדען המוח חוקר תפקודי מוח" },
  ]
};

// שאלות ישנות - לשמירה על תאימות לאחור
const SENTENCES = [
  // English - Easy
  { id: 1, lang: "en", text: "I love to play football", he: "אני אוהב לשחק כדורגל" },
  { id: 2, lang: "en", text: "The cat is sleeping on the sofa", he: "החתול ישן על הספה" },
  { id: 29, lang: "en", text: "The flower is very beautiful", he: "הפרח יפה מאוד" },
  { id: 30, lang: "en", text: "I need to buy some milk", he: "אני צריך לקנות חלב" },
  { id: 31, lang: "en", text: "The car is parked outside", he: "המכונית חונה בחוץ" },
  { id: 32, lang: "en", text: "She is wearing a red dress", he: "היא לובשת שמלה אדומה" },
  { id: 33, lang: "en", text: "The tree is very tall", he: "העץ גבוה מאוד" },
  { id: 34, lang: "en", text: "I like to play football", he: "אני אוהב לשחק כדורגל" },
  { id: 35, lang: "en", text: "The baby is sleeping peacefully", he: "התינוק ישן בשלווה" },
  { id: 36, lang: "en", text: "He is writing a letter", he: "הוא כותב מכתב" },
  { id: 37, lang: "en", text: "The moon is full tonight", he: "הירח מלא הלילה" },
  { id: 38, lang: "en", text: "I want to learn English", he: "אני רוצה ללמוד אנגלית" },
  { id: 39, lang: "en", text: "The fish is swimming in the pond", he: "הדג שוחה בבריכה" },
  { id: 40, lang: "en", text: "She is cooking dinner", he: "היא מבשלת ארוחת ערב" },

  // English - Medium
  { id: 41, lang: "en", text: "The students are studying for their exam", he: "התלמידים לומדים למבחן שלהם" },
  { id: 42, lang: "en", text: "We should protect the environment", he: "אנחנו צריכים להגן על הסביבה" },
  { id: 43, lang: "en", text: "I enjoy listening to classical music", he: "אני נהנה להאזין למוזיקה קלאסית" },
  { id: 44, lang: "en", text: "The teacher explains the lesson clearly", he: "המורה מסביר את השיעור בצורה ברורה" },
  { id: 45, lang: "en", text: "They are planning a summer vacation", he: "הם מתכננים חופשת קיץ" },
  { id: 46, lang: "en", text: "She works at a large company", he: "היא עובדת בחברה גדולה" },
  { id: 47, lang: "en", text: "We need to finish this project today", he: "אנחנו צריכים לסיים את הפרויקט היום" },
  { id: 48, lang: "en", text: "The museum has many interesting exhibits", he: "במוזיאון יש הרבה תערוכות מעניינות" },
  { id: 49, lang: "en", text: "He practices piano every afternoon", he: "הוא מתאמן בפסנתר כל אחר הצהריים" },
  { id: 50, lang: "en", text: "The restaurant serves delicious food", he: "המסעדה מגישה אוכל טעים" },
  { id: 51, lang: "en", text: "We should meet at the coffee shop", he: "אנחנו צריכים להיפגש בבית הקפה" },
  { id: 52, lang: "en", text: "The movie starts in ten minutes", he: "הסרט מתחיל בעוד עשר דקות" },
  { id: 53, lang: "en", text: "She speaks three different languages", he: "היא מדברת שלוש שפות שונות" },
  { id: 54, lang: "en", text: "The library has many good books", he: "בספריה יש הרבה ספרים טובים" },
  { id: 55, lang: "en", text: "We celebrate his birthday next week", he: "אנחנו חוגגים את יום ההולדת שלו בשבוע הבא" },
  { id: 56, lang: "en", text: "The doctor is examining the patient", he: "הרופא בודק את החולה" },
  { id: 57, lang: "en", text: "I need to prepare for the interview", he: "אני צריך להתכונן לראיון" },
  { id: 58, lang: "en", text: "The weather forecast predicts rain", he: "תחזית מזג האוויר חוזה גשם" },
  { id: 59, lang: "en", text: "She is learning to play the guitar", he: "היא לומדת לנגן בגיטרה" },
  { id: 60, lang: "en", text: "The traffic is heavy this morning", he: "התנועה כבדה הבוקר" },
  { id: 61, lang: "en", text: "We should book our hotel in advance", he: "אנחנו צריכים להזמין את המלון מראש" },
  { id: 62, lang: "en", text: "The computer is running very slowly", he: "המחשב רץ מאוד לאט" },
  { id: 63, lang: "en", text: "I enjoy reading science fiction novels", he: "אני נהנה לקרוא רומנים מדע בדיוני" },
  { id: 64, lang: "en", text: "The meeting has been postponed until tomorrow", he: "הפגישה נדחתה למחר" },
  { id: 65, lang: "en", text: "She is applying for a new job", he: "היא מגישה מועמדות לעבודה חדשה" },
  { id: 66, lang: "en", text: "The children are playing in the garden", he: "הילדים משחקים בגינה" },
  { id: 67, lang: "en", text: "I need to update my resume", he: "אני צריך לעדכן את הקורות חיים שלי" },
  { id: 68, lang: "en", text: "The store is having a big sale", he: "החנות עושה מכירה גדולה" },
  { id: 69, lang: "en", text: "We should save money for the future", he: "אנחנו צריכים לחסוך כסף לעתיד" },
  { id: 70, lang: "en", text: "The train is delayed by thirty minutes", he: "הרכבת מתעכבת בשלושים דקות" },

  // English - Hard
  { id: 36, lang: "en", text: "The scientists are conducting important research", he: "המדענים עורכים מחקר חשוב" },
  { id: 37, lang: "en", text: "Global warming affects our planet significantly", he: "ההתחממות הגלובלית משפיעה משמעותית על כוכב הלכת שלנו" },
  { id: 38, lang: "en", text: "Technology has changed our lives dramatically", he: "הטכנולוגיה שינתה את חיינו באופן דרמטי" },
  { id: 39, lang: "en", text: "The company launched a new product yesterday", he: "החברה השיקה מוצר חדש אתמול" },
  { id: 40, lang: "en", text: "We must preserve our natural resources", he: "אנחנו חייבים לשמור על המשאבים הטבעיים שלנו" },
  { id: 41, lang: "en", text: "The professor published an interesting article", he: "הפרופסור פרסם מאמר מעניין" },
  { id: 42, lang: "en", text: "Students should develop critical thinking skills", he: "על תלמידים לפתח מיומנויות חשיבה ביקורתית" },
  { id: 43, lang: "en", text: "The government announced new regulations today", he: "הממשלה הודיעה על תקנות חדשות היום" },
  { id: 44, lang: "en", text: "Renewable energy becomes increasingly important", he: "אנרגיה מתחדשת הופכת לחשובה יותר ויותר" },
  { id: 45, lang: "en", text: "The artist created a masterpiece", he: "האמן יצר יצירת מופת" },

  // Hebrew - Easy
  { id: 101, lang: "he", text: "אני אוהב ללמוד אנגלית" },
  { id: 102, lang: "he", text: "החתול יושב על הכיסא" },
  { id: 103, lang: "he", text: "הילדה שותה מים קרים" },
  { id: 104, lang: "he", text: "אנחנו הולכים לים" },
  { id: 105, lang: "he", text: "הוא משחק כדורגל עם חברים" },
  { id: 106, lang: "he", text: "היום השמש זורחת" },
  { id: 107, lang: "he", text: "האם תוכל לעזור לי" },
  { id: 108, lang: "he", text: "הספר מונח על השולחן" },
  { id: 109, lang: "he", text: "הם אוכלים ארוחת צהריים" },
  { id: 110, lang: "he", text: "בבקשה סגור את החלון" },
  { id: 111, lang: "he", text: "אני רוצה גלידה" },
  { id: 112, lang: "he", text: "הכלב רץ בגינה" },
  { id: 113, lang: "he", text: "היא קוראת ספר מעניין" },
  { id: 114, lang: "he", text: "אנחנו נוסעים לטיול" },
  { id: 115, lang: "he", text: "הילדים משחקים בחוץ" },
  { id: 116, lang: "he", text: "השמיים כחולים היום" },
  { id: 117, lang: "he", text: "אני אוהב לשחק כדורסל" },
  { id: 118, lang: "he", text: "היא שרה שיר יפה" },
  { id: 119, lang: "he", text: "הוא צופה בטלוויזיה" },
  { id: 120, lang: "he", text: "אנחנו הולכים למסעדה" },

  // Hebrew - Medium
  { id: 121, lang: "he", text: "התלמידים לומדים למבחן חשוב" },
  { id: 122, lang: "he", text: "המורה מסבירה את השיעור" },
  { id: 123, lang: "he", text: "אנחנו מתכננים טיול משפחתי" },
  { id: 124, lang: "he", text: "היא עובדת בחברת הייטק" },
  { id: 125, lang: "he", text: "הוא מנגן על פסנתר" },
  { id: 126, lang: "he", text: "המוזיאון מציג תערוכה חדשה" },
  { id: 127, lang: "he", text: "אנחנו צריכים לסיים את הפרויקט" },
  { id: 128, lang: "he", text: "היא מדברת שלוש שפות" },
  { id: 129, lang: "he", text: "הספרייה פתוחה כל יום" },
  { id: 130, lang: "he", text: "אנחנו חוגגים יום הולדת" },
  { id: 131, lang: "he", text: "המסעדה מגישה אוכל טעים" },
  { id: 132, lang: "he", text: "הסרט מתחיל בשמונה בערב" },
  { id: 133, lang: "he", text: "הם נפגשים בבית קפה" },
  { id: 134, lang: "he", text: "היא כותבת סיפור מעניין" },
  { id: 135, lang: "he", text: "אנחנו שומרים על הסביבה" },

  // Hebrew - Hard
  { id: 136, lang: "he", text: "המדענים עורכים מחקר חשוב" },
  { id: 137, lang: "he", text: "הטכנולוגיה משנה את חיינו" },
  { id: 138, lang: "he", text: "החברה השיקה מוצר חדש" },
  { id: 139, lang: "he", text: "אנחנו מפתחים תוכנה חדשנית" },
  { id: 140, lang: "he", text: "הממשלה הודיעה על רפורמה" },
  { id: 141, lang: "he", text: "הפרופסור פרסם מאמר מדעי" },
  { id: 142, lang: "he", text: "אנרגיה מתחדשת חשובה לעתיד" },
  { id: 143, lang: "he", text: "התלמידים מפתחים חשיבה ביקורתית" },
  { id: 144, lang: "he", text: "האמן יצר יצירת אמנות" },
  { id: 145, lang: "he", text: "החוקרים גילו תגלית חדשה" }
];

const difficulties = [
  { key: "easy", label: "קל", min: 0, max: 4, count: 20 },
  { key: "medium", label: "בינוני", min: 5, max: 7, count: 20 },
  { key: "hard", label: "קשה", min: 8, max: 9, count: 20 },
  { key: "extreme", label: "אקסטרים", min: 10, max: 15, count: 20 },
];

const levelLabels: Record<string, { label: string, icon: string, color: string }> = {
  easy: { label: 'קל', icon: '🌱', color: 'from-green-400 to-green-600' },
  medium: { label: 'בינוני', icon: '🌿', color: 'from-yellow-400 to-yellow-600' },
  hard: { label: 'קשה', icon: '🌳', color: 'from-purple-400 to-purple-600' },
  extreme: { label: 'אקסטרים', icon: '🔥', color: 'from-red-500 to-yellow-600' },
};

const levelMap: Record<string, string> = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
  extreme: 'extreme',
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};

function shuffle(arr: string[]) {
  return arr
    .map((v) => ({ v, s: Math.random() }))
    .sort((a, b) => a.s - b.s)
    .map(({ v }) => v);
}

function getMistakeStats() {
  try {
    return JSON.parse(localStorage.getItem('ss-mistakes') || '{}');
  } catch {
    return {};
  }
}

function addMistake(id: number) {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('ss-mistakes', JSON.stringify(stats));
}

function pickSentences(all: typeof SENTENCES, lang: string, count: number) {
  const pool = all.filter((s: typeof SENTENCES[number]) => s.lang === lang);
  const stats = getMistakeStats();
  const sorted = [...pool].sort((a, b) => (stats[b.id] || 0) - (stats[a.id] || 0));
  const boosted = sorted.filter((s: typeof SENTENCES[number]) => stats[s.id] > 0).slice(0, 5);
  const rest = pool.filter((s: typeof SENTENCES[number]) => !boosted.includes(s));
  const randomRest = rest.sort(() => Math.random() - 0.5).slice(0, count - boosted.length);
  return [...boosted, ...randomRest].sort(() => Math.random() - 0.5);
}

export default function SentenceScrambleWrapper() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <SentenceScramble />
    </Suspense>
  );
}

function SentenceScramble() {
  const { user } = useAuthUser();
  const searchParams = useSearchParams();
  const levelParam = searchParams?.get('level') || 'easy';
  const mappedLevel = levelMap[levelParam] || 'easy';
  const [difficulty, setDifficulty] = useState(mappedLevel);
  const [lang, setLang] = useState<"en" | "he">("en");
  
  // בחירת משפטים לפי רמת קושי
  const getSentencesByDifficulty = (level: string) => {
    const difficultyMap: Record<string, keyof typeof SENTENCES_BY_DIFFICULTY> = {
      'easy': 'beginner',
      'medium': 'intermediate',
      'hard': 'advanced',
      'extreme': 'extreme'
    };
    return SENTENCES_BY_DIFFICULTY[difficultyMap[level] || 'beginner'];
  };
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const progress = questions.length > 0 ? ((currentIdx) / questions.length) * 100 : 0;
  const isRTL = lang === 'he';
  const selectedContainerRef = useRef<HTMLDivElement>(null);
  const successAudio = useRef<HTMLAudioElement>(null);
  const failAudio = useRef<HTMLAudioElement>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [inventory, setInventory] = useState<{[key: string]: number}>({});
  const [learnedWordsList, setLearnedWordsList] = useState<Array<{word: string, translation: string}>>([]);
  const [hintMsg, setHintMsg] = useState<string | null>(null);
  const [useLearnedWords, setUseLearnedWords] = useState(false);
  const [learnedWordsData, setLearnedWordsData] = useState<Array<{word: string, translation: string}>>([]);
  const [loadingLearnedWords, setLoadingLearnedWords] = useState(false);
  const [selectedWordsCount, setSelectedWordsCount] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<Array<{word: string, translation: string}>>([]);
  const [showWordSelector, setShowWordSelector] = useState(false);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started]);

  // טען מילים שנלמדו מה-API
  const loadLearnedWords = async () => {
    if (!user) {
      console.log('Cannot load learned words - no user logged in');
      return;
    }
    
    try {
      setLoadingLearnedWords(true);
      const response = await fetch(`/api/learned-words?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load learned words');
      }
      
      const data = await response.json();
      const words = data.learnedWords || [];
      
      setLearnedWordsData(words);
      console.log('Loaded learned words:', words.length);
    } catch (error) {
      console.error('Error loading learned words:', error);
      setLearnedWordsData([]);
    } finally {
      setLoadingLearnedWords(false);
    }
  };

  // המר מילים שנלמדו למשפטים
  const createSentencesFromLearnedWords = (words: Array<{word: string, translation: string}>, count: number): any[] => {
    const sentences: any[] = [];
    const usedWords = new Set<string>();
    
    // פונקציה לזיהוי סוג המילה (בסיסי)
    const getWordCategory = (word: string, translation: string): 'vehicle' | 'food' | 'animal' | 'object' | 'action' | 'person' | 'place' | 'other' => {
      const wordLower = word.toLowerCase();
      const transLower = translation.toLowerCase();
      
      // כלי תחבורה
      if (wordLower.match(/\b(bus|car|train|bike|bicycle|plane|airplane|boat|ship|truck|motorcycle|submarine|rocket|ambulance|tractor)\b/)) {
        return 'vehicle';
      }
      
      // אוכל
      if (wordLower.match(/\b(apple|banana|pizza|bread|milk|water|tea|coffee|juice|meat|fish|chicken|rice|pasta|soup|salad|cake|cookie|ice cream|chocolate|candy|grapes)\b/)) {
        return 'food';
      }
      
      // בעלי חיים
      if (wordLower.match(/\b(cat|dog|bird|fish|elephant|lion|tiger|bear|monkey|giraffe|zebra|panda|koala|penguin|whale|dolphin|turtle|rabbit|fox|wolf|deer|camel|kangaroo|crocodile)\b/)) {
        return 'animal';
      }
      
      // פעולות
      if (wordLower.match(/\b(play|eat|drink|read|write|run|walk|jump|sing|dance|sleep|wake|see|watch|listen|speak|talk|learn|teach|work|study|help|buy|sell|give|take|go|come|make|do|have|like|love|want|need|can|will|should|must)\b/)) {
        return 'action';
      }
      
      // אנשים
      if (wordLower.match(/\b(teacher|student|doctor|nurse|friend|parent|child|baby|boy|girl|man|woman|person|people)\b/)) {
        return 'person';
      }
      
      // מקומות
      if (wordLower.match(/\b(park|school|home|house|store|shop|restaurant|library|hospital|beach|garden|room|kitchen|bedroom|bathroom)\b/)) {
        return 'place';
      }
      
      return 'other';
    };
    
    // טמפלטים מותאמים לפי קטגוריה
    const getTemplatesForCategory = (category: string): Array<(w: string, t: string) => {en: string, he: string}> => {
      switch (category) {
        case 'vehicle':
          return [
            (w: string, t: string) => ({ en: `I take the ${w} to school`, he: `אני לוקח את ה${t} לבית ספר` }),
            (w: string, t: string) => ({ en: `The ${w} is fast`, he: `ה${t} מהיר` }),
            (w: string, t: string) => ({ en: `I see a ${w}`, he: `אני רואה ${t}` }),
            (w: string, t: string) => ({ en: `The ${w} is red`, he: `ה${t} אדום` }),
            (w: string, t: string) => ({ en: `I drive a ${w}`, he: `אני נוהג ב${t}` }),
          ];
        case 'food':
          return [
            (w: string, t: string) => ({ en: `I eat ${w}`, he: `אני אוכל ${t}` }),
            (w: string, t: string) => ({ en: `I like ${w}`, he: `אני אוהב ${t}` }),
            (w: string, t: string) => ({ en: `The ${w} is good`, he: `ה${t} טעים` }),
            (w: string, t: string) => ({ en: `I buy ${w}`, he: `אני קונה ${t}` }),
            (w: string, t: string) => ({ en: `I want ${w}`, he: `אני רוצה ${t}` }),
          ];
        case 'animal':
          return [
            (w: string, t: string) => ({ en: `The ${w} is big`, he: `ה${t} גדול` }),
            (w: string, t: string) => ({ en: `I see a ${w}`, he: `אני רואה ${t}` }),
            (w: string, t: string) => ({ en: `The ${w} is cute`, he: `ה${t} חמוד` }),
            (w: string, t: string) => ({ en: `I like the ${w}`, he: `אני אוהב את ה${t}` }),
            (w: string, t: string) => ({ en: `The ${w} runs fast`, he: `ה${t} רץ מהר` }),
          ];
        case 'action':
          return [
            (w: string, t: string) => ({ en: `I ${w} every day`, he: `אני ${t} כל יום` }),
            (w: string, t: string) => ({ en: `I can ${w}`, he: `אני יכול ${t}` }),
            (w: string, t: string) => ({ en: `I like to ${w}`, he: `אני אוהב ${t}` }),
            (w: string, t: string) => ({ en: `I will ${w}`, he: `אני ${t}` }),
            (w: string, t: string) => ({ en: `I want to ${w}`, he: `אני רוצה ${t}` }),
          ];
        case 'person':
          return [
            (w: string, t: string) => ({ en: `The ${w} is nice`, he: `ה${t} נחמד` }),
            (w: string, t: string) => ({ en: `I see a ${w}`, he: `אני רואה ${t}` }),
            (w: string, t: string) => ({ en: `The ${w} helps me`, he: `ה${t} עוזר לי` }),
            (w: string, t: string) => ({ en: `I like the ${w}`, he: `אני אוהב את ה${t}` }),
          ];
        case 'place':
          return [
            (w: string, t: string) => ({ en: `I go to the ${w}`, he: `אני הולך ל${t}` }),
            (w: string, t: string) => ({ en: `The ${w} is big`, he: `ה${t} גדול` }),
            (w: string, t: string) => ({ en: `I like the ${w}`, he: `אני אוהב את ה${t}` }),
            (w: string, t: string) => ({ en: `The ${w} is near`, he: `ה${t} קרוב` }),
          ];
        default:
          return [
            (w: string, t: string) => ({ en: `I see a ${w}`, he: `אני רואה ${t}` }),
            (w: string, t: string) => ({ en: `I have a ${w}`, he: `יש לי ${t}` }),
            (w: string, t: string) => ({ en: `The ${w} is good`, he: `ה${t} טוב` }),
            (w: string, t: string) => ({ en: `I like the ${w}`, he: `אני אוהב את ה${t}` }),
            (w: string, t: string) => ({ en: `I use a ${w}`, he: `אני משתמש ב${t}` }),
          ];
      }
    };
    
    words.forEach((wordData, index) => {
      if (sentences.length >= count) return;
      if (usedWords.has(wordData.word.toLowerCase())) return;
      
      const word = wordData.word;
      const translation = getTranslationWithFallback(word, undefined, wordData.translation || word);
      
      // נסה למצוא משפט קיים שכולל את המילה
      const existingSentence = Object.values(SENTENCES_BY_DIFFICULTY).flat().find(s => 
        s.text.toLowerCase().includes(word.toLowerCase())
      );
      
      if (existingSentence) {
        sentences.push(existingSentence);
        usedWords.add(word.toLowerCase());
      } else {
        // זהה את הקטגוריה של המילה
        const category = getWordCategory(word, translation);
        const templates = getTemplatesForCategory(category);
        
        // בחר טמפלט אקראי מהקטגוריה
        const template = templates[index % templates.length];
        const sentence = template(word, translation);
        
        sentences.push({
          id: 10000 + index,
          lang: 'en',
          text: sentence.en,
          he: sentence.he
        });
        usedWords.add(word.toLowerCase());
      }
    });
    
    return sentences.slice(0, count);
  };

  useEffect(() => {
    const diff = difficulties.find((d) => d.key === difficulty)!;
    
    if (useLearnedWords && learnedWordsData.length > 0) {
      // השתמש במילים שנלמדו - קודם כל בדוק אם יש מילים שנבחרו ספציפית
      let wordsToUse: Array<{word: string, translation: string}>;
      if (selectedWords.length > 0) {
        // אם יש מילים שנבחרו ספציפית, השתמש בהן
        wordsToUse = selectedWords;
      } else if (selectedWordsCount !== null) {
        // אם יש כמות נבחרת, בחר אקראית מהמילים
        wordsToUse = [...learnedWordsData].sort(() => Math.random() - 0.5).slice(0, selectedWordsCount);
      } else {
        // אחרת, השתמש בכל המילים
        wordsToUse = learnedWordsData;
      }
      
      const learnedSentences = createSentencesFromLearnedWords(wordsToUse, diff.count);
      if (learnedSentences.length > 0) {
        setQuestions(learnedSentences);
      } else {
        // אם אין מספיק משפטים, השתמש במשפטים רגילים
        const levelSentences = getSentencesByDifficulty(difficulty);
        setQuestions(pickSentences(levelSentences, lang, diff.count));
      }
    } else {
    // Get sentences by difficulty level from SENTENCES_BY_DIFFICULTY
    const levelSentences = getSentencesByDifficulty(difficulty);
    setQuestions(pickSentences(levelSentences, lang, diff.count));
    }
    
    setCurrentIdx(0);
    setScore(0);
    setTimer(0);
    setGameOver(false);
    setFeedback(null);
    setStarted(false);
    setSelected([]);
    setScrambled([]);
  }, [difficulty, lang, useLearnedWords, learnedWordsData, selectedWordsCount, selectedWords]);

  // טען מילים שנלמדו כשהמשתמש בוחר במצב learned words
  useEffect(() => {
    if (useLearnedWords && user && learnedWordsData.length === 0 && !loadingLearnedWords) {
      loadLearnedWords();
    }
  }, [useLearnedWords, user]);

  useEffect(() => {
    if (questions.length > 0 && started) {
      const words = questions[currentIdx].text.split(" ");
      setScrambled(shuffle(words));
      setSelected([]);
    }
  }, [currentIdx, questions, started]);

  useEffect(() => {
    try {
      const inv = JSON.parse(localStorage.getItem('quiz-inventory') || '{}');
      setInventory(inv);
      console.log('Loaded inventory from localStorage (sentence-scramble):', inv);
    } catch {
      console.log('Failed to load inventory from localStorage (sentence-scramble)');
    }
  }, []);

  const handleSelect = (word: string, idx: number) => {
    setSelected((prev) => [...prev, word]);
    setScrambled((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUnselect = (idx: number) => {
    setScrambled((prev) => [...prev, selected[idx]]);
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveLearnedWord = async (word: string, translation: string, isCorrect: boolean) => {
    if (!user) {
      console.log('Cannot save word - no user logged in');
      return;
    }
    
    try {
      // ודא שהתרגום הוא הנכון - קודם כל מהמילון הבסיסי
      let finalTranslation = getTranslationForWord(word);
      
      // אם אין במילון, נסה להשתמש בתרגום שקיבלנו (אבל רק אם הוא טוב)
      if (!finalTranslation && translation && translation !== word && !translation.includes('המילה') && !translation.includes('באנגלית')) {
        // בדוק אם התרגום הוא מילה אחת או שתיים (לא משפט ארוך)
        if (translation.split(/\s+/).length <= 2) {
          finalTranslation = translation;
        }
      }
      
      // אם אין תרגום טוב, שמור את המילה עם התרגום "לא ידוע"
      if (!finalTranslation || finalTranslation === word || finalTranslation.includes('המילה') || finalTranslation.includes('באנגלית')) {
        finalTranslation = 'לא ידוע';
      }
      
      console.log(`Saving word: ${word} (${finalTranslation})`);
      const response = await fetch('/api/learned-words/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          word: word,
          translation: finalTranslation,
          gameName: 'SentenceScramble',
          difficulty: difficulty,
          isCorrect: isCorrect
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Failed to save word "${word}":`, response.status, errorData);
        throw new Error(`Failed to save word: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to save learned word "${word}":`, error);
      throw error;
    }
  };

  const handleCheck = () => {
    const isCorrect = selected.join(' ') === questions[currentIdx].text;
    
    if (isCorrect) {
      setScore((s) => s + 10);
      setFeedback('נכון!');
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play();
      }
    } else {
      setScore((s) => Math.max(0, s - 2)); // עונש של 2 נקודות על טעות
      addMistake(questions[currentIdx].id);
      setFeedback('לא נכון');
      if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play();
      }
    }
    
    // שמור מילים נלמדות - רק אם המשחק לא עם מילים שנלמדו
    if (!useLearnedWords) {
    const currentQuestion = questions[currentIdx];
      if (currentQuestion && currentQuestion.lang === 'en') {
        // שמור מילים בודדות מהמשפט (לא את המשפט המלא)
        const words = extractEnglishWords(currentQuestion.text);
      
      words.forEach((word: string) => {
          // הפונקציה saveLearnedWord תבדוק את התרגום מהמילון
        saveLearnedWord(word, word, isCorrect);
      });
      }
    }
    
    setShowAnswer(true);
  };

  // פונקציה לחילוץ מילים אנגליות מטקסט
  const extractEnglishWords = (text: string): string[] => {
    if (!text) return [];
    const englishWords = text.match(/[A-Za-z]+/g) || [];
    return englishWords
      .map(word => word.toLowerCase())
      .filter(word => 
        word.length > 2 && 
        !['the', 'and', 'is', 'are', 'was', 'were', 'has', 'have', 'had', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from'].includes(word)
      );
  };

  // אסוף את כל המילים מכל השאלות במשחק
  // מילון תרגומים מקומי - אם מילה לא נמצאת כאן, יחפש במילון המרכזי
  const getTranslationForWord = (word: string): string | null => {
    const wordLower = word.toLowerCase();
    
    // מילון תרגומים מקומי (נשאר כמו שהיה)
    const localTranslations: Record<string, string> = {
      // בעלי חיים
      'dog': 'כלב', 'cat': 'חתול', 'cats': 'חתולים', 'bird': 'ציפור', 'fish': 'דג',
      'cow': 'פרה', 'elephant': 'פיל', 'mouse': 'עכבר',
      // אוכל
      'apple': 'תפוח', 'banana': 'בננה', 'water': 'מים', 'milk': 'חלב', 'tea': 'תה',
      'bread': 'לחם', 'rice': 'אורז', 'cake': 'עוגה', 'soup': 'מרק', 'egg': 'ביצה',
      'pasta': 'פסטה', 'honey': 'דבש', 'ice': 'קרח', 'cream': 'גלידה',
      'ice cream': 'גלידה', 'pizza': 'פיצה', 'lunch': 'ארוחת צהריים',
      // חפצים
      'book': 'ספר', 'pen': 'עט', 'cup': 'כוס', 'ball': 'כדור', 'hat': 'כובע',
      'shoes': 'נעליים', 'shoe': 'נעל', 'chair': 'כיסא', 'bed': 'מיטה', 'bike': 'אופניים',
      'camera': 'מצלמה', 'television': 'טלוויזיה', 'tv': 'טלוויזיה',
      'clock': 'שעון', 'key': 'מפתח', 'blanket': 'שמיכה',
      'toothbrush': 'מברשת שיניים', 'phone': 'טלפון', 'pillow': 'כרית',
      'socks': 'גרביים', 'gloves': 'כפפות', 'shirt': 'חולצה', 'spoon': 'כפית',
      'scissors': 'מספריים', 'fork': 'מזלג', 'knife': 'סכין', 'broom': 'מטאטא',
      'bag': 'תיק', 'hammer': 'פטיש', 'lock': 'מנעול',
      'towel': 'מגבת', 'stove': 'כיריים', 'ruler': 'סרגל', 'door': 'דלת',
      'window': 'חלון', 'sofa': 'ספה', 'note': 'פתק',
      // טבע
      'sun': 'שמש', 'moon': 'ירח', 'sky': 'שמיים', 'tree': 'עץ', 'flower': 'פרח',
      'grass': 'דשא', 'cloud': 'ענן', 'snow': 'שלג', 'rain': 'גשם', 'sea': 'ים',
      'hill': 'גבעה', 'mountain': 'הר', 'ocean': 'אוקיינוס', 'forest': 'יער',
      'volcano': 'הר געש', 'river': 'נהר', 'rainbow': 'קשת', 'cave': 'מערה',
      'fire': 'אש', 'thunder': 'רעם', 'weather': 'מזג אוויר',
      // אנשים
      'mom': 'אמא', 'dad': 'אבא', 'sister': 'אחות', 'brother': 'אח', 'family': 'משפחה',
      'daughter': 'בת', 'son': 'בן', 'father': 'אבא', 'mother': 'אמא',
      'grandmother': 'סבתא', 'teenager': 'נער', 'friend': 'חבר', 'teacher': 'מורה',
      'baby': 'תינוק', 'child': 'ילד', 'children': 'ילדים', 'kids': 'ילדים',
      'student': 'תלמיד', 'students': 'תלמידים', 'doctor': 'רופא', 'patient': 'חולה',
      // מקומות
      'home': 'בית', 'school': 'בית ספר', 'house': 'בית', 'bedroom': 'חדר שינה',
      'kitchen': 'מטבח', 'living room': 'סלון', 'bathroom': 'חדר אמבטיה',
      'garage': 'מוסך', 'garden': 'גינה', 'basement': 'מרתף', 'library': 'ספרייה',
      'office': 'משרד', 'park': 'פארק', 'restaurant': 'מסעדה', 'museum': 'מוזיאון',
      'coffee shop': 'בית קפה', 'movie': 'סרט', 'traffic': 'תנועה',
      // תחבורה
      'car': 'מכונית', 'bus': 'אוטובוס', 'airplane': 'מטוס', 'train': 'רכבת',
      'boat': 'סירה', 'motorcycle': 'אופנוע', 'taxi': 'מונית', 'bicycle': 'אופניים',
      'ship': 'אונייה', 'subway': 'רכבת תחתית', 'truck': 'משאית', 'scooter': 'קורקינט',
      // תכונות
      'soft': 'רך', 'hard': 'קשה', 'big': 'גדול', 'small': 'קטן', 'hot': 'חם',
      'cold': 'קר', 'sweet': 'מתוק', 'sour': 'חמוץ', 'round': 'עגול', 'loud': 'רועש',
      'tall': 'גבוה', 'fast': 'מהיר', 'green': 'ירוק', 'yellow': 'צהוב', 'white': 'לבן',
      'red': 'אדום', 'blue': 'כחול', 'nice': 'נחמד', 'full': 'מלא', 'new': 'חדש',
      'delicious': 'טעים', 'interesting': 'מעניין', 'good': 'טוב', 'large': 'גדול',
      'heavy': 'כבד', 'clear': 'ברור',
      // חומרים
      'metal': 'מתכת', 'rock': 'סלע', 'stone': 'אבן', 'wood': 'עץ', 'glass': 'זכוכית',
      'plastic': 'פלסטיק', 'gold': 'זהב', 'diamond': 'יהלום', 'sand': 'חול',
      // חלקי גוף
      'hand': 'יד', 'eye': 'עין', 'ear': 'אוזן', 'nose': 'אף', 'mouth': 'פה',
      'eyes': 'עיניים', 'ears': 'אוזניים',
      // ימים וחודשים
      'monday': 'יום שני', 'friday': 'יום שישי', 'winter': 'חורף',
      'january': 'ינואר', 'summer': 'קיץ', 'today': 'היום', 'night': 'לילה',
      'afternoon': 'אחר הצהריים', 'morning': 'בוקר', 'week': 'שבוע', 'minutes': 'דקות',
      'ten': 'עשר', 'next': 'הבא',
      // פעולות
      'love': 'אוהב', 'drink': 'שותה', 'go': 'הולך', 'reads': 'קורא', 'read': 'קורא',
      'like': 'אוהב', 'likes': 'אוהב', 'eat': 'אוכל', 'plays': 'משחק', 'play': 'משחק',
      'sings': 'שרה', 'sing': 'שרה', 'song': 'שיר', 'have': 'יש', 'learn': 'לומד',
      'learns': 'לומד', 'watches': 'צופה', 'watch': 'צופה', 'sleeps': 'ישן', 'sleep': 'ישן',
      'shines': 'זורחת', 'shine': 'זורחת', 'flies': 'עפה', 'fly': 'עף', 'wears': 'לובשת',
      'wear': 'לובש', 'writes': 'כותב', 'write': 'כותב', 'swims': 'שוחה', 'swim': 'שוחה',
      'cooks': 'מבשלת', 'cook': 'מבשל', 'buy': 'קונה', 'help': 'עוזר', 'close': 'סוגר',
      'live': 'גר', 'lives': 'גר', 'dance': 'רוקד', 'need': 'צריך', 'celebrate': 'חוגג',
      'examines': 'בודק', 'examine': 'בודק', 'prepares': 'מתכונן', 'prepare': 'מתכונן',
      'predicts': 'חוזה', 'predict': 'חוזה', 'practices': 'מתאמן', 'practice': 'מתאמן',
      'speaks': 'מדבר', 'speak': 'מדבר', 'serves': 'מגיש', 'serve': 'מגיש', 'meet': 'נפגש',
      'starts': 'מתחיל', 'start': 'מתחיל', 'protect': 'מגן', 'finish': 'מסיים',
      // בגדים
      'clothes': 'בגדים', 'dress': 'שמלה',
      // צבעים
      'color': 'צבע', 'favorite': 'אהוב',
      // שפות
      'english': 'אנגלית', 'languages': 'שפות', 'language': 'שפה',
      // מוזיקה
      'music': 'מוזיקה', 'classical': 'קלאסית', 'piano': 'פסנתר', 'guitar': 'גיטרה',
      // ספורט
      'football': 'כדורגל', 'sports': 'ספורט',
      // זמן
      'time': 'זמן', 'day': 'יום', 'every': 'כל',
      // מילים נוספות
      'food': 'אוכל', 'outside': 'חוץ', 'here': 'כאן', 'together': 'יחד',
      'homework': 'שיעורי בית', 'project': 'פרויקט', 'exam': 'מבחן', 'interview': 'ראיון',
      'exhibits': 'תערוכות', 'exhibit': 'תערוכה', 'vacation': 'חופשה', 'birthday': 'יום הולדת',
      'forecast': 'תחזית', 'company': 'חברה', 'environment': 'סביבה', 'lesson': 'שיעור',
    };
    
    // חפש קודם במילון המקומי, ואם לא נמצא - במילון המרכזי
    const translation = getTranslationWithFallback(wordLower, localTranslations, '');
    return translation || null;
  };

  const collectAllWordsFromGame = () => {
    const wordsMap = new Map<string, string>();
    
    if (!questions || questions.length === 0) {
      return [];
    }
    
    questions.forEach((question) => {
      // חילוץ מילים מהמשפט (רק אם זה אנגלית)
      if (question.text && question.lang === 'en') {
        const textWords = extractEnglishWords(question.text);
        textWords.forEach(word => {
          if (!wordsMap.has(word.toLowerCase())) {
            // נסה למצוא תרגום מהמילון הבסיסי
            let translation = getTranslationForWord(word);
            
            // אם יש תרגום טוב, שמור אותו
            if (translation && translation !== word) {
              wordsMap.set(word.toLowerCase(), translation);
            }
          }
        });
      }
    });
    
    // החזר רק מילים עם תרגום תקף
    return Array.from(wordsMap.entries())
      .filter(([word, translation]) => translation && translation !== word)
      .map(([word, translation]) => ({
      word,
        translation: translation
    }));
  };

  const handleNext = async () => {
    setFeedback(null);
    setShowAnswer(false);
    if (currentIdx === questions.length - 1) {
      // זה השאלה האחרונה - אסוף את כל המילים לפני סיום המשחק
      console.log('Game finished! Collecting words...');
      const allWords = collectAllWordsFromGame();
      console.log('All collected words:', allWords);
      
      // עדכן את ה-state עם המילים
      setLearnedWordsList(allWords);
      
      // שמור את כל המילים (רק אם המשתמש מחובר)
      // בדוק אילו מילים כבר קיימות במסד הנתונים לפני השמירה
      if (user && allWords.length > 0) {
        console.log('User is logged in, checking existing words before saving...');
        (async () => {
          try {
            // טען את כל המילים הקיימות של המשתמש
            const existingWordsResponse = await fetch(`/api/learned-words?userId=${user.id}`);
            if (!existingWordsResponse.ok) {
              throw new Error('Failed to fetch existing words');
            }
            const existingWordsData = await existingWordsResponse.json();
            const existingWords = existingWordsData.learnedWords || [];
            
            // צור Set של מילים קיימות (בכל המשחקים) לבדיקה מהירה
            const existingWordsSet = new Set(
              existingWords.map((w: any) => w.word.toLowerCase())
            );
            
            // סנן רק את המילים החדשות (שאינן קיימות בכל המשחקים)
            const newWords = allWords.filter(wordData => {
              return !existingWordsSet.has(wordData.word.toLowerCase());
            });
            
            console.log(`Found ${existingWords.length} existing words, ${newWords.length} new words to save`);
            
            // הצג את כל המילים שלמד במשחק (לא רק החדשות)
            // אבל שמור רק את המילים החדשות
            setLearnedWordsList(allWords);
            
            // שמור רק את המילים החדשות
            if (newWords.length > 0) {
              console.log('Saving', newWords.length, 'new words to database...');
              const savePromises = newWords.map(wordData => 
          saveLearnedWord(wordData.word, wordData.translation, true)
        );
          const results = await Promise.allSettled(savePromises);
          const successful = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.filter(r => r.status === 'rejected').length;
          console.log(`Words save completed: ${successful} successful, ${failed} failed`);
            } else {
              console.log('No new words to save - all words already exist');
            }
        } catch (error) {
            console.error('Error checking/saving words:', error);
            // במקרה של שגיאה, נסה לשמור את כל המילים (fallback)
            const savePromises = allWords.map(wordData => 
              saveLearnedWord(wordData.word, wordData.translation, true)
            );
            Promise.allSettled(savePromises).catch(err => 
              console.error('Error in fallback save:', err)
            );
          }
        })();
      }
      
      setGameOver(true);
      if (user) {
        try {
          await fetch('/api/games/update-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              gameName: 'SentenceScramble',
              score: score,
              won: score > 0,
              time: timer,
            }),
          });
        } catch (error) {
          console.error('Failed to update game stats:', error);
        }
      }
    } else {
      setCurrentIdx((c) => c + 1);
    }
  };

  const startGame = () => {
    setStarted(true);
    setTimer(0);
    setScore(0);
    setCurrentIdx(0);
    setGameOver(false);
    setFeedback(null);
  };

  const restart = () => {
    setStarted(false);
    setCurrentIdx(0);
    setScore(0);
    setTimer(0);
    setGameOver(false);
    setFeedback(null);
    setSelected([]);
    setScrambled([]);
    setLearnedWordsList([]);
    // לא מאפסים את useLearnedWords כדי שהמשתמש יוכל לשחק שוב עם אותה בחירה
  };

  // Drag & Drop handlers
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => e.preventDefault();
  const handleDrop = (idx: number) => {
    if (draggedIdx === null || draggedIdx === idx) return;
    const newSelected = [...selected];
    const [removed] = newSelected.splice(draggedIdx, 1);
    newSelected.splice(idx, 0, removed);
    setSelected(newSelected);
    setDraggedIdx(null);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  const handleHint = () => {
    if ((inventory['hint'] || 0) <= 0 || gameOver) return;
    setShowAnswer(true);
    setHintMsg('💡 השתמשת ברמז! המשפט הנכון מוצג למטה.');
    setInventory(inv => {
      const newInv = { ...inv, hint: (inv['hint'] || 0) - 1 };
      localStorage.setItem('quiz-inventory', JSON.stringify(newInv));
      return newInv;
    });
    setTimeout(() => setHintMsg(null), 2000);
  };

  return (
    <main className={`min-h-screen bg-gradient-to-br from-pink-200 via-blue-200 to-green-200 flex flex-col items-center justify-center p-4 ${isRTL ? 'rtl' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}>
      <audio ref={successAudio} src="/voise/הצלחה.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/כשלון.dat" preload="auto" />
      <div className="max-w-2xl w-full mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 text-center drop-shadow-lg flex items-center gap-4">
            הזזת מילים
            <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xl shadow bg-gradient-to-r ${levelLabels[difficulty].color} text-white ml-4`}>
              <span className="text-2xl">{levelLabels[difficulty].icon}</span> {levelLabels[difficulty].label}
            </span>
          </h1>
        </div>
        {/* Progress Bar */}
        {started && questions.length > 0 && (
          <div className="w-full h-3 bg-blue-100 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
        {!started && (
          <div className="flex flex-col gap-4 items-center mb-8">
            {/* בחירת מצב משחק - רגיל או מילים שנלמדו */}
            <div className="w-full mb-4 bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-3 text-center">בחר מקור משפטים:</h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setUseLearnedWords(false);
                  }}
                  className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                    !useLearnedWords
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-105'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🎮 משפטים רגילים
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      alert('אנא התחבר כדי לשחק עם המילים שלמדת');
                      return;
                    }
                    setUseLearnedWords(true);
                    if (learnedWordsData.length === 0) {
                      loadLearnedWords();
                    }
                  }}
                  disabled={!user || loadingLearnedWords}
                  className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                    useLearnedWords
                      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white scale-105'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingLearnedWords ? (
                    '⏳ טוען מילים...'
                  ) : (
                    <>
                      📚 משפטים מהמילים שנלמדו
                      {learnedWordsData.length > 0 && (
                        <span className="block text-sm mt-1">({learnedWordsData.length} מילים זמינות)</span>
                      )}
                    </>
                  )}
                </button>
                {!user && (
                  <p className="text-sm text-gray-600 text-center mt-2">
                    💡 התחבר כדי לשחק עם המילים שלמדת
                  </p>
                )}
              </div>
              {useLearnedWords && learnedWordsData.length === 0 && !loadingLearnedWords && user && (
                <p className="text-red-500 text-center mt-4 font-bold">
                  אין מספיק מילים שנלמדו כדי לשחק. אנא שחק במשחקים אחרים כדי ללמוד מילים.
                </p>
              )}
              
              {/* בחירת כמות מילים (רק אם יש מילים שנלמדו) */}
              {useLearnedWords && learnedWordsData.length > 0 && !loadingLearnedWords && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <label className="block text-sm font-bold text-blue-800 mb-2 text-center">
                    בחר מילים למשחק:
                  </label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 justify-center">
                      <input
                        type="radio"
                        id="all-words-ss"
                        name="word-selection-ss"
                        checked={selectedWordsCount === null && selectedWords.length === 0 && !showWordSelector}
                        onChange={() => {
                          setSelectedWordsCount(null);
                          setSelectedWords([]);
                          setShowWordSelector(false);
                        }}
                        className="w-5 h-5"
                      />
                      <label htmlFor="all-words-ss" className="text-sm font-semibold text-gray-700 cursor-pointer">
                        כל המילים ({learnedWordsData.length})
                      </label>
                    </div>
                    <div className="flex items-center gap-3 justify-center">
                      <input
                        type="radio"
                        id="custom-count-ss"
                        name="word-selection-ss"
                        checked={selectedWordsCount !== null && selectedWords.length === 0 && !showWordSelector}
                        onChange={() => {
                          setSelectedWordsCount(Math.min(40, learnedWordsData.length));
                          setSelectedWords([]);
                          setShowWordSelector(false);
                        }}
                        className="w-5 h-5"
                      />
                      <label htmlFor="custom-count-ss" className="text-sm font-semibold text-gray-700 cursor-pointer">
                        כמות אקראית:
                      </label>
                      {selectedWordsCount !== null && selectedWords.length === 0 && !showWordSelector && (
                        <input
                          type="number"
                          min="1"
                          max={learnedWordsData.length}
                          value={selectedWordsCount}
                          onChange={(e) => {
                            const count = parseInt(e.target.value) || 1;
                            const maxCount = Math.min(count, learnedWordsData.length);
                            setSelectedWordsCount(maxCount);
                            setSelectedWords([]);
                          }}
                          className="w-20 px-2 py-1 border-2 border-blue-300 rounded-lg text-center font-bold"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-3 justify-center">
                      <input
                        type="radio"
                        id="select-words-ss"
                        name="word-selection-ss"
                        checked={showWordSelector || selectedWords.length > 0}
                        onChange={() => {
                          setSelectedWordsCount(null);
                          setShowWordSelector(true);
                          if (selectedWords.length === 0) {
                            setSelectedWords([]);
                          }
                        }}
                        className="w-5 h-5"
                      />
                      <label htmlFor="select-words-ss" className="text-sm font-semibold text-gray-700 cursor-pointer">
                        בחר מילים ספציפיות
                      </label>
                    </div>
                    {selectedWordsCount !== null && selectedWords.length === 0 && !showWordSelector && (
                      <p className="text-xs text-gray-600 text-center mt-2">
                        המילים נבחרות אקראית מתוך {learnedWordsData.length} מילים זמינות
                      </p>
                    )}
                    {selectedWords.length > 0 && (
                      <p className="text-xs text-green-600 text-center mt-2 font-bold">
                        נבחרו {selectedWords.length} מילים
                      </p>
                    )}
                  </div>
                  
                  {/* רשימת בחירת מילים */}
                  {(showWordSelector || selectedWords.length > 0) && (
                    <div className="mt-4 max-h-60 overflow-y-auto border-2 border-blue-300 rounded-lg p-3 bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {learnedWordsData.map((wordData, index) => {
                          const isSelected = selectedWords.some(w => w.word.toLowerCase() === wordData.word.toLowerCase());
                          return (
                            <label
                              key={index}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-100 ${
                                isSelected ? 'bg-blue-200' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedWords([...selectedWords, wordData]);
                                    setSelectedWordsCount(null);
                                    setShowWordSelector(true);
                                  } else {
                                    setSelectedWords(selectedWords.filter(w => w.word.toLowerCase() !== wordData.word.toLowerCase()));
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm font-semibold text-gray-800">{wordData.word}</span>
                              <span className="text-xs text-gray-600">({getTranslationWithFallback(wordData.word, undefined, wordData.translation)})</span>
                            </label>
                          );
                        })}
                      </div>
                      {selectedWords.length > 0 && (
                        <div className="mt-3 flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setSelectedWords([]);
                              setShowWordSelector(false);
                            }}
                            className="px-4 py-1 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600"
                          >
                            נקה בחירה
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWords([...learnedWordsData]);
                              setShowWordSelector(true);
                            }}
                            className="px-4 py-1 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600"
                          >
                            בחר הכל
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* בחירת רמת קושי ושפה (רק אם לא משחק עם מילים שנלמדו) */}
            {!useLearnedWords && (
              <>
            <div className="flex gap-4">
              {difficulties.map((d) => (
                <button key={d.key} onClick={() => setDifficulty(d.key)} className={`px-6 py-2 rounded-full font-bold shadow text-lg ${difficulty===d.key?'bg-blue-600 text-white scale-105':'bg-white text-blue-700 hover:bg-blue-100'}`}>{d.label}</button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setLang('en')} className={`px-6 py-2 rounded-full font-bold shadow text-lg ${lang==='en'?'bg-green-600 text-white scale-105':'bg-white text-green-700 hover:bg-green-100'}`}>English</button>
              <button onClick={() => setLang('he')} className={`px-6 py-2 rounded-full font-bold shadow text-lg ${lang==='he'?'bg-pink-600 text-white scale-105':'bg-white text-pink-700 hover:bg-pink-100'}`}>עברית</button>
            </div>
              </>
            )}
            <button 
              onClick={() => {
                if (useLearnedWords && learnedWordsData.length === 0) {
                  alert('אין מספיק מילים שנלמדו כדי לשחק. אנא שחק במשחקים אחרים כדי ללמוד מילים.');
                  return;
                }
                startGame();
              }}
              disabled={useLearnedWords && learnedWordsData.length === 0}
              className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              התחל
            </button>
          </div>
        )}
        {started && !gameOver && questions.length > 0 && (
          <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-blue-700 shadow">ניקוד: {score}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-green-700 shadow">שאלה: {currentIdx+1}/{questions.length}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-pink-700 shadow">זמן: {timer} שניות</div>
            </div>
            <div className="mb-6">
              <div className="text-xl font-bold text-center mb-2">סדר את המילים למשפט נכון:</div>
              <div ref={selectedContainerRef} className={`flex flex-wrap gap-2 justify-center mb-4 min-h-[48px] ${isRTL ? 'flex-row-reverse' : ''}`}
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                {selected.map((word, idx) => (
                  <button
                    key={idx}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleUnselect(idx)}
                    className={`bg-blue-400 text-white px-4 py-2 rounded-full font-bold shadow hover:bg-blue-600 transition-all duration-150 text-lg
                      ${draggedIdx === idx ? 'ring-4 ring-yellow-400 scale-110' : ''}
                      ${feedback === 'נכון!' ? 'animate-correct' : ''}
                      ${feedback && feedback !== 'נכון!' ? 'animate-wrong' : ''}`}
                  >{word}</button>
                ))}
              </div>
              <div className={`flex flex-wrap gap-2 justify-center ${isRTL ? 'flex-row-reverse' : ''}`} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                {scrambled.map((word, idx) => (
                  <button key={idx} onClick={() => handleSelect(word, idx)} className="bg-white text-blue-700 px-4 py-2 rounded-full font-bold shadow hover:bg-blue-100 transition-all duration-150 text-lg border border-blue-200">{word}</button>
                ))}
              </div>
            </div>
            {!showAnswer && (
              <div className="flex justify-center mb-4">
                <button onClick={handleCheck} disabled={selected.length !== questions[currentIdx]?.text.split(' ').length || selected.length === 0} className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 disabled:opacity-50">בדוק</button>
              </div>
            )}
            {showAnswer && (
              <div className="flex flex-col items-center gap-4 mb-4 animate-fade-in">
                {feedback && (
                  <div className={`text-center text-2xl font-bold ${feedback==='נכון!'?'text-green-600':'text-red-500'}`}>{feedback}</div>
                )}
                <div className="text-center text-lg font-bold text-blue-700">{questions[currentIdx].text}</div>
                {questions[currentIdx].he && (
                  <div className="text-center text-md font-bold text-purple-700">{questions[currentIdx].he}</div>
                )}
                <button onClick={handleNext} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200">המשך</button>
              </div>
            )}
            {getMistakeStats()[questions[currentIdx].id] > 0 && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-bold align-middle">💡 חיזוק אישי</span>
            )}
            <button
              onClick={handleHint}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold shadow hover:from-orange-500 hover:to-yellow-400 transition-all duration-200 ml-2"
              disabled={(inventory['hint'] || 0) <= 0 || gameOver}
            >
              💡 רמז ({inventory['hint'] || 0})
            </button>
            {hintMsg && (
              <div className="text-center text-yellow-700 font-bold animate-fade-in mt-2">{hintMsg}</div>
            )}
          </>
        )}
        {gameOver && (
          <div className="text-center mt-6 animate-fade-in">
            <div className="text-2xl font-bold text-blue-700 mb-4">כל הכבוד! סיימת את כל המשפטים 🎉</div>
            <div className="text-lg font-bold text-green-700 mb-2">ניקוד סופי: {score} | זמן: {timer} שניות</div>
            
            {/* רשימת המילים שנלמדו */}
            {learnedWordsList && learnedWordsList.length > 0 && (
              <div className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 המילים שלמדת במשחק הזה:</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                  {learnedWordsList.map((wordData, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-md border border-blue-200">
                      <div className="font-bold text-blue-700 text-lg">{wordData.word}</div>
                      <div className="text-sm text-gray-600">{wordData.translation}</div>
                    </div>
                  ))}
                </div>
                {user && (
                  <div className="mt-4 text-sm text-gray-600">
                    ✅ המילים נשמרו בדף המילים שנלמדו
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={restart} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200">שחק שוב</button>
              {user && learnedWordsList && learnedWordsList.length > 0 && (
                <a
                  href="/learned-words"
                  className="px-8 py-3 bg-gradient-to-r from-indigo-400 to-purple-500 text-white rounded-full text-xl font-bold shadow-lg hover:from-indigo-500 hover:to-purple-600 transition-transform transform hover:scale-105"
                >
                  📚 צפה בכל המילים
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes correct { 0%,100%{background:#60d394;} 50%{background:#38b000;} }
        .animate-correct { animation: correct 0.7s; }
        @keyframes wrong { 0%,100%{background:#f87171;} 50%{background:#dc2626;} }
        .animate-wrong { animation: wrong 0.7s; }
      `}</style>
    </main>
  );
} 