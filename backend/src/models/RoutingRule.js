import mongoose from 'mongoose';

const routingRuleSchema = new mongoose.Schema(
  {
    routingKey: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    zone: {
      type: String,
      required: true,
      trim: true
    },
    zoneName: {
      type: String,
      required: true,
      trim: true
    },
    primaryHandler: {
      type: String,
      required: true
    },
    backupHandlers: [
      {
        type: String
      }
    ],
    priorityRules: {
      criticalEscalation: {
        type: Boolean,
        default: true
      },
      maxQueueWaitMinutes: {
        type: Number,
        default: 30
      },
      autoDispatchBackup: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true
  }
);

export const RoutingRule = mongoose.model('RoutingRule', routingRuleSchema);
