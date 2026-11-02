/** Admin-created directions remain navigable before their first artwork is added. */
export function visibleGalleryCategories<T extends { key: string; parent_key: string | null }>(
  categories: T[],
  works: { category_key: string }[],
): T[] {
  return categories.filter(category => !category.parent_key && (
    category.key !== "new" || works.some(work => work.category_key === category.key)
  ));
}