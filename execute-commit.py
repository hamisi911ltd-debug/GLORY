#!/usr/bin/env python3
import subprocess
import os
import sys

os.chdir(r'C:\Users\john\Documents\drive ahead\drive-ahead')

print("=" * 60)
print("Applying Framer Motion Invariant Error Fix")
print("=" * 60)

# Stage the changes
print("\n[1] Staging changes...")
result = subprocess.run(['git', 'add', 'src/routes/_authenticated.tsx'], 
                       capture_output=True, text=True)
if result.returncode != 0:
    print(f"❌ Failed to stage: {result.stderr}")
    sys.exit(1)
print("✓ Staged src/routes/_authenticated.tsx")

# Commit the changes
print("\n[2] Committing changes...")
commit_msg = """Fix: Resolve Framer Motion invariant error in mobile nav

The 'Invariant failed' error was caused by reusing the same layoutId 'mobile-nav-indicator' across multiple navigation items in the mobile bottom navigation. Framer Motion requires layout animation IDs to be stable and unique per element.

Changed: Make each navigation item's motion.div indicator have a unique layoutId based on the item label (e.g., mobile-nav-indicator-Dashboard).

This allows Framer Motion to correctly track and animate the indicator as it moves between different active links without violating layout animation invariants.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"""

result = subprocess.run(['git', 'commit', '-m', commit_msg],
                       capture_output=True, text=True)
if result.returncode != 0:
    print(f"❌ Failed to commit: {result.stderr}")
    sys.exit(1)
print("✓ Committed with message")
if result.stdout:
    print(result.stdout)

# Push to the branch
print("\n[3] Pushing to hamisi911ltd-debug/GLORY...")
result = subprocess.run(['git', 'push', 'origin', 'hamisi911ltd-debug/GLORY'],
                       capture_output=True, text=True)
print(result.stdout)
if result.returncode != 0:
    print(f"⚠ Push output: {result.stderr}")
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ SUCCESS! All changes applied and pushed")
print("=" * 60)
print("\nSummary of changes:")
print("• Fixed layoutId in mobile navigation indicator")
print("• Made layout IDs unique per navigation item")
print("• Pushed to branch: hamisi911ltd-debug/GLORY")
print("• Ready for redeployment")
