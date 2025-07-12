FROM node:20 as builder
WORKDIR /app
COPY . .
RUN npm install 
RUN npm run build

FROM node:20
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist /app/dist
CMD [ "serve", "-s", "dist", "-l", "5173" ]
