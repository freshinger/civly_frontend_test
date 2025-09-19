export type Color = {
  id: number;
  name: string;
  hex: string;
  isPrimary: boolean;
};

export const ColorRecord: Record<number, Color> = {
  // Blues (starting with primary)
  0: { id: 0, name: "Classic Blue", hex: "#005eff", isPrimary: true },
  1: { id: 1, name: "Sky Blue", hex: "#44aaff", isPrimary: false },
  2: { id: 2, name: "Cyan Blue", hex: "#44ddff", isPrimary: false },
  // Purples
  3: { id: 3, name: "Royal Purple", hex: "#6644ff", isPrimary: false },
  4: { id: 4, name: "Deep Purple", hex: "#8844ff", isPrimary: false },
  5: { id: 5, name: "Lavender", hex: "#aa88ff", isPrimary: false },
  // Greens
  6: { id: 6, name: "Forest Green", hex: "#22aa44", isPrimary: false },
  7: { id: 7, name: "Emerald", hex: "#44cc66", isPrimary: false },
  8: { id: 8, name: "Mint Green", hex: "#66dd88", isPrimary: false },
  // Reds
  9: { id: 9, name: "Crimson", hex: "#cc2244", isPrimary: false },
  10: { id: 10, name: "Coral", hex: "#ff4466", isPrimary: false },
  11: { id: 11, name: "Rose", hex: "#ff6688", isPrimary: false },
  // Oranges
  12: { id: 12, name: "Burnt Orange", hex: "#dd6622", isPrimary: false },
  13: { id: 13, name: "Tangerine", hex: "#ff8844", isPrimary: false },
  14: { id: 14, name: "Peach", hex: "#ffaa66", isPrimary: false },
  // Neutrals
  15: { id: 15, name: "Charcoal", hex: "#444444", isPrimary: false },
  16: { id: 16, name: "Slate Gray", hex: "#666666", isPrimary: false },
  17: { id: 17, name: "Stone Gray", hex: "#888888", isPrimary: false },
};
