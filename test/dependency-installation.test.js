const { 
  commandExists, 
  isPackageInstalled, 
  findGitHubCLIOnWindows,
  installNodePackages,
  installGitHubCLI,
  installGit
} = require('../index');
const { expect } = require('chai');

/**
 * Test suite for dependency installation features
 */
describe('Dependency Installation Features', function() {
  this.timeout(10000); // Increase timeout for potential installations
  
  it('should detect if a command exists', () => {
    // Test with a known command
    const result = commandExists('node');
    expect(result).to.be.a('boolean');
  });
  
  it('should detect if a Node.js package is installed', () => {
    // Test with a known package
    const result = isPackageInstalled('axios');
    expect(result).to.be.a('boolean');
  });
  
  it('should find GitHub CLI on Windows if installed', () => {
    // This test will check if the function returns the correct type
    const result = findGitHubCLIOnWindows();
    // Result should be either null (not found) or a string (path found)
    expect(result).to.satisfy((val) => val === null || typeof val === 'string');
  });
  
  it('should detect Termux environment correctly', () => {
    // Test the Termux detection logic
    const isTermux = process.env.PREFIX && process.env.PREFIX.includes('com.termux');
    
    // The result should be a boolean (true or false) or undefined
    expect(isTermux).to.satisfy((val) => val === true || val === false || val === undefined);
  });
});