import Link from "next/link";

export default async function ProfilePage(props: PageProps<"/[tenant]/home">) {
  const { tenant } = await props.params;
  return (
    <main className="w-full h-full grid place-content-center gap-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl text-center">{`${tenant} Profile`}</h1>
        <Link
          href={`/${tenant}/home`}
          className="font-bold py-2 px-4 rounded bg-blue-500 hover:bg-blue-700 text-white"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
