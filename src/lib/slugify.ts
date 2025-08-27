export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яёіїѝъ\s-]/gi, "") // маха всички символи, които не са букви/цифри/тирета/интервали
    .replace(/\s+/g, "-")                  // заменя интервали с тирета
    .replace(/-+/g, "-")                    // маха двойни тирета
}
