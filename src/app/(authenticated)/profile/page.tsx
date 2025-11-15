import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="w-full h-full grid place-content-center gap-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl">Profile</h1>
        <Link
          href="/home"
          className="font-bold py-2 px-4 rounded bg-blue-500 hover:bg-blue-700 text-white"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
