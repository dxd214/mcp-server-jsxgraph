# Changelog

All notable changes to this project will be documented in this file.

## [0.1.2] - 2024-08-15

### Documentation
- **BREAKING FIX**: Fixed critical package name inconsistency in README (`@dxd/mcp-server-jsxgraph` → `mcp-server-jsxgraph`)
- **BREAKING FIX**: Fixed Docker port mapping documentation to match actual docker-compose.yml configuration
- Added comprehensive "Transport & Connection Matrix" with single source of truth for all deployment scenarios
- Added "Quick Reference" section with minimal working configurations for immediate use
- Added "Compatibility & Stability Promise" section with Never Break Userspace commitment
- Fixed spelling error: "Window system" → "Windows system"
- Restructured usage section with cross-platform configuration recommendations
- Added version badge and NPM package identifier at top of README

### Quality Improvements
- Eliminated documentation inconsistencies that could cause user integration failures
- Established single source of truth for package name, ports, and endpoints
- Added browser-verifiable SSE self-test instructions
- Improved new user onboarding with copy-paste ready configurations

### Stability Commitment
- Formalized API stability promise for CLI parameters, transport endpoints, and package naming
- Committed to 2-3 version deprecation periods before breaking changes
- Established clear versioning and compatibility policies

## [0.1.1] - 2024-08-14

### Features
- Added comprehensive test suite with integration tests for all JSXGraph tools
- Enhanced system architecture documentation with detailed diagrams

## [0.1.0] - 2024-08-14

### Added
- **New Tool**: `generate_number_line_inequality` - Visualize inequalities on number lines with comprehensive support for:
  - Simple inequalities: `x > 2`, `x <= -1`, `x >= 3`, `x < 0`
  - Compound inequalities: `1 < x < 4`, `-2 <= x <= 0`
  - Multiple inequalities on the same number line
  - Customizable colors, stroke width, and endpoint styling
  - Inclusive/exclusive endpoint visualization (filled/hollow circles)
  - Configurable tick marks and number labels
  - Interactive zoom and pan controls

### Technical Improvements
- Added number line inequality to callTool function mapping
- Implemented intelligent inequality expression parsing with regex
- Added comprehensive JSXGraph code generation for number line visualizations
- Enhanced code generator with number line-specific rendering logic
- Updated API tests to include new tool in the tool registry

### Documentation
- Updated README.md to reflect 13 total tools (up from 12)
- Added detailed description of number line inequality features
- Created comprehensive changelog documentation

## [0.0.1] - 2024-08-13

### Initial Release
- First release with 12 mathematical visualization tools
- JSXGraph-powered interactive mathematical graphics
- Support for functions, geometry, parametric curves, vector fields, and more
- Model Context Protocol (MCP) server implementation
- TypeScript-based with comprehensive type definitions