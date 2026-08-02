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

import {
    usePermissions,
} from '../../auth/hooks/usePermissions';
import {
    SCREEN,
} from '../../auth/constants/permission.constants';


type SewingProcessListTableProps = {
  items: SewingProcessListItem[];
  selectedId: number | null;

  onSelect: (id: number) => void;
  onOpenDetail: (id: number) => void;
  onPreviewImage: (url: string) => void;
};

export function SewingProcessListTable({
  items,
  selectedId,
  onSelect,
  onOpenDetail,
  onPreviewImage,
}: SewingProcessListTableProps) {

  const permissions = usePermissions(SCREEN.SEWING_PROCESS);

  return (
    <div className="h-[630px] overflow-auto border border-slate-200 rounded-sm">
      <table className="w-full text-sm min-w-[1100px] border-collapse">
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
              Khách hàng
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left">
              Mã hàng
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
          {items.length === 0 && (
            <tr>
              <td
                colSpan={10}
                className="border border-slate-200 px-4 py-6 text-center text-slate-400"
              >
                Chưa có chứng từ quy trình may.
              </td>
            </tr>
          )}

          {items.map((item, index) => {
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
                key={item.id}
                onClick={() =>
                  onSelect(item.id)
                }
                className={`
                  cursor-pointer
                  ${
                    isSelected
                      ? 'bg-blue-50'
                      : 'hover:bg-slate-50'
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