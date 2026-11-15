import type { Section } from "./graph.ts";
import { levenshtein } from "./text.ts";

const STOP_WORDS = new Set(
  (
    "a an and are as at be best between by can do does for from get good how i in into is it its me my of on or our " +
    "should so that the their them then there this to use using want we what when where which while who why will with " +
    "you your"
  ).split(" "),
);

// A small suffix stemmer. Both the index and the query use it, so "typing",
// "types", and "type" meet at one stem without a dictionary.
export function stem(word: string): string {
  let result = word;
  if (result.length <= 3 || /^\d/.test(result)) return result;
  if (result.endsWith("ies") && result.length > 4) result = `${result.slice(0, -3)}y`;
  else if (result.endsWith("sses")) result = result.slice(0, -2);
  else if (/(?:ch|sh|x|z)es$/.test(result)) result = result.slice(0, -2);
  else if (result.endsWith("s") && !/(?:ss|us|is)$/.test(result)) result = result.slice(0, -1);

  let suffixRemoved = false;
  if (result.endsWith("ing") && result.length > 5) {
    result = result.slice(0, -3);
    suffixRemoved = true;
  } else if (result.endsWith("ed") && result.length > 4) {
    result = result.slice(0, -2);
    suffixRemoved = true;
  } else if (result.endsWith("ly") && result.length > 4) {
    result = result.slice(0, -2);
  }
  if (suffixRemoved && /([b-df-hj-np-tv-z])\1$/.test(result) && !/(?:ll|ss|zz)$/.test(result)) result = result.slice(0, -1);
  if (result.endsWith("e") && result.length > 3) result = result.slice(0, -1);
  return result;
}

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 0 && !STOP_WORDS.has(word));
}

export function terms(text: string): string[] {
  return words(text).map(stem);
}

interface SectionIndex {
  readonly section: Section;
  readonly title: ReadonlySet<string>;
  readonly counts: ReadonlyMap<string, number>;
}

// A document that search can rank: a note or a member entry.
export interface Searchable {
  readonly id: string;
  readonly keywords: ReadonlyArray<string>;
  readonly summary: string;
  readonly title: string;
  readonly intro: string;
  readonly sections: ReadonlyArray<Section>;
}

interface DocIndex<T extends Searchable> {
  readonly doc: T;
  readonly id: ReadonlySet<string>;
  readonly keywords: ReadonlySet<string>;
  readonly phrases: ReadonlyArray<ReadonlyArray<string>>;
  readonly summary: ReadonlySet<string>;
  readonly title: ReadonlySet<string>;
  readonly sectionTitles: ReadonlySet<string>;
  readonly body: ReadonlyMap<string, number>;
  readonly sections: ReadonlyArray<SectionIndex>;
  readonly all: ReadonlySet<string>;
  readonly typed: ReadonlySet<string>;
}

function counts(words: ReadonlyArray<string>): Map<string, number> {
  const result = new Map<string, number>();
  for (const word of words) result.set(word, (result.get(word) ?? 0) + 1);
  return result;
}

// "DataTable" and "date-range" give the words "data table" and "date range".
function idWords(id: string): string {
  return id.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replaceAll("-", " ");
}

function indexDoc<T extends Searchable>(doc: T): DocIndex<T> {
  const keywordTerms = doc.keywords.map((keyword) => terms(keyword));
  const sections = doc.sections.map((section) => ({
    section,
    title: new Set(terms(section.title)),
    counts: counts(terms(section.text)),
  }));
  const body = counts(terms(`${doc.intro}\n${doc.sections.map((section) => section.text).join("\n")}`));
  const id = new Set(terms(idWords(doc.id)));
  const keywords = new Set(keywordTerms.flat());
  const summary = new Set(terms(doc.summary));
  const title = new Set(terms(doc.title));
  const sectionTitles = new Set(sections.flatMap((section) => [...section.title]));
  const all = new Set([...id, ...keywords, ...summary, ...title, ...sectionTitles, ...body.keys()]);
  const typed = new Set(
    words([idWords(doc.id), ...doc.keywords, doc.summary, doc.title, doc.intro, ...doc.sections.map((section) => section.text)].join("\n")),
  );
  return {
    doc,
    id,
    keywords,
    phrases: keywordTerms.filter((phrase) => phrase.length > 1),
    summary,
    title,
    sectionTitles,
    body,
    sections,
    all,
    typed,
  };
}

const indexes = new WeakMap<ReadonlyArray<Searchable>, ReadonlyArray<DocIndex<Searchable>>>();

function indexAll<T extends Searchable>(docs: ReadonlyArray<T>): ReadonlyArray<DocIndex<T>> {
  const cached = indexes.get(docs);
  if (cached) return cached as ReadonlyArray<DocIndex<T>>;
  const built = docs.map((doc) => indexDoc(doc));
  indexes.set(docs, built);
  return built;
}

export interface SearchHit<T extends Searchable> {
  readonly doc: T;
  readonly score: number;
  // The number of query words that the document contains.
  readonly matched: number;
  readonly sections: ReadonlyArray<Section>;
}

