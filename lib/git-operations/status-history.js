const { executeCommandAdvanced } = require('../core');
const fs = require('fs');

/**
 * Show current repository status with detailed information
 * @returns {Promise<Object>} Result object
 */
async function showStatusAdvanced() {
  try {
    if (!fs.existsSync('.git')) {
      throw new Error("This is not a Git repository!");
    }
    
    // Use batch execution to reduce subprocess overhead
    const commands = [
      'git status',
      'git branch --show-current',
      'git rev-parse HEAD',
      'git status --porcelain'
    ];
    
    // Get detailed information with optimized parallel execution
    const [statusResult, branchResult, commitResult, changesResult] = await Promise.all([
      executeCommandAdvanced('git status', { captureOutput: true }),
      executeCommandAdvanced('git branch --show-current', { captureOutput: true }),
      executeCommandAdvanced('git rev-parse HEAD', { captureOutput: true }),
      executeCommandAdvanced('git status --porcelain', { captureOutput: true })
    ]);

    // Extract branch name with comprehensive error handling
    let branchName = 'unknown';
    if (branchResult && branchResult.success) {
      if (typeof branchResult.stdout === 'string') {
        branchName = branchResult.stdout.trim() || 'unknown';
      } else if (branchResult.stdout) {
        branchName = String(branchResult.stdout).trim() || 'unknown';
      }
    }
    
    // If branch is still unknown, try fallback method
    if (branchName === 'unknown' || branchName === '') {
      if (statusResult && statusResult.success && statusResult.stdout) {
        const fullStatus = typeof statusResult.stdout === 'string' ? statusResult.stdout : String(statusResult.stdout);
        const branchMatch = fullStatus.match(/On branch (\S+)/);
        if (branchMatch && branchMatch[1]) {
          branchName = branchMatch[1];
        }
      }
    }
    
    // Extract commit hash with comprehensive error handling
    let commitHash = 'unknown';
    if (commitResult && commitResult.success) {
      if (typeof commitResult.stdout === 'string') {
        commitHash = commitResult.stdout.trim() ? commitResult.stdout.trim().substring(0, 7) : 'unknown';
      } else if (commitResult.stdout) {
        const stdoutStr = String(commitResult.stdout).trim();
        commitHash = stdoutStr ? stdoutStr.substring(0, 7) : 'unknown';
      }
    }
    
    // Count uncommitted changes
    let uncommittedCount = 0;
    if (changesResult && changesResult.success && changesResult.stdout) {
      const stdoutStr = typeof changesResult.stdout === 'string' ? changesResult.stdout : String(changesResult.stdout);
      const changes = stdoutStr.split('\n').filter(line => line.trim() !== '');
      uncommittedCount = changes.length;
    }
    
    console.log('📊 Repository Status:');
    console.log('====================');
    console.log(`Current branch: ${branchName}`);
    console.log(`Latest commit: ${commitHash}`);
    console.log(`Uncommitted changes: ${uncommittedCount}`);
    
    console.log('\n📝 Detailed status:');
    if (statusResult && statusResult.success && statusResult.stdout) {
      const statusStr = typeof statusResult.stdout === 'string' ? statusResult.stdout : String(statusResult.stdout);
      console.log(statusStr);
    }
    
    return { 
      success: true, 
      branch: branchName,
      commit: commitHash,
      status: statusResult && statusResult.success ? statusResult.stdout : ''
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

module.exports = {
  showStatusAdvanced,
  showCommitHistoryAdvanced
};