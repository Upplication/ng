/**
 * Converts te given string from kebab-case to camelCase.
 * @param  {string} str
 * @return {string} 
 */
export function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (s) => s[1].toUpperCase())
}
