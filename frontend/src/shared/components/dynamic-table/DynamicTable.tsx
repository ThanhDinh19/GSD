import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import type {
  CellValue,
  ColumnSchema,
  RowData,
  TableAction,
  TableSchema,
} from "./types";

import "./DynamicTable.css";

interface DynamicTableProps {
  schema: TableSchema;
  data: RowData[];

  /**
   * Được gọi khi người dùng bấm "Lưu tất cả".
   */
  onSave?: (rows: RowData[]) => Promise<void> | void;
}

type EditorMode = "view" | "add" | "edit";

interface EditorState {
  mode: EditorMode;
  row: RowData;

  /**
   * Dùng để tìm đúng dòng khi primary key bị chỉnh sửa.
   */
  originalId?: CellValue;
}

const actionLabels: Record<TableAction, string> = {
  view: "Xem",
  add: "Thêm",
  edit: "Sửa",
  delete: "Xóa",
  copy: "Sao chép",
  calculate: "Tính tổng",
  save: "Lưu tất cả",
};

function createTemporaryId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();

  return uuid
    ? `temporary-${uuid}`
    : `temporary-${Date.now()}-${Math.random()}`;
}

function createEmptyRow(schema: TableSchema): RowData {
  const row: RowData = {};

  for (const column of schema.columns) {
    if (column.type === "boolean") {
      row[column.field] = false;
    } else {
      row[column.field] = null;
    }
  }

  row[schema.primaryKey] = createTemporaryId();

  return row;
}

function formatValue(
  value: CellValue,
  column: ColumnSchema,
): string {
  if (value === null || value === "") {
    return "";
  }

  if (column.type === "boolean") {
    return value ? "Có" : "Không";
  }

  if (column.type === "currency") {
    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return String(value);
    }

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numberValue);
  }

  if (column.type === "number") {
    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return String(value);
    }

    return new Intl.NumberFormat("vi-VN").format(numberValue);
  }

  if (column.type === "select") {
    const selectedOption = column.options?.find(
      (option) => String(option.value) === String(value),
    );

    return selectedOption?.label ?? String(value);
  }

  return String(value);
}

interface FieldEditorProps {
  column: ColumnSchema;
  value: CellValue;
  disabled: boolean;
  onChange: (value: CellValue) => void;
}

