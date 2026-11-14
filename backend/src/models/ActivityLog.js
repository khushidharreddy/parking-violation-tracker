import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'SUBMITTED',
        'VALIDATED',
        'ROUTED',
        'STATUS_CHANGE',
        'BACKUP_DISPATCHED',
        'ESCALATED_FALLBACK',
        'PRIORITY_OVERRIDE',
        'REASSIGNED',
        'RESOLVED',
        'REJECTED'
      ]
    },
    previousStatus: {
      type: String,
      default: null
    },
    newStatus: {
      type: String,
      default: null
    },
    performedBy: {
      type: String,
      default: 'SYSTEM_ROUTER'
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
