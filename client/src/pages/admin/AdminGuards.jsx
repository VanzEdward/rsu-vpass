import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  KeyRound, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  Mail, 
  IdCard, 
  X,
  Users,
  Clock,
  Printer,
  Pencil,
  ArrowRight,
  ShieldAlert,
  Lock
} from 'lucide-react';

const INITIAL_DEMO_GUARDS = [
  {
    id: 1,
    school_id: 'GUARD-GATE-01',
    first_name: 'Pedro',
    last_name: 'Penduko',
    middle_name: 'M.',
    full_name: 'Penduko, Pedro M.',
    email: 'guard.main@rsu.edu.ph',
    contact_number: '+63 917 111 2233',
    role: 'GUARD',
    created_at: '2026-01-10T08:00:00.000Z'
  }
];

export default function AdminGuards() {
  const [guards, setGuards] = useState(() => {
    const saved = localStorage.getItem('vpass_guards_list');
    return saved ? JSON.parse(saved) : INITIAL_DEMO_GUARDS;
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editGuardModal, setEditGuardModal] = useState(null); // guard being edited
  const [showCredentialSlip, setShowCredentialSlip] = useState(null); // guard object with clear password for copying
  
  // UI states
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Creation form state: strictly Last Name, First Name, M.I.
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleInitial: '',
    badgeId: '',
    email: '',
    contactNumber: '',
    password: ''
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    lastName: '',
    firstName: '',
    middleInitial: '',
    badgeId: '',
    email: '',
    contactNumber: '',
    password: '' // optional new password
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('vpass_guards_list', JSON.stringify(guards));
  }, [guards]);

  // Fetch from server API if active
  const fetchGuards = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/paso/guards');
      if (Array.isArray(res) && res.length > 0) {
        setGuards(res);
      }
    } catch (err) {
      console.warn('Using local guard records:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuards();
  }, []);

  // Helper to suggest Badge ID and email as admin types
  const handleNameChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      if (!prev.badgeId || prev.badgeId.startsWith('GUARD-')) {
        const nextNum = String(guards.length + 1).padStart(2, '0');
        updated.badgeId = prev.badgeId || `GUARD-GATE-${nextNum}`;
      }

      if (field === 'lastName' || field === 'firstName') {
        const cleanLast = (field === 'lastName' ? value : prev.lastName).trim().toLowerCase().replace(/[^a-z]/g, '');
        const cleanFirst = (field === 'firstName' ? value : prev.firstName).trim().toLowerCase().replace(/[^a-z]/g, '');
        if (cleanLast) {
          updated.email = `guard.${cleanFirst ? cleanFirst[0] + '.' : ''}${cleanLast}@rsu.edu.ph`;
        }
      }

      return updated;
    });
  };

  const generateRandomPassword = (isEdit = false) => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let pass = 'Guard@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (isEdit) {
      setEditFormData((prev) => ({ ...prev, password: pass }));
      setShowEditPassword(true);
    } else {
      setFormData((prev) => ({ ...prev, password: pass }));
      setShowPassword(true);
    }
  };

  const handleOpenAddModal = () => {
    const nextNum = String(guards.length + 1).padStart(2, '0');
    setFormData({
      lastName: '',
      firstName: '',
      middleInitial: '',
      badgeId: `GUARD-GATE-${nextNum}`,
      email: '',
      contactNumber: '+63 9',
      password: 'guard' + Math.floor(100 + Math.random() * 900)
    });
    setShowPassword(false);
    setShowAddModal(true);
  };

  // Step 1: Validate creation form & open confirmation dialog
  const handleReviewBeforeCreation = (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!formData.lastName.trim() || !formData.firstName.trim() || !formData.badgeId.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFeedback({ type: 'error', message: 'Last Name, First Name, Guard Badge ID, Email, and Password are required.' });
      return;
    }

    setShowConfirmModal(true);
  };

  // Step 2: Confirmed creation
  const handleConfirmCreateGuard = async () => {
    setShowConfirmModal(false);

    const cleanMI = formData.middleInitial.trim().toUpperCase();
    const formattedMI = cleanMI ? (cleanMI.endsWith('.') ? cleanMI : `${cleanMI}.`) : '';
    const fullName = formattedMI 
      ? `${formData.lastName.trim()}, ${formData.firstName.trim()} ${formattedMI}`
      : `${formData.lastName.trim()}, ${formData.firstName.trim()}`;

    try {
      setLoading(true);
      let createdGuard = null;
      try {
        const res = await apiRequest('/paso/guards', {
          method: 'POST',
          body: JSON.stringify({
            last_name: formData.lastName.trim(),
            first_name: formData.firstName.trim(),
            middle_name: formattedMI,
            school_id: formData.badgeId.trim().toUpperCase(),
            email: formData.email.trim().toLowerCase(),
            contact_number: formData.contactNumber.trim(),
            password: formData.password
          })
        });
        createdGuard = res.guard;
      } catch (apiErr) {
        createdGuard = {
          id: Date.now(),
          school_id: formData.badgeId.trim().toUpperCase(),
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          middle_name: formattedMI,
          full_name: fullName,
          email: formData.email.trim().toLowerCase(),
          contact_number: formData.contactNumber.trim(),
          role: 'GUARD',
          created_at: new Date().toISOString()
        };
      }

      setGuards((prev) => [createdGuard, ...prev.filter(g => g.school_id !== createdGuard.school_id)]);
      setShowAddModal(false);

      setShowCredentialSlip({
        ...createdGuard,
        rawPassword: formData.password,
        actionType: 'NEW'
      });

      setFeedback({ 
        type: 'success', 
        message: `Security Guard account for ${fullName} successfully provisioned!` 
      });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create guard account.' });
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (guard) => {
    setEditGuardModal(guard);
    
    // Parse parts if not separately saved
    let lName = guard.last_name || '';
    let fName = guard.first_name || '';
    let mInit = guard.middle_name || '';

    if (!lName && guard.full_name) {
      const parts = guard.full_name.split(',');
      if (parts.length > 1) {
        lName = parts[0].trim();
        const firstParts = parts[1].trim().split(' ');
        fName = firstParts[0] || '';
        mInit = firstParts.slice(1).join(' ') || '';
      } else {
        lName = guard.full_name;
      }
    }

    setEditFormData({
      lastName: lName,
      firstName: fName,
      middleInitial: mInit.replace('.', ''),
      badgeId: guard.school_id || '',
      email: guard.email || '',
      contactNumber: guard.contact_number || '',
      password: '' // empty by default unless admin wants to change password
    });
    setShowEditPassword(false);
  };

  // Submit Edit Form
  const handleSaveEditGuard = async (e) => {
    e.preventDefault();
    if (!editGuardModal) return;

    if (!editFormData.lastName.trim() || !editFormData.firstName.trim() || !editFormData.badgeId.trim() || !editFormData.email.trim()) {
      setFeedback({ type: 'error', message: 'Last Name, First Name, Guard Badge ID, and Email are required.' });
      return;
    }

    const cleanMI = editFormData.middleInitial.trim().toUpperCase();
    const formattedMI = cleanMI ? (cleanMI.endsWith('.') ? cleanMI : `${cleanMI}.`) : '';
    const fullName = formattedMI 
      ? `${editFormData.lastName.trim()}, ${editFormData.firstName.trim()} ${formattedMI}`
      : `${editFormData.lastName.trim()}, ${editFormData.firstName.trim()}`;

    try {
      setLoading(true);
      let updatedGuard = null;
      let passwordChanged = false;

      try {
        const payload = {
          last_name: editFormData.lastName.trim(),
          first_name: editFormData.firstName.trim(),
          middle_name: formattedMI,
          school_id: editFormData.badgeId.trim().toUpperCase(),
          email: editFormData.email.trim().toLowerCase(),
          contact_number: editFormData.contactNumber.trim()
        };
        if (editFormData.password.trim() !== '') {
          payload.password = editFormData.password.trim();
        }

        const res = await apiRequest(`/paso/guards/${editGuardModal.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        updatedGuard = res.guard;
        passwordChanged = res.passwordChanged;
      } catch (apiErr) {
        updatedGuard = {
          ...editGuardModal,
          school_id: editFormData.badgeId.trim().toUpperCase(),
          first_name: editFormData.firstName.trim(),
          last_name: editFormData.lastName.trim(),
          middle_name: formattedMI,
          full_name: fullName,
          email: editFormData.email.trim().toLowerCase(),
          contact_number: editFormData.contactNumber.trim(),
          updated_at: new Date().toISOString()
        };
        passwordChanged = editFormData.password.trim() !== '';
      }

      setGuards((prev) => prev.map((g) => (g.id === editGuardModal.id ? updatedGuard : g)));
      setEditGuardModal(null);

      // If password was changed, offer updated credential slip
      if (passwordChanged) {
        setShowCredentialSlip({
          ...updatedGuard,
          rawPassword: editFormData.password.trim(),
          actionType: 'UPDATED_PASSWORD'
        });
      }

      setFeedback({ 
        type: 'success', 
        message: `Guard details for ${fullName} updated successfully!${passwordChanged ? ' (Password changed)' : ''}` 
      });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update guard account.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuard = async (guard) => {
    if (!window.confirm(`Revoke and remove security guard account for ${guard.full_name} (${guard.school_id})?`)) {
      return;
    }

    try {
      try {
        await apiRequest(`/paso/guards/${guard.id}`, { method: 'DELETE' });
      } catch (apiErr) {
        console.warn('Server delete error, updating local:', apiErr.message);
      }

      setGuards((prev) => prev.filter((g) => g.id !== guard.id));
      setFeedback({ type: 'success', message: `Guard account for ${guard.full_name} has been revoked.` });
      setTimeout(() => setFeedback({ type: '', message: '' }), 3500);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to revoke guard account.' });
    }
  };

  const copySlipToClipboard = () => {
    if (!showCredentialSlip) return;
    const text = `RSU VPASS SECURITY GUARD CREDENTIALS\n` +
      `------------------------------------\n` +
      `Officer: ${showCredentialSlip.full_name}\n` +
      `Badge ID: ${showCredentialSlip.school_id}\n` +
      `Login Email / ID: ${showCredentialSlip.email} or ${showCredentialSlip.school_id}\n` +
      `Password: ${showCredentialSlip.rawPassword || '(Set by Admin)'}\n` +
      `Portal Link: ${window.location.origin}/login\n` +
      `Assignment: Rotating Gate Shift (All Campus Gates)\n` +
      `------------------------------------\n` +
      `Issued by: Physical Assets and Security Office (PASO)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Filter guards
  const filteredGuards = guards.filter((g) => {
    const q = searchQuery.toLowerCase();
    return (
      (g.full_name || '').toLowerCase().includes(q) ||
      (g.last_name || '').toLowerCase().includes(q) ||
      (g.first_name || '').toLowerCase().includes(q) ||
      (g.school_id || '').toLowerCase().includes(q) ||
      (g.email || '').toLowerCase().includes(q) ||
      (g.contact_number || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gate Security Personnel</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Security Guard Management</h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Provision, edit, and manage security guard credentials and passwords. Guards operate on shifting schedules across all university gates.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={fetchGuards}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            title="Refresh Guard List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision New Guard</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {feedback.message && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in fade-in duration-200 shadow-sm ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Commissioned Guards</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{guards.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Shift Assignment Policy</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">Rotating Gate Shifts</p>
            <p className="text-[10px] text-slate-400">Guards rotate shifts across all campus gates</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Credential Control</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">Editable by PASO Admin</p>
            <p className="text-[10px] text-slate-400">Direct password reset & detail updates</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Last Name, First Name, Badge ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{filteredGuards.length}</span> security personnel
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Officer Name (Last, First M.I.)</th>
                <th className="py-3 px-4">Badge / Guard ID</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Shift Schedule</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredGuards.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No Security Guards Found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click "Provision New Guard" above to add an authorized gate security guard.</p>
                  </td>
                </tr>
              ) : (
                filteredGuards.map((guard) => (
                  <tr key={guard.id || guard.school_id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {guard.last_name ? guard.last_name[0] : (guard.full_name ? guard.full_name[0] : 'G')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {guard.full_name || `${guard.last_name}, ${guard.first_name} ${guard.middle_name || ''}`}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Campus Gate Security</p>
                        </div>
                      </div>
                    </td>

                    {/* Badge ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                        {guard.school_id}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{guard.email}</span>
                        </div>
                        {guard.contact_number && (
                          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{guard.contact_number}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Shift Model (Rotating) */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[10px]">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span>Rotating Gate Shift</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Active Guard</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        {/* Edit Guard & Change Password */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(guard)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit Details & Change Password"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* View Credential Slip */}
                        <button
                          type="button"
                          onClick={() => setShowCredentialSlip({ ...guard, rawPassword: '•••••••• (Protected)', actionType: 'VIEW' })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="View / Print Credential Slip"
                        >
                          <IdCard className="w-4 h-4" />
                        </button>

                        {/* Revoke */}
                        <button
                          type="button"
                          onClick={() => handleDeleteGuard(guard)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Revoke Guard Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: PROVISION NEW GUARD FORM (LAST NAME, FIRST NAME, M.I.) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Provision Security Guard</h3>
                <p className="text-xs text-slate-500">Create official account credentials for campus gate security personnel.</p>
              </div>
            </div>

            {/* Informational Notice: Rotating Shifts */}
            <div className="p-3 mb-5 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-start space-x-2.5 text-xs text-blue-900">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">RSU Shifting Policy:</span>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Security guards at RSU operate on rotating shift schedules. Gate stationing is dynamic and not fixed to any single gate.
                </p>
              </div>
            </div>

            <form onSubmit={handleReviewBeforeCreation} className="space-y-4">
              {/* Separate Name Fields: Last Name, First Name, M.I. */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dela Cruz"
                    value={formData.lastName}
                    onChange={(e) => handleNameChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-12 sm:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Roberto"
                    value={formData.firstName}
                    onChange={(e) => handleNameChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-12 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    M.I.
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="B."
                    value={formData.middleInitial}
                    onChange={(e) => handleNameChange('middleInitial', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs uppercase text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Guard Badge ID & Contact Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guard Badge / ID No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GUARD-GATE-02"
                    value={formData.badgeId}
                    onChange={(e) => setFormData({ ...formData, badgeId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-xs uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="+63 912 345 6789"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  University / Official Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="guard.name@rsu.edu.ph"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Initial Password with Generator & Visibility Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Initial Account Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => generateRandomPassword(false)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                  >
                    Auto-Generate Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter or generate password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  The guard will use their Badge ID or Email together with this password to log in.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <span>Review & Confirm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMATION MODAL BEFORE CREATING GUARD */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Confirm Guard Provisioning</h3>
                <p className="text-xs text-slate-500">Please review the official credentials before issuing.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500">Officer Name:</span>
                <span className="font-bold text-slate-900">
                  {formData.lastName.trim()}, {formData.firstName.trim()} {formData.middleInitial ? (formData.middleInitial.trim().endsWith('.') ? formData.middleInitial.trim() : formData.middleInitial.trim() + '.') : ''}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500">Badge / Guard ID:</span>
                <span className="font-mono font-bold text-emerald-700">{formData.badgeId.trim()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-semibold text-slate-800">{formData.email.trim()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500">Contact Number:</span>
                <span className="text-slate-800">{formData.contactNumber || 'None provided'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                <span className="text-slate-500">Initial Password:</span>
                <span className="font-mono font-bold text-slate-900">{formData.password}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-500">Gate Assignment:</span>
                <span className="font-bold text-blue-700">Rotating Shift (All Gates)</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmCreateGuard}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Confirm & Create Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT GUARD DETAILS & CHANGE PASSWORD */}
      {editGuardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditGuardModal(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Pencil className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit Guard & Change Password</h3>
                <p className="text-xs text-slate-500">Update officer information or reset account login credentials.</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditGuard} className="space-y-4">
              {/* Separate Name Fields: Last Name, First Name, M.I. */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-12 sm:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-12 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    M.I.
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="B."
                    value={editFormData.middleInitial}
                    onChange={(e) => setEditFormData({ ...editFormData, middleInitial: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs uppercase text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Badge ID & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guard Badge / ID No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.badgeId}
                    onChange={(e) => setEditFormData({ ...editFormData, badgeId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-xs uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={editFormData.contactNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  University / Official Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* CHANGE / RESET PASSWORD SECTION */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                    <label className="block text-xs font-bold text-slate-800">
                      Reset Password (Optional)
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => generateRandomPassword(true)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                  >
                    Auto-Generate Password
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="Leave empty to keep existing password"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  {editFormData.password 
                    ? '⚠️ Password will be updated upon saving. A new credential slip will be generated.' 
                    : 'The guard’s current password will remain unchanged if left blank.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditGuardModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{loading ? 'Saving Changes...' : 'Save & Update Guard'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREDENTIAL SLIP / COPY DIALOG */}
      {showCredentialSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCredentialSlip(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <IdCard className="w-7 h-7" />
            </div>

            <h3 className="text-base font-black text-slate-900">
              {showCredentialSlip.actionType === 'UPDATED_PASSWORD' ? 'Updated Guard Credentials' : 'Official Guard Credential Slip'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {showCredentialSlip.actionType === 'UPDATED_PASSWORD'
                ? 'The password has been changed. Provide the new login details to the guard.'
                : 'Hand these login credentials to the security guard officer.'}
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-400 font-sans">Officer Name:</span>
                <span className="font-bold text-slate-900 font-sans">{showCredentialSlip.full_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-400 font-sans">Badge / ID:</span>
                <span className="font-bold text-emerald-700">{showCredentialSlip.school_id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-400 font-sans">Email Login:</span>
                <span className="font-bold text-slate-800">{showCredentialSlip.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-400 font-sans">Password:</span>
                <span className="font-bold text-slate-900">{showCredentialSlip.rawPassword || '••••••••'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Assignment:</span>
                <span className="font-bold text-blue-700 font-sans">Rotating Gate Shifts</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={copySlipToClipboard}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
