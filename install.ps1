# install.ps1 - Ponytail Skills Installer for Antigravity IDE
$repoOwner = "rizalrepo"
$repoName = "ponytail-antigravity-IDE"
$headers = @{ "User-Agent" = "Mozilla/5.0" }
$fallbackBranch = "main"
$fallbackSkills = @(
    "ponytail",
    "ponytail-audit",
    "ponytail-debt",
    "ponytail-gain",
    "ponytail-help",
    "ponytail-review",
    "ponytail-update"
)

if (-not $env:APPDATA) {
    throw "APPDATA is not set. Antigravity IDE prompt folder could not be resolved."
}

$baseDir = Join-Path $env:APPDATA "Antigravity IDE\User\prompts"
$localSkillsRoot = Join-Path $PSScriptRoot "skills"

try {
    $repo = Invoke-RestMethod -Uri "https://api.github.com/repos/$repoOwner/$repoName" -Headers $headers
    $branch = $repo.default_branch
} catch {
    $branch = $fallbackBranch
    Write-Host "Could not resolve default branch. Falling back to '$branch'." -ForegroundColor Yellow
}

try {
    $skills = Invoke-RestMethod -Uri "https://api.github.com/repos/$repoOwner/$repoName/contents/skills?ref=$branch" -Headers $headers |
        Where-Object { $_.type -eq "dir" -and $_.name } |
        ForEach-Object { $_.name }

    if (-not $skills) {
        $skills = $fallbackSkills
        Write-Host "No skill directories returned by GitHub. Falling back to built-in skill list." -ForegroundColor Yellow
    }
} catch {
    $skills = $fallbackSkills
    Write-Host "Could not list skills from GitHub. Falling back to built-in skill list." -ForegroundColor Yellow
}

Write-Host "=== Starting Ponytail Skills Installation ===" -ForegroundColor Cyan
Write-Host "Target prompt directory: $baseDir" -ForegroundColor Gray
Write-Host "Source branch: $branch" -ForegroundColor Gray

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
    $localSkillFile = Join-Path $localSkillsRoot "$skill\SKILL.md"

    Write-Host "Downloading skill: $skill..." -NoNewline -ForegroundColor Gray
    try {
        if (Test-Path $localSkillFile) {
            Copy-Item $localSkillFile $destFile -Force
        } else {
            Invoke-RestMethod -Uri $url -OutFile $destFile -Headers $headers
        }

        Write-Host " [Success]" -ForegroundColor Green
    } catch {
        Write-Host " [Failed]" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor DarkRed
    }
}

Write-Host "`n=== Installation Completed ===" -ForegroundColor Cyan
Write-Host "Please restart Antigravity IDE to load the new skills." -ForegroundColor Green
