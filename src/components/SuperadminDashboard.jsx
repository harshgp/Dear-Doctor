import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { UserCheck, Check, X, Shield, Wallet, Users, Calendar, Activity, TrendingUp } from 'lucide-react';

export default function SuperadminDashboard() {
  const { allAgents, appointments, approveAgent, rejectAgent } = useContext(AppContext);

  // Group agents by status
  const pendingAgents = allAgents.filter((a) => a.status === 'pending');
  const approvedAgents = allAgents.filter((a) => a.status === 'approved');

  // Metrics
  const totalBookings = appointments.filter((app) => app.status !== 'Canceled').length;
  const completedBookings = appointments.filter((app) => app.status === 'Completed').length;
  
  // Total fees collected from active bookings (₹151 for each New Case)
  const totalTokenRevenue = appointments
    .filter((app) => app.status !== 'Canceled' && app.caseType === 'New Case')
    .length * 151;

  // Total funds in agent wallets
  const totalAgentWallets = approvedAgents.reduce((sum, a) => sum + (parseFloat(a.wallet_balance) || 0), 0);

  // SVG Chart Mock points for Bookings per Day (simulating last 5 days)
  // Let's assume daily bookings: Day 1: 5, Day 2: 8, Day 3: 12, Day 4: 15, Day 5: 22
  const chartPoints = "10,90 60,75 110,60 160,50 210,20";

  return (
    <div className="superadmin-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="ios-glass-card flex-between" style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Network Agents</div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{approvedAgents.length}</div>
          </div>
          <Users size={24} style={{ color: 'var(--primary-color)' }} />
        </div>
        <div className="ios-glass-card flex-between" style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Active Bookings</div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{totalBookings}</div>
          </div>
          <Calendar size={24} style={{ color: 'var(--success)' }} />
        </div>
        <div className="ios-glass-card flex-between" style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Tokens Revenue</div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>₹{totalTokenRevenue}</div>
          </div>
          <TrendingUp size={24} style={{ color: 'var(--primary-color)' }} />
        </div>
        <div className="ios-glass-card flex-between" style={{ padding: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Agent Wallets</div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>₹{totalAgentWallets}</div>
          </div>
          <Wallet size={24} style={{ color: 'var(--warning)' }} />
        </div>
      </div>

      {/* SVG Analytics Graph Panel */}
      <div className="ios-glass-card">
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={16} style={{ color: 'var(--primary-color)' }} />
          Network Bookings Trend (5 Days)
        </h3>
        
        <div style={{ width: '100%', height: '120px', padding: '10px 0' }}>
          <svg viewBox="0 0 240 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Grid lines */}
            <line x1="0" y1="20" x2="240" y2="20" stroke="#eef2f6" strokeWidth="1" />
            <line x1="0" y1="50" x2="240" y2="50" stroke="#eef2f6" strokeWidth="1" />
            <line x1="0" y1="80" x2="240" y2="80" stroke="#eef2f6" strokeWidth="1" />
            
            {/* Path */}
            <polyline
              fill="none"
              stroke="var(--primary-color)"
              strokeWidth="3"
              points={chartPoints}
              className="chart-line"
            />
            
            {/* Dots */}
            <circle cx="10" cy="90" r="4" fill="var(--primary-color)" />
            <circle cx="60" cy="75" r="4" fill="var(--primary-color)" />
            <circle cx="110" cy="60" r="4" fill="var(--primary-color)" />
            <circle cx="160" cy="50" r="4" fill="var(--primary-color)" />
            <circle cx="210" cy="20" r="4" fill="var(--primary-color)" />

            {/* Labels */}
            <text x="10" y="98" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 1</text>
            <text x="60" y="98" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 2</text>
            <text x="110" y="98" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 3</text>
            <text x="160" y="98" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 4</text>
            <text x="210" y="98" fontSize="8" fill="var(--text-muted)" textAnchor="middle">Today</text>
          </svg>
        </div>
      </div>

      {/* Pending Agent Registrations Approvals List */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={18} style={{ color: 'var(--primary-color)' }} />
          Pending Approvals ({pendingAgents.length})
        </h3>

        {pendingAgents.length === 0 ? (
          <div className="ios-glass-card text-center" style={{ padding: '30px 10px', color: 'var(--text-muted)' }}>
            <Check size={32} style={{ color: 'var(--success)', marginBottom: '8px', opacity: 0.6 }} />
            <p style={{ fontSize: '13px' }}>No pending agent registration requests.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingAgents.map((agent) => (
              <div key={agent.id} className="ios-glass-card" style={{ padding: '14px' }}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{agent.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Village: {agent.village} &bull; Code: {agent.code}
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

      {/* Active Agents Ledger Roster */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={18} style={{ color: 'var(--primary-color)' }} />
          Approved Village Agents ({approvedAgents.length})
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {approvedAgents.map((agent) => (
            <div key={agent.id} className="ios-glass-card" style={{ padding: '12px 16px' }}>
              <div className="flex-between">
                <div>
                  <strong style={{ fontSize: '14px' }}>{agent.name}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Village: {agent.village} &bull; Code: {agent.code}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-color)' }}>
                    ₹{agent.wallet_balance}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Wallet Credit</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
