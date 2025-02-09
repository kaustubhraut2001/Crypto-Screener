# Use an official Node.js runtime as a parent image
FROM node:23-alpine3.20

# Set the working directory
WORKDIR /app

# Install git
RUN apk add --no-cache git

# Copy the package.json and package-lock.json (if available)
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Command to run the application
CMD ["npm", "start"]
