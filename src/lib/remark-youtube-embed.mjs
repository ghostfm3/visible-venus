const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function parseStartTime(value) {
  if (!value) return null;

  if (/^\d+$/.test(value)) return Number(value);

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match) return null;

  const seconds =
    Number(match[1] ?? 0) * 3600 +
    Number(match[2] ?? 0) * 60 +
    Number(match[3] ?? 0);

  return seconds || null;
}

function getYoutubeEmbedUrl(value) {
  let url;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  let videoId;

  if (host === "youtu.be" || host === "www.youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0];
  } else if (YOUTUBE_HOSTS.has(host)) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v") ?? undefined;
    } else {
      const [kind, id] = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(kind)) videoId = id;
    }
  }

  if (!videoId || !VIDEO_ID_PATTERN.test(videoId)) return null;

  const embedUrl = new URL(
    `https://www.youtube-nocookie.com/embed/${videoId}`,
  );
  const start = parseStartTime(
    url.searchParams.get("start") ?? url.searchParams.get("t"),
  );

  if (start !== null) embedUrl.searchParams.set("start", String(start));

  return embedUrl.toString();
}

function getStandaloneUrl(paragraph) {
  if (paragraph.children.length !== 1) return null;

  const [child] = paragraph.children;

  if (child.type === "link") return child.url;
  if (child.type === "text") return child.value.trim();

  return null;
}

function createEmbedHtml(src) {
  return `<div class="youtube-embed"><iframe src="${src}" title="YouTube video player" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
}

function transformChildren(node) {
  if (!Array.isArray(node.children)) return;

  node.children = node.children.map((child) => {
    if (child.type === "paragraph") {
      const url = getStandaloneUrl(child);
      const embedUrl = url ? getYoutubeEmbedUrl(url) : null;

      if (embedUrl) {
        return {
          type: "html",
          value: createEmbedHtml(embedUrl),
        };
      }
    }

    transformChildren(child);
    return child;
  });
}

export default function remarkYoutubeEmbed() {
  return transformChildren;
}
