// @ts-nocheck
export default function DashboardFilters({ searchTerm, setSearchTerm, categories, selectedCategory, setSelectedCategory }) {
  return (
    <>
      <input
        type="text"
        placeholder="Buscar produto..."
        className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded ${selectedCategory === null ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded ${selectedCategory === cat.id ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-700`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </>
  );
}
