#!/bin/bash

echo "🚀 Deploying MCP Server JSXGraph..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run from project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check build
echo "🔍 Checking build..."
node check-build.js

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🌐 Starting server..."
    node server.js
else
    echo "❌ Build failed, starting simple server..."
    node simple-server.js
fi
