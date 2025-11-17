import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import Settings from './pages/Settings';
import AdminProfile from './pages/AdminProfile';
import Reports from './pages/Reports';
import Login from './Login';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
        <div className="brand__icon" aria-hidden style={{width:36,height:36,borderRadius:'9999px',background:'#111827',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 11V7a4 4 0 00-8 0v4"/><path d="M5 20h14a1 1 0 001-1v-6a4 4 0 00-4-4H8a4 4 0 00-4 4v6a1 1 0 001 1z"/></svg>
        </div>
        <div className="brand__text" style={{textAlign:'center'}}>
          <div className="brand__title">Student & Faculty Profile</div>
          <div className="brand__subtitle">System</div>
        </div>
      </div>
      <nav className="sidebar__nav">
        <ul>
          <li><Link to="/" className="nav__link">Dashboard</Link></li>
          <li><Link to="/students" className="nav__link">Students</Link></li>
          <li><Link to="/faculty" className="nav__link">Faculty</Link></li>
          <li><Link to="/reports" className="nav__link">Reports</Link></li>
          <li><Link to="/settings" className="nav__link">Settings</Link></li>
          <li><Link to="/admin" className="nav__link">Admin Profile</Link></li>
        </ul>
      </nav>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>Dashboard Overview</span>
      </div>
      <form method="POST" action="/logout">
        <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
        <button type="submit" className="logout-btn">Logout</button>
      </form>
    </header>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <div className="layout">
        <Sidebar />
        <div className="main">
          <Topbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/faculty" element={<Faculty />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminProfile />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}
