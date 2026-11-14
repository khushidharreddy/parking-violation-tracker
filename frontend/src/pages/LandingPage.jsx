import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Users,
  Route,
  ArrowRight,
  Cpu,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Layers,
  Activity
} from 'lucide-react';
import { getSummaryAnalytics } from '../api';

export default function LandingPage() {
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    totalEnforcementZones: 6,
    resolutionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSummaryAnalytics()
      .then((res) => {
        if (res.data?.success) {
          setStats(res.data.data);
        }
      })
      .catch((err) => console.error('Error fetching landing stats:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* HERO SECTION */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '48px 40px',
          borderRadius: '20px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.25)'
        }}
      >
        <div style={{ maxWidth: '720px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(37, 99, 235, 0.25)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#93c5fd',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}
          >
            <Zap size={14} color="#60a5fa" />
            <span>MERN Stack Intelligent Parking Violation Tracker (P14)</span>
          </div>

          <h1
            style={{
              fontSize: '2.6rem',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '16px',
              letterSpacing: '-0.02em'
            }}
          >
            Automated Parking Violation Detection, DFA Validation & Routing
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              marginBottom: '28px'
            }}
          >
            A full-stack municipal enforcement platform combining Automata Theory (DFA vs Regex validation for Karnataka
            vehicle registrations), 5-category deterministic classification, 6-zone depot routing, and real-time handler capacity tracking.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
              <span>Submit Violation Report</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/dashboard"
              className="btn"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '12px 24px',
                fontSize: '0.95rem'
              }}
            >
              <span>Explore Dashboard</span>
            </Link>
            <Link
              to="/testing"
              className="btn"
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                padding: '12px 20px',
                fontSize: '0.95rem'
              }}
            >
              <CheckCircle2 size={18} />
              <span>Verify 17 Test Cases</span>
            </Link>
          </div>
        </div>

        {/* Decorative Grid Accent */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            bottom: '-40px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, rgba(15,23,42,0) 70%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* STATISTICS CARDS */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div>
            <div className="stat-label">Total Reports Logged</div>
            <div className="stat-value">{loading ? '...' : stats.totalReports}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Across all 6 zones</div>
          </div>
          <div className="stat-icon blue">
            <FileText size={24} />
          </div>
        </div>

        <div className="stat-card resolved">
          <div>
            <div className="stat-label">Resolved Reports</div>
            <div className="stat-value">{loading ? '...' : stats.resolvedReports}</div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px' }}>
              {stats.resolutionRate}% resolution rate
            </div>
          </div>
          <div className="stat-icon green">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card pending">
          <div>
            <div className="stat-label">Active / Pending</div>
            <div className="stat-value">{loading ? '...' : stats.pendingReports}</div>
            <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '4px' }}>Assigned & in-progress</div>
          </div>
          <div className="stat-icon orange">
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card assigned">
          <div>
            <div className="stat-label">Enforcement Zones</div>
            <div className="stat-value">6</div>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', marginTop: '4px' }}>KA01 through KA06 keys</div>
          </div>
          <div className="stat-icon blue">
            <Route size={24} />
          </div>
        </div>
      </div>

      {/* THREE PILLAR ARCHITECTURAL HIGHLIGHTS */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', color: '#0f172a' }}>
        System Architecture & Scientific Implementation
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Pillar 1: Part A Automata */}
        <div className="card">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <Cpu size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
            Part A: Automata Theory (DFA & Regex)
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
            Implements 11-state Deterministic Finite Automaton (q0 to q10, q_dead) enforcing Karnataka plate standard{' '}
            <code>[A-Z]&#123;2&#125;[0-9]&#123;2&#125;[A-Z]&#123;1,2&#125;[0-9]&#123;4&#125;</code> and 5-state DFA for violation codes{' '}
            <code>PV[0-9]&#123;2&#125;</code> with 100% mathematical agreement against regular expressions.
          </p>
          <Link to="/automata" className="btn btn-secondary btn-sm">
            <span>Explore DFA Transitions</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Pillar 2: 5-Category Classification */}
        <div className="card">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <Layers size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
            5-Category Classification Engine
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
            Deterministic mapping into <strong>No-Permit</strong>, <strong>Overstay</strong>, <strong>Wrong-Zone</strong>,{' '}
            <strong>Obstruction</strong>, and <strong>Disabled-Bay</strong>. Strict rejection of unknown identifiers and deterministic
            priority resolution (Disabled-Bay & Obstruction rank over commercial overstay).
          </p>
          <Link to="/dashboard" className="btn btn-secondary btn-sm">
            <span>View Category Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Pillar 3: Part B Routing & Networks */}
        <div className="card">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <Route size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
            Part B: Computer Networks & Routing
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
            Automated packet-like dispatch based on the 4-character vehicle routing key (KA01 to KA06). Dynamic capacity checking,
            automatic backup handler reassignment on saturation, priority queue ordering, and escalation to Central Fallback Authority.
          </p>
          <Link to="/routing" className="btn btn-secondary btn-sm">
            <span>Inspect Routing Matrix</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
