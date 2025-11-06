const fs = require('fs');
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');
const ghCli = require('./gh-cli');

const CREDENTIALS_FILE = path.join(os.homedir(), '.git_credentials.json');

/**
 * Load saved GitHub credentials
 * @returns {Object} Credentials object with username and token
 */
function loadCredentials() {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    try {
      const data = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error reading credentials file:', error.message);
      return { username: null, token: null };
    }
  }
  return { username: null, token: null };
}

/**
 * Save GitHub credentials securely
 * @param {string} username - GitHub username
 * @param {string} token - GitHub Personal Access Token
 */
function saveCredentials(username, token) {
  try {
    const credentials = { username, token };
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
    console.log('✅ GitHub credentials saved!');
  } catch (error) {
    console.error('❌ Error saving credentials:', error.message);
  }
}

/**
 * Login using GitHub username & token
 */
async function manualLogin() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Enter GitHub username:',
      validate: input => input.length > 0 || 'Username cannot be empty'
    },
    {
      type: 'password',
      name: 'token',
      message: 'Enter GitHub Personal Access Token (PAT):',
      validate: input => input.length > 0 || 'Token cannot be empty'
    }
  ]);

  return { username: answers.username, token: answers.token };
}

/**
 * Login using GitHub CLI
 */
async function ghCliLogin() {
  console.log('🔐 Logging in with GitHub CLI...');
  const result = await ghCli.loginWithGhCli();
  
  if (result.username && result.token) {
    return result;
  }
  
  console.log('❌ GitHub CLI login failed. Falling back to manual token entry...');
  return await manualLogin();
}

/**
 * Login using GitHub username & token or GitHub CLI
 */
async function login() {
  const credentials = loadCredentials();
  if (credentials.token) {
    console.log(`✅ Already logged in as ${credentials.username}`);
    return credentials;
  }

  console.log('\n🔐 GitHub Authentication');
  console.log('=====================');
  
  // Check if GitHub CLI is available
  const ghInstalled = ghCli.isGhInstalled();
  const ghAuthStatus = ghInstalled ? ghCli.getGhAuthStatus() : { authenticated: false };
  
  const choices = [
    { name: 'Manual Token Entry', value: 'manual' }
  ];
  
  if (ghInstalled) {
    if (ghAuthStatus.authenticated) {
      choices.unshift({ name: `GitHub CLI (already logged in as ${ghAuthStatus.username})`, value: 'gh-cli' });
    } else {
      choices.unshift({ name: 'GitHub CLI', value: 'gh-cli' });
    }
  }
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'loginMethod',
      message: 'How would you like to login?',
      choices
    }
  ]);

  let username, token;
  
  switch (answers.loginMethod) {
    case 'gh-cli':
      const ghResult = await ghCliLogin();
      username = ghResult.username;
      token = ghResult.token;
      break;
    case 'manual':
    default:
      const manualCreds = await manualLogin();
      username = manualCreds.username;
      token = manualCreds.token;
      break;
  }

  if (username && token) {
    saveCredentials(username, token);
    return { username, token };
  }
  
  return { username: null, token: null };
}

/**
 * Auto-configure git user settings
 */
async function autoConfigureGit() {
  const { execSync } = require('child_process');
  
  try {
    // Get current git config
    let userName, userEmail;
    
    try {
      userName = execSync('git config --global user.name', { encoding: 'utf8' }).trim();
      userEmail = execSync('git config --global user.email', { encoding: 'utf8' }).trim();
    } catch (error) {
      // Git config not set
      userName = '';
      userEmail = '';
    }
    
    if (!userName || !userEmail) {
      console.log('🔧 Auto-configuring Git user settings...');
      
      if (!userName) {
        const nameAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Enter your Git user name:',
            default: os.userInfo().username
          }
        ]);
        userName = nameAnswer.name;
        execSync(`git config --global user.name "${userName}"`);
      }
      
      if (!userEmail) {
        const emailAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'email',
            message: 'Enter your Git user email:',
            default: `${os.userInfo().username}@users.noreply.github.com`
          }
        ]);
        userEmail = emailAnswer.email;
        execSync(`git config --global user.email "${userEmail}"`);
      }
      
      console.log('✅ Git user settings configured successfully!');
    } else {
      console.log(`✅ Git user settings already configured: ${userName} <${userEmail}>`);
    }
  } catch (error) {
    console.error('❌ Error configuring Git user settings:', error.message);
  }
}

module.exports = {
  loadCredentials,
  saveCredentials,
  login,
  autoConfigureGit
};