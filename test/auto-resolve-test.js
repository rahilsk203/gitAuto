const { pushRepoAdvanced } = require('../lib/git-operations/push');

// Test the auto-resolve functionality
async function testAutoResolve() {
  console.log('Testing auto-resolve functionality for non-fast-forward push rejections...');
  
  // This will trigger the error handling but won't actually resolve anything
  // since we're not in a real git repository with remote conflicts
  try {
    const result = await pushRepoAdvanced('Test commit for auto-resolve');
    console.log('Push result:', result);
  } catch (error) {
    console.error('Error during test:', error.message);
  }
}

testAutoResolve();