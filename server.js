const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from 'public' folder
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');

// Load data or start empty
let products = {};
try {
  const data = fs.readFileSync(DATA_FILE);
  products = JSON.parse(data);
} catch {
  products = {};
}

// Save products
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

// Get product by barcode
app.get('/product/:barcode', (req, res) => {
  const barcode = req.params.barcode;
  if (products[barcode]) {
    res.json(products[barcode]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Add or update product
app.post('/product', (req, res) => {
  const { barcode, name, price } = req.body;
  if (!barcode || !name || !price) {
    return res.status(400).json({ error: 'Missing fields' });
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
    res.json({ message: 'Deleted' });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
