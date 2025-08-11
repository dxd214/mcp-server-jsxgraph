# MCP Server JSXGraph  ![](https://badge.mcpx.dev?type=server 'MCP Server')

A Model Context Protocol server for generating mathematical visualizations using [JSXGraph](https://jsxgraph.org/). This MCP server provides interactive mathematical chart generation capabilities for functions, geometry, parametric curves, and educational mathematics.

This is a TypeScript-based MCP server that provides mathematical visualization capabilities. It allows you to create various types of mathematical charts and diagrams through MCP tools, perfect for educational mathematics, engineering, and scientific applications.

## 📋 Table of Contents

- [✨ Features](#-features)
- [🤖 Usage](#-usage)
- [🚰 Run with SSE or Streamable transport](#-run-with-sse-or-streamable-transport)
- [🎮 CLI Options](#-cli-options)
- [⚙️ Environment Variables](#%EF%B8%8F-environment-variables)
- [🔨 Development](#-development)
- [📄 License](#-license)

## ✨ Features

12 mathematical visualization tools powered by JSXGraph for interactive mathematical graphics.

### Mathematical Visualization Charts (JSXGraph)

1. `generate_function_graph`: Generate mathematical function graphs with support for derivatives, integrals, tangent lines, and multiple functions.
2. `generate_parametric_curve`: Generate parametric curves like circles, Lissajous curves, spirals, and cycloids with optional animated traces.
3. `generate_geometry_diagram`: Create interactive geometry diagrams with points, lines, circles, polygons, angles, and geometric constructions.
4. `generate_vector_field`: Visualize 2D vector fields with arrows, streamlines, singular points, and magnitude color coding.
5. `generate_linear_system`: Visualize systems of linear equations and inequalities with feasible regions and linear programming optimization.
6. `generate_function_transformation`: Show function transformations including translations, scaling, reflections, and compositions with animation.
7. `generate_quadratic_analysis`: Comprehensive quadratic function analysis with vertex, roots, axis of symmetry, focus, and directrix.
8. `generate_exponential_logarithm`: Plot exponential and logarithmic functions with asymptotes, growth/decay analysis, and inverse relationships.
9. `generate_rational_function`: Visualize rational and irrational functions with asymptotes, holes, domain restrictions, and critical points.
10. `generate_equation_system`: Solve and visualize linear and nonlinear equation systems with numerical solutions and phase portraits.
11. `generate_conic_section`: Generate conic sections (circles, ellipses, parabolas, hyperbolas) and high-degree polynomials with geometric properties.
12. `generate_polynomial_steps`: Interactive step-by-step polynomial analysis with roots, derivatives, and graphical representations.

## 🤖 Usage

To use with `Desktop APP`, such as Claude, VSCode, [Cline](https://cline.bot/mcp-marketplace), Cherry Studio, Cursor, and so on, add the MCP server config below. On Mac system:

```json
{
  "mcpServers": {
    "mcp-server-jsxgraph": {
      "command": "npx",
      "args": [
        "-y",
        "@antv/mcp-server-jsxgraph"
      ]
    }
  }
}
```

On Window system:

```json
{
  "mcpServers": {
    "mcp-server-jsxgraph": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@antv/mcp-server-jsxgraph"
      ]
    }
  }
}
```

## 🚰 Run with SSE or Streamable transport

### Run directly

Install the package globally.

```bash
npm install -g @antv/mcp-server-jsxgraph
```

Run the server with your preferred transport option:

```bash
# For SSE transport (default endpoint: /sse)
mcp-server-jsxgraph --transport sse

# For Streamable transport with custom endpoint
mcp-server-jsxgraph --transport streamable
```

Then you can access the server at:

- SSE transport: `http://localhost:1122/sse`
- Streamable transport: `http://localhost:1122/mcp`

### Docker deploy

Enter the docker directory.

```bash
cd docker
```

Deploy using docker-compose.

```bash
docker compose up -d
```

Then you can access the server at:

- SSE transport: `http://localhost:1123/sse`
- Streamable transport: `http://localhost:1122/mcp`

## 🎮 CLI Options

You can also use the following CLI options when running the MCP server. Command options by run cli with `-h`.

```plain
MCP Server JSXGraph CLI

Options:
  --transport, -t  Specify the transport protocol: "stdio", "sse", or "streamable" (default: "stdio")
  --port, -p       Specify the port for SSE or streamable transport (default: 1122)
  --endpoint, -e   Specify the endpoint for the transport:
                   - For SSE: default is "/sse"
                   - For streamable: default is "/mcp"
  --help, -h       Show this help message
```

## ⚙️ Environment Variables

| Variable | Description | Default | Example |
|----------|:------------|---------|---------|
| `DISABLED_TOOLS` | Comma-separated list of tool names to disable | - | `generate_function_graph,generate_parametric_curve` |

### 🎛️ Tool Filtering

You can disable specific mathematical visualization tools using the `DISABLED_TOOLS` environment variable. This is useful when certain tools have compatibility issues with your MCP client or when you want to limit the available functionality.

```json
{
  "mcpServers": {
    "mcp-server-jsxgraph": {
      "command": "npx",
      "args": [
        "-y",
        "@antv/mcp-server-jsxgraph"
      ],
      "env": {
        "DISABLED_TOOLS": "generate_function_graph,generate_parametric_curve"
      }
    }
  }
}
```

**Available tool names for filtering:**
- `generate_function_graph`
- `generate_parametric_curve`
- `generate_geometry_diagram`
- `generate_vector_field`
- `generate_linear_system`
- `generate_function_transformation`
- `generate_quadratic_analysis`
- `generate_exponential_logarithm`
- `generate_rational_function`
- `generate_equation_system`
- `generate_conic_section`
- `generate_polynomial_steps`

## 🔨 Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

Start the MCP server:

```bash
npm run start
```

## 📄 License

MIT@[dxd214](https://github.com/dxd214).