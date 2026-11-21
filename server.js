// @ts-check
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_PATH = path.join(__dirname, 'store.db');

// Initialize SQLite database
const db = new DatabaseSync(DB_PATH);

// Setup Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    description TEXT,
    features TEXT,
    rating REAL DEFAULT 4.8,
    reviews_count INTEGER DEFAULT 12,
    stock INTEGER DEFAULT 25,
    badge TEXT,
    image TEXT,
    featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    zip TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0,
    shipping REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    total REAL NOT NULL,
    coupon_code TEXT,
    status TEXT DEFAULT 'Processing',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    product_title TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    image TEXT,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Seed Initial Products if empty
const countQuery = db.prepare('SELECT COUNT(*) as count FROM products');
const productCount = countQuery.get().count;

if (productCount === 0) {
  console.log('Seeding initial product catalog...');
  const insertProduct = db.prepare(`
    INSERT INTO products (title, slug, category, price, original_price, description, features, rating, reviews_count, stock, badge, image, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialProducts = [
    {
      title: 'Aura Pro Wireless ANC Headphones',
      slug: 'aura-pro-wireless-anc-headphones',
      category: 'Audio',
      price: 249.99,
      original_price: 299.99,
      description: 'Engineered for audio purists. Active Noise Cancellation with transparency mode, 40-hour battery life, and ultra-plush memory foam earcups.',
      features: 'Adaptive Noise Cancellation, 40h Battery, Bluetooth 5.3, Spatial Audio, Fast USB-C Charging',
      rating: 4.9,
      reviews_count: 84,
      stock: 18,
      badge: 'Best Seller',
      image: '/images/headphones.svg',
      featured: 1
    },
    {
      title: 'Horizon Minimalist Smartwatch',
      slug: 'horizon-minimalist-smartwatch',
      category: 'Wearables',
      price: 189.00,
      original_price: 229.00,
      description: 'Sleek aerospace aluminum casing with an Always-On AMOLED sapphire display. Heart-rate, SpO2, sleep tracking, and 7-day battery life.',
      features: 'Always-On AMOLED, 50m Water Resistant, ECG & SpO2 Monitor, GPS Tracking, iOS & Android compatible',
      rating: 4.8,
      reviews_count: 62,
      stock: 12,
      badge: 'Trending',
      image: '/images/smartwatch.svg',
      featured: 1
    },
    {
      title: 'Vortex Mechanical Gaming Keyboard',
      slug: 'vortex-mechanical-gaming-keyboard',
      category: 'Electronics',
      price: 139.50,
      original_price: 169.00,
      description: 'Hot-swappable tactile switches, per-key RGB backlighting, custom CNC machined aluminum chassis, and PBT double-shot keycaps.',
      features: 'Hot-Swappable Switches, PBT Keycaps, Per-key RGB, Detachable Type-C, Macro Programmable',
      rating: 4.7,
      reviews_count: 45,
      stock: 22,
      badge: 'Popular',
      image: '/images/keyboard.svg',
      featured: 1
    },
    {
      title: 'Pulse Studio Ergonomic Mouse',
      slug: 'pulse-studio-ergonomic-mouse',
      category: 'Electronics',
      price: 79.99,
      original_price: 95.00,
      description: 'Natural handshake angle designed to reduce wrist fatigue. Hyper-fast scroll wheel, silent switches, and dual Bluetooth/2.4G wireless.',
      features: '57° Natural Ergonomic Angle, 8000 DPI Sensor, Dual Wireless Connection, Multi-device Flow',
      rating: 4.6,
      reviews_count: 39,
      stock: 35,
      badge: 'Ergonomic',
      image: '/images/mouse.svg',
      featured: 0
    },
    {
      title: 'Lumina 4K Ultra-Wide Monitor 34"',
      slug: 'lumina-4k-ultrawide-monitor-34',
      category: 'Electronics',
      price: 549.00,
      original_price: 649.00,
      description: 'Immersive 1500R curved IPS panel, 99% sRGB color accuracy, 144Hz refresh rate, and 90W USB-C power delivery for ultimate productivity.',
      features: '34" WQHD 3440x1440, 144Hz, HDR400, 90W USB-C Power Hub, Height Adjustable Stand',
      rating: 4.9,
      reviews_count: 53,
      stock: 8,
      badge: 'Premium',
      image: '/images/monitor.svg',
      featured: 1
    },
    {
      title: 'ZenPod Wireless Charging Stand 3-in-1',
      slug: 'zenpod-wireless-charging-stand',
      category: 'Accessories',
      price: 59.90,
      original_price: 79.90,
      description: 'Fast charge your phone, smartwatch, and earbuds simultaneously with a single cable. Premium matte finish with magnetic alignment.',
      features: '15W MagSafe Compatible, Fast Multi-Device, Solid Weighted Base, Overheat Protection',
      rating: 4.7,
      reviews_count: 98,
      stock: 40,
      badge: 'Must Have',
      image: '/images/charger.svg',
      featured: 0
    },
    {
      title: 'EchoBeam Hi-Fi Smart Speaker',
      slug: 'echobeam-hifi-smart-speaker',
      category: 'Audio',
      price: 159.00,
      original_price: 199.00,
      description: 'Room-filling 360-degree sound with deep dynamic bass. Voice assistant enabled with Wi-Fi lossless streaming and multi-room grouping.',
      features: '360° Omnidirectional Audio, AirPlay 2 & Spotify Connect, Voice Assistant, Room Tuning EQ',
      rating: 4.8,
      reviews_count: 41,
      stock: 15,
      badge: 'New',
      image: '/images/speaker.svg',
      featured: 1
    },
    {
      title: 'Nomad Carbon Fiber Commuter Backpack',
      slug: 'nomad-carbon-commuter-backpack',
      category: 'Accessories',
      price: 119.00,
      original_price: 149.00,
      description: 'Weatherproof ballistic nylon with carbon fiber accents. Dedicated 16" laptop compartment, hidden RFID passport pocket, and luggage strap.',
      features: 'Water-Resistant Shell, 16" Padded Sleeve, TSA Friendly, Luggage Pass-through, Anti-theft Pocket',
      rating: 4.9,
      reviews_count: 73,
      stock: 14,
      badge: 'Top Rated',
      image: '/images/backpack.svg',
      featured: 0
    },
    {
      title: 'Solace Active Noise-Canceling Earbuds',
      slug: 'solace-active-anc-earbuds',
      category: 'Audio',
      price: 129.99,
      original_price: 159.99,
      description: 'Pocket-sized powerhouse with hybrid noise cancellation, IPX7 water resistance, custom EQ presets, and 32 hours total playback.',
      features: 'Hybrid Active Noise Cancellation, IPX7 Waterproof, Wireless Charging Case, Low-latency Gaming Mode',
      rating: 4.7,
      reviews_count: 57,
      stock: 28,
      badge: 'Hot Deal',
      image: '/images/earbuds.svg',
      featured: 1
    },
    {
      title: 'AeroDesk Electric Standing Desk 55"',
      slug: 'aerodesk-electric-standing-desk',
      category: 'Home & Office',
      price: 399.00,
      original_price: 499.00,
      description: 'Dual-motor smooth height adjustment with 4 memory presets. Solid bamboo tabletop, integrated cable management tray, and anti-collision sensor.',
      features: 'Dual Motor, Height 28"-48", Anti-collision Sensor, Solid Eco-Bamboo Top, 4 Memory Presets',
      rating: 4.9,
      reviews_count: 66,
      stock: 9,
      badge: 'Staff Pick',
      image: '/images/desk.svg',
      featured: 0
    },
    {
      title: 'Nova Glow Ambient Desk Lightbar',
      slug: 'nova-glow-ambient-desk-lightbar',
      category: 'Home & Office',
      price: 49.99,
      original_price: 69.99,
      description: 'Mounts seamlessly atop monitors to illuminate your workspace without screen glare. Touch controls for color temperature and stepless dimming.',
      features: 'Zero Screen Glare, Asymmetric Light Guide, Stepless Brightness, 2700K-6500K Temp, USB Powered',
      rating: 4.8,
      reviews_count: 88,
      stock: 31,
      badge: 'Recommended',
      image: '/images/lightbar.svg',
      featured: 0
    },
    {
      title: 'Titanium Thermal Travel Tumbler 20oz',
      slug: 'titanium-thermal-travel-tumbler',
      category: 'Accessories',
      price: 34.50,
      original_price: 45.00,
      description: 'Vacuum double-wall insulated pure titanium lining keeps drinks ice-cold for 24h or steaming hot for 12h. Leak-proof magnetic slider lid.',
      features: 'Double-Wall Vacuum, 24h Cold / 12h Hot, Pure Grade 1 Titanium Liner, 100% Leak-Proof',
      rating: 4.6,
      reviews_count: 34,
      stock: 50,
      badge: 'Eco Friendly',
      image: '/images/tumbler.svg',
      featured: 0
    }
  ];

  for (const p of initialProducts) {
    insertProduct.run(
      p.title,
      p.slug,
      p.category,
      p.price,
      p.original_price,
      p.description,
      p.features,
      p.rating,
      p.reviews_count,
      p.stock,
      p.badge,
      p.image,
      p.featured
    );
  }

  // Seed sample reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (product_id, author, rating, comment)
    VALUES (?, ?, ?, ?)
  `);

  insertReview.run(1, 'Alex M.', 5, 'The soundstage on these headphones is extraordinary. ANC wipes out airplane cabin noise completely.');
  insertReview.run(1, 'Samantha K.', 5, 'Battery lasts for days on a single charge. Super comfy for long work sessions.');
  insertReview.run(2, 'David R.', 5, 'Great build quality and very accurate heart rate sensor. Easily competes with devices twice the price.');
  insertReview.run(3, 'Marcus T.', 4, 'Crisp mechanical feel and beautiful RGB. Swapping switches was smooth and trouble-free.');
  insertReview.run(5, 'Elena V.', 5, 'Changed my productivity entirely. One USB-C cable powers my laptop and runs the 4K display.');

  console.log('Seeding complete.');
}

