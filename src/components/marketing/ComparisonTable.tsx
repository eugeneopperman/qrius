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

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="w-5 h-5 mx-auto" style={{ color: '#22C55E' }} />;
  }
  if (value === false) {
    return <Minus className="w-5 h-5 mx-auto" style={{ color: '#E8E6E3' }} />;
  }
  return <span>{value}</span>;
}

export function ComparisonTable({ rows, className }: ComparisonTableProps) {
  return (
    <div
      className={`overflow-x-auto ${className ?? ''}`}
      style={{ borderRadius: 12, border: '1px solid #E8E6E3' }}
    >
      <table className="w-full text-left" style={{ minWidth: 480 }}>
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
              <td className="py-3 px-4 text-center" style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A' }}>
                <CellValue value={row.qrius} />
              </td>
              <td className="py-3 px-4 text-center" style={{ fontSize: 15, color: '#4A4A4A' }}>
                <CellValue value={row.competitor} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
