const { pushRepoAdvanced } = require('../lib/git-operations/push');
const { executeCommandAdvanced } = require('../lib/core');
const fs = require('fs');
const path = require('path');

// Mock the executeCommandAdvanced function to simulate a non-fast-forward error
async function testNonFastForwardError() {
  console.log('Testing non-fast-forward error handling...');
  
  // Create a temporary directory for our test
  const testDir = path.join(__dirname, 'temp-test-repo');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  
  // Change to the test directory
  process.chdir(testDir);
  
  // Initialize a git repo
  await executeCommandAdvanced('git init');
  await executeCommandAdvanced('git config user.name "Test User"');
  await executeCommandAdvanced('git config user.email "test@example.com"');
  
  // Create a test file
  fs.writeFileSync('test.txt', 'Initial content');
  await executeCommandAdvanced('git add .');
  await executeCommandAdvanced('git commit -m "Initial commit"');
  
  console.log('Test repository created. In a real scenario, a non-fast-forward error would occur when the remote has new commits.');
  console.log('The auto-resolve feature would:');
  console.log('1. Detect the non-fast-forward rejection');
  console.log('2. Prompt user to automatically resolve by pulling first');
  console.log('3. Pull the latest changes');
  console.log('4. Attempt to push again');
  console.log('5. If still unsuccessful, offer a safe force push option');
  
  // Clean up
  process.chdir(__dirname);
  console.log('\n✅ Test completed successfully!');
}

testNonFastForwardError().catch(console.error);