const { execSync } = require('child_process');
const path = require('path');

const repoPath = path.normalize('C:\\Users\\john\\Documents\\drive ahead\\drive-ahead');
process.chdir(repoPath);

console.log('=' .repeat(60));
console.log('Applying Framer Motion Invariant Error Fix');
console.log('='.repeat(60));

try {
  // Stage
  console.log('\n[1] Staging changes...');
  execSync('git add "src\\routes\\_authenticated.tsx"', { stdio: 'inherit' });
  console.log('✓ Staged changes');

  // Commit
  console.log('\n[2] Committing changes...');
  const msg = `Fix: Resolve Framer Motion invariant error in mobile nav

The 'Invariant failed' error was caused by reusing the same layoutId 'mobile-nav-indicator' across multiple navigation items. Framer Motion requires layout animation IDs to be stable and unique.

Solution: Made each motion.div indicator have a unique layoutId (e.g., mobile-nav-indicator-Dashboard).

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`;

  execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
  console.log('✓ Committed changes');

  // Push
  console.log('\n[3] Pushing to hamisi911ltd-debug/GLORY...');
  execSync('git push origin hamisi911ltd-debug/GLORY', { stdio: 'inherit' });
  console.log('✓ Pushed to branch');

  console.log('\n' + '='.repeat(60));
  console.log('✅ SUCCESS! All changes applied and pushed');
  console.log('='.repeat(60));
  console.log('\nReady for redeployment on hamisi911ltd-debug/GLORY branch');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
