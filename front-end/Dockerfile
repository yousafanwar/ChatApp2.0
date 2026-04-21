FROM node:20 as builder
WORKDIR /app
ARG VITE_API_BASE_URL=http://yousaf.ddns.net/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY . .
RUN npm install
RUN npm run build

FROM node:20
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist /app/dist
CMD [ "serve", "-s", "dist", "-l", "5173" ]
