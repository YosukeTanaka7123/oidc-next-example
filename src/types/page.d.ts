/**
 * Next.js App Router用のページプロパティの型定義
 */
declare global {
  interface PageProps<
    TParams extends Record<string, string | string[]> = Record<
      string,
      string | string[]
    >,
    TSearchParams extends Record<string, string | string[]> = Record<
      string,
      string | string[]
    >,
  > {
    params: Promise<TParams>;
    searchParams?: Promise<TSearchParams>;
  }
}

export {};
