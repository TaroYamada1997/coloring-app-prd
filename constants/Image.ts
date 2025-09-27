export const COLORINGMAP = {
  'human': {
    path: '/human.png',
    title: 'ひと',
    description: 'かわいい人に色をつけよう',
    thumbnail: '/human.png',
    difficulty: 'easy' as const,
    category: 'human' as const,
  },
  'flower': {
    path: '/flower.png',
    title: 'はな',
    description: 'きれいな花に色をつけよう',
    thumbnail: '/flower.png',
    difficulty: 'easy' as const,
    category: 'flower' as const,
  },
  'building': {
    path: '/building.png',
    title: 'たてもの',
    description: 'すてきな建物に色をつけよう',
    thumbnail: '/building.png',
    difficulty: 'easy' as const,
    category: 'building' as const,
  },
} as const;
