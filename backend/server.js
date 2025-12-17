const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load env vars
const db = require('./db');
const { sendEmail, sendWhatsApp } = require('./notifications');
const { log } = require('./logger');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const apiRouter = express.Router();

// --- Users ---
apiRouter.get('/users', (req, res) => {
    console.log("[API] GET /users called");
    db.query('SELECT * FROM wp_eizin_users', (err, results) => {
        if (err) {
            console.error("[API ERROR] GET /users:", err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`[API] Returning ${results.length} users`);
        res.json(results);
    });
});

apiRouter.post('/users', (req, res) => {
    const { name, username, password, role, code, email, phone } = req.body;
    const sql = 'INSERT INTO wp_eizin_users (name, username, password, role, code, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, username, password, role, code, email || '', phone || ''], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, message: 'User created' });
    });
});

apiRouter.post('/users/:id', (req, res) => { // Update
    const { id } = req.params;
    const { name, email, phone, password } = req.body;
    let sql = 'UPDATE wp_eizin_users SET ';
    const params = [];
    const updates = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (email) { updates.push('email = ?'); params.push(email); }
    if (phone) { updates.push('phone = ?'); params.push(phone); }
    if (password) { updates.push('password = ?'); params.push(password); }

    if (updates.length === 0) return res.json({ message: 'No changes' });

    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        // Return updated user
        db.query('SELECT * FROM wp_eizin_users WHERE id = ?', [id], (err2, rows) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json(rows[0]);
        });
    });
});

apiRouter.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM wp_eizin_users WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query('DELETE FROM wp_eizin_mappings WHERE student_id = ?', [id], (err2) => {
            if (err2) console.error("Mapping cleanup failed", err2);
        });
        res.json({ message: 'User deleted' });
    });
});

