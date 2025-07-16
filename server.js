const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files from /public
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');

let products = {};

// Load products from data.json on startup
try {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  products = JSON.parse(raw);
  console.log('Loaded products:', products);
} catch (err) {
  console.log('No data.json found, starting with empty product list');
  products = {};
}

// Save products to data.json
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  console.log('Data saved:', products);
}

// Get product by barcode
app.get('/product/:barcode', (req, res) => {
  const barcode = req.params.barcode;
  if (products[barcode]) {
    res.json(products[barcode]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Add or update product
app.post('/product', (req, res) => {
  const { barcode, name, price } = req.body;
  if (!barcode || !name || !price) {
    return res.status(400).json({ error: 'Missing fields: barcode, name, price required' });
  }
  products[barcode] = { barcode, name, price };
  saveData();
  res.json(products[barcode]);
});

// Delete product
app.delete('/product/:barcode', (req, res) => {
  const barcode = req.params.barcode;
  if (products[barcode]) {
    delete products[barcode];
    saveData();
    res.json({ message: 'Product deleted' });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
