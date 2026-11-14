import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Clock,
  ArrowUpRight,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  ChevronRight,
  X
} from 'lucide-react';
import { getReports, getReportById, updateReportStatus, deleteReport, getSummaryAnalytics } from '../api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';

export default function UserDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    assignedReports: 0,
    inProgressReports: 0,
    resolvedReports: 0
  });

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('ALL');
  const [zone, setZone] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  // Detail Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportLogs, setReportLogs] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Fetch summary stats
  const fetchStats = () => {
    getSummaryAnalytics()
      .then((res) => {
        if (res.data?.success) setStats(res.data.data);
      })
      .catch((err) => console.error('Stats error:', err));
  };

  // Fetch filtered reports
  const fetchReports = () => {
    setLoading(true);
    getReports({ search, category, zone, priority, status })
      .then((res) => {
        if (res.data?.success) {
          setReports(res.data.data);
          setTotal(res.data.total);
        }
      })
      .catch((err) => console.error('Fetch reports error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
    fetchReports();
  }, [category, zone, priority, status]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenDetail = async (reportId) => {
    setLoadingDetail(true);
    setSelectedReport(null);
    try {
      const res = await getReportById(reportId);
      if (res.data.success) {
        setSelectedReport(res.data.data);
        setReportLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching report detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    setStatusUpdating(true);
    try {
      await updateReportStatus(reportId, {
        status: newStatus,
        remarks: `Updated from User Dashboard to ${newStatus}`
      });
      fetchReports();
      fetchStats();
      if (selectedReport && selectedReport.reportId === reportId) {
        handleOpenDetail(reportId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm(`Are you sure you want to delete report ${reportId}?`)) return;
    try {
      await deleteReport(reportId);
      fetchReports();
      fetchStats();
      if (selectedReport?.reportId === reportId) {
        setSelectedReport(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      {/* 5 KEY LIFECYCLE STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card total" onClick={() => setStatus('ALL')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-label">Total Reports</div>
            <div className="stat-value">{stats.totalReports}</div>
          </div>
          <div className="stat-icon blue">
            <FileText size={22} />
          </div>
        </div>

        <div className="stat-card pending" onClick={() => setStatus('Pending')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.pendingReports}</div>
          </div>
          <div className="stat-icon orange">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card assigned" onClick={() => setStatus('Assigned')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-label">Assigned</div>
            <div className="stat-value">{stats.assignedReports}</div>
          </div>
          <div className="stat-icon blue">
            <ArrowUpRight size={22} />
          </div>
        </div>

        <div className="stat-card inprogress" onClick={() => setStatus('In Progress')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.inProgressReports}</div>
          </div>
          <div className="stat-icon purple">
            <PlayCircle size={22} />
          </div>
        </div>

        <div className="stat-card resolved" onClick={() => setStatus('Resolved')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-label">Resolved</div>
            <div className="stat-value">{stats.resolvedReports}</div>
          </div>
          <div className="stat-icon green">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by ID, Vehicle Plate, Warden, or Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div style={{ width: '170px' }}>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="ALL">All Categories (5)</option>
              <option value="No-Permit">No-Permit</option>
              <option value="Overstay">Overstay</option>
              <option value="Wrong-Zone">Wrong-Zone</option>
              <option value="Obstruction">Obstruction</option>
              <option value="Disabled-Bay">Disabled-Bay</option>
            </select>
          </div>

          {/* Zone Filter */}
          <div style={{ width: '150px' }}>
            <select className="form-select" value={zone} onChange={(e) => setZone(e.target.value)}>
              <option value="ALL">All Zones (6)</option>
              <option value="Zone 1">Zone 1 (CBD)</option>
              <option value="Zone 2">Zone 2 (West)</option>
              <option value="Zone 3">Zone 3 (East)</option>
              <option value="Zone 4">Zone 4 (North)</option>
              <option value="Zone 5">Zone 5 (South)</option>
              <option value="Zone 6">Zone 6 (Suburbs)</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ width: '140px' }}>
            <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ width: '150px' }}>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch('');
              setCategory('ALL');
              setZone('ALL');
              setPriority('ALL');
              setStatus('ALL');
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Enforcement Violation Records ({total})
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={fetchReports} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Vehicle Plate</th>
                <th>Zone / Key</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Assigned Handler</th>
                <th>Status</th>
                <th>Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                    <div>Loading violation records from MongoDB...</div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                    <AlertCircle size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 600 }}>No violation reports match your criteria</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Try resetting filters or submitting a new report</div>
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.reportId}>
                    <td>
                      <span
                        className="font-mono"
                        style={{ fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}
                        onClick={() => handleOpenDetail(r.reportId)}
                      >
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
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        {r.vehicleNumber}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{r.zone}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Key: {r.routingKey}</div>
                      </div>
                    </td>
                    <td>
                      <CategoryBadge category={r.category} />
                    </td>
                    <td>
                      <PriorityBadge priority={r.priority || r.urgency} />
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>
                        <div style={{ fontWeight: 600 }}>{r.handlerName || 'Unassigned'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{r.handlerId}</div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(r.submissionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="View Details & Logs"
                          onClick={() => handleOpenDetail(r.reportId)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#dc2626' }}
                          title="Delete Report"
                          onClick={() => handleDelete(r.reportId)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPORT DETAIL & ACTIVITY AUDIT TRAIL MODAL */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={22} color="#2563eb" />
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                    Report File: {selectedReport.reportId}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Submitted {new Date(selectedReport.submissionTimestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Top Meta Badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <StatusBadge status={selectedReport.status} />
                <PriorityBadge priority={selectedReport.priority} />
                <CategoryBadge category={selectedReport.category} />
                <span className="badge badge-category">Plate: {selectedReport.vehicleNumber}</span>
                <span className="badge badge-category">Zone: {selectedReport.zone}</span>
              </div>

              {/* Status Transition Control Buttons */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                  HANDLER STATUS TRANSITION CONTROLS
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Pending', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      disabled={statusUpdating || selectedReport.status === st}
                      className={`btn btn-sm ${
                        selectedReport.status === st
                          ? 'btn-primary'
                          : st === 'Resolved'
                          ? 'btn-success'
                          : 'btn-secondary'
                      }`}
                      onClick={() => handleStatusChange(selectedReport.reportId, st)}
                    >
                      {selectedReport.status === st ? `Current (${st})` : `Move to ${st}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Reporter Name</div>
                  <div style={{ fontWeight: 600 }}>{selectedReport.reporterName}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Violation Location</div>
                  <div style={{ fontWeight: 600 }}>{selectedReport.location}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Violation Code & Title</div>
                  <div style={{ fontWeight: 600 }}>{selectedReport.violationCode} - {selectedReport.description}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Assigned Handler</div>
                  <div style={{ fontWeight: 600 }}>{selectedReport.handlerName} ({selectedReport.handlerId})</div>
                </div>
              </div>

              {/* Routing Decision Explanation */}
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  fontSize: '0.82rem',
                  color: '#1e40af'
                }}
              >
                <strong>Routing Decision: </strong> {selectedReport.routingDecision}
                {selectedReport.escalationReason && (
                  <div style={{ marginTop: '4px', color: '#b91c1c' }}>
                    <strong>Escalation Reason: </strong> {selectedReport.escalationReason}
                  </div>
                )}
              </div>

              {/* Activity Audit Trail */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>
                Activity Audit Trail ({reportLogs.length} events recorded)
              </h4>

              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table className="custom-table" style={{ margin: 0, fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Action</th>
                      <th>Transition</th>
                      <th>Performed By</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td><strong>{log.action}</strong></td>
                        <td>{log.previousStatus || 'None'} → {log.newStatus || 'None'}</td>
                        <td>{log.performedBy}</td>
                        <td>{log.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
