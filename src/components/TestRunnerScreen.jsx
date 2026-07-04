import { useState, useEffect, useRef } from 'react';

export default function TestRunnerScreen({ activeTest, onSubmitTest, onCancel, attemptId, resumeAnswers, resumeTimeLeft }) {
  const [localQuestions, setLocalQuestions] = useState(() => activeTest?.questions || []);
  const questions = localQuestions;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Selection and submission tracking states
  const [selectedAnswers, setSelectedAnswers] = useState(
    () => resumeAnswers ? [...resumeAnswers] : new Array(questions.length).fill(-1)
  );
  const [lockedAnswers, setLockedAnswers] = useState(
    () => resumeAnswers || new Array(questions.length).fill(-1)
  );
  const [submittedQuestions, setSubmittedQuestions] = useState(
    () => resumeAnswers ? resumeAnswers.map(ans => ans !== -1) : new Array(questions.length).fill(false)
  );
  const [reattemptedQuestions, setReattemptedQuestions] = useState(
    () => new Array(questions.length).fill(false)
  );
  const [showExplanation, setShowExplanation] = useState(
    () => new Array(questions.length).fill(false)
  );
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(() => resumeTimeLeft !== null && resumeTimeLeft !== undefined ? resumeTimeLeft : (activeTest?.duration_mins || questions.length) * 60);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showPassagePopup, setShowPassagePopup] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);

  const [loadingQuestions, setLoadingQuestions] = useState({});
  const inflightFetches = useRef({});

  // Translation States
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [translatedQuestions, setTranslatedQuestions] = useState({});
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const inflightTranslations = useRef({});

  // Reset states when activeTest changes
  useEffect(() => {
    if (activeTest?.questions) {
      setLocalQuestions(activeTest.questions);
      
      const initialLocked = resumeAnswers || new Array(activeTest.questions.length).fill(-1);
      const initialSelected = resumeAnswers ? [...resumeAnswers] : new Array(activeTest.questions.length).fill(-1);
      const initialSubmitted = resumeAnswers ? resumeAnswers.map(ans => ans !== -1) : new Array(activeTest.questions.length).fill(false);
      const initialTimeLeft = resumeTimeLeft !== null && resumeTimeLeft !== undefined ? resumeTimeLeft : (activeTest.duration_mins || activeTest.questions.length) * 60;

      setSelectedAnswers(initialSelected);
      setLockedAnswers(initialLocked);
      setSubmittedQuestions(initialSubmitted);
      setReattemptedQuestions(new Array(activeTest.questions.length).fill(false));
      setShowExplanation(new Array(activeTest.questions.length).fill(false));
      setTimeLeft(initialTimeLeft);
      setCurrentQuestionIndex(0);
      setIsTimerPaused(false);
      setShowHint(false);
      setShowPassagePopup(false);
      inflightFetches.current = {};
      setLoadingQuestions({});
      
      // Reset translation states
      setCurrentLanguage("English");
      setTranslatedQuestions({});
      setLoadingTranslation(false);
      inflightTranslations.current = {};
    }
  }, [activeTest, resumeAnswers, resumeTimeLeft]);

  // On-demand correction and pre-fetching
  useEffect(() => {
    if (!activeTest?.id || localQuestions.length === 0) return;

    const fetchQuestion = async (index) => {
      if (inflightFetches.current[index] || localQuestions[index]?.ai_corrected) return;

      inflightFetches.current[index] = true;
      setLoadingQuestions(prev => ({ ...prev, [index]: true }));

      try {
        const res = await fetch(`/api/tests/${activeTest.id}/questions/${index}/moderate`);
        if (res.ok) {
          const correctedQ = await res.json();
          setLocalQuestions(prev => {
            const updated = [...prev];
            updated[index] = correctedQ;
            if (activeTest.questions) {
              activeTest.questions[index] = correctedQ;
            }
            return updated;
          });
        }
      } catch (error) {
        console.error(`Error moderating question at index ${index}:`, error);
      } finally {
        inflightFetches.current[index] = false;
        setLoadingQuestions(prev => ({ ...prev, [index]: false }));
      }
    };

    // 1. Fetch current question if not corrected
    const currentQ = localQuestions[currentQuestionIndex];
    if (currentQ && !currentQ.ai_corrected && !inflightFetches.current[currentQuestionIndex]) {
      fetchQuestion(currentQuestionIndex);
    }

    // 2. Pre-fetch next question
    if (currentQuestionIndex + 1 < localQuestions.length) {
      const nextQ = localQuestions[currentQuestionIndex + 1];
      if (nextQ && !nextQ.ai_corrected && !inflightFetches.current[currentQuestionIndex + 1]) {
        fetchQuestion(currentQuestionIndex + 1);
      }
    }

    // 3. Pre-fetch previous question
    if (currentQuestionIndex - 1 >= 0) {
      const prevQ = localQuestions[currentQuestionIndex - 1];
      if (prevQ && !prevQ.ai_corrected && !inflightFetches.current[currentQuestionIndex - 1]) {
        fetchQuestion(currentQuestionIndex - 1);
      }
    }
  }, [currentQuestionIndex, localQuestions, activeTest]);

  // On-demand Translation & Pre-fetching Effect
  useEffect(() => {
    if (!activeTest?.id || localQuestions.length === 0 || currentLanguage === "English") {
      setLoadingTranslation(false);
      return;
    }

    const fetchTranslation = async (index, isBackground = false) => {
      // If already fetching or cached, return
      if (translatedQuestions[index]?.[currentLanguage] || inflightTranslations.current[`${index}_${currentLanguage}`]) {
        return;
      }

      inflightTranslations.current[`${index}_${currentLanguage}`] = true;
      if (!isBackground) {
        setLoadingTranslation(true);
      }

      try {
        const res = await fetch(`/api/tests/${activeTest.id}/questions/${index}/translate?lang=${currentLanguage}`);
        if (res.ok) {
          const translatedQ = await res.json();
          setTranslatedQuestions(prev => ({
            ...prev,
            [index]: {
              ...(prev[index] || {}),
              [currentLanguage]: translatedQ
            }
          }));
        }
      } catch (error) {
        console.error(`Error translating question ${index} to ${currentLanguage}:`, error);
      } finally {
        inflightTranslations.current[`${index}_${currentLanguage}`] = false;
        if (!isBackground) {
          setLoadingTranslation(false);
        }
      }
    };

    // 1. Fetch current question translation if missing
    if (!translatedQuestions[currentQuestionIndex]?.[currentLanguage]) {
      fetchTranslation(currentQuestionIndex, false);
    }

    // 2. Pre-fetch next question translation
    if (currentQuestionIndex + 1 < localQuestions.length) {
      if (!translatedQuestions[currentQuestionIndex + 1]?.[currentLanguage]) {
        fetchTranslation(currentQuestionIndex + 1, true);
      }
    }

    // 3. Pre-fetch previous question translation
    if (currentQuestionIndex - 1 >= 0) {
      if (!translatedQuestions[currentQuestionIndex - 1]?.[currentLanguage]) {
        fetchTranslation(currentQuestionIndex - 1, true);
      }
    }
  }, [currentQuestionIndex, currentLanguage, localQuestions, activeTest, translatedQuestions]);

  // Timer interval countdown
  useEffect(() => {
    const isCurrentlyLoading = loadingQuestions[currentQuestionIndex] || loadingTranslation;
    if (isTimerPaused || isCurrentlyLoading || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit answers
          onSubmitTest(lockedAnswers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused, timeLeft, lockedAnswers, onSubmitTest, loadingQuestions, currentQuestionIndex, loadingTranslation]);

  // Extract unique sections
  const uniqueSections = Array.from(new Set(questions.map(q => q.section).filter(Boolean)));

  const handleSelectOption = (optionIndex) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowHint(false);
      setShowPassagePopup(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowHint(false);
      setShowPassagePopup(false);
    }
  };

  const handleVerifyQuestion = () => {
    const updatedLocked = [...lockedAnswers];
    const isPreviouslySubmitted = submittedQuestions[currentQuestionIndex];
    
    updatedLocked[currentQuestionIndex] = selectedAnswers[currentQuestionIndex];
    setLockedAnswers(updatedLocked);

    const updatedSubmitted = [...submittedQuestions];
    updatedSubmitted[currentQuestionIndex] = true;
    setSubmittedQuestions(updatedSubmitted);

    if (isPreviouslySubmitted) {
      const updatedReattempted = [...reattemptedQuestions];
      updatedReattempted[currentQuestionIndex] = true;
      setReattemptedQuestions(updatedReattempted);
    }

    setIsTimerPaused(false); // Auto resume if paused

    // Sync progress to backend asynchronously in the background
    if (attemptId) {
      fetch(`/api/attempts/${attemptId}/save-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          answers: updatedLocked,
          time_left: timeLeft
        })
      }).catch(err => console.error("Error saving progress:", err));
    }
  };

  const toggleSolution = () => {
    const updated = [...showExplanation];
    updated[currentQuestionIndex] = !updated[currentQuestionIndex];
    setShowExplanation(updated);
  };

  const onSubmit = () => {
    const hasUnsubmitted = submittedQuestions.includes(false);
    if (hasUnsubmitted) {
      const confirmSubmit = window.confirm("You have unsubmitted questions. Are you sure you want to finish the exam?");
      if (!confirmSubmit) return;
    }
    onSubmitTest(lockedAnswers);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const defaultQuestion = questions[currentQuestionIndex] || { question_text: '', options: [] };
  const currentQuestion = (currentLanguage !== "English" && translatedQuestions[currentQuestionIndex]?.[currentLanguage]) || defaultQuestion;
  const isCurrentQuestionSubmitted = submittedQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isAnswerChanged = selectedAnswers[currentQuestionIndex] !== lockedAnswers[currentQuestionIndex];
  const showSubmitBtn = !isCurrentQuestionSubmitted || isAnswerChanged;
  const isCurrentQuestionReattempted = reattemptedQuestions[currentQuestionIndex];
  const isCurrentExplanationOpen = showExplanation[currentQuestionIndex];

  return (
    <div className="test-runner-container" style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: 200, 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'var(--bg-device)', 
      overflow: 'hidden',
      paddingTop: 'env(safe-area-inset-top, 0px)',
      boxSizing: 'border-box'
    }}>
      
      {/* Cheat Prevention Overlay */}
      {isTimerPaused && (
        <div 
          className="glass-card" 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 300, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '16px', 
            borderRadius: 0, 
            border: 'none', 
            backdropFilter: 'blur(25px)',
            background: 'rgba(8, 20, 37, 0.97)',
            padding: '24px'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '56px', color: 'var(--secondary)', animation: 'pulse-slow 2s infinite' }}>
            pause_circle
          </span>
          <h4 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Exam Paused</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', margin: 0, maxWidth: '260px', lineHeight: 1.6 }}>
            Question text and options are hidden to protect test integrity while the timer is suspended.
          </p>
          <button 
            className="orange-submit-btn gold-shimmer" 
            style={{ width: '180px', marginTop: '12px' }}
            onClick={() => setIsTimerPaused(false)}
          >
            Resume Test
          </button>
        </div>
      )}

      {/* Pinned Top Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(8, 20, 37, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {/* Header */}
        <div className="app-header-rankora" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'none', margin: 0 }}>
          <div className="header-back-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="back-btn"
              onClick={() => setShowAbortModal(true)}
              aria-label="Cancel"
              style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--text-primary)', fontSize: '22px' }}>close</span>
            </button>
            <h3 className="header-title-text" style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
              {activeTest.title}
            </h3>
          </div>
        </div>

        {/* Section Tabs & Timer Row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 14px 8px 14px' }}>
          {uniqueSections.length > 0 && (
            <div className="category-tabs-container" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', margin: 0, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {uniqueSections.map((sec) => {
                const firstIndex = questions.findIndex(q => q.section === sec);
                const isActive = currentQuestion.section === sec;
                const secCount = questions.filter(q => q.section === sec).length;
                
                return (
                  <button
                    key={sec}
                    className={`category-tab-btn ${isActive ? 'active' : ''}`}
                    style={{
                      padding: '8px 14px',
                      fontSize: '11px',
                      fontWeight: 800,
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: isActive ? '1px solid var(--secondary)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isActive ? 'rgba(255, 185, 95, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      color: isActive ? 'var(--secondary)' : 'var(--text-secondary)'
                    }}
                    onClick={() => {
                      setCurrentQuestionIndex(firstIndex);
                      setShowHint(false);
                      setShowPassagePopup(false);
                    }}
                  >
                    {sec} ({secCount})
                  </button>
                );
              })}
            </div>
          )}

          {/* Timer & Controls row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.015)' }}>
            {/* Left side: Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: timeLeft < 120 ? '#f87171' : 'var(--secondary)', fontSize: '18px' }}>
                alarm
              </span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: timeLeft < 120 ? '#f87171' : 'var(--text-primary)', fontFamily: 'monospace' }}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            {/* Right side: Language Selector ("La") & Pause Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Language Selector Dropdown */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '8px', color: 'var(--secondary)', fontSize: '14px', pointerEvents: 'none' }}>
                  translate
                </span>
                <select
                  value={currentLanguage}
                  onChange={(e) => setCurrentLanguage(e.target.value)}
                  style={{
                    background: 'rgba(255, 185, 95, 0.1)',
                    border: '1px solid var(--secondary)',
                    color: 'var(--secondary)',
                    padding: '4px 8px 4px 26px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    transition: 'all 0.2s',
                    minWidth: '60px'
                  }}
                  aria-label="Language selection"
                >
                  <option value="English" style={{ background: 'var(--bg-device)', color: 'var(--text-primary)' }}>La: EN</option>
                  <option value="Hindi" style={{ background: 'var(--bg-device)', color: 'var(--text-primary)' }}>La: HI (हिंदी)</option>
                  <option value="Marathi" style={{ background: 'var(--bg-device)', color: 'var(--text-primary)' }}>La: MR (मराठी)</option>
                  <option value="Telugu" style={{ background: 'var(--bg-device)', color: 'var(--text-primary)' }}>La: TE (తెలుగు)</option>
                  <option value="Tamil" style={{ background: 'var(--bg-device)', color: 'var(--text-primary)' }}>La: TA (தமிழ்)</option>
                  <option value="Bengali" style={{ background: 'var(--bg-device)', color: 'var(--text-primary)' }}>La: BN (বাংলা)</option>
                  <option value="Gujarati" style={{ background: 'var(--bg-device)', color: 'var(--text-primary)' }}>La: GJ (ગુજરાતી)</option>
                  <option value="Kannada" style={{ background: 'var(--bg-device)', color: 'var(--text-primary)' }}>La: KN (ಕನ್ನಡ)</option>
                  <option value="Malayalam" style={{ background: 'var(--bg-device)', color: 'var(--text-primary)' }}>La: ML (മലയാളം)</option>
                  <option value="Punjabi" style={{ background: 'var(--bg-device)', color: 'var(--text-primary)' }}>La: PA (ਪੰਜਾਬੀ)</option>
                  <option value="Odia" style={{ background: 'var(--bg-device)', color: 'var(--text-primary)' }}>La: OR (ଓଡ଼ିଆ)</option>
                  <option value="Urdu" style={{ background: 'var(--bg-device)', color: 'var(--text-primary)' }}>La: UR (اردو)</option>
                </select>
              </div>

              {/* Pause/Resume Button */}
              <button 
                style={{ 
                  background: isTimerPaused ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 185, 95, 0.1)',
                  border: isTimerPaused ? '1px solid #10b981' : '1px solid var(--secondary)',
                  color: isTimerPaused ? '#10b981' : 'var(--secondary)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s'
                }}
                onClick={() => setIsTimerPaused(!isTimerPaused)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  {isTimerPaused ? 'play_arrow' : 'pause'}
                </span>
                {isTimerPaused ? 'Resume' : 'Pause'}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="test-progress-bar-wrapper" style={{ margin: '2px 0 0 0', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div
              className="test-progress-bar-fill"
              style={{ width: `${((currentQuestionIndex + 1) / (questions.length || 1)) * 100}%`, height: '100%', background: 'var(--secondary)', transition: 'width 0.3s ease' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="scroll-container" style={{ 
        flex: 1, 
        minHeight: 0,
        overflowY: 'auto', 
        WebkitOverflowScrolling: 'touch', 
        padding: '12px 14px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        boxSizing: 'border-box'
      }}>
        
        {/* Question Card & Options Stack */}
        {loadingQuestions[currentQuestionIndex] || loadingTranslation ? (
          <div className="glass-card" style={{ padding: '40px 24px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', background: 'rgba(30, 41, 59, 0.4)', minHeight: '340px', justifyContent: 'center', flexShrink: 0 }}>
            <div className="logo-shield-wrapper" style={{ animation: 'pulse-slow 1.5s infinite ease-in-out', marginBottom: 0, width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 185, 95, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--secondary)' }}>
                {loadingTranslation ? 'translate' : 'psychology'}
              </span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {loadingTranslation ? `Translating to ${currentLanguage}` : 'Verification Engine'}
            </span>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, maxWidth: '220px', lineHeight: 1.5 }}>
              {loadingTranslation 
                ? 'Converting question, options, hint, and explanations dynamically...'
                : 'Verifying spelling, checking grammar, and generating hints/explanations...'}
            </p>
            <div style={{ width: '120px', height: '3px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', position: 'relative', marginTop: '4px' }}>
              <div style={{
                position: 'absolute',
                height: '100%',
                backgroundColor: 'var(--secondary)',
                width: '50%',
                borderRadius: '2px',
                animation: 'loading-bar-anim 1.5s infinite ease-in-out'
              }}></div>
            </div>
          </div>
        ) : (
          <>
            {/* Question Card */}
            <div className="test-question-box glass-card" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(30, 41, 59, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', margin: 0, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px', marginBottom: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                  {currentQuestion.section && (
                    <span style={{ color: 'var(--secondary)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {currentQuestion.section}
                    </span>
                  )}
                  <span className="test-question-number" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
                {currentQuestion.hint && (
                  <button 
                    style={{
                      background: showHint ? 'rgba(255,185,95,0.2)' : 'transparent',
                      border: 'none',
                      color: 'var(--secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                    onClick={() => setShowHint(!showHint)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      lightbulb
                    </span>
                    {showHint ? 'Hide Hint' : 'Hint'}
                  </button>
                )}
              </div>

              {/* Passage Display (Nested inside Question Card) */}
              {currentQuestion.passage && (
                <div style={{ 
                  padding: '8px 10px', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  background: 'rgba(255,255,255,0.015)', 
                  textAlign: 'left', 
                  margin: '4px 0 8px 0',
                  fontSize: '11px', 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.4, 
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--secondary)', fontSize: '11px' }}>
                      📝 {currentQuestion.passage.title || "Passage Information"}:
                    </strong>
                    <button 
                      onClick={() => setShowPassagePopup(true)}
                      style={{
                        background: 'rgba(255, 185, 95, 0.12)',
                        border: '1px solid var(--secondary)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: 'var(--secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>open_in_new</span>
                      Read Full Passage
                    </button>
                  </div>
                  <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: 'var(--text-secondary)' }}>
                    {currentQuestion.passage.content}
                  </p>
                </div>
              )}

              <p className="test-question-text" style={{ fontSize: '14px', margin: '4px 0 0 0', lineHeight: 1.5, textAlign: 'left', fontWeight: 700, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {currentQuestion.question_text}
              </p>
              
              {/* Hint text card */}
              {showHint && currentQuestion.hint && (
                <div style={{ marginTop: '8px', padding: '10px 12px', borderRadius: '8px', border: '1px dashed var(--secondary)', background: 'rgba(255, 185, 95, 0.03)', fontSize: '12px', color: 'var(--secondary)', lineHeight: 1.4, textAlign: 'left' }}>
                  <strong>💡 Hint:</strong> {currentQuestion.hint}
                </div>
              )}
            </div>

            {/* Options Label */}
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left', margin: '4px 0 -2px 4px', flexShrink: 0 }}>
              Select Answer Option
            </div>

            {/* Options Stack */}
            <div className="test-options-stack" style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, flexShrink: 0 }}>
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                const isLocked = lockedAnswers[currentQuestionIndex] === idx;
                const isCorrect = idx === currentQuestion.correct_option_index;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D

                let optionStyle = {
                  padding: '10px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1.5px solid rgba(255, 255, 255, 0.06)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                  flexShrink: 0
                };

                let letterBg = 'rgba(255, 255, 255, 0.06)';
                let letterColor = 'var(--text-primary)';

                if (isCurrentQuestionSubmitted) {
                  if (isCurrentExplanationOpen) {
                    if (isCorrect) {
                      optionStyle.borderColor = '#10b981';
                      optionStyle.background = 'rgba(16, 185, 129, 0.12)';
                      optionStyle.color = '#34d399';
                      optionStyle.boxShadow = '0 0 12px rgba(16, 185, 129, 0.15)';
                      letterBg = '#10b981';
                      letterColor = '#ffffff';
                    } else if (isLocked) {
                      optionStyle.borderColor = '#f87171';
                      optionStyle.background = 'rgba(248, 113, 113, 0.12)';
                      optionStyle.color = '#f87171';
                      optionStyle.boxShadow = '0 0 12px rgba(248, 113, 113, 0.15)';
                      letterBg = '#f87171';
                      letterColor = '#ffffff';
                    }
                  } else if (isSelected) {
                    optionStyle.borderColor = 'var(--secondary)';
                    optionStyle.background = 'rgba(255, 185, 95, 0.1)';
                    optionStyle.boxShadow = '0 0 10px rgba(255, 185, 95, 0.1)';
                    letterBg = 'var(--secondary)';
                    letterColor = '#020617';
                  } else if (isLocked) {
                    optionStyle.borderColor = 'rgba(255, 185, 95, 0.4)';
                    optionStyle.background = 'rgba(255, 185, 95, 0.03)';
                    letterBg = 'rgba(255, 185, 95, 0.2)';
                    letterColor = 'var(--secondary)';
                  }
                } else if (isSelected) {
                  optionStyle.borderColor = 'var(--secondary)';
                  optionStyle.background = 'rgba(255, 185, 95, 0.1)';
                  optionStyle.boxShadow = '0 0 12px rgba(255, 185, 95, 0.15)';
                  letterBg = 'var(--secondary)';
                  letterColor = '#020617';
                }

                return (
                  <button
                    key={idx}
                    style={optionStyle}
                    onClick={() => handleSelectOption(idx)}
                    className={isSelected ? 'selected' : ''}
                    onMouseOver={(e) => {
                      if (!isCurrentQuestionSubmitted && !isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(255, 185, 95, 0.4)';
                        e.currentTarget.style.background = 'rgba(255, 185, 95, 0.02)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isCurrentQuestionSubmitted && !isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      }
                    }}
                  >
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: letterBg,
                      color: letterColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {letter}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, flex: 1, wordBreak: 'break-word', overflowWrap: 'break-word', textAlign: 'left' }}>{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Hide Explanation / Solution behind toggle button */}
            {isCurrentQuestionSubmitted && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', margin: 0, flexShrink: 0 }}>
                <button
                  onClick={toggleSolution}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    minHeight: '44px',
                    flexShrink: 0
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {isCurrentExplanationOpen ? 'visibility_off' : 'visibility'}
                  </span>
                  {isCurrentExplanationOpen ? 'Hide Solution' : 'View Answer & Explanation'}
                </button>

                {isCurrentExplanationOpen && (
                  <div className="glass-card" style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(15, 23, 42, 0.85)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ fontSize: '12px', fontWeight: 800, margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                        Explanation
                      </h5>
                      {isCurrentQuestionReattempted && (
                        <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.3)' }}>
                          ⚠️ Re-attempted
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>
                      Correct Option: {String.fromCharCode(65 + currentQuestion.correct_option_index)}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      {currentQuestion.explanation || 'No explanation available.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Inline Navigation & Submission Controls */}
            <div className="test-navigation-row" style={{ 
              marginTop: '12px', 
              display: 'flex', 
              gap: '12px',
              width: '100%',
              paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 8px))',
              boxSizing: 'border-box',
              flexShrink: 0
            }}>
              <button
                className="btn-secondary"
                disabled={currentQuestionIndex === 0}
                onClick={handlePrevQuestion}
                style={{ 
                  opacity: currentQuestionIndex === 0 ? 0.3 : 1,
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  border: '1.5px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-primary)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  minHeight: '44px'
                }}
              >
                Previous
              </button>

              {showSubmitBtn ? (
                <button
                  className="btn-primary"
                  onClick={handleVerifyQuestion}
                  disabled={selectedAnswers[currentQuestionIndex] === -1}
                  style={{ 
                    opacity: selectedAnswers[currentQuestionIndex] === -1 ? 0.5 : 1,
                    flex: 1.5,
                    padding: '10px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#020617',
                    cursor: selectedAnswers[currentQuestionIndex] === -1 ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 800,
                    minHeight: '44px'
                  }}
                >
                  {isCurrentQuestionSubmitted ? 'Resubmit Answer' : 'Submit Answer'}
                </button>
              ) : (
                !isLastQuestion ? (
                  <button
                    className="btn-primary"
                    onClick={handleNextQuestion}
                    style={{
                      flex: 1.5,
                      padding: '10px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 800,
                      minHeight: '44px'
                    }}
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={onSubmit}
                    style={{
                      flex: 1.5,
                      padding: '10px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 800,
                      minHeight: '44px'
                    }}
                  >
                    Finish Mock Test
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* Passage Details Modal Overlay */}
      {showPassagePopup && currentQuestion.passage && (
        <div 
          className="glass-card" 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 300, 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: 0, 
            border: 'none', 
            backdropFilter: 'blur(20px)',
            background: 'rgba(8, 20, 37, 0.95)',
            padding: '24px',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">menu_book</span>
              {currentQuestion.passage.title || "Passage Information"}
            </h4>
            <button 
              onClick={() => setShowPassagePopup(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '6px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Close passage modal"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>

          {/* Scrollable Passage Body */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            paddingRight: '4px',
            marginBottom: '16px',
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--text-primary)',
            textAlign: 'left',
            whiteSpace: 'pre-line'
          }} className="scroll-container">
            {currentQuestion.passage.content}
          </div>

          {/* Footer Back Button */}
          <button 
            className="orange-submit-btn gold-shimmer" 
            style={{ width: '100%', minHeight: '44px' }}
            onClick={() => setShowPassagePopup(false)}
          >
            Back to Question
          </button>
        </div>
      )}

      {/* Abort Confirmation Modal */}
      {showAbortModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          boxSizing: 'border-box'
        }}>
          <div className="glass-card" style={{
            padding: '24px 20px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            width: '100%',
            maxWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>warning</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Abort Mock Test?</h4>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Are you sure you want to exit the test? Your current progress is saved in history so you can resume later.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%', marginTop: '4px' }}>
              <button 
                type="button" 
                style={{ 
                  background: '#334155', 
                  color: '#fff', 
                  border: 'none',
                  borderRadius: '16px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: 1,
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setShowAbortModal(false)}
              >
                No, Resume
              </button>
              <button 
                type="button" 
                style={{ 
                  background: '#ef4444', 
                  color: '#fff', 
                  border: 'none',
                  borderRadius: '16px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flex: 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 10px rgba(239, 68, 68, 0.2)'
                }}
                onClick={() => {
                  setShowAbortModal(false);
                  onCancel();
                }}
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations style helper */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); filter: drop-shadow(0 0 8px rgba(255, 185, 95, 0.3)); }
        }
        @keyframes loading-bar-anim {
          0% { left: -50%; }
          100% { left: 100%; }
        }
      `}} />
    </div>
  );
}
