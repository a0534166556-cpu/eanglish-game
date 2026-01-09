"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation';

const SENTENCES = [
  // יומיומי
  { id: 1, lang: "en", text: "Good morning", category: "daily", icon: "☀️" },
  { id: 2, lang: "en", text: "How are you today?", category: "daily", icon: "🙂" },
  { id: 3, lang: "en", text: "Please close the door", category: "daily", icon: "🚪" },
  { id: 4, lang: "en", text: "Can you help me?", category: "daily", icon: "🆘" },
  { id: 5, lang: "en", text: "I love ice cream", category: "food", icon: "🍦" },
  { id: 6, lang: "en", text: "My favorite color is blue", category: "daily", icon: "🔵" },
  { id: 7, lang: "en", text: "I have a red ball", category: "daily", icon: "🔴" },
  { id: 8, lang: "en", text: "See you tomorrow", category: "daily", icon: "👋" },
  { id: 9, lang: "en", text: "Turn off the light", category: "daily", icon: "💡" },
  { id: 10, lang: "en", text: "Wash your hands", category: "health", icon: "🧼" },
  // טבע
  { id: 11, lang: "en", text: "The sun is shining", category: "nature", icon: "🌞" },
  { id: 12, lang: "en", text: "The sky is blue", category: "nature", icon: "☁️" },
  { id: 13, lang: "en", text: "Birds are singing", category: "nature", icon: "🐦" },
  { id: 14, lang: "en", text: "The river is long", category: "nature", icon: "🏞️" },
  { id: 15, lang: "en", text: "The tree is tall", category: "nature", icon: "🌳" },
  // רגשות
  { id: 16, lang: "en", text: "I am very happy today", category: "emotions", icon: "😃" },
  { id: 17, lang: "en", text: "She feels sad", category: "emotions", icon: "😢" },
  { id: 18, lang: "en", text: "He is excited", category: "emotions", icon: "🤩" },
  { id: 19, lang: "en", text: "They are surprised", category: "emotions", icon: "😲" },
  { id: 20, lang: "en", text: "We are proud of you", category: "emotions", icon: "👏" },
  // חגים
  { id: 21, lang: "en", text: "Happy New Year", category: "holidays", icon: "🎉" },
  { id: 22, lang: "en", text: "Merry Christmas", category: "holidays", icon: "🎄" },
  { id: 23, lang: "en", text: "Happy Hanukkah", category: "holidays", icon: "🕋" },
  { id: 24, lang: "en", text: "Happy birthday to you", category: "holidays", icon: "🎂" },
  { id: 25, lang: "en", text: "Enjoy your holiday", category: "holidays", icon: "🏖️" },
  // בית ספר
  { id: 26, lang: "en", text: "The teacher is in the classroom", category: "school", icon: "🏫" },
  { id: 27, lang: "en", text: "I am doing my homework", category: "school", icon: "📚" },
  { id: 28, lang: "en", text: "We are learning English", category: "school", icon: "🇬🇧" },
  { id: 29, lang: "en", text: "The bell is ringing", category: "school", icon: "🔔" },
  { id: 30, lang: "en", text: "Please open your book", category: "school", icon: "📖" },
  // תחבורה
  { id: 31, lang: "en", text: "The bus is late", category: "transport", icon: "🚌" },
  { id: 32, lang: "en", text: "I ride my bicycle to school", category: "transport", icon: "🚲" },
  { id: 33, lang: "en", text: "The train is fast", category: "transport", icon: "🚄" },
  { id: 34, lang: "en", text: "We are waiting for a taxi", category: "transport", icon: "🚖" },
  { id: 35, lang: "en", text: "The airplane is flying", category: "transport", icon: "✈️" },
  // אוכל
  { id: 36, lang: "en", text: "I eat an apple every day", category: "food", icon: "🍎" },
  { id: 37, lang: "en", text: "She likes chocolate", category: "food", icon: "🍫" },
  { id: 38, lang: "en", text: "We are cooking dinner", category: "food", icon: "🍳" },
  { id: 39, lang: "en", text: "The soup is hot", category: "food", icon: "🔥" },
  { id: 40, lang: "en", text: "Breakfast is ready", category: "food", icon: "🥣" },
  // טכנולוגיה
  { id: 41, lang: "en", text: "I use a computer every day", category: "technology", icon: "💻" },
  { id: 42, lang: "en", text: "My phone is new", category: "technology", icon: "📱" },
  { id: 43, lang: "en", text: "The internet is fast", category: "technology", icon: "🌐" },
  { id: 44, lang: "en", text: "She is sending an email", category: "technology", icon: "📧" },
  { id: 45, lang: "en", text: "We are watching TV", category: "technology", icon: "📺" },
  // ספורט
  { id: 46, lang: "en", text: "He plays basketball", category: "sports", icon: "🏀" },
  { id: 47, lang: "en", text: "They are running in the park", category: "sports", icon: "🏃‍♂️" },
  { id: 48, lang: "en", text: "I swim in the pool", category: "sports", icon: "🏊‍♂️" },
  { id: 49, lang: "en", text: "The game was exciting", category: "sports", icon: "🤩" },
  { id: 50, lang: "en", text: "She won the race", category: "sports", icon: "🏆" },
  // בריאות
  { id: 51, lang: "en", text: "Drink plenty of water", category: "health", icon: "💧" },
  { id: 52, lang: "en", text: "Eat healthy food", category: "health", icon: "🥗" },
  { id: 53, lang: "en", text: "He is feeling sick", category: "health", icon: "🤒" },
  { id: 54, lang: "en", text: "Go to the doctor", category: "health", icon: "👨‍⚕️" },
  { id: 55, lang: "en", text: "I need some rest", category: "health", icon: "🛌" },
  // משפחה וחוויות
  { id: 56, lang: "en", text: "My family is very big", category: "family", icon: "👨‍��‍👧‍👦" },
  { id: 57, lang: "en", text: "We went to the zoo", category: "experiences", icon: "🐒" },
  { id: 58, lang: "en", text: "I had a wonderful dream", category: "experiences", icon: "💭" },
  { id: 59, lang: "en", text: "She visited her grandmother", category: "family", icon: "👵" },
  { id: 60, lang: "en", text: "He is my best friend", category: "family", icon: "🤝" },
  // יומיומי
  { id: 101, lang: "he", text: "בוקר טוב", category: "daily", icon: "☀️" },
  { id: 102, lang: "he", text: "מה שלומך היום?", category: "daily", icon: "🙂" },
  { id: 103, lang: "he", text: "בבקשה סגור את הדלת", category: "daily", icon: "🚪" },
  { id: 104, lang: "he", text: "אתה יכול לעזור לי?", category: "daily", icon: "🆘" },
  { id: 105, lang: "he", text: "אני אוהב גלידה", category: "food", icon: "🍦" },
  { id: 106, lang: "he", text: "הצבע האהוב עלי הוא כחול", category: "daily", icon: "🔵" },
  { id: 107, lang: "he", text: "יש לי כדור אדום", category: "daily", icon: "🔴" },
  { id: 108, lang: "he", text: "נתראה מחר", category: "daily", icon: "👋" },
  { id: 109, lang: "he", text: "כבה את האור", category: "daily", icon: "💡" },
  { id: 110, lang: "he", text: "שטוף ידיים", category: "health", icon: "🧼" },
  // טבע
  { id: 111, lang: "he", text: "השמש זורחת", category: "nature", icon: "🌞" },
  { id: 112, lang: "he", text: "השמים כחולים", category: "nature", icon: "☁️" },
  { id: 113, lang: "he", text: "הציפורים שרות", category: "nature", icon: "🐦" },
  { id: 114, lang: "he", text: "הנהר ארוך", category: "nature", icon: "🏞️" },
  { id: 115, lang: "he", text: "העץ גבוה", category: "nature", icon: "🌳" },
  // רגשות
  { id: 116, lang: "he", text: "אני מאוד שמח היום", category: "emotions", icon: "😃" },
  { id: 117, lang: "he", text: "היא מרגישה עצובה", category: "emotions", icon: "😢" },
  { id: 118, lang: "he", text: "הוא נרגש", category: "emotions", icon: "🤩" },
  { id: 119, lang: "he", text: "הם מופתעים", category: "emotions", icon: "😲" },
  { id: 120, lang: "he", text: "אנחנו גאים בך", category: "emotions", icon: "👏" },
  // חגים
  { id: 121, lang: "he", text: "שנה טובה", category: "holidays", icon: "🎉" },
  { id: 122, lang: "he", text: "חג מולד שמח", category: "holidays", icon: "🎉" },
  { id: 123, lang: "he", text: "חנוכה שמח", category: "holidays", icon: "🕋" },
  { id: 124, lang: "he", text: "יום הולדת שמח", category: "holidays", icon: "🎂" },
  { id: 125, lang: "he", text: "תהנה מהחג", category: "holidays", icon: "🏖️" },
  // בית ספר
  { id: 126, lang: "he", text: "המורה בכיתה", category: "school", icon: "🏫" },
  { id: 127, lang: "he", text: "אני עושה שיעורי בית", category: "school", icon: "📚" },
  { id: 128, lang: "he", text: "אנחנו לומדים אנגלית", category: "school", icon: "🇬🇧" },
  { id: 129, lang: "he", text: "הפעמון מצלצל", category: "school", icon: "🔔" },
  { id: 130, lang: "he", text: "בבקשה פתח את הספר", category: "school", icon: "📖" },
  // תחבורה
  { id: 131, lang: "he", text: "האוטובוס מאחר", category: "transport", icon: "🚌" },
  { id: 132, lang: "he", text: "אני רוכב באופניים לבית הספר", category: "transport", icon: "🚲" },
  { id: 133, lang: "he", text: "הרכבת מהירה", category: "transport", icon: "🏎️" },
  { id: 134, lang: "he", text: "אנחנו מחכים למונית", category: "transport", icon: "🚌" },
  { id: 135, lang: "he", text: "המטוס טס", category: "transport", icon: "✈️" },
  // אוכל
  { id: 136, lang: "he", text: "אני אוכל תפוח כל יום", category: "food", icon: "🍎" },
  { id: 137, lang: "he", text: "היא אוהבת שוקולד", category: "food", icon: "🍫" },
  { id: 138, lang: "he", text: "אנחנו מבשלים ארוחת ערב", category: "food", icon: "🍳" },
  { id: 139, lang: "he", text: "המרק חם", category: "food", icon: "🔥" },
  { id: 140, lang: "he", text: "הארוחה מוכנה", category: "food", icon: "🥣" },
  // טכנולוגיה
  { id: 141, lang: "he", text: "אני משתמש במחשב כל יום", category: "technology", icon: "💻" },
  { id: 142, lang: "he", text: "הטלפון שלי חדש", category: "technology", icon: "📱" },
  { id: 143, lang: "he", text: "האינטרנט מהיר", category: "technology", icon: "🌐" },
  { id: 144, lang: "he", text: "היא שולחת דואר אלקטרוני", category: "technology", icon: "📧" },
  { id: 145, lang: "he", text: "אנחנו צופים בטלוויזיה", category: "technology", icon: "📺" },
  // ספורט
  { id: 146, lang: "he", text: "הוא משחק כדורסל", category: "sports", icon: "🏀" },
  { id: 147, lang: "he", text: "הם רצים בפארק", category: "sports", icon: "🏃‍♂️" },
  { id: 148, lang: "he", text: "אני שוחה בבריכה", category: "sports", icon: "🏊‍♂️" },
  { id: 149, lang: "he", text: "המשחק היה מרגש", category: "sports", icon: "🤩" },
  { id: 150, lang: "he", text: "היא ניצחה במרוץ", category: "sports", icon: "🏆" },
  // בריאות
  { id: 151, lang: "he", text: "שתה הרבה מים", category: "health", icon: "💧" },
  { id: 152, lang: "he", text: "אכול אוכל בריא", category: "health", icon: "🥗" },
  { id: 153, lang: "he", text: "הוא מרגיש חולה", category: "health", icon: "🤒" },
  { id: 154, lang: "he", text: "לך לרופא", category: "health", icon: "👨‍⚕️" },
  { id: 155, lang: "he", text: "אני צריך לנוח", category: "health", icon: "🛌" },
  // משפחה וחוויות
  { id: 156, lang: "he", text: "המשפחה שלי גדולה מאוד", category: "family", icon: "👨‍👩‍👧‍👦" },
  { id: 157, lang: "he", text: "הלכנו לגן החיות", category: "experiences", icon: "🐾" },
  { id: 158, lang: "he", text: "היה לי חלום נפלא", category: "experiences", icon: "💭" },
  { id: 159, lang: "he", text: "היא ביקרה את סבתה", category: "family", icon: "👵" },
  { id: 160, lang: "he", text: "הוא החבר הכי טוב שלי", category: "family", icon: "🤝" },
  // שאלות נוספות - יומיומי
  { id: 161, lang: "en", text: "Good evening everyone", category: "daily", icon: "🌙" },
  { id: 162, lang: "en", text: "Have a nice day", category: "daily", icon: "☀️" },
  { id: 163, lang: "en", text: "What time is it?", category: "daily", icon: "🕐" },
  { id: 164, lang: "en", text: "I need to go now", category: "daily", icon: "🏃‍♂️" },
  { id: 165, lang: "en", text: "Thank you very much", category: "daily", icon: "🙏" },
  { id: 166, lang: "en", text: "You are welcome", category: "daily", icon: "😊" },
  { id: 167, lang: "en", text: "Excuse me please", category: "daily", icon: "🤝" },
  { id: 168, lang: "en", text: "I am sorry", category: "daily", icon: "😔" },
  { id: 169, lang: "en", text: "That is okay", category: "daily", icon: "👍" },
  { id: 170, lang: "en", text: "I understand now", category: "daily", icon: "💡" },
  // טבע נוסף
  { id: 171, lang: "en", text: "The moon is beautiful tonight", category: "nature", icon: "🌙" },
  { id: 172, lang: "en", text: "The flowers are blooming", category: "nature", icon: "🌸" },
  { id: 173, lang: "en", text: "The wind is blowing", category: "nature", icon: "💨" },
  { id: 174, lang: "en", text: "The ocean is deep", category: "nature", icon: "🌊" },
  { id: 175, lang: "en", text: "The mountains are high", category: "nature", icon: "🏔️" },
  { id: 176, lang: "en", text: "The forest is quiet", category: "nature", icon: "🌲" },
  { id: 177, lang: "en", text: "The butterfly is colorful", category: "nature", icon: "🦋" },
  { id: 178, lang: "en", text: "The rainbow is bright", category: "nature", icon: "🌈" },
  { id: 179, lang: "en", text: "The snow is white", category: "nature", icon: "❄️" },
  { id: 180, lang: "en", text: "The grass is green", category: "nature", icon: "🌱" },
  // רגשות נוספים
  { id: 181, lang: "en", text: "I feel confident today", category: "emotions", icon: "💪" },
  { id: 182, lang: "en", text: "She looks worried", category: "emotions", icon: "😟" },
  { id: 183, lang: "en", text: "He seems confused", category: "emotions", icon: "😕" },
  { id: 184, lang: "en", text: "They are grateful", category: "emotions", icon: "🙏" },
  { id: 185, lang: "en", text: "I am curious about this", category: "emotions", icon: "🤔" },
  { id: 186, lang: "en", text: "She feels peaceful", category: "emotions", icon: "😌" },
  { id: 187, lang: "en", text: "He is determined", category: "emotions", icon: "😤" },
  { id: 188, lang: "en", text: "We are hopeful", category: "emotions", icon: "🌟" },
  { id: 189, lang: "en", text: "I am embarrassed", category: "emotions", icon: "😳" },
  { id: 190, lang: "en", text: "She is amazed", category: "emotions", icon: "😮" },
  // אוכל נוסף
  { id: 191, lang: "en", text: "The pizza is delicious", category: "food", icon: "🍕" },
  { id: 192, lang: "en", text: "I want some pasta", category: "food", icon: "🍝" },
  { id: 193, lang: "en", text: "The salad is fresh", category: "food", icon: "🥗" },
  { id: 194, lang: "en", text: "The coffee is hot", category: "food", icon: "☕" },
  { id: 195, lang: "en", text: "The bread is soft", category: "food", icon: "🍞" },
  { id: 196, lang: "en", text: "The cheese is tasty", category: "food", icon: "🧀" },
  { id: 197, lang: "en", text: "The fish is fresh", category: "food", icon: "🐟" },
  { id: 198, lang: "en", text: "The rice is white", category: "food", icon: "🍚" },
  { id: 199, lang: "en", text: "The juice is sweet", category: "food", icon: "🧃" },
  { id: 200, lang: "en", text: "The cake is beautiful", category: "food", icon: "🎂" },
  // שאלות נוספות בעברית - יומיומי
  { id: 161, lang: "he", text: "ערב טוב לכולם", category: "daily", icon: "🌙" },
  { id: 162, lang: "he", text: "יום נעים", category: "daily", icon: "☀️" },
  { id: 163, lang: "he", text: "מה השעה?", category: "daily", icon: "🕐" },
  { id: 164, lang: "he", text: "אני צריך ללכת עכשיו", category: "daily", icon: "🏃‍♂️" },
  { id: 165, lang: "he", text: "תודה רבה לך", category: "daily", icon: "🙏" },
  { id: 166, lang: "he", text: "אין בעיה", category: "daily", icon: "😊" },
  { id: 167, lang: "he", text: "סליחה בבקשה", category: "daily", icon: "🤝" },
  { id: 168, lang: "he", text: "אני מצטער", category: "daily", icon: "😔" },
  { id: 169, lang: "he", text: "זה בסדר", category: "daily", icon: "👍" },
  { id: 170, lang: "he", text: "אני מבין עכשיו", category: "daily", icon: "💡" },
  // טבע נוסף בעברית
  { id: 171, lang: "he", text: "הירח יפה הלילה", category: "nature", icon: "🌙" },
  { id: 172, lang: "he", text: "הפרחים פורחים", category: "nature", icon: "🌸" },
  { id: 173, lang: "he", text: "הרוח נושבת", category: "nature", icon: "💨" },
  { id: 174, lang: "he", text: "הים עמוק", category: "nature", icon: "🌊" },
  { id: 175, lang: "he", text: "ההרים גבוהים", category: "nature", icon: "🏔️" },
  { id: 176, lang: "he", text: "היער שקט", category: "nature", icon: "🌲" },
  { id: 177, lang: "he", text: "הפרפר צבעוני", category: "nature", icon: "🦋" },
  { id: 178, lang: "he", text: "הקשת בהירה", category: "nature", icon: "🌈" },
  { id: 179, lang: "he", text: "השלג לבן", category: "nature", icon: "❄️" },
  { id: 180, lang: "he", text: "הדשא ירוק", category: "nature", icon: "🌱" },
  // רגשות נוספים בעברית
  { id: 181, lang: "he", text: "אני מרגיש בטוח היום", category: "emotions", icon: "💪" },
  { id: 182, lang: "he", text: "היא נראית מודאגת", category: "emotions", icon: "😟" },
  { id: 183, lang: "he", text: "הוא נראה מבולבל", category: "emotions", icon: "😕" },
  { id: 184, lang: "he", text: "הם אסירי תודה", category: "emotions", icon: "🙏" },
  { id: 185, lang: "he", text: "אני סקרן לגבי זה", category: "emotions", icon: "🤔" },
  { id: 186, lang: "he", text: "היא מרגישה שלווה", category: "emotions", icon: "😌" },
  { id: 187, lang: "he", text: "הוא נחוש", category: "emotions", icon: "😤" },
  { id: 188, lang: "he", text: "אנחנו מלאי תקווה", category: "emotions", icon: "🌟" },
  { id: 189, lang: "he", text: "אני מתבייש", category: "emotions", icon: "😳" },
  { id: 190, lang: "he", text: "היא מופתעת", category: "emotions", icon: "😮" },
  // אוכל נוסף בעברית
  { id: 191, lang: "he", text: "הפיצה טעימה", category: "food", icon: "🍕" },
  { id: 192, lang: "he", text: "אני רוצה פסטה", category: "food", icon: "🍝" },
  { id: 193, lang: "he", text: "הסלט טרי", category: "food", icon: "🥗" },
  { id: 194, lang: "he", text: "הקפה חם", category: "food", icon: "☕" },
  { id: 195, lang: "he", text: "הלחם רך", category: "food", icon: "🍞" },
  { id: 196, lang: "he", text: "הגבינה טעימה", category: "food", icon: "🧀" },
  { id: 197, lang: "he", text: "הדג טרי", category: "food", icon: "🐟" },
  { id: 198, lang: "he", text: "האורז לבן", category: "food", icon: "🍚" },
  { id: 199, lang: "he", text: "המיץ מתוק", category: "food", icon: "🧃" },
  { id: 200, lang: "he", text: "העוגה יפה", category: "food", icon: "🎂" },
  // שאלות נוספות - בית ספר בעברית
  { id: 201, lang: "he", text: "התלמיד לומד", category: "school", icon: "📚" },
  { id: 202, lang: "he", text: "הספרייה שקטה", category: "school", icon: "📖" },
  { id: 203, lang: "he", text: "הבחינה קשה", category: "school", icon: "📝" },
  { id: 204, lang: "he", text: "העיפרון חד", category: "school", icon: "✏️" },
  { id: 205, lang: "he", text: "המחברת חדשה", category: "school", icon: "📓" },
  { id: 206, lang: "he", text: "הסרגל ארוך", category: "school", icon: "📏" },
  { id: 207, lang: "he", text: "המחשבון שימושי", category: "school", icon: "🧮" },
  { id: 208, lang: "he", text: "הילקוט כבד", category: "school", icon: "🎒" },
  { id: 209, lang: "he", text: "השולחן נקי", category: "school", icon: "🪑" },
  { id: 210, lang: "he", text: "הכיסא נוח", category: "school", icon: "💺" },
  // תחבורה בעברית
  { id: 211, lang: "he", text: "המכונית אדומה", category: "transport", icon: "🚗" },
  { id: 212, lang: "he", text: "האופנוע מהיר", category: "transport", icon: "🏍️" },
  { id: 213, lang: "he", text: "הסירה שטה", category: "transport", icon: "⛵" },
  { id: 214, lang: "he", text: "המסוק טס", category: "transport", icon: "🚁" },
  { id: 215, lang: "he", text: "המשאית גדולה", category: "transport", icon: "🚛" },
  { id: 216, lang: "he", text: "הרכבת התחתית מתחת לאדמה", category: "transport", icon: "🚇" },
  { id: 217, lang: "he", text: "הקורקינט חשמלי", category: "transport", icon: "🛴" },
  { id: 218, lang: "he", text: "הספינה ענקית", category: "transport", icon: "🚢" },
  { id: 219, lang: "he", text: "הטיל חזק", category: "transport", icon: "🚀" },
  { id: 220, lang: "he", text: "הסקייטבורד מגניב", category: "transport", icon: "🛹" },
  // טכנולוגיה בעברית
  { id: 221, lang: "he", text: "הטאבלט נייד", category: "technology", icon: "📱" },
  { id: 222, lang: "he", text: "המצלמה מצלמת תמונות", category: "technology", icon: "📷" },
  { id: 223, lang: "he", text: "האוזניות אלחוטיות", category: "technology", icon: "🎧" },
  { id: 224, lang: "he", text: "המדפסת עובדת", category: "technology", icon: "🖨️" },
  { id: 225, lang: "he", text: "המקלדת מקלידה", category: "technology", icon: "⌨️" },
  { id: 226, lang: "he", text: "העכבר לוחץ", category: "technology", icon: "🖱️" },
  { id: 227, lang: "he", text: "הרמקול רם", category: "technology", icon: "🔊" },
  { id: 228, lang: "he", text: "הסוללה נטענת", category: "technology", icon: "🔋" },
  { id: 229, lang: "he", text: "הוויי-פיי מחובר", category: "technology", icon: "📶" },
  { id: 230, lang: "he", text: "האפליקציה שימושית", category: "technology", icon: "📱" },
  // ספורט בעברית
  { id: 231, lang: "he", text: "כדור הכדורגל עגול", category: "sports", icon: "⚽" },
  { id: 232, lang: "he", text: "מחבט הטניס מוכן", category: "sports", icon: "🎾" },
  { id: 233, lang: "he", text: "מקל הגולף ארוך", category: "sports", icon: "⛳" },
  { id: 234, lang: "he", text: "מחבט הבייסבול מעץ", category: "sports", icon: "⚾" },
  { id: 235, lang: "he", text: "כדור הכדורעף קופץ", category: "sports", icon: "🏐" },
  { id: 236, lang: "he", text: "בריכת השחייה עמוקה", category: "sports", icon: "🏊‍♂️" },
  { id: 237, lang: "he", text: "החדר כושר פתוח", category: "sports", icon: "🏋️‍♂️" },
  { id: 238, lang: "he", text: "מזרן היוגה רך", category: "sports", icon: "🧘‍♀️" },
  { id: 239, lang: "he", text: "נעלי ההליכה עמידות", category: "sports", icon: "🥾" },
  { id: 240, lang: "he", text: "קסדת הרכיבה בטוחה", category: "sports", icon: "🚴‍♂️" },
  // בריאות בעברית
  { id: 241, lang: "he", text: "התרופה עוזרת", category: "health", icon: "💊" },
  { id: 242, lang: "he", text: "הפלסטר נקי", category: "health", icon: "🩹" },
  { id: 243, lang: "he", text: "המדחום מדויק", category: "health", icon: "🌡️" },
  { id: 244, lang: "he", text: "הסטטוסקופ מאזין", category: "health", icon: "🩺" },
  { id: 245, lang: "he", text: "הבית חולים קרוב", category: "health", icon: "🏥" },
  { id: 246, lang: "he", text: "האחות דואגת", category: "health", icon: "👩‍⚕️" },
  { id: 247, lang: "he", text: "הרופא שיניים עדין", category: "health", icon: "🦷" },
  { id: 248, lang: "he", text: "מברשת השיניים חדשה", category: "health", icon: "🪥" },
  { id: 249, lang: "he", text: "הויטמינים חשובים", category: "health", icon: "💊" },
  { id: 250, lang: "he", text: "התרגיל מועיל", category: "health", icon: "💪" },
  // שאלות נוספות באנגלית - בית ספר
  { id: 251, lang: "en", text: "The student is studying", category: "school", icon: "📚" },
  { id: 252, lang: "en", text: "The library is quiet", category: "school", icon: "📖" },
  { id: 253, lang: "en", text: "The exam is difficult", category: "school", icon: "📝" },
  { id: 254, lang: "en", text: "The pencil is sharp", category: "school", icon: "✏️" },
  { id: 255, lang: "en", text: "The notebook is new", category: "school", icon: "📓" },
  { id: 256, lang: "en", text: "The ruler is long", category: "school", icon: "📏" },
  { id: 257, lang: "en", text: "The calculator is useful", category: "school", icon: "🧮" },
  { id: 258, lang: "en", text: "The backpack is heavy", category: "school", icon: "🎒" },
  { id: 259, lang: "en", text: "The desk is clean", category: "school", icon: "🪑" },
  { id: 260, lang: "en", text: "The chair is comfortable", category: "school", icon: "💺" },
  // תחבורה באנגלית
  { id: 261, lang: "en", text: "The car is red", category: "transport", icon: "🚗" },
  { id: 262, lang: "en", text: "The motorcycle is fast", category: "transport", icon: "🏍️" },
  { id: 263, lang: "en", text: "The boat is sailing", category: "transport", icon: "⛵" },
  { id: 264, lang: "en", text: "The helicopter is flying", category: "transport", icon: "🚁" },
  { id: 265, lang: "en", text: "The truck is big", category: "transport", icon: "🚛" },
  { id: 266, lang: "en", text: "The subway is underground", category: "transport", icon: "🚇" },
  { id: 267, lang: "en", text: "The scooter is electric", category: "transport", icon: "🛴" },
  { id: 268, lang: "en", text: "The ship is huge", category: "transport", icon: "🚢" },
  { id: 269, lang: "en", text: "The rocket is powerful", category: "transport", icon: "🚀" },
  { id: 270, lang: "en", text: "The skateboard is cool", category: "transport", icon: "🛹" },
  // טכנולוגיה באנגלית
  { id: 271, lang: "en", text: "The tablet is portable", category: "technology", icon: "📱" },
  { id: 272, lang: "en", text: "The camera takes photos", category: "technology", icon: "📷" },
  { id: 273, lang: "en", text: "The headphones are wireless", category: "technology", icon: "🎧" },
  { id: 274, lang: "en", text: "The printer is working", category: "technology", icon: "🖨️" },
  { id: 275, lang: "en", text: "The keyboard is typing", category: "technology", icon: "⌨️" },
  { id: 276, lang: "en", text: "The mouse is clicking", category: "technology", icon: "🖱️" },
  { id: 277, lang: "en", text: "The speaker is loud", category: "technology", icon: "🔊" },
  { id: 278, lang: "en", text: "The battery is charging", category: "technology", icon: "🔋" },
  { id: 279, lang: "en", text: "The wifi is connected", category: "technology", icon: "📶" },
  { id: 280, lang: "en", text: "The app is useful", category: "technology", icon: "📱" },
  // ספורט באנגלית
  { id: 281, lang: "en", text: "The soccer ball is round", category: "sports", icon: "⚽" },
  { id: 282, lang: "en", text: "The tennis racket is ready", category: "sports", icon: "🎾" },
  { id: 283, lang: "en", text: "The golf club is long", category: "sports", icon: "⛳" },
  { id: 284, lang: "en", text: "The baseball bat is wooden", category: "sports", icon: "⚾" },
  { id: 285, lang: "en", text: "The volleyball is bouncing", category: "sports", icon: "🏐" },
  { id: 286, lang: "en", text: "The swimming pool is deep", category: "sports", icon: "🏊‍♂️" },
  { id: 287, lang: "en", text: "The gym is open", category: "sports", icon: "🏋️‍♂️" },
  { id: 288, lang: "en", text: "The yoga mat is soft", category: "sports", icon: "🧘‍♀️" },
  { id: 289, lang: "en", text: "The hiking boots are sturdy", category: "sports", icon: "🥾" },
  { id: 290, lang: "en", text: "The cycling helmet is safe", category: "sports", icon: "🚴‍♂️" },
  // בריאות באנגלית
  { id: 291, lang: "en", text: "The medicine is helpful", category: "health", icon: "💊" },
  { id: 292, lang: "en", text: "The bandage is clean", category: "health", icon: "🩹" },
  { id: 293, lang: "en", text: "The thermometer is accurate", category: "health", icon: "🌡️" },
  { id: 294, lang: "en", text: "The stethoscope is listening", category: "health", icon: "🩺" },
  { id: 295, lang: "en", text: "The hospital is nearby", category: "health", icon: "🏥" },
  { id: 296, lang: "en", text: "The nurse is caring", category: "health", icon: "👩‍⚕️" },
  { id: 297, lang: "en", text: "The dentist is gentle", category: "health", icon: "🦷" },
  { id: 298, lang: "en", text: "The toothbrush is new", category: "health", icon: "🪥" },
  { id: 299, lang: "en", text: "The vitamins are important", category: "health", icon: "💊" },
  { id: 300, lang: "en", text: "The exercise is beneficial", category: "health", icon: "💪" },
];

