import { mbMatchesToPact } from "./mountebankSerialiser";
import { execSync, spawn } from "child_process";
import waitPort from "wait-port";
import { mbPort } from "./config";

export const writeStubs = async (mb, port) => {
  const imposter = await mb.getImposter(port);

  mbMatchesToPact(imposter);
};

export const stopStubs = () => {
  return execSync(`mb stop`);
};

export const startAndClearStubs = () => {
  spawn("mb", ["restart", "--debug", "true"]);

  return waitPort({
    port: mbPort,
    host: "localhost",
    output: "silent",
  });
};
