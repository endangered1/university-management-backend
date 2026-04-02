#  University Management Backend API

A structured backend system for managing university operations, built with Node.js, Express, and MongoDB. This project focuses on secure authentication, role-based access control, and admin-driven workflows.

---

##  Features

###  Authentication & Security
- JWT-based authentication
- Secure route protection
- Password handling with best practices

###  Role-Based Access Control (RBAC)
- Admin and User roles
- Controlled access to sensitive operations
- Middleware-based authorization checks

###  Enrollment Workflow
- Admin-controlled student enrollment approval
- Request-based system for managing admissions
- Status tracking (pending, approved, rejected)

###  Backend Architecture
- Modular structure (routes, models, middleware)
- Centralized error handling
- Request validation middleware
- Clean and maintainable codebase

---

##  Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose)  
- **Authentication:** JSON Web Tokens (JWT)  
- **Tools:** Postman, Git, GitHub  

---

##  Project Structure
├── config/ # Database & configuration setup
├── middleware/ # Auth, validation, error handling
├── models/ # Mongoose schemas
├── routes/ # API routes
├── index.js # Entry point

---

## 🔌 API Overview

### Auth Routes
- `POST /api/auth/register` → Register new user  
- `POST /api/auth/login` → Login and receive JWT  

### Enrollment Routes
- `POST /api/enrollment/request` → Submit enrollment request  
- `PATCH /api/enrollment/approve/:id` → Admin approves request  
- `PATCH /api/enrollment/reject/:id` → Admin rejects request  

### Protected Routes
- Require JWT token in headers:

Authorization: Bearer <token>


---

##  Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Allaudin7/university-management-backend.git
cd university-management-backend

### 2. Install Dependencies
npm install

3. Setup Environment Variables
Create a .env file in the root directory:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

4. Run the Server
npm start

Server runs on:
http://localhost:5000
