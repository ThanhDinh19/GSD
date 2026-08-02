import type {
  SewingProcessPayload,
} from '../types/sewingProcess.types';

import type {
  Customer,
} from '../../../types';

import {
  dateInputValue,
  numberInputValue,
  toNumberOrNull,
} from '../utils/sewingProcess.formatters';

import {
  ComboBoxOption,
  ComboBox,
} from '../../../shared/components'

type GeneralInfoSectionProps = {
  form: SewingProcessPayload;
  customers: Customer[];
  readOnly: boolean;

  onUpdate: <K extends keyof SewingProcessPayload>(
    key: K,
    value: SewingProcessPayload[K]
  ) => void;

  onCustomerChange: (
    value: string
  ) => void;
};

export function GeneralInfoSection({
  form,
  customers,
  readOnly,
  onUpdate,
  onCustomerChange,
}: GeneralInfoSectionProps) {
  const inputClass = `
    w-full rounded-lg border
    border-slate-300 px-3 py-2 text-sm
    ${readOnly
      ? 'cursor-not-allowed bg-slate-100'
      : 'bg-white'
    }
  `;

  const customerOptions:
    ComboBoxOption[] =
    customers.map((customer) => ({
      value: customer.id,

      label: [
        customer.cusCode,
        customer.cusName,
      ]
        .filter(Boolean)
        .join(' - '),
    }));

  return (
    <section className="xl:col-span-5 rounded-sm border border-slate-300 bg-white p-4">
      <div className="mb-3 inline-block border border-sky-300 bg-sky-100 px-3 py-1 text-xs font-bold">
        THÔNG TIN CHUNG
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Mã chứng từ
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            disabled={readOnly}
            value={form.documentCode}
            onChange={(event) =>
              onUpdate(
                'documentCode',
                event.target.value
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Khách hàng
          </label>

          <ComboBox
            value={form.customerId}
            disabled={readOnly}
            placeholder="-- Chọn khách hàng --"
            options={customerOptions}
            onValueChange={
              onCustomerChange
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Mã khách hàng
          </label>

          <input
            readOnly
            value={form.customerCode || ''}
            className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Tên khách hàng
          </label>

          <input
            readOnly
            value={form.customerName || ''}
            className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Mã hàng
          </label>

          <input
            disabled={readOnly}
            value={form.itemCode || ''}
            onChange={(event) =>
              onUpdate(
                'itemCode',
                event.target.value
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Chuyền SX
          </label>

          <input
            disabled={readOnly}
            value={form.productionLine || ''}
            onChange={(event) =>
              onUpdate(
                'productionLine',
                event.target.value
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Lần SX
          </label>

          <input
            disabled={readOnly}
            type="number"
            value={numberInputValue(
              form.productionRound
            )}
            onChange={(event) =>
              onUpdate(
                'productionRound',
                toNumberOrNull(
                  event.target.value
                )
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Thời gian LV
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            disabled={readOnly}
            type="number"
            value={form.workingHours}
            onChange={(event) =>
              onUpdate(
                'workingHours',
                Number(
                  event.target.value || 0
                )
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Nhân sự
          </label>

          <input
            disabled={readOnly}
            type="number"
            value={numberInputValue(
              form.manpower
            )}
            onChange={(event) =>
              onUpdate(
                'manpower',
                toNumberOrNull(
                  event.target.value
                )
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Nhân sự SX
            <span className="text-red-500">
              *
            </span>
          </label>

          <input
            disabled={readOnly}
            type="number"
            value={form.productionManpower}
            onChange={(event) =>
              onUpdate(
                'productionManpower',
                Number(
                  event.target.value || 0
                )
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Số lượng SP
          </label>

          <input
            disabled={readOnly}
            type="number"
            value={numberInputValue(
              form.quantity
            )}
            onChange={(event) =>
              onUpdate(
                'quantity',
                toNumberOrNull(
                  event.target.value
                )
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Ngày áp dụng
          </label>

          <input
            disabled={readOnly}
            type="date"
            value={dateInputValue(
              form.effectiveDate
            )}
            onChange={(event) =>
              onUpdate(
                'effectiveDate',
                event.target.value
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Ngày ban hành
          </label>

          <input
            disabled={readOnly}
            type="date"
            value={dateInputValue(
              form.issuedDate
            )}
            onChange={(event) =>
              onUpdate(
                'issuedDate',
                event.target.value
              )
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Cách tính đơn giá
          </label>

          <select
            disabled={readOnly}
            value={form.priceMode}
            onChange={(event) =>
              onUpdate(
                'priceMode',
                event.target.value as
                | 'GSD'
                | 'ADJUSTED'
              )
            }
            className={inputClass}
          >
            <option value="GSD">
              Theo SMV GSD
            </option>

            <option value="ADJUSTED">
              Theo SMV điều chỉnh
            </option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Ghi chú
          </label>

          <input
            disabled={readOnly}
            value={form.note || ''}
            onChange={(event) =>
              onUpdate(
                'note',
                event.target.value
              )
            }
            className={inputClass}
          />
        </div>
      </div>
    </section>
  );
}