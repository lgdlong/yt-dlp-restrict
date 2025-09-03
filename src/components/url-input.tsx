import { cleanUrl, analyzeUrl } from "@/lib/ytdlp-utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function UrlInput({ value, onChange }: UrlInputProps) {
  const [warning, setWarning] = useState<string>("");

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
      handleUrlAnalysis(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleClean = () => {
    const cleaned = cleanUrl(value);
    onChange(cleaned);
    setWarning("");
  };

  const handleUrlAnalysis = (url: string) => {
    const analysis = analyzeUrl(url);
    if (analysis.warning) {
      setWarning(analysis.warning);
    } else {
      setWarning("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue) {
      handleUrlAnalysis(newValue);
    } else {
      setWarning("");
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="url">URL video / playlist</Label>
      <div className="relative">
        <Input
          id="url"
          type="url"
          placeholder="https://www.youtube.com/watch?v=... hoặc https://www.youtube.com/playlist?list=..."
          value={value}
          onChange={handleInputChange}
          required
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePaste}
            className="h-7 px-2 text-xs"
            title="Paste từ clipboard"
          >
            Paste
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClean}
            className="h-7 px-2 text-xs"
            title="Làm sạch tham số dư"
          >
            Clear
          </Button>
        </div>
      </div>
      {warning && (
        <div className="px-3 py-2 border border-destructive/50 bg-destructive/10 text-destructive rounded-md text-sm">
          {warning}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Hỗ trợ cả video lẫn playlist. Nếu là playlist, bỏ chọn &ldquo;Không tải
        playlist&rdquo; ở dưới.
      </p>
    </div>
  );
}
