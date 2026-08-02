import type {
  ChangeEvent,
} from 'react';

import type {
  Customer,
  MachineEquipment_test,
} from '../../../types';

import type {
  SewingProcessLine,
  SewingProcessPayload,
  SewingProcessResult,
} from '../types/sewingProcess.types';

import {
  GeneralInfoSection,
} from './GeneralInfoSection';

import {
  ProductionSummarySection,
} from './ProductionSummarySection';

import {
  MainImageSection,
} from './MainImageSection';

import {
  ProcessTable,
} from './ProcessTable';

import {
  MachineNeedTable,
} from './MachineNeedTable';

type ActiveTab =
  | 'process'
  | 'machine';

type SewingProcessFormProps = {
  form: SewingProcessPayload;
  result: SewingProcessResult | null;

  customers: Customer[];
  machines: MachineEquipment_test[];

  readOnly: boolean;
  canCalculate: boolean;
  canUploadImage: boolean;

  activeTab: ActiveTab;
  calculating: boolean;

  imageSrc: string;
  imageFileName: string;
  imageUploading: boolean;

  onUpdateForm: <
    K extends keyof SewingProcessPayload
  >(
    key: K,
    value: SewingProcessPayload[K]
  ) => void;

  onUpdateLine: <
    K extends keyof SewingProcessLine
  >(
    index: number,
    key: K,
    value: SewingProcessLine[K]
  ) => void;

  onCustomerChange: (
    value: string
  ) => void;

  onMachineChange: (
    index: number,
    value: string
  ) => void;

  onRemoveLine: (
    index: number
  ) => void;

  onOpenActions: (
    line: SewingProcessLine
  ) => void;

  onPreviewImage: (
    url: string
  ) => void;

  onUploadImage: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;

  onRemoveImage: () => void;

  onOpenOperationPicker: () => void;

  onCalculate: () => Promise<unknown>;

  onActiveTabChange: (
    tab: ActiveTab
  ) => void;
};

export function SewingProcessForm({
  form,
  result,
  customers,
  machines,
  readOnly,
  canCalculate,
  canUploadImage,
  activeTab,
  calculating,
  imageSrc,
  imageFileName,
  imageUploading,
  onUpdateForm,
  onUpdateLine,
  onCustomerChange,
  onMachineChange,
  onRemoveLine,
  onOpenActions,
  onPreviewImage,
  onUploadImage,
  onRemoveImage,
  onOpenOperationPicker,
  onCalculate,
  onActiveTabChange,
}: SewingProcessFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <GeneralInfoSection
          form={form}
          customers={customers}
          readOnly={readOnly}
          onUpdate={onUpdateForm}
          onCustomerChange={
            onCustomerChange
          }
        />

        <ProductionSummarySection
          summary={result?.summary}
        />

        <MainImageSection
          imageSrc={imageSrc}
          imageFileName={imageFileName}
          uploading={imageUploading}
          readOnly={
            readOnly ||
            !canUploadImage
          }
          onUpload={onUploadImage}
          onRemove={onRemoveImage}
        />
      </div>

      <div className="rounded-sm border border-slate-300 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                onActiveTabChange(
                  'process'
                )
              }
              className={`
                rounded-md border px-4 py-2
                text-xs font-bold
                ${activeTab === 'process'
                  ? 'border-sky-400 bg-sky-100 text-sky-800'
                  : 'border-slate-300 bg-white text-slate-600'
                }
              `}
            >
              Bảng quy trình
            </button>

            <button
              type="button"
              onClick={() =>
                onActiveTabChange(
                  'machine'
                )
              }
              className={`
                rounded-md border px-4 py-2
                text-xs font-bold
                ${activeTab === 'machine'
                  ? 'border-sky-400 bg-sky-100 text-sky-800'
                  : 'border-slate-300 bg-white text-slate-600'
                }
              `}
            >
              Nhu cầu MMTB
            </button>
          </div>

          {!readOnly && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onOpenOperationPicker}
                className="rounded-md border border-yellow-300 bg-yellow-100 px-4 py-2 text-xs font-bold hover:bg-yellow-200"
              >
                Chọn công đoạn
              </button>

              {canCalculate && (
                <button
                  type="button"
                  onClick={() => {
                    void onCalculate();
                  }}
                  disabled={calculating}
                  className="rounded-md border border-yellow-300 bg-yellow-100 px-4 py-2 text-xs font-bold hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {calculating
                    ? 'Đang tính...'
                    : 'Tính'}
                </button>
              )}
            </div>
          )}
        </div>

        {activeTab === 'process' && (
          <ProcessTable
            lines={form.lines}
            machines={machines}
            readOnly={readOnly}
            hasResult={Boolean(result)}
            onUpdateLine={
              onUpdateLine
            }
            onRemoveLine={
              onRemoveLine
            }
            onMachineChange={
              onMachineChange
            }
            onOpenActions={
              onOpenActions
            }
            onPreviewImage={
              onPreviewImage
            }
          />
        )}

        {activeTab === 'machine' && (
          <MachineNeedTable
            rows={
              result?.machineNeeds ??
              []
            }
            taktTime={
              result?.summary.taktTime
            }
          />
        )}
      </div>
    </div>
  );
}