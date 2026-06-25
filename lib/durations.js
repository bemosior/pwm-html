import { execFileSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

export function loadDurations(assetsDir) {
  const durations = {};
  if (!existsSync(assetsDir)) return durations;
  for (const file of readdirSync(assetsDir)) {
    if (!file.toLowerCase().endsWith('.mp4')) continue;
    const mp4Path = join(assetsDir, file);
    try {
      const out = execFileSync(
        'ffprobe',
        ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', mp4Path],
        { stdio: ['pipe', 'pipe', 'pipe'] }
      ).toString().trim();
      const seconds = Math.round(parseFloat(out));
      if (Number.isFinite(seconds)) durations[file] = seconds;
    } catch {
      console.warn(`  warning: could not read duration for ${file} (is ffprobe installed?)`);
    }
  }
  return durations;
}
