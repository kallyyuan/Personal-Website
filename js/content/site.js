/* ==========================================================================
   SITE CONTENT
   Everything visitors read outside of the work itself lives here.
   Anything in [PLACEHOLDER: ...] brackets is waiting for your real words.
   Edit only the text between the quotes. Keep the commas and quote marks.
   ========================================================================== */

window.KALLY = window.KALLY || { places: [] };

KALLY.site = {
  name: 'Kally Yuan',
  role: 'Creative Strategist and Copywriter',

  /* Screen 1: the boarding gate */
  gate: {
    eyebrow: 'Now boarding',
    headline: 'I believe meeting people is a journey.',
    /* the word in the headline that gets the soft italic treatment */
    accentWord: 'journey',
  },

  /* The boarding pass. Add or remove rows; each row is [label, value]. */
  pass: {
    airline: 'Kally Air',
    flight: 'KY 2027',
    route: ['Anywhere', "Kally's World"],
    fields: [
      ['Passenger', 'Valued Guest'],
      ['Destination', "Kally's World"],
      ['Seat', '1A'],
      ['Gate', 'Now Boarding'],
      ['Class', 'Curious'],
    ],
    stubFields: [
      ['Passenger', 'Valued Guest'],
      ['Seat', '1A'],
      ['Gate', 'Now Boarding'],
    ],
  },

  /* Screen 2: the map */
  map: {
    title: 'Where to?',
    departures: 'Departures',
  },

  /* Screen 3: the seatback menu. Order here is the order on screen. */
  categories: [
    { id: 'snacks', label: 'Snacks', icon: 'snacks', unit: ['piece', 'pieces'] },
    { id: 'movies', label: 'Movies', icon: 'movies', unit: ['piece', 'pieces'] },
    { id: 'music', label: 'Music', icon: 'music', unit: ['piece', 'pieces'] },
    { id: 'games', label: 'Games', icon: 'games', unit: ['game', 'games'] },
  ],

  /* Section titles inside the Music drawer */
  musicGroups: {
    song: 'Playlist',
    photos: 'Photography series',
    essay: 'Personal essays',
  },

  /* Screen 4 and navigation labels */
  ui: {
    menu: 'Menu',
    map: 'Map',
    backToMenu: 'Back to the menu',
    backToMap: 'Back to the map',
    backToWork: 'Back to the work index',
    previous: 'Previous',
    next: 'Next',
    context: 'What it was for',
    shows: 'What this shows',
    workTitle: 'Work index',
    allTracks: 'All',
    allPlaces: 'All places',
    flyTo: 'Fly to',
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
