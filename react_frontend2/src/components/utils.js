// utils.js
export const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const randomColor = (colors) => colors[random(0, colors.length - 1)];
