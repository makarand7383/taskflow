const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const getProject = async (projectId, userId) => {
  return Project.findOne({ _id: projectId, members: userId });
};

router.get('/dashboard', async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id });
    const projectIds = projects.map((p) => p._id);

    const [total, todo, inprogress, done, overdue] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'todo' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'inprogress' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'done' }),
      Task.countDocuments({ project: { $in: projectIds }, status: { $ne: 'done' }, dueDate: { $lt: new Date() } }),
    ]);

    const tasksByUser = await Task.aggregate([
      { $match: { project: { $in: projectIds }, assignee: { $ne: null } } },
      { $group: { _id: '$assignee', count: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } } } },
    ]);

    res.json({ total, todo, inprogress, done, overdue, tasksByUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = {};

    if (projectId) {
      const project = await getProject(projectId, req.user._id);
      if (!project) return res.status(403).json({ message: 'Not a project member' });
      query.project = projectId;
    } else {
      query.assignee = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email color')
      .populate('createdBy', 'name email color')
      .populate('project', 'name')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('projectId').notEmpty().withMessage('Project ID required'),
    body('dueDate').isISO8601().withMessage('Valid due date required'),
    body('priority').optional().isIn(['low', 'medium', 'high']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, description, projectId, dueDate, priority, assigneeId, status } = req.body;

      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      if (String(project.admin) !== String(req.user._id))
        return res.status(403).json({ message: 'Only project admin can create tasks' });

      const task = await Task.create({
        title, description, dueDate, priority, status,
        project: projectId,
        assignee: assigneeId || null,
        createdBy: req.user._id,
      });

      await task.populate('assignee createdBy', 'name email color');
      await task.populate('project', 'name');
      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAdmin = String(task.project.admin) === String(req.user._id);
    const isAssignee = String(task.assignee) === String(req.user._id);

    if (!isAdmin && !isAssignee)
      return res.status(403).json({ message: 'Access denied' });

    if (isAdmin) {
      const { title, description, dueDate, priority, assigneeId, status } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate) task.dueDate = dueDate;
      if (priority) task.priority = priority;
      if (assigneeId !== undefined) task.assignee = assigneeId || null;
      if (status) task.status = status;
    } else {
      if (req.body.status) task.status = req.body.status;
    }

    await task.save();
    await task.populate('assignee createdBy', 'name email color');
    await task.populate('project', 'name');
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.project.admin) !== String(req.user._id))
      return res.status(403).json({ message: 'Only admin can delete tasks' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;