import { useState, useEffect } from 'react';

export default function HistoryScreen({ user, setCurrentScreen, token, startMockTest }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResuming, setIsResuming] = useState(false);
  const [resumeMessage, setResumeMessage] = useState("");

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/users/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Error fetching attempt history:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinueTest = async (attempt) => {
    setIsResuming(true);
    setResumeMessage("Resuming your mock test...");
    try {
      // 1. Fetch the full mock test details by ID
      const res = await fetch(`/api/tests/${attempt.mock_test_id}`);
      if (!res.ok) {
        throw new Error("Could not retrieve mock test details.");
      }
      const mockTest = await res.json();

      // 2. Start the test with resume parameters
      setIsResuming(false);
      startMockTest(
        mockTest,
        attempt.title,
        attempt.id,
        attempt.answers,
        attempt.time_left
      );
    } catch (e) {
      setIsResuming(false);
      alert(`Error resuming test: ${e.message}`);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  const getAnsweredCount = (answers) => {
    if (!answers) return 0;
    return answers.filter(ans => ans !== -1).length;
  };

  // Aggregated Stats
  const totalAttempts = history.length;
  const completedCount = history.filter(a => a.status === 'completed').length;
  const inProgressCount = history.filter(a => a.status === 'started').length;

  if (isResuming) {
    return (
      <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '30px 24px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center', width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="logo-shield-wrapper" style={{ animation: 'pulse 1.5s infinite ease-in-out', marginBottom: 0, width: '64px', height: '64px', borderRadius: '16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--secondary)' }}>
              history
            </span>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Restoring Session
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {resumeMessage}
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
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 0.9; }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="history-screen-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div className="app-header-rankora" style={{ marginBottom: '4px' }}>
        <div className="header-back-title">
          <button className="back-btn" onClick={() => setCurrentScreen('home')} aria-label="Back">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h3 className="header-title-text" style={{ fontSize: '15px' }}>Test History</h3>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '8px' }}>
        <div className="glass-card" style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', textAlign: 'center' }}>
          <span style={{ fontSize: '20px', color: 'var(--secondary)', fontWeight: 800 }}>{totalAttempts}</span>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Total</p>
        </div>
        <div className="glass-card" style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', textAlign: 'center' }}>
          <span style={{ fontSize: '20px', color: '#10b981', fontWeight: 800 }}>{completedCount}</span>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Completed</p>
        </div>
        <div className="glass-card" style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', textAlign: 'center' }}>
          <span style={{ fontSize: '20px', color: '#fbbf24', fontWeight: 800 }}>{inProgressCount}</span>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Active</p>
        </div>
      </div>

      {/* History List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '4px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--secondary)' }}>
            assignment
          </span>
          Your Mock Test Attempts
        </h3>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading attempt history...
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px 24px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'rgba(255,255,255,0.1)', marginBottom: '12px' }}>
              description
            </span>
            <p style={{ margin: 0, fontSize: '13px' }}>You haven't attempted any mock tests yet.</p>
          </div>
        ) : (
          <div className="attempts-list-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map((attempt) => {
              const isStarted = attempt.status === 'started';
              const answered = getAnsweredCount(attempt.answers);
              
              return (
                <div 
                  key={attempt.id}
                  className="mock-test-row-item glass-card"
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    cursor: 'default'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '70%' }}>
                      <div className="test-icon-box" style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#152031', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                          {isStarted ? 'pending_actions' : 'assignment_turned_in'}
                        </span>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {attempt.title}
                        </h4>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                          {formatDate(attempt.started_at)}
                        </span>
                      </div>
                    </div>

                    {!isStarted && (
                      <span 
                        className="badge-pill badge-solved"
                        style={{ 
                          fontSize: '9px', 
                          fontWeight: 800, 
                          padding: '3px 8px', 
                          borderRadius: '4px',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981'
                        }}
                      >
                        COMPLETED
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px', width: '100%' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {isStarted ? (
                        <span>{answered} / {attempt.max_score} answered</span>
                      ) : (
                        <span>Score: <strong style={{ color: 'var(--text-primary)' }}>{attempt.score}</strong> / {attempt.max_score}</span>
                      )}
                    </div>

                    {isStarted ? (
                      <button 
                        className="orange-submit-btn gold-shimmer"
                        style={{ 
                          width: 'fit-content', 
                          margin: 0, 
                          padding: '6px 14px', 
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          height: 'auto',
                          boxShadow: '0 0 10px rgba(255, 185, 95, 0.25)'
                        }}
                        onClick={() => handleContinueTest(attempt)}
                      >
                        <span>Continue</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', marginLeft: '4px' }}>play_circle</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                        Recorded
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
