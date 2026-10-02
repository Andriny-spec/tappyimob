// Apify Instagram Scraper Integration

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_BASE_URL = "https://api.apify.com/v2";

export interface ApifyInstagramPost {
  id: string;
  type: "Image" | "Video" | "Sidecar";
  shortCode: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  url: string;
  commentsCount: number;
  firstComment: string;
  latestComments: unknown[];
  dimensionsHeight: number;
  dimensionsWidth: number;
  displayUrl: string;
  images: string[];
  videoUrl?: string;
  likesCount: number;
  videoViewCount?: number;
  timestamp: string;
  childPosts?: unknown[];
  locationName?: string;
  locationId?: string;
  ownerFullName: string;
  ownerUsername: string;
  ownerId: string;
  productType: string;
  isSponsored: boolean;
  inputUrl: string;
}

export interface ApifyRunResult {
  id: string;
  actId: string;
  status: string;
  startedAt: string;
  finishedAt: string;
  defaultDatasetId: string;
}

// Buscar o último run do actor
export async function getLastRun(actorId: string = "apify~instagram-scraper"): Promise<ApifyRunResult | null> {
  try {
    const response = await fetch(
      `${APIFY_BASE_URL}/acts/${actorId}/runs?token=${APIFY_API_TOKEN}&limit=1&desc=true`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      console.error("Apify getLastRun error:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.data?.items?.[0] || null;
  } catch (error) {
    console.error("Apify getLastRun error:", error);
    return null;
  }
}

// Buscar posts do dataset
export async function getDatasetItems(datasetId: string): Promise<ApifyInstagramPost[]> {
  try {
    const response = await fetch(
      `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}&format=json`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      console.error("Apify getDatasetItems error:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Apify getDatasetItems error:", error);
    return [];
  }
}

// Buscar posts do Instagram via Apify (último scrape)
export async function getInstagramPosts(): Promise<ApifyInstagramPost[]> {
  try {
    const lastRun = await getLastRun();
    if (!lastRun || !lastRun.defaultDatasetId) {
      console.error("No Apify run found");
      return [];
    }

    return await getDatasetItems(lastRun.defaultDatasetId);
  } catch (error) {
    console.error("Apify getInstagramPosts error:", error);
    return [];
  }
}

// Iniciar um novo scrape
export async function startInstagramScrape(
  username: string = "tappyimob",
  resultsLimit: number = 12
): Promise<ApifyRunResult | null> {
  try {
    const response = await fetch(
      `${APIFY_BASE_URL}/acts/apify%7Einstagram-scraper/runs?token=${APIFY_API_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          directUrls: [`https://www.instagram.com/${username}/`],
          resultsType: "posts",
          resultsLimit,
          searchType: "hashtag",
          searchLimit: 1,
        }),
      }
    );

    if (!response.ok) {
      console.error("Apify startScrape error:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("Apify startScrape error:", error);
    return null;
  }
}

// Verificar status do run
export async function getRunStatus(runId: string): Promise<ApifyRunResult | null> {
  try {
    const response = await fetch(
      `${APIFY_BASE_URL}/actor-runs/${runId}?token=${APIFY_API_TOKEN}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      console.error("Apify getRunStatus error:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("Apify getRunStatus error:", error);
    return null;
  }
}