function FieldEditor({
  column,
  value,
  disabled,
  onChange,
}: FieldEditorProps) {
  if (column.type === "boolean") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  }

  if (column.type === "select") {
    return (
      <select
        value={value === null ? "" : String(value)}
        disabled={disabled}
        required={column.required}
        onChange={(event) => {
          const selectedOption = column.options?.find(
            (option) =>
              String(option.value) === event.target.value,
          );

          onChange(selectedOption?.value ?? null);
        }}
      >
        <option value="">-- Chọn --</option>

        {column.options?.map((option) => (
          <option
            key={String(option.value)}
            value={String(option.value)}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (
    column.type === "number" ||
    column.type === "currency"
  ) {
    return (
      <input
        type="number"
        value={value === null ? "" : Number(value)}
        disabled={disabled}
        required={column.required}
        onChange={(event) => {
          const nextValue = event.target.value;

          onChange(
            nextValue === "" ? null : Number(nextValue),
          );
        }}
      />
    );
  }

  if (column.type === "date") {
    return (
      <input
        type="date"
        value={value === null ? "" : String(value)}
        disabled={disabled}
        required={column.required}
        onChange={(event) =>
          onChange(event.target.value || null)
        }
      />
    );
  }

  return (
    <input
      type="text"
      value={value === null ? "" : String(value)}
      disabled={disabled}
      required={column.required}
      onChange={(event) =>
        onChange(event.target.value || null)
      }
    />
  );
}

export function DynamicTable({
  schema,
  data,
  onSave,
}: DynamicTableProps) {
  const [rows, setRows] = useState<RowData[]>(data);
  const [editor, setEditor] =
    useState<EditorState | null>(null);
  const [showTotals, setShowTotals] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRows(data);
  }, [data]);

  const visibleColumns = useMemo(
    () =>
      schema.columns.filter(
        (column) => column.visible !== false,
      ),
    [schema.columns],
  );

  const rowActions = schema.actions.filter((action) =>
    ["view", "edit", "delete", "copy"].includes(action),
  );

  const totals = useMemo(() => {
    const result: Record<string, number> = {};

    for (const column of visibleColumns) {
      if (!column.sum) {
        continue;
      }

      result[column.field] = rows.reduce(
        (total, row) =>
          total + Number(row[column.field] ?? 0),
        0,
      );
    }

    return result;
  }, [rows, visibleColumns]);

  function openAdd() {
    setEditor({
      mode: "add",
      row: createEmptyRow(schema),
    });
  }

  function openView(row: RowData) {
    setEditor({
      mode: "view",
      row: { ...row },
    });
  }

  function openEdit(row: RowData) {
    setEditor({
      mode: "edit",
      row: { ...row },
      originalId: row[schema.primaryKey],
    });
  }

  function openCopy(row: RowData) {
    const copiedRow = {
      ...row,
      [schema.primaryKey]: createTemporaryId(),
    };

    setEditor({
      mode: "add",
      row: copiedRow,
    });
  }

  function deleteRow(row: RowData) {
    const accepted = window.confirm(
      "Bạn có chắc muốn xóa dòng này?",
    );

    if (!accepted) {
      return;
    }

    const rowId = row[schema.primaryKey];

    setRows((currentRows) =>
      currentRows.filter(
        (currentRow) =>
          currentRow[schema.primaryKey] !== rowId,
      ),
    );
  }

  function updateEditorField(
    field: string,
    value: CellValue,
  ) {
    setEditor((currentEditor) => {
      if (!currentEditor) {
        return null;
      }

      return {
        ...currentEditor,
        row: {
          ...currentEditor.row,
          [field]: value,
        },
      };
    });
  }

  function submitEditor(event: FormEvent) {
    event.preventDefault();

    if (!editor || editor.mode === "view") {
      return;
    }

    const missingColumn = schema.columns.find(
      (column) => {
        if (!column.required) {
          return false;
        }

        const value = editor.row[column.field];

        return value === null || value === "";
      },
    );

    if (missingColumn) {
      window.alert(
        `Vui lòng nhập trường: ${missingColumn.label}`,
      );

      return;
    }

    if (editor.mode === "add") {
      setRows((currentRows) => [
        editor.row,
        ...currentRows,
      ]);
    }

    if (editor.mode === "edit") {
      setRows((currentRows) =>
        currentRows.map((currentRow) => {
          const currentId =
            currentRow[schema.primaryKey];

          if (currentId === editor.originalId) {
            return editor.row;
          }

          return currentRow;
        }),
      );
    }

    setEditor(null);
  }

  async function saveAllRows() {
    try {
      setSaving(true);

      await onSave?.(rows);

      window.alert("Đã lưu dữ liệu.");
    } catch (error) {
      console.error(error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Không thể lưu dữ liệu.",
      );
    } finally {
      setSaving(false);
    }
  }

  function renderToolbarAction(action: TableAction) {
    if (action === "add") {
      return (
        <button key={action} onClick={openAdd}>
          {actionLabels[action]}
        </button>
      );
    }

    if (action === "calculate") {
      return (
        <button
          key={action}
          onClick={() =>
            setShowTotals((current) => !current)
          }
        >
          {showTotals ? "Ẩn tổng" : actionLabels[action]}
        </button>
      );
    }

    if (action === "save") {
      return (
        <button
          key={action}
          disabled={saving}
          onClick={saveAllRows}
        >
          {saving ? "Đang lưu..." : actionLabels[action]}
        </button>
      );
    }

    return null;
  }

  function renderRowAction(
    action: TableAction,
    row: RowData,
  ) {
    const rowId = String(row[schema.primaryKey]);

    if (action === "view") {
      return (
        <button
          key={`${rowId}-${action}`}
          onClick={() => openView(row)}
        >
          Xem
        </button>
      );
    }

    if (action === "edit") {
      return (
        <button
          key={`${rowId}-${action}`}
          onClick={() => openEdit(row)}
        >
          Sửa
        </button>
      );
    }

    if (action === "copy") {
      return (
        <button
          key={`${rowId}-${action}`}
          onClick={() => openCopy(row)}
        >
          Sao chép
        </button>
      );
    }

    if (action === "delete") {
      return (
        <button
          key={`${rowId}-${action}`}
          className="danger-button"
          onClick={() => deleteRow(row)}
        >
          Xóa
        </button>
      );
    }

    return null;
  }

  return (
    <section className="dynamic-table">
      <div className="table-header">
        <h2>{schema.title}</h2>

        <div className="table-toolbar">
          {schema.actions.map(renderToolbarAction)}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th key={column.field}>
                  {column.label}
                </th>
              ))}

              {rowActions.length > 0 && (
                <th>Thao tác</th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={String(
                  row[schema.primaryKey] ?? index,
                )}
              >
                {visibleColumns.map((column) => (
                  <td key={column.field}>
                    {formatValue(
                      row[column.field],
                      column,
                    )}
                  </td>
                ))}

                {rowActions.length > 0 && (
                  <td>
                    <div className="row-actions">
                      {rowActions.map((action) =>
                        renderRowAction(action, row),
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={
                    visibleColumns.length +
                    (rowActions.length > 0 ? 1 : 0)
                  }
                >
                  Không có dữ liệu.
                </td>
              </tr>
            )}
          </tbody>

          {showTotals && (
            <tfoot>
              <tr>
                {visibleColumns.map(
                  (column, columnIndex) => (
                    <td key={column.field}>
                      {column.sum
                        ? formatValue(
                            totals[column.field],
                            column,
                          )
                        : columnIndex === 0
                          ? "Tổng"
                          : ""}
                    </td>
                  ),
                )}

                {rowActions.length > 0 && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {editor && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>
              {editor.mode === "view" && "Xem dữ liệu"}
              {editor.mode === "add" && "Thêm dữ liệu"}
              {editor.mode === "edit" && "Sửa dữ liệu"}
            </h3>

            <form onSubmit={submitEditor}>
              {schema.columns
                .filter(
                  (column) =>
                    column.visible !== false &&
                    column.field !==
                      schema.primaryKey,
                )
                .map((column) => {
                  const disabled =
                    editor.mode === "view" ||
                    column.editable === false;

                  return (
                    <label
                      className="form-field"
                      key={column.field}
                    >
                      <span>
                        {column.label}
                        {column.required ? " *" : ""}
                      </span>

                      <FieldEditor
                        column={column}
                        value={
                          editor.row[column.field]
                        }
                        disabled={disabled}
                        onChange={(value) =>
                          updateEditorField(
                            column.field,
                            value,
                          )
                        }
                      />
                    </label>
                  );
                })}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setEditor(null)}
                >
                  Đóng
                </button>

                {editor.mode !== "view" && (
                  <button type="submit">
                    {editor.mode === "add"
                      ? "Thêm"
                      : "Cập nhật"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}