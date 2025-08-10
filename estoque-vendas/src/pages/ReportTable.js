export default function ReportTable({ headers, rows }) {
  // Verifique se 'headers' e 'rows' são arrays válidos antes de tentar mapear
  const safeHeaders = Array.isArray(headers) ? headers : [];
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 shadow-sm">
        <thead>
          <tr>
            {safeHeaders.map((header) => (
              <th
                key={header}
                className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border border-gray-300 text-gray-800"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeRows.map((row, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="py-2 px-4 text-sm border border-gray-300 whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
