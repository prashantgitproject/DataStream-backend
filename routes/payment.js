import express from 'express';
import { buySubscription, cancelSubscription, getRazorPayKey, paymentVerification } from '../controllers/payment.js';
import { authorizeSubscribers, isAuthenticated } from '../middlewares/auth.js';

const app = express.Router();

app.get('/razorpaykey', getRazorPayKey)

app.use(isAuthenticated);

app.get('/subscribe', buySubscription);

app.post('/paymentverification', paymentVerification);

app.delete('/subscribe/cancel', authorizeSubscribers, cancelSubscription)

export default app;