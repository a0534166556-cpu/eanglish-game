"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import useAuthUser from "@/lib/useAuthUser";
import AdManager from "@/app/components/ads/AdManager";
import { getTranslationWithFallback } from "@/lib/translations";
import LevelUpModal from '@/app/components/common/LevelUpModal';

interface MultipleChoiceQuestion {
  id: number;
  lang: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  explanationHe?: string;
}

// שאלות לפי רמות קושי אמיתיות
const QUESTIONS_BY_DIFFICULTY = {
  // רמה 1: מתחילים - מילים בסיסיות ביותר
  beginner: [
    { id: 1, lang: "en", question: "What color is the sky?", options: ["Blue", "Red", "Green", "Yellow"], answer: "Blue", explanation: "The sky appears blue due to the scattering of sunlight.", explanationHe: "השמיים כחולים בגלל פיזור אור השמש" },
    { id: 2, lang: "en", question: "Which animal barks?", options: ["Cat", "Dog", "Fish", "Bird"], answer: "Dog", explanation: "Dogs bark; cats meow.", explanationHe: "כלבים נובחים; חתולים אומרים מיאו" },
    { id: 3, lang: "en", question: "What do you drink in the morning?", options: ["Tea", "Juice", "Soda", "Wine"], answer: "Tea", explanation: "Tea is a common morning drink.", explanationHe: "תה הוא משקה נפוץ בבוקר" },
    { id: 4, lang: "en", question: "Which is a fruit?", options: ["Apple", "Car", "Chair", "Book"], answer: "Apple", explanation: "Apple is a fruit; the others are not.", explanationHe: "תפוח הוא פרי; השאר לא" },
    { id: 5, lang: "en", question: "What do you use to write?", options: ["Pen", "Spoon", "Shoe", "Hat"], answer: "Pen", explanationHe: "עט משמש לכתיבה" },
    { id: 6, lang: "en", question: "Which is a day of the week?", options: ["Monday", "January", "Summer", "Dog"], answer: "Monday", explanationHe: "יום שני הוא יום בשבוע" },
    { id: 7, lang: "en", question: "What do you wear on your feet?", options: ["Socks", "Gloves", "Hat", "Shirt"], answer: "Socks", explanationHe: "גרביים לובשים על הרגליים" },
    { id: 8, lang: "en", question: "Which is a vegetable?", options: ["Carrot", "Apple", "Cake", "Milk"], answer: "Carrot", explanationHe: "גזר הוא ירק" },
    { id: 9, lang: "en", question: "What do you read?", options: ["Book", "Shoe", "Egg", "Tree"], answer: "Book", explanationHe: "ספר קוראים" },
    { id: 10, lang: "en", question: "Which is a season?", options: ["Winter", "Monday", "Dog", "Pen"], answer: "Winter", explanationHe: "חורף הוא עונה" },
    { id: 11, lang: "en", question: "What do you eat for breakfast?", options: ["Eggs", "Shoes", "Books", "Cars"], answer: "Eggs", explanationHe: "ביצים אוכלים לארוחת בוקר" },
    { id: 12, lang: "en", question: "Which animal can fly?", options: ["Bird", "Dog", "Cat", "Fish"], answer: "Bird", explanationHe: "ציפורים יכולות לעוף" },
    { id: 13, lang: "en", question: "What do you use to cut paper?", options: ["Scissors", "Pen", "Book", "Spoon"], answer: "Scissors", explanationHe: "מספריים משמשים לחיתוך נייר" },
    { id: 14, lang: "en", question: "Which is a drink?", options: ["Juice", "Chair", "Hat", "Shoe"], answer: "Juice", explanationHe: "מיץ הוא משקה" },
    { id: 15, lang: "en", question: "What do you wear on your head?", options: ["Hat", "Socks", "Book", "Car"], answer: "Hat", explanationHe: "כובע לובשים על הראש" },
    { id: 16, lang: "en", question: "Which is a pet?", options: ["Cat", "Car", "Book", "Tree"], answer: "Cat", explanationHe: "חתול הוא חיית מחמד" },
    { id: 17, lang: "en", question: "What do you use to eat soup?", options: ["Spoon", "Pen", "Shoe", "Hat"], answer: "Spoon", explanationHe: "כפית משמשת לאכילת מרק" },
    { id: 18, lang: "en", question: "Which is a color?", options: ["Red", "Dog", "Book", "Car"], answer: "Red", explanationHe: "אדום הוא צבע" },
    { id: 19, lang: "en", question: "What do you use to call someone?", options: ["Phone", "Book", "Shoe", "Pen"], answer: "Phone", explanationHe: "טלפון משמש להתקשרות" },
    { id: 20, lang: "en", question: "Which is a vehicle?", options: ["Car", "Dog", "Book", "Pen"], answer: "Car", explanationHe: "מכונית היא כלי רכב" },
    { id: 21, lang: "en", question: "What do you sleep on?", options: ["Bed", "Chair", "Floor", "Wall"], answer: "Bed", explanationHe: "מיטה משמשת לשינה" },
    { id: 22, lang: "en", question: "Which animal says moo?", options: ["Cow", "Dog", "Cat", "Bird"], answer: "Cow", explanationHe: "פרה אומרת מוּ" },
    { id: 23, lang: "en", question: "What do you use to eat?", options: ["Mouth", "Nose", "Ear", "Eye"], answer: "Mouth", explanationHe: "פה משמש לאכילה" },
    { id: 24, lang: "en", question: "Which is hot?", options: ["Fire", "Ice", "Snow", "Water"], answer: "Fire", explanationHe: "אש חמה" },
    { id: 25, lang: "en", question: "What do you sit on?", options: ["Chair", "Wall", "Door", "Window"], answer: "Chair", explanationHe: "כיסא משמש לישיבה" },
    { id: 26, lang: "en", question: "Which is cold?", options: ["Ice", "Fire", "Sun", "Oven"], answer: "Ice", explanationHe: "קרח קר" },
    { id: 27, lang: "en", question: "What do you wear?", options: ["Clothes", "Food", "Water", "Air"], answer: "Clothes", explanationHe: "בגדים לובשים" },
    { id: 28, lang: "en", question: "Which is round?", options: ["Ball", "Book", "Door", "Wall"], answer: "Ball", explanationHe: "כדור עגול" },
    { id: 29, lang: "en", question: "What gives light?", options: ["Sun", "Moon", "Star", "Cloud"], answer: "Sun", explanationHe: "שמש נותנת אור" },
    { id: 30, lang: "en", question: "Which is sweet?", options: ["Sugar", "Salt", "Pepper", "Vinegar"], answer: "Sugar", explanationHe: "סוכר מתוק" },
    { id: 31, lang: "en", question: "What do you drink?", options: ["Water", "Sand", "Stone", "Wood"], answer: "Water", explanationHe: "מים שותים" },
    { id: 32, lang: "en", question: "Which is big?", options: ["Elephant", "Ant", "Bee", "Fly"], answer: "Elephant", explanationHe: "פיל גדול" },
    { id: 33, lang: "en", question: "What is green?", options: ["Grass", "Sky", "Sun", "Moon"], answer: "Grass", explanationHe: "דשא ירוק" },
    { id: 34, lang: "en", question: "Which can swim?", options: ["Fish", "Bird", "Dog", "Cat"], answer: "Fish", explanationHe: "דג יכול לשחות" },
    { id: 35, lang: "en", question: "What is yellow?", options: ["Banana", "Apple", "Grape", "Orange"], answer: "Banana", explanationHe: "בננה צהובה" },
    { id: 36, lang: "en", question: "Which is small?", options: ["Mouse", "Elephant", "Horse", "Cow"], answer: "Mouse", explanationHe: "עכבר קטן" },
    { id: 37, lang: "en", question: "What is white?", options: ["Snow", "Grass", "Sun", "Tree"], answer: "Snow", explanationHe: "שלג לבן" },
    { id: 38, lang: "en", question: "Which is fast?", options: ["Rabbit", "Turtle", "Snail", "Worm"], answer: "Rabbit", explanationHe: "ארנב מהיר" },
    { id: 39, lang: "en", question: "What is soft?", options: ["Pillow", "Rock", "Stone", "Metal"], answer: "Pillow", explanationHe: "כרית רכה" },
    { id: 40, lang: "en", question: "Which is loud?", options: ["Thunder", "Whisper", "Silence", "Sleep"], answer: "Thunder", explanationHe: "רעם רועש" },
  ],

  // רמה 2: בינוני - מילים יומיומיות
  intermediate: [
    { id: 21, lang: "en", question: "Which animal can swim?", options: ["Fish", "Cat", "Dog", "Bird"], answer: "Fish", explanationHe: "דגים שוחים במים" },
    { id: 22, lang: "en", question: "What do you use to open a door?", options: ["Key", "Book", "Pen", "Spoon"], answer: "Key", explanationHe: "מפתח משמש לפתיחת דלת" },
    { id: 23, lang: "en", question: "Which is a month?", options: ["January", "Monday", "Summer", "Dog"], answer: "January", explanationHe: "ינואר הוא חודש" },
    { id: 24, lang: "en", question: "What do you wear on your hands?", options: ["Gloves", "Socks", "Hat", "Shirt"], answer: "Gloves", explanationHe: "כפפות לובשים על הידיים" },
    { id: 25, lang: "en", question: "Which is a drink?", options: ["Water", "Book", "Car", "Pen"], answer: "Water", explanationHe: "מים הם משקה" },
    { id: 26, lang: "en", question: "What do you use to see?", options: ["Eyes", "Ears", "Nose", "Mouth"], answer: "Eyes", explanationHe: "עיניים משמשות לראייה" },
    { id: 27, lang: "en", question: "Which is a fruit?", options: ["Banana", "Carrot", "Milk", "Dog"], answer: "Banana", explanationHe: "בננה היא פרי" },
    { id: 28, lang: "en", question: "What do you use to listen to music?", options: ["Ears", "Eyes", "Nose", "Mouth"], answer: "Ears", explanationHe: "אוזניים משמשות לשמיעה" },
    { id: 29, lang: "en", question: "Which is a vegetable?", options: ["Tomato", "Apple", "Cake", "Milk"], answer: "Tomato", explanationHe: "עגבניה היא ירק" },
    { id: 30, lang: "en", question: "What do you use to eat with?", options: ["Fork", "Pen", "Book", "Shoe"], answer: "Fork", explanationHe: "מזלג משמש לאכילה" },
    { id: 31, lang: "en", question: "Which is a color?", options: ["Green", "Dog", "Book", "Car"], answer: "Green", explanationHe: "ירוק הוא צבע" },
    { id: 32, lang: "en", question: "What do you use to write on?", options: ["Paper", "Spoon", "Shoe", "Hat"], answer: "Paper", explanationHe: "נייר משמש לכתיבה" },
    { id: 33, lang: "en", question: "Which animal can fly?", options: ["Bird", "Dog", "Cat", "Fish"], answer: "Bird", explanationHe: "ציפורים יכולות לעוף" },
    { id: 34, lang: "en", question: "What do you use to cut food?", options: ["Knife", "Pen", "Book", "Spoon"], answer: "Knife", explanationHe: "סכין משמשת לחיתוך אוכל" },
    { id: 35, lang: "en", question: "Which is a pet?", options: ["Dog", "Car", "Book", "Tree"], answer: "Dog", explanationHe: "כלב הוא חיית מחמד" },
    { id: 36, lang: "en", question: "What do you use to call someone?", options: ["Phone", "Book", "Shoe", "Pen"], answer: "Phone", explanationHe: "טלפון משמש להתקשרות" },
    { id: 37, lang: "en", question: "Which is a vehicle?", options: ["Bus", "Dog", "Book", "Pen"], answer: "Bus", explanationHe: "אוטובוס הוא כלי רכב" },
    { id: 38, lang: "en", question: "What do you use to drink soup?", options: ["Spoon", "Pen", "Shoe", "Hat"], answer: "Spoon", explanationHe: "כפית משמשת לשתיית מרק" },
    { id: 39, lang: "en", question: "Which is a day of the week?", options: ["Friday", "January", "Summer", "Dog"], answer: "Friday", explanation: "Friday is a day of the week.", explanationHe: "יום שישי הוא יום בשבוע" },
    { id: 40, lang: "en", question: "What do you wear on your body?", options: ["Shirt", "Socks", "Book", "Car"], answer: "Shirt", explanation: "A shirt is clothing worn on the body.", explanationHe: "חולצה לובשים על הגוף" },
    { id: 41, lang: "en", question: "What do you use to wash dishes?", options: ["Soap", "Sugar", "Salt", "Flour"], answer: "Soap", explanationHe: "סבון משמש לשטיפת כלים" },
    { id: 42, lang: "en", question: "Which grows in a garden?", options: ["Flower", "Car", "Phone", "Book"], answer: "Flower", explanationHe: "פרח גדל בגינה" },
    { id: 43, lang: "en", question: "What do you use to clean the floor?", options: ["Broom", "Knife", "Pen", "Cup"], answer: "Broom", explanationHe: "מטאטא משמש לניקוי רצפה" },
    { id: 44, lang: "en", question: "Which animal has stripes?", options: ["Zebra", "Dog", "Cat", "Cow"], answer: "Zebra", explanationHe: "לזברה יש פסים" },
    { id: 45, lang: "en", question: "What do you use to tell time?", options: ["Watch", "Shoe", "Hat", "Glove"], answer: "Watch", explanationHe: "שעון משמש לראיית הזמן" },
    { id: 46, lang: "en", question: "Which is sour?", options: ["Lemon", "Sugar", "Honey", "Candy"], answer: "Lemon", explanationHe: "לימון חמוץ" },
    { id: 47, lang: "en", question: "What do you use to carry things?", options: ["Bag", "Shoe", "Hat", "Sock"], answer: "Bag", explanationHe: "תיק משמש לנשיאת דברים" },
    { id: 48, lang: "en", question: "Which is a tool?", options: ["Hammer", "Apple", "Bread", "Milk"], answer: "Hammer", explanationHe: "פטיש הוא כלי" },
    { id: 49, lang: "en", question: "What do you use to lock a door?", options: ["Lock", "Spoon", "Pen", "Cup"], answer: "Lock", explanationHe: "מנעול משמש לנעילת דלת" },
    { id: 50, lang: "en", question: "Which is a body part?", options: ["Hand", "Car", "Tree", "Book"], answer: "Hand", explanationHe: "יד היא חלק בגוף" },
    { id: 51, lang: "en", question: "What do you use to dry yourself?", options: ["Towel", "Knife", "Fork", "Spoon"], answer: "Towel", explanationHe: "מגבת משמשת להתייבשות" },
    { id: 52, lang: "en", question: "Which is a number?", options: ["Five", "Dog", "Cat", "Tree"], answer: "Five", explanationHe: "חמש הוא מספר" },
    { id: 53, lang: "en", question: "What do you use to cook?", options: ["Stove", "Bed", "Chair", "Table"], answer: "Stove", explanationHe: "כיריים משמשות לבישול" },
    { id: 54, lang: "en", question: "Which is a shape?", options: ["Circle", "Dog", "Cat", "Tree"], answer: "Circle", explanationHe: "עיגול הוא צורה" },
    { id: 55, lang: "en", question: "What do you use to measure?", options: ["Ruler", "Spoon", "Cup", "Plate"], answer: "Ruler", explanationHe: "סרגל משמש למדידה" },
    { id: 56, lang: "en", question: "Which is a room?", options: ["Kitchen", "Car", "Tree", "Sky"], answer: "Kitchen", explanationHe: "מטבח הוא חדר" },
    { id: 57, lang: "en", question: "What do you use to open a bottle?", options: ["Opener", "Hammer", "Saw", "Drill"], answer: "Opener", explanationHe: "פותחן משמש לפתיחת בקבוק" },
    { id: 58, lang: "en", question: "Which is a direction?", options: ["North", "Dog", "Cat", "Tree"], answer: "North", explanationHe: "צפון הוא כיוון" },
    { id: 59, lang: "en", question: "What do you use to paint?", options: ["Brush", "Spoon", "Fork", "Knife"], answer: "Brush", explanationHe: "מברשת משמשת לציור" },
    { id: 60, lang: "en", question: "Which is a weather?", options: ["Rain", "Dog", "Cat", "Tree"], answer: "Rain", explanationHe: "גשם הוא מזג אוויר" },
  ],

  // רמה 3: מתקדם - מילים מורכבות יותר
  advanced: [
    { id: 41, lang: "en", question: "Which animal has a long neck?", options: ["Giraffe", "Dog", "Cat", "Fish"], answer: "Giraffe", explanation: "A giraffe is known for its very long neck.", explanationHe: "ג'ירף ידוע בצווארו הארוך" },
    { id: 42, lang: "en", question: "What do you use to brush your teeth?", options: ["Toothbrush", "Spoon", "Pen", "Book"], answer: "Toothbrush", explanation: "A toothbrush is used for dental hygiene.", explanationHe: "מברשת שיניים משמשת להיגיינת הפה" },
    { id: 43, lang: "en", question: "Which is a type of transport?", options: ["Train", "Dog", "Book", "Tree"], answer: "Train", explanationHe: "רכבת היא סוג של תחבורה" },
    { id: 44, lang: "en", question: "What do you use to see the time?", options: ["Clock", "Shoe", "Car", "Pen"], answer: "Clock", explanationHe: "שעון משמש לראיית הזמן" },
    { id: 45, lang: "en", question: "Which is a farm animal?", options: ["Cow", "Dog", "Cat", "Fish"], answer: "Cow", explanationHe: "פרה היא חיה חקלאית" },
    { id: 46, lang: "en", question: "What do you use to write on a blackboard?", options: ["Chalk", "Pen", "Book", "Spoon"], answer: "Chalk", explanationHe: "גיר משמש לכתיבה על לוח" },
    { id: 47, lang: "en", question: "Which is a wild animal?", options: ["Lion", "Dog", "Cat", "Fish"], answer: "Lion", explanationHe: "אריה הוא חיה פראית" },
    { id: 48, lang: "en", question: "What do you use to eat ice cream?", options: ["Spoon", "Pen", "Book", "Shoe"], answer: "Spoon", explanationHe: "כפית משמשת לאכילת גלידה" },
    { id: 49, lang: "en", question: "Which is a fruit?", options: ["Orange", "Carrot", "Milk", "Dog"], answer: "Orange", explanationHe: "תפוז הוא פרי" },
    { id: 50, lang: "en", question: "What do you use to wash your hands?", options: ["Soap", "Book", "Car", "Pen"], answer: "Soap", explanationHe: "סבון משמש לרחיצת ידיים" },
    { id: 51, lang: "en", question: "Which is a color?", options: ["Yellow", "Dog", "Book", "Car"], answer: "Yellow", explanationHe: "צהוב הוא צבע" },
    { id: 52, lang: "en", question: "What do you use to make a phone call?", options: ["Phone", "Book", "Shoe", "Pen"], answer: "Phone", explanationHe: "טלפון משמש לביצוע שיחה" },
    { id: 53, lang: "en", question: "Which is a pet?", options: ["Rabbit", "Car", "Book", "Tree"], answer: "Rabbit", explanationHe: "ארנב הוא חיית מחמד" },
    { id: 54, lang: "en", question: "What do you use to drink tea?", options: ["Cup", "Pen", "Book", "Shoe"], answer: "Cup", explanationHe: "כוס משמשת לשתיית תה" },
    { id: 55, lang: "en", question: "Which is a vegetable?", options: ["Cucumber", "Apple", "Cake", "Milk"], answer: "Cucumber", explanationHe: "מלפפון הוא ירק" },
    { id: 56, lang: "en", question: "What do you use to see far away?", options: ["Binoculars", "Spoon", "Shoe", "Hat"], answer: "Binoculars", explanationHe: "משקפת משמשת לראייה למרחק" },
    { id: 57, lang: "en", question: "Which animal can jump?", options: ["Kangaroo", "Dog", "Cat", "Fish"], answer: "Kangaroo", explanationHe: "קנגורו יכול לקפוץ" },
    { id: 58, lang: "en", question: "What do you use to eat salad?", options: ["Fork", "Pen", "Book", "Shoe"], answer: "Fork", explanationHe: "מזלג משמש לאכילת סלט" },
    { id: 59, lang: "en", question: "Which is a day of the week?", options: ["Sunday", "January", "Summer", "Dog"], answer: "Sunday", explanationHe: "יום ראשון הוא יום בשבוע" },
    { id: 60, lang: "en", question: "What do you wear on your legs?", options: ["Pants", "Socks", "Book", "Car"], answer: "Pants", explanationHe: "מכנסיים לובשים על הרגליים" },
    { id: 61, lang: "en", question: "Which animal lives in the desert?", options: ["Camel", "Penguin", "Dolphin", "Whale"], answer: "Camel", explanationHe: "גמל חי במדבר" },
    { id: 62, lang: "en", question: "What do you use to sew clothes?", options: ["Needle", "Hammer", "Saw", "Drill"], answer: "Needle", explanationHe: "מחט משמשת לתפירת בגדים" },
    { id: 63, lang: "en", question: "Which is a musical note?", options: ["Do", "Cat", "Dog", "Tree"], answer: "Do", explanationHe: "דו הוא תו מוזיקלי" },
    { id: 64, lang: "en", question: "What do you use to fix things?", options: ["Screwdriver", "Spoon", "Cup", "Plate"], answer: "Screwdriver", explanationHe: "מברג משמש לתיקון דברים" },
    { id: 65, lang: "en", question: "Which is a continent?", options: ["Europe", "Paris", "London", "Tokyo"], answer: "Europe", explanationHe: "אירופה היא יבשת" },
    { id: 66, lang: "en", question: "What do you use to iron clothes?", options: ["Iron", "Hammer", "Saw", "Drill"], answer: "Iron", explanationHe: "מגהץ משמש לגיהוץ בגדים" },
    { id: 67, lang: "en", question: "Which is a planet?", options: ["Mars", "Sun", "Moon", "Star"], answer: "Mars", explanationHe: "מאדים הוא כוכב לכת" },
    { id: 68, lang: "en", question: "What do you use to cut wood?", options: ["Saw", "Spoon", "Cup", "Plate"], answer: "Saw", explanationHe: "מסור משמש לחיתוך עץ" },
    { id: 69, lang: "en", question: "Which is an ocean?", options: ["Pacific", "River", "Lake", "Pond"], answer: "Pacific", explanationHe: "האוקיינוס השקט הוא אוקיינוס" },
    { id: 70, lang: "en", question: "What do you use to measure weight?", options: ["Scale", "Ruler", "Clock", "Watch"], answer: "Scale", explanationHe: "משקל משמש לשקילה" },
    { id: 71, lang: "en", question: "Which is a precious stone?", options: ["Diamond", "Rock", "Sand", "Dirt"], answer: "Diamond", explanationHe: "יהלום הוא אבן יקרה" },
    { id: 72, lang: "en", question: "What do you use to start a fire?", options: ["Match", "Water", "Ice", "Snow"], answer: "Match", explanationHe: "גפרור משמש להדלקת אש" },
    { id: 73, lang: "en", question: "Which is a type of tree?", options: ["Oak", "Rose", "Tulip", "Daisy"], answer: "Oak", explanationHe: "אלון הוא סוג של עץ" },
    { id: 74, lang: "en", question: "What do you use to navigate?", options: ["Compass", "Spoon", "Cup", "Plate"], answer: "Compass", explanationHe: "מצפן משמש לניווט" },
    { id: 75, lang: "en", question: "Which is a metal?", options: ["Gold", "Wood", "Plastic", "Glass"], answer: "Gold", explanationHe: "זהב הוא מתכת" },
    { id: 76, lang: "en", question: "What do you use to protect from rain?", options: ["Umbrella", "Hat", "Shoe", "Glove"], answer: "Umbrella", explanationHe: "מטריה מגינה מגשם" },
    { id: 77, lang: "en", question: "Which is a type of fish?", options: ["Salmon", "Dog", "Cat", "Bird"], answer: "Salmon", explanationHe: "סלמון הוא סוג של דג" },
    { id: 78, lang: "en", question: "What do you use to climb?", options: ["Ladder", "Spoon", "Cup", "Plate"], answer: "Ladder", explanationHe: "סולם משמש לטיפוס" },
    { id: 79, lang: "en", question: "Which is a type of bird?", options: ["Eagle", "Dog", "Cat", "Fish"], answer: "Eagle", explanationHe: "נשר הוא סוג של ציפור" },
    { id: 80, lang: "en", question: "What do you use to store water?", options: ["Bottle", "Shoe", "Hat", "Sock"], answer: "Bottle", explanationHe: "בקבוק משמש לאחסון מים" },
  ],

  // רמה 4: קיצוני - מילים מורכבות מאוד (מקצועות, מדע, טכנולוגיה)
  extreme: [
    { id: 61, lang: "en", question: "Which profession treats patients in hospitals?", options: ["Doctor", "Teacher", "Engineer", "Artist"], answer: "Doctor", explanationHe: "רופא מטפל בחולים בבתי חולים" },
    { id: 62, lang: "en", question: "What device do you use to calculate numbers?", options: ["Calculator", "Hammer", "Scissors", "Spoon"], answer: "Calculator", explanationHe: "מחשבון משמש לחישוב מספרים" },
    { id: 63, lang: "en", question: "Which instrument measures temperature?", options: ["Thermometer", "Barometer", "Speedometer", "Compass"], answer: "Thermometer", explanationHe: "מדחום מודד טמפרטורה" },
    { id: 64, lang: "en", question: "What profession designs buildings?", options: ["Architect", "Painter", "Writer", "Singer"], answer: "Architect", explanationHe: "אדריכל מתכנן בניינים" },
    { id: 65, lang: "en", question: "Which device connects computers worldwide?", options: ["Internet", "Television", "Radio", "Telephone"], answer: "Internet", explanationHe: "אינטרנט מחבר מחשבים ברחבי העולם" },
    { id: 66, lang: "en", question: "What profession performs surgeries?", options: ["Surgeon", "Dentist", "Pharmacist", "Nurse"], answer: "Surgeon", explanationHe: "מנתח מבצע ניתוחים" },
    { id: 67, lang: "en", question: "Which instrument examines tiny organisms?", options: ["Microscope", "Telescope", "Binoculars", "Magnifier"], answer: "Microscope", explanationHe: "מיקרוסקופ בודק אורגניזמים זעירים" },
    { id: 68, lang: "en", question: "What profession creates software programs?", options: ["Programmer", "Mechanic", "Electrician", "Plumber"], answer: "Programmer", explanationHe: "מתכנת יוצר תוכנות מחשב" },
    { id: 69, lang: "en", question: "Which device stores digital information?", options: ["Computer", "Hammer", "Scissors", "Broom"], answer: "Computer", explanationHe: "מחשב מאחסן מידע דיגיטלי" },
    { id: 70, lang: "en", question: "What profession studies ancient civilizations?", options: ["Archaeologist", "Biologist", "Chemist", "Physicist"], answer: "Archaeologist", explanationHe: "ארכיאולוג חוקר תרבויות עתיקות" },
    { id: 71, lang: "en", question: "Which instrument observes distant stars?", options: ["Telescope", "Microscope", "Stethoscope", "Periscope"], answer: "Telescope", explanationHe: "טלסקופ צופה בכוכבים רחוקים" },
    { id: 72, lang: "en", question: "What profession defends people in court?", options: ["Lawyer", "Judge", "Police", "Detective"], answer: "Lawyer", explanationHe: "עורך דין מגן על אנשים בבית משפט" },
    { id: 73, lang: "en", question: "Which device measures atmospheric pressure?", options: ["Barometer", "Thermometer", "Hygrometer", "Anemometer"], answer: "Barometer", explanationHe: "ברומטר מודד לחץ אטמוספרי" },
    { id: 74, lang: "en", question: "What profession researches chemical reactions?", options: ["Chemist", "Physicist", "Biologist", "Geologist"], answer: "Chemist", explanationHe: "כימאי חוקר תגובות כימיות" },
    { id: 75, lang: "en", question: "Which technology transmits voices wirelessly?", options: ["Telephone", "Telegraph", "Television", "Radio"], answer: "Telephone", explanationHe: "טלפון משדר קולות באופן אלחוטי" },
    { id: 76, lang: "en", question: "What profession investigates crimes?", options: ["Detective", "Lawyer", "Judge", "Witness"], answer: "Detective", explanationHe: "בלש חוקר פשעים" },
    { id: 77, lang: "en", question: "Which instrument measures earthquake intensity?", options: ["Seismograph", "Thermometer", "Barometer", "Compass"], answer: "Seismograph", explanationHe: "סיסמוגרף מודד עוצמת רעידות אדמה" },
    { id: 78, lang: "en", question: "What profession treats dental problems?", options: ["Dentist", "Doctor", "Surgeon", "Nurse"], answer: "Dentist", explanationHe: "רופא שיניים מטפל בבעיות שיניים" },
    { id: 79, lang: "en", question: "Which device generates electricity?", options: ["Generator", "Motor", "Battery", "Switch"], answer: "Generator", explanationHe: "גנרטור מייצר חשמל" },
    { id: 80, lang: "en", question: "What profession studies living organisms?", options: ["Biologist", "Chemist", "Physicist", "Geologist"], answer: "Biologist", explanationHe: "ביולוג חוקר אורגניזמים חיים" },
    { id: 81, lang: "en", question: "Which instrument analyzes chemical composition?", options: ["Spectrometer", "Thermometer", "Barometer", "Clock"], answer: "Spectrometer", explanationHe: "ספקטרומטר מנתח הרכב כימי" },
    { id: 82, lang: "en", question: "What profession studies celestial bodies?", options: ["Astronomer", "Biologist", "Chemist", "Geologist"], answer: "Astronomer", explanationHe: "אסטרונום חוקר גרמי שמיים" },
    { id: 83, lang: "en", question: "Which device amplifies sound waves?", options: ["Amplifier", "Thermometer", "Barometer", "Clock"], answer: "Amplifier", explanationHe: "מגבר מחזק גלי קול" },
    { id: 84, lang: "en", question: "What profession designs electronic circuits?", options: ["Engineer", "Artist", "Writer", "Singer"], answer: "Engineer", explanationHe: "מהנדס מתכנן מעגלים אלקטרוניים" },
    { id: 85, lang: "en", question: "Which instrument measures radiation?", options: ["Geiger counter", "Thermometer", "Barometer", "Clock"], answer: "Geiger counter", explanationHe: "מונה גייגר מודד קרינה" },
    { id: 86, lang: "en", question: "What profession studies fossils?", options: ["Paleontologist", "Biologist", "Chemist", "Physicist"], answer: "Paleontologist", explanationHe: "פליאונטולוג חוקר מאובנים" },
    { id: 87, lang: "en", question: "Which device converts sunlight to electricity?", options: ["Solar panel", "Battery", "Generator", "Motor"], answer: "Solar panel", explanationHe: "פאנל סולארי ממיר אור שמש לחשמל" },
    { id: 88, lang: "en", question: "What profession studies weather patterns?", options: ["Meteorologist", "Biologist", "Chemist", "Physicist"], answer: "Meteorologist", explanationHe: "מטאורולוג חוקר דפוסי מזג אוויר" },
    { id: 89, lang: "en", question: "Which instrument measures magnetic fields?", options: ["Magnetometer", "Thermometer", "Barometer", "Clock"], answer: "Magnetometer", explanationHe: "מגנטומטר מודד שדות מגנטיים" },
    { id: 90, lang: "en", question: "What profession studies human behavior?", options: ["Psychologist", "Biologist", "Chemist", "Physicist"], answer: "Psychologist", explanationHe: "פסיכולוג חוקר התנהגות אנושית" },
    { id: 91, lang: "en", question: "Which device measures electrical current?", options: ["Ammeter", "Thermometer", "Barometer", "Clock"], answer: "Ammeter", explanationHe: "אמפרמטר מודד זרם חשמלי" },
    { id: 92, lang: "en", question: "What profession studies ocean life?", options: ["Marine biologist", "Chemist", "Physicist", "Geologist"], answer: "Marine biologist", explanationHe: "ביולוג ימי חוקר חיים באוקיינוס" },
    { id: 93, lang: "en", question: "Which instrument measures light intensity?", options: ["Photometer", "Thermometer", "Barometer", "Clock"], answer: "Photometer", explanationHe: "פוטומטר מודד עוצמת אור" },
    { id: 94, lang: "en", question: "What profession studies genetic inheritance?", options: ["Geneticist", "Biologist", "Chemist", "Physicist"], answer: "Geneticist", explanationHe: "גנטיקאי חוקר תורשה גנטית" },
    { id: 95, lang: "en", question: "Which device measures voltage?", options: ["Voltmeter", "Thermometer", "Barometer", "Clock"], answer: "Voltmeter", explanationHe: "וולטמטר מודד מתח חשמלי" },
    { id: 96, lang: "en", question: "What profession studies Earth's structure?", options: ["Geologist", "Biologist", "Chemist", "Physicist"], answer: "Geologist", explanationHe: "גיאולוג חוקר מבנה כדור הארץ" },
    { id: 97, lang: "en", question: "Which instrument measures humidity?", options: ["Hygrometer", "Thermometer", "Barometer", "Clock"], answer: "Hygrometer", explanationHe: "היגרומטר מודד לחות" },
    { id: 98, lang: "en", question: "What profession studies plant life?", options: ["Botanist", "Zoologist", "Chemist", "Physicist"], answer: "Botanist", explanationHe: "בוטנאי חוקר חיי צמחים" },
    { id: 99, lang: "en", question: "Which device measures wind speed?", options: ["Anemometer", "Thermometer", "Barometer", "Clock"], answer: "Anemometer", explanationHe: "אנמומטר מודד מהירות רוח" },
    { id: 100, lang: "en", question: "What profession studies animal behavior?", options: ["Zoologist", "Botanist", "Chemist", "Physicist"], answer: "Zoologist", explanationHe: "זואולוג חוקר התנהגות בעלי חיים" },
  ]
};

