import { Link } from 'react-router'

type HeaderProps = {
  name: null | string
  open: () => void
}

export function Header({ name, open }: HeaderProps) {
  return (
    <header className="header-slide-down shadow-[0_10px_15px_rgba(0,0,0,0.3),0_4px_6px_rgba(0,0,0,0.2)] mb-6 bg-blue-600 font-tagesschrift text-white flex justify-between p-4 rounded-md">
      <div></div>
      <nav>
        <ol>
          <li className="flex gap-4">
            <Link to="/blog">blog</Link>
            <Link to="/newsletter">newsletter</Link>
            <button onClick={() => open()} className="hover:cursor-pointer">
              {name || 'log in'}
            </button>
          </li>
        </ol>
      </nav>
    </header>
  )
}
