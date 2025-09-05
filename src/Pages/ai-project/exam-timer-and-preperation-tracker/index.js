import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, Plus, X, BookOpen, Brain, Calendar, MessageCircle } from 'lucide-react';

const ExamPrepApp = () => {
  // Timer states
  const [timers, setTimers] = useState([]);
  const [nextTimerId, setNextTimerId] = useState(1);
  
  // Study tracking states
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Physics', totalHours: 0, targetHours: 50, sessions: [], color: '#6a2bff' },
    { id: 2, name: 'Chemistry', totalHours: 0, targetHours: 40, sessions: [], color: '#0b76ef' },
    { id: 3, name: 'Mathematics', totalHours: 0, targetHours: 60, sessions: [], color: '#6a2bff' }
  ]);
  
  const [studyLogs, setStudyLogs] = useState([]);
  const [currentView, setCurrentView] = useState('timer');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiFeature, setAIFeature] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // AI states
  const [questionText, setQuestionText] = useState('');
  const [difficultyResult, setDifficultyResult] = useState('');
  const [examDate, setExamDate] = useState('');
  const [studyPlan, setStudyPlan] = useState('');
  const [dailyLog, setDailyLog] = useState('');
  const [motivationMessage, setMotivationMessage] = useState('');

  // hide the left profile/cover used in the main site layout to make this page minimal
  useEffect(() => {
    const appRoot = document.getElementById('app-root');
    if (appRoot) appRoot.classList.add('hide-profile');
    return () => { if (appRoot) appRoot.classList.remove('hide-profile'); };
  }, []);

  // Timer functionality
  const addTimer = () => {
    const newTimer = {
      id: nextTimerId,
      duration: 25 * 60, // 25 minutes default
      remaining: 25 * 60,
      isRunning: false,
      subject: 'General Study',
      customDuration: 25
    };
    setTimers([...timers, newTimer]);
    setNextTimerId(nextTimerId + 1);
  };

  const updateTimer = (id, updates) => {
    setTimers(timers.map(timer => 
      timer.id === id ? { ...timer, ...updates } : timer
    ));
  };

  const deleteTimer = (id) => {
    setTimers(timers.filter(timer => timer.id !== id));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer component
  const TimerCard = ({ timer }) => {
    const intervalRef = useRef(null);

    useEffect(() => {
      if (timer.isRunning && timer.remaining > 0) {
        intervalRef.current = setInterval(() => {
          updateTimer(timer.id, { remaining: timer.remaining - 1 });
        }, 1000);
      } else if (timer.remaining === 0) {
        updateTimer(timer.id, { isRunning: false });
        alert(`Time's up for ${timer.subject}!`);
      } else {
        clearInterval(intervalRef.current);
      }

      return () => clearInterval(intervalRef.current);
    }, [timer.isRunning, timer.remaining]);

    const toggleTimer = () => {
      updateTimer(timer.id, { isRunning: !timer.isRunning });
    };

    const resetTimer = () => {
      updateTimer(timer.id, { 
        remaining: timer.duration, 
        isRunning: false 
      });
    };

    const setDuration = (minutes) => {
      const seconds = minutes * 60;
      updateTimer(timer.id, { 
        duration: seconds, 
        remaining: seconds,
        customDuration: minutes,
        isRunning: false
      });
    };

    return (
      <div style={{ marginTop: 12, padding: 16, border: '1px solid #e6e9ee', borderRadius: 8, background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>{timer.subject}</div>
            <div style={{ fontSize: 28, fontFamily: 'monospace', fontWeight: 'bold', color: '#6a2bff' }}>
              {formatTime(timer.remaining)}
            </div>
          </div>
          <button
            onClick={() => deleteTimer(timer.id)}
            style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <input
            type="number"
            value={timer.customDuration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
            style={{ width: 60, padding: '4px 8px', border: '1px solid #e6e9ee', borderRadius: 4, fontSize: 14 }}
            min="1"
            max="180"
          />
          <span style={{ fontSize: 12, color: '#666' }}>minutes</span>
        </div>
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            onClick={toggleTimer}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', 
              borderRadius: 6, border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              background: timer.isRunning ? '#ef4444' : '#6a2bff', color: '#fff' 
            }}
          >
            {timer.isRunning ? <Pause size={14} /> : <Play size={14} />}
            {timer.isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', 
              borderRadius: 6, border: '1px solid #ddd', background: '#fff', fontSize: 14, cursor: 'pointer' 
            }}
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
        
        <select
          value={timer.subject}
          onChange={(e) => updateTimer(timer.id, { subject: e.target.value })}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6e9ee', borderRadius: 6, fontSize: 14 }}
        >
          <option value="General Study">General Study</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.name}>{subject.name}</option>
          ))}
        </select>
      </div>
    );
  };

  // Add subject functionality
  const addSubject = (name, targetHours, color) => {
    const newSubject = {
      id: Date.now(),
      name,
      totalHours: 0,
      targetHours: parseInt(targetHours),
      sessions: [],
      color
    };
    setSubjects([...subjects, newSubject]);
    setShowAddSubject(false);
  };

  // Add study session
  const addStudySession = (subjectId, hours, topic, notes) => {
    const session = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      hours: parseFloat(hours),
      topic,
      notes,
      timestamp: new Date()
    };
    
    setSubjects(subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          totalHours: subject.totalHours + session.hours,
          sessions: [...subject.sessions, session]
        };
      }
      return subject;
    }));
    
    setStudyLogs([...studyLogs, { ...session, subject: subjects.find(s => s.id === subjectId)?.name }]);
    setShowAddSession(false);
  };

  // AI Functions
  const analyzeDifficulty = () => {
    const keywords = {
      easy: ['basic', 'simple', 'define', 'what is', 'list', 'identify'],
      medium: ['explain', 'describe', 'compare', 'analyze', 'calculate', 'solve'],
      hard: ['evaluate', 'synthesize', 'derive', 'prove', 'optimize', 'complex']
    };
    
    const text = questionText.toLowerCase();
    let hardCount = 0, mediumCount = 0, easyCount = 0;
    
    keywords.hard.forEach(word => {
      if (text.includes(word)) hardCount++;
    });
    keywords.medium.forEach(word => {
      if (text.includes(word)) mediumCount++;
    });
    keywords.easy.forEach(word => {
      if (text.includes(word)) easyCount++;
    });
    
    let difficulty = 'Medium';
    if (hardCount > mediumCount && hardCount > easyCount) difficulty = 'Hard';
    else if (easyCount > hardCount && easyCount > mediumCount) difficulty = 'Easy';
    
    setDifficultyResult(`Difficulty: ${difficulty}\nAnalysis: Based on keywords and complexity indicators in your question.`);
  };

  const generateStudyPlan = () => {
    if (!examDate) {
      setStudyPlan('Please set an exam date first.');
      return;
    }
    
    const today = new Date();
    const exam = new Date(examDate);
    const daysLeft = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) {
      setStudyPlan('Exam date has passed or is today!');
      return;
    }
    
    const totalTargetHours = subjects.reduce((sum, subject) => sum + subject.targetHours, 0);
    const totalCompletedHours = subjects.reduce((sum, subject) => sum + subject.totalHours, 0);
    const remainingHours = totalTargetHours - totalCompletedHours;
    const hoursPerDay = Math.ceil(remainingHours / daysLeft);
    
    let plan = `📅 Study Plan (${daysLeft} days remaining)\n\n`;
    plan += `⏰ Recommended: ${hoursPerDay} hours/day\n`;
    plan += `📊 Progress: ${Math.round((totalCompletedHours / totalTargetHours) * 100)}% complete\n\n`;
    
    plan += `📚 Subject Breakdown:\n`;
    subjects.forEach(subject => {
      const remaining = subject.targetHours - subject.totalHours;
      const dailyHours = Math.ceil(remaining / daysLeft);
      plan += `• ${subject.name}: ${dailyHours}h/day (${remaining}h remaining)\n`;
    });
    
    setStudyPlan(plan);
  };

  const generateMotivation = () => {
    const sentiments = ['stressed', 'tired', 'motivated', 'confident', 'worried', 'excited'];
    const text = dailyLog.toLowerCase();
    
    let detectedSentiment = 'neutral';
    sentiments.forEach(sentiment => {
      if (text.includes(sentiment)) {
        detectedSentiment = sentiment;
      }
    });
    
    const messages = {
      stressed: "🌟 Remember, stress is temporary but your education is permanent. Take breaks and practice deep breathing!",
      tired: "💪 Rest is part of the process. Make sure you're getting enough sleep - your brain consolidates memories during rest!",
      motivated: "🚀 That's the spirit! Channel this energy into focused study sessions. You're on the right track!",
      confident: "⭐ Confidence is key! Keep that positive mindset and trust in your preparation.",
      worried: "🤗 It's normal to feel worried. Focus on what you can control - your effort and preparation strategy.",
      excited: "🎯 Love the enthusiasm! Use this excitement to dive deep into challenging topics.",
      neutral: "📈 Consistency is key to success. Every study session brings you closer to your goal!"
    };
    
    setMotivationMessage(messages[detectedSentiment] || messages.neutral);
  };

  return (
    <div className="card-inner">
      <div className="card-wrap">
        <div className="content private">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <div className="title"><span className="first-word">Exam </span>Prep Tracker</div>
              <div style={{ marginTop: 10, color: '#555', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }}>
                <div style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>Study timer, subject tracking, and AI assistant.</div>
                <button onClick={() => setShowModal(true)} style={{ background: 'transparent', border: 'none', color: '#0b76ef', fontSize: 13, cursor: 'pointer', padding: 0 }}>What is this?</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={() => setShowAIModal(true)} 
                style={{ padding: '8px 12px', background: '#6a2bff', color: '#fff', borderRadius: 6, border: 'none', fontWeight: 500, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Brain size={14} />
                AI Assistant
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid #e6e9ee' }}>
            {[
              { id: 'timer', label: 'Timer', icon: Clock },
              { id: 'subjects', label: 'Subjects', icon: BookOpen }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  borderBottom: currentView === id ? '2px solid #6a2bff' : '2px solid transparent',
                  color: currentView === id ? '#6a2bff' : '#666', fontSize: 14, fontWeight: 500
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Timer View */}
          {currentView === 'timer' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <label style={{ fontSize: 16, fontWeight: 500 }}>Study Timers</label>
                <button
                  onClick={addTimer}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', 
                    background: '#6a2bff', color: '#fff', borderRadius: 6, border: 'none', fontSize: 14, cursor: 'pointer' 
                  }}
                >
                  <Plus size={14} />
                  Add Timer
                </button>
              </div>
              
              {timers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: 14 }}>
                  No timers yet. Add your first timer to get started!
                </div>
              ) : (
                timers.map(timer => <TimerCard key={timer.id} timer={timer} />)
              )}
            </div>
          )}

          {/* Subjects View */}
          {currentView === 'subjects' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <label style={{ fontSize: 16, fontWeight: 500 }}>Study Subjects</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setShowAddSession(true)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', 
                      background: '#0b76ef', color: '#fff', borderRadius: 6, border: 'none', fontSize: 14, cursor: 'pointer' 
                    }}
                  >
                    <Plus size={14} />
                    Log Session
                  </button>
                  <button
                    onClick={() => setShowAddSubject(true)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', 
                      background: '#6a2bff', color: '#fff', borderRadius: 6, border: 'none', fontSize: 14, cursor: 'pointer' 
                    }}
                  >
                    <Plus size={14} />
                    Add Subject
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {subjects.map(subject => (
                  <div key={subject.id} style={{ 
                    padding: 16, border: '1px solid #e6e9ee', borderRadius: 8, background: '#fff',
                    borderLeft: `4px solid ${subject.color}`
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>{subject.name}</div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 4 }}>
                        <span>Progress</span>
                        <span>{Math.round((subject.totalHours / subject.targetHours) * 100)}%</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{ 
                            height: '100%', 
                            background: subject.color,
                            width: `${Math.min((subject.totalHours / subject.targetHours) * 100, 100)}%`,
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginTop: 4 }}>
                        <span>{subject.totalHours}h studied</span>
                        <span>{subject.targetHours}h target</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>Sessions: {subject.sessions.length}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Modal */}
          {showAIModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 600, maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>AI Assistant</div>
                  <button onClick={() => setShowAIModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                  <button
                    onClick={() => setAIFeature('difficulty')}
                    style={{
                      padding: 16, borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                      border: aiFeature === 'difficulty' ? '2px solid #6a2bff' : '2px solid #e6e9ee',
                      background: aiFeature === 'difficulty' ? '#f8f7ff' : '#fff'
                    }}
                  >
                    <Brain style={{ marginBottom: 8, color: '#6a2bff' }} size={20} />
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>Question Difficulty</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Analyze question complexity</div>
                  </button>
                  
                  <button
                    onClick={() => setAIFeature('plan')}
                    style={{
                      padding: 16, borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                      border: aiFeature === 'plan' ? '2px solid #0b76ef' : '2px solid #e6e9ee',
                      background: aiFeature === 'plan' ? '#f0f8ff' : '#fff'
                    }}
                  >
                    <Calendar style={{ marginBottom: 8, color: '#0b76ef' }} size={20} />
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>Study Plan</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Generate study schedule</div>
                  </button>
                  
                  <button
                    onClick={() => setAIFeature('motivation')}
                    style={{
                      padding: 16, borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                      border: aiFeature === 'motivation' ? '2px solid #6a2bff' : '2px solid #e6e9ee',
                      background: aiFeature === 'motivation' ? '#f8f7ff' : '#fff'
                    }}
                  >
                    <MessageCircle style={{ marginBottom: 8, color: '#6a2bff' }} size={20} />
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>Motivation</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Get personalized feedback</div>
                  </button>
                </div>
                
                {aiFeature === 'difficulty' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Question Difficulty Analyzer</label>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Paste your question here..."
                      style={{ width: '100%', height: 120, padding: 12, border: '1px solid #e6e9ee', borderRadius: 6, fontSize: 14, resize: 'vertical' }}
                    />
                    <button
                      onClick={analyzeDifficulty}
                      style={{ marginTop: 12, padding: '10px 14px', background: '#6a2bff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      Analyze Difficulty
                    </button>
                    {difficultyResult && (
                      <div style={{ marginTop: 12, padding: 12, background: '#f8f7ff', borderRadius: 6, whiteSpace: 'pre-line', fontSize: 14 }}>
                        {difficultyResult}
                      </div>
                    )}
                  </div>
                )}
                
                {aiFeature === 'plan' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Study Plan Generator</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      style={{ width: '100%', padding: 12, border: '1px solid #e6e9ee', borderRadius: 6, fontSize: 14, marginBottom: 12 }}
                    />
                    <button
                      onClick={generateStudyPlan}
                      style={{ padding: '10px 14px', background: '#0b76ef', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      Generate Plan
                    </button>
                    {studyPlan && (
                      <div style={{ marginTop: 12, padding: 12, background: '#f0f8ff', borderRadius: 6, whiteSpace: 'pre-line', fontSize: 12, fontFamily: 'monospace' }}>
                        {studyPlan}
                      </div>
                    )}
                  </div>
                )}
                
                {aiFeature === 'motivation' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Daily Motivation</label>
                    <textarea
                      value={dailyLog}
                      onChange={(e) => setDailyLog(e.target.value)}
                      placeholder="How are you feeling about your studies today?"
                      style={{ width: '100%', height: 120, padding: 12, border: '1px solid #e6e9ee', borderRadius: 6, fontSize: 14, resize: 'vertical' }}
                    />
                    <button
                      onClick={generateMotivation}
                      style={{ marginTop: 12, padding: '10px 14px', background: '#6a2bff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      Get Motivation
                    </button>
                    {motivationMessage && (
                      <div style={{ marginTop: 12, padding: 12, background: '#f8f7ff', borderRadius: 6, fontSize: 14 }}>
                        {motivationMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Subject Modal */}
          {showAddSubject && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 400 }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Add New Subject</div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  addSubject(formData.get('name'), formData.get('targetHours'), formData.get('color'));
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Subject Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6e9ee', borderRadius: 6, fontSize: 14 }}
                      placeholder="e.g., Biology"
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Target Hours</label>
                    <input
                      name="targetHours"
                      type="number"
                      required
                      min="1"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6e9ee', borderRadius: 6, fontSize: 14 }}
                      placeholder="e.g., 50"
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Color</label>
                    <select
                      name="color"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6e9ee', borderRadius: 6, fontSize: 14 }}
                    >
                      <option value="#6a2bff">Purple</option>
                      <option value="#0b76ef">Blue</option>
                      <option value="#10B981">Green</option>
                      <option value="#F59E0B">Yellow</option>
                      <option value="#EF4444">Red</option>
                      <option value="#F97316">Orange</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setShowAddSubject(false)}
                      style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '8px 12px', background: '#6a2bff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      Add Subject
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Study Session Modal */}
          {showAddSession && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 400 }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Log Study Session</div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  addStudySession(parseInt(formData.get('subject')), formData.get('hours'), formData.get('topic'), formData.get('notes'));
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Subject</label>
                    <select
                      name="subject"
                      required
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6e9ee', borderRadius: 6, fontSize: 14 }}
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Hours Studied</label>
                    <input
                      name="hours"
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="12"
                      required
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6e9ee', borderRadius: 6, fontSize: 14 }}
                      placeholder="e.g., 2.5"
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Topic</label>
                    <input
                      name="topic"
                      type="text"
                      required
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6e9ee', borderRadius: 6, fontSize: 14 }}
                      placeholder="e.g., Quantum Mechanics"
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Notes (Optional)</label>
                    <textarea
                      name="notes"
                      rows="3"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e6e9ee', borderRadius: 6, fontSize: 14, resize: 'vertical' }}
                      placeholder="Any additional notes..."
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setShowAddSession(false)}
                      style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '8px 12px', background: '#0b76ef', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      Log Session
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Info Modal */}
          {showModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '90%', maxWidth: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>About Exam Prep Tracker</div>
                  <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#555' }}>
                  <p>A comprehensive study management tool designed for exam preparation:</p>
                  <ul style={{ marginLeft: 20, marginTop: 12 }}>
                    <li>• <strong>Pomodoro Timers:</strong> Focus timer with customizable durations</li>
                    <li>• <strong>Subject Tracking:</strong> Monitor study hours and progress for each subject</li>
                    <li>• <strong>AI Assistant:</strong> Analyze question difficulty, generate study plans, and get motivational feedback</li>
                    <li>• <strong>Progress Analytics:</strong> Track your study sessions and see your improvement over time</li>
                  </ul>
                  <p style={{ marginTop: 12 }}>Perfect for students preparing for competitive exams, university courses, or any structured learning goals.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPrepApp;