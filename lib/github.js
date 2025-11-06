const axios = require('axios');
const { loadCredentials } = require('./auth');

const GITHUB_API = 'https://api.github.com';

/**
 * Get authenticated GitHub API client
 * @returns {Object} Axios instance configured with auth headers
 */
function getApiClient() {
  const credentials = loadCredentials();
  if (!credentials.token) {
    throw new Error('No GitHub credentials found! Please login first.');
  }
  
  return axios.create({
    baseURL: GITHUB_API,
    headers: {
      'Authorization': `token ${credentials.token}`,
      'User-Agent': 'gitauto-cli'
    }
  });
}

/**
 * Check if repository exists locally or remotely
 * @param {string} repoName - Name of the repository
 * @returns {Promise<Object>} Object with folderExists and remoteExists flags
 */
async function repoExists(repoName) {
  const fs = require('fs');
  const path = require('path');
  
  // Check local folder existence
  const folderExists = fs.existsSync(path.join(process.cwd(), repoName));
  
  // Check remote repository existence
  let remoteExists = false;
  try {
    const apiClient = getApiClient();
    const credentials = loadCredentials();
    await apiClient.get(`/repos/${credentials.username}/${repoName}`);
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
 * Create a new GitHub repository
 * @param {string} repoName - Name of the repository
 * @param {boolean} isPrivate - Whether the repo should be private
 * @returns {Promise<boolean>} Success status
 */
async function createRepo(repoName, isPrivate = true) {
  const { folderExists, remoteExists } = await repoExists(repoName);
  
  if (folderExists || remoteExists) {
    console.log('❌ Repository creation aborted!');
    return false;
  }
  
  try {
    const apiClient = getApiClient();
    const response = await apiClient.post('/user/repos', {
      name: repoName,
      private: isPrivate
    });
    
    if (response.status === 201) {
      console.log(`✅ Repository '${repoName}' created successfully!`);
      return true;
    }
  } catch (error) {
    console.error('❌ Error creating repository:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Delete repository from GitHub
 * @param {string} repoName - Name of the repository
 * @returns {Promise<boolean>} Success status
 */
async function deleteRepo(repoName) {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.delete(`/repos/${loadCredentials().username}/${repoName}`);
    
    if (response.status === 204) {
      console.log(`✅ Repository '${repoName}' deleted successfully from GitHub!`);
      return true;
    }
  } catch (error) {
    console.error('❌ Error deleting repository:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Set repository visibility (private/public)
 * @param {string} repoName - Name of the repository
 * @param {boolean} isPrivate - Whether the repo should be private
 * @returns {Promise<boolean>} Success status
 */
async function setRepoVisibility(repoName, isPrivate) {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.patch(`/repos/${loadCredentials().username}/${repoName}`, {
      private: isPrivate
    });
    
    if (response.status === 200) {
      const status = isPrivate ? 'Private' : 'Public';
      console.log(`✅ Repository '${repoName}' is now ${status}!`);
      return true;
    }
  } catch (error) {
    console.error('❌ Error updating repository visibility:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Get repository clone URL with embedded credentials
 * @param {string} repoName - Name of the repository
 * @returns {string} Authenticated clone URL
 */
function getAuthCloneUrl(repoName) {
  const credentials = loadCredentials();
  return `https://${credentials.username}:${credentials.token}@github.com/${credentials.username}/${repoName}.git`;
}

module.exports = {
  getApiClient,
  repoExists,
  createRepo,
  deleteRepo,
  setRepoVisibility,
  getAuthCloneUrl
};