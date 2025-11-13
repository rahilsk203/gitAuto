const { executeCommandAdvanced } = require('../core');
const fs = require('fs');
const path = require('path');

/**
 * Smart Error Resolver for gitAuto
 * Automatically detects and fixes common Git issues
 */

/**
 * Resolve Git index lock issues automatically
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function resolveIndexLock() {
  try {
    const gitDir = '.git';
    const indexLockPath = path.join(gitDir, 'index.lock');
    
    if (fs.existsSync(indexLockPath)) {
      console.log('🔧 Resolving Git index lock issue...');
      fs.unlinkSync(indexLockPath);
      console.log('✅ Git index lock removed successfully');
      return { success: true, message: 'Index lock removed' };
    }
    
    return { success: true, message: 'No index lock found' };
  } catch (error) {
    return { success: false, message: 'Failed to resolve index lock', error: error.message };
  }
}

/**
 * Resolve "not a git repository" issues by initializing a new repo
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function resolveNotGitRepo() {
  try {
    console.log('🔧 Initializing new Git repository...');
    const result = await executeCommandAdvanced('git init');
    
    if (result.success) {
      console.log('✅ Git repository initialized successfully');
      return { success: true, message: 'Repository initialized' };
    }
    
    return { success: false, message: 'Failed to initialize repository', error: result.stderr };
  } catch (error) {
    return { success: false, message: 'Failed to initialize repository', error: error.message };
  }
}

/**
 * Resolve permission issues by suggesting chmod fixes
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function resolvePermissionIssues() {
  try {
    console.log('🔧 Attempting to fix permission issues...');
    
    // Try to fix common permission issues on Unix-like systems
    if (process.platform !== 'win32') {
      const result = await executeCommandAdvanced('chmod -R u+w .git 2>/dev/null || true', { silent: true });
      // We don't check success since this might fail on some systems
    }
    
    console.log('✅ Permission fix attempt completed');
    return { success: true, message: 'Permission fix attempted' };
  } catch (error) {
    return { success: false, message: 'Failed to attempt permission fix', error: error.message };
  }
}

/**
 * Resolve large file issues by suggesting Git LFS
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function resolveLargeFiles() {
  try {
    console.log('🔧 Checking for large files that might need Git LFS...');
    
    // Check if Git LFS is installed
    const lfsCheck = await executeCommandAdvanced('git lfs version', { silent: true });
    if (!lfsCheck.success) {
      console.log('💡 Git LFS not found. Consider installing it for large files.');
      console.log('   Installation: https://git-lfs.github.com/');
      return { success: true, message: 'Git LFS suggested for large files' };
    }
    
    // Track common large file types
    const largeFileTypes = ['*.psd', '*.ai', '*.sketch', '*.zip', '*.rar', '*.mp4', '*.mov'];
    for (const fileType of largeFileTypes) {
      await executeCommandAdvanced(`git lfs track "${fileType}"`, { silent: true });
    }
    
    console.log('✅ Git LFS tracking configured for common large file types');
    return { success: true, message: 'Git LFS configured' };
  } catch (error) {
    return { success: false, message: 'Failed to configure Git LFS', error: error.message };
  }
}

/**
 * Resolve corrupted index by rebuilding it
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function resolveCorruptedIndex() {
  try {
    console.log('🔧 Rebuilding corrupted Git index...');
    
    // Remove the corrupted index
    const indexPath = path.join('.git', 'index');
    if (fs.existsSync(indexPath)) {
      fs.unlinkSync(indexPath);
    }
    
    // Rebuild index
    const result = await executeCommandAdvanced('git reset');
    
    if (result.success) {
      console.log('✅ Git index rebuilt successfully');
      return { success: true, message: 'Index rebuilt' };
    }
    
    return { success: false, message: 'Failed to rebuild index', error: result.stderr };
  } catch (error) {
    return { success: false, message: 'Failed to rebuild index', error: error.message };
  }
}

/**
 * Resolve merge conflicts by stashing changes
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function resolveMergeConflicts() {
  try {
    console.log('🔧 Stashing local changes to resolve merge conflicts...');
    
    const result = await executeCommandAdvanced('git stash');
    
    if (result.success) {
      console.log('✅ Local changes stashed successfully');
      return { success: true, message: 'Changes stashed' };
    }
    
    return { success: false, message: 'Failed to stash changes', error: result.stderr };
  } catch (error) {
    return { success: false, message: 'Failed to stash changes', error: error.message };
  }
}

/**
 * Resolve branch configuration issues
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function resolveBranchConfig() {
  try {
    console.log('🔧 Fixing branch configuration...');
    
    // Get current branch
    const branchResult = await executeCommandAdvanced('git branch --show-current', { silent: true });
    if (!branchResult.success) {
      return { success: false, message: 'Failed to get current branch', error: branchResult.stderr };
    }
    
    const branchName = branchResult.stdout.trim();
    if (!branchName) {
      return { success: false, message: 'Not on any branch' };
    }
    
    // Set upstream branch
    const upstreamResult = await executeCommandAdvanced(`git branch --set-upstream-to=origin/${branchName} ${branchName}`, { silent: true });
    
    if (upstreamResult.success) {
      console.log('✅ Branch configuration fixed');
      return { success: true, message: 'Branch configuration fixed' };
    }
    
    // If setting upstream fails, try to create tracking branch
    const trackResult = await executeCommandAdvanced(`git push --set-upstream origin ${branchName}`, { silent: true });
    
    if (trackResult.success) {
      console.log('✅ Tracking branch created');
      return { success: true, message: 'Tracking branch created' };
    }
    
    return { success: false, message: 'Failed to fix branch configuration', error: upstreamResult.stderr || trackResult.stderr };
  } catch (error) {
    return { success: false, message: 'Failed to fix branch configuration', error: error.message };
  }
}

/**
 * Resolve authentication issues by checking GitHub CLI status
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function resolveAuthIssues() {
  try {
    console.log('🔧 Checking authentication status...');
    
    const authResult = await executeCommandAdvanced('gh auth status', { silent: true });
    
    if (authResult.success) {
      console.log('✅ Authentication is working');
      return { success: true, message: 'Authentication verified' };
    }
    
    console.log('💡 Authentication issue detected. Attempting to refresh...');
    const refreshResult = await executeCommandAdvanced('gh auth refresh', { silent: true });
    
    if (refreshResult.success) {
      console.log('✅ Authentication refreshed successfully');
      return { success: true, message: 'Authentication refreshed' };
    }
    
    return { success: false, message: 'Authentication refresh failed', error: refreshResult.stderr };
  } catch (error) {
    return { success: false, message: 'Failed to check authentication', error: error.message };
  }
}

/**
 * Resolve network connectivity issues
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function resolveNetworkIssues() {
  try {
    console.log('🔧 Checking network connectivity...');
    
    // Try to ping GitHub
    const pingResult = await executeCommandAdvanced('ping -c 1 github.com 2>/dev/null || ping -n 1 github.com', { silent: true });
    
    if (pingResult.success) {
      console.log('✅ Network connectivity to GitHub is working');
      return { success: true, message: 'Network connectivity verified' };
    }
    
    console.log('⚠️ Network connectivity issues detected');
    return { success: false, message: 'Network connectivity issues detected' };
  } catch (error) {
    return { success: false, message: 'Failed to check network connectivity', error: error.message };
  }
}

/**
 * Resolve Git configuration issues
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function resolveGitConfig() {
  try {
    console.log('🔧 Checking Git configuration...');
    
    // Check if user.name and user.email are set
    const nameResult = await executeCommandAdvanced('git config --global user.name', { silent: true });
    const emailResult = await executeCommandAdvanced('git config --global user.email', { silent: true });
    
    if (!nameResult.stdout || !emailResult.stdout) {
      console.log('⚠️ Git user configuration is missing');
      console.log('📝 Please set your Git user information:');
      console.log('   git config --global user.name "Your Name"');
      console.log('   git config --global user.email "you@example.com"');
      return { success: false, message: 'Git user configuration missing' };
    }
    
    console.log('✅ Git configuration is properly set');
    return { success: true, message: 'Git configuration verified' };
  } catch (error) {
    return { success: false, message: 'Failed to check Git configuration', error: error.message };
  }
}

/**
 * Resolve remote repository issues
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function resolveRemoteRepo() {
  try {
    console.log('🔧 Checking remote repository configuration...');
    
    // Check if remote exists
    const remoteResult = await executeCommandAdvanced('git remote -v', { silent: true });
    
    if (!remoteResult.success || !remoteResult.stdout) {
      console.log('⚠️ No remote repository configured');
      console.log('📝 To add a remote repository:');
      console.log('   git remote add origin <repository-url>');
      return { success: false, message: 'No remote repository configured' };
    }
    
    console.log('✅ Remote repository is configured');
    return { success: true, message: 'Remote repository verified' };
  } catch (error) {
    return { success: false, message: 'Failed to check remote repository', error: error.message };
  }
}

/**
 * Resolve disk space issues
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function resolveDiskSpace() {
  try {
    console.log('🔧 Checking disk space...');
    
    // Run git gc to clean up unnecessary files
    const gcResult = await executeCommandAdvanced('git gc --prune=now', { silent: true });
    
    if (gcResult.success) {
      console.log('✅ Git garbage collection completed');
      return { success: true, message: 'Git garbage collection completed' };
    }
    
    console.log('⚠️ Disk space issues detected or git gc failed');
    return { success: false, message: 'Disk space issues detected' };
  } catch (error) {
    return { success: false, message: 'Failed to check disk space', error: error.message };
  }
}

/**
 * Smart resolver that automatically detects and fixes common Git issues
 * @param {string} errorMessage - The error message to analyze
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Result of the resolution attempt
 */
