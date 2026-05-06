# TaskFlow – Team Task Manager

A full-stack collaborative task management web application built with React, Node.js, MongoDB, and deployed on Railway.

## 🌐 Live Demo
- **Frontend:** https://proactive-sparkle-production-6b8e.up.railway.app
- **Backend API:** https://taskflow-production-caf2.up.railway.app

## 📁 GitHub Repository
https://github.com/makarand7383/taskflow

## 🚀 Tech Stack
- **Frontend:** React 18, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (NoSQL)
- **Authentication:** JWT + bcryptjs
- **Deployment:** Railway

## ✅ Features
- User Signup / Login with JWT authentication
- Create and manage Projects (creator becomes Admin)
- Admin can add/remove members from projects
- Create tasks with Title, Description, Due Date, Priority
- Assign tasks to project members
- Update task status: To Do → In Progress → Done
- Kanban board view for tasks
- Dashboard with total tasks, status breakdown, overdue tasks
- Role-based access (Admin vs Member)

## 👥 Role-Based Access
| Feature | Admin | Member |
|---------|-------|--------|
| Create/delete project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ |
| View project tasks | ✅ | ✅ |

## 🔧 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Backend
```bash
cd backend
cp .env.example .env
# Add your MONGO_URI and JWT_SECRET in .env
npm install
npm run dev
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
# Create .env file with:
# REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start
# Runs on http://localhost:3000
```

## 🚂 Deployment on Railway

### Backend
1. Create new project on Railway → Deploy from GitHub
2. Set Root Directory to `backend`
3. Add environment variables:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = any secret key
   - `FRONTEND_URL` = your frontend Railway URL
   - `PORT` = 5000

### Frontend
1. Add new service → Deploy from GitHub
2. Set Root Directory to `frontend`
3. Set Build Command: `npm install && npm run build`
4. Add environment variable:
   - `REACT_APP_API_URL` = your backend Railway URL + /api
5. Generate domain → set port to 8080

## 📡 API Endpoints

### Auth
- `POST /api/auth/signup` – Register
- `POST /api/auth/login` – Login
- `GET /api/auth/me` – Get current user

### Projects
- `GET /api/projects` – Get my projects
- `POST /api/projects` – Create project
- `GET /api/projects/:id` – Get project
- `PATCH /api/projects/:id` – Update project
- `DELETE /api/projects/:id` – Delete project
- `POST /api/projects/:id/members` – Add member
- `DELETE /api/projects/:id/members/:userId` – Remove member

### Tasks
- `GET /api/tasks` – Get my tasks
- `GET /api/tasks?projectId=x` – Get project tasks
- `GET /api/tasks/dashboard` – Dashboard stats
- `POST /api/tasks` – Create task
- `PATCH /api/tasks/:id` – Update task
- `DELETE /api/tasks/:id` – Delete task
