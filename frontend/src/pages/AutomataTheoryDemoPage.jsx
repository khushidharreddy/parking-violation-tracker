import React, { useState } from 'react';
import { Cpu, ArrowRight, CheckCircle2, XCircle, RefreshCw, Play, Layers } from 'lucide-react';
import { validateVehicle, validateViolation } from '../api';

const PRESET_VEHICLES = [
  { plate: 'KA03AB1234', desc: 'Valid 2-letter series plate' },
  { plate: 'KA05C5678', desc: 'Valid 1-letter series plate' },
  { plate: 'KA03A1234', desc: 'Valid 1-letter series plate' },
  { plate: 'K03AB1234', desc: 'Invalid: Only 1 state character' },
  { plate: 'KA3AB1234', desc: 'Invalid: 1 digit in district code' },
  { plate: 'KA03AB123', desc: 'Invalid: 3 digits in serial number' },
  { plate: 'KA01ABC1234', desc: 'Invalid: 3 series alphabets' },
  { plate: 'KA01@1234', desc: 'Invalid: Special character' }
];

const PRESET_CODES = [
  { code: 'PV01', desc: 'Valid 2-digit code' },
  { code: 'PV12', desc: 'Valid 2-digit code' },
  { code: 'PV1', desc: 'Invalid: 1 digit' },
  { code: 'PV123', desc: 'Invalid: 3 digits' },
  { code: 'PV99', desc: 'Valid syntax, uncatalogued code' },
  { code: 'VX01', desc: 'Invalid prefix' }
];

