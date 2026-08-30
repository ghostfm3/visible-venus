const PANORAMA_ALT_PATTERN = /^360(?:°)?\s*:\s*(.*)$/i;
const PANORAMA_CLASS = "panorama-source";

function isPanoramaPath(src) {
  if (URL.canParse(src)) {
    return false;
  }

  const pathname = src.split(/[?#]/, 1)[0].replaceAll("\\", "/");

  return (
    pathname.startsWith("/panoramas/") ||
    /(?:^|\/)panoramas\//.test(pathname)
  );
}

function addClassName(image, className) {
  image.data ??= {};
  image.data.hProperties ??= {};

  const current = image.data.hProperties.className;
  const classNames = Array.isArray(current)
    ? current
    : typeof current === "string"
      ? current.split(/\s+/).filter(Boolean)
      : [];

  if (!classNames.includes(className)) {
    classNames.push(className);
  }

  image.data.hProperties.className = classNames;
}

function transformChildren(node) {
  if (!Array.isArray(node.children)) {
    return;
  }

  for (const child of node.children) {
    if (
      child.type === "image" &&
      PANORAMA_ALT_PATTERN.test(child.alt ?? "") &&
      isPanoramaPath(child.url)
    ) {
      // Keep the image node so Astro can resolve and optimize colocated images.
      // The runtime replaces the final <img> with the panorama viewer.
      addClassName(child, PANORAMA_CLASS);
    }

    transformChildren(child);
  }
}

export default function remarkPanoramaEmbed() {
  return transformChildren;
}
