import {type Ref, ref, toValue, watch} from "vue";

export type TableState = {
  currentPage: number;
  rowsPerPage: number;
  orderBy: string;
  orderAsc: boolean;
}

export type onChangeCallback = (state: TableState) => void;

export function useTableState(initialState: TableState) {

  const state: Ref<TableState> = ref<TableState>(toValue(initialState));

  const setCurrentPage = (page: number) => {
    state.value.currentPage = page;
  }

  const setRowsPerPage = (rows: number) => {
    state.value.rowsPerPage = rows;
  }

  const setOrderBy = (orderBy: string) => {
    state.value.orderBy = orderBy;
  }

  const setOrderAsc = (orderAsc: boolean) => {
    state.value.orderAsc = orderAsc;
  }

  const setState = (newState: TableState) => {
    state.value = newState;
  }

  const updateState = (payload: Partial<TableState>) => {
    state.value = {
      ...state.value,
      ...payload,
    }
  }

  const onChange = (callback: onChangeCallback) => {
    return watch(state, () => callback(toValue(state)), { deep: true } );
  }

  return {
    state,
    onChange,
    setCurrentPage,
    setRowsPerPage,
    setOrderAsc,
    setOrderBy,
    setState,
    updateState
  };
}

