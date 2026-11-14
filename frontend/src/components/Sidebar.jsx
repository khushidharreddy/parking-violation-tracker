import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus2,
  Users2,
  Route,
  BarChart3,
  Cpu,
  CheckCheck,
  Home,
  Shield,
  Radio
} from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">
          <Shield size={24} />
        </div>
        <div>
          <div className="brand-title">PV Tracker</div>
          <div className="brand-subtitle">Automata & Routing</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-category">Main Overview</div>
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <Home size={18} />
          <span>Home / Landing</span>
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <LayoutDashboard size={18} />
          <span>User Dashboard</span>
        </NavLink>

        <div className="nav-category">Operations</div>
        <NavLink to="/submit" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <FilePlus2 size={18} />
          <span>Submit Report</span>
        </NavLink>
        <NavLink to="/handlers" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <Users2 size={18} />
          <span>Handler Dashboard</span>
        </NavLink>
        <NavLink to="/routing" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <Route size={18} />
          <span>Routing & Dispatch</span>
        </NavLink>

        <div className="nav-category">Intelligence & Analysis</div>
        <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <BarChart3 size={18} />
          <span>Analytics & Charts</span>
        </NavLink>
        <NavLink to="/automata" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <Cpu size={18} />
          <span>Automata Sandbox</span>
        </NavLink>
        <NavLink to="/testing" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <CheckCheck size={18} />
          <span>17 Test Cases (Part D)</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={14} color="#10b981" />
          <span>6 Zones Connected</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#475569' }}>v1.0 MERN</span>
      </div>
    </aside>
  );
}
