# 🚀 מדריך הגדרה מלא - תשלומים מיידיים

## 📋 מה צריך לעשות כדי שהכל יעבוד:

### 1️⃣ יצירת חשבון Stripe

#### **יצירת חשבון:**
1. היכנס ל-[stripe.com](https://stripe.com)
2. לחץ על "Start now"
3. מלא פרטים עסקיים
4. אמת את החשבון

#### **קבלת מפתחות API:**
1. ב-Dashboard → Developers → API keys
2. העתק את:
   - **Publishable key** (מתחיל ב-pk_live_...)
   - **Secret key** (מתחיל ב-sk_live_...)

### 2️⃣ הגדרת Webhook

#### **יצירת Webhook:**
1. ב-Stripe Dashboard → Developers → Webhooks
2. לחץ "Add endpoint"
3. URL: `https://yourdomain.com/api/payments/webhook`
4. Events: בחר `payment_intent.succeeded` ו-`payment_intent.payment_failed`
5. העתק את **Signing secret** (מתחיל ב-whsec_...)

### 3️⃣ הגדרת מייל (Gmail)

#### **יצירת App Password:**
1. ב-Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password
4. בחר "Mail" ו-Device "Other"

#### **הגדרת משתני סביבה:**
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

### 4️⃣ עדכון קובץ .env

```env
# Stripe (החלף במפתחות האמיתיים שלך)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51ABC...
STRIPE_SECRET_KEY=sk_live_51ABC...
STRIPE_WEBHOOK_SECRET=whsec_ABC...

# Email (החלף בפרטי המייל שלך)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-business@gmail.com
SMTP_PASS=your-app-password

# Domain (החלף בדומיין שלך)
NEXTAUTH_URL=https://yourdomain.com
```

### 5️⃣ הגדרת חשבון בנק ב-Stripe

#### **הוספת חשבון בנק:**
1. ב-Stripe Dashboard → Settings → Payouts
2. Add bank account
3. הכנס פרטי חשבון הבנק שלך
4. Stripe יעביר כסף אוטומטית (1-7 ימי עסקים)

## 💰 איך הכסף מגיע אליך:

### **זרימת הכסף:**
1. **לקוח משלם** → Stripe מקבל את הכסף
2. **עמלה נגבית** → Stripe לוקח 2.9% + 30 אגורות
3. **יתרה נשמרת** → בחשבון Stripe שלך
4. **העברה אוטומטית** → לחשבון הבנק שלך

### **דוגמה:**
- לקוח משלם: ₪19.90 (Premium)
- עמלה: ₪0.88
- אתה מקבל: ₪19.02
- זמן העברה: 1-7 ימי עסקים

## 🔒 אבטחה:

### **מה מאובטח:**
- ✅ **HTTPS** - כל התקשורת מוצפנת
- ✅ **PCI DSS** - Stripe מטפל באבטחת כרטיסים
- ✅ **Webhook Signature** - אימות בקשות
- ✅ **Environment Variables** - מפתחות מוסתרים

### **מה אתה לא צריך לדאוג:**
- ❌ אחסון פרטי כרטיסים
- ❌ הצפנת נתונים רגישים
- ❌ אבטחת תשלומים
- ❌ ציות ל-PCI DSS

## 📧 הודעות מייל:

### **מתי נשלחים מיילים:**
- ✅ **תשלום הצליח** → מייל אישור מפורט
- ❌ **תשלום נכשל** → מייל שגיאה עם הסבר

### **מה נכלל במייל:**
- פרטי המנוי
- סכום התשלום
- מזהה עסקה
- קישור למשחק
- פרטי התמיכה

## 🧪 בדיקות:

### **לפני הייצור:**
1. **Stripe Test Mode** - בדוק עם כרטיסי דמה
2. **Webhook Testing** - השתמש ב-Stripe CLI
3. **Email Testing** - שלח מייל לעצמך

### **כרטיסי דמה לבדיקה:**
- **הצלחה:** 4242 4242 4242 4242
- **כשלון:** 4000 0000 0000 0002
- **CVV:** כל 3 ספרות
- **תאריך:** כל תאריך עתידי

## 🚀 הפעלה:

### **לאחר הגדרת הכל:**
1. **Deploy** - העלה לאתר
2. **Webhook** - עדכן URL לייצור
3. **Test** - בדוק תשלום אמיתי קטן
4. **Monitor** - עקוב אחר הלוגים

## 📞 תמיכה:

### **בעיות נפוצות:**
- **מייל לא נשלח** → בדוק App Password
- **Webhook לא עובד** → בדוק URL ו-Secret
- **תשלום לא עובר** → בדוק מפתחות API

### **לוגים חשובים:**
```bash
# בדוק לוגים של השרת
npm run dev

# בדוק Stripe Dashboard
# בדוק Email logs
```

## ✅ רשימת בדיקה:

- [ ] חשבון Stripe נוצר
- [ ] מפתחות API הועתקו
- [ ] Webhook הוגדר
- [ ] חשבון בנק נוסף
- [ ] משתני סביבה עודכנו
- [ ] מייל נבדק
- [ ] תשלום דמה עבר
- [ ] מייל אישור נשלח

---

**🎉 אחרי שתסיים את כל השלבים, המערכת תהיה מוכנה לתשלומים אמיתיים!**


