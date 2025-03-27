import {ref, toRaw} from 'vue';
import {type Schema, type Model, useVueFormGenerator} from './useVueFormGenerator.ts';

export function useVueFormGenerator(formSchema: Schema) {

    const { getFieldConfig } = useVueFormGenerator(formSchema);

    const createSearchFilters = (model: Model) => {
        const result: any = {}
        if (model !== null) {
            for (const [fieldName, fieldValue] of Object.entries(model)) {
                const fieldType = getFieldConfig(fieldName)?.type ?? null;
                if (!fieldType || fieldValue == null) {
                    continue
                }
                switch (fieldType) {
                    case 'multiselectClear':
                        if (Array.isArray(model[fieldName])) {
                            var ids = []
                            for (let value of model[fieldName]) {
                                ids.push(value['id'])
                            }
                            result[fieldName] = ids
                        } else {
                            result[fieldName] = model[fieldName]['id']
                        }
                        break;
                    default:
                        result[fieldName] = structuredClone(toRaw(model[fieldName]))
                        break;
                }
            }
        }
        return result
    }

    return { createSearchFilters }
}