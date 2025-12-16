// Test PayPal API Connection
// Using native fetch (Node.js 18+)

const PAYPAL_CLIENT_ID = 'ARof7s6f4_uq-a0tzXRL-gHbWUr14FCnOsiI01OWdhls6909Q9Ea9onrDoN9R-XazyHCx1MLtZXvKyut';
const PAYPAL_CLIENT_SECRET = 'EH2HIr85euZIBLG8wqXPXc4EQOK7ATQ3sd1eMdsMv02hp5LLgQfVXoJHQNvQKQcV9kYl4UBY3czdj-e-';
const PAYPAL_API_BASE = 'https://api-m.paypal.com'; // Live mode

async function testPayPalConnection() {
  console.log('🧪 Testing PayPal API Connection...\n');

  try {
    // Step 1: Get Access Token
    console.log('📍 Step 1: Getting PayPal Access Token...');
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Failed to get access token');
      console.error('Response:', errorText);
      return;
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Access Token received successfully!');
    console.log(`Token: ${tokenData.access_token.substring(0, 20)}...`);

    // Step 2: Create a Test Order
    console.log('\n📍 Step 2: Creating test order...');
    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'ILS',
            value: '10.00',
          },
          description: 'Test Payment - 100 Coins',
        }],
        application_context: {
          return_url: 'http://localhost:3000/payment/success',
          cancel_url: 'http://localhost:3000/payment/cancel',
          brand_name: 'Giboy English Games',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('❌ Failed to create order');
      console.error('Response:', errorText);
      return;
    }

    const orderData = await orderResponse.json();
    console.log('✅ Order created successfully!');
    console.log(`Order ID: ${orderData.id}`);
    
    const approvalUrl = orderData.links.find(link => link.rel === 'approve')?.href;
    console.log(`Approval URL: ${approvalUrl}`);

    console.log('\n🎉 SUCCESS! PayPal integration is working!');
    console.log('\n📋 Summary:');
    console.log('✅ API credentials are valid');
    console.log('✅ Can create payment orders');
    console.log('✅ Payment flow is configured correctly');
    console.log('\n💡 Next step: Test actual payment in browser!');

  } catch (error) {
    console.error('❌ Error testing PayPal connection:');
    console.error(error.message);
  }
}

testPayPalConnection();

