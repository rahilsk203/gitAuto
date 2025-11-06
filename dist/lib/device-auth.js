const axios = require('axios');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CREDENTIALS_FILE = path.join(os.homedir(), '.git_credentials.json');
// Public OAuth App client ID for gitAuto (this is safe to include in public code)
const GITHUB_CLIENT_ID = 'Iv1.9d324041ff0d4fb7';
const GITHUB_DEVICE_CODE_URL = 'https://github.com/login/device/code';
const GITHUB_DEVICE_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_API_URL = 'https://api.github.com/user';

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
 * Get device code from GitHub
 * @returns {Promise<Object>} Device code response
 */
async function getDeviceCode() {
  try {
    const response = await axios.post(GITHUB_DEVICE_CODE_URL, {
      client_id: GITHUB_CLIENT_ID,
      scope: 'repo'
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get device code: ${error.response?.data?.error_description || error.message}`);
  }
}

/**
 * Poll for access token
 * @param {string} deviceCode - Device code
 * @param {number} interval - Polling interval in seconds
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {Promise<string>} Access token
 */
async function pollForAccessToken(deviceCode, interval, expiresIn) {
  const startTime = Date.now();
  const expirationTime = startTime + (expiresIn * 1000);
  
  while (Date.now() < expirationTime) {
    try {
      const response = await axios.post(GITHUB_DEVICE_TOKEN_URL, {
        client_id: GITHUB_CLIENT_ID,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
      }, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const data = response.data;
      
      if (data.access_token) {
        return data.access_token;
      } else if (data.error === 'authorization_pending') {
        // Wait for the specified interval before polling again
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
      } else if (data.error === 'slow_down') {
        // Wait for interval + 5 seconds
        await new Promise(resolve => setTimeout(resolve, (interval + 5) * 1000));
      } else {
        throw new Error(`Authentication error: ${data.error_description || data.error}`);
      }
    } catch (error) {
      if (error.response?.data?.error === 'authorization_pending') {
        // Wait for the specified interval before polling again
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
      } else {
        throw new Error(`Failed to get access token: ${error.response?.data?.error_description || error.message}`);
      }
    }
  }
  
  throw new Error('Authentication timeout. Please try again.');
}

/**
 * Get GitHub username using access token
 * @param {string} token - Access token
 * @returns {Promise<string>} GitHub username
 */
async function getGitHubUsername(token) {
  try {
    const response = await axios.get(GITHUB_USER_API_URL, {
      headers: {
        'Authorization': `token ${token}`
      }
    });
    
    return response.data.login;
  } catch (error) {
    throw new Error(`Failed to get user info: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Authenticate using GitHub device flow
 * @returns {Promise<Object>} Username and token
 */
async function deviceFlowAuth() {
  try {
    console.log('🔐 Initiating GitHub device flow authentication...');
    
    // Step 1: Get device code
    const deviceCodeResponse = await getDeviceCode();
    
    const { device_code, user_code, verification_uri, interval, expires_in } = deviceCodeResponse;
    
    console.log('\n📝 Please visit the following URL to authenticate:');
    console.log(`   ${verification_uri}`);
    console.log(`\n🔢 Enter this code: ${user_code}`);
    console.log('\n⏳ Waiting for authentication...');
    
    // Step 2: Poll for access token
    const token = await pollForAccessToken(device_code, interval, expires_in);
    
    // Step 3: Get username
    const username = await getGitHubUsername(token);
    
    console.log(`\n✅ Successfully authenticated as ${username}!`);
    
    // Save credentials
    saveCredentials(username, token);
    
    return { username, token };
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    return { username: null, token: null };
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
 * Main authentication function
 * @returns {Promise<Object>} Username and token
 */
async function authenticate() {
  const credentials = loadCredentials();
  if (credentials.token) {
    console.log(`✅ Already logged in as ${credentials.username}`);
    return credentials;
  }

  console.log('\n🔐 GitHub Authentication');
  console.log('=====================');
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'loginMethod',
      message: 'How would you like to login?',
      choices: [
        { name: 'Device Flow (Terminal-based)', value: 'device' },
        { name: 'Manual Token Entry', value: 'manual' }
      ]
    }
  ]);

  let username, token;
  
  switch (answers.loginMethod) {
    case 'device':
      const deviceResult = await deviceFlowAuth();
      username = deviceResult.username;
      token = deviceResult.token;
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

module.exports = {
  loadCredentials,
  saveCredentials,
  authenticate
};