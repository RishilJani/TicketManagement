# Ticket Management

A RESTful ticket management API built with Node.js, Express, and Supabase. It supports full ticket lifecycle management, comment threads, and role-based access control secured with JWT.

---

## Features

- 🎫 Create, view, update, and delete tickets
- 💬 Add and manage comments on tickets
-🔐 Role-based access control (RBAC) — different permissions per user role
- 🪙 JWT-based authentication for secure API access
- 🔑 Password hashing with bcrypt
- 🗄️ Supabase as the database management system

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/RishilJani/TicketManagement.git

# Navigate into the project directory
cd TicketManagement

# Install dependencies
npm install

# Start the server
npm start
```

The server will run at `http://localhost:3000` by default.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Security** | bcrypt |
| **Access Control** | Role-Based Access Control (RBAC) |


---

## API Reference

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET , POST, PUT, DELETE| `/tickets/` | CRUD of Tickets |
| GET , POST, PUT, DELETE| `/comments/` | CRUD of Comments |


---

## File Structure

```
└── 📁TicketManagement
    └── 📁routes
        ├── comments.js
        ├── login.js
        ├── tickets.js
        ├── users.js
    └── 📁utils
        ├── middlewares.js
        ├── utils.js
    ├── .env
    ├── .gitignore
    ├── db_pool.js
    ├── index.js
    ├── package-lock.json
    └── package.json
```

