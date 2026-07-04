import AuthCard from './AuthCard';

export default function LoginPage({ children }) {
  return (
    <div className='auth-container'>
      <AuthCard>
        {children}
      </AuthCard>
    </div>
  );
}
