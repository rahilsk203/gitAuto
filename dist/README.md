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
- [Key Features](#key-features)
- [Why gitAuto?](#why-gitauto)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Smart Features](#smart-features)
- [Commands Reference](#commands-reference)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Author](#author)

## Overview

gitAuto is a powerful Node.js CLI tool that simplifies GitHub repository management by automating common Git and GitHub operations. Whether you're creating new repositories, managing branches, or syncing changes, gitAuto streamlines the entire workflow directly from your terminal.

## Key Features

✨ **Automation**
- One-command repository creation and cloning
- Automated Git configuration (username & email)
- Smart commit and push workflows

🔄 **Synchronization**
- Seamless push/pull operations
- Branch management (create, switch, list)
- Repository visibility control (public/private)

🛠️ **Management**
- Repository creation and deletion
- Status and history viewing
- Cross-platform compatibility

🔒 **Authentication**
- Automatic GitHub CLI integration
- Browser-based authentication
- No manual token handling

📊 **Intelligence**
- Repository analytics dashboard
- Smart suggestions based on repo state
- Context-aware recommendations

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
- **Git** (any recent version)
- **GitHub Account** (free or paid)
- **Internet Connection** for GitHub API access

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

### ⚡ Performance Optimizations

- **Caching**: Intelligent caching for faster operations
- **Parallel Operations**: Execute multiple Git commands simultaneously when possible
- **Lightweight**: Minimal dependencies and fast startup

## Commands Reference

### Outside a Git Repository

| Command | Description |
|---------|-------------|
| `1️⃣ Create Repository` | Create a new GitHub repository and clone it locally |
| `2️⃣ Analytics Dashboard` | View repository analytics |
| `5️⃣ Clone Public Repository` | Clone any public GitHub repository |
| `9️⃣ Clear Caches` | Clear all caches |
| `6️⃣ Exit` | Exit the application |

### Inside a Git Repository

| Command | Description |
|---------|-------------|
| `1️⃣ Analytics Dashboard` | View repository analytics |
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
├── LICENSE           # MIT License
├── .gitignore        # Git ignore rules
├── lib/              # Core modules
│   ├── auth.js       # Authentication logic
│   ├── git.js        # Git operations
│   ├── github.js     # GitHub API interactions
│   ├── menu.js       # Interactive menu system
│   └── core.js       # Core utilities
└── scripts/          # Build scripts
    └── build.js      # Build process
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
- Supported package managers: winget, Chocolatey (Windows), Homebrew (macOS), APT/YUM (Linux)

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