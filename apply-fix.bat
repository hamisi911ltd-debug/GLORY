@echo off
setlocal enabledelayedexpansion

cd /d "C:\Users\john\Documents\drive ahead\drive-ahead"

echo Staging changes...
git add "src\routes\_authenticated.tsx"
if !errorlevel! neq 0 (
    echo Failed to stage changes
    exit /b 1
)

echo Committing changes...
git commit -m "Fix: Resolve Framer Motion invariant error in mobile nav

The 'Invariant failed' error was caused by reusing the same layoutId 'mobile-nav-indicator' across multiple navigation items in the mobile bottom navigation. Framer Motion requires layout animation IDs to be stable and unique per element.

Changed: Make each navigation item's motion.div indicator have a unique layoutId based on the item label (e.g., mobile-nav-indicator-Dashboard).

This allows Framer Motion to correctly track and animate the indicator as it moves between different active links without violating layout animation invariants.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

if !errorlevel! neq 0 (
    echo Failed to commit
    exit /b 1
)

echo Pushing to hamisi911ltd-debug/GLORY...
git push origin hamisi911ltd-debug/GLORY

if !errorlevel! equ 0 (
    echo.
    echo ===================================
    echo SUCCESS! Changes committed and pushed
    echo ===================================
) else (
    echo Push failed - branch may not exist or push was rejected
    exit /b 1
)
