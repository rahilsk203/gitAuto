const { execSync } = require('child_process');
const readlineSync = require('readline-sync');

/**
 * Git Configuration Checker for gitAuto
 * Checks and configures git user settings across all platforms
 */

/**
 * Check if git is installed
 * @returns {boolean} True if git is installed
 */
function isGitInstalled() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if git user.name is configured
 * @returns {string|null} Username if configured, null otherwise
 */
function getGitUserName() {
  try {
    const name = execSync('git config --global user.name', { encoding: 'utf8', stdio: 'pipe' }).trim();
    return name || null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if git user.email is configured
 * @returns {string|null} Email if configured, null otherwise
 */
function getGitUserEmail() {
  try {
    const email = execSync('git config --global user.email', { encoding: 'utf8', stdio: 'pipe' }).trim();
    return email || null;
  } catch (error) {
    return null;
  }
}

/**
 * Set git user.name
 * @param {string} name - Username to set
 */
function setGitUserName(name) {
  try {
    execSync(`git config --global user.name "${name}"`, { stdio: 'ignore' });
  } catch (error) {
    throw new Error(`Failed to set git username: ${error.message}`);
  }
}

/**
 * Set git user.email
 * @param {string} email - Email to set
 */
function setGitUserEmail(email) {
  try {
    execSync(`git config --global user.email "${email}"`, { stdio: 'ignore' });
  } catch (error) {
    throw new Error(`Failed to set git email: ${error.message}`);
  }
}

/**
 * Check git configuration and prompt user if needed
 * Works across all platforms including Windows, Linux, macOS, and Termux
 * @returns {boolean} True if configuration is successful
 */
function checkAndConfigureGit() {
  // First check if git is installed
  if (!isGitInstalled()) {
    console.error('❌ Git is not installed on your system.');
    console.log('Please install Git from https://git-scm.com/');
    return false;
  }

  // Check current configuration
  const userName = getGitUserName();
  const userEmail = getGitUserEmail();

  // If both are configured, we're good to go
  if (userName && userEmail) {
    console.log('✅ Git user settings are already configured');
    console.log(`   Username: ${userName}`);
    console.log(`   Email: ${userEmail}`);
    return true;
  }

  // If either is missing, prompt user for input
  console.log('❌ Git user settings are not fully configured.');
  
  let name = userName;
  let email = userEmail;

  // Prompt for username if missing
  if (!name) {
    console.log('\nPlease configure your Git username:');
    name = readlineSync.question('Enter your Git username: ').trim();
    
    if (!name) {
      console.error('❌ Username is required.');
      return false;
    }
  }

  // Prompt for email if missing
  if (!email) {
    console.log('\nPlease configure your Git email:');
    email = readlineSync.questionEMail('Enter your Git email: ').trim();
    
    if (!email) {
      console.error('❌ Email is required.');
      return false;
    }
  }

  try {
    // Set the configuration only if needed
    if (!userName) {
      setGitUserName(name);
    }
    
    if (!userEmail) {
      setGitUserEmail(email);
    }
    
    console.log('\n✅ Git user configuration completed successfully!');
    console.log(`   Username: ${name}`);
    console.log(`   Email: ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error configuring Git user settings: ${error.message}`);
    return false;
  }
}

/**
 * Silent git configuration check (for automated environments)
 * @param {string} name - Username to set (optional)
 * @param {string} email - Email to set (optional)
 * @returns {boolean} True if configuration is successful
 */
function silentConfigureGit(name, email) {
  // First check if git is installed
  if (!isGitInstalled()) {
    console.error('Git is not installed');
    return false;
  }

  // Check current configuration
  const currentName = getGitUserName();
  const currentEmail = getGitUserEmail();

  // If both are already configured, we're good
  if (currentName && currentEmail) {
    return true;
  }

  try {
    // Set name if provided and not already set
    if (name && !currentName) {
      setGitUserName(name);
    }

    // Set email if provided and not already set
    if (email && !currentEmail) {
      setGitUserEmail(email);
    }

    // Verify configuration was successful
    const newName = getGitUserName();
    const newEmail = getGitUserEmail();

    return !!(newName && newEmail);
  } catch (error) {
    console.error(`Error in silent git configuration: ${error.message}`);
    return false;
  }
}

module.exports = {
  isGitInstalled,
  getGitUserName,
  getGitUserEmail,
  setGitUserName,
  setGitUserEmail,
  checkAndConfigureGit,
  silentConfigureGit
};