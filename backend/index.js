import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import initializeDatabase from './config/database.js';

dotenv.config();
await initializeDatabase();

const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', (await import('./routes/auth.js')).default);
app.use('/api/leads', (await import('./routes/leads.js')).default);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});