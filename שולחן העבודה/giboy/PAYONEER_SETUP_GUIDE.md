# 🚀 מדריך הגדרת Payoneer

## 📋 שלבים להגדרת מערכת התשלומים

### 1️⃣ יצירת חשבון Payoneer ✅
- [x] בחרת "Freelancer or SMB"
- [x] מילאת פרטים אישיים
- [x] הוגשה הבקשה - ממתין לאישור

### 2️⃣ קבלת מפתחות API (אחרי האישור)
1. התחבר לחשבון Payoneer שלך
2. לך ל-Developer Settings
3. צור אפליקציה חדשה
4. העתק את:
   - `Client ID`
   - `Client Secret`

### 3️⃣ הגדרת משתני סביבה
צור קובץ `.env.local` עם התוכן הבא:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/giboy"

# Payoneer API Keys
PAYONEER_CLIENT_ID="your_payoneer_client_id"
PAYONEER_CLIENT_SECRET="your_payoneer_client_secret"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# Bank Account Details
BANK_ACCOUNT="047312"
BANK_NAME="פאגי"
BANK_BRANCH="173"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4️⃣ הגדרת Webhook
1. ב-Payoneer Developer Console
2. הוסף Webhook URL: `https://yourdomain.com/api/payments/payoneer/webhook`
3. בחר אירועים:
   - `payment.completed`
   - `payment.failed`

### 5️⃣ הגדרת מייל
1. הפעל 2-Factor Authentication ב-Gmail
2. צור App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - בחר "Mail" ו-"Other"
   - העתק את הסיסמה שנוצרה

### 6️⃣ בדיקת המערכת
1. הרץ: `npm run dev`
2. לך ל: `http://localhost:3000/subscription/payment?plan=basic`
3. בחר "Payoneer" כאמצעי תשלום
4. בדוק שהתשלום עובד

## 🔧 קבצים שנוצרו

### API Routes:
- `app/api/payments/payoneer/create-payment/route.ts`
- `app/api/payments/payoneer/check-status/route.ts`
- `app/api/payments/payoneer/webhook/route.ts`

### Components:
- `app/components/PayoneerPaymentForm.tsx`

### Services:
- `lib/payoneer.ts`

### Database:
- `prisma/schema.prisma` (Subscription & Payment models)

## 🎯 מה הלאה?

1. **חכה לאישור Payoneer** (1-3 ימי עסקים)
2. **קבל מפתחות API** מהחשבון שלך
3. **עדכן משתני סביבה** עם המפתחות האמיתיים
4. **הגדר Webhook** ב-Payoneer
5. **בדוק את המערכת** עם תשלום אמיתי

## 📞 תמיכה

אם יש בעיות:
1. בדוק את הלוגים בקונסול
2. ודא שכל המפתחות נכונים
3. בדוק שהחשבון Payoneer פעיל
4. פנה לתמיכה של Payoneer

## 🎉 סיום!

אחרי שתסיים את כל השלבים - המערכת תהיה מוכנה לקבלת תשלומים אמיתיים!

**הכסף יועבר ישירות לחשבון 047312 בנק פאגי סניף 173** 🏦


