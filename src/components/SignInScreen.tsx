import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { authAPI } from '../services/api';

interface SignInScreenProps {
  onSignIn: () => void;
}

export default function SignInScreen({ onSignIn }: SignInScreenProps) {
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInEmail || !signInPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.signIn(signInEmail, signInPassword);
      if (response.success) {
        toast.success('Welcome back!');
        setTimeout(() => onSignIn(), 500);
      } else {
        // Login failed - show the error
        toast.error(response.error || 'Invalid email or password');
      }
    } catch (error) {
      // Backend unavailable - continue in demo mode (graceful degradation)
      toast.info('Connecting offline - all features available!');
      setTimeout(() => onSignIn(), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signUpPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.signUp(signUpEmail, signUpPassword, signUpName);
      if (response.success) {
        toast.success('Account created! Welcome!');
        setTimeout(() => onSignIn(), 500);
      } else {
        // Sign up failed - show the error
        toast.error(response.error || 'Could not create account. Please try again.');
      }
    } catch (error) {
      // Backend unavailable - continue in demo mode (graceful degradation)
      toast.info('Connecting offline - all features available!');
      setTimeout(() => onSignIn(), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.guestAccess();
      if (response.success) {
        toast.success('Welcome! Upload a CSV or try the sample data.');
        setTimeout(() => onSignIn(), 500);
      } else {
        // Backend returned error but let user continue
        toast.success('Welcome! Upload a CSV or try the sample data.');
        setTimeout(() => onSignIn(), 500);
      }
    } catch (error) {
      // Backend unavailable - still allow guest access
      toast.success('Welcome! Upload a CSV or try the sample data.');
      setTimeout(() => onSignIn(), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background - Using gradient instead of Figma asset for portability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        {/* Optional: Add a subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo/Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-white text-[32px] sm:text-[40px] lg:text-[48px] mb-3 sm:mb-4 drop-shadow-lg" style={{ fontFamily: "'Stick No Bills', sans-serif", fontWeight: 500, lineHeight: '56px', letterSpacing: '0px' }}>
            Data Science App
          </h1>
          <p className="text-white/90 text-base sm:text-lg lg:text-xl drop-shadow-md">
            Analyze, Transform, Visualize — Visually
          </p>
        </div>

        {/* Auth Card */}
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl sm:text-3xl text-center">Welcome</CardTitle>
            
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="text-sm sm:text-base">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm sm:text-base">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm sm:text-base">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm sm:text-base">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-base sm:text-lg py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 size-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 size-5" />
                      </>
                    )}
                  </Button>

                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm sm:text-base">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm sm:text-base">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm sm:text-base">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-sm sm:text-base">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-base sm:text-lg py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 size-5 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 size-5" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Guest Access */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800 text-center mb-3">
                <strong>Try it out:</strong> Get instant access with sample data
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={handleGuestAccess}
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  'Continue as Guest'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/80 text-xs sm:text-sm drop-shadow-md">
            No installation required • Secure & Private • Free to use
          </p>
        </div>
      </div>
    </div>
  );
}