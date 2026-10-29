# Copilot Instructions for skills-introduction-to-github

## Repository Overview
This is a GitHub Skills exercise repository designed to teach users the basics of GitHub through hands-on, automated exercises. The repository uses GitHub Actions workflows to guide learners through a series of steps.

## Repository Structure
- `.github/workflows/`: Contains GitHub Actions workflows that validate learner progress and provide automated feedback
- `.github/steps/`: Contains markdown files with step-by-step instructions for each exercise
- `README.md`: Main repository documentation and entry point for learners

## Key Concepts
1. **Exercise Flow**: This repository implements a self-paced learning experience where workflows are triggered by learner actions
2. **Step-based Learning**: Exercises are broken into numbered steps (0-4), each with its own workflow and instruction file
3. **Automated Validation**: Workflows automatically check if learners complete tasks correctly and provide feedback via GitHub issues
4. **Progressive Enablement**: Workflows are enabled/disabled automatically as learners progress through steps

## Workflow Patterns
- Each step has a corresponding workflow file named `{step-number}-{step-name}.yml`
- Workflows use the `skills/exercise-toolkit` reusable workflows and actions
- Workflows post feedback to GitHub issues to guide learners
- Common workflow structure includes:
  - Finding the exercise issue
  - Checking the learner's work
  - Posting next step content
  - Enabling/disabling workflows

## Development Guidelines
When modifying this repository:

1. **Preserve Learning Experience**: Any changes should maintain the self-paced, automated learning flow
2. **Workflow Dependencies**: Be careful when modifying workflows as they depend on the exercise-toolkit repository
3. **Step Files**: Instruction files in `.github/steps/` should be clear, beginner-friendly, and include screenshots when helpful
4. **Branch Names**: Some workflows are triggered by specific branch names (e.g., `my-first-branch`)
5. **Minimal Changes**: This is an educational template - keep changes minimal and focused on the learning objectives

## Testing Considerations
- Workflows are triggered by repository events (push, branch creation, etc.)
- Manual testing requires creating branches and following the exercise steps
- Workflow permissions are carefully scoped for security

## External Dependencies
- `skills/exercise-toolkit`: Provides reusable workflows and markdown templates
- Uses standard GitHub Actions like `actions/checkout@v4`

## File Naming Conventions
- Workflow files: `{step-number}-{kebab-case-description}.yml`
- Step instruction files: `{step-number}-{kebab-case-description}.md`
- All step numbers are zero-indexed

## Important Notes
- This repository is designed to be templated for learners
- The `main` branch should remain stable and functional
- Changes should be tested thoroughly to ensure the learning experience isn't disrupted
