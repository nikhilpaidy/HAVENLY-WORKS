import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRoomReview extends Document {
  roomId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  bookingId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoomReviewSchema = new Schema<IRoomReview>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'MeetingRoom',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    userAvatar: {
      type: String
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    }
  },
  {
    timestamps: true
  }
);

RoomReviewSchema.index({ roomId: 1, createdAt: -1 });

export const RoomReview = mongoose.model<IRoomReview>('RoomReview', RoomReviewSchema);
