/** Night, rain, meteo. Off on the optimized core. Dedicated work later. */
export function createWeather(opts = {}) {
  return {
    id: "weather",
    enabled: !!opts.enabled,
    look: "brief",
    rain: false,
    setLook(name) {
      if (!this.enabled) return false;
      this.look = name === "night" || name === "live" ? name : "brief";
      return true;
    },
    setRain(on) {
      if (!this.enabled) return false;
      this.rain = !!on;
      return true;
    }
  };
}

export const weather = createWeather({ enabled: false });
