import twilio from 'twilio';

// Direct SMS test without any app complexity
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function testSMS() {
  try {
    console.log('Testing direct SMS delivery...');
    
    const message = await client.messages.create({
      body: 'Test message from My Green Loop rental system',
      from: '+14085121293',
      to: '+16508614105'
    });
    
    console.log('Message sent successfully:');
    console.log('SID:', message.sid);
    console.log('Status:', message.status);
    console.log('Date created:', message.dateCreated);
    
    // Check status after 30 seconds
    setTimeout(async () => {
      try {
        const updatedMessage = await client.messages(message.sid).fetch();
        console.log('\n--- Status Update ---');
        console.log('SID:', updatedMessage.sid);
        console.log('Status:', updatedMessage.status);
        console.log('Error code:', updatedMessage.errorCode);
        console.log('Error message:', updatedMessage.errorMessage);
        console.log('Date sent:', updatedMessage.dateSent);
        console.log('Price:', updatedMessage.price);
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    }, 30000);
    
  } catch (error) {
    console.error('Failed to send SMS:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

testSMS();