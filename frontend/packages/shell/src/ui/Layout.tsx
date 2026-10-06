import { Session } from '@puccrypto/shared';
import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION } from '../domain/navigation';
import './shell.css';

interface Props {
  session: Session | null;
  onSignOut: () => void;
  children: ReactNode;
}

/** Moldura comum: cabeçalho com a navegação e o usuário; o conteúdo vem dos microfrontends. */
export function Layout({ session, onSignOut, children }: Props) {
  return (
    <div className="shell">
      <header className="shell__header">
        <div className="shell__bar">
          <strong className="shell__brand">PucCrypto</strong>

          {session && (
            <>
              <nav className="shell__nav" aria-label="Principal">
                {NAVIGATION.map((item) => (
                  <NavLink key={item.path} to={item.path} end className="shell__link">
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="shell__user">
                <span title={session.email}>{session.userName || session.email}</span>
                <button className="pc-button pc-button--ghost pc-button--small" type="button" onClick={onSignOut}>
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className={session ? 'shell__main' : 'shell__main shell__main--narrow'}>{children}</main>
    </div>
  );
}
