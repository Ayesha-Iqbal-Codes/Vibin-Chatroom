// src/components/DateDivider.jsx
const DateDivider = ({ date, themeMode }) => {
  return (
    <div className="text-center my-4">
      <span className={`px-3 py-1 rounded-full text-xs ${
        themeMode === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-600'
      }`}>
        {date}
      </span>
    </div>
  );
};

export default DateDivider;