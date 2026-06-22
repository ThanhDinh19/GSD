import { useEffect, useMemo, useState } from 'react';
import { GsdAnalysisSummary } from '../types';
import { gsdAnalysisService } from '../services/gsdAnalysis.service';

export function useGsdOverview() {
  const [analyses, setAnalyses] = useState<GsdAnalysisSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAnalyses = async () => {
    setLoading(true);

    try {
      const data = await gsdAnalysisService.getAnalyses();
      setAnalyses(data);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalAnalysis = analyses.length;

    const totalTmu = analyses.reduce((sum, item) => {
      return sum + Number(item.totalTmu || 0);
    }, 0);

    const totalSmv = analyses.reduce((sum, item) => {
      return sum + Number(item.finalSmv || 0);
    }, 0);

    const averageSmv = totalAnalysis > 0 ? totalSmv / totalAnalysis : 0;

    const machineCount = new Set(
      analyses
        .map((item) => item.machineCode)
        .filter(Boolean)
    ).size;

    return {
      totalAnalysis,
      totalTmu,
      averageSmv,
      machineCount,
    };
  }, [analyses]);

  useEffect(() => {
    loadAnalyses();
  }, []);

  return {
    analyses,
    loading,
    stats,
    loadAnalyses,
  };
}