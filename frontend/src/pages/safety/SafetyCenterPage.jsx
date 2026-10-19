import React from 'react';
import { ShieldCheck, UserX, AlertOctagon, HeartHandshake, FileText, ArrowRight, ShieldAlert, LifeBuoy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SafetyCenterPage() {
  const safetyCards = [
    {
      title: 'Blocked Accounts',
      desc: 'Inspect and manage people you have blocked from contacting or viewing you.',
      path: '/safety/blocked',
      icon: UserX,
      color: 'text-red-400 bg-red-500/10'
    },
    {
      title: 'Restricted Accounts',
      desc: 'Silently protect your profile from unwanted interactions without unfriending or alerting.',
      path: '/safety/restricted',
      icon: ShieldAlert,
      color: 'text-amber-400 bg-amber-500/10'
    },
    {
      title: 'Submit a Report',
      desc: 'Flag harassment, hate speech, counterfeit media, or copyright violations.',
      path: '/reports/new',
      icon: AlertOctagon,
      color: 'text-purple-400 bg-purple-500/10'
    },
    {
      title: 'My Report History',
      desc: 'Track the progress, status, and resolution decisions on your filed moderation cases.',
      path: '/reports/history',
      icon: FileText,
      color: 'text-sky-400 bg-sky-500/10'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-purple-950/30 border border-neutral-800 shadow-2xl relative overflow-hidden">
        <div className="max-w-xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Community Trust & Safety</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 tracking-tight">
            Safety Center & Anti-Harassment
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Insta is committed to creating an authentic, supportive, and safe space for expression. Learn about our safety policies, community standards, and proactive defenses.
          </p>
        </div>
      </div>

      {/* Safety Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {safetyCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.path}
              to={card.path}
              className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-2xl hover:border-pink-500/50 transition-all flex flex-col justify-between group shadow-sm h-40"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-100 group-hover:text-pink-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1">{card.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Guidelines summary */}
      <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl space-y-4">
        <h2 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-pink-400" />
          <span>Core Community Principles</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-400">
          <div className="space-y-1">
            <h4 className="font-semibold text-neutral-200">1. Authenticity & Respect</h4>
            <p className="text-[11px]">Do not impersonate others or share unauthorized copyrighted works.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-neutral-200">2. Zero Tolerance for Bullying</h4>
            <p className="text-[11px]">Threats, harassment, doxxing, or coordinated brigading result in permanent account bans.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-neutral-200">3. Honest Interaction</h4>
            <p className="text-[11px]">We penalize engagement farming, artificial bots, and spam distribution.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
