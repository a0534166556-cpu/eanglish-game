# דף המילים הנלמדות - תיעוד

## סקירה כללית
דף המילים הנלמדות מאפשר למשתמשים לראות את כל המילים והביטויים שלמדו מכל המשחקים השונים במערכת.

## מיקום
- **קובץ**: `app/learned-words/page.tsx`
- **URL**: `/learned-words`
- **גישה**: דרך הפרופיל בלבד (דורש התחברות)

## תכונות עיקריות

### 1. סטטיסטיקות כלליות
- **סה"כ מילים נלמדות**: מספר המילים הכולל שלמד המשתמש
- **דיוק ממוצע**: אחוז הדיוק הממוצע בכל המילים
- **משחקים שיחקו**: מספר המשחקים השונים ששיחק
- **מילים מושלמות**: מילים עם דיוק של 80% ומעלה

### 2. סינון ומיון
- **סינון לפי משחק**: אפשרות לראות מילים ממשחק ספציפי
- **סינון לפי רמה**: קל, בינוני, קשה, אקסטרים
- **מיון**: לפי תאריך, דיוק, תדירות צפייה, או אלפביתי

### 3. סטטיסטיקות לפי משחק
- תצוגה של סטטיסטיקות מפורטות לכל משחק
- מספר מילים נלמדות, מילים נכונות, ואחוז דיוק

### 4. רשימת מילים מפורטת
כל מילה כוללת:
- **המילה באנגלית**
- **תרגום/הסבר בעברית**
- **רמת קושי** (עם צבעים)
- **משחק ממנו נלמדה**
- **סטטיסטיקות אישיות**:
  - מספר פעמים שנצפתה
  - מספר פעמים שנענתה נכון
  - אחוז דיוק
- **תאריך למידה**

## מקורות נתונים

הדף טוען נתונים מ-localStorage מהמשחקים השונים:
- `fill-blanks-words` - השלמת מילים
- `word-clash-words` - קרב זוגי - מילים
- `multiple-choice-words` - בחירה מרובה
- `true-false-words` - נכון/לא נכון
- `picture-description-words` - תיאור תמונה
- `sentence-builder-words` - בניית משפטים
- `matching-pairs-words` - זוגות תואמים
- `listening-words` - האזנה
- `pronunciation-words` - הגייה
- `mixed-quiz-words` - חידון מעורב

## עיצוב ו-UX

### צבעי רמות קושי
- **קל**: ירוק (`bg-green-100 text-green-800`)
- **בינוני**: צהוב (`bg-yellow-100 text-yellow-800`)
- **קשה**: כתום (`bg-orange-100 text-orange-800`)
- **אקסטרים**: אדום (`bg-red-100 text-red-800`)

### צבעי דיוק
- **80%+**: ירוק (`text-green-600`)
- **60-79%**: צהוב (`text-yellow-600`)
- **מתחת ל-60%**: אדום (`text-red-600`)

### רספונסיביות
- **Mobile**: עמודה אחת
- **Tablet**: 2-3 עמודות
- **Desktop**: 4 עמודות לסטטיסטיקות

## אינטגרציה עם הפרופיל

### קישור בפרופיל
נוסף קישור חדש בפרופיל:
```tsx
<Link href="/learned-words" className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
  <div className="text-4xl mb-4">📚</div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">מילים נלמדות</h3>
  <p className="text-gray-600">צפו בכל המילים שלמדתם</p>
</Link>
```

### עדכון פריסה
הפריסה של Quick Actions עודכנה מ-3 עמודות ל-4:
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

## הודעות למשתמש

### אין מילים נלמדות
אם המשתמש עדיין לא למד מילים, מוצגת הודעה עם:
- אייקון 📚
- הודעה "עדיין לא למדת מילים"
- הסבר על איך להתחיל
- כפתור "לך למשחקים"

### טעינה
בזמן טעינת הנתונים מוצג:
- ספינר אנימציה
- הודעה "טוען מילים נלמדות..."

## ביצועים

### אופטימיזציות
- טעינה אסינכרונית של נתונים
- סינון ומיון בצד הלקוח
- שימוש ב-useMemo למיון (אפשר להוסיף)

### זיכרון
- הנתונים נטענים מ-localStorage ולא מבסיס הנתונים
- אין בקשות API נוספות

## אפשרויות עתידיות

### שיפורים אפשריים
1. **ייצוא נתונים**: אפשרות לייצא את המילים הנלמדות לקובץ
2. **חיפוש**: חיפוש מילים ספציפיות
3. **סנכרון**: סנכרון עם בסיס הנתונים
4. **התקדמות**: מעקב אחר התקדמות למידה
5. **תרגול**: אפשרות לתרגל מילים חלשות
6. **סטטיסטיקות מתקדמות**: גרפים ותרשימים

### אינטגרציות נוספות
1. **מערכת הישגים**: הישגים על למידת מילים
2. **מערכת רמות**: התקדמות רמה על בסיס מילים נלמדות
3. **המלצות**: המלצות על מילים לתרגול

## טסטים

### בדיקות נדרשות
1. **טעינת נתונים**: וידוא שהנתונים נטענים נכון
2. **סינון**: בדיקת כל אפשרויות הסינון
3. **מיון**: בדיקת כל אפשרויות המיון
4. **רספונסיביות**: בדיקה על מכשירים שונים
5. **משתמש לא מחובר**: הפניה לעמוד התחברות

### נתוני בדיקה
ניתן ליצור נתוני בדיקה ב-localStorage:
```javascript
// דוגמה לנתוני בדיקה
localStorage.setItem('fill-blanks-words', JSON.stringify([
  {
    word: 'apple',
    translation: 'תפוח',
    difficulty: 'easy',
    learnedAt: new Date().toISOString(),
    timesSeen: 5,
    timesCorrect: 4,
    accuracy: 80
  }
]));
```

## סיכום

דף המילים הנלמדות מספק חוויית משתמש מעולה למעקב אחר התקדמות הלמידה, עם סטטיסטיקות מפורטות, סינון ומיון מתקדמים, ועיצוב רספונסיבי. הדף מושלם למערכת הלמידה ומאפשר למשתמשים לראות את ההתקדמות שלהם בצורה ויזואלית ומובנת.


