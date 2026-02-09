import { useState } from 'react';
import SignInScreen from './components/SignInScreen';
import LandingPage from './components/LandingPage';
import DataApp from './components/DataApp';
import { Toaster } from './components/ui/sonner';

type AppScreen = 'signin' | 'landing' | 'app';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('signin');
  const [uploadedData, setUploadedData] = useState<{ data: any[], headers: string[], fileName: string } | null>(null);

  const handleGetStarted = (data: any[], headers: string[], fileName: string) => {
    setUploadedData({ data, headers, fileName });
    setCurrentScreen('app');
  };

  return (
    <>
      {currentScreen === 'signin' && (
        <SignInScreen onSignIn={() => setCurrentScreen('landing')} />
      )}
      {currentScreen === 'landing' && (
        <LandingPage 
          onGetStarted={handleGetStarted}
          onBack={() => setCurrentScreen('signin')}
        />
      )}
      {currentScreen === 'app' && (
        <DataApp 
          onSignOut={() => setCurrentScreen('signin')}
          onGoHome={() => setCurrentScreen('landing')}
          onBack={() => setCurrentScreen('landing')}
          initialData={uploadedData?.data}
          initialHeaders={uploadedData?.headers}
          initialFileName={uploadedData?.fileName}
        />
      )}
      <Toaster position="top-right" />
    </>
  );
}