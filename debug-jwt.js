/**
 * Debug JWT Token
 * Usage: node debug-jwt.js YOUR_TOKEN_HERE
 */

const jwt = process.argv[2];

if (!jwt) {
  console.log('Usage: node debug-jwt.js YOUR_TOKEN_HERE');
  console.log('\nTo get your token:');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Application/Storage > Cookies');
  console.log('3. Find the "pb_auth" cookie value');
  console.log('4. Copy it and run: node debug-jwt.js PASTE_HERE');
  process.exit(1);
}

try {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    console.log('Invalid JWT format (expected 3 parts separated by dots)');
    process.exit(1);
  }
  
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  console.log('JWT Payload:');
  console.log(JSON.stringify(payload, null, 2));
  
  console.log('\nUser fields found:');
  console.log('- id:', payload.id);
  console.log('- email:', payload.email);
  console.log('- username:', payload.username);
  console.log('- fullName:', payload.fullName);
  console.log('- name:', payload.name);
  console.log('- role:', payload.role);
  
} catch (error) {
  console.error('Error parsing JWT:', error.message);
  process.exit(1);
}
