# Devpost answers

Leo's voice. Three to four sentences each.

## How we built it

It's a React and TypeScript app that runs entirely in the browser, with the
whole recipe graph, about 1,036 recipes, bundled into the page as one import,
so once it loads you can play it offline. There are two small serverless
functions on Vercel, one for explaining why a combination did nothing and one
for the learn more questions, and they exist only because they hold the Gemini
key. We deliberately kept the model away from the recipe list, so the functions
receive two element names and an enum value and nothing else, and the largest
request that has ever gone out is 1,761 bytes against a 514KB graph. The art is
generated as well, as 65 shapes get recoloured into 963 of the icons, which is
how we got to a thousand things without drawing a thousand sprites.

## Challenges we ran into

The hardest part was the data, as the whole claim is that nothing in the game is
invented, so every recipe needed a source, and at a thousand recipes you cannot
read all of them yourself. So we wrote a gate that fetches every citation and
checks the page title against the label it is shown under, and it rejected a
lot, including pairs that were already claimed and articles that quietly
redirected somewhere else. The other one was self-inflicted: we pointed a k6
load test at the production URL and Vercel's DDoS mitigation denied our whole
IP, so the live site stopped loading for everyone on our network in the middle
of the hackathon. It runs against a local preview now, which measures the app
instead of Vercel's patience.

## Accomplishments that we're proud of

There are 1,033 things in it and every one has a citation, with zero unsourced
recipes. I'm most proud of the failure case though, as you are wrong about 99.8%
of the time and the game tells you why every time, which turns being wrong into
the part where you learn something rather than the part where you get stuck. The
fence around the model is the other one, as it has never seen the recipe list
and could not name a real recipe if you asked it to. And it works on a phone,
which took a sweep of 14 screen sizes and 280 checks to be sure of.

## What we learned

Mostly that you cannot eyeball anything at this scale. We found a 20 millisecond
collision between two shooting stars by printing their periods, an icon audit
turned up 631 near-identical pairs that looked fine to us, and the layout bugs on
small screens only appeared once we swept every size. I also learned that a test
can pass and still be useless if it asserts a proxy instead of the property, as
we had three that checked how the code was written rather than what it did, and
all three had to be rewritten. The other thing is that constraints make the
design, as we could only fit about twelve words on a slide at a readable size,
so only the twelve worth keeping survived.

## What's next for From Scratch

Challenges are the next thing, like every part needed to play football or build a
rocket, using the graph that is already there. Local records too, so fewest
attempts to a target or best hit rate, which the stats panel already counts and
which does not need a server. We'd also like to get more of the footprint figures
hand-read, as only eight recipes carry one right now and the rest say zero rather
than guess, and doing one full chain properly would let us show the embodied
water and carbon of a t-shirt from the soil upward. And a classroom version, as
the thing it is good at is making someone ask where something came from.

## Built With (25 tags)

In priority order, so cutting from the bottom costs the least. Every one is
something the repository actually uses; nothing here is padding for the count.

react · typescript · vite · tailwind · vercel · google-gemini · serverless ·
node.js · playwright · k6 · oxlint · javascript · html5 · css3 · canvas · svg ·
localstorage · json · wikipedia · google-fonts · figma · ffmpeg · github · npm

That is 24, not 25, and deliberately. **`rest-api` was on this list and came
off.** REST means resources identified by URIs with HTTP verbs acting on them;
`api/adjudicate.ts` and `api/ask.ts` are two POST endpoints that perform an
action and return a sentence, with no resource, no GET and no PUT. That is RPC
over HTTP with JSON. Most people would call it a REST API and nobody would
challenge it, but the standing rule is to claim only what survives being asked
about, and "what is RESTful about it?" has no good answer here.

Where each one is used, if anyone asks:

- **canvas** — four scenes draw to `<canvas>`: `Starfield`, `PixelEarth`,
  `CityScene`, `ForestScene`.
- **svg** — the icons and these slides.
- **localstorage** — six keys; the save and the settings. There is no database.
- **playwright** — the 14-device sweep, rasterising the slides, video capture.
- **k6** — `load/gameplay.js` and `load/adjudicate.js`.
- **oxlint** — `npm run lint`.
- **wikipedia** — 2,071 of the 2,074 citations; `npm run links` fetches each one
  and checks its page title.
- **google-fonts** — Press Start 2P, Silkscreen, Nunito.
- **figma** — the pixel-art direction the whole look came from, see
  `docs/DESIGN.md`.
- **ffmpeg** — `scripts/film.mjs` and `scripts/capture.mjs` encode the timelapse.

**Add `godaddy` only if the domain is actually registered**, and drop `npm` to
make room. Three slides already claim GoDaddy, so this tag and those chips
should be true or gone together.

## Did you implement a generative AI model or API? How and why?

Yes, we used the Gemini API. When you combine two things that don't make
anything, which is most of the time, one endpoint asks Gemini to explain in a
sentence why those two don't react, and a second answers three fixed questions
about anything you have made, so you can go and learn more about it. We used it
because the game is meant to teach, and a wrong guess is only useful if
something tells you why it was wrong. It never sees the recipe list though, so
it can explain a failure but it can't hand you an item.
