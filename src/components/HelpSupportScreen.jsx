import { useState } from 'react';

export default function HelpSupportScreen({ user, setCurrentScreen, showToast }) {
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "How does the session resume feature work?",
      a: "If you close your browser or navigate away during a live mock test, your answers and remaining time are saved in real-time. Navigate to 'History' from the sidebar and click 'Continue' to resume."
    },
    {
      q: "How are rank names calculated?",
      a: "Your rank name is calculated dynamically relative to other active aspirants based on total points. Rankora 1 indicates the user with the highest points."
    },
    {
      q: "What is the translation option in the test runner?",
      a: "While taking a test, click the Translate button on any question to instantly view it in alternate languages generated on-the-fly using advanced AI translation."
    },
    {
      q: "How can I earn Rankora points?",
      a: "You earn 1 point for every correct answer you submit on Mock Tests. Re-attempting already solved tests does not grant duplicate points."
    }
  ];

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) {
      showToast("Please fill in all ticket fields.", "error");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast("Support ticket submitted successfully!", "success");
      setTicketSubject("");
      setTicketMessage("");
    }, 1500);
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="help-support-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div className="app-header-rankora" style={{ marginBottom: '4px' }}>
        <div className="header-back-title">
          <button className="back-btn" onClick={() => setCurrentScreen('home')} aria-label="Back">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h3 className="header-title-text" style={{ fontSize: '15px' }}>Help & Support</h3>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="glass-card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)' }}>help_outline</span>
          Frequently Asked Questions
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                paddingBottom: '8px'
              }}
            >
              <button 
                type="button"
                onClick={() => toggleFaq(idx)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <span>{faq.q}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                  {activeFaq === idx ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {activeFaq === idx && (
                <p style={{ margin: '4px 0 8px 0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Support Form */}
      <form onSubmit={handleTicketSubmit} className="glass-card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)' }}>mail</span>
          Raise a Support Ticket
        </h4>

        <div className="input-field-container">
          <label className="input-label" style={{ fontSize: '11px' }}>Subject</label>
          <input 
            type="text" 
            className="auth-input"
            placeholder="What issue are you facing?"
            value={ticketSubject}
            onChange={(e) => setTicketSubject(e.target.value)}
            style={{ fontSize: '12px', padding: '10px 12px' }}
          />
        </div>

        <div className="input-field-container">
          <label className="input-label" style={{ fontSize: '11px' }}>Message Details</label>
          <textarea 
            className="auth-input"
            rows="4"
            placeholder="Describe your issue in detail so we can assist you..."
            value={ticketMessage}
            onChange={(e) => setTicketMessage(e.target.value)}
            style={{ fontSize: '12px', padding: '10px 12px', fontFamily: 'inherit', resize: 'none', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
          />
        </div>

        <button 
          type="submit" 
          className="orange-submit-btn gold-shimmer" 
          disabled={isSubmitting}
          style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 700, height: 'auto', marginTop: '6px' }}
        >
          {isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
        </button>
      </form>

      {/* Contact Direct Details */}
      <div className="glass-card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Direct Contact Information</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--secondary)' }}>call</span>
            <span>Support Line: +1 (800) 555-0199</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--secondary)' }}>support_agent</span>
            <span>Email Support: help@rankora.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
