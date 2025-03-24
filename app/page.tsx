import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 className="text-x font-bold my-4">Hi,this is a next page</h1>
      <Link href="/blog">go yeyey</Link>
    </div>
  );
}
