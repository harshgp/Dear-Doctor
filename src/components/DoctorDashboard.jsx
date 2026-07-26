import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Phone, CheckCircle, Clock, Check, AlertCircle, LogOut, Calendar, Settings, Sun, Moon } from 'lucide-react';

export default function DoctorDashboard() {
  const { hospitals, appointments, completeAppointment, editDoctor, logoutUser, theme, toggleTheme, t } = useContext(AppContext);
  const [activeSubTab, setActiveSubTab] = useState('appointments');
  
  const allDoctors = hospitals.flatMap(hosp => 
    hosp.doctors.map(doc => ({
      ...doc,
      hospitalId: hosp.id,
      hospitalName: hosp.name
    }))
  );

  const [selectedDoctorId, setSelectedDoctorId] = useState(allDoctors[0]?.id || '');

  const activeDoctor = allDoctors.find(doc => doc.id === selectedDoctorId);

  const doctorAppointments = appointments.filter(
    app => app.doctorId === selectedDoctorId
  );

  const plannedQueue = doctorAppointments.filter(app => app.status === 'Planned');
  const completedQueue = doctorAppointments.filter(app => app.status === 'Completed');

  const totalCollections = doctorAppointments
    .filter(app => app.status !== 'Canceled' && app.caseType === 'New Case')
    .reduce((sum, app) => sum + app.feePaid, 0);

  // Availability schedule local inputs state
  const [docDays, setDocDays] = useState([]);
  const [docSlots, setDocSlots] = useState(8);
  const [docSlotsList, setDocSlotsList] = useState([]);

  useEffect(() => {
    if (activeDoctor) {
      setDocDays(activeDoctor.weeklyDays || []);
      setDocSlots(activeDoctor.slotsPerDay || 8);
      setDocSlotsList(activeDoctor.availableSlots || ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 01:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM']);
    }
  }, [selectedDoctorId]);

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!activeDoctor) return;
    editDoctor(activeDoctor.hospitalId, activeDoctor.id, {
      weeklyDays: docDays,
      slotsPerDay: parseInt(docSlots, 10),
      availableSlots: docSlotsList
    });
    alert(t('Schedule updated successfully!'));
  };

  return (
    <div className="doctor-dashboard">
      
      {/* Desktop Tabs Header Selection */}
      <div className="desktop-tabs" style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className={`desktop-tab-btn ${activeSubTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('appointments')}
        >
          {t('Appointments')}
        </button>
        <button
          type="button"
          className={`desktop-tab-btn ${activeSubTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('settings')}
        >
          {t('Settings')}
        </button>
      </div>

      {/* Simulator Doctor Session dropdown selector card */}
      <div className="ios-glass-card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">{t('Simulate Doctor Session')}</label>
          <select 
            className="form-control form-select"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            {allDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {t(doc.name)} ({t(doc.department)} - {t(doc.hospitalName)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeSubTab === 'appointments' && (
        <div>
          {activeDoctor ? (
            <>
              {/* Doctor Stats Grid */}
              <div className="doctor-stats-grid" style={{ marginBottom: '20px' }}>
                <div className="ios-glass-card text-center" style={{ padding: '12px' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>
                    {plannedQueue.length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{t('In Queue')}</div>
                </div>
                <div className="ios-glass-card text-center" style={{ padding: '12px' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>
                    {completedQueue.length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{t('Completed')}</div>
                </div>
                <div className="ios-glass-card text-center" style={{ padding: '12px' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>
                    ₹{totalCollections}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{t('Token Fees')}</div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} style={{ color: 'var(--primary-color)' }} />
                  {t('Planned Consultations')} ({plannedQueue.length})
                </h3>

                {plannedQueue.length === 0 ? (
                  <div className="ios-glass-card text-center" style={{ padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <CheckCircle size={32} style={{ color: 'var(--success)', marginBottom: '12px', opacity: 0.6 }} />
                    <p style={{ fontSize: '14px' }}>{t('No patients in consultation queue.')}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {plannedQueue.map((app) => (
                      <div key={app.id} className="ios-glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="flex-between">
                          <div>
                            <span className="badge badge-primary" style={{ fontSize: '10px', marginBottom: '4px' }}>
                              Token #{app.tokenNumber}
                            </span>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>
                              {app.patientName}
                            </h4>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-color)' }}>
                            {app.timeSlot}
                          </span>
                        </div>

                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Age: {app.patientAge} &bull; Gender: {t(app.patientGender)} &bull; Phone: {app.patientPhone}
                        </div>

                        {app.problem && (
                          <div style={{ background: 'var(--primary-light)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', borderLeft: '3px solid var(--primary-color)' }}>
                            <strong>{t('Ailment')}:</strong> {t(app.problem)}
                          </div>
                        )}

                        <button 
                          className="btn-primary" 
                          style={{ width: '100%', padding: '10px' }}
                          onClick={() => completeAppointment(app.id)}
                        >
                          <Check size={16} /> {t('Complete Consultation')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="ios-glass-card text-center" style={{ padding: '20px', color: 'var(--danger)' }}>
              <AlertCircle size={24} style={{ marginBottom: '8px' }} />
              <p>No active doctor available. Add doctors in the Admin panel.</p>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Availability Slots Card */}
          {activeDoctor && (
            <div className="ios-glass-card">
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} style={{ color: 'var(--primary-color)' }} />
                {t('Configure Availability Schedule')}
              </h3>
              
              <form onSubmit={handleSaveSchedule}>
                <div className="form-group">
                  <label className="form-label">{t('Daily Capacity Slots')}</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={docSlots} 
                    onChange={(e) => setDocSlots(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px' }}>{t('Weekly Working Days')}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                      const isSelected = docDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => {
                            if (isSelected) {
                              setDocDays(docDays.filter(d => d !== day));
                            } else {
                              setDocDays([...docDays, day]);
                            }
                          }}
                          className={`btn-outline ${isSelected ? 'active' : ''}`}
                          style={{ 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            fontSize: '13px',
                            background: isSelected ? 'var(--primary-color)' : 'transparent',
                            color: isSelected ? 'var(--text-white)' : 'var(--text-main)',
                            borderColor: isSelected ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)'
                          }}
                        >
                          {t(day)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label className="form-label" style={{ marginBottom: '8px' }}>{t('Available Time Slots')}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 01:00 PM', '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM'].map((slot) => {
                      const isSelected = docSlotsList.includes(slot);
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => {
                            if (isSelected) {
                              setDocSlotsList(docSlotsList.filter(s => s !== slot));
                            } else {
                              setDocSlotsList([...docSlotsList, slot]);
                            }
                          }}
                          className={`btn-outline ${isSelected ? 'active' : ''}`}
                          style={{ 
                            padding: '8px 16px', 
                            borderRadius: '10px', 
                            fontSize: '13px',
                            background: isSelected ? 'var(--primary-color)' : 'transparent',
                            color: isSelected ? 'var(--text-white)' : 'var(--text-main)',
                            borderColor: isSelected ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)',
                            flex: '1 0 130px',
                            textAlign: 'center'
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                  {t('Save Schedule')}
                </button>
              </form>
            </div>
          )}

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
      )}

      {/* Mobile-only Bottom Navigation Bar */}
      <div className="bottom-nav">
        <div 
          className={`bottom-nav-item ${activeSubTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('appointments')}
        >
          <Calendar />
          <span>{t('Appointments')}</span>
        </div>
        <div 
          className={`bottom-nav-item ${activeSubTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('settings')}
        >
          <Settings />
          <span>{t('Settings')}</span>
        </div>
      </div>

    </div>
  );
}
