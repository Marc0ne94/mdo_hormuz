/** Catalogo unico del bus Kharg. Toy sandbox. Niente loadout reali. */

export const SIDES = ["sea", "land", "irn"];
export const WEAPONS = ["missile", "bomb", "cannon"];

/** Tutte le `op` accettate da POST /cmd e da applyCmd in index.html. */
export const OPS = [
  "bomb",
  "navy",
  "artillery",
  "air",
  "radar",
  "status",
  "possess",
  "fire",
  "paradrop",
  "barrage",
  "lock",
  "carpet",
  "cruise",
  "smoke",
  "uav",
  "heli",
  "oilfire",
  "launch",
  "moab",
  "battle"
];

export const WRITE_OPS = OPS.filter((op) => op !== "status");

export const VERSION = "0.2.0";
export const PRODUCT = "KHARG";
