import {inject, type InjectionKey} from "vue";

/**
 * PrimeVue-style "pass-through" theming for the b-* components.
 *
 * Every component ships its Bootstrap 5 classes as a built-in `defaultPt`, but
 * each sub-element's class can be overridden from a single global object
 * (provided once at the app root) and/or per instance via a `pt` prop.
 *
 * Resolution precedence per element: instance `pt` -> global `pt` -> default -> ''.
 *
 * App-wide (e.g. to theme a legacy Bootstrap 3 app):
 *   app.provide(BOOTSTRAP_PT_KEY, bootstrap3Pt)
 *
 * Scope: class strings only. Structural differences (e.g. the dropdown toggle's
 * data-attributes, or Bootstrap 3's close-button `×` glyph) are NOT handled here.
 */

/** element key -> class string, for one component. */
export type ComponentPt = Record<string, string>;
/** component name -> its element class overrides. */
export type BootstrapPt = Record<string, ComponentPt>;

export const BOOTSTRAP_PT_KEY: InjectionKey<BootstrapPt> = Symbol("bootstrapPt");

/**
 * Pure class resolver (instance > global > default > ''). Kept separate from the
 * inject wrapper so it can be unit-tested without a component context.
 */
export function resolvePt(
    element: string,
    defaultPt: ComponentPt,
    globalPt?: ComponentPt,
    instancePt?: ComponentPt,
): string {
    return instancePt?.[element]
        ?? globalPt?.[element]
        ?? defaultPt[element]
        ?? "";
}

/**
 * Returns a `ptClass(element)` resolver for a component.
 * @param component  the component's key in the global pt object (e.g. 'pagination')
 * @param defaultPt  the component's built-in Bootstrap 5 classes
 * @param getInstancePt getter for the instance-level `pt` prop (read lazily so it stays reactive)
 */
export function usePassThrough(
    component: string,
    defaultPt: ComponentPt,
    getInstancePt: () => ComponentPt | undefined = () => undefined,
) {
    const globalPt = inject(BOOTSTRAP_PT_KEY, {} as BootstrapPt);
    return (element: string): string =>
        resolvePt(element, defaultPt, globalPt[component], getInstancePt());
}

/**
 * Starter Bootstrap 3 preset (classes only). Provide it at the app root to
 * re-theme every b-* component:  app.provide(BOOTSTRAP_PT_KEY, bootstrap3Pt)
 *
 * NB: this only swaps classes. Bootstrap 3 also needs the dropdown to use
 * `data-toggle="dropdown"` (vs BS5 `data-bs-toggle`) and a literal `×` in the
 * close button — those structural bits are the consuming app's responsibility.
 */
export const bootstrap3Pt: BootstrapPt = {
    pagination: {list: "pagination", item: "", link: "", active: "active", disabled: "disabled"},
    select: {select: "form-control"},
    dropdown: {wrapper: "dropdown", toggle: "btn btn-default dropdown-toggle", menu: "dropdown-menu"},
    filterTags: {container: "tag-list", tag: "label label-default", close: "close"},
    radioList: {group: "radio", input: "", label: ""},
    table: {table: "table"},
};
