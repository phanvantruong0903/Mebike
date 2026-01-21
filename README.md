# Mebike

![NestJS](https://img.shields.io/badge/NestJS-v11.x-red?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-blue?logo=typescript)
![Nx](https://img.shields.io/badge/Nx-v21.5-1ca2f1?logo=nx)
![Prisma](https://img.shields.io/badge/Prisma-v5.22-2d3748?logo=prisma)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white)
![Apollo](https://img.shields.io/badge/Apollo%20GraphQL-311C87?logo=apollo-graphql&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?logo=apache-kafka&logoColor=white)
![Consul](https://img.shields.io/badge/HashiCorp_Consul-F24C53?logo=consul&logoColor=white)
![Traefik](https://img.shields.io/badge/Traefik-24292E?logo=traefik&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)

**Mebike** is a microservices-based application built with [Nx](https://nx.dev), [NestJS](https://nestjs.com/), and [Docker](https://www.docker.com/). It uses a modern tech stack to ensure scalability and maintainability.

## 🚀 Tech Stack

- **Monorepo Tool**: [Nx](https://nx.dev)
- **Backend Framework**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) & [MySQL](https://www.mysql.com/)
- **Caching**: [Redis](https://redis.io/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Service Discovery**: [Consul](https://www.consul.io/)
- **Reverse Proxy**: [Traefik](https://traefik.io/)
- **Containerization**: Docker & Docker Compose
- **CI/CD**: [GitHub Actions](https://github.com/features/actions)

## 🏗 Architecture

The project consists of the following main services:

- **API Gateway (Custom NestJS)**: A custom-built gateway service using NestJS. It acts as the single entry point for client requests, handling routing, request aggregation, and authentication guards before forwarding traffic to internal microservices.
- **Auth Service**: Handles user authentication and authorization (JWT, Passport).
- **User Service**: Manages user profiles and data.
- **Fleet Service**: Manages inventory (Bike, Station, Supplier).
- **Rental Service**: Manages rental transactions and bookings (Rent, Reservation).
- **Membership Service**: Manages user subscriptions and membership packages.
- **Incident Service**: Handles incident reporting and SOS requests from users.
- **Notification Service**: Manages email notifications and communication with users.
- **Payment Service**: Integrates with VNPAY payment gateway and handles wallet transactions.
- **Consul**: Used for service discovery and configuration management.
- **Traefik**: Acts as the edge router and load balancer.
- **Kafka**: Message broker for asynchronous communication between services.
- **Redis**: Caching layer for improved performance.

## 🛠 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)

## 🏁 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Mebike
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

> **Note:** Update the `.env` file with your specific database credentials and other secrets.

### 4. Start Infrastructure (Docker)

**For Development Environment:**

Start the databases, Consul, Traefik, Kafka, and Redis using Docker Compose:

```bash
docker-compose -f docker-compose.dev.yaml up -d --build
```

**For Production/Server Environment:**

```bash
docker-compose -f docker-compose.yaml up -d --build
```

> **Note:** The development environment (`docker-compose.dev.yaml`) is optimized for local development with exposed ports and debugging capabilities.

### 5. Run Applications

You can run the microservices locally using Nx:

```bash
# Start the API Gateway
npx nx serve api-gateway

# Start the Auth Service
npx nx serve auth-service

# Start the User Service
npx nx serve user-service

# Start the Fleet Service
npx nx serve fleet-service

# Start the Rental Service
npx nx serve rental-service

# Start the Membership Service
npx nx serve membership-service

# Start the Incident Service
npx nx serve incident-service

# Start the Notification Service
npx nx serve notification-service

# Start the Payment Service
npx nx serve payment-service
```

## 📦 Build

To build the project for production:

```bash
npx nx build auth-service
npx nx build user-service
npx nx build fleet-service
npx nx build rental-service
npx nx build membership-service
npx nx build incident-service
npx nx build notification-service
npx nx build payment-service
```

## 🧪 Testing

Run unit tests:

```bash
npx nx test auth-service
npx nx test user-service
npx nx test fleet-service
npx nx test rental-service
npx nx test membership-service
npx nx test incident-service
npx nx test payment-service
```

## 📂 Project Structure

```
Mebike/
├── apps/                     # Application services
│   ├── api-gateway/          # API Gateway service
│   ├── auth-service/         # Authentication service
│   ├── user-service/         # User management service
│   ├── fleet-service/        # Inventory (Bike, Station, Supplier)
│   ├── rental-service/       # Rental management service (Rent, Reservation)
│   ├── membership-service/   # Membership management service (Subscription, Package)
│   ├── incident-service/     # Incident management service (Sos, Report)
│   ├── notification-service/ # Notification service (Email)
│   └── payment-service/      # Payment service (VNPAY Gateway, Mebike payment service)
├── common/                   # Shared libraries and modules
├── docker-compose.yaml       # Docker infrastructure config
├── nx.json                   # Nx configuration
└── package.json              # Project dependencies
```

## 📄 License

This project is licensed under the MIT License.
