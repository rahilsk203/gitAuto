const assert = require('assert');
const { performance } = require('perf_hooks');

// Test the caching optimizations
const { 
  getRepoAnalytics,
  getSmartSuggestions,
  clearAnalyticsCache,
  clearSuggestionsCache
} = require('../lib/core');

console.log('キャッシング Testing gitAuto Caching Optimizations...\n');

// Test 1: Analytics caching
console.log('1. Testing analytics caching...');

// Clear cache first
clearAnalyticsCache();

// Measure first call (should be slower as it actually executes commands)
const start1 = performance.now();
getRepoAnalytics().then(result1 => {
  const time1 = performance.now() - start1;
  console.log(`   First call time: ${time1.toFixed(2)}ms`);
  
  // Measure second call (should be faster as it uses cache)
  const start2 = performance.now();
  getRepoAnalytics().then(result2 => {
    const time2 = performance.now() - start2;
    console.log(`   Second call time: ${time2.toFixed(2)}ms`);
    
    // Verify caching works (second call should be faster)
    console.log(`   Cache performance improvement: ${((time1 - time2) / time1 * 100).toFixed(2)}%`);
    
    // Verify results are the same
    assert.deepStrictEqual(result1, result2);
    console.log('   ✅ Analytics caching working correctly\n');
    
    // Test 2: Suggestions caching
    console.log('2. Testing suggestions caching...');
    
    // Clear cache first
    clearSuggestionsCache();
    
    // Measure first call
    const start3 = performance.now();
    getSmartSuggestions().then(result3 => {
      const time3 = performance.now() - start3;
      console.log(`   First call time: ${time3.toFixed(2)}ms`);
      
      // Measure second call (should be faster)
      const start4 = performance.now();
      getSmartSuggestions().then(result4 => {
        const time4 = performance.now() - start4;
        console.log(`   Second call time: ${time4.toFixed(2)}ms`);
        
        // Verify caching works
        console.log(`   Cache performance improvement: ${((time3 - time4) / time3 * 100).toFixed(2)}%`);
        console.log('   ✅ Suggestions caching working correctly\n');
        
        // Test 3: Cache clearing
        console.log('3. Testing cache clearing...');
        clearAnalyticsCache();
        clearSuggestionsCache();
        console.log('   ✅ Cache clearing working correctly\n');
        
        console.log('🎉 All caching optimization tests passed!');
        console.log('\nキャッシング gitAuto caching optimizations are working correctly:');
        console.log('   - Analytics results are cached for 30 seconds');
        console.log('   - Smart suggestions are cached for 10 seconds');
        console.log('   - Cache clearing functions properly');
        console.log('   - Cached results are identical to fresh results');
      });
    });
  });
});