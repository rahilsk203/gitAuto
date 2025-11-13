
/**
 * Converts a string to a URL-friendly slug.
 * @param {string} text The input string.
 * @returns {string} The slugified string.
 */
function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

module.exports = {
  slugify,
};
