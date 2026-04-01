type TelegramWebApp = {
  ready(): void;
  expand(): void;
  themeParams: Record<string, string>;
  onEvent(eventType: string, eventHandler: () => void): void;
};

declare global {
  var Telegram: { WebApp: TelegramWebApp } | undefined;
}

function applyThemeParams(params: Record<string, string>): void {
  const root = document.documentElement;
  const set = (prop: string, val: string | undefined) => {
    if (val) root.style.setProperty(prop, val);
  };

  // Map Telegram theme colors onto our CSS variables.
  // Our D&D gold primary is preserved unless Telegram provides a button color.
  set('--background', params['bg_color']);
  set('--foreground', params['text_color']);
  set('--card-foreground', params['text_color']);
  set('--muted-foreground', params['hint_color'] ?? params['subtitle_text_color']);
  set('--border', params['section_separator_color']);
  set('--input', params['section_separator_color']);
  set('--primary', params['button_color'] ?? params['accent_text_color']);
  set('--primary-foreground', params['button_text_color']);
  set('--destructive', params['destructive_text_color']);

  // Use section_bg_color for cards, fall back to secondary_bg_color
  set('--card', params['section_bg_color'] ?? params['secondary_bg_color']);
  set('--popover', params['section_bg_color'] ?? params['secondary_bg_color']);
  set('--muted', params['secondary_bg_color']);
}

export function initTelegram(): void {
  const tg = globalThis.Telegram?.WebApp;
  if (!tg) return;

  tg.ready();
  tg.expand();
  applyThemeParams(tg.themeParams);
  tg.onEvent('themeChanged', () => applyThemeParams(tg.themeParams));
}
