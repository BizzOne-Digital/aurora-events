/**
 * Starter content. Used (a) by `npm run seed` / the admin "Load starter content" button to populate an empty
 * database and (b) as a read-only fallback so the public site still renders when MONGODB_URI is not configured.
 * All imagery is AI-generated illustrative event imagery (see public/images/SOURCES.md), not past events.
 */
import type { GalleryDTO, PostDTO, SettingsDTO } from "@/lib/types";

const img = (file: string, alt: string) => ({ url: `/images/${file}.jpg`, alt, publicId: "" });

export type SeedService = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  coverImage: ReturnType<typeof img>;
  gallery: ReturnType<typeof img>[];
  featured: boolean;
  published: boolean;
  order: number;
};

export const DEFAULT_SERVICES: SeedService[] = [
  {
    title: "Wedding Planning",
    slug: "wedding-planning",
    summary: "Ceremonies and receptions shaped around your story, your traditions and the way you want the day to feel.",
    description:
      "A wedding is made of hundreds of small decisions. We help you shape them into one cohesive celebration, from the first conversation about your vision and venue ideas to floral styling, décor, schedules and the details your guests will remember.\n\nWhether you imagine an outdoor ceremony, an elegant reception hall or a smaller family celebration, we coordinate the moving parts so you can spend your time with the people who matter. Contact us for pricing and to talk through what your day could look like.",
    coverImage: img("event-wedding-ballroom", "Wedding reception with blush flowers and candlelit dining tables (illustrative image)"),
    gallery: [
      img("event-garden-wedding", "Garden wedding ceremony with floral arch and empty chairs (illustrative image)"),
      img("event-wedding-table-details", "Wedding table setting with plum napkin and gold cutlery (illustrative image)"),
    ],
    featured: true,
    published: true,
    order: 1,
  },
  {
    title: "Corporate Events",
    slug: "corporate-events",
    summary: "Conferences, launches, workshops and team gatherings arranged with a professional, well-paced finish.",
    description:
      "Business events work best when the logistics disappear into the background. We help you plan the format, the space, the flow of the day and the little touches that make guests and colleagues feel looked after.\n\nFrom seminars and workshops to launches, appreciation dinners and team celebrations, we arrange the details around your goals and your audience. Request a consultation and tell us what you want the event to achieve.",
    coverImage: img("event-conference-venue", "Business conference venue with empty seating and blank stage screen (illustrative image)"),
    gallery: [
      img("event-corporate-gala", "Corporate gala venue with banquet tables and stage (illustrative image)"),
      img("event-networking-reception", "Rooftop reception with cocktail tables and warm string lights (illustrative image)"),
    ],
    featured: true,
    published: true,
    order: 2,
  },
  {
    title: "Cultural Celebrations",
    slug: "cultural-celebrations",
    summary: "Festivals, community gatherings and traditional ceremonies planned with respect for the customs that matter to you.",
    description:
      "Cultural and community celebrations carry meaning that goes beyond décor. We take time to understand the traditions, rituals and expectations behind your event so the planning reflects them properly.\n\nShare the customs and colours that matter to your family or community, and we will work with you on the setting, styling and arrangements around them. Contact us to start the conversation.",
    coverImage: img("event-cultural-celebration", "Cultural celebration décor with marigolds and brass lanterns (illustrative image)"),
    gallery: [
      img("event-cultural-tablescape", "Cultural tablescape with brass lantern and embroidered runner (illustrative image)"),
      img("event-festive-courtyard", "Courtyard celebration with fabric canopies and glowing lights (illustrative image)"),
    ],
    featured: true,
    published: true,
    order: 3,
  },
  {
    title: "Private Parties",
    slug: "private-parties",
    summary: "Birthdays, milestones, anniversaries and reasons to celebrate, styled with personality.",
    description:
      "A private party should feel like you. We help you choose a theme, space and atmosphere, then arrange the details that bring it together, from décor and seating to the moments you want to build the evening around.\n\nTell us what you are celebrating and who is coming, and we will help turn your ideas into a plan.",
    coverImage: img("event-private-birthday", "Private birthday celebration with balloons and ivory cake (illustrative image)"),
    gallery: [
      img("event-candlelit-lounge", "Event lounge with plum sofa and warm candlelight (illustrative image)"),
      img("event-floral-installation", "Coral and ivory floral arrangement on a stone pedestal (illustrative image)"),
    ],
    featured: false,
    published: true,
    order: 4,
  },
  {
    title: "Intimate Gatherings",
    slug: "intimate-gatherings",
    summary: "Smaller guest lists with big attention to detail: dinners, showers, engagement celebrations and family occasions.",
    description:
      "Small celebrations deserve the same care as large ones. For dinners, showers, engagement parties and family occasions, we focus on the table, the setting and the atmosphere so the day feels warm and personal.\n\nIf you are planning something close and meaningful, we would be glad to help you shape it.",
    coverImage: img("event-intimate-gathering", "Intimate conservatory gathering with seasonal flowers (illustrative image)"),
    gallery: [
      img("event-anniversary-dinner", "Anniversary terrace dinner with roses and candles (illustrative image)"),
      img("event-floral-installation", "Coral and ivory floral arrangement on a stone pedestal (illustrative image)"),
    ],
    featured: false,
    published: true,
    order: 5,
  },
  {
    title: "Large Celebrations",
    slug: "large-celebrations",
    summary: "Galas, festivals and big-room occasions that need careful structure, flow and coordination.",
    description:
      "When the guest list grows, so does the importance of planning. Large celebrations call for clear timelines, thoughtful layouts and well-coordinated arrangements so guests feel welcome from arrival to farewell.\n\nTell us about the occasion, the guest count you have in mind and the kind of space you are considering, and we will help you work out the next steps.",
    coverImage: img("event-large-celebration", "Large marquee celebration with chandeliers and banquet seating (illustrative image)"),
    gallery: [
      img("event-corporate-gala", "Corporate gala venue with banquet tables and stage (illustrative image)"),
      img("event-wedding-ballroom", "Wedding reception with blush flowers and candlelit dining tables (illustrative image)"),
    ],
    featured: false,
    published: true,
    order: 6,
  },
];

