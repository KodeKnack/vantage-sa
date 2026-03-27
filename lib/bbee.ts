export type ROIResult = {
  hireCount: number;
  annualPayroll: number;
  taxRebateZAR: number;
  bbeeContributionZAR: number;
  totalSavingZAR: number;
};

export function calculateROI(hireCount: number, annualPayroll: number): ROIResult {
  const safeHireCount = Math.max(0, Math.floor(hireCount));
  const safeAnnualPayroll = Math.max(0, Math.floor(annualPayroll));

  const taxRebateZAR = safeHireCount * 40_000;
  const bbeeContributionZAR = Math.round(safeHireCount * 0.003 * safeAnnualPayroll);
  const totalSavingZAR = taxRebateZAR + bbeeContributionZAR;

  return {
    hireCount: safeHireCount,
    annualPayroll: safeAnnualPayroll,
    taxRebateZAR,
    bbeeContributionZAR,
    totalSavingZAR,
  };
}

