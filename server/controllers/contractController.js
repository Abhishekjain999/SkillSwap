import { LearningContract } from '../models/LearningContract.js';

// @desc Get user contracts
// @route GET /api/contracts
export const getMyContracts = async (req, res) => {
  try {
    const contracts = await LearningContract.find({
      $or: [{ userA: req.user._id }, { userB: req.user._id }]
    })
      .populate('userA', 'name username avatar headline ratings')
      .populate('userB', 'name username avatar headline ratings')
      .populate('exchangeRequest')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      contracts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Get contract by ID
// @route GET /api/contracts/:id
export const getContractById = async (req, res) => {
  try {
    const contract = await LearningContract.findById(req.params.id)
      .populate('userA', 'name username avatar headline ratings')
      .populate('userB', 'name username avatar headline ratings')
      .populate('exchangeRequest');

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    return res.status(200).json({
      success: true,
      contract
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Toggle goal completion
// @route PUT /api/contracts/:id/goals/:goalId
export const toggleContractGoal = async (req, res) => {
  try {
    const { id, goalId } = req.params;
    const contract = await LearningContract.findById(id);

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    const goal = contract.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    goal.completed = !goal.completed;
    goal.completedAt = goal.completed ? new Date() : null;
    goal.completedBy = goal.completed ? req.user._id : null;

    await contract.save();

    return res.status(200).json({
      success: true,
      contract
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
