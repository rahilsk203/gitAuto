const { addFilesAdvanced } = require('../lib/git-operations/add-commit');
const { commitChangesAdvanced } = require('../lib/git-operations/add-commit');
const { pullRepoAdvanced } = require('../lib/git-operations/pull');
const { pushRepoAdvanced } = require('../lib/git-operations/push');
const { cloneRepoAdvanced } = require('../lib/git-operations/clone-repo');

/**
 * Integration test for all Git operations with smart error resolver
 */
async function runIntegrationTest() {
  console.log('🧪 Running Integration Test for Git Operations with Smart Error Resolver...\n');
  
  // Test add operation
  console.log('1. Testing addFilesAdvanced...');
  try {
    const addResult = await addFilesAdvanced();
    console.log(`Add result: ${JSON.stringify(addResult)}\n`);
  } catch (error) {
    console.log(`Add error: ${error.message}\n`);
  }
  
  // Test commit operation
  console.log('2. Testing commitChangesAdvanced...');
  try {
    const commitResult = await commitChangesAdvanced('Integration test commit');
    console.log(`Commit result: ${JSON.stringify(commitResult)}\n`);
  } catch (error) {
    console.log(`Commit error: ${error.message}\n`);
  }
  
  // Test pull operation
  console.log('3. Testing pullRepoAdvanced...');
  try {
    const pullResult = await pullRepoAdvanced();
    console.log(`Pull result: ${JSON.stringify(pullResult)}\n`);
  } catch (error) {
    console.log(`Pull error: ${error.message}\n`);
  }
  
  // Test push operation
  console.log('4. Testing pushRepoAdvanced...');
  try {
    const pushResult = await pushRepoAdvanced('Integration test commit');
    console.log(`Push result: ${JSON.stringify(pushResult)}\n`);
  } catch (error) {
    console.log(`Push error: ${error.message}\n`);
  }
  
  console.log('✅ Integration test completed!');
}

// Run the integration test
runIntegrationTest().catch(console.error);