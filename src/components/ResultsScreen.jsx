const getMotivationalMessage = (score, maxScore) => {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (percentage === 100) {
    return "Phenomenal! A perfect score. You are ready to ace the real exam!";
  } else if (percentage >= 80) {
    return "Outstanding job! Your dedication is showing. Keep up this brilliant momentum!";
  } else if (percentage >= 60) {
    return "Great effort! You've got a strong foundation. A little more practice and you'll be unstoppable.";
  } else if (percentage >= 40) {
    return "Good attempt! Keep reviewing your weak areas and practice daily to boost your score.";
  } else {
    return "Every step is progress. Analyze the correct answers, stay focused, and try again!";
  }
};

export default function ResultsScreen({ testResults, onGoToDashboard, onReattempt }) {
  if (!testResults) return null;

  return (
    <div className="auth-container">
      <div className="test-results-panel glass-card">
        <div className="score-circular-badge">
          <span className="score-badge-num">{testResults.score}</span>
          <span className="score-badge-label">Score</span>
        </div>

        <h2 className="results-headline">Test Completed!</h2>
        
        {/* Dynamic motivational quote message */}
        <p className="results-subtext" style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '16px', padding: '0 8px' }}>
          "{getMotivationalMessage(testResults.score, testResults.max_score)}"
        </p>

        <div className="results-stats-row">
          <div className="result-stat-card">
            <span className="result-stat-val">+{testResults.points_earned}</span>
            <span className="result-stat-lbl">Points Gained</span>
          </div>
          <div className="result-stat-card">
            <span className="result-stat-val blue-val">/{testResults.max_score}</span>
            <span className="result-stat-lbl">Max Score</span>
          </div>
        </div>

        <div className="result-stat-card" style={{ width: '100%', marginTop: '8px' }}>
          <span className="result-stat-val" style={{ color: '#fbbf24', fontSize: '15px' }}>
            {testResults.rank_name}
          </span>
          <span className="result-stat-lbl">New Rank Position</span>
        </div>
      </div>

      {/* Styled side-by-side action buttons for Home and Reattempt */}
      <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '320px', marginTop: '16px' }}>
        <button 
          className="orange-submit-btn gold-shimmer" 
          style={{ flex: 1, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
          onClick={onGoToDashboard}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>home</span>
          <span>Home</span>
        </button>
        <button 
          className="orange-submit-btn" 
          style={{ 
            flex: 1, 
            margin: 0, 
            background: 'transparent', 
            border: '1.5px solid var(--secondary)', 
            color: 'var(--secondary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px' 
          }} 
          onClick={onReattempt}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>replay</span>
          <span>Reattempt</span>
        </button>
      </div>
    </div>
  );
}
