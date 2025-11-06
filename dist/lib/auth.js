const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { exec, execSync } = require('child_process');
const { executeCommandSync, commandExistsOptimized } = require('./core');

/**
 * Advanced Authentication for gitAuto
 * Implements secure credential management and multiple authentication methods
 */

// Configuration
const CREDENTIALS_FILE = path.join(os.homedir(), '.gitauto_credentials.json');
const CONFIG_FILE = path.join(os.homedir(), '.gitauto_config.json');

// Cache for credentials
let credentialsCache = null;
let cacheTimestamp = 0;
const CACHE_TIMEOUT = 30000; // 30 seconds

/**
 * Encrypt sensitive data
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted text
 */
function encrypt(text, key) {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 * @param {string} text - Text to decrypt
 * @param {string} key - Decryption key
 * @returns {string} Decrypted text
 */
function decrypt(text, key) {
  const algorithm = 'aes-256-cbc';
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encrypted = parts.join(':');
  const decipher = crypto.createDecipher(algorithm, key);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Generate a secure key from system information
 * @returns {string} Secure key
 */
function generateSecureKey() {
  const systemInfo = [
    os.hostname(),
    os.platform(),
    os.arch(),
    os.userInfo().username
  ].join(':');
  
  return crypto.createHash('sha256').update(systemInfo).digest('hex').substring(0, 32);
}

/**
 * Save credentials securely
 * @param {Object} credentials - Credentials to save
 */
function saveCredentials(credentials) {
  try {
    const key = generateSecureKey();
    const encryptedToken = credentials.token ? encrypt(credentials.token, key) : null;
    
    const data = {
      username: credentials.username,
      token: encryptedToken,
      timestamp: Date.now()
    };
    
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(data), 'utf8');
    credentialsCache = credentials;
    cacheTimestamp = Date.now();
  } catch (error) {
    console.error('❌ Error saving credentials:', error.message);
  }
}

/**
 * Load saved credentials
 * @returns {Object|null} Credentials object or null if not found
 */
function loadCredentialsAdvanced() {
  // Check cache first
  if (credentialsCache && (Date.now() - cacheTimestamp < CACHE_TIMEOUT)) {
    return credentialsCache;
  }
  
  try {
    // Try to get credentials from GitHub CLI first
    if (commandExistsOptimized('gh')) {
      try {
        // Check if user is logged in
        execSync('gh auth status', { stdio: 'ignore' });
        
        const token = executeCommandSync('gh auth token', { encoding: 'utf8' }).trim();
        const statusOutput = executeCommandSync('gh auth status', { encoding: 'utf8' });
        const usernameMatch = statusOutput.match(/Logged in to github\.com as (\S+)/);
        const username = usernameMatch ? usernameMatch[1] : 'unknown';
        
        const credentials = { username, token };
        credentialsCache = credentials;
        cacheTimestamp = Date.now();
        return credentials;
      } catch (error) {
        // GitHub CLI not logged in or other error
      }
    }
    
    // Try to load from saved credentials file
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
      
      // Check if credentials are still valid (less than 24 hours old)
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        const key = generateSecureKey();
        const token = data.token ? decrypt(data.token, key) : null;
        
        const credentials = { username: data.username, token };
        credentialsCache = credentials;
        cacheTimestamp = Date.now();
        return credentials;
      } else {
        // Credentials expired, remove file
        fs.unlinkSync(CREDENTIALS_FILE);
      }
    }
    
    return { username: null, token: null };
  } catch (error) {
    return { username: null, token: null };
  }
}

/**
 * Clear saved credentials
 */
function clearCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      fs.unlinkSync(CREDENTIALS_FILE);
    }
    credentialsCache = null;
    cacheTimestamp = 0;
    console.log('🧹 Credentials cleared');
  } catch (error) {
    console.error('❌ Error clearing credentials:', error.message);
  }
}

/**
 * Advanced authentication using GitHub CLI with fallback options
 * @returns {Promise<Object>} Username and token
 */
async function loginAdvanced() {
  const credentials = loadCredentialsAdvanced();
  if (credentials.token) {
    console.log(`✅ Already logged in as ${credentials.username}`);
    return credentials;
  }

  console.log('\n🔐 GitHub Authentication');
  console.log('=====================');
  
  // Check if GitHub CLI is available
  if (commandExistsOptimized('gh')) {
    console.log('Using GitHub CLI for authentication...');
    
    try {
      // Run gh auth login command
      await new Promise((resolve, reject) => {
        const child = exec('gh auth login', { stdio: 'inherit' });
        
        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`gh auth login exited with code ${code}`));
          }
        });
      });
      
      // Get the new credentials
      const newCredentials = loadCredentialsAdvanced();
      if (newCredentials.token) {
        console.log(`✅ Successfully logged in as ${newCredentials.username}`);
        saveCredentials(newCredentials);
        return newCredentials;
      } else {
        console.log('❌ Authentication failed');
        return { username: null, token: null };
      }
    } catch (error) {
      console.error('❌ Failed to run gh auth login:', error.message);
      return { username: null, token: null };
    }
  } else {
    // Fallback to manual token entry
    console.log('GitHub CLI not found. Please install it or enter a personal access token manually.');
    console.log('Visit https://github.com/settings/tokens to generate a new token.');
    
    const token = await promptForToken();
    if (token) {
      const username = await getUsernameFromToken(token);
      if (username) {
        const credentials = { username, token };
        console.log(`✅ Successfully authenticated as ${username}`);
        saveCredentials(credentials);
        return credentials;
      }
    }
    
    console.log('❌ Authentication failed');
    return { username: null, token: null };
  }
}

/**
 * Prompt user for personal access token
 * @returns {Promise<string|null>} Token or null if cancelled
 */
function promptForToken() {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Enter your GitHub personal access token (or press Enter to cancel): ', (token) => {
      rl.close();
      resolve(token.trim() || null);
    });
  });
}

/**
 * Get GitHub username from personal access token
 * @param {string} token - Personal access token
 * @returns {Promise<string|null>} Username or null if invalid
 */
async function getUsernameFromToken(token) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'gitauto-cli'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      return userData.login;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error validating token:', error.message);
    return null;
  }
}

/**
 * Get user configuration
 * @returns {Object} Configuration object
 */
function getConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (error) {
    // Ignore errors
  }
  
  // Return default configuration
  return {
    autoCommit: true,
    autoPush: false,
    defaultBranch: 'main',
    commitMessageTemplate: 'Auto commit - {date}'
  };
}

/**
 * Save user configuration
 * @param {Object} config - Configuration to save
 */
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('❌ Error saving configuration:', error.message);
  }
}

/**
 * Clear user configuration
 */
function clearConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
    console.log('🧹 Configuration cleared');
  } catch (error) {
    console.error('❌ Error clearing configuration:', error.message);
  }
}

// At the bottom of the file, update the module.exports to match what menu.js expects
module.exports = {
  loadCredentials: loadCredentialsAdvanced,
  loginAdvanced,
  clearCredentials,
  getConfig,
  saveConfig,
  clearConfig
};