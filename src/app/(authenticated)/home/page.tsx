import Link from "next/link";

export default function HomePage() {
  return (
    <main className="w-full h-full grid place-content-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl text-center">Home</h1>
        <div className="flex gap-2">
          <Link
            href="/profile"
            className="font-bold py-2 px-4 rounded bg-blue-500 hover:bg-blue-700 text-white"
          >
            Go Profile
          </Link>
          <Link
            href="/"
            className="font-bold py-2 px-4 rounded bg-red-500 hover:bg-red-700 text-white"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </main>
  );
}
