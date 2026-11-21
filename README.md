# 🛒 NovaMart — Modern Full-Stack E-Commerce Web Application

NovaMart is a fast, full-featured e-commerce web platform engineered with **pure Node.js** and **native SQLite** (`node:sqlite`). It has **zero third-party runtime npm package dependencies**, which means it runs instantly out of the box with 100% reliability and zero build step.

---

## ✨ Features

### 🛍️ Storefront & Shopping Experience
- **Interactive Product Catalog**: High-performance responsive grid with 12 curated products across 5 categories (Audio, Wearables, Electronics, Home & Office, Accessories).
- **Search & Real-Time Filtering**: Instant keyword search, category pill filter, price range slider ($30 – $600), and in-stock toggling.
- **Dynamic Sorting**: Featured picks, Price (low-to-high & high-to-low), Highest rated, and New arrivals.
- **Interactive Product Modal**: Detailed specs checklist, high-res vector visuals, real-time stock indicator, customer reviews, and a review submission form.
- **Wishlist System**: Persistent favorite items saved to `localStorage`.

### 🛒 Cart & Checkout
- **Slide-out Cart Drawer**:
  - Quantity steppers (`+` / `−`), quick delete, and line total updates.
  - **Free Shipping Progress Tracker**: Visual bar updating in real time towards the $100 free shipping goal.
  - **Promo Coupon System**: Working validation for codes like `SAVE20`, `SAVE10`, `WELCOME15`, and `FREESHIP`.
  - Automatic 8% tax calculation and order summary.
- **Seamless Checkout**:
  - Customer shipping form with validation.
  - Multi-payment selector (Card with secure test simulation, Digital / UPI, Cash on Delivery).
  - Real-time stock decrement and database order placement.

### 📦 Order Tracking & Receipts
- **Printable Order Receipt**: Itemized receipt table, discount summary, and order details.
- **Live Shipment Tracker**: Lookup any order by ID (e.g., `ORD-123456`) to view its current phase (`Processing` → `Shipped` → `Out for Delivery` → `Delivered`).

### ⚙️ Store Management (Admin Dashboard)
- **Live Metrics**: Gross sales revenue, total orders counter, low stock alert counter, active catalog products.
- **Recent Orders Table**: Review all placed orders with customer email, payment method, order total, and live order status dropdown updater.

---

## 🚀 How to Run the Website

### Prerequisites
- Node.js v22 or higher (Node v26+ includes built-in `node:sqlite`).

### Quick Start
1. Open terminal in the project directory:
   ```bash
   cd c:\Users\HARIHARAN\e-commerce
   ```

2. Start the server:
   ```bash
   node server.js
   ```
   *(or `npm start`)*

3. Open your browser:
   ```
   http://localhost:3000
   ```

---

## 🎟️ Available Promo Codes for Testing

| Promo Code | Benefit | Minimum Order |
|------------|---------|---------------|
| `SAVE20` | **20% Off** your entire order | $100 |
| `SAVE10` | **10% Off** your order | $50 |
| `WELCOME15` | **15% Off** for new shoppers | $30 |
| `FREESHIP` | **100% Free Express Shipping** | $25 |

---

## 📂 Project Architecture

```
e-commerce/
├── server.js              # Native Node.js HTTP server, REST API router & SQLite DB setup
├── store.db               # SQLite database file (created automatically with seed data)
├── package.json           # Project manifest and scripts
├── generate_assets.js     # Script that created the 12 SVG product illustrations
├── public/
│   ├── index.html         # Semantic HTML5 single-page application layout
│   ├── css/
│   │   └── style.css      # Custom modern CSS design system with animations & dark theme
│   ├── js/
│   │   └── app.js         # Reactive frontend store, cart, checkout & admin controller
│   └── images/            # Crisp SVG illustrations for all products
└── README.md              # Project documentation
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Query products with `category`, `search`, `minPrice`, `maxPrice`, `sort` |
| `GET` | `/api/products/:id` | Get single product, related items, and reviews |
| `GET` | `/api/categories` | Get category list with counts |
| `POST` | `/api/coupon/validate` | Validate coupon code and get discount rate |
| `POST` | `/api/orders` | Place new order, decrement stock, and generate receipt |
| `GET` | `/api/orders/:id` | Lookup order details and live shipping status |
| `GET` | `/api/orders` | Admin endpoint to fetch recent customer orders |
| `PATCH`| `/api/orders/:id/status` | Admin endpoint to update order tracking status |
| `POST` | `/api/reviews` | Submit new customer review and recalculate rating |
| `GET` | `/api/stats` | Admin metrics: gross revenue, order count, low stock |
