import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, Edit2, ShieldAlert, Sparkles, Stethoscope, Check, Calendar, Activity, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { hospitals, appointments, addDoctor, editDoctor, logoutUser, t } = useContext(AppContext);
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // New Doctor Form State
  const [newDocName, setNewDocName] = useState('');
  const [newDocDept, setNewDocDept] = useState('General Medicine');
  const [newDocSpecialty, setNewDocSpecialty] = useState('');
  const [newDocExp, setNewDocExp] = useState('');
  const [newDocDays, setNewDocDays] = useState(['Mon', 'Wed', 'Fri']);
  const [newDocSlots, setNewDocSlots] = useState(8);

  // Edit Doctor Form State
  const [editingDocId, setEditingDocId] = useState(null);
  const [editDocName, setEditDocName] = useState('');
  const [editDocDept, setEditDocDept] = useState('');
  const [editDocSpecialty, setEditDocSpecialty] = useState('');
  const [editDocExp, setEditDocExp] = useState('');
  const [editDocDays, setEditDocDays] = useState([]);
  const [editDocSlots, setEditDocSlots] = useState(8);
  const [editDocActive, setEditDocActive] = useState(true);

  const activeHospital = hospitals.find((h) => h.id === selectedHospitalId);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newDocName || !newDocSpecialty || !newDocExp) return;

    addDoctor(selectedHospitalId, {
      name: newDocName,
      department: newDocDept,
      specialty: newDocSpecialty,
      experience: parseInt(newDocExp, 10),
      weeklyDays: newDocDays,
      slotsPerDay: parseInt(newDocSlots, 10)
    });

    setNewDocName('');
    setNewDocSpecialty('');
    setNewDocExp('');
    setNewDocDays(['Mon', 'Wed', 'Fri']);
    setNewDocSlots(8);
    setShowAddModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editDocName || !editDocSpecialty || !editDocExp) return;

    editDoctor(selectedHospitalId, editingDocId, {
      name: editDocName,
      department: editDocDept,
      specialty: editDocSpecialty,
      experience: parseInt(editDocExp, 10),
      weeklyDays: editDocDays,
      slotsPerDay: parseInt(editDocSlots, 10),
      isActive: editDocActive
    });

    setShowEditModal(false);
    setEditingDocId(null);
  };

  const toggleDaySelection = (day, isEdit = false) => {
    const list = isEdit ? editDocDays : newDocDays;
    const setList = isEdit ? setEditDocDays : setNewDocDays;
    if (list.includes(day)) {
      setList(list.filter((d) => d !== day));
    } else {
      setList([...list, day]);
    }
  };

  const openEditModal = (doc) => {
    setEditingDocId(doc.id);
    setEditDocName(doc.name);
    setEditDocDept(doc.department);
    setEditDocSpecialty(doc.specialty);
    setEditDocExp(doc.experience);
    setEditDocDays(doc.weeklyDays);
    setEditDocSlots(doc.slotsPerDay);
    setEditDocActive(doc.isActive);
    setShowEditModal(true);
  };

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const activeDoctorsCount = hospitals.flatMap((h) => h.doctors).filter((d) => d.isActive).length;
  const totalBookingsCount = appointments.filter((app) => app.status !== 'Canceled').length;

  return (
    <div className="admin-dashboard">
      
      <div className="ios-glass-card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">{t('Active Hospital Location')}</label>
          <select 
            className="form-control form-select"
            value={selectedHospitalId}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
          >
            {hospitals.map((hosp) => (
              <option key={hosp.id} value={hosp.id}>
                {t(hosp.name)} - {t(hosp.city)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="ios-glass-card flex-between" style={{ padding: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{t('Active Doctors')}</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>{activeDoctorsCount}</div>
          </div>
          <Stethoscope size={28} style={{ color: 'var(--primary-color)', opacity: 0.8 }} />
        </div>
        <div className="ios-glass-card flex-between" style={{ padding: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{t('Total Bookings')}</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>{totalBookingsCount}</div>
          </div>
          <Activity size={28} style={{ color: 'var(--success)', opacity: 0.8 }} />
        </div>
      </div>

      {activeHospital && (
        <div>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{t('Hospital Roster')}</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t(activeHospital.address)}</p>
            </div>
            <button 
              className="btn-primary" 
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '12px' }}
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} /> {t('Add Doctor')}
            </button>
          </div>

          {/* Responsive grid for doctor roster cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
            {activeHospital.doctors.map((doc) => (
              <div key={doc.id} className="ios-glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{t(doc.name)}</h4>
                    <span className={`badge ${doc.isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                      {doc.isActive ? t('Active') : t('On Leave')}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--primary-color)', fontWeight: '500', marginTop: '2px' }}>
                    {t(doc.department)} &bull; {t(doc.specialty)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                    <Calendar size={12} /> {doc.weeklyDays.map(d => t(d)).join(', ')} &bull; {doc.slotsPerDay} slots/day
                  </div>
                </div>
                <button 
                  className="btn-secondary"
                  style={{ padding: '8px 12px', borderRadius: '10px', width: '100%' }}
                  onClick={() => openEditModal(doc)}
                >
                  <Edit2 size={14} /> {t('Edit')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>{t('Add Doctor')}</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Doctor Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newDocName} 
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dr. Pankaj Patel"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select 
                  className="form-control form-select"
                  value={newDocDept}
                  onChange={(e) => setNewDocDept(e.target.value)}
                >
                  {activeHospital.departments.map((dept) => (
                    <option key={dept} value={dept}>{t(dept)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Specialty Qualification</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newDocSpecialty} 
                  onChange={(e) => setNewDocSpecialty(e.target.value)}
                  placeholder="e.g. MBBS, MD Medicine"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={newDocExp} 
                    onChange={(e) => setNewDocExp(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Daily Capacity Slots</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={newDocSlots} 
                    onChange={(e) => setNewDocSlots(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '8px' }}>Weekly Working Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {weekdays.map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDaySelection(day, false)}
                      className={`btn-outline ${newDocDays.includes(day) ? 'active' : ''}`}
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        fontSize: '13px',
                        background: newDocDays.includes(day) ? 'var(--primary-color)' : 'transparent',
                        color: newDocDays.includes(day) ? 'var(--text-white)' : 'var(--text-main)',
                        borderColor: newDocDays.includes(day) ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)'
                      }}
                    >
                      {t(day)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {t('Save Doctor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>{t('Edit')}</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Doctor Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editDocName} 
                  onChange={(e) => setEditDocName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select 
                  className="form-control form-select"
                  value={editDocDept}
                  onChange={(e) => setEditDocDept(e.target.value)}
                >
                  {activeHospital.departments.map((dept) => (
                    <option key={dept} value={dept}>{t(dept)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Specialty</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editDocSpecialty} 
                  onChange={(e) => setEditDocSpecialty(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={editDocExp} 
                    onChange={(e) => setEditDocExp(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity Slots</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={editDocSlots} 
                    onChange={(e) => setEditDocSlots(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '8px' }}>Weekly Working Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {weekdays.map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDaySelection(day, true)}
                      className={`btn-outline ${editDocDays.includes(day) ? 'active' : ''}`}
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        fontSize: '13px',
                        background: editDocDays.includes(day) ? 'var(--primary-color)' : 'transparent',
                        color: editDocDays.includes(day) ? 'var(--text-white)' : 'var(--text-main)',
                        borderColor: editDocDays.includes(day) ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)'
                      }}
                    >
                      {t(day)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                <input 
                  type="checkbox" 
                  id="activeCheck" 
                  checked={editDocActive} 
                  onChange={(e) => setEditDocActive(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="activeCheck" style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                  Doctor is available and active on schedule
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {t('Save Doctor')}
                </button>
              </div>
            </form>
          </div>
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
