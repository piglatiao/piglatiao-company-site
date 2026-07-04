[CmdletBinding()]
param(
  [switch]$Force,
  [switch]$NoPause
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$NodePath = (Get-Command node).Source
$PnpmPath = (Get-Command pnpm).Source
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
部署前确认会提示哪些数据库字段会被脚本直接更新。
#>
function Confirm-DeployAction {
  if ($Force) {
    return
  }

  Write-Host ""
  Write-Host (Get-LocalizedText '\u003d\u003d\u003e \u90e8\u7f72\u524d\u786e\u8ba4')
  Write-Host (Get-LocalizedText '\u8be5\u811a\u672c\u5c06\u6267\u884c\u6570\u636e\u5e93\u8fc1\u79fb\u3001\u5199\u5165\u79cd\u5b50\u6570\u636e\u3001\u5e94\u7528\u7248\u6743\u4e0e\u8054\u7cfb\u65b9\u5f0f\u66f4\u65b0\u3002')
  Write-Host (Get-LocalizedText '\u5176\u4e2d\u4ee5\u4e0b\u6570\u636e\u4f1a\u88ab\u76f4\u63a5\u66f4\u65b0\uff1a')
  Write-Host (Get-LocalizedText '\u0031\u002e \u516c\u53f8\u90ae\u7bb1 -> 599594629@qq.com')
  Write-Host (Get-LocalizedText '\u0032\u002e \u516c\u53f8\u5730\u5740 -> \u7518\u8083\u5170\u5dde')
  Write-Host (Get-LocalizedText '\u0033\u002e \u516c\u53f8\u5fae\u4fe1 -> jieyi5170')
  Write-Host (Get-LocalizedText '\u0034\u002e site_copyright / footer_copyright -> piglatiao')
  Write-Host ""

  $answer = Read-Host (Get-LocalizedText '\u786e\u8ba4\u7ee7\u7eed\u90e8\u7f72\u5417\uff1f\u8f93\u5165 Y \u7ee7\u7eed\uff0c\u5176\u4ed6\u4efb\u610f\u5185\u5bb9\u53d6\u6d88')
  if ($answer -notin @("Y", "y")) {
    throw (Get-LocalizedText '\u5df2\u53d6\u6d88\u90e8\u7f72\u3002')
  }
}

<#
读取根目录 .env，并写入当前 PowerShell 进程环境变量。
#>
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

<#
执行外部命令并在失败时立即中断部署。
#>
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

<#
停止由部署脚本或启动脚本拉起的后端服务与前端预览进程。
#>
function Stop-ExistingDeploymentProcesses {
  $serverPattern = [regex]::Escape((Join-Path $Root "packages\server\dist\app.js"))
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
  Confirm-DeployAction

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
