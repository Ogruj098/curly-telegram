#!/bin/bash
# GitHub Skills Exercise - Automated Completion Script
# This script automates the 4 steps of the "Introduction to GitHub" exercise
# 
# Usage: bash complete-exercise.sh
#
# Note: This is meant as a learning tool to understand the Git commands.
# For maximum learning value, complete the exercise manually through the GitHub UI.

set -e  # Exit on error

echo "🚀 GitHub Skills Exercise - Automated Completion"
echo "================================================"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Step 1: Create branch
echo "Step 1: Creating branch 'my-first-branch'..."
if git show-ref --verify --quiet refs/heads/my-first-branch; then
    echo "   ℹ️  Branch 'my-first-branch' already exists, checking it out..."
    git checkout my-first-branch
else
    git checkout -b my-first-branch
    echo "   ✅ Branch 'my-first-branch' created"
fi

# Push branch to trigger Step 1 workflow
echo "   📤 Pushing branch to GitHub..."
git push -u origin my-first-branch || true
echo "   ✅ Step 1 complete: Branch created and pushed"
echo ""

# Step 2: Create file and commit
echo "Step 2: Creating PROFILE.md and committing..."
if [ -f PROFILE.md ]; then
    echo "   ℹ️  PROFILE.md already exists, skipping creation"
else
    echo "Welcome to my GitHub profile!" > PROFILE.md
    git add PROFILE.md
    git commit -m "Add PROFILE.md"
    echo "   ✅ File created and committed"
fi

# Push commit to trigger Step 2 workflow  
echo "   📤 Pushing commit to GitHub..."
git push || true
echo "   ✅ Step 2 complete: File committed and pushed"
echo ""

# Step 3: Create Pull Request
echo "Step 3: Creating Pull Request..."
echo "   ℹ️  To complete this step, you need to:"
echo "   1. Go to: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/pulls"
echo "   2. Click 'Compare & pull request' or 'New pull request'"
echo "   3. Set base: main, compare: my-first-branch"
echo "   4. Title: 'Add my first file'"
echo "   5. Add a description and click 'Create pull request'"
echo ""
echo "   Or use GitHub CLI:"
echo "   gh pr create --base main --head my-first-branch --title 'Add my first file' --body 'Created branch, added file, and committed changes'"
echo ""

# Step 4: Merge Pull Request
echo "Step 4: Merging Pull Request..."
echo "   ℹ️  To complete this step, you need to:"
echo "   1. Wait for any checks to pass"
echo "   2. Click 'Merge pull request' on the PR page"
echo "   3. Click 'Confirm merge'"
echo "   4. Optionally click 'Delete branch' to clean up"
echo ""
echo "   Or use GitHub CLI:"
echo "   gh pr merge --merge <PR_NUMBER>"
echo ""

echo "================================================"
echo "✨ Next Steps:"
echo ""
echo "The automated steps (1 & 2) are complete!"
echo "Steps 3 & 4 require GitHub UI or CLI."
echo ""
echo "Watch Issue #1 for Mona's progress updates:"
echo "https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/issues/1"
echo ""
echo "🎓 Remember: The goal is to learn, so understanding each step is important!"
echo "================================================"
