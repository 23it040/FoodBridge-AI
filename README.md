# 🍲 FoodBridge AI - Intelligent Food Waste Redistribution Platform

FoodBridge AI is an end-to-end web application and AI system designed to bridge the gap between food donors (restaurants, events, individuals) and recipients (NGOs, shelters, community kitchens) to reduce food waste and optimize food redistribution.

---

## 🌟 Architecture & Project Structure

```
FoodBridge-AI/
├── frontend/           # React + Vite + Tailwind CSS User Interface
├── backend/            # Node.js + Express + MongoDB Core REST API Server
├── server/             # Production REST API Server with Swagger Documentation
├── ai-service/         # Python + FastAPI Machine Learning & Optimization Engine
├── data/               # Project Data & Models
├── README.md           # Project Documentation
└── package.json        # Root package configuration
```

---

## ✨ Features

- 📦 **Food Donation & Claiming Workflow**: Donors post surplus food details; NGOs can claim items in real time.
- 🧠 **AI-Powered Demand & Risk Modeling**: Predicts food decay risk, priority matching score, and demand distribution using ML algorithms.
- 🗺️ **Geographic Matching & Logistics**: Locates nearby NGOs and calculates optimized delivery/pickup routes.
- 📊 **Real-time Analytics Dashboard**: Tracks total food saved, meals distributed, and active requests.
- 🔐 **Multi-Role Authentication**: Role-based access control for Admins, Donors, and NGO Partners.

---

## 🚀 Quick Start Guide

### 1. Backend Service (Node.js API)
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2. Frontend Application (React + Vite)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 3. AI Service (Python + FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn ai_service.main:app --reload --port 8000
```

---

## 🔑 Demo & Testing Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `23it030@charusat.edu.in` | `Admin123!` |
| **NGO Partner** | `23it040@charusat.edu.in` | `12345678` |
| **Donor** | `23it046@charusat.edu.in` | `12345678` |
| **User / Donor** | `varmijivani5291@gmail.com` | `12345678` |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Leaflet Maps, React Router
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Cloudinary
- **AI/ML Service**: Python, FastAPI, Scikit-Learn, Pandas, NumPy, Pydantic

---

## 📄 License
This project is developed for educational and social impact purposes.
