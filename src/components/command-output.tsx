import { generateCommand, type YtDlpConfig } from "@/lib/ytdlp-utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CommandOutputProps {
  config: YtDlpConfig;
}

export function CommandOutput({ config }: CommandOutputProps) {
  const [status, setStatus] = useState<string>("");

  const command = generateCommand(config);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setStatus("Đã sao chép vào clipboard");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      setStatus("Lỗi khi sao chép");
      setTimeout(() => setStatus(""), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            size="sm"
          >
            Sao chép
          </Button>
          {status && (
            <span className="text-sm text-muted-foreground flex items-center">
              {status}
            </span>
          )}
        </div>
      </div>

      <pre className="bg-muted/30 border border-border rounded-md p-4 overflow-x-auto">
        <code className="text-sm text-foreground whitespace-pre-wrap">
          {command || "# Lệnh sẽ xuất hiện ở đây…"}
        </code>
      </pre>

      <div className="text-sm text-muted-foreground">
        Cần <strong>FFmpeg</strong> trong PATH để chuyển sang MP3 & nhúng
        thumbnail/metadata. Trên Windows:{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs">
          winget install -e --id Gyan.FFmpeg
        </code>
      </div>
    </div>
  );
}
