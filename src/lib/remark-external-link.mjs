function transformLinks(node) {
  if (!Array.isArray(node.children)) return;

  for (const child of node.children) {
    if (
      child.type === "link" &&
      /^https?:\/\//i.test(child.url)
    ) {
      child.data ??= {};
      child.data.hProperties = {
        ...child.data.hProperties,
        target: "_blank",
        rel: "noopener noreferrer",
      };
    }

    transformLinks(child);
  }
}

export default function remarkExternalLink() {
  return transformLinks;
}