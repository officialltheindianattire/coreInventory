import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

// Import routes
import authRoutes from './modules/auth/routes';
import userRoutes from './modules/users/routes';
import warehouseRoutes from './modules/warehouses/routes';
import productRoutes from './modules/products/routes';
import inventoryRoutes from './modules/inventory/routes';
import receiptRoutes from './modules/receipts/routes';
import deliveryRoutes from './modules/deliveries/routes';
import transferRoutes from './modules/transfers/routes';
import adjustmentRoutes from './modules/adjustments/routes';
import dashboardRoutes from './modules/dashboard/routes';

const app = express();

// ── Core Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request Logging ───────────────────────────────────────
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/adjustments', adjustmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Health Check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error Handler ─────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────
app.listen(env.PORT, () => {
  logger.info(`🚀 CoreInventory server running on port ${env.PORT}`);
  logger.info(`📦 Environment: ${env.NODE_ENV}`);
});

export default app;
