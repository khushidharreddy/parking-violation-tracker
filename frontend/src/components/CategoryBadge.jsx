import React from 'react';
import { ShieldCheck, Clock, Navigation, AlertOctagon, Accessibility } from 'lucide-react';

export default function CategoryBadge({ category }) {
  const getIcon = () => {
    switch (category) {
      case 'Disabled-Bay':
        return <Accessibility size={12} color="#dc2626" />;
      case 'Obstruction':
        return <AlertOctagon size={12} color="#ea580c" />;
      case 'Wrong-Zone':
        return <Navigation size={12} color="#2563eb" />;
      case 'Overstay':
        return <Clock size={12} color="#d97706" />;
      case 'No-Permit':
      default:
        return <ShieldCheck size={12} color="#475569" />;
    }
  };

  return (
    <span className="badge badge-category" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {getIcon()}
      <span>{category}</span>
    </span>
  );
}
