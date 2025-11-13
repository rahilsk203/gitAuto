const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { 
  loadCredentials 
} = require('./auth');
const { 
  createRepo, 
  deleteRepo, 
  setRepoVisibility, 
  getAuthCloneUrl 
} = require('./github');

// Import modular git operations
const { 
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
  batchProcessRepos
} = require('./git');

// Create aliases for core functions
const core = require('./core');
const executeCommandSync = core.executeCommandSync;
const executeCommandAdvanced = core.executeCommandAdvanced;
const getRepoAnalytics = core.getRepoAnalytics;
const clearAnalyticsCache = core.clearAnalyticsCache;
const clearSuggestionsCache = core.clearSuggestionsCache;
const getSmartSuggestions = core.getSmartSuggestions;
const clearCaches = core.clearCaches;
const getAllPerformanceStats = core.getAllPerformanceStats;
const clearPerformanceMetrics = core.clearPerformanceMetrics;

/**
 * Advanced Menu System for gitAuto
 * Implements intelligent features and DSA-level optimizations
 */

/**
 * Check if we're currently in a git repository
 * @returns {boolean} True if in a git repository
 */
function isInGitRepo() {
  return fs.existsSync('.git');
}

/**
 * Display repository analytics dashboard
 */
async function showRepoDashboard() {
  try {
    console.log('\n📊 Repository Analytics Dashboard');
    console.log('================================');
    
    const analytics = await getRepoAnalytics();
    
    console.log(` commits: ${analytics.commitCount}`);
    console.log(` branches: ${analytics.branchCount}`);
    console.log(` files: ${analytics.fileCount}`);
    console.log(` contributors: ${analytics.contributorCount}`);
    
    // Show smart suggestions
    const suggestions = await getSmartSuggestions();
    if (suggestions.length > 0) {
      console.log('\n💡 Smart Suggestions:');
      suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion.message}`);
      });
    }
  } catch (error) {
    console.error('❌ Error fetching repository analytics:', error.message);
  }
}

/**
 * Display performance monitoring dashboard
 */
async function showPerformanceDashboard() {
  try {
    console.log('\n⚡ Performance Monitoring Dashboard');
    console.log('==================================');
    
    const stats = getAllPerformanceStats();
    
    if (stats.length === 0) {
      console.log('No performance data available yet. Run some operations to collect metrics.');
      return;
    }
    
    console.log('Function Performance Metrics:');
    console.log('----------------------------');
    
    stats.forEach(stat => {
      if (stat) {
        console.log(`\n${stat.functionName}:`);
        console.log(`  Calls: ${stat.count}`);
        console.log(`  Avg Time: ${stat.average}ms`);
        console.log(`  Min Time: ${stat.min}ms`);
        console.log(`  Max Time: ${stat.max}ms`);
        console.log(`  Total Time: ${stat.total}ms`);
      }
    });
  } catch (error) {
    console.error('❌ Error fetching performance metrics:', error.message);
  }
}

/**
 * Handle batch repository operations
 */
async function handleBatchRepos() {
  console.log('\n🔄 Batch Repository Operations');
  console.log('============================');
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'repoPaths',
      message: 'Enter repository paths (comma-separated):'
    },
    {
      type: 'list',
      name: 'operation',
      message: 'Select operation to perform:',
      choices: [
        { name: 'Status Check', value: 'status' },
        { name: 'Pull Latest Changes', value: 'pull' },
        { name: 'Fetch Updates', value: 'fetch' }
      ]
    }
  ]);
  
  if (!answers.repoPaths) {
    console.log('❌ No repository paths provided!');
    return;
  }
  
  // Parse repository paths
  const repoPaths = answers.repoPaths.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  if (repoPaths.length === 0) {
    console.log('❌ No valid repository paths provided!');
    return;
  }
  
  console.log(`\n🔄 Processing ${repoPaths.length} repositories...`);
  
  try {
    const results = await batchProcessRepos(repoPaths, answers.operation);
    
    console.log('\n📊 Batch Operation Results:');
    console.log('=========================');
    
    let successCount = 0;
    let failureCount = 0;
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.repoPath}:`);
      if (result.success) {
        console.log('   ✅ Success');
        successCount++;
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
        failureCount++;
      }
    });
    
    console.log(`\n📈 Summary: ${successCount} succeeded, ${failureCount} failed`);
  } catch (error) {
    console.error('❌ Error during batch processing:', error.message);
  }
}

