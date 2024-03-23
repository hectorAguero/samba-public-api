import { getSchoolById } from "../schools/model.ts";
import { type Parade, type ParadeAllSelect, type ParadeTranslated, type ParadeTranslation, paradeTranslatedSchema } from './schemas.ts';

export const getParades = async (
    { language, ...query }: ParadeAllSelect,
): Promise<ParadeTranslated[]> => {
    const paradeFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades.jsonc`);
    const paradeTranslation = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades_translations.jsonc`);
    const paradeList: Parade[] = JSON.parse(paradeFile);
    const paradeTranslationList: ParadeTranslation[] = JSON.parse(paradeTranslation).
        filter((parade: ParadeTranslation) => parade.languageCode === language);
    let dataList = paradeList.map((parade) => {
        const { enredo: originalEnredo, division: originalDivision, carnivalName: originalCarnivalName, ...paradeWithoutTranslation } = parade;
        const paradeTranslation = paradeTranslationList.find((paradeTranslation: ParadeTranslation) => paradeTranslation.paradeId === parade.id);
        let translation = {};
        if (paradeTranslation) {
            console.log(paradeTranslation);
            const { languageCode: _languageCode, paradeId: _paradeId, id: _id, ...fields } = paradeTranslation;
            translation = fields;
        }
        const objectToValidate = {
            originalCarnivalName,
            originalEnredo,
            originalDivision,
            ...paradeWithoutTranslation,
            ...translation,
        };
        console.log(objectToValidate);
        return paradeTranslatedSchema.parse(objectToValidate);
    });
    //Filtering
    if (query.filter !== undefined)
        dataList = filterDataList(dataList, query.filter.toString());
    //Sorting
    if (query.sort !== undefined || query.sortOrder !== undefined) {
        query.sort ??= 'id';
        query.sortOrder ??= 'asc';
        dataList = sortDataList(dataList, query.sort, query.sortOrder);
    }
    //Pagination
    if (query.page !== undefined || query.pageSize !== undefined) {
        query.page ??= 1;
        query.pageSize ??= 10;
        dataList = dataList.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
    }
    return dataList;

};

const filterDataList = (dataList: ParadeTranslated[], filters: string) => {
    // Construct filters from the input string
    const filter = filters.split(';').map(filter => {
        const [key, value] = filter.split('=');
        return { key, value };
    });

    let dataListFiltered = dataList;

    // Apply each filter to the dataList
    for (const { key, value } of filter) {
        const lookUpValue = value?.trim().toLocaleUpperCase();

        dataListFiltered = dataListFiltered.filter((parade: ParadeTranslated) => {
            const paradeValue = parade[key as keyof ParadeTranslated];

            // Check for array values and match any of the array elements
            if (Array.isArray(paradeValue)) {
                return lookUpValue?.split(',').every(lookUpItem =>
                    paradeValue.some(item => item.toLocaleUpperCase().includes(lookUpItem.trim()))
                );
            }

            // Direct string comparison, case-insensitive
            if (typeof paradeValue === 'string') {
                return paradeValue.toLocaleUpperCase().includes(lookUpValue);
            }

            // Number filtering, supports ranges or single value match
            if (typeof paradeValue === 'number') {
                if (value.includes(',')) {
                    const [min, max] = value.split(',');
                    return paradeValue >= Number(min) && paradeValue <= Number(max);
                }
                return paradeValue === Number(value);
            }

            // Handle null or undefined fields, considering 'NULL' or empty as valid filters
            if (paradeValue === null || paradeValue === undefined) {
                return lookUpValue === 'NULL' || lookUpValue === '';
            }

            return false;
        });
    }

    return dataListFiltered;
}

const sortDataList = (dataList: ParadeTranslated[], sort: string, sort_order: string | undefined) => {
    //Sorting in wich the sort parameter is the key from the object to sort
    if (sort !== null && dataList.length > 0) {
        return dataList.sort((a, b) => {
            if (sort_order !== 'undefined' && sort_order === 'desc') return (a[sort as keyof Parade] ?? 0) < (b[sort as keyof Parade] ?? 0) ? 1 : -1;
            return (a[sort as keyof Parade] ?? 0) > (b[sort as keyof Parade] ?? 0) ? 1 : -1;
        });
    }
    return dataList;
}


export const getParadeById = async (
    id: number,
    language: string,
): Promise<ParadeTranslated | null> => {
    const paradeFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades.jsonc`);
    const paradesTranslations = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades_translations.jsonc`);
    const paradeList: Parade[] = JSON.parse(paradeFile);
    const paradeTranslationList: ParadeTranslation[] = JSON.parse(paradesTranslations).filter((parade: ParadeTranslation) => parade.languageCode === language);
    const parade = paradeList.find((parade: Parade) => parade.id === id);
    if (!parade) return null;
    const { enredo: originalEnredo, division: originalDivision, carnivalName: originalCarnivalName, ...paradeWithoutTranslation } = parade;
    const paradeTranslation = paradeTranslationList.find((paradeTranslation: ParadeTranslation) => paradeTranslation.paradeId === parade.id);
    let translation = {};
    if (paradeTranslation) {
        const { languageCode: _languageCode, paradeId: _paradeId, id: _id, ...fields } = paradeTranslation;
        translation = fields;
    }
    const school = await getSchoolById(parade.schoolId, language);
    return paradeTranslatedSchema.parse({
        originalCarnivalName,
        originalEnredo,
        originalDivision,
        school: school,
        ...paradeWithoutTranslation,
        ...translation,
    });

};