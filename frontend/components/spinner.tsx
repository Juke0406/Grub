export const Spinner = () => (
  <div className="w-full h-full p-6 rounded-xl shadow-lg flex flex-col justify-center items-center gap-3">
    <svg
      className="animate-spin h-6 w-6 text-indigo-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
    <p className="text-sm font-medium text-gray-800">Loading...</p>
  </div>
);
