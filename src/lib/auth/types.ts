/**
 * 許可されているテナント名
 */
export type TenantId = "tenant-a" | "tenant-b";

/**
 * テナントIDの検証
 */
export function isValidTenant(tenant: string): tenant is TenantId {
  return tenant === "tenant-a" || tenant === "tenant-b";
}
