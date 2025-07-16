const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Writable path on Render
const DATA_FILE = path.join('/tmp', 'data.json');

let products = {};

// Load from /tmp/data.json if exists
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    products = JSON.parse(raw);
    console.log('Loaded products:', products);
  } else {
    console.log('data.json not found, starting fresh');
  }
} catch (err) {
  console.error('Error reading data.json:', err);
  products = {};
}

// Save data
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  console.log('Data saved:', products);
}

// Get product
app.get('/product/:barcode', (req, res) => {
  const barcode = req.params.barcode;
  if (products[barcode]) {
    res.json(products[barcode]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Add product
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
