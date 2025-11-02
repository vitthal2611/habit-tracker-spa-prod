export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
          <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'} mt-1`} />
        </div>
      </div>
      {label && <span className="ml-3 text-sm">{label}</span>}
    </label>
  )
}