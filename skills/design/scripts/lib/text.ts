export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[`'’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function countWords(text: string): number {
  let count = 0;
  for (const word of text.split(/\s+/)) {
    if (/[\p{L}\p{N}]/u.test(word)) count += 1;
  }
  return count;
}

// Edit distance with insertion, deletion, substitution, and the transposition
// of two neighbor letters, which is the most common typing error.
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const rows: number[][] = [Array.from({ length: b.length + 1 }, (_, index) => index)];
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(row[j - 1]! + 1, rows[i - 1]![j]! + 1, rows[i - 1]![j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) value = Math.min(value, rows[i - 2]![j - 2]! + 1);
      row[j] = value;
    }
    rows.push(row);
  }
  return rows[a.length]![b.length]!;
}

// Ranks candidates by closeness to a wrong name. A candidate that contains the
// name, or that the name contains, ranks before an edit-distance match.
export function nearest(name: string, candidates: ReadonlyArray<string>, limit = 5): string[] {
  const scored: Array<{ candidate: string; score: number }> = [];
  for (const candidate of candidates) {
    const distance = levenshtein(name, candidate);
    const contains = candidate.includes(name) || name.includes(candidate);
    const threshold = Math.max(2, Math.floor(Math.max(name.length, candidate.length) / 3));
    if (contains) scored.push({ candidate, score: distance / 10 });
    else if (distance <= threshold) scored.push({ candidate, score: distance });
  }
  scored.sort((left, right) => left.score - right.score || left.candidate.localeCompare(right.candidate));
  return scored.slice(0, limit).map((entry) => entry.candidate);
}

export function unique<T>(values: Iterable<T>): T[] {
  return [...new Set(values)];
}
