# Agrowise Advisor

An AI-powered smart agriculture platform that helps farmers with soil analysis, crop recommendations, disease detection, weather intelligence, voice advisory, and market prices.

## Technologies Used

| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Backend | Node.js |
| Machine Learning | TensorFlow |
| API Framework | FastAPI |
| Development Environment | Visual Studio Code |
| Android App Build | Android Studio |
| Version Control | GitHub |

## Architecture

```
Mobile App (React)
  → Backend Server (Node.js)
    → ML API Service (FastAPI)
      → AI Model (TensorFlow)
```

## Features

- Soil Type Classification (AI image analysis)
- Crop Recommendation (ML model)
- Crop Disease Detection (TensorFlow)
- Weather Intelligence (AI forecast)
- Voice Advisory (NLP)
- Market Prices (live data)
- Smart Farm Dashboard

## Getting Started

### Prerequisites

- Node.js & npm
- Python 3.9+
- Android Studio (for APK build)

### Installation

```sh
# Clone the repository
git clone https://github.com/sec23cb041-hash/agrowise-advisor.git
cd agrowise-advisor

# Install frontend and backend dependencies
npm install
cd backend && npm install && cd ..

# Install ML service dependencies
cd ml_service && pip install -r requirements.txt && cd ..
```

### Running Locally

```sh
# Start all services at once
npm run dev:all
```

This starts:
- Frontend (React) → http://localhost:5173
- Backend (Node.js) → http://localhost:3000
- ML Service (FastAPI) → http://localhost:8000

Or start individually:

```sh
# Frontend
npm run dev

# Backend
cd backend && npm run start

# ML Service
cd ml_service && py -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Train ML Models

```sh
cd ml_service
python train_crop_model.py
python train_weather_model.py
```

> ML model files (`.pkl`, `.h5`) are excluded from git — run train scripts after cloning.

## Android APK Build

1. Install Android Studio from https://developer.android.com/studio
2. Run `setup_android_env.bat` as Administrator
3. Run `build-android.bat`
4. In Android Studio: `Build → Build APK(s)`
5. APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

## Project Structure

```
agrowise-advisor/
├── src/              # React frontend
├── backend/          # Node.js backend server
├── ml_service/       # FastAPI + TensorFlow ML service
├── android/          # Capacitor Android project
├── datasets/         # Training image datasets
└── training/         # Model training scripts
```
