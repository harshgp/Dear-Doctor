import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { User, Phone, CheckCircle, Clock, Check, AlertCircle } from 'lucide-react';

export default function DoctorDashboard() {
  const { hospitals, appointments, completeAppointment } = useContext(AppContext);
  
  // Flatten all active doctors across all hospitals to select whom to simulate
  const allDoctors = hospitals.flatMap(hosp => 
    hosp.doctors.map(doc => ({
      ...doc,
      hospitalId: hosp.id,
      hospitalName: hosp.name
    }))
  );

  const [selectedDoctorId, setSelectedDoctorId] = useState(allDoctors[0]?.id || '');

  const activeDoctor = allDoctors.find(doc => doc.id === selectedDoctorId);

  // Filter appointments for the selected doctor
  const doctorAppointments = appointments.filter(
    app => app.doctorId === selectedDoctorId
  );

  const plannedQueue = doctorAppointments.filter(app => app.status === 'Planned');
  const completedQueue = doctorAppointments.filter(app => app.status === 'Completed');

  // Simple revenue check (₹151 for each New Case that is booked/paid)
  const totalCollections = doctorAppointments
    .filter(app => app.status !== 'Canceled' && app.caseType === 'New Case')
    .reduce((sum, app) => sum + app.feePaid, 0);

  return (
    <div className="doctor-dashboard">
      {/* Selector to mock different doctor logins */}
      <div className="ios-glass-card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Simulate Doctor Session</label>
          <select 
            className="form-control form-select"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            {allDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.department} - {doc.hospitalName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeDoctor ? (
        <>
          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div className="ios-glass-card text-center" style={{ padding: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>
                {plannedQueue.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>In Queue</div>
            </div>
            <div className="ios-glass-card text-center" style={{ padding: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>
                {completedQueue.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>Completed</div>
            </div>
            <div className="ios-glass-card text-center" style={{ padding: '12px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>
                ₹{totalCollections}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>Token Fees</div>
            </div>
          </div>

          {/* Planned Consultations list */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: 'var(--primary-color)' }} />
              Planned Consultations ({plannedQueue.length})
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
                        {/* Token Badge */}
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
                            {app.patientName}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={12} /> {app.patientAge} Years &bull; <Phone size={12} /> {app.patientPhone}
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${app.caseType === 'Return Case' ? 'badge-success' : 'badge-primary'}`}>
                        {app.caseType}
                      </span>
                    </div>

                    <div className="flex-between" style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Token ID: <strong style={{ color: 'var(--text-main)' }}>{app.id}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Slot: <strong style={{ color: 'var(--text-main)' }}>{app.timeSlot}</strong>
                      </div>
                    </div>

                    <button 
                      className="btn-primary" 
                      style={{ width: '100%', padding: '10px' }}
                      onClick={() => completeAppointment(app.id)}
                    >
                      <Check size={16} /> Complete Consultation
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
  );
}
