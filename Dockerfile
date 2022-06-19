FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install -g nodemon
RUN npm install

COPY . .
EXPOSE $PORT

ENTRYPOINT ["nodemon", "/app/src/index.js"]