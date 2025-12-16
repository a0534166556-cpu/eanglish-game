# 📧 מדריך הגדרת מערכת מייל

## 🎯 מה המערכת כוללת

### **📨 סוגי מיילים:**
1. **ברוכים הבאים** - למשתמשים חדשים
2. **תשלום אושר** - אחרי תשלום מוצלח
3. **תשלום נכשל** - אחרי תשלום כושל
4. **איפוס סיסמה** - עם קישור איפוס
5. **פג תוקף מנוי** - התראה לפני פג תוקף

---

## 🔧 הגדרת Gmail (מומלץ)

### **1️⃣ הפעלת 2-Factor Authentication:**
1. לך ל-[Google Account](https://myaccount.google.com/)
2. בחר **Security** (אבטחה)
3. הפעל **2-Step Verification**
4. עקוב אחר ההוראות

### **2️⃣ יצירת App Password:**
1. ב-Google Account → **Security**
2. בחר **2-Step Verification**
3. גלול למטה ל-**App passwords**
4. בחר **Mail** ו-**Other (Custom name)**
5. כתוב "Word Clash"
6. **העתק את הסיסמה שנוצרה!** (16 תווים)

### **3️⃣ עדכון משתני סביבה:**
צור קובץ `.env.local`:

```env
# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-app-password"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🧪 בדיקת המערכת

### **1️⃣ הרץ את השרת:**
```bash
npm run dev
```

### **2️⃣ לך לדף הבדיקה:**
```
http://localhost:3000/admin/email-test
```

### **3️⃣ בדוק כל סוג מייל:**
- בחר סוג מייל
- מלא את הפרטים
- לחץ "שלח מייל בדיקה"
- בדוק את תיבת המייל

---

## 🔧 הגדרת ספקי מייל אחרים

### **Outlook/Hotmail:**
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
```

### **Yahoo:**
```env
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT="587"
SMTP_USER="your-email@yahoo.com"
SMTP_PASS="your-app-password"
```

### **SendGrid (מומלץ לפרודקשן):**
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

---

## 🚀 שימוש בקוד

### **שליחת מייל ברוכים הבאים:**
```typescript
import { sendWelcomeEmail } from '@/lib/email';

await sendWelcomeEmail('user@example.com', 'שם המשתמש');
```

### **שליחת אישור תשלום:**
```typescript
import { sendPaymentConfirmationEmail } from '@/lib/email';

await sendPaymentConfirmationEmail(
  'user@example.com', 
  'premium', 
  19.90, 
  'ILS'
);
```

### **שליחת איפוס סיסמה:**
```typescript
import { sendPasswordResetEmail } from '@/lib/email';

await sendPasswordResetEmail('user@example.com', 'reset-token-123');
```

---

## 🛠️ פתרון בעיות

### **❌ "Authentication failed":**
- בדוק שהסיסמה נכונה
- ודא שהפעלת 2FA
- נסה App Password חדש

### **❌ "Connection timeout":**
- בדוק את ה-SMTP_HOST
- בדוק את ה-SMTP_PORT
- בדוק את החיבור לאינטרנט

### **❌ מיילים לא מגיעים:**
- בדוק את תיקיית הספאם
- ודא שהכתובת נכונה
- בדוק את הלוגים בקונסול

### **❌ "Invalid login":**
- בדוק את שם המשתמש
- ודא שהפעלת "Less secure app access"
- נסה App Password

---

## 📊 מעקב וסטטיסטיקות

### **לוגים:**
כל שליחת מייל נרשמת בקונסול:
```
Welcome email sent to: user@example.com
Payment confirmation email sent to: user@example.com
```

### **סטטיסטיקות:**
- מספר מיילים שנשלחו
- שיעור הצלחה
- שגיאות נפוצות

---

## 🎉 סיום!

אחרי שתסיים את ההגדרה:
1. ✅ כל המיילים יעבדו
2. ✅ המשתמשים יקבלו הודעות
3. ✅ המערכת תהיה מקצועית
4. ✅ תוכל לעקוב אחר הכל

**המערכת מוכנה לשימוש!** 🚀


