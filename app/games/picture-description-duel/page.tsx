"use client";
import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import AdManager from "@/app/components/ads/AdManager";
import useAuthUser from '@/lib/useAuthUser';

type Question = {
  id: number;
  lang: 'he' | 'en';
  category: string;
  text: string;
  options: readonly string[];
  answer: number;
  explanation: string;
  explanationHe?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
};

type Player = {
  name: string;
  score: number;
  correct: number;
  mistakes: number;
};

type CategoryStats = {
  [key: string]: {
    total: number;
    correct: number;
  };
};

type LeaderboardEntry = {
  name: string;
  score: number;
};

type DetailedResult = Question & {
  selected: number;
  correct: boolean;
  time: number;
};

const QUESTIONS: readonly Question[] = [
  // Easy level - Animals (basic)
  { id: 1, lang: "en", category: "animals", text: "Which animal barks?", options: ["Cat", "Dog", "Cow", "Horse"], answer: 1, explanation: "A dog barks.", explanationHe: "כלב נובח.", difficulty: "easy" },
  { id: 2, lang: "en", category: "animals", text: "Which animal can fly?", options: ["Dog", "Bird", "Fish", "Horse"], answer: 1, explanation: "A bird can fly.", explanationHe: "ציפור יכולה לעוף.", difficulty: "easy" },
  { id: 3, lang: "en", category: "animals", text: "Which animal lives in water?", options: ["Cat", "Dog", "Fish", "Cow"], answer: 2, explanation: "A fish lives in water.", explanationHe: "דג חי במים.", difficulty: "easy" },
  // Food
  { id: 4, lang: "en", category: "food", text: "Which fruit is yellow?", options: ["Apple", "Banana", "Grape", "Cherry"], answer: 1, explanation: "A banana is yellow.", explanationHe: "בננה היא צהובה.", difficulty: "easy" },
  { id: 5, lang: "en", category: "food", text: "Which food is made from flour?", options: ["Bread", "Egg", "Milk", "Apple"], answer: 0, explanation: "Bread is made from flour.", explanationHe: "לחם עשוי מקמח.", difficulty: "easy" },
  { id: 6, lang: "en", category: "food", text: "Which is a vegetable?", options: ["Carrot", "Banana", "Apple", "Cake"], answer: 0, explanation: "A carrot is a vegetable.", explanationHe: "גזר הוא ירק.", difficulty: "easy" },
  // Colors
  { id: 7, lang: "en", category: "colors", text: "What color do you get by mixing yellow and blue?", options: ["Green", "Purple", "Orange", "Red"], answer: 0, explanation: "Yellow and blue make green.", explanationHe: "צהוב וכחול יוצרים ירוק." },
  { id: 8, lang: "en", category: "colors", text: "Which color is made by mixing red and blue?", options: ["Green", "Purple", "Orange", "Yellow"], answer: 1, explanation: "Red and blue make purple.", explanationHe: "אדום וכחול יוצרים סגול." },
  { id: 9, lang: "en", category: "colors", text: "Which color is the sky on a clear day?", options: ["Blue", "Green", "Red", "Yellow"], answer: 0, explanation: "The sky is blue on a clear day.", explanationHe: "השמיים כחולים ביום בהיר." },
  // Family
  { id: 10, lang: "en", category: "family", text: "Who is your father's father?", options: ["Uncle", "Grandfather", "Brother", "Cousin"], answer: 1, explanation: "Your father's father is your grandfather.", explanationHe: "אבא של אבא שלך הוא סבא שלך." },
  { id: 11, lang: "en", category: "family", text: "Who is your mother's daughter?", options: ["Sister", "Aunt", "Cousin", "Grandmother"], answer: 0, explanation: "Your mother's daughter is your sister.", explanationHe: "הבת של אמא שלך היא אחותך." },
  // School
  { id: 12, lang: "en", category: "school", text: "What do you use to write in a notebook?", options: ["Eraser", "Pen", "Ruler", "Scissors"], answer: 1, explanation: "You use a pen to write in a notebook.", explanationHe: "כותבים במחברת עם עט." },
  { id: 13, lang: "en", category: "school", text: "What do you use to erase pencil marks?", options: ["Pen", "Eraser", "Ruler", "Marker"], answer: 1, explanation: "You use an eraser to erase pencil marks.", explanationHe: "מוחקים עיפרון עם מחק." },
  // Transport
  { id: 14, lang: "en", category: "transport", text: "Which vehicle has two wheels?", options: ["Car", "Bicycle", "Bus", "Train"], answer: 1, explanation: "A bicycle has two wheels.", explanationHe: "לאופניים יש שני גלגלים." },
  { id: 15, lang: "en", category: "transport", text: "Which vehicle flies in the sky?", options: ["Car", "Bicycle", "Airplane", "Boat"], answer: 2, explanation: "An airplane flies in the sky.", explanationHe: "מטוס טס בשמיים." },
  // Nature
  { id: 16, lang: "en", category: "nature", text: "Which is a tree?", options: ["Rose", "Pine", "Tulip", "Daisy"], answer: 1, explanation: "Pine is a tree.", explanationHe: "אורן הוא עץ." },
  { id: 17, lang: "en", category: "nature", text: "Which is a flower?", options: ["Pine", "Rose", "Oak", "Maple"], answer: 1, explanation: "Rose is a flower.", explanationHe: "ורד הוא פרח." },
  // Sports
  { id: 18, lang: "en", category: "sports", text: "Which sport uses a racket?", options: ["Soccer", "Tennis", "Basketball", "Swimming"], answer: 1, explanation: "Tennis uses a racket.", explanationHe: "בטניס משחקים עם מחבט." },
  { id: 19, lang: "en", category: "sports", text: "Which sport is played in water?", options: ["Soccer", "Basketball", "Swimming", "Tennis"], answer: 2, explanation: "Swimming is played in water.", explanationHe: "שחייה מתבצעת במים." },
  // Weather
  { id: 20, lang: "en", category: "weather", text: "What do you use when it rains?", options: ["Umbrella", "Hat", "Sunglasses", "Scarf"], answer: 0, explanation: "You use an umbrella when it rains.", explanationHe: "משתמשים במטריה כשיורד גשם." },
  { id: 21, lang: "en", category: "weather", text: "What is the weather like in summer?", options: ["Cold", "Hot", "Rainy", "Snowy"], answer: 1, explanation: "It is hot in summer.", explanationHe: "בקיץ חם." },
  // Time
  { id: 22, lang: "en", category: "time", text: "How many minutes are in an hour?", options: ["30", "45", "60", "90"], answer: 2, explanation: "There are 60 minutes in an hour.", explanationHe: "יש 60 דקות בשעה." },
  { id: 23, lang: "en", category: "time", text: "How many days are in a week?", options: ["5", "6", "7", "8"], answer: 2, explanation: "There are 7 days in a week.", explanationHe: "יש 7 ימים בשבוע." },
  // Clothes
  { id: 24, lang: "en", category: "clothes", text: "What do you wear on your feet?", options: ["Shirt", "Shoes", "Hat", "Gloves"], answer: 1, explanation: "You wear shoes on your feet.", explanationHe: "נועלים נעליים על הרגליים." },
  { id: 25, lang: "en", category: "clothes", text: "What do you wear on your head?", options: ["Pants", "Hat", "Shoes", "Socks"], answer: 1, explanation: "You wear a hat on your head.", explanationHe: "חובשים כובע על הראש." },
  // Body
  { id: 26, lang: "en", category: "body", text: "What do you use to see?", options: ["Ears", "Eyes", "Nose", "Mouth"], answer: 1, explanation: "You use your eyes to see.", explanationHe: "רואים עם העיניים." },
  { id: 27, lang: "en", category: "body", text: "What do you use to hear?", options: ["Eyes", "Ears", "Nose", "Mouth"], answer: 1, explanation: "You use your ears to hear.", explanationHe: "שומעים עם האוזניים." },
  // Holidays
  { id: 28, lang: "en", category: "holidays", text: "Which holiday has a decorated tree?", options: ["Hanukkah", "Christmas", "Passover", "Easter"], answer: 1, explanation: "Christmas has a decorated tree.", explanationHe: "בחג המולד יש עץ מקושט." },
  { id: 29, lang: "en", category: "holidays", text: "Which holiday is celebrated with candles for 8 days?", options: ["Hanukkah", "Christmas", "Easter", "Thanksgiving"], answer: 0, explanation: "Hanukkah is celebrated with candles for 8 days.", explanationHe: "חנוכה נחגג עם נרות במשך 8 ימים." },
  // Jobs
  { id: 30, lang: "en", category: "jobs", text: "Who teaches students?", options: ["Doctor", "Teacher", "Chef", "Driver"], answer: 1, explanation: "A teacher teaches students.", explanationHe: "מורה מלמד תלמידים." },
  { id: 31, lang: "en", category: "jobs", text: "Who drives a bus?", options: ["Pilot", "Chef", "Bus driver", "Teacher"], answer: 2, explanation: "A bus driver drives a bus.", explanationHe: "נהג אוטובוס נוהג באוטובוס." },
  // Adjectives
  { id: 32, lang: "en", category: "adjectives", text: "What is the opposite of 'big'?", options: ["Small", "Tall", "Short", "Long"], answer: 0, explanation: "The opposite of 'big' is 'small'.", explanationHe: "ההפך מ'גדול' הוא 'קטן'." },
  { id: 33, lang: "en", category: "adjectives", text: "What is the opposite of 'hot'?", options: ["Cold", "Warm", "Cool", "Wet"], answer: 0, explanation: "The opposite of 'hot' is 'cold'.", explanationHe: "ההפך מ'חם' הוא 'קר'." },
  // Vehicles
  { id: 34, lang: "en", category: "vehicles", text: "Which vehicle goes on water?", options: ["Car", "Boat", "Bicycle", "Bus"], answer: 1, explanation: "A boat goes on water.", explanationHe: "סירה שטה על המים." },
  { id: 35, lang: "en", category: "vehicles", text: "Which vehicle has wings?", options: ["Car", "Boat", "Airplane", "Bus"], answer: 2, explanation: "An airplane has wings.", explanationHe: "למטוס יש כנפיים." },
  // Fruits
  { id: 36, lang: "en", category: "fruits", text: "Which is a citrus fruit?", options: ["Apple", "Banana", "Orange", "Grape"], answer: 2, explanation: "An orange is a citrus fruit.", explanationHe: "תפוז הוא פרי הדר." },
  { id: 37, lang: "en", category: "fruits", text: "Which fruit is red?", options: ["Banana", "Apple", "Grape", "Orange"], answer: 1, explanation: "An apple is red.", explanationHe: "תפוח הוא אדום." },
  // Vegetables
  { id: 38, lang: "en", category: "vegetables", text: "Which is a root vegetable?", options: ["Carrot", "Lettuce", "Tomato", "Cucumber"], answer: 0, explanation: "A carrot is a root vegetable.", explanationHe: "גזר הוא ירק שורש." },
  { id: 39, lang: "en", category: "vegetables", text: "Which vegetable is green?", options: ["Carrot", "Lettuce", "Tomato", "Eggplant"], answer: 1, explanation: "Lettuce is green.", explanationHe: "חסה היא ירוקה." },
  // נוסיף כאן עוד 21 שאלות מגוונות
  { id: 40, lang: "en", category: "animals", text: "Which animal is known as man's best friend?", options: ["Cat", "Dog", "Horse", "Rabbit"], answer: 1, explanation: "A dog is known as man's best friend.", explanationHe: "כלב נחשב לחברו הטוב של האדם." },
  { id: 41, lang: "en", category: "food", text: "Which food is sweet and made by bees?", options: ["Honey", "Bread", "Cheese", "Rice"], answer: 0, explanation: "Honey is made by bees.", explanationHe: "דבש מיוצר על ידי דבורים." },
  { id: 42, lang: "en", category: "colors", text: "Which color is a mix of red and yellow?", options: ["Green", "Orange", "Purple", "Blue"], answer: 1, explanation: "Red and yellow make orange.", explanationHe: "אדום וצהוב יוצרים כתום." },
  { id: 43, lang: "en", category: "family", text: "Who is your mother's mother?", options: ["Aunt", "Grandmother", "Sister", "Cousin"], answer: 1, explanation: "Your mother's mother is your grandmother.", explanationHe: "אמא של אמא שלך היא סבתא שלך." },
  { id: 44, lang: "en", category: "school", text: "What do you use to color a picture?", options: ["Pen", "Crayons", "Eraser", "Ruler"], answer: 1, explanation: "You use crayons to color a picture.", explanationHe: "צובעים ציור עם צבעי פנדה." },
  { id: 45, lang: "en", category: "transport", text: "Which vehicle carries many people in a city?", options: ["Bicycle", "Bus", "Car", "Boat"], answer: 1, explanation: "A bus carries many people.", explanationHe: "אוטובוס מסיע הרבה אנשים בעיר." },
  { id: 46, lang: "en", category: "nature", text: "Which is the largest planet in our solar system?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: 2, explanation: "Jupiter is the largest planet.", explanationHe: "צדק הוא כוכב הלכת הגדול ביותר." },
  { id: 47, lang: "en", category: "sports", text: "Which sport uses a hoop?", options: ["Soccer", "Basketball", "Tennis", "Swimming"], answer: 1, explanation: "Basketball uses a hoop.", explanationHe: "בכדורסל יש סל (hoop)." },
  { id: 48, lang: "en", category: "weather", text: "What falls from the sky when it's cold?", options: ["Rain", "Snow", "Sun", "Wind"], answer: 1, explanation: "Snow falls when it's cold.", explanationHe: "שלג יורד כשקר מאוד." },
  { id: 49, lang: "en", category: "time", text: "What do you use to know the time?", options: ["Book", "Clock", "Chair", "Spoon"], answer: 1, explanation: "You use a clock to know the time.", explanationHe: "משתמשים בשעון כדי לדעת מה השעה." },
  { id: 50, lang: "en", category: "clothes", text: "What do you wear when it's cold?", options: ["T-shirt", "Shorts", "Coat", "Sandals"], answer: 2, explanation: "You wear a coat when it's cold.", explanationHe: "לובשים מעיל כשקר." },
  { id: 51, lang: "en", category: "body", text: "What do you use to smell?", options: ["Eyes", "Nose", "Ears", "Hands"], answer: 1, explanation: "You use your nose to smell.", explanationHe: "מריחים עם האף." },
  { id: 52, lang: "en", category: "holidays", text: "Which holiday is celebrated with fireworks on July 4th?", options: ["Christmas", "Thanksgiving", "Independence Day", "Easter"], answer: 2, explanation: "Independence Day is celebrated with fireworks.", explanationHe: "ביום העצמאות האמריקאי יש זיקוקים." },
  { id: 53, lang: "en", category: "jobs", text: "Who helps sick people?", options: ["Teacher", "Doctor", "Driver", "Chef"], answer: 1, explanation: "A doctor helps sick people.", explanationHe: "רופא עוזר לאנשים חולים." },
  { id: 54, lang: "en", category: "adjectives", text: "What is the opposite of 'short'?", options: ["Tall", "Big", "Small", "Long"], answer: 0, explanation: "The opposite of 'short' is 'tall'.", explanationHe: "ההפך מ'נמוך' הוא 'גבוה'." },
  { id: 55, lang: "en", category: "vehicles", text: "Which vehicle is used by firefighters?", options: ["Ambulance", "Fire truck", "Bicycle", "Boat"], answer: 1, explanation: "Firefighters use a fire truck.", explanationHe: "כבאים משתמשים ברכב כיבוי אש." },
  { id: 56, lang: "en", category: "fruits", text: "Which fruit is green on the outside and red inside?", options: ["Apple", "Watermelon", "Banana", "Grape"], answer: 1, explanation: "A watermelon is green outside and red inside.", explanationHe: "אבטיח ירוק מבחוץ ואדום מבפנים." },
  { id: 57, lang: "en", category: "vegetables", text: "Which vegetable is orange?", options: ["Carrot", "Lettuce", "Tomato", "Cucumber"], answer: 0, explanation: "A carrot is orange.", explanationHe: "גזר הוא כתום." },
  { id: 58, lang: "en", category: "nature", text: "Which is the hottest planet in our solar system?", options: ["Venus", "Earth", "Mars", "Jupiter"], answer: 0, explanation: "Venus is the hottest planet.", explanationHe: "נוגה הוא כוכב הלכת החם ביותר." },
  { id: 59, lang: "en", category: "sports", text: "Which sport is played on ice?", options: ["Soccer", "Basketball", "Ice hockey", "Tennis"], answer: 2, explanation: "Ice hockey is played on ice.", explanationHe: "הוקי קרח משוחק על קרח." },
  { id: 60, lang: "en", category: "jobs", text: "Who bakes bread?", options: ["Baker", "Doctor", "Teacher", "Driver"], answer: 0, explanation: "A baker bakes bread.", explanationHe: "אופה אופה לחם." },
  // נוסיף כאן שאלות חדשות
  { id: 61, lang: "en", category: "animals", text: "Which animal is known as man's best friend?", options: ["Cat", "Dog", "Horse", "Rabbit"], answer: 1, explanation: "A dog is known as man's best friend.", explanationHe: "כלב נחשב לחברו הטוב של האדם." },
  { id: 62, lang: "en", category: "food", text: "Which food is sweet and made by bees?", options: ["Honey", "Bread", "Cheese", "Rice"], answer: 0, explanation: "Honey is made by bees.", explanationHe: "דבש מיוצר על ידי דבורים." },
  { id: 63, lang: "en", category: "colors", text: "Which color is a mix of red and yellow?", options: ["Green", "Orange", "Purple", "Blue"], answer: 1, explanation: "Red and yellow make orange.", explanationHe: "אדום וצהוב יוצרים כתום." },
  { id: 64, lang: "en", category: "family", text: "Who is your mother's mother?", options: ["Aunt", "Grandmother", "Sister", "Cousin"], answer: 1, explanation: "Your mother's mother is your grandmother.", explanationHe: "אמא של אמא שלך היא סבתא שלך." },
  { id: 65, lang: "en", category: "school", text: "What do you use to color a picture?", options: ["Pen", "Crayons", "Eraser", "Ruler"], answer: 1, explanation: "You use crayons to color a picture.", explanationHe: "צובעים ציור עם צבעי פנדה." },
  { id: 66, lang: "en", category: "transport", text: "Which vehicle carries many people in a city?", options: ["Bicycle", "Bus", "Car", "Boat"], answer: 1, explanation: "A bus carries many people.", explanationHe: "אוטובוס מסיע הרבה אנשים בעיר." },
  { id: 67, lang: "en", category: "nature", text: "Which is the largest planet in our solar system?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: 2, explanation: "Jupiter is the largest planet.", explanationHe: "צדק הוא כוכב הלכת הגדול ביותר." },
  { id: 68, lang: "en", category: "sports", text: "Which sport uses a ball?", options: ["Tennis", "Swimming", "Running", "Cycling"], answer: 0, explanation: "Tennis uses a ball." },
  { id: 69, lang: "en", category: "weather", text: "What do you use when it's sunny?", options: ["Umbrella", "Sunglasses", "Boots", "Coat"], answer: 1, explanation: "You use sunglasses when it's sunny." },
  { id: 70, lang: "en", category: "time", text: "How many hours are in a day?", options: ["12", "18", "24", "36"], answer: 2, explanation: "There are 24 hours in a day." },
  // שאלות נוספות לרמת אקסטרים
  { id: 71, lang: "en", category: "animals", text: "Which animal is the fastest land animal?", options: ["Cheetah", "Lion", "Tiger", "Leopard"], answer: 0, explanation: "The cheetah is the fastest land animal.", explanationHe: "ברדלס הוא החיה המהירה ביותר על היבשה." },
  { id: 72, lang: "en", category: "food", text: "Which fruit is known as the 'king of fruits'?", options: ["Apple", "Mango", "Banana", "Orange"], answer: 1, explanation: "Mango is known as the 'king of fruits'.", explanationHe: "מנגו נקרא 'מלך הפירות'." },
  { id: 73, lang: "en", category: "colors", text: "What color do you get by mixing all primary colors?", options: ["Black", "White", "Brown", "Gray"], answer: 2, explanation: "Mixing all primary colors creates brown.", explanationHe: "ערבוב כל הצבעים הראשיים יוצר חום." },
  { id: 74, lang: "en", category: "family", text: "Who is your father's brother?", options: ["Uncle", "Cousin", "Nephew", "Brother"], answer: 0, explanation: "Your father's brother is your uncle.", explanationHe: "אח של אבא שלך הוא הדוד שלך." },
  { id: 75, lang: "en", category: "school", text: "What do you use to measure angles?", options: ["Ruler", "Protractor", "Compass", "Calculator"], answer: 1, explanation: "You use a protractor to measure angles.", explanationHe: "משתמשים במד זווית כדי למדוד זוויות." },
  { id: 76, lang: "en", category: "transport", text: "Which vehicle travels on tracks?", options: ["Car", "Bus", "Train", "Bicycle"], answer: 2, explanation: "A train travels on tracks.", explanationHe: "רכבת נוסעת על מסילות." },
  { id: 77, lang: "en", category: "nature", text: "Which is the smallest planet in our solar system?", options: ["Mercury", "Venus", "Earth", "Mars"], answer: 0, explanation: "Mercury is the smallest planet.", explanationHe: "כוכב חמה הוא כוכב הלכת הקטן ביותר." },
  { id: 78, lang: "en", category: "sports", text: "Which sport is played with a net?", options: ["Soccer", "Basketball", "Volleyball", "Hockey"], answer: 2, explanation: "Volleyball is played with a net.", explanationHe: "בכדורעף משחקים עם רשת." },
  { id: 79, lang: "en", category: "weather", text: "What do you call frozen rain?", options: ["Snow", "Hail", "Sleet", "Ice"], answer: 1, explanation: "Frozen rain is called hail.", explanationHe: "גשם קפוא נקרא ברד." },
  { id: 80, lang: "en", category: "time", text: "How many seconds are in a minute?", options: ["30", "60", "90", "120"], answer: 1, explanation: "There are 60 seconds in a minute.", explanationHe: "יש 60 שניות בדקה." },
  { id: 81, lang: "en", category: "clothes", text: "What do you wear on your hands in winter?", options: ["Socks", "Gloves", "Hat", "Scarf"], answer: 1, explanation: "You wear gloves on your hands in winter.", explanationHe: "לובשים כפפות על הידיים בחורף." },
  { id: 82, lang: "en", category: "body", text: "What do you use to taste food?", options: ["Eyes", "Nose", "Tongue", "Ears"], answer: 2, explanation: "You use your tongue to taste food.", explanationHe: "טועמים אוכל עם הלשון." },
  { id: 83, lang: "en", category: "holidays", text: "Which holiday is celebrated with a turkey?", options: ["Christmas", "Thanksgiving", "Easter", "Halloween"], answer: 1, explanation: "Thanksgiving is celebrated with a turkey.", explanationHe: "בחג ההודיה אוכלים תרנגול הודו." },
  { id: 84, lang: "en", category: "jobs", text: "Who flies airplanes?", options: ["Pilot", "Driver", "Captain", "Engineer"], answer: 0, explanation: "A pilot flies airplanes.", explanationHe: "טייס מטיס מטוסים." },
  { id: 85, lang: "en", category: "adjectives", text: "What is the opposite of 'fast'?", options: ["Slow", "Quick", "Rapid", "Swift"], answer: 0, explanation: "The opposite of 'fast' is 'slow'.", explanationHe: "ההפך מ'מהיר' הוא 'איטי'." },
  { id: 86, lang: "en", category: "vehicles", text: "Which vehicle is used for emergency medical help?", options: ["Police car", "Ambulance", "Fire truck", "Taxi"], answer: 1, explanation: "An ambulance is used for emergency medical help.", explanationHe: "אמבולנס משמש לעזרה רפואית דחופה." },
  { id: 87, lang: "en", category: "fruits", text: "Which fruit is purple?", options: ["Apple", "Banana", "Grape", "Orange"], answer: 2, explanation: "A grape is purple.", explanationHe: "ענב הוא סגול." },
  { id: 88, lang: "en", category: "vegetables", text: "Which vegetable is red and round?", options: ["Carrot", "Lettuce", "Tomato", "Cucumber"], answer: 2, explanation: "A tomato is red and round.", explanationHe: "עגבנייה היא אדומה ועגולה." },
  { id: 89, lang: "en", category: "nature", text: "Which is the largest ocean?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], answer: 1, explanation: "The Pacific is the largest ocean.", explanationHe: "האוקיינוס השקט הוא הגדול ביותר." },
  { id: 90, lang: "en", category: "sports", text: "Which sport uses a puck?", options: ["Soccer", "Basketball", "Ice hockey", "Tennis"], answer: 2, explanation: "Ice hockey uses a puck.", explanationHe: "הוקי קרח משתמש בדיסקית." },
  { id: 91, lang: "en", category: "jobs", text: "Who cuts hair?", options: ["Barber", "Doctor", "Teacher", "Chef"], answer: 0, explanation: "A barber cuts hair.", explanationHe: "ספר חותך שיער." },
  { id: 92, lang: "en", category: "adjectives", text: "What is the opposite of 'young'?", options: ["Old", "New", "Small", "Big"], answer: 0, explanation: "The opposite of 'young' is 'old'.", explanationHe: "ההפך מ'צעיר' הוא 'זקן'." },
  { id: 93, lang: "en", category: "vehicles", text: "Which vehicle has a siren?", options: ["Taxi", "Ambulance", "Bus", "Bicycle"], answer: 1, explanation: "An ambulance has a siren.", explanationHe: "לאמבולנס יש סירנה." },
  { id: 94, lang: "en", category: "fruits", text: "Which fruit is green and has a pit?", options: ["Apple", "Avocado", "Banana", "Orange"], answer: 1, explanation: "An avocado is green and has a pit.", explanationHe: "אבוקדו הוא ירוק ויש לו גלעין." },
  { id: 95, lang: "en", category: "vegetables", text: "Which vegetable is white and looks like a tree?", options: ["Carrot", "Broccoli", "Tomato", "Cucumber"], answer: 1, explanation: "Broccoli is white and looks like a tree.", explanationHe: "ברוקולי הוא לבן ונראה כמו עץ.", difficulty: "easy" },
  
  // Medium level questions - more complex
  { id: 96, lang: "en", category: "animals", text: "Which animal is known as the king of the jungle?", options: ["Lion", "Tiger", "Elephant", "Giraffe"], answer: 0, explanation: "The lion is known as the king of the jungle.", explanationHe: "האריה נקרא מלך החיות.", difficulty: "medium" },
  { id: 97, lang: "en", category: "science", text: "What gas do plants produce during photosynthesis?", options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], answer: 1, explanation: "Plants produce oxygen during photosynthesis.", explanationHe: "צמחים מייצרים חמצן בתהליך הפוטוסינתזה.", difficulty: "medium" },
  { id: 98, lang: "en", category: "geography", text: "Which is the largest continent by area?", options: ["Africa", "Asia", "North America", "Europe"], answer: 1, explanation: "Asia is the largest continent by area.", explanationHe: "אסיה היא היבשת הגדולה ביותר בשטח.", difficulty: "medium" },
  { id: 99, lang: "en", category: "history", text: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: 2, explanation: "World War II ended in 1945.", explanationHe: "מלחמת העולם השנייה הסתיימה ב-1945.", difficulty: "medium" },
  { id: 100, lang: "en", category: "literature", text: "Who wrote the play 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], answer: 1, explanation: "William Shakespeare wrote 'Romeo and Juliet'.", explanationHe: "ויליאם שייקספיר כתב את 'רומיאו ויוליה'.", difficulty: "medium" },
  { id: 111, lang: "en", category: "geography", text: "Which country has the most natural lakes?", options: ["Russia", "Canada", "Finland", "United States"], answer: 1, explanation: "Canada has the most natural lakes in the world.", explanationHe: "לקנדה יש הכי הרבה אגמים טבעיים בעולם.", difficulty: "medium" },
  { id: 112, lang: "en", category: "science", text: "What is the hardest natural substance on Earth?", options: ["Diamond", "Gold", "Iron", "Quartz"], answer: 0, explanation: "Diamond is the hardest natural substance on Earth.", explanationHe: "יהלום הוא החומר הטבעי הקשה ביותר על כדור הארץ.", difficulty: "medium" },
  { id: 113, lang: "en", category: "animals", text: "Which animal has the longest lifespan?", options: ["Elephant", "Tortoise", "Whale", "Parrot"], answer: 1, explanation: "Some tortoises can live over 150 years.", explanationHe: "חלק מהצבים יכולים לחיות מעל 150 שנה.", difficulty: "medium" },
  { id: 114, lang: "en", category: "space", text: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Neptune", "Uranus"], answer: 1, explanation: "Saturn has the most moons in our solar system.", explanationHe: "לשבתאי יש הכי הרבה ירחים במערכת השמש שלנו.", difficulty: "medium" },
  { id: 115, lang: "en", category: "technology", text: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Computer Program Unit"], answer: 0, explanation: "CPU stands for Central Processing Unit.", explanationHe: "CPU הוא קיצור של Central Processing Unit.", difficulty: "medium" },
  { id: 116, lang: "en", category: "sports", text: "In which sport is a shuttlecock used?", options: ["Tennis", "Badminton", "Squash", "Table Tennis"], answer: 1, explanation: "A shuttlecock is used in badminton.", explanationHe: "שבשבת משמשת בבדמינטון.", difficulty: "medium" },
  
  // Hard level questions - very complex
  { id: 101, lang: "en", category: "science", text: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2, explanation: "The chemical symbol for gold is Au (from Latin 'aurum').", explanationHe: "הסמל הכימי לזהב הוא Au (מלטינית 'aurum').", difficulty: "hard" },
  { id: 102, lang: "en", category: "mathematics", text: "What is the value of π (pi) to two decimal places?", options: ["3.14", "3.15", "3.13", "3.16"], answer: 0, explanation: "The value of π to two decimal places is 3.14.", explanationHe: "הערך של π לשני מקומות עשרוניים הוא 3.14.", difficulty: "hard" },
  { id: 103, lang: "en", category: "astronomy", text: "Which planet is known as the 'Red Planet'?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1, explanation: "Mars is known as the 'Red Planet'.", explanationHe: "מאדים נקרא 'כוכב הלכת האדום'.", difficulty: "hard" },
  { id: 104, lang: "en", category: "biology", text: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Cytoplasm"], answer: 1, explanation: "Mitochondria are known as the powerhouse of the cell.", explanationHe: "המיטוכונדריה נקראות תחנת הכוח של התא.", difficulty: "hard" },
  { id: 105, lang: "en", category: "physics", text: "What is the speed of light in a vacuum?", options: ["299,792,458 m/s", "300,000,000 m/s", "299,000,000 m/s", "300,792,458 m/s"], answer: 0, explanation: "The speed of light in a vacuum is 299,792,458 meters per second.", explanationHe: "מהירות האור בריק היא 299,792,458 מטרים בשנייה.", difficulty: "hard" },
  { id: 117, lang: "en", category: "chemistry", text: "What is the pH of pure water at 25°C?", options: ["6", "7", "8", "9"], answer: 1, explanation: "Pure water has a pH of 7 at 25°C.", explanationHe: "למים טהורים יש pH של 7 ב-25°C.", difficulty: "hard" },
  { id: 118, lang: "en", category: "mathematics", text: "What is the derivative of x²?", options: ["x", "2x", "x²", "2x²"], answer: 1, explanation: "The derivative of x² is 2x.", explanationHe: "הנגזרת של x² היא 2x.", difficulty: "hard" },
  { id: 119, lang: "en", category: "biology", text: "How many chambers does a human heart have?", options: ["2", "3", "4", "5"], answer: 2, explanation: "A human heart has 4 chambers: 2 atria and 2 ventricles.", explanationHe: "ללב אנושי יש 4 חדרים: 2 עליות ו-2 חדרים.", difficulty: "hard" },
  { id: 120, lang: "en", category: "astronomy", text: "What is the closest star to Earth after the Sun?", options: ["Alpha Centauri", "Proxima Centauri", "Sirius", "Vega"], answer: 1, explanation: "Proxima Centauri is the closest star to Earth after the Sun.", explanationHe: "פרוקסימה קנטאורי הוא הכוכב הקרוב ביותר לכדור הארץ אחרי השמש.", difficulty: "hard" },
  { id: 121, lang: "en", category: "geology", text: "What type of rock is formed from cooled magma?", options: ["Sedimentary", "Metamorphic", "Igneous", "Fossil"], answer: 2, explanation: "Igneous rocks are formed from cooled magma.", explanationHe: "סלעי יסוד נוצרים ממגמה שהתקררה.", difficulty: "hard" },
  { id: 122, lang: "en", category: "anatomy", text: "How many bones are in an adult human body?", options: ["186", "206", "226", "246"], answer: 1, explanation: "An adult human body has 206 bones.", explanationHe: "לגוף אנושי בוגר יש 206 עצמות.", difficulty: "hard" },
  { id: 123, lang: "en", category: "chemistry", text: "What is the chemical formula for table salt?", options: ["NaCl", "KCl", "CaCl₂", "MgCl₂"], answer: 0, explanation: "Table salt is NaCl (sodium chloride).", explanationHe: "מלח שולחן הוא NaCl (נתרן כלורי).", difficulty: "hard" },
  { id: 124, lang: "en", category: "physics", text: "What is the unit of electrical resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], answer: 2, explanation: "Electrical resistance is measured in Ohms.", explanationHe: "התנגדות חשמלית נמדדת באוהם.", difficulty: "hard" },
  { id: 125, lang: "en", category: "biology", text: "What is the largest organ in the human body?", options: ["Liver", "Lungs", "Skin", "Brain"], answer: 2, explanation: "The skin is the largest organ in the human body.", explanationHe: "העור הוא האיבר הגדול ביותר בגוף האנושי.", difficulty: "hard" },
  
  // Extreme level questions - expert level
  { id: 106, lang: "en", category: "chemistry", text: "What is the molecular formula for caffeine?", options: ["C8H10N4O2", "C7H8N4O2", "C8H10N4O3", "C9H10N4O2"], answer: 0, explanation: "The molecular formula for caffeine is C8H10N4O2.", explanationHe: "הנוסחה המולקולרית של קפאין היא C8H10N4O2.", difficulty: "extreme" },
  { id: 107, lang: "en", category: "quantum_physics", text: "What principle states that you cannot simultaneously know both the position and momentum of a particle?", options: ["Uncertainty Principle", "Exclusion Principle", "Complementarity Principle", "Correspondence Principle"], answer: 0, explanation: "The Uncertainty Principle states this limitation.", explanationHe: "עקרון אי-הוודאות קובע את המגבלה הזו.", difficulty: "extreme" },
  { id: 108, lang: "en", category: "advanced_math", text: "What is the derivative of e^x?", options: ["e^x", "x·e^x", "e^(x-1)", "ln(x)"], answer: 0, explanation: "The derivative of e^x is e^x.", explanationHe: "הנגזרת של e^x היא e^x.", difficulty: "extreme" },
  { id: 109, lang: "en", category: "neuroscience", text: "Which neurotransmitter is primarily associated with pleasure and reward?", options: ["Serotonin", "Dopamine", "GABA", "Acetylcholine"], answer: 1, explanation: "Dopamine is primarily associated with pleasure and reward.", explanationHe: "דופמין קשור בעיקר לעונג ותגמול.", difficulty: "extreme" },
  { id: 110, lang: "en", category: "advanced_biology", text: "What is the name of the process by which cells break down glucose to produce ATP?", options: ["Photosynthesis", "Cellular respiration", "Fermentation", "Glycolysis"], answer: 1, explanation: "Cellular respiration is the process of breaking down glucose to produce ATP.", explanationHe: "נשימה תאית היא התהליך של פירוק גלוקוז לייצור ATP.", difficulty: "extreme" },
  { id: 126, lang: "en", category: "quantum_mechanics", text: "What is the name of the phenomenon where particles can be in multiple states simultaneously?", options: ["Superposition", "Entanglement", "Tunneling", "Decoherence"], answer: 0, explanation: "Superposition allows particles to exist in multiple states simultaneously.", explanationHe: "סופרפוזיציה מאפשרת לחלקיקים להתקיים במספר מצבים בו-זמנית.", difficulty: "extreme" },
  { id: 127, lang: "en", category: "advanced_chemistry", text: "What is the name of the process by which plants convert light energy into chemical energy?", options: ["Respiration", "Photosynthesis", "Fermentation", "Digestion"], answer: 1, explanation: "Photosynthesis converts light energy into chemical energy.", explanationHe: "פוטוסינתזה ממירה אנרגיית אור לאנרגיה כימית.", difficulty: "extreme" },
  { id: 128, lang: "en", category: "astrophysics", text: "What is the name of the boundary around a black hole from which nothing can escape?", options: ["Event horizon", "Schwarzschild radius", "Photon sphere", "Accretion disk"], answer: 0, explanation: "The event horizon is the boundary from which nothing can escape a black hole.", explanationHe: "אופק האירועים הוא הגבול שממנו שום דבר לא יכול לברוח מחור שחור.", difficulty: "extreme" },
  { id: 129, lang: "en", category: "molecular_biology", text: "What is the name of the enzyme that synthesizes DNA from RNA?", options: ["DNA polymerase", "Reverse transcriptase", "RNA polymerase", "Helicase"], answer: 1, explanation: "Reverse transcriptase synthesizes DNA from RNA.", explanationHe: "ריברס טרנסקריפטאז מסנתז DNA מ-RNA.", difficulty: "extreme" },
  { id: 130, lang: "en", category: "thermodynamics", text: "What is the name of the law that states entropy always increases in an isolated system?", options: ["First law of thermodynamics", "Second law of thermodynamics", "Third law of thermodynamics", "Zeroth law of thermodynamics"], answer: 1, explanation: "The second law of thermodynamics states that entropy always increases.", explanationHe: "החוק השני של התרמודינמיקה קובע שהאנטרופיה תמיד גדלה.", difficulty: "extreme" },
  { id: 131, lang: "en", category: "genetics", text: "What is the name of the process by which genetic information is transferred from DNA to RNA?", options: ["Translation", "Transcription", "Replication", "Mutation"], answer: 1, explanation: "Transcription transfers genetic information from DNA to RNA.", explanationHe: "שעתוק מעביר מידע גנטי מ-DNA ל-RNA.", difficulty: "extreme" },
  { id: 132, lang: "en", category: "particle_physics", text: "What is the name of the particle that gives other particles their mass?", options: ["Photon", "Higgs boson", "Neutrino", "Gluon"], answer: 1, explanation: "The Higgs boson gives other particles their mass.", explanationHe: "בוזון היגס נותן לחלקיקים אחרים את המסה שלהם.", difficulty: "extreme" },
  { id: 133, lang: "en", category: "organic_chemistry", text: "What is the name of the functional group -COOH?", options: ["Hydroxyl", "Carbonyl", "Carboxyl", "Amino"], answer: 2, explanation: "The -COOH group is called carboxyl.", explanationHe: "הקבוצה -COOH נקראת קרבוקסיל.", difficulty: "extreme" },
  { id: 134, lang: "en", category: "cell_biology", text: "What is the name of the organelle responsible for protein synthesis?", options: ["Mitochondria", "Ribosome", "Nucleus", "Endoplasmic reticulum"], answer: 1, explanation: "Ribosomes are responsible for protein synthesis.", explanationHe: "ריבוזומים אחראים לסינתזת חלבונים.", difficulty: "extreme" },
  { id: 135, lang: "en", category: "electromagnetism", text: "What is the name of the law that describes the relationship between electric current and magnetic field?", options: ["Ohm's law", "Faraday's law", "Ampere's law", "Gauss's law"], answer: 2, explanation: "Ampere's law describes the relationship between current and magnetic field.", explanationHe: "חוק אמפר מתאר את הקשר בין זרם חשמלי לשדה מגנטי.", difficulty: "extreme" },
  { id: 136, lang: "en", category: "biochemistry", text: "What is the name of the process by which cells divide?", options: ["Meiosis", "Mitosis", "Cytokinesis", "Apoptosis"], answer: 1, explanation: "Mitosis is the process by which cells divide.", explanationHe: "מיטוזה הוא התהליך שבו תאים מתחלקים.", difficulty: "extreme" },
  { id: 137, lang: "en", category: "relativity", text: "What is the name of Einstein's theory that describes gravity as the curvature of spacetime?", options: ["Special relativity", "General relativity", "Quantum mechanics", "String theory"], answer: 1, explanation: "General relativity describes gravity as the curvature of spacetime.", explanationHe: "תורת היחסות הכללית מתארת את הכבידה כעקמומיות של מרחב-זמן.", difficulty: "extreme" },
  { id: 138, lang: "en", category: "immunology", text: "What is the name of the cells that produce antibodies?", options: ["T cells", "B cells", "NK cells", "Macrophages"], answer: 1, explanation: "B cells produce antibodies.", explanationHe: "תאי B מייצרים נוגדנים.", difficulty: "extreme" },
  { id: 139, lang: "en", category: "crystallography", text: "What is the name of the repeating pattern in a crystal structure?", options: ["Unit cell", "Lattice", "Crystal system", "Space group"], answer: 1, explanation: "The lattice is the repeating pattern in a crystal structure.", explanationHe: "הסריג הוא הדפוס החוזר במבנה הגביש.", difficulty: "extreme" },
  { id: 140, lang: "en", category: "neurochemistry", text: "What is the name of the neurotransmitter that is primarily inhibitory in the central nervous system?", options: ["Glutamate", "GABA", "Dopamine", "Serotonin"], answer: 1, explanation: "GABA is the primary inhibitory neurotransmitter in the CNS.", explanationHe: "GABA הוא הנוירוטרנסמיטר המעכב העיקרי במערכת העצבים המרכזית.", difficulty: "extreme" },
  { id: 141, lang: "en", category: "meteorology", text: "What is the name of the layer of the atmosphere where most weather occurs?", options: ["Stratosphere", "Troposphere", "Mesosphere", "Thermosphere"], answer: 1, explanation: "The troposphere is where most weather occurs.", explanationHe: "הטרופוספירה היא המקום שבו מתרחש רוב מזג האוויר.", difficulty: "extreme" },
  { id: 142, lang: "en", category: "pharmacology", text: "What is the name of the study of how drugs interact with living organisms?", options: ["Pharmacokinetics", "Pharmacodynamics", "Pharmacology", "Toxicology"], answer: 2, explanation: "Pharmacology is the study of drug interactions with living organisms.", explanationHe: "פרמקולוגיה היא חקר האינטראקציות של תרופות עם אורגניזמים חיים.", difficulty: "extreme" },
];

const difficulties = [
  { key: "easy", label: "Easy", count: 10 },
  { key: "medium", label: "Medium", count: 15 },
  { key: "hard", label: "Hard", count: 18 },
  { key: "extreme", label: "Extreme", count: 25 },
  { key: "duel", label: "Duel", count: 21 },
];

const CATEGORIES = [
  { key: "all", label: "הכל", icon: "🌈" },
  { key: "animals", label: "בעלי חיים", icon: "🐾" },
  { key: "food", label: "אוכל", icon: "🍎" },
  { key: "school", label: "בית ספר", icon: "🏫" },
  { key: "transport", label: "תחבורה", icon: "🚗" },
  { key: "nature", label: "טבע", icon: "🌿" },
  { key: "colors", label: "צבעים", icon: "🎨" },
  { key: "family", label: "משפחה", icon: "👨‍👩‍👧‍👦" },
  { key: "sports", label: "ספורט", icon: "🏅" },
  { key: "weather", label: "מזג אוויר", icon: "⛅" },
  { key: "time", label: "זמן", icon: "⏰" }
];

const getInitialTime = (difficulty: string): number => {
  switch (difficulty) {
    case 'easy': return 60;
    case 'medium': return 45;
    case 'hard': return 30;
    case 'extreme': return 20;
    default: return 60;
  }
};

function getStats(name: string) {
  if (!name) return { games: 0, wins: 0, totalScore: 0 };
  try {
    return JSON.parse(localStorage.getItem('quiz-stats-' + name) || '{"games":0,"wins":0,"totalScore":0}');
  } catch {
    return { games: 0, wins: 0, totalScore: 0 };
  }
}

function setStats(name: string, stats: any) {
  if (!name) return;
  localStorage.setItem('quiz-stats-' + name, JSON.stringify(stats));
}

function pickQuestions(all: readonly Question[], lang: 'en' | 'he', count: number, category: string, difficulty: string = 'easy') {
  let pool = all.filter(q => q.lang === lang);
  if (category && category !== "all") pool = pool.filter(q => q.category === category);
  // אם יש רמת קושי מוגדרת, בחר רק שאלות ברמה הזו
  if (difficulty && difficulty !== 'all') {
    pool = pool.filter(q => q.difficulty === difficulty || !q.difficulty); // כולל שאלות ללא רמת קושי מוגדרת
  }
  return pool.sort(() => Math.random() - 0.5).slice(0, count);
}

const Page = () => {
  const { user } = useAuthUser();
  const [lang, setLang] = useState<'en' | 'he'>('en');
  const [difficulty, setDifficulty] = useState('easy');
  const [category, setCategory] = useState<string>("all");
  const [gameMode, setGameMode] = useState<'local' | 'online' | 'bot'>('local');
  const [questions, setQuestions] = useState<readonly Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [player1, setPlayer1] = useState<Player>({ name: "", score: 0, correct: 0, mistakes: 0 });
  const [player2, setPlayer2] = useState<Player>({ name: "", score: 0, correct: 0, mistakes: 0 });
  const [player1Input, setPlayer1Input] = useState("");
  const [player2Input, setPlayer2Input] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<number|null>(null);
  const [feedback, setFeedback] = useState<string|null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const confettiRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState(getInitialTime(difficulty));
  const [timeUp, setTimeUp] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const router = useRouter();
  const successAudio = useRef<HTMLAudioElement>(null);
  const failAudio = useRef<HTMLAudioElement>(null);
  const [inventory, setInventory] = useState<{[key: string]: number}>({});
  const [hintMsg, setHintMsg] = useState<string | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard' | 'extreme'>('medium');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [useLearnedWords, setUseLearnedWords] = useState(false);
  const [learnedWordsData, setLearnedWordsData] = useState<Array<{word: string, translation: string}>>([]);
  const [loadingLearnedWords, setLoadingLearnedWords] = useState(false);
  const [selectedWordsCount, setSelectedWordsCount] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<Array<{word: string, translation: string}>>([]);

  // הישגים למשחק Picture Description Duel
  const DUEL_ACHIEVEMENTS = [
    { id: 'first_duel', name: 'דו-קרב ראשון', icon: '⚔️', description: 'השלם דו-קרב ראשון', reward: 100 },
    { id: 'bot_beater', name: 'מנצח בוטים', icon: '🤖', description: 'ניצח בוט ברמת קושי קשה', reward: 300 },
    { id: 'extreme_master', name: 'מאסטר אקסטרים', icon: '💀', description: 'ניצח בוט ברמת אקסטרים', reward: 500 },
    { id: 'perfect_duel', name: 'דו-קרב מושלם', icon: '💯', description: 'השלם דו-קרב ללא טעויות', reward: 400 },
    { id: 'speed_duelist', name: 'דו-קרב מהיר', icon: '⚡', description: 'השלם דו-קרב תוך 30 שניות', reward: 250 },
    { id: 'duel_legend', name: 'אגדת דו-קרב', icon: '👑', description: 'השלם 25 דו-קרבות', reward: 800 },
    { id: 'bot_destroyer', name: 'משמיד בוטים', icon: '🔥', description: 'ניצח 10 בוטים ברצף', reward: 600 },
    { id: 'extreme_challenger', name: 'מאתגר אקסטרים', icon: '💀', description: 'השלם 5 משחקים ברמת אקסטרים', reward: 700 },
    { id: 'perfect_streak', name: 'רצף מושלם', icon: '💎', description: 'השג 10 תשובות נכונות ברצף', reward: 300 },
    { id: 'duel_master', name: 'מאסטר דו-קרב', icon: '🏆', description: 'השלם 50 דו-קרבות', reward: 1200 },
  ];

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

  // המר מילים שנלמדו לשאלות
  const createQuestionsFromLearnedWords = (words: Array<{word: string, translation: string}>, count: number): Question[] => {
    const questions: Question[] = [];
    const usedWords = new Set<string>();
    
    words.forEach((wordData, index) => {
      if (questions.length >= count) return;
      if (usedWords.has(wordData.word.toLowerCase())) return;
      
      // צור שאלה פשוטה מהמילה
      const word = wordData.word;
      const translation = wordData.translation || word;
      
      // נסה למצוא שאלה קיימת שהמילה היא התשובה הנכונה שלה
      const existingQuestion = QUESTIONS.find(q => 
        q.options[q.answer]?.toLowerCase() === word.toLowerCase()
      );
      
      if (existingQuestion) {
        // נסה למצוא תרגום טוב יותר אם התרגום זהה למילה
        let finalTranslation = translation;
        if (translation === word || !translation || translation.trim() === '') {
          // נסה למצוא תרגום מהשאלות הקיימות
          const matchingQuestion = QUESTIONS.find(q => 
            q.options[q.answer]?.toLowerCase() === word.toLowerCase()
          );
          if (matchingQuestion?.explanationHe) {
            finalTranslation = matchingQuestion.explanationHe.split('-')[0]?.trim() || word;
          } else {
            finalTranslation = word;
          }
        }
        
        // אם יש שאלה קיימת שהמילה היא התשובה הנכונה, נשנה את הטקסט לאנגלית עם המילה בעברית
        const modifiedQuestion = {
          ...existingQuestion,
          text: finalTranslation !== word
            ? `What is the English word for "${finalTranslation}"?`
            : `What is the English word "${word}"?`,
          explanation: finalTranslation !== word
            ? `The English word for "${finalTranslation}" is "${word}".`
            : `The English word "${word}".`,
          explanationHe: finalTranslation !== word
            ? `המילה "${word}" פירושה "${finalTranslation}"`
            : `המילה "${word}" היא מילה באנגלית`
        };
        questions.push(modifiedQuestion);
        usedWords.add(word.toLowerCase());
      } else {
        // צור שאלה חדשה מהמילה
        // נסה למצוא מילים דומות לאופציות (רק באנגלית)
        const similarWords = QUESTIONS
          .flatMap(q => q.options)
          .filter(opt => opt.toLowerCase() !== word.toLowerCase())
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        const options = [word, ...similarWords].sort(() => Math.random() - 0.5);
        const answerIndex = options.indexOf(word);
        
        // נסה למצוא תרגום טוב יותר אם התרגום זהה למילה
        let finalTranslation = translation;
        if (translation === word || !translation || translation.trim() === '') {
          // נסה למצוא תרגום מהשאלות הקיימות
          const matchingQuestion = QUESTIONS.find(q => 
            q.options[q.answer]?.toLowerCase() === word.toLowerCase()
          );
          if (matchingQuestion?.explanationHe) {
            finalTranslation = matchingQuestion.explanationHe.split('-')[0]?.trim() || word;
          } else {
            finalTranslation = word;
          }
        }
        
        questions.push({
          id: 1000 + index,
          lang: 'en', // השאלה באנגלית
          category: 'learned',
          text: finalTranslation !== word
            ? `What is the English word for "${finalTranslation}"?`
            : `What is the English word "${word}"?`,
          options: options as readonly string[], // האופציות באנגלית
          answer: answerIndex,
          explanation: finalTranslation !== word
            ? `The English word for "${finalTranslation}" is "${word}".`
            : `The English word "${word}".`,
          explanationHe: finalTranslation !== word
            ? `המילה "${word}" פירושה "${finalTranslation}"`
            : `המילה "${word}" היא מילה באנגלית`,
          difficulty: 'easy'
        });
        usedWords.add(word.toLowerCase());
      }
    });
    
    return questions.slice(0, count);
  };

  useEffect(() => {
    const diff = difficulties.find(d => d.key === difficulty)!;
    
    if (useLearnedWords && learnedWordsData.length > 0) {
      // השתמש במילים שנלמדו - אם יש כמות נבחרת, השתמש בה
      const wordsToUse = selectedWordsCount && selectedWords.length > 0 
        ? selectedWords.slice(0, selectedWordsCount)
        : learnedWordsData;
      
      const learnedQuestions = createQuestionsFromLearnedWords(wordsToUse, diff.count);
      if (learnedQuestions.length > 0) {
        setQuestions(learnedQuestions);
      } else {
        // אם אין מספיק שאלות, השתמש בשאלות רגילות
    setQuestions(pickQuestions(QUESTIONS, lang, diff.count, category, difficulty));
      }
    } else {
      // השתמש בשאלות רגילות
      setQuestions(pickQuestions(QUESTIONS, lang, diff.count, category, difficulty));
    }
    
    setCurrent(0);
    setSelected(null);
    setFeedback(null);
    setShowExplanation(false);
    setFinished(false);
    setTimer(0);
    setCountdown(getInitialTime(difficulty));
    setTimeUp(false);
  }, [difficulty, lang, category, useLearnedWords, learnedWordsData, selectedWordsCount, selectedWords]);

  useEffect(() => {
    if (feedback === 'correct' && confettiRef.current) {
      confettiRef.current.classList.add('show');
      confetti();
      setTimeout(() => confettiRef.current?.classList.remove('show'), 1200);
    }
  }, [feedback]);

  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [finished]);

  useEffect(() => {
    if (finished || timeUp) return;
    if (countdown <= 0) {
      setTimeUp(true);
      handleTimeUp();
      return;
    }
    const interval = setInterval(() => setCountdown(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [finished, timeUp, countdown]);

  useEffect(() => {
    try {
      const inv = JSON.parse(localStorage.getItem('quiz-inventory') || '{}');
      setInventory(inv);
      console.log('Loaded inventory from localStorage (picture-description-duel):', inv);
    } catch {
      console.log('Failed to load inventory from localStorage (picture-description-duel)');
    }
  }, []);

  // טען מילים שנלמדו כשהמשתמש בוחר במצב learned words
  useEffect(() => {
    if (useLearnedWords && user && learnedWordsData.length === 0 && !loadingLearnedWords) {
      loadLearnedWords();
    }
  }, [useLearnedWords, user]);

  const playSound = (type: 'success' | 'fail') => {
    if (type === 'success' && successAudio.current) {
      successAudio.current.currentTime = 0;
      successAudio.current.play();
    } else if (type === 'fail' && failAudio.current) {
      failAudio.current.currentTime = 0;
      failAudio.current.play();
    }
  };

  function handleTimeUp() {
    const currentPlayerObj = currentPlayer === 1 ? player1 : player2;
    const setCurrentPlayerObj = currentPlayer === 1 ? setPlayer1 : setPlayer2;
    
    setCurrentPlayerObj(prev => ({
      ...prev,
      mistakes: prev.mistakes + 1
    }));
    
    setFeedback('wrong');
    playSound('fail');
    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      setShowExplanation(false);
      if (current === questions.length - 1) {
        setFinished(true);
      } else {
        setCurrent(c => c + 1);
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        setCountdown(getInitialTime(difficulty));
        setTimeUp(false);
      }
    }, 1200);
  }

  function handleSelect(idx: number) {
    if (selected !== null) return;
    
    setSelected(idx);
    setShowExplanation(true);
    
    const currentPlayerObj = currentPlayer === 1 ? player1 : player2;
    const setCurrentPlayerObj = currentPlayer === 1 ? setPlayer1 : setPlayer2;
    
    if (idx === questions[current].answer) {
      setCurrentPlayerObj(prev => ({
        ...prev,
        score: prev.score + 10,
        correct: prev.correct + 1
      }));
      setFeedback('correct');
      playSound('success');
      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
        setShowExplanation(false);
        if (current === questions.length - 1) {
          setFinished(true);
        } else {
          setCurrent(c => c + 1);
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
          setCountdown(getInitialTime(difficulty));
        }
      }, 4000);
    } else {
      setCurrentPlayerObj(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1
      }));
      setFeedback('wrong');
      playSound('fail');
      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
        setShowExplanation(false);
        if (current === questions.length - 1) {
          setFinished(true);
        } else {
          setCurrent(c => c + 1);
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
          setCountdown(getInitialTime(difficulty));
        }
      }, 4000);
    }
  }

  function startGame() {
    console.log('startGame called', player1Input, player2Input);
    
    // אם משתמש במילים שנלמדו, ודא שהמילים נטענו
    if (useLearnedWords) {
      if (!user) {
        alert('אנא התחבר כדי לשחק עם המילים שלמדת');
        return;
      }
      if (learnedWordsData.length === 0) {
        alert('אין מילים שנלמדו עדיין! אנא שחק במשחקים אחרים כדי ללמוד מילים.');
        return;
      }
    }
    if (!player1Input) {
      alert('נא להזין שם לשחקן הראשון');
      return;
    }
    
    if (gameMode === 'bot') {
      setPlayer1({ name: player1Input, score: 0, correct: 0, mistakes: 0 });
      setPlayer2({ name: "בוט חכם", score: 0, correct: 0, mistakes: 0 });
    } else {
      if (!player2Input) {
        alert('נא להזין שם לשחקן השני');
        return;
      }
      setPlayer1({ name: player1Input, score: 0, correct: 0, mistakes: 0 });
      setPlayer2({ name: player2Input, score: 0, correct: 0, mistakes: 0 });
    }
    
    setGameStarted(true);
    
    // בחר שאלות - מילים שנלמדו או רגילות
    const diff = difficulties.find(d => d.key === difficulty)!;
    if (useLearnedWords && learnedWordsData.length > 0) {
      const learnedQuestions = createQuestionsFromLearnedWords(learnedWordsData, diff.count);
      if (learnedQuestions.length > 0) {
        setQuestions(learnedQuestions);
      } else {
        alert('אין מספיק שאלות מהמילים שנלמדו. משתמש בשאלות רגילות.');
        setQuestions(pickQuestions(QUESTIONS, lang, diff.count, category, difficulty));
      }
    } else {
      setQuestions(pickQuestions(QUESTIONS, lang, diff.count, category, difficulty));
    }
    
    setCurrent(0);
    setSelected(null);
    setFeedback(null);
    setShowExplanation(false);
    setFinished(false);
    setTimer(0);
    setCountdown(getInitialTime(difficulty));
    setTimeUp(false);
    setCurrentPlayer(1);
  }

  function resetGame() {
    setPlayer1Input("");
    setPlayer2Input("");
    setGameStarted(false);
    setPlayer1({ name: "", score: 0, correct: 0, mistakes: 0 });
    setPlayer2({ name: "", score: 0, correct: 0, mistakes: 0 });
    setBotThinking(false);
  }

  const handleHint = () => {
    if ((inventory['hint'] || 0) <= 0 || finished) return;
    setShowExplanation(true);
    setHintMsg('💡 השתמשת ברמז! ההסבר מוצג למטה.');
    setInventory(inv => {
      const newInv = { ...inv, hint: (inv['hint'] || 0) - 1 };
      localStorage.setItem('quiz-inventory', JSON.stringify(newInv));
      return newInv;
    });
    setTimeout(() => setHintMsg(null), 2000);
  };

  // לוגיקת הבוט
  const botMakeMove = () => {
    if (botThinking || finished || currentPlayer !== 2 || gameMode !== 'bot') return;
    
    setBotThinking(true);
    
    // הבוט חושב 1-3 שניות
    setTimeout(() => {
      const question = questions[current];
      if (!question) {
        setBotThinking(false);
        return;
      }
      
      let selectedAnswer = 0;
      
      // לוגיקת הבוט לפי רמת קושי
      if (botDifficulty === 'easy') {
        // בוט קל - 60% סיכוי לתשובה נכונה
        selectedAnswer = Math.random() < 0.6 ? question.answer : Math.floor(Math.random() * question.options.length);
      } else if (botDifficulty === 'medium') {
        // בוט בינוני - 75% סיכוי לתשובה נכונה
        selectedAnswer = Math.random() < 0.75 ? question.answer : Math.floor(Math.random() * question.options.length);
      } else if (botDifficulty === 'hard') {
        // בוט קשה - 85% סיכוי לתשובה נכונה
        selectedAnswer = Math.random() < 0.85 ? question.answer : Math.floor(Math.random() * question.options.length);
      } else {
        // בוט אקסטרים - 100% דיוק!
        selectedAnswer = question.answer;
      }
      
      // הבוט בוחר תשובה
      handleSelect(selectedAnswer);
      setBotThinking(false);
    }, Math.random() * 2000 + 1000);
  };

  // התחל תור הבוט אחרי שהשחקן סיים
  useEffect(() => {
    if (gameMode === 'bot' && currentPlayer === 2 && !botThinking && !finished && gameStarted) {
      botMakeMove();
    }
  }, [currentPlayer, gameMode, botThinking, finished, gameStarted]);

  // עדכון ניקוד במסד נתונים כשהמשחק מסתיים
  useEffect(() => {
    if (finished && gameMode === 'bot' && player1.score > player2.score) {
      // עדכון ניקוד במסד נתונים
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        
        // עדכון ניקוד במסד נתונים
        fetch('/api/games/update-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            gameName: 'picture-description-duel',
            score: player1.score,
            won: true
          })
        }).then(() => {
          // עדכון רמה
          fetch('/api/user/update-rank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
          });
        }).catch(err => console.error('Error updating stats:', err));
        
        // עדכון localStorage
        user.points += player1.score;
        user.gamesPlayed += 1;
        user.gamesWon += 1;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  }, [finished, gameMode, player1.score, player2.score]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-700 to-purple-900">
      {/* Top Banner Ad */}
      <AdManager showBanner={true} bannerPosition="top" testMode={false} />
      
      <div ref={confettiRef} className="confetti" />
      <div className="max-w-2xl w-full mx-auto bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 transition-all duration-700">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 text-center mb-6">קרב זוגי</h1>
        {!gameStarted && (
          <div className="flex flex-col gap-6 items-center justify-center mt-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">התחל קרב זוגי</h2>
            
            {/* בחירת מצב משחק - רגיל או מילים שנלמדו */}
            <div className="w-full mb-4 bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-3 text-center">בחר מקור שאלות:</h3>
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
                  🎮 שאלות רגילות
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
                      📚 שאלות מהמילים שנלמדו
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
              
              {/* בחירת כמות מילים (רק אם יש מילים שנלמדו) */}
              {useLearnedWords && learnedWordsData.length > 0 && !loadingLearnedWords && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <label className="block text-sm font-bold text-blue-800 mb-2 text-center">
                    בחר כמות מילים למשחק:
                  </label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 justify-center">
                      <input
                        type="radio"
                        id="all-words-pdd"
                        name="word-count-pdd"
                        checked={selectedWordsCount === null}
                        onChange={() => {
                          setSelectedWordsCount(null);
                          setSelectedWords([]);
                        }}
                        className="w-5 h-5"
                      />
                      <label htmlFor="all-words-pdd" className="text-sm font-semibold text-gray-700 cursor-pointer">
                        כל המילים ({learnedWordsData.length})
                      </label>
                    </div>
                    <div className="flex items-center gap-3 justify-center">
                      <input
                        type="radio"
                        id="custom-count-pdd"
                        name="word-count-pdd"
                        checked={selectedWordsCount !== null}
                        onChange={() => {
                          setSelectedWordsCount(Math.min(40, learnedWordsData.length));
                          setSelectedWords([...learnedWordsData].sort(() => Math.random() - 0.5));
                        }}
                        className="w-5 h-5"
                      />
                      <label htmlFor="custom-count-pdd" className="text-sm font-semibold text-gray-700 cursor-pointer">
                        כמות ספציפית:
                      </label>
                      {selectedWordsCount !== null && (
                        <input
                          type="number"
                          min="1"
                          max={learnedWordsData.length}
                          value={selectedWordsCount}
                          onChange={(e) => {
                            const count = parseInt(e.target.value) || 1;
                            const maxCount = Math.min(count, learnedWordsData.length);
                            setSelectedWordsCount(maxCount);
                            setSelectedWords([...learnedWordsData].sort(() => Math.random() - 0.5));
                          }}
                          className="w-20 px-2 py-1 border-2 border-blue-300 rounded-lg text-center font-bold"
                        />
                      )}
                    </div>
                    {selectedWordsCount !== null && (
                      <p className="text-xs text-gray-600 text-center mt-2">
                        המילים נבחרות אקראית מתוך {learnedWordsData.length} מילים זמינות
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* בחירת מצב משחק */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setGameMode('local')}
                className={`px-4 py-2 rounded-full font-bold transition-all duration-200 ${
                  gameMode === 'local'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                משחק מקומי
              </button>
              <button
                onClick={() => setGameMode('bot')}
                className={`px-4 py-2 rounded-full font-bold transition-all duration-200 ${
                  gameMode === 'bot'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                משחק מול בוט
              </button>
            </div>
            
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <input value={player1Input} onChange={e=>setPlayer1Input(e.target.value)} placeholder="שם שחקן 1" className="border-2 border-blue-300 rounded px-4 py-2 text-lg text-right" />
              {gameMode === 'local' && (
                <input value={player2Input} onChange={e=>setPlayer2Input(e.target.value)} placeholder="שם שחקן 2" className="border-2 border-blue-300 rounded px-4 py-2 text-lg text-right" />
              )}
              {gameMode === 'bot' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-blue-700">רמת קושי הבוט:</label>
                  <select 
                    value={botDifficulty} 
                    onChange={e => setBotDifficulty(e.target.value as 'easy' | 'medium' | 'hard' | 'extreme')}
                    className="border-2 border-blue-300 rounded px-4 py-2 text-lg"
                  >
                    <option value="easy">קל (60% דיוק)</option>
                    <option value="medium">בינוני (75% דיוק)</option>
                    <option value="hard">קשה (85% דיוק)</option>
                    <option value="extreme">אקסטרים (100% דיוק!)</option>
                  </select>
                </div>
              )}
              
              {/* בחירת רמת קושי */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-blue-700">רמת קושי:</label>
                <select 
                  value={difficulty} 
                  onChange={e => setDifficulty(e.target.value)}
                  className="border-2 border-blue-300 rounded px-4 py-2 text-lg"
                >
                  <option value="easy">קל (10 שאלות, 60 שניות)</option>
                  <option value="medium">בינוני (15 שאלות, 45 שניות)</option>
                  <option value="hard">קשה (18 שאלות, 30 שניות)</option>
                  <option value="extreme">אקסטרים (25 שאלות, 20 שניות)</option>
                  <option value="duel">דו-קרב (21 שאלות, 60 שניות)</option>
                </select>
              </div>
              
              <button onClick={startGame} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold text-lg mt-2 shadow-lg hover:scale-105 transition">
                {gameMode === 'bot' ? 'התחל קרב מול בוט' : 'התחל קרב זוגי'}
              </button>
            </div>
          </div>
        )}
        {gameStarted && !finished && questions.length > 0 && questions[current] ? (
          <div className="flex flex-col gap-4 items-center mt-4">
            <div className="w-full flex justify-between mb-4">
              <div className={`px-4 py-2 rounded-xl font-bold ${currentPlayer === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{player1.name}: {player1.score}</div>
              <div className={`px-4 py-2 rounded-xl font-bold ${currentPlayer === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{player2.name}: {player2.score}</div>
            </div>
            <div className="w-full h-4 bg-blue-100 rounded-full mb-6 overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-700" style={{ width: `${((current+1)/questions.length)*100}%` }} />
              <div className="absolute inset-0 flex items-center justify-center text-blue-700 font-bold text-sm">{current+1}/{questions.length}</div>
            </div>
            <div className="text-xl font-bold text-center mb-4">
              {currentPlayer === 1 ? `תור ${player1.name}` : gameMode === 'bot' && botThinking ? 'הבוט חושב...' : `תור ${player2.name}`}
            </div>
            <div className="bg-red-100 px-4 py-2 rounded-xl font-bold mb-4">זמן: {countdown}</div>
            <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl shadow p-4 mb-4 text-xl font-bold text-blue-900 text-center animate-fade-in">{questions[current]?.text}</div>
            <div className="flex flex-col gap-3 mb-4">
              {questions[current]?.options?.map((opt, idx) => (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null || (gameMode === 'bot' && currentPlayer === 2)}
                  className={`w-full px-6 py-3 rounded-2xl font-bold text-lg shadow transition-all duration-200 border-2 flex items-center gap-2 answer-button
                    ${selected === idx
                      ? idx === questions[current]?.answer
                        ? 'selected-correct scale-105'
                        : 'selected-wrong shake'
                      : ''}`}
                >{opt}</button>
              ))}
            </div>
            {feedback === 'correct' && (
              <div className="flex flex-col items-center justify-center animate-fade-in">
                <div className="bg-white border-2 border-green-400 rounded-2xl px-8 py-6 text-2xl font-bold text-green-700 shadow-lg flex items-center gap-2 mb-2">
                  <span>🎉</span> נכון! <span>🎉</span>
                </div>
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="flex flex-col items-center justify-center animate-fade-in">
                <div className="bg-white border-2 border-red-400 rounded-2xl px-8 py-6 text-2xl font-bold text-red-700 shadow-lg flex items-center gap-2 mb-2">
                  <span>❌</span> לא נכון <span>❌</span>
                </div>
              </div>
            )}
            {showExplanation && (
              <>
                <div className="bg-green-100 border-l-4 border-green-400 rounded-xl px-6 py-3 text-md font-bold text-green-900 shadow mb-2 animate-fade-in">
                  {questions[current]?.explanation}
                </div>
                {questions[current]?.explanationHe && (
                  <div className="bg-blue-100 border-l-4 border-blue-400 rounded-xl px-6 py-3 text-md font-bold text-blue-900 shadow mb-2 animate-fade-in">
                    {questions[current]?.explanationHe}
                  </div>
                )}
              </>
            )}
            <button
              onClick={handleHint}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-5 py-2 rounded-lg font-bold shadow-lg hover:from-amber-600 hover:to-yellow-500 transition-all duration-200 ml-2 border-2 border-yellow-300"
              disabled={(inventory['hint'] || 0) <= 0 || finished}
              style={{
                boxShadow: '0 0 15px rgba(255,193,7,0.5), 0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              💡 קבל רמז ({inventory['hint'] || 0})
            </button>
            {hintMsg && (
              <div className="text-center text-yellow-700 font-bold animate-fade-in mt-2">{hintMsg}</div>
            )}
          </div>
        ) : null}
        {gameStarted && !finished && (!questions.length || !questions[current]) && (
          <div className="text-center text-red-600 font-bold text-xl mt-8">לא נמצאו שאלות מתאימות. נסה לבחור קטגוריה או רמה אחרת.</div>
        )}
        {finished && (
          <div className="text-center mt-6 animate-fade-in">
            <div className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center gap-2">
              <span className="text-green-500 text-3xl">🏆</span> המשחק הסתיים!
            </div>
            <div className="space-y-4">
              <div className="text-xl font-bold">
                {player1.score > player2.score ? (
                  <div className="text-green-600">{player1.name} ניצח! 🎉</div>
                ) : player2.score > player1.score ? (
                  <div className="text-green-600">{player2.name} ניצח! 🎉</div>
                ) : (
                  <div className="text-blue-600">תיקו! 🤝</div>
                )}
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="font-bold text-lg mb-2">{player1.name}</div>
                <div>ניקוד: {player1.score}</div>
                <div>תשובות נכונות: {player1.correct}</div>
                <div>טעויות: {player1.mistakes}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="font-bold text-lg mb-2">{player2.name}</div>
                <div>ניקוד: {player2.score}</div>
                <div>תשובות נכונות: {player2.correct}</div>
                <div>טעויות: {player2.mistakes}</div>
              </div>
              {/* הוספת ניקוד למשתמש אם הוא ניצח את הבוט */}
              {gameMode === 'bot' && player1.score > player2.score && (
                <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 mt-4">
                  <div className="text-green-700 font-bold text-lg">🎉 ניצחת את הבוט!</div>
                  <div className="text-green-600">קיבלת {player1.score} נקודות נוספות!</div>
                </div>
              )}
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold text-lg mt-4 shadow-lg hover:scale-105 transition"
              >
                משחק חדש
              </button>
            </div>
          </div>
        )}
      </div>
      <audio ref={successAudio} src="/voise/הצלחה.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/כשלון.dat" preload="auto" />
      <style>{`
      @keyframes fade-in { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
      .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
      @keyframes bounce { 0%,100%{transform:scale(1);} 50%{transform:scale(1.15);} }
      .animate-bounce { animation: bounce 0.7s; }
      @keyframes shake { 0%{transform:translateX(0);} 20%{transform:translateX(-8px);} 40%{transform:translateX(8px);} 60%{transform:translateX(-8px);} 80%{transform:translateX(8px);} 100%{transform:translateX(0);} }
      .animate-shake { animation: shake 0.4s; }
      .confetti { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1000; opacity: 0; transition: opacity 0.3s; }
      .confetti.show { opacity: 1; }
      
      /* וידוא שכל התשובות נראות זהות עד שהמשתמש בוחר */
      .answer-button {
        background-color: #ffffff !important;
        border-color: #dbeafe !important;
        color: #1e3a8a !important;
      }
      
      .answer-button:hover {
        background-color: #eff6ff !important;
        transform: scale(1.05) !important;
      }
      
      .answer-button.selected-correct {
        background-color: #dcfce7 !important;
        border-color: #22c55e !important;
        color: #166534 !important;
      }
      
      .answer-button.selected-wrong {
        background-color: #fecaca !important;
        border-color: #ef4444 !important;
        color: #991b1b !important;
      }
      `}</style>
      
      {/* Bottom Banner Ad */}
      <AdManager showBanner={true} bannerPosition="bottom" testMode={false} />
    </main>
  );
};

export default Page; 