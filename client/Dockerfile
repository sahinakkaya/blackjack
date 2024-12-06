# Use the official Node.js image with Alpine Linux
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN yarn build

# Expose the port the app runs on (optional)
EXPOSE 3000

# Define the command to run the app
CMD ["yarn", "start"]
