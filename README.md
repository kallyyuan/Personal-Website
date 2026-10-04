# Kally Yuan, Personal Website

An interactive flight through Kally's work. Boarding gate, world map, seatback entertainment screen, and a piece view, all in one continuous experience.

## Links to share

- Whole experience: `your-site-address/`
- Straight to the work, for recruiters: `your-site-address/#/work`
- Only one track: `#/work?track=Copywriting`, `#/work?track=Strategy`, `#/work?track=Both`
- Only one place: `#/work?place=los-angeles` (also `new-york`, `shanghai`, `tokyo`, `kenya`)

## Where everything lives

| What | Where |
| --- | --- |
| Headline, boarding pass, labels, "Your captain" card | `js/content/site.js` |
| Los Angeles work | `js/content/places/los-angeles.js` |
| New York work | `js/content/places/new-york.js` |
| Shanghai work and the puzzle | `js/content/places/shanghai.js` |
| Tokyo work | `js/content/places/tokyo.js` |
| Kenya work | `js/content/places/kenya.js` |
| Your photos and graphics | `assets/work/` |
| Puzzle photos | `assets/puzzle/` |
| Colors | top of `css/base.css` |

Everything else is the machinery. You never need to open it.

## Swap in your real words

1. Open a content file, for example `js/content/places/los-angeles.js`. On GitHub you can click the pencil icon to edit it right in the browser.
2. Find a `[PLACEHOLDER: ...]` line. Everything that needs your words is marked this way.
3. Replace only the text between the quotes. Keep the quotes and the commas.
4. Save (commit). The site updates in a minute or two.

Each piece of work has the same fields:

- `title`: the name of the piece
- `track`: exactly one of `'Copywriting'`, `'Strategy'`, `'Both'`
- `context`: one line on what it was for
- `shows`: one line on the skill it demonstrates
- `work`: the piece itself (see below)

## Swap in your real images

1. Add your image to `assets/work/`, for example `la-deck-1.jpg`.
2. In the content file, find the image slot and set `src` to its path:

```js
{ src: 'assets/work/la-deck-1.jpg', alt: 'Slide one of the client deck, showing the headline', caption: '' }
```

3. Write `alt` as a short, plain description. It is what screen readers say.

Image tips:

- JPG for photos, PNG for graphics with sharp text.
- About 1600 pixels wide is plenty. Aim for under 300 KB each. squoosh.app shrinks images for free.
- Leave `src: ''` and the slot shows its labeled placeholder.

## The different kinds of work

Set `work.type` to one of these:

| Type | What it shows | What to fill in |
| --- | --- | --- |
| `text` | A snack: headline, tagline, one liner | `headline`, `body` |
| `slides` | A slideshow or photo series | `slides` (add or delete rows) |
| `image` | One large image | `image` |
| `song` | A song with your note on why it matters | `artist`, `note`, `cover`, `link` |
| `essay` | A personal essay | `paragraphs`, `pullQuote` |
| `puzzle` | The jigsaw | see below |
| `slot` | An empty game slot | `note` |

To add a piece, copy a whole block (from its opening `{` to its closing `},`), paste it below, and give it a new unique `id`.
To remove a piece, delete its whole block.

## The puzzle

- Photos are `assets/puzzle/puzzle-photo-1`, `-2`, `-3`. Replace them with your childhood photos using the same names, or change the paths in `shanghai.js`.
- Landscape photos (3 wide by 2 tall) fit best.
- `cols` and `rows` set the piece count. 4 by 3 is 12 pieces.
- `congrats` is the message shown when it is finished.
- To put the puzzle in another place, copy the `puzzle` block from `shanghai.js` into that place's `games` list and give it a new `id`.

## Add another place

1. Copy any file in `js/content/places/` and rename it.
2. Change `id`, `name`, `sub`, `lat`, `lon` (its latitude and longitude), `tz` (its time zone), and the content.
3. Open `index.html` and add one line next to the others:
   `<script defer src="js/content/places/your-file.js"></script>`

A new lighthouse appears on the map by itself.

## Your captain card

The card in the top corner is in `js/content/site.js` under `captain`. For each contact row, fill in `value` (what people see) and `href` (where it goes, such as `'mailto:you@email.com'` or `'https://www.linkedin.com/in/yourname'`). Rows with an empty `href` show as plain text.

## Put it online

1. On GitHub, open the repository, then Settings, then Pages.
2. Under "Build and deployment", choose "Deploy from a branch", pick `main` and `/ (root)`, and save.
3. After a minute, your address appears at the top of that page.

## Good to know

- Works in current Chrome, Safari, Firefox and Edge, on laptops and phones.
- Keyboard friendly: Tab to move, Enter to open, arrow keys in the menu, Escape to go back.
- Respects the "reduce motion" setting on phones and computers.
- No tracking, no cookies, nothing to install.
