#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Lightweight function to check if a command exists
function commandExists(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Function to find GitHub CLI on Windows
function findGitHubCLIOnWindows() {
  const commonPaths = [
    'C:\\Program Files\\GitHub CLI\\gh.exe',
    'C:\\Program Files (x86)\\GitHub CLI\\gh.exe',
    path.join(os.homedir(), 'AppData', 'Local', 'GitHub CLI', 'gh.exe')
  ];
  
  for (const ghPath of commonPaths) {
    if (fs.existsSync(ghPath)) {
      return ghPath;
    }
  }
  
  return null;
}

// Function to install GitHub CLI
function installGitHubCLI() {
  console.log('🔧 Installing GitHub CLI...');
  
  try {
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Windows - try winget first, then chocolatey
      if (commandExists('winget')) {
        execSync('winget install GitHub.cli', { stdio: 'inherit' });
        console.log('✅ GitHub CLI installed via winget');
        console.log('🔄 Please restart your terminal or run "refreshenv" to update PATH');
        return true;
      } else if (commandExists('choco')) {
        execSync('choco install gh -y', { stdio: 'inherit' });
        console.log('✅ GitHub CLI installed via Chocolatey');
        console.log('🔄 Please restart your terminal or run "refreshenv" to update PATH');
        return true;
      }
    } else if (platform === 'darwin' && commandExists('brew')) {
      // macOS - use Homebrew
      execSync('brew install gh', { stdio: 'inherit' });
      console.log('✅ GitHub CLI installed via Homebrew');
      return true;
    } else if (platform === 'linux') {
      // Linux - try apt first, then yum
      if (commandExists('apt')) {
        execSync('sudo apt update && sudo apt install gh -y', { stdio: 'inherit' });
        console.log('✅ GitHub CLI installed via APT');
        return true;
      } else if (commandExists('yum')) {
        execSync('sudo yum install gh -y', { stdio: 'inherit' });
        console.log('✅ GitHub CLI installed via YUM');
        return true;
      }
    }
    
    console.log('❌ Failed to install GitHub CLI automatically');
    console.log('Please install GitHub CLI manually:');
    console.log('   - Visit https://cli.github.com/');
    return false;
  } catch (error) {
    console.error('❌ Error installing GitHub CLI:', error.message);
    return false;
  }
}

// Function to auto-configure git user settings
function autoConfigureGit() {
  try {
    // Only configure if not already set
    try {
      execSync('git config --global user.name', { stdio: 'ignore' });
      execSync('git config --global user.email', { stdio: 'ignore' });
      console.log('✅ Git user settings already configured');
      return true;
    } catch {
      // Settings not configured, proceed with auto-configuration
    }
    
    console.log('🔧 Auto-configuring Git user settings...');
    
    // Get system username
    const systemUsername = os.userInfo().username;
    
    // Set git user name
    execSync(`git config --global user.name "${systemUsername}"`, { stdio: 'ignore' });
    
    // Set git user email
    const email = `${systemUsername}@users.noreply.github.com`;
    execSync(`git config --global user.email "${email}"`, { stdio: 'ignore' });
    
    console.log(`✅ Git user settings configured: ${systemUsername} <${email}>`);
    return true;
  } catch (error) {
    console.error('❌ Error configuring Git user settings:', error.message);
    return false;
  }
}

// Check and install required tools
function checkAndInstallRequirements() {
  console.log('🔍 Checking for required tools...');
  
  // Check Node.js
  if (!commandExists('node')) {
    console.error('❌ Node.js is not installed. Please install Node.js from https://nodejs.org/');
    return false;
  }
  console.log('✅ Node.js is installed');
  
  // Check Git
  if (!commandExists('git')) {
    console.error('❌ Git is not installed. Please install Git from https://git-scm.com/');
    return false;
  }
  console.log('✅ Git is installed');
  
  // Check GitHub CLI
  if (!commandExists('gh')) {
    // On Windows, check if it's installed in a common location
    if (process.platform === 'win32') {
      const ghPath = findGitHubCLIOnWindows();
      if (ghPath) {
        console.log(`✅ GitHub CLI found at ${ghPath}`);
        console.log('🔧 Adding GitHub CLI to PATH for this session...');
        // Add to PATH for this session
        const currentPath = process.env.PATH;
        const ghDir = path.dirname(ghPath);
        process.env.PATH = `${ghDir};${currentPath}`;
        
        // Verify it works now
        if (commandExists('gh')) {
          console.log('✅ GitHub CLI is now available');
          return true;
        }
      }
    }
    
    console.log('❌ GitHub CLI is not installed');
    const installed = installGitHubCLI();
    if (!installed) {
      return false;
    }
    // After installation on Windows, we need to inform the user to restart terminal
    if (process.platform === 'win32') {
      console.log('⚠️  Please restart your terminal or run "refreshenv" to update PATH');
      console.log('   Then run "gitauto" again');
      return false;
    }
  } else {
    console.log('✅ GitHub CLI is installed');
  }
  
  return true;
}

// Initialize the application
async function initialize() {
  // Check and install requirements
  if (!checkAndInstallRequirements()) {
    if (commandExists('gh')) {
      // If gh is now available, continue
      console.log('✅ GitHub CLI is now available');
    } else {
      console.error('\nPlease install the missing tools and try again.');
      process.exit(1);
    }
  }
  
  // Auto-configure git settings
  autoConfigureGit();
  
  try {
    // Import modules after checking requirements
    const menu = require('./lib/menu');
    const auth = require('./lib/auth');
    
    // Login using GitHub CLI
    const credentials = await auth.login();
    if (!credentials.token) {
      console.error('❌ Authentication failed. Exiting...');
      process.exit(1);
    }
    
    // Start the main menu
    await menu.showMainMenu();
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  initialize();
}

module.exports = initialize;