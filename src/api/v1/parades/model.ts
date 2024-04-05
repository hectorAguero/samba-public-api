import { getSchoolById } from "../schools/model.ts";
import { getParadeData, translateParade } from "./model_utils.ts";
import type { ParadesGetRequest } from "./routes_schemas.ts";
import type { TranslatedParade } from "./schemas.ts";
import { translatedParadeSchema } from "./schemas.ts";
import { filterDataList, sortDataList } from "./model_utils.ts";

export async function getParades(
	imageServer: string,
	namespace: KVNamespace | undefined,
	{
		language = "en",
		filter,
		sort = "id",
		sortOrder = "asc",
		page = 1,
		pageSize = 10,
	}: ParadesGetRequest,
): Promise<TranslatedParade[]> {
	const [paradeList, translations] = await getParadeData({
		language,
		namespace,
	});
	let translatedParades = await Promise.all(
		paradeList.map((parade) =>
			translateParade({
				parade,
				translations,
				language,
				imageServer,
				namespace,
			}),
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

export async function getParadeById({
	id,
	language,
	imageServer,
	namespace,
}: {
	id: number;
	language: string;
	imageServer: string;
	namespace: KVNamespace | undefined;
}): Promise<TranslatedParade | null> {
	const [paradeList, translations] = await getParadeData({
		language,
		namespace,
	});
	const parade = paradeList.find((p) => p.id === id);
	if (parade) {
		const translatedParade = await translateParade({
			parade,
			translations,
			language,
			imageServer,
			namespace,
		});
		const school = await getSchoolById({
			id: parade.schoolId,
			language,
			imageServer,
			namespace,
		});

		return translatedParadeSchema.parse({ ...translatedParade, school });
	}
	return null;
}
