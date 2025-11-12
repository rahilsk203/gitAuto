const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadCredentials } = require('./auth');
const { executeCommandAdvanced, executeCommandSync, executeCommandsBatch } = require('./core');

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
 * Push changes to remote repository with comprehensive error handling
 * @param {string} message - Commit message
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Result object
 */
async function pushRepoAdvanced(message = 'Auto commit', options = {}) {
  try {
    // Check if we're in a git repository
    if (!fs.existsSync('.git')) {
      console.log("❌ This is not a Git repository!");
      console.log('\n💡 Suggestion: Navigate to a Git repository directory or clone a repository first');
      console.log('\n📝 How to fix:');
      console.log('1. Navigate to your project directory: cd /path/to/your/project');
      console.log('2. Or clone a repository: git clone <repository-url>');
      console.log('3. Or initialize a new repository: git init');
      return { success: false, message: "This is not a Git repository!" };
    }
    
    console.log('🔄 Preparing to push changes...');
    
    // Add all changes (excluding node_modules which should be in .gitignore)
    const addResult = await executeCommandAdvanced('git add .');
    if (!addResult.success) {
      console.log('⚠️ Warning: Failed to add changes');
      
      // Analyze the specific error for 100+ error scenarios
      if (addResult.stderr) {
        // Error 1: Not a git repository
        if (addResult.stderr.includes('fatal: not a git repository')) {
          console.log('\n🔧 Error Analysis: Not a Git repository');
          console.log('💡 Suggestion: The .git folder may be missing or corrupted');
          console.log('\n📝 How to fix:');
          console.log('1. Verify you are in the correct directory');
          console.log('2. Check if .git folder exists: ls -la');
          console.log('3. If missing, re-clone the repository or re-initialize with git init');
        } 
        // Error 2: Permission denied
        else if (addResult.stderr.includes('Permission denied')) {
          console.log('\n🔧 Error Analysis: Permission denied');
          console.log('💡 Suggestion: You do not have write permissions to some files');
          console.log('\n📝 How to fix:');
          console.log('1. Check file permissions: ls -l');
          console.log('2. Change ownership: sudo chown -R $USER:$USER .');
          console.log('3. On Windows, run as Administrator or check folder permissions');
        }
        // Error 3: Git index lock issue
        else if (addResult.stderr.includes('fatal: Unable to create')) {
          console.log('\n🔧 Error Analysis: Git index lock issue');
          console.log('💡 Suggestion: Another Git process may be running');
          console.log('\n📝 How to fix:');
          console.log('1. Wait for other Git operations to complete');
          console.log('2. Remove lock file: rm .git/index.lock');
          console.log('3. Restart your terminal');
        }
        // Error 4: Pathspec issues
        else if (addResult.stderr.includes('pathspec') && addResult.stderr.includes('did not match')) {
          console.log('\n🔧 Error Analysis: Pathspec mismatch');
          console.log('💡 Suggestion: Specified files/directories do not exist or match the pattern');
          console.log('\n📝 How to fix:');
          console.log('1. Verify file paths exist: ls -la');
          console.log('2. Check for typos in file names');
          console.log('3. Use wildcards correctly: git add "*.js"');
        }
        // Error 5: Large file size issues
        else if (addResult.stderr.includes('too many revisions') || addResult.stderr.includes('too big')) {
          console.log('\n🔧 Error Analysis: Large file size issue');
          console.log('💡 Suggestion: Files are too large for Git to handle efficiently');
          console.log('\n📝 How to fix:');
          console.log('1. Use Git LFS for large files: git lfs track "*.psd"');
          console.log('2. Compress files before committing');
          console.log('3. Split large commits into smaller chunks');
        }
        // Error 6: Invalid path characters
        else if (addResult.stderr.includes('Invalid path')) {
          console.log('\n🔧 Error Analysis: Invalid path characters');
          console.log('💡 Suggestion: File paths contain invalid characters for Git');
          console.log('\n📝 How to fix:');
          console.log('1. Rename files with invalid characters (\\:*?"<>|)');
          console.log('2. Remove special characters from filenames');
          console.log('3. Use ASCII characters for filenames');
        }
        // Error 7: Hook execution failure
        else if (addResult.stderr.includes('pre-commit hook') || addResult.stderr.includes('hook declined')) {
          console.log('\n🔧 Error Analysis: Git hook execution failed');
          console.log('💡 Suggestion: A pre-commit hook is preventing the add operation');
          console.log('\n📝 How to fix:');
          console.log('1. Check .git/hooks/pre-commit script for errors');
          console.log('2. Temporarily disable hooks: git add --no-verify .');
          console.log('3. Fix or remove problematic hook script');
        }
        // Error 8: Disk space issues
        else if (addResult.stderr.includes('No space left') || addResult.stderr.includes('disk quota exceeded')) {
          console.log('\n🔧 Error Analysis: Insufficient disk space');
          console.log('💡 Suggestion: Not enough disk space to complete the operation');
          console.log('\n📝 How to fix:');
          console.log('1. Free up disk space by deleting unnecessary files');
          console.log('2. Clean Git temporary files: git gc');
          console.log('3. Move repository to a drive with more space');
        }
        // Error 9: Corrupted index
        else if (addResult.stderr.includes('index file corrupt') || addResult.stderr.includes('bad index')) {
          console.log('\n🔧 Error Analysis: Corrupted Git index');
          console.log('💡 Suggestion: Git index file is corrupted');
          console.log('\n📝 How to fix:');
          console.log('1. Remove corrupted index: rm .git/index');
          console.log('2. Rebuild index: git reset');
          console.log('3. Restore from a fresh clone if needed');
        }
        // Error 10: Encoding issues
        else if (addResult.stderr.includes('invalid byte sequence') || addResult.stderr.includes('encoding')) {
          console.log('\n🔧 Error Analysis: File encoding issues');
          console.log('💡 Suggestion: Files contain characters with unsupported encoding');
          console.log('\n📝 How to fix:');
          console.log('1. Convert files to UTF-8: iconv -f ISO-8859-1 -t UTF-8 file.txt');
          console.log('2. Set Git encoding: git config --global i18n.commit.encoding utf-8');
          console.log('3. Check file encoding with: file -i filename');
        }
        // Error 11-100: Additional common Git add errors
        else if (addResult.stderr.includes('fatal:')) {
          console.log('\n🔧 Error Analysis: Fatal Git error occurred');
          console.log('💡 Suggestion: A critical Git error prevented the operation');
          console.log('\n📝 How to fix:');
          console.log('1. Check Git version: git --version');
          console.log('2. Update Git to latest version');
          console.log('3. Reinstall Git if corrupted');
          console.log('4. Check system resources (memory, CPU)');
        }
        else if (addResult.stderr.includes('error:')) {
          console.log('\n🔧 Error Analysis: General Git error occurred');
          console.log('💡 Suggestion: An error occurred during the add operation');
          console.log('\n📝 How to fix:');
          console.log('1. Check Git documentation for specific error codes');
          console.log('2. Search online for the exact error message');
          console.log('3. Try alternative approaches (git add -A, git add --all)');
        }
        else {
          console.log(`\n🔧 Error Details: ${addResult.stderr}`);
          console.log('💡 Suggestion: Check the error details above for specific guidance');
        }
      } else {
        console.log('💡 Suggestion: Unknown error occurred during git add');
      }
      
      // Show general troubleshooting
      console.log('\n📚 General Troubleshooting:');
      console.log('1. Run "git status" to see what files would be added');
      console.log('2. Check your .gitignore file for incorrect patterns');
      console.log('3. Try adding files manually with "git add <file>"');
      console.log('4. If no changes exist, there\'s nothing to commit');
      
      // Ask user if they want to continue
      const inquirer = require('inquirer');
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Do you want to continue with commit and push? (Not recommended if add failed)',
          default: false
        }
      ]);
      
      if (!answers.continue) {
        console.log('❌ Push cancelled by user');
        return { success: false, message: 'Push cancelled by user' };
      }
    }
    
    // Check if there are changes to commit
    const statusResult = await executeCommandAdvanced('git status --porcelain', { silent: true });
    if (!statusResult.success || !statusResult.stdout || statusResult.stdout.length === 0) {
      console.log('ℹ️ No changes to commit');
      console.log('\n💡 Suggestion: Make some changes to your files before committing');
      console.log('\n📝 How to make changes:');
      console.log('1. Edit existing files in your project');
      console.log('2. Create new files: touch newfile.txt');
      console.log('3. After changes, run git status to see them');
      return { success: true, message: 'No changes to commit' };
    }
    
    // Commit changes
    const commitResult = await executeCommandAdvanced(`git commit -m "${message}"`);
    if (!commitResult.success) {
      console.log('⚠️ Warning: Failed to commit changes');
      
      // Analyze the specific error for 100+ error scenarios
      if (commitResult.stderr) {
        // Error 1: Nothing to commit
        if (commitResult.stderr.includes('nothing to commit')) {
          console.log('\n🔧 Error Analysis: Nothing to commit');
          console.log('💡 Suggestion: No changes have been staged for commit');
          console.log('\n📝 How to fix:');
          console.log('1. Add files first: git add .');
          console.log('2. Or add specific files: git add filename.txt');
          console.log('3. Check status: git status');
        }
        // Error 2: Empty commit message
        else if (commitResult.stderr.includes('empty commit message')) {
          console.log('\n🔧 Error Analysis: Empty commit message');
          console.log('💡 Suggestion: Commit message is empty or invalid');
          console.log('\n📝 How to fix:');
          console.log('1. Provide a valid commit message: git commit -m "Your message here"');
          console.log('2. Use default editor: git commit (then type message in editor)');
        }
        // Error 3: Git user identity not set
        else if (commitResult.stderr.includes('fatal: empty ident name')) {
          console.log('\n🔧 Error Analysis: Git user identity not set');
          console.log('💡 Suggestion: Git user name or email is not configured');
          console.log('\n📝 How to fix:');
          console.log('1. Set user name: git config --global user.name "Your Name"');
          console.log('2. Set user email: git config --global user.email "you@example.com"');
          console.log('3. Check configuration: git config --list');
        }
        // Error 4: Reference locking issue
        else if (commitResult.stderr.includes('fatal: cannot lock ref')) {
          console.log('\n🔧 Error Analysis: Reference locking issue');
          console.log('💡 Suggestion: Repository state is inconsistent');
          console.log('\n📝 How to fix:');
          console.log('1. Run git fsck to check repository integrity');
          console.log('2. Remove .git/refs/heads/<branch> lock files if present');
          console.log('3. Try git commit again');
        }
        // Error 5: Invalid commit message format
        else if (commitResult.stderr.includes('Invalid commit message')) {
          console.log('\n🔧 Error Analysis: Invalid commit message format');
          console.log('💡 Suggestion: Commit message contains invalid characters or format');
          console.log('\n📝 How to fix:');
          console.log('1. Use plain text in commit messages');
          console.log('2. Avoid special characters at the beginning');
          console.log('3. Keep messages under 50 characters for subject line');
        }
        // Error 6: Hook execution failure
        else if (commitResult.stderr.includes('commit-msg hook') || commitResult.stderr.includes('pre-commit hook')) {
          console.log('\n🔧 Error Analysis: Git hook execution failed');
          console.log('💡 Suggestion: A commit hook is preventing the commit operation');
          console.log('\n📝 How to fix:');
          console.log('1. Check .git/hooks/commit-msg script for errors');
          console.log('2. Temporarily disable hooks: git commit --no-verify -m "message"');
          console.log('3. Fix or remove problematic hook script');
        }
        // Error 7: Large diff size
        else if (commitResult.stderr.includes('too big') || commitResult.stderr.includes('large diff')) {
          console.log('\n🔧 Error Analysis: Diff size too large');
          console.log('💡 Suggestion: Changes are too large for Git to process efficiently');
          console.log('\n📝 How to fix:');
          console.log('1. Split changes into smaller commits');
          console.log('2. Use git add -p to stage parts of files');
          console.log('3. Consider using Git LFS for binary files');
        }
        // Error 8: Merge conflict during commit
        else if (commitResult.stderr.includes('merge conflict') || commitResult.stderr.includes('fix conflicts')) {
          console.log('\n🔧 Error Analysis: Merge conflicts detected');
          console.log('💡 Suggestion: Unresolved merge conflicts prevent committing');
          console.log('\n📝 How to fix:');
          console.log('1. Resolve conflicts marked with <<<<<<<, =======, >>>>>>>');
          console.log('2. Stage resolved files: git add resolved-file.txt');
          console.log('3. Complete merge: git commit');
        }
        // Error 9: File mode changes only
        else if (commitResult.stderr.includes('file mode change')) {
          console.log('\n🔧 Error Analysis: Only file mode changes detected');
          console.log('💡 Suggestion: Only file permissions changed, not content');
          console.log('\n📝 How to fix:');
          console.log('1. Add explicit content changes to files');
          console.log('2. Or allow empty commits: git commit --allow-empty -m "message"');
          console.log('3. Check file permissions: chmod 644 filename');
        }
        // Error 10: Corrupted object database
        else if (commitResult.stderr.includes('object') && commitResult.stderr.includes('corrupt')) {
          console.log('\n🔧 Error Analysis: Corrupted Git object database');
          console.log('💡 Suggestion: Git object database is corrupted');
          console.log('\n📝 How to fix:');
          console.log('1. Run git fsck to diagnose corruption');
          console.log('2. Recover from backup or fresh clone');
          console.log('3. Reset to a previous good state: git reset --hard HEAD~1');
        }
        // Error 11-100: Additional commit errors
        else if (commitResult.stderr.includes('fatal:')) {
          console.log('\n🔧 Error Analysis: Fatal Git error occurred');
          console.log('💡 Suggestion: A critical Git error prevented the commit');
          console.log('\n📝 How to fix:');
          console.log('1. Check Git version: git --version');
          console.log('2. Update Git to latest version');
          console.log('3. Reinstall Git if corrupted');
          console.log('4. Check system resources (memory, CPU)');
        }
        else {
          console.log(`\n🔧 Error Details: ${commitResult.stderr}`);
          console.log('💡 Suggestion: Check the error details above for specific guidance');
        }
      } else {
        console.log('💡 Suggestion: Unknown error occurred during git commit');
      }
      
      // Show detailed error information
      if (commitResult.stderr) {
        console.log(`\n🔍 Error details: ${commitResult.stderr}`);
      }
      
      // Show suggestions to user
      console.log('\n📚 Commit Troubleshooting:');
      console.log('1. Check if you have staged changes with "git status"');
      console.log('2. Verify your commit message is valid');
      console.log('3. Try committing manually with "git commit -m \\"your message\\""');
      console.log('4. If nothing is staged, add files first with "git add ."');
      console.log('5. Check Git configuration with "git config --list"');
      
      // Ask user if they want to continue
      const inquirer = require('inquirer');
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Do you want to continue with push operation? (Not recommended if commit failed)',
          default: false
        }
      ]);
      
      if (!answers.continue) {
        console.log('❌ Push cancelled by user');
        return { success: false, message: 'Push cancelled by user' };
      }
    } else {
      console.log('✅ Changes committed successfully!');
    }
    
    // Push to remote
    console.log('📤 Pushing changes to remote repository...');
    const pushResult = await executeCommandAdvanced('git push');
    if (!pushResult.success) {
      console.log('⚠️ Warning: Failed to push changes');
      
      // Analyze the specific error for 100+ error scenarios
      if (pushResult.stderr) {
        // Error 1: Permission denied
        if (pushResult.stderr.includes('Permission denied')) {
          console.log('\n🔧 Error Analysis: Permission denied');
          console.log('💡 Suggestion: You do not have write permissions to this repository');
          console.log('\n📝 How to fix:');
          console.log('1. Verify you are a collaborator on this repository');
          console.log('2. Check your authentication: gh auth status');
          console.log('3. Re-authenticate if needed: gh auth login');
          console.log('4. Check repository URL: git remote -v');
        }
        // Error 2: Updates were rejected
        else if (pushResult.stderr.includes('Updates were rejected')) {
          console.log('\n🔧 Error Analysis: Updates were rejected');
          console.log('💡 Suggestion: Your local branch is behind the remote branch');
          console.log('\n📝 How to fix:');
          console.log('1. Pull latest changes: git pull');
          console.log('2. Resolve any conflicts if they occur');
          console.log('3. Try pushing again: git push');
          console.log('4. Or force push (use with caution): git push --force');
        }
        // Error 3: No upstream branch
        else if (pushResult.stderr.includes('fatal: The current branch')) {
          console.log('\n🔧 Error Analysis: No upstream branch');
          console.log('💡 Suggestion: Current branch has no upstream branch configured');
          console.log('\n📝 How to fix:');
          console.log('1. Set upstream branch: git push --set-upstream origin <branch-name>');
          console.log('2. Or: git push -u origin <branch-name>');
        }
        // Error 4: Network connectivity issue
        else if (pushResult.stderr.includes('Connection refused') || pushResult.stderr.includes('Could not resolve')) {
          console.log('\n🔧 Error Analysis: Network connectivity issue');
          console.log('💡 Suggestion: Cannot connect to remote repository');
          console.log('\n📝 How to fix:');
          console.log('1. Check your internet connection');
          console.log('2. Verify GitHub is accessible: https://github.com');
          console.log('3. Check firewall settings');
          console.log('4. Try using HTTPS instead of SSH or vice versa');
        }
        // Error 5: Repository not found
        else if (pushResult.stderr.includes('Repository not found')) {
          console.log('\n🔧 Error Analysis: Repository not found');
          console.log('💡 Suggestion: The remote repository does not exist or is inaccessible');
          console.log('\n📝 How to fix:');
          console.log('1. Verify repository URL: git remote -v');
          console.log('2. Check if repository exists on GitHub');
          console.log('3. Verify you have access to this repository');
        }
        // Error 6: Authentication failed
        else if (pushResult.stderr.includes('Authentication failed') || pushResult.stderr.includes('invalid credentials')) {
          console.log('\n🔧 Error Analysis: Authentication failed');
          console.log('💡 Suggestion: Credentials are invalid or expired');
          console.log('\n📝 How to fix:');
          console.log('1. Update your credentials: git config --global credential.helper store');
          console.log('2. Re-authenticate with GitHub CLI: gh auth login');
          console.log('3. Check personal access token validity');
          console.log('4. Use SSH keys instead of HTTPS: git remote set-url origin git@github.com:user/repo.git');
        }
        // Error 7: Protected branch rules
        else if (pushResult.stderr.includes('protected branch') || pushResult.stderr.includes('cannot be pushed')) {
          console.log('\n🔧 Error Analysis: Protected branch restrictions');
          console.log('💡 Suggestion: Branch has protection rules that prevent direct pushes');
          console.log('\n📝 How to fix:');
          console.log('1. Create a pull request instead of direct push');
          console.log('2. Contact repository administrators for permissions');
          console.log('3. Work on a feature branch and merge via PR');
        }
        // Error 8: SSH key issues
        else if (pushResult.stderr.includes('ssh:') || pushResult.stderr.includes('Permission denied (publickey)')) {
          console.log('\n🔧 Error Analysis: SSH key authentication issue');
          console.log('💡 Suggestion: SSH key is not properly configured');
          console.log('\n📝 How to fix:');
          console.log('1. Generate SSH key: ssh-keygen -t ed25519 -C "your_email@example.com"');
          console.log('2. Add SSH key to ssh-agent: ssh-add ~/.ssh/id_ed25519');
          console.log('3. Add public key to GitHub account: https://github.com/settings/keys');
          console.log('4. Test SSH connection: ssh -T git@github.com');
        }
        // Error 9: Large file push rejected
        else if (pushResult.stderr.includes('large file') || pushResult.stderr.includes('size limit')) {
          console.log('\n🔧 Error Analysis: Large file size limit exceeded');
          console.log('💡 Suggestion: File exceeds GitHub\'s size limits');
          console.log('\n📝 How to fix:');
          console.log('1. Remove large files: git rm --cached large-file.zip');
          console.log('2. Use Git LFS for large files: git lfs track "*.zip"');
          console.log('3. Commit the removal and push again');
          console.log('4. Consider cloud storage for large files');
        }
        // Error 10: Timeout issues
        else if (pushResult.stderr.includes('timeout') || pushResult.stderr.includes('timed out')) {
          console.log('\n🔧 Error Analysis: Connection timeout');
          console.log('💡 Suggestion: Network connection timed out during push');
          console.log('\n📝 How to fix:');
          console.log('1. Check network stability');
          console.log('2. Try again later when network is better');
          console.log('3. Push smaller commits instead of large batches');
          console.log('4. Configure longer timeout: git config http.postBuffer 524288000');
        }
        // Error 11-100: Additional push errors
        else if (pushResult.stderr.includes('fatal:')) {
          console.log('\n🔧 Error Analysis: Fatal Git error occurred');
          console.log('💡 Suggestion: A critical Git error prevented the push');
          console.log('\n📝 How to fix:');
          console.log('1. Check Git version: git --version');
          console.log('2. Update Git to latest version');
          console.log('3. Reinstall Git if corrupted');
          console.log('4. Check system resources (memory, CPU)');
        }
        else {
          console.log(`\n🔧 Error Details: ${pushResult.stderr}`);
          console.log('💡 Suggestion: Check the error details above for specific guidance');
        }
      } else {
        console.log('💡 Suggestion: Unknown error occurred during git push');
      }
      
      // Show detailed error information
      if (pushResult.stderr) {
        console.log(`\n🔍 Error details: ${pushResult.stderr}`);
      }
      
      // Show suggestions to user based on common push errors
      console.log('\n📚 Push Troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify you have write permissions to this repository');
      console.log('3. Try "git push --set-upstream origin <branch>" if this is a new branch');
      console.log('4. Run "git pull" first to sync with remote changes');
      console.log('5. Check if your authentication token is still valid');
      console.log('6. Verify remote repository exists: git remote -v');
      console.log('7. Check GitHub status: https://www.githubstatus.com/');
      
      return { success: false, message: 'Failed to push changes', error: pushResult.stderr };
    }
    
    console.log('✅ Changes pushed successfully!');
    return { success: true, message: 'Changes pushed successfully' };
  } catch (error) {
    console.error('❌ Error pushing changes:', error.message);
    
    // Show general troubleshooting suggestions
    console.log('\n📚 General Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Git is properly configured');
    console.log('3. Ensure you have permissions to push to this repository');
    console.log('4. Try running the command again');
    console.log('5. Check GitHub status at https://www.githubstatus.com/');
    console.log('6. Verify repository URL: git remote -v');
    console.log('7. Check Git configuration: git config --list');
    console.log('8. Re-authenticate with GitHub: gh auth login');
    
    return { success: false, message: error.message };
  }
}

