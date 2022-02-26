import * as fs from "fs";

const pacticipant = "pactflow-example-consumer-mountebank";
const provider = "pactflow-example-provider-dredd";

const filePath = `./pacts/${pacticipant}-${
  process.env.PACT_PROVIDER || provider
}.json`;

const defaultPact = {
  consumer: { name: pacticipant },
  provider: { name: process.env.PACT_PROVIDER || provider },
  interactions: [],
  metadata: {
    pactSpecification: {
      version: "2.0.0",
    },
  },
};
// Read in the MB stubs, and convert to a Pact file
export const mbMatchesToPact = (imposters) => {
  const pact = readPactFileOrDefault();

  const matches = imposters.stubs.map((imposter) => {
    return (imposter.matches || []).map((match) => ({
      description: `mb_${match.request.method}_${match.request.path}_${match.response.statusCode}`,
      request: {
        method: match.request.method,
        path: match.request.path,
        body: match.request.body ? JSON.parse(match.request.body) : undefined,
        query: match.request.query,
        headers: match.request.headers,
      },
      response: {
        status: match.response.statusCode,
        headers: match.response.headers,
        body: match.response.body ? JSON.parse(match.response.body) : undefined,
      },
      timestamp: match.timestamp, // use this to detect duplicates
    }));
  });

  pact.interactions = [...pact.interactions, ...matches.flat()];

  writePact(pact);
};

const removeDuplicates = (pact) => {
  let timestamps = {};

  const interactions = pact.interactions.reduce((acc, interaction) => {
    console.log(interaction)
    if (!timestamps[interaction.timestamp]) acc.push(interaction)
    timestamps[interaction.timestamp] = true

    return acc
  }, []);

  pact.interactions = interactions

  return pact
};

const writePact = (pact) => {
  createPactDir();
  const cleanPact = removeDuplicates(pact);

  fs.writeFileSync(filePath, JSON.stringify(cleanPact));
};

const createPactDir = () => {
  try {
    fs.mkdirSync("./pacts");
  } catch {
    // likely dir already exists
  }
};

const readPactFileOrDefault = () => {
  let pact = {};

  try {
    const res = fs.readFileSync(filePath);
    pact = JSON.parse(res.toString("utf8"));
  } catch {
    pact = defaultPact;
  }

  return pact;
};
