import { execFileSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

export function generateThumbnails(assetsDir) {
  if (!existsSync(assetsDir)) return;
  for (const file of readdirSync(assetsDir)) {
    if (!file.toLowerCase().endsWith('.mp4')) continue;
    const jpgPath = join(assetsDir, file.slice(0, -4) + '.jpg');
    if (existsSync(jpgPath)) continue;
    const mp4Path = join(assetsDir, file);
    try {
      execFileSync('ffmpeg', ['-i', mp4Path, '-ss', '1', '-frames:v', '1', jpgPath, '-y'], { stdio: 'pipe' });
      console.log(`  thumbnail: ${file.slice(0, -4)}.jpg`);
    } catch {
      console.warn(`  warning: could not generate thumbnail for ${file} (is ffmpeg installed?)`);
    }
  }
}
