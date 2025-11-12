# gitAuto

A Node.js CLI tool for automating common GitHub repository management tasks.

[![NPM Version](https://img.shields.io/npm/v/@rahilsk/gitauto)](https://www.npmjs.com/package/@rahilsk/gitauto)
[![License](https://img.shields.io/npm/l/@rahilsk/gitauto)](LICENSE)

## 🚀 Quick Start

```bash
# Install globally
npm install -g @rahilsk/gitauto

# Run anywhere in your terminal
gitauto
```

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Why gitAuto?](#why-gitauto)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Automatic Dependency Installation](#automatic-dependency-installation)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Smart Features](#smart-features)
- [Performance Optimizations](#performance-optimizations)
- [Intelligent Error Handling](#intelligent-error-handling)
- [Enhanced Error Handling](#enhanced-error-handling)
- [Automatic Conflict Resolution](#automatic-conflict-resolution)
- [Modular Architecture](#modular-architecture)
- [Commands Reference](#commands-reference)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Author](#author)

## Overview

gitAuto is a powerful Node.js CLI tool that simplifies GitHub repository management by automating common Git and GitHub operations. Whether you're creating new repositories, managing branches, or syncing changes, gitAuto streamlines the entire workflow directly from your terminal.

## Features

- **Repository Management**: Create, clone, and delete repositories
- **Automated Git Operations**: Push, pull, and sync with a single command
- **Smart Suggestions**: Get intelligent recommendations based on your repository state
- **Performance Optimizations**: DSA-level optimizations for faster execution
- **Batch Operations**: Process multiple repositories simultaneously
- **Analytics Dashboard**: View repository statistics and metrics
- **Performance Monitoring**: Track execution times and optimize workflows
- **Enhanced Error Handling**: 100+ specific error scenarios with detailed guidance
- **Automatic Conflict Resolution**: Automatically resolve non-fast-forward push rejections
- **Cross-Platform Dependency Management**: Automatic installation of required tools on all systems
- **Termux Support**: Full support for Android Termux environment

## Why gitAuto?

Traditional Git workflows often involve multiple manual steps:
1. Manually creating repositories on GitHub
2. Setting up local repositories
3. Configuring Git credentials
4. Managing branches through complex commands
5. Remembering various Git commands

gitAuto eliminates these pain points by:
- Automating repository setup and configuration
- Providing an intuitive menu-driven interface
- Offering smart suggestions based on your repository state
- Handling authentication seamlessly
- Reducing repetitive tasks to single commands

## Prerequisites

- **Node.js** v12 or higher
- **Internet Connection** for GitHub API access

> Note: Git and GitHub CLI will be automatically installed if missing

## Installation

### Using npm (Recommended)

```bash
# Install globally
npm install -g @rahilsk/gitauto

# Verify installation
gitauto --version
```

### From Source

```bash
# Clone the repository
git clone https://github.com/rahilsk203/gitAuto.git
cd gitAuto

# Install dependencies
npm install

# Run directly
node index.js
```

## Automatic Dependency Installation

gitAuto now includes intelligent automatic dependency installation that works across all platforms:

### What Gets Installed Automatically

1. **Git** - Version control system
2. **GitHub CLI** - GitHub command-line interface
3. **Node.js packages** - All required npm dependencies (axios, inquirer)

### Platform Support

- **Windows** - Supports winget, Chocolatey, and direct download
- **macOS** - Supports Homebrew and direct download
- **Linux** - Supports APT, YUM, Pacman, and direct download
- **Termux** - Supports pkg package manager for Android

### How It Works

When you run `gitauto`, the tool automatically:
1. Checks for required dependencies
2. Installs any missing tools using the best available package manager
3. Configures PATH variables when necessary
4. Installs Node.js packages if missing
5. Sets up Git user configuration automatically

This ensures gitAuto works out-of-the-box on any system without manual dependency management.

### Termux Support

gitAuto has full support for Termux on Android devices:

1. **Installation in Termux**:
   ```bash
   # Install Node.js in Termux
   pkg install nodejs -y
   
   # Install gitAuto
   npm install -g @rahilsk/gitauto
   
   # Run gitAuto
   gitauto
   ```

2. **Automatic Dependency Management**:
   - Git installation via `pkg install git`
   - GitHub CLI installation via `pkg install gh`
   - Automatic PATH configuration

3. **Benefits**:
   - Full Git and GitHub functionality on Android
   - No root required
   - Works with all gitAuto features
   - Same user experience as desktop platforms

## Getting Started

### First Run Experience

When you run `gitauto` for the first time, the tool will:

1. **Check System Requirements**
   - Verify Node.js, Git, and GitHub CLI installation
   - Automatically install missing tools when possible

2. **Configure Git Settings**
   - Set username to your system username
   - Set email to `username@users.noreply.github.com`

3. **Authenticate with GitHub**
   - Automatically initiate GitHub CLI authentication
   - Open browser for seamless login

4. **Present Main Menu**
   - Show context-aware options based on current directory

### Authentication

gitAuto uses GitHub CLI for secure authentication:
- No need to manually manage personal access tokens
- Browser-based authentication for security
- Automatic token management through GitHub CLI
- Reuses existing authentication if already logged in

## Usage Guide

### Basic Usage

```bash
# Run from any directory
gitauto
```

### Context-Aware Interface

gitAuto automatically adapts its interface based on your current location:

**In a Git Repository Directory:**
- Repository-specific operations (push, pull, branch management)
- Status and history viewing
- Analytics dashboard

**Outside a Git Repository:**
- Repository creation
- Cloning existing repositories
- General operations

### Smart Workflow

1. **Repository Creation**
   ```bash
   gitauto
   # Select "Create Repository"
   # Enter name and privacy settings
   # Repository is created and cloned automatically
   ```

2. **Daily Development**
   ```bash
   cd your-repo
   gitauto
   # View smart suggestions
   # Commit and push changes
   # Manage branches
   ```

## Smart Features

### 📊 Repository Analytics Dashboard

Get insights into your repository:
- **Commit Count**: Total commits in the repository
- **Branch Count**: Number of local branches
- **File Count**: Total tracked files
- **Contributor Count**: Number of contributors

### 💡 Smart Suggestions

Context-aware recommendations based on repository state:
- **Uncommitted Changes**: "You have uncommitted changes. Consider committing them."
- **Ahead of Remote**: "Your branch is X commit(s) ahead of remote. Consider pushing your changes."
- **Behind Remote**: "Your branch is X commit(s) behind remote. Consider pulling the latest changes."

## Performance Optimizations

gitAuto implements several DSA-level optimizations to ensure maximum performance:

### ⚡ Caching Strategies
- **Analytics Caching**: Repository analytics are cached for 30 seconds to avoid repeated expensive Git operations
- **Suggestions Caching**: Smart suggestions are cached for 10 seconds for faster response times
- **API Response Caching**: GitHub API responses are cached with intelligent expiration

### 🚀 Parallel Execution
- **Concurrent Git Operations**: Multiple Git commands are executed in parallel when possible
- **Batch Command Processing**: Related commands are combined to reduce subprocess overhead
- **Multi-Repository Operations**: Perform the same operation across multiple repositories simultaneously

### 📈 Performance Monitoring
- **Execution Time Tracking**: All operations are monitored for performance metrics
- **Performance Dashboard**: View detailed performance statistics for all operations
- **Resource Optimization**: Continuous optimization based on performance data

### 🧠 Intelligent Algorithms
- **Efficient Data Structures**: Uses Maps for O(1) cache lookups
- **Lazy Loading**: Data is only fetched when needed
- **Memory Management**: Automatic cache cleanup to prevent memory leaks

## Intelligent Error Handling

gitAuto provides enhanced error handling with user-friendly guidance:

### 🎯 Context-Aware Error Messages
- Clear, descriptive error messages instead of cryptic failures
- Specific guidance based on the type of error encountered
- Detailed information to help with troubleshooting

### 💡 Smart Suggestions
- **Add Failures**: Guidance on checking file status and .gitignore configuration
- **Commit Failures**: Suggestions for staging changes and valid commit messages
- **Push Failures**: Help with permissions, network issues, and authentication
- **Pull Failures**: Conflict resolution steps and repository access troubleshooting
- **General Issues**: Internet connectivity checks and GitHub status monitoring

### 🤝 Interactive User Prompts
- When operations fail, users are prompted to continue or cancel
- Decision points allow users to choose their preferred course of action
- Guidance is provided at each step to help resolve issues

### 🔧 Detailed Troubleshooting
- Specific error details when available (stderr output)
- Step-by-step resolution instructions
- External resource links (GitHub status page)

## Enhanced Error Handling

gitAuto now includes comprehensive error handling for over 100 specific error scenarios with detailed user guidance:

### Git Add Errors (10+ scenarios)
- Not a Git repository
- Permission denied
- Git index lock issues
- Pathspec mismatches
- Large file size issues
- Invalid path characters
- Hook execution failures
- Disk space issues
- Corrupted index
- Encoding issues

### Git Commit Errors (10+ scenarios)
- Nothing to commit
- Empty commit message
- Git user identity not set
- Reference locking issues
- Invalid commit message format
- Hook execution failures
- Large diff sizes
- Merge conflicts during commit
- File mode changes only
- Corrupted object database
- GPG signing issues
- Bad object references

### Git Push Errors (25+ scenarios)
- Permission denied
- Updates rejected (non-fast-forward)
- No upstream branch
- Network connectivity issues
- Repository not found
- Authentication failures
- Protected branch rules
- SSH key issues
- Large file push rejections
- Timeout issues
- Remote ref not found
- Remote end hung up
- RPC failed
- Broken pipe
- Pack objects died
- Email privacy restrictions
- Rebase in progress
- Shallow update issues
- Unqualified destination
- Remote unpack failed
- Early EOF
- Object file empty
- History rewrite issues
- Failed to push after amend/reset/rebase
- Src refspec does not match any

For each error scenario, gitAuto provides:
- Detailed error analysis
- Context-specific suggestions
- Step-by-step resolution guides
- Interactive prompts for continuation decisions

## Automatic Conflict Resolution

gitAuto now includes automatic conflict resolution for non-fast-forward push rejections:

When you encounter a non-fast-forward push rejection, gitAuto will:
1. Automatically detect the conflict
2. Prompt you to automatically resolve by pulling changes first
3. Pull the latest changes from the remote repository
4. Attempt to push again after resolving the conflict
5. If still unsuccessful, offer a safe force push option (`--force-with-lease`) with your permission

This feature eliminates the need to manually run `git pull` and then `git push`, streamlining your workflow and reducing the chance of errors.

## Modular Architecture

gitAuto has been refactored into a modular architecture for better maintainability:

```
lib/
├── git.js                    # Main git module exporting all operations
├── git-operations/          # Individual git operation modules
│   ├── add-commit.js        # Add and commit operations
│   ├── batch.js             # Batch processing operations
│   ├── branch.js            # Branch management operations
│   ├── clone-repo.js        # Clone and repository operations
│   ├── pull.js              # Pull operations with error handling
│   ├── push.js              # Push operations with error handling
│   ├── status-history.js    # Status and history operations
├── auth.js                  # Authentication handling
├── core.js                  # Core utilities and command execution
├── menu.js                  # Interactive menu system
```

## Commands Reference

### Outside a Git Repository

| Command | Description |
|---------|-------------|
| `1️⃣ Create Repository` | Create a new GitHub repository and clone it locally |
| `2️⃣ Analytics Dashboard` | View repository analytics |
| `3️⃣ Batch Repository Operations` | Perform operations on multiple repositories |
| `4️⃣ Performance Monitoring` | View performance metrics and statistics |
| `5️⃣ Clone Public Repository` | Clone any public GitHub repository |
| `9️⃣ Clear Caches` | Clear all caches |
| `6️⃣ Exit` | Exit the application |

### Inside a Git Repository

| Command | Description |
|---------|-------------|
| `1️⃣ Analytics Dashboard` | View repository analytics |
| `2️⃣ Batch Repository Operations` | Perform operations on multiple repositories |
| `3️⃣ Performance Monitoring` | View performance metrics and statistics |
| `4️⃣ Push to Repository` | Add, commit, and push changes to the remote repository |
| `7️⃣ Pull Latest Changes` | Pull the latest changes from the remote repository |
| `8️⃣ Branch Management` | Create, list, and switch branches |
| `9️⃣ Show Status` | Display the current git status |
| `0️⃣ Show Commit History` | Display the commit history |
| `9️⃣ Clear Caches` | Clear all caches |
| `6️⃣ Exit` | Exit the application |

### Branch Management Submenu

| Command | Description |
|---------|-------------|
| `a) Create new branch` | Create and switch to a new branch |
| `b) List branches` | Show all local branches |
| `c) Switch branch` | Switch to an existing branch |
| `Back to main menu` | Return to main menu |

## Development

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/rahilsk203/gitAuto.git
cd gitAuto

# Install dependencies
npm install

# Run in development mode
npm start
```

### Project Structure

```
gitAuto/
├── index.js          # Main entry point
├── package.json      # Project metadata and dependencies
├── README.md         # Documentation
├── CHANGELOG.md      # Version history
├── FEATURES.md       # Detailed feature documentation
├── LICENSE           # MIT License
├── .gitignore        # Git ignore rules
├── lib/              # Core modules
│   ├── auth.js       # Authentication logic
│   ├── core.js       # Core utilities and performance optimizations
│   ├── git.js        # Main git operations module
│   ├── github.js     # GitHub API interactions
│   ├── menu.js       # Interactive menu system
│   └── git-operations/ # Individual git operation modules
│       ├── add-commit.js
│       ├── batch.js
│       ├── branch.js
│       ├── clone-repo.js
│       ├── pull.js
│       ├── push.js
│       └── status-history.js
├── scripts/          # Build and utility scripts
│   └── build.js      # Build process
└── test/             # Test files
    ├── *.test.js     # Unit and integration tests
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Building the Project

```bash
# Run the build script
npm run build
```

## Troubleshooting

### Common Issues

**GitHub CLI Not Found**
- Solution: gitAuto will automatically install GitHub CLI
- Supported package managers: winget, Chocolatey (Windows), Homebrew (macOS), APT/YUM (Linux), pkg (Termux)

**Authentication Failures**
- Solution: Ensure you can access GitHub in your browser
- Run `gh auth status` to check authentication status

**Permission Errors**
- Solution: Ensure you have write permissions in the current directory
- On Windows, try running as Administrator if needed

**Slow Performance**
- Solution: Check internet connection
- Clear caches using the "Clear Caches" option

### Getting Help

If you encounter issues:
1. Check the error message for specific details
2. Ensure all [prerequisites](#prerequisites) are met
3. Try clearing caches through the menu
4. Report issues on GitHub with detailed information

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**SKRahil**
- Full-Stack Developer & AI Enthusiast
- GitHub: [@rahilsk203](https://github.com/rahilsk203)
- Email: rahilsk203@gmail.com