// Coupons dictionary
const COUPONS = {
  'SAVE10': { discount: 10, minSpend: 50, desc: '10% off on orders above $50' },
  'SAVE20': { discount: 20, minSpend: 100, desc: '20% off on orders above $100' },
  'WELCOME15': { discount: 15, minSpend: 30, desc: '15% off for new shoppers' },
  'FREESHIP': { discount: 0, freeShipping: true, minSpend: 25, desc: 'Free express shipping' }
};

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Helper to parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2e6) { // 2MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Helper to send JSON responses
function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(payload);
}

// Request dispatcher
const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = reqUrl.pathname;
  const method = req.method || 'GET';

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // --- API ROUTING ---
  if (pathname.startsWith('/api/')) {
    try {
      // 1. GET /api/products
      if (method === 'GET' && pathname === '/api/products') {
        const category = reqUrl.searchParams.get('category');
        const search = reqUrl.searchParams.get('search');
        const minPrice = reqUrl.searchParams.get('minPrice');
        const maxPrice = reqUrl.searchParams.get('maxPrice');
        const featured = reqUrl.searchParams.get('featured');
        const sort = reqUrl.searchParams.get('sort') || 'featured';

        let sql = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (category && category !== 'All') {
          sql += ' AND category = ?';
          params.push(category);
        }

        if (search) {
          sql += ' AND (title LIKE ? OR description LIKE ? OR category LIKE ?)';
          const searchPattern = `%${search}%`;
          params.push(searchPattern, searchPattern, searchPattern);
        }

        if (minPrice) {
          sql += ' AND price >= ?';
          params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
          sql += ' AND price <= ?';
          params.push(parseFloat(maxPrice));
        }

        if (featured === '1') {
          sql += ' AND featured = 1';
        }

        // Sorting
        if (sort === 'price_asc') {
          sql += ' ORDER BY price ASC';
        } else if (sort === 'price_desc') {
          sql += ' ORDER BY price DESC';
        } else if (sort === 'rating') {
          sql += ' ORDER BY rating DESC';
        } else if (sort === 'newest') {
          sql += ' ORDER BY id DESC';
        } else {
          sql += ' ORDER BY featured DESC, rating DESC';
        }

        const stmt = db.prepare(sql);
        const products = stmt.all(...params);
        return sendJson(res, 200, { success: true, count: products.length, products });
      }

      // 2. GET /api/products/:id
      const productMatch = pathname.match(/^\/api\/products\/(\d+)$/);
      if (method === 'GET' && productMatch) {
        const id = parseInt(productMatch[1], 10);
        const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
        const product = stmt.get(id);

        if (!product) {
          return sendJson(res, 404, { success: false, error: 'Product not found' });
        }

        // Get reviews
        const reviewsStmt = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC');
        const reviews = reviewsStmt.all(id);

        // Get related products
        const relatedStmt = db.prepare('SELECT * FROM products WHERE category = ? AND id != ? LIMIT 3');
        const related = relatedStmt.all(product.category, id);

        return sendJson(res, 200, { success: true, product, reviews, related });
      }

      // 3. GET /api/categories
      if (method === 'GET' && pathname === '/api/categories') {
        const stmt = db.prepare(`
          SELECT category as name, COUNT(*) as count 
          FROM products 
          GROUP BY category 
          ORDER BY count DESC
        `);
        const categories = stmt.all();
        return sendJson(res, 200, { success: true, categories });
      }

      // 4. POST /api/coupon/validate
      if (method === 'POST' && pathname === '/api/coupon/validate') {
        const body = await parseJsonBody(req);
        const code = (body.code || '').trim().toUpperCase();
        const subtotal = parseFloat(body.subtotal) || 0;

        if (!COUPONS[code]) {
          return sendJson(res, 400, { success: false, error: 'Invalid promo code' });
        }

        const coupon = COUPONS[code];
        if (subtotal < coupon.minSpend) {
          return sendJson(res, 400, {
            success: false,
            error: `Code requires a minimum order of $${coupon.minSpend.toFixed(2)}`
          });
        }

        let discountAmount = 0;
        if (coupon.discount > 0) {
          discountAmount = (subtotal * coupon.discount) / 100;
        }

        return sendJson(res, 200, {
          success: true,
          code,
          discountPercent: coupon.discount,
          discountAmount: parseFloat(discountAmount.toFixed(2)),
          freeShipping: Boolean(coupon.freeShipping),
          description: coupon.desc
        });
      }

      // 5. POST /api/orders (Create Order)
      if (method === 'POST' && pathname === '/api/orders') {
        const body = await parseJsonBody(req);
        const { customer, items, paymentMethod, couponCode } = body;

        if (!customer || !customer.name || !customer.email || !customer.address || !items || !items.length) {
          return sendJson(res, 400, { success: false, error: 'Missing required customer or items data' });
        }

        // Verify stock and calculate totals
        let subtotal = 0;
        const verifiedItems = [];

        for (const item of items) {
          const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
          const product = stmt.get(item.id);

          if (!product) {
            return sendJson(res, 400, { success: false, error: `Product ID ${item.id} not found` });
          }

          if (product.stock < item.quantity) {
            return sendJson(res, 400, {
              success: false,
              error: `Not enough stock for "${product.title}". Only ${product.stock} available.`
            });
          }

          const lineTotal = product.price * item.quantity;
          subtotal += lineTotal;

          verifiedItems.push({
            productId: product.id,
            title: product.title,
            price: product.price,
            quantity: item.quantity,
            image: product.image
          });
        }

        // Calculate discounts and shipping
        let discount = 0;
        let freeShipping = subtotal >= 100; // Free shipping over $100 by default

        if (couponCode && COUPONS[couponCode.toUpperCase()]) {
          const coupon = COUPONS[couponCode.toUpperCase()];
          if (subtotal >= coupon.minSpend) {
            if (coupon.discount > 0) {
              discount = (subtotal * coupon.discount) / 100;
            }
            if (coupon.freeShipping) {
              freeShipping = true;
            }
          }
        }

        const shipping = freeShipping ? 0 : 9.99;
        const taxableAmount = Math.max(0, subtotal - discount);
        const tax = parseFloat((taxableAmount * 0.08).toFixed(2)); // 8% sales tax
        const total = parseFloat((taxableAmount + shipping + tax).toFixed(2));

        // Generate Order ID
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

        // Insert Order
        const insertOrderStmt = db.prepare(`
          INSERT INTO orders (
            id, customer_name, email, phone, address, city, state, zip, 
            payment_method, subtotal, discount, shipping, tax, total, coupon_code, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing')
        `);

        insertOrderStmt.run(
          orderId,
          customer.name,
          customer.email,
          customer.phone || '',
          customer.address,
          customer.city,
          customer.state || '',
          customer.zip,
          paymentMethod || 'Credit Card',
          subtotal,
          discount,
          shipping,
          tax,
          total,
          couponCode || null
        );

        // Insert Order Items and Update Stock
        const insertItemStmt = db.prepare(`
          INSERT INTO order_items (order_id, product_id, product_title, price, quantity, image)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        const updateStockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

        for (const item of verifiedItems) {
          insertItemStmt.run(orderId, item.productId, item.title, item.price, item.quantity, item.image);
          updateStockStmt.run(item.quantity, item.productId);
        }

        return sendJson(res, 201, {
          success: true,
          orderId,
          summary: {
            orderId,
            customerName: customer.name,
            email: customer.email,
            shippingAddress: `${customer.address}, ${customer.city}, ${customer.zip}`,
            paymentMethod: paymentMethod || 'Credit Card',
            subtotal,
            discount,
            shipping,
            tax,
            total,
            items: verifiedItems,
            status: 'Processing',
            date: new Date().toISOString()
          }
        });
      }

      // 6. GET /api/orders/:id (Track order)
      const orderMatch = pathname.match(/^\/api\/orders\/([A-Za-z0-9\-]+)$/);
      if (method === 'GET' && orderMatch) {
        const orderId = orderMatch[1];
        const orderStmt = db.prepare('SELECT * FROM orders WHERE id = ?');
        const order = orderStmt.get(orderId);

        if (!order) {
          return sendJson(res, 404, { success: false, error: 'Order not found with provided ID' });
        }

        const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
        const items = itemsStmt.all(orderId);

        return sendJson(res, 200, { success: true, order, items });
      }

      // 7. GET /api/orders (Admin list all orders)
      if (method === 'GET' && pathname === '/api/orders') {
        const ordersStmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
        const orders = ordersStmt.all();
        return sendJson(res, 200, { success: true, count: orders.length, orders });
      }

      // 8. PATCH /api/orders/:id/status (Admin update status)
      if (method === 'PATCH' && orderMatch) {
        const orderId = orderMatch[1];
        const body = await parseJsonBody(req);
        const { status } = body;

        const allowed = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
        if (!allowed.includes(status)) {
          return sendJson(res, 400, { success: false, error: 'Invalid status' });
        }

        const updateStmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
        updateStmt.run(status, orderId);

        return sendJson(res, 200, { success: true, orderId, status });
      }

      // 9. POST /api/reviews
      if (method === 'POST' && pathname === '/api/reviews') {
        const body = await parseJsonBody(req);
        const { productId, author, rating, comment } = body;

        if (!productId || !author || !rating || !comment) {
          return sendJson(res, 400, { success: false, error: 'Missing required review fields' });
        }

        const insertStmt = db.prepare(`
          INSERT INTO reviews (product_id, author, rating, comment)
          VALUES (?, ?, ?, ?)
        `);
        insertStmt.run(productId, author, parseInt(rating, 10), comment);

        // Recalculate average rating
        const avgStmt = db.prepare(`
          SELECT AVG(rating) as avgRating, COUNT(*) as revCount 
          FROM reviews WHERE product_id = ?
        `);
        const stats = avgStmt.get(productId);

        const updateProductStmt = db.prepare(`
          UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?
        `);
        updateProductStmt.run(
          parseFloat(Number(stats.avgRating || 5).toFixed(1)),
          stats.revCount,
          productId
        );

        return sendJson(res, 201, {
          success: true,
          message: 'Review submitted successfully',
          newRating: parseFloat(Number(stats.avgRating || 5).toFixed(1)),
          reviewsCount: stats.revCount
        });
      }

      // 10. GET /api/stats (Admin dashboard stats)
      if (method === 'GET' && pathname === '/api/stats') {
        const revenueStmt = db.prepare('SELECT COALESCE(SUM(total), 0) as totalRevenue, COUNT(*) as totalOrders FROM orders');
        const rev = revenueStmt.get();

        const stockStmt = db.prepare('SELECT COUNT(*) as lowStock FROM products WHERE stock <= 10');
        const low = stockStmt.get();

        const productCountStmt = db.prepare('SELECT COUNT(*) as totalProducts FROM products');
        const prod = productCountStmt.get();

        return sendJson(res, 200, {
          success: true,
          revenue: rev.totalRevenue,
          ordersCount: rev.totalOrders,
          lowStockCount: low.lowStock,
          productsCount: prod.totalProducts
        });
      }

      return sendJson(res, 404, { success: false, error: 'API endpoint not found' });
    } catch (err) {
      console.error('API Error:', err);
      return sendJson(res, 500, { success: false, error: err.message || 'Internal Server Error' });
    }
  }

  // --- STATIC FILE SERVING ---
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security: prevent path traversal outside PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If it's a client route, fallback to index.html
      const fallbackFile = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(fallbackFile, (fallbackErr, data) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.on('error', (err) => {
  // @ts-ignore
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${PORT} is already in use. Retrying on port ${Number(PORT) + 1}...`);
    server.listen(Number(PORT) + 1);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, () => {
  const address = server.address();
  const activePort = typeof address === 'object' && address ? address.port : PORT;
  console.log(`===============================================`);
  console.log(`🛒 NovaMart E-Commerce Server is running!`);
  console.log(`📡 Local URL: http://localhost:${activePort}`);
  console.log(`📦 Database: ${DB_PATH} (SQLite native)`);
  console.log(`===============================================`);
});
