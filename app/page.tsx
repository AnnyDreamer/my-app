// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Gallery, IntroInfo } from "@/components/custom/peopleCard";
import { AddContact } from "@/components/custom/statusCard";

export default function Home() {
  return (
    <div className="p-4">
      {/* <h1 className="text-x font-bold my-4">Hi,this is a next page</h1> */}
      {/* <Button asChild>
        <Link href="/blog">go yeyey</Link>
      </Button>
      <Button className="ml-4" variant="outline">
        Button
      </Button> */}
      <div>
        <AddContact />
      </div>
    </div>
  );
}
