[CmdletBinding()]
param(
  [switch]$NoPause
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot

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
  Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u505c\u6b62\u4e00\u952e\u90e8\u7f72\u8fdb\u7a0b')
  Stop-DeploymentProcesses
  Write-Host (Get-LocalizedText '\u505c\u6b62\u64cd\u4f5c\u5df2\u5b8c\u6210\u3002')
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
