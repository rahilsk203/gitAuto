const { executeCommandAdvanced } = require('../core');
const fs = require('fs');

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
        // Error 11: Invalid path (Windows path issue)
        else if (result.stderr.includes('error: invalid path')) {
          console.log('❌ Invalid path detected');
          console.log('💡 Suggestion: File path contains characters invalid on Windows');
          console.log('\n📝 How to fix:');
          console.log('1. Rename files with invalid characters (:, *, ?, ", <, >, |)');
          console.log('2. Use only alphanumeric characters, hyphens, and underscores');
          console.log('3. Keep file paths under 260 characters');
          console.log('4. Avoid trailing spaces or periods in filenames');
          
          return { success: false, message: 'Invalid path', error: result.stderr };
        }
        // Error 12: Fetch into current branch
        else if (result.stderr.includes('refusing to fetch into current branch')) {
          console.log('❌ Fetch into current branch not allowed');
          console.log('💡 Suggestion: Git refuses to fetch directly into the currently checked out branch');
          
          console.log('\n📚 Fetch Troubleshooting:');
          console.log('1. Switch to a different branch: git checkout <other-branch>');
          console.log('2. Then fetch: git fetch');
          console.log('3. Or use pull instead: git pull');
          console.log('4. Or fetch to a different branch: git fetch origin <branch>:<local-branch>');
          
          return { success: false, message: 'Fetch into current branch not allowed', error: result.stderr };
        }
        // Error 13-100: Additional pull errors
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

module.exports = {
  pullRepoAdvanced
};