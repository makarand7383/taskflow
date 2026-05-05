const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const requireAdmin = async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (String(project.admin) !== String(req.user._id))
    return res.status(403).json({ message: 'Admin access required' });
  req.project = project;
  next();
};

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id })
      .populate('admin', 'name email color')
      .populate('members', 'name email color')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Project name required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, description } = req.body;
      const project = await Project.create({ name, description, admin: req.user._id, members: [req.user._id] });
      await project.populate('admin members', 'name email color');
      res.status(201).json(project);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, members: req.user._id })
      .populate('admin', 'name email color')
      .populate('members', 'name email color');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (name) req.project.name = name;
    if (description !== undefined) req.project.description = description;
    await req.project.save();
    await req.project.populate('admin members', 'name email color');
    res.json(req.project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Task.deleteMany({ project: req.params.id });
    await req.project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/members', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    if (req.project.members.map(String).includes(String(userId)))
      return res.status(409).json({ message: 'User already a member' });
    req.project.members.push(userId);
    await req.project.save();
    await req.project.populate('admin members', 'name email color');
    res.json(req.project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id/members/:userId', requireAdmin, async (req, res) => {
  try {
    if (String(req.project.admin) === req.params.userId)
      return res.status(400).json({ message: 'Cannot remove the admin' });
    req.project.members = req.project.members.filter((m) => String(m) !== req.params.userId);
    await req.project.save();
    await req.project.populate('admin members', 'name email color');
    res.json(req.project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;