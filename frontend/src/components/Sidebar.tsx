import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="border-r p-4 w-64">
      <nav>
        <ul>
          <li>
            <Link href="/" className="p-4 block">
              Home
            </Link>
          </li>
          <li>
            <Link href="/avaliacoes" className="p-4 block">
              Avaliações
            </Link>
          </li>
          <li>
            <Link href="/estudantes" className="p-4 block">
              Estudantes
            </Link>
          </li>
          <li>
            <Link href="/quizzes" className="p-4 block">
              Quizzes
            </Link>
          </li>
          <li>
            <Link href="/questoes" className="p-4 block">
              Questões
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;