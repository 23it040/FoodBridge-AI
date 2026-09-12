# 🍲 FoodBridge AI - Intelligent Food Waste Redistribution Platform

> FoodBridge AI is a MERN-stack web application and AI matching engine designed to connect food donors (restaurants, events, individuals) with NGOs and community kitchens to optimize food waste redistribution and combat local food insecurity.

---

## 🌟 Overview

FoodBridge AI bridges the gap between surplus food generators and verified social organizations. Donors can list extra food items along with pickup details and food photos, while nearby NGOs can discover available donations on an interactive map, submit pickup requests, and track request outcomes. An integrated Python FastAPI microservice provides predictive analytics for food demand, food safety decay risk, and donation priority scoring.

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Role-Based Access Control**: Separate workflows and dashboard permissions for **Donors**, **NGO Partners**, and **Admins**.
- **Secure Authentication**: Password hashing using `bcrypt` and stateless JWT authorization (`Bearer` tokens).
- **Password Recovery**: Secure password reset flow using time-limited hashed reset tokens.

### 📦 Donor Features
- **Post Surplus Food**: List cooked meals, dairy, bakery items, or grains with quantity, pickup address, GPS coordinates, and expiry dates.
- **Real Image Upload**: Attach authentic food photos saved to local disk storage (`/uploads/`) or Cloudinary.
- **Manage Donations**: Track active donations, review incoming NGO requests, and accept or reject requests in real time.

### 🤝 NGO Features
- **Geographic Discovery**: Discover nearby available food donations rendered on an interactive Leaflet map using OpenStreetMap.
- **Submit Requests**: Submit food pickup requests with estimated beneficiary counts, contact information, and preferred pickup times.
- **Historical Records**: Review finalized request logs filtered by `ALL`, `ACCEPTED`, and `REJECTED`.

### 🧠 AI Redistribution Engine (FastAPI Service)
- **Demand Forecasting**: Predicts expected local meal demand based on historical donation patterns.
- **Food Safety Risk Assessment**: Evaluates food safety grade and risk level for perishable categories.
- **Donation Priority Scoring**: Calculates priority scores to match urgent donations with nearby high-need recipients.
- **Route Optimization**: Computes optimal pickup and delivery routing using Geopy & distance matrix algorithms.

---

## 🔄 Request Lifecycle & Workflow

FoodBridge AI enforces a clean, decision-driven request lifecycle:

```text
                  DONOR
                    │
            Create Food Donation
                    │
                   NGO
                    │
           Browse Nearby Food
                    │
          Send Pickup Request (PENDING)
                    │
         ┌──────────┴──────────┐
         ↓                     ↓
     ACCEPTED               REJECTED
 (Donation Claimed)   (Request Declined)
```

- **`PENDING`**: Request submitted by NGO, awaiting donor decision.
- **`ACCEPTED`**: Request approved by donor; donation status updated to claimed.
- **`REJECTED`**: Request declined by donor.
- **Historical Records**: The NGO Request History page displays records that have received a final decision (`ACCEPTED` or `REJECTED`).

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19, Vite 5
- **Styling**: Tailwind CSS 3, PostCSS, Autoprefixer
- **Routing**: React Router DOM 6
- **Mapping**: Leaflet.js 1.9, React-Leaflet, OpenStreetMap
- **State & Forms**: React Hook Form, React Context API
- **UI Components**: React Icons, React Hot Toast, Recharts 2
- **HTTP Client**: Axios (with custom multipart FormData interceptor)

### Backend API
- **Runtime**: Node.js (>= 18.0.0), Express.js 4
- **Database**: MongoDB, Mongoose 7 ORM
- **Security**: Helmet, CORS, JWT (`jsonwebtoken`), `bcrypt`
- **File Uploads**: Multer (memory storage & local disk persistence)
- **Logging & Utils**: Morgan, Streamifier, Cloudinary SDK

### AI / ML Microservice
- **Framework**: Python 3.12+, FastAPI, Uvicorn
- **Machine Learning**: Scikit-Learn, Pandas, NumPy, Joblib
- **Geospatial & HTTP**: Geopy, HTTPX, Pydantic v2

---

## 📁 Project Structure

```text
FoodBridge-AI/
├── frontend/                   # React 19 + Vite User Interface
│   ├── src/
│   │   ├── components/         # Common UI, Card, Modal, LeafletMap, Charts, AI badges
│   │   ├── context/            # AuthContext (user session management)
│   │   ├── pages/              # Donor, NGO, Admin, Auth, and AI pages
│   │   ├── services/           # Axios API services (donation, request, auth, ai)
│   │   ├── utils/              # Image URL resolver & helper functions
│   │   └── routes/             # AppRoutes, ProtectedRoute, RoleRoute
│   ├── package.json
│   └── vite.config.js
│
├── backend/                    # Node.js + Express REST API
│   ├── config/                 # MongoDB database & Cloudinary connections
│   ├── controllers/            # Route controllers (food, request, user, admin, ai)
│   ├── middleware/             # Auth, Multer upload, Validation, Error handler
│   ├── models/                 # Mongoose models (User, FoodDonation, FoodRequest, etc.)
│   ├── routes/                 # Express API routes
│   ├── services/               # Business logic & AI HTTP integration
│   ├── uploads/                # Local disk storage for donor-uploaded images
│   ├── server.js               # Server entry point
│   └── package.json
│
├── ai-service/                 # Python FastAPI ML Engine
│   ├── ai_service/
│   │   ├── app/                # FastAPI application & route endpoints
│   │   ├── saved_models/       # Trained ML joblib binaries
│   │   └── training/           # Model training scripts
│   └── requirements.txt
│
├── data/                       # Local MongoDB data directory (`db/`)
└── README.md                   # Root Project Documentation
```

