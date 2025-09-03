import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { audioQualityOptions } from "@/lib/ytdlp-utils";

interface AudioQualitySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function AudioQualitySelector({
  value,
  onChange,
}: AudioQualitySelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        Chất lượng MP3 (--audio-quality)
      </Label>
      <RadioGroup value={value} onValueChange={onChange} className="grid gap-3">
        {audioQualityOptions.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50"
          >
            <RadioGroupItem value={option.value} id={`aq-${option.value}`} />
            <label
              htmlFor={`aq-${option.value}`}
              className="text-sm font-medium leading-none text-foreground cursor-pointer flex-1"
            >
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroup>
      <p className="text-xs text-muted-foreground">
        0 ≈ 320 kbps (cao nhất) · 5 ≈ 160 kbps · 6 ≈ 128 kbps · 7 ≈ 112 kbps · 9
        ≈ 64 kbps (nhẹ nhất)
      </p>
    </div>
  );
}
