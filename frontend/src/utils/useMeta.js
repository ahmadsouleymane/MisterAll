import { useEffect } from "react";

export default function useMeta({
  title,
  description,
  canonical,
  ogImage,
  url,
  noIndex,
}) {
  useEffect(() => {
    // Title
    if (title) {
      document.title = title;
    }

    // Meta description
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
      }
      tag.content = description;
    }

    // Canonical
    if (canonical) {
      let link = document.querySelector("link[rel='canonical']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // Open Graph title
    if (title) {
      let tag = document.querySelector("meta[property='og:title']");
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", "og:title");
        document.head.appendChild(tag);
      }
      tag.content = title;
    }

    // Open Graph description
    if (description) {
      let tag = document.querySelector("meta[property='og:description']");
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", "og:description");
        document.head.appendChild(tag);
      }
      tag.content = description;
    }

    // Open Graph image
    if (ogImage) {
      let tag = document.querySelector("meta[property='og:image']");
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", "og:image");
        document.head.appendChild(tag);
      }
      tag.content = ogImage;
    }

    // Open Graph URL
    if (url) {
      let tag = document.querySelector("meta[property='og:url']");
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", "og:url");
        document.head.appendChild(tag);
      }
      tag.content = url;
    }

    // Twitter Card
    let twitterTag = document.querySelector("meta[name='twitter:card']");
    if (!twitterTag) {
      twitterTag = document.createElement("meta");
      twitterTag.name = "twitter:card";
      twitterTag.content = "summary_large_image";
      document.head.appendChild(twitterTag);
    }

    if (noIndex) {
        let tag = document.querySelector('meta[name="robots"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "robots";
        document.head.appendChild(tag);
      }
      tag.content = "noindex, nofollow";
    }
  }, [title, description, canonical, ogImage, url, noIndex]);


}
