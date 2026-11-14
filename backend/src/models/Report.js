import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    reporterName: {
      type: String,
      required: [true, 'Reporter name is required'],
      trim: true
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle registration number is required'],
      uppercase: true,
      trim: true
    },
    violationCode: {
      type: String,
      required: [true, 'Violation code is required'],
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Violation location is required'],
      trim: true
    },
    urgency: {
      type: String,
      enum: ['Normal', 'High', 'Critical'],
      default: 'Normal'
    },
    category: {
      type: String,
      enum: ['No-Permit', 'Overstay', 'Wrong-Zone', 'Obstruction', 'Disabled-Bay', 'Unclassified'],
      required: true
    },
    validationStatus: {
      type: String,
      enum: ['VALID', 'INVALID', 'FLAGGED'],
      default: 'VALID'
    },
    validationMethod: {
      type: String,
      enum: ['DFA', 'REGEX', 'HYBRID_AGREEMENT'],
      default: 'HYBRID_AGREEMENT'
    },
    routingKey: {
      type: String,
      required: true,
      uppercase: true
    },
    zone: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Critical'],
      default: 'Normal'
    },
    handlerId: {
      type: String,
      default: 'UNASSIGNED'
    },
    handlerName: {
      type: String,
      default: 'Unassigned'
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Escalated', 'Rejected'],
      default: 'Pending',
      index: true
    },
    routingDecision: {
      type: String,
      default: ''
    },
    escalationReason: {
      type: String,
      default: null
    },
    remarks: {
      type: String,
      default: ''
    },
    submissionTimestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    resolvedTimestamp: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Report = mongoose.model('Report', reportSchema);
