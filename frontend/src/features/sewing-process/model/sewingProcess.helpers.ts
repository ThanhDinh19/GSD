import type {
  SewingProcessLine,
  SewingProcessPayload,
} from '../types/sewingProcess.types';

export function buildSewingProcessPayload(
  form: SewingProcessPayload
): SewingProcessPayload {
  return {
    ...form,

    images: form.images || [],

    lines: form.lines.map(
      (line, index) => ({
        ...line,

        lineNo: index + 1,
        lineOrder: index + 1,
      })
    ),
  };
}

function findOriginalLine(
  calculatedLine: SewingProcessLine,
  previousLines: SewingProcessLine[],
  index: number
): SewingProcessLine | undefined {
  if (
    calculatedLine.gsdAnalysisId !== null &&
    calculatedLine.gsdAnalysisId !== undefined
  ) {
    const match =
      previousLines.find(
        (line) =>
          Number(line.gsdAnalysisId) ===
          Number(
            calculatedLine.gsdAnalysisId
          )
      );

    if (match) {
      return match;
    }
  }

  if (
    calculatedLine.sourceLineId !== null &&
    calculatedLine.sourceLineId !== undefined
  ) {
    const match =
      previousLines.find(
        (line) =>
          Number(line.sourceLineId) ===
          Number(
            calculatedLine.sourceLineId
          )
      );

    if (match) {
      return match;
    }
  }

  if (calculatedLine.operationCode) {
    const match =
      previousLines.find(
        (line) =>
          String(
            line.operationCode || ''
          ) ===
          String(
            calculatedLine.operationCode
          )
      );

    if (match) {
      return match;
    }
  }

  return previousLines[index];
}

export function mergeCalculatedLines(
  calculatedLines: SewingProcessLine[],
  previousLines: SewingProcessLine[]
): SewingProcessLine[] {
  return calculatedLines.map(
    (calculatedLine, index) => {
      const oldLine =
        findOriginalLine(
          calculatedLine,
          previousLines,
          index
        );

      return {
        ...calculatedLine,

        sourceDocumentCode:
          calculatedLine.sourceDocumentCode ??
          oldLine?.sourceDocumentCode ??
          null,

        sourceLineId:
          calculatedLine.sourceLineId ??
          oldLine?.sourceLineId ??
          null,

        gsdAnalysisId:
          calculatedLine.gsdAnalysisId ??
          oldLine?.gsdAnalysisId ??
          null,

        imageFileName:
          calculatedLine.imageFileName ??
          oldLine?.imageFileName ??
          null,

        imageUrl:
          calculatedLine.imageUrl ??
          oldLine?.imageUrl ??
          null,
      };
    }
  );
}  

