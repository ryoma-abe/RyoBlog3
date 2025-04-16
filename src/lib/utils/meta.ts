import metaData from "../../data/meta.json";
import { isBlogIndexPage } from "./path";

type Meta = {
  title: string;
  description: string;
  keywords: string[];
};

type MetaMap = {
  [path: string]: Meta;
};

const meta = metaData as MetaMap;

/**
 * パスを正規化（末尾スラッシュを除去。"/" はそのまま）
 */
export function normalizePath(path: string): string {
  return path.endsWith("/") ? path.slice(0, -1) || "/" : path;
}

/**
 * 指定パスに対応するメタ情報を取得（存在しない場合はトップページのものを返す）
 */
export function getMeta(path: string): Meta {
  return meta[path] ?? meta["/"];
}

/**
 * 実際のURLパスに基づき、正しくメタ情報を取得する関数
 * （/blog/page/2 などは /blog の情報にマッピング）
 */
export function getPageMeta(pathname: string): Meta {
  const normalized = normalizePath(pathname);
  const targetPath = isBlogIndexPage(normalized) ? "/blog" : normalized;
  return getMeta(targetPath);
}
