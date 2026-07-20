/* ============================================================
   STEAM SHOW — КОНТЕНТ (единственный файл с копирайтом)
   Здесь живёт ВСЁ, что пишет человек: имена, описания, спеки,
   теги, YouTube-ID, тексты секций, контакты. Пути к медиа —
   в media.js (автогенерация). Сшивка — в data.js (window.SS).
   Правьте смело — структуру не ломайте.
   ============================================================ */
window.SS_CONTENT = {
  /* Витринный showreel (YouTube ID) */
  reel: 'a_CLhJkdnGg',

  /* Порядок шоу везде: меню, ряды, стрелки prev/next */
  order: ['dragon', 'fire', 'ledfire', 'led', 'stilts'],

  /* Фирменный цвет каждого шоу (палитра hybrid2) */
  colors: {
    dragon:  '#FF6A1F',
    fire:    '#FFD23E',
    ledfire: '#FF2E84',
    led:     '#25F4EE',
    stilts:  '#FF6A1F'
  },

  /* ---------------------------------------------------------
     ШОУ. У каждого:
       name / nav          — полное имя и короткая подпись в меню
       videos              — YouTube ID (порядок = порядок показа)
       card { ... }        — тизер в ряду на ГЛАВНОЙ
       detail { ... }      — полная страница show.html
     --------------------------------------------------------- */
  shows: {
    dragon: {
      name: 'Dragon Fire Show', nav: 'Dragon',
      videos: ['95Zx38TO_5Q'],
      card: {
        kind: 'Signature',
        desc: 'A fire theatrical show built around a 3-metre dragon, performed in a classic fantasy or a Slavic folk theme.',
        specs: { Format: 'Outdoor', Duration: '10–15 min · adaptable', Cast: 'Scalable' },
        tags: ['Fire show', '3-metre dragon', 'Theatrical show']
      },
      detail: {
        type: 'Flagship · fire',
        desc: 'A fire theatrical show built around a 3-metre dragon, performed in a classic fantasy or a Slavic folk theme. Scales from intimate galas to festival main stages.',
        duration: '10–15 min · adaptable', format: 'Outdoor', cast: 'Scalable',
        chips: ['Flamethrowers', 'Fire cubes', 'Pyro', 'Headliner'],
        variants: null
      }
    },

    fire: {
      name: 'Fire Show', nav: 'Fire',
      videos: ['kUXyXDO6O7I', '5kWySEToST0', 'Q4SIaQwPHLs'],
      card: {
        kind: 'Fantasy · Post-apoc · Rock',
        desc: 'Spectacular fire props (wings, cubes, sparkle staffs, flamethrowers and fire cannons) in a visual theme of your choice, from fantasy to post-apocalyptic and rock.',
        specs: { Format: 'Outdoor', Duration: '10–15 min', Style: 'Your choice' },
        tags: ['Your chosen style', 'Large-scale dynamic show']
      },
      detail: {
        type: 'Classic · fire',
        desc: 'Large-scale fire choreography, dressed to a theme. Pick one of our themes, or for big events we build one around your concept.',
        duration: '10–15 min · adaptable', format: 'Outdoor', cast: 'Scalable',
        chips: ['Live fire', 'Choreography', 'Bespoke themes'],
        variants: {
          kind: 'themes', navLabel: 'Themes', title: 'Themed fire',
          lead: 'Every theme has its own costumes, music and choreography. These are our signature ones. For large events we create a new theme to brief.',
          items: [
            { nm: 'Theme 01', h: 'Rock',             p: 'Raw, loud, rebellious. Fire to a driving rock energy.' },
            { nm: 'Theme 02', h: 'Fantasy',          p: 'Ethereal and mythic. A fairy-tale told in flame.' },
            { nm: 'Theme 03', h: 'Post-apocalyptic', p: 'Gritty, industrial, dystopian. Fire from a scorched future.' },
            { nm: 'Theme 04', h: 'Steampunk',        p: 'Plague doctors and Victorian dames, in brass, gears and gaslight.' },
            { nm: 'Theme 05', h: 'Slavic Folk',      p: 'Born at a Maslenitsa festival. A folkloric winter fire ritual.' },
            { bespoke: true, nm: 'On request', h: 'Your theme', p: 'For large events we build a bespoke theme around your concept, brand or festival.' }
          ]
        }
      }
    },

    ledfire: {
      name: 'LED Fire Show', nav: 'LED Fire',
      videos: ['aq-PXZIlsyo', 'NwEsu64rFzY'],
      card: {
        kind: 'Glow + Flame',
        desc: 'The best of both: live fire performed in glowing LED costumes. The heat of fire with the colour of light.',
        specs: { Format: 'Outdoor', Duration: '10–15 min', Look: 'Light + fire' },
        tags: ['Light + real fire']
      },
      detail: {
        type: 'Hybrid · fire + light',
        desc: 'The best of both: live fire performed in glowing LED costumes. The heat of fire with the colour of light.',
        duration: '10–15 min · adaptable', format: 'Outdoor', cast: 'Scalable',
        chips: ['Live fire', 'LED costumes', 'Hybrid'],
        variants: null
      }
    },

    led: {
      name: 'LED Show', nav: 'LED',
      videos: ['v3MyA-lNGok', 'U4-_8da2uuI', 'Ain3sUrpU2w', 'T6nHGrLrXoU', 'N7Qj5uU1bH4', '7SCXdglhHgI'],
      card: {
        kind: 'Pure light',
        desc: 'Pure light, zero smoke or flame: glowing LED costumes and programmable props, choreographed to music. Built for indoor venues.',
        specs: { Format: 'Indoor & outdoor', Duration: '10–15 min', Looks: 'Many' },
        tags: ['Many looks', 'LED cube', 'Glowing wings']
      },
      detail: {
        type: 'Electric · light',
        desc: 'A dazzling, smoke-free light show driven by glowing LED costumes and fully programmable props. Colours move with your soundtrack and can match your brand palette, making it ideal for indoor galas, weddings, corporate nights and product launches where open flame is not an option.',
        seo: {
          title: 'LED Light Show for Events & Galas - Steam Show',
          desc: 'Book a smoke-free LED light show: glowing costumes and programmable props, choreographed to your music. Great for indoor galas, weddings and corporate events.'
        },
        duration: '10–15 min · adaptable', format: 'Indoor & outdoor', cast: 'Scalable',
        chips: ['Smoke-free', 'LED catalogue', 'Full luminous'],
        variants: null
      }
    },

    stilts: {
      name: 'Stilt Walkers', nav: 'Stilts',
      videos: ['UlvKULj4Xe8', 'AW1l9PbVqdY', 'HLwZI7htNus', 'iAFeaUvX_Hw', 'UFmJgKILurU', 'epn4YnmNrQ8', 'wogKA0crrt0'],
      card: {
        kind: 'Animation or full show',
        desc: 'A wardrobe of towering characters, as roaming animation or a full stilt performance.',
        specs: { Format: 'Indoor & outdoor', Mode: 'Roaming or set', Costumes: 'Dozens' },
        tags: ['Dozens of costumes']
      },
      detail: {
        type: 'Roaming · giants',
        desc: 'A wardrobe of towering characters, as roaming animation or a full stilt performance. Costumes group into themes and mix freely across them.',
        duration: 'Roaming or set act', format: 'Indoor & outdoor', cast: 'Scalable',
        chips: ['Roaming', 'Full stage show', '100+ costumes'],
        variants: { kind: 'stilts', navLabel: 'Wardrobe' }
      }
    }
  },

  /* ---------------------------------------------------------
     ГАРДЕРОБ ХОДУЛИСТОВ — имена/блёрбы (ключи = папки в media.js)
     --------------------------------------------------------- */
  stilts: {
    wardrobe: {
      kicker: 'Costumes & themes',
      title: 'The wardrobe',
      lead: '100+ towering characters. Explore each theme, its film and costume gallery, or browse the full set with theme filters below.'
    },
    /* «Фильм» темы с YouTube (ключ темы -> YouTube ID). Перебивает локальное видео. */
    themeVideos: {
      'stilts-pirates':      'UlvKULj4Xe8',
      'stilts-fairy-garden': 'AW1l9PbVqdY'
    },
    /* Кроп обложки темы на превью (ключ темы -> CSS object-position). */
    themeFocus: {
      'stilts-christmas': 'top'
    },
    themes: {
      'stilts-fairy-garden':  'Fairy Garden',
      'stilts-circus':        'Circus',
      'stilts-pirates':       'Pirates',
      'stilts-classics':      'Classics',
      'stilts-trees':         'Trees',
      'stilts-christmas':     'Christmas',
      'stilts-shamans':       'Dragons & Shamans',
      'stilts-star-giraffe':  'Giraffe',
      'stilts-led':           'LED costumes'
    },
    otherLabel: 'More characters'
  },

  /* ---------------------------------------------------------
     КОНТАКТЫ — используются и на главной, и на страницах шоу
     ic: instagram | email | whatsapp | youtube (иконки в data.js)
     color / color2 — акценты пилюли-иконки
     --------------------------------------------------------- */
  contact: [
    { ic: 'instagram', kicker: 'Instagram',          value: '@steam_show',     go: 'See the feed →', href: 'https://instagram.com/steam_show',       color: '#FF2E84', color2: '#FF6A1F', ext: true },
    { ic: 'email',     kicker: 'Email',              value: 'hello@steamshow', go: 'Send a brief →', href: 'mailto:hello@steamshow.com',            color: '#FFD23E', color2: '#FF6A1F' },
    { ic: 'whatsapp',  kicker: 'WhatsApp · Telegram', value: 'Message us',      go: 'Chat now →',     href: '#',                                     color: '#FF6A1F', color2: '#FF2E84' },
    { ic: 'youtube',   kicker: 'YouTube',            value: '@SteamShowby',    go: 'Watch shows →',  href: 'https://www.youtube.com/@SteamShowby',  color: '#25F4EE', color2: '#FF2E84', ext: true }
  ]
};
