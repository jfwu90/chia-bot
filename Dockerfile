FROM node:14.16-alpine

COPY . .
RUN npm install
USER node
CMD ["node", "index.js"]
