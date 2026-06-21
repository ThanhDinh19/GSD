interface StatusBadgeProps {
  statusId: number;
  statusName?: string;
}

export default function StatusBadge({ statusId, statusName }: StatusBadgeProps) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-[10px] font-bold ${
        statusId === 0
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-slate-100 text-slate-500 border border-slate-200'
      }`}
    >
      {statusName || 'Không rõ'}
    </span>
  );
}