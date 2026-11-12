const jwt = require('jsonwebtoken');

const ROBOT_API_TOKEN = process.env.ROBOT_API_TOKEN || 'rf_robot_bearer_token_dev_secret_key_123456';
const JWT_SECRET = process.env.JWT_SECRET || 'recruitflow_jwt_secret_dev_only_change_in_production';

// Middleware Otentikasi Khusus Robot UiPath
function robotAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token Bearer robot diperlukan' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== ROBOT_API_TOKEN) {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'Token Bearer robot tidak valid atau kedaluwarsa' });
  }

  // Robot dilarang mengubah status persetujuan HR (BR-10)
  if (req.body && (req.body.hr_user_id || req.body.decision_override)) {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'Robot dilarang memanipulasi kolom persetujuan HR (BR-10)' });
  }

  next();
}

// Middleware Otentikasi Staf / HR
function staffAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Mode dev bypass if X-Dev-User is provided
    if (process.env.NODE_ENV !== 'production' && req.headers['x-dev-user']) {
      req.user = { id: req.headers['x-dev-user'], role: 'HR', name: 'HR Recruiter Dev' };
      return next();
    }
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Sesi login staf diperlukan' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Sesi kedaluwarsa atau tidak valid' });
  }
}

module.exports = { robotAuth, staffAuth };
