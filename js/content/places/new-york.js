/* ==========================================================================
   NEW YORK  (where I have been)
   Each place has its own photography series and personal writing.
   group is 'based' (where you live now) or 'been' (where you have been).
   code is the three letter airport code. lat and lon place the lighthouse on the map.
   ========================================================================== */

window.KALLY = window.KALLY || { places: [] };
KALLY.places = KALLY.places || [];
KALLY.places.push({
  id: 'new-york',
  name: 'New York',
  code: 'JFK',
  group: 'been',
  sub: 'Next stop',
  lat: 40.71,
  lon: -74.01,
  tz: 'America/New_York',
  when: '[PLACEHOLDER: when you were here, for example 2019 to 2023]',
  photography: [
    {
      id: 'ne-photos-1',
      title: '[PLACEHOLDER: New York photography series]',
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
            alt: '[PLACEHOLDER: New York photography, photo, image 1 of 4]',
            caption: '',
          },
          {
            src: '',
            alt: '[PLACEHOLDER: New York photography, photo, image 2 of 4]',
            caption: '',
          },
          {
            src: '',
            alt: '[PLACEHOLDER: New York photography, photo, image 3 of 4]',
            caption: '',
          },
          {
            src: '',
            alt: '[PLACEHOLDER: New York photography, photo, image 4 of 4]',
            caption: '',
          },
        ],
      },
    },
  ],
  writing: [
    {
      id: 'ne-writing-1',
      title: '[PLACEHOLDER: New York personal writing 1]',
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
      id: 'ne-writing-2',
      title: '[PLACEHOLDER: New York personal writing 2]',
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
  ],
});
