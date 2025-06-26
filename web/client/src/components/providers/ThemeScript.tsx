// Script para inicializar o tema antes do React carregar
// Este script previne o flash de conteúdo (FOUC)
function setInitialTheme() {
  const script = `
    (function() {
      try {
        // Verificar o tema armazenado
        var storedTheme = localStorage.getItem('theme');
        
        // Aplicar tema com base na preferência salva
        if (storedTheme === 'dark') {
          document.documentElement.classList.add('dark');
          console.log('Tema inicializado: dark (localStorage)');
        } else if (storedTheme === 'light') {
          document.documentElement.classList.remove('dark');
          console.log('Tema inicializado: light (localStorage)');
        } else {
          // Verificar preferência do sistema
          var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            console.log('Tema inicializado: dark (preferência do sistema)');
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            console.log('Tema inicializado: light (preferência do sistema)');
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar tema:', error);
      }
    })();
  `;

  return script;
}

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: setInitialTheme(),
      }}
    />
  );
}
