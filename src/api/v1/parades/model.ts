import { ParadeByIdSelect, Parade, ParadeAllSelect, ParadeTranslated, ParadeTranslation, paradeSelectKeys, paradeTranslatedSchema } from './schemas.ts';


export const getParadeById = async (
    { id, language }: ParadeByIdSelect
): Promise<ParadeTranslated | null> => {
    console.log(id);
    const paradeFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades.jsonc`);
    const paradesTranslations = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades_translations.jsonc`);
    const paradeList: Parade[] = JSON.parse(paradeFile);
    const paradeTranslationList: ParadeTranslation[] = JSON.parse(paradesTranslations).filter((parade: ParadeTranslation) => parade.languageCode === language);
    const parade = paradeList.find((parade: Parade) => parade.id === id);
    if (!parade) return null;
    const { enredo: originalEnredo, division: originalDivision, carnivalName: originalCarnivalName, ...paradeWithoutTranslation } = parade;
    const paradeTranslation = paradeTranslationList.find((paradeTranslation: ParadeTranslation) => paradeTranslation.paradeId == parade!.id)!;
    const { languageCode: _languageCode, paradeId: _paradeId, id: _id, ...translation } = paradeTranslation!;
    return paradeTranslatedSchema.parse({
        originalCarnivalName,
        originalEnredo,
        originalDivision,
        ...paradeWithoutTranslation,
        ...translation,
    });

};

export const getParades = async (
    { language, sort, sortOrder, ...params }: ParadeAllSelect,
): Promise<ParadeTranslated[]> => {
    const paradeFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades.jsonc`);
    const paradeTranslation = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades_translations.jsonc`);
    const paradeList: Parade[] = JSON.parse(paradeFile);
    const paradeTranslationList: ParadeTranslation[] = JSON.parse(paradeTranslation).
        filter((parade: ParadeTranslation) => parade.languageCode === language);
    let dataList = paradeList.map((parade) => {
        const { enredo: originalEnredo, division: originalDivision, carnivalName: originalCarnivalName, ...paradeWithoutTranslation } = parade;
        const paradeTranslation = paradeTranslationList.find((paradeTranslation: ParadeTranslation) => paradeTranslation.paradeId === parade.id);
        const { languageCode: _languageCode, paradeId: _paradeId, id: _id, ...translation } = paradeTranslation!;
        return paradeTranslatedSchema.parse({
            originalCarnivalName,
            originalEnredo,
            originalDivision,
            ...paradeWithoutTranslation,
            ...translation,
        });
    });
    //Filtering
    dataList = filterDataList(dataList, params);
    //Sorting
    if (sort !== undefined)
        dataList = sortDataList(dataList, sort, sortOrder);
    return dataList;

};

const filterDataList = (dataList: ParadeTranslated[], params: ParadeAllSelect) => {
    for (const [key, value] of Object.entries(params)) {
        if (key === paradeSelectKeys.championParade && value !== undefined) {
            dataList = dataList.filter(({ championParade }) => value === 1 ? championParade !== null : championParade === null);
        } else if (key === paradeSelectKeys.components) {
            const dataArray = (value.toString()).split(',').map((value) => parseInt(value));
            dataList = dataList.filter(({ components }) => {
                if (dataArray.length >= 2)
                    return components >= dataArray[0]
                        && components <= dataArray[1]
                else return components >= dataArray[0];
            });
        } else {
            dataList = dataList.filter((parade) => parade[key as keyof Parade] === value);
        }
    }
    return dataList;
}


const sortDataList = (dataList: ParadeTranslated[], sort: string, sortOrder: string | undefined) => {
    //Sorting in wich the sort parameter is the key from the object to sort
    if (sort !== null && dataList.length > 0) {
        dataList = dataList.sort((a, b) => {
            if (sortOrder !== 'undefined' && sortOrder === 'desc') return a[sort as keyof Parade]! < b[sort as keyof Parade]! ? 1 : -1;
            else return a[sort as keyof Parade]! > b[sort as keyof Parade]! ? 1 : -1;
        });
    }
    return dataList;
}