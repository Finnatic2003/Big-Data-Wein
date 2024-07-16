FROM node:slim
# Set node environment, either development or production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR  /app

COPY package.json /app/

RUN npm install 

COPY ./server.js ./resources/* /app/

ENV port=3000

EXPOSE 3000

CMD ["node", "server.js"]
