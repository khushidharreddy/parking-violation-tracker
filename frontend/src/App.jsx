import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ReportSubmissionPage from './pages/ReportSubmissionPage';
import UserDashboard from './pages/UserDashboard';
import HandlerDashboard from './pages/HandlerDashboard';
import RoutingDashboard from './pages/RoutingDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AutomataTheoryDemoPage from './pages/AutomataTheoryDemoPage';
import TestingPage from './pages/TestingPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-wrapper">
          <Navbar />
          <main className="content-body">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/submit" element={<ReportSubmissionPage />} />
              <Route path="/handlers" element={<HandlerDashboard />} />
              <Route path="/routing" element={<RoutingDashboard />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/automata" element={<AutomataTheoryDemoPage />} />
              <Route path="/testing" element={<TestingPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
