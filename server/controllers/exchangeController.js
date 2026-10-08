import { ExchangeRequest } from '../models/ExchangeRequest.js';
import { LearningContract } from '../models/LearningContract.js';
import { Session } from '../models/Session.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

// @desc Create a new exchange request
// @route POST /api/exchanges
export const createExchangeRequest = async (req, res) => {
  try {
    const {
      receiverId,
      teachingSkill,
      learningSkill,
      message,
      proposedSessions = 4,
      proposedDurationMinutes = 60,
      learningGoals = []
    } = req.body;

    if (!receiverId || !teachingSkill || !learningSkill || !message) {
      return res.status(400).json({
        success: false,
        message: 'Receiver, teaching skill, learning skill, and message are required'
      });
    }

    if (receiverId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot request a skill swap with yourself'
      });
    }

    // Check for existing pending request
    const existing = await ExchangeRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: { $in: ['PENDING', 'COUNTERED', 'IN_PROGRESS'] }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active or pending exchange request with this member'
      });
    }

    const request = await ExchangeRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      teachingSkill,
      learningSkill,
      message,
      proposedSessions,
      proposedDurationMinutes,
      learningGoals,
      status: 'PENDING',
      statusHistory: [{
        status: 'PENDING',
        changedBy: req.user._id,
        note: 'Request initialized'
      }]
    });

    // Notify receiver
    await Notification.create({
      recipient: receiverId,
      sender: req.user._id,
      type: 'EXCHANGE_REQUEST',
      title: 'New Skill Exchange Request! 🎉',
      message: `${req.user.name} wants to swap: teaches "${teachingSkill}" for "${learningSkill}".`,
      link: `/exchanges`
    });

    const populated = await ExchangeRequest.findById(request._id)
      .populate('sender', 'name username avatar headline ratings')
      .populate('receiver', 'name username avatar headline ratings');

    return res.status(201).json({
      success: true,
      request: populated
    });
  } catch (error) {
    console.error('Create Exchange Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating exchange request'
    });
  }
};

