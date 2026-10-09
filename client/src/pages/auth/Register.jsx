import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { RSU_MAIN_COURSES, RSU_YEAR_LEVELS, RSU_COLLEGES } from '../../data/rsuCourses';
import { 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Car, 
  Phone, 
  Mail, 
  Lock, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  HeartPulse, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
  Search,
  X,
  Check,
  ChevronDown,
  FileText,
  Shield
} from 'lucide-react';

/**
 * Premium Custom Dropdown Component
 * Replaces default native browser <select> controls ("natural web UI")
 * with a responsive, modern card popover that stays within mobile bounds.
 */
function CustomDropdown({
  label,
  required,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  helperText,
  variant = 'default',
  headerRight,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) =>
    typeof opt === 'object' ? opt.value === value : opt === value
  );
  const hasSelected = Boolean(selectedOption && value);
  const displayLabel = hasSelected
    ? typeof selectedOption === 'object'
      ? selectedOption.label
      : selectedOption
    : placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label className={`block text-xs font-bold ${variant === 'amber' ? 'text-amber-950' : 'text-slate-700'}`}>
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        {headerRight}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
          variant === 'amber'
            ? 'bg-white border-amber-300 text-amber-950 hover:bg-amber-50/50 focus:ring-2 focus:ring-amber-500 shadow-xs'
            : variant === 'emerald'
            ? 'bg-white border-emerald-400 text-slate-900 hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500 shadow-xs'
            : 'bg-slate-50/80 border-slate-300 text-slate-800 hover:bg-white hover:border-emerald-400 focus:ring-2 focus:ring-emerald-500 shadow-xs'
        } ${isOpen ? 'ring-2 ring-emerald-500 border-emerald-500 bg-white' : ''}`}
      >
        <span className={`truncate pr-2 ${hasSelected ? 'font-bold text-slate-900' : 'font-normal text-slate-400'}`}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            variant === 'amber' ? 'text-amber-700' : 'text-slate-400'
          } ${isOpen ? 'rotate-180 text-emerald-600' : ''}`}
        />
      </button>

      {helperText && (
        <span className={`text-[10px] mt-0.5 block ${variant === 'amber' ? 'text-amber-700 font-medium' : 'text-slate-400'}`}>
          {helperText}
        </span>
      )}

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 py-1">
            {options.map((opt) => {
              const optVal = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              const optSub = typeof opt === 'object' ? opt.sublabel : null;
              const optBadge = typeof opt === 'object' ? opt.badge : null;
              const isSelected = optVal === value;

              return (
                <button
                  key={optVal}
                  type="button"
                  onClick={() => {
                    onChange(optVal);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium'
                  }`}
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="flex items-center gap-1.5">
                      {optBadge && (
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-900 text-white shrink-0">
                          {optBadge}
                        </span>
                      )}
                      <span className="truncate">{optLabel}</span>
                    </div>
                    {optSub && (
                      <p className="text-[10px] text-slate-400 truncate">{optSub}</p>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [classification, setClassification] = useState('STUDENT'); // 'STUDENT' | 'EMPLOYEE'

  // Student specific College, Course & Year state - Clean initial state (NO pre-loaded defaults)
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');

  // Course quick-search modal state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');

  // Data Privacy Act Consent & Modal state
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Password visibility & security state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Duplicate ID validation state
  const [duplicateIdError, setDuplicateIdError] = useState('');
  const [isCheckingId, setIsCheckingId] = useState(false);

  // Form State matching the physical RSU PASO Vehicle Gate Pass Registration Form
  const [formData, setFormData] = useState({
    // Personal Information
    lastName: '',
    firstName: '',
    middleName: '',
    cellphoneNo: '',
    age: '',
    currentAddress: '',
    permanentAddress: '',
    driversLicenseNo: '',

    // Student fields - Clean initial state
    studentIdNo: '',
    yearAndCourse: '',

    // Employee fields
    employeeIdNo: '',
    departmentUnit: '',

    // Emergency Contact
    emergencyName: '',
    relationship: '',
    emergencyCellphoneNo: '',

    // Credentials
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Currently selected course object
  const currentCourse = useMemo(() => {
    if (!selectedCourseId) return null;
    return RSU_MAIN_COURSES.find((c) => c.id === selectedCourseId) || null;
  }, [selectedCourseId]);

  // Filtered courses based on selected college for the dropdown
  const availableCourses = useMemo(() => {
    if (!selectedCollege || selectedCollege === 'ALL') {
      return RSU_MAIN_COURSES;
    }
    return RSU_MAIN_COURSES.filter((c) => c.collegeCode === selectedCollege);
  }, [selectedCollege]);

  // Filtered courses for the Search & Browse Modal
  const modalFilteredCourses = useMemo(() => {
    const q = courseSearchQuery.trim().toLowerCase();
    return RSU_MAIN_COURSES.filter((c) => {
      const matchesCollege = !selectedCollege || selectedCollege === 'ALL' || c.collegeCode === selectedCollege;
      const matchesSearch = 
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.college.toLowerCase().includes(q) ||
        (c.majors && c.majors.some((m) => m.toLowerCase().includes(q)));
      return matchesCollege && matchesSearch;
    });
  }, [courseSearchQuery, selectedCollege]);

  // Keep yearAndCourse string formatted whenever year, course, or major changes
  useEffect(() => {
    if (classification === 'STUDENT') {
      if (selectedYear && currentCourse) {
        let formatted = `${selectedYear} • ${currentCourse.name}`;
        if (currentCourse.majors && currentCourse.majors.length > 0 && selectedMajor) {
          formatted += ` - Major in ${selectedMajor}`;
        }
        setFormData((prev) => ({ ...prev, yearAndCourse: formatted }));
      } else {
        setFormData((prev) => ({ ...prev, yearAndCourse: '' }));
      }
    }
  }, [selectedYear, currentCourse, selectedMajor, classification]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Prevent any non-numeric key from being typed in phone number fields
  const handlePhoneKeyDown = (e) => {
    if (
      ['Backspace', 'Tab', 'Enter', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) ||
      (e.ctrlKey || e.metaKey)
    ) {
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Sanitize phone inputs to numbers only and max 11 digits (e.g. 09123456789)
  const handlePhoneChange = (field, e) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, '').slice(0, 11);
    handleChange(field, digitsOnly);
  };

  // Handle College change
  const handleCollegeChange = (newCollegeCode) => {
    setSelectedCollege(newCollegeCode);

    // If changing college, check if currently selected course belongs to this new college
    if (selectedCourseId) {
      const found = RSU_MAIN_COURSES.find((c) => c.id === selectedCourseId);
      if (found && newCollegeCode !== 'ALL' && found.collegeCode !== newCollegeCode) {
        // Clear course and major so the user makes a clean choice
        setSelectedCourseId('');
        setSelectedMajor('');
      }
    }
  };

  // Select course programmatically (used by dropdown and modal)
  const selectCourseById = (courseId) => {
    setSelectedCourseId(courseId);
    const found = RSU_MAIN_COURSES.find((c) => c.id === courseId);
    if (found) {
      if (!selectedCollege || (selectedCollege !== 'ALL' && selectedCollege !== found.collegeCode)) {
        setSelectedCollege(found.collegeCode);
      }
    }
    // Clean initial state for major - user will choose their own major
    setSelectedMajor('');
    setShowCourseModal(false);
  };

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', barColor: 'bg-slate-200', textColor: 'text-slate-400' };
    
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (pwd.length < 6 || score <= 2) {
      return { 
        score: 1, 
        label: 'Weak', 
        barColor: 'bg-rose-500', 
        textColor: 'text-rose-600',
        hint: 'Too weak. Use at least 6-8 characters with numbers and capital letters.'
      };
    } else if (score <= 3) {
      return { 
        score: 2, 
        label: 'Medium', 
        barColor: 'bg-amber-500', 
        textColor: 'text-amber-600',
        hint: 'Good password. Add symbols (!@#$) to make it strong.'
      };
    } else {
      return { 
        score: 3, 
        label: 'Strong', 
        barColor: 'bg-emerald-500', 
        textColor: 'text-emerald-600',
        hint: 'Strong & secure password!'
      };
    }
  }, [formData.password]);

  // Comprehensive Form Validation Checker - Identifies all missing or invalid fields
  const validationIssues = useMemo(() => {
    const issues = [];

    // 1. Personal Information (All Required)
    if (!formData.lastName.trim()) issues.push('Last Name is required');
    if (!formData.firstName.trim()) issues.push('First Name is required');
    if (!formData.cellphoneNo.trim()) {
      issues.push('Cellphone No. is required');
    } else if (formData.cellphoneNo.trim().length !== 11) {
      issues.push(`Cellphone No. must be 11 digits (currently ${formData.cellphoneNo.trim().length}/11)`);
    }

    const ageNum = parseInt(formData.age, 10);
    if (!formData.age || isNaN(ageNum)) {
      issues.push('Age is required');
    } else if (ageNum < 16 || ageNum > 99) {
      issues.push('Age must be between 16 and 99');
    }

    if (!formData.driversLicenseNo.trim()) issues.push("Driver's License No. is required");
    if (!formData.currentAddress.trim()) issues.push('Current Address is required');
    if (!formData.permanentAddress.trim()) issues.push('Permanent Address is required');

    // 2. Classification Details (All Required)
    if (classification === 'STUDENT') {
      if (!formData.studentIdNo.trim()) issues.push('Identification Card No. (Student ID) is required');
      if (!selectedYear) issues.push('Year Level is required (e.g. 1st Year, 2nd Year)');
      if (!selectedCourseId) issues.push('Course / Program is required (e.g. BSIT)');
      if (currentCourse && currentCourse.majors && currentCourse.majors.length > 0 && !selectedMajor) {
        issues.push(`Major / Specialization is required for ${currentCourse.name}`);
      }
    } else {
      if (!formData.employeeIdNo.trim()) issues.push('Employee ID No. is required');
      if (!formData.departmentUnit.trim()) issues.push('Department / Unit is required');
    }

    // 3. Emergency Contact (All Required)
    if (!formData.emergencyName.trim()) issues.push('Emergency Contact Person Full Name is required');
    if (!formData.relationship.trim()) issues.push('Emergency Contact Relationship is required');
    if (!formData.emergencyCellphoneNo.trim()) {
      issues.push('Emergency Cellphone No. is required');
    } else if (formData.emergencyCellphoneNo.trim().length !== 11) {
      issues.push(`Emergency Cellphone No. must be 11 digits (currently ${formData.emergencyCellphoneNo.trim().length}/11)`);
    }

    // 4. Account Credentials (All Required)
    if (!formData.email.trim()) {
      issues.push('Email Address is required');
    } else if (!formData.email.includes('@')) {
      issues.push('Email Address must include an "@" (e.g. vanz@gmail.com or vanz@rsu.edu.ph)');
    }

    if (!formData.password) {
      issues.push('Password is required');
    } else if (formData.password.length < 6) {
      issues.push('Password must be at least 6 characters');
    }

    if (!formData.confirmPassword) {
      issues.push('Confirm Password is required');
    } else if (formData.password !== formData.confirmPassword) {
      issues.push('Confirm Password does not match Password');
    }

    // 5. Duplicate ID & Data Privacy Act Consent (Mandatory)
    if (duplicateIdError) {
      issues.push(duplicateIdError);
    }
    if (!privacyConsent) {
      issues.push('Data Privacy Consent Agreement checkbox must be accepted');
    }

    return issues;
  }, [
    formData,
    classification,
    selectedYear,
    selectedCourseId,
    selectedMajor,
    currentCourse,
    privacyConsent,
    duplicateIdError,
  ]);

  const isFormValid = validationIssues.length === 0;

  // Duplicate ID Checker (against API, LocalStorage, and Seed records)
  const checkDuplicateId = async (idValue) => {
    const trimmed = (idValue || '').trim();
    if (!trimmed || trimmed.length < 3) {
      setDuplicateIdError('');
      return false;
    }

    setIsCheckingId(true);
    try {
      // 1. Check local demo user session
      const savedUserStr = localStorage.getItem('vpass_user');
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && (savedUser.school_id || '').trim().toLowerCase() === trimmed.toLowerCase()) {
            const msg = `The ${classification === 'STUDENT' ? 'Student ID' : 'Employee ID'} "${trimmed}" is already registered in the system. Duplicate ID numbers are not allowed.`;
            setDuplicateIdError(msg);
            return true;
          }
        } catch (e) {
          // ignore json parse error
        }
      }

      // 2. Check seeded mock IDs
      const seededIds = ['2023-00192', '2026-00001', 'EMP-2026-0812', 'EMP-2024-001'];
      if (seededIds.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        const msg = `The ${classification === 'STUDENT' ? 'Student ID' : 'Employee ID'} "${trimmed}" is already registered in the university database. Duplicate ID numbers are not allowed.`;
        setDuplicateIdError(msg);
        return true;
      }

      // 3. Query backend verification endpoint
      try {
        const res = await apiRequest(`/auth/check-id?school_id=${encodeURIComponent(trimmed)}`);
        if (res && res.exists) {
          const msg = `The ${classification === 'STUDENT' ? 'Student ID' : 'Employee ID'} "${trimmed}" is already registered in the database. Duplicates cannot be submitted.`;
          setDuplicateIdError(msg);
          return true;
        }
      } catch (err) {
        // if offline / demo, allow fallback logic
      }

      setDuplicateIdError('');
      return false;
    } finally {
      setIsCheckingId(false);
    }
  };

  const showError = (msg) => {
    setError(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If there are validation issues, alert the user with the first issue and scroll to top
    if (validationIssues.length > 0) {
      showError(validationIssues[0]);
      return;
    }

    // Personal validation
    if (!formData.lastName.trim() || !formData.firstName.trim()) {
      showError('Please provide your Last Name and First Name.');
      return;
    }

    const idNo = classification === 'STUDENT' ? formData.studentIdNo : formData.employeeIdNo;
    if (!idNo.trim()) {
      showError(`Please enter your ${classification === 'STUDENT' ? 'Student' : 'Employee'} Identification Card No.`);
      return;
    }

    // Duplicate ID check: Stop immediately if already flagged or verified duplicate
    if (duplicateIdError) {
      showError(duplicateIdError);
      return;
    }

    const isDupe = await checkDuplicateId(idNo);
    if (isDupe) {
      showError(`Cannot Submit: The ${classification === 'STUDENT' ? 'Student ID' : 'Employee ID'} "${idNo}" is already registered. Duplicated IDs cannot be submitted.`);
      return;
    }

    if (!formData.cellphoneNo.trim()) {
      showError('Please enter your Cellphone No. (Numbers only).');
      return;
    }

    if (formData.cellphoneNo.trim().length < 11) {
      showError('Please enter a valid 11-digit Cellphone No. (e.g. 09123456789).');
      return;
    }

    // Required Age
    if (!formData.age || parseInt(formData.age, 10) < 16 || parseInt(formData.age, 10) > 99) {
      showError('Please enter a valid Age (between 16 and 99).');
      return;
    }

    // Required Driver's License No.
    if (!formData.driversLicenseNo.trim()) {
      showError('Please provide your Driver\'s License No.');
      return;
    }

    // Required Current and Permanent Address
    if (!formData.currentAddress.trim()) {
      showError('Please provide your Current Address.');
      return;
    }

    if (!formData.permanentAddress.trim()) {
      showError('Please provide your Permanent Address.');
      return;
    }

    // Required Student Details
    if (classification === 'STUDENT') {
      if (!selectedYear) {
        showError('Please select your Year Level.');
        return;
      }
      if (!selectedCourseId) {
        showError('Please select your Course / Program.');
        return;
      }
      if (currentCourse && currentCourse.majors && currentCourse.majors.length > 0 && !selectedMajor) {
        showError(`Please select your Major / Specialization for ${currentCourse.name}.`);
        return;
      }
    }

    // Required Employee Details
    if (classification === 'EMPLOYEE') {
      if (!formData.departmentUnit.trim()) {
        showError('Please enter your Department / Unit.');
        return;
      }
    }

    // Emergency Contact
    if (!formData.emergencyName.trim() || !formData.emergencyCellphoneNo.trim()) {
      showError('Please provide the Emergency Contact Person and Cellphone No.');
      return;
    }

    if (formData.emergencyCellphoneNo.trim().length < 11) {
      showError('Emergency Cellphone No. must be a valid 11-digit number.');
      return;
    }

    // Account Credentials
    if (!formData.email.trim()) {
      showError('Please provide an email address for your account.');
      return;
    }

    if (!formData.email.includes('@')) {
      showError('Please provide a valid Email Address containing "@" (e.g. vanz@gmail.com).');
      return;
    }

    if (!formData.password) {
      showError('Please set an account password.');
      return;
    }

    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Password and Confirm Password do not match.');
      return;
    }

    // Data Privacy Act Consent Validation (Mandatory)
    if (!privacyConsent) {
      showError('You must read and agree to the Data Privacy Act of 2012 (RA 10173) agreement before you can register.');
      return;
    }

    const fullName = `${formData.firstName.trim()} ${formData.middleName.trim() ? formData.middleName.trim() + ' ' : ''}${formData.lastName.trim()}`;

    const payload = {
      school_id: idNo.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      full_name: fullName,
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      middle_name: formData.middleName.trim() || null,
      contact_number: formData.cellphoneNo.trim(),
      age: formData.age ? parseInt(formData.age, 10) : null,
      current_address: formData.currentAddress.trim(),
      permanent_address: formData.permanentAddress.trim() || formData.currentAddress.trim(),
      drivers_license_no: formData.driversLicenseNo.trim(),
      classification: classification,
      year_course: classification === 'STUDENT' ? formData.yearAndCourse.trim() : null,
      department_unit: classification === 'EMPLOYEE' ? formData.departmentUnit.trim() : null,
      emergency_name: formData.emergencyName.trim(),
      emergency_relation: formData.relationship.trim(),
      emergency_phone: formData.emergencyCellphoneNo.trim(),
    };

    setLoading(true);

    try {
      // Call backend API
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccessMsg('Account registered successfully! Redirecting to your vehicle pass dashboard...');

      // Store in AuthContext
      if (res.user && res.token) {
        login(res.user, res.token);
      } else {
        // Fallback local session
        const localUser = {
          ...payload,
          id: res.userId || Date.now(),
          role: 'CLIENT',
        };
        login(localUser, 'vpass_local_token_' + Date.now());
      }

      setTimeout(() => {
        navigate('/client/profile');
      }, 1500);
    } catch (err) {
      console.warn('Registration API response/error:', err);

      // If backend reports duplicate ID or email conflict (409)
      const errLower = (err.message || '').toLowerCase();
      if (errLower.includes('already registered') || errLower.includes('identification card') || errLower.includes('duplicate')) {
        setError(err.message || 'This Identification Card No. or Email is already registered. Duplicates cannot be submitted.');
        setLoading(false);
        return;
      }

      // If purely a network connection error in offline/demo environment:
      const localUser = {
        ...payload,
        id: Date.now(),
        role: 'CLIENT',
      };
      login(localUser, 'vpass_token_' + Date.now());
      setSuccessMsg('Account registered successfully! Redirecting to your vehicle pass dashboard...');
      setTimeout(() => {
        navigate('/client/profile');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 py-8 px-3 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-300/40 overflow-hidden">
        
        {/* Official University Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white px-5 sm:px-10 py-6 border-b border-emerald-950">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-emerald-300" />
            </div>
            <div className="space-y-0.5 flex-1">
              <h2 className="text-xs font-bold tracking-widest uppercase text-emerald-300">
                Romblon State University
              </h2>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">
                Public Assistance and Security Office (PASO)
              </h1>
              <p className="text-[11px] text-emerald-100/80">
                G/F Admin Building, RSU-Main Campus, Liwanag, Odiongan, Romblon 5505
              </p>
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 text-[10px] text-emerald-200">
                <span>Tel: (042) 567-5911</span>
                <span>•</span>
                <span>Email: securityrsvp@rsu.edu.ph</span>
                <span>•</span>
                <span>Website: rsu.edu.ph</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Title Banner */}
        <div className="bg-emerald-50 px-5 sm:px-10 py-4 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-md">
              Official Form
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight mt-0.5">
              Vehicle Gate Pass Registration Form
            </h2>
            <p className="text-xs text-slate-600">
              Submit your institutional and vehicle passholder profile to register your account.
            </p>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            <span>Already have an account? Sign In</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mx-5 sm:mx-10 mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registration Alert</p>
              <p className="mt-0.5 text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 sm:mx-10 mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800 text-xs animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-10 space-y-8">
          
          {/* Section 1: Classification Selector (Student / Employee Only) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Applicant Classification:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setClassification('STUDENT');
                  setDuplicateIdError('');
                }}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition-all cursor-pointer ${
                  classification === 'STUDENT'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>STUDENT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setClassification('EMPLOYEE');
                  setDuplicateIdError('');
                }}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition-all cursor-pointer ${
                  classification === 'EMPLOYEE'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>EMPLOYEE (FACULTY / STAFF)</span>
              </button>
            </div>
          </div>

          {/* Section 2: Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
              <User className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={35}
                  placeholder="e.g. Dela Cruz"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={35}
                  placeholder="e.g. Juan"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  maxLength={35}
                  placeholder="e.g. Santos"
                  value={formData.middleName}
                  onChange={(e) => handleChange('middleName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cellphone No. <span className="text-rose-500">*</span>
                  <span className="text-[10px] font-normal text-slate-400 ml-1">(Numbers only)</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    maxLength={11}
                    placeholder="09123456789"
                    value={formData.cellphoneNo}
                    onKeyDown={handlePhoneKeyDown}
                    onChange={(e) => handlePhoneChange('cellphoneNo', e)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium tracking-wide focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {formData.cellphoneNo.length}/11 digits (numbers only)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 21"
                  min="16"
                  max="99"
                  maxLength={2}
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value.slice(0, 2))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Minimum age: 16
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Driver's License No. <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="e.g. D02-24-123456"
                    value={formData.driversLicenseNo}
                    onChange={(e) => handleChange('driversLicenseNo', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  LTO issued driver's license
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Liwanag, Odiongan, Romblon (Boarding House / Residence)"
                    value={formData.currentAddress}
                    onChange={(e) => handleChange('currentAddress', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Permanent Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Brgy. Tulay, Odiongan / Hometown"
                    value={formData.permanentAddress}
                    onChange={(e) => handleChange('permanentAddress', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Classification Details (Student vs Employee) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-emerald-200">
              {classification === 'STUDENT' ? (
                <>
                  <GraduationCap className="w-4 h-4 text-emerald-800" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950">
                    Student Details
                  </h3>
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 text-emerald-800" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950">
                    Employee Details
                  </h3>
                </>
              )}
            </div>

            {classification === 'STUDENT' ? (
              <div className="space-y-4">
                {/* Identification Card No. with Real-time & On-Blur Duplicate Check */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Identification Card No. (Student ID) <span className="text-rose-500">*</span>
                    </label>
                    {isCheckingId && (
                      <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking database...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="e.g. 2026-00001"
                    value={formData.studentIdNo}
                    onBlur={() => checkDuplicateId(formData.studentIdNo)}
                    onChange={(e) => {
                      handleChange('studentIdNo', e.target.value);
                      if (duplicateIdError) setDuplicateIdError('');
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold tracking-wider text-slate-900 bg-white outline-none transition-all ${
                      duplicateIdError
                        ? 'border-rose-400 bg-rose-50/50 ring-2 ring-rose-300'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {duplicateIdError ? (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 font-bold bg-rose-100/70 p-2 rounded-lg border border-rose-200">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{duplicateIdError}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      This will serve as your portal login identifier. Duplicate student numbers cannot be submitted.
                    </span>
                  )}
                </div>

                {/* RSU Main Campus (Odiongan) Degree & Year Dropdowns (Clean Unpopulated State) */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-emerald-200/80 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                      <span>RSU Main Campus (Odiongan) Academic Program</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCourseModal(true)}
                      className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <Search className="w-3 h-3" />
                      <span>Quick Find / Search</span>
                    </button>
                  </div>

                  {/* Clean 2-Tier Selector Row: College Filter + Year Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* College / Department Custom Dropdown (Clean, unselected by default) */}
                    <CustomDropdown
                      label="College / Department"
                      required
                      placeholder="Select College / Department..."
                      value={selectedCollege}
                      onChange={handleCollegeChange}
                      options={RSU_COLLEGES.map((c) => ({
                        value: c.code,
                        label: c.name,
                      }))}
                      helperText="Filters the course choices below"
                    />

                    {/* Year Level Custom Dropdown (Clean, unselected by default) */}
                    <CustomDropdown
                      label="Year Level"
                      required
                      placeholder="Select Year Level..."
                      value={selectedYear}
                      onChange={(val) => setSelectedYear(val)}
                      options={RSU_YEAR_LEVELS.map((year) => ({
                        value: year,
                        label: year,
                      }))}
                      helperText="Select current academic standing"
                    />
                  </div>

                  {/* Course / Program Custom Dropdown (Clean, unselected by default) */}
                  <div>
                    <CustomDropdown
                      label="Course / Program"
                      required
                      variant="emerald"
                      placeholder={selectedCollege ? "Select Course / Program..." : "Choose a college above, or pick here..."}
                      value={selectedCourseId}
                      onChange={selectCourseById}
                      options={availableCourses.map((c) => ({
                        value: c.id,
                        label: !selectedCollege || selectedCollege === 'ALL' ? `[${c.collegeCode}] ${c.name}` : c.name,
                        badge: !selectedCollege || selectedCollege === 'ALL' ? c.collegeCode : null,
                      }))}
                      headerRight={
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          {availableCourses.length} programs available
                        </span>
                      }
                    />
                  </div>

                  {/* Conditional Major Dropdown - Displays ONLY if the chosen course has majors (Clean, unselected by default) */}
                  {currentCourse && currentCourse.majors && currentCourse.majors.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 animate-in fade-in duration-200">
                      <CustomDropdown
                        label="Major / Specialization"
                        required
                        variant="amber"
                        placeholder="Select Major / Specialization..."
                        value={selectedMajor}
                        onChange={(val) => setSelectedMajor(val)}
                        options={currentCourse.majors.map((major) => ({
                          value: major,
                          label: `Major in ${major}`,
                        }))}
                        helperText={`Required specialization track for ${currentCourse.code}`}
                      />
                    </div>
                  )}

                  {/* Formatted Course Preview Badge (Shows only when student has selected their profile) */}
                  {formData.yearAndCourse ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 animate-in fade-in">
                      <span className="text-emerald-800 font-medium">Selected Profile:</span>
                      <span className="font-extrabold text-emerald-950 sm:text-right">
                        {formData.yearAndCourse}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-500">
                      <span className="font-medium text-slate-600">Selected Profile:</span>
                      <span className="italic text-slate-400 text-[11px]">
                        Please select your Year Level and Course above.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Identification Card No. (Employee ID) <span className="text-rose-500">*</span>
                    </label>
                    {isCheckingId && (
                      <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking database...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="e.g. EMP-2024-001"
                    value={formData.employeeIdNo}
                    onBlur={() => checkDuplicateId(formData.employeeIdNo)}
                    onChange={(e) => {
                      handleChange('employeeIdNo', e.target.value);
                      if (duplicateIdError) setDuplicateIdError('');
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold tracking-wider text-slate-900 bg-white outline-none transition-all ${
                      duplicateIdError
                        ? 'border-rose-400 bg-rose-50/50 ring-2 ring-rose-300'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {duplicateIdError ? (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 font-bold bg-rose-100/70 p-2 rounded-lg border border-rose-200">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{duplicateIdError}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      This will serve as your portal login identifier. Duplicate employee numbers cannot be submitted.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Unit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    placeholder="e.g. College of Engineering & Technology / Registrar"
                    value={formData.departmentUnit}
                    onChange={(e) => handleChange('departmentUnit', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: IN CASE OF EMERGENCY */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                In Case of Emergency
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Person Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={40}
                  placeholder="e.g. Maria Dela Cruz"
                  value={formData.emergencyName}
                  onChange={(e) => handleChange('emergencyName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relationship <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={25}
                  placeholder="e.g. Mother / Parent / Spouse"
                  value={formData.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cellphone No. <span className="text-rose-500">*</span>
                  <span className="text-[10px] font-normal text-slate-400 ml-1">(Numbers only)</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    maxLength={11}
                    placeholder="09187654321"
                    value={formData.emergencyCellphoneNo}
                    onKeyDown={handlePhoneKeyDown}
                    onChange={(e) => handlePhoneChange('emergencyCellphoneNo', e)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium tracking-wide focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {formData.emergencyCellphoneNo.length}/11 digits (numbers only)
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Account Sign-in Credentials */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
              <Lock className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Account Sign-In Setup
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    maxLength={50}
                    placeholder="e.g. juan@rsu.edu.ph"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                      formData.email && !formData.email.includes('@')
                        ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                </div>
                {formData.email && !formData.email.includes('@') ? (
                  <span className="text-[10px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    Missing "@" symbol (e.g. vanz@gmail.com)
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Use university email or personal email with @
                  </span>
                )}
              </div>

              {/* Password with Strength Measurement Meter & Visibility Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={40}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Measurement Meter */}
                {formData.password ? (
                  <div className="mt-2 space-y-1 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Strength:</span>
                      <span className={`font-bold ${passwordStrength.textColor}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    {/* Visual 3-segment progress meter */}
                    <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
                      <div className={`rounded-full h-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.barColor : 'bg-slate-200'}`} />
                      <div className={`rounded-full h-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.barColor : 'bg-slate-200'}`} />
                      <div className={`rounded-full h-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.barColor : 'bg-slate-200'}`} />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {passwordStrength.hint}
                    </p>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Measurement meter appears as you type.
                  </span>
                )}
              </div>

              {/* Confirm Password with Visibility Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    maxLength={40}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword ? (
                  <span className="text-[10px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    Passwords do not match
                  </span>
                ) : formData.confirmPassword && formData.password === formData.confirmPassword ? (
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3 shrink-0" />
                    Passwords match
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Section 6: Data Privacy Act Consent (Republic Act No. 10173) */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-2.5 shadow-xs">
              <div className="flex items-start space-x-3">
                <input
                  id="privacyConsent"
                  type="checkbox"
                  required
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0 accent-emerald-600"
                />
                <label htmlFor="privacyConsent" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
                  <span className="font-bold text-slate-900">Data Privacy Consent Agreement:</span> I have read, understood, and accept the{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-emerald-700 font-extrabold underline hover:text-emerald-900 cursor-pointer inline-flex items-center gap-0.5"
                  >
                    RSU PASO Data Privacy Notice
                  </button>{' '}
                  in accordance with <span className="font-bold text-slate-900">Republic Act No. 10173 (Data Privacy Act of 2012)</span>. <span className="text-rose-500 font-bold">*</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-500 pl-7 leading-relaxed">
                By ticking this box, you authorize the RSU Public Assistance and Security Office (PASO) to collect and process your personal and vehicle records solely for campus security and pass issuance.
              </p>
            </div>

            {/* Live Requirements Status Checklist Banner */}
            {validationIssues.length > 0 ? (
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs space-y-2 shadow-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Please complete remaining required item{validationIssues.length > 1 ? 's' : ''} ({validationIssues.length}):</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-200 text-amber-800">
                    Incomplete
                  </span>
                </div>
                <ul className="space-y-1 text-[11px] font-semibold text-amber-800/90 pl-1">
                  {validationIssues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold shrink-0">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All registration details completed and verified! Ready to submit.</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-800 shrink-0">
                  Ready
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Back to Sign In
              </Link>

              <div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md ${
                    isFormValid && !loading
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/25 hover:shadow-lg active:scale-[0.99]'
                      : 'bg-emerald-600/85 hover:bg-emerald-700 text-white shadow-sm'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Enrolling Account...
                    </span>
                  ) : (
                    <>
                      <span>Submit Registration & Create Account</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
                {!isFormValid && (
                  <p className="text-[10px] text-amber-700 text-center sm:text-right font-semibold">
                    Click button to jump to first missing field, or check list above
                  </p>
                )}
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* Data Privacy Act of 2012 (RA 10173) Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-2xl rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-teal-800 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
                    Data Privacy Notice & Consent
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Republic Act No. 10173 (Data Privacy Act of 2012)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with Full Privacy Policy */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs text-slate-700 leading-relaxed divide-y divide-slate-100">
              <div className="space-y-1.5 pb-3">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Official Policy • RSU PASO
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  Romblon State University Public Assistance and Security Office (PASO)
                </h4>
                <p>
                  Romblon State University is committed to protecting your privacy and ensuring that all personal and institutional data collected from applicants for vehicle gate passes (VPASS) are processed in compliance with the provisions of Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012.
                </p>
              </div>

              <div className="space-y-1.5 pt-3">
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  1. Information We Collect
                </h5>
                <p>
                  In order to process your campus vehicle gate pass application and verify your identity upon gate entry and exit, PASO collects the following personal information:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                  <li>Full Name, Age, and Institutional Identification Card No. (Student ID or Employee ID)</li>
                  <li>Academic program details (College, Year Level, Degree Program, and Major)</li>
                  <li>Contact details (Active Cellphone Number, Email Address, and Emergency Contact Person info)</li>
                  <li>Driver's License No. and residential addresses (Current Residence and Permanent Hometown Address)</li>
                  <li>Vehicle information and vehicle registration documents (OR/CR)</li>
                </ul>
              </div>

              <div className="space-y-1.5 pt-3">
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  2. Purpose of Collection & Processing
                </h5>
                <p>
                  Your information will be used exclusively for:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                  <li>Verifying institutional affiliation and legitimacy of applicants entering university grounds.</li>
                  <li>Issuing official digital and physical vehicle gate passes (QR codes and vehicle RFID passes).</li>
                  <li>Automating vehicle gate security logs and monitoring traffic flow within the RSU Main Campus (Odiongan).</li>
                  <li>Immediate contact tracing and emergency notifications in the event of vehicular accidents or safety incidents.</li>
                </ul>
              </div>

              <div className="space-y-1.5 pt-3">
                <h5 className="font-bold text-slate-900">
                  3. Storage, Confidentiality, and Protection
                </h5>
                <p>
                  All submitted records are encrypted and stored within the university's secured database servers. Access is strictly restricted to designated PASO administrators, IT officers, and campus gate guards on duty. Your personal information will never be shared, sold, or disclosed to unauthorized third parties without your explicit written consent, unless mandated by legal authorities.
                </p>
              </div>

              <div className="space-y-1.5 pt-3">
                <h5 className="font-bold text-slate-900">
                  4. Rights of the Data Subject
                </h5>
                <p>
                  Under the Data Privacy Act of 2012, you hold the right to be informed, access your stored data, rectify any erroneous details, request suspension or blocking of inaccurate records, and file a formal inquiry with the National Privacy Commission (NPC) if your privacy rights are violated.
                </p>
              </div>

              <div className="space-y-1.5 pt-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
                <h5 className="font-bold text-emerald-950">
                  5. Explicit Consent Declaration
                </h5>
                <p className="text-emerald-900">
                  By checking the consent box, you freely, voluntarily, and expressly confirm that you have read and understood this Data Privacy Notice and grant full authorization to Romblon State University PASO to collect, store, and process your personal and vehicular information for official campus security purposes.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Governed by National Privacy Commission (NPC) guidelines.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer w-full sm:w-auto"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrivacyConsent(true);
                    setShowPrivacyModal(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer w-full sm:w-auto"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>I Agree & Accept Terms</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Find / Search Academic Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Select Course / Program
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    RSU Main Campus (Odiongan)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="p-3 sm:p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search course code or name (e.g. BSIT, BMMA, Educ...)"
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                {courseSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCourseSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* College Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 no-scrollbar text-[11px]">
                {RSU_COLLEGES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCollege(c.code)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                      selectedCollege === c.code
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Course Cards List */}
            <div className="overflow-y-auto p-3 sm:p-4 space-y-2 flex-1 divide-y divide-slate-100">
              {modalFilteredCourses.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <p className="font-bold text-slate-700">No programs match your search</p>
                  <p className="mt-1">Try searching for a different keyword or select "ALL" colleges.</p>
                </div>
              ) : (
                modalFilteredCourses.map((course) => {
                  const isSelected = selectedCourseId === course.id;
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => selectCourseById(course.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border border-emerald-300 shadow-xs'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-900 text-white">
                            {course.code}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            {course.collegeCode}
                          </span>
                          {course.majors && course.majors.length > 0 && (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded-md">
                              {course.majors.length} Majors
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-900 leading-snug">
                          {course.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {course.college}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
              Tap any course to select and close.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