type SeedGallery = { image: ReturnType<typeof img>; caption: string; category: GalleryDTO["category"]; order: number };
const g = (file: string, alt: string, caption: string, category: string, order: number): SeedGallery => ({
  image: img(file, alt),
  caption,
  category,
  order,
});

export const DEFAULT_GALLERY: SeedGallery[] = [
  g("event-corporate-gala", "Corporate gala venue with banquet tables and stage (illustrative image)", "Banquet and stage setup", "Corporate", 1),
  g("event-garden-wedding", "Garden wedding ceremony with floral arch and empty chairs (illustrative image)", "Garden ceremony seating", "Wedding", 2),
  g("event-festive-courtyard", "Courtyard celebration with fabric canopies and glowing lights (illustrative image)", "Courtyard under canopies", "Cultural", 3),
  g("event-floral-installation", "Coral and ivory floral arrangement on a stone pedestal (illustrative image)", "Coral and ivory florals", "Intimate", 4),
  g("event-networking-reception", "Rooftop reception with cocktail tables and warm string lights (illustrative image)", "Rooftop reception", "Corporate", 5),
  g("event-anniversary-dinner", "Anniversary terrace dinner with roses and candles (illustrative image)", "Terrace anniversary dinner", "Intimate", 6),
  g("event-cultural-tablescape", "Cultural tablescape with brass lantern and embroidered runner (illustrative image)", "Brass lantern tablescape", "Cultural", 7),
  g("event-candlelit-lounge", "Event lounge with plum sofa and warm candlelight (illustrative image)", "Candlelit lounge", "Party", 8),
  g("event-wedding-table-details", "Wedding table setting with plum napkin and gold cutlery (illustrative image)", "Table setting details", "Wedding", 9),
  g("event-wedding-ballroom", "Wedding reception with blush flowers and candlelit dining tables (illustrative image)", "Reception ballroom", "Wedding", 10),
  g("event-conference-venue", "Business conference venue with empty seating and blank stage screen (illustrative image)", "Conference venue", "Corporate", 11),
  g("event-cultural-celebration", "Cultural celebration décor with marigolds and brass lanterns (illustrative image)", "Marigolds and lanterns", "Cultural", 12),
  g("event-private-birthday", "Private birthday celebration with balloons and ivory cake (illustrative image)", "Birthday celebration", "Party", 13),
  g("event-intimate-gathering", "Intimate conservatory gathering with seasonal flowers (illustrative image)", "Conservatory gathering", "Intimate", 14),
  g("event-large-celebration", "Large marquee celebration with chandeliers and banquet seating (illustrative image)", "Marquee celebration", "Large event", 15),
];

