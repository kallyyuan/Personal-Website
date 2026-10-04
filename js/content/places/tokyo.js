/* ==========================================================================
   TOKYO
   Observation and taste. Content for this stop is open: use it however you like.
   Every [PLACEHOLDER: ...] below is a slot waiting for your real content.
   Photos: put the file in assets/work/ and set src to its path,
   for example  src: 'assets/work/tk-deck-1.jpg'.  Leave src '' to show the placeholder.
   track must be exactly one of: 'Copywriting', 'Strategy', 'Both'.
   ========================================================================== */

KALLY.places.push({
  id: 'tokyo',
  name: 'Tokyo',
  sub: 'Taste and curiosity',
  lat: 35.68,
  lon: 139.69,
  tz: 'Asia/Tokyo',
  theme: 'tk',
  categories: {
    snacks: [
      {
        id: 'tk-snack-1',
        title: '[PLACEHOLDER: Tokyo copy sample 1]',
        track: 'Copywriting',
        context: '[PLACEHOLDER: Project or observation from Tokyo, and what it was for]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'text',
          headline: '[PLACEHOLDER: Headline, tagline or one liner]',
          body: ['[PLACEHOLDER: Supporting lines, or the full piece]'],
        },
      },
      {
        id: 'tk-snack-2',
        title: '[PLACEHOLDER: Tokyo copy sample 2]',
        track: 'Both',
        context: '[PLACEHOLDER: Project or observation from Tokyo, and what it was for]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'text',
          headline: '[PLACEHOLDER: Headline, tagline or one liner]',
          body: ['[PLACEHOLDER: Supporting lines, or the full piece]'],
        },
      },
      {
        id: 'tk-snack-3',
        title: '[PLACEHOLDER: Tokyo copy sample 3]',
        track: 'Copywriting',
        context: '[PLACEHOLDER: Project or observation from Tokyo, and what it was for]',
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
        id: 'tk-movie-1',
        title: '[PLACEHOLDER: Tokyo ad culture slideshow]',
        track: 'Both',
        context: '[PLACEHOLDER: Project or observation from Tokyo, and what it was for]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'slides',
          ratio: '16 / 9',
          slides: [
            {
              src: '',
              alt: '[PLACEHOLDER: Tokyo ad culture slideshow, slide 1 of 3]',
              caption: '',
            },
            {
              src: '',
              alt: '[PLACEHOLDER: Tokyo ad culture slideshow, slide 2 of 3]',
              caption: '',
            },
            {
              src: '',
              alt: '[PLACEHOLDER: Tokyo ad culture slideshow, slide 3 of 3]',
              caption: '',
            },
          ],
        },
      },
      {
        id: 'tk-movie-2',
        title: '[PLACEHOLDER: Tokyo mock ad]',
        track: 'Strategy',
        context: '[PLACEHOLDER: Project or observation from Tokyo, and what it was for]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'image',
          ratio: '4 / 3',
          image: { src: '', alt: '[PLACEHOLDER: Tokyo mock ad]' },
        },
      },
    ],
    music: [
      {
        id: 'tk-song-1',
        title: '[PLACEHOLDER: Tokyo song 1, title]',
        track: 'Both',
        context: '[PLACEHOLDER: Where this song fits in your story]',
        shows: '[PLACEHOLDER: One line on the taste or instinct this song reveals]',
        work: {
          type: 'song',
          artist: '[PLACEHOLDER: Artist]',
          note: '[PLACEHOLDER: One line on why this song matters to your taste]',
          cover: { src: '', alt: '[PLACEHOLDER: Tokyo song 1, album art]' },
          link: '',
        },
      },
      {
        id: 'tk-song-2',
        title: '[PLACEHOLDER: Tokyo song 2, title]',
        track: 'Both',
        context: '[PLACEHOLDER: Where this song fits in your story]',
        shows: '[PLACEHOLDER: One line on the taste or instinct this song reveals]',
        work: {
          type: 'song',
          artist: '[PLACEHOLDER: Artist]',
          note: '[PLACEHOLDER: One line on why this song matters to your taste]',
          cover: { src: '', alt: '[PLACEHOLDER: Tokyo song 2, album art]' },
          link: '',
        },
      },
      {
        id: 'tk-photos-1',
        title: '[PLACEHOLDER: Tokyo street photography]',
        track: 'Strategy',
        context: '[PLACEHOLDER: Where and when you took these]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'slides',
          kind: 'photos',
          ratio: '3 / 2',
          slides: [
            {
              src: '',
              alt: '[PLACEHOLDER: Tokyo street photography, photo 1 of 4]',
              caption: '',
            },
            {
              src: '',
              alt: '[PLACEHOLDER: Tokyo street photography, photo 2 of 4]',
              caption: '',
            },
            {
              src: '',
              alt: '[PLACEHOLDER: Tokyo street photography, photo 3 of 4]',
              caption: '',
            },
            {
              src: '',
              alt: '[PLACEHOLDER: Tokyo street photography, photo 4 of 4]',
              caption: '',
            },
          ],
        },
      },
      {
        id: 'tk-essay-1',
        title: '[PLACEHOLDER: Tokyo personal essay, title]',
        track: 'Both',
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
        id: 'tk-game-1',
        title: '[PLACEHOLDER: Tokyo game slot]',
        track: 'Both',
        context: '[PLACEHOLDER: Project or observation from Tokyo, and what it was for]',
        shows: '[PLACEHOLDER: One line on the skill this piece shows]',
        work: {
          type: 'slot',
          note: '[PLACEHOLDER: A game or interactive piece for this stop. To reuse the puzzle here, see the guide in the README.]',
        },
      },
    ],
  },
});
