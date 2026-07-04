import { useState, useEffect } from 'react';
import './App.css';
import Toast from './components/Toast';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import DashboardScreen from './components/DashboardScreen';
import ExamsScreen from './components/ExamsScreen';
import ProfileScreen from './components/ProfileScreen';
import TestRunnerScreen from './components/TestRunnerScreen';
import ResultsScreen from './components/ResultsScreen';
import ExamDetailScreen from './components/ExamDetailScreen';
import CategoriesScreen from './components/CategoriesScreen';
import HistoryScreen from './components/HistoryScreen';
import HelpSupportScreen from './components/HelpSupportScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login'); // login | register | home | exams | profile | test | results | exam-detail
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || '';
    } catch (e) {
      console.error("Local storage error:", e);
      return '';
    }
  });

  // Dashboard Data states
  const [exams, setExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mockTests, setMockTests] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ top_rankers: [], weekly_leaderboard: [] });
  const [selectedCategory, setSelectedCategory] = useState('Banking');
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDetailBackScreen, setExamDetailBackScreen] = useState('exams');

  // Typewriter states
  const [typewriterTop, setTypewriterTop] = useState('');
  const [typewriterBottom, setTypewriterBottom] = useState('');
  const [isTopDone, setIsTopDone] = useState(false);

  const [devOtp, setDevOtp] = useState('');

  // Active Test State
  const [activeTest, setActiveTest] = useState(null);
  const [activeTestAttemptId, setActiveTestAttemptId] = useState(null);
  const [resumeAnswers, setResumeAnswers] = useState(null);
  const [resumeTimeLeft, setResumeTimeLeft] = useState(null);
  const [testResults, setTestResults] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  // Typewriter logic for home screen hero
  useEffect(() => {
    if (currentScreen !== 'home') return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTypewriterTop('');
    setTypewriterBottom('');
    setIsTopDone(false);

    const topText = "Practice. Compete.";
    const bottomText = "Get Selected.";
    let i = 0;
    let j = 0;
    let topInterval;
    let bottomInterval;

    topInterval = setInterval(() => {
      if (i < topText.length) {
        setTypewriterTop(topText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(topInterval);
        setIsTopDone(true);

        bottomInterval = setInterval(() => {
          if (j < bottomText.length) {
            setTypewriterBottom(bottomText.substring(0, j + 1));
            j++;
          } else {
            clearInterval(bottomInterval);
          }
        }, 80);
      }
    }, 80);

    return () => {
      clearInterval(topInterval);
      if (bottomInterval) clearInterval(bottomInterval);
    };
  }, [currentScreen]);

  // Show Toast helper
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 8000); // 8 seconds so they have time to see the OTP
  };

  // Try to load user profile on startup if token exists
  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem('token', token);
      } catch (e) {
        console.error("Local storage error:", e);
      }
      fetchProfile();
    } else {
      try {
        localStorage.removeItem('token');
      } catch (e) {
        console.error("Local storage error:", e);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(null);
      setCurrentScreen('login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fetch initial dashboard data once logged in and poll every 1 minute to check for new exams/tests
  useEffect(() => {
    if (!user) return;

    fetchExams(searchQuery);
    fetchMockTests();
    fetchLeaderboard();

    const intervalId = setInterval(() => {
      fetchExams(searchQuery);
      fetchMockTests();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [user, searchQuery]);

  // --- API CALLS (Hoisted function declarations) ---

  async function fetchProfile() {
    try {
      const res = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (currentScreen === 'login' || currentScreen === 'register') {
          setCurrentScreen('home');
        }
      } else {
        // Token invalid, logout
        setToken('');
      }
    } catch (e) {
      console.error(e);
      showToast("Cannot connect to server. Running offline mock mode.", "error");
    }
  }

  async function fetchExams(query = '') {
    try {
      const url = query ? `/api/exams?q=${encodeURIComponent(query)}` : '/api/exams';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setExams(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchMockTests() {
    try {
      const res = await fetch('/api/tests');
      if (res.ok) {
        const data = await res.json();
        setMockTests(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchLeaderboard() {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleSendOTP = async (mobile) => {
    if (!mobile || mobile.length < 10) {
      showToast("Please enter a valid 10-digit mobile number.", "error");
      return;
    }
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      if (res.ok) {
        setDevOtp(data.otp || '123456');
        showToast(`OTP Sent! Use mock verification code: ${data.otp}`, "info");
      } else {
        showToast(data.detail || "Failed to send OTP", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Connection failed. Try master code: 123456", "error");
    }
  };

  const handleVerifyLogin = async (mobile, otpString) => {
    if (!mobile || mobile.length < 10) {
      showToast("Please enter a valid mobile number.", "error");
      return;
    }
    if (otpString.length < 6) {
      showToast("Please enter the 6-digit verification code.", "error");
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: otpString })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data);
        showToast(`Welcome back, ${data.first_name}!`, "info");
        setCurrentScreen('home');
      } else {
        showToast(data.detail || "Authentication failed.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Login connection error.", "error");
    }
  };

  const handleVerifyRegister = async ({ first_name, last_name, email, mobile, otp }) => {
    if (!first_name || !last_name || !email || !mobile) {
      showToast("Please fill in all identity details.", "error");
      return;
    }
    if (otp.length < 6) {
      showToast("Please enter the 6-digit OTP code.", "error");
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          otp,
          first_name,
          last_name,
          email
        })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data);
        showToast("Registration successful! Welcome to Rankora.", "info");
        setCurrentScreen('home');
      } else {
        showToast(data.detail || "Registration failed.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Registration connection error.", "error");
    }
  };

  const handleSaveProfile = async ({ first_name, last_name, email, avatar_url }) => {
    if (!first_name || !last_name || !email) {
      showToast("Name and email fields cannot be empty.", "error");
      return;
    }

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          avatar_url
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        showToast("Profile changes saved successfully!", "info");
        setCurrentScreen('home');
      } else {
        showToast(data.detail || "Failed to update profile.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to connect to save profile.", "error");
    }
  };

  // --- MOCK TEST FLOWS ---

  const startMockTest = async (test, customTitle = null, resumeAttemptId = null, resumeAnswers = null, resumeTimeLeft = null) => {
    let finalAttemptId = resumeAttemptId;
    
    // Call start test API if it is a new test attempt
    if (!resumeAttemptId && test?.id) {
      try {
        const title = customTitle || test.title;
        const res = await fetch(`/api/tests/${test.id}/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: title,
            duration_mins: test.duration_mins || test.questions?.length || 60,
            questions_count: test.questions?.length || 30
          })
        });
        if (res.ok) {
          const startData = await res.json();
          finalAttemptId = startData.attempt_id;
        }
      } catch (e) {
        console.error("Error starting test attempt:", e);
      }
    }

    setActiveTest(customTitle ? { ...test, title: customTitle } : test);
    setActiveTestAttemptId(finalAttemptId);
    setResumeAnswers(resumeAnswers);
    setResumeTimeLeft(resumeTimeLeft);
    setTestResults(null);
    setCurrentScreen('test');
  };

  const handleSubmitTest = async (answers) => {
    try {
      const res = await fetch(`/api/tests/${activeTest.id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          answers,
          attempt_id: activeTestAttemptId
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTestResults(data);
        fetchProfile();
        fetchLeaderboard();
        setCurrentScreen('results');
      } else {
        showToast(data.detail || "Failed to submit test.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Submit test error.", "error");
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    try {
      localStorage.removeItem('token');
    } catch (e) {
      console.error("Local storage error:", e);
    }
    setCurrentScreen('login');
    showToast("Logged out successfully.", "info");
  };

  const handleSelectExam = (exam, backScreen = 'exams') => {
    setSelectedExam(exam);
    setExamDetailBackScreen(backScreen);
    setCurrentScreen('exam-detail');
  };

  return (
    <div className="device-container">
      <div className="device-frame">
        {/* Dynamic Toast Notifications */}
        <Toast toast={toast} setToast={setToast} />

        <div className="app-content scroll-container">
          {/* 1. LOGIN SCREEN */}
          {currentScreen === 'login' && (
            <LoginScreen
              handleSendOTP={handleSendOTP}
              handleVerifyLogin={handleVerifyLogin}
              devOtp={devOtp}
              setCurrentScreen={setCurrentScreen}
            />
          )}

          {/* 2. REGISTRATION SCREEN */}
          {currentScreen === 'register' && (
            <RegisterScreen
              handleSendOTP={handleSendOTP}
              handleVerifyRegister={handleVerifyRegister}
              devOtp={devOtp}
              setCurrentScreen={setCurrentScreen}
            />
          )}

          {/* 3. HOME DASHBOARD */}
          {currentScreen === 'home' && user && (
            <DashboardScreen
              user={user}
              leaderboard={leaderboard}
              exams={exams}
              mockTests={mockTests}
              typewriterTop={typewriterTop}
              typewriterBottom={typewriterBottom}
              isTopDone={isTopDone}
              setCurrentScreen={setCurrentScreen}
              showToast={showToast}
              setSelectedCategory={setSelectedCategory}
              onSelectExam={(exam) => handleSelectExam(exam, 'home')}
              startMockTest={startMockTest}
              handleLogout={handleLogout}
            />
          )}

          {/* 3.5 ALL EXAM CATEGORIES SCREEN */}
          {currentScreen === 'categories' && (
            <CategoriesScreen
              exams={exams}
              setSelectedCategory={setSelectedCategory}
              setCurrentScreen={setCurrentScreen}
            />
          )}

          {/* 4. COMPETITIVE EDGE (EXAMS LIST) */}
          {currentScreen === 'exams' && (
            <ExamsScreen
              exams={exams}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setCurrentScreen={setCurrentScreen}
              onSelectExam={(exam) => handleSelectExam(exam, 'exams')}
            />
          )}

          {/* 4.5 EXAM DETAIL (PAPERS LIST) */}
          {currentScreen === 'exam-detail' && selectedExam && (
            <ExamDetailScreen
              selectedExam={selectedExam}
              mockTests={mockTests}
              startMockTest={startMockTest}
              setCurrentScreen={setCurrentScreen}
              onBack={() => setCurrentScreen(examDetailBackScreen)}
            />
          )}

          {/* 5. PROFILE SCREEN */}
          {currentScreen === 'profile' && user && (
            <ProfileScreen
              user={user}
              handleSaveProfile={handleSaveProfile}
              handleLogout={handleLogout}
              setCurrentScreen={setCurrentScreen}
              showToast={showToast}
            />
          )}

          {/* 6. MOCK TEST RUNNER SCREEN */}
          {currentScreen === 'test' && activeTest && (
            <TestRunnerScreen
              activeTest={activeTest}
              onSubmitTest={handleSubmitTest}
              onCancel={() => setCurrentScreen(examDetailBackScreen)}
              attemptId={activeTestAttemptId}
              resumeAnswers={resumeAnswers}
              resumeTimeLeft={resumeTimeLeft}
            />
          )}

          {/* 7. MOCK TEST RESULTS SCREEN */}
          {currentScreen === 'results' && testResults && (
            <ResultsScreen
              testResults={testResults}
              onGoToDashboard={() => setCurrentScreen('home')}
              onReattempt={() => startMockTest(activeTest)}
            />
          )}

          {/* 8. TEST HISTORY SCREEN */}
          {currentScreen === 'history' && user && (
            <HistoryScreen
              user={user}
              setCurrentScreen={setCurrentScreen}
              token={token}
              startMockTest={startMockTest}
            />
          )}

          {/* 9. HELP & SUPPORT SCREEN */}
          {currentScreen === 'support' && user && (
            <HelpSupportScreen
              user={user}
              setCurrentScreen={setCurrentScreen}
              showToast={showToast}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
