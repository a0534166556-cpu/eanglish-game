"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import React from "react";
import confetti from "canvas-confetti";
import { Suspense } from 'react';

// Define a type for pictures that allows dynamic keywords
interface PictureType {
  id: number;
  url: string;
  keywords: Record<string, string[]>;
  explanationHe?: string;
}

const PICTURES: PictureType[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["girl", "book", "reading", "bed"], he: ["ילדה", "ספר", "קוראת", "מיטה"] },
    explanationHe: "ילדה שוכבת במיטה וקוראת ספר."
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["night", "stars", "sky", "galaxy"], he: ["לילה", "כוכבים", "שמיים", "גלקסיה"] },
    explanationHe: "שמיים מלאי כוכבים בלילה."
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["dog", "boy", "walk", "leash"], he: ["כלב", "ילד", "טיול", "רצועה"] },
    explanationHe: "ילד מטייל עם כלב ברצועה בפארק."
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["beach", "sea", "umbrella", "summer"], he: ["חוף", "ים", "שמשיה", "קיץ"] },
    explanationHe: "אנשים מבלים בחוף הים בקיץ."
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1518715308788-3005759c41c8?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["cat", "window", "sun", "relax"], he: ["חתול", "חלון", "שמש", "נח"] },
    explanationHe: "חתול נח על אדן החלון בשמש."
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["car", "mountain", "road", "travel"], he: ["מכונית", "הר", "כביש", "טיול"] },
    explanationHe: "מכונית נוסעת בכביש הררי בטיול."
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["children", "snow", "play", "winter"], he: ["ילדים", "שלג", "משחקים", "חורף"] },
    explanationHe: "ילדים משחקים בשלג ביום חורפי."
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["grandfather", "bench", "park", "rest"], he: ["סבא", "ספסל", "פארק", "מנוחה"] },
    explanationHe: "סבא יושב לנוח על ספסל בפארק."
  },
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["birthday", "cake", "candles", "party"], he: ["יום הולדת", "עוגה", "נרות", "מסיבה"] },
    explanationHe: "עוגת יום הולדת עם נרות במסיבה."
  },
  {
    id: 10,
    url: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["bus", "children", "school", "morning"], he: ["אוטובוס", "ילדים", "בית ספר", "בוקר"] },
    explanationHe: "ילדים עולים לאוטובוס לבית הספר בבוקר."
  },
  {
    id: 11,
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["doctor", "hospital", "patient", "medicine"], he: ["רופא", "בית חולים", "מטופל", "רפואה"] },
    explanationHe: "רופא בודק מטופל בבית חולים."
  },
  {
    id: 12,
    url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["train", "station", "waiting", "travel"], he: ["רכבת", "תחנה", "מחכים", "נסיעה"] },
    explanationHe: "אנשים מחכים לרכבת בתחנה."
  },
  {
    id: 13,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["computer", "desk", "work", "office"], he: ["מחשב", "שולחן", "עבודה", "משרד"] },
    explanationHe: "אדם עובד על מחשב במשרד."
  },
  {
    id: 14,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["bicycle", "helmet", "ride", "road"], he: ["אופניים", "קסדה", "רכיבה", "כביש"] },
    explanationHe: "ילד רוכב על אופניים עם קסדה."
  },
  {
    id: 15,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["mother", "baby", "hug", "love"], he: ["אמא", "תינוק", "חיבוק", "אהבה"] },
    explanationHe: "אמא מחבקת את התינוק שלה באהבה."
  },
  {
    id: 16,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["market", "vegetables", "shopping", "people"], he: ["שוק", "ירקות", "קניות", "אנשים"] },
    explanationHe: "אנשים קונים ירקות בשוק צבעוני."
  },
  {
    id: 17,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["family", "picnic", "blanket", "food"], he: ["משפחה", "פיקניק", "שמיכה", "אוכל"] },
    explanationHe: "משפחה עושה פיקניק על שמיכה עם אוכל."
  },
  {
    id: 18,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["forest", "trees", "fog", "morning"], he: ["יער", "עצים", "ערפל", "בוקר"] },
    explanationHe: "יער ירוק עם ערפל בבוקר."
  },
  {
    id: 19,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["children", "sled", "snow", "winter"], he: ["ילדים", "מזחלת", "שלג", "חורף"] },
    explanationHe: "ילדים גולשים על מזחלת בשלג."
  },
  {
    id: 20,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["chair", "rock", "sea", "beach", "lonely", "nature", "scenery"], he: ["כורסה", "סלע", "ים", "חוף", "בודד", "טבע", "נוף"] },
    explanationHe: "כורסה עומדת על סלע ליד הים, נוף טבעי וייחודי."
  },
  // תמונות נוספות
  {
    id: 21,
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["mountain", "lake", "reflection", "peaceful"], he: ["הר", "אגם", "השתקפות", "שלווה"] },
    explanationHe: "הר גבוה משתקף באגם שליו."
  },
  {
    id: 22,
    url: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["library", "books", "reading", "quiet"], he: ["ספרייה", "ספרים", "קריאה", "שקט"] },
    explanationHe: "ספרייה מלאה בספרים ושקטה לקריאה."
  },
  {
    id: 23,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["kitchen", "cooking", "food", "home"], he: ["מטבח", "בישול", "אוכל", "בית"] },
    explanationHe: "מטבח ביתי עם אוכל ובישול."
  },
  {
    id: 24,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["garden", "flowers", "plants", "nature"], he: ["גן", "פרחים", "צמחים", "טבע"] },
    explanationHe: "גן יפה מלא פרחים וצמחים."
  },
  {
    id: 25,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["playground", "children", "swing", "fun"], he: ["מגרש משחקים", "ילדים", "נדנדה", "כיף"] },
    explanationHe: "מגרש משחקים עם נדנדות וילדים משחקים."
  },
  {
    id: 26,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["restaurant", "dining", "food", "people"], he: ["מסעדה", "ארוחה", "אוכל", "אנשים"] },
    explanationHe: "מסעדה עם אנשים אוכלים ארוחה."
  },
  {
    id: 27,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["zoo", "animals", "elephant", "wildlife"], he: ["גן חיות", "חיות", "פיל", "חי בר"] },
    explanationHe: "גן חיות עם פיל וחיות אחרות."
  },
  {
    id: 28,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["museum", "art", "paintings", "culture"], he: ["מוזיאון", "אמנות", "ציורים", "תרבות"] },
    explanationHe: "מוזיאון אמנות עם ציורים ותרבות."
  },
  {
    id: 29,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["swimming", "pool", "water", "sport"], he: ["שחייה", "בריכה", "מים", "ספורט"] },
    explanationHe: "בריכת שחייה עם אנשים שוחים."
  },
  {
    id: 30,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["camping", "tent", "fire", "outdoor"], he: ["קמפינג", "אוהל", "מדורה", "חוץ"] },
    explanationHe: "קמפינג עם אוהל ומדורה בחוץ."
  },
  {
    id: 31,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["fishing", "river", "rod", "peaceful"], he: ["דיג", "נהר", "חכה", "שלווה"] },
    explanationHe: "דיג בנהר עם חכה בשלווה."
  },
  {
    id: 32,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["wedding", "bride", "groom", "celebration"], he: ["חתונה", "כלה", "חתן", "חגיגה"] },
    explanationHe: "חתונה עם כלה וחתן בחגיגה."
  },
  {
    id: 33,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["concert", "music", "stage", "audience"], he: ["קונצרט", "מוזיקה", "במה", "קהל"] },
    explanationHe: "קונצרט מוזיקה על במה עם קהל."
  },
  {
    id: 34,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["airport", "plane", "travel", "luggage"], he: ["שדה תעופה", "מטוס", "נסיעה", "מזוודות"] },
    explanationHe: "שדה תעופה עם מטוסים ומזוודות."
  },
  {
    id: 35,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["farm", "cow", "barn", "countryside"], he: ["חווה", "פרה", "רפת", "כפר"] },
    explanationHe: "חווה כפרית עם פרות ורפת."
  },
  {
    id: 36,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["circus", "clown", "tent", "entertainment"], he: ["קרקס", "ליצן", "אוהל", "בידור"] },
    explanationHe: "קרקס עם ליצן ואוהל בידור."
  },
  {
    id: 37,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["bakery", "bread", "oven", "fresh"], he: ["מאפייה", "לחם", "תנור", "טרי"] },
    explanationHe: "מאפייה עם לחם טרי מהתנור."
  },
  {
    id: 38,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["library", "study", "desk", "books"], he: ["ספרייה", "לימוד", "שולחן", "ספרים"] },
    explanationHe: "ספרייה ללימוד עם שולחן וספרים."
  },
  {
    id: 39,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["gym", "exercise", "weights", "fitness"], he: ["מכון כושר", "אימון", "משקולות", "כושר"] },
    explanationHe: "מכון כושר עם אימונים ומשקולות."
  },
  {
    id: 40,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["theater", "stage", "curtain", "performance"], he: ["תיאטרון", "במה", "וילון", "הופעה"] },
    explanationHe: "תיאטרון עם במה וילון והופעה."
  },
  {
    id: 41,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["cafe", "coffee", "cup", "relax"], he: ["קפה", "קפה", "כוס", "מנוחה"] },
    explanationHe: "קפה עם כוס קפה למנוחה."
  },
  {
    id: 42,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["pharmacy", "medicine", "pills", "health"], he: ["בית מרקחת", "תרופות", "כדורים", "בריאות"] },
    explanationHe: "בית מרקחת עם תרופות וכדורים."
  },
  {
    id: 43,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["post office", "mail", "letters", "service"], he: ["דואר", "דואר", "מכתבים", "שירות"] },
    explanationHe: "דואר עם מכתבים ושירות."
  },
  {
    id: 44,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["barber", "haircut", "scissors", "style"], he: ["מספרה", "תספורת", "מספריים", "סטייל"] },
    explanationHe: "מספרה עם תספורת ומספריים."
  },
  {
    id: 45,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["dentist", "teeth", "chair", "health"], he: ["רופא שיניים", "שיניים", "כיסא", "בריאות"] },
    explanationHe: "רופא שיניים עם כיסא וטיפול שיניים."
  },
  {
    id: 46,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["veterinarian", "animal", "pet", "care"], he: ["וטרינר", "חיה", "חיית מחמד", "טיפול"] },
    explanationHe: "וטרינר מטפל בחיית מחמד."
  },
  {
    id: 47,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["fire station", "fire truck", "firefighter", "emergency"], he: ["תחנת כיבוי", "מכונית כיבוי", "כבאי", "חירום"] },
    explanationHe: "תחנת כיבוי עם כבאים ומכונית כיבוי."
  },
  {
    id: 48,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["police station", "police car", "officer", "safety"], he: ["תחנת משטרה", "מכונית משטרה", "שוטר", "בטחון"] },
    explanationHe: "תחנת משטרה עם שוטרים ומכונית משטרה."
  },
  {
    id: 49,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["school", "classroom", "students", "learning"], he: ["בית ספר", "כיתה", "תלמידים", "למידה"] },
    explanationHe: "בית ספר עם כיתה ותלמידים לומדים."
  },
  {
    id: 50,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["university", "graduation", "cap", "diploma"], he: ["אוניברסיטה", "סיום לימודים", "כובע", "תעודה"] },
    explanationHe: "אוניברסיטה עם סיום לימודים ותעודה."
  },
  {
    id: 51,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["laboratory", "scientist", "experiment", "research"], he: ["מעבדה", "מדען", "ניסוי", "מחקר"] },
    explanationHe: "מעבדה עם מדען עושה ניסוי."
  },
  {
    id: 52,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["workshop", "tools", "craft", "making"], he: ["סדנה", "כלים", "מלאכה", "יצירה"] },
    explanationHe: "סדנה עם כלים ומלאכת יד."
  },
  {
    id: 53,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["garage", "car repair", "mechanic", "tools"], he: ["מוסך", "תיקון רכב", "מכונאי", "כלים"] },
    explanationHe: "מוסך עם מכונאי מתקן רכב."
  },
  {
    id: 54,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["construction", "building", "workers", "safety"], he: ["בנייה", "בניין", "עובדים", "בטיחות"] },
    explanationHe: "אתר בנייה עם עובדים בונים בניין."
  },
  {
    id: 55,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["grocery store", "shopping", "cart", "food"], he: ["מכולת", "קניות", "עגלה", "אוכל"] },
    explanationHe: "מכולת עם עגלת קניות ואוכל."
  },
  {
    id: 56,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["clothing store", "fashion", "clothes", "shopping"], he: ["חנות בגדים", "אופנה", "בגדים", "קניות"] },
    explanationHe: "חנות בגדים עם אופנה וקניות."
  },
  {
    id: 57,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["shoe store", "shoes", "feet", "fashion"], he: ["חנות נעליים", "נעליים", "רגליים", "אופנה"] },
    explanationHe: "חנות נעליים עם נעליים ואופנה."
  },
  {
    id: 58,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["jewelry store", "rings", "necklace", "gold"], he: ["חנות תכשיטים", "טבעות", "שרשרת", "זהב"] },
    explanationHe: "חנות תכשיטים עם טבעות וזהב."
  },
  {
    id: 59,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["toy store", "toys", "children", "fun"], he: ["חנות צעצועים", "צעצועים", "ילדים", "כיף"] },
    explanationHe: "חנות צעצועים עם צעצועים וילדים."
  },
  {
    id: 60,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["bookstore", "books", "reading", "knowledge"], he: ["חנות ספרים", "ספרים", "קריאה", "ידע"] },
    explanationHe: "חנות ספרים עם ספרים וידע."
  },
  {
    id: 61,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["flower shop", "flowers", "bouquet", "beautiful"], he: ["חנות פרחים", "פרחים", "זר", "יפה"] },
    explanationHe: "חנות פרחים עם זרים יפים."
  },
  {
    id: 62,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["pet store", "pets", "animals", "care"], he: ["חנות חיות", "חיות מחמד", "חיות", "טיפול"] },
    explanationHe: "חנות חיות מחמד עם חיות וטיפול."
  },
  {
    id: 63,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["sports store", "equipment", "balls", "fitness"], he: ["חנות ספורט", "ציוד", "כדורים", "כושר"] },
    explanationHe: "חנות ספורט עם ציוד וכדורים."
  },
  {
    id: 64,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["electronics store", "phones", "computers", "technology"], he: ["חנות אלקטרוניקה", "טלפונים", "מחשבים", "טכנולוגיה"] },
    explanationHe: "חנות אלקטרוניקה עם טלפונים ומחשבים."
  },
  {
    id: 65,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["furniture store", "chairs", "tables", "home"], he: ["חנות רהיטים", "כיסאות", "שולחנות", "בית"] },
    explanationHe: "חנות רהיטים עם כיסאות ושולחנות."
  },
  {
    id: 66,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["hardware store", "tools", "nails", "building"], he: ["חנות כלי עבודה", "כלים", "מסמרים", "בנייה"] },
    explanationHe: "חנות כלי עבודה עם כלים ומסמרים."
  },
  {
    id: 67,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["garden center", "plants", "flowers", "gardening"], he: ["מרכז גינון", "צמחים", "פרחים", "גינון"] },
    explanationHe: "מרכז גינון עם צמחים ופרחים."
  },
  {
    id: 68,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["art supply store", "paint", "brushes", "creativity"], he: ["חנות ציוד אמנות", "צבע", "מברשות", "יצירתיות"] },
    explanationHe: "חנות ציוד אמנות עם צבעים ומברשות."
  },
  {
    id: 69,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["music store", "instruments", "guitar", "music"], he: ["חנות מוזיקה", "כלים", "גיטרה", "מוזיקה"] },
    explanationHe: "חנות מוזיקה עם כלים וגיטרה."
  },
  {
    id: 70,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["camera store", "photography", "lens", "pictures"], he: ["חנות מצלמות", "צילום", "עדשה", "תמונות"] },
    explanationHe: "חנות מצלמות עם ציוד צילום ועדשות."
  },
  {
    id: 71,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["bike shop", "bicycles", "repair", "cycling"], he: ["חנות אופניים", "אופניים", "תיקון", "רכיבה"] },
    explanationHe: "חנות אופניים עם תיקון ורכיבה."
  },
  {
    id: 72,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["auto parts", "car", "engine", "repair"], he: ["חלקי רכב", "מכונית", "מנוע", "תיקון"] },
    explanationHe: "חנות חלקי רכב עם מנוע ותיקון."
  },
  {
    id: 73,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["stationery store", "pens", "paper", "office"], he: ["חנות כלי כתיבה", "עטים", "נייר", "משרד"] },
    explanationHe: "חנות כלי כתיבה עם עטים ונייר."
  },
  {
    id: 74,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["gift shop", "presents", "wrapping", "celebration"], he: ["חנות מתנות", "מתנות", "אריזה", "חגיגה"] },
    explanationHe: "חנות מתנות עם מתנות ואריזה."
  },
  {
    id: 75,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["antique store", "old", "vintage", "history"], he: ["חנות עתיקות", "ישן", "וינטג", "היסטוריה"] },
    explanationHe: "חנות עתיקות עם חפצים ישנים ווינטג."
  },
  {
    id: 76,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["thrift store", "used", "cheap", "bargain"], he: ["חנות יד שנייה", "משומש", "זול", "מציאה"] },
    explanationHe: "חנות יד שנייה עם בגדים זולים ומציאות."
  },
  {
    id: 77,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["market stall", "vendor", "fresh", "local"], he: ["דוכן שוק", "מוכר", "טרי", "מקומי"] },
    explanationHe: "דוכן שוק עם מוכר מקומי ואוכל טרי."
  },
  {
    id: 78,
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["street vendor", "food", "cart", "quick"], he: ["מוכר רחוב", "אוכל", "עגלה", "מהיר"] },
    explanationHe: "מוכר רחוב עם אוכל מהיר בעגלה."
  },
  {
    id: 79,
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["ice cream truck", "ice cream", "summer", "sweet"], he: ["משאית גלידה", "גלידה", "קיץ", "מתוק"] },
    explanationHe: "משאית גלידה עם גלידה מתוקה בקיץ."
  },
  {
    id: 80,
    url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=400&q=80",
    keywords: { en: ["food truck", "lunch", "mobile", "delicious"], he: ["משאית אוכל", "ארוחת צהריים", "נייד", "טעים"] },
    explanationHe: "משאית אוכל ניידת עם ארוחה טעימה."
  },
];

