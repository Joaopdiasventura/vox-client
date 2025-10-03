
import { reqHandler } from '../dist/vox/server/server.mjs';

export default function (req, res) {
  return reqHandler(req, res);
}