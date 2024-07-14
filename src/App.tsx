import { useEffect, useState } from 'react';
import './App.css';
import {
  PriceServiceConnection,
  // PriceFeed,
  Price,
} from '@pythnetwork/price-service-client';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Card,
  CardContent,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Web3 } from 'web3';

const web3 = new Web3('https://rpc.ankr.com/eth_sepolia');

const aggregatorV3InterfaceABI = [
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'description',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint80', name: '_roundId', type: 'uint80' }],
    name: 'getRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

interface PriceData {
  btc: number;
  eth: number;
}

function App() {
  const [pythPrices, setPythPrices] = useState<PriceData>({ btc: 0, eth: 0 });
  const [chainlinkPrices, setChainlinkPrices] = useState<PriceData>({
    btc: 0,
    eth: 0,
  });
  const [priceHistory, setPriceHistory] = useState<
    { time: number; BTC: number; ETH: number }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      // use the new pyth oracle model
      const connection = new PriceServiceConnection(
        'https://hermes.pyth.network',
        {
          priceFeedRequestConfig: {
            binary: true,
          },
        }
      );

      const priceIds = [
        '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD price id on Pyth
        '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH/USD price id on Pyth
      ];

      const currentPrices = await connection.getLatestPriceFeeds(priceIds);
      console.log('Pyth price', currentPrices);
      console.log('Inner', currentPrices[0]?.price.price);
      // This was really a pain though
      const btcPriceM = currentPrices?.at(0)?.getPriceNoOlderThan(30);
      const ethPriceM = currentPrices?.at(1)?.getPriceNoOlderThan(30);
      const btcPriceN = Number(btcPriceM?.price);
      const ethPriceN = Number(ethPriceM?.price);
      if (currentPrices) {
        setPythPrices({
          btc: extractPriceValue(btcPriceN),
          eth: extractPriceValue(ethPriceN),
        });
      }

      function extractPriceValue(
        price: Price | null | undefined | number
      ): number {
        if (price && typeof price === 'number') {
          return price * Math.pow(10, -8);
        }
        return 0; // Return 0 if price is null, undefined, or doesn't have the expected structure
      }

      // Fetch Chainlink data
      const btcAddr = '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43';
      const ethAddr = '0x694AA1769357215DE4FAC081bf1f309aDC325306';
      const btcPriceFeed = new web3.eth.Contract(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        aggregatorV3InterfaceABI as any,
        btcAddr
      );
      const ethPriceFeed = new web3.eth.Contract(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        aggregatorV3InterfaceABI as any,
        ethAddr
      );

      const [btcData, ethData] = await Promise.all([
        btcPriceFeed.methods.latestRoundData().call(),
        ethPriceFeed.methods.latestRoundData().call(),
      ]);

      setChainlinkPrices({
        btc: Number(btcData.answer) / 1e8, // Assuming 8 decimals for BTC
        eth: Number(ethData.answer) / 1e8, // Assuming 8 decimals for ETH
      });

      // Update price history
      const now = Date.now();
      setPriceHistory((prevHistory) => [
        ...prevHistory.slice(-19),
        {
          time: now,
          BTC: (pythPrices.btc + chainlinkPrices.btc) / 2,
          ETH: (pythPrices.eth + chainlinkPrices.eth) / 2,
        },
      ]);
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderPriceChart = () => {
    return (
      <ResponsiveContainer width='100%' height={400}>
        <LineChart data={priceHistory}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey='time'
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
          />
          <YAxis yAxisId='left' />
          <YAxis yAxisId='right' orientation='right' />
          <Tooltip
            labelFormatter={(label) => new Date(label).toLocaleString()}
          />
          <Legend />
          <Line
            yAxisId='left'
            type='monotone'
            dataKey='BTC'
            stroke='#f2a900'
            name='BTC/USD'
          />
          <Line
            yAxisId='right'
            type='monotone'
            dataKey='ETH'
            stroke='#3c3c3d'
            name='ETH/USD'
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderPriceCards = () => {
    const btcAverage = (pythPrices.btc + chainlinkPrices.btc) / 2;
    const ethAverage = (pythPrices.eth + chainlinkPrices.eth) / 2;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h5' component='div'>
                BTC/USD
              </Typography>
              <Typography variant='h4' color='text.secondary'>
                ${btcAverage.toFixed(2)}
              </Typography>
              <Typography variant='body2'>
                Pyth: ${pythPrices.btc.toFixed(2)} | Chainlink: $
                {chainlinkPrices.btc.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h5' component='div'>
                ETH/USD
              </Typography>
              <Typography variant='h4' color='text.secondary'>
                ${ethAverage.toFixed(2)}
              </Typography>
              <Typography variant='body2'>
                Pyth: ${pythPrices.eth.toFixed(2)} | Chainlink: $
                {chainlinkPrices.eth.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6'>
            Oracle Aggregator (Pyth and Chainlink)
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant='h6' gutterBottom component='div'>
                Current Prices
              </Typography>
              {renderPriceCards()}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant='h6' gutterBottom component='div'>
                Price Chart
              </Typography>
              {renderPriceChart()}
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <footer
        style={{ textAlign: 'center', padding: '20px', marginTop: 'auto' }}
      >
        <Typography variant='body2' color='text.secondary'>
          © 2024 Made with ❤️ for Solana
        </Typography>
      </footer>
    </ThemeProvider>
  );
}

export default App;
