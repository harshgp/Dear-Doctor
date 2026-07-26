import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Phone, CheckCircle, Clock, Check, AlertCircle, LogOut } from 'lucide-react';

export default function DoctorDashboard() {
  const { hospitals, appointments, completeAppointment, logoutUser, t } = useContext(AppContext);
  
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

  return (
    <div className="doctor-dashboard">
      
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

      {activeDoctor ? (
        <>
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
                <CheckCircle size={36} style={{ color: 'var(--success)', marginBottom: '12px', opacity: 0.6 }} />
                <p style={{ fontSize: '14px' }}>All patient visits have been completed for today.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {plannedQueue.map((app) => (
                  <div key={app.id} className="ios-glass-card" style={{ padding: '16px' }}>
                    <div className="flex-between" style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '42px', 
                          height: '42px', 
                          borderRadius: '50%', 
                          background: 'var(--primary-light)', 
                          color: 'var(--primary-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '16px',
                          border: '1px solid var(--border-color)'
                        }}>
                          {app.tokenNumber}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-main)' }}>
                            {t(app.patientName)}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <User size={12} /> {app.patientAge} Years &bull; <Phone size={12} /> {app.patientPhone}
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${app.caseType === 'Return Case' ? 'badge-success' : 'badge-primary'}`}>
                        {t(app.caseType)}
                      </span>
                    </div>

                    <div className="flex-between" style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {t('Token ID')}: <strong style={{ color: 'var(--text-main)' }}>{app.id}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {t('Slot')}: <strong style={{ color: 'var(--text-main)' }}>{app.timeSlot}</strong>
                      </div>
                    </div>

                    {app.problemDescription && (
                      <div style={{ fontSize: '13px', background: '#fff9f9', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 59, 48, 0.08)', marginBottom: '12px' }}>
                        <strong style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>
                          {t('Patient Ailment')}
                        </strong>
                        <span style={{ fontWeight: '500' }}>{t(app.problemDescription)}</span>
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
      {/* Logout Button */}
      <div style={{ marginTop: '24px' }}>
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
  );
}
