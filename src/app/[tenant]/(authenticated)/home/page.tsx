import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";

type HomePageProps = {
  params: Promise<{ tenant: string }>;
};

export default async function HomePage(props: HomePageProps) {
  const { tenant } = await props.params;
  const user = await getCurrentUser(tenant);

  return (
    <main className="w-full h-full grid place-content-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl text-center font-bold">{`${tenant} Home`}</h1>

        {user?.email && (
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Logged in as:</p>
            <p className="text-lg font-semibold">{user.email}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Link
            href={`/${tenant}/profile`}
            className="font-bold py-2 px-4 rounded bg-blue-500 hover:bg-blue-700 text-white text-center"
          >
            Go Profile
          </Link>
          <a
            href={`/${tenant}/api/auth/logout`}
            className="font-bold py-2 px-4 rounded bg-red-500 hover:bg-red-700 text-white text-center no-underline block"
          >
            Sign Out
          </a>
        </div>
      </div>
    </main>
  );
}
