const Employee = require('../models/Employee');

const generateEmployeeId = async () => {
  const lastEmployee = await Employee.findOne(
    { employeeId: { $exists: true, $ne: null, $type: 'number' } },
    {},
    { sort: { employeeId: -1 } }
  );
  return lastEmployee ? lastEmployee.employeeId + 1 : 1001;
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: parseInt(req.params.id) });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    console.log('Create employee request body:', req.body);
    const body = { ...req.body };
    if (!body.employeeId) {
      body.employeeId = await generateEmployeeId();
    console.log('Generated employeeId:', body.employeeId);
    }
    const employee = new Employee(body);
    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error('Create employee error:', error);
    if (error.code === 11000) {
      const key = Object.keys(error.keyPattern || {})[0];
      if (key === 'emailId') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      return res.status(400).json({ message: 'Employee ID already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.employeeId) {
      const existing = await Employee.findOne({ employeeId: parseInt(updateData.employeeId) });
      if (existing && existing._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
    }
    const employee = await Employee.findOneAndUpdate(
      { employeeId: parseInt(req.params.id) },
      updateData,
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    if (error.code === 11000) {
      const key = Object.keys(error.keyPattern || {})[0];
      if (key === 'emailId') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      return res.status(400).json({ message: 'Employee ID already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ employeeId: parseInt(req.params.id) });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
