# Changelog

All notable changes to this project will be documented in this file.

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