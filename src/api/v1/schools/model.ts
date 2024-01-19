import { School, SchoolAllSelect, SchoolTranslated, SchoolTranslation } from './schemas.ts';



export const getSchools = async (
    { language, sort, sortOrder, ...query }: SchoolAllSelect,
): Promise<SchoolTranslated[]> => {
    const schoolFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools.jsonc`);
    const schoolTranslation = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools_translations.jsonc`);
    const schoolList: School[] = JSON.parse(schoolFile);
    const schoolTranslationList: SchoolTranslation[] = JSON.parse(schoolTranslation).filter((school: SchoolTranslation) => school.languageCode === language);
    let data = schoolList.map((school: School) => {
        const schoolTranslation = schoolTranslationList.find((schoolTranslation: SchoolTranslation) => schoolTranslation.schoolId === school.id);
        const { languageCode: _languageCode, schoolId: _schoolId, id: _id, ...translation } = schoolTranslation!;
        return {
            ...school,
            ...translation
        };
    });

    if (sort !== undefined || sortOrder !== undefined) {
        sort ??= 'id';
        sortOrder ??= 'asc';
        data = data.sort((a: SchoolTranslated, b: SchoolTranslated) => {
            if (sortOrder === 'asc') return a[sort as keyof SchoolTranslated] > b[sort as keyof SchoolTranslated] ? 1 : -1;
            return a[sort as keyof SchoolTranslated] < b[sort as keyof SchoolTranslated] ? 1 : -1;
        });
    }

    if (query.filter !== undefined) {
        const filter = query.filter.toString().split(';').map((filter: string) => { // Explicitly specify the type of the parameter
            const [key, value] = filter.split('=');
            return { key, value };
        });
        for (const { key, value } of filter) {
            const lookUpValue = value?.trim().toLocaleUpperCase();
            data = data.filter((school: SchoolTranslated) => {
                const schoolValue = school[key as keyof SchoolTranslated];
                if (Array.isArray(schoolValue)) {
                    const array = schoolValue as string[];
                    return lookUpValue.split(',').every((lookUpItem) => {
                        lookUpItem = lookUpItem.trim();
                        return array.some((item) => item.toLocaleUpperCase().includes(lookUpItem));
                    });
                }
                if (typeof schoolValue === 'string') {
                    return (schoolValue as string).toLocaleUpperCase().includes(lookUpValue);
                }
                if (typeof schoolValue === 'number') {
                    return schoolValue === Number(value);
                }
                return false;
            });
        };
    }
    if (query.page !== undefined) {
        if (query.pageSize === undefined) query.pageSize = 10;
        data = data.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
    }

    return data;
};

export const getSchoolById = async (
    id: number,
    language: string,
): Promise<SchoolTranslated | null> => {
    const schoolFile = await Deno.readTextFile(`${Deno.cwd()} / assets / static / json / schools.jsonc`);
    const schoolsTranslations = await Deno.readTextFile(`${Deno.cwd()} / assets / static / json / schools_translations.jsonc`);
    const schoolList: School[] = JSON.parse(schoolFile);
    const schoolTranslationList: SchoolTranslation[] = JSON.parse(schoolsTranslations).filter((school: SchoolTranslation) => school.languageCode === language);
    const school = schoolList.find((school: School) => school.id === id);
    if (!school) return null;
    const schoolTranslation = schoolTranslationList.find((schoolTranslation: SchoolTranslation) => schoolTranslation.schoolId == school!.id)!;
    const { languageCode: _languageCode, schoolId: _schoolId, id: _id, ...translation } = schoolTranslation!;
    return {
        ...school,
        ...translation,
    };
};