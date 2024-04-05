import type { Context } from "hono";
import {
	getSchoolData,
	translateSchool,
	filterDataList,
	sortDataList,
} from "./model_utils.ts";
import type { SchoolsGetRequest } from "./routes_schemas.ts";
import { type TranslatedSchool, translatedSchoolSchema } from "./schemas.ts";

export async function getSchools(
	namespace: KVNamespace<string> | undefined,
	imageServer: string,
	{
		language = "en",
		filter,
		sort = "lastPosition",
		sortOrder = "asc",
		page = 1,
		pageSize = 10,
	}: SchoolsGetRequest,
): Promise<TranslatedSchool[]> {
	console.log("getSchools", namespace);
	const [schoolList, translations] = await getSchoolData({
		language,
		namespace,
	});
	let translatedSchools = schoolList.map((school) =>
		translateSchool({ school, translations, imageServer }),
	);
	if (filter) {
		translatedSchools = filterDataList(translatedSchools, filter.toString());
	}
	const sortedSchools = sortDataList(translatedSchools, sort, sortOrder);

	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	return sortedSchools.slice(startIndex, endIndex);
}

export async function getSchoolById({
	id,
	language,
	imageServer,
	namespace,
}: {
	id: number;
	language: string;
	imageServer: string;
	namespace: KVNamespace<string> | undefined;
}): Promise<TranslatedSchool | null> {
	const [schoolList, translations] = await getSchoolData({
		language,
		namespace,
	});
	const school = schoolList.find((p) => p.id === id);
	if (school) {
		const translatedSchool = translateSchool({
			school,
			translations,
			imageServer,
		});
		return translatedSchoolSchema.parse({ ...translatedSchool, school });
	}
	return null;
}
