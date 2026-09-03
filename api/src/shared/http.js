const { ObjectId } = require('mongodb');

/** Resposta JSON padronizada */
function json(status, body) {
  return {
    status,
    jsonBody: body,
  };
}

function ok(data, extra = {}) {
  return json(200, { success: true, ...extra, data });
}

function created(data) {
  return json(201, { success: true, data });
}

function fail(status, message, details) {
  return json(status, {
    success: false,
    error: message,
    ...(details ? { details } : {}),
  });
}

/** Converte o documento do Mongo para o formato exposto na API */
function toDto(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

/** Valida o id da rota e devolve um ObjectId (ou null se inválido) */
function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

/** ~2.7 MB de base64 cobrem o PNG de 2 MB que o formulário aceita */
const MAX_ICON_DATA_URL = 3 * 1024 * 1024;

/** Valida o bloco de ícone, que espelha o modelo da tela de cadastro */
function validateIcon(body, data, errors) {
  if (body.iconSource !== undefined) {
    if (body.iconSource !== 'preset' && body.iconSource !== 'upload') {
      errors.push("iconSource deve ser 'preset' ou 'upload'");
    } else {
      data.iconSource = body.iconSource;
    }
  }

  if (body.iconPresetId !== undefined) {
    const id = typeof body.iconPresetId === 'string' ? body.iconPresetId.trim() : '';
    if (id && !/^[a-z0-9-]{1,64}$/.test(id)) {
      errors.push('iconPresetId deve conter apenas letras minúsculas, números e hífen');
    } else {
      data.iconPresetId = id;
    }
  }

  if (body.iconDataUrl !== undefined) {
    const url = typeof body.iconDataUrl === 'string' ? body.iconDataUrl : '';
    if (url === '') {
      data.iconDataUrl = '';
    } else if (!/^data:image\/(png|jpeg|webp|svg\+xml);base64,/.test(url)) {
      errors.push('iconDataUrl deve ser um data URI de imagem em base64');
    } else if (url.length > MAX_ICON_DATA_URL) {
      errors.push('A imagem enviada excede o limite de 2 MB');
    } else {
      data.iconDataUrl = url;
    }
  }

  if (body.iconFileName !== undefined) {
    const nome = typeof body.iconFileName === 'string' ? body.iconFileName.trim().slice(0, 255) : '';
    data.iconFileName = nome;
  }

  // Ícone via URL externa: usado pelo seed do catálogo, não pelo formulário
  if (body.iconUrl !== undefined) {
    const iconUrl = typeof body.iconUrl === 'string' ? body.iconUrl.trim() : '';
    if (iconUrl === '') {
      data.iconUrl = '';
    } else if (!/^https:\/\//.test(iconUrl)) {
      errors.push('iconUrl deve ser uma URL https://');
    } else if (iconUrl.length > 2048) {
      errors.push('iconUrl deve ter no máximo 2048 caracteres');
    } else {
      data.iconUrl = iconUrl;
    }
  }

  // Coerência: 'upload' sem imagem deixaria a moeda sem ícone nenhum
  const source = data.iconSource || body.iconSource;
  if (source === 'upload' && data.iconDataUrl === '') {
    errors.push('iconSource \'upload\' exige iconDataUrl');
  }
}

/**
 * Valida o corpo do cadastro/edição de criptomoeda.
 * `partial = true` permite enviar apenas parte dos campos (usado no PUT).
 */
function validateCrypto(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!body || typeof body !== 'object') {
    return { errors: ['Corpo da requisição deve ser um JSON válido'], data: null };
  }

  if (body.name !== undefined || !partial) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 2 || name.length > 60) {
      errors.push('name é obrigatório e deve ter entre 2 e 60 caracteres');
    } else {
      data.name = name;
    }
  }

  if (body.symbol !== undefined || !partial) {
    const symbol = typeof body.symbol === 'string' ? body.symbol.trim().toUpperCase() : '';
    if (!/^[A-Z0-9]{2,10}$/.test(symbol)) {
      errors.push('symbol é obrigatório e deve ter de 2 a 10 caracteres alfanuméricos');
    } else {
      data.symbol = symbol;
    }
  }

  validateIcon(body, data, errors);

  if (partial && Object.keys(data).length === 0 && errors.length === 0) {
    errors.push('Informe ao menos um campo para atualizar');
  }

  return { errors, data };
}

/** Lê o JSON do corpo sem derrubar a function quando o corpo é inválido */
async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

module.exports = { json, ok, created, fail, toDto, parseId, validateCrypto, readJson };
