import Compendium from "./components/compendium";
import { getBosses } from "./lib/elden-ring";

export default async function Home() {
  const bosses = await getBosses();
  return <Compendium bosses={bosses} />;
}