/**
 * Show main menu for users not in a git repository
 */
async function showNonRepoMenuAdvanced() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '📌 Choose an option:',
      choices: [
        { name: '1️⃣ Create Repository', value: 'create' },
        { name: '2️⃣ Analytics Dashboard', value: 'analytics' },
        { name: '3️⃣ Batch Repository Operations', value: 'batch' },
        { name: '4️⃣ Performance Monitoring', value: 'performance' },
        { name: '5️⃣ Clone Public Repository', value: 'clone_public' },
        { name: '🔟 Clear Caches', value: 'clear_cache' },
        { name: '6️⃣ Exit', value: 'exit' }
      ]
    }
  ]);
  
  switch (answers.action) {
    case 'create':
      await handleCreateRepo();
      break;
    case 'analytics':
      await showRepoDashboard();
      break;
    case 'batch':
      await handleBatchRepos();
      break;
    case 'performance':
      await showPerformanceDashboard();
      break;
    case 'clone_public':
      await handleClonePublicRepo();
      break;
    case 'clear_cache':
      clearCaches();
      clearAnalyticsCache(); // Clear our new analytics cache too
      clearSuggestionsCache(); // Clear suggestions cache too
      clearPerformanceMetrics(); // Clear performance metrics too
      break;
    case 'exit':
      console.log('👋 Exiting...!');
      process.exit(0);
  }
}

/**
 * Show main menu for users in a git repository
 */
async function showRepoMenuAdvanced() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '📌 Choose an option:',
      choices: [
        { name: '1️⃣ Analytics Dashboard', value: 'analytics' },
        { name: '2️⃣ Batch Repository Operations', value: 'batch' },
        { name: '3️⃣ Performance Monitoring', value: 'performance' },
        { name: '4️⃣ Push to Repository', value: 'push' },
        { name: '7️⃣ Pull Latest Changes', value: 'pull' },
        { name: '8️⃣ Branch Management', value: 'branch' },
        { name: '9️⃣ Show Status', value: 'status' },
        { name: '0️⃣ Show Commit History', value: 'history' },
        { name: '🔟 Clear Caches', value: 'clear_cache' },
        { name: '6️⃣ Exit', value: 'exit' }
      ]
    }
  ]);
  
  switch (answers.action) {
    case 'analytics':
      await showRepoDashboard();
      break;
    case 'batch':
      await handleBatchRepos();
      break;
    case 'performance':
      await showPerformanceDashboard();
      break;
    case 'push':
      await handlePushRepo();
      break;
    case 'pull':
      await handlePullRepo();
      break;
    case 'branch':
      await showBranchMenu();
      break;
    case 'status':
      await showStatusAdvanced();
      break;
    case 'history':
      await showCommitHistoryAdvanced();
      break;
    case 'clear_cache':
      clearCaches();
      clearAnalyticsCache(); // Clear our new analytics cache too
      clearSuggestionsCache(); // Clear suggestions cache too
      clearPerformanceMetrics(); // Clear performance metrics too
      break;
    case 'exit':
      console.log('👋 Exiting...!');
      process.exit(0);
  }
}

/**
 * Show branch management submenu
 */
