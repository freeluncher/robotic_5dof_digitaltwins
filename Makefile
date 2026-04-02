.PHONY: install build test lint dev

install:
	npm install
	npm install --prefix apps/web
	dotnet restore apps/api/src/robotic_v4.Api.csproj
	dotnet restore apps/api/tests/robotic_v4.Api.Tests.csproj

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

dev:
	powershell -NoProfile -ExecutionPolicy Bypass -Command "$$repoRoot = (Get-Location).Path; $$apiJob = Start-Job -Name roboticv4-api -ScriptBlock { Set-Location (Join-Path $$using:repoRoot 'apps/api/src'); dotnet run }; $$webJob = Start-Job -Name roboticv4-web -ScriptBlock { Set-Location (Join-Path $$using:repoRoot 'apps/web'); npm run dev }; Write-Host 'Backend and frontend started. Press Ctrl+C to stop both.'; try { while ($$true) { Receive-Job -Job $$apiJob, $$webJob; if ($$apiJob.State -ne 'Running' -or $$webJob.State -ne 'Running') { break }; Start-Sleep -Milliseconds 500 } } finally { if ($$apiJob.State -eq 'Running') { Stop-Job $$apiJob }; if ($$webJob.State -eq 'Running') { Stop-Job $$webJob }; Remove-Job $$apiJob, $$webJob -ErrorAction SilentlyContinue }"