export type PlatformMeta = {
  label: string;
  color: string;       // badge background
  textColor: string;   // badge text
};

const PLATFORM_MAP: Record<string, PlatformMeta> = {
  netflix: { label: "Netflix", color: "#E50914", textColor: "#fff" },
  "amazon prime": { label: "Prime", color: "#00A8E0", textColor: "#fff" },
  "prime video": { label: "Prime", color: "#00A8E0", textColor: "#fff" },
  hotstar: { label: "Hotstar", color: "#1F80E0", textColor: "#fff" },
  hbo: { label: "HBO", color: "#5822A0", textColor: "#fff" },
  "apple tv+": { label: "Apple TV+", color: "#1c1c1e", textColor: "#fff" },
  zee5: { label: "ZEE5", color: "#7B2FF7", textColor: "#fff" },
  sonyliv: { label: "SonyLIV", color: "#0052CC", textColor: "#fff" },
  jiocinema: { label: "JioCinema", color: "#8B0000", textColor: "#fff" },
};

export const getPlatformMeta = (platform: string): PlatformMeta => {
  const key = platform.toLowerCase().trim();
  return (
    PLATFORM_MAP[key] ?? {
      label: platform,
      color: "#2a2a2a",
      textColor: "#ccc",
    }
  );
};

