export const CATEGORIES = [
  { code: 'all', label: '전체' },
  { code: 'llm', label: 'LLM 활용' },
  { code: 'vibe', label: '바이브코딩' },
  { code: 'ml', label: '데이터/ML' },
  { code: 'cloud', label: '클라우드' },
  { code: 'career', label: 'IT 커리어' },
];

const LABEL_TO_CODE = Object.fromEntries(
  CATEGORIES.filter((item) => item.code !== 'all').map((item) => [item.label, item.code]),
);

export function normalizeCategory(value) {
  if (!value || value === 'all') return 'all';
  if (LABEL_TO_CODE[value]) return LABEL_TO_CODE[value];
  const known = CATEGORIES.find((item) => item.code === value);
  return known ? known.code : null;
}

export function categoryLabel(code) {
  return CATEGORIES.find((item) => item.code === code)?.label ?? code;
}
