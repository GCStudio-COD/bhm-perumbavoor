const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const db = require('./db');

require('dotenv').config();

// Auto-initialize schema tables if they do not exist
const initTables = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS job_positions (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) UNIQUE NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                sort_order INT DEFAULT 0
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS job_applications (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                email VARCHAR(255) NOT NULL,
                position VARCHAR(255) NOT NULL,
                experience VARCHAR(100) NOT NULL,
                message TEXT,
                resume_url VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Seed default positions if none exist
        const result = await db.query('SELECT COUNT(*) FROM job_positions');
        if (parseInt(result.rows[0].count) === 0) {
            const defaultPositions = [
                ['Medical Consultant / Specialist', 1],
                ['Resident Medical Officer (RMO)', 2],
                ['Registered Nurse (Staff Nurse)', 3],
                ['Nursing Supervisor / Lead', 4],
                ['Allied Health Professional / Lab Tech', 5],
                ['Administrative / Operations Executive', 6]
            ];
            for (const pos of defaultPositions) {
                await db.query('INSERT INTO job_positions (title, sort_order) VALUES ($1, $2)', pos);
            }
            console.log('Seeded initial job positions to database.');
        }
        console.log('Database tables verified/created successfully.');
    } catch (err) {
        console.error('Error verifying database tables:', err);
    }
};
initTables();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeybmh2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Serve static uploaded files
app.use('/uploads', express.static(uploadsDir));

// Serve Admin Panel static files
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// Multer File Upload Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|svg|pdf|docx|doc/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images, PDFs and Word documents are allowed!'));
    }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. Token missing.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

// ==========================================
// 1. PUBLIC API ROUTES
// ==========================================

// Get all homepage content
app.get('/api/homepage', async (req, res) => {
    try {
        const configResult = await db.query('SELECT * FROM homepage_config WHERE id = 1');
        const heroesResult = await db.query('SELECT * FROM hero_slides ORDER BY sort_order ASC, id ASC');
        const facilitiesResult = await db.query('SELECT * FROM facilities ORDER BY sort_order ASC, id ASC');
        const specialtiesResult = await db.query('SELECT * FROM specialties ORDER BY sort_order ASC, id ASC');
        const galleryResult = await db.query('SELECT * FROM gallery ORDER BY sort_order ASC, id ASC');
        const eventsResult = await db.query('SELECT * FROM events ORDER BY sort_order ASC, id ASC');
        const attractionsResult = await db.query('SELECT * FROM attractions ORDER BY sort_order ASC, id ASC');
        const reachModesResult = await db.query('SELECT * FROM reach_modes ORDER BY sort_order ASC, id ASC');
        const positionsResult = await db.query('SELECT * FROM job_positions WHERE is_active = TRUE ORDER BY sort_order ASC, title ASC');

        res.json({
            config: configResult.rows[0] || {},
            heroes: heroesResult.rows,
            facilities: facilitiesResult.rows,
            specialties: specialtiesResult.rows,
            gallery: galleryResult.rows,
            events: eventsResult.rows,
            attractions: attractionsResult.rows,
            reachModes: reachModesResult.rows,
            jobPositions: positionsResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error retrieving homepage content.' });
    }
});

// Post a new job application
app.post('/api/applications', upload.single('resume'), async (req, res) => {
    const { fullName, phone, email, position, experience, message } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ message: 'Resume file is required.' });
    }
    if (!fullName || !phone || !email || !position || !experience) {
        return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const resumeUrl = `/uploads/${req.file.filename}`;

    try {
        // 1. Save to Database
        const result = await db.query(
            `INSERT INTO job_applications (full_name, phone, email, position, experience, message, resume_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [fullName, phone, email, position, experience, message || '', resumeUrl]
        );

        // 2. Fetch destination email (footer_email from homepage_config)
        const configResult = await db.query('SELECT footer_email FROM homepage_config WHERE id = 1');
        const hospitalEmail = (configResult.rows[0] && configResult.rows[0].footer_email) || 'info@bmhperumbavoor.com';

        // 3. Send Email Notification via Nodemailer
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'yourgmail@gmail.com',
                pass: process.env.EMAIL_PASS || 'your_app_password'
            }
        });

        // Send to Gmail of BHM (EMAIL_USER) and copy/send to hospital email (hospitalEmail)
        const recipients = [process.env.EMAIL_USER || 'yourgmail@gmail.com'];
        if (hospitalEmail && hospitalEmail !== process.env.EMAIL_USER) {
            recipients.push(hospitalEmail);
        }

        const mailOptions = {
            from: `"BMH Careers Portal" <${process.env.EMAIL_USER || 'yourgmail@gmail.com'}>`,
            to: recipients.join(', '),
            subject: `New Job Application: ${fullName} - ${position}`,
            text: `A new job application has been submitted.\n\nName: ${fullName}\nPhone: ${phone}\nEmail: ${email}\nPosition: ${position}\nExperience: ${experience}\nMessage: ${message || 'No cover message.'}\n\nResume path: ${resumeUrl}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px; background-color: #fcfcfc;">
                    <h2 style="color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-top: 0;">New Job Application Received</h2>
                    <p style="font-size: 16px;">We have received a new application via the "Work With Us" portal:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Full Name:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${fullName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone Number:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email Address:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Position Applied:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; text-transform: capitalize;">${position}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Experience:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; text-transform: capitalize;">${experience}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; vertical-align: top; font-weight: bold;">Cover Message:</td>
                            <td style="padding: 8px;">${message ? message.replace(/\n/g, '<br>') : '<em>None</em>'}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 25px; padding: 15px; background-color: #f0f9ff; border-radius: 6px; text-align: center;">
                        <p style="margin: 0; font-size: 14px; color: #0369a1;">
                            The candidate's resume/CV file is attached to this email. You can also access it directly at: <br>
                            <a href="http://localhost:5000${resumeUrl}" style="color: #0284c7; text-decoration: underline; font-weight: bold;" target="_blank">Download Resume File</a>
                        </p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: req.file.originalname,
                    path: req.file.path
                }
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('SMTP Mail sending failed:', error);
            } else {
                console.log('Application email forwarded successfully:', info.response);
            }
        });

        res.json({ message: 'Application submitted successfully!', application: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error processing application.' });
    }
});

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================

