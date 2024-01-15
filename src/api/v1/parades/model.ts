import { Parade, ParadeTranslated, ParadeTranslation, paradeTranslatedSchema } from './schemas.ts';


export const getParades = async (
    language: string,
): Promise<ParadeTranslated[]> => {
    const paradeFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades.jsonc`);
    const paradeTranslation = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/parades_translations.jsonc`);
    const paradeList: Parade[] = JSON.parse(paradeFile);
    const paradeTranslationList: ParadeTranslation[] = JSON.parse(paradeTranslation).filter((parade: ParadeTranslation) => parade.languageCode === language);
    return paradeList.map((parade) => {
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
};

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
    const paradeTranslation = paradeTranslationList.find((paradeTranslation: ParadeTranslation) => paradeTranslation.paradeId == parade!.id)!;
    const { languageCode: _languageCode, paradeId: _paradeId, id: _id, ...translation } = paradeTranslation!;
    //Sort the json by keys
    return <ParadeTranslated>{
        originalCarnivalName,
        originalEnredo,
        originalDivision,
        ...paradeWithoutTranslation,
        ...translation,
    }


};