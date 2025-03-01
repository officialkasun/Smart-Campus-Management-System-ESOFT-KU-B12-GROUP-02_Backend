import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the student
  events: [
    {
      title: { type: String, required: true },
      description: { type: String },
      date: { type: Date, required: true },
      location: { type: String },
      type: { type: String, enum: ['class', 'exam', 'assignment', 'other'], default: 'class' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;