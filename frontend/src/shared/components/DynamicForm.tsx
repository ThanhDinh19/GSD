import { useState } from 'react';
import { DynamicColumn } from '@/src/features/myPage/types/types';

type DynamicFormProps = {
    columns: DynamicColumn[];
    onSubmit: (
        data: Record<string, unknown>
    ) => Promise<void>;

    onCancel: () => void;
};

function renderInput(
    column: DynamicColumn,
    value: unknown,
    onChange: (value: unknown) => void
) {
    switch (column.type) {

        case 'number':
            return (
                <input
                    type="number"
                    value={String(value ?? '')}
                    onChange={e =>
                        onChange(
                            Number(e.target.value)
                        )
                    }
                />
            );

        case 'datetime':
            return (
                <input
                    type="date"
                    value={String(value ?? '')}
                    onChange={e =>
                        onChange(e.target.value)
                    }
                />
            );

        case 'boolean':
            return (
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={e =>
                        onChange(e.target.checked)
                    }
                />
            );

        default:
            return (
                <input
                    type="text"
                    value={String(value ?? '')}
                    onChange={e =>
                        onChange(e.target.value)
                    }
                />
            );
    }
}

export function DynamicForm({
    columns,
    onSubmit,
    onCancel
}: DynamicFormProps) {

    const [form, setForm] = useState<
        Record<string, unknown>
    >({});

    const editableColumns =
        columns.filter(col => col.editable !== false);

    const setValue = (
        field: string,
        value: unknown
    ) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div>
            {editableColumns.map(col => (
                <div key={col.field}>
                    <label>
                        {col.label}
                    </label>

                    {renderInput(
                        col,
                        form[col.field],
                        value => setValue(
                            col.field,
                            value
                        )
                    )}
                </div>
            ))}

            <button
                onClick={() => onSubmit(form)}
            >
                Lưu
            </button>

            <button onClick={onCancel}>
                Hủy
            </button>
        </div>
    );
}