import { useState, useRef } from 'react';

export default function LoginScreen({ handleSendOTP, handleVerifyLogin, devOtp, setCurrentScreen }) {
  const [loginMobile, setLoginMobile] = useState('');
  const [loginOtp, setLoginOtp] = useState(['', '', '', '', '', '']);
  const loginOtpRefs = useRef([]);

  const onSendOTP = () => {
    handleSendOTP(loginMobile);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const otpString = loginOtp.join('');
    handleVerifyLogin(loginMobile, otpString);
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...loginOtp];
    newOtp[index] = value;
    setLoginOtp(newOtp);

    if (value !== '' && index < 5) {
      loginOtpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (loginOtp[index] === '' && index > 0) {
        const newOtp = [...loginOtp];
        newOtp[index - 1] = '';
        setLoginOtp(newOtp);
        loginOtpRefs.current[index - 1].focus();
      } else {
        const newOtp = [...loginOtp];
        newOtp[index] = '';
        setLoginOtp(newOtp);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo-section">
        <span className="app-brand-name">Rankora</span>
        <div className="logo-shield-wrapper" style={{ marginTop: '14px' }}>
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '36px' }}>shield</span>
        </div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Enter your credentials to access your prep dashboard.</p>
      </div>

      <form onSubmit={onSubmit} className="auth-card-panel glass-card">
        <div className="auth-form-group">
          <div className="input-field-container">
            <label className="input-label">Mobile Number</label>
            <div className="phone-input-wrapper">
              <span className="phone-prefix">+91</span>
              <input 
                type="tel" 
                maxLength={10}
                placeholder="Enter 10 digit number" 
                className="phone-input"
                value={loginMobile}
                onChange={(e) => setLoginMobile(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button 
              type="button" 
              className="otp-send-block-btn"
              onClick={onSendOTP}
              disabled={!loginMobile || loginMobile.length < 10}
            >
              Send OTP
            </button>
          </div>

          <div className="input-field-container">
            <label className="input-label">One-Time Password (OTP)</label>
            <div className="otp-boxes-container">
              {loginOtp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className="otp-box"
                  value={digit}
                  ref={(el) => (loginOtpRefs.current[idx] = el)}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                />
              ))}
            </div>
            <div className="otp-helper-row">
              <span>Didn't receive it?</span>
              <span className="link-action" onClick={onSendOTP}>Resend in 0:45</span>
            </div>
            {devOtp && (
              <div style={{marginTop:'10px',padding:'10px',border:'1px solid #f59e0b',borderRadius:'8px',fontWeight:'bold'}}>
                DEV MODE OTP: {devOtp}
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="orange-submit-btn gold-shimmer">
          <span>LOGIN</span>
          <div className="submit-arrow-circle">→</div>
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>New here? </span>
          <span className="link-action" onClick={() => setCurrentScreen('register')}>Create an account</span>
        </div>
      </form>

      <div className="trusted-toppers-panel glass-card">
        <div className="topper-avatars-row">
          <div className="topper-mini-avatar">
            <img className="topper-avatar-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSyjlXDkg1ZDPfeiVoJ87HjdUp_4G9OYHjiGFetaPvEO0NpjEVNQqqY9A5zgyZiAX7NofwcmsdYKQZYFePBwrtJmmheEOwjTsbAyAEwwb1jdSWcjXb84ho0WvlOCS49svpZLxc9HPM0d2TcxEp938dQVhIyBYxqULcCCgCTDDeVwqo5tiBuAoZ5jayoPQccIgWombTGPwzNaLMF6eEghAiVae2nno4hTBNidA6JIv3X0qrVYil9-AJstRlzfstCewsXG7pk85QRMs" alt="Topper" />
          </div>
          <div className="topper-mini-avatar">
            <img className="topper-avatar-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGGkF8Br19OQnZcgKJWMldaHNDPavS-Tq7biqlzce1EwS2jC6ycyS9GAdGRSln2ivsEknpJfNnMYbGKRUVSnbLOJZtfkT8SftdkYEPSX1SM75Zdt-jqWojjQwXcw1-Ao27wlpypC6nRNxTLFzK57ap5nWawuu4z1VBwPskDUxc07ptTKda9q9VO3Lm1kmfDka-t-4J_VRShRoAOTnni5f2mu4NfQgFMgGDvAt3T91kieK5FZAwXQrpWMx3fHQCpid8bP6M9KtgVew" alt="Topper" />
          </div>
          <div className="topper-mini-avatar">
            <img className="topper-avatar-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCUmYo_dZJosJtsyIrqesY3ft2ncwiKuRMYLhdrZ9HGsEZAuhmCKTSB3ZRnFc73Mhj5dLDaJUDFYgweVPrpW2cUdebXK36y2BApp5mAZoDFM59D07udk1XPTD7wq0m9WesRTWvAocHUocYMAlmYMR5qp-zUyKTZsxyeV9x3ADw21tk0FhWN4PyCSy80JbUcWXQh0cAT4vqdbiPad35xdpphOhNmRYR9KB2AH8Ek2AUDbeJiPdINJcQFcZGWgyzdNkcHI-rCa6bV4k" alt="Topper" />
          </div>
          <div className="topper-count-badge">+10k</div>
        </div>
        <h4 className="trusted-text-title">Trusted by 10k+ Toppers</h4>
        <p className="trusted-text-desc">Join the elite community of successful government exam candidates.</p>
      </div>
    </div>
  );
}
