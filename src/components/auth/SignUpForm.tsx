"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/app/auth/signup/actions";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await signUpAction(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        // Navigate client-side after successful signup
        router.push("/auth/signin");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } catch (err) {
      console.error("Sign up action error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1 text-accent">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="input"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1 text-accent">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1 text-accent">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="input"
          placeholder="••••••••"
        />
        <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.6)' }}>At least 8 characters</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}
