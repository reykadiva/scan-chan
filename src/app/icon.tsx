import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 128,
  height: 128,
};
export const contentType = 'image/png';

// 16x13 Pixel Cat Head Bitmap
const CAT_HEAD_BITMAP = [
  '....KK....KK....', // 0: Ear tips
  '...KFFK..KFFK...', // 1: Ears outer
  '...KPPK..KPPK...', // 2: Inner ears
  '.KDDFFFFFFFDDK..', // 3: Forehead patches
  '.KFFFFFFFFFFFFK.', // 4: Upper face
  'KFFFFFFFFFFFFFFK', // 5: Mid face
  'KFFFFFFFFFFFFFFK', // 6: Eye level upper
  'KFFKKFFFFFFKKFFK', // 7: Eyes
  'KFFKKFFFFFFKKFFK', // 8: Eyes lower
  'KFFPPFFFFFFPPFFK', // 9: Rosy blush cheeks
  'KFFFFFFKKFFFFFFK', // 10: Cute nose/mouth
  '.KFFFFFFFFFFFFK.', // 11: Chin
  '..KKKKKKKKKKKK..', // 12: Bottom jaw line
];

const PIXEL_COLORS: Record<string, string> = {
  K: '#1e1b18', // Deep retro outline & eyes
  F: '#ffffff', // Crisp white fur
  D: '#f59e0b', // Calico amber patch
  P: '#f472b6', // Pastel pink ears & blush
};

export default function Icon() {
  const rects: Array<{ x: number; y: number; fill: string }> = [];

  CAT_HEAD_BITMAP.forEach((row, y) => {
    row.split('').forEach((char, x) => {
      const fill = PIXEL_COLORS[char];
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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#d65a7a',
          borderRadius: 28,
          border: '6px solid #1e1b18',
        }}
      >
        <svg
          width="96"
          height="78"
          viewBox="0 0 16 13"
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
      </div>
    ),
    {
      ...size,
    }
  );
}
