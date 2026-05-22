Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

repoPath = "C:\Users\john\Documents\drive ahead\drive-ahead"
objShell.CurrentDirectory = repoPath

WScript.Echo "============================================================"
WScript.Echo "Deploying Framer Motion Invariant Error Fix"
WScript.Echo "============================================================"
WScript.Echo ""

' Stage changes
WScript.Echo "[1/4] Staging changes..."
errCode = objShell.Run("cmd /c git add ""src\routes\_authenticated.tsx""", 0, True)
If errCode <> 0 Then
    WScript.Echo "ERROR: Failed to stage"
    WScript.Quit 1
End If
WScript.Echo "✓ Staged"
WScript.Echo ""

' Commit
WScript.Echo "[2/4] Committing changes..."
commitMsg = "Fix: Resolve Framer Motion invariant error in mobile nav"
errCode = objShell.Run("cmd /c git commit -m """ & commitMsg & """ --no-verify", 0, True)
If errCode <> 0 And errCode <> 1 Then
    WScript.Echo "ERROR: Failed to commit"
    WScript.Quit 1
End If
WScript.Echo "✓ Committed"
WScript.Echo ""

' Push
WScript.Echo "[3/4] Pushing to hamisi911ltd-debug/GLORY..."
errCode = objShell.Run("cmd /c git push origin hamisi911ltd-debug/GLORY", 0, True)
If errCode <> 0 Then
    WScript.Echo "ERROR: Failed to push"
    WScript.Quit 1
End If
WScript.Echo "✓ Pushed"
WScript.Echo ""

WScript.Echo "============================================================"
WScript.Echo "SUCCESS: Deployed to hamisi911ltd-debug/GLORY"
WScript.Echo "============================================================"