apiRouter.post('/login', (req, res) => {
    const { identifier, password } = req.body;
    console.log(`[LOGIN ATTEMPT]Identifier: ${identifier}, Password: ${password} `);
    const sql = 'SELECT * FROM wp_eizin_users WHERE (username = ? OR code = ? OR email = ?) AND password = ?';
    db.query(sql, [identifier, identifier, identifier, password], (err, results) => {
        if (err) {
            console.error("[LOGIN ERROR] DB Error:", err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`[LOGIN RESULT] Found ${results.length} users`);
        if (results.length > 0) {
            console.log(`[LOGIN SUCCESS]User: ${results[0].username} (${results[0].role})`);
            res.json(results[0]);
        } else {
            console.warn("[LOGIN FAILED] Invalid credentials");
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});

// --- Requests ---
apiRouter.get('/requests', (req, res) => {
    const sql = `
        SELECT r.id, r.type, r.start_date as startDate, r.end_date as endDate, r.reason,
    r.attachment_url as attachmentUrl, r.lecturer_status as lecturerStatus, r.mentor_status as mentorStatus,
    r.lecturer_comment as lecturerComment, r.mentor_comment as mentorComment, r.approved_at as approvedAt,
    u.name as studentName, u.code as nim, u.id as studentId, r.created_at as createdAt
        FROM wp_eizin_requests r
        JOIN wp_eizin_users u ON r.student_id = u.id
        ORDER BY r.created_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

apiRouter.post('/requests', (req, res) => {
    const { studentId, type, startDate, endDate, reason, attachmentUrl } = req.body;
    const sql = 'INSERT INTO wp_eizin_requests (student_id, type, start_date, end_date, reason, attachment_url) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [studentId, type, startDate, endDate, reason, attachmentUrl || ''], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // --- NOTIFICATION LOGIC (NEW REQUEST) ---
        const mapSql = `
SELECT
l.email as l_email, l.phone as l_phone,
    m.email as m_email, m.phone as m_phone,
    s.name as student_name
            FROM wp_eizin_mappings map
            JOIN wp_eizin_users s ON map.student_id = s.id
            LEFT JOIN wp_eizin_users l ON map.lecturer_id = l.id
            LEFT JOIN wp_eizin_users m ON map.mentor_id = m.id
            WHERE map.student_id = ?
    `;
        log(`[SERVER] New Request Event.StudentID: ${studentId}. Querying mappings...`);
        db.query(mapSql, [studentId], (err2, results) => {
            if (err2) {
                log(`[SERVER ERROR] Mapping Query failed: ${err2.message} `);
            } else if (results.length > 0) {
                const data = results[0];
                log(`[SERVER] Found Mapping.Student: ${data.student_name}.L_Phone: ${data.l_phone}, M_Phone: ${data.m_phone} `);
                const subject = `Pengajuan Izin Baru: ${data.student_name} `;
                const message = `Mahasiswa ${data.student_name} mengajukan izin '${type}'.Mohon cek dashboard untuk validasi.`;

                // Notify Lecturer (PRIORITY)
                if (data.l_email) sendEmail(data.l_email, subject, `<p>${message}</p>`);
                if (data.l_phone) sendWhatsApp(data.l_phone, message);

                // Notify Mentor - DISABLED (Sequential Flow: Wait for Lecturer Approval)
                // if (data.m_email) sendEmail(data.m_email, subject, `<p>${message}</p>`);
                // if (data.m_phone) sendWhatsApp(data.m_phone, message);
            } else {
                log(`[SERVER] No mapping found for student ${studentId}`);
            }
        });

        res.json({ id: result.insertId, message: 'Request created' });
    });
});

apiRouter.post('/requests/action', (req, res) => {
    const { id, role, action, comment } = req.body;
    console.log(`[ACTION] Received: ID=${id}, Role=${role}, Action=${action}, Comment=${comment}`);

    let sql = '';
    const params = [action];

    if (role === 'lecturer') {
        sql = 'UPDATE wp_eizin_requests SET lecturer_status = ?, lecturer_comment = ? WHERE id = ?';
        params.push(comment || null);
    } else {
        sql = 'UPDATE wp_eizin_requests SET mentor_status = ?, mentor_comment = ? WHERE id = ?';
        params.push(comment || null);
    }
    params.push(id);

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // --- NOTIFICATION LOGIC ---
        // Fetch Request & Student Data & Mappings
        const notifySql = `
            SELECT 
                r.id, r.type, r.lecturer_status, r.mentor_status,
                u.name, u.email, u.phone,
                m.name as mentor_name, m.phone as mentor_phone
            FROM wp_eizin_requests r 
            JOIN wp_eizin_users u ON r.student_id = u.id 
            LEFT JOIN wp_eizin_mappings map ON r.student_id = map.student_id
            LEFT JOIN wp_eizin_users m ON map.mentor_id = m.id
            WHERE r.id = ?
        `;
        log(`[SERVER] Action Event. ID: ${id}, Role: ${role}, Action: ${action}. Querying info...`);
        db.query(notifySql, [id], (err2, results) => {
            if (err2) {
                log(`[SERVER ERROR] Notify Query failed: ${err2.message}`);
            } else if (results.length > 0) {
                const reqData = results[0];
                log(`[SERVER] Found student: ${reqData.name}. Role/Action: ${role}/${action}`);
                log(`[SERVER] Statuses -> Lect: ${reqData.lecturer_status}, Mentor: ${reqData.mentor_status}`);

                const commentText = comment ? `\nCatatan: ${comment}` : '';

                // 1. Notify Student (ONLY if Rejected OR Fully Approved)
                const isRejected = action === 'Rejected';
                const isFullyApproved = reqData.lecturer_status === 'Approved' && reqData.mentor_status === 'Approved';

                if (isRejected || isFullyApproved) {
                    const statusMsg = isRejected ? 'Ditolak' : 'Disetujui Sepenuhnya';
                    const subject = `Update Status Izin Magang: ${statusMsg}`;
                    const message = `Halo ${reqData.name}, pengajuan izin '${reqData.type}' Anda telah ${statusMsg}.${commentText}\nSilakan cek dashboard.`;

                    log(`[SERVER] Notifying Student (${statusMsg}).`);
                    sendEmail(reqData.email, subject, `<p>${message.replace(/\n/g, '<br>')}</p>`);
                    sendWhatsApp(reqData.phone, message);
                } else {
                    log(`[SERVER] Student NOT notified yet (Wait for full approval).`);
                }

                // 2. Notify Mentor (IF Lecturer Approved)
                if (role === 'lecturer' && action === 'Approved') {
                    if (reqData.mentor_phone) {
                        const msgMitra = `Halo ${reqData.mentor_name}, Mahasiswa ${reqData.name} telah disetujui izinnya oleh Dosen Pembimbing.${commentText}\nMohon validasi di dashboard anda.`;
                        log(`[SERVER] Sequential Notification: Notifying Mentor ${reqData.mentor_name} (${reqData.mentor_phone})`);
                        sendWhatsApp(reqData.mentor_phone, msgMitra);
                    } else {
                        log(`[SERVER] Warning: Mentor phone not found for sequential notification.`);
                    }
                }
            } else {
                log(`[SERVER] No student/request found for ID ${id}`);
            }
        });

        res.json({ message: 'Status updated' });
    });
});

// --- Mappings ---
apiRouter.get('/mappings', (req, res) => {
    db.query('SELECT * FROM wp_eizin_mappings', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const mapObj = {};
        results.forEach(row => {
            mapObj[row.student_id] = {
                lecturerId: row.lecturer_id,
                mentorId: row.mentor_id
            };
        });
        res.json(mapObj);
    });
});

apiRouter.post('/mappings', (req, res) => {
    const { studentId, lecturerId, mentorId } = req.body;
    const checkSql = 'SELECT id FROM wp_eizin_mappings WHERE student_id = ?';

    db.query(checkSql, [studentId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            // Update
            const updateSql = 'UPDATE wp_eizin_mappings SET lecturer_id = ?, mentor_id = ? WHERE student_id = ?';
            db.query(updateSql, [lecturerId, mentorId, studentId], (err2) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json({ message: 'Mapping updated' });
            });
        } else {
            // Insert
            const insertSql = 'INSERT INTO wp_eizin_mappings (student_id, lecturer_id, mentor_id) VALUES (?, ?, ?)';
            db.query(insertSql, [studentId, lecturerId, mentorId], (err2) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json({ message: 'Mapping created' });
            });
        }
    });
});

app.use('/api/e-izin/v1', apiRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
