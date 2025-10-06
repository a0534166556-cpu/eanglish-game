// בדיקת אבטחה מקיפה
const axios = require('axios');

class SecurityTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.vulnerabilities = [];
    this.passed = [];
  }

  // בדיקת SQL Injection
  async testSQLInjection() {
    console.log('\n🔍 בדיקת SQL Injection...');
    
    const payloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "1' OR '1'='1' --",
      "admin'--",
      "admin'/*",
      "' OR 1=1#"
    ];
    
    const endpoints = [
      '/api/user/1',
      '/api/login',
      '/api/register'
    ];
    
    for (const endpoint of endpoints) {
      for (const payload of payloads) {
        try {
          const response = await axios.get(`${this.baseUrl}${endpoint}?id=${encodeURIComponent(payload)}`);
          
          // בדיקה אם התגובה מכילה שגיאת SQL
          if (response.data.includes('SQL') || 
              response.data.includes('mysql') || 
              response.data.includes('syntax error')) {
            this.vulnerabilities.push({
              type: 'SQL Injection',
              endpoint,
              payload,
              severity: 'HIGH'
            });
          } else {
            this.passed.push({
              type: 'SQL Injection',
              endpoint,
              payload
            });
          }
        } catch (error) {
          // שגיאה 500 יכולה להצביע על SQL injection
          if (error.response && error.response.status === 500) {
            this.vulnerabilities.push({
              type: 'SQL Injection (500 Error)',
              endpoint,
              payload,
              severity: 'MEDIUM'
            });
          }
        }
      }
    }
  }

  // בדיקת XSS
  async testXSS() {
    console.log('\n🔍 בדיקת XSS...');
    
    const payloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      "'><script>alert('XSS')</script>"
    ];
    
    const endpoints = [
      '/api/user/1',
      '/games',
      '/profile'
    ];
    
    for (const endpoint of endpoints) {
      for (const payload of payloads) {
        try {
          const response = await axios.get(`${this.baseUrl}${endpoint}?search=${encodeURIComponent(payload)}`);
          
          // בדיקה אם התגובה מכילה את ה-payload
          if (response.data.includes(payload) || 
              response.data.includes('<script>') ||
              response.data.includes('javascript:')) {
            this.vulnerabilities.push({
              type: 'XSS',
              endpoint,
              payload,
              severity: 'HIGH'
            });
          } else {
            this.passed.push({
              type: 'XSS',
              endpoint,
              payload
            });
          }
        } catch (error) {
          // שגיאה לא בהכרח מצביעה על XSS
        }
      }
    }
  }

  // בדיקת Authentication
  async testAuthentication() {
    console.log('\n🔍 בדיקת Authentication...');
    
    const protectedEndpoints = [
      '/api/admin/all-users',
      '/api/user/1',
      '/admin/email-test',
      '/profile'
    ];
    
    for (const endpoint of protectedEndpoints) {
      try {
        const response = await axios.get(`${this.baseUrl}${endpoint}`);
        
        // אם התגובה היא 200 ללא authentication, זה בעיה
        if (response.status === 200) {
          this.vulnerabilities.push({
            type: 'Missing Authentication',
            endpoint,
            severity: 'HIGH'
          });
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.passed.push({
            type: 'Authentication',
            endpoint
          });
        } else if (error.response && error.response.status === 403) {
          this.passed.push({
            type: 'Authorization',
            endpoint
          });
        }
      }
    }
  }

  // בדיקת CORS
  async testCORS() {
    console.log('\n🔍 בדיקת CORS...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/health`, {
        headers: {
          'Origin': 'https://malicious-site.com',
          'Access-Control-Request-Method': 'GET'
        }
      });
      
      const corsHeaders = response.headers['access-control-allow-origin'];
      
      if (corsHeaders === '*' || corsHeaders === 'https://malicious-site.com') {
        this.vulnerabilities.push({
          type: 'CORS Misconfiguration',
          severity: 'MEDIUM'
        });
      } else {
        this.passed.push({
          type: 'CORS',
          endpoint: '/api/health'
        });
      }
    } catch (error) {
      // שגיאה לא בהכרח מצביעה על בעיית CORS
    }
  }

  // בדיקת Headers
  async testSecurityHeaders() {
    console.log('\n🔍 בדיקת Security Headers...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/`);
      const headers = response.headers;
      
      const requiredHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security'
      ];
      
      for (const header of requiredHeaders) {
        if (!headers[header.toLowerCase()]) {
          this.vulnerabilities.push({
            type: 'Missing Security Header',
            header,
            severity: 'MEDIUM'
          });
        } else {
          this.passed.push({
            type: 'Security Header',
            header
          });
        }
      }
    } catch (error) {
      console.error('Error testing security headers:', error.message);
    }
  }

  // בדיקת Rate Limiting
  async testRateLimiting() {
    console.log('\n🔍 בדיקת Rate Limiting...');
    
    const endpoint = '/api/health';
    const requests = [];
    
    // שליחת 100 בקשות במקביל
    for (let i = 0; i < 100; i++) {
      requests.push(axios.get(`${this.baseUrl}${endpoint}`));
    }
    
    try {
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      if (rateLimited.length === 0) {
        this.vulnerabilities.push({
          type: 'No Rate Limiting',
          endpoint,
          severity: 'MEDIUM'
        });
      } else {
        this.passed.push({
          type: 'Rate Limiting',
          endpoint
        });
      }
    } catch (error) {
      // שגיאה יכולה להצביע על rate limiting
      if (error.response && error.response.status === 429) {
        this.passed.push({
          type: 'Rate Limiting',
          endpoint
        });
      }
    }
  }

  // הרצת כל בדיקות האבטחה
  async runAllSecurityTests() {
    console.log('🔒 מתחיל בדיקות אבטחה מקיפות...\n');
    
    await this.testSQLInjection();
    await this.testXSS();
    await this.testAuthentication();
    await this.testCORS();
    await this.testSecurityHeaders();
    await this.testRateLimiting();
    
    this.generateSecurityReport();
  }

  // יצירת דוח אבטחה
  generateSecurityReport() {
    console.log('\n📊 דוח אבטחה:');
    console.log('='.repeat(50));
    
    console.log(`\n✅ בדיקות שעברו: ${this.passed.length}`);
    this.passed.forEach(test => {
      console.log(`  ✓ ${test.type} - ${test.endpoint || test.header || 'N/A'}`);
    });
    
    console.log(`\n❌ פגיעויות שנמצאו: ${this.vulnerabilities.length}`);
    this.vulnerabilities.forEach(vuln => {
      const severity = vuln.severity === 'HIGH' ? '🔴' : 
                      vuln.severity === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`  ${severity} ${vuln.type} - ${vuln.endpoint || vuln.header || 'N/A'}`);
    });
    
    // המלצות
    console.log('\n💡 המלצות אבטחה:');
    
    if (this.vulnerabilities.some(v => v.type.includes('SQL Injection'))) {
      console.log('⚠️ הוסף input validation ו-prepared statements');
    }
    
    if (this.vulnerabilities.some(v => v.type.includes('XSS'))) {
      console.log('⚠️ הוסף output encoding ו-CSP headers');
    }
    
    if (this.vulnerabilities.some(v => v.type.includes('Authentication'))) {
      console.log('⚠️ הוסף authentication לכל ה-endpoints המוגנים');
    }
    
    if (this.vulnerabilities.some(v => v.type.includes('CORS'))) {
      console.log('⚠️ הגדר CORS בצורה נכונה');
    }
    
    if (this.vulnerabilities.some(v => v.type.includes('Header'))) {
      console.log('⚠️ הוסף security headers');
    }
    
    if (this.vulnerabilities.some(v => v.type.includes('Rate Limiting'))) {
      console.log('⚠️ הוסף rate limiting');
    }
    
    console.log('\n✅ בדיקות אבטחה הושלמו!');
  }
}

// הרצת הבדיקות
async function main() {
  const tester = new SecurityTester();
  await tester.runAllSecurityTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SecurityTester;


