# gitAuto 

A Node.js CLI tool for automating common GitHub repository management tasks.

## Overview

gitAuto is a Node.js-based automation tool designed to simplify common GitHub repository management tasks. It enables developers to interact with GitHub repositories directly from the terminal without manually navigating through the web interface.

## Features

- Create new GitHub repository
- Clone public repositories
- Push local changes to remote
- Pull updates from remote
- Manage branches (create, switch, list)
- Delete repositories (local and remote)
- Change repository visibility (private/public)
- Cross-platform compatibility (Windows, macOS, Linux)
- GitHub CLI integration with browser authentication
- Manual token authentication
- Automatic Git configuration (user name and email)
- Build script for packaging

## Prerequisites

- Node.js (version 12 or higher)
- Git
- GitHub account

## Installation

You can install gitAuto globally using npm:

```bash
npm install -g @rahilsk/gitauto
```

Or clone the repository and install locally:

```bash
git clone https://github.com/rahilsk203/gitAuto.git
cd gitAuto
npm install -g .
```

## Usage

After installation, you can use the `gitauto` command from anywhere in your terminal:

```bash
gitauto
```

On first run, the tool will:
1. Automatically configure your Git user settings (name and email)
2. Prompt you to login via one of the available authentication methods

### GitHub Authentication

gitAuto supports multiple authentication methods:

1. **GitHub CLI Integration** (Recommended):
   - Uses your existing GitHub CLI authentication
   - No need to manage separate tokens
   - Supports browser-based authentication for easy login
   - Automatically detected if GitHub CLI is installed and authenticated
   - To set up:
     1. Install GitHub CLI: https://cli.github.com/
     2. Run `gh auth login` to authenticate
     3. gitAuto will automatically use your GitHub CLI credentials

2. **Manual Token Entry**:
   - Requires a GitHub Personal Access Token
   - To generate a token:
     1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
     2. Generate a new token with `repo` permissions
     3. Copy the token and use it when prompted by gitAuto

### GitHub CLI Browser Authentication

When using GitHub CLI authentication, gitAuto offers two login methods:
1. **Browser Authentication**: Opens your default browser for GitHub authentication (recommended)
2. **Interactive Terminal Login**: Traditional terminal-based authentication flow

### Automatic Git Configuration

gitAuto automatically configures your Git user settings if they're not already set:
- User name: Defaults to your system username
- User email: Defaults to your system username@users.noreply.github.com

## Available Commands

When running `gitauto`, you'll be presented with a menu of options:

### Outside a Git Repository

- **Create Repository**: Create a new GitHub repository and clone it locally
- **Clone Public Repository**: Clone any public GitHub repository

### Inside a Git Repository

- **Push to Repository**: Add, commit, and push changes to the remote repository
- **Pull Latest Changes**: Pull the latest changes from the remote repository
- **Branch Management**: Create, list, and switch branches
- **Show Status**: Display the current git status
- **Show Commit History**: Display the commit history

### General

- **Delete Repository**: Delete a repository from GitHub and locally
- **Make Repository Private/Public**: Change repository visibility
- **Exit**: Exit the application

## Development

To contribute to gitAuto:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the application: `node index.js` or `npm start`
4. Build the application: `npm run build`
5. Create a pull request with your changes

## Build Process

gitAuto includes a build script that packages the application:

```bash
npm run build
```

This creates a `dist` directory with all necessary files for distribution.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

SKRahil