async function showBranchMenu() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '📌 Branch Management:',
      choices: [
        { name: 'a) Create new branch', value: 'create' },
        { name: 'b) List branches', value: 'list' },
        { name: 'c) Switch branch', value: 'switch' },
        { name: 'Back to main menu', value: 'back' }
      ]
    }
  ]);
  
  switch (answers.action) {
    case 'create':
      const createAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'branchName',
          message: 'Enter new branch name:'
        }
      ]);
      await createBranchAdvanced(createAnswers.branchName);
      break;
    case 'list':
      await listBranchesAdvanced();
      break;
    case 'switch':
      const switchAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'branchName',
          message: 'Enter branch name to switch to:'
        }
      ]);
      await switchBranchAdvanced(switchAnswers.branchName);
      break;
    case 'back':
      return;
  }
}

/**
 * Handle repository creation
 */
async function handleCreateRepo() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'repoName',
      message: 'Enter repository name:'
    },
    {
      type: 'confirm',
      name: 'isPrivate',
      message: 'Private repo?',
      default: true
    }
  ]);
  
  const success = await createRepo(answers.repoName, answers.isPrivate);
  if (success) {
    // Auto-clone the newly created repository
    try {
      const repoUrl = getAuthCloneUrl(answers.repoName);
      autoCloneAndExitAdvanced(answers.repoName, repoUrl);
    } catch (error) {
      console.error('❌ Auto-clone failed after repository creation');
    }
  }
}

/**
 * Handle public repository cloning
 */
async function handleClonePublicRepo() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'repoUrl',
      message: 'Enter public Git repository URL:'
    }
  ]);
  
  if (!answers.repoUrl) {
    console.log('❌ Invalid URL!');
    return;
  }
  
  try {
    const repoName = answers.repoUrl.split('/').pop().replace('.git', '');
    await cloneRepoAdvanced(answers.repoUrl, repoName);
    
    const repoPath = path.join(process.cwd(), repoName);
    if (fs.existsSync(repoPath)) {
      console.log(`📂 Repository '${repoName}' is ready!`);
      console.log('👋 Exiting script...');
      process.exit(0);
    } else {
      console.log('❌ Clone failed!');
    }
  } catch (error) {
    console.error('❌ Failed to clone repository');
  }
}

/**
 * Handle pushing to repository
 */
async function handlePushRepo() {
  // First check if there are any changes
  try {
    // Check if we're in a git repository
    if (!fs.existsSync('.git')) {
      console.log("❌ This is not a Git repository!");
      return;
    }
    
    // Check status using executeCommandAdvanced from core
    const statusResult = await executeCommandAdvanced('git status --porcelain', { silent: true });
    if (!statusResult.success || !statusResult.stdout || statusResult.stdout.length === 0) {
      console.log('ℹ️ No changes to commit');
      return;
    }
    
    // Show what will be committed
    console.log('Changes to be committed:');
    await executeCommandAdvanced('git status --short');
    
    // Ask for confirmation or use default message
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: 'Enter commit message:',
        default: 'Auto commit - ' + new Date().toISOString().split('T')[0]
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Proceed with commit and push?',
        default: true
      }
    ]);
    
    if (answers.confirm) {
      await pushRepoAdvanced(answers.message);
    } else {
      console.log('❌ Push cancelled');
    }
  } catch (error) {
    console.error('❌ Error checking repository status:', error.message);
  }
}

/**
 * Handle pulling from repository
 */
async function handlePullRepo() {
  await pullRepoAdvanced();
}

/**
 * Show the appropriate main menu based on context
 */
async function showMainMenuAdvanced() {
  // Check if we're in a git repository
  const inGitRepo = isInGitRepo();
  
  // Show smart suggestions on startup
  if (inGitRepo) {
    const suggestions = await getSmartSuggestions();
    if (suggestions.length > 0) {
      console.log('\n💡 Smart Suggestions:');
      suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion.message}`);
      });
    }
  }
  
  while (true) {
    try {
      if (inGitRepo) {
        await showRepoMenuAdvanced();
      } else {
        await showNonRepoMenuAdvanced();
      }
      
      // Small delay to allow reading output
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('❌ An error occurred:', error.message);
    }
  }
}

module.exports = {
  showMainMenuAdvanced
};