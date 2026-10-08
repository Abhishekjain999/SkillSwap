import { Session } from '../models/Session.js';
import { LearningContract } from '../models/LearningContract.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { Notification } from '../models/Notification.js';

// @desc Create a new session
// @route POST /api/sessions
export const createSession = async (req, res) => {
  try {
    const {
      title,
      description,
      contractId,
      participantId,
      skillTaught,
      scheduledStartTime,
      durationMinutes = 60
    } = req.body;

    if (!title || !participantId || !skillTaught || !scheduledStartTime) {
      return res.status(400).json({
        success: false,
        message: 'Title, participant, skill, and scheduled start time are required'
      });
    }

    const start = new Date(scheduledStartTime);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    const roomCode = `SWAP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const session = await Session.create({
      title,
      description,
      contract: contractId || null,
      participants: [req.user._id, participantId],
      host: req.user._id,
      skillTaught,
      scheduledStartTime: start,
      scheduledEndTime: end,
      durationMinutes,
      status: 'SCHEDULED',
      roomCode
    });

    // Notify other participant
    await Notification.create({
      recipient: participantId,
      sender: req.user._id,
      type: 'UPCOMING_SESSION',
      title: 'New Session Scheduled 📅',
      message: `${req.user.name} scheduled "${title}" on ${start.toLocaleDateString()}.`,
      link: `/session/${roomCode}`
    });

    const populated = await Session.findById(session._id)
      .populate('participants', 'name username avatar headline ratings')
      .populate('host', 'name username avatar');

    return res.status(201).json({
      success: true,
      session: populated
    });
  } catch (error) {
    console.error('Create Session Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating session'
    });
  }
};

// @desc Get sessions for user
// @route GET /api/sessions
export const getMySessions = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      participants: req.user._id
    };

    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate('participants', 'name username avatar headline ratings')
      .populate('host', 'name username avatar')
      .populate('contract')
      .sort({ scheduledStartTime: 1 });

    return res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Get session by roomCode or ID
// @route GET /api/sessions/:identifier
export const getSessionByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    let session;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      session = await Session.findById(identifier);
    } else {
      session = await Session.findOne({ roomCode: identifier.toUpperCase() });
    }

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session room not found' });
    }

    const populated = await Session.findById(session._id)
      .populate('participants', 'name username avatar headline ratings')
      .populate('host', 'name username avatar')
      .populate('contract')
      .populate('sharedFiles.uploader', 'name username avatar');

    return res.status(200).json({
      success: true,
      session: populated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Update session status to ACTIVE
// @route PUT /api/sessions/:id/start
export const startSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.status = 'ACTIVE';
    if (!session.actualStartTime) {
      session.actualStartTime = new Date();
    }
    await session.save();

    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Complete session with review & feedback
// @route POST /api/sessions/:id/complete
export const completeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating = 5, review = '', whatLearned = '', whatTaught = '', goalsCompleted = [] } = req.body;

    const session = await Session.findById(id).populate('participants');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.status = 'COMPLETED';
    session.actualEndTime = new Date();

    // Identify partner
    const partner = session.participants.find(
      p => p._id.toString() !== req.user._id.toString()
    );

    // Save session feedback entry
    session.feedback.push({
      user: req.user._id,
      role: session.host.toString() === req.user._id.toString() ? 'TEACHER' : 'STUDENT',
      rating,
      review,
      whatLearned,
      whatTaught,
      goalsCompleted,
      submittedAt: new Date()
    });

    await session.save();

    // If partner exists, record formal review & update partner's reputation
    if (partner) {
      const isTeacher = session.host.toString() === partner._id.toString();
      await Review.create({
        session: session._id,
        contract: session.contract,
        reviewer: req.user._id,
        reviewee: partner._id,
        role: isTeacher ? 'TEACHER' : 'STUDENT',
        skill: session.skillTaught,
        rating,
        feedback: review || 'Great collaborative learning exchange!',
        communicationScore: 5,
        reliabilityScore: 5
      });

      // Update partner rating in DB
      const partnerUser = await User.findById(partner._id);
      if (partnerUser) {
        partnerUser.ratings.sessionsCompleted += 1;
        partnerUser.ratings.reviewsCount += 1;
        const currentScore = isTeacher ? partnerUser.ratings.teaching : partnerUser.ratings.learning;
        const newScore = parseFloat(((currentScore * (partnerUser.ratings.reviewsCount - 1) + rating) / partnerUser.ratings.reviewsCount).toFixed(1));
        
        if (isTeacher) {
          partnerUser.ratings.teaching = newScore;
        } else {
          partnerUser.ratings.learning = newScore;
        }

        // Award Top Mentor badge if reached threshold
        if (partnerUser.ratings.sessionsCompleted >= 5 && partnerUser.ratings.teaching >= 4.8) {
          const hasBadge = partnerUser.badges.some(b => b.name === 'Top Mentor');
          if (!hasBadge) {
            partnerUser.badges.push({
              id: 'top-mentor',
              name: 'Top Mentor',
              icon: '🏆',
              description: 'Completed 5+ sessions with a 4.8+ teaching rating'
            });
          }
        }

        await partnerUser.save({ validateBeforeSave: false });

        await Notification.create({
          recipient: partner._id,
          sender: req.user._id,
          type: 'REVIEW_RECEIVED',
          title: 'New Review Received! ⭐',
          message: `${req.user.name} rated your session ${rating} stars!`,
          link: `/profile/${partnerUser.username}`
        });
      }

      // Also increment current user's completed sessions
      const currentUserDoc = await User.findById(req.user._id);
      if (currentUserDoc) {
        currentUserDoc.ratings.sessionsCompleted += 1;
        currentUserDoc.streakDays += 1;
        await currentUserDoc.save({ validateBeforeSave: false });
      }
    }

    // Update contract completedSessions count if attached
    if (session.contract) {
      await LearningContract.findByIdAndUpdate(session.contract, {
        $inc: { completedSessions: 1 }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Session completed and feedback recorded',
      session
    });
  } catch (error) {
    console.error('Complete Session Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error completing session'
    });
  }
};

// @desc Save session notes
// @route PUT /api/sessions/:id/notes
export const saveNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { notes },
      { new: true }
    );
    return res.status(200).json({ success: true, notes: session.notes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Save session code
// @route PUT /api/sessions/:id/code
export const saveCode = async (req, res) => {
  try {
    const { language, code } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { codeEditorState: { language, code } },
      { new: true }
    );
    return res.status(200).json({ success: true, codeState: session.codeEditorState });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Upload file to session
// @route POST /api/sessions/:id/files
export const uploadSessionFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const fileData = {
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      type: req.file.mimetype,
      uploader: req.user._id,
      uploadedAt: new Date()
    };

    session.sharedFiles.push(fileData);
    await session.save();

    const populated = await Session.findById(session._id)
      .populate('sharedFiles.uploader', 'name username avatar');

    return res.status(201).json({
      success: true,
      files: populated.sharedFiles,
      file: fileData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
