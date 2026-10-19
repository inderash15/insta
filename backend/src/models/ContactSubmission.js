import mongoose from 'mongoose';

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    category: {
      type: String,
      enum: ['account', 'security', 'billing', 'feature', 'bug', 'other'],
      default: 'account'
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['received', 'in_progress', 'resolved'],
      default: 'received'
    }
  },
  {
    timestamps: true
  }
);

export const ContactSubmission = mongoose.model('ContactSubmission', contactSubmissionSchema);
