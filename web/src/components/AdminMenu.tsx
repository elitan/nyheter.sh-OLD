import Link from 'next/link';

export function AdminMenu() {
  return (
    <div>
      <div className="text-center text-2xl">ADMIN</div>
      <div className="flex space-x-4">
        <Link href="/admin">Admin</Link>
        <Link href="/admin/analytics">Analytics</Link>
      </div>
    </div>
  );
}
