# George Innasi, portfolio site

A static multi-page site. No framework, no build step, no dependencies. Every page is plain
HTML sharing one stylesheet and one small script.

## Pages

```
/                          Home
/work/                     Case study index
/work/lumi-cards/          Lumi Cards
/work/side-quest/          Side Quest
/work/hellofresh-retention/ HelloFresh retention study
/work/kittii/              Kittii
/projects/                 Side projects, the finance calculators
/about/                    About
/about/experience/         Experience
/about/education/          Education
/about/certifications/     Certifications
/contact/                  Contact
404.html                   Not found
```

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New, Project** and import that repository.
3. Framework preset: **Other**. Leave the build command empty and set the output directory to
   the repository root. `vercel.json` handles the rest.
4. Deploy.

To deploy without GitHub, run `npx vercel` from inside this folder and follow the prompts.

### Adding the domain

In the Vercel project, open **Settings, Domains**, add the domain and follow the DNS records
Vercel shows. Then replace `REPLACE-WITH-YOUR-DOMAIN` in `robots.txt` and `sitemap.xml` with
the live domain.

## Things still to add

1. **Lumi PRD.** Save it as `assets/lumi-cards-prd.pdf`, then make the same swap on the two
   buttons in `work/lumi-cards/index.html`.
2. **Case study images.** Every case study has labelled placeholder panels marked `.shot`,
   each captioned with what belongs there. Replace one with
   `<div class="shot"><img src="/assets/your-image.png" alt="..."></div>`.

## Editing

Pages are independent files. The navigation is inline in each page, so adding a nav item means
editing each file's `.nav-links` block. The current page is marked with `aria-current="page"`.

All colour, type and spacing is defined as custom properties at the top of `assets/site.css`.
Change a value there and it applies everywhere, in both light and dark themes.

Fonts load from Google Fonts: Fraunces for the italic serif, Hanken Grotesk for the sans.

## The case study layout

All four case studies share one structure, defined in the `case study layout` block of
`assets/site.css`:

- `.cs-hero` — centred kicker, serif title, tagline, stack chips, action buttons.
- An opening `.row` with the origin story and the overview: product, audience, business problem.
- A `.meta-strip` giving role, timeline and stage, followed by what I owned.
- Repeating phases, each a `.phase` heading with flanking rules, then `.row` blocks that
  alternate text and visual. Add `.flip` to a row to put the visual on the left.
- `.shot` is a labelled image placeholder, `.shot.tall` the phone-shaped one.
- `.cmp` inside `.cmp-wrap` is the comparison table. Cells with class `tick` hold the marks
  or short values and shrink to fit.

Page colour comes from one attribute on `<body>`: `data-accent` set to `blue`, `violet`,
`green` or `wine`. Everything on the page follows it.
