import express from 'express';
import { contact, courseRequest } from '../controllers/other.js';
const app = express.Router();

app.post('/contact', contact)

app.post('/courserequest', courseRequest)


export default app;