const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const open = require('open');

/**
 * Check if GitHub CLI is installed
 * @returns {boolean} True if gh is installed
 */
function isGhInstalled() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get GitHub CLI auth status
 * @returns {Object} Auth status and username if logged in
 */
function getGhAuthStatus() {
  try {
    // Check if gh is authenticated
    const statusOutput = execSync('gh auth status', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    // Extract username from status output
    const usernameMatch = statusOutput.match(/Logged in to github\.com as (\S+)/);
    if (usernameMatch) {
      return {
        authenticated: true,
        username: usernameMatch[1]
      };
    }
    
    return { authenticated: true, username: null };
  } catch (error) {
    return { authenticated: false, username: null };
  }
}

/**
 * Get GitHub token from GitHub CLI
 * @returns {string|null} GitHub token or null if not available
 */
function getGhToken() {
  try {
    // Get token for github.com
    const tokenOutput = execSync('gh auth token', { encoding: 'utf8' });
    return tokenOutput.trim();
  } catch (error) {
    return null;
  }
}

/**
 * Install GitHub CLI (platform-specific)
 * @returns {Promise<boolean>} True if installation was successful
 */
async function installGhCli() {
  console.log('🔧 Installing GitHub CLI...');
  
  try {
    // Detect platform
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Windows - use Chocolatey or Scoop if available, otherwise show instructions
      try {
        execSync('choco --version', { stdio: 'ignore' });
        execSync('choco install gh -y');
        console.log('✅ GitHub CLI installed via Chocolatey');
        return true;
      } catch (error) {
        try {
          execSync('scoop --version', { stdio: 'ignore' });
          execSync('scoop install gh');
          console.log('✅ GitHub CLI installed via Scoop');
          return true;
        } catch (error) {
          console.log('ℹ️  To install GitHub CLI on Windows:');
          console.log('   1. Visit https://cli.github.com/');
          console.log('   2. Download and run the Windows installer');
          console.log('   3. Or install via Chocolatey: choco install gh');
          console.log('   4. Or install via Scoop: scoop install gh');
          return false;
        }
      }
    } else if (platform === 'darwin') {
      // macOS - use Homebrew
      try {
        execSync('brew --version', { stdio: 'ignore' });
        execSync('brew install gh');
        console.log('✅ GitHub CLI installed via Homebrew');
        return true;
      } catch (error) {
        console.log('ℹ️  To install GitHub CLI on macOS:');
        console.log('   1. Install Homebrew if not already installed');
        console.log('   2. Run: brew install gh');
        return false;
      }
    } else if (platform === 'linux') {
      // Linux - try various package managers
      try {
        execSync('apt --version', { stdio: 'ignore' });
        execSync('sudo apt install gh');
        console.log('✅ GitHub CLI installed via APT');
        return true;
      } catch (error) {
        try {
          execSync('yum --version', { stdio: 'ignore' });
          execSync('sudo yum install gh');
          console.log('✅ GitHub CLI installed via YUM');
          return true;
        } catch (error) {
          try {
            execSync('dnf --version', { stdio: 'ignore' });
            execSync('sudo dnf install gh');
            console.log('✅ GitHub CLI installed via DNF');
            return true;
          } catch (error) {
            console.log('ℹ️  To install GitHub CLI on Linux:');
            console.log('   Visit https://github.com/cli/cli/blob/trunk/docs/install_linux.md');
            return false;
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error installing GitHub CLI:', error.message);
    return false;
  }
}

/**
 * Login using GitHub CLI with browser authentication
 * @returns {Promise<Object>} Username and token if successful
 */
async function loginWithGhCliBrowser() {
  return new Promise((resolve) => {
    console.log('🔐 Opening browser for GitHub CLI authentication...');
    
    // Start the gh auth login process with web option
    const authProcess = exec('gh auth login --web', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ GitHub CLI browser login failed:', error.message);
        resolve({ username: null, token: null });
        return;
      }
      
      // Try to get the authenticated user
      try {
        const status = getGhAuthStatus();
        const token = getGhToken();
        
        if (status.authenticated && token) {
          console.log('✅ Successfully authenticated with GitHub CLI');
          resolve({ username: status.username, token });
        } else {
          console.log('❌ GitHub CLI authentication failed');
          resolve({ username: null, token: null });
        }
      } catch (err) {
        console.error('❌ Error verifying GitHub CLI authentication:', err.message);
        resolve({ username: null, token: null });
      }
    });
    
    // Handle process output
    authProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    authProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}

/**
 * Login using GitHub CLI interactively
 * @returns {Promise<Object>} Username and token if successful
 */
async function loginWithGhCliInteractive() {
  return new Promise((resolve) => {
    console.log('🔐 Starting GitHub CLI interactive login...');
    
    // Start the gh auth login process
    const authProcess = exec('gh auth login', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ GitHub CLI login failed:', error.message);
        resolve({ username: null, token: null });
        return;
      }
      
      // Try to get the authenticated user
      try {
        const status = getGhAuthStatus();
        const token = getGhToken();
        
        if (status.authenticated && token) {
          console.log('✅ Successfully authenticated with GitHub CLI');
          resolve({ username: status.username, token });
        } else {
          console.log('❌ GitHub CLI authentication failed');
          resolve({ username: null, token: null });
        }
      } catch (err) {
        console.error('❌ Error verifying GitHub CLI authentication:', err.message);
        resolve({ username: null, token: null });
      }
    });
    
    // Handle process output
    authProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    authProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}

/**
 * Login using GitHub CLI
 * @returns {Promise<Object>} Username and token if successful
 */
async function loginWithGhCli() {
  if (!isGhInstalled()) {
    console.log('❌ GitHub CLI is not installed');
    const answer = await require('inquirer').prompt([
      {
        type: 'confirm',
        name: 'install',
        message: 'Would you like to install GitHub CLI?',
        default: true
      }
    ]);
    
    if (answer.install) {
      const installed = await installGhCli();
      if (!installed) {
        return { username: null, token: null };
      }
    } else {
      return { username: null, token: null };
    }
  }
  
  // Check if already authenticated
  const authStatus = getGhAuthStatus();
  if (authStatus.authenticated) {
    console.log(`✅ Already authenticated with GitHub CLI as ${authStatus.username || 'unknown user'}`);
    
    // Get token
    const token = getGhToken();
    if (token) {
      return { username: authStatus.username, token };
    }
  }
  
  // Offer browser login option
  const answer = await require('inquirer').prompt([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to authenticate with GitHub CLI?',
      choices: [
        { name: 'Browser Authentication (Recommended)', value: 'browser' },
        { name: 'Interactive Terminal Login', value: 'interactive' }
      ]
    }
  ]);
  
  if (answer.method === 'browser') {
    return await loginWithGhCliBrowser();
  } else {
    return await loginWithGhCliInteractive();
  }
}

module.exports = {
  isGhInstalled,
  getGhAuthStatus,
  getGhToken,
  installGhCli,
  loginWithGhCli
};