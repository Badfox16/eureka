// src/app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  // Redireciona para a página de login
  redirect("auth/login");
  
  // Este retorno nunca será executado, mas é necessário para o TypeScript
  return null;
}