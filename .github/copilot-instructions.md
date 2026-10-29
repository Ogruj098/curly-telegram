# Copilot Instructions

This file provides instructions for GitHub Copilot coding agent when working on this repository.

## Project Overview

This repository contains multiple components:

- **Rust Library** (`/src`): Anchor ID reference implementation for Solana
- **Node.js Backend** (`/backend`): Express API for VIN parts scanning and eBay integration
- **iOS Application** (`/ios`): SwiftUI app for VIN scanning and parts lookup

## Repository Structure

```
├── src/                    # Rust library source
├── backend/                # Node.js/Express backend
│   ├── src/                # Backend source code
│   └── tests/              # Backend tests
├── ios/                    # iOS SwiftUI application
│   └── VINPartsScanner/    # Xcode project
├── .github/                # GitHub configuration
│   ├── workflows/          # GitHub Actions workflows
│   ├── ISSUE_TEMPLATE/     # Issue templates
│   └── steps/              # Exercise step files
└── Cargo.toml              # Rust project configuration
```

## Build and Test Commands

### Rust

```bash
# Build the library
cargo build

# Run tests
cargo test

# Format code
cargo fmt

# Check for common mistakes
cargo clippy
```

### Node.js Backend

```bash
cd backend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### iOS

Open the `ios/VINPartsScanner` directory in Xcode 15+ and build/test using the built-in commands.

## Coding Standards

### General

- Write clear, descriptive commit messages
- Include relevant tests for new functionality
- Update documentation when making significant changes

### Rust

- Follow standard Rust conventions
- Run `cargo fmt` before committing
- Ensure `cargo clippy` passes without warnings
- All public items should have documentation comments

### JavaScript/Node.js

- Follow ESLint configuration (`.eslintrc.json`)
- Use async/await for asynchronous operations
- Write Jest tests for new functionality
- Use Express middleware patterns

### Swift/iOS

- Follow Swift naming conventions
- Use SwiftUI best practices
- Structure views with clear separation of concerns

## Pull Request Guidelines

- Keep changes focused and minimal
- Reference related issues in PR descriptions
- Ensure all tests pass before requesting review
- Update relevant documentation

## Security Considerations

- Never commit secrets or API keys
- Use environment variables for sensitive configuration
- Follow secure coding practices for authentication and authorization
- Validate all user inputs

## Additional Resources

- [Contributing Guidelines](../CONTRIBUTING.md)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Backend README](../backend/README.md)
- [iOS README](../ios/README.md)
