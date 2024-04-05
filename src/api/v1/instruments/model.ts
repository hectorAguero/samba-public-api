import {
	getInstrumentData,
	translateInstrument,
	filterDataList,
	sortDataList,
} from "./model_utils.ts";
import type { InstrumentsGetRequest } from "./routes_schemas.ts";
import {
	type TranslatedInstrument,
	translatedInstrumentSchema,
} from "./schemas.ts";

export async function getInstruments(
	namespace: KVNamespace<string> | undefined,
	imageServer: string,
	{
		language = "en",
		filter,
		sort = "name",
		sortOrder = "asc",
		page = 1,
		pageSize = 10,
	}: InstrumentsGetRequest,
): Promise<TranslatedInstrument[]> {
	const [instrumentList, instrumentTranslations] = await getInstrumentData({
		language,
		namespace,
	});
	let translatedInstruments = instrumentList.map((instrument) =>
		translateInstrument({
			instrument,
			instrumentTranslations,
			imageServer,
		}),
	);
	if (filter) {
		translatedInstruments = filterDataList(
			translatedInstruments,
			filter.toString(),
		);
	}
	const sortedInstruments = sortDataList(
		translatedInstruments,
		sort,
		sortOrder,
	);

	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	return sortedInstruments.slice(startIndex, endIndex);
}

export async function getInstrumentById({
	namespace,
	imageServer,
	id,
	language,
}: {
	namespace: KVNamespace<string> | undefined;
	imageServer: string;
	id: number;
	language: string;
}): Promise<TranslatedInstrument | null> {
	const [instrumentList, instrumentTranslations] = await getInstrumentData({
		language,
		namespace,
	});
	const instrument = instrumentList.find((p) => p.id === id);
	if (instrument) {
		const translatedInstrument = translateInstrument({
			instrument,
			instrumentTranslations,
			imageServer,
		});
		return translatedInstrumentSchema.parse({
			...translatedInstrument,
			instrument,
		});
	}
	return null;
}
