import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Route,
  ShieldAlert,
  Send,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { validateVehicle, validateViolation, createReport } from '../api';
import DfaVisualizerModal from '../components/DfaVisualizerModal';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';

const VIOLATION_PRESETS = [
  { code: 'PV01', label: 'PV01 - Parked without permit or ticket (No-Permit)' },
  { code: 'PV02', label: 'PV02 - Unauthorized commercial bay parking (No-Permit)' },
  { code: 'PV03', label: 'PV03 - Forged or expired permit decal (No-Permit)' },
  { code: 'PV04', label: 'PV04 - Meter expired under 2 hours (Overstay)' },
  { code: 'PV05', label: 'PV05 - Extended overstay > 2 hours (Overstay)' },
  { code: 'PV06', label: 'PV06 - Overnight prohibited parking (Overstay)' },
  { code: 'PV07', label: 'PV07 - Residential vehicle in commercial bay (Wrong-Zone)' },
  { code: 'PV08', label: 'PV08 - Heavy commercial in residential zone (Wrong-Zone)' },
  { code: 'PV09', label: 'PV09 - Consular / Diplomatic bay infringement (Wrong-Zone)' },
  { code: 'PV10', label: 'PV10 - Blocking emergency fire lane / hydrant (Obstruction)' },
  { code: 'PV11', label: 'PV11 - Double parking blocking active driveway (Obstruction)' },
  { code: 'PV12', label: 'PV12 - Blocking pedestrian crosswalk or cycle bay (Obstruction)' },
  { code: 'PV13', label: 'PV13 - Parking in handicap bay without disability badge (Disabled-Bay)' },
  { code: 'PV14', label: 'PV14 - Obstructing wheelchair ramp or tactile paving (Disabled-Bay)' },
  { code: 'PV15', label: 'PV15 - Fraudulent use of disabled badge (Disabled-Bay)' }
];

