const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Check if Node.js is installed
 * @returns {boolean} True if Node.js is installed
 */
function isNodeInstalled() {
  try {
    execSync('node --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if npm is installed
 * @returns {boolean} True if npm is installed
 */
function isNpmInstalled() {
  try {
    execSync('npm --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if Git is installed
 * @returns {boolean} True if Git is installed
 */
function isGitInstalled() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a package is installed
 * @param {string} packageName - Name of the package to check
 * @returns {boolean} True if package is installed
 */
function isPackageInstalled(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Install a package using npm
 * @param {string} packageName - Name of the package to install
 */
function installPackage(packageName) {
  try {
    console.log(`📦 Installing ${packageName}...`);
    execSync(`npm install ${packageName}`, { stdio: 'inherit' });
    console.log(`✅ ${packageName} installed successfully!`);
  } catch (error) {
    console.error(`❌ Failed to install ${packageName}:`, error.message);
    throw error;
  }
}

/**
 * Install multiple packages
 * @param {string[]} packages - Array of package names to install
 */
function installPackages(packages) {
  try {
    console.log(`📦 Installing packages: ${packages.join(', ')}...`);
    execSync(`npm install ${packages.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ All packages installed successfully!');
  } catch (error) {
    console.error('❌ Failed to install packages:', error.message);
    throw error;
  }
}

/**
 * Check and install all required dependencies
 * @returns {Promise<boolean>} True if all dependencies are satisfied
 */
async function checkAndInstallDependencies() {
  console.log('🔍 Checking system dependencies...');
  
  // Check Node.js
  if (!isNodeInstalled()) {
    console.error('❌ Node.js is not installed. Please install Node.js from https://nodejs.org/');
    return false;
  }
  console.log('✅ Node.js is installed');
  
  // Check npm
  if (!isNpmInstalled()) {
    console.error('❌ npm is not installed. Please install npm (comes with Node.js).');
    return false;
  }
  console.log('✅ npm is installed');
  
  // Check Git
  if (!isGitInstalled()) {
    console.error('❌ Git is not installed. Please install Git from https://git-scm.com/');
    return false;
  }
  console.log('✅ Git is installed');
  
  // Check required packages
  const requiredPackages = ['axios', 'inquirer', 'open'];
  const missingPackages = [];
  
  for (const pkg of requiredPackages) {
    if (!isPackageInstalled(pkg)) {
      missingPackages.push(pkg);
    }
  }
  
  if (missingPackages.length > 0) {
    console.log(`📦 Installing missing packages: ${missingPackages.join(', ')}`);
    try {
      installPackages(missingPackages);
    } catch (error) {
      console.error('❌ Failed to install required packages.');
      console.log('Please run "npm install" manually to install dependencies.');
      return false;
    }
  } else {
    console.log('✅ All required packages are already installed.');
  }
  
  return true;
}

/**
 * Check if GitHub CLI is installed
 * @returns {boolean} True if GitHub CLI is installed
 */
function isGhCliInstalled() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  isNodeInstalled,
  isNpmInstalled,
  isGitInstalled,
  isPackageInstalled,
  installPackage,
  installPackages,
  checkAndInstallDependencies,
  isGhCliInstalled
};