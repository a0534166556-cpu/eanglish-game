'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Question {
  id: number;
  text: string;
  options?: string[]; // אופציונלי - רק לשאלות multiple choice
  correct?: number | string; // יכול להיות אינדקס או תשובה טקסטואלית
  explanation: string;
  category: string;
  type?: 'multiple-choice' | 'dictation' | 'recording' | 'sentence-recording'; // סוג השאלה
  englishWord?: string; // המילה באנגלית (לאוצר מילים)
  hebrewWord?: string; // המילה בעברית (לאוצר מילים)
  sentence?: string; // המשפט לשאלות sentence-recording
  sentenceTranslation?: string; // תרגום המשפט לשאלות sentence-recording
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
    '1': [ // רמה 1 - מתחילים - אוצר מילים בסיסי
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1, text: "מה אומרת המילה \"cat\"?", options: ["חתול", "כלב", "ציפור", "דג"], correct: 0, explanation: "\"cat\" אומרת \"חתול\"", category: "vocabulary", type: "multiple-choice", englishWord: "cat", hebrewWord: "חתול" },
    { id: 2, text: "מה אומרת המילה \"dog\"?", options: ["חתול", "כלב", "ציפור", "דג"], correct: 1, explanation: "\"dog\" אומרת \"כלב\"", category: "vocabulary", type: "multiple-choice", englishWord: "dog", hebrewWord: "כלב" },
    { id: 3, text: "מה אומרת המילה \"bird\"?", options: ["חתול", "כלב", "ציפור", "דג"], correct: 2, explanation: "\"bird\" אומרת \"ציפור\"", category: "vocabulary", type: "multiple-choice", englishWord: "bird", hebrewWord: "ציפור" },
    { id: 4, text: "מה אומרת המילה \"fish\"?", options: ["חתול", "כלב", "ציפור", "דג"], correct: 3, explanation: "\"fish\" אומרת \"דג\"", category: "vocabulary", type: "multiple-choice", englishWord: "fish", hebrewWord: "דג" },
    { id: 5, text: "מה אומרת המילה \"apple\"?", options: ["תפוח", "בננה", "תפוז", "ענבים"], correct: 0, explanation: "\"apple\" אומרת \"תפוח\"", category: "vocabulary", type: "multiple-choice", englishWord: "apple", hebrewWord: "תפוח" },
    { id: 6, text: "מה אומרת המילה \"banana\"?", options: ["תפוח", "בננה", "תפוז", "ענבים"], correct: 1, explanation: "\"banana\" אומרת \"בננה\"", category: "vocabulary", type: "multiple-choice", englishWord: "banana", hebrewWord: "בננה" },
    { id: 7, text: "מה אומרת המילה \"red\"?", options: ["אדום", "כחול", "ירוק", "צהוב"], correct: 0, explanation: "\"red\" אומרת \"אדום\"", category: "vocabulary", type: "multiple-choice", englishWord: "red", hebrewWord: "אדום" },
    { id: 8, text: "מה אומרת המילה \"blue\"?", options: ["אדום", "כחול", "ירוק", "צהוב"], correct: 1, explanation: "\"blue\" אומרת \"כחול\"", category: "vocabulary", type: "multiple-choice", englishWord: "blue", hebrewWord: "כחול" },
    { id: 9, text: "מה אומרת המילה \"green\"?", options: ["אדום", "כחול", "ירוק", "צהוב"], correct: 2, explanation: "\"green\" אומרת \"ירוק\"", category: "vocabulary", type: "multiple-choice", englishWord: "green", hebrewWord: "ירוק" },
    { id: 10, text: "מה אומרת המילה \"yellow\"?", options: ["אדום", "כחול", "ירוק", "צהוב"], correct: 3, explanation: "\"yellow\" אומרת \"צהוב\"", category: "vocabulary", type: "multiple-choice", englishWord: "yellow", hebrewWord: "צהוב" },
    { id: 11, text: "מה אומרת המילה \"one\"?", options: ["אחד", "שניים", "שלושה", "ארבעה"], correct: 0, explanation: "\"one\" אומרת \"אחד\"", category: "vocabulary", type: "multiple-choice", englishWord: "one", hebrewWord: "אחד" },
    { id: 12, text: "מה אומרת המילה \"two\"?", options: ["אחד", "שניים", "שלושה", "ארבעה"], correct: 1, explanation: "\"two\" אומרת \"שניים\"", category: "vocabulary", type: "multiple-choice", englishWord: "two", hebrewWord: "שניים" },
    { id: 13, text: "מה אומרת המילה \"three\"?", options: ["אחד", "שניים", "שלושה", "ארבעה"], correct: 2, explanation: "\"three\" אומרת \"שלושה\"", category: "vocabulary", type: "multiple-choice", englishWord: "three", hebrewWord: "שלושה" },
    { id: 14, text: "מה אומרת המילה \"book\"?", options: ["ספר", "עט", "שולחן", "כסא"], correct: 0, explanation: "\"book\" אומרת \"ספר\"", category: "vocabulary", type: "multiple-choice", englishWord: "book", hebrewWord: "ספר" },
    { id: 15, text: "מה אומרת המילה \"pen\"?", options: ["ספר", "עט", "שולחן", "כסא"], correct: 1, explanation: "\"pen\" אומרת \"עט\"", category: "vocabulary", type: "multiple-choice", englishWord: "pen", hebrewWord: "עט" },
    { id: 16, text: "מה אומרת המילה \"table\"?", options: ["ספר", "עט", "שולחן", "כסא"], correct: 2, explanation: "\"table\" אומרת \"שולחן\"", category: "vocabulary", type: "multiple-choice", englishWord: "table", hebrewWord: "שולחן" },
    { id: 17, text: "מה אומרת המילה \"chair\"?", options: ["ספר", "עט", "שולחן", "כסא"], correct: 3, explanation: "\"chair\" אומרת \"כסא\"", category: "vocabulary", type: "multiple-choice", englishWord: "chair", hebrewWord: "כסא" },
    { id: 18, text: "מה אומרת המילה \"house\"?", options: ["בית", "חדר", "חלון", "דלת"], correct: 0, explanation: "\"house\" אומרת \"בית\"", category: "vocabulary", type: "multiple-choice", englishWord: "house", hebrewWord: "בית" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 19, text: "הכתיב את המילה \"חתול\" באנגלית:", correct: "cat", explanation: "\"חתול\" באנגלית זה \"cat\"", category: "vocabulary", type: "dictation", englishWord: "cat", hebrewWord: "חתול" },
    { id: 20, text: "הכתיב את המילה \"כלב\" באנגלית:", correct: "dog", explanation: "\"כלב\" באנגלית זה \"dog\"", category: "vocabulary", type: "dictation", englishWord: "dog", hebrewWord: "כלב" },
    { id: 21, text: "הכתיב את המילה \"ציפור\" באנגלית:", correct: "bird", explanation: "\"ציפור\" באנגלית זה \"bird\"", category: "vocabulary", type: "dictation", englishWord: "bird", hebrewWord: "ציפור" },
    { id: 22, text: "הכתיב את המילה \"דג\" באנגלית:", correct: "fish", explanation: "\"דג\" באנגלית זה \"fish\"", category: "vocabulary", type: "dictation", englishWord: "fish", hebrewWord: "דג" },
    { id: 23, text: "הכתיב את המילה \"תפוח\" באנגלית:", correct: "apple", explanation: "\"תפוח\" באנגלית זה \"apple\"", category: "vocabulary", type: "dictation", englishWord: "apple", hebrewWord: "תפוח" },
    { id: 24, text: "הכתיב את המילה \"בננה\" באנגלית:", correct: "banana", explanation: "\"בננה\" באנגלית זה \"banana\"", category: "vocabulary", type: "dictation", englishWord: "banana", hebrewWord: "בננה" },
    { id: 25, text: "הכתיב את המילה \"אדום\" באנגלית:", correct: "red", explanation: "\"אדום\" באנגלית זה \"red\"", category: "vocabulary", type: "dictation", englishWord: "red", hebrewWord: "אדום" },
    { id: 26, text: "הכתיב את המילה \"כחול\" באנגלית:", correct: "blue", explanation: "\"כחול\" באנגלית זה \"blue\"", category: "vocabulary", type: "dictation", englishWord: "blue", hebrewWord: "כחול" },
    { id: 27, text: "הכתיב את המילה \"ירוק\" באנגלית:", correct: "green", explanation: "\"ירוק\" באנגלית זה \"green\"", category: "vocabulary", type: "dictation", englishWord: "green", hebrewWord: "ירוק" },
    { id: 28, text: "הכתיב את המילה \"צהוב\" באנגלית:", correct: "yellow", explanation: "\"צהוב\" באנגלית זה \"yellow\"", category: "vocabulary", type: "dictation", englishWord: "yellow", hebrewWord: "צהוב" },
    { id: 29, text: "הכתיב את המילה \"אחד\" באנגלית:", correct: "one", explanation: "\"אחד\" באנגלית זה \"one\"", category: "vocabulary", type: "dictation", englishWord: "one", hebrewWord: "אחד" },
    { id: 30, text: "הכתיב את המילה \"שניים\" באנגלית:", correct: "two", explanation: "\"שניים\" באנגלית זה \"two\"", category: "vocabulary", type: "dictation", englishWord: "two", hebrewWord: "שניים" },
    { id: 31, text: "הכתיב את המילה \"שלושה\" באנגלית:", correct: "three", explanation: "\"שלושה\" באנגלית זה \"three\"", category: "vocabulary", type: "dictation", englishWord: "three", hebrewWord: "שלושה" },
    { id: 32, text: "הכתיב את המילה \"ספר\" באנגלית:", correct: "book", explanation: "\"ספר\" באנגלית זה \"book\"", category: "vocabulary", type: "dictation", englishWord: "book", hebrewWord: "ספר" },
    { id: 33, text: "הכתיב את המילה \"עט\" באנגלית:", correct: "pen", explanation: "\"עט\" באנגלית זה \"pen\"", category: "vocabulary", type: "dictation", englishWord: "pen", hebrewWord: "עט" },
    { id: 34, text: "הכתיב את המילה \"שולחן\" באנגלית:", correct: "table", explanation: "\"שולחן\" באנגלית זה \"table\"", category: "vocabulary", type: "dictation", englishWord: "table", hebrewWord: "שולחן" },
    { id: 35, text: "הכתיב את המילה \"כסא\" באנגלית:", correct: "chair", explanation: "\"כסא\" באנגלית זה \"chair\"", category: "vocabulary", type: "dictation", englishWord: "chair", hebrewWord: "כסא" },
    { id: 36, text: "הכתיב את המילה \"בית\" באנגלית:", correct: "house", explanation: "\"בית\" באנגלית זה \"house\"", category: "vocabulary", type: "dictation", englishWord: "house", hebrewWord: "בית" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 37, text: "הקליט את עצמך אומר את המילה \"חתול\" באנגלית:", correct: "cat", explanation: "\"חתול\" באנגלית זה \"cat\"", category: "vocabulary", type: "recording", englishWord: "cat", hebrewWord: "חתול" },
    { id: 38, text: "הקליט את עצמך אומר את המילה \"כלב\" באנגלית:", correct: "dog", explanation: "\"כלב\" באנגלית זה \"dog\"", category: "vocabulary", type: "recording", englishWord: "dog", hebrewWord: "כלב" },
    { id: 39, text: "הקליט את עצמך אומר את המילה \"ציפור\" באנגלית:", correct: "bird", explanation: "\"ציפור\" באנגלית זה \"bird\"", category: "vocabulary", type: "recording", englishWord: "bird", hebrewWord: "ציפור" },
    { id: 40, text: "הקליט את עצמך אומר את המילה \"דג\" באנגלית:", correct: "fish", explanation: "\"דג\" באנגלית זה \"fish\"", category: "vocabulary", type: "recording", englishWord: "fish", hebrewWord: "דג" },
    { id: 41, text: "הקליט את עצמך אומר את המילה \"תפוח\" באנגלית:", correct: "apple", explanation: "\"תפוח\" באנגלית זה \"apple\"", category: "vocabulary", type: "recording", englishWord: "apple", hebrewWord: "תפוח" },
    { id: 42, text: "הקליט את עצמך אומר את המילה \"בננה\" באנגלית:", correct: "banana", explanation: "\"בננה\" באנגלית זה \"banana\"", category: "vocabulary", type: "recording", englishWord: "banana", hebrewWord: "בננה" },
    { id: 43, text: "הקליט את עצמך אומר את המילה \"אדום\" באנגלית:", correct: "red", explanation: "\"אדום\" באנגלית זה \"red\"", category: "vocabulary", type: "recording", englishWord: "red", hebrewWord: "אדום" },
    { id: 44, text: "הקליט את עצמך אומר את המילה \"כחול\" באנגלית:", correct: "blue", explanation: "\"כחול\" באנגלית זה \"blue\"", category: "vocabulary", type: "recording", englishWord: "blue", hebrewWord: "כחול" },
    { id: 45, text: "הקליט את עצמך אומר את המילה \"ירוק\" באנגלית:", correct: "green", explanation: "\"ירוק\" באנגלית זה \"green\"", category: "vocabulary", type: "recording", englishWord: "green", hebrewWord: "ירוק" },
    { id: 46, text: "הקליט את עצמך אומר את המילה \"צהוב\" באנגלית:", correct: "yellow", explanation: "\"צהוב\" באנגלית זה \"yellow\"", category: "vocabulary", type: "recording", englishWord: "yellow", hebrewWord: "צהוב" },
    { id: 47, text: "הקליט את עצמך אומר את המילה \"אחד\" באנגלית:", correct: "one", explanation: "\"אחד\" באנגלית זה \"one\"", category: "vocabulary", type: "recording", englishWord: "one", hebrewWord: "אחד" },
    { id: 48, text: "הקליט את עצמך אומר את המילה \"שניים\" באנגלית:", correct: "two", explanation: "\"שניים\" באנגלית זה \"two\"", category: "vocabulary", type: "recording", englishWord: "two", hebrewWord: "שניים" },
    { id: 49, text: "הקליט את עצמך אומר את המילה \"שלושה\" באנגלית:", correct: "three", explanation: "\"שלושה\" באנגלית זה \"three\"", category: "vocabulary", type: "recording", englishWord: "three", hebrewWord: "שלושה" },
    { id: 50, text: "הקליט את עצמך אומר את המילה \"ספר\" באנגלית:", correct: "book", explanation: "\"ספר\" באנגלית זה \"book\"", category: "vocabulary", type: "recording", englishWord: "book", hebrewWord: "ספר" },
    { id: 51, text: "הקליט את עצמך אומר את המילה \"עט\" באנגלית:", correct: "pen", explanation: "\"עט\" באנגלית זה \"pen\"", category: "vocabulary", type: "recording", englishWord: "pen", hebrewWord: "עט" },
    { id: 52, text: "הקליט את עצמך אומר את המילה \"שולחן\" באנגלית:", correct: "table", explanation: "\"שולחן\" באנגלית זה \"table\"", category: "vocabulary", type: "recording", englishWord: "table", hebrewWord: "שולחן" },
    { id: 53, text: "הקליט את עצמך אומר את המילה \"כסא\" באנגלית:", correct: "chair", explanation: "\"כסא\" באנגלית זה \"chair\"", category: "vocabulary", type: "recording", englishWord: "chair", hebrewWord: "כסא" },
    { id: 54, text: "הקליט את עצמך אומר את המילה \"בית\" באנגלית:", correct: "house", explanation: "\"בית\" באנגלית זה \"house\"", category: "vocabulary", type: "recording", englishWord: "house", hebrewWord: "בית" }
    ],
    '2': [ // רמה 2 - בסיסי - אוצר מילים מתקדם יותר
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 55, text: "מה אומרת המילה \"water\"?", options: ["מים", "חלב", "לחם", "ביצה"], correct: 0, explanation: "\"water\" אומרת \"מים\"", category: "vocabulary", type: "multiple-choice", englishWord: "water", hebrewWord: "מים" },
    { id: 56, text: "מה אומרת המילה \"milk\"?", options: ["מים", "חלב", "לחם", "ביצה"], correct: 1, explanation: "\"milk\" אומרת \"חלב\"", category: "vocabulary", type: "multiple-choice", englishWord: "milk", hebrewWord: "חלב" },
    { id: 57, text: "מה אומרת המילה \"bread\"?", options: ["מים", "חלב", "לחם", "ביצה"], correct: 2, explanation: "\"bread\" אומרת \"לחם\"", category: "vocabulary", type: "multiple-choice", englishWord: "bread", hebrewWord: "לחם" },
    { id: 58, text: "מה אומרת המילה \"egg\"?", options: ["מים", "חלב", "לחם", "ביצה"], correct: 3, explanation: "\"egg\" אומרת \"ביצה\"", category: "vocabulary", type: "multiple-choice", englishWord: "egg", hebrewWord: "ביצה" },
    { id: 59, text: "מה אומרת המילה \"sun\"?", options: ["שמש", "ירח", "כוכב", "עץ"], correct: 0, explanation: "\"sun\" אומרת \"שמש\"", category: "vocabulary", type: "multiple-choice", englishWord: "sun", hebrewWord: "שמש" },
    { id: 60, text: "מה אומרת המילה \"moon\"?", options: ["שמש", "ירח", "כוכב", "עץ"], correct: 1, explanation: "\"moon\" אומרת \"ירח\"", category: "vocabulary", type: "multiple-choice", englishWord: "moon", hebrewWord: "ירח" },
    { id: 61, text: "מה אומרת המילה \"star\"?", options: ["שמש", "ירח", "כוכב", "עץ"], correct: 2, explanation: "\"star\" אומרת \"כוכב\"", category: "vocabulary", type: "multiple-choice", englishWord: "star", hebrewWord: "כוכב" },
    { id: 62, text: "מה אומרת המילה \"tree\"?", options: ["שמש", "ירח", "כוכב", "עץ"], correct: 3, explanation: "\"tree\" אומרת \"עץ\"", category: "vocabulary", type: "multiple-choice", englishWord: "tree", hebrewWord: "עץ" },
    { id: 63, text: "מה אומרת המילה \"flower\"?", options: ["פרח", "עץ", "דשא", "עלה"], correct: 0, explanation: "\"flower\" אומרת \"פרח\"", category: "vocabulary", type: "multiple-choice", englishWord: "flower", hebrewWord: "פרח" },
    { id: 64, text: "מה אומרת המילה \"car\"?", options: ["מכונית", "אוטובוס", "רכבת", "מטוס"], correct: 0, explanation: "\"car\" אומרת \"מכונית\"", category: "vocabulary", type: "multiple-choice", englishWord: "car", hebrewWord: "מכונית" },
    { id: 65, text: "מה אומרת המילה \"bus\"?", options: ["מכונית", "אוטובוס", "רכבת", "מטוס"], correct: 1, explanation: "\"bus\" אומרת \"אוטובוס\"", category: "vocabulary", type: "multiple-choice", englishWord: "bus", hebrewWord: "אוטובוס" },
    { id: 66, text: "מה אומרת המילה \"train\"?", options: ["מכונית", "אוטובוס", "רכבת", "מטוס"], correct: 2, explanation: "\"train\" אומרת \"רכבת\"", category: "vocabulary", type: "multiple-choice", englishWord: "train", hebrewWord: "רכבת" },
    { id: 67, text: "מה אומרת המילה \"school\"?", options: ["בית ספר", "מורה", "תלמיד", "חבר"], correct: 0, explanation: "\"school\" אומרת \"בית ספר\"", category: "vocabulary", type: "multiple-choice", englishWord: "school", hebrewWord: "בית ספר" },
    { id: 68, text: "מה אומרת המילה \"teacher\"?", options: ["בית ספר", "מורה", "תלמיד", "חבר"], correct: 1, explanation: "\"teacher\" אומרת \"מורה\"", category: "vocabulary", type: "multiple-choice", englishWord: "teacher", hebrewWord: "מורה" },
    { id: 69, text: "מה אומרת המילה \"student\"?", options: ["בית ספר", "מורה", "תלמיד", "חבר"], correct: 2, explanation: "\"student\" אומרת \"תלמיד\"", category: "vocabulary", type: "multiple-choice", englishWord: "student", hebrewWord: "תלמיד" },
    { id: 70, text: "מה אומרת המילה \"friend\"?", options: ["בית ספר", "מורה", "תלמיד", "חבר"], correct: 3, explanation: "\"friend\" אומרת \"חבר\"", category: "vocabulary", type: "multiple-choice", englishWord: "friend", hebrewWord: "חבר" },
    { id: 71, text: "מה אומרת המילה \"mother\"?", options: ["אמא", "אבא", "אחות", "אח"], correct: 0, explanation: "\"mother\" אומרת \"אמא\"", category: "vocabulary", type: "multiple-choice", englishWord: "mother", hebrewWord: "אמא" },
    { id: 72, text: "מה אומרת המילה \"father\"?", options: ["אמא", "אבא", "אחות", "אח"], correct: 1, explanation: "\"father\" אומרת \"אבא\"", category: "vocabulary", type: "multiple-choice", englishWord: "father", hebrewWord: "אבא" },
    { id: 73, text: "מה אומרת המילה \"sister\"?", options: ["אמא", "אבא", "אחות", "אח"], correct: 2, explanation: "\"sister\" אומרת \"אחות\"", category: "vocabulary", type: "multiple-choice", englishWord: "sister", hebrewWord: "אחות" },
    { id: 74, text: "מה אומרת המילה \"brother\"?", options: ["אמא", "אבא", "אחות", "אח"], correct: 3, explanation: "\"brother\" אומרת \"אח\"", category: "vocabulary", type: "multiple-choice", englishWord: "brother", hebrewWord: "אח" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 75, text: "הכתיב את המילה \"מים\" באנגלית:", correct: "water", explanation: "\"מים\" באנגלית זה \"water\"", category: "vocabulary", type: "dictation", englishWord: "water", hebrewWord: "מים" },
    { id: 76, text: "הכתיב את המילה \"חלב\" באנגלית:", correct: "milk", explanation: "\"חלב\" באנגלית זה \"milk\"", category: "vocabulary", type: "dictation", englishWord: "milk", hebrewWord: "חלב" },
    { id: 77, text: "הכתיב את המילה \"לחם\" באנגלית:", correct: "bread", explanation: "\"לחם\" באנגלית זה \"bread\"", category: "vocabulary", type: "dictation", englishWord: "bread", hebrewWord: "לחם" },
    { id: 78, text: "הכתיב את המילה \"ביצה\" באנגלית:", correct: "egg", explanation: "\"ביצה\" באנגלית זה \"egg\"", category: "vocabulary", type: "dictation", englishWord: "egg", hebrewWord: "ביצה" },
    { id: 79, text: "הכתיב את המילה \"שמש\" באנגלית:", correct: "sun", explanation: "\"שמש\" באנגלית זה \"sun\"", category: "vocabulary", type: "dictation", englishWord: "sun", hebrewWord: "שמש" },
    { id: 80, text: "הכתיב את המילה \"ירח\" באנגלית:", correct: "moon", explanation: "\"ירח\" באנגלית זה \"moon\"", category: "vocabulary", type: "dictation", englishWord: "moon", hebrewWord: "ירח" },
    { id: 81, text: "הכתיב את המילה \"כוכב\" באנגלית:", correct: "star", explanation: "\"כוכב\" באנגלית זה \"star\"", category: "vocabulary", type: "dictation", englishWord: "star", hebrewWord: "כוכב" },
    { id: 82, text: "הכתיב את המילה \"עץ\" באנגלית:", correct: "tree", explanation: "\"עץ\" באנגלית זה \"tree\"", category: "vocabulary", type: "dictation", englishWord: "tree", hebrewWord: "עץ" },
    { id: 83, text: "הכתיב את המילה \"פרח\" באנגלית:", correct: "flower", explanation: "\"פרח\" באנגלית זה \"flower\"", category: "vocabulary", type: "dictation", englishWord: "flower", hebrewWord: "פרח" },
    { id: 84, text: "הכתיב את המילה \"מכונית\" באנגלית:", correct: "car", explanation: "\"מכונית\" באנגלית זה \"car\"", category: "vocabulary", type: "dictation", englishWord: "car", hebrewWord: "מכונית" },
    { id: 85, text: "הכתיב את המילה \"אוטובוס\" באנגלית:", correct: "bus", explanation: "\"אוטובוס\" באנגלית זה \"bus\"", category: "vocabulary", type: "dictation", englishWord: "bus", hebrewWord: "אוטובוס" },
    { id: 86, text: "הכתיב את המילה \"רכבת\" באנגלית:", correct: "train", explanation: "\"רכבת\" באנגלית זה \"train\"", category: "vocabulary", type: "dictation", englishWord: "train", hebrewWord: "רכבת" },
    { id: 87, text: "הכתיב את המילה \"בית ספר\" באנגלית:", correct: "school", explanation: "\"בית ספר\" באנגלית זה \"school\"", category: "vocabulary", type: "dictation", englishWord: "school", hebrewWord: "בית ספר" },
    { id: 88, text: "הכתיב את המילה \"מורה\" באנגלית:", correct: "teacher", explanation: "\"מורה\" באנגלית זה \"teacher\"", category: "vocabulary", type: "dictation", englishWord: "teacher", hebrewWord: "מורה" },
    { id: 89, text: "הכתיב את המילה \"תלמיד\" באנגלית:", correct: "student", explanation: "\"תלמיד\" באנגלית זה \"student\"", category: "vocabulary", type: "dictation", englishWord: "student", hebrewWord: "תלמיד" },
    { id: 90, text: "הכתיב את המילה \"חבר\" באנגלית:", correct: "friend", explanation: "\"חבר\" באנגלית זה \"friend\"", category: "vocabulary", type: "dictation", englishWord: "friend", hebrewWord: "חבר" },
    { id: 91, text: "הכתיב את המילה \"אמא\" באנגלית:", correct: "mother", explanation: "\"אמא\" באנגלית זה \"mother\"", category: "vocabulary", type: "dictation", englishWord: "mother", hebrewWord: "אמא" },
    { id: 92, text: "הכתיב את המילה \"אבא\" באנגלית:", correct: "father", explanation: "\"אבא\" באנגלית זה \"father\"", category: "vocabulary", type: "dictation", englishWord: "father", hebrewWord: "אבא" },
    { id: 93, text: "הכתיב את המילה \"אחות\" באנגלית:", correct: "sister", explanation: "\"אחות\" באנגלית זה \"sister\"", category: "vocabulary", type: "dictation", englishWord: "sister", hebrewWord: "אחות" },
    { id: 94, text: "הכתיב את המילה \"אח\" באנגלית:", correct: "brother", explanation: "\"אח\" באנגלית זה \"brother\"", category: "vocabulary", type: "dictation", englishWord: "brother", hebrewWord: "אח" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 95, text: "הקליט את עצמך אומר את המילה \"מים\" באנגלית:", correct: "water", explanation: "\"מים\" באנגלית זה \"water\"", category: "vocabulary", type: "recording", englishWord: "water", hebrewWord: "מים" },
    { id: 96, text: "הקליט את עצמך אומר את המילה \"חלב\" באנגלית:", correct: "milk", explanation: "\"חלב\" באנגלית זה \"milk\"", category: "vocabulary", type: "recording", englishWord: "milk", hebrewWord: "חלב" },
    { id: 97, text: "הקליט את עצמך אומר את המילה \"לחם\" באנגלית:", correct: "bread", explanation: "\"לחם\" באנגלית זה \"bread\"", category: "vocabulary", type: "recording", englishWord: "bread", hebrewWord: "לחם" },
    { id: 98, text: "הקליט את עצמך אומר את המילה \"ביצה\" באנגלית:", correct: "egg", explanation: "\"ביצה\" באנגלית זה \"egg\"", category: "vocabulary", type: "recording", englishWord: "egg", hebrewWord: "ביצה" },
    { id: 99, text: "הקליט את עצמך אומר את המילה \"שמש\" באנגלית:", correct: "sun", explanation: "\"שמש\" באנגלית זה \"sun\"", category: "vocabulary", type: "recording", englishWord: "sun", hebrewWord: "שמש" },
    { id: 100, text: "הקליט את עצמך אומר את המילה \"ירח\" באנגלית:", correct: "moon", explanation: "\"ירח\" באנגלית זה \"moon\"", category: "vocabulary", type: "recording", englishWord: "moon", hebrewWord: "ירח" },
    { id: 101, text: "הקליט את עצמך אומר את המילה \"כוכב\" באנגלית:", correct: "star", explanation: "\"כוכב\" באנגלית זה \"star\"", category: "vocabulary", type: "recording", englishWord: "star", hebrewWord: "כוכב" },
    { id: 102, text: "הקליט את עצמך אומר את המילה \"עץ\" באנגלית:", correct: "tree", explanation: "\"עץ\" באנגלית זה \"tree\"", category: "vocabulary", type: "recording", englishWord: "tree", hebrewWord: "עץ" },
    { id: 103, text: "הקליט את עצמך אומר את המילה \"פרח\" באנגלית:", correct: "flower", explanation: "\"פרח\" באנגלית זה \"flower\"", category: "vocabulary", type: "recording", englishWord: "flower", hebrewWord: "פרח" },
    { id: 104, text: "הקליט את עצמך אומר את המילה \"מכונית\" באנגלית:", correct: "car", explanation: "\"מכונית\" באנגלית זה \"car\"", category: "vocabulary", type: "recording", englishWord: "car", hebrewWord: "מכונית" },
    { id: 105, text: "הקליט את עצמך אומר את המילה \"אוטובוס\" באנגלית:", correct: "bus", explanation: "\"אוטובוס\" באנגלית זה \"bus\"", category: "vocabulary", type: "recording", englishWord: "bus", hebrewWord: "אוטובוס" },
    { id: 106, text: "הקליט את עצמך אומר את המילה \"רכבת\" באנגלית:", correct: "train", explanation: "\"רכבת\" באנגלית זה \"train\"", category: "vocabulary", type: "recording", englishWord: "train", hebrewWord: "רכבת" },
    { id: 107, text: "הקליט את עצמך אומר את המילה \"בית ספר\" באנגלית:", correct: "school", explanation: "\"בית ספר\" באנגלית זה \"school\"", category: "vocabulary", type: "recording", englishWord: "school", hebrewWord: "בית ספר" },
    { id: 108, text: "הקליט את עצמך אומר את המילה \"מורה\" באנגלית:", correct: "teacher", explanation: "\"מורה\" באנגלית זה \"teacher\"", category: "vocabulary", type: "recording", englishWord: "teacher", hebrewWord: "מורה" },
    { id: 109, text: "הקליט את עצמך אומר את המילה \"תלמיד\" באנגלית:", correct: "student", explanation: "\"תלמיד\" באנגלית זה \"student\"", category: "vocabulary", type: "recording", englishWord: "student", hebrewWord: "תלמיד" },
    { id: 110, text: "הקליט את עצמך אומר את המילה \"חבר\" באנגלית:", correct: "friend", explanation: "\"חבר\" באנגלית זה \"friend\"", category: "vocabulary", type: "recording", englishWord: "friend", hebrewWord: "חבר" },
    { id: 111, text: "הקליט את עצמך אומר את המילה \"אמא\" באנגלית:", correct: "mother", explanation: "\"אמא\" באנגלית זה \"mother\"", category: "vocabulary", type: "recording", englishWord: "mother", hebrewWord: "אמא" },
    { id: 112, text: "הקליט את עצמך אומר את המילה \"אבא\" באנגלית:", correct: "father", explanation: "\"אבא\" באנגלית זה \"father\"", category: "vocabulary", type: "recording", englishWord: "father", hebrewWord: "אבא" },
    { id: 113, text: "הקליט את עצמך אומר את המילה \"אחות\" באנגלית:", correct: "sister", explanation: "\"אחות\" באנגלית זה \"sister\"", category: "vocabulary", type: "recording", englishWord: "sister", hebrewWord: "אחות" },
    { id: 114, text: "הקליט את עצמך אומר את המילה \"אח\" באנגלית:", correct: "brother", explanation: "\"אח\" באנגלית זה \"brother\"", category: "vocabulary", type: "recording", englishWord: "brother", hebrewWord: "אח" }
    ],
    '3': [ // רמה 3 - בינוני - אוצר מילים בינוני
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 115, text: "מה אומרת המילה \"happy\"?", options: ["שמח", "עצוב", "גדול", "קטן"], correct: 0, explanation: "\"happy\" אומרת \"שמח\"", category: "vocabulary", type: "multiple-choice", englishWord: "happy", hebrewWord: "שמח" },
    { id: 116, text: "מה אומרת המילה \"sad\"?", options: ["שמח", "עצוב", "גדול", "קטן"], correct: 1, explanation: "\"sad\" אומרת \"עצוב\"", category: "vocabulary", type: "multiple-choice", englishWord: "sad", hebrewWord: "עצוב" },
    { id: 117, text: "מה אומרת המילה \"big\"?", options: ["שמח", "עצוב", "גדול", "קטן"], correct: 2, explanation: "\"big\" אומרת \"גדול\"", category: "vocabulary", type: "multiple-choice", englishWord: "big", hebrewWord: "גדול" },
    { id: 118, text: "מה אומרת המילה \"small\"?", options: ["שמח", "עצוב", "גדול", "קטן"], correct: 3, explanation: "\"small\" אומרת \"קטן\"", category: "vocabulary", type: "multiple-choice", englishWord: "small", hebrewWord: "קטן" },
    { id: 119, text: "מה אומרת המילה \"hot\"?", options: ["חם", "קר", "טוב", "רע"], correct: 0, explanation: "\"hot\" אומרת \"חם\"", category: "vocabulary", type: "multiple-choice", englishWord: "hot", hebrewWord: "חם" },
    { id: 120, text: "מה אומרת המילה \"cold\"?", options: ["חם", "קר", "טוב", "רע"], correct: 1, explanation: "\"cold\" אומרת \"קר\"", category: "vocabulary", type: "multiple-choice", englishWord: "cold", hebrewWord: "קר" },
    { id: 121, text: "מה אומרת המילה \"good\"?", options: ["חם", "קר", "טוב", "רע"], correct: 2, explanation: "\"good\" אומרת \"טוב\"", category: "vocabulary", type: "multiple-choice", englishWord: "good", hebrewWord: "טוב" },
    { id: 122, text: "מה אומרת המילה \"bad\"?", options: ["חם", "קר", "טוב", "רע"], correct: 3, explanation: "\"bad\" אומרת \"רע\"", category: "vocabulary", type: "multiple-choice", englishWord: "bad", hebrewWord: "רע" },
    { id: 123, text: "מה אומרת המילה \"new\"?", options: ["חדש", "זקן", "יום", "לילה"], correct: 0, explanation: "\"new\" אומרת \"חדש\"", category: "vocabulary", type: "multiple-choice", englishWord: "new", hebrewWord: "חדש" },
    { id: 124, text: "מה אומרת המילה \"old\"?", options: ["חדש", "זקן", "יום", "לילה"], correct: 1, explanation: "\"old\" אומרת \"זקן\"", category: "vocabulary", type: "multiple-choice", englishWord: "old", hebrewWord: "זקן" },
    { id: 125, text: "מה אומרת המילה \"day\"?", options: ["חדש", "זקן", "יום", "לילה"], correct: 2, explanation: "\"day\" אומרת \"יום\"", category: "vocabulary", type: "multiple-choice", englishWord: "day", hebrewWord: "יום" },
    { id: 126, text: "מה אומרת המילה \"night\"?", options: ["חדש", "זקן", "יום", "לילה"], correct: 3, explanation: "\"night\" אומרת \"לילה\"", category: "vocabulary", type: "multiple-choice", englishWord: "night", hebrewWord: "לילה" },
    { id: 127, text: "מה אומרת המילה \"morning\"?", options: ["בוקר", "ערב", "זמן", "שעה"], correct: 0, explanation: "\"morning\" אומרת \"בוקר\"", category: "vocabulary", type: "multiple-choice", englishWord: "morning", hebrewWord: "בוקר" },
    { id: 128, text: "מה אומרת המילה \"evening\"?", options: ["בוקר", "ערב", "זמן", "שעה"], correct: 1, explanation: "\"evening\" אומרת \"ערב\"", category: "vocabulary", type: "multiple-choice", englishWord: "evening", hebrewWord: "ערב" },
    { id: 129, text: "מה אומרת המילה \"time\"?", options: ["בוקר", "ערב", "זמן", "שעה"], correct: 2, explanation: "\"time\" אומרת \"זמן\"", category: "vocabulary", type: "multiple-choice", englishWord: "time", hebrewWord: "זמן" },
    { id: 130, text: "מה אומרת המילה \"hour\"?", options: ["בוקר", "ערב", "זמן", "שעה"], correct: 3, explanation: "\"hour\" אומרת \"שעה\"", category: "vocabulary", type: "multiple-choice", englishWord: "hour", hebrewWord: "שעה" },
    { id: 131, text: "מה אומרת המילה \"minute\"?", options: ["דקה", "שבוע", "חודש", "שנה"], correct: 0, explanation: "\"minute\" אומרת \"דקה\"", category: "vocabulary", type: "multiple-choice", englishWord: "minute", hebrewWord: "דקה" },
    { id: 132, text: "מה אומרת המילה \"week\"?", options: ["דקה", "שבוע", "חודש", "שנה"], correct: 1, explanation: "\"week\" אומרת \"שבוע\"", category: "vocabulary", type: "multiple-choice", englishWord: "week", hebrewWord: "שבוע" },
    { id: 133, text: "מה אומרת המילה \"month\"?", options: ["דקה", "שבוע", "חודש", "שנה"], correct: 2, explanation: "\"month\" אומרת \"חודש\"", category: "vocabulary", type: "multiple-choice", englishWord: "month", hebrewWord: "חודש" },
    { id: 134, text: "מה אומרת המילה \"year\"?", options: ["דקה", "שבוע", "חודש", "שנה"], correct: 3, explanation: "\"year\" אומרת \"שנה\"", category: "vocabulary", type: "multiple-choice", englishWord: "year", hebrewWord: "שנה" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 135, text: "הכתיב את המילה \"שמח\" באנגלית:", correct: "happy", explanation: "\"שמח\" באנגלית זה \"happy\"", category: "vocabulary", type: "dictation", englishWord: "happy", hebrewWord: "שמח" },
    { id: 136, text: "הכתיב את המילה \"עצוב\" באנגלית:", correct: "sad", explanation: "\"עצוב\" באנגלית זה \"sad\"", category: "vocabulary", type: "dictation", englishWord: "sad", hebrewWord: "עצוב" },
    { id: 137, text: "הכתיב את המילה \"גדול\" באנגלית:", correct: "big", explanation: "\"גדול\" באנגלית זה \"big\"", category: "vocabulary", type: "dictation", englishWord: "big", hebrewWord: "גדול" },
    { id: 138, text: "הכתיב את המילה \"קטן\" באנגלית:", correct: "small", explanation: "\"קטן\" באנגלית זה \"small\"", category: "vocabulary", type: "dictation", englishWord: "small", hebrewWord: "קטן" },
    { id: 139, text: "הכתיב את המילה \"חם\" באנגלית:", correct: "hot", explanation: "\"חם\" באנגלית זה \"hot\"", category: "vocabulary", type: "dictation", englishWord: "hot", hebrewWord: "חם" },
    { id: 140, text: "הכתיב את המילה \"קר\" באנגלית:", correct: "cold", explanation: "\"קר\" באנגלית זה \"cold\"", category: "vocabulary", type: "dictation", englishWord: "cold", hebrewWord: "קר" },
    { id: 141, text: "הכתיב את המילה \"טוב\" באנגלית:", correct: "good", explanation: "\"טוב\" באנגלית זה \"good\"", category: "vocabulary", type: "dictation", englishWord: "good", hebrewWord: "טוב" },
    { id: 142, text: "הכתיב את המילה \"רע\" באנגלית:", correct: "bad", explanation: "\"רע\" באנגלית זה \"bad\"", category: "vocabulary", type: "dictation", englishWord: "bad", hebrewWord: "רע" },
    { id: 143, text: "הכתיב את המילה \"חדש\" באנגלית:", correct: "new", explanation: "\"חדש\" באנגלית זה \"new\"", category: "vocabulary", type: "dictation", englishWord: "new", hebrewWord: "חדש" },
    { id: 144, text: "הכתיב את המילה \"זקן\" באנגלית:", correct: "old", explanation: "\"זקן\" באנגלית זה \"old\"", category: "vocabulary", type: "dictation", englishWord: "old", hebrewWord: "זקן" },
    { id: 145, text: "הכתיב את המילה \"יום\" באנגלית:", correct: "day", explanation: "\"יום\" באנגלית זה \"day\"", category: "vocabulary", type: "dictation", englishWord: "day", hebrewWord: "יום" },
    { id: 146, text: "הכתיב את המילה \"לילה\" באנגלית:", correct: "night", explanation: "\"לילה\" באנגלית זה \"night\"", category: "vocabulary", type: "dictation", englishWord: "night", hebrewWord: "לילה" },
    { id: 147, text: "הכתיב את המילה \"בוקר\" באנגלית:", correct: "morning", explanation: "\"בוקר\" באנגלית זה \"morning\"", category: "vocabulary", type: "dictation", englishWord: "morning", hebrewWord: "בוקר" },
    { id: 148, text: "הכתיב את המילה \"ערב\" באנגלית:", correct: "evening", explanation: "\"ערב\" באנגלית זה \"evening\"", category: "vocabulary", type: "dictation", englishWord: "evening", hebrewWord: "ערב" },
    { id: 149, text: "הכתיב את המילה \"זמן\" באנגלית:", correct: "time", explanation: "\"זמן\" באנגלית זה \"time\"", category: "vocabulary", type: "dictation", englishWord: "time", hebrewWord: "זמן" },
    { id: 150, text: "הכתיב את המילה \"שעה\" באנגלית:", correct: "hour", explanation: "\"שעה\" באנגלית זה \"hour\"", category: "vocabulary", type: "dictation", englishWord: "hour", hebrewWord: "שעה" },
    { id: 151, text: "הכתיב את המילה \"דקה\" באנגלית:", correct: "minute", explanation: "\"דקה\" באנגלית זה \"minute\"", category: "vocabulary", type: "dictation", englishWord: "minute", hebrewWord: "דקה" },
    { id: 152, text: "הכתיב את המילה \"שבוע\" באנגלית:", correct: "week", explanation: "\"שבוע\" באנגלית זה \"week\"", category: "vocabulary", type: "dictation", englishWord: "week", hebrewWord: "שבוע" },
    { id: 153, text: "הכתיב את המילה \"חודש\" באנגלית:", correct: "month", explanation: "\"חודש\" באנגלית זה \"month\"", category: "vocabulary", type: "dictation", englishWord: "month", hebrewWord: "חודש" },
    { id: 154, text: "הכתיב את המילה \"שנה\" באנגלית:", correct: "year", explanation: "\"שנה\" באנגלית זה \"year\"", category: "vocabulary", type: "dictation", englishWord: "year", hebrewWord: "שנה" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 155, text: "הקליט את עצמך אומר את המילה \"שמח\" באנגלית:", correct: "happy", explanation: "\"שמח\" באנגלית זה \"happy\"", category: "vocabulary", type: "recording", englishWord: "happy", hebrewWord: "שמח" },
    { id: 156, text: "הקליט את עצמך אומר את המילה \"עצוב\" באנגלית:", correct: "sad", explanation: "\"עצוב\" באנגלית זה \"sad\"", category: "vocabulary", type: "recording", englishWord: "sad", hebrewWord: "עצוב" },
    { id: 157, text: "הקליט את עצמך אומר את המילה \"גדול\" באנגלית:", correct: "big", explanation: "\"גדול\" באנגלית זה \"big\"", category: "vocabulary", type: "recording", englishWord: "big", hebrewWord: "גדול" },
    { id: 158, text: "הקליט את עצמך אומר את המילה \"קטן\" באנגלית:", correct: "small", explanation: "\"קטן\" באנגלית זה \"small\"", category: "vocabulary", type: "recording", englishWord: "small", hebrewWord: "קטן" },
    { id: 159, text: "הקליט את עצמך אומר את המילה \"חם\" באנגלית:", correct: "hot", explanation: "\"חם\" באנגלית זה \"hot\"", category: "vocabulary", type: "recording", englishWord: "hot", hebrewWord: "חם" },
    { id: 160, text: "הקליט את עצמך אומר את המילה \"קר\" באנגלית:", correct: "cold", explanation: "\"קר\" באנגלית זה \"cold\"", category: "vocabulary", type: "recording", englishWord: "cold", hebrewWord: "קר" },
    { id: 161, text: "הקליט את עצמך אומר את המילה \"טוב\" באנגלית:", correct: "good", explanation: "\"טוב\" באנגלית זה \"good\"", category: "vocabulary", type: "recording", englishWord: "good", hebrewWord: "טוב" },
    { id: 162, text: "הקליט את עצמך אומר את המילה \"רע\" באנגלית:", correct: "bad", explanation: "\"רע\" באנגלית זה \"bad\"", category: "vocabulary", type: "recording", englishWord: "bad", hebrewWord: "רע" },
    { id: 163, text: "הקליט את עצמך אומר את המילה \"חדש\" באנגלית:", correct: "new", explanation: "\"חדש\" באנגלית זה \"new\"", category: "vocabulary", type: "recording", englishWord: "new", hebrewWord: "חדש" },
    { id: 164, text: "הקליט את עצמך אומר את המילה \"זקן\" באנגלית:", correct: "old", explanation: "\"זקן\" באנגלית זה \"old\"", category: "vocabulary", type: "recording", englishWord: "old", hebrewWord: "זקן" },
    { id: 165, text: "הקליט את עצמך אומר את המילה \"יום\" באנגלית:", correct: "day", explanation: "\"יום\" באנגלית זה \"day\"", category: "vocabulary", type: "recording", englishWord: "day", hebrewWord: "יום" },
    { id: 166, text: "הקליט את עצמך אומר את המילה \"לילה\" באנגלית:", correct: "night", explanation: "\"לילה\" באנגלית זה \"night\"", category: "vocabulary", type: "recording", englishWord: "night", hebrewWord: "לילה" },
    { id: 167, text: "הקליט את עצמך אומר את המילה \"בוקר\" באנגלית:", correct: "morning", explanation: "\"בוקר\" באנגלית זה \"morning\"", category: "vocabulary", type: "recording", englishWord: "morning", hebrewWord: "בוקר" },
    { id: 168, text: "הקליט את עצמך אומר את המילה \"ערב\" באנגלית:", correct: "evening", explanation: "\"ערב\" באנגלית זה \"evening\"", category: "vocabulary", type: "recording", englishWord: "evening", hebrewWord: "ערב" },
    { id: 169, text: "הקליט את עצמך אומר את המילה \"זמן\" באנגלית:", correct: "time", explanation: "\"זמן\" באנגלית זה \"time\"", category: "vocabulary", type: "recording", englishWord: "time", hebrewWord: "זמן" },
    { id: 170, text: "הקליט את עצמך אומר את המילה \"שעה\" באנגלית:", correct: "hour", explanation: "\"שעה\" באנגלית זה \"hour\"", category: "vocabulary", type: "recording", englishWord: "hour", hebrewWord: "שעה" },
    { id: 171, text: "הקליט את עצמך אומר את המילה \"דקה\" באנגלית:", correct: "minute", explanation: "\"דקה\" באנגלית זה \"minute\"", category: "vocabulary", type: "recording", englishWord: "minute", hebrewWord: "דקה" },
    { id: 172, text: "הקליט את עצמך אומר את המילה \"שבוע\" באנגלית:", correct: "week", explanation: "\"שבוע\" באנגלית זה \"week\"", category: "vocabulary", type: "recording", englishWord: "week", hebrewWord: "שבוע" },
    { id: 173, text: "הקליט את עצמך אומר את המילה \"חודש\" באנגלית:", correct: "month", explanation: "\"חודש\" באנגלית זה \"month\"", category: "vocabulary", type: "recording", englishWord: "month", hebrewWord: "חודש" },
    { id: 174, text: "הקליט את עצמך אומר את המילה \"שנה\" באנגלית:", correct: "year", explanation: "\"שנה\" באנגלית זה \"year\"", category: "vocabulary", type: "recording", englishWord: "year", hebrewWord: "שנה" }
    ],
    '4': [ // רמה 4 - מתקדם - אוצר מילים מתקדם
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 175, text: "מה אומרת המילה \"run\"?", options: ["רץ", "הולך", "קופץ", "משחק"], correct: 0, explanation: "\"run\" אומרת \"רץ\"", category: "vocabulary", type: "multiple-choice", englishWord: "run", hebrewWord: "רץ" },
    { id: 176, text: "מה אומרת המילה \"walk\"?", options: ["רץ", "הולך", "קופץ", "משחק"], correct: 1, explanation: "\"walk\" אומרת \"הולך\"", category: "vocabulary", type: "multiple-choice", englishWord: "walk", hebrewWord: "הולך" },
    { id: 177, text: "מה אומרת המילה \"jump\"?", options: ["רץ", "הולך", "קופץ", "משחק"], correct: 2, explanation: "\"jump\" אומרת \"קופץ\"", category: "vocabulary", type: "multiple-choice", englishWord: "jump", hebrewWord: "קופץ" },
    { id: 178, text: "מה אומרת המילה \"play\"?", options: ["רץ", "הולך", "קופץ", "משחק"], correct: 3, explanation: "\"play\" אומרת \"משחק\"", category: "vocabulary", type: "multiple-choice", englishWord: "play", hebrewWord: "משחק" },
    { id: 179, text: "מה אומרת המילה \"read\"?", options: ["קורא", "כותב", "אוכל", "שותה"], correct: 0, explanation: "\"read\" אומרת \"קורא\"", category: "vocabulary", type: "multiple-choice", englishWord: "read", hebrewWord: "קורא" },
    { id: 180, text: "מה אומרת המילה \"write\"?", options: ["קורא", "כותב", "אוכל", "שותה"], correct: 1, explanation: "\"write\" אומרת \"כותב\"", category: "vocabulary", type: "multiple-choice", englishWord: "write", hebrewWord: "כותב" },
    { id: 181, text: "מה אומרת המילה \"eat\"?", options: ["קורא", "כותב", "אוכל", "שותה"], correct: 2, explanation: "\"eat\" אומרת \"אוכל\"", category: "vocabulary", type: "multiple-choice", englishWord: "eat", hebrewWord: "אוכל" },
    { id: 182, text: "מה אומרת המילה \"drink\"?", options: ["קורא", "כותב", "אוכל", "שותה"], correct: 3, explanation: "\"drink\" אומרת \"שותה\"", category: "vocabulary", type: "multiple-choice", englishWord: "drink", hebrewWord: "שותה" },
    { id: 183, text: "מה אומרת המילה \"sleep\"?", options: ["ישן", "רואה", "שומע", "מדבר"], correct: 0, explanation: "\"sleep\" אומרת \"ישן\"", category: "vocabulary", type: "multiple-choice", englishWord: "sleep", hebrewWord: "ישן" },
    { id: 184, text: "מה אומרת המילה \"see\"?", options: ["ישן", "רואה", "שומע", "מדבר"], correct: 1, explanation: "\"see\" אומרת \"רואה\"", category: "vocabulary", type: "multiple-choice", englishWord: "see", hebrewWord: "רואה" },
    { id: 185, text: "מה אומרת המילה \"hear\"?", options: ["ישן", "רואה", "שומע", "מדבר"], correct: 2, explanation: "\"hear\" אומרת \"שומע\"", category: "vocabulary", type: "multiple-choice", englishWord: "hear", hebrewWord: "שומע" },
    { id: 186, text: "מה אומרת המילה \"speak\"?", options: ["ישן", "רואה", "שומע", "מדבר"], correct: 3, explanation: "\"speak\" אומרת \"מדבר\"", category: "vocabulary", type: "multiple-choice", englishWord: "speak", hebrewWord: "מדבר" },
    { id: 187, text: "מה אומרת המילה \"talk\"?", options: ["מדבר", "חושב", "יודע", "לומד"], correct: 0, explanation: "\"talk\" אומרת \"מדבר\"", category: "vocabulary", type: "multiple-choice", englishWord: "talk", hebrewWord: "מדבר" },
    { id: 188, text: "מה אומרת המילה \"think\"?", options: ["מדבר", "חושב", "יודע", "לומד"], correct: 1, explanation: "\"think\" אומרת \"חושב\"", category: "vocabulary", type: "multiple-choice", englishWord: "think", hebrewWord: "חושב" },
    { id: 189, text: "מה אומרת המילה \"know\"?", options: ["מדבר", "חושב", "יודע", "לומד"], correct: 2, explanation: "\"know\" אומרת \"יודע\"", category: "vocabulary", type: "multiple-choice", englishWord: "know", hebrewWord: "יודע" },
    { id: 190, text: "מה אומרת המילה \"learn\"?", options: ["מדבר", "חושב", "יודע", "לומד"], correct: 3, explanation: "\"learn\" אומרת \"לומד\"", category: "vocabulary", type: "multiple-choice", englishWord: "learn", hebrewWord: "לומד" },
    { id: 191, text: "מה אומרת המילה \"teach\"?", options: ["מלמד", "עובד", "עוזר", "רואה"], correct: 0, explanation: "\"teach\" אומרת \"מלמד\"", category: "vocabulary", type: "multiple-choice", englishWord: "teach", hebrewWord: "מלמד" },
    { id: 192, text: "מה אומרת המילה \"work\"?", options: ["מלמד", "עובד", "עוזר", "רואה"], correct: 1, explanation: "\"work\" אומרת \"עובד\"", category: "vocabulary", type: "multiple-choice", englishWord: "work", hebrewWord: "עובד" },
    { id: 193, text: "מה אומרת המילה \"help\"?", options: ["מלמד", "עובד", "עוזר", "רואה"], correct: 2, explanation: "\"help\" אומרת \"עוזר\"", category: "vocabulary", type: "multiple-choice", englishWord: "help", hebrewWord: "עוזר" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 194, text: "הכתיב את המילה \"רץ\" באנגלית:", correct: "run", explanation: "\"רץ\" באנגלית זה \"run\"", category: "vocabulary", type: "dictation", englishWord: "run", hebrewWord: "רץ" },
    { id: 195, text: "הכתיב את המילה \"הולך\" באנגלית:", correct: "walk", explanation: "\"הולך\" באנגלית זה \"walk\"", category: "vocabulary", type: "dictation", englishWord: "walk", hebrewWord: "הולך" },
    { id: 196, text: "הכתיב את המילה \"קופץ\" באנגלית:", correct: "jump", explanation: "\"קופץ\" באנגלית זה \"jump\"", category: "vocabulary", type: "dictation", englishWord: "jump", hebrewWord: "קופץ" },
    { id: 197, text: "הכתיב את המילה \"משחק\" באנגלית:", correct: "play", explanation: "\"משחק\" באנגלית זה \"play\"", category: "vocabulary", type: "dictation", englishWord: "play", hebrewWord: "משחק" },
    { id: 198, text: "הכתיב את המילה \"קורא\" באנגלית:", correct: "read", explanation: "\"קורא\" באנגלית זה \"read\"", category: "vocabulary", type: "dictation", englishWord: "read", hebrewWord: "קורא" },
    { id: 199, text: "הכתיב את המילה \"כותב\" באנגלית:", correct: "write", explanation: "\"כותב\" באנגלית זה \"write\"", category: "vocabulary", type: "dictation", englishWord: "write", hebrewWord: "כותב" },
    { id: 200, text: "הכתיב את המילה \"אוכל\" באנגלית:", correct: "eat", explanation: "\"אוכל\" באנגלית זה \"eat\"", category: "vocabulary", type: "dictation", englishWord: "eat", hebrewWord: "אוכל" },
    { id: 201, text: "הכתיב את המילה \"שותה\" באנגלית:", correct: "drink", explanation: "\"שותה\" באנגלית זה \"drink\"", category: "vocabulary", type: "dictation", englishWord: "drink", hebrewWord: "שותה" },
    { id: 202, text: "הכתיב את המילה \"ישן\" באנגלית:", correct: "sleep", explanation: "\"ישן\" באנגלית זה \"sleep\"", category: "vocabulary", type: "dictation", englishWord: "sleep", hebrewWord: "ישן" },
    { id: 203, text: "הכתיב את המילה \"רואה\" באנגלית:", correct: "see", explanation: "\"רואה\" באנגלית זה \"see\"", category: "vocabulary", type: "dictation", englishWord: "see", hebrewWord: "רואה" },
    { id: 204, text: "הכתיב את המילה \"שומע\" באנגלית:", correct: "hear", explanation: "\"שומע\" באנגלית זה \"hear\"", category: "vocabulary", type: "dictation", englishWord: "hear", hebrewWord: "שומע" },
    { id: 205, text: "הכתיב את המילה \"מדבר\" באנגלית:", correct: "speak", explanation: "\"מדבר\" באנגלית זה \"speak\"", category: "vocabulary", type: "dictation", englishWord: "speak", hebrewWord: "מדבר" },
    { id: 206, text: "הכתיב את המילה \"חושב\" באנגלית:", correct: "think", explanation: "\"חושב\" באנגלית זה \"think\"", category: "vocabulary", type: "dictation", englishWord: "think", hebrewWord: "חושב" },
    { id: 207, text: "הכתיב את המילה \"יודע\" באנגלית:", correct: "know", explanation: "\"יודע\" באנגלית זה \"know\"", category: "vocabulary", type: "dictation", englishWord: "know", hebrewWord: "יודע" },
    { id: 208, text: "הכתיב את המילה \"לומד\" באנגלית:", correct: "learn", explanation: "\"לומד\" באנגלית זה \"learn\"", category: "vocabulary", type: "dictation", englishWord: "learn", hebrewWord: "לומד" },
    { id: 209, text: "הכתיב את המילה \"מלמד\" באנגלית:", correct: "teach", explanation: "\"מלמד\" באנגלית זה \"teach\"", category: "vocabulary", type: "dictation", englishWord: "teach", hebrewWord: "מלמד" },
    { id: 210, text: "הכתיב את המילה \"עובד\" באנגלית:", correct: "work", explanation: "\"עובד\" באנגלית זה \"work\"", category: "vocabulary", type: "dictation", englishWord: "work", hebrewWord: "עובד" },
    { id: 211, text: "הכתיב את המילה \"עוזר\" באנגלית:", correct: "help", explanation: "\"עוזר\" באנגלית זה \"help\"", category: "vocabulary", type: "dictation", englishWord: "help", hebrewWord: "עוזר" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 212, text: "הקליט את עצמך אומר את המילה \"רץ\" באנגלית:", correct: "run", explanation: "\"רץ\" באנגלית זה \"run\"", category: "vocabulary", type: "recording", englishWord: "run", hebrewWord: "רץ" },
    { id: 213, text: "הקליט את עצמך אומר את המילה \"הולך\" באנגלית:", correct: "walk", explanation: "\"הולך\" באנגלית זה \"walk\"", category: "vocabulary", type: "recording", englishWord: "walk", hebrewWord: "הולך" },
    { id: 214, text: "הקליט את עצמך אומר את המילה \"קופץ\" באנגלית:", correct: "jump", explanation: "\"קופץ\" באנגלית זה \"jump\"", category: "vocabulary", type: "recording", englishWord: "jump", hebrewWord: "קופץ" },
    { id: 215, text: "הקליט את עצמך אומר את המילה \"משחק\" באנגלית:", correct: "play", explanation: "\"משחק\" באנגלית זה \"play\"", category: "vocabulary", type: "recording", englishWord: "play", hebrewWord: "משחק" },
    { id: 216, text: "הקליט את עצמך אומר את המילה \"קורא\" באנגלית:", correct: "read", explanation: "\"קורא\" באנגלית זה \"read\"", category: "vocabulary", type: "recording", englishWord: "read", hebrewWord: "קורא" },
    { id: 217, text: "הקליט את עצמך אומר את המילה \"כותב\" באנגלית:", correct: "write", explanation: "\"כותב\" באנגלית זה \"write\"", category: "vocabulary", type: "recording", englishWord: "write", hebrewWord: "כותב" },
    { id: 218, text: "הקליט את עצמך אומר את המילה \"אוכל\" באנגלית:", correct: "eat", explanation: "\"אוכל\" באנגלית זה \"eat\"", category: "vocabulary", type: "recording", englishWord: "eat", hebrewWord: "אוכל" },
    { id: 219, text: "הקליט את עצמך אומר את המילה \"שותה\" באנגלית:", correct: "drink", explanation: "\"שותה\" באנגלית זה \"drink\"", category: "vocabulary", type: "recording", englishWord: "drink", hebrewWord: "שותה" },
    { id: 220, text: "הקליט את עצמך אומר את המילה \"ישן\" באנגלית:", correct: "sleep", explanation: "\"ישן\" באנגלית זה \"sleep\"", category: "vocabulary", type: "recording", englishWord: "sleep", hebrewWord: "ישן" },
    { id: 221, text: "הקליט את עצמך אומר את המילה \"רואה\" באנגלית:", correct: "see", explanation: "\"רואה\" באנגלית זה \"see\"", category: "vocabulary", type: "recording", englishWord: "see", hebrewWord: "רואה" },
    { id: 222, text: "הקליט את עצמך אומר את המילה \"שומע\" באנגלית:", correct: "hear", explanation: "\"שומע\" באנגלית זה \"hear\"", category: "vocabulary", type: "recording", englishWord: "hear", hebrewWord: "שומע" },
    { id: 223, text: "הקליט את עצמך אומר את המילה \"מדבר\" באנגלית:", correct: "speak", explanation: "\"מדבר\" באנגלית זה \"speak\"", category: "vocabulary", type: "recording", englishWord: "speak", hebrewWord: "מדבר" },
    { id: 224, text: "הקליט את עצמך אומר את המילה \"חושב\" באנגלית:", correct: "think", explanation: "\"חושב\" באנגלית זה \"think\"", category: "vocabulary", type: "recording", englishWord: "think", hebrewWord: "חושב" },
    { id: 225, text: "הקליט את עצמך אומר את המילה \"יודע\" באנגלית:", correct: "know", explanation: "\"יודע\" באנגלית זה \"know\"", category: "vocabulary", type: "recording", englishWord: "know", hebrewWord: "יודע" },
    { id: 226, text: "הקליט את עצמך אומר את המילה \"לומד\" באנגלית:", correct: "learn", explanation: "\"לומד\" באנגלית זה \"learn\"", category: "vocabulary", type: "recording", englishWord: "learn", hebrewWord: "לומד" },
    { id: 227, text: "הקליט את עצמך אומר את המילה \"מלמד\" באנגלית:", correct: "teach", explanation: "\"מלמד\" באנגלית זה \"teach\"", category: "vocabulary", type: "recording", englishWord: "teach", hebrewWord: "מלמד" },
    { id: 228, text: "הקליט את עצמך אומר את המילה \"עובד\" באנגלית:", correct: "work", explanation: "\"עובד\" באנגלית זה \"work\"", category: "vocabulary", type: "recording", englishWord: "work", hebrewWord: "עובד" },
    { id: 229, text: "הקליט את עצמך אומר את המילה \"עוזר\" באנגלית:", correct: "help", explanation: "\"עוזר\" באנגלית זה \"help\"", category: "vocabulary", type: "recording", englishWord: "help", hebrewWord: "עוזר" }
    ],
    '5': [ // רמה 5 - מומחה - אוצר מילים מומחה
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 230, text: "מה אומרת המילה \"beautiful\"?", options: ["יפה", "נפלא", "מדהים", "מצוין"], correct: 0, explanation: "\"beautiful\" אומרת \"יפה\"", category: "vocabulary", type: "multiple-choice", englishWord: "beautiful", hebrewWord: "יפה" },
    { id: 231, text: "מה אומרת המילה \"wonderful\"?", options: ["יפה", "נפלא", "מדהים", "מצוין"], correct: 1, explanation: "\"wonderful\" אומרת \"נפלא\"", category: "vocabulary", type: "multiple-choice", englishWord: "wonderful", hebrewWord: "נפלא" },
    { id: 232, text: "מה אומרת המילה \"amazing\"?", options: ["יפה", "נפלא", "מדהים", "מצוין"], correct: 2, explanation: "\"amazing\" אומרת \"מדהים\"", category: "vocabulary", type: "multiple-choice", englishWord: "amazing", hebrewWord: "מדהים" },
    { id: 233, text: "מה אומרת המילה \"excellent\"?", options: ["יפה", "נפלא", "מדהים", "מצוין"], correct: 3, explanation: "\"excellent\" אומרת \"מצוין\"", category: "vocabulary", type: "multiple-choice", englishWord: "excellent", hebrewWord: "מצוין" },
    { id: 234, text: "מה אומרת המילה \"perfect\"?", options: ["מושלם", "חשוב", "מעניין", "קשה"], correct: 0, explanation: "\"perfect\" אומרת \"מושלם\"", category: "vocabulary", type: "multiple-choice", englishWord: "perfect", hebrewWord: "מושלם" },
    { id: 235, text: "מה אומרת המילה \"important\"?", options: ["מושלם", "חשוב", "מעניין", "קשה"], correct: 1, explanation: "\"important\" אומרת \"חשוב\"", category: "vocabulary", type: "multiple-choice", englishWord: "important", hebrewWord: "חשוב" },
    { id: 236, text: "מה אומרת המילה \"interesting\"?", options: ["מושלם", "חשוב", "מעניין", "קשה"], correct: 2, explanation: "\"interesting\" אומרת \"מעניין\"", category: "vocabulary", type: "multiple-choice", englishWord: "interesting", hebrewWord: "מעניין" },
    { id: 237, text: "מה אומרת המילה \"difficult\"?", options: ["מושלם", "חשוב", "מעניין", "קשה"], correct: 3, explanation: "\"difficult\" אומרת \"קשה\"", category: "vocabulary", type: "multiple-choice", englishWord: "difficult", hebrewWord: "קשה" },
    { id: 238, text: "מה אומרת המילה \"easy\"?", options: ["קל", "מהיר", "איטי", "גבוה"], correct: 0, explanation: "\"easy\" אומרת \"קל\"", category: "vocabulary", type: "multiple-choice", englishWord: "easy", hebrewWord: "קל" },
    { id: 239, text: "מה אומרת המילה \"fast\"?", options: ["קל", "מהיר", "איטי", "גבוה"], correct: 1, explanation: "\"fast\" אומרת \"מהיר\"", category: "vocabulary", type: "multiple-choice", englishWord: "fast", hebrewWord: "מהיר" },
    { id: 240, text: "מה אומרת המילה \"slow\"?", options: ["קל", "מהיר", "איטי", "גבוה"], correct: 2, explanation: "\"slow\" אומרת \"איטי\"", category: "vocabulary", type: "multiple-choice", englishWord: "slow", hebrewWord: "איטי" },
    { id: 241, text: "מה אומרת המילה \"high\"?", options: ["קל", "מהיר", "איטי", "גבוה"], correct: 3, explanation: "\"high\" אומרת \"גבוה\"", category: "vocabulary", type: "multiple-choice", englishWord: "high", hebrewWord: "גבוה" },
    { id: 242, text: "מה אומרת המילה \"low\"?", options: ["נמוך", "ארוך", "קצר", "רחב"], correct: 0, explanation: "\"low\" אומרת \"נמוך\"", category: "vocabulary", type: "multiple-choice", englishWord: "low", hebrewWord: "נמוך" },
    { id: 243, text: "מה אומרת המילה \"long\"?", options: ["נמוך", "ארוך", "קצר", "רחב"], correct: 1, explanation: "\"long\" אומרת \"ארוך\"", category: "vocabulary", type: "multiple-choice", englishWord: "long", hebrewWord: "ארוך" },
    { id: 244, text: "מה אומרת המילה \"short\"?", options: ["נמוך", "ארוך", "קצר", "רחב"], correct: 2, explanation: "\"short\" אומרת \"קצר\"", category: "vocabulary", type: "multiple-choice", englishWord: "short", hebrewWord: "קצר" },
    { id: 245, text: "מה אומרת המילה \"wide\"?", options: ["נמוך", "ארוך", "קצר", "רחב"], correct: 3, explanation: "\"wide\" אומרת \"רחב\"", category: "vocabulary", type: "multiple-choice", englishWord: "wide", hebrewWord: "רחב" },
    { id: 246, text: "מה אומרת המילה \"narrow\"?", options: ["צר", "עבה", "דק", "כבד"], correct: 0, explanation: "\"narrow\" אומרת \"צר\"", category: "vocabulary", type: "multiple-choice", englishWord: "narrow", hebrewWord: "צר" },
    { id: 247, text: "מה אומרת המילה \"thick\"?", options: ["צר", "עבה", "דק", "כבד"], correct: 1, explanation: "\"thick\" אומרת \"עבה\"", category: "vocabulary", type: "multiple-choice", englishWord: "thick", hebrewWord: "עבה" },
    { id: 248, text: "מה אומרת המילה \"thin\"?", options: ["צר", "עבה", "דק", "כבד"], correct: 2, explanation: "\"thin\" אומרת \"דק\"", category: "vocabulary", type: "multiple-choice", englishWord: "thin", hebrewWord: "דק" },
    { id: 249, text: "מה אומרת המילה \"heavy\"?", options: ["צר", "עבה", "דק", "כבד"], correct: 3, explanation: "\"heavy\" אומרת \"כבד\"", category: "vocabulary", type: "multiple-choice", englishWord: "heavy", hebrewWord: "כבד" },
    { id: 250, text: "מה אומרת המילה \"light\"?", options: ["אור", "כבד", "צר", "עבה"], correct: 0, explanation: "\"light\" אומרת \"אור\"", category: "vocabulary", type: "multiple-choice", englishWord: "light", hebrewWord: "אור" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 251, text: "הכתיב את המילה \"יפה\" באנגלית:", correct: "beautiful", explanation: "\"יפה\" באנגלית זה \"beautiful\"", category: "vocabulary", type: "dictation", englishWord: "beautiful", hebrewWord: "יפה" },
    { id: 252, text: "הכתיב את המילה \"נפלא\" באנגלית:", correct: "wonderful", explanation: "\"נפלא\" באנגלית זה \"wonderful\"", category: "vocabulary", type: "dictation", englishWord: "wonderful", hebrewWord: "נפלא" },
    { id: 253, text: "הכתיב את המילה \"מדהים\" באנגלית:", correct: "amazing", explanation: "\"מדהים\" באנגלית זה \"amazing\"", category: "vocabulary", type: "dictation", englishWord: "amazing", hebrewWord: "מדהים" },
    { id: 254, text: "הכתיב את המילה \"מצוין\" באנגלית:", correct: "excellent", explanation: "\"מצוין\" באנגלית זה \"excellent\"", category: "vocabulary", type: "dictation", englishWord: "excellent", hebrewWord: "מצוין" },
    { id: 255, text: "הכתיב את המילה \"מושלם\" באנגלית:", correct: "perfect", explanation: "\"מושלם\" באנגלית זה \"perfect\"", category: "vocabulary", type: "dictation", englishWord: "perfect", hebrewWord: "מושלם" },
    { id: 256, text: "הכתיב את המילה \"חשוב\" באנגלית:", correct: "important", explanation: "\"חשוב\" באנגלית זה \"important\"", category: "vocabulary", type: "dictation", englishWord: "important", hebrewWord: "חשוב" },
    { id: 257, text: "הכתיב את המילה \"מעניין\" באנגלית:", correct: "interesting", explanation: "\"מעניין\" באנגלית זה \"interesting\"", category: "vocabulary", type: "dictation", englishWord: "interesting", hebrewWord: "מעניין" },
    { id: 258, text: "הכתיב את המילה \"קשה\" באנגלית:", correct: "difficult", explanation: "\"קשה\" באנגלית זה \"difficult\"", category: "vocabulary", type: "dictation", englishWord: "difficult", hebrewWord: "קשה" },
    { id: 259, text: "הכתיב את המילה \"קל\" באנגלית:", correct: "easy", explanation: "\"קל\" באנגלית זה \"easy\"", category: "vocabulary", type: "dictation", englishWord: "easy", hebrewWord: "קל" },
    { id: 260, text: "הכתיב את המילה \"מהיר\" באנגלית:", correct: "fast", explanation: "\"מהיר\" באנגלית זה \"fast\"", category: "vocabulary", type: "dictation", englishWord: "fast", hebrewWord: "מהיר" },
    { id: 261, text: "הכתיב את המילה \"איטי\" באנגלית:", correct: "slow", explanation: "\"איטי\" באנגלית זה \"slow\"", category: "vocabulary", type: "dictation", englishWord: "slow", hebrewWord: "איטי" },
    { id: 262, text: "הכתיב את המילה \"גבוה\" באנגלית:", correct: "high", explanation: "\"גבוה\" באנגלית זה \"high\"", category: "vocabulary", type: "dictation", englishWord: "high", hebrewWord: "גבוה" },
    { id: 263, text: "הכתיב את המילה \"נמוך\" באנגלית:", correct: "low", explanation: "\"נמוך\" באנגלית זה \"low\"", category: "vocabulary", type: "dictation", englishWord: "low", hebrewWord: "נמוך" },
    { id: 264, text: "הכתיב את המילה \"ארוך\" באנגלית:", correct: "long", explanation: "\"ארוך\" באנגלית זה \"long\"", category: "vocabulary", type: "dictation", englishWord: "long", hebrewWord: "ארוך" },
    { id: 265, text: "הכתיב את המילה \"קצר\" באנגלית:", correct: "short", explanation: "\"קצר\" באנגלית זה \"short\"", category: "vocabulary", type: "dictation", englishWord: "short", hebrewWord: "קצר" },
    { id: 266, text: "הכתיב את המילה \"רחב\" באנגלית:", correct: "wide", explanation: "\"רחב\" באנגלית זה \"wide\"", category: "vocabulary", type: "dictation", englishWord: "wide", hebrewWord: "רחב" },
    { id: 267, text: "הכתיב את המילה \"צר\" באנגלית:", correct: "narrow", explanation: "\"צר\" באנגלית זה \"narrow\"", category: "vocabulary", type: "dictation", englishWord: "narrow", hebrewWord: "צר" },
    { id: 268, text: "הכתיב את המילה \"עבה\" באנגלית:", correct: "thick", explanation: "\"עבה\" באנגלית זה \"thick\"", category: "vocabulary", type: "dictation", englishWord: "thick", hebrewWord: "עבה" },
    { id: 269, text: "הכתיב את המילה \"דק\" באנגלית:", correct: "thin", explanation: "\"דק\" באנגלית זה \"thin\"", category: "vocabulary", type: "dictation", englishWord: "thin", hebrewWord: "דק" },
    { id: 270, text: "הכתיב את המילה \"כבד\" באנגלית:", correct: "heavy", explanation: "\"כבד\" באנגלית זה \"heavy\"", category: "vocabulary", type: "dictation", englishWord: "heavy", hebrewWord: "כבד" },
    { id: 271, text: "הכתיב את המילה \"אור\" באנגלית:", correct: "light", explanation: "\"אור\" באנגלית זה \"light\"", category: "vocabulary", type: "dictation", englishWord: "light", hebrewWord: "אור" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 272, text: "הקליט את עצמך אומר את המילה \"יפה\" באנגלית:", correct: "beautiful", explanation: "\"יפה\" באנגלית זה \"beautiful\"", category: "vocabulary", type: "recording", englishWord: "beautiful", hebrewWord: "יפה" },
    { id: 273, text: "הקליט את עצמך אומר את המילה \"נפלא\" באנגלית:", correct: "wonderful", explanation: "\"נפלא\" באנגלית זה \"wonderful\"", category: "vocabulary", type: "recording", englishWord: "wonderful", hebrewWord: "נפלא" },
    { id: 274, text: "הקליט את עצמך אומר את המילה \"מדהים\" באנגלית:", correct: "amazing", explanation: "\"מדהים\" באנגלית זה \"amazing\"", category: "vocabulary", type: "recording", englishWord: "amazing", hebrewWord: "מדהים" },
    { id: 275, text: "הקליט את עצמך אומר את המילה \"מצוין\" באנגלית:", correct: "excellent", explanation: "\"מצוין\" באנגלית זה \"excellent\"", category: "vocabulary", type: "recording", englishWord: "excellent", hebrewWord: "מצוין" },
    { id: 276, text: "הקליט את עצמך אומר את המילה \"מושלם\" באנגלית:", correct: "perfect", explanation: "\"מושלם\" באנגלית זה \"perfect\"", category: "vocabulary", type: "recording", englishWord: "perfect", hebrewWord: "מושלם" },
    { id: 277, text: "הקליט את עצמך אומר את המילה \"חשוב\" באנגלית:", correct: "important", explanation: "\"חשוב\" באנגלית זה \"important\"", category: "vocabulary", type: "recording", englishWord: "important", hebrewWord: "חשוב" },
    { id: 278, text: "הקליט את עצמך אומר את המילה \"מעניין\" באנגלית:", correct: "interesting", explanation: "\"מעניין\" באנגלית זה \"interesting\"", category: "vocabulary", type: "recording", englishWord: "interesting", hebrewWord: "מעניין" },
    { id: 279, text: "הקליט את עצמך אומר את המילה \"קשה\" באנגלית:", correct: "difficult", explanation: "\"קשה\" באנגלית זה \"difficult\"", category: "vocabulary", type: "recording", englishWord: "difficult", hebrewWord: "קשה" },
    { id: 280, text: "הקליט את עצמך אומר את המילה \"קל\" באנגלית:", correct: "easy", explanation: "\"קל\" באנגלית זה \"easy\"", category: "vocabulary", type: "recording", englishWord: "easy", hebrewWord: "קל" },
    { id: 281, text: "הקליט את עצמך אומר את המילה \"מהיר\" באנגלית:", correct: "fast", explanation: "\"מהיר\" באנגלית זה \"fast\"", category: "vocabulary", type: "recording", englishWord: "fast", hebrewWord: "מהיר" },
    { id: 282, text: "הקליט את עצמך אומר את המילה \"איטי\" באנגלית:", correct: "slow", explanation: "\"איטי\" באנגלית זה \"slow\"", category: "vocabulary", type: "recording", englishWord: "slow", hebrewWord: "איטי" },
    { id: 283, text: "הקליט את עצמך אומר את המילה \"גבוה\" באנגלית:", correct: "high", explanation: "\"גבוה\" באנגלית זה \"high\"", category: "vocabulary", type: "recording", englishWord: "high", hebrewWord: "גבוה" },
    { id: 284, text: "הקליט את עצמך אומר את המילה \"נמוך\" באנגלית:", correct: "low", explanation: "\"נמוך\" באנגלית זה \"low\"", category: "vocabulary", type: "recording", englishWord: "low", hebrewWord: "נמוך" },
    { id: 285, text: "הקליט את עצמך אומר את המילה \"ארוך\" באנגלית:", correct: "long", explanation: "\"ארוך\" באנגלית זה \"long\"", category: "vocabulary", type: "recording", englishWord: "long", hebrewWord: "ארוך" },
    { id: 286, text: "הקליט את עצמך אומר את המילה \"קצר\" באנגלית:", correct: "short", explanation: "\"קצר\" באנגלית זה \"short\"", category: "vocabulary", type: "recording", englishWord: "short", hebrewWord: "קצר" },
    { id: 287, text: "הקליט את עצמך אומר את המילה \"רחב\" באנגלית:", correct: "wide", explanation: "\"רחב\" באנגלית זה \"wide\"", category: "vocabulary", type: "recording", englishWord: "wide", hebrewWord: "רחב" },
    { id: 288, text: "הקליט את עצמך אומר את המילה \"צר\" באנגלית:", correct: "narrow", explanation: "\"צר\" באנגלית זה \"narrow\"", category: "vocabulary", type: "recording", englishWord: "narrow", hebrewWord: "צר" },
    { id: 289, text: "הקליט את עצמך אומר את המילה \"עבה\" באנגלית:", correct: "thick", explanation: "\"עבה\" באנגלית זה \"thick\"", category: "vocabulary", type: "recording", englishWord: "thick", hebrewWord: "עבה" },
    { id: 290, text: "הקליט את עצמך אומר את המילה \"דק\" באנגלית:", correct: "thin", explanation: "\"דק\" באנגלית זה \"thin\"", category: "vocabulary", type: "recording", englishWord: "thin", hebrewWord: "דק" },
    { id: 291, text: "הקליט את עצמך אומר את המילה \"כבד\" באנגלית:", correct: "heavy", explanation: "\"כבד\" באנגלית זה \"heavy\"", category: "vocabulary", type: "recording", englishWord: "heavy", hebrewWord: "כבד" },
    { id: 292, text: "הקליט את עצמך אומר את המילה \"אור\" באנגלית:", correct: "light", explanation: "\"אור\" באנגלית זה \"light\"", category: "vocabulary", type: "recording", englishWord: "light", hebrewWord: "אור" }
    ]
  },
  '2': { // יחידה 2 - בית ומשפחה
    '1': [ // רמה 1 - מתחילים - אוצר מילים בית ומשפחה
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 370, text: "מה אומרת המילה \"mother\"?", options: ["אמא", "אבא", "אחות", "אח"], correct: 0, explanation: "\"mother\" אומרת \"אמא\"", category: "vocabulary", type: "multiple-choice", englishWord: "mother", hebrewWord: "אמא" },
    { id: 371, text: "מה אומרת המילה \"father\"?", options: ["אמא", "אבא", "אחות", "אח"], correct: 1, explanation: "\"father\" אומרת \"אבא\"", category: "vocabulary", type: "multiple-choice", englishWord: "father", hebrewWord: "אבא" },
    { id: 372, text: "מה אומרת המילה \"sister\"?", options: ["אמא", "אבא", "אחות", "אח"], correct: 2, explanation: "\"sister\" אומרת \"אחות\"", category: "vocabulary", type: "multiple-choice", englishWord: "sister", hebrewWord: "אחות" },
    { id: 373, text: "מה אומרת המילה \"brother\"?", options: ["אמא", "אבא", "אחות", "אח"], correct: 3, explanation: "\"brother\" אומרת \"אח\"", category: "vocabulary", type: "multiple-choice", englishWord: "brother", hebrewWord: "אח" },
    { id: 374, text: "מה אומרת המילה \"room\"?", options: ["חדר", "בית", "חלון", "דלת"], correct: 0, explanation: "\"room\" אומרת \"חדר\"", category: "vocabulary", type: "multiple-choice", englishWord: "room", hebrewWord: "חדר" },
    { id: 375, text: "מה אומרת המילה \"door\"?", options: ["חדר", "בית", "חלון", "דלת"], correct: 3, explanation: "\"door\" אומרת \"דלת\"", category: "vocabulary", type: "multiple-choice", englishWord: "door", hebrewWord: "דלת" },
    { id: 376, text: "מה אומרת המילה \"window\"?", options: ["חדר", "בית", "חלון", "דלת"], correct: 2, explanation: "\"window\" אומרת \"חלון\"", category: "vocabulary", type: "multiple-choice", englishWord: "window", hebrewWord: "חלון" },
    { id: 377, text: "מה אומרת המילה \"bed\"?", options: ["מיטה", "שולחן", "כסא", "ארון"], correct: 0, explanation: "\"bed\" אומרת \"מיטה\"", category: "vocabulary", type: "multiple-choice", englishWord: "bed", hebrewWord: "מיטה" },
    { id: 378, text: "מה אומרת המילה \"kitchen\"?", options: ["מטבח", "סלון", "שירותים", "מרפסת"], correct: 0, explanation: "\"kitchen\" אומרת \"מטבח\"", category: "vocabulary", type: "multiple-choice", englishWord: "kitchen", hebrewWord: "מטבח" },
    { id: 379, text: "מה אומרת המילה \"bathroom\"?", options: ["מטבח", "סלון", "שירותים", "מרפסת"], correct: 2, explanation: "\"bathroom\" אומרת \"שירותים\"", category: "vocabulary", type: "multiple-choice", englishWord: "bathroom", hebrewWord: "שירותים" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 380, text: "הכתיב את המילה \"אמא\" באנגלית:", correct: "mother", explanation: "\"אמא\" באנגלית זה \"mother\"", category: "vocabulary", type: "dictation", englishWord: "mother", hebrewWord: "אמא" },
    { id: 381, text: "הכתיב את המילה \"אבא\" באנגלית:", correct: "father", explanation: "\"אבא\" באנגלית זה \"father\"", category: "vocabulary", type: "dictation", englishWord: "father", hebrewWord: "אבא" },
    { id: 382, text: "הכתיב את המילה \"אחות\" באנגלית:", correct: "sister", explanation: "\"אחות\" באנגלית זה \"sister\"", category: "vocabulary", type: "dictation", englishWord: "sister", hebrewWord: "אחות" },
    { id: 383, text: "הכתיב את המילה \"אח\" באנגלית:", correct: "brother", explanation: "\"אח\" באנגלית זה \"brother\"", category: "vocabulary", type: "dictation", englishWord: "brother", hebrewWord: "אח" },
    { id: 384, text: "הכתיב את המילה \"חדר\" באנגלית:", correct: "room", explanation: "\"חדר\" באנגלית זה \"room\"", category: "vocabulary", type: "dictation", englishWord: "room", hebrewWord: "חדר" },
    { id: 385, text: "הכתיב את המילה \"דלת\" באנגלית:", correct: "door", explanation: "\"דלת\" באנגלית זה \"door\"", category: "vocabulary", type: "dictation", englishWord: "door", hebrewWord: "דלת" },
    { id: 386, text: "הכתיב את המילה \"חלון\" באנגלית:", correct: "window", explanation: "\"חלון\" באנגלית זה \"window\"", category: "vocabulary", type: "dictation", englishWord: "window", hebrewWord: "חלון" },
    { id: 387, text: "הכתיב את המילה \"מיטה\" באנגלית:", correct: "bed", explanation: "\"מיטה\" באנגלית זה \"bed\"", category: "vocabulary", type: "dictation", englishWord: "bed", hebrewWord: "מיטה" },
    { id: 388, text: "הכתיב את המילה \"מטבח\" באנגלית:", correct: "kitchen", explanation: "\"מטבח\" באנגלית זה \"kitchen\"", category: "vocabulary", type: "dictation", englishWord: "kitchen", hebrewWord: "מטבח" },
    { id: 389, text: "הכתיב את המילה \"שירותים\" באנגלית:", correct: "bathroom", explanation: "\"שירותים\" באנגלית זה \"bathroom\"", category: "vocabulary", type: "dictation", englishWord: "bathroom", hebrewWord: "שירותים" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 390, text: "הקליט את עצמך אומר את המילה \"אמא\" באנגלית:", correct: "mother", explanation: "\"אמא\" באנגלית זה \"mother\"", category: "vocabulary", type: "recording", englishWord: "mother", hebrewWord: "אמא" },
    { id: 391, text: "הקליט את עצמך אומר את המילה \"אבא\" באנגלית:", correct: "father", explanation: "\"אבא\" באנגלית זה \"father\"", category: "vocabulary", type: "recording", englishWord: "father", hebrewWord: "אבא" },
    { id: 392, text: "הקליט את עצמך אומר את המילה \"אחות\" באנגלית:", correct: "sister", explanation: "\"אחות\" באנגלית זה \"sister\"", category: "vocabulary", type: "recording", englishWord: "sister", hebrewWord: "אחות" },
    { id: 393, text: "הקליט את עצמך אומר את המילה \"אח\" באנגלית:", correct: "brother", explanation: "\"אח\" באנגלית זה \"brother\"", category: "vocabulary", type: "recording", englishWord: "brother", hebrewWord: "אח" },
    { id: 394, text: "הקליט את עצמך אומר את המילה \"חדר\" באנגלית:", correct: "room", explanation: "\"חדר\" באנגלית זה \"room\"", category: "vocabulary", type: "recording", englishWord: "room", hebrewWord: "חדר" },
    { id: 395, text: "הקליט את עצמך אומר את המילה \"דלת\" באנגלית:", correct: "door", explanation: "\"דלת\" באנגלית זה \"door\"", category: "vocabulary", type: "recording", englishWord: "door", hebrewWord: "דלת" },
    { id: 396, text: "הקליט את עצמך אומר את המילה \"חלון\" באנגלית:", correct: "window", explanation: "\"חלון\" באנגלית זה \"window\"", category: "vocabulary", type: "recording", englishWord: "window", hebrewWord: "חלון" },
    { id: 397, text: "הקליט את עצמך אומר את המילה \"מיטה\" באנגלית:", correct: "bed", explanation: "\"מיטה\" באנגלית זה \"bed\"", category: "vocabulary", type: "recording", englishWord: "bed", hebrewWord: "מיטה" },
    { id: 398, text: "הקליט את עצמך אומר את המילה \"מטבח\" באנגלית:", correct: "kitchen", explanation: "\"מטבח\" באנגלית זה \"kitchen\"", category: "vocabulary", type: "recording", englishWord: "kitchen", hebrewWord: "מטבח" },
    { id: 399, text: "הקליט את עצמך אומר את המילה \"שירותים\" באנגלית:", correct: "bathroom", explanation: "\"שירותים\" באנגלית זה \"bathroom\"", category: "vocabulary", type: "recording", englishWord: "bathroom", hebrewWord: "שירותים" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 400, text: "הקליט את עצמך אומר את המשפט: \"I love my mother\" ואז בחר מה הפירוש של המילה \"mother\" במשפט:", sentence: "I love my mother", sentenceTranslation: "אני אוהב את אמא שלי", correct: 0, options: ["אמא", "אבא", "אחות", "אח"], explanation: "\"mother\" במשפט זה אומרת \"אמא\"", category: "vocabulary", type: "sentence-recording", englishWord: "mother", hebrewWord: "אמא" },
    { id: 401, text: "הקליט את עצמך אומר את המשפט: \"My father is here\" ואז בחר מה הפירוש של המילה \"father\" במשפט:", sentence: "My father is here", sentenceTranslation: "אבא שלי כאן", correct: 1, options: ["אמא", "אבא", "אחות", "אח"], explanation: "\"father\" במשפט זה אומרת \"אבא\"", category: "vocabulary", type: "sentence-recording", englishWord: "father", hebrewWord: "אבא" },
    { id: 402, text: "הקליט את עצמך אומר את המשפט: \"My sister is nice\" ואז בחר מה הפירוש של המילה \"sister\" במשפט:", sentence: "My sister is nice", sentenceTranslation: "אחות שלי נחמדה", correct: 2, options: ["אמא", "אבא", "אחות", "אח"], explanation: "\"sister\" במשפט זה אומרת \"אחות\"", category: "vocabulary", type: "sentence-recording", englishWord: "sister", hebrewWord: "אחות" },
    { id: 403, text: "הקליט את עצמך אומר את המשפט: \"I have a brother\" ואז בחר מה הפירוש של המילה \"brother\" במשפט:", sentence: "I have a brother", sentenceTranslation: "יש לי אח", correct: 3, options: ["אמא", "אבא", "אחות", "אח"], explanation: "\"brother\" במשפט זה אומרת \"אח\"", category: "vocabulary", type: "sentence-recording", englishWord: "brother", hebrewWord: "אח" },
    { id: 404, text: "הקליט את עצמך אומר את המשפט: \"This is my room\" ואז בחר מה הפירוש של המילה \"room\" במשפט:", sentence: "This is my room", sentenceTranslation: "זה החדר שלי", correct: 0, options: ["חדר", "בית", "חלון", "דלת"], explanation: "\"room\" במשפט זה אומרת \"חדר\"", category: "vocabulary", type: "sentence-recording", englishWord: "room", hebrewWord: "חדר" },
    { id: 405, text: "הקליט את עצמך אומר את המשפט: \"Open the door\" ואז בחר מה הפירוש של המילה \"door\" במשפט:", sentence: "Open the door", sentenceTranslation: "פתח את הדלת", correct: 3, options: ["חדר", "בית", "חלון", "דלת"], explanation: "\"door\" במשפט זה אומרת \"דלת\"", category: "vocabulary", type: "sentence-recording", englishWord: "door", hebrewWord: "דלת" },
    { id: 406, text: "הקליט את עצמך אומר את המשפט: \"I see the window\" ואז בחר מה הפירוש של המילה \"window\" במשפט:", sentence: "I see the window", sentenceTranslation: "אני רואה את החלון", correct: 2, options: ["חדר", "בית", "חלון", "דלת"], explanation: "\"window\" במשפט זה אומרת \"חלון\"", category: "vocabulary", type: "sentence-recording", englishWord: "window", hebrewWord: "חלון" },
    { id: 407, text: "הקליט את עצמך אומר את המשפט: \"I sleep in my bed\" ואז בחר מה הפירוש של המילה \"bed\" במשפט:", sentence: "I sleep in my bed", sentenceTranslation: "אני ישן במיטה שלי", correct: 0, options: ["מיטה", "שולחן", "כסא", "ארון"], explanation: "\"bed\" במשפט זה אומרת \"מיטה\"", category: "vocabulary", type: "sentence-recording", englishWord: "bed", hebrewWord: "מיטה" },
    { id: 408, text: "הקליט את עצמך אומר את המשפט: \"I cook in the kitchen\" ואז בחר מה הפירוש של המילה \"kitchen\" במשפט:", sentence: "I cook in the kitchen", sentenceTranslation: "אני מבשל במטבח", correct: 0, options: ["מטבח", "סלון", "שירותים", "מרפסת"], explanation: "\"kitchen\" במשפט זה אומרת \"מטבח\"", category: "vocabulary", type: "sentence-recording", englishWord: "kitchen", hebrewWord: "מטבח" },
    { id: 409, text: "הקליט את עצמך אומר את המשפט: \"The bathroom is clean\" ואז בחר מה הפירוש של המילה \"bathroom\" במשפט:", sentence: "The bathroom is clean", sentenceTranslation: "השירותים נקיים", correct: 2, options: ["מטבח", "סלון", "שירותים", "מרפסת"], explanation: "\"bathroom\" במשפט זה אומרת \"שירותים\"", category: "vocabulary", type: "sentence-recording", englishWord: "bathroom", hebrewWord: "שירותים" }
    ],
    '2': [ // רמה 2 - בסיסי - אוצר מילים בית ומשפחה מתקדם יותר
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 420, text: "מה אומרת המילה \"grandmother\"?", options: ["סבתא", "סבא", "דודה", "דוד"], correct: 0, explanation: "\"grandmother\" אומרת \"סבתא\"", category: "vocabulary", type: "multiple-choice", englishWord: "grandmother", hebrewWord: "סבתא" },
    { id: 421, text: "מה אומרת המילה \"grandfather\"?", options: ["סבתא", "סבא", "דודה", "דוד"], correct: 1, explanation: "\"grandfather\" אומרת \"סבא\"", category: "vocabulary", type: "multiple-choice", englishWord: "grandfather", hebrewWord: "סבא" },
    { id: 422, text: "מה אומרת המילה \"aunt\"?", options: ["סבתא", "סבא", "דודה", "דוד"], correct: 2, explanation: "\"aunt\" אומרת \"דודה\"", category: "vocabulary", type: "multiple-choice", englishWord: "aunt", hebrewWord: "דודה" },
    { id: 423, text: "מה אומרת המילה \"uncle\"?", options: ["סבתא", "סבא", "דודה", "דוד"], correct: 3, explanation: "\"uncle\" אומרת \"דוד\"", category: "vocabulary", type: "multiple-choice", englishWord: "uncle", hebrewWord: "דוד" },
    { id: 424, text: "מה אומרת המילה \"living room\"?", options: ["סלון", "מטבח", "שירותים", "מרפסת"], correct: 0, explanation: "\"living room\" אומרת \"סלון\"", category: "vocabulary", type: "multiple-choice", englishWord: "living room", hebrewWord: "סלון" },
    { id: 425, text: "מה אומרת המילה \"balcony\"?", options: ["סלון", "מטבח", "שירותים", "מרפסת"], correct: 3, explanation: "\"balcony\" אומרת \"מרפסת\"", category: "vocabulary", type: "multiple-choice", englishWord: "balcony", hebrewWord: "מרפסת" },
    { id: 426, text: "מה אומרת המילה \"sofa\"?", options: ["ספה", "כורסה", "שולחן", "כסא"], correct: 0, explanation: "\"sofa\" אומרת \"ספה\"", category: "vocabulary", type: "multiple-choice", englishWord: "sofa", hebrewWord: "ספה" },
    { id: 427, text: "מה אומרת המילה \"wardrobe\"?", options: ["ארון", "שולחן", "כסא", "מיטה"], correct: 0, explanation: "\"wardrobe\" אומרת \"ארון\"", category: "vocabulary", type: "multiple-choice", englishWord: "wardrobe", hebrewWord: "ארון" },
    { id: 428, text: "מה אומרת המילה \"lamp\"?", options: ["מנורה", "חלון", "דלת", "קיר"], correct: 0, explanation: "\"lamp\" אומרת \"מנורה\"", category: "vocabulary", type: "multiple-choice", englishWord: "lamp", hebrewWord: "מנורה" },
    { id: 429, text: "מה אומרת המילה \"mirror\"?", options: ["מראה", "חלון", "דלת", "קיר"], correct: 0, explanation: "\"mirror\" אומרת \"מראה\"", category: "vocabulary", type: "multiple-choice", englishWord: "mirror", hebrewWord: "מראה" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 430, text: "הכתיב את המילה \"סבתא\" באנגלית:", correct: "grandmother", explanation: "\"סבתא\" באנגלית זה \"grandmother\"", category: "vocabulary", type: "dictation", englishWord: "grandmother", hebrewWord: "סבתא" },
    { id: 431, text: "הכתיב את המילה \"סבא\" באנגלית:", correct: "grandfather", explanation: "\"סבא\" באנגלית זה \"grandfather\"", category: "vocabulary", type: "dictation", englishWord: "grandfather", hebrewWord: "סבא" },
    { id: 432, text: "הכתיב את המילה \"דודה\" באנגלית:", correct: "aunt", explanation: "\"דודה\" באנגלית זה \"aunt\"", category: "vocabulary", type: "dictation", englishWord: "aunt", hebrewWord: "דודה" },
    { id: 433, text: "הכתיב את המילה \"דוד\" באנגלית:", correct: "uncle", explanation: "\"דוד\" באנגלית זה \"uncle\"", category: "vocabulary", type: "dictation", englishWord: "uncle", hebrewWord: "דוד" },
    { id: 434, text: "הכתיב את המילה \"סלון\" באנגלית:", correct: "living room", explanation: "\"סלון\" באנגלית זה \"living room\"", category: "vocabulary", type: "dictation", englishWord: "living room", hebrewWord: "סלון" },
    { id: 435, text: "הכתיב את המילה \"מרפסת\" באנגלית:", correct: "balcony", explanation: "\"מרפסת\" באנגלית זה \"balcony\"", category: "vocabulary", type: "dictation", englishWord: "balcony", hebrewWord: "מרפסת" },
    { id: 436, text: "הכתיב את המילה \"ספה\" באנגלית:", correct: "sofa", explanation: "\"ספה\" באנגלית זה \"sofa\"", category: "vocabulary", type: "dictation", englishWord: "sofa", hebrewWord: "ספה" },
    { id: 437, text: "הכתיב את המילה \"ארון\" באנגלית:", correct: "wardrobe", explanation: "\"ארון\" באנגלית זה \"wardrobe\"", category: "vocabulary", type: "dictation", englishWord: "wardrobe", hebrewWord: "ארון" },
    { id: 438, text: "הכתיב את המילה \"מנורה\" באנגלית:", correct: "lamp", explanation: "\"מנורה\" באנגלית זה \"lamp\"", category: "vocabulary", type: "dictation", englishWord: "lamp", hebrewWord: "מנורה" },
    { id: 439, text: "הכתיב את המילה \"מראה\" באנגלית:", correct: "mirror", explanation: "\"מראה\" באנגלית זה \"mirror\"", category: "vocabulary", type: "dictation", englishWord: "mirror", hebrewWord: "מראה" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 440, text: "הקליט את עצמך אומר את המילה \"סבתא\" באנגלית:", correct: "grandmother", explanation: "\"סבתא\" באנגלית זה \"grandmother\"", category: "vocabulary", type: "recording", englishWord: "grandmother", hebrewWord: "סבתא" },
    { id: 441, text: "הקליט את עצמך אומר את המילה \"סבא\" באנגלית:", correct: "grandfather", explanation: "\"סבא\" באנגלית זה \"grandfather\"", category: "vocabulary", type: "recording", englishWord: "grandfather", hebrewWord: "סבא" },
    { id: 442, text: "הקליט את עצמך אומר את המילה \"דודה\" באנגלית:", correct: "aunt", explanation: "\"דודה\" באנגלית זה \"aunt\"", category: "vocabulary", type: "recording", englishWord: "aunt", hebrewWord: "דודה" },
    { id: 443, text: "הקליט את עצמך אומר את המילה \"דוד\" באנגלית:", correct: "uncle", explanation: "\"דוד\" באנגלית זה \"uncle\"", category: "vocabulary", type: "recording", englishWord: "uncle", hebrewWord: "דוד" },
    { id: 444, text: "הקליט את עצמך אומר את המילה \"סלון\" באנגלית:", correct: "living room", explanation: "\"סלון\" באנגלית זה \"living room\"", category: "vocabulary", type: "recording", englishWord: "living room", hebrewWord: "סלון" },
    { id: 445, text: "הקליט את עצמך אומר את המילה \"מרפסת\" באנגלית:", correct: "balcony", explanation: "\"מרפסת\" באנגלית זה \"balcony\"", category: "vocabulary", type: "recording", englishWord: "balcony", hebrewWord: "מרפסת" },
    { id: 446, text: "הקליט את עצמך אומר את המילה \"ספה\" באנגלית:", correct: "sofa", explanation: "\"ספה\" באנגלית זה \"sofa\"", category: "vocabulary", type: "recording", englishWord: "sofa", hebrewWord: "ספה" },
    { id: 447, text: "הקליט את עצמך אומר את המילה \"ארון\" באנגלית:", correct: "wardrobe", explanation: "\"ארון\" באנגלית זה \"wardrobe\"", category: "vocabulary", type: "recording", englishWord: "wardrobe", hebrewWord: "ארון" },
    { id: 448, text: "הקליט את עצמך אומר את המילה \"מנורה\" באנגלית:", correct: "lamp", explanation: "\"מנורה\" באנגלית זה \"lamp\"", category: "vocabulary", type: "recording", englishWord: "lamp", hebrewWord: "מנורה" },
    { id: 449, text: "הקליט את עצמך אומר את המילה \"מראה\" באנגלית:", correct: "mirror", explanation: "\"מראה\" באנגלית זה \"mirror\"", category: "vocabulary", type: "recording", englishWord: "mirror", hebrewWord: "מראה" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 450, text: "הקליט את עצמך אומר את המשפט: \"My grandmother is kind\" ואז בחר מה הפירוש של המילה \"grandmother\" במשפט:", sentence: "My grandmother is kind", sentenceTranslation: "סבתא שלי נחמדה", correct: 0, options: ["סבתא", "סבא", "דודה", "דוד"], explanation: "\"grandmother\" במשפט זה אומרת \"סבתא\"", category: "vocabulary", type: "sentence-recording", englishWord: "grandmother", hebrewWord: "סבתא" },
    { id: 451, text: "הקליט את עצמך אומר את המשפט: \"My grandfather plays\" ואז בחר מה הפירוש של המילה \"grandfather\" במשפט:", sentence: "My grandfather plays", sentenceTranslation: "סבא שלי משחק", correct: 1, options: ["סבתא", "סבא", "דודה", "דוד"], explanation: "\"grandfather\" במשפט זה אומרת \"סבא\"", category: "vocabulary", type: "sentence-recording", englishWord: "grandfather", hebrewWord: "סבא" },
    { id: 452, text: "הקליט את עצמך אומר את המשפט: \"I visit my aunt\" ואז בחר מה הפירוש של המילה \"aunt\" במשפט:", sentence: "I visit my aunt", sentenceTranslation: "אני מבקר את הדודה שלי", correct: 2, options: ["סבתא", "סבא", "דודה", "דוד"], explanation: "\"aunt\" במשפט זה אומרת \"דודה\"", category: "vocabulary", type: "sentence-recording", englishWord: "aunt", hebrewWord: "דודה" },
    { id: 453, text: "הקליט את עצמך אומר את המשפט: \"My uncle is tall\" ואז בחר מה הפירוש של המילה \"uncle\" במשפט:", sentence: "My uncle is tall", sentenceTranslation: "דוד שלי גבוה", correct: 3, options: ["סבתא", "סבא", "דודה", "דוד"], explanation: "\"uncle\" במשפט זה אומרת \"דוד\"", category: "vocabulary", type: "sentence-recording", englishWord: "uncle", hebrewWord: "דוד" },
    { id: 454, text: "הקליט את עצמך אומר את המשפט: \"We sit in the living room\" ואז בחר מה הפירוש של המילה \"living room\" במשפט:", sentence: "We sit in the living room", sentenceTranslation: "אנחנו יושבים בסלון", correct: 0, options: ["סלון", "מטבח", "שירותים", "מרפסת"], explanation: "\"living room\" במשפט זה אומרת \"סלון\"", category: "vocabulary", type: "sentence-recording", englishWord: "living room", hebrewWord: "סלון" },
    { id: 455, text: "הקליט את עצמך אומר את המשפט: \"I stand on the balcony\" ואז בחר מה הפירוש של המילה \"balcony\" במשפט:", sentence: "I stand on the balcony", sentenceTranslation: "אני עומד במרפסת", correct: 3, options: ["סלון", "מטבח", "שירותים", "מרפסת"], explanation: "\"balcony\" במשפט זה אומרת \"מרפסת\"", category: "vocabulary", type: "sentence-recording", englishWord: "balcony", hebrewWord: "מרפסת" },
    { id: 456, text: "הקליט את עצמך אומר את המשפט: \"The sofa is big\" ואז בחר מה הפירוש של המילה \"sofa\" במשפט:", sentence: "The sofa is big", sentenceTranslation: "הספה גדולה", correct: 0, options: ["ספה", "כורסה", "שולחן", "כסא"], explanation: "\"sofa\" במשפט זה אומרת \"ספה\"", category: "vocabulary", type: "sentence-recording", englishWord: "sofa", hebrewWord: "ספה" },
    { id: 457, text: "הקליט את עצמך אומר את המשפט: \"I open the wardrobe\" ואז בחר מה הפירוש של המילה \"wardrobe\" במשפט:", sentence: "I open the wardrobe", sentenceTranslation: "אני פותח את הארון", correct: 0, options: ["ארון", "שולחן", "כסא", "מיטה"], explanation: "\"wardrobe\" במשפט זה אומרת \"ארון\"", category: "vocabulary", type: "sentence-recording", englishWord: "wardrobe", hebrewWord: "ארון" },
    { id: 458, text: "הקליט את עצמך אומר את המשפט: \"The lamp is bright\" ואז בחר מה הפירוש של המילה \"lamp\" במשפט:", sentence: "The lamp is bright", sentenceTranslation: "המנורה בהירה", correct: 0, options: ["מנורה", "חלון", "דלת", "קיר"], explanation: "\"lamp\" במשפט זה אומרת \"מנורה\"", category: "vocabulary", type: "sentence-recording", englishWord: "lamp", hebrewWord: "מנורה" },
    { id: 459, text: "הקליט את עצמך אומר את המשפט: \"I look in the mirror\" ואז בחר מה הפירוש של המילה \"mirror\" במשפט:", sentence: "I look in the mirror", sentenceTranslation: "אני מסתכל במראה", correct: 0, options: ["מראה", "חלון", "דלת", "קיר"], explanation: "\"mirror\" במשפט זה אומרת \"מראה\"", category: "vocabulary", type: "sentence-recording", englishWord: "mirror", hebrewWord: "מראה" }
    ],
    '3': [ // רמה 3 - בינוני - אוצר מילים בית ומשפחה בינוני
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 460, text: "מה אומרת המילה \"cousin\"?", options: ["בן דוד", "אח", "אחות", "חבר"], correct: 0, explanation: "\"cousin\" אומרת \"בן דוד\"", category: "vocabulary", type: "multiple-choice", englishWord: "cousin", hebrewWord: "בן דוד" },
    { id: 461, text: "מה אומרת המילה \"nephew\"?", options: ["אחיין", "אחיינית", "בן דוד", "בת דודה"], correct: 0, explanation: "\"nephew\" אומרת \"אחיין\"", category: "vocabulary", type: "multiple-choice", englishWord: "nephew", hebrewWord: "אחיין" },
    { id: 462, text: "מה אומרת המילה \"niece\"?", options: ["אחיין", "אחיינית", "בן דוד", "בת דודה"], correct: 1, explanation: "\"niece\" אומרת \"אחיינית\"", category: "vocabulary", type: "multiple-choice", englishWord: "niece", hebrewWord: "אחיינית" },
    { id: 463, text: "מה אומרת המילה \"dining room\"?", options: ["פינת אוכל", "מטבח", "סלון", "חדר אוכל"], correct: 3, explanation: "\"dining room\" אומרת \"חדר אוכל\"", category: "vocabulary", type: "multiple-choice", englishWord: "dining room", hebrewWord: "חדר אוכל" },
    { id: 464, text: "מה אומרת המילה \"garage\"?", options: ["חניה", "מרפסת", "גינה", "מרתף"], correct: 0, explanation: "\"garage\" אומרת \"חניה\"", category: "vocabulary", type: "multiple-choice", englishWord: "garage", hebrewWord: "חניה" },
    { id: 465, text: "מה אומרת המילה \"garden\"?", options: ["חניה", "מרפסת", "גינה", "מרתף"], correct: 2, explanation: "\"garden\" אומרת \"גינה\"", category: "vocabulary", type: "multiple-choice", englishWord: "garden", hebrewWord: "גינה" },
    { id: 466, text: "מה אומרת המילה \"refrigerator\"?", options: ["מקרר", "תנור", "כיריים", "מדיח כלים"], correct: 0, explanation: "\"refrigerator\" אומרת \"מקרר\"", category: "vocabulary", type: "multiple-choice", englishWord: "refrigerator", hebrewWord: "מקרר" },
    { id: 467, text: "מה אומרת המילה \"oven\"?", options: ["מקרר", "תנור", "כיריים", "מדיח כלים"], correct: 1, explanation: "\"oven\" אומרת \"תנור\"", category: "vocabulary", type: "multiple-choice", englishWord: "oven", hebrewWord: "תנור" },
    { id: 468, text: "מה אומרת המילה \"stove\"?", options: ["מקרר", "תנור", "כיריים", "מדיח כלים"], correct: 2, explanation: "\"stove\" אומרת \"כיריים\"", category: "vocabulary", type: "multiple-choice", englishWord: "stove", hebrewWord: "כיריים" },
    { id: 469, text: "מה אומרת המילה \"dishwasher\"?", options: ["מקרר", "תנור", "כיריים", "מדיח כלים"], correct: 3, explanation: "\"dishwasher\" אומרת \"מדיח כלים\"", category: "vocabulary", type: "multiple-choice", englishWord: "dishwasher", hebrewWord: "מדיח כלים" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 470, text: "הכתיב את המילה \"בן דוד\" באנגלית:", correct: "cousin", explanation: "\"בן דוד\" באנגלית זה \"cousin\"", category: "vocabulary", type: "dictation", englishWord: "cousin", hebrewWord: "בן דוד" },
    { id: 471, text: "הכתיב את המילה \"אחיין\" באנגלית:", correct: "nephew", explanation: "\"אחיין\" באנגלית זה \"nephew\"", category: "vocabulary", type: "dictation", englishWord: "nephew", hebrewWord: "אחיין" },
    { id: 472, text: "הכתיב את המילה \"אחיינית\" באנגלית:", correct: "niece", explanation: "\"אחיינית\" באנגלית זה \"niece\"", category: "vocabulary", type: "dictation", englishWord: "niece", hebrewWord: "אחיינית" },
    { id: 473, text: "הכתיב את המילה \"חדר אוכל\" באנגלית:", correct: "dining room", explanation: "\"חדר אוכל\" באנגלית זה \"dining room\"", category: "vocabulary", type: "dictation", englishWord: "dining room", hebrewWord: "חדר אוכל" },
    { id: 474, text: "הכתיב את המילה \"חניה\" באנגלית:", correct: "garage", explanation: "\"חניה\" באנגלית זה \"garage\"", category: "vocabulary", type: "dictation", englishWord: "garage", hebrewWord: "חניה" },
    { id: 475, text: "הכתיב את המילה \"גינה\" באנגלית:", correct: "garden", explanation: "\"גינה\" באנגלית זה \"garden\"", category: "vocabulary", type: "dictation", englishWord: "garden", hebrewWord: "גינה" },
    { id: 476, text: "הכתיב את המילה \"מקרר\" באנגלית:", correct: "refrigerator", explanation: "\"מקרר\" באנגלית זה \"refrigerator\"", category: "vocabulary", type: "dictation", englishWord: "refrigerator", hebrewWord: "מקרר" },
    { id: 477, text: "הכתיב את המילה \"תנור\" באנגלית:", correct: "oven", explanation: "\"תנור\" באנגלית זה \"oven\"", category: "vocabulary", type: "dictation", englishWord: "oven", hebrewWord: "תנור" },
    { id: 478, text: "הכתיב את המילה \"כיריים\" באנגלית:", correct: "stove", explanation: "\"כיריים\" באנגלית זה \"stove\"", category: "vocabulary", type: "dictation", englishWord: "stove", hebrewWord: "כיריים" },
    { id: 479, text: "הכתיב את המילה \"מדיח כלים\" באנגלית:", correct: "dishwasher", explanation: "\"מדיח כלים\" באנגלית זה \"dishwasher\"", category: "vocabulary", type: "dictation", englishWord: "dishwasher", hebrewWord: "מדיח כלים" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 480, text: "הקליט את עצמך אומר את המילה \"בן דוד\" באנגלית:", correct: "cousin", explanation: "\"בן דוד\" באנגלית זה \"cousin\"", category: "vocabulary", type: "recording", englishWord: "cousin", hebrewWord: "בן דוד" },
    { id: 481, text: "הקליט את עצמך אומר את המילה \"אחיין\" באנגלית:", correct: "nephew", explanation: "\"אחיין\" באנגלית זה \"nephew\"", category: "vocabulary", type: "recording", englishWord: "nephew", hebrewWord: "אחיין" },
    { id: 482, text: "הקליט את עצמך אומר את המילה \"אחיינית\" באנגלית:", correct: "niece", explanation: "\"אחיינית\" באנגלית זה \"niece\"", category: "vocabulary", type: "recording", englishWord: "niece", hebrewWord: "אחיינית" },
    { id: 483, text: "הקליט את עצמך אומר את המילה \"חדר אוכל\" באנגלית:", correct: "dining room", explanation: "\"חדר אוכל\" באנגלית זה \"dining room\"", category: "vocabulary", type: "recording", englishWord: "dining room", hebrewWord: "חדר אוכל" },
    { id: 484, text: "הקליט את עצמך אומר את המילה \"חניה\" באנגלית:", correct: "garage", explanation: "\"חניה\" באנגלית זה \"garage\"", category: "vocabulary", type: "recording", englishWord: "garage", hebrewWord: "חניה" },
    { id: 485, text: "הקליט את עצמך אומר את המילה \"גינה\" באנגלית:", correct: "garden", explanation: "\"גינה\" באנגלית זה \"garden\"", category: "vocabulary", type: "recording", englishWord: "garden", hebrewWord: "גינה" },
    { id: 486, text: "הקליט את עצמך אומר את המילה \"מקרר\" באנגלית:", correct: "refrigerator", explanation: "\"מקרר\" באנגלית זה \"refrigerator\"", category: "vocabulary", type: "recording", englishWord: "refrigerator", hebrewWord: "מקרר" },
    { id: 487, text: "הקליט את עצמך אומר את המילה \"תנור\" באנגלית:", correct: "oven", explanation: "\"תנור\" באנגלית זה \"oven\"", category: "vocabulary", type: "recording", englishWord: "oven", hebrewWord: "תנור" },
    { id: 488, text: "הקליט את עצמך אומר את המילה \"כיריים\" באנגלית:", correct: "stove", explanation: "\"כיריים\" באנגלית זה \"stove\"", category: "vocabulary", type: "recording", englishWord: "stove", hebrewWord: "כיריים" },
    { id: 489, text: "הקליט את עצמך אומר את המילה \"מדיח כלים\" באנגלית:", correct: "dishwasher", explanation: "\"מדיח כלים\" באנגלית זה \"dishwasher\"", category: "vocabulary", type: "recording", englishWord: "dishwasher", hebrewWord: "מדיח כלים" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 490, text: "הקליט את עצמך אומר את המשפט: \"My cousin is fun\" ואז בחר מה הפירוש של המילה \"cousin\" במשפט:", sentence: "My cousin is fun", sentenceTranslation: "בן הדוד שלי כיף", correct: 0, options: ["בן דוד", "אח", "אחות", "חבר"], explanation: "\"cousin\" במשפט זה אומרת \"בן דוד\"", category: "vocabulary", type: "sentence-recording", englishWord: "cousin", hebrewWord: "בן דוד" },
    { id: 491, text: "הקליט את עצמך אומר את המשפט: \"My nephew is young\" ואז בחר מה הפירוש של המילה \"nephew\" במשפט:", sentence: "My nephew is young", sentenceTranslation: "האחיין שלי צעיר", correct: 0, options: ["אחיין", "אחיינית", "בן דוד", "בת דודה"], explanation: "\"nephew\" במשפט זה אומרת \"אחיין\"", category: "vocabulary", type: "sentence-recording", englishWord: "nephew", hebrewWord: "אחיין" },
    { id: 492, text: "הקליט את עצמך אומר את המשפט: \"My niece is smart\" ואז בחר מה הפירוש של המילה \"niece\" במשפט:", sentence: "My niece is smart", sentenceTranslation: "האחיינית שלי חכמה", correct: 1, options: ["אחיין", "אחיינית", "בן דוד", "בת דודה"], explanation: "\"niece\" במשפט זה אומרת \"אחיינית\"", category: "vocabulary", type: "sentence-recording", englishWord: "niece", hebrewWord: "אחיינית" },
    { id: 493, text: "הקליט את עצמך אומר את המשפט: \"We eat in the dining room\" ואז בחר מה הפירוש של המילה \"dining room\" במשפט:", sentence: "We eat in the dining room", sentenceTranslation: "אנחנו אוכלים בחדר האוכל", correct: 3, options: ["פינת אוכל", "מטבח", "סלון", "חדר אוכל"], explanation: "\"dining room\" במשפט זה אומרת \"חדר אוכל\"", category: "vocabulary", type: "sentence-recording", englishWord: "dining room", hebrewWord: "חדר אוכל" },
    { id: 494, text: "הקליט את עצמך אומר את המשפט: \"The car is in the garage\" ואז בחר מה הפירוש של המילה \"garage\" במשפט:", sentence: "The car is in the garage", sentenceTranslation: "המכונית בחניה", correct: 0, options: ["חניה", "מרפסת", "גינה", "מרתף"], explanation: "\"garage\" במשפט זה אומרת \"חניה\"", category: "vocabulary", type: "sentence-recording", englishWord: "garage", hebrewWord: "חניה" },
    { id: 495, text: "הקליט את עצמך אומר את המשפט: \"I play in the garden\" ואז בחר מה הפירוש של המילה \"garden\" במשפט:", sentence: "I play in the garden", sentenceTranslation: "אני משחק בגינה", correct: 2, options: ["חניה", "מרפסת", "גינה", "מרתף"], explanation: "\"garden\" במשפט זה אומרת \"גינה\"", category: "vocabulary", type: "sentence-recording", englishWord: "garden", hebrewWord: "גינה" },
    { id: 496, text: "הקליט את עצמך אומר את המשפט: \"The refrigerator is cold\" ואז בחר מה הפירוש של המילה \"refrigerator\" במשפט:", sentence: "The refrigerator is cold", sentenceTranslation: "המקרר קר", correct: 0, options: ["מקרר", "תנור", "כיריים", "מדיח כלים"], explanation: "\"refrigerator\" במשפט זה אומרת \"מקרר\"", category: "vocabulary", type: "sentence-recording", englishWord: "refrigerator", hebrewWord: "מקרר" },
    { id: 497, text: "הקליט את עצמך אומר את המשפט: \"I bake in the oven\" ואז בחר מה הפירוש של המילה \"oven\" במשפט:", sentence: "I bake in the oven", sentenceTranslation: "אני אופה בתנור", correct: 1, options: ["מקרר", "תנור", "כיריים", "מדיח כלים"], explanation: "\"oven\" במשפט זה אומרת \"תנור\"", category: "vocabulary", type: "sentence-recording", englishWord: "oven", hebrewWord: "תנור" },
    { id: 498, text: "הקליט את עצמך אומר את המשפט: \"I cook on the stove\" ואז בחר מה הפירוש של המילה \"stove\" במשפט:", sentence: "I cook on the stove", sentenceTranslation: "אני מבשל על הכיריים", correct: 2, options: ["מקרר", "תנור", "כיריים", "מדיח כלים"], explanation: "\"stove\" במשפט זה אומרת \"כיריים\"", category: "vocabulary", type: "sentence-recording", englishWord: "stove", hebrewWord: "כיריים" },
    { id: 499, text: "הקליט את עצמך אומר את המשפט: \"The dishwasher is clean\" ואז בחר מה הפירוש של המילה \"dishwasher\" במשפט:", sentence: "The dishwasher is clean", sentenceTranslation: "מדיח הכלים נקי", correct: 3, options: ["מקרר", "תנור", "כיריים", "מדיח כלים"], explanation: "\"dishwasher\" במשפט זה אומרת \"מדיח כלים\"", category: "vocabulary", type: "sentence-recording", englishWord: "dishwasher", hebrewWord: "מדיח כלים" }
    ],
    '4': [ // רמה 4 - מתקדם - אוצר מילים בית ומשפחה מתקדם
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 500, text: "מה אומרת המילה \"stepmother\"?", options: ["אם חורגת", "אב חורג", "אח חורג", "אחות חורגת"], correct: 0, explanation: "\"stepmother\" אומרת \"אם חורגת\"", category: "vocabulary", type: "multiple-choice", englishWord: "stepmother", hebrewWord: "אם חורגת" },
    { id: 501, text: "מה אומרת המילה \"stepfather\"?", options: ["אם חורגת", "אב חורג", "אח חורג", "אחות חורגת"], correct: 1, explanation: "\"stepfather\" אומרת \"אב חורג\"", category: "vocabulary", type: "multiple-choice", englishWord: "stepfather", hebrewWord: "אב חורג" },
    { id: 502, text: "מה אומרת המילה \"basement\"?", options: ["מרתף", "עליית גג", "קומה", "מסדרון"], correct: 0, explanation: "\"basement\" אומרת \"מרתף\"", category: "vocabulary", type: "multiple-choice", englishWord: "basement", hebrewWord: "מרתף" },
    { id: 503, text: "מה אומרת המילה \"attic\"?", options: ["מרתף", "עליית גג", "קומה", "מסדרון"], correct: 1, explanation: "\"attic\" אומרת \"עליית גג\"", category: "vocabulary", type: "multiple-choice", englishWord: "attic", hebrewWord: "עליית גג" },
    { id: 504, text: "מה אומרת המילה \"hallway\"?", options: ["מרתף", "עליית גג", "קומה", "מסדרון"], correct: 3, explanation: "\"hallway\" אומרת \"מסדרון\"", category: "vocabulary", type: "multiple-choice", englishWord: "hallway", hebrewWord: "מסדרון" },
    { id: 505, text: "מה אומרת המילה \"ceiling\"?", options: ["תקרה", "רצפה", "קיר", "חלון"], correct: 0, explanation: "\"ceiling\" אומרת \"תקרה\"", category: "vocabulary", type: "multiple-choice", englishWord: "ceiling", hebrewWord: "תקרה" },
    { id: 506, text: "מה אומרת המילה \"floor\"?", options: ["תקרה", "רצפה", "קיר", "חלון"], correct: 1, explanation: "\"floor\" אומרת \"רצפה\"", category: "vocabulary", type: "multiple-choice", englishWord: "floor", hebrewWord: "רצפה" },
    { id: 507, text: "מה אומרת המילה \"wall\"?", options: ["תקרה", "רצפה", "קיר", "חלון"], correct: 2, explanation: "\"wall\" אומרת \"קיר\"", category: "vocabulary", type: "multiple-choice", englishWord: "wall", hebrewWord: "קיר" },
    { id: 508, text: "מה אומרת המילה \"microwave\"?", options: ["מיקרוגל", "מקרר", "תנור", "כיריים"], correct: 0, explanation: "\"microwave\" אומרת \"מיקרוגל\"", category: "vocabulary", type: "multiple-choice", englishWord: "microwave", hebrewWord: "מיקרוגל" },
    { id: 509, text: "מה אומרת המילה \"washing machine\"?", options: ["מכונת כביסה", "מדיח כלים", "מקרר", "תנור"], correct: 0, explanation: "\"washing machine\" אומרת \"מכונת כביסה\"", category: "vocabulary", type: "multiple-choice", englishWord: "washing machine", hebrewWord: "מכונת כביסה" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 510, text: "הכתיב את המילה \"אם חורגת\" באנגלית:", correct: "stepmother", explanation: "\"אם חורגת\" באנגלית זה \"stepmother\"", category: "vocabulary", type: "dictation", englishWord: "stepmother", hebrewWord: "אם חורגת" },
    { id: 511, text: "הכתיב את המילה \"אב חורג\" באנגלית:", correct: "stepfather", explanation: "\"אב חורג\" באנגלית זה \"stepfather\"", category: "vocabulary", type: "dictation", englishWord: "stepfather", hebrewWord: "אב חורג" },
    { id: 512, text: "הכתיב את המילה \"מרתף\" באנגלית:", correct: "basement", explanation: "\"מרתף\" באנגלית זה \"basement\"", category: "vocabulary", type: "dictation", englishWord: "basement", hebrewWord: "מרתף" },
    { id: 513, text: "הכתיב את המילה \"עליית גג\" באנגלית:", correct: "attic", explanation: "\"עליית גג\" באנגלית זה \"attic\"", category: "vocabulary", type: "dictation", englishWord: "attic", hebrewWord: "עליית גג" },
    { id: 514, text: "הכתיב את המילה \"מסדרון\" באנגלית:", correct: "hallway", explanation: "\"מסדרון\" באנגלית זה \"hallway\"", category: "vocabulary", type: "dictation", englishWord: "hallway", hebrewWord: "מסדרון" },
    { id: 515, text: "הכתיב את המילה \"תקרה\" באנגלית:", correct: "ceiling", explanation: "\"תקרה\" באנגלית זה \"ceiling\"", category: "vocabulary", type: "dictation", englishWord: "ceiling", hebrewWord: "תקרה" },
    { id: 516, text: "הכתיב את המילה \"רצפה\" באנגלית:", correct: "floor", explanation: "\"רצפה\" באנגלית זה \"floor\"", category: "vocabulary", type: "dictation", englishWord: "floor", hebrewWord: "רצפה" },
    { id: 517, text: "הכתיב את המילה \"קיר\" באנגלית:", correct: "wall", explanation: "\"קיר\" באנגלית זה \"wall\"", category: "vocabulary", type: "dictation", englishWord: "wall", hebrewWord: "קיר" },
    { id: 518, text: "הכתיב את המילה \"מיקרוגל\" באנגלית:", correct: "microwave", explanation: "\"מיקרוגל\" באנגלית זה \"microwave\"", category: "vocabulary", type: "dictation", englishWord: "microwave", hebrewWord: "מיקרוגל" },
    { id: 519, text: "הכתיב את המילה \"מכונת כביסה\" באנגלית:", correct: "washing machine", explanation: "\"מכונת כביסה\" באנגלית זה \"washing machine\"", category: "vocabulary", type: "dictation", englishWord: "washing machine", hebrewWord: "מכונת כביסה" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 520, text: "הקליט את עצמך אומר את המילה \"אם חורגת\" באנגלית:", correct: "stepmother", explanation: "\"אם חורגת\" באנגלית זה \"stepmother\"", category: "vocabulary", type: "recording", englishWord: "stepmother", hebrewWord: "אם חורגת" },
    { id: 521, text: "הקליט את עצמך אומר את המילה \"אב חורג\" באנגלית:", correct: "stepfather", explanation: "\"אב חורג\" באנגלית זה \"stepfather\"", category: "vocabulary", type: "recording", englishWord: "stepfather", hebrewWord: "אב חורג" },
    { id: 522, text: "הקליט את עצמך אומר את המילה \"מרתף\" באנגלית:", correct: "basement", explanation: "\"מרתף\" באנגלית זה \"basement\"", category: "vocabulary", type: "recording", englishWord: "basement", hebrewWord: "מרתף" },
    { id: 523, text: "הקליט את עצמך אומר את המילה \"עליית גג\" באנגלית:", correct: "attic", explanation: "\"עליית גג\" באנגלית זה \"attic\"", category: "vocabulary", type: "recording", englishWord: "attic", hebrewWord: "עליית גג" },
    { id: 524, text: "הקליט את עצמך אומר את המילה \"מסדרון\" באנגלית:", correct: "hallway", explanation: "\"מסדרון\" באנגלית זה \"hallway\"", category: "vocabulary", type: "recording", englishWord: "hallway", hebrewWord: "מסדרון" },
    { id: 525, text: "הקליט את עצמך אומר את המילה \"תקרה\" באנגלית:", correct: "ceiling", explanation: "\"תקרה\" באנגלית זה \"ceiling\"", category: "vocabulary", type: "recording", englishWord: "ceiling", hebrewWord: "תקרה" },
    { id: 526, text: "הקליט את עצמך אומר את המילה \"רצפה\" באנגלית:", correct: "floor", explanation: "\"רצפה\" באנגלית זה \"floor\"", category: "vocabulary", type: "recording", englishWord: "floor", hebrewWord: "רצפה" },
    { id: 527, text: "הקליט את עצמך אומר את המילה \"קיר\" באנגלית:", correct: "wall", explanation: "\"קיר\" באנגלית זה \"wall\"", category: "vocabulary", type: "recording", englishWord: "wall", hebrewWord: "קיר" },
    { id: 528, text: "הקליט את עצמך אומר את המילה \"מיקרוגל\" באנגלית:", correct: "microwave", explanation: "\"מיקרוגל\" באנגלית זה \"microwave\"", category: "vocabulary", type: "recording", englishWord: "microwave", hebrewWord: "מיקרוגל" },
    { id: 529, text: "הקליט את עצמך אומר את המילה \"מכונת כביסה\" באנגלית:", correct: "washing machine", explanation: "\"מכונת כביסה\" באנגלית זה \"washing machine\"", category: "vocabulary", type: "recording", englishWord: "washing machine", hebrewWord: "מכונת כביסה" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 530, text: "הקליט את עצמך אומר את המשפט: \"My stepmother is nice\" ואז בחר מה הפירוש של המילה \"stepmother\" במשפט:", sentence: "My stepmother is nice", sentenceTranslation: "אם החורגת שלי נחמדה", correct: 0, options: ["אם חורגת", "אב חורג", "אח חורג", "אחות חורגת"], explanation: "\"stepmother\" במשפט זה אומרת \"אם חורגת\"", category: "vocabulary", type: "sentence-recording", englishWord: "stepmother", hebrewWord: "אם חורגת" },
    { id: 531, text: "הקליט את עצמך אומר את המשפט: \"My stepfather works\" ואז בחר מה הפירוש של המילה \"stepfather\" במשפט:", sentence: "My stepfather works", sentenceTranslation: "אב החורג שלי עובד", correct: 1, options: ["אם חורגת", "אב חורג", "אח חורג", "אחות חורגת"], explanation: "\"stepfather\" במשפט זה אומרת \"אב חורג\"", category: "vocabulary", type: "sentence-recording", englishWord: "stepfather", hebrewWord: "אב חורג" },
    { id: 532, text: "הקליט את עצמך אומר את המשפט: \"I go to the basement\" ואז בחר מה הפירוש של המילה \"basement\" במשפט:", sentence: "I go to the basement", sentenceTranslation: "אני הולך למרתף", correct: 0, options: ["מרתף", "עליית גג", "קומה", "מסדרון"], explanation: "\"basement\" במשפט זה אומרת \"מרתף\"", category: "vocabulary", type: "sentence-recording", englishWord: "basement", hebrewWord: "מרתף" },
    { id: 533, text: "הקליט את עצמך אומר את המשפט: \"I store things in the attic\" ואז בחר מה הפירוש של המילה \"attic\" במשפט:", sentence: "I store things in the attic", sentenceTranslation: "אני שומר דברים בעליית הגג", correct: 1, options: ["מרתף", "עליית גג", "קומה", "מסדרון"], explanation: "\"attic\" במשפט זה אומרת \"עליית גג\"", category: "vocabulary", type: "sentence-recording", englishWord: "attic", hebrewWord: "עליית גג" },
    { id: 534, text: "הקליט את עצמך אומר את המשפט: \"I walk in the hallway\" ואז בחר מה הפירוש של המילה \"hallway\" במשפט:", sentence: "I walk in the hallway", sentenceTranslation: "אני הולך במסדרון", correct: 3, options: ["מרתף", "עליית גג", "קומה", "מסדרון"], explanation: "\"hallway\" במשפט זה אומרת \"מסדרון\"", category: "vocabulary", type: "sentence-recording", englishWord: "hallway", hebrewWord: "מסדרון" },
    { id: 535, text: "הקליט את עצמך אומר את המשפט: \"The ceiling is high\" ואז בחר מה הפירוש של המילה \"ceiling\" במשפט:", sentence: "The ceiling is high", sentenceTranslation: "התיקרה גבוהה", correct: 0, options: ["תקרה", "רצפה", "קיר", "חלון"], explanation: "\"ceiling\" במשפט זה אומרת \"תקרה\"", category: "vocabulary", type: "sentence-recording", englishWord: "ceiling", hebrewWord: "תקרה" },
    { id: 536, text: "הקליט את עצמך אומר את המשפט: \"I clean the floor\" ואז בחר מה הפירוש של המילה \"floor\" במשפט:", sentence: "I clean the floor", sentenceTranslation: "אני מנקה את הרצפה", correct: 1, options: ["תקרה", "רצפה", "קיר", "חלון"], explanation: "\"floor\" במשפט זה אומרת \"רצפה\"", category: "vocabulary", type: "sentence-recording", englishWord: "floor", hebrewWord: "רצפה" },
    { id: 537, text: "הקליט את עצמך אומר את המשפט: \"I hang a picture on the wall\" ואז בחר מה הפירוש של המילה \"wall\" במשפט:", sentence: "I hang a picture on the wall", sentenceTranslation: "אני תולה תמונה על הקיר", correct: 2, options: ["תקרה", "רצפה", "קיר", "חלון"], explanation: "\"wall\" במשפט זה אומרת \"קיר\"", category: "vocabulary", type: "sentence-recording", englishWord: "wall", hebrewWord: "קיר" },
    { id: 538, text: "הקליט את עצמך אומר את המשפט: \"I heat food in the microwave\" ואז בחר מה הפירוש של המילה \"microwave\" במשפט:", sentence: "I heat food in the microwave", sentenceTranslation: "אני מחמם אוכל במיקרוגל", correct: 0, options: ["מיקרוגל", "מקרר", "תנור", "כיריים"], explanation: "\"microwave\" במשפט זה אומרת \"מיקרוגל\"", category: "vocabulary", type: "sentence-recording", englishWord: "microwave", hebrewWord: "מיקרוגל" },
    { id: 539, text: "הקליט את עצמך אומר את המשפט: \"The washing machine works\" ואז בחר מה הפירוש של המילה \"washing machine\" במשפט:", sentence: "The washing machine works", sentenceTranslation: "מכונת הכביסה עובדת", correct: 0, options: ["מכונת כביסה", "מדיח כלים", "מקרר", "תנור"], explanation: "\"washing machine\" במשפט זה אומרת \"מכונת כביסה\"", category: "vocabulary", type: "sentence-recording", englishWord: "washing machine", hebrewWord: "מכונת כביסה" }
    ],
    '5': [ // רמה 5 - מומחה - אוצר מילים בית ומשפחה מומחה
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 540, text: "מה אומרת המילה \"mother-in-law\"?", options: ["חמות", "חם", "גיסה", "גיס"], correct: 0, explanation: "\"mother-in-law\" אומרת \"חמות\"", category: "vocabulary", type: "multiple-choice", englishWord: "mother-in-law", hebrewWord: "חמות" },
    { id: 541, text: "מה אומרת המילה \"father-in-law\"?", options: ["חמות", "חם", "גיסה", "גיס"], correct: 1, explanation: "\"father-in-law\" אומרת \"חם\"", category: "vocabulary", type: "multiple-choice", englishWord: "father-in-law", hebrewWord: "חם" },
    { id: 542, text: "מה אומרת המילה \"sister-in-law\"?", options: ["חמות", "חם", "גיסה", "גיס"], correct: 2, explanation: "\"sister-in-law\" אומרת \"גיסה\"", category: "vocabulary", type: "multiple-choice", englishWord: "sister-in-law", hebrewWord: "גיסה" },
    { id: 543, text: "מה אומרת המילה \"brother-in-law\"?", options: ["חמות", "חם", "גיסה", "גיס"], correct: 3, explanation: "\"brother-in-law\" אומרת \"גיס\"", category: "vocabulary", type: "multiple-choice", englishWord: "brother-in-law", hebrewWord: "גיס" },
    { id: 544, text: "מה אומרת המילה \"study room\"?", options: ["חדר לימוד", "חדר שינה", "חדר אוכל", "חדר אורחים"], correct: 0, explanation: "\"study room\" אומרת \"חדר לימוד\"", category: "vocabulary", type: "multiple-choice", englishWord: "study room", hebrewWord: "חדר לימוד" },
    { id: 545, text: "מה אומרת המילה \"guest room\"?", options: ["חדר לימוד", "חדר שינה", "חדר אוכל", "חדר אורחים"], correct: 3, explanation: "\"guest room\" אומרת \"חדר אורחים\"", category: "vocabulary", type: "multiple-choice", englishWord: "guest room", hebrewWord: "חדר אורחים" },
    { id: 546, text: "מה אומרת המילה \"bookshelf\"?", options: ["מדף ספרים", "שולחן כתיבה", "כורסה", "מנורה"], correct: 0, explanation: "\"bookshelf\" אומרת \"מדף ספרים\"", category: "vocabulary", type: "multiple-choice", englishWord: "bookshelf", hebrewWord: "מדף ספרים" },
    { id: 547, text: "מה אומרת המילה \"desk\"?", options: ["מדף ספרים", "שולחן כתיבה", "כורסה", "מנורה"], correct: 1, explanation: "\"desk\" אומרת \"שולחן כתיבה\"", category: "vocabulary", type: "multiple-choice", englishWord: "desk", hebrewWord: "שולחן כתיבה" },
    { id: 548, text: "מה אומרת המילה \"armchair\"?", options: ["מדף ספרים", "שולחן כתיבה", "כורסה", "מנורה"], correct: 2, explanation: "\"armchair\" אומרת \"כורסה\"", category: "vocabulary", type: "multiple-choice", englishWord: "armchair", hebrewWord: "כורסה" },
    { id: 549, text: "מה אומרת המילה \"vacuum cleaner\"?", options: ["שואב אבק", "מטאטא", "מגב", "סמרטוט"], correct: 0, explanation: "\"vacuum cleaner\" אומרת \"שואב אבק\"", category: "vocabulary", type: "multiple-choice", englishWord: "vacuum cleaner", hebrewWord: "שואב אבק" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 550, text: "הכתיב את המילה \"חמות\" באנגלית:", correct: "mother-in-law", explanation: "\"חמות\" באנגלית זה \"mother-in-law\"", category: "vocabulary", type: "dictation", englishWord: "mother-in-law", hebrewWord: "חמות" },
    { id: 551, text: "הכתיב את המילה \"חם\" באנגלית:", correct: "father-in-law", explanation: "\"חם\" באנגלית זה \"father-in-law\"", category: "vocabulary", type: "dictation", englishWord: "father-in-law", hebrewWord: "חם" },
    { id: 552, text: "הכתיב את המילה \"גיסה\" באנגלית:", correct: "sister-in-law", explanation: "\"גיסה\" באנגלית זה \"sister-in-law\"", category: "vocabulary", type: "dictation", englishWord: "sister-in-law", hebrewWord: "גיסה" },
    { id: 553, text: "הכתיב את המילה \"גיס\" באנגלית:", correct: "brother-in-law", explanation: "\"גיס\" באנגלית זה \"brother-in-law\"", category: "vocabulary", type: "dictation", englishWord: "brother-in-law", hebrewWord: "גיס" },
    { id: 554, text: "הכתיב את המילה \"חדר לימוד\" באנגלית:", correct: "study room", explanation: "\"חדר לימוד\" באנגלית זה \"study room\"", category: "vocabulary", type: "dictation", englishWord: "study room", hebrewWord: "חדר לימוד" },
    { id: 555, text: "הכתיב את המילה \"חדר אורחים\" באנגלית:", correct: "guest room", explanation: "\"חדר אורחים\" באנגלית זה \"guest room\"", category: "vocabulary", type: "dictation", englishWord: "guest room", hebrewWord: "חדר אורחים" },
    { id: 556, text: "הכתיב את המילה \"מדף ספרים\" באנגלית:", correct: "bookshelf", explanation: "\"מדף ספרים\" באנגלית זה \"bookshelf\"", category: "vocabulary", type: "dictation", englishWord: "bookshelf", hebrewWord: "מדף ספרים" },
    { id: 557, text: "הכתיב את המילה \"שולחן כתיבה\" באנגלית:", correct: "desk", explanation: "\"שולחן כתיבה\" באנגלית זה \"desk\"", category: "vocabulary", type: "dictation", englishWord: "desk", hebrewWord: "שולחן כתיבה" },
    { id: 558, text: "הכתיב את המילה \"כורסה\" באנגלית:", correct: "armchair", explanation: "\"כורסה\" באנגלית זה \"armchair\"", category: "vocabulary", type: "dictation", englishWord: "armchair", hebrewWord: "כורסה" },
    { id: 559, text: "הכתיב את המילה \"שואב אבק\" באנגלית:", correct: "vacuum cleaner", explanation: "\"שואב אבק\" באנגלית זה \"vacuum cleaner\"", category: "vocabulary", type: "dictation", englishWord: "vacuum cleaner", hebrewWord: "שואב אבק" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 560, text: "הקליט את עצמך אומר את המילה \"חמות\" באנגלית:", correct: "mother-in-law", explanation: "\"חמות\" באנגלית זה \"mother-in-law\"", category: "vocabulary", type: "recording", englishWord: "mother-in-law", hebrewWord: "חמות" },
    { id: 561, text: "הקליט את עצמך אומר את המילה \"חם\" באנגלית:", correct: "father-in-law", explanation: "\"חם\" באנגלית זה \"father-in-law\"", category: "vocabulary", type: "recording", englishWord: "father-in-law", hebrewWord: "חם" },
    { id: 562, text: "הקליט את עצמך אומר את המילה \"גיסה\" באנגלית:", correct: "sister-in-law", explanation: "\"גיסה\" באנגלית זה \"sister-in-law\"", category: "vocabulary", type: "recording", englishWord: "sister-in-law", hebrewWord: "גיסה" },
    { id: 563, text: "הקליט את עצמך אומר את המילה \"גיס\" באנגלית:", correct: "brother-in-law", explanation: "\"גיס\" באנגלית זה \"brother-in-law\"", category: "vocabulary", type: "recording", englishWord: "brother-in-law", hebrewWord: "גיס" },
    { id: 564, text: "הקליט את עצמך אומר את המילה \"חדר לימוד\" באנגלית:", correct: "study room", explanation: "\"חדר לימוד\" באנגלית זה \"study room\"", category: "vocabulary", type: "recording", englishWord: "study room", hebrewWord: "חדר לימוד" },
    { id: 565, text: "הקליט את עצמך אומר את המילה \"חדר אורחים\" באנגלית:", correct: "guest room", explanation: "\"חדר אורחים\" באנגלית זה \"guest room\"", category: "vocabulary", type: "recording", englishWord: "guest room", hebrewWord: "חדר אורחים" },
    { id: 566, text: "הקליט את עצמך אומר את המילה \"מדף ספרים\" באנגלית:", correct: "bookshelf", explanation: "\"מדף ספרים\" באנגלית זה \"bookshelf\"", category: "vocabulary", type: "recording", englishWord: "bookshelf", hebrewWord: "מדף ספרים" },
    { id: 567, text: "הקליט את עצמך אומר את המילה \"שולחן כתיבה\" באנגלית:", correct: "desk", explanation: "\"שולחן כתיבה\" באנגלית זה \"desk\"", category: "vocabulary", type: "recording", englishWord: "desk", hebrewWord: "שולחן כתיבה" },
    { id: 568, text: "הקליט את עצמך אומר את המילה \"כורסה\" באנגלית:", correct: "armchair", explanation: "\"כורסה\" באנגלית זה \"armchair\"", category: "vocabulary", type: "recording", englishWord: "armchair", hebrewWord: "כורסה" },
    { id: 569, text: "הקליט את עצמך אומר את המילה \"שואב אבק\" באנגלית:", correct: "vacuum cleaner", explanation: "\"שואב אבק\" באנגלית זה \"vacuum cleaner\"", category: "vocabulary", type: "recording", englishWord: "vacuum cleaner", hebrewWord: "שואב אבק" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 570, text: "הקליט את עצמך אומר את המשפט: \"I visit my mother-in-law\" ואז בחר מה הפירוש של המילה \"mother-in-law\" במשפט:", sentence: "I visit my mother-in-law", sentenceTranslation: "אני מבקר את החמות שלי", correct: 0, options: ["חמות", "חם", "גיסה", "גיס"], explanation: "\"mother-in-law\" במשפט זה אומרת \"חמות\"", category: "vocabulary", type: "sentence-recording", englishWord: "mother-in-law", hebrewWord: "חמות" },
    { id: 571, text: "הקליט את עצמך אומר את המשפט: \"My father-in-law is kind\" ואז בחר מה הפירוש של המילה \"father-in-law\" במשפט:", sentence: "My father-in-law is kind", sentenceTranslation: "החם שלי נחמד", correct: 1, options: ["חמות", "חם", "גיסה", "גיס"], explanation: "\"father-in-law\" במשפט זה אומרת \"חם\"", category: "vocabulary", type: "sentence-recording", englishWord: "father-in-law", hebrewWord: "חם" },
    { id: 572, text: "הקליט את עצמך אומר את המשפט: \"My sister-in-law is smart\" ואז בחר מה הפירוש של המילה \"sister-in-law\" במשפט:", sentence: "My sister-in-law is smart", sentenceTranslation: "הגיסה שלי חכמה", correct: 2, options: ["חמות", "חם", "גיסה", "גיס"], explanation: "\"sister-in-law\" במשפט זה אומרת \"גיסה\"", category: "vocabulary", type: "sentence-recording", englishWord: "sister-in-law", hebrewWord: "גיסה" },
    { id: 573, text: "הקליט את עצמך אומר את המשפט: \"I talk to my brother-in-law\" ואז בחר מה הפירוש של המילה \"brother-in-law\" במשפט:", sentence: "I talk to my brother-in-law", sentenceTranslation: "אני מדבר עם הגיס שלי", correct: 3, options: ["חמות", "חם", "גיסה", "גיס"], explanation: "\"brother-in-law\" במשפט זה אומרת \"גיס\"", category: "vocabulary", type: "sentence-recording", englishWord: "brother-in-law", hebrewWord: "גיס" },
    { id: 574, text: "הקליט את עצמך אומר את המשפט: \"I study in the study room\" ואז בחר מה הפירוש של המילה \"study room\" במשפט:", sentence: "I study in the study room", sentenceTranslation: "אני לומד בחדר הלימוד", correct: 0, options: ["חדר לימוד", "חדר שינה", "חדר אוכל", "חדר אורחים"], explanation: "\"study room\" במשפט זה אומרת \"חדר לימוד\"", category: "vocabulary", type: "sentence-recording", englishWord: "study room", hebrewWord: "חדר לימוד" },
    { id: 575, text: "הקליט את עצמך אומר את המשפט: \"Guests sleep in the guest room\" ואז בחר מה הפירוש של המילה \"guest room\" במשפט:", sentence: "Guests sleep in the guest room", sentenceTranslation: "אורחים ישנים בחדר האורחים", correct: 3, options: ["חדר לימוד", "חדר שינה", "חדר אוכל", "חדר אורחים"], explanation: "\"guest room\" במשפט זה אומרת \"חדר אורחים\"", category: "vocabulary", type: "sentence-recording", englishWord: "guest room", hebrewWord: "חדר אורחים" },
    { id: 576, text: "הקליט את עצמך אומר את המשפט: \"I put books on the bookshelf\" ואז בחר מה הפירוש של המילה \"bookshelf\" במשפט:", sentence: "I put books on the bookshelf", sentenceTranslation: "אני שם ספרים על מדף הספרים", correct: 0, options: ["מדף ספרים", "שולחן כתיבה", "כורסה", "מנורה"], explanation: "\"bookshelf\" במשפט זה אומרת \"מדף ספרים\"", category: "vocabulary", type: "sentence-recording", englishWord: "bookshelf", hebrewWord: "מדף ספרים" },
    { id: 577, text: "הקליט את עצמך אומר את המשפט: \"I write at my desk\" ואז בחר מה הפירוש של המילה \"desk\" במשפט:", sentence: "I write at my desk", sentenceTranslation: "אני כותב בשולחן הכתיבה שלי", correct: 1, options: ["מדף ספרים", "שולחן כתיבה", "כורסה", "מנורה"], explanation: "\"desk\" במשפט זה אומרת \"שולחן כתיבה\"", category: "vocabulary", type: "sentence-recording", englishWord: "desk", hebrewWord: "שולחן כתיבה" },
    { id: 578, text: "הקליט את עצמך אומר את המשפט: \"I sit in the armchair\" ואז בחר מה הפירוש של המילה \"armchair\" במשפט:", sentence: "I sit in the armchair", sentenceTranslation: "אני יושב בכורסה", correct: 2, options: ["מדף ספרים", "שולחן כתיבה", "כורסה", "מנורה"], explanation: "\"armchair\" במשפט זה אומרת \"כורסה\"", category: "vocabulary", type: "sentence-recording", englishWord: "armchair", hebrewWord: "כורסה" },
    { id: 579, text: "הקליט את עצמך אומר את המשפט: \"I clean with the vacuum cleaner\" ואז בחר מה הפירוש של המילה \"vacuum cleaner\" במשפט:", sentence: "I clean with the vacuum cleaner", sentenceTranslation: "אני מנקה עם שואב האבק", correct: 0, options: ["שואב אבק", "מטאטא", "מגב", "סמרטוט"], explanation: "\"vacuum cleaner\" במשפט זה אומרת \"שואב אבק\"", category: "vocabulary", type: "sentence-recording", englishWord: "vacuum cleaner", hebrewWord: "שואב אבק" }
    ]
  },
  '3': { // יחידה 3 - אוכל ושתייה
    '1': [ // רמה 1 - מתחילים - אוצר מילים אוכל ומזון בסיסי
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 580, text: "מה אומרת המילה \"bread\"?", options: ["לחם", "חלב", "ביצה", "עגבנייה"], correct: 0, explanation: "\"bread\" אומרת \"לחם\"", category: "vocabulary", type: "multiple-choice", englishWord: "bread", hebrewWord: "לחם" },
    { id: 581, text: "מה אומרת המילה \"milk\"?", options: ["לחם", "חלב", "ביצה", "עגבנייה"], correct: 1, explanation: "\"milk\" אומרת \"חלב\"", category: "vocabulary", type: "multiple-choice", englishWord: "milk", hebrewWord: "חלב" },
    { id: 582, text: "מה אומרת המילה \"egg\"?", options: ["לחם", "חלב", "ביצה", "עגבנייה"], correct: 2, explanation: "\"egg\" אומרת \"ביצה\"", category: "vocabulary", type: "multiple-choice", englishWord: "egg", hebrewWord: "ביצה" },
    { id: 583, text: "מה אומרת המילה \"tomato\"?", options: ["לחם", "חלב", "ביצה", "עגבנייה"], correct: 3, explanation: "\"tomato\" אומרת \"עגבנייה\"", category: "vocabulary", type: "multiple-choice", englishWord: "tomato", hebrewWord: "עגבנייה" },
    { id: 584, text: "מה אומרת המילה \"cheese\"?", options: ["גבינה", "חמאה", "יוגורט", "דבש"], correct: 0, explanation: "\"cheese\" אומרת \"גבינה\"", category: "vocabulary", type: "multiple-choice", englishWord: "cheese", hebrewWord: "גבינה" },
    { id: 585, text: "מה אומרת המילה \"butter\"?", options: ["גבינה", "חמאה", "יוגורט", "דבש"], correct: 1, explanation: "\"butter\" אומרת \"חמאה\"", category: "vocabulary", type: "multiple-choice", englishWord: "butter", hebrewWord: "חמאה" },
    { id: 586, text: "מה אומרת המילה \"yogurt\"?", options: ["גבינה", "חמאה", "יוגורט", "דבש"], correct: 2, explanation: "\"yogurt\" אומרת \"יוגורט\"", category: "vocabulary", type: "multiple-choice", englishWord: "yogurt", hebrewWord: "יוגורט" },
    { id: 587, text: "מה אומרת המילה \"honey\"?", options: ["גבינה", "חמאה", "יוגורט", "דבש"], correct: 3, explanation: "\"honey\" אומרת \"דבש\"", category: "vocabulary", type: "multiple-choice", englishWord: "honey", hebrewWord: "דבש" },
    { id: 588, text: "מה אומרת המילה \"water\"?", options: ["מים", "מיץ", "קפה", "תה"], correct: 0, explanation: "\"water\" אומרת \"מים\"", category: "vocabulary", type: "multiple-choice", englishWord: "water", hebrewWord: "מים" },
    { id: 589, text: "מה אומרת המילה \"juice\"?", options: ["מים", "מיץ", "קפה", "תה"], correct: 1, explanation: "\"juice\" אומרת \"מיץ\"", category: "vocabulary", type: "multiple-choice", englishWord: "juice", hebrewWord: "מיץ" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 590, text: "הכתיב את המילה \"לחם\" באנגלית:", correct: "bread", explanation: "\"לחם\" באנגלית זה \"bread\"", category: "vocabulary", type: "dictation", englishWord: "bread", hebrewWord: "לחם" },
    { id: 591, text: "הכתיב את המילה \"חלב\" באנגלית:", correct: "milk", explanation: "\"חלב\" באנגלית זה \"milk\"", category: "vocabulary", type: "dictation", englishWord: "milk", hebrewWord: "חלב" },
    { id: 592, text: "הכתיב את המילה \"ביצה\" באנגלית:", correct: "egg", explanation: "\"ביצה\" באנגלית זה \"egg\"", category: "vocabulary", type: "dictation", englishWord: "egg", hebrewWord: "ביצה" },
    { id: 593, text: "הכתיב את המילה \"עגבנייה\" באנגלית:", correct: "tomato", explanation: "\"עגבנייה\" באנגלית זה \"tomato\"", category: "vocabulary", type: "dictation", englishWord: "tomato", hebrewWord: "עגבנייה" },
    { id: 594, text: "הכתיב את המילה \"גבינה\" באנגלית:", correct: "cheese", explanation: "\"גבינה\" באנגלית זה \"cheese\"", category: "vocabulary", type: "dictation", englishWord: "cheese", hebrewWord: "גבינה" },
    { id: 595, text: "הכתיב את המילה \"חמאה\" באנגלית:", correct: "butter", explanation: "\"חמאה\" באנגלית זה \"butter\"", category: "vocabulary", type: "dictation", englishWord: "butter", hebrewWord: "חמאה" },
    { id: 596, text: "הכתיב את המילה \"יוגורט\" באנגלית:", correct: "yogurt", explanation: "\"יוגורט\" באנגלית זה \"yogurt\"", category: "vocabulary", type: "dictation", englishWord: "yogurt", hebrewWord: "יוגורט" },
    { id: 597, text: "הכתיב את המילה \"דבש\" באנגלית:", correct: "honey", explanation: "\"דבש\" באנגלית זה \"honey\"", category: "vocabulary", type: "dictation", englishWord: "honey", hebrewWord: "דבש" },
    { id: 598, text: "הכתיב את המילה \"מים\" באנגלית:", correct: "water", explanation: "\"מים\" באנגלית זה \"water\"", category: "vocabulary", type: "dictation", englishWord: "water", hebrewWord: "מים" },
    { id: 599, text: "הכתיב את המילה \"מיץ\" באנגלית:", correct: "juice", explanation: "\"מיץ\" באנגלית זה \"juice\"", category: "vocabulary", type: "dictation", englishWord: "juice", hebrewWord: "מיץ" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 600, text: "הקליט את עצמך אומר את המילה \"לחם\" באנגלית:", correct: "bread", explanation: "\"לחם\" באנגלית זה \"bread\"", category: "vocabulary", type: "recording", englishWord: "bread", hebrewWord: "לחם" },
    { id: 601, text: "הקליט את עצמך אומר את המילה \"חלב\" באנגלית:", correct: "milk", explanation: "\"חלב\" באנגלית זה \"milk\"", category: "vocabulary", type: "recording", englishWord: "milk", hebrewWord: "חלב" },
    { id: 602, text: "הקליט את עצמך אומר את המילה \"ביצה\" באנגלית:", correct: "egg", explanation: "\"ביצה\" באנגלית זה \"egg\"", category: "vocabulary", type: "recording", englishWord: "egg", hebrewWord: "ביצה" },
    { id: 603, text: "הקליט את עצמך אומר את המילה \"עגבנייה\" באנגלית:", correct: "tomato", explanation: "\"עגבנייה\" באנגלית זה \"tomato\"", category: "vocabulary", type: "recording", englishWord: "tomato", hebrewWord: "עגבנייה" },
    { id: 604, text: "הקליט את עצמך אומר את המילה \"גבינה\" באנגלית:", correct: "cheese", explanation: "\"גבינה\" באנגלית זה \"cheese\"", category: "vocabulary", type: "recording", englishWord: "cheese", hebrewWord: "גבינה" },
    { id: 605, text: "הקליט את עצמך אומר את המילה \"חמאה\" באנגלית:", correct: "butter", explanation: "\"חמאה\" באנגלית זה \"butter\"", category: "vocabulary", type: "recording", englishWord: "butter", hebrewWord: "חמאה" },
    { id: 606, text: "הקליט את עצמך אומר את המילה \"יוגורט\" באנגלית:", correct: "yogurt", explanation: "\"יוגורט\" באנגלית זה \"yogurt\"", category: "vocabulary", type: "recording", englishWord: "yogurt", hebrewWord: "יוגורט" },
    { id: 607, text: "הקליט את עצמך אומר את המילה \"דבש\" באנגלית:", correct: "honey", explanation: "\"דבש\" באנגלית זה \"honey\"", category: "vocabulary", type: "recording", englishWord: "honey", hebrewWord: "דבש" },
    { id: 608, text: "הקליט את עצמך אומר את המילה \"מים\" באנגלית:", correct: "water", explanation: "\"מים\" באנגלית זה \"water\"", category: "vocabulary", type: "recording", englishWord: "water", hebrewWord: "מים" },
    { id: 609, text: "הקליט את עצמך אומר את המילה \"מיץ\" באנגלית:", correct: "juice", explanation: "\"מיץ\" באנגלית זה \"juice\"", category: "vocabulary", type: "recording", englishWord: "juice", hebrewWord: "מיץ" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 610, text: "הקליט את עצמך אומר את המשפט: \"I eat bread\" ואז בחר מה הפירוש של המילה \"bread\" במשפט:", sentence: "I eat bread", sentenceTranslation: "אני אוכל לחם", correct: 0, options: ["לחם", "חלב", "ביצה", "עגבנייה"], explanation: "\"bread\" במשפט זה אומרת \"לחם\"", category: "vocabulary", type: "sentence-recording", englishWord: "bread", hebrewWord: "לחם" },
    { id: 611, text: "הקליט את עצמך אומר את המשפט: \"I drink milk\" ואז בחר מה הפירוש של המילה \"milk\" במשפט:", sentence: "I drink milk", sentenceTranslation: "אני שותה חלב", correct: 1, options: ["לחם", "חלב", "ביצה", "עגבנייה"], explanation: "\"milk\" במשפט זה אומרת \"חלב\"", category: "vocabulary", type: "sentence-recording", englishWord: "milk", hebrewWord: "חלב" },
    { id: 612, text: "הקליט את עצמך אומר את המשפט: \"I cook an egg\" ואז בחר מה הפירוש של המילה \"egg\" במשפט:", sentence: "I cook an egg", sentenceTranslation: "אני מבשל ביצה", correct: 2, options: ["לחם", "חלב", "ביצה", "עגבנייה"], explanation: "\"egg\" במשפט זה אומרת \"ביצה\"", category: "vocabulary", type: "sentence-recording", englishWord: "egg", hebrewWord: "ביצה" },
    { id: 613, text: "הקליט את עצמך אומר את המשפט: \"I cut a tomato\" ואז בחר מה הפירוש של המילה \"tomato\" במשפט:", sentence: "I cut a tomato", sentenceTranslation: "אני חותך עגבנייה", correct: 3, options: ["לחם", "חלב", "ביצה", "עגבנייה"], explanation: "\"tomato\" במשפט זה אומרת \"עגבנייה\"", category: "vocabulary", type: "sentence-recording", englishWord: "tomato", hebrewWord: "עגבנייה" },
    { id: 614, text: "הקליט את עצמך אומר את המשפט: \"I like cheese\" ואז בחר מה הפירוש של המילה \"cheese\" במשפט:", sentence: "I like cheese", sentenceTranslation: "אני אוהב גבינה", correct: 0, options: ["גבינה", "חמאה", "יוגורט", "דבש"], explanation: "\"cheese\" במשפט זה אומרת \"גבינה\"", category: "vocabulary", type: "sentence-recording", englishWord: "cheese", hebrewWord: "גבינה" },
    { id: 615, text: "הקליט את עצמך אומר את המשפט: \"I spread butter\" ואז בחר מה הפירוש של המילה \"butter\" במשפט:", sentence: "I spread butter", sentenceTranslation: "אני מורח חמאה", correct: 1, options: ["גבינה", "חמאה", "יוגורט", "דבש"], explanation: "\"butter\" במשפט זה אומרת \"חמאה\"", category: "vocabulary", type: "sentence-recording", englishWord: "butter", hebrewWord: "חמאה" },
    { id: 616, text: "הקליט את עצמך אומר את המשפט: \"I eat yogurt\" ואז בחר מה הפירוש של המילה \"yogurt\" במשפט:", sentence: "I eat yogurt", sentenceTranslation: "אני אוכל יוגורט", correct: 2, options: ["גבינה", "חמאה", "יוגורט", "דבש"], explanation: "\"yogurt\" במשפט זה אומרת \"יוגורט\"", category: "vocabulary", type: "sentence-recording", englishWord: "yogurt", hebrewWord: "יוגורט" },
    { id: 617, text: "הקליט את עצמך אומר את המשפט: \"I put honey\" ואז בחר מה הפירוש של המילה \"honey\" במשפט:", sentence: "I put honey", sentenceTranslation: "אני שם דבש", correct: 3, options: ["גבינה", "חמאה", "יוגורט", "דבש"], explanation: "\"honey\" במשפט זה אומרת \"דבש\"", category: "vocabulary", type: "sentence-recording", englishWord: "honey", hebrewWord: "דבש" },
    { id: 618, text: "הקליט את עצמך אומר את המשפט: \"I drink water\" ואז בחר מה הפירוש של המילה \"water\" במשפט:", sentence: "I drink water", sentenceTranslation: "אני שותה מים", correct: 0, options: ["מים", "מיץ", "קפה", "תה"], explanation: "\"water\" במשפט זה אומרת \"מים\"", category: "vocabulary", type: "sentence-recording", englishWord: "water", hebrewWord: "מים" },
    { id: 619, text: "הקליט את עצמך אומר את המשפט: \"I pour juice\" ואז בחר מה הפירוש של המילה \"juice\" במשפט:", sentence: "I pour juice", sentenceTranslation: "אני שופך מיץ", correct: 1, options: ["מים", "מיץ", "קפה", "תה"], explanation: "\"juice\" במשפט זה אומרת \"מיץ\"", category: "vocabulary", type: "sentence-recording", englishWord: "juice", hebrewWord: "מיץ" }
    ],
    '2': [ // רמה 2 - בסיסי - אוצר מילים אוכל ומזון מתקדם יותר
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 620, text: "מה אומרת המילה \"coffee\"?", options: ["מים", "מיץ", "קפה", "תה"], correct: 2, explanation: "\"coffee\" אומרת \"קפה\"", category: "vocabulary", type: "multiple-choice", englishWord: "coffee", hebrewWord: "קפה" },
    { id: 621, text: "מה אומרת המילה \"tea\"?", options: ["מים", "מיץ", "קפה", "תה"], correct: 3, explanation: "\"tea\" אומרת \"תה\"", category: "vocabulary", type: "multiple-choice", englishWord: "tea", hebrewWord: "תה" },
    { id: 622, text: "מה אומרת המילה \"chicken\"?", options: ["עוף", "בשר", "דג", "פסטה"], correct: 0, explanation: "\"chicken\" אומרת \"עוף\"", category: "vocabulary", type: "multiple-choice", englishWord: "chicken", hebrewWord: "עוף" },
    { id: 623, text: "מה אומרת המילה \"meat\"?", options: ["עוף", "בשר", "דג", "פסטה"], correct: 1, explanation: "\"meat\" אומרת \"בשר\"", category: "vocabulary", type: "multiple-choice", englishWord: "meat", hebrewWord: "בשר" },
    { id: 624, text: "מה אומרת המילה \"fish\"?", options: ["עוף", "בשר", "דג", "פסטה"], correct: 2, explanation: "\"fish\" אומרת \"דג\"", category: "vocabulary", type: "multiple-choice", englishWord: "fish", hebrewWord: "דג" },
    { id: 625, text: "מה אומרת המילה \"pasta\"?", options: ["עוף", "בשר", "דג", "פסטה"], correct: 3, explanation: "\"pasta\" אומרת \"פסטה\"", category: "vocabulary", type: "multiple-choice", englishWord: "pasta", hebrewWord: "פסטה" },
    { id: 626, text: "מה אומרת המילה \"rice\"?", options: ["אורז", "לחם", "תפוח אדמה", "בצל"], correct: 0, explanation: "\"rice\" אומרת \"אורז\"", category: "vocabulary", type: "multiple-choice", englishWord: "rice", hebrewWord: "אורז" },
    { id: 627, text: "מה אומרת המילה \"potato\"?", options: ["אורז", "לחם", "תפוח אדמה", "בצל"], correct: 2, explanation: "\"potato\" אומרת \"תפוח אדמה\"", category: "vocabulary", type: "multiple-choice", englishWord: "potato", hebrewWord: "תפוח אדמה" },
    { id: 628, text: "מה אומרת המילה \"onion\"?", options: ["אורז", "לחם", "תפוח אדמה", "בצל"], correct: 3, explanation: "\"onion\" אומרת \"בצל\"", category: "vocabulary", type: "multiple-choice", englishWord: "onion", hebrewWord: "בצל" },
    { id: 629, text: "מה אומרת המילה \"carrot\"?", options: ["גזר", "מלפפון", "פטריה", "תירס"], correct: 0, explanation: "\"carrot\" אומרת \"גזר\"", category: "vocabulary", type: "multiple-choice", englishWord: "carrot", hebrewWord: "גזר" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 630, text: "הכתיב את המילה \"קפה\" באנגלית:", correct: "coffee", explanation: "\"קפה\" באנגלית זה \"coffee\"", category: "vocabulary", type: "dictation", englishWord: "coffee", hebrewWord: "קפה" },
    { id: 631, text: "הכתיב את המילה \"תה\" באנגלית:", correct: "tea", explanation: "\"תה\" באנגלית זה \"tea\"", category: "vocabulary", type: "dictation", englishWord: "tea", hebrewWord: "תה" },
    { id: 632, text: "הכתיב את המילה \"עוף\" באנגלית:", correct: "chicken", explanation: "\"עוף\" באנגלית זה \"chicken\"", category: "vocabulary", type: "dictation", englishWord: "chicken", hebrewWord: "עוף" },
    { id: 633, text: "הכתיב את המילה \"בשר\" באנגלית:", correct: "meat", explanation: "\"בשר\" באנגלית זה \"meat\"", category: "vocabulary", type: "dictation", englishWord: "meat", hebrewWord: "בשר" },
    { id: 634, text: "הכתיב את המילה \"דג\" באנגלית:", correct: "fish", explanation: "\"דג\" באנגלית זה \"fish\"", category: "vocabulary", type: "dictation", englishWord: "fish", hebrewWord: "דג" },
    { id: 635, text: "הכתיב את המילה \"פסטה\" באנגלית:", correct: "pasta", explanation: "\"פסטה\" באנגלית זה \"pasta\"", category: "vocabulary", type: "dictation", englishWord: "pasta", hebrewWord: "פסטה" },
    { id: 636, text: "הכתיב את המילה \"אורז\" באנגלית:", correct: "rice", explanation: "\"אורז\" באנגלית זה \"rice\"", category: "vocabulary", type: "dictation", englishWord: "rice", hebrewWord: "אורז" },
    { id: 637, text: "הכתיב את המילה \"תפוח אדמה\" באנגלית:", correct: "potato", explanation: "\"תפוח אדמה\" באנגלית זה \"potato\"", category: "vocabulary", type: "dictation", englishWord: "potato", hebrewWord: "תפוח אדמה" },
    { id: 638, text: "הכתיב את המילה \"בצל\" באנגלית:", correct: "onion", explanation: "\"בצל\" באנגלית זה \"onion\"", category: "vocabulary", type: "dictation", englishWord: "onion", hebrewWord: "בצל" },
    { id: 639, text: "הכתיב את המילה \"גזר\" באנגלית:", correct: "carrot", explanation: "\"גזר\" באנגלית זה \"carrot\"", category: "vocabulary", type: "dictation", englishWord: "carrot", hebrewWord: "גזר" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 640, text: "הקליט את עצמך אומר את המילה \"קפה\" באנגלית:", correct: "coffee", explanation: "\"קפה\" באנגלית זה \"coffee\"", category: "vocabulary", type: "recording", englishWord: "coffee", hebrewWord: "קפה" },
    { id: 641, text: "הקליט את עצמך אומר את המילה \"תה\" באנגלית:", correct: "tea", explanation: "\"תה\" באנגלית זה \"tea\"", category: "vocabulary", type: "recording", englishWord: "tea", hebrewWord: "תה" },
    { id: 642, text: "הקליט את עצמך אומר את המילה \"עוף\" באנגלית:", correct: "chicken", explanation: "\"עוף\" באנגלית זה \"chicken\"", category: "vocabulary", type: "recording", englishWord: "chicken", hebrewWord: "עוף" },
    { id: 643, text: "הקליט את עצמך אומר את המילה \"בשר\" באנגלית:", correct: "meat", explanation: "\"בשר\" באנגלית זה \"meat\"", category: "vocabulary", type: "recording", englishWord: "meat", hebrewWord: "בשר" },
    { id: 644, text: "הקליט את עצמך אומר את המילה \"דג\" באנגלית:", correct: "fish", explanation: "\"דג\" באנגלית זה \"fish\"", category: "vocabulary", type: "recording", englishWord: "fish", hebrewWord: "דג" },
    { id: 645, text: "הקליט את עצמך אומר את המילה \"פסטה\" באנגלית:", correct: "pasta", explanation: "\"פסטה\" באנגלית זה \"pasta\"", category: "vocabulary", type: "recording", englishWord: "pasta", hebrewWord: "פסטה" },
    { id: 646, text: "הקליט את עצמך אומר את המילה \"אורז\" באנגלית:", correct: "rice", explanation: "\"אורז\" באנגלית זה \"rice\"", category: "vocabulary", type: "recording", englishWord: "rice", hebrewWord: "אורז" },
    { id: 647, text: "הקליט את עצמך אומר את המילה \"תפוח אדמה\" באנגלית:", correct: "potato", explanation: "\"תפוח אדמה\" באנגלית זה \"potato\"", category: "vocabulary", type: "recording", englishWord: "potato", hebrewWord: "תפוח אדמה" },
    { id: 648, text: "הקליט את עצמך אומר את המילה \"בצל\" באנגלית:", correct: "onion", explanation: "\"בצל\" באנגלית זה \"onion\"", category: "vocabulary", type: "recording", englishWord: "onion", hebrewWord: "בצל" },
    { id: 649, text: "הקליט את עצמך אומר את המילה \"גזר\" באנגלית:", correct: "carrot", explanation: "\"גזר\" באנגלית זה \"carrot\"", category: "vocabulary", type: "recording", englishWord: "carrot", hebrewWord: "גזר" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 650, text: "הקליט את עצמך אומר את המשפט: \"I drink coffee\" ואז בחר מה הפירוש של המילה \"coffee\" במשפט:", sentence: "I drink coffee", sentenceTranslation: "אני שותה קפה", correct: 2, options: ["מים", "מיץ", "קפה", "תה"], explanation: "\"coffee\" במשפט זה אומרת \"קפה\"", category: "vocabulary", type: "sentence-recording", englishWord: "coffee", hebrewWord: "קפה" },
    { id: 651, text: "הקליט את עצמך אומר את המשפט: \"I make tea\" ואז בחר מה הפירוש של המילה \"tea\" במשפט:", sentence: "I make tea", sentenceTranslation: "אני מכין תה", correct: 3, options: ["מים", "מיץ", "קפה", "תה"], explanation: "\"tea\" במשפט זה אומרת \"תה\"", category: "vocabulary", type: "sentence-recording", englishWord: "tea", hebrewWord: "תה" },
    { id: 652, text: "הקליט את עצמך אומר את המשפט: \"I cook chicken\" ואז בחר מה הפירוש של המילה \"chicken\" במשפט:", sentence: "I cook chicken", sentenceTranslation: "אני מבשל עוף", correct: 0, options: ["עוף", "בשר", "דג", "פסטה"], explanation: "\"chicken\" במשפט זה אומרת \"עוף\"", category: "vocabulary", type: "sentence-recording", englishWord: "chicken", hebrewWord: "עוף" },
    { id: 653, text: "הקליט את עצמך אומר את המשפט: \"I eat meat\" ואז בחר מה הפירוש של המילה \"meat\" במשפט:", sentence: "I eat meat", sentenceTranslation: "אני אוכל בשר", correct: 1, options: ["עוף", "בשר", "דג", "פסטה"], explanation: "\"meat\" במשפט זה אומרת \"בשר\"", category: "vocabulary", type: "sentence-recording", englishWord: "meat", hebrewWord: "בשר" },
    { id: 654, text: "הקליט את עצמך אומר את המשפט: \"I fry fish\" ואז בחר מה הפירוש של המילה \"fish\" במשפט:", sentence: "I fry fish", sentenceTranslation: "אני מטגן דג", correct: 2, options: ["עוף", "בשר", "דג", "פסטה"], explanation: "\"fish\" במשפט זה אומרת \"דג\"", category: "vocabulary", type: "sentence-recording", englishWord: "fish", hebrewWord: "דג" },
    { id: 655, text: "הקליט את עצמך אומר את המשפט: \"I boil pasta\" ואז בחר מה הפירוש של המילה \"pasta\" במשפט:", sentence: "I boil pasta", sentenceTranslation: "אני מבשל פסטה", correct: 3, options: ["עוף", "בשר", "דג", "פסטה"], explanation: "\"pasta\" במשפט זה אומרת \"פסטה\"", category: "vocabulary", type: "sentence-recording", englishWord: "pasta", hebrewWord: "פסטה" },
    { id: 656, text: "הקליט את עצמך אומר את המשפט: \"I cook rice\" ואז בחר מה הפירוש של המילה \"rice\" במשפט:", sentence: "I cook rice", sentenceTranslation: "אני מבשל אורז", correct: 0, options: ["אורז", "לחם", "תפוח אדמה", "בצל"], explanation: "\"rice\" במשפט זה אומרת \"אורז\"", category: "vocabulary", type: "sentence-recording", englishWord: "rice", hebrewWord: "אורז" },
    { id: 657, text: "הקליט את עצמך אומר את המשפט: \"I bake a potato\" ואז בחר מה הפירוש של המילה \"potato\" במשפט:", sentence: "I bake a potato", sentenceTranslation: "אני אופה תפוח אדמה", correct: 2, options: ["אורז", "לחם", "תפוח אדמה", "בצל"], explanation: "\"potato\" במשפט זה אומרת \"תפוח אדמה\"", category: "vocabulary", type: "sentence-recording", englishWord: "potato", hebrewWord: "תפוח אדמה" },
    { id: 658, text: "הקליט את עצמך אומר את המשפט: \"I cut an onion\" ואז בחר מה הפירוש של המילה \"onion\" במשפט:", sentence: "I cut an onion", sentenceTranslation: "אני חותך בצל", correct: 3, options: ["אורז", "לחם", "תפוח אדמה", "בצל"], explanation: "\"onion\" במשפט זה אומרת \"בצל\"", category: "vocabulary", type: "sentence-recording", englishWord: "onion", hebrewWord: "בצל" },
    { id: 659, text: "הקליט את עצמך אומר את המשפט: \"I peel a carrot\" ואז בחר מה הפירוש של המילה \"carrot\" במשפט:", sentence: "I peel a carrot", sentenceTranslation: "אני מקלף גזר", correct: 0, options: ["גזר", "מלפפון", "פטריה", "תירס"], explanation: "\"carrot\" במשפט זה אומרת \"גזר\"", category: "vocabulary", type: "sentence-recording", englishWord: "carrot", hebrewWord: "גזר" }
    ],
    '3': [ // רמה 3 - בינוני - אוצר מילים אוכל ומזון בינוני
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 660, text: "מה אומרת המילה \"cucumber\"?", options: ["גזר", "מלפפון", "פטריה", "תירס"], correct: 1, explanation: "\"cucumber\" אומרת \"מלפפון\"", category: "vocabulary", type: "multiple-choice", englishWord: "cucumber", hebrewWord: "מלפפון" },
    { id: 661, text: "מה אומרת המילה \"mushroom\"?", options: ["גזר", "מלפפון", "פטריה", "תירס"], correct: 2, explanation: "\"mushroom\" אומרת \"פטריה\"", category: "vocabulary", type: "multiple-choice", englishWord: "mushroom", hebrewWord: "פטריה" },
    { id: 662, text: "מה אומרת המילה \"corn\"?", options: ["גזר", "מלפפון", "פטריה", "תירס"], correct: 3, explanation: "\"corn\" אומרת \"תירס\"", category: "vocabulary", type: "multiple-choice", englishWord: "corn", hebrewWord: "תירס" },
    { id: 663, text: "מה אומרת המילה \"salad\"?", options: ["סלט", "מרק", "פשטידה", "עוגה"], correct: 0, explanation: "\"salad\" אומרת \"סלט\"", category: "vocabulary", type: "multiple-choice", englishWord: "salad", hebrewWord: "סלט" },
    { id: 664, text: "מה אומרת המילה \"soup\"?", options: ["סלט", "מרק", "פשטידה", "עוגה"], correct: 1, explanation: "\"soup\" אומרת \"מרק\"", category: "vocabulary", type: "multiple-choice", englishWord: "soup", hebrewWord: "מרק" },
    { id: 665, text: "מה אומרת המילה \"pie\"?", options: ["סלט", "מרק", "פשטידה", "עוגה"], correct: 2, explanation: "\"pie\" אומרת \"פשטידה\"", category: "vocabulary", type: "multiple-choice", englishWord: "pie", hebrewWord: "פשטידה" },
    { id: 666, text: "מה אומרת המילה \"cake\"?", options: ["סלט", "מרק", "פשטידה", "עוגה"], correct: 3, explanation: "\"cake\" אומרת \"עוגה\"", category: "vocabulary", type: "multiple-choice", englishWord: "cake", hebrewWord: "עוגה" },
    { id: 667, text: "מה אומרת המילה \"cookie\"?", options: ["עוגייה", "שוקולד", "גלידה", "ממתק"], correct: 0, explanation: "\"cookie\" אומרת \"עוגייה\"", category: "vocabulary", type: "multiple-choice", englishWord: "cookie", hebrewWord: "עוגייה" },
    { id: 668, text: "מה אומרת המילה \"chocolate\"?", options: ["עוגייה", "שוקולד", "גלידה", "ממתק"], correct: 1, explanation: "\"chocolate\" אומרת \"שוקולד\"", category: "vocabulary", type: "multiple-choice", englishWord: "chocolate", hebrewWord: "שוקולד" },
    { id: 669, text: "מה אומרת המילה \"ice cream\"?", options: ["עוגייה", "שוקולד", "גלידה", "ממתק"], correct: 2, explanation: "\"ice cream\" אומרת \"גלידה\"", category: "vocabulary", type: "multiple-choice", englishWord: "ice cream", hebrewWord: "גלידה" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 670, text: "הכתיב את המילה \"מלפפון\" באנגלית:", correct: "cucumber", explanation: "\"מלפפון\" באנגלית זה \"cucumber\"", category: "vocabulary", type: "dictation", englishWord: "cucumber", hebrewWord: "מלפפון" },
    { id: 671, text: "הכתיב את המילה \"פטריה\" באנגלית:", correct: "mushroom", explanation: "\"פטריה\" באנגלית זה \"mushroom\"", category: "vocabulary", type: "dictation", englishWord: "mushroom", hebrewWord: "פטריה" },
    { id: 672, text: "הכתיב את המילה \"תירס\" באנגלית:", correct: "corn", explanation: "\"תירס\" באנגלית זה \"corn\"", category: "vocabulary", type: "dictation", englishWord: "corn", hebrewWord: "תירס" },
    { id: 673, text: "הכתיב את המילה \"סלט\" באנגלית:", correct: "salad", explanation: "\"סלט\" באנגלית זה \"salad\"", category: "vocabulary", type: "dictation", englishWord: "salad", hebrewWord: "סלט" },
    { id: 674, text: "הכתיב את המילה \"מרק\" באנגלית:", correct: "soup", explanation: "\"מרק\" באנגלית זה \"soup\"", category: "vocabulary", type: "dictation", englishWord: "soup", hebrewWord: "מרק" },
    { id: 675, text: "הכתיב את המילה \"פשטידה\" באנגלית:", correct: "pie", explanation: "\"פשטידה\" באנגלית זה \"pie\"", category: "vocabulary", type: "dictation", englishWord: "pie", hebrewWord: "פשטידה" },
    { id: 676, text: "הכתיב את המילה \"עוגה\" באנגלית:", correct: "cake", explanation: "\"עוגה\" באנגלית זה \"cake\"", category: "vocabulary", type: "dictation", englishWord: "cake", hebrewWord: "עוגה" },
    { id: 677, text: "הכתיב את המילה \"עוגייה\" באנגלית:", correct: "cookie", explanation: "\"עוגייה\" באנגלית זה \"cookie\"", category: "vocabulary", type: "dictation", englishWord: "cookie", hebrewWord: "עוגייה" },
    { id: 678, text: "הכתיב את המילה \"שוקולד\" באנגלית:", correct: "chocolate", explanation: "\"שוקולד\" באנגלית זה \"chocolate\"", category: "vocabulary", type: "dictation", englishWord: "chocolate", hebrewWord: "שוקולד" },
    { id: 679, text: "הכתיב את המילה \"גלידה\" באנגלית:", correct: "ice cream", explanation: "\"גלידה\" באנגלית זה \"ice cream\"", category: "vocabulary", type: "dictation", englishWord: "ice cream", hebrewWord: "גלידה" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 680, text: "הקליט את עצמך אומר את המילה \"מלפפון\" באנגלית:", correct: "cucumber", explanation: "\"מלפפון\" באנגלית זה \"cucumber\"", category: "vocabulary", type: "recording", englishWord: "cucumber", hebrewWord: "מלפפון" },
    { id: 681, text: "הקליט את עצמך אומר את המילה \"פטריה\" באנגלית:", correct: "mushroom", explanation: "\"פטריה\" באנגלית זה \"mushroom\"", category: "vocabulary", type: "recording", englishWord: "mushroom", hebrewWord: "פטריה" },
    { id: 682, text: "הקליט את עצמך אומר את המילה \"תירס\" באנגלית:", correct: "corn", explanation: "\"תירס\" באנגלית זה \"corn\"", category: "vocabulary", type: "recording", englishWord: "corn", hebrewWord: "תירס" },
    { id: 683, text: "הקליט את עצמך אומר את המילה \"סלט\" באנגלית:", correct: "salad", explanation: "\"סלט\" באנגלית זה \"salad\"", category: "vocabulary", type: "recording", englishWord: "salad", hebrewWord: "סלט" },
    { id: 684, text: "הקליט את עצמך אומר את המילה \"מרק\" באנגלית:", correct: "soup", explanation: "\"מרק\" באנגלית זה \"soup\"", category: "vocabulary", type: "recording", englishWord: "soup", hebrewWord: "מרק" },
    { id: 685, text: "הקליט את עצמך אומר את המילה \"פשטידה\" באנגלית:", correct: "pie", explanation: "\"פשטידה\" באנגלית זה \"pie\"", category: "vocabulary", type: "recording", englishWord: "pie", hebrewWord: "פשטידה" },
    { id: 686, text: "הקליט את עצמך אומר את המילה \"עוגה\" באנגלית:", correct: "cake", explanation: "\"עוגה\" באנגלית זה \"cake\"", category: "vocabulary", type: "recording", englishWord: "cake", hebrewWord: "עוגה" },
    { id: 687, text: "הקליט את עצמך אומר את המילה \"עוגייה\" באנגלית:", correct: "cookie", explanation: "\"עוגייה\" באנגלית זה \"cookie\"", category: "vocabulary", type: "recording", englishWord: "cookie", hebrewWord: "עוגייה" },
    { id: 688, text: "הקליט את עצמך אומר את המילה \"שוקולד\" באנגלית:", correct: "chocolate", explanation: "\"שוקולד\" באנגלית זה \"chocolate\"", category: "vocabulary", type: "recording", englishWord: "chocolate", hebrewWord: "שוקולד" },
    { id: 689, text: "הקליט את עצמך אומר את המילה \"גלידה\" באנגלית:", correct: "ice cream", explanation: "\"גלידה\" באנגלית זה \"ice cream\"", category: "vocabulary", type: "recording", englishWord: "ice cream", hebrewWord: "גלידה" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 690, text: "הקליט את עצמך אומר את המשפט: \"I cut a cucumber\" ואז בחר מה הפירוש של המילה \"cucumber\" במשפט:", sentence: "I cut a cucumber", sentenceTranslation: "אני חותך מלפפון", correct: 1, options: ["גזר", "מלפפון", "פטריה", "תירס"], explanation: "\"cucumber\" במשפט זה אומרת \"מלפפון\"", category: "vocabulary", type: "sentence-recording", englishWord: "cucumber", hebrewWord: "מלפפון" },
    { id: 691, text: "הקליט את עצמך אומר את המשפט: \"I pick a mushroom\" ואז בחר מה הפירוש של המילה \"mushroom\" במשפט:", sentence: "I pick a mushroom", sentenceTranslation: "אני קוטף פטריה", correct: 2, options: ["גזר", "מלפפון", "פטריה", "תירס"], explanation: "\"mushroom\" במשפט זה אומרת \"פטריה\"", category: "vocabulary", type: "sentence-recording", englishWord: "mushroom", hebrewWord: "פטריה" },
    { id: 692, text: "הקליט את עצמך אומר את המשפט: \"I eat corn\" ואז בחר מה הפירוש של המילה \"corn\" במשפט:", sentence: "I eat corn", sentenceTranslation: "אני אוכל תירס", correct: 3, options: ["גזר", "מלפפון", "פטריה", "תירס"], explanation: "\"corn\" במשפט זה אומרת \"תירס\"", category: "vocabulary", type: "sentence-recording", englishWord: "corn", hebrewWord: "תירס" },
    { id: 693, text: "הקליט את עצמך אומר את המשפט: \"I make a salad\" ואז בחר מה הפירוש של המילה \"salad\" במשפט:", sentence: "I make a salad", sentenceTranslation: "אני מכין סלט", correct: 0, options: ["סלט", "מרק", "פשטידה", "עוגה"], explanation: "\"salad\" במשפט זה אומרת \"סלט\"", category: "vocabulary", type: "sentence-recording", englishWord: "salad", hebrewWord: "סלט" },
    { id: 694, text: "הקליט את עצמך אומר את המשפט: \"I heat the soup\" ואז בחר מה הפירוש של המילה \"soup\" במשפט:", sentence: "I heat the soup", sentenceTranslation: "אני מחמם מרק", correct: 1, options: ["סלט", "מרק", "פשטידה", "עוגה"], explanation: "\"soup\" במשפט זה אומרת \"מרק\"", category: "vocabulary", type: "sentence-recording", englishWord: "soup", hebrewWord: "מרק" },
    { id: 695, text: "הקליט את עצמך אומר את המשפט: \"I bake a pie\" ואז בחר מה הפירוש של המילה \"pie\" במשפט:", sentence: "I bake a pie", sentenceTranslation: "אני אופה פשטידה", correct: 2, options: ["סלט", "מרק", "פשטידה", "עוגה"], explanation: "\"pie\" במשפט זה אומרת \"פשטידה\"", category: "vocabulary", type: "sentence-recording", englishWord: "pie", hebrewWord: "פשטידה" },
    { id: 696, text: "הקליט את עצמך אומר את המשפט: \"I cut the cake\" ואז בחר מה הפירוש של המילה \"cake\" במשפט:", sentence: "I cut the cake", sentenceTranslation: "אני חותך עוגה", correct: 3, options: ["סלט", "מרק", "פשטידה", "עוגה"], explanation: "\"cake\" במשפט זה אומרת \"עוגה\"", category: "vocabulary", type: "sentence-recording", englishWord: "cake", hebrewWord: "עוגה" },
    { id: 697, text: "הקליט את עצמך אומר את המשפט: \"I eat a cookie\" ואז בחר מה הפירוש של המילה \"cookie\" במשפט:", sentence: "I eat a cookie", sentenceTranslation: "אני אוכל עוגייה", correct: 0, options: ["עוגייה", "שוקולד", "גלידה", "ממתק"], explanation: "\"cookie\" במשפט זה אומרת \"עוגייה\"", category: "vocabulary", type: "sentence-recording", englishWord: "cookie", hebrewWord: "עוגייה" },
    { id: 698, text: "הקליט את עצמך אומר את המשפט: \"I love chocolate\" ואז בחר מה הפירוש של המילה \"chocolate\" במשפט:", sentence: "I love chocolate", sentenceTranslation: "אני אוהב שוקולד", correct: 1, options: ["עוגייה", "שוקולד", "גלידה", "ממתק"], explanation: "\"chocolate\" במשפט זה אומרת \"שוקולד\"", category: "vocabulary", type: "sentence-recording", englishWord: "chocolate", hebrewWord: "שוקולד" },
    { id: 699, text: "הקליט את עצמך אומר את המשפט: \"I buy ice cream\" ואז בחר מה הפירוש של המילה \"ice cream\" במשפט:", sentence: "I buy ice cream", sentenceTranslation: "אני קונה גלידה", correct: 2, options: ["עוגייה", "שוקולד", "גלידה", "ממתק"], explanation: "\"ice cream\" במשפט זה אומרת \"גלידה\"", category: "vocabulary", type: "sentence-recording", englishWord: "ice cream", hebrewWord: "גלידה" }
    ],
    '4': [ // רמה 4 - מתקדם - אוצר מילים אוכל ומזון מתקדם
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 700, text: "מה אומרת המילה \"sandwich\"?", options: ["כריך", "פיצה", "המבורגר", "נקניקיה"], correct: 0, explanation: "\"sandwich\" אומרת \"כריך\"", category: "vocabulary", type: "multiple-choice", englishWord: "sandwich", hebrewWord: "כריך" },
    { id: 701, text: "מה אומרת המילה \"pizza\"?", options: ["כריך", "פיצה", "המבורגר", "נקניקיה"], correct: 1, explanation: "\"pizza\" אומרת \"פיצה\"", category: "vocabulary", type: "multiple-choice", englishWord: "pizza", hebrewWord: "פיצה" },
    { id: 702, text: "מה אומרת המילה \"hamburger\"?", options: ["כריך", "פיצה", "המבורגר", "נקניקיה"], correct: 2, explanation: "\"hamburger\" אומרת \"המבורגר\"", category: "vocabulary", type: "multiple-choice", englishWord: "hamburger", hebrewWord: "המבורגר" },
    { id: 703, text: "מה אומרת המילה \"sausage\"?", options: ["כריך", "פיצה", "המבורגר", "נקניקיה"], correct: 3, explanation: "\"sausage\" אומרת \"נקניקיה\"", category: "vocabulary", type: "multiple-choice", englishWord: "sausage", hebrewWord: "נקניקיה" },
    { id: 704, text: "מה אומרת המילה \"breakfast\"?", options: ["ארוחת בוקר", "ארוחת צהריים", "ארוחת ערב", "נשנוש"], correct: 0, explanation: "\"breakfast\" אומרת \"ארוחת בוקר\"", category: "vocabulary", type: "multiple-choice", englishWord: "breakfast", hebrewWord: "ארוחת בוקר" },
    { id: 705, text: "מה אומרת המילה \"lunch\"?", options: ["ארוחת בוקר", "ארוחת צהריים", "ארוחת ערב", "נשנוש"], correct: 1, explanation: "\"lunch\" אומרת \"ארוחת צהריים\"", category: "vocabulary", type: "multiple-choice", englishWord: "lunch", hebrewWord: "ארוחת צהריים" },
    { id: 706, text: "מה אומרת המילה \"dinner\"?", options: ["ארוחת בוקר", "ארוחת צהריים", "ארוחת ערב", "נשנוש"], correct: 2, explanation: "\"dinner\" אומרת \"ארוחת ערב\"", category: "vocabulary", type: "multiple-choice", englishWord: "dinner", hebrewWord: "ארוחת ערב" },
    { id: 707, text: "מה אומרת המילה \"snack\"?", options: ["ארוחת בוקר", "ארוחת צהריים", "ארוחת ערב", "נשנוש"], correct: 3, explanation: "\"snack\" אומרת \"נשנוש\"", category: "vocabulary", type: "multiple-choice", englishWord: "snack", hebrewWord: "נשנוש" },
    { id: 708, text: "מה אומרת המילה \"salt\"?", options: ["מלח", "פלפל", "סוכר", "שמן"], correct: 0, explanation: "\"salt\" אומרת \"מלח\"", category: "vocabulary", type: "multiple-choice", englishWord: "salt", hebrewWord: "מלח" },
    { id: 709, text: "מה אומרת המילה \"pepper\"?", options: ["מלח", "פלפל", "סוכר", "שמן"], correct: 1, explanation: "\"pepper\" אומרת \"פלפל\"", category: "vocabulary", type: "multiple-choice", englishWord: "pepper", hebrewWord: "פלפל" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 710, text: "הכתיב את המילה \"כריך\" באנגלית:", correct: "sandwich", explanation: "\"כריך\" באנגלית זה \"sandwich\"", category: "vocabulary", type: "dictation", englishWord: "sandwich", hebrewWord: "כריך" },
    { id: 711, text: "הכתיב את המילה \"פיצה\" באנגלית:", correct: "pizza", explanation: "\"פיצה\" באנגלית זה \"pizza\"", category: "vocabulary", type: "dictation", englishWord: "pizza", hebrewWord: "פיצה" },
    { id: 712, text: "הכתיב את המילה \"המבורגר\" באנגלית:", correct: "hamburger", explanation: "\"המבורגר\" באנגלית זה \"hamburger\"", category: "vocabulary", type: "dictation", englishWord: "hamburger", hebrewWord: "המבורגר" },
    { id: 713, text: "הכתיב את המילה \"נקניקיה\" באנגלית:", correct: "sausage", explanation: "\"נקניקיה\" באנגלית זה \"sausage\"", category: "vocabulary", type: "dictation", englishWord: "sausage", hebrewWord: "נקניקיה" },
    { id: 714, text: "הכתיב את המילה \"ארוחת בוקר\" באנגלית:", correct: "breakfast", explanation: "\"ארוחת בוקר\" באנגלית זה \"breakfast\"", category: "vocabulary", type: "dictation", englishWord: "breakfast", hebrewWord: "ארוחת בוקר" },
    { id: 715, text: "הכתיב את המילה \"ארוחת צהריים\" באנגלית:", correct: "lunch", explanation: "\"ארוחת צהריים\" באנגלית זה \"lunch\"", category: "vocabulary", type: "dictation", englishWord: "lunch", hebrewWord: "ארוחת צהריים" },
    { id: 716, text: "הכתיב את המילה \"ארוחת ערב\" באנגלית:", correct: "dinner", explanation: "\"ארוחת ערב\" באנגלית זה \"dinner\"", category: "vocabulary", type: "dictation", englishWord: "dinner", hebrewWord: "ארוחת ערב" },
    { id: 717, text: "הכתיב את המילה \"נשנוש\" באנגלית:", correct: "snack", explanation: "\"נשנוש\" באנגלית זה \"snack\"", category: "vocabulary", type: "dictation", englishWord: "snack", hebrewWord: "נשנוש" },
    { id: 718, text: "הכתיב את המילה \"מלח\" באנגלית:", correct: "salt", explanation: "\"מלח\" באנגלית זה \"salt\"", category: "vocabulary", type: "dictation", englishWord: "salt", hebrewWord: "מלח" },
    { id: 719, text: "הכתיב את המילה \"פלפל\" באנגלית:", correct: "pepper", explanation: "\"פלפל\" באנגלית זה \"pepper\"", category: "vocabulary", type: "dictation", englishWord: "pepper", hebrewWord: "פלפל" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 720, text: "הקליט את עצמך אומר את המילה \"כריך\" באנגלית:", correct: "sandwich", explanation: "\"כריך\" באנגלית זה \"sandwich\"", category: "vocabulary", type: "recording", englishWord: "sandwich", hebrewWord: "כריך" },
    { id: 721, text: "הקליט את עצמך אומר את המילה \"פיצה\" באנגלית:", correct: "pizza", explanation: "\"פיצה\" באנגלית זה \"pizza\"", category: "vocabulary", type: "recording", englishWord: "pizza", hebrewWord: "פיצה" },
    { id: 722, text: "הקליט את עצמך אומר את המילה \"המבורגר\" באנגלית:", correct: "hamburger", explanation: "\"המבורגר\" באנגלית זה \"hamburger\"", category: "vocabulary", type: "recording", englishWord: "hamburger", hebrewWord: "המבורגר" },
    { id: 723, text: "הקליט את עצמך אומר את המילה \"נקניקיה\" באנגלית:", correct: "sausage", explanation: "\"נקניקיה\" באנגלית זה \"sausage\"", category: "vocabulary", type: "recording", englishWord: "sausage", hebrewWord: "נקניקיה" },
    { id: 724, text: "הקליט את עצמך אומר את המילה \"ארוחת בוקר\" באנגלית:", correct: "breakfast", explanation: "\"ארוחת בוקר\" באנגלית זה \"breakfast\"", category: "vocabulary", type: "recording", englishWord: "breakfast", hebrewWord: "ארוחת בוקר" },
    { id: 725, text: "הקליט את עצמך אומר את המילה \"ארוחת צהריים\" באנגלית:", correct: "lunch", explanation: "\"ארוחת צהריים\" באנגלית זה \"lunch\"", category: "vocabulary", type: "recording", englishWord: "lunch", hebrewWord: "ארוחת צהריים" },
    { id: 726, text: "הקליט את עצמך אומר את המילה \"ארוחת ערב\" באנגלית:", correct: "dinner", explanation: "\"ארוחת ערב\" באנגלית זה \"dinner\"", category: "vocabulary", type: "recording", englishWord: "dinner", hebrewWord: "ארוחת ערב" },
    { id: 727, text: "הקליט את עצמך אומר את המילה \"נשנוש\" באנגלית:", correct: "snack", explanation: "\"נשנוש\" באנגלית זה \"snack\"", category: "vocabulary", type: "recording", englishWord: "snack", hebrewWord: "נשנוש" },
    { id: 728, text: "הקליט את עצמך אומר את המילה \"מלח\" באנגלית:", correct: "salt", explanation: "\"מלח\" באנגלית זה \"salt\"", category: "vocabulary", type: "recording", englishWord: "salt", hebrewWord: "מלח" },
    { id: 729, text: "הקליט את עצמך אומר את המילה \"פלפל\" באנגלית:", correct: "pepper", explanation: "\"פלפל\" באנגלית זה \"pepper\"", category: "vocabulary", type: "recording", englishWord: "pepper", hebrewWord: "פלפל" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 730, text: "הקליט את עצמך אומר את המשפט: \"I make a sandwich\" ואז בחר מה הפירוש של המילה \"sandwich\" במשפט:", sentence: "I make a sandwich", sentenceTranslation: "אני מכין כריך", correct: 0, options: ["כריך", "פיצה", "המבורגר", "נקניקיה"], explanation: "\"sandwich\" במשפט זה אומרת \"כריך\"", category: "vocabulary", type: "sentence-recording", englishWord: "sandwich", hebrewWord: "כריך" },
    { id: 731, text: "הקליט את עצמך אומר את המשפט: \"I order pizza\" ואז בחר מה הפירוש של המילה \"pizza\" במשפט:", sentence: "I order pizza", sentenceTranslation: "אני מזמין פיצה", correct: 1, options: ["כריך", "פיצה", "המבורגר", "נקניקיה"], explanation: "\"pizza\" במשפט זה אומרת \"פיצה\"", category: "vocabulary", type: "sentence-recording", englishWord: "pizza", hebrewWord: "פיצה" },
    { id: 732, text: "הקליט את עצמך אומר את המשפט: \"I eat a hamburger\" ואז בחר מה הפירוש של המילה \"hamburger\" במשפט:", sentence: "I eat a hamburger", sentenceTranslation: "אני אוכל המבורגר", correct: 2, options: ["כריך", "פיצה", "המבורגר", "נקניקיה"], explanation: "\"hamburger\" במשפט זה אומרת \"המבורגר\"", category: "vocabulary", type: "sentence-recording", englishWord: "hamburger", hebrewWord: "המבורגר" },
    { id: 733, text: "הקליט את עצמך אומר את המשפט: \"I grill a sausage\" ואז בחר מה הפירוש של המילה \"sausage\" במשפט:", sentence: "I grill a sausage", sentenceTranslation: "אני צולה נקניקיה", correct: 3, options: ["כריך", "פיצה", "המבורגר", "נקניקיה"], explanation: "\"sausage\" במשפט זה אומרת \"נקניקיה\"", category: "vocabulary", type: "sentence-recording", englishWord: "sausage", hebrewWord: "נקניקיה" },
    { id: 734, text: "הקליט את עצמך אומר את המשפט: \"I eat breakfast\" ואז בחר מה הפירוש של המילה \"breakfast\" במשפט:", sentence: "I eat breakfast", sentenceTranslation: "אני אוכל ארוחת בוקר", correct: 0, options: ["ארוחת בוקר", "ארוחת צהריים", "ארוחת ערב", "נשנוש"], explanation: "\"breakfast\" במשפט זה אומרת \"ארוחת בוקר\"", category: "vocabulary", type: "sentence-recording", englishWord: "breakfast", hebrewWord: "ארוחת בוקר" },
    { id: 735, text: "הקליט את עצמך אומר את המשפט: \"I have lunch\" ואז בחר מה הפירוש של המילה \"lunch\" במשפט:", sentence: "I have lunch", sentenceTranslation: "אני אוכל ארוחת צהריים", correct: 1, options: ["ארוחת בוקר", "ארוחת צהריים", "ארוחת ערב", "נשנוש"], explanation: "\"lunch\" במשפט זה אומרת \"ארוחת צהריים\"", category: "vocabulary", type: "sentence-recording", englishWord: "lunch", hebrewWord: "ארוחת צהריים" },
    { id: 736, text: "הקליט את עצמך אומר את המשפט: \"I prepare dinner\" ואז בחר מה הפירוש של המילה \"dinner\" במשפט:", sentence: "I prepare dinner", sentenceTranslation: "אני מכין ארוחת ערב", correct: 2, options: ["ארוחת בוקר", "ארוחת צהריים", "ארוחת ערב", "נשנוש"], explanation: "\"dinner\" במשפט זה אומרת \"ארוחת ערב\"", category: "vocabulary", type: "sentence-recording", englishWord: "dinner", hebrewWord: "ארוחת ערב" },
    { id: 737, text: "הקליט את עצמך אומר את המשפט: \"I take a snack\" ואז בחר מה הפירוש של המילה \"snack\" במשפט:", sentence: "I take a snack", sentenceTranslation: "אני לוקח נשנוש", correct: 3, options: ["ארוחת בוקר", "ארוחת צהריים", "ארוחת ערב", "נשנוש"], explanation: "\"snack\" במשפט זה אומרת \"נשנוש\"", category: "vocabulary", type: "sentence-recording", englishWord: "snack", hebrewWord: "נשנוש" },
    { id: 738, text: "הקליט את עצמך אומר את המשפט: \"I add salt\" ואז בחר מה הפירוש של המילה \"salt\" במשפט:", sentence: "I add salt", sentenceTranslation: "אני מוסיף מלח", correct: 0, options: ["מלח", "פלפל", "סוכר", "שמן"], explanation: "\"salt\" במשפט זה אומרת \"מלח\"", category: "vocabulary", type: "sentence-recording", englishWord: "salt", hebrewWord: "מלח" },
    { id: 739, text: "הקליט את עצמך אומר את המשפט: \"I sprinkle pepper\" ואז בחר מה הפירוש של המילה \"pepper\" במשפט:", sentence: "I sprinkle pepper", sentenceTranslation: "אני מפזר פלפל", correct: 1, options: ["מלח", "פלפל", "סוכר", "שמן"], explanation: "\"pepper\" במשפט זה אומרת \"פלפל\"", category: "vocabulary", type: "sentence-recording", englishWord: "pepper", hebrewWord: "פלפל" }
    ],
    '5': [ // רמה 5 - מומחה - אוצר מילים אוכל ומזון מומחה
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 740, text: "מה אומרת המילה \"sugar\"?", options: ["מלח", "פלפל", "סוכר", "שמן"], correct: 2, explanation: "\"sugar\" אומרת \"סוכר\"", category: "vocabulary", type: "multiple-choice", englishWord: "sugar", hebrewWord: "סוכר" },
    { id: 741, text: "מה אומרת המילה \"oil\"?", options: ["מלח", "פלפל", "סוכר", "שמן"], correct: 3, explanation: "\"oil\" אומרת \"שמן\"", category: "vocabulary", type: "multiple-choice", englishWord: "oil", hebrewWord: "שמן" },
    { id: 742, text: "מה אומרת המילה \"lemon\"?", options: ["לימון", "תפוז", "תפוח", "בננה"], correct: 0, explanation: "\"lemon\" אומרת \"לימון\"", category: "vocabulary", type: "multiple-choice", englishWord: "lemon", hebrewWord: "לימון" },
    { id: 743, text: "מה אומרת המילה \"orange\"?", options: ["לימון", "תפוז", "תפוח", "בננה"], correct: 1, explanation: "\"orange\" אומרת \"תפוז\"", category: "vocabulary", type: "multiple-choice", englishWord: "orange", hebrewWord: "תפוז" },
    { id: 744, text: "מה אומרת המילה \"apple\"?", options: ["לימון", "תפוז", "תפוח", "בננה"], correct: 2, explanation: "\"apple\" אומרת \"תפוח\"", category: "vocabulary", type: "multiple-choice", englishWord: "apple", hebrewWord: "תפוח" },
    { id: 745, text: "מה אומרת המילה \"banana\"?", options: ["לימון", "תפוז", "תפוח", "בננה"], correct: 3, explanation: "\"banana\" אומרת \"בננה\"", category: "vocabulary", type: "multiple-choice", englishWord: "banana", hebrewWord: "בננה" },
    { id: 746, text: "מה אומרת המילה \"strawberry\"?", options: ["תות", "ענב", "אבטיח", "מלון"], correct: 0, explanation: "\"strawberry\" אומרת \"תות\"", category: "vocabulary", type: "multiple-choice", englishWord: "strawberry", hebrewWord: "תות" },
    { id: 747, text: "מה אומרת המילה \"grape\"?", options: ["תות", "ענב", "אבטיח", "מלון"], correct: 1, explanation: "\"grape\" אומרת \"ענב\"", category: "vocabulary", type: "multiple-choice", englishWord: "grape", hebrewWord: "ענב" },
    { id: 748, text: "מה אומרת המילה \"watermelon\"?", options: ["תות", "ענב", "אבטיח", "מלון"], correct: 2, explanation: "\"watermelon\" אומרת \"אבטיח\"", category: "vocabulary", type: "multiple-choice", englishWord: "watermelon", hebrewWord: "אבטיח" },
    { id: 749, text: "מה אומרת המילה \"melon\"?", options: ["תות", "ענב", "אבטיח", "מלון"], correct: 3, explanation: "\"melon\" אומרת \"מלון\"", category: "vocabulary", type: "multiple-choice", englishWord: "melon", hebrewWord: "מלון" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 750, text: "הכתיב את המילה \"סוכר\" באנגלית:", correct: "sugar", explanation: "\"סוכר\" באנגלית זה \"sugar\"", category: "vocabulary", type: "dictation", englishWord: "sugar", hebrewWord: "סוכר" },
    { id: 751, text: "הכתיב את המילה \"שמן\" באנגלית:", correct: "oil", explanation: "\"שמן\" באנגלית זה \"oil\"", category: "vocabulary", type: "dictation", englishWord: "oil", hebrewWord: "שמן" },
    { id: 752, text: "הכתיב את המילה \"לימון\" באנגלית:", correct: "lemon", explanation: "\"לימון\" באנגלית זה \"lemon\"", category: "vocabulary", type: "dictation", englishWord: "lemon", hebrewWord: "לימון" },
    { id: 753, text: "הכתיב את המילה \"תפוז\" באנגלית:", correct: "orange", explanation: "\"תפוז\" באנגלית זה \"orange\"", category: "vocabulary", type: "dictation", englishWord: "orange", hebrewWord: "תפוז" },
    { id: 754, text: "הכתיב את המילה \"תפוח\" באנגלית:", correct: "apple", explanation: "\"תפוח\" באנגלית זה \"apple\"", category: "vocabulary", type: "dictation", englishWord: "apple", hebrewWord: "תפוח" },
    { id: 755, text: "הכתיב את המילה \"בננה\" באנגלית:", correct: "banana", explanation: "\"בננה\" באנגלית זה \"banana\"", category: "vocabulary", type: "dictation", englishWord: "banana", hebrewWord: "בננה" },
    { id: 756, text: "הכתיב את המילה \"תות\" באנגלית:", correct: "strawberry", explanation: "\"תות\" באנגלית זה \"strawberry\"", category: "vocabulary", type: "dictation", englishWord: "strawberry", hebrewWord: "תות" },
    { id: 757, text: "הכתיב את המילה \"ענב\" באנגלית:", correct: "grape", explanation: "\"ענב\" באנגלית זה \"grape\"", category: "vocabulary", type: "dictation", englishWord: "grape", hebrewWord: "ענב" },
    { id: 758, text: "הכתיב את המילה \"אבטיח\" באנגלית:", correct: "watermelon", explanation: "\"אבטיח\" באנגלית זה \"watermelon\"", category: "vocabulary", type: "dictation", englishWord: "watermelon", hebrewWord: "אבטיח" },
    { id: 759, text: "הכתיב את המילה \"מלון\" באנגלית:", correct: "melon", explanation: "\"מלון\" באנגלית זה \"melon\"", category: "vocabulary", type: "dictation", englishWord: "melon", hebrewWord: "מלון" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 760, text: "הקליט את עצמך אומר את המילה \"סוכר\" באנגלית:", correct: "sugar", explanation: "\"סוכר\" באנגלית זה \"sugar\"", category: "vocabulary", type: "recording", englishWord: "sugar", hebrewWord: "סוכר" },
    { id: 761, text: "הקליט את עצמך אומר את המילה \"שמן\" באנגלית:", correct: "oil", explanation: "\"שמן\" באנגלית זה \"oil\"", category: "vocabulary", type: "recording", englishWord: "oil", hebrewWord: "שמן" },
    { id: 762, text: "הקליט את עצמך אומר את המילה \"לימון\" באנגלית:", correct: "lemon", explanation: "\"לימון\" באנגלית זה \"lemon\"", category: "vocabulary", type: "recording", englishWord: "lemon", hebrewWord: "לימון" },
    { id: 763, text: "הקליט את עצמך אומר את המילה \"תפוז\" באנגלית:", correct: "orange", explanation: "\"תפוז\" באנגלית זה \"orange\"", category: "vocabulary", type: "recording", englishWord: "orange", hebrewWord: "תפוז" },
    { id: 764, text: "הקליט את עצמך אומר את המילה \"תפוח\" באנגלית:", correct: "apple", explanation: "\"תפוח\" באנגלית זה \"apple\"", category: "vocabulary", type: "recording", englishWord: "apple", hebrewWord: "תפוח" },
    { id: 765, text: "הקליט את עצמך אומר את המילה \"בננה\" באנגלית:", correct: "banana", explanation: "\"בננה\" באנגלית זה \"banana\"", category: "vocabulary", type: "recording", englishWord: "banana", hebrewWord: "בננה" },
    { id: 766, text: "הקליט את עצמך אומר את המילה \"תות\" באנגלית:", correct: "strawberry", explanation: "\"תות\" באנגלית זה \"strawberry\"", category: "vocabulary", type: "recording", englishWord: "strawberry", hebrewWord: "תות" },
    { id: 767, text: "הקליט את עצמך אומר את המילה \"ענב\" באנגלית:", correct: "grape", explanation: "\"ענב\" באנגלית זה \"grape\"", category: "vocabulary", type: "recording", englishWord: "grape", hebrewWord: "ענב" },
    { id: 768, text: "הקליט את עצמך אומר את המילה \"אבטיח\" באנגלית:", correct: "watermelon", explanation: "\"אבטיח\" באנגלית זה \"watermelon\"", category: "vocabulary", type: "recording", englishWord: "watermelon", hebrewWord: "אבטיח" },
    { id: 769, text: "הקליט את עצמך אומר את המילה \"מלון\" באנגלית:", correct: "melon", explanation: "\"מלון\" באנגלית זה \"melon\"", category: "vocabulary", type: "recording", englishWord: "melon", hebrewWord: "מלון" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 770, text: "הקליט את עצמך אומר את המשפט: \"I add sugar\" ואז בחר מה הפירוש של המילה \"sugar\" במשפט:", sentence: "I add sugar", sentenceTranslation: "אני מוסיף סוכר", correct: 2, options: ["מלח", "פלפל", "סוכר", "שמן"], explanation: "\"sugar\" במשפט זה אומרת \"סוכר\"", category: "vocabulary", type: "sentence-recording", englishWord: "sugar", hebrewWord: "סוכר" },
    { id: 771, text: "הקליט את עצמך אומר את המשפט: \"I pour oil\" ואז בחר מה הפירוש של המילה \"oil\" במשפט:", sentence: "I pour oil", sentenceTranslation: "אני שופך שמן", correct: 3, options: ["מלח", "פלפל", "סוכר", "שמן"], explanation: "\"oil\" במשפט זה אומרת \"שמן\"", category: "vocabulary", type: "sentence-recording", englishWord: "oil", hebrewWord: "שמן" },
    { id: 772, text: "הקליט את עצמך אומר את המשפט: \"I squeeze a lemon\" ואז בחר מה הפירוש של המילה \"lemon\" במשפט:", sentence: "I squeeze a lemon", sentenceTranslation: "אני סוחט לימון", correct: 0, options: ["לימון", "תפוז", "תפוח", "בננה"], explanation: "\"lemon\" במשפט זה אומרת \"לימון\"", category: "vocabulary", type: "sentence-recording", englishWord: "lemon", hebrewWord: "לימון" },
    { id: 773, text: "הקליט את עצמך אומר את המשפט: \"I peel an orange\" ואז בחר מה הפירוש של המילה \"orange\" במשפט:", sentence: "I peel an orange", sentenceTranslation: "אני מקלף תפוז", correct: 1, options: ["לימון", "תפוז", "תפוח", "בננה"], explanation: "\"orange\" במשפט זה אומרת \"תפוז\"", category: "vocabulary", type: "sentence-recording", englishWord: "orange", hebrewWord: "תפוז" },
    { id: 774, text: "הקליט את עצמך אומר את המשפט: \"I bite an apple\" ואז בחר מה הפירוש של המילה \"apple\" במשפט:", sentence: "I bite an apple", sentenceTranslation: "אני נושך תפוח", correct: 2, options: ["לימון", "תפוז", "תפוח", "בננה"], explanation: "\"apple\" במשפט זה אומרת \"תפוח\"", category: "vocabulary", type: "sentence-recording", englishWord: "apple", hebrewWord: "תפוח" },
    { id: 775, text: "הקליט את עצמך אומר את המשפט: \"I eat a banana\" ואז בחר מה הפירוש של המילה \"banana\" במשפט:", sentence: "I eat a banana", sentenceTranslation: "אני אוכל בננה", correct: 3, options: ["לימון", "תפוז", "תפוח", "בננה"], explanation: "\"banana\" במשפט זה אומרת \"בננה\"", category: "vocabulary", type: "sentence-recording", englishWord: "banana", hebrewWord: "בננה" },
    { id: 776, text: "הקליט את עצמך אומר את המשפט: \"I pick a strawberry\" ואז בחר מה הפירוש של המילה \"strawberry\" במשפט:", sentence: "I pick a strawberry", sentenceTranslation: "אני קוטף תות", correct: 0, options: ["תות", "ענב", "אבטיח", "מלון"], explanation: "\"strawberry\" במשפט זה אומרת \"תות\"", category: "vocabulary", type: "sentence-recording", englishWord: "strawberry", hebrewWord: "תות" },
    { id: 777, text: "הקליט את עצמך אומר את המשפט: \"I eat a grape\" ואז בחר מה הפירוש של המילה \"grape\" במשפט:", sentence: "I eat a grape", sentenceTranslation: "אני אוכל ענב", correct: 1, options: ["תות", "ענב", "אבטיח", "מלון"], explanation: "\"grape\" במשפט זה אומרת \"ענב\"", category: "vocabulary", type: "sentence-recording", englishWord: "grape", hebrewWord: "ענב" },
    { id: 778, text: "הקליט את עצמך אומר את המשפט: \"I cut a watermelon\" ואז בחר מה הפירוש של המילה \"watermelon\" במשפט:", sentence: "I cut a watermelon", sentenceTranslation: "אני חותך אבטיח", correct: 2, options: ["תות", "ענב", "אבטיח", "מלון"], explanation: "\"watermelon\" במשפט זה אומרת \"אבטיח\"", category: "vocabulary", type: "sentence-recording", englishWord: "watermelon", hebrewWord: "אבטיח" },
    { id: 779, text: "הקליט את עצמך אומר את המשפט: \"I slice a melon\" ואז בחר מה הפירוש של המילה \"melon\" במשפט:", sentence: "I slice a melon", sentenceTranslation: "אני חותך מלון", correct: 3, options: ["תות", "ענב", "אבטיח", "מלון"], explanation: "\"melon\" במשפט זה אומרת \"מלון\"", category: "vocabulary", type: "sentence-recording", englishWord: "melon", hebrewWord: "מלון" }
    ]
  },
  '4': { // יחידה 4 - זמן ומזג אוויר
    '1': [ // רמה 1 - מתחילים - זמן ומזג אוויר בסיסי
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 780, text: "מה אומרת המילה \"Monday\"?", options: ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי"], correct: 0, explanation: "\"Monday\" אומרת \"יום ראשון\"", category: "vocabulary", type: "multiple-choice", englishWord: "Monday", hebrewWord: "יום ראשון" },
    { id: 781, text: "מה אומרת המילה \"Tuesday\"?", options: ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי"], correct: 1, explanation: "\"Tuesday\" אומרת \"יום שני\"", category: "vocabulary", type: "multiple-choice", englishWord: "Tuesday", hebrewWord: "יום שני" },
    { id: 782, text: "מה אומרת המילה \"Wednesday\"?", options: ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי"], correct: 2, explanation: "\"Wednesday\" אומרת \"יום שלישי\"", category: "vocabulary", type: "multiple-choice", englishWord: "Wednesday", hebrewWord: "יום שלישי" },
    { id: 783, text: "מה אומרת המילה \"Thursday\"?", options: ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי"], correct: 3, explanation: "\"Thursday\" אומרת \"יום רביעי\"", category: "vocabulary", type: "multiple-choice", englishWord: "Thursday", hebrewWord: "יום רביעי" },
    { id: 784, text: "מה אומרת המילה \"Friday\"?", options: ["יום חמישי", "יום שישי", "יום שבת", "יום ראשון"], correct: 1, explanation: "\"Friday\" אומרת \"יום שישי\"", category: "vocabulary", type: "multiple-choice", englishWord: "Friday", hebrewWord: "יום שישי" },
    { id: 785, text: "מה אומרת המילה \"morning\"?", options: ["בוקר", "צהריים", "ערב", "לילה"], correct: 0, explanation: "\"morning\" אומרת \"בוקר\"", category: "vocabulary", type: "multiple-choice", englishWord: "morning", hebrewWord: "בוקר" },
    { id: 786, text: "מה אומרת המילה \"afternoon\"?", options: ["בוקר", "צהריים", "ערב", "לילה"], correct: 1, explanation: "\"afternoon\" אומרת \"צהריים\"", category: "vocabulary", type: "multiple-choice", englishWord: "afternoon", hebrewWord: "צהריים" },
    { id: 787, text: "מה אומרת המילה \"evening\"?", options: ["בוקר", "צהריים", "ערב", "לילה"], correct: 2, explanation: "\"evening\" אומרת \"ערב\"", category: "vocabulary", type: "multiple-choice", englishWord: "evening", hebrewWord: "ערב" },
    { id: 788, text: "מה אומרת המילה \"night\"?", options: ["בוקר", "צהריים", "ערב", "לילה"], correct: 3, explanation: "\"night\" אומרת \"לילה\"", category: "vocabulary", type: "multiple-choice", englishWord: "night", hebrewWord: "לילה" },
    { id: 789, text: "מה אומרת המילה \"sunny\"?", options: ["שמשי", "גשום", "מעונן", "רוח"], correct: 0, explanation: "\"sunny\" אומרת \"שמשי\"", category: "vocabulary", type: "multiple-choice", englishWord: "sunny", hebrewWord: "שמשי" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 790, text: "הכתיב את המילה \"יום ראשון\" באנגלית:", correct: "Monday", explanation: "\"יום ראשון\" באנגלית זה \"Monday\"", category: "vocabulary", type: "dictation", englishWord: "Monday", hebrewWord: "יום ראשון" },
    { id: 791, text: "הכתיב את המילה \"יום שני\" באנגלית:", correct: "Tuesday", explanation: "\"יום שני\" באנגלית זה \"Tuesday\"", category: "vocabulary", type: "dictation", englishWord: "Tuesday", hebrewWord: "יום שני" },
    { id: 792, text: "הכתיב את המילה \"יום שלישי\" באנגלית:", correct: "Wednesday", explanation: "\"יום שלישי\" באנגלית זה \"Wednesday\"", category: "vocabulary", type: "dictation", englishWord: "Wednesday", hebrewWord: "יום שלישי" },
    { id: 793, text: "הכתיב את המילה \"יום רביעי\" באנגלית:", correct: "Thursday", explanation: "\"יום רביעי\" באנגלית זה \"Thursday\"", category: "vocabulary", type: "dictation", englishWord: "Thursday", hebrewWord: "יום רביעי" },
    { id: 794, text: "הכתיב את המילה \"יום שישי\" באנגלית:", correct: "Friday", explanation: "\"יום שישי\" באנגלית זה \"Friday\"", category: "vocabulary", type: "dictation", englishWord: "Friday", hebrewWord: "יום שישי" },
    { id: 795, text: "הכתיב את המילה \"בוקר\" באנגלית:", correct: "morning", explanation: "\"בוקר\" באנגלית זה \"morning\"", category: "vocabulary", type: "dictation", englishWord: "morning", hebrewWord: "בוקר" },
    { id: 796, text: "הכתיב את המילה \"צהריים\" באנגלית:", correct: "afternoon", explanation: "\"צהריים\" באנגלית זה \"afternoon\"", category: "vocabulary", type: "dictation", englishWord: "afternoon", hebrewWord: "צהריים" },
    { id: 797, text: "הכתיב את המילה \"ערב\" באנגלית:", correct: "evening", explanation: "\"ערב\" באנגלית זה \"evening\"", category: "vocabulary", type: "dictation", englishWord: "evening", hebrewWord: "ערב" },
    { id: 798, text: "הכתיב את המילה \"לילה\" באנגלית:", correct: "night", explanation: "\"לילה\" באנגלית זה \"night\"", category: "vocabulary", type: "dictation", englishWord: "night", hebrewWord: "לילה" },
    { id: 799, text: "הכתיב את המילה \"שמשי\" באנגלית:", correct: "sunny", explanation: "\"שמשי\" באנגלית זה \"sunny\"", category: "vocabulary", type: "dictation", englishWord: "sunny", hebrewWord: "שמשי" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 800, text: "הקליט את עצמך אומר את המילה \"יום ראשון\" באנגלית:", correct: "Monday", explanation: "\"יום ראשון\" באנגלית זה \"Monday\"", category: "vocabulary", type: "recording", englishWord: "Monday", hebrewWord: "יום ראשון" },
    { id: 801, text: "הקליט את עצמך אומר את המילה \"יום שני\" באנגלית:", correct: "Tuesday", explanation: "\"יום שני\" באנגלית זה \"Tuesday\"", category: "vocabulary", type: "recording", englishWord: "Tuesday", hebrewWord: "יום שני" },
    { id: 802, text: "הקליט את עצמך אומר את המילה \"יום שלישי\" באנגלית:", correct: "Wednesday", explanation: "\"יום שלישי\" באנגלית זה \"Wednesday\"", category: "vocabulary", type: "recording", englishWord: "Wednesday", hebrewWord: "יום שלישי" },
    { id: 803, text: "הקליט את עצמך אומר את המילה \"יום רביעי\" באנגלית:", correct: "Thursday", explanation: "\"יום רביעי\" באנגלית זה \"Thursday\"", category: "vocabulary", type: "recording", englishWord: "Thursday", hebrewWord: "יום רביעי" },
    { id: 804, text: "הקליט את עצמך אומר את המילה \"יום שישי\" באנגלית:", correct: "Friday", explanation: "\"יום שישי\" באנגלית זה \"Friday\"", category: "vocabulary", type: "recording", englishWord: "Friday", hebrewWord: "יום שישי" },
    { id: 805, text: "הקליט את עצמך אומר את המילה \"בוקר\" באנגלית:", correct: "morning", explanation: "\"בוקר\" באנגלית זה \"morning\"", category: "vocabulary", type: "recording", englishWord: "morning", hebrewWord: "בוקר" },
    { id: 806, text: "הקליט את עצמך אומר את המילה \"צהריים\" באנגלית:", correct: "afternoon", explanation: "\"צהריים\" באנגלית זה \"afternoon\"", category: "vocabulary", type: "recording", englishWord: "afternoon", hebrewWord: "צהריים" },
    { id: 807, text: "הקליט את עצמך אומר את המילה \"ערב\" באנגלית:", correct: "evening", explanation: "\"ערב\" באנגלית זה \"evening\"", category: "vocabulary", type: "recording", englishWord: "evening", hebrewWord: "ערב" },
    { id: 808, text: "הקליט את עצמך אומר את המילה \"לילה\" באנגלית:", correct: "night", explanation: "\"לילה\" באנגלית זה \"night\"", category: "vocabulary", type: "recording", englishWord: "night", hebrewWord: "לילה" },
    { id: 809, text: "הקליט את עצמך אומר את המילה \"שמשי\" באנגלית:", correct: "sunny", explanation: "\"שמשי\" באנגלית זה \"sunny\"", category: "vocabulary", type: "recording", englishWord: "sunny", hebrewWord: "שמשי" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 810, text: "הקליט את עצמך אומר את המשפט: \"I go to school on Monday\" ואז בחר מה הפירוש של המילה \"Monday\" במשפט:", sentence: "I go to school on Monday", sentenceTranslation: "אני הולך לבית ספר ביום ראשון", correct: 0, options: ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי"], explanation: "\"Monday\" במשפט זה אומרת \"יום ראשון\"", category: "vocabulary", type: "sentence-recording", englishWord: "Monday", hebrewWord: "יום ראשון" },
    { id: 811, text: "הקליט את עצמך אומר את המשפט: \"I study on Tuesday\" ואז בחר מה הפירוש של המילה \"Tuesday\" במשפט:", sentence: "I study on Tuesday", sentenceTranslation: "אני לומד ביום שני", correct: 1, options: ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי"], explanation: "\"Tuesday\" במשפט זה אומרת \"יום שני\"", category: "vocabulary", type: "sentence-recording", englishWord: "Tuesday", hebrewWord: "יום שני" },
    { id: 812, text: "הקליט את עצמך אומר את המשפט: \"I play on Wednesday\" ואז בחר מה הפירוש של המילה \"Wednesday\" במשפט:", sentence: "I play on Wednesday", sentenceTranslation: "אני משחק ביום שלישי", correct: 2, options: ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי"], explanation: "\"Wednesday\" במשפט זה אומרת \"יום שלישי\"", category: "vocabulary", type: "sentence-recording", englishWord: "Wednesday", hebrewWord: "יום שלישי" },
    { id: 813, text: "הקליט את עצמך אומר את המשפט: \"I read on Thursday\" ואז בחר מה הפירוש של המילה \"Thursday\" במשפט:", sentence: "I read on Thursday", sentenceTranslation: "אני קורא ביום רביעי", correct: 3, options: ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי"], explanation: "\"Thursday\" במשפט זה אומרת \"יום רביעי\"", category: "vocabulary", type: "sentence-recording", englishWord: "Thursday", hebrewWord: "יום רביעי" },
    { id: 814, text: "הקליט את עצמך אומר את המשפט: \"I rest on Friday\" ואז בחר מה הפירוש של המילה \"Friday\" במשפט:", sentence: "I rest on Friday", sentenceTranslation: "אני נח ביום שישי", correct: 1, options: ["יום חמישי", "יום שישי", "יום שבת", "יום ראשון"], explanation: "\"Friday\" במשפט זה אומרת \"יום שישי\"", category: "vocabulary", type: "sentence-recording", englishWord: "Friday", hebrewWord: "יום שישי" },
    { id: 815, text: "הקליט את עצמך אומר את המשפט: \"I wake up in the morning\" ואז בחר מה הפירוש של המילה \"morning\" במשפט:", sentence: "I wake up in the morning", sentenceTranslation: "אני מתעורר בבוקר", correct: 0, options: ["בוקר", "צהריים", "ערב", "לילה"], explanation: "\"morning\" במשפט זה אומרת \"בוקר\"", category: "vocabulary", type: "sentence-recording", englishWord: "morning", hebrewWord: "בוקר" },
    { id: 816, text: "הקליט את עצמך אומר את המשפט: \"I eat lunch in the afternoon\" ואז בחר מה הפירוש של המילה \"afternoon\" במשפט:", sentence: "I eat lunch in the afternoon", sentenceTranslation: "אני אוכל ארוחת צהריים בצהריים", correct: 1, options: ["בוקר", "צהריים", "ערב", "לילה"], explanation: "\"afternoon\" במשפט זה אומרת \"צהריים\"", category: "vocabulary", type: "sentence-recording", englishWord: "afternoon", hebrewWord: "צהריים" },
    { id: 817, text: "הקליט את עצמך אומר את המשפט: \"I watch TV in the evening\" ואז בחר מה הפירוש של המילה \"evening\" במשפט:", sentence: "I watch TV in the evening", sentenceTranslation: "אני צופה בטלוויזיה בערב", correct: 2, options: ["בוקר", "צהריים", "ערב", "לילה"], explanation: "\"evening\" במשפט זה אומרת \"ערב\"", category: "vocabulary", type: "sentence-recording", englishWord: "evening", hebrewWord: "ערב" },
    { id: 818, text: "הקליט את עצמך אומר את המשפט: \"I sleep at night\" ואז בחר מה הפירוש של המילה \"night\" במשפט:", sentence: "I sleep at night", sentenceTranslation: "אני ישן בלילה", correct: 3, options: ["בוקר", "צהריים", "ערב", "לילה"], explanation: "\"night\" במשפט זה אומרת \"לילה\"", category: "vocabulary", type: "sentence-recording", englishWord: "night", hebrewWord: "לילה" },
    { id: 819, text: "הקליט את עצמך אומר את המשפט: \"It is sunny today\" ואז בחר מה הפירוש של המילה \"sunny\" במשפט:", sentence: "It is sunny today", sentenceTranslation: "היום שמשי", correct: 0, options: ["שמשי", "גשום", "מעונן", "רוח"], explanation: "\"sunny\" במשפט זה אומרת \"שמשי\"", category: "vocabulary", type: "sentence-recording", englishWord: "sunny", hebrewWord: "שמשי" }
    ],
    '2': [ // רמה 2 - בסיסי - זמן ומזג אוויר מתקדם יותר
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 820, text: "מה אומרת המילה \"Saturday\"?", options: ["יום חמישי", "יום שישי", "יום שבת", "יום ראשון"], correct: 2, explanation: "\"Saturday\" אומרת \"יום שבת\"", category: "vocabulary", type: "multiple-choice", englishWord: "Saturday", hebrewWord: "יום שבת" },
    { id: 821, text: "מה אומרת המילה \"Sunday\"?", options: ["יום חמישי", "יום שישי", "יום שבת", "יום ראשון"], correct: 3, explanation: "\"Sunday\" אומרת \"יום ראשון\"", category: "vocabulary", type: "multiple-choice", englishWord: "Sunday", hebrewWord: "יום ראשון" },
    { id: 822, text: "מה אומרת המילה \"rainy\"?", options: ["שמשי", "גשום", "מעונן", "רוח"], correct: 1, explanation: "\"rainy\" אומרת \"גשום\"", category: "vocabulary", type: "multiple-choice", englishWord: "rainy", hebrewWord: "גשום" },
    { id: 823, text: "מה אומרת המילה \"cloudy\"?", options: ["שמשי", "גשום", "מעונן", "רוח"], correct: 2, explanation: "\"cloudy\" אומרת \"מעונן\"", category: "vocabulary", type: "multiple-choice", englishWord: "cloudy", hebrewWord: "מעונן" },
    { id: 824, text: "מה אומרת המילה \"windy\"?", options: ["שמשי", "גשום", "מעונן", "רוח"], correct: 3, explanation: "\"windy\" אומרת \"רוח\"", category: "vocabulary", type: "multiple-choice", englishWord: "windy", hebrewWord: "רוח" },
    { id: 825, text: "מה אומרת המילה \"January\"?", options: ["ינואר", "פברואר", "מרץ", "אפריל"], correct: 0, explanation: "\"January\" אומרת \"ינואר\"", category: "vocabulary", type: "multiple-choice", englishWord: "January", hebrewWord: "ינואר" },
    { id: 826, text: "מה אומרת המילה \"February\"?", options: ["ינואר", "פברואר", "מרץ", "אפריל"], correct: 1, explanation: "\"February\" אומרת \"פברואר\"", category: "vocabulary", type: "multiple-choice", englishWord: "February", hebrewWord: "פברואר" },
    { id: 827, text: "מה אומרת המילה \"March\"?", options: ["ינואר", "פברואר", "מרץ", "אפריל"], correct: 2, explanation: "\"March\" אומרת \"מרץ\"", category: "vocabulary", type: "multiple-choice", englishWord: "March", hebrewWord: "מרץ" },
    { id: 828, text: "מה אומרת המילה \"April\"?", options: ["ינואר", "פברואר", "מרץ", "אפריל"], correct: 3, explanation: "\"April\" אומרת \"אפריל\"", category: "vocabulary", type: "multiple-choice", englishWord: "April", hebrewWord: "אפריל" },
    { id: 829, text: "מה אומרת המילה \"hour\"?", options: ["שעה", "דקה", "שנייה", "יום"], correct: 0, explanation: "\"hour\" אומרת \"שעה\"", category: "vocabulary", type: "multiple-choice", englishWord: "hour", hebrewWord: "שעה" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 830, text: "הכתיב את המילה \"יום שבת\" באנגלית:", correct: "Saturday", explanation: "\"יום שבת\" באנגלית זה \"Saturday\"", category: "vocabulary", type: "dictation", englishWord: "Saturday", hebrewWord: "יום שבת" },
    { id: 831, text: "הכתיב את המילה \"יום ראשון\" באנגלית:", correct: "Sunday", explanation: "\"יום ראשון\" באנגלית זה \"Sunday\"", category: "vocabulary", type: "dictation", englishWord: "Sunday", hebrewWord: "יום ראשון" },
    { id: 832, text: "הכתיב את המילה \"גשום\" באנגלית:", correct: "rainy", explanation: "\"גשום\" באנגלית זה \"rainy\"", category: "vocabulary", type: "dictation", englishWord: "rainy", hebrewWord: "גשום" },
    { id: 833, text: "הכתיב את המילה \"מעונן\" באנגלית:", correct: "cloudy", explanation: "\"מעונן\" באנגלית זה \"cloudy\"", category: "vocabulary", type: "dictation", englishWord: "cloudy", hebrewWord: "מעונן" },
    { id: 834, text: "הכתיב את המילה \"רוח\" באנגלית:", correct: "windy", explanation: "\"רוח\" באנגלית זה \"windy\"", category: "vocabulary", type: "dictation", englishWord: "windy", hebrewWord: "רוח" },
    { id: 835, text: "הכתיב את המילה \"ינואר\" באנגלית:", correct: "January", explanation: "\"ינואר\" באנגלית זה \"January\"", category: "vocabulary", type: "dictation", englishWord: "January", hebrewWord: "ינואר" },
    { id: 836, text: "הכתיב את המילה \"פברואר\" באנגלית:", correct: "February", explanation: "\"פברואר\" באנגלית זה \"February\"", category: "vocabulary", type: "dictation", englishWord: "February", hebrewWord: "פברואר" },
    { id: 837, text: "הכתיב את המילה \"מרץ\" באנגלית:", correct: "March", explanation: "\"מרץ\" באנגלית זה \"March\"", category: "vocabulary", type: "dictation", englishWord: "March", hebrewWord: "מרץ" },
    { id: 838, text: "הכתיב את המילה \"אפריל\" באנגלית:", correct: "April", explanation: "\"אפריל\" באנגלית זה \"April\"", category: "vocabulary", type: "dictation", englishWord: "April", hebrewWord: "אפריל" },
    { id: 839, text: "הכתיב את המילה \"שעה\" באנגלית:", correct: "hour", explanation: "\"שעה\" באנגלית זה \"hour\"", category: "vocabulary", type: "dictation", englishWord: "hour", hebrewWord: "שעה" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 840, text: "הקליט את עצמך אומר את המילה \"יום שבת\" באנגלית:", correct: "Saturday", explanation: "\"יום שבת\" באנגלית זה \"Saturday\"", category: "vocabulary", type: "recording", englishWord: "Saturday", hebrewWord: "יום שבת" },
    { id: 841, text: "הקליט את עצמך אומר את המילה \"יום ראשון\" באנגלית:", correct: "Sunday", explanation: "\"יום ראשון\" באנגלית זה \"Sunday\"", category: "vocabulary", type: "recording", englishWord: "Sunday", hebrewWord: "יום ראשון" },
    { id: 842, text: "הקליט את עצמך אומר את המילה \"גשום\" באנגלית:", correct: "rainy", explanation: "\"גשום\" באנגלית זה \"rainy\"", category: "vocabulary", type: "recording", englishWord: "rainy", hebrewWord: "גשום" },
    { id: 843, text: "הקליט את עצמך אומר את המילה \"מעונן\" באנגלית:", correct: "cloudy", explanation: "\"מעונן\" באנגלית זה \"cloudy\"", category: "vocabulary", type: "recording", englishWord: "cloudy", hebrewWord: "מעונן" },
    { id: 844, text: "הקליט את עצמך אומר את המילה \"רוח\" באנגלית:", correct: "windy", explanation: "\"רוח\" באנגלית זה \"windy\"", category: "vocabulary", type: "recording", englishWord: "windy", hebrewWord: "רוח" },
    { id: 845, text: "הקליט את עצמך אומר את המילה \"ינואר\" באנגלית:", correct: "January", explanation: "\"ינואר\" באנגלית זה \"January\"", category: "vocabulary", type: "recording", englishWord: "January", hebrewWord: "ינואר" },
    { id: 846, text: "הקליט את עצמך אומר את המילה \"פברואר\" באנגלית:", correct: "February", explanation: "\"פברואר\" באנגלית זה \"February\"", category: "vocabulary", type: "recording", englishWord: "February", hebrewWord: "פברואר" },
    { id: 847, text: "הקליט את עצמך אומר את המילה \"מרץ\" באנגלית:", correct: "March", explanation: "\"מרץ\" באנגלית זה \"March\"", category: "vocabulary", type: "recording", englishWord: "March", hebrewWord: "מרץ" },
    { id: 848, text: "הקליט את עצמך אומר את המילה \"אפריל\" באנגלית:", correct: "April", explanation: "\"אפריל\" באנגלית זה \"April\"", category: "vocabulary", type: "recording", englishWord: "April", hebrewWord: "אפריל" },
    { id: 849, text: "הקליט את עצמך אומר את המילה \"שעה\" באנגלית:", correct: "hour", explanation: "\"שעה\" באנגלית זה \"hour\"", category: "vocabulary", type: "recording", englishWord: "hour", hebrewWord: "שעה" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 850, text: "הקליט את עצמך אומר את המשפט: \"I rest on Saturday\" ואז בחר מה הפירוש של המילה \"Saturday\" במשפט:", sentence: "I rest on Saturday", sentenceTranslation: "אני נח ביום שבת", correct: 2, options: ["יום חמישי", "יום שישי", "יום שבת", "יום ראשון"], explanation: "\"Saturday\" במשפט זה אומרת \"יום שבת\"", category: "vocabulary", type: "sentence-recording", englishWord: "Saturday", hebrewWord: "יום שבת" },
    { id: 851, text: "הקליט את עצמך אומר את המשפט: \"I go to church on Sunday\" ואז בחר מה הפירוש של המילה \"Sunday\" במשפט:", sentence: "I go to church on Sunday", sentenceTranslation: "אני הולך לכנסייה ביום ראשון", correct: 3, options: ["יום חמישי", "יום שישי", "יום שבת", "יום ראשון"], explanation: "\"Sunday\" במשפט זה אומרת \"יום ראשון\"", category: "vocabulary", type: "sentence-recording", englishWord: "Sunday", hebrewWord: "יום ראשון" },
    { id: 852, text: "הקליט את עצמך אומר את המשפט: \"It is rainy today\" ואז בחר מה הפירוש של המילה \"rainy\" במשפט:", sentence: "It is rainy today", sentenceTranslation: "היום גשום", correct: 1, options: ["שמשי", "גשום", "מעונן", "רוח"], explanation: "\"rainy\" במשפט זה אומרת \"גשום\"", category: "vocabulary", type: "sentence-recording", englishWord: "rainy", hebrewWord: "גשום" },
    { id: 853, text: "הקליט את עצמך אומר את המשפט: \"It is cloudy today\" ואז בחר מה הפירוש של המילה \"cloudy\" במשפט:", sentence: "It is cloudy today", sentenceTranslation: "היום מעונן", correct: 2, options: ["שמשי", "גשום", "מעונן", "רוח"], explanation: "\"cloudy\" במשפט זה אומרת \"מעונן\"", category: "vocabulary", type: "sentence-recording", englishWord: "cloudy", hebrewWord: "מעונן" },
    { id: 854, text: "הקליט את עצמך אומר את המשפט: \"It is windy today\" ואז בחר מה הפירוש של המילה \"windy\" במשפט:", sentence: "It is windy today", sentenceTranslation: "היום רוח", correct: 3, options: ["שמשי", "גשום", "מעונן", "רוח"], explanation: "\"windy\" במשפט זה אומרת \"רוח\"", category: "vocabulary", type: "sentence-recording", englishWord: "windy", hebrewWord: "רוח" },
    { id: 855, text: "הקליט את עצמך אומר את המשפט: \"My birthday is in January\" ואז בחר מה הפירוש של המילה \"January\" במשפט:", sentence: "My birthday is in January", sentenceTranslation: "יום ההולדת שלי בינואר", correct: 0, options: ["ינואר", "פברואר", "מרץ", "אפריל"], explanation: "\"January\" במשפט זה אומרת \"ינואר\"", category: "vocabulary", type: "sentence-recording", englishWord: "January", hebrewWord: "ינואר" },
    { id: 856, text: "הקליט את עצמך אומר את המשפט: \"Valentine's Day is in February\" ואז בחר מה הפירוש של המילה \"February\" במשפט:", sentence: "Valentine's Day is in February", sentenceTranslation: "יום האהבה בפברואר", correct: 1, options: ["ינואר", "פברואר", "מרץ", "אפריל"], explanation: "\"February\" במשפט זה אומרת \"פברואר\"", category: "vocabulary", type: "sentence-recording", englishWord: "February", hebrewWord: "פברואר" },
    { id: 857, text: "הקליט את עצמך אומר את המשפט: \"Spring starts in March\" ואז בחר מה הפירוש של המילה \"March\" במשפט:", sentence: "Spring starts in March", sentenceTranslation: "האביב מתחיל במרץ", correct: 2, options: ["ינואר", "פברואר", "מרץ", "אפריל"], explanation: "\"March\" במשפט זה אומרת \"מרץ\"", category: "vocabulary", type: "sentence-recording", englishWord: "March", hebrewWord: "מרץ" },
    { id: 858, text: "הקליט את עצמך אומר את המשפט: \"Easter is in April\" ואז בחר מה הפירוש של המילה \"April\" במשפט:", sentence: "Easter is in April", sentenceTranslation: "פסחא באפריל", correct: 3, options: ["ינואר", "פברואר", "מרץ", "אפריל"], explanation: "\"April\" במשפט זה אומרת \"אפריל\"", category: "vocabulary", type: "sentence-recording", englishWord: "April", hebrewWord: "אפריל" },
    { id: 859, text: "הקליט את עצמך אומר את המשפט: \"I wait for one hour\" ואז בחר מה הפירוש של המילה \"hour\" במשפט:", sentence: "I wait for one hour", sentenceTranslation: "אני מחכה שעה אחת", correct: 0, options: ["שעה", "דקה", "שנייה", "יום"], explanation: "\"hour\" במשפט זה אומרת \"שעה\"", category: "vocabulary", type: "sentence-recording", englishWord: "hour", hebrewWord: "שעה" }
    ],
    '3': [ // רמה 3 - בינוני - זמן ומזג אוויר בינוני
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 860, text: "מה אומרת המילה \"May\"?", options: ["מאי", "יוני", "יולי", "אוגוסט"], correct: 0, explanation: "\"May\" אומרת \"מאי\"", category: "vocabulary", type: "multiple-choice", englishWord: "May", hebrewWord: "מאי" },
    { id: 861, text: "מה אומרת המילה \"June\"?", options: ["מאי", "יוני", "יולי", "אוגוסט"], correct: 1, explanation: "\"June\" אומרת \"יוני\"", category: "vocabulary", type: "multiple-choice", englishWord: "June", hebrewWord: "יוני" },
    { id: 862, text: "מה אומרת המילה \"July\"?", options: ["מאי", "יוני", "יולי", "אוגוסט"], correct: 2, explanation: "\"July\" אומרת \"יולי\"", category: "vocabulary", type: "multiple-choice", englishWord: "July", hebrewWord: "יולי" },
    { id: 863, text: "מה אומרת המילה \"August\"?", options: ["מאי", "יוני", "יולי", "אוגוסט"], correct: 3, explanation: "\"August\" אומרת \"אוגוסט\"", category: "vocabulary", type: "multiple-choice", englishWord: "August", hebrewWord: "אוגוסט" },
    { id: 864, text: "מה אומרת המילה \"minute\"?", options: ["שעה", "דקה", "שנייה", "יום"], correct: 1, explanation: "\"minute\" אומרת \"דקה\"", category: "vocabulary", type: "multiple-choice", englishWord: "minute", hebrewWord: "דקה" },
    { id: 865, text: "מה אומרת המילה \"second\"?", options: ["שעה", "דקה", "שנייה", "יום"], correct: 2, explanation: "\"second\" אומרת \"שנייה\"", category: "vocabulary", type: "multiple-choice", englishWord: "second", hebrewWord: "שנייה" },
    { id: 866, text: "מה אומרת המילה \"spring\"?", options: ["אביב", "קיץ", "סתיו", "חורף"], correct: 0, explanation: "\"spring\" אומרת \"אביב\"", category: "vocabulary", type: "multiple-choice", englishWord: "spring", hebrewWord: "אביב" },
    { id: 867, text: "מה אומרת המילה \"summer\"?", options: ["אביב", "קיץ", "סתיו", "חורף"], correct: 1, explanation: "\"summer\" אומרת \"קיץ\"", category: "vocabulary", type: "multiple-choice", englishWord: "summer", hebrewWord: "קיץ" },
    { id: 868, text: "מה אומרת המילה \"autumn\"?", options: ["אביב", "קיץ", "סתיו", "חורף"], correct: 2, explanation: "\"autumn\" אומרת \"סתיו\"", category: "vocabulary", type: "multiple-choice", englishWord: "autumn", hebrewWord: "סתיו" },
    { id: 869, text: "מה אומרת המילה \"winter\"?", options: ["אביב", "קיץ", "סתיו", "חורף"], correct: 3, explanation: "\"winter\" אומרת \"חורף\"", category: "vocabulary", type: "multiple-choice", englishWord: "winter", hebrewWord: "חורף" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 870, text: "הכתיב את המילה \"מאי\" באנגלית:", correct: "May", explanation: "\"מאי\" באנגלית זה \"May\"", category: "vocabulary", type: "dictation", englishWord: "May", hebrewWord: "מאי" },
    { id: 871, text: "הכתיב את המילה \"יוני\" באנגלית:", correct: "June", explanation: "\"יוני\" באנגלית זה \"June\"", category: "vocabulary", type: "dictation", englishWord: "June", hebrewWord: "יוני" },
    { id: 872, text: "הכתיב את המילה \"יולי\" באנגלית:", correct: "July", explanation: "\"יולי\" באנגלית זה \"July\"", category: "vocabulary", type: "dictation", englishWord: "July", hebrewWord: "יולי" },
    { id: 873, text: "הכתיב את המילה \"אוגוסט\" באנגלית:", correct: "August", explanation: "\"אוגוסט\" באנגלית זה \"August\"", category: "vocabulary", type: "dictation", englishWord: "August", hebrewWord: "אוגוסט" },
    { id: 874, text: "הכתיב את המילה \"דקה\" באנגלית:", correct: "minute", explanation: "\"דקה\" באנגלית זה \"minute\"", category: "vocabulary", type: "dictation", englishWord: "minute", hebrewWord: "דקה" },
    { id: 875, text: "הכתיב את המילה \"שנייה\" באנגלית:", correct: "second", explanation: "\"שנייה\" באנגלית זה \"second\"", category: "vocabulary", type: "dictation", englishWord: "second", hebrewWord: "שנייה" },
    { id: 876, text: "הכתיב את המילה \"אביב\" באנגלית:", correct: "spring", explanation: "\"אביב\" באנגלית זה \"spring\"", category: "vocabulary", type: "dictation", englishWord: "spring", hebrewWord: "אביב" },
    { id: 877, text: "הכתיב את המילה \"קיץ\" באנגלית:", correct: "summer", explanation: "\"קיץ\" באנגלית זה \"summer\"", category: "vocabulary", type: "dictation", englishWord: "summer", hebrewWord: "קיץ" },
    { id: 878, text: "הכתיב את המילה \"סתיו\" באנגלית:", correct: "autumn", explanation: "\"סתיו\" באנגלית זה \"autumn\"", category: "vocabulary", type: "dictation", englishWord: "autumn", hebrewWord: "סתיו" },
    { id: 879, text: "הכתיב את המילה \"חורף\" באנגלית:", correct: "winter", explanation: "\"חורף\" באנגלית זה \"winter\"", category: "vocabulary", type: "dictation", englishWord: "winter", hebrewWord: "חורף" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 880, text: "הקליט את עצמך אומר את המילה \"מאי\" באנגלית:", correct: "May", explanation: "\"מאי\" באנגלית זה \"May\"", category: "vocabulary", type: "recording", englishWord: "May", hebrewWord: "מאי" },
    { id: 881, text: "הקליט את עצמך אומר את המילה \"יוני\" באנגלית:", correct: "June", explanation: "\"יוני\" באנגלית זה \"June\"", category: "vocabulary", type: "recording", englishWord: "June", hebrewWord: "יוני" },
    { id: 882, text: "הקליט את עצמך אומר את המילה \"יולי\" באנגלית:", correct: "July", explanation: "\"יולי\" באנגלית זה \"July\"", category: "vocabulary", type: "recording", englishWord: "July", hebrewWord: "יולי" },
    { id: 883, text: "הקליט את עצמך אומר את המילה \"אוגוסט\" באנגלית:", correct: "August", explanation: "\"אוגוסט\" באנגלית זה \"August\"", category: "vocabulary", type: "recording", englishWord: "August", hebrewWord: "אוגוסט" },
    { id: 884, text: "הקליט את עצמך אומר את המילה \"דקה\" באנגלית:", correct: "minute", explanation: "\"דקה\" באנגלית זה \"minute\"", category: "vocabulary", type: "recording", englishWord: "minute", hebrewWord: "דקה" },
    { id: 885, text: "הקליט את עצמך אומר את המילה \"שנייה\" באנגלית:", correct: "second", explanation: "\"שנייה\" באנגלית זה \"second\"", category: "vocabulary", type: "recording", englishWord: "second", hebrewWord: "שנייה" },
    { id: 886, text: "הקליט את עצמך אומר את המילה \"אביב\" באנגלית:", correct: "spring", explanation: "\"אביב\" באנגלית זה \"spring\"", category: "vocabulary", type: "recording", englishWord: "spring", hebrewWord: "אביב" },
    { id: 887, text: "הקליט את עצמך אומר את המילה \"קיץ\" באנגלית:", correct: "summer", explanation: "\"קיץ\" באנגלית זה \"summer\"", category: "vocabulary", type: "recording", englishWord: "summer", hebrewWord: "קיץ" },
    { id: 888, text: "הקליט את עצמך אומר את המילה \"סתיו\" באנגלית:", correct: "autumn", explanation: "\"סתיו\" באנגלית זה \"autumn\"", category: "vocabulary", type: "recording", englishWord: "autumn", hebrewWord: "סתיו" },
    { id: 889, text: "הקליט את עצמך אומר את המילה \"חורף\" באנגלית:", correct: "winter", explanation: "\"חורף\" באנגלית זה \"winter\"", category: "vocabulary", type: "recording", englishWord: "winter", hebrewWord: "חורף" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 890, text: "הקליט את עצמך אומר את המשפט: \"My birthday is in May\" ואז בחר מה הפירוש של המילה \"May\" במשפט:", sentence: "My birthday is in May", sentenceTranslation: "יום ההולדת שלי במאי", correct: 0, options: ["מאי", "יוני", "יולי", "אוגוסט"], explanation: "\"May\" במשפט זה אומרת \"מאי\"", category: "vocabulary", type: "sentence-recording", englishWord: "May", hebrewWord: "מאי" },
    { id: 891, text: "הקליט את עצמך אומר את המשפט: \"School ends in June\" ואז בחר מה הפירוש של המילה \"June\" במשפט:", sentence: "School ends in June", sentenceTranslation: "בית הספר נגמר ביוני", correct: 1, options: ["מאי", "יוני", "יולי", "אוגוסט"], explanation: "\"June\" במשפט זה אומרת \"יוני\"", category: "vocabulary", type: "sentence-recording", englishWord: "June", hebrewWord: "יוני" },
    { id: 892, text: "הקליט את עצמך אומר את המשפט: \"I go on vacation in July\" ואז בחר מה הפירוש של המילה \"July\" במשפט:", sentence: "I go on vacation in July", sentenceTranslation: "אני יוצא לחופשה ביולי", correct: 2, options: ["מאי", "יוני", "יולי", "אוגוסט"], explanation: "\"July\" במשפט זה אומרת \"יולי\"", category: "vocabulary", type: "sentence-recording", englishWord: "July", hebrewWord: "יולי" },
    { id: 893, text: "הקליט את עצמך אומר את המשפט: \"It is hot in August\" ואז בחר מה הפירוש של המילה \"August\" במשפט:", sentence: "It is hot in August", sentenceTranslation: "חם באוגוסט", correct: 3, options: ["מאי", "יוני", "יולי", "אוגוסט"], explanation: "\"August\" במשפט זה אומרת \"אוגוסט\"", category: "vocabulary", type: "sentence-recording", englishWord: "August", hebrewWord: "אוגוסט" },
    { id: 894, text: "הקליט את עצמך אומר את המשפט: \"I wait one minute\" ואז בחר מה הפירוש של המילה \"minute\" במשפט:", sentence: "I wait one minute", sentenceTranslation: "אני מחכה דקה אחת", correct: 1, options: ["שעה", "דקה", "שנייה", "יום"], explanation: "\"minute\" במשפט זה אומרת \"דקה\"", category: "vocabulary", type: "sentence-recording", englishWord: "minute", hebrewWord: "דקה" },
    { id: 895, text: "הקליט את עצמך אומר את המשפט: \"I count one second\" ואז בחר מה הפירוש של המילה \"second\" במשפט:", sentence: "I count one second", sentenceTranslation: "אני סופר שנייה אחת", correct: 2, options: ["שעה", "דקה", "שנייה", "יום"], explanation: "\"second\" במשפט זה אומרת \"שנייה\"", category: "vocabulary", type: "sentence-recording", englishWord: "second", hebrewWord: "שנייה" },
    { id: 896, text: "הקליט את עצמך אומר את המשפט: \"Flowers bloom in spring\" ואז בחר מה הפירוש של המילה \"spring\" במשפט:", sentence: "Flowers bloom in spring", sentenceTranslation: "פרחים פורחים באביב", correct: 0, options: ["אביב", "קיץ", "סתיו", "חורף"], explanation: "\"spring\" במשפט זה אומרת \"אביב\"", category: "vocabulary", type: "sentence-recording", englishWord: "spring", hebrewWord: "אביב" },
    { id: 897, text: "הקליט את עצמך אומר את המשפט: \"I swim in summer\" ואז בחר מה הפירוש של המילה \"summer\" במשפט:", sentence: "I swim in summer", sentenceTranslation: "אני שוחה בקיץ", correct: 1, options: ["אביב", "קיץ", "סתיו", "חורף"], explanation: "\"summer\" במשפט זה אומרת \"קיץ\"", category: "vocabulary", type: "sentence-recording", englishWord: "summer", hebrewWord: "קיץ" },
    { id: 898, text: "הקליט את עצמך אומר את המשפט: \"Leaves fall in autumn\" ואז בחר מה הפירוש של המילה \"autumn\" במשפט:", sentence: "Leaves fall in autumn", sentenceTranslation: "עלים נופלים בסתיו", correct: 2, options: ["אביב", "קיץ", "סתיו", "חורף"], explanation: "\"autumn\" במשפט זה אומרת \"סתיו\"", category: "vocabulary", type: "sentence-recording", englishWord: "autumn", hebrewWord: "סתיו" },
    { id: 899, text: "הקליט את עצמך אומר את המשפט: \"It snows in winter\" ואז בחר מה הפירוש של המילה \"winter\" במשפט:", sentence: "It snows in winter", sentenceTranslation: "יורד שלג בחורף", correct: 3, options: ["אביב", "קיץ", "סתיו", "חורף"], explanation: "\"winter\" במשפט זה אומרת \"חורף\"", category: "vocabulary", type: "sentence-recording", englishWord: "winter", hebrewWord: "חורף" }
    ],
    '4': [ // רמה 4 - מתקדם - זמן ומזג אוויר מתקדם
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 900, text: "מה אומרת המילה \"September\"?", options: ["ספטמבר", "אוקטובר", "נובמבר", "דצמבר"], correct: 0, explanation: "\"September\" אומרת \"ספטמבר\"", category: "vocabulary", type: "multiple-choice", englishWord: "September", hebrewWord: "ספטמבר" },
    { id: 901, text: "מה אומרת המילה \"October\"?", options: ["ספטמבר", "אוקטובר", "נובמבר", "דצמבר"], correct: 1, explanation: "\"October\" אומרת \"אוקטובר\"", category: "vocabulary", type: "multiple-choice", englishWord: "October", hebrewWord: "אוקטובר" },
    { id: 902, text: "מה אומרת המילה \"November\"?", options: ["ספטמבר", "אוקטובר", "נובמבר", "דצמבר"], correct: 2, explanation: "\"November\" אומרת \"נובמבר\"", category: "vocabulary", type: "multiple-choice", englishWord: "November", hebrewWord: "נובמבר" },
    { id: 903, text: "מה אומרת המילה \"December\"?", options: ["ספטמבר", "אוקטובר", "נובמבר", "דצמבר"], correct: 3, explanation: "\"December\" אומרת \"דצמבר\"", category: "vocabulary", type: "multiple-choice", englishWord: "December", hebrewWord: "דצמבר" },
    { id: 904, text: "מה אומרת המילה \"today\"?", options: ["היום", "אתמול", "מחר", "השבוע"], correct: 0, explanation: "\"today\" אומרת \"היום\"", category: "vocabulary", type: "multiple-choice", englishWord: "today", hebrewWord: "היום" },
    { id: 905, text: "מה אומרת המילה \"yesterday\"?", options: ["היום", "אתמול", "מחר", "השבוע"], correct: 1, explanation: "\"yesterday\" אומרת \"אתמול\"", category: "vocabulary", type: "multiple-choice", englishWord: "yesterday", hebrewWord: "אתמול" },
    { id: 906, text: "מה אומרת המילה \"tomorrow\"?", options: ["היום", "אתמול", "מחר", "השבוע"], correct: 2, explanation: "\"tomorrow\" אומרת \"מחר\"", category: "vocabulary", type: "multiple-choice", englishWord: "tomorrow", hebrewWord: "מחר" },
    { id: 907, text: "מה אומרת המילה \"week\"?", options: ["היום", "אתמול", "מחר", "השבוע"], correct: 3, explanation: "\"week\" אומרת \"השבוע\"", category: "vocabulary", type: "multiple-choice", englishWord: "week", hebrewWord: "השבוע" },
    { id: 908, text: "מה אומרת המילה \"snow\"?", options: ["שלג", "גשם", "רוח", "שמש"], correct: 0, explanation: "\"snow\" אומרת \"שלג\"", category: "vocabulary", type: "multiple-choice", englishWord: "snow", hebrewWord: "שלג" },
    { id: 909, text: "מה אומרת המילה \"rain\"?", options: ["שלג", "גשם", "רוח", "שמש"], correct: 1, explanation: "\"rain\" אומרת \"גשם\"", category: "vocabulary", type: "multiple-choice", englishWord: "rain", hebrewWord: "גשם" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 910, text: "הכתיב את המילה \"ספטמבר\" באנגלית:", correct: "September", explanation: "\"ספטמבר\" באנגלית זה \"September\"", category: "vocabulary", type: "dictation", englishWord: "September", hebrewWord: "ספטמבר" },
    { id: 911, text: "הכתיב את המילה \"אוקטובר\" באנגלית:", correct: "October", explanation: "\"אוקטובר\" באנגלית זה \"October\"", category: "vocabulary", type: "dictation", englishWord: "October", hebrewWord: "אוקטובר" },
    { id: 912, text: "הכתיב את המילה \"נובמבר\" באנגלית:", correct: "November", explanation: "\"נובמבר\" באנגלית זה \"November\"", category: "vocabulary", type: "dictation", englishWord: "November", hebrewWord: "נובמבר" },
    { id: 913, text: "הכתיב את המילה \"דצמבר\" באנגלית:", correct: "December", explanation: "\"דצמבר\" באנגלית זה \"December\"", category: "vocabulary", type: "dictation", englishWord: "December", hebrewWord: "דצמבר" },
    { id: 914, text: "הכתיב את המילה \"היום\" באנגלית:", correct: "today", explanation: "\"היום\" באנגלית זה \"today\"", category: "vocabulary", type: "dictation", englishWord: "today", hebrewWord: "היום" },
    { id: 915, text: "הכתיב את המילה \"אתמול\" באנגלית:", correct: "yesterday", explanation: "\"אתמול\" באנגלית זה \"yesterday\"", category: "vocabulary", type: "dictation", englishWord: "yesterday", hebrewWord: "אתמול" },
    { id: 916, text: "הכתיב את המילה \"מחר\" באנגלית:", correct: "tomorrow", explanation: "\"מחר\" באנגלית זה \"tomorrow\"", category: "vocabulary", type: "dictation", englishWord: "tomorrow", hebrewWord: "מחר" },
    { id: 917, text: "הכתיב את המילה \"השבוע\" באנגלית:", correct: "week", explanation: "\"השבוע\" באנגלית זה \"week\"", category: "vocabulary", type: "dictation", englishWord: "week", hebrewWord: "השבוע" },
    { id: 918, text: "הכתיב את המילה \"שלג\" באנגלית:", correct: "snow", explanation: "\"שלג\" באנגלית זה \"snow\"", category: "vocabulary", type: "dictation", englishWord: "snow", hebrewWord: "שלג" },
    { id: 919, text: "הכתיב את המילה \"גשם\" באנגלית:", correct: "rain", explanation: "\"גשם\" באנגלית זה \"rain\"", category: "vocabulary", type: "dictation", englishWord: "rain", hebrewWord: "גשם" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 920, text: "הקליט את עצמך אומר את המילה \"ספטמבר\" באנגלית:", correct: "September", explanation: "\"ספטמבר\" באנגלית זה \"September\"", category: "vocabulary", type: "recording", englishWord: "September", hebrewWord: "ספטמבר" },
    { id: 921, text: "הקליט את עצמך אומר את המילה \"אוקטובר\" באנגלית:", correct: "October", explanation: "\"אוקטובר\" באנגלית זה \"October\"", category: "vocabulary", type: "recording", englishWord: "October", hebrewWord: "אוקטובר" },
    { id: 922, text: "הקליט את עצמך אומר את המילה \"נובמבר\" באנגלית:", correct: "November", explanation: "\"נובמבר\" באנגלית זה \"November\"", category: "vocabulary", type: "recording", englishWord: "November", hebrewWord: "נובמבר" },
    { id: 923, text: "הקליט את עצמך אומר את המילה \"דצמבר\" באנגלית:", correct: "December", explanation: "\"דצמבר\" באנגלית זה \"December\"", category: "vocabulary", type: "recording", englishWord: "December", hebrewWord: "דצמבר" },
    { id: 924, text: "הקליט את עצמך אומר את המילה \"היום\" באנגלית:", correct: "today", explanation: "\"היום\" באנגלית זה \"today\"", category: "vocabulary", type: "recording", englishWord: "today", hebrewWord: "היום" },
    { id: 925, text: "הקליט את עצמך אומר את המילה \"אתמול\" באנגלית:", correct: "yesterday", explanation: "\"אתמול\" באנגלית זה \"yesterday\"", category: "vocabulary", type: "recording", englishWord: "yesterday", hebrewWord: "אתמול" },
    { id: 926, text: "הקליט את עצמך אומר את המילה \"מחר\" באנגלית:", correct: "tomorrow", explanation: "\"מחר\" באנגלית זה \"tomorrow\"", category: "vocabulary", type: "recording", englishWord: "tomorrow", hebrewWord: "מחר" },
    { id: 927, text: "הקליט את עצמך אומר את המילה \"השבוע\" באנגלית:", correct: "week", explanation: "\"השבוע\" באנגלית זה \"week\"", category: "vocabulary", type: "recording", englishWord: "week", hebrewWord: "השבוע" },
    { id: 928, text: "הקליט את עצמך אומר את המילה \"שלג\" באנגלית:", correct: "snow", explanation: "\"שלג\" באנגלית זה \"snow\"", category: "vocabulary", type: "recording", englishWord: "snow", hebrewWord: "שלג" },
    { id: 929, text: "הקליט את עצמך אומר את המילה \"גשם\" באנגלית:", correct: "rain", explanation: "\"גשם\" באנגלית זה \"rain\"", category: "vocabulary", type: "recording", englishWord: "rain", hebrewWord: "גשם" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 930, text: "הקליט את עצמך אומר את המשפט: \"School starts in September\" ואז בחר מה הפירוש של המילה \"September\" במשפט:", sentence: "School starts in September", sentenceTranslation: "בית הספר מתחיל בספטמבר", correct: 0, options: ["ספטמבר", "אוקטובר", "נובמבר", "דצמבר"], explanation: "\"September\" במשפט זה אומרת \"ספטמבר\"", category: "vocabulary", type: "sentence-recording", englishWord: "September", hebrewWord: "ספטמבר" },
    { id: 931, text: "הקליט את עצמך אומר את המשפט: \"Halloween is in October\" ואז בחר מה הפירוש של המילה \"October\" במשפט:", sentence: "Halloween is in October", sentenceTranslation: "ליל כל הקדושים באוקטובר", correct: 1, options: ["ספטמבר", "אוקטובר", "נובמבר", "דצמבר"], explanation: "\"October\" במשפט זה אומרת \"אוקטובר\"", category: "vocabulary", type: "sentence-recording", englishWord: "October", hebrewWord: "אוקטובר" },
    { id: 932, text: "הקליט את עצמך אומר את המשפט: \"Thanksgiving is in November\" ואז בחר מה הפירוש של המילה \"November\" במשפט:", sentence: "Thanksgiving is in November", sentenceTranslation: "חג ההודיה בנובמבר", correct: 2, options: ["ספטמבר", "אוקטובר", "נובמבר", "דצמבר"], explanation: "\"November\" במשפט זה אומרת \"נובמבר\"", category: "vocabulary", type: "sentence-recording", englishWord: "November", hebrewWord: "נובמבר" },
    { id: 933, text: "הקליט את עצמך אומר את המשפט: \"Christmas is in December\" ואז בחר מה הפירוש של המילה \"December\" במשפט:", sentence: "Christmas is in December", sentenceTranslation: "חג המולד בדצמבר", correct: 3, options: ["ספטמבר", "אוקטובר", "נובמבר", "דצמבר"], explanation: "\"December\" במשפט זה אומרת \"דצמבר\"", category: "vocabulary", type: "sentence-recording", englishWord: "December", hebrewWord: "דצמבר" },
    { id: 934, text: "הקליט את עצמך אומר את המשפט: \"I study today\" ואז בחר מה הפירוש של המילה \"today\" במשפט:", sentence: "I study today", sentenceTranslation: "אני לומד היום", correct: 0, options: ["היום", "אתמול", "מחר", "השבוע"], explanation: "\"today\" במשפט זה אומרת \"היום\"", category: "vocabulary", type: "sentence-recording", englishWord: "today", hebrewWord: "היום" },
    { id: 935, text: "הקליט את עצמך אומר את המשפט: \"I went to school yesterday\" ואז בחר מה הפירוש של המילה \"yesterday\" במשפט:", sentence: "I went to school yesterday", sentenceTranslation: "הלכתי לבית ספר אתמול", correct: 1, options: ["היום", "אתמול", "מחר", "השבוע"], explanation: "\"yesterday\" במשפט זה אומרת \"אתמול\"", category: "vocabulary", type: "sentence-recording", englishWord: "yesterday", hebrewWord: "אתמול" },
    { id: 936, text: "הקליט את עצמך אומר את המשפט: \"I will play tomorrow\" ואז בחר מה הפירוש של המילה \"tomorrow\" במשפט:", sentence: "I will play tomorrow", sentenceTranslation: "אני אשחק מחר", correct: 2, options: ["היום", "אתמול", "מחר", "השבוע"], explanation: "\"tomorrow\" במשפט זה אומרת \"מחר\"", category: "vocabulary", type: "sentence-recording", englishWord: "tomorrow", hebrewWord: "מחר" },
    { id: 937, text: "הקליט את עצמך אומר את המשפט: \"I work this week\" ואז בחר מה הפירוש של המילה \"week\" במשפט:", sentence: "I work this week", sentenceTranslation: "אני עובד השבוע", correct: 3, options: ["היום", "אתמול", "מחר", "השבוע"], explanation: "\"week\" במשפט זה אומרת \"השבוע\"", category: "vocabulary", type: "sentence-recording", englishWord: "week", hebrewWord: "השבוע" },
    { id: 938, text: "הקליט את עצמך אומר את המשפט: \"It snows in winter\" ואז בחר מה הפירוש של המילה \"snow\" במשפט:", sentence: "It snows in winter", sentenceTranslation: "יורד שלג בחורף", correct: 0, options: ["שלג", "גשם", "רוח", "שמש"], explanation: "\"snow\" במשפט זה אומרת \"שלג\"", category: "vocabulary", type: "sentence-recording", englishWord: "snow", hebrewWord: "שלג" },
    { id: 939, text: "הקליט את עצמך אומר את המשפט: \"It rains in spring\" ואז בחר מה הפירוש של המילה \"rain\" במשפט:", sentence: "It rains in spring", sentenceTranslation: "יורד גשם באביב", correct: 1, options: ["שלג", "גשם", "רוח", "שמש"], explanation: "\"rain\" במשפט זה אומרת \"גשם\"", category: "vocabulary", type: "sentence-recording", englishWord: "rain", hebrewWord: "גשם" }
    ],
    '5': [ // רמה 5 - מומחה - זמן ומזג אוויר מומחה
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 940, text: "מה אומרת המילה \"wind\"?", options: ["שלג", "גשם", "רוח", "שמש"], correct: 2, explanation: "\"wind\" אומרת \"רוח\"", category: "vocabulary", type: "multiple-choice", englishWord: "wind", hebrewWord: "רוח" },
    { id: 941, text: "מה אומרת המילה \"sun\"?", options: ["שלג", "גשם", "רוח", "שמש"], correct: 3, explanation: "\"sun\" אומרת \"שמש\"", category: "vocabulary", type: "multiple-choice", englishWord: "sun", hebrewWord: "שמש" },
    { id: 942, text: "מה אומרת המילה \"month\"?", options: ["חודש", "שבוע", "יום", "שנה"], correct: 0, explanation: "\"month\" אומרת \"חודש\"", category: "vocabulary", type: "multiple-choice", englishWord: "month", hebrewWord: "חודש" },
    { id: 943, text: "מה אומרת המילה \"year\"?", options: ["חודש", "שבוע", "יום", "שנה"], correct: 3, explanation: "\"year\" אומרת \"שנה\"", category: "vocabulary", type: "multiple-choice", englishWord: "year", hebrewWord: "שנה" },
    { id: 944, text: "מה אומרת המילה \"now\"?", options: ["עכשיו", "אז", "לפני", "אחרי"], correct: 0, explanation: "\"now\" אומרת \"עכשיו\"", category: "vocabulary", type: "multiple-choice", englishWord: "now", hebrewWord: "עכשיו" },
    { id: 945, text: "מה אומרת המילה \"then\"?", options: ["עכשיו", "אז", "לפני", "אחרי"], correct: 1, explanation: "\"then\" אומרת \"אז\"", category: "vocabulary", type: "multiple-choice", englishWord: "then", hebrewWord: "אז" },
    { id: 946, text: "מה אומרת המילה \"before\"?", options: ["עכשיו", "אז", "לפני", "אחרי"], correct: 2, explanation: "\"before\" אומרת \"לפני\"", category: "vocabulary", type: "multiple-choice", englishWord: "before", hebrewWord: "לפני" },
    { id: 947, text: "מה אומרת המילה \"after\"?", options: ["עכשיו", "אז", "לפני", "אחרי"], correct: 3, explanation: "\"after\" אומרת \"אחרי\"", category: "vocabulary", type: "multiple-choice", englishWord: "after", hebrewWord: "אחרי" },
    { id: 948, text: "מה אומרת המילה \"storm\"?", options: ["סערה", "ברק", "רעמים", "ערפל"], correct: 0, explanation: "\"storm\" אומרת \"סערה\"", category: "vocabulary", type: "multiple-choice", englishWord: "storm", hebrewWord: "סערה" },
    { id: 949, text: "מה אומרת המילה \"thunder\"?", options: ["סערה", "ברק", "רעמים", "ערפל"], correct: 2, explanation: "\"thunder\" אומרת \"רעמים\"", category: "vocabulary", type: "multiple-choice", englishWord: "thunder", hebrewWord: "רעמים" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 950, text: "הכתיב את המילה \"רוח\" באנגלית:", correct: "wind", explanation: "\"רוח\" באנגלית זה \"wind\"", category: "vocabulary", type: "dictation", englishWord: "wind", hebrewWord: "רוח" },
    { id: 951, text: "הכתיב את המילה \"שמש\" באנגלית:", correct: "sun", explanation: "\"שמש\" באנגלית זה \"sun\"", category: "vocabulary", type: "dictation", englishWord: "sun", hebrewWord: "שמש" },
    { id: 952, text: "הכתיב את המילה \"חודש\" באנגלית:", correct: "month", explanation: "\"חודש\" באנגלית זה \"month\"", category: "vocabulary", type: "dictation", englishWord: "month", hebrewWord: "חודש" },
    { id: 953, text: "הכתיב את המילה \"שנה\" באנגלית:", correct: "year", explanation: "\"שנה\" באנגלית זה \"year\"", category: "vocabulary", type: "dictation", englishWord: "year", hebrewWord: "שנה" },
    { id: 954, text: "הכתיב את המילה \"עכשיו\" באנגלית:", correct: "now", explanation: "\"עכשיו\" באנגלית זה \"now\"", category: "vocabulary", type: "dictation", englishWord: "now", hebrewWord: "עכשיו" },
    { id: 955, text: "הכתיב את המילה \"אז\" באנגלית:", correct: "then", explanation: "\"אז\" באנגלית זה \"then\"", category: "vocabulary", type: "dictation", englishWord: "then", hebrewWord: "אז" },
    { id: 956, text: "הכתיב את המילה \"לפני\" באנגלית:", correct: "before", explanation: "\"לפני\" באנגלית זה \"before\"", category: "vocabulary", type: "dictation", englishWord: "before", hebrewWord: "לפני" },
    { id: 957, text: "הכתיב את המילה \"אחרי\" באנגלית:", correct: "after", explanation: "\"אחרי\" באנגלית זה \"after\"", category: "vocabulary", type: "dictation", englishWord: "after", hebrewWord: "אחרי" },
    { id: 958, text: "הכתיב את המילה \"סערה\" באנגלית:", correct: "storm", explanation: "\"סערה\" באנגלית זה \"storm\"", category: "vocabulary", type: "dictation", englishWord: "storm", hebrewWord: "סערה" },
    { id: 959, text: "הכתיב את המילה \"רעמים\" באנגלית:", correct: "thunder", explanation: "\"רעמים\" באנגלית זה \"thunder\"", category: "vocabulary", type: "dictation", englishWord: "thunder", hebrewWord: "רעמים" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 960, text: "הקליט את עצמך אומר את המילה \"רוח\" באנגלית:", correct: "wind", explanation: "\"רוח\" באנגלית זה \"wind\"", category: "vocabulary", type: "recording", englishWord: "wind", hebrewWord: "רוח" },
    { id: 961, text: "הקליט את עצמך אומר את המילה \"שמש\" באנגלית:", correct: "sun", explanation: "\"שמש\" באנגלית זה \"sun\"", category: "vocabulary", type: "recording", englishWord: "sun", hebrewWord: "שמש" },
    { id: 962, text: "הקליט את עצמך אומר את המילה \"חודש\" באנגלית:", correct: "month", explanation: "\"חודש\" באנגלית זה \"month\"", category: "vocabulary", type: "recording", englishWord: "month", hebrewWord: "חודש" },
    { id: 963, text: "הקליט את עצמך אומר את המילה \"שנה\" באנגלית:", correct: "year", explanation: "\"שנה\" באנגלית זה \"year\"", category: "vocabulary", type: "recording", englishWord: "year", hebrewWord: "שנה" },
    { id: 964, text: "הקליט את עצמך אומר את המילה \"עכשיו\" באנגלית:", correct: "now", explanation: "\"עכשיו\" באנגלית זה \"now\"", category: "vocabulary", type: "recording", englishWord: "now", hebrewWord: "עכשיו" },
    { id: 965, text: "הקליט את עצמך אומר את המילה \"אז\" באנגלית:", correct: "then", explanation: "\"אז\" באנגלית זה \"then\"", category: "vocabulary", type: "recording", englishWord: "then", hebrewWord: "אז" },
    { id: 966, text: "הקליט את עצמך אומר את המילה \"לפני\" באנגלית:", correct: "before", explanation: "\"לפני\" באנגלית זה \"before\"", category: "vocabulary", type: "recording", englishWord: "before", hebrewWord: "לפני" },
    { id: 967, text: "הקליט את עצמך אומר את המילה \"אחרי\" באנגלית:", correct: "after", explanation: "\"אחרי\" באנגלית זה \"after\"", category: "vocabulary", type: "recording", englishWord: "after", hebrewWord: "אחרי" },
    { id: 968, text: "הקליט את עצמך אומר את המילה \"סערה\" באנגלית:", correct: "storm", explanation: "\"סערה\" באנגלית זה \"storm\"", category: "vocabulary", type: "recording", englishWord: "storm", hebrewWord: "סערה" },
    { id: 969, text: "הקליט את עצמך אומר את המילה \"רעמים\" באנגלית:", correct: "thunder", explanation: "\"רעמים\" באנגלית זה \"thunder\"", category: "vocabulary", type: "recording", englishWord: "thunder", hebrewWord: "רעמים" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 970, text: "הקליט את עצמך אומר את המשפט: \"The wind blows\" ואז בחר מה הפירוש של המילה \"wind\" במשפט:", sentence: "The wind blows", sentenceTranslation: "הרוח נושבת", correct: 2, options: ["שלג", "גשם", "רוח", "שמש"], explanation: "\"wind\" במשפט זה אומרת \"רוח\"", category: "vocabulary", type: "sentence-recording", englishWord: "wind", hebrewWord: "רוח" },
    { id: 971, text: "הקליט את עצמך אומר את המשפט: \"The sun shines\" ואז בחר מה הפירוש של המילה \"sun\" במשפט:", sentence: "The sun shines", sentenceTranslation: "השמש זורחת", correct: 3, options: ["שלג", "גשם", "רוח", "שמש"], explanation: "\"sun\" במשפט זה אומרת \"שמש\"", category: "vocabulary", type: "sentence-recording", englishWord: "sun", hebrewWord: "שמש" },
    { id: 972, text: "הקליט את עצמך אומר את המשפט: \"I work every month\" ואז בחר מה הפירוש של המילה \"month\" במשפט:", sentence: "I work every month", sentenceTranslation: "אני עובד כל חודש", correct: 0, options: ["חודש", "שבוע", "יום", "שנה"], explanation: "\"month\" במשפט זה אומרת \"חודש\"", category: "vocabulary", type: "sentence-recording", englishWord: "month", hebrewWord: "חודש" },
    { id: 973, text: "הקליט את עצמך אומר את המשפט: \"I celebrate every year\" ואז בחר מה הפירוש של המילה \"year\" במשפט:", sentence: "I celebrate every year", sentenceTranslation: "אני חוגג כל שנה", correct: 3, options: ["חודש", "שבוע", "יום", "שנה"], explanation: "\"year\" במשפט זה אומרת \"שנה\"", category: "vocabulary", type: "sentence-recording", englishWord: "year", hebrewWord: "שנה" },
    { id: 974, text: "הקליט את עצמך אומר את המשפט: \"I study now\" ואז בחר מה הפירוש של המילה \"now\" במשפט:", sentence: "I study now", sentenceTranslation: "אני לומד עכשיו", correct: 0, options: ["עכשיו", "אז", "לפני", "אחרי"], explanation: "\"now\" במשפט זה אומרת \"עכשיו\"", category: "vocabulary", type: "sentence-recording", englishWord: "now", hebrewWord: "עכשיו" },
    { id: 975, text: "הקליט את עצמך אומר את המשפט: \"I was young then\" ואז בחר מה הפירוש של המילה \"then\" במשפט:", sentence: "I was young then", sentenceTranslation: "הייתי צעיר אז", correct: 1, options: ["עכשיו", "אז", "לפני", "אחרי"], explanation: "\"then\" במשפט זה אומרת \"אז\"", category: "vocabulary", type: "sentence-recording", englishWord: "then", hebrewWord: "אז" },
    { id: 976, text: "הקליט את עצמך אומר את המשפט: \"I eat before school\" ואז בחר מה הפירוש של המילה \"before\" במשפט:", sentence: "I eat before school", sentenceTranslation: "אני אוכל לפני בית ספר", correct: 2, options: ["עכשיו", "אז", "לפני", "אחרי"], explanation: "\"before\" במשפט זה אומרת \"לפני\"", category: "vocabulary", type: "sentence-recording", englishWord: "before", hebrewWord: "לפני" },
    { id: 977, text: "הקליט את עצמך אומר את המשפט: \"I play after school\" ואז בחר מה הפירוש של המילה \"after\" במשפט:", sentence: "I play after school", sentenceTranslation: "אני משחק אחרי בית ספר", correct: 3, options: ["עכשיו", "אז", "לפני", "אחרי"], explanation: "\"after\" במשפט זה אומרת \"אחרי\"", category: "vocabulary", type: "sentence-recording", englishWord: "after", hebrewWord: "אחרי" },
    { id: 978, text: "הקליט את עצמך אומר את המשפט: \"There is a storm\" ואז בחר מה הפירוש של המילה \"storm\" במשפט:", sentence: "There is a storm", sentenceTranslation: "יש סערה", correct: 0, options: ["סערה", "ברק", "רעמים", "ערפל"], explanation: "\"storm\" במשפט זה אומרת \"סערה\"", category: "vocabulary", type: "sentence-recording", englishWord: "storm", hebrewWord: "סערה" },
    { id: 979, text: "הקליט את עצמך אומר את המשפט: \"I hear thunder\" ואז בחר מה הפירוש של המילה \"thunder\" במשפט:", sentence: "I hear thunder", sentenceTranslation: "אני שומע רעמים", correct: 2, options: ["סערה", "ברק", "רעמים", "ערפל"], explanation: "\"thunder\" במשפט זה אומרת \"רעמים\"", category: "vocabulary", type: "sentence-recording", englishWord: "thunder", hebrewWord: "רעמים" }
    ]
  },
  '5': { // יחידה 5 - דיקדוק בסיסי
    '1': [ // רמה 1 - מתחילים - פעלים בסיסיים
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 980, text: "מה אומרת המילה \"am\"?", options: ["אני", "אתה", "הוא", "אנחנו"], correct: 0, explanation: "\"am\" אומרת \"אני\"", category: "vocabulary", type: "multiple-choice", englishWord: "am", hebrewWord: "אני" },
    { id: 981, text: "מה אומרת המילה \"is\"?", options: ["אני", "אתה", "הוא", "אנחנו"], correct: 2, explanation: "\"is\" אומרת \"הוא\"", category: "vocabulary", type: "multiple-choice", englishWord: "is", hebrewWord: "הוא" },
    { id: 982, text: "מה אומרת המילה \"are\"?", options: ["אני", "אתה", "הוא", "אנחנו"], correct: 3, explanation: "\"are\" אומרת \"אנחנו\"", category: "vocabulary", type: "multiple-choice", englishWord: "are", hebrewWord: "אנחנו" },
    { id: 983, text: "מה אומרת המילה \"go\"?", options: ["ללכת", "לבוא", "לאכול", "לשתות"], correct: 0, explanation: "\"go\" אומרת \"ללכת\"", category: "vocabulary", type: "multiple-choice", englishWord: "go", hebrewWord: "ללכת" },
    { id: 984, text: "מה אומרת המילה \"come\"?", options: ["ללכת", "לבוא", "לאכול", "לשתות"], correct: 1, explanation: "\"come\" אומרת \"לבוא\"", category: "vocabulary", type: "multiple-choice", englishWord: "come", hebrewWord: "לבוא" },
    { id: 985, text: "מה אומרת המילה \"eat\"?", options: ["ללכת", "לבוא", "לאכול", "לשתות"], correct: 2, explanation: "\"eat\" אומרת \"לאכול\"", category: "vocabulary", type: "multiple-choice", englishWord: "eat", hebrewWord: "לאכול" },
    { id: 986, text: "מה אומרת המילה \"drink\"?", options: ["ללכת", "לבוא", "לאכול", "לשתות"], correct: 3, explanation: "\"drink\" אומרת \"לשתות\"", category: "vocabulary", type: "multiple-choice", englishWord: "drink", hebrewWord: "לשתות" },
    { id: 987, text: "מה אומרת המילה \"play\"?", options: ["לשחק", "לקרוא", "לכתוב", "לראות"], correct: 0, explanation: "\"play\" אומרת \"לשחק\"", category: "vocabulary", type: "multiple-choice", englishWord: "play", hebrewWord: "לשחק" },
    { id: 988, text: "מה אומרת המילה \"read\"?", options: ["לשחק", "לקרוא", "לכתוב", "לראות"], correct: 1, explanation: "\"read\" אומרת \"לקרוא\"", category: "vocabulary", type: "multiple-choice", englishWord: "read", hebrewWord: "לקרוא" },
    { id: 989, text: "מה אומרת המילה \"write\"?", options: ["לשחק", "לקרוא", "לכתוב", "לראות"], correct: 2, explanation: "\"write\" אומרת \"לכתוב\"", category: "vocabulary", type: "multiple-choice", englishWord: "write", hebrewWord: "לכתוב" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 990, text: "הכתיב את המילה \"אני\" באנגלית:", correct: "am", explanation: "\"אני\" באנגלית זה \"am\"", category: "vocabulary", type: "dictation", englishWord: "am", hebrewWord: "אני" },
    { id: 991, text: "הכתיב את המילה \"הוא\" באנגלית:", correct: "is", explanation: "\"הוא\" באנגלית זה \"is\"", category: "vocabulary", type: "dictation", englishWord: "is", hebrewWord: "הוא" },
    { id: 992, text: "הכתיב את המילה \"אנחנו\" באנגלית:", correct: "are", explanation: "\"אנחנו\" באנגלית זה \"are\"", category: "vocabulary", type: "dictation", englishWord: "are", hebrewWord: "אנחנו" },
    { id: 993, text: "הכתיב את המילה \"ללכת\" באנגלית:", correct: "go", explanation: "\"ללכת\" באנגלית זה \"go\"", category: "vocabulary", type: "dictation", englishWord: "go", hebrewWord: "ללכת" },
    { id: 994, text: "הכתיב את המילה \"לבוא\" באנגלית:", correct: "come", explanation: "\"לבוא\" באנגלית זה \"come\"", category: "vocabulary", type: "dictation", englishWord: "come", hebrewWord: "לבוא" },
    { id: 995, text: "הכתיב את המילה \"לאכול\" באנגלית:", correct: "eat", explanation: "\"לאכול\" באנגלית זה \"eat\"", category: "vocabulary", type: "dictation", englishWord: "eat", hebrewWord: "לאכול" },
    { id: 996, text: "הכתיב את המילה \"לשתות\" באנגלית:", correct: "drink", explanation: "\"לשתות\" באנגלית זה \"drink\"", category: "vocabulary", type: "dictation", englishWord: "drink", hebrewWord: "לשתות" },
    { id: 997, text: "הכתיב את המילה \"לשחק\" באנגלית:", correct: "play", explanation: "\"לשחק\" באנגלית זה \"play\"", category: "vocabulary", type: "dictation", englishWord: "play", hebrewWord: "לשחק" },
    { id: 998, text: "הכתיב את המילה \"לקרוא\" באנגלית:", correct: "read", explanation: "\"לקרוא\" באנגלית זה \"read\"", category: "vocabulary", type: "dictation", englishWord: "read", hebrewWord: "לקרוא" },
    { id: 999, text: "הכתיב את המילה \"לכתוב\" באנגלית:", correct: "write", explanation: "\"לכתוב\" באנגלית זה \"write\"", category: "vocabulary", type: "dictation", englishWord: "write", hebrewWord: "לכתוב" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1000, text: "הקליט את עצמך אומר את המילה \"אני\" באנגלית:", correct: "am", explanation: "\"אני\" באנגלית זה \"am\"", category: "vocabulary", type: "recording", englishWord: "am", hebrewWord: "אני" },
    { id: 1001, text: "הקליט את עצמך אומר את המילה \"הוא\" באנגלית:", correct: "is", explanation: "\"הוא\" באנגלית זה \"is\"", category: "vocabulary", type: "recording", englishWord: "is", hebrewWord: "הוא" },
    { id: 1002, text: "הקליט את עצמך אומר את המילה \"אנחנו\" באנגלית:", correct: "are", explanation: "\"אנחנו\" באנגלית זה \"are\"", category: "vocabulary", type: "recording", englishWord: "are", hebrewWord: "אנחנו" },
    { id: 1003, text: "הקליט את עצמך אומר את המילה \"ללכת\" באנגלית:", correct: "go", explanation: "\"ללכת\" באנגלית זה \"go\"", category: "vocabulary", type: "recording", englishWord: "go", hebrewWord: "ללכת" },
    { id: 1004, text: "הקליט את עצמך אומר את המילה \"לבוא\" באנגלית:", correct: "come", explanation: "\"לבוא\" באנגלית זה \"come\"", category: "vocabulary", type: "recording", englishWord: "come", hebrewWord: "לבוא" },
    { id: 1005, text: "הקליט את עצמך אומר את המילה \"לאכול\" באנגלית:", correct: "eat", explanation: "\"לאכול\" באנגלית זה \"eat\"", category: "vocabulary", type: "recording", englishWord: "eat", hebrewWord: "לאכול" },
    { id: 1006, text: "הקליט את עצמך אומר את המילה \"לשתות\" באנגלית:", correct: "drink", explanation: "\"לשתות\" באנגלית זה \"drink\"", category: "vocabulary", type: "recording", englishWord: "drink", hebrewWord: "לשתות" },
    { id: 1007, text: "הקליט את עצמך אומר את המילה \"לשחק\" באנגלית:", correct: "play", explanation: "\"לשחק\" באנגלית זה \"play\"", category: "vocabulary", type: "recording", englishWord: "play", hebrewWord: "לשחק" },
    { id: 1008, text: "הקליט את עצמך אומר את המילה \"לקרוא\" באנגלית:", correct: "read", explanation: "\"לקרוא\" באנגלית זה \"read\"", category: "vocabulary", type: "recording", englishWord: "read", hebrewWord: "לקרוא" },
    { id: 1009, text: "הקליט את עצמך אומר את המילה \"לכתוב\" באנגלית:", correct: "write", explanation: "\"לכתוב\" באנגלית זה \"write\"", category: "vocabulary", type: "recording", englishWord: "write", hebrewWord: "לכתוב" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1010, text: "הקליט את עצמך אומר את המשפט: \"I am happy\" ואז בחר מה הפירוש של המילה \"am\" במשפט:", sentence: "I am happy", sentenceTranslation: "אני שמח", correct: 0, options: ["אני", "אתה", "הוא", "אנחנו"], explanation: "\"am\" במשפט זה אומרת \"אני\"", category: "vocabulary", type: "sentence-recording", englishWord: "am", hebrewWord: "אני" },
    { id: 1011, text: "הקליט את עצמך אומר את המשפט: \"He is tall\" ואז בחר מה הפירוש של המילה \"is\" במשפט:", sentence: "He is tall", sentenceTranslation: "הוא גבוה", correct: 2, options: ["אני", "אתה", "הוא", "אנחנו"], explanation: "\"is\" במשפט זה אומרת \"הוא\"", category: "vocabulary", type: "sentence-recording", englishWord: "is", hebrewWord: "הוא" },
    { id: 1012, text: "הקליט את עצמך אומר את המשפט: \"We are friends\" ואז בחר מה הפירוש של המילה \"are\" במשפט:", sentence: "We are friends", sentenceTranslation: "אנחנו חברים", correct: 3, options: ["אני", "אתה", "הוא", "אנחנו"], explanation: "\"are\" במשפט זה אומרת \"אנחנו\"", category: "vocabulary", type: "sentence-recording", englishWord: "are", hebrewWord: "אנחנו" },
    { id: 1013, text: "הקליט את עצמך אומר את המשפט: \"I go to school\" ואז בחר מה הפירוש של המילה \"go\" במשפט:", sentence: "I go to school", sentenceTranslation: "אני הולך לבית ספר", correct: 0, options: ["ללכת", "לבוא", "לאכול", "לשתות"], explanation: "\"go\" במשפט זה אומרת \"ללכת\"", category: "vocabulary", type: "sentence-recording", englishWord: "go", hebrewWord: "ללכת" },
    { id: 1014, text: "הקליט את עצמך אומר את המשפט: \"I come home\" ואז בחר מה הפירוש של המילה \"come\" במשפט:", sentence: "I come home", sentenceTranslation: "אני בא הביתה", correct: 1, options: ["ללכת", "לבוא", "לאכול", "לשתות"], explanation: "\"come\" במשפט זה אומרת \"לבוא\"", category: "vocabulary", type: "sentence-recording", englishWord: "come", hebrewWord: "לבוא" },
    { id: 1015, text: "הקליט את עצמך אומר את המשפט: \"I eat breakfast\" ואז בחר מה הפירוש של המילה \"eat\" במשפט:", sentence: "I eat breakfast", sentenceTranslation: "אני אוכל ארוחת בוקר", correct: 2, options: ["ללכת", "לבוא", "לאכול", "לשתות"], explanation: "\"eat\" במשפט זה אומרת \"לאכול\"", category: "vocabulary", type: "sentence-recording", englishWord: "eat", hebrewWord: "לאכול" },
    { id: 1016, text: "הקליט את עצמך אומר את המשפט: \"I drink water\" ואז בחר מה הפירוש של המילה \"drink\" במשפט:", sentence: "I drink water", sentenceTranslation: "אני שותה מים", correct: 3, options: ["ללכת", "לבוא", "לאכול", "לשתות"], explanation: "\"drink\" במשפט זה אומרת \"לשתות\"", category: "vocabulary", type: "sentence-recording", englishWord: "drink", hebrewWord: "לשתות" },
    { id: 1017, text: "הקליט את עצמך אומר את המשפט: \"I play soccer\" ואז בחר מה הפירוש של המילה \"play\" במשפט:", sentence: "I play soccer", sentenceTranslation: "אני משחק כדורגל", correct: 0, options: ["לשחק", "לקרוא", "לכתוב", "לראות"], explanation: "\"play\" במשפט זה אומרת \"לשחק\"", category: "vocabulary", type: "sentence-recording", englishWord: "play", hebrewWord: "לשחק" },
    { id: 1018, text: "הקליט את עצמך אומר את המשפט: \"I read a book\" ואז בחר מה הפירוש של המילה \"read\" במשפט:", sentence: "I read a book", sentenceTranslation: "אני קורא ספר", correct: 1, options: ["לשחק", "לקרוא", "לכתוב", "לראות"], explanation: "\"read\" במשפט זה אומרת \"לקרוא\"", category: "vocabulary", type: "sentence-recording", englishWord: "read", hebrewWord: "לקרוא" },
    { id: 1019, text: "הקליט את עצמך אומר את המשפט: \"I write a letter\" ואז בחר מה הפירוש של המילה \"write\" במשפט:", sentence: "I write a letter", sentenceTranslation: "אני כותב מכתב", correct: 2, options: ["לשחק", "לקרוא", "לכתוב", "לראות"], explanation: "\"write\" במשפט זה אומרת \"לכתוב\"", category: "vocabulary", type: "sentence-recording", englishWord: "write", hebrewWord: "לכתוב" }
    ],
    '2': [ // רמה 2 - בסיסי - פעלים נוספים
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1020, text: "מה אומרת המילה \"have\"?", options: ["יש לי", "יש לו", "עושה", "יכול"], correct: 0, explanation: "\"have\" אומרת \"יש לי\"", category: "vocabulary", type: "multiple-choice", englishWord: "have", hebrewWord: "יש לי" },
    { id: 1021, text: "מה אומרת המילה \"has\"?", options: ["יש לי", "יש לו", "עושה", "יכול"], correct: 1, explanation: "\"has\" אומרת \"יש לו\"", category: "vocabulary", type: "multiple-choice", englishWord: "has", hebrewWord: "יש לו" },
    { id: 1022, text: "מה אומרת המילה \"do\"?", options: ["יש לי", "יש לו", "עושה", "יכול"], correct: 2, explanation: "\"do\" אומרת \"עושה\"", category: "vocabulary", type: "multiple-choice", englishWord: "do", hebrewWord: "עושה" },
    { id: 1023, text: "מה אומרת המילה \"does\"?", options: ["יש לי", "יש לו", "עושה", "יכול"], correct: 2, explanation: "\"does\" אומרת \"עושה\"", category: "vocabulary", type: "multiple-choice", englishWord: "does", hebrewWord: "עושה" },
    { id: 1024, text: "מה אומרת המילה \"can\"?", options: ["יש לי", "יש לו", "עושה", "יכול"], correct: 3, explanation: "\"can\" אומרת \"יכול\"", category: "vocabulary", type: "multiple-choice", englishWord: "can", hebrewWord: "יכול" },
    { id: 1025, text: "מה אומרת המילה \"will\"?", options: ["רוצה", "אוהב", "יהיה", "היה"], correct: 2, explanation: "\"will\" אומרת \"יהיה\"", category: "vocabulary", type: "multiple-choice", englishWord: "will", hebrewWord: "יהיה" },
    { id: 1026, text: "מה אומרת המילה \"want\"?", options: ["רוצה", "אוהב", "יהיה", "היה"], correct: 0, explanation: "\"want\" אומרת \"רוצה\"", category: "vocabulary", type: "multiple-choice", englishWord: "want", hebrewWord: "רוצה" },
    { id: 1027, text: "מה אומרת המילה \"like\"?", options: ["רוצה", "אוהב", "יהיה", "היה"], correct: 1, explanation: "\"like\" אומרת \"אוהב\"", category: "vocabulary", type: "multiple-choice", englishWord: "like", hebrewWord: "אוהב" },
    { id: 1028, text: "מה אומרת המילה \"love\"?", options: ["רוצה", "אוהב", "אוהב מאוד", "שונא"], correct: 2, explanation: "\"love\" אומרת \"אוהב מאוד\"", category: "vocabulary", type: "multiple-choice", englishWord: "love", hebrewWord: "אוהב מאוד" },
    { id: 1029, text: "מה אומרת המילה \"see\"?", options: ["לראות", "לשמוע", "לחשוב", "לדעת"], correct: 0, explanation: "\"see\" אומרת \"לראות\"", category: "vocabulary", type: "multiple-choice", englishWord: "see", hebrewWord: "לראות" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1030, text: "הכתיב את המילה \"יש לי\" באנגלית:", correct: "have", explanation: "\"יש לי\" באנגלית זה \"have\"", category: "vocabulary", type: "dictation", englishWord: "have", hebrewWord: "יש לי" },
    { id: 1031, text: "הכתיב את המילה \"יש לו\" באנגלית:", correct: "has", explanation: "\"יש לו\" באנגלית זה \"has\"", category: "vocabulary", type: "dictation", englishWord: "has", hebrewWord: "יש לו" },
    { id: 1032, text: "הכתיב את המילה \"עושה\" באנגלית:", correct: "do", explanation: "\"עושה\" באנגלית זה \"do\"", category: "vocabulary", type: "dictation", englishWord: "do", hebrewWord: "עושה" },
    { id: 1033, text: "הכתיב את המילה \"יכול\" באנגלית:", correct: "can", explanation: "\"יכול\" באנגלית זה \"can\"", category: "vocabulary", type: "dictation", englishWord: "can", hebrewWord: "יכול" },
    { id: 1034, text: "הכתיב את המילה \"יהיה\" באנגלית:", correct: "will", explanation: "\"יהיה\" באנגלית זה \"will\"", category: "vocabulary", type: "dictation", englishWord: "will", hebrewWord: "יהיה" },
    { id: 1035, text: "הכתיב את המילה \"רוצה\" באנגלית:", correct: "want", explanation: "\"רוצה\" באנגלית זה \"want\"", category: "vocabulary", type: "dictation", englishWord: "want", hebrewWord: "רוצה" },
    { id: 1036, text: "הכתיב את המילה \"אוהב\" באנגלית:", correct: "like", explanation: "\"אוהב\" באנגלית זה \"like\"", category: "vocabulary", type: "dictation", englishWord: "like", hebrewWord: "אוהב" },
    { id: 1037, text: "הכתיב את המילה \"אוהב מאוד\" באנגלית:", correct: "love", explanation: "\"אוהב מאוד\" באנגלית זה \"love\"", category: "vocabulary", type: "dictation", englishWord: "love", hebrewWord: "אוהב מאוד" },
    { id: 1038, text: "הכתיב את המילה \"לראות\" באנגלית:", correct: "see", explanation: "\"לראות\" באנגלית זה \"see\"", category: "vocabulary", type: "dictation", englishWord: "see", hebrewWord: "לראות" },
    { id: 1039, text: "הכתיב את המילה \"עושה\" באנגלית (does):", correct: "does", explanation: "\"עושה\" באנגלית זה \"does\"", category: "vocabulary", type: "dictation", englishWord: "does", hebrewWord: "עושה" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1040, text: "הקליט את עצמך אומר את המילה \"יש לי\" באנגלית:", correct: "have", explanation: "\"יש לי\" באנגלית זה \"have\"", category: "vocabulary", type: "recording", englishWord: "have", hebrewWord: "יש לי" },
    { id: 1041, text: "הקליט את עצמך אומר את המילה \"יש לו\" באנגלית:", correct: "has", explanation: "\"יש לו\" באנגלית זה \"has\"", category: "vocabulary", type: "recording", englishWord: "has", hebrewWord: "יש לו" },
    { id: 1042, text: "הקליט את עצמך אומר את המילה \"עושה\" באנגלית:", correct: "do", explanation: "\"עושה\" באנגלית זה \"do\"", category: "vocabulary", type: "recording", englishWord: "do", hebrewWord: "עושה" },
    { id: 1043, text: "הקליט את עצמך אומר את המילה \"יכול\" באנגלית:", correct: "can", explanation: "\"יכול\" באנגלית זה \"can\"", category: "vocabulary", type: "recording", englishWord: "can", hebrewWord: "יכול" },
    { id: 1044, text: "הקליט את עצמך אומר את המילה \"יהיה\" באנגלית:", correct: "will", explanation: "\"יהיה\" באנגלית זה \"will\"", category: "vocabulary", type: "recording", englishWord: "will", hebrewWord: "יהיה" },
    { id: 1045, text: "הקליט את עצמך אומר את המילה \"רוצה\" באנגלית:", correct: "want", explanation: "\"רוצה\" באנגלית זה \"want\"", category: "vocabulary", type: "recording", englishWord: "want", hebrewWord: "רוצה" },
    { id: 1046, text: "הקליט את עצמך אומר את המילה \"אוהב\" באנגלית:", correct: "like", explanation: "\"אוהב\" באנגלית זה \"like\"", category: "vocabulary", type: "recording", englishWord: "like", hebrewWord: "אוהב" },
    { id: 1047, text: "הקליט את עצמך אומר את המילה \"אוהב מאוד\" באנגלית:", correct: "love", explanation: "\"אוהב מאוד\" באנגלית זה \"love\"", category: "vocabulary", type: "recording", englishWord: "love", hebrewWord: "אוהב מאוד" },
    { id: 1048, text: "הקליט את עצמך אומר את המילה \"לראות\" באנגלית:", correct: "see", explanation: "\"לראות\" באנגלית זה \"see\"", category: "vocabulary", type: "recording", englishWord: "see", hebrewWord: "לראות" },
    { id: 1049, text: "הקליט את עצמך אומר את המילה \"עושה\" באנגלית (does):", correct: "does", explanation: "\"עושה\" באנגלית זה \"does\"", category: "vocabulary", type: "recording", englishWord: "does", hebrewWord: "עושה" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1050, text: "הקליט את עצמך אומר את המשפט: \"I have a book\" ואז בחר מה הפירוש של המילה \"have\" במשפט:", sentence: "I have a book", sentenceTranslation: "יש לי ספר", correct: 0, options: ["יש לי", "יש לו", "עושה", "יכול"], explanation: "\"have\" במשפט זה אומרת \"יש לי\"", category: "vocabulary", type: "sentence-recording", englishWord: "have", hebrewWord: "יש לי" },
    { id: 1051, text: "הקליט את עצמך אומר את המשפט: \"He has a car\" ואז בחר מה הפירוש של המילה \"has\" במשפט:", sentence: "He has a car", sentenceTranslation: "יש לו מכונית", correct: 1, options: ["יש לי", "יש לו", "עושה", "יכול"], explanation: "\"has\" במשפט זה אומרת \"יש לו\"", category: "vocabulary", type: "sentence-recording", englishWord: "has", hebrewWord: "יש לו" },
    { id: 1052, text: "הקליט את עצמך אומר את המשפט: \"I do homework\" ואז בחר מה הפירוש של המילה \"do\" במשפט:", sentence: "I do homework", sentenceTranslation: "אני עושה שיעורי בית", correct: 2, options: ["יש לי", "יש לו", "עושה", "יכול"], explanation: "\"do\" במשפט זה אומרת \"עושה\"", category: "vocabulary", type: "sentence-recording", englishWord: "do", hebrewWord: "עושה" },
    { id: 1053, text: "הקליט את עצמך אומר את המשפט: \"I can swim\" ואז בחר מה הפירוש של המילה \"can\" במשפט:", sentence: "I can swim", sentenceTranslation: "אני יכול לשחות", correct: 3, options: ["יש לי", "יש לו", "עושה", "יכול"], explanation: "\"can\" במשפט זה אומרת \"יכול\"", category: "vocabulary", type: "sentence-recording", englishWord: "can", hebrewWord: "יכול" },
    { id: 1054, text: "הקליט את עצמך אומר את המשפט: \"I will go\" ואז בחר מה הפירוש של המילה \"will\" במשפט:", sentence: "I will go", sentenceTranslation: "אני אלך", correct: 2, options: ["רוצה", "אוהב", "יהיה", "היה"], explanation: "\"will\" במשפט זה אומרת \"יהיה\"", category: "vocabulary", type: "sentence-recording", englishWord: "will", hebrewWord: "יהיה" },
    { id: 1055, text: "הקליט את עצמך אומר את המשפט: \"I want ice cream\" ואז בחר מה הפירוש של המילה \"want\" במשפט:", sentence: "I want ice cream", sentenceTranslation: "אני רוצה גלידה", correct: 0, options: ["רוצה", "אוהב", "יהיה", "היה"], explanation: "\"want\" במשפט זה אומרת \"רוצה\"", category: "vocabulary", type: "sentence-recording", englishWord: "want", hebrewWord: "רוצה" },
    { id: 1056, text: "הקליט את עצמך אומר את המשפט: \"I like music\" ואז בחר מה הפירוש של המילה \"like\" במשפט:", sentence: "I like music", sentenceTranslation: "אני אוהב מוזיקה", correct: 1, options: ["רוצה", "אוהב", "יהיה", "היה"], explanation: "\"like\" במשפט זה אומרת \"אוהב\"", category: "vocabulary", type: "sentence-recording", englishWord: "like", hebrewWord: "אוהב" },
    { id: 1057, text: "הקליט את עצמך אומר את המשפט: \"I love my family\" ואז בחר מה הפירוש של המילה \"love\" במשפט:", sentence: "I love my family", sentenceTranslation: "אני אוהב מאוד את המשפחה שלי", correct: 2, options: ["רוצה", "אוהב", "אוהב מאוד", "שונא"], explanation: "\"love\" במשפט זה אומרת \"אוהב מאוד\"", category: "vocabulary", type: "sentence-recording", englishWord: "love", hebrewWord: "אוהב מאוד" },
    { id: 1058, text: "הקליט את עצמך אומר את המשפט: \"I see a bird\" ואז בחר מה הפירוש של המילה \"see\" במשפט:", sentence: "I see a bird", sentenceTranslation: "אני רואה ציפור", correct: 0, options: ["לראות", "לשמוע", "לחשוב", "לדעת"], explanation: "\"see\" במשפט זה אומרת \"לראות\"", category: "vocabulary", type: "sentence-recording", englishWord: "see", hebrewWord: "לראות" },
    { id: 1059, text: "הקליט את עצמך אומר את המשפט: \"She does her work\" ואז בחר מה הפירוש של המילה \"does\" במשפט:", sentence: "She does her work", sentenceTranslation: "היא עושה את העבודה שלה", correct: 2, options: ["יש לי", "יש לו", "עושה", "יכול"], explanation: "\"does\" במשפט זה אומרת \"עושה\"", category: "vocabulary", type: "sentence-recording", englishWord: "does", hebrewWord: "עושה" }
    ],
    '3': [ // רמה 3 - בינוני - מילות שאלה
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1060, text: "מה אומרת המילה \"what\"?", options: ["מה", "מי", "איפה", "מתי"], correct: 0, explanation: "\"what\" אומרת \"מה\"", category: "vocabulary", type: "multiple-choice", englishWord: "what", hebrewWord: "מה" },
    { id: 1061, text: "מה אומרת המילה \"who\"?", options: ["מה", "מי", "איפה", "מתי"], correct: 1, explanation: "\"who\" אומרת \"מי\"", category: "vocabulary", type: "multiple-choice", englishWord: "who", hebrewWord: "מי" },
    { id: 1062, text: "מה אומרת המילה \"where\"?", options: ["מה", "מי", "איפה", "מתי"], correct: 2, explanation: "\"where\" אומרת \"איפה\"", category: "vocabulary", type: "multiple-choice", englishWord: "where", hebrewWord: "איפה" },
    { id: 1063, text: "מה אומרת המילה \"when\"?", options: ["מה", "מי", "איפה", "מתי"], correct: 3, explanation: "\"when\" אומרת \"מתי\"", category: "vocabulary", type: "multiple-choice", englishWord: "when", hebrewWord: "מתי" },
    { id: 1064, text: "מה אומרת המילה \"why\"?", options: ["למה", "איך", "איזה", "של מי"], correct: 0, explanation: "\"why\" אומרת \"למה\"", category: "vocabulary", type: "multiple-choice", englishWord: "why", hebrewWord: "למה" },
    { id: 1065, text: "מה אומרת המילה \"how\"?", options: ["למה", "איך", "איזה", "של מי"], correct: 1, explanation: "\"how\" אומרת \"איך\"", category: "vocabulary", type: "multiple-choice", englishWord: "how", hebrewWord: "איך" },
    { id: 1066, text: "מה אומרת המילה \"which\"?", options: ["למה", "איך", "איזה", "של מי"], correct: 2, explanation: "\"which\" אומרת \"איזה\"", category: "vocabulary", type: "multiple-choice", englishWord: "which", hebrewWord: "איזה" },
    { id: 1067, text: "מה אומרת המילה \"whose\"?", options: ["למה", "איך", "איזה", "של מי"], correct: 3, explanation: "\"whose\" אומרת \"של מי\"", category: "vocabulary", type: "multiple-choice", englishWord: "whose", hebrewWord: "של מי" },
    { id: 1068, text: "מה אומרת המילה \"think\"?", options: ["לחשוב", "לדעת", "לזכור", "לשכוח"], correct: 0, explanation: "\"think\" אומרת \"לחשוב\"", category: "vocabulary", type: "multiple-choice", englishWord: "think", hebrewWord: "לחשוב" },
    { id: 1069, text: "מה אומרת המילה \"know\"?", options: ["לחשוב", "לדעת", "לזכור", "לשכוח"], correct: 1, explanation: "\"know\" אומרת \"לדעת\"", category: "vocabulary", type: "multiple-choice", englishWord: "know", hebrewWord: "לדעת" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1070, text: "הכתיב את המילה \"מה\" באנגלית:", correct: "what", explanation: "\"מה\" באנגלית זה \"what\"", category: "vocabulary", type: "dictation", englishWord: "what", hebrewWord: "מה" },
    { id: 1071, text: "הכתיב את המילה \"מי\" באנגלית:", correct: "who", explanation: "\"מי\" באנגלית זה \"who\"", category: "vocabulary", type: "dictation", englishWord: "who", hebrewWord: "מי" },
    { id: 1072, text: "הכתיב את המילה \"איפה\" באנגלית:", correct: "where", explanation: "\"איפה\" באנגלית זה \"where\"", category: "vocabulary", type: "dictation", englishWord: "where", hebrewWord: "איפה" },
    { id: 1073, text: "הכתיב את המילה \"מתי\" באנגלית:", correct: "when", explanation: "\"מתי\" באנגלית זה \"when\"", category: "vocabulary", type: "dictation", englishWord: "when", hebrewWord: "מתי" },
    { id: 1074, text: "הכתיב את המילה \"למה\" באנגלית:", correct: "why", explanation: "\"למה\" באנגלית זה \"why\"", category: "vocabulary", type: "dictation", englishWord: "why", hebrewWord: "למה" },
    { id: 1075, text: "הכתיב את המילה \"איך\" באנגלית:", correct: "how", explanation: "\"איך\" באנגלית זה \"how\"", category: "vocabulary", type: "dictation", englishWord: "how", hebrewWord: "איך" },
    { id: 1076, text: "הכתיב את המילה \"איזה\" באנגלית:", correct: "which", explanation: "\"איזה\" באנגלית זה \"which\"", category: "vocabulary", type: "dictation", englishWord: "which", hebrewWord: "איזה" },
    { id: 1077, text: "הכתיב את המילה \"של מי\" באנגלית:", correct: "whose", explanation: "\"של מי\" באנגלית זה \"whose\"", category: "vocabulary", type: "dictation", englishWord: "whose", hebrewWord: "של מי" },
    { id: 1078, text: "הכתיב את המילה \"לחשוב\" באנגלית:", correct: "think", explanation: "\"לחשוב\" באנגלית זה \"think\"", category: "vocabulary", type: "dictation", englishWord: "think", hebrewWord: "לחשוב" },
    { id: 1079, text: "הכתיב את המילה \"לדעת\" באנגלית:", correct: "know", explanation: "\"לדעת\" באנגלית זה \"know\"", category: "vocabulary", type: "dictation", englishWord: "know", hebrewWord: "לדעת" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1080, text: "הקליט את עצמך אומר את המילה \"מה\" באנגלית:", correct: "what", explanation: "\"מה\" באנגלית זה \"what\"", category: "vocabulary", type: "recording", englishWord: "what", hebrewWord: "מה" },
    { id: 1081, text: "הקליט את עצמך אומר את המילה \"מי\" באנגלית:", correct: "who", explanation: "\"מי\" באנגלית זה \"who\"", category: "vocabulary", type: "recording", englishWord: "who", hebrewWord: "מי" },
    { id: 1082, text: "הקליט את עצמך אומר את המילה \"איפה\" באנגלית:", correct: "where", explanation: "\"איפה\" באנגלית זה \"where\"", category: "vocabulary", type: "recording", englishWord: "where", hebrewWord: "איפה" },
    { id: 1083, text: "הקליט את עצמך אומר את המילה \"מתי\" באנגלית:", correct: "when", explanation: "\"מתי\" באנגלית זה \"when\"", category: "vocabulary", type: "recording", englishWord: "when", hebrewWord: "מתי" },
    { id: 1084, text: "הקליט את עצמך אומר את המילה \"למה\" באנגלית:", correct: "why", explanation: "\"למה\" באנגלית זה \"why\"", category: "vocabulary", type: "recording", englishWord: "why", hebrewWord: "למה" },
    { id: 1085, text: "הקליט את עצמך אומר את המילה \"איך\" באנגלית:", correct: "how", explanation: "\"איך\" באנגלית זה \"how\"", category: "vocabulary", type: "recording", englishWord: "how", hebrewWord: "איך" },
    { id: 1086, text: "הקליט את עצמך אומר את המילה \"איזה\" באנגלית:", correct: "which", explanation: "\"איזה\" באנגלית זה \"which\"", category: "vocabulary", type: "recording", englishWord: "which", hebrewWord: "איזה" },
    { id: 1087, text: "הקליט את עצמך אומר את המילה \"של מי\" באנגלית:", correct: "whose", explanation: "\"של מי\" באנגלית זה \"whose\"", category: "vocabulary", type: "recording", englishWord: "whose", hebrewWord: "של מי" },
    { id: 1088, text: "הקליט את עצמך אומר את המילה \"לחשוב\" באנגלית:", correct: "think", explanation: "\"לחשוב\" באנגלית זה \"think\"", category: "vocabulary", type: "recording", englishWord: "think", hebrewWord: "לחשוב" },
    { id: 1089, text: "הקליט את עצמך אומר את המילה \"לדעת\" באנגלית:", correct: "know", explanation: "\"לדעת\" באנגלית זה \"know\"", category: "vocabulary", type: "recording", englishWord: "know", hebrewWord: "לדעת" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1090, text: "הקליט את עצמך אומר את המשפט: \"What is your name?\" ואז בחר מה הפירוש של המילה \"what\" במשפט:", sentence: "What is your name?", sentenceTranslation: "מה השם שלך?", correct: 0, options: ["מה", "מי", "איפה", "מתי"], explanation: "\"what\" במשפט זה אומרת \"מה\"", category: "vocabulary", type: "sentence-recording", englishWord: "what", hebrewWord: "מה" },
    { id: 1091, text: "הקליט את עצמך אומר את המשפט: \"Who is that?\" ואז בחר מה הפירוש של המילה \"who\" במשפט:", sentence: "Who is that?", sentenceTranslation: "מי זה?", correct: 1, options: ["מה", "מי", "איפה", "מתי"], explanation: "\"who\" במשפט זה אומרת \"מי\"", category: "vocabulary", type: "sentence-recording", englishWord: "who", hebrewWord: "מי" },
    { id: 1092, text: "הקליט את עצמך אומר את המשפט: \"Where are you?\" ואז בחר מה הפירוש של המילה \"where\" במשפט:", sentence: "Where are you?", sentenceTranslation: "איפה אתה?", correct: 2, options: ["מה", "מי", "איפה", "מתי"], explanation: "\"where\" במשפט זה אומרת \"איפה\"", category: "vocabulary", type: "sentence-recording", englishWord: "where", hebrewWord: "איפה" },
    { id: 1093, text: "הקליט את עצמך אומר את המשפט: \"When do you go?\" ואז בחר מה הפירוש של המילה \"when\" במשפט:", sentence: "When do you go?", sentenceTranslation: "מתי אתה הולך?", correct: 3, options: ["מה", "מי", "איפה", "מתי"], explanation: "\"when\" במשפט זה אומרת \"מתי\"", category: "vocabulary", type: "sentence-recording", englishWord: "when", hebrewWord: "מתי" },
    { id: 1094, text: "הקליט את עצמך אומר את המשפט: \"Why are you sad?\" ואז בחר מה הפירוש של המילה \"why\" במשפט:", sentence: "Why are you sad?", sentenceTranslation: "למה אתה עצוב?", correct: 0, options: ["למה", "איך", "איזה", "של מי"], explanation: "\"why\" במשפט זה אומרת \"למה\"", category: "vocabulary", type: "sentence-recording", englishWord: "why", hebrewWord: "למה" },
    { id: 1095, text: "הקליט את עצמך אומר את המשפט: \"How are you?\" ואז בחר מה הפירוש של המילה \"how\" במשפט:", sentence: "How are you?", sentenceTranslation: "איך אתה?", correct: 1, options: ["למה", "איך", "איזה", "של מי"], explanation: "\"how\" במשפט זה אומרת \"איך\"", category: "vocabulary", type: "sentence-recording", englishWord: "how", hebrewWord: "איך" },
    { id: 1096, text: "הקליט את עצמך אומר את המשפט: \"Which book do you want?\" ואז בחר מה הפירוש של המילה \"which\" במשפט:", sentence: "Which book do you want?", sentenceTranslation: "איזה ספר אתה רוצה?", correct: 2, options: ["למה", "איך", "איזה", "של מי"], explanation: "\"which\" במשפט זה אומרת \"איזה\"", category: "vocabulary", type: "sentence-recording", englishWord: "which", hebrewWord: "איזה" },
    { id: 1097, text: "הקליט את עצמך אומר את המשפט: \"Whose bag is this?\" ואז בחר מה הפירוש של המילה \"whose\" במשפט:", sentence: "Whose bag is this?", sentenceTranslation: "של מי התיק הזה?", correct: 3, options: ["למה", "איך", "איזה", "של מי"], explanation: "\"whose\" במשפט זה אומרת \"של מי\"", category: "vocabulary", type: "sentence-recording", englishWord: "whose", hebrewWord: "של מי" },
    { id: 1098, text: "הקליט את עצמך אומר את המשפט: \"I think about you\" ואז בחר מה הפירוש של המילה \"think\" במשפט:", sentence: "I think about you", sentenceTranslation: "אני חושב עליך", correct: 0, options: ["לחשוב", "לדעת", "לזכור", "לשכוח"], explanation: "\"think\" במשפט זה אומרת \"לחשוב\"", category: "vocabulary", type: "sentence-recording", englishWord: "think", hebrewWord: "לחשוב" },
    { id: 1099, text: "הקליט את עצמך אומר את המשפט: \"I know the answer\" ואז בחר מה הפירוש של המילה \"know\" במשפט:", sentence: "I know the answer", sentenceTranslation: "אני יודע את התשובה", correct: 1, options: ["לחשוב", "לדעת", "לזכור", "לשכוח"], explanation: "\"know\" במשפט זה אומרת \"לדעת\"", category: "vocabulary", type: "sentence-recording", englishWord: "know", hebrewWord: "לדעת" }
    ],
    '4': [ // רמה 4 - מתקדם - מילות קישור
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1100, text: "מה אומרת המילה \"and\"?", options: ["ו", "או", "אבל", "כי"], correct: 0, explanation: "\"and\" אומרת \"ו\"", category: "vocabulary", type: "multiple-choice", englishWord: "and", hebrewWord: "ו" },
    { id: 1101, text: "מה אומרת המילה \"or\"?", options: ["ו", "או", "אבל", "כי"], correct: 1, explanation: "\"or\" אומרת \"או\"", category: "vocabulary", type: "multiple-choice", englishWord: "or", hebrewWord: "או" },
    { id: 1102, text: "מה אומרת המילה \"but\"?", options: ["ו", "או", "אבל", "כי"], correct: 2, explanation: "\"but\" אומרת \"אבל\"", category: "vocabulary", type: "multiple-choice", englishWord: "but", hebrewWord: "אבל" },
    { id: 1103, text: "מה אומרת המילה \"because\"?", options: ["ו", "או", "אבל", "כי"], correct: 3, explanation: "\"because\" אומרת \"כי\"", category: "vocabulary", type: "multiple-choice", englishWord: "because", hebrewWord: "כי" },
    { id: 1104, text: "מה אומרת המילה \"if\"?", options: ["אם", "אז", "כך", "עם"], correct: 0, explanation: "\"if\" אומרת \"אם\"", category: "vocabulary", type: "multiple-choice", englishWord: "if", hebrewWord: "אם" },
    { id: 1105, text: "מה אומרת המילה \"then\"?", options: ["אם", "אז", "כך", "עם"], correct: 1, explanation: "\"then\" אומרת \"אז\"", category: "vocabulary", type: "multiple-choice", englishWord: "then", hebrewWord: "אז" },
    { id: 1106, text: "מה אומרת המילה \"so\"?", options: ["אם", "אז", "כך", "עם"], correct: 2, explanation: "\"so\" אומרת \"כך\"", category: "vocabulary", type: "multiple-choice", englishWord: "so", hebrewWord: "כך" },
    { id: 1107, text: "מה אומרת המילה \"with\"?", options: ["אם", "אז", "כך", "עם"], correct: 3, explanation: "\"with\" אומרת \"עם\"", category: "vocabulary", type: "multiple-choice", englishWord: "with", hebrewWord: "עם" },
    { id: 1108, text: "מה אומרת המילה \"big\"?", options: ["גדול", "קטן", "טוב", "רע"], correct: 0, explanation: "\"big\" אומרת \"גדול\"", category: "vocabulary", type: "multiple-choice", englishWord: "big", hebrewWord: "גדול" },
    { id: 1109, text: "מה אומרת המילה \"small\"?", options: ["גדול", "קטן", "טוב", "רע"], correct: 1, explanation: "\"small\" אומרת \"קטן\"", category: "vocabulary", type: "multiple-choice", englishWord: "small", hebrewWord: "קטן" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1110, text: "הכתיב את המילה \"ו\" באנגלית:", correct: "and", explanation: "\"ו\" באנגלית זה \"and\"", category: "vocabulary", type: "dictation", englishWord: "and", hebrewWord: "ו" },
    { id: 1111, text: "הכתיב את המילה \"או\" באנגלית:", correct: "or", explanation: "\"או\" באנגלית זה \"or\"", category: "vocabulary", type: "dictation", englishWord: "or", hebrewWord: "או" },
    { id: 1112, text: "הכתיב את המילה \"אבל\" באנגלית:", correct: "but", explanation: "\"אבל\" באנגלית זה \"but\"", category: "vocabulary", type: "dictation", englishWord: "but", hebrewWord: "אבל" },
    { id: 1113, text: "הכתיב את המילה \"כי\" באנגלית:", correct: "because", explanation: "\"כי\" באנגלית זה \"because\"", category: "vocabulary", type: "dictation", englishWord: "because", hebrewWord: "כי" },
    { id: 1114, text: "הכתיב את המילה \"אם\" באנגלית:", correct: "if", explanation: "\"אם\" באנגלית זה \"if\"", category: "vocabulary", type: "dictation", englishWord: "if", hebrewWord: "אם" },
    { id: 1115, text: "הכתיב את המילה \"אז\" באנגלית:", correct: "then", explanation: "\"אז\" באנגלית זה \"then\"", category: "vocabulary", type: "dictation", englishWord: "then", hebrewWord: "אז" },
    { id: 1116, text: "הכתיב את המילה \"כך\" באנגלית:", correct: "so", explanation: "\"כך\" באנגלית זה \"so\"", category: "vocabulary", type: "dictation", englishWord: "so", hebrewWord: "כך" },
    { id: 1117, text: "הכתיב את המילה \"עם\" באנגלית:", correct: "with", explanation: "\"עם\" באנגלית זה \"with\"", category: "vocabulary", type: "dictation", englishWord: "with", hebrewWord: "עם" },
    { id: 1118, text: "הכתיב את המילה \"גדול\" באנגלית:", correct: "big", explanation: "\"גדול\" באנגלית זה \"big\"", category: "vocabulary", type: "dictation", englishWord: "big", hebrewWord: "גדול" },
    { id: 1119, text: "הכתיב את המילה \"קטן\" באנגלית:", correct: "small", explanation: "\"קטן\" באנגלית זה \"small\"", category: "vocabulary", type: "dictation", englishWord: "small", hebrewWord: "קטן" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1120, text: "הקליט את עצמך אומר את המילה \"ו\" באנגלית:", correct: "and", explanation: "\"ו\" באנגלית זה \"and\"", category: "vocabulary", type: "recording", englishWord: "and", hebrewWord: "ו" },
    { id: 1121, text: "הקליט את עצמך אומר את המילה \"או\" באנגלית:", correct: "or", explanation: "\"או\" באנגלית זה \"or\"", category: "vocabulary", type: "recording", englishWord: "or", hebrewWord: "או" },
    { id: 1122, text: "הקליט את עצמך אומר את המילה \"אבל\" באנגלית:", correct: "but", explanation: "\"אבל\" באנגלית זה \"but\"", category: "vocabulary", type: "recording", englishWord: "but", hebrewWord: "אבל" },
    { id: 1123, text: "הקליט את עצמך אומר את המילה \"כי\" באנגלית:", correct: "because", explanation: "\"כי\" באנגלית זה \"because\"", category: "vocabulary", type: "recording", englishWord: "because", hebrewWord: "כי" },
    { id: 1124, text: "הקליט את עצמך אומר את המילה \"אם\" באנגלית:", correct: "if", explanation: "\"אם\" באנגלית זה \"if\"", category: "vocabulary", type: "recording", englishWord: "if", hebrewWord: "אם" },
    { id: 1125, text: "הקליט את עצמך אומר את המילה \"אז\" באנגלית:", correct: "then", explanation: "\"אז\" באנגלית זה \"then\"", category: "vocabulary", type: "recording", englishWord: "then", hebrewWord: "אז" },
    { id: 1126, text: "הקליט את עצמך אומר את המילה \"כך\" באנגלית:", correct: "so", explanation: "\"כך\" באנגלית זה \"so\"", category: "vocabulary", type: "recording", englishWord: "so", hebrewWord: "כך" },
    { id: 1127, text: "הקליט את עצמך אומר את המילה \"עם\" באנגלית:", correct: "with", explanation: "\"עם\" באנגלית זה \"with\"", category: "vocabulary", type: "recording", englishWord: "with", hebrewWord: "עם" },
    { id: 1128, text: "הקליט את עצמך אומר את המילה \"גדול\" באנגלית:", correct: "big", explanation: "\"גדול\" באנגלית זה \"big\"", category: "vocabulary", type: "recording", englishWord: "big", hebrewWord: "גדול" },
    { id: 1129, text: "הקליט את עצמך אומר את המילה \"קטן\" באנגלית:", correct: "small", explanation: "\"קטן\" באנגלית זה \"small\"", category: "vocabulary", type: "recording", englishWord: "small", hebrewWord: "קטן" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1130, text: "הקליט את עצמך אומר את המשפט: \"I like apples and oranges\" ואז בחר מה הפירוש של המילה \"and\" במשפט:", sentence: "I like apples and oranges", sentenceTranslation: "אני אוהב תפוחים ותפוזים", correct: 0, options: ["ו", "או", "אבל", "כי"], explanation: "\"and\" במשפט זה אומרת \"ו\"", category: "vocabulary", type: "sentence-recording", englishWord: "and", hebrewWord: "ו" },
    { id: 1131, text: "הקליט את עצמך אומר את המשפט: \"Do you want tea or coffee?\" ואז בחר מה הפירוש של המילה \"or\" במשפט:", sentence: "Do you want tea or coffee?", sentenceTranslation: "אתה רוצה תה או קפה?", correct: 1, options: ["ו", "או", "אבל", "כי"], explanation: "\"or\" במשפט זה אומרת \"או\"", category: "vocabulary", type: "sentence-recording", englishWord: "or", hebrewWord: "או" },
    { id: 1132, text: "הקליט את עצמך אומר את המשפט: \"I am tired but happy\" ואז בחר מה הפירוש של המילה \"but\" במשפט:", sentence: "I am tired but happy", sentenceTranslation: "אני עייף אבל שמח", correct: 2, options: ["ו", "או", "אבל", "כי"], explanation: "\"but\" במשפט זה אומרת \"אבל\"", category: "vocabulary", type: "sentence-recording", englishWord: "but", hebrewWord: "אבל" },
    { id: 1133, text: "הקליט את עצמך אומר את המשפט: \"I stay home because it rains\" ואז בחר מה הפירוש של המילה \"because\" במשפט:", sentence: "I stay home because it rains", sentenceTranslation: "אני נשאר בבית כי יורד גשם", correct: 3, options: ["ו", "או", "אבל", "כי"], explanation: "\"because\" במשפט זה אומרת \"כי\"", category: "vocabulary", type: "sentence-recording", englishWord: "because", hebrewWord: "כי" },
    { id: 1134, text: "הקליט את עצמך אומר את המשפט: \"If it rains, I stay home\" ואז בחר מה הפירוש של המילה \"if\" במשפט:", sentence: "If it rains, I stay home", sentenceTranslation: "אם יורד גשם, אני נשאר בבית", correct: 0, options: ["אם", "אז", "כך", "עם"], explanation: "\"if\" במשפט זה אומרת \"אם\"", category: "vocabulary", type: "sentence-recording", englishWord: "if", hebrewWord: "אם" },
    { id: 1135, text: "הקליט את עצמך אומר את המשפט: \"If you study, then you pass\" ואז בחר מה הפירוש של המילה \"then\" במשפט:", sentence: "If you study, then you pass", sentenceTranslation: "אם אתה לומד, אז אתה עובר", correct: 1, options: ["אם", "אז", "כך", "עם"], explanation: "\"then\" במשפט זה אומרת \"אז\"", category: "vocabulary", type: "sentence-recording", englishWord: "then", hebrewWord: "אז" },
    { id: 1136, text: "הקליט את עצמך אומר את המשפט: \"I am tired, so I rest\" ואז בחר מה הפירוש של המילה \"so\" במשפט:", sentence: "I am tired, so I rest", sentenceTranslation: "אני עייף, כך אני נח", correct: 2, options: ["אם", "אז", "כך", "עם"], explanation: "\"so\" במשפט זה אומרת \"כך\"", category: "vocabulary", type: "sentence-recording", englishWord: "so", hebrewWord: "כך" },
    { id: 1137, text: "הקליט את עצמך אומר את המשפט: \"I go with my friend\" ואז בחר מה הפירוש של המילה \"with\" במשפט:", sentence: "I go with my friend", sentenceTranslation: "אני הולך עם החבר שלי", correct: 3, options: ["אם", "אז", "כך", "עם"], explanation: "\"with\" במשפט זה אומרת \"עם\"", category: "vocabulary", type: "sentence-recording", englishWord: "with", hebrewWord: "עם" },
    { id: 1138, text: "הקליט את עצמך אומר את המשפט: \"I have a big house\" ואז בחר מה הפירוש של המילה \"big\" במשפט:", sentence: "I have a big house", sentenceTranslation: "יש לי בית גדול", correct: 0, options: ["גדול", "קטן", "טוב", "רע"], explanation: "\"big\" במשפט זה אומרת \"גדול\"", category: "vocabulary", type: "sentence-recording", englishWord: "big", hebrewWord: "גדול" },
    { id: 1139, text: "הקליט את עצמך אומר את המשפט: \"I have a small car\" ואז בחר מה הפירוש של המילה \"small\" במשפט:", sentence: "I have a small car", sentenceTranslation: "יש לי מכונית קטנה", correct: 1, options: ["גדול", "קטן", "טוב", "רע"], explanation: "\"small\" במשפט זה אומרת \"קטן\"", category: "vocabulary", type: "sentence-recording", englishWord: "small", hebrewWord: "קטן" }
    ],
    '5': [ // רמה 5 - מומחה - מילות תיאור ומבנה משפטים
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1140, text: "מה אומרת המילה \"good\"?", options: ["גדול", "קטן", "טוב", "רע"], correct: 2, explanation: "\"good\" אומרת \"טוב\"", category: "vocabulary", type: "multiple-choice", englishWord: "good", hebrewWord: "טוב" },
    { id: 1141, text: "מה אומרת המילה \"bad\"?", options: ["גדול", "קטן", "טוב", "רע"], correct: 3, explanation: "\"bad\" אומרת \"רע\"", category: "vocabulary", type: "multiple-choice", englishWord: "bad", hebrewWord: "רע" },
    { id: 1142, text: "מה אומרת המילה \"happy\"?", options: ["שמח", "עצוב", "חם", "קר"], correct: 0, explanation: "\"happy\" אומרת \"שמח\"", category: "vocabulary", type: "multiple-choice", englishWord: "happy", hebrewWord: "שמח" },
    { id: 1143, text: "מה אומרת המילה \"sad\"?", options: ["שמח", "עצוב", "חם", "קר"], correct: 1, explanation: "\"sad\" אומרת \"עצוב\"", category: "vocabulary", type: "multiple-choice", englishWord: "sad", hebrewWord: "עצוב" },
    { id: 1144, text: "מה אומרת המילה \"hot\"?", options: ["שמח", "עצוב", "חם", "קר"], correct: 2, explanation: "\"hot\" אומרת \"חם\"", category: "vocabulary", type: "multiple-choice", englishWord: "hot", hebrewWord: "חם" },
    { id: 1145, text: "מה אומרת המילה \"cold\"?", options: ["שמח", "עצוב", "חם", "קר"], correct: 3, explanation: "\"cold\" אומרת \"קר\"", category: "vocabulary", type: "multiple-choice", englishWord: "cold", hebrewWord: "קר" },
    { id: 1146, text: "מה אומרת המילה \"fast\"?", options: ["מהיר", "איטי", "קל", "קשה"], correct: 0, explanation: "\"fast\" אומרת \"מהיר\"", category: "vocabulary", type: "multiple-choice", englishWord: "fast", hebrewWord: "מהיר" },
    { id: 1147, text: "מה אומרת המילה \"slow\"?", options: ["מהיר", "איטי", "קל", "קשה"], correct: 1, explanation: "\"slow\" אומרת \"איטי\"", category: "vocabulary", type: "multiple-choice", englishWord: "slow", hebrewWord: "איטי" },
    { id: 1148, text: "מה אומרת המילה \"easy\"?", options: ["מהיר", "איטי", "קל", "קשה"], correct: 2, explanation: "\"easy\" אומרת \"קל\"", category: "vocabulary", type: "multiple-choice", englishWord: "easy", hebrewWord: "קל" },
    { id: 1149, text: "מה אומרת המילה \"hard\"?", options: ["מהיר", "איטי", "קל", "קשה"], correct: 3, explanation: "\"hard\" אומרת \"קשה\"", category: "vocabulary", type: "multiple-choice", englishWord: "hard", hebrewWord: "קשה" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1150, text: "הכתיב את המילה \"טוב\" באנגלית:", correct: "good", explanation: "\"טוב\" באנגלית זה \"good\"", category: "vocabulary", type: "dictation", englishWord: "good", hebrewWord: "טוב" },
    { id: 1151, text: "הכתיב את המילה \"רע\" באנגלית:", correct: "bad", explanation: "\"רע\" באנגלית זה \"bad\"", category: "vocabulary", type: "dictation", englishWord: "bad", hebrewWord: "רע" },
    { id: 1152, text: "הכתיב את המילה \"שמח\" באנגלית:", correct: "happy", explanation: "\"שמח\" באנגלית זה \"happy\"", category: "vocabulary", type: "dictation", englishWord: "happy", hebrewWord: "שמח" },
    { id: 1153, text: "הכתיב את המילה \"עצוב\" באנגלית:", correct: "sad", explanation: "\"עצוב\" באנגלית זה \"sad\"", category: "vocabulary", type: "dictation", englishWord: "sad", hebrewWord: "עצוב" },
    { id: 1154, text: "הכתיב את המילה \"חם\" באנגלית:", correct: "hot", explanation: "\"חם\" באנגלית זה \"hot\"", category: "vocabulary", type: "dictation", englishWord: "hot", hebrewWord: "חם" },
    { id: 1155, text: "הכתיב את המילה \"קר\" באנגלית:", correct: "cold", explanation: "\"קר\" באנגלית זה \"cold\"", category: "vocabulary", type: "dictation", englishWord: "cold", hebrewWord: "קר" },
    { id: 1156, text: "הכתיב את המילה \"מהיר\" באנגלית:", correct: "fast", explanation: "\"מהיר\" באנגלית זה \"fast\"", category: "vocabulary", type: "dictation", englishWord: "fast", hebrewWord: "מהיר" },
    { id: 1157, text: "הכתיב את המילה \"איטי\" באנגלית:", correct: "slow", explanation: "\"איטי\" באנגלית זה \"slow\"", category: "vocabulary", type: "dictation", englishWord: "slow", hebrewWord: "איטי" },
    { id: 1158, text: "הכתיב את המילה \"קל\" באנגלית:", correct: "easy", explanation: "\"קל\" באנגלית זה \"easy\"", category: "vocabulary", type: "dictation", englishWord: "easy", hebrewWord: "קל" },
    { id: 1159, text: "הכתיב את המילה \"קשה\" באנגלית:", correct: "hard", explanation: "\"קשה\" באנגלית זה \"hard\"", category: "vocabulary", type: "dictation", englishWord: "hard", hebrewWord: "קשה" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1160, text: "הקליט את עצמך אומר את המילה \"טוב\" באנגלית:", correct: "good", explanation: "\"טוב\" באנגלית זה \"good\"", category: "vocabulary", type: "recording", englishWord: "good", hebrewWord: "טוב" },
    { id: 1161, text: "הקליט את עצמך אומר את המילה \"רע\" באנגלית:", correct: "bad", explanation: "\"רע\" באנגלית זה \"bad\"", category: "vocabulary", type: "recording", englishWord: "bad", hebrewWord: "רע" },
    { id: 1162, text: "הקליט את עצמך אומר את המילה \"שמח\" באנגלית:", correct: "happy", explanation: "\"שמח\" באנגלית זה \"happy\"", category: "vocabulary", type: "recording", englishWord: "happy", hebrewWord: "שמח" },
    { id: 1163, text: "הקליט את עצמך אומר את המילה \"עצוב\" באנגלית:", correct: "sad", explanation: "\"עצוב\" באנגלית זה \"sad\"", category: "vocabulary", type: "recording", englishWord: "sad", hebrewWord: "עצוב" },
    { id: 1164, text: "הקליט את עצמך אומר את המילה \"חם\" באנגלית:", correct: "hot", explanation: "\"חם\" באנגלית זה \"hot\"", category: "vocabulary", type: "recording", englishWord: "hot", hebrewWord: "חם" },
    { id: 1165, text: "הקליט את עצמך אומר את המילה \"קר\" באנגלית:", correct: "cold", explanation: "\"קר\" באנגלית זה \"cold\"", category: "vocabulary", type: "recording", englishWord: "cold", hebrewWord: "קר" },
    { id: 1166, text: "הקליט את עצמך אומר את המילה \"מהיר\" באנגלית:", correct: "fast", explanation: "\"מהיר\" באנגלית זה \"fast\"", category: "vocabulary", type: "recording", englishWord: "fast", hebrewWord: "מהיר" },
    { id: 1167, text: "הקליט את עצמך אומר את המילה \"איטי\" באנגלית:", correct: "slow", explanation: "\"איטי\" באנגלית זה \"slow\"", category: "vocabulary", type: "recording", englishWord: "slow", hebrewWord: "איטי" },
    { id: 1168, text: "הקליט את עצמך אומר את המילה \"קל\" באנגלית:", correct: "easy", explanation: "\"קל\" באנגלית זה \"easy\"", category: "vocabulary", type: "recording", englishWord: "easy", hebrewWord: "קל" },
    { id: 1169, text: "הקליט את עצמך אומר את המילה \"קשה\" באנגלית:", correct: "hard", explanation: "\"קשה\" באנגלית זה \"hard\"", category: "vocabulary", type: "recording", englishWord: "hard", hebrewWord: "קשה" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1170, text: "הקליט את עצמך אומר את המשפט: \"This is a good day\" ואז בחר מה הפירוש של המילה \"good\" במשפט:", sentence: "This is a good day", sentenceTranslation: "זה יום טוב", correct: 2, options: ["גדול", "קטן", "טוב", "רע"], explanation: "\"good\" במשפט זה אומרת \"טוב\"", category: "vocabulary", type: "sentence-recording", englishWord: "good", hebrewWord: "טוב" },
    { id: 1171, text: "הקליט את עצמך אומר את המשפט: \"This is a bad idea\" ואז בחר מה הפירוש של המילה \"bad\" במשפט:", sentence: "This is a bad idea", sentenceTranslation: "זה רעיון רע", correct: 3, options: ["גדול", "קטן", "טוב", "רע"], explanation: "\"bad\" במשפט זה אומרת \"רע\"", category: "vocabulary", type: "sentence-recording", englishWord: "bad", hebrewWord: "רע" },
    { id: 1172, text: "הקליט את עצמך אומר את המשפט: \"I am happy today\" ואז בחר מה הפירוש של המילה \"happy\" במשפט:", sentence: "I am happy today", sentenceTranslation: "אני שמח היום", correct: 0, options: ["שמח", "עצוב", "חם", "קר"], explanation: "\"happy\" במשפט זה אומרת \"שמח\"", category: "vocabulary", type: "sentence-recording", englishWord: "happy", hebrewWord: "שמח" },
    { id: 1173, text: "הקליט את עצמך אומר את המשפט: \"I feel sad\" ואז בחר מה הפירוש של המילה \"sad\" במשפט:", sentence: "I feel sad", sentenceTranslation: "אני מרגיש עצוב", correct: 1, options: ["שמח", "עצוב", "חם", "קר"], explanation: "\"sad\" במשפט זה אומרת \"עצוב\"", category: "vocabulary", type: "sentence-recording", englishWord: "sad", hebrewWord: "עצוב" },
    { id: 1174, text: "הקליט את עצמך אומר את המשפט: \"The soup is hot\" ואז בחר מה הפירוש של המילה \"hot\" במשפט:", sentence: "The soup is hot", sentenceTranslation: "המרק חם", correct: 2, options: ["שמח", "עצוב", "חם", "קר"], explanation: "\"hot\" במשפט זה אומרת \"חם\"", category: "vocabulary", type: "sentence-recording", englishWord: "hot", hebrewWord: "חם" },
    { id: 1175, text: "הקליט את עצמך אומר את המשפט: \"The ice is cold\" ואז בחר מה הפירוש של המילה \"cold\" במשפט:", sentence: "The ice is cold", sentenceTranslation: "הקרח קר", correct: 3, options: ["שמח", "עצוב", "חם", "קר"], explanation: "\"cold\" במשפט זה אומרת \"קר\"", category: "vocabulary", type: "sentence-recording", englishWord: "cold", hebrewWord: "קר" },
    { id: 1176, text: "הקליט את עצמך אומר את המשפט: \"I run fast\" ואז בחר מה הפירוש של המילה \"fast\" במשפט:", sentence: "I run fast", sentenceTranslation: "אני רץ מהר", correct: 0, options: ["מהיר", "איטי", "קל", "קשה"], explanation: "\"fast\" במשפט זה אומרת \"מהיר\"", category: "vocabulary", type: "sentence-recording", englishWord: "fast", hebrewWord: "מהיר" },
    { id: 1177, text: "הקליט את עצמך אומר את המשפט: \"I walk slow\" ואז בחר מה הפירוש של המילה \"slow\" במשפט:", sentence: "I walk slow", sentenceTranslation: "אני הולך לאט", correct: 1, options: ["מהיר", "איטי", "קל", "קשה"], explanation: "\"slow\" במשפט זה אומרת \"איטי\"", category: "vocabulary", type: "sentence-recording", englishWord: "slow", hebrewWord: "איטי" },
    { id: 1178, text: "הקליט את עצמך אומר את המשפט: \"This test is easy\" ואז בחר מה הפירוש של המילה \"easy\" במשפט:", sentence: "This test is easy", sentenceTranslation: "המבחן הזה קל", correct: 2, options: ["מהיר", "איטי", "קל", "קשה"], explanation: "\"easy\" במשפט זה אומרת \"קל\"", category: "vocabulary", type: "sentence-recording", englishWord: "easy", hebrewWord: "קל" },
    { id: 1179, text: "הקליט את עצמך אומר את המשפט: \"This test is hard\" ואז בחר מה הפירוש של המילה \"hard\" במשפט:", sentence: "This test is hard", sentenceTranslation: "המבחן הזה קשה", correct: 3, options: ["מהיר", "איטי", "קל", "קשה"], explanation: "\"hard\" במשפט זה אומרת \"קשה\"", category: "vocabulary", type: "sentence-recording", englishWord: "hard", hebrewWord: "קשה" }
    ]
  },
  '6': { // יחידה 6 - אוצר מילים מתקדם
    '1': [ // רמה 1 - מתחילים - מקצועות בסיסיים
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1180, text: "מה אומרת המילה \"teacher\"?", options: ["מורה", "רופא", "אחות", "תלמיד"], correct: 0, explanation: "\"teacher\" אומרת \"מורה\"", category: "vocabulary", type: "multiple-choice", englishWord: "teacher", hebrewWord: "מורה" },
    { id: 1181, text: "מה אומרת המילה \"doctor\"?", options: ["מורה", "רופא", "אחות", "תלמיד"], correct: 1, explanation: "\"doctor\" אומרת \"רופא\"", category: "vocabulary", type: "multiple-choice", englishWord: "doctor", hebrewWord: "רופא" },
    { id: 1182, text: "מה אומרת המילה \"nurse\"?", options: ["מורה", "רופא", "אחות", "תלמיד"], correct: 2, explanation: "\"nurse\" אומרת \"אחות\"", category: "vocabulary", type: "multiple-choice", englishWord: "nurse", hebrewWord: "אחות" },
    { id: 1183, text: "מה אומרת המילה \"student\"?", options: ["מורה", "רופא", "אחות", "תלמיד"], correct: 3, explanation: "\"student\" אומרת \"תלמיד\"", category: "vocabulary", type: "multiple-choice", englishWord: "student", hebrewWord: "תלמיד" },
    { id: 1184, text: "מה אומרת המילה \"cook\"?", options: ["טבח", "נהג", "חקלאי", "עובד"], correct: 0, explanation: "\"cook\" אומרת \"טבח\"", category: "vocabulary", type: "multiple-choice", englishWord: "cook", hebrewWord: "טבח" },
    { id: 1185, text: "מה אומרת המילה \"driver\"?", options: ["טבח", "נהג", "חקלאי", "עובד"], correct: 1, explanation: "\"driver\" אומרת \"נהג\"", category: "vocabulary", type: "multiple-choice", englishWord: "driver", hebrewWord: "נהג" },
    { id: 1186, text: "מה אומרת המילה \"farmer\"?", options: ["טבח", "נהג", "חקלאי", "עובד"], correct: 2, explanation: "\"farmer\" אומרת \"חקלאי\"", category: "vocabulary", type: "multiple-choice", englishWord: "farmer", hebrewWord: "חקלאי" },
    { id: 1187, text: "מה אומרת המילה \"worker\"?", options: ["טבח", "נהג", "חקלאי", "עובד"], correct: 3, explanation: "\"worker\" אומרת \"עובד\"", category: "vocabulary", type: "multiple-choice", englishWord: "worker", hebrewWord: "עובד" },
    { id: 1188, text: "מה אומרת המילה \"artist\"?", options: ["אמן", "זמר", "שחקן", "רקדן"], correct: 0, explanation: "\"artist\" אומרת \"אמן\"", category: "vocabulary", type: "multiple-choice", englishWord: "artist", hebrewWord: "אמן" },
    { id: 1189, text: "מה אומרת המילה \"singer\"?", options: ["אמן", "זמר", "שחקן", "רקדן"], correct: 1, explanation: "\"singer\" אומרת \"זמר\"", category: "vocabulary", type: "multiple-choice", englishWord: "singer", hebrewWord: "זמר" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1190, text: "הכתיב את המילה \"מורה\" באנגלית:", correct: "teacher", explanation: "\"מורה\" באנגלית זה \"teacher\"", category: "vocabulary", type: "dictation", englishWord: "teacher", hebrewWord: "מורה" },
    { id: 1191, text: "הכתיב את המילה \"רופא\" באנגלית:", correct: "doctor", explanation: "\"רופא\" באנגלית זה \"doctor\"", category: "vocabulary", type: "dictation", englishWord: "doctor", hebrewWord: "רופא" },
    { id: 1192, text: "הכתיב את המילה \"אחות\" באנגלית:", correct: "nurse", explanation: "\"אחות\" באנגלית זה \"nurse\"", category: "vocabulary", type: "dictation", englishWord: "nurse", hebrewWord: "אחות" },
    { id: 1193, text: "הכתיב את המילה \"תלמיד\" באנגלית:", correct: "student", explanation: "\"תלמיד\" באנגלית זה \"student\"", category: "vocabulary", type: "dictation", englishWord: "student", hebrewWord: "תלמיד" },
    { id: 1194, text: "הכתיב את המילה \"טבח\" באנגלית:", correct: "cook", explanation: "\"טבח\" באנגלית זה \"cook\"", category: "vocabulary", type: "dictation", englishWord: "cook", hebrewWord: "טבח" },
    { id: 1195, text: "הכתיב את המילה \"נהג\" באנגלית:", correct: "driver", explanation: "\"נהג\" באנגלית זה \"driver\"", category: "vocabulary", type: "dictation", englishWord: "driver", hebrewWord: "נהג" },
    { id: 1196, text: "הכתיב את המילה \"חקלאי\" באנגלית:", correct: "farmer", explanation: "\"חקלאי\" באנגלית זה \"farmer\"", category: "vocabulary", type: "dictation", englishWord: "farmer", hebrewWord: "חקלאי" },
    { id: 1197, text: "הכתיב את המילה \"עובד\" באנגלית:", correct: "worker", explanation: "\"עובד\" באנגלית זה \"worker\"", category: "vocabulary", type: "dictation", englishWord: "worker", hebrewWord: "עובד" },
    { id: 1198, text: "הכתיב את המילה \"אמן\" באנגלית:", correct: "artist", explanation: "\"אמן\" באנגלית זה \"artist\"", category: "vocabulary", type: "dictation", englishWord: "artist", hebrewWord: "אמן" },
    { id: 1199, text: "הכתיב את המילה \"זמר\" באנגלית:", correct: "singer", explanation: "\"זמר\" באנגלית זה \"singer\"", category: "vocabulary", type: "dictation", englishWord: "singer", hebrewWord: "זמר" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1200, text: "הקליט את עצמך אומר את המילה \"מורה\" באנגלית:", correct: "teacher", explanation: "\"מורה\" באנגלית זה \"teacher\"", category: "vocabulary", type: "recording", englishWord: "teacher", hebrewWord: "מורה" },
    { id: 1201, text: "הקליט את עצמך אומר את המילה \"רופא\" באנגלית:", correct: "doctor", explanation: "\"רופא\" באנגלית זה \"doctor\"", category: "vocabulary", type: "recording", englishWord: "doctor", hebrewWord: "רופא" },
    { id: 1202, text: "הקליט את עצמך אומר את המילה \"אחות\" באנגלית:", correct: "nurse", explanation: "\"אחות\" באנגלית זה \"nurse\"", category: "vocabulary", type: "recording", englishWord: "nurse", hebrewWord: "אחות" },
    { id: 1203, text: "הקליט את עצמך אומר את המילה \"תלמיד\" באנגלית:", correct: "student", explanation: "\"תלמיד\" באנגלית זה \"student\"", category: "vocabulary", type: "recording", englishWord: "student", hebrewWord: "תלמיד" },
    { id: 1204, text: "הקליט את עצמך אומר את המילה \"טבח\" באנגלית:", correct: "cook", explanation: "\"טבח\" באנגלית זה \"cook\"", category: "vocabulary", type: "recording", englishWord: "cook", hebrewWord: "טבח" },
    { id: 1205, text: "הקליט את עצמך אומר את המילה \"נהג\" באנגלית:", correct: "driver", explanation: "\"נהג\" באנגלית זה \"driver\"", category: "vocabulary", type: "recording", englishWord: "driver", hebrewWord: "נהג" },
    { id: 1206, text: "הקליט את עצמך אומר את המילה \"חקלאי\" באנגלית:", correct: "farmer", explanation: "\"חקלאי\" באנגלית זה \"farmer\"", category: "vocabulary", type: "recording", englishWord: "farmer", hebrewWord: "חקלאי" },
    { id: 1207, text: "הקליט את עצמך אומר את המילה \"עובד\" באנגלית:", correct: "worker", explanation: "\"עובד\" באנגלית זה \"worker\"", category: "vocabulary", type: "recording", englishWord: "worker", hebrewWord: "עובד" },
    { id: 1208, text: "הקליט את עצמך אומר את המילה \"אמן\" באנגלית:", correct: "artist", explanation: "\"אמן\" באנגלית זה \"artist\"", category: "vocabulary", type: "recording", englishWord: "artist", hebrewWord: "אמן" },
    { id: 1209, text: "הקליט את עצמך אומר את המילה \"זמר\" באנגלית:", correct: "singer", explanation: "\"זמר\" באנגלית זה \"singer\"", category: "vocabulary", type: "recording", englishWord: "singer", hebrewWord: "זמר" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1210, text: "הקליט את עצמך אומר את המשפט: \"My mother is a teacher\" ואז בחר מה הפירוש של המילה \"teacher\" במשפט:", sentence: "My mother is a teacher", sentenceTranslation: "האמא שלי היא מורה", correct: 0, options: ["מורה", "רופא", "אחות", "תלמיד"], explanation: "\"teacher\" במשפט זה אומרת \"מורה\"", category: "vocabulary", type: "sentence-recording", englishWord: "teacher", hebrewWord: "מורה" },
    { id: 1211, text: "הקליט את עצמך אומר את המשפט: \"My father is a doctor\" ואז בחר מה הפירוש של המילה \"doctor\" במשפט:", sentence: "My father is a doctor", sentenceTranslation: "האבא שלי הוא רופא", correct: 1, options: ["מורה", "רופא", "אחות", "תלמיד"], explanation: "\"doctor\" במשפט זה אומרת \"רופא\"", category: "vocabulary", type: "sentence-recording", englishWord: "doctor", hebrewWord: "רופא" },
    { id: 1212, text: "הקליט את עצמך אומר את המשפט: \"The nurse helps patients\" ואז בחר מה הפירוש של המילה \"nurse\" במשפט:", sentence: "The nurse helps patients", sentenceTranslation: "האחות עוזרת לחולים", correct: 2, options: ["מורה", "רופא", "אחות", "תלמיד"], explanation: "\"nurse\" במשפט זה אומרת \"אחות\"", category: "vocabulary", type: "sentence-recording", englishWord: "nurse", hebrewWord: "אחות" },
    { id: 1213, text: "הקליט את עצמך אומר את המשפט: \"I am a student\" ואז בחר מה הפירוש של המילה \"student\" במשפט:", sentence: "I am a student", sentenceTranslation: "אני תלמיד", correct: 3, options: ["מורה", "רופא", "אחות", "תלמיד"], explanation: "\"student\" במשפט זה אומרת \"תלמיד\"", category: "vocabulary", type: "sentence-recording", englishWord: "student", hebrewWord: "תלמיד" },
    { id: 1214, text: "הקליט את עצמך אומר את המשפט: \"The cook makes food\" ואז בחר מה הפירוש של המילה \"cook\" במשפט:", sentence: "The cook makes food", sentenceTranslation: "הטבח מכין אוכל", correct: 0, options: ["טבח", "נהג", "חקלאי", "עובד"], explanation: "\"cook\" במשפט זה אומרת \"טבח\"", category: "vocabulary", type: "sentence-recording", englishWord: "cook", hebrewWord: "טבח" },
    { id: 1215, text: "הקליט את עצמך אומר את המשפט: \"The driver drives a car\" ואז בחר מה הפירוש של המילה \"driver\" במשפט:", sentence: "The driver drives a car", sentenceTranslation: "הנהג נוהג במכונית", correct: 1, options: ["טבח", "נהג", "חקלאי", "עובד"], explanation: "\"driver\" במשפט זה אומרת \"נהג\"", category: "vocabulary", type: "sentence-recording", englishWord: "driver", hebrewWord: "נהג" },
    { id: 1216, text: "הקליט את עצמך אומר את המשפט: \"The farmer grows crops\" ואז בחר מה הפירוש של המילה \"farmer\" במשפט:", sentence: "The farmer grows crops", sentenceTranslation: "החקלאי מגדל יבולים", correct: 2, options: ["טבח", "נהג", "חקלאי", "עובד"], explanation: "\"farmer\" במשפט זה אומרת \"חקלאי\"", category: "vocabulary", type: "sentence-recording", englishWord: "farmer", hebrewWord: "חקלאי" },
    { id: 1217, text: "הקליט את עצמך אומר את המשפט: \"The worker builds houses\" ואז בחר מה הפירוש של המילה \"worker\" במשפט:", sentence: "The worker builds houses", sentenceTranslation: "העובד בונה בתים", correct: 3, options: ["טבח", "נהג", "חקלאי", "עובד"], explanation: "\"worker\" במשפט זה אומרת \"עובד\"", category: "vocabulary", type: "sentence-recording", englishWord: "worker", hebrewWord: "עובד" },
    { id: 1218, text: "הקליט את עצמך אומר את המשפט: \"The artist paints pictures\" ואז בחר מה הפירוש של המילה \"artist\" במשפט:", sentence: "The artist paints pictures", sentenceTranslation: "האמן מצייר תמונות", correct: 0, options: ["אמן", "זמר", "שחקן", "רקדן"], explanation: "\"artist\" במשפט זה אומרת \"אמן\"", category: "vocabulary", type: "sentence-recording", englishWord: "artist", hebrewWord: "אמן" },
    { id: 1219, text: "הקליט את עצמך אומר את המשפט: \"The singer sings songs\" ואז בחר מה הפירוש של המילה \"singer\" במשפט:", sentence: "The singer sings songs", sentenceTranslation: "הזמר שיר שירים", correct: 1, options: ["אמן", "זמר", "שחקן", "רקדן"], explanation: "\"singer\" במשפט זה אומרת \"זמר\"", category: "vocabulary", type: "sentence-recording", englishWord: "singer", hebrewWord: "זמר" }
    ],
    '2': [ // רמה 2 - בסיסי - מקצועות נוספים
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1220, text: "מה אומרת המילה \"engineer\"?", options: ["מהנדס", "עורך דין", "טייס", "חייל"], correct: 0, explanation: "\"engineer\" אומרת \"מהנדס\"", category: "vocabulary", type: "multiple-choice", englishWord: "engineer", hebrewWord: "מהנדס" },
    { id: 1221, text: "מה אומרת המילה \"lawyer\"?", options: ["מהנדס", "עורך דין", "טייס", "חייל"], correct: 1, explanation: "\"lawyer\" אומרת \"עורך דין\"", category: "vocabulary", type: "multiple-choice", englishWord: "lawyer", hebrewWord: "עורך דין" },
    { id: 1222, text: "מה אומרת המילה \"pilot\"?", options: ["מהנדס", "עורך דין", "טייס", "חייל"], correct: 2, explanation: "\"pilot\" אומרת \"טייס\"", category: "vocabulary", type: "multiple-choice", englishWord: "pilot", hebrewWord: "טייס" },
    { id: 1223, text: "מה אומרת המילה \"soldier\"?", options: ["מהנדס", "עורך דין", "טייס", "חייל"], correct: 3, explanation: "\"soldier\" אומרת \"חייל\"", category: "vocabulary", type: "multiple-choice", englishWord: "soldier", hebrewWord: "חייל" },
    { id: 1224, text: "מה אומרת המילה \"police\"?", options: ["שוטר", "כבאי", "בונה", "מלצר"], correct: 0, explanation: "\"police\" אומרת \"שוטר\"", category: "vocabulary", type: "multiple-choice", englishWord: "police", hebrewWord: "שוטר" },
    { id: 1225, text: "מה אומרת המילה \"firefighter\"?", options: ["שוטר", "כבאי", "בונה", "מלצר"], correct: 1, explanation: "\"firefighter\" אומרת \"כבאי\"", category: "vocabulary", type: "multiple-choice", englishWord: "firefighter", hebrewWord: "כבאי" },
    { id: 1226, text: "מה אומרת המילה \"builder\"?", options: ["שוטר", "כבאי", "בונה", "מלצר"], correct: 2, explanation: "\"builder\" אומרת \"בונה\"", category: "vocabulary", type: "multiple-choice", englishWord: "builder", hebrewWord: "בונה" },
    { id: 1227, text: "מה אומרת המילה \"waiter\"?", options: ["שוטר", "כבאי", "בונה", "מלצר"], correct: 3, explanation: "\"waiter\" אומרת \"מלצר\"", category: "vocabulary", type: "multiple-choice", englishWord: "waiter", hebrewWord: "מלצר" },
    { id: 1228, text: "מה אומרת המילה \"chef\"?", options: ["שף", "מנהל", "מנהל חשבונות", "רואה חשבון"], correct: 0, explanation: "\"chef\" אומרת \"שף\"", category: "vocabulary", type: "multiple-choice", englishWord: "chef", hebrewWord: "שף" },
    { id: 1229, text: "מה אומרת המילה \"manager\"?", options: ["שף", "מנהל", "מנהל חשבונות", "רואה חשבון"], correct: 1, explanation: "\"manager\" אומרת \"מנהל\"", category: "vocabulary", type: "multiple-choice", englishWord: "manager", hebrewWord: "מנהל" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1230, text: "הכתיב את המילה \"מהנדס\" באנגלית:", correct: "engineer", explanation: "\"מהנדס\" באנגלית זה \"engineer\"", category: "vocabulary", type: "dictation", englishWord: "engineer", hebrewWord: "מהנדס" },
    { id: 1231, text: "הכתיב את המילה \"עורך דין\" באנגלית:", correct: "lawyer", explanation: "\"עורך דין\" באנגלית זה \"lawyer\"", category: "vocabulary", type: "dictation", englishWord: "lawyer", hebrewWord: "עורך דין" },
    { id: 1232, text: "הכתיב את המילה \"טייס\" באנגלית:", correct: "pilot", explanation: "\"טייס\" באנגלית זה \"pilot\"", category: "vocabulary", type: "dictation", englishWord: "pilot", hebrewWord: "טייס" },
    { id: 1233, text: "הכתיב את המילה \"חייל\" באנגלית:", correct: "soldier", explanation: "\"חייל\" באנגלית זה \"soldier\"", category: "vocabulary", type: "dictation", englishWord: "soldier", hebrewWord: "חייל" },
    { id: 1234, text: "הכתיב את המילה \"שוטר\" באנגלית:", correct: "police", explanation: "\"שוטר\" באנגלית זה \"police\"", category: "vocabulary", type: "dictation", englishWord: "police", hebrewWord: "שוטר" },
    { id: 1235, text: "הכתיב את המילה \"כבאי\" באנגלית:", correct: "firefighter", explanation: "\"כבאי\" באנגלית זה \"firefighter\"", category: "vocabulary", type: "dictation", englishWord: "firefighter", hebrewWord: "כבאי" },
    { id: 1236, text: "הכתיב את המילה \"בונה\" באנגלית:", correct: "builder", explanation: "\"בונה\" באנגלית זה \"builder\"", category: "vocabulary", type: "dictation", englishWord: "builder", hebrewWord: "בונה" },
    { id: 1237, text: "הכתיב את המילה \"מלצר\" באנגלית:", correct: "waiter", explanation: "\"מלצר\" באנגלית זה \"waiter\"", category: "vocabulary", type: "dictation", englishWord: "waiter", hebrewWord: "מלצר" },
    { id: 1238, text: "הכתיב את המילה \"שף\" באנגלית:", correct: "chef", explanation: "\"שף\" באנגלית זה \"chef\"", category: "vocabulary", type: "dictation", englishWord: "chef", hebrewWord: "שף" },
    { id: 1239, text: "הכתיב את המילה \"מנהל\" באנגלית:", correct: "manager", explanation: "\"מנהל\" באנגלית זה \"manager\"", category: "vocabulary", type: "dictation", englishWord: "manager", hebrewWord: "מנהל" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1240, text: "הקליט את עצמך אומר את המילה \"מהנדס\" באנגלית:", correct: "engineer", explanation: "\"מהנדס\" באנגלית זה \"engineer\"", category: "vocabulary", type: "recording", englishWord: "engineer", hebrewWord: "מהנדס" },
    { id: 1241, text: "הקליט את עצמך אומר את המילה \"עורך דין\" באנגלית:", correct: "lawyer", explanation: "\"עורך דין\" באנגלית זה \"lawyer\"", category: "vocabulary", type: "recording", englishWord: "lawyer", hebrewWord: "עורך דין" },
    { id: 1242, text: "הקליט את עצמך אומר את המילה \"טייס\" באנגלית:", correct: "pilot", explanation: "\"טייס\" באנגלית זה \"pilot\"", category: "vocabulary", type: "recording", englishWord: "pilot", hebrewWord: "טייס" },
    { id: 1243, text: "הקליט את עצמך אומר את המילה \"חייל\" באנגלית:", correct: "soldier", explanation: "\"חייל\" באנגלית זה \"soldier\"", category: "vocabulary", type: "recording", englishWord: "soldier", hebrewWord: "חייל" },
    { id: 1244, text: "הקליט את עצמך אומר את המילה \"שוטר\" באנגלית:", correct: "police", explanation: "\"שוטר\" באנגלית זה \"police\"", category: "vocabulary", type: "recording", englishWord: "police", hebrewWord: "שוטר" },
    { id: 1245, text: "הקליט את עצמך אומר את המילה \"כבאי\" באנגלית:", correct: "firefighter", explanation: "\"כבאי\" באנגלית זה \"firefighter\"", category: "vocabulary", type: "recording", englishWord: "firefighter", hebrewWord: "כבאי" },
    { id: 1246, text: "הקליט את עצמך אומר את המילה \"בונה\" באנגלית:", correct: "builder", explanation: "\"בונה\" באנגלית זה \"builder\"", category: "vocabulary", type: "recording", englishWord: "builder", hebrewWord: "בונה" },
    { id: 1247, text: "הקליט את עצמך אומר את המילה \"מלצר\" באנגלית:", correct: "waiter", explanation: "\"מלצר\" באנגלית זה \"waiter\"", category: "vocabulary", type: "recording", englishWord: "waiter", hebrewWord: "מלצר" },
    { id: 1248, text: "הקליט את עצמך אומר את המילה \"שף\" באנגלית:", correct: "chef", explanation: "\"שף\" באנגלית זה \"chef\"", category: "vocabulary", type: "recording", englishWord: "chef", hebrewWord: "שף" },
    { id: 1249, text: "הקליט את עצמך אומר את המילה \"מנהל\" באנגלית:", correct: "manager", explanation: "\"מנהל\" באנגלית זה \"manager\"", category: "vocabulary", type: "recording", englishWord: "manager", hebrewWord: "מנהל" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1250, text: "הקליט את עצמך אומר את המשפט: \"The engineer designs buildings\" ואז בחר מה הפירוש של המילה \"engineer\" במשפט:", sentence: "The engineer designs buildings", sentenceTranslation: "המהנדס מתכנן בניינים", correct: 0, options: ["מהנדס", "עורך דין", "טייס", "חייל"], explanation: "\"engineer\" במשפט זה אומרת \"מהנדס\"", category: "vocabulary", type: "sentence-recording", englishWord: "engineer", hebrewWord: "מהנדס" },
    { id: 1251, text: "הקליט את עצמך אומר את המשפט: \"The lawyer helps people\" ואז בחר מה הפירוש של המילה \"lawyer\" במשפט:", sentence: "The lawyer helps people", sentenceTranslation: "עורך הדין עוזר לאנשים", correct: 1, options: ["מהנדס", "עורך דין", "טייס", "חייל"], explanation: "\"lawyer\" במשפט זה אומרת \"עורך דין\"", category: "vocabulary", type: "sentence-recording", englishWord: "lawyer", hebrewWord: "עורך דין" },
    { id: 1252, text: "הקליט את עצמך אומר את המשפט: \"The pilot flies a plane\" ואז בחר מה הפירוש של המילה \"pilot\" במשפט:", sentence: "The pilot flies a plane", sentenceTranslation: "הטייס מטיס מטוס", correct: 2, options: ["מהנדס", "עורך דין", "טייס", "חייל"], explanation: "\"pilot\" במשפט זה אומרת \"טייס\"", category: "vocabulary", type: "sentence-recording", englishWord: "pilot", hebrewWord: "טייס" },
    { id: 1253, text: "הקליט את עצמך אומר את המשפט: \"The soldier protects the country\" ואז בחר מה הפירוש של המילה \"soldier\" במשפט:", sentence: "The soldier protects the country", sentenceTranslation: "החייל מגן על המדינה", correct: 3, options: ["מהנדס", "עורך דין", "טייס", "חייל"], explanation: "\"soldier\" במשפט זה אומרת \"חייל\"", category: "vocabulary", type: "sentence-recording", englishWord: "soldier", hebrewWord: "חייל" },
    { id: 1254, text: "הקליט את עצמך אומר את המשפט: \"The police catches criminals\" ואז בחר מה הפירוש של המילה \"police\" במשפט:", sentence: "The police catches criminals", sentenceTranslation: "השוטר תופס פושעים", correct: 0, options: ["שוטר", "כבאי", "בונה", "מלצר"], explanation: "\"police\" במשפט זה אומרת \"שוטר\"", category: "vocabulary", type: "sentence-recording", englishWord: "police", hebrewWord: "שוטר" },
    { id: 1255, text: "הקליט את עצמך אומר את המשפט: \"The firefighter puts out fires\" ואז בחר מה הפירוש של המילה \"firefighter\" במשפט:", sentence: "The firefighter puts out fires", sentenceTranslation: "הכבאי מכבה שריפות", correct: 1, options: ["שוטר", "כבאי", "בונה", "מלצר"], explanation: "\"firefighter\" במשפט זה אומרת \"כבאי\"", category: "vocabulary", type: "sentence-recording", englishWord: "firefighter", hebrewWord: "כבאי" },
    { id: 1256, text: "הקליט את עצמך אומר את המשפט: \"The builder constructs houses\" ואז בחר מה הפירוש של המילה \"builder\" במשפט:", sentence: "The builder constructs houses", sentenceTranslation: "הבונה בונה בתים", correct: 2, options: ["שוטר", "כבאי", "בונה", "מלצר"], explanation: "\"builder\" במשפט זה אומרת \"בונה\"", category: "vocabulary", type: "sentence-recording", englishWord: "builder", hebrewWord: "בונה" },
    { id: 1257, text: "הקליט את עצמך אומר את המשפט: \"The waiter serves food\" ואז בחר מה הפירוש של המילה \"waiter\" במשפט:", sentence: "The waiter serves food", sentenceTranslation: "המלצר מגיש אוכל", correct: 3, options: ["שוטר", "כבאי", "בונה", "מלצר"], explanation: "\"waiter\" במשפט זה אומרת \"מלצר\"", category: "vocabulary", type: "sentence-recording", englishWord: "waiter", hebrewWord: "מלצר" },
    { id: 1258, text: "הקליט את עצמך אומר את המשפט: \"The chef cooks delicious meals\" ואז בחר מה הפירוש של המילה \"chef\" במשפט:", sentence: "The chef cooks delicious meals", sentenceTranslation: "השף מבשל ארוחות טעימות", correct: 0, options: ["שף", "מנהל", "מנהל חשבונות", "רואה חשבון"], explanation: "\"chef\" במשפט זה אומרת \"שף\"", category: "vocabulary", type: "sentence-recording", englishWord: "chef", hebrewWord: "שף" },
    { id: 1259, text: "הקליט את עצמך אומר את המשפט: \"The manager runs the business\" ואז בחר מה הפירוש של המילה \"manager\" במשפט:", sentence: "The manager runs the business", sentenceTranslation: "המנהל מנהל את העסק", correct: 1, options: ["שף", "מנהל", "מנהל חשבונות", "רואה חשבון"], explanation: "\"manager\" במשפט זה אומרת \"מנהל\"", category: "vocabulary", type: "sentence-recording", englishWord: "manager", hebrewWord: "מנהל" }
    ],
    '3': [ // רמה 3 - בינוני - מקומות בסיסיים
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1260, text: "מה אומרת המילה \"school\"?", options: ["בית ספר", "בית חולים", "פארק", "חנות"], correct: 0, explanation: "\"school\" אומרת \"בית ספר\"", category: "vocabulary", type: "multiple-choice", englishWord: "school", hebrewWord: "בית ספר" },
    { id: 1261, text: "מה אומרת המילה \"hospital\"?", options: ["בית ספר", "בית חולים", "פארק", "חנות"], correct: 1, explanation: "\"hospital\" אומרת \"בית חולים\"", category: "vocabulary", type: "multiple-choice", englishWord: "hospital", hebrewWord: "בית חולים" },
    { id: 1262, text: "מה אומרת המילה \"park\"?", options: ["בית ספר", "בית חולים", "פארק", "חנות"], correct: 2, explanation: "\"park\" אומרת \"פארק\"", category: "vocabulary", type: "multiple-choice", englishWord: "park", hebrewWord: "פארק" },
    { id: 1263, text: "מה אומרת המילה \"store\"?", options: ["בית ספר", "בית חולים", "פארק", "חנות"], correct: 3, explanation: "\"store\" אומרת \"חנות\"", category: "vocabulary", type: "multiple-choice", englishWord: "store", hebrewWord: "חנות" },
    { id: 1264, text: "מה אומרת המילה \"restaurant\"?", options: ["מסעדה", "בנק", "ספרייה", "מוזיאון"], correct: 0, explanation: "\"restaurant\" אומרת \"מסעדה\"", category: "vocabulary", type: "multiple-choice", englishWord: "restaurant", hebrewWord: "מסעדה" },
    { id: 1265, text: "מה אומרת המילה \"bank\"?", options: ["מסעדה", "בנק", "ספרייה", "מוזיאון"], correct: 1, explanation: "\"bank\" אומרת \"בנק\"", category: "vocabulary", type: "multiple-choice", englishWord: "bank", hebrewWord: "בנק" },
    { id: 1266, text: "מה אומרת המילה \"library\"?", options: ["מסעדה", "בנק", "ספרייה", "מוזיאון"], correct: 2, explanation: "\"library\" אומרת \"ספרייה\"", category: "vocabulary", type: "multiple-choice", englishWord: "library", hebrewWord: "ספרייה" },
    { id: 1267, text: "מה אומרת המילה \"museum\"?", options: ["מסעדה", "בנק", "ספרייה", "מוזיאון"], correct: 3, explanation: "\"museum\" אומרת \"מוזיאון\"", category: "vocabulary", type: "multiple-choice", englishWord: "museum", hebrewWord: "מוזיאון" },
    { id: 1268, text: "מה אומרת המילה \"cinema\"?", options: ["קולנוע", "מלון", "תחנה", "שדה תעופה"], correct: 0, explanation: "\"cinema\" אומרת \"קולנוע\"", category: "vocabulary", type: "multiple-choice", englishWord: "cinema", hebrewWord: "קולנוע" },
    { id: 1269, text: "מה אומרת המילה \"hotel\"?", options: ["קולנוע", "מלון", "תחנה", "שדה תעופה"], correct: 1, explanation: "\"hotel\" אומרת \"מלון\"", category: "vocabulary", type: "multiple-choice", englishWord: "hotel", hebrewWord: "מלון" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1270, text: "הכתיב את המילה \"בית ספר\" באנגלית:", correct: "school", explanation: "\"בית ספר\" באנגלית זה \"school\"", category: "vocabulary", type: "dictation", englishWord: "school", hebrewWord: "בית ספר" },
    { id: 1271, text: "הכתיב את המילה \"בית חולים\" באנגלית:", correct: "hospital", explanation: "\"בית חולים\" באנגלית זה \"hospital\"", category: "vocabulary", type: "dictation", englishWord: "hospital", hebrewWord: "בית חולים" },
    { id: 1272, text: "הכתיב את המילה \"פארק\" באנגלית:", correct: "park", explanation: "\"פארק\" באנגלית זה \"park\"", category: "vocabulary", type: "dictation", englishWord: "park", hebrewWord: "פארק" },
    { id: 1273, text: "הכתיב את המילה \"חנות\" באנגלית:", correct: "store", explanation: "\"חנות\" באנגלית זה \"store\"", category: "vocabulary", type: "dictation", englishWord: "store", hebrewWord: "חנות" },
    { id: 1274, text: "הכתיב את המילה \"מסעדה\" באנגלית:", correct: "restaurant", explanation: "\"מסעדה\" באנגלית זה \"restaurant\"", category: "vocabulary", type: "dictation", englishWord: "restaurant", hebrewWord: "מסעדה" },
    { id: 1275, text: "הכתיב את המילה \"בנק\" באנגלית:", correct: "bank", explanation: "\"בנק\" באנגלית זה \"bank\"", category: "vocabulary", type: "dictation", englishWord: "bank", hebrewWord: "בנק" },
    { id: 1276, text: "הכתיב את המילה \"ספרייה\" באנגלית:", correct: "library", explanation: "\"ספרייה\" באנגלית זה \"library\"", category: "vocabulary", type: "dictation", englishWord: "library", hebrewWord: "ספרייה" },
    { id: 1277, text: "הכתיב את המילה \"מוזיאון\" באנגלית:", correct: "museum", explanation: "\"מוזיאון\" באנגלית זה \"museum\"", category: "vocabulary", type: "dictation", englishWord: "museum", hebrewWord: "מוזיאון" },
    { id: 1278, text: "הכתיב את המילה \"קולנוע\" באנגלית:", correct: "cinema", explanation: "\"קולנוע\" באנגלית זה \"cinema\"", category: "vocabulary", type: "dictation", englishWord: "cinema", hebrewWord: "קולנוע" },
    { id: 1279, text: "הכתיב את המילה \"מלון\" באנגלית:", correct: "hotel", explanation: "\"מלון\" באנגלית זה \"hotel\"", category: "vocabulary", type: "dictation", englishWord: "hotel", hebrewWord: "מלון" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1280, text: "הקליט את עצמך אומר את המילה \"בית ספר\" באנגלית:", correct: "school", explanation: "\"בית ספר\" באנגלית זה \"school\"", category: "vocabulary", type: "recording", englishWord: "school", hebrewWord: "בית ספר" },
    { id: 1281, text: "הקליט את עצמך אומר את המילה \"בית חולים\" באנגלית:", correct: "hospital", explanation: "\"בית חולים\" באנגלית זה \"hospital\"", category: "vocabulary", type: "recording", englishWord: "hospital", hebrewWord: "בית חולים" },
    { id: 1282, text: "הקליט את עצמך אומר את המילה \"פארק\" באנגלית:", correct: "park", explanation: "\"פארק\" באנגלית זה \"park\"", category: "vocabulary", type: "recording", englishWord: "park", hebrewWord: "פארק" },
    { id: 1283, text: "הקליט את עצמך אומר את המילה \"חנות\" באנגלית:", correct: "store", explanation: "\"חנות\" באנגלית זה \"store\"", category: "vocabulary", type: "recording", englishWord: "store", hebrewWord: "חנות" },
    { id: 1284, text: "הקליט את עצמך אומר את המילה \"מסעדה\" באנגלית:", correct: "restaurant", explanation: "\"מסעדה\" באנגלית זה \"restaurant\"", category: "vocabulary", type: "recording", englishWord: "restaurant", hebrewWord: "מסעדה" },
    { id: 1285, text: "הקליט את עצמך אומר את המילה \"בנק\" באנגלית:", correct: "bank", explanation: "\"בנק\" באנגלית זה \"bank\"", category: "vocabulary", type: "recording", englishWord: "bank", hebrewWord: "בנק" },
    { id: 1286, text: "הקליט את עצמך אומר את המילה \"ספרייה\" באנגלית:", correct: "library", explanation: "\"ספרייה\" באנגלית זה \"library\"", category: "vocabulary", type: "recording", englishWord: "library", hebrewWord: "ספרייה" },
    { id: 1287, text: "הקליט את עצמך אומר את המילה \"מוזיאון\" באנגלית:", correct: "museum", explanation: "\"מוזיאון\" באנגלית זה \"museum\"", category: "vocabulary", type: "recording", englishWord: "museum", hebrewWord: "מוזיאון" },
    { id: 1288, text: "הקליט את עצמך אומר את המילה \"קולנוע\" באנגלית:", correct: "cinema", explanation: "\"קולנוע\" באנגלית זה \"cinema\"", category: "vocabulary", type: "recording", englishWord: "cinema", hebrewWord: "קולנוע" },
    { id: 1289, text: "הקליט את עצמך אומר את המילה \"מלון\" באנגלית:", correct: "hotel", explanation: "\"מלון\" באנגלית זה \"hotel\"", category: "vocabulary", type: "recording", englishWord: "hotel", hebrewWord: "מלון" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1290, text: "הקליט את עצמך אומר את המשפט: \"I go to school every day\" ואז בחר מה הפירוש של המילה \"school\" במשפט:", sentence: "I go to school every day", sentenceTranslation: "אני הולך לבית ספר כל יום", correct: 0, options: ["בית ספר", "בית חולים", "פארק", "חנות"], explanation: "\"school\" במשפט זה אומרת \"בית ספר\"", category: "vocabulary", type: "sentence-recording", englishWord: "school", hebrewWord: "בית ספר" },
    { id: 1291, text: "הקליט את עצמך אומר את המשפט: \"I visit the hospital\" ואז בחר מה הפירוש של המילה \"hospital\" במשפט:", sentence: "I visit the hospital", sentenceTranslation: "אני מבקר בבית חולים", correct: 1, options: ["בית ספר", "בית חולים", "פארק", "חנות"], explanation: "\"hospital\" במשפט זה אומרת \"בית חולים\"", category: "vocabulary", type: "sentence-recording", englishWord: "hospital", hebrewWord: "בית חולים" },
    { id: 1292, text: "הקליט את עצמך אומר את המשפט: \"I play in the park\" ואז בחר מה הפירוש של המילה \"park\" במשפט:", sentence: "I play in the park", sentenceTranslation: "אני משחק בפארק", correct: 2, options: ["בית ספר", "בית חולים", "פארק", "חנות"], explanation: "\"park\" במשפט זה אומרת \"פארק\"", category: "vocabulary", type: "sentence-recording", englishWord: "park", hebrewWord: "פארק" },
    { id: 1293, text: "הקליט את עצמך אומר את המשפט: \"I buy food at the store\" ואז בחר מה הפירוש של המילה \"store\" במשפט:", sentence: "I buy food at the store", sentenceTranslation: "אני קונה אוכל בחנות", correct: 3, options: ["בית ספר", "בית חולים", "פארק", "חנות"], explanation: "\"store\" במשפט זה אומרת \"חנות\"", category: "vocabulary", type: "sentence-recording", englishWord: "store", hebrewWord: "חנות" },
    { id: 1294, text: "הקליט את עצמך אומר את המשפט: \"I eat at the restaurant\" ואז בחר מה הפירוש של המילה \"restaurant\" במשפט:", sentence: "I eat at the restaurant", sentenceTranslation: "אני אוכל במסעדה", correct: 0, options: ["מסעדה", "בנק", "ספרייה", "מוזיאון"], explanation: "\"restaurant\" במשפט זה אומרת \"מסעדה\"", category: "vocabulary", type: "sentence-recording", englishWord: "restaurant", hebrewWord: "מסעדה" },
    { id: 1295, text: "הקליט את עצמך אומר את המשפט: \"I get money from the bank\" ואז בחר מה הפירוש של המילה \"bank\" במשפט:", sentence: "I get money from the bank", sentenceTranslation: "אני מקבל כסף מהבנק", correct: 1, options: ["מסעדה", "בנק", "ספרייה", "מוזיאון"], explanation: "\"bank\" במשפט זה אומרת \"בנק\"", category: "vocabulary", type: "sentence-recording", englishWord: "bank", hebrewWord: "בנק" },
    { id: 1296, text: "הקליט את עצמך אומר את המשפט: \"I read books in the library\" ואז בחר מה הפירוש של המילה \"library\" במשפט:", sentence: "I read books in the library", sentenceTranslation: "אני קורא ספרים בספרייה", correct: 2, options: ["מסעדה", "בנק", "ספרייה", "מוזיאון"], explanation: "\"library\" במשפט זה אומרת \"ספרייה\"", category: "vocabulary", type: "sentence-recording", englishWord: "library", hebrewWord: "ספרייה" },
    { id: 1297, text: "הקליט את עצמך אומר את המשפט: \"I see art in the museum\" ואז בחר מה הפירוש של המילה \"museum\" במשפט:", sentence: "I see art in the museum", sentenceTranslation: "אני רואה אמנות במוזיאון", correct: 3, options: ["מסעדה", "בנק", "ספרייה", "מוזיאון"], explanation: "\"museum\" במשפט זה אומרת \"מוזיאון\"", category: "vocabulary", type: "sentence-recording", englishWord: "museum", hebrewWord: "מוזיאון" },
    { id: 1298, text: "הקליט את עצמך אומר את המשפט: \"I watch movies at the cinema\" ואז בחר מה הפירוש של המילה \"cinema\" במשפט:", sentence: "I watch movies at the cinema", sentenceTranslation: "אני צופה בסרטים בקולנוע", correct: 0, options: ["קולנוע", "מלון", "תחנה", "שדה תעופה"], explanation: "\"cinema\" במשפט זה אומרת \"קולנוע\"", category: "vocabulary", type: "sentence-recording", englishWord: "cinema", hebrewWord: "קולנוע" },
    { id: 1299, text: "הקליט את עצמך אומר את המשפט: \"I sleep at the hotel\" ואז בחר מה הפירוש של המילה \"hotel\" במשפט:", sentence: "I sleep at the hotel", sentenceTranslation: "אני ישן במלון", correct: 1, options: ["קולנוע", "מלון", "תחנה", "שדה תעופה"], explanation: "\"hotel\" במשפט זה אומרת \"מלון\"", category: "vocabulary", type: "sentence-recording", englishWord: "hotel", hebrewWord: "מלון" }
    ],
    '4': [ // רמה 4 - מתקדם - מקומות נוספים
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1300, text: "מה אומרת המילה \"airport\"?", options: ["קולנוע", "מלון", "תחנה", "שדה תעופה"], correct: 3, explanation: "\"airport\" אומרת \"שדה תעופה\"", category: "vocabulary", type: "multiple-choice", englishWord: "airport", hebrewWord: "שדה תעופה" },
    { id: 1301, text: "מה אומרת המילה \"station\"?", options: ["קולנוע", "מלון", "תחנה", "שדה תעופה"], correct: 2, explanation: "\"station\" אומרת \"תחנה\"", category: "vocabulary", type: "multiple-choice", englishWord: "station", hebrewWord: "תחנה" },
    { id: 1302, text: "מה אומרת המילה \"beach\"?", options: ["חוף", "הר", "יער", "נהר"], correct: 0, explanation: "\"beach\" אומרת \"חוף\"", category: "vocabulary", type: "multiple-choice", englishWord: "beach", hebrewWord: "חוף" },
    { id: 1303, text: "מה אומרת המילה \"mountain\"?", options: ["חוף", "הר", "יער", "נהר"], correct: 1, explanation: "\"mountain\" אומרת \"הר\"", category: "vocabulary", type: "multiple-choice", englishWord: "mountain", hebrewWord: "הר" },
    { id: 1304, text: "מה אומרת המילה \"forest\"?", options: ["חוף", "הר", "יער", "נהר"], correct: 2, explanation: "\"forest\" אומרת \"יער\"", category: "vocabulary", type: "multiple-choice", englishWord: "forest", hebrewWord: "יער" },
    { id: 1305, text: "מה אומרת המילה \"river\"?", options: ["חוף", "הר", "יער", "נהר"], correct: 3, explanation: "\"river\" אומרת \"נהר\"", category: "vocabulary", type: "multiple-choice", englishWord: "river", hebrewWord: "נהר" },
    { id: 1306, text: "מה אומרת המילה \"lake\"?", options: ["אגם", "גשר", "רחוב", "בניין"], correct: 0, explanation: "\"lake\" אומרת \"אגם\"", category: "vocabulary", type: "multiple-choice", englishWord: "lake", hebrewWord: "אגם" },
    { id: 1307, text: "מה אומרת המילה \"bridge\"?", options: ["אגם", "גשר", "רחוב", "בניין"], correct: 1, explanation: "\"bridge\" אומרת \"גשר\"", category: "vocabulary", type: "multiple-choice", englishWord: "bridge", hebrewWord: "גשר" },
    { id: 1308, text: "מה אומרת המילה \"street\"?", options: ["אגם", "גשר", "רחוב", "בניין"], correct: 2, explanation: "\"street\" אומרת \"רחוב\"", category: "vocabulary", type: "multiple-choice", englishWord: "street", hebrewWord: "רחוב" },
    { id: 1309, text: "מה אומרת המילה \"building\"?", options: ["אגם", "גשר", "רחוב", "בניין"], correct: 3, explanation: "\"building\" אומרת \"בניין\"", category: "vocabulary", type: "multiple-choice", englishWord: "building", hebrewWord: "בניין" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1310, text: "הכתיב את המילה \"שדה תעופה\" באנגלית:", correct: "airport", explanation: "\"שדה תעופה\" באנגלית זה \"airport\"", category: "vocabulary", type: "dictation", englishWord: "airport", hebrewWord: "שדה תעופה" },
    { id: 1311, text: "הכתיב את המילה \"תחנה\" באנגלית:", correct: "station", explanation: "\"תחנה\" באנגלית זה \"station\"", category: "vocabulary", type: "dictation", englishWord: "station", hebrewWord: "תחנה" },
    { id: 1312, text: "הכתיב את המילה \"חוף\" באנגלית:", correct: "beach", explanation: "\"חוף\" באנגלית זה \"beach\"", category: "vocabulary", type: "dictation", englishWord: "beach", hebrewWord: "חוף" },
    { id: 1313, text: "הכתיב את המילה \"הר\" באנגלית:", correct: "mountain", explanation: "\"הר\" באנגלית זה \"mountain\"", category: "vocabulary", type: "dictation", englishWord: "mountain", hebrewWord: "הר" },
    { id: 1314, text: "הכתיב את המילה \"יער\" באנגלית:", correct: "forest", explanation: "\"יער\" באנגלית זה \"forest\"", category: "vocabulary", type: "dictation", englishWord: "forest", hebrewWord: "יער" },
    { id: 1315, text: "הכתיב את המילה \"נהר\" באנגלית:", correct: "river", explanation: "\"נהר\" באנגלית זה \"river\"", category: "vocabulary", type: "dictation", englishWord: "river", hebrewWord: "נהר" },
    { id: 1316, text: "הכתיב את המילה \"אגם\" באנגלית:", correct: "lake", explanation: "\"אגם\" באנגלית זה \"lake\"", category: "vocabulary", type: "dictation", englishWord: "lake", hebrewWord: "אגם" },
    { id: 1317, text: "הכתיב את המילה \"גשר\" באנגלית:", correct: "bridge", explanation: "\"גשר\" באנגלית זה \"bridge\"", category: "vocabulary", type: "dictation", englishWord: "bridge", hebrewWord: "גשר" },
    { id: 1318, text: "הכתיב את המילה \"רחוב\" באנגלית:", correct: "street", explanation: "\"רחוב\" באנגלית זה \"street\"", category: "vocabulary", type: "dictation", englishWord: "street", hebrewWord: "רחוב" },
    { id: 1319, text: "הכתיב את המילה \"בניין\" באנגלית:", correct: "building", explanation: "\"בניין\" באנגלית זה \"building\"", category: "vocabulary", type: "dictation", englishWord: "building", hebrewWord: "בניין" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1320, text: "הקליט את עצמך אומר את המילה \"שדה תעופה\" באנגלית:", correct: "airport", explanation: "\"שדה תעופה\" באנגלית זה \"airport\"", category: "vocabulary", type: "recording", englishWord: "airport", hebrewWord: "שדה תעופה" },
    { id: 1321, text: "הקליט את עצמך אומר את המילה \"תחנה\" באנגלית:", correct: "station", explanation: "\"תחנה\" באנגלית זה \"station\"", category: "vocabulary", type: "recording", englishWord: "station", hebrewWord: "תחנה" },
    { id: 1322, text: "הקליט את עצמך אומר את המילה \"חוף\" באנגלית:", correct: "beach", explanation: "\"חוף\" באנגלית זה \"beach\"", category: "vocabulary", type: "recording", englishWord: "beach", hebrewWord: "חוף" },
    { id: 1323, text: "הקליט את עצמך אומר את המילה \"הר\" באנגלית:", correct: "mountain", explanation: "\"הר\" באנגלית זה \"mountain\"", category: "vocabulary", type: "recording", englishWord: "mountain", hebrewWord: "הר" },
    { id: 1324, text: "הקליט את עצמך אומר את המילה \"יער\" באנגלית:", correct: "forest", explanation: "\"יער\" באנגלית זה \"forest\"", category: "vocabulary", type: "recording", englishWord: "forest", hebrewWord: "יער" },
    { id: 1325, text: "הקליט את עצמך אומר את המילה \"נהר\" באנגלית:", correct: "river", explanation: "\"נהר\" באנגלית זה \"river\"", category: "vocabulary", type: "recording", englishWord: "river", hebrewWord: "נהר" },
    { id: 1326, text: "הקליט את עצמך אומר את המילה \"אגם\" באנגלית:", correct: "lake", explanation: "\"אגם\" באנגלית זה \"lake\"", category: "vocabulary", type: "recording", englishWord: "lake", hebrewWord: "אגם" },
    { id: 1327, text: "הקליט את עצמך אומר את המילה \"גשר\" באנגלית:", correct: "bridge", explanation: "\"גשר\" באנגלית זה \"bridge\"", category: "vocabulary", type: "recording", englishWord: "bridge", hebrewWord: "גשר" },
    { id: 1328, text: "הקליט את עצמך אומר את המילה \"רחוב\" באנגלית:", correct: "street", explanation: "\"רחוב\" באנגלית זה \"street\"", category: "vocabulary", type: "recording", englishWord: "street", hebrewWord: "רחוב" },
    { id: 1329, text: "הקליט את עצמך אומר את המילה \"בניין\" באנגלית:", correct: "building", explanation: "\"בניין\" באנגלית זה \"building\"", category: "vocabulary", type: "recording", englishWord: "building", hebrewWord: "בניין" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1330, text: "הקליט את עצמך אומר את המשפט: \"I fly from the airport\" ואז בחר מה הפירוש של המילה \"airport\" במשפט:", sentence: "I fly from the airport", sentenceTranslation: "אני טס משדה התעופה", correct: 3, options: ["קולנוע", "מלון", "תחנה", "שדה תעופה"], explanation: "\"airport\" במשפט זה אומרת \"שדה תעופה\"", category: "vocabulary", type: "sentence-recording", englishWord: "airport", hebrewWord: "שדה תעופה" },
    { id: 1331, text: "הקליט את עצמך אומר את המשפט: \"I wait at the station\" ואז בחר מה הפירוש של המילה \"station\" במשפט:", sentence: "I wait at the station", sentenceTranslation: "אני מחכה בתחנה", correct: 2, options: ["קולנוע", "מלון", "תחנה", "שדה תעופה"], explanation: "\"station\" במשפט זה אומרת \"תחנה\"", category: "vocabulary", type: "sentence-recording", englishWord: "station", hebrewWord: "תחנה" },
    { id: 1332, text: "הקליט את עצמך אומר את המשפט: \"I swim at the beach\" ואז בחר מה הפירוש של המילה \"beach\" במשפט:", sentence: "I swim at the beach", sentenceTranslation: "אני שוחה בחוף", correct: 0, options: ["חוף", "הר", "יער", "נהר"], explanation: "\"beach\" במשפט זה אומרת \"חוף\"", category: "vocabulary", type: "sentence-recording", englishWord: "beach", hebrewWord: "חוף" },
    { id: 1333, text: "הקליט את עצמך אומר את המשפט: \"I climb the mountain\" ואז בחר מה הפירוש של המילה \"mountain\" במשפט:", sentence: "I climb the mountain", sentenceTranslation: "אני מטפס על ההר", correct: 1, options: ["חוף", "הר", "יער", "נהר"], explanation: "\"mountain\" במשפט זה אומרת \"הר\"", category: "vocabulary", type: "sentence-recording", englishWord: "mountain", hebrewWord: "הר" },
    { id: 1334, text: "הקליט את עצמך אומר את המשפט: \"I walk in the forest\" ואז בחר מה הפירוש של המילה \"forest\" במשפט:", sentence: "I walk in the forest", sentenceTranslation: "אני הולך ביער", correct: 2, options: ["חוף", "הר", "יער", "נהר"], explanation: "\"forest\" במשפט זה אומרת \"יער\"", category: "vocabulary", type: "sentence-recording", englishWord: "forest", hebrewWord: "יער" },
    { id: 1335, text: "הקליט את עצמך אומר את המשפט: \"I fish in the river\" ואז בחר מה הפירוש של המילה \"river\" במשפט:", sentence: "I fish in the river", sentenceTranslation: "אני דג בנהר", correct: 3, options: ["חוף", "הר", "יער", "נהר"], explanation: "\"river\" במשפט זה אומרת \"נהר\"", category: "vocabulary", type: "sentence-recording", englishWord: "river", hebrewWord: "נהר" },
    { id: 1336, text: "הקליט את עצמך אומר את המשפט: \"I swim in the lake\" ואז בחר מה הפירוש של המילה \"lake\" במשפט:", sentence: "I swim in the lake", sentenceTranslation: "אני שוחה באגם", correct: 0, options: ["אגם", "גשר", "רחוב", "בניין"], explanation: "\"lake\" במשפט זה אומרת \"אגם\"", category: "vocabulary", type: "sentence-recording", englishWord: "lake", hebrewWord: "אגם" },
    { id: 1337, text: "הקליט את עצמך אומר את המשפט: \"I cross the bridge\" ואז בחר מה הפירוש של המילה \"bridge\" במשפט:", sentence: "I cross the bridge", sentenceTranslation: "אני חוצה את הגשר", correct: 1, options: ["אגם", "גשר", "רחוב", "בניין"], explanation: "\"bridge\" במשפט זה אומרת \"גשר\"", category: "vocabulary", type: "sentence-recording", englishWord: "bridge", hebrewWord: "גשר" },
    { id: 1338, text: "הקליט את עצמך אומר את המשפט: \"I walk on the street\" ואז בחר מה הפירוש של המילה \"street\" במשפט:", sentence: "I walk on the street", sentenceTranslation: "אני הולך ברחוב", correct: 2, options: ["אגם", "גשר", "רחוב", "בניין"], explanation: "\"street\" במשפט זה אומרת \"רחוב\"", category: "vocabulary", type: "sentence-recording", englishWord: "street", hebrewWord: "רחוב" },
    { id: 1339, text: "הקליט את עצמך אומר את המשפט: \"I work in a building\" ואז בחר מה הפירוש של המילה \"building\" במשפט:", sentence: "I work in a building", sentenceTranslation: "אני עובד בבניין", correct: 3, options: ["אגם", "גשר", "רחוב", "בניין"], explanation: "\"building\" במשפט זה אומרת \"בניין\"", category: "vocabulary", type: "sentence-recording", englishWord: "building", hebrewWord: "בניין" }
    ],
    '5': [ // רמה 5 - מומחה - תחבורה מתקדמת
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1340, text: "מה אומרת המילה \"airplane\"?", options: ["מטוס", "רכבת", "אוטובוס", "מונית"], correct: 0, explanation: "\"airplane\" אומרת \"מטוס\"", category: "vocabulary", type: "multiple-choice", englishWord: "airplane", hebrewWord: "מטוס" },
    { id: 1341, text: "מה אומרת המילה \"train\"?", options: ["מטוס", "רכבת", "אוטובוס", "מונית"], correct: 1, explanation: "\"train\" אומרת \"רכבת\"", category: "vocabulary", type: "multiple-choice", englishWord: "train", hebrewWord: "רכבת" },
    { id: 1342, text: "מה אומרת המילה \"bus\"?", options: ["מטוס", "רכבת", "אוטובוס", "מונית"], correct: 2, explanation: "\"bus\" אומרת \"אוטובוס\"", category: "vocabulary", type: "multiple-choice", englishWord: "bus", hebrewWord: "אוטובוס" },
    { id: 1343, text: "מה אומרת המילה \"taxi\"?", options: ["מטוס", "רכבת", "אוטובוס", "מונית"], correct: 3, explanation: "\"taxi\" אומרת \"מונית\"", category: "vocabulary", type: "multiple-choice", englishWord: "taxi", hebrewWord: "מונית" },
    { id: 1344, text: "מה אומרת המילה \"bicycle\"?", options: ["אופניים", "אופנוע", "ספינה", "סירה"], correct: 0, explanation: "\"bicycle\" אומרת \"אופניים\"", category: "vocabulary", type: "multiple-choice", englishWord: "bicycle", hebrewWord: "אופניים" },
    { id: 1345, text: "מה אומרת המילה \"motorcycle\"?", options: ["אופניים", "אופנוע", "ספינה", "סירה"], correct: 1, explanation: "\"motorcycle\" אומרת \"אופנוע\"", category: "vocabulary", type: "multiple-choice", englishWord: "motorcycle", hebrewWord: "אופנוע" },
    { id: 1346, text: "מה אומרת המילה \"ship\"?", options: ["אופניים", "אופנוע", "ספינה", "סירה"], correct: 2, explanation: "\"ship\" אומרת \"ספינה\"", category: "vocabulary", type: "multiple-choice", englishWord: "ship", hebrewWord: "ספינה" },
    { id: 1347, text: "מה אומרת המילה \"boat\"?", options: ["אופניים", "אופנוע", "ספינה", "סירה"], correct: 3, explanation: "\"boat\" אומרת \"סירה\"", category: "vocabulary", type: "multiple-choice", englishWord: "boat", hebrewWord: "סירה" },
    { id: 1348, text: "מה אומרת המילה \"truck\"?", options: ["משאית", "מכונית", "רכב", "אוטו"], correct: 0, explanation: "\"truck\" אומרת \"משאית\"", category: "vocabulary", type: "multiple-choice", englishWord: "truck", hebrewWord: "משאית" },
    { id: 1349, text: "מה אומרת המילה \"car\"?", options: ["משאית", "מכונית", "רכב", "אוטו"], correct: 1, explanation: "\"car\" אומרת \"מכונית\"", category: "vocabulary", type: "multiple-choice", englishWord: "car", hebrewWord: "מכונית" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1350, text: "הכתיב את המילה \"מטוס\" באנגלית:", correct: "airplane", explanation: "\"מטוס\" באנגלית זה \"airplane\"", category: "vocabulary", type: "dictation", englishWord: "airplane", hebrewWord: "מטוס" },
    { id: 1351, text: "הכתיב את המילה \"רכבת\" באנגלית:", correct: "train", explanation: "\"רכבת\" באנגלית זה \"train\"", category: "vocabulary", type: "dictation", englishWord: "train", hebrewWord: "רכבת" },
    { id: 1352, text: "הכתיב את המילה \"אוטובוס\" באנגלית:", correct: "bus", explanation: "\"אוטובוס\" באנגלית זה \"bus\"", category: "vocabulary", type: "dictation", englishWord: "bus", hebrewWord: "אוטובוס" },
    { id: 1353, text: "הכתיב את המילה \"מונית\" באנגלית:", correct: "taxi", explanation: "\"מונית\" באנגלית זה \"taxi\"", category: "vocabulary", type: "dictation", englishWord: "taxi", hebrewWord: "מונית" },
    { id: 1354, text: "הכתיב את המילה \"אופניים\" באנגלית:", correct: "bicycle", explanation: "\"אופניים\" באנגלית זה \"bicycle\"", category: "vocabulary", type: "dictation", englishWord: "bicycle", hebrewWord: "אופניים" },
    { id: 1355, text: "הכתיב את המילה \"אופנוע\" באנגלית:", correct: "motorcycle", explanation: "\"אופנוע\" באנגלית זה \"motorcycle\"", category: "vocabulary", type: "dictation", englishWord: "motorcycle", hebrewWord: "אופנוע" },
    { id: 1356, text: "הכתיב את המילה \"ספינה\" באנגלית:", correct: "ship", explanation: "\"ספינה\" באנגלית זה \"ship\"", category: "vocabulary", type: "dictation", englishWord: "ship", hebrewWord: "ספינה" },
    { id: 1357, text: "הכתיב את המילה \"סירה\" באנגלית:", correct: "boat", explanation: "\"סירה\" באנגלית זה \"boat\"", category: "vocabulary", type: "dictation", englishWord: "boat", hebrewWord: "סירה" },
    { id: 1358, text: "הכתיב את המילה \"משאית\" באנגלית:", correct: "truck", explanation: "\"משאית\" באנגלית זה \"truck\"", category: "vocabulary", type: "dictation", englishWord: "truck", hebrewWord: "משאית" },
    { id: 1359, text: "הכתיב את המילה \"מכונית\" באנגלית:", correct: "car", explanation: "\"מכונית\" באנגלית זה \"car\"", category: "vocabulary", type: "dictation", englishWord: "car", hebrewWord: "מכונית" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1360, text: "הקליט את עצמך אומר את המילה \"מטוס\" באנגלית:", correct: "airplane", explanation: "\"מטוס\" באנגלית זה \"airplane\"", category: "vocabulary", type: "recording", englishWord: "airplane", hebrewWord: "מטוס" },
    { id: 1361, text: "הקליט את עצמך אומר את המילה \"רכבת\" באנגלית:", correct: "train", explanation: "\"רכבת\" באנגלית זה \"train\"", category: "vocabulary", type: "recording", englishWord: "train", hebrewWord: "רכבת" },
    { id: 1362, text: "הקליט את עצמך אומר את המילה \"אוטובוס\" באנגלית:", correct: "bus", explanation: "\"אוטובוס\" באנגלית זה \"bus\"", category: "vocabulary", type: "recording", englishWord: "bus", hebrewWord: "אוטובוס" },
    { id: 1363, text: "הקליט את עצמך אומר את המילה \"מונית\" באנגלית:", correct: "taxi", explanation: "\"מונית\" באנגלית זה \"taxi\"", category: "vocabulary", type: "recording", englishWord: "taxi", hebrewWord: "מונית" },
    { id: 1364, text: "הקליט את עצמך אומר את המילה \"אופניים\" באנגלית:", correct: "bicycle", explanation: "\"אופניים\" באנגלית זה \"bicycle\"", category: "vocabulary", type: "recording", englishWord: "bicycle", hebrewWord: "אופניים" },
    { id: 1365, text: "הקליט את עצמך אומר את המילה \"אופנוע\" באנגלית:", correct: "motorcycle", explanation: "\"אופנוע\" באנגלית זה \"motorcycle\"", category: "vocabulary", type: "recording", englishWord: "motorcycle", hebrewWord: "אופנוע" },
    { id: 1366, text: "הקליט את עצמך אומר את המילה \"ספינה\" באנגלית:", correct: "ship", explanation: "\"ספינה\" באנגלית זה \"ship\"", category: "vocabulary", type: "recording", englishWord: "ship", hebrewWord: "ספינה" },
    { id: 1367, text: "הקליט את עצמך אומר את המילה \"סירה\" באנגלית:", correct: "boat", explanation: "\"סירה\" באנגלית זה \"boat\"", category: "vocabulary", type: "recording", englishWord: "boat", hebrewWord: "סירה" },
    { id: 1368, text: "הקליט את עצמך אומר את המילה \"משאית\" באנגלית:", correct: "truck", explanation: "\"משאית\" באנגלית זה \"truck\"", category: "vocabulary", type: "recording", englishWord: "truck", hebrewWord: "משאית" },
    { id: 1369, text: "הקליט את עצמך אומר את המילה \"מכונית\" באנגלית:", correct: "car", explanation: "\"מכונית\" באנגלית זה \"car\"", category: "vocabulary", type: "recording", englishWord: "car", hebrewWord: "מכונית" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1370, text: "הקליט את עצמך אומר את המשפט: \"I fly in an airplane\" ואז בחר מה הפירוש של המילה \"airplane\" במשפט:", sentence: "I fly in an airplane", sentenceTranslation: "אני טס במטוס", correct: 0, options: ["מטוס", "רכבת", "אוטובוס", "מונית"], explanation: "\"airplane\" במשפט זה אומרת \"מטוס\"", category: "vocabulary", type: "sentence-recording", englishWord: "airplane", hebrewWord: "מטוס" },
    { id: 1371, text: "הקליט את עצמך אומר את המשפט: \"I ride on a train\" ואז בחר מה הפירוש של המילה \"train\" במשפט:", sentence: "I ride on a train", sentenceTranslation: "אני נוסע ברכבת", correct: 1, options: ["מטוס", "רכבת", "אוטובוס", "מונית"], explanation: "\"train\" במשפט זה אומרת \"רכבת\"", category: "vocabulary", type: "sentence-recording", englishWord: "train", hebrewWord: "רכבת" },
    { id: 1372, text: "הקליט את עצמך אומר את המשפט: \"I take the bus to school\" ואז בחר מה הפירוש של המילה \"bus\" במשפט:", sentence: "I take the bus to school", sentenceTranslation: "אני לוקח את האוטובוס לבית ספר", correct: 2, options: ["מטוס", "רכבת", "אוטובוס", "מונית"], explanation: "\"bus\" במשפט זה אומרת \"אוטובוס\"", category: "vocabulary", type: "sentence-recording", englishWord: "bus", hebrewWord: "אוטובוס" },
    { id: 1373, text: "הקליט את עצמך אומר את המשפט: \"I call a taxi\" ואז בחר מה הפירוש של המילה \"taxi\" במשפט:", sentence: "I call a taxi", sentenceTranslation: "אני קורא למונית", correct: 3, options: ["מטוס", "רכבת", "אוטובוס", "מונית"], explanation: "\"taxi\" במשפט זה אומרת \"מונית\"", category: "vocabulary", type: "sentence-recording", englishWord: "taxi", hebrewWord: "מונית" },
    { id: 1374, text: "הקליט את עצמך אומר את המשפט: \"I ride my bicycle\" ואז בחר מה הפירוש של המילה \"bicycle\" במשפט:", sentence: "I ride my bicycle", sentenceTranslation: "אני רוכב על האופניים שלי", correct: 0, options: ["אופניים", "אופנוע", "ספינה", "סירה"], explanation: "\"bicycle\" במשפט זה אומרת \"אופניים\"", category: "vocabulary", type: "sentence-recording", englishWord: "bicycle", hebrewWord: "אופניים" },
    { id: 1375, text: "הקליט את עצמך אומר את המשפט: \"I drive a motorcycle\" ואז בחר מה הפירוש של המילה \"motorcycle\" במשפט:", sentence: "I drive a motorcycle", sentenceTranslation: "אני נוהג באופנוע", correct: 1, options: ["אופניים", "אופנוע", "ספינה", "סירה"], explanation: "\"motorcycle\" במשפט זה אומרת \"אופנוע\"", category: "vocabulary", type: "sentence-recording", englishWord: "motorcycle", hebrewWord: "אופנוע" },
    { id: 1376, text: "הקליט את עצמך אומר את המשפט: \"I sail on a ship\" ואז בחר מה הפירוש של המילה \"ship\" במשפט:", sentence: "I sail on a ship", sentenceTranslation: "אני מפליג בספינה", correct: 2, options: ["אופניים", "אופנוע", "ספינה", "סירה"], explanation: "\"ship\" במשפט זה אומרת \"ספינה\"", category: "vocabulary", type: "sentence-recording", englishWord: "ship", hebrewWord: "ספינה" },
    { id: 1377, text: "הקליט את עצמך אומר את המשפט: \"I row a boat\" ואז בחר מה הפירוש של המילה \"boat\" במשפט:", sentence: "I row a boat", sentenceTranslation: "אני חותר בסירה", correct: 3, options: ["אופניים", "אופנוע", "ספינה", "סירה"], explanation: "\"boat\" במשפט זה אומרת \"סירה\"", category: "vocabulary", type: "sentence-recording", englishWord: "boat", hebrewWord: "סירה" },
    { id: 1378, text: "הקליט את עצמך אומר את המשפט: \"I drive a truck\" ואז בחר מה הפירוש של המילה \"truck\" במשפט:", sentence: "I drive a truck", sentenceTranslation: "אני נוהג במשאית", correct: 0, options: ["משאית", "מכונית", "רכב", "אוטו"], explanation: "\"truck\" במשפט זה אומרת \"משאית\"", category: "vocabulary", type: "sentence-recording", englishWord: "truck", hebrewWord: "משאית" },
    { id: 1379, text: "הקליט את עצמך אומר את המשפט: \"I own a car\" ואז בחר מה הפירוש של המילה \"car\" במשפט:", sentence: "I own a car", sentenceTranslation: "יש לי מכונית", correct: 1, options: ["משאית", "מכונית", "רכב", "אוטו"], explanation: "\"car\" במשפט זה אומרת \"מכונית\"", category: "vocabulary", type: "sentence-recording", englishWord: "car", hebrewWord: "מכונית" }
    ]
  },
  '7': { // יחידה 7 - דקדוק מתקדם
    '1': [ // רמה 1 - מתחילים - זמנים בסיסיים
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1380, text: "מה אומרת המילה \"was\"?", options: ["היה", "היו", "יהיה", "יהיו"], correct: 0, explanation: "\"was\" אומרת \"היה\"", category: "vocabulary", type: "multiple-choice", englishWord: "was", hebrewWord: "היה" },
    { id: 1381, text: "מה אומרת המילה \"were\"?", options: ["היה", "היו", "יהיה", "יהיו"], correct: 1, explanation: "\"were\" אומרת \"היו\"", category: "vocabulary", type: "multiple-choice", englishWord: "were", hebrewWord: "היו" },
    { id: 1382, text: "מה אומרת המילה \"went\"?", options: ["הלך", "בא", "אכל", "שתה"], correct: 0, explanation: "\"went\" אומרת \"הלך\"", category: "vocabulary", type: "multiple-choice", englishWord: "went", hebrewWord: "הלך" },
    { id: 1383, text: "מה אומרת המילה \"came\"?", options: ["הלך", "בא", "אכל", "שתה"], correct: 1, explanation: "\"came\" אומרת \"בא\"", category: "vocabulary", type: "multiple-choice", englishWord: "came", hebrewWord: "בא" },
    { id: 1384, text: "מה אומרת המילה \"ate\"?", options: ["הלך", "בא", "אכל", "שתה"], correct: 2, explanation: "\"ate\" אומרת \"אכל\"", category: "vocabulary", type: "multiple-choice", englishWord: "ate", hebrewWord: "אכל" },
    { id: 1385, text: "מה אומרת המילה \"drank\"?", options: ["הלך", "בא", "אכל", "שתה"], correct: 3, explanation: "\"drank\" אומרת \"שתה\"", category: "vocabulary", type: "multiple-choice", englishWord: "drank", hebrewWord: "שתה" },
    { id: 1386, text: "מה אומרת המילה \"played\"?", options: ["שיחק", "קרא", "כתב", "ראה"], correct: 0, explanation: "\"played\" אומרת \"שיחק\"", category: "vocabulary", type: "multiple-choice", englishWord: "played", hebrewWord: "שיחק" },
    { id: 1387, text: "מה אומרת המילה \"read\"?", options: ["שיחק", "קרא", "כתב", "ראה"], correct: 1, explanation: "\"read\" אומרת \"קרא\"", category: "vocabulary", type: "multiple-choice", englishWord: "read", hebrewWord: "קרא" },
    { id: 1388, text: "מה אומרת המילה \"wrote\"?", options: ["שיחק", "קרא", "כתב", "ראה"], correct: 2, explanation: "\"wrote\" אומרת \"כתב\"", category: "vocabulary", type: "multiple-choice", englishWord: "wrote", hebrewWord: "כתב" },
    { id: 1389, text: "מה אומרת המילה \"saw\"?", options: ["שיחק", "קרא", "כתב", "ראה"], correct: 3, explanation: "\"saw\" אומרת \"ראה\"", category: "vocabulary", type: "multiple-choice", englishWord: "saw", hebrewWord: "ראה" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1390, text: "הכתיב את המילה \"היה\" באנגלית:", correct: "was", explanation: "\"היה\" באנגלית זה \"was\"", category: "vocabulary", type: "dictation", englishWord: "was", hebrewWord: "היה" },
    { id: 1391, text: "הכתיב את המילה \"היו\" באנגלית:", correct: "were", explanation: "\"היו\" באנגלית זה \"were\"", category: "vocabulary", type: "dictation", englishWord: "were", hebrewWord: "היו" },
    { id: 1392, text: "הכתיב את המילה \"הלך\" באנגלית:", correct: "went", explanation: "\"הלך\" באנגלית זה \"went\"", category: "vocabulary", type: "dictation", englishWord: "went", hebrewWord: "הלך" },
    { id: 1393, text: "הכתיב את המילה \"בא\" באנגלית:", correct: "came", explanation: "\"בא\" באנגלית זה \"came\"", category: "vocabulary", type: "dictation", englishWord: "came", hebrewWord: "בא" },
    { id: 1394, text: "הכתיב את המילה \"אכל\" באנגלית:", correct: "ate", explanation: "\"אכל\" באנגלית זה \"ate\"", category: "vocabulary", type: "dictation", englishWord: "ate", hebrewWord: "אכל" },
    { id: 1395, text: "הכתיב את המילה \"שתה\" באנגלית:", correct: "drank", explanation: "\"שתה\" באנגלית זה \"drank\"", category: "vocabulary", type: "dictation", englishWord: "drank", hebrewWord: "שתה" },
    { id: 1396, text: "הכתיב את המילה \"שיחק\" באנגלית:", correct: "played", explanation: "\"שיחק\" באנגלית זה \"played\"", category: "vocabulary", type: "dictation", englishWord: "played", hebrewWord: "שיחק" },
    { id: 1397, text: "הכתיב את המילה \"קרא\" באנגלית:", correct: "read", explanation: "\"קרא\" באנגלית זה \"read\"", category: "vocabulary", type: "dictation", englishWord: "read", hebrewWord: "קרא" },
    { id: 1398, text: "הכתיב את המילה \"כתב\" באנגלית:", correct: "wrote", explanation: "\"כתב\" באנגלית זה \"wrote\"", category: "vocabulary", type: "dictation", englishWord: "wrote", hebrewWord: "כתב" },
    { id: 1399, text: "הכתיב את המילה \"ראה\" באנגלית:", correct: "saw", explanation: "\"ראה\" באנגלית זה \"saw\"", category: "vocabulary", type: "dictation", englishWord: "saw", hebrewWord: "ראה" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1400, text: "הקליט את עצמך אומר את המילה \"היה\" באנגלית:", correct: "was", explanation: "\"היה\" באנגלית זה \"was\"", category: "vocabulary", type: "recording", englishWord: "was", hebrewWord: "היה" },
    { id: 1401, text: "הקליט את עצמך אומר את המילה \"היו\" באנגלית:", correct: "were", explanation: "\"היו\" באנגלית זה \"were\"", category: "vocabulary", type: "recording", englishWord: "were", hebrewWord: "היו" },
    { id: 1402, text: "הקליט את עצמך אומר את המילה \"הלך\" באנגלית:", correct: "went", explanation: "\"הלך\" באנגלית זה \"went\"", category: "vocabulary", type: "recording", englishWord: "went", hebrewWord: "הלך" },
    { id: 1403, text: "הקליט את עצמך אומר את המילה \"בא\" באנגלית:", correct: "came", explanation: "\"בא\" באנגלית זה \"came\"", category: "vocabulary", type: "recording", englishWord: "came", hebrewWord: "בא" },
    { id: 1404, text: "הקליט את עצמך אומר את המילה \"אכל\" באנגלית:", correct: "ate", explanation: "\"אכל\" באנגלית זה \"ate\"", category: "vocabulary", type: "recording", englishWord: "ate", hebrewWord: "אכל" },
    { id: 1405, text: "הקליט את עצמך אומר את המילה \"שתה\" באנגלית:", correct: "drank", explanation: "\"שתה\" באנגלית זה \"drank\"", category: "vocabulary", type: "recording", englishWord: "drank", hebrewWord: "שתה" },
    { id: 1406, text: "הקליט את עצמך אומר את המילה \"שיחק\" באנגלית:", correct: "played", explanation: "\"שיחק\" באנגלית זה \"played\"", category: "vocabulary", type: "recording", englishWord: "played", hebrewWord: "שיחק" },
    { id: 1407, text: "הקליט את עצמך אומר את המילה \"קרא\" באנגלית:", correct: "read", explanation: "\"קרא\" באנגלית זה \"read\"", category: "vocabulary", type: "recording", englishWord: "read", hebrewWord: "קרא" },
    { id: 1408, text: "הקליט את עצמך אומר את המילה \"כתב\" באנגלית:", correct: "wrote", explanation: "\"כתב\" באנגלית זה \"wrote\"", category: "vocabulary", type: "recording", englishWord: "wrote", hebrewWord: "כתב" },
    { id: 1409, text: "הקליט את עצמך אומר את המילה \"ראה\" באנגלית:", correct: "saw", explanation: "\"ראה\" באנגלית זה \"saw\"", category: "vocabulary", type: "recording", englishWord: "saw", hebrewWord: "ראה" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1410, text: "הקליט את עצמך אומר את המשפט: \"I was happy yesterday\" ואז בחר מה הפירוש של המילה \"was\" במשפט:", sentence: "I was happy yesterday", sentenceTranslation: "הייתי שמח אתמול", correct: 0, options: ["היה", "היו", "יהיה", "יהיו"], explanation: "\"was\" במשפט זה אומרת \"היה\"", category: "vocabulary", type: "sentence-recording", englishWord: "was", hebrewWord: "היה" },
    { id: 1411, text: "הקליט את עצמך אומר את המשפט: \"We were friends\" ואז בחר מה הפירוש של המילה \"were\" במשפט:", sentence: "We were friends", sentenceTranslation: "היינו חברים", correct: 1, options: ["היה", "היו", "יהיה", "יהיו"], explanation: "\"were\" במשפט זה אומרת \"היו\"", category: "vocabulary", type: "sentence-recording", englishWord: "were", hebrewWord: "היו" },
    { id: 1412, text: "הקליט את עצמך אומר את המשפט: \"I went to school\" ואז בחר מה הפירוש של המילה \"went\" במשפט:", sentence: "I went to school", sentenceTranslation: "הלכתי לבית ספר", correct: 0, options: ["הלך", "בא", "אכל", "שתה"], explanation: "\"went\" במשפט זה אומרת \"הלך\"", category: "vocabulary", type: "sentence-recording", englishWord: "went", hebrewWord: "הלך" },
    { id: 1413, text: "הקליט את עצמך אומר את המשפט: \"I came home\" ואז בחר מה הפירוש של המילה \"came\" במשפט:", sentence: "I came home", sentenceTranslation: "באתי הביתה", correct: 1, options: ["הלך", "בא", "אכל", "שתה"], explanation: "\"came\" במשפט זה אומרת \"בא\"", category: "vocabulary", type: "sentence-recording", englishWord: "came", hebrewWord: "בא" },
    { id: 1414, text: "הקליט את עצמך אומר את המשפט: \"I ate breakfast\" ואז בחר מה הפירוש של המילה \"ate\" במשפט:", sentence: "I ate breakfast", sentenceTranslation: "אכלתי ארוחת בוקר", correct: 2, options: ["הלך", "בא", "אכל", "שתה"], explanation: "\"ate\" במשפט זה אומרת \"אכל\"", category: "vocabulary", type: "sentence-recording", englishWord: "ate", hebrewWord: "אכל" },
    { id: 1415, text: "הקליט את עצמך אומר את המשפט: \"I drank water\" ואז בחר מה הפירוש של המילה \"drank\" במשפט:", sentence: "I drank water", sentenceTranslation: "שתיתי מים", correct: 3, options: ["הלך", "בא", "אכל", "שתה"], explanation: "\"drank\" במשפט זה אומרת \"שתה\"", category: "vocabulary", type: "sentence-recording", englishWord: "drank", hebrewWord: "שתה" },
    { id: 1416, text: "הקליט את עצמך אומר את המשפט: \"I played soccer\" ואז בחר מה הפירוש של המילה \"played\" במשפט:", sentence: "I played soccer", sentenceTranslation: "שיחקתי כדורגל", correct: 0, options: ["שיחק", "קרא", "כתב", "ראה"], explanation: "\"played\" במשפט זה אומרת \"שיחק\"", category: "vocabulary", type: "sentence-recording", englishWord: "played", hebrewWord: "שיחק" },
    { id: 1417, text: "הקליט את עצמך אומר את המשפט: \"I read a book\" ואז בחר מה הפירוש של המילה \"read\" במשפט:", sentence: "I read a book", sentenceTranslation: "קראתי ספר", correct: 1, options: ["שיחק", "קרא", "כתב", "ראה"], explanation: "\"read\" במשפט זה אומרת \"קרא\"", category: "vocabulary", type: "sentence-recording", englishWord: "read", hebrewWord: "קרא" },
    { id: 1418, text: "הקליט את עצמך אומר את המשפט: \"I wrote a letter\" ואז בחר מה הפירוש של המילה \"wrote\" במשפט:", sentence: "I wrote a letter", sentenceTranslation: "כתבתי מכתב", correct: 2, options: ["שיחק", "קרא", "כתב", "ראה"], explanation: "\"wrote\" במשפט זה אומרת \"כתב\"", category: "vocabulary", type: "sentence-recording", englishWord: "wrote", hebrewWord: "כתב" },
    { id: 1419, text: "הקליט את עצמך אומר את המשפט: \"I saw a bird\" ואז בחר מה הפירוש של המילה \"saw\" במשפט:", sentence: "I saw a bird", sentenceTranslation: "ראיתי ציפור", correct: 3, options: ["שיחק", "קרא", "כתב", "ראה"], explanation: "\"saw\" במשפט זה אומרת \"ראה\"", category: "vocabulary", type: "sentence-recording", englishWord: "saw", hebrewWord: "ראה" }
    ],
    '2': [ // רמה 2 - בסיסי - זמנים מתקדמים יותר
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1420, text: "מה אומרת המילה \"had\"?", options: ["היה לי", "היה לו", "עשה", "עשתה"], correct: 0, explanation: "\"had\" אומרת \"היה לי\"", category: "vocabulary", type: "multiple-choice", englishWord: "had", hebrewWord: "היה לי" },
    { id: 1421, text: "מה אומרת המילה \"did\"?", options: ["היה לי", "היה לו", "עשה", "עשתה"], correct: 2, explanation: "\"did\" אומרת \"עשה\"", category: "vocabulary", type: "multiple-choice", englishWord: "did", hebrewWord: "עשה" },
    { id: 1422, text: "מה אומרת המילה \"got\"?", options: ["קיבל", "נתן", "קנה", "מכר"], correct: 0, explanation: "\"got\" אומרת \"קיבל\"", category: "vocabulary", type: "multiple-choice", englishWord: "got", hebrewWord: "קיבל" },
    { id: 1423, text: "מה אומרת המילה \"gave\"?", options: ["קיבל", "נתן", "קנה", "מכר"], correct: 1, explanation: "\"gave\" אומרת \"נתן\"", category: "vocabulary", type: "multiple-choice", englishWord: "gave", hebrewWord: "נתן" },
    { id: 1424, text: "מה אומרת המילה \"bought\"?", options: ["קיבל", "נתן", "קנה", "מכר"], correct: 2, explanation: "\"bought\" אומרת \"קנה\"", category: "vocabulary", type: "multiple-choice", englishWord: "bought", hebrewWord: "קנה" },
    { id: 1425, text: "מה אומרת המילה \"sold\"?", options: ["קיבל", "נתן", "קנה", "מכר"], correct: 3, explanation: "\"sold\" אומרת \"מכר\"", category: "vocabulary", type: "multiple-choice", englishWord: "sold", hebrewWord: "מכר" },
    { id: 1426, text: "מה אומרת המילה \"took\"?", options: ["לקח", "הביא", "השאיר", "החזיר"], correct: 0, explanation: "\"took\" אומרת \"לקח\"", category: "vocabulary", type: "multiple-choice", englishWord: "took", hebrewWord: "לקח" },
    { id: 1427, text: "מה אומרת המילה \"brought\"?", options: ["לקח", "הביא", "השאיר", "החזיר"], correct: 1, explanation: "\"brought\" אומרת \"הביא\"", category: "vocabulary", type: "multiple-choice", englishWord: "brought", hebrewWord: "הביא" },
    { id: 1428, text: "מה אומרת המילה \"left\"?", options: ["לקח", "הביא", "השאיר", "החזיר"], correct: 2, explanation: "\"left\" אומרת \"השאיר\"", category: "vocabulary", type: "multiple-choice", englishWord: "left", hebrewWord: "השאיר" },
    { id: 1429, text: "מה אומרת המילה \"returned\"?", options: ["לקח", "הביא", "השאיר", "החזיר"], correct: 3, explanation: "\"returned\" אומרת \"החזיר\"", category: "vocabulary", type: "multiple-choice", englishWord: "returned", hebrewWord: "החזיר" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1430, text: "הכתיב את המילה \"היה לי\" באנגלית:", correct: "had", explanation: "\"היה לי\" באנגלית זה \"had\"", category: "vocabulary", type: "dictation", englishWord: "had", hebrewWord: "היה לי" },
    { id: 1431, text: "הכתיב את המילה \"עשה\" באנגלית:", correct: "did", explanation: "\"עשה\" באנגלית זה \"did\"", category: "vocabulary", type: "dictation", englishWord: "did", hebrewWord: "עשה" },
    { id: 1432, text: "הכתיב את המילה \"קיבל\" באנגלית:", correct: "got", explanation: "\"קיבל\" באנגלית זה \"got\"", category: "vocabulary", type: "dictation", englishWord: "got", hebrewWord: "קיבל" },
    { id: 1433, text: "הכתיב את המילה \"נתן\" באנגלית:", correct: "gave", explanation: "\"נתן\" באנגלית זה \"gave\"", category: "vocabulary", type: "dictation", englishWord: "gave", hebrewWord: "נתן" },
    { id: 1434, text: "הכתיב את המילה \"קנה\" באנגלית:", correct: "bought", explanation: "\"קנה\" באנגלית זה \"bought\"", category: "vocabulary", type: "dictation", englishWord: "bought", hebrewWord: "קנה" },
    { id: 1435, text: "הכתיב את המילה \"מכר\" באנגלית:", correct: "sold", explanation: "\"מכר\" באנגלית זה \"sold\"", category: "vocabulary", type: "dictation", englishWord: "sold", hebrewWord: "מכר" },
    { id: 1436, text: "הכתיב את המילה \"לקח\" באנגלית:", correct: "took", explanation: "\"לקח\" באנגלית זה \"took\"", category: "vocabulary", type: "dictation", englishWord: "took", hebrewWord: "לקח" },
    { id: 1437, text: "הכתיב את המילה \"הביא\" באנגלית:", correct: "brought", explanation: "\"הביא\" באנגלית זה \"brought\"", category: "vocabulary", type: "dictation", englishWord: "brought", hebrewWord: "הביא" },
    { id: 1438, text: "הכתיב את המילה \"השאיר\" באנגלית:", correct: "left", explanation: "\"השאיר\" באנגלית זה \"left\"", category: "vocabulary", type: "dictation", englishWord: "left", hebrewWord: "השאיר" },
    { id: 1439, text: "הכתיב את המילה \"החזיר\" באנגלית:", correct: "returned", explanation: "\"החזיר\" באנגלית זה \"returned\"", category: "vocabulary", type: "dictation", englishWord: "returned", hebrewWord: "החזיר" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1440, text: "הקליט את עצמך אומר את המילה \"היה לי\" באנגלית:", correct: "had", explanation: "\"היה לי\" באנגלית זה \"had\"", category: "vocabulary", type: "recording", englishWord: "had", hebrewWord: "היה לי" },
    { id: 1441, text: "הקליט את עצמך אומר את המילה \"עשה\" באנגלית:", correct: "did", explanation: "\"עשה\" באנגלית זה \"did\"", category: "vocabulary", type: "recording", englishWord: "did", hebrewWord: "עשה" },
    { id: 1442, text: "הקליט את עצמך אומר את המילה \"קיבל\" באנגלית:", correct: "got", explanation: "\"קיבל\" באנגלית זה \"got\"", category: "vocabulary", type: "recording", englishWord: "got", hebrewWord: "קיבל" },
    { id: 1443, text: "הקליט את עצמך אומר את המילה \"נתן\" באנגלית:", correct: "gave", explanation: "\"נתן\" באנגלית זה \"gave\"", category: "vocabulary", type: "recording", englishWord: "gave", hebrewWord: "נתן" },
    { id: 1444, text: "הקליט את עצמך אומר את המילה \"קנה\" באנגלית:", correct: "bought", explanation: "\"קנה\" באנגלית זה \"bought\"", category: "vocabulary", type: "recording", englishWord: "bought", hebrewWord: "קנה" },
    { id: 1445, text: "הקליט את עצמך אומר את המילה \"מכר\" באנגלית:", correct: "sold", explanation: "\"מכר\" באנגלית זה \"sold\"", category: "vocabulary", type: "recording", englishWord: "sold", hebrewWord: "מכר" },
    { id: 1446, text: "הקליט את עצמך אומר את המילה \"לקח\" באנגלית:", correct: "took", explanation: "\"לקח\" באנגלית זה \"took\"", category: "vocabulary", type: "recording", englishWord: "took", hebrewWord: "לקח" },
    { id: 1447, text: "הקליט את עצמך אומר את המילה \"הביא\" באנגלית:", correct: "brought", explanation: "\"הביא\" באנגלית זה \"brought\"", category: "vocabulary", type: "recording", englishWord: "brought", hebrewWord: "הביא" },
    { id: 1448, text: "הקליט את עצמך אומר את המילה \"השאיר\" באנגלית:", correct: "left", explanation: "\"השאיר\" באנגלית זה \"left\"", category: "vocabulary", type: "recording", englishWord: "left", hebrewWord: "השאיר" },
    { id: 1449, text: "הקליט את עצמך אומר את המילה \"החזיר\" באנגלית:", correct: "returned", explanation: "\"החזיר\" באנגלית זה \"returned\"", category: "vocabulary", type: "recording", englishWord: "returned", hebrewWord: "החזיר" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1450, text: "הקליט את עצמך אומר את המשפט: \"I had a dog\" ואז בחר מה הפירוש של המילה \"had\" במשפט:", sentence: "I had a dog", sentenceTranslation: "היה לי כלב", correct: 0, options: ["היה לי", "היה לו", "עשה", "עשתה"], explanation: "\"had\" במשפט זה אומרת \"היה לי\"", category: "vocabulary", type: "sentence-recording", englishWord: "had", hebrewWord: "היה לי" },
    { id: 1451, text: "הקליט את עצמך אומר את המשפט: \"I did my homework\" ואז בחר מה הפירוש של המילה \"did\" במשפט:", sentence: "I did my homework", sentenceTranslation: "עשיתי את שיעורי הבית שלי", correct: 2, options: ["היה לי", "היה לו", "עשה", "עשתה"], explanation: "\"did\" במשפט זה אומרת \"עשה\"", category: "vocabulary", type: "sentence-recording", englishWord: "did", hebrewWord: "עשה" },
    { id: 1452, text: "הקליט את עצמך אומר את המשפט: \"I got a present\" ואז בחר מה הפירוש של המילה \"got\" במשפט:", sentence: "I got a present", sentenceTranslation: "קיבלתי מתנה", correct: 0, options: ["קיבל", "נתן", "קנה", "מכר"], explanation: "\"got\" במשפט זה אומרת \"קיבל\"", category: "vocabulary", type: "sentence-recording", englishWord: "got", hebrewWord: "קיבל" },
    { id: 1453, text: "הקליט את עצמך אומר את המשפט: \"I gave a gift\" ואז בחר מה הפירוש של המילה \"gave\" במשפט:", sentence: "I gave a gift", sentenceTranslation: "נתתי מתנה", correct: 1, options: ["קיבל", "נתן", "קנה", "מכר"], explanation: "\"gave\" במשפט זה אומרת \"נתן\"", category: "vocabulary", type: "sentence-recording", englishWord: "gave", hebrewWord: "נתן" },
    { id: 1454, text: "הקליט את עצמך אומר את המשפט: \"I bought a book\" ואז בחר מה הפירוש של המילה \"bought\" במשפט:", sentence: "I bought a book", sentenceTranslation: "קניתי ספר", correct: 2, options: ["קיבל", "נתן", "קנה", "מכר"], explanation: "\"bought\" במשפט זה אומרת \"קנה\"", category: "vocabulary", type: "sentence-recording", englishWord: "bought", hebrewWord: "קנה" },
    { id: 1455, text: "הקליט את עצמך אומר את המשפט: \"I sold my bike\" ואז בחר מה הפירוש של המילה \"sold\" במשפט:", sentence: "I sold my bike", sentenceTranslation: "מכרתי את האופניים שלי", correct: 3, options: ["קיבל", "נתן", "קנה", "מכר"], explanation: "\"sold\" במשפט זה אומרת \"מכר\"", category: "vocabulary", type: "sentence-recording", englishWord: "sold", hebrewWord: "מכר" },
    { id: 1456, text: "הקליט את עצמך אומר את המשפט: \"I took a photo\" ואז בחר מה הפירוש של המילה \"took\" במשפט:", sentence: "I took a photo", sentenceTranslation: "צילמתי תמונה", correct: 0, options: ["לקח", "הביא", "השאיר", "החזיר"], explanation: "\"took\" במשפט זה אומרת \"לקח\"", category: "vocabulary", type: "sentence-recording", englishWord: "took", hebrewWord: "לקח" },
    { id: 1457, text: "הקליט את עצמך אומר את המשפט: \"I brought food\" ואז בחר מה הפירוש של המילה \"brought\" במשפט:", sentence: "I brought food", sentenceTranslation: "הבאתי אוכל", correct: 1, options: ["לקח", "הביא", "השאיר", "החזיר"], explanation: "\"brought\" במשפט זה אומרת \"הביא\"", category: "vocabulary", type: "sentence-recording", englishWord: "brought", hebrewWord: "הביא" },
    { id: 1458, text: "הקליט את עצמך אומר את המשפט: \"I left my bag\" ואז בחר מה הפירוש של המילה \"left\" במשפט:", sentence: "I left my bag", sentenceTranslation: "השארתי את התיק שלי", correct: 2, options: ["לקח", "הביא", "השאיר", "החזיר"], explanation: "\"left\" במשפט זה אומרת \"השאיר\"", category: "vocabulary", type: "sentence-recording", englishWord: "left", hebrewWord: "השאיר" },
    { id: 1459, text: "הקליט את עצמך אומר את המשפט: \"I returned the book\" ואז בחר מה הפירוש של המילה \"returned\" במשפט:", sentence: "I returned the book", sentenceTranslation: "החזרתי את הספר", correct: 3, options: ["לקח", "הביא", "השאיר", "החזיר"], explanation: "\"returned\" במשפט זה אומרת \"החזיר\"", category: "vocabulary", type: "sentence-recording", englishWord: "returned", hebrewWord: "החזיר" }
    ],
    '3': [ // רמה 3 - בינוני - מבנה משפטים
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1460, text: "מה אומרת המילה \"subject\"?", options: ["נושא", "נשוא", "מושא", "תיאור"], correct: 0, explanation: "\"subject\" אומרת \"נושא\"", category: "vocabulary", type: "multiple-choice", englishWord: "subject", hebrewWord: "נושא" },
    { id: 1461, text: "מה אומרת המילה \"verb\"?", options: ["נושא", "נשוא", "מושא", "תיאור"], correct: 1, explanation: "\"verb\" אומרת \"נשוא\"", category: "vocabulary", type: "multiple-choice", englishWord: "verb", hebrewWord: "נשוא" },
    { id: 1462, text: "מה אומרת המילה \"object\"?", options: ["נושא", "נשוא", "מושא", "תיאור"], correct: 2, explanation: "\"object\" אומרת \"מושא\"", category: "vocabulary", type: "multiple-choice", englishWord: "object", hebrewWord: "מושא" },
    { id: 1463, text: "מה אומרת המילה \"adjective\"?", options: ["נושא", "נשוא", "מושא", "תיאור"], correct: 3, explanation: "\"adjective\" אומרת \"תיאור\"", category: "vocabulary", type: "multiple-choice", englishWord: "adjective", hebrewWord: "תיאור" },
    { id: 1464, text: "מה אומרת המילה \"sentence\"?", options: ["משפט", "מילה", "פסקה", "טקסט"], correct: 0, explanation: "\"sentence\" אומרת \"משפט\"", category: "vocabulary", type: "multiple-choice", englishWord: "sentence", hebrewWord: "משפט" },
    { id: 1465, text: "מה אומרת המילה \"word\"?", options: ["משפט", "מילה", "פסקה", "טקסט"], correct: 1, explanation: "\"word\" אומרת \"מילה\"", category: "vocabulary", type: "multiple-choice", englishWord: "word", hebrewWord: "מילה" },
    { id: 1466, text: "מה אומרת המילה \"question\"?", options: ["שאלה", "תשובה", "הסבר", "דוגמה"], correct: 0, explanation: "\"question\" אומרת \"שאלה\"", category: "vocabulary", type: "multiple-choice", englishWord: "question", hebrewWord: "שאלה" },
    { id: 1467, text: "מה אומרת המילה \"answer\"?", options: ["שאלה", "תשובה", "הסבר", "דוגמה"], correct: 1, explanation: "\"answer\" אומרת \"תשובה\"", category: "vocabulary", type: "multiple-choice", englishWord: "answer", hebrewWord: "תשובה" },
    { id: 1468, text: "מה אומרת המילה \"example\"?", options: ["שאלה", "תשובה", "הסבר", "דוגמה"], correct: 3, explanation: "\"example\" אומרת \"דוגמה\"", category: "vocabulary", type: "multiple-choice", englishWord: "example", hebrewWord: "דוגמה" },
    { id: 1469, text: "מה אומרת המילה \"meaning\"?", options: ["משמעות", "הגדרה", "תרגום", "פירוש"], correct: 0, explanation: "\"meaning\" אומרת \"משמעות\"", category: "vocabulary", type: "multiple-choice", englishWord: "meaning", hebrewWord: "משמעות" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1470, text: "הכתיב את המילה \"נושא\" באנגלית:", correct: "subject", explanation: "\"נושא\" באנגלית זה \"subject\"", category: "vocabulary", type: "dictation", englishWord: "subject", hebrewWord: "נושא" },
    { id: 1471, text: "הכתיב את המילה \"נשוא\" באנגלית:", correct: "verb", explanation: "\"נשוא\" באנגלית זה \"verb\"", category: "vocabulary", type: "dictation", englishWord: "verb", hebrewWord: "נשוא" },
    { id: 1472, text: "הכתיב את המילה \"מושא\" באנגלית:", correct: "object", explanation: "\"מושא\" באנגלית זה \"object\"", category: "vocabulary", type: "dictation", englishWord: "object", hebrewWord: "מושא" },
    { id: 1473, text: "הכתיב את המילה \"תיאור\" באנגלית:", correct: "adjective", explanation: "\"תיאור\" באנגלית זה \"adjective\"", category: "vocabulary", type: "dictation", englishWord: "adjective", hebrewWord: "תיאור" },
    { id: 1474, text: "הכתיב את המילה \"משפט\" באנגלית:", correct: "sentence", explanation: "\"משפט\" באנגלית זה \"sentence\"", category: "vocabulary", type: "dictation", englishWord: "sentence", hebrewWord: "משפט" },
    { id: 1475, text: "הכתיב את המילה \"מילה\" באנגלית:", correct: "word", explanation: "\"מילה\" באנגלית זה \"word\"", category: "vocabulary", type: "dictation", englishWord: "word", hebrewWord: "מילה" },
    { id: 1476, text: "הכתיב את המילה \"שאלה\" באנגלית:", correct: "question", explanation: "\"שאלה\" באנגלית זה \"question\"", category: "vocabulary", type: "dictation", englishWord: "question", hebrewWord: "שאלה" },
    { id: 1477, text: "הכתיב את המילה \"תשובה\" באנגלית:", correct: "answer", explanation: "\"תשובה\" באנגלית זה \"answer\"", category: "vocabulary", type: "dictation", englishWord: "answer", hebrewWord: "תשובה" },
    { id: 1478, text: "הכתיב את המילה \"דוגמה\" באנגלית:", correct: "example", explanation: "\"דוגמה\" באנגלית זה \"example\"", category: "vocabulary", type: "dictation", englishWord: "example", hebrewWord: "דוגמה" },
    { id: 1479, text: "הכתיב את המילה \"משמעות\" באנגלית:", correct: "meaning", explanation: "\"משמעות\" באנגלית זה \"meaning\"", category: "vocabulary", type: "dictation", englishWord: "meaning", hebrewWord: "משמעות" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1480, text: "הקליט את עצמך אומר את המילה \"נושא\" באנגלית:", correct: "subject", explanation: "\"נושא\" באנגלית זה \"subject\"", category: "vocabulary", type: "recording", englishWord: "subject", hebrewWord: "נושא" },
    { id: 1481, text: "הקליט את עצמך אומר את המילה \"נשוא\" באנגלית:", correct: "verb", explanation: "\"נשוא\" באנגלית זה \"verb\"", category: "vocabulary", type: "recording", englishWord: "verb", hebrewWord: "נשוא" },
    { id: 1482, text: "הקליט את עצמך אומר את המילה \"מושא\" באנגלית:", correct: "object", explanation: "\"מושא\" באנגלית זה \"object\"", category: "vocabulary", type: "recording", englishWord: "object", hebrewWord: "מושא" },
    { id: 1483, text: "הקליט את עצמך אומר את המילה \"תיאור\" באנגלית:", correct: "adjective", explanation: "\"תיאור\" באנגלית זה \"adjective\"", category: "vocabulary", type: "recording", englishWord: "adjective", hebrewWord: "תיאור" },
    { id: 1484, text: "הקליט את עצמך אומר את המילה \"משפט\" באנגלית:", correct: "sentence", explanation: "\"משפט\" באנגלית זה \"sentence\"", category: "vocabulary", type: "recording", englishWord: "sentence", hebrewWord: "משפט" },
    { id: 1485, text: "הקליט את עצמך אומר את המילה \"מילה\" באנגלית:", correct: "word", explanation: "\"מילה\" באנגלית זה \"word\"", category: "vocabulary", type: "recording", englishWord: "word", hebrewWord: "מילה" },
    { id: 1486, text: "הקליט את עצמך אומר את המילה \"שאלה\" באנגלית:", correct: "question", explanation: "\"שאלה\" באנגלית זה \"question\"", category: "vocabulary", type: "recording", englishWord: "question", hebrewWord: "שאלה" },
    { id: 1487, text: "הקליט את עצמך אומר את המילה \"תשובה\" באנגלית:", correct: "answer", explanation: "\"תשובה\" באנגלית זה \"answer\"", category: "vocabulary", type: "recording", englishWord: "answer", hebrewWord: "תשובה" },
    { id: 1488, text: "הקליט את עצמך אומר את המילה \"דוגמה\" באנגלית:", correct: "example", explanation: "\"דוגמה\" באנגלית זה \"example\"", category: "vocabulary", type: "recording", englishWord: "example", hebrewWord: "דוגמה" },
    { id: 1489, text: "הקליט את עצמך אומר את המילה \"משמעות\" באנגלית:", correct: "meaning", explanation: "\"משמעות\" באנגלית זה \"meaning\"", category: "vocabulary", type: "recording", englishWord: "meaning", hebrewWord: "משמעות" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1490, text: "הקליט את עצמך אומר את המשפט: \"The subject is important\" ואז בחר מה הפירוש של המילה \"subject\" במשפט:", sentence: "The subject is important", sentenceTranslation: "הנושא חשוב", correct: 0, options: ["נושא", "נשוא", "מושא", "תיאור"], explanation: "\"subject\" במשפט זה אומרת \"נושא\"", category: "vocabulary", type: "sentence-recording", englishWord: "subject", hebrewWord: "נושא" },
    { id: 1491, text: "הקליט את עצמך אומר את המשפט: \"The verb shows action\" ואז בחר מה הפירוש של המילה \"verb\" במשפט:", sentence: "The verb shows action", sentenceTranslation: "הנשוא מראה פעולה", correct: 1, options: ["נושא", "נשוא", "מושא", "תיאור"], explanation: "\"verb\" במשפט זה אומרת \"נשוא\"", category: "vocabulary", type: "sentence-recording", englishWord: "verb", hebrewWord: "נשוא" },
    { id: 1492, text: "הקליט את עצמך אומר את המשפט: \"The object receives action\" ואז בחר מה הפירוש של המילה \"object\" במשפט:", sentence: "The object receives action", sentenceTranslation: "המושא מקבל פעולה", correct: 2, options: ["נושא", "נשוא", "מושא", "תיאור"], explanation: "\"object\" במשפט זה אומרת \"מושא\"", category: "vocabulary", type: "sentence-recording", englishWord: "object", hebrewWord: "מושא" },
    { id: 1493, text: "הקליט את עצמך אומר את המשפט: \"The adjective describes\" ואז בחר מה הפירוש של המילה \"adjective\" במשפט:", sentence: "The adjective describes", sentenceTranslation: "התיאור מתאר", correct: 3, options: ["נושא", "נשוא", "מושא", "תיאור"], explanation: "\"adjective\" במשפט זה אומרת \"תיאור\"", category: "vocabulary", type: "sentence-recording", englishWord: "adjective", hebrewWord: "תיאור" },
    { id: 1494, text: "הקליט את עצמך אומר את המשפט: \"I write a sentence\" ואז בחר מה הפירוש של המילה \"sentence\" במשפט:", sentence: "I write a sentence", sentenceTranslation: "אני כותב משפט", correct: 0, options: ["משפט", "מילה", "פסקה", "טקסט"], explanation: "\"sentence\" במשפט זה אומרת \"משפט\"", category: "vocabulary", type: "sentence-recording", englishWord: "sentence", hebrewWord: "משפט" },
    { id: 1495, text: "הקליט את עצמך אומר את המשפט: \"I learn a word\" ואז בחר מה הפירוש של המילה \"word\" במשפט:", sentence: "I learn a word", sentenceTranslation: "אני לומד מילה", correct: 1, options: ["משפט", "מילה", "פסקה", "טקסט"], explanation: "\"word\" במשפט זה אומרת \"מילה\"", category: "vocabulary", type: "sentence-recording", englishWord: "word", hebrewWord: "מילה" },
    { id: 1496, text: "הקליט את עצמך אומר את המשפט: \"I ask a question\" ואז בחר מה הפירוש של המילה \"question\" במשפט:", sentence: "I ask a question", sentenceTranslation: "אני שואל שאלה", correct: 0, options: ["שאלה", "תשובה", "הסבר", "דוגמה"], explanation: "\"question\" במשפט זה אומרת \"שאלה\"", category: "vocabulary", type: "sentence-recording", englishWord: "question", hebrewWord: "שאלה" },
    { id: 1497, text: "הקליט את עצמך אומר את המשפט: \"I give an answer\" ואז בחר מה הפירוש של המילה \"answer\" במשפט:", sentence: "I give an answer", sentenceTranslation: "אני נותן תשובה", correct: 1, options: ["שאלה", "תשובה", "הסבר", "דוגמה"], explanation: "\"answer\" במשפט זה אומרת \"תשובה\"", category: "vocabulary", type: "sentence-recording", englishWord: "answer", hebrewWord: "תשובה" },
    { id: 1498, text: "הקליט את עצמך אומר את המשפט: \"I show an example\" ואז בחר מה הפירוש של המילה \"example\" במשפט:", sentence: "I show an example", sentenceTranslation: "אני מראה דוגמה", correct: 3, options: ["שאלה", "תשובה", "הסבר", "דוגמה"], explanation: "\"example\" במשפט זה אומרת \"דוגמה\"", category: "vocabulary", type: "sentence-recording", englishWord: "example", hebrewWord: "דוגמה" },
    { id: 1499, text: "הקליט את עצמך אומר את המשפט: \"I understand the meaning\" ואז בחר מה הפירוש של המילה \"meaning\" במשפט:", sentence: "I understand the meaning", sentenceTranslation: "אני מבין את המשמעות", correct: 0, options: ["משמעות", "הגדרה", "תרגום", "פירוש"], explanation: "\"meaning\" במשפט זה אומרת \"משמעות\"", category: "vocabulary", type: "sentence-recording", englishWord: "meaning", hebrewWord: "משמעות" }
    ],
    '4': [ // רמה 4 - מתקדם - ביטויים
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1500, text: "מה אומרת המילה \"hello\"?", options: ["שלום", "להתראות", "תודה", "סליחה"], correct: 0, explanation: "\"hello\" אומרת \"שלום\"", category: "vocabulary", type: "multiple-choice", englishWord: "hello", hebrewWord: "שלום" },
    { id: 1501, text: "מה אומרת המילה \"goodbye\"?", options: ["שלום", "להתראות", "תודה", "סליחה"], correct: 1, explanation: "\"goodbye\" אומרת \"להתראות\"", category: "vocabulary", type: "multiple-choice", englishWord: "goodbye", hebrewWord: "להתראות" },
    { id: 1502, text: "מה אומרת המילה \"please\"?", options: ["שלום", "להתראות", "תודה", "בבקשה"], correct: 3, explanation: "\"please\" אומרת \"בבקשה\"", category: "vocabulary", type: "multiple-choice", englishWord: "please", hebrewWord: "בבקשה" },
    { id: 1503, text: "מה אומרת המילה \"thank you\"?", options: ["שלום", "להתראות", "תודה", "סליחה"], correct: 2, explanation: "\"thank you\" אומרת \"תודה\"", category: "vocabulary", type: "multiple-choice", englishWord: "thank you", hebrewWord: "תודה" },
    { id: 1504, text: "מה אומרת המילה \"sorry\"?", options: ["שלום", "להתראות", "תודה", "סליחה"], correct: 3, explanation: "\"sorry\" אומרת \"סליחה\"", category: "vocabulary", type: "multiple-choice", englishWord: "sorry", hebrewWord: "סליחה" },
    { id: 1505, text: "מה אומרת המילה \"yes\"?", options: ["כן", "לא", "אולי", "תמיד"], correct: 0, explanation: "\"yes\" אומרת \"כן\"", category: "vocabulary", type: "multiple-choice", englishWord: "yes", hebrewWord: "כן" },
    { id: 1506, text: "מה אומרת המילה \"no\"?", options: ["כן", "לא", "אולי", "תמיד"], correct: 1, explanation: "\"no\" אומרת \"לא\"", category: "vocabulary", type: "multiple-choice", englishWord: "no", hebrewWord: "לא" },
    { id: 1507, text: "מה אומרת המילה \"maybe\"?", options: ["כן", "לא", "אולי", "תמיד"], correct: 2, explanation: "\"maybe\" אומרת \"אולי\"", category: "vocabulary", type: "multiple-choice", englishWord: "maybe", hebrewWord: "אולי" },
    { id: 1508, text: "מה אומרת המילה \"always\"?", options: ["כן", "לא", "אולי", "תמיד"], correct: 3, explanation: "\"always\" אומרת \"תמיד\"", category: "vocabulary", type: "multiple-choice", englishWord: "always", hebrewWord: "תמיד" },
    { id: 1509, text: "מה אומרת המילה \"never\"?", options: ["תמיד", "אף פעם", "לפעמים", "לעתים קרובות"], correct: 1, explanation: "\"never\" אומרת \"אף פעם\"", category: "vocabulary", type: "multiple-choice", englishWord: "never", hebrewWord: "אף פעם" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1510, text: "הכתיב את המילה \"שלום\" באנגלית:", correct: "hello", explanation: "\"שלום\" באנגלית זה \"hello\"", category: "vocabulary", type: "dictation", englishWord: "hello", hebrewWord: "שלום" },
    { id: 1511, text: "הכתיב את המילה \"להתראות\" באנגלית:", correct: "goodbye", explanation: "\"להתראות\" באנגלית זה \"goodbye\"", category: "vocabulary", type: "dictation", englishWord: "goodbye", hebrewWord: "להתראות" },
    { id: 1512, text: "הכתיב את המילה \"בבקשה\" באנגלית:", correct: "please", explanation: "\"בבקשה\" באנגלית זה \"please\"", category: "vocabulary", type: "dictation", englishWord: "please", hebrewWord: "בבקשה" },
    { id: 1513, text: "הכתיב את המילה \"תודה\" באנגלית:", correct: "thank you", explanation: "\"תודה\" באנגלית זה \"thank you\"", category: "vocabulary", type: "dictation", englishWord: "thank you", hebrewWord: "תודה" },
    { id: 1514, text: "הכתיב את המילה \"סליחה\" באנגלית:", correct: "sorry", explanation: "\"סליחה\" באנגלית זה \"sorry\"", category: "vocabulary", type: "dictation", englishWord: "sorry", hebrewWord: "סליחה" },
    { id: 1515, text: "הכתיב את המילה \"כן\" באנגלית:", correct: "yes", explanation: "\"כן\" באנגלית זה \"yes\"", category: "vocabulary", type: "dictation", englishWord: "yes", hebrewWord: "כן" },
    { id: 1516, text: "הכתיב את המילה \"לא\" באנגלית:", correct: "no", explanation: "\"לא\" באנגלית זה \"no\"", category: "vocabulary", type: "dictation", englishWord: "no", hebrewWord: "לא" },
    { id: 1517, text: "הכתיב את המילה \"אולי\" באנגלית:", correct: "maybe", explanation: "\"אולי\" באנגלית זה \"maybe\"", category: "vocabulary", type: "dictation", englishWord: "maybe", hebrewWord: "אולי" },
    { id: 1518, text: "הכתיב את המילה \"תמיד\" באנגלית:", correct: "always", explanation: "\"תמיד\" באנגלית זה \"always\"", category: "vocabulary", type: "dictation", englishWord: "always", hebrewWord: "תמיד" },
    { id: 1519, text: "הכתיב את המילה \"אף פעם\" באנגלית:", correct: "never", explanation: "\"אף פעם\" באנגלית זה \"never\"", category: "vocabulary", type: "dictation", englishWord: "never", hebrewWord: "אף פעם" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1520, text: "הקליט את עצמך אומר את המילה \"שלום\" באנגלית:", correct: "hello", explanation: "\"שלום\" באנגלית זה \"hello\"", category: "vocabulary", type: "recording", englishWord: "hello", hebrewWord: "שלום" },
    { id: 1521, text: "הקליט את עצמך אומר את המילה \"להתראות\" באנגלית:", correct: "goodbye", explanation: "\"להתראות\" באנגלית זה \"goodbye\"", category: "vocabulary", type: "recording", englishWord: "goodbye", hebrewWord: "להתראות" },
    { id: 1522, text: "הקליט את עצמך אומר את המילה \"בבקשה\" באנגלית:", correct: "please", explanation: "\"בבקשה\" באנגלית זה \"please\"", category: "vocabulary", type: "recording", englishWord: "please", hebrewWord: "בבקשה" },
    { id: 1523, text: "הקליט את עצמך אומר את המילה \"תודה\" באנגלית:", correct: "thank you", explanation: "\"תודה\" באנגלית זה \"thank you\"", category: "vocabulary", type: "recording", englishWord: "thank you", hebrewWord: "תודה" },
    { id: 1524, text: "הקליט את עצמך אומר את המילה \"סליחה\" באנגלית:", correct: "sorry", explanation: "\"סליחה\" באנגלית זה \"sorry\"", category: "vocabulary", type: "recording", englishWord: "sorry", hebrewWord: "סליחה" },
    { id: 1525, text: "הקליט את עצמך אומר את המילה \"כן\" באנגלית:", correct: "yes", explanation: "\"כן\" באנגלית זה \"yes\"", category: "vocabulary", type: "recording", englishWord: "yes", hebrewWord: "כן" },
    { id: 1526, text: "הקליט את עצמך אומר את המילה \"לא\" באנגלית:", correct: "no", explanation: "\"לא\" באנגלית זה \"no\"", category: "vocabulary", type: "recording", englishWord: "no", hebrewWord: "לא" },
    { id: 1527, text: "הקליט את עצמך אומר את המילה \"אולי\" באנגלית:", correct: "maybe", explanation: "\"אולי\" באנגלית זה \"maybe\"", category: "vocabulary", type: "recording", englishWord: "maybe", hebrewWord: "אולי" },
    { id: 1528, text: "הקליט את עצמך אומר את המילה \"תמיד\" באנגלית:", correct: "always", explanation: "\"תמיד\" באנגלית זה \"always\"", category: "vocabulary", type: "recording", englishWord: "always", hebrewWord: "תמיד" },
    { id: 1529, text: "הקליט את עצמך אומר את המילה \"אף פעם\" באנגלית:", correct: "never", explanation: "\"אף פעם\" באנגלית זה \"never\"", category: "vocabulary", type: "recording", englishWord: "never", hebrewWord: "אף פעם" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1530, text: "הקליט את עצמך אומר את המשפט: \"I say hello\" ואז בחר מה הפירוש של המילה \"hello\" במשפט:", sentence: "I say hello", sentenceTranslation: "אני אומר שלום", correct: 0, options: ["שלום", "להתראות", "תודה", "סליחה"], explanation: "\"hello\" במשפט זה אומרת \"שלום\"", category: "vocabulary", type: "sentence-recording", englishWord: "hello", hebrewWord: "שלום" },
    { id: 1531, text: "הקליט את עצמך אומר את המשפט: \"I say goodbye\" ואז בחר מה הפירוש של המילה \"goodbye\" במשפט:", sentence: "I say goodbye", sentenceTranslation: "אני אומר להתראות", correct: 1, options: ["שלום", "להתראות", "תודה", "סליחה"], explanation: "\"goodbye\" במשפט זה אומרת \"להתראות\"", category: "vocabulary", type: "sentence-recording", englishWord: "goodbye", hebrewWord: "להתראות" },
    { id: 1532, text: "הקליט את עצמך אומר את המשפט: \"Please help me\" ואז בחר מה הפירוש של המילה \"please\" במשפט:", sentence: "Please help me", sentenceTranslation: "בבקשה עזור לי", correct: 3, options: ["שלום", "להתראות", "תודה", "בבקשה"], explanation: "\"please\" במשפט זה אומרת \"בבקשה\"", category: "vocabulary", type: "sentence-recording", englishWord: "please", hebrewWord: "בבקשה" },
    { id: 1533, text: "הקליט את עצמך אומר את המשפט: \"Thank you very much\" ואז בחר מה הפירוש של המילה \"thank you\" במשפט:", sentence: "Thank you very much", sentenceTranslation: "תודה רבה", correct: 2, options: ["שלום", "להתראות", "תודה", "סליחה"], explanation: "\"thank you\" במשפט זה אומרת \"תודה\"", category: "vocabulary", type: "sentence-recording", englishWord: "thank you", hebrewWord: "תודה" },
    { id: 1534, text: "הקליט את עצמך אומר את המשפט: \"I am sorry\" ואז בחר מה הפירוש של המילה \"sorry\" במשפט:", sentence: "I am sorry", sentenceTranslation: "אני מצטער", correct: 3, options: ["שלום", "להתראות", "תודה", "סליחה"], explanation: "\"sorry\" במשפט זה אומרת \"סליחה\"", category: "vocabulary", type: "sentence-recording", englishWord: "sorry", hebrewWord: "סליחה" },
    { id: 1535, text: "הקליט את עצמך אומר את המשפט: \"I say yes\" ואז בחר מה הפירוש של המילה \"yes\" במשפט:", sentence: "I say yes", sentenceTranslation: "אני אומר כן", correct: 0, options: ["כן", "לא", "אולי", "תמיד"], explanation: "\"yes\" במשפט זה אומרת \"כן\"", category: "vocabulary", type: "sentence-recording", englishWord: "yes", hebrewWord: "כן" },
    { id: 1536, text: "הקליט את עצמך אומר את המשפט: \"I say no\" ואז בחר מה הפירוש של המילה \"no\" במשפט:", sentence: "I say no", sentenceTranslation: "אני אומר לא", correct: 1, options: ["כן", "לא", "אולי", "תמיד"], explanation: "\"no\" במשפט זה אומרת \"לא\"", category: "vocabulary", type: "sentence-recording", englishWord: "no", hebrewWord: "לא" },
    { id: 1537, text: "הקליט את עצמך אומר את המשפט: \"Maybe I will go\" ואז בחר מה הפירוש של המילה \"maybe\" במשפט:", sentence: "Maybe I will go", sentenceTranslation: "אולי אני אלך", correct: 2, options: ["כן", "לא", "אולי", "תמיד"], explanation: "\"maybe\" במשפט זה אומרת \"אולי\"", category: "vocabulary", type: "sentence-recording", englishWord: "maybe", hebrewWord: "אולי" },
    { id: 1538, text: "הקליט את עצמך אומר את המשפט: \"I always study\" ואז בחר מה הפירוש של המילה \"always\" במשפט:", sentence: "I always study", sentenceTranslation: "אני תמיד לומד", correct: 3, options: ["כן", "לא", "אולי", "תמיד"], explanation: "\"always\" במשפט זה אומרת \"תמיד\"", category: "vocabulary", type: "sentence-recording", englishWord: "always", hebrewWord: "תמיד" },
    { id: 1539, text: "הקליט את עצמך אומר את המשפט: \"I never lie\" ואז בחר מה הפירוש של המילה \"never\" במשפט:", sentence: "I never lie", sentenceTranslation: "אני אף פעם לא משקר", correct: 1, options: ["תמיד", "אף פעם", "לפעמים", "לעתים קרובות"], explanation: "\"never\" במשפט זה אומרת \"אף פעם\"", category: "vocabulary", type: "sentence-recording", englishWord: "never", hebrewWord: "אף פעם" }
    ],
    '5': [ // רמה 5 - מומחה - ביטויים מתקדמים
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1540, text: "מה אומרת המילה \"sometimes\"?", options: ["תמיד", "אף פעם", "לפעמים", "לעתים קרובות"], correct: 2, explanation: "\"sometimes\" אומרת \"לפעמים\"", category: "vocabulary", type: "multiple-choice", englishWord: "sometimes", hebrewWord: "לפעמים" },
    { id: 1541, text: "מה אומרת המילה \"often\"?", options: ["תמיד", "אף פעם", "לפעמים", "לעתים קרובות"], correct: 3, explanation: "\"often\" אומרת \"לעתים קרובות\"", category: "vocabulary", type: "multiple-choice", englishWord: "often", hebrewWord: "לעתים קרובות" },
    { id: 1542, text: "מה אומרת המילה \"usually\"?", options: ["בדרך כלל", "לפעמים", "לעתים קרובות", "תמיד"], correct: 0, explanation: "\"usually\" אומרת \"בדרך כלל\"", category: "vocabulary", type: "multiple-choice", englishWord: "usually", hebrewWord: "בדרך כלל" },
    { id: 1543, text: "מה אומרת המילה \"already\"?", options: ["כבר", "עדיין", "עכשיו", "אחר כך"], correct: 0, explanation: "\"already\" אומרת \"כבר\"", category: "vocabulary", type: "multiple-choice", englishWord: "already", hebrewWord: "כבר" },
    { id: 1544, text: "מה אומרת המילה \"still\"?", options: ["כבר", "עדיין", "עכשיו", "אחר כך"], correct: 1, explanation: "\"still\" אומרת \"עדיין\"", category: "vocabulary", type: "multiple-choice", englishWord: "still", hebrewWord: "עדיין" },
    { id: 1545, text: "מה אומרת המילה \"again\"?", options: ["כבר", "עדיין", "עכשיו", "שוב"], correct: 3, explanation: "\"again\" אומרת \"שוב\"", category: "vocabulary", type: "multiple-choice", englishWord: "again", hebrewWord: "שוב" },
    { id: 1546, text: "מה אומרת המילה \"also\"?", options: ["גם", "רק", "רק לא", "אפילו"], correct: 0, explanation: "\"also\" אומרת \"גם\"", category: "vocabulary", type: "multiple-choice", englishWord: "also", hebrewWord: "גם" },
    { id: 1547, text: "מה אומרת המילה \"only\"?", options: ["גם", "רק", "רק לא", "אפילו"], correct: 1, explanation: "\"only\" אומרת \"רק\"", category: "vocabulary", type: "multiple-choice", englishWord: "only", hebrewWord: "רק" },
    { id: 1548, text: "מה אומרת המילה \"even\"?", options: ["גם", "רק", "רק לא", "אפילו"], correct: 3, explanation: "\"even\" אומרת \"אפילו\"", category: "vocabulary", type: "multiple-choice", englishWord: "even", hebrewWord: "אפילו" },
    { id: 1549, text: "מה אומרת המילה \"very\"?", options: ["מאוד", "קצת", "יותר מדי", "פחות מדי"], correct: 0, explanation: "\"very\" אומרת \"מאוד\"", category: "vocabulary", type: "multiple-choice", englishWord: "very", hebrewWord: "מאוד" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1550, text: "הכתיב את המילה \"לפעמים\" באנגלית:", correct: "sometimes", explanation: "\"לפעמים\" באנגלית זה \"sometimes\"", category: "vocabulary", type: "dictation", englishWord: "sometimes", hebrewWord: "לפעמים" },
    { id: 1551, text: "הכתיב את המילה \"לעתים קרובות\" באנגלית:", correct: "often", explanation: "\"לעתים קרובות\" באנגלית זה \"often\"", category: "vocabulary", type: "dictation", englishWord: "often", hebrewWord: "לעתים קרובות" },
    { id: 1552, text: "הכתיב את המילה \"בדרך כלל\" באנגלית:", correct: "usually", explanation: "\"בדרך כלל\" באנגלית זה \"usually\"", category: "vocabulary", type: "dictation", englishWord: "usually", hebrewWord: "בדרך כלל" },
    { id: 1553, text: "הכתיב את המילה \"כבר\" באנגלית:", correct: "already", explanation: "\"כבר\" באנגלית זה \"already\"", category: "vocabulary", type: "dictation", englishWord: "already", hebrewWord: "כבר" },
    { id: 1554, text: "הכתיב את המילה \"עדיין\" באנגלית:", correct: "still", explanation: "\"עדיין\" באנגלית זה \"still\"", category: "vocabulary", type: "dictation", englishWord: "still", hebrewWord: "עדיין" },
    { id: 1555, text: "הכתיב את המילה \"שוב\" באנגלית:", correct: "again", explanation: "\"שוב\" באנגלית זה \"again\"", category: "vocabulary", type: "dictation", englishWord: "again", hebrewWord: "שוב" },
    { id: 1556, text: "הכתיב את המילה \"גם\" באנגלית:", correct: "also", explanation: "\"גם\" באנגלית זה \"also\"", category: "vocabulary", type: "dictation", englishWord: "also", hebrewWord: "גם" },
    { id: 1557, text: "הכתיב את המילה \"רק\" באנגלית:", correct: "only", explanation: "\"רק\" באנגלית זה \"only\"", category: "vocabulary", type: "dictation", englishWord: "only", hebrewWord: "רק" },
    { id: 1558, text: "הכתיב את המילה \"אפילו\" באנגלית:", correct: "even", explanation: "\"אפילו\" באנגלית זה \"even\"", category: "vocabulary", type: "dictation", englishWord: "even", hebrewWord: "אפילו" },
    { id: 1559, text: "הכתיב את המילה \"מאוד\" באנגלית:", correct: "very", explanation: "\"מאוד\" באנגלית זה \"very\"", category: "vocabulary", type: "dictation", englishWord: "very", hebrewWord: "מאוד" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1560, text: "הקליט את עצמך אומר את המילה \"לפעמים\" באנגלית:", correct: "sometimes", explanation: "\"לפעמים\" באנגלית זה \"sometimes\"", category: "vocabulary", type: "recording", englishWord: "sometimes", hebrewWord: "לפעמים" },
    { id: 1561, text: "הקליט את עצמך אומר את המילה \"לעתים קרובות\" באנגלית:", correct: "often", explanation: "\"לעתים קרובות\" באנגלית זה \"often\"", category: "vocabulary", type: "recording", englishWord: "often", hebrewWord: "לעתים קרובות" },
    { id: 1562, text: "הקליט את עצמך אומר את המילה \"בדרך כלל\" באנגלית:", correct: "usually", explanation: "\"בדרך כלל\" באנגלית זה \"usually\"", category: "vocabulary", type: "recording", englishWord: "usually", hebrewWord: "בדרך כלל" },
    { id: 1563, text: "הקליט את עצמך אומר את המילה \"כבר\" באנגלית:", correct: "already", explanation: "\"כבר\" באנגלית זה \"already\"", category: "vocabulary", type: "recording", englishWord: "already", hebrewWord: "כבר" },
    { id: 1564, text: "הקליט את עצמך אומר את המילה \"עדיין\" באנגלית:", correct: "still", explanation: "\"עדיין\" באנגלית זה \"still\"", category: "vocabulary", type: "recording", englishWord: "still", hebrewWord: "עדיין" },
    { id: 1565, text: "הקליט את עצמך אומר את המילה \"שוב\" באנגלית:", correct: "again", explanation: "\"שוב\" באנגלית זה \"again\"", category: "vocabulary", type: "recording", englishWord: "again", hebrewWord: "שוב" },
    { id: 1566, text: "הקליט את עצמך אומר את המילה \"גם\" באנגלית:", correct: "also", explanation: "\"גם\" באנגלית זה \"also\"", category: "vocabulary", type: "recording", englishWord: "also", hebrewWord: "גם" },
    { id: 1567, text: "הקליט את עצמך אומר את המילה \"רק\" באנגלית:", correct: "only", explanation: "\"רק\" באנגלית זה \"only\"", category: "vocabulary", type: "recording", englishWord: "only", hebrewWord: "רק" },
    { id: 1568, text: "הקליט את עצמך אומר את המילה \"אפילו\" באנגלית:", correct: "even", explanation: "\"אפילו\" באנגלית זה \"even\"", category: "vocabulary", type: "recording", englishWord: "even", hebrewWord: "אפילו" },
    { id: 1569, text: "הקליט את עצמך אומר את המילה \"מאוד\" באנגלית:", correct: "very", explanation: "\"מאוד\" באנגלית זה \"very\"", category: "vocabulary", type: "recording", englishWord: "very", hebrewWord: "מאוד" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1570, text: "הקליט את עצמך אומר את המשפט: \"I sometimes play\" ואז בחר מה הפירוש של המילה \"sometimes\" במשפט:", sentence: "I sometimes play", sentenceTranslation: "אני לפעמים משחק", correct: 2, options: ["תמיד", "אף פעם", "לפעמים", "לעתים קרובות"], explanation: "\"sometimes\" במשפט זה אומרת \"לפעמים\"", category: "vocabulary", type: "sentence-recording", englishWord: "sometimes", hebrewWord: "לפעמים" },
    { id: 1571, text: "הקליט את עצמך אומר את המשפט: \"I often read\" ואז בחר מה הפירוש של המילה \"often\" במשפט:", sentence: "I often read", sentenceTranslation: "אני קורא לעתים קרובות", correct: 3, options: ["תמיד", "אף פעם", "לפעמים", "לעתים קרובות"], explanation: "\"often\" במשפט זה אומרת \"לעתים קרובות\"", category: "vocabulary", type: "sentence-recording", englishWord: "often", hebrewWord: "לעתים קרובות" },
    { id: 1572, text: "הקליט את עצמך אומר את המשפט: \"I usually eat breakfast\" ואז בחר מה הפירוש של המילה \"usually\" במשפט:", sentence: "I usually eat breakfast", sentenceTranslation: "אני בדרך כלל אוכל ארוחת בוקר", correct: 0, options: ["בדרך כלל", "לפעמים", "לעתים קרובות", "תמיד"], explanation: "\"usually\" במשפט זה אומרת \"בדרך כלל\"", category: "vocabulary", type: "sentence-recording", englishWord: "usually", hebrewWord: "בדרך כלל" },
    { id: 1573, text: "הקליט את עצמך אומר את המשפט: \"I already finished\" ואז בחר מה הפירוש של המילה \"already\" במשפט:", sentence: "I already finished", sentenceTranslation: "כבר סיימתי", correct: 0, options: ["כבר", "עדיין", "עכשיו", "אחר כך"], explanation: "\"already\" במשפט זה אומרת \"כבר\"", category: "vocabulary", type: "sentence-recording", englishWord: "already", hebrewWord: "כבר" },
    { id: 1574, text: "הקליט את עצמך אומר את המשפט: \"I am still waiting\" ואז בחר מה הפירוש של המילה \"still\" במשפט:", sentence: "I am still waiting", sentenceTranslation: "אני עדיין מחכה", correct: 1, options: ["כבר", "עדיין", "עכשיו", "אחר כך"], explanation: "\"still\" במשפט זה אומרת \"עדיין\"", category: "vocabulary", type: "sentence-recording", englishWord: "still", hebrewWord: "עדיין" },
    { id: 1575, text: "הקליט את עצמך אומר את המשפט: \"I try again\" ואז בחר מה הפירוש של המילה \"again\" במשפט:", sentence: "I try again", sentenceTranslation: "אני מנסה שוב", correct: 3, options: ["כבר", "עדיין", "עכשיו", "שוב"], explanation: "\"again\" במשפט זה אומרת \"שוב\"", category: "vocabulary", type: "sentence-recording", englishWord: "again", hebrewWord: "שוב" },
    { id: 1576, text: "הקליט את עצמך אומר את המשפט: \"I also like music\" ואז בחר מה הפירוש של המילה \"also\" במשפט:", sentence: "I also like music", sentenceTranslation: "אני גם אוהב מוזיקה", correct: 0, options: ["גם", "רק", "רק לא", "אפילו"], explanation: "\"also\" במשפט זה אומרת \"גם\"", category: "vocabulary", type: "sentence-recording", englishWord: "also", hebrewWord: "גם" },
    { id: 1577, text: "הקליט את עצמך אומר את המשפט: \"I only want one\" ואז בחר מה הפירוש של המילה \"only\" במשפט:", sentence: "I only want one", sentenceTranslation: "אני רוצה רק אחד", correct: 1, options: ["גם", "רק", "רק לא", "אפילו"], explanation: "\"only\" במשפט זה אומרת \"רק\"", category: "vocabulary", type: "sentence-recording", englishWord: "only", hebrewWord: "רק" },
    { id: 1578, text: "הקליט את עצמך אומר את המשפט: \"Even I can do it\" ואז בחר מה הפירוש של המילה \"even\" במשפט:", sentence: "Even I can do it", sentenceTranslation: "אפילו אני יכול לעשות את זה", correct: 3, options: ["גם", "רק", "רק לא", "אפילו"], explanation: "\"even\" במשפט זה אומרת \"אפילו\"", category: "vocabulary", type: "sentence-recording", englishWord: "even", hebrewWord: "אפילו" },
    { id: 1579, text: "הקליט את עצמך אומר את המשפט: \"I am very happy\" ואז בחר מה הפירוש של המילה \"very\" במשפט:", sentence: "I am very happy", sentenceTranslation: "אני מאוד שמח", correct: 0, options: ["מאוד", "קצת", "יותר מדי", "פחות מדי"], explanation: "\"very\" במשפט זה אומרת \"מאוד\"", category: "vocabulary", type: "sentence-recording", englishWord: "very", hebrewWord: "מאוד" }
    ]
  },
  '8': { // יחידה 8 - אנגלית מתקדמת
    '1': [ // רמה 1 - מתחילים - אוצר מילים מורכב בסיסי
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1580, text: "מה אומרת המילה \"beautiful\"?", options: ["יפה", "מכוער", "גדול", "קטן"], correct: 0, explanation: "\"beautiful\" אומרת \"יפה\"", category: "vocabulary", type: "multiple-choice", englishWord: "beautiful", hebrewWord: "יפה" },
    { id: 1581, text: "מה אומרת המילה \"important\"?", options: ["חשוב", "לא חשוב", "קל", "קשה"], correct: 0, explanation: "\"important\" אומרת \"חשוב\"", category: "vocabulary", type: "multiple-choice", englishWord: "important", hebrewWord: "חשוב" },
    { id: 1582, text: "מה אומרת המילה \"difficult\"?", options: ["חשוב", "לא חשוב", "קל", "קשה"], correct: 3, explanation: "\"difficult\" אומרת \"קשה\"", category: "vocabulary", type: "multiple-choice", englishWord: "difficult", hebrewWord: "קשה" },
    { id: 1583, text: "מה אומרת המילה \"interesting\"?", options: ["מעניין", "משעמם", "קל", "קשה"], correct: 0, explanation: "\"interesting\" אומרת \"מעניין\"", category: "vocabulary", type: "multiple-choice", englishWord: "interesting", hebrewWord: "מעניין" },
    { id: 1584, text: "מה אומרת המילה \"wonderful\"?", options: ["נפלא", "נורא", "טוב", "רע"], correct: 0, explanation: "\"wonderful\" אומרת \"נפלא\"", category: "vocabulary", type: "multiple-choice", englishWord: "wonderful", hebrewWord: "נפלא" },
    { id: 1585, text: "מה אומרת המילה \"different\"?", options: ["שונה", "זהה", "דומה", "אחר"], correct: 0, explanation: "\"different\" אומרת \"שונה\"", category: "vocabulary", type: "multiple-choice", englishWord: "different", hebrewWord: "שונה" },
    { id: 1586, text: "מה אומרת המילה \"special\"?", options: ["מיוחד", "רגיל", "נפוץ", "נדיר"], correct: 0, explanation: "\"special\" אומרת \"מיוחד\"", category: "vocabulary", type: "multiple-choice", englishWord: "special", hebrewWord: "מיוחד" },
    { id: 1587, text: "מה אומרת המילה \"necessary\"?", options: ["נחוץ", "לא נחוץ", "חשוב", "לא חשוב"], correct: 0, explanation: "\"necessary\" אומרת \"נחוץ\"", category: "vocabulary", type: "multiple-choice", englishWord: "necessary", hebrewWord: "נחוץ" },
    { id: 1588, text: "מה אומרת המילה \"possible\"?", options: ["אפשרי", "בלתי אפשרי", "קל", "קשה"], correct: 0, explanation: "\"possible\" אומרת \"אפשרי\"", category: "vocabulary", type: "multiple-choice", englishWord: "possible", hebrewWord: "אפשרי" },
    { id: 1589, text: "מה אומרת המילה \"impossible\"?", options: ["אפשרי", "בלתי אפשרי", "קל", "קשה"], correct: 1, explanation: "\"impossible\" אומרת \"בלתי אפשרי\"", category: "vocabulary", type: "multiple-choice", englishWord: "impossible", hebrewWord: "בלתי אפשרי" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1590, text: "הכתיב את המילה \"יפה\" באנגלית:", correct: "beautiful", explanation: "\"יפה\" באנגלית זה \"beautiful\"", category: "vocabulary", type: "dictation", englishWord: "beautiful", hebrewWord: "יפה" },
    { id: 1591, text: "הכתיב את המילה \"חשוב\" באנגלית:", correct: "important", explanation: "\"חשוב\" באנגלית זה \"important\"", category: "vocabulary", type: "dictation", englishWord: "important", hebrewWord: "חשוב" },
    { id: 1592, text: "הכתיב את המילה \"קשה\" באנגלית:", correct: "difficult", explanation: "\"קשה\" באנגלית זה \"difficult\"", category: "vocabulary", type: "dictation", englishWord: "difficult", hebrewWord: "קשה" },
    { id: 1593, text: "הכתיב את המילה \"מעניין\" באנגלית:", correct: "interesting", explanation: "\"מעניין\" באנגלית זה \"interesting\"", category: "vocabulary", type: "dictation", englishWord: "interesting", hebrewWord: "מעניין" },
    { id: 1594, text: "הכתיב את המילה \"נפלא\" באנגלית:", correct: "wonderful", explanation: "\"נפלא\" באנגלית זה \"wonderful\"", category: "vocabulary", type: "dictation", englishWord: "wonderful", hebrewWord: "נפלא" },
    { id: 1595, text: "הכתיב את המילה \"שונה\" באנגלית:", correct: "different", explanation: "\"שונה\" באנגלית זה \"different\"", category: "vocabulary", type: "dictation", englishWord: "different", hebrewWord: "שונה" },
    { id: 1596, text: "הכתיב את המילה \"מיוחד\" באנגלית:", correct: "special", explanation: "\"מיוחד\" באנגלית זה \"special\"", category: "vocabulary", type: "dictation", englishWord: "special", hebrewWord: "מיוחד" },
    { id: 1597, text: "הכתיב את המילה \"נחוץ\" באנגלית:", correct: "necessary", explanation: "\"נחוץ\" באנגלית זה \"necessary\"", category: "vocabulary", type: "dictation", englishWord: "necessary", hebrewWord: "נחוץ" },
    { id: 1598, text: "הכתיב את המילה \"אפשרי\" באנגלית:", correct: "possible", explanation: "\"אפשרי\" באנגלית זה \"possible\"", category: "vocabulary", type: "dictation", englishWord: "possible", hebrewWord: "אפשרי" },
    { id: 1599, text: "הכתיב את המילה \"בלתי אפשרי\" באנגלית:", correct: "impossible", explanation: "\"בלתי אפשרי\" באנגלית זה \"impossible\"", category: "vocabulary", type: "dictation", englishWord: "impossible", hebrewWord: "בלתי אפשרי" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1600, text: "הקליט את עצמך אומר את המילה \"יפה\" באנגלית:", correct: "beautiful", explanation: "\"יפה\" באנגלית זה \"beautiful\"", category: "vocabulary", type: "recording", englishWord: "beautiful", hebrewWord: "יפה" },
    { id: 1601, text: "הקליט את עצמך אומר את המילה \"חשוב\" באנגלית:", correct: "important", explanation: "\"חשוב\" באנגלית זה \"important\"", category: "vocabulary", type: "recording", englishWord: "important", hebrewWord: "חשוב" },
    { id: 1602, text: "הקליט את עצמך אומר את המילה \"קשה\" באנגלית:", correct: "difficult", explanation: "\"קשה\" באנגלית זה \"difficult\"", category: "vocabulary", type: "recording", englishWord: "difficult", hebrewWord: "קשה" },
    { id: 1603, text: "הקליט את עצמך אומר את המילה \"מעניין\" באנגלית:", correct: "interesting", explanation: "\"מעניין\" באנגלית זה \"interesting\"", category: "vocabulary", type: "recording", englishWord: "interesting", hebrewWord: "מעניין" },
    { id: 1604, text: "הקליט את עצמך אומר את המילה \"נפלא\" באנגלית:", correct: "wonderful", explanation: "\"נפלא\" באנגלית זה \"wonderful\"", category: "vocabulary", type: "recording", englishWord: "wonderful", hebrewWord: "נפלא" },
    { id: 1605, text: "הקליט את עצמך אומר את המילה \"שונה\" באנגלית:", correct: "different", explanation: "\"שונה\" באנגלית זה \"different\"", category: "vocabulary", type: "recording", englishWord: "different", hebrewWord: "שונה" },
    { id: 1606, text: "הקליט את עצמך אומר את המילה \"מיוחד\" באנגלית:", correct: "special", explanation: "\"מיוחד\" באנגלית זה \"special\"", category: "vocabulary", type: "recording", englishWord: "special", hebrewWord: "מיוחד" },
    { id: 1607, text: "הקליט את עצמך אומר את המילה \"נחוץ\" באנגלית:", correct: "necessary", explanation: "\"נחוץ\" באנגלית זה \"necessary\"", category: "vocabulary", type: "recording", englishWord: "necessary", hebrewWord: "נחוץ" },
    { id: 1608, text: "הקליט את עצמך אומר את המילה \"אפשרי\" באנגלית:", correct: "possible", explanation: "\"אפשרי\" באנגלית זה \"possible\"", category: "vocabulary", type: "recording", englishWord: "possible", hebrewWord: "אפשרי" },
    { id: 1609, text: "הקליט את עצמך אומר את המילה \"בלתי אפשרי\" באנגלית:", correct: "impossible", explanation: "\"בלתי אפשרי\" באנגלית זה \"impossible\"", category: "vocabulary", type: "recording", englishWord: "impossible", hebrewWord: "בלתי אפשרי" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1610, text: "הקליט את עצמך אומר את המשפט: \"She is beautiful\" ואז בחר מה הפירוש של המילה \"beautiful\" במשפט:", sentence: "She is beautiful", sentenceTranslation: "היא יפה", correct: 0, options: ["יפה", "מכוער", "גדול", "קטן"], explanation: "\"beautiful\" במשפט זה אומרת \"יפה\"", category: "vocabulary", type: "sentence-recording", englishWord: "beautiful", hebrewWord: "יפה" },
    { id: 1611, text: "הקליט את עצמך אומר את המשפט: \"This is important\" ואז בחר מה הפירוש של המילה \"important\" במשפט:", sentence: "This is important", sentenceTranslation: "זה חשוב", correct: 0, options: ["חשוב", "לא חשוב", "קל", "קשה"], explanation: "\"important\" במשפט זה אומרת \"חשוב\"", category: "vocabulary", type: "sentence-recording", englishWord: "important", hebrewWord: "חשוב" },
    { id: 1612, text: "הקליט את עצמך אומר את המשפט: \"This test is difficult\" ואז בחר מה הפירוש של המילה \"difficult\" במשפט:", sentence: "This test is difficult", sentenceTranslation: "המבחן הזה קשה", correct: 3, options: ["חשוב", "לא חשוב", "קל", "קשה"], explanation: "\"difficult\" במשפט זה אומרת \"קשה\"", category: "vocabulary", type: "sentence-recording", englishWord: "difficult", hebrewWord: "קשה" },
    { id: 1613, text: "הקליט את עצמך אומר את המשפט: \"This book is interesting\" ואז בחר מה הפירוש של המילה \"interesting\" במשפט:", sentence: "This book is interesting", sentenceTranslation: "הספר הזה מעניין", correct: 0, options: ["מעניין", "משעמם", "קל", "קשה"], explanation: "\"interesting\" במשפט זה אומרת \"מעניין\"", category: "vocabulary", type: "sentence-recording", englishWord: "interesting", hebrewWord: "מעניין" },
    { id: 1614, text: "הקליט את עצמך אומר את המשפט: \"It is a wonderful day\" ואז בחר מה הפירוש של המילה \"wonderful\" במשפט:", sentence: "It is a wonderful day", sentenceTranslation: "זה יום נפלא", correct: 0, options: ["נפלא", "נורא", "טוב", "רע"], explanation: "\"wonderful\" במשפט זה אומרת \"נפלא\"", category: "vocabulary", type: "sentence-recording", englishWord: "wonderful", hebrewWord: "נפלא" },
    { id: 1615, text: "הקליט את עצמך אומר את המשפט: \"We are different\" ואז בחר מה הפירוש של המילה \"different\" במשפט:", sentence: "We are different", sentenceTranslation: "אנחנו שונים", correct: 0, options: ["שונה", "זהה", "דומה", "אחר"], explanation: "\"different\" במשפט זה אומרת \"שונה\"", category: "vocabulary", type: "sentence-recording", englishWord: "different", hebrewWord: "שונה" },
    { id: 1616, text: "הקליט את עצמך אומר את המשפט: \"You are special\" ואז בחר מה הפירוש של המילה \"special\" במשפט:", sentence: "You are special", sentenceTranslation: "אתה מיוחד", correct: 0, options: ["מיוחד", "רגיל", "נפוץ", "נדיר"], explanation: "\"special\" במשפט זה אומרת \"מיוחד\"", category: "vocabulary", type: "sentence-recording", englishWord: "special", hebrewWord: "מיוחד" },
    { id: 1617, text: "הקליט את עצמך אומר את המשפט: \"It is necessary to study\" ואז בחר מה הפירוש של המילה \"necessary\" במשפט:", sentence: "It is necessary to study", sentenceTranslation: "זה נחוץ ללמוד", correct: 0, options: ["נחוץ", "לא נחוץ", "חשוב", "לא חשוב"], explanation: "\"necessary\" במשפט זה אומרת \"נחוץ\"", category: "vocabulary", type: "sentence-recording", englishWord: "necessary", hebrewWord: "נחוץ" },
    { id: 1618, text: "הקליט את עצמך אומר את המשפט: \"It is possible to learn\" ואז בחר מה הפירוש של המילה \"possible\" במשפט:", sentence: "It is possible to learn", sentenceTranslation: "זה אפשרי ללמוד", correct: 0, options: ["אפשרי", "בלתי אפשרי", "קל", "קשה"], explanation: "\"possible\" במשפט זה אומרת \"אפשרי\"", category: "vocabulary", type: "sentence-recording", englishWord: "possible", hebrewWord: "אפשרי" },
    { id: 1619, text: "הקליט את עצמך אומר את המשפט: \"It is impossible to fly\" ואז בחר מה הפירוש של המילה \"impossible\" במשפט:", sentence: "It is impossible to fly", sentenceTranslation: "זה בלתי אפשרי לעוף", correct: 1, options: ["אפשרי", "בלתי אפשרי", "קל", "קשה"], explanation: "\"impossible\" במשפט זה אומרת \"בלתי אפשרי\"", category: "vocabulary", type: "sentence-recording", englishWord: "impossible", hebrewWord: "בלתי אפשרי" }
    ],
    '2': [ // רמה 2 - בסיסי - אוצר מילים מורכב יותר
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1620, text: "מה אומרת המילה \"understand\"?", options: ["להבין", "לחשוב", "לדעת", "לזכור"], correct: 0, explanation: "\"understand\" אומרת \"להבין\"", category: "vocabulary", type: "multiple-choice", englishWord: "understand", hebrewWord: "להבין" },
    { id: 1621, text: "מה אומרת המילה \"remember\"?", options: ["להבין", "לחשוב", "לדעת", "לזכור"], correct: 3, explanation: "\"remember\" אומרת \"לזכור\"", category: "vocabulary", type: "multiple-choice", englishWord: "remember", hebrewWord: "לזכור" },
    { id: 1622, text: "מה אומרת המילה \"forget\"?", options: ["לזכור", "לשכוח", "לחשוב", "לדעת"], correct: 1, explanation: "\"forget\" אומרת \"לשכוח\"", category: "vocabulary", type: "multiple-choice", englishWord: "forget", hebrewWord: "לשכוח" },
    { id: 1623, text: "מה אומרת המילה \"believe\"?", options: ["להאמין", "לחשוב", "לדעת", "להבין"], correct: 0, explanation: "\"believe\" אומרת \"להאמין\"", category: "vocabulary", type: "multiple-choice", englishWord: "believe", hebrewWord: "להאמין" },
    { id: 1624, text: "מה אומרת המילה \"decide\"?", options: ["להחליט", "לבחור", "לעשות", "לנסות"], correct: 0, explanation: "\"decide\" אומרת \"להחליט\"", category: "vocabulary", type: "multiple-choice", englishWord: "decide", hebrewWord: "להחליט" },
    { id: 1625, text: "מה אומרת המילה \"choose\"?", options: ["להחליט", "לבחור", "לעשות", "לנסות"], correct: 1, explanation: "\"choose\" אומרת \"לבחור\"", category: "vocabulary", type: "multiple-choice", englishWord: "choose", hebrewWord: "לבחור" },
    { id: 1626, text: "מה אומרת המילה \"try\"?", options: ["להחליט", "לבחור", "לעשות", "לנסות"], correct: 3, explanation: "\"try\" אומרת \"לנסות\"", category: "vocabulary", type: "multiple-choice", englishWord: "try", hebrewWord: "לנסות" },
    { id: 1627, text: "מה אומרת המילה \"succeed\"?", options: ["להצליח", "להיכשל", "לנסות", "לעשות"], correct: 0, explanation: "\"succeed\" אומרת \"להצליח\"", category: "vocabulary", type: "multiple-choice", englishWord: "succeed", hebrewWord: "להצליח" },
    { id: 1628, text: "מה אומרת המילה \"fail\"?", options: ["להצליח", "להיכשל", "לנסות", "לעשות"], correct: 1, explanation: "\"fail\" אומרת \"להיכשל\"", category: "vocabulary", type: "multiple-choice", englishWord: "fail", hebrewWord: "להיכשל" },
    { id: 1629, text: "מה אומרת המילה \"improve\"?", options: ["לשפר", "להחמיר", "לשנות", "להשאיר"], correct: 0, explanation: "\"improve\" אומרת \"לשפר\"", category: "vocabulary", type: "multiple-choice", englishWord: "improve", hebrewWord: "לשפר" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1630, text: "הכתיב את המילה \"להבין\" באנגלית:", correct: "understand", explanation: "\"להבין\" באנגלית זה \"understand\"", category: "vocabulary", type: "dictation", englishWord: "understand", hebrewWord: "להבין" },
    { id: 1631, text: "הכתיב את המילה \"לזכור\" באנגלית:", correct: "remember", explanation: "\"לזכור\" באנגלית זה \"remember\"", category: "vocabulary", type: "dictation", englishWord: "remember", hebrewWord: "לזכור" },
    { id: 1632, text: "הכתיב את המילה \"לשכוח\" באנגלית:", correct: "forget", explanation: "\"לשכוח\" באנגלית זה \"forget\"", category: "vocabulary", type: "dictation", englishWord: "forget", hebrewWord: "לשכוח" },
    { id: 1633, text: "הכתיב את המילה \"להאמין\" באנגלית:", correct: "believe", explanation: "\"להאמין\" באנגלית זה \"believe\"", category: "vocabulary", type: "dictation", englishWord: "believe", hebrewWord: "להאמין" },
    { id: 1634, text: "הכתיב את המילה \"להחליט\" באנגלית:", correct: "decide", explanation: "\"להחליט\" באנגלית זה \"decide\"", category: "vocabulary", type: "dictation", englishWord: "decide", hebrewWord: "להחליט" },
    { id: 1635, text: "הכתיב את המילה \"לבחור\" באנגלית:", correct: "choose", explanation: "\"לבחור\" באנגלית זה \"choose\"", category: "vocabulary", type: "dictation", englishWord: "choose", hebrewWord: "לבחור" },
    { id: 1636, text: "הכתיב את המילה \"לנסות\" באנגלית:", correct: "try", explanation: "\"לנסות\" באנגלית זה \"try\"", category: "vocabulary", type: "dictation", englishWord: "try", hebrewWord: "לנסות" },
    { id: 1637, text: "הכתיב את המילה \"להצליח\" באנגלית:", correct: "succeed", explanation: "\"להצליח\" באנגלית זה \"succeed\"", category: "vocabulary", type: "dictation", englishWord: "succeed", hebrewWord: "להצליח" },
    { id: 1638, text: "הכתיב את המילה \"להיכשל\" באנגלית:", correct: "fail", explanation: "\"להיכשל\" באנגלית זה \"fail\"", category: "vocabulary", type: "dictation", englishWord: "fail", hebrewWord: "להיכשל" },
    { id: 1639, text: "הכתיב את המילה \"לשפר\" באנגלית:", correct: "improve", explanation: "\"לשפר\" באנגלית זה \"improve\"", category: "vocabulary", type: "dictation", englishWord: "improve", hebrewWord: "לשפר" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1640, text: "הקליט את עצמך אומר את המילה \"להבין\" באנגלית:", correct: "understand", explanation: "\"להבין\" באנגלית זה \"understand\"", category: "vocabulary", type: "recording", englishWord: "understand", hebrewWord: "להבין" },
    { id: 1641, text: "הקליט את עצמך אומר את המילה \"לזכור\" באנגלית:", correct: "remember", explanation: "\"לזכור\" באנגלית זה \"remember\"", category: "vocabulary", type: "recording", englishWord: "remember", hebrewWord: "לזכור" },
    { id: 1642, text: "הקליט את עצמך אומר את המילה \"לשכוח\" באנגלית:", correct: "forget", explanation: "\"לשכוח\" באנגלית זה \"forget\"", category: "vocabulary", type: "recording", englishWord: "forget", hebrewWord: "לשכוח" },
    { id: 1643, text: "הקליט את עצמך אומר את המילה \"להאמין\" באנגלית:", correct: "believe", explanation: "\"להאמין\" באנגלית זה \"believe\"", category: "vocabulary", type: "recording", englishWord: "believe", hebrewWord: "להאמין" },
    { id: 1644, text: "הקליט את עצמך אומר את המילה \"להחליט\" באנגלית:", correct: "decide", explanation: "\"להחליט\" באנגלית זה \"decide\"", category: "vocabulary", type: "recording", englishWord: "decide", hebrewWord: "להחליט" },
    { id: 1645, text: "הקליט את עצמך אומר את המילה \"לבחור\" באנגלית:", correct: "choose", explanation: "\"לבחור\" באנגלית זה \"choose\"", category: "vocabulary", type: "recording", englishWord: "choose", hebrewWord: "לבחור" },
    { id: 1646, text: "הקליט את עצמך אומר את המילה \"לנסות\" באנגלית:", correct: "try", explanation: "\"לנסות\" באנגלית זה \"try\"", category: "vocabulary", type: "recording", englishWord: "try", hebrewWord: "לנסות" },
    { id: 1647, text: "הקליט את עצמך אומר את המילה \"להצליח\" באנגלית:", correct: "succeed", explanation: "\"להצליח\" באנגלית זה \"succeed\"", category: "vocabulary", type: "recording", englishWord: "succeed", hebrewWord: "להצליח" },
    { id: 1648, text: "הקליט את עצמך אומר את המילה \"להיכשל\" באנגלית:", correct: "fail", explanation: "\"להיכשל\" באנגלית זה \"fail\"", category: "vocabulary", type: "recording", englishWord: "fail", hebrewWord: "להיכשל" },
    { id: 1649, text: "הקליט את עצמך אומר את המילה \"לשפר\" באנגלית:", correct: "improve", explanation: "\"לשפר\" באנגלית זה \"improve\"", category: "vocabulary", type: "recording", englishWord: "improve", hebrewWord: "לשפר" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1650, text: "הקליט את עצמך אומר את המשפט: \"I understand the lesson\" ואז בחר מה הפירוש של המילה \"understand\" במשפט:", sentence: "I understand the lesson", sentenceTranslation: "אני מבין את השיעור", correct: 0, options: ["להבין", "לחשוב", "לדעת", "לזכור"], explanation: "\"understand\" במשפט זה אומרת \"להבין\"", category: "vocabulary", type: "sentence-recording", englishWord: "understand", hebrewWord: "להבין" },
    { id: 1651, text: "הקליט את עצמך אומר את המשפט: \"I remember your name\" ואז בחר מה הפירוש של המילה \"remember\" במשפט:", sentence: "I remember your name", sentenceTranslation: "אני זוכר את השם שלך", correct: 3, options: ["להבין", "לחשוב", "לדעת", "לזכור"], explanation: "\"remember\" במשפט זה אומרת \"לזכור\"", category: "vocabulary", type: "sentence-recording", englishWord: "remember", hebrewWord: "לזכור" },
    { id: 1652, text: "הקליט את עצמך אומר את המשפט: \"I forget the answer\" ואז בחר מה הפירוש של המילה \"forget\" במשפט:", sentence: "I forget the answer", sentenceTranslation: "אני שוכח את התשובה", correct: 1, options: ["לזכור", "לשכוח", "לחשוב", "לדעת"], explanation: "\"forget\" במשפט זה אומרת \"לשכוח\"", category: "vocabulary", type: "sentence-recording", englishWord: "forget", hebrewWord: "לשכוח" },
    { id: 1653, text: "הקליט את עצמך אומר את המשפט: \"I believe in you\" ואז בחר מה הפירוש של המילה \"believe\" במשפט:", sentence: "I believe in you", sentenceTranslation: "אני מאמין בך", correct: 0, options: ["להאמין", "לחשוב", "לדעת", "להבין"], explanation: "\"believe\" במשפט זה אומרת \"להאמין\"", category: "vocabulary", type: "sentence-recording", englishWord: "believe", hebrewWord: "להאמין" },
    { id: 1654, text: "הקליט את עצמך אומר את המשפט: \"I decide to go\" ואז בחר מה הפירוש של המילה \"decide\" במשפט:", sentence: "I decide to go", sentenceTranslation: "אני מחליט ללכת", correct: 0, options: ["להחליט", "לבחור", "לעשות", "לנסות"], explanation: "\"decide\" במשפט זה אומרת \"להחליט\"", category: "vocabulary", type: "sentence-recording", englishWord: "decide", hebrewWord: "להחליט" },
    { id: 1655, text: "הקליט את עצמך אומר את המשפט: \"I choose this book\" ואז בחר מה הפירוש של המילה \"choose\" במשפט:", sentence: "I choose this book", sentenceTranslation: "אני בוחר את הספר הזה", correct: 1, options: ["להחליט", "לבחור", "לעשות", "לנסות"], explanation: "\"choose\" במשפט זה אומרת \"לבחור\"", category: "vocabulary", type: "sentence-recording", englishWord: "choose", hebrewWord: "לבחור" },
    { id: 1656, text: "הקליט את עצמך אומר את המשפט: \"I try my best\" ואז בחר מה הפירוש של המילה \"try\" במשפט:", sentence: "I try my best", sentenceTranslation: "אני מנסה את המיטב שלי", correct: 3, options: ["להחליט", "לבחור", "לעשות", "לנסות"], explanation: "\"try\" במשפט זה אומרת \"לנסות\"", category: "vocabulary", type: "sentence-recording", englishWord: "try", hebrewWord: "לנסות" },
    { id: 1657, text: "הקליט את עצמך אומר את המשפט: \"I succeed in the test\" ואז בחר מה הפירוש של המילה \"succeed\" במשפט:", sentence: "I succeed in the test", sentenceTranslation: "אני מצליח במבחן", correct: 0, options: ["להצליח", "להיכשל", "לנסות", "לעשות"], explanation: "\"succeed\" במשפט זה אומרת \"להצליח\"", category: "vocabulary", type: "sentence-recording", englishWord: "succeed", hebrewWord: "להצליח" },
    { id: 1658, text: "הקליט את עצמך אומר את המשפט: \"I fail the exam\" ואז בחר מה הפירוש של המילה \"fail\" במשפט:", sentence: "I fail the exam", sentenceTranslation: "אני נכשל בבחינה", correct: 1, options: ["להצליח", "להיכשל", "לנסות", "לעשות"], explanation: "\"fail\" במשפט זה אומרת \"להיכשל\"", category: "vocabulary", type: "sentence-recording", englishWord: "fail", hebrewWord: "להיכשל" },
    { id: 1659, text: "הקליט את עצמך אומר את המשפט: \"I improve my English\" ואז בחר מה הפירוש של המילה \"improve\" במשפט:", sentence: "I improve my English", sentenceTranslation: "אני משפר את האנגלית שלי", correct: 0, options: ["לשפר", "להחמיר", "לשנות", "להשאיר"], explanation: "\"improve\" במשפט זה אומרת \"לשפר\"", category: "vocabulary", type: "sentence-recording", englishWord: "improve", hebrewWord: "לשפר" }
    ],
    '3': [ // רמה 3 - בינוני - דקדוק מתקדם מאוד
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1660, text: "מה אומרת המילה \"should\"?", options: ["צריך", "יכול", "חייב", "רוצה"], correct: 0, explanation: "\"should\" אומרת \"צריך\"", category: "vocabulary", type: "multiple-choice", englishWord: "should", hebrewWord: "צריך" },
    { id: 1661, text: "מה אומרת המילה \"must\"?", options: ["צריך", "יכול", "חייב", "רוצה"], correct: 2, explanation: "\"must\" אומרת \"חייב\"", category: "vocabulary", type: "multiple-choice", englishWord: "must", hebrewWord: "חייב" },
    { id: 1662, text: "מה אומרת המילה \"might\"?", options: ["יכול", "אולי", "צריך", "חייב"], correct: 1, explanation: "\"might\" אומרת \"אולי\"", category: "vocabulary", type: "multiple-choice", englishWord: "might", hebrewWord: "אולי" },
    { id: 1663, text: "מה אומרת המילה \"would\"?", options: ["יהיה", "היה", "יכול", "צריך"], correct: 0, explanation: "\"would\" אומרת \"יהיה\"", category: "vocabulary", type: "multiple-choice", englishWord: "would", hebrewWord: "יהיה" },
    { id: 1664, text: "מה אומרת המילה \"could\"?", options: ["יכול", "לא יכול", "צריך", "חייב"], correct: 0, explanation: "\"could\" אומרת \"יכול\"", category: "vocabulary", type: "multiple-choice", englishWord: "could", hebrewWord: "יכול" },
    { id: 1665, text: "מה אומרת המילה \"shouldn't\"?", options: ["צריך", "לא צריך", "יכול", "לא יכול"], correct: 1, explanation: "\"shouldn't\" אומרת \"לא צריך\"", category: "vocabulary", type: "multiple-choice", englishWord: "shouldn't", hebrewWord: "לא צריך" },
    { id: 1666, text: "מה אומרת המילה \"mustn't\"?", options: ["חייב", "אסור", "יכול", "לא יכול"], correct: 1, explanation: "\"mustn't\" אומרת \"אסור\"", category: "vocabulary", type: "multiple-choice", englishWord: "mustn't", hebrewWord: "אסור" },
    { id: 1667, text: "מה אומרת המילה \"couldn't\"?", options: ["יכול", "לא יכול", "צריך", "לא צריך"], correct: 1, explanation: "\"couldn't\" אומרת \"לא יכול\"", category: "vocabulary", type: "multiple-choice", englishWord: "couldn't", hebrewWord: "לא יכול" },
    { id: 1668, text: "מה אומרת המילה \"wouldn't\"?", options: ["יהיה", "לא יהיה", "היה", "לא היה"], correct: 1, explanation: "\"wouldn't\" אומרת \"לא יהיה\"", category: "vocabulary", type: "multiple-choice", englishWord: "wouldn't", hebrewWord: "לא יהיה" },
    { id: 1669, text: "מה אומרת המילה \"mightn't\"?", options: ["אולי", "לא אולי", "יכול", "לא יכול"], correct: 1, explanation: "\"mightn't\" אומרת \"לא אולי\"", category: "vocabulary", type: "multiple-choice", englishWord: "mightn't", hebrewWord: "לא אולי" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1670, text: "הכתיב את המילה \"צריך\" באנגלית:", correct: "should", explanation: "\"צריך\" באנגלית זה \"should\"", category: "vocabulary", type: "dictation", englishWord: "should", hebrewWord: "צריך" },
    { id: 1671, text: "הכתיב את המילה \"חייב\" באנגלית:", correct: "must", explanation: "\"חייב\" באנגלית זה \"must\"", category: "vocabulary", type: "dictation", englishWord: "must", hebrewWord: "חייב" },
    { id: 1672, text: "הכתיב את המילה \"אולי\" באנגלית:", correct: "might", explanation: "\"אולי\" באנגלית זה \"might\"", category: "vocabulary", type: "dictation", englishWord: "might", hebrewWord: "אולי" },
    { id: 1673, text: "הכתיב את המילה \"יהיה\" באנגלית:", correct: "would", explanation: "\"יהיה\" באנגלית זה \"would\"", category: "vocabulary", type: "dictation", englishWord: "would", hebrewWord: "יהיה" },
    { id: 1674, text: "הכתיב את המילה \"יכול\" באנגלית:", correct: "could", explanation: "\"יכול\" באנגלית זה \"could\"", category: "vocabulary", type: "dictation", englishWord: "could", hebrewWord: "יכול" },
    { id: 1675, text: "הכתיב את המילה \"לא צריך\" באנגלית:", correct: "shouldn't", explanation: "\"לא צריך\" באנגלית זה \"shouldn't\"", category: "vocabulary", type: "dictation", englishWord: "shouldn't", hebrewWord: "לא צריך" },
    { id: 1676, text: "הכתיב את המילה \"אסור\" באנגלית:", correct: "mustn't", explanation: "\"אסור\" באנגלית זה \"mustn't\"", category: "vocabulary", type: "dictation", englishWord: "mustn't", hebrewWord: "אסור" },
    { id: 1677, text: "הכתיב את המילה \"לא יכול\" באנגלית:", correct: "couldn't", explanation: "\"לא יכול\" באנגלית זה \"couldn't\"", category: "vocabulary", type: "dictation", englishWord: "couldn't", hebrewWord: "לא יכול" },
    { id: 1678, text: "הכתיב את המילה \"לא יהיה\" באנגלית:", correct: "wouldn't", explanation: "\"לא יהיה\" באנגלית זה \"wouldn't\"", category: "vocabulary", type: "dictation", englishWord: "wouldn't", hebrewWord: "לא יהיה" },
    { id: 1679, text: "הכתיב את המילה \"לא אולי\" באנגלית:", correct: "mightn't", explanation: "\"לא אולי\" באנגלית זה \"mightn't\"", category: "vocabulary", type: "dictation", englishWord: "mightn't", hebrewWord: "לא אולי" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1680, text: "הקליט את עצמך אומר את המילה \"צריך\" באנגלית:", correct: "should", explanation: "\"צריך\" באנגלית זה \"should\"", category: "vocabulary", type: "recording", englishWord: "should", hebrewWord: "צריך" },
    { id: 1681, text: "הקליט את עצמך אומר את המילה \"חייב\" באנגלית:", correct: "must", explanation: "\"חייב\" באנגלית זה \"must\"", category: "vocabulary", type: "recording", englishWord: "must", hebrewWord: "חייב" },
    { id: 1682, text: "הקליט את עצמך אומר את המילה \"אולי\" באנגלית:", correct: "might", explanation: "\"אולי\" באנגלית זה \"might\"", category: "vocabulary", type: "recording", englishWord: "might", hebrewWord: "אולי" },
    { id: 1683, text: "הקליט את עצמך אומר את המילה \"יהיה\" באנגלית:", correct: "would", explanation: "\"יהיה\" באנגלית זה \"would\"", category: "vocabulary", type: "recording", englishWord: "would", hebrewWord: "יהיה" },
    { id: 1684, text: "הקליט את עצמך אומר את המילה \"יכול\" באנגלית:", correct: "could", explanation: "\"יכול\" באנגלית זה \"could\"", category: "vocabulary", type: "recording", englishWord: "could", hebrewWord: "יכול" },
    { id: 1685, text: "הקליט את עצמך אומר את המילה \"לא צריך\" באנגלית:", correct: "shouldn't", explanation: "\"לא צריך\" באנגלית זה \"shouldn't\"", category: "vocabulary", type: "recording", englishWord: "shouldn't", hebrewWord: "לא צריך" },
    { id: 1686, text: "הקליט את עצמך אומר את המילה \"אסור\" באנגלית:", correct: "mustn't", explanation: "\"אסור\" באנגלית זה \"mustn't\"", category: "vocabulary", type: "recording", englishWord: "mustn't", hebrewWord: "אסור" },
    { id: 1687, text: "הקליט את עצמך אומר את המילה \"לא יכול\" באנגלית:", correct: "couldn't", explanation: "\"לא יכול\" באנגלית זה \"couldn't\"", category: "vocabulary", type: "recording", englishWord: "couldn't", hebrewWord: "לא יכול" },
    { id: 1688, text: "הקליט את עצמך אומר את המילה \"לא יהיה\" באנגלית:", correct: "wouldn't", explanation: "\"לא יהיה\" באנגלית זה \"wouldn't\"", category: "vocabulary", type: "recording", englishWord: "wouldn't", hebrewWord: "לא יהיה" },
    { id: 1689, text: "הקליט את עצמך אומר את המילה \"לא אולי\" באנגלית:", correct: "mightn't", explanation: "\"לא אולי\" באנגלית זה \"mightn't\"", category: "vocabulary", type: "recording", englishWord: "mightn't", hebrewWord: "לא אולי" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1690, text: "הקליט את עצמך אומר את המשפט: \"I should study\" ואז בחר מה הפירוש של המילה \"should\" במשפט:", sentence: "I should study", sentenceTranslation: "אני צריך ללמוד", correct: 0, options: ["צריך", "יכול", "חייב", "רוצה"], explanation: "\"should\" במשפט זה אומרת \"צריך\"", category: "vocabulary", type: "sentence-recording", englishWord: "should", hebrewWord: "צריך" },
    { id: 1691, text: "הקליט את עצמך אומר את המשפט: \"I must go now\" ואז בחר מה הפירוש של המילה \"must\" במשפט:", sentence: "I must go now", sentenceTranslation: "אני חייב ללכת עכשיו", correct: 2, options: ["צריך", "יכול", "חייב", "רוצה"], explanation: "\"must\" במשפט זה אומרת \"חייב\"", category: "vocabulary", type: "sentence-recording", englishWord: "must", hebrewWord: "חייב" },
    { id: 1692, text: "הקליט את עצמך אומר את המשפט: \"I might come\" ואז בחר מה הפירוש של המילה \"might\" במשפט:", sentence: "I might come", sentenceTranslation: "אולי אני אבוא", correct: 1, options: ["יכול", "אולי", "צריך", "חייב"], explanation: "\"might\" במשפט זה אומרת \"אולי\"", category: "vocabulary", type: "sentence-recording", englishWord: "might", hebrewWord: "אולי" },
    { id: 1693, text: "הקליט את עצמך אומר את המשפט: \"I would like coffee\" ואז בחר מה הפירוש של המילה \"would\" במשפט:", sentence: "I would like coffee", sentenceTranslation: "אני רוצה קפה", correct: 0, options: ["יהיה", "היה", "יכול", "צריך"], explanation: "\"would\" במשפט זה אומרת \"יהיה\"", category: "vocabulary", type: "sentence-recording", englishWord: "would", hebrewWord: "יהיה" },
    { id: 1694, text: "הקליט את עצמך אומר את המשפט: \"I could help you\" ואז בחר מה הפירוש של המילה \"could\" במשפט:", sentence: "I could help you", sentenceTranslation: "אני יכול לעזור לך", correct: 0, options: ["יכול", "לא יכול", "צריך", "חייב"], explanation: "\"could\" במשפט זה אומרת \"יכול\"", category: "vocabulary", type: "sentence-recording", englishWord: "could", hebrewWord: "יכול" },
    { id: 1695, text: "הקליט את עצמך אומר את המשפט: \"You shouldn't smoke\" ואז בחר מה הפירוש של המילה \"shouldn't\" במשפט:", sentence: "You shouldn't smoke", sentenceTranslation: "אתה לא צריך לעשן", correct: 1, options: ["צריך", "לא צריך", "יכול", "לא יכול"], explanation: "\"shouldn't\" במשפט זה אומרת \"לא צריך\"", category: "vocabulary", type: "sentence-recording", englishWord: "shouldn't", hebrewWord: "לא צריך" },
    { id: 1696, text: "הקליט את עצמך אומר את המשפט: \"You mustn't enter\" ואז בחר מה הפירוש של המילה \"mustn't\" במשפט:", sentence: "You mustn't enter", sentenceTranslation: "אסור לך להיכנס", correct: 1, options: ["חייב", "אסור", "יכול", "לא יכול"], explanation: "\"mustn't\" במשפט זה אומרת \"אסור\"", category: "vocabulary", type: "sentence-recording", englishWord: "mustn't", hebrewWord: "אסור" },
    { id: 1697, text: "הקליט את עצמך אומר את המשפט: \"I couldn't finish\" ואז בחר מה הפירוש של המילה \"couldn't\" במשפט:", sentence: "I couldn't finish", sentenceTranslation: "לא יכולתי לסיים", correct: 1, options: ["יכול", "לא יכול", "צריך", "לא צריך"], explanation: "\"couldn't\" במשפט זה אומרת \"לא יכול\"", category: "vocabulary", type: "sentence-recording", englishWord: "couldn't", hebrewWord: "לא יכול" },
    { id: 1698, text: "הקליט את עצמך אומר את המשפט: \"I wouldn't do that\" ואז בחר מה הפירוש של המילה \"wouldn't\" במשפט:", sentence: "I wouldn't do that", sentenceTranslation: "לא הייתי עושה את זה", correct: 1, options: ["יהיה", "לא יהיה", "היה", "לא היה"], explanation: "\"wouldn't\" במשפט זה אומרת \"לא יהיה\"", category: "vocabulary", type: "sentence-recording", englishWord: "wouldn't", hebrewWord: "לא יהיה" },
    { id: 1699, text: "הקליט את עצמך אומר את המשפט: \"I mightn't come\" ואז בחר מה הפירוש של המילה \"mightn't\" במשפט:", sentence: "I mightn't come", sentenceTranslation: "אולי לא אבוא", correct: 1, options: ["אולי", "לא אולי", "יכול", "לא יכול"], explanation: "\"mightn't\" במשפט זה אומרת \"לא אולי\"", category: "vocabulary", type: "sentence-recording", englishWord: "mightn't", hebrewWord: "לא אולי" }
    ],
    '4': [ // רמה 4 - מתקדם - אוצר מילים מורכב
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1700, text: "מה אומרת המילה \"experience\"?", options: ["ניסיון", "ידע", "יכולת", "כישרון"], correct: 0, explanation: "\"experience\" אומרת \"ניסיון\"", category: "vocabulary", type: "multiple-choice", englishWord: "experience", hebrewWord: "ניסיון" },
    { id: 1701, text: "מה אומרת המילה \"knowledge\"?", options: ["ניסיון", "ידע", "יכולת", "כישרון"], correct: 1, explanation: "\"knowledge\" אומרת \"ידע\"", category: "vocabulary", type: "multiple-choice", englishWord: "knowledge", hebrewWord: "ידע" },
    { id: 1702, text: "מה אומרת המילה \"ability\"?", options: ["ניסיון", "ידע", "יכולת", "כישרון"], correct: 2, explanation: "\"ability\" אומרת \"יכולת\"", category: "vocabulary", type: "multiple-choice", englishWord: "ability", hebrewWord: "יכולת" },
    { id: 1703, text: "מה אומרת המילה \"talent\"?", options: ["ניסיון", "ידע", "יכולת", "כישרון"], correct: 3, explanation: "\"talent\" אומרת \"כישרון\"", category: "vocabulary", type: "multiple-choice", englishWord: "talent", hebrewWord: "כישרון" },
    { id: 1704, text: "מה אומרת המילה \"opportunity\"?", options: ["הזדמנות", "סיכוי", "אפשרות", "בחירה"], correct: 0, explanation: "\"opportunity\" אומרת \"הזדמנות\"", category: "vocabulary", type: "multiple-choice", englishWord: "opportunity", hebrewWord: "הזדמנות" },
    { id: 1705, text: "מה אומרת המילה \"chance\"?", options: ["הזדמנות", "סיכוי", "אפשרות", "בחירה"], correct: 1, explanation: "\"chance\" אומרת \"סיכוי\"", category: "vocabulary", type: "multiple-choice", englishWord: "chance", hebrewWord: "סיכוי" },
    { id: 1706, text: "מה אומרת המילה \"choice\"?", options: ["הזדמנות", "סיכוי", "אפשרות", "בחירה"], correct: 3, explanation: "\"choice\" אומרת \"בחירה\"", category: "vocabulary", type: "multiple-choice", englishWord: "choice", hebrewWord: "בחירה" },
    { id: 1707, text: "מה אומרת המילה \"challenge\"?", options: ["אתגר", "בעיה", "קושי", "משימה"], correct: 0, explanation: "\"challenge\" אומרת \"אתגר\"", category: "vocabulary", type: "multiple-choice", englishWord: "challenge", hebrewWord: "אתגר" },
    { id: 1708, text: "מה אומרת המילה \"problem\"?", options: ["אתגר", "בעיה", "קושי", "משימה"], correct: 1, explanation: "\"problem\" אומרת \"בעיה\"", category: "vocabulary", type: "multiple-choice", englishWord: "problem", hebrewWord: "בעיה" },
    { id: 1709, text: "מה אומרת המילה \"solution\"?", options: ["אתגר", "בעיה", "קושי", "פתרון"], correct: 3, explanation: "\"solution\" אומרת \"פתרון\"", category: "vocabulary", type: "multiple-choice", englishWord: "solution", hebrewWord: "פתרון" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1710, text: "הכתיב את המילה \"ניסיון\" באנגלית:", correct: "experience", explanation: "\"ניסיון\" באנגלית זה \"experience\"", category: "vocabulary", type: "dictation", englishWord: "experience", hebrewWord: "ניסיון" },
    { id: 1711, text: "הכתיב את המילה \"ידע\" באנגלית:", correct: "knowledge", explanation: "\"ידע\" באנגלית זה \"knowledge\"", category: "vocabulary", type: "dictation", englishWord: "knowledge", hebrewWord: "ידע" },
    { id: 1712, text: "הכתיב את המילה \"יכולת\" באנגלית:", correct: "ability", explanation: "\"יכולת\" באנגלית זה \"ability\"", category: "vocabulary", type: "dictation", englishWord: "ability", hebrewWord: "יכולת" },
    { id: 1713, text: "הכתיב את המילה \"כישרון\" באנגלית:", correct: "talent", explanation: "\"כישרון\" באנגלית זה \"talent\"", category: "vocabulary", type: "dictation", englishWord: "talent", hebrewWord: "כישרון" },
    { id: 1714, text: "הכתיב את המילה \"הזדמנות\" באנגלית:", correct: "opportunity", explanation: "\"הזדמנות\" באנגלית זה \"opportunity\"", category: "vocabulary", type: "dictation", englishWord: "opportunity", hebrewWord: "הזדמנות" },
    { id: 1715, text: "הכתיב את המילה \"סיכוי\" באנגלית:", correct: "chance", explanation: "\"סיכוי\" באנגלית זה \"chance\"", category: "vocabulary", type: "dictation", englishWord: "chance", hebrewWord: "סיכוי" },
    { id: 1716, text: "הכתיב את המילה \"בחירה\" באנגלית:", correct: "choice", explanation: "\"בחירה\" באנגלית זה \"choice\"", category: "vocabulary", type: "dictation", englishWord: "choice", hebrewWord: "בחירה" },
    { id: 1717, text: "הכתיב את המילה \"אתגר\" באנגלית:", correct: "challenge", explanation: "\"אתגר\" באנגלית זה \"challenge\"", category: "vocabulary", type: "dictation", englishWord: "challenge", hebrewWord: "אתגר" },
    { id: 1718, text: "הכתיב את המילה \"בעיה\" באנגלית:", correct: "problem", explanation: "\"בעיה\" באנגלית זה \"problem\"", category: "vocabulary", type: "dictation", englishWord: "problem", hebrewWord: "בעיה" },
    { id: 1719, text: "הכתיב את המילה \"פתרון\" באנגלית:", correct: "solution", explanation: "\"פתרון\" באנגלית זה \"solution\"", category: "vocabulary", type: "dictation", englishWord: "solution", hebrewWord: "פתרון" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1720, text: "הקליט את עצמך אומר את המילה \"ניסיון\" באנגלית:", correct: "experience", explanation: "\"ניסיון\" באנגלית זה \"experience\"", category: "vocabulary", type: "recording", englishWord: "experience", hebrewWord: "ניסיון" },
    { id: 1721, text: "הקליט את עצמך אומר את המילה \"ידע\" באנגלית:", correct: "knowledge", explanation: "\"ידע\" באנגלית זה \"knowledge\"", category: "vocabulary", type: "recording", englishWord: "knowledge", hebrewWord: "ידע" },
    { id: 1722, text: "הקליט את עצמך אומר את המילה \"יכולת\" באנגלית:", correct: "ability", explanation: "\"יכולת\" באנגלית זה \"ability\"", category: "vocabulary", type: "recording", englishWord: "ability", hebrewWord: "יכולת" },
    { id: 1723, text: "הקליט את עצמך אומר את המילה \"כישרון\" באנגלית:", correct: "talent", explanation: "\"כישרון\" באנגלית זה \"talent\"", category: "vocabulary", type: "recording", englishWord: "talent", hebrewWord: "כישרון" },
    { id: 1724, text: "הקליט את עצמך אומר את המילה \"הזדמנות\" באנגלית:", correct: "opportunity", explanation: "\"הזדמנות\" באנגלית זה \"opportunity\"", category: "vocabulary", type: "recording", englishWord: "opportunity", hebrewWord: "הזדמנות" },
    { id: 1725, text: "הקליט את עצמך אומר את המילה \"סיכוי\" באנגלית:", correct: "chance", explanation: "\"סיכוי\" באנגלית זה \"chance\"", category: "vocabulary", type: "recording", englishWord: "chance", hebrewWord: "סיכוי" },
    { id: 1726, text: "הקליט את עצמך אומר את המילה \"בחירה\" באנגלית:", correct: "choice", explanation: "\"בחירה\" באנגלית זה \"choice\"", category: "vocabulary", type: "recording", englishWord: "choice", hebrewWord: "בחירה" },
    { id: 1727, text: "הקליט את עצמך אומר את המילה \"אתגר\" באנגלית:", correct: "challenge", explanation: "\"אתגר\" באנגלית זה \"challenge\"", category: "vocabulary", type: "recording", englishWord: "challenge", hebrewWord: "אתגר" },
    { id: 1728, text: "הקליט את עצמך אומר את המילה \"בעיה\" באנגלית:", correct: "problem", explanation: "\"בעיה\" באנגלית זה \"problem\"", category: "vocabulary", type: "recording", englishWord: "problem", hebrewWord: "בעיה" },
    { id: 1729, text: "הקליט את עצמך אומר את המילה \"פתרון\" באנגלית:", correct: "solution", explanation: "\"פתרון\" באנגלית זה \"solution\"", category: "vocabulary", type: "recording", englishWord: "solution", hebrewWord: "פתרון" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1730, text: "הקליט את עצמך אומר את המשפט: \"I have experience\" ואז בחר מה הפירוש של המילה \"experience\" במשפט:", sentence: "I have experience", sentenceTranslation: "יש לי ניסיון", correct: 0, options: ["ניסיון", "ידע", "יכולת", "כישרון"], explanation: "\"experience\" במשפט זה אומרת \"ניסיון\"", category: "vocabulary", type: "sentence-recording", englishWord: "experience", hebrewWord: "ניסיון" },
    { id: 1731, text: "הקליט את עצמך אומר את המשפט: \"I gain knowledge\" ואז בחר מה הפירוש של המילה \"knowledge\" במשפט:", sentence: "I gain knowledge", sentenceTranslation: "אני רוכש ידע", correct: 1, options: ["ניסיון", "ידע", "יכולת", "כישרון"], explanation: "\"knowledge\" במשפט זה אומרת \"ידע\"", category: "vocabulary", type: "sentence-recording", englishWord: "knowledge", hebrewWord: "ידע" },
    { id: 1732, text: "הקליט את עצמך אומר את המשפט: \"I have the ability\" ואז בחר מה הפירוש של המילה \"ability\" במשפט:", sentence: "I have the ability", sentenceTranslation: "יש לי היכולת", correct: 2, options: ["ניסיון", "ידע", "יכולת", "כישרון"], explanation: "\"ability\" במשפט זה אומרת \"יכולת\"", category: "vocabulary", type: "sentence-recording", englishWord: "ability", hebrewWord: "יכולת" },
    { id: 1733, text: "הקליט את עצמך אומר את המשפט: \"I have talent\" ואז בחר מה הפירוש של המילה \"talent\" במשפט:", sentence: "I have talent", sentenceTranslation: "יש לי כישרון", correct: 3, options: ["ניסיון", "ידע", "יכולת", "כישרון"], explanation: "\"talent\" במשפט זה אומרת \"כישרון\"", category: "vocabulary", type: "sentence-recording", englishWord: "talent", hebrewWord: "כישרון" },
    { id: 1734, text: "הקליט את עצמך אומר את המשפט: \"I have an opportunity\" ואז בחר מה הפירוש של המילה \"opportunity\" במשפט:", sentence: "I have an opportunity", sentenceTranslation: "יש לי הזדמנות", correct: 0, options: ["הזדמנות", "סיכוי", "אפשרות", "בחירה"], explanation: "\"opportunity\" במשפט זה אומרת \"הזדמנות\"", category: "vocabulary", type: "sentence-recording", englishWord: "opportunity", hebrewWord: "הזדמנות" },
    { id: 1735, text: "הקליט את עצמך אומר את המשפט: \"I have a chance\" ואז בחר מה הפירוש של המילה \"chance\" במשפט:", sentence: "I have a chance", sentenceTranslation: "יש לי סיכוי", correct: 1, options: ["הזדמנות", "סיכוי", "אפשרות", "בחירה"], explanation: "\"chance\" במשפט זה אומרת \"סיכוי\"", category: "vocabulary", type: "sentence-recording", englishWord: "chance", hebrewWord: "סיכוי" },
    { id: 1736, text: "הקליט את עצמך אומר את המשפט: \"I make a choice\" ואז בחר מה הפירוש של המילה \"choice\" במשפט:", sentence: "I make a choice", sentenceTranslation: "אני עושה בחירה", correct: 3, options: ["הזדמנות", "סיכוי", "אפשרות", "בחירה"], explanation: "\"choice\" במשפט זה אומרת \"בחירה\"", category: "vocabulary", type: "sentence-recording", englishWord: "choice", hebrewWord: "בחירה" },
    { id: 1737, text: "הקליט את עצמך אומר את המשפט: \"I face a challenge\" ואז בחר מה הפירוש של המילה \"challenge\" במשפט:", sentence: "I face a challenge", sentenceTranslation: "אני מתמודד עם אתגר", correct: 0, options: ["אתגר", "בעיה", "קושי", "משימה"], explanation: "\"challenge\" במשפט זה אומרת \"אתגר\"", category: "vocabulary", type: "sentence-recording", englishWord: "challenge", hebrewWord: "אתגר" },
    { id: 1738, text: "הקליט את עצמך אומר את המשפט: \"I solve a problem\" ואז בחר מה הפירוש של המילה \"problem\" במשפט:", sentence: "I solve a problem", sentenceTranslation: "אני פותר בעיה", correct: 1, options: ["אתגר", "בעיה", "קושי", "משימה"], explanation: "\"problem\" במשפט זה אומרת \"בעיה\"", category: "vocabulary", type: "sentence-recording", englishWord: "problem", hebrewWord: "בעיה" },
    { id: 1739, text: "הקליט את עצמך אומר את המשפט: \"I find a solution\" ואז בחר מה הפירוש של המילה \"solution\" במשפט:", sentence: "I find a solution", sentenceTranslation: "אני מוצא פתרון", correct: 3, options: ["אתגר", "בעיה", "קושי", "פתרון"], explanation: "\"solution\" במשפט זה אומרת \"פתרון\"", category: "vocabulary", type: "sentence-recording", englishWord: "solution", hebrewWord: "פתרון" }
    ],
    '5': [ // רמה 5 - מומחה - אוצר מילים מורכב מאוד
    // שאלות אוצר מילים - סוג 1: Multiple Choice (אנגלית -> עברית)
    { id: 1740, text: "מה אומרת המילה \"achieve\"?", options: ["להשיג", "להצליח", "להתקדם", "להתפתח"], correct: 0, explanation: "\"achieve\" אומרת \"להשיג\"", category: "vocabulary", type: "multiple-choice", englishWord: "achieve", hebrewWord: "להשיג" },
    { id: 1741, text: "מה אומרת המילה \"develop\"?", options: ["להשיג", "להצליח", "להתקדם", "להתפתח"], correct: 3, explanation: "\"develop\" אומרת \"להתפתח\"", category: "vocabulary", type: "multiple-choice", englishWord: "develop", hebrewWord: "להתפתח" },
    { id: 1742, text: "מה אומרת המילה \"create\"?", options: ["ליצור", "להשמיד", "לשנות", "לשמור"], correct: 0, explanation: "\"create\" אומרת \"ליצור\"", category: "vocabulary", type: "multiple-choice", englishWord: "create", hebrewWord: "ליצור" },
    { id: 1743, text: "מה אומרת המילה \"destroy\"?", options: ["ליצור", "להשמיד", "לשנות", "לשמור"], correct: 1, explanation: "\"destroy\" אומרת \"להשמיד\"", category: "vocabulary", type: "multiple-choice", englishWord: "destroy", hebrewWord: "להשמיד" },
    { id: 1744, text: "מה אומרת המילה \"discover\"?", options: ["לגלות", "למצוא", "לחפש", "לחקור"], correct: 0, explanation: "\"discover\" אומרת \"לגלות\"", category: "vocabulary", type: "multiple-choice", englishWord: "discover", hebrewWord: "לגלות" },
    { id: 1745, text: "מה אומרת המילה \"invent\"?", options: ["לגלות", "למצוא", "להמציא", "לחקור"], correct: 2, explanation: "\"invent\" אומרת \"להמציא\"", category: "vocabulary", type: "multiple-choice", englishWord: "invent", hebrewWord: "להמציא" },
    { id: 1746, text: "מה אומרת המילה \"explore\"?", options: ["לגלות", "למצוא", "להמציא", "לחקור"], correct: 3, explanation: "\"explore\" אומרת \"לחקור\"", category: "vocabulary", type: "multiple-choice", englishWord: "explore", hebrewWord: "לחקור" },
    { id: 1747, text: "מה אומרת המילה \"imagine\"?", options: ["לדמיין", "לחשוב", "לזכור", "לשכוח"], correct: 0, explanation: "\"imagine\" אומרת \"לדמיין\"", category: "vocabulary", type: "multiple-choice", englishWord: "imagine", hebrewWord: "לדמיין" },
    { id: 1748, text: "מה אומרת המילה \"realize\"?", options: ["לדמיין", "לחשוב", "להבין", "לשכוח"], correct: 2, explanation: "\"realize\" אומרת \"להבין\"", category: "vocabulary", type: "multiple-choice", englishWord: "realize", hebrewWord: "להבין" },
    { id: 1749, text: "מה אומרת המילה \"recognize\"?", options: ["לזהות", "להכיר", "לזכור", "לשכוח"], correct: 0, explanation: "\"recognize\" אומרת \"לזהות\"", category: "vocabulary", type: "multiple-choice", englishWord: "recognize", hebrewWord: "לזהות" },
    
    // שאלות אוצר מילים - סוג 2: Dictation (עברית -> אנגלית - כתיבה)
    { id: 1750, text: "הכתיב את המילה \"להשיג\" באנגלית:", correct: "achieve", explanation: "\"להשיג\" באנגלית זה \"achieve\"", category: "vocabulary", type: "dictation", englishWord: "achieve", hebrewWord: "להשיג" },
    { id: 1751, text: "הכתיב את המילה \"להתפתח\" באנגלית:", correct: "develop", explanation: "\"להתפתח\" באנגלית זה \"develop\"", category: "vocabulary", type: "dictation", englishWord: "develop", hebrewWord: "להתפתח" },
    { id: 1752, text: "הכתיב את המילה \"ליצור\" באנגלית:", correct: "create", explanation: "\"ליצור\" באנגלית זה \"create\"", category: "vocabulary", type: "dictation", englishWord: "create", hebrewWord: "ליצור" },
    { id: 1753, text: "הכתיב את המילה \"להשמיד\" באנגלית:", correct: "destroy", explanation: "\"להשמיד\" באנגלית זה \"destroy\"", category: "vocabulary", type: "dictation", englishWord: "destroy", hebrewWord: "להשמיד" },
    { id: 1754, text: "הכתיב את המילה \"לגלות\" באנגלית:", correct: "discover", explanation: "\"לגלות\" באנגלית זה \"discover\"", category: "vocabulary", type: "dictation", englishWord: "discover", hebrewWord: "לגלות" },
    { id: 1755, text: "הכתיב את המילה \"להמציא\" באנגלית:", correct: "invent", explanation: "\"להמציא\" באנגלית זה \"invent\"", category: "vocabulary", type: "dictation", englishWord: "invent", hebrewWord: "להמציא" },
    { id: 1756, text: "הכתיב את המילה \"לחקור\" באנגלית:", correct: "explore", explanation: "\"לחקור\" באנגלית זה \"explore\"", category: "vocabulary", type: "dictation", englishWord: "explore", hebrewWord: "לחקור" },
    { id: 1757, text: "הכתיב את המילה \"לדמיין\" באנגלית:", correct: "imagine", explanation: "\"לדמיין\" באנגלית זה \"imagine\"", category: "vocabulary", type: "dictation", englishWord: "imagine", hebrewWord: "לדמיין" },
    { id: 1758, text: "הכתיב את המילה \"להבין\" באנגלית:", correct: "realize", explanation: "\"להבין\" באנגלית זה \"realize\"", category: "vocabulary", type: "dictation", englishWord: "realize", hebrewWord: "להבין" },
    { id: 1759, text: "הכתיב את המילה \"לזהות\" באנגלית:", correct: "recognize", explanation: "\"לזהות\" באנגלית זה \"recognize\"", category: "vocabulary", type: "dictation", englishWord: "recognize", hebrewWord: "לזהות" },
    
    // שאלות אוצר מילים - סוג 3: Recording (עברית -> אנגלית - הקלטה)
    { id: 1760, text: "הקליט את עצמך אומר את המילה \"להשיג\" באנגלית:", correct: "achieve", explanation: "\"להשיג\" באנגלית זה \"achieve\"", category: "vocabulary", type: "recording", englishWord: "achieve", hebrewWord: "להשיג" },
    { id: 1761, text: "הקליט את עצמך אומר את המילה \"להתפתח\" באנגלית:", correct: "develop", explanation: "\"להתפתח\" באנגלית זה \"develop\"", category: "vocabulary", type: "recording", englishWord: "develop", hebrewWord: "להתפתח" },
    { id: 1762, text: "הקליט את עצמך אומר את המילה \"ליצור\" באנגלית:", correct: "create", explanation: "\"ליצור\" באנגלית זה \"create\"", category: "vocabulary", type: "recording", englishWord: "create", hebrewWord: "ליצור" },
    { id: 1763, text: "הקליט את עצמך אומר את המילה \"להשמיד\" באנגלית:", correct: "destroy", explanation: "\"להשמיד\" באנגלית זה \"destroy\"", category: "vocabulary", type: "recording", englishWord: "destroy", hebrewWord: "להשמיד" },
    { id: 1764, text: "הקליט את עצמך אומר את המילה \"לגלות\" באנגלית:", correct: "discover", explanation: "\"לגלות\" באנגלית זה \"discover\"", category: "vocabulary", type: "recording", englishWord: "discover", hebrewWord: "לגלות" },
    { id: 1765, text: "הקליט את עצמך אומר את המילה \"להמציא\" באנגלית:", correct: "invent", explanation: "\"להמציא\" באנגלית זה \"invent\"", category: "vocabulary", type: "recording", englishWord: "invent", hebrewWord: "להמציא" },
    { id: 1766, text: "הקליט את עצמך אומר את המילה \"לחקור\" באנגלית:", correct: "explore", explanation: "\"לחקור\" באנגלית זה \"explore\"", category: "vocabulary", type: "recording", englishWord: "explore", hebrewWord: "לחקור" },
    { id: 1767, text: "הקליט את עצמך אומר את המילה \"לדמיין\" באנגלית:", correct: "imagine", explanation: "\"לדמיין\" באנגלית זה \"imagine\"", category: "vocabulary", type: "recording", englishWord: "imagine", hebrewWord: "לדמיין" },
    { id: 1768, text: "הקליט את עצמך אומר את המילה \"להבין\" באנגלית:", correct: "realize", explanation: "\"להבין\" באנגלית זה \"realize\"", category: "vocabulary", type: "recording", englishWord: "realize", hebrewWord: "להבין" },
    { id: 1769, text: "הקליט את עצמך אומר את המילה \"לזהות\" באנגלית:", correct: "recognize", explanation: "\"לזהות\" באנגלית זה \"recognize\"", category: "vocabulary", type: "recording", englishWord: "recognize", hebrewWord: "לזהות" },
    
    // שאלות אוצר מילים - סוג 4: Sentence Recording (משפט עם הקלטה ופירוש)
    { id: 1770, text: "הקליט את עצמך אומר את המשפט: \"I achieve my goals\" ואז בחר מה הפירוש של המילה \"achieve\" במשפט:", sentence: "I achieve my goals", sentenceTranslation: "אני משיג את המטרות שלי", correct: 0, options: ["להשיג", "להצליח", "להתקדם", "להתפתח"], explanation: "\"achieve\" במשפט זה אומרת \"להשיג\"", category: "vocabulary", type: "sentence-recording", englishWord: "achieve", hebrewWord: "להשיג" },
    { id: 1771, text: "הקליט את עצמך אומר את המשפט: \"I develop my skills\" ואז בחר מה הפירוש של המילה \"develop\" במשפט:", sentence: "I develop my skills", sentenceTranslation: "אני מפתח את הכישורים שלי", correct: 3, options: ["להשיג", "להצליח", "להתקדם", "להתפתח"], explanation: "\"develop\" במשפט זה אומרת \"להתפתח\"", category: "vocabulary", type: "sentence-recording", englishWord: "develop", hebrewWord: "להתפתח" },
    { id: 1772, text: "הקליט את עצמך אומר את המשפט: \"I create art\" ואז בחר מה הפירוש של המילה \"create\" במשפט:", sentence: "I create art", sentenceTranslation: "אני יוצר אמנות", correct: 0, options: ["ליצור", "להשמיד", "לשנות", "לשמור"], explanation: "\"create\" במשפט זה אומרת \"ליצור\"", category: "vocabulary", type: "sentence-recording", englishWord: "create", hebrewWord: "ליצור" },
    { id: 1773, text: "הקליט את עצמך אומר את המשפט: \"I destroy the old\" ואז בחר מה הפירוש של המילה \"destroy\" במשפט:", sentence: "I destroy the old", sentenceTranslation: "אני משמיד את הישן", correct: 1, options: ["ליצור", "להשמיד", "לשנות", "לשמור"], explanation: "\"destroy\" במשפט זה אומרת \"להשמיד\"", category: "vocabulary", type: "sentence-recording", englishWord: "destroy", hebrewWord: "להשמיד" },
    { id: 1774, text: "הקליט את עצמך אומר את המשפט: \"I discover new things\" ואז בחר מה הפירוש של המילה \"discover\" במשפט:", sentence: "I discover new things", sentenceTranslation: "אני מגלה דברים חדשים", correct: 0, options: ["לגלות", "למצוא", "לחפש", "לחקור"], explanation: "\"discover\" במשפט זה אומרת \"לגלות\"", category: "vocabulary", type: "sentence-recording", englishWord: "discover", hebrewWord: "לגלות" },
    { id: 1775, text: "הקליט את עצמך אומר את המשפט: \"I invent new ideas\" ואז בחר מה הפירוש של המילה \"invent\" במשפט:", sentence: "I invent new ideas", sentenceTranslation: "אני ממציא רעיונות חדשים", correct: 2, options: ["לגלות", "למצוא", "להמציא", "לחקור"], explanation: "\"invent\" במשפט זה אומרת \"להמציא\"", category: "vocabulary", type: "sentence-recording", englishWord: "invent", hebrewWord: "להמציא" },
    { id: 1776, text: "הקליט את עצמך אומר את המשפט: \"I explore the world\" ואז בחר מה הפירוש של המילה \"explore\" במשפט:", sentence: "I explore the world", sentenceTranslation: "אני חוקר את העולם", correct: 3, options: ["לגלות", "למצוא", "להמציא", "לחקור"], explanation: "\"explore\" במשפט זה אומרת \"לחקור\"", category: "vocabulary", type: "sentence-recording", englishWord: "explore", hebrewWord: "לחקור" },
    { id: 1777, text: "הקליט את עצמך אומר את המשפט: \"I imagine the future\" ואז בחר מה הפירוש של המילה \"imagine\" במשפט:", sentence: "I imagine the future", sentenceTranslation: "אני מדמיין את העתיד", correct: 0, options: ["לדמיין", "לחשוב", "לזכור", "לשכוח"], explanation: "\"imagine\" במשפט זה אומרת \"לדמיין\"", category: "vocabulary", type: "sentence-recording", englishWord: "imagine", hebrewWord: "לדמיין" },
    { id: 1778, text: "הקליט את עצמך אומר את המשפט: \"I realize the truth\" ואז בחר מה הפירוש של המילה \"realize\" במשפט:", sentence: "I realize the truth", sentenceTranslation: "אני מבין את האמת", correct: 2, options: ["לדמיין", "לחשוב", "להבין", "לשכוח"], explanation: "\"realize\" במשפט זה אומרת \"להבין\"", category: "vocabulary", type: "sentence-recording", englishWord: "realize", hebrewWord: "להבין" },
    { id: 1779, text: "הקליט את עצמך אומר את המשפט: \"I recognize your face\" ואז בחר מה הפירוש של המילה \"recognize\" במשפט:", sentence: "I recognize your face", sentenceTranslation: "אני מזהה את הפנים שלך", correct: 0, options: ["לזהות", "להכיר", "לזכור", "לשכוח"], explanation: "\"recognize\" במשפט זה אומרת \"לזהות\"", category: "vocabulary", type: "sentence-recording", englishWord: "recognize", hebrewWord: "לזהות" }
    ]
  }
};

function ClassroomStudentPageContent() {
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

  // פונקציה להשמעת שאלות חזרה
  const speakRepeatQuestion = (text: string) => {
    if ('speechSynthesis' in window && text.includes('🔊 חזור אחרי הקריין:')) {
      const word = text.split('🔊 חזור אחרי הקריין: ')[1];
      if (word) {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(word);
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
  
  // בחר שאלות לפי יחידה ורמה
  const QUESTIONS = QUESTIONS_BY_UNIT_LEVEL[unit]?.[level] || QUESTIONS_BY_UNIT_LEVEL['1']['1'];
  
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [dictationAnswer, setDictationAnswer] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [userTranscript, setUserTranscript] = useState<string>('');
  const speechRecognitionRef = useRef<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [sentenceRecordingDone, setSentenceRecordingDone] = useState<boolean>(false);
  const [sentenceRecordingCorrect, setSentenceRecordingCorrect] = useState<boolean | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [showNameInput, setShowNameInput] = useState(true);
  const [showFinalRanking, setShowFinalRanking] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameStartTimeRef = useRef<number>(0);

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
        
        // חשב זמן נותר
        const elapsed = Date.now() - progress.gameStartTime;
        const remaining = Math.max(0, 7200000 - elapsed); // 2 hours in milliseconds
        setTimeLeft(Math.floor(remaining / 1000));
      }
    }
  }, [sessionId]);

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
    setIsAnswerCorrect(null);
    setUserTranscript('');
    gameStartTimeRef.current = Date.now();
  };

  const handleAnswer = (answerIndex: number) => {
    if (!currentQuestion || !gameProgress || selectedAnswer !== null) return;
    if (currentQuestion.type !== 'multiple-choice' && currentQuestion.type !== undefined) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const isCorrect = answerIndex === (currentQuestion.correct as number);
    setIsAnswerCorrect(isCorrect);
    
    // השמעת הודעת הצלחה או כישלון
    setTimeout(() => {
      speakFeedback(isCorrect);
    }, 500); // קצת עיכוב כדי שהאנימציה תתחיל
    
    let points = 0;
    
    if (isCorrect) {
      // נקודות בסיסיות - הופחת מ-10 ל-3
      points = 3;
      
      // בונוס זמן - אם ענה מהר (תוך 10 שניות)
      const timeToAnswer = Date.now() - (gameProgress.lastActivityTime || gameProgress.gameStartTime);
      if (timeToAnswer < 10000) { // 10 שניות
        points += 2; // בונוס 2 נקודות נוספות (הופחת מ-5)
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

  // פונקציה לטיפול בתשובת dictation
  const handleDictationSubmit = () => {
    if (!currentQuestion || !gameProgress || dictationAnswer.trim() === '') return;
    
    const correctAnswer = (currentQuestion.correct as string).toLowerCase().trim();
    const userAnswer = dictationAnswer.toLowerCase().trim();
    const isCorrect = userAnswer === correctAnswer;
    
    setIsAnswerCorrect(isCorrect);
    setShowExplanation(true);
    
    setTimeout(() => {
      speakFeedback(isCorrect);
    }, 500);
    
    let points = 0;
    if (isCorrect) {
      points = 3; // הופחת מ-10 ל-3
      const timeToAnswer = Date.now() - (gameProgress.lastActivityTime || gameProgress.gameStartTime);
      if (timeToAnswer < 10000) {
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

  // פונקציה להתחלת הקלטה
  const startRecording = async () => {
    try {
      // בדוק אם SpeechRecognition נתמך
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('הדפדפן שלך לא תומך בזיהוי דיבור. אנא השתמש בדפדפן Chrome או Edge.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordingBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setUserTranscript('');

      // התחל זיהוי דיבור
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US'; // השאלות הן באנגלית
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        if (event.results && event.results.length > 0 && event.results[0].length > 0) {
          const transcript = event.results[0][0].transcript.trim();
          setUserTranscript(transcript);
          console.log('Speech recognized:', transcript);
          
          // עצור את ההקלטה אוטומטית כשהדיבור מזוהה
          if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
          }
          if (recognition) {
            recognition.stop();
          }
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        if (event.error === 'no-speech') {
          // אם אין דיבור, פשוט תן למשתמש לעצור ידנית
          return;
        }
        alert('שגיאה בזיהוי דיבור. נסה שוב.');
        if (recorder && recorder.state !== 'inactive') {
          recorder.stop();
        }
        if (recognition) {
          recognition.stop();
        }
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      recognition.onend = () => {
        if (recorder && recorder.state !== 'inactive') {
          recorder.stop();
        }
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('לא ניתן להתחיל הקלטה. אנא בדוק את הרשאות המיקרופון.');
      setIsRecording(false);
    }
  };

  // פונקציה לעצירת הקלטה
  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // פונקציה לניקוי טקסט מהקלטה - מסיר סימני פיסוק ורווחים מיותרים
  const cleanTranscript = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:]/g, '') // הסר סימני פיסוק
      .replace(/\s+/g, ' ') // החלף רווחים מרובים ברווח אחד
      .trim();
  };

  // פונקציה לבדיקת הקלטה
  const handleRecordingSubmit = () => {
    if (!currentQuestion || !gameProgress || !recordingBlob) {
      alert('אנא הקלט את עצמך קודם');
      return;
    }
    
    // בדוק את התשובה על בסיס הטקסט שהוקלט
    // נשתמש ב-englishWord אם קיים, אחרת ב-correct
    const correctAnswerFromQuestion = currentQuestion.englishWord || (currentQuestion.correct as string);
    const correctAnswer = cleanTranscript(correctAnswerFromQuestion);
    const userAnswer = cleanTranscript(userTranscript);
    
    // אם אין טקסט מזוהה, נסה שוב
    if (!userAnswer) {
      alert('לא זוהה דיבור. אנא הקלט שוב.');
      setRecordingBlob(null);
      setUserTranscript('');
      return;
    }
    
    // בדוק אם התשובה נכונה - בדיקה גמישה יותר
    const isExactMatch = userAnswer === correctAnswer;
    
    // בדוק אם המילה שהוקלטה מכילה את המילה הנכונה או להיפך (למקרה של רווחים או מילים נוספות)
    const userWords = userAnswer.split(/\s+/);
    const correctWords = correctAnswer.split(/\s+/);
    const isWordMatch = userWords.some(word => correctWords.includes(word)) || 
                       correctWords.some(word => userWords.includes(word));
    
    // בדוק גם אם המילה הנכונה מופיעה בתוך המילה שהוקלטה (למקרה של סימני פיסוק או רווחים)
    const isContained = userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer);
    
    // התשובה נכונה אם יש התאמה מדויקת, או אם המילה מופיעה במילה שהוקלטה
    const isCorrect = isExactMatch || isWordMatch || isContained;
    
    // הוסף לוג לדיבוג
    console.log('Recording check:', {
      correctAnswerFromQuestion,
      correctAnswer,
      userAnswer,
      isExactMatch,
      isWordMatch,
      isContained,
      isCorrect
    });
    
    // אם זו שאלה מסוג sentence-recording, בדוק רק את ההקלטה
    if (currentQuestion.type === 'sentence-recording') {
      // בדוק אם המשפט שהוקלט תואם למשפט הנכון
      const correctSentence = cleanTranscript(currentQuestion.sentence || '');
      const userSentence = cleanTranscript(userTranscript);
      
      // בדוק אם כל המילים במשפט הנכון מופיעות במשפט שהוקלט
      const correctWords = correctSentence.split(/\s+/).filter(w => w.length > 0);
      const userWords = userSentence.split(/\s+/).filter(w => w.length > 0);
      const matchingWords = correctWords.filter(word => 
        userWords.some(uw => uw.includes(word) || word.includes(uw))
      );
      const sentenceMatch = matchingWords.length >= Math.max(1, correctWords.length * 0.7); // לפחות 70% מהמילים
      
      setSentenceRecordingCorrect(sentenceMatch);
      setSentenceRecordingDone(true);
      return; // לא נציג הסבר עד שהמשתמש יענה על שאלת הפירוש
    }
    
    setIsAnswerCorrect(isCorrect);
    setShowExplanation(true);
    
    setTimeout(() => {
      speakFeedback(isCorrect);
    }, 500);
    
    let points = 0;
    if (isCorrect) {
      points = 3; // הופחת מ-10 ל-3
      const timeToAnswer = Date.now() - (gameProgress.lastActivityTime || gameProgress.gameStartTime);
      if (timeToAnswer < 10000) {
        points += 2; // הופחת מ-5 ל-2
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

  // פונקציה למעבר לשאלה הבאה
  const goToNextQuestion = () => {
    if (!gameProgress) return;
    
    const nextQuestionIndex = gameProgress.currentQuestion + 1;
    
    if (nextQuestionIndex >= QUESTIONS.length) {
      finishGame();
    } else {
      setCurrentQuestion(QUESTIONS[nextQuestionIndex]);
      setSelectedAnswer(null);
      setDictationAnswer('');
      setRecordingBlob(null);
      setIsRecording(false);
      setShowExplanation(false);
      setIsAnswerCorrect(null);
      setUserTranscript('');
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      }
      
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
    
    // בונוס זמן: אם סיים תוך 30 דקות - 15 נקודות בונוס (הופחת מ-50)
    if (timeInMinutes <= 30) {
      timeBonus = 15;
    } else if (timeInMinutes <= 45) {
      timeBonus = 8; // הופחת מ-25
    } else if (timeInMinutes <= 60) {
      timeBonus = 3; // הופחת מ-10
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
                  if (currentQuestion.text.includes('חזור אחרי הקריין:')) {
                    // שאלת חזרה - השמע את המילה
                    const word = currentQuestion.text.split('🔊 חזור אחרי הקריין: ')[1];
                    if (word) {
                      const utterance = new SpeechSynthesisUtterance(word);
                      utterance.lang = 'en-US';
                      utterance.rate = 0.7;
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
                title={currentQuestion.text.includes('חזור אחרי הקריין:') ? "האזן שוב למילה" : "האזן לצליל האות"}
              >
                🔊
              </button>
            )}
          </div>
        </div>

        {/* Render different question types */}
        {currentQuestion.type === 'multiple-choice' || !currentQuestion.type ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentQuestion.options?.map((option, index) => (
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
        ) : currentQuestion.type === 'dictation' ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
              <label className="block text-lg font-bold text-gray-700 mb-4">
                הקלד את המילה באנגלית:
              </label>
              <input
                type="text"
                value={dictationAnswer}
                onChange={(e) => setDictationAnswer(e.target.value)}
                disabled={showExplanation}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !showExplanation) {
                    handleDictationSubmit();
                  }
                }}
                className="w-full p-4 text-2xl font-bold text-center border-2 border-blue-300 rounded-xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 transition-all"
                placeholder="הקלד כאן..."
                autoFocus
              />
            </div>
            {!showExplanation && (
              <button
                onClick={handleDictationSubmit}
                disabled={dictationAnswer.trim() === ''}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✅ שלח תשובה
              </button>
            )}
          </div>
        ) : currentQuestion.type === 'recording' ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
              <p className="text-lg font-bold text-gray-700 mb-4 text-center">
                הקלט את עצמך אומר את המילה באנגלית:
              </p>
              <div className="flex flex-col items-center gap-4">
                {!isRecording && !recordingBlob && (
                  <button
                    onClick={startRecording}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold text-xl rounded-xl hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
                  >
                    🎤 התחל הקלטה
                  </button>
                )}
                {isRecording && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-pulse text-red-600 text-2xl font-bold">
                      🔴 מקליט...
                    </div>
                    <button
                      onClick={stopRecording}
                      className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold text-xl rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      ⏹️ עצור הקלטה
                    </button>
                  </div>
                )}
                {recordingBlob && !showExplanation && (
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="text-green-600 text-xl font-bold">
                      ✅ הקלטה הושלמה
                    </div>
                    {userTranscript && (
                      <div className="w-full p-4 bg-white rounded-xl border-2 border-purple-300">
                        <p className="text-sm text-gray-600 mb-2">המילה שזוהתה:</p>
                        <p className="text-2xl font-bold text-purple-800 text-center">{userTranscript}</p>
                      </div>
                    )}
                    <audio src={URL.createObjectURL(recordingBlob)} controls className="w-full max-w-md" />
                    <button
                      onClick={handleRecordingSubmit}
                      disabled={!userTranscript}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✅ שלח תשובה
                    </button>
                    <button
                      onClick={() => {
                        setRecordingBlob(null);
                        setIsRecording(false);
                        setUserTranscript('');
                        if (speechRecognitionRef.current) {
                          speechRecognitionRef.current.stop();
                          speechRecognitionRef.current = null;
                        }
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all"
                    >
                      🔄 הקלט שוב
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : currentQuestion.type === 'sentence-recording' ? (
          <div className="space-y-6">
            {/* שלב 1: הקלטת המשפט */}
            {!sentenceRecordingDone && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                <p className="text-lg font-bold text-gray-700 mb-4 text-center">
                  הקלט את עצמך אומר את המשפט:
                </p>
                <div className="bg-white p-4 rounded-xl border-2 border-purple-300 mb-4">
                  <p className="text-2xl font-bold text-purple-800 text-center mb-2">
                    {currentQuestion.sentence}
                  </p>
                  {currentQuestion.sentenceTranslation && (
                    <p className="text-lg text-gray-600 text-center">
                      ({currentQuestion.sentenceTranslation})
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-center gap-4">
                  {!isRecording && !recordingBlob && (
                    <button
                      onClick={startRecording}
                      className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold text-xl rounded-xl hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
                    >
                      🎤 התחל הקלטה
                    </button>
                  )}
                  {isRecording && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-pulse text-red-600 text-2xl font-bold">
                        🔴 מקליט...
                      </div>
                      <button
                        onClick={stopRecording}
                        className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold text-xl rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        ⏹️ עצור הקלטה
                      </button>
                    </div>
                  )}
                  {recordingBlob && !sentenceRecordingDone && (
                    <div className="flex flex-col items-center gap-4 w-full">
                      <div className="text-green-600 text-xl font-bold">
                        ✅ הקלטה הושלמה
                      </div>
                      {userTranscript && (
                        <div className="w-full p-4 bg-white rounded-xl border-2 border-purple-300">
                          <p className="text-sm text-gray-600 mb-2">המשפט שזוהה:</p>
                          <p className="text-xl font-bold text-purple-800 text-center">{userTranscript}</p>
                        </div>
                      )}
                      <audio src={URL.createObjectURL(recordingBlob)} controls className="w-full max-w-md" />
                      <button
                        onClick={handleRecordingSubmit}
                        disabled={!userTranscript}
                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✅ שלח הקלטה
                      </button>
                      <button
                        onClick={() => {
                          setRecordingBlob(null);
                          setIsRecording(false);
                          setUserTranscript('');
                          if (speechRecognitionRef.current) {
                            speechRecognitionRef.current.stop();
                            speechRecognitionRef.current = null;
                          }
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all"
                      >
                        🔄 הקלט שוב
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* שלב 2: שאלת הפירוש */}
            {sentenceRecordingDone && !showExplanation && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
                <p className="text-lg font-bold text-gray-700 mb-4 text-center">
                  {sentenceRecordingCorrect ? '✅ הקלטת נכון! עכשיו בחר מה הפירוש של המילה במשפט:' : '⚠️ ההקלטה לא הייתה מדויקת, אבל נמשיך. בחר מה הפירוש של המילה במשפט:'}
                </p>
                <div className="bg-white p-4 rounded-xl border-2 border-blue-300 mb-4">
                  <p className="text-xl font-bold text-blue-800 text-center">
                    {currentQuestion.sentence}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`p-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                        selectedAnswer === null
                          ? 'bg-gradient-to-br from-blue-100 to-purple-100 text-purple-800 hover:from-blue-200 hover:to-purple-200 hover:scale-105 border-2 border-blue-200'
                          : index === currentQuestion.correct
                          ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-800 border-4 border-green-400'
                          : index === selectedAnswer
                          ? 'bg-gradient-to-br from-red-100 to-pink-100 text-red-800 border-4 border-red-400'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border-2 border-gray-200'
                      } ${selectedAnswer !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {showExplanation && (
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-lg">
            <div className="flex items-start">
              <div className="text-3xl mr-4">
                {isAnswerCorrect ? '🎉' : '💡'}
              </div>
              <div className="flex-1">
                <p className="font-bold text-blue-800 mb-2 text-lg">
                  {isAnswerCorrect ? 'מעולה! נכון!' : 'לא נכון, אבל למדת משהו חדש!'}
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

export default function ClassroomStudentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">טוען...</div>}>
      <ClassroomStudentPageContent />
    </Suspense>
  );
}