// @desc Get exchanges for current user
// @route GET /api/exchanges
export const getMyExchanges = async (req, res) => {
  try {
    const { status, type } = req.query; // type: 'received' | 'sent' | 'all'
    const query = {};

    if (type === 'received') {
      query.receiver = req.user._id;
    } else if (type === 'sent') {
      query.sender = req.user._id;
    } else {
      query.$or = [{ sender: req.user._id }, { receiver: req.user._id }];
    }

    if (status) {
      query.status = status;
    }

    const requests = await ExchangeRequest.find(query)
      .populate('sender', 'name username avatar headline ratings')
      .populate('receiver', 'name username avatar headline ratings')
      .populate('createdContract')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Update exchange request status (Accept / Reject / Cancel)
// @route PUT /api/exchanges/:id/status
export const updateExchangeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const request = await ExchangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Exchange request not found' });
    }

    const isSender = request.sender.toString() === req.user._id.toString();
    const isReceiver = request.receiver.toString() === req.user._id.toString();

    if (!isSender && !isReceiver) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this request' });
    }

    if (status === 'ACCEPTED') {
      request.status = 'ACCEPTED';
      request.statusHistory.push({
        status: 'ACCEPTED',
        changedBy: req.user._id,
        note: note || 'Exchange accepted'
      });

      // Automatically instantiate LearningContract
      const goalsList = request.learningGoals && request.learningGoals.length > 0
        ? request.learningGoals.map(g => ({ title: g, completed: false }))
        : [
            { title: `Core fundamentals of ${request.learningSkill}` },
            { title: `Hands-on practical walkthroughs in ${request.teachingSkill}` },
            { title: `Real-world project implementation and review` }
          ];

      const contract = await LearningContract.create({
        exchangeRequest: request._id,
        userA: request.sender,
        userB: request.receiver,
        skillA: request.teachingSkill,
        skillB: request.learningSkill,
        totalSessions: request.proposedSessions || 4,
        completedSessions: 0,
        sessionDurationMinutes: request.proposedDurationMinutes || 60,
        goals: goalsList,
        status: 'ACTIVE',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      request.createdContract = contract._id;
      await request.save();

      // Automatically generate the 1st scheduled session so they can immediately launch room!
      const scheduledTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      const endTime = new Date(scheduledTime.getTime() + (request.proposedDurationMinutes || 60) * 60 * 1000);
      const roomCode = `SWAP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      await Session.create({
        title: `Kickoff: ${request.teachingSkill} ⇄ ${request.learningSkill} Swap`,
        description: `Session 1 of contract for ${request.teachingSkill} and ${request.learningSkill}`,
        contract: contract._id,
        participants: [request.sender, request.receiver],
        host: req.user._id,
        skillTaught: request.teachingSkill,
        scheduledStartTime: scheduledTime,
        scheduledEndTime: endTime,
        durationMinutes: request.proposedDurationMinutes || 60,
        status: 'SCHEDULED',
        roomCode
      });

      // Notify the other user
      const otherUserId = isSender ? request.receiver : request.sender;
      await Notification.create({
        recipient: otherUserId,
        sender: req.user._id,
        type: 'REQUEST_ACCEPTED',
        title: 'Exchange Accepted! 🚀',
        message: `${req.user.name} accepted your skill exchange request! Your learning contract is active.`,
        link: `/sessions`
      });

      const updated = await ExchangeRequest.findById(request._id)
        .populate('sender', 'name username avatar')
        .populate('receiver', 'name username avatar')
        .populate('createdContract');

      return res.status(200).json({
        success: true,
        message: 'Exchange accepted and Learning Contract generated!',
        request: updated,
        contract
      });
    }

    if (status === 'REJECTED') {
      request.status = 'REJECTED';
      request.statusHistory.push({
        status: 'REJECTED',
        changedBy: req.user._id,
        note: note || 'Exchange declined'
      });
      await request.save();

      const otherUserId = isSender ? request.receiver : request.sender;
      await Notification.create({
        recipient: otherUserId,
        sender: req.user._id,
        type: 'REQUEST_REJECTED',
        title: 'Exchange Request Update',
        message: `${req.user.name} declined the skill exchange proposal.`,
        link: `/exchanges`
      });

      return res.status(200).json({ success: true, request });
    }

    if (status === 'CANCELLED') {
      request.status = 'CANCELLED';
      request.statusHistory.push({
        status: 'CANCELLED',
        changedBy: req.user._id,
        note: note || 'Cancelled by user'
      });
      await request.save();
      return res.status(200).json({ success: true, request });
    }

    return res.status(400).json({ success: false, message: 'Invalid status update action' });
  } catch (error) {
    console.error('Update Exchange Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating status'
    });
  }
};

// @desc Submit Counter Offer
// @route POST /api/exchanges/:id/counter
export const counterOfferExchange = async (req, res) => {
  try {
    const { id } = req.params;
    const { skillToTeach, skillToLearn, sessions, durationMinutes, schedule, goals, message } = req.body;

    const request = await ExchangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    }

    request.status = 'COUNTERED';
    request.counterOffer = {
      skillToTeach: skillToTeach || request.teachingSkill,
      skillToLearn: skillToLearn || request.learningSkill,
      sessions: sessions || request.proposedSessions,
      durationMinutes: durationMinutes || request.proposedDurationMinutes,
      schedule: schedule || '',
      goals: goals || [],
      message: message || 'Proposed alternate exchange terms',
      counteredBy: req.user._id,
      counteredAt: new Date()
    };

    request.statusHistory.push({
      status: 'COUNTERED',
      changedBy: req.user._id,
      note: message || 'Counter offer submitted'
    });

    await request.save();

    const otherUserId = request.sender.toString() === req.user._id.toString()
      ? request.receiver
      : request.sender;

    await Notification.create({
      recipient: otherUserId,
      sender: req.user._id,
      type: 'COUNTER_OFFER',
      title: 'Counter Offer Received 🔄',
      message: `${req.user.name} submitted a counter offer with adjusted exchange terms.`,
      link: `/exchanges`
    });

    const updated = await ExchangeRequest.findById(request._id)
      .populate('sender', 'name username avatar')
      .populate('receiver', 'name username avatar');

    return res.status(200).json({
      success: true,
      message: 'Counter offer submitted',
      request: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
