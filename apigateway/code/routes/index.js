import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const router = express.Router();
router.use(cors());

const microserviceProxy = createProxyMiddleware({
  target: 'http://microservice:3011',
  changeOrigin: true
});

router.use('/microservice', microserviceProxy);

const challengesProxy = createProxyMiddleware({
  target: 'http://challenges-api:3012',
  changeOrigin: true,
});

router.use('/challenges', challengesProxy);

router.get('/health', (req, res) => {
  res.send('API Gateway is running!');
});

const itemsProxy = createProxyMiddleware({
  target: 'http://shop-api:3013',
  changeOrigin: true,
});

router.use('/items', itemsProxy);

export default router;
