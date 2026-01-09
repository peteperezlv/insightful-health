// Debug script to check OAuth configuration
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function checkOAuth() {
  try {
    console.log('Fetching auth methods from PocketBase...\n');
    const authMethods = await pb.collection('users').listAuthMethods();
    
    console.log('Full auth methods response:');
    console.log(JSON.stringify(authMethods, null, 2));
    
    console.log('\n\nAuth providers:');
    if (authMethods.authProviders) {
      authMethods.authProviders.forEach(provider => {
        console.log(`\nProvider: ${provider.name}`);
        console.log(`  State: ${provider.state}`);
        console.log(`  Auth URL: ${provider.authUrl}`);
        console.log(`  Code verifier: ${provider.codeVerifier ? 'Present' : 'Not present'}`);
      });
    } else {
      console.log('No OAuth providers found!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOAuth();
