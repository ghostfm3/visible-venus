const MP4_PATTERN = /^MP4\s*:\s*(.*)$/i;

function createEmbedHtml(src) {

    const escapedSrc = src
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

    return `<video src="${escapedSrc}" controls width="640"></video>`;
}

function transformChildren(node) {
    if (!Array.isArray(node.children)) {
        return;
    }

    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === "image" && MP4_PATTERN.test(child.alt ?? "")) {
            node.children[i] = {
                type: "html",
                value: createEmbedHtml(child.url),
            };
        } else {
            transformChildren(child);
        }
    }
}

export default function remarkMp4Link() {
    return transformChildren;
}

