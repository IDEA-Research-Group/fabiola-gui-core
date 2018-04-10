# Image to inherit. It's build on a Debian image, installing the Node version 8.11.1
FROM node:carbon

# Set workdir
WORKDIR /usr/src/app

# Copy the package.json and install all dependencies
COPY package.json ./
RUN npm install

# Install bower and gulp
RUN npm install -g bower && npm install -g gulp

# Copy the whole project except the directories specified in .dockerignore
COPY . .

# Install docker dependencies and compile the frontend using gulp
RUN cd ./public && bower install --allow-root && gulp build && cd ..

ENV PORT=49160

EXPOSE 8080
EXPOSE 80

CMD [ "npm", "start" ]