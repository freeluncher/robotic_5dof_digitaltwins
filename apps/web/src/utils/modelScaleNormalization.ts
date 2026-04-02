const MM_TO_M_SCALE = 0.001;
const LIKELY_MM_HEIGHT_THRESHOLD = 10;

export type ModelScaleNormalization = {
  sourceHeight: number;
  appliedScale: number;
  normalizedHeight: number;
  reason: 'likely-mm-model' | 'already-meter-scale';
};

export function resolveModelScaleFromHeight(sourceHeight: number): ModelScaleNormalization {
  if (!Number.isFinite(sourceHeight) || sourceHeight <= 0) {
    throw new TypeError('sourceHeight must be a positive finite number');
  }

  const shouldConvertMm = sourceHeight > LIKELY_MM_HEIGHT_THRESHOLD;
  const appliedScale = shouldConvertMm ? MM_TO_M_SCALE : 1;

  return {
    sourceHeight,
    appliedScale,
    normalizedHeight: sourceHeight * appliedScale,
    reason: shouldConvertMm ? 'likely-mm-model' : 'already-meter-scale',
  };
}
