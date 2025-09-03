"use client";

import { useState, useEffect } from "react";
import { UrlInput } from "@/components/url-input";
import { AudioQualitySelector } from "@/components/audio-quality-selector";
import { TemplateInput } from "@/components/template-input";
import { CommandOutput } from "@/components/command-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type YtDlpConfig,
  defaultConfig,
  saveConfig,
  loadConfig,
} from "@/lib/ytdlp-utils";

export default function Home() {
  const [config, setConfig] = useState<YtDlpConfig>(defaultConfig);

  // Load saved config on mount
  useEffect(() => {
    const saved = loadConfig();
    if (saved) {
      setConfig(saved);
    }
  }, []);

  // Auto-save when config changes
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const updateConfig = (updates: Partial<YtDlpConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handlePasteClipboard = async (field: keyof YtDlpConfig) => {
    try {
      const text = await navigator.clipboard.readText();
      updateConfig({ [field]: text });
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleReset = () => {
    setConfig(defaultConfig);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-foreground text-background">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            yt‑dlp Command Builder
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tạo lệnh yt-dlp để tải video YouTube có giới hạn độ tuổi và chuyển
            đổi sang MP3. Hỗ trợ Windows PowerShell và Bash.
          </p>
        </header>

        <div className="space-y-8">
          {/* Main Form */}
          <Card className="shadow-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Cấu hình tải xuống
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 bg-zinc-50 dark:bg-zinc-900">
              <div className="grid md:grid-cols-2 gap-6">
                {/* URL Input */}
                <div className="md:col-span-2">
                  <UrlInput
                    value={config.url}
                    onChange={(url) => updateConfig({ url })}
                  />
                </div>

                {/* Cookies Path */}
                <div className="md:col-span-2">
                  <Label htmlFor="cookies" className="mb-3 block">
                    Đường dẫn cookies.txt
                  </Label>
                  <div className="relative">
                    <Input
                      id="cookies"
                      type="text"
                      placeholder="E:\ttt-patreon\cookies.txt"
                      value={config.cookies}
                      onChange={(e) =>
                        updateConfig({ cookies: e.target.value })
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePasteClipboard("cookies")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                    >
                      Paste
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Xuất cookies bằng extension (Get cookies.txt). Trình duyệt
                    không cung cấp đường dẫn tuyệt đối qua File Picker — hãy
                    dùng nút Paste.
                  </p>
                </div>

                {/* Output Directory */}
                <div>
                  <Label htmlFor="outdir" className="mb-3 block">
                    Thư mục lưu (-P)
                  </Label>
                  <div className="relative">
                    <Input
                      id="outdir"
                      type="text"
                      placeholder="E:\ttt-patreon"
                      value={config.outdir}
                      onChange={(e) => updateConfig({ outdir: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePasteClipboard("outdir")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                    >
                      Paste
                    </Button>
                  </div>
                </div>

                {/* Shell Type */}
                <div>
                  <Label htmlFor="shell" className="mb-3 block">
                    Kiểu shell
                  </Label>
                  <Select
                    value={config.shell}
                    onValueChange={(value) =>
                      updateConfig({
                        shell: value as "powershell" | "bash",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="powershell">
                        Windows PowerShell
                      </SelectItem>
                      <SelectItem value="bash">
                        Bash / WSL / macOS / Linux
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    PowerShell dùng backtick `, Bash dùng \
                  </p>
                </div>

                {/* Audio Quality */}
                <div className="md:col-span-2">
                  <AudioQualitySelector
                    value={config.audioQuality}
                    onChange={(audioQuality) => updateConfig({ audioQuality })}
                  />
                </div>

                {/* Options */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Tùy chọn
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="embedThumb"
                        checked={config.embedThumb}
                        onCheckedChange={(checked) =>
                          updateConfig({ embedThumb: Boolean(checked) })
                        }
                      />
                      <Label
                        htmlFor="embedThumb"
                        className="text-sm cursor-pointer"
                      >
                        Nhúng thumbnail
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="embedMeta"
                        checked={config.embedMeta}
                        onCheckedChange={(checked) =>
                          updateConfig({ embedMeta: Boolean(checked) })
                        }
                      />
                      <Label
                        htmlFor="embedMeta"
                        className="text-sm cursor-pointer"
                      >
                        Nhúng metadata
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noPlaylist"
                        checked={config.noPlaylist}
                        onCheckedChange={(checked) =>
                          updateConfig({ noPlaylist: Boolean(checked) })
                        }
                      />
                      <Label
                        htmlFor="noPlaylist"
                        className="text-sm cursor-pointer"
                      >
                        Không tải playlist
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Archive */}
                <div className="md:col-span-2">
                  <Label htmlFor="archive" className="mb-3 block">
                    Bỏ qua video đã tải (--download-archive)
                  </Label>
                  <Input
                    id="archive"
                    type="text"
                    placeholder="E:\ttt-patreon\archive.txt"
                    value={config.archive}
                    onChange={(e) => updateConfig({ archive: e.target.value })}
                  />
                </div>

                {/* Template */}
                <div className="md:col-span-2">
                  <TemplateInput
                    value={config.template}
                    onChange={(template) => updateConfig({ template })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/30 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Đặt lại
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Command Output */}
          <Card className="shadow-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Kết quả lệnh
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-zinc-50 dark:bg-zinc-900">
              <CommandOutput config={config} />
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="shadow-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                💡 Mẹo & xử lý sự cố
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-zinc-50 dark:bg-zinc-900">
              <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <ul className="space-y-2">
                  <li>
                    • Cookies phải export khi đang đăng nhập vào youtube.com
                    bằng tài khoản đã xác minh tuổi.
                  </li>
                  <li>
                    • Nếu gặp lỗi đăng nhập tuổi, hãy export lại cookies mới;
                    cookie có hạn.
                  </li>
                  <li>
                    • Không dùng --no-playlist nếu bạn nhập URL playlist và muốn
                    tải toàn bộ.
                  </li>
                  <li>• Dùng --download-archive để tránh tải trùng lần sau.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 — yt‑dlp command helper. Dùng cho mục đích hợp pháp / cá
            nhân.
          </p>
        </footer>
      </div>
    </div>
  );
}