export default function ReportSubmissionPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    reporterName: 'Warden Ramesh Kumar',
    vehicleNumber: 'KA01AB1234',
    violationCode: 'PV13',
    description: '',
    location: 'Brigade Road Junction, Near Metro Pillar 140',
    urgency: 'Critical',
    remarks: '',
    secondaryHint: ''
  });

  // Validation States
  const [vehicleVal, setVehicleVal] = useState(null);
  const [violationVal, setViolationVal] = useState(null);
  const [validatingVehicle, setValidatingVehicle] = useState(false);
  const [validatingViolation, setValidatingViolation] = useState(false);

  // Submission States
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  // Validate Vehicle Number on change with debounce
  useEffect(() => {
    if (!formData.vehicleNumber.trim()) {
      setVehicleVal(null);
      return;
    }

    const timer = setTimeout(() => {
      setValidatingVehicle(true);
      validateVehicle(formData.vehicleNumber.trim())
        .then((res) => {
          setVehicleVal(res.data);
        })
        .catch((err) => {
          setVehicleVal(err.response?.data || { isValid: false, message: 'Validation request failed' });
        })
        .finally(() => setValidatingVehicle(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [formData.vehicleNumber]);

  // Validate Violation Code on change with debounce
  useEffect(() => {
    if (!formData.violationCode.trim()) {
      setViolationVal(null);
      return;
    }

    const timer = setTimeout(() => {
      setValidatingViolation(true);
      validateViolation(formData.violationCode.trim(), formData.secondaryHint)
        .then((res) => {
          setViolationVal(res.data);
          if (res.data.classification && !formData.description) {
            setFormData((prev) => ({
              ...prev,
              description: res.data.classification.title || prev.description,
              urgency: res.data.classification.defaultUrgency || prev.urgency
            }));
          }
        })
        .catch((err) => {
          setViolationVal(err.response?.data || { isValid: false, message: 'Violation validation failed' });
        })
        .finally(() => setValidatingViolation(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [formData.violationCode, formData.secondaryHint]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDfaModal = (type) => {
    if (type === 'vehicle' && vehicleVal) {
      setModalData(vehicleVal);
      setModalTitle('Vehicle Plate DFA Transition Trace ([A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4})');
      setModalOpen(true);
    } else if (type === 'violation' && violationVal) {
      setModalData(violationVal);
      setModalTitle('Violation Code DFA Transition Trace (PV[0-9]{2})');
      setModalOpen(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(null);

    try {
      const response = await createReport(formData);
      if (response.data.success) {
        setSubmissionSuccess(response.data);
        // Reset form partially
        setFormData((prev) => ({
          ...prev,
          vehicleNumber: '',
          description: '',
          remarks: ''
        }));
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSubmissionError(err.response?.data?.message || err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    formData.reporterName.trim() &&
    vehicleVal?.isValid &&
    violationVal?.isValid &&
    formData.location.trim();

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* SUCCESS NOTIFICATION BANNER */}
      {submissionSuccess && (
        <div
          className="card"
          style={{
            background: '#ecfdf5',
            borderColor: '#a7f3d0',
            marginBottom: '24px',
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <CheckCircle2 size={32} color="#059669" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, color: '#065f46', fontSize: '1.15rem', fontWeight: 700 }}>
                  Violation Report Logged Successfully!
                </h3>
                <span className="badge badge-resolved" style={{ fontSize: '0.85rem' }}>
                  ID: {submissionSuccess.data.reportId}
                </span>
              </div>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#047857' }}>
                {submissionSuccess.data.routingDecision}
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/dashboard?search=${submissionSuccess.data.reportId}`)}
                >
                  <span>View in Dashboard</span>
                  <ExternalLink size={14} />
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSubmissionSuccess(null)}
                >
                  <span>Submit Another</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ERROR BANNER */}
      {submissionError && (
        <div
          className="card"
          style={{
            background: '#fef2f2',
            borderColor: '#fecaca',
            marginBottom: '24px',
            padding: '18px 24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <AlertCircle size={24} color="#dc2626" />
            <div>
              <h4 style={{ margin: 0, color: '#991b1b', fontWeight: 700 }}>Report Rejection / Error</h4>
              <p style={{ margin: '2px 0 0', color: '#b91c1c', fontSize: '0.85rem' }}>{submissionError}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* SUBMISSION FORM */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <FileCheck size={20} color="#2563eb" />
              <span>Parking Violation Submission Form</span>
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>* All fields validated live</span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Reporter Name */}
            <div className="form-group">
              <label className="form-label">Warden / Reporter Name *</label>
              <input
                type="text"
                name="reporterName"
                className="form-input"
                placeholder="e.g. Officer Suresh Rao"
                value={formData.reporterName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Vehicle Registration Number with Live Automata Validation */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Vehicle Registration Number (Karnataka Standard) *
                </label>
                {vehicleVal && (
                  <button
                    type="button"
                    onClick={() => handleOpenDfaModal('vehicle')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Cpu size={14} />
                    <span>View DFA Trace</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                name="vehicleNumber"
                className={`form-input font-mono ${
                  vehicleVal && !vehicleVal.isValid ? 'input-error' : ''
                }`}
                placeholder="e.g. KA03AB1234 or KA05C5678"
                value={formData.vehicleNumber}
                onChange={handleChange}
                style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}
                required
              />

              {/* Inline Vehicle Validation Feedback */}
              {validatingVehicle && <div className="form-hint">Executing Automata transition check...</div>}
              {vehicleVal && (
                <div style={{ marginTop: '6px' }}>
                  {vehicleVal.isValid ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                      <CheckCircle2 size={14} />
                      <span>DFA State {vehicleVal.dfa.finalState} (Accepted) | 100% Regex Agreement</span>
                    </div>
                  ) : (
                    <div className="form-error">
                      <AlertCircle size={14} />
                      <span>{vehicleVal.dfa?.explanation || 'Invalid format: must match [A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Violation Code Selector / Input */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Violation Code (PV + 2 digits) *</label>
                {violationVal && (
                  <button
                    type="button"
                    onClick={() => handleOpenDfaModal('violation')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Cpu size={14} />
                    <span>View DFA Trace</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <input
                  type="text"
                  name="violationCode"
                  className={`form-input font-mono ${
                    violationVal && !violationVal.isValid ? 'input-error' : ''
                  }`}
                  placeholder="e.g. PV01, PV10, PV13"
                  value={formData.violationCode}
                  onChange={handleChange}
                  style={{ width: '130px', textTransform: 'uppercase', fontWeight: 600 }}
                  required
                />

                <select
                  className="form-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData((prev) => ({ ...prev, violationCode: e.target.value }));
                    }
                  }}
                  value={formData.violationCode}
                >
                  <option value="">-- Or Quick Select Preset --</option>
                  {VIOLATION_PRESETS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Inline Violation Code Feedback */}
              {violationVal && (
                <div style={{ marginTop: '4px' }}>
                  {violationVal.isValid && violationVal.classification?.success ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                      <CheckCircle2 size={14} />
                      <span>Classified: {violationVal.classification.category} ({violationVal.classification.severity})</span>
                    </div>
                  ) : (
                    <div className="form-error">
                      <AlertCircle size={14} />
                      <span>{violationVal.classification?.message || 'Violation code syntax error'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Violation Location */}
            <div className="form-group">
              <label className="form-label">Violation Location *</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. 100 Feet Road, Indiranagar Near Metro Station"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            {/* Urgency / Priority */}
            <div className="form-group">
              <label className="form-label">Enforcement Urgency</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Normal', 'High', 'Critical'].map((urg) => (
                  <label
                    key={urg}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      border: `2px solid ${formData.urgency === urg ? '#2563eb' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: formData.urgency === urg ? '#eff6ff' : '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={urg}
                      checked={formData.urgency === urg}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                    <PriorityBadge priority={urg} />
                  </label>
                ))}
              </div>
            </div>

            {/* Description & Remarks */}
            <div className="form-group">
              <label className="form-label">Violation Description</label>
              <textarea
                name="description"
                rows="2"
                className="form-textarea"
                placeholder="Brief description of the violation..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Additional Remarks / Conflict Flags</label>
              <input
                type="text"
                name="remarks"
                className="form-input"
                placeholder="e.g. Vehicle unattended with flashers on, tow truck requested"
                value={formData.remarks}
                onChange={handleChange}
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid || submitting}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Executing Dispatch & Persisting to MongoDB...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit & Route Violation Report</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* REAL-TIME PREVIEW PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Dynamic Routing Preview */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '14px' }}>
              <Route size={18} color="#2563eb" />
              <span>Routing Decision Preview</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Routing Key (First 4 Chars):</span>
                <span className="font-mono" style={{ fontWeight: 700, color: '#0f172a' }}>
                  {vehicleVal?.routingKey || '----'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Detected Enforcement Zone:</span>
                <span style={{ fontWeight: 600, color: vehicleVal?.zoneInfo?.zone ? '#2563eb' : '#94a3b8' }}>
                  {vehicleVal?.zoneInfo?.zone || 'Pending Valid Plate'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Territorial Division:</span>
                <span style={{ fontSize: '0.78rem', textAlign: 'right', maxWidth: '180px', color: '#334155' }}>
                  {vehicleVal?.zoneInfo?.zoneName || 'Waiting for plate key'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Violation Classification:</span>
                {violationVal?.classification?.category ? (
                  <CategoryBadge category={violationVal.classification.category} />
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Pending Code</span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Assigned Priority:</span>
                <PriorityBadge priority={formData.urgency} />
              </div>
            </div>

            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.75rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <Info size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Deterministic Routing:</strong> Reports are matched by routing key to the designated primary handler.
                If primary handler capacity is full or offline, the system automatically redirects to the active backup handler.
              </div>
            </div>
          </div>

          {/* Automata Formal Model Reference Card */}
          <div className="card">
            <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '12px' }}>
              <Cpu size={18} color="#9333ea" />
              <span>Automata Definition (Part A)</span>
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '6px' }}>
                <strong>Tuple:</strong> {'M = (Q, Σ, δ, q0, F)'}
              </p>
              <p style={{ marginBottom: '6px' }}>
                <strong>States:</strong> {'Q = {q0, q1, ..., q10, q_dead}'}
              </p>
              <p style={{ marginBottom: '6px' }}>
                <strong>Alphabet:</strong> {'Σ = {A-Z, 0-9}'}
              </p>
              <p style={{ marginBottom: '6px' }}>
                <strong>Accepting State:</strong> {'F = {q10}'}
              </p>
              <p>
                <strong>Format:</strong> <code>[A-Z]&#123;2&#125;[0-9]&#123;2&#125;[A-Z]&#123;1,2&#125;[0-9]&#123;4&#125;</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DFA Visualizer Modal */}
      <DfaVisualizerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        validationData={modalData}
        title={modalTitle}
      />
    </div>
  );
}
