export default function ReportTable({ headers, rows }) {
  return (
    <table className="min-w-full mb-6 bg-white text-gray-800">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} className="px-4 py-2 border-b text-left">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-100' : ''}>
            {row.map((cell, cIdx) => (
              <td key={cIdx} className="px-4 py-2 border-b">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
