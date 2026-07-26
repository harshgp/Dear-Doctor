import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  User, Phone, Search, Calendar, Wallet, Settings, 
  MapPin, Plus, CheckCircle, ArrowRight, Share2, Clipboard,
  TrendingUp, RefreshCw, X, CreditCard, ChevronRight, UserPlus, Eye
} from 'lucide-react';

export default function AgentDashboard() {
  const { 
    hospitals, 
    agentWallet, 
    agentProfile, 
    appointments, 
    rechargeWallet, 
    bookAppointment,
    getReturnCaseStatus,
    getBookedSlotsCount,
    cancelAppointment,
    updateAgentProfile
  } = useContext(AppContext);

  // Tabs: 'booking' or 'settings'
  const [activeSubTab, setActiveSubTab] = useState('booking');

  // Villager Registry state (saved in local memory/state)
  const [registeredVillagers, setRegisteredVillagers] = useState(() => {
    const saved = localStorage.getItem('dear_doctor_villagers');
    return saved ? JSON.parse(saved) : [
      { name: 'Kanti Thakor', phone: '9825012345', age: '52' },
      { name: 'Lilaben Chaudhary', phone: '9909987654', age: '45' },
      { name: 'Sanjay Patel', phone: '9426055555', age: '32' }
    ];
  });

  const saveVillagers = (list) => {
    setRegisteredVillagers(list);
    localStorage.setItem('dear_doctor_villagers', JSON.stringify(list));
  };

  // Add Patient Form state
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patName, setPatName] = useState('');
  const [patPhone, setPatPhone] = useState('');
  const [patAge, setPatAge] = useState('');

  // Selected Patient for Booking
  const [selectedPatientIndex, setSelectedPatientIndex] = useState('');

  // Search/Filter states
  const [cityFilter, setCityFilter] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 11:00 AM');

  // Razorpay Checkout Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState('recharge'); // 'recharge' or 'booking'
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [pendingBookingData, setPendingBookingData] = useState(null);

  // Status variables after successful booking
  const [receiptBooking, setReceiptBooking] = useState(null);

  // Agent Settings Form states
  const [editProfileName, setEditProfileName] = useState(agentProfile.name);
  const [editProfileVillage, setEditProfileVillage] = useState(agentProfile.village);
  const [editProfilePhone, setEditProfilePhone] = useState(agentProfile.phone);

  const handleAddPatient = (e) => {
    e.preventDefault();
    if (!patName || !patPhone || !patAge) return;
    const newPat = { name: patName, phone: patPhone, age: patAge };
    const updated = [newPat, ...registeredVillagers];
    saveVillagers(updated);
    
    // Select the newly added patient
    setSelectedPatientIndex(0);
    
    setPatName('');
    setPatPhone('');
    setPatAge('');
    setShowAddPatient(false);
  };

  // Filter hospitals by city
  const filteredHospitals = cityFilter 
    ? hospitals.filter((h) => h.city === cityFilter)
    : hospitals;

  // Flatten all departments available in filtered hospitals
  const allDepts = Array.from(
    new Set(filteredHospitals.flatMap((h) => h.departments))
  );

  // Flatten doctors in filtered hospitals matching department
  const filteredDoctors = filteredHospitals.flatMap((h) => 
    h.doctors.map((d) => ({ ...d, hospitalId: h.id, hospitalName: h.name, city: h.city }))
  ).filter((d) => d.isActive && (!selectedDept || d.department === selectedDept));

  const activeDoc = filteredDoctors.find((d) => d.id === selectedDoctorId);

  // Get next 3 available days for scheduling
  const getNext3Dates = () => {
    const list = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = weekdays[d.getDay()];
      list.push({ dateStr, dayName, dateLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) });
    }
    return list;
  };

  const nextDates = getNext3Dates();

  const handleBookingClick = () => {
    if (selectedPatientIndex === '') return;
    const patient = registeredVillagers[selectedPatientIndex];
    if (!activeDoc || !selectedDate || !selectedSlot) return;

    // Check return case status
    const returnStatus = getReturnCaseStatus(patient.phone, activeDoc.hospitalId, activeDoc.department);
    const fee = returnStatus.isReturn ? 0 : 151;

    const bookingPayload = {
      patientName: patient.name,
      patientPhone: patient.phone,
      patientAge: patient.age,
      hospitalId: activeDoc.hospitalId,
      doctorId: activeDoc.id,
      dateStr: selectedDate,
      timeSlot: selectedSlot,
      isReturn: returnStatus.isReturn
    };

    if (fee === 0) {
      // Free return case booking: proceeds immediately
      const res = bookAppointment(
        bookingPayload.patientName,
        bookingPayload.patientPhone,
        bookingPayload.patientAge,
        bookingPayload.hospitalId,
        bookingPayload.doctorId,
        bookingPayload.dateStr,
        bookingPayload.timeSlot,
        false
      );
      if (res.success) {
        setReceiptBooking(res.appointment);
      } else {
        alert(res.message);
      }
    } else {
      // New case (₹151): check wallet
      if (agentWallet.balance >= 151) {
        // Book using wallet
        const res = bookAppointment(
          bookingPayload.patientName,
          bookingPayload.patientPhone,
          bookingPayload.patientAge,
          bookingPayload.hospitalId,
          bookingPayload.doctorId,
          bookingPayload.dateStr,
          bookingPayload.timeSlot,
          true
        );
        if (res.success) {
          setReceiptBooking(res.appointment);
        } else {
          alert(res.message);
        }
      } else {
        // Wallet is insufficient, trigger Razorpay Direct UPI Checkout Modal
        setPendingBookingData(bookingPayload);
        setPaymentType('booking');
        setPaymentAmount(151);
        setShowPaymentModal(true);
      }
    }
  };

  const handlePaymentSuccess = () => {
    if (paymentType === 'recharge') {
      rechargeWallet(paymentAmount);
      setShowPaymentModal(false);
    } else if (paymentType === 'booking' && pendingBookingData) {
      // Book using direct UPI method (wallet payment argument = false)
      const res = bookAppointment(
        pendingBookingData.patientName,
        pendingBookingData.patientPhone,
        pendingBookingData.patientAge,
        pendingBookingData.hospitalId,
        pendingBookingData.doctorId,
        pendingBookingData.dateStr,
        pendingBookingData.timeSlot,
        false
      );
      if (res.success) {
        setReceiptBooking(res.appointment);
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
    const text = `Dear ${app.patientName}, Token ID ${app.id} for ${app.doctorName} (Token #${app.tokenNumber}) at ${app.hospitalName}, ${app.hospitalCity} on ${app.date} (${app.timeSlot}) is confirmed. Paid: ₹${app.feePaid}. - Gozaria Health Desk`;
    navigator.clipboard.writeText(text);
    alert('Booking message copied to clipboard');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateAgentProfile({
      name: editProfileName,
      village: editProfileVillage,
      phone: editProfilePhone
    });
    alert('Agent Profile updated successfully');
  };

  // Pre-calculated bonus estimates for recharge buttons
  const getBonusText = (amt) => {
    const bonus = Math.floor(amt / 500) * 25;
    return `Credit: ₹${amt + bonus} (Bonus: +₹${bonus})`;
  };

  return (
    <div className="agent-dashboard">
      
      {/* Booking Flow Tab */}
      {activeSubTab === 'booking' && (
        <div>
          {receiptBooking ? (
            /* Successful Booking Receipt Screen */
            <div className="ios-glass-card" style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <CheckCircle size={48} style={{ color: 'var(--success)' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Appointment Confirmed</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Receipt Generated Successfully</p>

              {/* QR / Token View */}
              <div style={{ 
                background: '#f8fafc', 
                border: '1px dashed var(--border-color)', 
                borderRadius: '16px', 
                padding: '20px', 
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <div className="flex-between" style={{ borderBottom: '1px solid #eef2f6', paddingBottom: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Token ID</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>{receiptBooking.id}</strong>
                </div>

                <div className="flex-between" style={{ borderBottom: '1px solid #eef2f6', paddingBottom: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Consultation Token No</span>
                  <strong style={{ color: 'var(--primary-color)', fontSize: '18px', fontWeight: '700' }}>#{receiptBooking.tokenNumber}</strong>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Patient Name</div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>
                    {receiptBooking.patientName} ({receiptBooking.patientAge} Years)
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Doctor & Department</div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>
                    {receiptBooking.doctorName} ({receiptBooking.department})
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hospital Center</div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '13px' }}>
                    {receiptBooking.hospitalName}, {receiptBooking.hospitalCity}
                  </div>
                </div>

                <div className="flex-between" style={{ borderBottom: '1px solid #eef2f6', paddingBottom: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date & Slot</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '13px' }}>{receiptBooking.date} &bull; {receiptBooking.timeSlot}</strong>
                </div>

                <div className="flex-between">
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fee Paid</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>
                    ₹{receiptBooking.feePaid} ({receiptBooking.paymentMethod})
                  </strong>
                </div>
              </div>

              {/* Fake QR Scanner Visual */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  border: '4px solid var(--primary-color)', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#ffffff',
                  padding: '8px'
                }}>
                  {/* Clean SVG Mock QR Pattern (using dots) */}
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="var(--text-main)">
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
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Hospital Scan Code</div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => copySMSTemplate(receiptBooking)}
                >
                  <Share2 size={16} /> Share SMS
                </button>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1 }}
                  onClick={() => setReceiptBooking(null)}
                >
                  Book New
                </button>
              </div>
            </div>
          ) : (
            /* Patient Registration & Booking Layout */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Wallet Bar Overview */}
              <div className="ios-glass-card flex-between" style={{ padding: '16px', background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)', color: 'var(--text-white)' }}>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.8, fontWeight: '500' }}>Village Agent Wallet</div>
                  <div style={{ fontSize: '26px', fontWeight: '700', marginTop: '2px' }}>₹{agentWallet.balance}</div>
                </div>
                <Wallet size={32} style={{ opacity: 0.9 }} />
              </div>

              {/* Patient Selection Card */}
              <div className="ios-glass-card">
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserPlus size={16} style={{ color: 'var(--primary-color)' }} />
                    1. Patient Details
                  </h3>
                  {!showAddPatient && (
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '8px' }}
                      onClick={() => setShowAddPatient(true)}
                    >
                      New Patient
                    </button>
                  )}
                </div>

                {showAddPatient ? (
                  /* Add Patient Inline Form */
                  <form onSubmit={handleAddPatient} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', marginBottom: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={patName} 
                        onChange={(e) => setPatName(e.target.value)}
                        placeholder="e.g. Popatji Thakor"
                        required
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          value={patPhone} 
                          onChange={(e) => setPatPhone(e.target.value)}
                          placeholder="10 Digit Mobile"
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Age</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={patAge} 
                          onChange={(e) => setPatAge(e.target.value)}
                          placeholder="Years"
                          min="1"
                          max="110"
                          required
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button type="button" className="btn-secondary" style={{ flex: 1, padding: '8px' }} onClick={() => setShowAddPatient(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary" style={{ flex: 1, padding: '8px' }}>
                        Register
                      </button>
                    </div>
                  </form>
                ) : null}

                <div className="form-group" style={{ margin: 0 }}>
                  <select 
                    className="form-control form-select"
                    value={selectedPatientIndex}
                    onChange={(e) => setSelectedPatientIndex(e.target.value)}
                  >
                    <option value="">Select Villager Patient</option>
                    {registeredVillagers.map((v, idx) => (
                      <option key={idx} value={idx}>
                        {v.name} ({v.age} Y) &bull; {v.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hospital Filters & Doctor Search */}
              <div className="ios-glass-card">
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={16} style={{ color: 'var(--primary-color)' }} />
                  2. Select Center & Doctor
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
                      <option value="">All Cities</option>
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
                      <option value="">All Departments</option>
                      {allDepts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <select 
                    className="form-control form-select"
                    value={selectedDoctorId}
                    onChange={(e) => {
                      setSelectedDoctorId(e.target.value);
                      setSelectedDate('');
                    }}
                    disabled={!filteredDoctors.length}
                  >
                    <option value="">Select Doctor</option>
                    {filteredDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialty} ({doc.hospitalName})
                      </option>
                    ))}
                  </select>
                </div>

                {activeDoc && (
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', marginTop: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{activeDoc.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Available Days: {activeDoc.weeklyDays.join(', ')} | Limit: {activeDoc.slotsPerDay} per day
                    </div>
                  </div>
                )}
              </div>

              {/* Date & Slot selection calendar */}
              {activeDoc && (
                <div className="ios-glass-card">
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} style={{ color: 'var(--primary-color)' }} />
                    3. Pick Date
                  </h3>

                  {/* Horizontal Scroll Days list */}
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
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
                            borderColor: selectedDate === item.dateStr ? 'var(--primary-color)' : 'rgba(0,102,204,0.15)',
                            background: selectedDate === item.dateStr ? 'var(--primary-color)' : 'rgba(255,255,255,0.7)',
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
                            {item.dayName}
                          </span>
                          <span style={{ fontSize: '15px', fontWeight: '700' }}>
                            {item.dateLabel.split(' ')[0]}
                          </span>
                          <span style={{ fontSize: '9px', fontWeight: '500', opacity: 0.9 }}>
                            {!isAvailableDay ? 'Off-day' : isFull ? 'Full' : `${slotsLeft} left`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedDate && (
                    <div style={{ marginTop: '16px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Available Timings</label>
                        <select 
                          className="form-control form-select"
                          value={selectedSlot}
                          onChange={(e) => setSelectedSlot(e.target.value)}
                        >
                          <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                          <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                          <option value="11:00 AM - 12:00 PM">11:00 PM - 12:00 PM</option>
                          <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                          <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Booking CTA */}
              {selectedPatientIndex !== '' && activeDoc && selectedDate && (
                <div className="ios-glass-card" style={{ padding: '16px' }}>
                  {/* Return check visual alerts */}
                  {(() => {
                    const pat = registeredVillagers[selectedPatientIndex];
                    const returnStatus = getReturnCaseStatus(pat.phone, activeDoc.hospitalId, activeDoc.department);
                    if (returnStatus.isReturn) {
                      return (
                        <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '500', marginBottom: '14px' }}>
                          Verified Return Case! Previous visit was within 30 days. No token fee (Fee: ₹0) will be charged.
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex-between" style={{ marginBottom: '14px' }}>
                          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Token consultation charge:</span>
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
                    Confirm Booking & Pay
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Settings / Wallet tab view */}
      {activeSubTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Wallet Balance Card */}
          <div className="ios-glass-card" style={{ padding: '20px' }}>
            <div className="flex-between" style={{ marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Wallet Balance</span>
                <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-color)', marginTop: '4px' }}>
                  ₹{agentWallet.balance}
                </div>
              </div>
              <Wallet size={36} style={{ color: 'var(--primary-color)', opacity: 0.8 }} />
            </div>

            {/* Instant Recharge Panel */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Instant Recharge Wallet
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[500, 1000, 1500].map((amt) => (
                  <button 
                    key={amt}
                    type="button"
                    className="btn-secondary flex-between"
                    style={{ padding: '10px 16px', fontSize: '14px', width: '100%', borderRadius: '12px' }}
                    onClick={() => triggerRechargeFlow(amt)}
                  >
                    <span>Recharge ₹{amt}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--success)' }}>
                      {getBonusText(amt).split(' ')[1]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dealer Profile form */}
          <div className="ios-glass-card">
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={16} style={{ color: 'var(--primary-color)' }} />
              Dealer / Agent Profile
            </h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Dealer Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editProfileName} 
                  onChange={(e) => setEditProfileName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Village</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editProfileVillage} 
                  onChange={(e) => setEditProfileVillage(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Registered Phone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editProfilePhone} 
                  onChange={(e) => setEditProfilePhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dealer Unique Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={agentProfile.code} 
                  disabled
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                Save Profile
              </button>
            </form>
          </div>

          {/* Transactions ledger */}
          <div className="ios-glass-card">
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} style={{ color: 'var(--primary-color)' }} />
              Transaction Ledger
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              {agentWallet.transactions.map((tx) => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{tx.details}</div>
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
      )}

      {/* Razorpay Standard Simulator Modal Popup */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ maxWidth: '360px', borderRadius: '16px', overflow: 'hidden' }}>
            
            {/* Razorpay Blue Bar Header */}
            <div style={{ background: '#0e2447', padding: '16px', color: 'var(--text-white)', position: 'relative' }}>
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

            {/* Razorpay Payment choices */}
            <div style={{ padding: '20px', background: '#ffffff' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#515974', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Preferred Payment Methods
              </div>

              {/* UPI Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {/* UPI QR Mock Option */}
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
                  className="razorpay-method-row"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(0, 102, 204, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '6px' }}>
                      {/* Simulated QR Icon */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="7" y="7" width="2" height="2"/><rect x="15" y="7" width="2" height="2"/><rect x="7" y="15" width="2" height="2"/><rect x="15" y="15" width="2" height="2"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>Pay via UPI QR Code</div>
                      <div style={{ fontSize: '11px', color: '#7f8c8d' }}>Scan and pay using any UPI App</div>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: '#bdc3c7' }} />
                </div>

                {/* Instant Cards Mock Option */}
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
                  className="razorpay-method-row"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.04)', display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '6px' }}>
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

      {/* Screen bottom menu tabs */}
      <div className="bottom-nav">
        <div 
          className={`bottom-nav-item ${activeSubTab === 'booking' ? 'active' : ''}`}
          onClick={() => {
            setActiveSubTab('booking');
            setReceiptBooking(null);
          }}
        >
          <Calendar />
          <span>Patient Booking</span>
        </div>
        <div 
          className={`bottom-nav-item ${activeSubTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('settings')}
        >
          <Settings />
          <span>Settings & Wallet</span>
        </div>
      </div>

    </div>
  );
}
