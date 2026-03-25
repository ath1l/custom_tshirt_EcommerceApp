# CustoMe — Custom T-Shirt Ecommerce App

CustoMe is a full-stack ecommerce platform for customizable apparel. It combines a React-based storefront with a Node.js + Express backend, allowing users to browse products, design apparel with an interactive editor, place orders, and complete payments through Razorpay.

## Project Highlights

- **Interactive product customization** with text/image placement on apparel mockups.
- **Dual-side design support** (front and back) with preview generation.
- **Cart and direct checkout flows** with quantity support.
- **Secure authentication** using local credentials and Google OAuth.
- **Role-based admin tooling** for products, categories, and order management.
- **Razorpay payment integration** with backend signature verification.

## Architecture Overview

This repository is organized into two applications:

- **`frontend/`**: React + Vite single-page application.
- **`backend/`**: Express API server with MongoDB models and business logic.

The frontend communicates with the backend over HTTP (`http://localhost:3000` by default), while the backend persists data in MongoDB (`tshirt-store`).

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Fabric.js (customization canvas)
- react-rnd (drag/resize interactions)

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- Passport (local + Google OAuth)
- Express Session
- Razorpay SDK

## Core Features

### Customer Experience
- User registration/login/logout.
- Google sign-in support.
- Product catalog and product detail pages.
- Product customization workflow.
- Add-to-cart and cart checkout.
- Order tracking and profile pages.

### Admin Experience
- Add/edit/delete products.
- Manage product stock status.
- Create/manage categories.
- View and manage placed orders.

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB running locally on `mongodb://localhost:27017`

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd custom_tshirt_EcommerceApp
```

### 2) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3) Configure environment variables (Backend)

Create a `.env` file inside `backend/` with the following keys:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

> Note: CORS and OAuth redirects are currently configured for `http://localhost:5173` in development.

### 4) Start the backend

```bash
cd backend
node app.js
```

Backend runs at: **`http://localhost:3000`**

### 5) Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: **`http://localhost:5173`**

## Available Scripts

### Frontend (`frontend/package.json`)
- `npm run dev` — Start Vite dev server.
- `npm run build` — Build production bundle.
- `npm run lint` — Run ESLint.
- `npm run preview` — Preview production build.

### Backend (`backend/package.json`)
- `npm run seed:products` — Seed products.

## Repository Structure

```text
custom_tshirt_EcommerceApp/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   └── app.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   └── public/
└── README.md
```

## Authors

### Backend
- Athil Johnson
- Ancil Sabu

### Frontend
- Aman Mohammed Faizal
- Naazim V N