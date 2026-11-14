import React, { useState, useEffect } from 'react';
import {
  Route,
  ShieldAlert,
  Users,
  Building,
  RefreshCw,
  Send,
  AlertOctagon,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Sliders
} from 'lucide-react';
import { getRoutingMatrix, simulateDispatch, getRoutingQueues, updateHandler } from '../api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';

export default function RoutingDashboard() {
  const [matrixData, setMatrixData] = useState(null);
  const [queues, setQueues] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation form
  const [simPlate, setSimPlate] = useState('KA03AB9999');
  const [simUrgency, setSimUrgency] = useState('Critical');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getRoutingMatrix(), getRoutingQueues()])
      .then(([matRes, qRes]) => {
        if (matRes.data.success) setMatrixData(matRes.data.data);
        if (qRes.data.success) setQueues(qRes.data);
      })
      .catch((err) => console.error('Routing fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await simulateDispatch({
        vehicleNumber: simPlate,
        urgency: simUrgency
      });
      if (res.data.success) {
        setSimResult(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handleToggleHandlerAvail = async (handlerId, currentAvail) => {
    try {
      await updateHandler(handlerId, { availability: !currentAvail });
      fetchAll();
    } catch (err) {
      alert('Error updating handler availability');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 6 ENFORCEMENT ZONES GRID */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Municipal Routing Matrix (KA01 - KA06)
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Part B: Computer Networks & Routing Table with Dynamic Capacity Management
          </span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAll} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Matrix</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {matrixData?.zones?.map((z) => {
          const capPct = z.totalCapacity > 0 ? Math.round((z.totalWorkload / z.totalCapacity) * 100) : 0;
          return (
            <div key={z.routingKey} className="card" style={{ padding: '18px', borderTop: '4px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span
                    className="font-mono"
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}
                  >
                    Key: {z.routingKey}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '6px 0 2px', color: '#0f172a' }}>
                    {z.zone}
                  </h3>
                </div>
                <span className="badge badge-assigned">{z.availableCapacity} Free Slots</span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
                {z.zoneName}
              </div>

              {/* Workload Indicator */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  <span>Depot Capacity:</span>
                  <span>{z.totalWorkload} / {z.totalCapacity} ({capPct}%)</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, capPct)}%`,
                      height: '100%',
                      backgroundColor: capPct >= 100 ? '#ef4444' : capPct >= 70 ? '#f59e0b' : '#2563eb'
                    }}
                  />
                </div>
              </div>

              {/* Handlers Summary */}
              <div style={{ fontSize: '0.78rem', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#475569' }}>Primary Handler:</span>
                  <strong>{z.primaryHandler?.name || 'Unassigned'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Reserve Backups:</span>
                  <span>{z.backupHandlers?.length || 0} designated</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DISPATCH SIMULATOR & CENTRAL FALLBACK QUEUE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Live Dispatch Simulator */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sliders size={18} color="#2563eb" />
              <span>Packet Dispatch Simulator (Part B)</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Test routing decisions live</span>
          </div>

          <form onSubmit={handleSimulate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: '10px', alignItems: 'flex-end', marginBottom: '16px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Vehicle Registration Plate</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. KA04AB1234 or KA99ZZ9999"
                  value={simPlate}
                  onChange={(e) => setSimPlate(e.target.value)}
                  style={{ textTransform: 'uppercase', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Priority Level</label>
                <select className="form-select" value={simUrgency} onChange={(e) => setSimUrgency(e.target.value)}>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={simulating}>
                <Send size={16} />
                <span>Simulate</span>
              </button>
            </div>
          </form>

          {simResult && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '10px',
                background: simResult.decision.dispatchedToFallback ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${simResult.decision.dispatchedToFallback ? '#fecaca' : '#bbf7d0'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-mono" style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                  Extracted Routing Key: {simResult.routingKey}
                </span>
                <span
                  className={`badge ${
                    simResult.decision.dispatchedToFallback ? 'badge-escalated' : 'badge-resolved'
                  }`}
                >
                  {simResult.decision.status}
                </span>
              </div>

              <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#1e293b' }}>
                {simResult.decision.routingDecision}
              </p>

              {simResult.decision.escalationReason && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600 }}>
                  Escalation Trigger: {simResult.decision.escalationReason}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Central Fallback Queue */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <AlertOctagon size={18} color="#dc2626" />
              <span>Central Fallback & Escalation Queue ({queues?.fallbackQueue?.count || 0})</span>
            </h3>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
            Reports routed to <code>FALLBACK_CENTRAL</code> due to unknown territorial routing keys or depleted zonal depot capacity.
          </div>

          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {queues?.fallbackQueue?.reports?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#16a34a' }}>
                <CheckCircle size={28} style={{ margin: '0 auto 6px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Central Fallback Queue is Clear</div>
              </div>
            ) : (
              queues?.fallbackQueue?.reports?.map((r) => (
                <div
                  key={r.reportId}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.82rem', color: '#b91c1c' }}>
                        {r.reportId}
                      </span>
                      <PriorityBadge priority={r.priority} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      Plate: <strong>{r.vehicleNumber}</strong> | {r.escalationReason || 'Unknown Zone'}
                    </div>
                  </div>
                  <span className="badge badge-escalated">Escalated</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE HANDLER AVAILABILITY & CAPACITY ROSTER */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Enforcement Handlers Routing Table & Live Availability Toggles
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Toggle availability off to test automated failover dispatch to reserve backup wardens
          </span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Handler ID</th>
                <th>Name & Role</th>
                <th>Enforcement Zone</th>
                <th>Depot & Division</th>
                <th>Workload / Max</th>
                <th>Availability</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {matrixData?.handlers?.map((h) => (
                <tr key={h.handlerId}>
                  <td>
                    <span className="font-mono" style={{ fontWeight: 700, color: '#2563eb' }}>
                      {h.handlerId}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{h.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {h.isBackup ? 'Designated Backup Warden' : 'Primary Enforcement Officer'}
                    </div>
                  </td>
                  <td>
                    <strong>{h.zone}</strong>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <div>{h.depot}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{h.branch}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: h.currentWorkload >= h.maximumCapacity ? '#dc2626' : '#0f172a'
                      }}
                    >
                      {h.currentWorkload} / {h.maximumCapacity} active
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${h.availability ? 'badge-resolved' : 'badge-escalated'}`}
                    >
                      {h.availability ? 'On-Duty' : 'Off-Duty'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={`btn btn-sm ${h.availability ? 'btn-secondary' : 'btn-success'}`}
                      onClick={() => handleToggleHandlerAvail(h.handlerId, h.availability)}
                    >
                      {h.availability ? 'Toggle Off-Duty' : 'Toggle On-Duty'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
