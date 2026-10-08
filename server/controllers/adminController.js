import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { ExchangeRequest } from '../models/ExchangeRequest.js';
import { LearningContract } from '../models/LearningContract.js';
import { Report } from '../models/Report.js';
import { Skill } from '../models/Skill.js';

// @desc Get Admin analytics & overview
// @route GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalSessions,
      completedSessions,
      totalExchanges,
      activeContracts,
      pendingReports
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'ACTIVE' }),
      Session.countDocuments(),
      Session.countDocuments({ status: 'COMPLETED' }),
      ExchangeRequest.countDocuments(),
      LearningContract.countDocuments({ status: 'ACTIVE' }),
      Report.countDocuments({ status: 'PENDING' })
    ]);

    const completionRate = totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 88;

    // Top traded skills aggregation
    const popularSkills = await Skill.find().sort({ popularity: -1 }).limit(6);

    // Mock trend activity for the past 7 days chart
    const dailyActivity = [
      { day: 'Mon', sessions: 18, exchanges: 24, newUsers: 12 },
      { day: 'Tue', sessions: 25, exchanges: 31, newUsers: 15 },
      { day: 'Wed', sessions: 32, exchanges: 28, newUsers: 19 },
      { day: 'Thu', sessions: 29, exchanges: 35, newUsers: 22 },
      { day: 'Fri', sessions: 42, exchanges: 40, newUsers: 28 },
      { day: 'Sat', sessions: 48, exchanges: 52, newUsers: 34 },
      { day: 'Sun', sessions: 54, exchanges: 61, newUsers: 41 }
    ];

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalSessions,
        completedSessions,
        completionRate,
        totalExchanges,
        activeContracts,
        pendingReports
      },
      popularSkills,
      dailyActivity
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all users for admin table
// @route GET /api/admin/users
export const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Suspend or Activate user
// @route PUT /api/admin/users/:id/status
export const toggleUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get reports
// @route GET /api/admin/reports
export const getAdminReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name username email')
      .populate('reportedUser', 'name username email avatar status')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reports });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Resolve report
// @route PUT /api/admin/reports/:id
export const resolveReport = async (req, res) => {
  try {
    const { status, resolutionNotes, actionTaken } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status || 'RESOLVED';
    report.resolutionNotes = resolutionNotes || '';
    report.actionTaken = actionTaken || 'NONE';
    await report.save();

    if (actionTaken === 'SUSPENDED') {
      await User.findByIdAndUpdate(report.reportedUser, { status: 'SUSPENDED' });
    }

    return res.status(200).json({ success: true, report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
