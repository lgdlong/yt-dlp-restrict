// Utility functions for yt-dlp command generation and data management

export interface YtDlpConfig {
  url: string;
  cookies: string;
  outdir: string;
  archive: string;
  template: string;
  shell: "powershell" | "bash";
  audioQuality: string;
  embedThumb: boolean;
  embedMeta: boolean;
  noPlaylist: boolean;
}

export const defaultConfig: YtDlpConfig = {
  url: "",
  cookies: "",
  outdir: "",
  archive: "",
  template: "",
  shell: "powershell",
  audioQuality: "6",
  embedThumb: true,
  embedMeta: true,
  noPlaylist: false,
};

export const templatePresets = {
  simple: "%(title)s [%(id)s].%(ext)s",
  uploader: "%(uploader)s - %(title)s [%(id)s].%(ext)s",
  titleDate: "[%(upload_date>%Y-%m-%d)s] %(title)s.%(ext)s",
  dated: "%(title)s [%(id)s] [%(upload_date>%Y-%m-%d)s].%(ext)s",
  playlist:
    "%(playlist_title)s/%(playlist_index)03d - %(title)s [%(id)s].%(ext)s",
};

export const audioQualityOptions = [
  { value: "0", label: "320 kbps (cao nhất)" },
  { value: "5", label: "160 kbps" },
  { value: "6", label: "128 kbps (khuyến nghị)" },
  { value: "7", label: "112 kbps" },
  { value: "9", label: "64 kbps (nhẹ nhất)" },
];

export function generateCommand(config: YtDlpConfig): string {
  const parts: string[] = ["yt-dlp"];

  // Add cookies
  if (config.cookies) {
    parts.push(`--cookies "${config.cookies}"`);
  }

  // Add output directory
  if (config.outdir) {
    parts.push(`-P "${config.outdir}"`);
  }

  // Add archive
  if (config.archive) {
    parts.push(`--download-archive "${config.archive}"`);
  }

  // Add template
  if (config.template) {
    parts.push(`-o "${config.template}"`);
  }

  // Add audio quality and format
  parts.push("--extract-audio");
  parts.push("--audio-format mp3");
  parts.push(`--audio-quality ${config.audioQuality}`);

  // Add thumbnail and metadata
  if (config.embedThumb) {
    parts.push("--embed-thumbnail");
  }
  if (config.embedMeta) {
    parts.push("--embed-metadata");
  }

  // Add no playlist option
  if (config.noPlaylist) {
    parts.push("--no-playlist");
  }

  // Add URL last
  parts.push(`"${config.url}"`);

  // Format for shell
  const command = parts.join(" ");
  if (config.shell === "powershell") {
    return command.replace(/\\/g, "`\\");
  }
  return command.replace(/\\/g, "\\\\\n  ");
}

export function analyzeUrl(url: string): {
  hasVideo: boolean;
  hasList: boolean;
  warning?: string;
} {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const p = u.searchParams;

    if (host.includes("youtube.com")) {
      const hasV = p.has("v");
      const hasList = p.has("list");

      if (hasV && hasList) {
        return {
          hasVideo: true,
          hasList: true,
          warning: "URL này vừa có video vừa có playlist. Bạn muốn tải gì?",
        };
      }
    }

    return { hasVideo: false, hasList: false };
  } catch {
    return { hasVideo: false, hasList: false };
  }
}

export function cleanUrl(url: string): string {
  try {
    const u = new URL(url);
    const newParams = new URLSearchParams();

    if (u.searchParams.has("v")) {
      newParams.set("v", u.searchParams.get("v")!);
    }
    if (u.searchParams.has("list")) {
      newParams.set("list", u.searchParams.get("list")!);
    }

    u.search = newParams.toString();
    return u.toString();
  } catch {
    return url;
  }
}

export function saveConfig(config: YtDlpConfig): void {
  localStorage.setItem("ytdlp-cmd-builder", JSON.stringify(config));
}

export function loadConfig(): YtDlpConfig | null {
  try {
    const raw = localStorage.getItem("ytdlp-cmd-builder");
    if (!raw) return null;
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}
