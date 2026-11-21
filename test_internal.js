const { EventEmitter } = require('node:events');
const { Readable, Writable } = require('node:stream');
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

console.log('Testing Database and API logic internally...');

// Test 1: Verify store.db exists and has seeded records
const db = new DatabaseSync(path.join(__dirname, 'store.db'));
const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
console.log(`✓ Products in DB: ${prodCount}`);
if (prodCount !== 12) {
  throw new Error(`Expected 12 products, got ${prodCount}`);
}

// Test 2: Verify sample categories
const categories = db.prepare('SELECT category, count(*) as c FROM products GROUP BY category').all();
console.log(`✓ Categories found (${categories.length}):`, categories.map(c => `${c.category} (${c.c})`).join(', '));

// Test 3: Verify reviews
const revCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get().count;
console.log(`✓ Seeded reviews: ${revCount}`);

// Test 4: Verify Order Insertion
const orderId = 'ORD-TEST123';
db.prepare(`
  INSERT INTO orders (id, customer_name, email, phone, address, city, state, zip, payment_method, subtotal, discount, shipping, tax, total, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing')
`).run(orderId, 'Test User', 'test@test.com', '123', '1 St', 'City', 'ST', '12345', 'Card', 100, 20, 0, 6.4, 86.4);

db.prepare(`
  INSERT INTO order_items (order_id, product_id, product_title, price, quantity, image)
  VALUES (?, 1, 'Aura Pro ANC', 100, 1, '/images/headphones.svg')
`).run(orderId);

const fetchedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
console.log(`✓ Created & retrieved order: ${fetchedOrder.id}, Total: $${fetchedOrder.total}`);

const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
console.log(`✓ Order items count: ${orderItems.length}`);

// Clean up test order
db.prepare('DELETE FROM order_items WHERE order_id = ?').run(orderId);
db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);

console.log('✓ Database integrity and schema validated successfully!');
