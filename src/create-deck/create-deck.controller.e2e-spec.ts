import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../app.module';
import {
  CreateDeckRequestDto,
  CreateDeckResponseDto,
  DeckTypeDto,
} from './create-deck.controller';
import { BuildTestApp } from '../utils/testing/build-test-app.e2e';

describe('CreateDeckController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await BuildTestApp({
      imports: [AppModule],
    });
  });

  describe('/v1/decks [POST]', () => {
    const endpoint = `/v1/decks`;
    const createDeck = (data: object) =>
      request(app.getHttpServer()).post(endpoint).send(data);

    xit(`Deck with incorrect data cannot be created`, async () => {
      await createDeck({ x: 1, y: 2 }).expect(400);
    });

    xit(`Deck with 'Invalid' type cannot be created`, async () => {
      await createDeck({ type: 'Invalid' }).expect(400);
    });

    const successfulTestCases: Array<{
      request: CreateDeckRequestDto;
      expectedResponse: Partial<CreateDeckResponseDto>;
    }> = [
      {
        request: { type: DeckTypeDto.Full },
        expectedResponse: { remaining: 52 },
      },
      {
        request: { type: DeckTypeDto.Full, shuffled: true },
        expectedResponse: { remaining: 52 },
      },
      {
        request: { type: DeckTypeDto.Short },
        expectedResponse: { remaining: 36 },
      },
      {
        request: { type: DeckTypeDto.Short, shuffled: true },
        expectedResponse: { remaining: 36 },
      },
    ];

    for (const testCase of successfulTestCases) {
      it(`Deck for ${JSON.stringify(
        testCase.request,
      )} has successfully created`, async () => {
        const httpResponse = await createDeck(testCase.request).expect(201);
        const response: CreateDeckResponseDto = httpResponse.body;

        expect(response.deckId).toBeDefined();
        expect(response.type).toBe(testCase.request.type);
        expect(response.shuffled).toBe(testCase.request.shuffled ?? false);
        expect(response).toMatchObject(testCase.expectedResponse);
      });
    }
  });
});
