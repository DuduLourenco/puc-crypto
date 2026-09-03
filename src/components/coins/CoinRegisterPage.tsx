import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Coins,
  Check,
  UploadCloud,
  Image as ImageIcon,
  Palette,
  Trash2,
  Pencil,
  AlertCircle,
  CheckCircle2,
  X,
  RotateCcw,
} from 'lucide-react';
import { COIN_ICON_PRESETS } from './coinIconPresets';
import { CoinAvatar } from './CoinAvatar';
import { coinRegistryService, CoinApiError } from '../../services/coinRegistryService';
import { CoinIconSource, CustomCoin } from '../../types/coin.types';

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

interface FormErrors {
  name?: string;
  symbol?: string;
  icon?: string;
}

export const CoinRegisterPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [iconSource, setIconSource] = useState<CoinIconSource>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(COIN_ICON_PRESETS[0].id);
  const [uploadDataUrl, setUploadDataUrl] = useState<string>('');
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [coins, setCoins] = useState<CustomCoin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** Id da moeda em edição; null significa que o formulário está cadastrando */
  const [editingId, setEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega as moedas já cadastradas na API Azure
  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const lista = await coinRegistryService.list();
        if (ativo) setCoins(lista);
      } catch (err) {
        if (ativo) {
          setLoadError(
            err instanceof Error ? err.message : 'Não foi possível carregar as moedas cadastradas.'
          );
        }
      } finally {
        if (ativo) setIsLoading(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  // Fecha o aviso de sucesso automaticamente
  useEffect(() => {
    if (feedback?.type !== 'success') return;
    const timer = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const previewCoin = useMemo(
    () => ({
      name: name.trim() || 'Nome da moeda',
      symbol: symbol.trim().toUpperCase() || 'SYM',
      iconSource,
      iconPresetId: selectedPresetId,
      iconDataUrl: uploadDataUrl,
    }),
    [name, symbol, iconSource, selectedPresetId, uploadDataUrl]
  );

  const handleSymbolChange = (value: string) => {
    // Símbolos de cripto são alfanuméricos e curtos (BTC, USDT, POL...)
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setSymbol(sanitized);
    if (errors.symbol) setErrors((prev) => ({ ...prev, symbol: undefined }));
  };

  const readPngFile = (file: File) => {
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    if (!isPng) {
      setErrors((prev) => ({ ...prev, icon: 'Apenas arquivos no formato PNG são aceitos.' }));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrors((prev) => ({ ...prev, icon: 'O arquivo deve ter no máximo 2 MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadDataUrl(String(reader.result || ''));
      setUploadFileName(file.name);
      setIconSource('upload');
      setErrors((prev) => ({ ...prev, icon: undefined }));
    };
    reader.onerror = () => {
      setErrors((prev) => ({ ...prev, icon: 'Não foi possível ler o arquivo. Tente novamente.' }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readPngFile(file);
    // Permite reenviar o mesmo arquivo depois de remover
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readPngFile(file);
  };

  const clearUpload = () => {
    setUploadDataUrl('');
    setUploadFileName('');
  };

  const resetForm = () => {
    setName('');
    setSymbol('');
    setIconSource('preset');
    setSelectedPresetId(COIN_ICON_PRESETS[0].id);
    clearUpload();
    setErrors({});
    setEditingId(null);
  };

  /** Carrega uma moeda da listagem no formulário para edição */
  const startEdit = (coin: CustomCoin) => {
    setEditingId(coin.id);
    setName(coin.name);
    setSymbol(coin.symbol);
    setIconSource(coin.iconSource);

    if (coin.iconSource === 'upload') {
      setUploadDataUrl(coin.iconDataUrl || '');
      setUploadFileName(coin.iconFileName || '');
    } else {
      setSelectedPresetId(coin.iconPresetId || COIN_ICON_PRESETS[0].id);
      clearUpload();
    }

    setErrors({});
    setFeedback(null);
    // O formulário fica acima da listagem; sem isso a edição parece não responder
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validate = (): FormErrors => {
    const validationErrors: FormErrors = {};

    if (name.trim().length < 2) {
      validationErrors.name = 'Informe o nome da moeda (mínimo 2 caracteres).';
    }
    if (symbol.trim().length < 2) {
      validationErrors.symbol = 'Informe o símbolo da moeda (mínimo 2 caracteres).';
    }
    // A unicidade do símbolo é garantida pelo índice único do MongoDB. A API
    // responde 409 e handleSubmit exibe o erro no campo correspondente.
    if (iconSource === 'upload' && !uploadDataUrl) {
      validationErrors.icon = 'Envie um arquivo PNG ou escolha um ícone padrão.';
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFeedback({ type: 'error', text: 'Revise os campos destacados para concluir o cadastro.' });
      return;
    }

    const input = {
      name,
      symbol,
      iconSource,
      iconPresetId: iconSource === 'preset' ? selectedPresetId : undefined,
      iconDataUrl: iconSource === 'upload' ? uploadDataUrl : undefined,
      iconFileName: iconSource === 'upload' ? uploadFileName : undefined,
    };

    setIsSaving(true);
    try {
      if (editingId) {
        const updated = await coinRegistryService.update(editingId, input);
        setCoins((prev) => prev.map((coin) => (coin.id === editingId ? updated : coin)));
        setFeedback({
          type: 'success',
          text: `${updated.name} (${updated.symbol}) atualizada com sucesso!`,
        });
      } else {
        const created = await coinRegistryService.create(input);
        setCoins((prev) => [created, ...prev]);
        setFeedback({
          type: 'success',
          text: `${created.name} (${created.symbol}) cadastrada com sucesso!`,
        });
      }

      resetForm();
    } catch (err) {
      if (err instanceof CoinApiError && err.isDuplicateSymbol) {
        setErrors((prev) => ({ ...prev, symbol: err.message }));
        setFeedback({ type: 'error', text: err.message });
      } else if (err instanceof CoinApiError) {
        setFeedback({ type: 'error', text: err.details[0] || err.message });
      } else {
        setFeedback({ type: 'error', text: 'Não foi possível salvar. Verifique sua conexão.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    const anteriores = coins;
    // Editar um registro que acabou de ser excluído resultaria em 404 no submit
    if (editingId === id) resetForm();
    // Remove da lista antes da resposta e desfaz se a API recusar
    setCoins((prev) => prev.filter((coin) => coin.id !== id));

    try {
      await coinRegistryService.remove(id);
    } catch (err) {
      setCoins(anteriores);
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Não foi possível remover a moeda.',
      });
    }
  };

  return (
    <main className="content-body">
      {/* Cabeçalho da Página */}
      <div className="page-heading">
        <div className="page-heading-icon">
          <Coins size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="page-heading-title">Cadastro de Moeda</h1>
          <p className="page-heading-subtitle">
            Registre uma nova moeda informando nome, símbolo e escolhendo um ícone padrão colorido
            ou enviando um PNG personalizado.
          </p>
        </div>
      </div>

      {/* Alerta de feedback */}
      {feedback && (
        <div className={`form-feedback ${feedback.type}`} role="status">
          {feedback.type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
          <span>{feedback.text}</span>
          <button
            type="button"
            className="form-feedback-close"
            onClick={() => setFeedback(null)}
            aria-label="Fechar aviso"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="coin-register-grid">
        {/* Coluna Esquerda: Formulário */}
        <form className="card coin-form-card" onSubmit={handleSubmit} noValidate>
          <div className="card-header-simple">
            <h3 className="card-title-lg">
              {editingId ? 'Editando Moeda' : 'Dados da Moeda'}
            </h3>
          </div>

          {/* Nome */}
          <div className="form-field">
            <label className="form-label" htmlFor="input-coin-name">
              Nome da moeda <span className="form-required">*</span>
            </label>
            <input
              id="input-coin-name"
              type="text"
              className={`form-input ${errors.name ? 'has-error' : ''}`}
              placeholder="Ex.: Bitcoin"
              value={name}
              maxLength={40}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
            />
            {errors.name && <span className="form-error-text">{errors.name}</span>}
          </div>

          {/* Símbolo */}
          <div className="form-field">
            <label className="form-label" htmlFor="input-coin-symbol">
              Símbolo <span className="form-required">*</span>
            </label>
            <input
              id="input-coin-symbol"
              type="text"
              className={`form-input form-input-symbol ${errors.symbol ? 'has-error' : ''}`}
              placeholder="Ex.: BTC"
              value={symbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
            />
            <span className="form-hint">
              Somente letras e números, até 10 caracteres. Convertido automaticamente em maiúsculas.
            </span>
            {errors.symbol && <span className="form-error-text">{errors.symbol}</span>}
          </div>

          {/* Seletor de tipo de ícone */}
          <div className="form-field">
            <label className="form-label">Ícone da moeda</label>
            <div className="icon-source-tabs" role="tablist" aria-label="Origem do ícone">
              <button
                type="button"
                role="tab"
                aria-selected={iconSource === 'preset'}
                className={`icon-source-tab ${iconSource === 'preset' ? 'active' : ''}`}
                onClick={() => setIconSource('preset')}
              >
                <Palette size={15} />
                <span>Ícones padrão</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={iconSource === 'upload'}
                className={`icon-source-tab ${iconSource === 'upload' ? 'active' : ''}`}
                onClick={() => setIconSource('upload')}
              >
                <ImageIcon size={15} />
                <span>Enviar PNG</span>
              </button>
            </div>

            {/* Grade de ícones padrão coloridos */}
            {iconSource === 'preset' && (
              <>
                <div className="coin-preset-grid">
                  {COIN_ICON_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={`coin-preset-item ${isSelected ? 'selected' : ''}`}
                        style={isSelected ? { borderColor: preset.color } : undefined}
                        onClick={() => {
                          setSelectedPresetId(preset.id);
                          if (!symbol) setSymbol(preset.suggestedSymbol);
                          if (!name.trim()) setName(preset.label);
                        }}
                        title={`${preset.label} (${preset.suggestedSymbol})`}
                        aria-pressed={isSelected}
                      >
                        <preset.Icon size={34} />
                        <span className="coin-preset-label">{preset.label}</span>
                        {isSelected && (
                          <span className="coin-preset-check" style={{ backgroundColor: preset.color }}>
                            <Check size={11} strokeWidth={3.5} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <span className="form-hint">
                  Ícones vetoriais nas cores oficiais de cada moeda. Selecione um para preencher o
                  formulário automaticamente.
                </span>
              </>
            )}

            {/* Upload de PNG personalizado */}
            {iconSource === 'upload' && (
              <>
                {uploadDataUrl ? (
                  <div className="upload-preview">
                    <img src={uploadDataUrl} alt="Pré-visualização do ícone enviado" />
                    <div className="upload-preview-info">
                      <strong title={uploadFileName}>{uploadFileName}</strong>
                      <span>PNG carregado com sucesso</span>
                    </div>
                    <div className="upload-preview-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '7px 12px', fontSize: '12.5px' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <RotateCcw size={14} />
                        <span>Trocar</span>
                      </button>
                      <button
                        type="button"
                        className="icon-action-btn"
                        onClick={clearUpload}
                        title="Remover imagem"
                        aria-label="Remover imagem"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${errors.icon ? 'has-error' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <UploadCloud size={30} />
                    <strong>Arraste um arquivo PNG ou clique para selecionar</strong>
                    <span>Fundo transparente recomendado · máximo 2 MB</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,.png"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </>
            )}

            {errors.icon && <span className="form-error-text">{errors.icon}</span>}
          </div>

          {/* Ações */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              {editingId ? <X size={15} /> : <RotateCcw size={15} />}
              <span>{editingId ? 'Cancelar edição' : 'Limpar'}</span>
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              <Check size={16} />
              <span>
                {isSaving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Cadastrar moeda'}
              </span>
            </button>
          </div>
        </form>

        {/* Coluna Direita: Preview + Moedas Cadastradas */}
        <div className="coin-side-column">
          {/* Pré-visualização */}
          <div className="card coin-preview-card">
            <div className="card-header-simple">
              <h3 className="card-title-lg">Pré-visualização</h3>
            </div>
            <div className="coin-preview-body">
              <CoinAvatar coin={previewCoin} size={64} />
              <div className="coin-preview-text">
                <strong>{previewCoin.name}</strong>
                <span className="asset-symbol">{previewCoin.symbol}</span>
              </div>
            </div>
            <span className="badge-pill badge-azure" style={{ alignSelf: 'flex-start' }}>
              {iconSource === 'preset' ? 'Ícone padrão' : 'PNG personalizado'}
            </span>
          </div>

          {/* Listagem */}
          <div className="card side-card">
            <div className="card-header-simple">
              <h3 className="card-title-lg">Moedas Cadastradas</h3>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  backgroundColor: 'var(--primary-light)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                {coins.length}
              </span>
            </div>

            <div className="watchlist-items-list">
              {isLoading ? (
                <div className="empty-state">Carregando moedas da API…</div>
              ) : loadError ? (
                <div className="empty-state">{loadError}</div>
              ) : coins.length === 0 ? (
                <div className="empty-state">Nenhuma moeda cadastrada ainda.</div>
              ) : (
                coins.map((coin) => (
                  <div
                    key={coin.id}
                    className="watchlist-item"
                    style={
                      editingId === coin.id
                        ? { backgroundColor: 'var(--primary-light)' }
                        : undefined
                    }
                  >
                    <div className="watchlist-item-user">
                      <CoinAvatar coin={coin} size={36} />
                      <div className="watchlist-item-text-col">
                        <div className="watchlist-item-name" title={coin.name}>
                          {coin.name}
                        </div>
                        <div className="watchlist-item-sub">
                          {coin.symbol}
                          <span className="badge-pill badge-azure" style={{ marginLeft: '6px' }}>
                            {coin.iconSource === 'upload' ? 'PNG' : 'Padrão'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button
                        className="icon-action-btn"
                        onClick={() => startEdit(coin)}
                        title="Editar moeda"
                        aria-label={`Editar ${coin.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-action-btn"
                        onClick={() => handleRemove(coin.id)}
                        title="Remover moeda"
                        aria-label={`Remover ${coin.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
