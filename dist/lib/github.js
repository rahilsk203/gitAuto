const axios = require('axios');
const { loadCredentials } = require('./auth');
const { executeCommandSync } = require('./core');

const GITHUB_API = 'https://api.github.com';

/**
 * Advanced GitHub API Client for gitAuto
 * Implements retry mechanisms, better error handling, and caching
 */

// Cache for API responses
const apiCache = new Map();
const cacheTimeout = 10000; // 10 seconds

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Get authenticated GitHub API client with retry support
 * @returns {Object} Axios instance configured with auth headers
 */
function getApiClientAdvanced() {
  const credentials = loadCredentials();
  if (!credentials.token) {
    throw new Error('No GitHub credentials found! Please login first.');
  }
  
  const client = axios.create({
    baseURL: GITHUB_API,
    headers: {
      'Authorization': `token ${credentials.token}`,
      'User-Agent': 'gitauto-cli-advanced'
    },
    timeout: 10000 // 10 second timeout
  });
  
  // Add retry interceptor
  client.interceptors.response.use(
    response => response,
    async error => {
      const config = error.config;
      
      if (!config || !config.retry) {
        return Promise.reject(error);
      }
      
      config.retryCount = config.retryCount || 0;
      
      if (config.retryCount >= MAX_RETRIES) {
        return Promise.reject(error);
      }
      
      config.retryCount += 1;
      
      // Exponential backoff
      const delay = RETRY_DELAY * Math.pow(2, config.retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return client(config);
    }
  );
  
  return client;
}

/**
 * Make API request with caching and retry support
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint
 * @param {Object} data - Request data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} API response
 */
async function makeApiRequest(method, url, data = null, options = {}) {
  const cacheKey = `${method}-${url}-${JSON.stringify(data)}-${JSON.stringify(options)}`;
  
  // Check cache first
  if (!options.skipCache && apiCache.has(cacheKey)) {
    const cached = apiCache.get(cacheKey);
    if (Date.now() - cached.timestamp < cacheTimeout) {
      return cached.data;
    } else {
      // Expired cache
      apiCache.delete(cacheKey);
    }
  }
  
  const client = getApiClientAdvanced();
  client.defaults.retry = true;
  
  try {
    const config = {
      method,
      url,
      ...options
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await client(config);
    
    // Cache the result
    if (!options.skipCache) {
      apiCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    
    return response.data;
  } catch (error) {
    throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Check if repository exists locally or remotely with optimized approach
 * @param {string} repoName - Name of the repository
 * @returns {Promise<Object>} Object with folderExists and remoteExists flags
 */
async function repoExistsAdvanced(repoName) {
  const fs = require('fs');
  const path = require('path');
  
  // Check local folder existence
  const folderExists = fs.existsSync(path.join(process.cwd(), repoName));
  
  // Check remote repository existence with caching
  let remoteExists = false;
  try {
    const credentials = loadCredentials();
    await makeApiRequest('GET', `/repos/${credentials.username}/${repoName}`, null, { skipCache: false });
    remoteExists = true;
  } catch (error) {
    // Repository doesn't exist or other error
    remoteExists = false;
  }
  
  if (folderExists) {
    console.log(`⚠️ Folder '${repoName}' already exists!`);
  }
  if (remoteExists) {
    console.log(`⚠️ GitHub repository '${repoName}' already exists!`);
  }
  
  return { folderExists, remoteExists };
}

/**
 * Create a new GitHub repository with advanced error handling
 * @param {string} repoName - Name of the repository
 * @param {boolean} isPrivate - Whether the repo should be private
 * @returns {Promise<boolean>} Success status
 */
async function createRepoAdvanced(repoName, isPrivate = true) {
  const { folderExists, remoteExists } = await repoExistsAdvanced(repoName);
  
  if (folderExists || remoteExists) {
    console.log('❌ Repository creation aborted!');
    return false;
  }
  
  try {
    const data = {
      name: repoName,
      private: isPrivate,
      auto_init: true // Initialize with README
    };
    
    const response = await makeApiRequest('POST', '/user/repos', data);
    
    if (response) {
      console.log(`✅ Repository '${repoName}' created successfully!`);
      return true;
    }
  } catch (error) {
    console.error('❌ Error creating repository:', error.message);
    return false;
  }
}

/**
 * Delete repository from GitHub with confirmation
 * @param {string} repoName - Name of the repository
 * @returns {Promise<boolean>} Success status
 */
async function deleteRepoAdvanced(repoName) {
  try {
    const credentials = loadCredentials();
    await makeApiRequest('DELETE', `/repos/${credentials.username}/${repoName}`);
    
    console.log(`✅ Repository '${repoName}' deleted successfully from GitHub!`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting repository:', error.message);
    return false;
  }
}

/**
 * Set repository visibility (private/public) with validation
 * @param {string} repoName - Name of the repository
 * @param {boolean} isPrivate - Whether the repo should be private
 * @returns {Promise<boolean>} Success status
 */
async function setRepoVisibilityAdvanced(repoName, isPrivate) {
  try {
    const credentials = loadCredentials();
    const data = { private: isPrivate };
    
    const response = await makeApiRequest('PATCH', `/repos/${credentials.username}/${repoName}`, data);
    
    if (response) {
      const status = isPrivate ? 'Private' : 'Public';
      console.log(`✅ Repository '${repoName}' is now ${status}!`);
      return true;
    }
  } catch (error) {
    console.error('❌ Error updating repository visibility:', error.message);
    return false;
  }
}

/**
 * Get repository clone URL with embedded credentials
 * @param {string} repoName - Name of the repository
 * @returns {string} Authenticated clone URL
 */
function getAuthCloneUrlAdvanced(repoName) {
  const credentials = loadCredentials();
  return `https://${credentials.username}:${credentials.token}@github.com/${credentials.username}/${repoName}.git`;
}

/**
 * Get user's repositories with pagination support
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Promise<Array>} Array of repositories
 */
async function getUserRepos(page = 1, perPage = 30) {
  try {
    const credentials = loadCredentials();
    const response = await makeApiRequest('GET', `/users/${credentials.username}/repos`, null, {
      params: { page, per_page: perPage }
    });
    
    return response || [];
  } catch (error) {
    console.error('❌ Error fetching repositories:', error.message);
    return [];
  }
}

/**
 * Search for repositories
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching repositories
 */
async function searchRepos(query) {
  try {
    const response = await makeApiRequest('GET', '/search/repositories', null, {
      params: { q: query }
    });
    
    return response?.items || [];
  } catch (error) {
    console.error('❌ Error searching repositories:', error.message);
    return [];
  }
}

/**
 * Clear API cache
 */
function clearApiCache() {
  apiCache.clear();
  console.log('🧹 API cache cleared');
}

// At the bottom of the file, update the module.exports to match what menu.js expects
module.exports = {
  getApiClientAdvanced,
  makeApiRequest,
  repoExistsAdvanced: repoExistsAdvanced,
  createRepo: createRepoAdvanced,
  deleteRepo: deleteRepoAdvanced,
  setRepoVisibility: setRepoVisibilityAdvanced,
  getAuthCloneUrl: getAuthCloneUrlAdvanced,
  getUserRepos,
  searchRepos,
  clearApiCache
};