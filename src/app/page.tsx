import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href="/auth/login" className="text-blue-500 hover:underline">Ingresar</Link>
    </div>
  );
}
