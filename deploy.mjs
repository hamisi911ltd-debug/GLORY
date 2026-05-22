const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const repoPath = 'C:\\Users\\john\\Documents\\drive ahead\\drive-ahead';
process.chdir(repoPath);

console.log('\n' + '='.repeat(60));
console.log('🔧 Deploying Framer Motion Invariant Error Fix');
console.log('='.repeat(60) + '\n');

function run(cmd, args, desc) {
  console.log(`[${desc}]`);
  const result = spawnSync(cmd, args, { 
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  if (result.stdout) console.log(result.stdout);
  if (result.stderr && result.status !== 0) console.log('ERROR:', result.stderr);
  
  return result.status === 0;
}

try {
  // Check status
  console.log('📋 Current repository status:\n');
  run('git', ['status', '--short'], 'Status check');
  
  // Stage changes
  console.log('\n📦 Staging changes...\n');
  if (!run('git', ['add', 'src/routes/_authenticated.tsx'], 'Add')) {
    throw new Error('Failed to stage changes');
  }
  
  // Commit
  console.log('\n💾 Creating commit...\n');
  const commitMsg = `Fix: Resolve Framer Motion invariant error in mobile nav

The 'Invariant failed' error was caused by reusing the same layoutId 'mobile-nav-indicator' across multiple navigation items in the mobile bottom navigation. Framer Motion requires layout animation IDs to be stable and unique per element.

Changed: Make each navigation item's motion.div indicator have a unique layoutId based on the item label (e.g., mobile-nav-indicator-Dashboard).

This allows Framer Motion to correctly track and animate the indicator as it moves between different active links without violating layout animation invariants.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`;

  if (!run('git', ['commit', '-m', commitMsg], 'Commit')) {
    console.log('⚠️  Commit may have already been applied or no changes to commit');
  }
  
  // Push
  console.log('\n🚀 Pushing to hamisi911ltd-debug/GLORY...\n');
  if (!run('git', ['push', 'origin', 'hamisi911ltd-debug/GLORY'], 'Push')) {
    throw new Error('Failed to push to repository');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ SUCCESS - Changes deployed to hamisi911ltd-debug/GLORY');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log('  • Fixed: layoutId in mobile navigation indicator');
  console.log('  • Change: Made layout IDs unique per navigation item');
  console.log('  • Branch: hamisi911ltd-debug/GLORY');
  console.log('  • Status: Ready for redeployment\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
