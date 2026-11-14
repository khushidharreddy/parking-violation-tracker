import React from 'react';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';

export default function PriorityBadge({ priority }) {
  switch (priority) {
    case 'Critical':
      return (
        <span className="badge badge-critical">
          <ShieldAlert size={12} /> Critical
        </span>
      );
    case 'High':
      return (
        <span className="badge badge-high">
          <AlertTriangle size={12} /> High
        </span>
      );
    case 'Normal':
    default:
      return (
        <span className="badge badge-normal">
          <Info size={12} /> Normal
        </span>
      );
  }
}