async function smartErrorResolver(errorMessage, options = {}) {
  console.log('🤖 Smart Error Resolver activated...');
  
  // Normalize error message for easier matching
  const normalizedError = errorMessage.toLowerCase();
  
  // Error pattern matching and automatic resolution
  if (normalizedError.includes('fatal: not a git repository')) {
    console.log('🔍 Detected: Not a Git repository');
    return await resolveNotGitRepo();
  }
  
  if (normalizedError.includes('fatal: unable to create') && normalizedError.includes('index.lock')) {
    console.log('🔍 Detected: Git index lock issue');
    return await resolveIndexLock();
  }
  
  if (normalizedError.includes('permission denied')) {
    console.log('🔍 Detected: Permission issues');
    return await resolvePermissionIssues();
  }
  
  if (normalizedError.includes('too many revisions') || normalizedError.includes('too big')) {
    console.log('🔍 Detected: Large file issues');
    return await resolveLargeFiles();
  }
  
  if (normalizedError.includes('index file corrupt') || normalizedError.includes('bad index')) {
    console.log('🔍 Detected: Corrupted index');
    return await resolveCorruptedIndex();
  }
  
  if (normalizedError.includes('conflict') || normalizedError.includes('fix conflicts')) {
    console.log('🔍 Detected: Merge conflicts');
    return await resolveMergeConflicts();
  }
  
  if (normalizedError.includes('fatal: couldn\'t find remote ref') || 
      normalizedError.includes('your configuration specifies to merge with the ref')) {
    console.log('🔍 Detected: Branch configuration issues');
    return await resolveBranchConfig();
  }
  
  if (normalizedError.includes('authentication failed') || 
      normalizedError.includes('please tell me who you are')) {
    console.log('🔍 Detected: Authentication issues');
    return await resolveAuthIssues();
  }
  
  if (normalizedError.includes('connection refused') || 
      normalizedError.includes('could not resolve') || 
      normalizedError.includes('network is unreachable')) {
    console.log('🔍 Detected: Network connectivity issues');
    return await resolveNetworkIssues();
  }
  
  if (normalizedError.includes('empty ident name')) {
    console.log('🔍 Detected: Git configuration issues');
    return await resolveGitConfig();
  }
  
  if (normalizedError.includes('repository not found') || 
      normalizedError.includes('does not appear to be a git repository')) {
    console.log('🔍 Detected: Remote repository issues');
    return await resolveRemoteRepo();
  }
  
  if (normalizedError.includes('no space left') || 
      normalizedError.includes('disk quota exceeded')) {
    console.log('🔍 Detected: Disk space issues');
    return await resolveDiskSpace();
  }
  
  // If no specific resolver found, return a general message
  console.log('🔍 No automatic resolution available for this error');
  return { success: false, message: 'No automatic resolution available', error: 'Unsupported error type' };
}

module.exports = {
  smartErrorResolver,
  resolveIndexLock,
  resolveNotGitRepo,
  resolvePermissionIssues,
  resolveLargeFiles,
  resolveCorruptedIndex,
  resolveMergeConflicts,
  resolveBranchConfig,
  resolveAuthIssues,
  resolveNetworkIssues,
  resolveGitConfig,
  resolveRemoteRepo,
  resolveDiskSpace
};