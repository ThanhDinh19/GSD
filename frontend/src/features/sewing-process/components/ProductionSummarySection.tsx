import type {
  SewingProcessSummary,
} from '../types/sewingProcess.types';

import { SummaryBox } from './SummaryBox';

type ProductionSummarySectionProps = {
  summary?: SewingProcessSummary | null;
};

export function ProductionSummarySection({
  summary,
}: ProductionSummarySectionProps) {
  return (
    <section className="xl:col-span-4 rounded-sm border border-slate-300 bg-white p-4">
      <div className="mb-3 inline-block border border-sky-300 bg-sky-100 px-3 py-1 text-xs font-bold">
        THÔNG TIN SẢN XUẤT
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <SummaryBox
          label="Tổng thời gian"
          formula="SUM(SMV điều chỉnh)"
          value={summary?.totalTime}
        />

        <SummaryBox
          label="Tổng phút chuẩn"
          formula="Tổng thời gian / 60"
          value={summary?.c1}
        />

        <SummaryBox
          label="Tổng SMV GSD gốc"
          formula="SUM(SMV gốc GSD)"
          value={summary?.totalSamGsd}
        />

        <SummaryBox
          label="Nhịp sản xuất"
          formula="Tổng thời gian / Nhân sự SX"
          value={summary?.taktTime}
        />

        <SummaryBox
          label="Nhịp phút/người"
          formula="Nhịp sản xuất / 60"
          value={summary?.c3}
        />

        <SummaryBox
          label="Hệ số điều chỉnh SMV"
          formula="Tổng thời gian / Tổng SMV GSD gốc"
          value={summary?.c4}
        />

        <SummaryBox
          label="Định mức sản lượng"
          formula="(3600 / Tổng thời gian) * Thời gian LV * Nhân sự SX"
          value={summary?.standardOutput}
        />

        <SummaryBox
          label="Sản lượng/giờ"
          formula="Định mức sản lượng / Thời gian LV"
          value={summary?.c5}
        />

        <SummaryBox
          label="Định mức theo SMV gốc"
          formula="(3600 / Tổng SMV GSD gốc) * Thời gian LV * Nhân sự SX"
          value={summary?.c6}
        />

        <SummaryBox
          label="Tổng đơn giá"
          formula="SUM(Đơn giá chuẩn)"
          value={summary?.totalStandardPrice}
          money
          digits={0}
        />

        <SummaryBox
          label="Tổng đơn giá theo định mức"
          formula="Định mức sản lượng * Tổng đơn giá"
          value={summary?.totalPriceByOutput}
          money
          digits={0}
        />

        <SummaryBox
          label="Đơn giá bình quân"
          formula="Tổng đơn giá theo định mức / Nhân sự SX"
          value={summary?.averagePrice}
          money
          digits={0}
        />
      </div>
    </section>
  );
}