import { createApp } from "../server/_core/app";

let appPromise: ReturnType<typeof createApp> | undefined;

type VercelRequest = any;
type VercelResponse = any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  appPromise ??= createApp({ development: false });
  const app = await appPromise;
  return app(req, res);
}
