# Ticket Management

A simple and efficient ticket management system built with Node.js and Express.

---

## Features

- Create, read, update, and delete tickets
- Manage and track task status
- Role based access using JWT
- RESTful API for easy integration
- Lightweight and easy to set up

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

## API Reference

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | Get all tickets |
| GET | `/api/tickets/:id` | Get a ticket by ID |
| POST | `/api/tickets` | Create a new ticket |
| PUT | `/api/tickets/:id` | Update a ticket |
| DELETE | `/api/tickets/:id` | Delete a ticket |

