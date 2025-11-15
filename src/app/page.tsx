export default function SignInPage() {
  return (
    <main className="w-full h-full grid place-content-center">
      <div className="flex flex-col gap-4 max-w-md p-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          Welcome to OIDC Next Example
        </h1>
        <p className="text-center text-gray-600 mb-4">
          Please select your tenant to sign in
        </p>
        <a
          href="/tenant-a/api/auth/login"
          className="font-bold py-3 px-6 rounded bg-blue-500 hover:bg-blue-700 text-white text-center transition-colors no-underline block"
        >
          Tenant A Sign In
        </a>
        <a
          href="/tenant-b/api/auth/login"
          className="font-bold py-3 px-6 rounded bg-green-500 hover:bg-green-700 text-white text-center transition-colors no-underline block"
        >
          Tenant B Sign In
        </a>
      </div>
    </main>
  );
}
