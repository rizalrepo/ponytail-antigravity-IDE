# install.ps1 - Ponytail Skills Installer
$repoOwner = "rizalrepo"
$repoName = "ponytail"
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

Write-Host "=== Memulai Instalasi Ponytail Skills ===" -ForegroundColor Cyan
Write-Host "Target direktori: $baseDir" -ForegroundColor Gray

if (-not (Test-Path $baseDir)) {
    New-Item -ItemType Directory -Path $baseDir -Force | Out-Null
    Write-Host "Membuat direktori konfigurasi baru..." -ForegroundColor Yellow
}

foreach ($skill in $skills) {
    $skillDir = Join-Path $baseDir $skill
    if (-not (Test-Path $skillDir)) {
        New-Item -ItemType Directory -Path $skillDir -Force | Out-Null
    }
    
    $url = "https://raw.githubusercontent.com/$repoOwner/$repoName/$branch/skills/$skill/SKILL.md"
    $destFile = Join-Path $skillDir "SKILL.md"
    
    Write-Host "Mengunduh skill: $skill..." -NoNewline -ForegroundColor Gray
    try {
        Invoke-RestMethod -Uri $url -OutFile $destFile -Headers @{"User-Agent" = "Mozilla/5.0"}
        Write-Host " [Sukses]" -ForegroundColor Green
    } catch {
        Write-Host " [Gagal]" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor DarkRed
    }
}

Write-Host "`n=== Instalasi Selesai ===" -ForegroundColor Cyan
Write-Host "Silakan ketik /ponytail-help untuk panduan penggunaan." -ForegroundColor Green
