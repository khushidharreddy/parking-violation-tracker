import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seeds/seedData.js';

// Route imports
import reportRoutes from './routes/reportRoutes.js';
import validationRoutes from './routes/validationRoutes.js';
import routingRoutes from './routes/routingRoutes.js';
import handlerRoutes from './routes/handlerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Test runner import
import { runAllTests } from './utils/testRunner.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/reports', reportRoutes);
app.use('/api/validate', validationRoutes);
app.use('/api/routing', routingRoutes);
app.use('/api/handlers', handlerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Parking Violation Tracker API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Part D Test Suite API
app.get('/api/test-suite', async (req, res) => {
  try {
    const report = await runAllTests();
    res.json({
      success: true,
      report
    });
  } catch (err) {
    console.error('[TestSuite] Execution error:', err);
    res.status(500).json({ success: false, error: 'TEST_EXECUTION_FAILED', message: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Endpoint ${req.method} ${req.url} does not exist.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[GlobalError]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected internal error occurred.'
  });
});

// Start server
async function startServer() {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`=====================================================`);
      console.log(` Parking Violation Tracker Backend API`);
      console.log(` Server running on: http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(` Test Suite: http://localhost:${PORT}/api/test-suite`);
      console.log(`=====================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();
