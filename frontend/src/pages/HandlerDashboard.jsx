import React, { useState, useEffect } from 'react';
import {
  Users2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
  Phone,
  Building,
  MapPin,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { getHandlers, updateHandler, getHandlerReports, updateReportStatus } from '../api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';

export default function HandlerDashboard() {
  const [handlers, setHandlers] = useState([]);
  const [selectedHandlerId, setSelectedHandlerId] = useState('');
  const [currentHandler, setCurrentHandler] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [togglingAvail, setTogglingAvail] = useState(false);

  // Fetch all handlers
  const fetchHandlers = () => {
    setLoading(true);
    getHandlers()
      .then((res) => {
        if (res.data?.success && res.data.data.length > 0) {
          setHandlers(res.data.data);
          if (!selectedHandlerId) {
            setSelectedHandlerId(res.data.data[0].handlerId);
          }
        }
      })
      .catch((err) => console.error('Error fetching handlers:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHandlers();
  }, []);

  // When selected handler changes, fetch its reports & profile
  useEffect(() => {
    if (!selectedHandlerId) return;

    const handler = handlers.find((h) => h.handlerId === selectedHandlerId);
    setCurrentHandler(handler || null);

    setLoadingReports(true);
    getHandlerReports(selectedHandlerId)
      .then((res) => {
        if (res.data?.success) {
          setReports(res.data.data);
          if (res.data.handler) {
            setCurrentHandler(res.data.handler);
          }
        }
      })
      .catch((err) => console.error('Error fetching handler reports:', err))
      .finally(() => setLoadingReports(false));
  }, [selectedHandlerId, handlers]);

  // Toggle availability (on-duty / off-duty)
  const handleToggleAvailability = async () => {
    if (!currentHandler) return;
    setTogglingAvail(true);
    try {
      const newAvail = !currentHandler.availability;
      const res = await updateHandler(currentHandler.handlerId, { availability: newAvail });
      if (res.data.success) {
        setCurrentHandler(res.data.data);
        // refresh list
        setHandlers((prev) =>
          prev.map((h) => (h.handlerId === currentHandler.handlerId ? res.data.data : h))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating availability');
    } finally {
      setTogglingAvail(false);
    }
  };

  // Update report status
  const handleStatusUpdate = async (reportId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateReportStatus(reportId, {
        status: newStatus,
        performedBy: currentHandler?.name || 'ENFORCEMENT_HANDLER',
        remarks: `Handler ${currentHandler?.name} advanced status to ${newStatus}`
      });
      // Refresh reports and handler stats
      const res = await getHandlerReports(selectedHandlerId);
      if (res.data?.success) {
        setReports(res.data.data);
        if (res.data.handler) setCurrentHandler(res.data.handler);
      }
      fetchHandlers();
    } catch (err) {
      alert(err.response?.data?.message || 'Status transition failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const workloadPct = currentHandler
    ? Math.round((currentHandler.currentWorkload / currentHandler.maximumCapacity) * 100)
    : 0;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* HANDLER SELECTOR TOP BAR */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users2 size={22} color="#2563eb" />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Active Warden Console
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                Select Enforcement Handler
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              className="form-select"
              style={{ minWidth: '320px', fontWeight: 600 }}
              value={selectedHandlerId}
              onChange={(e) => setSelectedHandlerId(e.target.value)}
            >
              {handlers.map((h) => (
                <option key={h.handlerId} value={h.handlerId}>
                  {h.zone}: {h.name} {h.isBackup ? '(Backup)' : '(Primary)'} - {h.currentWorkload}/{h.maximumCapacity} active
                </option>
              ))}
            </select>

            <button className="btn btn-secondary btn-sm" onClick={fetchHandlers} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {currentHandler && (
        <>
          {/* HANDLER PROFILE & WORKLOAD BANNER */}
          <div
            className="card"
            style={{
              marginBottom: '24px',
              padding: '24px',
              borderLeft: `5px solid ${currentHandler.availability ? '#2563eb' : '#ef4444'}`
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {currentHandler.name}
                  </h2>
                  <span className="badge badge-category">{currentHandler.handlerId}</span>
                  {currentHandler.isBackup && (
                    <span className="badge badge-high">Designated Backup</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#475569', fontSize: '0.84rem', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="#2563eb" />
                    <strong>{currentHandler.zone}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={15} color="#64748b" />
                    <span>{currentHandler.depot}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={15} color="#16a34a" />
                    <span>{currentHandler.contactNumber}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={15} color="#9333ea" />
                    <span>Team: {currentHandler.team}</span>
                  </div>
                </div>
              </div>

              {/* Workload Meter & Duty Switch */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                      Current Workload Capacity
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: workloadPct >= 100 ? '#dc2626' : '#2563eb' }}>
                      {currentHandler.currentWorkload} / {currentHandler.maximumCapacity} Cases ({workloadPct}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, workloadPct)}%`,
                        height: '100%',
                        backgroundColor:
                          workloadPct >= 100 ? '#ef4444' : workloadPct >= 70 ? '#f59e0b' : '#2563eb',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                    Available Capacity: <strong>{Math.max(0, currentHandler.maximumCapacity - currentHandler.currentWorkload)}</strong> remaining slots
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: currentHandler.availability ? '#16a34a' : '#ef4444'
                      }}
                    />
                    <span>Status: {currentHandler.availability ? 'ON-DUTY (ELIGIBLE)' : 'OFF-DUTY (UNAVAILABLE)'}</span>
                  </div>

                  <button
                    className={`btn btn-sm ${currentHandler.availability ? 'btn-secondary' : 'btn-success'}`}
                    onClick={handleToggleAvailability}
                    disabled={togglingAvail}
                  >
                    {currentHandler.availability ? 'Mark Off-Duty' : 'Mark On-Duty'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ASSIGNED REPORTS TABLE */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Reports Assigned to {currentHandler.name} ({reports.length})
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Advance violation reports from Pending → Assigned → In Progress → Resolved
                </span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Plate Number</th>
                    <th>Violation Category</th>
                    <th>Priority</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Reported Time</th>
                    <th style={{ textAlign: 'right' }}>Workflow Transitions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingReports ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                        <div>Loading assigned violation reports...</div>
                      </td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                        <CheckCircle2 size={32} color="#16a34a" style={{ margin: '0 auto 8px' }} />
                        <div style={{ fontWeight: 600 }}>No pending violations in queue for this handler</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                          Current workload is at 0 active cases. All assigned violations resolved!
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reports.map((r) => (
                      <tr key={r.reportId}>
                        <td>
                          <span className="font-mono" style={{ fontWeight: 700, color: '#2563eb' }}>
                            {r.reportId}
                          </span>
                        </td>
                        <td>
                          <span
                            className="font-mono"
                            style={{
                              fontWeight: 700,
                              background: '#f1f5f9',
                              padding: '3px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            {r.vehicleNumber}
                          </span>
                        </td>
                        <td>
                          <CategoryBadge category={r.category} />
                        </td>
                        <td>
                          <PriorityBadge priority={r.priority} />
                        </td>
                        <td style={{ maxWidth: '200px', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.location}
                        </td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {new Date(r.submissionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {r.status === 'Pending' && (
                              <button
                                className="btn btn-primary btn-sm"
                                disabled={updatingStatus}
                                onClick={() => handleStatusUpdate(r.reportId, 'Assigned')}
                              >
                                Accept (Assign)
                              </button>
                            )}
                            {r.status === 'Assigned' && (
                              <button
                                className="btn btn-primary btn-sm"
                                disabled={updatingStatus}
                                onClick={() => handleStatusUpdate(r.reportId, 'In Progress')}
                              >
                                Start In-Progress
                              </button>
                            )}
                            {r.status === 'In Progress' && (
                              <button
                                className="btn btn-success btn-sm"
                                disabled={updatingStatus}
                                onClick={() => handleStatusUpdate(r.reportId, 'Resolved')}
                              >
                                Mark Resolved
                              </button>
                            )}
                            {r.status === 'Resolved' && (
                              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                                Completed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
