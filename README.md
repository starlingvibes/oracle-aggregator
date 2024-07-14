# Oracle Aggregator

Design and develop an Oracle Aggregator for a DeFi application. The aggregator should pull price feeds from at least two different oracle sources, calculate an average, and display it on the frontend (FE). Note- for this bounty, you MUST use the new Pyth oracle model.

Requirements:

- Oracle Integration: Fetch price feeds from at least two different oracle providers.
- Data Aggregation: Compute the average of the fetched price feeds.
- Frontend Display: Present the aggregated data on the UI.
- Deployment: Ensure the application can be tested and deployed on Cloudflare or Vercel.

# Demo video

```
https://www.loom.com/share/c49360d5f8d848c79fb07dd51ec9dc3f
```

# Install dependencies

```shell
npm install
```

# Running the project

Running the project is as simple as running

```sh
npm run dev
```

This runs the `dev` script specified in our `package.json`, and will spawn off a server which reloads the page as we save our files.
Typically the server runs at `http://localhost:5173`

# Creating a production build

When running the project with `npm run start`, we didn't end up with an optimized build.
Typically, we want the code we ship to users to be as fast and small as possible.
Certain optimizations like minification can accomplish this, but often take more time.
We call builds like this "production" builds (as opposed to development builds).

To run a production build, just run

```sh
npm run build
```

This will create an optimized build in the `./dist` directory

You won't need to run a production build most of the time,
but it is useful if you need to measure things like the final size of your app.
