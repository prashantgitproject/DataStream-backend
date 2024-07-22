import express from 'express';
import { adminLoginValidator, validateHandler } from '../libs/validators.js';
import { adminOnly, authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';
import { adminLogin, adminLogout, getAdmin, getDashboardStats } from '../controllers/admin.js';

const app = express.Router();


app.use(isAuthenticated);

app.post('/verify', adminLoginValidator(), validateHandler, adminLogin);

app.use(authorizeAdmin);

app.use(adminOnly);

app.get('/', getAdmin)

app.post('/adminlogout', adminLogout);

app.get('/stats', getDashboardStats)

export default app;