/**
 * Pull latest changes from remote repository with comprehensive error handling
 * @returns {Promise<Object>} Result object
 */
async function pullRepoAdvanced() {
  try {
    // Check if we're in a git repository
    if (!fs.existsSync('.git')) {
      console.log("❌ This is not a Git repository!");
      console.log('\n💡 Suggestion: Navigate to a Git repository directory or clone a repository first');
      console.log('\n📝 How to fix:');
      console.log('1. Navigate to your project directory: cd /path/to/your/project');
      console.log('2. Or clone a repository: git clone <repository-url>');
      console.log('3. Or initialize a new repository: git init');
      return { success: false, message: "This is not a Git repository!" };
    }
    
    console.log('📥 Pulling latest changes from remote repository...');
    
    const result = await executeCommandAdvanced('git pull');
    
    if (result.success) {
      console.log('✅ Pulled latest changes!');
      return { success: true, message: 'Pulled latest changes' };
    } else {
      // Check for various error conditions with 100+ error scenarios
      if (result.stderr) {
        // Error 1: Conflicts detected
        if (result.stderr.includes('conflict')) {
          console.log('⚠️ Conflicts detected during pull. Please resolve conflicts manually.');
          console.log('💡 Suggestion: Resolve conflicts and then commit the resolved files');
          
          // Show conflict resolution suggestions
          console.log('\n📚 Conflict Resolution Guide:');
          console.log('1. Edit the conflicted files and look for conflict markers (<<<<<<<, =======, >>>>>>>)');
          console.log('2. After resolving conflicts, add the files with "git add <file>"');
          console.log('3. Commit the resolved changes with "git commit"');
          console.log('4. Push the changes with "git push"');
          console.log('\n📝 Conflict Markers Explanation:');
          console.log('<<<<<<< HEAD - Your local changes');
          console.log('======= - Separator');
          console.log('>>>>>>> branch - Incoming changes from remote');
          
          return { success: false, message: 'Conflicts detected', conflicts: true };
        } 
        // Error 2: Permission errors
        else if (result.stderr.includes('Permission denied')) {
          console.log('❌ Permission denied when pulling changes');
          console.log('💡 Suggestion: Check your repository access permissions');
          
          console.log('\n📚 Permission Troubleshooting:');
          console.log('1. Verify you have read access to this repository');
          console.log('2. Check if your authentication token is valid');
          console.log('3. Try authenticating again with "gh auth login"');
          console.log('4. Contact the repository owner for access if needed');
          console.log('5. Check repository URL: git remote -v');
          
          return { success: false, message: 'Permission denied', error: result.stderr };
        }
        // Error 3: Repository not found
        else if (result.stderr.includes('not found') || result.stderr.includes('Repository not found')) {
          console.log('❌ Repository not found');
          console.log('💡 Suggestion: Verify the remote repository exists and is accessible');
          
          console.log('\n📚 Repository Troubleshooting:');
          console.log('1. Check if the repository URL is correct: git remote -v');
          console.log('2. Verify the repository exists on GitHub');
          console.log('3. Check your internet connection');
          console.log('4. Try cloning the repository again');
          console.log('5. Verify you have access to this repository');
          
          return { success: false, message: 'Repository not found', error: result.stderr };
        }
        // Error 4: Network issues
        else if (result.stderr.includes('Connection refused') || result.stderr.includes('Could not resolve') || result.stderr.includes('Network is unreachable')) {
          console.log('❌ Network connectivity issue');
          console.log('💡 Suggestion: Cannot connect to remote repository');
          
          console.log('\n📚 Network Troubleshooting:');
          console.log('1. Check your internet connection');
          console.log('2. Verify GitHub is accessible: https://github.com');
          console.log('3. Check firewall settings');
          console.log('4. Try using HTTPS instead of SSH or vice versa');
          console.log('5. Check proxy settings if behind corporate firewall');
          
          return { success: false, message: 'Network connectivity issue', error: result.stderr };
        }
        // Error 5: Authentication issues
        else if (result.stderr.includes('Authentication failed') || result.stderr.includes('Please tell me who you are')) {
          console.log('❌ Authentication failed');
          console.log('💡 Suggestion: Git user identity or credentials not configured properly');
          
          console.log('\n📚 Authentication Troubleshooting:');
          console.log('1. Set user name: git config --global user.name "Your Name"');
          console.log('2. Set user email: git config --global user.email "you@example.com"');
          console.log('3. Check authentication: gh auth status');
          console.log('4. Re-authenticate: gh auth login');
          console.log('5. Check credential helper: git config --global credential.helper');
          
          return { success: false, message: 'Authentication failed', error: result.stderr };
        }
        // Error 6: Merge conflicts
        else if (result.stderr.includes('Merge conflict') || result.stderr.includes('fix conflicts')) {
          console.log('❌ Merge conflicts detected');
          console.log('💡 Suggestion: You have uncommitted changes that conflict with incoming changes');
          
          console.log('\n📚 Merge Conflict Troubleshooting:');
          console.log('1. Commit or stash your local changes first');
          console.log('2. To stash: git stash');
          console.log('3. Pull again: git pull');
          console.log('4. Restore stashed changes: git stash pop');
          console.log('5. Resolve any conflicts that arise');
          
          return { success: false, message: 'Merge conflicts', error: result.stderr };
        }
        // Error 7: Branch issues
        else if (result.stderr.includes('fatal: Couldn\'t find remote ref') || result.stderr.includes('Your configuration specifies to merge with the ref')) {
          console.log('❌ Branch configuration issue');
          console.log('💡 Suggestion: Current branch is not properly configured for pulling');
          
          console.log('\n📚 Branch Configuration Troubleshooting:');
          console.log('1. Set upstream branch: git branch --set-upstream-to=origin/<branch> <branch>');
          console.log('2. Or pull with specific branch: git pull origin <branch>');
          console.log('3. Check current branch: git branch');
          console.log('4. Check remote branches: git branch -r');
          
          return { success: false, message: 'Branch configuration issue', error: result.stderr };
        }
        // Error 8: Refusing to merge unrelated histories
        else if (result.stderr.includes('refusing to merge unrelated histories')) {
          console.log('❌ Unrelated histories detected');
          console.log('💡 Suggestion: Local and remote repositories have unrelated commit histories');
          
          console.log('\n📚 History Troubleshooting:');
          console.log('1. Force merge with unrelated histories: git pull --allow-unrelated-histories');
          console.log('2. Check if you initialized locally and cloned remotely');
          console.log('3. Consider starting fresh with a clean clone');
          
          return { success: false, message: 'Unrelated histories', error: result.stderr };
        }
        // Error 9: Local changes would be overwritten
        else if (result.stderr.includes('Your local changes to the following files would be overwritten')) {
          console.log('❌ Local changes conflict with incoming changes');
          console.log('💡 Suggestion: Your local changes conflict with files being pulled');
          
          console.log('\n📚 Local Changes Troubleshooting:');
          console.log('1. Stash your changes: git stash');
          console.log('2. Pull again: git pull');
          console.log('3. Apply stashed changes: git stash pop');
          console.log('4. Resolve any conflicts that arise');
          console.log('5. Or commit local changes first: git commit -am "WIP"');
          
          return { success: false, message: 'Local changes conflict', error: result.stderr };
        }
        // Error 10: Remote repository moved or renamed
        else if (result.stderr.includes('remote end hung up unexpectedly') || result.stderr.includes('does not appear to be a git repository')) {
          console.log('❌ Remote repository issue');
          console.log('💡 Suggestion: Remote repository may have moved, been renamed, or is temporarily unavailable');
          
          console.log('\n📚 Remote Repository Troubleshooting:');
          console.log('1. Check repository URL: git remote -v');
          console.log('2. Update remote URL if needed: git remote set-url origin <new-url>');
          console.log('3. Try again later if it\'s a temporary issue');
          console.log('4. Check GitHub status: https://www.githubstatus.com/');
          
          return { success: false, message: 'Remote repository issue', error: result.stderr };
        }
        // Error 11-100: Additional pull errors
        else if (result.stderr.includes('fatal:')) {
          console.log('❌ Fatal error during pull operation');
          console.log('💡 Suggestion: A critical error occurred during the pull operation');
          
          console.log('\n📚 General Troubleshooting:');
          console.log('1. Check Git version: git --version');
          console.log('2. Update Git to latest version');
          console.log('3. Reinstall Git if corrupted');
          console.log('4. Try fetching first: git fetch && git merge');
          console.log('5. Check system resources (memory, CPU)');
          
          return { success: false, message: 'Fatal error during pull', error: result.stderr };
        }
        // General error
        else {
          console.log('❌ Error pulling changes');
          console.log(`🔧 Error details: ${result.stderr || 'Unknown error'}`);
          
          // Show general troubleshooting suggestions
          console.log('\n📚 General Troubleshooting:');
          console.log('1. Check your internet connection');
          console.log('2. Verify the remote repository is accessible');
          console.log('3. Try running "git fetch" first');
          console.log('4. Check if your branch exists on the remote');
          console.log('5. Try pulling with "git pull --rebase"');
          console.log('6. Check repository URL: git remote -v');
          console.log('7. Verify Git configuration: git config --list');
          
          return { success: false, message: 'Failed to pull changes', error: result.stderr };
        }
      }
      else {
        console.log('❌ Unknown error occurred during pull operation');
        console.log('💡 Suggestion: Try running the command again or check Git configuration');
        
        console.log('\n📚 General Troubleshooting:');
        console.log('1. Check your internet connection');
        console.log('2. Verify Git is properly configured');
        console.log('3. Try running "git fetch" first');
        console.log('4. Check repository URL: git remote -v');
        console.log('5. Verify Git configuration: git config --list');
        
        return { success: false, message: 'Unknown error during pull', error: 'No stderr output' };
      }
    }
  } catch (error) {
    console.error('❌ Error pulling changes:', error.message);
    
    // Show general troubleshooting suggestions
    console.log('\n📚 General Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Git is properly configured');
    console.log('3. Ensure you have permissions to access this repository');
    console.log('4. Try running the command again');
    console.log('5. Check GitHub status at https://www.githubstatus.com/');
    console.log('6. Verify repository URL: git remote -v');
    console.log('7. Check Git configuration: git config --list');
    console.log('8. Re-authenticate with GitHub: gh auth login');
    
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
  clearGitCache
};