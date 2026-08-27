import React, { useState } from 'react';
import {
  X,
  CloudLightning,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { API_CONFIG } from '../../config/api.config';
import { ApiStatusState } from '../../services/apiClient';
import { UserProfile } from '../../types/user.types';
import { CryptoAsset } from '../../types/crypto.types';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiStatus: ApiStatusState;
  user: UserProfile | null;
  cryptos: CryptoAsset[];
  onReload: () => void;
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({
  isOpen,
  onClose,
  apiStatus,
  user,
  cryptos,
  onReload,
}) => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'azure_spec' | 'live_payload'>('endpoints');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleMeJson = JSON.stringify(
    {
      success: true,
      data: user || 'Carregando...',
    },
    null,
    2
  );

  const sampleCryptoJson = JSON.stringify(
    {
      success: true,
      currency: 'BRL',
      total: cryptos.length,
      data: cryptos.slice(0, 2),
    },
    null,
    2
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '720px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <CloudLightning size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)' }}>
                Integração API Azure & Contratos REST
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--gray-500)' }}>
                Estrutura informativa para endpoints <code style={{ color: '#0284c7' }}>/api/cryptos</code> e <code style={{ color: '#0284c7' }}>/api/me</code>
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            padding: '0 24px',
            backgroundColor: 'var(--gray-100)',
          }}
        >
          <button
            onClick={() => setActiveTab('endpoints')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'endpoints' ? 'var(--primary)' : 'var(--gray-600)',
              borderBottom: activeTab === 'endpoints' ? '2px solid var(--primary)' : 'none',
            }}
          >
            Configuração & Status
          </button>
          <button
            onClick={() => setActiveTab('live_payload')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'live_payload' ? 'var(--primary)' : 'var(--gray-600)',
              borderBottom: activeTab === 'live_payload' ? '2px solid var(--primary)' : 'none',
            }}
          >
            Payloads JSON da API
          </button>
          <button
            onClick={() => setActiveTab('azure_spec')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'azure_spec' ? 'var(--primary)' : 'var(--gray-600)',
              borderBottom: activeTab === 'azure_spec' ? '2px solid var(--primary)' : 'none',
            }}
          >
            Especificação Azure
          </button>
        </div>

        {/* Body Content */}
        <div className="modal-body">
          {activeTab === 'endpoints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status Banner */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  backgroundColor: apiStatus.isUsingMockFallback ? '#fffbeb' : '#f0fdf4',
                  border: `1px solid ${apiStatus.isUsingMockFallback ? '#fde68a' : '#bbf7d0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {apiStatus.isUsingMockFallback ? (
                  <AlertTriangle size={22} style={{ color: '#d97706', flexShrink: 0 }} />
                ) : (
                  <CheckCircle2 size={22} style={{ color: '#16a34a', flexShrink: 0 }} />
                )}
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '13.5px',
                      color: apiStatus.isUsingMockFallback ? '#92400e' : '#166534',
                    }}
                  >
                    {apiStatus.isUsingMockFallback
                      ? 'Modo Demonstração / Fallback Ativo'
                      : 'Conectado à API Azure com Sucesso'}
                  </div>
                  <div
                    style={{
                      fontSize: '12.5px',
                      color: apiStatus.isUsingMockFallback ? '#b45309' : '#15803d',
                      marginTop: '2px',
                    }}
                  >
                    {apiStatus.isUsingMockFallback
                      ? 'A API Azure ainda não está acessível no endpoint configurado. A aplicação está servindo os dados de cotações em BRL via mock transparente.'
                      : `Conexão estabelecida com latência de ${apiStatus.lastLatencyMs}ms.`}
                  </div>
                </div>
              </div>

              {/* Endpoint Variables Table */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '12px', color: 'var(--gray-900)' }}>
                  Configurações de Integração (.env)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--gray-600)', fontFamily: 'monospace' }}>VITE_AZURE_API_URL</span>
                    <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{API_CONFIG.baseUrl}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--gray-600)', fontFamily: 'monospace' }}>VITE_USE_MOCK_FALLBACK</span>
                    <span style={{ fontWeight: 600, color: 'var(--success-text)' }}>true</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-600)', fontFamily: 'monospace' }}>VITE_API_AUTH_TOKEN</span>
                    <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>Bearer [Configurado]</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button className="btn-primary" onClick={onReload} style={{ fontSize: '13px' }}>
                  <RefreshCw size={14} />
                  <span>Testar Conexão</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'live_payload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Endpoint /api/cryptos */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-900)' }}>
                    GET /api/cryptos (Listagem com valores em R$)
                  </span>
                  <button
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    onClick={() => copyToClipboard(sampleCryptoJson, 'cryptos')}
                  >
                    {copiedKey === 'cryptos' ? <Check size={12} /> : <Copy size={12} />}
                    <span>Copiar JSON</span>
                  </button>
                </div>
                <pre
                  style={{
                    backgroundColor: '#1e1e2d',
                    color: '#a6accd',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    overflowX: 'auto',
                    maxHeight: '180px',
                  }}
                >
                  {sampleCryptoJson}
                </pre>
              </div>

              {/* Endpoint /api/me */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-900)' }}>
                    GET /api/me (Usuário Logado & Watchlist)
                  </span>
                  <button
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                    onClick={() => copyToClipboard(sampleMeJson, 'me')}
                  >
                    {copiedKey === 'me' ? <Check size={12} /> : <Copy size={12} />}
                    <span>Copiar JSON</span>
                  </button>
                </div>
                <pre
                  style={{
                    backgroundColor: '#1e1e2d',
                    color: '#a6accd',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    overflowX: 'auto',
                    maxHeight: '180px',
                  }}
                >
                  {sampleMeJson}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'azure_spec' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <p style={{ color: 'var(--gray-700)', lineHeight: '1.5' }}>
                Para publicar a API informativa no Azure, você pode utilizar <strong>Azure App Service (ASP.NET / Node.js)</strong> ou <strong>Azure Functions</strong>.
              </p>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h5 style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--gray-900)' }}>
                  Comando cURL de exemplo:
                </h5>
                <pre
                  style={{
                    background: '#181c32',
                    color: '#47be7d',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    overflowX: 'auto',
                  }}
                >
{`curl -X GET "https://puc-crypto-api.azurewebsites.net/api/cryptos" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer <SEU_TOKEN>"`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
