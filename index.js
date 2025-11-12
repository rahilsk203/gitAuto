#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * gitAuto - A Node.js CLI tool for automating common GitHub repository management tasks
 * 
 * Features:
 * - Automatic dependency installation across all platforms including Termux
 * - Intelligent error handling with 100+ specific error scenarios
 * - Performance optimizations with DSA-level algorithms
 * - Automatic conflict resolution for Git operations
 * - Modular architecture for maintainability
 */

// Lightweight function to check if a command exists
function commandExists(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Function to check if a Node.js package is installed
function isPackageInstalled(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch {
    return false;
  }
}

// Function to install Node.js packages
function installNodePackages() {
  console.log('🔧 Installing required Node.js packages...');
  
  try {
    // Check if we're in the gitauto directory
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log('⚠️  package.json not found, skipping Node.js package installation');
      return true;
    }
    
    // Check if we're running in Termux
    const isTermux = process.env.PREFIX && process.env.PREFIX.includes('com.termux');
    
    // For Termux, we might need to use a different approach
    if (isTermux) {
      console.log('📱 Detected Termux environment, installing packages...');
      // In Termux, we can use npm directly
      execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    } else {
      // Install dependencies
      execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    }
    
    console.log('✅ Node.js packages installed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error installing Node.js packages:', error.message);
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
    
    // Check if we're running in Termux
    const isTermux = process.env.PREFIX && process.env.PREFIX.includes('com.termux');
    
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
      } else {
        // Try direct download for Windows
        console.log('📥 Downloading GitHub CLI for Windows...');
        execSync('powershell -Command "Invoke-WebRequest -Uri https://github.com/cli/cli/releases/latest/download/gh_windows_amd64.zip -OutFile gh.zip"', { stdio: 'inherit' });
        execSync('powershell -Command "Expand-Archive -Path gh.zip -DestinationPath ."', { stdio: 'inherit' });
        execSync('move gh_windows_amd64\\bin\\gh.exe "C:\\Program Files\\GitHub CLI\\"', { stdio: 'inherit' });
        execSync('del gh.zip', { stdio: 'inherit' });
        execSync('rmdir /s /q gh_windows_amd64', { stdio: 'inherit' });
        console.log('✅ GitHub CLI installed manually');
        console.log('🔄 Please restart your terminal or run "refreshenv" to update PATH');
        return true;
      }
    } else if (platform === 'darwin') {
      // macOS - try Homebrew first, then direct installation
      if (commandExists('brew')) {
        execSync('brew install gh', { stdio: 'inherit' });
        console.log('✅ GitHub CLI installed via Homebrew');
        return true;
      } else {
        // Direct installation for macOS
        console.log('📥 Downloading GitHub CLI for macOS...');
        execSync('curl -L https://github.com/cli/cli/releases/latest/download/gh_$(curl -s https://api.github.com/repos/cli/cli/releases/latest | grep tag_name | cut -d \\" -f 4 | sed "s/v//")_macOS_amd64.tar.gz -o gh.tar.gz', { stdio: 'inherit' });
        execSync('tar -xzf gh.tar.gz', { stdio: 'inherit' });
        execSync('sudo mv gh_*/bin/gh /usr/local/bin/', { stdio: 'inherit' });
        execSync('rm -rf gh_* gh.tar.gz', { stdio: 'inherit' });
        console.log('✅ GitHub CLI installed manually');
        return true;
      }
    } else if (platform === 'linux') {
      // Check for Termux first
      if (isTermux) {
        // Termux - use pkg
        execSync('pkg install gh -y', { stdio: 'inherit' });
        console.log('✅ GitHub CLI installed via pkg (Termux)');
        return true;
      }
      // Regular Linux - try apt first, then yum, then pacman
      else if (commandExists('apt')) {
        execSync('sudo apt update && sudo apt install gh -y', { stdio: 'inherit' });
        console.log('✅ GitHub CLI installed via APT');
        return true;
      } else if (commandExists('yum')) {
        execSync('sudo yum install gh -y', { stdio: 'inherit' });
        console.log('✅ GitHub CLI installed via YUM');
        return true;
      } else if (commandExists('pacman')) {
        execSync('sudo pacman -S github-cli --noconfirm', { stdio: 'inherit' });
        console.log('✅ GitHub CLI installed via Pacman');
        return true;
      } else {
        // Direct installation for Linux
        console.log('📥 Downloading GitHub CLI for Linux...');
        execSync('curl -L https://github.com/cli/cli/releases/latest/download/gh_$(curl -s https://api.github.com/repos/cli/cli/releases/latest | grep tag_name | cut -d \\" -f 4 | sed "s/v//")_linux_amd64.tar.gz -o gh.tar.gz', { stdio: 'inherit' });
        execSync('tar -xzf gh.tar.gz', { stdio: 'inherit' });
        execSync('sudo mv gh_*/bin/gh /usr/local/bin/', { stdio: 'inherit' });
        execSync('rm -rf gh_* gh.tar.gz', { stdio: 'inherit' });
        console.log('✅ GitHub CLI installed manually');
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

// Function to install Git
function installGit() {
  console.log('🔧 Installing Git...');
  
  try {
    const platform = process.platform;
    
    // Check if we're running in Termux
    const isTermux = process.env.PREFIX && process.env.PREFIX.includes('com.termux');
    
    if (platform === 'win32') {
      // Windows - try winget first, then chocolatey
      if (commandExists('winget')) {
        execSync('winget install Git.Git', { stdio: 'inherit' });
        console.log('✅ Git installed via winget');
        console.log('🔄 Please restart your terminal or run "refreshenv" to update PATH');
        return true;
      } else if (commandExists('choco')) {
        execSync('choco install git -y', { stdio: 'inherit' });
        console.log('✅ Git installed via Chocolatey');
        console.log('🔄 Please restart your terminal or run "refreshenv" to update PATH');
        return true;
      }
    } else if (platform === 'darwin') {
      // macOS - try Homebrew first
      if (commandExists('brew')) {
        execSync('brew install git', { stdio: 'inherit' });
        console.log('✅ Git installed via Homebrew');
        return true;
      }
    } else if (platform === 'linux') {
      // Check for Termux first
      if (isTermux) {
        // Termux - use pkg
        execSync('pkg install git -y', { stdio: 'inherit' });
        console.log('✅ Git installed via pkg (Termux)');
        return true;
      }
      // Regular Linux - try apt first, then yum, then pacman
      else if (commandExists('apt')) {
        execSync('sudo apt update && sudo apt install git -y', { stdio: 'inherit' });
        console.log('✅ Git installed via APT');
        return true;
      } else if (commandExists('yum')) {
        execSync('sudo yum install git -y', { stdio: 'inherit' });
        console.log('✅ Git installed via YUM');
        return true;
      } else if (commandExists('pacman')) {
        execSync('sudo pacman -S git --noconfirm', { stdio: 'inherit' });
        console.log('✅ Git installed via Pacman');
        return true;
      }
    }
    
    console.log('❌ Failed to install Git automatically');
    console.log('Please install Git manually:');
    console.log('   - Visit https://git-scm.com/');
    return false;
  } catch (error) {
    console.error('❌ Error installing Git:', error.message);
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
  
  let needsRestart = false;
  
  // Check Node.js and npm
  if (!commandExists('node') || !commandExists('npm')) {
    console.error('❌ Node.js and npm are required but not installed.');
    console.log('Please install Node.js (which includes npm) from https://nodejs.org/');
    return false;
  }
  console.log('✅ Node.js and npm are installed');
  
  // Check and install Node.js packages
  const requiredPackages = ['axios', 'inquirer'];
  let packagesInstalled = true;
  
  for (const pkg of requiredPackages) {
    if (!isPackageInstalled(pkg)) {
      console.log(`❌ Required package "${pkg}" is missing`);
      packagesInstalled = false;
    }
  }
  
  if (!packagesInstalled) {
    console.log('🔧 Installing missing Node.js packages...');
    if (!installNodePackages()) {
      console.error('❌ Failed to install required Node.js packages');
      return false;
    }
  } else {
    console.log('✅ All required Node.js packages are installed');
  }
  
  // Check Git
  if (!commandExists('git')) {
    console.log('❌ Git is not installed');
    if (!installGit()) {
      return false;
    }
    needsRestart = true;
  } else {
    console.log('✅ Git is installed');
  }
  
  // Check GitHub CLI
  if (!commandExists('gh')) {
    // On Windows, check if it's installed in a common location
    if (process.platform === 'win32') {
      const ghPath = findGitHubCLIOnWindows();
      if (ghPath) {
        console.log(`✅ GitHub CLI found at ${ghPath}`);
        console.log('🔧 Adding GitHub CLI to PATH for this session...');
        // Add to PATH for this session (append rather than prepend)
        const currentPath = process.env.PATH;
        const ghDir = path.dirname(ghPath);
        process.env.PATH = `${currentPath};${ghDir}`;
        
        // Verify it works now
        if (commandExists('gh')) {
          console.log('✅ GitHub CLI is now available in PATH');
          return true;
        } else {
          console.log('⚠️  GitHub CLI found but not accessible. You may need to restart your terminal.');
        }
      }
    }
    
    console.log('❌ GitHub CLI is not installed');
    const installed = installGitHubCLI();
    if (!installed) {
      return false;
    }
    needsRestart = true;
  } else {
    console.log('✅ GitHub CLI is installed');
  }
  
  // If we installed something that requires a restart, inform the user
  if (needsRestart && process.platform === 'win32') {
    console.log('⚠️  Please restart your terminal or run "refreshenv" to update PATH');
    console.log('   Then run "gitauto" again');
    return false;
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
    const credentials = await auth.loginAdvanced();
    if (!credentials.token) {
      console.error('❌ Authentication failed. Exiting...');
      process.exit(1);
    }
    
    // Start the main menu
    await menu.showMainMenuAdvanced();
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  initialize();
}

// Export functions for testing
module.exports = {
  initialize,
  commandExists,
  isPackageInstalled,
  findGitHubCLIOnWindows,
  installNodePackages,
  installGitHubCLI,
  installGit,
  autoConfigureGit,
  checkAndInstallRequirements
};