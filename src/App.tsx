import { useEffect, useState } from 'react';
import './App.css';
import {
  PriceServiceConnection,
  PriceFeed,
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

function App() {
  const [currentPrice, setCurrentPrice] = useState<PriceFeed[]>([]);
  const [priceHistory, setPriceHistory] = useState<
    { time: number; BTC: number; ETH: number }[]
  >([]);

  useEffect(() => {
    async function fetchDataFromPyth() {
      const connection = new PriceServiceConnection(
        'https://hermes.pyth.network',
        {
          priceFeedRequestConfig: {
            binary: true,
          },
        }
      );

      const priceIds = [
        '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD price id
        '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH/USD price id
      ];

      let currentPrices = await connection.getLatestPriceFeeds(priceIds);
      if (!currentPrices) {
        currentPrices = [];
      }
      setCurrentPrice(currentPrices);
      console.log(currentPrice);

      // Simulate price history for the chart
      const now = Date.now();
      const history = Array.from({ length: 20 }, (_, i) => ({
        time: now - i * 60000,
        BTC: parseFloat((Math.random() * 1000 + 50000).toFixed(2)),
        ETH: parseFloat((Math.random() * 100 + 3000).toFixed(2)),
      })).reverse();
      setPriceHistory(history);
    }

    fetchDataFromPyth();
    const interval = setInterval(fetchDataFromPyth, 30000); // Update every 30 seconds
    const btcAddr = '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43';
    const ethAddr = '0x694AA1769357215DE4FAC081bf1f309aDC325306';
    const btcPriceFeed = new web3.eth.Contract(
      aggregatorV3InterfaceABI,
      btcAddr
    );
    const ethPriceFeed = new web3.eth.Contract(
      aggregatorV3InterfaceABI,
      ethAddr
    );
    btcPriceFeed.methods
      .latestRoundData()
      .call()
      .then((roundData) => {
        console.log('Latest BTC round data', roundData);
      });

    ethPriceFeed.methods
      .latestRoundData()
      .call()
      .then((roundData) => {
        console.log('Latest ETH round data', roundData);
      });

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

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6'>Oracle Aggregator</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant='h6' gutterBottom component='div'>
                Price Chart
              </Typography>
              {renderPriceChart()}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant='h6' gutterBottom component='div'>
                © 2024 Made with ❤️ for Solana
              </Typography>
              {/* {renderPriceTable()} */}
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <footer
        style={{ textAlign: 'center', padding: '20px', marginTop: 'auto' }}
      ></footer>
    </ThemeProvider>
  );
}

export default App;
