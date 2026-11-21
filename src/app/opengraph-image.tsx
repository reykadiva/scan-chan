import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Scan Chan — Gamified Barcode Companion';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// 16 wide x 21 high Legendary Arashu Cat Bitmap (Crown + Full Body)
const FULL_CAT_BITMAP = [
  '....G.G..G.G....', // 0: Crown peaks
  '....GGGGGGGG....', // 1: Crown body
  '....G.C..C.G....', // 2: Crown gems
  '....KK....KK....', // 3: Ears outer
  '...KFFK..KFFK...', // 4: Ears
  '...KPPK..KPPK...', // 5: Inner ears
  '.KDDFFFFFFFDDK..', // 6: Head top
  '.KFFFFFFFFFFFFK.', // 7: Forehead
  'KFFFFFFFFFFFFFFK', // 8: Temples
  'KFFFFFFFFFFFFFFK', // 9: Cheeks
  'KFFKKFFFFFFKKFFK', // 10: Eyes
  'KFFKKFFFFFFKKFFK', // 11: Eyes lower
  'KFFPPFFFFFFPPFFK', // 12: Pink blush cheeks
  'KFFFFFFKKFFFFFFK', // 13: Nose & smile
  '.KFFFFFFFFFFFFK.', // 14: Chin
  'KFFFFFFFFFFFFFFK', // 15: Body upper
  'KFLLLLLLLLLLLLFK', // 16: White fluffy chest
  'KFLLLLLLLLLLLLFK', // 17: Fluffy belly
  'KFLLK......KLLFK', // 18: Front paws
  'KFLLK......KLLFK', // 19: Back paws
  '.KLLK......KLLK.', // 20: Paws bottom
];

const PALETTE: Record<string, string> = {
  G: '#fbbf24', // Gold crown
  C: '#06b6d4', // Cyan crown diamond
  K: '#1e1b18', // Deep retro outline
  F: '#fce7f3', // Arashu soft pink fur
  P: '#f43f5e', // Vibrant rose blush & inner ears
  D: '#fb7185', // Rose accents
  L: '#ffffff', // Crisp white chest & paws
};

export default function OpenGraphImage() {
  const rects: Array<{ x: number; y: number; fill: string }> = [];

  FULL_CAT_BITMAP.forEach((row, y) => {
    row.split('').forEach((char, x) => {
      const fill = PALETTE[char];
      if (fill) {
        rects.push({ x, y, fill });
      }
    });
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fbf5ee',
          border: '16px solid #1e1b18',
          padding: '48px 60px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Left Column: Brand & Tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            maxWidth: '620px',
          }}
        >
          {/* Top Section */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Pill Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#d65a7a',
                color: '#ffffff',
                border: '3px solid #1e1b18',
                borderRadius: '12px',
                padding: '8px 18px',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '1.5px',
                boxShadow: '4px 4px 0 #1e1b18',
                alignSelf: 'flex-start',
                marginBottom: '20px',
              }}
            >
              ★ RETRO BARCODE RPG ★
            </div>

            {/* Giant Title */}
            <div
              style={{
                display: 'flex',
                fontSize: '76px',
                fontWeight: 900,
                color: '#1e1b18',
                letterSpacing: '3px',
                lineHeight: 1.05,
                marginBottom: '18px',
              }}
            >
              SCAN CHAN
            </div>

            {/* Tagline */}
            <div
              style={{
                display: 'flex',
                fontSize: '26px',
                fontWeight: 600,
                color: '#4b3f38',
                lineHeight: 1.45,
              }}
            >
              Scan everyday barcodes to feed & evolve your pixel cat!
            </div>
          </div>

          {/* Bottom Section: Feature Badges & URL */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '3px solid #1e1b18',
                  borderRadius: '14px',
                  padding: '10px 18px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1e1b18',
                  boxShadow: '3px 3px 0 #1e1b18',
                  marginRight: '14px',
                }}
              >
                🐱 5 Evolution Stages
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '3px solid #1e1b18',
                  borderRadius: '14px',
                  padding: '10px 18px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1e1b18',
                  boxShadow: '3px 3px 0 #1e1b18',
                  marginRight: '14px',
                }}
              >
                🔥 Daily Streaks
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '3px solid #1e1b18',
                  borderRadius: '14px',
                  padding: '10px 18px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1e1b18',
                  boxShadow: '3px 3px 0 #1e1b18',
                }}
              >
                🍱 100+ Food Catalog
              </div>
            </div>

            {/* URL Footer */}
            <div
              style={{
                display: 'flex',
                fontSize: '20px',
                fontWeight: 800,
                color: '#d65a7a',
                letterSpacing: '1px',
              }}
            >
              scanchan.vercel.app
            </div>
          </div>
        </div>

        {/* Right Column: Pixel Cat Display Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '420px',
            height: '490px',
            backgroundColor: '#ffe4e6',
            border: '6px solid #1e1b18',
            borderRadius: '28px',
            boxShadow: '10px 10px 0 #1e1b18',
            padding: '24px',
          }}
        >
          {/* Speech Bubble */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '3px solid #1e1b18',
              borderRadius: '12px',
              padding: '8px 18px',
              fontSize: '15px',
              fontWeight: 800,
              color: '#1e1b18',
              marginBottom: '16px',
              boxShadow: '3px 3px 0 #1e1b18',
            }}
          >
            Nya~! Level 50 MAX! 👑
          </div>

          {/* Scaled Crisp Pixel Cat */}
          <svg
            width="224"
            height="294"
            viewBox="0 0 16 21"
            style={{
              display: 'flex',
            }}
          >
            {rects.map((r, i) => (
              <rect
                key={i}
                x={r.x}
                y={r.y}
                width="1"
                height="1"
                fill={r.fill}
              />
            ))}
          </svg>

          {/* Level Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1e1b18',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '1px',
              marginTop: '16px',
            }}
          >
            LEVEL 50 • LEGENDARY CAT
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
