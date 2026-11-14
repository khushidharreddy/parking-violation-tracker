import React, { useState, useEffect } from 'react';
import {
  CheckCheck,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  FileCheck,
  Clock,
  Download,
  AlertCircle
} from 'lucide-react';
import { runTestSuite } from '../api';

export default function TestingPage() {
  const [suiteReport, setSuiteReport] = useState(null);
  const [running, setRunning] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const executeTestSuite = () => {
    setRunning(true);
    runTestSuite()
      .then((res) => {
        if (res.data?.success) {
          setSuiteReport(res.data.report);
        }
      })
      .catch((err) => {
        console.error('Test suite error:', err);
      })
      .finally(() => setRunning(false));
  };

  useEffect(() => {
    executeTestSuite();
  }, []);

  const filteredResults = suiteReport?.results
    ? suiteReport.results.filter(
        (r) => activeCategory === 'ALL' || r.category.includes(activeCategory)
      )
    : [];

  const handleExportReport = () => {
    if (!suiteReport) return;
    let md = `# PART D – COMPREHENSIVE TEST REPORT\n`;
    md += `**Project:** P14 – Parking Violation Tracker\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n`;
    md += `**Summary:** ${suiteReport.summary.passedTests}/${suiteReport.summary.totalTests} Passed (${suiteReport.summary.passRate}) in ${suiteReport.summary.durationMs}ms\n\n`;
    md += `| Test # | Test Name | Category | Expected | Actual | Status |\n`;
    md += `|---|---|---|---|---|---|\n`;

    suiteReport.results.forEach((r) => {
      md += `| ${r.testId} | ${r.name} | ${r.category} | ${r.expected} | ${r.actual} | ${r.passed ? 'PASS' : 'FAIL'} |\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Test-Report-Part-D-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* HEADER & SUITE SUMMARY */}
      <div className="card" style={{ marginBottom: '24px', background: '#0f172a', color: '#ffffff', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div className="logo-badge" style={{ background: '#10b981' }}>
                <CheckCheck size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
                  Part D: Comprehensive Test Suite Verification
                </h1>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  17 Documented Test Cases Covering Automata, Classification, Routing, Capacity & Persistence
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#cbd5e1', maxWidth: '780px', margin: '8px 0 0' }}>
              Every test executes live assertions against the backend DFA automata validator, regex engines,
              deterministic priority router, handler capacity algorithms, and MongoDB constraints.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleExportReport} disabled={!suiteReport}>
              <Download size={14} />
              <span>Export Report (.md)</span>
            </button>

            <button
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#10b981' }}
              onClick={executeTestSuite}
              disabled={running}
            >
              <RefreshCw size={14} className={running ? 'animate-spin' : ''} />
              <span>{running ? 'Executing Tests...' : 'Run All 17 Tests'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Tiles */}
        {suiteReport && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #334155'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Tests
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{suiteReport.summary.totalTests}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Passed Tests
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4ade80' }}>
                {suiteReport.summary.passedTests}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Failed Tests
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: suiteReport.summary.failedTests > 0 ? '#f87171' : '#cbd5e1' }}>
                {suiteReport.summary.failedTests}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Pass Rate
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4ade80' }}>
                {suiteReport.summary.passRate}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Execution Time
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{suiteReport.summary.durationMs}ms</div>
            </div>
          </div>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="card" style={{ marginBottom: '20px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginRight: '6px' }}>
            Filter Categories:
          </span>
          {['ALL', 'Automata', 'Classification', 'Routing', 'Handler', 'Queue', 'Lifecycle'].map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* DETAILED RESULTS TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th style={{ width: '220px' }}>Test Case Name</th>
                <th style={{ width: '180px' }}>Category</th>
                <th>Expected Assertion</th>
                <th>Actual Result</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {running ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                    <div>Executing 17 automated test cases against live backend...</div>
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No tests found under this category filter.
                  </td>
                </tr>
              ) : (
                filteredResults.map((t) => (
                  <tr key={t.testId}>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 700, color: '#64748b' }}>
                        #{String(t.testId).padStart(2, '0')}
                      </span>
                    </td>
                    <td>
                      <strong>{t.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        {t.details}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-category">{t.category}</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#334155' }}>
                      <code>{t.expected}</code>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: t.passed ? '#15803d' : '#b91c1c' }}>
                      <code>{t.actual}</code>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {t.passed ? (
                        <span className="badge badge-resolved" style={{ fontSize: '0.78rem' }}>
                          <CheckCircle2 size={13} /> PASS
                        </span>
                      ) : (
                        <span className="badge badge-escalated" style={{ fontSize: '0.78rem' }}>
                          <XCircle size={13} /> FAIL
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
