const ALL_CATEGORIES = [
  { id: 'Banking', name: 'Banking', icon: 'account_balance', class: 'tile-banking' },
  { id: 'SSC', name: 'SSC', icon: 'groups', class: 'tile-ssc' },
  { id: 'Railways', name: 'Railways', icon: 'train', class: 'tile-railways' },
  { id: 'UPSC', name: 'UPSC', icon: 'school', class: 'tile-upsc' },
  { id: 'Insurance', name: 'Insurance', icon: 'shield', class: 'tile-insurance' },
  { id: 'Defence', name: 'Defence', icon: 'military_tech', class: 'tile-defence' },
  { id: 'Police & Security', name: 'Police & Security', icon: 'local_police', class: 'tile-police' },
  { id: 'Maharashtra State', name: 'Maharashtra State', icon: 'map', class: 'tile-maharashtra' },
  { id: 'Teaching', name: 'Teaching', icon: 'co_present', class: 'tile-teaching' }
];

export default function CategoriesScreen({ exams, setSelectedCategory, setCurrentScreen }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div className="app-header-rankora" style={{ marginBottom: '4px' }}>
        <div className="header-back-title">
          <button className="back-btn" onClick={() => setCurrentScreen('home')} aria-label="Back">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h3 className="header-title-text" style={{ fontSize: '15px' }}>Exam Categories</h3>
        </div>
      </div>

      {/* Description Info */}
      <div style={{ textAlign: 'left', padding: '0 8px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-primary)' }}>
          Choose Category
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          Select any category card to view its corresponding examinations and mock tests.
        </p>
      </div>

      {/* Categories stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 4px', paddingBottom: '24px' }}>
        {ALL_CATEGORIES.map((cat) => {
          const subcats = (exams || []).filter(exam => exam.category === cat.id);

          return (
            <div 
              key={cat.id} 
              className="category-accordion-item glass-card" 
              style={{ 
                borderRadius: '16px', 
                overflow: 'hidden', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-card)',
                transition: 'all 0.25s ease',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentScreen('exams');
              }}
            >
              {/* Category Card Header */}
              <div 
                className={`accordion-header ${cat.class}`} 
                style={{ 
                  padding: '16px 20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'rgba(30, 41, 59, 0.15)' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="category-icon-circle" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{cat.icon}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{cat.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      {subcats.length} {subcats.length === 1 ? 'Exam' : 'Exams'} Available
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ 
                  color: 'var(--text-secondary)'
                }}>
                  chevron_right
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

