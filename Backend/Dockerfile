# 1. Choose base image (Node runtime + Linux)
FROM node:18

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy only package files first
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy rest of the backend code
COPY . .

# 6. Tell Docker which port the app uses
EXPOSE 5000

# 7. Command to start the Express app
CMD ["node", "index.js"]
