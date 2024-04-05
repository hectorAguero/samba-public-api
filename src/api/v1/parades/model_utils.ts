import { getSchoolById } from "../schools/model.ts";
import { bufferToJSON, getKVAsset } from "../workers_util.ts";
import type { Parade, ParadeTranslation, TranslatedParade } from "./schemas.ts";
import { translatedParadeSchema } from "./schemas.ts";

export async function getParadeData({
	language,
	namespace,
}: { language: string; namespace: KVNamespace | undefined }): Promise<
	[Parade[], ParadeTranslation[]]
> {
	const paradeFilePath = "static/json/parades.jsonc";
	const translationFilePath = "static/json/parades_translations.jsonc";
	const paradeFile = await getKVAsset(paradeFilePath, { namespace });
	const translationFile = await getKVAsset(translationFilePath, { namespace });
	if (!paradeFile || !translationFile) {
		throw new Error("Failed to fetch data");
	}
	const paradeList: Parade[] = await bufferToJSON(paradeFile);
	const translatations: ParadeTranslation[] =
		await bufferToJSON(translationFile);

	const filteredTranslations = translatations.filter(
		(translation) => translation.languageCode === language,
	);
	return [paradeList, filteredTranslations];
}

export async function translateParade({
	parade,
	translations,
	language,
	imageServer,
	namespace,
}: {
	parade: Parade;
	translations: ParadeTranslation[];
	language: string;
	imageServer: string;
	namespace: KVNamespace | undefined;
}): Promise<TranslatedParade> {
	const translation = translations.find((t) => t.paradeId === parade.id) || {};
	const school = await getSchoolById({
		id: parade.schoolId,
		language,
		imageServer,
		namespace,
	});
	return translatedParadeSchema.parse({
		...translation,
		...parade,
		translatedCarnivalName: parade.carnivalName,
		translatedEnredo: parade.enredo,
		translatedDivision: parade.division,
		translatedCarnavalescos: parade.carnavalescos,
		school: school,
	});
}

export const sortDataList = (
	dataList: TranslatedParade[],
	sortBy: string,
	sortOrder: string,
) => {
	const sortOrderDirection = sortOrder === "desc" ? -1 : 1;

	return dataList.sort((prevParade, nextParade) => {
		const previous = prevParade[sortBy as keyof TranslatedParade] ?? 0;
		const next = nextParade[sortBy as keyof TranslatedParade] ?? 0;
		return (previous > next ? 1 : -1) * sortOrderDirection;
	});
};

export const filterDataList = (
	dataList: TranslatedParade[],
	filters: string,
) => {
	const parsedFilters = filters.split(";").map((filterPart) => {
		const [key, value] = filterPart.split("=").map((s) => s.trim());
		return { key, value };
	});

	return dataList.filter((parade) => {
		return parsedFilters.every(({ key, value }) => {
			const paradeValue = parade[key as keyof TranslatedParade];
			const lookUpValue = value.toUpperCase();

			if (Array.isArray(paradeValue)) {
				return value
					.split(",")
					.every((val) =>
						paradeValue
							.map(String)
							.some((item) =>
								item.toUpperCase().includes(val.trim().toUpperCase()),
							),
					);
			}
			if (typeof paradeValue === "string") {
				return paradeValue.toUpperCase().includes(lookUpValue);
			}
			if (typeof paradeValue === "number") {
				if (value.includes(",")) {
					const [min, max] = value.split(",").map(Number);
					return paradeValue >= min && paradeValue <= max;
				}
				return paradeValue === Number(value);
			}
			return (
				lookUpValue === "NULL" || (lookUpValue === "" && paradeValue == null)
			);
		});
	});
};
