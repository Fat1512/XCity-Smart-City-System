const AirQualityChartNonData = () => {
  return (
    <div className="bg-white p-16 rounded-2xl shadow-lg text-center border border-gray-100">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
        <svg
          className="w-10 h-10 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Chưa có dữ liệu
      </h3>
      <p className="text-gray-500">
        Vui lòng chọn ít nhất một sensor từ menu bên trên để bắt đầu xem biểu
        đồ.
      </p>
    </div>
  );
};

export default AirQualityChartNonData;
