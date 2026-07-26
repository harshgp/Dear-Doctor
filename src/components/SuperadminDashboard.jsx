import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { UserCheck, Check, X, Shield, Wallet, Users, Calendar, Activity, TrendingUp, LogOut } from 'lucide-react';

export default function SuperadminDashboard() {
  const { allAgents, appointments, approveAgent, rejectAgent, logoutUser, t } = useContext(AppContext);

  const pendingAgents = allAgents.filter((a) => a.status === 'pending');
  const approvedAgents = allAgents.filter((a) => a.status === 'approved');

  const totalBookings = appointments.filter((app) => app.status !== 'Canceled').length;
  
  const totalTokenRevenue = appointments
    .filter((app) => app.status !== 'Canceled' && app.caseType === 'New Case')
    .length * 151;

  const totalAgentWallets = approvedAgents.reduce((sum, a) => sum + (parseFloat(a.wallet_balance) || 0), 0);

  const chartPoints = "10,90 60,75 110,60 160,50 210,20";

  return (
    <div className="superadmin-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Metrics Row (Uses responsive metrics columns) */}
      <div className="responsive-metrics">
        <div className="ios-glass-card flex-between" style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{t('Network Agents')}</div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px', color: 'var(--text-main)' }}>{approvedAgents.length}</div>
          </div>
          <Users size={24} style={{ color: 'var(--primary-color)' }} />
        </div>
        <div className="ios-glass-card flex-between" style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{t('Active Bookings')}</div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px', color: 'var(--text-main)' }}>{totalBookings}</div>
          </div>
          <Calendar size={24} style={{ color: 'var(--success)' }} />
        </div>
        <div className="ios-glass-card flex-between" style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{t('Token Fees')}</div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px', color: 'var(--text-main)' }}>₹{totalTokenRevenue}</div>
          </div>
          <TrendingUp size={24} style={{ color: 'var(--primary-color)' }} />
        </div>
        <div className="ios-glass-card flex-between" style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{t('Wallet Balance')}</div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px', color: 'var(--text-main)' }}>₹{totalAgentWallets}</div>
          </div>
          <Wallet size={24} style={{ color: 'var(--warning)' }} />
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="responsive-grid">
        
        {/* Left Column: Analytics Chart & Active Agents List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Trend Graph Card */}
          <div className="ios-glass-card">
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} style={{ color: 'var(--primary-color)' }} />
              {t('Network Bookings Trend (5 Days)')}
            </h3>
            
            <div style={{ width: '100%', height: '120px', padding: '10px 0' }}>
              <svg viewBox="0 0 240 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <line x1="0" y1="20" x2="240" y2="20" stroke="var(--border-color)" strokeWidth="1" />
                <line x1="0" y1="50" x2="240" y2="50" stroke="var(--border-color)" strokeWidth="1" />
                <line x1="0" y1="80" x2="240" y2="80" stroke="var(--border-color)" strokeWidth="1" />
                
                <polyline
                  fill="none"
                  stroke="var(--primary-color)"
                  strokeWidth="3"
                  points={chartPoints}
                  className="chart-line"
                />
                
                <circle cx="10" cy="90" r="4" fill="var(--primary-color)" />
                <circle cx="60" cy="75" r="4" fill="var(--primary-color)" />
                <circle cx="110" cy="60" r="4" fill="var(--primary-color)" />
                <circle cx="160" cy="50" r="4" fill="var(--primary-color)" />
                <circle cx="210" cy="20" r="4" fill="var(--primary-color)" />

                <text x="10" y="98" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 1</text>
                <text x="60" y="98" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 2</text>
                <text x="110" y="98" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 3</text>
                <text x="160" y="98" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 4</text>
                <text x="210" y="98" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Today</text>
              </svg>
            </div>
          </div>

          {/* Approved Agents ledger roster */}
          <div className="ios-glass-card">
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={18} style={{ color: 'var(--primary-color)' }} />
              {t('Approved Village Agents')} ({approvedAgents.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {approvedAgents.map((agent) => (
                <div key={agent.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{t(agent.name)}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Village: {t(agent.village)} &bull; Code: {agent.code}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-color)' }}>
                      ₹{agent.wallet_balance}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{t('Wallet Balance')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Pending Registrations Ledger */}
        <div>
          <div className="ios-glass-card">
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={18} style={{ color: 'var(--primary-color)' }} />
              {t('Pending Approvals')} ({pendingAgents.length})
            </h3>

            {pendingAgents.length === 0 ? (
              <div className="text-center" style={{ padding: '30px 10px', color: 'var(--text-muted)' }}>
                <Check size={32} style={{ color: 'var(--success)', marginBottom: '8px', opacity: 0.6 }} />
                <p style={{ fontSize: '13px' }}>No pending agent registration requests.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingAgents.map((agent) => (
                  <div key={agent.id} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--panel-bg-solid)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="flex-between">
                      <div>
                        <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{t(agent.name)}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Village: {t(agent.village)} &bull; Code: {agent.code}
                        </div>
                      </div>
                      <span className="badge badge-warning" style={{ fontSize: '9px' }}>Pending</span>
                    </div>
                    <div className="flex-between">
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Phone: {agent.phone}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-danger" 
                          style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}
                          onClick={() => rejectAgent(agent.id)}
                        >
                          <X size={12} /> Reject
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', background: 'var(--success)' }}
                          onClick={() => approveAgent(agent.id)}
                        >
                          <Check size={12} /> Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

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
