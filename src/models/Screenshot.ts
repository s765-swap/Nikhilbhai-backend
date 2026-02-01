import mongoose, { Schema, Types } from "mongoose";

export type ScreenshotDoc = {
  memberId: Types.ObjectId;
  taskId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  imageUrl: string; // served by backend, e.g. "/uploads/xxx.jpg"
  filename: string;
  originalName: string;
  uploadedAt: Date;
};

const screenshotSchema = new Schema<ScreenshotDoc>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    date: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    uploadedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: false }
);

screenshotSchema.index({ date: 1 });
screenshotSchema.index({ memberId: 1, date: 1 });
screenshotSchema.index({ taskId: 1, date: 1 });

export const Screenshot = mongoose.model<ScreenshotDoc>(
  "Screenshot",
  screenshotSchema
);

