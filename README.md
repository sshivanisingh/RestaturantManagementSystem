# 🍽️ BiteNest – Restaurant Management System

BiteNest is a full-stack **Restaurant Management System** designed to simplify and centralize restaurant operations. It provides dedicated functionality for **customers, restaurant owners, and delivery partners**, including online food ordering, menu management, inventory management, table reservations, payments, delivery operations, and restaurant analytics.

---

## 🚀 Live Project

🌐 **Frontend:** http://bitenest.vercel.app/

---

## 📌 Features

### 👤 Customer

- Browse restaurant menu and food categories
- View food-item details, images, prices, descriptions, and availability
- Add food items to the cart
- Update item quantities
- Remove items from the cart
- Checkout and place orders
- Cash on Delivery and online payment options
- Razorpay payment integration
- Automatic customer account creation during checkout
- Email-based account credentials
- Customer profile management
- Manage delivery addresses
- View order history
- Manage favourite/wishlist food items
- Password reset functionality
- Track order status
- Table reservation functionality

### 🏪 Restaurant Owner

- Secure restaurant-owner registration and login
- Centralized restaurant dashboard
- View total revenue and order statistics
- Monitor pending, confirmed, delivered, and cancelled orders
- Revenue and order analytics
- Manage food categories
- Add, update, and remove menu items
- Manage food-item availability
- Manage restaurant inventory
- Track stock quantities and stock history
- Monitor low-stock and reorder requirements
- Manage restaurant tables
- Manage customer reservations
- Manage customer orders
- Register delivery partners
- Assign orders to delivery partners
- Monitor delivery-partner availability
- View delivery statistics and performance

### 🚴 Delivery Partner

- Delivery partner account created by the restaurant owner
- Temporary login credentials sent through email
- Permanent password setup on first login
- Dedicated delivery portal
- View assigned orders
- Update delivery status
- Online/offline availability
- Location tracking
- View delivery activity
- Track deliveries, earnings, and ratings

---

## 💳 Payment Integration

BiteNest supports multiple payment methods:

- Cash on Delivery
- UPI
- Card
- Net Banking
- Wallet
- Razorpay

**Razorpay** is integrated for online payment processing.

---

## 🛠️ Technology Stack

### Frontend

- Next.js
- React
- Tailwind CSS
- Redux Toolkit
- TanStack React Query
- Axios
- React Hook Form
- Zod
- Recharts
- Chart.js
- Framer Motion
- Leaflet

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- REST APIs

### External Services

- **Razorpay** – Online payment processing
- **Cloudinary** – Image storage and management
- **Nodemailer / SMTP** – Email and OTP services
- **Google Maps Platform** – Maps, directions, geocoding, places, and location services
- **MongoDB Atlas** – Cloud database

### Deployment

- **Vercel** – Frontend deployment
- **Render / Node.js Hosting** – Backend deployment
- **MongoDB Atlas** – Database hosting

---

## 🔐 Authentication & Security

BiteNest implements multiple authentication and security mechanisms:

- JWT access tokens
- JWT refresh tokens
- Password hashing using bcrypt
- Role-based authorization
- Email verification
- OTP verification
- Password reset functionality
- Protected API routes
- CORS configuration
- Helmet security middleware
- Rate limiting
- MongoDB sanitization
- HTTP Parameter Pollution protection
- XSS protection
- Environment variables for sensitive credentials

---

## 🗄️ Database

BiteNest uses **MongoDB with Mongoose** for storing and managing application data.

### Main Database Entities

- User
- Restaurant
- Menu Category
- Menu Item
- Inventory
- Order
- Payment
- Delivery Partner
- Table
- Reservation
- OTP

### Main Relationships

```text
Restaurant
 ├── Menu Categories
 ├── Menu Items
 ├── Inventory
 ├── Orders
 ├── Tables
 └── Delivery Partners

User
 ├── Cart
 ├── Wishlist
 ├── Addresses
 └── Orders

Order
 ├── Payment
 ├── Customer
 └── Delivery Partner
```

---

## 🔄 Order Workflow

```text
Customer
    ↓
Browse Menu
    ↓
Select Food Items
    ↓
Add to Cart
    ↓
Checkout
    ↓
Enter Customer & Delivery Details
    ↓
Select Payment Method
    ↓
Place Order
    ↓
Restaurant Owner
    ↓
Confirm Order
    ↓
Assign Delivery Partner
    ↓
Delivery Partner
    ↓
Out for Delivery
    ↓
Delivered
```

---

## 👨‍🍳 Restaurant Management Workflow

```text
Restaurant Owner Login
        ↓
Owner Dashboard
        ↓
Menu Management
Category Management
Inventory Management
Order Management
Table Management
Reservation Management
Delivery Partner Management
Reports & Analytics
```

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Restaurant-Management-System
```

---

# 🔧 Backend Setup

Navigate to the backend directory:

```bash
cd BackEnd
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory.

### Backend Environment Variables

```env
# ─── Server ───────────────────────────────────────────────────────────────────
PORT
NODE_ENV

# ─── MongoDB ──────────────────────────────────────────────────────────────────
MONGODB_URI

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ORIGIN
CLIENT_URL

# ─── JWT Secrets ──────────────────────────────────────────────────────────────
ACCESS_TOKEN_SECRET
ACCESS_TOKEN_EXPIRY
REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRY

# ─── Cloudinary (Image Uploads) ───────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# ─── SMTP (Email / OTP / Order Confirmation) ─────────────────────────────────
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS

# ─── Application ──────────────────────────────────────────────────────────────
APP_NAME
LOG_LEVEL

# ─── Razorpay (Online Payments) ───────────────────────────────────────────────
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

> Add the actual values only in your local `.env` file. Do not commit the file to GitHub.

Start the backend development server:

```bash
npm run dev
```

Backend:

```text
http://localhost:8000
```

---

# 💻 Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd FrontEnd
```

