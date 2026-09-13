@echo off
title Junior Clash - NCERT, Urdu & Manners Battle
echo =========================================================================
echo   Junior Clash Pro - Ammeya (Class 3) vs Ahil (Class 1)
echo   Connected to MongoDB: cargo_tracker_v2
echo =========================================================================
echo.
echo Starting Backend Server (MongoDB API) on port 5000...
start /min cmd /c "node server/index.js"
echo.
echo Starting Frontend Web App on port 3000...
echo Connect your mobile phone to the same Wi-Fi and open the Network URL!
echo.
npm run dev
