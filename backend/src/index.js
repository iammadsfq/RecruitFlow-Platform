require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Global
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded CVs (Static Directory)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Pendaftaran Rute
app.use('/auth', require('./routes/auth.routes'));
app.use('/robot', require('./routes/robot.routes'));
app.use('/public', require('./routes/public.routes'));
app.use('/hr', require('./routes/hr.routes'));

// Healthcheck Root
app.get('/', (req, res) => {
  res.json({
    app: 'RecruitFlow Central API Server',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: {
      robot: '/robot/heartbeat',
      public: '/public/jobs',
      hr: '/hr/dashboard'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Terjadi kesalahan internal peladen'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 RecruitFlow API Server berjalan di port: ${PORT}`);
  console.log(`📡 Robot Endpoints: http://localhost:${PORT}/robot`);
  console.log(`🌐 Public Endpoints: http://localhost:${PORT}/public`);
  console.log(`💼 HR Cockpit Endpoints: http://localhost:${PORT}/hr`);
  console.log(`=======================================================`);
});

module.exports = app;
