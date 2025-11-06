const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const CREDENTIALS_FILE = path.join(os.homedir(), '.git_credentials.json');

/**
 * Load saved GitHub credentials
 * @returns {Object} Credentials object with username and token
 */
function loadCredentials() {
  // Try to get credentials from GitHub CLI
  try {
    // First check if user is logged in
    execSync('gh auth status', { stdio: 'ignore' });
    
    const token = execSync('gh auth token', { encoding: 'utf8' }).trim();
    // Get username
    const statusOutput = execSync('gh auth status', { encoding: 'utf8' });
    const usernameMatch = statusOutput.match(/Logged in to github\.com as (\S+)/);
    const username = usernameMatch ? usernameMatch[1] : 'unknown';
    
    return { username, token };
  } catch (error) {
    return { username: null, token: null };
  }
}

/**
 * Simple authentication using GitHub CLI
 * @returns {Promise<Object>} Username and token
 */
async function login() {
  const credentials = loadCredentials();
  if (credentials.token) {
    console.log(`✅ Already logged in as ${credentials.username}`);
    return credentials;
  }

  console.log('\n🔐 GitHub Authentication');
  console.log('=====================');
  console.log('Running: gh auth login');
  
  try {
    // Run gh auth login command
    execSync('gh auth login', { stdio: 'inherit' });
    
    // Get the new credentials
    const newCredentials = loadCredentials();
    if (newCredentials.token) {
      console.log(`✅ Successfully logged in as ${newCredentials.username}`);
      return newCredentials;
    } else {
      console.log('❌ Authentication failed');
      return { username: null, token: null };
    }
  } catch (error) {
    console.error('❌ Failed to run gh auth login:', error.message);
    return { username: null, token: null };
  }
}

module.exports = {
  loadCredentials,
  login
};