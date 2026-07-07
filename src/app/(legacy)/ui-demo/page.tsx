'use client';

import { useState } from 'react';
import { CatIcon, FoodCatIcons, ActionCatIcons, StatusCatIcons, type CatIconColor } from '@/components/ui/cat-icon-variants';
import {
  EmptyFoodPantry, EmptyMissionBoard, EmptyHistory, LoadingCat,
  PixelHeart, PixelStar, PixelSparkle
} from '@/components/ui/pixel-illustrations';
import { EnhancedProgress, CircularProgress, LevelProgress } from '@/components/ui/enhanced-progress';
import { MilestoneCelebration, QuickCelebration } from '@/components/ui/milestone-celebration';
import { ParticleSystem } from '@/components/ui/particle-system';
import { LoadingSkeleton, LoadingSpinner, LoadingScreen } from '@/components/ui/loading-skeleton';
import { haptics } from '@/lib/haptics';
import { playSound } from '@/lib/sounds';

export default function UIDemoPage() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [showQuickCelebration, setShowQuickCelebration] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-pink-50 to-yellow-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold font-fredoka text-gray-800 mb-2">
            🎨 UI/UX Components Demo
          </h1>
          <p className="text-gray-600 font-nunito">
            Testing all pixel art components, sounds, and haptics
          </p>
        </div>

        {/* 30 Color Variations */}
        <section className="card-bubbly p-6 bg-white">
          <h2 className="text-2xl font-bold font-fredoka text-gray-800 mb-4">
            🌈 30 Cat Color Variations
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Every icon can use any of these 30 colors!
          </p>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {([
              'orange', 'coral', 'peach', 'red', 'pink',
              'rose', 'salmon', 'amber', 'brown', 'cream',
              'cyan', 'sky', 'navy', 'purple', 'lavender',
              'mint', 'teal', 'turquoise', 'emerald', 'lime',
              'gold', 'silver', 'sunset', 'ocean', 'forest',
              'pastel-pink', 'pastel-blue', 'pastel-yellow', 'white', 'rainbow',
            ] as CatIconColor[]).map((colorName) => (
              <div key={colorName} className="text-center">
                <div className="bg-gray-50 rounded-2xl p-3 hover:bg-gray-100 transition-colors">
                  <CatIcon color={colorName} iconType="normal" size={40} />
                </div>
                <p className="text-[10px] font-semibold text-gray-600 mt-1 capitalize">
                  {colorName}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Food Category Icons */}
        <section className="card-bubbly p-6 bg-white">
          <h2 className="text-2xl font-bold font-fredoka text-gray-800 mb-4">
            🍖 Food Category Cat Icons
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Cat heads with food-themed eyes!
          </p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {[
              { Component: FoodCatIcons.Meat, label: 'Meat', color: 'orange' as CatIconColor },
              { Component: FoodCatIcons.Cake, label: 'Cake', color: 'pink' as CatIconColor },
              { Component: FoodCatIcons.Drink, label: 'Drink', color: 'cyan' as CatIconColor },
              { Component: FoodCatIcons.Candy, label: 'Candy', color: 'pastel-pink' as CatIconColor },
              { Component: FoodCatIcons.Cookie, label: 'Cookie', color: 'brown' as CatIconColor },
              { Component: FoodCatIcons.Biscuit, label: 'Biscuit', color: 'cream' as CatIconColor },
              { Component: FoodCatIcons.Dairy, label: 'Dairy', color: 'white' as CatIconColor },
              { Component: FoodCatIcons.Snack, label: 'Snack', color: 'amber' as CatIconColor },
            ].map(({ Component, label, color }) => (
              <div key={label} className="text-center">
                <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                  <Component size={48} color={color} />
                </div>
                <p className="text-xs font-semibold text-gray-600 mt-2">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Action Icons */}
        <section className="card-bubbly p-6 bg-white">
          <h2 className="text-2xl font-bold font-fredoka text-gray-800 mb-4">
            🎮 Action Cat Icons
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { Component: ActionCatIcons.Bowl, label: 'Feed', color: 'red' as CatIconColor },
              { Component: ActionCatIcons.Paw, label: 'Pet', color: 'pink' as CatIconColor },
              { Component: ActionCatIcons.Scanner, label: 'Scan', color: 'teal' as CatIconColor },
              { Component: ActionCatIcons.Apple, label: 'Food', color: 'red' as CatIconColor },
            ].map(({ Component, label, color }) => (
              <div key={label} className="text-center">
                <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                  <Component size={48} color={color} />
                </div>
                <p className="text-xs font-semibold text-gray-600 mt-2">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Status Icons */}
        <section className="card-bubbly p-6 bg-white">
          <h2 className="text-2xl font-bold font-fredoka text-gray-800 mb-4">
            📊 Status Cat Icons
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { Component: StatusCatIcons.Hunger, label: 'Hunger', color: 'silver' as CatIconColor },
              { Component: StatusCatIcons.Happiness, label: 'Happy', color: 'rose' as CatIconColor },
              { Component: StatusCatIcons.Health, label: 'Health', color: 'emerald' as CatIconColor },
              { Component: StatusCatIcons.Energy, label: 'Energy', color: 'gold' as CatIconColor },
              { Component: StatusCatIcons.XP, label: 'XP', color: 'gold' as CatIconColor },
            ].map(({ Component, label, color }) => (
              <div key={label} className="text-center">
                <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                  <Component size={48} color={color} />
                </div>
                <p className="text-xs font-semibold text-gray-600 mt-2">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Progress Bars */}
        <section className="card-bubbly p-6 bg-white">
          <h2 className="text-2xl font-bold font-fredoka text-gray-800 mb-4">
            📊 Enhanced Progress Bars
          </h2>
          <div className="space-y-4">
            <EnhancedProgress value={75} max={100} variant="hunger" animated />
            <EnhancedProgress value={90} max={100} variant="happiness" animated />
            <EnhancedProgress value={60} max={100} variant="health" animated />
            <EnhancedProgress value={45} max={100} variant="xp" animated />
            <EnhancedProgress value={100} max={100} variant="energy" animated />
          </div>
          
          <h3 className="text-xl font-bold font-fredoka text-gray-800 mt-6 mb-4">
            Circular Progress
          </h3>
          <div className="flex gap-4 justify-center">
            <CircularProgress value={75} max={100} variant="hunger" size={80} />
            <CircularProgress value={90} max={100} variant="happiness" size={80} />
            <CircularProgress value={60} max={100} variant="health" size={80} />
            <CircularProgress value={45} max={100} variant="xp" size={80} />
          </div>

          <h3 className="text-xl font-bold font-fredoka text-gray-800 mt-6 mb-4">
            Level Progress
          </h3>
          <LevelProgress currentLevel={5} currentXP={750} xpToNextLevel={1000} />
        </section>

        {/* Sounds & Haptics */}
        <section className="card-bubbly p-6 bg-white">
          <h2 className="text-2xl font-bold font-fredoka text-gray-800 mb-4">
            🔊 Sounds & Haptics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { sound: 'pet', haptic: 'light', label: 'Pet' },
              { sound: 'feed', haptic: 'medium', label: 'Feed' },
              { sound: 'levelup', haptic: 'heavy', label: 'Level Up' },
              { sound: 'achievement', haptic: 'success', label: 'Achievement' },
              { sound: 'scan', haptic: 'medium', label: 'Scan' },
              { sound: 'error', haptic: 'error', label: 'Error' },
              { sound: 'success', haptic: 'success', label: 'Success' },
              { sound: 'click', haptic: 'light', label: 'Click' },
              { sound: 'notification', haptic: 'notification', label: 'Notify' },
              { sound: 'milestone', haptic: 'heavy', label: 'Milestone' },
            ].map(({ sound, haptic, label }) => (
              <button
                key={sound}
                onClick={() => {
                  playSound(sound as any);
                  (haptics as any)[haptic]();
                }}
                className="btn-bubbly bg-brand-cyan text-white py-3 px-4 text-sm"
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Celebrations */}
        <section className="card-bubbly p-6 bg-white">
          <h2 className="text-2xl font-bold font-fredoka text-gray-800 mb-4">
            🎉 Celebrations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setShowCelebration(true)}
              className="btn-bubbly bg-brand-pink text-white py-3"
            >
              🎊 Big Celebration
            </button>
            <button
              onClick={() => setShowQuickCelebration(true)}
              className="btn-bubbly bg-brand-yellow text-white py-3"
            >
              ✨ Quick Toast
            </button>
            <button
              onClick={() => {
                setShowParticles(true);
                setTimeout(() => setShowParticles(false), 2000);
              }}
              className="btn-bubbly bg-brand-mint text-white py-3"
            >
              💫 Particles
            </button>
            <button
              onClick={() => {
                setShowLoading(true);
                setTimeout(() => setShowLoading(false), 3000);
              }}
              className="btn-bubbly bg-purple-500 text-white py-3"
            >
              ⏳ Loading
            </button>
          </div>
        </section>

        {/* Empty States */}
        <section className="card-bubbly p-6 bg-white">
          <h2 className="text-2xl font-bold font-fredoka text-gray-800 mb-4">
            📭 Empty State Illustrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <EmptyFoodPantry className="w-32 h-32 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">Empty Pantry</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <EmptyMissionBoard className="w-32 h-32 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">No Missions</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <EmptyHistory className="w-32 h-32 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">No History</p>
            </div>
          </div>
        </section>

        {/* Loading States */}
        <section className="card-bubbly p-6 bg-white">
          <h2 className="text-2xl font-bold font-fredoka text-gray-800 mb-4">
            ⏳ Loading States
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <LoadingCat className="w-24 h-24 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">Loading Cat</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <LoadingSpinner size="lg" message="Loading..." />
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <LoadingSkeleton variant="stats" />
            </div>
          </div>
        </section>

        {/* Small Icons */}
        <section className="card-bubbly p-6 bg-white">
          <h2 className="text-2xl font-bold font-fredoka text-gray-800 mb-4">
            ✨ Small Decorative Icons
          </h2>
          <div className="flex gap-6 justify-center items-center">
            <PixelHeart className="w-8 h-8 text-pink-500 animate-pulse" size={32} />
            <PixelStar className="w-8 h-8 text-yellow-500 animate-spin-slow" size={32} />
            <PixelSparkle className="w-6 h-6 text-cyan-500" size={24} />
            <PixelHeart className="w-10 h-10 text-red-500" size={40} />
            <PixelStar className="w-10 h-10 text-amber-500" size={40} />
          </div>
        </section>

      </div>

      {/* Celebration Components */}
      <MilestoneCelebration
        show={showCelebration}
        type="levelup"
        message="Amazing Work!"
        onComplete={() => setShowCelebration(false)}
      />

      <QuickCelebration
        show={showQuickCelebration}
        message="Nice!"
        icon="✨"
        onComplete={() => setShowQuickCelebration(false)}
      />

      {/* Particles */}
      <ParticleSystem 
        active={showParticles}
        type="mixed"
        count={20}
      />

      {/* Full Loading Screen */}
      {showLoading && (
        <LoadingScreen message="Testing Loading..." />
      )}
    </div>
  );
}
