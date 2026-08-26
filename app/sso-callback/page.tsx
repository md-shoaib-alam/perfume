import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-3 border-[#d09e44] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">Completing authentication...</p>
      </div>
      <AuthenticateWithRedirectCallback 
        signInForceRedirectUrl="/" 
        signUpForceRedirectUrl="/" 
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        continueSignUpUrl="/"
      />
    </div>
  );
}
