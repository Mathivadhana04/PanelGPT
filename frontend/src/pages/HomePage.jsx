import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PERSONA_LIST } from '../utils/constants';
import Button from '../components/ui/Button';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="hero-bg flex flex-col min-h-screen relative overflow-hidden">
      {/* Floating background particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-24 h-24 rounded-full bg-accent/5 animate-particle-float" />
        <div className="absolute top-[60%] right-[15%] w-32 h-32 rounded-full bg-purple-500/5 animate-particle-float [animation-delay:2s]" />
        <div className="absolute bottom-[10%] left-[40%] w-16 h-16 rounded-full bg-pink-500/5 animate-particle-float [animation-delay:4s]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-12 z-10 py-16 max-w-6xl mx-auto w-full">
        {/* Tagline */}
        <span className="px-4 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20 text-xs font-bold uppercase tracking-wider font-heading mb-6 animate-debate-appear">
          Powered by Local Llama 3 & Ollama
        </span>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight leading-tight max-w-4xl text-primary animate-debate-appear [animation-delay:100ms]">
          Every Topic. <span className="gradient-text">Every Perspective.</span> All At Once.
        </h1>

        <p className="text-sm md:text-base text-secondary max-w-2xl mt-6 leading-relaxed animate-debate-appear [animation-delay:200ms]">
          Simulate real-time, intellectually engaging debates between multiple custom-tailored AI personalities. Enter any question and watch the sparks fly.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center animate-debate-appear [animation-delay:300ms]">
          <Link to={isAuthenticated ? "/debate" : "/register"}>
            <Button size="lg" className="px-8 py-4 text-base">
              Start Debating Now
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-base">
              Learn More
            </Button>
          </a>
        </div>

        {/* Signature 3D Panel Stage */}
        <div className="mt-20 w-full max-w-4xl relative min-h-[340px] flex items-center justify-center perspective-1000 animate-debate-appear [animation-delay:400ms]">
          <div className="absolute bottom-4 w-full h-8 bg-black/40 rounded-full blur-xl" />
          <div className="flex gap-4 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-6 w-full lg:justify-center">
            {PERSONA_LIST.map((persona, index) => {
              // 3D rotation angles for fan effect
              const rotationY = (index - 2.5) * 10;
              const translateZ = Math.abs(index - 2.5) * -12;
              const translateY = Math.abs(index - 2.5) * 4;

              return (
                <div
                  key={persona.id}
                  style={{
                    transform: `rotateY(${rotationY}deg) translateZ(${translateZ}px) translateY(${translateY}px)`,
                    borderColor: `${persona.color}25`,
                    transformStyle: 'preserve-3d',
                  }}
                  className="w-40 lg:w-44 flex-shrink-0 bg-surface border rounded-2xl p-5 flex flex-col items-center shadow-glass transition-all duration-300 hover:scale-105 hover:border-accent"
                >
                  <span className="text-3xl mb-3">{persona.icon}</span>
                  <h4 className="font-heading font-bold text-primary text-xs tracking-tight line-clamp-1">{persona.name}</h4>
                  <p style={{ color: persona.color }} className="text-[10px] font-bold uppercase tracking-wider font-heading mt-1">
                    {persona.role}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="w-full bg-bg-secondary/40 border-t border-border py-20 px-6 md:px-12 z-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-primary tracking-tight">
              Features Built for Intellect
            </h2>
            <p className="text-xs md:text-sm text-secondary mt-2">
              Advanced, full-stack tools to elevate debate simulators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-3">
              <span className="text-2xl">⚡</span>
              <h4 className="font-heading font-bold text-primary">Real-Time Streaming</h4>
              <p className="text-xs text-secondary leading-relaxed">
                Server-Sent Events (SSE) stream responses live. Debaters analyze, draft, and respond sequentially with staggered animations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-3">
              <span className="text-2xl">🎭</span>
              <h4 className="font-heading font-bold text-primary">Distinct AI Personas</h4>
              <p className="text-xs text-secondary leading-relaxed">
                Empirical Scientist, Contrarian, Visionary, Ethicist, and more. Customize system instructions to bring your own voices onto the stage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-3">
              <span className="text-2xl">💾</span>
              <h4 className="font-heading font-bold text-primary">Cloud History & Stats</h4>
              <p className="text-xs text-secondary leading-relaxed">
                Save debates, analyze key concepts using built-in keyword extraction, track debate stats, and export content as Markdown.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
