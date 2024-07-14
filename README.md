# Tooling Data Explorer powered by AI

Design and develop an explorer or dashboard that fetches data from RPC and/or API sources. The UI should offer a clear and easy-to-use experience for a broad range of users.

Requirements:

- Data Fetching: Retrieve data from RPC and/or API endpoints.
- User Experience: Create an intuitive and user-friendly interface.
- Deployment: Ensure the explorer or dashboard can be tested and deployed on Cloudflare or Vercel.

# Demo video

```
https://www.loom.com/share/5e2229c0242942728e1c043148a11cdf
```

# Install dependencies

```shell
npm install
```

# Configure environment variables

```shell
cp .env.sample .env
vim .env
```

Set the values of the environment variables in the `.env` file.

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
