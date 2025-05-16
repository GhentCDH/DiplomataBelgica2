import FormGeneratorFieldCreator from "@/helpers/FormGeneratorFieldCreator";
import {type Schema} from "@/composables/useVueFormGenerator";
import type {SchemaOptions} from "../Charter/CharterSearchAppForm.ts";

export const createTraditionsSchema = (schemaOptions: SchemaOptions): Schema => {
    return {
        groups: [
            {
                styleClasses: 'collapsible',
                legend: 'Repository',
                fields: [
                    FormGeneratorFieldCreator.createMultiSelect('Place',
                        {
                            model: 'repository_location'
                        }
                    ),
                    FormGeneratorFieldCreator.createMultiSelect('Name',
                        {
                            model: 'repository_name'
                        }
                    ),
                    FormGeneratorFieldCreator.createMultiSelect('Reference',
                        {
                            model: 'repository_reference_number'
                        }
                    )
                ]
            },
            {
                styleClasses: 'collapsible collapsed',
                legend: 'Tradition',
                fields: [
                    FormGeneratorFieldCreator.createMultiSelect('Type',
                        {
                            model: 'tradition_type'
                        }
                    ),
                    FormGeneratorFieldCreator.createMultiSelect('Stein Number',
                        {
                            model: 'codex_stein_number'
                        }
                    ),
                    FormGeneratorFieldCreator.createMultiSelect('Title of the manuscript',
                        {
                            model: 'codex_title'
                        }
                    ),
                    FormGeneratorFieldCreator.createMultiSelect('Institutions covered by the manuscript',
                        {
                            model: 'codex_institutions'
                        }
                    ),
                    FormGeneratorFieldCreator.createMultiSelect('Writing material',
                        {
                            model: 'codex_material'
                        }
                    )
                ]
            },
            {
                styleClasses: 'collapsible collapsed',
                legend: 'Images',
                fields: [
                    {
                        label: 'Images available',
                        type: 'checkboxBS5',
                        model: 'has_images',
                        labelClasses: 'd-none',
                    },
                ]
            },
        ],
    }
}