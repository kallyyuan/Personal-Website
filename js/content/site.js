/* ==========================================================================
   SITE CONTENT
   Everything visitors read outside of the work itself lives here.
   Anything in [PLACEHOLDER: ...] brackets is waiting for your real words.
   Edit only the text between the quotes. Keep the commas and quote marks.
   ========================================================================== */

window.KALLY = window.KALLY || {};

KALLY.site = {
  name: 'Kally Yuan',
  role: 'Creative Strategist and Copywriter',

  /* The opening page */
  gate: {
    headline: 'I believe meeting people is a journey.',
    accentWord: 'journey',      /* gets the orange */
    seal: '缘',                  /* the small stamp: 缘 means fate, the pull that brings people together. Another option: 遇 */
  },

  /* The boarding pass. Each row is [label, value]. */
  pass: {
    airline: 'Kally Air',
    flight: 'KY 2027',
    fields: [
      ['Passenger', 'Valued Guest'],
      ['Destination', "Kally's World"],
      ['Seat', '1A'],
      ['Gate', 'Now Boarding'],
      ['Class', 'Curious'],
    ],
    stubFields: [
      ['Passenger', 'Valued Guest'],
      ['Gate', 'Now Boarding'],
    ],
    stubSeat: '1A',
  },

  /* The seatback menu, in order. Maps is the large one. */
  hub: {
    tiles: [
      { id: 'maps', label: 'Maps' },
      { id: 'work', label: 'Work' },
      { id: 'writing', label: 'Writing' },
      { id: 'music', label: 'Music' },
      { id: 'play', label: 'Play' },
    ],
  },

  /* Section groups: [id used in the content files, label shown] */
  groups: {
    work: [['copy', 'Copy'], ['strategy', 'Strategy'], ['research', 'Research']],
    writing: [['personal', 'Personal'], ['academic', 'Academic']],
    places: [['based', 'Where I am based'], ['been', 'Where I have been']],
  },

  /* The short haul: a two minute tour. List piece ids in the order you want them shown.
     Find an id in the content files, for example 'work-copy-1' or 'sh-photos-1'. */
  tour: {
    label: 'Short haul',
    emoji: '✈️',            /* a small wink next to the link. Delete the emoji to remove it. */
    minutes: 2,
    takeOff: 'Take off',
    /* what the visitor sees when the tour ends */
    landing: {
      emoji: '🛬',
      title: "Welcome to Kally's World",
      line: 'That was the short haul. The long haul is everything else.',
    },
    ids: ['work-copy-1', 'work-strategy-1', 'work-research-1', 'writing-personal-1', 'sh-photos-1'],
  },

  /* Maps opens by asking this */
  map: {
    ask: 'Where to?',
    pin: '📍',              /* the marker on every place. Swap it for any other emoji. */
  },

  ui: {
    menu: 'Menu',
    back: 'Back',
    backToMenu: 'Back to the menu',
    backToMap: 'Back to the map',
    previous: 'Previous',
    next: 'Next',
    context: 'What it was for',
    shows: 'What this shows',
    passport: 'Passport',
    passportEmoji: '🛂',
    sound: 'Sound',
    readingLight: 'Reading light',
    light: 'Light',
    seat: 'Seat 1A',
  },

  /* The "Your captain" card in the top corner */
  captain: {
    title: 'Your captain',
    name: 'Kally Yuan',
    lines: [
      'USC Annenberg, PR and Advertising',
      'Gender Studies minor',
      'Graduating May 2027',
    ],
    goal: 'Looking for entry level Creative Strategist and Copywriter roles at New York agencies.',
    bio: '[PLACEHOLDER: Two sentences about you, in your own voice]',
    /* href is where the link goes. Leave it '' until you have the real one.
       Examples: 'mailto:you@email.com'  or  'https://www.linkedin.com/in/yourname' */
    contacts: [
      { label: 'Email', value: '[PLACEHOLDER: your email address]', href: '' },
      { label: 'LinkedIn', value: '[PLACEHOLDER: your LinkedIn address]', href: '' },
      { label: 'Resume', value: '[PLACEHOLDER: link to your resume PDF]', href: '' },
    ],
  },
};
