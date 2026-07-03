import { readBarcodesFromImageData } from 'zxing-wasm/reader';

/**
 * Decodes a barcode from the current frame of an HTMLVideoElement using zxing-wasm.
 */
export async function decodeBarcodeFromVideo(video: HTMLVideoElement): Promise<string | null> {
  if (video.readyState < 2) return null; // HAVE_CURRENT_DATA or better

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  try {
    const results = await readBarcodesFromImageData(imageData);
    if (results && results.length > 0) {
      return results[0].text ?? null;
    }
  } catch (error) {
    // Avoid spamming logs in the rendering loop, just return null on error
    console.debug('ZXing WASM decoding failed or is initializing:', error);
  }
  return null;
}
