# gitAuto

A Node.js CLI tool that makes GitHub repository management easy.

[![NPM Version](https://img.shields.io/npm/v/@rahilsk/gitauto)](https://www.npmjs.com/package/@rahilsk/gitauto)
[![License](https://img.shields.io/npm/l/@rahilsk/gitauto)](LICENSE)

## 🚀 Quick Start

```bash
# Install globally
npm install -g @rahilsk/gitauto

# Run anywhere in your terminal
gitauto
```

## 🔧 Automatic Git Configuration

gitAuto now automatically checks and configures your Git settings before running any commands. If your Git username or email isn't configured, it will prompt you to enter them:

```bash
? Enter your Git username: your-username
? Enter your Git email: your-email@example.com
```

This works across all platforms including Windows, macOS, Linux, and Termux (Android).

## What is gitAuto?

If you've ever felt overwhelmed by Git commands or found yourself repeating the same GitHub tasks over and over, gitAuto is for you. It's a simple command-line tool that takes care of the tedious parts of working with Git and GitHub.

Instead of remembering complex commands like `git push origin main` or `git checkout -b feature-branch`, you just run `gitauto` and follow the menu prompts. It handles authentication, repository creation, branch management, and more - all without you needing to remember any commands.

## Why Use gitAuto?

Let's be honest - working with Git can be frustrating:

- Creating a new repository means going to GitHub.com, creating it there, then cloning it locally
- Remembering the right commands for different situations
- Dealing with authentication tokens
- Handling merge conflicts and errors

gitAuto simplifies all of this:

✅ Create repositories with a single menu option  
✅ Automatic authentication through GitHub CLI  
✅ Smart suggestions based on your repository's current state  
✅ Clear error messages that actually help you fix problems  
✅ Works on Windows, Mac, Linux, and even Android (Termux)

## 📋 What Can It Do?

Here's what you can do with gitAuto:

### Repository Management
- Create new GitHub repositories automatically
- Clone existing repositories
- Delete repositories (carefully!)

### Daily Git Tasks
- Push your changes with one click
- Pull the latest updates
- View your commit history
- Check repository status

### Smart Features
- **Analytics Dashboard**: See commit counts, branch info, and contributor stats
- **Smart Suggestions**: Get helpful tips like "You have uncommitted changes" or "Your branch is behind remote"
- **Automatic Conflict Resolution**: Handles those annoying "non-fast-forward" errors automatically
- **Smart Error Resolver**: Automatically detects and fixes common Git issues
- **Automatic Git Configuration**: Checks and configures your Git username and email automatically

### Advanced Features
- Work with multiple repositories at once
- Monitor performance and execution times
- Handle over 100 different error scenarios gracefully
- DSA-level optimizations for faster performance

## 🛠️ Installation

### Easy Way (Recommended)

```bash
# Install globally so you can use it anywhere
npm install -g @rahilsk/gitauto

# Check if it worked
gitauto --version
```

### From Source (For Developers)

```bash
# Get the code
git clone https://github.com/rahilsk203/gitAuto.git
cd gitAuto

# Install dependencies
npm install

# Run it
node index.js
```

## 🎯 Getting Started

### First Time Setup

When you first run `gitauto`, it will:

1. Check if you have Git and GitHub CLI installed (installs them if missing)
2. Check and configure your Git username and email (prompts you if missing)
3. Log you into GitHub through your browser
4. Show you a menu of options

That's it! No manual configuration needed.

### Using gitAuto

Just run `gitauto` from any directory:

```bash
gitauto
```

The tool will automatically show you different options depending on whether you're in a Git repository or not.

**In a Git repository**: You'll see options for pushing, pulling, viewing status, etc.

**Outside a Git repository**: You'll see options for creating or cloning repositories.

## 🧠 Smart Error Resolver

gitAuto now includes an intelligent error resolver that automatically detects and fixes common Git issues:

### What it can fix:
- Git index lock issues
- Repository initialization problems
- Permission errors
- Large file handling
- Corrupted Git index
- Merge conflicts
- Branch configuration issues
- Authentication problems
- Network connectivity issues
- Git configuration errors
- Remote repository issues
- Disk space problems

### How it works:
When gitAuto encounters an error during any Git operation, it automatically analyzes the error message and attempts to resolve it. If a fix is available, it applies the fix and retries the operation. If not, it falls back to detailed error explanations and suggestions.

This feature makes gitAuto much more resilient and user-friendly, especially for beginners who might encounter common Git issues.

## 📱 Android Support (Termux)

Yes, gitAuto works on Android! Install it in Termux:

```bash
# Install Node.js in Termux
pkg install nodejs -y

# Install gitAuto
npm install -g @rahilsk/gitauto

# Run it
gitauto
```

It will automatically handle installing Git and GitHub CLI through Termux's package manager.

## 🤔 Common Questions

### Do I need to know Git commands?

Not really! gitAuto handles the complex Git commands for you. However, understanding basic Git concepts (commits, branches, pushing/pulling) will help you use it more effectively.

### Is my code safe?

Yes. gitAuto only automates standard Git operations. It doesn't delete your code or make changes without asking first. When potentially destructive operations are needed (like force pushing), it asks for your permission.

### What if something goes wrong?

gitAuto has built-in error handling for over 100 common Git scenarios. When errors occur, it explains what went wrong in plain English and suggests how to fix it.

### Does it work offline?

You need an internet connection for GitHub operations (creating repositories, pushing, pulling), but you can still view local repository information and status offline.

## 🧪 Development

Want to contribute or modify gitAuto?

### Setting Up

```bash
# Get the code
git clone https://github.com/rahilsk203/gitAuto.git
cd gitAuto

# Install dependencies
npm install

# Run it
node index.js
```

### Project Structure

```
gitAuto/
├── index.js          # Main entry point
├── package.json      # Project info and dependencies
├── README.md         # This file
├── lib/              # Core functionality
│   ├── auth.js       # GitHub authentication
│   ├── git.js        # Git command handling
│   ├── github.js     # GitHub API interactions
│   ├── menu.js       # Interactive menus
│   └── core.js       # Shared utilities
├── test/             # Automated tests
└── scripts/          # Build tools
```

## 🆘 Troubleshooting

### Common Issues

**"GitHub CLI not found"**: gitAuto will try to install it automatically. If that fails, install it manually from https://cli.github.com/

**"Authentication failed"**: Make sure you can access GitHub in your browser, then run `gh auth login`

**"Permission denied"**: On Windows, try running your terminal as Administrator

**"Slow performance"**: Check your internet connection or try clearing caches through the menu

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**SKRahil**  
Full-Stack Developer & AI Enthusiast

- GitHub: [@rahilsk203](https://github.com/rahilsk203)
- Email: rahilsk203@gmail.com