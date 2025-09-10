import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Lightweight FPS/TTI overlay for dev builds
export default function PerfStats() {
  const rafId = useRef<number | null>(null);
  const lastSecondTs = useRef<number>(0);
  const lastFrameTs = useRef<number>(0);
  const frameCount = useRef(0);
  const longFrames = useRef(0);
  const [fps, setFps] = useState(0);
  const [tti, setTti] = useState<number | null>(null);

  // TTI using requestIdleCallback when available
  useEffect(() => {
    type IdleDeadline = { startTime?: number };
    type IdleAPI = {
      requestIdleCallback?: (cb: (d: IdleDeadline) => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idle = globalThis as unknown as IdleAPI;
    let id: number | ReturnType<typeof setTimeout> | undefined;
    if (typeof idle.requestIdleCallback === 'function') {
      id = idle.requestIdleCallback((deadline) => setTti(Math.max(0, deadline?.startTime ?? 0)));
      return () => idle.cancelIdleCallback?.(id as number);
    }
    const t0 = performance.now?.() ?? Date.now();
    id = setTimeout(() => setTti((performance.now?.() ?? Date.now()) - t0), 0);
    return () => clearTimeout(id);
  }, []);

  // FPS using rAF timestamps
  useEffect(() => {
    const loop = (ts: number) => {
      if (!lastSecondTs.current) lastSecondTs.current = ts;
      if (!lastFrameTs.current) lastFrameTs.current = ts;

      const dt = ts - lastFrameTs.current;
      lastFrameTs.current = ts;
      frameCount.current += 1;
      if (dt > 18) longFrames.current += 1;

      if (ts - lastSecondTs.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        longFrames.current = 0;
        lastSecondTs.current = ts;
      }

      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (!__DEV__) return null;
  return (
    <View style={styles.box} pointerEvents="none" accessibilityLabel="Perf overlay">
      <Text style={styles.text}>
        FPS {String(fps).padStart(2, ' ')}
        {tti != null ? ` • TTI ${tti.toFixed(0)}ms` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  text: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
