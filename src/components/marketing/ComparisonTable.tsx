import { Check, Minus } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  qrius: string | boolean;
  competitor: string | boolean;
}

interface ComparisonTableProps {
  rows: ComparisonRow[];
  className?: string;
}

function CellValue({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (value === true) {
    return <Check className="w-5 h-5" style={{ color: '#22C55E' }} />;
  }
  if (value === false) {
    return <Minus className="w-5 h-5" style={{ color: '#9CA3AF' }} />;
  }
  return (
    <span style={{ fontWeight: highlight ? 500 : 400, color: highlight ? '#1A1A1A' : '#4A4A4A' }}>
      {value}
    </span>
  );
}

export function ComparisonTable({ rows, className }: ComparisonTableProps) {
  return (
    <div className={className}>
      {/* Desktop: table layout */}
      <div
        className="hidden sm:block overflow-x-auto"
        style={{ borderRadius: 12, border: '1px solid #E8E6E3' }}
      >
        <table className="w-full text-left">
          <thead>
            <tr style={{ backgroundColor: '#F5F4F2' }}>
              <th
                className="py-3 px-4 text-left"
                style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4A4A4A' }}
              >
                Feature
              </th>
              <th
                className="py-3 px-4 text-center"
                style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F97316' }}
              >
                Qrius (Free)
              </th>
              <th
                className="py-3 px-4 text-center"
                style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4A4A4A' }}
              >
                Industry avg.
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.feature}
                style={{
                  backgroundColor: i % 2 === 0 ? '#ffffff' : '#FAFAF8',
                  borderTop: '1px solid #E8E6E3',
                }}
              >
                <td className="py-3 px-4" style={{ fontSize: 15, color: '#1A1A1A' }}>
                  {row.feature}
                </td>
                <td className="py-3 px-4 text-center" style={{ fontSize: 15 }}>
                  <div className="flex items-center justify-center">
                    <CellValue value={row.qrius} highlight />
                  </div>
                </td>
                <td className="py-3 px-4 text-center" style={{ fontSize: 15 }}>
                  <div className="flex items-center justify-center">
                    <CellValue value={row.competitor} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-3">
        {rows.map((row) => (
          <div
            key={row.feature}
            className="rounded-xl p-4"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #E8E6E3',
            }}
          >
            <p style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A', marginBottom: 10 }}>
              {row.feature}
            </p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold"
                  style={{ backgroundColor: '#FFF3E8', color: '#F97316' }}
                >
                  Qrius
                </span>
                <CellValue value={row.qrius} highlight />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold"
                  style={{ backgroundColor: '#F5F4F2', color: '#4A4A4A' }}
                >
                  Others
                </span>
                <CellValue value={row.competitor} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
