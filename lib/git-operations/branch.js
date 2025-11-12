const { executeCommandAdvanced } = require('../core');
const fs = require('fs');

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

module.exports = {
  createBranchAdvanced,
  listBranchesAdvanced,
  switchBranchAdvanced
};