const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { loadCredentials } = require('./auth');
const { createRepo, deleteRepo, setRepoVisibility, getAuthCloneUrl } = require('./github');
const { 
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
} = require('./git');

/**
 * Check if we're currently in a git repository
 * @returns {boolean} True if in a git repository
 */
function isInGitRepo() {
  return fs.existsSync('.git');
}

/**
 * Show main menu for users not in a git repository
 */
async function showNonRepoMenu() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '📌 Choose an option:',
      choices: [
        { name: '1️⃣ Create Repository', value: 'create' },
        { name: '5️⃣ Clone Public Repository', value: 'clone_public' },
        { name: '6️⃣ Exit', value: 'exit' }
      ]
    }
  ]);
  
  switch (answers.action) {
    case 'create':
      await handleCreateRepo();
      break;
    case 'clone_public':
      await handleClonePublicRepo();
      break;
    case 'exit':
      console.log('👋 Exiting...!');
      process.exit(0);
  }
}

/**
 * Show main menu for users in a git repository
 */
async function showRepoMenu() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '📌 Choose an option:',
      choices: [
        { name: '4️⃣ Push to Repository', value: 'push' },
        { name: '7️⃣ Pull Latest Changes', value: 'pull' },
        { name: '8️⃣ Branch Management', value: 'branch' },
        { name: '9️⃣ Show Status', value: 'status' },
        { name: '0️⃣ Show Commit History', value: 'history' },
        { name: '6️⃣ Exit', value: 'exit' }
      ]
    }
  ]);
  
  switch (answers.action) {
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
      await showStatus();
      break;
    case 'history':
      await showCommitHistory();
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
      await createBranch(createAnswers.branchName);
      break;
    case 'list':
      await listBranches();
      break;
    case 'switch':
      const switchAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'branchName',
          message: 'Enter branch name to switch to:'
        }
      ]);
      await switchBranch(switchAnswers.branchName);
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
      autoCloneAndExit(answers.repoName, repoUrl);
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
    await cloneRepo(answers.repoUrl, repoName);
    
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
    
    // Check status
    const statusOutput = executeCommand('git status --porcelain', { silent: true });
    if (!statusOutput || statusOutput.length === 0) {
      console.log('ℹ️ No changes to commit');
      return;
    }
    
    // Show what will be committed
    console.log('Changes to be committed:');
    executeCommand('git status --short');
    
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
      await pushRepo(answers.message);
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
  await pullRepo();
}

/**
 * Show the appropriate main menu based on context
 */
async function showMainMenu() {
  // Check if we're in a git repository
  const inGitRepo = isInGitRepo();
  
  while (true) {
    try {
      if (inGitRepo) {
        await showRepoMenu();
      } else {
        await showNonRepoMenu();
      }
      
      // Small delay to allow reading output
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('❌ An error occurred:', error.message);
    }
  }
}

module.exports = {
  showMainMenu
};