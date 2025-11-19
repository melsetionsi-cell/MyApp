const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all tasks for authenticated user with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { createdBy: req.user._id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const tasks = await Task.find(filter)
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTasks: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task'
    });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, tags } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const task = new Task({
      title: title.trim(),
      description: description?.trim() || '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags || [],
      createdBy: req.user._id
    });

    await task.save();

    // Populate user info if needed
    await task.populate('createdBy', 'username email avatar');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating task'
    });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    // Find task and verify ownership
    let task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update fields
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags !== undefined) task.tags = tags;

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task'
    });
  }
});

// Get task statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $match: { createdBy: req.user._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      total: 0,
      pending: 0,
      'in-progress': 0,
      completed: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    // Get upcoming tasks (due in next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingTasks = await Task.countDocuments({
      createdBy: req.user._id,
      dueDate: { 
        $gte: new Date(), 
        $lte: nextWeek 
      },
      status: { $ne: 'completed' }
    });

    formattedStats.upcoming = upcomingTasks;

    res.json({
      success: true,
      stats: formattedStats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// Bulk update tasks (for drag & drop functionality)
router.patch('/bulk-update', auth, async (req, res) => {
  try {
    const { taskIds, updates } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task IDs are required'
      });
    }

    const result = await Task.updateMany(
      {
        _id: { $in: taskIds },
        createdBy: req.user._id
      },
      { $set: updates }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} tasks updated successfully`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk update'
    });
  }
});

module.exports = router;