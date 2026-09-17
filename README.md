# Same Old Faces

The app lives directly in `C:\src\sameoldfaces.github.io`. **index.html is in this folder's root.** The only subfolder is `assets`, which contains the illustrative photographs. No build, dependency installation, backend or Git initialization is required.

## Run on Windows

1. Open `C:\src\sameoldfaces.github.io` in File Explorer.
2. Double-click **start.cmd**.
3. Keep its window open. It starts a local Node server and opens **http://127.0.0.1:4173/**.
4. Press **Ctrl+C** in that window to stop it.

The launcher searches the normal Node installation, PATH, and the existing Codex Node runtime on this computer. It also accepts `NODE_EXE` as an explicit path. It no longer assumes that Explorer inherits Codex's PATH.

If Node cannot be found on a different computer, install the LTS version from [nodejs.org](https://nodejs.org/) and run the launcher again. No npm installation is needed.

If Same Old Faces is already running, the launcher reopens it. If another application occupies the port, run:

```powershell
cd C:\src\sameoldfaces.github.io
.\start.cmd --port 4174
```

Use `.\start.cmd --no-open` to start without opening a browser. If Node is on your PATH, `node server.mjs` also works. Opening index.html directly as a file is not supported because browsers require HTTP for its JavaScript modules.

## Repository and GitHub Pages

Use the existing repository: [sameoldfaces/sameoldfaces.github.io](https://github.com/sameoldfaces/sameoldfaces.github.io). The local project is connected to this repository as origin. Keep index.html at the repository root, alongside .nojekyll and the application files. Do not create another repository or add an enclosing project folder.

After pushing main, open **Settings → Pages**, select **Deploy from a branch**, choose **main** and **/(root)**, and save. GitHub Pages serves the static files directly; it does not run the local Node server. The website address is **https://sameoldfaces.github.io/**. Commits pushed to main redeploy when Pages is configured this way.

Leave Custom domain empty for the initial github.io launch. Danny has purchased **SameOldFaces.com**; connect it later through Pages settings and the domain's DNS. No custom-domain configuration is included yet.

GitHub Pages publishes a public demo. The profile switcher and privacy controls demonstrate behavior; they are not real authentication or server-enforced access control. The supplied names, ages and invented activity are part of the shipped demo. Each browser gets its own local data.

Official instructions: [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Appearance

Use **Theme** in the header to switch instantly. **Membership & settings** shows all ten themes with visual samples. Each demo profile starts with its own theme: Ada uses Rainbow Daydream, Linus uses Green Screen, and Danny uses Sunny Clubhouse. Your changes are saved separately for each profile on this device and survive demo resets. If browser storage is blocked, the theme still works for the current visit.

**Sunny Clubhouse** is the fallback theme. Also included: Friendly Classic, Soft Everyday, Mac ’98, Quiet Modern, Green Screen, Rainbow Daydream, Y2K Pop, Midnight Mix and Bright & Clear. Bright & Clear uses larger text. There are no downloaded fonts or animated effects.

To add a theme, add one entry to the catalog in `themes.js` and its `:root[data-theme="your-id"]` token overrides in `themes.css`. The header menu and settings gallery are generated from that catalog. Shared layout stays in `styles.css`; colours, typography, corner shapes and theme-specific details live in `themes.css`. Existing posts, messages, profile permissions and Star balances are unaffected.

## App files

- `index.html`, `styles.css`, `app.js` — entrypoint, design and routing.
- `themes.js`, `themes.css` — appearance catalog, saved choice, previews and visual themes.
- `views.js`, `components.js`, `dialogs.js`, `ui.js` — screens and interface components.
- `data.js`, `store.js`, `model.js` — family personas and invented activity, local persistence, permissions and Star accounting.
- `assets/garden.jpg`, `assets/golden-retriever.jpg`, `assets/corgi.jpg` — illustrative photographs, with source and licence links in post captions.
- `.nojekyll` — static GitHub Pages publishing.
- `start.cmd`, `server.mjs` — local preview only.
- `check.mjs`, `model.test.mjs`, `themes.test.mjs`, `package.json` — local checks only.

## Test the prototype

Use **Viewing as** to switch between eleven supplied family personas. Danny is the default parent account. Ada is 7, Linus is 11 and Pascale is 12. Leah’s age is unspecified. The seeded demo includes 63 published posts, 7 polls, 142 replies, 155 private messages and 7 challenges, including a completed award. All conversations and activity are invented, not transcripts of real people.

Everyone is connected except these requested exclusions: Kristina connects only to Danny, Leah, Ada, Linus and Pascale; Claude and Nathalie do not connect to Suzanne or Denis; Cielo connects to everyone except Kristina. Messaging respects these connections. Household-only homework is shared with Danny, Leah and the three children. The children’s new connections still require parent approval.

The family dataset uses `common.demo.v2` in browser storage. Any earlier generic demo remains untouched under its old key. Reload to see the new family dataset; no manual reset is required. Family name corrections also update existing saved conversations while keeping connections, activity and profile theme choices. The learning conversations cover AoPS mathematical reasoning and CSES.fi competitive programming, with proofs, complexity and edge cases. These remain invented examples, not claims about completed real assignments. The CSES tasks referenced are [Increasing Array](https://cses.fi/problemset/task/1094/) and [Maximum Subarray Sum](https://cses.fi/problemset/task/1643/); [AoPS](https://artofproblemsolving.com/) is Art of Problem Solving. Pascale’s Etsy page is mentioned, but no shop URL is invented.

Connections shows names, optional shared cities, and a Message action. Search accepts names or explicitly shared profile interests, with an optional city filter. Profiles have one optional interests field; separate likes/dislikes fields and profile comparison are removed from the interface.

The Feed is one chronological stream without category filters. Me opens your own wall; names open other people’s walls. Connect in person is in Connections. Messages uses a flat layout across themes. Platform values live in About Same Old Faces. Occupation is no longer shown or edited.

Connections can publish directly on each other’s walls. A wall post is visible to its author, wall owner, and people connected to both. Existing household-only posts stay household-only. Replies and challenge entries are shown only from people the viewer knows. Try Kristina posting on Danny’s wall: Leah and the children can see it; the grandparents and Cielo cannot.

Reloading preserves saved activity and themes. The unchanged demo wall submission is published automatically. Any older pending content written or edited by you stays held until its wall owner chooses Publish or Decline; new posts need no approval.

For challenges: create a Challenge post, reserve Stars, switch profiles to enter, then return to the judge. **Demo: move past deadline** allows testing an award. It advances demo time; **Membership & settings → Reset all demo data** restores the family demo and clock.

Pairing, identity verification, membership payments, Star purchases, moderation and appeals are simulated. No money moves. Local attachments are capped at 1.5 MB. Browser storage is finite, and overflowing changes are rolled back. No real member data should be added.

Run checks even without Node on your normal PATH:

```powershell
.\start.cmd --check
```

With Node on PATH, the equivalent commands are:

```powershell
node check.mjs
node --test model.test.mjs themes.test.mjs
```

The checks serve all assets at both the domain root and a GitHub Pages-style repository path. Appearance tests cover persistence, unavailable storage, demo reset isolation, greeting text escaping and text contrast. Behavior tests cover privacy, chronology, shared-wall audiences, direct publishing, legacy held posts, pairing, child restrictions, Star balance conservation, challenge reservations and settlement.

## Supabase later

Keep the UI and replace the local state adapter with authenticated operations. Enforce field audiences, connections, family permissions and membership on the server. Star transfers, reservations and awards need atomic transactions with idempotency keys and server-authoritative deadlines. Use private media storage, real billing and identity integrations, and a human moderation process.

## Photographs

Singapore Botanic Gardens walkway, Balon Greyjoy, 19 August 2019. [Source](https://commons.wikimedia.org/wiki/File:20190819_Singapore_Botanic_Gardens_walkway-1.jpg), CC0 1.0 public-domain dedication.

Golden retriever: A throne man, [source](https://commons.wikimedia.org/wiki/File:Image_of_golden_retriever.jpg), CC0. Corgi puppy: Daniel Stockman, [source](https://commons.wikimedia.org/wiki/File:Pembroke_Welsh_Corgi_Puppy.jpg), [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/), resized. Dog and garden images are illustrative sample photographs, not photographs taken by the family.
