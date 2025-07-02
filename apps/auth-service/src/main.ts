import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import expressOasGenerator from 'express-oas-generator';
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import router from './routes/auth.router';
const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(cookieParser());

// Swagger Docs
expressOasGenerator.init(app, {});
app.use('/api-docs', swaggerUi.serve, (req: Request, res: Response) => {
  const spec = expressOasGenerator.getSpec();
  res.send(swaggerUi.generateHTML(spec));
});

// Routers
app.use('/api', router);

// Error handler
app.use(errorMiddleware);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 6001;
const host = process.env.HOST ?? '0.0.0.0';

const server = app.listen(port, host, () => {
  console.log(`Auth service is running at http://localhost:${port}/api`);
  console.log(`Swagger docs at 'Docs at http://localhost:6001/api-docs`);
});

server.on('error', (err) => {
  console.error(err);
});
