FROM node:20 as builder

WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM node:20-alpine as runner
WORKDIR /app
COPY package*.json ./
RUN npm i --only production --ignore-scripts

COPY --from=builder /usr/app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

CMD [ "node", "./dist/src/main.js" ]
