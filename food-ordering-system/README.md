# Food Ordering System Microservices

A complete MVP-level microservices-based backend for a Food Ordering System, built with Node.js (Express), MongoDB, and an API Gateway.

## Architecture
- **API Gateway (Port 3000):** Single entry point to access the microservices.
- **User Service (Port 3001):** User registration, login (JWT), and profile retrieval.
- **Restaurant/Menu Service (Port 3002):** Manage restaurants and menus.
- **Order Service (Port 3003):** Create orders, view orders by user, and update status.
- **Payment Service (Port 3004):** Process payments for orders.

Each microservice runs independently with its own separate MongoDB database. Swagger UI is set up for each individual microservice.

## Prerequisites
- **Node.js**: v14+ recommended
- **MongoDB**: A running instance on `mongodb://localhost:27017`

## Setup & Running

You need to install dependencies and start each service independently. You can open multiple terminal windows/tabs, one for each service.

### 1. API Gateway
```bash
cd api-gateway
npm install
npm start
# Gateway runs on http://localhost:3000
```

### 2. User Service
```bash
cd user-service
npm install
npm start
# Runs on http://localhost:3001
# DB: mongodb://localhost:27017/user-db
# Swagger: http://localhost:3001/api-docs
```

### 3. Restaurant Service
```bash
cd restaurant-service
npm install
npm start
# Runs on http://localhost:3002
# DB: mongodb://localhost:27017/restaurant-db
# Swagger: http://localhost:3002/api-docs
```

### 4. Order Service
```bash
cd order-service
npm install
npm start
# Runs on http://localhost:3003
# DB: mongodb://localhost:27017/order-db
# Swagger: http://localhost:3003/api-docs
```

### 5. Payment Service
```bash
cd payment-service
npm install
npm start
# Runs on http://localhost:3004
# DB: mongodb://localhost:27017/payment-db
# Swagger: http://localhost:3004/api-docs
```

## API Testing

You can either directly test via the API Gateway (`http://localhost:3000/api/...`) using tools like Postman, or use the Swagger interfaces provided by each microservice directly.

### Examples using Gateway:
- **Register User:** `POST http://localhost:3000/api/users/register`
- **Login User:** `POST http://localhost:3000/api/users/login`
- **Add Restaurant:** `POST http://localhost:3000/api/restaurants`
- **Get Restaurants:** `GET http://localhost:3000/api/restaurants`
- **Add Menu:** `POST http://localhost:3000/api/menu`
- **Create Order:** `POST http://localhost:3000/api/orders`
- **Process Payment:** `POST http://localhost:3000/api/payments`

The Gateway automatically routes `/api/users` -> `http://localhost:3001/users`, etc.

## Additional Note
A `.env` file is generated inside each service's folder automatically, so the ports are preconfigured to NOT conflict with each other. Ensure you do not change these ports unless you also update the API Gateway routing configurations.
