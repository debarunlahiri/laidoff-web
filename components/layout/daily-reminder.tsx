"use client";
import { Leaf } from "lucide-react";

export default function DailyReminder() {
  return (
    <section className="card daily-card">
      <div className="rail-heading">
        <h3>Your daily reminder</h3>
        <Leaf size={17} />
      </div>
      <p>
        “Your worth doesn’t change
        <br />
        when your job does.”
      </p>
      <span>One chapter closes. You’re still the author.</span>
      <div className="quote-decoration" />
    </section>
  );
}
