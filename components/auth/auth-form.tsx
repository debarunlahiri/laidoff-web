"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, Users } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { googleSignInAvailable } from "@/lib/firebase";
import { sectionPaths } from "@/config/navigation";
import GoogleIcon from "./google-icon";

function readableError(error: unknown) {
  const code = (error as { code?: string }).code;
  if (code === "auth/popup-closed-by-user")
    return "Google sign-in was cancelled. You can try again.";
  if (code === "auth/popup-blocked")
    return "Allow popups for this site to continue with Google.";
  if (code === "auth/network-request-failed")
    return "Check your connection and try again.";
  if (code) return "Google sign-in couldn’t be completed. Please try again.";
  return error instanceof Error
    ? error.message
    : "Unable to sign in. Please try again.";
}
export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const registering = mode === "register";
  const { user, loading, login, register, loginGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const requestedPath = params.get("next") ?? "/";
  const destination = Object.values(sectionPaths).includes(requestedPath)
    ? requestedPath
    : "/";
  useEffect(() => {
    if (!loading && user) router.replace(destination);
  }, [user, loading, destination, router]);
  async function submitGoogle() {
    setBusy("google");
    setError("");
    try {
      await loginGoogle();
      router.replace(destination);
    } catch (error) {
      setError(readableError(error));
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <Link className="auth-brand" href="/login">
          <Users size={29} />
          LayoffCircle<span>.</span>
        </Link>
        <div>
          <span className="auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>
            A new beginning.
            <br />A circle behind you.
          </h1>
          <p>
            Find people who understand, discover opportunities, and take your
            next step together.
          </p>
          <div className="auth-community-note">
            <Users size={22} />
            <span>Different journeys. A shared way forward.</span>
          </div>
        </div>
        <p className="auth-story-footer">Laid off, not disconnected.</p>
      </aside>
      <main className="auth-main">
        <div className="auth-form-card">
          <span className="auth-eyebrow">WELCOME TO YOUR CIRCLE</span>
          <h2>{registering ? "Create your account" : "Welcome back"}</h2>
          <p className="auth-intro">
            {registering
              ? "You don’t have to figure out what’s next alone."
              : "Sign in to pick up where you left off."}
          </p>
          <button
            className="auth-google"
            disabled={Boolean(busy) || !googleSignInAvailable}
            onClick={() => void submitGoogle()}
          >
            <GoogleIcon />
            {busy === "google" ? (
              <LoaderCircle className="auth-spinner" size={18} />
            ) : null}
            Continue with Google
          </button>
          {!googleSignInAvailable && (
            <p className="auth-google-unavailable">
              Google sign-in is currently unavailable.
            </p>
          )}
          <div className="auth-divider">
            <span />
            or continue with email
            <span />
          </div>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              if (registering && password !== confirm) {
                setError("Your passwords don’t match.");
                return;
              }
              setBusy("email");
              try {
                if (registering)
                  await register(name.trim(), email.trim(), password);
                else await login(email.trim(), password);
                router.replace(destination);
              } catch (error) {
                setError(readableError(error));
              } finally {
                setBusy(null);
              }
            }}
          >
            <fieldset disabled={Boolean(busy)}>
              {registering && (
                <label htmlFor="full-name">
                  Full name
                  <input
                    id="full-name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your full name"
                  />
                </label>
              )}
              <label htmlFor="email-address">
                Email address
                <input
                  id="email-address"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label htmlFor="auth-password">
                Password
                <div className="auth-password">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      registering ? "new-password" : "current-password"
                    }
                    required
                    minLength={12}
                    maxLength={128}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={
                      registering
                        ? "At least 12 characters"
                        : "Enter your password"
                    }
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
              {registering && (
                <label htmlFor="confirm-password">
                  Confirm password
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={128}
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    placeholder="Enter your password again"
                  />
                </label>
              )}
              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}
              <button className="primary auth-submit" type="submit">
                {busy === "email" ? (
                  <LoaderCircle className="auth-spinner" size={18} />
                ) : null}
                {registering ? "Create account" : "Sign in"}
                <ArrowRight size={17} />
              </button>
            </fieldset>
          </form>
          <p className="auth-switch">
            {registering ? "Already part of the circle?" : "New here?"}{" "}
            <Link
              href={`${registering ? "/login" : "/register"}?next=${encodeURIComponent(destination)}`}
            >
              {registering ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
