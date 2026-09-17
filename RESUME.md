# Continue this project

Checkpoint: 17 September 2026.

## What this is

Same Old Faces is a paid, private social network for people and families who know each other. Danny has purchased SameOldFaces.com. The local folder is C:\src\sameoldfaces.github.io and the existing remote repository is https://github.com/sameoldfaces/sameoldfaces.github.io. The project is a static prototype with invented demo activity, browser-local persistence, and no backend, authentication service, real payments, or advertising.

All application files live at the project root, including index.html. Keep this simple layout. The assets folder holds illustrative photographs. Do not create nested application folders, rename the project, or publish a public demo without a new request.

## Run and verify

- Windows: double-click start.cmd; keep the server window open. Default address: http://127.0.0.1:4173/.
- Any machine with Node 20 or later: run `node server.mjs`, or `npm start` to also open the browser. There are no dependencies to install.
- Checks: `node check.mjs` and `node --test model.test.mjs themes.test.mjs`; Windows also supports `start.cmd --check`.
- At this checkpoint, all 34 tests passed, together with syntax and static-serving checks at both `/` and `/common/`.
- User-created demo activity and selected themes live in each browser's local storage. A source-code checkout restores the seeded demo, not another browser's saved activity.

## Decisions to preserve

- Four main areas: Feed, Connections, Messages, Me. Me is the single navigation entry for your own wall; no duplicate sidebar avatar/name or View your profile link.
- Feed is chronological, with no All Posts, Family, or Challenge filter tabs. Challenges are posts with a detail page. Keep the stopping point when caught up.
- Connections is for existing connections and connecting in person; no public people discovery. Occupation is removed. Interests remain one optional field, with no separate likes/dislikes lists or profile comparison.
- Trusted connections can post directly on one another's walls. Visibility is limited to the author, wall owner, and their shared connections. Household restrictions still apply. Custom legacy held posts remain held until the wall owner acts.
- Messaging uses a flat layout across themes. Avoid conflicting rounded and square chrome.
- Sunny Clubhouse is the preferred overall appearance. Keep all ten themes and the subtle standard Theme control. Avoid newspaper typography, large theme buttons, decorative dropdown carets, and marketing filler in the member interface.
- Platform values belong in About Same Old Faces. Keep the product approachable and minimal.
- Membership, pairing, identity checks, Star purchases, transfers, challenges, moderation, cancellation, export, and deletion are prototype demonstrations. Supabase and real payments are later work.
- Future member content must be human-created; the prototype's conversations are fictional sample content. No advertising or engagement ranking.

## Demo people

Danny (44), Ada (7), Linus (11), Pascale (12), Leah, Kristina, Suzanne, Denis, Claude, Nathalie, and Cielo. Use these spellings and given names; no Dad, Grandma, or Grandpa display-name prefixes.

Keep the supplied interests and conversations recognizable: Enshrouded, Stick Fight, Toca Boca, Scratch, dogs, unicorns, drawing and masks, Brazilian jiu-jitsu, yoga, investing, recipes, politics, and prayers. The learning topics are AoPS (Art of Problem Solving) and CSES.fi competitive programming, with substantive reasoning and age-appropriate voices.

The connection graph has deliberate exceptions: Kristina connects only to Danny, Leah, Ada, Linus, and Pascale. Claude and Nathalie do not connect to Suzanne or Denis. Cielo connects to everyone except Kristina. Messaging and visibility respect these connections.

## Name and hosting

The name is now Same Old Faces. Danny purchased SameOldFaces.com and created sameoldfaces/sameoldfaces.github.io. Push to that existing repository. index.html is in the root; the intended initial site is https://sameoldfaces.github.io/. Connect the custom domain later. domain-names.md preserves the earlier naming research as history.

Browser storage keys retain the old common prefix to preserve existing local activity and theme choices. Do not rename those keys without migration.

## Next session

Open C:\src\sameoldfaces.github.io, read this file and README.md, start the local server, and continue from the user's next request. Check the Git remote and current push status rather than assuming deployment is enabled.
