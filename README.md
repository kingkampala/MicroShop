# MicroShop: Scalable E-commerce API
MicroShop is an e-commerce platform built using a scalable microservices architecture, designed for performance optimization and enhanced security. Each microservice handles specific functionalities such as user authentication, product catalog management, order processing, and more. This project showcases best practices in Node.js backend development, microservices design, and deployment automation using Docker and Kubernetes.

# Key Features
**User Authentication & Authorization** :

 * Secure JWT-based authentication.
 * Password hashing using bcrypt for user security.

**Product Management**:

 * Full CRUD operations for products.
 * Pagination, filtering, and searching functionality.

**Order Management**:

 * Order creation and tracking.

**Microservice Architecture**:

 * Independent services for users, products, and orders, each with its own data store.

**API Security**:

 * Input validation using middleware.
 * Protection against common vulnerabilities (XSS, SQL Injection).
 * API rate limiting using Redis.

**Performance Optimization**:

 * Caching frequently requested data using Redis.
 * Asynchronous operations with Node.js's event-driven architecture.

# Tech Stack Overview
**Core Technologies**
* **Node.js**: JavaScript runtime for building the server-side application.
* **Express.js**: Minimalist web framework used for building API routes and handling requests.
* **MongoDB**: NoSQL database used for storing user, product, and order data.
* **Redis**: In-memory data structure store used for caching, API rate limiting, and session management.
* **Nodemailer**: Email service used for sending notifications like registration and logging notification emails.
* **JWT (JSON Web Tokens)**: Token-based authentication for securing user sessions.
* **Docker**: Containerization tool for running microservices independently.
* **Kubernetes**: Container orchestration platform for managing and scaling microservices.
* **PM2 (optional)**: Proxy for load balancing and serving the API.

**DevOps & Deployment**
* **Docker**: Used for containerizing the application to ensure consistent environments across development and production.
* **Kubernetes**: Manages microservices in production, scaling as needed.
* **CI/CD Pipelines**: Integration with tools like GitHub Actions for automated testing and deployments.

**Testing & Quality Assurance**
* **Jest**: Unit and integration tests to ensure the API functions as expected.
* **Supertest**: Testing HTTP requests/responses.
* **CI/CD Integration**: Automated testing as part of the deployment pipeline.

# System Architecture
MicroShop follows a microservice architecture, which ensures modularity, scalability, and ease of maintenance. Each service is independent, making scaling or modifying any service easier without affecting the others.

**Microservices Overview**:
* **User Service**: Manages CRUD operations for users.
* **Product Service**: Handles CRUD operations for products, search, and filtering.
* **Order Service**: Manages creating and processing of orders.
* **Email Notification Service**: Sends emails using Nodemailer for user logging, user registration, etc.

# Setup & Installation
**Prerequisites**
* **Node.js** (v14.x or later)
* **MongoDB** (local instance or MongoDB Atlas)
* **Redis** (local instance or cloud provider)
* **Docker** (for running microservices)
* **Kubernetes** (optional for production deployment)

**Step-by-Step Guide**

1. **Clone the Repository**:
```
git clone https://github.com/kingkampala/microshop.git
cd microshop
```
2. **Install Dependencies**:
```
npm install
```
3. **Set Up Environment Variables**: Create a `.env` and `.env.test` file respectively in the root directory and fill it with the necessary configuration:
```
PORT=3000
NODE_ENV=development
MONGO_URL=your_main_mongo_url
JWT_SECRET=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
EMAIL=your_email
EMAIL_PASSWORD=your_email_password
```
```
PORT=3000
NODE_ENV=test
MONGO_URI=your_test_mongo_url
JWT_SECRET=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
```
4. **Run the Application**: Start the services individually or use Docker Compose;
```
npm start
```
# Or run with Docker Compose
```
docker-compose up
```
5. **Running in Kubernetes**: For production, deploy the microservices using Kubernetes. Ensure you have k8s YAML configuration files for deployment and service management.

6. **Testing the API**: Run unit tests for each service;
```
npm test
```

# API Documentation
The API is built with REST principles. Here's a sample of the key endpoints.

**Authentication**
```
Method      Endpoint	          Description
POST	      /user/register	    Register a new user
POST	      /user/login	        Authenticate and get JWT token
PATCH	      /user/:id/reset	    Reset user password (authenticated)
GET	        /user/	            Get all users (admin only)
GET	        /user/:id	          Get details of a specific user
PUT	        /user/:id	          Update a user (authenticated)
DELETE	    /user/:id	          Delete a user (admin only)
```
**Product Management**
```
Method      Endpoint	          Description
GET	        /product	          Get all products
POST	      /product	          Create a new product (admin only)
GET	        /product/:id	      Get details of a specific product
PUT	        /product/:id	      Update a product (admin only)
DELETE	    /product/:id	      Delete a product (admin only)
```
**Order Management**
```
Method      Endpoint            Description
POST	      /order	            Create a new order
GET	        /order	            Get all orders (authenticated)
GET	        /order/:id	        Get details of a specific order
PUT	        /order/:id	        Update order (authenticated)
PUT	        /order/:id/stats	  Update order stats (admin only)
PATCH	      /order/:id	        Cancel an order (authenticated)
DELETE	    /order/:id	        Delete an order (admin only)
```
**Search Functionality**
```
Method      Endpoint	          Description
GET	    /search/user?query=	    Search users by query
GET	    /search/product?query=	Search products by query
```
# Contribution Guidelines
We welcome contributions to MicroShop, Explore our codebase and contribute to building a robust, scalable e-commerce solution! Here's how you can contribute:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push the branch (`git push origin feature-branch`).
5. Open a pull request.

# License
This project is licensed under the MIT License. See the **LICENSE** file for details.

[![Node.js CI](https://github.com/kingkampala/MicroShop/actions/workflows/ci.yml/badge.svg)](https://github.com/kingkampala/MicroShop/actions/workflows/ci.yml)