const difficulties = [
  { key: "easy", label: "קל", count: 20 },
  { key: "medium", label: "בינוני", count: 30 },
  { key: "hard", label: "קשה", count: 40 },
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

// תגבור חכם
function getMistakeStats() {
  try {
    return JSON.parse(localStorage.getItem('rl-mistakes') || '{}');
  } catch {
    return {};
  }
}
function addMistake(id: string) {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('rl-mistakes', JSON.stringify(stats));
}

// קטגוריות אפשריות
const CATEGORIES = [
  { key: "all", label: "הכל", icon: "🌈" },
  { key: "daily", label: "יומיומי", icon: "☀️" },
  { key: "nature", label: "טבע", icon: "🌳" },
  { key: "emotions", label: "רגשות", icon: "😃" },
  { key: "food", label: "אוכל", icon: "🍎" },
  { key: "health", label: "בריאות", icon: "🧼" },
  { key: "school", label: "בית ספר", icon: "🏫" },
  { key: "transport", label: "תחבורה", icon: "🚌" },
  { key: "technology", label: "טכנולוגיה", icon: "💻" },
  { key: "sports", label: "ספורט", icon: "🏀" },
  { key: "family", label: "משפחה", icon: "👨‍👩‍👧‍👦" },
  { key: "holidays", label: "חגים", icon: "🎉" },
  { key: "experiences", label: "חוויות", icon: "🌟" },
];

// פונקציית חישוב מרחק לֶוֶנְשְטֵיין (Levenshtein distance)
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

export default function RecordListenWrapper() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <RecordListen />
    </Suspense>
  );
}

