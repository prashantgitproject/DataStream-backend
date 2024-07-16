import express from 'express';
import { contact, courseRequest, getDashboardStats } from '../controllers/other.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';

const app = express.Router();

app.post('/contact', contact)

app.post('/courserequest', courseRequest)

app.get('/admin/stats', isAuthenticated, authorizeAdmin, getDashboardStats)

export default app;