const fs = require('fs');
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');
const open = require('open');
const http = require('http');
const url = require('url');

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
 * Start a local server to receive the OAuth callback
 * @returns {Promise<string>} The access token
 */
function startOAuthServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const queryObject = url.parse(req.url, true).query;
      
      if (queryObject.code) {
        // In a real implementation, we would exchange the code for an access token
        // For this demo, we'll just close the server and return a mock token
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>Authentication Successful!</h1>
              <p>You can close this window and return to the terminal.</p>
              <script>
                window.close();
              </script>
            </body>
          </html>
        `);
        
        // Close server and resolve with a mock token
        server.close();
        resolve('gho_' + Math.random().toString(36).substring(2, 15));
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Authentication Failed</h1><p>Invalid callback.</p>');
        server.close();
        reject(new Error('Authentication failed'));
      }
    });
    
    server.listen(3000, () => {
      console.log('OAuth server listening on port 3000');
    });
  });
}

/**
 * Login using GitHub OAuth flow
 */
async function oauthLogin() {
  const clientId = 'YOUR_GITHUB_OAUTH_APP_CLIENT_ID'; // This would be your actual OAuth app client ID
  const redirectUri = 'http://localhost:3000/callback';
  const scope = 'repo user';
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  
  console.log('Opening browser for GitHub authentication...');
  console.log('If the browser does not open automatically, please visit this URL:');
  console.log(authUrl);
  
  // Open the browser
  await open(authUrl);
  
  try {
    // Start the OAuth server and wait for the callback
    const token = await startOAuthServer();
    return token;
  } catch (error) {
    console.error('❌ OAuth login failed:', error.message);
    return null;
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
 * Login using GitHub username & token or OAuth
 */
async function login() {
  const credentials = loadCredentials();
  if (credentials.token) {
    console.log(`✅ Already logged in as ${credentials.username}`);
    return credentials;
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'loginMethod',
      message: 'How would you like to login?',
      choices: [
        { name: 'Browser Login (OAuth)', value: 'oauth' },
        { name: 'Manual Token Entry', value: 'manual' }
      ]
    }
  ]);

  let username, token;
  
  if (answers.loginMethod === 'oauth') {
    token = await oauthLogin();
    if (token) {
      // In a real implementation, we would get the username from the GitHub API
      const usernameAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'username',
          message: 'Enter your GitHub username:',
          validate: input => input.length > 0 || 'Username cannot be empty'
        }
      ]);
      username = usernameAnswer.username;
    } else {
      console.log('❌ OAuth login failed. Falling back to manual entry.');
      const manualCreds = await manualLogin();
      username = manualCreds.username;
      token = manualCreds.token;
    }
  } else {
    const manualCreds = await manualLogin();
    username = manualCreds.username;
    token = manualCreds.token;
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