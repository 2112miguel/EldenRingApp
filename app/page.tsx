import Compendium from "./components/compendium";
import { getBosses } from "./lib/elden-ring";

export default async function Home() {
  const initialCatalogue = await getBosses();
  return <Compendium initialCatalogue={initialCatalogue} />;
}