// Admin Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM admin_users WHERE username = $1 OR email = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error logging in.' });
    }
});

// Verify Token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, username: req.user.username });
});

// Create Admin (Option for signup/registration)
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all details.' });
    }
    try {
        // Check if user/email already exists
        const exists = await db.query('SELECT 1 FROM admin_users WHERE username = $1 OR email = $2', [username, email]);
        if (exists.rows.length > 0) {
            return res.status(400).json({ message: 'Username or Email is already registered.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO admin_users (username, email, password_hash) VALUES ($1, $2, $3)',
            [username, email, passwordHash]
        );
        res.json({ message: 'Admin account created successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating admin.' });
    }
});

// Forgot Password (Send Reset Code)
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email address is required.' });

    try {
        const result = await db.query('SELECT * FROM admin_users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            // Keep response secure: do not reveal if email exists or not
            return res.json({ message: 'If that email is registered, a reset code was sent.' });
        }

        const user = result.rows[0];
        // Generate a simple 6-digit verification code instead of a long URL for simplicity
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

        await db.query(
            'UPDATE admin_users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
            [resetCode, expires, user.id]
        );

        // Configure Nodemailer
        const nodemailer = require('nodemailer');
        
        // Use Gmail service if configured, otherwise fallback to Mailtrap/standard SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'yourgmail@gmail.com',
                pass: process.env.EMAIL_PASS || 'your_app_password'
            }
        });

        const mailOptions = {
            from: `"BMH Perumbavoor CMS" <${process.env.EMAIL_USER || 'yourgmail@gmail.com'}>`,
            to: user.email,
            subject: 'Admin Password Reset Code',
            text: `You requested a password reset. Your verification code is: ${resetCode}\n\nThis code expires in 15 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f7f6;">
                    <h2>BMH Perumbavoor CMS Dashboard</h2>
                    <p>You requested a password reset. Use the verification code below to reset your password:</p>
                    <div style="background-color: #0284c7; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 8px; display: inline-block; letter-spacing: 4px; margin: 10px 0;">
                        ${resetCode}
                    </div>
                    <p>This code will expire in 15 minutes.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Mail sending failed:', error);
            }
        });

        res.json({ message: 'If that email is registered, a reset code was sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error processing forgot password.' });
    }
});

// Reset Password (Verify Code & Update Password)
app.post('/api/auth/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
        return res.status(400).json({ message: 'Please provide email, verification code, and new password.' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM admin_users WHERE email = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
            [email, code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }

        const user = result.rows[0];
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE admin_users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [newHash, user.id]
        );

        res.json({ message: 'Password has been reset successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error resetting password.' });
    }
});

// ==========================================
// 3. PROTECTED ADMIN CMS ROUTES
// ==========================================

// File Upload Endpoint
app.post('/api/admin/upload', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ fileUrl });
});

// Get all uploaded files
app.get('/api/admin/uploads', authenticateToken, async (req, res) => {
    try {
        // Query all resume URLs from database
        const resumesResult = await db.query('SELECT resume_url FROM job_applications');
        const resumeFiles = new Set(resumesResult.rows.map(row => {
            if (!row.resume_url) return '';
            // Get just the filename, e.g. /uploads/filename.pdf -> filename.pdf
            return path.basename(row.resume_url);
        }).filter(Boolean));

        fs.readdir(uploadsDir, (err, files) => {
            if (err) {
                return res.status(500).json({ message: 'Unable to scan uploads directory.' });
            }
            
            // Filter out files that are candidate resumes
            const filteredFiles = files.filter(filename => !resumeFiles.has(filename));

            const fileList = filteredFiles.map(filename => {
                const filePath = path.join(uploadsDir, filename);
                const stats = fs.statSync(filePath);
                return {
                    filename,
                    url: `/uploads/${filename}`,
                    size: stats.size,
                    createdAt: stats.birthtime
                };
            });
            
            fileList.sort((a, b) => b.createdAt - a.createdAt);
            res.json(fileList);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error scanning uploads.' });
    }
});

// Delete an uploaded file
app.delete('/api/admin/uploads/:filename', authenticateToken, (req, res) => {
    const { filename } = req.params;
    
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: 'Invalid filename.' });
    }
    
    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found.' });
    }
    
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to delete file from disk.' });
        }
        res.json({ message: 'File deleted successfully.' });
    });
});

// Update Homepage Config (single row page settings)
app.put('/api/admin/config', authenticateToken, async (req, res) => {
    const fields = req.body;
    
    // Dynamically build SQL set fields
    const keys = Object.keys(fields).filter(k => k !== 'id');
    if (keys.length === 0) return res.status(400).json({ message: 'No fields to update.' });

    try {
        const setClauses = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
        const values = keys.map(key => {
            // If field is an object (stats/features), stringify it for JSONB
            if (typeof fields[key] === 'object' && fields[key] !== null) {
                return JSON.stringify(fields[key]);
            }
            return fields[key];
        });
        
        values.push(1); // For the WHERE id = 1 clause
        const queryText = `UPDATE homepage_config SET ${setClauses} WHERE id = $${values.length} RETURNING *`;
        
        const result = await db.query(queryText, values);
        res.json({ message: 'Config updated successfully.', config: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating config.' });
    }
});

// Generic Helper for List Resource Operations (CRUD)
const registerListResource = (resourceName, tableName, columns) => {
    // Get all
    app.get(`/api/admin/${resourceName}`, authenticateToken, async (req, res) => {
        try {
            const result = await db.query(`SELECT * FROM ${tableName} ORDER BY sort_order ASC, id ASC`);
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ message: `Error fetching ${resourceName}.` });
        }
    });

    // Create
    app.post(`/api/admin/${resourceName}`, authenticateToken, async (req, res) => {
        try {
            const keys = columns.filter(c => req.body[c] !== undefined);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const queryText = `INSERT INTO ${tableName} (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
            const values = keys.map(k => req.body[k]);
            
            const result = await db.query(queryText, values);
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: `Error creating ${resourceName}.` });
        }
    });

    // Update
    app.put(`/api/admin/${resourceName}/:id`, authenticateToken, async (req, res) => {
        const { id } = req.params;
        try {
            const keys = columns.filter(c => req.body[c] !== undefined);
            const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
            const queryText = `UPDATE ${tableName} SET ${setClauses} WHERE id = $${keys.length + 1} RETURNING *`;
            const values = [...keys.map(k => req.body[k]), id];

            const result = await db.query(queryText, values);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Item not found.' });
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: `Error updating ${resourceName}.` });
        }
    });

    // Delete
    app.delete(`/api/admin/${resourceName}/:id`, authenticateToken, async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [id]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Item not found.' });
            res.json({ message: 'Deleted successfully.' });
        } catch (err) {
            res.status(500).json({ message: `Error deleting ${resourceName}.` });
        }
    });
};

