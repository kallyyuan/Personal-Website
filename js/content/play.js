/* ==========================================================================
   PLAY: games. The jigsaw uses your childhood photos.
   Replace the three files in assets/watercolor/ named puzzle-1, puzzle-2, puzzle-3
   with your photos (same names), or change src to point at your own files.
   Landscape photos (3 wide by 2 tall) fit best. cols and rows set the piece count.
   ========================================================================== */

window.KALLY = window.KALLY || {};
KALLY.play = [
  {
    id: 'play-puzzle',
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
          src: 'assets/watercolor/puzzle-1.webp',
          alt: '[PLACEHOLDER: puzzle photo 1, a childhood photo]',
          label: 'Photo 1',
        },
        {
          src: 'assets/watercolor/puzzle-2.webp',
          alt: '[PLACEHOLDER: puzzle photo 2, a childhood photo]',
          label: 'Photo 2',
        },
        {
          src: 'assets/watercolor/puzzle-3.webp',
          alt: '[PLACEHOLDER: puzzle photo 3, a childhood photo]',
          label: 'Photo 3',
        },
      ],
      congrats: 'Every piece in its place. Welcome home.',
    },
  },
];
