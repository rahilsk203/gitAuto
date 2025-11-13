const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadCredentials } = require('./auth');

// Import modular git operations
const { executeCommandsParallel, cloneReposParallel, batchProcessRepos } = require('./git-operations/batch');
const { cloneRepoAdvanced, autoCloneAndExitAdvanced, deleteLocalRepoAdvanced } = require('./git-operations/clone-repo');
const { pushRepoAdvanced } = require('./git-operations/push');
const { pullRepoAdvanced } = require('./git-operations/pull');
const { createBranchAdvanced, listBranchesAdvanced, switchBranchAdvanced } = require('./git-operations/branch');
const { showStatusAdvanced, showCommitHistoryAdvanced } = require('./git-operations/status-history');
const { addFilesAdvanced, commitChangesAdvanced } = require('./git-operations/add-commit');

/**
 * Advanced Git Operations for gitAuto
 * Implements parallel operations, better error handling, and performance optimizations
 */

// Cache for git operations
const gitCache = new Map();
const cacheTimeout = 5000; // 5 seconds

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
  batchProcessRepos,
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
  addFilesAdvanced,
  commitChangesAdvanced,
  clearGitCache
};