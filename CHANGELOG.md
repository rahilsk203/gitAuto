# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-11-12

### Added
- Automatic conflict resolution for non-fast-forward push rejections
- Interactive prompts to automatically pull changes when push is rejected
- Safe force push option with `--force-with-lease` when conflicts persist
- Enhanced error handling for 25+ Git push error scenarios
- Comprehensive documentation for the new auto-resolve feature

### Changed
- Refactored monolithic git.js file into modular components for better maintainability
- Updated README.md with detailed information about the new feature
- Improved user experience with contextual suggestions and step-by-step resolution guides
- Enhanced error messages with more specific guidance for different error types

### Fixed
- Various edge cases in error handling for Git operations
- Performance optimizations for command execution
- Memory management improvements with cache cleanup

## [1.3.1] - 2025-11-10

### Added
- Enhanced error handling for 100+ specific Git error scenarios
- Detailed troubleshooting guides for common Git issues
- Performance monitoring and metrics collection
- Caching strategies for improved response times

### Changed
- Improved error messages with more specific guidance
- Enhanced user experience with contextual suggestions

### Fixed
- Various bug fixes in Git command execution
- Performance improvements in repository analytics

## [1.3.0] - 2025-11-08

### Added
- DSA-level performance optimizations
- Caching layer for repository analytics and smart suggestions
- Parallel execution for multiple Git commands
- Batch processing for multiple repositories
- Performance monitoring and metrics collection

### Changed
- Optimized Git command execution to reduce subprocess overhead
- Improved smart suggestions with parallel execution
- Enhanced batch command processing

### Fixed
- Performance bottlenecks in repository operations
- Memory leaks in caching mechanisms

## [1.2.0] - 2025-11-05

### Added
- Modular architecture refactoring
- File splitting for better maintainability
- Enhanced error handling with user-friendly suggestions
- Comprehensive test suite

### Changed
- Refactored monolithic files into modular components
- Improved error messages with detailed guidance
- Enhanced user experience with interactive prompts

### Fixed
- Various issues in error handling
- Code organization and maintainability

## [1.1.0] - 2025-11-03

### Added
- Comprehensive error handling for 100+ error scenarios
- Detailed troubleshooting guides
- User-friendly error messages
- Interactive prompts for continuation decisions

### Changed
- Enhanced error analysis with context-specific suggestions
- Improved user experience with step-by-step resolution guides

### Fixed
- Various edge cases in error handling
- User experience issues with error messages

## [1.0.0] - 2025-11-01

### Added
- Initial release of gitAuto
- Repository management (create, clone, delete)
- Git operations (push, pull, commit, add)
- Branch management (create, list, switch)
- Analytics dashboard
- Smart suggestions based on repository state
- Interactive menu system