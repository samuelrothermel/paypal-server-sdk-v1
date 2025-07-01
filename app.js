import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import paypalRoutes from './routes/paypal.js';
import paypalWebhooks from './routes/webhooks.js';
import paypalCallbacks from './routes/callbacks.js';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/paypal', paypalRoutes);
app.use('/paypal', paypalWebhooks);
app.use('/paypal', paypalCallbacks);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/checkout', (req, res) => {
  res.render('checkout', { clientId: process.env.PAYPAL_CLIENT_ID });
});

app.get('/upstream', (req, res) => {
  res.render('upstream', { clientId: process.env.PAYPAL_CLIENT_ID });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
