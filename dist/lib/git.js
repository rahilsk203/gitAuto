const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadCredentials } = require('./auth');
const { executeCommandAdvanced, executeCommandSync } = require('./core');

/**
 * Advanced Git Operations for gitAuto
 * Implements parallel operations, better error handling, and performance optimizations
 */

// Cache for git operations
const gitCache = new Map();
const cacheTimeout = 5000; // 5 seconds

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
 * Clone a repository with progress tracking
 * @param {string} repoUrl - URL of the repository to clone
 * @param {string} dir - Directory to clone into (optional)
 * @returns {Promise<Object>} Result object
 */
async function cloneRepoAdvanced(repoUrl, dir = null) {
  try {
    console.log(`📥 Cloning repository from ${repoUrl}...`);
    
    const command = dir ? `git clone ${repoUrl} ${dir}` : `git clone ${repoUrl}`;
    const result = await executeCommandAdvanced(command);
    
    if (result.success) {
      console.log('✅ Repository cloned successfully!');
      return { success: true, message: 'Repository cloned successfully' };
    } else {
      throw new Error(result.stderr || 'Clone failed');
    }
  } catch (error) {
    console.error('❌ Error cloning repository:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Push changes to remote repository with advanced options
 * @param {string} message - Commit message
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Result object
 */
async function pushRepoAdvanced(message = 'Auto commit', options = {}) {
  try {
    // Check if we're in a git repository
    if (!fs.existsSync('.git')) {
      throw new Error("This is not a Git repository!");
    }
    
    console.log('🔄 Preparing to push changes...');
    
    // Add all changes (excluding node_modules which should be in .gitignore)
    const addResult = await executeCommandAdvanced('git add .');
    if (!addResult.success) {
      throw new Error(`Failed to add changes: ${addResult.stderr}`);
    }
    
    // Check if there are changes to commit
    const statusResult = await executeCommandAdvanced('git status --porcelain', { silent: true });
    if (!statusResult.success || !statusResult.stdout || statusResult.stdout.length === 0) {
      console.log('ℹ️ No changes to commit');
      return { success: true, message: 'No changes to commit' };
    }
    
    // Commit changes
    const commitResult = await executeCommandAdvanced(`git commit -m "${message}"`);
    if (!commitResult.success) {
      throw new Error(`Failed to commit changes: ${commitResult.stderr}`);
    }
    
    // Push to remote
    console.log('📤 Pushing changes to remote repository...');
    const pushResult = await executeCommandAdvanced('git push');
    if (!pushResult.success) {
      throw new Error(`Failed to push changes: ${pushResult.stderr}`);
    }
    
    console.log('✅ Changes pushed successfully!');
    return { success: true, message: 'Changes pushed successfully' };
  } catch (error) {
    console.error('❌ Error pushing changes:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Pull latest changes from remote repository with conflict handling
 * @returns {Promise<Object>} Result object
 */
async function pullRepoAdvanced() {
  try {
    // Check if we're in a git repository
    if (!fs.existsSync('.git')) {
      throw new Error("This is not a Git repository!");
    }
    
    console.log('📥 Pulling latest changes from remote repository...');
    
    const result = await executeCommandAdvanced('git pull');
    
    if (result.success) {
      console.log('✅ Pulled latest changes!');
      return { success: true, message: 'Pulled latest changes' };
    } else {
      // Check if there are conflicts
      if (result.stderr && result.stderr.includes('conflict')) {
        console.log('⚠️ Conflicts detected during pull. Please resolve conflicts manually.');
        return { success: false, message: 'Conflicts detected', conflicts: true };
      } else {
        throw new Error(result.stderr || 'Pull failed');
      }
    }
  } catch (error) {
    console.error('❌ Error pulling changes:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Create and switch to a new branch with validation
 * @param {string} branchName - Name of the new branch
 * @returns {Promise<Object>} Result object
 */
async function createBranchAdvanced(branchName) {
  try {
    // Validate branch name
    if (!branchName || branchName.trim() === '') {
      throw new Error('Branch name cannot be empty');
    }
    
    // Check if branch already exists
    const branchResult = await executeCommandAdvanced('git branch');
    if (branchResult.success && branchResult.stdout) {
      const branches = branchResult.stdout.split('\n').map(b => b.trim().replace('*', '').trim());
      if (branches.includes(branchName)) {
        console.log(`⚠️ Branch '${branchName}' already exists`);
        return { success: false, message: `Branch '${branchName}' already exists` };
      }
    }
    
    const result = await executeCommandAdvanced(`git checkout -b ${branchName}`);
    
    if (result.success) {
      console.log(`✅ Created and switched to branch '${branchName}'!`);
      return { success: true, message: `Created and switched to branch '${branchName}'` };
    } else {
      throw new Error(result.stderr || 'Failed to create branch');
    }
  } catch (error) {
    console.error('❌ Error creating branch:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * List all branches with additional information
 * @returns {Promise<Object>} Result object
 */
async function listBranchesAdvanced() {
  try {
    console.log('📍 Branches:');
    
    // Get all branches
    const branchResult = await executeCommandAdvanced('git branch');
    if (!branchResult.success) {
      throw new Error(branchResult.stderr || 'Failed to list branches');
    }
    
    // Get remote branches
    const remoteResult = await executeCommandAdvanced('git branch -r');
    
    console.log('Local branches:');
    if (branchResult.stdout) {
      console.log(branchResult.stdout);
    }
    
    if (remoteResult.success && remoteResult.stdout) {
      console.log('\nRemote branches:');
      console.log(remoteResult.stdout);
    }
    
    return { success: true, local: branchResult.stdout, remote: remoteResult.stdout };
  } catch (error) {
    console.error('❌ Error listing branches:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Switch to an existing branch with validation
 * @param {string} branchName - Name of the branch to switch to
 * @returns {Promise<Object>} Result object
 */
async function switchBranchAdvanced(branchName) {
  try {
    // Validate branch name
    if (!branchName || branchName.trim() === '') {
      throw new Error('Branch name cannot be empty');
    }
    
    // Check if we're already on this branch
    const currentResult = await executeCommandAdvanced('git branch --show-current');
    if (currentResult.success && currentResult.stdout === branchName) {
      console.log(`ℹ️ Already on branch '${branchName}'`);
      return { success: true, message: `Already on branch '${branchName}'` };
    }
    
    // Check if branch exists
    const branchResult = await executeCommandAdvanced('git branch');
    if (branchResult.success && branchResult.stdout) {
      const branches = branchResult.stdout.split('\n').map(b => b.trim().replace('*', '').trim());
      if (!branches.includes(branchName)) {
        console.log(`❌ Branch '${branchName}' does not exist`);
        return { success: false, message: `Branch '${branchName}' does not exist` };
      }
    }
    
    const result = await executeCommandAdvanced(`git checkout ${branchName}`);
    
    if (result.success) {
      console.log(`✅ Switched to branch '${branchName}'!`);
      return { success: true, message: `Switched to branch '${branchName}'` };
    } else {
      throw new Error(result.stderr || 'Failed to switch branch');
    }
  } catch (error) {
    console.error('❌ Error switching branch:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Show current repository status with detailed information
 * @returns {Promise<Object>} Result object
 */
async function showStatusAdvanced() {
  try {
    if (!fs.existsSync('.git')) {
      throw new Error("This is not a Git repository!");
    }
    
    // Get basic status
    const statusResult = await executeCommandAdvanced('git status');
    if (!statusResult.success) {
      throw new Error(statusResult.stderr || 'Failed to get status');
    }
    
    // Get detailed information
    const branchResult = await executeCommandAdvanced('git branch --show-current');
    const commitResult = await executeCommandAdvanced('git rev-parse HEAD');
    const changesResult = await executeCommandAdvanced('git status --porcelain');
    
    // Extract branch name (handle both success and failure cases)
    let branchName = 'unknown';
    if (branchResult.success && branchResult.stdout) {
      branchName = branchResult.stdout.trim();
    } else if (!branchResult.success) {
      // Fallback to parsing from git status
      const fullStatusResult = await executeCommandAdvanced('git status');
      if (fullStatusResult.success && fullStatusResult.stdout) {
        const match = fullStatusResult.stdout.match(/On branch (\S+)/);
        if (match) {
          branchName = match[1];
        }
      }
    }
    
    // Extract commit hash (handle both success and failure cases)
    let commitHash = 'unknown';
    if (commitResult.success && commitResult.stdout) {
      commitHash = commitResult.stdout.trim().substring(0, 7);
    }
    
    console.log('📊 Repository Status:');
    console.log('====================');
    console.log(`Current branch: ${branchName}`);
    console.log(`Latest commit: ${commitHash}`);
    
    // Count uncommitted changes
    let uncommittedCount = 0;
    if (changesResult.success && changesResult.stdout) {
      const changes = changesResult.stdout.split('\n').filter(line => line.trim() !== '');
      uncommittedCount = changes.length;
    }
    console.log(`Uncommitted changes: ${uncommittedCount}`);
    
    console.log('\n📝 Detailed status:');
    console.log(statusResult.stdout);
    
    return { 
      success: true, 
      branch: branchName,
      commit: commitHash,
      status: statusResult.stdout
    };
  } catch (error) {
    console.error('❌ Error showing status:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Show commit history with advanced formatting
 * @param {Object} options - Display options
 * @returns {Promise<Object>} Result object
 */
async function showCommitHistoryAdvanced(options = {}) {
  try {
    if (!fs.existsSync('.git')) {
      throw new Error("This is not a Git repository!");
    }
    
    const format = options.format || 'oneline';
    const limit = options.limit || 10;
    
    let command;
    switch (format) {
      case 'oneline':
        command = `git log --oneline -${limit}`;
        break;
      case 'full':
        command = `git log --pretty=format:"%h - %an, %ar : %s" -${limit}`;
        break;
      case 'graph':
        command = `git log --oneline --graph -${limit}`;
        break;
      default:
        command = `git log --oneline -${limit}`;
    }
    
    const result = await executeCommandAdvanced(command);
    
    if (result.success) {
      console.log('📝 Commit History:');
      console.log('==================');
      console.log(result.stdout);
      return { success: true, history: result.stdout };
    } else {
      throw new Error(result.stderr || 'Failed to get commit history');
    }
  } catch (error) {
    console.error('❌ Error showing commit history:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Automatically clone, enter the repo, and exit script
 * @param {string} repoName - Name of the repository
 * @param {string} repoUrl - URL of the repository
 */
async function autoCloneAndExitAdvanced(repoName, repoUrl) {
  try {
    console.log(`📥 Cloning ${repoName}...`);
    const result = await cloneRepoAdvanced(repoUrl, repoName);
    
    if (result.success) {
      const repoPath = path.join(process.cwd(), repoName);
      if (fs.existsSync(repoPath)) {
        console.log(`📂 Repository '${repoName}' is ready!`);
        console.log('👋 Exiting script...');
        process.exit(0);
      } else {
        throw new Error('Clone failed!');
      }
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Auto clone failed:', error.message);
    throw error;
  }
}

/**
 * Delete local repository folder with confirmation
 * @param {string} repoName - Name of the repository folder to delete
 * @returns {Promise<Object>} Result object
 */
async function deleteLocalRepoAdvanced(repoName) {
  try {
    const repoPath = path.join(process.cwd(), repoName);
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
      console.log(`🗑️ Local folder '${repoName}' deleted!`);
      return { success: true, message: `Local folder '${repoName}' deleted` };
    } else {
      console.log(`ℹ️ Folder '${repoName}' does not exist`);
      return { success: true, message: `Folder '${repoName}' does not exist` };
    }
  } catch (error) {
    console.error('❌ Error deleting local folder:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Clear git cache
 */
function clearGitCache() {
  gitCache.clear();
  console.log('🧹 Git cache cleared');
}

module.exports = {
  executeCommandsParallel,
  cloneReposParallel,
  cloneRepoAdvanced,
  pushRepoAdvanced,
  pullRepoAdvanced,
  createBranchAdvanced,
  listBranchesAdvanced,
  switchBranchAdvanced,
  showStatusAdvanced,
  showCommitHistoryAdvanced,
  autoCloneAndExitAdvanced,
  deleteLocalRepoAdvanced,
  clearGitCache
};