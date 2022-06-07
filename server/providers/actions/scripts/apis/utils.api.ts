function randomElement<T>(items: T[]): T {
  return items[Math.floor(Math.random()*items.length)];
}


// since its only one layer, a simple Object.freeze is enough (to prevent overrides)
export const UtilsApi = Object.freeze({
  randomElement,
});
