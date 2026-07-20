const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: Number,
    unique: true,
    index: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  contactNo: {
    type: String,
    required: true,
    trim: true
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  deptId: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

employeeSchema.pre('save', async function (next) {
  if (!this.employeeId || isNaN(this.employeeId) || this.employeeId <= 0) {
    const lastEmployee = await Employee.findOne(
      { employeeId: { $exists: true, $ne: null, $type: 'number' } },
      {},
      { sort: { employeeId: -1 } }
    );
    this.employeeId = lastEmployee ? lastEmployee.employeeId + 1 : 1001;
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
