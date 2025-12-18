import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  LogOut,
  FileText,
  Send,
  Menu,
  X,
  Bell,
  Search,
  Filter,
  Briefcase,
  Building,
  Download,
  FileSpreadsheet,
  Printer,
  Settings,
  Users,
  Link as LinkIcon,
  Plus,
  Trash2 as Trash, // Alias Trash2 as Trash to fix usage in AdminDashboard
  Save,
  BarChart3,
  TrendingUp,
  Lock,
  Mail,
  Phone,
  Shield,
  UserCog,
  Paperclip,
  Pencil
} from 'lucide-react';

import { api } from './services/api';

const USER_ROLES = {
  STUDENT: { name: "Mahasiswa Magang", role: "student" },
  LECTURER: { name: "Dosen Pembimbing", role: "lecturer" },
  MENTOR: { name: "Mitra PKL (Mentor)", role: "mentor" },
  ADMIN: { name: "Administrator", role: "admin" }
};

// --- Fungsi Helper Ekspor ---
const exportToCSV = (data, fileName) => {
  const headers = ["ID", "Nama", "NIM", "Tipe", "Mulai", "Selesai", "Alasan", "Status Dosen", "Status Mitra"];
  const rows = data.map(req => [
    req.id,
    `"${req.studentName}"`,
    `"${req.nim}"`,
    req.type,
    req.startDate,
    req.endDate,
    `"${req.reason}"`,
    req.lecturerStatus,
    req.mentorStatus
  ]);
  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handlePrintPDF = () => {
  window.print();
};

// --- Komponen Notifikasi ---
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;
  const bgClass = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  return (
    <div className={`fixed top-4 right-4 ${bgClass} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-bounce-in print:hidden`}>
      {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span>{message}</span>
    </div>
  );
};

// --- Komponen Kartu Statistik ---
const StatCard = ({ title, value, icon: Icon, colorClass, subtext }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
    <div className={`p - 3 rounded - lg ${colorClass} `}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

// --- KOMPONEN PENGATURAN UMUM (Reusable) ---
const SettingsView = ({ user, onSave, onUpdateUser }) => {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [password, setPassword] = useState({ old: '', new: '', confirm: '' });
  const [notifications, setNotifications] = useState({ email: true, wa: false });

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({ ...user, ...profile });
      onSave('Profil berhasil diperbarui!');
    }
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (password.old !== user.password) {
      alert("Password lama salah!");
      return;
    }
    if (password.new !== password.confirm) {
      alert("Password baru dan konfirmasi tidak cocok!");
      return;
    }
    if (onUpdateUser) {
      onUpdateUser({ ...user, password: password.new });
      setPassword({ old: '', new: '', confirm: '' });
      onSave('Password berhasil diubah!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Profil */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <UserCog className="text-blue-600" size={20} />
            <h3 className="font-bold text-lg">Edit Profil</h3>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Lengkap</label>
              <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full p-2 border rounded-lg text-sm bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full pl-9 p-2 border rounded-lg text-sm bg-gray-50" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">No. WhatsApp</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input type="text" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full pl-9 p-2 border rounded-lg text-sm bg-gray-50" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2">
              <Save size={16} /> Simpan Profil
            </button>
          </form>
        </div>

        {/* Card: Password */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <Shield className="text-orange-600" size={20} />
            <h3 className="font-bold text-lg">Ganti Password</h3>
          </div>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Password Lama</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input type="password" value={password.old} onChange={e => setPassword({ ...password, old: e.target.value })} className="w-full pl-9 p-2 border rounded-lg text-sm bg-gray-50" placeholder="••••••" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Password Baru</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input type="password" value={password.new} onChange={e => setPassword({ ...password, new: e.target.value })} className="w-full pl-9 p-2 border rounded-lg text-sm bg-gray-50" placeholder="••••••" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Konfirmasi Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input type="password" value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} className="w-full pl-9 p-2 border rounded-lg text-sm bg-gray-50" placeholder="••••••" />
              </div>
            </div>
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2">
              <CheckCircle size={16} /> Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Card: Notifikasi */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2"><Bell size={20} className="text-yellow-500" /> Preferensi Notifikasi</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="text-gray-500" size={18} />
              <div>
                <p className="text-sm font-medium text-gray-800">Notifikasi Email</p>
                <p className="text-xs text-gray-500">Terima update status izin via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={notifications.email} onChange={() => setNotifications({ ...notifications, email: !notifications.email })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="text-gray-500" size={18} />
              <div>
                <p className="text-sm font-medium text-gray-800">Notifikasi WhatsApp</p>
                <p className="text-xs text-gray-500">Terima pesan WA saat status berubah</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={notifications.wa} onChange={() => setNotifications({ ...notifications, wa: !notifications.wa })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- Komponen Login ---
const LoginView = ({ users, onLogin, showNotification }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await api.login(identifier, password);
      onLogin(user);
    } catch (err) {
      // showNotification is good, but inline alert is better for login
      // showNotification(err.message || "Login gagal/salah password", "error");
      setError(err.message || "Username atau Password salah!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3">
            <Briefcase className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Selamat Datang</h1>
          <p className="text-gray-500 text-sm mt-2">Silakan login untuk mengakses sistem E-Magang</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-pulse">
            <XCircle size={18} className="shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">ID Pengguna</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Username / NIM / Email / Kode"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <XCircle size={18} /> : <CheckCircle size={18} className="rotate-45" />}
                {/* Simplified Icon for visibility toggle */}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <a href="#" className="text-xs text-blue-600 hover:underline">Lupa password?</a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : <LogOut className="rotate-180" size={18} />}
            {isLoading ? 'Memproses...' : 'Masuk Sistem'}
          </button>
        </form>

        <div className="mt-8 text-center bg-blue-50 p-4 rounded-xl border border-blue-100 hidden">
          <button
            onClick={() => {
              if (window.confirm("Apakah Anda yakin ingin mereset data?")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="text-xs text-red-500 hover:text-red-700 underline flex items-center justify-center gap-1 w-full"
          >
            <Trash size={12} /> Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Komponen Utama Aplikasi ---
// --- Komponen Utama Aplikasi ---
// --- DEBUG BAR (Mobile Troubleshooting) ---
const DebugBar = ({ currentUser }) => {
  const [ls, setLs] = useState('');
  const [apiUrl] = useState(import.meta.env.VITE_API_URL || 'UNDEFINED');

  const [backendStatus, setBackendStatus] = useState('CHECKING');

  useEffect(() => {
    const check = () => {
      const saved = localStorage.getItem('currentUser');
      setLs(saved ? 'PRESENT' : 'EMPTY');
    };
    const pingBackend = async () => {
      try {
        // Ping health check endpoint (root /)
        // Adjust URL to remove /api/e-izin/v1 part for root check, or just check /users
        const baseUrl = apiUrl.replace('/api/e-izin/v1', '');
        const res = await fetch(baseUrl || 'http://localhost:3000');
        if (res.ok) setBackendStatus('ONLINE 🟢');
        else setBackendStatus(`ERROR ${res.status} 🔴`);
      } catch (e) {
        setBackendStatus('OFFLINE 🔴');
      }
    };

    check();
    pingBackend();
    const interval = setInterval(() => { check(); pingBackend(); }, 5000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // if (!currentUser && ls === 'EMPTY') return null; // ALWAYS SHOW FOR DEBUGGING

  return (
    <div className="fixed bottom-0 left-0 w-full bg-yellow-300 text-black text-[10px] p-1 font-mono z-[100] break-all border-t border-black opacity-90 flex justify-between px-2">
      <span><b>DEBUG v3:</b> User={currentUser ? currentUser.username : 'NULL'} | Storage={ls}</span>
      <span>API={backendStatus}</span>
    </div>
  );
};

export default function App() {
  // ... existing state ...
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse session", e);
      return null;
    }
  });
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [mappings, setMappings] = useState({});
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load Initial Data
  const loadData = async () => {
    try {
      const [usersData, requestsData, mappingsData] = await Promise.all([
        api.getUsers(),
        // Pass studentId ONLY if role is student to filtering data on backend
        api.getRequests(currentUser?.role === 'student' ? currentUser.id : null),
        api.getMappings()
      ]);
      setUsers(usersData);
      setRequests(requestsData);
      setMappings(mappingsData);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]); // Reload when user context changes (e.g. login)

  // --- AUTO LOGOUT (5 Minutes Inactivity) ---
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId;
    const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 Minutes

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        alert("Sesi Anda telah berakhir karena tidak aktif selama 5 menit.");
        handleLogout();
      }, TIMEOUT_DURATION);
    };

    // Events to track activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    resetTimer(); // Start timer initially

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [currentUser]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    showNotification(`Masuk sebagai ${user.name}`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setIsMobileMenuOpen(false);
  };

  // --- Actions ---
  const handleAddUser = async (newUser) => {
    try {
      await api.createUser(newUser);
      showNotification('Pengguna berhasil ditambahkan', 'success');
      loadData();
    } catch (e) {
      showNotification('Gagal menambah user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Yakin hapus user ini?")) return;
    try {
      await api.deleteUser(userId);
      showNotification('Pengguna dihapus', 'success');
      loadData();
    } catch (e) {
      showNotification('Gagal menghapus user', 'error');
    }
  };

  const handleUpdateMapping = async (studentId, lecturerId, mentorId) => {
    try {
      await api.updateMapping(studentId, lecturerId, mentorId);
      loadData(); // Mappings update rarely needs notification, just refresh
    } catch (e) {
      showNotification('Gagal update plotting', 'error');
    }
  };

  const handleSubmitPermission = async (requestData) => {
    try {
      // Backend api.createRequest expects studentId, type, startDate, endDate, reason, attachmentUrl
      await api.createRequest({
        ...requestData,
        studentId: currentUser.id
      });
      showNotification('Perizinan berhasil dikirim! Menunggu Dosen.', 'success');
      loadData();
    } catch (e) {
      showNotification('Gagal mengirim izin', 'error');
    }
  };

  const handleApproval = async (id, role, action, comment) => {
    try {
      await api.requestAction(id, role, action, comment);
      const actor = role === 'lecturer' ? 'Dosen' : 'Mitra';
      const statusText = action === 'Approved' ? 'disetujui' : 'ditolak';
      showNotification(`Perizinan telah ${statusText} oleh ${actor} `, action === 'Approved' ? 'success' : 'error');
      loadData();
    } catch (e) {
      showNotification('Gagal update status', 'error');
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const result = await api.updateUser(updatedUser.id, updatedUser);
      setCurrentUser(result); // Update local session 
      localStorage.setItem('currentUser', JSON.stringify(result));
      showNotification('Profil berhasil diperbarui', 'success');
      loadData();
    } catch (e) {
      showNotification('Gagal update user', 'error');
    }
  };

  const handleAdminUpdateUser = async (updatedUser) => {
    try {
      await api.updateUser(updatedUser.id, updatedUser);
      showNotification('Data pengguna berhasil diperbarui', 'success');
      loadData();
    } catch (e) {
      showNotification('Gagal update user', 'error');
    }
  };

  // --- Render Login Screen ---
  if (!currentUser) {
    return <LoginView users={users} onLogin={handleLogin} showNotification={showNotification} />;
  }

  // --- Layout Dashboard ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row print:bg-white">
      {/* Sidebar */}
      <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-20 print:hidden">
        <div className="flex items-center gap-2 font-bold text-blue-800">
          <Briefcase size={24} /> E-Magang
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`fixed inset-0 z-10 bg-black/50 md:hidden transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>

      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between transition-transform z-20 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className={`p-2 rounded-lg ${currentUser.role === 'admin' ? 'bg-gray-800' : 'bg-blue-600'}`}>
              <Briefcase className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-800">E-Magang</h1>
              <p className="text-xs text-gray-500">Sistem PKL</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium flex items-center gap-3">
              <FileText size={20} /> Dashboard
            </div>
          </div>
        </div>
        <div className="border-t pt-6">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
              ${currentUser.role === 'student' ? 'bg-blue-500' :
                currentUser.role === 'lecturer' ? 'bg-indigo-500' :
                  currentUser.role === 'mentor' ? 'bg-orange-500' : 'bg-gray-800'
              }`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 capitalize truncate">{currentUser.role === 'mentor' ? 'Mitra Industri' : currentUser.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentUser.role === 'admin' ? 'Dashboard Administrator' :
                currentUser.role === 'student' ? 'Izin Magang Saya' :
                  'Validasi Perizinan'}
            </h2>
            <p className="text-gray-500">
              {currentUser.role === 'admin' ? 'Kelola Data Pengguna, Statistik, dan Plotting.' :
                'Selamat datang di sistem perizinan magang.'}
            </p>
          </div>
        </header>

        {/* Content based on Role */}
        {currentUser.role === 'admin' ? (
          <AdminDashboard
            users={users}
            requests={requests}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            mappings={mappings}
            onUpdateMapping={handleUpdateMapping}
            showNotification={showNotification}
            currentUser={currentUser}
            onUpdateUser={handleAdminUpdateUser}
          />
        ) : currentUser.role === 'student' ? (
          <StudentDashboard requests={requests} onSubmit={handleSubmitPermission} mappings={mappings} users={users} showNotification={showNotification} currentUser={currentUser} onUpdateUser={handleUpdateUser} />
        ) : (
          <ReviewerDashboard currentUserRole={currentUser.role} requests={requests} onAction={handleApproval} mappings={mappings} showNotification={showNotification} currentUser={currentUser} onUpdateUser={handleUpdateUser} />
        )}

        {notification.message && <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />}
        <DebugBar currentUser={currentUser} />
      </main>
    </div>
  );
}
// --- DASHBOARD ADMIN ---
// --- DASHBOARD ADMIN ---
function AdminDashboard({ users, requests, onAddUser, onDeleteUser, mappings, onUpdateMapping, showNotification, currentUser, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [newUser, setNewUser] = useState({ name: '', username: '', role: 'student', code: '', password: '' });
  const [editingId, setEditingId] = useState(null); // State for editing mode

  // LOGIC TAHUN TERBARU (DINAMIS)
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const students = users.filter(u => u.role === 'student');
  const lecturers = users.filter(u => u.role === 'lecturer');
  const mentors = users.filter(u => u.role === 'mentor');

  const filteredRequests = requests.filter(r => r.startDate.startsWith(selectedYear));
  const totalIzin = filteredRequests.length;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newUser.name && newUser.code && newUser.password && newUser.username) {
      if (editingId) {
        // Edit Mode
        onUpdateUser({ ...newUser, id: editingId });
        setEditingId(null);
        showNotification("Data pengguna diperbarui", "success");
      } else {
        // Add Mode
        onAddUser(newUser);
      }
      setNewUser({ name: '', username: '', role: 'student', code: '', password: '' }); // Reset form
    }
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setNewUser({ ...user }); // Populate form
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewUser({ name: '', username: '', role: 'student', code: '', password: '' });
  };

  const handleSavePlotting = () => {
    showNotification('Konfigurasi Plotting Berhasil Disimpan!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        <button onClick={() => setActiveTab('stats')} className={`pb-3 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'stats' ? 'text-gray-800' : 'text-gray-500'}`}>
          <BarChart3 size={16} /> Statistik & Rekap
          {activeTab === 'stats' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-800 rounded-t-full"></div>}
        </button>
        <button onClick={() => setActiveTab('users')} className={`pb-3 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'text-gray-800' : 'text-gray-500'}`}>
          <Users size={16} /> Manajemen Pengguna
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-800 rounded-t-full"></div>}
        </button>
        <button onClick={() => setActiveTab('plotting')} className={`pb-3 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'plotting' ? 'text-gray-800' : 'text-gray-500'}`}>
          <LinkIcon size={16} /> Plotting & Mapping
          {activeTab === 'plotting' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-800 rounded-t-full"></div>}
        </button>
        {/* TAB BARU: PENGATURAN ADMIN */}
        <button onClick={() => setActiveTab('settings')} className={`pb-3 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'settings' ? 'text-gray-800' : 'text-gray-500'}`}>
          <Settings size={16} /> Pengaturan
          {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-800 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-gray-700">Ringkasan Data</h3>
            <div className="flex flex-wrap items-center gap-2">
              {/* --- ADMIN EXPORT BUTTONS --- */}
              <button onClick={() => handlePrintPDF()} title="Export PDF" className="p-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors">
                <Printer size={18} />
              </button>
              <button onClick={() => exportToCSV(filteredRequests, `Admin_Rekap_${selectedYear} `)} title="Export Excel" className="p-2 text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                <FileSpreadsheet size={18} />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1 hidden md:block"></div>

              <span className="text-sm text-gray-500 whitespace-nowrap">Filter Tahun:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
              >
                <option value={currentYear}>{currentYear}</option>
                <option value={currentYear - 1}>{currentYear - 1}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Mahasiswa" value={students.length} icon={Users} colorClass="bg-blue-500" subtext="Terdaftar di sistem" />
            <StatCard title="Total Dosen" value={lecturers.length} icon={BookOpen} colorClass="bg-indigo-500" subtext="Dosen Pembimbing" />
            <StatCard title="Total Mitra" value={mentors.length} icon={Building} colorClass="bg-orange-500" subtext="Mitra Industri" />
            <StatCard title={`Total Izin (${selectedYear})`} value={totalIzin} icon={FileText} colorClass="bg-green-500" subtext="Semua status pengajuan" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h4 className="font-bold text-gray-700">Aktivitas Izin Terbaru ({selectedYear})</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3">Tgl Pengajuan</th>
                    <th className="px-6 py-3">Mahasiswa</th>
                    <th className="px-6 py-3">Dosen & Mitra</th>
                    <th className="px-6 py-3">Detail Izin</th>
                    <th className="px-6 py-3">Status Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.slice(0, 10).map(req => {
                    const map = mappings[req.studentId] || {};
                    const lecturer = users.find(u => u.id === map.lecturerId);
                    const mentor = users.find(u => u.id === map.mentorId);
                    const submitDate = req.createdAt ? new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-';

                    return (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                          {submitDate}
                          <div className="text-[10px] text-gray-400">{req.createdAt ? new Date(req.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{req.studentName}</div>
                          <div className="text-xs text-gray-500">{req.nim}</div>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 w-fit px-1.5 py-0.5 rounded">
                              <User size={10} /> {lecturer ? lecturer.name : '-'}
                            </span>
                            <span className="flex items-center gap-1 text-orange-700 bg-orange-50 w-fit px-1.5 py-0.5 rounded">
                              <Building size={10} /> {mentor ? mentor.name : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800 text-xs">{req.type}</div>
                          <div className="text-xs text-gray-500">{req.startDate}</div>
                        </td>
                        <td className="px-6 py-4">
                          {req.mentorStatus === 'Approved' ? <span className="bg-green-100 text-green-700 py-1 px-2 rounded-full text-xs font-bold">Disetujui</span> :
                            req.mentorStatus === 'Rejected' || req.lecturerStatus === 'Rejected' ? <span className="bg-red-100 text-red-700 py-1 px-2 rounded-full text-xs font-bold">Ditolak</span> :
                              <span className="bg-yellow-100 text-yellow-700 py-1 px-2 rounded-full text-xs font-bold">Proses</span>}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRequests.length === 0 && (
                    <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Tidak ada data izin di tahun ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ... (USERS & PLOTTING tabs remain same) ... */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              {editingId ? <Pencil size={18} /> : <Plus size={18} />}
              {editingId ? "Edit Pengguna" : "Tambah Pengguna"}
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Lengkap</label>
                <input type="text" className="w-full p-2 border rounded-lg text-sm" placeholder="Contoh: Budi Santoso" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Peran (Role)</label>
                <select className="w-full p-2 border rounded-lg text-sm" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="student">Mahasiswa</option>
                  <option value="lecturer">Dosen Pembimbing</option>
                  <option value="mentor">Mitra PKL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {newUser.role === 'mentor' ? 'Nama Perusahaan / Mitra' : newUser.role === 'student' ? 'NIM' : 'NIP / NIDN'}
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder={newUser.role === 'mentor' ? "Contoh: PT. Inovasi Digital" : "Contoh: 2023001"}
                  value={newUser.code}
                  onChange={e => setNewUser({ ...newUser, code: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Username Login</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-9 p-2 border rounded-lg text-sm"
                    placeholder="Contoh: budisantoso"
                    value={newUser.username}
                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Password Login</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-9 p-2 border rounded-lg text-sm"
                    placeholder="Buat Password Awal"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">*User bisa mengganti password ini nanti.</p>
              </div>
              <div className="flex gap-2">
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="w-1/3 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">Batal</button>
                )}
                <button type="submit" className={`flex-1 ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-800 hover:bg-gray-900'} text-white py-2 rounded-lg text-sm font-medium transition-colors`}>
                  {editingId ? "Simpan Perubahan" : "Tambah User"}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Daftar Pengguna Aktif</h3>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">Total: {users.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 whitespace-nowrap">Nama</th>
                    <th className="px-6 py-3 whitespace-nowrap">Username</th>
                    <th className="px-6 py-3 whitespace-nowrap">ID Code</th>
                    <th className="px-6 py-3 whitespace-nowrap">Role</th>
                    <th className="px-6 py-3 text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{user.username || '-'}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{user.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'student' ? 'bg-blue-100 text-blue-800' : user.role === 'lecturer' ? 'bg-indigo-100 text-indigo-800' : 'bg-orange-100 text-orange-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-1 whitespace-nowrap">
                        <button onClick={() => handleEditClick(user)} className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors" title="Edit User">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => onDeleteUser(user.id)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors" title="Hapus User">
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plotting' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Plotting Pembimbing & Mitra</h3>
              <p className="text-gray-500 text-sm">Tentukan Dosen Pembimbing dan Mitra Industri untuk setiap Mahasiswa.</p>
            </div>
            <button
              onClick={handleSavePlotting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Save size={18} /> Simpan Perubahan
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 w-1/3 whitespace-nowrap">Mahasiswa</th>
                  <th className="px-6 py-3 w-1/3 whitespace-nowrap">Dosen Pembimbing</th>
                  <th className="px-6 py-3 w-1/3 whitespace-nowrap">Mitra PKL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map(student => {
                  const currentMap = mappings[student.id] || {};
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.code}</div>
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <select
                          className="w-full p-2 border border-gray-200 rounded-lg bg-white focus:border-blue-500 outline-none"
                          value={currentMap.lecturerId || ''}
                          onChange={(e) => onUpdateMapping(student.id, parseInt(e.target.value), currentMap.mentorId)}
                        >
                          <option value="">-- Pilih Dosen --</option>
                          {lecturers.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <select
                          className="w-full p-2 border border-gray-200 rounded-lg bg-white focus:border-orange-500 outline-none"
                          value={currentMap.mentorId || ''}
                          onChange={(e) => onUpdateMapping(student.id, currentMap.lecturerId, parseInt(e.target.value))}
                        >
                          <option value="">-- Pilih Mitra --</option>
                          {mentors.map(m => (
                            <option key={m.id} value={m.id}>{m.name} - {m.code}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW PENGATURAN BARU UNTUK ADMIN */}
      {activeTab === 'settings' && (
        <SettingsView user={currentUser} onSave={(msg) => showNotification(msg, 'success')} onUpdateUser={onUpdateUser} />
      )}
    </div>
  );
}

// --- Dashboard Mahasiswa ---
function StudentDashboard({ requests, onSubmit, mappings, users, showNotification, currentUser, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('form');
  const [formData, setFormData] = useState({ type: 'Sakit', startDate: '', endDate: '', reason: '', evidence: null });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null); // State to show letter

  const myId = currentUser.id;
  const myMap = mappings[myId] || {};
  const myLecturer = users.find(u => u.id === myMap.lecturerId);
  const myMentor = users.find(u => u.id === myMap.mentorId);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification("Ukuran file maksimal 5MB", "error");
        return;
      }
      setFormData({ ...formData, evidence: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitHandler = (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) return;

    // Use currentUser data for the request
    const requestData = {
      ...formData,
      studentName: currentUser.name,
      nim: currentUser.code, // Assuming 'code' holds the NIM for students
      attachmentUrl: previewUrl, // Mocking URL for now
      attachmentName: formData.evidence ? formData.evidence.name : null
    };

    onSubmit(requestData);
    setFormData({ type: 'Sakit', startDate: '', endDate: '', reason: '', evidence: null });
    setPreviewUrl(null);
    setActiveTab('history');
  };

  const getOverallStatus = (req) => {
    if (req.lecturerStatus === 'Rejected' || req.mentorStatus === 'Rejected') return 'Rejected';
    if (req.lecturerStatus === 'Approved' && req.mentorStatus === 'Approved') return 'Approved';
    if (req.lecturerStatus === 'Approved') return 'Waiting Mentor';
    return 'Waiting Lecturer';
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 print:hidden overflow-x-auto">
        <button onClick={() => setActiveTab('form')} className={`pb-3 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'form' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Send size={16} /> Ajukan Izin
          {activeTab === 'form' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
        <button onClick={() => setActiveTab('history')} className={`pb-3 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Clock size={16} /> Riwayat & Status
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
        <button onClick={() => setActiveTab('settings')} className={`pb-3 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Settings size={16} /> Pengaturan
          {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'form' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden mb-6">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-4">
              <div className="bg-white p-2 rounded-full shadow-sm"><User size={20} className="text-indigo-600" /></div>
              <div>
                <p className="text-xs text-indigo-500 font-bold uppercase">Dosen Pembimbing</p>
                <p className="font-semibold text-gray-800">{myLecturer ? myLecturer.name : "Belum diplot"}</p>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-4">
              <div className="bg-white p-2 rounded-full shadow-sm"><Building size={20} className="text-orange-600" /></div>
              <div>
                <p className="text-xs text-orange-500 font-bold uppercase">Mitra / Mentor</p>
                <p className="font-semibold text-gray-800">
                  {myMentor ? `${myMentor.name} - ${myMentor.code} ` : "Belum diplot"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 max-w-2xl print:hidden">
            <form onSubmit={submitHandler} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Izin</label>
                  <select name="type" value={formData.type} onChange={handleFormChange} className="w-full rounded-lg border-gray-300 border px-4 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none">
                    <option value="Sakit">Sakit</option>
                    <option value="Izin">Izin (Keperluan Mendesak)</option>
                    <option value="Dispensasi">Dispensasi (Lomba/Tugas)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleFormChange} className="w-full rounded-lg border-gray-300 border px-4 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleFormChange} className="w-full rounded-lg border-gray-300 border px-4 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alasan Lengkap</label>
                <textarea name="reason" rows="4" value={formData.reason} onChange={handleFormChange} placeholder="Jelaskan alasan..." className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none resize-none" required></textarea>
              </div>
              {/* New File Attachment Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran Bukti (Opsional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Paperclip size={24} />
                    <span className="text-sm">{formData.evidence ? formData.evidence.name : "Klik untuk upload (PDF/Gambar, Max 5MB)"}</span>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <button type="button" onClick={() => {
                  if (!myMap.lecturerId || !myMap.mentorId) {
                    showNotification("Tidak dapat mengirim: Dosen/Mitra belum ditentukan admin.", "error");
                    return;
                  }

                  // CEK TANGGAL BERTABRAKAN
                  const isOverlap = requests.some(r => {
                    if (r.studentId !== currentUser.id && r.nim !== currentUser.code) return false;
                    // Cek range tanggal
                    const startA = new Date(formData.startDate);
                    const endA = new Date(formData.endDate);
                    const startB = new Date(r.startDate);
                    const endB = new Date(r.endDate);

                    return (startA <= endB && endA >= startB);
                  });

                  if (isOverlap) {
                    showNotification("Gagal: Anda sudah punya izin di tanggal yang sama!", "error");
                    return;
                  }

                  submitHandler({ preventDefault: () => { } });
                }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
                  <Send size={18} /> Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2 mb-4 print:hidden">
            <button onClick={() => handlePrintPDF()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
              <Printer size={16} /> Export PDF
            </button>
            <button onClick={() => exportToCSV(requests.filter(r => r.nim === currentUser.code), 'Data_Izin_Saya')} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
              <FileSpreadsheet size={16} /> Export Excel
            </button>
          </div>
          {requests.filter(r => String(r.studentId) === String(currentUser.id)).map((req) => {
            const status = getOverallStatus(req);
            const isApproved = status === 'Approved';

            return (
              <div
                key={req.id}
                onClick={() => isApproved && setSelectedLetter(req)}
                className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all break-inside-avoid
                  ${isApproved ? 'hover:shadow-md cursor-pointer hover:border-green-300 ring-offset-2 hover:ring-2 ring-green-100' : ''}
                `}
                title={isApproved ? "Klik untuk lihat Surat Izin" : "Menunggu persetujuan"}
              >
                <div className="flex gap-4">
                  <div className={`p-3 rounded-full h-fit shrink-0 ${req.type === 'Sakit' ? 'bg-red-100 text-red-600' : req.type === 'Dispensasi' ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {req.type === 'Sakit' ? <User size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800">{req.type}</span>
                      <span className="text-gray-500 text-xs">• {req.startDate} s.d {req.endDate}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1 mb-2">{req.reason}</p>
                    {req.attachmentUrl && (
                      <a href={req.attachmentUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors w-fit mb-2">
                        <Paperclip size={12} /> {req.attachmentName || "Lihat Lampiran"}
                      </a>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className={`flex items-center gap-1 ${req.lecturerStatus === 'Approved' ? 'text-green-600 font-medium' : req.lecturerStatus === 'Rejected' ? 'text-red-500' : 'text-gray-400'}`}>
                        {req.lecturerStatus === 'Approved' ? <CheckCircle size={12} /> : req.lecturerStatus === 'Rejected' ? <XCircle size={12} /> : <Clock size={12} />} Dosen
                      </span>
                      <span className="text-gray-300">→</span>
                      <span className={`flex items-center gap-1 ${req.mentorStatus === 'Approved' ? 'text-green-600 font-medium' : req.mentorStatus === 'Rejected' ? 'text-red-500' : 'text-gray-400'}`}>
                        {req.mentorStatus === 'Approved' ? <CheckCircle size={12} /> : req.mentorStatus === 'Rejected' ? <XCircle size={12} /> : <Clock size={12} />} Mitra
                      </span>
                    </div>

                    {(req.lecturerComment || req.mentorComment) && (
                      <div className="mt-3 bg-gray-50 p-2 rounded-lg text-xs border border-gray-100">
                        {req.lecturerComment && (
                          <p className="text-gray-600 mb-1">
                            <span className="font-semibold text-indigo-600">Catatan Dosen:</span> {req.lecturerComment}
                          </p>
                        )}
                        {req.mentorComment && (
                          <p className="text-gray-600">
                            <span className="font-semibold text-orange-600">Catatan Mitra:</span> {req.mentorComment}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={status} />
                  {isApproved && <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">Klik untuk Cetak Surat</span>}
                </div>
              </div>
            );
          })}
          {requests.filter(r => r.studentId === currentUser.id || r.nim === currentUser.code).length === 0 && (
            <div className="text-center py-10 text-gray-500">Belum ada riwayat pengajuan.</div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <SettingsView user={currentUser} onSave={(msg) => showNotification(msg, 'success')} onUpdateUser={onUpdateUser} />
      )}

      {/* RENDER MODAL SURAT IZIN */}
      {selectedLetter && (
        <PermissionLetterModal
          request={selectedLetter}
          onClose={() => setSelectedLetter(null)}
          lecturerName={myLecturer?.name}
          mentorName={myMentor?.name}
        />
      )}
    </div>
  );
}
// --- Dashboard Reviewer (Dosen & Mitra) ---
function ReviewerDashboard({ currentUserRole, requests, onAction, mappings, showNotification, currentUser, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'settings'
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  // LOGIC TAHUN TERBARU (DINAMIS)
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  // Action Modal State
  const [actionModal, setActionModal] = useState(null); // { id, role, action, studentName }
  const [commentText, setCommentText] = useState('');

  // Get unique years from requests
  const availableYears = useMemo(() => {
    const years = new Set([currentYear, currentYear - 1]); // Default min
    requests.forEach(req => {
      if (req.startDate) {
        years.add(parseInt(req.startDate.split('-')[0]));
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [requests, currentYear]);

  // Filter logic based on mapping (User Request)
  const isMappedToMe = (req) => {
    const map = mappings[req.studentId];
    if (currentUserRole === 'lecturer') return map?.lecturerId === currentUser.id;
    if (currentUserRole === 'mentor') return map?.mentorId === currentUser.id;
    return false;
  };

  // Filter requests based on logic
  const filteredRequests = requests.filter(req => {
    if (!isMappedToMe(req)) return false; // Enforce Mapping

    // NEW LOGIC: If I am a Mentor, hide requests that are ALREADY Rejected by Lecturer
    if (currentUserRole === 'mentor' && req.lecturerStatus === 'Rejected') {
      return false;
    }

    const matchesSearch = req.studentName.toLowerCase().includes(search.toLowerCase()) || req.nim.includes(search);
    let matchesFilter = true;
    if (filter === 'NeedAction') {
      matchesFilter = currentUserRole === 'lecturer' ? req.lecturerStatus === 'Pending' : (req.lecturerStatus === 'Approved' && req.mentorStatus === 'Pending');
    } else if (filter === 'History') {
      matchesFilter = currentUserRole === 'lecturer' ? req.lecturerStatus !== 'Pending' : (req.mentorStatus !== 'Pending' && req.lecturerStatus === 'Approved');
    }
    const isPending = currentUserRole === 'lecturer' ? req.lecturerStatus === 'Pending' : req.mentorStatus === 'Pending';

    // Logic: Year filter only applies to APPROVED/REJECTED requests. Pending always shows.
    const matchesYear = selectedYear === 'All' || isPending || req.startDate.startsWith(selectedYear);
    return matchesSearch && matchesFilter && matchesYear;
  });

  // Calculate Stats (also enforced by mapping)
  const allYearRequests = requests.filter(r => r.startDate.startsWith(selectedYear) && isMappedToMe(r));

  let stats = { totalStudents: 0, pending: 0, approved: 0 };
  if (currentUserRole === 'lecturer') {
    stats.totalStudents = new Set(allYearRequests.map(r => r.nim)).size;
    stats.pending = allYearRequests.filter(r => r.lecturerStatus === 'Pending').length;
    stats.approved = allYearRequests.filter(r => r.lecturerStatus === 'Approved').length;
  } else {
    // Mentors only care about requests already approved by lecturer (usually), but let's stick to simple mapping for totalStudents
    // For pending/approved counts, we follow the workflow
    const mentorRelevantReqs = allYearRequests.filter(r => r.lecturerStatus === 'Approved');
    stats.totalStudents = new Set(allYearRequests.map(r => r.nim)).size;
    stats.pending = mentorRelevantReqs.filter(r => r.mentorStatus === 'Pending').length;
    stats.approved = mentorRelevantReqs.filter(r => r.mentorStatus === 'Approved').length;
  }

  return (
    <div className="space-y-6">
      {/* Tabs Reviewer */}
      <div className="flex gap-4 border-b border-gray-200 print:hidden overflow-x-auto">
        <button onClick={() => setActiveTab('dashboard')} className={`pb-3 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'dashboard' ? 'text-gray-800' : 'text-gray-500'}`}>
          <FileText size={16} /> Daftar Perizinan
          {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-800 rounded-t-full"></div>}
        </button>
        <button onClick={() => setActiveTab('settings')} className={`pb-3 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${activeTab === 'settings' ? 'text-gray-800' : 'text-gray-500'}`}>
          <Settings size={16} /> Pengaturan
          {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-800 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Header Stats */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100 gap-4 print:hidden">
            <div>
              <h3 className="font-bold text-blue-900">Rekapitulasi Tahun {selectedYear}</h3>
              <p className="text-sm text-blue-600">Ringkasan aktivitas perizinan mahasiswa Anda.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-800">Pilih Tahun:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border border-blue-200 text-blue-800 text-sm rounded-lg focus:ring-blue-500 block p-2 outline-none cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <option value="All">Semua Tahun</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
            <StatCard title="Mhs. Mengajukan Izin" value={stats.totalStudents} icon={Users} colorClass="bg-indigo-500" subtext={`Total di tahun ${selectedYear} `} />
            <StatCard title="Menunggu Persetujuan" value={stats.pending} icon={Clock} colorClass="bg-yellow-500" subtext="Butuh tindakan Anda" />
            <StatCard title="Izin Disetujui" value={stats.approved} icon={CheckCircle} colorClass="bg-green-500" subtext={`Sudah di - ACC tahun ${selectedYear} `} />
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:hidden">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Cari Nama atau NIM..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <button onClick={() => handlePrintPDF()} title="Export PDF" className="p-2 text-gray-600 border rounded-lg hover:bg-gray-50">
                <Printer size={18} />
              </button>
              <button onClick={() => exportToCSV(filteredRequests, `Laporan_${currentUserRole}_${selectedYear} `)} title="Export Excel" className="p-2 text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
                <FileSpreadsheet size={18} />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2 hidden md:block"></div>
              <button onClick={() => setFilter('All')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'All' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}>
                Semua Data
              </button>
              <button onClick={() => setFilter('NeedAction')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'NeedAction' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}>
                <Clock size={16} /> Perlu Tindakan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.map((req) => {
              const showActionButtons = currentUserRole === 'lecturer' ? req.lecturerStatus === 'Pending' : (req.lecturerStatus === 'Approved' && req.mentorStatus === 'Pending');
              const myStatus = currentUserRole === 'lecturer' ? req.lecturerStatus : req.mentorStatus;
              const isFullAcc = req.lecturerStatus === 'Approved' && req.mentorStatus === 'Approved';

              return (
                <div key={req.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow break-inside-avoid">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {req.studentName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            {req.studentName}
                            {isFullAcc && (
                              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                                <CheckCircle size={10} className="fill-green-600 text-white" /> Full Approved
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-500">NIM: {req.nim}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${myStatus === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' : myStatus === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                        {myStatus === 'Pending' ? 'Perlu Review' : myStatus === 'Approved' ? 'Sudah Anda Setujui' : 'Anda Tolak'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Tanggal Izin</p>
                        <div className="flex items-center gap-2 font-medium text-gray-700">
                          <Calendar size={14} /> {req.startDate} <span className="text-gray-400">s/d</span> {req.endDate}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Kategori</p>
                        <div className="flex items-center gap-2 font-medium text-gray-700">
                          <FileText size={14} /> {req.type}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Alasan</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-2">{req.reason}</p>
                      {req.attachmentUrl && (
                        <a href={req.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors w-fit">
                          <Paperclip size={12} /> {req.attachmentName || "Lihat Lampiran Bukti"}
                        </a>
                      )}
                    </div>

                    <div className="flex gap-4 text-xs pt-3 border-t border-gray-50 mb-3">
                      <div className={`flex items-center gap-1 ${req.lecturerStatus === 'Approved' ? 'text-green-600' : 'text-gray-400'}`}>
                        {req.lecturerStatus === 'Approved' ? <CheckCircle size={12} /> : <Clock size={12} />} Dosen: {req.lecturerStatus}
                      </div>
                      <div className={`flex items-center gap-1 ${req.mentorStatus === 'Approved' ? 'text-green-600' : 'text-gray-400'}`}>
                        {req.mentorStatus === 'Approved' ? <CheckCircle size={12} /> : <Clock size={12} />} Mitra: {req.mentorStatus}
                      </div>
                    </div>

                    {showActionButtons && (
                      <div className="flex gap-3 pt-4 border-t border-gray-100 print:hidden">
                        <button onClick={() => { setActionModal({ id: req.id, role: currentUserRole, action: 'Rejected', studentName: req.studentName }); setCommentText(''); }} className="flex-1 py-2.5 px-4 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium flex justify-center items-center gap-2">
                          <XCircle size={16} /> Tolak
                        </button>
                        <button onClick={() => { setActionModal({ id: req.id, role: currentUserRole, action: 'Approved', studentName: req.studentName }); setCommentText(''); }} className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm flex justify-center items-center gap-2">
                          <CheckCircle size={16} /> Setujui
                        </button>
                      </div>

                    )}

                    {(req.lecturerComment || req.mentorComment) && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        {req.lecturerComment && (
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold text-indigo-600">Catatan Dosen:</span> {req.lecturerComment}
                          </p>
                        )}
                        {req.mentorComment && (
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-orange-600">Catatan Mitra:</span> {req.mentorComment}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredRequests.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <Filter size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Tidak ada data izin untuk tahun {selectedYear} atau filter ini.</p>
              </div>
            )}
          </div>
        </>
      )
      }

      {
        activeTab === 'settings' && (
          <SettingsView user={currentUser} onSave={(msg) => showNotification(msg, 'success')} onUpdateUser={onUpdateUser} />
        )
      }
      {/* CONFIRMATION MODAL */}
      {
        actionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
              <div className={`p-6 ${actionModal.action === 'Approved' ? 'bg-indigo-50 border-b border-indigo-100' : 'bg-red-50 border-b border-red-100'}`}>
                <h3 className={`text-lg font-bold flex items-center gap-2 ${actionModal.action === 'Approved' ? 'text-indigo-800' : 'text-red-800'}`}>
                  {actionModal.action === 'Approved' ? <CheckCircle /> : <XCircle />}
                  Konfirmasi {actionModal.action === 'Approved' ? 'Persetujuan' : 'Penolakan'}
                </h3>
                <p className="text-sm opacity-80 mt-1">
                  Anda akan {actionModal.action === 'Approved' ? 'menyetujui' : 'menolak'} izin <b>{actionModal.studentName}</b>.
                </p>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tambahkan Catatan / Komentar (Opsional):
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Contoh: Semoga lekas sembuh, atau Hati-hati di jalan..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-200 outline-none h-24 resize-none"
                ></textarea>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setActionModal(null)}
                    className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      onAction(actionModal.id, actionModal.role, actionModal.action, commentText);
                      setActionModal(null);
                    }}
                    className={`flex-1 py-2 text-white rounded-lg font-medium shadow-sm transition-colors ${actionModal.action === 'Approved' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

function StatusBadge({ status }) {
  const configs = {
    'Waiting Lecturer': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Menunggu Dosen' },
    'Waiting Mentor': { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Menunggu Mitra' },
    'Approved': { color: 'bg-green-100 text-green-700 border-green-200', label: 'Disetujui Final' },
    'Rejected': { color: 'bg-red-100 text-red-700 border-red-200', label: 'Ditolak' },
    'Pending': { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Proses' }
  };
  const config = configs[status] || configs['Pending'];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 whitespace-nowrap ${config.color}`}>
      {status === 'Approved' ? <CheckCircle size={14} /> : status === 'Rejected' ? <XCircle size={14} /> : <Clock size={14} />}
      {config.label}
    </span>
  );
}

// --- Komponen Surat Izin (Modal) ---
// --- Komponen Surat Izin (Modal) ---
const PermissionLetterModal = ({ request, onClose, lecturerName, mentorName }) => {
  if (!request) return null;

  const toRoman = (num) => {
    const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return roman[num - 1] || num;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Determine Effective Date (Approval Date or Current)
  const effectiveDateObj = request.approvedAt ? new Date(request.approvedAt) : new Date();

  // Format Number: ID/FST-ARS-IZIN/ROMAN_MONTH/YEAR
  const romanMonth = toRoman(effectiveDateObj.getMonth() + 1);
  const year = effectiveDateObj.getFullYear();
  const letterNumber = `${request.id}/FST-ARS-IZIN/${romanMonth}/${year}`;

  // Format Subject
  let subject = "Izin";
  if (request.type === 'Sakit') subject = "Izin Sakit";
  else if (request.type === 'Dispensasi') subject = "Izin Dispensasi";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto print:p-0 print:bg-white print:block">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-xl w-full relative print:shadow-none print:w-full print:max-w-none transition-all scale-100 origin-center max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 print:hidden">
          <XCircle size={28} />
        </button>

        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wider mb-2">Surat Izin Magang</h1>
          <p className="text-gray-600 font-serif italic text-xs">Sistem Informasi Perizinan Praktik Kerja Lapangan</p>
        </div>

        <div className="space-y-4 font-serif text-gray-800 leading-relaxed text-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p>Nomor : {letterNumber}</p>
              <p>Hal : <span className="font-bold">{subject}</span></p>
            </div>
            <div className="text-right">
              <p>{effectiveDateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <p className="mt-4">
            Dengan hormat,<br />
            Yang bertanda tangan di bawah ini menerangkan bahwa mahasiswa:
          </p>

          <table className="w-full ml-2">
            <tbody>
              <tr>
                <td className="w-32 py-1 font-semibold">Nama</td>
                <td className="py-1">: {request.studentName}</td>
              </tr>
              <tr>
                <td className="w-32 py-1 font-semibold">NIM</td>
                <td className="py-1">: {request.nim || '-'}</td>
              </tr>
              <tr>
                <td className="w-32 py-1 font-semibold">Kategori Izin</td>
                <td className="py-1">: {request.type}</td>
              </tr>
            </tbody>
          </table>

          <p>
            Telah diberikan izin untuk tidak mengikuti kegiatan magang/PKL pada:
          </p>

          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg print:border-black print:bg-white">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Mulai Tanggal</p>
                <p className="font-bold text-base">{formatDate(request.startDate)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Sampai Tanggal</p>
                <p className="font-bold text-base">{formatDate(request.endDate)}</p>
              </div>
              <div className="col-span-2 mt-1">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Keterangan / Alasan</p>
                <p className="font-medium text-sm">{request.reason}</p>
              </div>
            </div>
          </div>

          <p className="mt-4">
            Demikian surat izin ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
          </p>

          <div className="flex justify-between mt-10 pt-4 break-inside-avoid">
            <div className="text-center w-48">
              <p className="text-xs mb-2 text-gray-500">Mengetahui,<br />Dosen Pembimbing</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${window.location.origin}?letter_id=${request.id}&role=lecturer`)}`}
                alt="QR Code Dosen"
                className="mx-auto mb-2 opacity-90 w-20 h-20"
              />
              <p className="font-bold border-b border-black inline-block pb-1 min-w-[120px] text-sm">{lecturerName || "........................"}</p>
            </div>
            <div className="text-center w-48">
              <p className="text-xs mb-2 text-gray-500">Menyetujui,<br />Mitra / Mentor</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${window.location.origin}?letter_id=${request.id}&role=mentor`)}`}
                alt="QR Code Mitra"
                className="mx-auto mb-2 opacity-90 w-20 h-20"
              />
              <p className="font-bold border-b border-black inline-block pb-1 min-w-[120px] text-sm">{mentorName || "........................"}</p>
            </div>
          </div>
        </div>

        {/* Tombol Aksi (Print & Close) */}
        <div className="mt-8 flex gap-3 print:hidden border-t pt-4">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors">
            Tutup
          </button>
          <button onClick={() => window.print()} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2">
            <Printer size={18} /> Cetak / Simpan PDF
          </button>
        </div>

      </div>
    </div>



  );
};
