import * as nodemailer from 'nodemailer';

// Check if SendGrid is configured
const useSendGrid = !!process.env.SENDGRID_API_KEY;

// הגדרות מייל
const transporter = useSendGrid 
  ? nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    })
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password',
      },
    });

export async function sendPaymentConfirmationEmail(
  userEmail: string,
  plan: string,
  amount: number,
  currency: string = 'ILS'
) {
  const planNames = {
    basic: 'Basic',
    premium: 'Premium', 
    yearly: 'Yearly'
  };

  const planName = planNames[plan as keyof typeof planNames] || plan;

  const mailOptions = {
    from: `"Word Clash" <${process.env.SMTP_USER || 'noreply@wordclash.com'}>`,
    to: userEmail,
    subject: `✅ תשלום אושר - מנוי ${planName} | Word Clash`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎮 Word Clash</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">משחק המילים המתקדם</p>
          </div>

          <!-- Success Icon -->
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #10b981; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
              <span style="font-size: 30px;">✅</span>
            </div>
          </div>

          <!-- Main Message -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">תשלום אושר בהצלחה!</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px;">שלום, המנוי שלך הופעל בהצלחה</p>
          </div>

          <!-- Details -->
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">פרטי המנוי:</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">תוכנית:</span>
              <span style="color: #1f2937; font-weight: bold;">${planName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">סכום:</span>
              <span style="color: #1f2937; font-weight: bold;">${currency} ${amount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">תאריך:</span>
              <span style="color: #1f2937; font-family: monospace; font-size: 12px;">${new Date().toLocaleDateString('he-IL')}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">סטטוס:</span>
              <span style="color: #10b981; font-weight: bold;">✅ פעיל</span>
            </div>
          </div>

          <!-- Benefits -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">מה כלול במנוי שלך:</h3>
            <ul style="color: #6b7280; margin: 0; padding-right: 20px;">
              <li style="margin-bottom: 8px;">🎮 גישה מלאה ל-Word Clash</li>
              <li style="margin-bottom: 8px;">🚫 ללא פרסומות</li>
              <li style="margin-bottom: 8px;">📊 סטטיסטיקות מתקדמות</li>
              <li style="margin-bottom: 8px;">🎯 תכונות בלעדיות</li>
              <li style="margin-bottom: 8px;">💎 יהלומים ומטבעות בונוס</li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/games" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block; 
                      font-size: 16px;">
              🚀 התחל לשחק עכשיו
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              תודה שבחרת ב-Word Clash!<br>
              <a href="mailto:support@wordclash.com" style="color: #2563eb; text-decoration: none;">צור קשר לתמיכה</a>
            </p>
          </div>

        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendPaymentFailureEmail(
  userEmail: string,
  plan: string,
  amount: number,
  currency: string = 'ILS'
) {
  const planNames = {
    basic: 'Basic',
    premium: 'Premium',
    yearly: 'Yearly'
  };

  const planName = planNames[plan as keyof typeof planNames] || plan;

  const mailOptions = {
    from: `"Word Clash" <${process.env.SMTP_USER || 'noreply@wordclash.com'}>`,
    to: userEmail,
    subject: `❌ שגיאה בתשלום - ${planName} | Word Clash`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎮 Word Clash</h1>
          </div>

          <!-- Error Icon -->
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #ef4444; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
              <span style="font-size: 30px;">❌</span>
            </div>
          </div>

          <!-- Main Message -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">שגיאה בתשלום</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px;">שלום, התשלום שלך לא עבר</p>
          </div>

          <!-- Error Details -->
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 16px;">פרטי התשלום:</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #7f1d1d;">תוכנית:</span>
              <span style="color: #7f1d1d; font-weight: bold;">${planName}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #7f1d1d;">סכום:</span>
              <span style="color: #7f1d1d; font-weight: bold;">${currency} ${amount}</span>
            </div>
          </div>

          <!-- Help -->
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">מה לעשות?</h3>
            <ul style="color: #6b7280; margin: 0; padding-right: 20px;">
              <li style="margin-bottom: 8px;">בדוק את פרטי הכרטיס</li>
              <li style="margin-bottom: 8px;">ודא שיש מספיק יתרה</li>
              <li style="margin-bottom: 8px;">נסה כרטיס אחר</li>
              <li style="margin-bottom: 8px;">צור קשר עם הבנק שלך</li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/subscription/payment?plan=${plan}" 
               style="background: #ef4444; 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block; 
                      font-size: 16px;">
              🔄 נסה שוב
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              צריכים עזרה? <a href="mailto:support@wordclash.com" style="color: #2563eb; text-decoration: none;">צרו קשר</a>
            </p>
          </div>

        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Payment failure email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('Failed to send failure email:', error);
    return false;
  }
}

// שליחת מייל ברוכים הבאים
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const mailOptions = {
    from: `"Word Clash" <${process.env.SMTP_USER || 'noreply@wordclash.com'}>`,
    to: userEmail,
    subject: `🎮 ברוכים הבאים ל-Word Clash!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎮 Word Clash</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">משחק המילים המתקדם</p>
          </div>

          <!-- Welcome Icon -->
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #3b82f6; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
              <span style="font-size: 30px;">🎉</span>
            </div>
          </div>

          <!-- Main Message -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">ברוכים הבאים!</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px;">שלום ${userName}, תודה שהצטרפת ל-Word Clash</p>
          </div>

          <!-- Features -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">מה מחכה לך:</h3>
            <ul style="color: #6b7280; margin: 0; padding-right: 20px;">
              <li style="margin-bottom: 8px;">🎯 משחקי מילים מאתגרים</li>
              <li style="margin-bottom: 8px;">🏆 תחרויות עם שחקנים אחרים</li>
              <li style="margin-bottom: 8px;">📊 מעקב אחר ההתקדמות שלך</li>
              <li style="margin-bottom: 8px;">💎 איסוף מטבעות ויהלומים</li>
              <li style="margin-bottom: 8px;">🎮 משחקים מגוונים ומעניינים</li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/games" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block; 
                      font-size: 16px;">
              🚀 התחל לשחק עכשיו
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              תודה שבחרת ב-Word Clash!<br>
              <a href="mailto:support@wordclash.com" style="color: #2563eb; text-decoration: none;">צור קשר לתמיכה</a>
            </p>
          </div>

        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

// שליחת מייל איפוס סיסמה
export async function sendPasswordResetEmail(userEmail: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Word Clash" <${process.env.SMTP_USER || 'noreply@wordclash.com'}>`,
    to: userEmail,
    subject: `🔐 איפוס סיסמה - Word Clash`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎮 Word Clash</h1>
          </div>

          <!-- Reset Icon -->
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #f59e0b; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
              <span style="font-size: 30px;">🔐</span>
            </div>
          </div>

          <!-- Main Message -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">איפוס סיסמה</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px;">קיבלת בקשה לאיפוס הסיסמה שלך</p>
          </div>

          <!-- Instructions -->
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">מה לעשות:</h3>
            <ol style="color: #6b7280; margin: 0; padding-right: 20px;">
              <li style="margin-bottom: 8px;">לחץ על הכפתור למטה</li>
              <li style="margin-bottom: 8px;">הזן סיסמה חדשה</li>
              <li style="margin-bottom: 8px;">אשר את השינוי</li>
            </ol>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${resetUrl}" 
               style="background: #f59e0b; 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block; 
                      font-size: 16px;">
              🔐 איפוס סיסמה
            </a>
          </div>

          <!-- Security Note -->
          <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="color: #92400e; margin: 0; font-size: 14px; text-align: center;">
              <strong>⚠️ חשוב:</strong> הקישור הזה תקף ל-24 שעות בלבד
            </p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              אם לא ביקשת איפוס סיסמה, התעלם מהמייל הזה<br>
              <a href="mailto:support@wordclash.com" style="color: #2563eb; text-decoration: none;">צור קשר לתמיכה</a>
            </p>
          </div>

        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

// שליחת מייל התראה על מנוי שפג תוקפו
// שליחת מייל כללי
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  console.log('📧 sendEmail function called');
  console.log('📧 Using SendGrid:', useSendGrid);
  console.log('📧 SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
  
  const mailOptions = {
    from: useSendGrid ? `noreply@learningenglish.com` : `pajaw13300@gmail.com`, // Use verified domain for SendGrid
    to,
    subject,
    html,
  };

  console.log('📧 Mail options:', { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject.substring(0, 50) + '...' });

  try {
    console.log('🚀 Sending email via transporter...');
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    console.error('❌ Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      code: (error as any).code,
      response: (error as any).response
    });
    throw error;
  }
}

export async function sendSubscriptionExpiryEmail(userEmail: string, plan: string, daysLeft: number) {
  const planNames = {
    basic: 'Basic',
    premium: 'Premium',
    yearly: 'Yearly'
  };

  const planName = planNames[plan as keyof typeof planNames] || plan;

  const mailOptions = {
    from: `"Word Clash" <${process.env.SMTP_USER || 'noreply@wordclash.com'}>`,
    to: userEmail,
    subject: `⏰ התראה: המנוי שלך פג תוקפו בעוד ${daysLeft} ימים`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎮 Word Clash</h1>
          </div>

          <!-- Warning Icon -->
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background: #f59e0b; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
              <span style="font-size: 30px;">⏰</span>
            </div>
          </div>

          <!-- Main Message -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">המנוי שלך פג תוקפו בקרוב!</h2>
            <p style="color: #6b7280; margin: 0; font-size: 16px;">נותרו לך ${daysLeft} ימים עד שהמנוי ${planName} יפקע</p>
          </div>

          <!-- Details -->
          <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">מה יקרה אחרי פג התוקף:</h3>
            <ul style="color: #92400e; margin: 0; padding-right: 20px;">
              <li style="margin-bottom: 8px;">תאבד גישה לתכונות הפרימיום</li>
              <li style="margin-bottom: 8px;">תראה פרסומות במשחק</li>
              <li style="margin-bottom: 8px;">תאבד את הסטטיסטיקות המתקדמות</li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/payment?plan=${plan}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block; 
                      font-size: 16px;">
              🔄 חידוש מנוי
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              תודה שבחרת ב-Word Clash!<br>
              <a href="mailto:support@wordclash.com" style="color: #2563eb; text-decoration: none;">צור קשר לתמיכה</a>
            </p>
          </div>

        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Subscription expiry email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('Failed to send subscription expiry email:', error);
    return false;
  }
}
