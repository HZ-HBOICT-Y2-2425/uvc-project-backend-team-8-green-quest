# Use the official Node.js image as the base
FROM node:16-alpine
 
# Set the working directory inside the container
WORKDIR /usr/src/app
 
# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./
 
# Install dependencies (using npm ci for clean install in CI/CD)
RUN npm install --omit=dev
 
# Copy the application code to the container
COPY . .
 
# Expose the port your application listens on (Render uses 3000 by default)
EXPOSE 3000
 
# Define environment variable for Render (use the same port as Render expects)
ENV PORT=3000
 
# Start the application
CMD ["npm", "start"]