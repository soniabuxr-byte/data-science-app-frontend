import { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BarChart3, Database, Sparkles, Wand2 } from 'lucide-react';
import { Button } from './ui/button';

interface MarketingLandingProps {
  onGetStarted: () => void;
  onTryNow: () => void;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export default function MarketingLanding({ onGetStarted, onTryNow }: MarketingLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const sections = useMemo(
    () => [
      {
        eyebrow: 'GUI-first analytics',
        title: 'Do data work without Python or advanced Excel.',
        body: 'Upload CSVs, explore and transform data, build charts, and ask questions in plain English — all from a clean, guided interface.',
        bullets: ['No notebooks', 'No formulas', 'No pivot-table gymnastics'],
        icon: Wand2,
        tint: 'from-blue-600 to-indigo-600',
      },
      {
        eyebrow: 'Explore & clean',
        title: 'Filter, sort, and reshape in seconds.',
        body: 'Find patterns quickly. Apply filters, export results, and keep your workflow visual and repeatable.',
        bullets: ['Search any column', 'One-click Top 10', 'Export cleaned CSV'],
        icon: Database,
        tint: 'from-purple-600 to-fuchsia-600',
      },
      {
        eyebrow: 'Join multiple CSVs',
        title: 'Combine 2–3 tables with guided joins.',
        body: 'Bring together data from multiple files (like orders + customers + products) to answer questions you can’t solve in a single sheet.',
        bullets: ['Inner & Left joins', 'Up to 3 key pairs', 'Preview before you create'],
        icon: BarChart3,
        tint: 'from-emerald-600 to-teal-600',
      },
      {
        eyebrow: 'Ask & explain',
        title: 'Get insights with an AI assistant.',
        body: 'Ask questions like “total sales by region” and get structured results you can share.',
        bullets: ['Natural language queries', 'Column stats at a glance', 'Actionable summaries'],
        icon: Sparkles,
        tint: 'from-amber-600 to-orange-600',
      },
    ],
    []
  );

  const activeIndex = useTransform(scrollYProgress, (p) => {
    const idx = Math.floor(clamp01(p) * sections.length);
    return Math.min(sections.length - 1, Math.max(0, idx));
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);
  const progressWidth = useTransform(scrollYProgress, (p) => `${clamp01(p) * 100}%`);

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#05070d]/80 backdrop-blur">
        <motion.div style={{ opacity: headerOpacity }} className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">Data Science App</div>
              <div className="text-xs text-white/60">GUI analytics for real work</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={onTryNow}>
              Try sample data
            </Button>
            <Button className="bg-white text-slate-900 hover:bg-white/90" onClick={onGetStarted}>
              Get started <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </motion.div>
        <div className="h-0.5 bg-white/10">
          <motion.div className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" style={{ width: progressWidth }} />
        </div>
      </div>

      <div ref={containerRef} className="relative">
        {/* Scroll story: tall container + sticky stage */}
        <div className="h-[340vh]" />

        <div className="pointer-events-none absolute inset-0">
          <div className="sticky top-[72px] h-[calc(100vh-72px)]">
            <div className="container mx-auto px-4 sm:px-6 h-full grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <motion.div className="text-white/70 text-xs tracking-widest uppercase">
                  <motion.span>
                    Scroll to explore
                  </motion.span>
                </motion.div>

                {sections.map((s, i) => {
                  const isActive = useTransform(activeIndex, (ai) => (ai === i ? 1 : 0));
                  const y = useTransform(activeIndex, (ai) => (ai === i ? 0 : 12));
                  const opacity = useTransform(activeIndex, (ai) => (ai === i ? 1 : 0));
                  const Icon = s.icon;

                  return (
                    <motion.div
                      key={s.title}
                      style={{ opacity, y }}
                      className="absolute max-w-xl"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`size-10 rounded-xl bg-gradient-to-br ${s.tint} flex items-center justify-center`}>
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-widest text-white/60">{s.eyebrow}</div>
                          <div className="text-2xl sm:text-3xl font-semibold leading-tight">{s.title}</div>
                        </div>
                      </div>

                      <p className="text-white/75 text-sm sm:text-base leading-relaxed">{s.body}</p>

                      <ul className="mt-5 grid sm:grid-cols-3 gap-2">
                        {s.bullets.map((b) => (
                          <li key={b} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm text-white/80">
                            {b}
                          </li>
                        ))}
                      </ul>

                      <motion.div style={{ opacity: isActive }} className="mt-7 flex gap-3 pointer-events-auto">
                        <Button className="bg-white text-slate-900 hover:bg-white/90" onClick={onGetStarted}>
                          Get started <ArrowRight className="ml-2 size-4" />
                        </Button>
                        <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={onTryNow}>
                          Try sample data
                        </Button>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right side “device” stage */}
              <div className="hidden lg:block">
                <motion.div
                  style={{
                    y: useTransform(scrollYProgress, [0, 1], [10, -10]),
                    opacity: useTransform(scrollYProgress, [0, 0.1], [0, 1]),
                  }}
                  className="relative mx-auto w-full max-w-lg"
                >
                  <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-3 shadow-2xl shadow-blue-900/30">
                    <div className="rounded-[22px] bg-[#0b1020] border border-white/10 overflow-hidden">
                      <div className="h-10 flex items-center justify-between px-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="size-2.5 rounded-full bg-red-400/80" />
                          <div className="size-2.5 rounded-full bg-yellow-400/80" />
                          <div className="size-2.5 rounded-full bg-green-400/80" />
                        </div>
                        <div className="text-xs text-white/60">Preview</div>
                        <div className="w-10" />
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="h-10 rounded-xl bg-white/5 border border-white/10" />
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-20 rounded-xl bg-white/5 border border-white/10" />
                          <div className="h-20 rounded-xl bg-white/5 border border-white/10" />
                          <div className="h-20 rounded-xl bg-white/5 border border-white/10" />
                        </div>
                        <div className="h-44 rounded-xl bg-white/5 border border-white/10" />
                        <div className="h-10 rounded-xl bg-gradient-to-r from-blue-600/80 to-indigo-600/80" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute -z-10 inset-0 blur-3xl opacity-50 bg-gradient-to-br from-blue-600/40 via-purple-600/20 to-emerald-600/30" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-16 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="text-lg font-semibold">Ready to turn CSVs into answers?</div>
            <div className="text-white/70 text-sm mt-1">
              Start with sample data or upload your own — joins, charts, exports, and AI included.
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={onTryNow}>
              Try sample data
            </Button>
            <Button className="bg-white text-slate-900 hover:bg-white/90" onClick={onGetStarted}>
              Get started <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