export interface SearchResult<T extends Searchable> {
  readonly hits: ReadonlyArray<SearchHit<T>>;
  readonly corrections: ReadonlyArray<{ from: string; to: string }>;
  readonly terms: ReadonlyArray<string>;
  // Query words that no document contains, also after typo correction.
  readonly unmatched: ReadonlyArray<string>;
  // The number of distinct query words, with the unmatched words.
  readonly words: number;
  // False when the best hit contains less than half of the query words. Such a
  // hit is often about a near topic, such as tables for a kanban board, and the
  // reader must not take it for the answer.
  readonly strong: boolean;
}

// Replaces a query word that no note contains with the closest word of the
// notes, so that a typo such as "pallete" still finds the palette note. The
// comparison uses whole words, because stems of different words can be closer
// to each other than the words are.
function correct(typed: string, vocabulary: ReadonlySet<string>): string | null {
  if (typed.length < 4) return null;
  const limit = typed.length >= 7 ? 2 : 1;
  let best: { word: string; distance: number; sameStart: boolean } | null = null;
  for (const candidate of vocabulary) {
    if (Math.abs(candidate.length - typed.length) > limit) continue;
    const distance = levenshtein(typed, candidate);
    if (distance > limit) continue;
    const sameStart = candidate[0] === typed[0];
    const better =
      best === null ||
      distance < best.distance ||
      (distance === best.distance && sameStart && !best.sameStart) ||
      (distance === best.distance && sameStart === best.sameStart && candidate < best.word);
    if (better) best = { word: candidate, distance, sameStart };
  }
  return best ? best.word : null;
}

const RELATIVE_FLOOR = 0.2;
const STRONG_COVERAGE = 0.5;

export function search<T extends Searchable>(docs: ReadonlyArray<T>, query: string, limit: number): SearchResult<T> {
  const index = indexAll(docs);
  const vocabulary = new Set(index.flatMap((entry) => [...entry.all]));
  const typedVocabulary = new Set(index.flatMap((entry) => [...entry.typed]));
  const corrections: Array<{ from: string; to: string }> = [];
  const queryTerms: string[] = [];
  const unmatched: string[] = [];
  for (const typed of new Set(words(query))) {
    const term = stem(typed);
    if (vocabulary.has(term)) {
      if (!queryTerms.includes(term)) queryTerms.push(term);
      continue;
    }
    const replacement = correct(typed, typedVocabulary);
    if (replacement) {
      corrections.push({ from: typed, to: replacement });
      const replacementTerm = stem(replacement);
      if (!queryTerms.includes(replacementTerm)) queryTerms.push(replacementTerm);
    } else {
      unmatched.push(typed);
    }
  }
  const queryWords = queryTerms.length + unmatched.length;
  if (queryTerms.length === 0) return { hits: [], corrections, terms: queryTerms, unmatched, words: queryWords, strong: false };

  const total = index.length;
  const idf = new Map<string, number>();
  for (const term of queryTerms) {
    const frequency = index.filter((entry) => entry.all.has(term)).length;
    idf.set(term, Math.log(1 + total / (1 + frequency)));
  }
  const querySet = new Set(queryTerms);

  const hits: SearchHit<T>[] = [];
  for (const entry of index) {
    let score = 0;
    let matched = 0;
    for (const term of queryTerms) {
      let termScore = 0;
      if (entry.id.has(term)) termScore += 8;
      if (entry.keywords.has(term)) termScore += 6;
      if (entry.summary.has(term)) termScore += 3;
      if (entry.title.has(term)) termScore += 3;
      if (entry.sectionTitles.has(term)) termScore += 2;
      termScore += Math.min(entry.body.get(term) ?? 0, 5) * 0.4;
      if (termScore > 0) matched += 1;
      score += termScore * idf.get(term)!;
    }
    if (matched === 0) continue;
    for (const phrase of entry.phrases) {
      if (phrase.every((word) => querySet.has(word))) score += 3 * phrase.length;
    }
    const coverage = matched / queryTerms.length;
    score *= 0.25 + 0.75 * coverage * coverage;

    const sections = entry.sections
      .map((section) => {
        let sectionScore = 0;
        for (const term of queryTerms) {
          if (section.title.has(term)) sectionScore += 3 * idf.get(term)!;
          sectionScore += Math.min(section.counts.get(term) ?? 0, 5) * 0.5 * idf.get(term)!;
        }
        return { section: section.section, sectionScore };
      })
      .filter((candidate) => candidate.sectionScore > 0)
      .sort((left, right) => right.sectionScore - left.sectionScore)
      .slice(0, 3)
      .map((candidate) => candidate.section);
    hits.push({ doc: entry.doc, score, matched, sections });
  }
  hits.sort((left, right) => right.score - left.score || left.doc.id.localeCompare(right.doc.id));
  // A hit far below the best hit matched only a common word. It costs the
  // reader a line and rarely holds the answer.
  const floor = (hits[0]?.score ?? 0) * RELATIVE_FLOOR;
  const kept = hits.filter((hit) => hit.score >= floor).slice(0, limit);
  const strong = kept.length > 0 && kept[0]!.matched >= STRONG_COVERAGE * queryWords;
  return { hits: kept, corrections, terms: queryTerms, unmatched, words: queryWords, strong };
}
