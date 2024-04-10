import {
	getSchoolData,
	translateSchool,
	filterDataList,
	sortDataList,
	schoolSearchWeights,
} from "./model_utils.ts";
import type {
	SchoolsGetRequest,
	SchoolsSearchRequest,
} from "./routes_schemas.ts";
import {
	type TranslatedSchool,
	translatedSchoolSchema,
	type School,
} from "./schemas.ts";
import { searchItems } from "../../utils/search_array.ts";

export async function getSchools({
	language = "en",
	filter,
	sort = "lastPosition",
	sortOrder = "asc",
	page = 1,
	pageSize = 10,
	ids,
}: SchoolsGetRequest): Promise<TranslatedSchool[]> {
	const [schoolList, schoolTranslations] = await getSchoolData(language, ids);
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

export async function searchSchools({
	language = "en",
	search,
	filter,
	sort = "lastPosition",
	sortOrder = "asc",
	page = 1,
	pageSize = 10,
}: SchoolsSearchRequest): Promise<TranslatedSchool[]> {
	const [schools, schoolTranslations] = await getSchoolData(language);
	const translatedSchools = schools.map((school: School) =>
		translateSchool(school, schoolTranslations),
	);

	let results = searchItems<TranslatedSchool>(
		translatedSchools,
		search,
		schoolSearchWeights,
	);

	if (filter) {
		results = filterDataList(results, filter.toString());
	}
	results = sortDataList(results, sort, sortOrder);
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	return results.slice(startIndex, endIndex);
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
