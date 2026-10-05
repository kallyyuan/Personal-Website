/* ==========================================================================
   LOS ANGELES  (where I am based)
   Each place has its own photography series and personal writing.
   group is 'based' (where you live now) or 'been' (where you have been).
   code is the three letter airport code. lat and lon place the pin on the map.
   ========================================================================== */

window.KALLY = window.KALLY || { places: [] };
KALLY.places = KALLY.places || [];
KALLY.places.push({
  id: 'los-angeles',
  name: 'Los Angeles',
  code: 'LAX',
  group: 'based',
  sub: 'Home base',
  lat: 34.05,
  lon: -118.24,
  tz: 'America/Los_Angeles',
  when: '[PLACEHOLDER: when you were here, for example 2019 to 2023]',
  photography: [
    {
      id: 'lo-photos-1',
      title: '[PLACEHOLDER: Los Angeles photography series]',
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
            alt: '[PLACEHOLDER: Los Angeles photography, photo, image 1 of 4]',
            caption: '',
          },
          {
            src: '',
            alt: '[PLACEHOLDER: Los Angeles photography, photo, image 2 of 4]',
            caption: '',
          },
          {
            src: '',
            alt: '[PLACEHOLDER: Los Angeles photography, photo, image 3 of 4]',
            caption: '',
          },
          {
            src: '',
            alt: '[PLACEHOLDER: Los Angeles photography, photo, image 4 of 4]',
            caption: '',
          },
        ],
      },
    },
  ],
  writing: [
    {
      id: 'lo-writing-1',
      title: '[PLACEHOLDER: Los Angeles personal writing 1]',
      track: 'Copywriting',
      context: '[PLACEHOLDER: What prompted you to write this]',
      shows: '[PLACEHOLDER: One line on the skill this piece shows]',
      work: {
        type: 'essay',
        paragraphs: [
          '[PLACEHOLDER: Paragraph 1]',
          '[PLACEHOLDER: Paragraph 2]',
          '[PLACEHOLDER: Paragraph 3]',
        ],
        pullQuote: '[PLACEHOLDER: One line worth pulling out]',
      },
    },
    {
      id: 'lo-writing-2',
      title: '[PLACEHOLDER: Los Angeles personal writing 2]',
      track: 'Both',
      context: '[PLACEHOLDER: What prompted you to write this]',
      shows: '[PLACEHOLDER: One line on the skill this piece shows]',
      work: {
        type: 'essay',
        paragraphs: [
          '[PLACEHOLDER: Paragraph 1]',
          '[PLACEHOLDER: Paragraph 2]',
          '[PLACEHOLDER: Paragraph 3]',
        ],
        pullQuote: '[PLACEHOLDER: One line worth pulling out]',
      },
    },
  ],
});
