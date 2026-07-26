import { describe, it, expect } from 'vitest';
import { parseHoldingsFile } from './parseHoldingsFile';

// Lightweight File stand-in: parseHoldingsFile only reads `.name` and `.text()`.
const makeFile = (name, content) => ({ name, text: async () => content });

describe('parseHoldingsFile — valid input', () => {
  it('parses a JSON array of holdings', async () => {
    const file = makeFile(
      'h.json',
      JSON.stringify([
        { id: 'IE0032620787', shares: 120, price: 62.5 },
        { id: 'IE0007987690', shares: 300, price: 34 },
      ]),
    );
    const rows = await parseHoldingsFile(file);
    expect(rows).toEqual([
      { id: 'IE0032620787', shares: 120, price: 62.5 },
      { id: 'IE0007987690', shares: 300, price: 34 },
    ]);
  });

  it('parses a JSON { holdings: [...] } wrapper', async () => {
    const file = makeFile(
      'h.json',
      JSON.stringify({
        holdings: [{ id: 'IE0032620787', shares: 10, price: 5 }],
      }),
    );
    const rows = await parseHoldingsFile(file);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('IE0032620787');
  });

  it('accepts JSON key aliases (isin/quantity/costBasis, symbol/units/purchasePrice)', async () => {
    const file = makeFile(
      'h.json',
      JSON.stringify([
        { isin: 'ie0032620787', quantity: 120, costBasis: 62.5 },
        { symbol: 'IE0007987690', units: 300, purchasePrice: 34 },
      ]),
    );
    const rows = await parseHoldingsFile(file);
    expect(rows).toEqual([
      { id: 'IE0032620787', shares: 120, price: 62.5 },
      { id: 'IE0007987690', shares: 300, price: 34 },
    ]);
  });

  it('parses CSV with a header row', async () => {
    const file = makeFile(
      'h.csv',
      'isin,shares,price\nIE0032620787,120,62.50\nIE0007987690,300,34.00',
    );
    const rows = await parseHoldingsFile(file);
    expect(rows).toEqual([
      { id: 'IE0032620787', shares: 120, price: 62.5 },
      { id: 'IE0007987690', shares: 300, price: 34 },
    ]);
  });

  it('parses CSV without a header row (positional)', async () => {
    const file = makeFile(
      'h.csv',
      'IE0032620787,120,62.50\nIE0007987690,300,34',
    );
    const rows = await parseHoldingsFile(file);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ id: 'IE0032620787', shares: 120, price: 62.5 });
  });

  it('trims whitespace and uppercases the id', async () => {
    const file = makeFile('h.csv', ' ie0032620787 , 120 , 62.50 ');
    const rows = await parseHoldingsFile(file);
    expect(rows[0]).toEqual({ id: 'IE0032620787', shares: 120, price: 62.5 });
  });
});

describe('parseHoldingsFile — optional asset type', () => {
  it('reads and normalizes a JSON type field (equity variants)', async () => {
    const file = makeFile(
      'h.json',
      JSON.stringify([
        { id: 'IE0032620787', shares: 10, price: 5, type: 'Stocks' },
        { id: 'IE0007987690', shares: 10, price: 5, assetClass: 'EQ' },
      ]),
    );
    const rows = await parseHoldingsFile(file);
    expect(rows[0].type).toBe('equity');
    expect(rows[1].type).toBe('equity');
  });

  it('reads and normalizes a JSON type field (income variants)', async () => {
    const file = makeFile(
      'h.json',
      JSON.stringify([
        { id: 'IE0032620787', shares: 10, price: 5, category: 'Fixed Income' },
        { id: 'IE0007987690', shares: 10, price: 5, class: 'bonds' },
      ]),
    );
    const rows = await parseHoldingsFile(file);
    expect(rows[0].type).toBe('income');
    expect(rows[1].type).toBe('income');
  });

  it('reads a CSV type header column (case-insensitive)', async () => {
    const file = makeFile(
      'h.csv',
      'isin,shares,price,Type\nIE0032620787,10,5,equity\nIE0007987690,10,5,BOND',
    );
    const rows = await parseHoldingsFile(file);
    expect(rows[0]).toEqual({
      id: 'IE0032620787',
      shares: 10,
      price: 5,
      type: 'equity',
    });
    expect(rows[1].type).toBe('income');
  });

  it('omits type entirely when the field is missing (still valid)', async () => {
    const file = makeFile(
      'h.json',
      JSON.stringify([{ id: 'IE0032620787', shares: 10, price: 5 }]),
    );
    const rows = await parseHoldingsFile(file);
    expect(rows[0]).toEqual({ id: 'IE0032620787', shares: 10, price: 5 });
    expect(rows[0]).not.toHaveProperty('type');
  });

  it('ignores an unrecognized type without erroring', async () => {
    const file = makeFile(
      'h.csv',
      'isin,shares,price,type\nIE0032620787,10,5,commodity',
    );
    const rows = await parseHoldingsFile(file);
    expect(rows[0]).toEqual({ id: 'IE0032620787', shares: 10, price: 5 });
    expect(rows[0]).not.toHaveProperty('type');
  });

  it('keeps positional CSV (no header) working — no type read', async () => {
    const file = makeFile('h.csv', 'IE0032620787,120,62.50');
    const rows = await parseHoldingsFile(file);
    expect(rows[0]).toEqual({ id: 'IE0032620787', shares: 120, price: 62.5 });
    expect(rows[0]).not.toHaveProperty('type');
  });
});

describe('parseHoldingsFile — invalid input', () => {
  it('rejects an empty file', async () => {
    await expect(parseHoldingsFile(makeFile('h.csv', '   '))).rejects.toThrow(
      /empty/i,
    );
  });

  it('rejects a missing price column', async () => {
    await expect(
      parseHoldingsFile(makeFile('h.csv', 'isin,shares\nIE0032620787,120')),
    ).rejects.toThrow(/Row 2.*price/i);
  });

  it('rejects non-numeric shares', async () => {
    await expect(
      parseHoldingsFile(
        makeFile('h.csv', 'isin,shares,price\nIE0032620787,abc,62.5'),
      ),
    ).rejects.toThrow(/shares/i);
  });

  it('rejects negative or zero values', async () => {
    await expect(
      parseHoldingsFile(
        makeFile('h.json', JSON.stringify([{ id: 'X', shares: -1, price: 0 }])),
      ),
    ).rejects.toThrow(/Row 1/i);
  });

  it('aggregates multiple row errors into one message', async () => {
    const file = makeFile(
      'h.csv',
      'isin,shares,price\n,120,62.5\nIE0007987690,x,34',
    );
    let message = '';
    try {
      await parseHoldingsFile(file);
    } catch (err) {
      message = err.message;
    }
    expect(message).toMatch(/Row 2/);
    expect(message).toMatch(/Row 3/);
  });

  it('rejects malformed JSON', async () => {
    await expect(
      parseHoldingsFile(makeFile('h.json', '{ not valid json')),
    ).rejects.toThrow(/not valid JSON/i);
  });

  it('rejects an unknown file type', async () => {
    await expect(
      parseHoldingsFile(makeFile('notes.txt', 'just some prose here')),
    ).rejects.toThrow(/Unrecognized/i);
  });
});
