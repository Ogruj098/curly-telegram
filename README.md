# Introduction to GitHub

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey @Ogruj098!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/Ogruj098/skills-introduction-to-github/issues/1)

## About This Repository

This repository includes a Rust implementation demonstrating Anchor ID reference functionality from the Solana Anchor framework. See [ANCHOR_REFERENCE.md](ANCHOR_REFERENCE.md) for technical details.

## VIN Parts Scanner

This repository also includes a complete VIN Parts Scanner solution with:

### iOS Application (`/ios`)

A SwiftUI-based iOS application for scanning and analyzing vehicle parts:

- **VIN Scanning**: Manual input or camera-based scanning using Vision framework
- **Parts Lookup**: Get OEM parts list for any vehicle by VIN
- **eBay Integration**: View average prices and listing counts
- **Smart Recommendations**: TAKE/CHECK/DON'T TAKE based on inventory and pricing
- **History**: Track previous scan results

See [iOS README](ios/README.md) for setup instructions.

### Backend API (`/backend`)

Node.js/Express backend providing:

- **VIN Processing**: Validate and decode VINs, retrieve parts lists
- **eBay API Integration**: Search for parts, get pricing data
- **Inventory Management**: Track local inventory, import/export CSV
- **Recommendation Engine**: Intelligent part recommendations
- **Caching**: Configurable caching for eBay results
- **JWT Authentication**: Secure API access

See [Backend README](backend/README.md) for setup instructions.

### Quick Start

```bash
# Start the backend
cd backend
npm install
cp .env.example .env  # Configure your settings
npm run dev

# Open iOS app in Xcode
open ios/VINPartsScanner.xcodeproj
```

## GitHub Copilot & Workflow Automation

Interested in understanding how GitHub Copilot works and how to automate tasks with GitHub Actions? Check out our comprehensive guides:

- **[Understanding GitHub Copilot](GITHUB_COPILOT.md)** - Learn what GitHub Copilot can and cannot do, and how to use it effectively
- **[Demo Automation Workflow](.github/workflows/demo-automation.yml)** - Example workflow showing automated task execution and progress reporting

## Contributing

Found a bug or have a suggestion? Check out our [Contributing Guidelines](CONTRIBUTING.md) to learn how to report issues and contribute to this project.

When creating an issue, please use our issue templates to provide all necessary information.

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

