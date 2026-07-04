const CATEGORIES = [
  'Banking',
  'SSC',
  'Railways',
  'UPSC',
  'Insurance',
  'Defence',
  'Police & Security',
  'Maharashtra State',
  'Teaching'
];

export default function ExamsScreen({ 
  exams, 
  searchQuery, 
  setSearchQuery, 
  selectedCategory,
  setSelectedCategory,
  setCurrentScreen,
  onSelectExam
}) {
  // Filter exams by selectedCategory AND searchQuery
  const filteredExams = exams.filter((exam) => {
    const matchesCategory = exam.category === selectedCategory;
    const matchesSearch = exam.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="app-header-rankora">
        <div className="header-back-title">
          <button className="back-btn" onClick={() => setCurrentScreen('home')} aria-label="Back">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h3 className="header-title-text">Competitive Edge</h3>
        </div>
      </div>

      {/* Category Selection Tabs */}
      <div className="category-tabs-container" style={{ marginTop: '14px' }}>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              className={`category-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchQuery(''); // Reset search when switching categories
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Title Info */}
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>
          {selectedCategory} Exams
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Select an exam to start preparation
        </p>
      </div>

      {/* Search bar */}
      <div className="search-bar-wrapper glass-card" style={{ marginBottom: '16px' }}>
        <span className="material-symbols-outlined search-icon">search</span>
        <input 
          type="text" 
          className="search-input-box" 
          placeholder={`Search ${selectedCategory.toLowerCase()} exam...`} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Exams list */}
      <div className="exams-list-container">
        {filteredExams.map((exam) => (
          <div 
            className="exam-item-row glass-card" 
            key={exam.id}
            onClick={() => onSelectExam(exam)}
          >
            <div className="exam-left-side">
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>
                {exam.icon || 'shield'}
              </span>
              <span className="exam-name-lbl">{exam.name}</span>
            </div>
            <span className="exam-chevron">›</span>
          </div>
        ))}
        {filteredExams.length === 0 && (
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', padding: '20px' }}>
            No exams match your search in this category.
          </div>
        )}
      </div>
    </div>
  );
}
