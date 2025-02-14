import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to AI Notes</h1>
        <p className="text-lg mb-8">A modern note-taking application with AI features</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md"
          >
            Create Account
          </a>
        </div>
      </div>
    </main>
  );
}
