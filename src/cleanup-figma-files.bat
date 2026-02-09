@echo off
REM Optional cleanup script to remove Figma Make-specific files (Windows)
REM Run this ONLY if you want a minimal codebase without Figma artifacts

echo ======================================
echo Figma Make Files Cleanup Script
echo ======================================
echo.
echo This script will remove optional Figma Make-specific files that are
echo NOT used by the app. These are safe to delete.
echo.
echo Files to be removed:
echo   - /imports/ folder (Figma-generated components)
echo   - /guidelines/ folder (Figma Make guidelines)
echo   - /Attributions.md (Figma Make attributions)
echo.
echo WARNING: This action cannot be undone!
echo.

set /p confirm="Do you want to proceed? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo Cleanup cancelled.
    exit /b 0
)

echo.
echo Removing files...

REM Remove imports folder
if exist "imports" (
    rmdir /s /q "imports"
    echo OK Removed /imports/
) else (
    echo X /imports/ not found
)

REM Remove guidelines folder
if exist "guidelines" (
    rmdir /s /q "guidelines"
    echo OK Removed /guidelines/
) else (
    echo X /guidelines/ not found
)

REM Remove Attributions.md
if exist "Attributions.md" (
    del "Attributions.md"
    echo OK Removed Attributions.md
) else (
    echo X Attributions.md not found
)

REM Remove cleanup scripts
if exist "cleanup-figma-files.sh" (
    del "cleanup-figma-files.sh"
    echo OK Removed cleanup-figma-files.sh
)

if exist "cleanup-figma-files.bat" (
    del "cleanup-figma-files.bat"
    echo OK Removed cleanup script
)

echo.
echo ======================================
echo Cleanup complete!
echo ======================================
echo.
echo Your project is now free of Figma Make artifacts.
echo All core functionality remains intact.
echo.
pause
