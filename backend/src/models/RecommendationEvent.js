import mongoose from 'mongoose';

const recommendationEventSchema = new mongoose.Schema(
  {
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reel',
      required: true,
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    eventType: {
      type: String,
      enum: [
        'impression',
        'watch_progress',
        'completion',
        'replay',
        'skip',
        'like',
        'comment',
        'share',
        'save',
        'not_interested'
      ],
      required: true,
      index: true
    },
    watchDuration: {
      type: Number,
      default: 0,
      min: 0,
      max: 600 // Cap untrusted client watch duration to prevent runaway numbers
    },
    completionRatio: {
      type: Number,
      default: 0,
      min: 0,
      max: 10 // Allow multiple loops
    },
    reason: {
      type: String,
      default: '',
      trim: true
    },
    sessionContext: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

recommendationEventSchema.index({ viewer: 1, eventType: 1, createdAt: -1 });
recommendationEventSchema.index({ reel: 1, eventType: 1 });
recommendationEventSchema.index({ viewer: 1, reel: 1, eventType: 1 });

export const RecommendationEvent = mongoose.model(
  'RecommendationEvent',
  recommendationEventSchema
);
