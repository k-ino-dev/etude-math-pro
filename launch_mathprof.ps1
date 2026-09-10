$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = (Get-Item -Path ".").FullName }
Set-Location $rootDir

$url = "http://127.0.0.1:8000"
$pythonExe = Join-Path $rootDir ".venv\Scripts\python.exe"
$runScript = Join-Path $rootDir "backend\run.py"

function Test-ServerReady {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $iar = $client.BeginConnect("127.0.0.1", 8000, $null, $null)
        $wait = $iar.AsyncWaitHandle.WaitOne(300, $false)
        if ($wait) {
            $client.EndConnect($iar)
            $client.Close()
            return $true
        }
        $client.Close()
        return $false
    } catch {
        try { $client.Close() } catch {}
        return $false
    }
}

# 1. Check if server is already running
if (Test-ServerReady) {
    Start-Process $url
    exit 0
}

# 2. Start the FastAPI backend server (detached background process via WScript.Shell)
$ws = New-Object -ComObject WScript.Shell
$ws.Run("`"$pythonExe`" `"$runScript`"", 0, $false)

# 3. Wait for server to become accessible (poll up to 25 seconds)
$maxAttempts = 50
$isReady = $false

for ($i = 0; $i -lt $maxAttempts; $i++) {
    Start-Sleep -Milliseconds 400
    if (Test-ServerReady) {
        $isReady = $true
        break
    }
}

if ($isReady) {
    # 4. Open browser automatically once ready
    Start-Process $url
    exit 0
} else {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show("Le serveur MathsProf n'a pas pu demarrer dans le delai imparti.`nLancez start_mathprof.bat pour diagnostiquer l'erreur.", "MathsProf — Erreur", 0, 16)
    exit 1
}
