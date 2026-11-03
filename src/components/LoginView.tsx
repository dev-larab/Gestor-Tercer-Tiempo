import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { loadStoredUsers } from '../utils/storage';
import { INITIAL_USERS } from '../data/initialData';
import { loginWithGoogle } from '../firebase';
import { 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Crown,
  Clock,
  ChevronRight,
  Cloud,
  Sparkles
} from 'lucide-react';
import { DynamicBackground } from './DynamicBackground';


interface LoginViewProps {
  onLogin: (user: User) => void;
}

type ProfileType = 'admin' | 'responsable';

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Focus username input when entering credentials view
  useEffect(() => {
    if (selectedProfile) {
      usernameInputRef.current?.focus();
    }
  }, [selectedProfile]);

  const handleSelectProfile = (profile: ProfileType) => {
    setSelectedProfile(profile);
    setUsername('');
    setPassword('');
    setErrorMessage(null);
    setShowPassword(false);
  };

  const handleBackToProfiles = () => {
    setSelectedProfile(null);
    setUsername('');
    setPassword('');
    setErrorMessage(null);
    setShowPassword(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const fbUser = await loginWithGoogle();
      const isAdmin = fbUser.email?.toLowerCase() === 'borja.lara.lopez@gmail.com';
      const appUser: User = {
        id: fbUser.uid,
        username: fbUser.email ? fbUser.email.split('@')[0] : 'google-user',
        name: fbUser.displayName || fbUser.email || 'Usuario Google',
        role: isAdmin ? 'admin' : 'staff',
        roleLabel: isAdmin ? 'Administrador Oficial' : 'Responsable de Turno',
        badge: isAdmin ? 'Admin Oficial' : 'Turno',
        avatarColor: isAdmin ? 'amber' : 'emerald',
      };
      onLogin(appUser);
    } catch (err: any) {
      console.warn('Google sign-in info:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage('No se pudo completar el acceso con Google. Puedes acceder seleccionando tu perfil abajo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMessage('Por favor, introduce tu usuario y contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      let users = loadStoredUsers();

      // Look for user matching entered credentials
      let foundUser = users.find(
        (u) => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword
      );

      // Robust fallback for 'resp' or 'responsable' with Lurt1*
      if (!foundUser && cleanPassword === 'Lurt1*' && (cleanUsername === 'resp' || cleanUsername === 'responsable')) {
        const respUser = users.find(u => u.username === 'resp' || u.username === 'responsable' || u.role === 'staff');
        if (respUser) {
          foundUser = { ...respUser, password: 'Lurt1*' };
        } else {
          foundUser = { ...INITIAL_USERS[1], password: 'Lurt1*' };
        }
      }

      // Robust fallback for admin with Lurt@dmin1
      if (!foundUser && cleanPassword === 'Lurt@dmin1' && cleanUsername === 'admin') {
        const adminUser = users.find(u => u.username === 'admin' || u.role === 'admin');
        if (adminUser) {
          foundUser = { ...adminUser, password: 'Lurt@dmin1' };
        } else {
          foundUser = { ...INITIAL_USERS[0], password: 'Lurt@dmin1' };
        }
      }

      if (foundUser) {
        // Check if user matches selected profile
        const isMatchedProfile = selectedProfile === 'admin' 
          ? (foundUser.role === 'admin' || foundUser.username.toLowerCase() === 'admin')
          : (foundUser.role === 'staff' || foundUser.username.toLowerCase() === 'resp' || foundUser.username.toLowerCase() === 'responsable');

        if (isMatchedProfile) {
          setIsLoading(false);
          onLogin(foundUser);
        } else {
          // User exists but belongs to the other profile
          setIsLoading(false);
          setErrorMessage(
            `Estas credenciales pertenecen al ${
              foundUser.role === 'admin' ? 'Perfil Administrador' : 'Perfil Responsable de Turno'
            }. Pulsa "Cambiar de perfil" para seleccionarlo.`
          );
        }
      } else {
        setIsLoading(false);
        setErrorMessage(
          selectedProfile === 'admin'
            ? 'Usuario o contraseña de Administrador incorrectos.'
            : 'Usuario o contraseña de Responsable de Turno incorrectos.'
        );
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#070b09] text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      {/* Dynamic atmospheric moving background (aurora, pitch geometry & light mist) */}
      <DynamicBackground intensity="full" />


      <div className="w-full max-w-md relative z-10">
        {/* Club Brand Shield & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex relative mb-4 group">
            {/* Rugby Shield Badge */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-700 to-black p-0.5 shadow-2xl shadow-emerald-950/80 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#0d1411] rounded-[14px] flex items-center justify-center relative overflow-hidden border border-emerald-500/40">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/25 via-transparent to-black" />
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="w-11 h-11 text-emerald-400 transform -rotate-45 drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]"
                  stroke="currentColor" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <ellipse cx="12" cy="12" rx="10" ry="6" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <line x1="12" y1="6" x2="12" y2="18" />
                  <line x1="8" y1="7" x2="8" y2="17" />
                  <line x1="16" y1="7" x2="16" y2="17" />
                </svg>
              </div>
            </div>
            {/* Year Tag */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-950 border border-emerald-500/50 rounded-full text-[10px] font-bold text-emerald-300 tracking-wider whitespace-nowrap shadow-md">
              1983 • IRUÑA
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-rugby font-bold uppercase tracking-wider text-white">
            La Única <span className="text-emerald-400">Rugby Taldea</span>
          </h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Gestión de Terceros Tiempos <span className="text-emerald-500 font-semibold">• Hirugarren Denbora</span>
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0e1612]/95 border border-emerald-900/60 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-emerald-950/80">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Control de Acceso
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {selectedProfile 
                  ? 'Introduce las credenciales del perfil seleccionado'
                  : 'Selecciona tu perfil para acceder a la aplicación'}
              </p>
            </div>
            <span className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-150">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* VIEW 1: Profile Selection (2 Buttons) */}
          {!selectedProfile ? (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90 mb-1">
                Elige tu perfil de usuario:
              </p>

              {/* Button 1: Perfil Administrador */}
              <button
                type="button"
                id="btn-perfil-admin"
                onClick={() => handleSelectProfile('admin')}
                className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-[#121c16] hover:from-emerald-900/40 hover:to-[#17251d] border border-emerald-800/50 hover:border-emerald-500/70 transition-all duration-200 group relative overflow-hidden shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-amber-500/20 transition-all">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                        Perfil Administrador
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Admin
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      Acceso total, configuración, gestión de stock, proveedores y restablecimiento.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </button>

              {/* Button 2: Perfil Responsable de Turno */}
              <button
                type="button"
                id="btn-perfil-responsable"
                onClick={() => handleSelectProfile('responsable')}
                className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-[#101b15] to-[#121c16] hover:from-emerald-950/50 hover:to-[#17251d] border border-emerald-900/60 hover:border-emerald-500/70 transition-all duration-200 group relative overflow-hidden shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                        Perfil Responsable de Turno
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Turno
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      Gestión de barra, registro de consumos rápidos y control de existencias de jornada.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </button>

              {/* Separator & Google Sign-In */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-emerald-950/80 w-full" />
                <span className="bg-[#0e1612] px-3 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">o con cuenta google</span>
                <div className="border-t border-emerald-950/80 w-full" />
              </div>

              <button
                type="button"
                id="btn-login-google"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 p-3 rounded-xl bg-[#14201a] hover:bg-[#1a2b22] border border-emerald-800/40 hover:border-emerald-500/50 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-md disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Acceso rápido con Google</span>
              </button>

              <div className="mt-4 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50 flex items-center gap-2.5 text-[11px] text-emerald-300/80">
                <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Base de datos en la nube (Firebase Firestore) activa en tiempo real.</span>
              </div>
            </div>
          ) : (
            /* VIEW 2: Credentials Input Form for the Selected Profile */
            <div className="animate-in fade-in zoom-in-95 duration-200">
              {/* Profile Context Banner & Switch Profile Button */}
              <div className="flex items-center justify-between p-3 mb-5 rounded-xl bg-[#14201a] border border-emerald-900/60">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                    selectedProfile === 'admin' ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}>
                    {selectedProfile === 'admin' ? <Crown className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block font-medium">Perfil seleccionado:</span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {selectedProfile === 'admin' ? 'Perfil Administrador' : 'Perfil Responsable de Turno'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-cambiar-perfil"
                  onClick={handleBackToProfiles}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 border border-emerald-900/60 transition-all cursor-pointer"
                  title="Volver a la selección de perfiles"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cambiar perfil</span>
                  <span className="sm:hidden">Volver</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label 
                    htmlFor="login-username" 
                    className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5"
                  >
                    Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      ref={usernameInputRef}
                      id="login-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={selectedProfile === 'admin' ? 'admin' : 'resp'}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      autoComplete="username"
                      required
                      className="w-full bg-[#141f19] border border-emerald-900/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors outline-none font-mono"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>
                      Usuario sugerido:{' '}
                      <button
                        type="button"
                        onClick={() => setUsername(selectedProfile === 'admin' ? 'admin' : 'resp')}
                        className="text-emerald-400 hover:text-emerald-300 font-mono underline decoration-dotted"
                      >
                        {selectedProfile === 'admin' ? 'admin' : 'resp'}
                      </button>
                    </span>
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label 
                      htmlFor="login-password" 
                      className="block text-xs font-semibold uppercase tracking-wider text-emerald-400"
                    >
                      Contraseña
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Introduce tu contraseña"
                      autoComplete="current-password"
                      required
                      className="w-full bg-[#141f19] border border-emerald-900/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Entrar al Almacén</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Club Motto & Footer */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          <p className="font-rugby tracking-wider text-emerald-400/90 font-bold">
            HERRIA, TALDEA, ERRESUA
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            La Única Rugby Taldea • Sede UPNA Pamplona / Iruña
          </p>
        </div>
      </div>
    </div>
  );
};

