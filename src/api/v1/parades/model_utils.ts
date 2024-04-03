
import { getSchoolById } from "../schools/model.ts";
import type { Parade, ParadeTranslation, TranslatedParade } from "./schemas.ts";
import { translatedParadeSchema } from './schemas.ts';

export async function getParadeData(
	language: string,
): Promise<[Parade[], ParadeTranslation[]]> {
	const paradeFilePath = `${Deno.cwd()}/assets/static/json/parades.jsonc`;
	const translationFilePath = `${Deno.cwd()}/assets/static/json/parades_translations.jsonc`;

	const paradeFileContents = await Deno.readTextFile(paradeFilePath);
	const translationFileContents = await Deno.readTextFile(translationFilePath);

	const paradeList: Parade[] = JSON.parse(paradeFileContents);
	const paradeTranslations: ParadeTranslation[] = JSON.parse(
		translationFileContents,
	);

	const filteredTranslations = paradeTranslations.filter(
		(translation) => translation.languageCode === language,
	);

	return [paradeList, filteredTranslations];
}

export async function translateParade(
	parade: Parade,
	translations: ParadeTranslation[],
	language: string,
): Promise<TranslatedParade> {
	const translation = translations.find((t) => t.paradeId === parade.id) || {};
	const school = await getSchoolById(parade.schoolId, language);

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
