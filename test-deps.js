const dependencyChecker = require('./lib/dependency-checker');

async function test() {
  console.log('Testing dependency checker...');
  const result = await dependencyChecker.checkAndInstallDependencies();
  console.log('Dependency check result:', result);
}

test();