$env:NODE_ENV = "development"
Set-Location $PSScriptRoot
& "C:\Program Files\nodejs\node.exe" "$PSScriptRoot\node_modules\tsx\dist\cli.mjs" watch "$PSScriptRoot\server\_core\index.ts"
