# Kally Yuan, Personal Website

An interactive flight through Kally's work. Opening page, a torn boarding pass, one seatback screen, and every piece opens full size. All in one continuous experience.

## Links to share

* Whole experience: `your-site-address/`
* Straight to the work, for recruiters: `your-site-address/#/work`
* Other sections: `#/writing`, `#/maps`, `#/music`, `#/play`
* One city: `#/place/tokyo` (also `los-angeles`, `new-york`, `shanghai`, `kenya`)

## Where everything lives

| What | Where |
| --- | --- |
| Headline, boarding pass, menu labels, map question, pin emoji, "Your captain" card | `js/content/site.js` |
| Work (copy, strategy decks, research) | `js/content/work.js` |
| Writing (personal, academic) | `js/content/writing.js` |
| Music (favorite albums) | `js/content/music.js` |
| Play (the puzzle) | `js/content/play.js` |
| One city: its photography and its writing | `js/content/places/<city>.js` |
| Your pictures | `assets/work/`, `assets/music/`, `assets/places/` |
| Puzzle pictures | `assets/watercolor/puzzle-1.webp`, `-2`, `-3` |
| Colors | top of `css/base.css` |

Everything else is the machinery. You never need to open it.

## Swap in your real words

1. Open a content file, for example `js/content/work.js`. On GitHub you can click the pencil icon to edit it right in the browser.
2. Find a `[PLACEHOLDER: ...]` line. Everything that needs your words is marked this way.
3. Replace only the text between the quotes. Keep the quotes and the commas.
4. Save (commit). The site updates in a minute or two.

Every piece has the same fields:

* `id`: a short name nobody else uses, for example `work-copy-5`
* `title`: the name of the piece
* `track`: exactly one of `'Copywriting'`, `'Strategy'`, `'Both'`
* `context`: one line on what it was for
* `shows`: one line on the skill it demonstrates
* `work`: the piece itself (see the table below)

To add a piece, copy a whole block (from its opening `{` to its closing `},`), paste it below, and give it a new `id`. To remove one, delete its whole block.

## The kinds of work

Set `work.type` to one of these:

| Type | Used for | What to fill in |
| --- | --- | --- |
| `text` | A copy piece: headline, tagline, one liner | `headline`, `body` |
| `slides` | A strategy deck, research pages, or a photo series | `slides` (add or delete rows) |
| `image` | One large image | `image` |
| `essay` | Personal or academic writing | `paragraphs`, `pullQuote` |
| `album` | A favorite album | `note`, `cover`, `link` |
| `puzzle` | The jigsaw | see below |

In `work.js`, `kind` decides the group: `'copy'`, `'strategy'` or `'research'`. In `writing.js` it is `'personal'` or `'academic'`.

## Swap in your real images

1. Add your image to `assets/work/`, for example `la-deck-1.jpg`.
2. In the content file, find the image slot and set `src` to its path:

```js
{ src: 'assets/work/la-deck-1.jpg', alt: 'Slide one of the client deck, showing the headline', caption: '' }
```

3. Write `alt` as a short, plain description. It is what screen readers say.

Tips:

* JPG for photos, PNG for graphics with sharp text.
* About 1600 pixels wide is plenty. Aim for under 300 KB each. squoosh.app shrinks images for free.
* Leave `src: ''` and the slot shows its labeled placeholder.

## Music

Each album in `music.js` has a `vinyl` color: `'indigo'`, `'celadon'`, `'orange'`, `'ink'`, `'jade'` or `'periwinkle'`. Put the cover in `assets/music/` and set `cover.src`. `link` is optional (a Spotify or Apple Music address). Nothing plays by itself.

## The puzzle

* The three pictures are `assets/watercolor/puzzle-1.webp`, `-2`, `-3`. They are watercolor placeholders. Replace them with your childhood photos using the same names, or change the paths in `play.js`.
* Landscape photos (3 wide by 2 tall) fit best.
* `cols` and `rows` set the piece count. 4 by 3 is 12 pieces.
* `congrats` is the message shown when it is finished.
* To add another game later, copy the whole block in `play.js` and give it a new `id`.

## Add another place

1. Copy any file in `js/content/places/` and rename it.
2. Change `id`, `name`, `code` (the airport code), `sub`, `lat`, `lon` (its latitude and longitude), `tz` (its time zone), and the content. `group` is `'based'` for where you live and `'been'` for where you have been.
3. Open `index.html` and add one line next to the others:
   `<script defer src="js/content/places/your-file.js"></script>`

A new pin appears on the map by itself.

Every place is marked with 📍. To use a different emoji, change `pin` in `js/content/site.js` under `map`.

## Your captain card

The card in the top corner is in `js/content/site.js` under `captain`. For each contact row, fill in `value` (what people see) and `href` (where it goes, such as `'mailto:you@email.com'` or `'https://www.linkedin.com/in/yourname'`). Rows with an empty `href` show as plain text.

## Put it online

GitHub Pages is free, but only for public repositories. If you see "Upgrade or make this repository public to enable Pages", do step 1. Otherwise start at step 2.

1. Settings, then General, scroll to the bottom, "Change visibility", "Make public". The repo only holds your portfolio, so there is nothing private in it. Do not add files here that you would not want to be seen.
2. Settings, then Pages. Under "Build and deployment", set Source to "Deploy from a branch", pick `main` and `/ (root)`, and save.
3. After a minute, your address appears at the top of that page.

Prefer to keep the repo private? Netlify and Cloudflare Pages both publish private repos for free. Connect the repo, leave the build command empty, and set the publish folder to the main folder.

## Good to know

* Works in current Chrome, Safari, Firefox and Edge, on laptops and phones.
* Keyboard friendly: Tab to move, Enter to open, arrow keys in the menu, Escape to go back.
* Respects the "reduce motion" setting on phones and computers.
* Sound is off until a visitor turns it on.
* No tracking, no cookies, nothing to install.