const difficulties = [
  { key: "easy", label: "קל", count: 5 },
  { key: "medium", label: "בינוני", count: 10 },
  { key: "hard", label: "קשה", count: 15 },
];

const levelMap: Record<string, string> = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
  extreme: 'hard',
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};

const MOTIVATIONAL_TIPS = [
  "אל תוותר! כל ניסיון מקרב אותך להצלחה.",
  "נסה להקשיב למילים ולחפש רמזים בתמונה.",
  "מעולה! גם אם טעית, אתה לומד.",
  "כל הכבוד על ההתמדה!",
  "זכור: תרגול מביא לשלמות!"
];

function getMistakeStats() {
  try {
    return JSON.parse(localStorage.getItem('picdesc-mistakes') || '{}');
  } catch {
    return {};
  }
}
function addMistake(id: number) {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('picdesc-mistakes', JSON.stringify(stats));
}
function pickPictures(
  all: PictureType[],
  lang: 'en' | 'he',
  count: number,
  customPics: PictureType[] = []
): PictureType[] {
  const allPics = [...all, ...customPics.filter(p => p.keywords[lang])];
  const stats = getMistakeStats();
  const sorted = [...allPics].sort((a, b) => (stats[b.id] || 0) - (stats[a.id] || 0));
  const boosted = sorted.filter(p => stats[p.id] > 0).slice(0, 5);
  const rest = allPics.filter(p => !boosted.includes(p));
  const randomRest = rest.sort(() => Math.random() - 0.5).slice(0, count - boosted.length);
  return [...boosted, ...randomRest].sort(() => Math.random() - 0.5);
}

