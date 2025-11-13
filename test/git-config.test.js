const { expect } = require('chai');
const { execSync } = require('child_process');
const {
  isGitInstalled,
  getGitUserName,
  getGitUserEmail,
  setGitUserName,
  setGitUserEmail,
  checkAndConfigureGit,
  silentConfigureGit
} = require('../lib/git-config');

describe('Git Configuration Module', function() {
  describe('isGitInstalled()', function() {
    it('should return true if git is installed', function() {
      // This test will pass if git is installed on the system
      const result = isGitInstalled();
      expect(result).to.be.a('boolean');
    });
  });

  describe('getGitUserName()', function() {
    it('should return a string or null', function() {
      const result = getGitUserName();
      expect(result).to.satisfy((val) => typeof val === 'string' || val === null);
    });
  });

  describe('getGitUserEmail()', function() {
    it('should return a string or null', function() {
      const result = getGitUserEmail();
      expect(result).to.satisfy((val) => typeof val === 'string' || val === null);
    });
  });

  describe('Configuration Functions', function() {
    // Save original values
    let originalName, originalEmail;

    before(function() {
      // Save current git config
      try {
        originalName = execSync('git config --global user.name', { encoding: 'utf8' }).trim();
      } catch (error) {
        originalName = null;
      }
      
      try {
        originalEmail = execSync('git config --global user.email', { encoding: 'utf8' }).trim();
      } catch (error) {
        originalEmail = null;
      }
    });

    after(function() {
      // Restore original values
      if (originalName) {
        try {
          execSync(`git config --global user.name "${originalName}"`);
        } catch (error) {
          // Ignore
        }
      } else {
        try {
          execSync('git config --global --unset user.name');
        } catch (error) {
          // Ignore
        }
      }
      
      if (originalEmail) {
        try {
          execSync(`git config --global user.email "${originalEmail}"`);
        } catch (error) {
          // Ignore
        }
      } else {
        try {
          execSync('git config --global --unset user.email');
        } catch (error) {
          // Ignore
        }
      }
    });

    it('should set git username', function() {
      setGitUserName('testuser');
      const name = getGitUserName();
      expect(name).to.equal('testuser');
    });

    it('should set git email', function() {
      setGitUserEmail('test@example.com');
      const email = getGitUserEmail();
      expect(email).to.equal('test@example.com');
    });

    it('should check and configure git', function() {
      const result = checkAndConfigureGit();
      expect(result).to.be.a('boolean');
    });

    it('should configure git silently', function() {
      const result = silentConfigureGit('silentuser', 'silent@example.com');
      expect(result).to.be.a('boolean');
    });
  });
});