export default function AutomataTheoryDemoPage() {
  const [vehicleInput, setVehicleInput] = useState('KA03AB1234');
  const [violationInput, setViolationInput] = useState('PV13');

  const [vehicleResult, setVehicleResult] = useState(null);
  const [violationResult, setViolationResult] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [loadingViolation, setLoadingViolation] = useState(false);

  const handleTestVehicle = async (plateToTest) => {
    const target = plateToTest || vehicleInput;
    setLoadingVehicle(true);
    try {
      const res = await validateVehicle(target);
      setVehicleResult(res.data);
    } catch (err) {
      setVehicleResult(err.response?.data || { isValid: false, message: 'Test failed' });
    } finally {
      setLoadingVehicle(false);
    }
  };

  const handleTestViolation = async (codeToTest) => {
    const target = codeToTest || violationInput;
    setLoadingViolation(true);
    try {
      const res = await validateViolation(target);
      setViolationResult(res.data);
    } catch (err) {
      setViolationResult(err.response?.data || { isValid: false, message: 'Test failed' });
    } finally {
      setLoadingViolation(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* HEADER CARD */}
      <div className="card" style={{ marginBottom: '24px', background: '#0f172a', color: '#ffffff', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <div className="logo-badge" style={{ width: '48px', height: '48px' }}>
            <Cpu size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
              Part A: Automata Theory & Computability
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '4px 0 0' }}>
              Deterministic Finite Automaton (DFA) Model vs Regular Expression Equivalence
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '900px' }}>
          Formally demonstrates validation of Karnataka vehicle registration numbers and parking violation codes
          through an 11-state transition matrix and equivalent regular grammar. Both methods evaluate in parallel to ensure
          100% mathematical consensus.
        </p>
      </div>

      {/* SECTION 1: VEHICLE REGISTRATION DFA */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title" style={{ fontSize: '1.15rem' }}>
              1. Vehicle Registration Plate DFA Engine
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Format: <code>[A-Z]&#123;2&#125;[0-9]&#123;2&#125;[A-Z]&#123;1,2&#125;[0-9]&#123;4&#125;</code>
            </span>
          </div>
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <input
            type="text"
            className="form-input font-mono"
            style={{ width: '220px', textTransform: 'uppercase', fontWeight: 700, fontSize: '1rem' }}
            placeholder="e.g. KA03AB1234"
            value={vehicleInput}
            onChange={(e) => setVehicleInput(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => handleTestVehicle()} disabled={loadingVehicle}>
            <Play size={16} />
            <span>Execute DFA Trace</span>
          </button>
        </div>

        {/* Presets */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Quick Test Cases:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            {PRESET_VEHICLES.map((p) => (
              <button
                key={p.plate}
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setVehicleInput(p.plate);
                  handleTestVehicle(p.plate);
                }}
              >
                <span className="font-mono">{p.plate}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({p.desc})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trace Output */}
        {vehicleResult && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px'
            }}
          >
            {/* Decision Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                background: vehicleResult.isValid ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${vehicleResult.isValid ? '#a7f3d0' : '#fecaca'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {vehicleResult.isValid ? (
                  <CheckCircle2 size={24} color="#16a34a" />
                ) : (
                  <XCircle size={24} color="#dc2626" />
                )}
                <div>
                  <strong style={{ color: vehicleResult.isValid ? '#166534' : '#991b1b' }}>
                    {vehicleResult.isValid ? 'ACCEPTED (VALID FORMAT)' : 'REJECTED (INVALID FORMAT)'}
                  </strong>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                    {vehicleResult.dfa?.explanation}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${vehicleResult.agreement ? 'badge-resolved' : 'badge-escalated'}`}>
                  {vehicleResult.agreement ? 'DFA & Regex Agreement: 100%' : 'Agreement Failed'}
                </span>
              </div>
            </div>

            {/* Stepper Visualization */}
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              STEP-BY-STEP AUTOMATON TRANSITIONS:
            </div>

            <div className="dfa-stepper">
              {vehicleResult.dfa?.trace?.map((t) => {
                const isAccept = t.toState === 'q10';
                const isDead = t.toState === 'q_dead';
                return (
                  <div
                    key={t.step}
                    className={`dfa-step-chip ${isAccept ? 'accept' : isDead ? 'dead' : 'active'}`}
                  >
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Step {t.step}</span>
                    <strong style={{ fontSize: '0.95rem', margin: '2px 0' }}>'{t.char}'</strong>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'monospace' }}>
                      {t.fromState}→{t.toState}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: VIOLATION CODE DFA */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title" style={{ fontSize: '1.15rem' }}>
              2. Violation Code DFA Engine
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Format: <code>PV[0-9]&#123;2&#125;</code> (PV followed by exactly 2 digits)
            </span>
          </div>
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <input
            type="text"
            className="form-input font-mono"
            style={{ width: '180px', textTransform: 'uppercase', fontWeight: 700, fontSize: '1rem' }}
            placeholder="e.g. PV01"
            value={violationInput}
            onChange={(e) => setViolationInput(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => handleTestViolation()} disabled={loadingViolation}>
            <Play size={16} />
            <span>Validate Code</span>
          </button>
        </div>

        {/* Presets */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Quick Test Cases:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            {PRESET_CODES.map((p) => (
              <button
                key={p.code}
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setViolationInput(p.code);
                  handleTestViolation(p.code);
                }}
              >
                <span className="font-mono">{p.code}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({p.desc})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        {violationResult && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                background: violationResult.isValid ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${violationResult.isValid ? '#a7f3d0' : '#fecaca'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {violationResult.isValid ? (
                  <CheckCircle2 size={24} color="#16a34a" />
                ) : (
                  <XCircle size={24} color="#dc2626" />
                )}
                <div>
                  <strong style={{ color: violationResult.isValid ? '#166534' : '#991b1b' }}>
                    {violationResult.isValid ? 'VALID VIOLATION CODE' : 'INVALID CODE SYNTAX'}
                  </strong>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                    {violationResult.dfa?.explanation}
                  </div>
                </div>
              </div>

              <div>
                <span className={`badge ${violationResult.agreement ? 'badge-resolved' : 'badge-escalated'}`}>
                  {violationResult.agreement ? 'DFA & Regex 100% Agreement' : 'Agreement Mismatch'}
                </span>
              </div>
            </div>

            {violationResult.classification && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '0.85rem'
                }}
              >
                <div>
                  <strong>Category: </strong> {violationResult.classification.category}
                </div>
                <div>
                  <strong>Official Title: </strong> {violationResult.classification.title || 'Unclassified'}
                </div>
                <div>
                  <strong>Severity & Fine: </strong> {violationResult.classification.severity} (₹{violationResult.classification.fineAmount || 0})
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
