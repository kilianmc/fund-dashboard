// Parse an imported holdings File (JSON or CSV) into a normalized array of
// `{ id, shares, price }` rows, where `price` is the per-share cost basis.
//
// - Format is detected by extension, then by content sniff as a fallback.
// - JSON accepts an array or `{ holdings: [...] }`; keys are matched by alias.
// - CSV is parsed by a tiny hand-rolled parser (flat `isin,shares,price`, with
//   or without a header row) — no new npm dependency.
// - All rows are validated; any problems are collected and thrown as ONE
//   aggregated, row-referenced Error.

import { normalizeType } from '../data/fundCatalog';

const ID_KEYS = ['id', 'isin', 'symbol'];
const SHARES_KEYS = ['shares', 'quantity', 'units'];
const PRICE_KEYS = ['price', 'costbasis', 'purchaseprice'];
// Optional asset-class column. Only read from a NAMED key/header — never
// positionally — so flat `id,shares,price` CSVs keep working unchanged.
const TYPE_KEYS = ['type', 'assetclass', 'category', 'class'];
const HEADER_KEYS = [...ID_KEYS, ...SHARES_KEYS, ...PRICE_KEYS, ...TYPE_KEYS];

// Pull the first matching aliased key out of a plain object (case-insensitive).
function pick(obj, keys) {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const key of Object.keys(obj)) {
    if (keys.includes(key.trim().toLowerCase())) return obj[key];
  }
  return undefined;
}

function recordsFromJson(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON.');
  }
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.holdings)
      ? data.holdings
      : null;
  if (!arr) {
    throw new Error(
      'JSON must be an array of holdings or an object with a "holdings" array.',
    );
  }
  return arr.map((obj, i) => ({
    row: i + 1,
    id: pick(obj, ID_KEYS),
    shares: pick(obj, SHARES_KEYS),
    price: pick(obj, PRICE_KEYS),
    type: pick(obj, TYPE_KEYS),
  }));
}

// Split one CSV line on commas, trimming and stripping surrounding quotes.
function splitCsvLine(line) {
  return line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
}

function recordsFromCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) throw new Error('The CSV file has no rows.');

  const firstCells = splitCsvLine(lines[0]).map((c) => c.toLowerCase());
  const hasHeader = firstCells.some((c) => HEADER_KEYS.includes(c));

  let idIdx = 0;
  let shIdx = 1;
  let prIdx = 2;
  let tyIdx = -1; // type is only read from a named header column
  let dataLines = lines;
  let rowOffset = 1; // first data row is line 1 when there is no header

  if (hasHeader) {
    idIdx = firstCells.findIndex((c) => ID_KEYS.includes(c));
    shIdx = firstCells.findIndex((c) => SHARES_KEYS.includes(c));
    prIdx = firstCells.findIndex((c) => PRICE_KEYS.includes(c));
    tyIdx = firstCells.findIndex((c) => TYPE_KEYS.includes(c));
    dataLines = lines.slice(1);
    rowOffset = 2; // first data row is line 2 (after the header)
  }

  return dataLines.map((line, i) => {
    const cells = splitCsvLine(line);
    return {
      row: i + rowOffset,
      id: idIdx >= 0 ? cells[idIdx] : undefined,
      shares: shIdx >= 0 ? cells[shIdx] : undefined,
      price: prIdx >= 0 ? cells[prIdx] : undefined,
      type: tyIdx >= 0 ? cells[tyIdx] : undefined,
    };
  });
}

function validateRecords(records) {
  if (records.length === 0) {
    throw new Error('No holdings found in the file.');
  }

  const errors = [];
  const out = [];

  records.forEach((r) => {
    const id = r.id == null ? '' : String(r.id).trim().toUpperCase();
    const shares = Number(r.shares);
    const price = Number(r.price);

    const rowErrors = [];
    if (!id) rowErrors.push('missing fund id/ISIN');
    if (!Number.isFinite(shares) || shares <= 0) {
      rowErrors.push(`invalid shares "${r.shares ?? ''}"`);
    }
    if (!Number.isFinite(price) || price <= 0) {
      rowErrors.push(`invalid price "${r.price ?? ''}"`);
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${r.row}: ${rowErrors.join(', ')}.`);
    } else {
      // Type is optional and lenient: include it only when recognized, so files
      // without it (or with an unknown value) still validate and fall back
      // downstream in enrichFunds.
      const type = normalizeType(r.type);
      out.push(type ? { id, shares, price, type } : { id, shares, price });
    }
  });

  if (errors.length > 0) {
    throw new Error(`Could not import holdings:\n${errors.join('\n')}`);
  }

  return out;
}

export async function parseHoldingsFile(file) {
  if (!file) throw new Error('No file provided.');

  const text = await file.text();
  const name = (file.name || '').toLowerCase();
  const trimmed = text.trim();
  if (!trimmed) throw new Error('The file is empty.');

  let records;
  if (
    name.endsWith('.json') ||
    (!name.endsWith('.csv') && /^[[{]/.test(trimmed))
  ) {
    records = recordsFromJson(trimmed);
  } else if (
    name.endsWith('.csv') ||
    trimmed.includes(',') ||
    trimmed.includes('\n')
  ) {
    records = recordsFromCsv(trimmed);
  } else {
    throw new Error('Unrecognized file type. Import a .json or .csv file.');
  }

  return validateRecords(records);
}
