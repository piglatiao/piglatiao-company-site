$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot

function Get-LocalizedText {
  param(
    [Parameter(Mandatory = $true)]
    [string]$EscapedText
  )

  return ('"' + $EscapedText + '"' | ConvertFrom-Json)
}

function Stop-DeploymentProcesses {
  $serverPattern = [regex]::Escape((Join-Path $Root "packages\server\dist\app.js"))
  $webPattern = [regex]::Escape((Join-Path $Root "packages\web"))

  $existingProcesses = Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -and (
      $_.CommandLine -match $serverPattern -or
      ($_.CommandLine -match $webPattern -and $_.CommandLine -match "vite\.js" -and $_.CommandLine -match '"preview"') -or
      ($_.CommandLine -match "@noteapp/web" -and $_.CommandLine -match "vite" -and $_.CommandLine -match "preview")
    )
  }

  if (-not $existingProcesses) {
    Write-Host (Get-LocalizedText '\u672a\u627e\u5230\u6b63\u5728\u8fd0\u884c\u7684\u90e8\u7f72\u8fdb\u7a0b\u3002')
    return
  }

  foreach ($process in $existingProcesses) {
    try {
      Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
      Write-Host ((Get-LocalizedText '\u5df2\u505c\u6b62\u8fdb\u7a0b') + ": " + $process.ProcessId)
    } catch {
      Write-Host ((Get-LocalizedText '\u505c\u6b62\u8fdb\u7a0b\u5931\u8d25') + ": " + $process.ProcessId)
    }
  }
}

Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u505c\u6b62\u4e00\u952e\u90e8\u7f72\u8fdb\u7a0b')
Stop-DeploymentProcesses
Write-Host (Get-LocalizedText '\u505c\u6b62\u64cd\u4f5c\u5df2\u5b8c\u6210\u3002')
