export type CellValue = string | number | boolean | null;

export type RowData = Record<string, CellValue>;

export type FieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "boolean"
  | "select";

export type TableAction =
  | "view"
  | "add"
  | "edit"
  | "delete"
  | "copy"
  | "calculate"
  | "save";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface ColumnSchema {
  field: string;
  label: string;
  type: FieldType;

  visible?: boolean;
  editable?: boolean;
  required?: boolean;

  /**
   * Dùng cho type="select"
   */
  options?: SelectOption[];

  /**
   * Cột có được tính tổng hay không
   */
  sum?: boolean;
}

export interface TableSchema {
  title: string;
  primaryKey: string;
  columns: ColumnSchema[];
  actions: TableAction[];
}