import subprocess
import os

os.chdir(r'C:\Users\john\Documents\drive ahead\drive-ahead')

# Stage the changes
result = subprocess.run(['git', 'add', 'src/routes/_authenticated.tsx'], capture_output=True, text=True)
print("Stage output:", result.stdout, result.stderr)

# Commit the changes
commit_message = """Fix: Resolve Framer Motion invariant error in mobile nav

The 'Invariant failed' error was caused by reusing the same layoutId
'mobile-nav-indicator' across multiple navigation items in the mobile
bottom navigation. Framer Motion requires layout animation IDs to be
stable and unique per element.

Changed: Make each navigation item's motion.div indicator have a unique
layoutId based on the item label (e.g., mobile-nav-indicator-Dashboard).

This allows Framer Motion to correctly track and animate the indicator
as it moves between different active links without violating layout
animation invariants.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"""

result = subprocess.run(['git', 'commit', '-m', commit_message], capture_output=True, text=True)
print("Commit output:", result.stdout, result.stderr)

# Push to the branch
result = subprocess.run(['git', 'push', 'origin', 'hamisi911ltd-debug/GLORY'], capture_output=True, text=True)
print("Push output:", result.stdout, result.stderr)
print("Return code:", result.returncode)
