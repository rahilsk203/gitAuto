const inquirer = require('inquirer');

// Test the permission prompts for auto-resolution
async function testPermissionPrompts() {
  console.log('Testing permission prompts for auto-resolution feature...');
  
  // Simulate the first prompt for auto-resolution
  const autoResolveAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'autoResolve',
      message: 'Would you like to automatically resolve this by pulling changes first?',
      default: true
    }
  ]);
  
  console.log('Auto-resolve answer:', autoResolveAnswer.autoResolve);
  
  if (autoResolveAnswer.autoResolve) {
    // Simulate the force push prompt
    const forcePushAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'forcePush',
        message: 'Would you like to force push? (⚠️ This will overwrite remote history!)',
        default: false
      }
    ]);
    
    console.log('Force push answer:', forcePushAnswer.forcePush);
  }
  
  console.log('✅ Permission prompt test completed successfully!');
}

testPermissionPrompts().catch(console.error);