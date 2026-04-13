import prisma from "@/lib/prisma";

export default async function Home() {


  const users = await prisma.user.findMany();

  console.log({ users })

  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
