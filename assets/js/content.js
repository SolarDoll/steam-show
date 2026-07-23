/* ============================================================
   STEAM SHOW — КОНТЕНТ (единственный файл с копирайтом)
   Здесь живёт ВСЁ, что пишет человек: имена, описания, спеки,
   теги, YouTube-ID, тексты секций, контакты. Пути к медиа —
   в media.js (автогенерация). Сшивка — в data.js (window.SS).

   ДВУЯЗЫЧНОСТЬ: каждая читаемая человеком строка — объект
   { en:'…', ru:'…' }. data.js разворачивает её в нужный язык
   по window.SS_LANG (см. i18n.js). EN — база (мировой рынок),
   RU — локальный акцент (Минск, РБ; упор на форматы событий).
   Config-поля (order, colors, ключи тем, variants.kind) —
   обычные строки, НЕ переводятся. Правьте смело — оба языка
   рядом; структуру не ломайте.
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
     Читаемые строки — { en, ru }. Ключи specs (Format/Duration/…)
     остаются английскими — их подписи переводит i18n (spec.*).
     --------------------------------------------------------- */
  shows: {
    dragon: {
      name: { en: 'Dragon Fire Show', ru: 'Шоу с Драконом' }, nav: { en: 'Dragon', ru: 'Дракон' },
      videos: ['jH1iB6rw3wI', '95Zx38TO_5Q', 'kWC7arxFFXw'],
      card: {
        kind: { en: 'Signature', ru: 'Фирменное' },
        desc: { en: 'A fire theatrical show built around a 3-metre dragon, performed in a classic fantasy or a Slavic folk theme.',
                ru: 'Огненное театрализованное шоу с трехметровым драконом в классическом фэнтези или славянском фолк-стиле.' },
        specs: {
          Format:   { en: 'Outdoor', ru: 'Улица' },
          Duration: { en: '10–15 min · adaptable', ru: '10–15 мин · гибко' },
          Cast:     { en: 'Scalable', ru: 'Масштабируется' }
        },
        tags: [
          { en: 'Fire show', ru: 'Фаер-шоу' },
          { en: '3-metre dragon', ru: '3-метровый дракон' }
        ]
      },
      detail: {
        type: { en: 'Flagship · fire', ru: 'Флагман · огонь' },
        desc: { en: 'A fire theatrical show built around a 3-metre dragon, performed in a classic fantasy or a Slavic folk theme. Scales from intimate galas to festival main stages.',
                ru: 'Огненное театрализованное шоу с трёхметровым драконом в духе классического фэнтези или славянского фольклора. Подходит как для камерных мероприятий, так и для главных сцен крупных фестивалей.' },
        duration: { en: '10–15 min · adaptable', ru: '10–15 мин · гибко' },
        format:   { en: 'Outdoor', ru: 'Улица' },
        cast:     { en: 'Scalable', ru: 'Масштабируется' },
        chips: [
          { en: 'Flamethrowers', ru: 'Огнемёты' },
          { en: 'Fire cubes', ru: 'Огненные кубы' },
          { en: 'Pyro', ru: 'Пиро' },
          { en: 'Headliner', ru: '3х-метровый Дракон' }
        ],
        variants: null
      }
    },

    fire: {
      name: { en: 'Fire Show', ru: 'Огненное шоу' }, nav: { en: 'Fire', ru: 'Огонь' },
      videos: ['5kWySEToST0', 'f3witZXJ3s8', 'MvgSbUl1i64', 'kUXyXDO6O7I', 'Q4SIaQwPHLs', '_HabSQ_Wyo4'],
      card: {
        kind: { en: 'Fantasy · Post-apoc · Rock', ru: 'Фэнтези · Постапокалипсис · Рок' },
        desc: { en: 'Spectacular fire props (wings, cubes, sparkle staffs, flamethrowers and fire cannons) in a visual theme of your choice, from fantasy to post-apocalyptic and rock.',
                ru: 'Огненные крылья, огромные кубы, пиротехника, огнеметы и фаер-пушки — всё, чтобы создать незабываемое шоу в любой стилистике: от фэнтези до постапокалипсиса и рока.' },
        specs: {
          Format:   { en: 'Outdoor', ru: 'Улица' },
          Duration: { en: '10–15 min', ru: '10–15 мин' },
          Style:    { en: 'Your choice', ru: 'На ваш выбор' }
        },
        tags: [
          { en: 'Your chosen style', ru: 'Разные стили' },
          { en: 'Large-scale dynamic show', ru: 'Масштабное динамичное шоу' }
        ]
      },
      detail: {
        type: { en: 'Classic · fire', ru: 'Классика · огонь' },
        desc: { en: 'Large-scale fire choreography, dressed to a theme: fire performers, flame props and live pyrotechnics. Pick one of our signature themes, or for big events we build one around your concept.',
                ru: 'Энергичное фаер-шоу с масштабным огненным реквизитом, огнемётами, искровыми эффектами и пиротехникой. Готовые фирменные концепции можно адаптировать под ваше мероприятие.' },
        seo: {
          title: { en: 'Fire Show for Events, Festivals & Weddings - Steam Show',
                   ru: 'Фаер-шоу на праздник, фестиваль и свадьбу — Steam Show' },
          desc: { en: 'Book a large-scale fire show: choreographed fire performers, flame props and pyro, themed to fantasy, rock or post-apocalyptic. Great for festivals & weddings.',
                  ru: 'Закажите масштабное фаер-шоу: хореография фаерщиков, огненный реквизит и пиротехника в теме фэнтези, рок или постапокалипсис. Отлично для фестивалей и свадеб.' }
        },
        duration: { en: '10–15 min · adaptable', ru: '10–15 мин · гибко' },
        format:   { en: 'Outdoor', ru: 'Улица' },
        cast:     { en: 'Scalable', ru: 'Масштабируется' },
        chips: [
          { en: 'Live fire', ru: 'Живой огонь' },
          { en: 'Choreography', ru: 'Хореография' },
          { en: 'Bespoke themes', ru: 'Темы под заказ' }
        ],
        variants: {
          kind: 'themes', navLabel: { en: 'Themes', ru: 'Темы' }, title: { en: 'Themed fire', ru: 'Тематическое пламя' },
          lead: { en: 'Every theme has its own costumes and music. These are our signature ones. For large events we create a new theme to brief.',
                  ru: 'У каждой темы свои костюмы и музыка. Вот наши фирменные. Для крупных событий создаём новую тему под бриф.' },
          items: [
            { key: 'fire-rock',      nm: { en: 'Theme 01', ru: 'Тема 01' }, h: { en: 'Rock', ru: 'Рок' },                       p: { en: 'Raw, loud, rebellious. Fire to a driving rock energy.', ru: 'Дерзко, громко, бунтарски. Огонь под драйвовую рок-энергетику.' } },
            { key: 'fire-fantasy',   nm: { en: 'Theme 02', ru: 'Тема 02' }, h: { en: 'Fantasy', ru: 'Фэнтези' },                 p: { en: 'Ethereal and mythic. A fairy-tale told in flame.', ru: 'Воздушно и мифически. Сказка, рассказанная пламенем.' } },
            { key: 'fire-postapoc',  nm: { en: 'Theme 03', ru: 'Тема 03' }, h: { en: 'Post-apocalyptic', ru: 'Постапокалипсис' }, p: { en: 'Gritty, industrial, dystopian. Fire from a scorched future.', ru: 'Жёстко, индустриально, антиутопично. Огонь из выжженного будущего.' } },
            { key: 'fire-steampunk', nm: { en: 'Theme 04', ru: 'Тема 04' }, h: { en: 'Steampunk', ru: 'Стимпанк' },               p: { en: 'Plague doctors and Victorian dames, in brass, gears and gaslight.', ru: 'Чумные доктора и викторианские дамы — латунь, шестерни и газовый свет.' } },
            { key: 'fire-slavic',    nm: { en: 'Theme 05', ru: 'Тема 05' }, h: { en: 'Slavic Folk', ru: 'Славянский фолк' },      p: { en: 'Pagan motifs and maidens in white. A folkloric fire ritual drawn from old Slavic myth.', ru: 'Языческие мотивы и девы в белом. Фольклорный огненный ритуал по мотивам славянских мифов.' } },
            { bespoke: true, nm: { en: 'On request', ru: 'Под заказ' }, h: { en: 'Your theme', ru: 'Ваша тема' }, p: { en: 'For large events we build a bespoke theme around your concept, brand or festival.', ru: 'Для крупных событий соберём тему под вашу концепцию, бренд или фестиваль.' } }
          ]
        }
      }
    },

    ledfire: {
      name: { en: 'LED Fire Show', ru: 'LED+Огонь' }, nav: { en: 'LED Fire', ru: 'LED-огонь' },
      videos: ['aq-PXZIlsyo', 'NwEsu64rFzY', 'sckZxk4r22c', 'vWRxsfORdOg'],
      card: {
        kind: { en: 'Glow + Flame', ru: 'Свет + огонь' },
        desc: { en: 'The best of both: live fire performed in glowing LED costumes. The heat of fire with the colour of light.',
                ru: 'Сочетание живого огня и LED-костюмов в одном эффектном шоу. Динамичное выступление на грани огня, света и технологий.' },
        specs: {
          Format:   { en: 'Outdoor', ru: 'Улица' },
          Duration: { en: '10–15 min', ru: '10–15 мин' },
          Look:     { en: 'Light + fire', ru: 'Свет + огонь' }
        },
        tags: [ { en: 'Light + real fire', ru: 'Свет + живой огонь' } ]
      },
      detail: {
        type: { en: 'Hybrid · fire + light', ru: 'Гибрид · огонь + свет' },
        desc: { en: 'The best of both: live fire performed in glowing LED costumes. The heat of fire with the colour of light.',
                ru: 'Сочетание живого огня и LED-костюмов в одном эффектном шоу. Динамичное выступление на грани огня, света и технологий.' },
        duration: { en: '10–15 min · adaptable', ru: '10–15 мин · гибко' },
        format:   { en: 'Outdoor', ru: 'Улица' },
        cast:     { en: 'Scalable', ru: 'Масштабируется' },
        chips: [
          { en: 'Live fire', ru: 'Живой огонь' },
          { en: 'LED costumes', ru: 'LED-костюмы' },
          { en: 'Hybrid', ru: 'Гибрид' }
        ],
        variants: null
      }
    },

    led: {
      name: { en: 'LED Show', ru: 'LED-шоу' }, nav: { en: 'LED', ru: 'LED' },
      videos: ['7SCXdglhHgI', 'v3MyA-lNGok', 'U4-_8da2uuI', 'Ain3sUrpU2w', 'T6nHGrLrXoU', 'N7Qj5uU1bH4'],
      card: {
        kind: { en: 'Pure light', ru: 'Чистый свет' },
        desc: { en: 'Pure light, zero smoke or flame: glowing LED costumes and programmable props create a stunning visual show for indoor venues.',
                ru: 'Футуристичное световое шоу без дыма и огня: яркие LED-костюмы и программируемый реквизит создают эффектное визуальное представление для помещений любого формата.' },
        specs: {
          Format:   { en: 'Indoor & outdoor', ru: 'Зал и улица' },
          Duration: { en: '10–15 min', ru: '10–15 мин' },
          Looks:    { en: 'Many', ru: 'Много' }
        },
        tags: [
          { en: 'Many looks', ru: 'Много образов' },
          { en: 'LED cube', ru: 'LED-куб' },
          { en: 'Glowing wings', ru: 'Светящиеся крылья' }
        ]
      },
      detail: {
        type: { en: 'Electric · light', ru: 'Электрик · свет' },
        desc: { en: 'A dazzling, smoke-free light show of glowing LED costumes and eye-catching props, from light-up wings to glowing cubes. We can brand the props with your logo, or scale it up into a full club party. Perfect for indoor venues where open flame is not an option.',
                ru: 'Яркое бездымное световое шоу: светящиеся LED-костюмы и эффектный реквизит — от светящихся крыльев до кубов. Можем нанести на реквизит ваш логотип или развернуть шоу в полноценную клубную вечеринку. Идеально для помещений, где открытый огонь невозможен.' },
        seo: {
          title: { en: 'LED Light Show for Events & Galas - Steam Show',
                   ru: 'LED световое шоу на мероприятие и гала — Steam Show' },
          desc: { en: 'Smoke-free LED light show: glowing costumes and props like light-up wings and cubes, with your logo built in. Ideal for indoor galas and corporate events.',
                  ru: 'Бездымное LED световое шоу: светящиеся костюмы и реквизит (крылья, кубы) с вашим логотипом. Идеально для гала и корпоративов в помещении.' }
        },
        duration: { en: '10–15 min · adaptable', ru: '10–15 мин · гибко' },
        format:   { en: 'Indoor & outdoor', ru: 'Зал и улица' },
        cast:     { en: 'Scalable', ru: 'Масштабируется' },
        chips: [
          { en: 'Smoke-free', ru: 'Без дыма' },
          { en: 'LED catalogue', ru: 'Каталог LED' },
          { en: 'Full luminous', ru: 'Полный свет' }
        ],
        addon: {
          kicker: { en: 'Add-ons', ru: 'Дополнения' },
          title: { en: 'Turn it into a full club show', ru: 'Разверните в полноценное клубное шоу' },
          text: { en: 'Playing a club or a party? We can bundle the LED show with our other party formats into one high-energy set: stilt-walking animators, a paper show, confetti blasts and CO₂ cannons.',
                  ru: 'Клуб или вечеринка? Соберём LED-шоу с другими форматами в один заряженный сет: аниматоры на ходулях, бумажное шоу, конфетти-пушки и CO₂-пушки.' },
          tags: [
            { en: 'Paper show', ru: 'Бумажное шоу' },
            { en: 'Confetti', ru: 'Конфетти' },
            { en: 'CO₂ cannons', ru: 'CO₂-пушки' },
            { en: 'Stilt animators', ru: 'Аниматоры на ходулях' }
          ]
        },
        variants: null
      }
    },

    stilts: {
      name: { en: 'Stilt Walkers', ru: 'Ходулисты' }, nav: { en: 'Stilts', ru: 'Ходули' },
      videos: ['UlvKULj4Xe8', 'AW1l9PbVqdY', 'HLwZI7htNus', 'iAFeaUvX_Hw', 'UFmJgKILurU', 'epn4YnmNrQ8', 'wogKA0crrt0'],
      card: {
        kind: { en: 'Animation or full show', ru: 'Анимация или полное шоу' },
        desc: { en: 'Spectacular stilt characters for any type of event: from guest welcomes and interactive roaming entertainment to full-scale performances.',
                ru: 'Яркие персонажи-великаны на ходулях для любого формата события: встреча гостей, интерактивная анимация или полноценное шоу на сцене.' },
        specs: {
          Format:   { en: 'Indoor & outdoor', ru: 'Зал и улица' },
          Mode:     { en: 'Roaming or set', ru: 'Анимация или шоу' },
          Costumes: { en: 'Dozens', ru: 'Большой выбор' }
        },
        tags: [ { en: 'Dozens of costumes', ru: 'Тематические ивенты' } ]
      },
      detail: {
        type: { en: 'Roaming · giants', ru: 'Роуминг · великаны' },
        desc: { en: 'A wardrobe of towering characters, as roaming animation or a full stilt performance. Perfect for welcome zones, parades and club nights. Costumes group into themes and mix freely across them.',
                ru: 'Гардероб великанов-персонажей — роуминг-анимация или полноценное ходульное шоу. Идеально для welcome-зон, парадов и клубных вечеринок. Костюмы сгруппированы по темам и свободно комбинируются.' },
        duration: { en: 'Roaming or set act', ru: 'Роуминг или номер' },
        format:   { en: 'Indoor & outdoor', ru: 'Зал и улица' },
        cast:     { en: 'Scalable', ru: 'Масштабируется' },
        chips: [
          { en: 'Roaming', ru: 'Роуминг' },
          { en: 'Full stage show', ru: 'Полное шоу' },
          { en: '100+ costumes', ru: '100+ костюмов' }
        ],
        variants: { kind: 'stilts', navLabel: { en: 'Wardrobe', ru: 'Гардероб' } }
      }
    }
  },

  /* ---------------------------------------------------------
     ГАРДЕРОБ ХОДУЛИСТОВ — имена/блёрбы (ключи = папки в media.js)
     --------------------------------------------------------- */
  stilts: {
    wardrobe: {
      kicker: { en: 'Costumes & themes', ru: 'Костюмы и темы' },
      title: { en: 'The wardrobe', ru: 'Гардероб' },
      lead: { en: '100+ towering characters. Explore each theme, its film and costume gallery, or browse the full set with theme filters below.',
              ru: '100+ великанов-персонажей. Изучите каждую тему, её фильм и галерею костюмов — или просмотрите весь набор с фильтрами ниже.' }
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
      'stilts-fairy-garden':  { en: 'Fairy Garden', ru: 'Волшебный сад' },
      'stilts-circus':        { en: 'Circus', ru: 'Цирк' },
      'stilts-pirates':       { en: 'Pirates', ru: 'Пираты' },
      'stilts-classics':      { en: 'Classics', ru: 'Классика' },
      'stilts-trees':         { en: 'Trees', ru: 'Деревья' },
      'stilts-christmas':     { en: 'Christmas', ru: 'Новый год' },
      'stilts-shamans':       { en: 'Dragons & Shamans', ru: 'Драконы и шаманы' },
      'stilts-star-giraffe':  { en: 'Giraffe', ru: 'Жираф' },
      'stilts-led':           { en: 'LED costumes', ru: 'LED-костюмы' }
    },
    otherLabel: { en: 'More characters', ru: 'Другие персонажи' }
  },

  /* ---------------------------------------------------------
     КОНТАКТЫ — используются и на главной, и на страницах шоу
     ic: instagram | email | whatsapp | youtube (иконки в data.js)
     color / color2 — акценты пилюли-иконки
     --------------------------------------------------------- */
  contact: [
    { ic: 'instagram', kicker: { en: 'Instagram', ru: 'Instagram' },            value: '@steam_show',     go: { en: 'See the feed →', ru: 'Открыть ленту →' }, href: 'https://instagram.com/steam_show',       color: '#FF2E84', color2: '#FF6A1F', ext: true },
    { ic: 'email',     kicker: { en: 'Email', ru: 'Email' },                    value: 'hello@steamshow', go: { en: 'Send a brief →', ru: 'Отправить бриф →' }, href: 'mailto:hello@steamshow.com',            color: '#FFD23E', color2: '#FF6A1F' },
    { ic: 'whatsapp',  kicker: { en: 'WhatsApp · Telegram', ru: 'WhatsApp · Telegram' }, value: { en: 'Message us', ru: 'Напишите нам' }, go: { en: 'Chat now →', ru: 'Написать →' }, href: '#',                     color: '#FF6A1F', color2: '#FF2E84' },
    { ic: 'youtube',   kicker: { en: 'YouTube', ru: 'YouTube' },                value: '@SteamShowby',    go: { en: 'Watch shows →', ru: 'Смотреть шоу →' },   href: 'https://www.youtube.com/@SteamShowby',  color: '#25F4EE', color2: '#FF2E84', ext: true }
  ]
};
