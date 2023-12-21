# Use the official Node.js 16 base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that your application is running on
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