function RecordListen() {
  const searchParams = useSearchParams();
  const levelParam = searchParams?.get('level') || 'easy';
  const mappedLevel = levelMap[levelParam] || 'easy';
  const [difficulty] = useState(mappedLevel);
  const [lang, setLang] = useState<'en' | 'he'>('en');
  const [questions, setQuestions] = useState<typeof SENTENCES>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [checking, setChecking] = useState(false);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [stats, setStats] = useState({ total: 0, correct: 0, mistakes: 0 });
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [savedRecordings, setSavedRecordings] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopRecordingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started]);

  useEffect(() => {
    const diff = difficulties.find((d) => d.key === difficulty)!;
    setQuestions(pickQuestions(SENTENCES, lang, diff.count, category));
    setCurrent(0);
    setScore(0);
    setTimer(0);
    setFinished(false);
    setFeedback(null);
    setStarted(false);
    setUserTranscript('');
    setRecording(false);
    setListening(false);
    setChecking(false);
  }, [difficulty, lang, category]);

  const speak = (text: string) => {
    setListening(true);
    const synth = window.speechSynthesis;
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = lang === 'he' ? 'he-IL' : 'en-US';
    utter.onend = () => setListening(false);
    synth.speak(utter);
  };

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
    // הקלטה עם MediaRecorder
    let mediaRecorder: MediaRecorder;
    let chunks: BlobPart[] = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      streamRef.current = stream;
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // שמירה ל-localStorage (עד 3 אחרונות)
        try {
          const prev = JSON.parse(localStorage.getItem('rl-recordings') || '[]');
          const updated = [url, ...prev].slice(0, 3);
          setSavedRecordings(updated);
          localStorage.setItem('rl-recordings', JSON.stringify(updated));
        } catch {}
      };
      mediaRecorder.start();
      // SpeechRecognition
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = lang === 'he' ? 'he-IL' : 'en-US';
      recognition.continuous = true; // המשך להקשיב גם אחרי תוצאה ראשונה
      recognition.interimResults = true; // קבל תוצאות חלקיות כדי לדעת מתי המשתמש מסיים
      recognition.maxAlternatives = 1;
      
      let silenceTimeout: NodeJS.Timeout | null = null;
      let maxTimeout: NodeJS.Timeout | null = null;
      let lastResultTime = Date.now();
      let finalTranscript = '';
      let isStopped = false;
      const SILENCE_DURATION = 3000; // חכה 3 שניות של שתיקה לפני עצירה (הגדלנו את הזמן)
      const MIN_RECORDING_TIME = 2000; // זמן מינימלי של הקלטה - לפחות 2 שניות
      const recordingStartTime = Date.now();
      
      const stopRecordingAndCheck = () => {
        if (isStopped) return;
        isStopped = true;
        
        if (silenceTimeout) {
          clearTimeout(silenceTimeout);
          silenceTimeout = null;
        }
        if (maxTimeout) {
          clearTimeout(maxTimeout);
          maxTimeout = null;
        }
        
        try {
          recognition.stop();
        } catch (e) {
          console.log('Error stopping recognition:', e);
        }
        setRecording(false);
        setChecking(true);
        
        // חכה קצת כדי לוודא שקיבלנו את כל התוצאות
        setTimeout(() => {
          const transcriptToCheck = finalTranscript.trim();
          if (transcriptToCheck) {
            checkAnswer(transcriptToCheck);
          } else {
            setFeedback('לא זוהה דיבור - נסה שוב');
            setChecking(false);
          }
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }, 300);
      };
      
      // שמור את פונקציית העצירה ב-ref כדי שנוכל לקרוא לה מחוץ
      stopRecordingRef.current = stopRecordingAndCheck;
      
      recognition.onresult = (event: any) => {
        if (isStopped) return;
        
        let interimTranscript = '';
        let final = '';
        let hasNewFinal = false;
        let hasInterim = false;
        
        // עבור על כל התוצאות מהאינדקס האחרון
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
            hasNewFinal = true;
            lastResultTime = Date.now(); // עדכן זמן של תוצאה אחרונה
          } else {
            interimTranscript += transcript;
            hasInterim = true;
            lastResultTime = Date.now(); // גם תוצאות חלקיות מעדכנות את הזמן
          }
        }
        
        // עדכן את הטקסט הסופי אם יש תוצאות סופיות
        if (hasNewFinal) {
          finalTranscript += final;
        }
        
        // הצג את הטקסט (סופי + חלקי)
        const displayText = finalTranscript.trim() + (interimTranscript ? ' ' + interimTranscript : '');
        setUserTranscript(displayText);
        
        // בטל את ה-timeout הקודם בכל פעם שיש תוצאה חדשה (סופית או חלקית)
        if (silenceTimeout) {
          clearTimeout(silenceTimeout);
          silenceTimeout = null;
        }
        
        // אם יש תוצאה חלקית, המשתמש עדיין מדבר - אל תעצור ולא תתחיל לספור שתיקה
        if (hasInterim) {
          // המשתמש עדיין מדבר, רק עדכן את התצוגה
          return;
        }
        
        // אם יש תוצאה סופית חדשה ולא יש תוצאות חלקיות, זה אומר שהמשתמש הפסיק לדבר
        // אבל חכה קצת לפני שתספור שתיקה - אולי הוא רק עושה הפסקה קצרה
        if (hasNewFinal && !hasInterim && finalTranscript.trim()) {
          // בדוק שהזמן המינימלי עבר לפני שנתחיל לספור שתיקה
          const elapsed = Date.now() - recordingStartTime;
          if (elapsed < MIN_RECORDING_TIME) {
            // זמן מינימלי לא עבר, חכה עוד קצת לפני שתספור שתיקה
            return;
          }
          
          // התחל timeout חדש לשתיקה - רק אחרי שיש תוצאה סופית ולא יש תוצאות חלקיות
          // וזה אומר שהמשתמש הפסיק לדבר (או עשה הפסקה קצרה)
          silenceTimeout = setTimeout(() => {
            // בדוק שוב שאין תוצאות חלקיות - אם יש, אל תעצור
            if (!isStopped && finalTranscript.trim()) {
              // בדוק שהזמן האחרון של תוצאה עדיין ישן מספיק
              const timeSinceLastResult = Date.now() - lastResultTime;
              if (timeSinceLastResult >= SILENCE_DURATION) {
                stopRecordingAndCheck();
              }
            }
          }, SILENCE_DURATION);
        }
      };
      
      recognition.onerror = (event: any) => {
        if (isStopped) return;
        
        const errorType = event.error || 'unknown';
        console.log('Speech recognition error:', errorType);
        
        // התעלם משגיאות 'no-speech' ו-'aborted' - הן לא אמיתיות
        // 'no-speech' יכול לקרות גם כשהמשתמש רק מתחיל לדבר
        // 'aborted' יכול לקרות כשהמערכת עוצרת וצריכה להתחיל מחדש
        if (errorType === 'no-speech' || errorType === 'aborted') {
          // אל תעשה כלום - תן למערכת להמשיך להקשיב
          // מנגנון השתיקה או timeout מקסימלי יטפלו בעצירה
          return;
        }
        
        // אם זו שגיאה רצינית אחרת (לא 'no-speech' או 'aborted')
        if (errorType !== 'no-speech' && errorType !== 'aborted') {
          // רק עבור שגיאות רציניות - עצור את ההקלטה
          console.error('Serious speech recognition error:', errorType);
          setFeedback('שגיאה בהקלטה');
          if (silenceTimeout) clearTimeout(silenceTimeout);
          if (maxTimeout) clearTimeout(maxTimeout);
          isStopped = true;
          setRecording(false);
          try {
            recognition.stop();
          } catch (e) {
            console.log('Error stopping recognition:', e);
          }
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };
      
      // Timeout מקסימלי של 30 שניות
      maxTimeout = setTimeout(() => {
        if (!isStopped && finalTranscript.trim()) {
          stopRecordingAndCheck();
        } else if (!isStopped) {
          setFeedback('זמן ההקלטה הסתיים - נסה שוב');
          isStopped = true;
          if (silenceTimeout) clearTimeout(silenceTimeout);
          setRecording(false);
          recognition.stop();
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          stream.getTracks().forEach(track => track.stop());
        }
      }, 30000);
      
      recognition.onend = () => {
        if (isStopped) return;
        
        // אל תעשה כלום ב-onend - רק נסה להמשיך להקשיב
        // העצירה תתבצע רק דרך מנגנון השתיקה או timeout מקסימלי או כפתור ידני
        const elapsed = Date.now() - recordingStartTime;
        
        // אם עברו יותר מ-30 שניות, אל תנסה להתחיל מחדש
        if (elapsed >= 30000) {
          return;
        }
        
        // תמיד נסה להמשיך להקשיב - גם אם יש תוצאה חלקית
        // מנגנון השתיקה יטפל בעצירה כשיש תוצאה סופית
        if (!isStopped) {
          try {
            // נסה להתחיל מחדש את ההכרה אחרי זמן קצר
            setTimeout(() => {
              if (!isStopped && recognition && recognition.state !== 'listening') {
                try {
                  recognition.start();
                } catch (e) {
                  // אם לא הצלחנו להתחיל מחדש, זה בסדר - נסה שוב אחרי זמן
                  console.log('Could not restart recognition, will retry:', e);
                  setTimeout(() => {
                    if (!isStopped && recognition && recognition.state !== 'listening') {
                      try {
                        recognition.start();
                      } catch (e2) {
                        console.log('Retry failed, this is ok:', e2);
                      }
                    }
                  }, 500);
                }
              }
            }, 100);
          } catch (e) {
            console.log('Error in onend (this is ok):', e);
          }
        }
      };
      
      recognition.start();
    }).catch(() => {
      setFeedback('אין הרשאת מיקרופון');
      setRecording(false);
    });
  };

  const checkAnswer = (transcript: string) => {
    setChecking(false);
    const correct = questions[current].text.trim().toLowerCase();
    const user = transcript.trim().toLowerCase();
    // חישוב דמיון
    const dist = levenshtein(user, correct);
    const maxLen = Math.max(user.length, correct.length);
    const sim = maxLen === 0 ? 1 : 1 - dist / maxLen;
    setSimilarity(sim);
    let feedbackMsg = '';
    if (sim >= 0.85) feedbackMsg = 'מעולה!';
    else if (sim >= 0.6) feedbackMsg = 'כמעט! נסה שוב';
    else feedbackMsg = 'נסה שוב';
    setFeedback(feedbackMsg);
    setStats(s => ({
      total: s.total + 1,
      correct: s.correct + (sim >= 0.85 ? 1 : 0),
      mistakes: s.mistakes + (sim >= 0.85 ? 0 : 1)
    }));
    if (sim >= 0.85) {
      setScore((s) => s + 10);
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play();
      }
      setTimeout(() => {
        setFeedback(null);
        setUserTranscript('');
        setSimilarity(null);
        if (current === questions.length - 1) {
          setFinished(true);
        } else {
          setCurrent((c) => c + 1);
        }
      }, 1200);
    } else {
      setScore((s) => Math.max(0, s - 2)); // עונש של 2 נקודות על טעות
      addMistake(questions[current].id.toString());
      if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play();
      }
      setTimeout(() => {
        setFeedback(null);
        setSimilarity(null);
      }, 1200);
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
  };

  const restart = () => {
    setStarted(false);
    setCurrent(0);
    setScore(0);
    setTimer(0);
    setFinished(false);
    setFeedback(null);
    setUserTranscript('');
  };

  const stopRecordingManually = () => {
    if (stopRecordingRef.current) {
      stopRecordingRef.current();
    } else {
      // אם אין פונקציית עצירה, נסה לעצור ידנית
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Error stopping recognition:', e);
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setRecording(false);
    }
  };

  const isRTL = lang === 'he';
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;

  return (
    <main className={`min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-green-200 flex flex-col items-center justify-center p-4 ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <audio ref={successAudio} src="/voise/הצלחה.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/כשלון.dat" preload="auto" />
      <div className="max-w-2xl w-full mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8">
        {/* Progress Bar */}
        {started && questions.length > 0 && (
          <div className="w-full h-3 bg-blue-100 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 text-center drop-shadow-lg flex items-center gap-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 text-white text-3xl shadow-lg mr-2">🎤</span>
            הקלטה והאזנה
            <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xl shadow bg-gradient-to-r from-green-400 to-green-600 text-white ml-4`}>
              <span className="text-2xl">{lang === 'he' ? '🟣' : '🔵'}</span> {difficulties.find(d=>d.key===difficulty)?.label}
            </span>
          </h1>
        </div>
        {!started && (
          <div className="flex flex-col gap-4 items-center mb-8">
            <div className="flex gap-4 mb-4">
              <button onClick={() => setLang('en')} className={`px-6 py-2 rounded-full font-bold shadow text-lg ${lang==='en'?'bg-green-600 text-white scale-105':'bg-white text-green-700 hover:bg-green-100'}`}>English</button>
              <button onClick={() => setLang('he')} className={`px-6 py-2 rounded-full font-bold shadow text-lg ${lang==='he'?'bg-pink-600 text-white scale-105':'bg-white text-pink-700 hover:bg-pink-100'}`}>עברית</button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              {CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setCategory(cat.key)} className={`px-4 py-2 rounded-full font-bold shadow text-md flex items-center gap-2 ${category===cat.key?'bg-blue-600 text-white scale-105':'bg-white text-blue-700 hover:bg-blue-100'}`}>
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
            <button onClick={startGame} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4">התחל</button>
          </div>
        )}
        {started && !finished && questions.length > 0 && (
          <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-purple-700 shadow flex items-center gap-2"><span className="text-green-500 text-2xl">★</span> ניקוד: {score}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-green-700 shadow flex items-center gap-2"><span className="text-blue-500 text-2xl">#️⃣</span> שאלה: {current+1}/{questions.length}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-pink-700 shadow flex items-center gap-2"><span className="text-pink-500 text-2xl">⏰</span> זמן: {timer} שניות</div>
            </div>
            <div className="mb-6">
              <div className="text-xl font-bold text-center mb-4 animate-fade-in-slow flex items-center justify-center gap-2">
                <button onClick={() => speak(questions[current].text)} disabled={listening} className="bg-gradient-to-r from-blue-400 to-green-400 text-white px-6 py-2 rounded-full font-bold shadow hover:from-green-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-2 text-lg mb-2">
                  <span className="text-2xl">🔊</span> השמע משפט
                </button>
                {questions[current].text}
                {getMistakeStats()[questions[current].id] > 0 && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-bold align-middle animate-pulse">💡 חיזוק אישי</span>
                )}
              </div>
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="flex gap-4 items-center">
                  <button
                    onClick={startRecording}
                    disabled={recording || listening || checking}
                    className={`px-10 py-4 rounded-full font-bold text-2xl shadow transition-all duration-200 flex items-center gap-2
                      ${recording ? 'bg-yellow-400 text-white animate-pulse' : 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:scale-105'}`}
                  >
                    <span className="text-2xl">🎙️</span> {recording ? 'מקליט...' : 'הקלט' }
                  </button>
                  {recording && (
                    <button
                      onClick={stopRecordingManually}
                      className="px-8 py-4 rounded-full font-bold text-xl shadow transition-all duration-200 flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 hover:scale-105"
                    >
                      <span className="text-2xl">⏹️</span> עצור
                    </button>
                  )}
                </div>
                {userTranscript && (
                  <div className="text-center text-lg font-bold text-blue-700 bg-blue-50 rounded-xl px-4 py-2 shadow">
                    הקלטה שלך: {userTranscript}
                    {similarity !== null && (
                      <span className="ml-2 text-purple-700">({Math.round(similarity*100)}% התאמה)</span>
                    )}
                  </div>
                )}
              </div>
              {audioUrl && (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <audio src={audioUrl} controls className="w-full max-w-xs" />
                  <button onClick={() => { const a = new Audio(audioUrl); a.play(); }} className="bg-gradient-to-r from-purple-400 to-blue-400 text-white px-6 py-2 rounded-full font-bold shadow hover:from-blue-400 hover:to-purple-400 transition-all duration-200 flex items-center gap-2 text-lg">
                    <span className="text-2xl">🔁</span> האזן להקלטה שלי
                  </button>
                </div>
              )}
              {savedRecordings.length > 0 && (
                <div className="mt-4">
                  <div className="font-bold text-blue-700 mb-2">הקלטות אחרונות:</div>
                  <div className="flex flex-wrap gap-2">
                    {savedRecordings.map((url, i) => (
                      <audio key={i} src={url} controls className="w-32" />
                    ))}
                  </div>
                </div>
              )}
              {feedback && (
                <div className={`text-center mb-4 text-2xl font-bold ${feedback==='נכון!'?'text-green-600':'text-red-500'} animate-fade-in`}>{feedback}</div>
              )}
            </div>
          </>
        )}
        {finished && (
          <div className="text-center mt-6 animate-fade-in">
            <div className="text-2xl font-bold text-purple-700 mb-4 flex items-center justify-center gap-2"><span className="text-green-500 text-3xl">🏆</span> כל הכבוד! סיימת את כל המשפטים 🎉</div>
            <div className="text-lg font-bold text-green-700 mb-2 flex items-center justify-center gap-2"><span className="text-blue-500 text-2xl">★</span> ניקוד סופי: {score} | <span className="text-pink-500 text-2xl">⏰</span> זמן: {timer} שניות</div>
            <div className="text-md font-bold text-purple-700 mb-2 flex items-center justify-center gap-2">הישגים: {stats.correct} נכונים, {stats.mistakes} טעויות, {stats.total} סה"כ</div>
            
            <button onClick={restart} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4 flex items-center gap-2"><span className="text-2xl">🔄</span> שחק שוב</button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fade-in-slow { from{opacity:0;} to{opacity:1;} }
        .animate-fade-in-slow { animation: fade-in-slow 1.5s; }
      `}</style>
    </main>
  );
}

function pickQuestions(all: any[], lang: string, count: number, category?: string) {
  let pool = all.filter(s => s.lang === lang);
  if (category && category !== "all") pool = pool.filter(s => s.category === category);
  const stats = getMistakeStats();
  const sorted = [...pool].sort((a, b) => (stats[b.id] || 0) - (stats[a.id] || 0));
  const boosted = sorted.filter(s => stats[s.id] > 0).slice(0, 5);
  const rest = pool.filter(s => !boosted.includes(s));
  const randomRest = rest.sort(() => Math.random() - 0.5).slice(0, count - boosted.length);
  return [...boosted, ...randomRest].sort(() => Math.random() - 0.5);
} 