export default function sortingAlgorithm(unsortedList, sortColumn, sortDirection) {
  // Sortierung basierend auf sortColumn und sortDirection
  const sortedList = [...unsortedList].sort((a, b) => {
    const aValue = a[sortColumn] ?? ""; // Standardisieren auf "" wenn null oder undefined
    const bValue = b[sortColumn] ?? ""; // Standardisieren auf "" wenn null oder undefined

    // Leere Werte ans Ende sortieren
    if (aValue === "" && bValue !== "") return 1; // `aValue` ist leer, also nach hinten
    if (bValue === "" && aValue !== "") return -1; // `bValue` ist leer, also nach hinten

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      return sortDirection === "asc"
        ? aValue === bValue
          ? 0
          : aValue
          ? -1
          : 1
        : aValue === bValue
        ? 0
        : aValue
        ? 1
        : -1;
    }
    return 0;
  });

  return sortedList;
}