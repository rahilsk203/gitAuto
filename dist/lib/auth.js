const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec, execSync } = require('child_process');
const { executeCommandSync, commandExistsOptimized } = require('./core');

/**
 * Advanced Authentication for gitAuto
 * Implements secure credential management and multiple authentication methods
 */

// Configuration
const CONFIG_FILE = path.join(os.homedir(), '.gitauto_config.json');

// Cache for credentials
let credentialsCache = null;
let cacheTimestamp = 0;
const CACHE_TIMEOUT = 30000; // 30 seconds

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
    
    return { username: null, token: null };
  } catch (error) {
    return { username: null, token: null };
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
      // Check if user is logged in
      execSync('gh auth status', { stdio: 'ignore' });
      
      // Get the new credentials
      const newCredentials = loadCredentialsAdvanced();
      if (newCredentials.token) {
        console.log(`✅ Successfully logged in as ${newCredentials.username}`);
        saveCredentials(newCredentials);
        return newCredentials;
      }
    } catch (error) {
      console.error('❌ You are not logged in to GitHub CLI.');
      console.log('Attempting to authenticate with GitHub CLI...');
      
      try {
        execSync('gh auth login --hostname github.com', { stdio: 'inherit' });
        
        const newCredentials = loadCredentialsAdvanced();
        if (newCredentials.token) {
          console.log(`✅ Successfully logged in as ${newCredentials.username}`);
          return newCredentials;
        }
      } catch (authError) {
        console.error('❌ Automatic authentication failed.');
        console.error('Please run "gh auth login" in your terminal to authenticate.');
        return { username: null, token: null };
      }
      
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
  getConfig,
  saveConfig,
  clearConfig
};