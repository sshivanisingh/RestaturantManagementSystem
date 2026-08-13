# Restaurant Management System

Full-stack restaurant management app — Next.js frontend + Express backend.

---

## Project Structure

```
Resturent-Manegement/
├── FrontEnd/      # Next.js 15 (React, TypeScript, Tailwind)
└── BackEnd/       # Express.js (Node.js, MongoDB, Mongoose)
```

---

## Prerequisites

- Node.js v18+
- npm v9+
- MongoDB Atlas account (free tier works)
- Google Cloud account (for Maps & Places)
- Cloudinary account (for image uploads)
- Razorpay account (for online payments)

---

## Setup Steps

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Resturent-Manegement.git
cd Resturent-Manegement
```

### 2. Setup Backend

```bash
cd BackEnd
npm install
cp .env.example .env
```

Edit `.env` and fill in all values (see comments inside the file).

```bash
npm run dev
# Server runs on http://localhost:8000
```

### 3. Setup Frontend

```bash
cd FrontEnd
npm install
cp .env.example .env
```

Edit `.env` and fill in all values (see below for Google Maps setup).

```bash
npm run dev
# App runs on http://localhost:3000
```

---

## Google Cloud Platform — Required APIs

All APIs are in one project. Follow these steps once:

### Step 1 — Create / Open a GCP Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Note your **Project ID** (shown in the top bar)

### Step 2 — Create an API Key

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → API Key**
3. Copy the key → paste it in `FrontEnd/.env` as `NEXT_PUBLIC_GOOGLE_MAPS_KEY`
4. (Optional but recommended) Click **Edit API Key** → restrict to your domain

### Step 3 — Enable the following 4 APIs

Go to **APIs & Services → Library** and search + enable each one:

| # | API Name | Used For |
|---|----------|----------|
| 1 | **Maps JavaScript API** | Delivery boy live map & route display |
| 2 | **Directions API** | Turn-by-turn route calculation on delivery map |
| 3 | **Geocoding API** | Convert coordinates ↔ addresses |
| 4 | **Places API (New)** | Address autocomplete in checkout form |

> **How to enable:** Search the API name → Click on it → Click blue **"Enable"** button → Wait ~2 minutes

---

## Environment Variables Reference

### FrontEnd `.env`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL (default: `http://localhost:8000/api/v1`) |
| `NEXT_PUBLIC_RESTAURANT_ID` | Your restaurant's MongoDB `_id` |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | GCP API key (needs 4 APIs enabled above) |

### BackEnd `.env`

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 8000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `ACCESS_TOKEN_SECRET` | Any long random string for JWT |
| `REFRESH_TOKEN_SECRET` | Any long random string for JWT |
| `CLOUDINARY_CLOUD_NAME` | From cloudinary.com dashboard |
| `CLOUDINARY_API_KEY` | From cloudinary.com dashboard |
| `CLOUDINARY_API_SECRET` | From cloudinary.com dashboard |
| `SMTP_USER` | Gmail address for sending emails |
| `SMTP_PASS` | Gmail App Password (16 chars, not your login password) |
| `RAZORPAY_KEY_ID` | From razorpay.com → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | From razorpay.com → Settings → API Keys |

---

## Getting `NEXT_PUBLIC_RESTAURANT_ID`

1. Start the backend
2. Open MongoDB Atlas or Compass
3. Go to your database → `restaurants` collection
4. Copy the `_id` value of your restaurant document
5. Paste into `FrontEnd/.env` as `NEXT_PUBLIC_RESTAURANT_ID`

---

## Gmail App Password (for SMTP)

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (required)
3. Search **"App Passwords"** → Select app: Mail → Select device: Other
4. Copy the 16-character password → paste as `SMTP_PASS`

---

## Running Both Servers

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd BackEnd && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd FrontEnd && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