// שאלות עבריות (נשארות כפי שהן)
const HEBREW_QUESTIONS: MultipleChoiceQuestion[] = [
  { id: 101, lang: "he", question: "איזה צבע יש לשמים?", options: ["כחול", "אדום", "ירוק", "צהוב"], answer: "כחול" },
  { id: 102, lang: "he", question: "איזה חיה נובחת?", options: ["חתול", "כלב", "דג", "ציפור"], answer: "כלב" },
  { id: 103, lang: "he", question: "מה שותים בבוקר?", options: ["תה", "מיץ", "סודה", "יין"], answer: "תה" },
  { id: 104, lang: "he", question: "מהו פרי?", options: ["תפוח", "מכונית", "כיסא", "ספר"], answer: "תפוח" },
  { id: 105, lang: "he", question: "במה כותבים?", options: ["עט", "כף", "נעל", "כובע"], answer: "עט" },
  { id: 106, lang: "he", question: "איזה יום בשבוע?", options: ["שני", "ינואר", "קיץ", "כלב"], answer: "שני" },
  { id: 107, lang: "he", question: "מה לובשים על הרגליים?", options: ["גרביים", "כפפות", "כובע", "חולצה"], answer: "גרביים" },
  { id: 108, lang: "he", question: "מהו ירק?", options: ["גזר", "תפוח", "עוגה", "חלב"], answer: "גזר" },
  { id: 109, lang: "he", question: "מה קוראים?", options: ["ספר", "נעל", "ביצה", "עץ"], answer: "ספר" },
  { id: 110, lang: "he", question: "איזו עונה?", options: ["חורף", "שני", "כלב", "עט"], answer: "חורף" },
];

