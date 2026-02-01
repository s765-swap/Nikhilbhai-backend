import mongoose, { Schema } from "mongoose";

export type MemberDoc = {
  name: string;
  uniqueId: string;
  group?: string | null;
};

const memberSchema = new Schema<MemberDoc>(
  {
    name: { type: String, required: true, trim: true },
    uniqueId: { type: String, required: true, trim: true, unique: true },
    group: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

memberSchema.index({ uniqueId: 1 }, { unique: true });
memberSchema.index({ group: 1 });

export const Member = mongoose.model<MemberDoc>("Member", memberSchema);

