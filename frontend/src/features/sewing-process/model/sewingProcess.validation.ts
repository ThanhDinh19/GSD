import type {
  SewingProcessPayload,
} from '../types/sewingProcess.types';

export function validateSewingProcess(
  form: SewingProcessPayload
): string | null {
  if (!form.documentCode.trim()) {
    return 'Vui lòng nhập mã chứng từ.';
  }

  if (
    !form.productionManpower ||
    Number(form.productionManpower) <= 0
  ) {
    return 'Nhân sự sản xuất phải lớn hơn 0.';
  }

  if (
    !form.workingHours ||
    Number(form.workingHours) <= 0
  ) {
    return 'Thời gian làm việc phải lớn hơn 0.';
  }

  if (!form.lines.length) {
    return 'Vui lòng nhập ít nhất 1 dòng công đoạn.';
  }

  const emptyLine = form.lines.find(
    (line) =>
      !String(
        line.operationName || ''
      ).trim()
  );

  if (emptyLine) {
    return `Dòng ${emptyLine.lineNo} chưa có tên công đoạn.`;
  }

  return null;
}