/* ==========================================================================
   TOKYO  (where I have been)
   Each place has its own photography series and personal writing.
   group is 'based' (where you live now) or 'been' (where you have been).
   code is the three letter airport code. lat and lon place the lighthouse on the map.
   ========================================================================== */

window.KALLY = window.KALLY || { places: [] };
KALLY.places = KALLY.places || [];
KALLY.places.push({
  id: 'tokyo',
  name: 'Tokyo',
  code: 'HND',
  group: 'been',
  sub: 'Taste and curiosity',
  lat: 35.68,
  lon: 139.69,
  tz: 'Asia/Tokyo',
  when: '[PLACEHOLDER: when you were here, for example 2019 to 2023]',
  photography: [
    {
      id: 'to-photos-1',
      title: '[PLACEHOLDER: Tokyo photography series]',
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
            alt: '[PLACEHOLDER: Tokyo photography, photo, image 1 of 4]',
            caption: '',
          },
          {
            src: '',
            alt: '[PLACEHOLDER: Tokyo photography, photo, image 2 of 4]',
            caption: '',
          },
          {
            src: '',
            alt: '[PLACEHOLDER: Tokyo photography, photo, image 3 of 4]',
            caption: '',
          },
          {
            src: '',
            alt: '[PLACEHOLDER: Tokyo photography, photo, image 4 of 4]',
            caption: '',
          },
        ],
      },
    },
  ],
  writing: [
    {
      id: 'to-writing-1',
      title: '[PLACEHOLDER: Tokyo personal writing 1]',
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
    {
      id: 'to-writing-2',
      title: '[PLACEHOLDER: Tokyo personal writing 2]',
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
