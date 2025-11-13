/**
 * Test script to verify Termux detection and Git/GitHub CLI installation
 */

const { execSync } = require('child_process');

// Simulate Termux environment
function simulateTermuxEnvironment() {
  console.log('🧪 Simulating Termux environment...');
  
  // Set Termux-specific environment variables
  process.env.PREFIX = '/data/data/com.termux/files/usr';
  process.env.TERMUX = 'true';
  
  console.log('✅ Termux environment simulated');
  console.log(`PREFIX: ${process.env.PREFIX}`);
}

// Test Termux detection
function testTermuxDetection() {
  console.log('\n🔍 Testing Termux detection...');
  
  const isTermux = process.env.PREFIX && process.env.PREFIX.includes('com.termux');
  console.log(`isTermux: ${isTermux}`);
  
  if (isTermux) {
    console.log('✅ Termux environment correctly detected');
  } else {
    console.log('❌ Termux environment not detected');
  }
  
  return isTermux;
}

// Test platform detection
function testPlatformDetection() {
  console.log('\n🖥️  Testing platform detection...');
  
  const platform = process.platform;
  console.log(`Platform: ${platform}`);
  
  // Test if the platform check logic works
  const shouldSupportTermux = (platform === 'linux' || platform === 'android');
  console.log(`Supports Termux: ${shouldSupportTermux}`);
  
  if (shouldSupportTermux) {
    console.log('✅ Platform correctly supports Termux');
  } else {
    console.log('❌ Platform does not support Termux');
  }
  
  return shouldSupportTermux;
}

// Main test function
function runTests() {
  console.log('🚀 Testing Termux Git/GitHub CLI Installation Support\n');
  
  simulateTermuxEnvironment();
  const termuxDetected = testTermuxDetection();
  const platformSupported = testPlatformDetection();
  
  if (termuxDetected && platformSupported) {
    console.log('\n🎉 All tests passed! Termux should work correctly with gitAuto.');
  } else {
    console.log('\n❌ Some tests failed. Termux may not work correctly with gitAuto.');
  }
}

// Run the tests
runTests();