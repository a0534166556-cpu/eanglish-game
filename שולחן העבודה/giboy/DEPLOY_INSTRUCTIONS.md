# הוראות לפרסום האתר ב-Netlify עם GitHub

## שלב 1: יצירת Repository ב-GitHub

1. היכנס ל-GitHub (https://github.com)
2. לחץ על הכפתור "+" בפינה הימנית העליונה → "New repository"
3. מלא:
   - **Repository name**: `giboy`
   - **Visibility**: Public או Private
   - **אל תסמן** "Initialize with README"
4. לחץ "Create repository"

## שלב 2: העלאת הקוד ל-GitHub

הפעל את הפקודות הבאות (החלף YOUR_USERNAME עם שם המשתמש שלך):

```bash
# הוסף את כל הקבצים
git add .

# עשה commit
git commit -m "Ready for Netlify deployment - fixed all build issues"

# הוסף את ה-remote repository
git remote add origin https://github.com/YOUR_USERNAME/giboy.git

# דחוף את הקוד
git branch -M main
git push -u origin main
```

## שלב 3: חיבור ל-Netlify

1. היכנס ל-Netlify: https://app.netlify.com
2. לחץ "Add new site" → "Import an existing project"
3. בחר "GitHub" והרשא גישה
4. בחר את ה-repository `giboy`
5. Netlify יזהה את ההגדרות מ-`netlify.toml` אוטומטית

## שלב 4: הוסף Environment Variables (חובה!)

**Site settings** → **Build & deploy** → **Environment** → **Add variable**:

### חובה:
- **`DATABASE_URL`** = `mysql://user:password@host:port/database`

### אופציונלי (AdSense):
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- `NEXT_PUBLIC_ADSENSE_TOP_BANNER`
- `NEXT_PUBLIC_ADSENSE_BOTTOM_BANNER`
- `NEXT_PUBLIC_ADSENSE_SIDEBAR`
- `NEXT_PUBLIC_ADSENSE_REWARDED_VIDEO`

## שלב 5: Deploy

Netlify יתחיל build אוטומטית. בדוק את ה-logs אם יש שגיאות.

## הערות

- ✅ `netlify.toml` כבר מוגדר נכון
- ✅ Netlify Next.js plugin מותקן
- ✅ כל ה-API routes מוגדרים כ-`force-dynamic`
- ✅ Suspense imports תוקנו
- ⚠️ **חשוב**: הוסף `DATABASE_URL` ב-Netlify אחרת ההרשמה/התחברות לא יעבדו!

