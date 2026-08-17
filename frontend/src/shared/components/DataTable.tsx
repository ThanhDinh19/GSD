import { useState } from 'react';
import { DynamicColumn } from "@/src/features/myPage/types/types";
import { DynamicForm } from './DynamicForm';

type ColumnType = "string" | "number" | "datetime" | "boolean";


type Props = {
    columns: DynamicColumn[];
    rows: Record<string, unknown>[];

    onAdd?: (data: Record<string, unknown>) => Promise<void>;
};

function renderValue(value: unknown, type: ColumnType) {
  if (value === null || value === undefined) {
    return "";
  }

  switch (type) {
    case "number":
      return Number(value).toLocaleString();

    case "datetime":
      return new Date(String(value)).toLocaleString();

    case "boolean":
      return Boolean(value) ? "✓" : "✕";

    default:
      return String(value);
  }
}

export function DynamicTable({
    columns,
    rows,
    onAdd
}: Props) {

    const [showAdd, setShowAdd] = useState(false);

    return (
        <div>
            <button
                onClick={() => setShowAdd(true)}
            >
                Thêm
            </button>

            <table>
                <thead>
                    <tr>
                        {columns
                            .filter(col => col.visible !== false)
                            .map(col => (
                                <th key={col.field}>
                                    {col.label}
                                </th>
                            ))
                        }
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            {columns
                                .filter(col => col.visible !== false)
                                .map(col => (
                                    <td key={col.field}>
                                        {renderValue(
                                            row[col.field],
                                            col.type
                                        )}
                                    </td>
                                ))
                            }
                        </tr>
                    ))}
                </tbody>
                
            </table>

            {showAdd && (
                <DynamicForm
                    columns={columns}
                    onSubmit={async (data) => {
                        await onAdd?.(data);
                        setShowAdd(false);
                    }}
                    onCancel={() => setShowAdd(false)}
                />
            )}
        </div>
    );
}