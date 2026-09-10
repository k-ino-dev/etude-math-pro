Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
strCurrentDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' 1. Création du raccourci principal "MathsProf"
Set oLink = WshShell.CreateShortcut(strDesktop & "\MathsProf.lnk")
oLink.TargetPath = "wscript.exe"
oLink.Arguments = """" & strCurrentDir & "\demarrer_mathsprof.vbs"""
oLink.WorkingDirectory = strCurrentDir
oLink.Description = "MathsProf — Lanceur de l'Application"
oLink.IconLocation = "shell32.dll,13"
oLink.Save

' 2. Création du raccourci d'arrêt "Arrêter MathsProf"
Set oStopLink = WshShell.CreateShortcut(strDesktop & "\Arrêter MathsProf.lnk")
oStopLink.TargetPath = strCurrentDir & "\stop_mathprof.bat"
oStopLink.WorkingDirectory = strCurrentDir
oStopLink.Description = "Arrêter le serveur MathsProf"
oStopLink.IconLocation = "shell32.dll,27"
oStopLink.Save

WScript.Echo "[OK] Raccourcis MathsProf et Arreter MathsProf crees sur votre Bureau !"
