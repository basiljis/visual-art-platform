type OrderedRow = { id: string; sort: number };

// Replace only the selected scope's slots; unrelated rows retain their positions.
export function reorderScope<T extends OrderedRow>(rows: T[], scopeIds: string[], activeId: string, overId: string): T[] {
  const from = scopeIds.indexOf(activeId);
  const to = scopeIds.indexOf(overId);
  if (from < 0 || to < 0 || from === to) return rows;
  const ids = [...scopeIds];
  ids.splice(from, 1);
  ids.splice(to, 0, activeId);
  const byId = new Map(rows.map((row) => [row.id, row]));
  const scope = new Set(scopeIds);
  let cursor = 0;
  return rows.map((row, index) => {
    const replacement = scope.has(row.id) ? byId.get(ids[cursor++] ?? "") ?? row : row;
    return { ...replacement, sort: index + 1 };
  });
}