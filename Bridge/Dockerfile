FROM node:lts-alpine

# Permissions & packages
WORKDIR /usr/src/app
RUN mkdir sources
RUN chown -R node:node /usr/src/app
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm install pm2@latest -g
RUN pm2 update
USER node
RUN npm install --omit=dev && npm cache clean --force
COPY --chown=node:node . .

EXPOSE 3000
CMD [ "pm2-docker", "main.js", "-i", "max" ]
