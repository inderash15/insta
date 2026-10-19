import React, { useState } from 'react';
import { HelpCircle, Search, MessageSquare, Shield, Lock, FileQuestion, ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: 'How do I make my account private?',
    a: 'Go to Settings > Privacy Controls and toggle on "Private Account". Only approved followers can see your posts and stories.'
  },
  {
    q: 'How do 24-hour stories work?',
    a: 'Stories disappear from the stories feed after 24 hours. You can review all your past stories inside the Story Archive.'
  },
  {
    q: 'Can I download an archive of my data?',
    a: 'Yes! Navigate to Settings > Download Your Data to export a complete JSON or HTML archive of all your content and messages.'
  },
  {
    q: 'How do I report harassment or spam?',
    a: 'Use the three-dot menu on any post or profile to submit a report, or visit Safety Center > Submit a Report directly.'
  },
  {
    q: 'What video formats are supported for Reels?',
    a: 'Reels supports 9:16 vertical MP4, WebM, and MOV videos up to 50MB and 60 seconds duration.'
  }
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState('');

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase().trim()) ||
      f.a.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Hero Search */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-pink-500/10 text-pink-400 mx-auto flex items-center justify-center">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100">
          How can we help you?
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Search our knowledge base for answers, tutorials, and community policies.
        </p>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles, questions, or guides..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 shadow-md transition-colors"
          />
        </div>
      </div>

      {/* Quick assistance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/help/contact"
          className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-pink-500/50 transition-all flex flex-col justify-between h-36 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
              <Mail className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-100 group-hover:text-pink-400">Contact Support</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Submit an inquiry or bug ticket</p>
          </div>
        </Link>

        <Link
          to="/safety"
          className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-pink-500/50 transition-all flex flex-col justify-between h-36 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-100 group-hover:text-pink-400">Safety Center</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Community standards and privacy tools</p>
          </div>
        </Link>

        <Link
          to="/legal"
          className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-pink-500/50 transition-all flex flex-col justify-between h-36 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <FileQuestion className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-100 group-hover:text-pink-400">Terms & Legal</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Terms of Service and Privacy Policy</p>
          </div>
        </Link>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-neutral-200">Frequently Asked Questions</h2>
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl divide-y divide-neutral-800/60 overflow-hidden">
          {filteredFaqs.map((faq) => (
            <div key={faq.q} className="p-4 space-y-1.5">
              <h4 className="text-xs font-semibold text-neutral-100">{faq.q}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
          {filteredFaqs.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-500">
              No articles found matching &ldquo;{search}&rdquo;. Try another question or reach out via Contact Support.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
