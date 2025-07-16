const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = './data.json';

// Load data from file or start empty
let products = {};
try {
  const data = fs.readFileSync(DATA_FILE);
  products = JSON.parse(data);
} catch {
  products = {};
}

// Save data to file
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

// Add new product or return existing
app.post('/product', (req, res) => {
  const { barcode, name, price } = req.body;
  if (!barcode || !name || !price) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (!products[barcode]) {
    products[barcode] = { barcode, name, price };
    saveData();
  }
  res.json(products[barcode]);
});

app.listen(3000, () => console.log('Server running on port 3000'));
