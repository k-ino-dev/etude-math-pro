Option Explicit
Dim WshShell, fso, strDir, strPy, strRun, http, isRunning, i
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strDir
strPy = strDir & "\.venv\Scripts\python.exe"
strRun = strDir & "\backend\run.py"
isRunning = False
On Error Resume Next
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
If http Is Nothing Then Set http = CreateObject("MSXML2.ServerXMLHTTP")
http.Open "GET", "http://127.0.0.1:8000/", False
http.setTimeouts 500, 500, 500, 500
http.Send
If Err.Number = 0 Then
    If http.Status = 200 Then isRunning = True
End If
On Error Goto 0
If Not isRunning Then
    WshShell.Run """" & strPy & """ """ & strRun & """", 0, False
    For i = 1 To 50
        WScript.Sleep 400
        On Error Resume Next
        Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
        If http Is Nothing Then Set http = CreateObject("MSXML2.ServerXMLHTTP")
        http.Open "GET", "http://127.0.0.1:8000/", False
        http.setTimeouts 400, 400, 400, 400
        http.Send
        If Err.Number = 0 Then
            If http.Status = 200 Then
                isRunning = True
                Exit For
            End If
        End If
        On Error Goto 0
    Next
End If
If isRunning Then
    WshShell.Run "http://127.0.0.1:8000", 1, False
Else
    MsgBox "Le serveur MathsProf n a pas pu demarrer." & vbCrLf & "Veuillez lancer start_mathprof.bat pour verifier les erreurs.", 16, "MathsProf - Erreur"
End If
