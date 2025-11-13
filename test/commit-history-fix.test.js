const { showCommitHistoryAdvanced } = require('../lib/git-operations/status-history');
const fs = require('fs');
const path = require('path');

// Test the commit history function
async function testCommitHistory() {
  console.log('Testing commit history functionality...');
  
  try {
    // Test in current directory (which may or may not be a git repo)
    const result = await showCommitHistoryAdvanced();
    console.log('✅ Commit history test completed successfully');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Test with options
    const resultWithOptions = await showCommitHistoryAdvanced({ limit: 5, format: 'oneline' });
    console.log('✅ Commit history with options test completed successfully');
    console.log('Result with options:', JSON.stringify(resultWithOptions, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Commit history test failed:', error.message);
    return false;
  }
}

// Run the test
testCommitHistory().then(success => {
  if (success) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('💥 Some tests failed!');
    process.exit(1);
  }
});