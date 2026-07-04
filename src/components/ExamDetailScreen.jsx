import { useState, useEffect } from 'react';

export default function ExamDetailScreen({ selectedExam, mockTests, startMockTest, onBack }) {
  const [activeCategory, setActiveCategory] = useState('Previous');
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!selectedExam || !selectedExam.id) return;
    
    let isMounted = true;
    const fetchPreviousYears = async () => {
      try {
        const response = await fetch(`/api/exams/${selectedExam.id}/previous-years`);
        if (response.ok) {
          const years = await response.json();
          if (isMounted) {
            setAvailableYears(years);
          }
        }
      } catch (error) {
        console.error("Error fetching previous years:", error);
      }
    };
    
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`/api/subjects?examId=${selectedExam.id}`);
        if (response.ok) {
          const subs = await response.json();
          if (isMounted) {
            setSubjects(subs);
          }
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    
    // Initial fetch
    fetchPreviousYears();
    fetchSubjects();

    // Poll previous years list every 1 minute to check for newly imported exam papers
    const pollInterval = setInterval(() => {
      fetchPreviousYears();
    }, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [selectedExam]);

  if (!selectedExam) return null;

  const examName = selectedExam.name;

  // Build the list of specific tests dynamically using real mockTests as backers
  const getMockTestsForExam = () => {
    if (!mockTests) return [];

    const baseTest0 = mockTests[0] || { id: "", title: "", marks: 100, duration_mins: 60 };
    const baseTest1 = mockTests.length > 1 ? mockTests[1] : baseTest0;
    const baseTest2 = mockTests.length > 2 ? mockTests[2] : baseTest0;

    const papers = [];

    // Dynamically generate previous years papers based on database availability
    if (availableYears && availableYears.length > 0) {
      availableYears.forEach((item, idx) => {
        const year = typeof item === 'object' ? item.year : item;
        const shift = typeof item === 'object' ? item.shift : 1;
        const shiftLabel = (typeof item === 'object' && item.shift) ? ` (Shift ${shift})` : "";
        
        papers.push({
          id: `py-${year}-shift-${shift}`,
          category: "Previous",
          type: "Previous Year Paper",
          year: year,
          shift: shift,
          title: `${examName} ${year}${shiftLabel} Solved Paper`,
          stats: "60 Mins",
          badge: "START",
          badgeClass: "badge-solved",
          icon: "history",
          backer: idx % 2 === 0 ? baseTest0 : baseTest1
        });
      });
    }

    // Practice Mock Tests (Dynamic Practice Mock Test balancing difficulty)
    papers.push({
      id: "dyn-practice-balanced",
      category: "Practice",
      type: "Balanced Practice Test",
      title: `${examName} Dynamic Practice Mock Test`,
      stats: "30 Questions • 30 Mins",
      badge: "BALANCED",
      badgeClass: "badge-live",
      icon: "psychology",
      isDynamic: true,
      dynamicParams: {
        mode: "practice",
        numQuestions: 30,
        durationMins: 30
      }
    });

    // Add standard practice papers from mockTests
    mockTests.forEach((t, idx) => {
      if (t.examId === selectedExam.id) {
        papers.push({
          id: `pr-db-${t.id || idx}`,
          category: "Practice",
          type: "Standard Practice Exam",
          title: t.title,
          stats: `${t.duration_mins} Mins`,
          badge: idx === 0 ? "FREE" : "PRO",
          badgeClass: idx === 0 ? "badge-free" : "badge-solved",
          icon: "description",
          backer: t
        });
      }
    });

    // Adaptive Drills (Subject-wise + Collective)
    if (subjects && subjects.length > 0) {
      subjects.forEach((sub, idx) => {
        papers.push({
          id: `ai-sub-${sub.id || idx}`,
          category: "AI",
          type: "Adaptive Drill",
          title: `${examName} ${sub.name} Adaptive Drill`,
          stats: "15 Questions • 15 Mins",
          badge: "ADAPTIVE",
          badgeClass: "badge-ai",
          icon: "psychology",
          isDynamic: true,
          subjectId: sub.id || sub._id,
          dynamicParams: {
            mode: "adaptive",
            numQuestions: 15,
            durationMins: 15
          }
        });
      });
      
      // Collective drill
      papers.push({
        id: "ai-collective",
        category: "AI",
        type: "Adaptive Drill",
        title: `${examName} Collective Subject Drill`,
        stats: "30 Questions • 30 Mins",
        badge: "COLLECTIVE",
        badgeClass: "badge-ai",
        icon: "insights",
        isDynamic: true,
        dynamicParams: {
          mode: "adaptive",
          numQuestions: 30,
          durationMins: 30,
          subjectIds: subjects.map(s => s.id || s._id).join(",")
        }
      });
    } else {
      // Fallback if subjects not loaded
      papers.push(
        {
          id: "ai-fallback-1",
          category: "AI",
          type: "Adaptive Drill",
          title: `${examName} Quantitative Aptitude Drill`,
          stats: "15 Questions • 15 Mins",
          badge: "ADAPTIVE",
          badgeClass: "badge-ai",
          icon: "psychology",
          isDynamic: true,
          dynamicParams: { mode: "adaptive", numQuestions: 15, durationMins: 15 }
        },
        {
          id: "ai-fallback-2",
          category: "AI",
          type: "Adaptive Drill",
          title: `${examName} Reasoning Ability Drill`,
          stats: "15 Questions • 15 Mins",
          badge: "ADAPTIVE",
          badgeClass: "badge-ai",
          icon: "psychology",
          isDynamic: true,
          dynamicParams: { mode: "adaptive", numQuestions: 15, durationMins: 15 }
        }
      );
    }

    // Subject Sectionals (Dynamic subjects as available)
    if (subjects && subjects.length > 0) {
      subjects.forEach((sub, idx) => {
        papers.push({
          id: `sub-sec-${sub.id || idx}`,
          category: "Subject",
          type: "Sectional Exam",
          title: `${examName} ${sub.name} Sectional`,
          stats: "10 Questions • 10 Mins",
          badge: "SECTIONAL",
          badgeClass: "badge-sectional",
          icon: "menu_book",
          isDynamic: true,
          subjectId: sub.id || sub._id,
          dynamicParams: {
            mode: "practice",
            numQuestions: 10,
            durationMins: 10
          }
        });
      });
    } else {
      // Fallback subjects
      papers.push(
        {
          id: "sub-fallback-1",
          category: "Subject",
          type: "Sectional Exam",
          title: `${examName} Quant Sectional`,
          stats: "10 Questions • 10 Mins",
          badge: "SECTIONAL",
          badgeClass: "badge-sectional",
          icon: "menu_book",
          isDynamic: true,
          dynamicParams: {
            mode: "practice",
            numQuestions: 10,
            durationMins: 10
          }
        },
        {
          id: "sub-fallback-2",
          category: "Subject",
          type: "Sectional Exam",
          title: `${examName} Reasoning Sectional`,
          stats: "10 Questions • 10 Mins",
          badge: "SECTIONAL",
          badgeClass: "badge-sectional",
          icon: "menu_book",
          isDynamic: true,
          dynamicParams: {
            mode: "practice",
            numQuestions: 10,
            durationMins: 10
          }
        }
      );
    }

    // Predictive papers (Predict question paper based on database questions)
    papers.push({
      id: "pred-generate-on-demand",
      category: "Predictive",
      type: "Predictive Model Paper",
      title: `Predict & Generate ${examName} 2026 Paper`,
      stats: "30 Questions • 30 Mins",
      badge: "FORECAST",
      badgeClass: "badge-live",
      icon: "insights",
      isPredictive: true
    });

    // Add any existing predictive mock papers from database
    mockTests.forEach((t) => {
      if (t.examId === selectedExam.id && (t.category === "Predictive" || t.category === "Featured")) {
        papers.push({
          id: `pred-db-${t.id}`,
          category: "Predictive",
          type: "Predicted Paper",
          title: t.title,
          stats: `${t.questions?.length || 30} Questions • ${t.duration_mins} Mins`,
          badge: "PREDICTED",
          badgeClass: "badge-solved",
          icon: "insights",
          backer: t
        });
      }
    });

    return papers;
  };

  const allPapers = getMockTestsForExam();

  const handleStartTest = async (paper) => {
    setIsLoadingTest(true);
    setLoadingMessage("Fetching exam paper...");
    
    const messages = [
      "Reviewing exam syllabus...",
      "Analyzing past exam trends...",
      "Extracting database questions...",
      "Configuring balanced difficulty levels...",
      "Invoking Quality Review Check...",
      "Generating predicted questions...",
      "Compiling final dynamic test...",
      "Preparing active countdown timer..."
    ];
    
    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < messages.length - 1) {
        messageIndex++;
        setLoadingMessage(messages[messageIndex]);
      }
    }, 1200);
    
    try {
      let response;
      if (paper.isPredictive) {
        response = await fetch(`/api/tests/predict?examId=${selectedExam.id}&title=${encodeURIComponent(paper.title)}`);
      } else {
        const queryParams = new URLSearchParams({
          examId: selectedExam.id,
          category: paper.category,
          title: paper.title
        });
        if (paper.year) {
          queryParams.append("year", paper.year);
        }
        if (paper.shift) {
          queryParams.append("shift", paper.shift);
        }
        if (paper.isDynamic && paper.dynamicParams) {
          Object.entries(paper.dynamicParams).forEach(([key, val]) => {
            queryParams.append(key, val);
          });
        }
        if (paper.subjectId) {
          queryParams.append("subjectId", paper.subjectId);
        }
        
        response = await fetch(`/api/tests/dynamic?${queryParams.toString()}`);
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to generate mock test");
      }
      const generatedTest = await response.json();
      
      clearInterval(interval);
      setIsLoadingTest(false);
      startMockTest(generatedTest);
    } catch (error) {
      clearInterval(interval);
      setIsLoadingTest(false);
      alert(`Error starting exam: ${error.message}`);
    }
  };

  const CATEGORY_GROUPS = [
    {
      id: 'Previous',
      title: 'Previous Year Papers',
      icon: 'history',
      accent: 'var(--text-secondary)'
    },
    {
      id: 'Practice',
      title: 'Practice Mock Tests',
      icon: 'campaign',
      accent: 'var(--secondary)'
    },
    {
      id: 'AI',
      title: 'Adaptive Drills',
      icon: 'psychology',
      accent: 'var(--tertiary)'
    },
    {
      id: 'Subject',
      title: 'Subject Sectionals',
      icon: 'menu_book',
      accent: '#34d399'
    },
    {
      id: 'Predictive',
      title: 'Predictive Papers',
      icon: 'insights',
      accent: '#f43f5e'
    }
  ];

  if (isLoadingTest) {
    return (
      <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '30px 24px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center', width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="logo-shield-wrapper" style={{ animation: 'pulse 1.5s infinite ease-in-out', marginBottom: 0, width: '64px', height: '64px', borderRadius: '16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--secondary)' }}>
              psychology
            </span>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Verification Engine
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, minHeight: '36px' }}>
            {loadingMessage}
          </p>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
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
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes loading-bar-anim {
            0% { left: -50%; }
            100% { left: 100%; }
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; filter: drop-shadow(0 0 8px rgba(255, 185, 95, 0.4)); }
            100% { transform: scale(1); opacity: 0.9; }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="exam-detail-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div className="app-header-rankora" style={{ marginBottom: '4px' }}>
        <div className="header-back-title">
          <button className="back-btn" onClick={onBack} aria-label="Back">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h3 className="header-title-text" style={{ fontSize: '15px' }}>{examName} Hub</h3>
        </div>
      </div>

      {/* Hero card */}
      <div className="hero-practice-card" style={{ padding: '20px 16px', marginBottom: '8px', textAlign: 'left', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--secondary)' }}>
            {selectedExam.icon || 'shield'}
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {examName} Prep
          </h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
          Access mock tests, solved papers, sectional quizzes, and adaptive practice engines.
        </p>
        <p style={{ fontSize: '12px', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '-10px 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#10b981' }}>bolt</span>
          every time fresh question
        </p>
        {/* Statistics row removed */}
      </div>

      {/* Grid of Categories (Clickable tabs) */}
      <div className="exam-categories-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
        {CATEGORY_GROUPS.map((group) => {
          const isSelected = activeCategory === group.id;
          const groupPapersCount = allPapers.filter(paper => paper.category === group.id).length;
          return (
            <div 
              key={group.id} 
              className={`category-group-card glass-card ${isSelected ? 'active-category-card' : ''}`} 
              style={{ 
                padding: '10px 10px', 
                borderRadius: '12px', 
                border: isSelected ? '1.5px solid var(--secondary)' : '1px solid var(--border-color)', 
                boxShadow: isSelected ? '0 0 10px rgba(255, 185, 95, 0.15)' : 'none',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '4px', 
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: isSelected ? 'rgba(30, 41, 59, 0.9)' : 'var(--bg-card)'
              }}
              onClick={() => setActiveCategory(group.id)}
            >
              <span className="material-symbols-outlined" style={{ color: group.accent, fontSize: '20px' }}>{group.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{group.title}</h4>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                  {groupPapersCount} {groupPapersCount === 1 ? 'Test' : 'Tests'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* List of tests for selected category */}
      <div className="category-tests-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginTop: '8px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '4px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--secondary)' }}>
            {CATEGORY_GROUPS.find(g => g.id === activeCategory)?.icon}
          </span>
          {CATEGORY_GROUPS.find(g => g.id === activeCategory)?.title}
        </h3>

        <div className="mock-tests-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {allPapers
            .filter((paper) => paper.category === activeCategory)
            .map((paper) => (
              <div
                key={paper.id}
                className="mock-test-row-item glass-card"
                style={{ 
                  padding: '10px 12px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleStartTest(paper)}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; }}
              >
                <div className="test-left-info" style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                  <div className="test-icon-box" style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#152031', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {paper.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="test-title-name" style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--text-primary)' }}>
                      {paper.title}
                    </h4>
                    <p className="test-stats-row" style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                      {paper.stats}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge-pill ${paper.badgeClass}`} style={{ fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                    {paper.badge}
                  </span>
                  <span className="material-symbols-outlined test-play-icon" style={{ fontSize: '20px', color: 'var(--secondary)' }}>play_circle</span>
                </div>
              </div>
            ))}

          {allPapers.filter((paper) => paper.category === activeCategory).length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No mock tests currently available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
