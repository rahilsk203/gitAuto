const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Core utilities for gitAuto
 * Provides common functions used across modules
 */

/**
 * Lightweight function to check if a command exists
 * @param {string} cmd - Command to check
 * @returns {boolean} True if command exists
 */
function commandExistsOptimized(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute a command synchronously
 * @param {string} command - Command to execute
 * @param {Object} options - Execution options
 * @returns {string|Buffer} Command output
 */
function executeCommandSync(command, options = {}) {
  try {
    return execSync(command, options);
  } catch (error) {
    if (!options.ignoreErrors) {
      throw error;
    }
    return error;
  }
}

/**
 * Execute a command with advanced options
 * @param {string} command - Command to execute
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} Result object
 */
async function executeCommandAdvanced(command, options = {}) {
  return new Promise((resolve) => {
    try {
      const result = execSync(command, {
        stdio: options.silent ? 'pipe' : 'inherit',
        cwd: options.cwd || process.cwd(),
        ...options
      });
      
      resolve({
        success: true,
        stdout: result ? result.toString() : '',
        stderr: ''
      });
    } catch (error) {
      resolve({
        success: false,
        stdout: '',
        stderr: error.message
      });
    }
  });
}

/**
 * Get repository analytics
 * @returns {Promise<Object>} Analytics data
 */
async function getRepoAnalytics() {
  try {
    // Get commit count
    let commitCount = 0;
    try {
      const commitOutput = execSync('git rev-list --count HEAD', { encoding: 'utf8', stdio: 'pipe' });
      commitCount = parseInt(commitOutput.trim()) || 0;
    } catch (error) {
      // Ignore errors
    }
    
    // Get branch count
    let branchCount = 0;
    try {
      const branchOutput = execSync('git branch', { encoding: 'utf8', stdio: 'pipe' });
      branchCount = branchOutput.split('\n').filter(line => line.trim() !== '').length;
    } catch (error) {
      // Ignore errors
    }
    
    // Get file count
    let fileCount = 0;
    try {
      const fileOutput = execSync('git ls-files', { encoding: 'utf8', stdio: 'pipe' });
      fileCount = fileOutput.split('\n').filter(line => line.trim() !== '').length;
    } catch (error) {
      // Ignore errors
    }
    
    // Get contributor count
    let contributorCount = 0;
    try {
      const contributorOutput = execSync('git shortlog -sn', { encoding: 'utf8', stdio: 'pipe' });
      contributorCount = contributorOutput.split('\n').filter(line => line.trim() !== '').length;
    } catch (error) {
      // Ignore errors
    }
    
    return {
      commitCount,
      branchCount,
      fileCount,
      contributorCount
    };
  } catch (error) {
    return {
      commitCount: 0,
      branchCount: 0,
      fileCount: 0,
      contributorCount: 0
    };
  }
}

/**
 * Get smart suggestions based on repository state
 * @returns {Promise<Array>} Array of suggestions
 */
async function getSmartSuggestions() {
  const suggestions = [];
  
  try {
    // Check if there are uncommitted changes
    try {
      const statusOutput = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' });
      if (statusOutput.trim() !== '') {
        suggestions.push({
          type: 'commit',
          message: 'You have uncommitted changes. Consider committing them.',
          priority: 1
        });
      }
    } catch (error) {
      // Ignore errors
    }
    
    // Check if current branch is ahead of remote
    try {
      const aheadOutput = execSync('git rev-list --count HEAD..@{u}', { encoding: 'utf8', stdio: 'pipe' });
      const aheadCount = parseInt(aheadOutput.trim());
      if (aheadCount > 0) {
        suggestions.push({
          type: 'push',
          message: `Your branch is ${aheadCount} commit(s) ahead of remote. Consider pushing your changes.`,
          priority: 2
        });
      }
    } catch (error) {
      // Ignore errors
    }
    
    // Check if current branch is behind remote
    try {
      const behindOutput = execSync('git rev-list --count @{u}..HEAD', { encoding: 'utf8', stdio: 'pipe' });
      const behindCount = parseInt(behindOutput.trim());
      if (behindCount > 0) {
        suggestions.push({
          type: 'pull',
          message: `Your branch is ${behindCount} commit(s) behind remote. Consider pulling the latest changes.`,
          priority: 3
        });
      }
    } catch (error) {
      // Ignore errors
    }
  } catch (error) {
    // Ignore errors
  }
  
  // Sort by priority
  suggestions.sort((a, b) => a.priority - b.priority);
  
  return suggestions;
}

/**
 * Clear all caches
 */
function clearCaches() {
  console.log('🧹 All caches cleared');
}

module.exports = {
  commandExistsOptimized,
  executeCommandSync,
  executeCommandAdvanced,
  getRepoAnalytics,
  getSmartSuggestions,
  clearCaches
};