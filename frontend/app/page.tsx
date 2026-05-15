"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      <header className="flex items-center justify-between px-8 py-6">
        <h1 className="text-xl font-bold tracking-wide">
          💬 ChatVerse
        </h1>

        <div className="space-x-4">
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2 rounded-full border border-gray-600 hover:bg-white hover:text-black transition"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/signup")}
            className="px-5 py-2 rounded-full bg-white text-black font-semibold hover:scale-105 transition"
          >
            Get Started
          </button>
        </div>
      </header>

      <section className="flex flex-col items-center justify-center text-center px-6 py-24">

        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Talk. Match. Connect. <br />
          <span className="text-purple-500">Instantly.</span>
        </h2>

        <p className="mt-6 text-gray-400 max-w-xl text-lg">
          A modern real-time chat & video platform where you only talk when
          both users agree. No spam. No strangers. Just real connections.
        </p>

        <div className="mt-10 flex gap-4">
          <button
            onClick={() => router.push("/signup")}
            className="px-6 py-3 bg-purple-600 rounded-full font-semibold hover:bg-purple-700 transition"
          >
            Start Chatting
          </button>

          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 border border-gray-600 rounded-full hover:bg-white hover:text-black transition"
          >
            I Already Have Account
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 px-10 py-20">

        <div className="p-6 rounded-2xl bg-gray-900 hover:scale-105 transition">
          <h3 className="text-xl font-bold mb-2">🔒 Mutual Chat System</h3>
          <p className="text-gray-400">
            Chat only starts when both users follow each other. No spam.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gray-900 hover:scale-105 transition">
          <h3 className="text-xl font-bold mb-2">⚡ Real-time Messaging</h3>
          <p className="text-gray-400">
            Instant chat powered by Socket.io with zero delay.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gray-900 hover:scale-105 transition">
          <h3 className="text-xl font-bold mb-2">🎥 Video Calls</h3>
          <p className="text-gray-400">
            Built-in WebRTC video calling for face-to-face chat.
          </p>
        </div>
      </section>

      <section className="text-center py-20 bg-gradient-to-t from-purple-900/30">
        <h2 className="text-3xl font-bold">
          Ready to meet someone new?
        </h2>

        <p className="text-gray-400 mt-3">
          Join thousands of users connecting in real-time.
        </p>

        <button
          onClick={() => router.push("/signup")}
          className="mt-6 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition"
        >
          Get Started Now
        </button>
      </section>

      <footer className="text-center text-gray-500 py-6 border-t border-gray-800">
        © {new Date().getFullYear()} ChatVerse. ❤️❤️❤️
      </footer>
    </div>
  );
}