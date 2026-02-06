# start.ps1
Write-Host "🚀 Starting EchoTrace Full-Stack Application..." -ForegroundColor Cyan
Write-Host ""

# Install dependencies if missing
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
    npm install
}

if (!(Test-Path "backend\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (!(Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host "✅ Dependencies ready" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Starting servers..." -ForegroundColor Cyan
Write-Host "• Frontend: http://localhost:3000" -ForegroundColor Magenta
Write-Host "• Backend:  http://localhost:5000" -ForegroundColor Magenta
Write-Host "• API:      http://localhost:5000/api" -ForegroundColor Magenta
Write-Host ""

# Start both servers
npm run dev