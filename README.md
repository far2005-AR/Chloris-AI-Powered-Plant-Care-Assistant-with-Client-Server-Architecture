# Chloris-AI-Powered-Plant-Care-Assistant-with-Client-Server-Architecture
# 🌱 Chloris - Your Green Companion

AI-powered plant care assistant with client-server architecture.
---

## 📁 Project Structure
├── frontend/ # HTML, CSS, JS (client-side UI)
├── backend/ # Node.js + Express server (API)
└── README.md

---

## How to Run the Frontend

1. Navigate to the frontend folder:
   cd frontend

2. Open `index.html` in your browser (or use Live Server in VS Code)

---

## How to Run the Backend

1. Navigate to the backend folder:
   cd backend

2. Install dependencies:
   npm install

3. Create a `.env` file with:
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key

4. Start the server:
   node server.js

5. The API will be available at: `http://localhost:5001`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create a new user |
| POST | `/api/auth/login` | Log in a user |
| POST | `/api/identify` | Identify a plant from an image |
| GET | `/api/garden` | Get user's saved plants |
| POST | `/api/garden` | Add a plant to user's garden |
| GET | `/api/recommendations` | Get AI plant recommendations |

---

## Our Team

- **Fatimah Abdul Razik (220283727)** — Backend & Frontend
- **Kofoworola Oladipupo (220152062)** — AI Integration
- **Karim Karam (220473211)** — Database Creation and AI 

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **AI:** Plant.id API / TensorFlow (coming soon)

---

## Course

AP/ITEC 4020 — Internet Client-Server Systems
Summer 2026
