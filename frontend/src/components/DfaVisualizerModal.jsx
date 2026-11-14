import React from 'react';
import { X, CheckCircle, XCircle, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export default function DfaVisualizerModal({ isOpen, onClose, validationData, title = 'DFA Transition Trace' }) {
  if (!isOpen || !validationData) return null;

  const { dfa, regex, agreement, normalized, input } = validationData;
  const isAccepted = dfa?.isAccepted;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={22} color="#2563eb" />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{title}</h2>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Input: "{input || normalized}"</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Summary Status Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: '10px',
              marginBottom: '20px',
              background: isAccepted ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${isAccepted ? '#a7f3d0' : '#fecaca'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isAccepted ? <CheckCircle size={28} color="#16a34a" /> : <XCircle size={28} color="#dc2626" />}
              <div>
                <h4 style={{ margin: 0, color: isAccepted ? '#166534' : '#991b1b', fontWeight: 700 }}>
                  {isAccepted ? 'AUTOMATA ACCEPTED (VALID)' : 'AUTOMATA REJECTED (INVALID)'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: isAccepted ? '#15803d' : '#b91c1c' }}>
                  {dfa?.explanation}
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>
                DFA & Regex Agreement
              </span>
              <div style={{ fontWeight: 700, color: agreement ? '#16a34a' : '#dc2626' }}>
                {agreement ? '100% Agreement' : 'Mismatch!'}
              </div>
            </div>
          </div>

          {/* Regex Comparison Block */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              REGULAR EXPRESSION COMPARISON (PART A)
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <code>{regex?.pattern || '^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$'}</code>
              <span className={`badge ${regex?.isValid ? 'badge-resolved' : 'badge-escalated'}`}>
                {regex?.isValid ? 'Regex Match' : 'Regex Non-Match'}
              </span>
            </div>
          </div>

          {/* State Transition Table / Stepper */}
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>
            State Transition Trace: δ(q, σ) → q'
          </h4>

          <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table className="custom-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Step</th>
                  <th style={{ width: '80px' }}>Char</th>
                  <th>Transition Function δ</th>
                  <th style={{ width: '120px' }}>Resulting State</th>
                </tr>
              </thead>
              <tbody>
                {dfa?.trace?.map((step, idx) => {
                  const isDead = step.toState === 'q_dead' || step.toState === 's_dead';
                  const isAccept = step.toState === 'q10' || step.toState === 's4';
                  return (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: isAccept ? '#f0fdf4' : isDead ? '#fef2f2' : 'transparent'
                      }}
                    >
                      <td>#{step.step}</td>
                      <td>
                        <strong
                          style={{
                            background: '#f1f5f9',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontFamily: 'monospace'
                          }}
                        >
                          '{step.char}'
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace' }}>
                          δ({step.fromState}, '{step.char}') <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {step.toState}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isAccept ? 'badge-resolved' : isDead ? 'badge-escalated' : 'badge-category'
                          }`}
                        >
                          {step.toState} {isAccept ? '(Accept)' : isDead ? '(Dead)' : ''}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close Trace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
