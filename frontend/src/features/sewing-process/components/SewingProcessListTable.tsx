import {
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';


import type {
  SewingProcessListItem,
} from '../types/sewingProcess.types';

import {
  formatNumber,
  formatSummaryMoney,
} from '../../../shared/utils/formatters';

import {
  getSewingProcessImageUrl,
} from '../utils/sewingProcessImage';



type SewingProcessListTableProps = {
  items: SewingProcessListItem[];
  selectedId: number | null;

  onSelect: (id: number) => void;
  onOpenDetail: (id: number) => void;
  onPreviewImage: (url: string) => void;
};

type FilterOption = {
  value: string;
  label: string;
};

type SelectedFilterValues =
  | string[]
  | null;

const BLANK_FILTER_VALUE =
  '__BLANK__';

function toFilterLabel(
  value: unknown
) {
  const text =
    String(value ?? '').trim();

  return text || '(Blanks)';
}

function toFilterValue(
  value: unknown
) {
  const text =
    String(value ?? '').trim();

  return text || BLANK_FILTER_VALUE;
}

function uniqueOptions(
  labels: string[]
): FilterOption[] {
  const map =
    new Map<string, FilterOption>();

  labels.forEach((label) => {
    const optionLabel =
      toFilterLabel(label);

    const value =
      toFilterValue(label);

    if (!map.has(value)) {
      map.set(value, {
        value,
        label: optionLabel,
      });
    }
  });

  return Array.from(map.values())
    .sort((a, b) => {
      if (a.value === BLANK_FILTER_VALUE) {
        return 1;
      }

      if (b.value === BLANK_FILTER_VALUE) {
        return -1;
      }

      return a.label.localeCompare(
        b.label,
        'vi'
      );
    });
}

function isFilterMatch(
  value: string,
  selectedValues: SelectedFilterValues
) {
  if (selectedValues === null) {
    return true;
  }

  return selectedValues.includes(
    value
  );
}

export function SewingProcessListTable({
  items,
  selectedId,
  onSelect,
  onOpenDetail,
  onPreviewImage,
}: SewingProcessListTableProps) {

  const [
    selectedCustomerValues,
    setSelectedCustomerValues,
  ] = useState<SelectedFilterValues>(
    null
  );

  const [
    selectedItemCodeValues,
    setSelectedItemCodeValues,
  ] = useState<SelectedFilterValues>(
    null
  );

  const [
    selectedDepartmentValues,
    setSelectedDepartmentValues,
  ] = useState<SelectedFilterValues>(
    null
  );

  const customerOptions =
    useMemo(
      () =>
        uniqueOptions(
          items.map((item) => {
            const customerName =
              String(
                item.customerName ?? ''
              ).trim();

            const customerCode =
              String(
                item.customerCode ?? ''
              ).trim();

            if (
              customerName &&
              customerCode &&
              customerName !== customerCode
            ) {
              return `${customerName} - ${customerCode}`;
            }

            return customerName || customerCode;
          })
        ),
      [items]
    );

  const itemCodeOptions =
    useMemo(
      () =>
        uniqueOptions(
          items.map(
            (item) =>
              String(
                item.itemCode ?? ''
              ).trim()
          )
        ),
      [items]
    );

  const departmentOptions =
    useMemo(
      () =>
        uniqueOptions(
          items.map(
            (item) =>
              String(
                item.departmentName ?? ''
              ).trim()
          )
        ),
      [items]
    );

  const filteredItems =
    useMemo(
      () =>
        items.filter((item) => {
          const customerName =
            String(
              item.customerName ?? ''
            ).trim();

          const customerCode =
            String(
              item.customerCode ?? ''
            ).trim();

          const customerLabel =
            customerName &&
              customerCode &&
              customerName !== customerCode
              ? `${customerName} - ${customerCode}`
              : customerName || customerCode;

          const customerValue =
            toFilterValue(
              customerLabel
            );

          const itemCodeValue =
            toFilterValue(
              item.itemCode
            );

          const departmentValue =
            toFilterValue(
              item.departmentName
            );

          return (
            isFilterMatch(
              customerValue,
              selectedCustomerValues
            ) &&
            isFilterMatch(
              itemCodeValue,
              selectedItemCodeValues
            ) &&
            isFilterMatch(
              departmentValue,
              selectedDepartmentValues
            )
          );
        }),
      [
        items,
        selectedCustomerValues,
        selectedItemCodeValues,
      ]
    );




  return (
    <div className="h-[660px] overflow-auto border border-slate-200 rounded-sm">
      <table className="w-full text-sm min-w-[1250px] border-collapse">
        <thead className="bg-slate-50 sticky top-0 z-10">
          <tr className="text-xs text-slate-500 uppercase">
            <th className="border border-slate-200 px-3 py-2 text-center">
              STT
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left">
              Mã chứng từ
            </th>
            <th className="border border-slate-200 px-3 py-2 text-center">
              Hình ảnh
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left">
              <th className="relative  border-slate-200 px-3 py-2 text-left">
                <DropdownColumnFilter
                  title="Khách hàng"
                  options={customerOptions}
                  selectedValues={selectedCustomerValues}
                  onChange={setSelectedCustomerValues}
                />
              </th>
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left">
              <th className="relative  border-slate-200 px-3 py-2 text-left">
                <DropdownColumnFilter
                  title="Mã hàng"
                  options={itemCodeOptions}
                  selectedValues={selectedItemCodeValues}
                  onChange={setSelectedItemCodeValues}
                />
              </th>
            </th>

            <th className="relative  border-slate-200 px-3 py-2 text-left">
              <DropdownColumnFilter
                title="Chi nhánh"
                options={departmentOptions}
                selectedValues={selectedDepartmentValues}
                onChange={setSelectedDepartmentValues}
              />
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left">
              Chuyền
            </th>
            <th className="border border-slate-200 px-3 py-2 text-right">
              NS SX
            </th>
            <th className="border border-slate-200 px-3 py-2 text-right">
              Tổng TG
            </th>
            <th className="border border-slate-200 px-3 py-2 text-right">
              Định mức
            </th>
            <th className="border border-slate-200 px-3 py-2 text-right">
              Đơn giá BQ
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredItems.length === 0 && (
            <tr>
              <td
                colSpan={11}
                className="border border-slate-200 px-4 py-4 text-center text-slate-400"
              >
                {items.length === 0
                  ? 'Chưa có chứng từ quy trình may.'
                  : 'Không tìm thấy chứng từ phù hợp với bộ lọc.'}
              </td>
            </tr>
          )}

          {filteredItems.map((item, index) => {
            const isSelected =
              selectedId === item.id;

            const imageFileName =
              item.imageFileName ||
              item.imageUrl ||
              '';

            const imageSrc =
              getSewingProcessImageUrl(
                imageFileName
              );

            return (
              <tr
                key={`${item.id}-${item.documentCode}-${index}`}
                onClick={() =>
                  onSelect(item.id)
                }
                className={`
                        cursor-pointer
                        transition-colors
                        ${isSelected
                    ? 'bg-blue-100'
                    : 'bg-white hover:bg-blue-50'
                  }
                    `}
              >
                <td className="border border-slate-200 px-3 py-2 text-center text-blue-700">
                  {index + 1}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-blue-700">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenDetail(item.id);
                    }}
                    className="text-blue-700 hover:underline"
                  >
                    {item.documentCode}
                  </button>
                </td>

                <td className="border border-slate-200 px-3 py-2 text-center">
                  {imageSrc ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onPreviewImage(
                          imageSrc
                        );
                      }}
                      className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-slate-50 hover:ring-2 hover:ring-blue-400"
                    >
                      <img
                        src={imageSrc}
                        alt="Hình mã hàng"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">
                      -
                    </span>
                  )}
                </td>

                <td className="border border-slate-200 px-3 py-2">
                  {item.customerName ||
                    item.customerCode}
                </td>

                <td className="border border-slate-200 px-3 py-2">
                  {item.itemCode}
                </td>

                <td className="border border-slate-200 px-3 py-2">
                  {item.departmentName}
                </td>


                <td className="border border-slate-200 px-3 py-2">
                  {item.productionLine}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-right">
                  {item.productionManpower}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-right">
                  {formatNumber(
                    item.totalTime,
                    2
                  )}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-right">
                  {formatNumber(
                    item.standardOutput,
                    2
                  )}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-right">
                  {formatSummaryMoney(
                    item.averagePrice,
                    0
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DropdownColumnFilter({
  title,
  options,
  selectedValues,
  onChange,
}: {
  title: string;
  options: FilterOption[];
  selectedValues: SelectedFilterValues;
  onChange: (
    values: SelectedFilterValues
  ) => void;
}) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    keyword,
    setKeyword,
  ] = useState('');

  const rootRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(
    () => {
      if (!open) {
        return;
      }

      const handleMouseDown =
        (event: MouseEvent) => {
          if (
            rootRef.current &&
            !rootRef.current.contains(
              event.target as Node
            )
          ) {
            setOpen(false);
          }
        };

      document.addEventListener(
        'mousedown',
        handleMouseDown
      );

      return () => {
        document.removeEventListener(
          'mousedown',
          handleMouseDown
        );
      };
    },
    [open]
  );

  const filteredOptions =
    useMemo(
      () => {
        const text =
          keyword
            .trim()
            .toLowerCase();

        if (!text) {
          return options;
        }

        return options.filter(
          (option) =>
            option.label
              .toLowerCase()
              .includes(text)
        );
      },
      [
        options,
        keyword,
      ]
    );

  const allValues =
    options.map(
      (option) => option.value
    );

  const currentSelectedSet =
    selectedValues === null
      ? new Set(allValues)
      : new Set(selectedValues);

  const allChecked =
    options.length > 0 &&
    allValues.every(
      (value) =>
        currentSelectedSet.has(value)
    );

  const isFiltered =
    selectedValues !== null &&
    selectedValues.length !==
    options.length;

  const selectedCount =
    selectedValues === null
      ? options.length
      : selectedValues.length;

  const handleToggleAll =
    (
      checked: boolean
    ) => {
      if (checked) {
        onChange(null);
        return;
      }

      onChange([]);
    };

  const handleToggleOption =
    (
      value: string
    ) => {
      const nextSet =
        selectedValues === null
          ? new Set(allValues)
          : new Set(selectedValues);

      if (nextSet.has(value)) {
        nextSet.delete(value);
      } else {
        nextSet.add(value);
      }

      const nextValues =
        Array.from(nextSet);

      if (
        nextValues.length ===
        options.length
      ) {
        onChange(null);
        return;
      }

      onChange(nextValues);
    };

  return (
    <div
      ref={rootRef}
      className="relative normal-case"
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(
            (previous) => !previous
          );
        }}
        className={`
          flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 text-left text-xs font-semibold uppercase
          ${isFiltered
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-500 hover:bg-slate-100'
          }
        `}
      >
        <span>
          {title}
        </span>

        <span className="text-[10px]">
          ▼
        </span>
      </button>

      {isFiltered && (
        <div className="mt-1 text-[10px] font-normal text-blue-600">
          {selectedCount}/{options.length} selected
        </div>
      )}

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded border border-slate-300 bg-white p-2 text-xs font-normal text-slate-700 shadow-xl">
          <input
            type="text"
            autoFocus
            value={keyword}
            onChange={(event) =>
              setKeyword(
                event.target.value
              )
            }
            placeholder="Search"
            className="mb-2 h-7 w-full rounded border border-slate-300 px-2 text-xs outline-none focus:border-blue-400"
          />

          <label className="flex cursor-pointer items-center gap-2 px-1 py-1 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(event) =>
                handleToggleAll(
                  event.target.checked
                )
              }
            />

            <span>
              (Select All)
            </span>
          </label>

          <div className="mt-1 max-h-56 overflow-auto border-t border-slate-100 pt-1">
            {filteredOptions.map(
              (option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 px-1 py-1 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={
                      currentSelectedSet.has(
                        option.value
                      )
                    }
                    onChange={() =>
                      handleToggleOption(
                        option.value
                      )
                    }
                  />

                  <span className="truncate">
                    {option.label}
                  </span>
                </label>
              )
            )}

            {filteredOptions.length === 0 && (
              <div className="px-1 py-2 text-slate-400">
                Không có dữ liệu phù hợp.
              </div>
            )}
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setKeyword('');
              }}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="rounded bg-slate-800 px-2 py-1 text-[11px] text-white hover:bg-slate-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}