import Image from "next/image";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(160deg, #2E1065 0%, #4C1D95 40%, #6D28D9 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #A78BFA, transparent)",
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #C4B5FD, transparent)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Image src="/staf-logo.jpg" alt="Logo" width={128} height={128} />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            S.TA.F
          </h1>
          <p className="text-purple-200 text-sm tracking-widest font-medium">
            SAMPANA MANAGER
          </p>
        </div>

        {/* Card */}
        <LoginForm />

        <p className="text-center text-purple-300/60 text-xs mt-6">
          S.TA.F Sampana Manager © {new Date().getFullYear()} Tophy Lad
        </p>
      </div>
    </div>
  );
}
