import mongoose from 'mongoose';

const handlerSchema = new mongoose.Schema(
  {
    handlerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Handler name is required'],
      trim: true
    },
    zone: {
      type: String,
      required: true,
      trim: true
    },
    team: {
      type: String,
      required: true,
      trim: true
    },
    branch: {
      type: String,
      required: true,
      trim: true
    },
    depot: {
      type: String,
      required: true,
      trim: true
    },
    availability: {
      type: Boolean,
      default: true,
      index: true
    },
    maximumCapacity: {
      type: Number,
      required: true,
      default: 5,
      min: 1
    },
    currentWorkload: {
      type: Number,
      default: 0,
      min: 0
    },
    isBackup: {
      type: Boolean,
      default: false
    },
    contactNumber: {
      type: String,
      default: '+91-80-2200-0000'
    }
  },
  {
    timestamps: true
  }
);

// Virtual for remaining capacity
handlerSchema.virtual('availableCapacity').get(function () {
  return Math.max(0, this.maximumCapacity - this.currentWorkload);
});

handlerSchema.set('toJSON', { virtuals: true });
handlerSchema.set('toObject', { virtuals: true });

export const Handler = mongoose.model('Handler', handlerSchema);
