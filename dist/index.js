#!/usr/bin/env node

const menu = require('./lib/menu');
const auth = require('./lib/auth');

async function main() {
  try {
    // Auto-configure git settings
    await auth.autoConfigureGit();
    
    // Check if already logged in
    const credentials = auth.loadCredentials();
    if (!credentials.token) {
      console.log('Welcome to GitAuto!');
      await auth.login();
    }
    
    // Start the main menu
    await menu.showMainMenu();
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main;