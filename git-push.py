import subprocess
import os

os.chdir(r'C:\Users\john\Documents\drive ahead\drive-ahead')

# Stage
r1 = subprocess.run(['git', 'add', 'src/routes/_authenticated.tsx'], capture_output=True)
print("Stage:", "OK" if r1.returncode == 0 else f"ERROR: {r1.stderr.decode()}")

# Commit
msg = """Fix: Resolve Framer Motion invariant error in mobile nav

The 'Invariant failed' error was caused by reusing the same layoutId 'mobile-nav-indicator' across multiple navigation items. Framer Motion requires layout animation IDs to be stable and unique.

Solution: Made each motion.div indicator have a unique layoutId (e.g., mobile-nav-indicator-Dashboard).

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"""

r2 = subprocess.run(['git', 'commit', '-m', msg], capture_output=True, text=True)
print("Commit:", "OK" if r2.returncode == 0 else f"ERROR: {r2.stderr}")
if r2.stdout:
    print(r2.stdout)

# Push
r3 = subprocess.run(['git', 'push', 'origin', 'hamisi911ltd-debug/GLORY'], capture_output=True, text=True)
print("Push:", "OK" if r3.returncode == 0 else "Check output")
print(r3.stdout)
if r3.stderr:
    print("Stderr:", r3.stderr)

if all(r.returncode == 0 for r in [r1, r2, r3]):
    print("\n✅ All changes successfully applied and pushed!")
