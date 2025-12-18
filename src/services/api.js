// src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/e-izin/v1';

const HEADERS = {
    'Content-Type': 'application/json'
};

// --- MOCK DATA FALLBACK ---
const MOCK = {
    users: [
        { id: 1, name: 'Administrator', username: 'admin', role: 'admin', code: 'ADM001', password: 'admin' },
        { id: 2, name: 'Budi Mahasiswa', username: 'student', role: 'student', code: '2023001', password: 'student' },
        { id: 3, name: 'Dr. Dosen', username: 'lecturer', role: 'lecturer', code: 'NIP001', password: 'lecturer' },
        { id: 4, name: 'PT. Mitra', username: 'mentor', role: 'mentor', code: 'MITRA001', password: 'mentor' }
    ],
    requests: [
        { id: 101, studentId: 2, studentName: 'Budi Mahasiswa', type: 'Sakit', startDate: '2025-01-10', endDate: '2025-01-12', reason: 'Demam tinggi (Mock)', attachmentUrl: null, lecturerStatus: 'Approved', mentorStatus: 'Pending' }
    ],
    mappings: {
        2: { lecturerId: 3, mentorId: 4 }
    }
};

const mockDelay = () => new Promise(resolve => setTimeout(resolve, 300));

export const api = {
    // --- Users ---
    getUsers: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users`, { headers: HEADERS });
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.error("Backend Unreachable (getUsers). Error:", e);
            console.warn("Using Mock Data.");
            return [...MOCK.users]; // Return copy to trigger react updates
        }
    },
    createUser: async (userData) => {
        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify(userData)
            });
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.warn("Backend Unreachable. Using Mock Data.");
            const newUser = { ...userData, id: Date.now() };
            MOCK.users.push(newUser);
            return newUser;
        }
    },
    updateUser: async (id, data) => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.warn("Backend Unreachable. Using Mock Data.");
            const index = MOCK.users.findIndex(u => u.id === id);
            if (index !== -1) {
                MOCK.users[index] = { ...MOCK.users[index], ...data };
                return MOCK.users[index];
            }
            return data;
        }
    },
    deleteUser: async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: HEADERS
            });
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.warn("Backend Unreachable. Using Mock Data.");
            const index = MOCK.users.findIndex(u => u.id === id);
            if (index !== -1) {
                MOCK.users.splice(index, 1);
            }
            return { success: true };
        }
    },
    login: async (identifier, password) => {
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify({ identifier, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');
            return data;
        } catch (e) {
            console.warn("Backend Unreachable. Using Mock Data.");
            await mockDelay();
            const user = MOCK.users.find(u =>
                (u.username === identifier || u.code === identifier) &&
                u.password === password
            );
            if (user) return user;
            throw new Error("Login gagal (Mock): User tidak ditemukan atau password salah");
        }
    },

    // --- Requests ---
    getRequests: async (studentId = null) => {
        try {
            const url = studentId ? `${API_BASE_URL}/requests?studentId=${studentId}` : `${API_BASE_URL}/requests`;
            const res = await fetch(url, { headers: HEADERS });
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();

            // SECURITY: Client-side Filter Enforcement
            // Even if backend returns everything, we slice it here.
            if (studentId) {
                return data.filter(r => String(r.studentId) === String(studentId));
            }
            return data;
        } catch (e) {
            console.warn("API Error, falling back to mocks filtered");
            // MOCK FALLBACK
            if (studentId) {
                return MOCK.requests.filter(r => String(r.studentId) === String(studentId));
            }
            return [...MOCK.requests];
        }
    },
    createRequest: async (reqData) => {
        try {
            const res = await fetch(`${API_BASE_URL}/requests`, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify(reqData)
            });
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            const newReq = { ...reqData, id: Date.now(), lecturerStatus: 'Pending', mentorStatus: 'Pending' };
            MOCK.requests.unshift(newReq);
            return newReq;
        }
    },
    requestAction: async (id, role, action, comment = '') => {
        try {
            const res = await fetch(`${API_BASE_URL}/requests/action`, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify({ id, role, action, comment })
            });
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            console.warn("Backend Unreachable. Using Mock Data.");
            const req = MOCK.requests.find(r => r.id === id);
            if (req) {
                if (role === 'lecturer') req.lecturerStatus = action;
                else req.mentorStatus = action;
            }
            return { success: true };
        }
    },



    // --- Mappings ---
    getMappings: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/mappings`, { headers: HEADERS });
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            return { ...MOCK.mappings };
        }
    },
    updateMapping: async (studentId, lecturerId, mentorId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/mappings`, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify({ studentId, lecturerId, mentorId })
            });
            if (!res.ok) throw new Error('API Error');
            return await res.json();
        } catch (e) {
            MOCK.mappings[studentId] = { lecturerId, mentorId };
            return { success: true };
        }
    }
};
