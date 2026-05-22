@echo off
REM Navigate to repo
cd /d "C:\Users\john\Documents\drive ahead\drive-ahead"

REM Check current status
echo Current git status:
git status

echo.
echo ============================================
echo Staging changes...
echo ============================================
git add "src\routes\_authenticated.tsx"

echo.
echo ============================================
echo Creating commit...
echo ============================================
git commit -m "Fix: Resolve Framer Motion invariant error in mobile nav

The 'Invariant failed' error was caused by reusing the same layoutId 'mobile-nav-indicator' across multiple navigation items in the mobile bottom navigation. Framer Motion requires layout animation IDs to be stable and unique per element.

Changed: Make each navigation item's motion.div indicator have a unique layoutId based on the item label (e.g., mobile-nav-indicator-Dashboard).

This allows Framer Motion to correctly track and animate the indicator as it moves between different active links without violating layout animation invariants.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo.
echo ============================================
echo Pushing to hamisi911ltd-debug/GLORY...
echo ============================================
git push origin hamisi911ltd-debug/GLORY

echo.
echo ============================================
echo DEPLOYMENT COMPLETE
echo ============================================
pause
