import {useSimpleState} from "./useSimpleState.ts";

/**
 * Manage the set of selected row ids ("items basket") for a search page.
 *
 * This is a pure id-set: it has no knowledge of the result rows or their id
 * property. The result table decides which ids to add or remove (it knows which
 * rows are on the page and which are selected) and calls `addSelectedIds` /
 * `removeSelectedIds`. That keeps the basket decoupled from result data and
 * trivial to reuse and test.
 *
 * @param initialIds ids selected from the start (default none)
 */
export function useItemsBasket(initialIds: number[] = []) {

    const {state: selectedIds, setState: setSelectedIds} = useSimpleState<number[]>(initialIds);

    /** Add the given ids to the selection (union, kept sorted). */
    function addSelectedIds(ids: number[]) {
        setSelectedIds([...new Set([...selectedIds.value, ...ids])].sort((a, b) => a - b));
    }

    /** Remove the given ids from the selection. */
    function removeSelectedIds(ids: number[]) {
        const toRemove = new Set(ids);
        setSelectedIds(selectedIds.value.filter((id) => !toRemove.has(id)));
    }

    /** Remove the selected id at the given position (used by the basket dropdown). */
    function removeSelectedIndex(index: number) {
        selectedIds.value.splice(index, 1);
    }

    return {
        selectedIds,
        setSelectedIds,
        addSelectedIds,
        removeSelectedIds,
        removeSelectedIndex,
    }
}
