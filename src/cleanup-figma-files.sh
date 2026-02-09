#!/bin/bash

# Optional cleanup script to remove Figma Make-specific files
# Run this ONLY if you want a minimal codebase without Figma artifacts

echo "======================================"
echo "Figma Make Files Cleanup Script"
echo "======================================"
echo ""
echo "This script will remove optional Figma Make-specific files that are"
echo "NOT used by the app. These are safe to delete."
echo ""
echo "Files to be removed:"
echo "  - /imports/ folder (Figma-generated components)"
echo "  - /guidelines/ folder (Figma Make guidelines)"
echo "  - /Attributions.md (Figma Make attributions)"
echo ""
echo "⚠️  WARNING: This action cannot be undone!"
echo ""
read -p "Do you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo "Removing files..."

# Remove imports folder
if [ -d "imports" ]; then
    rm -rf imports
    echo "✓ Removed /imports/"
else
    echo "⊘ /imports/ not found"
fi

# Remove guidelines folder
if [ -d "guidelines" ]; then
    rm -rf guidelines
    echo "✓ Removed /guidelines/"
else
    echo "⊘ /guidelines/ not found"
fi

# Remove Attributions.md
if [ -f "Attributions.md" ]; then
    rm Attributions.md
    echo "✓ Removed Attributions.md"
else
    echo "⊘ Attributions.md not found"
fi

# Remove this cleanup script itself
if [ -f "cleanup-figma-files.sh" ]; then
    rm cleanup-figma-files.sh
    echo "✓ Removed cleanup script"
fi

echo ""
echo "======================================"
echo "Cleanup complete!"
echo "======================================"
echo ""
echo "Your project is now free of Figma Make artifacts."
echo "All core functionality remains intact."
echo ""
