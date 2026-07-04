import { useState, useEffect } from 'react';

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



export default function DashboardScreen({ 
  user, 
  leaderboard, 
  exams, 
  mockTests,
  typewriterTop, 
  typewriterBottom, 
  isTopDone, 
  setCurrentScreen, 
  showToast,
  setSelectedCategory,
  onSelectExam,
  startMockTest,
  handleLogout
}) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [featuredTest, setFeaturedTest] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const features = [
    {
      title: "AI Forecast Papers",
      description: "Attempt predictive mock exams dynamically calibrated to current exam trends.",
      icon: "insights",
      color: "var(--secondary)"
    },
    {
      title: "Session Resume Support",
      description: "Pause your mock test anytime. Save your answers & time remaining, and resume when ready.",
      icon: "restore",
      color: "#10b981"
    },
    {
      title: "Instant AI Translation",
      description: "Struggling with a language? Instantly translate any test question on-the-fly.",
      icon: "translate",
      color: "#6366f1"
    },
    {
      title: "Top Ranker Goodies",
      description: "Score high on mock tests, secure top leaderboard positions, and win exciting goodies & merchandise.",
      icon: "card_giftcard",
      color: "#ec4899"
    },
    {
      title: "Rankora Leaderboards",
      description: "Compete with other aspirants, earn points on successful answers, and rank up your profile.",
      icon: "leaderboard",
      color: "#fbbf24"
    }
  ];

  const slides = [features[features.length - 1], ...features, features[0]];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide(prev => prev + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, [features.length]);

  const handleTransitionEnd = () => {
    if (currentSlide === 0) {
      setIsTransitioning(false);
      setCurrentSlide(features.length);
    } else if (currentSlide === features.length + 1) {
      setIsTransitioning(false);
      setCurrentSlide(1);
    }
  };

  const goToSlide = (idx) => {
    setIsTransitioning(true);
    setCurrentSlide(idx + 1);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/tests/featured');
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data) {
            setFeaturedTest(data);
          }
        }
      } catch (error) {
        console.error("Error fetching featured mock test:", error);
      }
    };
    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubcategoryClick = (subcatName) => {
    if (exams && exams.length > 0) {
      const matchedExam = exams.find(e => e.name.toLowerCase() === subcatName.toLowerCase()) || 
                          exams.find(e => e.name.toLowerCase().includes(subcatName.toLowerCase())) ||
                          exams.find(e => subcatName.toLowerCase().includes(e.name.toLowerCase())) ||
                          exams[0];
      onSelectExam(matchedExam);
      setShowAllCategories(false);
    } else {
      showToast("Exams data is loading. Please wait.", "info");
    }
  };

  const handleLaunchDefaultExam = () => {
    if (exams && exams.length > 0) {
      const defaultExam = exams.find(e => e.name === "SBI PO") || exams[0];
      onSelectExam(defaultExam);
    } else {
      showToast("Loading exams data. Please try again.", "info");
    }
  };

  return (
    <div>
      {/* Navigation Drawer Overlay */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)} />
      )}

      {/* Navigation Drawer Panel */}
      <div className={`nav-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-profile-info">
            <img 
              alt="Student Profile" 
              className="drawer-avatar-img" 
              src={user.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBLcMYXUoRYHqj-tRbU-sUcWynOSjha_9CPpSCDRR4gdPn-lYfLsiQ7PslCWf8xa72DGxU5wiBKkupg3emMH9mXJZHvy1HV_Ezn0R23rhIxXx_hwGiwVF-BxNcydSw2_oRcH14o-HV6xehNBObaqwtHTjkz_xrBplTzwtdLZjx5VHmDiKk2uERRT3bJF4pEqFbSLTFcxs0fdtfy70Axej2vIoPmRuxlEJ5KhpwsFabQP0G_CPrX9X3_1-H3HgIQW9X5NTyaHivpZQg"} 
            />
            <div className="drawer-identity">
              <span className="drawer-name">{user.first_name} {user.last_name}</span>
              <span className="drawer-email">{user.email}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
            <div className="drawer-rank-badge" style={{ margin: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>military_tech</span>
              <span>{(user.rank_name || "Elite Rankora 42").replace("Rank ", "Rankora ")}</span>
            </div>
            <div className="drawer-rank-badge" style={{ margin: 0, background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.18)', color: '#10b981' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>stars</span>
              <span>{(user.points ?? 0).toLocaleString()}</span>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>×</button>
        </div>

        <div className="drawer-menu-items">
          <div className="drawer-menu-group-label">STUDENT DASHBOARD</div>
          
          <button className="drawer-item" onClick={() => { setIsDrawerOpen(false); setCurrentScreen('exams'); }}>
            <span className="material-symbols-outlined">school</span>
            <span>Exam Center</span>
          </button>

          <button className="drawer-item" onClick={() => { setIsDrawerOpen(false); setCurrentScreen('history'); }}>
            <span className="material-symbols-outlined">history</span>
            <span>History</span>
          </button>

          <button className="drawer-item" onClick={() => { setIsDrawerOpen(false); setCurrentScreen('profile'); }}>
            <span className="material-symbols-outlined">person</span>
            <span>My Profile</span>
          </button>

          <button className="drawer-item" onClick={() => {
            setIsDrawerOpen(false);
            const el = document.querySelector('.weekly-leaderboard') || document.querySelector('.leaderboard-container-card');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else {
              showToast("Leaderboard is displayed below on this dashboard.", "info");
            }
          }}>
            <span className="material-symbols-outlined">leaderboard</span>
            <span>Leaderboard</span>
          </button>

          <div className="drawer-menu-group-label">SUPPORT & ACCOUNT</div>

          <button className="drawer-item" onClick={() => { setIsDrawerOpen(false); setCurrentScreen('support'); }}>
            <span className="material-symbols-outlined">help</span>
            <span>Help & Support</span>
          </button>

          <button className="drawer-item logout-item" onClick={() => { setIsDrawerOpen(false); handleLogout(); }}>
            <span className="material-symbols-outlined">logout</span>
            <span>Sign Out</span>
          </button>
        </div>

        <div className="drawer-footer">
          <span>Rankora Portal v2.0.1</span>
          <span>Powered by Advanced Analytics</span>
        </div>
      </div>

      {/* Header */}
      <div className="app-header-rankora">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="back-btn" aria-label="Menu" onClick={() => setIsDrawerOpen(true)}>
            <span className="material-symbols-outlined text-primary">menu</span>
          </button>
          <div style={{ textAlign: 'left' }}>
            <span className="app-brand-name">Rankora</span>
          </div>
        </div>
        <div className="avatar-nav" onClick={() => setCurrentScreen('profile')}>
          <img 
            alt="Student Profile" 
            className="avatar-nav-img" 
            src={user.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBLcMYXUoRYHqj-tRbU-sUcWynOSjha_9CPpSCDRR4gdPn-lYfLsiQ7PslCWf8xa72DGxU5wiBKkupg3emMH9mXJZHvy1HV_Ezn0R23rhIxXx_hwGiwVF-BxNcydSw2_oRcH14o-HV6xehNBObaqwtHTjkz_xrBplTzwtdLZjx5VHmDiKk2uERRT3bJF4pEqFbSLTFcxs0fdtfy70Axej2vIoPmRuxlEJ5KhpwsFabQP0G_CPrX9X3_1-H3HgIQW9X5NTyaHivpZQg"} 
          />
        </div>
      </div>

      {/* Special Offer Banner */}
      <div className="promo-header-banner">
        <p style={{ margin: 0 }}>
          <span className="banner-text-tag">SPECIAL OFFER: </span>
          <span style={{ color: '#F8FAFC' }}>GET 50% OFF ON ALL PREMIUM MOCK TESTS!</span>
        </p>
        <button className="banner-claim-btn" onClick={() => showToast("Offer claimed! Premium access unlocked.", "info")}>CLAIM NOW</button>
      </div>

      {/* Practice. Compete. Hero Card with typewriter animation */}
      <div className="hero-practice-card" style={{ paddingBottom: '24px' }}>
        <h2 className="practice-title-large">
          <div className="text-primary">{typewriterTop}</div>
          <div className={`text-secondary ${!isTopDone ? '' : 'typewriter-cursor'}`}>{typewriterBottom}</div>
        </h2>
        <p className="practice-desc-sub" style={{ margin: '10px auto 0 auto', maxWidth: '280px' }}>
          India's premier high-stakes exam platform for Banking, SSC, and UPSC aspirants.
        </p>
      </div>

      {/* Rankora Portal Features Carousel/Slider */}
      <div 
        className="limited-challenge-box glass-card" 
        style={{ 
          border: '1px solid var(--border-color)', 
          background: 'var(--bg-card)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          position: 'relative',
          padding: '20px 24px',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '180px',
          boxSizing: 'border-box'
        }}
      >
        {/* Sliding Track Container */}
        <div style={{ overflow: 'hidden', width: '100%', height: '108px' }}>
          <div 
            onTransitionEnd={handleTransitionEnd}
            style={{ 
              display: 'flex', 
              width: `${slides.length * 100}%`, 
              height: '100%',
              transform: `translateX(-${currentSlide * (100 / slides.length)}%)`,
              transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
            }}
          >
            {slides.map((feature, idx) => (
              <div 
                key={idx} 
                style={{ 
                  width: `${100 / slides.length}%`,
                  flexShrink: 0,
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ width: '70%', textAlign: 'left' }}>
                  <span 
                    className="challenge-badge-top" 
                    style={{ 
                      position: 'static', 
                      display: 'inline-block', 
                      width: 'fit-content', 
                      marginBottom: '8px', 
                      background: 'rgba(255, 255, 255, 0.08)', 
                      color: 'var(--text-secondary)', 
                      border: '1px solid var(--border-color)',
                      padding: '3px 10px', 
                      borderRadius: '20px', 
                      fontSize: '9px', 
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    Portal Feature
                  </span>
                  
                  <div style={{ minHeight: '68px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h4 
                      style={{ 
                        fontSize: '16px', 
                        fontWeight: 800, 
                        margin: 0, 
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {feature.title}
                    </h4>
                    <p 
                      style={{ 
                        fontSize: '11px', 
                        color: 'var(--text-secondary)', 
                        margin: 0, 
                        lineHeight: 1.5 
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                <div 
                  style={{ 
                    width: '30%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-end', 
                    height: '80px',
                    paddingRight: '8px'
                  }}
                >
                  <div 
                    style={{ 
                      width: '54px', 
                      height: '54px', 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: feature.color,
                      boxShadow: `0 0 15px ${feature.color}1A`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                      {feature.icon}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', width: '100%' }}>
          {features.map((_, idx) => {
            const isActive = (currentSlide - 1) % features.length === idx || (currentSlide === 0 && idx === features.length - 1) || (currentSlide === features.length + 1 && idx === 0);
            return (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                style={{
                  width: isActive ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: isActive ? 'var(--secondary)' : 'rgba(255,255,255,0.15)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Exam Categories */}
      <div className="section-title">
        <span>Exam Categories</span>
        <span onClick={() => setCurrentScreen('categories')} style={{ cursor: 'pointer', color: 'var(--secondary)' }}>View All</span>
      </div>
      <div className="categories-grid">
        <div 
          className="category-tile-card tile-banking" 
          onClick={() => {
            setSelectedCategory('Banking');
            setCurrentScreen('exams');
          }}
        >
          <div className="category-icon-circle">
            <span className="material-symbols-outlined">account_balance</span>
          </div>
          <span className="category-label-name">Banking</span>
        </div>
        <div 
          className="category-tile-card tile-ssc" 
          onClick={() => {
            setSelectedCategory('SSC');
            setCurrentScreen('exams');
          }}
        >
          <div className="category-icon-circle">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <span className="category-label-name">SSC Exams</span>
        </div>
        <div 
          className="category-tile-card tile-upsc" 
          onClick={() => {
            setSelectedCategory('UPSC');
            setCurrentScreen('exams');
          }}
        >
          <div className="category-icon-circle">
            <span className="material-symbols-outlined">school</span>
          </div>
          <span className="category-label-name">UPSC Exams</span>
        </div>
        <div 
          className="category-tile-card tile-railways" 
          onClick={() => {
            setSelectedCategory('Railways');
            setCurrentScreen('exams');
          }}
        >
          <div className="category-icon-circle">
            <span className="material-symbols-outlined">train</span>
          </div>
          <span className="category-label-name">Railways</span>
        </div>
        <div 
          className="category-tile-card tile-insurance" 
          onClick={() => {
            setSelectedCategory('Insurance');
            setCurrentScreen('exams');
          }}
        >
          <div className="category-icon-circle">
            <span className="material-symbols-outlined">shield</span>
          </div>
          <span className="category-label-name">Insurance</span>
        </div>
        <div 
          className="category-tile-card tile-defence" 
          onClick={() => {
            setSelectedCategory('Defence');
            setCurrentScreen('exams');
          }}
        >
          <div className="category-icon-circle">
            <span className="material-symbols-outlined">military_tech</span>
          </div>
          <span className="category-label-name">Defence</span>
        </div>
      </div>

      {/* Top Rankers */}
      <div className="section-title">
        <span>Top Rankers</span>
        <span onClick={() => showToast("Full ranking system updates daily.", "info")}>View All</span>
      </div>
      <div className="rankers-strip">
        {leaderboard.top_rankers.map((ranker, i) => (
          <div className="ranker-card-small" key={i}>
            <div className={`ranker-badge-number pos-${i + 1}`}>#{i + 1}</div>
            <div className="ranker-avatar-frame">
              <img className="ranker-avatar-photo" src={ranker.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"} alt={ranker.first_name} />
            </div>
            <span className="ranker-name-lbl">
              {ranker.first_name} {ranker.last_name ? ranker.last_name.trim().charAt(0).toUpperCase() + '.' : ''}
            </span>
            <span className="ranker-score-lbl">Points: {ranker.points}</span>
            <span className="ranker-tier-badge">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                {i === 0 ? 'military_tech' : i === 1 ? 'stars' : 'workspace_premium'}
              </span>
              {ranker.rank_name}
            </span>
          </div>
        ))}
        {leaderboard.top_rankers.length === 0 && (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '10px' }}>Loading leaders...</div>
        )}
      </div>

      {/* Popular Mock Tests Section - redirected to launch details of pre-defined mock exam backer */}
      <div className="section-title">
        <span>Popular Mock Tests</span>
        <span className="material-symbols-outlined" style={{ color: 'var(--text-secondary)' }}>chevron_right</span>
      </div>
      <div className="mock-tests-list">
        {mockTests.map((test, index) => {
          const isPromo = index === 2 || test.title.includes("All India");
          return (
            <div 
              className={`mock-test-row-item ${isPromo ? 'highlight-test' : ''}`} 
              key={test.id} 
              onClick={handleLaunchDefaultExam}
            >
              <div className="test-left-info">
                <div className="test-icon-box">
                  <span className="material-symbols-outlined">
                    {isPromo ? 'military_tech' : index === 0 ? 'description' : 'history_edu'}
                  </span>
                </div>
                <div>
                  <h4 className="test-title-name">{test.title}</h4>
                  <p className="test-stats-row">
                    {isPromo ? "Starts in 2h 45m • Rankers Reward" : `${test.marks} Marks • ${test.duration_mins} Mins • ${test.attempts_count / 1000}k Attempts`}
                  </p>
                </div>
              </div>
              {isPromo ? (
                <button className="test-join-btn">JOIN</button>
              ) : (
                <span className="material-symbols-outlined test-play-icon">play_circle</span>
              )}
            </div>
          );
        })}
        {mockTests.length === 0 && (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '10px' }}>No tests available.</div>
        )}
      </div>

      {/* Weekly Leaderboard */}
      <div className="section-title">
        <span>Weekly Leaderboard</span>
      </div>
      <div className="leaderboard-container-card">
        <div className="leaderboard-table-header">
          <span>Aspirant</span>
          <span>Points</span>
        </div>
        <div className="divide-y divide-surface-variant/50">
          {leaderboard.weekly_leaderboard.map((aspirant, idx) => (
            <div className="leaderboard-row-record" key={idx}>
              <div className="lead-left-side">
                <span className={`lead-position-num ${idx === 0 ? 'pos-1' : ''}`}>{String(idx + 1).padStart(2, '0')}</span>
                <div className="lead-avatar-img">
                  <img className="lead-avatar-photo" src={aspirant.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"} alt={aspirant.first_name} />
                </div>
                <span className="lead-candidate-name">
                  {aspirant.first_name} {aspirant.last_name ? aspirant.last_name.trim().charAt(0).toUpperCase() + '.' : ''}
                </span>
              </div>
              <span className="lead-points-val">{(aspirant.points ?? 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
        {leaderboard.weekly_leaderboard.length === 0 && (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '10px' }}>Loading leaderboard entries...</div>
        )}
      </div>
    </div>
  );
}
