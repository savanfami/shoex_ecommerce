FROM node:alpine
WORKDIR /ecommerce
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3300
CMD [ "npm","start" ]

