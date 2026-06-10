import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

import errorHandler from './middleware/errorMiddleware.js';
import notFoundHandler from './middleware/notFoundMiddleware.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL   || 'http://localhost:5173',
  process.env.ADMIN_URL    || 'http://localhost:5174',
  process.env.SA_URL       || 'http://localhost:5175',
];

// ── Socket.io ─────────────────────────────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
});

io.on('connection', (socket) => {
  // Restaurant admins join a room keyed by their restaurantId
  socket.on('join:restaurant', (restaurantId) => {
    if (restaurantId) socket.join(`restaurant:${restaurantId}`);
  });
  // Superadmin joins a global room
  socket.on('join:superadmin', () => {
    socket.join('superadmin');
  });
});

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => { console.error('❌ MongoDB Error:', err); process.exit(1); });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',         authLimiter, authRoutes);
app.use('/api/v1/restaurants',  restaurantRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/menu',         menuRoutes);
app.use('/api/v1/reviews',      reviewRoutes);
app.use('/api/v1/tables',       tableRoutes);
app.use('/api/v1/newsletter',   newsletterRoutes);
app.use('/api/v1/contact',      contactRoutes);
app.use('/api/v1/orders',       orderRoutes);
app.use('/api/v1/dashboard',    dashboardRoutes);
app.use('/api/v1/users',        userRoutes);
app.use('/api/v1/hotels',       hotelRoutes);
app.use('/api/v1/finance',      financeRoutes);
app.use('/api/v1/support',      supportRoutes);
app.use('/api/v1/settings',     settingsRoutes);
app.use('/api/v1/reports',      reportsRoutes);
app.use('/api/v1/bookings',     bookingRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

app.use(notFoundHandler);
app.use(errorHandler);

const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
  console.log(`📡 http://localhost:${PORT}/api/v1`);
  console.log(`🔌 Socket.io enabled`);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
