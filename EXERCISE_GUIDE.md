# GitHub Skills Exercise Guide

## About This Exercise

This repository contains a GitHub Skills learning exercise titled "Introduction to GitHub". The exercise is designed to teach beginners the fundamental GitHub workflow through hands-on practice.

## Exercise Overview

The exercise consists of 4 main steps tracked through [Issue #1](../../issues/1):

### Step 1: Create a Branch
- **Goal**: Create a new branch called `my-first-branch`
- **Learning**: Understanding branches as parallel versions of your code
- **Action**: Create a branch named exactly `my-first-branch` (no prefixes or suffixes)

### Step 2: Commit a File  
- **Goal**: Add a file called `PROFILE.md` with content
- **Learning**: Understanding commits as saved changesets
- **Action**: Create `PROFILE.md` in the root with content: `Welcome to my GitHub profile!`
- **Commit Message**: `Add PROFILE.md`

### Step 3: Open a Pull Request
- **Goal**: Create a PR from `my-first-branch` to `main`
- **Learning**: Understanding pull requests as collaboration tools
- **Action**: Create a PR titled `Add my first file` with a description

### Step 4: Merge the Pull Request
- **Goal**: Merge the PR into main
- **Learning**: Understanding merging as integrating changes
- **Action**: Click "Merge pull request" and confirm

## How to Complete This Exercise

### Option A: Manual Completion (Recommended for Learning)

Follow the detailed instructions in [Issue #1](../../issues/1). Each step provides:
- Clear explanations of GitHub concepts
- Step-by-step instructions with screenshots
- Troubleshooting tips

**Why manual completion?** The educational value comes from performing these operations yourself through the GitHub UI, reinforcing muscle memory and understanding.

### Option B: Automated Completion

If you prefer to see the technical implementation or need to complete the exercise quickly, you can use Git commands:

```bash
# Step 1: Create and push the branch
git checkout -b my-first-branch
git push -u origin my-first-branch

# Step 2: Create the file and commit
echo "Welcome to my GitHub profile!" > PROFILE.md
git add PROFILE.md
git commit -m "Add PROFILE.md"
git push

# Step 3 & 4: Create and merge PR (requires GitHub CLI or web UI)
gh pr create --title "Add my first file" --body "Created branch, added file, and committed changes"
gh pr merge --merge
```

## Progress Tracking

The exercise uses GitHub Actions workflows to automatically detect when you complete each step:
- `.github/workflows/1-create-a-branch.yml` - Detects branch creation
- `.github/workflows/2-commit-a-file.yml` - Detects file commit
- `.github/workflows/3-open-a-pull-request.yml` - Detects PR creation
- `.github/workflows/4-merge-your-pull-request.yml` - Detects PR merge

Mona (the GitHub Actions bot) will post comments in Issue #1 with feedback and next steps as you progress.

## Additional Resources

- [GitHub Docs: About Branches](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-branches)
- [GitHub Docs: About Commits](https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/about-commits)
- [GitHub Docs: About Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- [GitHub Docs: Merging a Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request)

## Next Steps

Choose your approach:
1. **For learning**: Close this PR and follow the manual steps in Issue #1
2. **For automation**: I can help create the branch, file, and PR programmatically

Let me know which approach you'd prefer!
