const corsOptions = {
    origin: [
      "http://localhost:5173",
        process.env.CLIENT_URL,
    ],
    credentials: true,
  }

const DATASREAM_TOKEN = "datastream-token";

  export { corsOptions, DATASREAM_TOKEN }