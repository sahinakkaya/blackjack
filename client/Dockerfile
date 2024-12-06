# Use the official Node.js image with Alpine Linux
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./


ARG REACT_APP_SOCKET_URL
ENV REACT_APP_SOCKET_URL=$REACT_APP_SOCKET_URL
# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN yarn build

# Install `serve` globally to serve static files
RUN yarn global add serve

# Expose the port the app runs on (default for serve is 3000)
EXPOSE 3000

# Command to serve the production build
CMD ["serve", "-s", "build"]
