import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  RefreshCw,
  Layers,
  MapPin,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import {
  getSummaryAnalytics,
  getCategoryAnalytics,
  getZoneAnalytics,
  getDailyAnalytics,
  getHandlerWorkloadAnalytics
} from '../api';

const CATEGORY_COLORS = {
  'Disabled-Bay': '#dc2626',
  'Obstruction': '#ea580c',
  'Wrong-Zone': '#2563eb',
  'Overstay': '#d97706',
  'No-Permit': '#64748b'
};

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#9333ea', '#06b6d4'];

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [daily, setDaily] = useState([]);
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    Promise.all([
      getSummaryAnalytics(),
      getCategoryAnalytics(),
      getZoneAnalytics(),
      getDailyAnalytics(),
      getHandlerWorkloadAnalytics()
    ])
      .then(([sRes, cRes, zRes, dRes, wRes]) => {
        if (sRes.data.success) setSummary(sRes.data.data);
        if (cRes.data.success) setCategories(cRes.data.data);
        if (zRes.data.success) setZones(zRes.data.data);
        if (dRes.data.success) setDaily(dRes.data.data);
        if (wRes.data.success) setWorkloads(wRes.data.data);
      })
      .catch((err) => console.error('Analytics load error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Format data for priority pie chart
  const priorityData = summary
    ? [
        { name: 'Critical', value: summary.criticalReports || 0, color: '#dc2626' },
        { name: 'High', value: summary.highReports || 0, color: '#ea580c' },
        { name: 'Normal', value: summary.normalReports || 0, color: '#64748b' }
      ]
    : [];

  // Format resolved vs unresolved
  const resolutionData = summary
    ? [
        { name: 'Resolved', value: summary.resolvedReports || 0, color: '#16a34a' },
        {
          name: 'Active / Unresolved',
          value: Math.max(0, summary.totalReports - summary.resolvedReports),
          color: '#f59e0b'
        }
      ]
    : [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Municipal Violation Analytics & Enforcement Metrics
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Real-time visual reports powered by Recharts & MongoDB Aggregation Pipelines
          </span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAnalytics} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* SUMMARY TOP TILES */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card total">
          <div>
            <div className="stat-label">Total Logged</div>
            <div className="stat-value">{summary?.totalReports || 0}</div>
          </div>
          <div className="stat-icon blue">
            <BarChart3 size={22} />
          </div>
        </div>

        <div className="stat-card resolved">
          <div>
            <div className="stat-label">Resolution Rate</div>
            <div className="stat-value">{summary?.resolutionRate || 0}%</div>
          </div>
          <div className="stat-icon green">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card critical">
          <div>
            <div className="stat-label">Critical Urgent</div>
            <div className="stat-value">{summary?.criticalReports || 0}</div>
          </div>
          <div className="stat-icon red">
            <ShieldAlert size={22} />
          </div>
        </div>

        <div className="stat-card assigned">
          <div>
            <div className="stat-label">Active Handlers</div>
            <div className="stat-value">{summary?.activeHandlers || 0} / {summary?.totalHandlers || 12}</div>
          </div>
          <div className="stat-icon blue">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* CHART ROW 1: Daily Trends & Category Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Daily Trend Line Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp size={18} color="#2563eb" />
              <span>Daily Violation Activity & Resolution Trend</span>
            </h3>
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily.length > 0 ? daily : [{ date: 'Today', violations: summary?.totalReports || 0, resolved: summary?.resolvedReports || 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="violations" stroke="#2563eb" strokeWidth={3} name="Total Violations" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5-Category Breakdown Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Layers size={18} color="#ea580c" />
              <span>5-Category Violation Breakdown</span>
            </h3>
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={11} width={85} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" name="Reports" radius={[0, 4, 4, 0]}>
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#2563eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHART ROW 2: Zone Distribution & Priority Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Zone Distribution Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <MapPin size={18} color="#2563eb" />
              <span>Zone-Wise Violation Distribution (6 Zones)</span>
            </h3>
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zones}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="zone" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2563eb" name="Total Reports" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#16a34a" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority & Status Donuts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <PieIcon size={18} color="#9333ea" />
              <span>Priority & Resolution Ratios</span>
            </h3>
          </div>
          <div style={{ display: 'flex', height: '280px' }}>
            <div style={{ flex: 1, height: '100%' }}>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                Priority Split
              </div>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`p-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: 1, height: '100%' }}>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                Resolution Split
              </div>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={resolutionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {resolutionData.map((entry, index) => (
                      <Cell key={`r-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* CHART ROW 3: Handler Workload Comparison */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <BarChart3 size={18} color="#2563eb" />
            <span>Handler Workload & Capacity Utilization Comparison</span>
          </h3>
        </div>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workloads} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} angle={-20} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="currentWorkload" fill="#2563eb" name="Current Workload" radius={[4, 4, 0, 0]} />
              <Bar dataKey="maximumCapacity" fill="#cbd5e1" name="Max Capacity" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
