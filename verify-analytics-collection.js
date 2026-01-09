import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function verifyCollection() {
  try {
    // Try to create a test record - this will fail if collection doesn't exist
    const record = await pb.collection('analytics').create({
      eventType: 'view',
      pageUrl: 'http://test.com',
      ipAddress: '127.0.0.1',
      sessionId: 'test_verify',
      userAgent: 'Test',
      referer: 'test'
    });
    
    console.log('✓ Analytics collection EXISTS and records can be created');
    console.log('  Created record ID:', record.id);
    console.log('  Created timestamp:', record.created);
    
  } catch (error) {
    if (error.status === 404) {
      console.log('✗ Analytics collection DOES NOT EXIST!');
      console.log('  You need to import the collection schema.');
    } else {
      console.log('Error:', error.message);
      console.log('Status:', error.status);
    }
  }
}

verifyCollection();
