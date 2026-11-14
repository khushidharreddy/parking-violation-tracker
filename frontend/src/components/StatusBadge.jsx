import React from 'react';
import { Clock, CheckCircle2, AlertCircle, ArrowUpRight, PlayCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  switch (status) {
    case 'Pending':
      return (
        <span className="badge badge-pending">
          <Clock size={12} /> Pending
        </span>
      );
    case 'Assigned':
      return (
        <span className="badge badge-assigned">
          <ArrowUpRight size={12} /> Assigned
        </span>
      );
    case 'In Progress':
      return (
        <span className="badge badge-inprogress">
          <PlayCircle size={12} /> In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span className="badge badge-resolved">
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    case 'Escalated':
      return (
        <span className="badge badge-escalated">
          <AlertCircle size={12} /> Escalated
        </span>
      );
    default:
      return <span className="badge badge-category">{status}</span>;
  }
}
