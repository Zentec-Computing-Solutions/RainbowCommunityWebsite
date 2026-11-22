# Rainbow Valley Community

A modern, responsive redesign of the Rainbow Valley Community website. Plain HTML, CSS, and JavaScript, with local photos and fonts. No framework, build step, backend, or production dependencies.

## Preview

Open `index.html`, or serve this directory locally:

```sh
python -m http.server 4173
```

Then visit http://localhost:4173.

## Publish with GitHub Pages

1. Push these files to a GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your branch (usually `main`) and **/ (root)**, then save.

All internal links and assets use relative paths, so the site works both at a repository URL (`username.github.io/repository/`) and on a custom domain. `.nojekyll` makes GitHub serve it as a static site. Configure the custom domain in GitHub Pages when you are ready to replace the existing site.

## Files

| File | Content |
| --- | --- |
| `index.html` | Homepage |
| `community.html` | Community life, farm, history, and volunteering |
| `stay.html` | Backpackers, garden cabin, and camping |
| `explore.html` | River, Kahurangi, and the surrounding valley |
| `visit.html` | Contact details, directions, and enquiry builder |
| `privacy.html` | Privacy and how the static website handles information |
| `styles.css` | Shared layout, typography, colours, and responsive styles |
| `script.js` | Mobile navigation, footer year, and email enquiries |
| `assets/` | Local images, SVG artwork, fonts, and font licences |

Edit the HTML directly to change content. The header and footer appear in each page so navigation and contact details remain available without JavaScript. Shared colours and spacing are defined at the top of `styles.css`.

## Enquiries

The form validates details and dates, prepares an email preview, and offers **Open email app** or **Copy enquiry**. It does not send or store anything. The visitor sends the message using their own email service. It is an enquiry, not an instant booking or availability calendar.

Direct email and telephone links are available throughout. Visitors without JavaScript see those contact options instead of the form.

## Content and assets

The redesign uses the community’s existing photographs and published information. See [SOURCES.md](SOURCES.md). Published opening seasons and contact details have been retained. Old accommodation prices are omitted; the site asks visitors to enquire for current rates. Confirm the practical information and privacy wording with the community before launch.

Fonts are self-hosted DM Sans and DM Serif Display, distributed under the SIL Open Font License in `assets/fonts/`. No analytics, third-party scripts, cookies, or embedded maps are included.

The old website uses `.php` addresses. These pages use `.html`; preserve any important old links using redirects at a host that supports them if migrating the existing domain. GitHub Pages does not execute PHP or support server redirect rules.

## Check

Run the dependency-free structural check with Node.js:

```sh
node scripts/check.mjs
```

It checks local links, page anchors, duplicate IDs, image alt text, metadata, form labels, and JavaScript syntax. No Node.js installation is needed to host or use the site.
