/**
 * 안전한 ID 생성 유틸리티
 *
 * 충돌 위험이 있는 Date.now() 기반 ID 생성을 대체합니다.
 * 가능한 경우 crypto.randomUUID를 사용하고,
 * 그렇지 않을 때는 시간과 랜덤값을 조합하여 고유성을 확보합니다.
 */

const hasRandomUUID = (): boolean => {
  return typeof globalThis !== 'undefined' && !!globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function';
};

const generateRandomSuffix = (): string => {
  if (hasRandomUUID()) {
    return globalThis.crypto.randomUUID().replace(/-/g, '');
  }

  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${timePart}${randomPart}`;
};

export const createSafeId = (prefix: string): string => {
  const suffix = generateRandomSuffix();
  return prefix ? `${prefix}-${suffix}` : suffix;
};
