const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadCredentials } = require('./auth');

/**
 * Execute shell commands with error handling
 * @param {string} command - Command to execute
 * @param {Object} options - Options for execution
 */
function executeCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: options.cwd || process.cwd(),
      ...options
    });
    return result;
  } catch (error) {
    console.error(`❌ Error executing command: ${command}`, error.message);
    throw error;
  }
}

/**
 * Clone a repository
 * @param {string} repoUrl - URL of the repository to clone
 * @param {string} dir - Directory to clone into (optional)
 */
function cloneRepo(repoUrl, dir = null) {
  try {
    const command = dir ? `git clone ${repoUrl} ${dir}` : `git clone ${repoUrl}`;
    executeCommand(command);
    console.log('✅ Repository cloned successfully!');
  } catch (error) {
    console.error('❌ Error cloning repository:', error.message);
    throw error;
  }
}

/**
 * Push changes to remote repository
 * @param {string} message - Commit message
 */
function pushRepo(message = 'Auto commit') {
  try {
    // Check if we're in a git repository
    if (!fs.existsSync('.git')) {
      throw new Error("This is not a Git repository!");
    }
    
    // Add all changes (excluding node_modules which should be in .gitignore)
    executeCommand('git add .');
    
    // Check if there are changes to commit
    const statusOutput = executeCommand('git status --porcelain', { silent: true });
    if (!statusOutput || statusOutput.length === 0) {
      console.log('ℹ️ No changes to commit');
      return;
    }
    
    // Commit changes
    executeCommand(`git commit -m "${message}"`);
    
    // Push to remote
    executeCommand('git push');
    
    console.log('✅ Changes pushed successfully!');
  } catch (error) {
    console.error('❌ Error pushing changes:', error.message);
    throw error;
  }
}

/**
 * Pull latest changes from remote repository
 */
function pullRepo() {
  try {
    // Check if we're in a git repository
    if (!fs.existsSync('.git')) {
      throw new Error("This is not a Git repository!");
    }
    
    executeCommand('git pull');
    console.log('✅ Pulled latest changes!');
  } catch (error) {
    console.error('❌ Error pulling changes:', error.message);
    throw error;
  }
}

/**
 * Create and switch to a new branch
 * @param {string} branchName - Name of the new branch
 */
function createBranch(branchName) {
  try {
    executeCommand(`git checkout -b ${branchName}`);
    console.log(`✅ Created and switched to branch '${branchName}'!`);
  } catch (error) {
    console.error('❌ Error creating branch:', error.message);
    throw error;
  }
}

/**
 * List all branches
 */
function listBranches() {
  try {
    console.log('📍 Branches:');
    executeCommand('git branch');
  } catch (error) {
    console.error('❌ Error listing branches:', error.message);
    throw error;
  }
}

/**
 * Switch to an existing branch
 * @param {string} branchName - Name of the branch to switch to
 */
function switchBranch(branchName) {
  try {
    executeCommand(`git checkout ${branchName}`);
    console.log(`✅ Switched to branch '${branchName}'!`);
  } catch (error) {
    console.error('❌ Error switching branch:', error.message);
    throw error;
  }
}

/**
 * Show current repository status
 */
function showStatus() {
  try {
    if (!fs.existsSync('.git')) {
      throw new Error("This is not a Git repository!");
    }
    
    executeCommand('git status');
  } catch (error) {
    console.error('❌ Error showing status:', error.message);
    throw error;
  }
}

/**
 * Show commit history
 */
function showCommitHistory() {
  try {
    if (!fs.existsSync('.git')) {
      throw new Error("This is not a Git repository!");
    }
    
    executeCommand('git log --oneline');
  } catch (error) {
    console.error('❌ Error showing commit history:', error.message);
    throw error;
  }
}

/**
 * Automatically clone, enter the repo, and exit script
 * @param {string} repoName - Name of the repository
 * @param {string} repoUrl - URL of the repository
 */
function autoCloneAndExit(repoName, repoUrl) {
  try {
    console.log(`📥 Cloning ${repoName}...`);
    cloneRepo(repoUrl, repoName);
    
    const repoPath = path.join(process.cwd(), repoName);
    if (fs.existsSync(repoPath)) {
      console.log(`📂 Repository '${repoName}' is ready!`);
      console.log('👋 Exiting script...');
      process.exit(0);
    } else {
      throw new Error('Clone failed!');
    }
  } catch (error) {
    console.error('❌ Auto clone failed:', error.message);
    throw error;
  }
}

/**
 * Delete local repository folder
 * @param {string} repoName - Name of the repository folder to delete
 */
function deleteLocalRepo(repoName) {
  try {
    const repoPath = path.join(process.cwd(), repoName);
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
      console.log(`🗑️ Local folder '${repoName}' deleted!`);
    }
  } catch (error) {
    console.error('❌ Error deleting local folder:', error.message);
    throw error;
  }
}

module.exports = {
  executeCommand,
  cloneRepo,
  pushRepo,
  pullRepo,
  createBranch,
  listBranches,
  switchBranch,
  showStatus,
  showCommitHistory,
  autoCloneAndExit,
  deleteLocalRepo
};