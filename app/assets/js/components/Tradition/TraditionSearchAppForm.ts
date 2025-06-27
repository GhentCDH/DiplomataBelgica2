import FormGeneratorFieldCreator from "@/helpers/FormGeneratorFieldCreator";
import {type Schema} from "../../composables/useVueFormGenerator";
import type {SchemaOptions} from "../Charter/CharterSearchAppForm.ts";

export const createTraditionsSchema = (schemaOptions: SchemaOptions): Schema => {

    const {t, onAutocomplete} = schemaOptions

    return {
        groups: [
            {
                styleClasses: 'collapsible',
                legend: t("traditions.form.legend.repository"),
                fields: [
                    FormGeneratorFieldCreator.createMultiSelect(t("traditions.form.field.place.label"),
                        {
                            model: 'repository_location',
                            placeholder: t("traditions.form.field.place.placeholder"),
                            help: t("traditions.form.field.place.help"),
                        }
                    ),
                    FormGeneratorFieldCreator.createMultiSelect(t("traditions.form.field.name.label"),
                        {
                            model: 'repository_name',
                            placeholder: t("traditions.form.field.name.placeholder"),
                            help: t("traditions.form.field.name.help"),
                        }
                    ),
                    FormGeneratorFieldCreator.createMultiSelect(t("traditions.form.field.reference.label"),
                        {
                            model: 'repository_reference_number',
                            placeholder: t("traditions.form.field.reference.placeholder"),
                            help: t("traditions.form.field.reference.help"),
                        }
                    )
                ]
            },
            {
                styleClasses: 'collapsible collapsed',
                legend: t("traditions.form.legend.tradition"),
                fields: [
                    FormGeneratorFieldCreator.createMultiSelect(t("traditions.form.field.type.label"),
                        {
                            model: 'tradition_type',
                            placeholder: t("traditions.form.field.type.placeholder"),
                            help: t("traditions.form.field.type.help"),
                        }
                    ),
                    FormGeneratorFieldCreator.createMultiSelect(t("traditions.form.field.steinNumber.label"),
                        {
                            model: 'codex_stein_number',
                            placeholder: t("traditions.form.field.steinNumber.placeholder"),
                            help: t("traditions.form.field.steinNumber.help"),
                        }
                    ),
                    FormGeneratorFieldCreator.createMultiSelect(t("traditions.form.field.titleOfTheManuscript.label"),
                        {
                            model: 'codex_title',
                            placeholder: t("traditions.form.field.titleOfTheManuscript.placeholder"),
                            help: t("traditions.form.field.titleOfTheManuscript.help"),
                        }
                    ),
                    FormGeneratorFieldCreator.createMultiSelect(t("traditions.form.field.institutionsCoveredByTheManuscript.label"),
                        {
                            model: 'codex_institutions',
                            placeholder: t("traditions.form.field.institutionsCoveredByTheManuscript.placeholder"),
                            help: t("traditions.form.field.institutionsCoveredByTheManuscript.help"),
                        }
                    ),
                    FormGeneratorFieldCreator.createMultiSelect(t("traditions.form.field.writingMaterial.label"),
                        {
                            model: 'codex_material',
                            placeholder: t("traditions.form.field.writingMaterial.placeholder"),
                            help: t("traditions.form.field.writingMaterial.help"),
                        }
                    )
                ]
            },
            {
                styleClasses: 'collapsible collapsed',
                legend: t("traditions.form.legend.images"),
                fields: [
                    {
                        label: 'Images available',
                        help: t("traditions.form.field.hasImages.help"),
                        type: 'checkboxBS5',
                        model: 'has_images',
                        labelClasses: 'd-none',
                    },
                ]
            },
        ],
    }
}