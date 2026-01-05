import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);
app.use(morgan('dev'));

import routes from './routes';
import uploadRoutes from './modules/upload/upload.routes';
import path from 'path';

app.use('/api', routes);
app.use('/api/upload', uploadRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'College Marketplace API is running' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error:", err);
  
  // Log to file
  const fs = require('fs');
  const path = require('path');
  const logPath = path.join(__dirname, '../server_error.log');
  const logMessage = `[${new Date().toISOString()}] ${err.message}\n${err.stack}\n\n`;
  fs.appendFileSync(logPath, logMessage);

  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

export default app;
