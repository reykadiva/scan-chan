import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, Database, Camera, Trash2, KeyRound } from 'lucide-react';
import { PixelCat } from '@/components/game/pixel-cat';

export const metadata: Metadata = {
  title: 'Privacy Policy - Scan Chan',
  description:
    'Privacy Policy for Scan Chan: how we handle Google OAuth, camera access, barcode scan data, and your rights to data deletion.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full min-h-screen px-4 py-8 sm:py-12 select-none flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-4 pb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] font-fredoka font-bold text-xs sm:text-sm shadow-[2px_2px_0_0_var(--theme-shadow)] hover:bg-[var(--theme-surface-inner)] active:translate-y-0.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Game</span>
          </Link>

          <span className="font-pixel text-[9px] text-white/90 bg-white/20 border border-white/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Effective: November 2026
          </span>
        </div>

        {/* Main Card */}
        <div className="rpg-panel p-5 sm:p-8 space-y-6 shadow-lg">
          {/* Title with Pixel Cat */}
          <div className="flex items-center gap-3.5 border-b-2 border-[var(--theme-border)]/20 pb-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] flex items-center justify-center shrink-0 shadow-[2px_2px_0_0_var(--theme-shadow)]">
              <PixelCat variant="calico" action="play" size={40} />
            </div>
            <div>
              <h1 className="font-fredoka text-xl sm:text-2xl font-black text-white drop-shadow-[1.5px_1.5px_0_var(--theme-dark)]">
                Privacy Policy
              </h1>
              <p className="font-nunito text-xs sm:text-sm text-white/90 font-semibold drop-shadow-[1px_1px_0_var(--theme-dark)]">
                Transparent data practices for Scan Chan players.
              </p>
            </div>
          </div>

          {/* Section 1: Philosophy */}
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 font-fredoka text-base sm:text-lg font-bold text-white drop-shadow-[1px_1px_0_var(--theme-dark)]">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              1. Our Data Philosophy
            </h2>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-nunito font-semibold drop-shadow-[0.5px_0.5px_0_var(--theme-dark)]">
              Scan Chan is a retro gamified barcode companion game. We collect only the minimum data required to keep your companion cat fed, track your daily streaks, and synchronize your level progress across devices. We do not sell personal data, display third-party tracking ads, or monetize user profiles.
            </p>
          </section>

          {/* Section 2: Google OAuth */}
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 font-fredoka text-base sm:text-lg font-bold text-white drop-shadow-[1px_1px_0_var(--theme-dark)]">
              <KeyRound className="w-4 h-4 text-amber-300" />
              2. Google OAuth Authentication
            </h2>
            <div className="rpg-inner-box p-3.5 space-y-2 text-xs text-[var(--theme-text-dark)] font-nunito">
              <p className="font-bold">
                When you sign in using <span className="font-extrabold text-[var(--theme-primary)]">Continue with Google</span>, we receive:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-semibold">
                <li>
                  <strong>Email address:</strong> Used strictly as your unique account ID to authenticate your session and associate your cloud save file.
                </li>
                <li>
                  <strong>Display name / Nickname:</strong> Used to display your default Hunter Nickname in the game lobby.
                </li>
                <li>
                  <strong>Avatar profile picture:</strong> Used optionally to represent your hunter profile.
                </li>
              </ul>
              <p className="text-[11px] pt-1 text-[var(--theme-text-dark)]/80 italic">
                We never request access to your Google contacts, Google Drive files, search history, or any other private Google service permissions.
              </p>
            </div>
          </section>

          {/* Section 3: Camera & Barcode Scans */}
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 font-fredoka text-base sm:text-lg font-bold text-white drop-shadow-[1px_1px_0_var(--theme-dark)]">
              <Camera className="w-4 h-4 text-cyan-300" />
              3. Camera Access & Barcode Scanning
            </h2>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-nunito font-semibold drop-shadow-[0.5px_0.5px_0_var(--theme-dark)]">
              The in-game scanner accesses your device camera strictly to detect standard 1D/2D product barcodes (EAN-13, UPC, Code-128). Video processing runs entirely on-device via HTML5 Canvas. No video streams, photos, or ambient recordings are ever transmitted to or stored on our servers.
            </p>
          </section>

          {/* Section 4: Game Progress & Guest Mode */}
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 font-fredoka text-base sm:text-lg font-bold text-white drop-shadow-[1px_1px_0_var(--theme-dark)]">
              <Database className="w-4 h-4 text-sky-300" />
              4. Game Progress & Guest Mode
            </h2>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-nunito font-semibold drop-shadow-[0.5px_0.5px_0_var(--theme-dark)]">
              In <strong>Hunter Account mode</strong>, your cat&apos;s level, hunger, affection vitals, scan history, and streak counter are stored in our secure PostgreSQL database (hosted on Supabase Cloud). In <strong>Guest Mode</strong>, all progress is stored solely in your local browser&apos;s storage and is never uploaded to any server.
            </p>
          </section>

          {/* Section 5: Data Deletion */}
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 font-fredoka text-base sm:text-lg font-bold text-white drop-shadow-[1px_1px_0_var(--theme-dark)]">
              <Trash2 className="w-4 h-4 text-rose-300" />
              5. Right to Data Deletion
            </h2>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-nunito font-semibold drop-shadow-[0.5px_0.5px_0_var(--theme-dark)]">
              You maintain full ownership of your data. You may request the permanent deletion of your account, pet companion, scan history, and inventory at any time. Send an email to{' '}
              <a
                href="mailto:reyka334@gmail.com?subject=Scan-Chan Data Deletion Request"
                className="underline font-bold text-white hover:text-amber-200"
              >
                reyka334@gmail.com
              </a>{' '}
              from your registered account email with the subject &ldquo;Scan-Chan Data Deletion Request&rdquo;. All associated database records will be permanently expunged within 48 hours.
            </p>
          </section>

          {/* Section 6: Contact */}
          <section className="space-y-2 border-t-2 border-[var(--theme-border)]/20 pt-4">
            <h2 className="flex items-center gap-2 font-fredoka text-base sm:text-lg font-bold text-white drop-shadow-[1px_1px_0_var(--theme-dark)]">
              <Mail className="w-4 h-4 text-pink-300" />
              6. Contact & Maintainer
            </h2>
            <div className="text-xs sm:text-sm text-white/95 font-nunito font-semibold space-y-1">
              <p>
                <strong>Developer:</strong> Reyka Diva
              </p>
              <p>
                <strong>Inquiries & Support:</strong>{' '}
                <a
                  href="mailto:reyka334@gmail.com"
                  className="underline text-white hover:text-amber-200"
                >
                  reyka334@gmail.com
                </a>
              </p>
              <p>
                <strong>Source Code:</strong>{' '}
                <a
                  href="https://github.com/reykadiva/scan-chan"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-white hover:text-amber-200"
                >
                  github.com/reykadiva/scan-chan
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] font-pixelify text-white/80">
          Scan Chan • Open-Source Barcode Companion RPG
        </div>
      </div>
    </div>
  );
}
