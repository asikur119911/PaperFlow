"use client";

import { useEffect } from "react";
import Card from "@/components/ui/Card";

interface Props {
  success: boolean;
  message: string;
  onFinish?: () => void; // called after animation ends (redirect on success, dismiss on fail)
}

function AnimatedTick() {
  return (
    <svg viewBox="0 0 52 52" className="h-20 w-20">
      <circle
        cx="26" cy="26" r="24"
        fill="none" stroke="#22c55e" strokeWidth="3"
        style={{ strokeDasharray: 166, strokeDashoffset: 166, animation: "rc-circle 0.6s ease-in-out forwards" }}
      />
      <path
        fill="none" stroke="#22c55e" strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round"
        d="M14 27 l9 9 l16 -16"
        style={{ strokeDasharray: 48, strokeDashoffset: 48, animation: "rc-draw 0.4s 0.55s ease-in-out forwards" }}
      />
    </svg>
  );
}

function AnimatedCross() {
  return (
    <svg viewBox="0 0 52 52" className="h-20 w-20">
      <circle
        cx="26" cy="26" r="24"
        fill="none" stroke="#ef4444" strokeWidth="3"
        style={{ strokeDasharray: 166, strokeDashoffset: 166, animation: "rc-circle 0.6s ease-in-out forwards" }}
      />
      <path
        fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"
        d="M16 16 l20 20"
        style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: "rc-draw 0.3s 0.55s ease-in-out forwards" }}
      />
      <path
        fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"
        d="M36 16 l-20 20"
        style={{ strokeDasharray: 30, strokeDashoffset: 30, animation: "rc-draw 0.3s 0.65s ease-in-out forwards" }}
      />
    </svg>
  );
}

export default function ResultCard({ success, message, onFinish }: Props) {
  useEffect(() => {
    if (!onFinish) return;
    const delay = success ? 2500 : 3000;
    const t = setTimeout(onFinish, delay);
    return () => clearTimeout(t);
  }, [success, onFinish]);

  return (
    <>
      <style>{`
        @keyframes rc-circle { to { stroke-dashoffset: 0; } }
        @keyframes rc-draw   { to { stroke-dashoffset: 0; } }
      `}</style>

      <Card className="flex max-w-sm flex-col items-center gap-4 py-10">
        {success ? <AnimatedTick /> : <AnimatedCross />}
        <p className={`text-center text-sm font-medium ${success ? "text-green-600" : "text-red-500"}`}>
          {message}
        </p>
        {success && (
          <p className="text-xs text-slate-400">Redirecting to your dashboard…</p>
        )}
      </Card>
    </>
  );
}
