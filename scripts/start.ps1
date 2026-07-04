[CmdletBinding()]
param(
  [switch]$NoPause
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$NodePath = (Get-Command node).Source
$PnpmPath = (Get-Command pnpm).Source
$ServerEntryPath = Join-Path $Root "packages/server/dist/app.js"
$WebIndexPath = Join-Path $Root "packages/web/dist/index.html"
$ServerLogPath = Join-Path $Root "logs/server.log"
$ServerErrorLogPath = Join-Path $Root "logs/server.error.log"
$WebLogPath = Join-Path $Root "logs/web.log"
$WebErrorLogPath = Join-Path $Root "logs/web.error.log"

<#
通过 Unicode 转义输出中文，兼容 Windows PowerShell 5 对 UTF-8 无 BOM 的读取限制。
#>
function Get-LocalizedText {
  param(
    [Parameter(Mandatory = $true)]
    [string]$EscapedText
  )

  $jsonText = '"' + $EscapedText + '"'
  $localizedText = $jsonText | ConvertFrom-Json
  return $localizedText
}

<#
停止由部署脚本或启动脚本拉起的后端服务与前端预览进程。
#>
function Stop-ExistingDeploymentProcesses {
  $serverPattern = [regex]::Escape($ServerEntryPath)
  $webPattern = [regex]::Escape((Join-Path $Root "packages\web"))

  $existingProcesses = Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -and (
      $_.CommandLine -match $serverPattern -or
      ($_.CommandLine -match $webPattern -and $_.CommandLine -match "vite\.js" -and $_.CommandLine -match '"preview"') -or
      ($_.CommandLine -match "@noteapp/web" -and $_.CommandLine -match "vite" -and $_.CommandLine -match "preview")
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

<#
脚本结束后保持窗口，便于直接双击运行时查看结果。
#>
function Wait-BeforeExit {
  if ($NoPause -or -not [Environment]::UserInteractive -or [Console]::IsInputRedirected) {
    return
  }

  Write-Host ""
  Read-Host (Get-LocalizedText '\u811a\u672c\u5df2\u6267\u884c\u5b8c\u6210\uff0c\u6309\u56de\u8f66\u952e\u5173\u95ed\u7a97\u53e3')
}

$script:ExitCode = 0

try {
  Set-Location $Root

  Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u542f\u52a8\u73af\u5883\u68c0\u67e5')

  if (-not (Test-Path $ServerEntryPath)) {
    throw (Get-LocalizedText '\u672a\u627e\u5230\u540e\u7aef\u6784\u5efa\u4ea7\u7269 packages/server/dist/app.js\uff0c\u8bf7\u5148\u6267\u884c\u4e00\u952e\u90e8\u7f72\u6216 pnpm build\u3002')
  }

  if (-not (Test-Path $WebIndexPath)) {
    throw (Get-LocalizedText '\u672a\u627e\u5230\u524d\u7aef\u6784\u5efa\u4ea7\u7269 packages/web/dist/index.html\uff0c\u8bf7\u5148\u6267\u884c\u4e00\u952e\u90e8\u7f72\u6216 pnpm build\u3002')
  }

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
  Write-Host (Get-LocalizedText '\u542f\u52a8\u5b8c\u6210\u3002')
  Write-Host ((Get-LocalizedText '\u524d\u7aef\u5730\u5740') + ": http://localhost:5173")
  Write-Host ((Get-LocalizedText '\u540e\u7aef\u5730\u5740') + ": http://localhost:3000")
  Write-Host ((Get-LocalizedText '\u65e5\u5fd7\u76ee\u5f55') + ": $Root\\logs")
} catch {
  $script:ExitCode = 1
  Write-Host ""
  Write-Host (Get-LocalizedText '\u811a\u672c\u6267\u884c\u5931\u8d25\u3002') -ForegroundColor Red
  if ($_.Exception.Message) {
    Write-Host $_.Exception.Message -ForegroundColor Red
  }
} finally {
  Wait-BeforeExit
}

exit $script:ExitCode
