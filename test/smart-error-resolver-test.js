const { smartErrorResolver } = require('../lib/git-operations/error-resolver');

/**
 * Test the smart error resolver functionality
 */
async function testSmartErrorResolver() {
  console.log('🧪 Testing Smart Error Resolver...\n');
  
  // Test cases for different error scenarios
  const testCases = [
    {
      name: 'Not a Git repository',
      error: 'fatal: not a git repository (or any of the parent directories): .git',
      expected: 'resolveNotGitRepo'
    },
    {
      name: 'Git index lock',
      error: 'fatal: Unable to create \'/.git/index.lock\': File exists.',
      expected: 'resolveIndexLock'
    },
    {
      name: 'Permission denied',
      error: 'Permission denied (publickey)',
      expected: 'resolvePermissionIssues'
    },
    {
      name: 'Large file issues',
      error: 'remote: error: File bigfile.zip is 120.00 MB; this exceeds GitHub\'s file size limit of 100.00 MB',
      expected: 'resolveLargeFiles'
    },
    {
      name: 'Corrupted index',
      error: 'error: bad index file sha1 signature',
      expected: 'resolveCorruptedIndex'
    },
    {
      name: 'Merge conflicts',
      error: 'Auto-merging file.txt\nCONFLICT (content): Merge conflict in file.txt',
      expected: 'resolveMergeConflicts'
    },
    {
      name: 'Branch configuration',
      error: 'fatal: Couldn\'t find remote ref main',
      expected: 'resolveBranchConfig'
    },
    {
      name: 'Authentication issues',
      error: 'Authentication failed for \'https://github.com/user/repo.git/\'',
      expected: 'resolveAuthIssues'
    },
    {
      name: 'Network issues',
      error: 'Could not resolve host: github.com',
      expected: 'resolveNetworkIssues'
    },
    {
      name: 'Git configuration',
      error: 'fatal: empty ident name (for <>) not allowed',
      expected: 'resolveGitConfig'
    },
    {
      name: 'Remote repository',
      error: 'remote: Repository not found.',
      expected: 'resolveRemoteRepo'
    },
    {
      name: 'Disk space',
      error: 'No space left on device',
      expected: 'resolveDiskSpace'
    }
  ];
  
  // Run tests
  let passedTests = 0;
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Error: ${testCase.error}`);
    
    try {
      const result = await smartErrorResolver(testCase.error);
      console.log(`Result: ${JSON.stringify(result)}`);
      
      if (result && result.message) {
        console.log(`✅ Test passed: ${testCase.name}\n`);
        passedTests++;
      } else {
        console.log(`❌ Test failed: ${testCase.name}\n`);
      }
    } catch (error) {
      console.log(`❌ Test failed with error: ${testCase.name} - ${error.message}\n`);
    }
  }
  
  // Summary
  console.log(`\n📊 Test Results: ${passedTests}/${testCases.length} tests passed`);
  
  if (passedTests === testCases.length) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Please review the implementation.');
  }
}

// Run the test
testSmartErrorResolver().catch(console.error);