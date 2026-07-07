# install.ps1 - Ponytail Skills Installer
$repoOwner = "rizalrepo"
$repoName = "ponytail-antigravity-IDE"
$branch = "main"

$skills = @(
    "ponytail",
    "ponytail-audit",
    "ponytail-debt",
    "ponytail-gain",
    "ponytail-help",
    "ponytail-review",
    "ponytail-update"
)

$baseDir = Join-Path $env:USERPROFILE ".gemini\config\skills"

Write-Host "=== Starting Ponytail Skills Installation ===" -ForegroundColor Cyan
Write-Host "Target directory: $baseDir" -ForegroundColor Gray

if (-not (Test-Path $baseDir)) {
    New-Item -ItemType Directory -Path $baseDir -Force | Out-Null
    Write-Host "Creating new configuration directory..." -ForegroundColor Yellow
}

foreach ($skill in $skills) {
    $skillDir = Join-Path $baseDir $skill
    if (-not (Test-Path $skillDir)) {
        New-Item -ItemType Directory -Path $skillDir -Force | Out-Null
    }
    
    $url = "https://raw.githubusercontent.com/$repoOwner/$repoName/$branch/skills/$skill/SKILL.md"
    $destFile = Join-Path $skillDir "SKILL.md"
    
    Write-Host "Downloading skill: $skill..." -NoNewline -ForegroundColor Gray
    try {
        Invoke-RestMethod -Uri $url -OutFile $destFile -Headers @{"User-Agent" = "Mozilla/5.0"}
        Write-Host " [Success]" -ForegroundColor Green
    } catch {
        Write-Host " [Failed]" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor DarkRed
    }
}

Write-Host "`n=== Installation Completed ===" -ForegroundColor Cyan
Write-Host "Please restart Gemini/Antigravity IDE to load the new skills." -ForegroundColor Green
