import mongoose, { Schema, Types } from "mongoose";

export type TaskDoc = {
  appName: string;
  date: string; // YYYY-MM-DD
  assignedMemberIds: Types.ObjectId[];
};

const taskSchema = new Schema<TaskDoc>(
  {
    appName: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    assignedMemberIds: [{ type: Schema.Types.ObjectId, ref: "Member" }],
  },
  { timestamps: true }
);

taskSchema.index({ date: 1 });
taskSchema.index({ date: 1, appName: 1 });

export const Task = mongoose.model<TaskDoc>("Task", taskSchema);

