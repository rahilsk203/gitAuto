# gitAuto Features

## Automatic Conflict Resolution for Non-Fast-Forward Push Rejections

### Overview
gitAuto now includes an intelligent automatic conflict resolution feature that handles non-fast-forward push rejections gracefully. When a push operation fails due to the remote branch being ahead of the local branch, gitAuto will:

1. Automatically detect the non-fast-forward rejection
2. Prompt the user for permission to resolve the conflict automatically
3. Pull the latest changes from the remote repository
4. Attempt to push again after resolving the conflict
5. If still unsuccessful, offer a safe force push option with user permission

### Implementation Details

#### Error Detection
The system detects non-fast-forward push rejections by checking for specific error messages in the Git output:
- "Updates were rejected"
- "non-fast-forward"
- "failed to push some refs"
- "remote contains work that you do not have locally"

#### User Permission Workflow
1. **Initial Detection**: When a non-fast-forward rejection is detected, the user is prompted:
   ```
   Would you like to automatically resolve this by pulling changes first? (Y/n)
   ```

2. **Automatic Resolution**: If the user agrees, gitAuto:
   - Pulls the latest changes from the remote repository
   - Attempts to push again

3. **Fallback Options**: If the push still fails after pulling:
   - The user is prompted for permission to force push:
     ```
     Would you like to force push? (⚠️ This will overwrite remote history!) (y/N)
     ```
   - If the user agrees, gitAuto performs a safe force push using `--force-with-lease`

#### Safety Measures
- All operations require explicit user permission before proceeding
- Force pushes use `--force-with-lease` instead of `--force` for safer history rewriting
- Clear warnings are displayed when potentially destructive operations are suggested
- Manual resolution instructions are provided if automatic resolution fails

### Benefits
1. **Reduced Manual Intervention**: Users no longer need to manually run `git pull` and then `git push`
2. **Improved User Experience**: Clear guidance and error analysis for each step
3. **Enhanced Safety**: All operations require user permission and use safer alternatives when available
4. **Time Savings**: Automated conflict resolution reduces the time spent on routine Git operations

### Error Handling
The system handles various error scenarios during the resolution process:
- Network connectivity issues during pull operations
- Merge conflicts that require manual resolution
- Permission errors when pushing to protected branches
- Repository not found errors
- Authentication failures

For each error scenario, users receive:
- Detailed error analysis
- Context-specific suggestions
- Step-by-step resolution guides
- Links to external resources when appropriate

### Testing
The feature has been tested with:
- Permission prompt workflows
- Error detection mechanisms
- Automatic resolution sequences
- Fallback option handling

### Future Enhancements
Potential improvements for future versions:
- Integration with Git hooks for pre-resolution validation
- Support for rebase workflows in addition to merge workflows
- Enhanced conflict detection for complex merge scenarios
- Customizable resolution strategies based on repository settings