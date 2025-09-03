import { templatePresets } from "@/lib/ytdlp-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TemplateInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TemplateInput({ value, onChange }: TemplateInputProps) {
  const handlePresetClick = (preset: string) => {
    onChange(preset);
  };

  // Get example based on current template value
  const getTemplateExample = () => {
    switch (value) {
      case templatePresets.simple:
        return {
          name: "Đơn giản",
          example: "Amazing Video [dQw4w9WgXcQ].mp3",
        };
      case templatePresets.uploader:
        return {
          name: "Uploader",
          example: "RickAstleyVEVO - Amazing Video [dQw4w9WgXcQ].mp3",
        };
      case templatePresets.titleDate:
        return {
          name: "Ngày",
          example: "Amazing Video [2024-08-30] [dQw4w9WgXcQ].mp3",
        };
      case templatePresets.playlist:
        return {
          name: "Playlist",
          example: "My Playlist/001 - Amazing Video [dQw4w9WgXcQ].mp3",
        };
      default:
        return null;
    }
  };

  const currentExample = getTemplateExample();

  return (
    <div className="space-y-3">
      <Label htmlFor="template">Mẫu tên file (-o)</Label>
      <div className="relative">
        <Input
          id="template"
          type="text"
          placeholder="%(title)s [%(id)s].%(ext)s"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(templatePresets.simple)}
            className="h-7 px-2 text-xs"
            title="Đơn giản"
          >
            Đơn giản
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(templatePresets.uploader)}
            className="h-7 px-2 text-xs"
            title="Uploader + Title"
          >
            Uploader
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(templatePresets.titleDate)}
            className="h-7 px-2 text-xs"
            title="Title [UploadDate]"
          >
            Ngày
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(templatePresets.playlist)}
            className="h-7 px-2 text-xs"
            title="Playlist (thư mục + số thứ tự)"
          >
            Playlist
          </Button>
        </div>
      </div>

      {/* Show example only when a preset template is selected */}
      {currentExample && (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded border">
          <div className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Ví dụ cho mẫu &ldquo;{currentExample.name}&rdquo;:
          </div>
          <code className="text-zinc-600 dark:text-zinc-400 block bg-white dark:bg-zinc-900 p-2 rounded border text-sm">
            {currentExample.example}
          </code>
        </div>
      )}
    </div>
  );
}
