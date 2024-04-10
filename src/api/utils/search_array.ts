export function searchItems<T extends object>(
	items: T[],
	query: string,
	fields: { [key: string]: number },
): T[] {
	const normalizeText = (text: string) =>
		text
			.normalize("NFD")
			.replace(/\p{Mn}/gu, "")
			.toLowerCase();

	const queryLower = normalizeText(query);

	return items
		.map((item) => {
			let score = 0;
			for (const [path, weight] of Object.entries(fields)) {
				const value = getNestedValue(item, path);
				if (normalizeText(value).includes(queryLower)) {
					score += weight;
				}
			}
			return { item, score };
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score)
		.map(({ item }) => item);
}

// Definir una función genérica para obtener valores anidados
function getNestedValue<T extends object>(obj: T, path: string): string {
	const keys = path.split(".");
	let result: unknown = obj;

	for (const key of keys) {
		if (result && typeof result === "object") {
			result = (result as Record<string, unknown>)[key];
		} else {
			return "";
		}
	}

	return result === undefined || result === null ? "" : String(result);
}
