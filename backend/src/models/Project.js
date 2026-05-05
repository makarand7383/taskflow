const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

projectSchema.pre('save', async function () {
  if (!this.members.map(String).includes(String(this.admin))) {
    this.members.push(this.admin);
  }
});

module.exports = mongoose.model('Project', projectSchema);