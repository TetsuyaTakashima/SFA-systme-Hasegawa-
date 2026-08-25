export function resolveImportPrefecture(csvPrefecture: string, selectedPrefecture?: string) {
  return selectedPrefecture?.trim() || csvPrefecture.trim();
}
