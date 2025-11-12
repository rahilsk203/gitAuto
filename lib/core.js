const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Core utilities for gitAuto
 * Provides common functions used across modules
 * Implements DSA-level optimizations for performance
 */

// Cache for analytics data
const analyticsCache = new Map();
const analyticsCacheTimeout = 30000; // 30 seconds

// Cache for smart suggestions
const suggestionsCache = new Map();
const suggestionsCacheTimeout = 10000; // 10 seconds

// Performance monitoring
const performanceMetrics = new Map();

/**
 * Record performance metrics for a function
 * @param {string} functionName - Name of the function
 * @param {number} executionTime - Execution time in milliseconds
 */
function recordPerformanceMetric(functionName, executionTime) {
  if (!performanceMetrics.has(functionName)) {
    performanceMetrics.set(functionName, []);
  }
  
  const metrics = performanceMetrics.get(functionName);
  metrics.push(executionTime);
  
  // Keep only the last 100 measurements to prevent memory issues
  if (metrics.length > 100) {
    metrics.shift();
  }
}

/**
 * Get performance statistics for a function
 * @param {string} functionName - Name of the function
 * @returns {Object} Statistics object
 */
function getPerformanceStats(functionName) {
  if (!performanceMetrics.has(functionName)) {
    return null;
  }
  
  const metrics = performanceMetrics.get(functionName);
  const count = metrics.length;
  const sum = metrics.reduce((a, b) => a + b, 0);
  const avg = sum / count;
  const min = Math.min(...metrics);
  const max = Math.max(...metrics);
  
  return {
    functionName,
    count,
    average: avg.toFixed(2),
    min,
    max,
    total: sum
  };
}

/**
 * Get all performance statistics
 * @returns {Array} Array of statistics objects
 */
function getAllPerformanceStats() {
  const stats = [];
  for (const [functionName] of performanceMetrics) {
    stats.push(getPerformanceStats(functionName));
  }
  return stats;
}

/**
 * Clear performance metrics
 */
function clearPerformanceMetrics() {
  performanceMetrics.clear();
  console.log('🧹 Performance metrics cleared');
}

/**
 * Lightweight function to check if a command exists
 * @param {string} cmd - Command to check
 * @returns {boolean} True if command exists
 */
function commandExistsOptimized(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute a command synchronously
 * @param {string} command - Command to execute
 * @param {Object} options - Execution options
 * @returns {string|Buffer} Command output
 */
function executeCommandSync(command, options = {}) {
  try {
    return execSync(command, options);
  } catch (error) {
    if (!options.ignoreErrors) {
      throw error;
    }
    return error;
  }
}

/**
 * Execute a command with advanced options
 * @param {string} command - Command to execute
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} Result object
 */
async function executeCommandAdvanced(command, options = {}) {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    try {
      // For capturing output, we need to use 'pipe' instead of 'inherit'
      const execOptions = {
        stdio: options.silent ? 'pipe' : (options.captureOutput ? 'pipe' : 'inherit'),
        cwd: options.cwd || process.cwd(),
        ...options
      };
      
      const result = execSync(command, execOptions);
      
      const executionTime = Date.now() - startTime;
      recordPerformanceMetric('executeCommandAdvanced', executionTime);
      
      resolve({
        success: true,
        stdout: result ? result.toString() : '',
        stderr: ''
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      recordPerformanceMetric('executeCommandAdvanced', executionTime);
      
      resolve({
        success: false,
        stdout: error.stdout ? error.stdout.toString() : '',
        stderr: error.stderr ? error.stderr.toString() : error.message
      });
    }
  });
}

/**
 * Execute multiple commands with a single subprocess call to reduce overhead
 * @param {Array} commands - Array of commands to execute
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} Result object
 */
async function executeCommandsBatch(commands, options = {}) {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    try {
      // Join commands with && to execute them in sequence in a single subprocess
      const batchCommand = commands.join(' && ');
      
      // For capturing output, we need to use 'pipe' instead of 'inherit'
      const execOptions = {
        stdio: options.silent ? 'pipe' : (options.captureOutput ? 'pipe' : 'inherit'),
        cwd: options.cwd || process.cwd(),
        ...options
      };
      
      const { execSync } = require('child_process');
      const result = execSync(batchCommand, execOptions);
      
      const executionTime = Date.now() - startTime;
      recordPerformanceMetric('executeCommandsBatch', executionTime);
      
      resolve({
        success: true,
        stdout: result ? result.toString() : '',
        stderr: ''
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      recordPerformanceMetric('executeCommandsBatch', executionTime);
      
      resolve({
        success: false,
        stdout: error.stdout ? error.stdout.toString() : '',
        stderr: error.stderr ? error.stderr.toString() : error.message
      });
    }
  });
}

/**
 * Get repository analytics with caching to avoid repeated expensive operations
 * @returns {Promise<Object>} Analytics data
 */
async function getRepoAnalytics() {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cacheKey = process.cwd();
    if (analyticsCache.has(cacheKey)) {
      const cached = analyticsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < analyticsCacheTimeout) {
        return cached.data;
      } else {
        // Expired cache
        analyticsCache.delete(cacheKey);
      }
    }
    
    // Get commit count
    let commitCount = 0;
    try {
      const commitOutput = execSync('git rev-list --count HEAD', { encoding: 'utf8', stdio: 'pipe' });
      commitCount = parseInt(commitOutput.trim()) || 0;
    } catch (error) {
      // Ignore errors
    }
    
    // Get branch count
    let branchCount = 0;
    try {
      const branchOutput = execSync('git branch', { encoding: 'utf8', stdio: 'pipe' });
      branchCount = branchOutput.split('\n').filter(line => line.trim() !== '').length;
    } catch (error) {
      // Ignore errors
    }
    
    // Get file count
    let fileCount = 0;
    try {
      const fileOutput = execSync('git ls-files', { encoding: 'utf8', stdio: 'pipe' });
      fileCount = fileOutput.split('\n').filter(line => line.trim() !== '').length;
    } catch (error) {
      // Ignore errors
    }
    
    // Get contributor count
    let contributorCount = 0;
    try {
      const contributorOutput = execSync('git shortlog -sn', { encoding: 'utf8', stdio: 'pipe' });
      contributorCount = contributorOutput.split('\n').filter(line => line.trim() !== '').length;
    } catch (error) {
      // Ignore errors
    }
    
    const result = {
      commitCount,
      branchCount,
      fileCount,
      contributorCount
    };
    
    // Cache the result
    analyticsCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    const executionTime = Date.now() - startTime;
    recordPerformanceMetric('getRepoAnalytics', executionTime);
    
    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    recordPerformanceMetric('getRepoAnalytics', executionTime);
    
    return {
      commitCount: 0,
      branchCount: 0,
      fileCount: 0,
      contributorCount: 0
    };
  }
}