Install dependencies:

```bash
npm install
```

Create the required frontend environment file according to your Next.js configuration.

### Frontend Environment Variables

```env
# ─── Backend API ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_BASE_URL

# ─── Restaurant ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_RESTAURANT_ID

# ─── Google Maps / Places ─────────────────────────────────────────────────────
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
GOOGLE_MAPS_API_KEY
MAP_API_KEY
```

### Google Maps APIs

The Google Maps configuration may require the following Google Cloud APIs:

1. Maps JavaScript API
2. Directions API
3. Geocoding API
4. Places API (New)

Google Cloud Console:

https://console.cloud.google.com

Start the frontend development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# 🔑 Environment Variables & Security

Environment variables are used to store configuration values and sensitive credentials required by BiteNest.

They include:

- MongoDB connection details
- JWT secrets
- Cloudinary credentials
- SMTP credentials
- Razorpay credentials
- Backend API URL
- Restaurant ID
- Google Maps API keys

**Never commit real credentials, API keys, database passwords, JWT secrets, or SMTP passwords to GitHub.**

Recommended `.gitignore` entries:

```gitignore
.env
.env.local
.env.development
.env.production
```

If a secret is accidentally exposed in a public repository, immediately revoke or rotate the affected credential.

---

# 🧪 Testing

BiteNest is tested across its major functional and non-functional areas.

### Functional Testing

- Customer authentication
- Restaurant-owner authentication
- Delivery-partner authentication
- Menu management
- Cart management
- Checkout
- Order placement
- Payment processing
- Inventory management
- Table management
- Reservations
- Delivery assignment
- Delivery-status updates
- Dashboard analytics

### Integration Testing

- Frontend and backend communication
- Backend and MongoDB integration
- Razorpay integration
- Cloudinary integration
- SMTP/email integration
- Google Maps integration

### Other Testing

- Acceptance Testing
- Regression Testing
- Performance Testing
- Usability Testing
- Reliability Testing
- Security Testing

---

# 📊 System Architecture

```text
                 ┌──────────────────────┐
                 │      Customers       │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │   Next.js / React    │
                 │      Frontend        │
                 └──────────┬───────────┘
                            │ REST APIs
                 ┌──────────▼───────────┐
                 │ Node.js / Express.js │
                 │       Backend        │
                 └──────┬───────┬───────┘
                        │       │
              ┌─────────▼─┐   ┌─▼──────────────────┐
              │ MongoDB   │   │ External Services   │
              │   Atlas   │   │ Razorpay            │
              │           │   │ Cloudinary           │
              └───────────┘   │ SMTP / Google Maps  │
                              └──────────────────────┘
```

---

# 👥 User Roles

| Role | Main Responsibilities |
|---|---|
| **Customer** | Browse food, manage cart, place orders, make payments, manage profile, and make reservations |
| **Restaurant Owner** | Manage menu, inventory, orders, reservations, tables, delivery partners, and analytics |
| **Delivery Partner** | View assigned orders, update delivery status, manage availability, and handle deliveries |

---

# 📱 Future Enhancements

Future versions of BiteNest can include:

- Dedicated Android and iOS applications
- Real-time delivery tracking
- AI-based food recommendations
- Advanced restaurant analytics
- Automated inventory reordering
- Customer loyalty and reward programs
- Promotional coupons and offers
- Advanced table allocation
- Waitlist management
- Multilingual support
- Push notifications
- Improved scalability and performance
- Advanced customer engagement features

---

# 📚 Project Documentation

The project documentation covers:

- Preliminary Investigation
- Feasibility Study
- System Analysis
- System Design
- ER Diagram
- Class Diagram
- Object Diagram
- Activity Diagram
- Sequence Diagram
- Use Case Diagram
- Component Diagram
- Deployment Diagram
- Database Design
- System Testing
- Gantt Charts
- Future Enhancements

---

# 🌐 Deployment

The BiteNest frontend is deployed using **Vercel**.

The backend can be deployed on a Node.js-compatible platform such as **Render**, with **MongoDB Atlas** used as the cloud database.

Before deployment:

1. Configure production environment variables.
2. Configure the production MongoDB connection.
3. Configure Razorpay production/test credentials.
4. Configure Cloudinary.
5. Configure SMTP/email services.
6. Configure Google Maps API keys and required APIs.
7. Update CORS settings with the deployed frontend domain.
8. Verify frontend-to-backend API communication.
9. Perform final system testing.

---

# 👨‍💻 Project Information

**Project Name:** BiteNest – Restaurant Management System

**Project Type:** Full-Stack Web Application

**Architecture:** Client–Server Architecture

**Frontend:** Next.js + React

**Backend:** Node.js + Express.js

**Database:** MongoDB

**Authentication:** JWT + bcrypt

**Payment Gateway:** Razorpay

**Image Storage:** Cloudinary

**Email Service:** SMTP / Nodemailer

**Maps & Location:** Google Maps Platform

**Deployment:** Vercel + Node.js Hosting + MongoDB Atlas

---

# 📄 License

This project was developed for **educational and academic purposes**.

---

# ⭐ Acknowledgement

BiteNest was developed as a full-stack restaurant management solution to demonstrate the practical implementation of modern web technologies, database management, REST APIs, authentication, payment integration, email services, cloud services, map services, and software engineering concepts.
