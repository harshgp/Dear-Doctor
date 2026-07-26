import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AgentDashboard from './components/AgentDashboard';
import { Shield, Stethoscope, UserCheck, Signal, SignalHigh } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState('agent'); // 'admin', 'doctor', 'agent'
  const [lowBandwidth, setLowBandwidth] = useState(false);

  return (
    <AppProvider>
      <div className={`mobile-container ${lowBandwidth ? 'low-bandwidth' : ''}`}>
        
        {/* Header Bar */}
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              background: 'var(--primary-color)', 
              color: '#ffffff', 
              padding: '6px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stethoscope size={18} />
            </div>
            <div>
              <h1 style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px' }}>Dear Doctor</h1>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>North Gujarat Network</div>
            </div>
          </div>

          {/* Low Bandwidth Toggle Button */}
          <button 
            type="button" 
            onClick={() => setRole(role === 'agent' ? 'doctor' : role === 'doctor' ? 'admin' : 'agent')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--primary-color)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Switch Role
          </button>
        </header>

        {/* Role Tab Switcher Simulation */}
        <div className="role-tab-bar">
          <div 
            className={`role-tab ${role === 'agent' ? 'active' : ''}`}
            onClick={() => setRole('agent')}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <UserCheck size={14} /> Agent
            </span>
          </div>
          <div 
            className={`role-tab ${role === 'doctor' ? 'active' : ''}`}
            onClick={() => setRole('doctor')}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Stethoscope size={14} /> Doctor
            </span>
          </div>
          <div 
            className={`role-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Shield size={14} /> Admin
            </span>
          </div>
        </div>

        {/* Low-Bandwidth Mode Selector Alert */}
        <div style={{ padding: '0 20px', marginBottom: '8px' }}>
          <div 
            onClick={() => setLowBandwidth(!lowBandwidth)}
            style={{ 
              background: lowBandwidth ? '#f1f5f9' : '#e0eafc',
              border: '1px solid rgba(0, 102, 204, 0.08)',
              padding: '8px 12px', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
              {lowBandwidth ? <Signal size={14} /> : <SignalHigh size={14} style={{ color: 'var(--primary-color)' }} />}
              <span>{lowBandwidth ? 'Low-Bandwidth Mode: Active' : 'Speed Optimizer: On 4G/5G'}</span>
            </div>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary-color)' }}>
              {lowBandwidth ? 'Disable' : 'Enable 2G/3G'}
            </span>
          </div>
        </div>

        {/* Main Dashboard Render Container */}
        <main className="main-content">
          {role === 'agent' && <AgentDashboard />}
          {role === 'doctor' && <DoctorDashboard />}
          {role === 'admin' && <AdminDashboard />}
        </main>

      </div>
    </AppProvider>
  );
}
