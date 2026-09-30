export const MIN_SUBSCRIBERS = 1000;
export const MIN_RECENT_UPLOADS = 3;
export const RECENT_DAYS = 90;
export const BUZZ_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export function isWithinDays(publishedAt, now, days) {
  const time = new Date(publishedAt).getTime();
  if (!Number.isFinite(time)) return false;
  const age = now - time;
  return age >= 0 && age <= days * DAY_MS;
}

export function videoBuzz(video) {
  const views = Number(video.viewCount);
  const likes = video.likeCount == null ? 0 : Number(video.likeCount);
  return (Number.isFinite(views) ? views : 0) + (Number.isFinite(likes) ? likes : 0) * 10;
}

export function qualifyChannel({ subscriberCount, videos, now = Date.now() }) {
  const subscribers = subscriberCount == null ? null : Number(subscriberCount);
  const subsOk = subscribers != null && subscribers >= MIN_SUBSCRIBERS;
  const recentUploadCount = videos.filter((video) => isWithinDays(video.publishedAt, now, RECENT_DAYS)).length;
  const uploadsOk = recentUploadCount >= MIN_RECENT_UPLOADS;
  return {
    subsOk,
    uploadsOk,
    qualified: subsOk && uploadsOk,
    recentUploadCount,
  };
}

export function buzzScore(videos, now = Date.now()) {
  return videos
    .filter((video) => isWithinDays(video.publishedAt, now, BUZZ_DAYS))
    .reduce((sum, video) => sum + videoBuzz(video), 0);
}
