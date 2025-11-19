<#
Simple helper to init/commit and push the Windward folder to GitHub.
Usage:
 - Open PowerShell, cd to this Windward folder, then:
   .\upload_to_github.ps1
It will prompt for a remote URL or a repo name and will try to use the GitHub CLI (gh) if available.
#>

# Ensure git exists
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git not found. Install Git and re-run."
  exit 1
}

# Run from script directory (safe if invoked from elsewhere)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

# Ensure .gitignore exists (you can edit it before running)
if (-not (Test-Path ".gitignore")) {
  New-Item -Path ".gitignore" -ItemType File -Force | Out-Null
  Write-Host "Created placeholder .gitignore — edit if needed."
}

# Initialize repo if needed
if (-not (Test-Path ".git")) {
  git init
  git branch -M main
  Write-Host "Initialized new git repository and set branch to 'main'."
} else {
  Write-Host "Git repository already present."
}

# Stage and commit
git add --all
try {
  git commit -m "Initial commit"
} catch {
  Write-Host "No changes to commit or previous commit exists."
}

# Ask for remote or repo creation
$remoteUrl = Read-Host "Paste remote URL (https://github.com/you/repo.git) or leave blank to create via gh CLI"
if ($remoteUrl) {
  # Add remote if not present
  $existing = git remote
  if ($existing -notcontains "origin") {
    git remote add origin $remoteUrl
  } else {
    git remote set-url origin $remoteUrl
  }
  git push -u origin main
  Write-Host "Pushed to $remoteUrl"
  exit 0
}

# Try to use gh CLI to create repo
if (Get-Command gh -ErrorAction SilentlyContinue) {
  $repoName = Read-Host "Enter repo name (will create under your GitHub account). Leave blank to use current folder name"
  if (-not $repoName) {
    $repoName = Split-Path -Leaf $scriptDir
  }
  # create repo and push
  gh repo create $repoName --public --source . --remote origin --push --confirm
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Repository created and pushed via gh."
    exit 0
  } else {
    Write-Error "gh repo create failed. Create the repo manually and re-run with remote URL."
    exit 1
  }
}

Write-Host "No remote provided and gh CLI not found. Create a GitHub repo in the web UI, copy the remote URL, then re-run this script and paste the URL when prompted."
