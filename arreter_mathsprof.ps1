$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

$stoppedCount = 0

# 1. Kill process on port 8000
try {
    $connections = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($p in $pids) {
            if ($p -gt 0) {
                Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
                $stoppedCount++
            }
        }
    }
} catch {}

# 2. Also search for any python.exe from this project's .venv
try {
    $pyProcs = Get-Process -Name "python" -ErrorAction SilentlyContinue
    foreach ($p in $pyProcs) {
        try {
            if ($p.Path -and $p.Path.StartsWith($rootDir, [System.StringComparison]::OrdinalIgnoreCase)) {
                Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
                $stoppedCount++
            }
        } catch {}
    }
} catch {}

Write-Host "Le serveur MathsProf a ete arrete." -ForegroundColor Green
