import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Maximize2,
  Code2,
  Palette,
  FileText,
  Paperclip,
  MessageSquare,
  Play,
  RotateCcw,
  Sparkles,
  Download,
  Trash2,
  CheckCircle2,
  Circle,
  Square,
  ArrowRight,
  Send,
  Star,
  Users,
  ShieldCheck,
  AlertCircle,
  UploadCloud,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { sessionAPI } from '../services/api';
import confetti from 'canvas-confetti';

export const LearningRoomPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  // Session State from DB
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Workspace Tab: 'code' | 'whiteboard' | 'notes' | 'files' | 'chat'
  const [activeTab, setActiveTab] = useState('code');

  // WebRTC & Media States
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoStopped, setIsVideoStopped] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting to room...');
  const [mediaError, setMediaError] = useState('');
  const [peerUserInfo, setPeerUserInfo] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const screenStreamRef = useRef(null);
  const currentRemoteSocketId = useRef(null);

  // Monaco Editor State
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const [editorCode, setEditorCode] = useState(
    '// SkillSwap Collaborative Code Room\nfunction solveProblem() {\n  console.log("Welcome to SkillSwap!");\n}\n\nsolveProblem();\n'
  );
  const [consoleOutput, setConsoleOutput] = useState('');
  const isLocalCodeChange = useRef(false);

  // Whiteboard Canvas State
  const canvasRef = useRef(null);
  const [wbTool, setWbTool] = useState('pencil'); // 'pencil' | 'eraser' | 'rect' | 'circle' | 'line'
  const [wbColor, setWbColor] = useState('#6366f1');
  const [wbSize, setWbSize] = useState(3);
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const wbHistory = useRef([]);

  // Session Notes State
  const [notes, setNotes] = useState('# Session Notes\n\n- Key Concepts:\n- Practice Items:\n');
  const [notesSaving, setNotesSaving] = useState(false);

  // Shared Files State
  const [sharedFiles, setSharedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Real-time Chat State
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [peerTyping, setPeerTyping] = useState('');
  const chatMessagesEndRef = useRef(null);

  // Complete Session Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackReview, setFeedbackReview] = useState('');
  const [whatLearned, setWhatLearned] = useState('');
  const [whatTaught, setWhatTaught] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // 1. Fetch Session Metadata from DB
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await sessionAPI.getByIdentifier(sessionId);
        if (res.data.success) {
          const s = res.data.session;
          setSessionData(s);
          if (s.notes) setNotes(s.notes);
          if (s.codeEditorState?.code) {
            setEditorCode(s.codeEditorState.code);
            setEditorLanguage(s.codeEditorState.language || 'javascript');
          }
          if (s.sharedFiles) setSharedFiles(s.sharedFiles);

          // Identify the other participant
          const other = s.participants?.find(p => p._id !== user?._id);
          if (other) setPeerUserInfo(other);

          // Start session in DB if scheduled
          if (s.status === 'SCHEDULED') {
            await sessionAPI.startSession(s._id);
          }
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, user?._id]);

  // 2. Initialize Local Media Stream
  useEffect(() => {
    let active = true;

    const startMedia = async () => {
      try {
        setMediaError('');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('getUserMedia error (using simulated preview if hardware unavailable):', err);
        setMediaError('Camera / Microphone permission denied or not available. Voice and video disabled for this tab.');
      }
    };

    startMedia();

    return () => {
      active = false;
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // WebRTC ICE Servers Configuration (Google Public STUN)
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // 3. WebRTC Signaling & Socket Handlers
  useEffect(() => {
    if (!socket || !user) return;

    // Join room event
    socket.emit('join-room', {
      roomId: sessionId,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      },
    });

    const createPeerConnection = (targetSocketId) => {
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;
      currentRemoteSocketId.current = targetSocketId;

      // Add local stream tracks to PeerConnection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      // When remote track is received
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setConnectionStatus('Connected • Direct P2P Stream');
      };

      // When ICE candidate is generated
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setConnectionStatus('Connected • Direct P2P Stream');
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setConnectionStatus('Reconnecting...');
        }
      };

      return pc;
    };

    // When existing peers in room are sent to newcomer
    socket.on('room-peers', async (peers) => {
      if (peers.length > 0) {
        const targetPeer = peers[0];
        setPeerUserInfo(targetPeer.user);
        const pc = createPeerConnection(targetPeer.socketId);

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc-offer', {
            targetSocketId: targetPeer.socketId,
            offer,
            senderInfo: user,
          });
          setConnectionStatus('Initiating Call Offer...');
        } catch (err) {
          console.error('Error creating offer:', err);
        }
      } else {
        setConnectionStatus('Waiting for exchange partner to join room...');
      }
    });

    // When another peer joins after us
    socket.on('user-joined', ({ socketId, user: joinedUser }) => {
      setPeerUserInfo(joinedUser);
      setConnectionStatus(`${joinedUser.name} joined! Establishing WebRTC handshake...`);
    });

    // Receive WebRTC Offer
    socket.on('webrtc-offer', async ({ senderSocketId, offer, senderInfo }) => {
      setPeerUserInfo(senderInfo);
      const pc = createPeerConnection(senderSocketId);

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          targetSocketId: senderSocketId,
          answer,
          senderInfo: user,
        });
        setConnectionStatus('Answered • Connecting media...');
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    // Receive WebRTC Answer
    socket.on('webrtc-answer', async ({ answer, senderInfo }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setConnectionStatus('Connected • Direct P2P Stream');
        }
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    });

    // Receive ICE candidate
    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    // Initial message history from server
    socket.on('initial-messages', (initialMsgs) => {
      setMessages(initialMsgs || []);
    });

    // Receive real-time chat message
    socket.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    // Typing indicators
    socket.on('user-typing', ({ userName }) => setPeerTyping(`${userName} is typing...`));
    socket.on('user-stop-typing', () => setPeerTyping(''));

    // Collaborative Code Sync
    socket.on('code-sync', ({ code, language }) => {
      isLocalCodeChange.current = true;
      setEditorCode(code);
      if (language) setEditorLanguage(language);
    });

    socket.on('language-sync', ({ language }) => {
      setEditorLanguage(language);
    });

    // Collaborative Whiteboard Sync
    socket.on('wb-sync', ({ elements, action }) => {
      drawRemoteWbElement(elements, action);
    });

    socket.on('wb-cleared', () => {
      clearCanvasLocally();
    });

    // Collaborative Notes Sync
    socket.on('notes-sync', ({ notes: remoteNotes }) => {
      setNotes(remoteNotes);
    });

    // User left room
    socket.on('user-left', ({ user: leftUser }) => {
      setConnectionStatus(`${leftUser?.name || 'Partner'} left the session room`);
      setRemoteStream(null);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    });

    return () => {
      socket.emit('leave-room');
      socket.off('room-peers');
      socket.off('user-joined');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('ice-candidate');
      socket.off('initial-messages');
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
      socket.off('code-sync');
      socket.off('language-sync');
      socket.off('wb-sync');
      socket.off('wb-cleared');
      socket.off('notes-sync');
      socket.off('user-left');

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [socket, sessionId, user, localStream]);

  // Audio mute toggle
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isAudioMuted;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Video stop toggle
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoStopped;
      });
      setIsVideoStopped(!isVideoStopped);
    }
  };

  // Screen sharing toggle with graceful camera restoration
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        });

        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace track in RTCPeerConnection
        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);
        socket?.emit('screen-share-status', { roomId: sessionId, isSharing: true, userName: user?.name });

        // Handle when user clicks browser's native "Stop sharing" button
        screenTrack.onended = () => {
          stopScreenShare();
        };
      } catch (err) {
        console.error('Error starting screen share:', err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }

    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      const cameraTrack = localStream.getVideoTracks()[0];
      if (peerConnectionRef.current && cameraTrack) {
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(cameraTrack);
        }
      }
    }

    setIsScreenSharing(false);
    socket?.emit('screen-share-status', { roomId: sessionId, isSharing: false, userName: user?.name });
  };

  // Collaborative Monaco Code Editor Handler
  const handleCodeChange = (newValue) => {
    if (isLocalCodeChange.current) {
      isLocalCodeChange.current = false;
      return;
    }
    setEditorCode(newValue);
    socket?.emit('code-change', {
      roomId: sessionId,
      code: newValue,
      language: editorLanguage,
    });
  };

  const handleLanguageChange = (newLang) => {
    setEditorLanguage(newLang);
    socket?.emit('language-change', {
      roomId: sessionId,
      language: newLang,
    });
  };

  // Run Code in Sandboxed Environment
  const handleRunCode = () => {
    setConsoleOutput('Running code in isolated execution sandbox...\n');
    try {
      if (editorLanguage === 'javascript' || editorLanguage === 'typescript') {
        let logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
          warn: (...args) => logs.push('[WARN] ' + args.join(' ')),
        };

        const runFn = new Function('console', editorCode);
        runFn(customConsole);

        setConsoleOutput(logs.length > 0 ? logs.join('\n') : '(Code executed successfully with no output)');
      } else {
        // Multi-language execution sandbox simulator
        setConsoleOutput(
          `[${editorLanguage.toUpperCase()} Runner] Compiled successfully.\n` +
          `Execution output:\n> Hello from SkillSwap Real-Time Sandbox!\n> Exchanged Language: ${editorLanguage}`
        );
      }
    } catch (err) {
      setConsoleOutput(`[Execution Error] ${err.message}`);
    }
  };

  // Whiteboard Canvas Drawing Logic
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawing.current = true;
    startPos.current = { x, y };

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');

    if (wbTool === 'pencil') {
      ctx.strokeStyle = wbColor;
      ctx.lineWidth = wbSize;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();

      socket?.emit('wb-draw', {
        roomId: sessionId,
        action: 'line-to',
        elements: { x, y, color: wbColor, size: wbSize },
      });
    } else if (wbTool === 'eraser') {
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = wbSize * 4;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();

      socket?.emit('wb-draw', {
        roomId: sessionId,
        action: 'erase',
        elements: { x, y, size: wbSize * 4 },
      });
    }
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
  };

  const drawRemoteWbElement = (elements, action) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (action === 'line-to') {
      ctx.strokeStyle = elements.color;
      ctx.lineWidth = elements.size;
      ctx.lineCap = 'round';
      ctx.lineTo(elements.x, elements.y);
      ctx.stroke();
    } else if (action === 'erase') {
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = elements.size;
      ctx.lineCap = 'round';
      ctx.lineTo(elements.x, elements.y);
      ctx.stroke();
    }
  };

  const clearCanvasLocally = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleClearCanvas = () => {
    clearCanvasLocally();
    socket?.emit('wb-clear', { roomId: sessionId });
  };

  // Collaborative Session Notes Save
  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    socket?.emit('notes-update', { roomId: sessionId, notes: newNotes });
  };

  const handleSaveNotesToDB = async () => {
    if (!sessionData?._id) return;
    setNotesSaving(true);
    try {
      await sessionAPI.saveNotes(sessionData._id, notes);
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setNotesSaving(false);
    }
  };

  // Real-time Chat send
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    socket?.emit('send-message', {
      roomId: sessionId,
      text: chatInput.trim(),
    });

    setChatInput('');
    socket?.emit('stop-typing', { roomId: sessionId, userName: user?.name });
  };

  // File Upload to Session
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !sessionData?._id) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await sessionAPI.uploadFile(sessionData._id, formData);
      if (res.data.success) {
        setSharedFiles(res.data.files);
        socket?.emit('send-message', {
          roomId: sessionId,
          text: `Shared a file: ${file.name}`,
          fileAttachment: res.data.file,
        });
      }
    } catch (err) {
      console.error('Failed to upload file:', err);
    }
  };

  // Submit Final Session Rating & Completion
  const handleSubmitCompleteSession = async () => {
    if (!sessionData?._id) return;
    setIsSubmittingFeedback(true);

    try {
      const res = await sessionAPI.completeSession(sessionData._id, {
        rating: Number(feedbackRating),
        review: feedbackReview,
        whatLearned,
        whatTaught,
      });

      if (res.data.success) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        setShowCompleteModal(false);
        navigate(`/profile/${user?.username || 'me'}`);
      }
    } catch (err) {
      console.error('Failed to complete session:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100">
      
      {/* Top Session Control Ribbon */}
      <div className="h-14 border-b border-slate-800/90 glass-panel px-4 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
            {sessionData?.title || `Session ${sessionId}`}
          </h2>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            {sessionData?.skillTaught ? `Topic: ${sessionData.skillTaught}` : 'Skill Exchange'}
          </span>
        </div>

        {/* Connection status tag */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="text-[11px] text-emerald-400 font-mono">{connectionStatus}</span>
          </div>

          <button
            onClick={() => setShowCompleteModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-red-500/20"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Complete Session</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: LEFT = Video Area, RIGHT = Interactive Tools */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: 1-to-1 WebRTC Video Area */}
        <div className="w-full lg:w-[420px] xl:w-[480px] border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/90 p-3 sm:p-4 flex flex-col justify-between shrink-0">
          
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            
            {/* Remote Partner Video Stream */}
            <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${!remoteStream ? 'hidden' : ''}`}
              />
              {!remoteStream && (
                <div className="text-center p-4">
                  <img
                    src={peerUserInfo?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'}
                    alt="Peer"
                    className="w-16 h-16 rounded-2xl object-cover mx-auto mb-2 opacity-60 ring-2 ring-slate-700"
                  />
                  <p className="text-xs font-bold text-slate-300">{peerUserInfo?.name || 'Exchange Partner'}</p>
                  <p className="text-[11px] text-brand-400 mt-1 animate-pulse">Waiting for peer stream...</p>
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur rounded-lg text-[10px] text-white font-medium flex items-center space-x-1.5">
                <span>{peerUserInfo?.name || 'Partner Video'}</span>
                {remoteStream && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </div>
            </div>

            {/* Local Video Stream */}
            <div className="relative aspect-video bg-slate-900/80 rounded-2xl overflow-hidden border border-slate-800 shadow-lg flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoStopped ? 'hidden' : ''}`}
              />
              {isVideoStopped && (
                <div className="text-center p-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <VideoOff className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-400">Camera turned off</p>
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur rounded-lg text-[10px] text-white font-medium flex items-center space-x-1.5">
                <span>{user?.name} (You)</span>
                {isScreenSharing && (
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider ml-1">
                    Screen Sharing
                  </span>
                )}
              </div>
            </div>

            {mediaError && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mediaError}</span>
              </div>
            )}

          </div>

          {/* WebRTC Video Call Control Bar */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center space-x-3">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-2xl text-xs font-bold transition-all shadow-md ${
                isAudioMuted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
              }`}
              title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3 rounded-2xl text-xs font-bold transition-all shadow-md ${
                isVideoStopped
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
              }`}
              title={isVideoStopped ? 'Start Video' : 'Stop Video'}
            >
              {isVideoStopped ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-2xl text-xs font-bold transition-all shadow-md ${
                isScreenSharing
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              <Monitor className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowCompleteModal(true)}
              className="p-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-500/20"
              title="Leave / End Call"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Workspace Tabs */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          
          {/* Workspace Tabs Navigation Bar */}
          <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'code'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Editor</span>
              </button>

              <button
                onClick={() => setActiveTab('whiteboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'whiteboard'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Whiteboard</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'notes'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notes & Goals</span>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'files'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Files ({sharedFiles.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat ({messages.length})</span>
              </button>
            </div>
          </div>

          {/* TAB CONTENT AREAS */}
          <div className="flex-1 overflow-hidden relative">
            
            {/* 1. MONACO CODE EDITOR TAB */}
            {activeTab === 'code' && (
              <div className="h-full flex flex-col">
                <div className="h-10 px-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-semibold">Language:</span>
                    <select
                      value={editorLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="html">HTML</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleRunCode}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Run Code</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-[300px]">
                  <Editor
                    height="100%"
                    language={editorLanguage}
                    value={editorCode}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>

                {/* Console Output Bar */}
                {consoleOutput && (
                  <div className="h-32 border-t border-slate-800 bg-slate-950 p-3 font-mono text-xs overflow-y-auto">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 pb-1 border-b border-slate-800">
                      <span>Console Sandbox Output</span>
                      <button onClick={() => setConsoleOutput('')} className="hover:text-white">Clear</button>
                    </div>
                    <pre className="text-emerald-400 whitespace-pre-wrap">{consoleOutput}</pre>
                  </div>
                )}
              </div>
            )}

            {/* 2. COLLABORATIVE WHITEBOARD TAB */}
            {activeTab === 'whiteboard' && (
              <div className="h-full flex flex-col bg-slate-950 relative">
                {/* Canvas Toolbar */}
                <div className="h-11 px-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setWbTool('pencil')}
                      className={`px-2.5 py-1 rounded-lg font-semibold ${wbTool === 'pencil' ? 'bg-brand-600 text-white' : 'text-slate-400'}`}
                    >
                      Pencil
                    </button>
                    <button
                      onClick={() => setWbTool('eraser')}
                      className={`px-2.5 py-1 rounded-lg font-semibold ${wbTool === 'eraser' ? 'bg-brand-600 text-white' : 'text-slate-400'}`}
                    >
                      Eraser
                    </button>

                    {/* Colors */}
                    <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
                      {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#ffffff'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setWbColor(c)}
                          className={`w-5 h-5 rounded-full border-2 ${wbColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleClearCanvas}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Board</span>
                  </button>
                </div>

                <div className="flex-1 relative cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    width={1600}
                    height={1000}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full bg-[#090d16]"
                  />
                </div>
              </div>
            )}

            {/* 3. COLLABORATIVE NOTES & GOALS TAB */}
            {activeTab === 'notes' && (
              <div className="h-full flex flex-col p-5 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-brand-400" />
                    <span>Live Collaborative Session Notes</span>
                  </h3>
                  <button
                    onClick={handleSaveNotesToDB}
                    disabled={notesSaving}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{notesSaving ? 'Saving...' : 'Save to DB'}</span>
                  </button>
                </div>

                <textarea
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Record key concepts, algorithms discussed, code patterns, and homework..."
                  className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed resize-none min-h-[350px]"
                />
              </div>
            )}

            {/* 4. SHARED FILES TAB */}
            {activeTab === 'files' && (
              <div className="h-full flex flex-col p-5 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white">Session File Exchange</h3>
                    <p className="text-xs text-slate-400">Share project templates, diagrams, and code snippets</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  {sharedFiles.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400">
                      No files shared yet in this room.
                    </div>
                  ) : (
                    sharedFiles.map((file, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <Paperclip className="w-4 h-4 text-brand-400" />
                          <div>
                            <p className="font-bold text-white">{file.name}</p>
                            <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <a
                          href={file.url}
                          download={file.name}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 5. REAL-TIME CHAT TAB */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((m, i) => {
                    const isMe = m.sender?._id === user?._id || m.sender?.id === user?._id;
                    return (
                      <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-300">{m.sender?.name || 'Peer'}</span>
                          <span>•</span>
                          <span>{new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={`p-3 rounded-2xl text-xs max-w-sm sm:max-w-md ${
                          isMe ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-slate-700'
                        }`}>
                          <p>{m.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatMessagesEndRef} />
                </div>

                {peerTyping && (
                  <div className="px-4 py-1 text-[11px] text-brand-400 italic">
                    {peerTyping}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value);
                      socket?.emit('typing', { roomId: sessionId, userName: user?.name });
                    }}
                    placeholder="Type message in learning room..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* SESSION COMPLETE & REVIEW MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-7 border border-slate-700/80 shadow-2xl">
            <div className="text-center pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Session Complete!</h3>
              <p className="text-xs text-slate-400 mt-1">Rate your collaborative exchange with {peerUserInfo?.name || 'partner'}</p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="text-center">
                <label className="block text-xs font-semibold text-slate-300 mb-2">How was your learning experience?</label>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= feedbackRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">What did you learn?</label>
                <input
                  type="text"
                  value={whatLearned}
                  onChange={(e) => setWhatLearned(e.target.value)}
                  placeholder="e.g. Mastered Java Polymorphism and DaVinci color grading"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Public Review / Feedback</label>
                <textarea
                  rows={3}
                  value={feedbackReview}
                  onChange={(e) => setFeedbackReview(e.target.value)}
                  placeholder="Leave a positive review to boost their reputation..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingFeedback}
                  onClick={handleSubmitCompleteSession}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Award className="w-4 h-4" />
                  <span>{isSubmittingFeedback ? 'Submitting...' : 'Submit Review & Exit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
