const assert = require('assert');
const { 
  executeCommandSync, 
  executeCommandAdvanced, 
  executeCommandsBatch,
  getRepoAnalytics,
  getSmartSuggestions,
  commandExistsOptimized,
  recordPerformanceMetric,
  getPerformanceStats,
  getAllPerformanceStats
} = require('../lib/core');

// Mock execSync to avoid actual command execution during tests
const { execSync } = require('child_process');
const sinon = require('sinon');

describe('Core Functions', function() {
  describe('commandExistsOptimized', function() {
    it('should return true for existing commands', function() {
      // This test depends on the environment - node should exist
      const result = commandExistsOptimized('node');
      assert.strictEqual(result, true);
    });

    it('should return false for non-existing commands', function() {
      const result = commandExistsOptimized('nonexistentcommand12345');
      assert.strictEqual(result, false);
    });
  });

  describe('executeCommandSync', function() {
    it('should execute commands successfully', function() {
      const result = executeCommandSync('node --version', { encoding: 'utf8' });
      assert.strictEqual(typeof result, 'string');
      assert(result.includes('v'));
    });
  });

  describe('executeCommandAdvanced', function() {
    it('should execute commands and return structured results', async function() {
      const result = await executeCommandAdvanced('node --version');
      assert.strictEqual(typeof result, 'object');
      assert.strictEqual(result.success, true);
    });
  });

  describe('executeCommandsBatch', function() {
    it('should execute multiple commands in batch', async function() {
      const commands = ['node --version', 'npm --version'];
      const result = await executeCommandsBatch(commands);
      assert.strictEqual(typeof result, 'object');
      assert.strictEqual(result.success, true);
    });
  });

  describe('Performance Metrics', function() {
    it('should record and retrieve performance metrics', function() {
      recordPerformanceMetric('testFunction', 100);
      const stats = getPerformanceStats('testFunction');
      assert.strictEqual(stats.functionName, 'testFunction');
      assert.strictEqual(stats.count, 1);
      assert.strictEqual(stats.min, 100);
      assert.strictEqual(stats.max, 100);
    });

    it('should get all performance stats', function() {
      const allStats = getAllPerformanceStats();
      assert(Array.isArray(allStats));
      assert(allStats.length > 0);
    });
  });
});