// פונקציה לבחירת שאלות לפי רמת קושי
const getQuestionsByDifficulty = (difficulty: string): MultipleChoiceQuestion[] => {
  switch (difficulty) {
    case 'beginner':
      return QUESTIONS_BY_DIFFICULTY.beginner;
    case 'intermediate':
      return QUESTIONS_BY_DIFFICULTY.intermediate;
    case 'advanced':
      return QUESTIONS_BY_DIFFICULTY.advanced;
    case 'extreme':
      return QUESTIONS_BY_DIFFICULTY.extreme;
    default:
      return QUESTIONS_BY_DIFFICULTY.beginner;
  }
};

const levelMap: Record<string, string> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
  extreme: 'extreme',
  easy: 'beginner',
  medium: 'intermediate',
  hard: 'advanced',
};

function getMistakeStats() {
  try {
    return JSON.parse(localStorage.getItem('mc-mistakes') || '{}');
  } catch {
    return {};
  }
}

function addMistake(id: number) {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('mc-mistakes', JSON.stringify(stats));
}

export default function MultipleChoiceGameWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl">טוען...</div>
    </div>}>
      <MultipleChoiceGame />
    </Suspense>
  );
}

function MultipleChoiceGame() {
  const searchParams = useSearchParams();
  const level = searchParams?.get('level') || 'beginner';
  const { user, loading, updateUser } = useAuthUser();
  
  // בחר שאלות לפי רמת קושי
  const selectedQuestions = getQuestionsByDifficulty(levelMap[level] || 'beginner');
  
  const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [time, setTime] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [learnedWordsList, setLearnedWordsList] = useState<Array<{word: string, translation: string}>>([]);
  const [newlyCompletedAchievements, setNewlyCompletedAchievements] = useState<Array<{id: string, name: string, icon: string, reward: number, xpReward: number}>>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [useLearnedWords, setUseLearnedWords] = useState(false);
  const [learnedWordsData, setLearnedWordsData] = useState<Array<{word: string, translation: string}>>([]);
  const [loadingLearnedWords, setLoadingLearnedWords] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedWordsCount, setSelectedWordsCount] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<Array<{word: string, translation: string}>>([]);
  const [showWordSelector, setShowWordSelector] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);

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
  const createQuestionsFromLearnedWords = (words: Array<{word: string, translation: string}>, count: number): MultipleChoiceQuestion[] => {
    const questions: MultipleChoiceQuestion[] = [];
    const usedWords = new Set<string>();
    
    words.forEach((wordData, index) => {
      if (questions.length >= count) return;
      if (usedWords.has(wordData.word.toLowerCase())) return;
      
      const word = wordData.word;
      const translation = wordData.translation || word;
      
      // נסה למצוא שאלה קיימת שהמילה היא התשובה הנכונה שלה
      const existingQuestion = Object.values(QUESTIONS_BY_DIFFICULTY).flat().find(q => 
        q.answer.toLowerCase() === word.toLowerCase()
      );
      
      if (existingQuestion) {
        questions.push(existingQuestion);
        usedWords.add(word.toLowerCase());
      } else {
        // צור שאלה חדשה מהמילה
        const similarWords = Object.values(QUESTIONS_BY_DIFFICULTY)
          .flat()
          .map(q => q.answer)
          .filter(opt => opt.toLowerCase() !== word.toLowerCase())
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        const options = [word, ...similarWords].sort(() => Math.random() - 0.5);
        
        // נסה למצוא תרגום טוב יותר אם התרגום זהה למילה
        let finalTranslation = translation;
        if (translation === word || !translation || translation.trim() === '') {
          // נסה למצוא תרגום מהשאלות הקיימות
          const existingQuestion = Object.values(QUESTIONS_BY_DIFFICULTY).flat().find(q => 
            q.answer.toLowerCase() === word.toLowerCase()
          );
          if (existingQuestion?.explanationHe) {
            finalTranslation = existingQuestion.explanationHe.split('-')[0]?.trim() || word;
          } else {
            finalTranslation = word; // אם אין תרגום, נשתמש במילה עצמה
          }
        }
        
        // צור הסבר משמעותי
        const explanationHe = finalTranslation !== word
          ? `המילה "${word}" פירושה "${finalTranslation}"`
          : `המילה "${word}" היא מילה באנגלית`;
        
        questions.push({
          id: 10000 + index,
          lang: 'en',
          question: finalTranslation !== word 
            ? `What is the English word for "${finalTranslation}"?`
            : `What is the English word "${word}"?`,
          options: options,
          answer: word,
          explanation: `The English word "${word}"${finalTranslation !== word ? ` means "${finalTranslation}"` : ''}.`,
          explanationHe: explanationHe
        });
        usedWords.add(word.toLowerCase());
      }
    });
    
    return questions.slice(0, count);
  };

  useEffect(() => {
    if (gameStarted) {
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
        
        const learnedQuestions = createQuestionsFromLearnedWords(wordsToUse, 10);
        if (learnedQuestions.length > 0) {
          const shuffled = [...learnedQuestions].sort(() => Math.random() - 0.5);
          setQuestions(shuffled);
        } else {
          // אם אין מספיק שאלות, השתמש בשאלות רגילות
          const shuffled = [...selectedQuestions].sort(() => Math.random() - 0.5);
          setQuestions(shuffled.slice(0, 10));
        }
      } else {
    // בחר שאלות אקראיות
    const shuffled = [...selectedQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 10));
      }
      setCurrent(0);
      setScore(0);
      setCorrectAnswers(0);
      setWrongAnswers(0);
      setTime(0);
      setFinished(false);
      setSelected(null);
      setFeedback(null);
      setShowHint(false);
    }
  }, [gameStarted, useLearnedWords, learnedWordsData, selectedWordsCount, selectedWords]);

  // טען מילים שנלמדו כשהמשתמש בוחר במצב learned words
  useEffect(() => {
    if (useLearnedWords && user && learnedWordsData.length === 0 && !loadingLearnedWords) {
      loadLearnedWords();
    }
  }, [useLearnedWords, user]);

  useEffect(() => {
    if (!finished) {
      const timer = setInterval(() => setTime(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [finished]);
  
  // פונקציה לחילוץ מילים אנגליות מטקסט
  const extractEnglishWords = (text: string): string[] => {
    if (!text) return [];
    const englishWords = text.match(/[A-Za-z]+/g) || [];
    return englishWords
      .map(word => word.toLowerCase())
      .filter(word => 
        word.length > 2 && 
        !['the', 'and', 'is', 'are', 'was', 'were', 'has', 'have', 'had', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'what', 'which', 'do', 'you', 'use', 'can', 'does'].includes(word)
      );
  };

  // אסוף את כל המילים מכל השאלות במשחק
  // מילון תרגומים מקומי - אם מילה לא נמצאת כאן, יחפש במילון המרכזי
  const getTranslationForWord = (word: string): string | null => {
    const wordLower = word.toLowerCase();
    
    // מילון תרגומים מקומי (נשאר כמו שהיה)
    const localTranslations: Record<string, string> = {
      // בעלי חיים
      'dog': 'כלב', 'cat': 'חתול', 'bird': 'ציפור', 'fish': 'דג', 'frog': 'צפרדע',
      'bear': 'דוב', 'lion': 'אריה', 'whale': 'לווייתן', 'monkey': 'קוף', 'deer': 'צבי',
      'owl': 'ינשוף', 'rabbit': 'ארנב', 'duck': 'ברווז', 'eagle': 'נשר', 'snake': 'נחש',
      'cow': 'פרה', 'elephant': 'פיל', 'mouse': 'עכבר', 'zebra': 'זברה',
      // אוכל
      'apple': 'תפוח', 'banana': 'בננה', 'water': 'מים', 'milk': 'חלב', 'tea': 'תה',
      'bread': 'לחם', 'rice': 'אורז', 'cake': 'עוגה', 'soup': 'מרק', 'egg': 'ביצה',
      'pasta': 'פסטה', 'curry': 'קארי', 'lemonade': 'לימונדה', 'honey': 'דבש',
      'toast': 'טוסט', 'ice cream': 'גלידה', 'sushi': 'סושי', 'pizza': 'פיצה',
      'juice': 'מיץ', 'sugar': 'סוכר', 'salt': 'מלח', 'lemon': 'לימון', 'carrot': 'גזר',
      'tomato': 'עגבניה',
      // חפצים
      'book': 'ספר', 'pen': 'עט', 'cup': 'כוס', 'ball': 'כדור', 'hat': 'כובע',
      'shoes': 'נעליים', 'shoe': 'נעל', 'chair': 'כיסא', 'bed': 'מיטה', 'bike': 'אופניים',
      'camera': 'מצלמה', 'television': 'טלוויזיה', 'headphones': 'אוזניות',
      'clock': 'שעון', 'key': 'מפתח', 'telescope': 'טלסקופ', 'blanket': 'שמיכה',
      'toothbrush': 'מברשת שיניים', 'phone': 'טלפון', 'pillow': 'כרית',
      'socks': 'גרביים', 'gloves': 'כפפות', 'shirt': 'חולצה', 'spoon': 'כפית',
      'scissors': 'מספריים', 'fork': 'מזלג', 'knife': 'סכין', 'broom': 'מטאטא',
      'watch': 'שעון', 'bag': 'תיק', 'hammer': 'פטיש', 'lock': 'מנעול',
      'towel': 'מגבת', 'stove': 'כיריים', 'ruler': 'סרגל',
      // טבע
      'sun': 'שמש', 'moon': 'ירח', 'sky': 'שמיים', 'tree': 'עץ', 'flower': 'פרח',
      'grass': 'דשא', 'cloud': 'ענן', 'snow': 'שלג', 'rain': 'גשם', 'sea': 'ים',
      'hill': 'גבעה', 'mountain': 'הר', 'ocean': 'אוקיינוס', 'forest': 'יער',
      'volcano': 'הר געש', 'river': 'נהר', 'rainbow': 'קשת', 'cave': 'מערה',
      'fire': 'אש', 'ice': 'קרח', 'thunder': 'רעם',
      // אנשים
      'mom': 'אמא', 'dad': 'אבא', 'sister': 'אחות', 'brother': 'אח', 'family': 'משפחה',
      'daughter': 'בת', 'son': 'בן', 'father': 'אבא', 'mother': 'אמא',
      'grandmother': 'סבתא', 'teenager': 'נער', 'friend': 'חבר', 'teacher': 'מורה',
      'baby': 'תינוק', 'child': 'ילד',
      // מקומות
      'home': 'בית', 'school': 'בית ספר', 'house': 'בית', 'bedroom': 'חדר שינה',
      'kitchen': 'מטבח', 'living room': 'סלון', 'bathroom': 'חדר אמבטיה',
      'garage': 'מוסך', 'garden': 'גינה', 'basement': 'מרתף', 'library': 'ספרייה',
      'office': 'משרד',
      // תחבורה
      'car': 'מכונית', 'bus': 'אוטובוס', 'airplane': 'מטוס', 'train': 'רכבת',
      'boat': 'סירה', 'motorcycle': 'אופנוע', 'taxi': 'מונית', 'bicycle': 'אופניים',
      'ship': 'אונייה', 'subway': 'רכבת תחתית', 'truck': 'משאית', 'scooter': 'קורקינט',
      // תכונות
      'soft': 'רך', 'hard': 'קשה', 'big': 'גדול', 'small': 'קטן', 'hot': 'חם',
      'cold': 'קר', 'sweet': 'מתוק', 'sour': 'חמוץ', 'round': 'עגול', 'loud': 'רועש',
      'tall': 'גבוה', 'fast': 'מהיר', 'green': 'ירוק', 'yellow': 'צהוב', 'white': 'לבן',
      'red': 'אדום', 'blue': 'כחול',
      // חומרים
      'metal': 'מתכת', 'rock': 'סלע', 'stone': 'אבן', 'wood': 'עץ', 'glass': 'זכוכית',
      'plastic': 'פלסטיק', 'gold': 'זהב', 'diamond': 'יהלום', 'sand': 'חול',
      // חלקי גוף
      'hand': 'יד', 'eye': 'עין', 'ear': 'אוזן', 'nose': 'אף', 'mouth': 'פה',
      'eyes': 'עיניים', 'ears': 'אוזניים',
      // ימים וחודשים
      'monday': 'יום שני', 'friday': 'יום שישי', 'winter': 'חורף',
      'january': 'ינואר', 'summer': 'קיץ',
      // מספרים
      'five': 'חמש',
      // צורות
      'circle': 'עיגול',
      // בגדים
      'clothes': 'בגדים',
      // מקצועות
      'programmer': 'מתכנת', 'mechanic': 'מכונאי', 'electrician': 'חשמלאי', 'plumber': 'שרברב',
      'manager': 'מנהל',
      // מקומות ותחבורה
      'road': 'כביש', 'street': 'רחוב',
      // טכנולוגיה
      'monitor': 'מסך', 'keyboard': 'מקלדת', 'computer': 'מחשב',
      // משקאות
      'wine': 'יין', 'soda': 'סודה',
      // פעולות
      'gives': 'נותן', 'give': 'נותן', 'star': 'כוכב',
      // קטגוריות
      'vegetable': 'ירק', 'vegetables': 'ירקות', 'fruit': 'פרי', 'fruits': 'פירות',
      'season': 'עונה', 'seasons': 'עונות', 'drink': 'משקה', 'drinks': 'משקאות',
      'vehicle': 'כלי רכב', 'vehicles': 'כלי רכב', 'tool': 'כלי', 'tools': 'כלים',
      'planet': 'כוכב לכת', 'planets': 'כוכבי לכת',
    };
    
    // חפש קודם במילון המקומי, ואם לא נמצא - במילון המרכזי
    const translation = getTranslationWithFallback(wordLower, localTranslations, '');
    return translation || null;
  };

  // מצא תרגום מהשאלות הקיימות
  const findTranslationFromQuestions = (word: string): string | null => {
    const wordLower = word.toLowerCase();
    
    // חפש בשאלות הקיימות
    for (const difficulty in QUESTIONS_BY_DIFFICULTY) {
      const questions = QUESTIONS_BY_DIFFICULTY[difficulty as keyof typeof QUESTIONS_BY_DIFFICULTY];
      for (const q of questions) {
        // אם המילה היא התשובה הנכונה, קח את התרגום מההסבר
        if (q.answer.toLowerCase() === wordLower && q.explanationHe) {
          // נסה לחלץ את התרגום מההסבר
          // ההסבר יכול להיות "כרית רכה" או "כרית רכה - Pillow is soft"
          const parts = q.explanationHe.split('-');
          if (parts.length > 0) {
            const translation = parts[0].trim();
            // אם התרגום הוא מילה אחת או שתיים, קח אותו
            if (translation.split(/\s+/).length <= 2) {
              return translation;
            }
          }
        }
      }
    }
    
    return null;
  };

  const collectAllWordsFromGame = () => {
    const wordsMap = new Map<string, string>();
    
    if (!questions || questions.length === 0) {
      return [];
    }
    
    questions.forEach((question) => {
      // הוסף את התשובה הנכונה - רק מהמילון הבסיסי!
      if (question.answer) {
        const answerWord = question.answer.toLowerCase();
        if (!wordsMap.has(answerWord)) {
          // השתמש רק במילון הבסיסי - אל תנסה לחלץ מההסבר!
          const translation = getTranslationForWord(answerWord);
          
          // אם יש תרגום טוב מהמילון, שמור אותו
          if (translation && translation !== answerWord) {
          wordsMap.set(answerWord, translation);
          }
        }
      }
      
      // הוסף מילים מהאפשרויות - רק מהמילון הבסיסי!
      if (question.options) {
        question.options.forEach(option => {
          const optionWords = extractEnglishWords(option);
          optionWords.forEach(word => {
            if (!wordsMap.has(word.toLowerCase())) {
              // השתמש רק במילון הבסיסי - אל תנסה לחלץ מההסבר!
              const translation = getTranslationForWord(word);
              
              // אם יש תרגום טוב מהמילון, שמור אותו
              if (translation && translation !== word) {
                wordsMap.set(word.toLowerCase(), translation);
              }
            }
          });
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

  const saveLearnedWord = async (word: string, translation: string, isCorrect: boolean) => {
    if (!user) {
      console.log('Cannot save word - no user logged in');
      return;
    }
    
    try {
      // ודא שהתרגום הוא הנכון - קודם כל מהמילון הבסיסי
      let finalTranslation = getTranslationForWord(word);
      
      // אם אין במילון, נסה למצוא מהשאלות הקיימות
      if (!finalTranslation) {
        finalTranslation = findTranslationFromQuestions(word);
      }
      
      // אם עדיין אין, נסה להשתמש בתרגום שקיבלנו (אבל רק אם הוא טוב)
      if (!finalTranslation && translation && translation !== word && !translation.includes('המילה') && !translation.includes('באנגלית')) {
        // בדוק אם התרגום הוא מילה אחת או שתיים (לא משפט ארוך)
        if (translation.split(/\s+/).length <= 2) {
          finalTranslation = translation;
        }
      }
      
      // אם אין תרגום טוב, שמור את המילה עם התרגום "לא ידוע" (נצטרך להוסיף למילון מאוחר יותר)
      if (!finalTranslation || finalTranslation === word || finalTranslation.includes('המילה') || finalTranslation.includes('באנגלית')) {
        // שמור את המילה עם סימן שאלה - נצטרך להוסיף למילון מאוחר יותר
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
          gameName: 'MultipleChoice',
          difficulty: levelMap[level] || 'beginner',
          isCorrect: isCorrect
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Failed to save word "${word}":`, response.status, errorData);
        throw new Error(`Failed to save word: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Word "${word}" saved successfully:`, result);
      return result;
    } catch (error) {
      console.error(`Failed to save learned word "${word}":`, error);
      throw error;
    }
  };

  const handleSelect = async (option: string) => {
    if (feedback) return;
    
    const question = questions[current];
    const isCorrect = option === question.answer;
    
    setSelected(option);

    if (isCorrect) {
      const explanation = question.explanationHe || question.explanation || `התשובה הנכונה היא "${question.answer}".`;
      setFeedback(`נכון! 🎉\n\nהסבר: ${explanation}`);
      setScore(prev => prev + 3);
      setCorrectAnswers(prev => prev + 1);
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play().catch(err => console.error('Error playing success audio:', err));
      }
    } else {
      const explanation = question.explanationHe || question.explanation || `התשובה הנכונה היא "${question.answer}".`;
      setFeedback(`לא נכון! ❌\n\nהסבר: ${explanation}`);
      setScore(prev => Math.max(0, prev - 2));
      setWrongAnswers(prev => prev + 1);
      addMistake(question.id);
      if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play().catch(err => console.error('Error playing fail audio:', err));
      }
    }
  };
  
  const handleNext = async () => {
    setFeedback(null);
    setSelected(null);
    setShowHint(false);
    
    if (current < questions.length - 1) {
      setCurrent(prev => prev + 1);
    } else {
      // זה השאלה האחרונה - אסוף את כל המילים לפני סיום המשחק
      console.log('Game finished! Collecting words...');
      const allWords = collectAllWordsFromGame();
      console.log('All collected words:', allWords);
      
      // עדכן את ה-state עם המילים
      setLearnedWordsList(allWords);
      
      // שמור את כל המילים (רק אם המשתמש מחובר ולא משחק עם מילים שנלמדו)
      // בדוק אילו מילים כבר קיימות במסד הנתונים לפני השמירה
      if (user && allWords.length > 0 && !useLearnedWords) {
        console.log('User is logged in, checking existing words before saving...');
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
      }
      
      setFinished(true);
      
      if (user) {
        try {
          const totalQuestions = questions.length;
          const won = correctAnswers > (totalQuestions / 2); // ניצחון אם ענה על יותר מ-50% נכון
          const perfectScore = correctAnswers === totalQuestions && wrongAnswers === 0; // בקיאות מלאה אם ענה על כל השאלות נכון
          
          const response = await fetch('/api/games/update-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              gameName: 'MultipleChoice',
              score,
              won: won,
              correctAnswers: correctAnswers,
              totalQuestions: totalQuestions,
              perfectScore: perfectScore,
              time,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.newlyCompletedAchievements && data.newlyCompletedAchievements.length > 0) {
              setNewlyCompletedAchievements(data.newlyCompletedAchievements);
              setShowAchievementModal(true);
              
              // עדכן את המשתמש עם המתנות החדשות
              if (updateUser && user) {
                updateUser(user);
              }
            }
            // בדוק אם המשתמש עלה רמה
            if (data.levelUp && data.oldLevel !== undefined && data.newLevel !== undefined) {
              setLevelUpData({
                oldLevel: data.oldLevel,
                newLevel: data.newLevel
              });
              setShowLevelUpModal(true);
            }
          }
        } catch (error) {
          console.error('Failed to update game stats:', error);
        }
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">טוען...</div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-purple-500 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 text-center border-4 border-blue-200">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">בחירה מרובה</h1>
          <p className="text-xl text-gray-600 mb-8">בחר את התשובה הנכונה</p>
          
          {/* בחירת מצב משחק - רגיל או מילים שנלמדו */}
          <div className="mb-6 bg-white bg-opacity-90 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">בחר מצב משחק:</h2>
            <div className="flex flex-col gap-4">
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
                🎮 משחק רגיל
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
                    📚 משחק עם מילים שנלמדו
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
                      id="all-words-mc"
                      name="word-selection-mc"
                      checked={selectedWordsCount === null && selectedWords.length === 0 && !showWordSelector}
                      onChange={() => {
                        setSelectedWordsCount(null);
                        setSelectedWords([]);
                        setShowWordSelector(false);
                      }}
                      className="w-5 h-5"
                    />
                    <label htmlFor="all-words-mc" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      כל המילים ({learnedWordsData.length})
                    </label>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <input
                      type="radio"
                      id="custom-count-mc"
                      name="word-selection-mc"
                      checked={selectedWordsCount !== null && selectedWords.length === 0 && !showWordSelector}
                      onChange={() => {
                        setSelectedWordsCount(Math.min(40, learnedWordsData.length));
                        setSelectedWords([]);
                        setShowWordSelector(false);
                      }}
                      className="w-5 h-5"
                    />
                    <label htmlFor="custom-count-mc" className="text-sm font-semibold text-gray-700 cursor-pointer">
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
                      id="select-words-mc"
                      name="word-selection-mc"
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
                    <label htmlFor="select-words-mc" className="text-sm font-semibold text-gray-700 cursor-pointer">
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
          
            <button
              onClick={() => {
                if (useLearnedWords && learnedWordsData.length === 0) {
                  alert('אין מספיק מילים שנלמדו כדי לשחק. אנא שחק במשחקים אחרים כדי ללמוד מילים.');
                  return;
                }
                if (useLearnedWords && showWordSelector && selectedWords.length === 0) {
                  alert('אנא בחר לפחות מילה אחת למשחק.');
                  return;
                }
                setGameStarted(true);
              }}
              disabled={useLearnedWords && (learnedWordsData.length === 0 || (showWordSelector && selectedWords.length === 0))}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:from-green-500 hover:to-blue-600 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            התחל משחק
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">טוען שאלות...</div>
      </div>
    );
  }
  
  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-purple-500 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 text-center border-4 border-blue-200">
          {correctAnswers === questions.length && wrongAnswers === 0 ? (
            <div className="mb-6">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-4 animate-pulse">🏆 ניצחת בבקיאות מלאה!</h1>
              <p className="text-3xl text-yellow-600 font-bold mb-2">כל הכבוד! ענית נכון על כל השאלות!</p>
            </div>
          ) : correctAnswers > (questions.length / 2) ? (
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">🎉 כל הכבוד! ניצחת!</h1>
          ) : (
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">📊 המשחק הסתיים</h1>
          )}
          <p className="text-2xl text-blue-600 mb-2 font-bold">הציון שלך: {score} נקודות</p>
          <p className="text-xl text-gray-600 mb-2">תשובות נכונות: {correctAnswers} / {questions.length}</p>
          <p className="text-xl text-purple-600 mb-8 font-semibold">זמן: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</p>
          
          {/* רשימת המילים שנלמדו */}
          {learnedWordsList && learnedWordsList.length > 0 && (
            <div className="mb-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300">
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
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xl font-bold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105"
            >
              שחק שוב 🔄
            </button>
            {user && learnedWordsList && learnedWordsList.length > 0 && (
              <a
                href="/learned-words"
                className="px-8 py-3 bg-gradient-to-r from-indigo-400 to-purple-500 text-white rounded-full text-xl font-bold shadow-lg hover:from-indigo-500 hover:to-purple-600 transition-transform transform hover:scale-105"
              >
                📚 צפה בכל המילים
              </a>
            )}
            <button
              onClick={() => window.location.href = '/games'}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full text-xl font-bold shadow-lg hover:from-green-600 hover:to-teal-700 transition-transform transform hover:scale-105"
            >
              משחקים נוספים 🎮
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const question = questions[current];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-300 to-purple-500 p-4">
      {/* נגן צלילים */}
      <audio ref={successAudio} src="/voise/הצלחה.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/כשלון.dat" preload="auto" />
      
      <AdManager showBanner={true} bannerPosition="top" testMode={false} />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-white">
              שאלה {current + 1}/{questions.length}
          </div>
            <div className="text-xl text-blue-100">
              ⏱️ {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xl font-bold text-yellow-200">
              🏆 {score}
            </div>
              </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
                </div>
              </div>
        
        {/* Question */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 mb-6 border-2 border-blue-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {question.question}
          </h2>
          
          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {question.options.map((option, index) => (
                  <button
                key={index}
                    onClick={() => handleSelect(option)}
                disabled={!!feedback}
                className={`p-6 rounded-xl text-xl font-bold transition-all duration-300 transform ${
                  selected === option
                    ? feedback === 'נכון! 🎉'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
                    : feedback && option === question.answer
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                    : `bg-gradient-to-r ${index === 0 ? 'from-blue-400 to-blue-500' : index === 1 ? 'from-purple-400 to-purple-500' : index === 2 ? 'from-pink-400 to-pink-500' : 'from-orange-400 to-orange-500'} text-white hover:scale-105 hover:shadow-lg`
                } ${feedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
          
          {/* Feedback */}
              {feedback && (
            <div className={`text-center mb-6 p-6 rounded-2xl shadow-lg ${
              feedback.includes('נכון! 🎉') ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
            }`}>
              <div className="text-2xl font-bold animate-bounce whitespace-pre-line">{feedback}</div>
                    </div>
                  )}
          
          {/* Next Button */}
          {feedback && (
            <div className="text-center">
                  <button
                    onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xl font-bold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105"
                  >
                {current < questions.length - 1 ? 'שאלה הבאה ➡️' : 'סיים משחק 🏁'}
                  </button>
                </div>
              )}
            </div>
      </div>
      
      <AdManager showBanner={true} bannerPosition="bottom" testMode={false} />
      
      {/* Level Up Modal */}
      {levelUpData && (
        <LevelUpModal
          show={showLevelUpModal}
          oldLevel={levelUpData.oldLevel}
          newLevel={levelUpData.newLevel}
          onClose={() => {
            setShowLevelUpModal(false);
            setLevelUpData(null);
          }}
        />
      )}

      {/* Achievement Modal */}
      {showAchievementModal && newlyCompletedAchievements.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAchievementModal(false)}>
          <div className="bg-gradient-to-br from-yellow-100 via-orange-50 to-yellow-100 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-yellow-400 animate-bounce" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">🏆</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">כל הכבוד! הישג חדש!</h2>
              
              {newlyCompletedAchievements.map((achievement, index) => (
                <div key={achievement.id} className="mb-4 p-4 bg-white rounded-xl shadow-lg border-2 border-yellow-300">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="text-xl font-bold text-gray-800 mb-2">{achievement.name}</div>
                  <div className="flex justify-center gap-4 text-lg">
                    <div className="flex items-center text-yellow-600">
                      <span className="mr-1">💎</span>
                      <span className="font-bold">+{achievement.reward}</span>
                    </div>
                    {achievement.xpReward > 0 && (
                      <div className="flex items-center text-blue-600">
                        <span className="mr-1">⭐</span>
                        <span className="font-bold">+{achievement.xpReward} XP</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => {
                  setShowAchievementModal(false);
                  setNewlyCompletedAchievements([]);
                }}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xl font-bold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105"
              >
                מעולה! 🎉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


