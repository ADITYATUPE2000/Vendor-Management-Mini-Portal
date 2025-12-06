import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
}) {
  const handleClick = (index) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const isFilled = index < Math.floor(rating);
        const isHalf = index === Math.floor(rating) && rating % 1 >= 0.5;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            disabled={!interactive}
            className={cn(
              "transition-colors",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default"
            )}
            data-testid={`star-${index + 1}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled || isHalf
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-muted-foreground"
              )}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm text-muted-foreground">
          {rating.toFixed(1)}/5
        </span>
      )}
    </div>
  );
}
