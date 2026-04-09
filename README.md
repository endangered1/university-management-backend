# University Management Backend API

A structured backend system for managing university operations, built with Node.js, Express, and MongoDB.  

This project focuses on secure authentication, role-based access control, and admin-driven workflows such as enrollment approval systems.

---

## Overview

This backend simulates a real-world university management system where users can register, request enrollment, and administrators control approvals through a structured workflow.

It is designed to demonstrate backend architecture, authentication systems, and business logic implementation beyond basic CRUD operations.

---

## Key Features

### Authentication & Security
- JWT-based authentication
- Secure route protection
- Password hashing and validation

### Role-Based Access Control (RBAC)
- Admin and User roles
- Middleware-based authorization
- Restricted access to sensitive operations

### Enrollment Workflow (Core Feature)
- Users submit enrollment requests
- Admin reviews and approves/rejects requests
- Status tracking: `pending`, `approved`, `rejected`

### Backend Architecture
- Modular structure (routes, models, middleware)
- Centralized error handling
- Request validation middleware
- Clean and maintainable codebase

---

## Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose)  
- **Authentication:** JSON Web Tokens (JWT)  
- **Tools:** Postman, Git, GitHub  

---

## Project Structure


config/ # Database & configuration setup
middleware/ # Authentication & authorization
models/ # Mongoose schemas
routes/ # API routes
index.js # Application entry point


---

## API Overview

### Auth Routes

- `POST /api/auth/register` → Register a new user  
- `POST /api/auth/login` → Login and receive JWT  

---

### Enrollment Routes

- `POST /api/enrollment/request` → Submit enrollment request  
- `PATCH /api/enrollment/approve/:id` → Approve request (Admin)  
- `PATCH /api/enrollment/reject/:id` → Reject request (Admin)  

---

### Protected Routes

All protected routes require:

```bash
Authorization: Bearer <JWT_TOKEN>
Getting Started
1. Clone the Repository
git clone https://github.com/endangered1/university-management-backend.git
cd university-management-backend
2. Install Dependencies
npm install
3. Setup Environment Variables

Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
4. Run the Server
npm start

Server runs on:

http://localhost:5000
Key Learning Outcomes
Implemented secure JWT authentication flow
Designed role-based access control system
Built real-world approval workflow logic
Structured scalable backend architecture
Future Improvements
Add pagination & filtering
Implement rate limiting
Add unit and integration tests
Introduce logging and monitoring
Purpose

This project demonstrates the ability to build a backend system with:

Secure authentication
Role-based authorization
Real-world business logic workflows
Clean and maintainable architecture
