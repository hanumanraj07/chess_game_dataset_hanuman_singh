@echo off
setlocal

:: Define variables
set BACKUP_DIR=..\backups
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set MONGO_URI=mongodb://localhost:27017/chess_analytics

:: Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Run mongodump
echo Starting MongoDB backup for %MONGO_URI%...
mongodump --uri="%MONGO_URI%" --out="%BACKUP_DIR%\%TIMESTAMP%"

if %ERRORLEVEL% EQU 0 (
    echo Backup completed successfully at %BACKUP_DIR%\%TIMESTAMP%
) else (
    echo Backup failed with error code %ERRORLEVEL%
)

endlocal
pause
