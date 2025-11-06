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

## Prerequisites

- Node.js (version 12 or higher)
- Git
- GitHub account with Personal Access Token

## Installation

You can install gitAuto globally using npm:

```bash
npm install -g gitauto
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

On first run, you'll be prompted to enter your GitHub username and Personal Access Token (PAT).

### GitHub Personal Access Token

To use gitAuto, you need a GitHub Personal Access Token with appropriate permissions:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` permissions
3. Copy the token and use it when prompted by gitAuto

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
4. Create a pull request with your changes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

SKRahil