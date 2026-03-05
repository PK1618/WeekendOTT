import { getPlatformMeta } from "../utils/platforms";

type Props = {
  platform: string;
  language?: string;
  size?: "sm" | "md";
};

export default function PlatformBadge({ platform, language, size = "sm" }: Props) {
  const meta = getPlatformMeta(platform);
  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-semibold tracking-wide ${
        isSmall ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
      }`}
      style={{ backgroundColor: meta.color, color: meta.textColor }}
    >
      {meta.label}
      {language && (
        <span className="opacity-70 font-normal">· {language}</span>
      )}
    </span>
  );
}
