import metaData from "../../data/meta.json";

type Meta = {
  title: string;
  description: string;
  keywords: string[];
};

type MetaMap = {
  [path: string]: Meta;
};

const meta = metaData as MetaMap;

export function getMeta(path: string): Meta {
  return meta[path] ?? meta["/"];
}
