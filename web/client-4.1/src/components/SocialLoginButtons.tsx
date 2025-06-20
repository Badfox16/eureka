import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

function MicrosoftIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F35325" />
      <rect x="13" y="1" width="10" height="10" fill="#81BC06" />
      <rect x="1" y="13" width="10" height="10" fill="#05A6F0" />
      <rect x="13" y="13" width="10" height="10" fill="#FFBA08" />
    </svg>
  );
}

export function SocialLoginButtons({ disabled }: { disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-2 w-full mt-2">
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center gap-2 border border-orange-200 hover:bg-orange-50"
        aria-label="Entrar com Google"
        disabled={disabled}
      >
        <FcGoogle className="w-5 h-5" /> Entrar com Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center gap-2 border border-orange-200 hover:bg-orange-50"
        aria-label="Entrar com Microsoft"
        disabled={disabled}
      >
        <MicrosoftIcon /> Entrar com Microsoft
      </Button>
    </div>
  );
}
