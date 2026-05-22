#!/usr/bin/env python3
"""Commit and push the invariant error fix"""
import subprocess
import sys

def run_cmd(cmd, description):
    """Run a shell command and return success status"""
    print(f"\n{description}...")
    result = subprocess.run(cmd, shell=True, cwd=r'C:\Users\john\Documents\drive ahead\drive-ahead', 
                          capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print("Stderr:", result.stderr)
    return result.returncode == 0

# Stage the file
if not run_cmd('git add "src\\routes\\_authenticated.tsx"', "Staging changes"):
    print("Failed to stage changes")
    sys.exit(1)

# Create commit message
commit_msg = """Fix: Resolve Framer Motion invariant error in mobile nav

The 'Invariant failed' error was caused by reusing the same layoutId 'mobile-nav-indicator' across multiple navigation items. Framer Motion requires layout animation IDs to be stable and unique.

Solution: Made each motion.div indicator have a unique layoutId (e.g., mobile-nav-indicator-Dashboard).

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"""

# Save message to file to avoid escaping issues
with open(r'C:\Users\john\Documents\drive ahead\drive-ahead\.commit_msg.txt', 'w') as f:
    f.write(commit_msg)

# Commit
if not run_cmd('git commit -F ".commit_msg.txt"', "Committing fix"):
    print("Failed to commit (might already be committed)")

# Push to branch
if not run_cmd('git push origin hamisi911ltd-debug/GLORY', "Pushing to hamisi911ltd-debug/GLORY"):
    print("Warning: Push may have failed or branch doesn't exist")
    sys.exit(1)

print("\n✅ Successfully committed and pushed the invariant error fix!")
