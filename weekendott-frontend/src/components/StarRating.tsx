type Props = {
  rating: number | null; // 1–5
  count?: number;
  size?: "sm" | "md" | "lg";
  interactive?: false;
};

type InteractiveProps = {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  interactive: true;
  onChange: (val: number) => void;
};

export default function StarRating(props: Props | InteractiveProps) {
  const { rating, count, size = "sm" } = props;
  const interactive = "interactive" in props && props.interactive;

  const starSize =
    size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm";

  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = rating !== null && i < Math.round(rating);
    return { index: i, filled };
  });

  return (
    <div className="flex items-center gap-1">
      <div className={`flex gap-0.5 ${starSize}`}>
        {stars.map(({ index, filled }) => (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => {
              if (interactive && "onChange" in props) {
                props.onChange(index + 1);
              }
            }}
            className={`transition-transform ${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            } ${filled ? "text-amber-400" : "text-zinc-600"}`}
          >
            ★
          </button>
        ))}
      </div>
      {count !== undefined && (
        <span className="text-zinc-500 text-xs ml-1">
          {rating !== null ? rating.toFixed(1) : "—"}
          {" "}
          <span className="text-zinc-600">({count.toLocaleString()})</span>
        </span>
      )}
    </div>
  );
}
