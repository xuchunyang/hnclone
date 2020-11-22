FROM node:lts
ENV NODE_ENV=production
ARG PORT=4813
ENV PORT=$PORT
EXPOSE $PORT

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .

CMD npm start
