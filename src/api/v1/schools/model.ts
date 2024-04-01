import {
	getSchoolData,
	translateSchool,
	filterDataList,
	sortDataList,
} from "./model_utils.ts";
import type { SchoolsGetRequest } from "./routes_schemas.ts";
import { type TranslatedSchool, translatedSchoolSchema } from "./schemas.ts";

export async function getSchools({
	language = "en",
	filter,
	sort = "lastPosition",
	sortOrder = "asc",
	page = 1,
	pageSize = 10,
}: SchoolsGetRequest): Promise<TranslatedSchool[]> {
	const [schoolList, schoolTranslations] = await getSchoolData(language);
	let translatedSchools = schoolList.map((school) =>
		translateSchool(school, schoolTranslations),
	);
	if (filter) {
		translatedSchools = filterDataList(translatedSchools, filter.toString());
	}
	const sortedSchools = sortDataList(translatedSchools, sort, sortOrder);

	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	return sortedSchools.slice(startIndex, endIndex);
}

export async function getSchoolById(
	id: number,
	language: string,
): Promise<TranslatedSchool | null> {
	const [schoolList, schoolTranslations] = await getSchoolData(language);
	const school = schoolList.find((p) => p.id === id);
	if (school) {
		const translatedSchool = translateSchool(school, schoolTranslations);
		return translatedSchoolSchema.parse({ ...translatedSchool, school });
	}
	return null;
}
