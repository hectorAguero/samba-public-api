import { getSchoolById } from "../schools/model.ts";
import { getParadeData, translateParade } from "./model_utils.ts";
import type { ParadesGetRequest } from "./routes_schemas.ts";
import type { TranslatedParade } from "./schemas.ts";
import { translatedParadeSchema } from "./schemas.ts";
import { filterDataList, sortDataList } from "./model_utils.ts";

export async function getParades({
	language = "en",
	filter,
	sort = "id",
	sortOrder = "asc",
	page = 1,
	pageSize = 10,
	ids,
}: ParadesGetRequest): Promise<TranslatedParade[]> {
	const [paradeList, paradeTranslations] = await getParadeData(language, ids);
	let translatedParades = await Promise.all(
		paradeList.map((parade) =>
			translateParade(parade, paradeTranslations, language),
		),
	);
	if (filter) {
		translatedParades = filterDataList(translatedParades, filter.toString());
	}
	const sortedParades = sortDataList(translatedParades, sort, sortOrder);

	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	return sortedParades.slice(startIndex, endIndex);
}

export async function getParadeById(
	id: number,
	language: string,
): Promise<TranslatedParade | null> {
	const [paradeList, paradeTranslations] = await getParadeData(language);
	const parade = paradeList.find((p) => p.id === id);
	if (parade) {
		const translatedParade = translateParade(
			parade,
			paradeTranslations,
			language,
		);
		const school = await getSchoolById(parade.schoolId, language);

		return translatedParadeSchema.parse({ ...translatedParade, school });
	}
	return null;
}