---

## 🔑 Environment Variables

### Backend Configuration (`backend/.env`)
```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/foodbridge

JWT_SECRET=your-super-secret-access-key
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://127.0.0.1:8000
BCRYPT_SALT_ROUNDS=12
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_APP_NAME=FoodBridge AI
```

### AI Service Configuration (`ai-service/.env`)
```env
PORT=8000
MODEL_DIR=./saved_models
DEFAULT_SPEED_KMPH=30
```

> **Security Note**: Never commit actual production API keys or credentials to public repositories.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI
- **Python**: `3.12+` (for AI Service)

---

### Step 1: Start MongoDB
Ensure your local MongoDB daemon is running:
```bash
mongod --dbpath "./data/db" --bind_ip 127.0.0.1
```

---

### Step 2: Start Backend API
```bash
cd backend
npm install
npm run dev
```
Backend will run on **http://localhost:5000**.

---

### Step 3: Start AI Microservice
```bash
cd ai-service
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn ai_service.app.main:app --host 127.0.0.1 --port 8000
```
AI Service will run on **http://127.0.0.1:8000**.

---

### Step 4: Start Frontend UI
```bash
cd frontend
npm install
npm run dev
```
Frontend application will run on **http://localhost:5173**.

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `23it030@charusat.edu.in` | `Admin123!` |
| **NGO Partner** | `23it040@charusat.edu.in` | `12345678` |
| **Donor** | `23it046@charusat.edu.in` | `12345678` |
| **User / Donor** | `varmijivani5291@gmail.com` | `12345678` |

---

## 📡 API Reference Summary

### Authentication Routes (`/api/auth` or `/api/v1/auth`)
- `POST /register`: Register a new donor or user account.
- `POST /login`: Authenticate user & return JWT token.
- `POST /forgot-password`: Request password reset token.
- `POST /reset-password`: Reset password using valid reset token.

### Food Donation Routes (`/api/food` or `/api/v1/food`)
- `POST /`: Create a new food donation (supports `multipart/form-data` with `foodImage`).
- `GET /`: List food donations (with search, category, and status filters).
- `GET /:id`: Get specific food donation details.
- `PUT /:id`: Update food donation listing.
- `DELETE /:id`: Delete food donation listing.

### Food Request Routes (`/api/requests` or `/api/v1/requests`)
- `POST /`: Submit a new food pickup request (NGO only).
- `GET /`: List requests associated with the authenticated user.
- `GET /:id`: Fetch specific request details.
- `PUT /:id/status`: Update request status (`ACCEPTED`, `REJECTED`).

### NGO Routes (`/api/ngo` or `/api/v1/ngo`)
- `GET /nearby`: Search nearby food donations using spatial query & OpenStreetMap Overpass API.
- `GET /dashboard`: Fetch NGO summary metrics & status breakdown.
- `GET /history`: Fetch accepted and rejected request history.

### AI Integration Routes (`/api/ai` or `/api/v1/ai`)
- `POST /predict-demand`: Fetch predicted meal demand.
- `POST /risk-score`: Fetch food decay risk assessment.
- `POST /priority-score`: Calculate priority matching score.
- `POST /recommend-ngos`: Rank nearby NGO candidates.
- `POST /optimize-route`: Compute route coordinates and distance matrix.

---

## 🧪 Testing & Verification

### Build Verification
Verify frontend build compilation:
```bash
cd frontend
npm run build
```

### Manual Testing Checklist
- [x] **User Auth**: Register, login, logout, password reset flow.
- [x] **Donor Posting**: Post donation with real food photo upload.
- [x] **Image Persistence**: Verify uploaded file is saved in `backend/uploads/` and served via static route.
- [x] **NGO Discovery**: View nearby donations on Leaflet map.
- [x] **Request Handling**: NGO submits pickup request; Donor/NGO updates status (`ACCEPTED` / `REJECTED`).
- [x] **Historical Records**: Verify Request History filters (`ALL`, `ACCEPTED`, `REJECTED`) display accurate MongoDB records.

---

## 🛡️ Security Measures Implemented
- Password hashing using `bcrypt` (salt rounds: 12).
- Stateless authorization using JSON Web Tokens (JWT).
- Role-based route authorization (`RoleRoute`) protecting API endpoints and frontend views.
- Security HTTP headers enabled via `helmet`.
- Sanitized file upload storage with collision-safe filenames (`donation-<timestamp>-<random>.<ext>`).

---

## 📄 License
This project is developed for educational, social impact, and open research purposes.
