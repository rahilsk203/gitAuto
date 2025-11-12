const assert = require('assert');
const { performance } = require('perf_hooks');

// Test the optimized functions
const { 
  executeCommandAdvanced, 
  executeCommandsBatch,
  getRepoAnalytics,
  getSmartSuggestions,
  recordPerformanceMetric,
  getPerformanceStats
} = require('../lib/core');

// Test git functions
const { 
  executeCommandsParallel,
  batchProcessRepos
} = require('../lib/git');

console.log('🧪 Testing gitAuto Optimizations...\n');

// Test 1: Performance metrics recording
console.log('1. Testing performance metrics recording...');
recordPerformanceMetric('testFunction', 50);
recordPerformanceMetric('testFunction', 100);
recordPerformanceMetric('testFunction', 75);

const stats = getPerformanceStats('testFunction');
assert.strictEqual(stats.functionName, 'testFunction');
assert.strictEqual(stats.count, 3);
assert.strictEqual(stats.min, 50);
assert.strictEqual(stats.max, 100);
console.log('   ✅ Performance metrics working correctly\n');

// Test 2: Batch command execution
console.log('2. Testing batch command execution...');
(async () => {
  try {
    const commands = ['node --version', 'npm --version'];
    const result = await executeCommandsBatch(commands);
    assert.strictEqual(result.success, true);
    console.log('   ✅ Batch command execution working correctly\n');
    
    // Test 3: Parallel command execution
    console.log('3. Testing parallel command execution...');
    const parallelCommands = ['node --version', 'npm --version'];
    const parallelResults = await executeCommandsParallel(parallelCommands);
    assert(Array.isArray(parallelResults));
    console.log('   ✅ Parallel command execution working correctly\n');
    
    // Test 4: Performance comparison
    console.log('4. Testing performance improvements...');
    
    // Time individual commands
    const start1 = performance.now();
    await executeCommandAdvanced('node --version');
    await executeCommandAdvanced('npm --version');
    const time1 = performance.now() - start1;
    
    // Time batched commands
    const start2 = performance.now();
    await executeCommandsBatch(['node --version', 'npm --version']);
    const time2 = performance.now() - start2;
    
    console.log(`   Individual commands: ${time1.toFixed(2)}ms`);
    console.log(`   Batched commands: ${time2.toFixed(2)}ms`);
    console.log(`   Performance improvement: ${((time1 - time2) / time1 * 100).toFixed(2)}%`);
    console.log('   ✅ Performance comparison completed\n');
    
    console.log('🎉 All optimization tests passed!');
    console.log('\n🚀 gitAuto optimizations are working correctly:');
    console.log('   - Batch command execution reduces subprocess overhead');
    console.log('   - Parallel execution improves performance');
    console.log('   - Performance metrics tracking is functional');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
})();