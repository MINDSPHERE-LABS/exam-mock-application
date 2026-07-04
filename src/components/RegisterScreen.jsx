import { useState, useRef } from 'react';

export default function RegisterScreen({ handleSendOTP, handleVerifyRegister, devOtp, setCurrentScreen }) {
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerMobile, setRegisterMobile] = useState('');
  const [registerOtp, setRegisterOtp] = useState(['', '', '', '', '', '']);
  const registerOtpRefs = useRef([]);

  const onSendOTP = () => {
    handleSendOTP(registerMobile);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const otpString = registerOtp.join('');
    handleVerifyRegister({
      first_name: registerFirstName,
      last_name: registerLastName,
      email: registerEmail,
      mobile: registerMobile,
      otp: otpString
    });
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...registerOtp];
    newOtp[index] = value;
    setRegisterOtp(newOtp);

    if (value !== '' && index < 5) {
      registerOtpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (registerOtp[index] === '' && index > 0) {
        const newOtp = [...registerOtp];
        newOtp[index - 1] = '';
        setRegisterOtp(newOtp);
        registerOtpRefs.current[index - 1].focus();
      } else {
        const newOtp = [...registerOtp];
        newOtp[index] = '';
        setRegisterOtp(newOtp);
      }
    }
  };

  return (
    <div className="auth-container">
      <div style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>
        <span className="app-brand-name">Rankora</span>
      </div>

      <form onSubmit={onSubmit} className="auth-card-panel glass-card">
        <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '20px' }}>Registration</h2>
        
        <div className="auth-form-group">
          <div className="auth-name-row">
            <div className="input-field-container">
              <label className="input-label">First Name</label>
              <input 
                type="text" 
                placeholder="First name" 
                className="auth-input"
                value={registerFirstName}
                onChange={(e) => setRegisterFirstName(e.target.value)}
              />
            </div>
            <div className="input-field-container">
              <label className="input-label">Last Name</label>
              <input 
                type="text" 
                placeholder="Last name" 
                className="auth-input"
                value={registerLastName}
                onChange={(e) => setRegisterLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="input-field-container">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="auth-input"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />
          </div>

          <div className="input-field-container">
            <label className="input-label">Mobile Number</label>
            <div className="phone-input-wrapper">
              <span className="phone-prefix">+91</span>
              <input 
                type="tel" 
                maxLength={10}
                placeholder="98765 43210" 
                className="phone-input"
                value={registerMobile}
                onChange={(e) => setRegisterMobile(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button 
              type="button" 
              className="otp-send-block-btn"
              onClick={onSendOTP}
              disabled={!registerMobile || registerMobile.length < 10}
            >
              Send OTP
            </button>
          </div>

          <div className="input-field-container">
            <label className="input-label">OTP Verification Code</label>
            <div className="otp-boxes-container">
              {registerOtp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className="otp-box"
                  value={digit}
                  ref={(el) => (registerOtpRefs.current[idx] = el)}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                />
              ))}
            </div>
            {devOtp && (
              <div style={{marginTop:'10px',padding:'10px',border:'1px solid #f59e0b',borderRadius:'8px',fontWeight:'bold'}}>
                DEV MODE OTP: {devOtp}
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="orange-submit-btn gold-shimmer">
          <span>JOIN</span>
          <div className="submit-arrow-circle">→</div>
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <span className="link-action" onClick={() => setCurrentScreen('login')}>Login instead</span>
        </div>
      </form>

      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginTop: '16px' }}>
        POWERED BY EXAMRANK ELITE ENGINE
      </div>
    </div>
  );
}
