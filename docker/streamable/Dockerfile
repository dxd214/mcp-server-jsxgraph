# Use Node.js 16 as the base image
FROM node:16

# Set workdir
WORKDIR /app

# Global install of @dxd/mcp-server-chart
RUN npm install -g @dxd/mcp-server-chart

# Start the server (using streamable for transmission)
CMD ["mcp-server-chart", "--transport", "streamable", "--port", "1122"]