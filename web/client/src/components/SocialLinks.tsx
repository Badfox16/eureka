import { Github, Instagram, Linkedin } from "lucide-react";

export function SocialLinks() {
  return (
    <div className="flex justify-center gap-4 mt-2">
      <a href="https://github.com/eurekaplataforma" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-primary transition-colors">
        <Github className="w-5 h-5" />
      </a>
      <a href="https://instagram.com/eurekaplataforma" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors">
        <Instagram className="w-5 h-5" />
      </a>
      <a href="https://linkedin.com/company/eurekaplataforma" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-primary transition-colors">
        <Linkedin className="w-5 h-5" />
      </a>
    </div>
  );
}
