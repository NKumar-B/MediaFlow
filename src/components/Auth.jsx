import React, { useState } from 'react';
import { Mail, Lock, User, Key, ShieldCheck, Flame, Eye, EyeOff } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { memoryDB } from '../services/db';

export default function Auth({ onAuthSuccess }) {
  const [screen, setScreen] = useState('user-login'); // user-login | user-signup | otp-verify | admin-login
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [adminData, setAdminData] = useState({ username: '', password: '' });
  
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [error, setError] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Visibility triggers
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Password Strength Evaluator
  const checkPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'bg-slate-800', width: '0%', text: '' };
    const hasAlpha = /[a-zA-Z]/.test(pwd);
    const hasDigits = /\d/.test(pwd);
    const hasSymbols = /[^a-zA-Z0-9]/.test(pwd);

    if (hasAlpha && hasSymbols && hasDigits) {
      return { label: 'Strong', color: 'bg-green-500', width: '100%', text: 'text-green-400' };
    }
    if (hasAlpha && (hasSymbols || hasDigits)) {
      return { label: 'Medium', color: 'bg-yellow-500', width: '75%', text: 'text-yellow-400' };
    }
    return { label: 'Weak', color: 'bg-red-500', width: '25%', text: 'text-red-400' };
  };

  // Sign In Process
  const handleUserLogin = (e) => {
    e.preventDefault();
    setError('');

    const matchedUser = memoryDB.findUser(loginData.email, loginData.password);
    if (!matchedUser) {
      return setError('Invalid email or password.');
    }

    onAuthSuccess({ email: matchedUser.email, name: matchedUser.name, role: 'user' });
  };

  // Admin Access Handler
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminData.username === 'admin' && adminData.password === 'admin@123') {
      setError('');
      onAuthSuccess({ username: 'admin', role: 'admin' });
    } else {
      setError('Invalid admin credentials.');
    }
  };

  // Submit Registration & Send OTP via EmailJS
  const handleSignup = (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    // Check if user exists in our memory database
    const existingUsers = memoryDB.getAllUsers();
    if (existingUsers.some(u => u.email === signupData.email)) {
      return setError('Email address already registered.');
    }

    setError('');
    setIsSendingEmail(true);

    // Generate a secure 6-digit verification code
    const secureOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(secureOtp);

    // Prepare payload for your EmailJS template
    const emailPayload = {
      user_name: signupData.name,
      user_email: signupData.email,
      otp_code: secureOtp,
    };

    // Replace these placeholders with your actual EmailJS IDs
    emailjs.send(
      'service_xn7geqp', 
      'template_f0os8mp', 
      emailPayload, 
      'niwqNcjwgLygVv1LW'
    )
    .then(() => {
      setIsSendingEmail(false);
      setScreen('otp-verify');
    })
    .catch((err) => {
      setIsSendingEmail(false);
      // Fallback: If EmailJS fails or keys are missing, display the code so you can still test it.
      setError(`Notice: Email couldn't be sent. Use the test code: ${secureOtp}`);
      setScreen('otp-verify');
    });
  };

  // Complete Registration validation
  const handleOtpVerify = (e) => {
    e.preventDefault();
    if (otpInput.trim() === generatedOtp) {
      setError('');
      
      // Save directly to the local memory store
      memoryDB.insertUser({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password
      });

      onAuthSuccess({ name: signupData.name, email: signupData.email, role: 'user' });
    } else {
      setError('Incorrect verification code. Please try again.');
    }
  };

  const strength = checkPasswordStrength(signupData.password);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 select-none font-sans">
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
        
        {/* Branding Title Block */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-tr from-purple-500 to-pink-500 p-3 rounded-2xl mb-3 shadow-lg">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-widest leading-none">
            MEDIA<span className="text-purple-400">FLOW</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-medium">Cloud Memory Portal</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs mb-4 text-center font-medium">
            {error}
          </div>
        )}

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
              <button 
                type="button" 
                onClick={() => setShowLoginPassword(!showLoginPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm tracking-wide">
              Sign In to Account
            </button>
            <div className="flex flex-col gap-3 text-center mt-3">
              <button type="button" onClick={() => { setScreen('user-signup'); setError(''); }} className="text-xs text-slate-400 hover:text-purple-400 transition font-medium">
                Create new user account
              </button>
              <button type="button" onClick={() => { setScreen('admin-login'); setError(''); }} className="text-xs text-slate-500 hover:text-slate-300 font-semibold underline underline-offset-4 transition">
                Go to Admin Portal
              </button>
            </div>
          </form>
        )}

        {/* --- USER SIGNUP VIEW --- */}
        {screen === 'user-signup' && (
          <form onSubmit={handleSignup} className="flex flex-col gap-3 animate-fade-in">
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
            
            {/* Real-time View/Hide Password Trigger */}
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

            {/* Dynamic Strength Color-fill Meter */}
            {signupData.password && (
              <div className="px-1 flex flex-col gap-1.5 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">Password strength:</span>
                  <span className={`text-[10px] font-black tracking-wide ${strength.text}`}>{strength.label}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: strength.width }}></div>
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

            <button type="submit" disabled={isSendingEmail} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm tracking-wide mt-2">
              {isSendingEmail ? 'Sending code...' : 'Proceed to OTP Verification'}
            </button>
            <button type="button" onClick={() => { setScreen('user-login'); setError(''); }} className="text-xs text-slate-400 hover:text-purple-400 mt-1 transition text-center font-medium">
              Existing user? Login
            </button>
          </form>
        )}

        {/* --- OTP VIEW --- */}
        {screen === 'otp-verify' && (
          <form onSubmit={handleOtpVerify} className="flex flex-col gap-4 animate-fade-in text-center">
            <div className="flex justify-center">
              <div className="bg-purple-500/10 p-3 rounded-full">
                <ShieldCheck className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-200 tracking-wide">OTP Verification</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">We've sent a code via EmailJS to your account. Enter the 6-digit code to complete registration.</p>
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
            <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-sm tracking-wide">
              Complete Validation
            </button>
            <button type="button" onClick={() => { setScreen('user-signup'); setError(''); }} className="text-xs text-slate-400 hover:text-purple-400 mt-1 font-medium">
              Back to registration
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
            <button type="button" onClick={() => { setScreen('user-login'); setError(''); }} className="text-xs text-slate-400 hover:text-purple-400 mt-2 transition text-center font-medium">
              Back to User Mode
            </button>
          </form>
        )}
      </div>
    </div>
  );
}