/**
 * Debug script to test media upload and relation issues
 */

const PocketBase = require('pocketbase');
const fs = require('fs');

const pb = new PocketBase('http://127.0.0.1:8090');

async function testMediaUpload() {
  try {
    console.log('=== Media Upload Debug Script ===\n');
    
    // First, let's login as a test user
    console.log('1. Attempting to authenticate...');
    const authData = await pb.collection('users').authWithPassword(
      'test@test.com', // You'll need to use an actual user from your DB
      'testpassword123'
    );
    
    console.log('✓ Authenticated as:', authData.record.email);
    console.log('  User ID:', authData.record.id);
    console.log('  User ID type:', typeof authData.record.id);
    console.log('  User ID length:', authData.record.id.length);
    
    // Check if media collection exists
    console.log('\n2. Checking media collection...');
    try {
      const collections = await pb.collections.getFullList();
      const mediaCollection = collections.find(c => c.name === 'media');
      
      if (mediaCollection) {
        console.log('✓ Media collection found');
        console.log('  Collection ID:', mediaCollection.id);
        console.log('  Schema:', JSON.stringify(mediaCollection.schema, null, 2));
      } else {
        console.log('✗ Media collection NOT found!');
        console.log('  Available collections:', collections.map(c => c.name).join(', '));
      }
    } catch (error) {
      console.log('✗ Error fetching collections:', error.message);
    }
    
    // Test creating a media record
    console.log('\n3. Testing media record creation...');
    
    // Create a test file
    const testFileContent = Buffer.from('test image data');
    const testFile = new Blob([testFileContent], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('file', testFile, 'test.png');
    formData.append('uploadedBy', authData.record.id);
    formData.append('fileName', 'test.png');
    formData.append('fileSize', '100');
    formData.append('mimeType', 'image/png');
    
    console.log('  Attempting to create media record with:');
    console.log('  - uploadedBy:', authData.record.id);
    console.log('  - fileName:', 'test.png');
    
    try {
      const record = await pb.collection('media').create(formData);
      console.log('✓ Media record created successfully!');
      console.log('  Record ID:', record.id);
    } catch (error) {
      console.log('✗ Failed to create media record:');
      console.log('  Error:', error.message);
      console.log('  Response:', JSON.stringify(error.response, null, 2));
    }
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response, null, 2));
    }
  }
}

testMediaUpload();