function levenshtein(a: string, b: string) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: an + 1 }, () => Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[an][bn];
}

// Add a function to get match level text and color
function getMatchLevel(sim: number | null) {
  if (sim === null) return { text: '', color: '' };
  const percent = Math.round(sim * 100);
  if (percent < 40) return { text: 'התאמה נמוכה', color: 'text-red-500' };
  if (percent < 70) return { text: 'התאמה בינונית', color: 'text-orange-500' };
  if (percent < 90) return { text: 'התאמה טובה', color: 'text-blue-600' };
  return { text: 'התאמה מצוינת', color: 'text-green-600' };
}

export default function PictureDescriptionWrapper() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <PictureDescription />
    </Suspense>
  );
}

function PictureDescription() {
  const searchParams = useSearchParams();
  const levelParam = searchParams?.get('level') || 'easy';
  const mappedLevel = levelMap[levelParam] || 'easy';
  const [difficulty] = useState(mappedLevel);
  const [lang, setLang] = useState<'en' | 'he'>('en');
  const [pictures, setPictures] = useState<PictureType[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [checking, setChecking] = useState(false);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [savedRecordings, setSavedRecordings] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, correct: 0, mistakes: 0 });
  const [personalBest, setPersonalBest] = useState<{score: number, accuracy: number} | null>(null);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);
  const [customPics, setCustomPics] = useState<PictureType[]>([]);
  const [showAddPic, setShowAddPic] = useState(false);
  const [newPic, setNewPic] = useState({ image: '', lang: lang, keywords: '', file: null });
  const [editPic, setEditPic] = useState<any|null>(null);
  const [editPicData, setEditPicData] = useState({ image: '', lang: '', keywords: '', file: null });
  const [translating, setTranslating] = useState(false);
  const [editTranslating, setEditTranslating] = useState(false);
  const [mode, setMode] = useState<'draw'|'describe'>('describe');
  const [drawWord, setDrawWord] = useState('');
  const [drawings, setDrawings] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#222');
  const [drawWidth, setDrawWidth] = useState(4);
  const [showTip, setShowTip] = useState(false);
  const [tip, setTip] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [drawingSaved, setDrawingSaved] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [imgError, setImgError] = useState(false);

  const DRAW_WORDS = [
    { en: 'dog', he: 'כלב' }, { en: 'cat', he: 'חתול' }, { en: 'car', he: 'מכונית' }, { en: 'tree', he: 'עץ' }, { en: 'house', he: 'בית' },
    { en: 'book', he: 'ספר' }, { en: 'sun', he: 'שמש' }, { en: 'ball', he: 'כדור' }, { en: 'flower', he: 'פרח' }, { en: 'fish', he: 'דג' },
    { en: 'apple', he: 'תפוח' }, { en: 'bird', he: 'ציפור' }, { en: 'butterfly', he: 'פרפר' }, { en: 'star', he: 'כוכב' }, { en: 'heart', he: 'לב' },
    { en: 'moon', he: 'ירח' }, { en: 'cloud', he: 'ענן' }, { en: 'rainbow', he: 'קשת' }, { en: 'cake', he: 'עוגה' }, { en: 'pizza', he: 'פיצה' },
    { en: 'ice cream', he: 'גלידה' }, { en: 'hamburger', he: 'המבורגר' }, { en: 'sandwich', he: 'כריך' }, { en: 'cup', he: 'כוס' }, { en: 'plate', he: 'צלחת' },
    { en: 'spoon', he: 'כפית' }, { en: 'fork', he: 'מזלג' }, { en: 'knife', he: 'סכין' }, { en: 'bottle', he: 'בקבוק' }, { en: 'glass', he: 'כוס זכוכית' },
    { en: 'chair', he: 'כיסא' }, { en: 'table', he: 'שולחן' }, { en: 'bed', he: 'מיטה' }, { en: 'sofa', he: 'ספה' }, { en: 'lamp', he: 'מנורה' },
    { en: 'clock', he: 'שעון' }, { en: 'phone', he: 'טלפון' }, { en: 'computer', he: 'מחשב' }, { en: 'television', he: 'טלוויזיה' }, { en: 'radio', he: 'רדיו' },
    { en: 'camera', he: 'מצלמה' }, { en: 'guitar', he: 'גיטרה' }, { en: 'piano', he: 'פסנתר' }, { en: 'violin', he: 'כינור' }, { en: 'drum', he: 'תוף' },
    { en: 'bicycle', he: 'אופניים' }, { en: 'motorcycle', he: 'אופנוע' }, { en: 'airplane', he: 'מטוס' }, { en: 'helicopter', he: 'מסוק' }, { en: 'boat', he: 'סירה' },
    { en: 'train', he: 'רכבת' }, { en: 'bus', he: 'אוטובוס' }, { en: 'truck', he: 'משאית' }, { en: 'taxi', he: 'מונית' }, { en: 'ambulance', he: 'אמבולנס' },
    { en: 'fire truck', he: 'מכונית כיבוי' }, { en: 'police car', he: 'מכונית משטרה' }, { en: 'school bus', he: 'אוטובוס בית ספר' }, { en: 'garbage truck', he: 'משאית זבל' }, { en: 'mail truck', he: 'משאית דואר' }
  ];

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started]);

  useEffect(() => {
    const diff = difficulties.find((d) => d.key === difficulty)!;
    setPictures(pickPictures(PICTURES, lang, diff.count, customPics));
    setCurrent(0);
    setScore(0);
    setTimer(0);
    setFinished(false);
    setFeedback(null);
    setStarted(false);
    setUserTranscript('');
    setRecording(false);
    setChecking(false);
    setSimilarity(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setStats({ total: 0, correct: 0, mistakes: 0 });
    try {
      if (typeof window !== 'undefined') {
        const pb = JSON.parse(localStorage.getItem('picdesc-best') || 'null');
        if (pb) setPersonalBest(pb);
      }
    } catch {}
  }, [difficulty, lang, customPics]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cp = JSON.parse(localStorage.getItem('picdesc-custom') || '[]');
        if (Array.isArray(cp)) setCustomPics(cp);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('picdesc-custom', JSON.stringify(customPics));
    }
  }, [customPics]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const pb = JSON.parse(localStorage.getItem('picdesc-best') || 'null');
        if (pb) setPersonalBest(pb);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!finished) return;
    const accuracy = stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0;
    if (!personalBest || score > personalBest.score || (score === personalBest.score && accuracy > personalBest.accuracy)) {
      const pb = { score, accuracy };
      setPersonalBest(pb);
      if (typeof window !== 'undefined') {
        localStorage.setItem('picdesc-best', JSON.stringify(pb));
      }
    }
  }, [finished]);

  useEffect(() => {
    if (mode === 'draw') {
      const w = DRAW_WORDS[Math.floor(Math.random()*DRAW_WORDS.length)];
      setDrawWord(lang==='he'?w.he:w.en);
    }
  }, [mode, lang]);

  useEffect(() => {
    setShowNext(false);
  }, [current, started]);

  useEffect(() => { setImgError(false); }, [current, started]);

  function handlePicUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewPic(p => ({ ...p, image: ev.target?.result as string, file: null }));
    };
    reader.readAsDataURL(file);
  }

  function addCustomPic() {
    if (!newPic.image || !newPic.keywords.trim()) return;
    const id = typeof window !== 'undefined' ? Date.now() : Math.floor(Math.random()*1000000);
    setCustomPics([...customPics, {
      id,
      url: newPic.image,
      keywords: {
        [newPic.lang]: newPic.keywords.split(',').map(s => s.trim()).filter(Boolean)
      }
    }]);
    setShowAddPic(false);
    setNewPic({ image: '', lang: lang, keywords: '', file: null });
  }

  function deleteCustomPic(id: number) {
    setCustomPics(customPics.filter(p => p.id !== id));
  }

  function startEditPic(pic: any) {
    setEditPic(pic);
    setEditPicData({
      image: pic.url,
      lang: Object.keys(pic.keywords)[0] || 'he',
      keywords: (pic.keywords[Object.keys(pic.keywords)[0]] || []).join(', '),
      file: null
    });
  }

  function handleEditPicUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditPicData(p => ({ ...p, image: ev.target?.result as string, file: null }));
    };
    reader.readAsDataURL(file);
  }

  function saveEditPic() {
    if (!editPic) return;
    setCustomPics(customPics.map(p => p.id === editPic.id ? {
      ...p,
      url: editPicData.image,
      keywords: {
        [editPicData.lang]: editPicData.keywords.split(',').map(s => s.trim()).filter(Boolean)
      }
    } : p));
    setEditPic(null);
  }

  const startRecording = () => {
    setRecording(true);
    setUserTranscript('');
    setAudioBlob(null);
    setAudioUrl(null);
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFeedback('דפדפן לא תומך בזיהוי דיבור');
      setRecording(false);
      return;
    }
    let mediaRecorder: MediaRecorder;
    let chunks: BlobPart[] = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        try {
          const prev = JSON.parse(localStorage.getItem('picdesc-recordings') || '[]');
          const updated = [url, ...prev].slice(0, 3);
          setSavedRecordings(updated);
          localStorage.setItem('picdesc-recordings', JSON.stringify(updated));
        } catch {}
      };
      mediaRecorder.start();
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'he' ? 'he-IL' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserTranscript(transcript);
        setRecording(false);
        setChecking(true);
        setTimeout(() => checkAnswer(transcript), 500);
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      };
      recognition.onerror = () => {
        setFeedback('שגיאה בהקלטה');
        setRecording(false);
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      };
      recognition.onend = () => {
        setRecording(false);
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      };
      recognition.start();
    }).catch(() => {
      setFeedback('אין הרשאת מיקרופון');
      setRecording(false);
    });
  };

  const checkAnswer = (transcript: string) => {
    setChecking(false);
    const correctKeywords = pictures[current].keywords[lang];
    const user = transcript.trim().toLowerCase();
    let matched = 0;
    correctKeywords.forEach(kw => {
      const kwLower = kw.toLowerCase();
      let found = user.includes(kwLower);
      if (!found && lang === 'en' && !kwLower.endsWith('s')) {
        found = user.includes(kwLower + 's');
      }
      if (found) matched++;
    });
    let similarity = 0;
    if (matched === correctKeywords.length) {
      similarity = 0.9;
    } else if (matched > 0) {
      similarity = matched / correctKeywords.length;
    }
    if (matched < Math.ceil(correctKeywords.length / 2)) {
      const dist = levenshtein(user, correctKeywords.join(' '));
      const maxLen = Math.max(user.length, correctKeywords.join(' ').length);
      const levSim = maxLen === 0 ? 1 : 1 - dist / maxLen;
      similarity = Math.max(similarity, levSim);
    }
    setSimilarity(similarity);
    let feedbackMsg = '';
    if (similarity >= 0.9) feedbackMsg = 'מעולה!';
    else if (similarity >= 0.6) feedbackMsg = 'כמעט! נסה שוב';
    else feedbackMsg = 'נסה שוב';
    setFeedback(feedbackMsg);
    setStats(s => ({
      total: s.total + 1,
      correct: s.correct + (similarity >= 0.9 ? 1 : 0),
      mistakes: s.mistakes + (similarity >= 0.9 ? 0 : 1)
    }));
    setShowNext(true);
    setShowTip(false);
    setShowHint(false);
    setShowAnswer(true);
    if (similarity >= 0.9) {
      setScore((s) => s + 15);
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play();
      }
      if (current === pictures.length - 1) {
        setFinished(true);
        confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 } });
      }
    } else {
      setScore((s) => Math.max(0, s - 2)); // עונש של 2 נקודות על טעות
      addMistake(pictures[current].id);
      if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play();
      }
      if (stats.mistakes % 2 === 1) {
        setTip(MOTIVATIONAL_TIPS[Math.floor(Math.random() * MOTIVATIONAL_TIPS.length)]);
        setShowTip(true);
      }
      setTimeout(() => setShowHint(true), 1200);
    }
  };

  const startGame = () => {
    setStarted(true);
    setTimer(0);
    setScore(0);
    setCurrent(0);
    setFinished(false);
    setFeedback(null);
    setUserTranscript('');
    setSimilarity(null);
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const restart = () => {
    setStarted(false);
    setCurrent(0);
    setScore(0);
    setTimer(0);
    setFinished(false);
    setFeedback(null);
    setUserTranscript('');
    setSimilarity(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setShowHint(false);
  };

  const isRTL = lang === 'he';
  const progress = pictures.length > 0 ? ((current + 1) / pictures.length) * 100 : 0;

  // הורדה/שיתוף הקלטה
  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  async function translateKeywords(text: string, from: string, to: string, cb: (val: string) => void) {
    if (!text.trim()) return;
    if (from === to) return;
    try {
      cb('מתרגם...');
      setTranslating(true);
      const res = await fetch(`/api/translate?text=${encodeURIComponent(text)}&from=${from}&to=${to}`);
      const data = await res.json();
      cb(data.translation || '');
    } catch {
      cb('שגיאה בתרגום');
    }
    setTranslating(false);
  }

  async function translateEditKeywords(text: string, from: string, to: string, cb: (val: string) => void) {
    if (!text.trim()) return;
    if (from === to) return;
    try {
      cb('מתרגם...');
      setEditTranslating(true);
      const res = await fetch(`/api/translate?text=${encodeURIComponent(text)}&from=${from}&to=${to}`);
      const data = await res.json();
      cb(data.translation || '');
    } catch {
      cb('שגיאה בתרגום');
    }
    setEditTranslating(false);
  }

  function switchMode(newMode: 'draw' | 'describe') {
    setMode(newMode);
    console.log('Switching mode to', newMode);
    if (newMode === 'draw') {
      const w = DRAW_WORDS[Math.floor(Math.random()*DRAW_WORDS.length)];
      setDrawWord(lang==='he'?w.he:w.en);
      clearCanvas();
    }
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    setDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    let x = 0, y = 0;
    if ('touches' in e && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else if ('clientX' in e) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    ctx.lineWidth = drawWidth;
    ctx.strokeStyle = drawColor;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function endDraw() {
    setDrawing(false);
  }
  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    let x = 0, y = 0;
    if ('touches' in e && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else if ('clientX' in e) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    // ניקוי הלוח לא נחשב כשלון - לא מנגן קול כשלון
  }
  function saveDrawing() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL();
    setDrawings(ds => [url, ...ds].slice(0,5));
    setDrawingSaved(true);
    
    // בדיקה משופרת של הציור
    const isGoodDrawing = checkDrawingMatch(drawWord, canvas);
    
    if (isGoodDrawing) {
    if (successAudio.current) {
      successAudio.current.currentTime = 0;
      successAudio.current.play();
    }
      setFeedback('מעולה! ציור נהדר! 🎨');
    } else {
      if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play();
      }
      setFeedback('נסה שוב! תתמקד במילה: ' + drawWord);
    }
  }
  
  function checkDrawingMatch(word: string, canvas: HTMLCanvasElement): boolean {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // סופר פיקסלים לא לבנים (כלומר יש ציור)
    let nonWhitePixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // אם הפיקסל לא לבן
      if (r < 250 || g < 250 || b < 250) {
        nonWhitePixels++;
      }
    }
    
    // בדיקה בסיסית - צריך מספיק ציור (הורדתי ל-5%)
    const minPixels = canvas.width * canvas.height * 0.05; // 5% מהקנבס
    if (nonWhitePixels < minPixels) return false;
    
    // בדיקה אם הציור מפוזר על הקנבס (לא רק נקודה אחת)
    const hasSpread = checkDrawingSpread(canvas, data);
    if (!hasSpread) return false;
    
    // בדיקה נוספת - אם הציור נראה כמו קו פשוט מדי (הורדתי את הדרישות)
    const isTooSimple = checkIfTooSimple(canvas, data);
    if (isTooSimple) return false;
    
    // בדיקה ספציפית לפי המילה
    const wordLower = word.toLowerCase();
    
    if (wordLower === 'sun' || wordLower === 'שמש') {
      return checkSunDrawing(canvas, data);
    } else if (wordLower === 'moon' || wordLower === 'ירח') {
      return checkMoonDrawing(canvas, data);
    } else if (wordLower === 'star' || wordLower === 'כוכב') {
      return checkStarDrawing(canvas, data);
    } else if (wordLower === 'heart' || wordLower === 'לב') {
      return checkHeartDrawing(canvas, data);
    } else if (wordLower === 'ball' || wordLower === 'כדור') {
      return checkBallDrawing(canvas, data);
    } else if (wordLower === 'apple' || wordLower === 'תפוח') {
      return checkAppleDrawing(canvas, data);
    } else if (wordLower === 'house' || wordLower === 'בית') {
      return checkHouseDrawing(canvas, data);
    } else if (wordLower === 'tree' || wordLower === 'עץ') {
      return checkTreeDrawing(canvas, data);
    } else if (wordLower === 'car' || wordLower === 'מכונית') {
      return checkCarDrawing(canvas, data);
    } else if (wordLower === 'dog' || wordLower === 'כלב') {
      return checkDogDrawing(canvas, data);
    } else if (wordLower === 'cat' || wordLower === 'חתול') {
      return checkCatDrawing(canvas, data);
    } else if (wordLower === 'bird' || wordLower === 'ציפור') {
      return checkBirdDrawing(canvas, data);
    } else if (wordLower === 'fish' || wordLower === 'דג') {
      return checkFishDrawing(canvas, data);
    } else if (wordLower === 'flower' || wordLower === 'פרח') {
      return checkFlowerDrawing(canvas, data);
    } else if (wordLower === 'butterfly' || wordLower === 'פרפר') {
      return checkButterflyDrawing(canvas, data);
    } else if (wordLower === 'book' || wordLower === 'ספר') {
      return checkBookDrawing(canvas, data);
    } else if (wordLower === 'cake' || wordLower === 'עוגה') {
      return checkCakeDrawing(canvas, data);
    } else if (wordLower === 'pizza' || wordLower === 'פיצה') {
      return checkPizzaDrawing(canvas, data);
    } else if (wordLower === 'ice cream' || wordLower === 'גלידה') {
      return checkIceCreamDrawing(canvas, data);
    } else if (wordLower === 'cup' || wordLower === 'כוס') {
      return checkCupDrawing(canvas, data);
    } else if (wordLower === 'bottle' || wordLower === 'בקבוק') {
      return checkBottleDrawing(canvas, data);
    } else if (wordLower === 'chair' || wordLower === 'כיסא') {
      return checkChairDrawing(canvas, data);
    } else if (wordLower === 'table' || wordLower === 'שולחן') {
      return checkTableDrawing(canvas, data);
    } else if (wordLower === 'bed' || wordLower === 'מיטה') {
      return checkBedDrawing(canvas, data);
    } else if (wordLower === 'clock' || wordLower === 'שעון') {
      return checkClockDrawing(canvas, data);
    } else if (wordLower === 'phone' || wordLower === 'טלפון') {
      return checkPhoneDrawing(canvas, data);
    } else if (wordLower === 'bicycle' || wordLower === 'אופניים') {
      return checkBicycleDrawing(canvas, data);
    } else if (wordLower === 'airplane' || wordLower === 'מטוס') {
      return checkAirplaneDrawing(canvas, data);
    } else if (wordLower === 'train' || wordLower === 'רכבת') {
      return checkTrainDrawing(canvas, data);
    } else if (wordLower === 'bus' || wordLower === 'אוטובוס') {
      return checkBusDrawing(canvas, data);
    } else if (wordLower === 'cloud' || wordLower === 'ענן') {
      return checkCloudDrawing(canvas, data);
    } else if (wordLower === 'rainbow' || wordLower === 'קשת') {
      return checkRainbowDrawing(canvas, data);
    } else if (wordLower === 'hamburger' || wordLower === 'המבורגר') {
      return checkHamburgerDrawing(canvas, data);
    } else if (wordLower === 'sandwich' || wordLower === 'כריך') {
      return checkSandwichDrawing(canvas, data);
    } else if (wordLower === 'plate' || wordLower === 'צלחת') {
      return checkPlateDrawing(canvas, data);
    } else if (wordLower === 'spoon' || wordLower === 'כפית') {
      return checkSpoonDrawing(canvas, data);
    } else if (wordLower === 'fork' || wordLower === 'מזלג') {
      return checkForkDrawing(canvas, data);
    } else if (wordLower === 'knife' || wordLower === 'סכין') {
      return checkKnifeDrawing(canvas, data);
    } else if (wordLower === 'glass' || wordLower === 'כוס זכוכית') {
      return checkGlassDrawing(canvas, data);
    } else if (wordLower === 'sofa' || wordLower === 'ספה') {
      return checkSofaDrawing(canvas, data);
    } else if (wordLower === 'lamp' || wordLower === 'מנורה') {
      return checkLampDrawing(canvas, data);
    } else if (wordLower === 'television' || wordLower === 'טלוויזיה') {
      return checkTelevisionDrawing(canvas, data);
    } else if (wordLower === 'radio' || wordLower === 'רדיו') {
      return checkRadioDrawing(canvas, data);
    } else if (wordLower === 'camera' || wordLower === 'מצלמה') {
      return checkCameraDrawing(canvas, data);
    } else if (wordLower === 'guitar' || wordLower === 'גיטרה') {
      return checkGuitarDrawing(canvas, data);
    } else if (wordLower === 'piano' || wordLower === 'פסנתר') {
      return checkPianoDrawing(canvas, data);
    } else if (wordLower === 'violin' || wordLower === 'כינור') {
      return checkViolinDrawing(canvas, data);
    } else if (wordLower === 'drum' || wordLower === 'תוף') {
      return checkDrumDrawing(canvas, data);
    } else if (wordLower === 'motorcycle' || wordLower === 'אופנוע') {
      return checkMotorcycleDrawing(canvas, data);
    } else if (wordLower === 'helicopter' || wordLower === 'מסוק') {
      return checkHelicopterDrawing(canvas, data);
    } else if (wordLower === 'boat' || wordLower === 'סירה') {
      return checkBoatDrawing(canvas, data);
    } else if (wordLower === 'truck' || wordLower === 'משאית') {
      return checkTruckDrawing(canvas, data);
    } else if (wordLower === 'taxi' || wordLower === 'מונית') {
      return checkTaxiDrawing(canvas, data);
    } else if (wordLower === 'ambulance' || wordLower === 'אמבולנס') {
      return checkAmbulanceDrawing(canvas, data);
    } else if (wordLower === 'fire truck' || wordLower === 'מכונית כיבוי') {
      return checkFireTruckDrawing(canvas, data);
    } else if (wordLower === 'police car' || wordLower === 'מכונית משטרה') {
      return checkPoliceCarDrawing(canvas, data);
    } else if (wordLower === 'school bus' || wordLower === 'אוטובוס בית ספר') {
      return checkSchoolBusDrawing(canvas, data);
    } else if (wordLower === 'garbage truck' || wordLower === 'משאית זבל') {
      return checkGarbageTruckDrawing(canvas, data);
    } else if (wordLower === 'mail truck' || wordLower === 'משאית דואר') {
      return checkMailTruckDrawing(canvas, data);
    }
    
    // אם המילה לא מוכרת, בדיקה כללית
    return nonWhitePixels > minPixels;
  }
  
  function checkSunDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש עיגול במרכז (שמש)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 6;
    
    let circlePixels = 0;
    let rayPixels = 0;
    
    // בודק עיגול במרכז
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distance <= radius) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            circlePixels++;
          }
        }
      }
    }
    
    // בודק קרני שמש (קווים היוצאים מהמרכז)
    const rayDirections = [
      { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
      { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }
    ];
    
    for (const dir of rayDirections) {
      for (let i = radius + 5; i < radius + 20; i++) {
        const x = Math.round(centerX + dir.x * i);
        const y = Math.round(centerY + dir.y * i);
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            rayPixels++;
          }
        }
      }
    }
    
    // צריך עיגול במרכז או קרני שמש
    return circlePixels > 10 || rayPixels > 20;
  }
  
  function checkMoonDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש עיגול או חצי עיגול (ירח)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 6;
    
    let circlePixels = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distance <= radius) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            circlePixels++;
          }
        }
      }
    }
    return circlePixels > 10;
  }
  
  function checkStarDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש כוכב (5 קווים או יותר היוצאים מנקודה)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    let rayCount = 0;
    const directions = [
      { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
      { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }
    ];
    
    for (const dir of directions) {
      let hasRay = false;
      for (let i = 10; i < 30; i++) {
        const x = Math.round(centerX + dir.x * i);
        const y = Math.round(centerY + dir.y * i);
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            hasRay = true;
            break;
          }
        }
      }
      if (hasRay) rayCount++;
    }
    return rayCount >= 4; // צריך לפחות 4 קרניים
  }
  
  function checkHeartDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בדיקה פשוטה - אם יש ציור בצורת לב (2 עיגולים + משולש)
    return true; // לב קשה לבדוק, אז נקבל כל ציור
  }
  
  function checkBallDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש עיגול (כדור)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 8;
    
    let circlePixels = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distance <= radius) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            circlePixels++;
          }
        }
      }
    }
    return circlePixels > 5;
  }
  
  function checkAppleDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש עיגול (תפוח)
    return checkBallDrawing(canvas, data);
  }
  
  function checkHouseDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מרובעת (בית)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height) / 4;
    
    let squarePixels = 0;
    for (let y = centerY - size/2; y < centerY + size/2; y++) {
      for (let x = centerX - size/2; x < centerX + size/2; x++) {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            squarePixels++;
          }
        }
      }
    }
    return squarePixels > 20;
  }
  
  function checkTreeDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש קו אנכי (גזע עץ) ועיגול (עלים)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // בודק קו אנכי (גזע)
    let trunkPixels = 0;
    for (let y = centerY; y < canvas.height; y++) {
      const index = (y * canvas.width + centerX) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      if (r < 250 || g < 250 || b < 250) {
        trunkPixels++;
      }
    }
    
    // בודק עיגול (עלים)
    let leavesPixels = 0;
    const radius = Math.min(canvas.width, canvas.height) / 8;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY + radius) ** 2);
        if (distance <= radius) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            leavesPixels++;
          }
        }
      }
    }
    
    return trunkPixels > 5 || leavesPixels > 10;
  }
  
  function checkCarDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (מכונית)
    return checkHouseDrawing(canvas, data);
  }
  
  function checkDogDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (כלב)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkCatDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (חתול)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkBirdDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (ציפור)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkFishDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (דג)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkFlowerDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש עיגול (פרח)
    return checkBallDrawing(canvas, data);
  }
  
  function checkButterflyDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (פרפר)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkBookDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (ספר)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkCakeDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (עוגה)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkPizzaDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש עיגול (פיצה)
    return checkBallDrawing(canvas, data);
  }
  
  function checkIceCreamDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש עיגול (גלידה)
    return checkBallDrawing(canvas, data);
  }
  
  function checkCupDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (כוס)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkBottleDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה של בקבוק (צר למעלה, רחב למטה)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const width = Math.min(canvas.width, canvas.height) / 4;
    const height = Math.min(canvas.width, canvas.height) / 2;
    
    // בודק את החלק העליון (צר יותר)
    let topPixels = 0;
    const topWidth = width * 0.6; // 60% מהרוחב
    for (let y = centerY - height/2; y < centerY - height/4; y++) {
      for (let x = centerX - topWidth/2; x < centerX + topWidth/2; x++) {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            topPixels++;
          }
        }
      }
    }
    
    // בודק את החלק התחתון (רחב יותר)
    let bottomPixels = 0;
    const bottomWidth = width; // 100% מהרוחב
    for (let y = centerY - height/4; y < centerY + height/2; y++) {
      for (let x = centerX - bottomWidth/2; x < centerX + bottomWidth/2; x++) {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            bottomPixels++;
          }
        }
      }
    }
    
    // צריך לפחות 20 פיקסלים בחלק העליון ו-30 בחלק התחתון
    return topPixels > 20 && bottomPixels > 30;
  }
  
  function checkChairDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש כיסא (משענת + מושב + רגליים)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const width = Math.min(canvas.width, canvas.height) / 4;
    const height = Math.min(canvas.width, canvas.height) / 3;
    
    // בודק משענת (חלק עליון)
    let backPixels = 0;
    for (let y = centerY - height/2; y < centerY - height/4; y++) {
      for (let x = centerX - width/2; x < centerX + width/2; x++) {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            backPixels++;
          }
        }
      }
    }
    
    // בודק מושב (חלק אמצעי)
    let seatPixels = 0;
    for (let y = centerY - height/4; y < centerY + height/4; y++) {
      for (let x = centerX - width/2; x < centerX + width/2; x++) {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            seatPixels++;
          }
        }
      }
    }
    
    // בודק רגליים (חלק תחתון)
    let legsPixels = 0;
    for (let y = centerY + height/4; y < centerY + height/2; y++) {
      for (let x = centerX - width/2; x < centerX + width/2; x++) {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            legsPixels++;
          }
        }
      }
    }
    
    // צריך לפחות 15 פיקסלים במשענת, 20 במושב, ו-10 ברגליים
    return backPixels > 15 && seatPixels > 20 && legsPixels > 10;
  }
  
  function checkTableDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (שולחן)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkBedDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (מיטה)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkClockDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש עיגול (שעון)
    return checkBallDrawing(canvas, data);
  }
  
  function checkPhoneDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (טלפון)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const width = Math.min(canvas.width, canvas.height) / 3;
    const height = Math.min(canvas.width, canvas.height) / 2;
    
    let rectanglePixels = 0;
    for (let y = centerY - height/2; y < centerY + height/2; y++) {
      for (let x = centerX - width/2; x < centerX + width/2; x++) {
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            rectanglePixels++;
          }
        }
      }
    }
    
    // צריך לפחות 30 פיקסלים בצורה מלבנית
    return rectanglePixels > 30;
  }
  
  function checkBicycleDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש 2 עיגולים (גלגלי אופניים)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 10;
    
    // עיגול שמאל
    let leftWheelPixels = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const distance = Math.sqrt((x - (centerX - radius*2)) ** 2 + (y - centerY) ** 2);
        if (distance <= radius) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            leftWheelPixels++;
          }
        }
      }
    }
    
    // עיגול ימין
    let rightWheelPixels = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const distance = Math.sqrt((x - (centerX + radius*2)) ** 2 + (y - centerY) ** 2);
        if (distance <= radius) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          if (r < 250 || g < 250 || b < 250) {
            rightWheelPixels++;
          }
        }
      }
    }
    
    return leftWheelPixels > 5 || rightWheelPixels > 5;
  }
  
  function checkAirplaneDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (גוף המטוס)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkTrainDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (קרון רכבת)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkBusDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (אוטובוס)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkCloudDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש עיגול (ענן)
    return checkBallDrawing(canvas, data);
  }
  
  function checkRainbowDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש קשת (קו מעוקל)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkHamburgerDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (המבורגר)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkSandwichDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (כריך)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkPlateDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש עיגול (צלחת)
    return checkBallDrawing(canvas, data);
  }
  
  function checkSpoonDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (כפית)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkForkDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (מזלג)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkKnifeDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (סכין)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkGlassDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (כוס זכוכית)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkSofaDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (ספה)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkLampDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (מנורה)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkTelevisionDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (טלוויזיה)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkRadioDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (רדיו)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkCameraDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (מצלמה)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkGuitarDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (גיטרה)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkPianoDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (פסנתר)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkViolinDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (כינור)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkDrumDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש עיגול (תוף)
    return checkBallDrawing(canvas, data);
  }
  
  function checkMotorcycleDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש 2 עיגולים (גלגלי אופנוע)
    return checkBicycleDrawing(canvas, data);
  }
  
  function checkHelicopterDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (מסוק)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkBoatDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (סירה)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkTruckDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (משאית)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkTaxiDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (מונית)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkAmbulanceDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (אמבולנס)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkFireTruckDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (מכונית כיבוי)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkPoliceCarDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (מכונית משטרה)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkSchoolBusDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (אוטובוס בית ספר)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkGarbageTruckDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (משאית זבל)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkMailTruckDrawing(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם יש צורה מלבנית (משאית דואר)
    return checkPhoneDrawing(canvas, data);
  }
  
  function checkDrawingSpread(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם הציור מפוזר על לפחות 2 רבעים של הקנבס
    const width = canvas.width;
    const height = canvas.height;
    const quarterWidth = width / 2;
    const quarterHeight = height / 2;
    
    let topLeft = 0, topRight = 0, bottomLeft = 0, bottomRight = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        if (r < 250 || g < 250 || b < 250) {
          if (x < quarterWidth && y < quarterHeight) topLeft++;
          else if (x >= quarterWidth && y < quarterHeight) topRight++;
          else if (x < quarterWidth && y >= quarterHeight) bottomLeft++;
          else bottomRight++;
        }
      }
    }
    
    const quartersWithDrawing = [topLeft, topRight, bottomLeft, bottomRight].filter(count => count > 0).length;
    return quartersWithDrawing >= 2;
  }
  
  function checkIfTooSimple(canvas: HTMLCanvasElement, data: Uint8ClampedArray): boolean {
    // בודק אם הציור פשוט מדי (רק קו אחד או נקודה)
    const width = canvas.width;
    const height = canvas.height;
    
    // מוצא את הגבולות של הציור
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let hasDrawing = false;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        if (r < 250 || g < 250 || b < 250) {
          hasDrawing = true;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    if (!hasDrawing) return true; // אין ציור בכלל
    
    const drawingWidth = maxX - minX;
    const drawingHeight = maxY - minY;
    
    // אם הציור קטן מדי (פחות מ-15 פיקסלים ברוחב או גובה)
    if (drawingWidth < 15 || drawingHeight < 15) return true;
    
    // אם הציור נראה כמו קו דק מדי (יחס של יותר מ-1:15)
    if (drawingWidth / drawingHeight > 15 || drawingHeight / drawingWidth > 15) return true;
    
    return false;
  }
  function downloadDrawing() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL();
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drawing.png';
    a.click();
  }
  function shareDrawing() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob: Blob | null) => {
      if (navigator.share && blob) {
        const file = new File([blob], 'drawing.png', { type: 'image/png' });
        navigator.share({ files: [file], title: 'הציור שלי', text: 'ציירתי: ' + drawWord });
      }
    });
  }

  function nextDrawingQuestion() {
    setDrawingSaved(false);
    clearCanvas();
    const w = DRAW_WORDS[Math.floor(Math.random()*DRAW_WORDS.length)];
    setDrawWord(lang==='he'?w.he:w.en);
  }

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-700 ${isRTL ? 'rtl' : ''} ${feedback==='מעולה!' ? 'bg-gradient-to-br from-green-200 via-blue-100 to-yellow-100' : feedback ? 'bg-gradient-to-br from-red-100 via-yellow-100 to-blue-50' : 'bg-gradient-to-br from-yellow-200 via-blue-200 to-green-200'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <audio ref={successAudio} src="/voise/הצלחה.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/כשלון.dat" preload="auto" />
      <div className="max-w-2xl w-full mx-auto bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 transition-all duration-700">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-700 text-center drop-shadow-lg flex items-center gap-4">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-blue-400 text-white text-4xl shadow-lg mr-2 animate-fade-in">🖼️</span>
            תיאור תמונה
            <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xl shadow bg-gradient-to-r from-green-400 to-green-600 text-white ml-4`}>
              <span className="text-2xl">{lang === 'he' ? '🟣' : '🔵'}</span> {difficulties.find(d=>d.key===difficulty)?.label}
            </span>
          </h1>
        </div>
        <div className="flex gap-2 justify-center mb-4">
          <button onClick={()=>{console.log('Clicked describe');switchMode('describe')}} className={`px-4 py-2 rounded-full font-bold shadow text-md ${mode==='describe'?'bg-blue-600 text-white':'bg-white text-blue-700 hover:bg-blue-100'}`}>תאר תמונה</button>
          <button onClick={()=>switchMode('draw')} className={`px-4 py-2 rounded-full font-bold shadow text-md ${mode==='draw'?'bg-green-600 text-white':'bg-white text-green-700 hover:bg-green-100'}`}>צייר את המילה</button>
        </div>
        {mode==='draw' && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="text-xl font-bold text-green-700 mb-2">צייר: <span className="text-2xl">{drawWord}</span></div>
            <canvas ref={canvasRef} width={350} height={350} className="border-2 border-gray-300 rounded-lg bg-white shadow-lg cursor-crosshair"
              onMouseDown={startDraw} onMouseUp={endDraw} onMouseMove={draw}
              onTouchStart={startDraw} onTouchEnd={endDraw} onTouchMove={draw}
              style={{touchAction:'none'}} />
            <div className="flex gap-2 mt-2">
              <button onClick={clearCanvas} className="bg-gray-200 px-4 py-2 rounded font-bold">נקה</button>
              <button onClick={saveDrawing} className="bg-blue-400 text-white px-4 py-2 rounded font-bold">שמור</button>
              <button onClick={downloadDrawing} className="bg-green-400 text-white px-4 py-2 rounded font-bold">הורד</button>
              <button onClick={shareDrawing} className="bg-yellow-400 text-white px-4 py-2 rounded font-bold">שתף</button>
            </div>
            <div className="mt-4">
              <button onClick={nextDrawingQuestion} className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-pink-500 hover:to-purple-400 transition-all duration-200 flex items-center gap-2">
                <span className="text-2xl">➡️</span> לשאלה הבאה
              </button>
            </div>
            {feedback && (
              <div className={`text-center mt-4 text-lg font-bold px-4 py-2 rounded-xl shadow-lg animate-fade-in ${feedback.includes('מעולה')?'bg-green-100 text-green-700 border-2 border-green-400':'bg-red-100 text-red-600 border-2 border-red-300'}`}>
                {feedback}
              </div>
            )}
            <div className="flex gap-2 mt-2 items-center">
              <label>צבע:</label>
              <input type="color" value={drawColor} onChange={e=>setDrawColor(e.target.value)} />
              <label>עובי:</label>
              <input type="range" min={2} max={16} value={drawWidth} onChange={e=>setDrawWidth(+e.target.value)} />
            </div>
            {drawings.length > 0 && (
              <div className="mt-4">
                <div className="font-bold text-blue-700 mb-2">הציורים האחרונים שלך:</div>
                <div className="flex gap-2 flex-wrap">
                  {drawings.map((url,i)=>(<img key={i} src={url} alt="ציור" className="w-24 h-24 rounded shadow" />))}
                </div>
              </div>
            )}
          </div>
        )}
        {mode==='describe' && (
          <>
            {!started && (
              <div className="flex flex-col gap-4 items-center mb-8 animate-fade-in-slow">
                <div className="flex gap-4 mb-4">
                  <button onClick={() => setLang('en')} className={`px-6 py-2 rounded-full font-bold shadow text-lg flex items-center gap-2 transition-all duration-200 ${lang==='en'?'bg-green-600 text-white scale-105':'bg-white text-green-700 hover:bg-green-100'}`}>🇬🇧 English</button>
                  <button onClick={() => setLang('he')} className={`px-6 py-2 rounded-full font-bold shadow text-lg flex items-center gap-2 transition-all duration-200 ${lang==='he'?'bg-pink-600 text-white scale-105':'bg-white text-pink-700 hover:bg-pink-100'}`}>🇮🇱 עברית</button>
                </div>
                <button onClick={startGame} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4 flex items-center gap-2"><span className="text-3xl">🚀</span> התחל</button>
              </div>
            )}
            {!started && customPics.length > 0 && (
              <div className="max-w-xl mx-auto bg-white bg-opacity-80 rounded-xl shadow p-4 mt-2 animate-fade-in-slow">
                <div className="font-bold text-blue-700 mb-2">תמונות אישיות:</div>
                <div className="flex flex-wrap gap-2">
                  {customPics.map(pic => (
                    <div key={pic.id} className="flex flex-col items-center gap-1 bg-blue-50 rounded px-3 py-2 relative">
                      <img src={pic.url} alt="custom" className="w-20 h-20 rounded object-cover border-2 border-blue-200" />
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.values(pic.keywords).flat().map((kw, i) => (
                          <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">{kw}</span>
                        ))}
                      </div>
                      <button onClick={() => deleteCustomPic(pic.id)} className="absolute top-1 right-1 text-red-500 font-bold text-lg bg-white bg-opacity-80 rounded-full px-2">✖️</button>
                      <button onClick={() => startEditPic(pic)} className="absolute top-1 left-1 text-blue-500 font-bold text-lg bg-white bg-opacity-80 rounded-full px-2">✏️</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!started && (
              <button onClick={() => setShowAddPic(true)} className="bg-gradient-to-r from-pink-400 to-blue-400 text-white px-8 py-2 rounded-full text-lg font-bold shadow hover:from-blue-400 hover:to-pink-400 transition-all duration-200 mt-2 flex items-center gap-2"><span className="text-2xl">➕</span> הוסף תמונה אישית</button>
            )}
            {showAddPic && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col gap-4">
                  <h2 className="text-xl font-bold text-blue-700 mb-2">הוספת תמונה אישית</h2>
                  <input type="file" accept="image/*" onChange={handlePicUpload} />
                  {newPic.image && <img src={newPic.image} alt="preview" className="w-32 h-32 rounded object-cover mx-auto" />}
                  <div className="flex gap-2">
                    <label className="font-bold">שפה:</label>
                    <select value={newPic.lang} onChange={e => setNewPic(p => ({...p, lang: e.target.value as 'en' | 'he'}))} className="border rounded px-2 py-1">
                      <option value="en">English</option>
                      <option value="he">עברית</option>
                    </select>
                  </div>
                  <input value={newPic.keywords} onChange={e => setNewPic(p => ({...p, keywords: e.target.value}))} placeholder="מילות מפתח (מופרדות בפסיק)" className="border rounded px-4 py-2" />
                  <button disabled={translating || !newPic.keywords.trim()} onClick={async () => {
                    await translateKeywords(newPic.keywords, newPic.lang, newPic.lang==='en'?'he':'en', (val) => setNewPic(p => ({...p, keywords: p.keywords + ', ' + val})));
                  }} className="bg-blue-400 text-white px-3 py-1 rounded font-bold text-sm flex items-center gap-1 mt-1">{translating ? 'מתרגם...' : 'תרגם מילות מפתח'}</button>
                  <div className="flex gap-2 mt-2">
                    <button onClick={addCustomPic} className="bg-green-500 text-white px-4 py-2 rounded font-bold">הוסף</button>
                    <button onClick={() => { setShowAddPic(false); setNewPic({ image: '', lang: lang, keywords: '', file: null }); }} className="bg-gray-300 px-4 py-2 rounded font-bold">ביטול</button>
                  </div>
                </div>
              </div>
            )}
            {editPic && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col gap-4">
                  <h2 className="text-xl font-bold text-blue-700 mb-2">עריכת תמונה אישית</h2>
                  <input type="file" accept="image/*" onChange={handleEditPicUpload} />
                  {editPicData.image && <img src={editPicData.image} alt="preview" className="w-32 h-32 rounded object-cover mx-auto" />}
                  <div className="flex gap-2">
                    <label className="font-bold">שפה:</label>
                    <select value={editPicData.lang} onChange={e => setEditPicData(p => ({...p, lang: e.target.value}))} className="border rounded px-2 py-1">
                      <option value="en">English</option>
                      <option value="he">עברית</option>
                    </select>
                  </div>
                  <input value={editPicData.keywords} onChange={e => setEditPicData(p => ({...p, keywords: e.target.value}))} placeholder="מילות מפתח (מופרדות בפסיק)" className="border rounded px-4 py-2" />
                  <button disabled={editTranslating || !editPicData.keywords.trim()} onClick={async () => {
                    await translateEditKeywords(editPicData.keywords, editPicData.lang, editPicData.lang==='en'?'he':'en', (val) => setEditPicData(p => ({...p, keywords: p.keywords + ', ' + val})));
                  }} className="bg-blue-400 text-white px-3 py-1 rounded font-bold text-sm flex items-center gap-1 mt-1">{editTranslating ? 'מתרגם...' : 'תרגם מילות מפתח'}</button>
                  <div className="flex gap-2 mt-2">
                    <button onClick={saveEditPic} className="bg-green-500 text-white px-4 py-2 rounded font-bold">שמור</button>
                    <button onClick={() => setEditPic(null)} className="bg-gray-300 px-4 py-2 rounded font-bold">ביטול</button>
                  </div>
                </div>
              </div>
            )}
            {started && !finished && pictures.length > 0 && (
              <>
                <div className="flex flex-wrap justify-between items-center mb-6 gap-2 animate-fade-in">
                  <div className="bg-white bg-opacity-90 rounded-xl px-6 py-2 text-lg font-bold text-yellow-700 shadow flex items-center gap-2"><span className="text-green-500 text-2xl">★</span> ניקוד: {score}</div>
                  <div className="bg-white bg-opacity-90 rounded-xl px-6 py-2 text-lg font-bold text-green-700 shadow flex items-center gap-2"><span className="text-blue-500 text-2xl">#️⃣</span> תמונה: {current+1}/{pictures.length}</div>
                  <div className="bg-white bg-opacity-90 rounded-xl px-6 py-2 text-lg font-bold text-pink-700 shadow flex items-center gap-2"><span className="text-pink-500 text-2xl">⏰</span> זמן: {timer} שניות</div>
                </div>
                <div className="w-full h-3 bg-blue-100 rounded-full mb-4 overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-700" style={{ width: `${progress}%` }} />
                  <div className="absolute inset-0 flex items-center justify-center text-blue-700 font-bold text-xs">{current+1}/{pictures.length}</div>
                </div>
                <div className="mb-6 flex flex-col items-center gap-4 animate-slide-in">
                  <div className="relative">
                    <img src={pictures[current].url} alt="pic" className="rounded-2xl shadow-xl max-h-72 w-auto border-4 border-blue-200 transition-all duration-700" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS4reWbveWKoOi9veWksei0pTwvdGV4dD48L3N2Zz4='; }} />
                    {getMistakeStats()[pictures[current].id] > 0 && (
                      <span className="absolute top-2 left-2 bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-bold text-xs shadow animate-pulse flex items-center gap-1"><span>💡</span> חיזוק אישי</span>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-4 mb-4">
                    <button
                      onClick={startRecording}
                      disabled={recording || checking}
                      className={`px-10 py-4 rounded-full font-bold text-2xl shadow transition-all duration-200 flex items-center gap-2
                        ${recording ? 'bg-yellow-400 text-white animate-pulse scale-105' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:scale-105'}`}
                    >
                      <span className="text-2xl">🎙️</span> {recording ? 'מקליט...' : 'תאר בקול' }
                    </button>
                    {userTranscript && (
                      <div className="text-center text-lg font-bold text-blue-700 bg-blue-50 rounded-xl px-4 py-2 shadow animate-fade-in">
                        <span className="inline-flex items-center gap-2"><span className="text-2xl">🗣️</span> התיאור שלך:</span> {userTranscript}
                        {similarity !== null && (
                          <span className="ml-2 text-purple-700">({Math.round(similarity*100)}% התאמה)
                            <span className={`ml-2 font-bold ${getMatchLevel(similarity).color}`}>{getMatchLevel(similarity).text}</span>
                          </span>
                        )}
                        {similarity !== null && (
                          <div className="mt-2 text-sm text-gray-700 bg-yellow-50 rounded-lg px-3 py-2 font-semibold animate-fade-in">
                            המטרה: לתאר את התמונה בקול תוך שימוש במילות המפתח (או מושגים קרובים). ככל שהתיאור שלך דומה יותר למילות המפתח, תקבל ציון התאמה גבוה.
                          </div>
                        )}
                      </div>
                    )}
                    {feedback && (
                      <div className={`text-center mb-2 text-2xl font-bold px-4 py-2 rounded-xl shadow-lg animate-fade-in ${feedback==='מעולה!'?'bg-green-100 text-green-700 border-2 border-green-400 animate-bounce':'bg-red-100 text-red-600 border-2 border-red-300 animate-shake'}`}>{feedback}
                        {feedback==='מעולה!' && <span className="ml-2 text-3xl">🎉</span>}
                        {feedback!=='מעולה!' && <span className="ml-2 text-3xl">😅</span>}
                      </div>
                    )}
                    {showTip && (
                      <div className="text-center text-md font-bold text-purple-700 bg-purple-50 rounded-xl px-4 py-2 shadow animate-fade-in flex items-center gap-2 justify-center">
                        <span className="text-2xl">💡</span> {tip}
                      </div>
                    )}
                    <div className="text-center text-md font-bold text-blue-700 bg-blue-50 rounded-xl px-4 py-2 shadow animate-fade-in flex flex-wrap gap-2 items-center justify-center">
                      <span className="text-gray-500">מילות מפתח:</span>
                      {pictures[current].keywords[lang].map((kw, i) => (
                        <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-bold mx-1">{kw}</span>
                      ))}
                    </div>
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <button
                        onClick={() => setShowHint(true)}
                        className="bg-purple-200 text-purple-800 px-6 py-2 rounded-full font-bold shadow hover:bg-purple-300 transition-all duration-200"
                        disabled={showHint}
                      >
                        <span className="text-2xl">💡</span> רמז
                      </button>
                      {showHint && (
                        <div className="mt-2 bg-purple-50 border-l-4 border-purple-400 rounded-xl px-4 py-2 text-md font-bold text-purple-700 shadow animate-fade-in">
                          רמז: {pictures[current].keywords[lang].slice(0, 2).join(', ')}
                        </div>
                      )}
                    </div>
                    {showNext && (
                      <button onClick={() => {
                        setFeedback(null);
                        setUserTranscript('');
                        setSimilarity(null);
                        setAudioBlob(null);
                        setAudioUrl(null);
                        setShowNext(false);
                        setShowTip(false);
                        setShowHint(false);
                        setShowAnswer(false);
                        if (current === pictures.length - 1) {
                          setFinished(true);
                          confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 } });
                        } else {
                          setCurrent((c) => c + 1);
                        }
                      }} className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 flex items-center gap-2 mt-2 animate-fade-in"><span className="text-2xl">➡️</span> לשאלה הבאה</button>
                    )}
                    {audioUrl && (
                      <div className="flex flex-col items-center gap-2 mt-2 animate-fade-in">
                        <audio src={audioUrl} controls className="w-full max-w-xs" />
                        <div className="flex gap-2">
                          <button onClick={() => { const a = new Audio(audioUrl); a.play(); }} className="bg-gradient-to-r from-yellow-400 to-blue-400 text-white px-6 py-2 rounded-full font-bold shadow hover:from-blue-400 hover:to-yellow-400 transition-all duration-200 flex items-center gap-2 text-lg">
                            <span className="text-2xl">🔁</span> האזן להקלטה שלי
                          </button>
                          {audioBlob && (
                            <button onClick={() => downloadBlob(audioBlob, 'picture-description.webm')} className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-4 py-2 rounded-full font-bold shadow flex items-center gap-2 text-md">
                              <span className="text-2xl">⬇️</span> הורד הקלטה
                            </button>
                          )}
                          {audioUrl && navigator.share && (
                            <button onClick={() => navigator.share({ title: 'הקלטת תיאור תמונה', url: audioUrl })} className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-4 py-2 rounded-full font-bold shadow flex items-center gap-2 text-md">
                              <span className="text-2xl">🔗</span> שתף הקלטה
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {savedRecordings.length > 0 && (
                      <div className="mt-4 animate-fade-in-slow">
                        <div className="font-bold text-blue-700 mb-2">הקלטות אחרונות:</div>
                        <div className="flex flex-wrap gap-2">
                          {savedRecordings.map((url, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <audio src={url} controls className="w-32" />
                              <div className="flex gap-1">
                                <button onClick={() => { const a = document.createElement('a'); a.href = url; a.download = `picture-description${i+1}.webm`; a.click(); }} className="bg-green-400 text-white px-2 py-1 rounded text-xs font-bold">⬇️ הורד</button>
                                {navigator.share && (
                                  <button onClick={() => navigator.share({ title: 'הקלטת תיאור תמונה', url })} className="bg-yellow-400 text-white px-2 py-1 rounded text-xs font-bold">🔗 שתף</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {showAnswer && (
                      <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow-lg animate-fade-in">
                        <div className="text-lg font-bold text-blue-700 mb-2">התשובה הנכונה:</div>
                        <div className="flex flex-wrap gap-2 items-center justify-center mb-3">
                          {pictures[current].keywords[lang].map((kw, i) => (
                            <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{kw}</span>
                          ))}
                        </div>
                        {pictures[current].explanationHe && (
                          <>
                            <div className="text-lg font-bold text-purple-700 mb-2">הסבר:</div>
                            <div className="text-purple-600 text-xl font-bold bg-purple-50 rounded-xl px-4 py-2 shadow animate-fade-in mb-2">{pictures[current].explanationHe}</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {finished && (
              <div className="text-center mt-6 animate-fade-in">
                <div className="text-2xl font-bold text-yellow-700 mb-4 flex items-center justify-center gap-2"><span className="text-green-500 text-3xl">🏆</span> כל הכבוד! סיימת את כל התמונות 🎉</div>
                <div className="text-lg font-bold text-green-700 mb-2 flex items-center justify-center gap-2"><span className="text-blue-500 text-2xl">★</span> ניקוד סופי: {score} | <span className="text-pink-500 text-2xl">⏰</span> זמן: {timer} שניות</div>
                <div className="text-md font-bold text-purple-700 mb-2 flex items-center justify-center gap-2">הישגים: {stats.correct} הצלחות, {stats.mistakes} טעויות, {stats.total} ניסיונות, {stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0}% הצלחה</div>
                <button onClick={restart} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4 flex items-center gap-2"><span className="text-2xl">🔄</span> שחק שוב</button>
              </div>
            )}
          </>
        )}
      </div>
      {!started && personalBest && (
        <div className="text-center text-md font-bold text-green-700 mb-2 animate-fade-in">שיא אישי: {personalBest.score} נק׳, {personalBest.accuracy}% הצלחה</div>
      )}
      <style>{`
        @keyframes fade-in { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fade-in-slow { from{opacity:0;} to{opacity:1;} }
        .animate-fade-in-slow { animation: fade-in-slow 1.5s; }
        @keyframes slide-in { from{opacity:0;transform:translateY(40px);} to{opacity:1;transform:translateY(0);} }
        .animate-slide-in { animation: slide-in 1.2s cubic-bezier(.4,0,.2,1) both; }
        @keyframes bounce { 0%,100%{transform:scale(1);} 50%{transform:scale(1.15);} }
        .animate-bounce { animation: bounce 0.7s; }
        @keyframes shake { 0%{transform:translateX(0);} 20%{transform:translateX(-8px);} 40%{transform:translateX(8px);} 60%{transform:translateX(-8px);} 80%{transform:translateX(8px);} 100%{transform:translateX(0);} }
        .animate-shake { animation: shake 0.4s; }
      `}</style>
    </main>
  );
} 