export const DEFAULT_FAQS: { question: string; answer: string; page: "services" | "booking" | "contact"; order: number }[] = [
  {
    page: "services",
    order: 1,
    question: "What types of events do you plan?",
    answer:
      "We plan and arrange weddings, corporate events, cultural celebrations, private parties, intimate gatherings and large celebrations. If your event does not fit neatly into one of these, tell us about it and we will talk it through.",
  },
  {
    page: "services",
    order: 2,
    question: "Can you plan around specific cultural or religious traditions?",
    answer:
      "Every celebration has its own customs. Share the traditions that matter to you during your consultation and we will discuss how to plan around them.",
  },
  {
    page: "services",
    order: 3,
    question: "How do I find out about pricing?",
    answer:
      "Pricing depends on the size, scope and details of each event, so we do not publish fixed prices. Contact us for pricing and request a consultation to talk through your plans.",
  },
  {
    page: "booking",
    order: 1,
    question: "Does sending an inquiry confirm my date?",
    answer:
      "No. Submitting an inquiry does not confirm availability or reserve an event date. We will review your details and get in touch to discuss next steps.",
  },
  {
    page: "booking",
    order: 2,
    question: "What happens after I submit the form?",
    answer:
      "We read through your event details and reach out using your preferred contact method to arrange a consultation.",
  },
  {
    page: "booking",
    order: 3,
    question: "What if I am not sure about my date or guest count?",
    answer: "Give us your best estimate. Dates and numbers can be refined together during the consultation.",
  },
  {
    page: "booking",
    order: 4,
    question: "How early should I get in touch?",
    answer:
      "Earlier is generally easier, especially for popular dates, but you are welcome to reach out at any stage, even with only a rough idea.",
  },
  {
    page: "contact",
    order: 1,
    question: "Can I call instead of using the form?",
    answer: "Yes. Use the call button on this page to speak with us directly about your event.",
  },
  {
    page: "contact",
    order: 2,
    question: "How quickly will I hear back?",
    answer: "We aim to respond as soon as we can. For anything time-sensitive, calling is the most direct way to reach us.",
  },
  {
    page: "contact",
    order: 3,
    question: "Is a message the same as a booking?",
    answer:
      "No. A message starts a conversation. If you would like us to consider a specific date, please use the event inquiry form on the Booking page.",
  },
];

export const DEFAULT_SETTINGS: SettingsDTO = {
  businessName: "7270020 Canada Ltd.",
  email: "hightec.can@gmail.com",
  phone: "+14377846430",
  phoneDisplay: "(437) 784-6430",
  heroEyebrow: "Thoughtfully planned. Beautifully celebrated.",
  heroHeadline: "Beautiful gatherings. Unforgettable moments.",
  heroSubcopy: "From intimate celebrations to remarkable events, we bring your vision to life.",
  primaryCtaText: "Plan Your Event",
  secondaryCtaText: "Explore Services",
  consultationHeadline: "Let us talk about your celebration.",
  footerBlurb: "Thoughtfully planned weddings, corporate events, cultural celebrations and private functions.",
  social: { facebook: "", instagram: "", linkedin: "", tiktok: "", youtube: "" },
  seoTitle: "7270020 Canada Ltd. | Event Planning and Arrangement",
  seoDescription:
    "Event planning and arrangement for weddings, corporate events, cultural celebrations, private functions and gatherings of every size. Request a consultation.",
};

