import { add, subtract } from "my-lib";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-12">
          My Library Demo
        </h1>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-8 min-w-[300px]">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Addition Example
            </h2>
            <div className="text-3xl font-mono text-indigo-600 dark:text-indigo-400">
              1 + 2 = {add(1, 2)}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-8 min-w-[300px]">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Subtraction Example
            </h2>
            <div className="text-3xl font-mono text-purple-600 dark:text-purple-400">
              10 - 4 = {subtract(10, 4)}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-8 min-w-[300px]">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Complex Calculation
            </h2>
            <div className="text-3xl font-mono text-green-600 dark:text-green-400">
              (5 + 3) - 2 = {subtract(add(5, 3), 2)}
            </div>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Functions imported from{" "}
            <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
              my-lib
            </code>
          </p>
          <p className="mt-2">Tree-shakable ESM library ✨</p>
        </div>
      </div>
    </div>
  );
}
