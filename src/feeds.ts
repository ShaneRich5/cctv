// The catalog of public feeds. Every entry must come from a publicly
// accessible, embeddable source and credit its publisher.
//
// `id` is written into share links and saved views, so treat it as permanent:
// never rename or reuse one. Add new feeds with a fresh id instead.

export type FeedSource =
  | { kind: "youtube"; videoId: string }
  | { kind: "iframe"; url: string }
  | {
      kind: "image";
      url: string;
      refreshSeconds: number;
      // CSS transform applied on wall tiles to crop wide imagery to an area of
      // interest. The focus view always shows the whole image.
      tileTransform?: string;
    };

export type Category = "street" | "coast" | "weather";

export type FeedStatus = "connecting" | "live" | "offline";

export interface Provider {
  name: string;
  url: string;
  // One sentence about the publisher, shown on the About page.
  note: string;
}

export interface Feed {
  id: string;
  name: string;
  place: string;
  parish: string;
  category: Category;
  source: FeedSource;
  provider: Provider;
  // Public page for the feed, so viewers can always get to the original.
  sourceUrl: string;
}

const SEE_JAMAICA: Provider = {
  name: "See Jamaica",
  url: "https://www.youtube.com/@SeeJamaica/streams",
  note: "An independent network streaming public street views around the island 24/7 on YouTube. See seejm.com.",
};

const SEE_JAMAICA_LIVE: Provider = {
  name: "See Jamaica Live",
  url: "https://www.youtube.com/@SeeJamaicaLive/streams",
  note: "See Jamaica's second YouTube channel, carrying more of its 24/7 street and harbour cameras.",
};

const NOAA_STAR: Provider = {
  name: "NOAA / NESDIS STAR",
  url: "https://www.star.nesdis.noaa.gov/GOES/sector.php?sat=G19&sector=car",
  note: "GOES-19 satellite imagery of the Caribbean from the US National Oceanic and Atmospheric Administration. It is a US government work in the public domain.",
};

const youtube = (videoId: string) => ({
  source: { kind: "youtube", videoId } as const,
  sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
});

// Jamaica sits near the left edge of the Caribbean sector image (about 23%
// across, 48% down). Zoom in and shift it to the centre of the tile.
const JAMAICA_CROP = "scale(2.4) translate(27%, 4%)";

export const FEEDS: Feed[] = [
  {
    id: "hwt",
    name: "Half Way Tree Transport Centre",
    place: "Half Way Tree",
    parish: "St Andrew",
    category: "street",
    provider: SEE_JAMAICA,
    ...youtube("yHcnmIezKo4"),
  },
  {
    id: "hwc",
    name: "Half Way Tree Clock",
    place: "Half Way Tree",
    parish: "St Andrew",
    category: "street",
    provider: SEE_JAMAICA,
    ...youtube("C71bNZ1coG4"),
  },
  {
    id: "dvh",
    name: "Devon House",
    place: "Hope Road",
    parish: "St Andrew",
    category: "street",
    provider: SEE_JAMAICA,
    ...youtube("BPNCPQ-UDZA"),
  },
  {
    id: "bbc",
    name: "Barbican Square",
    place: "Barbican",
    parish: "St Andrew",
    category: "street",
    provider: SEE_JAMAICA_LIVE,
    ...youtube("uT00xg3uvUE"),
  },
  {
    id: "dtk",
    name: "West Parade",
    place: "Downtown Kingston",
    parish: "Kingston",
    category: "street",
    provider: SEE_JAMAICA,
    ...youtube("dbCVL1ul1QQ"),
  },
  {
    id: "kgh",
    name: "Kingston Harbour",
    place: "Kingston Waterfront",
    parish: "Kingston",
    category: "coast",
    provider: SEE_JAMAICA_LIVE,
    ...youtube("zZigIeqAoFY"),
  },
  {
    id: "spt",
    name: "Spanish Town",
    place: "Spanish Town",
    parish: "St Catherine",
    category: "street",
    provider: SEE_JAMAICA,
    ...youtube("KBnlexbryqE"),
  },
  {
    id: "ocr",
    name: "Ocho Rios Town Centre",
    place: "Ocho Rios",
    parish: "St Ann",
    category: "street",
    provider: SEE_JAMAICA,
    ...youtube("DUX3qXG-SYg"),
  },
  {
    id: "mbj",
    name: "Sam Sharpe Square",
    place: "Montego Bay",
    parish: "St James",
    category: "street",
    provider: SEE_JAMAICA,
    ...youtube("UwhOP-H-P0c"),
  },
  {
    id: "scz",
    name: "Santa Cruz",
    place: "Santa Cruz",
    parish: "St Elizabeth",
    category: "street",
    provider: SEE_JAMAICA,
    ...youtube("iYwvodK9Sj0"),
  },
  {
    id: "llw",
    name: "Little London",
    place: "Little London",
    parish: "Westmoreland",
    category: "street",
    provider: SEE_JAMAICA_LIVE,
    ...youtube("5UGejGZX3UI"),
  },
  {
    id: "neg",
    name: "Seven Mile Beach",
    place: "Negril",
    parish: "Westmoreland",
    category: "coast",
    source: { kind: "iframe", url: "https://www.myearthcam.com/cocolive?embed" },
    provider: {
      name: "CocoLaPalm Seaside Resort / EarthCam",
      url: "https://cocolapalm.com/coco-beach-livestream/",
      note: "A beach camera on Seven Mile Beach in Negril, which the resort publishes through EarthCam.",
    },
    sourceUrl: "https://cocolapalm.com/coco-beach-livestream/",
  },
  {
    id: "sat",
    name: "Satellite · GeoColor",
    place: "Caribbean sector, GOES-19",
    parish: "Western Caribbean",
    category: "weather",
    source: {
      kind: "image",
      url: "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/car/GEOCOLOR/1000x1000.jpg",
      refreshSeconds: 300,
      tileTransform: JAMAICA_CROP,
    },
    provider: NOAA_STAR,
    sourceUrl:
      "https://www.star.nesdis.noaa.gov/GOES/sector_band.php?sat=G19&sector=car&band=GEOCOLOR",
  },
  {
    id: "sir",
    name: "Satellite · Infrared",
    place: "Caribbean sector, GOES-19 band 13",
    parish: "Western Caribbean",
    category: "weather",
    source: {
      kind: "image",
      url: "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/car/13/1000x1000.jpg",
      refreshSeconds: 300,
      tileTransform: JAMAICA_CROP,
    },
    provider: NOAA_STAR,
    sourceUrl: "https://www.star.nesdis.noaa.gov/GOES/sector_band.php?sat=G19&sector=car&band=13",
  },
];

export const FEED_BY_ID = new Map(FEEDS.map((feed) => [feed.id, feed]));

export const CATEGORY_LABELS: Record<Category, string> = {
  street: "Street",
  coast: "Coast",
  weather: "Weather",
};

export const PROVIDERS: Provider[] = [
  ...new Map(FEEDS.map((feed) => [feed.provider.name, feed.provider])).values(),
];