// Register list endpoints
registerListResource('heroes', 'hero_slides', ['title', 'subtitle', 'image_url', 'sort_order', 'is_active']);
registerListResource('facilities', 'facilities', ['title', 'description', 'image_url', 'sort_order']);
registerListResource('specialties', 'specialties', ['title', 'description', 'image_url', 'sort_order']);
registerListResource('gallery', 'gallery', ['title', 'category', 'image_url', 'sort_order']);
registerListResource('events', 'events', ['title', 'description', 'event_date', 'category', 'image_url', 'sort_order']);
registerListResource('attractions', 'attractions', ['title', 'distance', 'tag', 'image_url', 'sort_order']);
registerListResource('reach-modes', 'reach_modes', ['mode', 'title', 'subtitle', 'description', 'badge_info', 'sort_order']);
registerListResource('job-positions', 'job_positions', ['title', 'sort_order', 'is_active']);

// Get all job applications (Admin only)
app.get('/api/admin/applications', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM job_applications ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching applications.' });
    }
});

// Delete a job application (Admin only)
app.delete('/api/admin/applications/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const check = await db.query('SELECT resume_url FROM job_applications WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        
        const resumeUrl = check.rows[0].resume_url;
        const filename = path.basename(resumeUrl);
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error('Failed to delete resume file:', err);
            });
        }

        await db.query('DELETE FROM job_applications WHERE id = $1', [id]);
        res.json({ message: 'Application deleted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting application.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`BMH CMS backend listening on http://localhost:${PORT}`);
    console.log(`Admin panel hosted at http://localhost:${PORT}/admin`);
});
