const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const medicalHistoryRoutes = require('./routes/medicalHistory.routes');
const supportGroupRoutes = require('./routes/supportGroup.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const messageRoutes = require('./routes/message.routes');

// Create Express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/doctors`, doctorRoutes);
app.use(`/api/${API_VERSION}/appointments`, appointmentRoutes);
app.use(`/api/${API_VERSION}/prescriptions`, prescriptionRoutes);
app.use(`/api/${API_VERSION}/medical-history`, medicalHistoryRoutes);
app.use(`/api/${API_VERSION}/support-groups`, supportGroupRoutes);
app.use(`/api/${API_VERSION}/assessments`, assessmentRoutes);
app.use(`/api/${API_VERSION}/messages`, messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MindBridge API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get(`/api/${API_VERSION}`, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MindBridge API',
    version: API_VERSION,
    endpoints: {
      auth: {
        register: `POST /api/${API_VERSION}/auth/register`,
        login: `POST /api/${API_VERSION}/auth/login`,
        profile: `GET /api/${API_VERSION}/auth/profile`,
        updateProfile: `PUT /api/${API_VERSION}/auth/profile`,
        changePassword: `POST /api/${API_VERSION}/auth/change-password`
      },
      doctors: {
        search: `GET /api/${API_VERSION}/doctors/search`,
        getById: `GET /api/${API_VERSION}/doctors/:id`,
        recommended: `GET /api/${API_VERSION}/doctors/recommended/for-me`,
        pending: `GET /api/${API_VERSION}/doctors/pending/approvals`,
        approve: `POST /api/${API_VERSION}/doctors/:id/approve`
      },
      appointments: {
        list: `GET /api/${API_VERSION}/appointments`,
        get: `GET /api/${API_VERSION}/appointments/:id`,
        create: `POST /api/${API_VERSION}/appointments`,
        update: `PUT /api/${API_VERSION}/appointments/:id`,
        cancel: `POST /api/${API_VERSION}/appointments/:id/cancel`
      },
      prescriptions: {
        list: `GET /api/${API_VERSION}/prescriptions`,
        get: `GET /api/${API_VERSION}/prescriptions/:id`,
        create: `POST /api/${API_VERSION}/prescriptions`,
        update: `PUT /api/${API_VERSION}/prescriptions/:id`
      },
      medicalHistory: {
        getByPatient: `GET /api/${API_VERSION}/medical-history/patient/:patientId`,
        add: `POST /api/${API_VERSION}/medical-history/patient/:patientId`,
        update: `PUT /api/${API_VERSION}/medical-history/:id`,
        delete: `DELETE /api/${API_VERSION}/medical-history/:id`
      },
      supportGroups: {
        list: `GET /api/${API_VERSION}/support-groups`,
        get: `GET /api/${API_VERSION}/support-groups/:id`,
        myGroups: `GET /api/${API_VERSION}/support-groups/my/groups`,
        create: `POST /api/${API_VERSION}/support-groups`,
        update: `PUT /api/${API_VERSION}/support-groups/:id`,
        join: `POST /api/${API_VERSION}/support-groups/:id/join`,
        leave: `POST /api/${API_VERSION}/support-groups/:id/leave`
      },
      users: {
        list: `GET /api/${API_VERSION}/users`,
        uploadProfilePicture: `POST /api/${API_VERSION}/users/profile-picture`,
        deactivate: `POST /api/${API_VERSION}/users/:id/deactivate`,
        activate: `POST /api/${API_VERSION}/users/:id/activate`
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your database configuration.');
      process.exit(1);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 MindBridge API Server`);
      console.log('='.repeat(50));
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Server running on port: ${PORT}`);
      console.log(`API Version: ${API_VERSION}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API docs: http://localhost:${PORT}/api/${API_VERSION}`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
