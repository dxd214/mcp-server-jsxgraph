#!/bin/bash

echo "🚀 Starting MCP Server JSXGraph..."
echo "=================================="

# Check Node.js version
echo "Node.js version:"
node --version

echo "Current directory:"
pwd

echo "Environment variables:"
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"

echo "=================================="

# Start the server
echo "🌟 Starting standalone server..."
exec node standalone.js
