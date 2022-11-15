FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Copy app code source from our local folder into the docker /usr/src/app working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app code sour /package.json
COPY . .

# Expose app on a given port
EXPOSE 3000

# Start app
CMD node server.js