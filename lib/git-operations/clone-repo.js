const { executeCommandAdvanced } = require('../core');
const fs = require('fs');
const path = require('path');

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

module.exports = {
  cloneRepoAdvanced,
  autoCloneAndExitAdvanced,
  deleteLocalRepoAdvanced
};