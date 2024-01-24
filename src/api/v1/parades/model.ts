import { getSchoolById } from "../schools/model.ts";
import { Parade, ParadeAllSelect, ParadeTranslated, ParadeTranslation, paradeTranslatedSchema } from './schemas.ts';

export const getParades = async (
    { language, ...query }: ParadeAllSelect,
): Promise<ParadeTranslated[]> => {
    const paradeFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades.jsonc`);
    const paradeTranslation = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades_translations.jsonc`);
    const paradeList: Parade[] = JSON.parse(paradeFile);
    const paradeTranslationList: ParadeTranslation[] = JSON.parse(paradeTranslation).
        filter((parade: ParadeTranslation) => parade.language_code === language);
    let dataList = paradeList.map((parade) => {
        const { enredo: originalEnredo, division: originalDivision, carnival_name: originalcarnival_name, ...paradeWithoutTranslation } = parade;
        const paradeTranslation = paradeTranslationList.find((paradeTranslation: ParadeTranslation) => paradeTranslation.paradeId === parade.id);
        const { language_code: _language_code, paradeId: _paradeId, id: _id, ...translation } = paradeTranslation!;
        return paradeTranslatedSchema.parse({
            originalcarnival_name,
            originalEnredo,
            originalDivision,
            ...paradeWithoutTranslation,
            ...translation,
        });
    });
    //Filtering
    if (query.filter !== undefined)
        dataList = filterDataList(dataList, query.filter.toString());
    //Sorting
    if (query.sort !== undefined || query.sort_order !== undefined) {
        query.sort ??= 'id';
        query.sort_order ??= 'asc';
        dataList = sortDataList(dataList, query.sort, query.sort_order);
    }
    //Pagination
    if (query.page !== undefined || query.page_size !== undefined) {
        query.page ??= 1;
        query.page_size ??= 10;
        dataList = dataList.slice((query.page - 1) * query.page_size, query.page * query.page_size);
    }
    return dataList;

};

const filterDataList = (dataList: ParadeTranslated[], filters: string) => {
    const filter = filters.split(';').map((filter) => {
        const [key, value] = filter.split('=');
        return { key, value };
    });
    for (const { key, value } of filter) {
        const lookUpValue = value?.trim().toLocaleUpperCase();
        dataList = dataList.filter((parade: ParadeTranslated) => {
            const paradeValue = parade[key as keyof ParadeTranslated];
            if (Array.isArray(paradeValue)) {
                const array = paradeValue as string[];
                return lookUpValue?.split(',').every((lookUpItem) => {
                    lookUpItem = lookUpItem.trim();
                    return array.some((item) => item.toLocaleUpperCase().includes(lookUpItem));
                });
            }
            else if (typeof paradeValue === 'string' && typeof lookUpValue === 'string') {
                return paradeValue.toLocaleUpperCase().includes(lookUpValue);
            }
            else if (typeof paradeValue === 'number' && typeof lookUpValue === 'string') {
                if (value.includes(',')) {
                    const [min, max] = value.split(',');
                    return paradeValue >= Number(min) && paradeValue <= Number(max);
                }
                return paradeValue === Number(value);
            }
            else if (paradeValue === null || paradeValue === undefined) {
                if (lookUpValue === 'NULL' || lookUpValue == '') return true
            }

            return false;
        });
    };
    return dataList;
}


const sortDataList = (dataList: ParadeTranslated[], sort: string, sort_order: string | undefined) => {
    //Sorting in wich the sort parameter is the key from the object to sort
    if (sort !== null && dataList.length > 0) {
        dataList = dataList.sort((a, b) => {
            if (sort_order !== 'undefined' && sort_order === 'desc') return a[sort as keyof Parade]! < b[sort as keyof Parade]! ? 1 : -1;
            else return a[sort as keyof Parade]! > b[sort as keyof Parade]! ? 1 : -1;
        });
    }
    return dataList;
}


export const getParadeById = async (
    id: number,
    language: string,
): Promise<ParadeTranslated | null> => {
    console.log(id);
    const paradeFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades.jsonc`);
    const paradesTranslations = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades_translations.jsonc`);
    const paradeList: Parade[] = JSON.parse(paradeFile);
    const paradeTranslationList: ParadeTranslation[] = JSON.parse(paradesTranslations).filter((parade: ParadeTranslation) => parade.language_code === language);
    const parade = paradeList.find((parade: Parade) => parade.id === id);
    if (!parade) return null;
    const { enredo: originalEnredo, division: originalDivision, carnival_name: originalcarnival_name, ...paradeWithoutTranslation } = parade;
    const paradeTranslation = paradeTranslationList.find((paradeTranslation: ParadeTranslation) => paradeTranslation.paradeId == parade!.id)!;
    const { language_code: _language_code, paradeId: _paradeId, id: _id, ...translation } = paradeTranslation!;
    const school = await getSchoolById(parade.school_id, language);
    return paradeTranslatedSchema.parse({
        originalcarnival_name,
        originalEnredo,
        originalDivision,
        school: school,
        ...paradeWithoutTranslation,
        ...translation,
    });

};