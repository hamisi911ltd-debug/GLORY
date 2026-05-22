@echo off
cd /d "C:\Users\john\Documents\drive ahead\drive-ahead"
git add src\routes\_authenticated.tsx
git commit -m "Fix: Resolve Framer Motion invariant error in mobile nav

The 'Invariant failed' error was caused by reusing the same layoutId
'mobile-nav-indicator' across multiple navigation items in the mobile
bottom navigation. Framer Motion requires layout animation IDs to be
stable and unique per element.

Changed: Make each navigation item's motion.div indicator have a unique
layoutId based on the item label (e.g., mobile-nav-indicator-Dashboard).

This allows Framer Motion to correctly track and animate the indicator
as it moves between different active links without violating layout
animation invariants.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push origin hamisi911ltd-debug/GLORY
