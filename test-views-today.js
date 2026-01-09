// Test the Views Today query logic
const today = new Date();
today.setHours(0, 0, 0, 0);
const todayStr = today.toISOString();

console.log('Today date object:', today);
console.log('Today ISO string:', todayStr);
console.log('Expected filter:', `eventType = "view" && created >= "${todayStr}"`);

// Check what time it is now
const now = new Date();
console.log('\nCurrent time:', now);
console.log('Current ISO:', now.toISOString());

// Sample created dates to test
const sampleDates = [
  new Date().toISOString(), // Now
  new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  new Date(Date.now() - 86400000).toISOString(), // 1 day ago
];

console.log('\nSample dates and whether they match (created >= todayStr):');
sampleDates.forEach(date => {
  console.log(`  ${date}: ${date >= todayStr}`);
});
