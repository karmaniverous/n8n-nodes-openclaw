FROM node:lts

# Install openclaw and n8n globally
RUN npm install -g openclaw n8n

# Install a community plugin for discovery testing
RUN npx openclaw plugins install @openclaw/voice-call || true

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Build the node
RUN npm run build
