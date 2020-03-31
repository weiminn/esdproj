# base image
FROM node:12.16.1-alpine3.9

# application folder
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

#copy req.txt to pwd of the docker
COPY package.json ./

USER node

# execute into the image
RUN npm install

RUN mkdir tmp

COPY --chown=node:node . .

# copy code into pwd of docker image
COPY ./index.js .

# execute inside the image
CMD [ "node", "./index.js" ]
