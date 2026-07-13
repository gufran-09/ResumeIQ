import { APP_NAME, APP_TAGLINE } from '@/constants';

export function Footer() {
  return (
    <footer className="border-t bg-card/50 px-6 py-4">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>
          {APP_NAME} — {APP_TAGLINE}
        </p>
        <p>Rule-based &middot; Transparent &middot; Enterprise HR</p>
      </div>
    </footer>
  );
}
