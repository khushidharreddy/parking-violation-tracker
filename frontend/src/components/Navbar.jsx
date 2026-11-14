import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Bell, Activity, Database } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const getPageTitle = (path) => {
    switch (path) {
      case '/':
        return 'Enforcement Overview & Portal';
      case '/dashboard':
        return 'Violation Reports Dashboard';
      case '/submit':
        return 'Submit Vehicle Violation Report';
      case '/handlers':
        return 'Enforcement Handler Dispatch Console';
      case '/routing':
        return 'Routing Matrix & Zone Management';
      case '/analytics':
        return 'Violation Analytics & Predictive Trends';
      case '/automata':
        return 'Part A: Automata Theory & DFA Engine';
      case '/testing':
        return 'Part D: Comprehensive Test Suite Verification';
      default:
        return 'Parking Violation Tracker';
    }
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <h1 className="page-title">{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="navbar-right">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f1f5f9',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#334155'
          }}
        >
          <Database size={14} color="#16a34a" />
          <span>MongoDB Live</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ecfdf5',
            color: '#065f46',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          <Activity size={14} />
          <span>Enforcement Online</span>
        </div>

        <Link to="/submit" className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>New Report</span>
        </Link>
      </div>
    </header>
  );
}
