const { executeCommandAdvanced } = require('../core');
const fs = require('fs');
const path = require('path');

/**
 * Execute multiple git commands in parallel
 * @param {Array} commands - Array of commands to execute
 * @param {Object} options - Options for execution
 * @returns {Promise<Array>} Array of results
 */
async function executeCommandsParallel(commands, options = {}) {
  const promises = commands.map(command => 
    executeCommandAdvanced(command, options)
  );
  
  return Promise.all(promises);
}

/**
 * Clone multiple repositories in parallel
 * @param {Array} repoUrls - Array of repository URLs
 * @param {Array} dirs - Array of directory names (optional)
 * @returns {Promise<Array>} Array of results
 */
async function cloneReposParallel(repoUrls, dirs = null) {
  const commands = repoUrls.map((url, index) => {
    const dir = dirs && dirs[index] ? `${url} ${dirs[index]}` : url;
    return `git clone ${dir}`;
  });
  
  return executeCommandsParallel(commands);
}

/**
 * Batch process multiple repositories with the same operation
 * @param {Array} repoPaths - Array of repository paths
 * @param {string} operation - Git operation to perform (status, pull, push, etc.)
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Array of results
 */
async function batchProcessRepos(repoPaths, operation, options = {}) {
  // Validate operation
  const validOperations = ['status', 'pull', 'push', 'fetch'];
  if (!validOperations.includes(operation)) {
    throw new Error(`Invalid operation: ${operation}. Valid operations: ${validOperations.join(', ')}`);
  }
  
  // Process repositories in parallel
  const results = await Promise.all(repoPaths.map(async (repoPath) => {
    try {
      // Check if path exists and is a git repository
      if (!fs.existsSync(path.join(repoPath, '.git'))) {
        return {
          repoPath,
          success: false,
          error: 'Not a git repository'
        };
      }
      
      // Change to repository directory
      const originalCwd = process.cwd();
      process.chdir(repoPath);
      
      let result;
      switch (operation) {
        case 'status':
          result = await executeCommandAdvanced('git status --porcelain', { silent: true });
          break;
        case 'pull':
          result = await executeCommandAdvanced('git pull', { silent: true });
          break;
        case 'push':
          result = await executeCommandAdvanced('git push', { silent: true });
          break;
        case 'fetch':
          result = await executeCommandAdvanced('git fetch', { silent: true });
          break;
      }
      
      // Return to original directory
      process.chdir(originalCwd);
      
      return {
        repoPath,
        success: result.success,
        output: result.stdout,
        error: result.stderr
      };
    } catch (error) {
      // Return to original directory if we changed it
      try {
        process.chdir(originalCwd);
      } catch (e) {
        // Ignore errors when trying to change back
      }
      
      return {
        repoPath,
        success: false,
        error: error.message
      };
    }
  }));
  
  return results;
}

module.exports = {
  executeCommandsParallel,
  cloneReposParallel,
  batchProcessRepos
};