import Compendium from "./components/compendium";
import { getBosses } from "./lib/elden-ring";
import { connection } from "next/server";

export const instant = false;

export default async function Home() {
  await connection();
  const initialCatalogue = await getBosses();
  return <Compendium initialCatalogue={initialCatalogue} />;
}
