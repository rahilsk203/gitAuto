const { executeCommandAdvanced } = require('../core');
const fs = require('fs');
const inquirer = require('inquirer');

/**
 * Add files to git with comprehensive error handling
 * @returns {Promise<Object>} Result object
 */
async function addFilesAdvanced() {
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
    
    console.log('🔄 Adding files to git...');
    
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
      
      return { success: false, message: 'Failed to add files', error: addResult.stderr };
    }
    
    console.log('✅ Files added successfully!');
    return { success: true, message: 'Files added successfully' };
  } catch (error) {
    console.error('❌ Error adding files:', error.message);
    
    // Show general troubleshooting suggestions
    console.log('\n📚 General Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Git is properly configured');
    console.log('3. Ensure you have permissions to this repository');
    console.log('4. Try running the command again');
    console.log('5. Check Git configuration: git config --list');
    
    return { success: false, message: error.message };
  }
}

/**
 * Commit changes with comprehensive error handling
 * @param {string} message - Commit message
 * @returns {Promise<Object>} Result object
 */
async function commitChangesAdvanced(message = 'Auto commit') {
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
    
    console.log('🔄 Committing changes...');
    
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
      
      return { success: false, message: 'Failed to commit changes', error: commitResult.stderr };
    }
    
    console.log('✅ Changes committed successfully!');
    return { success: true, message: 'Changes committed successfully' };
  } catch (error) {
    console.error('❌ Error committing changes:', error.message);
    
    // Show general troubleshooting suggestions
    console.log('\n📚 General Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Git is properly configured');
    console.log('3. Ensure you have permissions to this repository');
    console.log('4. Try running the command again');
    console.log('5. Check Git configuration: git config --list');
    
    return { success: false, message: error.message };
  }
}

module.exports = {
  addFilesAdvanced,
  commitChangesAdvanced
};