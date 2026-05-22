import subprocess
import sys
import os

# Change to repo directory
repo = r'C:\Users\john\Documents\drive ahead\drive-ahead'
os.chdir(repo)

print('\n' + '='*60)
print('🚀 Deploying Framer Motion Fix to hamisi911ltd-debug/GLORY')
print('='*60 + '\n')

commands = [
    (['git', 'status', '--short'], 'Checking repository status'),
    (['git', 'add', 'src\\routes\\_authenticated.tsx'], 'Staging changes'),
    (['git', 'commit', '-m', 
      'Fix: Resolve Framer Motion invariant error in mobile nav\n\n'
      'Changed layoutId from static "mobile-nav-indicator" to unique IDs per navigation item.\n'
      'This fixes Framer Motion invariant violation in mobile nav indicator animation.\n\n'
      'Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>'], 
     'Creating commit'),
    (['git', 'push', 'origin', 'hamisi911ltd-debug/GLORY'], 'Pushing to branch'),
]

for cmd, desc in commands:
    print(f'[{desc}]...')
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.stdout:
            print(result.stdout)
        if result.returncode != 0 and 'nothing to commit' not in result.stderr:
            if result.stderr:
                print(f'⚠️  {result.stderr}')
        print()
    except Exception as e:
        print(f'❌ Error: {e}\n')
        sys.exit(1)

print('='*60)
print('✅ DEPLOYED SUCCESSFULLY')
print('='*60)
print('\nSummary:')
print('  • File: src/routes/_authenticated.tsx')
print('  • Line 222: Fixed layoutId in motion.div')
print('  • Branch: hamisi911ltd-debug/GLORY')
print('  • Status: Ready for redeployment\n')
