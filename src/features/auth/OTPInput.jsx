export default function OTPInput({ otp, refs, onChange, onKeyDown }) {
  return (
    <div className="otp-boxes-container">
      {otp.map((digit, idx) => (
        <input
          key={idx}
          type="text"
          maxLength={1}
          className="otp-box"
          value={digit}
          ref={(el) => (refs.current[idx] = el)}
          onChange={(e) => onChange(e.target.value, idx)}
          onKeyDown={(e) => onKeyDown(e, idx)}
        />
      ))}
    </div>
  );
}
