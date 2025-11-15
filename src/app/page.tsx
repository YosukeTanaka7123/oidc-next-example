import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="w-full h-full grid place-content-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl">Sign In</h1>
        <Link
          href="/tenant-a/home"
          className="font-bold py-2 px-4 rounded bg-blue-500 hover:bg-blue-700 text-white"
        >
          Tenant A Sign In
        </Link>
        <Link
          href="/tenant-b/home"
          className="font-bold py-2 px-4 rounded bg-green-500 hover:bg-green-700 text-white"
        >
          Tenant B Sign In
        </Link>
      </div>
    </main>
  );
}
