import { Loading } from '@puccrypto/shared';
import { Component, ReactNode, Suspense } from 'react';

interface Props {
  name: string;
  children: ReactNode;
}

/**
 * Isola a falha de um microfrontend: se ele não carregar ou quebrar, o shell e os
 * demais continuam funcionando.
 */
export class RemoteBoundary extends Component<Props, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override render(): ReactNode {
    if (this.state.failed) {
      return (
        <section className="pc-card" role="alert">
          <h2>{this.props.name} indisponível</h2>
          <p className="pc-subtitle">Não foi possível carregar esta área. As demais continuam funcionando.</p>
          <div>
            <button className="pc-button pc-button--ghost" type="button" onClick={() => window.location.reload()}>
              Tentar novamente
            </button>
          </div>
        </section>
      );
    }

    return <Suspense fallback={<Loading label={`Carregando ${this.props.name}…`} />}>{this.props.children}</Suspense>;
  }
}
