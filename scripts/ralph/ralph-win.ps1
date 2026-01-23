# Ralph Wiggum - The Knot Website Image Implementation (Windows PowerShell)
# Usage: .\ralph-win.ps1 [-MaxIterations 15]

param(
    [int]$MaxIterations = 15
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PrdFile = Join-Path $ScriptDir "prd.json"
$ProgressFile = Join-Path $ScriptDir "progress.txt"
$PromptFile = Join-Path $ScriptDir "prompt.md"

# Project root is TheKnot/website (two levels up from scripts/ralph/)
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# Initialize progress file if it doesn't exist
if (-not (Test-Path $ProgressFile)) {
    @"
# Ralph Progress Log - The Knot Website
Started: $(Get-Date)
---
"@ | Set-Content $ProgressFile
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Ralph Wiggum - The Knot Website Image Implementation" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  PRD: $PrdFile" -ForegroundColor Cyan
Write-Host "  Working Dir: $ProjectRoot" -ForegroundColor Cyan
Write-Host "  Max Iterations: $MaxIterations" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Change to project root for amp execution
Push-Location $ProjectRoot

try {
    for ($i = 1; $i -le $MaxIterations; $i++) {
        Write-Host ""
        Write-Host "=== Ralph Iteration $i of $MaxIterations ===" -ForegroundColor Yellow

        # Read the prompt and pipe to amp
        $PromptContent = Get-Content $PromptFile -Raw

        try {
            # Run amp with the prompt from project root, capture output
            $Output = $PromptContent | amp --dangerously-allow-all 2>&1

            # Display output
            $Output | ForEach-Object { Write-Host $_ }

            # Check for completion signal
            $OutputText = $Output -join "`n"
            if ($OutputText -match "<promise>COMPLETE</promise>") {
                Write-Host ""
                Write-Host "=== Ralph completed all tasks! ===" -ForegroundColor Green
                Write-Host "Finished at iteration $i of $MaxIterations" -ForegroundColor Green
                exit 0
            }
        }
        catch {
            Write-Host "Error in iteration $($i): $_" -ForegroundColor Red
        }

        Write-Host "Iteration $i complete. Continuing..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }

    Write-Host ""
    Write-Host "Ralph reached max iterations ($MaxIterations) without completing." -ForegroundColor Yellow
    Write-Host "Check progress.txt for status." -ForegroundColor Yellow
    exit 1
}
finally {
    Pop-Location
}
