import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  User, Phone, Search, Calendar, Wallet, Settings, 
  MapPin, Plus, CheckCircle, Share2, Clipboard, Mic,
  TrendingUp, RefreshCw, X, CreditCard, ChevronRight, UserPlus, FileText, Sun, Moon, LogOut
} from 'lucide-react';

export default function AgentDashboard() {
  const { 
    hospitals, 
    agentWallet, 
    agentProfile, 
    appointments, 
    theme,
    toggleTheme,
    rechargeWallet, 
    bookAppointment,
    getReturnCaseStatus,
    getBookedSlotsCount,
    cancelAppointment,
    updateAgentProfile,
    logoutUser,
    t
  } = useContext(AppContext);

  // Tabs: 'booking' or 'settings'
  const [activeSubTab, setActiveSubTab] = useState('booking');

  const [registeredVillagers, setRegisteredVillagers] = useState(() => {
    const saved = localStorage.getItem('dear_doctor_villagers');
    return saved ? JSON.parse(saved) : [
      { name: 'Kanti Thakor', phone: '9825012345', age: '52', gender: 'Male' },
      { name: 'Lilaben Chaudhary', phone: '9909987654', age: '45', gender: 'Female' },
      { name: 'Sanjay Patel', phone: '9426055555', age: '32', gender: 'Male' }
    ];
  });

  const saveVillagers = (list) => {
    setRegisteredVillagers(list);
    localStorage.setItem('dear_doctor_villagers', JSON.stringify(list));
  };

  // Form inputs
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [problemText, setProblemText] = useState('');

  // Voice dictation simulation
  const [isListening, setIsListening] = useState(false);

  // Suggested match
  const [suggestedPatient, setSuggestedPatient] = useState(null);

  // Filters
  const [cityFilter, setCityFilter] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 11:00 AM');

  // Auto-set first available slot when doctor changes
  useEffect(() => {
    if (selectedDoctorId) {
      const activeDoc = hospitals.flatMap(h => h.doctors).find(d => d.id === selectedDoctorId);
      if (activeDoc) {
        const slots = activeDoc.availableSlots && activeDoc.availableSlots.length > 0
          ? activeDoc.availableSlots
          : ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 01:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM'];
        setSelectedSlot(slots[0]);
      }
    }
  }, [selectedDoctorId, hospitals]);

  // Modal Payments
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState('recharge');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [pendingBookingData, setPendingBookingData] = useState(null);

  // Receipt
  const [receiptBooking, setReceiptBooking] = useState(null);

  // Settings
  const [editProfileName, setEditProfileName] = useState(agentProfile?.name || '');
  const [editProfileVillage, setEditProfileVillage] = useState(agentProfile?.village || '');
  const [editProfilePhone, setEditProfilePhone] = useState(agentProfile?.phone || '');

  useEffect(() => {
    if (agentProfile) {
      setEditProfileName(agentProfile.name);
      setEditProfileVillage(agentProfile.village);
      setEditProfilePhone(agentProfile.phone);
    }
  }, [agentProfile]);

  useEffect(() => {
    if (patientName.trim().length > 2) {
      const match = registeredVillagers.find(
        (v) => v.name.toLowerCase().startsWith(patientName.toLowerCase().trim())
      );
      if (match) {
        setSuggestedPatient(match);
      } else {
        setSuggestedPatient(null);
      }
    } else {
      setSuggestedPatient(null);
    }
  }, [patientName, registeredVillagers]);

  const selectSuggestedPatient = (patient) => {
    setPatientName(patient.name);
    setPatientPhone(patient.phone);
    setPatientAge(patient.age);
    setPatientGender(patient.gender || 'Male');
    setSuggestedPatient(null);
  };

  const triggerVoiceDictation = () => {
    setIsListening(true);
    setTimeout(() => {
      const ailments = [
        'severe eye pain and irritation',
        'high fever with body shivering since last night',
        'knee joint pain and swelling making it hard to walk',
        'cough, dry throat, and chest congestion for 3 days',
        'abdominal stomach pain after lunch'
      ];
      const randomAilment = ailments[Math.floor(Math.random() * ailments.length)];
      setProblemText(randomAilment);
      setIsListening(false);
    }, 1500);
  };

  const filteredHospitals = cityFilter 
    ? hospitals.filter((h) => h.city === cityFilter)
    : hospitals;

  const allDepts = Array.from(
    new Set(filteredHospitals.flatMap((h) => h.departments))
  );

  const filteredDoctors = filteredHospitals.flatMap((h) => 
    h.doctors.map((d) => ({ ...d, hospitalId: h.id, hospitalName: h.name, city: h.city }))
  ).filter((d) => d.isActive && (!selectedDept || d.department === selectedDept));

  const activeDoc = filteredDoctors.find((d) => d.id === selectedDoctorId);

  const getNext5Dates = () => {
    const list = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = weekdays[d.getDay()];
      list.push({ dateStr, dayName, dateLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) });
    }
    return list;
  };

  const nextDates = getNext5Dates();

  const handleBookingClick = () => {
    if (!patientName || !patientPhone || !patientAge || !activeDoc || !selectedDate) return;

    const patientExists = registeredVillagers.some((v) => v.phone === patientPhone);
    if (!patientExists) {
      const updatedList = [{ name: patientName, phone: patientPhone, age: patientAge, gender: patientGender }, ...registeredVillagers];
      saveVillagers(updatedList);
    }

    const returnStatus = getReturnCaseStatus(patientPhone, activeDoc.hospitalId, activeDoc.department);
    const fee = returnStatus.isReturn ? 0 : 151;

    const bookingPayload = {
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      problemDescription: problemText,
      hospitalId: activeDoc.hospitalId,
      doctorId: activeDoc.id,
      dateStr: selectedDate,
      timeSlot: selectedSlot,
      isReturn: returnStatus.isReturn
    };

    if (fee === 0) {
      const res = bookAppointment(
        bookingPayload.patientName,
        bookingPayload.patientPhone,
        bookingPayload.patientAge,
        bookingPayload.patientGender,
        bookingPayload.problemDescription,
        bookingPayload.hospitalId,
        bookingPayload.doctorId,
        bookingPayload.dateStr,
        bookingPayload.timeSlot,
        false
      );
      if (res.success) {
        setReceiptBooking(res.appointment);
        clearForm();
      } else {
        alert(res.message);
      }
    } else {
      if (agentWallet.balance >= 151) {
        const res = bookAppointment(
          bookingPayload.patientName,
          bookingPayload.patientPhone,
          bookingPayload.patientAge,
          bookingPayload.patientGender,
          bookingPayload.problemDescription,
          bookingPayload.hospitalId,
          bookingPayload.doctorId,
          bookingPayload.dateStr,
          bookingPayload.timeSlot,
          true
        );
        if (res.success) {
          setReceiptBooking(res.appointment);
          clearForm();
        } else {
          alert(res.message);
        }
      } else {
        setPendingBookingData(bookingPayload);
        setPaymentType('booking');
        setPaymentAmount(151);
        setShowPaymentModal(true);
      }
    }
  };

  const clearForm = () => {
    setPatientName('');
    setPatientPhone('');
    setPatientAge('');
    setPatientGender('Male');
    setProblemText('');
    setSelectedDoctorId('');
    setSelectedDate('');
  };

  const handlePaymentSuccess = () => {
    if (paymentType === 'recharge') {
      rechargeWallet(paymentAmount);
      setShowPaymentModal(false);
    } else if (paymentType === 'booking' && pendingBookingData) {
      const res = bookAppointment(
        pendingBookingData.patientName,
        pendingBookingData.patientPhone,
        pendingBookingData.patientAge,
        pendingBookingData.patientGender,
        pendingBookingData.problemDescription,
        pendingBookingData.hospitalId,
        pendingBookingData.doctorId,
        pendingBookingData.dateStr,
        pendingBookingData.timeSlot,
        false
      );
      if (res.success) {
        setReceiptBooking(res.appointment);
        clearForm();
      } else {
        alert(res.message);
      }
      setPendingBookingData(null);
      setShowPaymentModal(false);
    }
  };

  const triggerRechargeFlow = (amount) => {
    setPaymentType('recharge');
    setPaymentAmount(amount);
    setShowPaymentModal(true);
  };

  const copySMSTemplate = (app) => {
    const text = `Dear ${app.patientName}, Token ID ${app.id} for ${app.doctorName} (Token #${app.tokenNumber}) at ${app.hospitalName}, ${app.hospitalCity} on ${app.date} (${app.timeSlot}) is confirmed. Paid: Rs ${app.feePaid}. - Gozaria Health Desk`;
    navigator.clipboard.writeText(text);
    alert('SMS template copied successfully');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateAgentProfile({
      name: editProfileName,
      village: editProfileVillage,
      phone: editProfilePhone
    });
    alert('Dealer Profile updated successfully');
  };

  return (
    <div className="agent-dashboard">
      
      {/* Desktop Tabs Header Selection */}
      <div className="desktop-tabs" style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className={`desktop-tab-btn ${activeSubTab === 'booking' ? 'active' : ''}`}
          onClick={() => {
            setActiveSubTab('booking');
            setReceiptBooking(null);
          }}
        >
          {t('Patient Booking')}
        </button>
        <button
          type="button"
          className={`desktop-tab-btn ${activeSubTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('settings')}
        >
          {t('Settings & Wallet')}
        </button>
      </div>

      {activeSubTab === 'booking' && (
        <div>
          {receiptBooking ? (
            /* Successful Receipt screen */
            <div className="ios-glass-card" style={{ padding: '24px', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <CheckCircle size={44} style={{ color: 'var(--success)' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{t('Appointment Confirmed')}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Receipt Generated Successfully</p>

              <div style={{ 
                background: 'var(--panel-bg-solid)', 
                border: '1px dashed var(--border-color)', 
                borderRadius: '16px', 
                padding: '20px', 
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('Token ID')}</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '13px' }}>{receiptBooking.id}</strong>
                </div>

                <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('Token No')}</span>
                  <strong style={{ color: 'var(--primary-color)', fontSize: '18px', fontWeight: '700' }}>#{receiptBooking.tokenNumber}</strong>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('Full Name')}</div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>
                    {t(receiptBooking.patientName)} ({t(receiptBooking.patientGender)}) &bull; {receiptBooking.patientAge} {t('Years')}
                  </div>
                </div>

                {receiptBooking.problemDescription && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('Patient Ailment')}</div>
                    <div style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '13px' }}>
                      {t(receiptBooking.problemDescription)}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('Select Doctor')}</div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>
                    {t(receiptBooking.doctorName)} ({t(receiptBooking.department)})
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('Active Hospital Location')}</div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '13px' }}>
                    {t(receiptBooking.hospitalName)}, {t(receiptBooking.hospitalCity)}
                  </div>
                </div>

                <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date & Slot</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '13px' }}>{receiptBooking.date} &bull; {receiptBooking.timeSlot}</strong>
                </div>

                <div className="flex-between">
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('Fee')}</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>
                    Rs {receiptBooking.feePaid} ({t(receiptBooking.paymentMethod)})
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  border: '3px solid var(--primary-color)', 
                  borderRadius: '12px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px'
                }}>
                  <svg width="84" height="84" viewBox="0 0 100 100" fill="#1d1d1f">
                    <rect x="0" y="0" width="25" height="25" />
                    <rect x="5" y="5" width="15" height="15" fill="#fff" />
                    <rect x="8" y="8" width="9" height="9" />
                    <rect x="75" y="0" width="25" height="25" />
                    <rect x="80" y="5" width="15" height="15" fill="#fff" />
                    <rect x="83" y="8" width="9" height="9" />
                    <rect x="0" y="75" width="25" height="25" />
                    <rect x="5" y="80" width="15" height="15" fill="#fff" />
                    <rect x="8" y="83" width="9" height="9" />
                    <rect x="35" y="35" width="30" height="30" />
                    <rect x="40" y="40" width="20" height="20" fill="#fff" />
                    <rect x="45" y="45" width="10" height="10" />
                    <rect x="40" y="10" width="10" height="10" />
                    <rect x="90" y="40" width="10" height="10" />
                    <rect x="10" y="40" width="10" height="10" />
                    <rect x="40" y="90" width="10" height="10" />
                  </svg>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t('Scan at hospital counter')}</div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => copySMSTemplate(receiptBooking)}
                >
                  <Share2 size={16} /> {t('Share SMS')}
                </button>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1 }}
                  onClick={() => setReceiptBooking(null)}
                >
                  {t('Book New')}
                </button>
              </div>
            </div>
          ) : (
            /* Responsive Grid Split booking view */
            <div className="responsive-grid">
              
              {/* Column 1: Patient details input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="ios-glass-card">
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserPlus size={16} style={{ color: 'var(--primary-color)' }} />
                    {t('1. Patient Details')}
                  </h3>

                  {suggestedPatient && (
                    <div 
                      onClick={() => selectSuggestedPatient(suggestedPatient)}
                      style={{ 
                        background: 'var(--primary-light)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '12px', 
                        padding: '10px 14px', 
                        marginBottom: '14px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                        Match found: {t(suggestedPatient.name)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Mobile: {suggestedPatient.phone} &bull; Age: {suggestedPatient.age} Y. Click to auto-fill.
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">{t('Full Name')}</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={patientName} 
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter Patient Full Name"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">{t('Phone Number')}</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        value={patientPhone} 
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="10-digit number"
                        pattern="[0-9]{10}"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('Age')}</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={patientAge} 
                        onChange={(e) => setPatientAge(e.target.value)}
                        placeholder="Years"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label">{t('Gender')}</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="gender" 
                          value="Male" 
                          checked={patientGender === 'Male'} 
                          onChange={() => setPatientGender('Male')}
                          style={{ width: '18px', height: '18px' }}
                        />
                        {t('Male')}
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="gender" 
                          value="Female" 
                          checked={patientGender === 'Female'} 
                          onChange={() => setPatientGender('Female')}
                          style={{ width: '18px', height: '18px' }}
                        />
                        {t('Female')}
                      </label>
                    </div>
                  </div>

                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">{t('Patient Ailment')}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={problemText} 
                        onChange={(e) => setProblemText(e.target.value)}
                        placeholder={t('Enter patient problem')}
                      />
                      <button
                        type="button"
                        onClick={triggerVoiceDictation}
                        className={`btn-secondary ${isListening ? 'mic-pulse' : ''}`}
                        style={{ padding: '10px 14px', borderRadius: '12px' }}
                      >
                        <Mic size={18} />
                      </button>
                    </div>
                    {isListening && (
                      <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', fontWeight: '600' }}>
                        {t('Listening')}... {t('Speak now')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2: Center/Doctor selection, picker date, & Booking CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="ios-glass-card">
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Search size={16} style={{ color: 'var(--primary-color)' }} />
                    {t('2. Select Center & Doctor')}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <select 
                        className="form-control form-select"
                        value={cityFilter}
                        onChange={(e) => {
                          setCityFilter(e.target.value);
                          setSelectedDept('');
                          setSelectedDoctorId('');
                          setSelectedDate('');
                        }}
                      >
                        <option value="">{t('All Cities')}</option>
                        <option value="Mehsana">Mehsana</option>
                        <option value="Palanpur">Palanpur</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <select 
                        className="form-control form-select"
                        value={selectedDept}
                        onChange={(e) => {
                          setSelectedDept(e.target.value);
                          setSelectedDoctorId('');
                          setSelectedDate('');
                        }}
                        disabled={!allDepts.length}
                      >
                        <option value="">{t('All Departments')}</option>
                        {allDepts.map((d) => (
                          <option key={d} value={d}>{t(d)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <select 
                      className="form-control form-select"
                      value={selectedDoctorId}
                      onChange={(e) => {
                        setSelectedDoctorId(e.target.value);
                        setSelectedDate('');
                      }}
                      disabled={!filteredDoctors.length}
                    >
                      <option value="">{t('Select Doctor')}</option>
                      {filteredDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {t(doc.name)} - {t(doc.specialty)} ({t(doc.hospitalName)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeDoc && (
                  <div className="ios-glass-card">
                    <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} style={{ color: 'var(--primary-color)' }} />
                      {t('3. Pick Date')}
                    </h3>

                    <div className="no-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {nextDates.map((item) => {
                        const isAvailableDay = activeDoc.weeklyDays.includes(item.dayName);
                        const bookedCount = getBookedSlotsCount(activeDoc.id, item.dateStr);
                        const isFull = bookedCount >= activeDoc.slotsPerDay;
                        const slotsLeft = activeDoc.slotsPerDay - bookedCount;

                        return (
                          <button
                            type="button"
                            key={item.dateStr}
                            disabled={!isAvailableDay || isFull}
                            onClick={() => setSelectedDate(item.dateStr)}
                            style={{
                              flex: '0 0 84px',
                              padding: '12px 8px',
                              borderRadius: '12px',
                              border: '1px solid',
                              borderColor: selectedDate === item.dateStr ? 'var(--primary-color)' : 'var(--border-color)',
                              background: selectedDate === item.dateStr ? 'var(--primary-color)' : 'var(--panel-bg-solid)',
                              color: selectedDate === item.dateStr ? 'var(--text-white)' : 'var(--text-main)',
                              opacity: (!isAvailableDay || isFull) ? 0.35 : 1,
                              cursor: (!isAvailableDay || isFull) ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', opacity: selectedDate === item.dateStr ? 0.8 : 0.6 }}>
                              {t(item.dayName)}
                            </span>
                            <span style={{ fontSize: '15px', fontWeight: '700' }}>
                              {item.dateLabel.split(' ')[0]}
                            </span>
                            <span style={{ fontSize: '9px', fontWeight: '500', opacity: 0.9 }}>
                              {!isAvailableDay ? t('Off-day') : isFull ? t('Full') : `${slotsLeft} ${t('left')}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedDate && (
                      <div style={{ marginTop: '16px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">{t('Available Timings')}</label>
                          <select 
                            className="form-control form-select"
                            value={selectedSlot}
                            onChange={(e) => setSelectedSlot(e.target.value)}
                          >
                            {(activeDoc.availableSlots && activeDoc.availableSlots.length > 0 ? activeDoc.availableSlots : ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 01:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM']).map((slot) => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {patientName && patientPhone && patientAge && activeDoc && selectedDate && (
                  <div className="ios-glass-card" style={{ padding: '16px' }}>
                    {(() => {
                      const returnStatus = getReturnCaseStatus(patientPhone, activeDoc.hospitalId, activeDoc.department);
                      if (returnStatus.isReturn) {
                        return (
                          <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '500', marginBottom: '14px' }}>
                            {t('Verified Return Case! Previous visit was within 30 days. No token fee (Fee: 0) will be charged.')}
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex-between" style={{ marginBottom: '14px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{t('Token consultation charge:')}</span>
                            <strong style={{ fontSize: '18px', color: 'var(--text-main)' }}>₹151</strong>
                          </div>
                        );
                      }
                    })()}

                    <button 
                      className="btn-primary" 
                      style={{ width: '100%' }}
                      onClick={handleBookingClick}
                    >
                      {t('Confirm Booking & Pay')}
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* Settings Panel */}
      {activeSubTab === 'settings' && (
        <div className="responsive-grid">
          
          {/* Column 1: Settings Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="ios-glass-card" style={{ padding: '20px' }}>
              <div className="flex-between" style={{ padding: '16px', background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)', color: '#ffffff', borderRadius: '16px', border: 'none', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('Village Agent Wallet')}</div>
                  <div style={{ fontSize: '30px', fontWeight: '700', marginTop: '2px' }}>₹{agentWallet.balance}</div>
                </div>
                <Wallet size={32} style={{ opacity: 0.9 }} />
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {t('Instant Recharge Wallet')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[500, 1000, 1500].map((amt) => {
                    const bonus = Math.floor(amt / 500) * 25;
                    return (
                      <button 
                        key={amt}
                        type="button"
                        className="btn-secondary flex-between"
                        style={{ padding: '10px 16px', fontSize: '14px', width: '100%', borderRadius: '12px' }}
                        onClick={() => triggerRechargeFlow(amt)}
                      >
                        <span>{t('Recharge')} ₹{amt}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--success)' }}>
                          Credit: ₹{amt + bonus}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Display Preferences Switcher */}
            <div className="ios-glass-card">
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {theme === 'dark' ? <Moon size={16} style={{ color: 'var(--primary-color)' }} /> : <Sun size={16} style={{ color: 'var(--primary-color)' }} />}
                {t('Display Preferences')}
              </h3>
              <div className="flex-between" style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' }}>{t('Dark Mode')}</span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={toggleTheme}
                  style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}
                >
                  {theme === 'dark' ? t('Enabled') : t('Disabled')}
                </button>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                className="btn-danger"
                onClick={logoutUser}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <LogOut size={16} />
                {t('Logout')}
              </button>
            </div>
          </div>

          {/* Column 2: Agent Profiles & Ledgers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="ios-glass-card">
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Settings size={16} style={{ color: 'var(--primary-color)' }} />
                {t('Dealer / Agent Profile')}
              </h3>
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label">{t('Dealer Name')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editProfileName} 
                    onChange={(e) => setEditProfileName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('Assigned Village')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editProfileVillage} 
                    onChange={(e) => setEditProfileVillage(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('Registered Phone')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editProfilePhone} 
                    onChange={(e) => setEditProfilePhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('Dealer Unique Code')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={agentProfile?.code || ''} 
                    disabled
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  {t('Save Profile')}
                </button>
              </form>
            </div>

            <div className="ios-glass-card">
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} style={{ color: 'var(--primary-color)' }} />
                {t('Transaction Ledger')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {agentWallet.transactions.map((tx) => (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>{t(tx.details)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tx.date}</div>
                    </div>
                    <strong style={{ fontSize: '13px', color: tx.type === 'credit' ? 'var(--success)' : 'var(--danger)' }}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Razorpay Standard Simulator Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ maxWidth: '360px', borderRadius: '16px', overflow: 'hidden' }}>
            
            <div style={{ background: '#0e2447', padding: '16px', color: '#ffffff', position: 'relative' }}>
              <div className="flex-between">
                <div>
                  <div style={{ fontSize: '10px', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>Razorpay Secure</div>
                  <div style={{ fontSize: '16px', fontWeight: '700' }}>Dear Doctor Platform</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', opacity: 0.6 }}>Amount</div>
                  <div style={{ fontSize: '16px', fontWeight: '700' }}>₹{paymentAmount}</div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPaymentModal(false)}
                style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px', 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer' 
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px', background: '#ffffff' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#515974', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Preferred Payment Methods
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div 
                  onClick={handlePaymentSuccess}
                  style={{ 
                    border: '1px solid rgba(0, 102, 204, 0.15)', 
                    borderRadius: '12px', 
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: '#f8f9ff',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(0, 102, 204, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="7" y="7" width="2" height="2"/><rect x="15" y="7" width="2" height="2"/><rect x="7" y="15" width="2" height="2"/><rect x="15" y="15" width="2" height="2"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>Pay via UPI QR Code</div>
                      <div style={{ fontSize: '11px', color: '#7f8c8d' }}>Scan and pay using any UPI App</div>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: '#bdc3c7' }} />
                </div>

                <div 
                  onClick={handlePaymentSuccess}
                  style={{ 
                    border: '1px solid rgba(0, 0, 0, 0.06)', 
                    borderRadius: '12px', 
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                      <CreditCard size={18} style={{ color: '#7f8c8d' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>Card / Netbanking</div>
                      <div style={{ fontSize: '11px', color: '#7f8c8d' }}>Visa, Mastercard, RuPay, Netbanking</div>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: '#bdc3c7' }} />
                </div>
              </div>

              <div style={{ fontSize: '9px', textAlign: 'center', color: '#95a5a6', marginTop: '20px' }}>
                Secure payments processed by Razorpay. Do not close this window.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-only Bottom Navigation Bar */}
      <div className="bottom-nav">
        <div 
          className={`bottom-nav-item ${activeSubTab === 'booking' ? 'active' : ''}`}
          onClick={() => {
            setActiveSubTab('booking');
            setReceiptBooking(null);
          }}
        >
          <Calendar />
          <span>{t('Patient Booking')}</span>
        </div>
        <div 
          className={`bottom-nav-item ${activeSubTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('settings')}
        >
          <Settings />
          <span>{t('Settings & Wallet')}</span>
        </div>
      </div>

    </div>
  );
}
