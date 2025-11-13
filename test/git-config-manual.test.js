/**
 * Manual test script to verify git configuration functionality
 * This script temporarily removes git configuration and tests the prompting functionality
 */

const { execSync } = require('child_process');
const { checkAndConfigureGit } = require('../lib/git-config');

// Save original values
let originalName, originalEmail;

console.log('🧪 Testing Git Configuration Module');

try {
  // Save current git config
  try {
    originalName = execSync('git config --global user.name', { encoding: 'utf8' }).trim();
    console.log(`💾 Saved original username: ${originalName}`);
  } catch (error) {
    originalName = null;
    console.log('ℹ️  No original username found');
  }
  
  try {
    originalEmail = execSync('git config --global user.email', { encoding: 'utf8' }).trim();
    console.log(`💾 Saved original email: ${originalEmail}`);
  } catch (error) {
    originalEmail = null;
    console.log('ℹ️  No original email found');
  }
  
  // Temporarily remove git configuration
  console.log('\n🔄 Removing git configuration for testing...');
  try {
    execSync('git config --global --unset user.name');
    console.log('✅ Removed username configuration');
  } catch (error) {
    console.log('ℹ️  Username was not configured');
  }
  
  try {
    execSync('git config --global --unset user.email');
    console.log('✅ Removed email configuration');
  } catch (error) {
    console.log('ℹ️  Email was not configured');
  }
  
  // Test the configuration function
  console.log('\n🔍 Testing checkAndConfigureGit()...');
  const result = checkAndConfigureGit();
  console.log(`✅ Configuration result: ${result}`);
  
  // Restore original values
  console.log('\n🔄 Restoring original configuration...');
  if (originalName) {
    try {
      execSync(`git config --global user.name "${originalName}"`);
      console.log(`✅ Restored username: ${originalName}`);
    } catch (error) {
      console.log('⚠️  Failed to restore username');
    }
  }
  
  if (originalEmail) {
    try {
      execSync(`git config --global user.email "${originalEmail}"`);
      console.log(`✅ Restored email: ${originalEmail}`);
    } catch (error) {
      console.log('⚠️  Failed to restore email');
    }
  }
  
  console.log('\n🎉 Git Configuration Module test completed!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  
  // Attempt to restore configuration even if test failed
  if (originalName) {
    try {
      execSync(`git config --global user.name "${originalName}"`);
      console.log(`✅ Restored username after error: ${originalName}`);
    } catch (error) {
      console.log('⚠️  Failed to restore username after error');
    }
  }
  
  if (originalEmail) {
    try {
      execSync(`git config --global user.email "${originalEmail}"`);
      console.log(`✅ Restored email after error: ${originalEmail}`);
    } catch (error) {
      console.log('⚠️  Failed to restore email after error');
    }
  }
}