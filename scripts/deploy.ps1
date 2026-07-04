$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$NodePath = (Get-Command node).Source
$PnpmPath = (Get-Command pnpm).Source
$ServerLogPath = Join-Path $Root "logs/server.log"
$ServerErrorLogPath = Join-Path $Root "logs/server.error.log"
$WebLogPath = Join-Path $Root "logs/web.log"
$WebErrorLogPath = Join-Path $Root "logs/web.error.log"

function Get-LocalizedText {
  param(
    [Parameter(Mandatory = $true)]
    [string]$EscapedText
  )

  return ('"' + $EscapedText + '"' | ConvertFrom-Json)
}

function Load-EnvFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  foreach ($rawLine in (Get-Content -Path $Path -Encoding UTF8)) {
    $line = $rawLine.Trim()
    if ($line -and -not $line.StartsWith("#")) {
      $separatorIndex = $line.IndexOf("=")
      if ($separatorIndex -gt 0) {
        $key = $line.Substring(0, $separatorIndex).Trim()
        $value = $line.Substring($separatorIndex + 1).Trim()

        if ($value.Length -ge 2 -and $value.StartsWith('"') -and $value.EndsWith('"')) {
          $value = $value.Substring(1, $value.Length - 2)
        }

        [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
      }
    }
  }
}

function Invoke-NativeCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command,
    [string[]]$Arguments = @(),
    [Parameter(Mandatory = $true)]
    [string]$StepName
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$StepName failed with exit code $LASTEXITCODE."
  }
}

function Stop-ExistingDeploymentProcesses {
  $serverPattern = [regex]::Escape((Join-Path $Root "packages\server\dist\app.js"))
  $webPattern = [regex]::Escape((Join-Path $Root "packages\web"))

  $existingProcesses = Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -and (
      $_.CommandLine -match $serverPattern -or
      ($_.CommandLine -match $webPattern -and $_.CommandLine -match "vite\.js" -and $_.CommandLine -match '"preview"')
    )
  }

  foreach ($process in $existingProcesses) {
    try {
      Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
      Write-Host ((Get-LocalizedText '\u5df2\u505c\u6b62\u65e7\u8fdb\u7a0b') + ": " + $process.ProcessId)
    } catch {
      Write-Host ((Get-LocalizedText '\u505c\u6b62\u65e7\u8fdb\u7a0b\u5931\u8d25') + ": " + $process.ProcessId)
    }
  }
}

Set-Location $Root

Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u51c6\u5907\u73af\u5883')

if (-not (Test-Path ".env")) {
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env"
    Write-Host (Get-LocalizedText '\u5df2\u4ece .env.example \u751f\u6210 .env\uff0c\u8bf7\u6309\u9700\u68c0\u67e5\u6570\u636e\u5e93\u8fde\u63a5\u914d\u7f6e\u3002')
  } else {
    throw (Get-LocalizedText '\u672a\u627e\u5230 .env \u6216 .env.example\uff0c\u65e0\u6cd5\u7ee7\u7eed\u90e8\u7f72\u3002')
  }
}

Load-EnvFile -Path (Join-Path $Root ".env")

Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u5b89\u88c5\u4f9d\u8d56')
Invoke-NativeCommand -Command $PnpmPath -Arguments @("install") -StepName "pnpm install"

Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u521b\u5efa\u5e76\u68c0\u67e5\u6570\u636e\u5e93')
Invoke-NativeCommand -Command $NodePath -Arguments @(".\scripts\ensure-database.mjs") -StepName "ensure database"

Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u751f\u6210 Prisma Client')
Invoke-NativeCommand -Command $PnpmPath -Arguments @("--filter", "@noteapp/database", "exec", "prisma", "generate") -StepName "prisma generate"

Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u6267\u884c\u6570\u636e\u5e93\u8fc1\u79fb')
Invoke-NativeCommand -Command $PnpmPath -Arguments @("--filter", "@noteapp/database", "exec", "prisma", "migrate", "deploy") -StepName "prisma migrate deploy"

Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u5199\u5165\u79cd\u5b50\u6570\u636e')
Invoke-NativeCommand -Command $PnpmPath -Arguments @("db:seed") -StepName "pnpm db:seed"

Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u5e94\u7528\u7248\u6743\u4e0e\u8054\u7cfb\u65b9\u5f0f')
Invoke-NativeCommand -Command $PnpmPath -Arguments @("db:brand") -StepName "pnpm db:brand"

Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u6784\u5efa\u9879\u76ee')
Invoke-NativeCommand -Command $PnpmPath -Arguments @("build") -StepName "pnpm build"

if (-not (Test-Path "logs")) {
  New-Item -ItemType Directory -Path "logs" | Out-Null
}

Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u505c\u6b62\u65e7\u7684\u90e8\u7f72\u8fdb\u7a0b')
Stop-ExistingDeploymentProcesses

Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u542f\u52a8\u540e\u7aef\u670d\u52a1')
Start-Process -FilePath $NodePath `
  -ArgumentList "packages/server/dist/app.js" `
  -WorkingDirectory $Root `
  -RedirectStandardOutput $ServerLogPath `
  -RedirectStandardError $ServerErrorLogPath `
  -WindowStyle Hidden

Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u542f\u52a8\u524d\u7aef\u9884\u89c8')
Start-Process -FilePath "powershell.exe" `
  -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $PnpmPath, "--filter", "@noteapp/web", "exec", "vite", "preview", "--host", "0.0.0.0", "--port", "5173" `
  -WorkingDirectory $Root `
  -RedirectStandardOutput $WebLogPath `
  -RedirectStandardError $WebErrorLogPath `
  -WindowStyle Hidden

Write-Host ""
Write-Host (Get-LocalizedText '\u90e8\u7f72\u5b8c\u6210\u3002')
Write-Host ((Get-LocalizedText '\u524d\u7aef\u5730\u5740') + ": http://localhost:5173")
Write-Host ((Get-LocalizedText '\u540e\u7aef\u5730\u5740') + ": http://localhost:3000")
Write-Host ((Get-LocalizedText '\u65e5\u5fd7\u76ee\u5f55') + ": $Root\\logs")
