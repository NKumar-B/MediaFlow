import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Key, ShieldCheck, Flame, Eye, EyeOff, RefreshCcw } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../services/firebase';
import { toast } from 'sonner';

export default function Auth({ onAuthSuccess }) {
  const [screen, setScreen] = useState('user-login'); 
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [adminData, setAdminData] = useState({ username: '', password: '' });
  
  // Password Reset States
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

  // Countdown effect
  useEffect(() => {
    let intervalId;
    if (screen === 'otp-verify' && timer > 0) {
      intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(intervalId);
  }, [screen, timer]);

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
      return { label: 'Strong', color: 'bg-green-500', width: '100%', text: 'text-green-400', isValid: true };
    }
    if (hasAlpha && (hasSymbols || hasDigits)) {
      return { label: 'Medium', color: 'bg-yellow-500', width: '75%', text: 'text-yellow-400', isValid: false };
    }
    return { label: 'Weak', color: 'bg-red-500', width: '25%', text: 'text-red-400', isValid: false };
  };

  // 1. Firebase Login Process
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
          name: userCredential.user.displayName || 'Subscribed User', 
          avatar: userCredential.user.photoURL || '',
          role: userCredential.user.email === 'admin@mediaflow.com' ? 'admin' : 'user'
        });
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.message.replace("Firebase: ", ""));
      });
  };

  // 2. Send Registration OTP via EmailJS
  const triggerOtpSend = (e) => {
    if (e) e.preventDefault();
    const strength = checkPasswordStrength(signupData.password);
    
    if (!strength.isValid) {
      return toast.warning('Your password must be Strong to proceed.');
    }
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
      toast.success('Verification code sent to your inbox.');
      setScreen('otp-verify');
    })
    .catch(() => {
      setIsSendingEmail(false);
      toast.info(`Local fallback enabled: Use test code ${secureOtp}`);
      setScreen('otp-verify');
    });
  };

  // 3. Match OTP and complete signup
  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (otpInput.trim() !== generatedOtp) {
      return toast.error('Incorrect verification code. Please try again.');
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
      .catch((err) => {
        setLoading(false);
        setScreen('user-signup');
        toast.error(err.message.replace("Firebase: ", ""));
      });
  };

  // 4. Send Password Reset Email Directly via Firebase
  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      return toast.error('Please enter your registered email address.');
    }

    setLoading(true);
    sendPasswordResetEmail(auth, resetEmail.trim())
      .then(() => {
        setLoading(false);
        toast.success('A secure password reset link has been dispatched to your email.');
        setScreen('user-login');
        setResetEmail('');
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.message.replace("Firebase: ", ""));
      });
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminData.username === 'admin' && adminData.password === 'admin@123') {
      toast.success('Admin Hub session established.');
      onAuthSuccess({ username: 'admin', role: 'admin' });
    } else {
      toast.error('Invalid administrative credentials.');
    }
  };

  const signupStrength = checkPasswordStrength(signupData.password);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 select-none font-sans">
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
        
        {/* Branding Logo Block */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-3 rounded-2xl mb-3 shadow-lg">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-widest leading-none">
            MEDIA<span className="text-purple-400">FLOW</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-medium">Secure Cloud Authentication</p>
        </div>

        {/* --- USER LOGIN VIEW --- */}
        {screen === 'user-login' && (
          <form onSubmit={handleUserLogin} className="flex flex-col gap-4 animate-fade-in">
            <h2 className="text-lg font-bold text-slate-200 tracking-wide text-center">User Sign In</h2>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required 
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type={showLoginPassword ? 'text' : 'password'} 
                placeholder="Password"
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-3.5 pl-12 pr-12 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required 
              />
              <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm tracking-wide">
              Sign In to Account
            </button>
            <div className="flex flex-col gap-3 text-center mt-3">
              <button type="button" onClick={() => setScreen('user-signup')} className="text-xs text-slate-400 hover:text-purple-400 transition font-medium">
                Create new user account
              </button>
              <button type="button" onClick={() => setScreen('forgot-password')} className="text-xs text-slate-500 hover:text-slate-300 transition font-medium underline underline-offset-4">
                Forgot Password?
              </button>
              <button type="button" onClick={() => setScreen('admin-login')} className="text-xs text-slate-500 hover:text-slate-300 font-semibold underline underline-offset-4 transition">
                Go to Admin Portal
              </button>
            </div>
          </form>
        )}

        {/* --- USER SIGNUP VIEW --- */}
        {screen === 'user-signup' && (
          <form onSubmit={triggerOtpSend} className="flex flex-col gap-3 animate-fade-in">
            <h2 className="text-lg font-bold text-slate-200 tracking-wide text-center">User Registration</h2>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
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
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required 
              />
            </div>
            
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type={showSignupPassword ? 'text' : 'password'} 
                placeholder="Secure Password"
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-3 pl-12 pr-12 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required 
              />
              <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {signupData.password && (
              <div className="px-1 flex flex-col gap-1.5 transition-all duration-300">
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
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-3 pl-12 pr-12 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required 
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" disabled={isSendingEmail} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm mt-2">
              {isSendingEmail ? 'Sending code...' : 'Proceed to OTP Verification'}
            </button>
            <button type="button" onClick={() => setScreen('user-login')} className="text-xs text-slate-400 hover:text-purple-400 mt-1 transition text-center font-medium">
              Existing user? Login
            </button>
          </form>
        )}

        {/* --- OTP VIEW WITH TIMER --- */}
        {screen === 'otp-verify' && (
          <form onSubmit={handleOtpVerify} className="flex flex-col gap-4 animate-fade-in text-center">
            <div className="flex justify-center">
              <div className="bg-purple-500/10 p-3 rounded-full">
                <ShieldCheck className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-200 tracking-wide">OTP Verification</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">We've sent a code via EmailJS to your account.</p>
            
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
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-3.5 pl-12 pr-4 text-center tracking-[0.4em] font-black text-slate-200 focus:outline-none focus:border-purple-500"
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
            <button type="button" onClick={() => setScreen('user-signup')} className="text-xs text-slate-400 hover:text-purple-400 mt-1 font-medium">
              Back to registration
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD NATIVE EMAIL LINK FLOW --- */}
        {screen === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-col text-center gap-1">
              <h2 className="text-lg font-bold text-slate-200 tracking-wide">Forgot Password</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Enter your registered email address below. We'll send you a link to reset your password safely.</p>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                placeholder="Account email address"
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm tracking-wide">
              {loading ? 'Sending link...' : 'Dispatch Reset Email'}
            </button>
            <button type="button" onClick={() => setScreen('user-login')} className="text-xs text-slate-400 hover:text-purple-400 transition text-center font-medium">
              Back to Login
            </button>
          </form>
        )}

        {/* --- ADMIN LOGIN VIEW --- */}
        {screen === 'admin-login' && (
          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4 animate-fade-in">
            <h2 className="text-lg font-bold text-slate-200 tracking-wide text-center">Admin Access Hub</h2>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Username"
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                value={adminData.username}
                onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                required 
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type={showAdminPassword ? 'text' : 'password'} 
                placeholder="Password"
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-3.5 pl-12 pr-12 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                value={adminData.password}
                onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                required 
              />
              <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm">
              Access Admin Portal
            </button>
            <button type="button" onClick={() => setScreen('user-login')} className="text-xs text-slate-400 hover:text-purple-400 mt-2 transition text-center font-medium">
              Back to User Mode
            </button>
          </form>
        )}
      </div>
    </div>
  );
}