import { useEffect, useMemo, useState } from "react";

import { DynamicTable } from "../components/dynamic-table/DynamicTable";

import type {
  RowData,
  TableAction,
  TableSchema,
} from "../components/dynamic-table/types";

interface ResourceTableProps {
  resource: string;
  actions?: TableAction[];
}

interface DataResponse {
  data: RowData[];
}

export function ResourceTable({
  resource,
  actions,
}: ResourceTableProps) {
  const [schema, setSchema] =
    useState<TableSchema | null>(null);

  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadResource() {
      try {
        setLoading(true);
        setError(null);

        const [schemaResponse, dataResponse] =
          await Promise.all([
            fetch(
              `/api/resources/${resource}/schema`,
              {
                signal: controller.signal,
              },
            ),

            fetch(`/api/resources/${resource}`, {
              signal: controller.signal,
            }),
          ]);

        if (!schemaResponse.ok) {
          throw new Error(
            "Không lấy được cấu hình table.",
          );
        }

        if (!dataResponse.ok) {
          throw new Error(
            "Không lấy được dữ liệu table.",
          );
        }

        const loadedSchema =
          (await schemaResponse.json()) as TableSchema;

        const loadedData =
          (await dataResponse.json()) as DataResponse;

        setSchema(loadedSchema);
        setData(loadedData.data);
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Có lỗi xảy ra.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadResource();

    return () => controller.abort();
  }, [resource]);

  const effectiveSchema = useMemo(() => {
    if (!schema) {
      return null;
    }

    if (!actions) {
      return schema;
    }

    /*
     * Dev chỉ được giảm quyền so với server.
     * Không được bật action mà server không cho phép.
     */
    return {
      ...schema,
      actions: actions.filter((action) =>
        schema.actions.includes(action),
      ),
    };
  }, [schema, actions]);

  async function saveRows(rows: RowData[]) {
    const response = await fetch(
      `/api/resources/${resource}/save`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          rows,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Lưu dữ liệu thất bại.");
    }
  }

  if (loading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!effectiveSchema) {
    return <p>Không tìm thấy cấu hình table.</p>;
  }

  return (
    <DynamicTable
      schema={effectiveSchema}
      data={data}
      onSave={saveRows}
    />
  );
}