export const DEFAULT_POSTS: (Omit<PostDTO, "id" | "publishedAt"> & { daysAgo: number })[] = [
  {
    title: "Five Questions to Answer Before You Plan Any Event",
    slug: "five-questions-before-you-plan",
    excerpt: "A clear starting point makes every later decision easier. Begin with these five questions.",
    coverImage: { url: "/images/event-intimate-gathering.jpg", alt: "Intimate conservatory gathering with seasonal flowers (illustrative image)" },
    authorName: "7270020 Canada Ltd.",
    seoTitle: "Five Questions to Answer Before You Plan Any Event",
    seoDescription: "Five simple questions that give your event planning a clear starting point.",
    daysAgo: 21,
    body: `Every great event starts with a handful of honest answers. Before you look at venues or colour palettes, spend a little time on these questions.

## 1. Why are we gathering?

A wedding, a product launch and a family milestone all need different things. Write down the single feeling or outcome you want guests to leave with. It becomes the filter for every later decision.

## 2. Who is coming?

Think about ages, travel, accessibility and any traditions or dietary needs. A realistic picture of your guests shapes the venue, the schedule and the menu.

## 3. What is the rough guest count?

An estimate is enough at this stage. Guest count influences space, seating, catering and the overall style of the event, so even a range helps.

## 4. When would we like to celebrate?

Have a preferred date and a couple of alternatives. Flexibility often opens up more options.

## 5. What matters most?

Pick your top two or three priorities, such as food, atmosphere, photography or music. Put your effort there first, then build the rest around them.

If you would like help turning these answers into a plan, [request a consultation](/booking) and tell us about your event.`,
  },
  {
    title: "Choosing a Venue: What to Look For Beyond the Photos",
    slug: "choosing-a-venue",
    excerpt: "Photos only tell part of the story. Here is what to ask and check before you commit to a space.",
    coverImage: { url: "/images/event-large-celebration.jpg", alt: "Large marquee celebration with chandeliers and banquet seating (illustrative image)" },
    authorName: "7270020 Canada Ltd.",
    seoTitle: "Choosing a Venue: What to Look For Beyond the Photos",
    seoDescription: "Practical questions to ask when choosing an event venue.",
    daysAgo: 14,
    body: `A beautiful venue photo is a good start, but a few practical checks will tell you whether the space really works for your event.

## Capacity and layout

Ask how many guests the room holds for seated dining, for a ceremony and for standing receptions. The numbers are often different, and your layout needs space for aisles, a dance floor or a stage.

## Access and comfort

Consider parking, public transport, step-free access, restrooms and coat storage. Guests remember comfort as much as décor.

## What is included

Clarify what comes with the space, such as tables, chairs, lighting, sound and staff, and what you would need to arrange separately.

## Rules and timing

Check access times for set-up and pack-down, music limits, décor restrictions and any supplier requirements.

## Visit at the right time

If possible, see the space at the same time of day as your event. Light, noise and atmosphere change a lot between morning and evening.

Choosing a venue is easier with a second opinion. [Contact us](/contact) if you would like to talk through your options.`,
  },
  {
    title: "Planning a Celebration That Honours Your Traditions",
    slug: "celebrations-that-honour-traditions",
    excerpt: "Cultural customs give an event its meaning. Here is how to bring them into the plan from the start.",
    coverImage: { url: "/images/event-cultural-celebration.jpg", alt: "Cultural celebration décor with marigolds and brass lanterns (illustrative image)" },
    authorName: "7270020 Canada Ltd.",
    seoTitle: "Planning a Celebration That Honours Your Traditions",
    seoDescription: "How to build cultural traditions into your event plan from the start.",
    daysAgo: 7,
    body: `Traditions are often what make a celebration feel like yours. Building them into the plan early avoids last-minute surprises.

## Start with the essentials

List the rituals, ceremonies and moments that must happen, and note who needs to be involved in each one. Include elders and family members who may have strong views.

## Think about the details

Colours, music, attire, food and seating arrangements can all carry meaning. Ask which details are essential and where there is room to be flexible.

## Plan the timeline around the ceremony

Some traditions need a particular time of day, a certain amount of space or specific items. Fit the schedule around them rather than the other way around.

## Communicate with your guests

Not every guest will know the customs. A short note, programme or announcement helps everyone take part comfortably.

## Work with people who listen

Share your traditions openly with anyone helping you plan. If you would like to talk about your celebration, [get in touch](/contact).`,
  },
];

export const PROCESS_STEPS = [
  {
    title: "Share your idea",
    text: "Tell us about the occasion, the people, the date you are hoping for and the feeling you want. Rough ideas are welcome.",
  },
  {
    title: "Consult and shape the plan",
    text: "We talk through your priorities and traditions, then outline a direction for the setting, styling and flow of the day.",
  },
  {
    title: "Arrange the details",
    text: "Layouts, décor, schedules and the many small pieces are organised and checked with you along the way.",
  },
  {
    title: "Celebrate",
    text: "On the day, the arrangements are in place so you can focus on your guests and the moment.",
  },
];
