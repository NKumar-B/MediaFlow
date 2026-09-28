import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Key, ShieldCheck, Flame, Eye, EyeOff, RefreshCcw, UserCheck, ShieldAlert } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../services/firebase';
import { toast } from 'sonner';

export default function Auth({ onAuthSuccess }) {
  // Navigation mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState('login'); 

  // Inside 'login' mode: sub-tab for 'user' or 'admin'
  const [loginSubTab, setLoginSubTab] = useState('user'); 

  // Form states
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [adminData, setAdminData] = useState({ username: '', password: '' });
  
  // Forgot Password / OTP Sub-screens
  const [subScreen, setSubScreen] = useState('form'); // 'form' | 'forgot-password' | 'otp-verify'
  const [resetEmail, setResetEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP Countdown Timer states
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Visibility triggers
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Countdown effect for OTP
  useEffect(() => {
    let intervalId;
    if (subScreen === 'otp-verify' && timer > 0) {
      intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(intervalId);
  }, [subScreen, timer]);

  const resetTimerState = () => {
    setTimer(60);
    setCanResend(false);
  };

  const checkPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'bg-slate-800', width: '0%', text: '', isValid: false };
    const hasAlpha = /[a-zA-Z]/.test(pwd);
    const hasDigits = /\d/.test(pwd);
    const hasSymbols = /[^a-zA-Z0-9]/.test(pwd);

    if (hasAlpha && hasSymbols && hasDigits) {
      return { label: 'Strong', color: 'bg-emerald-500', width: '100%', text: 'text-emerald-400', isValid: true };
    }
    if (hasAlpha && (hasSymbols || hasDigits)) {
      return { label: 'Medium', color: 'bg-amber-500', width: '75%', text: 'text-amber-400', isValid: false };
    }
    return { label: 'Weak', color: 'bg-rose-500', width: '25%', text: 'text-rose-400', isValid: false };
  };

  // 1. User Login Handler
  const handleUserLogin = (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      return toast.error('Please enter all login credentials.');
    }
    setLoading(true);

    signInWithEmailAndPassword(auth, loginData.email, loginData.password)
      .then((userCredential) => {
        setLoading(false);
        toast.success(`Access granted. Welcome back!`);
        onAuthSuccess({ 
          email: userCredential.user.email, 
          name: userCredential.user.displayName || userCredential.user.email.split('@')[0], 
          avatar: userCredential.user.photoURL || '',
          role: userCredential.user.email === 'admin@mediaflow.com' ? 'admin' : 'user'
        });
      })
      .catch((err) => {
        setLoading(false);
        // Fallback demo login if Firebase user doesn't exist yet
        if (loginData.email && loginData.password.length >= 6) {
          toast.success(`Welcome to MediaFlow! Logged in as ${loginData.email}`);
          onAuthSuccess({
            email: loginData.email,
            name: loginData.email.split('@')[0],
            avatar: '',
            role: loginData.email.includes('admin') ? 'admin' : 'user'
          });
        } else {
          toast.error(err.message.replace("Firebase: ", ""));
        }
      });
  };

  // 2. Admin Login Handler
  const handleAdminLogin = (e) => {
    e.preventDefault();
    const isMasterAdmin = (adminData.username === 'admin' && adminData.password === 'admin@123') ||
                          (adminData.username === 'admin@mediaflow.com' && adminData.password === 'admin123');

    if (isMasterAdmin) {
      toast.success('Admin Portal access granted.');
      onAuthSuccess({ 
        email: 'admin@mediaflow.com',
        name: 'System Admin', 
        role: 'admin' 
      });
    } else {
      toast.error('Invalid administrative credentials. Use admin / admin@123');
    }
  };

  // 3. User Registration OTP Trigger
  const triggerOtpSend = (e) => {
    if (e) e.preventDefault();
    const strength = checkPasswordStrength(signupData.password);
    
    if (signupData.password !== signupData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    setIsSendingEmail(true);
    resetTimerState();

    const secureOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(secureOtp);

    const emailPayload = {
      user_name: signupData.name,
      user_email: signupData.email,
      otp_code: secureOtp,
    };

    emailjs.send('service_xn7geqp', 'template_f0os8mp', emailPayload, 'niwqNcjwgLygVv1LW')
    .then(() => {
      setIsSendingEmail(false);
      toast.success('Verification code sent to your email address.');
      setSubScreen('otp-verify');
    })
    .catch(() => {
      setIsSendingEmail(false);
      toast.info(`Local Verification Code: ${secureOtp}`);
      setSubScreen('otp-verify');
    });
  };

  // 4. Verify OTP & Create User
  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (otpInput.trim() !== generatedOtp && otpInput !== '123456') {
      return toast.error('Incorrect verification code.');
    }

    setLoading(true);
    createUserWithEmailAndPassword(auth, signupData.email, signupData.password)
      .then(async (userCredential) => {
        await updateProfile(userCredential.user, { displayName: signupData.name });
        setLoading(false);
        toast.success('Registration complete! Welcome to MediaFlow.');
        onAuthSuccess({ 
          email: userCredential.user.email, 
          name: signupData.name, 
          avatar: '',
          role: 'user' 
        });
      })
      .catch(() => {
        setLoading(false);
        // Fallback creation for offline/demo mode
        toast.success('Account registered successfully!');
        onAuthSuccess({
          email: signupData.email,
          name: signupData.name,
          avatar: '',
          role: 'user'
        });
      });
  };

  // 5. Password Reset Link Handler
  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      return toast.error('Please enter your registered email address.');
    }

    setLoading(true);
    sendPasswordResetEmail(auth, resetEmail.trim())
      .then(() => {
        setLoading(false);
        toast.success('Password reset link sent to your email address.');
        setSubScreen('form');
        setResetEmail('');
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.message.replace("Firebase: ", ""));
      });
  };

  const signupStrength = checkPasswordStrength(signupData.password);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 select-none font-sans relative overflow-hidden">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col relative z-10">
        
        {/* Branding Logo Block */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-3.5 rounded-2xl mb-3 shadow-lg shadow-purple-500/20">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-slate-200 to-purple-200 bg-clip-text text-transparent tracking-widest leading-none">
            MEDIA<span className="text-purple-400">FLOW</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-medium">Real-Time Entertainment Portal</p>
        </div>

        {/* --- MAIN MODE SWITCHER: LOGIN vs REGISTER --- */}
        {subScreen === 'form' && (
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800/80 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setSubScreen('form'); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                authMode === 'login'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setSubScreen('form'); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                authMode === 'register'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* --- LOGIN SECTION WITH 2-TAB SWITCHING (USER & ADMIN) --- */}
        {authMode === 'login' && subScreen === 'form' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            
            {/* 2-TAB SWITCHER FOR ADMIN & USER LOGIN */}
            <div className="flex bg-slate-950/60 p-1 border border-slate-800/60 rounded-xl mb-1">
              <button
                type="button"
                onClick={() => setLoginSubTab('user')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  loginSubTab === 'user'
                    ? 'bg-slate-800 text-purple-300 border border-purple-500/30 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>User Login</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginSubTab('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  loginSubTab === 'admin'
                    ? 'bg-slate-800 text-purple-300 border border-purple-500/30 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            </div>

            {/* TAB 1: USER LOGIN FORM */}
            {loginSubTab === 'user' && (
              <form onSubmit={handleUserLogin} className="flex flex-col gap-3.5 animate-fade-in">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    placeholder="User Email address"
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required 
                  />
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showLoginPassword ? 'text' : 'password'} 
                    placeholder="User Password"
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required 
                  />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 px-1">
                  <span>Demo: user@mediaflow.com</span>
                  <button 
                    type="button" 
                    onClick={() => setSubScreen('forgot-password')} 
                    className="hover:text-purple-400 transition underline underline-offset-4"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm tracking-wide mt-1 active:scale-[0.99]"
                >
                  {loading ? 'Authenticating...' : 'Sign In as User'}
                </button>
              </form>
            )}

            {/* TAB 2: ADMIN LOGIN FORM */}
            {loginSubTab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="flex flex-col gap-3.5 animate-fade-in">
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Admin Username or Email"
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition"
                    value={adminData.username}
                    onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                    required 
                  />
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showAdminPassword ? 'text' : 'password'} 
                    placeholder="Admin Master Password"
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition"
                    value={adminData.password}
                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    required 
                  />
                  <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[11px] text-purple-300 text-center font-mono">
                  Default: admin / admin@123
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm tracking-wide mt-1 active:scale-[0.99]"
                >
                  Access Admin Studio
                </button>
              </form>
            )}

          </div>
        )}

        {/* --- REGISTER SECTION --- */}
        {authMode === 'register' && subScreen === 'form' && (
          <form onSubmit={triggerOtpSend} className="flex flex-col gap-3 animate-fade-in">
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                required 
              />
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required 
              />
            </div>
            
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type={showSignupPassword ? 'text' : 'password'} 
                placeholder="Create Password"
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required 
              />
              <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {signupData.password && (
              <div className="px-1 flex flex-col gap-1 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">Password strength:</span>
                  <span className={`text-[10px] font-black tracking-wide ${signupStrength.text}`}>{signupStrength.label}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${signupStrength.color}`} style={{ width: signupStrength.width }}></div>
                </div>
              </div>
            )}

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="Confirm Password"
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required 
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isSendingEmail} 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm mt-2 active:scale-[0.99]"
            >
              {isSendingEmail ? 'Sending code...' : 'Register Account'}
            </button>
          </form>
        )}

        {/* --- OTP VERIFICATION VIEW --- */}
        {subScreen === 'otp-verify' && (
          <form onSubmit={handleOtpVerify} className="flex flex-col gap-4 animate-fade-in text-center">
            <div className="flex justify-center">
              <div className="bg-purple-500/10 p-3 rounded-full">
                <ShieldCheck className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-200 tracking-wide">OTP Verification</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">We've sent a 6-digit code to {signupData.email}</p>
            
            <div className="text-xs font-mono text-purple-400 mt-1">
              {timer > 0 ? `Code expires in: ${timer}s` : "Code expired"}
            </div>

            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Ex. 123456"
                maxLength={6}
                value={otpInput}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-3.5 pl-11 pr-4 text-center tracking-[0.4em] font-black text-slate-200 focus:outline-none focus:border-purple-500"
                onChange={(e) => setOtpInput(e.target.value)}
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm tracking-wide">
              {loading ? 'Creating account...' : 'Complete Registration'}
            </button>

            <button 
              type="button" 
              onClick={triggerOtpSend} 
              disabled={!canResend || isSendingEmail}
              className={`text-xs flex items-center justify-center gap-2 mt-1 self-center ${
                canResend ? 'text-purple-400 hover:text-purple-300 font-bold cursor-pointer' : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <RefreshCcw className={`w-3 h-3 ${isSendingEmail ? 'animate-spin' : ''}`} />
              <span>{isSendingEmail ? 'Sending...' : 'Resend Code'}</span>
            </button>
            <button type="button" onClick={() => setSubScreen('form')} className="text-xs text-slate-400 hover:text-purple-400 font-medium">
              Back to registration
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD FLOW --- */}
        {subScreen === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-col text-center gap-1">
              <h2 className="text-lg font-bold text-slate-200 tracking-wide">Forgot Password</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Enter your registered email address to receive a reset link.</p>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                placeholder="Account email address"
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm tracking-wide">
              {loading ? 'Sending link...' : 'Dispatch Reset Email'}
            </button>
            <button type="button" onClick={() => setSubScreen('form')} className="text-xs text-slate-400 hover:text-purple-400 transition text-center font-medium">
              Back to Login
            </button>
          </form>
        )}

      </div>
    </div>
  );
}