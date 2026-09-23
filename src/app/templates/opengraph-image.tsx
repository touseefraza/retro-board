/**
 * The site-wide card. Re-exported rather than inherited: a page that declares
 * its own `openGraph` replaces the root's wholesale, images included, so a
 * route without an opengraph-image of its own ends up with no card at all.
 */
export { default, alt, size, contentType } from "../opengraph-image";
