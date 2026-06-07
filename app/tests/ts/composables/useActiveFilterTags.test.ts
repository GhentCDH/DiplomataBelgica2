import {describe, it, expect} from 'vitest';
import {ref} from 'vue';
import {useActiveFilterTags} from "@/composables/useActiveFilterTags";
import type {Field, Model} from "../../../assets/js/composables/useVueFormGenerator";

describe('Test useActiveFilterTags composable', () => {

    const fields: Record<string, Field> = {
        summary: {model: 'summary', type: 'input', label: 'Summary'},
    };
    const getFieldConfig = (key: string): Field => fields[key] ?? null;

    it('builds a tag for a known field', () => {
        const model = ref<Model>({summary: 'charter'});
        const {activeFilterTags} = useActiveFilterTags(model, getFieldConfig);

        const tags = activeFilterTags.value;
        expect(tags).toHaveLength(1);
        expect(tags[0].key).toBe('summary');
        expect(tags[0].value).toBe('charter');
    });

    it('does not crash when the model contains a key absent from the schema', () => {
        // e.g. an extra filter passed through the URL (extended_place_info=true)
        const model = ref<Model>({summary: 'charter', extended_place_info: true});
        const {activeFilterTags} = useActiveFilterTags(model, getFieldConfig);

        let tags;
        expect(() => {
            tags = activeFilterTags.value;
        }).not.toThrow();
        // the unknown key is skipped, only the known field becomes a tag
        expect(tags).toHaveLength(1);
        expect(tags[0].key).toBe('summary');
    });
});
