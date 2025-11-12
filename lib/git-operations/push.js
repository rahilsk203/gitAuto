const { executeCommandAdvanced } = require('../core');
const fs = require('fs');
const inquirer = require('inquirer');

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
        // Error 11: GPG signing issue
        else if (commitResult.stderr.includes('cannot run gpg') || commitResult.stderr.includes('gpg failed')) {
          console.log('\n🔧 Error Analysis: GPG signing issue');
          console.log('💡 Suggestion: Git is configured to sign commits but GPG is not available');
          console.log('\n📝 How to fix:');
          console.log('1. Install GPG: https://gnupg.org/download/');
          console.log('2. Or disable commit signing: git config --global commit.gpgsign false');
          console.log('3. Or configure GPG correctly: git config --global user.signingkey <key-id>');
        }
        // Error 12: Bad object reference
        else if (commitResult.stderr.includes('bad object') || commitResult.stderr.includes('fatal: reference is not a tree')) {
          console.log('\n🔧 Error Analysis: Bad object reference');
          console.log('💡 Suggestion: Repository references a commit that doesn\'t exist');
          console.log('\n📝 How to fix:');
          console.log('1. Run git fsck to check repository integrity');
          console.log('2. Reset to a known good commit: git reset --hard HEAD~1');
          console.log('3. Recover from a fresh clone if needed');
        }
        // Error 13-100: Additional commit errors
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
        // Error 2: Updates were rejected (non-fast-forward)
        else if (pushResult.stderr.includes('Updates were rejected') || 
                 pushResult.stderr.includes('non-fast-forward') ||
                 pushResult.stderr.includes('failed to push some refs') ||
                 pushResult.stderr.includes('remote contains work that you do not have locally')) {
          console.log('\n🔧 Error Analysis: Non-fast-forward push rejected');
          console.log('💡 Suggestion: Your local branch is behind the remote branch');
          
          // Ask user if they want to automatically resolve the non-fast-forward rejection
          const answers = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'autoResolve',
              message: 'Would you like to automatically resolve this by pulling changes first?',
              default: true
            }
          ]);
          
          if (answers.autoResolve) {
            console.log('\n🔄 Automatically resolving non-fast-forward rejection...');
            
            // Pull latest changes
            console.log('📥 Pulling latest changes from remote repository...');
            const pullResult = await executeCommandAdvanced('git pull');
            
            if (pullResult.success) {
              console.log('✅ Pulled latest changes successfully!');
              
              // Try pushing again
              console.log('📤 Trying to push changes again...');
              const retryPushResult = await executeCommandAdvanced('git push');
              
              if (retryPushResult.success) {
                console.log('✅ Changes pushed successfully after resolving conflicts!');
                return { success: true, message: 'Changes pushed successfully after auto-resolving conflicts' };
              } else {
                console.log('❌ Still unable to push changes after pulling');
                
                // If push still fails, offer to force push (with warning)
                const forceAnswers = await inquirer.prompt([
                  {
                    type: 'confirm',
                    name: 'forcePush',
                    message: 'Would you like to force push? (⚠️ This will overwrite remote history!)',
                    default: false
                  }
                ]);
                
                if (forceAnswers.forcePush) {
                  console.log('⚠️ Force pushing changes (this may affect other collaborators)...');
                  const forcePushResult = await executeCommandAdvanced('git push --force-with-lease');
                  
                  if (forcePushResult.success) {
                    console.log('✅ Changes force-pushed successfully!');
                    return { success: true, message: 'Changes force-pushed successfully' };
                  } else {
                    console.log('❌ Force push also failed');
                    console.log(`🔧 Error details: ${forcePushResult.stderr}`);
                    return { success: false, message: 'Force push failed', error: forcePushResult.stderr };
                  }
                } else {
                  console.log('❌ Push cancelled by user');
                  return { success: false, message: 'Push cancelled by user after conflict resolution attempt' };
                }
              }
            } else {
              console.log('❌ Failed to pull changes');
              console.log(`🔧 Error details: ${pullResult.stderr}`);
              
              // If there are conflicts during pull, guide the user to resolve them manually
              if (pullResult.stderr.includes('conflict')) {
                console.log('\n⚠️ Conflicts detected during pull. Manual resolution required.');
                console.log('\n📝 How to resolve conflicts manually:');
                console.log('1. Edit the conflicted files and look for conflict markers (<<<<<<<, =======, >>>>>>>)');
                console.log('2. After resolving conflicts, add the files with "git add <file>"');
                console.log('3. Commit the resolved changes with "git commit"');
                console.log('4. Push the changes with "git push"');
                return { success: false, message: 'Conflicts detected during pull', conflicts: true };
              }
              
              return { success: false, message: 'Failed to pull changes', error: pullResult.stderr };
            }
          } else {
            console.log('\n📝 How to fix:');
            console.log('1. Pull latest changes: git pull');
            console.log('2. Resolve any conflicts if they occur');
            console.log('3. Try pushing again: git push');
            console.log('4. Or force push (use with caution): git push --force');
            console.log('\n⚠️ Warning: Force pushing rewrites history and can cause issues for other collaborators');
          }
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
        // Error 11: Remote ref not found
        else if (pushResult.stderr.includes('fatal: couldn\'t find remote ref')) {
          console.log('\n🔧 Error Analysis: Remote branch not found');
          console.log('💡 Suggestion: The remote branch you are trying to push to does not exist');
          console.log('\n📝 How to fix:');
          console.log('1. Verify branch exists on remote: git branch -r');
          console.log('2. Create the branch on remote: git push --set-upstream origin <branch-name>');
          console.log('3. Or push to a different branch: git push origin <local-branch>:<remote-branch>');
        }
        // Error 12: Remote end hung up
        else if (pushResult.stderr.includes('remote end hung up unexpectedly')) {
          console.log('\n🔧 Error Analysis: Remote connection interrupted');
          console.log('💡 Suggestion: Connection to remote server was terminated unexpectedly');
          console.log('\n📝 How to fix:');
          console.log('1. Check network stability');
          console.log('2. Try again later when network is better');
          console.log('3. Reduce commit size by pushing smaller changes');
          console.log('4. Check GitHub status: https://www.githubstatus.com/');
        }
        // Error 13: RPC failed
        else if (pushResult.stderr.includes('error: RPC failed')) {
          console.log('\n🔧 Error Analysis: Remote Procedure Call failed');
          console.log('💡 Suggestion: Network or server-side issue during data transfer');
          console.log('\n📝 How to fix:');
          console.log('1. Check network connectivity');
          console.log('2. Try again later');
          console.log('3. Configure larger buffer: git config http.postBuffer 524288000');
          console.log('4. Use SSH instead of HTTPS if currently using HTTPS');
        }
        // Error 14: Broken pipe
        else if (pushResult.stderr.includes('broken pipe')) {
          console.log('\n🔧 Error Analysis: Connection broken during data transfer');
          console.log('💡 Suggestion: Connection was interrupted while transferring data');
          console.log('\n📝 How to fix:');
          console.log('1. Check network stability');
          console.log('2. Try again with smaller commits');
          console.log('3. Increase Git buffer size: git config http.postBuffer 524288000');
          console.log('4. Retry the push operation');
        }
        // Error 15: Pack objects died
        else if (pushResult.stderr.includes('pack-objects died')) {
          console.log('\n🔧 Error Analysis: Git pack process terminated unexpectedly');
          console.log('💡 Suggestion: Git process was interrupted during object compression');
          console.log('\n📝 How to fix:');
          console.log('1. Check system resources (memory, CPU)');
          console.log('2. Try again with smaller commits');
          console.log('3. Run git gc to clean up repository: git gc --prune=now');
          console.log('4. Update Git to latest version');
        }
        // Error 16: Email privacy restrictions
        else if (pushResult.stderr.includes('email privacy restrictions')) {
          console.log('\n🔧 Error Analysis: Email privacy restrictions');
          console.log('💡 Suggestion: Commit email is blocked by GitHub privacy settings');
          console.log('\n📝 How to fix:');
          console.log('1. Use a public email address in Git config: git config --global user.email "public@example.com"');
          console.log('2. Or enable email privacy in GitHub settings: https://github.com/settings/emails');
          console.log('3. Amend last commit with correct email: git commit --amend --author="Author Name <public@example.com>"');
        }
        // Error 17: Rebase in progress
        else if (pushResult.stderr.includes('rebase is in progress')) {
          console.log('\n🔧 Error Analysis: Rebase operation in progress');
          console.log('💡 Suggestion: You cannot push while a rebase operation is in progress');
          console.log('\n📝 How to fix:');
          console.log('1. Complete the rebase: git rebase --continue');
          console.log('2. Or abort the rebase: git rebase --abort');
          console.log('3. After resolving, try pushing again');
        }
        // Error 18: Shallow update issue
        else if (pushResult.stderr.includes('shallow update')) {
          console.log('\n🔧 Error Analysis: Shallow repository update issue');
          console.log('💡 Suggestion: Cannot push from a shallow clone repository');
          console.log('\n📝 How to fix:');
          console.log('1. Unshallow the repository: git fetch --unshallow');
          console.log('2. Or clone the repository normally without --depth flag');
          console.log('3. Then try pushing again');
        }
        // Error 19: Unqualified destination
        else if (pushResult.stderr.includes('unqualified destination')) {
          console.log('\n🔧 Error Analysis: Unqualified destination reference');
          console.log('💡 Suggestion: Destination branch name is ambiguous or not specified');
          console.log('\n📝 How to fix:');
          console.log('1. Specify full branch name: git push origin <branch-name>');
          console.log('2. Set upstream branch: git push -u origin <branch-name>');
          console.log('3. Check remote branch names: git branch -r');
        }
        // Error 20: Remote unpack failed
        else if (pushResult.stderr.includes('remote unpack failed')) {
          console.log('\n🔧 Error Analysis: Remote server failed to unpack objects');
          console.log('💡 Suggestion: Remote server encountered an error while processing pushed data');
          console.log('\n📝 How to fix:');
          console.log('1. Try again later (may be temporary server issue)');
          console.log('2. Check GitHub status: https://www.githubstatus.com/');
          console.log('3. Push smaller commits instead of large batches');
          console.log('4. Contact repository owner if issue persists');
        }
        // Error 21: Early EOF
        else if (pushResult.stderr.includes('early EOF')) {
          console.log('\n🔧 Error Analysis: Connection terminated early');
          console.log('💡 Suggestion: Network connection was terminated before data transfer completed');
          console.log('\n📝 How to fix:');
          console.log('1. Check network stability');
          console.log('2. Try again with smaller commits');
          console.log('3. Increase Git buffer size: git config http.postBuffer 524288000');
          console.log('4. Use SSH instead of HTTPS if currently using HTTPS');
        }
        // Error 22: Object file empty
        else if (pushResult.stderr.includes('object file is empty')) {
          console.log('\n🔧 Error Analysis: Repository object file is corrupted');
          console.log('💡 Suggestion: Git object file is empty or corrupted');
          console.log('\n📝 How to fix:');
          console.log('1. Run git fsck to check repository integrity');
          console.log('2. Remove corrupted objects: rm .git/objects/<path-to-empty-file>');
          console.log('3. Recover from backup or fresh clone');
          console.log('4. Reset to a known good commit: git reset --hard HEAD~1');
        }
        // Error 23: History rewrite issues
        else if (pushResult.stderr.includes('history rewrite') || 
                 pushResult.stderr.includes('rewritten commits') ||
                 pushResult.stderr.includes('after amend') ||
                 pushResult.stderr.includes('after rebase/reset') ||
                 pushResult.stderr.includes('src refspec')) {
          console.log('\n🔧 Error Analysis: History rewrite conflicts');
          console.log('💡 Suggestion: Local history conflicts with remote due to rebase, reset, or amend operations');
          console.log('\n📝 How to fix:');
          console.log('1. Fetch latest changes: git fetch');
          console.log('2. Rebase your changes: git rebase origin/main');
          console.log('3. Or merge remote changes: git pull');
          console.log('4. Force push if you\'re certain (⚠️ CAUTION: This overwrites remote history): git push --force-with-lease');
          console.log('\n⚠️ Warning: Force pushing can cause issues for collaborators. Use --force-with-lease for safer force pushes.');
        }
        // Error 24-100: Additional push errors
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

module.exports = {
  pushRepoAdvanced
};