/**
 * Clear analytics cache
 */
function clearAnalyticsCache() {
  analyticsCache.clear();
  console.log('🧹 Analytics cache cleared');
}

/**
 * Get smart suggestions based on repository state with caching and parallel execution
 * @returns {Promise<Array>} Array of suggestions
 */
async function getSmartSuggestions() {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cacheKey = process.cwd();
    if (suggestionsCache.has(cacheKey)) {
      const cached = suggestionsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < suggestionsCacheTimeout) {
        const executionTime = Date.now() - startTime;
        recordPerformanceMetric('getSmartSuggestions', executionTime);
        return cached.data;
      } else {
        // Expired cache
        suggestionsCache.delete(cacheKey);
      }
    }
    
    const suggestions = [];
    
    // Execute all checks in parallel for better performance
    const [statusResult, aheadResult, behindResult] = await Promise.allSettled([
      new Promise((resolve) => {
        try {
          const statusOutput = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' });
          resolve(statusOutput.trim() !== '' ? statusOutput : null);
        } catch (error) {
          resolve(null);
        }
      }),
      new Promise((resolve) => {
        try {
          const aheadOutput = execSync('git rev-list --count HEAD..@{u}', { encoding: 'utf8', stdio: 'pipe' });
          const aheadCount = parseInt(aheadOutput.trim());
          resolve(aheadCount > 0 ? aheadCount : null);
        } catch (error) {
          resolve(null);
        }
      }),
      new Promise((resolve) => {
        try {
          const behindOutput = execSync('git rev-list --count @{u}..HEAD', { encoding: 'utf8', stdio: 'pipe' });
          const behindCount = parseInt(behindOutput.trim());
          resolve(behindCount > 0 ? behindCount : null);
        } catch (error) {
          resolve(null);
        }
      })
    ]);
    
    // Process results
    if (statusResult.status === 'fulfilled' && statusResult.value) {
      suggestions.push({
        type: 'commit',
        message: 'You have uncommitted changes. Consider committing them.',
        priority: 1
      });
    }
    
    if (aheadResult.status === 'fulfilled' && aheadResult.value) {
      suggestions.push({
        type: 'push',
        message: `Your branch is ${aheadResult.value} commit(s) ahead of remote. Consider pushing your changes.`,
        priority: 2
      });
    }
    
    if (behindResult.status === 'fulfilled' && behindResult.value) {
      suggestions.push({
        type: 'pull',
        message: `Your branch is ${behindResult.value} commit(s) behind remote. Consider pulling the latest changes.`,
        priority: 3
      });
    }
    
    // Sort by priority
    suggestions.sort((a, b) => a.priority - b.priority);
    
    // Cache the result
    suggestionsCache.set(cacheKey, {
      data: suggestions,
      timestamp: Date.now()
    });
    
    const executionTime = Date.now() - startTime;
    recordPerformanceMetric('getSmartSuggestions', executionTime);
    
    return suggestions;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    recordPerformanceMetric('getSmartSuggestions', executionTime);
    
    // Return empty array on error
    return [];
  }
}

/**
 * Clear suggestions cache
 */
function clearSuggestionsCache() {
  suggestionsCache.clear();
  console.log('🧹 Suggestions cache cleared');
}

/**
 * Clear all caches
 */
function clearCaches() {
  clearAnalyticsCache();
  clearSuggestionsCache();
  clearPerformanceMetrics();
  console.log('🧹 All caches cleared');
}

module.exports = {
  commandExistsOptimized,
  executeCommandSync,
  executeCommandAdvanced,
  executeCommandsBatch,
  getRepoAnalytics,
  clearAnalyticsCache,
  getSmartSuggestions,
  clearSuggestionsCache,
  clearCaches,
  recordPerformanceMetric,
  getPerformanceStats,
  getAllPerformanceStats,
  clearPerformanceMetrics
};