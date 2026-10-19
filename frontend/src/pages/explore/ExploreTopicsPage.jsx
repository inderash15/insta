import React from 'react';
import { Layers, Camera, Plane, Palette, Cpu, Shirt, Utensils, Dumbbell, Building2, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ExploreNav from '../../components/explore/ExploreNav';

const TOPICS = [
  { id: 'photography', name: 'Photography', icon: Camera, color: 'from-blue-500 to-indigo-600', count: '1.2k' },
  { id: 'travel', name: 'Travel & Nature', icon: Plane, color: 'from-emerald-500 to-teal-600', count: '890' },
  { id: 'art', name: 'Art & Design', icon: Palette, color: 'from-pink-500 to-rose-600', count: '2.1k' },
  { id: 'tech', name: 'Technology', icon: Cpu, color: 'from-cyan-500 to-blue-600', count: '740' },
  { id: 'fashion', name: 'Fashion & Style', icon: Shirt, color: 'from-purple-500 to-violet-600', count: '1.5k' },
  { id: 'food', name: 'Food & Cooking', icon: Utensils, color: 'from-amber-500 to-orange-600', count: '980' },
  { id: 'fitness', name: 'Fitness & Health', icon: Dumbbell, color: 'from-green-500 to-emerald-600', count: '650' },
  { id: 'architecture', name: 'Architecture', icon: Building2, color: 'from-stone-500 to-neutral-700', count: '430' }
];

export default function ExploreTopicsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-6">
      <ExploreNav />

      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-100">Explore Topics</h1>
          <p className="text-xs text-neutral-400">Discover curated collections organized by passions and interests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {TOPICS.map((topic) => {
          const Icon = topic.icon;
          return (
            <Link
              key={topic.id}
              to={`/explore/${topic.id}`}
              className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 p-5 hover:border-pink-500/50 transition-all shadow-md flex flex-col justify-between h-40"
            >
              <div
                className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${topic.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}
              />

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${topic.color} text-white flex items-center justify-center shadow-md`}>
                <Icon className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-100 group-hover:text-pink-400 transition-colors">
                    {topic.name}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">{topic.count} publications</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
