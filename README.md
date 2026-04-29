# ChatApp2.0

A full-stack real-time chat application built with a React frontend and Node.js microservices for authentication, user management, and messaging.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Socket.IO client
- Backend: Node.js, Express, Socket.IO, JWT, bcrypt
- Database: MongoDB (separate databases per service)
- Containerization: Docker and Docker Compose

## Project Structure

```text
ChatApp2.0/
|- front-end/        # React + Vite client
|- auth-service/     # Auth APIs (register, login, token verification)
|- user-service/     # User profile, contacts, groups APIs
|- chat-service/     # Socket.IO + chat message APIs
`- docker-compose.yml
```

## Features

- User registration and login
- JWT-based authentication
- Protected routes in the frontend
- 1:1 real-time messaging with Socket.IO
- Group chat support
- Contact management
- Profile update (name, email, avatar)
- Image and video message attachments

## Services and Ports

- Frontend: `5173`
- Chat service: `5000`
- User service: `5001`
- Auth service: `5002`
- MongoDB: `27017` (inside Docker network)

## API Overview

### Auth Service (`/auth`)

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/authenticate`
- `POST /auth/refresh-token`
- `POST /auth/logout`

### User Service (`/user`)

- `PUT /user/updateUser/:id`
- `GET /user/getAllUsers/:loggesInUser`
- `POST /user/addToMyContactList`
- `GET /user/getMyContacts/:id`
- `GET /user/getIndividualUser/:id`
- `POST /user/createGroup`
- `GET /user/getGroups/:id`
- `PUT /user/updateGroup`
- `GET /user/getAllGroupMembers/:id`

### Chat Service (`/chat`)

- `POST /chat/getAllMessages`
- `POST /chat/createNewMessage`

### Socket.IO Events

- Client to server: `register`, `fetchChat`, `message`
- Server to client: `chatHistory`, `message`

## Prerequisites

- Node.js 20+
- npm 9+
- Docker and Docker Compose (for containerized setup)

## Environment Variables

Create `.env` files for backend services:

### `auth-service/.env`

```env
PORT=5002
privateKey=your_jwt_secret
refreshPrivateKey=your_refresh_jwt_secret
saltRounds=10
accessTokenExpiry=15m
refreshTokenExpiry=7d
refreshTokenSaltRounds=10
ALLOWED_ORIGINS=http://localhost:5173
```

### `user-service/.env`

```env
PORT=5001
ALLOWED_ORIGINS=http://localhost:5173
```

### `chat-service/.env`

```env
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173
```

Note: `privateKey`, `refreshPrivateKey`, and `saltRounds` are required by auth logic (JWT signing and token/password hashing).

## Run Locally (without Docker)

### 1) Install dependencies

```bash
cd auth-service && npm install
cd ../user-service && npm install
cd ../chat-service && npm install
cd ../front-end && npm install
```

### 2) Start backend services (separate terminals)

```bash
cd auth-service && node index.js
cd user-service && node index.js
cd chat-service && node index.js
```

### 3) Start frontend

```bash
cd front-end && npm run dev
```

Open: `http://localhost:5173`

## Run with Docker Compose

Before starting, ensure the external network exists:

```bash
docker network create npm_network
```

Then run:

```bash
docker compose up --build
```

## Frontend API Configuration

The frontend uses `VITE_API_BASE_URL`:

- In local dev, it defaults to `/api` and Vite proxies to local services.
- In production or container builds, set a full URL (for example `https://your-domain/api`).

## Development Notes

- Backend services connect to MongoDB using service name `mongo` in Docker.
- CORS uses `ALLOWED_ORIGINS` (comma-separated).
- Auth middleware in `user-service` validates JWT by calling `auth-service`.
- `chat-service` also calls `user-service` to resolve sender details for messages.

## Known Gaps and Improvements

- Add proper npm scripts (`start`, `dev`) to backend services.
- Add health-check endpoints for each service.
- Move DB URIs and service hostnames to environment variables.
- Add automated tests (unit, integration, e2e).
- Add rate limiting and stronger input validation.