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
// `unique: true` on the field already creates the unique index.
// Avoid declaring the same index twice which causes a Mongoose warning.
memberSchema.index({ group: 1 });

export const Member = mongoose.model<MemberDoc>("Member", memberSchema);

