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
