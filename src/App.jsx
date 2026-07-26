import React, { useState, useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AgentDashboard from './components/AgentDashboard';
import SuperadminDashboard from './components/SuperadminDashboard';
import { 
  Shield, Stethoscope, UserCheck, Signal, 
  LogIn, UserPlus, LogOut, Globe, ShieldAlert, Sun, Moon 
} from 'lucide-react';

function DashboardContainer() {
  const { 
    currentUser, 
    language, 
    setLanguage, 
    theme,
    toggleTheme,
    loginUser, 
    registerAgent, 
    logoutUser, 
    t 
  } = useContext(AppContext);

  const [showRegisterView, setShowRegisterView] = useState(false);

  // Login Form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Agent Register Form states
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regVillage, setRegVillage] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');
  const [regErrorMessage, setRegErrorMessage] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    loginUser(loginUsername, loginPassword).then((res) => {
      if (!res.success) {
        setLoginError(res.message);
      }
    });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegSuccessMessage('');
    setRegErrorMessage('');
    
    registerAgent(regName, regPhone, regVillage, regPassword).then((res) => {
      if (res.success) {
        setRegSuccessMessage(res.message);
        setRegName('');
        setRegPhone('');
        setRegVillage('');
        setRegPassword('');
      } else {
        setRegErrorMessage(res.message);
      }
    });
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'gu' : 'en');
  };

  return (
    <div className={`mobile-container`}>
      
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
            <h1 style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px' }}>
              {t('Dear Doctor')}
            </h1>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {t('North Gujarat Network')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              background: 'var(--primary-light)',
              border: '1px solid var(--border-color)',
              color: 'var(--primary-color)',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          {/* Language Toggle */}
          <button 
            type="button" 
            onClick={toggleLanguage}
            style={{
              background: 'var(--primary-light)',
              border: '1px solid var(--border-color)',
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--primary-color)',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Globe size={12} />
            {language === 'en' ? 'ગુજરાતી' : 'English'}
          </button>
          {/* Language Toggle */}
        </div>
      </header>

      {/* Main Content Render area */}
      <main className="main-content">
        {!currentUser ? (
          /* Login & Registration Portal */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px', maxWidth: '440px', margin: '0 auto', width: '100%' }}>
            
            <div className="text-center" style={{ padding: '20px 0 10px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: 'var(--primary-light)', 
                color: 'var(--primary-color)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <Stethoscope size={36} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>{t('Dear Doctor')}</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Healthcare booking network for North Gujarat villages</p>
            </div>

            {showRegisterView ? (
              <div className="ios-glass-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserPlus size={18} style={{ color: 'var(--primary-color)' }} />
                  Agent Registration
                </h3>

                {regSuccessMessage && (
                  <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '12px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
                    {regSuccessMessage}
                  </div>
                )}

                {regErrorMessage && (
                  <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
                    {regErrorMessage}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={regName} 
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Karan Patel"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned Village</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={regVillage} 
                      onChange={(e) => setRegVillage(e.target.value)}
                      placeholder="e.g. Visnagar Rural"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      value={regPhone} 
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={regPassword} 
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Set login password"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                    Submit Registration Request
                  </button>

                  <div className="text-center" style={{ marginTop: '16px' }}>
                    <button 
                      type="button" 
                      className="btn-outline" 
                      style={{ fontSize: '12px', border: 'none' }}
                      onClick={() => setShowRegisterView(false)}
                    >
                      Already registered? Login here
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="ios-glass-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogIn size={18} style={{ color: 'var(--primary-color)' }} />
                  Secure Login
                </h3>

                {loginError && (
                  <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '14px' }}>
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label className="form-label">Username / Code / Phone</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={loginUsername} 
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Agent Code or Admin Username"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                    Login to Dashboard
                  </button>

                  <div className="text-center" style={{ marginTop: '16px' }}>
                    <button 
                      type="button" 
                      className="btn-outline" 
                      style={{ fontSize: '12px', border: 'none' }}
                      onClick={() => setShowRegisterView(true)}
                    >
                      Apply as New Village Agent
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="alert-info-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '12px', marginBottom: '6px' }}>
                <ShieldAlert size={14} style={{ color: 'var(--primary-color)' }} />
                Demo Credentials Helper
              </div>
              <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>&bull; <strong>Superadmin:</strong> <code>superadmin</code> / <code>superadmin</code></div>
                <div>&bull; <strong>Hospital Admin:</strong> <code>admin</code> / <code>admin</code></div>
                <div>&bull; <strong>Doctor Cabin:</strong> <code>doctor</code> / <code>doctor</code></div>
                <div>&bull; <strong>Approved Agent:</strong> <code>AGT-799</code> / <code>agent</code></div>
                <div>&bull; <strong>Pending Agent:</strong> <code>AGT-802</code> / <code>agent</code> (locks access)</div>
              </div>
            </div>

          </div>
        ) : (
          /* Render Active Role Dashboard */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: 'var(--panel-bg-solid)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ 
                background: 'var(--primary-light)', 
                color: 'var(--primary-color)', 
                padding: '4px', 
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {currentUser.role}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Session: <strong style={{ color: 'var(--text-main)' }}>{t(currentUser.name)}</strong>
              </div>
            </div>

            {currentUser.role === 'agent' && <AgentDashboard />}
            {currentUser.role === 'doctor' && <DoctorDashboard />}
            {currentUser.role === 'admin' && <AdminDashboard />}
            {currentUser.role === 'superadmin' && <SuperadminDashboard />}
          </>
        )}
      </main>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContext.Consumer>
        {({ theme }) => (
          <div className={`desktop-wrapper ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <DashboardContainer />
          </div>
        )}
      </AppContext.Consumer>
    </AppProvider>
  );
}
