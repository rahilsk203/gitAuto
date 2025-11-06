const fs = require('fs');
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');

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
async function login() {
  const credentials = loadCredentials();
  if (credentials.token) {
    console.log(`✅ Already logged in as ${credentials.username}`);
    return credentials;
  }

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

  saveCredentials(answers.username, answers.token);
  return { username: answers.username, token: answers.token };
}

module.exports = {
  loadCredentials,
  saveCredentials,
  login
};