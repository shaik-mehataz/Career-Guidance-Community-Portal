# CareerCompass - Career Guidance Portal

A comprehensive career guidance platform built with React.js frontend and Node.js backend, featuring MongoDB integration for data persistence.

## 🚀 Project Structure

```
careercompass/
├── frontend/          # React.js frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js Express API server
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd careercompass
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` file with your MongoDB connection:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/careercompass
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service: `mongod`
3. Use connection string: `mongodb://localhost:27017/careercompass`

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string and update `.env`

#### Option C: MongoDB Compass (GUI)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to your local or cloud MongoDB
3. Create database: `careercompass`

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
Server will run on http://localhost:5000

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:5173

### Seed Database (Optional)
```bash
cd backend
npm run seed
```

## 🔐 Test Credentials

After seeding the database:
- **Student**: john@example.com / password123
- **Mentor**: jane@example.com / password123

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/save-resource/:id` - Save a resource
- `DELETE /api/users/save-resource/:id` - Unsave a resource
- `POST /api/users/view-resource/:id` - Track resource view
- `GET /api/users/activity` - Get user activity

## 🌟 Features

- **User Authentication** - JWT-based secure authentication
- **Profile Management** - Complete user profile system
- **Resource Library** - Career development resources
- **Activity Tracking** - User activity monitoring
- **Responsive Design** - Mobile-first approach
- **Real-time Updates** - Dynamic data updates
- **MongoDB Integration** - Full database connectivity

## 🧪 Testing the API

Use tools like Postman or Thunder Client to test API endpoints:

```bash
# Login example
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

## 📁 Key Files

### Backend
- `backend/server.js` - Main server file
- `backend/models/User.js` - User model
- `backend/routes/auth.js` - Authentication routes
- `backend/middleware/auth.js` - JWT middleware

### Frontend
- `frontend/src/services/api.js` - API service layer
- `frontend/src/context/AuthContext.jsx` - Authentication context
- `frontend/src/pages/dashboard/DashboardPage.jsx` - User dashboard

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use MongoDB Atlas for production database
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3

