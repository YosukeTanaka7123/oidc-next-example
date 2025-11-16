import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";

type ProfilePageProps = {
  params: Promise<{ tenant: string }>;
};

export default async function ProfilePage(props: ProfilePageProps) {
  const { tenant } = await props.params;
  const user = await getCurrentUser(tenant);

  return (
    <main className="w-full h-full grid place-content-center gap-4">
      <div className="flex flex-col gap-4 max-w-md">
        <h1 className="text-3xl text-center font-bold">{`${tenant} Profile`}</h1>

        {user?.email && (
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="text-lg font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Tenant:</span>
                <p className="text-lg font-medium">{user.tenant}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Link
            href={`/${tenant}/home`}
            className="font-bold py-2 px-4 rounded bg-blue-500 hover:bg-blue-700 text-white text-center flex-1"
          >
            Go Home
          </Link>
          <a
            href={`/${tenant}/api/auth/logout`}
            className="font-bold py-2 px-4 rounded bg-red-500 hover:bg-red-700 text-white text-center flex-1 no-underline block"
          >
            Sign Out
          </a>
        </div>
      </div>
    </main>
  );
}
