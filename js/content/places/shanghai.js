/* ==========================================================================
   SHANGHAI
   Roots and childhood pieces, including the puzzle game.
   Every [PLACEHOLDER: ...] below is a slot waiting for your real content.
   Photos: put the file in assets/work/ and set src to its path,
   for example  src: 'assets/work/sh-deck-1.jpg'.  Leave src '' to show the placeholder.
   track must be exactly one of: 'Copywriting', 'Strategy', 'Both'.
   ========================================================================== */

KALLY.places.push({
  id: 'shanghai',
  name: 'Shanghai',
  sub: 'Where it started',
  lat: 31.23,
  lon: 121.47,
  tz: 'Asia/Shanghai',
  theme: 'sh',
  categories: {
    snacks: [
      {
        id: 'sh-snack-1',
        title: '[PLACEHOLDER: Shanghai roots copy 1]',
        track: 'Copywriting',
        context: '[PLACEHOLDER: Roots or childhood piece, and what it was for]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'text',
          headline: '[PLACEHOLDER: Headline, tagline or one liner]',
          body: ['[PLACEHOLDER: Supporting lines, or the full piece]'],
        },
      },
      {
        id: 'sh-snack-2',
        title: '[PLACEHOLDER: Shanghai roots copy 2]',
        track: 'Both',
        context: '[PLACEHOLDER: Roots or childhood piece, and what it was for]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'text',
          headline: '[PLACEHOLDER: Headline, tagline or one liner]',
          body: ['[PLACEHOLDER: Supporting lines, or the full piece]'],
        },
      },
      {
        id: 'sh-snack-3',
        title: '[PLACEHOLDER: Shanghai roots copy 3]',
        track: 'Copywriting',
        context: '[PLACEHOLDER: Roots or childhood piece, and what it was for]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'text',
          headline: '[PLACEHOLDER: Headline, tagline or one liner]',
          body: ['[PLACEHOLDER: Supporting lines, or the full piece]'],
        },
      },
    ],
    movies: [
      {
        id: 'sh-movie-1',
        title: '[PLACEHOLDER: Shanghai family story slideshow]',
        track: 'Both',
        context: '[PLACEHOLDER: Roots or childhood piece, and what it was for]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'slides',
          ratio: '16 / 9',
          slides: [
            {
              src: '',
              alt: '[PLACEHOLDER: Shanghai family story slideshow, slide 1 of 3]',
              caption: '',
            },
            {
              src: '',
              alt: '[PLACEHOLDER: Shanghai family story slideshow, slide 2 of 3]',
              caption: '',
            },
            {
              src: '',
              alt: '[PLACEHOLDER: Shanghai family story slideshow, slide 3 of 3]',
              caption: '',
            },
          ],
        },
      },
      {
        id: 'sh-movie-2',
        title: '[PLACEHOLDER: Shanghai childhood graphic]',
        track: 'Strategy',
        context: '[PLACEHOLDER: Roots or childhood piece, and what it was for]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'image',
          ratio: '4 / 3',
          image: { src: '', alt: '[PLACEHOLDER: Shanghai childhood graphic]' },
        },
      },
    ],
    music: [
      {
        id: 'sh-song-1',
        title: '[PLACEHOLDER: Shanghai song 1, title]',
        track: 'Both',
        context: '[PLACEHOLDER: Where this song fits in your story]',
        shows: '[PLACEHOLDER: One line on the taste or instinct this song reveals]',
        work: {
          type: 'song',
          artist: '[PLACEHOLDER: Artist]',
          note: '[PLACEHOLDER: One line on why this song matters to your taste]',
          cover: { src: '', alt: '[PLACEHOLDER: Shanghai song 1, album art]' },
          link: '',
        },
      },
      {
        id: 'sh-song-2',
        title: '[PLACEHOLDER: Shanghai song 2, title]',
        track: 'Both',
        context: '[PLACEHOLDER: Where this song fits in your story]',
        shows: '[PLACEHOLDER: One line on the taste or instinct this song reveals]',
        work: {
          type: 'song',
          artist: '[PLACEHOLDER: Artist]',
          note: '[PLACEHOLDER: One line on why this song matters to your taste]',
          cover: { src: '', alt: '[PLACEHOLDER: Shanghai song 2, album art]' },
          link: '',
        },
      },
      {
        id: 'sh-photos-1',
        title: '[PLACEHOLDER: childhood photo series]',
        track: 'Both',
        context: '[PLACEHOLDER: Where and when you took these]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'slides',
          kind: 'photos',
          ratio: '3 / 2',
          slides: [
            {
              src: '',
              alt: '[PLACEHOLDER: childhood photo series, photo 1 of 4]',
              caption: '',
            },
            {
              src: '',
              alt: '[PLACEHOLDER: childhood photo series, photo 2 of 4]',
              caption: '',
            },
            {
              src: '',
              alt: '[PLACEHOLDER: childhood photo series, photo 3 of 4]',
              caption: '',
            },
            {
              src: '',
              alt: '[PLACEHOLDER: childhood photo series, photo 4 of 4]',
              caption: '',
            },
          ],
        },
      },
      {
        id: 'sh-essay-1',
        title: '[PLACEHOLDER: Shanghai roots essay, title]',
        track: 'Copywriting',
        context: '[PLACEHOLDER: What prompted you to write this]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'essay',
          paragraphs: [
            '[PLACEHOLDER: Essay paragraph 1]',
            '[PLACEHOLDER: Essay paragraph 2]',
            '[PLACEHOLDER: Essay paragraph 3]',
          ],
          pullQuote: '[PLACEHOLDER: One line from the essay worth pulling out]',
        },
      },
    ],
    games: [
      {
        id: 'sh-game-1',
        title: 'Piece together where I come from',
        track: 'Both',
        context: 'A jigsaw built from my childhood photos.',
        shows: 'Turning a personal story into something people can play.',
        work: {
          type: 'puzzle',
          cols: 4,
          rows: 3,
          photos: [
            {
              src: 'assets/puzzle/puzzle-photo-1.svg',
              alt: '[PLACEHOLDER: puzzle photo 1, a childhood photo]',
              label: 'Photo 1',
            },
            {
              src: 'assets/puzzle/puzzle-photo-2.svg',
              alt: '[PLACEHOLDER: puzzle photo 2, a childhood photo]',
              label: 'Photo 2',
            },
            {
              src: 'assets/puzzle/puzzle-photo-3.svg',
              alt: '[PLACEHOLDER: puzzle photo 3, a childhood photo]',
              label: 'Photo 3',
            },
          ],
          congrats: 'Every piece in its place. Welcome home.',
        },
      },
    ],
  },
});
