'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { GraduationCap, Briefcase, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  {
    key: 'graduate',
    label: "I'm a Graduate",
    description: 'Access your VPS dashboard, challenges & skill verification',
    icon: GraduationCap,
    email: 'thabo@demo.vantage.co.za',
    password: 'Demo1234!',
    redirect: '/graduate/dashboard',
  },
  {
    key: 'employer',
    label: "I'm an Employer",
    description: 'Search verified talent & calculate hiring ROI',
    icon: Briefcase,
    email: 'employer@demo.vantage.co.za',
    password: 'Demo1234!',
    redirect: '/employer/dashboard',
  },
] as const;

export default function LoginClient() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoleSelect = async (role: (typeof ROLES)[number]) => {
    setLoading(role.key);
    try {
      const result = await signIn('credentials', {
        email: role.email,
        password: role.password,
        redirect: false,
        callbackUrl: role.redirect,
      });

      if (!result || result.error) {
        toast.error('Something went wrong. Please try again.');
        setLoading(null);
        return;
      }

      // Hard navigate to force middleware to re-evaluate with the new session
      window.location.href = role.redirect;
    } catch {
      toast.error('Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 gap-10">
      <div className="text-center">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center font-bold text-white mx-auto mb-5 text-xl">
          V
        </div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Who are you today?</h1>
        <p className="text-muted-foreground text-sm">
          Choose your role to continue — no credentials needed
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isLoading = loading === role.key;
          const isDisabled = loading !== null;

          return (
            <button
              key={role.key}
              onClick={() => handleRoleSelect(role)}
              disabled={isDisabled}
              className="
                flex-1 rounded-2xl border border-border/50 bg-card p-8
                flex flex-col items-center gap-4 text-center
                transition-all duration-200
                hover:scale-105 hover:border-teal-500/60
                hover:shadow-[0_0_28px_rgba(20,184,166,0.2)]
                disabled:opacity-60 disabled:cursor-not-allowed
                disabled:hover:scale-100 disabled:hover:shadow-none
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500
              "
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <Icon className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <p className="font-bold text-xl mb-1">{role.label}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {role.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
