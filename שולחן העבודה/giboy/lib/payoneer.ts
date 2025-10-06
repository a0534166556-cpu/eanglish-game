import axios from 'axios';

// הגדרות Payoneer
export const PAYONEER_CONFIG = {
  // זה יוחלף במפתחות האמיתיים אחרי האישור
  clientId: process.env.PAYONEER_CLIENT_ID || '',
  clientSecret: process.env.PAYONEER_CLIENT_SECRET || '',
  baseUrl: 'https://api.payoneer.com',
  sandboxUrl: 'https://api.sandbox.payoneer.com',
  isSandbox: process.env.NODE_ENV === 'development'
};

// מחלקה לניהול תשלומים ב-Payoneer
export class PayoneerService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.clientId = PAYONEER_CONFIG.clientId;
    this.clientSecret = PAYONEER_CONFIG.clientSecret;
    this.baseUrl = PAYONEER_CONFIG.isSandbox ? PAYONEER_CONFIG.sandboxUrl : PAYONEER_CONFIG.baseUrl;
  }

  // קבלת access token
  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    // בדיקה שמפתחות מוגדרים
    if (!this.clientId || !this.clientSecret) {
      throw new Error('מפתחות Payoneer לא מוגדרים. אנא הגדר PAYONEER_CLIENT_ID ו-PAYONEER_CLIENT_SECRET');
    }

    try {
      const response = await axios.post(`${this.baseUrl}/v1/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      });

      this.accessToken = (response.data as any).access_token;
      return this.accessToken || '';
    } catch (error) {
      console.error('שגיאה בקבלת access token:', error);
      throw new Error('לא ניתן להתחבר ל-Payoneer');
    }
  }

  // יצירת תשלום
  async createPayment(amount: number, currency: string, userId: string, plan: string) {
    try {
      const token = await this.getAccessToken();
      
      const paymentData = {
        amount: amount * 100, // Payoneer מצפה לסנטים
        currency: currency.toUpperCase(),
        description: `מנוי ${plan} - משתמש ${userId}`,
        metadata: {
          userId,
          plan,
          timestamp: new Date().toISOString()
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/v1/payments`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data as any;
    } catch (error) {
      console.error('שגיאה ביצירת תשלום:', error);
      throw new Error('לא ניתן ליצור תשלום');
    }
  }

  // בדיקת סטטוס תשלום
  async getPaymentStatus(paymentId: string) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseUrl}/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data as any;
    } catch (error) {
      console.error('שגיאה בבדיקת סטטוס תשלום:', error);
      throw new Error('לא ניתן לבדוק סטטוס תשלום');
    }
  }

  // קבלת פרטי חשבון
  async getAccountDetails() {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseUrl}/v1/account`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data as any;
    } catch (error) {
      console.error('שגיאה בקבלת פרטי חשבון:', error);
      throw new Error('לא ניתן לקבל פרטי חשבון');
    }
  }
}

// יצירת instance יחיד
export const payoneerService = new PayoneerService();


