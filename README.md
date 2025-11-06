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
- Automatic GitHub CLI installation
- Simple GitHub CLI authentication
- Automatic Git configuration (user name and email)

## Prerequisites

- Node.js (version 12 or higher)
- Git
- GitHub account

## Installation

Install gitAuto globally using npm:

```bash
npm install -g @rahilsk/gitauto
```

## Usage

After installation, you can use the `gitauto` command from anywhere in your terminal:

```bash
gitauto
```

On first run, the tool will:
1. Automatically check for and install required tools (Node.js, Git, GitHub CLI)
2. Automatically configure your Git user settings (name and email)
3. Run `gh auth login` for authentication

### Automatic Tool Installation

gitAuto automatically checks for and installs missing tools:
- Detects your operating system
- Installs GitHub CLI using the appropriate package manager
- Supports Windows (winget, Chocolatey), macOS (Homebrew), and Linux (APT, YUM)

### Authentication

gitAuto uses the GitHub CLI for authentication:
- Runs `gh auth login` command directly
- Uses existing GitHub CLI authentication if already logged in
- No complex authentication flows or manual token management

### Automatic Git Configuration

gitAuto automatically configures your Git user settings:
- User name: Set to your system username
- User email: Set to your_system_username@users.noreply.github.com

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
2. Run the application: `node index.js` or `npm start`
3. Create a pull request with your changes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

SKRahil 